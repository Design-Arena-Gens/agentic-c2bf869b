"use client";

import { useEffect, useState } from "react";

export function SettingsDrawer({ onClose }: { onClose: () => void }) {
  const [system, setSystem] = useState<string>(() => localStorage.getItem("system") || "You are a helpful AI assistant.");

  useEffect(() => {
    localStorage.setItem("system", system);
  }, [system]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div className="card" style={{ width: 420, height: "100%" }} onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <strong>Settings</strong>
          <button className="badge" onClick={onClose}>Close</button>
        </div>
        <hr />
        <div className="col">
          <label className="label">System Prompt</label>
          <textarea style={{ minHeight: 180 }} value={system} onChange={(e) => setSystem(e.target.value)} />
          <div className="small">Saved to local storage.</div>
        </div>
      </div>
    </div>
  );
}
