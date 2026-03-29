"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";

const REDIRECT_MAP: Record<string, string> = {
  pro_monthly:     "/home",
  basic:           "/add",
  analysis_ticket: "/add",
  deep:            "/add",
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
};

function TestSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderType, setOrderType] = useState<string>("basic");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const order_id = searchParams.get("order_id");
    const order_type = searchParams.get("order_type") || "basic";
    setOrderType(order_type);

    const dest = REDIRECT_MAP[order_type] || "/home";
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); router.replace(dest); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const dest = REDIRECT_MAP[orderType] || "/home";

  return (
    <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#3A3A3A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <Icon icon="mdi:check" width={36} color="#fff" />
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#3A3A3A", marginBottom: 10 }}>결제 완료! (테스트 모드)</h1>
      <p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 12 }}>
        {SUCCESS_MSG[orderType] || "구매가 완료됐어요!"}
      </p>
      <p style={{ fontSize: 13, color: "#A0A0A0", marginBottom: 28 }}>{countdown}초 후 자동으로 이동해요</p>
      <button onClick={() => router.replace(dest)} style={{ padding: "13px 32px", background: "#3A3A3A", color: "#fff", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        바로 이동
      </button>
    </div>
  );
}

export default function TestSuccessPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F5F2EE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Gmarket Sans'", padding: 24 }}>
      <Suspense fallback={<p style={{ color: "#3A3A3A", fontSize: 16 }}>로딩 중...</p>}>
        <TestSuccessInner />
      </Suspense>
    </main>
  );
}
