"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PortOne from "@portone/browser-sdk/v2";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || "";
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || "";

const PACKAGES = [
  { key: "seed_1", label: "1개", price: 770 },
  { key: "seed_5", label: "5개 + 보너스 1개", price: 3850 },
  { key: "seed_10", label: "10개 + 보너스 2개", price: 7700 },
] as const;

function getUserId(): string {
  if (typeof window === "undefined") return "";
  const id = localStorage.getItem("userId") || localStorage.getItem("payment_user_id");
  if (id) return id;
  const newId = "user_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  localStorage.setItem("payment_user_id", newId);
  return newId;
}

export default function SeedChargePage() {
  const router = useRouter();
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

        const request = {
          storeId: STORE_ID,
          channelKey: CHANNEL_KEY,
          paymentId: createData.orderId,
          orderName: createData.orderName,
          totalAmount: createData.amount,
          currency: "KRW" as const,
          payMethod: "CARD" as const,
        };

        const response = await PortOne.requestPayment(request);

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
        {/* 헤더 — saju-list / saju-mypage와 동일 */}
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

        {/* 씨앗 충전 섹션 — 마이페이지 섹션과 동일한 레이아웃 */}
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
              marginBottom: 14,
            }}
          >
            씨앗 충전
          </h1>

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

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.key}
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1.5px solid #c8dac8",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Icon icon="mdi:seed-outline" width={22} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1a2e0e" }}>
                      씨앗 {pkg.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#345024" }}>
                    {pkg.price.toLocaleString()}원
                  </span>
                </div>
                <button
                  type="button"
                  className="tap sans"
                  disabled={!!paying}
                  onClick={() => requestPay(pkg.key)}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    borderRadius: 14,
                    border: "1.5px solid #adc4af",
                    background: "#c1d8c3",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1a2e0e",
                    cursor: paying ? "wait" : "pointer",
                    opacity: paying && paying !== pkg.key ? 0.6 : 1,
                  }}
                >
                  {paying === pkg.key ? "결제 진행 중..." : "결제하기"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
