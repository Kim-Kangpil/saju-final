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

function buildMoneyFlow(ruleSummary: Record<string, any>): {
  steps: FlowStep[];
  leakLabel: string;
  typeLabel: string;
} {
  const patterns: string[] = ruleSummary.all_patterns ?? [];
  const money: string[] = ruleSummary.money_points ?? [];
  const all = [...patterns, ...money].join(" ");

  let steps: FlowStep[] = [];
  let leakLabel = "";
  let typeLabel = "";

  if (all.includes("편재") || all.includes("비정기") || all.includes("변동")) {
    typeLabel = "변동 수입형";
    steps = [
      { label: "기회 포착", sub: "순간 판단" },
      { label: "빠른 실행", sub: "추진력" },
      { label: "수입 발생", sub: "한 번에 큼" },
      { label: "재투자", sub: "또 기회로", isLeak: true },
    ];
    leakLabel = "충동 소비·재투자로 잘 안 모임";
  } else if (all.includes("정재") || all.includes("안정") || all.includes("꾸준")) {
    typeLabel = "누적 안정형";
    steps = [
      { label: "꾸준한 일", sub: "성실함" },
      { label: "정기 수입", sub: "안정적" },
      { label: "저축 우선", sub: "차곡차곡" },
      { label: "천천히 늘어남", sub: "복리 효과" },
    ];
    leakLabel = "큰 기회 앞에서 망설임";
  } else if (all.includes("신약+재성") || all.includes("버는 만큼 나가")) {
    typeLabel = "기회 있지만 버거운 구조";
    steps = [
      { label: "돈 기회 옴", sub: "많이 보임" },
      { label: "잡으려 함", sub: "에너지 소모" },
      { label: "일부 성공", sub: "들어옴" },
      { label: "나가는 것도 많음", sub: "지출 증가", isLeak: true },
    ];
    leakLabel = "에너지 대비 수익이 적은 구조";
  } else {
    typeLabel = "균형 수입형";
    steps = [
      { label: "일로 수입", sub: "본업 중심" },
      { label: "꾸준히 쌓임", sub: "안정적" },
      { label: "필요한 곳 씀", sub: "균형 있게" },
      { label: "조금씩 늘어남", sub: "천천히" },
    ];
    leakLabel = "큰 변화 없이 유지되는 구조";
  }

  return { steps, leakLabel, typeLabel };
}

export function MoneyFlowCard({ ruleSummary }: Props) {
  const { steps, leakLabel, typeLabel } = useMemo(
    () => buildMoneyFlow(ruleSummary),
    [ruleSummary]
  );

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
