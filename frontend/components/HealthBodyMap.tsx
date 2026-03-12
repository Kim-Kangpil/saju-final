import React, { useState } from "react";
import type { HealthBodyMapData, BodyPoint } from "../data/healthConstitutionAnalysis";

interface HealthBodyMapProps {
  data: HealthBodyMapData;
}

function recoveryLabel(r: HealthBodyMapData["recovery"]): string {
  return r === "강" ? "회복력 강함" : r === "약" ? "회복력 민감" : "회복력 보통";
}

function statusLabel(s: BodyPoint["status"]): string {
  return s === "danger" ? "주의" : s === "caution" ? "관리" : "강점";
}

function colorByStatus(status: BodyPoint["status"]) {
  if (status === "danger") {
    return { dot: "#f07878", text: "#c83737", badge: "bg-[#fee2e2]" };
  }
  if (status === "caution") {
    return { dot: "#f0c96e", text: "#c28a20", badge: "bg-[#fff4df]" };
  }
  return { dot: "#7ecba1", text: "#2f7a54", badge: "bg-[#e5f6ea]" };
}

export function HealthBodyMap({ data }: HealthBodyMapProps) {
  const { bodyPoints, bodyType, recovery } = data;
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = bodyPoints.find((p) => p.id === activeId) || null;

  return (
    <div
      className="w-full"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[10px] font-bold text-[#3a5a2a] tracking-wide">
          {bodyType} · {recoveryLabel(recovery)}
        </span>
        <span className="text-[9px] text-[#8a9a78]">색상 = 에너지 상태</span>
      </div>

      {/* 이모지 바디맵 */}
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {bodyPoints.map((p) => {
          const col = colorByStatus(p.status);
          const isActive = activeId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveId(isActive ? null : p.id)}
              className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left border transition-colors ${
                isActive
                  ? "border-[#3a5a2a] bg-white/95 shadow-sm"
                  : "border-transparent bg-white/70"
              }`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-base shadow-sm"
                style={{ backgroundColor: col.dot, color: "#ffffff" }}
              >
                {/* 장기별 이모지는 healthConstitutionAnalysis에서 organ 텍스트만 있으니, 간단한 매핑만 사용 */}
                {p.organ.includes("심장") || p.organ.includes("혈") ? "❤️" : null}
                {p.organ.includes("폐") ? "🫁" : null}
                {p.organ.includes("위장") || p.organ.includes("소장") || p.organ.includes("대장") ? "🫃" : null}
                {p.organ.includes("간") || p.organ.includes("담") ? "🟤" : null}
                {p.organ.includes("신장") || p.organ.includes("방광") ? "💧" : null}
                {p.organ.includes("뇌") || p.organ.includes("신경") ? "🧠" : null}
                {p.organ.includes("눈") ? "👁️" : null}
                {p.organ.includes("코") || p.organ.includes("기관지") ? "👃" : null}
                {p.organ.includes("피부") ? "✨" : null}
                {p.organ.includes("척추") || p.organ.includes("뼈") ? "🦴" : null}
                {!(
                  p.organ.includes("심장") ||
                  p.organ.includes("혈") ||
                  p.organ.includes("폐") ||
                  p.organ.includes("위장") ||
                  p.organ.includes("소장") ||
                  p.organ.includes("대장") ||
                  p.organ.includes("간") ||
                  p.organ.includes("담") ||
                  p.organ.includes("신장") ||
                  p.organ.includes("방광") ||
                  p.organ.includes("뇌") ||
                  p.organ.includes("신경") ||
                  p.organ.includes("눈") ||
                  p.organ.includes("코") ||
                  p.organ.includes("기관지") ||
                  p.organ.includes("피부") ||
                  p.organ.includes("척추") ||
                  p.organ.includes("뼈")
                ) && "🌿"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-[2px]">
                  <span className="text-[10px] font-bold text-[#2f4a21] truncate">{p.organ}</span>
                  <span
                    className={`text-[8px] px-1 py-[1px] rounded-full ${col.badge}`}
                    style={{ color: col.text }}
                  >
                    {statusLabel(p.status)}
                  </span>
                </div>
                <p className="text-[8px] leading-snug text-[#5f6f54] line-clamp-2">{p.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택된 포인트 상세 */}
      {active && (
        <div className="mt-3 rounded-xl border border-[#b8ccb0] bg-white/95 px-3 py-2 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] font-bold text-[#2f4a21]">
              {active.organ}{" "}
              <span className="text-[9px] text-[#7a8b6a]">({statusLabel(active.status)})</span>
            </div>
            <span className="text-[9px] text-[#7a8b6a]">{active.reason}</span>
          </div>
          <p className="text-[9px] leading-snug text-[#5f6f54]">{active.desc}</p>
        </div>
      )}
    </div>
  );
}


