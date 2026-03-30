"use client";
import { useMemo } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

const TYPE_INFO: Record<string, { title: string; desc: string; hint: string }> = {
  pressure_avoidance: {
    title: "압박 회피형",
    desc: "부담을 느끼는 순간 본능적으로 피하려는 패턴이에요",
    hint: "과제를 작게 쪼개면 압박감이 줄고 실행이 쉬워져요",
  },
  solo_conflict: {
    title: "독립 충돌형",
    desc: "혼자 추진하다가 관계에서 반복적으로 마찰이 생겨요",
    hint: "함께할 포인트를 미리 설계하면 충돌이 줄어들어요",
  },
  money_exhaustion: {
    title: "기회 소진형",
    desc: "돈 기회는 오는데 에너지가 따라가지 못하는 구조예요",
    hint: "에너지를 먼저 관리해야 재물 흐름도 잡혀요",
  },
  wanderlust: {
    title: "이동 반복형",
    desc: "새 시작을 즐기지만 한 곳에 오래 정착하기 어려워요",
    hint: "관심사를 하나로 집중할 때 결과가 달라지기 시작해요",
  },
  expression_conflict: {
    title: "표현 충돌형",
    desc: "할 말이 있지만 표현할 때마다 충돌이 반복돼요",
    hint: "타이밍과 방식을 선택하면 같은 말도 다르게 전달돼요",
  },
  overthinking: {
    title: "과잉 고민형",
    desc: "생각이 너무 많아 실행이 계속 미뤄지는 패턴이에요",
    hint: "60% 판단에서 움직이는 연습이 삶의 흐름을 바꿔요",
  },
  goal_drift: {
    title: "목표 흔들림형",
    desc: "목표를 세우지만 중간에 흔들려 방향을 잃는 구조예요",
    hint: "3개월 단위로 목표를 쪼개면 방향이 오래 유지돼요",
  },
};

const STEP_COLORS = ["#C4B8A4", "#A8946A", "#8B7355", "#5C4A30"];

export function ProblemLoopCard({ ruleSummary }: Props) {
  const { steps, typeTitle, typeDesc, hint } = useMemo(() => {
    const vd = ruleSummary?.visual_data?.problem_loop;
    if (vd && Array.isArray(vd.steps)) {
      const t: string = vd.type || "goal_drift";
      const info = TYPE_INFO[t] ?? TYPE_INFO.goal_drift;
      return {
        steps: vd.steps.map((s: unknown) => String(s)),
        typeTitle: info.title,
        typeDesc: info.desc,
        hint: info.hint,
      };
    }
    const info = TYPE_INFO.goal_drift;
    return {
      steps: ["목표 세움", "중간 흔들림", "방향 잃음", "다시 목표"],
      typeTitle: info.title,
      typeDesc: info.desc,
      hint: info.hint,
    };
  }, [ruleSummary]);

  return (
    <div
      style={{
        width: "100%",
        background: "#fff",
        borderRadius: 16,
        padding: "20px 16px",
        border: "1px solid #E3D9CB",
      }}
    >
      {/* 헤더 */}
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#6B5F4E",
            letterSpacing: "0.08em",
          }}
        >
          반복되는 패턴
        </p>
        <p
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#5C4A30",
            marginTop: 5,
          }}
        >
          {typeTitle}
        </p>
      </div>
      <p
        style={{
          fontSize: 11,
          color: "#8B7355",
          textAlign: "center",
          marginBottom: 18,
          lineHeight: 1.65,
        }}
      >
        {typeDesc}
      </p>

      {/* 순환 단계 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          overflowX: "auto",
          padding: "4px 0 8px",
        }}
      >
        {steps.map((step, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background:
                    i === steps.length - 1
                      ? "#F5F1EA"
                      : `rgba(92,74,48,${0.08 + i * 0.14})`,
                  border:
                    i === steps.length - 1
                      ? "2px dashed #C4B8A4"
                      : `2.5px solid ${STEP_COLORS[Math.min(i, STEP_COLORS.length - 1)]}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: STEP_COLORS[Math.min(i, STEP_COLORS.length - 1)],
                  textAlign: "center",
                  lineHeight: 1.3,
                  padding: 4,
                }}
              >
                {step}
              </div>
              <span
                style={{ fontSize: 9, color: "#C4B8A4", fontWeight: 600 }}
              >
                {i + 1}단계
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                style={{
                  fontSize: 14,
                  color: "#C4B8A4",
                  margin: "0 2px",
                  paddingBottom: 16,
                }}
              >
                →
              </div>
            )}
            {i === steps.length - 1 && (
              <div
                style={{
                  fontSize: 12,
                  color: "#C4B8A4",
                  margin: "0 2px",
                  paddingBottom: 16,
                }}
              >
                ↩
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 끊는 힌트 */}
      <div
        style={{
          padding: "10px 12px",
          background: "#F5F1EA",
          borderRadius: 10,
          border: "1px solid #E3D9CB",
        }}
      >
        <p style={{ fontSize: 11, color: "#5C4A30", lineHeight: 1.65 }}>
          💡 {hint}
        </p>
      </div>
    </div>
  );
}
