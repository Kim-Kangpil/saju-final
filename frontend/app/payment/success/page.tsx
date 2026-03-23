"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function PaymentSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [orderType, setOrderType] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    const pg_token = searchParams.get("pg_token");
    const order_id = searchParams.get("order_id");
    const order_type = searchParams.get("order_type") || "analysis_ticket";
    setOrderType(order_type);

    if (!pg_token || !order_id) {
      setState("error");
      setErrorMsg("결제 정보가 올바르지 않아요.");
      return;
    }

    fetch(`${API_BASE}/api/payment/kakao/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify({ pg_token, order_id }),
    }).then(r => r.json()).then(data => {
      if (data.success) {
        setState("success");
        setTimeout(() => router.replace("/home"), 3000);
      } else {
        setState("error");
        setErrorMsg(data.detail || "결제 확인 실패");
      }
    }).catch(() => { setState("error"); setErrorMsg("네트워크 오류가 발생했어요."); });
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
      {state === "loading" && (
        <>
          <Icon icon="mdi:loading" width={48} style={{ color: "#3A3A3A", marginBottom: 20, animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 16, color: "#3A3A3A", fontWeight: 700 }}>결제 확인 중...</p>
        </>
      )}
      {state === "success" && (
        <>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#3A3A3A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Icon icon="mdi:check" width={36} color="#fff" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#3A3A3A", marginBottom: 10 }}>결제 완료!</h1>
          <p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 28 }}>
            {orderType === "pro_monthly" ? "한양사주 Pro가 활성화됐어요." : "분析권 1개가 지급됐어요."}<br />
            3초 후 홈으로 이동해요.
          </p>
          <button onClick={() => router.replace("/home")} style={{ padding: "13px 32px", background: "#3A3A3A", color: "#fff", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            홈으로 이동
          </button>
        </>
      )}
      {state === "error" && (
        <>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#E1DDCF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Icon icon="mdi:alert-outline" width={36} color="#3A3A3A" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#3A3A3A", marginBottom: 10 }}>결제 오류</h1>
          <p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 28 }}>{errorMsg}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => router.push("/membership")} style={{ padding: "12px 20px", background: "#3A3A3A", color: "#fff", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>다시 시도</button>
            <button onClick={() => router.push("/home")} style={{ padding: "12px 20px", background: "#E1DDCF", color: "#3A3A3A", borderRadius: 12, border: "1.5px solid #E0DDCF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>홈으로</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F5F2EE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Gmarket Sans'", padding: 24 }}>
      <Suspense fallback={<p style={{ color: "#3A3A3A", fontSize: 16 }}>로딩 중...</p>}>
        <PaymentSuccessInner />
      </Suspense>
    </main>
  );
}
