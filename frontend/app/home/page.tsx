"use client";

import { use, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSavedSajuList } from "@/lib/sajuStorage";
import { useLang } from "@/contexts/LangContext";
import ko from "@/locales/ko";
import en from "@/locales/en";

// ─────────────────────────────────────────────────────
// 디자인 토큰 (add/page.tsx 와 동일한 S 객체)
// ─────────────────────────────────────────────────────
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
  goldL: "#A8946A",
  red: "#8B2020",
  wood: "#2D6A4F",
  water: "#2563EB",
  earth: "#B45309",
  metal: "#64748B",
  fire: "#E11D48",
  font: "'Gmarket Sans'",
};

// ─────────────────────────────────────────────────────
// 데이터
// ─────────────────────────────────────────────────────
const REVIEWS = [
  { name: "이○희", age: "28세", tag: "직장운", stars: 5, text: "대운 설명이 너무 정확해서 소름돋았어요. 지금 제 상황이랑 딱 맞아서 친구한테도 바로 공유했습니다." },
  { name: "김○준", age: "34세", tag: "재물운", stars: 5, text: "다른 사주 앱들은 그냥 두루뭉술한데 여긴 일간 기준으로 구체적으로 짚어줘서 신뢰가 갔어요." },
  { name: "박○연", age: "26세", tag: "연애운", stars: 5, text: "AI한테 사주 물어볼 수 있다는 게 신기해서 시작했는데 답변이 진짜 사주 선생님 같았어요." },
  { name: "최○민", age: "31세", tag: "건강운", stars: 5, text: "건강 체질 분석이 너무 정확해요. 제가 항상 그 부위가 약하다고 생각했는데 사주에 그대로 나오네요." },
  { name: "정○아", age: "24세", tag: "적성", stars: 5, text: "취업 준비 중인데 적성 분석이 진로 결정에 진짜 도움됐어요. 구체적인 직무까지 나와서 좋았습니다." },
  { name: "윤○서", age: "29세", tag: "대운", stars: 5, text: "만세력을 AI가 자동으로 뽑아주는 게 제일 편했어요. 계산 틀릴까봐 걱정했는데 완전 정확하더라고요." },
];

const FEATURES = [
  { icon: "🎭", title: "타고난 기질", desc: "음양오행으로 보는 나의 본성" },
  { icon: "💰", title: "재물운·직업운", desc: "십성 기반 재물·적성 분석" },
  { icon: "🤝", title: "인간관계", desc: "합충 기반 관계 에너지" },
  { icon: "🔮", title: "공망·귀인", desc: "숨겨진 조력자와 공백 분석" },
  { icon: "🏥", title: "체질·건강", desc: "오행 체질 맞춤 건강 정보" },
  { icon: "📜", title: "종합 인생 가이드", desc: "사주 전체를 한눈에 정리한 요약" },
];

const ALL_ANIMALS = [
  "갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미", "임신", "계유",
  "갑술", "을해", "병자", "정축", "무인", "기묘", "경진", "신사", "임오", "계미",
  "갑신", "을유", "병술", "정해", "무자", "기축", "경인", "신묘", "임진", "계사",
  "갑오", "을미", "병신", "정유", "무술", "기해", "경자", "신축", "임인", "계묘",
  "갑진", "을사", "병오", "정미", "무신", "기유", "경술", "신해", "임자", "계축",
  "갑인", "을묘", "병진", "정사", "무오", "기미", "경신", "신유", "임술", "계해",
];

const CHAT_BUBBLES = [
  { q: "나는 언제쯤 이직하면 좋을까?", a: "현재 경금 대운에서 편관이 강하게 작용 중이에요. 내년 을사년에 식신이 들어오는 시점이 변화에 유리합니다." },
  { q: "올해 재물운 어때?", a: "월지 편재가 세운과 삼합을 이루는 하반기가 재물 유입에 유리해요. 다만 겁재 충을 주의하세요." },
  { q: "나랑 맞는 사람 유형이 있어?", a: "일간 갑목 기준으로 기토 정재와 합이 잘 맞아요. 안정적이고 현실적인 분과 잘 어울립니다." },
];

// ─────────────────────────────────────────────────────
// 카운터 훅
// ─────────────────────────────────────────────────────
function useCounter(target: number) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const duration = 1400;
        const start = performance.now();
        const animate = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(eased * target));
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return { count, ref };
}

// ─────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────
export default function HomePage({
  params,
}: {
  params?: Promise<Record<string, string | string[]>>;
}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [animals, setAnimals] = useState<string[]>([]);
  const [animalRound, setAnimalRound] = useState(0);
  const [chatIdx, setChatIdx] = useState(0);
  const [reviewScroll, setReviewScroll] = useState(0);
  const reviewRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, t } = useLang();
  const messages = lang === "ko" ? ko : en;
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const getTodayCount = () => {
    if (typeof window === "undefined") return 128;
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem("saju_daily_count");
    if (stored) {
      try {
        const { date, base } = JSON.parse(stored);
        if (date === today) return base;
      } catch { }
    }
    const v = Math.floor(Math.random() * 80) + 90;
    localStorage.setItem("saju_daily_count", JSON.stringify({ date: today, base: v }));
    return v;
  };

  const baseCount = useRef(getTodayCount());
  const { count, ref: counterRef } = useCounter(baseCount.current);
  const { count: reviewCount, ref: reviewCountRef } = useCounter(2847);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    }
    const shuffled = [...ALL_ANIMALS].sort(() => Math.random() - 0.5);
    setAnimals(shuffled.slice(0, 6));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimals([...ALL_ANIMALS].sort(() => Math.random() - 0.5).slice(0, 6));
      setAnimalRound(r => r + 1);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setChatIdx(i => (i + 1) % CHAT_BUBBLES.length);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  function handleStart() {
    if (!isLoggedIn) { router.push("/start"); return; }
    const saved = getSavedSajuList();
    router.push((saved as any[])?.length > 0 ? "/saju-list" : "/saju-add");
  }

  return (
    <>
      <style>{`
        :root {
          --cream:  ${S.cream};
          --cream2: ${S.cream2};
          --cream3: ${S.cream3};
          --beige:  ${S.beige};
          --beige2: ${S.beige2};
          --ink:    ${S.ink};
          --ink2:   ${S.ink2};
          --ink3:   ${S.ink3};
          --gold:   ${S.gold};
          --goldL:  ${S.goldL};
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          font-family: ${S.font};
          background: var(--cream) url('/images/texture_paper_6.png');
          background-repeat: repeat;
          background-size: auto;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .serif { font-family: ${S.font}; }

        /* ── 공통 레이아웃 ── */
        .page {
          max-width: 480px;
          margin: 0 auto;
          padding-bottom: 80px;
          position: relative;
          background: var(--cream) url('/images/texture_paper_6.png');
          background-repeat: repeat;
          background-size: auto;
        }

        @media (min-width: 900px) {
          .page {
            max-width: 1200px;
            padding-bottom: 0;
          }
          .pc-layout {
            display: flex;
            justify-content: center;
            min-height: 100dvh;
          }
          .pc-sidebar {
            display: none;
          }
          .pc-main {
            width: 100%;
            max-width: 960px;
            margin: 0 auto;
            padding: 0 0 80px;
            background: var(--cream) url('/images/texture_paper_6.png');
            background-repeat: repeat;
            background-size: auto;
          }
        }

        /* ── 헤더 ── */
        .hd {
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: rgba(245,241,234,0.96);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--beige);
        }

        .hd-logo {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .hd-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1.5px solid var(--beige);
          background: var(--cream2);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .hd-logo-text {
          font-family: ${S.font};
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: 0.04em;
        }

        .hd-btn {
          padding: 7px 16px;
          border-radius: 999px;
          border: 1px solid var(--beige2);
          background: transparent;
          font-family: ${S.font};
          font-size: 12px;
          font-weight: 700;
          color: var(--ink);
          cursor: pointer;
          transition: background .15s;
          letter-spacing: 0.02em;
        }
        .hd-btn:hover { background: var(--cream2); }

        .hd-btn-fill {
          padding: 7px 16px;
          border-radius: 999px;
          border: none;
          background: var(--gold);
          font-family: ${S.font};
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: opacity .15s;
          letter-spacing: 0.02em;
          margin-left: 6px;
        }
        .hd-btn-fill:hover { opacity: .88; }

        /* ── 섹션 공통 ── */
        .sec {
          padding: 36px 20px;
          border-bottom: 1px solid var(--beige);
          background: var(--cream) url('/images/texture_paper_6.png');
          background-repeat: repeat;
          background-size: auto;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          border-radius: 999px;
          border: 1px solid var(--beige);
          background: var(--cream2);
          font-size: 11px;
          font-weight: 700;
          color: var(--ink3);
          letter-spacing: 0.07em;
          margin-bottom: 14px;
        }

        .badge-gold {
          border-color: var(--goldL);
          background: #fdf8f0;
          color: var(--gold);
        }

        .sec-title {
          font-family: ${S.font};
          font-size: clamp(1.45rem, 4.5vw, 1.75rem);
          font-weight: 900;
          color: var(--ink);
          line-height: 1.32;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
        }

        .sec-sub {
          font-size: 13px;
          color: var(--ink3);
          line-height: 1.75;
        }

        /* ── 히어로 ── */
        .hero {
          padding: 44px 20px 36px;
          text-align: center;
          background: var(--cream) url('/images/texture_paper_6.png');
          background-repeat: repeat;
          background-size: auto;
          border-bottom: 1px solid var(--beige);
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: none;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 13px;
          border-radius: 999px;
          border: 1px solid var(--goldL);
          background: #fdf8f0;
          font-size: 11px;
          font-weight: 700;
          color: var(--gold);
          letter-spacing: 0.08em;
          margin-bottom: 22px;
        }

        .hero-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold);
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: .3; }
        }

        .hero-logo {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          border: 2px solid var(--beige);
          background: var(--cream2);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: 0 auto 22px;
          animation: floatY 4s ease-in-out infinite;
        }

        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }

        .hero-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-title {
          font-family: ${S.font};
          font-size: clamp(1.65rem, 5.5vw, 2.1rem);
          font-weight: 900;
          color: var(--ink);
          line-height: 1.28;
          letter-spacing: -0.025em;
          margin-bottom: 12px;
        }

        .hero-title em {
          font-style: normal;
          color: var(--gold);
        }

        .hero-desc {
          font-size: 13.5px;
          color: var(--ink3);
          line-height: 1.8;
          margin-bottom: 28px;
        }

        /* ── 문제 제기 섹션 ─ */
        .problem-sec {
          background: var(--ink);
          padding: 48px 20px;
          text-align: center;
        }

        .problem-label {
          font-size: 11px;
          color: rgba(245,241,234,.5);
          letter-spacing: 0.12em;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .problem-main {
          font-family: ${S.font};
          font-size: clamp(1.35rem, 4.5vw, 1.65rem);
          font-weight: 900;
          color: var(--cream);
          line-height: 1.4;
          margin-bottom: 10px;
        }

        .problem-sub {
          font-family: ${S.font};
          font-size: clamp(1.35rem, 4.5vw, 1.65rem);
          font-weight: 900;
          color: var(--goldL);
          line-height: 1.4;
          margin-bottom: 32px;
        }

        .problem-divider {
          width: 40px;
          height: 1px;
          background: rgba(245,241,234,.2);
          margin: 0 auto 28px;
        }

        .problem-desc {
          font-size: 13px;
          color: rgba(245,241,234,.6);
          line-height: 1.85;
          text-align: center;
        }

        /* ── 범용 AI vs 사주 전문 AI ─ */
        .compare-sec {
          background: var(--cream);
          padding: 44px 20px;
          border-bottom: 1px solid var(--beige);
        }

        .compare-title {
          font-family: ${S.font};
          font-size: clamp(1.3rem, 4vw, 1.55rem);
          font-weight: 900;
          color: var(--ink);
          line-height: 1.4;
          margin-bottom: 28px;
        }

        .compare-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .compare-card {
          flex: 1;
          padding: 20px 16px;
          border-radius: 14px;
        }

        .compare-left {
          background: #fff;
          border: 1px solid var(--beige);
          opacity: 0.55;
          transform: scale(0.97);
        }

        .compare-right {
          background: var(--ink);
          border: 1.5px solid var(--gold);
          box-shadow: 0 0 0 1px var(--gold), 0 8px 24px rgba(139,115,85,.2);
          animation: compareFadeInScale .6s cubic-bezier(.34,1.56,.64,1) .2s both;
        }

        .compare-label {
          font-size: 10px;
          font-weight: 800;
          color: var(--muted);
          letter-spacing: 0.1em;
          margin-bottom: 14px;
          text-transform: uppercase;
        }

        .compare-label-right {
          color: var(--goldL);
        }

        .compare-chip-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .compare-chip {
          padding: 6px 12px;
          border-radius: 6px;
          background: var(--cream2);
          border: 1px solid var(--beige);
          font-size: 12px;
          color: var(--ink3);
        }

        .compare-note {
          font-size: 11px;
          color: var(--muted);
          margin-top: 14px;
        }

        .compare-arrow {
          font-size: 20px;
          color: var(--beige2);
          flex-shrink: 0;
          animation: compareArrowFade .4s ease .1s both;
        }

        .compare-logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }

        .compare-logo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1.5px solid var(--gold);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .compare-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .compare-service-name {
          font-family: ${S.font};
          font-size: 14px;
          font-weight: 700;
          color: var(--cream);
          text-align: center;
          margin-bottom: 14px;
        }

        .compare-right-note {
          font-size: 11px;
          color: rgba(245,241,234,.55);
          margin-top: 0;
          text-align: center;
        }

        .engine-card {
          margin-top: 28px;
          background: var(--cream2);
          border: 1px solid var(--beige);
          border-radius: 12px;
          padding: 18px 16px;
        }

        .engine-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-align: center;
        }

        .engine-row span {
          font-family: ${S.font};
          font-size: 13px;
          font-weight: 700;
          color: var(--ink);
        }

        .engine-x {
          font-size: 16px;
          color: var(--beige2);
        }

        .engine-sub {
          font-size: 12px;
          color: var(--ink3);
          margin-top: 10px;
          text-align: center;
        }

        @keyframes compareFadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes compareArrowFade {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .hero-btns {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 320px;
          margin: 0 auto 24px;
        }

        .btn-primary {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          border: none;
          background: var(--ink);
          color: var(--cream);
          font-family: ${S.font};
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: opacity .15s, transform .1s;
        }
        .btn-primary:active { transform: scale(.98); opacity: .9; }

        .btn-secondary {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: 1.5px solid var(--beige2);
          background: transparent;
          color: var(--ink3);
          font-family: ${S.font};
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background .15s;
          letter-spacing: 0.01em;
        }
        .btn-secondary:hover { background: var(--cream2); }

        .counter-row {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 999px;
          border: 1px solid var(--beige);
          background: var(--cream2);
        }

        .counter-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4CAF50;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: .7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.35); }
        }

        /* ── 국내 최초 뱃지 ── */
        .first-band {
          background: var(--ink);
          color: var(--cream);
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          text-align: center;
        }

        .first-band-tag {
          padding: 4px 10px;
          border-radius: 4px;
          background: var(--gold);
          font-size: 10px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.1em;
          flex-shrink: 0;
        }

        .first-band-text {
          font-family: ${S.font};
          font-size: 13px;
          font-weight: 700;
          color: var(--cream);
          line-height: 1.6;
          letter-spacing: 0.01em;
          flex: 0 1 620px;
          text-align: center;
        }

        /* ── 채팅 미리보기 ── */
        .chat-preview {
          background: #fff;
          border: 1px solid var(--beige);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(44,36,23,0.07);
        }

        .chat-preview-hd {
          background: var(--cream2);
          border-bottom: 1px solid var(--beige);
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chat-preview-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--cream3);
          border: 1px solid var(--beige);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
        }

        .chat-preview-name {
          font-size: 11px;
          font-weight: 700;
          color: var(--ink);
        }

        .chat-preview-body {
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 120px;
        }

        .chat-bubble-user {
          align-self: flex-end;
          background: var(--ink);
          color: var(--cream);
          padding: 9px 13px;
          border-radius: 12px;
          border-bottom-right-radius: 3px;
          font-size: 13px;
          line-height: 1.6;
          max-width: 80%;
          word-break: keep-all;
          animation: fadeInUp .4s ease both;
        }

        .chat-bubble-ai {
          align-self: flex-start;
          background: var(--cream2);
          color: var(--ink2);
          padding: 9px 13px;
          border-radius: 12px;
          border-bottom-left-radius: 3px;
          font-size: 13px;
          line-height: 1.7;
          max-width: 85%;
          word-break: keep-all;
          animation: fadeInUp .4s .15s ease both;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── 만세력 미리보기 테이블 ── */
        .manseryeok-preview {
          border: 1.5px solid var(--beige);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 16px;
        }

        .msr-header {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: var(--cream2);
          border-bottom: 1.5px solid var(--beige);
        }

        .msr-header-cell {
          padding: 7px 4px;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          color: var(--ink3);
          letter-spacing: 0.08em;
        }

        .msr-header-cell:not(:last-child) { border-right: 1px solid var(--beige); }

        .msr-body {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .msr-cell {
          padding: 12px 4px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .msr-cell:not(:last-child) { border-right: 1px solid var(--cream3); }

        .msr-sipsung {
          font-size: 9px;
          color: var(--ink3);
          height: 14px;
        }

        .msr-char {
          font-family: ${S.font};
          font-size: 22px;
          font-weight: 700;
        }

        .msr-table { width: 100%; border-collapse: collapse; font-size: 14px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
        .msr-table th, .msr-table td { border: 1px solid var(--beige); padding: 10px 6px; text-align: center; height: 70px; }
        .msr-table th { background: var(--cream2); font-weight: 700; color: var(--ink); }
        .msr-table .msr-row-label td { font-size: 12px; color: var(--ink3); text-align: center; }
        .msr-table .msr-pillar-box {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-radius: 0;
          color: #fff;
          font-weight: 700;
          font-size: 20px;
        }

        /* ── 피처 그리드 ── */
        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 18px;
        }

        .feature-card {
          padding: 14px 13px;
          background: #fff;
          border: 1px solid var(--beige);
          border-radius: 11px;
          transition: border-color .15s, box-shadow .15s;
          cursor: default;
        }

        .feature-card:hover {
          border-color: var(--beige2);
          box-shadow: 0 2px 12px rgba(44,36,23,0.06);
        }

        .feature-icon { font-size: 18px; margin-bottom: 7px; display: block; }
        .feature-title { font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
        .feature-desc { font-size: 11px; color: var(--ink3); line-height: 1.5; }

        /* ── 동물 갤러리 ── */
        .animal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
          margin-top: 18px;
        }

        .animal-cell {
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--beige);
          background: var(--cream2);
        }

        .animal-cell img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @keyframes cardFlip {
          from { opacity: 0; transform: perspective(280px) rotateY(-70deg); }
          to { opacity: 1; transform: perspective(280px) rotateY(0); }
        }

        .animal-flip { animation: cardFlip .28s ease-out both; }

        /* ── 리뷰 ── */
        .review-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 4px 0 12px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
          cursor: grab;
        }

        .review-scroll::-webkit-scrollbar { display: none; }

        .review-card {
          flex: 0 0 260px;
          background: #fff;
          border: 1px solid var(--beige);
          border-radius: 12px;
          padding: 16px 14px;
          box-shadow: 0 1px 8px rgba(44,36,23,0.05);
        }

        .review-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .review-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink);
        }

        .review-age {
          font-size: 11px;
          color: var(--ink3);
          margin-left: 5px;
        }

        .review-tag {
          padding: 3px 8px;
          border-radius: 999px;
          background: var(--cream2);
          border: 1px solid var(--beige);
          font-size: 10px;
          font-weight: 700;
          color: var(--ink3);
        }

        .review-stars {
          color: #E6A817;
          font-size: 12px;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        .review-text {
          font-size: 12.5px;
          color: var(--ink2);
          line-height: 1.75;
          word-break: keep-all;
        }

        /* ── 신뢰 지표 ── */
        .trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 18px;
        }

        .trust-card {
          background: #fff;
          border: 1px solid var(--beige);
          border-radius: 12px;
          padding: 18px 14px;
          text-align: center;
        }

        .trust-num {
          font-family: ${S.font};
          font-size: 26px;
          font-weight: 900;
          color: var(--gold);
          line-height: 1;
          margin-bottom: 5px;
        }

        .trust-label {
          font-size: 11px;
          color: var(--ink3);
          font-weight: 600;
          line-height: 1.5;
        }

        /* ── 최종 CTA ── */
        .cta-sec {
          padding: 48px 20px 52px;
          text-align: center;
          background: var(--ink);
          position: relative;
          overflow: hidden;
        }

        .cta-sec::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url('/images/hanji-bg.png');
          background-repeat: repeat;
          background-size: auto;
          opacity: 0.08;
          pointer-events: none;
        }

        .cta-title {
          font-family: ${S.font};
          font-size: clamp(1.4rem, 4.5vw, 1.7rem);
          font-weight: 900;
          color: var(--cream);
          line-height: 1.35;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }

        .cta-sub {
          font-size: 13px;
          color: rgba(245,241,234,.65);
          line-height: 1.75;
          margin-bottom: 28px;
        }

        .cta-btn {
          width: 100%;
          max-width: 320px;
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: var(--gold);
          color: #fff;
          font-family: ${S.font};
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity .15s, transform .1s;
          letter-spacing: 0.02em;
          margin-bottom: 12px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .cta-btn:active { transform: scale(.98); opacity: .9; }

        .cta-chat-btn {
          width: 100%;
          max-width: 320px;
          padding: 13px;
          border-radius: 12px;
          border: 1.5px solid rgba(245,241,234,.3);
          background: transparent;
          color: rgba(245,241,234,.8);
          font-family: ${S.font};
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color .15s, background .15s;
          letter-spacing: 0.01em;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .cta-chat-btn:hover {
          background: rgba(245,241,234,.08);
          border-color: rgba(245,241,234,.5);
        }

        /* ── 푸터 ── */
        .footer {
          padding: 24px 20px;
          text-align: center;
          background: var(--cream) url('/images/texture_paper_6.png');
          background-repeat: repeat;
          background-size: auto;
          border-top: 1px solid var(--beige);
        }

        .footer-text {
          font-size: 10px;
          color: var(--beige2);
          line-height: 1.7;
        }

        /* ── 플로팅 CTA (모바일) ── */
        .floating-cta {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          display: flex;
          gap: 8px;
          padding: 0 16px;
          width: 100%;
          max-width: 400px;
        }

        @media (min-width: 1024px) {
          .floating-cta { display: none; }
        }

        .floating-btn-main {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: var(--ink);
          color: var(--cream);
          font-family: ${S.font};
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(44,36,23,0.25);
          transition: opacity .15s;
        }
        .floating-btn-main:active { opacity: .88; }

        .floating-btn-chat {
          padding: 14px 18px;
          border-radius: 12px;
          border: 1.5px solid var(--beige2);
          background: rgba(245,241,234,.95);
          color: var(--ink);
          font-family: ${S.font};
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(44,36,23,0.12);
          transition: background .15s;
          white-space: nowrap;
        }
        .floating-btn-chat:hover { background: var(--cream2); }

        /* ── 구분선 장식 ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }

        .divider-line { flex: 1; height: 1px; background: var(--beige); }
        .divider-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--beige2); }

        /* ── PC 사이드바 고정 ── */
        .pc-sticky-cta {
          display: none;
        }

        @media (min-width: 900px) {
          .pc-sticky-cta {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 28px 24px;
            border-bottom: 1px solid var(--beige);
          }
        }

        /* fade in 섹션 */
        .reveal {
          opacity: 0;
          transform: translateY(14px);
          animation: revealUp .55s ease forwards;
        }

        @keyframes revealUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .reveal:nth-child(1) { animation-delay: .05s; }
        .reveal:nth-child(2) { animation-delay: .1s; }
        .reveal:nth-child(3) { animation-delay: .15s; }
        .reveal:nth-child(4) { animation-delay: .2s; }
        .reveal:nth-child(5) { animation-delay: .25s; }
      `}</style>

      {/* ── 헤더 ── */}
      <header className="hd">
        <div className="hd-logo">
          <div className="hd-logo-mark">
            <img
              src="/images/yin-yang-logo.png"
              alt="태극"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { (e.currentTarget.style.display = "none"); e.currentTarget.parentElement!.textContent = "☯"; }}
            />
          </div>
          <span className="hd-logo-text">한양사주</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setLangMenuOpen((o) => !o)}
              style={{
                padding: "4px 9px",
                borderRadius: 999,
                border: `1px solid ${S.beige2}`,
                background: "rgba(255,255,255,0.7)",
                fontFamily: S.font,
                fontSize: 10,
                fontWeight: 700,
                color: S.ink3,
                letterSpacing: "0.08em",
              }}
            >
              {lang === "ko" ? "언어 ▾" : "Language ▾"}
            </button>
            {langMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: 4,
                  minWidth: 90,
                  borderRadius: 8,
                  border: `1px solid ${S.beige2}`,
                  background: "rgba(255,255,255,0.98)",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                  padding: 4,
                  zIndex: 40,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setLang("ko");
                    setLangMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "none",
                    background: lang === "ko" ? "rgba(0,0,0,0.05)" : "transparent",
                    fontFamily: S.font,
                    fontSize: 12,
                    color: S.ink,
                    cursor: "pointer",
                  }}
                >
                  한국어
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang("en");
                    setLangMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "none",
                    background: lang === "en" ? "rgba(0,0,0,0.05)" : "transparent",
                    fontFamily: S.font,
                    fontSize: 12,
                    color: S.ink,
                    cursor: "pointer",
                  }}
                >
                  English
                </button>
              </div>
            )}
          </div>
          {isLoggedIn ? (
            <button className="hd-btn-fill" onClick={() => router.push("/chat")}>채팅 시작</button>
          ) : (
            <>
              <button className="hd-btn" onClick={() => router.push("/start")}>로그인</button>
              <button className="hd-btn-fill" onClick={() => router.push("/start")}>무료 시작</button>
            </>
          )}
        </div>
      </header>

      <div className="pc-layout" style={{ display: "block" }}>

        {/* ───────────── PC 사이드바 (md 이상에서만 보임) ───────────── */}
        <div className="pc-sidebar" style={{ display: "none" }}>
          <div className="pc-sticky-cta">
            <p className="serif" style={{ fontSize: 15, fontWeight: 700, color: S.ink, lineHeight: 1.5, whiteSpace: "pre-line" }}>
              {t("cta.title")}
            </p>
            <button className="btn-primary" onClick={handleStart}>
              {t("cta.primary")}
            </button>
            <button className="btn-secondary" onClick={() => router.push("/chat")}>
              {t("cta.secondary")}
            </button>
          </div>
        </div>

        {/* ───────────── 메인 컨텐츠 ───────────── */}
        <div className="pc-main">

          {/* ── 히어로 ── */}
          <section className="hero">
            <div className="hero-eyebrow">
              <span className="hero-dot" />
              {t("hero.badge")}
            </div>

            <div className="hero-logo">
              <img
                src="/images/yin-yang-logo.png"
                alt="한양사주"
                onError={e => { (e.currentTarget.style.display = "none"); e.currentTarget.parentElement!.textContent = "☯"; }}
              />
            </div>

            <h1 className="hero-title reveal" style={{ whiteSpace: "pre-line" }}>
              {t("hero.title")}
            </h1>

            <p className="hero-desc reveal" style={{ whiteSpace: "pre-line" }}>
              {t("hero.sub")}
            </p>

            <div className="hero-btns reveal">
              <button className="btn-primary" onClick={handleStart}>
                {t("hero.cta_primary")}
              </button>
              <button className="btn-secondary" onClick={() => router.push("/chat")}>
                {t("hero.cta_secondary")}
              </button>
            </div>

            <div ref={counterRef} className="counter-row reveal">
              <div className="counter-dot" />
              <span style={{ fontSize: 12, color: S.ink3, fontWeight: 500 }}>
                {t("hero.counter", { count: count.toLocaleString() })}
              </span>
            </div>
          </section>

          {/* ── 문제 제기 섹션 ── */}
          <section className="problem-sec">
            <div className="problem-label">{t("problem.eyebrow")}</div>
            <h2 className="problem-main" style={{ whiteSpace: "pre-line" }}>
              {t("problem.title")}
            </h2>
            <h3 className="problem-sub" style={{ whiteSpace: "pre-line" }}>
              {t("problem.title_gold")}
            </h3>
            <div className="problem-divider" />
            <p className="problem-desc" style={{ whiteSpace: "pre-line" }}>
              {t("problem.body")}
            </p>
          </section>

          {/* ── 범용 AI vs 사주 전문 AI 비교 ─ */}
          <section className="compare-sec" style={{ textAlign: "center" }}>
            <div className="badge">{t("compare.badge")}</div>
            <h2 className="compare-title" style={{ whiteSpace: "pre-line" }}>
              {t("compare.title")}
            </h2>

            <div className="compare-row">
                <div className="compare-card compare-left">
                  <div className="compare-label">{t("compare.left_label")}</div>
                <div className="compare-chip-col">
                  <div className="compare-chip">ChatGPT</div>
                  <div className="compare-chip">Claude</div>
                  <div className="compare-chip">Gemini</div>
                </div>
                <p className="compare-note">{t("compare.left_note")}</p>
              </div>

              <div className="compare-arrow">→</div>

                <div className="compare-card compare-right">
                  <div className="compare-label compare-label-right">{t("compare.right_label")}</div>
                <div className="compare-logo-wrap">
                  <div className="compare-logo">
                    <img
                      src="/images/yin-yang-logo.png"
                      alt="한양사주"
                      onError={e => { (e.currentTarget.style.display = "none"); e.currentTarget.parentElement!.textContent = "☯"; }}
                    />
                  </div>
                </div>
                <div className="compare-service-name">{t("compare.right_name")}</div>
                <p className="compare-right-note">{t("compare.right_note")}</p>
              </div>
            </div>

              <div className="engine-card">
                <div className="engine-row">
                  <span>{t("compare.engine_a")}</span>
                <span className="engine-x">×</span>
                  <span>{t("compare.engine_b")}</span>
              </div>
                <p className="engine-sub">{t("compare.engine_sub")}</p>
            </div>
          </section>

          {/* ── AI 채팅 미리보기 ── */}
          <section className="sec" style={{ textAlign: "center" }}>
            <div className="badge badge-gold" style={{ marginLeft: "auto", marginRight: "auto" }}>
              {t("chat_preview.badge")}
            </div>
            <h2 className="sec-title" style={{ whiteSpace: "pre-line" }}>
              {t("chat_preview.title")}
            </h2>
            <p className="sec-sub" style={{ marginBottom: 18, whiteSpace: "pre-line" }}>
              {t("chat_preview.sub")}
            </p>

            <div className="chat-preview">
              <div className="chat-preview-hd">
                <div className="chat-preview-avatar">
                  <img
                    src="/images/yin-yang-logo.png"
                    alt=""
                    onError={e => { (e.currentTarget.style.display = "none"); e.currentTarget.parentElement!.textContent = "☯"; }}
                  />
                </div>
                <span className="chat-preview-name">{t("chat_preview.ai_name")}</span>
                <span style={{ fontSize: 10, color: S.ink3, marginLeft: "auto" }}>
                  {t("chat_preview.ai_status")}
                </span>
              </div>
              <div className="chat-preview-body" key={chatIdx}>
                {(() => {
                  const bubbles = messages.chat_preview.bubbles;
                  const b = bubbles[chatIdx] || bubbles[0];
                  return (
                    <>
                      <div className="chat-bubble-user">{b.q}</div>
                      <div className="chat-bubble-ai">{b.a}</div>
                    </>
                  );
                })()}
              </div>
              <div style={{ padding: "10px 14px", borderTop: `1px solid ${S.cream3}` }}>
                <button
                  onClick={() => router.push("/chat")}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 8,
                    border: `1px solid ${S.beige}`,
                    background: S.cream,
                    font: "inherit",
                    fontSize: 13,
                    color: S.ink3,
                    cursor: "pointer",
                    fontFamily: S.font,
                  }}
                >
                  {t("chat_preview.cta")}
                </button>
              </div>
            </div>
          </section>

          {/* ── 만세력 정확도 ── */}
          <section className="sec" style={{ textAlign: "center" }}>
            <div className="badge">{t("manseryeok.badge")}</div>
            <h2 className="sec-title" style={{ whiteSpace: "pre-line" }}>
              {t("manseryeok.title")}
            </h2>
            <p className="sec-sub" style={{ marginBottom: 4, whiteSpace: "pre-line" }}>
              {t("manseryeok.sub")}
            </p>

            {/* 만세력 샘플 테이블 (사주팔자만세력 동일 퀄리티) */}
            <div className="manseryeok-preview" style={{ marginTop: 16 }}>
              <table className="msr-table">
                <thead>
                  <tr>
                    {messages.manseryeok.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 천간 기준 십성 */}
                  <tr className="msr-row-label">
                    {messages.manseryeok.sipsung_top.map((s, i) => (
                      <td key={i}>{s}</td>
                    ))}
                  </tr>
                  {/* 천간 색 박스 */}
                  <tr>
                    {[
                      { char: "계癸", bg: S.water },
                      { char: "기己", bg: S.earth },
                      { char: "갑甲", bg: S.wood },
                      { char: "을乙", bg: S.wood },
                    ].map((c, i) => (
                      <td key={i} style={{ padding: 4, verticalAlign: "middle" }}>
                        <div className="msr-pillar-box" style={{ background: c.bg }}>{c.char}</div>
                      </td>
                    ))}
                  </tr>
                  {/* 지지 색 박스 */}
                  <tr>
                    {[
                      { char: "유酉", bg: S.metal },
                      { char: "미未", bg: S.earth },
                      { char: "신申", bg: S.metal },
                      { char: "사巳", bg: S.fire },
                    ].map((c, i) => (
                      <td key={i} style={{ padding: 4, verticalAlign: "middle" }}>
                        <div className="msr-pillar-box" style={{ background: c.bg }}>{c.char}</div>
                      </td>
                    ))}
                  </tr>
                  {/* 지지 기준 십성 */}
                  <tr className="msr-row-label">
                    {messages.manseryeok.sipsung_bot.map((s, i) => (
                      <td key={i}>{s}</td>
                    ))}
                  </tr>
                  {/* 지장간 */}
                  <tr>
                    <td style={{ fontSize: 10, padding: 6, textAlign: "center", lineHeight: 1.5, color: S.ink3 }}>
                      <div>경금 (상관)</div>
                      <div>신금 (식신)</div>
                    </td>
                    <td style={{ fontSize: 10, padding: 6, textAlign: "center", lineHeight: 1.5, color: S.ink3 }}>
                      <div>정화 (편인)</div>
                      <div>을목 (편관)</div>
                      <div>기토 (비견)</div>
                    </td>
                    <td style={{ fontSize: 10, padding: 6, textAlign: "center", lineHeight: 1.5, color: S.ink3 }}>
                      <div>무토 (겁재)</div>
                      <div>임수 (정재)</div>
                      <div>경금 (상관)</div>
                    </td>
                    <td style={{ fontSize: 10, padding: 6, textAlign: "center", lineHeight: 1.5, color: S.ink3 }}>
                      <div>무토 (겁재)</div>
                      <div>경금 (상관)</div>
                      <div>병화 (정인)</div>
                    </td>
                  </tr>
                  {/* 십이운성 — 기토 일간 기준, 지지(유·미·신·사)에 대한 실제 판별 결과 */}
                  <tr className="msr-row-label">
                    {messages.manseryeok.twelve.map((s, i) => (
                      <td key={i}>{s}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: 11, color: S.ink3, marginTop: 10, textAlign: "center" }}>
              {t("manseryeok.note")}
            </p>
          </section>

          {/* ── 분석 항목 ── */}
          <section className="sec" style={{ textAlign: "center" }}>
            <div className="badge">{t("features.badge")}</div>
            <h2 className="sec-title" style={{ whiteSpace: "pre-line" }}>
              {t("features.title")}
            </h2>

            <div className="feature-grid">
              {messages.features.items.map((f, idx) => (
                <div key={idx} className="feature-card">
                  <span className="feature-icon">{f.icon}</span>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, padding: "12px 14px", background: S.cream2, borderRadius: 10, border: `1px solid ${S.beige}` }}>
              <p style={{ fontSize: 12, color: S.ink3, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {t("features.more")}
                <br />
                <strong style={{ color: S.gold }}>{t("features.more_strong")}</strong>
                {t("features.more_suffix")}
              </p>
            </div>
          </section>

          {/* ── 일주 동물 ── */}
          <section className="sec" style={{ textAlign: "center" }}>
            <div className="badge">{t("animals.badge")}</div>
            <h2 className="sec-title" style={{ whiteSpace: "pre-line" }}>
              {t("animals.title")}
            </h2>
            <p className="sec-sub" style={{ marginBottom: 4, whiteSpace: "pre-line" }}>
              {t("animals.sub")}
            </p>

            <div className="animal-grid">
              {animals.map((a, i) => (
                <div key={i} className="animal-cell">
                  <div
                    key={`${animalRound}-${i}`}
                    className={animalRound > 0 ? "animal-flip" : ""}
                    style={{ width: "100%", height: "100%", animationDelay: animalRound > 0 ? `${i * 35}ms` : undefined }}
                  >
                    <img
                      src={`/images/day_pillars/${a}.png`}
                      alt={a}
                      loading="lazy"
                      decoding="async"
                      onError={e => { (e.currentTarget.style.display = "none"); }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: S.ink3, textAlign: "center", marginTop: 10 }}>
              {t("animals.note")}
            </p>
          </section>

          {/* ── 신뢰 지표 ── */}
          <section className="sec" style={{ background: S.cream2, textAlign: "center" }}>
            <div className="badge">{t("trust.badge")}</div>

            <div className="trust-grid">
              {messages.trust.items.map((item, idx) => (
                <div key={idx} className="trust-card">
                  <div className="trust-num">
                    {idx === 0 ? reviewCount.toLocaleString() + "+" : item.val}
                  </div>
                  <div className="trust-label" style={{ whiteSpace: "pre-line" }}>
                    {item.lbl.replace("{count}", reviewCount.toLocaleString())}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 리뷰 ── */}
          <section className="sec" style={{ textAlign: "center" }}>
            <div className="badge">{t("reviews.badge")}</div>
            <h2 className="sec-title" style={{ fontSize: "1.25rem" }}>
              {t("reviews.title")}
            </h2>

            <div
              ref={reviewRef}
              className="review-scroll"
              style={{ marginTop: 16 }}
              onMouseDown={e => {
                const el = reviewRef.current;
                if (!el) return;
                let x = e.pageX - el.offsetLeft;
                let scrollLeft = el.scrollLeft;
                const onMove = (e: MouseEvent) => {
                  const walk = (e.pageX - el.offsetLeft - x) * 1.2;
                  el.scrollLeft = scrollLeft - walk;
                };
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", () => document.removeEventListener("mousemove", onMove), { once: true });
              }}
            >
              {messages.reviews.items.map((r, i) => (
                <div key={i} className="review-card">
                  <div className="review-top">
                    <div>
                      <span className="review-name">{r.name}</span>
                      <span className="review-age">{r.age}</span>
                    </div>
                    <span className="review-tag">{r.tag}</span>
                  </div>
                  <div className="review-stars">{"★".repeat(5)}</div>
                  <p className="review-text">"{r.text}"</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, color: S.beige2, textAlign: "center", marginTop: 6 }}>
              {t("reviews.hint")}
            </p>
          </section>

          {/* ── 핵심 기능 4가지 ── */}
          <section className="sec" style={{ textAlign: "center" }}>
            <div className="badge">{t("core_features.badge")}</div>
            <h2 className="sec-title" style={{ whiteSpace: "pre-line" }}>
              {t("core_features.title")}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
              {messages.core_features.items.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#fff",
                    border: `1px solid ${S.beige}`,
                    borderRadius: 13,
                    padding: "18px 16px",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: S.cream2,
                    border: `1px solid ${S.beige}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: S.font, fontSize: 14, fontWeight: 700, color: S.ink }}>
                        {item.title}
                      </span>
                      {item.tag && (
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: S.gold,
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                        }}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12.5, color: S.ink3, lineHeight: 1.75, wordBreak: "keep-all", textAlign: "left" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 이용 요금 섹션 숨김 */}
          <section className="sec" style={{ background: S.cream2, display: "none" }} aria-hidden>
            <div className="badge">{t("pricing.badge")}</div>
            <h2 className="sec-title" style={{ fontSize: "1.25rem", whiteSpace: "pre-line" }}>
              {t("pricing.title")}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }} />
          </section>

          {/* ── 최종 CTA ── */}
          <section className="cta-sec">
            <p style={{ fontSize: 11, color: "rgba(245,241,234,.5)", letterSpacing: "0.12em", marginBottom: 14, fontWeight: 700 }}>
              {t("cta.eyebrow")}
            </p>
            <h2 className="cta-title" style={{ whiteSpace: "pre-line" }}>
              {t("cta.title")}
            </h2>
            <p className="cta-sub" style={{ whiteSpace: "pre-line" }}>
              {t("cta.sub")}
            </p>

            <button className="cta-btn" onClick={handleStart}>
              {t("cta.primary")}
            </button>
            <button className="cta-chat-btn" onClick={() => router.push("/chat")}>
              {t("cta.secondary")}
            </button>
          </section>

          {/* ── 푸터 ── */}
          <footer className="footer">
            <p className="footer-text" style={{ whiteSpace: "pre-line" }}>
              {t("footer.copy")}
              <br />
              {t("footer.sub")}
            </p>
          </footer>

        </div>
        {/* end pc-main */}
      </div>
      {/* end pc-layout */}

      {/* ── 플로팅 CTA (모바일) ── */}
      <div className="floating-cta">
        <button className="floating-btn-main" onClick={handleStart}>
          무료 사주 분석
        </button>
        <button className="floating-btn-chat" onClick={() => router.push("/chat")}>
          AI 대화
        </button>
      </div>
    </>
  );
}