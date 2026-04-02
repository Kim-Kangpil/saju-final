"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const REDIRECT_MAP: Record<string, string> = {
  pro_monthly:     "/home",
  basic:           "/add",
  analysis_ticket: "/add",
  deep:            "/report/deep",
  money:           "/report/money",
  love:            "/report/love",
  career:          "/report/career",
  couple:          "/home",
};

const SUCCESS_MSG: Record<string, string> = {
  pro_monthly:     "한양사주 Pro가 활성화됐어요.",
  basic:           "분석권 1개가 지급됐어요.",
  analysis_ticket: "분석권 1개가 지급됐어요.",
  deep:            "심화 리포트 이용권이 지급됐어요.",
  money:           "재물운 리포트 이용권이 지급됐어요.",
  love:            "연애운 리포트 이용권이 지급됐어요.",
  career:          "직업운 리포트 이용권이 지급됐어요.",
  couple:          "궁합 리포트 이용권이 지급됐어요.",
  money_realistic: "추가 분석이 열렸어요.",
  love_realistic:  "추가 분석이 열렸어요.",
  career_realistic: "추가 분석이 열렸어요.",
};

function PaymentSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [orderType, setOrderType] = useState<string>("");
  const [redirectOverride, setRedirectOverride] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [errorMsg, setErrorMsg] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    const pg_token   = searchParams.get("pg_token");
    const order_id   = searchParams.get("order_id");
    const order_type = searchParams.get("order_type") || "basic";
    const status     = searchParams.get("status");
    const saju_id    = searchParams.get("saju_id");
    setOrderType(order_type);

    // PortOne / KG이니시스: 백엔드에서 이미 승인 완료 → 바로 성공 처리
    if (status === "inicis_ok" || status === "portone_ok") {
      if (order_type === "deep" && saju_id) {
        setRedirectOverride(`/report/deep?saju_id=${encodeURIComponent(saju_id)}`);
      }
      if (String(order_type).includes("realistic") && saju_id) {
        const base = order_type.replace("_realistic", "");
        setRedirectOverride(`/report/${base}?saju_id=${encodeURIComponent(saju_id)}&variant=realistic`);
      }
      setState("success");
      return;
    }

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
        const ot = data.order_type || order_type;
        setOrderType(ot);
        if (typeof window !== "undefined" && String(ot).includes("realistic")) {
          const ret = localStorage.getItem("kakao_pay_report_return");
          if (ret) {
            localStorage.removeItem("kakao_pay_report_return");
            const sep = ret.includes("?") ? "&" : "?";
            setRedirectOverride(`${ret}${sep}variant=realistic`);
          }
        }
        if (typeof window !== "undefined" && ot === "deep") {
          const sid = localStorage.getItem("deep_report_saju_id");
          if (sid) {
            localStorage.removeItem("deep_report_saju_id");
            setRedirectOverride(`/report/deep?saju_id=${encodeURIComponent(sid)}`);
          }
        }
        setState("success");
      } else {
        setState("error");
        setErrorMsg(data.detail || "결제 확인 실패");
      }
    }).catch(() => { setState("error"); setErrorMsg("네트워크 오류가 발생했어요."); });
  }, []);

  useEffect(() => {
    if (state !== "success") return;
    const dest = redirectOverride || REDIRECT_MAP[orderType] || "/home";
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); router.replace(dest); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [state, orderType, redirectOverride]);

  const dest = redirectOverride || REDIRECT_MAP[orderType] || "/home";

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
          <p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 12 }}>
            {SUCCESS_MSG[orderType] || "구매가 완료됐어요!"}
          </p>
          <p style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 28 }}>{countdown}초 후 자동으로 이동해요</p>
          <button onClick={() => router.replace(dest)} style={{ padding: "13px 32px", background: "#3A3A3A", color: "#fff", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            바로 이동
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
            <button onClick={() => router.back()} style={{ padding: "12px 20px", background: "#3A3A3A", color: "#fff", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>다시 시도</button>
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
