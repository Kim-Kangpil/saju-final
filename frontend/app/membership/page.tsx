"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";

export default function MembershipPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benefits = [
    {
      icon: "mdi:ticket-confirmation-outline",
      title: "매달 분석권 10개 지급",
      desc: "고민분석, 궁합분석에 바로 사용 가능",
    },
    {
      icon: "mdi:file-document-outline",
      title: "맴버 전용 해석",
      desc: "일반 사용자보다 더 깊은 리포트 제공",
    },
    {
      icon: "mdi:rocket-launch-outline",
      title: "신기능 우선 체험",
      desc: "새로운 분석 기능을 먼저 만나볼 수 있어요",
    },
    {
      icon: "mdi:shield-check-outline",
      title: "광고·제한 완화",
      desc: "더 편하고 자유롭게 이용",
    },
  ];

  const scenarios = [
    {
      emoji: "🌀",
      title: "요즘 방향이 흔들릴 때",
      desc: "지금 필요한 해석을 더 부담 없이 확인",
    },
    {
      emoji: "💬",
      title: "연애·인간관계가 답답할 때",
      desc: "단발성 확인보다 반복 체크에 유리해요",
    },
    {
      emoji: "📅",
      title: "내 운의 흐름을 꾸준히 보고 싶을 때",
      desc: "매달 분석권으로 필요한 분석을 선택 가능",
    },
  ];

  const faqs = [
    { q: "언제든 해지 가능한가요?", a: "네, 언제든지 해지할 수 있어요. 다음 결제 전까지는 혜택이 유지됩니다." },
    { q: "분석권은 매달 언제 지급되나요?", a: "결제일 기준으로 매달 동일한 날짜에 자동 지급됩니다." },
    { q: "사용하지 않은 분석권은 이월되나요?", a: "현재는 이월되지 않으며, 매달 초기화 후 새로 지급됩니다." },
    { q: "일반 사용자와 차이가 뭔가요?", a: "분석권 제공 외에도 맴버 전용 해석 리포트와 신기능 우선 체험 혜택이 있어요." },
    { q: "앞으로 어떤 기능이 추가되나요?", a: "대운 흐름 분석, 맴버 전용 월간 리포트, 인간관계 지도 등이 순차 오픈 예정입니다." },
  ];

  return (
    <main
      style={{
        backgroundColor: "var(--bg-base)",
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: 80,
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sans { font-family: var(--font-sans); }
        .tap {
          transition: transform .15s ease, opacity .15s ease, box-shadow .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; box-shadow: 0 4px 10px rgba(0,0,0,.12); }
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px 40px; }
        @media (max-width: 390px) { .wrap { padding: 0 16px 40px; } }
        .faq-btn { width: 100%; background: none; border: none; cursor: pointer; text-align: left; font-family: var(--font-sans); }
        .sticky-cta {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          justify-content: center;
          padding: 12px 20px 20px;
          background: linear-gradient(to top, var(--bg-base) 60%, transparent);
        }
        .sticky-cta-inner {
          width: 100%; max-width: 420px;
        }
        .blur-preview {
          filter: blur(5px);
          user-select: none;
          pointer-events: none;
          opacity: 0.7;
        }
        .compare-col-highlight {
          background: linear-gradient(135deg, var(--bg-input), #c1d8c3);
          border: 2px solid var(--border-default);
        }
        .compare-col-plain {
          background: #f8faf8;
          border: 1.5px solid #e0e8e0;
        }
      `}</style>

      <div className="wrap">
        {/* ── 헤더 ── */}
        <header
          className="sans"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            margin: "0 -20px 0",
            background: "#c1d8c3",
            borderBottom: "3px solid var(--border-default)",
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
            <HamIcon style={{ width: 40, height: 40, objectFit: "contain" }} alt="로고" />
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.04em" }}>
              한양사주
            </span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => router.push("/seed-charge")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "6px 10px", borderRadius: 999,
                background: "rgba(255,255,255,0.85)", border: "1.5px solid var(--border-default)", cursor: "pointer",
              }}
            >
              <Icon icon="mdi:ticket-confirmation-outline" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>0</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/membership")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "6px 10px", borderRadius: 999,
                background: "rgba(255,255,255,0.85)", border: "1.5px solid var(--border-default)", cursor: "pointer",
              }}
            >
              <Icon icon="mdi:crown" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>한양사주 Pro</span>
            </button>
            <button
              type="button"
              className="tap"
              aria-label="메뉴 열기"
              onClick={() => router.push("/saju-mypage")}
              style={{
                padding: 8, borderRadius: 10, border: "none", background: "transparent",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon icon="mdi:menu" width={22} style={{ marginLeft: 14 }} />
            </button>
          </div>
        </header>

        {/* ── 1. 히어로 ── */}
        <section
          className="sans"
          style={{
            margin: "0 -20px",
            background: "linear-gradient(160deg, var(--bg-surface) 0%, var(--bg-input) 60%, var(--bg-input) 100%)",
            padding: "36px 24px 32px",
            textAlign: "center",
            borderBottom: "1.5px solid var(--border-default)",
          }}
        >
          <Icon icon="mdi:crown" width={80} style={{ display: "block", margin: "0 auto 16px" }} />
          <div
            style={{
              display: "inline-block",
              background: "var(--text-primary)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              borderRadius: 99,
              padding: "3px 10px",
              marginBottom: 12,
            }}
          >
            한양사주 Pro
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.45, marginBottom: 10 }}>
            더 깊은 사주 해석을,<br />더 가볍게 누리는 방법
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
            매달 분석권 혜택 + 맴버 전용 기능
          </p>

          {/* 핵심 혜택 요약 줄 */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            {["분석권 10개/월", "전용 리포트", "신기능 우선"].map((t) => (
              <span
                key={t}
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 99,
                  padding: "4px 10px",
                  fontSize: 12,
                  color: "var(--text-primary)",
                  fontWeight: 700,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>
            월 3,900원
          </div>
          <button
            type="button"
            className="tap sans"
            onClick={() => alert("한양사주 Pro 가입은 준비 중입니다.")}
            style={{
              width: "100%",
              padding: "13px 14px",
              borderRadius: 14,
              border: "none",
              background: "var(--text-primary)",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(106,153,78,0.3)",
            }}
          >
            지금 시작하기
          </button>
          <p style={{ fontSize: 11, color: "#7a9a6a", marginTop: 8 }}>언제든 해지 가능해요</p>
        </section>

        {/* ── 2. 혜택 카드 4개 ── */}
        <section className="sans" style={{ padding: "28px 0 4px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>한양사주 Pro 혜택</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {benefits.map((b) => (
              <div
                key={b.title}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1.5px solid #e0ece0",
                  padding: "14px 14px 16px",
                }}
              >
                <Icon icon={b.icon} width={22} style={{ color: "var(--text-primary)", marginBottom: 8, display: "block" }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. 비교표 ── */}
        <section className="sans" style={{ padding: "28px 0 4px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>분석권 단건 vs 한양사주 Pro</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* 단건 */}
            <div
              className="compare-col-plain"
              style={{ borderRadius: 14, padding: "16px 14px 18px" }}
            >
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700, marginBottom: 10 }}>분석권 단건 구매</div>
              {[
                ["매달 혜택", "없음"],
                ["가격 효율", "횟수↑ = 비용↑"],
                ["전용 콘텐츠", "❌"],
                ["신기능 체험", "❌"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#374151", marginBottom: 7, lineHeight: 1.4 }}>
                  <span style={{ color: "#9ca3af" }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, fontSize: 11, color: "#9ca3af", lineHeight: 1.5 }}>
                가끔 1~2번만<br />쓸 때 적합
              </div>
            </div>

            {/* 한양사주 Pro */}
            <div
              className="compare-col-highlight"
              style={{ borderRadius: 14, padding: "16px 14px 18px", position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: 10,
                  background: "var(--text-primary)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 99,
                  padding: "2px 8px",
                  letterSpacing: "0.06em",
                }}
              >
                추천
              </div>
              <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 700, marginBottom: 10 }}>한양사주 Pro</div>
              {[
                ["매달 혜택", "분석권 10개"],
                ["가격 효율", "고정 비용"],
                ["전용 콘텐츠", "✅"],
                ["신기능 체험", "✅"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-primary)", marginBottom: 7, lineHeight: 1.4 }}>
                  <span style={{ color: "#4a7c3f" }}>{k}</span>
                  <span style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, fontSize: 11, color: "#4a7c3f", lineHeight: 1.5, fontWeight: 700 }}>
                꾸준히 내 운세와<br />관계를 보고 싶다면
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. 가격 납득 계산 카드 ── */}
        <section className="sans" style={{ padding: "28px 0 4px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>이렇게 쓰면 바로 이득이에요</h2>
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1.5px solid #e0ece0",
              overflow: "hidden",
            }}
          >
            {[
              { label: "고민분석 1회", cost: "분석권 5개" },
              { label: "궁합분석 1회", cost: "분석권 7개" },
            ].map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: i === 0 ? "1px solid #f0f4f0" : "none",
                  fontSize: 13,
                  color: "#374151",
                }}
              >
                <span>{item.label}</span>
                <span style={{ fontWeight: 700, color: "#6b7280" }}>{item.cost} 필요</span>
              </div>
            ))}
            <div
              style={{
                background: "linear-gradient(135deg, var(--bg-input), #c1d8c3)",
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>한양사주 Pro 가입 시</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#3a6b2a" }}>매달 분석권 10개 자동 지급 ✨</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8, textAlign: "center" }}>
            고민분석 2번 = 분석권 10개 → 한양사주 Pro이면 기본 제공으로 해결
          </p>
        </section>

        {/* ── 5. 미리보기 (블러) ── */}
        <section className="sans" style={{ padding: "28px 0 4px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>맴버 전용 리포트 미리보기</h2>
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1.5px solid #e0ece0",
              padding: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 상단 일부 공개 */}
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 700, marginBottom: 8 }}>
              🌊 2026년 상반기 대운 흐름
            </div>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginBottom: 12 }}>
              지금 당신의 흐름은 <strong>변화의 전환점</strong>에 서 있어요.
              올 하반기는 움직임보다 내실을 다지는 시기로...
            </p>
            {/* 블러 처리 영역 */}
            <div className="blur-preview">
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginBottom: 8 }}>
                특히 재성과 관성의 흐름이 교차하는 구간에서 금전적 결정은
                신중하게 접근하는 게 좋고, 인간관계에서는 새로운 연결보다
                기존 관계의 재정비가 더 효과적이에요.
              </p>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
                이 시기에 가장 중요한 것은 내 중심을 잃지 않는 것...
              </p>
            </div>
            {/* 잠금 오버레이 */}
            <div
              style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                height: 100,
                background: "linear-gradient(to top, rgba(255,255,255,0.97) 50%, transparent)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-primary)", fontWeight: 700 }}>
                <Icon icon="mdi:lock-outline" width={16} />
                한양사주 Pro 가입 후 전체 열람 가능
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. 사용 시나리오 ── */}
        <section className="sans" style={{ padding: "28px 0 4px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>이런 분께 잘 맞아요</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {scenarios.map((s) => (
              <div
                key={s.title}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1.5px solid #e0ece0",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{s.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. FAQ ── */}
        <section className="sans" style={{ padding: "28px 0 4px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>자주 묻는 질문</h2>
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1.5px solid #e0ece0",
              overflow: "hidden",
            }}
          >
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid #f0f4f0" : "none" }}>
                <button
                  className="faq-btn"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 700, lineHeight: 1.4 }}>{f.q}</span>
                  <Icon
                    icon={openFaq === i ? "mdi:chevron-up" : "mdi:chevron-down"}
                    width={18}
                    style={{ color: "#9ca3af", flexShrink: 0 }}
                  />
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 16px 14px", fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 8. 하단 CTA (인라인) ── */}
        <section
          className="sans"
          style={{
            margin: "28px -20px 0",
            background: "linear-gradient(160deg, var(--bg-input) 0%, var(--bg-input) 100%)",
            padding: "28px 24px 32px",
            textAlign: "center",
            borderTop: "1.5px solid var(--border-default)",
          }}
        >
          <Icon icon="mdi:crown" width={48} style={{ display: "block", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.55, marginBottom: 6 }}>
            내 흐름을 더 자주,<br />더 깊게 확인하고 싶다면
          </p>
          <p style={{ fontSize: 13, color: "#4a7c3f", marginBottom: 18 }}>월 3,900원</p>
          <button
            type="button"
            className="tap sans"
            onClick={() => alert("한양사주 Pro 가입은 준비 중입니다.")}
            style={{
              width: "100%",
              padding: "13px 14px",
              borderRadius: 14,
              border: "none",
              background: "var(--text-primary)",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(106,153,78,0.3)",
            }}
          >
            한양사주 Pro 시작하기
          </button>
          <p style={{ fontSize: 11, color: "#7a9a6a", marginTop: 8 }}>언제든 해지 가능해요</p>
        </section>
      </div>

      {/* ── 하단 고정 CTA ── */}
      <div className="sticky-cta sans">
        <div className="sticky-cta-inner">
          <button
            type="button"
            className="tap sans"
            onClick={() => alert("한양사주 Pro 가입은 준비 중입니다.")}
            style={{
              width: "100%",
              padding: "13px 14px",
              borderRadius: 14,
              border: "none",
              background: "var(--text-primary)",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(106,153,78,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Icon icon="mdi:crown" width={18} />
            월 3,900원으로 시작하기
          </button>
        </div>
      </div>
    </main>
  );
}
