"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";
import { dayPillarTexts } from "@/data/dayPillarAnimal";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

type SajuRow = {
  id: number;
  name: string;
  relation: string | null;
  birthdate: string;
  birth_time: string | null;
  calendar_type: string;
  gender: string;
  created_at: string;
};

type SajuWithAnimal = SajuRow & {
  dayPillarKey?: string;
  animalName?: string;
};

const HANJA_TO_HANGUL: Record<string, string> = {
  甲: "갑",
  乙: "을",
  丙: "병",
  丁: "정",
  戊: "무",
  己: "기",
  庚: "경",
  辛: "신",
  壬: "임",
  癸: "계",
  子: "자",
  丑: "축",
  寅: "인",
  卯: "묘",
  辰: "진",
  巳: "사",
  午: "오",
  未: "미",
  申: "신",
  酉: "유",
  戌: "술",
  亥: "해",
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

export default function SajuListPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [items, setItems] = useState<SajuWithAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/saju/list`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          if (!cancelled) {
            setError("사주 목록을 불러오지 못했습니다.");
            setLoading(false);
          }
          return;
        }
        if (cancelled) return;

        const baseList: SajuWithAnimal[] = Array.isArray(data) ? data : [];
        setItems(baseList);

        const withAnimals = await Promise.all(
          baseList.map(async (item) => {
            try {
              const [y, m, d] = (item.birthdate || "").split("-").map(Number);
              if (!y || !m || !d) return item;

              let hour = 12;
              let minute = 0;
              const timePart = (item.birth_time || "").trim();
              if (timePart && /^\d{1,2}:\d{1,2}$/.test(timePart)) {
                const [h, mi] = timePart.split(":").map(Number);
                if (!Number.isNaN(h)) hour = h;
                if (!Number.isNaN(mi)) minute = mi;
              }

              const calendar_type =
                item.calendar_type === "음력" ? "lunar" : "solar";
              const gender = item.gender === "남자" ? "M" : "F";

              const fullRes = await fetch(`${API_BASE}/saju/full`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  calendar_type,
                  year: y,
                  month: m,
                  day: d,
                  hour,
                  minute,
                  gender,
                }),
              });
              const full = await fullRes.json().catch(() => null);
              if (!fullRes.ok || !full) return item;

              const key = dayPillarToKey(full.day_pillar);
              const animalName = key ? getDayPillarAnimalName(key) : "";
              return { ...item, dayPillarKey: key, animalName };
            } catch {
              return item;
            }
          })
        );

        if (!cancelled) {
          setItems(withAnimals);
        }
      } catch {
        if (!cancelled) {
          setError("사주 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
        .sans  { font-family: 'Gowun Dodum', sans-serif; }
        .tap {
          transition: transform .15s ease, opacity .15s ease, box-shadow .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; box-shadow: 0 4px 10px rgba(0,0,0,.12); }
        .wrap {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }
        @media (max-width: 390px) {
          .wrap { padding: 0 16px 40px; }
        }
      `}</style>

      <div className="wrap">
        {/* 헤더 – start 페이지와 톤 맞춤 + 캐시/햄버거 */}
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
            <HamIcon
              style={{ width: 28, height: 28, objectFit: "contain" }}
              alt="햄스터"
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#2d4a1e",
                letterSpacing: "0.04em",
              }}
            >
              한양사주
            </span>
          </button>

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
        </header>

        {/* 사주 목록 섹션 */}
        <section
          className="sans"
          style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: 0,
            border: "1.5px solid #c8dac8",
            padding: "20px 20px 24px",
            margin: "0 -20px 0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
          }}
        >
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1a2e0e",
              marginBottom: 10,
            }}
          >
            사주목록
          </h1>

          {/* 새로운 사주 추가하기 버튼 */}
          <button
            type="button"
            onClick={() => router.push("/saju-add")}
            className="tap sans"
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 14,
              border: "1.5px solid #adc4af",
              background: "#c1d8c3",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 14,
              fontWeight: 700,
              color: "#1a2e0e",
              marginBottom: 16,
            }}
          >
            <span>새로운 사주 추가하기</span>
            <span style={{ fontSize: 16 }}>➕</span>
          </button>

          {/* 사주 카드 목록 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {loading ? (
              <div
                style={{
                  padding: 14,
                  textAlign: "center",
                  fontSize: 13,
                  color: "#556b2f",
                }}
              >
                불러오는 중...
              </div>
            ) : error ? (
              <div
                style={{
                  padding: 14,
                  textAlign: "center",
                  fontSize: 13,
                  color: "#b91c1c",
                }}
              >
                {error}
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  padding: 14,
                  textAlign: "center",
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                아직 저장된 사주가 없습니다
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="tap sans"
                  onClick={() => router.push(`/saju-preview?id=${item.id}`)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "#ffffff",
                    border: "1.5px solid #c8dac8",
                    borderRadius: 14,
                    padding: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {/* 왼쪽: 일주 동물 이미지 */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "#f3f4f6",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.dayPillarKey ? (
                      <img
                        src={`/images/day_pillars/${item.dayPillarKey}.png`}
                        alt={`${item.dayPillarKey} 일주 동물`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                        }}
                      >
                        동물
                      </span>
                    )}
                  </div>

                  {/* 오른쪽: 텍스트 정보 */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1a2e0e",
                      }}
                    >
                      {item.name}
                      {item.relation ? ` · ${item.relation}` : ""}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#4b5563",
                      }}
                    >
                      {item.birthdate} ({item.calendar_type}) · {item.gender}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#4b5563",
                      }}
                    >
                      태어난 시각:{" "}
                      {item.birth_time && item.birth_time.trim()
                        ? item.birth_time
                        : "시간 모름"}
                    </div>
                    {item.animalName && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#374151",
                          marginTop: 2,
                        }}
                      >
                        {item.animalName}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

