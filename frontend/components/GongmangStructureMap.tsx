"use client";

import {
  GongmangVisualSlot,
  GongmangState,
} from "../data/gongmangAnalysis";

type GongmangStructureMapProps = {
  slots: GongmangVisualSlot[];
};

const POS_LABEL: Record<string, string> = {
  년: "년주",
  월: "월주",
  일: "일주",
  시: "시주",
};

function stateLabel(state: GongmangState): string {
  if (state === "full") return "공망 성립";
  if (state === "released") return "해공";
  return "공망 없음";
}

export function GongmangStructureMap({ slots }: GongmangStructureMapProps) {
  const ordered = ["년", "월", "일", "시"].map(
    (p) => slots.find((s) => s.pos === p) ?? { pos: p as any, state: "none" as GongmangState, group: null }
  );

  return (
    <div className="mt-2 space-y-3">
      <p className="text-[11px] font-medium text-[var(--text-primary)]">
        공망은 인생에서 힘을 덜 써도 되는 영역을 보여줍니다.
      </p>

      {/* 공망 구조 지도 */}
      <div className="flex justify-between gap-2 text-[11px] text-[#475569]">
        {ordered.map((slot) => {
          const label = POS_LABEL[slot.pos] ?? slot.pos;
          let circleClass =
            "h-7 w-7 rounded-full border border-dashed flex items-center justify-center";
          let dot = false;

          if (slot.state === "none") {
            circleClass += " border-slate-200 bg-transparent opacity-60";
          } else if (slot.state === "full") {
            circleClass += " border-slate-400 bg-white shadow-[0_0_0_1px_rgba(148,163,184,0.3)]";
            dot = true;
          } else {
            // released
            circleClass += " border-slate-300 bg-slate-50";
          }

          return (
            <div
              key={slot.pos}
              className="flex flex-col items-center gap-1 min-w-[56px]"
            >
              <span className="text-[10px] text-[#64748b]">{label}</span>
              <div className={circleClass}>
                {dot && <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
              </div>
              <span className="text-[9px] text-[#94a3b8]">
                {stateLabel(slot.state)}
              </span>
            </div>
          );
        })}
      </div>

      {/* 궁 + 육친 태그 요약 */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
        {ordered.map((slot) => (
          <div
            key={slot.pos + "-card"}
            className="rounded-xl border border-[#e2e8f0] bg-white/70 px-2 py-1.5 flex items-center gap-1.5"
          >
            <span className="text-[#64748b]">{POS_LABEL[slot.pos] ?? slot.pos}</span>
            {slot.group && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] text-[9px]">
                {slot.group}
              </span>
            )}
            <span className="ml-auto text-[9px] text-[#94a3b8]">
              {stateLabel(slot.state)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

