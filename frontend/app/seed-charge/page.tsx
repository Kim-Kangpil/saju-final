"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { HamIcon } from "@/components/HamIcon";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function SeedChargePage({ params }: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/payment/status`, { credentials: "include", headers: getAuthHeaders() })
      .then(r => r.json()).then(d => { if (typeof d.report_credits === "number") setCredits(d.report_credits); }).catch(() => {});
  }, []);

  async function buyTicket() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/payment/kakao/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ order_type: "basic" }),
      });
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      if (!data.next_redirect_mobile_url) { setError("결제 준비 실패"); return; }
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      window.location.href = isMobile ? data.next_redirect_mobile_url : data.next_redirect_pc_url;
    } catch { setError("결제 연결 오류"); } finally { setLoading(false); }
  }

  return (
    <main style={{ backgroundColor: "#F5F2EE", minHeight: "100vh", fontFamily: "'Gmarket Sans'", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 100 }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px; }
        .tap { transition: transform .12s ease, opacity .12s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .tap:active { transform: scale(.97); opacity: .92; }
        .sticky-cta { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: center; padding: 12px 20px 24px; background: linear-gradient(to top, #F5F2EE 65%, transparent); }
        .sticky-cta-inner { width: 100%; max-width: 420px; }
      `}</style>

      <div className="wrap">
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1.5px solid #E0DDCF" }}>
          <button onClick={() => router.push("/home")} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer" }}>
            <HamIcon style={{ width: 36, height: 36 }} alt="로고" />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#3A3A3A" }}>한양사주</span>
          </button>
          <button onClick={() => router.push("/saju-mypage")} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6 }}>
            <Icon icon="mdi:menu" width={22} color="#3A3A3A" />
          </button>
        </header>

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "40px 0 32px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E1DDCF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon icon="mdi:file-chart-outline" width={32} color="#3A3A3A" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#6B6B6B", marginBottom: 10 }}>분석권</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#3A3A3A", lineHeight: 1.45, marginBottom: 8 }}>
            리포트 1회<br />열람권
          </h1>
          <p style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 1.8 }}>
            현재 보유: <strong style={{ color: "#3A3A3A" }}>{credits}개</strong>
          </p>
        </section>

        {/* Product card */}
        <section style={{ paddingBottom: 28 }}>
          <div style={{ background: "#fff", borderRadius: 16, border: "2px solid #3A3A3A", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#3A3A3A" }}>분석권 1개</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#3A3A3A" }}>1,900원</div>
            </div>
            <div style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 1.7 }}>
              사주 리포트를 1회 열람할 수 있는 권한입니다.<br />
              구매 후 90일 이내 사용 가능해요.
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section style={{ paddingBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6B6B6B", letterSpacing: "0.08em", marginBottom: 14 }}>분석권으로 열 수 있는 리포트</h2>
          {[
            { icon: "mdi:chart-bubble", label: "오행 분석 리포트", desc: "나의 오행 분포와 성향 분석" },
            { icon: "mdi:account-heart-outline", label: "종합 사주 요약", desc: "사주 전체를 하나의 이야기로" },
          ].map(f => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #E8E5DF" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#E1DDCF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon icon={f.icon} width={18} color="#3A3A3A" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#3A3A3A", marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: "#6B6B6B" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Upsell */}
        <section style={{ paddingBottom: 32 }}>
          <div style={{ background: "#E1DDCF", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <Icon icon="mdi:crown" width={24} color="#3A3A3A" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#3A3A3A", marginBottom: 2 }}>자주 쓴다면 Pro가 더 이득이에요</div>
              <div style={{ fontSize: 12, color: "#6B6B6B" }}>리포트 + 채팅 무제한 · 월 3,900원</div>
            </div>
            <button type="button" className="tap" onClick={() => router.push("/membership")}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #3A3A3A", background: "#fff", fontSize: 12, fontWeight: 700, color: "#3A3A3A", flexShrink: 0 }}>
              보기
            </button>
          </div>
        </section>

        {/* Notes */}
        <section style={{ paddingBottom: 32 }}>
          <div style={{ background: "#F5F2EE", borderRadius: 12, border: "1px solid #E0DDCF", padding: "12px 14px" }}>
            {["결제 즉시 분석권이 지급됩니다.", "구매 후 90일 이내 사용 가능해요.", "환불은 미사용 분석권에 한해 문의해주세요."].map(txt => (
              <div key={txt} style={{ display: "flex", gap: 6, fontSize: 12, color: "#6B6B6B", lineHeight: 1.6, marginBottom: 4 }}>
                <span style={{ flexShrink: 0, color: "#A0A0A0" }}>·</span><span>{txt}</span>
              </div>
            ))}
          </div>
        </section>

        {error && <div style={{ color: "#e11d48", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{error}</div>}
      </div>

      {/* Sticky CTA */}
      <div className="sticky-cta">
        <div className="sticky-cta-inner">
          <button type="button" className="tap" disabled={loading} onClick={buyTicket}
            style={{ width: "100%", padding: "15px 14px", borderRadius: 14, border: "none", background: loading ? "#A0A0A0" : "#FEE500", fontSize: 15, fontWeight: 700, color: "#191919", cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {/* 카카오페이 로고 */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C7.029 3 3 6.358 3 10.5c0 2.668 1.611 5.015 4.054 6.373L6.08 20.25a.375.375 0 0 0 .544.416L11.1 17.94c.296.027.596.06.9.06 4.971 0 9-3.358 9-7.5S16.971 3 12 3z" fill="#191919"/>
            </svg>
            {loading ? "결제 준비 중..." : "카카오페이로 결제 · 1,900원"}
          </button>
        </div>
      </div>
    </main>
  );
}
