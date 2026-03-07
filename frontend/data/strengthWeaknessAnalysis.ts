// frontend/data/strengthWeaknessAnalysis.ts
// 나의 강점과 약점 — 일간 기준 오행→육친(십신) 해석. 이론: backend/logic/theories/사주이론(오행, 육친과 십신).txt
// 비겁=자아·동료·주체성 / 식상=표현·재능·의식주 / 재성=재물·결과 / 관성=규율·책임·명예 / 인성=학문·인내·수용
// 2~3개=적당·잘 쓸 수 있음, 4개 이상=잘 쓸 수 있으나 과하면 조절, 0개=보완 여지. ~600자, 전문용어 없이 발현·강점·보완만 풀어서 서술.

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

/**
 * 십신별 현실 발현·강점 (이론: 오행·육친과 십신).
 * 비겁=자아·동료·주체성 / 식상=표현·재능·의식주 / 재성=재물·결과·현실감각
 * 관성=규율·책임·명예 / 인성=학문·인내·수용
 */
const STRENGTH_PLAIN: Record<string, Record<StrengthWeakToneKey, string>> = {
  비겁: {
    empathy: "스스로 결단하고 자기 페이스를 지키는 편이라, 친구나 동료와 어울릴 때도 흔들리지 않아요. 동료와 힘을 합쳐 위기를 넘기는 적응력과 협동심이 당신의 강점이에요.",
    reality: "자아의 독립성과 주체성이 뚜렷하게 발현됩니다. 동료·친구 관계와 추진력, 협동심이 강점입니다.",
    fun: "네가 정한 대로 가는 편이라 친구·동료랑도 잘 맞아. 같이 힘 합쳐서 일하는 거 네 강점이야.",
  },
  식상: {
    empathy: "생각과 욕구를 말로 잘 전달해서, 재능이나 아이디어를 사람들 앞에서 자연스럽게 꺼내는 편이에요. 말하기·쓰기·창작처럼 ‘밖으로 꺼내는’ 활동이 강점이에요.",
    reality: "에너지를 밖으로 표출하는 활동성과 표현력이 뚜렷합니다. 언어능력·재능·의식주를 영위하는 힘이 강점입니다.",
    fun: "말이랑 아이디어가 잘 나와서 재능 꺼내는 거 잘해. 말·쓰기·창작이 네 강점이야.",
  },
  재성: {
    empathy: "돈과 결과물을 다루는 감각이 있어서, 일을 끝까지 마무리하고 정리·관리하는 편이에요. 현실적인 결과물과 실행력이 강점이에요.",
    reality: "현실적 결과물·소유욕·재물을 다루는 역량이 뚜렷합니다. 일 마무리와 현실감각이 강점입니다.",
    fun: "돈이랑 결과 챙기는 감각 있어서 정리·마무리 잘해. 현실감각이 네 강점이야.",
  },
  관성: {
    empathy: "맡은 역할과 책임을 지는 걸 잘해요. 규칙을 지키고 조직 안에서 믿음을 받는 편이라, 사회적 규율과 리더십이 강점이에요.",
    reality: "사회적 규율·책임·나를 다스리는 힘이 뚜렷하게 발현됩니다. 직장·명예·리더십이 강점입니다.",
    fun: "역할 끝까지 하고 규칙 잘 지켜서 조직에서 믿음 받아. 책임감이 네 강점이야.",
  },
  인성: {
    empathy: "배우고 쌓는 걸 좋아하고, 가만히 앉아 기다리며 견디는 인내심이 있어요. 공부·문서·자격처럼 ‘나를 채워 주는’ 힘이 강점이에요.",
    reality: "나를 생해 주는 수용·학문·인내심이 뚜렷하게 발현됩니다. 지식·문서·깊은 성찰이 강점입니다.",
    fun: "공부하고 쌓는 거 좋아하고 오래 견디는 편이야. 배움·인내가 네 강점이야.",
  },
};

/** 4개 이상 — 잘 쓸 수 있으나 과하면 조절 (이론: 특정 십신이 겹쳐 강하면 주된 무기, 과하면 부작용) */
const MANY_PLAIN: Record<string, Record<StrengthWeakToneKey, string>> = {
  비겁: {
    empathy: "스스로 나서고 동료와의 관계도 풍부해서 돌파력이 세요. 다만 자기 영역을 지나치게 고집하면 주변과 멀어질 수 있으니, 때로 한발 물러서 보는 게 좋아요.",
    reality: "주체성·동료 관계가 매우 강하게 발현됩니다. 과하면 고집·독선으로 보일 수 있으니 조절이 유리합니다.",
    fun: "스스로 나서고 사람이랑도 잘 어울려. 대신 자기 영역만 지키려 하면 조금 물러나는 게 좋아.",
  },
  식상: {
    empathy: "말과 재능이 넘쳐서 분위기를 이끌기 쉽고, 시작하는 힘이 셔요. 다만 말이 행동보다 앞서거나 마무리가 허술해질 수 있으니, 듣는 시간과 끝까지 가는 습관이 좋아요.",
    reality: "표현·활동성이 매우 강하게 발현됩니다. 과하면 말이 앞서거나 마무리 약해지므로 듣기·실행 비중을 늘리면 유리합니다.",
    fun: "말이랑 재능이 많아서 시작은 잘해. 말이 너무 앞서거나 끝이 허술해지지 않게 조절하는 게 좋아.",
  },
  재성: {
    empathy: "돈·결과·정리에 강해서 실제로 잘 쌓여요. 다만 재물에만 몰두하면 기력이 빠지거나 균형이 무너질 수 있으니, 적당히 나누어 쓰고 쉬는 게 좋아요.",
    reality: "현실감각·재물 관리가 매우 강하게 발현됩니다. 과하면 집착·소모가 될 수 있으니 여유를 두는 것이 유리합니다.",
    fun: "돈이랑 결과 잘 챙겨서 잘 쌓여. 그거에만 매달리지 말고 나눠 쓰고 쉬는 게 좋아.",
  },
  관성: {
    empathy: "책임감이 커서 맡은 일을 끝까지 하고, 조직에서 인정받기 쉬워요. 다만 혼자만 짊어지면 부담이나 억압으로 느껴질 수 있으니, 역할을 나누는 게 좋아요.",
    reality: "책임·규율이 매우 강하게 발현됩니다. 과하면 자기 억압·부담이 되므로 역할 분담이 유리합니다.",
    fun: "책임감이 커서 끝까지 해. 혼자 다 짊어지지 말고 나눠서 하면 좋아.",
  },
  인성: {
    empathy: "배움과 인내가 많아서 깊이가 쌓여요. 다만 생각만 하다가 실행 시기를 놓치기 쉬우니, 작은 것부터 행동에 옮기는 게 좋아요.",
    reality: "학습·인내가 매우 강하게 발현됩니다. 과하면 우유부단·실행 지연이 되므로 실행 비중을 늘리면 유리합니다.",
    fun: "배우고 쌓는 게 많아서 깊이 있어. 생각만 하지 말고 작은 거부터 해 보는 게 좋아.",
  },
};

/** 0개 — 결여된 기운은 보완할 과제 (이론: 결여된 기운은 인생에서 보완해야 할 과제가 되기도 함). 비난 없이 */
const ABSENT_PLAIN: Record<string, Record<StrengthWeakToneKey, string>> = {
  비겁: {
    empathy: "스스로 결단하기보다 남에 맞추는 일이 많을 수 있어요. 작은 것부터 ‘내가 정했다’고 말해 보거나, 친구·동료와의 관계를 조금씩 쌓아 보시면 좋아요.",
    reality: "주체성·동료 관계를 의식적으로 키우면 보완에 도움이 됩니다.",
    fun: "남한테 맞출 때가 많으면, 작은 거라도 내가 정했다고 말해 보거나 사람이랑 조금씩 쌓아 보면 좋겠어.",
  },
  식상: {
    empathy: "말이나 표현이 조금씩만 나올 수 있어요. 하고 싶은 말을 짧게라도 꾸준히 해 보시면, 재능이 더 드러나기 쉬워요.",
    reality: "표현·재능을 의식적으로 발휘하면 보완에 도움이 됩니다.",
    fun: "말이 조금만 나오면, 하고 싶은 말 짧게라도 꾸준히 해 보면 재능이 더 보일 거야.",
  },
  재성: {
    empathy: "돈이나 결과보다 마음이 먼저 가는 편일 수 있어요. 작은 것부터 정리하고, 한 가지씩 결과를 챙기는 습관이 도움이 돼요.",
    reality: "현실감각·결과 관리를 단계적으로 늘리면 보완에 도움이 됩니다.",
    fun: "결과보다 마음이 먼저 가면, 작은 거부터 정리하고 하나씩 챙겨 보는 습관이 도움 돼.",
  },
  관성: {
    empathy: "역할이나 규칙이 부담될 수 있어요. 작은 역할부터 맡아 보시면, 점점 편해져요.",
    reality: "책임·규율을 소규모로 경험하면 보완에 도움이 됩니다.",
    fun: "역할이랑 규칙이 부담되면, 작은 역할부터 맡아 보면 점점 편해져.",
  },
  인성: {
    empathy: "바쁘다 보면 배우고 쌓는 시간이 부족할 수 있어요. 배우고 싶은 걸 하나 정해서, 조금씩이라도 쌓아 가시면 좋아요.",
    reality: "학습·인내를 꾸준히 쌓으면 보완에 도움이 됩니다.",
    fun: "배우는 시간이 부족하면, 하나 정해서 조금씩이라도 쌓아 가면 좋겠어.",
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
    lines.push("당신에게서 이런 강점이 잘 드러나요.");
    if (moderate.length > 0) {
      const list = moderate.map((el) => STRENGTH_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push(list);
    }
    if (many.length > 0) {
      const list = many.map((el) => MANY_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push(list);
    }
    if (moderate.length === 0 && many.length === 0) {
      lines.push("한쪽으로만 치우치지 않고, 상황에 맞게 균형 있게 발휘하기 좋은 편이에요.");
    }
    if (absent.length > 0) {
      const list = absent.map((el) => ABSENT_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push("한편, 이렇게 해 보시면 좋아요. " + list);
    } else if (moderate.length > 0 || many.length > 0) {
      lines.push("부족한 부분이 뚜렷하지 않아, 전반적으로 고른 편이에요.");
    }
  } else if (tone === "reality") {
    lines.push("다음과 같은 강점이 뚜렷하게 발현됩니다.");
    if (moderate.length > 0) {
      const list = moderate.map((el) => STRENGTH_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push(list);
    }
    if (many.length > 0) {
      const list = many.map((el) => MANY_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push(list);
    }
    if (moderate.length === 0 && many.length === 0) {
      lines.push("한쪽으로 치우치지 않는 균형형에 가깝습니다.");
    }
    if (absent.length > 0) {
      const list = absent.map((el) => ABSENT_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push("보완 시 참고. " + list);
    } else {
      lines.push("보완이 필요한 영역이 뚜렷하지 않습니다.");
    }
  } else {
    lines.push("네게서 이런 강점이 잘 보여.");
    if (moderate.length > 0) {
      const list = moderate.map((el) => STRENGTH_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push(list);
    }
    if (many.length > 0) {
      const list = many.map((el) => MANY_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push(list);
    }
    if (moderate.length === 0 && many.length === 0) {
      lines.push("한쪽만 튀진 않고 균형 있게 잘 쓸 수 있는 편이야.");
    }
    if (absent.length > 0) {
      const list = absent.map((el) => ABSENT_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push("한편 이렇게 해 보면 좋아. " + list);
    } else if (moderate.length > 0 || many.length > 0) {
      lines.push("부족한 부분이 뚜렷하지 않아서 전반적으로 고른 편이야.");
    }
  }

  const text = lines.join("\n\n").trim();
  if (text.length >= 580) return text;
  const tail = tone === "empathy" ? "당신만의 강점을 알아가시는 데 이 해석이 조금이라도 도움이 되면 좋겠어요." : tone === "reality" ? "위 내용을 참고하여 강점을 활용하고 보완 여지를 점검하시면 됩니다." : "이 해석이 네 강점 알아가는 데 조금이라도 도움 되면 좋겠어.";
  return text + "\n\n" + tail;
}
