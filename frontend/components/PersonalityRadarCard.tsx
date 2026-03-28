"use client";
import { useMemo } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

const AXES = ["감정", "즉흥", "외향", "실행", "안정"] as const;
const AXIS_LABELS: Record<string, [string, string]> = {
  감정: ["감정형", "이성형"],
  즉흥: ["즉흥형", "계획형"],
  외향: ["외향형", "내향형"],
  실행: ["실행형", "고민형"],
  안정: ["안정형", "변화형"],
};

export function PersonalityRadarCard({ ruleSummary }: Props) {
  const scores = useMemo(() => {
    const visualData = ruleSummary?.visual_data?.personality_radar;
    if (visualData && typeof visualData === "object") {
      return visualData as Record<string, number>;
    }
    return { 감정: 50, 즉흥: 50, 외향: 50, 실행: 50, 안정: 50 };
  }, [ruleSummary]);

  const SIZE = 320;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 92;
  const N = AXES.length;

  function polarToXY(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: CX + r * Math.cos(rad),
      y: CY + r * Math.sin(rad),
    };
  }

  // 배경 원 3개
  const bgCircles = [0.33, 0.66, 1].map((ratio) => {
    const pts = AXES.map((_, i) => {
      const { x, y } = polarToXY((360 / N) * i, R * ratio);
      return `${x},${y}`;
    });
    return pts.join(" ");
  });

  // 데이터 폴리곤
  const dataPoints = AXES.map((axis, i) => {
    const score = scores[axis];
    const r = (score / 100) * R;
    return polarToXY((360 / N) * i, r);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  // 축 라벨 위치 (여유 반경 확장)
  const labelRadius = R + 38;

  return (
    <div style={{
      width: "100%",
      background: "#fff",
      borderRadius: 16,
      padding: "20px 44px",
      border: "1px solid #E3D9CB",
    }}>
      <p style={{
        fontSize: 12,
        fontWeight: 700,
        color: "#6B5F4E",
        letterSpacing: "0.08em",
        marginBottom: 4,
        textAlign: "center",
      }}>
        나의 성향 지도
      </p>

      <svg
        width="100%"
        viewBox="-24 -18 368 356"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", margin: "0 auto", maxWidth: SIZE, overflow: "visible" }}
      >
        {/* 배경 그리드 */}
        {bgCircles.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="#E3D9CB"
            strokeWidth={1}
          />
        ))}

        {/* 축 선 */}
        {AXES.map((_, i) => {
          const { x, y } = polarToXY((360 / N) * i, R);
          return (
            <line
              key={i}
              x1={CX} y1={CY}
              x2={x} y2={y}
              stroke="#E3D9CB"
              strokeWidth={1}
            />
          );
        })}

        {/* 데이터 영역 */}
        <path
          d={dataPath}
          fill="rgba(139,115,85,0.15)"
          stroke="#8B7355"
          strokeWidth={2}
        />

        {/* 데이터 점 */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#8B7355" />
        ))}

        {/* 축 라벨 */}
        {AXES.map((axis, i) => {
          const angle = (360 / N) * i;
          const { x, y } = polarToXY(angle, labelRadius);
          const [left, right] = AXIS_LABELS[axis];
          const score = scores[axis];
          const label = score >= 50 ? left : right;
          const intensity = Math.abs(score - 50);
          const alpha = intensity > 18 ? 1 : intensity > 8 ? 0.8 : 0.6;

          let textAnchor: "middle" | "start" | "end" = "middle";
          if (x < CX - 10) textAnchor = "end";
          else if (x > CX + 10) textAnchor = "start";

          return (
            <text
              key={axis}
              x={x}
              y={y + 4}
              textAnchor={textAnchor}
              fontSize={10}
              fontWeight={700}
              fill={`rgba(44,36,23,${alpha})`}
              fontFamily="'Gmarket Sans', sans-serif"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* 범례 */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 12px",
        justifyContent: "center",
        marginTop: 8,
      }}>
        {AXES.map((axis) => {
          const score = scores[axis];
          const [left, right] = AXIS_LABELS[axis];
          const label = score >= 50 ? left : right;
          const intensity = Math.abs(score - 50);
          const level = intensity > 30 ? "매우 강함"
                      : intensity > 18 ? "강함"
                      : intensity > 8  ? "보통"
                      : "중립";
          const dotColor = intensity > 30 ? "#5C4A30"
                         : intensity > 18 ? "#8B7355"
                         : intensity > 8  ? "#C4B8A4"
                         : "#E3D9CB";
          return (
            <div key={axis} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: dotColor,
              }} />
              <span style={{ fontSize: 10, color: "#6B5F4E" }}>
                {label} <span style={{ color: "#C4B8A4" }}>({level})</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
