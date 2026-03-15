"use client";

import { useState, useEffect } from "react";
import type { OhaengVisualData, OhaengElementItem } from "../data/elementDistributionAnalysis";

const STATUS_COLOR: Record<string, string> = {
  "취약": "#E89A7A",
  "약함": "#E8B89A",
  "보통": "#E8C87A",
  "강함": "#7EB8A0",
  "매우 강함": "#C8C0A8",
  "과다": "#A78BD4",
};

function getPentagonPoints(
  cx: number,
  cy: number,
  r: number,
  offset = -90
): Array<{ x: number; y: number }> {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = ((offset + i * 72) * Math.PI) / 180;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

function pointsToStr(pts: Array<{ x: number; y: number }>): string {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

export function OhaengBalanceCard({ data }: { data: OhaengVisualData }) {
  const [animate, setAnimate] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 400);
    return () => clearTimeout(t);
  }, []);

  const cx = 130;
  const cy = 130;
  const maxR = 90;
  const outerPts = getPentagonPoints(cx, cy, maxR);
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const { elements } = data;

  const dataPts = elements.map((el, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    const capped = Math.min(el.count, el.max);
    const r = animate ? (capped / el.max) * maxR : 0;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const labelPts = getPentagonPoints(cx, cy, maxR + 22);

  return (
    <div
      className="rounded-2xl overflow-hidden mx-auto w-full max-w-[360px]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* 오각형 차트 */}
      <div
        style={{
          background: "#f5f7f4",
          border: "1px solid rgba(107, 138, 122, 0.35)",
          borderRadius: "20px",
          padding: "16px",
          marginBottom: "16px",
          width: "100%",
        }}
      >
        <svg
          width="260"
          height="260"
          viewBox="0 0 260 260"
          style={{ display: "block", margin: "0 auto" }}
        >
          {gridLevels.map((level, li) => {
            const pts = getPentagonPoints(cx, cy, maxR * level);
            return (
              <polygon
                key={li}
                points={pointsToStr(pts)}
                fill="none"
                stroke="rgba(107, 138, 122, 0.35)"
                strokeWidth="1"
              />
            );
          })}

          {outerPts.map((pt, i) => (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={pt.x}
              y2={pt.y}
              stroke="rgba(107, 138, 122, 0.28)"
              strokeWidth="1"
            />
          ))}

          <polygon
            points={pointsToStr(dataPts)}
            fill="#A78BD422"
            stroke="#A78BD4"
            strokeWidth="1.5"
            style={{
              transition: "all 1.2s cubic-bezier(0.34,1.2,0.64,1)",
            }}
          />

          {dataPts.map((pt, i) => {
            const el = elements[i];
            const isSelected = selected === i;
            return (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="10"
                  fill={el.glow}
                  opacity={isSelected ? 1 : 0.4}
                  style={{ transition: "all 0.8s" }}
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill={el.color}
                  stroke="#f0f4f0"
                  strokeWidth="1.5"
                  style={{
                    cursor: "pointer",
                    filter: isSelected ? `drop-shadow(0 0 6px ${el.color})` : "none",
                    transition: "all 0.3s",
                  }}
                  onClick={() => setSelected(selected === i ? null : i)}
                />
              </g>
            );
          })}

          {elements.map((el: OhaengElementItem, i: number) => {
            const pt = labelPts[i];
            const isSelected = selected === i;
            return (
              <g
                key={i}
                style={{ cursor: "pointer" }}
                onClick={() => setSelected(selected === i ? null : i)}
              >
                <rect
                  x={pt.x - 16}
                  y={pt.y - 13}
                  width="32"
                  height="26"
                  rx="8"
                  fill={isSelected ? `${el.color}33` : "#eef4ee"}
                  stroke={isSelected ? el.color : "rgba(107, 138, 122, 0.4)"}
                  strokeWidth="1"
                  style={{ transition: "all 0.3s" }}
                />
                <text
                  x={pt.x}
                  y={pt.y - 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill={isSelected ? el.color : "#3d4a3d"}
                  fontFamily="var(--font-sans)"
                  style={{ transition: "fill 0.3s" }}
                >
                  {el.label}
                </text>
                <text
                  x={pt.x}
                  y={pt.y + 9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill={el.count === 0 ? "#b87a6a" : "#5c6b5c"}
                  fontFamily="var(--font-sans)"
                >
                  {el.count}개
                </text>
              </g>
            );
          })}

        </svg>

        <div
          style={{
            marginTop: "4px",
            textAlign: "center",
            fontSize: "10px",
            color: "#5c6b5c",
            letterSpacing: "1px",
          }}
        >
          오행 밸런스
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "4px",
            flexWrap: "wrap",
          }}
        >
          {Object.entries(STATUS_COLOR).map(([k, v]) => (
            <div
              key={k}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: v,
                }}
              />
              <span style={{ fontSize: "9px", color: "#5c6b5c" }}>{k}</span>
            </div>
          ))}
        </div>
      </div>

      {selected !== null ? (
        <div
          style={{
            width: "100%",
            background: "#f5f7f4",
            border: `1px solid ${elements[selected].color}55`,
            borderRadius: "20px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: elements[selected].glow,
                border: `1.5px solid ${elements[selected].color}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
                color: elements[selected].color,
              }}
            >
              {elements[selected].label}
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#3d4a3d",
                }}
              >
                {elements[selected].key}({elements[selected].label}) · {elements[selected].count}개
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: STATUS_COLOR[elements[selected].status],
                }}
              >
                {elements[selected].status} · {elements[selected].meaning}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#5c6b5c",
              lineHeight: "1.7",
              marginBottom: "12px",
            }}
          >
            {elements[selected].desc}
          </div>
          <div
            style={{
              background: `${elements[selected].color}11`,
              border: `1px solid ${elements[selected].color}33`,
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "11.5px",
              color: elements[selected].color,
              lineHeight: "1.6",
            }}
          >
            → {elements[selected].tip}
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelected(null)}
            onKeyDown={(e) => e.key === "Enter" && setSelected(null)}
            style={{
              marginTop: "12px",
              textAlign: "center",
              fontSize: "10px",
              color: "#6B8A7A99",
              cursor: "pointer",
              letterSpacing: "1px",
            }}
          >
            닫기
          </div>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {elements.map((el, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => e.key === "Enter" && setSelected(i)}
              style={{
                background: "#f5f7f4",
                border: `1px solid ${el.color}44`,
                borderRadius: "14px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                opacity: animate ? 1 : 0,
                transform: animate ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 0.4s ${0.6 + i * 0.1}s, transform 0.4s ${0.6 + i * 0.1}s`,
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: el.glow,
                  border: `1px solid ${el.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: el.color,
                  flexShrink: 0,
                }}
              >
                {el.label}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                    color: "#3d4a3d",
                  }}
                >
                  {el.key} · {el.count}개
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      color: STATUS_COLOR[el.status],
                      background: `${STATUS_COLOR[el.status]}18`,
                      padding: "2px 8px",
                      borderRadius: "20px",
                    }}
                  >
                    {el.status}
                  </span>
                </div>
                <div
                  style={{
                    height: "3px",
                    background: "#e0e8e0",
                    borderRadius: "99px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: animate ? `${(Math.min(el.count, el.max) / el.max) * 100}%` : "0%",
                      background: el.color,
                      borderRadius: "99px",
                      transition: `width 1s cubic-bezier(0.25,1,0.5,1) ${0.6 + i * 0.1}s`,
                      boxShadow: `0 0 6px ${el.color}66`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: "#6B8A7A99",
              marginTop: "4px",
              letterSpacing: "1px",
            }}
          >
            항목을 탭하면 상세 보완법을 볼 수 있어요
          </div>
        </div>
      )}
    </div>
  );
}
