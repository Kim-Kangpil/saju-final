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
  비겁: { empathy: "<strong>혼자서도 결단하고 동료와 어울리는 힘</strong>이 잘 나와요.", reality: "<strong>주체성·협력</strong>이 강점입니다.", fun: "<strong>스스로 나서고 동료랑 잘하는</strong> 거 잘해." },
  식상: { empathy: "<strong>말과 재능을 꺼내는 힘</strong>이 잘 나와요.", reality: "<strong>표현·재능 발휘</strong>가 강점입니다.", fun: "<strong>말이랑 재능 꺼내는</strong> 거 잘해." },
  재성: { empathy: "<strong>꾸준히 모으고 정리하는 힘</strong>이 잘 나와요.", reality: "<strong>관리·결과 추구</strong>가 강점입니다.", fun: "<strong>쌓고 정리하는</strong> 거 잘해." },
  관성: { empathy: "<strong>맡은 일을 끝까지 하고 믿음을 주는 힘</strong>이 잘 나와요.", reality: "<strong>책임·리더십</strong>이 강점입니다.", fun: "<strong>규칙 지키고 이끄는</strong> 거 잘해." },
  인성: { empathy: "<strong>공부하고 견디며 쌓는 힘</strong>이 잘 나와요.", reality: "<strong>학습·인내</strong>가 강점입니다.", fun: "<strong>배우고 가르치는</strong> 거 잘해." },
};

/** 0~1개일 때 — 결함이 아니라, 해당 능력을 키우면 중요한 순간에 더 큰 힘이 됨 (핵심어 볼드) */
const TEN_GOD_ABSENT: Record<string, Record<ElementDistToneKey, string>> = {
  비겁: { empathy: "작은 것부터 스스로 결정해 보시고, 함께할 일을 조금씩 늘려 보시면 <strong>결단력</strong>과 <strong>협력하는 힘</strong>이 자연스럽게 길러져요. 경험이 쌓일수록 중요한 순간에 더 분명하게 드러나요.", reality: "<strong>자기 결단·동료 관계</strong>를 키우면 중요한 순간에 더 큰 역량으로 작용합니다.", fun: "작은 거부터 스스로 정하고 사람이랑 할 일을 늘려 보면 결단력이랑 협력하는 힘이 커져. 쌓일수록 더 잘 나와." },
  식상: { empathy: "하고 싶은 말을 짧게라도 꾸준히 꺼내 보시면 <strong>재능을 드러내는 힘</strong>이 길러져요. 말과 표현을 늘릴수록 중요한 순간에 당신만의 색이 더 분명해져요.", reality: "<strong>말·글·창작 기회</strong>를 늘릴수록 중요한 순간에 더 큰 강점으로 작용합니다.", fun: "하고 싶은 말 짧게라도 꾸준히 해 보면 재능 드러내는 힘이 커져. 쌓일수록 더 잘 나와." },
  재성: { empathy: "작은 것부터 정리하고 한 가지씩 결과를 챙겨 보시면 <strong>꾸준히 모으고 정리하는 힘</strong>이 쌓여요. 그만큼 중요한 순간에 결과를 만들어내는 능력이 더해져요.", reality: "<strong>정리·관리 경험</strong>을 늘릴수록 중요한 순간에 더 큰 역량으로 작용합니다.", fun: "작은 거부터 정리하고 하나씩 챙겨 보면 모으고 정리하는 힘이 쌓여. 쌓일수록 더 잘 나와." },
  관성: { empathy: "작은 역할부터 맡아 보시면 <strong>맡은 일을 끝까지 하는 힘</strong>이 길러져요. 그 경험이 쌓일수록 중요한 순간에 믿음을 주는 역량으로 드러나요.", reality: "<strong>소규모 책임·역할</strong>을 늘릴수록 중요한 순간에 더 큰 강점으로 작용합니다.", fun: "작은 역할부터 맡아 보면 끝까지 하는 힘이 길러져. 쌓일수록 믿음 주는 역량이 잘 나와." },
  인성: { empathy: "배우고 싶은 걸 하나 정해서 조금씩이라도 쌓아 가시면 <strong>견디고 쌓는 힘</strong>이 됩니다. 꾸준히 쌓을수록 중요한 순간에 깊이 있는 판단력이 더 분명해져요.", reality: "<strong>학습·쌓기 경험</strong>을 늘릴수록 중요한 순간에 더 큰 역량으로 작용합니다.", fun: "하나 정해서 조금씩 쌓아 가면 견디고 쌓는 힘이 돼. 쌓일수록 깊이 있는 판단력이 잘 나와." },
};

/** 4개 이상일 때 — 강점이자 조절 필요 (핵심어 볼드) */
const TEN_GOD_MANY: Record<string, Record<ElementDistToneKey, string>> = {
  비겁: { empathy: "다만 많으면 <strong>자기만 고집</strong>하기 쉬우니, 때로 한발 물러서 보시면 좋아요.", reality: "과하면 <strong>고집·독선</strong>으로 이어질 수 있으니 조절이 유리합니다.", fun: "많으면 <strong>고집</strong>되기 쉬우니까 한발 물러서 보는 게 좋아." },
  식상: { empathy: "다만 많으면 <strong>말이 행동보다 앞서기</strong> 쉬우니, 듣고 끝까지 마무리하는 습관이 좋아요.", reality: "과하면 <strong>말이 앞서거나 마무리</strong>가 약해지니, 듣기·실행 비중을 늘리면 유리합니다.", fun: "많으면 <strong>말만 나오기</strong> 쉬우니까 듣고 끝까지 하는 거 챙겨." },
  재성: { empathy: "다만 <strong>돈에만 몰두</strong>하면 균형이 무너질 수 있으니, 나누고 쉬는 시간을 갖으시면 좋아요.", reality: "과하면 <strong>집착·소모</strong>가 될 수 있으니 여유를 두는 것이 유리합니다.", fun: "많으면 <strong>그거만 하게</strong> 되니까 나누고 쉬는 거 잊지 마." },
  관성: { empathy: "다만 <strong>혼자만 짊어지면</strong> 부담이 될 수 있으니, 역할을 나누시면 좋아요.", reality: "과하면 <strong>자기 억압·부담</strong>이 되니 역할 분담이 유리합니다.", fun: "많으면 <strong>혼자 다 짊어지게</strong> 되니까 나눠서 해." },
  인성: { empathy: "다만 많으면 <strong>생각만 하다가 실행을 놓치기</strong> 쉬우니, 작은 것부터 행동에 옮기시면 좋아요.", reality: "과하면 <strong>우유부단·실행 지연</strong>이 되니 실행 비중을 늘리면 유리합니다.", fun: "많으면 <strong>생각만 하게</strong> 되니까 작은 거부터 해 봐." },
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
      // 2~3개: 적당 → 강점만 (라벨 볼드)
      const strength = TEN_GOD_STRENGTH[tenGod]?.[tone] ?? "";
      if (tone === "empathy") strengthLines.push(`${EL_NAME[el]} ${n}개는 <strong>${label}</strong>에 해당해서 ${strength}`);
      else if (tone === "reality") strengthLines.push(`${EL_NAME[el]} ${n}개 → <strong>${label}</strong>: ${strength}`);
      else strengthLines.push(`${EL_NAME[el]} ${n}개는 <strong>${label}</strong>에 해당해서 ${strength}`);
    } else {
      // 4개 이상: 많음 → 강점이자 약점 (라벨 볼드)
      const strength = TEN_GOD_STRENGTH[tenGod]?.[tone] ?? "";
      const manyMsg = TEN_GOD_MANY[tenGod]?.[tone] ?? "";
      if (tone === "empathy") manyLines.push(`${EL_NAME[el]} ${n}개는 <strong>${label}</strong>에 해당해서 ${strength} ${manyMsg}`);
      else if (tone === "reality") manyLines.push(`${EL_NAME[el]} ${n}개 → <strong>${label}</strong>: ${strength} ${manyMsg}`);
      else manyLines.push(`${EL_NAME[el]} ${n}개는 <strong>${label}</strong>에 해당해서 ${strength} ${manyMsg}`);
    }
  }

  const lines: string[] = [];

  // 순서: 많은 것(4+) → 적당한 것(2~3) → 적은 것(0~1). 해석 원칙: 결함 X → 능력·시간축.
  if (tone === "empathy") {
    lines.push(`여덟 글자 속에 ${countParts}가 있어요.`);
    if (manyLines.length > 0) lines.push(manyLines.join(" "));
    if (strengthLines.length > 0) lines.push(strengthLines.join(" "));
    if (weaknessLines.length > 0) lines.push("이런 쪽을 의식해서 키우시면 중요한 순간에 더 큰 힘이 됩니다. " + weaknessLines.join(" "));
    if (strengthLines.length === 0 && manyLines.length === 0 && weaknessLines.length === 0) {
      lines.push("목·화·토·금·수가 고르게 분포해 있어, 한쪽으로 치우치지 않고 상황에 맞게 쓰기 좋은 편이에요.");
    }
  } else if (tone === "reality") {
    lines.push(`분포: ${countParts}.`);
    if (manyLines.length > 0) lines.push(manyLines.join(" "));
    if (strengthLines.length > 0) lines.push(strengthLines.join(" "));
    if (weaknessLines.length > 0) lines.push("이런 쪽을 키우면 중요한 순간에 더 큰 역량으로 작용합니다. " + weaknessLines.join(" "));
    if (strengthLines.length === 0 && manyLines.length === 0 && weaknessLines.length === 0) {
      lines.push("목·화·토·금·수가 전반적으로 균형 잡혀 있습니다.");
    }
  } else {
    lines.push(`니한테는 ${countParts}야.`);
    if (manyLines.length > 0) lines.push(manyLines.join(" "));
    if (strengthLines.length > 0) lines.push(strengthLines.join(" "));
    if (weaknessLines.length > 0) lines.push("이런 쪽을 키우면 중요한 순간에 더 큰 힘이 돼. " + weaknessLines.join(" "));
    if (strengthLines.length === 0 && manyLines.length === 0 && weaknessLines.length === 0) {
      lines.push("목·화·토·금·수가 고르게 있어서 한쪽만 튀지 않고 쓰기 좋은 편이야.");
    }
  }

  return lines.join("\n\n").trim();
}

// --- 오각형 시각화용 (오행 분포 차트) ---

/** 오행 순서: 오각형 꼭짓점 = 木(위) → 火 → 土 → 金 → 水 (시계방향) */
const ELEMENT_VISUAL_ORDER = ["木", "火", "土", "金", "水"] as const;

const EL_KEY: Record<string, string> = {
  "木": "목", "火": "화", "土": "토", "金": "금", "水": "수",
};

const EL_COLOR: Record<string, string> = {
  "木": "#7EB8A0", "火": "#E89A7A", "土": "#E8C87A", "金": "#C8C0A8", "水": "#7EB8D4",
};

const EL_GLOW: Record<string, string> = {
  "木": "#7EB8A055", "火": "#E89A7A55", "土": "#E8C87A55", "金": "#C8C0A855", "水": "#7EB8D455",
};

/** 십신별 짧은 "의미" (오행 시각화 한 줄) */
const TEN_GOD_MEANING: Record<string, string> = {
  비겁: "결단하고 협력하는 힘",
  식상: "표현하고 드러내는 힘",
  재성: "결과를 만드는 힘",
  관성: "맡은 일을 다하는 힘",
  인성: "배우고 쌓는 힘",
};

/** status별 짧은 desc (HTML 제거, 첫 문장 또는 50자 내) */
function getShortDesc(tenGod: string, status: string, tone: ElementDistToneKey): string {
  const strip = (s: string) => s.replace(/<[^>]+>/g, "").trim();
  if (status === "강함" || status === "적당") {
    const raw = strip(TEN_GOD_STRENGTH[tenGod]?.[tone] ?? "");
    const first = raw.split(/[.]/)[0] ?? raw;
    return (first.length > 48 ? first.slice(0, 47) + "…" : first) + (first.endsWith(".") ? "" : ".");
  }
  if (status === "보완" || status === "취약") {
    const raw = strip(TEN_GOD_ABSENT[tenGod]?.[tone] ?? "");
    const first = raw.split(/[.。]/)[0] ?? raw;
    return (first.length > 52 ? first.slice(0, 51) + "…" : first) + (first.endsWith(".") ? "" : ".");
  }
  return "";
}

/** status별 짧은 tip 한 줄 */
const TEN_GOD_TIP: Record<string, Record<string, string>> = {
  비겁: {
    강함: "한발 물러서 보는 순간을 갖으면 방향이 오래 갑니다.",
    적당: "이 기질을 의식해서 키우면 중요한 순간에 빛나요.",
    보완: "작은 결정부터 스스로 내리는 연습을 해보세요.",
    취약: "작은 결정부터 스스로 내리고, 함께할 일을 늘려보세요.",
  },
  식상: {
    강함: "듣는 시간과 끝까지 마무리하는 습관을 두세요.",
    적당: "말과 표현을 늘릴수록 당신만의 색이 분명해져요.",
    보완: "하고 싶은 말을 꾸준히 꺼내는 연습이 필요해요.",
    취약: "말과 표현을 늘릴수록 당신만의 색이 분명해져요.",
  },
  재성: {
    강함: "나누고 쉬는 시간을 갖으면 기운이 오래 유지돼요.",
    적당: "이 기질을 의식해서 키우면 중요한 순간에 빛나요.",
    보완: "작은 것부터 정리하고 한 가지씩 결과를 챙기세요.",
    취약: "작은 것부터 정리하고 한 가지씩 결과를 챙기세요.",
  },
  관성: {
    강함: "역할을 나누고 스스로에게 여유를 주세요.",
    적당: "규칙을 지키고 믿음을 주는 힘이 있어요.",
    보완: "작은 역할부터 맡아 보시면 재능이 서서히 드러나요.",
    취약: "작은 규칙부터 지켜 보시고 맡은 일을 끝까지 해보세요.",
  },
  인성: {
    강함: "작은 것부터 행동에 옮기면 균형이 잡혀요.",
    적당: "공부하고 견디며 쌓는 힘이 강해요.",
    보완: "배우고 싶은 걸 하나 정해서 조금씩 쌓아 가보세요.",
    취약: "생각에 머물지 말고 작은 것부터 행동에 옮기세요.",
  },
};

export interface OhaengElementItem {
  key: string;
  label: string;
  count: number;
  max: number;
  color: string;
  glow: string;
  meaning: string;
  desc: string;
  tip: string;
  status: "강함" | "적당" | "보완" | "취약";
}

export interface OhaengVisualData {
  elements: OhaengElementItem[];
}

export function getElementDistributionVisualData(
  pillars: SajuPillarsForElement,
  tone: ElementDistToneKey
): OhaengVisualData | null {
  const count = countByElement(pillars);
  const dayElement = getDayStemElement(pillars);
  const elementAsTenGod = (dayElement ? ELEMENT_AS_TEN_GOD[dayElement] : null) ?? ELEMENT_AS_TEN_GOD["木"];

  const elements: OhaengElementItem[] = ELEMENT_VISUAL_ORDER.map((el) => {
    const n = Math.min(count[el] ?? 0, 8);
    const tenGod = elementAsTenGod[el] ?? "";
    const status: OhaengElementItem["status"] =
      n >= 4 ? "강함" : n >= 2 ? "적당" : n === 1 ? "보완" : "취약";
    const meaning = tenGod ? (TEN_GOD_MEANING[tenGod] ?? "") : "";
    const desc = getShortDesc(tenGod, status, tone);
    const tip = tenGod ? (TEN_GOD_TIP[tenGod]?.[status] ?? "이 기운을 의식해서 키우면 중요한 순간에 빛나요.") : "";

    return {
      key: EL_KEY[el] ?? el,
      label: el,
      count: n,
      max: 4,
      color: EL_COLOR[el] ?? "#6B8A7A",
      glow: EL_GLOW[el] ?? "#6B8A7A55",
      meaning,
      desc,
      tip,
      status,
    };
  });

  return { elements };
}
