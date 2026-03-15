"use client";

import { useState, useEffect } from "react";
import type { RelationshipStyleVisualData } from "../data/relationshipStyleAnalysis";

function getLevel(value: number) {
  if (value >= 80) return { label: "매우 높음", color: "#A78BD4" };
  if (value >= 60) return { label: "높음", color: "#7EB8A0" };
  if (value >= 40) return { label: "보통", color: "#E8C87A" };
  return { label: "낮음", color: "#E89A7A" };
}

export function RelationshipBalanceCard({ data }: { data: RelationshipStyleVisualData }) {
  const [animate, setAnimate] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden mx-auto w-full max-w-[360px]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* 타입 배지 */}
      <div
        style={{
          background: "#f5f7f4",
          border: "1px solid rgba(167,139,212,0.35)",
          borderRadius: "20px",
          padding: "16px 20px",
          marginBottom: "16px",
          textAlign: "center",
          width: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-22px",
            right: "-22px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,212,0.25), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "2px",
            color: "#7a6b9a",
            marginBottom: "4px",
          }}
        >
          나의 관계 유형
        </div>
        <div
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#3d4a3d",
            marginBottom: "4px",
          }}
        >
          {data.type}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#5c6b5c",
            lineHeight: 1.6,
          }}
        >
          {data.typeDesc}
        </div>
      </div>

      {/* 게이지 리스트 */}
      <div
        style={{
          width: "100%",
          background: "#f5f7f4",
          border: "1px solid rgba(107, 138, 122, 0.35)",
          borderRadius: "20px",
          padding: "18px 18px 16px",
          marginBottom: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {data.gauges.map((g, i) => {
          const level = getLevel(g.value);
          const isSelected = selected === i;
          const isLow = g.value < 50;

          return (
            <div
              key={g.key}
              onClick={() => setSelected(isSelected ? null : i)}
              style={{ cursor: "pointer" }}
            >
              {/* 라벨 행 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>{g.emoji}</span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#3d4a3d",
                    }}
                  >
                    {g.label}
                  </span>
                  {isLow && (
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#b87a6a",
                        background: "rgba(232,154,122,0.12)",
                        border: "1px solid rgba(232,154,122,0.35)",
                        borderRadius: "20px",
                        padding: "1px 7px",
                      }}
                    >
                      보완 필요
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      color: level.color,
                      background: `${level.color}18`,
                      padding: "2px 8px",
                      borderRadius: "20px",
                    }}
                  >
                    {level.label}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: g.color,
                      opacity: animate ? 1 : 0,
                      transition: `opacity 0.4s ${0.3 + i * 0.1}s`,
                    }}
                  >
                    {g.value}
                  </span>
                </div>
              </div>

              {/* 게이지 바 */}
              <div
                style={{
                  height: "7px",
                  background: "#e0e8e0",
                  borderRadius: "99px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: animate ? `${g.value}%` : "0%",
                    background: `linear-gradient(90deg, ${g.color}66, ${g.color})`,
                    borderRadius: "99px",
                    transition: `width 1s cubic-bezier(0.25,1,0.5,1) ${0.3 + i * 0.12}s`,
                    boxShadow: `0 0 8px ${g.color}44`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      border: `2px solid ${g.color}`,
                      boxShadow: `0 0 6px ${g.color}55`,
                      opacity: animate ? 1 : 0,
                      transition: `opacity 0.3s ${0.8 + i * 0.1}s`,
                    }}
                  />
                </div>
              </div>

              {/* 펼쳐지는 상세 */}
              {isSelected && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "10px 12px",
                    background: `${g.color}0D`,
                    border: `1px solid ${g.color}33`,
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11.5px",
                      color: "#5c6b5c",
                      lineHeight: 1.7,
                      marginBottom: g.tip ? "6px" : 0,
                    }}
                  >
                    {g.desc}
                  </div>
                  {g.tip && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: g.color,
                        fontWeight: 600,
                      }}
                    >
                      → {g.tip}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 균형 요약 */}
      <div
        style={{
          width: "100%",
          background: "#fdf8f5",
          border: "1px solid rgba(232,154,122,0.45)",
          borderRadius: "20px",
          padding: "14px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "18px", marginTop: "1px" }}>⚡</span>
        <div
          style={{
            fontSize: "12px",
            color: "#5c6b5c",
            lineHeight: 1.8,
          }}
        >
          {data.caution}
        </div>
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "10px",
          color: "#6B8A7A99",
          letterSpacing: "1px",
          textAlign: "center",
        }}
      >
        항목을 탭하면 관계 속에서 드러나는 패턴을 볼 수 있어요
      </div>
    </div>
  );
}

