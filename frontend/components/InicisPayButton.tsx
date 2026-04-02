"use client";
import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

declare global {
  interface Window {
    IMP?: {
      init: (userCode: string) => void;
      request_pay: (params: Record<string, unknown>, callback: (rsp: ImpResponse) => void) => void;
    };
  }
}

interface ImpResponse {
  success: boolean;
  imp_uid: string;
  merchant_uid: string;
  error_code?: string;
  error_msg?: string;
}

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

  // iamport.js (PortOne V1) 로드
  useEffect(() => {
    const scriptId = "iamport-v1-js";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    document.head.appendChild(script);
  }, []);

  async function handlePay() {
    onBeforePay?.();
    setLoading(true);
    try {
      // 1. 백엔드에서 주문 정보 발급
      const res = await fetch(`${API_BASE}/api/payment/portone/ready`, {
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

      const { order_id, item_name, amount, user_code, pg } = data;

      const IMP = window.IMP;
      if (!IMP) throw new Error("결제 모듈을 불러올 수 없어요. 잠시 후 다시 시도해 주세요.");

      IMP.init(user_code);

      // 2. 결제창 호출
      await new Promise<void>((resolve, reject) => {
        IMP.request_pay(
          {
            pg,
            pay_method: "card",
            merchant_uid: order_id,
            name: item_name,
            amount,
            buyer_name: "구매자",
            buyer_tel: "010-0000-0000",
            buyer_email: "",
          },
          async (rsp: ImpResponse) => {
            if (!rsp.success) {
              reject(new Error(rsp.error_msg || "결제가 취소되었습니다."));
              return;
            }
            try {
              // 3. 백엔드 결제 검증 & 혜택 지급
              const confirmRes = await fetch(`${API_BASE}/api/payment/portone/confirm`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                credentials: "include",
                body: JSON.stringify({
                  imp_uid: rsp.imp_uid,
                  order_id: rsp.merchant_uid,
                }),
              });
              const confirmData = await confirmRes.json();
              if (!confirmRes.ok) throw new Error(confirmData.detail || "결제 확인 실패");

              // 4. 성공 페이지 이동
              const sajuParam = sajuId ? `&saju_id=${sajuId}` : "";
              window.location.href = `/payment/success?order_id=${order_id}&order_type=${orderType}&status=portone_ok${sajuParam}`;
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        );
      });
    } catch (e: any) {
      const msg = e.message || "결제 연결 오류가 발생했어요.";
      // 취소는 조용히 처리
      if (!msg.includes("취소")) {
        onError?.(msg);
        alert(msg);
      }
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
  );
}
