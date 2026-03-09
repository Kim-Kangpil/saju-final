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
      strong: { empathy: "상대 감정과 의도를 맥락으로 읽어서 쉽게 단정 짓지 않는 편이에요.", reality: "상대의 감정·의도·상황을 맥락과 분위기로 파악하며 단정을 보류하는 경향이 있습니다.", fun: "상대 감정이랑 의도를 맥락으로 읽어서 단정 잘 안 해." },
      weak: { empathy: "감정보다 현실 중심으로 보는 편이라 상황 파악은 빠른 대신 판단이 먼저 나올 수 있어요.", reality: "감정보다 현실 중심으로 상대를 보며, 공감보다 판단이 앞서는 경향이 있습니다.", fun: "감정보다 현실 중심으로 사람 봐. 판단이 공감보다 앞설 수 있어." },
    },
    role: {
      strong: { empathy: "이야기를 들어주고 받아주는 쪽으로 가면 이해자·조언자 역할을 자연스럽게 맡게 돼요.", reality: "관계에서 이해자·조언자 역할을 하며 이야기를 들어주고 받아주는 패턴을 보입니다.", fun: "들어주고 받아주는 쪽이 돼서 이해자·조언자 역할 자주 맡아." },
      weak: { empathy: "말보다 행동으로 관계에 기여하는 편이라 실질적인 도움을 주는 역할에 가까워요.", reality: "감정적 지원보다 실질적 행동으로 관계에 기여하는 경향이 있습니다.", fun: "말보다 행동으로 관계에 기여해. 실질적으로 역할 다하는 편이야." },
    },
    pattern: {
      strong: { empathy: "기대거나 반대로 다 받아주는 관계가 반복되면서 의존과 공감이 같이 돌아가는 편이에요.", reality: "의존과 공감이 반복되는 관계 패턴을 보입니다.", fun: "기대거나 다 받아주는 관계가 반복돼. 의존이랑 공감 패턴이 있어." },
      weak: { empathy: "깊은 정서 교류보다는 목적이 있는 관계, 실리적인 연결이 반복되는 편이에요.", reality: "감정적 유대보다 실리·목적 중심 관계가 반복되는 경향이 있습니다.", fun: "깊은 정서 교류보다 목적 중심 관계가 반복돼." },
    },
    conflict: {
      strong: { empathy: "상대를 너무 이해하려다 감정을 눌러 두거나 경계 없이 받아주다 지칠 수 있어요.", reality: "이해를 넘어 자신의 감정을 억누거나 경계 없이 받아주다 상처받는 갈등이 발생할 수 있습니다.", fun: "너무 이해하려다 감정 눌러 두거나, 경계 없이 받아주다 지칠 수 있어." },
      weak: { empathy: "판단이 먼저 보이다 보니 상대가 차갑다고 느끼는 경우가 생길 수 있어요.", reality: "공감 없이 판단하는 것으로 보여 상대가 차갑다고 느끼는 갈등이 발생할 수 있습니다.", fun: "공감 없이 판단하는 것처럼 보여서 상대가 차갑다고 느낄 수 있어." },
    },
    strength: {
      strong: { empathy: "감정과 상황을 깊이 읽어서 공감·상담·조언이 잘 맞고, 그래서 신뢰받는 쪽으로 가는 편이에요.", reality: "감정·상황 이해와 공감·상담·조언 능력이 뚜렷하여 신뢰받는 존재가 됩니다.", fun: "감정이랑 상황 깊이 이해해서 공감·조언 잘해. 신뢰받는 타입이야." },
      weak: { empathy: "감정에 휘둘리지 않고 상황을 냉정히 보는 편이라 위기일수록 현실적인 판단이 잘 나와요.", reality: "감정에 흔들리지 않고 냉정한 상황 파악과 위기 시 현실적 판단이 강점입니다.", fun: "감정에 안 흔들리고 냉정하게 상황 파악해. 위기에서 현실적 판단 잘해." },
    },
  },
  비겁: {
    view: {
      strong: { empathy: "상대를 나랑 같은 레벨로 보는 편이라 경쟁자이자 동료처럼 인식하는 쪽이에요.", reality: "상대를 동등한 존재·경쟁자 또는 동료로 인식하는 경향이 뚜렷합니다.", fun: "상대를 나랑 동등한 존재로 봐. 경쟁자나 동료로 인식하는 편이야." },
      weak: { empathy: "나와 구별된 존재로 보는 편이라 관계 안에서 내 자리를 먼저 읽으려 하는 경향이 있어요.", reality: "타인을 나와 구별된 존재로 보며 관계에서 자신의 위치를 파악하려 합니다.", fun: "타인을 나랑 구별되는 존재로 봐. 관계에서 내 위치를 먼저 파악하려 해." },
    },
    role: {
      strong: { empathy: "같이 움직이는 수평 관계를 만들고 의리·유대가 있어서 동료형 인간으로 비춰져요.", reality: "동료형 수평적 관계를 만들며 의리와 유대가 강한 패턴을 보입니다.", fun: "같이 움직이는 수평적 관계 만들어. 의리랑 유대가 강해." },
      weak: { empathy: "무리보다는 한 명 한 명 관계를 중시해서 독립적인 포지션을 취하는 편이에요.", reality: "관계에서 독립적 위치를 취하며 개별적 관계를 선호하는 경향이 있습니다.", fun: "관계에서 독립적인 위치 취해. 무리보다 개별 관계 선호해." },
    },
    pattern: {
      strong: { empathy: "함께 시작하고 같이 끌고 가는 관계가 반복되는데, 그만큼 경쟁이나 비교가 따라오기도 해요.", reality: "함께 움직이는 관계가 반복되며 경쟁·비교가 나타나는 패턴이 있습니다.", fun: "같이 시작하고 같이 움직이는 관계가 반복돼. 경쟁·비교 생기기도 해." },
      weak: { empathy: "혼자 처리하거나 관계 안에서도 독립적으로 움직이는 패턴이 반복되는 편이에요.", reality: "혼자 처리하거나 관계에서 독립적으로 행동하는 패턴이 반복됩니다.", fun: "혼자 처리하거나 관계에서 독립적으로 행동하는 패턴이 반복돼." },
    },
    conflict: {
      strong: { empathy: "동등함을 바라다 보니 경쟁심·비교의식이 올라와서 자존심이 부딪히는 일이 생길 수 있어요.", reality: "경쟁·비교의식이 갈등으로 이어지거나 자존심 충돌이 발생할 수 있습니다.", fun: "경쟁심이랑 비교의식이 갈등으로 번질 수 있어. 자존심 충돌 생기기도 해." },
      weak: { empathy: "무리 안에선 눈치가 안 맞거나 소외감이 들어서 갈등으로 이어질 수 있어요.", reality: "소외감이나 무리와의 거리감이 갈등으로 나타날 수 있습니다.", fun: "소외감 느끼거나 무리 속에 안 녹아들어서 갈등 생길 수 있어." },
    },
    strength: {
      strong: { empathy: "의리와 유대감이 있어서 관계를 오래 끌고 가고, 그만큼 우정이 깊어지는 편이에요.", reality: "의리와 유대감이 뚜렷하여 관계 지속력과 우정 형성에 강점이 있습니다.", fun: "의리랑 유대감 있어서 관계 오래 유지해. 함께 오래가는 우정 만들어." },
      weak: { empathy: "주관이 뚜렷해서 관계에서 흔들리지 않고, 소수와 깊은 관계를 만드는 쪽이에요.", reality: "독립성과 주관이 뚜렷하여 소수 정예의 깊은 관계를 형성하는 강점이 있습니다.", fun: "독립적이고 주관 뚜렷해서 관계에서 안 흔들려. 소수 정예 깊은 관계 만들어." },
    },
  },
  식상: {
    view: {
      strong: { empathy: "상대가 어떤 사람인지 말과 행동으로 확인하려는 편이라 첫인상보다 반응을 보고 판단해요.", reality: "말과 행동으로 상대를 직접 확인하며 반응을 보고 판단하는 경향이 있습니다.", fun: "말이랑 행동으로 상대가 어떤 사람인지 확인하려 해. 반응 보고 판단해." },
      weak: { empathy: "관찰은 잘하지만 먼저 말을 꺼내지 않아서 조용히 지켜보며 판단하는 쪽이에요.", reality: "관찰 위주로 판단하며 먼저 표현하지 않는 경향이 있습니다.", fun: "관찰만 하고 먼저 표현 안 해. 조용히 지켜보며 판단해." },
    },
    role: {
      strong: { empathy: "분위기를 만들고 에너지를 전달하는 쪽이라 사람들을 편하게 만드는 역할에 가까워요.", reality: "분위기 형성과 표현 역할을 하며 에너지를 전달하는 패턴을 보입니다.", fun: "분위기 만들고 표현하는 역할 맡아. 사람들 편하게 만들고 에너지 전달해." },
      weak: { empathy: "앞보다는 뒤에서 지지하는 역할이 맞고, 조용해도 필요한 순간엔 존재감이 드러나는 편이에요.", reality: "뒤에서 지지하는 역할을 하며 필요한 순간 존재감이 드러나는 경향이 있습니다.", fun: "앞보다 뒤에서 지지하는 역할이야. 조용한데 필요한 순간 존재감 드러나." },
    },
    pattern: {
      strong: { empathy: "먼저 표현하고 관계를 이끄는 패턴이 반복되는데, 과할 때는 오해로 이어질 수 있어요.", reality: "먼저 표현하고 관계를 이끄는 패턴이 반복되며 표현 과잉 시 오해가 발생할 수 있습니다.", fun: "내가 먼저 표현하고 관계 이끄는 패턴이 반복돼. 표현 과할 때 오해 생기기도 해." },
      weak: { empathy: "말을 아끼다 보니 속마음이 잘 안 전달돼서 관계가 어긋나는 일이 생길 수 있어요.", reality: "말을 아끼고 표현을 참다 속마음 전달 실패로 관계가 어긋나는 패턴이 있을 수 있습니다.", fun: "말 아끼고 표현 참는 패턴이 반복돼. 속마음 안 전달돼서 관계 어긋날 수 있어." },
    },
    conflict: {
      strong: { empathy: "직설적으로 말하다 보니 오해가 나서 갈등이 생기거나, 의도와 전달 방식이 어긋날 수 있어요.", reality: "직설적 표현이 오해를 불러 갈등이 발생하며 전달 방식이 이슈가 될 수 있습니다.", fun: "직설적 표현이 오해 불러서 갈등 생겨. 의도는 좋은데 전달 방식이 문제될 수 있어." },
      weak: { empathy: "말을 참다가 한 번에 터지면 상대가 눈치채기 어려워서 갈등이 커질 수 있어요.", reality: "말을 참아 쌓았다가 갈등이 폭발하는 구조이며 상대가 눈치채기 어렵습니다.", fun: "말 참고 쌓아두다가 갈등 터질 수 있어. 겉으로 안 드러나서 상대가 눈치채기 어려워." },
    },
    strength: {
      strong: { empathy: "표현력과 분위기로 사람을 편하게 만들어서 인간관계가 넓어지고 사람이 모이는 편이에요.", reality: "표현력과 분위기 형성 능력이 뚜렷하여 인간관계 확장력이 강합니다.", fun: "표현력이랑 분위기로 사람 편하게 만들어. 인간관계 확장력 강하고 사람들이 모여." },
      weak: { empathy: "말보다 행동으로 진심이 전해져서 조용해도 신뢰받는 존재로 남는 쪽이에요.", reality: "행동으로 진심을 전달하며 조용하지만 신뢰감을 주는 존재로 인식됩니다.", fun: "말보다 행동으로 진심 전달해. 조용한데 신뢰감 주는 타입이야." },
    },
  },
  재성: {
    view: {
      strong: { empathy: "상대가 나에게 어떤 의미가 있는지, 관계가 실질적으로 어떤지 무의식적으로 따지는 편이에요.", reality: "상대에 대한 현실적 의미와 관계의 실용성을 무의식적으로 평가하는 경향이 있습니다.", fun: "상대가 나한테 뭘 주는지 무의식적으로 따져. 관계의 실용성 봐." },
      weak: { empathy: "실용보다 감정·인상으로 사람을 보는 편이라 이해관계에 둔감할 수 있어요.", reality: "실용적 계산보다 감정적 인상으로 상대를 보며 이해관계에 둔감할 수 있습니다.", fun: "실용 계산보다 감정적 인상으로 사람 봐. 이해관계에 둔감할 수 있어." },
    },
    role: {
      strong: { empathy: "챙기고 연결하는 역할을 자주 맡아서 관계 안에서 관리자·책임자에 가까운 포지션이에요.", reality: "관계에서 관리·책임 역할을 맡아 사람들을 챙기고 연결하는 패턴을 보입니다.", fun: "관계에서 챙기고 연결하는 역할 자주 맡아. 관리자·책임자 포지션이야." },
      weak: { empathy: "관계를 적극 관리하기보다 흐름에 맡기는 편이라 책임 역할이 부담될 수 있어요.", reality: "관계를 적극 관리하기보다 흐름에 맡기며 책임 역할을 부담스러워할 수 있습니다.", fun: "관계 관리보다 흐름에 맡기는 편이야. 책임 역할 부담스러워할 수 있어." },
    },
    pattern: {
      strong: { empathy: "챙기고 베푸는 쪽이 되다 보니 반복되면서 지치거나 소모되는 관계가 생길 수 있어요.", reality: "챙기고 베푸는 패턴이 반복되며 소모되는 관계가 생길 수 있습니다.", fun: "챙기고 베푸는 쪽이 되는 패턴이 반복돼. 지치거나 소모되는 관계 생길 수 있어." },
      weak: { empathy: "관계 유지에 손을 많이 쓰지 않아서 자연스럽게 멀어지는 패턴이 반복될 수 있어요.", reality: "관계 유지에 소홀하거나 자연스럽게 멀어지는 패턴이 반복될 수 있습니다.", fun: "관계 유지 소홀해지거나 자연스럽게 멀어지는 패턴이 반복돼." },
    },
    conflict: {
      strong: { empathy: "내가 더 많이 준다고 느끼거나 기여에 비해 인정이 부족하다고 느껴서 갈등이 생길 수 있어요.", reality: "기여 대비 인정 부족 감정이나 불균형 인식이 갈등으로 이어질 수 있습니다.", fun: "내가 더 많이 준다고 느껴서 갈등 생길 수 있어. 인정 못 받는다고 느끼기도 해." },
      weak: { empathy: "관계에 손을 덜 쓰다 보니 상대가 무관심하다고 느끼는 갈등이 생길 수 있어요.", reality: "관계 유지 소홀로 상대가 무관심하다고 느끼는 갈등이 발생할 수 있습니다.", fun: "관계 유지 소홀해서 상대가 무관심하다고 느끼는 갈등 생길 수 있어." },
    },
    strength: {
      strong: { empathy: "관계를 정리하고 사람을 연결하는 데 익숙해서 협력해서 결과를 만드는 쪽에 가까워요.", reality: "관계의 현실적 관리와 연결 능력이 뚜렷하여 협력으로 실질적 결과를 만듭니다.", fun: "관계 현실적으로 관리하고 사람 연결해. 협력해서 실질적 결과 만들어." },
      weak: { empathy: "이해관계 없이 순수하게 대해서 사심 없다고 느끼고 편안해하는 사람이 많아요.", reality: "이해관계 없이 순수한 관계를 맺으며 사심 없는 태도로 편안함을 제공합니다.", fun: "이해관계 없이 순수하게 관계 맺어. 사심 없이 편안함 줘." },
    },
  },
  관성: {
    view: {
      strong: { empathy: "상대의 태도, 책임감, 신뢰를 보고 판단하는 편이라 약속을 지킬 사람인지 먼저 보게 돼요.", reality: "상대의 태도·책임감·신뢰성을 기준으로 판단하며 약속 이행 가능성을 중시합니다.", fun: "상대 태도, 책임감, 신뢰성 보고 판단해. 약속 지킬 사람인지 먼저 봐." },
      weak: { empathy: "규범보다 분위기·감각으로 사람을 보는 편이라 가벼운 관계에도 잘 열려 있어요.", reality: "규범보다 분위기·감각으로 사람을 보며 가벼운 관계에도 개방적입니다.", fun: "규범보다 분위기랑 감각으로 사람 봐. 가벼운 관계에도 열려 있어." },
    },
    role: {
      strong: { empathy: "기준을 제시하는 쪽이라 신뢰와 책임으로 믿을 수 있는 사람으로 보이는 편이에요.", reality: "관계에서 기준 제시 역할을 하며 신뢰·책임 기반으로 인식됩니다.", fun: "관계에서 기준 제시하는 역할이야. 신뢰랑 책임으로 믿을 수 있는 사람으로 인식돼." },
      weak: { empathy: "규칙보다 자유로운 관계를 선호해서 역할이 고정되지 않고 유동적으로 움직이는 편이에요.", reality: "규칙보다 자유로운 관계를 선호하며 역할이 유동적인 경향이 있습니다.", fun: "규칙보다 자유로운 관계 선호해. 역할 고정보다 유동적으로 움직여." },
    },
    pattern: {
      strong: { empathy: "책임지고 기대에 답하는 관계가 반복되다 보니 부담을 떠안는 패턴이 생기기도 해요.", reality: "책임·기대 받는 관계가 반복되며 부담을 떠안는 패턴이 있습니다.", fun: "책임지고 기대 받는 관계가 반복돼. 부담 떠안는 패턴 생기기도 해." },
      weak: { empathy: "느슨하고 책임이 적은 관계가 반복되면서 지속성이 약해질 수 있어요.", reality: "느슨하고 책임이 적은 관계가 반복되며 지속성이 약할 수 있습니다.", fun: "느슨한 관계, 책임 없는 관계가 반복돼. 지속성 약할 수 있어." },
    },
    conflict: {
      strong: { empathy: "기준과 규칙을 안 지키는 사람과 부딪히거나, 원칙을 지키다가 융통성 없다는 말을 들을 수 있어요.", reality: "기준·규칙 미준수 시 충돌이 발생하며 원칙주의가 융통성 부족으로 오해받을 수 있습니다.", fun: "기준·규칙 안 지키는 사람이랑 충돌 생겨. 원칙주의가 융통성 없다고 오해받을 수 있어." },
      weak: { empathy: "책임이나 약속에 느슨해 보이다가 상대가 신뢰를 의심하는 상황이 생길 수 있어요.", reality: "책임·약속에 대한 느슨한 태도가 갈등과 신뢰 의심으로 이어질 수 있습니다.", fun: "책임·약속에 느슨해서 갈등 생길 수 있어. 상대가 신뢰 의심할 수 있어." },
    },
    strength: {
      strong: { empathy: "신뢰와 책임으로 관계를 만들어서 믿을 수 있는 사람으로 오래 기억되는 편이에요.", reality: "신뢰·책임 기반 관계 형성 능력이 뚜렷하여 오래 기억되는 존재가 됩니다.", fun: "신뢰랑 책임으로 관계 만들어. 믿을 수 있는 사람으로 오래 기억돼." },
      weak: { empathy: "자유롭고 유연하게 대해서 부담 없이 다양한 사람과 잘 어울리는 쪽이에요.", reality: "자유롭고 유연한 관계를 만들며 부담 없는 스타일로 다양한 사람과 어울립니다.", fun: "자유롭고 유연한 관계 만들어. 부담 없이 다양한 사람들이랑 어울려." },
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
 * 인간관계 스타일 문단 생성. ~600자, 문단 2~3개.
 * 상위 1~2개 그룹만 사용해 5차원을 묶어서 자연스럽게 이어 붙임. 반복 도입/마무리 문구 없음.
 */
export function getRelationshipStyleParagraph(
  pillars: SajuPillarsForRelationStyle,
  tone: RelationStyleToneKey
): string {
  const count = countTenGods(pillars);
  const groupCounts = getGroupCounts(count);
  const isStrong = (g: GroupKey) => (groupCounts[g] ?? 0) >= 2;
  const [top, second] = pickTopTwoGroups(groupCounts);

  const line = (dim: DimKey, g: GroupKey) => {
    const strong = isStrong(g);
    return TEXTS[g][dim][strong ? "strong" : "weak"][tone];
  };

  const s1 = line("view", top);
  const s2 = line("role", top);
  const s3 = line("pattern", top);
  const s4 = line("conflict", top);
  const s5 = line("strength", top);
  const s5b = second !== top ? line("strength", second) : "";

  // 소제목 없이 서술문 속에 자연스럽게 녹임. ~600자, 2~3문단.
  if (tone === "empathy") {
    const p1 = s1 + " 관계에서는 " + s2;
    const p2 = s3 + " 다만 " + s4;
    const p3 = s5 + (s5b ? " " + s5b : "");
    return [p1, p2, p3].join("\n\n").trim();
  }
  if (tone === "reality") {
    const p1 = s1 + " 관계에서는 " + s2;
    const p2 = s3 + " 다만 " + s4;
    const p3 = s5 + (s5b ? " " + s5b : "");
    return [p1, p2, p3].join("\n\n").trim();
  }
  const p1 = s1 + " 관계에서는 " + s2;
  const p2 = s3 + " 다만 " + s4;
  const p3 = s5 + (s5b ? " " + s5b : "");
  return [p1, p2, p3].join("\n\n").trim();
}

// =========================
// 시각화용 데이터 (인간관계 스타일 게이지)
// =========================

export interface RelationshipGauge {
  key: "empathy" | "boundary" | "trust" | "advice" | "energy";
  label: string;
  emoji: string;
  value: number; // 0~100
  color: string;
  desc: string;
  tip?: string | null;
}

export interface RelationshipStyleVisualData {
  gauges: RelationshipGauge[];
  type: string;
  typeDesc: string;
  caution: string;
}

function scoreFromRaw(raw: number, max: number): number {
  const r = Math.max(0, Math.min(raw, max));
  const ratio = r / max;
  if (ratio >= 0.9) return 92;
  if (ratio >= 0.7) return 82;
  if (ratio >= 0.5) return 70;
  if (ratio >= 0.3) return 55;
  if (ratio > 0) return 40;
  return 28;
}

const TYPE_BY_GROUP: Record<GroupKey, { type: string; desc: string }> = {
  인성: {
    type: "이해자형",
    desc: "상대를 깊이 읽고 신뢰로 관계를 만드는 타입",
  },
  비겁: {
    type: "동료형",
    desc: "같이 움직이며 수평적인 유대를 만드는 타입",
  },
  식상: {
    type: "분위기 메이커형",
    desc: "표현과 분위기로 사람을 묶어 주는 타입",
  },
  재성: {
    type: "관리자형",
    desc: "사람과 일을 함께 정리하며 책임지는 타입",
  },
  관성: {
    type: "신뢰 리더형",
    desc: "기준과 책임으로 관계를 안정시키는 타입",
  },
};

export function getRelationshipStyleVisualData(
  pillars: SajuPillarsForRelationStyle,
  tone: RelationStyleToneKey
): RelationshipStyleVisualData | null {
  const tgCount = countTenGods(pillars);
  if (!Object.keys(tgCount).length) return null;
  const groupCounts = getGroupCounts(tgCount);
  const inCount = groupCounts["인성"] ?? 0;
  const biCount = groupCounts["비겁"] ?? 0;
  const sikCount = groupCounts["식상"] ?? 0;
  const jaeCount = groupCounts["재성"] ?? 0;
  const gwanCount = groupCounts["관성"] ?? 0;

  // 대략 0~6 범위로 가정
  const maxRaw = 6;

  const empathyRaw = inCount * 1.6 + sikCount * 0.6;
  const boundaryRaw = gwanCount * 1.4 + jaeCount * 0.8 - inCount * 0.6;
  const trustRaw = gwanCount * 1.2 + inCount + jaeCount * 0.6;
  const adviceRaw = inCount + sikCount * 0.9;
  const energyRaw = biCount + sikCount + jaeCount * 0.7;

  const empathyScore = scoreFromRaw(empathyRaw, maxRaw);
  const boundaryScore = scoreFromRaw(boundaryRaw, maxRaw);
  const trustScore = scoreFromRaw(trustRaw, maxRaw);
  const adviceScore = scoreFromRaw(adviceRaw, maxRaw);
  const energyScore = scoreFromRaw(energyRaw, maxRaw);

  const gauges: RelationshipGauge[] = [
    {
      key: "empathy",
      label: "공감력",
      emoji: "🫶",
      value: empathyScore,
      color: "#A78BD4",
      desc:
        empathyScore >= 70
          ? "상대 감정과 상황을 맥락으로 읽어서 쉽게 단정짓지 않는 편이에요."
          : "공감은 있지만, 상황을 빠르게 읽고 현실 판단을 먼저 세우는 편이에요.",
      tip:
        empathyScore < 55
          ? "판단을 하기 전에 한 번 더 '저 사람 입장'을 떠올려 보면 관계가 더 부드러워져요."
          : null,
    },
    {
      key: "boundary",
      label: "경계력",
      emoji: "🛡",
      value: boundaryScore,
      color: "#7EB8D4",
      desc:
        boundaryScore >= 70
          ? "선과 기준이 있어서 관계 속에서 내 자리를 지키는 힘이 있어요."
          : "상대를 먼저 생각하다 보니, 나의 한계를 나중에야 자각하는 편이에요.",
      tip:
        boundaryScore < 55
          ? "힘들다고 느껴질 때는 대화를 잠시 멈추고, 나의 컨디션을 먼저 확인해 보는 게 좋아요."
          : "기준이 분명하지만, 가끔은 여유를 두고 상대의 실수도 허용해 보면 관계가 더 편해져요.",
    },
    {
      key: "trust",
      label: "신뢰도",
      emoji: "🤝",
      value: trustScore,
      color: "#7EB8A0",
      desc:
        trustScore >= 70
          ? "약속과 책임을 지키는 편이라, 한 번 맺은 관계를 오래 가져가는 쪽이에요."
          : "관계에 오래 묶이기보다는, 상황에 맞게 거리를 조절하며 움직이는 편이에요.",
      tip:
        trustScore < 55
          ? "모든 관계를 오래 가져갈 필요는 없지만, 나에게 중요한 사람을 한두 명 정해 두면 힘이 돼요."
          : null,
    },
    {
      key: "advice",
      label: "조언력",
      emoji: "💡",
      value: adviceScore,
      color: "#E8C87A",
      desc:
        adviceScore >= 70
          ? "이해와 정리를 동시에 해서, 조언·피드백을 해 줄 때 힘이 실리는 편이에요."
          : "듣는 쪽이 더 편해서, 말보다 행동과 자세로 진심을 보여주는 스타일이에요.",
      tip:
        adviceScore < 55
          ? "모든 말을 완벽하게 할 필요는 없어요. '내가 느낀 한 줄'만 나눠도 충분히 힘이 될 때가 많아요."
          : null,
    },
    {
      key: "energy",
      label: "관계 체력",
      emoji: "🔋",
      value: energyScore,
      color: "#E89A7A",
      desc:
        energyScore >= 70
          ? "여러 사람과도 에너지를 나눌 수 있는 편이라, 관계 폭이 넓어지기 쉬워요."
          : "에너지 소모가 빠른 편이라, 깊고 편한 몇 관계에 집중할 때 더 힘이 나요.",
      tip:
        energyScore < 55
          ? "한 번에 많은 사람을 챙기기보다, 나를 편하게 해주는 관계 1~2개에 집중해도 충분해요."
          : "에너지가 넉넉한 만큼, 스스로를 위한 휴식 시간도 일정에 같이 넣어두면 좋아요.",
    },
  ];

  const [top] = pickTopTwoGroups(groupCounts);
  const meta = TYPE_BY_GROUP[top];
  const type = meta.type;
  const typeDesc = meta.desc;

  let caution: string;
  const highEmpathy = empathyScore >= 70;
  const lowBoundary = boundaryScore < 55;

  if (highEmpathy && lowBoundary) {
    caution =
      tone === "fun"
        ? "공감이 강한 만큼 나를 먼저 챙기는 연습이 필요해. 선을 그어 줄수록 관계가 더 오래가."
        : tone === "empathy"
          ? "공감이 강한 만큼 나를 먼저 챙기는 연습도 필요해요. 선을 한 번 그어 줄수록 관계가 더 오래 가요."
          : "공감이 강점인 만큼, 나를 먼저 챙기는 습관을 들일수록 관계가 오래 지속되는 구조입니다.";
  } else if (!highEmpathy && boundaryScore >= 70) {
    caution =
      tone === "fun"
        ? "기준이 분명해서 든든하지만, 가끔은 한 걸음 다가가 주면 관계가 더 따뜻해져."
        : tone === "empathy"
          ? "기준이 분명해 든든하지만, 가끔은 한 걸음 다가가 주면 관계가 더 따뜻해져요."
          : "기준과 경계가 분명해 든든하지만, 때로는 한 걸음 다가가는 시도가 관계를 더 따뜻하게 만듭니다.";
  } else {
    caution =
      tone === "fun"
        ? "지금의 관계 패턴이 약점이라기보다는, 상황에 따라 강점이 되는 무기야. 시간이 갈수록 이 무기를 쓰는 요령이 더 좋아질 거야."
        : tone === "empathy"
          ? "지금의 관계 패턴은 약점이라기보다, 상황에 따라 강점이 되는 무기예요. 시간이 지날수록 이 무기를 쓰는 요령이 더 좋아질 거예요."
          : "현재 관계 패턴은 약점이라기보다, 상황에 따라 강점이 되는 무기입니다. 시간이 지날수록 이 무기를 쓰는 요령이 더 좋아지는 구조입니다.";
  }

  return {
    gauges,
    type,
    typeDesc,
    caution,
  };
}
