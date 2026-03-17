"use client";

import React, { useMemo } from "react";

type SummaryPartKey = "core" | "strength" | "pattern" | "caution" | "direction";

type ParsedPart = {
  key: SummaryPartKey;
  title: string;
  body: string;
};

const ORDER: SummaryPartKey[] = ["core", "strength", "pattern", "caution", "direction"];

const PART_LABEL: Record<SummaryPartKey, string> = {
  core: "핵심 기질",
  strength: "가장 큰 강점",
  pattern: "반복되는 인생 패턴",
  caution: "주의할 성향",
  direction: "인생 방향 가이드",
};

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
    .replace(
      /^\s*(핵심\s*기질|가장\s*큰\s*강점|반복되는\s*인생\s*패턴|주의할\s*성향|인생\s*방향\s*(?:가이드)?)\s*[:：]?\s*/g,
      ""
    )
    .trim();
}

function firstLineAsTitle(body: string, fallbackTitle: string) {
  const t = normalizeText(body);
  const lines = t
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return { title: fallbackTitle, body: "" };
  const rawFirst = lines[0];
  if (rawFirst.length > 22) return { title: fallbackTitle, body: t };
  const rest = lines.slice(1).join("\n").trim();
  return { title: rawFirst, body: rest || t };
}

function splitByKnownMarkers(text: string): string[] | null {
  const t = normalizeText(text);
  const markerRe =
    /(?:^|\n)\s*(1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|①|②|③|④|⑤|1[).]|2[).]|3[).]|4[).]|5[).])\s*/g;
  const matches = [...t.matchAll(markerRe)];
  if (matches.length < 3) return null;
  const idxs = matches
    .map((m) => m.index ?? 0)
    .sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < idxs.length; i++) {
    const start = idxs[i];
    const end = i + 1 < idxs.length ? idxs[i + 1] : t.length;
    parts.push(t.slice(start, end).trim());
  }
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

function buildPartsFromText(raw: string): ParsedPart[] {
  const text = normalizeText(raw);
  if (!text) {
    return ORDER.map((key) => ({
      key,
      title: PART_LABEL[key],
      body: "",
    }));
  }

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
    const byMarker = splitByKnownMarkers(text);
    if (byMarker && byMarker.length) {
      orderedBodies.push(...byMarker);
    } else {
      const paras = text
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean);
      if (paras.length >= 5) orderedBodies.push(...paras.slice(0, 5));
      else {
        orderedBodies.push(text);
      }
    }
  }

  while (orderedBodies.length < 5) orderedBodies.push("");

  return ORDER.map((key, idx) => {
    const cleaned = stripLeadingHeading(orderedBodies[idx] || "");
    const { title, body } = firstLineAsTitle(cleaned, PART_LABEL[key]);
    const bodyWithoutMarkers = body
      .replace(/[1-5]️⃣/g, "")
      .replace(/[①②③④⑤]/g, "")
      .trim();
    return {
      key,
      title,
      body: bodyWithoutMarkers,
    };
  });
}

type SajuSummaryCardProps = {
  text: string;
  name: string;
  sub: string;
  pillar: string;
};

export function SajuSummaryCard({ text, name, sub, pillar }: SajuSummaryCardProps) {
  const parts = useMemo(() => buildPartsFromText(text), [text]);

  return (
    <div
      style={{
        width: "100%",
        background: "#F5F1EA",
        borderRadius: 18,
        border: "1px solid #D4C9B8",
        padding: "16px 14px 18px",
        fontFamily:
          "'Gmarket Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "#8B7355",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          SAJU SUMMARY
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#2C2417",
            marginBottom: 2,
            letterSpacing: "-0.02em",
          }}
        >
          종합 요약 및 인생 가이드
        </div>
        {(name || sub || pillar) && (
          <div style={{ fontSize: 11, color: "#6B5F4E", lineHeight: 1.5, marginTop: 4 }}>
            {name && <div>{name}</div>}
            {sub && <div>{sub}</div>}
            {pillar && <div style={{ fontWeight: 600 }}>{pillar}</div>}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {parts.map((part, idx) => {
          const isLast = idx === parts.length - 1;
          const number = idx + 1;
          const isGold = isLast;

          return (
            <div key={part.key} style={{ display: "flex", alignItems: "stretch" }}>
              <div
                style={{
                  width: 32,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "999px",
                    border: isGold ? "1.5px solid #8B7355" : "1px solid #D4C9B8",
                    backgroundColor: isGold ? "#8B7355" : "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: isGold ? "#FFF7E5" : "#4A3F30",
                  }}
                >
                  {number}
                </div>
                {!isLast && (
                  <div
                    style={{
                      flex: 1,
                      width: 1,
                      marginTop: 4,
                      background:
                        "linear-gradient(to bottom, rgba(197,185,160,0.9), rgba(212,201,184,0.1))",
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 13,
                  border: "1px solid #D4C9B8",
                  padding: "10px 11px",
                  boxShadow: "0 2px 8px rgba(44,36,23,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#4A3F30",
                    marginBottom: 4,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {PART_LABEL[part.key]}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#2C2417",
                    marginBottom: 5,
                    lineHeight: 1.5,
                    wordBreak: "keep-all",
                    whiteSpace: "pre-line",
                  }}
                >
                  {part.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#4A3F30",
                    lineHeight: 1.7,
                    wordBreak: "keep-all",
                    whiteSpace: "pre-line",
                  }}
                >
                  {part.body || "내용을 준비 중입니다."}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

