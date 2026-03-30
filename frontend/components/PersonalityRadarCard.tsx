"use client";
import { useMemo } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

const AXES = ["감정", "즉흥", "외향", "실행", "안정"] as const;
type Axis = (typeof AXES)[number];

const AXIS_PAIRS: Record<Axis, [string, string]> = {
  감정: ["감정형", "이성형"],
  즉흥: ["즉흥형", "계획형"],
  외향: ["외향형", "내향형"],
  실행: ["실행형", "고민형"],
  안정: ["안정형", "변화형"],
};

const AXIS_DESC: Record<Axis, [string, string]> = {
  감정: ["감수성이 높고 공감 능력이 뛰어나요", "논리와 데이터로 판단하는 편이에요"],
  즉흥: ["즉흥적이고 유연하게 흘러가는 편이에요", "계획을 세우고 체계적으로 움직여요"],
  외향: ["사람들과 함께할 때 에너지가 올라가요", "혼자만의 시간이 있어야 회복이 돼요"],
  실행: ["생각보다 행동이 먼저 나오는 편이에요", "신중하게 고민하고 나서 움직여요"],
  안정: ["안정적이고 익숙한 환경을 선호해요", "변화와 새로운 도전을 즐겨요"],
};

export function PersonalityRadarCard({ ruleSummary }: Props) {
  const scores = useMemo(() => {
    const vd = ruleSummary?.visual_data?.personality_radar;
    if (vd && typeof vd === "object") return vd as Record<Axis, number>;
    return { 감정: 50, 즉흥: 50, 외향: 50, 실행: 50, 안정: 50 } as Record<Axis, number>;
  }, [ruleSummary]);

  const CX = 140;
  const CY = 140;
  const R = 86;
  const N = AXES.length;

  const toXY = (i: number, r: number) => {
    const rad = ((360 / N) * i - 90) * (Math.PI / 180);
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  };

  // intensity = 0~1 (거리를 반지름으로: 중립=중심, 강함=외곽)
  const getIntensity = (ax: Axis) => Math.abs((scores[ax] ?? 50) - 50) / 50;
  const isLeft = (ax: Axis) => (scores[ax] ?? 50) >= 50;
  const getDominant = (ax: Axis) => AXIS_PAIRS[ax][isLeft(ax) ? 0 : 1];

  const getLevel = (intensity: number) => {
    if (intensity > 0.62) return "매우 강함";
    if (intensity > 0.38) return "강함";
    if (intensity > 0.18) return "보통";
    return "중립";
  };

  // 데이터 폴리곤: intensity * R
  const dataPoints = AXES.map((ax, i) => toXY(i, getIntensity(ax) * R));
  const dataPts = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const labelR = R + 40;

  const strongest = AXES.reduce<Axis>(
    (a, b) => (getIntensity(a) >= getIntensity(b) ? a : b),
    AXES[0]
  );

  return (
    <div
      style={{
        width: "100%",
        background: "#fff",
        borderRadius: 16,
        padding: "20px 12px 16px",
        border: "1px solid #E3D9CB",
      }}
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#6B5F4E",
          letterSpacing: "0.08em",
          textAlign: "center",
        }}
      >
        나의 성향 지도
      </p>
      <p
        style={{
          fontSize: 10,
          color: "#A8946A",
          textAlign: "center",
          marginTop: 3,
          marginBottom: 10,
        }}
      >
        중심에서 멀수록 그 성향이 강해요
      </p>

      <svg
        width="100%"
        viewBox="-36 -30 352 348"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", overflow: "visible", maxWidth: 340, margin: "0 auto" }}
      >
        {/* 배경 원 3개 */}
        {[0.33, 0.66, 1].map((ratio, ri) => {
          const bpts = AXES.map((_, i) => {
            const p = toXY(i, R * ratio);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          }).join(" ");
          return (
            <polygon
              key={ri}
              points={bpts}
              fill="none"
              stroke={ri === 2 ? "#D4C9B8" : "#EDE6DC"}
              strokeWidth={ri === 2 ? 1.5 : 1}
              strokeDasharray={ri < 2 ? "3,3" : "0"}
            />
          );
        })}

        {/* 축 선 */}
        {AXES.map((_, i) => {
          const p = toXY(i, R);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={p.x.toFixed(1)}
              y2={p.y.toFixed(1)}
              stroke="#E3D9CB"
              strokeWidth={1}
            />
          );
        })}

        {/* 중심점 (중립) */}
        <circle cx={CX} cy={CY} r={5} fill="#D4C9B8" />

        {/* 데이터 영역 */}
        <polygon
          points={dataPts}
          fill="rgba(139,115,85,0.16)"
          stroke="#8B7355"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* 데이터 점 */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x.toFixed(1)}
            cy={p.y.toFixed(1)}
            r={4}
            fill="#8B7355"
            stroke="#fff"
            strokeWidth={1.5}
          />
        ))}

        {/* 축 라벨: 이 사람의 실제 성향 단어 */}
        {AXES.map((ax, i) => {
          const { x, y } = toXY(i, labelR);
          const label = getDominant(ax);
          const intensity = getIntensity(ax);
          const strong = intensity > 0.38;
          let ta: "middle" | "start" | "end" = "middle";
          if (x < CX - 12) ta = "end";
          else if (x > CX + 12) ta = "start";
          return (
            <text
              key={ax}
              x={x.toFixed(1)}
              y={(y + 4).toFixed(1)}
              textAnchor={ta}
              fontSize={strong ? 11 : 10}
              fontWeight={strong ? 800 : 600}
              fill={strong ? "#5C4A30" : "#8B7355"}
              fontFamily="'Gmarket Sans', sans-serif"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* 바 차트 범례 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          marginTop: 10,
          padding: "0 6px",
        }}
      >
        {AXES.map((ax) => {
          const intensity = getIntensity(ax);
          const dominant = getDominant(ax);
          const level = getLevel(intensity);
          const barPct = Math.round(intensity * 100);
          const strong = intensity > 0.38;
          return (
            <div key={ax} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 46,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5C4A30",
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {dominant}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 7,
                  background: "#EDE6DC",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${barPct}%`,
                    height: "100%",
                    background: strong
                      ? "linear-gradient(90deg, #8B7355, #5C4A30)"
                      : "#C4B8A4",
                    borderRadius: 4,
                  }}
                />
              </div>
              <span
                style={{
                  width: 56,
                  fontSize: 10,
                  color: strong ? "#5C4A30" : "#A8946A",
                  textAlign: "left",
                  flexShrink: 0,
                }}
              >
                {level}
              </span>
            </div>
          );
        })}
      </div>

      {/* 가장 강한 성향 한 줄 설명 */}
      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          background: "#F5F1EA",
          borderRadius: 10,
          border: "1px solid #E3D9CB",
        }}
      >
        <p style={{ fontSize: 11, color: "#5C4A30", lineHeight: 1.65 }}>
          가장 두드러지는 성향은 <strong>{getDominant(strongest)}</strong>이에요.{" "}
          {AXIS_DESC[strongest][isLeft(strongest) ? 0 : 1]}.
        </p>
      </div>
    </div>
  );
}
