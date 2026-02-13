"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { RefObject } from "react";

function useCounter(target: number) {  // ✅ 반환 타입 제거
    const [count, setCount] = useState(0);
    const counterRef = useRef<HTMLDivElement>(null);
    const animated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !animated.current) {
                    animated.current = true;
                    const duration = 1200;
                    const start = performance.now();

                    const animate = (now: number) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); // easeOut
                        setCount(Math.floor(eased * target));

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };

                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.5 }
        );

        if (counterRef.current) observer.observe(counterRef.current);
        return () => observer.disconnect();
    }, [target]);

    return { count, counterRef };
}

export default function LandingPage() {
    const router = useRouter();
    const go = () => router.push("/");

    const [selectedMode, setSelectedMode] = useState<number | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [randomAnimals, setRandomAnimals] = useState<string[]>([]);

    // 오늘 날짜 기준 고정 카운트 (localStorage 활용)
    const getTodayCount = () => {
        if (typeof window === "undefined") return 100; // SSR 방어

        const today = new Date().toISOString().split("T")[0];
        const stored = localStorage.getItem("saju_daily_count");

        if (stored) {
            try {
                const { date, base } = JSON.parse(stored);
                if (date === today) return base;
            } catch { }
        }

        const newBase = Math.floor(Math.random() * 71) + 80;
        localStorage.setItem("saju_daily_count", JSON.stringify({ date: today, base: newBase }));
        return newBase;
    };

    const baseCount = useRef(getTodayCount());
    const { count, counterRef } = useCounter(baseCount.current);

    useEffect(() => {
        const timer = setTimeout(() => setShowPreview(true), 800);

        // 클라이언트에서만 랜덤 동물 생성
        const allAnimals = [
            "갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미", "임신", "계유",
            "갑술", "을해", "병자", "정축", "무인", "기묘", "경진", "신사", "임오", "계미",
            "갑신", "을유", "병술", "정해", "무자", "기축", "경인", "신묘", "임진", "계사",
            "갑오", "을미", "병신", "정유", "무술", "기해", "경자", "신축", "임인", "계묘",
            "갑진", "을사", "병오", "정미", "무신", "기유", "경술", "신해", "임자", "계축",
            "갑인", "을묘", "병진", "정사", "무오", "기미", "경신", "신유", "임술", "계해",
        ];
        const shuffled = [...allAnimals].sort(() => Math.random() - 0.5);
        setRandomAnimals(shuffled.slice(0, 6));

        return () => clearTimeout(timer);
    }, []);

    return (
        <main style={{ background: "#eef4ee", minHeight: "100vh", fontFamily: "'Gowun Dodum', sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@700;900&family=Gowun+Dodum&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .serif { font-family: 'Noto Serif KR', serif; }
        .sans  { font-family: 'Gowun Dodum', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: .7; transform: scale(1); }
          50%      { opacity: 1;  transform: scale(1.05); }
        }

        .fu0 { animation: fadeUp .6s ease both; }
        .fu1 { animation: fadeUp .6s .15s ease both; }
        .fu2 { animation: fadeUp .6s .3s ease both; }
        .fu3 { animation: fadeUp .6s .45s ease both; }
        .fu4 { animation: fadeUp .6s .6s ease both; }

        .ham-float { animation: float 3s ease-in-out infinite; }
        .pulse-text { animation: pulse 2.5s ease-in-out infinite; }

        .tap {
          transition: transform .15s ease, opacity .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; }

        .mode-card {
          transition: all .2s ease;
          cursor: pointer;
        }
        .mode-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(85,107,47,.15);
        }
        .mode-card.selected {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 8px 24px rgba(85,107,47,.2);
        }
        
        .animal-card {
          transition: transform .2s ease;
        }
        .animal-card:hover {
          transform: translateY(-2px) scale(1.03);
        }

        .blur-cover {
          filter: blur(6px);
          user-select: none;
          pointer-events: none;
        }

        .wrap {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 0 20px 80px;
        }
        
        /* 모바일 터치 스크롤 최적화 */
        .scroll-container {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
        }
        
        @media (max-width: 390px) {
          .wrap { padding: 0 16px 80px; }
        }
      `}</style>

            <div className="wrap">

                {/* ── 헤더 ── */}
                <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, paddingBottom: 16 }} className="fu0">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img src="/images/ham_icon.png" alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
                        <span className="sans" style={{ fontSize: 13, fontWeight: 700, color: "#2d4a1e", letterSpacing: "0.04em" }}>한양사주</span>
                    </div>
                    <button onClick={go} className="tap sans"
                        style={{ fontSize: 12, fontWeight: 700, color: "#556b2f", padding: "6px 16px", borderRadius: 99, border: "1.5px solid #adc4af", background: "transparent" }}>
                        시작하기
                    </button>
                </header>

                {/* ── 1. 히어로: NEW GAME ── */}
                <div className="fu1" style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #c8dac8", padding: "40px 28px 36px", marginBottom: 14, position: "relative", overflow: "hidden", textAlign: "center" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: .03, backgroundImage: "radial-gradient(circle, #556b2f 1px, transparent 1px)", backgroundSize: "8px 8px", pointerEvents: "none" }} />

                    <div style={{ position: "relative" }}>
                        <div style={{ display: "inline-block", padding: "5px 14px", background: "#e8f0e8", border: "1.5px solid #adc4af", borderRadius: 99, marginBottom: 20 }}>
                            <span className="sans" style={{ fontSize: 11, fontWeight: 700, color: "#556b2f", letterSpacing: "0.1em" }}>🟢 NEW GAME</span>
                        </div>

                        <h1 className="serif" style={{ fontSize: "clamp(1.75rem, 5vw, 2rem)", fontWeight: 900, color: "#1a2e0e", lineHeight: 1.23, marginBottom: 14, letterSpacing: "-0.02em" }}>
                            당신의 사주 캐릭터를<br />생성하시겠습니까?
                        </h1>

                        <div className="ham-float" style={{ margin: "10px auto 20px", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src="/images/ham_icon.png" alt="햄스터" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 6px 16px rgba(85,107,47,.25))" }} />
                        </div>

                        <p className="sans" style={{ fontSize: 14, fontWeight: 500, color: "#556b2f", opacity: .85, lineHeight: 1.7, marginBottom: 28 }}>
                            복잡한 사주를, 가볍게
                        </p>

                        <button onClick={go} className="tap sans"
                            style={{
                                width: "100%", maxWidth: 320, padding: "16px 0", borderRadius: 14,
                                fontWeight: 700, fontSize: 15, color: "#1a2e0e",
                                background: "linear-gradient(135deg, #fef08a 0%, #fde047 100%)",
                                border: "none",
                                boxShadow: "0 4px 14px rgba(251,191,36,.3)",
                            }}>
                            ▶ 무료로 생성하기
                        </button>

                        <div ref={counterRef} style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(85,107,47,.06)", borderRadius: 99, border: "1px solid rgba(85,107,47,.12)" }}>
                            <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>✔</span>
                            <p className="sans" style={{ fontSize: 11, color: "#556b2f", fontWeight: 600, margin: 0 }}>
                                오늘 이미 <span style={{ fontWeight: 800, color: "#2d4a1e" }}>{count}</span>명이 생성했습니다
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── 2. 일주 동물 갤러리 ── */}
                <div className="fu2" style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #c8dac8", padding: "28px 24px", marginBottom: 14, textAlign: "center" }}>
                    <div style={{ display: "inline-block", padding: "4px 10px", background: "#f3e8ff", border: "1.5px solid #c084fc", borderRadius: 99, marginBottom: 16 }}>
                        <span className="sans" style={{ fontSize: 10, fontWeight: 700, color: "#581c87", letterSpacing: "0.08em" }}>🐾 일주 동물</span>
                    </div>

                    <p className="serif" style={{ fontSize: 15, fontWeight: 700, color: "#1a2e0e", lineHeight: 1.75, marginBottom: 18 }}>
                        60가지 중 단 하나.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: "4px 0 12px", marginBottom: 16 }}>
                        {randomAnimals.map((animal, i) => (
                            <div
                                key={i}
                                className="animal-card"
                                style={{
                                    width: "100%",
                                    aspectRatio: "1 / 1",
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    border: "1.5px solid #e0e7e0",
                                    background: "#fafcfa",
                                    animation: `fadeInSlide 0.5s ease-out both`,
                                    animationDelay: `${300 + i * 120}ms`,
                                }}
                            >
                                <img
                                    src={`/images/day_pillars/${animal}.png`}
                                    alt={animal}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                            </div>
                        ))}
                    </div>

                    <p className="sans" style={{ fontSize: 12, color: "#556b2f", opacity: .7 }}>
                        이 중 하나가 당신의 일주 동물입니다.
                    </p>
                </div>



                {/* ── 4. 사주 기반 분석 ── */}
                <div className="fu3" style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #c8dac8", padding: "28px 24px", marginBottom: 14, textAlign: "center" }}>
                    <div style={{ display: "inline-block", padding: "4px 10px", background: "#e0f2fe", border: "1.5px solid #93c5fd", borderRadius: 99, marginBottom: 16 }}>
                        <span className="sans" style={{ fontSize: 10, fontWeight: 700, color: "#0c4a6e", letterSpacing: "0.08em" }}>🔵 사주 기반 분석</span>
                    </div>

                    <p className="serif" style={{ fontSize: 15, fontWeight: 700, color: "#1a2e0e", lineHeight: 1.75, marginBottom: 16 }}>
                        전통 사주 이론을 기반으로<br />
                        사주 8글자를 해석합니다.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        {["🌱 타고난 기질", "🎭 사회적 가면", "⚖️ 강점과 약점", "🤝 나의 인간관계", "🌟 각종귀인", "✨ 매력코드"].map((item, i) => (
                            <div key={i} style={{ padding: "10px 12px", background: "#f7faf7", border: "1.5px solid #dce8dc", borderRadius: 10 }}>
                                <p className="sans" style={{ fontSize: 11, color: "#556b2f", fontWeight: 700 }}>{item}</p>
                            </div>
                        ))}
                    </div>

                    <p className="sans" style={{ fontSize: 12, color: "#556b2f", opacity: .7 }}>
                        ✔ 그 외 대운 등 사주 전반에 걸친 통합 분석
                    </p>
                </div>

                {/* ── 5. 해석 모드 선택 ── */}
                <div className="fu4" style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #c8dac8", padding: "28px 24px", marginBottom: 14, textAlign: "center" }}>
                    <div style={{ display: "inline-block", padding: "4px 10px", background: "#fef3c7", border: "1.5px solid #fbbf24", borderRadius: 99, marginBottom: 12 }}>
                        <span className="sans" style={{ fontSize: 10, fontWeight: 700, color: "#78350f", letterSpacing: "0.08em" }}>🐹 해석 모드</span>
                    </div>

                    <p className="serif" style={{ fontSize: 15, fontWeight: 700, color: "#1a2e0e", lineHeight: 1.75, marginBottom: 20 }}>
                        당신의 사주,<br />어떤 결로 풀어볼까요?
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                        {[
                            { name: "공감형", desc: "감정의 결을 따라 풀이합니다.", img: "/images/ham_soft.png", bc: "#e0e7e0" },
                            { name: "분석형", desc: "구조를 기준으로 해석합니다.", img: "/images/ham_cold.png", bc: "#e0e7e0" },
                            { name: "친구형", desc: "있는 그대로 짚어드립니다.", img: "/images/ham_friend.png", bc: "#e0e7e0" },
                        ].map((mode, i) => (
                            <div
                                key={i}
                                className={`mode-card ${selectedMode === i ? "selected" : ""}`}
                                onClick={() => setSelectedMode(i)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 14,
                                    padding: "16px 18px", borderRadius: 14,
                                    background: selectedMode === i ? "#f7faf7" : "#fafcfa",
                                    border: `1.5px solid ${selectedMode === i ? "#c8dac8" : "#e0e7e0"}`,
                                }}
                            >
                                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#fff", border: `1.5px solid ${selectedMode === i ? "#c8dac8" : "#e8ece8"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                                    <img src={mode.img} alt={mode.name} style={{ width: 36, height: 36, objectFit: "contain" }} />
                                </div>
                                <div style={{ flex: 1, textAlign: "left" }}>
                                    <p className="sans" style={{ fontSize: 13, fontWeight: 600, color: "#1a2e0e", marginBottom: 4, letterSpacing: "0.01em" }}>{mode.name}</p>
                                    <p className="sans" style={{ fontSize: 11, color: "#556b2f", opacity: .8, lineHeight: 1.5, fontWeight: 400 }}>{mode.desc}</p>
                                </div>
                                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${selectedMode === i ? "#c8dac8" : "#e0e7e0"}`, background: selectedMode === i ? "#c8dac8" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {selectedMode === i && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedMode !== null && (
                        <div style={{ padding: "12px 16px", background: "#f7faf7", border: "1.5px solid #c8dac8", borderRadius: 12, animation: "fadeUp .4s ease both" }}>
                            <p className="sans" style={{ fontSize: 12, color: "#2d4a1e", fontWeight: 700 }}>
                                {["공감형", "분석형", "친구형"][selectedMode]}이 당신의 사주를 읽습니다.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── 6. 1차 결과 미리보기 ── */}
                {showPreview && (
                    <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #c8dac8", padding: "28px 24px", marginBottom: 14, animation: "fadeUp .6s ease both", textAlign: "center" }}>
                        <div style={{ display: "inline-block", padding: "4px 10px", background: "#f3e8ff", border: "1.5px solid #c084fc", borderRadius: 99, marginBottom: 16 }}>
                            <span className="sans" style={{ fontSize: 10, fontWeight: 700, color: "#581c87", letterSpacing: "0.08em" }}>🟠 1차 결과 미리보기</span>
                        </div>

                        <div style={{ padding: "16px 18px", background: "#f7fbf7", border: "1.5px solid #dce8dc", borderRadius: 12, marginBottom: 10 }}>
                            <p className="serif" style={{ fontSize: 14, color: "#1a2e0e", lineHeight: 1.85, marginBottom: 12 }}>
                                당신은 감정 에너지가 깊은 구조입니다.
                            </p>
                            <p className="sans" style={{ fontSize: 13, color: "#556b2f", lineHeight: 1.75 }}>
                                겉은 차분하지만 내면에서는 빠르게 판단합니다.
                            </p>
                        </div>

                        <p className="serif" style={{ fontSize: 14, fontWeight: 700, color: "#2d4a1e", marginBottom: 10 }}>
                            그리고
                        </p>

                        <div style={{ position: "relative", marginBottom: 18 }}>
                            <div style={{ padding: "16px 18px", background: "#f7fbf7", border: "1.5px solid #dce8dc", borderRadius: 12 }}>
                                <p className="sans blur-cover" style={{ fontSize: 13, color: "#556b2f", lineHeight: 1.75 }}>
                                    사람을 고를 때 무의식적인 기준이 있습니다. 특정 유형에게 끌리는 이유와 매번 비슷한 방식으로 관계가 흘러가는 패턴이 보입니다.
                                </p>
                            </div>
                            <div style={{ position: "absolute", inset: 0, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(247,251,247,.65)" }}>
                                <span style={{ fontSize: 18, marginBottom: 4 }}>🔒</span>
                                <p className="sans" style={{ fontSize: 10, color: "#2d4a1e", fontWeight: 700 }}>잠금됨</p>
                            </div>
                        </div>

                        <p className="sans" style={{ fontSize: 12, color: "#556b2f", opacity: .65, marginBottom: 4 }}>…</p>
                        <p className="sans" style={{ fontSize: 12, color: "#556b2f", opacity: .65, marginBottom: 4 }}>여기까지는 기본 분석입니다.</p>
                        <div style={{ height: 1, background: "#dce8dc", margin: "16px 0" }} />

                        {/* 배우자 AI 미리보기 */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: "inline-block", padding: "4px 10px", background: "#fef3c7", border: "1.5px solid #fbbf24", borderRadius: 99, marginBottom: 12 }}>
                                <span className="sans" style={{ fontSize: 10, fontWeight: 700, color: "#78350f", letterSpacing: "0.08em" }}>💍 사주 기반 배우자 분석</span>
                            </div>

                            <p className="serif" style={{ fontSize: 14, fontWeight: 700, color: "#1a2e0e", lineHeight: 1.75, marginBottom: 16 }}>
                                당신의 사주팔자와 궁합이 맞는<br />
                                배우자의 이미지를 AI가 생성했습니다.
                            </p>

                            {/* 블러 처리된 배우자 이미지 */}
                            <div style={{ position: "relative", marginBottom: 14 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                    {[1, 2].map((_, i) => (
                                        <div key={i} style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: 12, overflow: "hidden", border: "1.5px solid #f0d060", background: "#fafcfa" }}>
                                            <img
                                                src={`/images/spouse_preview_${i + 1}.png`}
                                                alt="배우자 미리보기"
                                                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(8px)", transform: "scale(1.1)" }}
                                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                            />
                                            <div style={{ position: "absolute", inset: 0, background: "rgba(254,243,199,.3)" }} />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ position: "absolute", inset: 0, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontSize: 24, marginBottom: 6 }}>🔒</span>
                                    <p className="sans" style={{ fontSize: 11, color: "#78350f", fontWeight: 700, background: "rgba(255,255,255,.95)", padding: "4px 10px", borderRadius: 99, border: "1.5px solid #fbbf24" }}>
                                        잠금 해제 시 확인 가능
                                    </p>
                                </div>
                            </div>

                            <p className="sans" style={{ fontSize: 11, color: "#92400e", opacity: .75, lineHeight: 1.7, marginBottom: 8 }}>
                                전통 사주명리 이론과 AI 이미지 생성 기술을 결합하여<br />
                                당신과 궁합이 맞는 배우자의 외형적 특징을 예측합니다.
                            </p>
                        </div>

                        <div style={{ height: 1, background: "#dce8dc", margin: "16px 0" }} />

                        <div style={{ marginBottom: 20 }}>
                            <p className="serif pulse-text" style={{ fontSize: 16, fontWeight: 900, color: "#1a2e0e", marginBottom: 8 }}>
                                당신의 일주 동물,<br />지금 확인하시겠습니까?
                            </p>
                        </div>

                        <button onClick={go} className="tap sans"
                            style={{
                                width: "100%", padding: "15px 0", borderRadius: 14,
                                fontWeight: 700, fontSize: 14, color: "#1a2e0e",
                                background: "linear-gradient(135deg, #fef08a 0%, #fde047 100%)",
                                border: "none",
                                boxShadow: "0 3px 14px rgba(251,191,36,.35)",
                            }}>
                            ▶ 내 동물 확인하기
                        </button>

                        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(85,107,47,.06)", borderRadius: 99, border: "1px solid rgba(85,107,47,.12)" }}>
                            <p className="sans" style={{ fontSize: 11, color: "#556b2f", fontWeight: 600, margin: 0 }}>
                                오늘 이미 <span style={{ fontWeight: 800, color: "#2d4a1e" }}>{count + 23}</span>명이 자신의 동물을 확인했습니다
                            </p>
                        </div>
                    </div>
                )}

                {/* ── 7. 푸터 ── */}
                <div style={{ padding: "20px 0", textAlign: "center" }}>
                    <p className="sans" style={{ fontSize: 10, color: "#556b2f", opacity: .3 }}>
                        © 2025 한양사주 · AI 사주명리 분석 서비스
                    </p>
                </div>

            </div>
        </main>
    );
}
