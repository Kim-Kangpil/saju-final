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

/** 일간 오행별 → 해당 오행이 일간 기준 어떤 육친(십신)인지. 이론: 사주이론(오행, 육친과 십신).txt */
const ELEMENT_AS_TEN_GOD: Record<string, Record<string, string>> = {
  "木": { "木": "비겁", "火": "식상", "土": "재성", "金": "관성", "水": "인성" },
  "火": { "火": "비겁", "土": "식상", "金": "재성", "水": "관성", "木": "인성" },
  "土": { "土": "비겁", "金": "식상", "水": "재성", "木": "관성", "火": "인성" },
  "金": { "金": "비겁", "水": "식상", "木": "재성", "火": "관성", "土": "인성" },
  "水": { "水": "비겁", "木": "식상", "火": "재성", "土": "관성", "金": "인성" },
};

/** 십신 → 문장에 쓸 때 쓰는 현실적 표현 (반복·추상어 줄임) */
const TEN_GOD_LABEL: Record<string, string> = {
  비겁: "스스로 서고 동료와 협력하는 쪽",
  식상: "말과 재능을 밖으로 꺼내는 쪽",
  재성: "돈을 모으고 결과를 챙기는 쪽",
  관성: "규칙을 지키고 맡은 일을 하는 쪽",
  인성: "배우고 견디고 쌓는 쪽",
};

/** 오행 코드 → 한글 이름 */
const EL_NAME: Record<string, string> = {
  "木": "목(木)", "火": "화(火)", "土": "토(土)", "金": "금(金)", "水": "수(水)",
};

/** 오행 코드 → 주어형 (조사 이/가 붙음) */
const EL_NAME_SUBJECT: Record<string, string> = {
  "木": "목(木)이", "火": "화(火)가", "土": "토(土)가", "金": "금(金)이", "水": "수(水)가",
};

/** 십신별 강점 한 줄 (오행 분포에서 “해당 육친 → 강점” 서술용) */
const TEN_GOD_STRENGTH: Record<string, Record<ElementDistToneKey, string>> = {
  비겁: { empathy: "혼자서도 결단하고 동료와 어울리는 힘이 잘 나와요.", reality: "주체성·협력이 강점입니다.", fun: "스스로 나서고 동료랑 잘해." },
  식상: { empathy: "말과 재능을 꺼내는 힘이 잘 나와요.", reality: "표현·재능 발휘가 강점입니다.", fun: "말이랑 재능 꺼내는 거 잘해." },
  재성: { empathy: "꾸준히 모으고 정리하는 힘이 잘 나와요.", reality: "관리·결과 추구가 강점입니다.", fun: "쌓고 정리하는 거 잘해." },
  관성: { empathy: "맡은 일을 끝까지 하고 믿음을 주는 힘이 잘 나와요.", reality: "책임·리더십이 강점입니다.", fun: "규칙 지키고 이끄는 거 잘해." },
  인성: { empathy: "공부하고 견디며 쌓는 힘이 잘 나와요.", reality: "학습·인내가 강점입니다.", fun: "배우고 가르치는 거 잘해." },
};

/** 0~1개일 때 — 현실적 언어로 한 문장 설명 + 보완 제안 ("재물·결과 쪽 부족" 같은 추상어 대신) */
const TEN_GOD_ABSENT: Record<string, Record<ElementDistToneKey, string>> = {
  비겁: { empathy: "스스로 정하고 동료와 어울리는 게 어렵게 느껴질 수 있어요. 작은 것부터 스스로 결정해 보시고, 함께할 일을 조금씩 늘려 보시면 좋아요.", reality: "자기 결단·동료 관계를 늘리면 보완됩니다.", fun: "스스로 정하는 게 어렵면 작은 거부터 해 보고, 사람이랑 할 일을 늘려 봐." },
  식상: { empathy: "말이나 재능을 밖으로 꺼내기가 쉽지 않을 수 있어요. 하고 싶은 말을 짧게라도 꾸준히 해 보시면 좋아요.", reality: "말·글·창작 기회를 늘리면 보완됩니다.", fun: "말 꺼내기 어렵면 짧게라도 꾸준히 해 봐." },
  재성: { empathy: "돈을 모으거나 결과를 꾸준히 챙기는 게 잘 안 잡힐 수 있어요. 작은 것부터 정리하고, 한 가지씩 결과를 챙겨 보시면 좋아요.", reality: "정리·관리 경험을 늘리면 보완됩니다.", fun: "돈이랑 결과 챙기기 어렵면 작은 거부터 정리하고 하나씩 챙겨 봐." },
  관성: { empathy: "규칙을 지키거나 맡은 일을 끝까지 하는 게 부담될 수 있어요. 작은 역할부터 맡아 보시면 좋아요.", reality: "소규모 책임·역할을 늘리면 보완됩니다.", fun: "역할·규칙이 부담되면 작은 거부터 맡아 봐." },
  인성: { empathy: "공부하거나 참고 견디는 게 소홀해지기 쉬울 수 있어요. 배우고 싶은 걸 하나 정해서 조금씩이라도 쌓아 보시면 좋아요.", reality: "학습·쌓기 경험을 늘리면 보완됩니다.", fun: "배우고 견디는 게 어렵면 하나 정해서 조금씩 쌓아 봐." },
};

/** 4개 이상일 때 — 강점이자 조절 필요 (같은 말 반복 피함) */
const TEN_GOD_MANY: Record<string, Record<ElementDistToneKey, string>> = {
  비겁: { empathy: "다만 많으면 자기만 고집하기 쉬우니, 때로 한발 물러서 보시면 좋아요.", reality: "과하면 고집·독선으로 이어질 수 있으니 조절이 유리합니다.", fun: "많으면 고집되기 쉬우니까 한발 물러서 보는 게 좋아." },
  식상: { empathy: "다만 많으면 말이 행동보다 앞서기 쉬우니, 듣고 끝까지 마무리하는 습관이 좋아요.", reality: "과하면 말이 앞서거나 마무리가 약해지니, 듣기·실행 비중을 늘리면 유리합니다.", fun: "많으면 말만 나오기 쉬우니까 듣고 끝까지 하는 거 챙겨." },
  재성: { empathy: "다만 돈에만 몰두하면 균형이 무너질 수 있으니, 나누고 쉬는 시간을 갖으시면 좋아요.", reality: "과하면 집착·소모가 될 수 있으니 여유를 두는 것이 유리합니다.", fun: "많으면 그거만 하게 되니까 나누고 쉬는 거 잊지 마." },
  관성: { empathy: "다만 혼자만 짊어지면 부담이 될 수 있으니, 역할을 나누시면 좋아요.", reality: "과하면 자기 억압·부담이 되니 역할 분담이 유리합니다.", fun: "많으면 혼자 다 짊어지게 되니까 나눠서 해." },
  인성: { empathy: "다만 많으면 생각만 하다가 실행을 놓치기 쉬우니, 작은 것부터 행동에 옮기시면 좋아요.", reality: "과하면 우유부단·실행 지연이 되니 실행 비중을 늘리면 유리합니다.", fun: "많으면 생각만 하게 되니까 작은 거부터 해 봐." },
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

function getDayStemElement(pillars: SajuPillarsForElement): string {
  const stem = pillars.day?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  return stem ? (STEM_TO_ELEMENT[stem] ?? "") : "";
}

/**
 * 오행의 분포와 보완법 문단. 목·화·토·금·수 개수, 일간 기준 육친(십신) 연결, 강점 위주 + 보완 한 줄. ~600자, 3톤.
 */
export function getElementDistributionParagraph(
  pillars: SajuPillarsForElement,
  tone: ElementDistToneKey
): string {
  const count = countByElement(pillars);
  const dayElement = getDayStemElement(pillars);
  const elementAsTenGod = (dayElement ? ELEMENT_AS_TEN_GOD[dayElement] : null) ?? ELEMENT_AS_TEN_GOD["木"];
  const elements = ["木", "火", "土", "金", "水"] as const;
  /** 많은 오행부터 나열 (4+ → 2~3 → 0~1) */
  const countParts = [...elements]
    .sort((a, b) => (count[b] ?? 0) - (count[a] ?? 0))
    .map((el) => `${EL_NAME[el]} ${count[el] ?? 0}개`)
    .join(", ");
  const strengthLines: string[] = [];   // 2~3개: 강점
  const manyLines: string[] = [];       // 4개 이상: 강점이자 약점
  const weaknessLines: string[] = [];   // 0~1개: 부족 → 약점, 보완 권장

  for (const el of elements) {
    const n = count[el] ?? 0;
    const tenGod = elementAsTenGod[el] ?? "";
    const label = tenGod ? TEN_GOD_LABEL[tenGod] : "";
    if (!label) continue;

    if (n <= 1) {
      // 0~1개: 현실적 언어로 한 문장 + 보완 (추상적 "재물·결과 쪽 부족" 사용 안 함)
      const complement = TEN_GOD_ABSENT[tenGod]?.[tone] ?? "";
      if (tone === "empathy") {
        if (n === 0) weaknessLines.push(`${EL_NAME_SUBJECT[el]} 없어서 ${complement}`);
        else weaknessLines.push(`${EL_NAME[el]} ${n}개라 ${complement}`);
      } else if (tone === "reality") {
        weaknessLines.push(n === 0 ? `${EL_NAME[el]} 없음. ${complement}` : `${EL_NAME[el]} ${n}개. ${complement}`);
      } else {
        weaknessLines.push(n === 0 ? `${EL_NAME_SUBJECT[el]} 없어서 ${complement}` : `${EL_NAME[el]} ${n}개라 ${complement}`);
      }
    } else if (n <= 3) {
      // 2~3개: 적당 → 강점만
      const strength = TEN_GOD_STRENGTH[tenGod]?.[tone] ?? "";
      if (tone === "empathy") strengthLines.push(`${EL_NAME[el]} ${n}개는 ${label}에 해당해서 ${strength}`);
      else if (tone === "reality") strengthLines.push(`${EL_NAME[el]} ${n}개 → ${label}: ${strength}`);
      else strengthLines.push(`${EL_NAME[el]} ${n}개는 ${label}에 해당해서 ${strength}`);
    } else {
      // 4개 이상: 많음 → 강점이자 약점
      const strength = TEN_GOD_STRENGTH[tenGod]?.[tone] ?? "";
      const manyMsg = TEN_GOD_MANY[tenGod]?.[tone] ?? "";
      if (tone === "empathy") manyLines.push(`${EL_NAME[el]} ${n}개는 ${label}에 해당해서 ${strength} ${manyMsg}`);
      else if (tone === "reality") manyLines.push(`${EL_NAME[el]} ${n}개 → ${label}: ${strength} ${manyMsg}`);
      else manyLines.push(`${EL_NAME[el]} ${n}개는 ${label}에 해당해서 ${strength} ${manyMsg}`);
    }
  }

  const lines: string[] = [];

  // 순서: 많은 것(4+) → 적당한 것(2~3) → 적은 것(0~1)
  if (tone === "empathy") {
    lines.push(`여덟 글자 속에 ${countParts}가 있어요.`);
    if (manyLines.length > 0) lines.push(manyLines.join(" "));
    if (strengthLines.length > 0) lines.push(strengthLines.join(" "));
    if (weaknessLines.length > 0) lines.push("이렇게 해 보시면 좋아요. " + weaknessLines.join(" "));
    if (strengthLines.length === 0 && manyLines.length === 0 && weaknessLines.length === 0) {
      lines.push("목·화·토·금·수가 고르게 분포해 있어, 한쪽으로 치우치지 않고 상황에 맞게 쓰기 좋은 편이에요.");
    }
  } else if (tone === "reality") {
    lines.push(`분포: ${countParts}.`);
    if (manyLines.length > 0) lines.push(manyLines.join(" "));
    if (strengthLines.length > 0) lines.push(strengthLines.join(" "));
    if (weaknessLines.length > 0) lines.push("부족(약점)·보완: " + weaknessLines.join(" "));
    if (strengthLines.length === 0 && manyLines.length === 0 && weaknessLines.length === 0) {
      lines.push("목·화·토·금·수가 전반적으로 균형 잡혀 있습니다.");
    }
  } else {
    lines.push(`니한테는 ${countParts}야.`);
    if (manyLines.length > 0) lines.push(manyLines.join(" "));
    if (strengthLines.length > 0) lines.push(strengthLines.join(" "));
    if (weaknessLines.length > 0) lines.push("이렇게 해 보면 좋아. " + weaknessLines.join(" "));
    if (strengthLines.length === 0 && manyLines.length === 0 && weaknessLines.length === 0) {
      lines.push("목·화·토·금·수가 고르게 있어서 한쪽만 튀지 않고 쓰기 좋은 편이야.");
    }
  }

  return lines.join("\n\n").trim();
}
