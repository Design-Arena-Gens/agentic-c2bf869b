"use client";

import { useEffect, useState } from "react";

export function RubricScorer() {
  const [provider, setProvider] = useState<string>(() => localStorage.getItem("provider") || "mock");
  const [model, setModel] = useState<string>(() => localStorage.getItem("model") || "mock-creative");
  const [rubric, setRubric] = useState<string>("Rate 1-5 with rationale focusing on accuracy and clarity.");
  const [candidate, setCandidate] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult("");

    const system = `You are an evaluator performing aferi??o. Read the candidate output and evaluate it against the rubric. Respond as JSON with keys: score (1-5), rationale (string).`;
    const user = `Rubric:\n${rubric}\n\nCandidate:\n${candidate}`;

    const resp = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ provider, model, json_mode: true, temperature: 0.2, messages: [ { role: "system", content: system }, { role: "user", content: user } ] }),
    });
    if (!resp.ok || !resp.body) {
      setResult(await resp.text().catch(() => "Error"));
      setLoading(false);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
      setResult(text);
    }

    setLoading(false);
  }

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 8 }}>
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          {['mock','openai','anthropic','google','mistral','openrouter'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="model" />
        <button className="button-secondary" onClick={run} disabled={loading || !candidate.trim()}>Run</button>
      </div>
      <div className="cards">
        <div className="card span-6">
          <div className="label">Rubric</div>
          <textarea style={{ minHeight: 160 }} value={rubric} onChange={(e) => setRubric(e.target.value)} />
        </div>
        <div className="card span-6">
          <div className="label">Candidate Output</div>
          <textarea style={{ minHeight: 160 }} value={candidate} onChange={(e) => setCandidate(e.target.value)} />
        </div>
        <div className="card span-12">
          <div className="label">Result</div>
          <pre style={{ whiteSpace: "pre-wrap" }}>{result || (loading ? "Scoring..." : "")}</pre>
        </div>
      </div>
    </div>
  );
}
