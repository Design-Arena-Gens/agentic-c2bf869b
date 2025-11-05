"use client";

import { useMemo, useRef, useState } from "react";

type Item = { id: string; prompt: string; rubric: string };

type Result = { id: string; score?: number; rationale?: string; raw?: string; error?: string };

export function BatchAfericao() {
  const [provider, setProvider] = useState<string>(() => localStorage.getItem("provider") || "mock");
  const [model, setModel] = useState<string>(() => localStorage.getItem("model") || "mock-creative");
  const [items, setItems] = useState<Item[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((t) => {
      const lines = t.split(/\r?\n/).filter(Boolean);
      const parsed: Item[] = [];
      for (const line of lines) {
        try {
          const j = JSON.parse(line);
          if (j.prompt && j.rubric) parsed.push({ id: j.id || crypto.randomUUID(), prompt: j.prompt, rubric: j.rubric });
        } catch {}
      }
      setItems(parsed);
      setResults([]);
    });
  }

  async function run() {
    setRunning(true);
    const out: Result[] = [];
    for (const it of items) {
      const system = `You are an evaluator performing aferi??o. Read the candidate output and evaluate it against the rubric. Respond as JSON with keys: score (1-5), rationale (string).`;
      const user = `Rubric:\n${it.rubric}\n\nCandidate:\n${it.prompt}`;
      try {
        const resp = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ provider, model, json_mode: true, temperature: 0.2, messages: [ { role: "system", content: system }, { role: "user", content: user } ] }),
        });
        const reader = resp.body?.getReader();
        const decoder = new TextDecoder();
        let text = "";
        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            text += decoder.decode(value);
          }
        } else {
          text = await resp.text();
        }
        let score: number | undefined;
        let rationale: string | undefined;
        try {
          const j = JSON.parse(text);
          score = j.score; rationale = j.rationale;
        } catch {
          // keep raw
        }
        out.push({ id: it.id, score, rationale, raw: text });
        setResults([...out]);
      } catch (e: any) {
        out.push({ id: it.id, error: String(e?.message || e) });
        setResults([...out]);
      }
    }
    setRunning(false);
  }

  function exportCsv() {
    const rows = ["id,score,rationale"].concat(results.map(r => `${csv(r.id)},${csv(r.score ?? "")},${csv(r.rationale ?? "")}`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "afericao_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 8 }}>
        <input type="file" accept=".json,.jsonl,.txt" onChange={onFile} />
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          {['mock','openai','anthropic','google','mistral','openrouter'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="model" />
        <button className="button-secondary" onClick={run} disabled={running || !items.length}>Run</button>
        <button className="button-secondary" onClick={exportCsv} disabled={!results.length}>Export CSV</button>
      </div>
      <div className="small">Loaded items: {items.length}</div>
      <div className="card">
        <div className="label">Results</div>
        <div className="col" style={{ gap: 8, maxHeight: 320, overflow: "auto" }}>
          {results.map(r => (
            <div key={r.id} className="card">
              <div className="row" style={{ gap: 8 }}>
                <span className="badge">{r.id}</span>
                {typeof r.score !== 'undefined' && <span className="badge" style={{ background: '#2563eb', color: 'white' }}>score: {r.score}</span>}
                {r.error && <span className="badge" style={{ background: '#dc2626', color: 'white' }}>error</span>}
              </div>
              {r.rationale && <div className="small" style={{ marginTop: 6 }}>{r.rationale}</div>}
              {!r.rationale && r.raw && <pre className="small" style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{r.raw}</pre>}
            </div>
          ))}
          {!results.length && <div className="small">No results yet</div>}
        </div>
      </div>
    </div>
  );
}

function csv(v: any) {
  const s = String(v ?? "");
  return '"' + s.replaceAll('"', '""') + '"';
}
