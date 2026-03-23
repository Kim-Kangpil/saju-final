"use client";
import { useMemo } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

function calcRadarScores(ruleSummary: Record<string, any>) {
  const patterns: string[] = ruleSummary.all_patterns ?? [];
  const personality: string[] = ruleSummary.personality_points ?? [];
  const strength: string = ruleSummary.strength ?? "";
  const all = [...patterns, ...personality].join(" ");

  // 각 축: 0~100 (50이 중간)
  let 감정 = 50, 즉흥 = 50, 외향 = 50, 실행 = 50, 안정 = 50;

  // 감정 vs 이성
  if (all.includes("감수성") || all.includes("예민") || all.includes("감정")) 감정 += 20;
  if (all.includes("분석") || all.includes("논리") || all.includes("계획")) 감정 -= 15;
  if (all.includes("직관") || all.includes("통찰")) 감정 += 10;

  // 즉흥 vs 계획
  if (all.includes("추진") || all.includes("즉흥") || all.includes("열정")) 즉흥 += 20;
  if (all.includes("신중") || all.includes("준비") || all.includes("꼼꼼")) 즉흥 -= 20;
  if (all.includes("계획") || all.includes("안정")) 즉흥 -= 10;

  // 외향 vs 내향
  if (all.includes("표현") || all.includes("존재감") || all.includes("드러")) 외향 += 25;
  if (all.includes("내향") || all.includes("조용") || all.includes("혼자")) 외향 -= 20;
  if (all.includes("태양") || all.includes("에너지")) 외향 += 15;

  // 실행 vs 고민
  if (all.includes("추진") || all.includes("실행") || all.includes("직접")) 실행 += 20;
  if (all.includes("고민") || all.includes("생각") || all.includes("신중")) 실행 -= 15;
  if (strength === "신강") 실행 += 10;
  if (strength === "신약") 실행 -= 10;

  // 안정 vs 변화
  if (all.includes("역마") || all.includes("변화") || all.includes("이동")) 안정 -= 25;
  if (all.includes("안정") || all.includes("축적") || all.includes("꾸준")) 안정 += 20;
  if (all.includes("도전") || all.includes("개척")) 안정 -= 15;

  const clamp = (v: number) => Math.min(90, Math.max(10, v));
  return {
    감정: clamp(감정),
    즉흥: clamp(즉흥),
    외향: clamp(외향),
    실행: clamp(실행),
    안정: clamp(안정),
  };
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
  const scores = useMemo(() => calcRadarScores(ruleSummary), [ruleSummary]);

  const SIZE = 300;
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
  const labelRadius = R + 34;

  return (
    <div style={{
      width: "100%",
      background: "#fff",
      borderRadius: 16,
      padding: "20px 40px",
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
        viewBox={`0 0 ${SIZE} ${SIZE}`}
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
          const alpha = intensity > 30 ? 1 : 0.7;

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
          const level = intensity > 30 ? "강함" : intensity > 15 ? "보통" : "중간";
          return (
            <div key={axis} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: intensity > 30 ? "#8B7355" : "#C4B8A4",
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
