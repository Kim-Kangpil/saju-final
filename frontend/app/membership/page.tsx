"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";

export default function MembershipPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();

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
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px 40px; }
        @media (max-width: 390px) { .wrap { padding: 0 16px 40px; } }
      `}</style>

      <div className="wrap">
        {/* 헤더 — saju-list / saju-mypage와 동일 */}
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
            <HamIcon style={{ width: 40, height: 40, objectFit: "contain" }} alt="햄스터" />
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#2d4a1e",
                letterSpacing: "0.04em",
              }}
            >
              한양사주
            </span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              <span style={{ fontSize: 12, fontWeight: 700, color: "#345024" }}>0</span>
            </button>
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
            <button
              type="button"
              className="tap"
              aria-label="메뉴 열기"
              onClick={() => router.push("/saju-mypage")}
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
              <Icon icon="mdi:menu" width={22} style={{ marginLeft: 14 }} />
            </button>
          </div>
        </header>

        {/* 멤버십 섹션 */}
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
            해바라기 멤버십
          </h1>

          {/* 큰 해바라기 이모지 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Icon
              icon="fluent-emoji-flat:sunflower"
              width={120}
              style={{ display: "block" }}
            />
          </div>

          <p
            style={{
              fontSize: 14,
              color: "#556b2f",
              lineHeight: 1.6,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            멤버십의 역할은 씨앗을 꾸준히 쓰게 만드는 것입니다.
          </p>

          <div
            style={{
              background: "#f8faf8",
              borderRadius: 14,
              border: "1.5px solid #e8f0e8",
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1a2e0e",
                marginBottom: 8,
              }}
            >
              월 3,900원
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#556b2f",
                marginBottom: 10,
              }}
            >
              혜택
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                fontSize: 14,
                color: "#374151",
                lineHeight: 1.8,
              }}
            >
              <li>매달 씨앗 10개 지급</li>
              <li>유료 분석 씨앗 1개 할인</li>
              <li>신규 분석 우선 공개</li>
            </ul>
          </div>

          <button
            type="button"
            className="tap sans"
            onClick={() => alert("맴버십 가입은 준비 중입니다.")}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 14,
              border: "1.5px solid #adc4af",
              background: "#c1d8c3",
              fontSize: 14,
              fontWeight: 700,
              color: "#1a2e0e",
              cursor: "pointer",
            }}
          >
            멤버십 가입하기
          </button>
        </section>
      </div>
    </main>
  );
}
