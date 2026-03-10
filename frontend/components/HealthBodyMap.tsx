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

          {/* 머리 */}
          <ellipse cx="50" cy="18" rx="13" ry="15" fill="url(#hb-bg)" stroke="#9ab89a" strokeWidth="0.9" />

          {/* 목 */}
          <rect x="45" y="31" width="10" height="9" rx="2" fill="url(#hb-bg)" stroke="#9ab89a" strokeWidth="0.7" />

          {/* 몸통 */}
          <path
            d="M27,39 C22,42 20,50 20,58 L20,115 C20,122 27,125 35,125 L65,125 C73,125 80,122 80,115 L80,58 C80,50 78,42 73,39 Z"
            fill="url(#hb-bg)"
            stroke="#9ab89a"
            strokeWidth="0.9"
          />

          {/* 왼팔 */}
          <path
            d="M27,42 C20,46 15,58 14,72 L13,100 C12,106 15,109 19,108 C23,107 24,103 25,97 L27,72 C28,60 30,52 33,46 Z"
            fill="url(#hb-bg)"
            stroke="#9ab89a"
            strokeWidth="0.7"
          />
          {/* 왼손 */}
          <ellipse
            cx="16"
            cy="111"
            rx="4.5"
            ry="5.5"
            fill="url(#hb-bg)"
            stroke="#9ab89a"
            strokeWidth="0.6"
          />

          {/* 오른팔 */}
          <path
            d="M73,42 C80,46 85,58 86,72 L87,100 C88,106 85,109 81,108 C77,107 76,103 75,97 L73,72 C72,60 70,52 67,46 Z"
            fill="url(#hb-bg)"
            stroke="#9ab89a"
            strokeWidth="0.7"
          />
          {/* 오른손 */}
          <ellipse
            cx="84"
            cy="111"
            rx="4.5"
            ry="5.5"
            fill="url(#hb-bg)"
            stroke="#9ab89a"
            strokeWidth="0.6"
          />

          {/* 왼 다리 */}
          <path
            d="M35,124 C33,128 31,138 30,152 L28,185 C27,191 31,194 36,193 C41,192 43,187 43,181 L44,152 L48,152 L48,124 Z"
            fill="url(#hb-bg)"
            stroke="#9ab89a"
            strokeWidth="0.7"
          />
          {/* 왼 발 */}
          <ellipse
            cx="34"
            cy="196"
            rx="8"
            ry="4"
            fill="url(#hb-bg)"
            stroke="#9ab89a"
            strokeWidth="0.6"
          />

          {/* 오른 다리 */}
          <path
            d="M65,124 C67,128 69,138 70,152 L72,185 C73,191 69,194 64,193 C59,192 57,187 57,181 L56,152 L52,152 L52,124 Z"
            fill="url(#hb-bg)"
            stroke="#9ab89a"
            strokeWidth="0.7"
          />
          {/* 오른 발 */}
          <ellipse
            cx="66"
            cy="196"
            rx="8"
            ry="4"
            fill="url(#hb-bg)"
            stroke="#9ab89a"
            strokeWidth="0.6"
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

