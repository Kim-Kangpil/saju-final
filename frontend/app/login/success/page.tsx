"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedSajuList } from "@/lib/sajuStorage";
import { HamIcon } from "@/components/HamIcon";

export default function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loginType", "kakao");
    localStorage.setItem("loginTime", new Date().toISOString());

    const isFirstLogin = localStorage.getItem("isFirstLogin") !== "false";
    const savedSajuList = getSavedSajuList();

    const t = setTimeout(() => {
      if (isFirstLogin || savedSajuList.length === 0) {
        localStorage.setItem("isFirstLogin", "false");
        localStorage.setItem("showWelcome", "true");
        router.push("/add");
      } else {
        router.push("/mypage");
      }
    }, 1200);

    return () => clearTimeout(t);
  }, [router]);

  return (
    <main
      style={{
        background: "#eef4ee",
        minHeight: "100vh",
        fontFamily: "'Gowun Dodum', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@700;900&family=Gowun+Dodum&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .serif { font-family: 'Noto Serif KR', serif; }
        .sans  { font-family: 'Gowun Dodum', sans-serif; }

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
            <HamIcon alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
            <span
              className="sans"
              style={{
                fontSize: 13,
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
              color: "#556b2f",
              padding: "6px 16px",
              borderRadius: 999,
              border: "1.5px solid #adc4af",
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
              opacity: 0.03,
              backgroundImage: "radial-gradient(circle, #556b2f 1px, transparent 1px)",
              backgroundSize: "8px 8px",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "inline-block",
                padding: "5px 14px",
                background: "#e8f0e8",
                border: "1.5px solid #adc4af",
                borderRadius: 999,
                marginBottom: 18,
              }}
            >
              <span className="sans" style={{ fontSize: 11, fontWeight: 800, color: "#556b2f", letterSpacing: "0.08em" }}>
                LOGIN SUCCESS
              </span>
            </div>

            <div className="ham-float" style={{ width: 110, height: 110, margin: "0 auto 14px" }}>
              <HamIcon
                alt="햄스터"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 6px 16px rgba(85,107,47,.22))",
                }}
              />
            </div>

            <h1 className="serif" style={{ fontSize: 22, fontWeight: 900, color: "#1a2e0e", marginBottom: 8 }}>
              로그인 완료
            </h1>
            <p className="sans" style={{ fontSize: 13, color: "#556b2f", opacity: 0.9, lineHeight: 1.6 }}>
              저장된 사주를 확인할 준비 중이에요
            </p>

            <div style={{ height: 12 }} />

            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(85,107,47,.12)", background: "rgba(85,107,47,.06)" }}>
              <span className="pulse" style={{ width: 8, height: 8, borderRadius: 999, background: "#22c55e", display: "inline-block" }} />
              <span className="sans" style={{ fontSize: 12, fontWeight: 800, color: "#2d4a1e" }}>
                이동 중...
              </span>
            </div>
          </div>
        </section>

        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <p className="sans" style={{ fontSize: 10, color: "#556b2f", opacity: 0.35 }}>
            © 2026 한양사주 · AI 사주명리 분석 서비스
          </p>
        </div>
      </div>
    </main>
  );
}