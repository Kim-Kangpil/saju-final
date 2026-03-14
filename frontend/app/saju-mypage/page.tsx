"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";
import { getAuthHeaders, clearStoredToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

type UserInfo = {
  provider: string | null;
  email: string | null;
  nickname: string | null;
} | null;

type MenuItem =
  | { key: string; icon: string; label: string; desc: string; color: string; path: string }
  | { key: string; icon: string; label: string; desc: string; color: string; action: string };

const MENU_ITEMS: MenuItem[] = [
  {
    key: "saju-list",
    icon: "mdi:format-list-bulleted",
    label: "내 사주 목록",
    desc: "저장한 사주 보기",
    color: "#6a994e",
    path: "/saju-list",
  },
  {
    key: "seed-charge",
    icon: "mdi:seed-outline",
    label: "씨앗 충전",
    desc: "분석에 사용하는 씨앗",
    color: "#6a994e",
    path: "/seed-charge",
  },
  {
    key: "membership",
    icon: "fluent-emoji-flat:sunflower",
    label: "해바라기 멤버십",
    desc: "매달 씨앗 + 전용 혜택",
    color: "#c9a227",
    path: "/membership",
  },
  {
    key: "usage",
    icon: "mdi:receipt-text-outline",
    label: "사용 내역",
    desc: "씨앗 사용 기록",
    color: "#6b7280",
    action: "usage",
  },
  {
    key: "contact",
    icon: "mdi:message-outline",
    label: "문의하기",
    desc: "궁금한 점이 있으신가요?",
    color: "#6b7280",
    path: "/contact",
  },
];

export default function SajuMyPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [userInfoLoading, setUserInfoLoading] = useState(true);
  const [seedCount, setSeedCount] = useState<number>(0);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadUserInfo = async (retryCount = 0): Promise<void> => {
      const maxRetries = 2;
      try {
        const res = await fetch(`${API_BASE}/api/me`, {
          credentials: "include",
          headers: { Accept: "application/json", ...getAuthHeaders() },
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.ok) {
          setUserInfo({
            provider: data.provider ?? null,
            email: data.email ?? null,
            nickname: data.nickname ?? null,
          });
          if (!cancelled) setUserInfoLoading(false);
          return;
        }
        if (retryCount < maxRetries) {
          await new Promise((r) => setTimeout(r, 400));
          if (!cancelled) loadUserInfo(retryCount + 1);
          return;
        }
        setUserInfo(null);
        if (!cancelled) setUserInfoLoading(false);
      } catch {
        if (retryCount < maxRetries) {
          await new Promise((r) => setTimeout(r, 400));
          if (!cancelled) loadUserInfo(retryCount + 1);
          return;
        }
        if (!cancelled) {
          setUserInfo(null);
          setUserInfoLoading(false);
        }
      }
    };
    loadUserInfo();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/seeds`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && typeof data?.seeds === "number") setSeedCount(data.seeds);
      } catch {
        if (!cancelled) setSeedCount(0);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loginType");
      localStorage.removeItem("loginTime");
      clearStoredToken();
    }
    router.push("/start");
  };

  const handleWithdraw = () => {
    // 실제 탈퇴 로직 연동 예정
    setShowWithdrawConfirm(false);
    alert("회원탈퇴 처리가 완료되었습니다. (실제 로직 연동 예정)");
  };

  const getProviderLabel = () => {
    if (userInfoLoading) return null;
    const provider = userInfo?.provider
      ?? (typeof window !== "undefined" ? localStorage.getItem("loginType") : null);
    if (!provider) return null;
    return provider === "google" ? "구글" : provider === "kakao" ? "카카오" : provider;
  };

  const getAccount = () => {
    if (!userInfo) return null;
    return userInfo.email || userInfo.nickname || null;
  };

  const providerLabel = getProviderLabel();
  const account = getAccount();

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
        .sans { font-family: 'Gowun Dodum', sans-serif; }
        .tap {
          transition: transform .15s ease, opacity .15s ease, box-shadow .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; box-shadow: 0 4px 10px rgba(0,0,0,.12); }
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px 48px; }
        @media (max-width: 390px) { .wrap { padding: 0 16px 48px; } }

        /* 탈퇴 확인 모달 오버레이 */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(0,0,0,0.35);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .modal-box {
          width: 100%; max-width: 320px;
          background: #fff;
          border-radius: 18px;
          padding: 24px 20px 20px;
          font-family: 'Gowun Dodum', sans-serif;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        }
      `}</style>

      {/* ── 탈퇴 확인 모달 ── */}
      {showWithdrawConfirm && (
        <div className="modal-overlay" onClick={() => setShowWithdrawConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a2e0e", marginBottom: 8 }}>
              정말 탈퇴하시겠어요?
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 20 }}>
              탈퇴 시 모든 사주 데이터와 씨앗이 삭제되며 복구가 어렵습니다.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="tap sans"
                onClick={() => setShowWithdrawConfirm(false)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 12,
                  border: "1.5px solid #e0ece0", background: "#f8faf8",
                  fontSize: 14, fontWeight: 700, color: "#374151", cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                type="button"
                className="tap sans"
                onClick={handleWithdraw}
                style={{
                  flex: 1, padding: "10px", borderRadius: 12,
                  border: "none", background: "#ef4444",
                  fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer",
                }}
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="wrap">
        {/* ── 헤더 ── */}
        <header
          className="sans"
          style={{
            position: "relative", zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", margin: "0 -20px 0",
            background: "#c1d8c3", borderBottom: "3px solid #adc4af",
          }}
        >
          <button
            onClick={() => router.push("/home")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
            }}
          >
            <HamIcon style={{ width: 40, height: 40, objectFit: "contain" }} alt="햄스터" />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#2d4a1e", letterSpacing: "0.04em" }}>
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
                background: "rgba(255,255,255,0.85)", border: "1.5px solid #adc4af", cursor: "pointer",
              }}
            >
              <Icon icon="mdi:seed-outline" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>{seedCount}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/membership")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "6px 10px", borderRadius: 999,
                background: "rgba(255,255,255,0.85)", border: "1.5px solid #adc4af", cursor: "pointer",
              }}
            >
              <Icon icon="fluent-emoji-flat:sunflower" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>멤버십</span>
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

        {/* ── 프로필 카드 ── */}
        <section
          className="sans"
          style={{
            margin: "0 -20px",
            background: "linear-gradient(160deg, #fffde7 0%, #e8f5e9 100%)",
            padding: "20px 24px 18px",
            borderBottom: "1.5px solid #c8dac8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* 아바타 */}
            <div
              style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "linear-gradient(135deg, #c1d8c3, #a8c5aa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #adc4af", flexShrink: 0,
              }}
            >
              {providerLabel === "카카오" ? (
                <Icon icon="simple-icons:kakao" width={22} style={{ color: "#3C1E1E" }} />
              ) : providerLabel === "구글" ? (
                <Icon icon="simple-icons:google" width={20} style={{ color: "#4285F4" }} />
              ) : (
                <Icon icon="mdi:account-outline" width={24} style={{ color: "#345024" }} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {userInfoLoading ? (
                <div style={{ fontSize: 13, color: "#9ca3af" }}>불러오는 중...</div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e0e", marginBottom: 2 }}>
                    {providerLabel ? `${providerLabel} 로그인` : "로그인됨"}
                  </div>
                  {account && (
                    <div
                      style={{
                        fontSize: 12, color: "#6b7280",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}
                    >
                      {account}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 씨앗 현황 */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.8)", border: "1.5px solid #adc4af",
                borderRadius: 99, padding: "5px 10px", flexShrink: 0,
              }}
            >
              <Icon icon="mdi:seed-outline" width={15} style={{ color: "#6a994e" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#345024" }}>{seedCount}개</span>
            </div>
          </div>
        </section>

        {/* ── 메뉴 목록 ── */}
        <section className="sans" style={{ padding: "20px 0 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className="tap sans"
                onClick={() => {
                  if ("action" in item && item.action === "usage") {
                    alert("준비 중입니다.");
                  } else if ("path" in item && item.path) {
                    router.push(item.path);
                  }
                }}
                style={{
                  width: "100%", background: "#fff",
                  borderRadius: 14, border: "1.5px solid #e0ece0",
                  padding: "14px 16px", textAlign: "left", cursor: "pointer",
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "#f0f7f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon icon={item.icon} width={20} style={{ color: item.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e0e" }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>{item.desc}</div>
                  </div>
                </div>
                <Icon icon="mdi:chevron-right" width={20} style={{ color: "#d1d5db", flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </section>

        {/* ── 로그아웃 / 회원탈퇴 ── */}
        <section className="sans" style={{ padding: "20px 0 0" }}>
          <button
            type="button"
            className="tap sans"
            onClick={handleLogout}
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 14,
              border: "1.5px solid #e0ece0", background: "#fff",
              fontSize: 14, fontWeight: 700, color: "#374151",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6,
            }}
          >
            <Icon icon="mdi:logout" width={18} style={{ color: "#6b7280" }} />
            로그아웃
          </button>

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button
              type="button"
              className="sans"
              onClick={() => setShowWithdrawConfirm(true)}
              style={{
                padding: "4px 8px", border: "none", background: "transparent",
                fontSize: 12, color: "#c0c0c0", cursor: "pointer",
              }}
            >
              회원탈퇴
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
