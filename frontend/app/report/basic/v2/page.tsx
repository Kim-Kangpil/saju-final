"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { PersonalityRadarCard } from "../../../../components/PersonalityRadarCard";
import { ProblemLoopCard } from "../../../../components/ProblemLoopCard";
import { MoneyFlowCard } from "../../../../components/MoneyFlowCard";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://saju-backend-eqd6.onrender.com";

const S = {
  cream: "#F5F1EA",
  cream2: "#EDE7DB",
  cream3: "#E3D9CB",
  beige: "#D4C9B8",
  beige2: "#C4B8A4",
  ink: "#2C2417",
  ink2: "#4A3F30",
  ink3: "#6B5F4E",
  gold: "#8B7355",
  goldLight: "#A8946A",
};

const LOADING_STEPS = [
  { upTo: 12, icon: "📅", msg: "생년월일·시각을 불러오고 있어요" },
  { upTo: 25, icon: "🔢", msg: "만세력으로 사주팔자를 세우는 중이에요" },
  { upTo: 40, icon: "⚖️", msg: "일간의 강약과 오행 균형을 분석해요" },
  { upTo: 55, icon: "🌊", msg: "대운 흐름과 시기를 읽고 있어요" },
  { upTo: 70, icon: "🧠", msg: "성향·패턴·돈 구조를 파악하는 중이에요" },
  { upTo: 85, icon: "✍️", msg: "AI가 당신의 언어로 바꾸고 있어요" },
  { upTo: 95, icon: "🔮", msg: "마지막 문장을 다듬는 중이에요" },
  { upTo: 100, icon: "✨", msg: "거의 완성됐어요\n최대 1분 정도 걸릴 수 있어요 🙏" },
];

function getLoadingStep(progress: number) {
  return LOADING_STEPS.find((s) => progress < s.upTo) ?? LOADING_STEPS[LOADING_STEPS.length - 1];
}

// ** 마크다운 → HTML 변환 (bold만)
function renderMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

// 마크다운 텍스트를 줄 단위로 파싱 → bullet / 일반 단락 구분
function MarkdownBody({ text, style }: { text: string; style?: React.CSSProperties }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        const isBullet = /^[-•·]\s/.test(trimmed);
        const content = isBullet ? trimmed.replace(/^[-•·]\s/, "") : trimmed;
        const html = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        return isBullet ? (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ color: S.gold, fontSize: 16, lineHeight: 1.6, flexShrink: 0 }}>•</span>
            <span
              style={{ fontSize: 14, color: S.ink2, lineHeight: 1.8, wordBreak: "keep-all" }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        ) : (
          <p
            key={i}
            style={{ fontSize: 14, color: S.ink2, lineHeight: 1.9, wordBreak: "keep-all", margin: 0 }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}

const HANJA_TO_HANGUL: Record<string, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무", 己: "기",
  庚: "경", 辛: "신", 壬: "임", 癸: "계",
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};
function hanjaToHangul(h: string) { return HANJA_TO_HANGUL[h] ?? ""; }

type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";

function hanjaToElement(h: string): Element | "none" {
  const wood = new Set(["甲","乙","寅","卯"]);
  const fire = new Set(["丙","丁","巳","午"]);
  const earth = new Set(["戊","己","辰","戌","丑","未"]);
  const metal = new Set(["庚","辛","申","酉"]);
  const water = new Set(["壬","癸","子","亥"]);
  if (wood.has(h)) return "wood";
  if (fire.has(h)) return "fire";
  if (earth.has(h)) return "earth";
  if (metal.has(h)) return "metal";
  if (water.has(h)) return "water";
  return "none";
}

const ELEMENT_PALETTE: Record<string, { text: string; bg: string; border: string }> = {
  wood:  { text: "#27500A", bg: "#C0DD97", border: "#3B6D11" },
  fire:  { text: "#712B13", bg: "#F0997B", border: "#993C1D" },
  earth: { text: "#633806", bg: "#FAC775", border: "#854F0B" },
  metal: { text: "#444441", bg: "#FFFFFF", border: "#D4C9B8" },
  water: { text: "#444441", bg: "#B4B2A9", border: "#5F5E5A" },
  none:  { text: "#2C2417", bg: "#EDE7DB", border: "#D4C9B8" },
};

function stemMeta(stem: string): { el: Element; pol: Polarity } | null {
  const map: Record<string, { el: Element; pol: Polarity }> = {
    甲:{el:"wood",pol:"yang"},乙:{el:"wood",pol:"yin"},
    丙:{el:"fire",pol:"yang"},丁:{el:"fire",pol:"yin"},
    戊:{el:"earth",pol:"yang"},己:{el:"earth",pol:"yin"},
    庚:{el:"metal",pol:"yang"},辛:{el:"metal",pol:"yin"},
    壬:{el:"water",pol:"yang"},癸:{el:"water",pol:"yin"},
  };
  return map[stem] ?? null;
}
function produces(a: Element, b: Element) {
  return ({wood:"fire",fire:"earth",earth:"metal",metal:"water",water:"wood"} as Record<Element,Element>)[a] === b;
}
function controls(a: Element, b: Element) {
  return ({wood:"earth",fire:"metal",earth:"water",metal:"wood",water:"fire"} as Record<Element,Element>)[a] === b;
}
function tenGod(dayStem: string, target: string): string {
  const dm = stemMeta(dayStem), tm = stemMeta(target);
  if (!dm || !tm) return "";
  const same = dm.pol === tm.pol;
  if (dm.el === tm.el) return same ? "비견" : "겁재";
  if (produces(dm.el, tm.el)) return same ? "식신" : "상관";
  if (produces(tm.el, dm.el)) return same ? "편인" : "정인";
  if (controls(dm.el, tm.el)) return same ? "편재" : "정재";
  if (controls(tm.el, dm.el)) return same ? "편관" : "정관";
  return "";
}
function branchMainStem(branch: string): string {
  return ({子:"癸",丑:"己",寅:"甲",卯:"乙",辰:"戊",巳:"丙",午:"丁",未:"己",申:"庚",酉:"辛",戌:"戊",亥:"壬"} as Record<string,string>)[branch] ?? "";
}

interface SajuResult {
  year: { cheongan: { hanja: string; hangul: string }; jiji: { hanja: string; hangul: string } };
  month: { cheongan: { hanja: string; hangul: string }; jiji: { hanja: string; hangul: string } };
  day: { cheongan: { hanja: string; hangul: string }; jiji: { hanja: string; hangul: string } };
  hour: { cheongan: { hanja: string; hangul: string }; jiji: { hanja: string; hangul: string } };
}

interface GyeokResult {
  gyeok_name: string;
  gyeok_shin_kr: string;
  tuchul: boolean;
  ten_god: string;
  desc: string;
  good: string;
  bad: string;
}

interface V2Result {
  comprehensive: string;
  core_values: string;
  section_personality: string;
  section_strength: string;
  section_problem: string;
  section_money: string;
  section_career: string;
  section_relationship: string;
  section_current: string;
  rule_summary: Record<string, any>;
  gyeok?: GyeokResult;
}

// comprehensive 텍스트 → 섹션 파싱 (이모지로 시작하는 줄이 섹션 제목)
function parseV2ComprehensiveSections(text: string): { title: string; body: string }[] {
  if (!text) return [];
  const lines = text.split("\n");
  const sections: { title: string; body: string }[] = [];
  let current: { title: string; body: string } | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^[🔮🧠💪🔁💰🧭❤️⏰✅💼🤝📝📊✨🌊⚡🎯🌱🌟]/u.test(trimmed)) {
      if (current) sections.push(current);
      current = { title: trimmed, body: "" };
    } else if (current) {
      current.body += (current.body ? "\n" : "") + trimmed;
    }
  }
  if (current) sections.push(current);
  return sections;
}

function getVisualCard(title: string): "personality" | "problem" | "money" | undefined {
  if (/🧠/.test(title)) return "personality";
  if (/🔁/.test(title)) return "problem";
  if (/💰/.test(title)) return "money";
  return undefined;
}

// 섹션 제목에서 이모지만 추출
function extractIcon(title: string): string {
  const match = title.match(/^(\S+)\s/);
  return match ? match[1] : "";
}

// 아코디언 한 섹션
function SectionAccordion({
  icon,
  title,
  body,
  defaultOpen,
  visualCard,
  ruleSummary,
  ctaLabel,
  ctaHref,
  ctaTitle,
  ctaOnClick,
}: {
  icon: string;
  title: string;
  body: string;
  defaultOpen: boolean;
  visualCard?: "personality" | "problem" | "money";
  ruleSummary?: Record<string, any>;
  ctaLabel?: string;
  ctaHref?: string;
  ctaTitle?: string;
  ctaOnClick?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: `1px solid ${S.beige}`,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(44,36,23,0.05)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <span style={{ fontSize: 14, fontWeight: 700, color: S.ink, flex: 1 }}>{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: S.ink3, flexShrink: 0 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: open ? "visible" : "hidden" }}
          >
            <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${S.cream3}`, paddingTop: 14 }}>
              <MarkdownBody text={body} />
              {visualCard === "personality" && ruleSummary && (
                <div style={{ marginTop: 16 }}>
                  <PersonalityRadarCard ruleSummary={ruleSummary} />
                </div>
              )}
              {visualCard === "problem" && ruleSummary && (
                <div style={{ marginTop: 16 }}>
                  <ProblemLoopCard ruleSummary={ruleSummary} />
                </div>
              )}
              {visualCard === "money" && ruleSummary && (
                <div style={{ marginTop: 16 }}>
                  <MoneyFlowCard ruleSummary={ruleSummary} />
                </div>
              )}
              {ctaLabel && ctaHref && (
                <div style={{
                  marginTop: 20,
                  background: "#FBF8F3",
                  border: "1px solid #D4C9B8",
                  borderRadius: 14,
                  padding: "16px 18px",
                }}>
                  {ctaTitle && (
                    <p style={{ fontSize: 13, fontWeight: 700, color: S.ink, margin: "0 0 12px" }}>{ctaTitle}</p>
                  )}
                  <a
                    href={ctaOnClick ? undefined : ctaHref}
                    onClick={ctaOnClick ? (e) => { e.preventDefault(); ctaOnClick(); } : undefined}
                    style={{
                      display: "block",
                      padding: "12px 0",
                      borderRadius: 10,
                      background: S.gold,
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 700,
                      textAlign: "center",
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    {ctaLabel}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 오행 한국어 매핑 ───
const ELEMENT_KO: Record<string, string> = {
  wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)",
};
const ELEMENT_COLORS: Record<string, string> = {
  wood: "#3B6D11", fire: "#993C1D", earth: "#854F0B", metal: "#555", water: "#3B5FA0",
};
const ELEMENT_BG: Record<string, string> = {
  wood: "#C0DD97", fire: "#F0997B", earth: "#FAC775", metal: "#E8E8E8", water: "#B4CFE8",
};

function computeOhaengRatio(pillars: { year: string; month: string; day: string; hour: string }): Record<string, number> {
  const counts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const all = [pillars.year, pillars.month, pillars.day, pillars.hour].join("");
  for (const ch of all) {
    const el = hanjaToElement(ch);
    if (el !== "none") counts[el]++;
  }
  return counts;
}

// ─── 핵심 카드 ───
function HeroCard({
  pillarStrings,
  yongshin,
  geokguk,
  sajuId,
  onSaveImage,
}: {
  pillarStrings: { year: string; month: string; day: string; hour: string };
  yongshin: string;
  geokguk: string;
  sajuId: string;
  onSaveImage: () => void;
}) {
  const ratio = computeOhaengRatio(pillarStrings);
  const total = Object.values(ratio).reduce((a, b) => a + b, 0) || 1;
  const dayPillar = pillarStrings.day;
  const dayHanja = dayPillar.slice(0, 2);
  const dayHangul = dayHanja.split("").map(hanjaToHangul).join("");

  const handleKakaoShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof window !== "undefined" && (window as any).Kakao?.isInitialized?.()) {
      (window as any).Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "내 사주 핵심 카드",
          description: `일주 ${dayHanja}(${dayHangul}) | 용신 ${yongshin}`,
          imageUrl: "https://hsaju.com/og-image.png",
          link: { mobileWebUrl: url, webUrl: url },
        },
      });
    } else if (navigator.share) {
      navigator.share({ title: "내 사주 핵심 카드", url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(() => alert("링크가 복사됐어요!")).catch(() => {});
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #2C2417 0%, #4A3F30 100%)",
        borderRadius: 20, padding: "22px 20px 18px", marginBottom: 16,
        boxShadow: "0 4px 20px rgba(44,36,23,0.25)",
      }}
    >
      {/* 태그 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { label: "일주", value: `${dayHanja}(${dayHangul})` },
          { label: "격국", value: geokguk },
        ].map((item) => (
          <div key={item.label} style={{
            background: "rgba(255,255,255,0.12)", borderRadius: 8,
            padding: "6px 12px", display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 10, color: "#C4B8A4", fontWeight: 600 }}>{item.label}</span>
            <span style={{ fontSize: 13, color: "#F5F1EA", fontWeight: 700 }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* 오행 바차트 */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: "#A8946A", marginBottom: 8, letterSpacing: "0.05em" }}>오행 비율</p>
        {(["wood", "fire", "earth", "metal", "water"] as const).map((el) => {
          const pct = Math.round((ratio[el] / total) * 100);
          return (
            <div key={el} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: "#C4B8A4", width: 42, flexShrink: 0 }}>{ELEMENT_KO[el].split("(")[0]}</span>
              <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ height: "100%", background: ELEMENT_BG[el], borderRadius: 99 }}
                />
              </div>
              <span style={{ fontSize: 11, color: "#F5F1EA", width: 28, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* 버튼 */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={onSaveImage}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 8,
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
            color: "#F5F1EA", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          📸 이미지 저장
        </button>
        <button
          type="button"
          onClick={handleKakaoShare}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 8,
            background: "#FEE500", border: "none",
            color: "#3C1E1E", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          💬 카카오 공유
        </button>
      </div>
    </div>
  );
}

// ─── 대운 미리보기 ───
// currentDaeun: 백엔드에서 계산한 현재 대운 문자열 (예: "28세 甲子(갑자)")
// 프론트에서 연도·나이 계산 금지 — 규칙 엔진이 내려주는 값 그대로 사용
function DaeunPreview({ currentDaeun, sajuId, isGuest, router }: {
  currentDaeun: string;
  sajuId: string;
  isGuest?: boolean;
  router: ReturnType<typeof import("next/navigation").useRouter>;
}) {
  const m = currentDaeun.match(/^(\d+)세\s+([^(]+)\(([^)]+)\)/);
  if (!m) return null;
  const currentEntry = { startAge: parseInt(m[1], 10), ganji: m[2].trim(), hangul: m[3].trim() };
  const endAge = currentEntry.startAge + 9;

  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: `1px solid ${S.beige}`,
      padding: "16px 18px", marginBottom: 16,
      boxShadow: "0 2px 8px rgba(44,36,23,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: S.ink }}>🌊 현재 대운</span>
        <span style={{ fontSize: 11, color: S.ink3 }}>{currentEntry.startAge}세 ~ {endAge}세</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          background: `linear-gradient(135deg, ${S.ink} 0%, ${S.ink2} 100%)`,
          borderRadius: 12, padding: "10px 16px", textAlign: "center",
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#F5F1EA", letterSpacing: 2 }}>{currentEntry.ganji}</div>
          <div style={{ fontSize: 11, color: "#C4B8A4", marginTop: 2 }}>{currentEntry.hangul}</div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, color: S.ink2, lineHeight: 1.6, margin: 0 }}>
            현재 <strong>{currentEntry.ganji}({currentEntry.hangul})</strong> 대운 흐름 속에 있어요.
          </p>
          <p style={{ fontSize: 12, color: S.ink3, margin: "4px 0 0" }}>
            {currentEntry.startAge}세부터 {endAge}세까지 이어져요
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => isGuest
          ? router.push("/start?redirect=deep")
          : router.push(`/report/deep/intro?saju_id=${sajuId}`)
        }
        style={{
          marginTop: 12, width: "100%", padding: "10px 0", borderRadius: 8,
          background: S.cream2, border: `1px solid ${S.beige}`,
          color: S.ink, fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        }}
      >
        {isGuest ? "로그인하고 전체 대운 흐름 보기 →" : "전체 대운 흐름 보기 →"}
      </button>
    </div>
  );
}

// ─── 상품 목록 그리드 ───
function ProductGrid({ sajuId, router, isGuest }: {
  sajuId: string;
  router: ReturnType<typeof import("next/navigation").useRouter>;
  isGuest?: boolean;
}) {
  const products = [
    { icon: "💰", label: "재물운 리포트", sub: "2,900원", key: "money" },
    { icon: "❤️", label: "연애운 리포트", sub: "2,900원", key: "love" },
    { icon: "🧭", label: "직업운 리포트", sub: "2,900원", key: "career" },
    { icon: "🔮", label: "심화 리포트", sub: "4,900원", key: "deep" },
    { icon: "💬", label: "AI 채팅", sub: "무료 3회 제공", key: "chat" },
    { icon: "💑", label: "궁합 분석", sub: "2,900원", key: "couple" },
  ];

  function handleClick(key: string) {
    if (isGuest) {
      const redirectMap: Record<string, string> = {
        money: "/report/money/intro",
        love: "/report/love/intro",
        career: "/report/career/intro",
        deep: "/report/deep/intro",
        chat: "/chat",
        couple: "/report/couple/intro",
      };
      localStorage.setItem("purchase_redirect", redirectMap[key] || "/home");
      router.push("/start");
      return;
    }
    const hrefMap: Record<string, string> = {
      money: `/report/money/intro?saju_id=${sajuId}`,
      love: `/report/love/intro?saju_id=${sajuId}`,
      career: `/report/career/intro?saju_id=${sajuId}`,
      deep: `/report/deep/intro?saju_id=${sajuId}`,
      chat: `/chat?saju_id=${sajuId}`,
      couple: `/report/couple/intro?saju_id=${sajuId}`,
    };
    router.push(hrefMap[key] || "/home");
  }

  return (
    <div style={{ marginTop: 24, marginBottom: 8 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: S.ink, marginBottom: 12 }}>📦 더 깊이 알아보기</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {products.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => handleClick(p.key)}
            style={{
              padding: "14px 12px", borderRadius: 12,
              background: "#fff", border: `1px solid ${S.beige}`,
              textAlign: "left", cursor: "pointer",
              boxShadow: "0 1px 4px rgba(44,36,23,0.06)",
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{p.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: S.ink, marginBottom: 2 }}>{p.label}</div>
            <div style={{ fontSize: 11, color: S.gold }}>{p.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BasicV2ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sajuId = searchParams.get("saju_id") || "";
  const shareToken = searchParams.get("share_token") || "";
  const isSharedView = !!shareToken && !sajuId;
  const isGuest = searchParams.get("guest") === "true";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sajuInfo, setSajuInfo] = useState<{
    name?: string;
    birthdate?: string;
    birth_time?: string;
    gender?: string;
    calendar_type?: string;
  } | null>(null);
  const [result, setResult] = useState<SajuResult | null>(null);
  const [v2Result, setV2Result] = useState<V2Result | null>(null);
  const [pillarStrings, setPillarStrings] = useState<{ hour: string; day: string; month: string; year: string } | null>(null);
  const [basicInfoOpen, setBasicInfoOpen] = useState(false);
  const [sajuTableOpen, setSajuTableOpen] = useState(false);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [fullRawData, setFullRawData] = useState<Record<string, any> | null>(null);
  const [freeChatRemaining, setFreeChatRemaining] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [stuckAt95, setStuckAt95] = useState(false);
  const stuckTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadFnRef = useRef<(() => void) | null>(null);
  const loadingRef = useRef(true);

  // 로딩 progress
  useEffect(() => {
    if (!loading) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
      setFakeProgress(100);
      setStuckAt95(false);
      return;
    }
    setFakeProgress(0);
    setStuckAt95(false);
    progressIntervalRef.current = setInterval(() => {
      setFakeProgress((prev) => {
        if (prev >= 95) {
          // 95% 도달 시 10초 후 "오래 걸리고 있어요" 메시지 표시
          if (!stuckTimerRef.current) {
            stuckTimerRef.current = setTimeout(() => setStuckAt95(true), 10000);
          }
          return prev;
        }
        const inc = prev < 30 ? 3 : prev < 60 ? 1.8 : prev < 80 ? 1 : 0.4;
        return Math.min(95, prev + inc);
      });
    }, 150);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (stuckTimerRef.current) { clearTimeout(stuckTimerRef.current); stuckTimerRef.current = null; }
    };
  }, [loading]);

  // 데이터 로드 및 v2 분석
  useEffect(() => {
    if (isGuest) {
      const loadGuestData = async () => {
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        try {
          const rawResult = typeof window !== "undefined" ? sessionStorage.getItem("guest_saju_result") : null;
          const rawInput = typeof window !== "undefined" ? sessionStorage.getItem("guest_saju_input") : null;
          if (!rawResult) throw new Error("게스트 사주 데이터를 찾을 수 없어요.\n다시 입력해 주세요.");
          const fullData = JSON.parse(rawResult);
          const inputData = rawInput ? JSON.parse(rawInput) : {};
          setSajuInfo(inputData);
          setResult(fullData);
          setFullRawData(fullData);
          const raw = fullData as Record<string, unknown>;
          const yearPillar = (raw.year_pillar as string) || `${fullData.year?.cheongan?.hanja || ""}${fullData.year?.jiji?.hanja || ""}`;
          const monthPillar = (raw.month_pillar as string) || `${fullData.month?.cheongan?.hanja || ""}${fullData.month?.jiji?.hanja || ""}`;
          const dayPillar = (raw.day_pillar as string) || `${fullData.day?.cheongan?.hanja || ""}${fullData.day?.jiji?.hanja || ""}`;
          const hourPillar = (raw.hour_pillar as string) || `${fullData.hour?.cheongan?.hanja || ""}${fullData.hour?.jiji?.hanja || ""}`;
          setPillarStrings({ hour: hourPillar, day: dayPillar, month: monthPillar, year: yearPillar });
          const genderCode = inputData.gender === "남자" ? "M" : "F";
          const solarBirthYear = typeof raw.solar_datetime_used === "string"
            ? parseInt(raw.solar_datetime_used.slice(0, 4), 10)
            : undefined;
          const v2Res = await fetch(`${API_BASE}/saju/analyze-guest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              year_pillar: yearPillar,
              month_pillar: monthPillar,
              day_pillar: dayPillar,
              hour_pillar: hourPillar,
              gender: genderCode,
              birthdate: inputData.birthdate,
              solar_birth_year: solarBirthYear,
              daeun_list: Array.isArray(raw.daeun_list) ? raw.daeun_list : [],
              daeun_direction: typeof raw.daeun_direction === "string" ? raw.daeun_direction : "순행",
              current_daeun: typeof raw.current_daeun === "string" ? raw.current_daeun : null,
              ten_gods: raw.ten_gods && typeof raw.ten_gods === "object" ? raw.ten_gods : {},
              strength: raw.strength !== undefined ? raw.strength : {},
              harmony_clash: raw.harmony_clash && typeof raw.harmony_clash === "object" ? raw.harmony_clash : {},
              sinsal: raw.sinsal && typeof raw.sinsal === "object" ? raw.sinsal : {},
              twelve_states: raw.twelve_states && typeof raw.twelve_states === "object" ? raw.twelve_states : {},
              tone: "empathy",
            }),
          });
          if (!v2Res.ok) {
            const errBody = await v2Res.json().catch(() => ({}));
            if (v2Res.status === 429) throw new Error(errBody.detail || "하루 무료 분석 3회를 모두 사용했어요.");
            throw new Error("AI 분석에 실패했습니다.");
          }
          const v2Data = await v2Res.json();
          setV2Result(v2Data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
        } finally {
          loadingRef.current = false;
          setLoading(false);
        }
      };
      loadFnRef.current = loadGuestData;
      loadGuestData();
      return;
    }

    if (!sajuId && !shareToken) {
      setError("사주 ID가 필요합니다.");
      setLoading(false);
      return;
    }

    const loadAndAnalyze = async () => {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        // 공유 토큰으로 접근하는 경우 (인증 불필요)
        let resolvedSajuId = sajuId;
        let sajuData: Record<string, unknown>;
        if (isSharedView) {
          const sharedRes = await fetch(`${API_BASE}/api/saju/shared/${shareToken}`);
          if (!sharedRes.ok) throw new Error("유효하지 않은 공유 링크입니다.");
          sajuData = await sharedRes.json();
          resolvedSajuId = String(sajuData.id);
        } else {
          const res = await fetch(`${API_BASE}/api/saju/${sajuId}`, { credentials: "include", headers: getAuthHeaders() });
          if (!res.ok) throw new Error("사주 데이터를 불러올 수 없습니다.");
          sajuData = await res.json();
        }
        setSajuInfo(sajuData);

        const [y, m, d] = (sajuData.birthdate as string || "").split("-").map(Number);
        const timePart = ((sajuData.birth_time as string) || "").trim();
        let hour = 12, minute = 0;
        if (timePart && /^\d{1,2}:\d{1,2}$/.test(timePart)) {
          const [h, mi] = timePart.split(":").map(Number);
          hour = h; minute = mi ?? 0;
        }
        const calendar = sajuData.calendar_type === "음력" ? "lunar" : "solar";
        const gender = sajuData.gender === "남자" ? "M" : "F";

        const fullRes = await fetch(`${API_BASE}/saju/full`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calendar_type: calendar, year: y, month: m, day: d, hour, minute, gender }),
        });
        if (!fullRes.ok) throw new Error("사주 계산에 실패했습니다.");
        const fullData = await fullRes.json();
        setResult(fullData);
        setFullRawData(fullData);

        const raw = fullData as Record<string, unknown>;
        const yearPillar = (raw.year_pillar as string) || `${fullData.year?.cheongan?.hanja || ""}${fullData.year?.jiji?.hanja || ""}`;
        const monthPillar = (raw.month_pillar as string) || `${fullData.month?.cheongan?.hanja || ""}${fullData.month?.jiji?.hanja || ""}`;
        const dayPillar = (raw.day_pillar as string) || `${fullData.day?.cheongan?.hanja || ""}${fullData.day?.jiji?.hanja || ""}`;
        const hourPillar = (raw.hour_pillar as string) || `${fullData.hour?.cheongan?.hanja || ""}${fullData.hour?.jiji?.hanja || ""}`;
        setPillarStrings({ hour: hourPillar, day: dayPillar, month: monthPillar, year: yearPillar });

        // 공유 뷰: analyze-v2 호출 없이 캐시에서 직접 가져옴
        if (isSharedView) {
          const cacheKey = `v2_${resolvedSajuId}`;
          const [mainRes, cvRes, sectRes] = await Promise.all([
            fetch(`${API_BASE}/saju/report-cache?cache_key=${cacheKey}&section_key=v2_comprehensive`),
            fetch(`${API_BASE}/saju/report-cache?cache_key=${cacheKey}&section_key=v2_core_values`),
            fetch(`${API_BASE}/saju/report-cache?cache_key=${cacheKey}&section_key=v2_sections`),
          ]);
          const [mainData, cvData, sectData] = await Promise.all([mainRes.json(), cvRes.json(), sectRes.json()]);
          if (!mainData.found) throw new Error("리포트가 아직 생성되지 않았어요.\n공유한 사람이 먼저 리포트를 열람한 뒤 공유해 주세요.");
          let sections: Record<string, string> = {};
          if (sectData.found && sectData.content) {
            try { sections = JSON.parse(sectData.content); } catch {}
          }
          setV2Result({
            comprehensive: mainData.content || "",
            core_values: cvData.content || "",
            section_personality: sections.section_personality || "",
            section_strength: sections.section_strength || "",
            section_problem: sections.section_problem || "",
            section_money: sections.section_money || "",
            section_career: sections.section_career || "",
            section_relationship: sections.section_relationship || "",
            section_current: sections.section_current || "",
            rule_summary: {},
          });
          return;
        }

        const v2Res = await fetch(`${API_BASE}/saju/analyze-v2`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          credentials: "include",
          body: JSON.stringify({
            year_pillar: yearPillar,
            month_pillar: monthPillar,
            day_pillar: dayPillar,
            hour_pillar: hourPillar,
            gender,
            birthdate: sajuData.birthdate,
            daeun_list: Array.isArray(raw.daeun_list) ? raw.daeun_list : [],
            daeun_direction: typeof raw.daeun_direction === "string" ? raw.daeun_direction : "순행",
            current_daeun: typeof raw.current_daeun === "string" ? raw.current_daeun : null,
            ten_gods: raw.ten_gods && typeof raw.ten_gods === "object" ? raw.ten_gods : {},
            strength: raw.strength !== undefined ? raw.strength : {},
            harmony_clash: raw.harmony_clash && typeof raw.harmony_clash === "object" ? raw.harmony_clash : {},
            sinsal: raw.sinsal && typeof raw.sinsal === "object" ? raw.sinsal : {},
            twelve_states: raw.twelve_states && typeof raw.twelve_states === "object" ? raw.twelve_states : {},
            tone: "empathy",
            cache_key: `v2_${sajuId}`,
          }),
        });
        if (!v2Res.ok) throw new Error("AI 분석에 실패했습니다.");
        const v2Data = await v2Res.json();
        setV2Result(v2Data);
      } catch (err) {
        // 네트워크 오류 + 백그라운드 상태 → 조용히 대기 (복귀 시 자동 재시도)
        const isNetworkError = err instanceof TypeError || (err instanceof Error && /network|fetch|load/i.test(err.message));
        if (isNetworkError && document.hidden) {
          // 백그라운드로 이동하는 바람에 실패 → 복귀 시 visibilitychange가 재시도함
          return;
        }
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };

    loadFnRef.current = loadAndAnalyze;
    loadAndAnalyze();
  }, [sajuId, shareToken, isGuest]);

  // 백그라운드 복귀 시 자동 재시도
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && loadingRef.current && loadFnRef.current) {
        loadFnRef.current();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // 무료 채팅 남은 횟수 조회
  useEffect(() => {
    fetch(`${API_BASE}/api/payment/status`, { credentials: "include", headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => {
        const limit = d.chat_limit ?? 3;
        const used = d.daily_chat_count ?? 0;
        setFreeChatRemaining(Math.max(0, limit - used));
      })
      .catch(() => setFreeChatRemaining(3));
  }, []);

  const birthYmd = sajuInfo?.birthdate?.replace(/-/g, "");
  const birthHm = sajuInfo?.birth_time?.replace(":", "") || "1200";
  const gender = sajuInfo?.gender === "남자" ? "M" : "F";
  const calendar = sajuInfo?.calendar_type === "음력" ? "lunar" : "solar";
  const timeUnknown = !sajuInfo?.birth_time;

  const handleShare = async () => {
    if (isSharedView || isGuest) return;
    try {
      const res = await fetch(`${API_BASE}/api/saju/${sajuId}/share`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("share_failed");
      const { share_token } = await res.json();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const shareUrl = `${origin}/report/basic/v2?share_token=${share_token}`;
      if (navigator.share) {
        try { await navigator.share({ title: "사주 기본 분석 리포트", url: shareUrl }); return; } catch {}
      }
      await navigator.clipboard.writeText(shareUrl).catch(() => {});
      alert("공유 링크가 복사됐어요!\n누구나 열람할 수 있어요.");
    } catch {
      alert("공유 링크 생성에 실패했어요. 다시 시도해 주세요.");
    }
  };

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = "saju-core-card.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("이미지 저장에 실패했어요. 다시 시도해 주세요.");
    }
  };

  // 용신/격국 계산
  const yongshinLabel = (() => {
    const elements: string[] = fullRawData?.yongshin?.final_yongshin ?? [];
    const KO: Record<string, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };
    return elements.map((e) => KO[e] ?? e).join("·") || "분석 중";
  })();
  const geokgukLabel = (() => {
    // v2Result.gyeok (백엔드 格局 엔진) 우선 사용
    const name = (v2Result as any)?.gyeok?.gyeok_name ?? "";
    return name || "분석 중";
  })();

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px", textAlign: "center", background: S.cream, minHeight: "100vh" }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
        <p style={{ fontSize: 16, color: S.ink, marginBottom: 20 }}>{error}</p>
        <button
          onClick={() => router.push("/saju-list")}
          style={{ padding: "12px 24px", background: S.gold, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          사주 목록으로
        </button>
      </div>
    );
  }

  const loadingStep = getLoadingStep(fakeProgress);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", background: S.cream, minHeight: "100vh", fontFamily: "'Gmarket Sans', sans-serif" }}>
      {/* 헤더 */}
      <header style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${S.beige}`, background: "#fff" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <Icon icon="mdi:chevron-left" width={24} color={S.ink} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: S.ink, flex: 1 }}>✨ 기본 분석 리포트</h1>
        {isSharedView && (
          <span style={{ fontSize: 11, color: S.gold, border: `1px solid ${S.gold}`, borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>공유됨</span>
        )}
      </header>

      {loading ? (
        /* ── 로딩 UI ── */
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 57px)", padding: "0 32px" }}>
          {/* 아이콘 pulse */}
          <motion.div
            key={loadingStep.icon}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ fontSize: 52, marginBottom: 28, lineHeight: 1 }}
          >
            {loadingStep.icon}
          </motion.div>

          {/* 메시지 */}
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingStep.msg}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: 15, fontWeight: 700, color: S.ink2, textAlign: "center", marginBottom: 8, lineHeight: 1.6 }}
            >
              {loadingStep.msg}
            </motion.p>
          </AnimatePresence>

          <p style={{ fontSize: 12, color: S.ink3, marginBottom: stuckAt95 ? 12 : 32, textAlign: "center" }}>
            AI가 사주 데이터를 바탕으로 분석하고 있어요
          </p>
          {stuckAt95 && (
            <p style={{ fontSize: 12, color: S.gold, marginBottom: 32, textAlign: "center", lineHeight: 1.7, padding: "10px 16px", background: "#FBF8F3", borderRadius: 10, border: `1px solid ${S.beige}` }}>
              생각보다 오래 걸리고 있어요.<br />
              <strong>앱을 닫지 말고 잠시만 기다려 주세요.</strong><br />
              최대 1분 안에 완성돼요 🔮
            </p>
          )}

          {/* 프로그레스 바 */}
          <div style={{ width: "100%", maxWidth: 300 }}>
            <div style={{ height: 6, background: S.cream3, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
              {fakeProgress < 95 ? (
                <motion.div
                  style={{ height: "100%", background: `linear-gradient(90deg, ${S.gold}, ${S.goldLight})`, borderRadius: 99 }}
                  animate={{ width: `${fakeProgress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              ) : (
                <div style={{ position: "relative", height: "100%", width: "95%", background: `linear-gradient(90deg, ${S.gold}, ${S.goldLight})`, borderRadius: 99 }}>
                  <motion.div
                    style={{ position: "absolute", top: 0, height: "100%", width: "40%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.0, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: S.ink3 }}>분석 중</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: S.gold }}>{Math.floor(fakeProgress)}%</span>
            </div>
          </div>

          {/* 단계 점 표시 */}
          <div style={{ display: "flex", gap: 6, marginTop: 28 }}>
            {LOADING_STEPS.slice(0, -1).map((step, i) => {
              const stepPct = (i + 1) / (LOADING_STEPS.length - 1) * 95;
              const active = fakeProgress >= stepPct - 5;
              return (
                <motion.div
                  key={i}
                  animate={{ background: active ? S.gold : S.beige, scale: active ? 1.2 : 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: 7, height: 7, borderRadius: 99 }}
                />
              );
            })}
          </div>
        </div>
      ) : (
        /* ── 결과 UI ── */
        <div style={{ padding: "16px 14px" }}>
          {/* 핵심 카드 */}
          {v2Result && pillarStrings && (
            <div ref={cardRef}>
              <HeroCard
                pillarStrings={pillarStrings}
                yongshin={yongshinLabel}
                geokguk={geokgukLabel}
                sajuId={sajuId}
                onSaveImage={handleSaveImage}
              />
            </div>
          )}

          {/* 기본 정보 아코디언 */}
          <div style={{ border: `1px solid ${S.beige}`, borderRadius: 12, overflow: "hidden", background: "#fff", marginBottom: 10, boxShadow: "0 1px 4px rgba(44,36,23,0.05)" }}>
            <button
              type="button"
              onClick={() => setBasicInfoOpen((v) => !v)}
              style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer" }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: S.ink }}>기본 정보</span>
              <motion.span animate={{ rotate: basicInfoOpen ? 180 : 0 }} transition={{ duration: 0.15 }} style={{ color: S.ink3 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {basicInfoOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px 14px", borderTop: `1px solid ${S.cream3}` }}>
                    {[
                      { label: "생년월일", value: birthYmd ? `${birthYmd.slice(0, 4)}.${birthYmd.slice(4, 6)}.${birthYmd.slice(6, 8)}` : "—" },
                      { label: "시각", value: timeUnknown ? "미상" : birthHm ? `${birthHm.slice(0, 2)}:${birthHm.slice(2, 4)}` : "—" },
                      { label: "성별", value: gender === "M" ? "남자" : "여자" },
                      { label: "달력", value: calendar === "solar" ? "양력" : "음력" },
                    ].map((row) => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, marginBottom: 8, borderBottom: `1px solid ${S.cream3}` }}>
                        <span style={{ fontSize: 12, color: S.ink3 }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: S.ink }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 사주팔자 아코디언 */}
          {pillarStrings && (
            <div style={{ border: `1px solid ${S.beige}`, borderRadius: 12, overflow: "hidden", background: "#fff", marginBottom: 20, boxShadow: "0 1px 4px rgba(44,36,23,0.05)" }}>
              <button
                type="button"
                onClick={() => setSajuTableOpen((v) => !v)}
                style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer" }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: S.ink }}>내 사주팔자</span>
                <motion.span animate={{ rotate: sajuTableOpen ? 180 : 0 }} transition={{ duration: 0.15 }} style={{ color: S.ink3 }}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {sajuTableOpen && (() => {
                  const blocks = [
                    { label: "시주", val: pillarStrings.hour },
                    { label: "일주", val: pillarStrings.day },
                    { label: "월주", val: pillarStrings.month },
                    { label: "년주", val: pillarStrings.year },
                  ].filter(b => b.val && b.val.length >= 2);
                  const dayStem = pillarStrings.day[0] ?? "";
                  const tdBase: React.CSSProperties = { fontSize: 11, color: S.ink2, textAlign: "center", border: `1px solid ${S.beige}`, padding: "6px 4px" };
                  const thBase: React.CSSProperties = { background: S.cream2, border: `1px solid ${S.beige}`, padding: "7px 4px", textAlign: "center", fontSize: 11, fontWeight: 700, color: S.ink };
                  return (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
                      <div style={{ padding: "12px 12px 14px", borderTop: `1px solid ${S.cream3}`, overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed" }}>
                          <thead>
                            <tr>
                              <th style={{ ...thBase, width: 64 }} />
                              {blocks.map(b => <th key={b.label} style={thBase}>{b.label}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {/* 십성(천간) */}
                            <tr>
                              <td style={tdBase}>십성</td>
                              {blocks.map(b => {
                                const stem = b.val[0] ?? "";
                                return <td key={b.label} style={{ ...tdBase, fontWeight: 600, fontSize: 12 }}>{tenGod(dayStem, stem)}</td>;
                              })}
                            </tr>
                            {/* 천간 */}
                            <tr>
                              <td style={tdBase}>천간</td>
                              {blocks.map(b => {
                                const stem = b.val[0] ?? "";
                                const col = ELEMENT_PALETTE[hanjaToElement(stem)] ?? ELEMENT_PALETTE.none;
                                return (
                                  <td key={b.label} style={{ padding: 4, verticalAlign: "middle", border: `1px solid ${S.beige}` }}>
                                    <div style={{ padding: "10px 6px", borderRadius: 8, textAlign: "center", background: col.bg, color: col.text, fontWeight: 700, border: `1px solid ${col.border}` }}>
                                      {stem}{hanjaToHangul(stem)}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            {/* 지지 */}
                            <tr>
                              <td style={tdBase}>지지</td>
                              {blocks.map(b => {
                                const branch = b.val[1] ?? "";
                                const col = ELEMENT_PALETTE[hanjaToElement(branch)] ?? ELEMENT_PALETTE.none;
                                return (
                                  <td key={b.label} style={{ padding: 4, verticalAlign: "middle", border: `1px solid ${S.beige}` }}>
                                    <div style={{ padding: "10px 6px", borderRadius: 8, textAlign: "center", background: col.bg, color: col.text, fontWeight: 700, border: `1px solid ${col.border}` }}>
                                      {branch}{hanjaToHangul(branch)}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            {/* 십성(지지) */}
                            <tr>
                              <td style={tdBase}>십성(지지)</td>
                              {blocks.map(b => {
                                const ms = branchMainStem(b.val[1] ?? "");
                                return <td key={b.label} style={{ ...tdBase, fontWeight: 600, fontSize: 12 }}>{ms ? tenGod(dayStem, ms) : ""}</td>;
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>
          )}

          {/* 格局 카드 */}
          {v2Result?.gyeok?.gyeok_name && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", marginBottom: 16, border: `1px solid ${S.beige}`, boxShadow: "0 1px 4px rgba(44,36,23,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>🏛️</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: S.ink }}>나의 格 (타고난 틀)</span>
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#fff", background: S.gold, padding: "2px 9px", borderRadius: 20 }}>
                  {v2Result.gyeok.gyeok_name}
                </span>
              </div>
              <p style={{ fontSize: 13, color: S.ink2, lineHeight: 1.8, margin: "0 0 8px", wordBreak: "keep-all" }}>
                {v2Result.gyeok.desc}
              </p>
              {v2Result.gyeok.good && (
                <p style={{ fontSize: 12, color: "#4B7A4B", background: "#F0FDF4", borderRadius: 8, padding: "7px 10px", margin: 0 }}>
                  ✓ {v2Result.gyeok.good}
                </p>
              )}
            </div>
          )}

          {/* 대운 미리보기 — current_daeun은 백엔드 규칙 엔진이 계산해서 내려줌 */}
          {fullRawData?.current_daeun && !isSharedView && (
            <DaeunPreview
              currentDaeun={fullRawData.current_daeun as string}
              sajuId={sajuId}
              isGuest={isGuest}
              router={router}
            />
          )}

          {/* AI 분석 섹션 */}
          {v2Result && (() => {
            const sections = parseV2ComprehensiveSections(v2Result.comprehensive);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 11, color: S.ink3, textAlign: "center", marginBottom: 4, letterSpacing: "0.05em" }}>
                  AI 분석 결과 · 섹션을 탭해서 펼쳐보세요
                </p>
                {sections.map((sec, idx) => {
                  const icon = extractIcon(sec.title);
                  const titleText = icon ? sec.title.replace(icon, "").trim() : sec.title;
                  const isMoney = /💰/.test(sec.title);
                  const isLove = /❤️/.test(sec.title);
                  const isCareer = /🧭/.test(sec.title);
                  const ctaConfig = (() => {
                    if (isMoney) return {
                      title: "💰 재물운을 더 깊이 보고 싶다면",
                      label: "재물 특화 리포트 보기 — 2,900원",
                      href: isGuest ? undefined : `/report/money/intro?saju_id=${sajuId}`,
                      guestRedirect: isGuest ? "/report/money/intro" : undefined,
                    };
                    if (isLove) return {
                      title: "❤️ 연애·결혼 운도 궁금하다면",
                      label: "연애 특화 리포트 보기 — 2,900원",
                      href: isGuest ? undefined : `/report/love/intro?saju_id=${sajuId}`,
                      guestRedirect: isGuest ? "/report/love/intro" : undefined,
                    };
                    if (isCareer) return {
                      title: "💼 직업·커리어 방향도 알고 싶다면",
                      label: "직업 특화 리포트 보기 — 2,900원",
                      href: isGuest ? undefined : `/report/career/intro?saju_id=${sajuId}`,
                      guestRedirect: isGuest ? "/report/career/intro" : undefined,
                    };
                    return null;
                  })();
                  const showCTA = ctaConfig && !isSharedView;
                  const guestCtaClick = showCTA && ctaConfig.guestRedirect
                    ? () => {
                        localStorage.setItem("purchase_redirect", ctaConfig.guestRedirect!);
                        router.push("/start");
                      }
                    : undefined;
                  return (
                    <SectionAccordion
                      key={sec.title}
                      icon={icon}
                      title={titleText}
                      body={sec.body}
                      defaultOpen={idx < 2}
                      visualCard={getVisualCard(sec.title)}
                      ruleSummary={v2Result.rule_summary}
                      ctaTitle={showCTA ? ctaConfig.title : undefined}
                      ctaLabel={showCTA ? ctaConfig.label : undefined}
                      ctaHref={showCTA ? ctaConfig.href : undefined}
                      ctaOnClick={guestCtaClick}
                    />
                  );
                })}
              </div>
            );
          })()}

          {/* 공유/저장 */}
          {v2Result && !isGuest && (
            <div style={{ marginTop: 24, marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleShare}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 20px', borderRadius: 10,
                    border: `1.5px solid ${S.beige}`, background: '#fff',
                    color: S.ink2, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  📤 공유하기
                </button>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', borderRadius: 10,
                  border: '1.5px solid #bbf7d0', background: '#f0fdf4',
                  color: '#166534', fontSize: 13, fontWeight: 600,
                }}>
                  ✅ 저장됨
                </div>
              </div>
              <p style={{ fontSize: 11, color: S.gold, textAlign: 'center' }}>
                리포트는 자동 저장돼요. 언제든 다시 열람 가능해요.
              </p>
            </div>
          )}

          {/* AI 채팅 CTA */}
          {v2Result && !isSharedView && (
            <div style={{
              marginTop: 20,
              background: "#FBF8F3",
              border: "1px solid #D4C9B8",
              borderRadius: 14,
              padding: "16px 18px",
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: S.ink, margin: "0 0 6px" }}>AI에게 직접 물어보세요</p>
              <p style={{ fontSize: 13, color: S.ink3, lineHeight: 1.7, margin: "0 0 14px" }}>
                궁금한 게 생기면 AI 사주 상담이 답해줘요. 무료 3회 제공.
              </p>
              <a
                href={`/chat${!isGuest && sajuId ? `?saju_id=${sajuId}` : ""}`}
                style={{
                  display: "block",
                  padding: "12px 0",
                  borderRadius: 10,
                  background: S.gold,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                AI 상담 시작하기
              </a>
            </div>
          )}

          {/* 상품 목록 그리드 */}
          {v2Result && !isSharedView && (
            <ProductGrid sajuId={sajuId} router={router} isGuest={isGuest} />
          )}

          <div style={{ height: 80 }} />
        </div>
      )}

      {/* 플로팅 AI 채팅 버튼 */}
      {!loading && v2Result && !isSharedView && (
        <div style={{
          position: "fixed", bottom: 24, right: 16, zIndex: 100,
        }}>
          <button
            type="button"
            onClick={() => router.push(isGuest ? "/start?redirect=chat" : `/chat?saju_id=${sajuId}`)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 18px", borderRadius: 99,
              background: "linear-gradient(135deg, #2C2417 0%, #4A3F30 100%)",
              border: "none", color: "#F5F1EA",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(44,36,23,0.4)",
            }}
          >
            <span style={{ fontSize: 18 }}>💬</span>
            <span>AI에게 바로 질문하기</span>
            {freeChatRemaining !== null && (
              <span style={{
                background: freeChatRemaining > 0 ? "#A8946A" : "#888",
                color: "#fff", fontSize: 10, fontWeight: 700,
                borderRadius: 99, padding: "2px 7px", minWidth: 20, textAlign: "center",
              }}>
                {freeChatRemaining > 0 ? `${freeChatRemaining}회 무료` : "소진"}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BasicV2ReportPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>로딩 중...</div>}>
      <BasicV2ReportContent />
    </Suspense>
  );
}
