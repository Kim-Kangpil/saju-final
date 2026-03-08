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
        background: "#1E1E2E",
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
  const avgScore =
    strengths.length > 0
      ? Math.round(
          strengths.reduce((a, s) => a + s.value, 0) / strengths.length
        )
      : 0;

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
          background: "#13131F",
          border: "1px solid #6B8A7A33",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "3px",
            color: "#7EB8A0",
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
                  <span style={{ fontSize: "15px" }}>{s.icon}</span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#E8E0D0",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: GAUGE_COLORS[i] ?? GAUGE_COLORS[0],
                    opacity: animate ? 1 : 0,
                    transition: `opacity 0.5s ${0.3 + i * 0.15}s`,
                  }}
                >
                  {s.value}
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
                  fontSize: "11px",
                  color: "#6B7A72",
                  marginTop: "5px",
                  letterSpacing: "0.2px",
                }}
              >
                {s.desc}
              </div>
            </div>
          ))}
        </div>

        {/* 종합 강점 지수 */}
        <div
          style={{
            marginTop: "22px",
            paddingTop: "16px",
            borderTop: "1px solid #6B8A7A22",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "#6B8A7A",
              letterSpacing: "1px",
            }}
          >
            종합 강점 지수
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {strengths.map((s, i) => (
              <div
                key={s.tenGod}
                style={{
                  width: "4px",
                  height: `${12 + (s.value / 100) * 16}px`,
                  background: GAUGE_COLORS[i] ?? GAUGE_COLORS[0],
                  borderRadius: "2px",
                  opacity: animate ? 0.85 : 0,
                  transition: `opacity 0.5s ${1.2 + i * 0.1}s, height 0.8s`,
                }}
              />
            ))}
            <span
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#E8E0D0",
                marginLeft: "6px",
              }}
            >
              {avgScore}
            </span>
          </div>
        </div>
      </div>

      {/* 보완 포인트 카드 */}
      <div
        style={{
          width: "100%",
          background: "#1A1020",
          border: "1px solid #E89A7A33",
          borderRadius: "20px",
          padding: "20px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "3px",
            color: "#E89A7A",
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
                fontSize: "13px",
                fontWeight: 600,
                color: "#E8E0D0",
                marginBottom: "8px",
              }}
            >
              {weakness.label}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#8A7A72",
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
                background: "#E89A7A18",
                border: "1px solid #E89A7A44",
                borderRadius: "30px",
                padding: "5px 12px",
              }}
            >
              <span style={{ fontSize: "10px" }}>→</span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#E89A7A",
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
