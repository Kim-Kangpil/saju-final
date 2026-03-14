"use client";

import { use, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortOne from "@portone/browser-sdk/v2";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || "";
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || "";

const PACKAGES = [
  {
    key: "seed_1",
    seeds: 1,
    bonus: 0,
    label: "씨앗 1개",
    price: 770,
    desc: "가볍게 한 번 써보고 싶을 때",
    badge: null,
  },
  {
    key: "seed_5",
    seeds: 5,
    bonus: 1,
    label: "씨앗 5개",
    price: 3850,
    desc: "고민분석 1회 + 여유 있게",
    badge: "인기",
  },
  {
    key: "seed_10",
    seeds: 10,
    bonus: 2,
    label: "씨앗 10개",
    price: 7700,
    desc: "다양한 분석을 한 번에",
    badge: "최대 혜택",
  },
] as const;

const USE_CASES = [
  { icon: "mdi:head-question-outline", label: "고민분석", cost: 5 },
  { icon: "mdi:heart-outline", label: "궁합분석", cost: 7 },
  { icon: "mdi:weather-sunset-up", label: "대운분석", cost: 8 },
];

function getUserId(): string {
  if (typeof window === "undefined") return "";
  const id = localStorage.getItem("userId") || localStorage.getItem("payment_user_id");
  if (id) return id;
  const newId = "user_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  localStorage.setItem("payment_user_id", newId);
  return newId;
}

export default function SeedChargePage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seedCount, setSeedCount] = useState<number>(0);
  const [selected, setSelected] = useState<string>("seed_5");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/seeds`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && typeof data?.seeds === "number") setSeedCount(data.seeds);
      } catch {
        if (!cancelled) setSeedCount(0);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const requestPay = useCallback(
    async (productKey: string) => {
      if (!STORE_ID || !CHANNEL_KEY) {
        setError("결제 설정이 없습니다.");
        return;
      }
      setError(null);
      setPaying(productKey);

      try {
        const userId = getUserId();
        const createRes = await fetch(`${API_BASE}/payment/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, product_key: productKey }),
        });
        const createData = await createRes.json();
        if (!createData.orderId) {
          setError("주문 생성 실패");
          setPaying(null);
          return;
        }

        const response = await PortOne.requestPayment({
          storeId: STORE_ID,
          channelKey: CHANNEL_KEY,
          paymentId: createData.orderId,
          orderName: createData.orderName,
          totalAmount: createData.amount,
          currency: "KRW" as const,
          payMethod: "CARD" as const,
        });

        if (response?.paymentId) {
          const confirmRes = await fetch(`${API_BASE}/payment/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              payment_id: response.paymentId,
              order_id: createData.orderId,
            }),
          });
          const confirmJson = await confirmRes.json();
          if (confirmJson.success) {
            router.push("/saju-mypage?seed_charged=1");
            return;
          }
          setError(confirmJson.detail || "결제 확인 실패");
        } else {
          setError(response?.message || "결제가 취소되었습니다.");
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "결제 요청 실패";
        setError(msg);
      } finally {
        setPaying(null);
      }
    },
    [router]
  );

  const selectedPkg = PACKAGES.find((p) => p.key === selected)!;

  return (
    <main
      style={{
        background: "#eef4ee",
        minHeight: "100vh",
        fontFamily: "'Gowun Dodum', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: 88,
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
        .pkg-card {
          border-radius: 14px;
          padding: 14px 16px;
          cursor: pointer;
          transition: all .15s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .pkg-card:active { transform: scale(.98); }
        .sticky-cta {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          justify-content: center;
          padding: 12px 20px 20px;
          background: linear-gradient(to top, #eef4ee 70%, transparent);
        }
        .sticky-cta-inner { width: 100%; max-width: 420px; }
      `}</style>

      <div className="wrap">
        {/* ── 헤더 ── */}
        <header
          className="sans"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            margin: "0 -20px 0",
            background: "#c1d8c3",
            borderBottom: "3px solid #adc4af",
          }}
        >
          <button
            onClick={() => router.push("/home")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
            }}
          >
            <HamIcon style={{ width: 40, height: 40, objectFit: "contain" }} alt="햄스터" />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#2d4a1e", letterSpacing: "0.04em" }}>
              한양사주
            </span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => router.push("/seed-charge")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "6px 10px", borderRadius: 999,
                background: "rgba(255,255,255,0.85)", border: "1.5px solid #adc4af", cursor: "pointer",
              }}
            >
              <Icon icon="mdi:seed-outline" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>{seedCount}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/membership")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "6px 10px", borderRadius: 999,
                background: "rgba(255,255,255,0.85)", border: "1.5px solid #adc4af", cursor: "pointer",
              }}
            >
              <Icon icon="fluent-emoji-flat:sunflower" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>멤버십</span>
            </button>
            <button
              type="button"
              className="tap"
              aria-label="메뉴 열기"
              onClick={() => router.push("/saju-mypage")}
              style={{
                padding: 8, borderRadius: 10, border: "none", background: "transparent",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon icon="mdi:menu" width={22} style={{ marginLeft: 14 }} />
            </button>
          </div>
        </header>

        {/* ── 씨앗 안내 배너 ── */}
        <section
          className="sans"
          style={{
            margin: "0 -20px",
            background: "linear-gradient(160deg, #fffde7 0%, #e8f5e9 100%)",
            padding: "22px 24px 20px",
            borderBottom: "1.5px solid #c8dac8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Icon icon="mdi:seed-outline" width={28} style={{ color: "#6a994e" }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1a2e0e" }}>씨앗 충전</div>
              <div style={{ fontSize: 12, color: "#556b2f" }}>
                현재 보유 <strong style={{ color: "#345024" }}>{seedCount}개</strong>
              </div>
            </div>
          </div>

          {/* 씨앗 사용처 안내 */}
          <div style={{ display: "flex", gap: 8 }}>
            {USE_CASES.map((u) => (
              <div
                key={u.label}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid #c8dac8",
                  borderRadius: 10,
                  padding: "8px 6px",
                  textAlign: "center",
                }}
              >
                <Icon icon={u.icon} width={18} style={{ color: "#6a994e", display: "block", margin: "0 auto 4px" }} />
                <div style={{ fontSize: 11, color: "#1a2e0e", fontWeight: 700 }}>{u.label}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>씨앗 {u.cost}개</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 패키지 선택 ── */}
        <section className="sans" style={{ padding: "24px 0 0" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1a2e0e", marginBottom: 12 }}>
            충전 패키지 선택
          </h2>

          {error && (
            <div
              role="alert"
              style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 12,
                color: "#b91c1c",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PACKAGES.map((pkg) => {
              const isSelected = selected === pkg.key;
              const totalSeeds = pkg.seeds + pkg.bonus;
              return (
                <div
                  key={pkg.key}
                  className="pkg-card"
                  onClick={() => setSelected(pkg.key)}
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, #d4edda, #c1d8c3)"
                      : "#ffffff",
                    border: isSelected
                      ? "2px solid #6a994e"
                      : "1.5px solid #e0ece0",
                    position: "relative",
                  }}
                >
                  {pkg.badge && (
                    <div
                      style={{
                        position: "absolute",
                        top: -10,
                        right: 12,
                        background: pkg.badge === "최대 혜택" ? "#c9a227" : "#6a994e",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 99,
                        padding: "2px 9px",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {pkg.badge}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {/* 왼쪽: 씨앗 수 + 설명 */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {/* 씨앗 아이콘 뱃지 */}
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: isSelected ? "rgba(255,255,255,0.6)" : "#f0f7f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          flexShrink: 0,
                        }}
                      >
                        <Icon icon="mdi:seed-outline" width={18} style={{ color: "#6a994e" }} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#345024", lineHeight: 1.2 }}>
                          {totalSeeds}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e0e" }}>
                          씨앗 {pkg.seeds}개
                          {pkg.bonus > 0 && (
                            <span
                              style={{
                                marginLeft: 5,
                                fontSize: 12,
                                color: "#c9a227",
                                fontWeight: 800,
                              }}
                            >
                              + 보너스 {pkg.bonus}개
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{pkg.desc}</div>
                      </div>
                    </div>

                    {/* 오른쪽: 가격 + 라디오 */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#345024" }}>
                        {pkg.price.toLocaleString()}원
                      </span>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: isSelected ? "2px solid #6a994e" : "2px solid #d1d5db",
                          background: isSelected ? "#6a994e" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && (
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 씨앗 vs 맴버십 업셀 ── */}
        <section className="sans" style={{ padding: "24px 0 0" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #fffde7, #fff9c4)",
              border: "1.5px solid #f0d060",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Icon icon="fluent-emoji-flat:sunflower" width={32} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e0e", marginBottom: 3 }}>
                자주 쓴다면 맴버십이 더 이득이에요
              </div>
              <div style={{ fontSize: 12, color: "#7a6020", lineHeight: 1.5 }}>
                매달 씨앗 10개 자동 지급 · 월 3,900원
              </div>
            </div>
            <button
              type="button"
              className="tap sans"
              onClick={() => router.push("/membership")}
              style={{
                padding: "7px 12px",
                borderRadius: 10,
                border: "1.5px solid #c9a227",
                background: "#fff",
                fontSize: 12,
                fontWeight: 700,
                color: "#7a6020",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              보러가기
            </button>
          </div>
        </section>

        {/* ── 씨앗 안내 ── */}
        <section className="sans" style={{ padding: "20px 0 0" }}>
          <div
            style={{
              background: "#f8faf8",
              borderRadius: 12,
              border: "1px solid #e8f0e8",
              padding: "12px 14px",
            }}
          >
            {[
              "씨앗은 결제 즉시 지급됩니다.",
              "씨앗은 유효기간 없이 누적 사용 가능해요.",
              "환불은 미사용 씨앗에 한해 고객센터로 문의해주세요.",
            ].map((txt) => (
              <div
                key={txt}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                  fontSize: 12,
                  color: "#6b7280",
                  lineHeight: 1.6,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: "#9ca3af", flexShrink: 0, marginTop: 1 }}>·</span>
                <span>{txt}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── 하단 고정 결제 버튼 ── */}
      <div className="sticky-cta sans">
        <div className="sticky-cta-inner">
          <button
            type="button"
            className="tap sans"
            disabled={!!paying}
            onClick={() => requestPay(selected)}
            style={{
              width: "100%",
              padding: "13px 14px",
              borderRadius: 14,
              border: "none",
              background: paying ? "#9cbf9c" : "#6a994e",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              cursor: paying ? "wait" : "pointer",
              boxShadow: "0 4px 20px rgba(106,153,78,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "background .2s",
            }}
          >
            {paying ? (
              "이동 중..."
            ) : (
              <>
                <Icon icon="mdi:seed-outline" width={18} />
                씨앗 {(selectedPkg.seeds + selectedPkg.bonus)}개 충전하기 · {selectedPkg.price.toLocaleString()}원
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

