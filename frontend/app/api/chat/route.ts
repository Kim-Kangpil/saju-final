import { streamText, convertToModelMessages, tool, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

const get_saju = tool({
  description:
    "생년월일시·성별로 사주팔자(만세력)와 대운을 계산한다. 대운은 성별에 따라 순행/역행이 달라지므로 반드시 성별이 있어야 호출 가능하다. 반환값에 year_pillar, month_pillar, day_pillar, hour_pillar, daeun_start_age, daeun_direction, daeun_list가 포함된다. 사용자가 생년월일·양력/음력·성별을 모두 알려준 경우에만 호출하라. 성별을 모르거나 말하지 않았으면 호출하지 마라.",
  inputSchema: z.object({
    year: z.number().describe("출생년도 (예: 1990)"),
    month: z.number().min(1).max(12).describe("출생월 (1-12)"),
    day: z.number().min(1).max(31).describe("출생일 (1-31)"),
    hour: z.number().min(0).max(23).optional().describe("출생시 (0-23, 모르면 12)"),
    minute: z.number().min(0).max(59).optional().describe("출생분 (0-59, 기본 0)"),
    gender: z.enum(["M", "F"]).describe("성별: M=남, F=여. 사용자가 성별을 말하지 않았으면 이 도구를 호출하지 말고 먼저 물어봐라. 대운은 성별 필수."),
    calendar: z.enum(["solar", "lunar"]).describe("양력이면 solar, 음력이면 lunar. 사용자가 양력/음력을 말하지 않았으면 이 도구를 호출하지 말고 먼저 물어봐라."),
  }),
  execute: async ({ year, month, day, hour, minute, gender, calendar }) => {
    const res = await fetch(`${API_BASE}/saju/full`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year,
        month,
        day,
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
    return { ...data, ok: true };
  },
});

const SAJU_TOOL_RULES = `
[대화 시 금지]
- 사용자에게 "get_saju", "도구", "API", "함수" 등 내부 구현·기술 용어를 절대 언급하지 마라. "생년월일 알려주시면 계산해 드릴게요", "양력이에요 음력이에요?" 같이 자연스러운 말만 써라.
- 답변에 마크다운을 절대 쓰지 마라. ** ## ### # * - 목록·제목·강조 등 전부 금지. 일반 텍스트만 출력해라.

[절대 규칙 - 사주/만세력 계산]
- 사주팔자·만세력 계산을 절대 직접 하지 마라. 추측이나 암산 금지.
- 사용자가 생년월일(또는 생년월일시)을 말하고 사주/만세력/팔자를 알려달라고 하면 get_saju 도구를 사용해라. 단, 양력/음력을 사용자가 아직 말하지 않았으면 get_saju를 호출하지 말고 반드시 먼저 "생일이 양력이에요, 음력이에요?"라고 물어봐라. 사용자가 양력 또는 음력이라고 답한 뒤에만 get_saju를 호출해라.
- get_saju 도구 결과를 받은 후에는 반드시 그 결과를 바탕으로 사용자에게 글로 설명해라. 도구만 호출하고 말을 안 하면 안 된다.
- 도구가 실패하면 "만세력 계산에 실패했어요. 생년월일과 양력/음력을 확인해 주세요." 등으로 안내해라.
- 년·월·일이 없으면 사용자에게 물어본 뒤 알려주면 다음 단계로 진행. 성별이 없으면 get_saju를 호출하지 말고 반드시 먼저 "남자이에요, 여자이에요?"라고 물어봐라. 대운은 성별에 따라 순행/역행이 달라지므로 성별 없이는 대운을 계산·표시하면 안 된다. 양력/음력만 추정하지 말고 꼭 물어봐라.

[출생 시각(시간)을 모를 때]
- 사용자가 태어난 시간(출생 시각, 출생 시간)을 말하지 않았으면 한두 번만 "출생 시간을 아시나요?" 또는 "몇 시쯤에 태어나셨나요?" 같이 확인해라.
- 그래도 말해주지 않으면 시주를 임의로 추정하지 마라. 만세력을 알려줄 때 년주, 월주, 일주까지만 말하고 시주는 언급하지도 해석하지도 마라. (예: "시주는 출생 시간을 모르셔서 빼드렸어요" 정도만 짧게 하거나, 아예 시주 없이 년·월·일주만 알려주면 된다.)

[출생 시각을 지지(자시·축시...)로 말해줄 때]
- 사용자가 "자시", "축시", "인시" 같이 지지로 된 시각을 말하면 아래 표 기준으로 **시지 구간의 중앙 시각(24시간제 시)** 으로 바꿔서 hour 값을 잡아라.
- 자시 23:30~01:30 → 0시, 축시 01:30~03:30 → 2시, 인시 03:30~05:30 → 4시, 묘시 05:30~07:30 → 6시,
  진시 07:30~09:30 → 8시, 사시 09:30~11:30 → 10시, 오시 11:30~13:30 → 12시, 미시 13:30~15:30 → 14시,
  신시 15:30~17:30 → 16시, 유시 17:30~19:30 → 18시, 술시 19:30~21:30 → 20시, 해시 21:30~23:30 → 22시.
- 사용자가 "자정쯤", "새벽 3~4시쯤"처럼 말하면 가장 가까운 한 글자 지지(자·축·인...)로 먼저 정리하고, 위 표대로 중앙값 시각을 사용해라.

[절대 규칙 - 대운]
- 대운(大運)은 성별에 따라 순행/역행이 달라진다. 사용자가 성별을 모른다고 하거나 말하지 않았으면 대운을 절대 알려주지 마라. 년주·월주·일주(와 시주)만 알려주고, "대운은 남자/여자에 따라 순서가 달라져서, 성별을 알려주셔야 대운을 알려드릴 수 있어요"라고만 하라. 성별을 알고 있을 때만 get_saju를 호출하고, 대운 설명 시에는 도구 결과의 daeun_start_age, daeun_direction, daeun_list만 그대로 사용하라. 결과에 daeun_list가 없으면 대운을 추측하지 말고, 성별을 먼저 물어보라.

[절대 규칙 - 사주 해석 시]
- 사주 해석할 때는 오직 get_saju 도구가 반환한 결과에만 나온 글자(년주 year_pillar, 월주 month_pillar, 일주 day_pillar, 시주 hour_pillar)만 사용해서 설명해라.
- 사용자가 출생 시간을 알려주지 않았으면 위 규칙대로 시주는 말하지 마라. 년주, 월주, 일주만 설명해라.
- 도구 결과에 없는 한자·글자를 절대 만들거나 넣지 마라. 임의로 다른 글자를 인용하지 마라.`;

/** 십성(십신·육친) 정확한 정의 — 답변 시 반드시 준수. 정관을 "남편이자 아내"라고 하지 말 것. */
const SAJU_TEN_GODS_KNOWLEDGE = `
[십성(十神)·육친 정의 — 절대 준수]
십성은 일간(나)을 기준으로 한 오행 관계다. 성별에 따라 육친·의미가 다르므로 혼동하지 말 것.

비겁: 비견·겁재 — 일간과 같은 오행. 형제, 동료, 친구, 라이벌.
식상: 식신·상관 — 내가 생(生)하는 오행. 표현·재능·자식(여자 기준).
재성: 편재·정재 — 내가 극(剋)하는 오행. 재물, 아버지. 남자에게는 아내·이성.
관성: 편관·정관 — 나를 극(剋)하는 오행. 규율, 책임, 직장, 명예.

【정관(正官) — 반드시 성별 구분】
- 남자에게 정관: 직업·직장, 명예·체면, 사회적 책임감, 자식에 대한 책임감. (아내가 아님. 남자의 아내는 재성.)
- 여자에게 정관: 남편, 직장·직업, 책임감. (안정적 관계·규칙.)
정관을 "남편이자 아내"라고 하거나 남자에게 정관=아내라고 하지 마라. 남자 아내=재성, 여자 남편=관성(정관·편관).

편관(偏官): 정관보다 강한 통제·압박. 남자=자식에 대한 부담·강한 책임, 여자=남편 또는 강한 이성.
인성: 편인·정인 — 나를 생(生)해 주는 오행. 어머니, 학문, 인내, 보호.
`;

/** English BaZi terminology guide — used when lang === "en" */
const SAJU_EN_TERMS_GUIDE = `
[BaZi / Four Pillars of Destiny — English terminology]

- Use "BaZi" or "Four Pillars of Destiny" instead of raw Korean terms.
- Use "Day Master" for 일간, and "Year / Month / Day / Hour Pillar" for 년/월/일/시주.
- Use the Five Elements as Wood, Fire, Earth, Metal, Water.

[Ten Gods (십성) — English names]
- 비견: Friend (same element, same polarity)
- 겁재: Rob Wealth (same element, opposite polarity)
- 식신: Eating God (talent, output, contentment)
- 상관: Hurting Officer (rebellious, unconventional output)
- 편재: Indirect Wealth (irregular income, windfalls)
- 정재: Direct Wealth (stable income, long‑term resources)
- 편관: Seven Killings (7K) — pressure, challenges, tough authority
- 정관: Direct Officer — career, status, rules, responsibility
- 편인: Indirect Resource — intuition, unconventional learning, spirituality
- 정인: Direct Resource — study, support, mother figure.

[Auxiliary / Symbolic Stars]
- 도화살: Peach Blossom Star — charm, attractiveness, social and romantic magnetism.
- 역마살: Travelling Horse Star — movement, travel, frequent change.
- 공망: Void / Emptiness — weakens or "hollows out" what it touches.
- 귀인: Nobleman Stars — helpful people and strong support.

Always explain these in clear, everyday English. Avoid raw jargon like "식신, 상관" unless you immediately translate them, e.g. "Hurting Officer (상관)".`;

const GUEST_SYSTEM_PROMPT = `당신은 한양사주 AI입니다.
현재 사용자는 사주 데이터를 등록하지 않았습니다.

규칙:
- 일반적인 사주 이론/지식은 자유롭게 답변
- "내 사주는 어때?" 같은 개인 분석 요청엔 생년월일(과 양력/음력)을 물어본 뒤, 알려주면 계산해서 알려줘라. 사용자에게 "도구", "get_saju", "API" 같은 내부 용어는 절대 말하지 마라. "생년월일 알려주시면 계산해 드릴게요", "양력이에요 음력이에요?" 정도로만 자연스럽게 말해라.
- 답변은 짧고 흥미롭게 (로그인 동기 자극)
${SAJU_TEN_GODS_KNOWLEDGE}
${SAJU_TOOL_RULES}`;

function buildSajuContext(saju: unknown): string {
  if (!saju || typeof saju !== "object") return "";
  const o = saju as Record<string, unknown>;
  const result = o.result as Record<string, unknown> | undefined;
  if (!result || typeof result !== "object") return "";

  const parts: string[] = ["[이 사용자의 만세력 / 사주 컨텍스트]"];
  const name = typeof o.name === "string" && o.name.trim() ? o.name.trim() : "";
  if (name) parts.push(`이름(표시용): ${name}`);

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

  const year = result.year as Record<string, unknown> | undefined;
  const month = result.month as Record<string, unknown> | undefined;
  const day = result.day as Record<string, unknown> | undefined;
  const hour = result.hour as Record<string, unknown> | undefined;
  const y = safeHanja(year) || "-";
  const m = safeHanja(month) || "-";
  const d = safeHanja(day) || "-";
  const h = safeHanja(hour) || "-";
  parts.push(`사주팔자(한자): 년주 ${y}  월주 ${m}  일주 ${d}  시주 ${h}`);

  return parts.join("\n");
}

const LOGGED_IN_SYSTEM_PREFIX = `당신은 한양사주의 AI 상담사입니다. 사주, 운세, 고민 상담 등에 대해 친절하고 쉽게 답변합니다.
전문 용어(일간, 십성, 오행 등)는 가능한 한 쓰지 않고, 일상적인 말로 풀어서 설명해 주세요.
${SAJU_TEN_GODS_KNOWLEDGE}
${SAJU_TOOL_RULES}`;

/** 대한민국 기준 현재 시각 문자열 (요청 시점) */
function getKoreaNowString(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = parseInt(get("hour"), 10);
  const ampm = hour < 12 ? "오전" : "오후";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${get("year")}년 ${get("month")} ${get("day")}일 (${get("weekday")}) ${ampm} ${hour12}시 ${get("minute")}분`;
}

const CURRENT_TIME_RULE = `
[현재 시각 - 반드시 준수]
- 아래 "현재 시각"은 사용자 요청이 들어온 시점의 대한민국 기준 시각이다. 사용자가 오늘 날짜, 며칠이야, 지금 몇 시야, 현재 시각 등을 물어보면 반드시 이 정보만 사용해서 답하라. 다른 날짜나 시각을 임의로 말하지 마라.
- "오늘의 일진"은 위 날짜의 일진(일주, 干支)이다. 무자일, 경오일 등 일진·일주·오늘 무슨 날이야 같은 질문에는 이 일진만 사용해서 답하라. 사주·운세에서 오늘 날짜의 기운을 말할 때도 이 일진을 써라.`;

/** 대한민국 기준 오늘 날짜 YYYY-MM-DD */
function getKoreaDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { messages?: unknown[]; isGuest?: boolean; saju?: unknown; lang?: "ko" | "en" | string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const isGuest = body.isGuest === true;
  const saju = body.saju;
  const lang: "ko" | "en" = body.lang === "en" ? "en" : "ko";
  const hasSaju = saju != null && typeof saju === "object" && (saju as Record<string, unknown>).result != null;

  const koreaNow = getKoreaNowString();
  const koreaDateStr = getKoreaDateString();
  let dayPillarLine = "";
  try {
    const dpRes = await fetch(
      `${API_BASE}/saju/day-pillar?date=${encodeURIComponent(koreaDateStr)}`
    );
    if (dpRes.ok) {
      const dp = (await dpRes.json()) as {
        day_pillar?: string;
        day_pillar_hangul?: string;
      };
      if (dp.day_pillar && dp.day_pillar_hangul) {
        dayPillarLine = `\n- 오늘의 일진: ${dp.day_pillar}(${dp.day_pillar_hangul})일\n`;
      }
    }
  } catch {
    // 백엔드 미연결 시 일진 없이 진행
  }

  const currentTimeBlock =
    `${CURRENT_TIME_RULE}\n- 현재 시각: ${koreaNow}` + dayPillarLine;

  const languageRule =
    lang === "en"
      ? "\n[Language]\n- You must respond in English only.\n- The user speaks English. All your responses must be in English.\n"
      : "";

  const systemBase =
    isGuest || !hasSaju
      ? GUEST_SYSTEM_PROMPT
      : `${LOGGED_IN_SYSTEM_PREFIX}\n\n${buildSajuContext(saju)}`;

  const system =
    currentTimeBlock +
    languageRule +
    (lang === "en" ? `\n${SAJU_EN_TERMS_GUIDE}\n` : "") +
    systemBase;

  // Vercel AI SDK의 convertToModelMessages는 UIMessage 타입 배열을 기대하지만
  // 여기서는 네트워크 JSON으로 들어온 메시지를 그대로 넘기므로 타입 단언을 사용한다.
  const modelMessages = await convertToModelMessages(
    messages as any
  );

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
