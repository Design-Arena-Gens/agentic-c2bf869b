"use client";

import { useState } from "react";

export function CalibrationCompare() {
  const [prompt, setPrompt] = useState<string>("");
  const [leftProvider, setLeftProvider] = useState<string>(() => localStorage.getItem("provider") || "mock");
  const [leftModel, setLeftModel] = useState<string>(() => localStorage.getItem("model") || "mock-creative");
  const [rightProvider, setRightProvider] = useState<string>("openai");
  const [rightModel, setRightModel] = useState<string>("gpt-4o-mini");

  const [leftOut, setLeftOut] = useState<string>("");
  const [rightOut, setRightOut] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function runSide(provider: string, model: string, setter: (s: string) => void) {
    setter("");
    const resp = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ provider, model, messages: [ { role: "system", content: "Answer concisely." }, { role: "user", content: prompt } ] }),
    });
    if (!resp.ok || !resp.body) {
      setter(await resp.text().catch(() => "Error"));
      return;
    }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
      setter(text);
    }
  }

  async function runBoth() {
    setLoading(true);
    await Promise.all([
      runSide(leftProvider, leftModel, setLeftOut),
      runSide(rightProvider, rightModel, setRightOut)
    ]);
    setLoading(false);
  }

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 8 }}>
        <input style={{ flex: 1 }} type="text" placeholder="Prompt to compare..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button className="button-secondary" onClick={runBoth} disabled={loading || !prompt.trim()}>Compare</button>
      </div>
      <div className="cards">
        <div className="card span-6">
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <select value={leftProvider} onChange={(e) => setLeftProvider(e.target.value)}>
              {['mock','openai','anthropic','google','mistral','openrouter'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" value={leftModel} onChange={(e) => setLeftModel(e.target.value)} />
          </div>
          <pre style={{ minHeight: 200, whiteSpace: "pre-wrap" }}>{leftOut || (loading ? "Generating..." : "")}</pre>
        </div>
        <div className="card span-6">
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <select value={rightProvider} onChange={(e) => setRightProvider(e.target.value)}>
              {['mock','openai','anthropic','google','mistral','openrouter'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" value={rightModel} onChange={(e) => setRightModel(e.target.value)} />
          </div>
          <pre style={{ minHeight: 200, whiteSpace: "pre-wrap" }}>{rightOut || (loading ? "Generating..." : "")}</pre>
        </div>
      </div>
    </div>
  );
}
