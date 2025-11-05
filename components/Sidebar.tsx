"use client";

import { useEffect, useMemo, useState } from "react";

export function Sidebar({ setActiveTab }: { setActiveTab: (t: "chat" | "apps") => void }) {
  const [convos, setConvos] = useState<{ id: string; title: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem("convos") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("convos", JSON.stringify(convos));
  }, [convos]);

  return (
    <aside className="sidebar">
      <div className="header">Agentic</div>
      <div className="content">
        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          <button className="button-secondary" onClick={() => setActiveTab("chat")}>Chat</button>
          <button className="button-secondary" onClick={() => setActiveTab("apps")}>Power Apps</button>
        </div>
        <div className="small" style={{ opacity: 0.8, marginBottom: 6 }}>Conversations</div>
        <div className="col" style={{ gap: 6 }}>
          {convos.map((c) => (
            <div key={c.id} className="row" style={{ justifyContent: "space-between", gap: 8 }}>
              <div>{c.title}</div>
              <button className="badge" onClick={() => setConvos(convos.filter(x => x.id !== c.id))}>?</button>
            </div>
          ))}
          {!convos.length && <div className="small">No saved conversations</div>}
        </div>
      </div>
      <div className="footer">
        <div className="small">ENV availability</div>
        <div className="col small">
          <EnvFlag name="OPENAI_API_KEY" />
          <EnvFlag name="ANTHROPIC_API_KEY" />
          <EnvFlag name="GOOGLE_API_KEY" />
          <EnvFlag name="MISTRAL_API_KEY" />
          <EnvFlag name="OPENROUTER_API_KEY" />
        </div>
      </div>
    </aside>
  );
}

function EnvFlag({ name }: { name: string }) {
  const [val, setVal] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/has-env?name=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((j) => setVal(j?.value ? "set" : null))
      .catch(() => setVal(null));
  }, [name]);
  return <div className="row" style={{ gap: 8 }}>
    <span className="kbd">{name}</span>
    <span className="badge" style={{ background: val ? "#16a34a" : "#6b7280", color: "white" }}>{val ? "available" : "missing"}</span>
  </div>;
}
