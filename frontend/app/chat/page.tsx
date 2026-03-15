"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAuthHeaders } from "@/lib/auth";
import { getSavedSajuList } from "@/lib/sajuStorage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME_MESSAGE =
  "안녕하세요. 한양사주 AI입니다. 사주, 오늘의 운세, 고민 등 무엇이든 편하게 물어보세요. 전문 용어 없이 쉽게 설명해 드릴게요.";

export default function ChatPage({
  params,
}: {
  params?: Promise<Record<string, string | string[]>>;
}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setSending(true);

    const body = {
      messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      saju: (() => {
        const saved = getSavedSajuList();
        const first = saved?.[0];
        if (!first) return undefined;
        return { result: first.result, name: first.name };
      })(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { detail?: string };
        throw new Error(errData?.detail || `서버 오류 (${res.status})`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error("스트리밍을 지원하지 않습니다.");
      }

      let buffer = "";
      let fullContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;
            try {
              const data = JSON.parse(payload) as { content?: string; error?: string };
              if (data.error) throw new Error(data.error);
              if (typeof data.content === "string") {
                fullContent += data.content;
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last?.role === "assistant") {
                    next[next.length - 1] = { ...last, content: fullContent };
                  } else {
                    next.push({ role: "assistant", content: fullContent });
                  }
                  return next;
                });
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

      if (!fullContent) {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant" && last.content === "") {
            next[next.length - 1] = { ...last, content: "답변을 생성하지 못했어요. 잠시 후 다시 시도해 주세요." };
          }
          return next;
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "연결에 실패했어요. 네트워크를 확인해 주세요.";
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700;900&family=Pretendard:wght@300;400;500;600;700&display=swap');

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
          --serif:     'Noto Serif KR', serif;
          --sans:      'Pretendard', -apple-system, sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: var(--bg); color: var(--text); font-family: var(--sans); }

        .chat-wrap {
          max-width: 480px;
          margin: 0 auto;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }

        @media (min-width: 768px) {
          .chat-wrap {
            max-width: 720px;
            min-height: 100vh;
            box-shadow: 0 0 0 1px var(--border);
          }
        }

        .chat-header {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
        }

        .chat-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-logo {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          background: var(--surface2);
        }

        .chat-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .chat-title {
          font-family: var(--serif);
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.02em;
        }

        .chat-back {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid var(--border2);
          background: transparent;
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 500;
          color: var(--sub);
          cursor: pointer;
          transition: background .15s;
        }
        .chat-back:hover { background: var(--surface2); }

        .chat-list {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 16px;
          padding-bottom: 24px;
        }

        @media (min-width: 768px) {
          .chat-list { padding: 24px; padding-bottom: 32px; }
        }

        .chat-msg {
          display: flex;
          margin-bottom: 16px;
          max-width: 85%;
        }

        .chat-msg.user {
          margin-left: auto;
          flex-direction: row-reverse;
        }

        .chat-msg-bubble {
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.6;
          word-break: break-word;
        }

        .chat-msg.assistant .chat-msg-bubble {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text);
          border-bottom-left-radius: 4px;
        }

        .chat-msg.user .chat-msg-bubble {
          background: #2C2A26;
          color: #F2EDE4;
          border-bottom-right-radius: 4px;
        }

        .chat-input-wrap {
          position: sticky;
          bottom: 0;
          padding: 12px 16px;
          padding-bottom: max(12px, env(safe-area-inset-bottom));
          background: var(--bg);
          border-top: 1px solid var(--border);
        }

        @media (min-width: 768px) {
          .chat-input-wrap {
            padding: 16px 24px;
            padding-bottom: 24px;
          }
        }

        .chat-input-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          max-width: 100%;
        }

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
          min-height: 44px;
          max-height: 120px;
          transition: border-color .15s;
        }
        .chat-input::placeholder { color: var(--muted); }
        .chat-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .chat-send {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: #2C2A26;
          color: #F2EDE4;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity .15s;
        }
        .chat-send:hover:not(:disabled) { opacity: .9; }
        .chat-send:disabled { opacity: .5; cursor: not-allowed; }

        .chat-typing {
          padding: 12px 16px;
          border-radius: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          font-size: 13px;
          color: var(--sub);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .chat-typing span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--muted);
          animation: chatDot 1.2s ease-in-out infinite both;
        }
        .chat-typing span:nth-child(2) { animation-delay: .2s; }
        .chat-typing span:nth-child(3) { animation-delay: .4s; }
        @keyframes chatDot {
          0%, 80%, 100% { opacity: .4; transform: scale(.9); }
          40% { opacity: 1; transform: scale(1); }
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
            <span className="chat-title">AI와 대화</span>
          </div>
          <button type="button" className="chat-back" onClick={() => router.push("/home")}>
            홈으로
          </button>
        </header>

        <div className="chat-list" ref={listRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              <div className="chat-msg-bubble">{m.content}</div>
            </div>
          ))}
          {sending && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
            <div className="chat-msg assistant">
              <div className="chat-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-wrap">
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              disabled={sending}
            />
            <button
              type="button"
              className="chat-send"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              aria-label="보내기"
            >
              <Icon icon="mdi:send" width={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
