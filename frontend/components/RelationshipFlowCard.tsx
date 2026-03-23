"use client";

import { useMemo } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

const STEPS = ["가까워짐", "기대상승", "부담감", "거리두기"] as const;

function getCurrentIndex(ruleSummary: Record<string, any>): number {
  const points: string[] = ruleSummary.love_points ?? [];
  const all = points.join(" ");
  if (/거리|회피|혼자/.test(all)) return 3;
  if (/부담|압박|신중/.test(all)) return 2;
  if (/기대|의지|확신/.test(all)) return 1;
  return 0;
}

export function RelationshipFlowCard({ ruleSummary }: Props) {
  const current = useMemo(() => getCurrentIndex(ruleSummary), [ruleSummary]);

  return (
    <div style={{ width: "100%", background: "#F5F1EA", borderRadius: 16, border: "1px solid #D4C9B8", padding: 12, maxHeight: 200 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#3D3530", marginBottom: 12 }}>관계 거리 그래프</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
            <div style={{
              flex: 1,
              borderRadius: 10,
              border: "1px solid #D4C9B8",
              background: current === i ? "#EDE7DB" : "#fff",
              padding: "10px 6px",
              textAlign: "center",
            }}>
              <p style={{ fontSize: 11, fontWeight: current === i ? 700 : 600, color: current === i ? "#8B7355" : "#3D3530" }}>{s}</p>
            </div>
            {i < STEPS.length - 1 && <span style={{ color: "#8B7355", fontSize: 12 }}>→</span>}
          </div>
        ))}
      </div>
      <p style={{ marginTop: 10, fontSize: 11, color: "#8B7355" }}>현재 트리거 지점: {STEPS[current]}</p>
    </div>
  );
}
