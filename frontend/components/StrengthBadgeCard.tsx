"use client";

import { useMemo, useState } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

interface BadgeItem {
  emoji: string;
  keyword: string;
  desc: string;
}

const CANDIDATES: BadgeItem[] = [
  { emoji: "🧠", keyword: "분석형", desc: "상황을 빠르게 정리하고 핵심을 찾는 힘" },
  { emoji: "📚", keyword: "누적형", desc: "한 번 시작하면 꾸준히 쌓아 결과를 만드는 힘" },
  { emoji: "🤝", keyword: "연결형", desc: "사람과 자원을 이어 기회를 만드는 힘" },
  { emoji: "🚀", keyword: "추진형", desc: "결정 이후 실행 속도가 빠른 편" },
  { emoji: "🛡️", keyword: "안정형", desc: "리스크를 줄이며 안전하게 성과를 내는 힘" },
  { emoji: "🎯", keyword: "집중형", desc: "중요한 목표에 에너지를 모으는 힘" },
];

function buildBadges(ruleSummary: Record<string, any>): BadgeItem[] {
  const points: string[] = ruleSummary.career_points ?? [];
  const all = points.join(" ");
  const out: BadgeItem[] = [];

  if (/분석|정리|기획|전략/.test(all)) out.push(CANDIDATES[0]);
  if (/꾸준|누적|축적|지속/.test(all)) out.push(CANDIDATES[1]);
  if (/관계|네트워|협업|소통|연결/.test(all)) out.push(CANDIDATES[2]);
  if (/실행|추진|도전|결단/.test(all)) out.push(CANDIDATES[3]);
  if (/안정|리스크|신중|관리/.test(all)) out.push(CANDIDATES[4]);
  if (/집중|전문|몰입/.test(all)) out.push(CANDIDATES[5]);

  if (out.length < 3) {
    for (const item of CANDIDATES) {
      if (!out.some((x) => x.keyword === item.keyword)) out.push(item);
      if (out.length >= 3) break;
    }
  }
  return out.slice(0, 4);
}

export function StrengthBadgeCard({ ruleSummary }: Props) {
  const badges = useMemo(() => buildBadges(ruleSummary), [ruleSummary]);
  const [active, setActive] = useState<number | null>(null);

  return (
    <div
      style={{
        width: "100%",
        background: "#F5F1EA",
        borderRadius: 16,
        border: "1px solid #D4C9B8",
        padding: "12px",
        maxHeight: 200,
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 700, color: "#3D3530", marginBottom: 10 }}>강점 배지</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {badges.map((b, i) => (
          <button
            key={b.keyword}
            type="button"
            onClick={() => setActive(active === i ? null : i)}
            style={{
              border: "1px solid #D4C9B8",
              borderRadius: 12,
              background: active === i ? "#EDE7DB" : "#fff",
              padding: "10px 8px",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: "#8B7355", marginBottom: 4 }}>
              {b.emoji} {b.keyword}
            </p>
            <p style={{ fontSize: 11, color: "#3D3530", lineHeight: 1.5 }}>{b.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
