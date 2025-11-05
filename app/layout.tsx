import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Agentic Aferi??o Chat",
  description: "ChatGPT-like UI with multi-vendor models and aferi??o power apps",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="app-root" className="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
