import { ChatRequest } from "@/lib/chat/types";

export async function* streamFromOpenAI(req: ChatRequest): AsyncGenerator<string, void, void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    yield "[OpenAI unavailable: missing OPENAI_API_KEY. Falling back to mock.]";
    return;
  }
  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: req.model || "gpt-4o-mini",
    messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: req.temperature ?? 0.7,
    top_p: req.top_p ?? 1,
    max_tokens: req.max_tokens ?? undefined,
    frequency_penalty: req.frequency_penalty ?? 0,
    presence_penalty: req.presence_penalty ?? 0,
    stream: true,
    stream_options: { include_usage: false },
    response_format: req.json_mode ? { type: "json_object" } : undefined,
    seed: req.seed,
  } as any;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    yield `[OpenAI error ${res.status}] ${text}`;
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      if (!chunk.trim()) continue;
      if (chunk.startsWith("data: ")) {
        const payload = chunk.slice(6).trim();
        if (payload === "[DONE]") {
          return;
        }
        try {
          const json = JSON.parse(payload);
          const piece = json.choices?.[0]?.delta?.content ?? "";
          if (piece) {
            yield piece as string;
          }
        } catch {
          // ignore malformed lines
        }
      }
    }
  }
}
