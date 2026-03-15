"use client";

import { use, useRef, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { getSavedSajuList } from "@/lib/sajuStorage";

/** 게스트 3회 제한 — 잠시 끄기: true면 3번 질문 후 로그인 유도 */
const GUEST_LIMIT_ENABLED = false;
const GUEST_LIMIT = 3;

/** 시간대별 인사 문구 */
function getTimeBasedGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "아침 인사드려요";
  if (h >= 12 && h < 17) return "오후 잘 보내고 계신가요";
  if (h >= 17 && h < 21) return "저녁 인사드려요";
  return "안녕하세요";
}

const QUICK_PROMPTS = [
  { label: "사주 질문", text: "사주에 대해 궁금한 게 있어요." },
  { label: "오늘의 운세", text: "오늘 제 운세를 알려주세요." },
  { label: "고민 상담", text: "요즘 고민이 있어서 조언이 필요해요." },
  { label: "나와 맞는 방향", text: "제게 맞는 직업이나 방향이 궁금해요." },
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
  const listRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

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
          },
        }),
      }),
    [],
  );

  const initialMessages = useMemo(() => [], []);

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: initialMessages,
    onError: (err) => {
      setChatError(err?.message ?? "응답을 불러오는 중 오류가 났어요. 잠시 후 다시 시도해 주세요.");
    },
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;
    setChatError(null);

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
      setChatError(
        e instanceof Error ? e.message : "응답을 불러오는 중 오류가 났어요. 잠시 후 다시 시도해 주세요."
      );
    }
  };

  const sending = status === "submitted" || status === "streaming";

  /** 사용자가 한 번도 메시지를 보내지 않았으면 초기 화면(중앙 프롬프트) 표시 */
  const hasUserMessage = messages.some((m) => m.role === "user");
  const isInitialView = !hasUserMessage && !showLoginCard;

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
        html { -webkit-text-size-adjust: 100%; }
        body { background: var(--bg); color: var(--text); font-family: var(--sans); min-width: 320px; }
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
          .chat-wrap { max-width: 560px; }
        }
        @media (min-width: 768px) {
          .chat-wrap {
            max-width: 720px;
            min-height: 100vh;
            border-radius: 12px;
            box-shadow: 0 0 0 1px var(--border), 0 8px 24px rgba(0,0,0,.06);
            overflow: hidden;
          }
        }
        @media (min-width: 1024px) {
          .chat-wrap { max-width: 800px; margin: 24px auto; min-height: calc(100vh - 48px); }
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
          padding: 12px 16px 20px;
          padding-left: max(16px, env(safe-area-inset-left));
          padding-right: max(16px, env(safe-area-inset-right));
          padding-bottom: max(20px, env(safe-area-inset-bottom));
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
        .chat-msg { display: flex; margin-bottom: 14px; max-width: 88%; }
        @media (min-width: 768px) {
          .chat-msg { max-width: 75%; margin-bottom: 16px; }
        }
        @media (min-width: 1024px) {
          .chat-msg { max-width: 65%; }
        }
        .chat-msg.user { margin-left: auto; flex-direction: row-reverse; }
        .chat-msg-bubble { padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.6; word-break: break-word; }
        @media (min-width: 768px) {
          .chat-msg-bubble { padding: 14px 18px; font-size: 15px; }
        }
        .chat-msg.assistant .chat-msg-bubble { background: var(--surface); border: 1px solid var(--border); color: var(--text); border-bottom-left-radius: 4px; }
        .chat-msg.user .chat-msg-bubble { background: #2C2A26; color: #F2EDE4; border-bottom-right-radius: 4px; }
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
          padding: 12px 16px;
          border-radius: 20px;
          border: 1px solid var(--border2);
          background: var(--surface);
          font-family: var(--sans);
          font-size: 15px;
          color: var(--text);
          resize: none;
          min-height: 48px;
          max-height: 120px;
          transition: border-color .15s;
        }
        @media (min-width: 768px) {
          .chat-input { padding: 14px 18px; min-height: 52px; font-size: 15px; }
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
            onClick={() => router.push("/home")}
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
          <div
            style={{
              padding: "12px 16px",
              margin: "0 16px 12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              fontSize: 13,
              color: "#b91c1c",
            }}
          >
            {chatError}
            <button
              type="button"
              onClick={() => setChatError(null)}
              style={{
                marginLeft: 8,
                textDecoration: "underline",
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                fontSize: "inherit",
              }}
            >
              닫기
            </button>
          </div>
        )}

        <div className="chat-main">
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
                <span style={{ opacity: 0.8 }}>✦</span> {getTimeBasedGreeting()}
                {(() => {
                  const first = getSavedSajuList()?.[0];
                  const name = first?.name?.trim();
                  return name ? `, ${name}님` : "";
                })()}
              </p>
              <p className="chat-initial-prompt">오늘 어떤 도움을 드릴까요?</p>
            </div>
          ) : (
            <div className="chat-list" ref={listRef}>
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role}`}>
                  <div className="chat-msg-bubble">{getMessageText(m)}</div>
                </div>
              ))}
              {sending && (!messages[messages.length - 1] || getMessageText(messages[messages.length - 1]) === "") && (
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
                  <h3>🔮 더 깊은 분석을 원하신다면</h3>
                  <p>
                    생년월일을 등록하면
                    <br />
                    나만의 맞춤 사주 분석을
                    <br />
                    받을 수 있어요.
                  </p>
                  <div className="chat-login-btns">
                    <button type="button" className="chat-login-btn primary" onClick={() => router.push("/login")}>
                      로그인하기
                    </button>
                    <button type="button" className="chat-login-btn secondary" onClick={() => router.push("/signup")}>
                      회원가입
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!showLoginCard && (
          <div className="chat-input-wrap">
            {isInitialView && (
              <div className="chat-quick-chips">
                {QUICK_PROMPTS.map((q) => (
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
            <ChatInput disabled={sending} onSubmit={handleSubmit} />
          </div>
        )}
      </div>
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

  const handleSend = () => {
    const t = input.trim();
    if (!t || disabled) return;
    setInput("");
    onSubmit(t);
  };

  return (
    <div className="chat-input-row">
      <textarea
        className="chat-input"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
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
