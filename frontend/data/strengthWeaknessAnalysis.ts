// frontend/data/strengthWeaknessAnalysis.ts
// 나의 강점과 약점 — 사주 8글자 중 오행 개수: 2~3개 = 강점, 0개 = 약점. 이론(천간·지지·오행·십신) 기반 ~600자(강점 450자, 약점 150자), 3가지 말투

export type StrengthWeakToneKey = "empathy" | "reality" | "fun";

const STEM_TO_ELEMENT: Record<string, string> = {
  "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土",
  "庚": "金", "辛": "金", "壬": "水", "癸": "水",
};
const BRANCH_TO_ELEMENT: Record<string, string> = {
  "寅": "木", "卯": "木", "巳": "火", "午": "火", "辰": "土", "戌": "土", "丑": "土", "未": "土",
  "申": "金", "酉": "金", "子": "水", "亥": "水",
};

const ELEMENT_NAMES: Record<string, string> = {
  "木": "목(木)", "火": "화(火)", "土": "토(土)", "金": "금(金)", "水": "수(水)",
};

/** 오행별 강점 문장 (해당 오행이 2~3개일 때 쓸 문장) — 이론(천간·지지·오행·육친십신) 요약 */
const ELEMENT_STRENGTH: Record<string, Record<StrengthWeakToneKey, string>> = {
  "木": {
    empathy: "목(木) 기운이 적당히 있어 성장과 추진의 힘이 잘 발휘됩니다. 봄의 나무처럼 위로 뻗어 나가려는 의지와 기획력, 약자를 보살피는 리더십이 당신의 강점이에요. 다만 마무리보다 시작에 강한 편이니 끈기만 더하면 좋습니다.",
    reality: "목(木) 기운이 2~3개로 균형 있어 성장·추진·기획 역량이 강합니다. 천간 갑목/을목과 지지 인묘의 특성상 상승 작용과 유연한 적응력이 두드러지며, 리더십과 개척력이 강점으로 작용합니다.",
    fun: "목 기운이 적당히 있어서 성장하고 쑥쑥 나가는 힘이 있어. 기획이랑 추진은 네 강점이고, 약한 사람 챙기는 리더십도 잘 맞아. 끝까지 가는 끈기만 보강하면 좋겠어.",
  },
  "火": {
    empathy: "화(火) 기운이 적당히 있어 밝은 태양처럼 주변을 비추는 힘이 있습니다. 명랑함과 열정, 예의와 절도를 갖춘 대인관계가 당신의 강점이에요. 다만 과한 발산은 지치게 하니 때로는 쉬어 가는 것이 좋습니다.",
    reality: "화(火) 기운이 2~3개로 적정하여 발산력·표현력·사회성이 강합니다. 병정화와 사오의 특성상 리더십과 규율 의식이 두드러지며, 명랑·당당·예의가 강점으로 작용합니다.",
    fun: "화 기운이 적당히 있어서 밝고 열정적인 게 강점이야. 주변 비추는 태양 같은 존재감이 있고, 예의랑 절도도 잘 지키는 편. 대신 너무 퍼주면 지치니까 충전도 해.",
  },
  "土": {
    empathy: "토(土) 기운이 적당히 있어 넓은 땅처럼 포용과 안정감을 줍니다. 성실함과 끈기, 협력과 희생정신이 당신의 강점이에요. 주변을 든든히 받쳐 주는 존재감이 있어, 신뢰를 쌓기 좋습니다.",
    reality: "토(土) 기운이 2~3개로 균형 있어 안정·포용·중재 역량이 강합니다. 무기토와 진술축미의 특성상 성실·끈기·협력이 두드러지며, 토대 구축과 신뢰 형성이 강점으로 작용합니다.",
    fun: "토 기운이 적당히 있어서 포용력이랑 안정감이 강점이야. 성실하고 끈기 있게 버티는 편이고, 협력·희생도 잘해. 주변 받쳐 주는 든든한 타입이지.",
  },
  "金": {
    empathy: "금(金) 기운이 적당히 있어 원칙과 정리가 분명합니다. 질서 감각, 결단력, 정의감이 당신의 강점이에요. 자기 세계를 잘 구조화하고 말과 행동에 무게가 있어 신뢰를 줍니다.",
    reality: "금(金) 기운이 2~3개로 적정하여 구조화·원칙·결단 역량이 강합니다. 경신금과 신유의 특성상 정리·규칙·정의감이 두드러지며, 명분과 결과 지향이 강점으로 작용합니다.",
    fun: "금 기운이 적당히 있어서 원칙이랑 정리가 네 강점이야. 질서감 있고 결단력 있게 행동하고, 말한 거 지키는 편이라 신뢰받아.",
  },
  "水": {
    empathy: "수(水) 기운이 적당히 있어 지혜와 통찰이 잘 발휘됩니다. 빠른 두뇌 회전, 유연한 적응, 넓은 포용이 당신의 강점이에요. 상황을 읽고 시원하게 일을 풀어 나가는 능력이 있습니다.",
    reality: "수(水) 기운이 2~3개로 균형 있어 총명·유연·포용 역량이 강합니다. 임계수와 자해의 특성상 기획·직관·적응력이 두드러지며, 지혜와 통찰이 강점으로 작용합니다.",
    fun: "수 기운이 적당히 있어서 머리 회전이랑 통찰이 강점이야. 유연하게 상황 읽고 시원하게 풀어 나가는 스타일이고, 포용력도 있어.",
  },
};

/** 오행별 약점 한 줄 (해당 오행이 0개일 때) */
const ELEMENT_WEAKNESS: Record<string, Record<StrengthWeakToneKey, string>> = {
  "木": {
    empathy: "목(木) 기운이 없어 성장·추진·기획을 스스로 이끌 때 부담을 느낄 수 있어요. 작은 목표부터 차근차근 시작하는 습관이 도움이 됩니다.",
    reality: "목(木) 결여로 추진·기획·상승 에너지가 상대적으로 약합니다. 단계적 목표 설정과 리드 경험이 보완에 유리합니다.",
    fun: "목이 없어서 추진이랑 기획이 조금 부담될 수 있어. 작은 걸부터 차근차근 해 보는 게 좋아.",
  },
  "火": {
    empathy: "화(火) 기운이 없어 밖으로 표출하는 에너지가 적을 수 있어요. 작은 것이라도 꾸준히 말하고 표현하는 연습이 도움이 됩니다.",
    reality: "화(火) 결여로 발산·표현·사회적 활력이 상대적으로 약합니다. 소통과 자기표현을 의식적으로 늘리는 것이 보완에 유리합니다.",
    fun: "화가 없어서 표현이랑 활력이 조금 부족할 수 있어. 말하고 드러내는 걸 조금씩 늘려 보면 좋아.",
  },
  "土": {
    empathy: "토(土) 기운이 없어 안정감이나 끈기가 부족하게 느껴질 수 있어요. 루틴을 정하고 한 가지를 오래 지키는 연습이 도움이 됩니다.",
    reality: "토(土) 결여로 안정·지속·포용 역량이 상대적으로 약합니다. 루틴 확보와 소규모 책임 유지가 보완에 유리합니다.",
    fun: "토가 없어서 안정이랑 끈기가 조금 부족할 수 있어. 하나 정해서 오래 지키는 습관이 도움 돼.",
  },
  "金": {
    empathy: "금(金) 기운이 없어 정리나 원칙을 세우는 데 어려움을 느낄 수 있어요. 할 일을 짧게 나누고 하나씩 정리하는 습관이 도움이 됩니다.",
    reality: "금(金) 결여로 구조화·원칙·결단 역량이 상대적으로 약합니다. 단위 업무 정리와 기준 설정이 보완에 유리합니다.",
    fun: "금이 없어서 정리나 원칙이 조금 어려울 수 있어. 할 일 잘게 나눠서 하나씩 끝내 보면 좋아.",
  },
  "水": {
    empathy: "수(水) 기운이 없어 직관이나 유연한 판단이 부족하게 느껴질 수 있어요. 정보를 모은 뒤 잠시 쉬고 결정하는 습관이 도움이 됩니다.",
    reality: "수(水) 결여로 총명·유연·기획 역량이 상대적으로 약합니다. 정보 수집 후 숙고 시간을 두는 것이 보완에 유리합니다.",
    fun: "수가 없어서 직관이랑 유연한 판단이 조금 부족할 수 있어. 정보 모은 다음에 잠깐 쉬고 결정해 보면 좋아.",
  },
};

const INTRO_STRENGTH: Record<StrengthWeakToneKey, string> = {
  empathy: "당신의 사주 팔자에는 ",
  reality: "사주 팔자 오행 분포상 ",
  fun: "네 사주에는 ",
};

const INTRO_WEAKNESS: Record<StrengthWeakToneKey, string> = {
  empathy: "반면 ",
  reality: "한편 ",
  fun: "대신 ",
};

export interface SajuPillars {
  year: { cheongan: { hanja: string }; jiji: { hanja: string } };
  month: { cheongan: { hanja: string }; jiji: { hanja: string } };
  day: { cheongan: { hanja: string }; jiji: { hanja: string } };
  hour: { cheongan: { hanja: string }; jiji: { hanja: string } };
}

/** 8글자에서 오행별 개수 집계 */
function countElementsByRow(pillars: SajuPillars): Record<string, number> {
  const count: Record<string, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };
  const order: (keyof SajuPillars)[] = ["year", "month", "day", "hour"];
  for (const key of order) {
    const pillar = pillars[key];
    if (!pillar) continue;
    const stem = pillar.cheongan?.hanja?.[0] ?? "";
    const branch = pillar.jiji?.hanja?.[0] ?? "";
    const e1 = stem ? STEM_TO_ELEMENT[stem] : "";
    const e2 = branch ? BRANCH_TO_ELEMENT[branch] : "";
    if (e1) count[e1] = (count[e1] ?? 0) + 1;
    if (e2) count[e2] = (count[e2] ?? 0) + 1;
  }
  return count;
}

/** 강점 오행(2~3개), 약점 오행(0개) 구분 */
function getStrongAndWeak(count: Record<string, number>): { strong: string[]; weak: string[] } {
  const elements = ["木", "火", "土", "金", "水"] as const;
  const strong: string[] = [];
  const weak: string[] = [];
  for (const el of elements) {
    const n = count[el] ?? 0;
    if (n >= 2 && n <= 3) strong.push(el);
    else if (n === 0) weak.push(el);
  }
  return { strong, weak };
}

/**
 * 나의 강점과 약점 문단 생성. 강점 ~450자, 약점 ~150자, 총 ~600자.
 * 2~3개 있는 오행 = 강점, 0개인 오행 = 약점. 3가지 말투.
 */
export function getStrengthWeaknessParagraph(pillars: SajuPillars, tone: StrengthWeakToneKey): string {
  const count = countElementsByRow(pillars);
  const { strong, weak } = getStrongAndWeak(count);

  let strengthPart = INTRO_STRENGTH[tone];
  if (strong.length === 0) {
    strengthPart += tone === "empathy"
      ? "한두 개씩 골고루 퍼진 오행이 있어, 특정 한 가지보다는 균형 있는 기운으로 살아가시는 편이에요. 무리하게 한쪽만 쓰기보다는 상황에 맞게 나누어 쓰는 것이 좋습니다."
      : tone === "reality"
        ? "오행이 고르게 분포하여 한 영역에 치우치지 않는 균형형에 가깝습니다. 상황별로 강점을 선택해 쓰는 전략이 유리합니다."
        : "오행이 골고루 있어서 한쪽만 튀진 않는 타입이야. 상황에 맞게 골라 쓰는 게 좋아.";
  } else {
    const parts = strong.map(el => ELEMENT_STRENGTH[el][tone]);
    if (tone === "reality" && strong.length > 0) {
      strengthPart += strong.map(el => ELEMENT_NAMES[el]).join(", ") + " 기운이 적정하여 " + (parts[0] ?? "");
      for (let i = 1; i < parts.length; i++) strengthPart += " " + (parts[i] ?? "");
    } else {
      strengthPart += parts.join(" ");
    }
  }

  let weaknessPart = INTRO_WEAKNESS[tone];
  if (weak.length === 0) {
    weaknessPart += tone === "empathy"
      ? "결여된 오행이 뚜렷하지 않아, 전반적으로 고른 기운을 갖추고 있어요. 부족한 부분이 보일 때마다 그때그때 보완하시면 됩니다."
      : tone === "reality"
        ? "특정 오행 결여가 뚜렷하지 않아 보완은 상황에 따라 조정하시면 됩니다."
        : "특별히 없는 오행이 없어서, 부족하다 싶을 때만 조금씩 보완하면 돼.";
  } else {
    const parts = weak.map(el => ELEMENT_WEAKNESS[el][tone]);
    weaknessPart += tone === "empathy"
      ? weak.map(el => ELEMENT_NAMES[el]).join(", ") + " 기운이 없어 " + parts.join(" ")
      : tone === "reality"
        ? weak.map(el => ELEMENT_NAMES[el]).join(", ") + " 결여로 " + parts.join(" ")
        : weak.map(el => ELEMENT_NAMES[el]).join(", ") + "가 없어 " + parts.join(" ");
  }

  return strengthPart + "\n\n" + weaknessPart;
}
