import React from "react";
import type { HealthBodyMapData, BodyPoint } from "../data/healthConstitutionAnalysis";

interface HealthBodyMapProps {
  data: HealthBodyMapData;
}

export function HealthBodyMap({ data }: HealthBodyMapProps) {
  const { bodyPoints, bodyType, recovery } = data;

  const recoveryLabel =
    recovery === "강" ? "회복력 강함" : recovery === "약" ? "회복력 민감" : "회복력 보통";

  return (
    <div className="w-full rounded-2xl bg-[#f0f5f0] border border-[#cbd5c0] p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] text-[#556b2f] font-semibold">
          {bodyType} · {recoveryLabel}
        </div>
        <div className="text-[9px] text-[#6b7280]">
          색이 진할수록 지금 에너지가 많이 몰린 부위예요.
        </div>
      </div>

      <div className="relative w-full pt-[130%] rounded-2xl bg-gradient-to-b from-[#f9fafb] via-[#eef4ee] to-[#e5ece5] overflow-hidden">
        {/* 머리 */}
        <div className="absolute left-1/2 top-[14%] w-[18%] aspect-[1/1] -translate-x-1/2 rounded-full bg-white/90 border border-[#d1d5db]" />
        {/* 목 */}
        <div className="absolute left-1/2 top-[25%] w-[8%] h-[6%] -translate-x-1/2 bg-white/90" />
        {/* 어깨 + 상체 */}
        <div className="absolute inset-x-[30%] top-[26%] bottom-[26%] bg-white/85 rounded-[999px] border border-[#d1d5db]" />
        {/* 골반/다리 */}
        <div className="absolute inset-x-[38%] top-[50%] bottom-[10%] bg-white/95 rounded-[999px] border border-[#d1d5db]" />
        {/* 팔 실루엣 (양쪽) */}
        <div className="absolute left-[28%] top-[32%] bottom-[30%] w-[10%] bg-white/70 rounded-[999px]" />
        <div className="absolute right-[28%] top-[32%] bottom-[30%] w-[10%] bg-white/70 rounded-[999px]" />

        {bodyPoints.map((p: BodyPoint) => (
          <div
            key={p.id}
            className="absolute flex items-center justify-center"
            style={{
              left: `${p.position.x}%`,
              top: `${p.position.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="w-4 h-4 rounded-full shadow-sm ring-1 ring-white"
              style={{
                backgroundColor: p.color,
                opacity: p.status === "danger" ? 1 : p.status === "caution" ? 0.9 : 0.8,
              }}
              title={`${p.organ} · ${p.desc}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1">
        {bodyPoints.map((p) => (
          <div key={`legend-${p.id}`} className="flex items-start gap-1">
            <span
              className="mt-[3px] inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <div className="text-[9px] leading-snug text-[#374151]">
              <span className="font-semibold text-[#556b2f]">{p.organ}</span>
              <span className="ml-1 text-[8px] text-[#6b7280]">
                ({p.status === "danger" ? "주의" : p.status === "caution" ? "관리" : "강점"})
              </span>
              <div className="text-[8px] text-[#6b7280]">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

