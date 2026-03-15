"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { dayPillarTexts } from "@/data/dayPillarAnimal";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

const borderField = "#B4A292";
const textDark = "var(--text-primary)";
const radius = 12;

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

// 동물 이름 앞(하늘빛, 은빛 등)에 맞춘 색상
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
  return "#374151";
}

export default function SajuListPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [items, setItems] = useState<SajuWithAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy] = useState<"등록일순">("등록일순");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/saju/list`, {
          credentials: "include",
          headers: getAuthHeaders(),
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

  function formatItemLine(item: SajuWithAnimal): string {
    const dateStr = (item.birthdate || "").replace(/-/g, "/");
    const timeStr = (item.birth_time || "").trim() || "00:00";
    return `${item.gender} ${item.calendar_type} ${dateStr} (${timeStr})`;
  }

  const sortedItems = [...items].sort((a, b) => {
    const at = new Date(a.created_at || 0).getTime();
    const bt = new Date(b.created_at || 0).getTime();
    return bt - at;
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        backgroundColor: "var(--bg-base)",
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .tap {
          transition: transform .15s ease, opacity .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; }
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px 40px; }
        @media (max-width: 390px) { .wrap { padding: 0 16px 40px; } }
      `}</style>

      <div className="wrap">
        {/* 헤더 – 시안: 뒤로가기, 한양사주 만세력, 햄버거 */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 0 24px",
          }}
        >
          <button
            type="button"
            className="tap"
            onClick={() => router.push("/home")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: textDark,
            }}
          >
            <Icon icon="mdi:chevron-left" width={28} />
          </button>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: textDark,
              flex: 1,
              textAlign: "center",
            }}
          >
            한양사주 만세력
          </h1>
          <button
            type="button"
            className="tap"
            aria-label="메뉴"
            onClick={() => router.push("/saju-mypage")}
            style={{
              width: 40,
              height: 40,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: textDark,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon="mdi:menu" width={24} />
          </button>
        </header>

        {/* 저장된 만세력 섹션 */}
        <section style={{ padding: "0 0 24px" }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: textDark,
              marginBottom: 16,
              textAlign: "left",
            }}
          >
            저장된 만세력
          </h2>

          {/* 등록일순 드롭다운 */}
          <button
            type="button"
            className="tap"
            onClick={() => {}}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: 200,
              padding: "10px 14px",
              borderRadius: radius,
              border: `1.5px solid #E0E0E0`,
              background: "var(--bg-surface)",
              fontSize: 14,
              color: textDark,
              marginBottom: 24,
            }}
          >
            <span>{sortBy}</span>
            <Icon icon="mdi:chevron-down" width={20} style={{ flexShrink: 0 }} />
          </button>

          {loading && (
            <div style={{ padding: 24, textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
              불러오는 중...
            </div>
          )}
          {error && (
            <div style={{ padding: 24, textAlign: "center", fontSize: 14, color: "#b91c1c" }}>
              {error}
            </div>
          )}
          {!loading && !error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {sortedItems.map((item) => (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    className="tap"
                    onClick={() => router.push(`/saju-preview?id=${item.id}`)}
                    onKeyDown={(e) => e.key === "Enter" && router.push(`/saju-preview?id=${item.id}`)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      borderRadius: radius,
                      border: "1.5px solid #E0E0E0",
                      background: "var(--bg-surface)",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "var(--bg-input)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.dayPillarKey ? (
                        <img
                          src={`/images/day_pillars/${item.dayPillarKey}.png`}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Icon icon="mdi:account-outline" width={24} style={{ color: "var(--text-secondary)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: textDark }}>
                        {formatItemLine(item)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="tap"
                      aria-label="수정"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/saju-add?edit=${item.id}`);
                      }}
                      style={{
                        padding: 8,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Icon icon="mdi:pencil-outline" width={20} />
                    </button>
                    <button
                      type="button"
                      className="tap"
                      aria-label="삭제"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("이 만세력을 삭제하시겠습니까?")) {
                          setItems((prev) => prev.filter((i) => i.id !== item.id));
                        }
                      }}
                      style={{
                        padding: 8,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Icon icon="mdi:trash-can-outline" width={20} />
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* 추가하기 – 원형 버튼 + 하단 텍스트 (시안) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="tap"
              onClick={() => router.push("/saju-add")}
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                border: "2px solid #E0E0E0",
                background: "var(--bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: textDark,
              }}
            >
              <Icon icon="mdi:plus" width={36} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 500, color: textDark }}>추가하기</span>
          </div>
        </section>
      </div>
    </main>
  );
}

