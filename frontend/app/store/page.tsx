"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";
import { HamIcon } from "@/components/HamIcon";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const S = {
  cream: "#F5F1EA",
  cream2: "#EDE7DB",
  ink: "#2C2417",
  ink2: "#4A3F30",
  ink3: "#6B5F4E",
  gold: "#8B7355",
  goldLight: "#A8946A",
  beige: "#D4C9B8",
  beige2: "#C4B8A4",
  border: "#E0D9CE",
};

type PaymentStatus = {
  is_pro: boolean;
  pro_expires_at: string | null;
  report_credits: number;
  daily_chat_count: number;
  chat_limit: number;
};

type SajuItem = { id: number; name: string };

const SPEC_REPORTS = [
  { key: "money", label: "재물운 리포트", icon: "mdi:currency-krw", desc: "재물·투자·사업 흐름 분석" },
  { key: "love", label: "연애운 리포트", icon: "mdi:heart-outline", desc: "관계·궁합·이성 에너지 분석" },
  { key: "career", label: "직업운 리포트", icon: "mdi:briefcase-outline", desc: "직업·적성·커리어 방향 분석" },
];

const SUB_BENEFITS = [
  { icon: "mdi:chat-outline", text: "AI 채팅 무제한 — 하루 제한 없이" },
  { icon: "mdi:file-chart-outline", text: "매월 특화 리포트 1개 무료" },
  { icon: "mdi:calendar-month-outline", text: "월간 세운 브리핑 자동 발송" },
];

export default function StorePage() {
  const router = useRouter();
  const [tab, setTab] = useState<"reports" | "subscription">("reports");
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [sajuList, setSajuList] = useState<SajuItem[]>([]);

  useEffect(() => {
    const headers = getAuthHeaders();
    fetch(`${API_BASE}/api/payment/status`, { credentials: "include", headers })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
    fetch(`${API_BASE}/api/saju/list`, { credentials: "include", headers })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items ?? [];
        setSajuList(list);
      })
      .catch(() => {});
  }, []);

  const firstSajuId = sajuList[0]?.id ?? null;

  function goReport(path: string) {
    if (!firstSajuId) { router.push("/saju-add"); return; }
    router.push(`${path}?saju_id=${firstSajuId}`);
  }

  const chatRemaining = status
    ? Math.max(0, (status.chat_limit ?? 3) - (status.daily_chat_count ?? 0))
    : null;

  return (
    <main style={{ minHeight: "100vh", background: S.cream, fontFamily: "'Gmarket Sans', sans-serif", paddingBottom: 80 }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px; }
        .tap { transition: transform .12s ease, opacity .12s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .tap:active { transform: scale(.97); opacity: .9; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fu { animation: fadeUp .4s ease both; }
        .fu1 { animation-delay: .05s; }
        .fu2 { animation-delay: .1s; }
        .fu3 { animation-delay: .15s; }
        .fu4 { animation-delay: .2s; }
        .fu5 { animation-delay: .25s; }
        .fu6 { animation-delay: .3s; }
      `}</style>

      <div className="wrap">
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: `1.5px solid ${S.border}` }}>
          <button onClick={() => router.push("/home")} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer" }}>
            <HamIcon style={{ width: 36, height: 36 }} alt="로고" />
            <span style={{ fontSize: 16, fontWeight: 700, color: S.ink }}>한양사주</span>
          </button>
          <button onClick={() => router.push("/saju-mypage")} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6 }}>
            <Icon icon="mdi:menu" width={22} color={S.ink} />
          </button>
        </header>

        {/* Page title */}
        <div style={{ padding: "24px 0 0" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: S.ink, marginBottom: 4 }}>스토어</h1>
          <p style={{ fontSize: 13, color: S.ink3 }}>리포트 구매 및 구독 관리</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, margin: "20px 0 0", borderBottom: `2px solid ${S.border}` }}>
          {([["reports", "리포트 구매"], ["subscription", "Pro 구독"]] as const).map(([id, label]) => (
            <button
              key={id}
              className="tap"
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                padding: "11px 0",
                fontSize: 14,
                fontWeight: tab === id ? 700 : 500,
                color: tab === id ? S.ink : S.ink3,
                background: "transparent",
                border: "none",
                borderBottom: tab === id ? `2.5px solid ${S.ink}` : "2.5px solid transparent",
                marginBottom: -2,
                cursor: "pointer",
                fontFamily: "'Gmarket Sans', sans-serif",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── 내 리포트 탭 ── */}
        {tab === "reports" && (
          <div style={{ paddingTop: 24 }}>

            {/* 기본 리포트 */}
            <div className="fu fu1" style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${S.border}`, padding: "18px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: S.cream2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon icon="mdi:file-document-outline" width={22} color={S.gold} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: S.ink, marginBottom: 3 }}>기본 리포트</div>
                    <div style={{ fontSize: 12, color: S.ink3, lineHeight: 1.5 }}>사주 기반 기질·성격·운세 종합 분석</div>
                    <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, background: "#ECFDF5", borderRadius: 20, padding: "4px 10px" }}>
                      <span style={{ fontSize: 12 }}>✅</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#065F46" }}>무료 분석 완료</span>
                    </div>
                  </div>
                </div>
                <button
                  className="tap"
                  onClick={() => goReport("/report/basic")}
                  style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${S.beige2}`, background: S.cream, fontSize: 12, fontWeight: 700, color: S.ink2, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  바로 보기
                </button>
              </div>
            </div>

            {/* 특화 리포트 섹션 헤더 */}
            <div className="fu fu2" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: S.ink3, marginBottom: 10, marginTop: 6, paddingLeft: 2 }}>
              특화 리포트 · 각 2,900원
            </div>

            {/* 재물/연애/직업 */}
            {SPEC_REPORTS.map((r, i) => (
              <div
                key={r.key}
                className={`fu fu${i + 3}`}
                style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${S.border}`, padding: "18px 18px", marginBottom: 12 }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: S.cream2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon icon={r.icon} width={22} color={S.gold} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: S.ink, marginBottom: 3 }}>{r.label}</div>
                      <div style={{ fontSize: 12, color: S.ink3, lineHeight: 1.5 }}>{r.desc}</div>
                      <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700, color: S.ink }}>2,900원</div>
                    </div>
                  </div>
                  <button
                    className="tap"
                    onClick={() => goReport(`/report/${r.key}/intro`)}
                    style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 10, border: "none", background: "#FEE500", fontSize: 12, fontWeight: 700, color: "#191919", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <span style={{ display: "inline-flex", width: 16, height: 16, borderRadius: "50%", background: "#191919", color: "#FEE500", fontSize: 9, fontWeight: 900, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>K</span>
                    구매하기
                  </button>
                </div>
              </div>
            ))}

            {/* 심화 리포트 */}
            <div className="fu fu6" style={{ background: "#fff", borderRadius: 16, border: `2px solid ${S.gold}`, padding: "18px 18px", marginBottom: 12, position: "relative", overflow: "hidden" }}>
              {/* 뱃지 */}
              <div style={{ position: "absolute", top: 0, right: 0, background: S.gold, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderBottomLeftRadius: 12 }}>
                ⭐ 가장 많이 구매
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F5EFE0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon icon="mdi:star-four-points-outline" width={22} color={S.gold} />
                  </div>
                  <div style={{ paddingTop: 2 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: S.ink, marginBottom: 3 }}>심화 리포트</div>
                    <div style={{ fontSize: 12, color: S.ink3, lineHeight: 1.5 }}>대운·세운·격국 기반 심층 운명 분석</div>
                    <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700, color: S.gold }}>4,900원</div>
                  </div>
                </div>
                <button
                  className="tap"
                  onClick={() => goReport("/report/deep/intro")}
                  style={{ flexShrink: 0, marginTop: 20, padding: "8px 14px", borderRadius: 10, border: "none", background: "#FEE500", fontSize: 12, fontWeight: 700, color: "#191919", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span style={{ display: "inline-flex", width: 16, height: 16, borderRadius: "50%", background: "#191919", color: "#FEE500", fontSize: 9, fontWeight: 900, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>K</span>
                  결제하기
                </button>
              </div>
            </div>

            {/* 출시 예정 섹션 헤더 */}
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: S.beige2, marginBottom: 10, marginTop: 6, paddingLeft: 2 }}>
              출시 예정
            </div>

            {/* 궁합 */}
            <div style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${S.border}`, padding: "18px 18px", marginBottom: 12, opacity: 0.5, pointerEvents: "none" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: S.cream2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon icon="mdi:account-heart-outline" width={22} color={S.ink3} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: S.ink, marginBottom: 3 }}>궁합 리포트</div>
                    <div style={{ fontSize: 12, color: S.ink3, lineHeight: 1.5 }}>두 사람의 사주 합충 기반 궁합 분석</div>
                    <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700, color: S.ink }}>3,900원</div>
                  </div>
                </div>
                <div style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${S.border}`, fontSize: 12, color: S.ink3, whiteSpace: "nowrap" }}>
                  출시 예정
                </div>
              </div>
            </div>

            {/* 신년운세 */}
            <div style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${S.border}`, padding: "18px 18px", marginBottom: 12, opacity: 0.5, pointerEvents: "none" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: S.cream2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon icon="mdi:firework" width={22} color={S.ink3} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: S.ink, marginBottom: 3 }}>대운+세운 연간 리포트</div>
                    <div style={{ fontSize: 12, color: S.ink3, lineHeight: 1.5 }}>연간 대운 흐름 + 12개월 월운 총정리</div>
                    <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700, color: S.ink }}>9,900원</div>
                  </div>
                </div>
                <div style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${S.border}`, fontSize: 12, color: S.ink3, whiteSpace: "nowrap" }}>
                  출시 예정
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── 구독 탭 ── */}
        {tab === "subscription" && (
          <div style={{ paddingTop: 24 }}>

            {/* 무료 채팅 잔여 배너 */}
            {!status?.is_pro && chatRemaining !== null && (
              <div className="fu fu1" style={{ background: S.cream2, borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, color: S.ink3, marginBottom: 3 }}>오늘 무료 채팅</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: chatRemaining === 0 ? "#B91C1C" : S.ink }}>
                    {chatRemaining}회 남음
                    <span style={{ fontSize: 12, fontWeight: 400, color: S.ink3, marginLeft: 4 }}>/ {status?.chat_limit ?? 3}회</span>
                  </div>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: chatRemaining === 0 ? "#FEE2E2" : "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon icon={chatRemaining === 0 ? "mdi:chat-remove-outline" : "mdi:chat-outline"} width={24} color={chatRemaining === 0 ? "#B91C1C" : "#065F46"} />
                </div>
              </div>
            )}

            {/* 구독 중 상태 */}
            {status?.is_pro && (
              <div className="fu fu1" style={{ background: S.ink, borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <Icon icon="mdi:crown" width={24} color="#FEE500" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>구독 중입니다</div>
                  {status.pro_expires_at && (
                    <div style={{ fontSize: 11, color: S.beige, marginTop: 2 }}>
                      {new Date(status.pro_expires_at).toLocaleDateString("ko-KR")} 까지
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 플랜 카드 */}
            <div className="fu fu2" style={{ background: "#fff", borderRadius: 20, border: `2px solid ${S.ink}`, padding: "24px 20px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${S.gold}, ${S.goldLight})` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: S.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon icon="mdi:crown" width={20} color="#FEE500" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: S.ink3 }}>한양사주 PRO</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: S.ink, lineHeight: 1.2 }}>
                    4,900원<span style={{ fontSize: 13, fontWeight: 400, color: S.ink3 }}>/월</span>
                  </div>
                </div>
              </div>

              {/* 혜택 체크리스트 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {SUB_BENEFITS.map((b) => (
                  <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: S.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon icon="mdi:check" width={13} color="#fff" />
                    </div>
                    <span style={{ fontSize: 13, color: S.ink2, lineHeight: 1.4 }}>{b.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18, fontSize: 11, color: S.beige2, textAlign: "center" }}>
                언제든 해지 가능 · 다음 결제 전까지 혜택 유지
              </div>
            </div>

            {/* 비교 섹션 */}
            <div className="fu fu3" style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${S.border}`, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", background: S.cream2 }}>
                {(["기능", "무료", "PRO"] as const).map((h, i) => (
                  <div key={h} style={{ padding: "10px 8px", textAlign: "center", fontSize: 12, fontWeight: 700, background: i === 2 ? S.ink : "transparent", color: i === 2 ? "#fff" : S.ink3 }}>{h}</div>
                ))}
              </div>
              {[
                ["AI 채팅", "3회/일", "무제한"],
                ["분석권", "❌", "월 3회"],
                ["심화 분석", "❌", "포함"],
                ["신기능", "❌", "우선 제공"],
              ].map(([label, free, pro]) => (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", borderTop: `1px solid ${S.border}` }}>
                  <div style={{ padding: "11px 10px", fontSize: 12, color: S.ink3 }}>{label}</div>
                  <div style={{ padding: "11px 8px", fontSize: 12, color: S.ink3, textAlign: "center" }}>{free}</div>
                  <div style={{ padding: "11px 8px", fontSize: 12, color: S.ink, fontWeight: 700, textAlign: "center", background: "#F9F7F3" }}>{pro}</div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* 구독 탭 하단 CTA */}
      {tab === "subscription" && !status?.is_pro && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "center", padding: "12px 20px 28px", background: `linear-gradient(to top, ${S.cream} 65%, transparent)` }}>
          <button
            className="tap"
            onClick={() => router.push("/membership")}
            style={{ width: "100%", maxWidth: 420, padding: "15px 14px", borderRadius: 14, border: "none", background: "#FEE500", fontSize: 15, fontWeight: 700, color: "#191919", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Gmarket Sans', sans-serif" }}
          >
            <span style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", background: "#191919", color: "#FEE500", fontSize: 12, fontWeight: 900, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>K</span>
            구독 시작하기 · 월 4,900원
          </button>
        </div>
      )}
    </main>
  );
}
