"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { use, useState, useEffect, useMemo, Suspense } from "react";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";
import { dayPillarTexts } from "@/data/dayPillarAnimal";

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
  none: "#1a2e0e",
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

  const cardStyle = {
    position: "relative" as const,
    zIndex: 10,
    background: "#fff",
    border: "1.5px solid #c8dac8",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  };

  const labelStyle = {
    fontSize: 12,
    color: "#556b2f",
    marginBottom: 4,
  } as const;

  const valueStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#1a2e0e",
  } as const;

  if (loading) {
    return (
      <main
        style={{
          background: "#eef4ee",
          minHeight: "100vh",
          fontFamily: "'Gowun Dodum', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <p style={{ fontSize: 14, color: "#556b2f" }}>불러오는 중...</p>
      </main>
    );
  }

  if (error || !saju) {
    return (
      <main
        style={{
          background: "#eef4ee",
          minHeight: "100vh",
          fontFamily: "'Gowun Dodum', sans-serif",
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
            border: "1.5px solid #adc4af",
            background: "#c1d8c3",
            fontSize: 14,
            fontWeight: 700,
            color: "#1a2e0e",
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
        background: "#eef4ee",
        minHeight: "100vh",
        fontFamily: "'Gowun Dodum', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sans { font-family: 'Gowun Dodum', sans-serif; }
        .tap {
          transition: transform .15s ease, opacity .15s ease, box-shadow .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; box-shadow: 0 4px 10px rgba(0,0,0,.12); }
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px 40px; }
        @media (max-width: 390px) { .wrap { padding: 0 16px 40px; } }
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
            background: "#c1d8c3",
            borderBottom: "3px solid #adc4af",
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
            <HamIcon style={{ width: 28, height: 28, objectFit: "contain" }} alt="햄스터" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#2d4a1e", letterSpacing: "0.04em" }}>
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
                border: "1.5px solid #adc4af",
                cursor: "pointer",
              }}
            >
              <Icon icon="mdi:seed-outline" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>0</span>
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
                border: "1.5px solid #adc4af",
                cursor: "pointer",
              }}
            >
              <Icon icon="fluent-emoji-flat:sunflower" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>멤버십</span>
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
              <Icon icon="mdi:menu" width={22} />
            </button>
          </div>
        </header>

        <h1
          className="sans"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1a2e0e",
            marginBottom: 14,
          }}
        >
          내 사주 미리보기
        </h1>

        {/* 기본 정보 카드 */}
        <section style={cardStyle}>
          <div style={labelStyle}>이름</div>
          <div style={valueStyle}>{saju.name}</div>
          <div style={{ ...labelStyle, marginTop: 10 }}>나와의 관계</div>
          <div style={valueStyle}>{saju.relation || "-"}</div>
          <div style={{ ...labelStyle, marginTop: 10 }}>성별</div>
          <div style={valueStyle}>{saju.gender}</div>
          <div style={{ ...labelStyle, marginTop: 10 }}>생년월일</div>
          <div style={valueStyle}>
            {saju.birthdate} ({saju.calendar_type})
          </div>
          <div style={{ ...labelStyle, marginTop: 10 }}>태어난 시각</div>
          <div style={valueStyle}>{timeDisplay}</div>
        </section>

        {/* 만세력 카드 (add 페이지와 동일한 시주·일주·월주·년주 + 십신·천간·지지 형식) */}
        {pillars && (
          <section style={cardStyle}>
            <div style={{ ...labelStyle, marginBottom: 10 }}>만세력</div>
            <div
              style={{
                border: "4px solid #adc4af",
                borderRadius: 16,
                background: "#fff",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  borderBottom: "2px solid #adc4af",
                  background: "rgba(193, 216, 195, 0.1)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#556b2f",
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
                      ...(i < 3 ? { borderRight: "2px solid #adc4af" } : {}),
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
                        ...(idx < pillarBlocks.length - 1 ? { borderRight: "2px solid #adc4af" } : {}),
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#556b2f", opacity: 0.9 }}>
                        {stemTenGod}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: ELEMENT_COLOR[stemEl] ?? "#1a2e0e" }}>
                        {cheongan}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: ELEMENT_COLOR[branchEl] ?? "#1a2e0e" }}>
                        {jiji}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#556b2f", opacity: 0.9 }}>
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
                                color: ELEMENT_COLOR[jj.element] ?? "#1a2e0e",
                              }}
                            >
                              {jj.hanja}
                            </span>
                          ))}
                        </div>
                      )}
                      {stateText && (
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#556b2f", opacity: 0.85, marginTop: 1 }}>
                          {stateText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 일주 동물 카드 */}
        {dayPillarKey && (
          <section style={cardStyle}>
            <div style={{ ...labelStyle, marginBottom: 10 }}>일주 동물</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <img
                src={`/images/day_pillars/${dayPillarKey}.png`}
                alt={`${dayPillarKey} 일주 동물`}
                style={{
                  width: "100%",
                  maxWidth: 200,
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: 12,
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {dayPillarAnimalName && (
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1a2e0e" }}>
                  {dayPillarAnimalName}
                </span>
              )}
            </div>
          </section>
        )}

        {/* 하단 버튼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="tap sans"
            onClick={() => router.push("/saju-list")}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 14,
              border: "1.5px solid #adc4af",
              background: "#c1d8c3",
              fontSize: 14,
              fontWeight: 700,
              color: "#1a2e0e",
            }}
          >
            내 사주 목록으로
          </button>
          <button
            type="button"
            className="tap sans"
            onClick={() => alert("준비 중입니다.")}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 14,
              border: "1.5px solid #adc4af",
              background: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              color: "#1a2e0e",
            }}
          >
            사주 분석 시작하기
          </button>
        </div>
      </div>
    </main>
  );
}

function PreviewFallback() {
  return (
    <main
      style={{
        background: "#eef4ee",
        minHeight: "100vh",
        fontFamily: "'Gowun Dodum', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <p style={{ fontSize: 14, color: "#556b2f" }}>불러오는 중...</p>
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
