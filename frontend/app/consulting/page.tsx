"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const KAKAO_CHANNEL_URL = "http://pf.kakao.com/_Ribbn/friend";

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

export default function ConsultingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scriptId = "iamport-v1-js";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    document.head.appendChild(script);
  }, []);

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/payment/portone/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ order_type: "consulting" }),
      });
      if (res.status === 401) {
        window.location.href = "/start";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "결제 준비 실패");

      const { order_id, item_name, amount, user_code, channel_key, pg } = data;

      const IMP = window.IMP;
      if (!IMP) throw new Error("결제 모듈을 불러올 수 없어요. 잠시 후 다시 시도해 주세요.");
      IMP.init(user_code);

      await new Promise<void>((resolve, reject) => {
        IMP.request_pay(
          {
            ...(channel_key ? { channelKey: channel_key } : { pg }),
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
              const confirmRes = await fetch(`${API_BASE}/api/payment/portone/confirm`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                credentials: "include",
                body: JSON.stringify({ imp_uid: rsp.imp_uid, order_id: rsp.merchant_uid }),
              });
              const confirmData = await confirmRes.json();
              if (!confirmRes.ok) throw new Error(confirmData.detail || "결제 확인 실패");
              // 결제 성공 → 카카오 채널로 이동
              window.location.href = KAKAO_CHANNEL_URL;
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        );
      });
    } catch (e: any) {
      const msg = e.message || "결제 오류가 발생했어요.";
      if (!msg.includes("취소")) alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF7F2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: 48,
        fontFamily: "'Gmarket Sans', sans-serif",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "16px 20px 0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: 22,
            color: "#5C4A30",
            lineHeight: 1,
          }}
          aria-label="뒤로가기"
        >
          ←
        </button>
      </div>

      <div style={{ width: "100%", maxWidth: 420, padding: "28px 20px 0" }}>
        {/* 메인 문구 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1.5px solid #E3D9CB",
            padding: "28px 24px",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, color: "#A8946A", fontWeight: 600, marginBottom: 12, letterSpacing: "0.06em" }}>
            1:1 사주 채팅 상담
          </div>
          <p
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "#3A2E1E",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            당신의 사주에 답이 있습니다.
            <br />
            1:1로 직접 풀어드립니다.
          </p>
        </div>

        {/* 상품 설명 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1.5px solid #E3D9CB",
            padding: "20px 24px",
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: "#A8946A", marginBottom: 14, letterSpacing: "0.06em" }}>
            포함 내용
          </p>
          {[
            "기본 성격 분석",
            "현재 대운 흐름 분석",
            "질문 3개 답변",
          ].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 16 }}>✅</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#3A2E1E" }}>{item}</span>
            </div>
          ))}
        </div>

        {/* 진행 방식 */}
        <div
          style={{
            background: "#FFF8EE",
            borderRadius: 14,
            border: "1.5px solid #E8D8B8",
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: "#8B6E3A", marginBottom: 8, letterSpacing: "0.05em" }}>
            진행 방식
          </p>
          <p style={{ fontSize: 13, color: "#5C4A30", lineHeight: 1.7, margin: 0 }}>
            결제 후 카카오톡 채널로 생년월일시를 보내주시면
            <br />
            <strong>24시간 내</strong> 답변드립니다.
          </p>
        </div>

        {/* 가격 + 결제 버튼 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1.5px solid #E3D9CB",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "#6B5F4E" }}>1:1 사주 채팅 상담</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#3A2E1E" }}>20,000원</span>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handlePay}
            style={{
              width: "100%",
              padding: "15px 20px",
              borderRadius: 12,
              border: "none",
              background: loading ? "#888" : "#1A1A1A",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'Gmarket Sans', sans-serif",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "결제 준비 중..." : "카드로 결제하기"}
          </button>

          <p style={{ fontSize: 11, color: "#B0A090", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
            결제 후 카카오톡 채널 친구 추가 페이지로 이동합니다
          </p>
        </div>
      </div>
    </div>
  );
}
