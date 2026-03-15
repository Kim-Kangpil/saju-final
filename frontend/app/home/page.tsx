"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSavedSajuList } from "@/lib/sajuStorage";
import { Icon } from "@iconify/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function useCounter(target: number) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const duration = 1200;
        const start = performance.now();
        const animate = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return { count, ref };
}

const ALL_ANIMALS = [
  "갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미", "임신", "계유",
  "갑술", "을해", "병자", "정축", "무인", "기묘", "경진", "신사", "임오", "계미",
  "갑신", "을유", "병술", "정해", "무자", "기축", "경인", "신묘", "임진", "계사",
  "갑오", "을미", "병신", "정유", "무술", "기해", "경자", "신축", "임인", "계묘",
  "갑진", "을사", "병오", "정미", "무신", "기유", "경술", "신해", "임자", "계축",
  "갑인", "을묘", "병진", "정사", "무오", "기미", "경신", "신유", "임술", "계해",
];

const FEATURES = [
  { icon: "🌱", label: "타고난 기질" },
  { icon: "🎭", label: "사회적 가면" },
  { icon: "⚖️", label: "강점과 약점" },
  { icon: "🤝", label: "나의 인간관계" },
  { icon: "🌟", label: "각종 귀인" },
  { icon: "✨", label: "매력 코드" },
];

export default function HomePage({
  params,
}: {
  params?: Promise<Record<string, string | string[]>>;
}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [seedCount, setSeedCount] = useState(0);
  const [animals, setAnimals] = useState<string[]>([]);
  const [animalRound, setAnimalRound] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const getTodayCount = () => {
    if (typeof window === "undefined") return 100;
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem("saju_daily_count");
    if (stored) {
      try {
        const { date, base } = JSON.parse(stored);
        if (date === today) return base;
      } catch {}
    }
    const newBase = Math.floor(Math.random() * 71) + 80;
    localStorage.setItem("saju_daily_count", JSON.stringify({ date: today, base: newBase }));
    return newBase;
  };

  const baseCount = useRef(getTodayCount());
  const { count, ref: counterRef } = useCounter(baseCount.current);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    }
    const shuffled = [...ALL_ANIMALS].sort(() => Math.random() - 0.5);
    setAnimals(shuffled.slice(0, 6));
    const t = setTimeout(() => setShowPreview(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/seeds`, { credentials: "include" });
        const data = await res.json();
        if (!cancelled && typeof data?.seeds === "number") setSeedCount(data.seeds);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimals([...ALL_ANIMALS].sort(() => Math.random() - 0.5).slice(0, 6));
      setAnimalRound((r) => r + 1);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function handleStart() {
    if (!isLoggedIn) {
      router.push("/start");
      return;
    }
    const saved = getSavedSajuList();
    router.push(saved?.length > 0 ? "/saju-mypage" : "/saju-add");
  }

  return (
    <>
      <style>{`
        :root {
          --bg:        #F2EDE4;
          --surface:   #FFFCF7;
          --surface2:  #EDE8DF;
          --border:    #D8D2C8;
          --border2:   #C8C2B6;
          --text:      #2C2A26;
          --sub:       #7A776F;
          --muted:     #B0ACA4;
          --accent:    #4A6741;
          --accent-bg: #EBF0E8;
          --gold:      #8B6914;
          --gold-bg:   #FBF5E6;
          --serif:     'Gmarket Sans', -apple-system, sans-serif;
          --sans:      'Gmarket Sans', -apple-system, sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { -webkit-text-size-adjust: 100%; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--sans);
          min-width: 320px;
        }

        .landing-wrap {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          padding: 0 16px 80px;
          padding-left: max(16px, env(safe-area-inset-left));
          padding-right: max(16px, env(safe-area-inset-right));
          padding-bottom: max(80px, env(safe-area-inset-bottom));
          min-height: 100dvh;
          min-height: 100vh;
        }

        @media (min-width: 640px) {
          .landing-wrap { padding-left: 24px; padding-right: 24px; padding-bottom: 96px; }
        }

        @media (min-width: 768px) {
          .landing-wrap {
            max-width: 560px;
            padding: 0 32px 100px;
            border-radius: 0;
            box-shadow: 0 0 0 1px var(--border);
          }
        }

        @media (min-width: 1024px) {
          .landing-wrap { max-width: 600px; padding-left: 40px; padding-right: 40px; }
        }

        .l-header {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          margin: 0 -16px 0;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
        }
        @media (min-width: 640px) {
          .l-header { margin: 0 -24px 0; padding-left: 24px; padding-right: 24px; }
        }
        @media (min-width: 768px) {
          .l-header { margin: 0 -32px 0; padding-left: 32px; padding-right: 32px; }
        }

        .l-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .l-logo-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          background: var(--surface);
        }

        .l-logo-text {
          font-family: var(--serif);
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.02em;
        }

        .l-header-btn {
          padding: 7px 16px;
          border-radius: 999px;
          border: 1px solid var(--border2);
          background: transparent;
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          cursor: pointer;
          transition: background .15s;
        }
        .l-header-btn:hover { background: var(--surface2); }

        .l-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .l-header-icon-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid var(--border2);
          background: var(--surface);
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          cursor: pointer;
          transition: background .15s;
        }
        .l-header-icon-btn:hover { background: var(--surface2); }

        .l-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px 20px;
          margin-top: 12px;
          text-align: center;
          opacity: 0;
          transform: translateY(10px);
          animation: fadeUp .5s ease forwards;
        }
        @media (min-width: 640px) {
          .l-section { padding: 28px 24px; margin-top: 14px; border-radius: 18px; }
        }
        @media (min-width: 768px) {
          .l-section { padding: 32px 28px; margin-top: 16px; }
        }
        .l-section:nth-child(2) { animation-delay: .05s; }
        .l-section:nth-child(3) { animation-delay: .1s; }
        .l-section:nth-child(4) { animation-delay: .15s; }
        .l-section:nth-child(5) { animation-delay: .2s; }

        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .l-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--surface2);
          font-size: 11px;
          font-weight: 600;
          color: var(--sub);
          letter-spacing: 0.06em;
          margin-bottom: 16px;
        }

        .l-title {
          font-family: var(--serif);
          font-size: clamp(1.35rem, 4.5vw, 1.9rem);
          font-weight: 900;
          color: var(--text);
          line-height: 1.35;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        @media (min-width: 768px) {
          .l-title { font-size: clamp(1.6rem, 2vw, 1.95rem); }
        }

        .l-sub {
          font-size: 13px;
          color: var(--sub);
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .l-hero-logo {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          background: var(--surface2);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          margin: 0 auto 24px;
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }

        .l-cta {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .l-btn-primary {
          width: 100%;
          min-height: 48px;
          padding: 14px 20px;
          border-radius: 12px;
          border: none;
          background: #2C2A26;
          color: #F2EDE4;
          font-family: var(--serif);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: opacity .15s, transform .1s;
        }
        .l-btn-primary:active { transform: scale(.98); opacity: .9; }
        @media (min-width: 768px) {
          .l-btn-primary { padding: 16px 24px; min-height: 52px; font-size: 16px; }
        }

        .l-btn-secondary {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: 1px solid var(--border2);
          background: transparent;
          color: var(--sub);
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background .15s;
        }
        .l-btn-secondary:hover { background: var(--surface2); }

        .l-counter {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--surface2);
          margin-top: 18px;
        }

        .l-counter-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4CAF50;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: .6; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.3); }
        }

        .l-counter-text {
          font-size: 12px;
          color: var(--sub);
          font-weight: 500;
        }

        .animal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin: 14px 0;
        }
        @media (min-width: 640px) {
          .animal-grid { gap: 10px; margin: 16px 0; }
        }
        @media (min-width: 768px) {
          .animal-grid { gap: 12px; margin: 18px 0; }
        }

        .animal-cell {
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--surface2);
        }

        .animal-cell img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @keyframes cardFlip {
          from { opacity: 0; transform: perspective(300px) rotateY(-80deg); }
          to   { opacity: 1; transform: perspective(300px) rotateY(0); }
        }

        .animal-flip {
          animation: cardFlip .3s ease-out both;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 16px 0;
          text-align: left;
        }

        .feature-item {
          padding: 12px 14px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .feature-icon { font-size: 15px; flex-shrink: 0; }
        .feature-label { font-size: 12px; font-weight: 600; color: var(--text); }

        .spouse-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 14px 0;
          position: relative;
        }

        .spouse-card {
          aspect-ratio: 3/4;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--gold-bg);
          position: relative;
        }

        .spouse-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: blur(8px);
          transform: scale(1.08);
        }

        .spouse-lock {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .lock-badge {
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,.92);
          border: 1px solid #e6c96a;
          font-size: 10px;
          font-weight: 700;
          color: var(--gold);
        }

        .l-footer {
          text-align: center;
          padding: 24px 0 0;
          font-size: 10px;
          color: var(--muted);
        }
      `}</style>

      <div className="landing-wrap">

        <header className="l-header">
          <div className="l-logo">
            <div className="l-logo-img">
              <img
                src="/images/yin-yang-logo.png"
                alt="한양사주"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.currentTarget.style.display = "none"; (e.currentTarget.parentElement as HTMLElement).textContent = "☯"; }}
              />
            </div>
            <span className="l-logo-text">한양사주</span>
          </div>
          {isLoggedIn ? (
            <div className="l-header-right">
              <button type="button" className="l-header-icon-btn" onClick={() => router.push("/seed-charge")}>
                <Icon icon="mdi:ticket-confirmation-outline" width={18} />
                <span>{seedCount}</span>
              </button>
              <button type="button" className="l-header-icon-btn" onClick={() => router.push("/membership")}>
                <Icon icon="mdi:crown" width={18} />
                <span>Pro</span>
              </button>
              <button type="button" className="l-header-icon-btn" onClick={() => router.push("/saju-mypage")} aria-label="메뉴">
                <Icon icon="mdi:menu" width={22} />
              </button>
            </div>
          ) : (
            <button className="l-header-btn" onClick={() => router.push("/start")}>
              시작하기
            </button>
          )}
        </header>

        <section className="l-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="l-hero-logo">
            <img
              src="/images/yin-yang-logo.png"
              alt="태극"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.currentTarget.style.display = "none"; (e.currentTarget.parentElement as HTMLElement).textContent = "☯"; }}
            />
          </div>

          <h1 className="l-title">
            당신의 사주를<br />AI가 해석합니다
          </h1>
          <p className="l-sub">
            전통 사주명리학과 AI를 결합한<br />
            한양사주만의 정밀 분석
          </p>

          <div className="l-cta">
            <button className="l-btn-primary" onClick={handleStart}>
              내 사주 확인하기
            </button>
            <button className="l-btn-secondary" onClick={() => router.push("/chat")}>
              AI에게 먼저 물어보기
            </button>
          </div>

          <div ref={counterRef} className="l-counter">
            <div className="l-counter-dot" />
            <span className="l-counter-text">
              오늘 이미 <strong style={{ color: "var(--text)" }}>{count}</strong>명이 분석했습니다
            </span>
          </div>
        </section>

        <section className="l-section">
          <div className="l-badge">🐾 일주 동물</div>
          <p className="l-title" style={{ fontSize: "1.2rem" }}>
            60가지 중 단 하나,<br />나만의 일주 동물
          </p>

          <div className="animal-grid">
            {animals.map((animal, i) => (
              <div key={i} className="animal-cell">
                <div
                  key={`${animalRound}-${i}`}
                  className={animalRound > 0 ? "animal-flip" : ""}
                  style={{
                    width: "100%", height: "100%",
                    animationDelay: animalRound > 0 ? `${i * 40}ms` : undefined,
                  }}
                >
                  <img
                    src={`/images/day_pillars/${animal}.png`}
                    alt={animal}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: "var(--sub)" }}>
            이 중 하나가 당신의 일주 동물입니다.
          </p>
        </section>

        <section className="l-section">
          <div className="l-badge">🔵 사주 기반 분석</div>
          <p className="l-title" style={{ fontSize: "1.2rem" }}>
            전통 사주 이론으로<br />8글자를 해석합니다
          </p>

          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.label} className="feature-item">
                <span className="feature-icon">{f.icon}</span>
                <span className="feature-label">{f.label}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: "var(--sub)", marginTop: 8 }}>
            + 대운 · 세운 등 사주 전반에 걸친 통합 분석
          </p>
        </section>

        {showPreview && (
          <section className="l-section">
            <div className="l-badge" style={{ background: "#FBF5E6", borderColor: "#E6C96A", color: "var(--gold)" }}>
              💍 사주 기반 배우자 분석
            </div>
            <p className="l-title" style={{ fontSize: "1.2rem" }}>
              당신과 궁합이 맞는<br />배우자의 이미지
            </p>

            <div className="spouse-grid">
              {[1, 2].map((_, i) => (
                <div key={i} className="spouse-card">
                  <img
                    src={`/images/spouse_preview_${i + 1}.png`}
                    alt="배우자 미리보기"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div className="spouse-lock">
                    <span style={{ fontSize: 22 }}>🔒</span>
                    <span className="lock-badge">잠금 해제 시 확인</span>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "var(--sub)", lineHeight: 1.7, marginBottom: 20 }}>
              전통 사주명리 이론과 AI 이미지 생성 기술을 결합하여<br />
              당신과 궁합이 맞는 배우자의 특징을 예측합니다.
            </p>

            <button className="l-btn-primary" onClick={handleStart}>
              내 사주 확인하기
            </button>
          </section>
        )}

        <footer className="l-footer">
          © 2026 한양사주 · AI 사주명리 분석 서비스
        </footer>

      </div>
    </>
  );
}
