"use client";

import { useState, useEffect, useRef } from "react";
import type { CharismaVisualData } from "../data/charismaSocialInfluence";

const INIT_ANGLES = [40, 160, 250, 340];
const SPEEDS = [0.18, 0.12, 0.15, 0.1];

const LEVEL_CONFIG: Record<string, { label: string; desc: string }> = {
  S: { label: "S", desc: "압도적" },
  A: { label: "A", desc: "강함" },
  B: { label: "B", desc: "있음" },
  C: { label: "C", desc: "보통" },
  D: { label: "D", desc: "잠재" },
  F: { label: "F", desc: "잠재" },
};

export function CharismaOrbitCard({ data }: { data: CharismaVisualData }) {
  const [angles, setAngles] = useState<number[]>(INIT_ANGLES);
  const [selected, setSelected] = useState<number | null>(null);
  const [animate, setAnimate] = useState(false);
  const rafRef = useRef<number | null>(null);
  const anglesRef = useRef<number[]>(INIT_ANGLES);
  const cx = 160;
  const cy = 160;

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!animate) return;
    const tick = () => {
      anglesRef.current = anglesRef.current.map((a, i) => (a + SPEEDS[i]) % 360);
      setAngles([...anglesRef.current]);
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [animate]);

  const getPos = (angle: number, orbit: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + orbit * Math.cos(rad),
      y: cy + orbit * Math.sin(rad),
    };
  };

  return (
    <div
      className="rounded-2xl overflow-hidden mx-auto w-full max-w-[360px]"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      {/* 헤더 */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "3px",
            color: "#6B6A8A",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          👑 카리스마 분석
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#3d3a4a",
            letterSpacing: "-0.2px",
          }}
        >
          카리스마와 사회적 영향력
        </div>
      </div>

      {/* 궤도 영역 */}
      <div
        style={{
          position: "relative",
          width: "320px",
          height: "320px",
          margin: "0 auto 16px",
          background: "#f5f7f4",
          borderRadius: "24px",
          border: "1px solid rgba(107,138,122,0.35)",
        }}
      >
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <radialGradient id="coreGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#A78BD4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#A78BD4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 궤도 링 */}
          {data.axes.map((ax, i) => (
            <circle
              key={ax.key}
              cx={cx}
              cy={cy}
              r={ax.orbit}
              fill="none"
              stroke={`${ax.color}22`}
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          ))}

          {/* 중심 글로우 */}
          <circle cx={cx} cy={cy} r={44} fill="url(#coreGlow)" />

          {/* 행성들 */}
          {data.axes.map((ax, i) => {
            const pos = getPos(angles[i], ax.orbit);
            const isSelected = selected === i;
            const half = ax.size / 2;
            const levelConf = LEVEL_CONFIG[ax.level] ?? LEVEL_CONFIG["C"];

            return (
              <g
                key={ax.key}
                style={{ cursor: "pointer" }}
                onClick={() => setSelected(isSelected ? null : i)}
              >
                {/* 글로우 */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={half + 6}
                  fill={ax.color}
                  opacity={isSelected ? 0.25 : 0.12}
                />

                {/* 행성 원 */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={half}
                  fill="#ffffff"
                  stroke={ax.color}
                  strokeWidth={isSelected ? 2 : 1.2}
                />

                {/* 이모지 */}
                <text
                  x={pos.x}
                  y={pos.y - 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                >
                  {ax.emoji}
                </text>

                {/* 레벨 */}
                <text
                  x={pos.x}
                  y={pos.y + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight={800}
                  fill={ax.color}
                  fontFamily="Georgia, serif"
                >
                  {levelConf.label}
                </text>
              </g>
            );
          })}

          {/* 중심 코어 */}
          <g>
            <circle
              cx={cx}
              cy={cy}
              r={32}
              fill="#ffffff"
              stroke="#A78BD444"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="20"
            >
              👑
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight={700}
              fill="#A78BD4"
              letterSpacing="1"
            >
              {data.type}
            </text>
          </g>
        </svg>
      </div>

      {/* 선택된 축 상세 또는 2x2 요약 */}
      {selected !== null ? (
        <div
          style={{
            width: "100%",
            background: "#f5f7f4",
            borderRadius: "20px",
            border: `1px solid ${data.axes[selected].color}44`,
            padding: "16px 18px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: `${data.axes[selected].color}15`,
                border: `1px solid ${data.axes[selected].color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                flexShrink: 0,
              }}
            >
              {data.axes[selected].emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#3d3a4a",
                  marginBottom: "4px",
                }}
              >
                {data.axes[selected].label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: data.axes[selected].color,
                    background: `${data.axes[selected].color}18`,
                    padding: "2px 8px",
                    borderRadius: "20px",
                  }}
                >
                  {LEVEL_CONFIG[data.axes[selected].level]?.label ?? data.axes[selected].level}등급
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#6B6A8A",
                  }}
                >
                  {LEVEL_CONFIG[data.axes[selected].level]?.desc ?? "보통"}
                </span>
              </div>
            </div>
            <div style={{ width: "70px" }}>
              <div
                style={{
                  height: "5px",
                  background: "#e0e4f0",
                  borderRadius: "99px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${data.axes[selected].value}%`,
                    background: data.axes[selected].color,
                    borderRadius: "99px",
                    boxShadow: `0 0 8px ${data.axes[selected].color}55`,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: data.axes[selected].color,
                  textAlign: "right",
                  marginTop: "3px",
                }}
              >
                {data.axes[selected].value}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#5c5c7a",
              lineHeight: 1.8,
            }}
          >
            {data.axes[selected].desc}
          </div>
          <div
            onClick={() => setSelected(null)}
            style={{
              marginTop: "10px",
              textAlign: "center",
              fontSize: "10px",
              color: "#6B6A8A99",
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
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "10px",
          }}
        >
          {data.axes.map((ax, i) => (
            <div
              key={ax.key}
              onClick={() => setSelected(i)}
              style={{
                flex: "1 1 calc(50% - 4px)",
                background: "#f5f7f4",
                border: `1px solid ${ax.color}33`,
                borderRadius: "16px",
                padding: "12px 12px 10px",
                cursor: "pointer",
                opacity: animate ? 1 : 0,
                transform: animate ? "translateY(0)" : "translateY(6px)",
                transition: `opacity 0.4s ${0.35 + i * 0.08}s, transform 0.4s ${0.35 + i * 0.08}s`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <span style={{ fontSize: "16px" }}>{ax.emoji}</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: ax.color,
                    background: `${ax.color}18`,
                    padding: "1px 7px",
                    borderRadius: "20px",
                  }}
                >
                  {LEVEL_CONFIG[ax.level]?.label ?? ax.level}
                </span>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#3d3a4a",
                  marginBottom: "4px",
                }}
              >
                {ax.label}
              </div>
              <div
                style={{
                  height: "3px",
                  background: "#e0e4f0",
                  borderRadius: "99px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${ax.value}%`,
                    background: ax.color,
                    borderRadius: "99px",
                    boxShadow: `0 0 6px ${ax.color}55`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 요약 */}
      <div
        style={{
          width: "100%",
          background: "#f5f7f4",
          border: "1px solid rgba(167,139,212,0.35)",
          borderRadius: "16px",
          padding: "12px 16px",
          fontSize: "12px",
          color: "#5c5c7a",
          lineHeight: 1.7,
          textAlign: "center",
        }}
      >
        {data.summary}
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "10px",
          color: "#6B6A8A99",
          letterSpacing: "1px",
          textAlign: "center",
        }}
      >
        행성을 탭하면 영향력이 드러나는 방식을 볼 수 있어요
      </div>
    </div>
  );
}

