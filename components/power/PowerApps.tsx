"use client";

import { useState } from "react";
import { RubricScorer } from "@/components/power/RubricScorer";
import { CalibrationCompare } from "@/components/power/CalibrationCompare";
import { BatchAfericao } from "@/components/power/BatchAfericao";

export function PowerApps() {
  const [tab, setTab] = useState<"rubric" | "compare" | "batch">("rubric");

  return (
    <div className="card" style={{ margin: 12 }}>
      <div className="row" style={{ gap: 8, marginBottom: 12 }}>
        <button className="button-secondary" onClick={() => setTab("rubric")}>Rubric Scorer</button>
        <button className="button-secondary" onClick={() => setTab("compare")}>Calibration Compare</button>
        <button className="button-secondary" onClick={() => setTab("batch")}>Batch Aferi??o</button>
      </div>
      {tab === "rubric" && <RubricScorer />}
      {tab === "compare" && <CalibrationCompare />}
      {tab === "batch" && <BatchAfericao />}
    </div>
  );
}
