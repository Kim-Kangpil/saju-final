"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function DevLoginPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 클라이언트에서만 동작 보장
    setReady(true);
  }, []);

  const handleDevLogin = () => {
    if (typeof window === "undefined") return;
    // 실제 카카오 로그인 대신, 로컬 테스트용 로그인 플래그 세팅
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loginType", "dev");
    // 로그인 후 보여줄 화면으로 이동 (사주목록)
    router.push("/saju-list");
  };

  if (!ready) {
    return null;
  }

  return (
    <main
      style={{
        background: "#eef4ee",
        minHeight: "100vh",
        fontFamily: "'Gowun Dodum', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
      }}
    >
      <section
        className="sans"
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#ffffff",
          borderRadius: 20,
          border: "1.5px solid #c8dac8",
          padding: "20px 18px 22px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1a2e0e",
            marginBottom: 10,
          }}
        >
          로컬 테스트용 로그인
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#556b2f",
            marginBottom: 18,
          }}
        >
          카카오 연동 없이도,
          <br />
          로그인 이후 화면과 사주목록 레이아웃을
          <br />
          로컬 환경에서 바로 확인할 수 있는 임시 페이지입니다.
        </p>
        <button
          type="button"
          onClick={handleDevLogin}
          className="tap sans"
          style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: 999,
            border: "1.5px solid #8fb28f",
            background: "#f4faf4",
            fontSize: 14,
            fontWeight: 700,
            color: "#345024",
          }}
        >
          테스트용 로그인 후 사주목록으로 이동
        </button>
      </section>
    </main>
  );
}

