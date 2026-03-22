"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAuthHeaders,
  SAJU_CACHE_HYDRATED_KEY,
  setStoredToken,
} from "@/lib/auth";
import { hydrateLocalSajuCacheFromServerRows } from "@/lib/sajuStorage";
import type { ServerSajuRow } from "@/lib/sajuStorage";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

export default function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // 1) 해시(#t=TOKEN)에서 세션 토큰 추출 → 저장
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const m = hash.match(/t=([^&]+)/);
      if (m && m[1]) {
        try {
          const token = decodeURIComponent(m[1]);
          if (token) {
            setStoredToken(token);
          }
        } catch {
          // 토큰 파싱 실패 시에는 무시하고, 쿠키만으로 시도
        }
      }
      // URL 깔끔하게 정리
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

    // 2) 토큰/쿠키로 실제 로그인 상태 확인
    async function proceed() {
      try {
        const res = await fetch(`${API_BASE}/api/saju/list`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        if (res.status === 401) {
          // 토큰/쿠키 모두 유효하지 않으면, 로그인 실패로 간주하고 시작 화면으로 돌려보냄
          router.replace("/start");
          return;
        }
        const data = await res.json().catch(() => []);
        const list = Array.isArray(data) ? data : [];

        // 서버 사주 → 로컬 캐시(마이페이지·채팅 등). 재로그인 시 목록이 비는 문제 방지
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(SAJU_CACHE_HYDRATED_KEY);
          await hydrateLocalSajuCacheFromServerRows(list as ServerSajuRow[]);
          sessionStorage.setItem(SAJU_CACHE_HYDRATED_KEY, "1");
          window.localStorage.setItem("isLoggedIn", "true");
        }

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
  }, [router]);

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

