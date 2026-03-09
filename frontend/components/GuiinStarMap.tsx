"use client";

import { useEffect, useRef, useState } from "react";
import { detectGuiin, GuiinKey, PillarPos } from "../data/guiinAnalysis";

type GuiinStarMapProps = {
  dayStem: string;
  monthBranch: string;
  stems: string[]; // [년간, 월간, 일간, 시간]
  branches: string[]; // [년지, 월지, 일지, 시지]
};

type GuiinCategory = "보호" | "재복" | "재능" | "특수";

const GUIIN_META: Record<
  GuiinKey,
  { name: string; emoji: string; color: string; category: GuiinCategory; desc: string }
> = {
  cheonul: {
    name: "천을귀인",
    emoji: "⭐",
    color: "#FFD700",
    category: "보호",
    desc: "위기마다 기묘한 도움이 들어오는 구조예요. 막다른 길에서도 반전의 구멍이 열리는 타입이라, 한 번쯤은 '운이 좋았다'는 말을 듣기 쉬운 별입니다.",
  },
  cheondeok: {
    name: "천덕귀인",
    emoji: "🌟",
    color: "#FFF4A3",
    category: "보호",
    desc: "하늘이 덕을 얹어 둔 구조라, 큰 위험도 이상하리만큼 비켜 가거나 완충 장치가 들어오는 경우가 많아요. 선한 태도와 덕이 보호막이 됩니다.",
  },
  woldeok: {
    name: "월덕귀인",
    emoji: "🌙",
    color: "#C9E8FF",
    category: "보호",
    desc: "조용히 쌓인 음덕과 내조의 기운이에요. 겉으로 요란하지 않아도, 관계 속에서 받은 작은 도움과 배려가 위기 때 큰 힘으로 돌아오는 구조입니다.",
  },
  munchang: {
    name: "문창귀인",
    emoji: "✍️",
    color: "#A8EDEA",
    category: "재능",
    desc: "언어·문장·표현력에 빛이 나는 길성입니다. 글쓰기·강의·콘텐츠·시험처럼 말과 글을 다루는 자리에서 강점이 살아나기 쉬워요.",
  },
  hakdang: {
    name: "학당귀인",
    emoji: "📚",
    color: "#B5EAD7",
    category: "재능",
    desc: "배우고 가르치는 재능에 힘이 실린 구조예요. 지식을 정리하고 전달하는 능력이 좋아, 교육·연구·코칭 같은 분야와 잘 맞습니다.",
  },
  cheonui: {
    name: "천의성",
    emoji: "💊",
    color: "#FFB7C5",
    category: "재능",
    desc: "치유와 회복의 기운입니다. 남의 상태를 민감하게 느끼고 돌보고 싶어 하는 마음이 자연스럽게 올라오는 별이에요.",
  },
  amrok: {
    name: "암록",
    emoji: "🌿",
    color: "#98D8AA",
    category: "재복",
    desc: "겉으로 티 나지 않는 숨은 재복이에요. 위기 상황에서 예상 밖의 경로로 도움이 들어와 '어떻게든 버텨진다'는 서사를 만들기 쉽습니다.",
  },
  wolgong: {
    name: "월공",
    emoji: "🕊️",
    color: "#E2E2FF",
    category: "재복",
    desc: "세속적인 욕심보다 의미와 가치를 중시하게 만드는 맑은 기운입니다. 집착을 비워낼수록 오히려 들어오는 게 많아지는 역설적인 별이에요.",
  },
  geonrok: {
    name: "건록",
    emoji: "🏆",
    color: "#FFDAC1",
    category: "재복",
    desc: "일간의 힘이 가장 강하게 서는 자리라, '내 힘으로 일어서는 독립성'을 상징합니다. 직업·역할에서 꾸준히 버티는 힘이 큰 복입니다.",
  },
  geumyeolog: {
    name: "금여록",
    emoji: "💍",
    color: "#FFE4E1",
    category: "재복",
    desc: "품격 있는 인연과 배우자 복을 상징해요. 사람을 만날수록 인연의 질이 높아지고, 함께하는 파트너가 삶의 품격을 끌어올리기 쉬운 구조입니다.",
  },
  bokseong: {
    name: "복성귀인",
    emoji: "🍀",
    color: "#CAFFBF",
    category: "재능",
    desc: "일상 곳곳에서 크고 작은 복이 끊이지 않는 별입니다. 먹을 복·사람 복·생활 복이 고르게 들어와, '어디 가도 굶지 않는다'는 안정감을 줍니다.",
  },
  taegeuk: {
    name: "태극귀인",
    emoji: "☯️",
    color: "#D4C5F9",
    category: "보호",
    desc: "인생의 굴곡 속에서도 결국 중심 자리로 돌아오는 복원력을 의미해요. 큰 흐름을 보는 감각이 있어서 중요한 국면에서 균형을 다시 찾는 힘이 있습니다.",
  },
  cheonju: {
    name: "천주귀인",
    emoji: "🍜",
    color: "#FFEAA7",
    category: "재복",
    desc: "먹고사는 문제와 손님 대접, 베풂의 기운이 강하게 들어오는 별입니다. 요식·서비스·대접하는 일과 인연이 닿기 쉽고, 베푸는 만큼 복이 도는 구조예요.",
  },
  samgi: {
    name: "삼기귀인",
    emoji: "🌠",
    color: "#FF9FF3",
    category: "특수",
    desc: "범상치 않은 재능과 특이한 서사를 가진 조합입니다. 평범한 길보다 자신만의 분야를 만들수록 더 크게 빛나는 별이에요.",
  },
};

type StarPosition = {
  key: GuiinKey;
  angle: number;
  r: number;
};

const STAR_POSITIONS: StarPosition[] = [
  { key: "cheonul", angle: 0, r: 0.72 },
  { key: "cheondeok", angle: 26, r: 0.78 },
  { key: "woldeok", angle: 52, r: 0.7 },
  { key: "munchang", angle: 80, r: 0.76 },
  { key: "hakdang", angle: 105, r: 0.68 },
  { key: "cheonui", angle: 131, r: 0.74 },
  { key: "amrok", angle: 157, r: 0.72 },
  { key: "wolgong", angle: 183, r: 0.78 },
  { key: "geonrok", angle: 209, r: 0.7 },
  { key: "geumyeolog", angle: 235, r: 0.75 },
  { key: "bokseong", angle: 261, r: 0.68 },
  { key: "taegeuk", angle: 287, r: 0.74 },
  { key: "cheonju", angle: 313, r: 0.71 },
  { key: "samgi", angle: 338, r: 0.77 },
];

function toXY(angle: number, r: number, cx: number, cy: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * r * Math.cos(rad),
    y: cy + radius * r * Math.sin(rad),
  };
}

export function GuiinStarMap(props: GuiinStarMapProps) {
  const { dayStem, monthBranch, stems, branches } = props;
  const [mounted, setMounted] = useState(false);
  const [activeKey, setActiveKey] = useState<GuiinKey | null>(null);
  const [shootingStars, setShootingStars] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const hits = detectGuiin(dayStem, monthBranch, stems, branches);
  const byKey = new Map<GuiinKey, PillarPos[]>();
  hits.forEach((h) => {
    const arr = byKey.get(h.key) ?? [];
    if (h.pos === "연월일" || h.pos === "월일시") return;
    arr.push(h.pos as PillarPos);
    byKey.set(h.key, arr);
  });
  const activeKeys = Array.from(byKey.keys());

  const hasSamDeok =
    byKey.has("cheonul") && byKey.has("cheondeok") && byKey.has("woldeok");
  const hasRokPair = byKey.has("geonrok") && byKey.has("amrok");
  const hasMunHak = byKey.has("munchang") && byKey.has("hakdang");
  const hasSamgi = byKey.has("samgi");

  // 유성 (삼기귀인 있을 때)
  useEffect(() => {
    if (!hasSamgi) return;
    const interval = setInterval(() => {
      const id = Date.now();
      setShootingStars((prev) => [
        ...prev,
        { id, x: Math.random() * 220, y: Math.random() * 60 },
      ]);
      setTimeout(
        () => setShootingStars((prev) => prev.filter((s) => s.id !== id)),
        1200
      );
    }, 2500);
    return () => clearInterval(interval);
  }, [hasSamgi]);

  const SIZE = 260;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 110;

  const points = STAR_POSITIONS.map((sp) => {
    const meta = GUIIN_META[sp.key];
    const { x, y } = toXY(sp.angle, sp.r, CX, CY, R);
    return {
      ...sp,
      x,
      y,
      meta,
      active: byKey.has(sp.key),
      positions: byKey.get(sp.key) ?? [],
    };
  });

  const getLinePoints = (keys: GuiinKey[]) =>
    keys
      .map((k) => points.find((p) => p.key === k))
      .filter((p): p is (typeof points)[number] => !!p);

  const activeInfo = activeKey
    ? { ...GUIIN_META[activeKey], positions: byKey.get(activeKey) ?? [] }
    : null;

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="relative">
        {/* 유성 */}
        {shootingStars.map((s) => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: 70,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #FF9FF3, transparent)",
              animation: "shoot 1.2s linear forwards",
              transform: "rotate(30deg)",
              opacity: 0.8,
              pointerEvents: "none",
            }}
          />
        ))}

        <svg
          ref={svgRef}
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          <defs>
            {points.map((s) => (
              <radialGradient
                key={`glow-${s.key}`}
                id={`glow-${s.key}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="0%" stopColor={s.meta.color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={s.meta.color} stopOpacity={0} />
              </radialGradient>
            ))}
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4A3F6B" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4A3F6B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 중심 원 */}
          <circle cx={CX} cy={CY} r={R * 0.55} fill="url(#centerGlow)" />
          <circle
            cx={CX}
            cy={CY}
            r={R * 0.55}
            fill="none"
            stroke="#2A1F4A"
            strokeWidth={0.5}
          />
          <circle
            cx={CX}
            cy={CY}
            r={R * 0.8}
            fill="none"
            stroke="#1A1335"
            strokeWidth={0.5}
            strokeDasharray="3 6"
          />

          {/* 조합 연결선 — 삼덕 */}
          {hasSamDeok &&
            (() => {
              const pts = getLinePoints(["cheonul", "cheondeok", "woldeok"]);
              if (pts.length === 3) {
                return (
                  <polygon
                    points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="rgba(255,215,0,0.06)"
                    stroke="#FFD700"
                    strokeWidth={0.8}
                    strokeOpacity={0.5}
                    strokeDasharray="4 4"
                  />
                );
              }
              return null;
            })()}

          {/* 조합 연결선 — 록쌍 */}
          {hasRokPair &&
            (() => {
              const pts = getLinePoints(["geonrok", "amrok"]);
              if (pts.length === 2) {
                return (
                  <line
                    x1={pts[0].x}
                    y1={pts[0].y}
                    x2={pts[1].x}
                    y2={pts[1].y}
                    stroke="#98D8AA"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    strokeDasharray="3 3"
                  />
                );
              }
              return null;
            })()}

          {/* 조합 연결선 — 문학 */}
          {hasMunHak &&
            (() => {
              const pts = getLinePoints(["munchang", "hakdang"]);
              if (pts.length === 2) {
                return (
                  <line
                    x1={pts[0].x}
                    y1={pts[0].y}
                    x2={pts[1].x}
                    y2={pts[1].y}
                    stroke="#A8EDEA"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    strokeDasharray="3 3"
                  />
                );
              }
              return null;
            })()}

          {/* 별들 */}
          {points.map((s, i) => {
            const isActive = s.active;
            const isSelected = activeKey === s.key;
            const delay = i * 0.06;
            const isSamgiPoint = s.key === "samgi";

            return (
              <g
                key={s.key}
                style={{ cursor: isActive ? "pointer" : "default" }}
                onClick={() => {
                  if (!isActive) return;
                  setActiveKey((prev) => (prev === s.key ? null : s.key));
                }}
              >
                {isActive && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={isSelected ? 16 : 12}
                    fill={`url(#glow-${s.key})`}
                    style={{
                      opacity: mounted ? 1 : 0,
                      transition: `opacity 0.6s ease ${delay}s`,
                    }}
                  />
                )}

                {isSamgiPoint && isActive ? (
                  <polygon
                    points={`${s.x},${s.y - 9} ${s.x + 6},${s.y} ${
                      s.x
                    },${s.y + 9} ${s.x - 6},${s.y}`}
                    fill={isSelected ? s.meta.color : `${s.meta.color}99`}
                    stroke={s.meta.color}
                    strokeWidth={1}
                    style={{
                      opacity: mounted ? 1 : 0,
                      transition: `opacity 0.6s ease ${delay}s, transform 0.2s ease`,
                      transform: isSelected ? "scale(1.2)" : "scale(1)",
                      transformOrigin: `${s.x}px ${s.y}px`,
                      filter: isActive
                        ? `drop-shadow(0 0 6px ${s.meta.color})`
                        : "none",
                    }}
                  />
                ) : (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={isActive ? (isSelected ? 7 : 5) : 3}
                    fill={
                      isActive
                        ? isSelected
                          ? s.meta.color
                          : `${s.meta.color}CC`
                        : "#1E1830"
                    }
                    stroke={isActive ? s.meta.color : "#2A2050"}
                    strokeWidth={isActive ? 1 : 0.5}
                    style={{
                      opacity: mounted ? (isActive ? 1 : 0.4) : 0,
                      transition: `all 0.4s ease ${delay}s`,
                      filter: isActive
                        ? `drop-shadow(0 0 4px ${s.meta.color})`
                        : "none",
                    }}
                  />
                )}

                <text
                  x={s.x}
                  y={s.y + (s.y > CY ? 18 : -10)}
                  textAnchor="middle"
                  fontSize={8}
                  fill={isActive ? s.meta.color : "#3D3360"}
                  style={{
                    opacity: mounted ? (isActive ? 1 : 0.5) : 0,
                    transition: `opacity 0.4s ease ${delay}s`,
                    fontFamily: "Georgia, serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  {s.meta.name}
                </text>
              </g>
            );
          })}

          {/* 중앙 텍스트 */}
          <text
            x={CX}
            y={CY - 4}
            textAnchor="middle"
            fontSize={18}
            fill="#E8E0FF"
            opacity={0.15}
          >
            命
          </text>
          <text
            x={CX}
            y={CY + 12}
            textAnchor="middle"
            fontSize={9}
            fill="#9B89CC"
            opacity={0.7}
          >
            {activeKeys.length > 0 ? `${activeKeys.length}성 성립` : "귀인 없음"}
          </text>
        </svg>
      </div>

      {/* 조합 뱃지 */}
      {(hasSamDeok || hasRokPair || hasMunHak || hasSamgi) && (
        <div className="flex flex-wrap justify-center gap-2 text-[10px]">
          {hasSamDeok && (
            <span className="px-2 py-1 rounded-full border border-yellow-400 text-yellow-500 bg-yellow-50/40">
              ✦ 삼덕 구조
            </span>
          )}
          {hasRokPair && (
            <span className="px-2 py-1 rounded-full border border-emerald-300 text-emerald-400 bg-emerald-50/40">
              ✦ 음양록 쌍
            </span>
          )}
          {hasMunHak && (
            <span className="px-2 py-1 rounded-full border border-cyan-200 text-cyan-400 bg-cyan-50/40">
              ✦ 문학 쌍성
            </span>
          )}
          {hasSamgi && (
            <span className="px-2 py-1 rounded-full border border-pink-300 text-pink-400 bg-pink-50/40">
              🌠 삼기귀인
            </span>
          )}
        </div>
      )}

      {/* 선택된 귀인 상세 */}
      {activeInfo && (
        <div
          className="w-full max-w-xs text-[11px] leading-relaxed mt-1 px-2 py-2 rounded-xl border"
          style={{
            borderColor: `${activeInfo.color}66`,
            background: `linear-gradient(135deg, rgba(${hexToRgb(
              activeInfo.color
            )},0.06), rgba(255,255,255,0.9))`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{activeInfo.emoji}</span>
            <span
              className="font-bold"
              style={{ color: activeInfo.color, letterSpacing: "1px" }}
            >
              {activeInfo.name}
            </span>
            <span
              className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={{
                backgroundColor: `${activeInfo.color}22`,
                color: activeInfo.color,
              }}
            >
              {activeInfo.category}
            </span>
          </div>
          <p className="text-[#4b3f6b]">
            {activeInfo.desc}
          </p>
          {activeInfo.positions.length > 0 && (
            <p
              className="mt-1 text-[10px]"
              style={{ color: activeInfo.color }}
            >
              📍 {activeInfo.positions.join(" · ")} 성립
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes shoot {
          0% {
            transform: rotate(30deg) translateX(0px);
            opacity: 0.8;
          }
          100% {
            transform: rotate(30deg) translateX(100px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

