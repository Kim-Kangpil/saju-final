"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HamIcon } from "@/components/HamIcon";
import { setStoredToken, getAuthHeaders } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

export default function LoginSuccessPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const provider = url.searchParams.get("provider") || "kakao";
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginType", provider);
      localStorage.setItem("loginTime", new Date().toISOString());
      // 모바일용: URL fragment(#t=토큰)에 담긴 세션 토큰 저장
      const hash = window.location.hash.slice(1);
      const paramsHash = new URLSearchParams(hash);
      const token = paramsHash.get("t");
      if (token) setStoredToken(token);
    }

    let cancelled = false;

    const redirect = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/saju/count`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json", ...getAuthHeaders() },
        });
        const data = await res.json().catch(() => ({}));
        const count = typeof data?.count === "number" ? data.count : 0;
        if (cancelled) return;
        if (count === 0) {
          router.push("/saju-add");
        } else {
          router.push("/saju-list");
        }
      } catch {
        if (cancelled) return;
        router.push("/saju-add");
      }
    };

    const t = setTimeout(redirect, 1200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-base)",
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .serif { font-family: var(--font-sans); }
        .sans  { font-family: var(--font-sans); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: .75; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.04); }
        }
        .fu0 { animation: fadeUp .55s ease both; }
        .fu1 { animation: fadeUp .55s .12s ease both; }
        .ham-float { animation: float 2.8s ease-in-out infinite; }
        .pulse { animation: pulse 2.1s ease-in-out infinite; }

        .wrap {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 0 20px 80px;
        }
        @media (max-width: 390px) {
          .wrap { padding: 0 16px 80px; }
        }
      `}</style>

      <div className="wrap">
        <header
          className="fu0"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            paddingBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HamIcon alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />
            <span
              className="sans"
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#2d4a1e",
                letterSpacing: "0.04em",
              }}
            >
              한양사주
            </span>
          </div>

          <button
            className="sans"
            onClick={() => router.push("/")}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-primary)",
              padding: "6px 16px",
              borderRadius: 999,
              border: "1.5px solid var(--border-default)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            홈으로
          </button>
        </header>

        <section
          className="fu1"
          style={{
            background: "#ffffff",
            borderRadius: 20,
            border: "1.5px solid #c8dac8",
            padding: "34px 24px",
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              opacity: 0.03,
              backgroundImage: "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "inline-block",
                padding: "5px 14px",
                background: "var(--bg-input)",
                border: "1.5px solid var(--border-default)",
                borderRadius: 999,
                marginBottom: 18,
              }}
            >
              <span className="sans" style={{ fontSize: 11, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.08em" }}>
                LOGIN SUCCESS
              </span>
            </div>

            <div className="ham-float" style={{ width: 110, height: 110, margin: "0 auto 14px" }}>
              <HamIcon
                alt="로고"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 6px 16px rgba(85,107,47,.22))",
                }}
              />
            </div>

            <h1 className="serif" style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>
              로그인 완료
            </h1>
            <p className="sans" style={{ fontSize: 13, color: "var(--text-primary)", opacity: 0.9, lineHeight: 1.6 }}>
              저장된 사주를 확인할 준비 중이에요
            </p>

            <div style={{ height: 12 }} />

            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--bg-input)" }}>
              <span className="pulse" style={{ width: 8, height: 8, borderRadius: 999, background: "#22c55e", display: "inline-block" }} />
              <span className="sans" style={{ fontSize: 12, fontWeight: 800, color: "#2d4a1e" }}>
                이동 중...
              </span>
            </div>
          </div>
        </section>

        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <p className="sans" style={{ fontSize: 10, color: "var(--text-primary)", opacity: 0.35 }}>
            © 2026 한양사주 · AI 사주명리 분석 서비스
          </p>
        </div>
      </div>
    </main>
  );
}