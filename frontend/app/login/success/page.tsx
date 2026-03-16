"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

export default function LoginSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 해시(#t=...)는 백엔드에서 토큰을 넣어주지만, 현재는 쿠키 기반으로만 사용하므로 별도 처리 없이 무시
    async function proceed() {
      try {
        const res = await fetch(`${API_BASE}/api/saju/list`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        if (res.status === 401) {
          // 세션이 없다면 다시 시작 페이지로
          router.replace("/start");
          return;
        }
        const data = await res.json().catch(() => []);
        const list = Array.isArray(data) ? data : [];

        if (list.length > 0) {
          router.replace("/saju-list");
        } else {
          router.replace("/saju-add");
        }
      } catch {
        // 문제가 생기면 일단 홈으로 돌려보내고, 유저가 다시 진입하게
        router.replace("/home");
      }
    }

    proceed();
  }, [router, searchParams]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        backgroundColor: "var(--bg-base)",
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      <p
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
        }}
      >
        로그인 정보를 확인하고 있어요...
      </p>
    </main>
  );
}

