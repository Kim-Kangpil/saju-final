"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { HamIcon } from "@/components/HamIcon";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function MembershipPage({ params }: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ is_pro: boolean; pro_expires_at: string | null; report_credits: number } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/payment/status`, { credentials: "include", headers: getAuthHeaders() })
      .then(r => r.json()).then(setStatus).catch(() => {});
  }, []);

  async function startProPayment() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/payment/kakao/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ order_type: "pro_monthly" }),
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
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#3A3A3A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon icon="mdi:crown" width={32} color="#fff" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#6B6B6B", marginBottom: 10 }}>한양사주 PRO</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#3A3A3A", lineHeight: 1.45, marginBottom: 8 }}>
            사주를 가장<br />깊이 있게
          </h1>
          <p style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 1.8, marginBottom: 24 }}>
            AI 채팅 무제한과<br />분석권 매월 3개, 월 3,900원
          </p>
          {status?.is_pro ? (
            <div style={{ background: "#E1DDCF", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#3A3A3A", fontWeight: 700 }}>
              ✓ 현재 Pro 구독 중
              {status.pro_expires_at && <div style={{ fontSize: 11, fontWeight: 400, marginTop: 4, color: "#6B6B6B" }}>
                {new Date(status.pro_expires_at).toLocaleDateString("ko-KR")} 까지
              </div>}
            </div>
          ) : (
            <div style={{ fontSize: 26, fontWeight: 700, color: "#3A3A3A" }}>월 3,900원</div>
          )}
        </section>

        {/* Features */}
        <section style={{ paddingBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6B6B6B", letterSpacing: "0.08em", marginBottom: 14 }}>PRO 혜택</h2>
          {[
            { icon: "mdi:chat-outline", label: "AI 채팅 무제한", desc: "하루 제한 없이 언제든 상담" },
            { icon: "mdi:file-chart-outline", label: "분석권 매월 3개", desc: "기본/특화/심화 리포트 월 3회" },
            { icon: "mdi:timeline-outline", label: "대운·세운 심층 분석", desc: "운의 흐름을 더 깊게 분석" },
            { icon: "mdi:star-outline", label: "신기능 우선 이용", desc: "새 기능을 가장 먼저 체험" },
          ].map(f => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid #E8E5DF" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#3A3A3A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon icon={f.icon} width={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#3A3A3A", marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: "#6B6B6B" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Comparison */}
        <section style={{ paddingBottom: 32 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#6B6B6B", letterSpacing: "0.08em", marginBottom: 14 }}>플랜 비교</h2>
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E0DDCF", overflow: "hidden" }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#E1DDCF" }}>
              {["무료", "분석권", "Pro"].map((h, i) => (
                <div key={h} style={{ padding: "10px 8px", textAlign: "center", fontSize: 12, fontWeight: 700, background: i === 2 ? "#3A3A3A" : "transparent", color: i === 2 ? "#fff" : "#6B6B6B" }}>{h}</div>
              ))}
            </div>
            {/* Rows */}
            {[
              ["AI 채팅", "3회/일", "3회/일", "무제한"],
              ["분석권", "❌", "1회", "월 3회"],
              ["특화/심화 리포트", "❌", "유료", "월 3회 할인"],
              ["가격", "무료", "1,900원", "3,900원/월"],
            ].map(([label, a, , c]) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid #E8E5DF" }}>
                <div style={{ padding: "11px 8px", fontSize: 12, color: "#6B6B6B", textAlign: "center" }}>{label}</div>
                <div style={{ padding: "11px 8px", fontSize: 12, color: "#6B6B6B", textAlign: "center" }}>{a}</div>
                <div style={{ padding: "11px 8px", fontSize: 12, color: "#3A3A3A", fontWeight: 700, textAlign: "center", background: "#F5F2EE" }}>{c}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#A0A0A0", textAlign: "center", marginTop: 8 }}>언제든 해지 가능 · 다음 결제 전까지 혜택 유지</p>
        </section>


        {error && <div style={{ color: "#e11d48", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{error}</div>}
      </div>

      {/* Sticky CTA */}
      {!status?.is_pro && (
        <div className="sticky-cta">
          <div className="sticky-cta-inner">
            <button type="button" className="tap" disabled={loading} onClick={startProPayment}
              style={{ width: "100%", padding: "15px 14px", borderRadius: 14, border: "none", background: loading ? "#A0A0A0" : "#3A3A3A", fontSize: 15, fontWeight: 700, color: "#fff", cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Icon icon="mdi:crown" width={18} />
              {loading ? "결제 준비 중..." : "Pro 시작하기 · 월 3,900원"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
