import { streamText, convertToModelMessages, tool, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { detectIntent, assembleKnowledge } from "./knowledge/index";
import { SAJU_EN_TERMS_GUIDE } from "./knowledge/enTerms";
import { TOOL_RULES, QUALITY_PHILOSOPHY } from "./knowledge/base";
import { TIME_RULES } from "./knowledge/time";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

// ─────────────────────────────────────────────
// get_saju 도구 정의
// ─────────────────────────────────────────────
const get_saju = tool({
  description:
    "생년월일시·성별로 사주팔자(만세력)와 대운을 계산한다. 대운은 성별에 따라 순행/역행이 달라지므로 반드시 성별이 있어야 호출 가능하다. 반환값에 year_pillar, month_pillar, day_pillar, hour_pillar, daeun_start_age, daeun_direction, daeun_list가 포함된다. 사용자가 생년월일·양력/음력·성별을 모두 알려준 경우에만 호출하라.",
  inputSchema: z.object({
    year: z.number().describe("출생년도 (예: 1990)"),
    month: z.number().min(1).max(12).describe("출생월 (1-12)"),
    day: z.number().min(1).max(31).describe("출생일 (1-31)"),
    hour: z
      .number()
      .min(0)
      .max(23)
      .optional()
      .describe(
        "출생시 (0-23). 사용자가 시간을 모른다고 하면 이 값을 아예 넘기지 마라. undefined로 두면 시주가 자동으로 제거된다.",
      ),
    minute: z.number().min(0).max(59).optional().describe("출생분 (0-59, 기본 0)"),
    gender: z.enum(["M", "F"]).describe("성별: M=남, F=여. 성별을 모르면 먼저 물어봐라."),
    calendar: z.enum(["solar", "lunar"]).describe("양력=solar, 음력=lunar. 모르면 먼저 물어봐라."),
  }),
  execute: async ({ year, month, day, hour, minute, gender, calendar }) => {
    const timeUnknown = hour === undefined;
    const res = await fetch(`${API_BASE}/saju/full`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year, month, day,
        hour: hour ?? 12,
        minute: minute ?? 0,
        gender,
        calendar_type: calendar,
        is_leap_month: false,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { error: err || "만세력 계산 실패", ok: false };
    }
    const data = await res.json();

    // 시간을 모를 때는 시주 관련 정보를 제거해 LLM이 시주를 사용하지 못하게 한다.
    if (timeUnknown) {
      if (data.result?.hour) {
        delete data.result.hour;
      }
      if ("hour_pillar" in data) {
        data.hour_pillar = null;
      }
      data.time_unknown = true;
    }

    return { ...data, ok: true };
  },
});

// ─────────────────────────────────────────────
// 유틸: 사주 컨텍스트 문자열 생성
// ─────────────────────────────────────────────
function buildSajuContext(saju: unknown): string {
  if (!saju || typeof saju !== "object") return "";
  const o = saju as Record<string, unknown>;
  const result = o.result as Record<string, unknown> | undefined;
  if (!result || typeof result !== "object") return "";

  const parts: string[] = ["[이 사용자의 사주 컨텍스트]"];
  const name = typeof o.name === "string" && o.name.trim() ? o.name.trim() : "";
  if (name) parts.push(`이름: ${name}`);

  const birthYmd = typeof o.birthYmd === "string" ? o.birthYmd.trim() : "";
  if (birthYmd.length >= 8) {
    parts.push(`생년월일: ${birthYmd.slice(0, 4)}년 ${birthYmd.slice(4, 6)}월 ${birthYmd.slice(6, 8)}일`);
  }
  const birthHm = o.birthHm;
  const timeUnknown = o.timeUnknown;
  if (!timeUnknown && birthHm != null && String(birthHm).length >= 4) {
    const s = String(birthHm).padStart(4, "0");
    parts.push(`생시: ${s.slice(0, 2)}시 ${s.slice(2, 4)}분`);
  }
  const cal = o.calendar;
  if (cal === "solar" || cal === "lunar") parts.push(`기준: ${cal === "solar" ? "양력" : "음력"}`);
  const gender = o.gender;
  if (gender === "M" || gender === "F") parts.push(gender === "M" ? "성별: 남" : "성별: 여");

  const safeHanja = (obj: unknown): string => {
    if (!obj || typeof obj !== "object") return "";
    const x = obj as Record<string, unknown>;
    const c = x.cheongan as Record<string, unknown> | undefined;
    const j = x.jiji as Record<string, unknown> | undefined;
    const ch = (c && typeof c.hanja === "string" ? c.hanja : "").trim();
    const ji = (j && typeof j.hanja === "string" ? j.hanja : "").trim();
    return ch + ji || "";
  };

  const yr = result.year as Record<string, unknown> | undefined;
  const mo = result.month as Record<string, unknown> | undefined;
  const dy = result.day as Record<string, unknown> | undefined;
  const hr = result.hour as Record<string, unknown> | undefined;

  parts.push(
    `사주팔자(한자): 년주 ${safeHanja(yr) || "-"}  월주 ${safeHanja(mo) || "-"}  일주 ${safeHanja(dy) || "-"}  시주 ${safeHanja(hr) || "-"}`
  );

  return parts.join("\n");
}

// ─────────────────────────────────────────────
// 유틸: 한국 시각
// ─────────────────────────────────────────────
function getKoreaNowString(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "long", day: "numeric",
    weekday: "long", hour: "numeric", minute: "2-digit", hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = parseInt(get("hour"), 10);
  const ampm = hour < 12 ? "오전" : "오후";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${get("year")}년 ${get("month")} ${get("day")}일 (${get("weekday")}) ${ampm} ${hour12}시 ${get("minute")}분`;
}

function getKoreaDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

// ─────────────────────────────────────────────
// 게스트 & 로그인 페르소나
// ─────────────────────────────────────────────
const PERSONA_GUEST = `당신은 한양사주 AI입니다. 국내 최고 수준의 사주명리학 지식을 갖춘 AI 상담사로, 사용자의 고민을 사주의 언어로 따뜻하고 정확하게 풀어줍니다.
현재 사용자는 사주 데이터를 등록하지 않았습니다. 개인 분석 요청 시 생년월일(양력/음력)과 성별을 순서대로 물어본 뒤 계산해서 알려줘라. 답변은 짧고 흥미롭되 깊이가 있어야 한다.`;

const PERSONA_LOGGEDIN = `당신은 한양사주 AI입니다. 국내 최고 수준의 사주명리학 지식을 갖춘 AI 상담사로, 이 사용자의 사주 데이터를 바탕으로 맞춤형 해석과 고민 상담을 제공합니다.
전문 용어는 일상어로 풀어서 설명하되, 필요할 때는 괄호로 간단히 부연해라.`;

// ─────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────
export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
      status: 503, headers: { "Content-Type": "application/json" },
    });
  }

  let body: { messages?: unknown[]; isGuest?: boolean; saju?: unknown; lang?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const isGuest = body.isGuest === true;
  const saju = body.saju;
  const lang: "ko" | "en" = body.lang === "en" ? "en" : "ko";
  const hasSaju = saju != null && typeof saju === "object" &&
    (saju as Record<string, unknown>).result != null;

  // ── 마지막 사용자 메시지 추출 → intent 감지 ──
  const lastUserMessage = (() => {
    const found = [...messages].reverse().find(
      (m: any) => m?.role === "user"
    );
    if (!found) return "";
    const m = found as any;
    if (typeof m.content === "string") return m.content;
    if (Array.isArray(m.content)) {
      const textPart = m.content.find((p: any) => p.type === "text");
      return textPart?.text ?? "";
    }
    return "";
  })();

  const intent = detectIntent(lastUserMessage);

  // ── 현재 시각 & 일진 ──
  const koreaNow = getKoreaNowString();
  const koreaDateStr = getKoreaDateString();
  let dayPillarLine = "";
  try {
    const dpRes = await fetch(
      `${API_BASE}/saju/day-pillar?date=${encodeURIComponent(koreaDateStr)}`
    );
    if (dpRes.ok) {
      const dp = (await dpRes.json()) as { day_pillar?: string; day_pillar_hangul?: string };
      if (dp.day_pillar && dp.day_pillar_hangul) {
        dayPillarLine = `\n- 오늘의 일진: ${dp.day_pillar}(${dp.day_pillar_hangul})일`;
      }
    }
  } catch { /* 백엔드 미연결 시 일진 없이 진행 */ }

  const currentTimeBlock = `${TIME_RULES}\n- 현재 시각: ${koreaNow}${dayPillarLine}`;

  // ── 동적 지식 블록 조립 ──
  const selectedKnowledge = assembleKnowledge(intent, lastUserMessage);

  // ── 페르소나 + 사주 컨텍스트 ──
  const persona = isGuest || !hasSaju ? PERSONA_GUEST : PERSONA_LOGGEDIN;
  const sajuContext = hasSaju ? `\n\n${buildSajuContext(saju)}` : "";

  // ── 언어 규칙 ──
  const languageRule = lang === "en"
    ? "\n[Language]\n- You must respond in English only.\n"
    : "";
  const enTerms = lang === "en" ? `\n${SAJU_EN_TERMS_GUIDE}\n` : "";

  // ── 최종 시스템 프롬프트 조립 ──
  const system = [
    currentTimeBlock,
    languageRule,
    enTerms,
    persona,
    sajuContext,
    "\n\n[이번 질문에 필요한 사주 지식]",
    selectedKnowledge,
  ].join("\n");

  // ── LLM 호출 ──
  const modelMessages = await convertToModelMessages(messages as any);
  const openai = createOpenAI({ apiKey: apiKey! });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system,
    messages: modelMessages,
    maxOutputTokens: 2000,
    temperature: 0.6,
    tools: { get_saju },
    stopWhen: stepCountIs(3),
    toolChoice: "auto",
  });

  return result.toUIMessageStreamResponse();
}
