"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import InicisPayButton from "@/components/InicisPayButton";
import { ReportIntroHeader } from "@/components/ReportIntroHeader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

function DeepIntroContent() {
  const searchParams = useSearchParams();
  const sajuId = searchParams.get("saju_id") || "";
  const router = useRouter();
  const [sajuInfo, setSajuInfo] = useState<{ name?: string; birth_ymd?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!sajuId) return;
    fetch(`${API_BASE}/api/saju/${sajuId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.name || data?.birthdate) {
          const ymd = data.birthdate ? data.birthdate.replace(/-/g, "") : "";
          setSajuInfo({ name: data.name, birth_ymd: ymd });
        }
      })
      .catch(() => {});
  }, [sajuId]);

  useEffect(() => {
    const stored = localStorage.getItem("betaFeatures");
    if (stored) {
      try {
        const f = JSON.parse(stored);
        if (f?.is_admin === true) setIsAdmin(true);
      } catch {}
    }
    fetch(`${API_BASE}/api/beta/features`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const f = data?.features;
        if (f) {
          localStorage.setItem("betaFeatures", JSON.stringify(f));
          setIsAdmin(f.is_admin === true);
        }
      })
      .catch(() => {});
  }, []);

  const handleAdminViewReport = () => {
    if (!sajuId) {
      alert("사주 정보를 찾을 수 없습니다.");
      return;
    }
    router.push(`/report/deep?saju_id=${sajuId}`);
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "12px 20px 24px",
        fontFamily: "var(--font-sans)",
        background: "#F5F1EA",
        minHeight: "100vh",
      }}
    >
      <ReportIntroHeader title="심화 리포트" />
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔮</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#3D3530", marginBottom: 8 }}>
          심화 종합 분석 리포트
        </h1>
        <p style={{ fontSize: 14, color: "#8B7355" }}>성향·고민·재물·일·관계까지 한 번에</p>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#3D3530", marginBottom: 12 }}>
          이런 분께 추천해요
        </h2>
        {[
          "한 줄 요약이 아니라 전체 그림을 보고 싶은 분",
          "지금 시기와 앞으로의 방향을 같이 보고 싶은 분",
          "재물·일·관계를 나눠서 깊게 읽고 싶은 분",
        ].map((text, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14, color: "#3D3530" }}>
            <span>✓</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#3D3530", marginBottom: 12 }}>
          리포트에 담긴 것
        </h2>
        {[
          "🔮 한 줄 핵심 진단",
          "🧠 타고난 성향과 사고방식",
          "💪 이 사람의 진짜 무기",
          "🔁 반복되는 문제 패턴",
          "💰 돈 흐름 구조",
          "🧭 일과 진로 방향",
          "❤️ 관계와 연애 성향",
          "⏰ 지금 이 시기",
          "✅ 지금 당장 해야 할 것",
        ].map((text, i) => (
          <div
            key={i}
            style={{
              fontSize: 14,
              color: "#3D3530",
              marginBottom: 8,
              paddingBottom: 8,
              borderBottom: i < 8 ? "1px solid #F5F1EA" : "none",
            }}
          >
            {text}
          </div>
        ))}
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#3D3530", marginBottom: 12 }}>미리보기</h2>
        <div style={{ filter: "blur(6px)", fontSize: 13, color: "#3D3530", lineHeight: 1.8 }}>
          지금 이 시기는 겉으로 드러나는 성과보다, 내면의 균형을 맞추는 것이 앞으로의 흐름을
          좌우합니다. 반복되는 패턴의 끈을 끊으려면 작은 습관 하나부터 바꾸는 것이 가장
          빠른 길입니다...
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: "linear-gradient(transparent, white)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 12,
          }}
        >
          <span style={{ fontSize: 13, color: "#8B7355" }}>구매 후 전체 내용 확인</span>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#6B5F4E", marginBottom: 12, fontWeight: 600 }}>
          {sajuInfo?.name && sajuInfo?.birth_ymd
            ? `${sajuInfo.name}님 (${sajuInfo.birth_ymd.slice(0, 4)}.${sajuInfo.birth_ymd.slice(4, 6)}.${sajuInfo.birth_ymd.slice(6, 8)}) 맞춤 리포트`
            : "맞춤 리포트"}
        </p>
        <p style={{ fontSize: 11, color: "#A8946A", marginBottom: 10, fontWeight: 600 }}>
          전체 그림을 보면 지금 해야 할 것이 보여요
        </p>
        <div style={{marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
          <span style={{fontSize: 16, color: '#C4B5A0', textDecoration: 'line-through'}}>
            9,900원
          </span>
          <span style={{fontSize: 26, fontWeight: 700, color: '#3D3530'}}>
            4,900원
          </span>
          <span style={{fontSize: 12, fontWeight: 700, color: '#fff', background: '#DC2626', padding: '3px 8px', borderRadius: 6}}>
            51%
          </span>
        </div>
        <InicisPayButton
          orderType="deep"
          price={4900}
          label="심화 리포트 확인하기"
          sajuId={sajuId}
          onBeforePay={() => {
            if (typeof window !== "undefined" && sajuId) {
              localStorage.setItem("deep_report_saju_id", sajuId);
            }
          }}
        />
        {isAdmin && (
          <button
            type="button"
            onClick={handleAdminViewReport}
            style={{
              marginTop: 12,
              padding: "12px 24px",
              borderRadius: 10,
              border: "2px solid #dc2626",
              background: "#fee2e2",
              color: "#991b1b",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              margin: "12px auto 0",
            }}
          >
            <span>👑</span>
            관리자: 바로 보기
          </button>
        )}
        <p style={{ fontSize: 10, color: "#C4B5A0", marginTop: 6 }}>
          구매 후 7일간 열람 가능 · 열람한 리포트는 영구 소장
        </p>
      </div>
    </div>
  );
}

export default function DeepIntroPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, textAlign: "center", fontFamily: "var(--font-sans)" }}>로딩 중...</div>}>
      <DeepIntroContent />
    </Suspense>
  );
}
