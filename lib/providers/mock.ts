import { ChatRequest } from "@/lib/chat/types";

function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateMockText(prompt: string, seed = 42, maxLen = 600): string {
  const rand = seededRandom(seed);
  const words = prompt
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const pool = [
    ...words,
    "insight",
    "calibration",
    "aferi??o",
    "analysis",
    "rationale",
    "decision",
    "step",
    "example",
    "explanation",
  ];
  const out: string[] = [];
  const target = Math.min(maxLen, 50 + Math.floor(rand() * 250));
  while (out.join(" ").length < target) {
    const choice = pool[Math.floor(rand() * pool.length)] || "token";
    out.push(choice);
    if (rand() < 0.12) out.push("\n\n");
    if (rand() < 0.05) out.push("-");
  }
  return out.join(" ").replace(/\s+\n/g, "\n");
}

export async function* streamFromMock(req: ChatRequest): AsyncGenerator<string, void, void> {
  const system = req.messages.find((m) => m.role === "system")?.content || "";
  const lastUser = [...req.messages].reverse().find((m) => m.role === "user")?.content || "";
  const seed = req.seed ?? (Math.abs(hashCode(system + lastUser)) % 1000);
  const text = generateMockText(`${system}\n\n${lastUser}`, seed);

  const encoder = new TextEncoder();
  let i = 0;
  while (i < text.length) {
    const next = Math.min(text.length, i + 32 + Math.floor((req.temperature ?? 0.7) * 40));
    yield text.slice(i, next);
    i = next;
    await new Promise((r) => setTimeout(r, 12));
  }
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}
