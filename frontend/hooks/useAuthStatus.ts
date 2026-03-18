import { useEffect, useState } from "react";
import { clearStoredToken, getAuthHeaders, getStoredToken } from "@/lib/auth";

const DEFAULT_BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://saju-backend-eqd6.onrender.com";

export function useAuthStatus(backendBase: string = DEFAULT_BACKEND) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  async function syncOnce() {
    if (typeof window === "undefined") return;
    const hasToken = !!getStoredToken();
    const localFlag = window.localStorage.getItem("isLoggedIn");

    // 토큰도 없고, 로컬 플래그도 없으면 굳이 서버 호출을 하지 않는다.
    if (!hasToken && localFlag !== "true") {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${backendBase}/api/saju/list`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const ok = res.ok;
      window.localStorage.setItem("isLoggedIn", ok ? "true" : "false");
      if (!ok) clearStoredToken();
      setIsLoggedIn(ok);
    } catch {
      setIsLoggedIn(window.localStorage.getItem("isLoggedIn") === "true");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    syncOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendBase]);

  return {
    isLoggedIn,
    loading,
    refresh: syncOnce,
  };
}

