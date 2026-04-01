"use client";
import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface InicisPayButtonProps {
  orderType: string;
  price: number;
  label: string;
  sajuId?: string;
  onBeforePay?: () => void;
  onError?: (msg: string) => void;
  style?: React.CSSProperties;
  fullWidth?: boolean;
}

interface PayFormData {
  mid: string;
  order_id: string;
  price: number;
  timestamp: string;
  signature: string;
  mkey: string;
  good_name: string;
  buyer_name: string;
  buyer_tel: string;
  buyer_email: string;
}

export default function InicisPayButton({
  orderType,
  price,
  label,
  sajuId,
  onBeforePay,
  onError,
  style,
  fullWidth = true,
}: InicisPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PayFormData | null>(null);

  // INIStdPay.js 로드
  useEffect(() => {
    const scriptId = "inicis-stdpay-js";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://stdpay.inicis.com/stdjs/INIStdPay.js";
    script.charset = "UTF-8";
    document.head.appendChild(script);
  }, []);

  // formData 세팅 후 INIStdPay.pay 호출
  useEffect(() => {
    if (!formData) return;
    const timer = setTimeout(() => {
      if (typeof (window as any).INIStdPay !== "undefined") {
        (window as any).INIStdPay.pay("inicis_pay_form");
      } else {
        const msg = "결제 모듈을 불러올 수 없어요. 잠시 후 다시 시도해 주세요.";
        onError?.(msg);
        alert(msg);
      }
      setLoading(false);
    }, 80);
    return () => clearTimeout(timer);
  }, [formData]);

  async function handlePay() {
    onBeforePay?.();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payment/inicis/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({
          order_type: orderType,
          ...(sajuId ? { saju_id: sajuId } : {}),
        }),
      });
      if (res.status === 401) {
        window.location.href = "/start";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "결제 준비 실패");
      setFormData(data);
    } catch (e: any) {
      const msg = e.message || "결제 연결 오류가 발생했어요.";
      onError?.(msg);
      alert(msg);
      setLoading(false);
    }
  }

  const returnUrl = `${API_BASE}/api/payment/inicis/return`;
  const closeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/payment/close`
      : "https://hsaju.com/payment/close";

  return (
    <>
      {/* INIpay 필수 hidden form */}
      <form
        id="inicis_pay_form"
        method="POST"
        acceptCharset="UTF-8"
        style={{ display: "none" }}
      >
        <input type="hidden" name="version" value="1.0" />
        <input type="hidden" name="gopaymethod" value="Card:DirectBank:HPP:MOBILE" />
        <input type="hidden" name="currency" value="WON" />
        <input type="hidden" name="payViewType" value="overlay" />
        <input type="hidden" name="langWCode" value="ko" />
        <input type="hidden" name="returnUrl" value={returnUrl} />
        <input type="hidden" name="closeUrl" value={closeUrl} />
        <input type="hidden" name="mid" value={formData?.mid ?? ""} />
        <input type="hidden" name="oid" value={formData?.order_id ?? ""} />
        <input type="hidden" name="price" value={formData ? String(formData.price) : ""} />
        <input type="hidden" name="timestamp" value={formData?.timestamp ?? ""} />
        <input type="hidden" name="signature" value={formData?.signature ?? ""} />
        <input type="hidden" name="mKey" value={formData?.mkey ?? ""} />
        <input type="hidden" name="goodname" value={formData?.good_name ?? ""} />
        <input type="hidden" name="buyername" value={formData?.buyer_name ?? ""} />
        <input type="hidden" name="buyertel" value={formData?.buyer_tel ?? ""} />
        <input type="hidden" name="buyeremail" value={formData?.buyer_email ?? ""} />
      </form>

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
          background: loading ? "#888" : "#1A1A1A",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "'Gmarket Sans', sans-serif",
          cursor: loading ? "wait" : "pointer",
          transition: "opacity .12s ease, transform .12s ease",
          WebkitTapHighlightColor: "transparent",
          ...style,
        }}
      >
        {loading ? "결제 준비 중..." : label}
      </button>
    </>
  );
}
