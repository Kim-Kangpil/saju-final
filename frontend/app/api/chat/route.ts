import { streamText, convertToModelMessages, tool, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { detectIntent, assembleKnowledge } from "./knowledge/index";
import { SAJU_EN_TERMS_GUIDE } from "./knowledge/enTerms";
import { TOOL_RULES, QUALITY_PHILOSOPHY } from "./knowledge/base";
import { TIME_RULES } from "./knowledge/time";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

async function fetchTheoryFromBackend(
  query: string,
  intent: string
): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/theory/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, intent }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return data.theory || "";
  } catch {
    return "";
  }
}

/** `true`일 때만 로그인 유저 채팅에 멤버십 검사. 기본 꺼둠(나중에 도입 시 .env에 true). */
const CHAT_MEMBERSHIP_REQUIRED = process.env.CHAT_MEMBERSHIP_REQUIRED === "true";

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

/**
 * 백엔드에서 내려준 일간(천간 한자)을 기준으로, 십성 분류별 "해당 오행"을 고정 표로 안내한다.
 * (프론트에서 십성을 새로 계산하지 않음 — 명리 규칙상 일간-십성-오행 대응만 텍스트로 고정)
 */
const ILGAN_SIPSUNG_TO_ELEMENT: Record<string, Record<string, string>> = {
  甲: { 비겁: "목", 식상: "화", 재성: "토", 관성: "금", 인성: "수" },
  乙: { 비겁: "목", 식상: "화", 재성: "토", 관성: "금", 인성: "수" },
  丙: { 비겁: "화", 식상: "토", 재성: "금", 관성: "수", 인성: "목" },
  丁: { 비겁: "화", 식상: "토", 재성: "금", 관성: "수", 인성: "목" },
  戊: { 비겁: "토", 식상: "금", 재성: "수", 관성: "목", 인성: "화" },
  己: { 비겁: "토", 식상: "금", 재성: "수", 관성: "목", 인성: "화" },
  庚: { 비겁: "금", 식상: "수", 재성: "목", 관성: "화", 인성: "토" },
  辛: { 비겁: "금", 식상: "수", 재성: "목", 관성: "화", 인성: "토" },
  壬: { 비겁: "수", 식상: "목", 재성: "화", 관성: "토", 인성: "금" },
  癸: { 비겁: "수", 식상: "목", 재성: "화", 관성: "토", 인성: "금" },
};

function elementHanToLabel(e: string): string {
  switch (e) {
    case "목":
      return "목(나무)";
    case "화":
      return "화(불)";
    case "토":
      return "토(흙)";
    case "금":
      return "금(쇠)";
    case "수":
      return "수(물)";
    default:
      return e;
  }
}

/** 일간 천간 한자(또는 첫 글자만 한자인 문자열)가 있을 때만 블록 추가 */
function appendDayStemSipsungElementGuide(parts: string[], dayStemHanja: string) {
  const raw = (dayStemHanja || "").trim();
  if (!raw) return;
  const ilgan = raw[0];
  const elementMap = ILGAN_SIPSUNG_TO_ELEMENT[ilgan];
  if (!elementMap) return;

  parts.push(`[${ilgan} 일간 기준 십성-오행 관계 — 반드시 이 기준으로만 해석]`);
  parts.push(
    `재성(편재·정재, 재물·아버지 등): ${elementHanToLabel(elementMap.재성)} 오행`,
  );
  parts.push(
    `관성(편관·정관, 직업·명예·규범 등): ${elementHanToLabel(elementMap.관성)} 오행`,
  );
  parts.push(
    `인성(편인·정인, 학문·어머니·보호 등): ${elementHanToLabel(elementMap.인성)} 오행`,
  );
  parts.push(
    `식상(식신·상관, 표현·재능·출력 등): ${elementHanToLabel(elementMap.식상)} 오행`,
  );
  parts.push(
    `비겁(비견·겁재, 형제·동료·자아 등): ${elementHanToLabel(elementMap.비겁)} 오행`,
  );
  parts.push(
    `※ 이 기준을 절대로 벗어나지 말 것. ${ilgan} 일간일 때 재성은 ${elementHanToLabel(elementMap.재성)}에 해당한다. 시스템에 적힌 십성(편재/정재 등) 이름과 결합해 해석할 것. 일간 없이 임의로 오행을 바꾸거나 자체 계산·추측 금지.`,
  );
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

  const dayStemHanja = (model.day.cheongan?.hanja ?? "").trim();
  appendDayStemSipsungElementGuide(parts, dayStemHanja);

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

  const dCheongan = dy?.cheongan as Record<string, unknown> | undefined;
  const dayStemHanja =
    dCheongan && typeof dCheongan.hanja === "string" ? dCheongan.hanja.trim() : "";
  appendDayStemSipsungElementGuide(parts, dayStemHanja);

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

/** 최상위 또는 result.* 에서 객체 필드 조회 (/saju/full 저장 형태 호환) */
function getSajuNestedRecord(saju: unknown, key: string): Record<string, unknown> | null {
  if (!saju || typeof saju !== "object") return null;
  const o = saju as Record<string, unknown>;
  const top = o[key];
  if (top && typeof top === "object" && !Array.isArray(top)) {
    return top as Record<string, unknown>;
  }
  const res = o.result;
  if (res && typeof res === "object") {
    const inner = (res as Record<string, unknown>)[key];
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      return inner as Record<string, unknown>;
    }
  }
  return null;
}

/** 백엔드 /saju/full 의 sinsal 또는 저장 객체의 result.sinsal */
function getSinsalFromSajuPayload(saju: unknown): Record<string, unknown> | null {
  return getSajuNestedRecord(saju, "sinsal");
}

function formatSinsalContextBlock(saju: unknown): string {
  const sinsal = getSinsalFromSajuPayload(saju);
  if (!sinsal) return "";

  const parts: string[] = [];
  const guiin = (sinsal.cheonul_gwiin as { description?: string }[] | undefined) ?? [];
  if (guiin.length > 0) {
    parts.push(`천을귀인: ${guiin.map((g) => g.description).join(", ")}`);
  } else {
    parts.push("천을귀인: 없음");
  }
  const dohwa = (sinsal.dohwa as { description?: string }[] | undefined) ?? [];
  parts.push(
    dohwa.length > 0 ? `도화살: ${dohwa.map((g) => g.description).join(", ")}` : "도화살: 없음",
  );
  const yeokma = (sinsal.yeokma as { description?: string }[] | undefined) ?? [];
  parts.push(
    yeokma.length > 0 ? `역마살: ${yeokma.map((g) => g.description).join(", ")}` : "역마살: 없음",
  );
  return parts.join("\n");
}

/** sinsal 아래에 붙는 ten_gods · harmony_clash · twelve_states 컨텍스트 */
function formatTenGodsHarmonyClashTwelveBlock(saju: unknown): string {
  const parts: string[] = [];

  const tenGods = getSajuNestedRecord(saju, "ten_gods");
  if (tenGods && Object.keys(tenGods).length > 0) {
    const labels: Record<string, string> = {
      year_stem: "년간",
      year_branch: "년지",
      month_stem: "월간",
      month_branch: "월지",
      day_branch: "일지",
      hour_stem: "시간",
      hour_branch: "시지",
    };
    const line = Object.entries(tenGods)
      .map(([k, v]) => `${labels[k] ?? k}(${String(v)})`)
      .join(", ");
    parts.push(`십성: ${line}`);
  }

  const hc = getSajuNestedRecord(saju, "harmony_clash");
  if (hc) {
    const items: string[] = [];
    const mapDesc = (arr: unknown) =>
      (Array.isArray(arr) ? arr : [])
        .map((x: { description?: string }) => x.description)
        .filter(Boolean)
        .join(" / ");
    if (hc.cheongan_hap && Array.isArray(hc.cheongan_hap) && hc.cheongan_hap.length) {
      items.push(`천간합: ${mapDesc(hc.cheongan_hap)}`);
    }
    if (hc.cheongan_chung && Array.isArray(hc.cheongan_chung) && hc.cheongan_chung.length) {
      items.push(`천간충: ${mapDesc(hc.cheongan_chung)}`);
    }
    if (hc.jiji_yukhap && Array.isArray(hc.jiji_yukhap) && hc.jiji_yukhap.length) {
      items.push(`지지육합: ${mapDesc(hc.jiji_yukhap)}`);
    }
    if (hc.jiji_samhap && Array.isArray(hc.jiji_samhap) && hc.jiji_samhap.length) {
      items.push(`삼합: ${mapDesc(hc.jiji_samhap)}`);
    }
    if (hc.jiji_chung && Array.isArray(hc.jiji_chung) && hc.jiji_chung.length) {
      items.push(`지지충: ${mapDesc(hc.jiji_chung)}`);
    }
    if (items.length) parts.push(items.join("\n"));
  }

  const twelve = getSajuNestedRecord(saju, "twelve_states");
  if (twelve && typeof twelve === "object") {
    const tzLabels: Record<string, string> = { year: "년주", month: "월주", day: "일주", hour: "시주" };
    const line = Object.entries(twelve)
      .filter(([, v]) => v != null && String(v).trim() !== "")
      .map(([k, v]) => `${tzLabels[k] ?? k}: ${String(v)}`)
      .join(", ");
    if (line) parts.push(`십이운성: ${line}`);
  }

  const strength = (saju as any)?.strength;
  if (strength?.strength) {
    parts.push(
      `신강약: ${strength.strength} (점수 ${strength.total_score}, 득령 ${strength.deukryeong ? "O" : "X"}, 득지 ${strength.deukji ? "O" : "X"}, 득세 ${strength.deukse ? "O" : "X"})`,
    );
    parts.push(`신강약 조합 판단: ${strength.combination ?? "판단 불가"}`);
  }

  return parts.join("\n");
}

function buildSajuContext(saju: unknown): string {
  console.log("🔍 saju payload:", JSON.stringify(saju, null, 2));
  if (!saju || typeof saju !== "object") return "";
  const payload = saju as SajuPayload;

  const derivedBlock = [
    formatSinsalContextBlock(saju),
    formatTenGodsHarmonyClashTwelveBlock(saju),
  ]
    .filter(Boolean)
    .join("\n");

  const fromModel = buildSajuContextFromModel(payload);
  if (fromModel) {
    return derivedBlock ? `${fromModel}\n${derivedBlock}` : fromModel;
  }

  const legacy = buildSajuContextLegacy(payload);
  if (legacy) {
    return derivedBlock ? `${legacy}\n${derivedBlock}` : legacy;
  }
  return derivedBlock;
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
- 십성·합충·십이운성 해석 시 반드시 시스템 컨텍스트에 있는 계산값을 기준으로 말하고, 직접 계산하거나 추측하지 마라.
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

  // 백엔드 동적 이론 (실패해도 채팅은 계속)
  const backendTheory = await fetchTheoryFromBackend(lastUserMessage, intent);
  const theoryBlock = backendTheory
    ? `\n\n[사주 이론 참고 자료 — 해석 시 반드시 참고]\n${backendTheory}`
    : "";

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
    theoryBlock,
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

  // ── 로그인 유저: 멤버십 (CHAT_MEMBERSHIP_REQUIRED=true 일 때만 검사) ──
  if (!isGuest && CHAT_MEMBERSHIP_REQUIRED) {
    const cookieHeader = req.headers.get("cookie") || "";
    const authHeader = req.headers.get("authorization") || "";
    const memRes = await fetch(`${API_BASE}/api/membership/status`, {
      method: "GET",
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    }).catch(() => null);

    if (!memRes) {
      return new Response(JSON.stringify({ error: "멤버십 확인에 실패했어요. 잠시 후 다시 시도해주세요." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!memRes.ok) {
      const errJson = await memRes.json().catch(() => null);
      const detail =
        errJson?.detail ||
        errJson?.error ||
        (memRes.status === 401 ? "로그인이 필요합니다." : "요청을 처리할 수 없어요.");
      return new Response(JSON.stringify({ error: detail }), {
        status: memRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mem = (await memRes.json().catch(() => null)) as { is_member?: boolean } | null;
    if (!mem?.is_member) {
      return new Response(JSON.stringify({ error: "멤버십이 필요합니다." }), {
        status: 403,
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
