"use client";
import { useMemo } from "react";

interface Props {
  ruleSummary: Record<string, any>;
}

const AXES = ["신경성", "외향성", "개방성", "우호성", "성실성"] as const;
type Axis = (typeof AXES)[number];

const AXIS_DESC: Record<Axis, [string, string]> = {
  신경성: ["감정이 섬세하고 상황에 민감하게 반응해요", "감정적으로 안정적이고 웬만해선 흔들리지 않아요"],
  외향성: ["사람들과 함께할 때 에너지가 올라가요", "혼자만의 시간이 있어야 회복이 돼요"],
  개방성: ["새로운 것에 호기심이 많고 창의적이에요", "익숙하고 검증된 것을 선호해요"],
  우호성: ["배려심이 깊고 협력하는 걸 좋아해요", "자기 방식을 고집하는 편이에요"],
  성실성: ["계획적이고 맡은 일을 끝까지 완수해요", "틀에 얽매이지 않고 유연하게 행동해요"],
};

interface MbtiData {
  E: number; I: number;
  N: number; S: number;
  F: number; T: number;
  J: number; P: number;
  type: string;
}

const MBTI_DIMS: Array<{ left: keyof MbtiData; right: keyof MbtiData; leftColor: string; rightColor: string }> = [
  { left: "E", right: "I", leftColor: "#E8865A", rightColor: "#5A8BE8" },
  { left: "N", right: "S", leftColor: "#9B59B6", rightColor: "#27AE60" },
  { left: "F", right: "T", leftColor: "#E8595A", rightColor: "#2E86AB" },
  { left: "J", right: "P", leftColor: "#8B7355", rightColor: "#A8946A" },
];

export function PersonalityRadarCard({ ruleSummary }: Props) {
  const scores = useMemo(() => {
    const vd = ruleSummary?.visual_data?.personality_radar;
    if (vd && typeof vd === "object") return vd as Record<Axis, number>;
    return { 신경성: 50, 외향성: 50, 개방성: 50, 우호성: 50, 성실성: 50 } as Record<Axis, number>;
  }, [ruleSummary]);

  const mbti = useMemo<MbtiData | null>(() => {
    const m = ruleSummary?.visual_data?.mbti;
    if (m && typeof m === "object" && m.type) return m as MbtiData;
    return null;
  }, [ruleSummary]);

  const CX = 140;
  const CY = 140;
  const R = 86;
  const N = AXES.length;

  const toXY = (i: number, r: number) => {
    const rad = ((360 / N) * i - 90) * (Math.PI / 180);
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  };

  const getIntensity = (ax: Axis) => Math.abs((scores[ax] ?? 50) - 50) / 50;

  const getLevel = (intensity: number) => {
    if (intensity > 0.62) return "매우 강함";
    if (intensity > 0.38) return "강함";
    if (intensity > 0.18) return "보통";
    return "중립";
  };

  const dataPoints = AXES.map((ax, i) => toXY(i, getIntensity(ax) * R));
  const dataPts = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const labelR = R + 40;

  const strongest = AXES.reduce<Axis>(
    (a, b) => (getIntensity(a) >= getIntensity(b) ? a : b),
    AXES[0]
  );
  const strongestHigh = (scores[strongest] ?? 50) >= 50;

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
      <p style={{ fontSize: 12, fontWeight: 700, color: "#6B5F4E", letterSpacing: "0.08em", textAlign: "center" }}>
        나의 성향 지도
      </p>
      <p style={{ fontSize: 10, color: "#A8946A", textAlign: "center", marginTop: 3, marginBottom: 10 }}>
        중심에서 멀수록 그 성향이 강해요
      </p>

      <svg
        width="100%"
        viewBox="-36 -30 352 348"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", overflow: "visible", maxWidth: 340, margin: "0 auto" }}
      >
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

        {AXES.map((_, i) => {
          const p = toXY(i, R);
          return (
            <line key={i} x1={CX} y1={CY} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="#E3D9CB" strokeWidth={1} />
          );
        })}

        <circle cx={CX} cy={CY} r={5} fill="#D4C9B8" />

        <polygon
          points={dataPts}
          fill="rgba(139,115,85,0.16)"
          stroke="#8B7355"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={4} fill="#8B7355" stroke="#fff" strokeWidth={1.5} />
        ))}

        {/* 축 라벨: Big Five 차원명 */}
        {AXES.map((ax, i) => {
          const { x, y } = toXY(i, labelR);
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
              {ax}
            </text>
          );
        })}
      </svg>

      {/* 바 차트 범례 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 10, padding: "0 6px" }}>
        {AXES.map((ax) => {
          const intensity = getIntensity(ax);
          const level = getLevel(intensity);
          const barPct = Math.round(intensity * 100);
          const strong = intensity > 0.38;
          return (
            <div key={ax} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 40, fontSize: 10, fontWeight: 600, color: "#A8946A", textAlign: "right", flexShrink: 0 }}>
                {ax}
              </span>
              <div style={{ flex: 1, height: 7, background: "#EDE6DC", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${barPct}%`,
                    height: "100%",
                    background: strong ? "linear-gradient(90deg, #8B7355, #5C4A30)" : "#C4B8A4",
                    borderRadius: 4,
                  }}
                />
              </div>
              <span style={{ width: 52, fontSize: 10, color: strong ? "#5C4A30" : "#A8946A", textAlign: "left", flexShrink: 0 }}>
                {level}
              </span>
            </div>
          );
        })}
      </div>

      {/* 가장 강한 성향 설명 */}
      <div style={{ marginTop: 12, padding: "10px 12px", background: "#F5F1EA", borderRadius: 10, border: "1px solid #E3D9CB" }}>
        <p style={{ fontSize: 11, color: "#5C4A30", lineHeight: 1.65 }}>
          가장 두드러지는 성향은 <strong>{strongest}</strong>이에요.{" "}
          {AXIS_DESC[strongest][strongestHigh ? 0 : 1]}.
        </p>
      </div>

      {/* MBTI 경향 섹션 */}
      {mbti && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #E3D9CB" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#6B5F4E", letterSpacing: "0.08em", textAlign: "center" }}>
            MBTI 경향
          </p>
          <p style={{ fontSize: 10, color: "#A8946A", textAlign: "center", marginTop: 3, marginBottom: 12 }}>
            사주 오행에서 추정한 성격 유형 경향
          </p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ display: "inline-flex", gap: 4, background: "#3A3A3A", borderRadius: 12, padding: "10px 20px" }}>
              {mbti.type.split("").map((ch, i) => (
                <span key={i} style={{ fontSize: 22, fontWeight: 800, color: "#F5F1EA", letterSpacing: "0.05em" }}>
                  {ch}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 4px" }}>
            {MBTI_DIMS.map(({ left, right, leftColor, rightColor }) => {
              const leftPct = mbti[left] as number;
              const rightPct = mbti[right] as number;
              const dominant = leftPct >= rightPct ? left : right;
              return (
                <div key={String(left)}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: dominant === left ? 800 : 500, color: dominant === left ? leftColor : "#A8946A" }}>
                      {String(left)} {leftPct}%
                    </span>
                    <span style={{ fontSize: 12, fontWeight: dominant === right ? 800 : 500, color: dominant === right ? rightColor : "#A8946A" }}>
                      {rightPct}% {String(right)}
                    </span>
                  </div>
                  <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "#EDE6DC" }}>
                    <div style={{ width: `${leftPct}%`, background: leftColor, borderRadius: "4px 0 0 4px", opacity: dominant === left ? 1 : 0.45 }} />
                    <div style={{ width: `${rightPct}%`, background: rightColor, borderRadius: "0 4px 4px 0", opacity: dominant === right ? 1 : 0.45 }} />
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 10, color: "#C4B8A4", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
            * MBTI 공식 검사 결과와 다를 수 있어요
          </p>
        </div>
      )}
    </div>
  );
}
