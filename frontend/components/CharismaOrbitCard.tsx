"use client";

import { useState, useEffect } from "react";
import type { CharismaVisualData } from "../data/charismaSocialInfluence";

const AXIS_SHORT_DESC: Record<string, string> = {
  presence: "사람들이 자연스럽게 주목하게 되는 힘",
  expression: "생각과 감정을 전달하고 퍼뜨리는 힘",
  insight: "상황의 핵심을 읽고 납득시키는 힘",
};

export function CharismaOrbitCard({ data }: { data: CharismaVisualData }) {
  const [animate, setAnimate] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(t);
  }, []);

  const W = 260;
  const H = 260;
  const V_INSIGHT = { x: W / 2, y: 40 };
  const V_PRESENCE = { x: 44, y: H - 48 };
  const V_EXPRESSION = { x: W - 44, y: H - 48 };

  const p = data.scores?.presence ?? 0;
  const e = data.scores?.expression ?? 0;
  const i = data.scores?.insight ?? 0;
  const sum = p + e + i;
  const wp = sum > 0 ? p / sum : 1 / 3;
  const we = sum > 0 ? e / sum : 1 / 3;
  const wi = sum > 0 ? i / sum : 1 / 3;

  const dot = {
    x: V_PRESENCE.x * wp + V_EXPRESSION.x * we + V_INSIGHT.x * wi,
    y: V_PRESENCE.y * wp + V_EXPRESSION.y * we + V_INSIGHT.y * wi,
  };

  return (
    <div
      className="rounded-2xl overflow-hidden mx-auto w-full max-w-[360px]"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      {/* 1. 제목 + 한 줄 설명 */}
      <div className="text-center mb-4">
        <h3 className="text-[15px] font-bold text-[#3d3a4a] tracking-tight mb-1">
          나의 영향력 지도
        </h3>
        <p className="text-[11px] text-[#6B6A8A] leading-relaxed px-1">
          존재감, 표현력, 통찰력이 어떤 비율로 작동하는지 보여주는 지도예요.
        </p>
      </div>

      {/* 2. 유형 카드 */}
      <div
        className="rounded-xl border-2 border-[#adc4af] bg-[#f8faf8] p-4 mb-4"
        style={{ borderColor: "rgba(167,139,212,0.4)" }}
      >
        <div className="text-[13px] font-bold text-[#3d3a4a] mb-1.5">
          {data.type}
        </div>
        <p className="text-[11px] text-[#5c5c7a] leading-relaxed">
          {data.typeDesc}
        </p>
      </div>

      {/* 3. 삼각형 */}
      <div
        className="relative mx-auto mb-4"
        style={{
          width: `${W}px`,
          height: `${H}px`,
          maxWidth: "100%",
          background: "#f5f7f4",
          borderRadius: "20px",
          border: "1px solid rgba(107,138,122,0.35)",
        }}
      >
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <radialGradient id="dotGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#556b2f" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#556b2f" stopOpacity="0" />
            </radialGradient>
          </defs>

          <polygon
            points={`${V_PRESENCE.x},${V_PRESENCE.y} ${V_EXPRESSION.x},${V_EXPRESSION.y} ${V_INSIGHT.x},${V_INSIGHT.y}`}
            fill="rgba(167,139,212,0.05)"
            stroke="rgba(107,138,122,0.4)"
            strokeWidth="1.2"
          />

          <text x={V_INSIGHT.x} y={V_INSIGHT.y - 12} textAnchor="middle" fontSize="10" fill="#6B6A8A">
            통찰력
          </text>
          <text x={V_PRESENCE.x - 8} y={V_PRESENCE.y + 14} textAnchor="start" fontSize="10" fill="#6B6A8A">
            존재감
          </text>
          <text x={V_EXPRESSION.x + 8} y={V_EXPRESSION.y + 14} textAnchor="end" fontSize="10" fill="#6B6A8A">
            표현력
          </text>

          <circle
            cx={dot.x}
            cy={dot.y}
            r={14}
            fill="url(#dotGlow)"
            opacity={animate ? 0.7 : 0}
          />
          <circle
            cx={dot.x}
            cy={dot.y}
            r={5}
            fill="#ffffff"
            stroke="#556b2f"
            strokeWidth="1.5"
            opacity={animate ? 1 : 0}
          />
        </svg>
      </div>

      {/* 4. 3축 바 */}
      <div className="space-y-2 mb-4">
        {data.axes.map((ax) => (
          <div key={ax.key} className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#3d3a4a] w-16 shrink-0">
              {ax.label}
            </span>
            <div className="flex-1 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${ax.value}%`,
                  backgroundColor: ax.color,
                }}
              />
            </div>
            <span className="text-[11px] font-bold shrink-0" style={{ color: ax.color, minWidth: 28 }}>
              {ax.value}
            </span>
          </div>
        ))}
      </div>

      {/* 5. 한 줄 해석 */}
      {data.oneLiner && (
        <p className="text-[11px] text-[#5c5c7a] leading-relaxed text-center mb-4 px-1">
          {data.oneLiner}
        </p>
      )}

      {/* 6. 축 설명 카드 3개 */}
      <div className="grid grid-cols-1 gap-2 mb-3">
        {data.axes.map((ax, i) => (
          <div
            key={ax.key}
            onClick={() => setSelected(selected === i ? null : i)}
            className="rounded-xl border p-3 cursor-pointer transition-colors"
            style={{
              borderColor: `${ax.color}44`,
              backgroundColor: selected === i ? `${ax.color}12` : "#f8faf8",
            }}
          >
            <div className="text-[11px] font-bold mb-0.5" style={{ color: ax.color }}>
              {ax.label}
            </div>
            <p className="text-[10px] text-[#6B6A8A] leading-snug">
              {AXIS_SHORT_DESC[ax.key] ?? ax.desc.slice(0, 40)}
            </p>
            {selected === i && (
              <p className="text-[10px] text-[#5c5c7a] mt-2 leading-relaxed">
                {ax.desc}
              </p>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
