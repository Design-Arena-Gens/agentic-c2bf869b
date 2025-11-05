"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/chat/types";

const DEFAULT_SYSTEM = "You are a helpful AI assistant.";

const defaultModels: Record<string, string[]> = {
  mock: ["mock-default", "mock-creative", "mock-precise"],
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
  anthropic: ["claude-3-5-sonnet", "claude-3-opus"],
  google: ["gemini-1.5-pro", "gemini-1.5-flash"],
  mistral: ["mistral-large", "mistral-small"],
  openrouter: ["openrouter/auto"]
};

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: DEFAULT_SYSTEM },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<string>(() => localStorage.getItem("provider") || "mock");
  const [model, setModel] = useState<string>(() => localStorage.getItem("model") || "mock-creative");

  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number | undefined>(undefined);
  const [jsonMode, setJsonMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("provider", provider);
  }, [provider]);
  useEffect(() => {
    localStorage.setItem("model", model);
  }, [model]);

  const send = async () => {
    const content = input.trim();
    if (!content || isLoading) return;
    setInput("");

    const nextMessages = [...messages.filter(m => m.role !== "system" || m.content), { role: "user", content }];
    setMessages(nextMessages);
    setIsLoading(true);

    const controller = new AbortController();
    const sys = messages.find(m => m.role === "system")?.content || DEFAULT_SYSTEM;
    const sysMsg = jsonMode ? `${sys}\n\nWhen appropriate, respond with ONLY valid JSON.` : sys;

    const resp = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        provider,
        model,
        temperature,
        max_tokens: maxTokens,
        json_mode: jsonMode,
        messages: [{ role: "system", content: sysMsg }, ...nextMessages.filter(m => m.role !== "system")],
      }),
      signal: controller.signal,
    });

    if (!resp.ok || !resp.body) {
      const errText = await resp.text().catch(() => "");
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errText}` }]);
      setIsLoading(false);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();

    let assistantText = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      assistantText += chunk;
      setMessages((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((m) => m.role === "assistant" && m.content === "");
        const i = idx === -1 ? copy.length - 1 : idx;
        copy[i] = { role: "assistant", content: assistantText };
        return copy;
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="chat">
      <div className="messages">
        {messages.filter(m => m.role !== "system").map((m, i) => (
          <div key={i} className={`message ${m.role}`}>{m.content}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input">
        <div className="col" style={{ flex: 1 }}>
          <div className="row" style={{ gap: 8 }}>
            <select className="select" value={provider} onChange={(e) => setProvider(e.target.value)}>
              {Object.keys(defaultModels).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select className="select" value={model} onChange={(e) => setModel(e.target.value)}>
              {(defaultModels[provider] || ["auto"]).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <label className="row" style={{ gap: 6 }}>
              <input type="checkbox" checked={jsonMode} onChange={(e) => setJsonMode(e.target.checked)} />
              <span className="small">JSON mode</span>
            </label>
            <label className="row" style={{ gap: 6 }}>
              <span className="small">Temp</span>
              <input style={{ width: 64 }} type="number" step={0.1} min={0} max={2} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} />
            </label>
            <label className="row" style={{ gap: 6 }}>
              <span className="small">Max</span>
              <input style={{ width: 80 }} type="number" min={1} value={maxTokens ?? 0} onChange={(e) => setMaxTokens(e.target.value ? parseInt(e.target.value) : undefined)} />
            </label>
          </div>
          <textarea placeholder="Send a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }} />
        </div>
        <button onClick={send} disabled={isLoading || !input.trim()}>
          {isLoading ? "Generating..." : "Send"}
        </button>
      </div>
    </div>
  );
}
