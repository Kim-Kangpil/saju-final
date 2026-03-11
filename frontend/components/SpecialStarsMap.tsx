"use client";

import type { SpecialStarVisualCard } from "../data/specialStarsAnalysis";

export function SpecialStarsMap({ cards }: { cards: SpecialStarVisualCard[] }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="w-full grid grid-cols-2 gap-2">
        {cards.map((c) => {
          const active = c.state === "active";
          return (
            <div
              key={c.key}
              className={[
                "rounded-xl border px-3 py-2.5 shadow-sm",
                active
                  ? "border-[#7a9b7c] bg-[#e8f0e9]"
                  : "border-[#d4e0d5] bg-white/80",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-[11px] font-bold text-[#3d3a4a] leading-none">
                  {c.name}
                </div>
                {active && (
                  <div className="text-[10px] font-bold text-[#556b2f] bg-[#dfeadf] border border-[#adc4af] px-2 py-[1px] rounded-full leading-none">
                    {c.count >= 2 ? `${c.count}곳` : "활성"}
                  </div>
                )}
              </div>

              <div className="text-[10px] leading-snug text-[#6B6A8A]">
                {c.ability}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-[#6B6A8A] text-center leading-snug px-1 space-y-1">
        <p>활성화된 신살은 “강점이 잘 켜지는 상황”을 알려주는 카드로 보면 더 실용적이에요.</p>
        <p className="text-[9px] text-[#8a9a8a]">도화·역마·화개: 년·일지 삼합 기준 해당 지지가 사주에 있을 때 활성 (예: 申子辰→酉, 亥卯未→子)</p>
      </div>
    </div>
  );
}

