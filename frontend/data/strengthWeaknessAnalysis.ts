// frontend/data/strengthWeaknessAnalysis.ts
// 나의 강점과 약점 — 일간 기준 오행→육친(십신) 해석. 2~3개=적당·잘 쓸 수 있음, 4개 이상=잘 쓸 수 있으나 과하면 조절 필요, 0개=보완 여지. ~600자, 가독성·긍정 톤, 비난 금지

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

/** 일간 오행별 → 해당 오행이 일간 기준 어떤 육친(십신)인지 */
const ELEMENT_AS_TEN_GOD: Record<string, Record<string, string>> = {
  "木": { "木": "비겁", "火": "식상", "土": "재성", "金": "관성", "水": "인성" },
  "火": { "火": "비겁", "土": "식상", "金": "재성", "水": "관성", "木": "인성" },
  "土": { "土": "비겁", "金": "식상", "水": "재성", "木": "관성", "火": "인성" },
  "金": { "金": "비겁", "水": "식상", "木": "재성", "火": "관성", "土": "인성" },
  "水": { "水": "비겁", "木": "식상", "火": "재성", "土": "관성", "金": "인성" },
};

/** 십신(육친)별 기능 설명 — 잘 쓸 수 있다는 식으로, 비난 없이 */
const TEN_GOD_FUNCTION: Record<string, Record<StrengthWeakToneKey, string>> = {
  비겁: {
    empathy: "자기 확신과 독립성, 동료와 함께하는 힘을 잘 발휘하실 수 있어요.",
    reality: "비겁(주체성·동료)의 기능을 잘 활용할 수 있는 구조입니다.",
    fun: "자기 페이스랑 동료와의 협력 그거 잘 쓸 수 있는 타입이야.",
  },
  식상: {
    empathy: "말과 표현, 재능과 창의성을 세상에 잘 꺼내 쓰실 수 있어요.",
    reality: "식상(표현·재능)의 기능을 잘 활용할 수 있는 구조입니다.",
    fun: "말이랑 재능, 표현하는 거 잘 쓸 수 있어.",
  },
  재성: {
    empathy: "현실 감각과 결과물, 재물을 다루는 능력을 잘 발휘하실 수 있어요.",
    reality: "재성(재물·현실감각)의 기능을 잘 활용할 수 있는 구조입니다.",
    fun: "돈이랑 결과물, 현실 감각 잘 쓸 수 있는 편이야.",
  },
  관성: {
    empathy: "책임감과 규율, 조직과 명예를 다루는 힘을 잘 발휘하실 수 있어요.",
    reality: "관성(책임·명예)의 기능을 잘 활용할 수 있는 구조입니다.",
    fun: "책임감이랑 규칙, 조직에서의 역할 잘 쓸 수 있어.",
  },
  인성: {
    empathy: "학문과 인내, 배움과 지혜를 쌓는 힘을 잘 발휘하실 수 있어요.",
    reality: "인성(학문·인내)의 기능을 잘 활용할 수 있는 구조입니다.",
    fun: "공부랑 인내, 배우는 거 잘 쓸 수 있는 타입이야.",
  },
};

/** 해당 오행이 0개일 때 — 보완 여지만, 비난 없이 */
const TEN_GOD_ABSENT: Record<string, Record<StrengthWeakToneKey, string>> = {
  비겁: {
    empathy: "스스로 확신을 갖고 동료와의 관계를 조금씩 쌓아 가시면 좋아요.",
    reality: "주체성·동료 관계를 의식적으로 키우면 보완에 도움이 됩니다.",
    fun: "자기 페이스랑 동료 관계 조금씩 쌓아 보면 좋겠어.",
  },
  식상: {
    empathy: "말과 표현을 조금씩 늘려 보시면 그만큼 재능이 더 드러나기 쉬워요.",
    reality: "표현·재능을 의식적으로 발휘하면 보완에 도움이 됩니다.",
    fun: "말이랑 표현 조금씩 늘려 보면 재능이 더 보일 거야.",
  },
  재성: {
    empathy: "작은 것부터 정리하고 결과를 챙기는 습관이 도움이 됩니다.",
    reality: "현실감각·결과 관리를 단계적으로 늘리면 보완에 도움이 됩니다.",
    fun: "작은 거부터 정리하고 결과 챙기는 습관이 도움 돼.",
  },
  관성: {
    empathy: "역할과 책임을 작게 나누어 맡아 보시면 좋아요.",
    reality: "책임·규율을 소규모로 경험하면 보완에 도움이 됩니다.",
    fun: "역할이랑 책임 작게 나눠서 맡아 보면 좋아.",
  },
  인성: {
    empathy: "배우고 싶은 것을 하나씩 쌓아 가시면 인내와 지혜가 늘어요.",
    reality: "학문·인내를 꾸준히 쌓으면 보완에 도움이 됩니다.",
    fun: "배우고 싶은 거 하나씩 쌓아 가면 좋겠어.",
  },
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

/** 일간 한자 → 오행 */
function getDayStemElement(pillars: SajuPillars): string {
  const stem = pillars.day?.cheongan?.hanja?.[0] ?? "";
  return stem ? (STEM_TO_ELEMENT[stem] ?? "木") : "木";
}

/** 오행 개수별 구분: 적당(2~3), 많음(4+), 없음(0) */
function getElementGroups(count: Record<string, number>) {
  const elements = ["木", "火", "土", "金", "水"] as const;
  const moderate: string[] = [];
  const many: string[] = [];
  const absent: string[] = [];
  for (const el of elements) {
    const n = count[el] ?? 0;
    if (n >= 2 && n <= 3) moderate.push(el);
    else if (n >= 4) many.push(el);
    else if (n === 0) absent.push(el);
  }
  return { moderate, many, absent };
}

/**
 * 나의 강점과 약점 문단. 일간 기준 육친(십신)으로 해석, ~600자, 가독성·긍정 톤.
 * 2~3개 = 적당히 있어 그 육친 기능을 잘 쓸 수 있음.
 * 4개 이상 = 잘 쓸 수 있으나 과하면 조절이 필요할 수 있음.
 * 0개 = 보완 여지만 안내, 비난 없음.
 */
export function getStrengthWeaknessParagraph(pillars: SajuPillars, tone: StrengthWeakToneKey): string {
  const count = countElementsByRow(pillars);
  const dayElement = getDayStemElement(pillars);
  const elementToTenGod = ELEMENT_AS_TEN_GOD[dayElement] ?? ELEMENT_AS_TEN_GOD["木"];
  const { moderate, many, absent } = getElementGroups(count);

  const lines: string[] = [];

  if (tone === "empathy") {
    lines.push("당신의 사주는 일간(나)을 기준으로, 각 오행이 어떤 역할(육친)로 작동하는지가 분명한 편이에요.");
    if (moderate.length > 0) {
      const list = moderate.map((el) => `${ELEMENT_NAMES[el]} 기운이 2~3개씩 적당히 있어 일간 기준 ‘${elementToTenGod[el]}’에 해당하는 힘을 잘 쓰실 수 있어요. ${TEN_GOD_FUNCTION[elementToTenGod[el]]?.[tone] ?? ""}`).join(" ");
      lines.push(list + " 이런 부분이 당신만의 강점이에요.");
    }
    if (many.length > 0) {
      const list = many.map((el) => `${ELEMENT_NAMES[el]} 기운이 네 개 이상 있어 ‘${elementToTenGod[el]}’ 기능도 잘 쓸 수 있는 구조예요. 다만 기운이 지나치면 조절이 필요할 수 있으니, 적당히 나누어 쓰시면 더욱 좋아요.`).join(" ");
      lines.push(list);
    }
    if (moderate.length === 0 && many.length === 0) {
      lines.push("오행이 한두 개씩 골고루 있어, 특정 역할에 치우치지 않고 균형 있게 쓰시기 좋은 사주예요.");
    }
    if (absent.length > 0) {
      const list = absent.map((el) => `${ELEMENT_NAMES[el]} 기운이 없어 일간 기준 ‘${elementToTenGod[el]}’에 해당하는 부분은 보완할 여지가 있어요. ${TEN_GOD_ABSENT[elementToTenGod[el]]?.[tone] ?? ""}`).join(" ");
      lines.push("반면 " + list);
    } else if (moderate.length > 0 || many.length > 0) {
      lines.push("결여된 오행이 뚜렷하지 않아, 전반적으로 고른 기운을 갖추고 계세요.");
    }
  } else if (tone === "reality") {
    lines.push("일간 기준 오행 분포상, 각 오행이 육친(십신)으로 어떤 기능을 하는지가 뚜렷합니다.");
    if (moderate.length > 0) {
      const list = moderate.map((el) => `${ELEMENT_NAMES[el]} 2~3개로 적정하여 ‘${elementToTenGod[el]}’ 기능을 잘 활용할 수 있습니다. ${TEN_GOD_FUNCTION[elementToTenGod[el]]?.[tone] ?? ""}`).join(" ");
      lines.push(list);
    }
    if (many.length > 0) {
      const list = many.map((el) => `${ELEMENT_NAMES[el]} 4개 이상으로 많아 ‘${elementToTenGod[el]}’ 기능을 충분히 쓸 수 있으나, 과하면 조절이 필요할 수 있습니다.`).join(" ");
      lines.push(list);
    }
    if (moderate.length === 0 && many.length === 0) {
      lines.push("오행이 고르게 분포하여 균형형에 가깝습니다.");
    }
    if (absent.length > 0) {
      const list = absent.map((el) => `${ELEMENT_NAMES[el]} 결여로 ‘${elementToTenGod[el]}’ 영역은 보완 여지가 있습니다. ${TEN_GOD_ABSENT[elementToTenGod[el]]?.[tone] ?? ""}`).join(" ");
      lines.push("한편 " + list);
    } else {
      lines.push("특정 오행 결여가 뚜렷하지 않습니다.");
    }
  } else {
    lines.push("네 사주는 일간 기준으로 오행이 어떤 역할(육친)로 나오는지가 잘 드러나는 편이야.");
    if (moderate.length > 0) {
      const list = moderate.map((el) => `${ELEMENT_NAMES[el]}가 2~3개씩 적당히 있어서 ‘${elementToTenGod[el]}’ 그거 잘 쓸 수 있어. ${TEN_GOD_FUNCTION[elementToTenGod[el]]?.[tone] ?? ""}`).join(" ");
      lines.push(list + " 이게 네 강점이야.");
    }
    if (many.length > 0) {
      const list = many.map((el) => `${ELEMENT_NAMES[el]}가 네 개 이상 있어서 ‘${elementToTenGod[el]}’ 기능 잘 쓸 수 있긴 한데, 너무 많으면 조절이 필요할 수 있어. 적당히 나눠 쓰면 좋아.`).join(" ");
      lines.push(list);
    }
    if (moderate.length === 0 && many.length === 0) {
      lines.push("오행이 골고루 있어서 한쪽만 튀진 않는 타입이야.");
    }
    if (absent.length > 0) {
      const list = absent.map((el) => `${ELEMENT_NAMES[el]}가 없어서 ‘${elementToTenGod[el]}’ 쪽은 보완할 여지가 있어. ${TEN_GOD_ABSENT[elementToTenGod[el]]?.[tone] ?? ""}`).join(" ");
      lines.push("대신 " + list);
    } else {
      lines.push("없는 오행이 뚜렷하지 않아서 전반적으로 고른 편이야.");
    }
  }

  const text = lines.join("\n\n").trim();
  if (text.length >= 580) return text;
  const tail = tone === "empathy" ? "당신만의 강점을 알아가시는 데 이 해석이 조금이라도 도움이 되면 좋겠어요." : tone === "reality" ? "위 내용을 참고하여 강점을 활용하고 보완 여지를 점검하시면 됩니다." : "이 해석이 네 강점 알아가는 데 조금이라도 도움 되면 좋겠어.";
  return text + "\n\n" + tail;
}
