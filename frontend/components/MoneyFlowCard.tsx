"use client";
import { useMemo } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

interface FlowStep {
  label: string;
  sub: string;
  isLeak?: boolean;
}

const TYPE_INSIGHT: Record<string, string> = {
  variable_income:
    "큰 기회 앞에서 빛나는 구조예요. 번 것을 모으는 시스템을 따로 만들면 자산이 쌓여요.",
  stable_accumulation:
    "꾸준함이 자산이 되는 구조예요. 가끔은 큰 기회 앞에서 과감해지는 연습도 필요해요.",
  high_opportunity_low_energy:
    "기회는 충분히 오는 편이에요. 에너지를 먼저 채워야 기회를 제대로 잡을 수 있어요.",
  self_earning:
    "스스로 벌고 관리하는 능력이 있어요. 레버리지를 활용하면 더 빠르게 늘어날 수 있어요.",
  balanced:
    "안정적인 흐름의 구조예요. 작은 투자나 부수입을 연결하면 속도가 붙기 시작해요.",
};

export function MoneyFlowCard({ ruleSummary }: Props) {
  const { steps, leakLabel, typeLabel, type } = useMemo(() => {
    const vd = ruleSummary?.visual_data?.money_flow;
    if (vd && Array.isArray(vd.steps)) {
      return {
        steps: vd.steps as FlowStep[],
        leakLabel: (vd.leakLabel as string) || "큰 변화 없이 유지되는 구조",
        typeLabel: (vd.typeLabel as string) || "균형 수입형",
        type: (vd.type as string) || "balanced",
      };
    }
    return {
      steps: [
        { label: "일로 수입", sub: "본업 중심", isLeak: false },
        { label: "꾸준히 쌓임", sub: "안정적", isLeak: false },
        { label: "필요한 곳 씀", sub: "균형 있게", isLeak: false },
        { label: "조금씩 늘어남", sub: "천천히", isLeak: false },
      ],
      leakLabel: "큰 변화 없이 유지되는 구조",
      typeLabel: "균형 수입형",
      type: "balanced",
    };
  }, [ruleSummary]);

  const insight = TYPE_INSIGHT[type] ?? TYPE_INSIGHT.balanced;

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#6B5F4E",
            letterSpacing: "0.08em",
          }}
        >
          돈 흐름 구조
        </p>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#8B7355",
            background: "#F5F1EA",
            padding: "3px 10px",
            borderRadius: 99,
            border: "1px solid #D4C9B8",
          }}
        >
          {typeLabel}
        </span>
      </div>

      {/* 한 줄 특징 */}
      <p
        style={{
          fontSize: 11,
          color: "#8B7355",
          marginBottom: 14,
          lineHeight: 1.6,
        }}
      >
        {leakLabel}
      </p>

      {/* 플로우 스텝 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {steps.map((step, i) => (
          <div key={i}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: step.isLeak ? "#FDF4F4" : "#F5F1EA",
                border: `1px solid ${step.isLeak ? "#E5C0C0" : "#E3D9CB"}`,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: step.isLeak ? "#8B2020" : "#8B7355",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: step.isLeak ? "#8B2020" : "#2C2417",
                    marginBottom: 1,
                  }}
                >
                  {step.label}
                  {step.isLeak && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#8B2020",
                        background: "#FDE8E8",
                        padding: "1px 5px",
                        borderRadius: 4,
                        marginLeft: 6,
                      }}
                    >
                      누수 포인트
                    </span>
                  )}
                </p>
                <p style={{ fontSize: 11, color: "#6B5F4E" }}>{step.sub}</p>
              </div>
              {step.isLeak && <span style={{ fontSize: 15 }}>⚠️</span>}
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 1,
                  height: 8,
                  background: "#D4C9B8",
                  margin: "0 auto",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 타입별 인사이트 */}
      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          background: "#F5F1EA",
          borderRadius: 10,
          border: "1px solid #D4C9B8",
        }}
      >
        <p style={{ fontSize: 11, color: "#5C4A30", lineHeight: 1.65 }}>
          💡 {insight}
        </p>
      </div>
    </div>
  );
}
