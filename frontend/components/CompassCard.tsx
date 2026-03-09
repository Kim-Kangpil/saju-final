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
        background: "linear-gradient(160deg, #0F0F1A 0%, #1A1428 60%, #0F1A1A 100%)",
        padding: "20px 16px 24px",
      }}
    >
      {/* 헤더 */}
      <div className="text-center mb-4">
        <div
          className="text-[10px] tracking-widest uppercase mb-1"
          style={{ color: "#6B8A7A" }}
        >
          🧭 삶의 나침반
        </div>
        <div
          className="text-base font-bold tracking-tight"
          style={{ color: "#E8E0D0" }}
        >
          {title}
        </div>
      </div>

      {/* 나침반 */}
      <div className="relative w-[240px] h-[240px] mx-auto mb-5">
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
          <circle cx={cx} cy={cy} r={r * 0.72} fill="none" stroke="rgba(107, 138, 122, 0.13)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={r * 0.45} fill="none" stroke="rgba(107, 138, 122, 0.13)" strokeWidth="1" />

          {/* 방위 눈금선 + 키워드 */}
          {DIRECTIONS.map((d, i) => {
            const inner = polarToXY(d.angle, r * 0.72, cx, cy);
            const outer = polarToXY(d.angle, r * 0.92, cx, cy);
            const pos = polarToXY(d.angle, r * 0.83, cx, cy);
            const isTop = d.angle === 0;
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
                  fontSize={isTop ? "11" : "9.5"}
                  fontWeight={isTop ? "700" : "500"}
                  fill={isTop ? "#5a7a6a" : "#6B8A7A"}
                  fontFamily="Georgia, 'Nanum Myeongjo', serif"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* 나침반 바늘 */}
          <g
            transform={`rotate(${needleAngle}, ${cx}, ${cy})`}
            style={{
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <polygon
              points={`${cx},${cy - r * 0.52} ${cx - 7},${cy + 4} ${cx + 7},${cy + 4}`}
              fill="#6B8A7A"
              opacity="0.95"
            />
            <polygon
              points={`${cx},${cy + r * 0.38} ${cx - 5},${cy - 4} ${cx + 5},${cy - 4}`}
              fill="#5a7a6a"
              opacity="0.9"
            />
            <circle cx={cx} cy={cy} r="5" fill="#5a7a6a" stroke="#6B8A7A" strokeWidth="1.5" />
          </g>

          {/* 중앙 지지·십성 */}
          <text
            x={cx}
            y={cy - 14}
            textAnchor="middle"
            fontSize="22"
            fontWeight="800"
            fill="#3d4a3d"
            fontFamily="Georgia, 'Nanum Myeongjo', serif"
          >
            {ji}
          </text>
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            fontSize="9"
            fill="#5c6b5c"
            fontFamily="Georgia, 'Nanum Myeongjo', serif"
            letterSpacing="1"
          >
            {jiName}
          </text>
          <text
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            fontSize="9"
            fill="#5a7a6a"
            fontFamily="Georgia, 'Nanum Myeongjo', serif"
          >
            {sipsung}
          </text>
        </svg>

        {/* 정착 후 글로우 */}
        {settled && (
          <div
            className="absolute rounded-full pointer-events-none animate-compass-pulse"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "56px",
              height: "56px",
              background: "radial-gradient(circle, rgba(168, 212, 184, 0.13) 0%, transparent 70%)",
            }}
          />
        )}
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
          style={{ color: "#8A8A9A" }}
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
