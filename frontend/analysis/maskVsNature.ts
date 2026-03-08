/**
 * 사회적 가면 vs 실제 기질 분석
 * AI 해석용 룰셋: 월주(사회적 가면) → 시주(실제 기질) → 시지(무의식 패턴) → 겉과 속 종합
 * 600~700자, 문단 3개 고정.
 */

type CharKey = "empathy" | "reality" | "fun";

const pick = <T,>(v: T | undefined, fallback: T) => (v === undefined || v === "" ? fallback : v);

// ── ① 사회적 가면 (월주) ─────────────────────────────────────

/** 2-1 월간 육친: 어떤 이미지로 보이고 싶은지 (사회 속 태도) */
const MONTH_STEM_IMAGE: Record<string, string> = {
  비견: "독립적인 사람처럼 보이고 싶은 경향",
  겁재: "경쟁력 있고 강한 인상을 주려는 성향",
  식신: "편안하고 표현이 많은 이미지",
  상관: "개성 있고 자유로운 이미지",
  편재: "활동적이고 실리적인 이미지",
  정재: "안정적이고 신뢰감 있는 이미지",
  편관: "강단 있고 책임감 있는 이미지",
  정관: "규칙적이고 바른 이미지",
  편인: "독특하고 생각 많은 이미지",
  정인: "이해심 있고 배려 깊은 이미지",
};

/** 2-2 월지 육친: 사회 속 행동 방식 */
const MONTH_BRANCH_ACTION: Record<string, string> = {
  비견: "자기 방식 유지",
  겁재: "자기 방식 유지",
  식신: "말과 표현으로 관계 형성",
  상관: "말과 표현으로 관계 형성",
  편재: "실리와 관계 관리",
  정재: "실리와 관계 관리",
  편관: "책임과 역할 중심",
  정관: "책임과 역할 중심",
  편인: "이해와 판단 중심",
  정인: "이해와 판단 중심",
};

/** 2-3 십이운성: 사회적 에너지 강도 (강함/중간/약함) */
const TWELVE_STATE_STRENGTH: Record<string, "strong" | "mid" | "weak"> = {
  제왕: "strong", 건록: "strong", 장생: "strong", 관대: "strong",
  목욕: "mid", 양: "mid", 태: "mid", 태지: "mid",
  쇠: "weak", 병: "weak", 사: "weak", 묘: "weak", 절: "weak", 절지: "weak", 쇠지: "weak", 병지: "weak",
};

/** 십이운성 강도별 문장 (편입니다/경향이 있습니다 톤) */
const STATE_STRENGTH_SENTENCE: Record<"strong" | "mid" | "weak", { empathy: string; reality: string; fun: string }> = {
  strong: {
    empathy: "사회적 존재감이 뚜렷한 편이에요.",
    reality: "사회적 존재감이 뚜렷한 편입니다.",
    fun: "사회적으로 존재감이 뚜렷한 편이야.",
  },
  mid: {
    empathy: "자연스럽게 드러나는 편이에요.",
    reality: "자연스럽게 드러나는 편입니다.",
    fun: "자연스럽게 드러나는 편이야.",
  },
  weak: {
    empathy: "겉으로 강하게 드러나지 않더라도 내면의 기준이 있는 편이에요.",
    reality: "겉으로 강하게 드러나지 않더라도 내면의 기준이 있는 편입니다.",
    fun: "겉으로 강하게 드러나지 않더라도 속에 기준이 있는 편이야.",
  },
};

// ── ② 실제 기질 (시주) ─────────────────────────────────────

/** 3-1 시간 육친: 내면 성향 / 편할 때 모습 */
const HOUR_STEM_NATURE: Record<string, string> = {
  비견: "자기 방식 고수",
  겁재: "경쟁심",
  식신: "즐기고 표현",
  상관: "틀을 깨고 싶음",
  편재: "기회 감지",
  정재: "안정 추구",
  편관: "도전 욕구",
  정관: "질서 필요",
  편인: "생각 정리",
  정인: "이해 후 행동",
};

// ── ③ 무의식 패턴 (시지) ─────────────────────────────────────

/** 4. 시지 육친: 무의식 행동 패턴 */
const HOUR_BRANCH_HABIT: Record<string, string> = {
  비견: "혼자 해결하려는 습관",
  겁재: "경쟁심으로 돌파",
  식신: "즐거움으로 해소",
  상관: "답답하면 표현",
  편재: "가능성 탐색",
  정재: "안정 루틴",
  편관: "스스로 압박",
  정관: "규칙 유지",
  편인: "혼자 생각",
  정인: "확인 후 행동",
};

// ── ⑤ 겉과 속 종합 문장 템플릿 ─────────────────────────────

/** 월간 vs 시간 차이 문장: "겉에서는 ~처럼 보이지만 실제로는 ~ 그래서 가까워질수록 ~" */
function buildSynthesis(
  monthStemTenGod: string,
  hourStemTenGod: string,
  tone: CharKey
): string {
  const maskPhrase = pick(MONTH_STEM_IMAGE[monthStemTenGod], "어떤 이미지로 비치려는 경향");
  const naturePhrase = pick(HOUR_STEM_NATURE[hourStemTenGod], "내면의 성향");
  const strongSuffix = { empathy: "강한 편이에요.", reality: "강한 편입니다.", fun: "강한 편이야." };
  const closing = {
    empathy: "가까워질수록 그런 모습이 드러나는 편이에요.",
    reality: "가까워질수록 그런 모습이 드러나는 편입니다.",
    fun: "가까워질수록 그런 모습이 드러나는 편이야.",
  };
  return `겉에서는 ${maskPhrase}으로 보일 수 있지만, 실제로는 ${naturePhrase}하는 성향이 더 ${strongSuffix[tone]} 그래서 ${closing[tone]}`;
}

/** 말투 변환: empathy=-에요, reality=-입니다, fun=-야 */
function toTone(sentence: string, tone: CharKey): string {
  if (tone === "empathy") return sentence;
  if (tone === "reality") {
    return sentence
      .replace(/편이에요/g, "편입니다")
      .replace(/경향이에요/g, "경향입니다")
      .replace(/있어요/g, "있습니다")
      .replace(/드러나요/g, "드러납니다")
      .replace(/나타나는 편이에요/g, "나타나는 편입니다")
      .replace(/해요\./g, "합니다.")
      .replace(/보이기도 해요/g, "보이기도 합니다");
  }
  if (tone === "fun") {
    return sentence
      .replace(/편이에요/g, "편이야")
      .replace(/경향이에요/g, "경향이야")
      .replace(/있어요/g, "있어")
      .replace(/드러나요/g, "드러나")
      .replace(/나타나는 편이에요/g, "나타나는 편이야")
      .replace(/해요\./g, "해.")
      .replace(/보이기도 해요/g, "보이기도 해");
  }
  return sentence;
}

interface MaskVsNatureResult {
  text: string;
}

/**
 * 사회적 가면 vs 실제 기질 분석 (600~700자, 3문단)
 * ① 사회적 가면 (월주) ② 실제 기질 (시주) ③ 무의식 패턴 (시지) + 겉과 속 종합
 */
export function analyzeMaskVsNature(
  monthStemTenGod: string,
  monthBranchTenGod: string,
  monthTwelveState: string,
  hourStemTenGod: string,
  hourBranchTenGod: string,
  selectedChar: CharKey
): MaskVsNatureResult {
  const t = selectedChar;

  // ① 사회적 가면 (월주): 월간 이미지 + 월지 행동 + 십이운성 강도 (~230자)
  const imagePhrase = pick(MONTH_STEM_IMAGE[monthStemTenGod], "사회에서 자기만의 이미지를 갖추려는 경향");
  const actionPhrase = pick(MONTH_BRANCH_ACTION[monthBranchTenGod || monthStemTenGod], "사회 속에서 일정한 행동 스타일을 보이는 편");
  const strengthKey = pick(TWELVE_STATE_STRENGTH[monthTwelveState], "mid");
  const strengthSentence = STATE_STRENGTH_SENTENCE[strengthKey][t];
  const p1Raw = `사회에서는 ${imagePhrase}으로 비치는 경향이 있어요. 행동으로는 ${actionPhrase}하는 쪽에 가깝고, ${strengthSentence} 주변에서는 그런 모습으로 기억되는 일이 많은 편이에요.`;
  const p1 = toTone(p1Raw, t);

  // ② 실제 기질 (시주): 시간 육친 (~230자)
  const naturePhrase = pick(HOUR_STEM_NATURE[hourStemTenGod], "편할 때 드러나는 내면의 성향");
  const p2Raw = `편한 자리에서는 ${naturePhrase}하는 면이 더 크게 올라오는 편이에요. 내면 성향이나 본능적 욕구가 이쪽에 가깝게 움직이는 경향이 있어요. 그래서 가까운 관계일수록 위와 다른 모습이 보이기도 해요.`;
  const p2 = toTone(p2Raw, t);

  // ③ 무의식 패턴 (시지) + ④ 겉과 속 종합 (~200자)
  const habitPhrase = pick(HOUR_BRANCH_HABIT[hourBranchTenGod || hourStemTenGod], "무의식적으로 반복되는 패턴");
  const synthesis = buildSynthesis(monthStemTenGod, hourStemTenGod, t);
  const p3Raw = `무의식적으로는 ${habitPhrase}이 나타나는 편이에요. ${synthesis}`;
  const p3 = toTone(p3Raw, t);

  const full = [p1, p2, p3].join("\n\n");
  let out = full;

  // 600~700자 유지
  if (out.length > 700) {
    out = out.slice(0, 670).trim();
    const lastDot = out.lastIndexOf(".");
    if (lastDot > 550) out = out.slice(0, lastDot + 1);
  }
  if (out.length < 600 && full.length >= 600) {
    out = full.slice(0, 650).trim();
    const lastDot = out.lastIndexOf(".");
    if (lastDot > 500) out = out.slice(0, lastDot + 1);
  }

  return { text: out };
}
