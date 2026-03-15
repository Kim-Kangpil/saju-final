"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PortOne from "@portone/browser-sdk/v2";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || "";
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || "";

const ORDER_NAME = "고민분석";
const AMOUNT = 3900;

function getUserId(): string {
  if (typeof window === "undefined") return "";
  const id = localStorage.getItem("userId") || localStorage.getItem("payment_user_id");
  if (id) return id;
  const newId = "user_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  localStorage.setItem("payment_user_id", newId);
  return newId;
}

export default function PaymentPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<"card" | "kakaopay" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = getUserId();
    fetch(`${API_BASE}/payment/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.orderId) setOrderId(data.orderId);
        else setError("주문 생성 실패");
      })
      .catch(() => setError("주문 생성 오류"))
      .finally(() => setLoading(false));
  }, []);

  const requestPay = useCallback(
    async (payMethod: "CARD" | "EASY_PAY", easyPayProvider?: "KAKAOPAY") => {
      if (!orderId || !STORE_ID || !CHANNEL_KEY) {
        setError("결제 설정이 없습니다. (PORTONE_STORE_ID, CHANNEL_KEY 확인)");
        return;
      }
      setError(null);
      setPaying(payMethod === "CARD" ? "card" : "kakaopay");

      try {
        const request: Parameters<typeof PortOne.requestPayment>[0] = {
          storeId: STORE_ID,
          channelKey: CHANNEL_KEY,
          paymentId: orderId,
          orderName: ORDER_NAME,
          totalAmount: AMOUNT,
          currency: "KRW",
          payMethod,
          ...(payMethod === "EASY_PAY" && easyPayProvider
            ? { easyPay: { easyPayProvider } }
            : {}),
        };

        const response = await PortOne.requestPayment(request);

        if (response?.paymentId) {
          const userId = getUserId();
          const confirmRes = await fetch(`${API_BASE}/payment/confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              payment_id: response.paymentId,
              order_id: orderId,
            }),
          });
          const confirmJson = await confirmRes.json();
          if (confirmJson.success) {
            router.push("/result");
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
    [orderId, router]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#eef4ee] flex items-center justify-center p-4">
        <p className="text-[var(--text-primary)] font-medium">결제 준비 중...</p>
      </main>
    );
  }

  if (error && !orderId) {
    return (
      <main className="min-h-screen bg-[#eef4ee] flex flex-col items-center justify-center p-4 gap-4">
        <p className="text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[var(--text-primary)] text-white rounded-lg font-medium"
        >
          다시 시도
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4ee] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white border-2 border-[#adc4af] shadow-lg p-6">
        <h1 className="text-lg font-bold text-[#2d4a1e] mb-1">{ORDER_NAME}</h1>
        <p className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          {AMOUNT.toLocaleString()}원
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={!!paying}
            onClick={() => requestPay("CARD")}
            className="w-full py-3 rounded-xl font-bold text-white bg-[#1a2e0e] hover:bg-[#2d4a1e] disabled:opacity-50 transition-colors"
          >
            {paying === "card" ? "결제 진행 중..." : "카드로 결제"}
          </button>
          <button
            type="button"
            disabled={!!paying}
            onClick={() => requestPay("EASY_PAY", "KAKAOPAY")}
            className="w-full py-3 rounded-xl font-bold text-[#1a1a1a] bg-[#FEE500] hover:bg-[#fdd835] disabled:opacity-50 transition-colors"
          >
            {paying === "kakaopay" ? "결제 진행 중..." : "카카오페이로 결제"}
          </button>
        </div>
      </div>
    </main>
  );
}
