import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChatSession,
  Message,
  getChatSessions,
  createChatSession,
  addMessage as storageAddMessage,
  updateLastMessage as storageUpdateLastMessage,
  deleteSession as storageDeleteSession,
  searchSessions as storageSearchSessions,
  setSessionMessages,
  setSessionTitle,
} from "@/lib/chatStorage";

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatSession[]>([]);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** localStorage에서 세션 목록 다시 읽기 (페이지 진입·포커스 등) */
  const refreshSessionsFromStorage = useCallback(() => {
    try {
      let all = getChatSessions();
      if (all.length === 0) {
        const s = createChatSession();
        all = [s];
      }
      setSessions(all);
      setCurrentId((prev) => {
        if (prev && all.some((x) => x.id === prev)) return prev;
        return all[0]?.id ?? null;
      });
    } catch {
      // ignore
    }
  }, []);

  // 마운트 시·채팅 페이지 재진입 시 목록 동기화 (React Strict Mode에서도 storage 기준으로 일관됨)
  useEffect(() => {
    refreshSessionsFromStorage();
  }, [refreshSessionsFromStorage]);

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

  // 세션 전체 메시지 교체 (useChat와 동기화용)
  // 참조를 고정해야 ChatContent의 동기화 effect가 매 부모 리렌더마다 재실행되지 않음 (#185 방지)
  const replaceMessages = useCallback((sessionId: string, msgs: Message[]): void => {
    setSessionMessages(sessionId, msgs);
    setSessions((prev) => {
      const next = prev.map((s) =>
        s.id === sessionId ? { ...s, messages: [...msgs], updatedAt: Date.now() } : s,
      );
      return [...next].sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }, []);

  // 첫 유저 메시지로 제목 자동 설정 (오타 그대로 쓰지 않고 안전한 카테고리형 제목 사용)
  const ensureTitleFromFirstMessage = (sessionId: string, firstUserText: string): void => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target || target.title) return;

    const raw = (firstUserText || "").trim().replace(/\s+/g, " ");
    let safeTitle = "새 대화";

    if (raw) {
      const lower = raw.toLowerCase();
      const hasKorean = /[가-힣]/.test(raw);

      if (/사주|팔자|명식|사주풀이/.test(raw)) {
        safeTitle = "사주 상담";
      } else if (/오늘|데일리|일간/.test(raw) && /운세|운/.test(raw)) {
        safeTitle = "오늘의 운세";
      } else if (/재물|돈|수입|사업/.test(raw)) {
        safeTitle = "재물·돈 고민";
      } else if (/직업|진로|커리어|일하고/.test(raw)) {
        safeTitle = "직업·진로 상담";
      } else if (/연애|연인|짝사랑|썸|결혼|이혼|관계/.test(raw)) {
        safeTitle = "연애·관계 고민";
      } else if (/가족|부모|형제|자녀|아이/.test(raw)) {
        safeTitle = "가족·관계 이야기";
      } else if (/공부|시험|수능|자격증/.test(raw)) {
        safeTitle = "공부·시험 이야기";
      } else if (hasKorean && raw.length >= 6) {
        // 한글이 있고 너무 짧지 않으면 앞부분만 안정적으로 사용
        safeTitle = raw.slice(0, 18);
      }
    }

    setSessionTitle(sessionId, safeTitle);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId && !s.title
          ? { ...s, title: safeTitle, updatedAt: Date.now() }
          : s,
      ),
    );
  };

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
    replaceMessages,
    ensureTitleFromFirstMessage,
    refreshSessionsFromStorage,
  };
}

