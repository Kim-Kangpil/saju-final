"use client";

import { useMemo } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

function getPoint(ruleSummary: Record<string, any>) {
  const points: string[] = ruleSummary.career_points ?? [];
  const all = points.join(" ");

  let x = 50; // 혼자(0) ~ 협업(100)
  let y = 50; // 안정(0) ~ 도전(100)

  if (/협업|소통|팀|관계|네트워/.test(all)) x += 25;
  if (/독립|혼자|자율|개인/.test(all)) x -= 25;
  if (/도전|변화|개척|창업|확장/.test(all)) y += 25;
  if (/안정|지속|관리|리스크/.test(all)) y -= 25;

  x = Math.max(10, Math.min(90, x));
  y = Math.max(10, Math.min(90, y));
  return { x, y };
}

export function CareerMatrixCard({ ruleSummary }: Props) {
  const { x, y } = useMemo(() => getPoint(ruleSummary), [ruleSummary]);
  const left = `${x}%`;
  const top = `${100 - y}%`;
  const isRight = x >= 50;
  const isTop = y >= 50;

  return (
    <div style={{ width: "100%", background: "#F5F1EA", borderRadius: 16, border: "1px solid #D4C9B8", padding: 12, maxHeight: 200 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#3D3530", marginBottom: 10 }}>일 스타일 매트릭스</p>
      <div style={{ position: "relative", height: 130, background: "#fff", borderRadius: 12, border: "1px solid #D4C9B8", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: isTop && isRight ? "rgba(139,115,85,0.08)" : "transparent" }} />
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#D4C9B8" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "#D4C9B8" }} />
        <div style={{ position: "absolute", left: 8, bottom: 4, fontSize: 10, color: "#3D3530" }}>혼자</div>
        <div style={{ position: "absolute", right: 8, bottom: 4, fontSize: 10, color: "#3D3530" }}>협업</div>
        <div style={{ position: "absolute", left: 8, top: 4, fontSize: 10, color: "#3D3530" }}>도전</div>
        <div style={{ position: "absolute", right: 8, top: 4, fontSize: 10, color: "#3D3530" }}>안정</div>
        <div style={{ position: "absolute", left, top, transform: "translate(-50%, -50%)", width: 16, height: 16, borderRadius: "50%", background: "#8B7355", border: "2px solid #fff" }} />
      </div>
    </div>
  );
}
