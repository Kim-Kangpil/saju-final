"use client";
import { useState } from "react";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface KakaoPayButtonProps {
  orderType: string;
  price: number;
  label: string;
  sajuId?: string;
  onError?: (msg: string) => void;
  /** 결제 페이지로 가기 직전 (복귀 URL 등 sessionStorage 저장용) */
  onBeforePay?: () => void;
  style?: React.CSSProperties;
  fullWidth?: boolean;
}

export default function KakaoPayButton({
  orderType,
  price,
  label,
  sajuId,
  onError,
  onBeforePay,
  style,
  fullWidth = true,
}: KakaoPayButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    onBeforePay?.();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payment/kakao/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ order_type: orderType, ...(sajuId ? { saju_id: sajuId } : {}) }),
      });
      if (res.status === 401) {
        window.location.href = "/start";
        return;
      }
      const data = await res.json();
      if (!data.next_redirect_mobile_url && !data.next_redirect_pc_url) {
        onError?.("결제 준비에 실패했어요. 잠시 후 다시 시도해주세요.");
        return;
      }
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      window.location.href = isMobile
        ? (data.next_redirect_mobile_url || data.next_redirect_pc_url)
        : (data.next_redirect_pc_url || data.next_redirect_mobile_url);
    } catch {
      onError?.("결제 연결 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handlePay}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: fullWidth ? "100%" : "auto",
        padding: "14px 20px",
        borderRadius: 12,
        border: "none",
        background: loading ? "#C8A951" : "#FEE500",
        color: "#1A1A1A",
        fontSize: 15,
        fontWeight: 700,
        fontFamily: "'Gmarket Sans', sans-serif",
        cursor: loading ? "wait" : "pointer",
        transition: "opacity .12s ease, transform .12s ease",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {/* KakaoPay K mark */}
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#1A1A1A",
        color: "#FEE500",
        fontSize: 11,
        fontWeight: 900,
        flexShrink: 0,
      }}>K</span>
      {loading ? "결제 준비 중..." : label}
    </button>
  );
}
