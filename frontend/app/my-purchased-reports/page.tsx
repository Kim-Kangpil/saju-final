"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

const textDark = "var(--text-primary)";
const borderField = "#B4A292";

type SajuMeta = {
  id: number;
  name: string;
  birthdate: string;
  birth_time: string | null;
  calendar_type: string;
  gender: string;
};

type PurchasedItem = {
  id: number;
  report_type: string;
  report_label: string;
  amount: number;
  purchased_at: string;
  saju: SajuMeta | null;
};

function formatPurchasedAt(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function calendarLabel(c: string): string {
  const x = (c || "").toLowerCase();
  if (x === "lunar" || x.includes("음")) return "음력";
  if (x === "solar" || x.includes("양")) return "양력";
  return c || "";
}

function genderLabel(g: string): string {
  const x = (g || "").toLowerCase();
  if (x === "male" || x === "m" || g === "남") return "남성";
  if (x === "female" || x === "f" || g === "여") return "여성";
  return g || "";
}

function sajuSummaryLine(s: SajuMeta): string {
  const parts = [s.name?.trim() || "이름 없음", s.birthdate];
  if (s.birth_time) parts.push(s.birth_time);
  const cal = calendarLabel(s.calendar_type);
  if (cal) parts.push(cal);
  const gen = genderLabel(s.gender);
  if (gen) parts.push(gen);
  return parts.filter(Boolean).join(" · ");
}

/** 리포트 본문으로 갈 수 있는 경로. 없으면 null (사주 id 없음 등). */
function reportOpenPath(item: PurchasedItem): string | null {
  const sid = item.saju?.id;
  const q = sid != null ? `?saju_id=${encodeURIComponent(`srv-${sid}`)}` : null;
  const t = item.report_type;

  if (t === "money" && q) return `/report/money${q}`;
  if (t === "money_realistic" && q) return `/report/money${q}&variant=realistic`;
  if (t === "love" && q) return `/report/love${q}`;
  if (t === "love_realistic" && q) return `/report/love${q}&variant=realistic`;
  if (t === "career" && q) return `/report/career${q}`;
  if (t === "career_realistic" && q) return `/report/career${q}&variant=realistic`;
  return null;
}

function secondaryPath(item: PurchasedItem): string | null {
  const t = item.report_type;
  if (t === "deep") return "/add";
  if (t === "couple") return "/home";
  return null;
}

export default function MyPurchasedReportsPage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuthStatus(API_BASE);
  const [items, setItems] = useState<PurchasedItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.replace("/start");
      return;
    }
    let cancelled = false;
    (async () => {
      setListLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${API_BASE}/api/payment/my-purchased-reports`, {
          credentials: "include",
          headers: { Accept: "application/json", ...getAuthHeaders() },
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setLoadError("목록을 불러오지 못했어요.");
          setItems([]);
          return;
        }
        const raw = Array.isArray(data?.items) ? data.items : [];
        setItems(raw as PurchasedItem[]);
      } catch {
        if (!cancelled) {
          setLoadError("네트워크 오류가 났어요.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, authLoading, router]);

  if (authLoading || (!isLoggedIn && !authLoading)) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "var(--bg-base)",
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .tap { transition: transform .15s ease, opacity .15s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .tap:active { transform: scale(.97); opacity: .9; }
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px 48px; }
      `}</style>

      <div className="wrap">
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 0 20px",
          }}
        >
          <button
            type="button"
            className="tap"
            onClick={() => router.push("/saju-mypage")}
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
              fontSize: 17,
              fontWeight: 700,
              color: textDark,
              flex: 1,
              textAlign: "center",
            }}
          >
            구매한 리포트
          </h1>
          <span style={{ width: 40 }} />
        </header>

        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.65,
            marginBottom: 18,
          }}
        >
          결제하신 리포트를 같은 사주 기준으로 다시 열 수 있어요. 결제 당시 사주가 저장되지 않은
          오래된 내역은 이름·생일이 비어 있을 수 있어요.
        </p>

        {loadError && (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {loadError}
          </div>
        )}

        {listLoading && (
          <div style={{ fontSize: 14, color: "var(--text-secondary)", padding: "24px 0" }}>
            불러오는 중…
          </div>
        )}

        {!listLoading && items.length === 0 && !loadError && (
          <div
            style={{
              padding: 28,
              textAlign: "center",
              borderRadius: 12,
              border: "1.5px solid var(--border-default)",
              background: "var(--bg-surface)",
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            아직 저장된 구매 내역이 없어요.
          </div>
        )}

        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {!listLoading &&
            items.map((item) => {
              const primary = reportOpenPath(item);
              const secondary = secondaryPath(item);
              const showSajuMissing =
                !item.saju &&
                [
                  "money",
                  "money_realistic",
                  "love",
                  "love_realistic",
                  "career",
                  "career_realistic",
                ].includes(item.report_type);

              return (
                <li
                  key={`${item.id}-${item.purchased_at}`}
                  style={{
                    background: "var(--bg-surface)",
                    borderRadius: 12,
                    border: "1.5px solid var(--border-default)",
                    padding: "16px 14px",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: textDark, marginBottom: 6 }}>
                    {item.report_label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
                    {formatPurchasedAt(item.purchased_at)}
                    {typeof item.amount === "number" ? ` · ${item.amount.toLocaleString()}원` : ""}
                  </div>
                  {item.saju ? (
                    <div
                      style={{
                        fontSize: 13,
                        color: textDark,
                        lineHeight: 1.55,
                        marginBottom: 12,
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "var(--bg-input)",
                        border: `1px solid ${borderField}`,
                      }}
                    >
                      {sajuSummaryLine(item.saju)}
                    </div>
                  ) : showSajuMissing ? (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        marginBottom: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      이 결제에는 사주 정보가 없어요. 내 사주 목록에서 해당 사주를 고른 뒤 리포트
                      메뉴로 들어가 주세요.
                    </div>
                  ) : null}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {primary ? (
                      <Link
                        href={primary}
                        className="tap"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "10px 16px",
                          borderRadius: 10,
                          background: textDark,
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        보기
                      </Link>
                    ) : null}
                    {secondary ? (
                      <Link
                        href={secondary}
                        className="tap"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "10px 16px",
                          borderRadius: 10,
                          border: `1.5px solid ${borderField}`,
                          background: "var(--bg-surface)",
                          color: textDark,
                          fontSize: 13,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        {item.report_type === "couple"
                          ? "홈으로"
                          : item.report_type === "deep"
                            ? "분석 화면으로"
                            : "이동"}
                      </Link>
                    ) : null}
                    {showSajuMissing ? (
                      <Link
                        href="/saju-list"
                        className="tap"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "10px 16px",
                          borderRadius: 10,
                          border: `1.5px solid ${borderField}`,
                          background: "var(--bg-input)",
                          color: textDark,
                          fontSize: 13,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        <Icon icon="mdi:format-list-bulleted" width={18} />
                        내 사주 목록
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </main>
  );
}
