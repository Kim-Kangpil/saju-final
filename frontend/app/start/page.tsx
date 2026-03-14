"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";

export default function StartPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();

  const backend =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://saju-backend-eqd6.onrender.com";

  const goKakao = () => {
    if (typeof window !== "undefined") {
      window.location.href = `${backend}/auth/kakao/login`;
    }
  };

  const goGoogle = () => {
    if (typeof window !== "undefined") {
      window.location.href = `${backend}/auth/google/login`;
    }
  };

  const goEmail = () => router.push("/signup");

  const pending = () => {
    alert("아직 준비 중인 기능입니다.\n카카오 또는 이메일로 먼저 이용해 주세요.");
  };

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
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sans  { font-family: 'Gowun Dodum', sans-serif; }
        .tap {
          transition: transform .15s ease, opacity .15s ease, box-shadow .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; box-shadow: 0 4px 10px rgba(0,0,0,.12); }
        .wrap {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }
        @media (max-width: 390px) {
          .wrap { padding: 0 16px 40px; }
        }
      `}</style>

      <div className="wrap">
        {/* 헤더 – home 페이지와 톤 맞춤 */}
        <header
          className="sans"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            margin: "0 -20px 16px",
            background: "#c1d8c3",
            borderBottom: "3px solid #adc4af",
          }}
        >
          <button
            onClick={() => router.push("/home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <HamIcon style={{ width: 40, height: 40, objectFit: "contain" }} alt="햄스터" />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#2d4a1e", letterSpacing: "0.04em" }}>
              한양사주
            </span>
          </button>
        </header>

        {/* 시작하기 섹션 */}
        <section
          className="sans"
          style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: 0,
            border: "1.5px solid #c8dac8",
            padding: "24px 20px 24px",
            margin: "0 -20px 0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
          }}
        >
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1a2e0e",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            회원가입 &amp; 로그인
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#556b2f",
              opacity: 0.85,
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            편한 방법으로 한 번만 시작해 두면, 이후에는 바로 내 사주를 확인할 수 있어요.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* 카카오 */}
            <button
              type="button"
              onClick={goKakao}
              className="tap sans"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "1.5px solid #FEE500",
                background: "#FEE500",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 14,
                fontWeight: 700,
                color: "#3b1e1e",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Icon icon="simple-icons:kakaotalk" width={20} />
                카카오로 시작하기
              </span>
              <span style={{ fontSize: 16 }}>➜</span>
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={goGoogle}
              className="tap sans"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "1.5px solid #e5e7eb",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 14,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Icon icon="logos:google-icon" width={20} />
                Google로 시작하기
              </span>
              <span style={{ fontSize: 16 }}>➜</span>
            </button>

            {/* Naver */}
            <button
              type="button"
              onClick={pending}
              className="tap sans"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "1.5px solid #16a34a",
                background: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 14,
                fontWeight: 700,
                color: "#f9fafb",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Icon icon="simple-icons:naver" width={20} />
                네이버로 시작하기
              </span>
              <span style={{ fontSize: 16 }}>➜</span>
            </button>

            {/* Email */}
            <button
              type="button"
              onClick={goEmail}
              className="tap sans"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "1.5px solid #adc4af",
                background: "#f8faf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 14,
                fontWeight: 700,
                color: "#1a2e0e",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Icon icon="mdi:email-outline" width={20} />
                이메일로 시작하기
              </span>
              <span style={{ fontSize: 16 }}>➜</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

