import React, { useState } from "react";
import Image from "next/image";
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

      {/* 이미지 기반 바디맵 */}
      <div className="relative w-40 mx-auto aspect-[10/22]">
        <Image
          src="/health-body.png"
          alt="체질 바디맵 실루엣"
          fill
          className="object-contain"
          priority={false}
        />

        {bodyPoints.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.position.x}%`,
              top: `${p.position.y}%`,
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
            }}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {p.status === "danger" && (
              <div
                className="rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  backgroundColor: p.color,
                  opacity: 0.25,
                  boxShadow: `0 0 0 4px ${p.color}40`,
                }}
              />
            )}
            <div
              className="rounded-full border border-white shadow-sm"
              style={{
                width: hovered === p.id ? 14 : 11,
                height: hovered === p.id ? 14 : 11,
                backgroundColor: p.color,
                transition: "all 0.18s ease",
                marginTop: p.status === "danger" ? -16 : 0,
                marginLeft: p.status === "danger" ? -16 : 0,
              }}
            />

            {hovered === p.id && (
              <div
                className="absolute z-10 px-2 py-[3px] rounded-md bg-[#1a2e1a]/90 text-white text-[8px] leading-snug"
                style={{
                  whiteSpace: "nowrap",
                  left: p.position.x > 60 ? "-100%" : "0%",
                  top: -18,
                }}
              >
                <span className="font-semibold mr-1">{p.organ}</span>
                <span className="text-[7px] text-[#bbddbb]">{statusLabel(p.status)}</span>
              </div>
            )}
          </div>
        ))}
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

