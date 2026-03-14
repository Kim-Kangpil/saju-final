"use client";

import { use, useState, useEffect, useRef, useMemo } from "react";
import type { RefObject } from "react";
import { useRouter } from "next/navigation";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";
import { getSavedSajuList } from "@/lib/sajuStorage";

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

// ✅ 여기 추가 시작
const MODE_EXAMPLES: Record<string, string[]> = {
    공감형: [
        "요즘은 마음이 먼저 반응하고, 머리가 나중에 따라오는 흐름이에요.",
        "겉으로는 괜찮아 보여도 속은 생각이 많아지는 시기예요.",
        "사람 문제로 예민해질 수 있지만, 그만큼 감각은 정확해요.",
        "억지로 버티기보다 감정 피로부터 낮추는 게 먼저예요.",
        "결과보다 ‘내가 편해지는 선택’이 더 좋은 답이에요.",
        "말 한마디가 크게 남을 수 있어요. 부드럽게 정리해보면 좋아요.",
    ],
    분석형: [
        "지금 흐름은 선택과 집중이 이득입니다. 분산하면 손해가 커져요.",
        "현재는 속도보다 구조가 중요합니다. 순서만 잡아도 해결돼요.",
        "이번 달은 ‘관계’보다 ‘성과’에 가중치가 실리는 타이밍이에요.",
        "리스크는 하나뿐입니다. 계획을 너무 늦게 확정하는 것.",
        "데이터로 보면, 지금은 공격보다 정리·정돈이 수익률이 좋아요.",
        "결론만 말하면, 방향은 맞고 페이스 조절만 하면 됩니다.",
    ],
    친구형: [
        "솔직히 말하면 지금은 고민 오래 할수록 손해야. 그냥 가.",
        "사람 때문에 흔들리지 마. 네 기준이 맞는 날이야.",
        "이번엔 밀어붙여도 돼. 이건 네가 이길 판이야.",
        "선 넘는 사람? 바로 거리 둬. 손해 보는 건 너야.",
        "타이밍 좋다. 오늘 한 번에 처리해버려.",
        "괜히 겁먹지 마. 네가 생각하는 것보다 상황은 단순해.",
    ],
};

function pick3(arr: string[]) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, 3);
}
// ✅ 여기 추가 끝

export default function LandingPage({
  params,
}: {
  params?: Promise<Record<string, string | string[]>>;
}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
    const go = () => router.push("/start");

    const [selectedMode, setSelectedMode] = useState<number | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [randomAnimals, setRandomAnimals] = useState<string[]>([]);
    const [animalRound, setAnimalRound] = useState(0);

    // ✅ 추가
    const [modeSeed, setModeSeed] = useState(0);

    const ALL_ANIMALS = useMemo(() => [
        "갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미", "임신", "계유",
        "갑술", "을해", "병자", "정축", "무인", "기묘", "경진", "신사", "임오", "계미",
        "갑신", "을유", "병술", "정해", "무자", "기축", "경인", "신묘", "임진", "계사",
        "갑오", "을미", "병신", "정유", "무술", "기해", "경자", "신축", "임인", "계묘",
        "갑진", "을사", "병오", "정미", "무신", "기유", "경술", "신해", "임자", "계축",
        "갑인", "을묘", "병진", "정사", "무오", "기미", "경신", "신유", "임술", "계해",
    ], []);

    const modeName = selectedMode === null ? null : ["공감형", "분석형", "친구형"][selectedMode];
    const modeExamples = useMemo(() => {
        if (!modeName) return [];
        const pool = MODE_EXAMPLES[modeName] || [];
        return pick3(pool);
    }, [modeName, modeSeed]);
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

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const logged = localStorage.getItem("isLoggedIn") === "true";
            setIsLoggedIn(logged);
        }

        const timer = setTimeout(() => setShowPreview(true), 800);

        // 초기 랜덤 동물 6개
        const all = [
            "갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미", "임신", "계유",
            "갑술", "을해", "병자", "정축", "무인", "기묘", "경진", "신사", "임오", "계미",
            "갑신", "을유", "병술", "정해", "무자", "기축", "경인", "신묘", "임진", "계사",
            "갑오", "을미", "병신", "정유", "무술", "기해", "경자", "신축", "임인", "계묘",
            "갑진", "을사", "병오", "정미", "무신", "기유", "경술", "신해", "임자", "계축",
            "갑인", "을묘", "병진", "정사", "무오", "기미", "경신", "신유", "임술", "계해",
        ];
        const shuffled = [...all].sort(() => Math.random() - 0.5);
        setRandomAnimals(shuffled.slice(0, 6));

        return () => clearTimeout(timer);
    }, []);

    // 3초마다 일주 동물 랜덤 교체 (카드 뒤집기용 round 증가)
    useEffect(() => {
        const id = setInterval(() => {
            const shuffled = [...ALL_ANIMALS].sort(() => Math.random() - 0.5);
            setRandomAnimals(shuffled.slice(0, 6));
            setAnimalRound((r) => r + 1);
        }, 3000);
        return () => clearInterval(id);
    }, [ALL_ANIMALS]);

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
        @keyframes cardFlipIn {
          from { opacity: 0; transform: perspective(320px) rotateY(-88deg); }
          to   { opacity: 1; transform: perspective(320px) rotateY(0); }
        }
        .animal-card-flip {
          animation: cardFlipIn 0.5s ease-out both;
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
                <header
                    className="fu0"
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        margin: "0 -20px 8px",
                        background: "#c1d8c3",
                        borderBottom: "3px solid #adc4af",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <HamIcon style={{ width: 28, height: 28, objectFit: "contain" }} alt="" />
                        <span className="sans" style={{ fontSize: 13, fontWeight: 700, color: "#2d4a1e", letterSpacing: "0.04em" }}>한양사주</span>
                    </div>
                    {isLoggedIn ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            {/* 씨앗 캐시 (클릭 시 충전 페이지) */}
                            <button
                                type="button"
                                onClick={() => router.push("/seed-charge")}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    padding: "6px 10px",
                                    borderRadius: 999,
                                    background: "rgba(255,255,255,0.85)",
                                    border: "1.5px solid #adc4af",
                                    cursor: "pointer",
                                }}
                            >
                                <Icon icon="mdi:seed-outline" width={18} />
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: "#345024",
                                    }}
                                >
                                    0
                                </span>
                            </button>

                            {/* 해바라기 멤버십 (클릭 시 멤버십 페이지) */}
                            <button
                                type="button"
                                onClick={() => router.push("/membership")}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    padding: "6px 10px",
                                    borderRadius: 999,
                                    background: "rgba(255,255,255,0.85)",
                                    border: "1.5px solid #adc4af",
                                    cursor: "pointer",
                                }}
                            >
                                <Icon icon="fluent-emoji-flat:sunflower" width={18} />
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>멤버십</span>
                            </button>

                            {/* 햄버거 메뉴 아이콘 */}
                            <button
                                type="button"
                                className="tap"
                                aria-label="메뉴 열기"
                                onClick={() => router.push("/saju-mypage")}
                                style={{
                                    padding: 8,
                                    borderRadius: 10,
                                    border: "none",
                                    background: "transparent",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Icon icon="mdi:menu" width={22} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={go}
                            className="tap sans"
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#556b2f",
                                padding: "6px 16px",
                                borderRadius: 99,
                                border: "1.5px solid #adc4af",
                                background: "transparent",
                            }}
                        >
                            시작하기
                        </button>
                    )}
                </header>

                {/* ── 1. 히어로: NEW GAME ── */}
                <div className="fu1" style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #c8dac8", padding: "40px 28px 36px", marginBottom: 14, position: "relative", overflow: "hidden", textAlign: "center" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: .03, backgroundImage: "radial-gradient(circle, #556b2f 1px, transparent 1px)", backgroundSize: "8px 8px", pointerEvents: "none", zIndex: 0 }} />

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "inline-block", padding: "5px 14px", background: "#e8f0e8", border: "1.5px solid #adc4af", borderRadius: 99, marginBottom: 20 }}>
                            <span className="sans" style={{ fontSize: 11, fontWeight: 700, color: "#556b2f", letterSpacing: "0.1em" }}>🟢 NEW GAME</span>
                        </div>

                        <h1 className="serif" style={{ fontSize: "clamp(1.75rem, 5vw, 2rem)", fontWeight: 900, color: "#1a2e0e", lineHeight: 1.23, marginBottom: 14, letterSpacing: "-0.02em" }}>
                            당신의 사주 캐릭터를<br />생성하시겠습니까?
                        </h1>

                        <div className="ham-float" style={{ margin: "10px auto 20px", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <HamIcon priority alt="햄스터" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 6px 16px rgba(85,107,47,.25))" }} />
                        </div>

                        <p className="sans" style={{ fontSize: 14, fontWeight: 500, color: "#556b2f", opacity: .85, lineHeight: 1.7, marginBottom: 28 }}>
                            복잡한 사주를, 가볍게
                        </p>

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

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: "4px 0 12px", marginBottom: 16, perspective: "400px" }}>
                        {randomAnimals.map((animal, i) => (
                            <div
                                key={`${animalRound}-${i}-${animal}`}
                                className={`animal-card ${animalRound > 0 ? "animal-card-flip" : ""}`}
                                style={{
                                    width: "100%",
                                    aspectRatio: "1 / 1",
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    border: "1.5px solid #e0e7e0",
                                    background: "#fafcfa",
                                    ...(animalRound === 0
                                        ? { animation: "fadeInSlide 0.5s ease-out both", animationDelay: `${300 + i * 120}ms` }
                                        : { animationDelay: `${i * 80}ms` }),
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
                            { name: "공감형", desc: "감정 기복이 크거나 위로가 필요한 분에게", img: "/images/ham_soft.png", bc: "#e0e7e0" },
                            { name: "분석형", desc: "정리된 팩트 위주로 빠르게 확인하고 싶은 분에게", img: "/images/ham_cold.png", bc: "#e0e7e0" },
                            { name: "친구형", desc: "재미있게 듣지만 핵심은 챙기고 싶은 분에게", img: "/images/ham_friend.png", bc: "#e0e7e0" },
                        ].map((mode, i) => (
                            <div
                                key={i}
                                className={`mode-card ${selectedMode === i ? "selected" : ""}`}
                                onClick={() => {
                                    setSelectedMode(i);
                                    setModeSeed((v) => v + 1);
                                }}
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
                        <div
                            style={{
                                marginTop: 10,
                                borderRadius: 14,
                                border: "1.5px solid #c8dac8",
                                background: "#ffffff",
                                overflow: "hidden",
                                animation: "fadeUp .4s ease both",
                                boxShadow: "0 6px 18px rgba(85,107,47,.08)",
                                textAlign: "left",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "12px 14px",
                                    background: "#f7faf7",
                                    borderBottom: "1px solid #e3eee3",
                                }}
                            >
                                <div>
                                    <p className="sans" style={{ fontSize: 12, fontWeight: 800, color: "#2d4a1e", marginBottom: 2 }}>
                                        💬 {modeName} 말투 예시
                                    </p>
                                    <p className="sans" style={{ fontSize: 10, color: "#556b2f", opacity: 0.75 }}>
                                        실제 해석은 입력값에 따라 더 구체화됩니다
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="tap sans"
                                    onClick={() => setModeSeed((v) => v + 1)}
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        color: "#556b2f",
                                        padding: "7px 10px",
                                        borderRadius: 99,
                                        border: "1.5px solid #adc4af",
                                        background: "#ffffff",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    다른 예시 ↻
                                </button>
                            </div>

                            <div style={{ padding: "12px 14px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {modeExamples.map((line, idx) => (
                                        <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                            <div style={{ width: 8, height: 8, borderRadius: 99, background: "#8fb996", marginTop: 7, flexShrink: 0 }} />
                                            <div
                                                style={{
                                                    flex: 1,
                                                    background: "#fafcfa",
                                                    border: "1.5px solid #e0e7e0",
                                                    borderRadius: 14,
                                                    padding: "10px 12px",
                                                }}
                                            >
                                                <p className="sans" style={{ fontSize: 12, color: "#1a2e0e", lineHeight: 1.7 }}>
                                                    {line}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── 6. 1차 결과 미리보기 ── */}
                {showPreview && (
                    <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #c8dac8", padding: "28px 24px", marginBottom: 14, animation: "fadeUp .6s ease both", textAlign: "center" }}>





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

                        <div style={{ marginBottom: 20 }}>
                            <p className="serif pulse-text" style={{ fontSize: 16, fontWeight: 900, color: "#1a2e0e", marginBottom: 8 }}>
                                당신의 일주 동물,<br />지금 확인하시겠습니까?
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                if (!isLoggedIn) {
                                    router.push("/start");
                                } else {
                                    const saved = getSavedSajuList();
                                    if (!saved || saved.length === 0) {
                                        router.push("/saju-add");
                                    } else {
                                        router.push("/saju-list");
                                    }
                                }
                            }}
                            className="tap sans"
                            style={{
                                width: "100%", padding: "15px 0", borderRadius: 14,
                                fontWeight: 700, fontSize: 14, color: "#1a2e0e",
                                background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                                border: "none",
                                boxShadow: "0 3px 14px rgba(85,107,47,.35)",
                            }}>
                            ▶ 내 사주 확인하기
                        </button>

                        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(85,107,47,.06)", borderRadius: 99, border: "1px solid rgba(85,107,47,.12)" }}>
                            <p className="sans" style={{ fontSize: 11, color: "#556b2f", fontWeight: 600, margin: 0 }}>
                                오늘 이미 <span style={{ fontWeight: 800, color: "#2d4a1e" }}>{count}</span>명이 생성했습니다
                            </p>
                        </div>
                    </div>
                )}

                {/* ── 7. 푸터 ── */}
                <div style={{ padding: "20px 0", textAlign: "center" }}>
                    <p className="sans" style={{ fontSize: 10, color: "#556b2f", opacity: .3 }}>
                        © 2026 한양사주 · AI 사주명리 분석 서비스
                    </p>
                </div>

            </div>
        </main>
    );
}
