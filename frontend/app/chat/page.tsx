"use client";

import { use, useRef, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { getSavedSajuList } from "@/lib/sajuStorage";
import MarkdownMessage from "../../components/MarkdownMessage";
import { useLang } from "@/contexts/LangContext";

/** 게스트 3회 제한 — 잠시 끄기: true면 3번 질문 후 로그인 유도 */
const GUEST_LIMIT_ENABLED = false;
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

/** localStorage 키 — 대화 히스토리 유지 */
const CHAT_STORAGE_KEY = "chat_messages";

const QUICK_PROMPTS_KO = [
  { label: "사주 질문", text: "사주에 대해 궁금한 게 있어요." },
  { label: "오늘의 운세", text: "오늘 제 운세를 알려주세요." },
  { label: "올해 재물운", text: "올해 재물운이 어떻게 되나요?" },
  { label: "맞는 직업", text: "나랑 잘 맞는 직업이나 방향이 궁금해요." },
  { label: "고민 상담", text: "요즘 고민이 있어서 조언이 필요해요." },
  { label: "나와 맞는 방향", text: "제게 맞는 직업이나 방향이 궁금해요." },
];

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

export default function ChatPage({
  params,
}: {
  params?: Promise<Record<string, string | string[]>>;
}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const { lang } = useLang();
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);
  const handleRetryRef = useRef<((text: string) => void) | null>(null);

  const bodyRef = useRef<{ isGuest: boolean; saju?: unknown }>({ isGuest: true, saju: undefined });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    if (!GUEST_LIMIT_ENABLED) return;
    const count = parseInt(localStorage.getItem("guest_chat_count") || "0", 10);
    if (!(localStorage.getItem("isLoggedIn") === "true") && count >= GUEST_LIMIT) {
      setShowLoginCard(true);
    }
  }, []);

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

  useEffect(() => {
    bodyRef.current = {
      isGuest: !isLoggedIn,
      saju: getSajuBody(),
    };
  }, [isLoggedIn]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages,
            ...bodyRef.current,
            lang,
          },
        }),
      }),
    [lang],
  );

  // 대화 히스토리: hydration 후에만 채팅 영역 마운트 (복원된 메시지로 useChat 초기화)
  const [savedMessages, setSavedMessages] = useState<Array<{ role: string; parts: Array<{ type: string; text?: string }> }>>([]);
  const [savedSajuName, setSavedSajuName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      setSavedMessages(raw ? JSON.parse(raw) : []);
      const first = getSavedSajuList()?.[0];
      setSavedSajuName(first?.name?.trim() ?? null);
    } catch {
      setSavedMessages([]);
    }
    setHydrated(true);
  }, []);

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
          --serif:     'Gmarket Sans', -apple-system, sans-serif;
          --sans:      'Gmarket Sans', -apple-system, sans-serif;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; font-size: 16px; }
        body { background: var(--bg); color: var(--text); font-family: var(--sans); min-width: 320px; font-size: 16px; }
        .chat-wrap {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          min-height: 100dvh;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }
        @media (min-width: 640px) {
          .chat-wrap { max-width: 640px; }
        }
        @media (min-width: 768px) {
          .chat-wrap {
            max-width: 740px;
            min-height: 100vh;
            border-radius: 12px;
            box-shadow: 0 0 0 1px var(--border), 0 8px 24px rgba(0,0,0,.06);
            overflow: hidden;
          }
        }
        @media (min-width: 1024px) {
          .chat-wrap { max-width: 820px; margin: 24px auto; min-height: calc(100vh - 48px); }
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
        .chat-back { padding: 8px 14px; min-height: 40px; border-radius: 999px; border: 1px solid var(--border2); background: transparent; font-family: var(--sans); font-size: 13px; font-weight: 500; color: var(--sub); cursor: pointer; transition: background .15s; }
        .chat-back:hover { background: var(--surface2); }
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
          <button
            type="button"
            className="chat-back"
            aria-label="메뉴"
            onClick={() => {
              if (isLoggedIn) {
                router.push("/saju-mypage");
              } else {
                router.push("/start");
              }
            }}
            style={{
              padding: 8,
              borderRadius: 10,
              border: "1px solid var(--border2)",
              background: "transparent",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)",
            }}
          >
            <Icon icon="mdi:menu" width={22} />
          </button>
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
          <ChatContent
            key="chat-hydrated"
            initialMessages={savedMessages}
            transport={transport}
            onError={setChatError}
            isLoggedIn={isLoggedIn}
            showLoginCard={showLoginCard}
            setShowLoginCard={setShowLoginCard}
            router={router}
            lastUserMessageRef={lastUserMessageRef}
            handleRetryRef={handleRetryRef}
            savedSajuName={savedSajuName}
          />
        )}
      </div>
    </>
  );
}

type ChatContentProps = {
  initialMessages: Array<{ role: string; parts: Array<{ type: string; text?: string }> }>;
  transport: DefaultChatTransport<any>;
  onError: (msg: string | null) => void;
  isLoggedIn: boolean;
  showLoginCard: boolean;
  setShowLoginCard: (v: boolean) => void;
  router: ReturnType<typeof useRouter>;
  lastUserMessageRef: React.MutableRefObject<string | null>;
  handleRetryRef: React.MutableRefObject<((text: string) => void) | null>;
  savedSajuName: string | null;
};

function ChatContent({
  initialMessages,
  transport,
  onError,
  isLoggedIn,
  showLoginCard,
  setShowLoginCard,
  router,
  lastUserMessageRef,
  handleRetryRef,
  savedSajuName,
}: ChatContentProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastUserMsgRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const { lang } = useLang();

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

  useEffect(() => {
    if (typeof window === "undefined" || messages.length === 0) return;
    try {
      const toSave = messages.map((m) => ({ role: m.role, parts: m.parts ?? [] }));
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // ignore
    }
  }, [messages]);

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

  // 맨 아래로 스크롤
  const scrollToBottom = (behavior: "smooth" | "instant" | "auto" = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior: behavior as ScrollBehavior, block: "end" });
  };

  // 세션 불러온 직후: 애니메이션 없이 즉시 맨 아래로
  useEffect(() => {
    if (messages.length === 0) return;
    scrollToBottom("instant" as ScrollBehavior);
  }, []);

  // 메시지 추가될 때:
  // - 마지막이 user면: 그 user 메시지가 화면 상단 근처로 오도록 스크롤 (Claude 스타일)
  // - 마지막이 assistant면: 유저가 스크롤 안 건드렸으면 자동으로 따라가기
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last?.role === "user") {
      lastUserMsgRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!isUserScrollingRef.current) {
      scrollToBottom("smooth");
    }
  }, [messages]);

  // 스트리밍 중 자동 스크롤 / 완료 후 동작
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    if (!isLoading) {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (dist < 300) {
        scrollToBottom("smooth");
      }
      return;
    }

    const id = setInterval(() => {
      if (!isUserScrollingRef.current) {
        scrollToBottom("smooth");
      }
    }, 120);
    return () => clearInterval(id);
  }, [isLoading]);

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;
    onError(null);
    lastUserMessageRef.current = text.trim();
    handleRetryRef.current = (t: string) => sendMessage({ text: t });

    if (GUEST_LIMIT_ENABLED) {
      const guestCount = parseInt(localStorage.getItem("guest_chat_count") || "0", 10);
      if (!isLoggedIn && guestCount >= GUEST_LIMIT) {
        setShowLoginCard(true);
        return;
      }
      if (!isLoggedIn) {
        localStorage.setItem("guest_chat_count", String(guestCount + 1));
      }
    }

    try {
      await sendMessage({ text: text.trim() });
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
                const isLastUser = m.role === "user" && lastUserIndex === i;
                return (
                  <div
                    key={i}
                    className={`chat-msg ${m.role}`}
                    ref={isLastUser ? lastUserMsgRef : undefined}
                  >
                    <div className="chat-msg-bubble-wrap">
                      <div className="chat-msg-bubble">
                        <MarkdownMessage text={text} isAI={isAI} />
                      </div>
                      <button
                        type="button"
                        className="chat-msg-copy"
                        aria-label="복사"
                        onClick={() => {
                          navigator.clipboard?.writeText(text).catch(() => {});
                        }}
                      >
                        <Icon icon="mdi:content-copy" width={14} />
                      </button>
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
              {showLoginCard && (
                <div className="chat-login-card">
                  <h3>
                    {lang === "en"
                      ? "🔮 Want deeper, personalized analysis?"
                      : "🔮 더 깊은 분석을 원하신다면"}
                  </h3>
                  <p>
                    {lang === "en" ? "Save your birth data to get" : "생년월일을 등록하면"}
                    <br />
                    {lang === "en"
                      ? "personalized Saju readings just for you."
                      : "나만의 맞춤 사주 분석을"}
                    <br />
                    {lang === "en" ? "" : "받을 수 있어요."}
                  </p>
                  <div className="chat-login-btns">
                    <button type="button" className="chat-login-btn primary" onClick={() => router.push("/start")}>
                      {lang === "en" ? "Log in" : "로그인하기"}
                    </button>
                    <button type="button" className="chat-login-btn secondary" onClick={() => router.push("/signup")}>
                      {lang === "en" ? "Sign up" : "회원가입"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {!showLoginCard && (
        <div className="chat-input-wrap">
          {!hasUserMessage && (
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
            disabled={sending}
            onSubmit={handleSubmit}
            placeholder={lang === "en" ? "Ask anything about your Saju" : "무엇이든 물어보세요"}
          />
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
