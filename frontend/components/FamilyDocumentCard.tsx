"use client";

import { useState, useEffect } from "react";
import type { AncestorVisualData } from "../data/ancestorParentFortune";

export function FamilyDocumentCard({ data }: { data: AncestorVisualData }) {
  const [animate, setAnimate] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(t);
  }, []);

  const { family, genes, closing } = data;

  return (
    <div
      className="rounded-2xl overflow-hidden mx-auto w-full max-w-[360px]"
      style={{ fontFamily: "'Georgia', 'Nanum Myeongjo', serif" }}
    >
      {/* 헤더 */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "3px",
            color: "#7a6b4a",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          👪 가문 분석
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#3d3a2a",
            letterSpacing: "-0.2px",
          }}
        >
          내 안에 흐르는 가장 단단한 유전자
        </div>
      </div>

      {/* 문서 카드 */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(170deg, #f9f4e8 0%, #f3ead6 100%)",
          border: "1px solid rgba(200,168,88,0.45)",
          borderRadius: "12px",
          padding: "24px 20px 22px",
          position: "relative",
          boxShadow: "0 10px 26px rgba(0,0,0,0.08)",
        }}
      >
        {/* 문서 모서리 장식 */}
        {[
          { top: "10px", left: "10px", borderTop: "1px solid #C8A85866", borderLeft: "1px solid #C8A85866" },
          { top: "10px", right: "10px", borderTop: "1px solid #C8A85866", borderRight: "1px solid #C8A85866" },
          { bottom: "10px", left: "10px", borderBottom: "1px solid #C8A85866", borderLeft: "1px solid #C8A85866" },
          { bottom: "10px", right: "10px", borderBottom: "1px solid #C8A85866", borderRight: "1px solid #C8A85866" },
        ].map((style, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "14px",
              height: "14px",
              ...style,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* 문서 헤더 */}
        <div
          style={{
            textAlign: "center",
            paddingBottom: "16px",
            borderBottom: "1px solid rgba(200,168,88,0.35)",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              letterSpacing: "3px",
              color: "#C8A85888",
              marginBottom: "6px",
            }}
          >
            FAMILY · HERITAGE · RECORD
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#3d3a2a",
              letterSpacing: "2px",
              marginBottom: "4px",
            }}
          >
            {family}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              alignItems: "center",
            }}
          >
            {["·", "·", "·"].map((d, i) => (
              <div
                key={i}
                style={{
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: "#C8A85866",
                }}
              />
            ))}
          </div>
        </div>

        {/* 유전자 항목들 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {genes.map((g, i) => {
            const isSelected = selected === i;
            const isLast = i === genes.length - 1;
            return (
              <div key={i}>
                <div
                  onClick={() => setSelected(isSelected ? null : i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 0",
                    cursor: "pointer",
                    opacity: animate ? 1 : 0,
                    transform: animate ? "translateX(0)" : "translateX(-6px)",
                    transition: `opacity 0.45s ${0.25 + i * 0.1}s, transform 0.45s ${0.25 + i * 0.1}s`,
                  }}
                >
                  {/* 아이콘 */}
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: `${g.color}15`,
                      border: `1px solid ${g.color}55`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      flexShrink: 0,
                      boxShadow: isSelected ? `0 0 10px ${g.color}55` : "none",
                      transition: "box-shadow 0.3s",
                    }}
                  >
                    {g.icon}
                  </div>

                  {/* 텍스트 */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: isSelected ? g.color : "#3d3a2a",
                        marginBottom: "2px",
                        transition: "color 0.3s",
                      }}
                    >
                      {g.label}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#8A7A5A",
                        letterSpacing: "1px",
                      }}
                    >
                      {g.keyword}
                    </div>
                  </div>

                  {/* 화살표 */}
                  <div
                    style={{
                      fontSize: "10px",
                      color: isSelected ? g.color : "#8A7A5A55",
                      transition: "all 0.3s",
                      transform: isSelected ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  >
                    ▶
                  </div>
                </div>

                {/* 펼쳐지는 설명 */}
                {isSelected && (
                  <div
                    style={{
                      margin: "0 0 12px 48px",
                      padding: "10px 12px",
                      background: `${g.color}0D`,
                      border: `1px solid ${g.color}33`,
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#8A7A5A",
                      lineHeight: 1.8,
                    }}
                  >
                    {g.desc}
                  </div>
                )}

                {/* 구분선 */}
                {!isLast && (
                  <div
                    style={{
                      height: "1px",
                      background: "linear-gradient(90deg, transparent, #C8A85833, transparent)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 문서 하단 */}
        <div
          style={{
            marginTop: "18px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(200,168,88,0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            {["—", "◆", "—"].map((s, i) => (
              <span
                key={i}
                style={{
                  fontSize: i === 1 ? "8px" : "10px",
                  color: "#C8A85866",
                }}
              >
                {s}
              </span>
            ))}
          </div>

          <div
            style={{
              fontSize: "11.5px",
              color: "#8A7A5A",
              lineHeight: 1.9,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {closing}
          </div>
        </div>

        {/* 워터마크 */}
        <div
          style={{
            position: "absolute",
            bottom: "14px",
            right: "18px",
            fontSize: "9px",
            color: "#C8A85833",
            letterSpacing: "2px",
          }}
        >
          HERITAGE
        </div>
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "10px",
          color: "#6B5A3A88",
          letterSpacing: "1px",
          textAlign: "center",
        }}
      >
        항목을 탭하면 가문이 남긴 패턴을 볼 수 있어요
      </div>
    </div>
  );
}

