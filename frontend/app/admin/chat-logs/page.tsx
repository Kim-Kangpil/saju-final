"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";

type AdminSessionRow = {
  sessionId: string;
  title: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string;
};

type AdminChatMessage = {
  idx: number;
  role: string;
  content: string;
  createdAt: string;
};

type AdminUserRow = {
  id: number;
  provider: string;
  providerId: string;
  email: string | null;
  nickname: string | null;
  createdAt: string;
  lastLogin: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

export default function AdminChatLogsPage() {
  const { isLoggedIn, loading: authLoading } = useAuthStatus();
  const [adminSecret, setAdminSecret] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [usersOffset, setUsersOffset] = useState(0);
  const [usersLimit, setUsersLimit] = useState(50);
  const [usersBusy, setUsersBusy] = useState(false);

  const [sessions, setSessions] = useState<AdminSessionRow[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const makeAdminHeaders = (): Record<string, string> => {
    const v = adminSecret.trim();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (v) headers["X-CHAT-ADMIN-SECRET"] = v;
    return headers;
  };

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("chat_logs_admin_secret") || "";
      setAdminSecret(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("chat_logs_admin_secret", adminSecret);
    } catch {
      // ignore
    }
  }, [adminSecret]);

  useEffect(() => {
    // 내 userId 자동 채우기(관리자 권한인 경우에만 동작)
    if (authLoading) return;
    if (!isLoggedIn) return;
    if (targetUserId.trim()) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/chat-logs/me`, {
          method: "GET",
          headers: makeAdminHeaders(),
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        if (data?.userId) setTargetUserId(String(data.userId));
      } catch {
        // ignore
      }
    })();
    // adminHeader는 useMemo라 의존성 포함
  }, [authLoading, isLoggedIn, targetUserId, adminSecret]);

  async function fetchSessions() {
    setErr(null);
    setBusy(true);
    try {
      const uid = targetUserId.trim();
      if (!uid) throw new Error("targetUserId가 필요해요.");

      const res = await fetch(
        `${API_BASE}/api/admin/chat-logs/users/${encodeURIComponent(uid)}/sessions?limit=${encodeURIComponent(
          String(limit),
        )}&offset=${encodeURIComponent(String(offset))}`,
        {
          method: "GET",
          headers: makeAdminHeaders(),
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || `세션 목록 불러오기 실패 (${res.status})`);
      }
      setSessions(Array.isArray(data?.sessions) ? data.sessions : []);
      setSelectedSessionId(null);
      setMessages([]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "세션 목록을 불러오지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  async function fetchUsers() {
    setErr(null);
    setUsersBusy(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users?limit=${encodeURIComponent(String(usersLimit))}&offset=${encodeURIComponent(
          String(usersOffset),
        )}`,
        {
          method: "GET",
          headers: makeAdminHeaders(),
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || `유저 목록 불러오기 실패 (${res.status})`);
      }
      const nextUsers = Array.isArray(data?.users) ? (data.users as AdminUserRow[]) : [];
      setUsers(nextUsers);
      if (!targetUserId.trim() && nextUsers[0]?.id != null) {
        setTargetUserId(String(nextUsers[0].id));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "유저 목록을 불러오지 못했어요.");
    } finally {
      setUsersBusy(false);
    }
  }

  async function fetchSessionMessages(sessionId: string) {
    setErr(null);
    setBusy(true);
    try {
      const uid = targetUserId.trim();
      if (!uid) throw new Error("targetUserId가 필요해요.");

      const res = await fetch(
        `${API_BASE}/api/admin/chat-logs/users/${encodeURIComponent(
          uid,
        )}/session/${encodeURIComponent(sessionId)}`,
        {
          method: "GET",
          headers: makeAdminHeaders(),
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || `세션 메시지 불러오기 실패 (${res.status})`);
      }
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "세션 메시지를 불러오지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  const wrapperStyle: CSSProperties = {
    minHeight: "100vh",
    background: "#F2EDE4",
    color: "#2C2A26",
    padding: 20,
    display: "flex",
    justifyContent: "center",
  };

  const cardStyle: CSSProperties = {
    width: "100%",
    maxWidth: 980,
    background: "#FFFCF7",
    border: "1px solid #D8D2C8",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 8px 24px rgba(0,0,0,.06)",
  };

  return (
    <main style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>채팅 로그 관리자</h1>
        <p style={{ fontSize: 12, color: "#7A776F", lineHeight: 1.6, marginBottom: 16 }}>
          특정 사용자의 채팅 로그를 조회합니다. 노출 위험이 있으니 본인만 접근 가능한 환경에서 사용해주세요.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Admin Secret</label>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="X-CHAT-ADMIN-SECRET 값"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #C8C2B6",
                background: "#FFFCF7",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Target User ID</label>
            {users.length > 0 ? (
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #C8C2B6",
                  background: "#FFFCF7",
                  fontSize: 13,
                }}
              >
                {users.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.id}{" "}
                    {u.nickname ? `- ${u.nickname}` : u.email ? `- ${u.email}` : `(${u.provider}:${u.providerId})`}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: 12, color: "#7A776F" }}>
                유저 목록을 불러오면 여기서 선택할 수 있어요.
              </div>
            )}
            <input
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="예: 1"
              inputMode="numeric"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #C8C2B6",
                background: "#FFFCF7",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Limit</label>
            <input
              value={String(limit)}
              onChange={(e) => setLimit(Math.max(1, Math.min(50, Number(e.target.value) || 20)))}
              inputMode="numeric"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #C8C2B6",
                background: "#FFFCF7",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700 }}>Offset</label>
            <input
              value={String(offset)}
              onChange={(e) => setOffset(Math.max(0, Number(e.target.value) || 0))}
              inputMode="numeric"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #C8C2B6",
                background: "#FFFCF7",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={usersBusy}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "#EDE8DF",
              color: "#2C2A26",
              fontWeight: 900,
              cursor: usersBusy ? "not-allowed" : "pointer",
              opacity: usersBusy ? 0.7 : 1,
            }}
          >
            {usersBusy ? "유저 목록 중..." : "유저 목록 불러오기"}
          </button>
          <button
            type="button"
            onClick={fetchSessions}
            disabled={busy}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "#4A6741",
              color: "#fff",
              fontWeight: 800,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "불러오는 중..." : "세션 목록 불러오기"}
          </button>
          <div style={{ fontSize: 12, color: "#7A776F" }}>
            auth: {authLoading ? "loading" : isLoggedIn ? "logged-in" : "logged-out"}
          </div>
        </div>

        {err && (
          <div style={{ marginBottom: 14, padding: 10, borderRadius: 10, border: "1px solid #D4C9B8", background: "#F5F1EA" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#8B2020" }}>오류</div>
            <div style={{ fontSize: 12, color: "#4A3F30", marginTop: 4, lineHeight: 1.6 }}>{err}</div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14, alignItems: "start" }}>
          <section style={{ border: "1px solid #D8D2C8", borderRadius: 12, padding: 12, background: "#FFFCF7" }}>
            <h2 style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>세션 목록</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sessions.length === 0 ? (
                <div style={{ fontSize: 12, color: "#7A776F" }}>세션이 없습니다.</div>
              ) : (
                sessions.map((s) => {
                  const active = selectedSessionId === s.sessionId;
                  return (
                    <button
                      key={s.sessionId}
                      type="button"
                      onClick={() => {
                        setSelectedSessionId(s.sessionId);
                        fetchSessionMessages(s.sessionId);
                      }}
                      disabled={busy}
                      style={{
                        textAlign: "left",
                        borderRadius: 10,
                        border: `1px solid ${active ? "#4A6741" : "#D8D2C8"}`,
                        background: active ? "#F2EDE4" : "#fff",
                        padding: 10,
                        cursor: busy ? "not-allowed" : "pointer",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#2C2A26", marginBottom: 4 }}>
                        {s.title || "Untitled"}
                      </div>
                      <div style={{ fontSize: 11, color: "#7A776F" }}>
                        메시지: {s.messageCount}개
                      </div>
                      <div style={{ fontSize: 11, color: "#7A776F", marginTop: 4, lineHeight: 1.4 }}>
                        {s.lastMessagePreview || "(preview 없음)"}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section style={{ border: "1px solid #D8D2C8", borderRadius: 12, padding: 12, background: "#FFFCF7" }}>
            <h2 style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>선택한 세션 메시지</h2>

            {!selectedSessionId ? (
              <div style={{ fontSize: 12, color: "#7A776F" }}>왼쪽에서 세션을 선택해주세요.</div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: "#7A776F", marginBottom: 10 }}>
                  sessionId: <span style={{ fontFamily: "monospace" }}>{selectedSessionId}</span>
                </div>
                <div
                  style={{
                    maxHeight: 560,
                    overflowY: "auto",
                    paddingRight: 6,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {messages.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#7A776F" }}>메시지를 불러오는 중이거나 비어있어요.</div>
                  ) : (
                    messages.map((m, idx) => {
                      const isUser = m.role === "user";
                      return (
                        <div key={`${m.idx}-${idx}`} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 900,
                                padding: "3px 8px",
                                borderRadius: 999,
                                border: `1px solid ${isUser ? "#D4C9B8" : "#C8C2B6"}`,
                                background: isUser ? "#F5F1EA" : "#EDE8DF",
                              }}
                            >
                              {isUser ? "USER" : "ASSISTANT"}
                            </span>
                            <span style={{ fontSize: 11, color: "#7A776F" }}>#{m.idx}</span>
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#2C2A26",
                              lineHeight: 1.7,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              border: "1px solid #D8D2C8",
                              background: "#fff",
                              borderRadius: 10,
                              padding: 10,
                            }}
                          >
                            {m.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

