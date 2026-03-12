import React, { useMemo, useState } from "react";
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

type Side = "left" | "right";

type WithSide = BodyPoint & {
  side: Side;
  labelY: number; // 0~100 (%)
};

const MIN_GAP = 6; // 라벨끼리 최소 간격 (%)

function resolveSide(points: BodyPoint[], side: Side): WithSide[] {
  const filtered = points
    .filter((p) => (side === "left" ? p.position.x <= 50 : p.position.x > 50))
    .map<WithSide>((p) => ({
      ...p,
      side,
      labelY: p.position.y,
    }))
    .sort((a, b) => a.position.y - b.position.y);

  if (!filtered.length) return filtered;

  // 아래로 밀기
  for (let i = 1; i < filtered.length; i++) {
    if (filtered[i].labelY - filtered[i - 1].labelY < MIN_GAP) {
      filtered[i].labelY = filtered[i - 1].labelY + MIN_GAP;
    }
  }
  // 위로 당기기
  for (let i = filtered.length - 2; i >= 0; i--) {
    if (filtered[i + 1].labelY - filtered[i].labelY < MIN_GAP) {
      filtered[i].labelY = filtered[i + 1].labelY - MIN_GAP;
    }
  }

  // 상·하단 클램프
  for (const p of filtered) {
    if (p.labelY < 5) p.labelY = 5;
    if (p.labelY > 95) p.labelY = 95;
  }

  return filtered;
}

function colorByStatus(status: BodyPoint["status"]) {
  if (status === "danger") {
    return { dot: "#f07878", text: "#c83737", halo: "rgba(240,120,120,0.35)" };
  }
  if (status === "caution") {
    return { dot: "#f0c96e", text: "#c28a20", halo: "rgba(240,201,110,0.3)" };
  }
  return { dot: "#7ecba1", text: "#3b7f5a", halo: "rgba(126,203,161,0.3)" };
}

export function HealthBodyMap({ data }: HealthBodyMapProps) {
  const { bodyPoints, bodyType, recovery } = data;
  const [activeId, setActiveId] = useState<string | null>(null);

  const leftPoints = useMemo(() => resolveSide(bodyPoints, "left"), [bodyPoints]);
  const rightPoints = useMemo(() => resolveSide(bodyPoints, "right"), [bodyPoints]);

  const active = bodyPoints.find((p) => p.id === activeId) || null;

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
        <span className="text-[9px] text-[#8a9a78]">진한 점 = 에너지 집중</span>
      </div>

      {/* 좌·우 라벨 + 중앙 실루엣 */}
      <div className="flex items-start gap-1">
        {/* 왼쪽 라벨 */}
        <div className="relative flex-1 h-[150px] sm:h-[170px]">
          {leftPoints.map((p) => {
            const col = colorByStatus(p.status);
            const isActive = activeId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveId(isActive ? null : p.id)}
                className="absolute right-0 -translate-y-1/2 flex items-center gap-1 rounded-md border px-1.5 py-0.5"
                style={{
                  top: `${p.labelY}%`,
                  backgroundColor: isActive ? "rgba(210,225,210,0.9)" : "rgba(255,255,255,0.7)",
                  borderColor: isActive ? col.dot : "rgba(180,200,180,0.7)",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shadow-sm flex-shrink-0"
                  style={{ backgroundColor: col.dot }}
                />
                <span
                  className="text-[8px] font-semibold"
                  style={{ color: isActive ? col.text : "#4b5b3a" }}
                >
                  {p.organ}
                </span>
              </button>
            );
          })}
        </div>

        {/* 중앙 실루엣 */}
        <div className="relative w-24 sm:w-28 aspect-[10/22] mx-auto">
          <Image
            src="/health-body.png"
            alt="체질 바디맵 실루엣"
            fill
            className="object-contain"
            priority={false}
          />
          {bodyPoints.map((p) => {
            const col = colorByStatus(p.status);
            const isActive = activeId === p.id;
            return (
              <button
                key={`dot-${p.id}`}
                type="button"
                onClick={() => setActiveId(isActive ? null : p.id)}
                className="absolute"
                style={{
                  left: `${p.position.x}%`,
                  top: `${p.position.y}%`,
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer",
                }}
              >
                {p.status === "danger" && (
                  <div
                    className="rounded-full"
                    style={{
                      width: 18,
                      height: 18,
                      backgroundColor: col.halo,
                    }}
                  />
                )}
                <div
                  className="rounded-full border border-white shadow-sm"
                  style={{
                    width: isActive ? 14 : 11,
                    height: isActive ? 14 : 11,
                    backgroundColor: col.dot,
                    transition: "all 0.18s ease",
                    marginTop: p.status === "danger" ? -14 : 0,
                    marginLeft: p.status === "danger" ? -14 : 0,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* 오른쪽 라벨 */}
        <div className="relative flex-1 h-[150px] sm:h-[170px]">
          {rightPoints.map((p) => {
            const col = colorByStatus(p.status);
            const isActive = activeId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveId(isActive ? null : p.id)}
                className="absolute left-0 -translate-y-1/2 flex items-center gap-1 rounded-md border px-1.5 py-0.5"
                style={{
                  top: `${p.labelY}%`,
                  backgroundColor: isActive ? "rgba(210,225,210,0.9)" : "rgba(255,255,255,0.7)",
                  borderColor: isActive ? col.dot : "rgba(180,200,180,0.7)",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shadow-sm flex-shrink-0"
                  style={{ backgroundColor: col.dot }}
                />
                <span
                  className="text-[8px] font-semibold"
                  style={{ color: isActive ? col.text : "#4b5b3a" }}
                >
                  {p.organ}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 포인트 상세 */}
      {active && (
        <div className="mt-3 rounded-xl border border-[#b8ccb0] bg-white/80 px-3 py-2 shadow-sm">
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

      {/* 간단 범례 */}
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#f07878]" />
          <span className="text-[8px] text-[#6b7b60]">주의 부위</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#f0c96e]" />
          <span className="text-[8px] text-[#6b7b60]">관리 부위</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#7ecba1]" />
          <span className="text-[8px] text-[#6b7b60]">타고난 강점</span>
        </div>
      </div>
    </div>
  );
}

