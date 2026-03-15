"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

const borderField = "#B4A292";
const inputBg = "var(--bg-input)";
const textDark = "var(--text-primary)";
const radius = 12;

export default function StartPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const iconSize = 16;
  const iconCircleSize = 28;

  const iconCircleStyle = (bg: string) => ({
    width: iconCircleSize,
    height: iconCircleSize,
    borderRadius: "50%",
    background: bg,
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0,
  });

  const btnBase = {
    width: "100%" as const,
    padding: "10px 14px",
    borderRadius: radius,
    border: `1.5px solid ${borderField}`,
    background: "var(--bg-surface)",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    fontSize: 13,
    fontWeight: 400,
    color: textDark,
    cursor: "pointer" as const,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        backgroundColor: "var(--bg-base)",
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .tap { transition: transform .15s ease, opacity .15s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .tap:active { transform: scale(.98); opacity: .92; }
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px 40px; }
        @media (max-width: 390px) { .wrap { padding: 0 16px 40px; } }
        .start-input::placeholder { color: #A09D94; }
        .start-input:focus { outline: none; border-color: #B0B0B0 !important; }
      `}</style>

      <div className="wrap">
        {/* 헤더 – 로그인/saju-add와 동일 */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 0 24px",
          }}
        >
          <button
            type="button"
            className="tap"
            onClick={() => router.push("/home")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: textDark,
            }}
          >
            <Icon icon="mdi:chevron-left" width={28} />
          </button>
          <h1
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 18,
              fontWeight: 700,
              color: textDark,
            }}
          >
            한양사주
          </h1>
          <div style={{ width: 40, flexShrink: 0 }} aria-hidden />
        </header>

        {/* 시작하기 섹션 – 로그인 시안과 동일 */}
        <section style={{ padding: "8px 0 24px" }}>
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: textDark,
                marginBottom: 8,
                lineHeight: 1.3,
                textAlign: "left",
              }}
            >
              여러분의 계정으로 로그인하세요.
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                textAlign: "left",
              }}
            >
              이메일과 비밀번호를 입력해주세요.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            <input
              id="start-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="HanyangSaju@gmail.com"
              className="start-input"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: radius,
                border: "1.5px solid #E0E0E0",
                outline: "none",
                fontSize: 14,
                background: "#FFFFFF",
                color: textDark,
              }}
            />
            <div style={{ position: "relative" }}>
              <input
                id="start-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="start-input"
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 16px",
                  borderRadius: radius,
                  border: "1.5px solid #E0E0E0",
                  outline: "none",
                  fontSize: 14,
                  background: "#FFFFFF",
                  color: textDark,
                }}
              />
              <button
                type="button"
                className="tap"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  padding: 4,
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} width={22} />
              </button>
            </div>
            <button
              type="button"
              className="tap"
              onClick={() => router.push("/login")}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: radius,
                border: "1.5px solid #E8E4DF",
                background: "#F5F2EE",
                fontSize: 15,
                fontWeight: 500,
                color: textDark,
              }}
            >
              로그인
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>또는</span>
            <div style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button type="button" onClick={goKakao} className="tap" style={btnBase}>
              <span style={iconCircleStyle("#FEE500")}>
                <svg width={iconSize} height={iconSize} viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 0C4.03 0 0 3.34 0 7.47C0 10.07 1.57 12.35 4.03 13.69L3.12 17.25C3.06 17.47 3.29 17.64 3.48 17.52L7.66 14.97C8.1 15.02 8.55 15.05 9 15.05C13.97 15.05 18 11.71 18 7.58C18 3.45 13.97 0 9 0Z"
                    fill="#3C1E1E"
                  />
                </svg>
              </span>
              카카오 계정으로 로그인하기
            </button>
            <button type="button" onClick={goGoogle} className="tap" style={btnBase}>
              <span style={iconCircleStyle("#E8E5DF")}>
                <Icon icon="logos:google-icon" width={iconSize} height={iconSize} />
              </span>
              Google 계정으로 로그인하기
            </button>
            <button type="button" onClick={pending} className="tap" style={btnBase}>
              <span style={iconCircleStyle("#03C75A")}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" fill="#fff" />
                </svg>
              </span>
              네이버 계정으로 로그인하기
            </button>
            <button type="button" onClick={goEmail} className="tap" style={btnBase}>
              <span style={iconCircleStyle("#E8E5DF")}>
                <Icon icon="mdi:email-outline" width={iconSize} height={iconSize} />
              </span>
              이메일로 로그인하기
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

