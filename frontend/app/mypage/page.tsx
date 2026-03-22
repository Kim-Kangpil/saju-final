"use client";

import { use, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSavedSajuList,
  deleteSaju,
  SavedSaju,
  syncSavedSajuListWithServer,
  updateLastViewed,
} from "@/lib/sajuStorage";
import { clearStoredToken, getAuthHeaders } from "@/lib/auth";
import SajuCard from "@/components/SajuCard";
import { HamIcon } from "@/components/HamIcon";
import { Icon } from "@iconify/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function MyPageContent({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sajuList, setSajuList] = useState<SavedSaju[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seedCount, setSeedCount] = useState<number>(0);
  const [seedCharged, setSeedCharged] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      alert("로그인이 필요합니다.");
      router.push("/start");
      return;
    }

    let cancelled = false;
    (async () => {
      // DB가 우선: 서버 목록으로 로컬 캐시 갱신 후 표시
      await syncSavedSajuListWithServer();
      if (cancelled) return;
      setSajuList(getSavedSajuList());
      setIsLoading(false);
    })();

    // 분석권 충전 완료 토스트
    if (searchParams?.get("seed_charged") === "1") {
      setSeedCharged(true);
      setTimeout(() => setSeedCharged(false), 3000);
    }

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/seeds`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && typeof data?.seeds === "number") setSeedCount(data.seeds);
      } catch {
        if (!cancelled) setSeedCount(0);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleView = (saju: SavedSaju) => {
    updateLastViewed(saju.id);
    sessionStorage.setItem("loadedSaju", JSON.stringify(saju));
    router.push("/add?loaded=" + saju.id);
  };

  const handleEdit = (saju: SavedSaju) => {
    sessionStorage.setItem("editingSaju", JSON.stringify(saju));
    router.push("/add?edit=" + saju.id);
  };

  const handleDelete = (id: string) => {
    const result = deleteSaju(id);
    if (result.success) {
      setSajuList(getSavedSajuList());
    } else {
      alert(result.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginType");
    clearStoredToken();
    router.push("/home");
  };

  if (!isLoggedIn) return null;

  const remaining = 5 - sajuList.length;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-base)",
        backgroundImage: "url('/images/hanji-bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sans { font-family: var(--font-sans); }
        .tap {
          transition: transform .15s ease, opacity .15s ease, box-shadow .15s ease;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
        }
        .tap:active { transform: scale(.97); opacity: .9; }
        .wrap { width: 100%; max-width: 420px; margin: 0 auto; padding: 0 20px 48px; }
        @media (max-width: 390px) { .wrap { padding: 0 16px 48px; } }

        /* 분석권 충전 완료 토스트 */
        .toast {
          position: fixed;
          top: 72px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 200;
          background: var(--text-primary);
          color: #fff;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 99px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          animation: fadeInOut 3s ease forwards;
        }
        @keyframes fadeInOut {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          12%  { opacity: 1; transform: translateX(-50%) translateY(0); }
          75%  { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) translateY(-4px); }
        }
      `}</style>

      {/* 토스트 */}
      {seedCharged && (
        <div className="toast sans">
          <Icon icon="mdi:ticket-confirmation-outline" width={16} />
          분석권 충전 완료!
        </div>
      )}

      <div className="wrap">
        {/* ── 헤더 ── */}
        <header
          className="sans"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            margin: "0 -20px 0",
            background: "var(--bg-base)",
            borderBottom: "3px solid var(--border-default)",
          }}
        >
          <button
            onClick={() => router.push("/home")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
            }}
          >
            <HamIcon style={{ width: 40, height: 40, objectFit: "contain" }} alt="로고" />
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.04em" }}>
              한양사주
            </span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => router.push("/seed-charge")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "6px 10px", borderRadius: 999,
                background: "rgba(255,255,255,0.85)", border: "1.5px solid var(--border-default)", cursor: "pointer",
              }}
            >
              <Icon icon="mdi:ticket-confirmation-outline" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{seedCount}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/membership")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "6px 10px", borderRadius: 999,
                background: "rgba(255,255,255,0.85)", border: "1.5px solid var(--border-default)", cursor: "pointer",
              }}
            >
              <Icon icon="mdi:crown" width={18} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>한양사주 Pro</span>
            </button>
            <button
              type="button"
              className="tap"
              aria-label="메뉴 열기"
              onClick={() => router.push("/saju-mypage")}
              style={{
                padding: 8, borderRadius: 10, border: "none", background: "transparent",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon icon="mdi:menu" width={22} style={{ marginLeft: 14 }} />
            </button>
          </div>
        </header>

        {/* ── 프로필 요약 ── */}
        <section
          className="sans"
          style={{
            margin: "0 -20px",
            background: "linear-gradient(160deg, var(--bg-base) 0%, var(--bg-input) 100%)",
            padding: "20px 24px 18px",
            borderBottom: "1.5px solid var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
              마이페이지
            </div>
            <div style={{ fontSize: 12, color: "var(--text-primary)" }}>
              분석권 <strong style={{ color: "var(--text-primary)" }}>{seedCount}개</strong> 보유 중
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="tap sans"
              onClick={() => router.push("/seed-charge")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "7px 12px", borderRadius: 10,
                background: "#fff", border: "1.5px solid var(--border-default)",
                fontSize: 12, fontWeight: 700, color: "var(--text-primary)", cursor: "pointer",
              }}
            >
              <Icon icon="mdi:ticket-confirmation-outline" width={14} />
              충전
            </button>
            <button
              type="button"
              className="tap sans"
              onClick={handleLogout}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "7px 12px", borderRadius: 10,
                background: "#fff", border: "1.5px solid var(--border-default)",
                fontSize: 12, fontWeight: 700, color: "#6b7280", cursor: "pointer",
              }}
            >
              로그아웃
            </button>
          </div>
        </section>

        {/* ── 새 사주 보기 CTA ── */}
        <section className="sans" style={{ padding: "20px 0 0" }}>
          <button
            type="button"
            className="tap sans"
            onClick={() => router.push("/add")}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: "var(--text-primary)",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(106,153,78,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>🔮</span>
            새 사주 보기
          </button>
        </section>

        {/* ── 저장된 사주 목록 ── */}
        <section className="sans" style={{ padding: "24px 0 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              저장된 사주{" "}
              <span style={{ color: "#6b7280", fontWeight: 400 }}>
                ({sajuList.length}/5)
              </span>
            </h2>
            <button
              type="button"
              className="tap sans"
              onClick={() => router.push("/add")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "5px 10px", borderRadius: 8,
                background: "#fff", border: "1.5px solid var(--border-default)",
                fontSize: 12, fontWeight: 700, color: "var(--text-primary)", cursor: "pointer",
              }}
            >
              <Icon icon="mdi:plus" width={14} />
              추가
            </button>
          </div>

          {/* 로딩 */}
          {isLoading && (
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1.5px solid #e0ece0",
                padding: "40px 20px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
              불러오는 중...
            </div>
          )}

          {/* 빈 상태 */}
          {!isLoading && sajuList.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1.5px solid #e0ece0",
                padding: "36px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                저장된 사주가 없어요
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
                첫 사주를 확인해보세요!
              </div>
              <button
                type="button"
                className="tap sans"
                onClick={() => router.push("/add")}
                style={{
                  padding: "11px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: "var(--text-primary)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                🔮 사주 보러 가기
              </button>
            </motion.div>
          )}

          {/* 목록 */}
          {!isLoading && sajuList.length > 0 && (
            <AnimatePresence>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sajuList.map((saju, index) => (
                  <motion.div
                    key={saju.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <SajuCard
                      saju={saju}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* 슬롯 안내 */}
          {!isLoading && sajuList.length > 0 && (
            <div
              style={{
                marginTop: 12,
                background: remaining > 0 ? "#f8faf8" : "#fff7ed",
                borderRadius: 12,
                border: `1px solid ${remaining > 0 ? "#e0ece0" : "#fcd9a0"}`,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: remaining > 0 ? "var(--text-primary)" : "#9a3412",
                fontWeight: 700,
              }}
            >
              <Icon
                icon={remaining > 0 ? "mdi:information-outline" : "mdi:alert-outline"}
                width={16}
                style={{ flexShrink: 0 }}
              />
              {remaining > 0
                ? `${remaining}개 더 저장할 수 있어요`
                : "저장 공간이 가득 찼어요. 기존 사주를 삭제해주세요."}
            </div>
          )}
        </section>

        {/* ── 바로가기 ── */}
        <section className="sans" style={{ padding: "24px 0 0" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
            바로가기
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: "mdi:ticket-confirmation-outline", label: "분석권 충전", path: "/seed-charge", color: "var(--text-primary)" },
              { icon: "mdi:crown", label: "한양사주 Pro", path: "/membership", color: "#c9a227" },
              { icon: "mdi:history", label: "분석 내역", path: "/history", color: "#6b7280" },
              { icon: "mdi:home-outline", label: "홈으로", path: "/home", color: "var(--text-primary)" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="tap sans"
                onClick={() => router.push(item.path)}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1.5px solid #e0ece0",
                  padding: "14px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Icon icon={item.icon} width={20} style={{ color: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function MyPage(
  props: { params?: Promise<Record<string, string | string[]>> }
) {
  return (
    <Suspense
      fallback={
        <main
          style={{
            background: "var(--bg-base)",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans)",
          }}
        >
          <p style={{ fontSize: 14, color: "var(--text-primary)" }}>불러오는 중...</p>
        </main>
      }
    >
      <MyPageContent {...props} />
    </Suspense>
  );
}