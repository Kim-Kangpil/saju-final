import { useEffect, useRef, useState } from "react";
import {
  ChatSession,
  Message,
  getChatSessions,
  createChatSession,
  addMessage as storageAddMessage,
  updateLastMessage as storageUpdateLastMessage,
  deleteSession as storageDeleteSession,
  searchSessions as storageSearchSessions,
} from "@/lib/chatStorage";

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatSession[]>([]);

  const initializedRef = useRef(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 초기화 (마운트 시 1회)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const all = getChatSessions();
      if (all.length > 0) {
        setSessions(all);
        setCurrentId(all[0].id);
      } else {
        const s = createChatSession();
        setSessions([s]);
        setCurrentId(s.id);
      }
    } catch {
      // ignore
    }
  }, []);

  // 새 채팅 시작
  const startNewChat = (): ChatSession => {
    const s = createChatSession();
    setSessions((prev) => {
      const next = [s, ...prev];
      return next;
    });
    setCurrentId(s.id);
    return s;
  };

  // 세션 선택
  const selectSession = (id: string): ChatSession | null => {
    const target = sessions.find((s) => s.id === id) ?? null;
    if (target) {
      setCurrentId(id);
    }
    return target;
  };

  // 메시지 추가 (저장 + state 갱신)
  const addMsg = (sessionId: string, msg: Message): void => {
    storageAddMessage(sessionId, msg);
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, msg], updatedAt: Date.now() }
          : s
      );
      // 정렬은 storage 쪽에서 이미 처리하지만, UI에서도 최신순 유지
      return [...updated].sort((a, b) => b.updatedAt - a.updatedAt);
    });
  };

  // 스트리밍 완료 후 마지막 메시지 교체
  const finalizeLastMsg = (sessionId: string, text: string): void => {
    storageUpdateLastMessage(sessionId, text);
    setSessions((prev) => {
      const next = prev.map((s) => {
        if (s.id !== sessionId || s.messages.length === 0) return s;
        const msgs = [...s.messages];
        const last = msgs[msgs.length - 1];
        msgs[msgs.length - 1] = { ...last, text };
        return { ...s, messages: msgs, updatedAt: Date.now() };
      });
      return [...next].sort((a, b) => b.updatedAt - a.updatedAt);
    });
  };

  // 세션 삭제
  const removeSession = (id: string): void => {
    storageDeleteSession(id);
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      // currentId 재조정
      if (currentId === id) {
        setCurrentId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  // 검색 (debounce 300ms)
  const search = (query: string): void => {
    setSearchQuery(query);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      try {
        const results = query.trim()
          ? storageSearchSessions(query)
          : getChatSessions();
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    }, 300);
  };

  const currentSession =
    sessions.find((s) => s.id === currentId) ?? null;

  return {
    sessions,
    currentId,
    currentSession,
    searchQuery,
    searchResults,
    startNewChat,
    selectSession,
    addMsg,
    finalizeLastMsg,
    removeSession,
    search,
    setSearchQuery,
  };
}

