"use client";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function PaymentCancelPage() {
  const router = useRouter();
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F5F2EE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Gmarket Sans'", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#E1DDCF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Icon icon="mdi:close" width={36} color="#3A3A3A" />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#3A3A3A", marginBottom: 10 }}>결제를 취소했어요</h1>
        <p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 28 }}>
          언제든지 다시 시도하실 수 있어요.
        </p>
        <button
          onClick={() => router.back()}
          style={{ padding: "13px 32px", background: "#3A3A3A", color: "#fff", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          돌아가기
        </button>
      </div>
    </main>
  );
}
