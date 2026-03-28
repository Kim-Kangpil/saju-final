"use client";
import { useMemo } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

export function ProblemLoopCard({ ruleSummary }: Props) {
  const loop = useMemo(() => {
    const visualData = ruleSummary?.visual_data?.problem_loop;
    if (visualData && Array.isArray(visualData.steps)) {
      return visualData.steps;
    }
    return ["목표 세움", "중간 흔들림", "방향 잃음", "다시 목표"];
  }, [ruleSummary]);

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
