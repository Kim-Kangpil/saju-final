"use client";

import React, { useMemo, useRef, useState } from "react";

type SummaryPartKey = "core" | "strength" | "pattern" | "caution" | "direction";

type SummaryCard = {
  key: SummaryPartKey;
  emoji: string;
  tag: string;
  title: string;
  body: string;
  accent: string;
  bg: string;
  sparkle: string;
};

const GOLD = "#c9a26b";
const GOLD_LIGHT = "#e8c98a";

const META: Array<Pick<SummaryCard, "key" | "emoji" | "tag" | "accent" | "bg" | "sparkle">> = [
  {
    key: "core",
    emoji: "🌸",
    tag: "핵심 기질",
    accent: "#c9a0dc",
    bg: "linear-gradient(145deg, #f3eaff 0%, #e8d5f5 60%, #f9f0ff 100%)",
    sparkle: "✦",
  },
  {
    key: "strength",
    emoji: "⚡",
    tag: "가장 큰 강점",
    accent: "#b8a0e8",
    bg: "linear-gradient(145deg, #eee8ff 0%, #ddd0f8 60%, #f5f0ff 100%)",
    sparkle: "✧",
  },
  {
    key: "pattern",
    emoji: "🔄",
    tag: "반복되는 패턴",
    accent: "#d4a0c8",
    bg: "linear-gradient(145deg, #fce8f5 0%, #f0d0e8 60%, #fff0fa 100%)",
    sparkle: "✦",
  },
  {
    key: "caution",
    emoji: "⚠️",
    tag: "주의할 성향",
    accent: "#a0b8e8",
    bg: "linear-gradient(145deg, #e8f0ff 0%, #d0ddf8 60%, #f0f4ff 100%)",
    sparkle: "✧",
  },
  {
    key: "direction",
    emoji: "🌟",
    tag: "인생 방향",
    accent: "#c9a0dc",
    bg: "linear-gradient(145deg, #f5eaff 0%, #ead5fa 40%, #fff0f8 100%)",
    sparkle: "✦",
  },
];

function normalizeText(input: string) {
  return (input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripLeadingHeading(s: string) {
  return s
    .replace(/^\s*(?:1️⃣|2️⃣|3️⃣|4️⃣|5️⃣)\s*/g, "")
    .replace(/^\s*(?:[1-5]\s*[).]|[①②③④⑤]\s*)\s*/g, "")
    .replace(/^\s*(핵심\s*기질|가장\s*큰\s*강점|반복되는\s*인생\s*패턴|주의할\s*성향|인생\s*방향\s*(?:가이드)?)\s*[:：]?\s*/g, "")
    .trim();
}

function firstLineAsTitle(body: string, fallbackTitle: string) {
  const t = normalizeText(body);
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { title: fallbackTitle, body: "" };
  const rawFirst = lines[0];
  // 너무 길면 타이틀로 쓰지 않고 fallback 사용
  if (rawFirst.length > 22) return { title: fallbackTitle, body: t };
  const rest = lines.slice(1).join("\n").trim();
  return { title: rawFirst, body: rest || t };
}

function splitByKnownMarkers(text: string): string[] | null {
  // 1️⃣~5️⃣ 또는 ①~⑤ 또는 1)~5) 기반
  const t = normalizeText(text);
  const markerRe =
    /(?:^|\n)\s*(1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|①|②|③|④|⑤|1[).]|2[).]|3[).]|4[).]|5[).])\s*/g;
  const matches = [...t.matchAll(markerRe)];
  if (matches.length < 3) return null; // 너무 적으면 신뢰 X
  const idxs = matches.map((m) => m.index ?? 0).sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < idxs.length; i++) {
    const start = idxs[i];
    const end = i + 1 < idxs.length ? idxs[i + 1] : t.length;
    parts.push(t.slice(start, end).trim());
  }
  // marker가 5개보다 많으면 앞 5개만 사용
  return parts.filter(Boolean).slice(0, 5);
}

function splitByHeadings(text: string): Partial<Record<SummaryPartKey, string>> | null {
  const t = normalizeText(text);
  const specs: Array<{ key: SummaryPartKey; re: RegExp }> = [
    { key: "core", re: /(핵심\s*기질)/ },
    { key: "strength", re: /(가장\s*큰\s*강점)/ },
    { key: "pattern", re: /(반복되는\s*인생\s*패턴)/ },
    { key: "caution", re: /(주의할\s*성향)/ },
    { key: "direction", re: /(인생\s*방향\s*(?:가이드)?)/ },
  ];

  const found: Array<{ key: SummaryPartKey; idx: number }> = [];
  for (const s of specs) {
    const m = t.search(s.re);
    if (m >= 0) found.push({ key: s.key, idx: m });
  }
  if (found.length < 3) return null;
  found.sort((a, b) => a.idx - b.idx);

  const out: Partial<Record<SummaryPartKey, string>> = {};
  for (let i = 0; i < found.length; i++) {
    const start = found[i].idx;
    const end = i + 1 < found.length ? found[i + 1].idx : t.length;
    out[found[i].key] = t.slice(start, end).trim();
  }
  return out;
}

function buildCardsFromText(raw: string): SummaryCard[] {
  const text = normalizeText(raw);
  if (!text) {
    return META.map((m) => ({
      ...m,
      title: "내용을 불러오는 중…",
      body: "",
    }));
  }

  // 1) 헤딩 기반이 우선
  const byHeading = splitByHeadings(text);
  const orderedBodies: string[] = [];
  if (byHeading) {
    orderedBodies.push(
      byHeading.core || "",
      byHeading.strength || "",
      byHeading.pattern || "",
      byHeading.caution || "",
      byHeading.direction || ""
    );
  } else {
    // 2) 마커 기반 분리
    const byMarker = splitByKnownMarkers(text);
    if (byMarker && byMarker.length) {
      orderedBodies.push(...byMarker);
    } else {
      // 3) 문단 기반 폴백
      const paras = text.split("\n\n").map((p) => p.trim()).filter(Boolean);
      if (paras.length >= 5) orderedBodies.push(...paras.slice(0, 5));
      else {
        // 4) 최후 폴백: 전체를 첫 카드에 몰아넣기
        orderedBodies.push(text);
      }
    }
  }

  while (orderedBodies.length < 5) orderedBodies.push("");

  return META.map((m, idx) => {
    const cleaned = stripLeadingHeading(orderedBodies[idx] || "");
    const { title, body } = firstLineAsTitle(cleaned, m.tag);
    // 본문 안에 남아 있는 번호 이모지(1️⃣~5️⃣, ①~⑤ 등)는 모두 제거
    const bodyWithoutMarkers = body
      .replace(/[1-5]️⃣/g, "")
      .replace(/[①②③④⑤]/g, "")
      .trim();
    return { ...m, title, body: bodyWithoutMarkers };
  });
}

export function SummarySwipeCards({ text }: { text: string }) {
  const cards = useMemo(() => buildCardsFromText(text), [text]);
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = (next: number, direction: "left" | "right") => {
    if (animating) return;
    if (next < 0 || next >= cards.length) return;
    setDir(direction);
    setAnimating(true);
    window.setTimeout(() => {
      setCurrent(next);
      setDir(null);
      setAnimating(false);
    }, 260);
  };

  const prev = () => {
    if (current > 0) goTo(current - 1, "left");
  };
  const next = () => {
    if (current < cards.length - 1) goTo(current + 1, "right");
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const diff = touchStartX.current - endX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const card = cards[current];

  const slideStyle: React.CSSProperties = animating
    ? {
        transform: dir === "right" ? "translateX(-44px)" : "translateX(44px)",
        opacity: 0,
      }
    : { transform: "translateX(0)", opacity: 1 };

  return (
    <div
      style={{
        background: "linear-gradient(160deg, #faf5ff 0%, #f0e8ff 50%, #fce8f8 100%)",
        borderRadius: 22,
        padding: "14px 12px 12px",
        border: "1px solid rgba(201, 162, 107, 0.28)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: GOLD, fontWeight: 700, marginBottom: 4 }}>
          ✦ SAJU GUIDE ✦
        </div>
        <div style={{ fontSize: 13, color: "#6b3fa0", fontWeight: 800, letterSpacing: 0.2 }}>
          종합 요약 카드
        </div>
      </div>

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ width: "100%", position: "relative" }}>
        {current < cards.length - 1 && (
          <div
            style={{
              position: "absolute",
              top: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: "90%",
              height: "100%",
              borderRadius: 22,
              background: cards[current + 1]?.bg,
              opacity: 0.45,
              zIndex: 0,
            }}
            aria-hidden
          />
        )}
        {current < cards.length - 2 && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              width: "84%",
              height: "100%",
              borderRadius: 22,
              background: cards[current + 2]?.bg,
              opacity: 0.28,
              zIndex: 0,
            }}
            aria-hidden
          />
        )}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            borderRadius: 22,
            background: card.bg,
            boxShadow: "0 16px 44px rgba(160, 100, 200, 0.16), 0 3px 14px rgba(160,100,200,0.10)",
            padding: "18px 16px 16px",
            transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1), opacity 0.26s ease",
            ...slideStyle,
            border: "1px solid rgba(255,255,255,0.85)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ position: "absolute", top: 12, right: 14, fontSize: 11, color: GOLD_LIGHT, letterSpacing: 2 }}>
            {card.sparkle} {card.sparkle} {card.sparkle}
          </div>

          <div
            style={{
              display: "inline-block",
              background: "rgba(201, 162, 107, 0.14)",
              border: `1px solid ${GOLD}55`,
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 10,
              color: GOLD,
              fontWeight: 800,
              letterSpacing: 1.6,
              marginBottom: 12,
            }}
          >
            {card.tag}
          </div>

          <div style={{ fontSize: 40, marginBottom: 10, lineHeight: 1 }}>{card.emoji}</div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: "#4a2070",
              lineHeight: 1.35,
              marginBottom: 12,
              whiteSpace: "pre-line",
              letterSpacing: -0.3,
            }}
          >
            {card.title}
          </div>

          <div
            style={{
              height: 1,
              background: `linear-gradient(to right, transparent, ${GOLD}44, transparent)`,
              marginBottom: 10,
            }}
          />

          <div style={{ fontSize: 12, color: "#7a5090", lineHeight: 1.85, whiteSpace: "pre-line" }}>
            {card.body || "—"}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 14,
              fontSize: 10,
              color: `${GOLD}99`,
              fontWeight: 700,
              letterSpacing: 0.6,
            }}
          >
            {String(current + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center", justifyContent: "center" }}>
        {cards.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i, i > current ? "right" : "left")}
            aria-label={`${i + 1}번 카드로 이동`}
            style={{
              width: i === current ? 22 : 8,
              height: 8,
              borderRadius: 999,
              background: i === current ? GOLD : "#d4b8e8",
              cursor: "pointer",
              transition: "all 0.22s ease",
              border: "none",
              padding: 0,
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 10, justifyContent: "center" }}>
        <button
          type="button"
          onClick={prev}
          disabled={current === 0}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `1.5px solid ${GOLD}88`,
            background: current === 0 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)",
            color: current === 0 ? "#ccc" : GOLD,
            fontSize: 16,
            cursor: current === 0 ? "default" : "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ←
        </button>
        <button
          type="button"
          onClick={next}
          disabled={current === cards.length - 1}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `1.5px solid ${GOLD}88`,
            background: current === cards.length - 1 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)",
            color: current === cards.length - 1 ? "#ccc" : GOLD,
            fontSize: 16,
            cursor: current === cards.length - 1 ? "default" : "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          →
        </button>
      </div>

      <div style={{ marginTop: 10, fontSize: 10, color: "#b090cc", letterSpacing: 0.6, textAlign: "center" }}>
        ← 스와이프하거나 버튼을 눌러보세요 →
      </div>
    </div>
  );
}

