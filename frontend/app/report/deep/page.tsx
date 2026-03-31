"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
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
  deep: "#3D2B1F",
};

const LOADING_STEPS = [
  { upTo: 12, icon: "📅", msg: "생년월일·시각을 불러오고 있어요" },
  { upTo: 28, icon: "🔢", msg: "사주팔자를 세우는 중이에요" },
  { upTo: 45, icon: "🌊", msg: "대운 10개 흐름을 분석해요" },
  { upTo: 60, icon: "⚖️", msg: "강약·십성·신살을 계산해요" },
  { upTo: 75, icon: "🧠", msg: "성향·돈·관계 구조를 파악하는 중이에요" },
  { upTo: 88, icon: "✍️", msg: "AI가 당신의 언어로 바꾸고 있어요" },
  { upTo: 95, icon: "🔮", msg: "심화 분석을 마무리하는 중이에요" },
  { upTo: 100, icon: "✨", msg: "거의 완성됐어요\n잠시만 기다려 주세요 🙏" },
];
function getLoadingStep(p: number) {
  return LOADING_STEPS.find((s) => p < s.upTo) ?? LOADING_STEPS[LOADING_STEPS.length - 1];
}

// ─── 유틸 ───────────────────────────────────────────────
function MarkdownBody({ text, style }: { text: string; style?: React.CSSProperties }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return null;
        const isBullet = /^[-•·]\s/.test(t);
        const content = isBullet ? t.replace(/^[-•·]\s/, "") : t;
        const html = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        return isBullet ? (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ color: S.gold, fontSize: 16, lineHeight: 1.6, flexShrink: 0 }}>•</span>
            <span style={{ fontSize: 14, color: S.ink2, lineHeight: 1.8, wordBreak: "keep-all" }} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        ) : (
          <p key={i} style={{ fontSize: 14, color: S.ink2, lineHeight: 1.9, wordBreak: "keep-all", margin: 0 }} dangerouslySetInnerHTML={{ __html: html }} />
        );
      })}
    </div>
  );
}

// 대운 파싱: "3세 甲子(갑자)" → { age, ganji, hangul }
function parseDaeun(raw: string): { age: number; ganji: string; hangul: string } | null {
  const m = raw.match(/^(\d+)세\s+([^\s(]+)\(([^)]+)\)/);
  if (!m) return null;
  return { age: parseInt(m[1], 10), ganji: m[2], hangul: m[3] };
}

// 한자 → 오행
type El = "wood" | "fire" | "earth" | "metal" | "water";
const HANJA_ELEMENT: Record<string, El> = {
  甲: "wood", 乙: "wood", 寅: "wood", 卯: "wood",
  丙: "fire", 丁: "fire", 巳: "fire", 午: "fire",
  戊: "earth", 己: "earth", 辰: "earth", 戌: "earth", 丑: "earth", 未: "earth",
  庚: "metal", 辛: "metal", 申: "metal", 酉: "metal",
  壬: "water", 癸: "water", 子: "water", 亥: "water",
};
const EL_COLOR: Record<El, { bg: string; text: string; border: string }> = {
  wood:  { bg: "#C0DD97", text: "#27500A", border: "#3B6D11" },
  fire:  { bg: "#F0997B", text: "#712B13", border: "#993C1D" },
  earth: { bg: "#FAC775", text: "#633806", border: "#854F0B" },
  metal: { bg: "#F0F0EE", text: "#444441", border: "#D4C9B8" },
  water: { bg: "#B4C8D8", text: "#1A3A4A", border: "#5F8EA0" },
};
const EL_NAME: Record<El, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };

function elementOf(hanja: string): El {
  for (const ch of hanja) {
    if (HANJA_ELEMENT[ch]) return HANJA_ELEMENT[ch];
  }
  return "earth";
}

// 사주팔자 테이블 헬퍼
const HANJA_TO_HANGUL: Record<string, string> = {
  甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계",
  子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해",
};
function hanjaToHangul(h: string) { return HANJA_TO_HANGUL[h] ?? ""; }
type _Pol = "yang" | "yin";
function _stemMeta(stem: string): { el: El; pol: _Pol } | null {
  const m: Record<string, { el: El; pol: _Pol }> = {
    甲:{el:"wood",pol:"yang"},乙:{el:"wood",pol:"yin"},丙:{el:"fire",pol:"yang"},丁:{el:"fire",pol:"yin"},
    戊:{el:"earth",pol:"yang"},己:{el:"earth",pol:"yin"},庚:{el:"metal",pol:"yang"},辛:{el:"metal",pol:"yin"},
    壬:{el:"water",pol:"yang"},癸:{el:"water",pol:"yin"},
  };
  return m[stem] ?? null;
}
function _prod(a: El, b: El) { return ({wood:"fire",fire:"earth",earth:"metal",metal:"water",water:"wood"} as Record<El,El>)[a]===b; }
function _ctrl(a: El, b: El) { return ({wood:"earth",fire:"metal",earth:"water",metal:"wood",water:"fire"} as Record<El,El>)[a]===b; }
function tenGod(dayStem: string, target: string): string {
  const dm=_stemMeta(dayStem), tm=_stemMeta(target);
  if (!dm||!tm) return "";
  const same=dm.pol===tm.pol;
  if (dm.el===tm.el) return same?"비견":"겁재";
  if (_prod(dm.el,tm.el)) return same?"식신":"상관";
  if (_prod(tm.el,dm.el)) return same?"편인":"정인";
  if (_ctrl(dm.el,tm.el)) return same?"편재":"정재";
  if (_ctrl(tm.el,dm.el)) return same?"편관":"정관";
  return "";
}
function branchMainStem(br: string): string {
  return ({子:"癸",丑:"己",寅:"甲",卯:"乙",辰:"戊",巳:"丙",午:"丁",未:"己",申:"庚",酉:"辛",戌:"戊",亥:"壬"} as Record<string,string>)[br]??"";
}

// 12월 → 지지 매핑 (음력 기준)
const MONTH_BRANCH = [
  { month: 1, branch: "寅", hangul: "인" },
  { month: 2, branch: "卯", hangul: "묘" },
  { month: 3, branch: "辰", hangul: "진" },
  { month: 4, branch: "巳", hangul: "사" },
  { month: 5, branch: "午", hangul: "오" },
  { month: 6, branch: "未", hangul: "미" },
  { month: 7, branch: "申", hangul: "신" },
  { month: 8, branch: "酉", hangul: "유" },
  { month: 9, branch: "戌", hangul: "술" },
  { month: 10, branch: "亥", hangul: "해" },
  { month: 11, branch: "子", hangul: "자" },
  { month: 12, branch: "丑", hangul: "축" },
];

// 아코디언
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${S.beige}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(44,36,23,0.05)" }}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", padding: "14px 18px", display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: S.ink, flex: 1 }}>{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ color: S.ink3, flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${S.cream3}`, paddingTop: 14 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 섹션 헤더
function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: sub ? 4 : 0 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: S.ink }}>{title}</span>
      </div>
      {sub && <p style={{ fontSize: 12, color: S.ink3, marginLeft: 28 }}>{sub}</p>}
    </div>
  );
}

// ─── 메인 콘텐츠 ─────────────────────────────────────────
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
  rule_summary: Record<string, unknown>;
}

interface DaeunItem { age: number; ganji: string; hangul: string; raw: string }

function DeepReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sajuId = searchParams.get("saju_id") || "";

  const [loading, setLoading] = useState(true);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [stuckAt95, setStuckAt95] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [basicInfoOpen, setBasicInfoOpen] = useState(false);
  const [sajuTableOpen, setSajuTableOpen] = useState(false);

  const [sajuInfo, setSajuInfo] = useState<Record<string, unknown> | null>(null);
  const [v2Result, setV2Result] = useState<V2Result | null>(null);
  const [daeunList, setDaeunList] = useState<DaeunItem[]>([]);
  const [daeunStartAge, setDaeunStartAge] = useState(0);
  const [pillars, setPillars] = useState<{ year: string; month: string; day: string; hour: string } | null>(null);

  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stuckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 프로그레스 바
  useEffect(() => {
    if (!loading) {
      if (progressRef.current) clearInterval(progressRef.current);
      if (stuckRef.current) clearTimeout(stuckRef.current);
      setFakeProgress(100);
      return;
    }
    setFakeProgress(0);
    setStuckAt95(false);
    progressRef.current = setInterval(() => {
      setFakeProgress((prev) => {
        if (prev >= 95) {
          if (!stuckRef.current) stuckRef.current = setTimeout(() => setStuckAt95(true), 10000);
          return prev;
        }
        const inc = prev < 30 ? 3 : prev < 60 ? 1.5 : prev < 80 ? 0.8 : 0.3;
        return Math.min(95, prev + inc);
      });
    }, 150);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
      if (stuckRef.current) { clearTimeout(stuckRef.current); stuckRef.current = null; }
    };
  }, [loading]);

  // 데이터 로드
  useEffect(() => {
    if (!sajuId) { setError("사주 ID가 필요합니다."); setLoading(false); return; }

    (async () => {
      try {
        // 1) 접근 권한 확인
        const accessRes = await fetch(`${API_BASE}/api/payment/report-access/deep`, {
          credentials: "include", headers: getAuthHeaders(),
        });
        const accessData = await accessRes.json();
        if (!accessData.has_access) {
          setLocked(true);
          setLoading(false);
          return;
        }

        // 2) 사주 정보
        const sajuRes = await fetch(`${API_BASE}/api/saju/${sajuId}`, {
          credentials: "include", headers: getAuthHeaders(),
        });
        if (!sajuRes.ok) throw new Error("사주 데이터를 불러올 수 없습니다.");
        const sajuData = await sajuRes.json();
        setSajuInfo(sajuData);

        // 3) 사주 계산
        const [y, m, d] = ((sajuData.birthdate as string) || "").split("-").map(Number);
        const timePart = ((sajuData.birth_time as string) || "").trim();
        let hour = 12, minute = 0;
        if (timePart && /^\d{1,2}:\d{1,2}$/.test(timePart)) {
          [hour, minute] = timePart.split(":").map(Number);
        }
        const calendar = sajuData.calendar_type === "음력" ? "lunar" : "solar";
        const gender = sajuData.gender === "남자" ? "M" : "F";

        const fullRes = await fetch(`${API_BASE}/saju/full`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calendar_type: calendar, year: y, month: m, day: d, hour, minute, gender }),
        });
        if (!fullRes.ok) throw new Error("사주 계산에 실패했습니다.");
        const fullData = await fullRes.json() as Record<string, unknown>;

        const yearP  = (fullData.year_pillar  as string) || "";
        const monthP = (fullData.month_pillar as string) || "";
        const dayP   = (fullData.day_pillar   as string) || "";
        const hourP  = (fullData.hour_pillar  as string) || "";
        setPillars({ year: yearP, month: monthP, day: dayP, hour: hourP });

        const rawDaeun = (Array.isArray(fullData.daeun_list) ? fullData.daeun_list : []) as string[];
        const parsed: DaeunItem[] = rawDaeun.map((r: string) => {
          const p = parseDaeun(r);
          return p ? { ...p, raw: r } : { age: 0, ganji: "", hangul: "", raw: r };
        }).filter((d) => d.ganji);
        setDaeunList(parsed);
        setDaeunStartAge(typeof fullData.daeun_start_age === "number" ? fullData.daeun_start_age : 0);

        // 4) v2 심화 분석
        const v2Res = await fetch(`${API_BASE}/saju/analyze-v2`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          credentials: "include",
          body: JSON.stringify({
            year_pillar: yearP,
            month_pillar: monthP,
            day_pillar: dayP,
            hour_pillar: hourP,
            gender,
            birthdate: sajuData.birthdate,
            daeun_list: rawDaeun,
            daeun_direction: typeof fullData.daeun_direction === "string" ? fullData.daeun_direction : "순행",
            ten_gods: typeof fullData.ten_gods === "object" ? fullData.ten_gods : {},
            strength: fullData.strength ?? {},
            harmony_clash: typeof fullData.harmony_clash === "object" ? fullData.harmony_clash : {},
            sinsal: typeof fullData.sinsal === "object" ? fullData.sinsal : {},
            twelve_states: typeof fullData.twelve_states === "object" ? fullData.twelve_states : {},
            tone: "empathy",
            cache_key: `deep_v2_${sajuId}`,
          }),
        });
        if (!v2Res.ok) throw new Error("심화 분석에 실패했습니다.");
        const v2Data = await v2Res.json() as V2Result;
        setV2Result(v2Data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sajuId]);

  // 현재 대운 인덱스 계산
  const birthYear = sajuInfo?.birthdate ? parseInt((sajuInfo.birthdate as string).split("-")[0], 10) : 0;
  const currentAge = birthYear ? (new Date().getFullYear() - birthYear) : 0;
  const currentDaeunIdx = daeunList.findIndex((d, i) => {
    const next = daeunList[i + 1];
    return currentAge >= d.age && (!next || currentAge < next.age);
  });

  const birthYmd = (sajuInfo?.birthdate as string | undefined)?.replace(/-/g, "");
  const currentMonth = new Date().getMonth() + 1;

  // ── 잠금 화면 ──
  if (locked) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", background: S.cream, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", fontFamily: "'Gmarket Sans', sans-serif" }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>🔮</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: S.ink, marginBottom: 10, textAlign: "center" }}>심화 리포트 구매 필요</h2>
        <p style={{ fontSize: 14, color: S.ink3, lineHeight: 1.8, textAlign: "center", marginBottom: 28 }}>
          대운 타임라인·세운 분석 등 깊은 내용을<br />보려면 심화 리포트가 필요해요.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/report/deep/intro?saju_id=${sajuId}`)}
          style={{ width: "100%", maxWidth: 320, padding: "14px 0", background: S.deep, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          심화 리포트 보기 (4,900원)
        </button>
        <button type="button" onClick={() => router.back()}
          style={{ marginTop: 14, background: "none", border: "none", fontSize: 13, color: S.ink3, cursor: "pointer" }}>
          돌아가기
        </button>
      </div>
    );
  }

  // ── 에러 ──
  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px", textAlign: "center", background: S.cream, minHeight: "100vh", fontFamily: "'Gmarket Sans', sans-serif" }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
        <p style={{ fontSize: 16, color: S.ink, marginBottom: 20 }}>{error}</p>
        <button onClick={() => router.push("/saju-list")}
          style={{ padding: "12px 24px", background: S.gold, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          사주 목록으로
        </button>
      </div>
    );
  }

  const loadingStep = getLoadingStep(fakeProgress);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", background: S.cream, minHeight: "100vh", fontFamily: "'Gmarket Sans', sans-serif" }}>
      {/* ── 헤더 ── */}
      <header style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${S.beige}`, background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <Icon icon="mdi:chevron-left" width={24} color={S.ink} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: S.ink, flex: 1 }}>🔮 심화 종합 분석 리포트</h1>
      </header>

      {loading ? (
        /* ── 로딩 UI ── */
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 57px)", padding: "0 32px" }}>
          <motion.div key={loadingStep.icon} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.35 }}
            style={{ fontSize: 52, marginBottom: 28, lineHeight: 1 }}>
            {loadingStep.icon}
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.p key={loadingStep.msg} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ fontSize: 15, fontWeight: 700, color: S.ink2, textAlign: "center", marginBottom: 8, lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {loadingStep.msg}
            </motion.p>
          </AnimatePresence>
          <p style={{ fontSize: 12, color: S.ink3, marginBottom: stuckAt95 ? 12 : 32, textAlign: "center" }}>
            AI가 대운·세운까지 깊게 분석하고 있어요
          </p>
          {stuckAt95 && (
            <p style={{ fontSize: 12, color: S.gold, marginBottom: 32, textAlign: "center", lineHeight: 1.7, padding: "10px 16px", background: "#FBF8F3", borderRadius: 10, border: `1px solid ${S.beige}` }}>
              생각보다 오래 걸리고 있어요.<br />
              <strong>앱을 닫지 말고 잠시만 기다려 주세요.</strong>
            </p>
          )}
          <div style={{ width: "100%", maxWidth: 300 }}>
            <div style={{ height: 6, background: S.cream3, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
              {fakeProgress < 95 ? (
                <motion.div style={{ height: "100%", background: `linear-gradient(90deg, ${S.gold}, ${S.goldLight})`, borderRadius: 99 }}
                  animate={{ width: `${fakeProgress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
              ) : (
                <div style={{ position: "relative", height: "100%", width: "95%", background: `linear-gradient(90deg, ${S.gold}, ${S.goldLight})`, borderRadius: 99 }}>
                  <motion.div style={{ position: "absolute", top: 0, height: "100%", width: "40%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
                    animate={{ x: ["-100%", "200%"] }} transition={{ duration: 1.0, repeat: Infinity, ease: "linear" }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: S.ink3 }}>분석 중</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: S.gold }}>{Math.floor(fakeProgress)}%</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 28 }}>
            {LOADING_STEPS.slice(0, -1).map((step, i) => {
              const pct = (i + 1) / (LOADING_STEPS.length - 1) * 95;
              const active = fakeProgress >= pct - 5;
              return (
                <motion.div key={i} animate={{ background: active ? S.gold : S.beige, scale: active ? 1.2 : 1 }}
                  transition={{ duration: 0.3 }} style={{ width: 7, height: 7, borderRadius: 99 }} />
              );
            })}
          </div>
        </div>
      ) : (
        /* ── 결과 ── */
        <div style={{ padding: "16px 14px 80px" }}>

          {/* ── 기본 정보 아코디언 ── */}
          {birthYmd && (() => {
            const infoRows = [
              ...(sajuInfo?.name ? [{ label: "이름", value: sajuInfo.name as string }] : []),
              { label: "생년월일", value: `${birthYmd.slice(0,4)}년 ${birthYmd.slice(4,6)}월 ${birthYmd.slice(6,8)}일` },
              { label: "시각", value: sajuInfo?.birth_time ? String(sajuInfo.birth_time) : "모름" },
              { label: "성별", value: sajuInfo?.gender === "남자" || sajuInfo?.gender === "M" ? "남성" : "여성" },
              { label: "달력", value: sajuInfo?.calendar_type === "음력" ? "음력" : "양력" },
            ];
            return (
              <div style={{ marginBottom: 10 }}>
                <button
                  onClick={() => setBasicInfoOpen(v => !v)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: `1px solid ${S.beige}`, borderRadius: basicInfoOpen ? "12px 12px 0 0" : 12, padding: "13px 16px", cursor: "pointer" }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: S.ink }}>기본 정보</span>
                  <motion.span animate={{ rotate: basicInfoOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: "inline-block", fontSize: 12, color: S.ink3 }}>▼</motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {basicInfoOpen && (
                    <motion.div
                      key="basicInfo"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: "hidden", background: "#fff", border: `1px solid ${S.beige}`, borderTop: "none", borderRadius: "0 0 12px 12px" }}
                    >
                      <div style={{ padding: "4px 0 10px" }}>
                        {infoRows.map(({ label, value }) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px" }}>
                            <span style={{ fontSize: 13, color: S.ink3 }}>{label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: S.ink }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}

          {/* ── 내 사주팔자 아코디언 ── */}
          {pillars && (() => {
            const blocks = [
              { label: "시주", val: pillars.hour },
              { label: "일주", val: pillars.day },
              { label: "월주", val: pillars.month },
              { label: "년주", val: pillars.year },
            ];
            const dayStem = pillars.day[0] || "";
            return (
              <div style={{ marginBottom: 14 }}>
                <button
                  onClick={() => setSajuTableOpen(v => !v)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: `1px solid ${S.beige}`, borderRadius: sajuTableOpen ? "12px 12px 0 0" : 12, padding: "13px 16px", cursor: "pointer" }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: S.ink }}>내 사주팔자</span>
                  <motion.span animate={{ rotate: sajuTableOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: "inline-block", fontSize: 12, color: S.ink3 }}>▼</motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {sajuTableOpen && (
                    <motion.div
                      key="sajuTable"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: "hidden", background: "#fff", border: `1px solid ${S.beige}`, borderTop: "none", borderRadius: "0 0 12px 12px" }}
                    >
                      <div style={{ padding: "12px 14px 14px" }}>
                        {/* 헤더 행 */}
                        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(4, 1fr)", gap: 6, marginBottom: 6 }}>
                          <div />
                          {blocks.map(b => (
                            <div key={b.label} style={{ textAlign: "center", fontSize: 11, color: S.ink3, fontWeight: 600 }}>{b.label}</div>
                          ))}
                        </div>
                        {/* 십성 행 (천간) */}
                        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(4, 1fr)", gap: 6, marginBottom: 4 }}>
                          <div style={{ fontSize: 11, color: S.ink3, display: "flex", alignItems: "center" }}>십성</div>
                          {blocks.map(b => {
                            const stem = b.val[0] || "";
                            const tg = stem && dayStem ? tenGod(dayStem, stem) : "";
                            return (
                              <div key={b.label} style={{ textAlign: "center", fontSize: 11, color: S.ink3 }}>{tg}</div>
                            );
                          })}
                        </div>
                        {/* 천간 행 */}
                        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(4, 1fr)", gap: 6, marginBottom: 4 }}>
                          <div style={{ fontSize: 11, color: S.ink3, display: "flex", alignItems: "center" }}>천간</div>
                          {blocks.map(b => {
                            const stem = b.val[0] || "";
                            const el = elementOf(stem);
                            const pal = EL_COLOR[el];
                            return (
                              <div key={b.label} style={{ textAlign: "center" }}>
                                <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 8, background: pal.bg, border: `1px solid ${pal.border}`, fontSize: 15, fontWeight: 700, color: pal.text }}>
                                  {stem}<br /><span style={{ fontSize: 10, fontWeight: 400 }}>{hanjaToHangul(stem)}</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {/* 지지 행 */}
                        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(4, 1fr)", gap: 6, marginBottom: 4 }}>
                          <div style={{ fontSize: 11, color: S.ink3, display: "flex", alignItems: "center" }}>지지</div>
                          {blocks.map(b => {
                            const br = b.val[1] || "";
                            const el = elementOf(br);
                            const pal = EL_COLOR[el];
                            return (
                              <div key={b.label} style={{ textAlign: "center" }}>
                                <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 8, background: pal.bg, border: `1px solid ${pal.border}`, fontSize: 15, fontWeight: 700, color: pal.text }}>
                                  {br}<br /><span style={{ fontSize: 10, fontWeight: 400 }}>{hanjaToHangul(br)}</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {/* 지지 십성 행 */}
                        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(4, 1fr)", gap: 6 }}>
                          <div style={{ fontSize: 11, color: S.ink3, display: "flex", alignItems: "center" }}>십성</div>
                          {blocks.map(b => {
                            const br = b.val[1] || "";
                            const ms = branchMainStem(br);
                            const tg = ms && dayStem ? tenGod(dayStem, ms) : "";
                            return (
                              <div key={b.label} style={{ textAlign: "center", fontSize: 11, color: S.ink3 }}>{tg}</div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}

          {/* ── SECTION 1: 종합 사주 해석 ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${S.beige}`, padding: "18px 18px", marginBottom: 14, boxShadow: "0 2px 10px rgba(44,36,23,0.06)" }}>
            <SectionHeader icon="🔮" title="종합 사주 해석" sub="규칙 엔진이 계산하고 AI가 언어로 바꾼 결과예요" />
            {v2Result?.comprehensive ? (
              <MarkdownBody text={v2Result.comprehensive} />
            ) : (
              <p style={{ fontSize: 13, color: S.ink3 }}>분석 결과를 불러오는 중...</p>
            )}
            {v2Result?.core_values && (
              <div style={{ marginTop: 16, padding: "14px 16px", background: S.cream2, borderRadius: 12, borderLeft: `3px solid ${S.gold}` }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: S.gold, marginBottom: 8 }}>💡 핵심 가치관</p>
                <MarkdownBody text={v2Result.core_values} />
              </div>
            )}
          </div>

          {/* 성격·강약·돈·직업·관계 아코디언 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {[
              { key: "section_personality", title: "🧠 성격과 기질" },
              { key: "section_strength",    title: "💪 강점과 약점" },
              { key: "section_problem",     title: "🔁 반복되는 문제 패턴" },
              { key: "section_money",       title: "💰 돈 구조" },
              { key: "section_career",      title: "🧭 일과 진로" },
              { key: "section_relationship",title: "❤️ 관계와 연애" },
            ].map(({ key, title }) => {
              const text = v2Result?.[key as keyof V2Result] as string | undefined;
              if (!text) return null;
              return (
                <Accordion key={key} title={title}>
                  <MarkdownBody text={text} />
                </Accordion>
              );
            })}
          </div>

          {/* ── SECTION 2: 대운 타임라인 ── */}
          {daeunList.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 2px" }}>
                <span style={{ fontSize: 20 }}>🌊</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: S.ink }}>대운 타임라인</span>
                <span style={{ fontSize: 11, color: S.ink3, marginLeft: 4 }}>10년 단위 · {daeunList.length}개 대운</span>
              </div>
              <div style={{ overflowX: "auto", paddingBottom: 8 }}>
                <div style={{ display: "flex", gap: 8, paddingLeft: 2, paddingRight: 2, width: "max-content" }}>
                  {daeunList.map((d, i) => {
                    const el = elementOf(d.ganji[0] || "");
                    const pal = EL_COLOR[el];
                    const isCurrent = i === currentDaeunIdx;
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        style={{
                          width: 76, flexShrink: 0, borderRadius: 14, overflow: "hidden",
                          border: isCurrent ? `2px solid ${S.gold}` : `1px solid ${S.beige}`,
                          background: isCurrent ? "#FBF8F3" : "#fff",
                          boxShadow: isCurrent ? `0 4px 16px rgba(139,115,85,0.25)` : "0 1px 4px rgba(44,36,23,0.06)",
                        }}>
                        {/* 오행 색 바 */}
                        <div style={{ height: 5, background: pal.bg, borderBottom: `1px solid ${pal.border}` }} />
                        <div style={{ padding: "10px 8px", textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: isCurrent ? S.gold : S.ink3, fontWeight: isCurrent ? 700 : 400, marginBottom: 4 }}>
                            {isCurrent ? "◀ 현재" : `${d.age}세`}
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: pal.text, letterSpacing: 1, marginBottom: 2 }}>
                            {d.ganji}
                          </div>
                          <div style={{ fontSize: 11, color: S.ink3 }}>{d.hangul}</div>
                          <div style={{ marginTop: 6, fontSize: 10, padding: "2px 6px", borderRadius: 99, background: pal.bg, color: pal.text, display: "inline-block" }}>
                            {EL_NAME[el]}
                          </div>
                          {!isCurrent && (
                            <div style={{ marginTop: 4, fontSize: 10, color: S.ink3 }}>{d.age}~{d.age + 9}세</div>
                          )}
                          {isCurrent && (
                            <div style={{ marginTop: 4, fontSize: 10, color: S.gold, fontWeight: 600 }}>{d.age}~{d.age + 9}세</div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <p style={{ fontSize: 11, color: S.ink3, textAlign: "center", marginTop: 6 }}>
                ← 좌우로 스크롤해 전체 대운을 확인하세요
              </p>
            </div>
          )}

          {/* ── SECTION 3: 현재 대운 상세 ── */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8, padding: "0 2px" }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: S.ink }}>현재 대운 상세</span>
            </div>
            {currentDaeunIdx >= 0 && daeunList[currentDaeunIdx] && (() => {
              const cur = daeunList[currentDaeunIdx];
              const el = elementOf(cur.ganji[0] || "");
              const pal = EL_COLOR[el];
              return (
                <div style={{ background: "#fff", borderRadius: 16, border: `2px solid ${S.gold}`, overflow: "hidden", boxShadow: "0 4px 16px rgba(139,115,85,0.15)" }}>
                  <div style={{ background: `linear-gradient(135deg, ${pal.bg}, #FBF8F3)`, padding: "16px 18px", borderBottom: `1px solid ${S.cream3}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: pal.text, letterSpacing: 2 }}>{cur.ganji}</div>
                        <div style={{ fontSize: 12, color: pal.text }}>{cur.hangul} 대운</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: S.ink, marginBottom: 2 }}>
                          {cur.age}세 ~ {cur.age + 9}세 (현재 진행 중)
                        </div>
                        <div style={{ fontSize: 12, color: S.ink3 }}>
                          {EL_NAME[el]}의 기운 · 만 {currentAge}세
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    {v2Result?.section_current ? (
                      <>
                        <MarkdownBody text={v2Result.section_current} />
                        {/* 세부 아코디언들 */}
                        {[
                          { title: "💰 이 시기의 재물 흐름", text: v2Result.section_money },
                          { title: "🧭 이 시기의 직업·진로", text: v2Result.section_career },
                          { title: "❤️ 이 시기의 관계", text: v2Result.section_relationship },
                        ].map(({ title, text }) => text ? (
                          <div key={title} style={{ marginTop: 10 }}>
                            <Accordion title={title}>
                              <MarkdownBody text={text} />
                            </Accordion>
                          </div>
                        ) : null)}
                      </>
                    ) : (
                      <p style={{ fontSize: 13, color: S.ink3 }}>현재 시기 분석을 불러오는 중...</p>
                    )}
                  </div>
                </div>
              );
            })()}
            {currentDaeunIdx < 0 && v2Result?.section_current && (
              <Accordion title="⏰ 현재 시기 흐름" defaultOpen>
                <MarkdownBody text={v2Result.section_current} />
              </Accordion>
            )}
          </div>

          {/* ── SECTION 4: 올해 세운 (12개월 그리드) ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${S.beige}`, padding: "18px 16px", marginBottom: 14, boxShadow: "0 2px 8px rgba(44,36,23,0.05)" }}>
            <SectionHeader icon="🗓" title={`${new Date().getFullYear()}년 월별 기운 흐름`} sub="각 달의 지지(地支) 오행 에너지예요" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {MONTH_BRANCH.map(({ month, branch, hangul }) => {
                const el = elementOf(branch);
                const pal = EL_COLOR[el];
                const isNow = month === currentMonth;
                return (
                  <div key={month} style={{
                    borderRadius: 10, overflow: "hidden",
                    border: isNow ? `2px solid ${S.gold}` : `1px solid ${pal.border}`,
                    background: isNow ? "#FBF8F3" : pal.bg + "55",
                    boxShadow: isNow ? "0 2px 8px rgba(139,115,85,0.2)" : undefined,
                  }}>
                    <div style={{ height: 4, background: pal.bg, borderBottom: `1px solid ${pal.border}` }} />
                    <div style={{ padding: "8px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: isNow ? S.gold : S.ink3, fontWeight: isNow ? 700 : 400, marginBottom: 2 }}>
                        {isNow ? "이번 달" : `${month}월`}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: pal.text }}>{branch}</div>
                      <div style={{ fontSize: 10, color: pal.text }}>{hangul}</div>
                      <div style={{ fontSize: 9, marginTop: 3, color: pal.text, background: pal.bg, padding: "1px 5px", borderRadius: 99, display: "inline-block" }}>
                        {EL_NAME[el]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {v2Result?.section_current && (
              <div style={{ marginTop: 14, padding: "12px 14px", background: S.cream2, borderRadius: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: S.ink3, marginBottom: 6 }}>올해 전반적인 흐름</p>
                <MarkdownBody text={v2Result.section_current.split("\n").slice(0, 3).join("\n")} />
              </div>
            )}
          </div>

          {/* ── SECTION 5: 다음 대운 예고 ── */}
          {currentDaeunIdx >= 0 && daeunList[currentDaeunIdx + 1] && (() => {
            const next = daeunList[currentDaeunIdx + 1];
            const el = elementOf(next.ganji[0] || "");
            const pal = EL_COLOR[el];
            return (
              <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${S.beige}`, padding: "18px 18px", marginBottom: 14, boxShadow: "0 2px 8px rgba(44,36,23,0.05)" }}>
                <SectionHeader icon="🌅" title="다음 대운 예고" sub={`${next.age}세부터 새로운 10년이 시작돼요`} />
                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: `${pal.bg}66`, borderRadius: 12, border: `1px solid ${pal.border}`, marginBottom: 14 }}>
                  <div style={{ textAlign: "center", minWidth: 60 }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: pal.text, letterSpacing: 2 }}>{next.ganji}</div>
                    <div style={{ fontSize: 12, color: pal.text, marginTop: 2 }}>{next.hangul}</div>
                    <div style={{ fontSize: 10, color: pal.text, marginTop: 4, padding: "2px 8px", background: pal.bg, borderRadius: 99, border: `1px solid ${pal.border}`, display: "inline-block" }}>
                      {EL_NAME[el]}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: S.ink, marginBottom: 4 }}>{next.age}세 ~ {next.age + 9}세</p>
                    <p style={{ fontSize: 13, color: S.ink3, lineHeight: 1.7 }}>
                      현재 대운이 끝나면 <strong style={{ color: pal.text }}>{next.hangul}({next.ganji})</strong> 기운의 새로운 10년이 시작돼요.
                      {EL_NAME[el] === "목" && " 성장과 시작의 기운이 강해지는 시기예요."}
                      {EL_NAME[el] === "화" && " 활발하고 드러나는 기운이 커지는 시기예요."}
                      {EL_NAME[el] === "토" && " 안정과 뿌리를 다지는 기운이 강한 시기예요."}
                      {EL_NAME[el] === "금" && " 결실과 정리·마무리의 기운이 강한 시기예요."}
                      {EL_NAME[el] === "수" && " 내면을 돌아보고 깊어지는 기운의 시기예요."}
                    </p>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", background: S.cream2, borderRadius: 10 }}>
                  <p style={{ fontSize: 12, color: S.ink3, lineHeight: 1.8 }}>
                    지금 이 시기의 선택과 준비가 다음 대운의 토대가 됩니다. 현재 대운을 잘 마무리하는 것이 중요해요.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* ── SECTION 6: AI 채팅 CTA ── */}
          <div style={{
            borderRadius: 20, overflow: "hidden", marginBottom: 14,
            background: `linear-gradient(135deg, ${S.deep}, #5C3D28)`,
            boxShadow: "0 6px 24px rgba(61,43,31,0.3)",
          }}>
            <div style={{ padding: "24px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                이 내용으로 AI와 대화하기
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 20 }}>
                리포트에서 더 알고 싶은 게 생겼나요?<br />
                "지금 이직해도 될까요?" "이 사람과 잘 맞을까요?"<br />
                사주 기반 AI에게 직접 물어보세요.
              </p>
              <button
                type="button"
                onClick={() => router.push(`/chat${sajuId ? `?saju_id=${sajuId}` : ""}`)}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
                  background: "#fff", color: S.deep, fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}>
                AI에게 질문하기 →
              </button>
            </div>
          </div>

          {/* 하단 공유 버튼 */}
          <div style={{ textAlign: "center", padding: "4px 0" }}>
            <button
              type="button"
              onClick={() => router.push("/saju-list")}
              style={{ background: "none", border: "none", fontSize: 13, color: S.ink3, cursor: "pointer", padding: "8px 16px" }}>
              ← 사주 목록으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeepReportPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 24, textAlign: "center", fontFamily: "'Gmarket Sans', sans-serif", color: "#6B5F4E" }}>
        로딩 중...
      </div>
    }>
      <DeepReportContent />
    </Suspense>
  );
}
