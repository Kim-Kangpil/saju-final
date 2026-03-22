"use client";

import { use, useRef, useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { getSavedSajuList } from "@/lib/sajuStorage";
import MarkdownMessage from "../../components/MarkdownMessage";
import { useLang } from "@/contexts/LangContext";
import { useChatSessions } from "@/hooks/useChatSessions";
import type { Message as SessionMessage } from "@/lib/chatStorage";
import { clearStoredToken, getAuthHeaders, getStoredToken } from "@/lib/auth";
import { useAuthStatus } from "@/hooks/useAuthStatus";

/** 게스트 3회 제한 — 잠시 끄기: true면 3번 질문 후 로그인 유도 */
const GUEST_LIMIT_ENABLED = true;
const GUEST_LIMIT = 3;

/** 시간대별 인사 문구 (다국어) */
function getTimeBasedGreeting(lang: "ko" | "en"): string {
  const h = new Date().getHours();
  if (lang === "en") {
    if (h >= 5 && h < 12) return "Good morning.";
    if (h >= 12 && h < 17) return "Hope your afternoon is going well.";
    if (h >= 17 && h < 21) return "Good evening.";
    return "Hello.";
  }
  if (h >= 5 && h < 12) return "아침 인사드려요";
  if (h >= 12 && h < 17) return "오후 잘 보내고 계신가요";
  if (h >= 17 && h < 21) return "저녁 인사드려요";
  return "안녕하세요";
}

const QUICK_PROMPTS_KO = [
  { label: "사주 질문", text: "사주에 대해 궁금한 게 있어요." },
  { label: "오늘의 운세", text: "오늘 제 운세를 알려주세요." },
  { label: "올해 재물운", text: "올해 재물운이 어떻게 되나요?" },
  { label: "맞는 직업", text: "나랑 잘 맞는 직업이나 방향이 궁금해요." },
  { label: "고민 상담", text: "요즘 고민이 있어서 조언이 필요해요." },
  { label: "나와 맞는 방향", text: "제게 맞는 직업이나 방향이 궁금해요." },
];

const BACKEND_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

/** 로컬 첫 사주가 만세력 등록으로 인정될 만한지 (이름만으로는 부족한 케이스 대비) */
function readHasLocalRegisteredSaju(): boolean {
  try {
    const f = getSavedSajuList()?.[0];
    if (!f) return false;
    const birth = String(f.birthYmd || "").replace(/\D/g, "");
    if (birth.length >= 8) return true;
    if (f.result != null && typeof f.result === "object") return true;
    if (typeof f.name === "string" && f.name.trim().length > 0) return true;
    return false;
  } catch {
    return false;
  }
}

/** 채팅 상단 배지용: 일주 한자 → 한글 (한양사주 클래식 톤과 동일 테이블) */
const HANJA_TO_KR: Record<string, string> = {
  甲: "갑",
  乙: "을",
  丙: "병",
  丁: "정",
  戊: "무",
  己: "기",
  庚: "경",
  辛: "신",
  壬: "임",
  癸: "계",
  子: "자",
  丑: "축",
  寅: "인",
  卯: "묘",
  辰: "진",
  巳: "사",
  午: "오",
  未: "미",
  申: "신",
  酉: "유",
  戌: "술",
  亥: "해",
};

function getFirstSavedDayPillarHangul(): string {
  if (typeof window === "undefined") return "";
  try {
    const first = getSavedSajuList()?.[0];
    const r = first?.result as
      | {
          day_pillar?: string;
          day?: { cheongan?: { hanja?: string }; jiji?: { hanja?: string } };
        }
      | undefined
      | null;
    if (!r || typeof r !== "object") return "";
    const fromPillar = typeof r.day_pillar === "string" ? r.day_pillar : "";
    const cg = r.day?.cheongan?.hanja ?? "";
    const jj = r.day?.jiji?.hanja ?? "";
    const fromNested = cg && jj ? `${cg}${jj}` : "";
    const dayHanja = fromPillar || fromNested;
    if (!dayHanja) return "";
    return dayHanja.split("").map((c) => HANJA_TO_KR[c] ?? c).join("");
  } catch {
    return "";
  }
}

const QUICK_PROMPTS_EN = [
  { label: "Ask about Saju", text: "I have a question about my Saju." },
  { label: "Today's luck", text: "Please tell me my luck for today." },
  { label: "Wealth this year", text: "How is my wealth luck this year?" },
  { label: "Career direction", text: "What kind of job or direction fits me well?" },
  { label: "Worry counseling", text: "I have something on my mind and need some advice." },
  { label: "Best direction", text: "I want to know which direction in life suits me." },
];

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts?.length) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
}

/** GPT 답변에서 일간·지지 나열형 조견 줄 제거 (UI 표와 중복 방지) */
function stripSinsalTable(text: string): string {
  return text
    .split("\n")
    .filter((line) => {
      // 일간별 지지 나열 패턴 제거
      if (/[갑을병정무기경신임계][일]간\s*[:：]/.test(line)) return false;
      if (/甲|乙|丙|丁|戊|己|庚|辛|壬|癸/.test(line) && /丑|子|亥|巳|午|未|申|酉|寅|卯|辰|戌/.test(line))
        return false;
      // 문장 안에 일간+지지 예시가 섞인 패턴 제거
      if (
        /[갑을병정무기경신임계](일간|일주|일).*[은는이가].*[자축인묘진사오미신유술해]/.test(line)
      )
        return false;
      if (/(예를 들어|예컨대).*[갑을병정무기경신임계](일간|일주)/.test(line)) return false;
      return true;
    })
    .join("\n");
}

/** GPT 답변에 천을귀인이 언급될 때, 답변 버블 위에 참고 카드로 붙는 조견표 */
const CHEONEUL_TABLE = (
  <table>
    <thead>
      <tr>
        <th>일간</th>
        <th>천을귀인 지지</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>甲·戊·庚 (갑·무·경)</td>
        <td>丑·未 (축·미)</td>
      </tr>
      <tr>
        <td>乙·己 (을·기)</td>
        <td>子·申 (자·신)</td>
      </tr>
      <tr>
        <td>丙·丁 (병·정)</td>
        <td>亥·酉 (해·유)</td>
      </tr>
      <tr>
        <td>壬·癸 (임·계)</td>
        <td>巳·卯 (사·묘)</td>
      </tr>
      <tr>
        <td>辛 (신)</td>
        <td>午·寅 (오·인)</td>
      </tr>
    </tbody>
  </table>
);

export default function ChatPage({
  params,
}: {
  params?: Promise<Record<string, string | string[]>>;
}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const { lang } = useLang();
  const { isLoggedIn, refresh: refreshAuth } = useAuthStatus();
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);
  const handleRetryRef = useRef<((text: string) => void) | null>(null);

  // 로컬 세션 관리 (ChatGPT 스타일 최근 대화 리스트)
  const {
    sessions,
    currentId,
    currentSession,
    startNewChat,
    selectSession,
    removeSession,
    searchQuery,
    searchResults,
    search,
    replaceMessages,
    ensureTitleFromFirstMessage,
    refreshSessionsFromStorage,
  } = useChatSessions();

  // 다른 탭·스토리지 갱신 후 돌아왔을 때 사이드바 목록 동기화
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") refreshSessionsFromStorage();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refreshSessionsFromStorage]);

  const bodyRef = useRef<{ isGuest: boolean; saju?: unknown }>({ isGuest: true, saju: undefined });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!GUEST_LIMIT_ENABLED) return;
    (async () => {
      try {
        // useAuthStatus가 기본 동기화를 해주므로, 여기서는 저장된 플래그만 참고
        const ok = window.localStorage.getItem("isLoggedIn") === "true";
        if (ok) return;
        const count = parseInt(window.localStorage.getItem("guest_chat_count") || "0", 10);
        if (count >= GUEST_LIMIT) {
          setShowLoginCard(true);
        }
      } catch {
        // 무시
      }
    })();
  }, []);

  const goMenu = () => {
    const target = isLoggedIn ? "/saju-mypage" : "/start";
    try {
      router.push(target);
    } finally {
      // 일부 모바일 웹뷰/상황에서 push가 먹지 않는 경우를 대비한 폴백
      if (typeof window !== "undefined") {
        const current = window.location.pathname;
        window.setTimeout(() => {
          if (window.location.pathname === current) {
            window.location.assign(target);
          }
        }, 200);
      }
    }
  };

  const getSajuBody = () => {
    const saved = getSavedSajuList();
    const first = saved?.[0];
    if (!first) return undefined;
    return {
      name: first.name,
      birthYmd: first.birthYmd,
      birthHm: first.birthHm,
      gender: first.gender,
      calendar: first.calendar,
      timeUnknown: first.timeUnknown,
      result: first.result,
    };
  };

  /** 로컬 result 갱신 후 일주 배지 문구 재계산용 */
  const [sajuBadgeTick, setSajuBadgeTick] = useState(0);

  const refreshSajuIfStale = useCallback(async () => {
    const saved = getSavedSajuList();
    const first = saved?.[0];
    const nameOk = Boolean(first?.name?.trim());
    if (!first || !nameOk || first.result?.strength) return;

    const ymd = String(first.birthYmd || "").replace(/\D/g, "");
    if (ymd.length < 8) return;

    try {
      const hm = String(first.birthHm ?? "1200");
      const res = await fetch(`${BACKEND_API_BASE}/saju/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendar_type: first.calendar === "lunar" ? "lunar" : "solar",
          year: parseInt(ymd.slice(0, 4), 10),
          month: parseInt(ymd.slice(4, 6), 10),
          day: parseInt(ymd.slice(6, 8), 10),
          hour: first.timeUnknown ? null : parseInt(hm.slice(0, 2), 10),
          minute: first.timeUnknown ? null : parseInt(hm.slice(2, 4) || "0", 10),
          gender: first.gender,
          time_unknown: Boolean(first.timeUnknown),
          is_leap_month: false,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const updated = { ...first, result: { ...(first.result && typeof first.result === "object" ? first.result : {}), ...data } };
      const newList = [updated, ...saved.slice(1)];
      localStorage.setItem("saved_saju_list", JSON.stringify(newList));
      bodyRef.current = {
        isGuest: !isLoggedIn,
        saju: getSajuBody(),
      };
      setSajuBadgeTick((t) => t + 1);
    } catch {
      /* 실패 시 조용히 넘어감 */
    }
  }, [isLoggedIn]);

  const [savedSajuName, setSavedSajuName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  /** 로컬 스토리지 기준 등록 여부 (이름 외 생년·result 포함) */
  const [hasLocalRegisteredSaju, setHasLocalRegisteredSaju] = useState(false);
  /** 로그인 시 서버에 저장된 사주 개수 조회 완료 여부 */
  const [serverSajuChecked, setServerSajuChecked] = useState(false);
  const [serverSajuCount, setServerSajuCount] = useState(0);

  const sajuBadgeDayKr = useMemo(() => {
    if (!hydrated || typeof window === "undefined") return "";
    return getFirstSavedDayPillarHangul();
  }, [savedSajuName, hydrated, hasLocalRegisteredSaju, sajuBadgeTick]);

  useEffect(() => {
    bodyRef.current = {
      isGuest: !isLoggedIn,
      saju: getSajuBody(),
    };
  }, [isLoggedIn, savedSajuName, hasLocalRegisteredSaju]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        // 백엔드 인증은 쿠키(hsaju_session) 또는 Bearer(hsaju_token) — Next /api/chat이 그대로 백엔드로 전달함
        credentials: "include",
        prepareSendMessagesRequest: ({ messages }) => {
          console.log("💬 chat body:", JSON.stringify(bodyRef.current, null, 2));
          return {
            body: {
              messages,
              ...bodyRef.current,
              lang,
            },
            headers: { ...getAuthHeaders() },
            credentials: "include",
          };
        },
      }),
    [lang],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const first = getSavedSajuList()?.[0];
      setSavedSajuName(first?.name?.trim() ? first.name.trim() : null);
      setHasLocalRegisteredSaju(readHasLocalRegisteredSaju());
    } catch {
      // ignore
    }
    setHydrated(true);
    void refreshSajuIfStale();
  }, [refreshSajuIfStale]);

  // 로그인/로그아웃 전환 시 로컬 사주 스냅샷 다시 읽기
  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) return;
    try {
      const first = getSavedSajuList()?.[0];
      setSavedSajuName(first?.name?.trim() ? first.name.trim() : null);
      setHasLocalRegisteredSaju(readHasLocalRegisteredSaju());
    } catch {
      // ignore
    }
  }, [isLoggedIn, hydrated]);

  // 로그인: 서버에 등록된 만세력이 있으면 로컬이 비어 있어도 등록 유도 화면을 띄우지 않음
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!isLoggedIn) {
      setServerSajuChecked(true);
      setServerSajuCount(0);
      return;
    }

    let cancelled = false;
    setServerSajuChecked(false);

    (async () => {
      try {
        const res = await fetch(`${BACKEND_API_BASE}/api/saju/list`, {
          credentials: "include",
          headers: { ...getAuthHeaders() },
        });
        const data = await res.json().catch(() => []);
        if (cancelled) return;
        const arr = Array.isArray(data) ? data : [];
        setServerSajuCount(arr.length);
        if (arr.length > 0) {
          const nm = String(arr[0]?.name ?? "").trim();
          if (nm) {
            setSavedSajuName((prev) => (prev?.trim() ? prev : nm));
          }
        }
      } catch {
        if (!cancelled) setServerSajuCount(0);
      } finally {
        if (!cancelled) setServerSajuChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  // /add 등에서 돌아왔을 때 로컬 저장 사주 반영
  useEffect(() => {
    if (typeof window === "undefined" || !isLoggedIn) return;
    const refreshLocalSaju = () => {
      if (document.visibilityState && document.visibilityState !== "visible") return;
      try {
        const first = getSavedSajuList()?.[0];
        setSavedSajuName(first?.name?.trim() ? first.name.trim() : null);
        setHasLocalRegisteredSaju(readHasLocalRegisteredSaju());
        setSajuBadgeTick((t) => t + 1);
      } catch {
        // ignore
      }
    };
    window.addEventListener("focus", refreshLocalSaju);
    document.addEventListener("visibilitychange", refreshLocalSaju);
    return () => {
      window.removeEventListener("focus", refreshLocalSaju);
      document.removeEventListener("visibilitychange", refreshLocalSaju);
    };
  }, [isLoggedIn]);

  const showNoSajuScreen =
    hydrated &&
    isLoggedIn &&
    serverSajuChecked &&
    !hasLocalRegisteredSaju &&
    serverSajuCount === 0;

  return (
    <>
      <style>{`
        :root {
          --bg:        #F2EDE4;
          --surface:   #FFFCF7;
          --surface2:  #EDE8DF;
          --border:    #D8D2C8;
          --border2:   #C8C2B6;
          --text:      #2C2A26;
          --sub:       #7A776F;
          --muted:     #B0ACA4;
          --accent:    #4A6741;
          --gold-muted: #9a8b78;
          --serif:     'Gmarket Sans', -apple-system, sans-serif;
          --sans:      'Gmarket Sans', -apple-system, sans-serif;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; font-size: 16px; }
        body { background: var(--bg); color: var(--text); font-family: var(--sans); min-width: 320px; font-size: 16px; }
        .chat-wrap {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          min-height: 100dvh;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }
        @media (min-width: 768px) {
          .chat-wrap {
            max-width: 960px;
            min-height: 100vh;
            border-radius: 12px;
            box-shadow: 0 0 0 1px var(--border), 0 8px 24px rgba(0,0,0,.06);
            overflow: hidden;
          }
        }
        @media (min-width: 1024px) {
          .chat-wrap {
            max-width: 1024px;
            margin: 24px auto;
            min-height: calc(100dvh - 48px);
            min-height: calc(100vh - 48px);
          }
        }
        .chat-header {
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          padding-bottom: 12px;
          padding-left: max(16px, env(safe-area-inset-left));
          padding-right: max(16px, env(safe-area-inset-right));
          background: var(--surface);
          border-bottom: 1px solid var(--border);
        }
        @media (min-width: 768px) {
          .chat-header { padding: 14px 24px; }
        }
        .chat-header-left { display: flex; align-items: center; gap: 10px; }
        .chat-logo { width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%; border: 1px solid var(--border); overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 18px; background: var(--surface2); }
        .chat-logo img { width: 100%; height: 100%; object-fit: cover; }
        .chat-title { font-family: var(--serif); font-size: 17px; font-weight: 700; color: var(--text); letter-spacing: 0.02em; }
        @media (min-width: 768px) { .chat-title { font-size: 18px; } }
        .chat-back {
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: 12px;
          border: 1px solid var(--border2);
          background: transparent;
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 500;
          color: var(--sub);
          cursor: pointer;
          transition: background .15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .chat-back:hover { background: var(--surface2); }
        .chat-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        @media (min-width: 768px) {
          .chat-layout {
            flex-direction: row;
          }
        }
        .chat-sidebar {
          display: none;
        }
        @media (min-width: 768px) {
          .chat-sidebar {
            display: flex;
            flex-direction: column;
            width: 260px;
            border-right: 1px solid var(--border);
            background: #f8f5ef;
            min-height: 0;
          }
        }
        .chat-sidebar-header {
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .chat-sidebar-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
        }
        .chat-sidebar-new {
          border: 1px solid var(--border2);
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          background: #fff;
          cursor: pointer;
        }
        .chat-sidebar-search {
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
        }
        .chat-sidebar-search input {
          width: 100%;
          border-radius: 999px;
          border: 1px solid var(--border2);
          padding: 6px 10px;
          font-size: 11px;
          background: #fffcf7;
        }
        .chat-sidebar-list {
          flex: 1;
          overflow-y: auto;
          padding: 6px 4px 8px;
        }
        .chat-sidebar-item {
          border-radius: 10px;
          padding: 8px 8px;
          margin: 2px 4px;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 6px;
          cursor: pointer;
        }
        .chat-sidebar-item.active {
          background: #2c2a26;
          color: #fdf9f1;
        }
        .chat-sidebar-item-title {
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-sidebar-item-sub {
          font-size: 11px;
          opacity: 0.7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-sidebar-item-main {
          flex: 1;
          min-width: 0;
        }
        .chat-sidebar-item-delete {
          flex-shrink: 0;
          border: none;
          background: transparent;
          color: inherit;
          opacity: 0.6;
          cursor: pointer;
          padding: 2px;
        }
        .chat-sidebar-item-delete:hover {
          opacity: 1;
        }
        /* 모바일용 세션 선택 바 */
        /* 모바일용 세션 드로어 */
        .chat-mobile-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 40;
        }
        .chat-mobile-drawer {
          position: fixed;
          inset: 0 auto 0 0;
          width: min(80vw, 320px);
          background: #f8f5ef;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 50;
          box-shadow: 4px 0 18px rgba(0,0,0,0.15);
        }
        @media (min-width: 768px) {
          .chat-mobile-drawer,
          .chat-mobile-drawer-backdrop {
            display: none;
          }
        }
        .chat-main-shell {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .chat-saju-badge {
          flex-shrink: 0;
          text-align: center;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.03em;
          line-height: 1.45;
          color: var(--sub);
          opacity: 0.92;
          padding: 6px 14px 8px;
          padding-left: max(14px, env(safe-area-inset-left));
          padding-right: max(14px, env(safe-area-inset-right));
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          font-family: var(--sans);
        }
        .chat-saju-badge .chat-saju-badge-star {
          color: var(--gold-muted);
          margin-right: 3px;
          opacity: 0.95;
        }
        @media (min-width: 768px) {
          .chat-saju-badge {
            font-size: 12px;
            padding: 8px 20px 10px;
            padding-left: max(20px, env(safe-area-inset-left));
            padding-right: max(20px, env(safe-area-inset-right));
          }
        }
        .chat-list {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 16px 16px 24px;
          padding-left: max(16px, env(safe-area-inset-left));
          padding-right: max(16px, env(safe-area-inset-right));
          padding-bottom: max(24px, env(safe-area-inset-bottom));
        }
        .chat-initial-area {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 20px 32px;
          padding-left: max(20px, env(safe-area-inset-left));
          padding-right: max(20px, env(safe-area-inset-right));
        }
        @media (min-width: 768px) {
          .chat-initial-area { padding: 48px 32px 40px; }
        }
        .chat-initial-icon { width: 64px; height: 64px; margin-bottom: 20px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border); }
        @media (min-width: 768px) { .chat-initial-icon { width: 80px; height: 80px; margin-bottom: 24px; } }
        .chat-initial-greeting { font-size: 15px; color: var(--sub); text-align: center; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 6px; }
        @media (min-width: 768px) { .chat-initial-greeting { font-size: 16px; } }
        .chat-initial-prompt { font-family: var(--serif); font-size: 20px; font-weight: 700; color: var(--text); text-align: center; line-height: 1.5; max-width: 320px; }
        @media (min-width: 768px) { .chat-initial-prompt { font-size: 22px; max-width: 400px; } }
        .chat-quick-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 14px; padding: 0 4px; }
        .chat-quick-chip {
          padding: 10px 16px; border-radius: 999px; border: 1px solid var(--border2); background: var(--surface);
          font-size: 13px; color: var(--text); font-family: var(--sans); cursor: pointer; transition: background .15s, border-color .15s;
        }
        .chat-quick-chip:hover { background: var(--surface2); border-color: var(--border); }
        @media (min-width: 768px) { .chat-quick-chip { padding: 12px 18px; font-size: 14px; } }
        .chat-main {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 768px) {
          .chat-list { padding: 20px 24px 28px; }
        }
        @media (min-width: 1024px) {
          .chat-list { padding: 24px 32px 32px; }
        }
        .chat-msg { display: flex; margin-bottom: 18px; max-width: 100%; }
        @media (min-width: 768px) {
          .chat-msg { max-width: 78%; margin-bottom: 20px; }
        }
        @media (min-width: 1024px) {
          .chat-msg { max-width: 60%; }
        }
        .chat-msg.user { margin-left: auto; flex-direction: row-reverse; }
        .chat-msg-bubble {
          padding: 12px 14px;
          border-radius: 18px;
          font-size: 15px;
          line-height: 1.6;
          word-break: break-word;
        }
        @media (min-width: 768px) {
          .chat-msg-bubble { padding: 14px 18px; font-size: 15px; }
        }
        .chat-msg.assistant .chat-msg-bubble {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text);
          border-bottom-left-radius: 6px;
        }
        .chat-cheoneul-table {
          margin-top: 12px;
          font-size: 13px;
          line-height: 1.45;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface2);
        }
        .chat-cheoneul-table table { width: 100%; border-collapse: collapse; min-width: 260px; }
        .chat-cheoneul-table th,
        .chat-cheoneul-table td {
          padding: 8px 10px;
          text-align: left;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        .chat-cheoneul-table th {
          background: var(--surface);
          font-weight: 700;
          color: var(--text);
          font-size: 12px;
        }
        .chat-cheoneul-table tr:last-child td { border-bottom: none; }
        .chat-msg.user .chat-msg-bubble {
          background: #2C2A26;
          color: #F2EDE4;
          border-bottom-right-radius: 6px;
        }
        .chat-input-wrap {
          flex-shrink: 0;
          position: sticky;
          bottom: 0;
          padding: 12px 16px;
          padding-left: max(16px, env(safe-area-inset-left));
          padding-right: max(16px, env(safe-area-inset-right));
          padding-bottom: max(12px, env(safe-area-inset-bottom));
          background: var(--bg);
          border-top: 1px solid var(--border);
        }
        @media (min-width: 768px) {
          .chat-input-wrap { padding: 16px 24px 20px; }
        }
        @media (min-width: 1024px) {
          .chat-input-wrap { padding: 20px 32px 24px; }
        }
        .chat-input-row { display: flex; align-items: flex-end; gap: 10px; max-width: 100%; }
        .chat-input {
          flex: 1;
          min-width: 0;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid var(--border2);
          background: var(--surface);
          font-family: var(--sans);
          font-size: 16px;
          color: var(--text);
          resize: none;
          min-height: 44px;
          max-height: 140px;
          transition: border-color .15s, box-shadow .15s;
        }
        @media (min-width: 768px) {
          .chat-input { padding: 12px 18px; min-height: 50px; font-size: 16px; }
        }
        .chat-input::placeholder { color: var(--muted); }
        .chat-input:focus { outline: none; border-color: var(--accent); }
        .chat-send { flex-shrink: 0; width: 48px; height: 48px; min-width: 48px; min-height: 48px; border-radius: 50%; border: none; background: #2C2A26; color: #F2EDE4; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity .15s; }
        @media (min-width: 768px) { .chat-send { width: 52px; height: 52px; min-width: 52px; min-height: 52px; } }
        .chat-send:hover:not(:disabled) { opacity: .9; }
        .chat-send:disabled { opacity: .5; cursor: not-allowed; }
        .chat-typing { padding: 12px 16px; border-radius: 16px; background: var(--surface); border: 1px solid var(--border); font-size: 13px; color: var(--sub); display: inline-flex; align-items: center; gap: 6px; }
        .chat-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: chatDot 1.2s ease-in-out infinite both; }
        .chat-typing span:nth-child(2) { animation-delay: .2s; }
        .chat-typing span:nth-child(3) { animation-delay: .4s; }
        @keyframes chatDot { 0%, 80%, 100% { opacity: .4; transform: scale(.9); } 40% { opacity: 1; transform: scale(1); } }
        .chat-login-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px 16px;
          margin: 12px 0;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,.06);
        }
        @media (min-width: 768px) {
          .chat-login-card { padding: 28px 24px; margin: 20px 0; border-radius: 18px; }
        }
        .chat-login-card h3 { font-family: var(--serif); font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
        @media (min-width: 768px) { .chat-login-card h3 { font-size: 17px; } }
        .chat-login-card p { font-size: 13px; color: var(--sub); line-height: 1.6; margin-bottom: 20px; }
        .chat-login-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .chat-login-btn {
          padding: 12px 20px;
          min-height: 48px;
          border-radius: 12px;
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity .15s;
        }
        @media (min-width: 768px) {
          .chat-login-btn { padding: 14px 24px; min-height: 52px; font-size: 15px; }
        }
        .chat-login-btn.primary { border: none; background: #2C2A26; color: #F2EDE4; }
        .chat-login-btn.secondary { border: 1px solid var(--border2); background: transparent; color: var(--sub); }
        .chat-login-btn:hover { opacity: .9; }
        .chat-login-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 90;
          background: rgba(0, 0, 0, 0.38);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }
        .chat-login-modal {
          width: 100%;
          max-width: 360px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.22);
          padding: 18px 16px 14px;
          text-align: center;
        }
        @media (min-width: 768px) {
          .chat-login-modal {
            max-width: 420px;
            padding: 22px 20px 18px;
          }
        }
        .chat-login-modal h3 {
          font-family: var(--serif);
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 10px;
        }
        .chat-login-modal p {
          font-size: 13px;
          color: var(--sub);
          line-height: 1.65;
          margin-bottom: 16px;
        }
        .chat-login-modal-close {
          border: 1px solid var(--border2);
          background: transparent;
          color: var(--sub);
          border-radius: 10px;
          min-height: 42px;
          padding: 0 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .chat-main-shell--no-saju {
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          min-height: 0;
        }
        .chat-no-saju-screen {
          width: 100%;
          max-width: 400px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px 20px 24px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,.06);
        }
        @media (min-width: 768px) {
          .chat-main-shell--no-saju {
            padding: 32px 24px;
          }
          .chat-no-saju-screen {
            max-width: 420px;
            padding: 32px 28px 28px;
            border-radius: 18px;
            box-shadow: 0 16px 40px rgba(0,0,0,0.08);
          }
        }
        .chat-no-saju-title {
          font-family: var(--serif);
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 10px;
          line-height: 1.35;
        }
        @media (min-width: 768px) {
          .chat-no-saju-title { font-size: 18px; margin-bottom: 12px; }
        }
        .chat-no-saju-desc {
          font-size: 13px;
          color: var(--sub);
          line-height: 1.65;
          margin: 0 0 22px;
        }
        @media (min-width: 768px) {
          .chat-no-saju-desc { font-size: 14px; margin-bottom: 24px; }
        }
        .chat-no-saju-btn {
          width: 100%;
          max-width: 280px;
          padding: 14px 20px;
          min-height: 48px;
          border: none;
          border-radius: 12px;
          background: #2C2A26;
          color: #F2EDE4;
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity .15s;
        }
        @media (min-width: 768px) {
          .chat-no-saju-btn {
            min-height: 52px;
            font-size: 15px;
            padding: 14px 24px;
          }
        }
        .chat-no-saju-btn:hover { opacity: .92; }
        .chat-error-banner {
          padding: 12px 16px;
          margin: 0 16px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          font-size: 13px;
          color: #b91c1c;
        }
        .chat-error-actions { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
        .chat-error-btn {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: inherit;
          text-decoration: underline;
        }
        .chat-error-retry { font-weight: 600; }
        .chat-msg-bubble-wrap { position: relative; }
        .chat-msg.assistant .chat-msg-bubble-wrap {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
          max-width: 100%;
        }
        .chat-msg-bubble-row { position: relative; align-self: stretch; }
        .chat-cheoneul-reference-card {
          width: 100%;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: 0 2px 10px rgba(0,0,0,.04);
          padding: 10px 12px 12px;
        }
        .chat-cheoneul-reference-card-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--sub);
          letter-spacing: 0.02em;
          margin: 0 0 8px;
        }
        .chat-cheoneul-reference-card .chat-cheoneul-table {
          margin-top: 0;
        }
        .chat-msg-copy {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: none;
          background: rgba(0,0,0,.06);
          color: var(--sub);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity .15s;
        }
        .chat-msg-bubble-wrap:hover .chat-msg-copy { opacity: 1; }
        .chat-msg.user .chat-msg-copy { right: auto; left: 8px; background: rgba(255,255,255,.2); color: rgba(255,255,255,.9); }
        /* 삭제 확인 모달 */
        .chat-confirm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }
        .chat-confirm-modal {
          width: 100%;
          max-width: 360px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.18);
          padding: 14px 14px 12px;
        }
        .chat-confirm-title {
          font-size: 14px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 6px;
          font-family: var(--serif);
        }
        .chat-confirm-desc {
          font-size: 12px;
          color: var(--sub);
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .chat-confirm-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .chat-confirm-btn {
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .chat-confirm-btn.cancel {
          background: transparent;
          border: 1px solid var(--border2);
          color: var(--sub);
        }
        .chat-confirm-btn.danger {
          background: #2c2a26;
          border: 1px solid #2c2a26;
          color: #fdf9f1;
        }
      `}</style>

      <div className="chat-wrap">
        <header className="chat-header">
          <div className="chat-header-left">
            <div className="chat-logo">
              <img
                src="/images/yin-yang-logo.png"
                alt="한양사주"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  (e.currentTarget.parentElement as HTMLElement).textContent = "☯";
                }}
              />
            </div>
            <span className="chat-title">한양사주 AI</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* 모바일: 세션 드로어 토글 */}
            <button
              type="button"
              className="chat-back"
              aria-label="대화 목록"
              onClick={() => setShowMobileSidebar(true)}
              style={{ display: "inline-flex" }}
            >
              <Icon icon="mdi:chat-outline" width={20} />
            </button>
            {/* PC: 마이페이지/로그인 이동 */}
            <button
              type="button"
              className="chat-back"
              aria-label="메뉴"
              onClick={goMenu}
            >
              <Icon icon="mdi:menu" width={22} />
            </button>
          </div>
        </header>

        {chatError && (
          <div className="chat-error-banner">
            {chatError}
            <div className="chat-error-actions">
              <button type="button" onClick={() => setChatError(null)} className="chat-error-btn">
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  setChatError(null);
                  lastUserMessageRef.current && handleRetryRef.current?.(lastUserMessageRef.current);
                }}
                className="chat-error-btn chat-error-retry"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {!hydrated ? (
          <div className="chat-main" style={{ alignItems: "center", justifyContent: "center" }}>
            <p className="chat-initial-greeting">불러오는 중...</p>
          </div>
        ) : (
          <div className="chat-layout">
            {pendingDeleteId && (
              <div
                className="chat-confirm-backdrop"
                onClick={() => setPendingDeleteId(null)}
                role="presentation"
              >
                <div
                  className="chat-confirm-modal"
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                >
                  <div className="chat-confirm-title">대화를 삭제할까요?</div>
                  <div className="chat-confirm-desc">
                    삭제하면 이 대화 기록은 되돌릴 수 없어요.
                  </div>
                  <div className="chat-confirm-actions">
                    <button
                      type="button"
                      className="chat-confirm-btn cancel"
                      onClick={() => setPendingDeleteId(null)}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="chat-confirm-btn danger"
                      onClick={() => {
                        removeSession(pendingDeleteId);
                        setPendingDeleteId(null);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 모바일 세션 드로어 */}
            {showMobileSidebar && (
              <>
                <div
                  className="chat-mobile-drawer-backdrop"
                  onClick={() => setShowMobileSidebar(false)}
                />
                <aside className="chat-mobile-drawer">
                  <div className="chat-sidebar-header">
                    <span className="chat-sidebar-title">최근 대화</span>
                    <button
                      type="button"
                      className="chat-sidebar-new"
                      onClick={() => {
                        setChatError(null);
                        startNewChat();
                      }}
                    >
                      + 새 대화
                    </button>
                  </div>
                  <div className="chat-sidebar-search">
                    <input
                      placeholder="대화 검색"
                      value={searchQuery}
                      onChange={(e) => search(e.target.value)}
                    />
                  </div>
                  <div className="chat-sidebar-list">
                    {(searchQuery ? searchResults : sessions).map((s) => {
                      const isActive = s.id === currentId;
                      const title =
                        s.title ||
                        (s.messages[0]?.text
                          ? s.messages[0].text.slice(0, 20)
                          : "새 대화");
                      const lastText = s.messages[s.messages.length - 1]?.text ?? "";
                      return (
                        <div
                          key={s.id}
                          className={`chat-sidebar-item ${isActive ? "active" : ""}`}
                          onClick={() => {
                            selectSession(s.id);
                            setShowMobileSidebar(false);
                          }}
                        >
                          <div className="chat-sidebar-item-main">
                            <div className="chat-sidebar-item-title">{title}</div>
                            {lastText && (
                              <div className="chat-sidebar-item-sub">
                                {lastText.slice(0, 26)}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className="chat-sidebar-item-delete"
                            aria-label="대화 삭제"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingDeleteId(s.id);
                            }}
                          >
                            <Icon icon="mdi:trash-can-outline" width={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </aside>
              </>
            )}

            {/* 좌측 세션 리스트 (태블릿 이상) */}
            <aside className="chat-sidebar">
              <div className="chat-sidebar-header">
                <span className="chat-sidebar-title">최근 대화</span>
                <button
                  type="button"
                  className="chat-sidebar-new"
                  onClick={() => {
                    setChatError(null);
                    startNewChat();
                  }}
                >
                  + 새 대화
                </button>
              </div>
              <div className="chat-sidebar-search">
                <input
                  placeholder="대화 검색"
                  value={searchQuery}
                  onChange={(e) => search(e.target.value)}
                />
              </div>
              <div className="chat-sidebar-list">
                {(searchQuery ? searchResults : sessions).map((s) => {
                  const isActive = s.id === currentId;
                  const title =
                    s.title ||
                    (s.messages[0]?.text
                      ? s.messages[0].text.slice(0, 20)
                      : "새 대화");
                  const lastText = s.messages[s.messages.length - 1]?.text ?? "";
                  return (
                    <div
                      key={s.id}
                      className={`chat-sidebar-item ${isActive ? "active" : ""}`}
                      onClick={() => selectSession(s.id)}
                    >
                      <div className="chat-sidebar-item-main">
                        <div className="chat-sidebar-item-title">{title}</div>
                        {lastText && (
                          <div className="chat-sidebar-item-sub">
                            {lastText.slice(0, 26)}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="chat-sidebar-item-delete"
                        aria-label="대화 삭제"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeleteId(s.id);
                        }}
                      >
                        <Icon icon="mdi:trash-can-outline" width={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* 우측 채팅 영역 */}
            <main
              className={`chat-main-shell${showNoSajuScreen ? " chat-main-shell--no-saju" : ""}`}
            >
              {showNoSajuScreen ? (
                <div className="chat-no-saju-screen">
                  <p className="chat-no-saju-title">만세력을 먼저 등록해주세요</p>
                  <p className="chat-no-saju-desc">
                    내 사주를 등록하면 AI가 맞춤형으로 분석해드려요
                  </p>
                  <button
                    type="button"
                    className="chat-no-saju-btn"
                    onClick={() => router.push("/add")}
                  >
                    만세력 등록하러 가기
                  </button>
                </div>
              ) : (
                <>
                  {isLoggedIn && savedSajuName?.trim() && (
                    <div className="chat-saju-badge" role="status" aria-live="polite">
                      <span className="chat-saju-badge-star" aria-hidden>
                        ✦
                      </span>
                      {sajuBadgeDayKr
                        ? `${savedSajuName}님 (${sajuBadgeDayKr}일주)의 사주로 대화 중`
                        : `${savedSajuName}님의 사주로 대화 중`}
                    </div>
                  )}
                  <ChatContent
                    key={currentId || "chat-hydrated"}
                    sessionId={currentId}
                    initialSessionMessages={currentSession?.messages ?? []}
                    sessionTitle={currentSession?.title ?? ""}
                    transport={transport}
                    onError={setChatError}
                    isLoggedIn={isLoggedIn}
                    showLoginCard={showLoginCard}
                    setShowLoginCard={setShowLoginCard}
                    router={router}
                    lastUserMessageRef={lastUserMessageRef}
                    handleRetryRef={handleRetryRef}
                    savedSajuName={savedSajuName}
                    replaceMessages={replaceMessages}
                    ensureTitleFromFirstMessage={ensureTitleFromFirstMessage}
                  />
                </>
              )}
            </main>
          </div>
        )}
      </div>
    </>
  );
}

type ChatContentProps = {
  sessionId: string | null;
  initialSessionMessages: SessionMessage[];
  replaceMessages: (sessionId: string, msgs: SessionMessage[]) => void;
  ensureTitleFromFirstMessage: (sessionId: string, firstUserText: string) => void;
  transport: DefaultChatTransport<any>;
  onError: (msg: string | null) => void;
  isLoggedIn: boolean;
  showLoginCard: boolean;
  setShowLoginCard: (v: boolean) => void;
  router: ReturnType<typeof useRouter>;
  lastUserMessageRef: React.MutableRefObject<string | null>;
  handleRetryRef: React.MutableRefObject<((text: string) => void) | null>;
  savedSajuName: string | null;
  sessionTitle: string;
};

function hasTwoFollowupQuestions(text: string): boolean {
  const sectionSplit = text.split(/###\s*이어서 보면 좋은 질문/i);
  const target = sectionSplit.length > 1 ? sectionSplit[sectionSplit.length - 1] : text;
  const numbered = target.match(/^\s*(?:[-*]\s+)?\d+\.\s+.+$/gm) || [];
  return numbered.length >= 2;
}

/** 모델이 후속 질문을 빠뜨렸을 때만 쓰는 폴백. 사주·명리와 무관한 자기계발 문장 금지. */
function buildSajuAwareFollowupQuestions(
  lastUserText: string,
  lang: "ko" | "en",
  hasSajuProfile: boolean,
): [string, string] {
  const q = lastUserText.trim();

  if (lang === "en") {
    if (/천을|天乙|noble|gui.?ren/i.test(q)) {
      return hasSajuProfile
        ? [
            "Can you check my chart for 天乙貴人 and which pillar (year/month/day/hour) it sits in?",
            "If 天乙貴人 clashes or combines with another branch, how is that usually read?",
          ]
        : [
            "What birth data do I need to tell you so you can see if I have 天乙貴人 in my pillars?",
            "How does the pillar placement (year vs month vs day vs hour) change how 天乙貴人 shows up?",
          ];
    }
    if (/empty|空亡|kong wang/i.test(q)) {
      return hasSajuProfile
        ? [
            "Where is 空亡 in my chart and what does it tend to soften?",
            "How do combinations or clashes involving the empty branch change the reading?",
          ]
        : [
            "What do you need from me to locate 空亡 in a ba zi chart?",
            "Is 空亡 always “bad,” or can it be useful in some structures?",
          ];
    }
    return hasSajuProfile
      ? [
          "Which element or ten-god pattern stands out strongest in my four pillars?",
          "How should I read this year's annual luck (liu nian) together with my da yun timing?",
        ]
      : [
          "What birth details (date, solar/lunar, gender, time if known) do you need to cast my four pillars?",
          "If I'm new to ba zi, which pillar—year, month, day, or hour—should I understand first?",
        ];
  }

  // Korean
  if (/천을귀인|천을 귀인|천을/.test(q)) {
    return hasSajuProfile
      ? [
          "내 만세력에서 천을귀인이 있는지, 년·월·일·시 중 어디에 붙는지 봐줄 수 있어?",
          "천을귀인이 다른 지지랑 합이나 충으로 이어지면 보통 어떻게 읽으면 돼?",
        ]
      : [
          "천을귀인이 내 사주에 있는지 보려면 생년월일·양력음력·성별·출생시각을 어떻게 알려주면 돼?",
          "천을귀인이 년·월·일·시 중 어디에 있을 때 체감이 달라지는 편이야?",
        ];
  }
  if (/공망/.test(q)) {
    return hasSajuProfile
      ? [
          "내 사주에서 공망이 어디에 걸리는지, 어떤 기운이 비어 보이기 쉬운지 짚어줄 수 있어?",
          "공망이 있는 글자가 합·충과 만나면 해석이 어떻게 달라져?",
        ]
      : [
          "공망을 보려면 일간 기준으로 어떤 정보가 필요해?",
          "공망은 무조건 안 좋은 거야, 아니면 구조에 따라 다르기도 해?",
        ];
  }
  if (/도화|역마|화개|원진|백호|겁살|재살|월덕|천덕/.test(q)) {
    return hasSajuProfile
      ? [
          "같은 신살이 내 만세력 년·월·일·시 중 어디에 있을 때 달라 보여?",
          "이 신살이 합·충이나 다른 신살과 겹치면 만세력에서 어떻게 읽으면 돼?",
        ]
      : [
          "이 신살을 내 사주에서 찾으려면 생년월일·양력음력·성별·시간을 어떻게 알려줘야 해?",
          "이 신살이랑 자주 같이 보는 다른 신살·십성 조합이 뭐야?",
        ];
  }
  if (/십성|비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인/.test(q)) {
    return hasSajuProfile
      ? [
          "내 일간 기준으로 이 십성이 년·월·일·시 중 어디에 많이 깔리면 만세력에서 체감이 커?",
          "이 십성이 다른 천간·지지랑 합이나 극으로 묶이면 사주에서 어떻게 읽어?",
        ]
      : [
          "십성을 내 사주에 대입하려면 일간(일주의 윗글자)을 알아야 하는데, 어떤 정보가 필요해?",
          "같은 십성이라도 월주와 시주 중 어디에 있을 때 만세력 해석이 달라져?",
        ];
  }
  if (/대운|세운|합충|형파해|삼합/.test(q)) {
    return hasSajuProfile
      ? [
          "지금 말한 내용을 내 대운 흐름이랑 겹쳐 보면 어떤 점이 달라져?",
          "같은 패턴이 세운(올해·내년)에 들어올 때는 어떻게 보면 돼?",
        ]
      : [
          "대운을 보려면 성별이 왜 필요해?",
          "세운이랑 대운을 같이 볼 때 가장 먼저 보는 건 뭐야?",
        ];
  }

  return hasSajuProfile
    ? [
        "내 사주에서 가장 강한 기운은 뭐야?",
        "올해 대운이나 세운 흐름이 어떻게 되는지, 내 만세력이랑 같이 알려줄 수 있어?",
      ]
    : [
        "내 사주를 보려면 생년월일·양력음력·성별·출생 시각을 어떻게 알려주면 돼?",
        "만세력에서 년주·월주·일주·시주 중 어디부터 보면 이해하기 쉬워?",
      ];
}

function normalizeAssistantMessage(
  text: string,
  lastUserText: string,
  lang: "ko" | "en",
  hasSajuProfile: boolean,
): string {
  const trimmed = (text || "").trim();
  if (!trimmed) return text;

  const hasCoreSection = /###\s*(핵심 해석|Core Interpretation)/i.test(trimmed);
  let next = trimmed;
  if (!hasCoreSection) {
    next = lang === "en" ? `### Core Interpretation\n${next}` : `### 핵심 해석\n${next}`;
  }

  if (!hasTwoFollowupQuestions(next)) {
    const [q1, q2] = buildSajuAwareFollowupQuestions(lastUserText, lang, hasSajuProfile);
    next +=
      lang === "en"
        ? `\n\n### Follow-up Questions\n1. ${q1}\n2. ${q2}`
        : `\n\n### 이어서 보면 좋은 질문\n1. ${q1}\n2. ${q2}`;
  }
  return next;
}

function extractFollowupQuestions(text: string): { mainText: string; questions: [string, string] | null } {
  const sectionSplit = text.split(/###\s*(이어서 보면 좋은 질문|Follow-up Questions)/i);
  if (sectionSplit.length < 2) {
    return { mainText: text, questions: null };
  }

  const mainText = sectionSplit[0].trim();
  const tail = sectionSplit[sectionSplit.length - 1];
  const numbered = tail.match(/^\s*(?:[-*]\s+)?\d+\.\s+(.+)$/gm) || [];
  const questions = numbered
    .map((line) => line.replace(/^\s*(?:[-*]\s+)?\d+\.\s+/, "").trim())
    .filter(Boolean)
    .slice(0, 2);

  if (questions.length < 2) {
    return { mainText: text, questions: null };
  }

  return { mainText, questions: [questions[0], questions[1]] };
}

function ChatContent({
  sessionId,
  initialSessionMessages,
  replaceMessages,
  ensureTitleFromFirstMessage,
  transport,
  onError,
  isLoggedIn,
  showLoginCard,
  setShowLoginCard,
  router,
  lastUserMessageRef,
  handleRetryRef,
  savedSajuName,
  sessionTitle,
}: ChatContentProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastUserMsgRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  /** 유저 전송 직후 잠깐: 스트리밍 자동 스크롤이 말풍선 상단 정렬을 덮어쓰지 않도록 */
  const lastUserSendAtRef = useRef(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const { lang } = useLang();

  // 세션이 아직 선택되지 않은 경우(예: 초기화 이전)에는 빈 배열로 시작
  const initialMessages = useMemo(
    () =>
      (initialSessionMessages || []).map((m) => ({
        role: m.role,
        parts: [{ type: "text", text: m.text }],
      })),
    [initialSessionMessages],
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: initialMessages,
    onError: (err) => {
      onError(err?.message ?? "응답을 불러오는 중 오류가 났어요. 잠시 후 다시 시도해 주세요.");
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // 마지막 유저 메시지 인덱스 (findLastIndex 대신 호환성 있게 계산)
  let lastUserIndex = -1;
  for (let j = messages.length - 1; j >= 0; j--) {
    if ((messages[j] as any).role === "user") {
      lastUserIndex = j;
      break;
    }
  }
  let lastAssistantIndex = -1;
  for (let j = messages.length - 1; j >= 0; j--) {
    if ((messages[j] as any).role === "assistant") {
      lastAssistantIndex = j;
      break;
    }
  }

  // useChat 메시지를 세션 스토리지와 동기화 (무한 루프 방지용 스냅샷)
  const lastSnapshotRef = useRef<string>("");
  // 세션 전환 시 이전 대화 스냅샷이 남아 잘못 스킵되거나 연쇄 업데이트가 나지 않도록 초기화
  useEffect(() => {
    lastSnapshotRef.current = "";
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    const mapped: SessionMessage[] = messages.map((m, idx) => ({
      id: (m as any).id ?? `${sessionId}-${idx}`,
      role: m.role as "user" | "assistant",
      text: getMessageText(m as any),
      createdAt: Date.now(),
    }));

    // role/text 기준으로만 스냅샷을 비교해 불필요한 업데이트 방지
    const snapshot = JSON.stringify(
      mapped.map((m) => ({
        role: m.role,
        text: m.text,
      })),
    );
    if (snapshot === lastSnapshotRef.current) return;
    lastSnapshotRef.current = snapshot;
    replaceMessages(sessionId, mapped);
  }, [messages, replaceMessages, sessionId]);

  // 서버(DB)에 채팅 로그 저장 (스트리밍 완료 후 best-effort)
  const lastRemoteSnapshotRef = useRef<string>("");
  const prevIsLoadingRef = useRef<boolean>(false);
  useEffect(() => {
    if (!sessionId) return;

    // streaming/submit 중에는 저장하지 않음(중간 토큰 저장 방지)
    if (isLoading) {
      prevIsLoadingRef.current = true;
      return;
    }

    if (!prevIsLoadingRef.current) return; // 직전이 loading이 아니면(초기/idle 유지) 저장 스킵

    const snapshot = JSON.stringify(
      messages.map((m) => ({
        role: m.role,
        text: getMessageText(m as any),
      })),
    );

    if (!snapshot || snapshot === lastRemoteSnapshotRef.current) {
      prevIsLoadingRef.current = false;
      return;
    }
    lastRemoteSnapshotRef.current = snapshot;
    prevIsLoadingRef.current = false;

    const payload = {
      sessionId,
      title: sessionTitle || "",
      messages: messages
        .map((m, idx) => ({
          idx,
          role: m.role,
          content: getMessageText(m as any),
        }))
        .filter((m) => m.content && (m.role === "user" || m.role === "assistant")),
    };

    fetch(`${BACKEND_API_BASE}/api/chat-logs/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).catch(() => {
      // 로그 저장은 UX에 영향을 주지 않게 best-effort로 처리
    });
  }, [isLoading, messages, sessionId, sessionTitle]);

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom > 150) {
      isUserScrollingRef.current = true;
      setShowScrollBtn(true);
    } else {
      isUserScrollingRef.current = false;
      setShowScrollBtn(false);
    }
  };

  // 맨 아래로 스크롤 (최신 메시지로 버튼 등)
  const scrollToBottom = (behavior: "smooth" | "instant" | "auto" = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior: behavior as ScrollBehavior, block: "end" });
  };

  // 세션 전환 시: 대화 하단으로 (컴포넌트 key로 리마운트될 때 포함)
  useEffect(() => {
    isUserScrollingRef.current = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (messages.length === 0) return;
        bottomRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
      });
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 세션 바뀔 때만 맞춤
  }, [sessionId]);

  // 마지막 메시지가 user일 때(전송 직후): 말풍선이 보이도록 상단 근처로 (모바일 ChatGPT 느낌)
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last?.role !== "user") return;
    const tid = window.setTimeout(() => {
      requestAnimationFrame(() => {
        lastUserMsgRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      });
    }, 50);
    return () => clearTimeout(tid);
  }, [messages]);

  // 스트리밍 중: 답변이 길어질 때 맨 아래로 즉시 따라가기 (토큰마다 smooth 금지)
  useEffect(() => {
    if (!isLoading || isUserScrollingRef.current) return;
    if (Date.now() - lastUserSendAtRef.current < 200) return;
    bottomRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
  }, [messages, isLoading]);

  // 스트리밍 종료 직후: 하단 근처에 있으면 한 번 정리 스크롤
  useEffect(() => {
    if (isLoading) return;
    const el = listRef.current;
    if (!el || isUserScrollingRef.current) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (dist < 320) {
      scrollToBottom("smooth");
    }
  }, [isLoading]);

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;
    onError(null);
    const trimmed = text.trim();
    lastUserMessageRef.current = trimmed;
    handleRetryRef.current = (t: string) => sendMessage({ text: t });
    lastUserSendAtRef.current = Date.now();

    let shouldIncrementGuestCount = false;
    if (GUEST_LIMIT_ENABLED && !isLoggedIn) {
      const guestCount = parseInt(localStorage.getItem("guest_chat_count") || "0", 10);
      if (guestCount >= GUEST_LIMIT) {
        setShowLoginCard(true);
        return;
      }
      shouldIncrementGuestCount = true;
    }

    // 첫 유저 메시지로 세션 제목 설정
    if (sessionId && trimmed) {
      ensureTitleFromFirstMessage(sessionId, trimmed);
    }

    try {
      await sendMessage({ text: trimmed });
      window.setTimeout(() => {
        lastUserMsgRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, 50);
      if (shouldIncrementGuestCount) {
        const guestCount = parseInt(localStorage.getItem("guest_chat_count") || "0", 10);
        localStorage.setItem("guest_chat_count", String(guestCount + 1));
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : "응답을 불러오는 중 오류가 났어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const sending = isLoading;
  const hasUserMessage = messages.some((m) => m.role === "user");
  const isInitialView = messages.filter((m) => m.role === "user").length === 0 && !showLoginCard;

  return (
    <>
      <div className="chat-main">
        <div className="chat-list" ref={listRef} onScroll={handleScroll}>
          {isInitialView ? (
            <div className="chat-initial-area">
              <div
                className="chat-initial-icon"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  background: "var(--surface2)",
                  overflow: "hidden",
                }}
              >
                <img
                  src="/images/yin-yang-logo.png"
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.textContent = "☯";
                  }}
                />
              </div>
              <p className="chat-initial-greeting">
                <span style={{ opacity: 0.8 }}>✦</span> {getTimeBasedGreeting(lang)}
                {savedSajuName ? (lang === "en" ? `, ${savedSajuName}` : `, ${savedSajuName}님`) : ""}
              </p>
              <p className="chat-initial-prompt">
                {lang === "en" ? "What can I help you with today?" : "오늘 어떤 도움을 드릴까요?"}
              </p>
            </div>
          ) : (
            <>
              {messages.map((m, i) => {
                const text = getMessageText(m);
                const isAI = m.role === "assistant";
                const prevUserText = i > 0 ? getMessageText(messages[i - 1]) : "";
                const normalizedText = isAI
                  ? normalizeAssistantMessage(text, prevUserText, lang, Boolean(savedSajuName?.trim()))
                  : text;
                const followup = isAI ? extractFollowupQuestions(normalizedText) : { mainText: normalizedText, questions: null };
                const isLastUser = m.role === "user" && lastUserIndex === i;
                const isLastAssistant = isAI && lastAssistantIndex === i;
                const stableKey =
                  (m as { id?: string }).id ?? `${sessionId ?? "s"}-${i}-${m.role}`;
                return (
                  <div
                    key={stableKey}
                    className={`chat-msg ${m.role}`}
                    ref={isLastUser ? lastUserMsgRef : undefined}
                  >
                    <div className="chat-msg-bubble-wrap">
                      {isAI && /천을\s*귀인/.test(normalizedText) && (
                        <aside
                          className="chat-cheoneul-reference-card"
                          role="region"
                          aria-label="천을귀인 일간별 지지 조견표"
                        >
                          <p className="chat-cheoneul-reference-card-label">천을귀인 · 일간별 지지 (참고)</p>
                          <div className="chat-cheoneul-table">{CHEONEUL_TABLE}</div>
                        </aside>
                      )}
                      <div className="chat-msg-bubble-row">
                        <div className="chat-msg-bubble">
                          <MarkdownMessage
                            text={isAI ? stripSinsalTable(followup.mainText) : followup.mainText}
                            isAI={isAI}
                          />
                          {isLastAssistant && followup.questions && (
                            <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                              <div style={{ fontSize: 11, color: "#6B5F4E" }}>
                                이런 것도 궁금하지 않으세요?
                              </div>
                              {followup.questions.map((q) => (
                                <button
                                  key={q}
                                  type="button"
                                  disabled={sending}
                                  onClick={() => handleSubmit(q)}
                                  style={{
                                    width: "100%",
                                    background: "#F5F1EA",
                                    border: "1px solid #D4C9B8",
                                    borderRadius: 10,
                                    color: "#4A3F30",
                                    fontSize: 13,
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    cursor: sending ? "not-allowed" : "pointer",
                                  }}
                                >
                                  <span aria-hidden>{"→"}</span>
                                  <span>{q}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="chat-msg-copy"
                          aria-label="복사"
                          onClick={() => {
                            navigator.clipboard?.writeText(followup.mainText).catch(() => {});
                          }}
                        >
                          <Icon icon="mdi:content-copy" width={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {sending && (
                <div className="chat-msg assistant">
                  <div className="chat-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="chat-input-wrap">
        {!hasUserMessage && !showLoginCard && (
          <div className="chat-quick-chips">
            {(lang === "en" ? QUICK_PROMPTS_EN : QUICK_PROMPTS_KO).map((q) => (
              <button
                key={q.label}
                type="button"
                className="chat-quick-chip"
                onClick={() => handleSubmit(q.text)}
              >
                {q.label}
              </button>
            ))}
          </div>
        )}
        <ChatInput
          disabled={sending || showLoginCard}
          onSubmit={handleSubmit}
          placeholder={lang === "en" ? "Ask anything about your Saju" : "무엇이든 물어보세요"}
        />
      </div>

      {showLoginCard && (
        <div className="chat-login-modal-backdrop" onClick={() => setShowLoginCard(false)}>
          <div className="chat-login-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {lang === "en"
                ? "🔮 Want deeper, personalized analysis?"
                : "🔮 더 깊은 분석을 원하신다면"}
            </h3>
            <p>
              {lang === "en"
                ? "After 3 guest chats, login is required. Save your birth data to get personalized Saju readings."
                : (
                  <>
                    게스트 채팅은 3회까지 이용 가능해요.
                    <br />
                    로그인 후 생년월일을 등록하면
                    <br />
                    더 정확한 맞춤 해석을 받을 수 있어요.
                  </>
                )}
            </p>
            <div className="chat-login-btns">
              <button type="button" className="chat-login-btn primary" onClick={() => router.push("/start")}>
                {lang === "en" ? "Log in" : "로그인하기"}
              </button>
              <button type="button" className="chat-login-modal-close" onClick={() => setShowLoginCard(false)}>
                {lang === "en" ? "Close" : "닫기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScrollBtn && (
        <button
          type="button"
          onClick={() => {
            isUserScrollingRef.current = false;
            scrollToBottom("smooth");
            setShowScrollBtn(false);
          }}
          style={{
            position: "fixed",
            right: 16,
            bottom: 90,
            zIndex: 40,
            borderRadius: 999,
            border: "1px solid var(--border2)",
            background: "var(--surface)",
            padding: "8px 12px",
            fontSize: 12,
            color: "var(--text)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            cursor: "pointer",
          }}
        >
          ↓ 최신 메시지로
        </button>
      )}
    </>
  );
}

function ChatInput({
  disabled,
  onSubmit,
  placeholder = "무엇이든 물어보세요",
}: {
  disabled: boolean;
  onSubmit: (text: string) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const t = input.trim();
    if (!t || disabled) return;
    setInput("");
    onSubmit(t);
    // 전송 후 textarea 높이 초기화
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // 입력창 자동 높이 조절 (최대 max-height 내에서)
  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="chat-input-row">
      <textarea
        ref={textareaRef}
        className="chat-input"
        placeholder={placeholder}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          adjustHeight();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={1}
        disabled={disabled}
      />
      <button
        type="button"
        className="chat-send"
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        aria-label="보내기"
      >
        <Icon icon="mdi:send" width={20} />
      </button>
    </div>
  );
}
