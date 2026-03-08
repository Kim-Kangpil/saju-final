/**
 * 인간관계 스타일 — 사주 육친(십신) 기반.
 * 기준: 타인을 보는 시선, 관계 속 역할, 반복되는 관계 패턴, 갈등 포인트, 인간관계 강점.
 * 인성(편인+정인), 비겁(비견+겁재), 식상(식신+상관), 재성(편재+정재), 관성(편관+정관) 각 강/약으로 해석.
 */

export type RelationStyleToneKey = "empathy" | "reality" | "fun";

type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";

const STEM_META: Record<string, { el: Element; pol: Polarity }> = {
  甲: { el: "wood", pol: "yang" }, 乙: { el: "wood", pol: "yin" },
  丙: { el: "fire", pol: "yang" }, 丁: { el: "fire", pol: "yin" },
  戊: { el: "earth", pol: "yang" }, 己: { el: "earth", pol: "yin" },
  庚: { el: "metal", pol: "yang" }, 辛: { el: "metal", pol: "yin" },
  壬: { el: "water", pol: "yang" }, 癸: { el: "water", pol: "yin" },
};

const BRANCH_MAIN_STEM: Record<string, string> = {
  "子": "癸", "丑": "己", "寅": "甲", "卯": "乙", "辰": "戊", "巳": "丙",
  "午": "丁", "未": "己", "申": "庚", "酉": "辛", "戌": "戊", "亥": "壬",
};

function stemMeta(s: string): { el: Element; pol: Polarity } | null {
  return STEM_META[s] ?? null;
}
function produces(a: Element, b: Element): boolean {
  const next: Record<Element, Element> = {
    wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood",
  };
  return next[a] === b;
}
function controls(a: Element, b: Element): boolean {
  const map: Record<Element, Element> = {
    wood: "earth", fire: "metal", earth: "water", metal: "wood", water: "fire",
  };
  return map[a] === b;
}

function tenGodFromStems(dayStem: string, targetStem: string): string {
  const dm = stemMeta(dayStem);
  const tm = stemMeta(targetStem);
  if (!dm || !tm) return "";
  const samePol = dm.pol === tm.pol;
  if (dm.el === tm.el) return samePol ? "비견" : "겁재";
  if (produces(dm.el, tm.el)) return samePol ? "식신" : "상관";
  if (produces(tm.el, dm.el)) return samePol ? "편인" : "정인";
  if (controls(dm.el, tm.el)) return samePol ? "편재" : "정재";
  if (controls(tm.el, dm.el)) return samePol ? "편관" : "정관";
  return "";
}

export interface SajuPillarsForRelationStyle {
  year: { cheongan: { hanja: string }; jiji: { hanja: string } };
  month: { cheongan: { hanja: string }; jiji: { hanja: string } };
  day: { cheongan: { hanja: string }; jiji: { hanja: string } };
  hour: { cheongan: { hanja: string }; jiji: { hanja: string } };
}

function countTenGods(pillars: SajuPillarsForRelationStyle): Record<string, number> {
  const dayStem = pillars.day?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  if (!dayStem) return {};
  const count: Record<string, number> = {
    비견: 0, 겁재: 0, 식신: 0, 상관: 0, 편재: 0, 정재: 0, 편관: 0, 정관: 0, 편인: 0, 정인: 0,
  };
  const positions: string[] = [];
  for (const key of ["year", "month", "day", "hour"] as const) {
    const p = pillars[key];
    if (!p) continue;
    const stem = p.cheongan?.hanja?.trim?.()?.[0] ?? "";
    const branch = p.jiji?.hanja?.trim?.()?.[0] ?? "";
    if (stem) positions.push(stem);
    if (branch && BRANCH_MAIN_STEM[branch]) positions.push(BRANCH_MAIN_STEM[branch]);
  }
  for (let i = 0; i < positions.length; i++) {
    if (i === 4) continue;
    const tg = tenGodFromStems(dayStem, positions[i]);
    if (tg && count[tg] !== undefined) count[tg]++;
  }
  return count;
}

function getGroupCounts(count: Record<string, number>): Record<string, number> {
  return {
    인성: (count["편인"] ?? 0) + (count["정인"] ?? 0),
    비겁: (count["비견"] ?? 0) + (count["겁재"] ?? 0),
    식상: (count["식신"] ?? 0) + (count["상관"] ?? 0),
    재성: (count["편재"] ?? 0) + (count["정재"] ?? 0),
    관성: (count["편관"] ?? 0) + (count["정관"] ?? 0),
  };
}

const GROUPS = ["인성", "비겁", "식상", "재성", "관성"] as const;
type GroupKey = (typeof GROUPS)[number];
type DimKey = "view" | "role" | "pattern" | "conflict" | "strength";

type DimText = { strong: Record<RelationStyleToneKey, string>; weak: Record<RelationStyleToneKey, string> };
const TEXTS: Record<GroupKey, Record<DimKey, DimText>> = {
  인성: {
    view: {
      strong: { empathy: "상대의 감정과 의도를 먼저 읽고, 맥락으로 이해하려 해요. 쉽게 단정 짓지 않아요.", reality: "상대의 감정·의도·상황을 맥락과 분위기로 파악하며 단정을 보류하는 경향이 있습니다.", fun: "상대 감정이랑 의도를 먼저 읽고, 맥락으로 이해하려 해. 단정 잘 안 해." },
      weak: { empathy: "감정보다 현실 중심으로 상대를 봐요. 상황 파악은 빠르고 공감보다 판단이 앞설 수 있어요.", reality: "감정보다 현실 중심으로 상대를 보며, 공감보다 판단이 앞서는 경향이 있습니다.", fun: "감정보다 현실 중심으로 사람 봐. 판단이 공감보다 앞설 수 있어." },
    },
    role: {
      strong: { empathy: "관계에서 이해자·조언자 역할을 맡아요. 이야기를 들어주고 받아주는 존재가 돼요.", reality: "관계에서 이해자·조언자 역할을 하며 이야기를 들어주고 받아주는 패턴을 보입니다.", fun: "관계에서 들어주고 받아주는 쪽이 돼. 이해자·조언자 역할을 자주 맡아." },
      weak: { empathy: "감정적 지원보다 행동으로 관계에 기여해요. 말보다 행동으로 역할을 다해요.", reality: "감정적 지원보다 실질적 행동으로 관계에 기여하는 경향이 있습니다.", fun: "말보다 행동으로 관계에 기여해. 실질적으로 역할 다하는 편이야." },
    },
    pattern: {
      strong: { empathy: "기대고 싶거나 반대로 모든 걸 받아주는 관계가 반복돼요. 의존과 공감의 패턴이 있어요.", reality: "의존과 공감이 반복되는 관계 패턴을 보입니다.", fun: "기대거나 다 받아주는 관계가 반복돼. 의존이랑 공감 패턴이 있어." },
      weak: { empathy: "감정적 유대보다 실리적 관계가 반복돼요. 목적 중심 관계가 많아요.", reality: "감정적 유대보다 실리·목적 중심 관계가 반복되는 경향이 있습니다.", fun: "깊은 정서 교류보다 목적 중심 관계가 반복돼." },
    },
    conflict: {
      strong: { empathy: "상대를 지나치게 이해하려다 자신의 감정을 억누를 수 있어요. 경계 없이 받아주다 상처받는 구조예요.", reality: "이해를 넘어 자신의 감정을 억누거나 경계 없이 받아주다 상처받는 갈등이 발생할 수 있습니다.", fun: "너무 이해하려다 감정 억누르거나, 경계 없이 받아주다 상처받을 수 있어." },
      weak: { empathy: "공감 없이 판단하는 것처럼 보여 상대가 차갑다고 느끼는 갈등이 생길 수 있어요.", reality: "공감 없이 판단하는 것으로 보여 상대가 차갑다고 느끼는 갈등이 발생할 수 있습니다.", fun: "공감 없이 판단하는 것처럼 보여서 상대가 차갑다고 느낄 수 있어." },
    },
    strength: {
      strong: { empathy: "사람의 감정과 상황을 깊이 이해해요. 공감·상담·조언 능력이 뛰어나 신뢰받는 존재가 돼요.", reality: "감정·상황 이해와 공감·상담·조언 능력이 뚜렷하여 신뢰받는 존재가 됩니다.", fun: "감정이랑 상황 깊이 이해해서 공감·조언 잘해. 신뢰받는 타입이야." },
      weak: { empathy: "감정에 흔들리지 않고 냉정하게 상황을 파악해요. 위기에서 현실적 판단을 잘해요.", reality: "감정에 흔들리지 않고 냉정한 상황 파악과 위기 시 현실적 판단이 강점입니다.", fun: "감정에 안 흔들리고 냉정하게 상황 파악해. 위기에서 현실적 판단 잘해." },
    },
  },
  비겁: {
    view: {
      strong: { empathy: "상대를 나와 동등한 존재로 봐요. 경쟁자 혹은 동료로 인식하는 경향이 있어요.", reality: "상대를 동등한 존재·경쟁자 또는 동료로 인식하는 경향이 뚜렷합니다.", fun: "상대를 나랑 동등한 존재로 봐. 경쟁자나 동료로 인식하는 편이야." },
      weak: { empathy: "타인을 나와 구별되는 존재로 봐요. 관계에서 자신의 위치를 먼저 파악하려 해요.", reality: "타인을 나와 구별된 존재로 보며 관계에서 자신의 위치를 파악하려 합니다.", fun: "타인을 나랑 구별되는 존재로 봐. 관계에서 내 위치를 먼저 파악하려 해." },
    },
    role: {
      strong: { empathy: "동료형으로 함께 움직이는 수평적 관계를 만들어요. 의리와 유대가 강해요.", reality: "동료형 수평적 관계를 만들며 의리와 유대가 강한 패턴을 보입니다.", fun: "같이 움직이는 수평적 관계 만들어. 의리랑 유대가 강해." },
      weak: { empathy: "관계에서 독립적인 위치를 취해요. 무리보다 개별적 관계를 선호해요.", reality: "관계에서 독립적 위치를 취하며 개별적 관계를 선호하는 경향이 있습니다.", fun: "관계에서 독립적인 위치 취해. 무리보다 개별 관계 선호해." },
    },
    pattern: {
      strong: { empathy: "함께 시작하고 함께 움직이는 관계가 반복돼요. 경쟁이나 비교가 생기는 패턴도 있어요.", reality: "함께 움직이는 관계가 반복되며 경쟁·비교가 나타나는 패턴이 있습니다.", fun: "같이 시작하고 같이 움직이는 관계가 반복돼. 경쟁·비교 생기기도 해." },
      weak: { empathy: "혼자 일을 처리하거나 관계에서 독립적으로 행동하는 패턴이 반복돼요.", reality: "혼자 처리하거나 관계에서 독립적으로 행동하는 패턴이 반복됩니다.", fun: "혼자 처리하거나 관계에서 독립적으로 행동하는 패턴이 반복돼." },
    },
    conflict: {
      strong: { empathy: "경쟁심이나 비교의식이 갈등으로 번질 수 있어요. 동등함을 원하지만 자존심 충돌이 생겨요.", reality: "경쟁·비교의식이 갈등으로 이어지거나 자존심 충돌이 발생할 수 있습니다.", fun: "경쟁심이랑 비교의식이 갈등으로 번질 수 있어. 자존심 충돌 생기기도 해." },
      weak: { empathy: "관계에서 소외감을 느끼거나 무리 속에 녹아들지 못해 갈등이 생길 수 있어요.", reality: "소외감이나 무리와의 거리감이 갈등으로 나타날 수 있습니다.", fun: "소외감 느끼거나 무리 속에 안 녹아들어서 갈등 생길 수 있어." },
    },
    strength: {
      strong: { empathy: "관계를 오래 유지하는 의리와 유대감이 있어요. 함께 오래가는 우정을 만들어요.", reality: "의리와 유대감이 뚜렷하여 관계 지속력과 우정 형성에 강점이 있습니다.", fun: "의리랑 유대감 있어서 관계 오래 유지해. 함께 오래가는 우정 만들어." },
      weak: { empathy: "독립적이고 자기 주관이 뚜렷해 관계에서 흔들리지 않아요. 소수 정예의 깊은 관계를 만들어요.", reality: "독립성과 주관이 뚜렷하여 소수 정예의 깊은 관계를 형성하는 강점이 있습니다.", fun: "독립적이고 주관 뚜렷해서 관계에서 안 흔들려. 소수 정예 깊은 관계 만들어." },
    },
  },
  식상: {
    view: {
      strong: { empathy: "상대가 어떤 사람인지 말과 행동으로 직접 확인하려 해요. 첫 인상보다 반응을 보고 판단해요.", reality: "말과 행동으로 상대를 직접 확인하며 반응을 보고 판단하는 경향이 있습니다.", fun: "말이랑 행동으로 상대가 어떤 사람인지 직접 확인하려 해. 반응 보고 판단해." },
      weak: { empathy: "상대를 관찰하되 먼저 표현하지 않아요. 조용히 지켜보며 판단하는 경향이 있어요.", reality: "관찰 위주로 판단하며 먼저 표현하지 않는 경향이 있습니다.", fun: "관찰만 하고 먼저 표현 안 해. 조용히 지켜보며 판단해." },
    },
    role: {
      strong: { empathy: "분위기를 만들고 표현하는 역할을 맡아요. 사람들을 편하게 만들고 에너지를 전달해요.", reality: "분위기 형성과 표현 역할을 하며 에너지를 전달하는 패턴을 보입니다.", fun: "분위기 만들고 표현하는 역할 맡아. 사람들 편하게 만들고 에너지 전달해." },
      weak: { empathy: "앞에 나서기보다 뒤에서 지지하는 역할을 해요. 조용하지만 필요한 순간에 존재감이 드러나요.", reality: "뒤에서 지지하는 역할을 하며 필요한 순간 존재감이 드러나는 경향이 있습니다.", fun: "앞보다 뒤에서 지지하는 역할이야. 조용한데 필요한 순간 존재감 드러나." },
    },
    pattern: {
      strong: { empathy: "내가 먼저 표현하고 관계를 이끄는 패턴이 반복돼요. 표현이 과할 때 오해가 생기기도 해요.", reality: "먼저 표현하고 관계를 이끄는 패턴이 반복되며 표현 과잉 시 오해가 발생할 수 있습니다.", fun: "내가 먼저 표현하고 관계 이끄는 패턴이 반복돼. 표현 과할 때 오해 생기기도 해." },
      weak: { empathy: "말을 아끼고 표현을 참는 패턴이 반복돼요. 속마음을 전달하지 못해 관계가 어긋날 수 있어요.", reality: "말을 아끼고 표현을 참다 속마음 전달 실패로 관계가 어긋나는 패턴이 있을 수 있습니다.", fun: "말 아끼고 표현 참는 패턴이 반복돼. 속마음 안 전달돼서 관계 어긋날 수 있어." },
    },
    conflict: {
      strong: { empathy: "직설적 표현이 오해를 불러 갈등이 생겨요. 의도는 좋지만 전달 방식이 문제가 될 수 있어요.", reality: "직설적 표현이 오해를 불러 갈등이 발생하며 전달 방식이 이슈가 될 수 있습니다.", fun: "직설적 표현이 오해 불러서 갈등 생겨. 의도는 좋은데 전달 방식이 문제될 수 있어." },
      weak: { empathy: "말을 참고 속에 쌓아두다 갈등이 터질 수 있어요. 겉으로 드러나지 않아 상대가 눈치채기 어려워요.", reality: "말을 참아 쌓았다가 갈등이 폭발하는 구조이며 상대가 눈치채기 어렵습니다.", fun: "말 참고 쌓아두다가 갈등 터질 수 있어. 겉으로 안 드러나서 상대가 눈치채기 어려워." },
    },
    strength: {
      strong: { empathy: "사람을 편하게 만드는 표현력과 분위기 능력이 있어요. 인간관계 확장력이 강하고 사람들이 모여요.", reality: "표현력과 분위기 형성 능력이 뚜렷하여 인간관계 확장력이 강합니다.", fun: "표현력이랑 분위기로 사람 편하게 만들어. 인간관계 확장력 강하고 사람들이 모여." },
      weak: { empathy: "말보다 행동으로 진심을 전달해요. 조용하지만 신뢰감을 주는 존재로 인식돼요.", reality: "행동으로 진심을 전달하며 조용하지만 신뢰감을 주는 존재로 인식됩니다.", fun: "말보다 행동으로 진심 전달해. 조용한데 신뢰감 주는 타입이야." },
    },
  },
  재성: {
    view: {
      strong: { empathy: "상대가 나에게 어떤 현실적 의미가 있는지 무의식적으로 따져요. 관계의 실용성을 봐요.", reality: "상대에 대한 현실적 의미와 관계의 실용성을 무의식적으로 평가하는 경향이 있습니다.", fun: "상대가 나한테 뭘 주는지 무의식적으로 따져. 관계의 실용성 봐." },
      weak: { empathy: "실용적 계산보다 감정적 인상으로 상대를 봐요. 관계의 이해관계에 둔감할 수 있어요.", reality: "실용적 계산보다 감정적 인상으로 상대를 보며 이해관계에 둔감할 수 있습니다.", fun: "실용 계산보다 감정적 인상으로 사람 봐. 이해관계에 둔감할 수 있어." },
    },
    role: {
      strong: { empathy: "관계에서 관리자·책임자 역할을 자주 맡아요. 사람들을 챙기고 현실적으로 연결해요.", reality: "관계에서 관리·책임 역할을 맡아 사람들을 챙기고 연결하는 패턴을 보입니다.", fun: "관계에서 챙기고 연결하는 역할 자주 맡아. 관리자·책임자 포지션이야." },
      weak: { empathy: "관계 관리보다 흐름에 맡기는 편이에요. 책임지는 역할을 부담스러워할 수 있어요.", reality: "관계를 적극 관리하기보다 흐름에 맡기며 책임 역할을 부담스러워할 수 있습니다.", fun: "관계 관리보다 흐름에 맡기는 편이야. 책임 역할 부담스러워할 수 있어." },
    },
    pattern: {
      strong: { empathy: "관계에서 챙기는 쪽·베푸는 쪽이 되는 패턴이 반복돼요. 지치거나 소모되는 관계가 생길 수 있어요.", reality: "챙기고 베푸는 패턴이 반복되며 소모되는 관계가 생길 수 있습니다.", fun: "챙기고 베푸는 쪽이 되는 패턴이 반복돼. 지치거나 소모되는 관계 생길 수 있어." },
      weak: { empathy: "관계 유지에 소홀해지거나 자연스럽게 멀어지는 패턴이 반복돼요.", reality: "관계 유지에 소홀하거나 자연스럽게 멀어지는 패턴이 반복될 수 있습니다.", fun: "관계 유지 소홀해지거나 자연스럽게 멀어지는 패턴이 반복돼." },
    },
    conflict: {
      strong: { empathy: "내가 더 많이 준다는 불균형 인식이 갈등이 될 수 있어요. 기여에 비해 인정받지 못한다는 감정이 생겨요.", reality: "기여 대비 인정 부족 감정이나 불균형 인식이 갈등으로 이어질 수 있습니다.", fun: "내가 더 많이 준다고 느껴서 갈등 생길 수 있어. 인정 못 받는다고 느끼기도 해." },
      weak: { empathy: "관계 유지에 소홀해 상대가 무관심하다고 느끼는 갈등이 생길 수 있어요.", reality: "관계 유지 소홀로 상대가 무관심하다고 느끼는 갈등이 발생할 수 있습니다.", fun: "관계 유지 소홀해서 상대가 무관심하다고 느끼는 갈등 생길 수 있어." },
    },
    strength: {
      strong: { empathy: "관계를 현실적으로 관리하고 사람들을 연결하는 능력이 있어요. 협력해서 실질적 결과를 만들어요.", reality: "관계의 현실적 관리와 연결 능력이 뚜렷하여 협력으로 실질적 결과를 만듭니다.", fun: "관계 현실적으로 관리하고 사람 연결해. 협력해서 실질적 결과 만들어." },
      weak: { empathy: "이해관계 없이 순수하게 관계를 맺어요. 사심 없는 태도로 편안함을 줘요.", reality: "이해관계 없이 순수한 관계를 맺으며 사심 없는 태도로 편안함을 제공합니다.", fun: "이해관계 없이 순수하게 관계 맺어. 사심 없이 편안함 줘." },
    },
  },
  관성: {
    view: {
      strong: { empathy: "상대의 태도, 책임감, 신뢰성을 기준으로 판단해요. 약속을 지킬 사람인지 먼저 봐요.", reality: "상대의 태도·책임감·신뢰성을 기준으로 판단하며 약속 이행 가능성을 중시합니다.", fun: "상대 태도, 책임감, 신뢰성 보고 판단해. 약속 지킬 사람인지 먼저 봐." },
      weak: { empathy: "규범적 기준보다 분위기와 감각으로 사람을 봐요. 가벼운 관계에도 열려 있어요.", reality: "규범보다 분위기·감각으로 사람을 보며 가벼운 관계에도 개방적입니다.", fun: "규범보다 분위기랑 감각으로 사람 봐. 가벼운 관계에도 열려 있어." },
    },
    role: {
      strong: { empathy: "관계에서 기준을 제시하는 역할을 해요. 신뢰와 책임으로 믿을 수 있는 사람으로 인식돼요.", reality: "관계에서 기준 제시 역할을 하며 신뢰·책임 기반으로 인식됩니다.", fun: "관계에서 기준 제시하는 역할이야. 신뢰랑 책임으로 믿을 수 있는 사람으로 인식돼." },
      weak: { empathy: "규칙보다 자유로운 관계를 선호해요. 역할이 고정되기보다 유동적으로 움직여요.", reality: "규칙보다 자유로운 관계를 선호하며 역할이 유동적인 경향이 있습니다.", fun: "규칙보다 자유로운 관계 선호해. 역할 고정보다 유동적으로 움직여." },
    },
    pattern: {
      strong: { empathy: "책임지는 관계, 기대를 받는 관계가 반복돼요. 부담을 떠안는 패턴이 생기기도 해요.", reality: "책임·기대 받는 관계가 반복되며 부담을 떠안는 패턴이 있습니다.", fun: "책임지고 기대 받는 관계가 반복돼. 부담 떠안는 패턴 생기기도 해." },
      weak: { empathy: "느슨한 관계, 책임 없는 관계가 반복돼요. 관계의 지속성이 약할 수 있어요.", reality: "느슨하고 책임이 적은 관계가 반복되며 지속성이 약할 수 있습니다.", fun: "느슨한 관계, 책임 없는 관계가 반복돼. 지속성 약할 수 있어." },
    },
    conflict: {
      strong: { empathy: "기준과 규칙을 지키지 않는 사람과 충돌이 생겨요. 원칙주의가 융통성 없다는 오해를 살 수 있어요.", reality: "기준·규칙 미준수 시 충돌이 발생하며 원칙주의가 융통성 부족으로 오해받을 수 있습니다.", fun: "기준·규칙 안 지키는 사람이랑 충돌 생겨. 원칙주의가 융통성 없다고 오해받을 수 있어." },
      weak: { empathy: "책임이나 약속에 느슨한 태도가 갈등을 만들 수 있어요. 상대가 신뢰를 의심하게 될 수 있어요.", reality: "책임·약속에 대한 느슨한 태도가 갈등과 신뢰 의심으로 이어질 수 있습니다.", fun: "책임·약속에 느슨해서 갈등 생길 수 있어. 상대가 신뢰 의심할 수 있어." },
    },
    strength: {
      strong: { empathy: "신뢰와 책임 기반의 관계를 만들어요. 믿을 수 있는 사람으로 오래 기억돼요.", reality: "신뢰·책임 기반 관계 형성 능력이 뚜렷하여 오래 기억되는 존재가 됩니다.", fun: "신뢰랑 책임으로 관계 만들어. 믿을 수 있는 사람으로 오래 기억돼." },
      weak: { empathy: "자유롭고 유연한 관계를 만들어요. 부담 없는 관계 스타일로 다양한 사람들과 어울려요.", reality: "자유롭고 유연한 관계를 만들며 부담 없는 스타일로 다양한 사람과 어울립니다.", fun: "자유롭고 유연한 관계 만들어. 부담 없이 다양한 사람들이랑 어울려." },
    },
  },
};

const DIM_LABEL: Record<DimKey, Record<RelationStyleToneKey, string>> = {
  view: { empathy: "타인을 보는 시선", reality: "타인을 보는 시선", fun: "타인을 보는 시선" },
  role: { empathy: "관계 속 역할", reality: "관계 속 역할", fun: "관계 속 역할" },
  pattern: { empathy: "반복되는 관계 패턴", reality: "반복되는 관계 패턴", fun: "반복되는 관계 패턴" },
  conflict: { empathy: "갈등 포인트", reality: "갈등 포인트", fun: "갈등 포인트" },
  strength: { empathy: "인간관계 강점", reality: "인간관계 강점", fun: "인간관계 강점" },
};

/** 합산 개수 기준 상위 2개 그룹 (동률이면 GROUPS 순서) */
function pickTopTwoGroups(groupCounts: Record<string, number>): [GroupKey, GroupKey] {
  const order = [...GROUPS].sort((a, b) => (groupCounts[b] ?? 0) - (groupCounts[a] ?? 0));
  return [order[0], order[1] ?? order[0]];
}

/**
 * 인간관계 스타일 문단 생성. ~600자.
 * 상위 1~2개 그룹만 사용해 5차원(시선·역할·패턴·갈등·강점)을 한 문장씩 이어 붙임.
 */
export function getRelationshipStyleParagraph(
  pillars: SajuPillarsForRelationStyle,
  tone: RelationStyleToneKey
): string {
  const count = countTenGods(pillars);
  const groupCounts = getGroupCounts(count);
  const isStrong = (g: GroupKey) => (groupCounts[g] ?? 0) >= 2;
  const [top, second] = pickTopTwoGroups(groupCounts);

  const parts: string[] = [];
  const intro: Record<RelationStyleToneKey, string> = {
    empathy: "아마 스스로도 관계에서 이런 모습을 느껴왔을 수 있어요. 사주에서 보이는 인간관계 스타일은 결함이 아니라 상황에 따라 드러나는 강점이에요. ",
    reality: "사주에서 보이는 인간관계 스타일은 결함이 아니라 특정 상황에서 강점이 되는 능력이며, 시간이 지날수록 그 힘이 더 분명해집니다. ",
    fun: "주변에서 인간관계 스타일 이런 말 들은 적 있을 수 있어. 사주에 보이는 건 결함이 아니라 상황에 따라 쓰는 강점이야. ",
  };
  parts.push(intro[tone]);

  const dimensions: DimKey[] = ["view", "role", "pattern", "conflict", "strength"];
  for (const dim of dimensions) {
    const label = DIM_LABEL[dim][tone];
    const g1Strong = isStrong(top);
    const t1 = TEXTS[top][dim][g1Strong ? "strong" : "weak"][tone];
    if (t1) {
      if (tone === "empathy") parts.push("<strong>" + label + "</strong>에서는 " + t1);
      else if (tone === "reality") parts.push("<strong>" + label + "</strong> " + t1);
      else parts.push("<strong>" + label + "</strong> " + t1);
    }
    if (dim === "strength" && second !== top) {
      const g2Strong = isStrong(second);
      const t2 = TEXTS[second][dim][g2Strong ? "strong" : "weak"][tone];
      if (t2) parts.push(t2);
    }
  }

  const timeAxis: Record<RelationStyleToneKey, string> = {
    empathy: "이 관계 스타일은 경험이 쌓일수록 더 큰 강점으로 작용해요. 시간이 지날수록 그 힘이 더 분명하게 드러납니다.",
    reality: "경험이 쌓일수록 더 큰 강점으로 작용합니다.",
    fun: "이 관계 스타일은 쌓일수록 더 큰 강점으로 작용해. 시간 지날수록 그 힘이 더 분명하게 드러나.",
  };
  parts.push(timeAxis[tone]);

  return parts.join("\n\n").trim();
}
