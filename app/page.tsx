"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chat } from "@/components/Chat";
import { Sidebar } from "@/components/Sidebar";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { PowerApps } from "@/components/power/PowerApps";

export type ProviderKey = "mock" | "openai" | "anthropic" | "google" | "mistral" | "openrouter";

export default function Page() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "apps">("chat");

  return (
    <div className="app-shell">
      <Sidebar setActiveTab={setActiveTab} />
      <main className="main">
        <div className="topbar">
          <div className="row" style={{ gap: 12 }}>
            <div className="badge">Agentic</div>
            <strong>Multi?Vendor Chat + Aferi??o</strong>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="button-secondary" onClick={() => setIsSettingsOpen((s) => !s)}>
              Settings
            </button>
          </div>
        </div>
        {activeTab === "chat" ? <Chat /> : <PowerApps />}
        {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} />}
      </main>
    </div>
  );
}
