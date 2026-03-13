"use client";

import { useRouter } from "next/navigation";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";

export default function SajuMyPage() {
  const router = useRouter();

  const handleChargeSeed = () => {
    alert("씨앗 충전 기능은 준비 중입니다.");
  };

  const handleChargeSunflower = () => {
    alert("해바라기 충전 기능은 준비 중입니다.");
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
            {/* 씨앗 캐시 */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.85)",
                border: "1.5px solid #adc4af",
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
            </div>

            {/* 해바라기 캐시 */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.85)",
                border: "1.5px solid #adc4af",
              }}
            >
              <Icon icon="fluent-emoji-flat:sunflower" width={18} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#345024",
                }}
              >
                0
              </span>
            </div>

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
                카카오 로그인 | test@email.com
              </p>
            </div>

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

            {/* 4. 나의 해바라기 카드 */}
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
                  <Icon icon="fluent-emoji-flat:sunflower" width={22} />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1a2e0e",
                    }}
                  >
                    나의 해바라기
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
                onClick={handleChargeSunflower}
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
                해바라기 충전하기
              </button>
            </div>

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

