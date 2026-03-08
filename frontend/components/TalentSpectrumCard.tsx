"use client";

import { useState, useEffect } from "react";
import type { AptitudeSpectrumData } from "../data/latentTalentAptitude";

export function TalentSpectrumCard({ data }: { data: AptitudeSpectrumData }) {
  const [animate, setAnimate] = useState(false);
  const [dotPos, setDotPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setDotPos({ x: 50, y: 50 });
    setAnimate(false);
    const t = setTimeout(() => {
      setAnimate(true);
      setDotPos(data.position);
    }, 400);
    return () => clearTimeout(t);
  }, [data.position.x, data.position.y]);

  const { position, label, desc, tags, axes, quadrants } = data;

  return (
    <div
      className="rounded-2xl overflow-hidden mx-auto w-full max-w-[360px]"
      style={{
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* 스펙트럼 차트 */}
      <div
        style={{
          width: "100%",
          background: "#13131F",
          border: "1px solid #6B8A7A33",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "16px",
          position: "relative",
        }}
      >
        {/* 축 라벨 — 상하 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "#A78BD4",
              letterSpacing: "1px",
            }}
          >
            ▲ {axes.top}
          </span>
        </div>

        {/* 차트 영역 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* 왼쪽 라벨 */}
          <div
            style={{
              fontSize: "9px",
              color: "#6B8A7A",
              letterSpacing: "0.5px",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              whiteSpace: "nowrap",
              minWidth: "12px",
            }}
          >
            ◀ {axes.left}
          </div>

          {/* 메인 그리드 */}
          <div
            style={{
              flex: 1,
              aspectRatio: "1",
              position: "relative",
              background: "#0F0F1A",
              borderRadius: "12px",
              border: "1px solid #6B8A7A22",
              overflow: "hidden",
            }}
          >
            {/* 사분면 배경 */}
            {[
              { top: 0, left: 0, color: "#A78BD4" },
              { top: 0, right: 0, color: "#7EB8A0" },
              { bottom: 0, left: 0, color: "#6B8A7A" },
              { bottom: 0, right: 0, color: "#E89A7A" },
            ].map((q, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: "50%",
                  height: "50%",
                  background: `${q.color}08`,
                  top: q.top,
                  bottom: q.bottom,
                  left: q.left,
                  right: q.right,
                }}
              />
            ))}

            {/* 십자 축선 */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: "1px",
                background: "#6B8A7A33",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: "1px",
                background: "#6B8A7A33",
              }}
            />

            {/* 사분면 라벨 */}
            {quadrants.map((q, i) => {
              const isTarget =
                (position.x < 50 && position.y < 50 && i === 0) ||
                (position.x >= 50 && position.y < 50 && i === 1) ||
                (position.x < 50 && position.y >= 50 && i === 2) ||
                (position.x >= 50 && position.y >= 50 && i === 3);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${q.x}%`,
                    top: `${q.y}%`,
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    opacity: isTarget ? 1 : 0.35,
                    transition: "opacity 0.8s 0.6s",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: isTarget ? "#E8E0D0" : "#6B8A7A",
                      letterSpacing: "-0.2px",
                      marginBottom: "2px",
                    }}
                  >
                    {q.label}
                  </div>
                  <div
                    style={{
                      fontSize: "8.5px",
                      color: "#6B8A7A88",
                    }}
                  >
                    {q.sub}
                  </div>
                </div>
              );
            })}

            {/* 글로우 링 */}
            <div
              style={{
                position: "absolute",
                left: `${dotPos.x}%`,
                top: `${dotPos.y}%`,
                transform: "translate(-50%, -50%)",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, #A78BD444 0%, transparent 70%)",
                transition:
                  "left 1.2s cubic-bezier(0.34,1.56,0.64,1), top 1.2s cubic-bezier(0.34,1.56,0.64,1)",
                pointerEvents: "none",
              }}
            />

            {/* 메인 포인트 */}
            <div
              style={{
                position: "absolute",
                left: `${dotPos.x}%`,
                top: `${dotPos.y}%`,
                transform: "translate(-50%, -50%)",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#A78BD4",
                boxShadow:
                  "0 0 0 3px #A78BD433, 0 0 16px #A78BD488",
                transition:
                  "left 1.2s cubic-bezier(0.34,1.56,0.64,1), top 1.2s cubic-bezier(0.34,1.56,0.64,1)",
                zIndex: 10,
              }}
            />
          </div>

          {/* 오른쪽 라벨 */}
          <div
            style={{
              fontSize: "9px",
              color: "#6B8A7A",
              letterSpacing: "0.5px",
              writingMode: "vertical-rl",
              whiteSpace: "nowrap",
              minWidth: "12px",
            }}
          >
            {axes.right} ▶
          </div>
        </div>

        {/* 하단 축 라벨 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "8px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "#E89A7A88",
              letterSpacing: "1px",
            }}
          >
            ▼ {axes.bottom}
          </span>
        </div>
      </div>

      {/* 포지션 결과 카드 */}
      <div
        style={{
          width: "100%",
          background: "#1A1428",
          border: "1px solid #A78BD433",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #A78BD444, #A78BD411)",
            border: "1.5px solid #A78BD466",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            flexShrink: 0,
          }}
        >
          🎯
        </div>
        <div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#E8E0D0",
              marginBottom: "4px",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#8A7A9A",
              lineHeight: "1.6",
            }}
          >
            {desc}
          </div>
        </div>
      </div>

      {/* 직무 태그 */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {tags.map((tag, i) => (
          <div
            key={i}
            style={{
              background: "#13131F",
              border: "1px solid #A78BD433",
              borderRadius: "30px",
              padding: "6px 14px",
              fontSize: "12px",
              color: "#A78BD4",
              fontWeight: "500",
              opacity: animate ? 1 : 0,
              transform: animate ? "translateY(0)" : "translateY(6px)",
              transition: `opacity 0.4s ${0.8 + i * 0.08}s, transform 0.4s ${0.8 + i * 0.08}s`,
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
}
