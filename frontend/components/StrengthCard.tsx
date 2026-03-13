"use client";

import { useState, useEffect } from "react";
import type { StrengthWeaknessVisualData } from "../data/strengthWeaknessAnalysis";

const GAUGE_COLORS = ["#7EB8A0", "#A78BD4", "#E8C87A", "#7EB8D4", "#E89A7A"];

function GaugeBar({
  value,
  color,
  delay,
  animate,
}: {
  value: number;
  color: string;
  delay: number;
  animate: boolean;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setWidth(value), delay);
      return () => clearTimeout(t);
    }
  }, [animate, value, delay]);

  return (
    <div
      style={{
        height: "6px",
        background: "#e0e8e0",
        borderRadius: "99px",
        overflow: "hidden",
        flex: 1,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: color,
          borderRadius: "99px",
          transition: "width 1s cubic-bezier(0.25, 1, 0.5, 1)",
          boxShadow: `0 0 8px ${color}88`,
        }}
      />
    </div>
  );
}

export function StrengthCard({ data }: { data: StrengthWeaknessVisualData }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(t);
  }, []);

  const { strengths, weakness } = data;
  const strongest = strengths.length > 0
    ? strengths.reduce((a, b) => (a.value >= b.value ? a : b))
    : null;

  return (
    <div
      className="rounded-2xl overflow-hidden mx-auto w-full max-w-[360px]"
      style={{
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* 강점 카드 */}
      <div
        style={{
          width: "100%",
          background: "#f5f7f4",
          border: "1px solid rgba(107, 138, 122, 0.35)",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            letterSpacing: "3px",
            color: "#5a7a6a",
            textTransform: "uppercase",
            marginBottom: "18px",
          }}
        >
          STRENGTHS
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {strengths.map((s, i) => (
            <div key={s.tenGod}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "15px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "rgba(126, 184, 160, 0.15)",
                    }}
                  >
                    {s.icon}
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#3d4a3d",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color:
                      s.level === "강함"
                        ? "#5a7a6a"
                        : s.level === "보통"
                          ? "#6b7c6b"
                          : "#8a9a8a",
                    opacity: animate ? 1 : 0,
                    transition: `opacity 0.5s ${0.3 + i * 0.15}s`,
                    letterSpacing: "0.3px",
                  }}
                >
                  {s.level}
                </span>
              </div>

              <GaugeBar
                value={s.value}
                color={GAUGE_COLORS[i] ?? GAUGE_COLORS[0]}
                delay={400 + i * 150}
                animate={animate}
              />

              <div
                style={{
                  fontSize: "14px",
                  color: "#5c6b5c",
                  marginTop: "5px",
                  letterSpacing: "0.2px",
                }}
              >
                {s.desc}
              </div>
            </div>
          ))}
        </div>

        {/* 상대 강도 요약: 숫자 없이 "가장 잘 발휘되는 영역" / "보완할 영역"만 안내 */}
        <div
          style={{
            marginTop: "22px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(107, 138, 122, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {strongest && (
            <div
              style={{
                fontSize: "14px",
                color: "#5c6b5c",
                letterSpacing: "0.2px",
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: "#5a7a6a", fontWeight: 600 }}>잘 발휘되는 영역</span>
              {" · "}
              {strongest.label}
            </div>
          )}
          <div
            style={{
              fontSize: "11px",
              color: "#5c6b5c",
              letterSpacing: "0.2px",
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: "#b87a6a", fontWeight: 600 }}>보완하면 좋은 영역</span>
            {" · "}
            {weakness.label}
          </div>
        </div>
      </div>

      {/* 보완 포인트 카드 */}
      <div
        style={{
          width: "100%",
          background: "#fdf8f5",
          border: "1px solid rgba(232, 154, 122, 0.45)",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
          <div
        style={{
          fontSize: "12px",
            letterSpacing: "3px",
            color: "#b87a6a",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          GROWTH POINT
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "20px", marginTop: "2px" }}>
            {weakness.icon}
          </span>
          <div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#3d4a3d",
                marginBottom: "8px",
              }}
            >
              {weakness.label}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#5c6b5c",
                lineHeight: 1.8,
                marginBottom: "12px",
              }}
            >
              {weakness.desc}
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(232, 154, 122, 0.15)",
                border: "1px solid rgba(232, 154, 122, 0.45)",
                borderRadius: "30px",
                padding: "5px 12px",
              }}
            >
              <span style={{ fontSize: "12px", color: "#b87a6a" }}>→</span>
              <span
                style={{
                  fontSize: "13px",
                  color: "#a86a5a",
                  fontWeight: 600,
                  letterSpacing: "0.3px",
                }}
              >
                {weakness.tip}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
