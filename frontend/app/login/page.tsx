"use client";

import { use, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { getSavedSajuList } from "@/lib/sajuStorage";

const borderField = "#B4A292";
const inputBg = "var(--bg-input)";
const textDark = "var(--text-primary)";
const radius = 12;

const ERROR_MESSAGE: Record<string, string> = {
    kakao_not_configured: "카카오 로그인 설정이 완료되지 않았습니다. 관리자에게 문의해 주세요.",
    missing_code: "카카오 인증 정보를 받지 못했습니다. 다시 시도해 주세요.",
    bad_state: "보안 검증에 실패했습니다. 다시 시도해 주세요.",
    no_access_token: "로그인 처리 중 오류가 났습니다. 다시 시도해 주세요.",
    access_denied: "카카오 로그인을 취소했습니다.",
};

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loginError, setLoginError] = useState<string | null>(null);

    useEffect(() => {
        const error = searchParams.get("error");
        if (error) {
            setLoginError(ERROR_MESSAGE[error] || "로그인 중 오류가 발생했습니다.");
        }
    }, [searchParams]);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);

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

        const savedSajuList = getSavedSajuList();
        if (!savedSajuList || savedSajuList.length === 0) {
            router.push("/saju-add");
        } else {
            router.push("/saju-list");
        }
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
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px 80px; }
        @media (max-width: 390px) { .wrap { padding: 0 16px 80px; } }
        input:focus { outline: none; border-color: ${borderField} !important; }
        .login-input::placeholder { color: #A09D94; }
      `}</style>

            <div className="wrap">
                {/* 헤더 – 시안: 뒤로가기, 로고, 메뉴 */}
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
                        onClick={() => router.back()}
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
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: inputBg,
                            border: `1.5px solid ${borderField}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Icon icon="mdi:yin-yang" width={24} style={{ color: textDark }} />
                    </div>
                    <button
                        type="button"
                        className="tap"
                        aria-label="메뉴"
                        onClick={() => router.push("/home")}
                        style={{
                            width: 40,
                            height: 40,
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: textDark,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Icon icon="mdi:menu" width={24} />
                    </button>
                </header>

                {/* 제목·설명 */}
                <div style={{ marginBottom: 24 }}>
                    <h1
                        style={{
                            fontSize: 26,
                            fontWeight: 700,
                            color: textDark,
                            marginBottom: 8,
                            lineHeight: 1.3,
                        }}
                    >
                        여러분의 계정으로 로그인하세요.
                    </h1>
                    <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
                        이메일과 비밀번호를 입력하여 로그인하세요.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <input
                        id="login-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="HanyangSaju@gmail.com"
                        required
                        className="login-input"
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
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="********"
                            required
                            className="login-input"
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

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: textDark, cursor: "pointer", fontWeight: 400 }}>
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                style={{ width: 18, height: 18, accentColor: borderField }}
                            />
                            로그인 정보 저장하기
                        </label>
                        <button
                            type="button"
                            className="tap"
                            onClick={() => router.push("/forgot-password")}
                            style={{
                                fontSize: 14,
                                fontWeight: 400,
                                color: "#2563eb",
                                background: "transparent",
                                border: "none",
                                textDecoration: "underline",
                                cursor: "pointer",
                            }}
                        >
                            비밀번호를 잊으셨나요?
                        </button>
                    </div>

                    {loginError && (
                        <p role="alert" style={{ fontSize: 13, color: "#c62828" }}>
                            {loginError}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="tap"
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            borderRadius: radius,
                            border: "1.5px solid #D4C4B0",
                            background: "#E8DFD4",
                            fontSize: 15,
                            fontWeight: 500,
                            color: textDark,
                            marginTop: 4,
                        }}
                    >
                        로그인
                    </button>
                </form>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 20px" }}>
                    <div style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>또는</span>
                    <div style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                        type="button"
                        className="tap"
                        onClick={() => {}}
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            borderRadius: radius,
                            border: `1.5px solid ${borderField}`,
                            background: "var(--bg-surface)",
                            fontSize: 14,
                            fontWeight: 600,
                            color: textDark,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                        }}
                    >
                        <Icon icon="mdi:google" width={22} />
                        구글 계정으로 로그인하기
                    </button>
                    <button
                        type="button"
                        className="tap"
                        onClick={() => {}}
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            borderRadius: radius,
                            border: `1.5px solid ${borderField}`,
                            background: "var(--bg-surface)",
                            fontSize: 14,
                            fontWeight: 600,
                            color: textDark,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                        }}
                    >
                        <Icon icon="simple-icons:naver" width={22} />
                        네이버 계정으로 로그인하기
                    </button>
                    <button
                        type="button"
                        className="tap"
                        onClick={handleKakaoLogin}
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            borderRadius: radius,
                            border: `1.5px solid ${borderField}`,
                            background: "var(--bg-surface)",
                            fontSize: 14,
                            fontWeight: 600,
                            color: textDark,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                            <path
                                d="M9 0C4.03 0 0 3.34 0 7.47C0 10.07 1.57 12.35 4.03 13.69L3.12 17.25C3.06 17.47 3.29 17.64 3.48 17.52L7.66 14.97C8.1 15.02 8.55 15.05 9 15.05C13.97 15.05 18 11.71 18 7.58C18 3.45 13.97 0 9 0Z"
                                fill="#3C1E1E"
                            />
                        </svg>
                        카카오 계정으로 로그인하기
                    </button>
                </div>

                <div style={{ textAlign: "center", marginTop: 28 }}>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                        계정이 없으신가요?
                    </p>
                    <button
                        type="button"
                        className="tap"
                        onClick={() => router.push("/signup")}
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#2563eb",
                            background: "transparent",
                            border: "none",
                            textDecoration: "underline",
                            cursor: "pointer",
                        }}
                    >
                        회원가입 하러가기
                    </button>
                </div>

                <div style={{ textAlign: "center", paddingTop: 32 }}>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", opacity: 0.7 }}>
                        © 2026 한양사주 · AI 사주명리 분석 서비스
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage({
    params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
    use(params ?? Promise.resolve({}));
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-[#eef4ee] flex items-center justify-center" style={{ fontFamily: "var(--font-sans)" }}>
                    <p className="text-[var(--text-primary)]">로딩 중...</p>
                </main>
            }
        >
            <LoginContent />
        </Suspense>
    );
}