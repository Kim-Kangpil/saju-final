"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://saju-backend-eqd6.onrender.com";

const S = {
  cream: "#F5F1EA",
  cream2: "#EDE7DB",
  ink: "#2C2417",
  ink2: "#4A3F30",
  ink3: "#6B5F4E",
  gold: "#8B7355",
  goldLight: "#A8946A",
  beige: "#D4C9B8",
};

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // 로그인 유저 → /home 자동 이동
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("hsaju_token") : null;
    if (!token) { setChecking(false); return; }
    fetch(`${API_BASE}/api/saju/list`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (r.ok) router.replace("/home"); else setChecking(false); })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: S.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${S.beige}`, borderTopColor: S.gold, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: S.cream, fontFamily: "'Gmarket Sans', sans-serif", overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .tap { transition: transform .15s, opacity .15s; cursor: pointer; }
        .tap:active { transform: scale(.97); opacity: .9; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp .55s ease both; }
        .fade-up-1 { animation-delay: .1s; }
        .fade-up-2 { animation-delay: .25s; }
        .fade-up-3 { animation-delay: .4s; }
        .fade-up-4 { animation-delay: .55s; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .65; } }
        .pulse { animation: pulse 2.4s ease-in-out infinite; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(245,241,234,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${S.beige}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: S.ink }}>한양사주</span>
        <button className="tap" onClick={() => router.push("/start")}
          style={{ padding: "8px 18px", borderRadius: 20, border: `1.5px solid ${S.gold}`, background: "transparent", fontSize: 13, fontWeight: 700, color: S.gold, cursor: "pointer" }}>
          로그인
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 480, margin: "0 auto", padding: "56px 24px 48px", textAlign: "center" }}>
        {/* 배지 */}
        <div className="fade-up fade-up-1" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, background: "#fff", border: `1px solid ${S.beige}`, marginBottom: 28, boxShadow: "0 2px 8px rgba(44,36,23,0.07)" }}>
          <span className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: S.ink3, fontWeight: 600 }}>AI가 내 사주를 기억해요</span>
        </div>

        {/* 메인 헤드라인 */}
        <h1 className="fade-up fade-up-2" style={{ fontSize: "clamp(24px, 6.5vw, 30px)", fontWeight: 700, color: S.ink, lineHeight: 1.45, marginBottom: 20, wordBreak: "keep-all" }}>
          사주 보고 궁금한 거 생겼는데<br />
          <span style={{ color: S.gold }}>물어볼 데 없어서 답답했죠?</span>
        </h1>

        {/* 서브 카피 */}
        <p className="fade-up fade-up-3" style={{ fontSize: 16, color: S.ink3, lineHeight: 1.8, marginBottom: 36, wordBreak: "keep-all" }}>
          AI가 내 사주를 기억하고<br />
          <strong style={{ color: S.ink2 }}>뭐든 대답해줘요.</strong>
        </p>

        {/* CTA */}
        <div className="fade-up fade-up-4">
          <button className="tap" onClick={() => router.push("/start")}
            style={{ width: "100%", maxWidth: 340, padding: "16px 24px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${S.ink}, #4A3F30)`, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(44,36,23,0.25)", display: "block", margin: "0 auto" }}>
            무료로 내 사주 분석받기 →
          </button>
          <p style={{ marginTop: 10, fontSize: 12, color: S.ink3 }}>
            카드 정보 불필요&nbsp;·&nbsp;30초 완성
          </p>
        </div>

        {/* 샘플 채팅 버블 */}
        <div style={{ marginTop: 44, textAlign: "left", maxWidth: 340, margin: "44px auto 0" }}>
          {[
            { from: "user", text: "지금 이직해도 될까요?" },
            { from: "ai",   text: "지금은 변화보다 준비 기간이에요. 내년 봄까지 쌓아두면 기회가 훨씬 커져요." },
            { from: "user", text: "이 사람이랑 잘 맞을까요?" },
            { from: "ai",   text: "오행 구조로 보면 처음엔 끌리는데 장기적으론 마찰이 생겨요. 각자 공간이 필요한 조합이에요." },
          ].map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start", marginBottom: 8, opacity: 0, animation: `fadeUp .4s ease ${0.7 + i * 0.15}s both` }}>
              {msg.from === "ai" && (
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: S.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>
                  🔮
                </div>
              )}
              <div style={{
                maxWidth: "76%", padding: "10px 14px", borderRadius: msg.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.from === "user" ? S.ink : "#fff",
                color: msg.from === "user" ? "#fff" : S.ink2,
                fontSize: 13, lineHeight: 1.7, wordBreak: "keep-all",
                border: msg.from === "ai" ? `1px solid ${S.beige}` : "none",
                boxShadow: "0 2px 8px rgba(44,36,23,0.08)",
              }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: 비교 UI ── */}
      <section style={{ background: "#fff", borderTop: `1px solid ${S.beige}`, borderBottom: `1px solid ${S.beige}`, padding: "48px 20px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: S.gold, textAlign: "center", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
            왜 한양사주인가요?
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: S.ink, textAlign: "center", marginBottom: 32, lineHeight: 1.4, wordBreak: "keep-all" }}>
            다른 사주 앱이랑<br />이게 다릅니다
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* 경쟁사 */}
            <div style={{ borderRadius: 16, border: `1px solid #E8E4DF`, background: "#FAFAF8", padding: "20px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#B0A090", marginBottom: 14, textAlign: "center", letterSpacing: 0.5 }}>
                기존 사주 서비스
              </div>
              {[
                "리포트 읽고 끝",
                "질문하면 아무도 없음",
                "내 상황 반영 불가",
                "한 번 보고 버림",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                  <span style={{ color: "#D08080", fontSize: 14, flexShrink: 0, marginTop: 1 }}>✕</span>
                  <span style={{ fontSize: 13, color: "#9A8A7A", lineHeight: 1.5, wordBreak: "keep-all" }}>{t}</span>
                </div>
              ))}
            </div>

            {/* 한양사주 */}
            <div style={{ borderRadius: 16, border: `2px solid ${S.gold}`, background: "#FBF8F3", padding: "20px 16px", boxShadow: "0 4px 16px rgba(139,115,85,0.12)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.gold, marginBottom: 14, textAlign: "center", letterSpacing: 0.5 }}>
                한양사주
              </div>
              {[
                "AI가 내 사주 기억하고 대화",
                "뭐든 바로 물어볼 수 있음",
                "내 고민에 맞게 해석",
                "언제든 다시 열람 가능",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                  <span style={{ color: "#22C55E", fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 13, color: S.ink2, lineHeight: 1.5, fontWeight: 500, wordBreak: "keep-all" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 포인트 한 줄 */}
          <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 12, background: `linear-gradient(135deg, #FBF8F3, #F0EBE0)`, border: `1px solid ${S.beige}`, textAlign: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: S.ink }}>
              📖 리포트로 보고, 💬 AI에게 바로 물어보고
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: 기능 소개 ── */}
      <section style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: S.ink, textAlign: "center", marginBottom: 28, lineHeight: 1.4 }}>
          이런 걸 물어볼 수 있어요
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: "💼", title: "이직·창업 타이밍", desc: "지금 움직여도 될지, 언제가 제일 좋은지" },
            { icon: "❤️", title: "연애·결혼 궁합",  desc: "이 사람이랑 잘 맞는지, 언제 인연이 오는지" },
            { icon: "💰", title: "재물·투자 흐름",  desc: "올해 돈 흐름이 어떤지, 무엇을 조심해야 하는지" },
            { icon: "🧭", title: "지금 이 시기 해석", desc: "왜 이렇게 힘든지, 이 상황이 언제 끝나는지" },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 18px", borderRadius: 14, background: "#fff", border: `1px solid ${S.beige}`, boxShadow: "0 1px 4px rgba(44,36,23,0.05)" }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: S.ink, marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: 13, color: S.ink3, lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 하단 CTA ── */}
      <section style={{ background: `linear-gradient(135deg, ${S.ink}, #4A3F30)`, padding: "48px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🔮</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12, lineHeight: 1.45, wordBreak: "keep-all" }}>
            지금 바로 사주를 입력하고<br />AI에게 물어보세요
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: 28, wordBreak: "keep-all" }}>
            가입만 해도 무료 채팅 3번이 생겨요.<br />카드 정보 없이 30초 안에 시작할 수 있어요.
          </p>
          <button className="tap" onClick={() => router.push("/start")}
            style={{ width: "100%", maxWidth: 320, padding: "16px 0", borderRadius: 14, border: "none", background: "#fff", color: S.ink, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "block", margin: "0 auto", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
            무료로 내 사주 분석받기 →
          </button>
          <p style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            카드 정보 불필요 · 30초 완성
          </p>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer style={{ padding: "24px 20px", textAlign: "center", borderTop: `1px solid ${S.beige}`, background: S.cream }}>
        <p style={{ fontSize: 12, color: S.ink3 }}>
          © 2026 한양사주 &nbsp;·&nbsp;
          <button onClick={() => router.push("/privacy")} style={{ background: "none", border: "none", fontSize: 12, color: S.ink3, cursor: "pointer", textDecoration: "underline" }}>개인정보처리방침</button>
          &nbsp;·&nbsp;
          <button onClick={() => router.push("/terms")} style={{ background: "none", border: "none", fontSize: 12, color: S.ink3, cursor: "pointer", textDecoration: "underline" }}>이용약관</button>
        </p>
      </footer>
    </main>
  );
}
