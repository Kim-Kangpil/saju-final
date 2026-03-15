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

  /* 한양사주AI 디자인 시스템 색상 (노랑·밝은 초록 제거, 베이지·무드 통일) */
  const cardBg = "var(--bg-base)";
  const borderColor = "var(--border-default)";
  const accentMuted = "var(--text-secondary)";
  const needleColor = "#6B6B6B";

  return (
    <div
      className="rounded-2xl overflow-visible mx-auto w-full max-w-[420px]"
      style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        padding: "20px 16px 24px",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* 헤더 */}
      <div className="text-center mb-4">
        <div
          className="text-[10px] tracking-widest uppercase mb-1"
          style={{ color: accentMuted }}
        >
          🧭 삶의 나침반
        </div>
        <div
          className="text-base font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </div>
      </div>

      {/* 나침반 의미 안내 */}
      <div
        className="text-center"
        style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}
      >
        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>↑ 나침반이 가리키는 방향</span>
        <span> = 당신의 핵심 가치(태어난 달)</span>
        <br />
        <span style={{ color: accentMuted }}>다섯 글자 = 이 가치를 나타내는 키워드들</span>
      </div>

      {/* 나침반: 전체 너비 사용 후 내부 264px 블록만 중앙 배치, 위아래 여백으로 문단과 겹침 방지 */}
      <div className="w-full" style={{ marginBottom: 24 }}>
        <div
          className="relative flex items-center justify-center"
          style={{ width: 264, height: 264, margin: "0 auto" }}
        >
        {/* 외곽 링: 264px 원으로 영역 안에 완전히 수용 */}
        <div
          className="absolute rounded-full border"
          style={{
            width: 264,
            height: 264,
            left: 0,
            top: 0,
            borderColor: "rgba(58, 58, 58, 0.12)",
            background: "radial-gradient(circle, transparent 60%, rgba(58, 58, 58, 0.04) 100%)",
          }}
        />

        <svg
          width={240}
          height={240}
          viewBox="0 0 240 240"
          className="absolute"
          style={{ left: 12, top: 12 }}
        >
          {/* 배경 원 */}
          <circle
            cx={cx}
            cy={cy}
            r={r - 2}
            fill={cardBg}
            stroke="rgba(58, 58, 58, 0.2)"
            strokeWidth="1.5"
          />
          {/* 내부 링 */}
          <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke="rgba(58, 58, 58, 0.1)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={r * 0.38} fill="none" stroke="rgba(58, 58, 58, 0.1)" strokeWidth="1" />

          {/* 방위 눈금선 + 키워드 (가독성: 글자 크기·대비 강화) */}
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
                  stroke="rgba(58, 58, 58, 0.2)"
                  strokeWidth="1"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isPointed ? 13 : 11}
                  fontWeight={isPointed ? 700 : 600}
                  fill={isPointed ? "var(--text-primary)" : "var(--text-secondary)"}
                  fontFamily="var(--font-sans)"
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
              points={`${cx},${cy - r * 0.48} ${cx - 6},${cy + 2} ${cx + 6},${cy + 2}`}
              fill={needleColor}
              opacity={0.95}
            />
            <polygon
              points={`${cx},${cy + r * 0.32} ${cx - 4},${cy - 2} ${cx + 4},${cy - 2}`}
              fill={needleColor}
              opacity={0.7}
            />
            <circle cx={cx} cy={cy} r="6" fill="var(--bg-base)" stroke={needleColor} strokeWidth="1.5" />
          </g>
        </svg>

        {/* 정착 후 글로우 (무채색) */}
        {settled && (
          <div
            className="absolute rounded-full pointer-events-none animate-compass-pulse"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "48px",
              height: "48px",
              background: "radial-gradient(circle, rgba(58, 58, 58, 0.06) 0%, transparent 70%)",
            }}
          />
        )}
        </div>
      </div>

      {/* 중앙 정보: 지지·지명·십성 */}
      <div
        className="flex flex-col items-center gap-0.5 mb-4"
        style={{
          padding: "10px 16px",
          background: "var(--bg-surface)",
          borderRadius: "12px",
          border: `1px solid ${borderColor}`,
        }}
      >
        <div style={{ fontSize: "11px", color: accentMuted, letterSpacing: "0.5px", marginBottom: "2px" }}>
          태어난 달(월지)
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{ji}</span>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{jiName}</span>
          <span style={{ fontSize: "11px", color: accentMuted, fontWeight: 600 }}>· {sipsung}</span>
        </div>
      </div>

      {/* 십성 뱃지 */}
      <div className="flex justify-center mb-4">
        <div
          className="rounded-[30px] px-4 py-1.5 text-xs font-semibold tracking-wide"
          style={{
            background: "var(--bg-input)",
            border: `1px solid ${borderColor}`,
            color: "var(--text-primary)",
          }}
        >
          {sipsung} · {sipsungDesc}
        </div>
      </div>

      {/* 요약 문장 */}
      <div
        className="rounded-2xl px-5 py-4 max-w-[320px] mx-auto text-center mb-2"
        style={{
          background: "var(--bg-surface)",
          border: `1px solid ${borderColor}`,
        }}
      >
        <div
          className="text-[12px] mb-2 tracking-wide"
          style={{ color: accentMuted }}
        >
          핵심 기준
        </div>
        <div
          className="text-[15px] font-bold tracking-tight mb-2 leading-snug"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}
        >
          &quot;{summary}&quot;
        </div>
        <div
          className="text-[12px] leading-relaxed"
          style={{ color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}
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
