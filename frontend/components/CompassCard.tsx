"use client";

import { useState, useEffect } from "react";

export type CompassCardData = {
  title: string;
  ji: string;
  jiName: string;
  sipsung: string;
  sipsungDesc: string;
  keywords: [string, string, string, string, string];
  summary: string;
  desc: string;
};

function polarToXY(angle: number, r: number, cx: number, cy: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

const DIRECTIONS = [
  { angle: 0 },
  { angle: 72 },
  { angle: 144 },
  { angle: 216 },
  { angle: 288 },
];

export function CompassCard({ data }: { data: CompassCardData }) {
  const [needleAngle, setNeedleAngle] = useState(-40);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const wobble = [
      { angle: -40, delay: 300 },
      { angle: 30, delay: 700 },
      { angle: -15, delay: 1100 },
      { angle: 10, delay: 1500 },
      { angle: -4, delay: 1900 },
      { angle: 0, delay: 2300 },
    ];
    wobble.forEach(({ angle, delay }) => {
      const t = setTimeout(() => setNeedleAngle(angle), delay);
      return () => clearTimeout(t);
    });
    const t2 = setTimeout(() => setSettled(true), 2500);
    return () => clearTimeout(t2);
  }, []);

  const cx = 120;
  const cy = 120;
  const r = 118;
  const { title, ji, jiName, sipsung, sipsungDesc, keywords, summary, desc } = data;

  return (
    <div
      className="rounded-2xl overflow-hidden mx-auto w-full max-w-[420px]"
      style={{
        background: "linear-gradient(160deg, #f5f7f4 0%, #eef4ee 50%, #f0f4f2 100%)",
        border: "1px solid rgba(107, 138, 122, 0.35)",
        padding: "20px 16px 24px",
      }}
    >
      {/* 헤더 */}
      <div className="text-center mb-4">
        <div
          className="text-[10px] tracking-widest uppercase mb-1"
          style={{ color: "#5a7a6a" }}
        >
          🧭 삶의 나침반
        </div>
        <div
          className="text-base font-bold tracking-tight"
          style={{ color: "#3d4a3d" }}
        >
          {title}
        </div>
      </div>

      {/* 나침반 의미 안내 */}
      <div
        className="text-center mb-3"
        style={{ fontSize: "11px", color: "#5c6b5c", lineHeight: 1.5 }}
      >
        <span style={{ fontWeight: 600, color: "#3d4a3d" }}>↑ 나침반이 가리키는 방향</span>
        <span> = 당신의 핵심 가치(태어난 달)</span>
        <br />
        <span style={{ color: "#6B8A7A" }}>다섯 글자 = 이 가치를 나타내는 키워드들</span>
      </div>

      {/* 나침반 */}
      <div className="relative w-[240px] h-[240px] mx-auto mb-4">
        {/* 외곽 링 */}
        <div
          className="absolute rounded-full border"
          style={{
            inset: -12,
            borderColor: "rgba(107, 138, 122, 0.2)",
            background: "radial-gradient(circle, transparent 60%, rgba(107, 138, 122, 0.03) 100%)",
          }}
        />

        <svg width="240" height="240" viewBox="0 0 240 240" className="absolute inset-0">
          {/* 배경 원 */}
          <circle
            cx={cx}
            cy={cy}
            r={r - 2}
            fill="#f5f7f4"
            stroke="rgba(107, 138, 122, 0.45)"
            strokeWidth="1.5"
          />
          {/* 내부 링 */}
          <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke="rgba(107, 138, 122, 0.13)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={r * 0.38} fill="none" stroke="rgba(107, 138, 122, 0.13)" strokeWidth="1" />

          {/* 방위 눈금선 + 키워드 (라벨을 바깥쪽으로 배치해 바늘과 겹치지 않게) */}
          {DIRECTIONS.map((d, i) => {
            const inner = polarToXY(d.angle, r * 0.65, cx, cy);
            const outer = polarToXY(d.angle, r * 0.92, cx, cy);
            const pos = polarToXY(d.angle, r * 0.88, cx, cy);
            const isPointed = d.angle === 0;
            const label = keywords[i] ?? "";
            return (
              <g key={i}>
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="rgba(107, 138, 122, 0.33)"
                  strokeWidth="1"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isPointed ? "11" : "9.5"}
                  fontWeight={isPointed ? "700" : "500"}
                  fill={isPointed ? "#3d4a3d" : "#6B8A7A"}
                  fontFamily="Georgia, 'Nanum Myeongjo', serif"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* 나침반 바늘 (중앙 글자 제거로 짧게 유지, 중앙은 작은 원만) */}
          <g
            transform={`rotate(${needleAngle}, ${cx}, ${cy})`}
            style={{
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <polygon
              points={`${cx},${cy - r * 0.48} ${cx - 6},${cy + 2} ${cx + 6},${cy + 2}`}
              fill="#6B8A7A"
              opacity="0.95"
            />
            <polygon
              points={`${cx},${cy + r * 0.32} ${cx - 4},${cy - 2} ${cx + 4},${cy - 2}`}
              fill="#5a7a6a"
              opacity="0.9"
            />
            <circle cx={cx} cy={cy} r="6" fill="#eef4ee" stroke="#6B8A7A" strokeWidth="1.5" />
          </g>
        </svg>

        {/* 정착 후 글로우 */}
        {settled && (
          <div
            className="absolute rounded-full pointer-events-none animate-compass-pulse"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "48px",
              height: "48px",
              background: "radial-gradient(circle, rgba(168, 212, 184, 0.12) 0%, transparent 70%)",
            }}
          />
        )}
      </div>

      {/* 중앙 정보: 지지·지명·십성 (SVG 밖으로 분리해 겹침 방지) */}
      <div
        className="flex flex-col items-center gap-0.5 mb-4"
        style={{
          padding: "10px 16px",
          background: "rgba(107, 138, 122, 0.08)",
          borderRadius: "12px",
          border: "1px solid rgba(107, 138, 122, 0.25)",
        }}
      >
        <div style={{ fontSize: "10px", color: "#6B8A7A", letterSpacing: "0.5px", marginBottom: "2px" }}>
          태어난 달(월지)
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ fontSize: "20px", fontWeight: 800, color: "#3d4a3d", fontFamily: "Georgia, 'Nanum Myeongjo', serif" }}>{ji}</span>
          <span style={{ fontSize: "12px", color: "#5c6b5c", fontFamily: "Georgia, serif" }}>{jiName}</span>
          <span style={{ fontSize: "11px", color: "#5a7a6a", fontWeight: 600 }}>· {sipsung}</span>
        </div>
      </div>

      {/* 십성 뱃지 */}
      <div className="flex justify-center mb-4">
        <div
          className="rounded-[30px] px-4 py-1.5 text-xs font-semibold tracking-wide"
          style={{
            background: "rgba(168, 212, 184, 0.09)",
            border: "1px solid rgba(168, 212, 184, 0.27)",
            color: "#5a7a6a",
          }}
        >
          {sipsung} · {sipsungDesc}
        </div>
      </div>

      {/* 요약 문장 */}
      <div
        className="rounded-2xl px-5 py-4 max-w-[320px] mx-auto text-center mb-2"
        style={{
          background: "#f5f7f4",
          border: "1px solid rgba(107, 138, 122, 0.4)",
        }}
      >
        <div
          className="text-[12px] mb-2 tracking-wide"
          style={{ color: "#5a7a6a" }}
        >
          핵심 기준
        </div>
        <div
          className="text-[15px] font-bold tracking-tight mb-2"
          style={{ color: "#3d4a3d" }}
        >
          &quot;{summary}&quot;
        </div>
        <div
          className="text-[11px] leading-relaxed"
          style={{ color: "#5c6b5c" }}
        >
          {desc}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes compass-pulse {
            0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
          }
          .animate-compass-pulse {
            animation: compass-pulse 2s ease-in-out infinite;
          }
        `,
        }}
      />
    </div>
  );
}
