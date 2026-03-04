"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // TODO: 실제 API로 교체
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginType", "email");
        localStorage.setItem("loginTime", new Date().toISOString());

        router.push("/");
    };

    const handleKakaoLogin = () => {
        const backend =
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            "https://saju-backend-eqd6.onrender.com";

        window.location.href = `${backend}/auth/kakao/login`;
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
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@700;900&family=Gowun+Dodum&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .serif { font-family: 'Noto Serif KR', serif; }
        .sans  { font-family: 'Gowun Dodum', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu0 { animation: fadeUp .55s ease both; }
        .fu1 { animation: fadeUp .55s .12s ease both; }
        .fu2 { animation: fadeUp .55s .24s ease both; }

        .tap {
          transition: transform .15s ease, opacity .15s ease, filter .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.98); opacity: .92; }

        .wrap {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 0 20px 80px;
        }
        @media (max-width: 390px) {
          .wrap { padding: 0 16px 80px; }
        }

        input:focus {
          border-color: rgba(85,107,47,.55) !important;
          box-shadow: 0 0 0 4px rgba(125,193,150,.22) !important;
          background: #ffffff !important;
        }
      `}</style>

            <div className="wrap">
                {/* 헤더 */}
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
                        <img
                            src="/images/ham_icon.png"
                            alt=""
                            style={{ width: 28, height: 28, objectFit: "contain" }}
                        />
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
                        className="tap sans"
                        onClick={() => router.push("/")}
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#556b2f",
                            padding: "6px 16px",
                            borderRadius: 999,
                            border: "1.5px solid rgba(85,107,47,.25)",
                            background: "rgba(255,255,255,.55)",
                            backdropFilter: "blur(6px)",
                        }}
                    >
                        홈으로
                    </button>
                </header>

                {/* 카드 */}
                <section
                    className="fu1"
                    style={{
                        background: "linear-gradient(180deg, #ffffff 0%, #fbfdfb 100%)",
                        borderRadius: 20,
                        border: "1.5px solid rgba(85, 107, 47, .18)",
                        boxShadow: "0 10px 30px rgba(17,24,39, .08)",
                        padding: "26px 22px",
                        marginBottom: 14,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* 은은한 패턴 */}
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0.03,
                            backgroundImage:
                                "radial-gradient(circle, rgba(85,107,47,.9) 1px, transparent 1px)",
                            backgroundSize: "8px 8px",
                            pointerEvents: "none",
                        }}
                    />
                    {/* 상단 하이라이트 */}
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            inset: 0,
                            background:
                                "radial-gradient(240px 120px at 20% 0%, rgba(168,213,184,.28), transparent 60%)",
                            pointerEvents: "none",
                        }}
                    />

                    <div style={{ position: "relative" }}>
                        <div style={{ textAlign: "center", marginBottom: 16 }}>
                            <div
                                style={{
                                    display: "inline-block",
                                    padding: "5px 14px",
                                    background: "rgba(232,240,232,.9)",
                                    border: "1.5px solid rgba(85,107,47,.22)",
                                    borderRadius: 999,
                                    marginBottom: 14,
                                    boxShadow: "0 6px 18px rgba(17,24,39,.06)",
                                }}
                            >
                                <span
                                    className="sans"
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 800,
                                        color: "#556b2f",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    LOGIN
                                </span>
                            </div>

                            <h1
                                className="serif"
                                style={{
                                    fontSize: 22,
                                    fontWeight: 900,
                                    color: "#1a2e0e",
                                    letterSpacing: "-0.02em",
                                    marginBottom: 6,
                                }}
                            >
                                로그인
                            </h1>

                            <p
                                className="sans"
                                style={{ fontSize: 13, color: "#556b2f", opacity: 0.85 }}
                            >
                                저장된 사주를 이어서 확인할 수 있어요
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            style={{ display: "flex", flexDirection: "column", gap: 12 }}
                        >
                            <div>
                                <label
                                    className="sans"
                                    style={{
                                        display: "block",
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: "#2d4a1e",
                                        marginBottom: 6,
                                    }}
                                >
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@email.com"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px 12px",
                                        borderRadius: 12,
                                        border: "1.5px solid rgba(85,107,47,.18)",
                                        outline: "none",
                                        fontSize: 14,
                                        background: "#fbfdfb",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)",
                                    }}
                                />
                            </div>

                            <div>
                                <label
                                    className="sans"
                                    style={{
                                        display: "block",
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: "#2d4a1e",
                                        marginBottom: 6,
                                    }}
                                >
                                    비밀번호
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="비밀번호를 입력하세요"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px 12px",
                                        borderRadius: 12,
                                        border: "1.5px solid rgba(85,107,47,.18)",
                                        outline: "none",
                                        fontSize: 14,
                                        background: "#fbfdfb",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)",
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginTop: 2,
                                }}
                            >
                                <label
                                    className="sans"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        fontSize: 12,
                                        color: "#556b2f",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        style={{ width: 16, height: 16, accentColor: "#6fb78f" }}
                                    />
                                    로그인 상태 유지
                                </label>

                                <button
                                    type="button"
                                    className="tap sans"
                                    onClick={() => router.push("/forgot-password")}
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: "#556b2f",
                                        background: "transparent",
                                        border: "none",
                                        textDecoration: "underline",
                                    }}
                                >
                                    비밀번호 찾기
                                </button>
                            </div>

                            {/* 이메일 로그인 버튼 */}
                            <button
                                type="submit"
                                className="tap sans"
                                style={{
                                    width: "100%",
                                    padding: "13px 0",
                                    borderRadius: 16,
                                    fontWeight: 900,
                                    fontSize: 14,
                                    color: "#14301f",
                                    background:
                                        "linear-gradient(135deg, #bfe7c9 0%, #8fd3a8 55%, #62b584 100%)",
                                    border: "none",
                                    boxShadow:
                                        "0 2px 0 rgba(0,0,0,.06), 0 10px 22px rgba(16,24,40,.14)",
                                    marginTop: 6,
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <span
                                    aria-hidden
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "radial-gradient(120px 40px at 20% 20%, rgba(255,255,255,.55), transparent 60%)",
                                        pointerEvents: "none",
                                    }}
                                />
                                <span style={{ position: "relative" }}>로그인</span>
                            </button>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    margin: "10px 0 2px",
                                }}
                            >
                                <div style={{ height: 1, background: "#dce8dc", flex: 1 }} />
                                <span
                                    className="sans"
                                    style={{ fontSize: 11, color: "#556b2f", opacity: 0.75 }}
                                >
                                    간편 로그인
                                </span>
                                <div style={{ height: 1, background: "#dce8dc", flex: 1 }} />
                            </div>

                            <button
                                type="button"
                                className="tap sans"
                                onClick={handleKakaoLogin}
                                style={{
                                    width: "100%",
                                    padding: "13px 0",
                                    borderRadius: 16,
                                    fontWeight: 900,
                                    fontSize: 14,
                                    color: "#1a2e0e",
                                    background:
                                        "linear-gradient(135deg, #FFF3A6 0%, #FEE500 60%, #F5D700 100%)",
                                    border: "none",
                                    boxShadow:
                                        "0 2px 0 rgba(0,0,0,.06), 0 10px 22px rgba(16,24,40,.12)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 10,
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <span
                                    aria-hidden
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "radial-gradient(140px 44px at 22% 22%, rgba(255,255,255,.45), transparent 60%)",
                                        pointerEvents: "none",
                                    }}
                                />
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 18 18"
                                    fill="none"
                                    style={{ position: "relative" }}
                                >
                                    <path
                                        d="M9 0C4.03 0 0 3.34 0 7.47C0 10.07 1.57 12.35 4.03 13.69L3.12 17.25C3.06 17.47 3.29 17.64 3.48 17.52L7.66 14.97C8.1 15.02 8.55 15.05 9 15.05C13.97 15.05 18 11.71 18 7.58C18 3.45 13.97 0 9 0Z"
                                        fill="#3C1E1E"
                                    />
                                </svg>
                                <span style={{ position: "relative" }}>카카오 로그인</span>
                            </button>

                            <div style={{ textAlign: "center", marginTop: 10 }}>
                                <p
                                    className="sans"
                                    style={{ fontSize: 12, color: "#556b2f", opacity: 0.9 }}
                                >
                                    아직 회원이 아니신가요?{" "}
                                    <button
                                        type="button"
                                        className="tap sans"
                                        onClick={() => router.push("/signup")}
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 900,
                                            color: "#2d4a1e",
                                            background: "transparent",
                                            border: "none",
                                            textDecoration: "underline",
                                        }}
                                    >
                                        회원가입
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </section>

                <div className="fu2" style={{ textAlign: "center" }}>
                    <p className="sans" style={{ fontSize: 10, color: "#556b2f", opacity: 0.35 }}>
                        © 2026 한양사주 · AI 사주명리 분석 서비스
                    </p>
                </div>
            </div>
        </main>
    );
}