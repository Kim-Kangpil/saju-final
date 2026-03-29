"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAuthHeaders, clearStoredToken } from "@/lib/auth";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const textDark = "var(--text-primary)";
const borderField = "#B4A292";

type UserInfo = {
  provider: string | null;
  email: string | null;
  nickname: string | null;
} | null;

type MenuItem =
  | { key: string; icon: string; label: string; desc: string; color: string; path: string }
  | { key: string; icon: string; label: string; desc: string; color: string; action: string };

const MENU_ITEMS: MenuItem[] = [
  { key: "saju-list", icon: "mdi:format-list-bulleted", label: "내 사주 목록", desc: "저장한 사주 보기", color: "var(--text-secondary)", path: "/saju-list" },
  {
    key: "purchased-reports",
    icon: "mdi:file-document-outline",
    label: "구매한 리포트",
    desc: "결제한 리포트 다시 보기",
    color: "var(--text-secondary)",
    path: "/my-purchased-reports",
  },
  {
    key: "ai-chat",
    icon: "mdi:chat-processing-outline",
    label: "AI 사주 상담",
    desc: "한양사주 AI와 대화하기",
    color: "#4A6741",
    path: "/chat",
  },
  { key: "membership", icon: "mdi:crown", label: "한양사주 Pro", desc: "매달 분석권 + 전용 혜택", color: "#c9a227", path: "/membership" },
  { key: "usage", icon: "mdi:receipt-text-outline", label: "사용 내역", desc: "분석권 사용 기록", color: "var(--text-secondary)", action: "usage" },
  { key: "contact", icon: "mdi:message-outline", label: "문의하기", desc: "궁금한 점이 있으신가요?", color: "var(--text-secondary)", path: "/contact" },
];

export default function SajuMyPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const { isLoggedIn, loading } = useAuthStatus();
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [userInfoLoading, setUserInfoLoading] = useState(true);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [betaFeatures, setBetaFeatures] = useState<any>(null);

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      router.replace("/start");
    }
  }, [isLoggedIn, loading, router]);

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
    if (typeof window === "undefined" || !isLoggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/saju/list`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        if (!cancelled && res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            // syncSavedSajuListWithServer(list);
            // setSajuBadgeTick((t) => t + 1);
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchBetaFeatures = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/beta/features`, {
          credentials: "include",
          headers: { Accept: "application/json", ...getAuthHeaders() },
        });
        const data = await res.json();
        if (data.features) {
          setBetaFeatures(data.features);
          localStorage.setItem('betaFeatures', JSON.stringify(data.features));
        }
      } catch (error) {
        console.error("베타 혜택 확인 오류:", error);
      }
    };
    fetchBetaFeatures();
  }, [isLoggedIn]);

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

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("쿠폰 코드를 입력해주세요.");
      return;
    }

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/beta/apply-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ coupon_code: couponCode.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setBetaFeatures(data.features);
        // localStorage에 저장 (report/basic/intro 페이지에서 확인용)
        localStorage.setItem('betaFeatures', JSON.stringify(data.features));
        setCouponMessage(data.features?.is_admin
          ? "👑 관리자 모드가 활성화되었습니다! 모든 기능을 바로 이용할 수 있습니다."
          : "🎉 쿠폰이 적용되었습니다! 채팅과 기본 리포트를 무료로 이용할 수 있습니다.");
        setCouponCode("");
      } else {
        setCouponMessage(data.detail || "쿠폰 적용에 실패했습니다.");
      }
    } catch (error) {
      setCouponMessage("쿠폰 적용 중 오류가 발생했습니다.");
    } finally {
      setCouponLoading(false);
    }
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
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "var(--bg-base)",
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .tap { transition: transform .15s ease, opacity .15s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .tap:active { transform: scale(.97); opacity: .9; }
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px 48px; }
        @media (max-width: 390px) { .wrap { padding: 0 16px 48px; } }
        .modal-overlay { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-box { width: 100%; max-width: 320px; background: var(--bg-surface); border-radius: 18px; padding: 24px 20px 20px; font-family: var(--font-sans); box-shadow: 0 8px 32px rgba(0,0,0,0.18); border: 1px solid var(--border-default); }
      `}</style>

      {showWithdrawConfirm && (
        <div className="modal-overlay" onClick={() => setShowWithdrawConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, color: textDark, marginBottom: 8 }}>정말 탈퇴하시겠어요?</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>탈퇴 시 모든 사주 데이터와 분석권이 삭제되며 복구가 어렵습니다.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="tap" onClick={() => setShowWithdrawConfirm(false)} style={{ flex: 1, padding: "10px", borderRadius: 12, border: `1.5px solid ${borderField}`, background: "var(--bg-input)", fontSize: 14, fontWeight: 700, color: textDark, cursor: "pointer" }}>취소</button>
              <button type="button" className="tap" onClick={handleWithdraw} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: "#ef4444", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" }}>탈퇴하기</button>
            </div>
          </div>
        </div>
      )}

      <div className="wrap">
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 24px" }}>
          <button type="button" className="tap" onClick={() => router.push("/home")} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, background: "transparent", border: "none", padding: 0, cursor: "pointer", color: textDark }}>
            <Icon icon="mdi:chevron-left" width={28} />
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: textDark, flex: 1, textAlign: "center" }}>마이페이지</h1>
          <button type="button" className="tap" aria-label="메뉴" style={{ width: 40, height: 40, background: "transparent", border: "none", padding: 0, cursor: "pointer", color: textDark, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon icon="mdi:menu" width={24} />
          </button>
        </header>

        <section style={{ margin: "0 -20px", background: "var(--bg-surface)", padding: "20px 24px 18px", borderRadius: 12, border: "1.5px solid var(--border-default)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${borderField}`, flexShrink: 0 }}>
              {providerLabel === "카카오" ? <Icon icon="simple-icons:kakao" width={22} style={{ color: "#3C1E1E" }} /> : providerLabel === "구글" ? <Icon icon="simple-icons:google" width={20} style={{ color: "#4285F4" }} /> : <Icon icon="mdi:account-outline" width={24} style={{ color: textDark }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {userInfoLoading ? <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>불러오는 중...</div> : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: textDark, marginBottom: 2 }}>{providerLabel ? `${providerLabel} 로그인` : "로그인됨"}</div>
                  {account && <div style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{account}</div>}
                </>
              )}
            </div>
          </div>
        </section>

        {/* 베타 쿠폰 섹션 */}
        {(!betaFeatures || !betaFeatures.is_admin) && (
          <section style={{ margin: "20px -20px 0", background: "var(--bg-surface)", padding: "20px", borderRadius: 12, border: "1.5px solid var(--border-default)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: textDark, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              {betaFeatures ? "👑 관리자 전환 코드" : "🎉 베타 테스터 쿠폰"}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
              {betaFeatures
                ? "관리자 코드를 입력하면 관리자 모드로 전환됩니다."
                : "쿠폰을 입력하면 채팅과 기본 리포트를 무료로 이용할 수 있어요!"}
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                placeholder={betaFeatures ? "관리자 코드 입력" : "쿠폰 코드 입력"}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCouponApply()}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: `1.5px solid ${borderField}`,
                  borderRadius: 8,
                  fontSize: 14,
                  background: "var(--bg-input)",
                  color: textDark,
                }}
              />
              <button
                type="button"
                onClick={handleCouponApply}
                disabled={couponLoading}
                className="tap"
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: couponLoading ? "var(--text-placeholder)" : "#4A6741",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  cursor: couponLoading ? "not-allowed" : "pointer",
                  minWidth: 80,
                }}
              >
                {couponLoading ? "처리중..." : "적용"}
              </button>
            </div>
            {couponMessage && (
              <div style={{
                fontSize: 13,
                color: couponMessage.includes("🎉") ? "#4A6741" : "#ef4444",
                padding: "8px 12px",
                background: couponMessage.includes("🎉") ? "#f0f9f0" : "#fef2f2",
                borderRadius: 6,
                border: `1px solid ${couponMessage.includes("🎉") ? "#4A6741" : "#ef4444"}`,
              }}>
                {couponMessage}
              </div>
            )}
          </section>
        )}

        {/* 베타 혜택 표시 */}
        {betaFeatures && (
          <section style={{ margin: "20px -20px 0", background: betaFeatures.is_admin ? "#fef3c7" : "#f0f9f0", padding: "20px", borderRadius: 12, border: betaFeatures.is_admin ? "1.5px solid #f59e0b" : "1.5px solid #4A6741" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: betaFeatures.is_admin ? "#d97706" : "#4A6741", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              {betaFeatures.is_admin ? "👑 관리자 모드" : "🎉 베타 테스터 혜택"}
            </div>
            <div style={{ fontSize: 13, color: betaFeatures.is_admin ? "#d97706" : "#4A6741", lineHeight: 1.6 }}>
              {betaFeatures.is_admin ? (
                <>
                  <div style={{ marginBottom: 8 }}>👑 모든 기능 무료 이용</div>
                  <div style={{ marginBottom: 8 }}>✅ AI 채팅 무제한</div>
                  <div style={{ marginBottom: 8 }}>✅ 모든 리포트 무료</div>
                  <div style={{ marginBottom: 8 }}>✅ 결제 없이 바로 이용</div>
                  <div>🔥 관리자 권한이 활성화되었습니다.</div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 8 }}>✅ AI 채팅 무제한 이용</div>
                  <div style={{ marginBottom: 8 }}>✅ 기본 리포트 무제한 열람</div>
                  <div style={{ marginBottom: 8 }}>✅ 특화/심화 리포트 정상가 이용</div>
                  <div>📱 채팅과 기본 리포트를 무제한으로 이용하세요!</div>
                </>
              )}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => router.push("/chat")}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: betaFeatures.is_admin ? "1px solid #d97706" : "1px solid #4A6741",
                  background: "white",
                  color: betaFeatures.is_admin ? "#d97706" : "#4A6741",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {betaFeatures.is_admin ? "AI 채팅 바로가기" : "베타 AI 채팅"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/saju-list")}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: betaFeatures.is_admin ? "#d97706" : "#4A6741",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: betaFeatures.is_admin ? "0 6px 16px rgba(217, 119, 6, 0.22)" : "0 6px 16px rgba(74, 103, 65, 0.18)",
                }}
              >
                {betaFeatures.is_admin ? "기본 리포트 바로가기" : "기본 리포트 열기"}
              </button>
            </div>
            
            {/* 베타 테스터 관리 기능 */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #4A6741" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#4A6741", marginBottom: 8 }}>
                🔧 테스터 관리
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("베타 테스터 혜택을 초기화하시겠습니까?\n쿠폰을 다시 입력해야 혜택을 받을 수 있습니다.")) {
                      try {
                        const res = await fetch(`${API_BASE}/api/beta/reset`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            ...getAuthHeaders(),
                          },
                          credentials: "include",
                        });
                        
                        const data = await res.json();
                        
                        if (res.ok && data.success) {
                          setBetaFeatures(null);
                          localStorage.removeItem('betaFeatures');
                          setCouponMessage("🔄 베타 혜택이 초기화되었습니다.");
                        } else {
                          setCouponMessage(data.message || "초기화에 실패했습니다.");
                        }
                      } catch (error) {
                        setCouponMessage("초기화 중 오류가 발생했습니다.");
                      }
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #4A6741",
                    background: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#4A6741",
                    cursor: "pointer",
                  }}
                >
                  혜택 초기화
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("테스트 기간 종료 기능은 준비 중입니다.\n관리자가 자동으로 권한을 해제해 드립니다.");
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #dc2626",
                    background: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#dc2626",
                    cursor: "pointer",
                  }}
                >
                  권한 해제 요청
                </button>
              </div>
              <div style={{ fontSize: 11, color: "#4A6741", lineHeight: 1.4 }}>
                💡 팁: 혜택 초기화 시 쿠폰을 다시 입력해야 합니다.
              </div>
            </div>
          </section>
        )}

        <section style={{ padding: "20px 0 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className="tap"
                onClick={() => { if ("action" in item && item.action === "usage") alert("준비 중입니다."); else if ("path" in item && item.path) router.push(item.path); }}
                style={{ width: "100%", background: "var(--bg-surface)", borderRadius: 12, border: "1.5px solid var(--border-default)", padding: "14px 16px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon icon={item.icon} width={20} style={{ color: item.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: textDark }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>{item.desc}</div>
                  </div>
                </div>
                <Icon icon="mdi:chevron-right" width={20} style={{ color: "var(--text-placeholder)", flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </section>

        <section style={{ padding: "20px 0 0" }}>
          <button type="button" className="tap" onClick={handleLogout} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${borderField}`, background: "var(--bg-surface)", fontSize: 14, fontWeight: 700, color: textDark, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Icon icon="mdi:logout" width={18} style={{ color: "var(--text-secondary)" }} />
            로그아웃
          </button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button type="button" onClick={() => setShowWithdrawConfirm(true)} style={{ padding: "4px 8px", border: "none", background: "transparent", fontSize: 12, color: "var(--text-placeholder)", cursor: "pointer" }}>회원탈퇴</button>
          </div>
        </section>
      </div>
    </main>
  );
}
