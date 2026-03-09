"use client";

import { useState, useRef } from "react";
import type { TenGodAbilityCardsData } from "../data/tenGodAbilityAnalysis";

export function TenGodAbilityCards({ data }: { data: TenGodAbilityCardsData }) {
  const [current, setCurrent] = useState(0);
  const startX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCurrent((c) => Math.min(c + 1, data.cards.length - 1));
      else setCurrent((c) => Math.max(c - 1, 0));
    }
    startX.current = null;
  };

  const card = data.cards[current];

  return (
    <div
      className="rounded-2xl overflow-hidden mx-auto w-full max-w-[320px]"
      style={{
        fontFamily: "'Georgia', serif",
        userSelect: "none",
      }}
    >
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "100%",
          background: card.bg,
          border: `1.5px solid ${card.accent}44`,
          borderRadius: "28px",
          padding: "32px 28px",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 20px 60px ${card.accent}18`,
          transition: "all 0.4s cubic-bezier(0.34,1.2,0.64,1)",
          minHeight: "340px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${card.glow} 0%, transparent 70%)`,
            pointerEvents: "none",
            transition: "background 0.4s",
          }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: `${card.accent}18`,
            border: `1px solid ${card.accent}44`,
            borderRadius: "30px",
            padding: "4px 12px",
            width: "fit-content",
          }}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: card.accent,
              letterSpacing: "2px",
            }}
          >
            {card.tag}
          </span>
        </div>

        <div>
          <div style={{ fontSize: "42px", marginBottom: "10px", lineHeight: 1 }}>
            {card.emoji}
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#3d4a3d",
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
              transition: "color 0.4s",
            }}
          >
            {card.ability}
          </div>
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#5c6b5c",
            lineHeight: "1.8",
            flex: 1,
          }}
        >
          {card.desc}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {card.fields.map((f, i) => (
            <div
              key={i}
              style={{
                background: `${card.accent}15`,
                border: `1px solid ${card.accent}33`,
                borderRadius: "20px",
                padding: "5px 12px",
                fontSize: "11px",
                color: card.accent,
                fontWeight: 600,
              }}
            >
              {f}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "24px",
            fontSize: "11px",
            color: card.accent,
            fontWeight: 600,
            letterSpacing: "1px",
          }}
        >
          {String(current + 1).padStart(2, "0")} / {String(data.cards.length).padStart(2, "0")}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "24px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {data.cards.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`카드 ${i + 1}`}
            style={{
              width: i === current ? "24px" : "6px",
              height: "6px",
              borderRadius: "99px",
              background: i === current ? card.accent : "#6B8A7A33",
              transition: "all 0.3s cubic-bezier(0.34,1.2,0.64,1)",
              cursor: "pointer",
              border: "none",
              padding: 0,
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "20px",
          justifyContent: "center",
        }}
      >
        {["←", "→"].map((arrow, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (i === 0) setCurrent((c) => Math.max(c - 1, 0));
              else setCurrent((c) => Math.min(c + 1, data.cards.length - 1));
            }}
            disabled={
              (i === 0 && current === 0) || (i === 1 && current === data.cards.length - 1)
            }
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#f5f7f4",
              border: `1px solid ${card.accent}55`,
              color:
                i === 0
                  ? current === 0
                    ? "#6B8A7A33"
                    : card.accent
                  : current === data.cards.length - 1
                    ? "#6B8A7A33"
                    : card.accent,
              fontSize: "16px",
              cursor:
                (i === 0 && current === 0) || (i === 1 && current === data.cards.length - 1)
                  ? "default"
                  : "pointer",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {arrow}
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: "16px",
          fontSize: "10px",
          color: "#6B8A7A99",
          letterSpacing: "1px",
          textAlign: "center",
        }}
      >
        스와이프하거나 버튼으로 넘겨보세요
      </div>
    </div>
  );
}
