"use client";

import { useMemo, useState } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

function buildItems(ruleSummary: Record<string, any>): string[] {
  const period: string[] = ruleSummary.period_points ?? [];
  const src = period.filter(Boolean);
  const items: string[] = [];

  for (const p of src) {
    if (items.length >= 3) break;
    if (/정리|비우|마무리/.test(p)) items.push("이번 주 안에 미뤄둔 일 1가지를 정리해보세요.");
    else if (/관계|대화|소통/.test(p)) items.push("가까운 사람과 짧게라도 솔직한 대화를 해보세요.");
    else if (/돈|지출|재정/.test(p)) items.push("이번 달 고정지출을 한 번 점검해보세요.");
    else if (/휴식|회복|건강/.test(p)) items.push("잠드는 시간을 30분만 앞당겨 회복 루틴을 만들어보세요.");
    else items.push("오늘 해야 할 일 1개만 정하고 끝까지 해보세요.");
  }

  if (items.length < 3) {
    const fallback = [
      "이번 주 핵심 목표 1개를 정해보세요.",
      "하루 10분이라도 몸과 마음을 쉬게 해보세요.",
      "불필요한 약속이나 지출 1개를 줄여보세요.",
    ];
    for (const f of fallback) {
      if (items.length >= 3) break;
      if (!items.includes(f)) items.push(f);
    }
  }
  return items.slice(0, 3);
}

export function ChecklistCard({ ruleSummary }: Props) {
  const items = useMemo(() => buildItems(ruleSummary), [ruleSummary]);
  const [checked, setChecked] = useState<boolean[]>(items.map(() => false));

  return (
    <div style={{ width: "100%", background: "#F5F1EA", borderRadius: 16, border: "1px solid #D4C9B8", padding: 12, maxHeight: 200 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#3D3530", marginBottom: 10 }}>지금 당장 해야 할 것</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <button
            key={item}
            type="button"
            onClick={() => setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              border: "1px solid #D4C9B8",
              borderRadius: 10,
              padding: "8px 10px",
              background: checked[i] ? "#EDE7DB" : "#fff",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{checked[i] ? "☑" : "☐"}</span>
            <span style={{ fontSize: 11, color: "#3D3530", lineHeight: 1.5 }}>{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
