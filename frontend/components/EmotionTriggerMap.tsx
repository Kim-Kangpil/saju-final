"use client";

import { EmotionTriggers } from "../data/emotionalWeaknessAnalysis";

type EmotionTriggerMapProps = {
  triggers: EmotionTriggers;
};

const TRIGGER_LABELS: {
  key: keyof EmotionTriggers;
  icon: string;
  label: string;
}[] = [
  { key: "evaluation", icon: "🎓", label: "평가 상황" },
  { key: "mistake", icon: "⚠️", label: "실수 상황" },
  { key: "authority", icon: "👔", label: "권위 관계" },
  { key: "expectation", icon: "🎯", label: "기대 부담" },
  { key: "unfamiliar", icon: "🌫", label: "낯선 환경" },
];

export function EmotionTriggerMap({ triggers }: EmotionTriggerMapProps) {
  const values = Object.values(triggers);
  const maxVal = Math.max(...values, 1);

  const getRatio = (key: keyof EmotionTriggers) =>
    maxVal === 0 ? 0 : triggers[key] / maxVal;

  // 중심 점 위치 계산 (위/아래, 좌/우 민감도 차이)
  const evalR = getRatio("evaluation");
  const mistakeR = getRatio("mistake");
  const authorityR = getRatio("authority");
  const expectationR = getRatio("expectation");

  // 세로: 평가(위) - 실수(아래), 가로: 기대(오른쪽) - 권위(왼쪽)
  const v = evalR - mistakeR; // 위가 클수록 +, 아래가 클수록 -
  const h = expectationR - authorityR; // 오른쪽이 클수록 +, 왼쪽이 클수록 -

  const MAX_OFFSET_X = 32; // px
  const MAX_OFFSET_Y = 26; // px

  const centerX = `calc(50% + ${h * MAX_OFFSET_X}px)`;
  const centerY = `calc(50% + ${-v * MAX_OFFSET_Y}px)`;

  const barWidth = (key: keyof EmotionTriggers) => {
    const ratio = getRatio(key);
    const min = 0.2;
    const w = (min + ratio * (1 - min)) * 100;
    return `${w}%`;
  };

  return (
    <div className="mt-2 space-y-3">
      <p className="text-[11px] font-medium text-[var(--text-primary)]">
        내 마음이 흔들리는 순간
      </p>

      {/* 감정 트리거 지도 */}
      <div className="relative mx-auto mt-1 flex h-40 w-full max-w-[220px] items-center justify-center">
        {/* 중심 포인트 (현재 감정 트리거의 방향) */}
        <div
          className="absolute flex h-5 w-5 items-center justify-center text-[13px]"
          style={{
            left: centerX,
            top: centerY,
            transform: "translate(-50%, -50%)",
            transition: "left 0.3s ease, top 0.3s ease",
          }}
        >
          <span className="inline-block animate-heartPulse drop-shadow-sm">💗</span>
        </div>

        {/* 세로 축 */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#d4e0d5]" />
        {/* 가로 축 */}
        <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-[#d4e0d5]" />

        {/* 평가 (위) */}
        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-[11px]">
          <span
            className="text-base"
            style={{ opacity: 0.5 + getRatio("evaluation") * 0.5 }}
          >
            🎓
          </span>
        </div>

        {/* 실수 (아래) */}
        <div className="absolute bottom-0 left-1/2 flex translate-y-1/2 -translate-x-1/2 flex-col items-center text-[11px]">
          <span
            className="text-base"
            style={{ opacity: 0.5 + getRatio("mistake") * 0.5 }}
          >
            ⚠️
          </span>
        </div>

        {/* 권위 (왼쪽) */}
        <div className="absolute left-0 top-1/2 flex -translate-y-1/2 -translate-x-1/2 flex-col items-center text-[11px]">
          <span
            className="text-base"
            style={{ opacity: 0.5 + getRatio("authority") * 0.5 }}
          >
            👔
          </span>
        </div>

        {/* 기대 (오른쪽) */}
        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 translate-x-1/2 flex-col items-center text-[11px]">
          <span
            className="text-base"
            style={{ opacity: 0.5 + getRatio("expectation") * 0.5 }}
          >
            🎯
          </span>
        </div>
      </div>

      {/* 감정 민감도 바 */}
      <div className="space-y-1 pt-1">
        <p className="text-[11px] font-medium text-[var(--text-primary)]">감정 민감도</p>
        {TRIGGER_LABELS.map(({ key, icon, label }) => (
          <div key={key} className="flex items-center gap-2">
            <div className="flex w-32 items-center gap-1 text-[10px] text-[#475569]">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
            <div className="flex-1 overflow-hidden rounded-full bg-[#e2e8f0] h-1.5">
              <div
                className="h-1.5 rounded-full bg-[#64748b]"
                style={{ width: barWidth(key) }}
              />
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes heartPulse {
          0% {
            transform: scale(1) rotate(0deg);
          }
          35% {
            transform: scale(1.08) rotate(-2deg);
          }
          70% {
            transform: scale(1) rotate(1deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        .animate-heartPulse {
          animation: heartPulse 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

