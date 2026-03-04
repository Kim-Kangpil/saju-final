"use client";

type Props = {
    title?: string;
    subtitle?: string;
    onKakaoLogin: () => void; // 기존 로직 그대로 연결
    disabled?: boolean;
};

export default function LoginCard({
    title = "한양사주 AI",
    subtitle = "내 사주와 오늘의 흐름을 바로 확인해보세요",
    onKakaoLogin,
    disabled = false,
}: Props) {
    return (
        <section style={wrapStyle}>
            <div style={cardStyle}>
                <div style={logoStyle}>🔮</div>
                <h1 style={titleStyle}>{title}</h1>
                <p style={subStyle}>{subtitle}</p>

                <button
                    type="button"
                    onClick={onKakaoLogin}
                    disabled={disabled}
                    style={{
                        ...btnStyle,
                        opacity: disabled ? 0.7 : 1,
                        cursor: disabled ? "not-allowed" : "pointer",
                    }}
                >
                    <span style={kakaoIconStyle} />
                    카카오로 시작하기
                </button>

                <div style={hintStyle}>
                    로그인하면 사주 분석 저장 · 오늘의 운세 · 맞춤 리포트 제공
                </div>
            </div>
        </section>
    );
}

const wrapStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
};

const cardStyle: React.CSSProperties = {
    width: "min(380px, 92vw)",
    borderRadius: 24,
    padding: "28px 24px",
    background: "rgba(255,255,255,0.86)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
    textAlign: "center",
};

const logoStyle: React.CSSProperties = {
    fontSize: 44,
    marginBottom: 10,
};

const titleStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    lineHeight: 1.15,
};

const subStyle: React.CSSProperties = {
    margin: "10px 0 18px",
    fontSize: 14,
    opacity: 0.85,
    lineHeight: 1.4,
};

const btnStyle: React.CSSProperties = {
    width: "100%",
    height: 56,
    borderRadius: 14,
    border: "none",
    background: "#FEE500",
    color: "#111",
    fontWeight: 800,
    fontSize: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
    transform: "translateZ(0)",
};

const kakaoIconStyle: React.CSSProperties = {
    width: 20,
    height: 20,
    borderRadius: 6,
    background: "rgba(0,0,0,0.15)",
    display: "inline-block",
};

const hintStyle: React.CSSProperties = {
    marginTop: 12,
    fontSize: 12,
    opacity: 0.75,
};