/**
 * 오행의 분포와 보완법 — 여덟 글자 속 다섯 가지 기운의 분포와 보완.
 * 이론: backend/logic/theories/사주이론(오행, 육친과 십신).txt, 사주이론(기본사주 구성).txt
 * 생(生)과 극(剋)의 균형, 결여된 기운은 보완할 과제. ~600자, 전문용어 없이, 특별한 사람 느낌.
 */

export type ElementDistToneKey = "empathy" | "reality" | "fun";

const STEM_TO_ELEMENT: Record<string, string> = {
  "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土",
  "庚": "金", "辛": "金", "壬": "水", "癸": "水",
};
const BRANCH_TO_ELEMENT: Record<string, string> = {
  "寅": "木", "卯": "木", "巳": "火", "午": "火", "辰": "土", "戌": "土", "丑": "土", "未": "土",
  "申": "金", "酉": "金", "子": "水", "亥": "水",
};

/** 오행 코드 → 사용자용 설명 (목·화·토·금·수는 사용) */
const ELEMENT_PLAIN: Record<string, { name: string; many: Record<ElementDistToneKey, string>; absent: Record<ElementDistToneKey, string> }> = {
  "木": {
    name: "목(木) — 성장하고 밀어붙이는 기운",
    many: {
      empathy: "<strong>목(木) 기운</strong>이 잘 드러나요. 앞으로 나아가고 도전하는 힘이 있어서, 스스로 정한 목표를 조금씩 늘려 보시고 친구·동료와 함께할 일을 찾아 보시면 좋아요. 다만 무리만 하지 않도록 쉬는 시간을 꼭 챙기시면 더 오래 갈 수 있어요.",
      reality: "<strong>목(木) 기운</strong>이 강하게 분포합니다. 목표 설정과 동료 관계를 활용하면 좋고, 과하면 소진되므로 휴식 비중을 두는 것이 유리합니다.",
      fun: "목 기운이 많아. 도전하고 밀어붙이는 거 살리면서 쉬는 시간만 잊지 말고 챙기면 딱이야.",
    },
    absent: {
      empathy: "<strong>목(木) 기운</strong>이 적을 수 있어요. 성장하고 밀어붙이는 쪽이 부족하다면, 작은 것이라도 ‘내가 해 보자’고 정해서 한 걸음씩 도전해 보시고, 친구나 동료와 함께하는 일을 조금씩 늘려 보시면 목 기운이 차오르기 쉬워요.",
      reality: "<strong>목(木) 기운</strong>이 적게 분포합니다. 소규모 도전과 동료 관계를 의식적으로 늘리면 보완에 도움이 됩니다.",
      fun: "목 기운이 적으면, 작은 거라도 스스로 정해서 해 보거나 친구랑 일 같이해 보면 좋아.",
    },
  },
  "火": {
    name: "화(火) — 말하고 표현하는 기운",
    many: {
      empathy: "<strong>화(火) 기운</strong>이 잘 드러나요. 말과 표현이 잘 나와서 재능을 사람들 앞에서 펼치기 좋고, 말하기·글쓰기·창작처럼 밖으로 꺼내는 일에 잘 맞아요. 다만 말이 행동보다 너무 앞서지 않도록, 듣는 시간과 끝까지 마무리하는 습관을 두시면 더 균형이 잡혀요.",
      reality: "<strong>화(火) 기운</strong>이 강하게 분포합니다. 창작·말·글에 적합하고, 말과 실행의 비율을 의식하면 균형에 유리합니다.",
      fun: "화 기운이 많아서 재능 꺼내기 좋아. 말만 앞세우지 말고 듣고 끝까지 해 보는 거 잊지 마.",
    },
    absent: {
      empathy: "<strong>화(火) 기운</strong>이 적을 수 있어요. 말하고 표현하는 쪽이 부족하다면, 하고 싶은 말을 짧게라도 꾸준히 해 보시고, 글쓰기나 창작을 취미로 시작해 보시면 화 기운이 서서히 늘어나요.",
      reality: "<strong>화(火) 기운</strong>이 적게 분포합니다. 말·글·창작 기회를 단계적으로 늘리면 보완에 도움이 됩니다.",
      fun: "화 기운이 적으면, 하고 싶은 말 조금씩 해 보거나 글쓰기·창작부터 해 봐.",
    },
  },
  "土": {
    name: "토(土) — 쌓고 정리하는 기운",
    many: {
      empathy: "<strong>토(土) 기운</strong>이 잘 드러나요. 돈과 결과를 챙기고 정리하는 힘이 있어서, 꾸준히 모으고 마무리하는 일에 특별히 잘 맞아요. 다만 토 기운에만 치우치지 않도록, 여유 있게 나누고 쉬는 시간을 갖으시면 기운이 오래 유지돼요.",
      reality: "<strong>토(土) 기운</strong>이 강하게 분포합니다. 재무·관리·결과에 강점이 있고, 여유와 휴식을 두면 균형에 유리합니다.",
      fun: "토 기운이 많아서 쌓고 정리하는 거 잘해. 그거만 하지 말고 나눠 쓰고 쉬는 시간 갖는 거 잊지 마.",
    },
    absent: {
      empathy: "<strong>토(土) 기운</strong>이 적을 수 있어요. 쌓고 정리하는 쪽이 부족하다면, 작은 것부터 정리하고 한 가지씩 결과를 챙기는 습관을 들여 보시면 토 기운이 차오르기 쉬워요.",
      reality: "<strong>토(土) 기운</strong>이 적게 분포합니다. 단계적으로 정리·관리 경험을 늘리면 보완에 도움이 됩니다.",
      fun: "토 기운이 적으면, 작은 거부터 정리하고 하나씩 결과 챙겨 보면 좋아.",
    },
  },
  "金": {
    name: "금(金) — 역할과 규칙을 지키는 기운",
    many: {
      empathy: "<strong>금(金) 기운</strong>이 잘 드러나요. 맡은 역할을 끝까지 하고 규칙을 지키는 힘이 있어서, 조직에서 믿음을 받기 쉽고 책임 있는 일에 잘 맞아요. 다만 혼자만 짊어지지 않도록, 역할을 나누고 스스로에게도 여유를 주시면 더 건강하게 오래 갈 수 있어요.",
      reality: "<strong>금(金) 기운</strong>이 강하게 분포합니다. 책임·조직 생활에 강점이 있고, 역할 분담과 여유가 균형에 유리합니다.",
      fun: "금 기운이 많아서 역할 끝까지 하고 규칙 잘 지켜. 혼자 다 짊어지지 말고 나눠서 하면 좋아.",
    },
    absent: {
      empathy: "<strong>금(金) 기운</strong>이 적을 수 있어요. 역할과 규칙을 지키는 쪽이 부족하다면, 작은 역할부터 맡아 보시고 지키기 쉬운 규칙부터 하나씩 실천해 보시면 금 기운이 서서히 늘어나요.",
      reality: "<strong>금(金) 기운</strong>이 적게 분포합니다. 소규모 책임·규칙 수행을 늘리면 보완에 도움이 됩니다.",
      fun: "금 기운이 적으면, 작은 역할부터 맡고 규칙 하나씩 지켜 보면 좋아.",
    },
  },
  "水": {
    name: "수(水) — 배우고 견디는 기운",
    many: {
      empathy: "<strong>수(水) 기운</strong>이 잘 드러나요. 배우고 쌓고 기다리며 견디는 힘이 있어서, 공부·문서·자격처럼 나를 채워 주는 일에 잘 맞아요. 다만 생각만 하다가 실행 시기를 놓치지 않도록, 작은 것부터 행동에 옮겨 보시면 더 균형이 잡혀요.",
      reality: "<strong>수(水) 기운</strong>이 강하게 분포합니다. 학습·연구에 강점이 있고, 실행 비중을 의식하면 균형에 유리합니다.",
      fun: "수 기운이 많아서 배우고 견디는 거 잘해. 생각만 하지 말고 작은 거부터 해 보는 거 잊지 마.",
    },
    absent: {
      empathy: "<strong>수(水) 기운</strong>이 적을 수 있어요. 배우고 견디는 쪽이 부족하다면, 배우고 싶은 걸 하나 정해서 조금씩이라도 쌓아 가시면 수 기운이 차오르기 쉬워요.",
      reality: "<strong>수(水) 기운</strong>이 적게 분포합니다. 꾸준한 학습·쌓기 경험을 늘리면 보완에 도움이 됩니다.",
      fun: "수 기운이 적으면, 하나 정해서 조금씩이라도 쌓아 가면 좋아.",
    },
  },
};

export interface SajuPillarsForElement {
  year: { cheongan: { hanja: string }; jiji: { hanja: string } };
  month: { cheongan: { hanja: string }; jiji: { hanja: string } };
  day: { cheongan: { hanja: string }; jiji: { hanja: string } };
  hour: { cheongan: { hanja: string }; jiji: { hanja: string } };
}

function countByElement(pillars: SajuPillarsForElement): Record<string, number> {
  const count: Record<string, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };
  const keys: (keyof SajuPillarsForElement)[] = ["year", "month", "day", "hour"];
  for (const k of keys) {
    const p = pillars[k];
    if (!p) continue;
    const stem = p.cheongan?.hanja?.trim?.()?.[0] ?? "";
    const branch = p.jiji?.hanja?.trim?.()?.[0] ?? "";
    const e1 = stem ? STEM_TO_ELEMENT[stem] : "";
    const e2 = branch ? BRANCH_TO_ELEMENT[branch] : "";
    if (e1) count[e1] = (count[e1] ?? 0) + 1;
    if (e2) count[e2] = (count[e2] ?? 0) + 1;
  }
  return count;
}

/**
 * 오행의 분포와 보완법 문단. 여덟 글자 속 다섯 가지 기운의 분포를 쉬운 말로, 보완법은 구체적으로. ~600자, 3톤.
 */
export function getElementDistributionParagraph(
  pillars: SajuPillarsForElement,
  tone: ElementDistToneKey
): string {
  const count = countByElement(pillars);
  const elements = ["木", "火", "土", "金", "水"] as const;
  const many: string[] = [];
  const absent: string[] = [];
  for (const el of elements) {
    const n = count[el] ?? 0;
    if (n >= 4) many.push(el);
    else if (n === 0) absent.push(el);
  }

  const lines: string[] = [];

  if (tone === "empathy") {
    lines.push("당신에게는 <strong>목·화·토·금·수</strong> 다섯 가지 <strong>기운</strong>이 각각 다르게 분포해 있어요. 잘 드러나는 기운이 있는가 하면, 아직 적게 드러나는 기운도 있어요.");
    if (many.length > 0) {
      const parts = many.map((el) => ELEMENT_PLAIN[el]?.many?.empathy ?? "").filter(Boolean);
      if (parts.length) lines.push(parts.join(" "));
    }
    if (absent.length > 0) {
      const parts = absent.map((el) => ELEMENT_PLAIN[el]?.absent?.empathy ?? "").filter(Boolean);
      if (parts.length) lines.push("한편 이렇게 <strong>보완</strong>해 보시면 좋아요. " + parts.join(" "));
    }
    if (many.length === 0 && absent.length === 0) {
      lines.push("목·화·토·금·수가 고르게 분포해 있어, 한쪽으로 치우치지 않고 상황에 맞게 쓰기 좋은 편이에요. 무리하지 않는 선에서 다양한 경험을 쌓아 가시면 좋겠어요.");
    }
  } else if (tone === "reality") {
    lines.push("<strong>목·화·토·금·수</strong> 다섯 가지 <strong>기운</strong>의 분포가 뚜렷합니다. 잘 드러나는 기운과 <strong>보완</strong> 여지가 있는 기운을 구분해 보시면 됩니다.");
    if (many.length > 0) {
      const parts = many.map((el) => ELEMENT_PLAIN[el]?.many?.reality ?? "").filter(Boolean);
      if (parts.length) lines.push(parts.join(" "));
    }
    if (absent.length > 0) {
      const parts = absent.map((el) => ELEMENT_PLAIN[el]?.absent?.reality ?? "").filter(Boolean);
      if (parts.length) lines.push("<strong>보완</strong> 참고. " + parts.join(" "));
    }
    if (many.length === 0 && absent.length === 0) {
      lines.push("목·화·토·금·수가 전반적으로 균형 잡혀 있습니다. 다양한 영역을 골고루 활용하시면 됩니다.");
    }
  } else {
    lines.push("니한테는 <strong>목·화·토·금·수</strong> 다섯 가지 <strong>기운</strong>이 각각 다르게 깔려 있어. 잘 나오는 거 있는 반면에, 아직 적게 나오는 거도 있어.");
    if (many.length > 0) {
      const parts = many.map((el) => ELEMENT_PLAIN[el]?.many?.fun ?? "").filter(Boolean);
      if (parts.length) lines.push(parts.join(" "));
    }
    if (absent.length > 0) {
      const parts = absent.map((el) => ELEMENT_PLAIN[el]?.absent?.fun ?? "").filter(Boolean);
      if (parts.length) lines.push("한편 이렇게 <strong>보완</strong>해 보면 좋아. " + parts.join(" "));
    }
    if (many.length === 0 && absent.length === 0) {
      lines.push("목·화·토·금·수가 고르게 있어서 한쪽만 튀지 않고 쓰기 좋은 편이야. 무리하지 않게 다양한 거 해 보면 좋겠어.");
    }
  }

  return lines.join("\n\n").trim();
}
