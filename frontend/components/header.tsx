"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { HamIcon } from "@/components/HamIcon";
import { clearStoredToken } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [seedCount] = useState<number>(0); // 기본값 0, 추후 충전 로직과 연동 예정

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedIn === "true");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginType");
    clearStoredToken();
    setIsLoggedIn(false);
    alert("로그아웃되었습니다.");
    router.push("/home");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-base)] border-b-4 border-[var(--border-default)] shadow-lg">
      <div className="w-full max-w-[450px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* 로고 클릭 시 /home으로 */}
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <HamIcon alt="로고" className="w-10 h-10 object-contain" />
          <span className="text-lg font-bold text-[var(--text-primary)]">한양사주</span>
        </button>

        {/* 오른쪽: 로그인/회원가입 또는 분석권 & 햄버거 메뉴 */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* 분석권 (클릭 시 충전 페이지) */}
              <button
                type="button"
                onClick={() => router.push("/seed-charge")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 border border-[var(--border-default)] hover:bg-white transition-colors"
              >
                <Icon icon="mdi:ticket-confirmation-outline" width={18} />
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {seedCount}
                </span>
              </button>
              {/* 한양사주 Pro (클릭 시 Pro 페이지) */}
              <button
                type="button"
                onClick={() => router.push("/membership")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 border border-[var(--border-default)] hover:bg-white transition-colors"
              >
                <Icon icon="mdi:crown" width={18} />
                <span className="text-xs font-semibold text-[var(--text-primary)]">한양사주 Pro</span>
              </button>
              <button
                type="button"
                className="p-3 rounded-lg hover:bg-[var(--border-default)] transition-colors"
                aria-label="메뉴 열기"
              >
                <Icon icon="mdi:menu" width={24} style={{ marginLeft: 14 }} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/login")}
                className="px-3 py-2 text-sm font-bold text-[var(--text-primary)] bg-white/50 hover:bg-white rounded-lg transition-colors"
              >
                로그인
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="px-3 py-2 text-sm font-bold bg-[var(--text-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}