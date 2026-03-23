"use client";
import { useMemo } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

function buildLoop(ruleSummary: Record<string, any>): string[] {
  const patterns: string[] = ruleSummary.all_patterns ?? [];
  const personality: string[] = ruleSummary.personality_points ?? [];
  const strength: string = ruleSummary.strength ?? "";
  const all = [...patterns, ...personality].join(" ");

  // 패턴 감지 → 루프 결정
  if (all.includes("고민") || all.includes("생각 많음") || all.includes("신중")) {
    return ["생각 많음", "실행 지연", "기회 놓침", "다시 고민"];
  }
  if (all.includes("관계 의존") || all.includes("지지 필요") || all.includes("의존")) {
    return ["사람 믿음", "기대 커짐", "실망 반복", "거리두기"];
  }
  if (all.includes("재성多") || all.includes("버는 만큼 나가")) {
    return ["수입 생김", "소비 늘어남", "남는 돈 없음", "다시 벌기"];
  }
  if (all.includes("역마") || all.includes("변화") || all.includes("이동")) {
    return ["새 시작", "금방 지루함", "또 다른 곳", "반복 이동"];
  }
  if (strength === "신강" || all.includes("독립") || all.includes("경쟁")) {
    return ["혼자 시작", "충돌 발생", "관계 멀어짐", "다시 혼자"];
  }
  // 기본
  return ["목표 세움", "중간에 흔들림", "방향 잃음", "다시 목표"];
}

export function ProblemLoopCard({ ruleSummary }: Props) {
  const loop = useMemo(() => buildLoop(ruleSummary), [ruleSummary]);

  const COLORS = ["#C4B8A4", "#A8946A", "#8B7355", "#6B5F4E"];

  return (
    <div style={{
      width: "100%",
      background: "#fff",
      borderRadius: 16,
      padding: "20px 16px",
      border: "1px solid #E3D9CB",
    }}>
      <p style={{
        fontSize: 12,
        fontWeight: 700,
        color: "#6B5F4E",
        letterSpacing: "0.08em",
        marginBottom: 16,
        textAlign: "center",
      }}>
        반복되는 패턴
      </p>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        flexWrap: "nowrap",
        overflowX: "auto",
        padding: "4px 0",
      }}>
        {loop.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {/* 스텝 박스 */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: i === loop.length - 1
                  ? "#F5F1EA"
                  : `rgba(139,115,85,${0.15 + i * 0.2})`,
                border: i === loop.length - 1
                  ? "2px dashed #C4B8A4"
                  : `2px solid ${COLORS[i]}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: COLORS[i],
                textAlign: "center",
                lineHeight: 1.3,
                padding: 4,
              }}>
                {step}
              </div>
              <span style={{
                fontSize: 9,
                color: "#C4B8A4",
                fontWeight: 600,
              }}>
                {i + 1}단계
              </span>
            </div>

            {/* 화살표 */}
            {i < loop.length - 1 && (
              <div style={{
                fontSize: 14,
                color: "#C4B8A4",
                margin: "0 2px",
                paddingBottom: 16,
              }}>
                →
              </div>
            )}

            {/* 마지막 → 처음 순환 화살표 */}
            {i === loop.length - 1 && (
              <div style={{
                fontSize: 11,
                color: "#C4B8A4",
                margin: "0 2px",
                paddingBottom: 16,
              }}>
                ↩
              </div>
            )}
          </div>
        ))}
      </div>

      <p style={{
        fontSize: 11,
        color: "#A8946A",
        textAlign: "center",
        marginTop: 12,
        fontWeight: 600,
      }}>
        이 흐름을 알면 끊을 수 있어요
      </p>
    </div>
  );
}
