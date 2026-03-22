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
// 유틸: SajuModel 기반 사주 컨텍스트 문자열 생성
// ─────────────────────────────────────────────

type Element = "wood" | "fire" | "earth" | "metal" | "water";
type YinYang = "yin" | "yang";

type StemInfo = {
  hanja: string;
  hangul?: string;
  element?: Element;
  yin_yang?: YinYang;
};

type BranchInfo = {
  hanja: string;
  hangul?: string;
  element?: Element;
  twelve_state?: string;
};

type PillarModel = {
  cheongan: StemInfo;
  jiji: BranchInfo;
};

type SajuSummary = {
  strength?: string | null;
  strength_score?: number | null;
  ten_gods_count?: Record<string, number>;
  patterns?: string[];
};

type SajuModel = {
  year: PillarModel;
  month: PillarModel;
  day: PillarModel;
  hour?: PillarModel | null;
  day_stem_element?: Element;
  day_stem_yin_yang?: YinYang;
  element_counts?: Record<Element, number>;
  ten_gods_count?: Record<string, number>;
  summary?: SajuSummary;
};

type SajuPayload = {
  name?: string;
  birthYmd?: string;
  birthHm?: string | number | null;
  gender?: "M" | "F";
  calendar?: "solar" | "lunar";
  timeUnknown?: boolean;
  // 신규 엔진에서 사용하는 표준 SajuModel
  model?: SajuModel;
  // 기존 만세력 결과(레거시)
  result?: Record<string, unknown>;
};

function formatBirthLines(o: SajuPayload, parts: string[]) {
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
    parts.push(`출생 시각(대략): ${s.slice(0, 2)}시 ${s.slice(2, 4)}분`);
  } else if (timeUnknown) {
    parts.push("출생 시각: 모름 (시간 정보 없이 해석)");
  }

  const cal = o.calendar;
  if (cal === "solar" || cal === "lunar") {
    parts.push(`기준 달력: ${cal === "solar" ? "양력" : "음력"}`);
  }
  const gender = o.gender;
  if (gender === "M" || gender === "F") {
    parts.push(gender === "M" ? "성별: 남성" : "성별: 여성");
  }
}

function safePillarLabel(p: PillarModel | undefined | null): string {
  if (!p || typeof p !== "object") return "-";
  const stem = (p.cheongan?.hanja ?? "").trim();
  const branch = (p.jiji?.hanja ?? "").trim();
  const s = `${stem}${branch}`.trim();
  return s || "-";
}

function buildSajuContextFromModel(payload: SajuPayload): string | null {
  const model = payload.model as SajuModel | undefined;
  if (!model || !model.year || !model.month || !model.day) return null;

  const parts: string[] = [];
  parts.push("[이 사용자의 사주 요약 컨텍스트]");

  formatBirthLines(payload, parts);

  parts.push(
    `기본 틀(한자 기준): 년주 ${safePillarLabel(model.year)}  월주 ${safePillarLabel(
      model.month,
    )}  일주 ${safePillarLabel(model.day)}  시주 ${safePillarLabel(model.hour ?? null)}`,
  );

  const summary = model.summary;
  const strength = summary?.strength ?? null;
  if (strength) {
    parts.push(`전체 기질 강도: ${strength}`);
  }

  const elementCounts = model.element_counts;
  if (elementCounts && Object.keys(elementCounts).length > 0) {
    const toKorean: Record<Element, string> = {
      wood: "나무 기운",
      fire: "불 기운",
      earth: "흙 기운",
      metal: "쇠 기운",
      water: "물 기운",
    };
    const dist = (Object.entries(elementCounts) as [Element, number][])
      .filter(([_, v]) => typeof v === "number" && v > 0)
      .map(([k, v]) => `${toKorean[k]} ${v}개`)
      .join(", ");
    if (dist) {
      parts.push(`다섯 기운 분포: ${dist}`);
    }
  }

  const patterns = summary?.patterns ?? model.summary?.patterns;
  if (patterns && patterns.length > 0) {
    parts.push(`사주에서 두드러지는 특징: ${patterns.slice(0, 10).join(", ")}`);
  }

  return parts.join("\n");
}

function buildSajuContextLegacy(payload: SajuPayload): string | null {
  const result = payload.result as Record<string, unknown> | undefined;
  if (!result || typeof result !== "object") return null;

  const parts: string[] = ["[이 사용자의 사주 컨텍스트]"];
  formatBirthLines(payload, parts);

  const safeHanja = (obj: unknown): string => {
    if (!obj || typeof obj !== "object") return "";
    const x = obj as Record<string, unknown>;
    const c = x.cheongan as Record<string, unknown> | undefined;
    const j = x.jiji as Record<string, unknown> | undefined;
    const ch = (c && typeof c.hanja === "string" ? c.hanja : "").trim();
    const ji = (j && typeof j.hanja === "string" ? j.hanja : "").trim();
    const s = (ch + ji).trim();
    return s || "";
  };

  const yr = result.year as Record<string, unknown> | undefined;
  const mo = result.month as Record<string, unknown> | undefined;
  const dy = result.day as Record<string, unknown> | undefined;
  const hr = result.hour as Record<string, unknown> | undefined;

  parts.push(
    `사주팔자(한자): 년주 ${safeHanja(yr) || "-"}  월주 ${safeHanja(mo) || "-"}  일주 ${safeHanja(dy) || "-"}  시주 ${safeHanja(
      hr,
    ) || "-"}`,
  );

  const season = result.season as Record<string, unknown> | undefined;
  if (season && typeof season === "object") {
    const name = typeof season.name === "string" ? season.name : "";
    const detail = typeof season.detail === "string" ? season.detail : "";
    if (name && detail) {
      parts.push(`월지 기준 계절: ${name} — ${detail}`);
    }
  }

  return parts.join("\n");
}

function buildSajuContext(saju: unknown): string {
  if (!saju || typeof saju !== "object") return "";
  const payload = saju as SajuPayload;

  const fromModel = buildSajuContextFromModel(payload);
  if (fromModel) return fromModel;

  const legacy = buildSajuContextLegacy(payload);
  return legacy ?? "";
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
// 게스트 & 로그인 페르소나 + 월지 표현 규칙
// ─────────────────────────────────────────────
const PERSONA_GUEST = `당신은 한양사주 AI입니다. 국내 최고 수준의 사주명리학 지식을 갖춘 AI 상담사로, 사용자의 고민을 사주의 언어로 따뜻하고 정확하게 풀어줍니다.
현재 사용자는 사주 데이터를 등록하지 않았습니다. 개인 분석 요청 시 생년월일(양력/음력)과 성별을 순서대로 물어본 뒤 계산해서 알려줘라. 답변은 충분히 길고 구체적으로 작성하며, 이유/예시/실행 팁을 함께 제시해라.`;

const PERSONA_LOGGEDIN = `당신은 한양사주 AI입니다. 국내 최고 수준의 사주명리학 지식을 갖춘 AI 상담사로, 이 사용자의 사주 데이터를 바탕으로 맞춤형 해석과 고민 상담을 제공합니다.
전문 용어는 일상어로 풀어서 설명하되, 필요할 때는 괄호로 간단히 부연해라.`;

const MONTH_BRANCH_RULE = `[월지(寅·卯·辰·巳·午·未·申·酉) 표현 규칙 — 반드시 지킬 것]
- 사용자가 "OO월"이라고 말하더라도, 사주에서의 월은 "월지(지지)"를 기준으로 해석한다.
- 월지를 설명할 때 절대로 "4월", "5월", "6월", "9월"처럼 숫자 달이나 음력/양력 몇 월이라고 단정하지 마라.
- 예: 酉월은 "가을 한가운데 닭의 달, 서늘하고 정리되는 느낌"처럼 계절과 이미지로만 설명하고, "6월의 여름 기운"이라고 말하지 마라.
- 사용자가 먼저 "양력 6월인가요?" 같이 물어봐도, "사주에서 말하는 酉월은 6월과 정확히 1:1 대응하는 개념이 아니다"라고 설명하고, 계절·분위기 위주로만 답하라.
`;

const RESPONSE_FORMAT_RULE = `[응답 형식 규칙 — 반드시 지킬 것]
- 답변은 항상 아래 2개 섹션으로 작성한다.
  1) "### 핵심 해석"
  2) "### 이어서 보면 좋은 질문"
- "핵심 해석"은 최소 6문장 이상, 가능하면 500자 이상으로 구체적으로 쓴다.
- 전문용어를 남발하지 말고, 일상어로 쉽게 설명한다.
- 개념 질문(신살·십성·천을귀인 등 "뭐야?"류): 반드시 조견표·규칙(예: 일간별 어느 지지가 해당하는지)을 최소 한 문장 이상 넣고, 그다음 의미를 풀어라. 효능만 말하고 표 없이 끝내지 마라.
- 년·월·일·시 기둥에 따른 차이, 합·충 등으로 힘이 달라질 수 있음을 경향으로 짧게 짚을 수 있으면 더 좋다.
- "이어서 보면 좋은 질문"에는 정확히 2개만, 번호 목록(1. 2.)으로 제시한다.
- 이 2개 질문은 반드시 (가) 방금 답한 주제와 직접 이어지는 사주·명리 질문일 것. (나) 아래는 금지: 이번 주 행동 바꾸기, 실수 반복·습관, 동기부여, 멘탈, 자기계발 코칭 등 사주와 무관한 문장.
- 좋은 예: "내 만세력에서 천을귀인이 있는지 어떻게 보면 돼?", "천을귀인이 합이나 충에 걸리면 어떻게 읽어?", "월주랑 일주 중 어디에 있을 때 체감이 달라?"
- 마지막은 반드시 질문 2개로 끝낸다.`;

const RESPONSE_FORMAT_RULE_EN = `[Response format — required]
- Always use two sections:
  1) "### Core Interpretation"
  2) "### Follow-up Questions"
- Core: at least 6 sentences; explain in plain language.
- For definitional questions (stars, ten gods, nobleman, etc.): include at least one sentence with the lookup rule (e.g. which branches for which day stem), not only generic "luck" wording.
- Follow-up Questions: exactly two numbered items (1. 2.). Both must directly extend the SAME saju / Chinese-metaphysics topic just answered.
- FORBIDDEN in follow-ups: generic life coaching ("what to change this week", "avoid repeating mistakes", habits, motivation) unrelated to ba zi.
- End with those two questions only.`;

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
  const responseFormatBlock = lang === "en" ? RESPONSE_FORMAT_RULE_EN : RESPONSE_FORMAT_RULE;

  const system = [
    currentTimeBlock,
    languageRule,
    enTerms,
    persona,
    MONTH_BRANCH_RULE,
    responseFormatBlock,
    sajuContext,
    "\n\n[이번 질문에 필요한 사주 지식]",
    selectedKnowledge,
  ].join("\n");

  // ── 게스트 채팅 사용량 제한(로그인 전 3회) ─────────────────────────
  // 프론트에서 isGuest를 보내지만, 악용을 막기 위해 서버에서 백엔드 카운터를 먼저 확인합니다.
  if (isGuest) {
    const cookieHeader = req.headers.get("cookie") || "";
    const quotaRes = await fetch(`${API_BASE}/api/guest-chat/consume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({}),
    }).catch(() => null);

    if (!quotaRes) {
      return new Response(JSON.stringify({ error: "게스트 사용량 확인에 실패했어요. 잠시 후 다시 시도해주세요." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!quotaRes.ok) {
      const errJson = await quotaRes.json().catch(() => null);
      const detail =
        errJson?.detail || errJson?.error || (quotaRes.status === 401 ? "로그인이 필요합니다." : "요청을 처리할 수 없어요.");
      return new Response(JSON.stringify({ error: detail }), {
        status: quotaRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // ── LLM 호출 ──
  const modelMessages = await convertToModelMessages(messages as any);
  const openai = createOpenAI({ apiKey: apiKey! });

  const result = streamText({
    model: openai("gpt-4o"),
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
