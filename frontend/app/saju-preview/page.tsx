"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { use, useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";
import { dayPillarTexts } from "@/data/dayPillarAnimal";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

const HANJA_TO_HANGUL: Record<string, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무", 己: "기",
  庚: "경", 辛: "신", 壬: "임", 癸: "계",
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};

function hanjaToHangul(h: string): string {
  return HANJA_TO_HANGUL[h] ?? "";
}

function dayPillarToKey(dayPillar: string): string {
  if (!dayPillar || dayPillar.length < 2) return "";
  return hanjaToHangul(dayPillar[0]) + hanjaToHangul(dayPillar[1]);
}

function getDayPillarAnimalName(dayPillarKey: string): string {
  const text = dayPillarTexts[dayPillarKey]?.empathy;
  if (!text) return "";
  const m = text.match(/일주 동물<\/strong>은 (.+?)입니다/);
  return m ? m[1].trim() : "";
}

/** 동물 이름 앞 색상 접두사(하늘빛, 은빛 등)에 맞는 텍스트 색상 */
const ANIMAL_COLOR_BY_PREFIX: Record<string, string> = {
  하늘빛: "#5B9BD5",
  은빛: "#9CA3AF",
  초록빛: "#059669",
  연두빛: "#84CC16",
  주황빛: "#EA580C",
  노랑빛: "#CA8A04",
  연노랑빛: "#D4A853",
  붉은빛: "#DC2626",
  파랑빛: "#2563EB",
};

function getAnimalNameColor(animalName: string): string {
  for (const prefix of Object.keys(ANIMAL_COLOR_BY_PREFIX)) {
    if (animalName.startsWith(prefix)) return ANIMAL_COLOR_BY_PREFIX[prefix];
  }
  return "var(--text-primary)";
}

type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";

function stemMeta(stem: string): { el: Element; pol: Polarity } | null {
  const map: Record<string, { el: Element; pol: Polarity }> = {
    甲: { el: "wood", pol: "yang" }, 乙: { el: "wood", pol: "yin" },
    丙: { el: "fire", pol: "yang" }, 丁: { el: "fire", pol: "yin" },
    戊: { el: "earth", pol: "yang" }, 己: { el: "earth", pol: "yin" },
    庚: { el: "metal", pol: "yang" }, 辛: { el: "metal", pol: "yin" },
    壬: { el: "water", pol: "yang" }, 癸: { el: "water", pol: "yin" },
  };
  return map[stem] ?? null;
}

function branchMainStem(branch: string): string | null {
  const map: Record<string, string> = {
    子: "癸", 丑: "己", 寅: "甲", 卯: "乙", 辰: "戊", 巳: "丙",
    午: "丁", 未: "己", 申: "庚", 酉: "辛", 戌: "戊", 亥: "壬",
  };
  return map[branch] ?? null;
}

function produces(a: Element, b: Element): boolean {
  const next: Record<Element, Element> = {
    wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood",
  };
  return next[a] === b;
}

function controls(a: Element, b: Element): boolean {
  const map: Record<Element, Element> = {
    wood: "earth", fire: "metal", earth: "water", metal: "wood", water: "fire",
  };
  return map[a] === b;
}

function tenGod(dayStem: string, targetStem: string): string {
  const dm = stemMeta(dayStem);
  const tm = stemMeta(targetStem);
  if (!dm || !tm) return "";
  const samePol = dm.pol === tm.pol;
  if (dm.el === tm.el) return samePol ? "비견" : "겁재";
  if (produces(dm.el, tm.el)) return samePol ? "식신" : "상관";
  if (produces(tm.el, dm.el)) return samePol ? "편인" : "정인";
  if (controls(dm.el, tm.el)) return samePol ? "편재" : "정재";
  if (controls(tm.el, dm.el)) return samePol ? "편관" : "정관";
  return "";
}

function hanjaToElement(h: string): Element | "none" {
  const wood = new Set(["甲", "乙", "寅", "卯"]);
  const fire = new Set(["丙", "丁", "巳", "午"]);
  const earth = new Set(["戊", "己", "辰", "戌", "丑", "未"]);
  const metal = new Set(["庚", "辛", "申", "酉"]);
  const water = new Set(["壬", "癸", "子", "亥"]);
  if (wood.has(h)) return "wood";
  if (fire.has(h)) return "fire";
  if (earth.has(h)) return "earth";
  if (metal.has(h)) return "metal";
  if (water.has(h)) return "water";
  return "none";
}

const ELEMENT_COLOR: Record<string, string> = {
  wood: "#059669",
  fire: "#e11d48",
  earth: "#b45309",
  metal: "#64748b",
  water: "#2563eb",
  none: "var(--text-primary)",
};

interface SajuRow {
  id: number;
  name: string;
  relation: string | null;
  birthdate: string;
  birth_time: string | null;
  calendar_type: string;
  gender: string;
}

function SajuPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sajuId = searchParams.get("id");

  const [saju, setSaju] = useState<SajuRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pillars, setPillars] = useState<{
    year_pillar: string;
    month_pillar: string;
    day_pillar: string;
    hour_pillar: string;
  } | null>(null);
  const [jijanggan, setJijanggan] = useState<{
    hour: Array<{ hanja: string; hangul: string; element: string }>;
    day: Array<{ hanja: string; hangul: string; element: string }>;
    month: Array<{ hanja: string; hangul: string; element: string }>;
    year: Array<{ hanja: string; hangul: string; element: string }>;
  } | null>(null);
  const [twelveStates, setTwelveStates] = useState<{
    hour: string;
    day: string;
    month: string;
    year: string;
  } | null>(null);
  const [deducting, setDeducting] = useState(false);
  const [showSeedSheet, setShowSeedSheet] = useState(false);

  function buildPillarBlock(label: string, pillarStr: string) {
    if (!pillarStr || pillarStr.length < 2)
      return { label, cheongan: { hanja: "", hangul: "" }, jiji: { hanja: "", hangul: "" } };
    const [c, j] = [pillarStr[0], pillarStr[1]];
    return {
      label,
      cheongan: { hanja: c, hangul: hanjaToHangul(c) },
      jiji: { hanja: j, hangul: hanjaToHangul(j) },
    };
  }

  async function handleStartAnalysis() {
    if (!saju || !pillars) return;
    setDeducting(true);
    try {
      const res = await fetch(`${API_BASE}/api/analysis/deduct`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!data.success) {
        setShowSeedSheet(true);
        return;
      }
      const birthYmd = (saju.birthdate || "").replace(/-/g, "").slice(0, 8);
      const birthHm = (saju.birth_time || "").replace(/\D/g, "").slice(0, 4) || "1200";
      const gender = saju.gender === "남자" ? "M" : "F";
      const calendar = saju.calendar_type === "음력" ? "lunar" : "solar";
      const loadedSaju = {
        birthYmd,
        birthHm,
        gender,
        calendar,
        timeUnknown: false,
        result: {
          hour: buildPillarBlock("시주", pillars.hour_pillar),
          day: buildPillarBlock("일주", pillars.day_pillar),
          month: buildPillarBlock("월주", pillars.month_pillar),
          year: buildPillarBlock("년주", pillars.year_pillar),
          twelve_states: twelveStates ?? undefined,
          jijanggan: jijanggan ?? undefined,
        },
      };
      sessionStorage.setItem("loadedSaju", JSON.stringify(loadedSaju));
      router.push(`/add?loaded=${sajuId}`);
    } catch {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setDeducting(false);
    }
  }

  useEffect(() => {
    if (!sajuId) {
      setError("사주 정보가 없습니다.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/saju/${sajuId}`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          setError("사주를 불러올 수 없습니다.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setSaju(data);

        const [y, m, d] = (data.birthdate || "").split("-").map(Number);
        const timePart = (data.birth_time || "").trim();
        let hour = 12,
          minute = 0;
        if (timePart && /^\d{1,2}:\d{1,2}$/.test(timePart)) {
          const [h, mi] = timePart.split(":").map(Number);
          hour = h;
          minute = mi ?? 0;
        }

        const calendar = data.calendar_type === "음력" ? "lunar" : "solar";
        const gender = data.gender === "남자" ? "M" : "F";

        const fullRes = await fetch(`${API_BASE}/saju/full`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calendar_type: calendar,
            year: y,
            month: m,
            day: d,
            hour,
            minute,
            gender,
          }),
        });
        if (!fullRes.ok) {
          setLoading(false);
          return;
        }
        const fullData = await fullRes.json();
        if (cancelled) return;
        setPillars({
          year_pillar: fullData.year_pillar,
          month_pillar: fullData.month_pillar,
          day_pillar: fullData.day_pillar,
          hour_pillar: fullData.hour_pillar,
        });
        if (fullData.jijanggan) setJijanggan(fullData.jijanggan);
        if (fullData.twelve_states) setTwelveStates(fullData.twelve_states);
      } catch {
        if (!cancelled) setError("불러오기 실패");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sajuId]);

  const dayPillarKey = useMemo(() => {
    return pillars?.day_pillar ? dayPillarToKey(pillars.day_pillar) : "";
  }, [pillars?.day_pillar]);

  const dayPillarAnimalName = useMemo(
    () => getDayPillarAnimalName(dayPillarKey),
    [dayPillarKey]
  );

  const pillarBlocks = useMemo(() => {
    if (!pillars) return [];
    return [
      { label: "시주", value: pillars.hour_pillar },
      { label: "일주", value: pillars.day_pillar },
      { label: "월주", value: pillars.month_pillar },
      { label: "년주", value: pillars.year_pillar },
    ];
  }, [pillars]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const updateCarouselIndex = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const idx = Math.round(el.scrollLeft / w);
    setCarouselIndex(Math.min(2, Math.max(0, idx)));
  }, []);

  const goToSlide = useCallback((index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.offsetWidth, behavior: "smooth" });
    setCarouselIndex(index);
  }, []);

  const CARD_BAR_COLORS = ["#a8d5b5", "#b5c8f0", "#f0d9a8"] as const;

  const CARD_MIN_HEIGHT = 365;

  const getCardStyle = (barColor: string) => ({
    position: "relative" as const,
    zIndex: 10,
    background: "#ffffff",
    borderRadius: 24,
    border: "none",
    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
    padding: 0,
    marginBottom: 0,
    overflow: "hidden" as const,
    minHeight: CARD_MIN_HEIGHT,
    display: "flex" as const,
    flexDirection: "column" as const,
  });

  const cardBarStyle = (barColor: string) => ({
    height: 8,
    background: barColor,
    width: "100%",
    flexShrink: 0,
  });

  const cardBodyStyle = {
    padding: "28px 24px",
    flex: 1,
    display: "flex" as const,
    flexDirection: "column" as const,
  };

  const cardBodyStyleCentered = {
    ...cardBodyStyle,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  const labelStyle = {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  } as const;

  const valueStyle = {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--text-primary)",
  } as const;

  if (loading) {
    return (
      <main
        style={{
          background: "var(--bg-base)",
          backgroundImage: "url('/images/hanji-bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          minHeight: "100vh",
          fontFamily: "var(--font-sans)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <p style={{ fontSize: 14, color: "var(--text-primary)" }}>불러오는 중...</p>
      </main>
    );
  }

  if (error || !saju) {
    return (
      <main
        style={{
          background: "var(--bg-base)",
          backgroundImage: "url('/images/hanji-bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          minHeight: "100vh",
          fontFamily: "var(--font-sans)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <p style={{ fontSize: 14, color: "#b91c1c", marginBottom: 16 }}>
          {error || "사주를 찾을 수 없습니다."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/saju-list")}
          style={{
            padding: "10px 20px",
            borderRadius: 14,
            border: "1.5px solid var(--border-default)",
            background: "var(--bg-base)",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          사주 목록으로
        </button>
      </main>
    );
  }

  const timeDisplay = saju.birth_time && saju.birth_time.trim() ? saju.birth_time : "모름";

  return (
    <main
      style={{
        background: "var(--bg-base)",
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sans { font-family: var(--font-sans); }
        .tap {
          transition: transform .15s ease, opacity .15s ease, box-shadow .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; box-shadow: 0 4px 10px rgba(0,0,0,.12); }
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px 40px; }
        @media (max-width: 390px) { .wrap { padding: 0 16px 40px; } }
        .preview-carousel-wrap { position: relative; margin-bottom: 16px; }
        .preview-carousel {
          display: flex;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          gap: 0;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .preview-carousel::-webkit-scrollbar { display: none; }
        .preview-card {
          flex: 0 0 100%;
          min-width: 100%;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          padding: 0 4px;
        }
        .preview-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          -webkit-tap-highlight-color: transparent;
        }
        .preview-arrow:active { opacity: 0.85; }
        .preview-arrow.left { left: 8px; }
        .preview-arrow.right { right: 8px; }
      `}</style>

      <div className="wrap" style={{ position: "relative", zIndex: 10 }}>
        <header
          className="sans"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            margin: "0 -20px 16px",
            background: "var(--bg-base)",
            borderBottom: "3px solid var(--border-default)",
          }}
        >
          <button
            onClick={() => router.push("/home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <HamIcon style={{ width: 40, height: 40, objectFit: "contain" }} alt="로고" />
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.04em" }}>
              한양사주
            </span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                border: "1.5px solid var(--border-default)",
                cursor: "pointer",
              }}
            >
              <Icon icon="mdi:ticket-confirmation-outline" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>0</span>
            </button>
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
                border: "1.5px solid var(--border-default)",
                cursor: "pointer",
              }}
            >
              <Icon icon="mdi:crown" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>한양사주 Pro</span>
            </button>
            <button
              type="button"
              className="tap"
              aria-label="메뉴"
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
              <Icon icon="mdi:menu" width={22} style={{ marginLeft: 14 }} />
            </button>
          </div>
        </header>

        <h1
          className="sans"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 12,
          }}
        >
          내 사주 미리보기
        </h1>
        <p className="sans" style={{ fontSize: 12, color: "var(--text-primary)", marginBottom: 14 }}>
          좌우로 스와이프하거나 화살표로 카드를 넘겨보세요
        </p>

        {/* 슬라이더: 한 번에 한 장, 화살표 + 스와이프 */}
        <div className="preview-carousel-wrap">
          {carouselIndex > 0 && (
            <button
              type="button"
              className="preview-arrow left"
              aria-label="이전 카드"
              onClick={() => goToSlide(carouselIndex - 1)}
            >
              <Icon icon="mdi:chevron-left" width={24} style={{ color: "var(--text-primary)" }} />
            </button>
          )}
          {carouselIndex < 2 && (
            <button
              type="button"
              className="preview-arrow right"
              aria-label="다음 카드"
              onClick={() => goToSlide(carouselIndex + 1)}
            >
              <Icon icon="mdi:chevron-right" width={24} style={{ color: "var(--text-primary)" }} />
            </button>
          )}
          <div
            ref={carouselRef}
            className="preview-carousel"
            onScroll={updateCarouselIndex}
            role="region"
            aria-label="사주 미리보기 카드"
          >
            {/* 카드 1: 일주 동물 */}
            <div className="preview-card">
              <section style={getCardStyle(CARD_BAR_COLORS[0])}>
                <div style={cardBarStyle(CARD_BAR_COLORS[0])} />
                <div style={cardBodyStyle}>
                  {dayPillarKey ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                      <img
                        src={`/images/day_pillars/${dayPillarKey}.png`}
                        alt={`${dayPillarKey} 일주 동물`}
                        style={{
                          width: 220,
                          height: 220,
                          objectFit: "contain",
                          borderRadius: 16,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {dayPillarAnimalName && (
                        <span
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: getAnimalNameColor(dayPillarAnimalName),
                          }}
                        >
                          {dayPillarAnimalName}
                        </span>
                      )}
                      {dayPillarKey && (
                        <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
                          {dayPillarKey}일주
                        </span>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: 14, color: "#6b7280" }}>일주 정보를 불러오는 중...</p>
                  )}
                </div>
              </section>
            </div>

            {/* 카드 2: 기본 정보 */}
            <div className="preview-card">
              <section style={getCardStyle(CARD_BAR_COLORS[1])}>
                <div style={cardBarStyle(CARD_BAR_COLORS[1])} />
                <div style={cardBodyStyle}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {[
                      { label: "이름", value: saju.name },
                      { label: "나와의 관계", value: saju.relation || "-" },
                      { label: "성별", value: saju.gender },
                      { label: "생년월일 (양·음력)", value: `${saju.birthdate} (${saju.calendar_type})` },
                      { label: "태어난 시각", value: timeDisplay },
                    ].map((row, i) => (
                      <div key={row.label}>
                        {i > 0 && (
                          <div style={{ height: 1, background: "#e5e7eb", margin: "12px 0" }} />
                        )}
                        <div style={labelStyle}>{row.label}</div>
                        <div style={valueStyle}>{row.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* 카드 3: 만세력 (정중앙 배치) */}
            <div className="preview-card">
              <section style={getCardStyle(CARD_BAR_COLORS[2])}>
                <div style={cardBarStyle(CARD_BAR_COLORS[2])} />
                <div style={cardBodyStyleCentered}>
              {pillars ? (
                <div
                  style={{
                    width: "100%",
                    alignSelf: "stretch",
                    border: "3px solid var(--border-default)",
                    borderRadius: 14,
                    background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      borderBottom: "2px solid var(--border-default)",
                      background: "rgba(193, 216, 195, 0.15)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      textAlign: "center",
                      padding: "6px 4px",
                    }}
                  >
                    {["시주", "일주", "월주", "년주"].map((label, i) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          ...(i < 3 ? { borderRight: "2px solid var(--border-default)" } : {}),
                        }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 0,
                      textAlign: "center",
                    }}
                  >
                    {pillarBlocks.map((p, idx) => {
                      const pillarKey = (["hour", "day", "month", "year"] as const)[idx];
                      const cheongan = p.value[0] ?? "";
                      const jiji = p.value[1] ?? "";
                      const dayStem = pillars.day_pillar[0] ?? "";
                      const stemTenGod = tenGod(dayStem, cheongan);
                      const branchMs = branchMainStem(jiji);
                      const branchTenGod = branchMs ? tenGod(dayStem, branchMs) : "";
                      const stemEl = hanjaToElement(cheongan);
                      const branchEl = hanjaToElement(jiji);
                      const jijangganList = jijanggan?.[pillarKey];
                      const stateText = twelveStates?.[pillarKey];
                      return (
                        <div
                          key={p.label}
                          style={{
                            padding: "10px 6px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            ...(idx < pillarBlocks.length - 1 ? { borderRight: "2px solid var(--border-default)" } : {}),
                          }}
                        >
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", opacity: 0.9 }}>
                            {stemTenGod}
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: ELEMENT_COLOR[stemEl] ?? "var(--text-primary)" }}>
                            {cheongan}
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: ELEMENT_COLOR[branchEl] ?? "var(--text-primary)" }}>
                            {jiji}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", opacity: 0.9 }}>
                            {branchTenGod}
                          </div>
                          {jijangganList && jijangganList.length > 0 && (
                            <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", marginTop: 2 }}>
                              {jijangganList.map((jj, jdx) => (
                                <span
                                  key={jdx}
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    color: ELEMENT_COLOR[jj.element] ?? "var(--text-primary)",
                                  }}
                                >
                                  {jj.hanja}
                                </span>
                              ))}
                            </div>
                          )}
                          {stateText && (
                            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-primary)", opacity: 0.85, marginTop: 1 }}>
                              {stateText}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "#6b7280" }}>만세력 정보를 불러오는 중...</p>
              )}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* 카드 인디케이터 (하단 점) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToSlide(i)}
              aria-label={`${i + 1}번째 카드로 이동`}
              style={{
                width: carouselIndex === i ? 10 : 8,
                height: carouselIndex === i ? 10 : 8,
                borderRadius: "50%",
                border: "none",
                background: carouselIndex === i ? "var(--text-primary)" : "var(--border-default)",
                cursor: "pointer",
                transition: "background 0.2s ease, width 0.2s ease, height 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* 하단 버튼 (위치·색상 교환) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="tap sans"
            onClick={handleStartAnalysis}
            disabled={deducting}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 14,
              border: "1.5px solid var(--border-default)",
              background: deducting ? "#9cbf9c" : "var(--bg-base)",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              cursor: deducting ? "wait" : "pointer",
              transition: "background .2s",
            }}
          >
            {deducting ? "확인 중..." : "사주 분석 시작하기 (분석권 1개)"}
          </button>
          <button
            type="button"
            className="tap sans"
            onClick={() => router.push("/saju-list")}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 14,
              border: "1.5px solid var(--border-default)",
              background: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            내 사주 목록으로
          </button>
        </div>
      </div>

      {/* 분석권 부족 바텀시트 */}
      {showSeedSheet && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setShowSeedSheet(false)}
        >
          <div
            className="sans"
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#fff",
              borderRadius: "20px 20px 0 0",
              padding: "28px 24px 40px",
              fontFamily: "var(--font-sans)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Icon
                icon="mdi:ticket-confirmation-outline"
                width={40}
                style={{ color: "var(--text-primary)", display: "block", margin: "0 auto 12px" }}
              />
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                분석권이 부족해요
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                사주 분석 1회에 분석권 1개가 필요해요.
                <br />
                분석권을 충전하고 분석을 시작해보세요.
              </div>
            </div>
            <button
              type="button"
              className="tap sans"
              onClick={() => router.push("/seed-charge")}
              style={{
                width: "100%",
                padding: 13,
                borderRadius: 14,
                border: "none",
                background: "var(--text-primary)",
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(106,153,78,0.3)",
                marginBottom: 10,
              }}
            >
              분석권 충전하러 가기
            </button>
            <button
              type="button"
              className="tap sans"
              onClick={() => setShowSeedSheet(false)}
              style={{
                width: "100%",
                padding: 11,
                borderRadius: 14,
                border: "1.5px solid #e0ece0",
                background: "#fff",
                fontSize: 14,
                fontWeight: 700,
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function PreviewFallback() {
  return (
    <main
      style={{
        background: "var(--bg-base)",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <p style={{ fontSize: 14, color: "var(--text-primary)" }}>불러오는 중...</p>
    </main>
  );
}

export default function SajuPreviewPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  return (
    <Suspense fallback={<PreviewFallback />}>
      <SajuPreviewContent />
    </Suspense>
  );
}
