const STORAGE_KEY = "hanyang_chat_sessions";
const MAX_SESSIONS = 100;

 const GUEST_KEY_STORAGE_KEY = "hanyang_chat_guest_key";

 function readTokenPayload(): Record<string, unknown> | null {
   if (!isBrowser()) return null;
   try {
     const token = window.localStorage.getItem("token");
     if (!token) return null;
     const parts = token.split(".");
     if (parts.length < 2) return null;
     return JSON.parse(atob(parts[1]));
   } catch {
     return null;
   }
 }

 function getCurrentOwnerKey(): string {
   const payload = readTokenPayload();
   const userKey = payload?.email || payload?.sub || payload?.user_id;
   if (typeof userKey === "string" && userKey.trim()) {
     return `user:${userKey.trim()}`;
   }
   if (typeof userKey === "number") {
     return `user:${String(userKey)}`;
   }
   return `guest:${getOrCreateGuestKey()}`;
 }

 export function getOrCreateGuestKey(): string {
   if (!isBrowser()) return "guest-server";
   try {
     const existing = window.localStorage.getItem(GUEST_KEY_STORAGE_KEY);
     if (existing && existing.trim()) return existing;
     const next = typeof crypto !== "undefined" && crypto.randomUUID
       ? crypto.randomUUID()
       : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
     window.localStorage.setItem(GUEST_KEY_STORAGE_KEY, next);
     return next;
   } catch {
     return `guest-${Date.now()}`;
   }
 }

 function getScopedStorageKey(): string {
   return `${STORAGE_KEY}:${getCurrentOwnerKey()}`;
 }

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function loadRaw(): ChatSession[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(getScopedStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSession[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveRaw(sessions: ChatSession[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(getScopedStorageKey(), JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

// 내부에서 항상 updatedAt 기준 내림차순 정렬 유지
function sortSessions(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getChatSessions(): ChatSession[] {
  const sessions = loadRaw();
  return sortSessions(sessions);
}

export function getChatSession(id: string): ChatSession | null {
  const sessions = loadRaw();
  return sessions.find((s) => s.id === id) ?? null;
}

export function createChatSession(): ChatSession {
  const now = Date.now();
  const session: ChatSession = {
    id: isBrowser() && "crypto" in window && (window.crypto as Crypto).randomUUID
      ? window.crypto.randomUUID()
      : `local-${now}-${Math.random().toString(36).slice(2)}`,
    title: "",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  const sessions = loadRaw();
  const next = sortSessions([session, ...sessions]).slice(0, MAX_SESSIONS);
  saveRaw(next);
  return session;
}

export function setSessionTitle(id: string, firstMsg: string): void {
  if (!isBrowser()) return;
  const sessions = loadRaw();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;

  const trimmed = (firstMsg || "").trim();
  if (!trimmed) return;

  const title = trimmed.length > 20 ? trimmed.slice(0, 20) : trimmed;
  sessions[idx] = {
    ...sessions[idx],
    title,
    updatedAt: Date.now(),
  };
  saveRaw(sortSessions(sessions).slice(0, MAX_SESSIONS));
}

export function addMessage(sessionId: string, msg: Message): void {
  if (!isBrowser()) return;
  const sessions = loadRaw();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return;

  const session = sessions[idx];
  const updated: ChatSession = {
    ...session,
    messages: [...session.messages, msg],
    updatedAt: Date.now(),
  };

  sessions[idx] = updated;
  saveRaw(sortSessions(sessions).slice(0, MAX_SESSIONS));
}

export function updateLastMessage(sessionId: string, text: string): void {
  if (!isBrowser()) return;
  const sessions = loadRaw();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return;

  const session = sessions[idx];
  if (session.messages.length === 0) return;

  const msgs = [...session.messages];
  const last = msgs[msgs.length - 1];
  msgs[msgs.length - 1] = { ...last, text, createdAt: last.createdAt };

  sessions[idx] = {
    ...session,
    messages: msgs,
    updatedAt: Date.now(),
  };

  saveRaw(sortSessions(sessions).slice(0, MAX_SESSIONS));
}

// 세션 전체 메시지를 한 번에 교체 (스트리밍 이후 동기화용)
export function setSessionMessages(sessionId: string, messages: Message[]): void {
  if (!isBrowser()) return;
  const sessions = loadRaw();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return;

  const session = sessions[idx];
  const updated: ChatSession = {
    ...session,
    messages: [...messages],
    updatedAt: Date.now(),
  };

  sessions[idx] = updated;
  saveRaw(sortSessions(sessions).slice(0, MAX_SESSIONS));
}

export function deleteSession(id: string): void {
  if (!isBrowser()) return;
  try {
    const sessions = loadRaw();
    const filtered = sessions.filter((s) => s.id !== id);
    saveRaw(filtered);
  } catch {
    // ignore
  }
}

export function clearChatSessions(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(getScopedStorageKey());
  } catch {
    // ignore
  }
}

export function searchSessions(query: string): ChatSession[] {
  const q = (query || "").trim();
  if (!q) return getChatSessions();

  const lower = q.toLowerCase();
  const sessions = loadRaw();

  const filtered = sessions.filter((s) => {
    if (s.title && s.title.toLowerCase().includes(lower)) return true;
    return s.messages.some((m) => m.text.toLowerCase().includes(lower));
  });

  return sortSessions(filtered);
}

export { STORAGE_KEY, MAX_SESSIONS, GUEST_KEY_STORAGE_KEY };
