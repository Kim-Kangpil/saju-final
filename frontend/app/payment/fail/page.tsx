"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function PaymentFailPage({ params }: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F5F2EE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Gmarket Sans'", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#E1DDCF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Icon icon="mdi:close" width={36} color="#3A3A3A" />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#3A3A3A", marginBottom: 10 }}>결제가 취소됐어요</h1>
        <p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 28 }}>결제가 완료되지 않았어요.<br />다시 시도하거나 홈으로 돌아가세요.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => router.push("/membership")} style={{ padding: "12px 20px", background: "#3A3A3A", color: "#fff", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>다시 시도</button>
          <button onClick={() => router.push("/home")} style={{ padding: "12px 20px", background: "#E1DDCF", color: "#3A3A3A", borderRadius: 12, border: "1.5px solid #E0DDCF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>홈으로</button>
        </div>
      </div>
    </main>
  );
}
