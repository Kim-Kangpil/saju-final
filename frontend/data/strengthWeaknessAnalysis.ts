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
    empathy: "스스로 결단하고 자기 페이스를 지키는 편이라, 친구나 동료와 어울릴 때도 흔들리지 않아요. 동료와 힘을 합쳐 위기를 넘기는 <strong>적응력</strong>과 <strong>협동심</strong>이 강점이에요.",
    reality: "<strong>자아의 독립성</strong>과 <strong>주체성</strong>이 뚜렷하게 발현됩니다. 동료·친구 관계와 추진력, 협동심이 강점입니다.",
    fun: "네가 정한 대로 가는 편이라 친구·동료랑도 잘 맞아. 같이 힘 합쳐서 일하는 거 네 강점이야.",
  },
  식상: {
    empathy: "생각과 욕구를 말로 잘 전달해서, 재능이나 아이디어를 사람들 앞에서 자연스럽게 꺼내는 편이에요. 말하기·쓰기·창작처럼 ‘밖으로 꺼내는’ 활동이 강점이에요.",
    reality: "에너지를 밖으로 표출하는 <strong>활동성</strong>과 <strong>표현력</strong>이 뚜렷합니다. 언어능력·재능·의식주를 영위하는 힘이 강점입니다.",
    fun: "말이랑 아이디어가 잘 나와서 재능 꺼내는 거 잘해. 말·쓰기·창작이 네 강점이야.",
  },
  재성: {
    empathy: "돈과 결과물을 다루는 감각이 있어서, 일을 끝까지 마무리하고 정리·관리하는 편이에요. <strong>현실감각</strong>과 실행력이 강점이에요.",
    reality: "현실적 결과물·소유욕·재물을 다루는 역량이 뚜렷합니다. 일 마무리와 현실감각이 강점입니다.",
    fun: "돈이랑 결과 챙기는 감각 있어서 정리·마무리 잘해. 현실감각이 네 강점이야.",
  },
  관성: {
    empathy: "맡은 역할과 책임을 지는 걸 잘해요. 규칙을 지키고 조직 안에서 믿음을 받는 편이라, <strong>사회적 규율</strong>과 <strong>리더십</strong>이 강점이에요.",
    reality: "사회적 규율·책임·나를 다스리는 힘이 뚜렷하게 발현됩니다. 직장·명예·리더십이 강점입니다.",
    fun: "역할 끝까지 하고 규칙 잘 지켜서 조직에서 믿음 받아. 책임감이 네 강점이야.",
  },
  인성: {
    empathy: "배우고 쌓는 걸 좋아하고, 가만히 앉아 기다리며 견디는 <strong>인내심</strong>이 있어요. 공부·문서·자격처럼 ‘나를 채워 주는’ 힘이 강점이에요.",
    reality: "나를 생해 주는 수용·학문·인내심이 뚜렷하게 발현됩니다. 지식·문서·깊은 성찰이 강점입니다.",
    fun: "공부하고 쌓는 거 좋아하고 오래 견디는 편이야. 배움·인내가 네 강점이야.",
  },
};

/** 4개 이상 — 강점이 큰 만큼, 상황에 맞게 쓰면 더 큰 무기(조절은 전략) */
const MANY_PLAIN: Record<string, Record<StrengthWeakToneKey, string>> = {
  비겁: {
    empathy: "<strong>돌파력</strong>이 세고 동료와의 관계도 풍부해요. 때로 한발 물러서 보는 순간이 있으면, 그만큼 <strong>방향을 유지하는 힘</strong>이 오래 갈 수 있어요. 이 기질은 경험이 쌓일수록 더 큰 강점으로 작용해요.",
    reality: "<strong>주체성</strong>·동료 관계가 매우 강합니다. 상황에 따라 조절할수록 중요한 순간에 더 큰 역량으로 작용합니다.",
    fun: "스스로 나서고 사람이랑도 잘 어울려. 가끔 한발 물러서 보면 방향 유지하는 힘이 오래 가. 이 기질은 쌓일수록 더 큰 강점이 돼.",
  },
  식상: {
    empathy: "말과 재능이 넘쳐서 <strong>분위기를 이끄는 힘</strong>이 있어요. 듣는 시간과 끝까지 가는 습관을 더하면 <strong>표현력</strong>과 <strong>실행력</strong>이 함께 커져요. 시간이 지날수록 이 능력이 더욱 분명하게 드러나요.",
    reality: "<strong>표현·활동성</strong>이 매우 강합니다. 듣기·실행 비중을 늘릴수록 중요한 순간에 더 큰 강점으로 작용합니다.",
    fun: "말이랑 재능이 많아서 분위기 이끄는 힘이 있어. 듣고 끝까지 하는 걸 더하면 표현력이랑 실행력이 같이 커져. 쌓일수록 더 잘 드러나.",
  },
  재성: {
    empathy: "돈·결과·정리에 강해서 <strong>꾸준히 쌓는 힘</strong>이 잘 나와요. 나누어 쓰고 쉬는 시간을 갖으면 그만큼 <strong>오래 가는 현실감각</strong>이 됩니다. 이 기질은 경험이 쌓일수록 더 큰 강점으로 작용해요.",
    reality: "<strong>현실감각</strong>·재물 관리가 매우 강합니다. 여유를 두면 중요한 순간에 더 오래 작동하는 역량이 됩니다.",
    fun: "돈이랑 결과 잘 챙겨서 쌓는 힘이 있어. 나눠 쓰고 쉬는 걸 갖으면 오래 가는 현실감각이 돼. 쌓일수록 더 큰 강점이야.",
  },
  관성: {
    empathy: "<strong>책임감</strong>이 커서 맡은 일을 끝까지 하는 힘이 있어요. 역할을 나누는 순간이 있으면, 그만큼 <strong>믿음을 주는 리더십</strong>이 오래 유지돼요. 시간이 지날수록 이 능력이 더욱 분명하게 드러나요.",
    reality: "<strong>책임·규율</strong>이 매우 강하게 발현됩니다. 역할 분담을 할수록 중요한 순간에 더 큰 역량으로 작용합니다.",
    fun: "책임감이 커서 끝까지 해. 역할 나누면 믿음 주는 리더십이 오래 가. 쌓일수록 더 잘 드러나.",
  },
  인성: {
    empathy: "배움과 인내가 많아서 <strong>깊이 쌓는 힘</strong>이 있어요. 작은 것부터 행동에 옮기면 <strong>생각을 실행으로 바꾸는 능력</strong>이 더해져요. 이 기질은 경험이 쌓일수록 더 큰 강점으로 작용해요.",
    reality: "<strong>학습·인내</strong>가 매우 강합니다. 실행 비중을 늘릴수록 중요한 순간에 더 큰 강점으로 작용합니다.",
    fun: "배우고 쌓는 게 많아서 깊이 쌓는 힘이 있어. 작은 거부터 해 보면 생각을 실행으로 바꾸는 능력이 더해져. 쌓일수록 더 큰 강점이야.",
  },
};

/** 0개 — 해당 기운이 적을 때: 결함이 아니라, 그쪽 능력을 키우면 중요한 순간에 더 큰 힘이 됨(전략적 성향) */
const ABSENT_PLAIN: Record<string, Record<StrengthWeakToneKey, string>> = {
  비겁: {
    empathy: "스스로 결단하는 상황이 익숙지 않다면, 작은 것부터 ‘내가 정했다’고 말해 보시면 <strong>결단력</strong>이 자연스럽게 길러져요. 친구·동료와의 관계를 조금씩 쌓아 가실수록 중요한 순간에 <strong>협력하는 힘</strong>이 더 분명해져요.",
    reality: "<strong>주체성</strong>·동료 관계를 의식적으로 키우면 중요한 순간에 그만큼 더 큰 역량으로 작용합니다.",
    fun: "스스로 정하는 걸 조금씩 늘려 보면 결단력이 길러지고, 사람이랑 할 일을 쌓을수록 협력하는 힘이 더 잘 나와.",
  },
  식상: {
    empathy: "하고 싶은 말을 짧게라도 꾸준히 꺼내 보시면, 그 자체가 <strong>재능을 드러내는 연습</strong>이에요. 말과 표현을 조금씩 늘릴수록 중요한 순간에 <strong>당신만의 색을 보여주는 힘</strong>이 더해져요.",
    reality: "<strong>표현</strong>·재능을 의식적으로 발휘할수록 중요한 상황에서 더 큰 강점으로 작용합니다.",
    fun: "하고 싶은 말을 조금씩이라도 꾸준히 해 보면 재능이 더 잘 드러나고, 그만큼 중요한 순간에 네 색을 보여주는 힘이 커져.",
  },
  재성: {
    empathy: "하고 싶은 일을 우선하게 되는 편이라면, 작은 것부터 정리하고 한 가지씩 결과를 챙기는 습관이 <strong>현실감각</strong>을 키워 줘요. 그렇게 쌓을수록 중요한 순간에 <strong>결과를 만들어내는 힘</strong>이 더 분명해져요.",
    reality: "<strong>현실감각</strong>·결과 관리를 단계적으로 늘릴수록 중요한 순간에 더 큰 역량으로 작용합니다.",
    fun: "작은 거부터 정리하고 하나씩 챙겨 보는 습관이 현실감각을 키워 주고, 그만큼 결과 만드는 힘이 커져.",
  },
  관성: {
    empathy: "작은 역할부터 맡아 보시면, 그 경험이 <strong>책임을 지는 힘</strong>으로 쌓여요. 맡은 일을 해 나갈수록 중요한 순간에 <strong>믿음을 주는 역량</strong>이 더 잘 드러나요.",
    reality: "<strong>책임</strong>·규율을 소규모로 경험할수록 중요한 순간에 더 큰 강점으로 작용합니다.",
    fun: "작은 역할부터 맡아 보면 책임지는 힘이 쌓이고, 그만큼 중요한 순간에 믿음 주는 역량이 잘 나와.",
  },
  인성: {
    empathy: "배우고 싶은 걸 하나 정해서 조금씩이라도 쌓아 가시면, 그게 <strong>견디고 성장하는 힘</strong>이에요. 꾸준히 쌓을수록 중요한 순간에 <strong>깊이 있는 판단력</strong>이 더 분명해져요.",
    reality: "<strong>학습</strong>·인내를 꾸준히 쌓을수록 중요한 순간에 더 큰 역량으로 작용합니다.",
    fun: "하나 정해서 조금씩이라도 쌓아 가면 견디고 성장하는 힘이 되고, 그만큼 중요한 순간에 깊이 있는 판단력이 잘 나와.",
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
    lines.push("아마 스스로도 이런 면을 느껴왔을 수 있어요. 사주에서 보이는 기질은 결함이 아니라, 특정 상황에서 강점이 되는 능력이에요.");
    if (moderate.length > 0 || many.length > 0) {
      lines.push("<strong>강점</strong>이 이런 식으로 드러나는 편이에요.");
    }
    if (moderate.length > 0) {
      const list = moderate.map((el) => STRENGTH_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push(list);
    }
    if (many.length > 0) {
      const list = many.map((el) => MANY_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push(list);
    }
    if (moderate.length === 0 && many.length === 0) {
      lines.push("한쪽으로만 치우치지 않고, 상황에 맞게 균형 있게 쓰기 좋은 편이에요.");
    }
    if (absent.length > 0) {
      const list = absent.map((el) => ABSENT_PLAIN[elementToTenGod[el]]?.[tone] ?? "").filter(Boolean).join(" ");
      if (list) lines.push("이런 쪽을 의식해서 키우시면 중요한 순간에 더 큰 힘이 됩니다. " + list);
    } else if (moderate.length > 0 || many.length > 0) {
      lines.push("전반적으로 고른 편이라, 상황에 맞게 여러 강점을 쓰기 좋아요.");
    }
    lines.push("이 기질들은 경험이 쌓일수록 더 큰 강점으로 작용해요. 시간이 지날수록 그 힘이 더 분명하게 드러납니다.");
  } else if (tone === "reality") {
    lines.push("사주에서 보이는 기질은 결함이 아니라 특정 상황에서 강점이 되는 능력이며, 시간이 지날수록 그 힘이 더 분명해집니다.");
    if (moderate.length > 0 || many.length > 0) {
      lines.push("<strong>강점</strong>은 대략 이렇게 드러납니다.");
    }
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
      if (list) lines.push("이런 쪽을 키우면 중요한 순간에 더 큰 역량으로 작용합니다. " + list);
    } else {
      lines.push("전반적으로 고른 편이라 상황에 맞게 여러 강점을 활용하기 유리합니다.");
    }
  } else {
    lines.push("주변에서 이런 말을 들은 적이 있을 수 있어. 사주에 보이는 기질은 결함이 아니라 특정 상황에서 강점이 되는 거야.");
    if (moderate.length > 0 || many.length > 0) {
      lines.push("<strong>강점</strong>이 이렇게 보이는 편이야.");
    }
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
      if (list) lines.push("이런 쪽을 키우면 중요한 순간에 더 큰 힘이 돼. " + list);
    } else if (moderate.length > 0 || many.length > 0) {
      lines.push("전반적으로 고른 편이라 상황에 맞게 여러 강점 쓰기 좋아.");
    }
    lines.push("이 기질들은 쌓일수록 더 큰 강점으로 작용해. 시간 지날수록 그 힘이 더 분명하게 드러나.");
  }

  return lines.join("\n\n").trim();
}
