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

export function HealthBodyMap({ data }: HealthBodyMapProps) {
  const { bodyPoints, bodyType, recovery } = data;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="w-full max-w-xs mx-auto rounded-2xl bg-gradient-to-b from-[#f2f7f2] to-[#e4ede4] border border-[#c2d4b8] p-3 shadow-md"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-[#3a5a2a] tracking-wide">
          {bodyType} · {recoveryLabel(recovery)}
        </span>
        <span className="text-[9px] text-[#8a9a78]">진한 색 = 에너지 집중</span>
      </div>

      {/* SVG 바디맵 */}
      <div className="relative w-40 mx-auto">
        <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-sm">
          <defs>
            <linearGradient id="hb-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ddeedd" />
              <stop offset="100%" stopColor="#c5d9c0" />
            </linearGradient>
          </defs>

          {/* 사용자 제공 실루엣 이미지 (public/health-body.png 기준) */}
          <image
            href="/health-body.png"
            x="0"
            y="0"
            width="100"
            height="220"
            preserveAspectRatio="xMidYMid meet"
            opacity="0.98"
          />

          {/* 포인트 마커 */}
          {bodyPoints.map((p) => (
            <g
              key={p.id}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* danger 맥동 링 */}
              {p.status === "danger" && (
                <circle cx={p.position.x} cy={p.position.y} r="9" fill={p.color} opacity="0.25">
                  <animate attributeName="r" values="7;12;7" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}

              {/* 마커 원 */}
              <circle
                cx={p.position.x}
                cy={p.position.y}
                r={hovered === p.id ? 7 : 5.5}
                fill={p.color}
                stroke="white"
                strokeWidth="1.5"
                style={{ transition: "r 0.2s" }}
              />

              {/* 호버 툴팁 */}
              {hovered === p.id && (
                <g>
                  <rect
                    x={p.position.x > 60 ? p.position.x - 38 : p.position.x + 9}
                    y={p.position.y - 12}
                    width="38"
                    height="18"
                    rx="4"
                    fill="#1a2e1a"
                    opacity="0.88"
                  />
                  <text
                    x={p.position.x > 60 ? p.position.x - 19 : p.position.x + 28}
                    y={p.position.y - 2}
                    textAnchor="middle"
                    fontSize="5.5"
                    fill="white"
                    fontWeight="bold"
                  >
                    {p.organ}
                  </text>
                  <text
                    x={p.position.x > 60 ? p.position.x - 19 : p.position.x + 28}
                    y={p.position.y + 5}
                    textAnchor="middle"
                    fontSize="4.5"
                    fill="#bbddbb"
                  >
                    {statusLabel(p.status)}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* 범례 */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        {bodyPoints.map((p) => (
          <div
            key={`leg-${p.id}`}
            className="flex items-start gap-1.5 cursor-pointer"
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className="mt-[3px] flex-shrink-0 w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm"
              style={{ backgroundColor: p.color }}
            />
            <div className="text-[9px] leading-snug">
              <span className="font-bold text-[#3a5a2a]">{p.organ}</span>
              <span className="ml-1 text-[8px] text-[#8a9a78]">({statusLabel(p.status)})</span>
              <p className="text-[8px] text-[#6b7b60] mt-[1px]">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

