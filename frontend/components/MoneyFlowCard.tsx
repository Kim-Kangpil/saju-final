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

export function MoneyFlowCard({ ruleSummary }: Props) {
  const { steps, leakLabel, typeLabel } = useMemo(() => {
    const visualData = ruleSummary?.visual_data?.money_flow;
    if (visualData && Array.isArray(visualData.steps)) {
      return {
        steps: visualData.steps as FlowStep[],
        leakLabel: visualData.leakLabel || "큰 변화 없이 유지되는 구조",
        typeLabel: visualData.typeLabel || "균형 수입형",
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
    };
  }, [ruleSummary]);

  return (
    <div style={{
      width: "100%",
      background: "#fff",
      borderRadius: 16,
      padding: "20px 16px",
      border: "1px solid #E3D9CB",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}>
        <p style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#6B5F4E",
          letterSpacing: "0.08em",
        }}>
          돈 흐름 구조
        </p>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#8B7355",
          background: "#F5F1EA",
          padding: "3px 8px",
          borderRadius: 99,
          border: "1px solid #D4C9B8",
        }}>
          {typeLabel}
        </span>
      </div>

      {/* 플로우 스텝 */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}>
        {steps.map((step, i) => (
          <div key={i}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: step.isLeak ? "#FDF4F4" : "#F5F1EA",
              border: step.isLeak ? "1px solid #E5C0C0" : "1px solid #E3D9CB",
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: step.isLeak ? "#8B2020" : "#8B7355",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: step.isLeak ? "#8B2020" : "#2C2417",
                  marginBottom: 1,
                }}>
                  {step.label}
                  {step.isLeak && (
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#8B2020",
                      background: "#FDE8E8",
                      padding: "1px 5px",
                      borderRadius: 4,
                      marginLeft: 6,
                    }}>
                      누수 포인트
                    </span>
                  )}
                </p>
                <p style={{ fontSize: 11, color: "#6B5F4E" }}>{step.sub}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 1,
                height: 8,
                background: "#D4C9B8",
                margin: "0 auto",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* 누수 요약 */}
      <div style={{
        marginTop: 12,
        padding: "10px 12px",
        borderRadius: 8,
        background: "#F5F1EA",
        border: "1px solid #D4C9B8",
        display: "flex",
        alignItems: "flex-start",
        gap: 6,
      }}>
        <span style={{ fontSize: 13 }}>💡</span>
        <p style={{ fontSize: 11, color: "#6B5F4E", lineHeight: 1.6 }}>
          {leakLabel}
        </p>
      </div>
    </div>
  );
}
