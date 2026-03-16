"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import ko from "@/locales/ko";
import en from "@/locales/en";

export type Lang = "ko" | "en";

// ko/en 구조가 거의 같지만 리터럴 값이 달라서,
// 공통적으로만 쓰일 수 있도록 union 타입으로 완화.
type Messages = typeof ko | typeof en;

type LangContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

export const LangContext = createContext<LangContextValue | undefined>(
  undefined,
);

type ProviderProps = {
  children: ReactNode;
};

const allMessages: Record<Lang, Messages> = {
  ko,
  en,
};

function getNestedMessage(obj: any, path: string): string | undefined {
  const parts = path.split(".");
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  if (typeof cur === "string") return cur;
  return undefined;
}

export function LangProvider({ children }: ProviderProps) {
  const [lang, setLangState] = useState<Lang>("ko");

  // 초기 언어 설정: localStorage 우선, 없으면 브라우저 언어 기준
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("lang");
    if (stored === "ko" || stored === "en") {
      setLangState(stored);
      return;
    }
    const browser = navigator.language || "ko";
    const initial: Lang = browser.toLowerCase().startsWith("ko") ? "ko" : "en";
    setLangState(initial);
    window.localStorage.setItem("lang", initial);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lang", l);
    }
  };

  const messages = useMemo(() => allMessages[lang], [lang]);

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const raw = getNestedMessage(messages, key) ?? key;
    if (!vars) return raw;
    return Object.keys(vars).reduce((acc, k) => {
      const v = String(vars[k]);
      return acc.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }, raw);
  };

  const value: LangContextValue = useMemo(
    () => ({
      lang,
      setLang,
      t,
    }),
    [lang, t],
  );

  return (
    <LangContext.Provider value={value}>{children}</LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used within a LangProvider");
  }
  return ctx;
}

