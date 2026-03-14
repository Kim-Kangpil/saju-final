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

export default function SajuMyPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [userInfoLoading, setUserInfoLoading] = useState(true);

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

  const handleChargeSeed = () => {
    router.push("/seed-charge");
  };

  const handleUsage = () => {
    alert("준비 중입니다.");
  };

  const handleContact = () => {
    router.push("/contact");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loginType");
      localStorage.removeItem("loginTime");
      clearStoredToken();
    }
    alert("로그아웃 되었습니다.");
    router.push("/start");
  };

  const handleWithdraw = () => {
    if (confirm("정말 탈퇴하시겠습니까?")) {
      alert("회원탈퇴 처리가 완료되었다고 가정합니다. (실제 로직 연동 예정)");
    }
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
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sans  { font-family: 'Gowun Dodum', sans-serif; }
        .tap {
          transition: transform .15s ease, opacity .15s ease, box-shadow .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; box-shadow: 0 4px 10px rgba(0,0,0,.12); }
        .wrap {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }
        @media (max-width: 390px) {
          .wrap { padding: 0 16px 40px; }
        }
      `}</style>

      <div className="wrap">
        {/* 헤더 – saju-list와 동일 */}
        <header
          className="sans"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            margin: "0 -20px 16px",
            background: "#c1d8c3",
            borderBottom: "3px solid #adc4af",
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
            <HamIcon
              style={{ width: 28, height: 28, objectFit: "contain" }}
              alt="햄스터"
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#2d4a1e",
                letterSpacing: "0.04em",
              }}
            >
              한양사주
            </span>
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* 씨앗 캐시 (클릭 시 씨앗 충전 페이지) */}
            <button
              type="button"
              onClick={() => router.push("/seed-charge")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.85)",
                border: "1.5px solid #adc4af",
                cursor: "pointer",
              }}
            >
              <Icon icon="mdi:seed-outline" width={18} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#345024",
                }}
              >
                0
              </span>
            </button>

            {/* 해바라기 멤버십 (클릭 시 멤버십 페이지) */}
            <button
              type="button"
              onClick={() => router.push("/membership")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.85)",
                border: "1.5px solid #adc4af",
                cursor: "pointer",
              }}
            >
              <Icon icon="fluent-emoji-flat:sunflower" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>멤버십</span>
            </button>

            {/* 햄버거 메뉴 아이콘 */}
            <button
              type="button"
              className="tap"
              aria-label="메뉴 열기"
              style={{
                padding: 8,
                borderRadius: 10,
                border: "none",
                background: "transparent",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon="mdi:menu" width={22} />
            </button>
          </div>
        </header>

        {/* 마이페이지 섹션 */}
        <section
          className="sans"
          style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: 0,
            border: "1.5px solid #c8dac8",
            padding: "20px 20px 24px",
            margin: "0 -20px 0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
          }}
        >
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1a2e0e",
              marginBottom: 14,
            }}
          >
            마이페이지
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* 2. 로그인 정보 카드 */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 14,
                border: "1.5px solid #c8dac8",
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1a2e0e",
                  marginBottom: 6,
                }}
              >
                로그인 정보
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.7,
                }}
              >
                {userInfoLoading
                  ? "로그인 정보를 불러오는 중..."
                  : userInfo
                    ? (() => {
                        const providerLabel =
                          userInfo.provider === "google"
                            ? "구글 로그인"
                            : userInfo.provider === "kakao"
                              ? "카카오 로그인"
                              : userInfo.provider
                                ? `${userInfo.provider} 로그인`
                                : "로그인";
                        const account =
                          userInfo.email || userInfo.nickname || "(연결된 계정 정보 없음)";
                        return `${providerLabel} | ${account}`;
                      })()
                    : (() => {
                        try {
                          const loginType = typeof window !== "undefined" ? localStorage.getItem("loginType") : null;
                          const providerLabel =
                            loginType === "google"
                              ? "구글 로그인"
                              : loginType === "kakao"
                                ? "카카오 로그인"
                                : loginType
                                  ? `${loginType} 로그인`
                                  : null;
                          if (providerLabel)
                            return `${providerLabel} | 로그인됨 (이 기기에서는 이메일이 표시되지 않을 수 있습니다. 저장·목록 기능은 정상 이용 가능합니다.)`;
                        } catch (_) {}
                        return "로그인 정보를 불러올 수 없습니다. 새로고침하거나 다시 로그인해 보세요.";
                      })()}
              </p>
            </div>

            {/* 내 사주 목록 카드 */}
            <button
              type="button"
              onClick={() => router.push("/saju-list")}
              className="tap"
              style={{
                width: "100%",
                background: "#ffffff",
                borderRadius: 14,
                border: "1.5px solid #c8dac8",
                padding: 16,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon icon="mdi:format-list-bulleted" width={22} style={{ color: "#345024" }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2e0e" }}>
                      내 사주 목록
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      저장한 사주 보기
                    </div>
                  </div>
                </div>
                <Icon icon="mdi:chevron-right" width={24} style={{ color: "#9ca3af" }} />
              </div>
            </button>

            {/* 3. 나의 씨앗 카드 */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 14,
                border: "1.5px solid #c8dac8",
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Icon icon="mdi:seed-outline" width={22} />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1a2e0e",
                    }}
                  >
                    나의 씨앗
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#345024",
                  }}
                >
                  0
                </span>
              </div>
              <button
                type="button"
                onClick={handleChargeSeed}
                className="tap sans"
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: 14,
                  border: "1.5px solid #adc4af",
                  background: "#c1d8c3",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1a2e0e",
                }}
              >
                씨앗 충전하기
              </button>
            </div>

            {/* 4. 해바라기 멤버십 카드 */}
            <button
              type="button"
              onClick={() => router.push("/membership")}
              className="tap"
              style={{
                width: "100%",
                background: "#ffffff",
                borderRadius: 14,
                border: "1.5px solid #c8dac8",
                padding: 16,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Icon icon="fluent-emoji-flat:sunflower" width={22} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1a2e0e" }}>
                    해바라기 멤버십
                  </span>
                </div>
              </div>
              <div
                className="sans"
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: 14,
                  border: "1.5px solid #adc4af",
                  background: "#c1d8c3",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1a2e0e",
                  textAlign: "center",
                }}
              >
                멤버십 알아보기
              </div>
            </button>

            {/* 5. 사용내역 버튼 */}
            <button
              type="button"
              onClick={handleUsage}
              className="tap sans"
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 14,
                border: "1.5px solid #adc4af",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
                color: "#1a2e0e",
              }}
            >
              사용내역
            </button>

            {/* 6. 문의하기 버튼 */}
            <button
              type="button"
              onClick={handleContact}
              className="tap sans"
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 14,
                border: "1.5px solid #adc4af",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
                color: "#1a2e0e",
              }}
            >
              문의하기
            </button>

            {/* 7. 로그아웃 버튼 */}
            <button
              type="button"
              onClick={handleLogout}
              className="tap sans"
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 14,
                border: "1.5px solid #adc4af",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
                color: "#1a2e0e",
              }}
            >
              로그아웃
            </button>

            {/* 8. 회원탈퇴 버튼 */}
            <button
              type="button"
              onClick={handleWithdraw}
              className="sans"
              style={{
                marginTop: 4,
                padding: 6,
                border: "none",
                background: "transparent",
                fontSize: 12,
                fontWeight: 500,
                color: "#999999",
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

