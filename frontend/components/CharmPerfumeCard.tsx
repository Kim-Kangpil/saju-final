"use client";

import { useState, useEffect } from "react";
import type { CharmVisualData } from "../data/charmPointAnalysis";

export function CharmPerfumeCard({ data }: { data: CharmVisualData }) {
  const [animate, setAnimate] = useState(false);
  const [openNote, setOpenNote] = useState<number | null>(null);
  const [bubbles, setBubbles] = useState<
    { id: number; x: number; y: number; size: number; duration: number; delay: number; color: string }[]
  >([]);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 300);
    setBubbles(
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 20 + Math.random() * 60,
        size: 4 + Math.random() * 8,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3,
        color: ["#E8C87A", "#A78BD4", "#7EB8A0", "#E89A7A"][Math.floor(Math.random() * 4)],
      }))
    );
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden mx-auto w-full max-w-[320px]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* 헤더 */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "3px",
            color: "#8A6A7A",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          ⚡ 매력 분석
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#3d3a4a",
            letterSpacing: "-0.2px",
          }}
        >
          사람들이 빠지는 나의 매력포인트
        </div>
      </div>

      {/* 향수병 카드 */}
      <div
        style={{
          width: "100%",
          position: "relative",
          marginBottom: "14px",
        }}
      >
        {/* 향수병 뚜껑 */}
        <div
          style={{
            width: "56px",
            height: "18px",
            background: "linear-gradient(180deg, #f1e4fa 0%, #e1d0f0 100%)",
            border: "1px solid rgba(200,168,200,0.4)",
            borderBottom: "none",
            borderRadius: "4px 4px 0 0",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "18px",
              height: "3px",
              background: "#C8A8C8",
              borderRadius: "2px",
            }}
          />
        </div>

        {/* 병목 */}
        <div
          style={{
            width: "40px",
            height: "10px",
            background: "linear-gradient(180deg, #f5ecff 0%, #e6d8f5 100%)",
            border: "1px solid rgba(200,168,200,0.4)",
            borderBottom: "none",
            margin: "0 auto",
          }}
        />

        {/* 향수병 본체 */}
        <div
          style={{
            background: "linear-gradient(160deg, #f7f0ff 0%, #f1e6ff 50%, #f7f0ff 100%)",
            border: "1px solid rgba(200,168,200,0.45)",
            borderRadius: "16px",
            padding: "22px 20px 20px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
            minHeight: "320px",
          }}
        >
          {/* 떠다니는 버블 */}
          {bubbles.map((b) => (
            <div
              key={b.id}
              style={{
                position: "absolute",
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                borderRadius: "50%",
                background: `${b.color}22`,
                border: `1px solid ${b.color}44`,
                animation: `float ${b.duration}s ease-in-out ${b.delay}s infinite`,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* 병 내부 그라디언트 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 30% 20%, rgba(167,139,212,0.16) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {/* 향수 이름 */}
          <div
            style={{
              textAlign: "center",
              paddingBottom: "16px",
              borderBottom: "1px solid rgba(200,168,200,0.35)",
              marginBottom: "16px",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                letterSpacing: "3px",
                color: "#C8A8C8",
                marginBottom: "6px",
              }}
            >
              CHARM · PERFUME · EDITION
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#3d3a4a",
                letterSpacing: "1px",
                marginBottom: "4px",
              }}
            >
              {data.name}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#A78BD4",
                fontStyle: "italic",
                letterSpacing: "2px",
              }}
            >
              {data.subtitle}
            </div>
          </div>

          {/* 노트 3단계 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {data.notes.map((note, i) => {
              const isOpen = openNote === i;
              return (
                <div key={note.grade}>
                  <div
                    onClick={() => setOpenNote(isOpen ? null : i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      cursor: "pointer",
                      opacity: animate ? 1 : 0,
                      transform: animate ? "translateY(0)" : "translateY(6px)",
                      transition: `opacity 0.45s ${0.3 + i * 0.12}s, transform 0.45s ${0.3 + i * 0.12}s`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          fontSize: "8px",
                          fontWeight: 700,
                          color: note.color,
                          background: `${note.color}18`,
                          border: `1px solid ${note.color}44`,
                          borderRadius: "4px",
                          padding: "2px 6px",
                          letterSpacing: "1px",
                          minWidth: "44px",
                          textAlign: "center",
                        }}
                      >
                        {note.grade}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: isOpen ? note.color : "#3d3a4a",
                            transition: "color 0.3s",
                          }}
                        >
                          {note.label}
                        </div>
                        {!isOpen && (
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#8A7A8A",
                              marginTop: "2px",
                            }}
                          >
                            {note.items.map((it) => it.keyword).join(" · ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: isOpen ? note.color : "#8A7A8A55",
                        transition: "all 0.3s",
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    >
                      ▶
                    </div>
                  </div>

                  {isOpen && (
                    <div
                      style={{
                        paddingBottom: "10px",
                        animation: "fadeSlide 0.2s ease",
                      }}
                    >
                      {note.items.map((item, j) => (
                        <div
                          key={j}
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-start",
                            padding: "8px 10px",
                            marginBottom: "6px",
                            background: `${note.color}0D`,
                            border: `1px solid ${note.color}22`,
                            borderRadius: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: note.color,
                              marginTop: "5px",
                              flexShrink: 0,
                              boxShadow: `0 0 6px ${note.color}`,
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: note.color,
                                marginBottom: "3px",
                              }}
                            >
                              {item.keyword}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#8A7A8A",
                                lineHeight: 1.6,
                              }}
                            >
                              {item.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {i < data.notes.length - 1 && (
                    <div
                      style={{
                        height: "1px",
                        background:
                          "linear-gradient(90deg, transparent, rgba(200,168,200,0.25), transparent)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 하단 시그니처 */}
          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(200,168,200,0.25)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              {data.notes.map((n) => (
                <div
                  key={n.grade}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: n.color,
                    opacity: 0.7,
                    boxShadow: `0 0 6px ${n.color}`,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#8A7A8A",
                lineHeight: 1.8,
                fontStyle: "italic",
              }}
            >
              {data.summary}
            </div>
          </div>

          {/* 워터마크 */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              right: "14px",
              fontSize: "8px",
              color: "#C8A8C833",
              letterSpacing: "2px",
            }}
          >
            CHARM
          </div>
        </div>
      </div>

      {/* 핵심 매력 문장 */}
      <div
        style={{
          width: "100%",
          background: "#f5f7f4",
          border: "1px solid rgba(167,139,212,0.35)",
          borderRadius: "16px",
          padding: "12px 14px",
          fontSize: "12px",
          color: "#5c5c7a",
          lineHeight: 1.8,
          textAlign: "center",
        }}
      >
        {data.strength}
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "10px",
          color: "#6B5A6A99",
          letterSpacing: "1px",
          textAlign: "center",
        }}
      >
        노트를 탭하면 상세 매력을 볼 수 있어요
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-10px) scale(1.05); opacity: 1; }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

