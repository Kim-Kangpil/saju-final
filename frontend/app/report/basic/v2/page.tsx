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
  { upTo: 100, icon: "✨", msg: "거의 다 됐어요, 조금만 기다려 주세요" },
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

const hanjaToElement = (h: string): "wood" | "fire" | "earth" | "metal" | "water" | "none" => {
  const map: Record<string, "wood" | "fire" | "earth" | "metal" | "water"> = {
    甲: "wood", 乙: "wood",
    丙: "fire", 丁: "fire",
    戊: "earth", 己: "earth",
    庚: "metal", 辛: "metal",
    壬: "water", 癸: "water",
    寅: "wood", 卯: "wood",
    巳: "fire", 午: "fire",
    辰: "earth", 戌: "earth", 丑: "earth", 未: "earth",
    申: "metal", 酉: "metal",
    子: "water", 亥: "water",
  };
  return map[h] || "none";
};

interface SajuResult {
  year: { cheongan: { hanja: string; hangul: string }; jiji: { hanja: string; hangul: string } };
  month: { cheongan: { hanja: string; hangul: string }; jiji: { hanja: string; hangul: string } };
  day: { cheongan: { hanja: string; hangul: string }; jiji: { hanja: string; hangul: string } };
  hour: { cheongan: { hanja: string; hangul: string }; jiji: { hanja: string; hangul: string } };
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
}

const SECTION_DEFS: {
  key: keyof V2Result;
  icon: string;
  title: string;
  visualCard?: "personality" | "problem" | "money";
}[] = [
  { key: "section_personality", icon: "🧠", title: "타고난 성향", visualCard: "personality" },
  { key: "section_strength",    icon: "✨", title: "강점과 재능" },
  { key: "section_problem",     icon: "🔁", title: "반복되는 문제 패턴", visualCard: "problem" },
  { key: "section_money",       icon: "💰", title: "돈 흐름 구조", visualCard: "money" },
  { key: "section_career",      icon: "💼", title: "일과 직업 방향" },
  { key: "section_relationship",icon: "🤝", title: "관계와 인연 구조" },
  { key: "section_current",     icon: "📊", title: "지금 이 시기" },
];

// 아코디언 한 섹션
function SectionAccordion({
  icon,
  title,
  body,
  defaultOpen,
  visualCard,
  ruleSummary,
}: {
  icon: string;
  title: string;
  body: string;
  defaultOpen: boolean;
  visualCard?: "personality" | "problem" | "money";
  ruleSummary?: Record<string, any>;
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
        <span style={{ fontSize: 18 }}>{icon}</span>
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
            style={{ overflow: "hidden" }}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BasicV2ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sajuId = searchParams.get("saju_id") || "";

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
  const [basicInfoOpen, setBasicInfoOpen] = useState(false);
  const [sajuTableOpen, setSajuTableOpen] = useState(false);
  const [fakeProgress, setFakeProgress] = useState(0);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 로딩 progress
  useEffect(() => {
    if (!loading) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setFakeProgress(100);
      return;
    }
    setFakeProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setFakeProgress((prev) => {
        if (prev >= 95) return prev;
        const inc = prev < 30 ? 3 : prev < 60 ? 1.8 : prev < 80 ? 1 : 0.4;
        return Math.min(95, prev + inc);
      });
    }, 150);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [loading]);

  // 데이터 로드 및 v2 분석
  useEffect(() => {
    if (!sajuId) {
      setError("사주 ID가 필요합니다.");
      setLoading(false);
      return;
    }

    const loadAndAnalyze = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/saju/${sajuId}`, { credentials: "include" });
        if (!res.ok) throw new Error("사주 데이터를 불러올 수 없습니다.");
        const sajuData = await res.json();
        setSajuInfo(sajuData);

        const [y, m, d] = (sajuData.birthdate || "").split("-").map(Number);
        const timePart = (sajuData.birth_time || "").trim();
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

        const raw = fullData as Record<string, unknown>;
        const yearPillar = (raw.year_pillar as string) || `${fullData.year?.cheongan?.hanja || ""}${fullData.year?.jiji?.hanja || ""}`;
        const monthPillar = (raw.month_pillar as string) || `${fullData.month?.cheongan?.hanja || ""}${fullData.month?.jiji?.hanja || ""}`;
        const dayPillar = (raw.day_pillar as string) || `${fullData.day?.cheongan?.hanja || ""}${fullData.day?.jiji?.hanja || ""}`;
        const hourPillar = (raw.hour_pillar as string) || `${fullData.hour?.cheongan?.hanja || ""}${fullData.hour?.jiji?.hanja || ""}`;

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
            ten_gods: raw.ten_gods && typeof raw.ten_gods === "object" ? raw.ten_gods : {},
            strength: raw.strength !== undefined ? raw.strength : {},
            harmony_clash: raw.harmony_clash && typeof raw.harmony_clash === "object" ? raw.harmony_clash : {},
            sinsal: raw.sinsal && typeof raw.sinsal === "object" ? raw.sinsal : {},
            tone: "empathy",
            cache_key: `v2_${sajuId}`,
          }),
        });
        if (!v2Res.ok) throw new Error("AI 분석에 실패했습니다.");
        const v2Data = await v2Res.json();
        setV2Result(v2Data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadAndAnalyze();
  }, [sajuId]);

  const pillars = result
    ? [result.hour, result.day, result.month, result.year].filter(
        (p) => p?.cheongan?.hanja && p?.jiji?.hanja
      )
    : [];
  const birthYmd = sajuInfo?.birthdate?.replace(/-/g, "");
  const birthHm = sajuInfo?.birth_time?.replace(":", "") || "1200";
  const gender = sajuInfo?.gender === "남자" ? "M" : "F";
  const calendar = sajuInfo?.calendar_type === "음력" ? "lunar" : "solar";
  const timeUnknown = !sajuInfo?.birth_time;

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
        <h1 style={{ fontSize: 16, fontWeight: 700, color: S.ink, flex: 1 }}>기본 분석 리포트</h1>
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

          <p style={{ fontSize: 12, color: S.ink3, marginBottom: 32, textAlign: "center" }}>
            AI가 사주 데이터를 바탕으로 분석하고 있어요
          </p>

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
          {result && (
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
                {sajuTableOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 12px 14px", borderTop: `1px solid ${S.cream3}`, overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed" }}>
                        <thead>
                          <tr>
                            <th style={{ width: 56, background: S.cream2, border: `1px solid ${S.beige}`, padding: "7px 4px", fontSize: 11, fontWeight: 700, color: S.ink }} />
                            {(pillars.length === 4
                              ? ["시주", "일주", "월주", "년주"]
                              : ["일주", "월주", "년주"]
                            ).map((h) => (
                              <th key={h} style={{ background: S.cream2, border: `1px solid ${S.beige}`, padding: "7px 4px", textAlign: "center", fontSize: 11, fontWeight: 700, color: S.ink }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(["cheongan", "jiji"] as const).map((row) => (
                            <tr key={row}>
                              <td style={{ fontSize: 11, color: S.ink2, textAlign: "center", border: `1px solid ${S.beige}`, padding: "5px 2px" }}>{row === "cheongan" ? "천간" : "지지"}</td>
                              {pillars.map((p, i) => {
                                const el = hanjaToElement(p[row].hanja);
                                const palette: any = {
                                  wood:  { text: "#27500A", bg: "#C0DD97" },
                                  fire:  { text: "#712B13", bg: "#F0997B" },
                                  earth: { text: "#633806", bg: "#FAC775" },
                                  metal: { text: "#444441", bg: "#FFFFFF" },
                                  water: { text: "#444441", bg: "#B4B2A9" },
                                  none:  { text: S.ink,    bg: S.cream2   },
                                };
                                const col = palette[el] || palette.none;
                                return (
                                  <td key={i} style={{ padding: 3, border: `1px solid ${S.beige}` }}>
                                    <div style={{ padding: "9px 6px", borderRadius: 7, textAlign: "center", background: col.bg, color: col.text, fontWeight: 700, fontSize: 13 }}>
                                      {p[row].hanja}<br /><span style={{ fontSize: 10, fontWeight: 400 }}>{p[row].hangul}</span>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* AI 분석 섹션 */}
          {v2Result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 11, color: S.ink3, textAlign: "center", marginBottom: 4, letterSpacing: "0.05em" }}>
                AI 분석 결과 · 섹션을 탭해서 펼쳐보세요
              </p>
              {SECTION_DEFS.map((def, idx) => {
                const body = (v2Result[def.key] as string) || "";
                if (!body) return null;
                return (
                  <SectionAccordion
                    key={def.key}
                    icon={def.icon}
                    title={def.title}
                    body={body}
                    defaultOpen={idx < 2}
                    visualCard={def.visualCard}
                    ruleSummary={v2Result.rule_summary}
                  />
                );
              })}
            </div>
          )}

          <div style={{ height: 48 }} />
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
