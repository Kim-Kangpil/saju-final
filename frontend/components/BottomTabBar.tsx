"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Bookmark, Search, Plus, Home, Clock, User } from "lucide-react";

function AnalysisIcon({ color }: { color: string }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", color }}>
      <Search size={22} strokeWidth={2} />
      <span style={{ position: "absolute", bottom: -2, right: -2 }}>
        <Plus size={11} strokeWidth={2.5} />
      </span>
    </span>
  );
}

const TABS = [
  { path: "/saved", label: "저장된 사주", icon: Bookmark },
  { path: "/analysis", label: "분석", icon: "analysis" as const },
  { path: "/", label: "홈", icon: Home },
  { path: "/fortune", label: "운세", icon: Clock },
  { path: "/mypage", label: "마이페이지", icon: User },
] as const;

const INACTIVE_COLOR = "#9ca3af";
const ACTIVE_COLOR = "#6a994e";

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, [pathname]);

  function getHref(path: string): string {
    if (path === "/") return "/";
    if (!isLoggedIn) return "/start";
    if (path === "/saved") return "/saju-list";
    if (path === "/mypage") return "/saju-mypage";
    if (path === "/analysis" || path === "/fortune") return "#";
    return path;
  }

  function handleTabClick(e: React.MouseEvent, path: string) {
    if (path === "/") return;
    if (!isLoggedIn) {
      e.preventDefault();
      router.push("/start");
      return;
    }
    if (path === "/saved") {
      e.preventDefault();
      router.push("/saju-list");
      return;
    }
    if (path === "/mypage") {
      e.preventDefault();
      router.push("/saju-mypage");
      return;
    }
    if (path === "/analysis" || path === "/fortune") {
      e.preventDefault();
      alert("아직 개발 중인 기능입니다.");
    }
  }

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        borderTop: "0.5px solid #e5e7eb",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        zIndex: 100,
      }}
    >
      {TABS.map((tab) => {
        const { path, label, icon } = tab;
        const Icon = icon === "analysis" ? null : icon;
        const isActive =
          path === "/"
            ? pathname === "/" || pathname === "/home"
            : path === "/saved"
              ? pathname === "/saju-list" || pathname.startsWith("/saju-list")
              : path === "/mypage"
                ? pathname === "/saju-mypage" || pathname.startsWith("/saju-mypage")
                : pathname === path || pathname.startsWith(path + "/");

        const iconColor = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
        const href = getHref(path);

        return (
          <Link
            key={path}
            href={href}
            onClick={(e) => handleTabClick(e, path)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              textDecoration: "none",
              color: iconColor,
            }}
          >
            {icon === "analysis" ? (
              <AnalysisIcon color={iconColor} />
            ) : Icon ? (
              <Icon size={22} strokeWidth={2} />
            ) : null}
            <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
