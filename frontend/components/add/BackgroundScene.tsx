"use client";

type Props = {
    backgroundUrl?: string; // 예: "/bg/hamster-forest.png"
    className?: string;
};

export default function BackgroundScene({
    backgroundUrl = "/bg/hamster-forest.png",
    className,
}: Props) {
    return (
        <div className={className} style={rootStyle(backgroundUrl)}>
            {/* 약한 오버레이 */}
            <div style={overlayStyle} />

            {/* 풀잎 흔들림(살짝) */}
            <div style={swayLayerStyle} />

            {/* 먼지/꽃씨 파티클(가볍게) */}
            <div style={particlesStyle} />
        </div>
    );
}

function rootStyle(url: string): React.CSSProperties {
    return {
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        zIndex: 0,
    };
}

const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    background: "rgba(0,0,0,0.25)",
};

const swayLayerStyle: React.CSSProperties = {
    position: "absolute",
    inset: -20,
    zIndex: 0,
    background:
        "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.00), rgba(255,255,255,0.06))",
    filter: "blur(8px)",
    opacity: 0.35,
    animation: "sajuSway 9s ease-in-out infinite",
};

const particlesStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    backgroundImage:
        "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.18) 0 1px, transparent 2px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.14) 0 1px, transparent 2px), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.12) 0 1px, transparent 2px)",
    backgroundSize: "220px 220px",
    opacity: 0.35,
    animation: "sajuParticles 14s linear infinite",
};

// 전역 keyframes를 JS에서 주입 (CSS 파일 안 만들고도 동작하게)
if (typeof document !== "undefined") {
    const id = "saju-login-keyframes";
    if (!document.getElementById(id)) {
        const style = document.createElement("style");
        style.id = id;
        style.textContent = `
@keyframes sajuSway {
  0% { transform: translateX(-2px); }
  50% { transform: translateX(2px); }
  100% { transform: translateX(-2px); }
}
@keyframes sajuParticles {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-18px); }
}
`;
        document.head.appendChild(style);
    }
}