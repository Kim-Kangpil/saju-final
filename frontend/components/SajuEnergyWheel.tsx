"use client";

interface SajuEnergyWheelProps {
  dayStem: string;
  yangCount: number;
  yinCount: number;
  size?: number;
}

// ✅ 오행별 색상 매핑
const ELEMENT_COLORS: Record<string, string> = {
  木: "#2d5016", // 목(木) - 진한 초록
  火: "#c41e3a", // 화(火) - 빨강
  土: "#8b4513", // 토(土) - 갈색
  金: "#9c9c9c", // 금(金) - 회색
  水: "#1e40af", // 수(水) - 파랑
};

// ✅ 일간 → 오행 매핑
const STEM_TO_ELEMENT: Record<string, string> = {
  甲: "木", 乙: "木",
  丙: "火", 丁: "火",
  戊: "土", 己: "土",
  庚: "金", 辛: "金",
  壬: "水", 癸: "水",
};

const ILGAN_ICONS: Record<string, { emoji: string; color: string; label: string }> = {
  "甲": { emoji: "🌳", color: "#4ade80", label: "갑목" },
  "乙": { emoji: "🌿", color: "#86efac", label: "을목" },
  "丙": { emoji: "🔥", color: "#f97316", label: "병화" },
  "丁": { emoji: "🕯️", color: "#fb923c", label: "정화" },
  "戊": { emoji: "⛰️", color: "#a8a29e", label: "무토" },
  "己": { emoji: "🌱", color: "#d4a373", label: "기토" },
  "庚": { emoji: "⚔️", color: "#94a3b8", label: "경금" },
  "辛": { emoji: "💍", color: "#cbd5e1", label: "신금" },
  "壬": { emoji: "🌊", color: "#60a5fa", label: "임수" },
  "癸": { emoji: "💧", color: "#93c5fd", label: "계수" },
};

export function SajuEnergyWheel({ dayStem, yangCount, yinCount, size = 220 }: SajuEnergyWheelProps) {
  const ilgan = ILGAN_ICONS[dayStem] || { emoji: "✨", color: "#fbbf24", label: "?" };
  const total = yangCount + yinCount;

  // ✅ 오행 색상 가져오기
  const element = STEM_TO_ELEMENT[dayStem] || "土";
  const elementColor = ELEMENT_COLORS[element];

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.44;
  const innerR = size * 0.26;
  const coreR = size * 0.18;

  function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number) {
    const s = polarToXY(cx, cy, outerR, startAngle);
    const e = polarToXY(cx, cy, outerR, endAngle);
    const is = polarToXY(cx, cy, innerR, endAngle);
    const ie = polarToXY(cx, cy, innerR, startAngle);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return [
      `M ${s.x} ${s.y}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${e.x} ${e.y}`,
      `L ${is.x} ${is.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${ie.x} ${ie.y}`,
      "Z",
    ].join(" ");
  }

  const segAngle = total > 0 ? 360 / total : 0;
  const yangEndAngle = yangCount * segAngle;

  const yangSegs = Array.from({ length: yangCount }, (_, i) => ({
    start: i * segAngle,
    end: i * segAngle + segAngle - 2,
  }));
  const yinSegs = Array.from({ length: yinCount }, (_, i) => ({
    start: yangEndAngle + i * segAngle,
    end: yangEndAngle + i * segAngle + segAngle - 2,
  }));

  const yangPct = total > 0 ? Math.round((yangCount / total) * 100) : 0;

  const yangLabelAngle = yangCount > 0 ? yangEndAngle / 2 : -999;
  const yinLabelAngle = yinCount > 0 ? yangEndAngle + (360 - yangEndAngle) / 2 : -999;
  const labelDistance = outerR + 20;

  return (
    <div className="flex flex-col items-center gap-3 my-4">
      <svg width={size + 40} height={size + 40} viewBox={`0 0 ${size + 40} ${size + 40}`}>
        <defs>
          <radialGradient id={`coreGrad_${dayStem}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity={1} />
            <stop offset="60%" stopColor={ilgan.color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={ilgan.color} stopOpacity={0.05} />
          </radialGradient>
          <filter id={`glow_${dayStem}`}>
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(20, 20)">
          <circle cx={cx} cy={cy} r={outerR + 5} fill="#f8f9fa" stroke="#e9ecef" strokeWidth="2" />

          {yangSegs.map((seg, i) => (
            <path
              key={`yang-${i}`}
              d={describeArc(cx, cy, outerR, innerR, seg.start, seg.end)}
              fill={`rgba(251, 191, 36, ${0.55 + (i / Math.max(yangCount, 1)) * 0.35})`}
              stroke="white"
              strokeWidth="1.5"
            />
          ))}

          {yinSegs.map((seg, i) => (
            <path
              key={`yin-${i}`}
              d={describeArc(cx, cy, outerR, innerR, seg.start, seg.end)}
              fill={`rgba(99, 102, 241, ${0.45 + (i / Math.max(yinCount, 1)) * 0.35})`}
              stroke="white"
              strokeWidth="1.5"
            />
          ))}

          {yangCount > 0 && (
            <text
              x={polarToXY(cx, cy, labelDistance, yangLabelAngle).x}
              y={polarToXY(cx, cy, labelDistance, yangLabelAngle).y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.06}
              fontWeight="bold"
              fill="#f59e0b"
            >
              양{yangCount}
            </text>
          )}

          {yinCount > 0 && (
            <text
              x={polarToXY(cx, cy, labelDistance, yinLabelAngle).x}
              y={polarToXY(cx, cy, labelDistance, yinLabelAngle).y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.06}
              fontWeight="bold"
              fill="#6366f1"
            >
              음{yinCount}
            </text>
          )}

          <circle cx={cx} cy={cy} r={innerR} fill="white" stroke="#e9ecef" strokeWidth="1.5" />

          <circle
            cx={cx}
            cy={cy}
            r={coreR + 8}
            fill={ilgan.color}
            opacity="0.12"
            filter={`url(#glow_${dayStem})`}
          />

          <circle
            cx={cx}
            cy={cy}
            r={coreR}
            fill={`url(#coreGrad_${dayStem})`}
            stroke={ilgan.color}
            strokeWidth="2.5"
          />

          <text
            x={cx}
            y={cy + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={coreR * 1.0}
            filter={`url(#glow_${dayStem})`}
          >
            {ilgan.emoji}
          </text>
        </g>
      </svg>

      <div className="text-center">
        {/* ✅ 일간 텍스트: 크기 증가 + 오행 색상 */}
        <p
          className="text-2xl font-bold mb-1"
          style={{ color: elementColor }}
        >
          {dayStem} {ilgan.label}
        </p>
        {/* ✅ 타이틀 변경: 나의 에너지 휠 → 내 음양 에너지 분포 */}
        <p className="text-[10px] text-[#556b2f] opacity-60 mt-0.5">내 음양 에너지 분포</p>
      </div>

      <div className="flex gap-2">
        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-500 border border-orange-200 text-[10px] font-bold">
          ☀️ 양 {yangCount} ({yangPct}%)
        </span>
        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-200 text-[10px] font-bold">
          🌙 음 {yinCount} ({100 - yangPct}%)
        </span>
      </div>
    </div>
  );
}
