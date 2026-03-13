"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, Suspense } from "react";
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

      <div className="wrap">
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
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.85)",
                border: "1.5px solid #adc4af",
              }}
            >
              <Icon icon="mdi:seed-outline" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>0</span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.85)",
                border: "1.5px solid #adc4af",
              }}
            >
              <Icon icon="fluent-emoji-flat:sunflower" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>0</span>
            </div>
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

        {/* 만세력 카드 */}
        {pillars && (
          <section style={cardStyle}>
            <div style={{ ...labelStyle, marginBottom: 10 }}>만세력</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 0,
                borderTop: "2px solid #adc4af",
                borderLeft: "2px solid #adc4af",
                background: "#f8faf8",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {pillarBlocks.map((p) => (
                <div
                  key={`h-${p.label}`}
                  style={{
                    padding: "8px 4px",
                    background: "#c1d8c3",
                    borderRight: "2px solid #adc4af",
                    borderBottom: "2px solid #adc4af",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#2d4a1e",
                    textAlign: "center",
                  }}
                >
                  {p.label}
                </div>
              ))}
              {pillarBlocks.map((p) => (
                <div
                  key={`v-${p.label}`}
                  style={{
                    padding: "10px 4px",
                    textAlign: "center",
                    borderRight: "2px solid #adc4af",
                    borderBottom: "2px solid #adc4af",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1a2e0e",
                  }}
                >
                  {p.value}
                </div>
              ))}
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

export default function SajuPreviewPage() {
  return (
    <Suspense fallback={<PreviewFallback />}>
      <SajuPreviewContent />
    </Suspense>
  );
}
