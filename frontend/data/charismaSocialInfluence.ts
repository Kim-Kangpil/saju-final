/**
 * 카리스마와 사회적 영향력.
 * 4축: 리더십(관성), 존재감(비겁), 표현력(식상), 흡인력(재성+인성).
 * 축별 점수 → 레벨(S/A/B/C/D) 계산 후 조합 유형으로 통변. 랭크는 노출하지 않고 내부 계산만. ~600자.
 */

export type CharismaToneKey = "empathy" | "reality" | "fun";

export interface SajuPillarsForCharisma {
  year: { cheongan: { hanja: string }; jiji: { hanja: string } };
  month: { cheongan: { hanja: string }; jiji: { hanja: string } };
  day: { cheongan: { hanja: string }; jiji: { hanja: string } };
  hour: { cheongan: { hanja: string }; jiji: { hanja: string } };
}

const BRANCH_MAIN_STEM: Record<string, string> = {
  "子": "癸", "丑": "己", "寅": "甲", "卯": "乙", "辰": "戊", "巳": "丙",
  "午": "丁", "未": "己", "申": "庚", "酉": "辛", "戌": "戊", "亥": "壬",
};

type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";
const STEM_META: Record<string, { el: Element; pol: Polarity }> = {
  "甲": { el: "wood", pol: "yang" }, "乙": { el: "wood", pol: "yin" },
  "丙": { el: "fire", pol: "yang" }, "丁": { el: "fire", pol: "yin" },
  "戊": { el: "earth", pol: "yang" }, "己": { el: "earth", pol: "yin" },
  "庚": { el: "metal", pol: "yang" }, "辛": { el: "metal", pol: "yin" },
  "壬": { el: "water", pol: "yang" }, "癸": { el: "water", pol: "yin" },
};

function elementOf(stem: string): Element | null {
  return STEM_META[stem]?.el ?? null;
}
function controls(a: Element, b: Element): boolean {
  const map: Record<Element, Element> = {
    wood: "earth", fire: "metal", earth: "water", metal: "wood", water: "fire",
  };
  return map[a] === b;
}

function tenGodFromStems(dayStem: string, targetStem: string): string {
  const dm = STEM_META[dayStem];
  const tm = STEM_META[targetStem];
  if (!dm || !tm) return "";
  const samePol = dm.pol === tm.pol;
  if (dm.el === tm.el) return samePol ? "비견" : "겁재";
  const next: Record<Element, Element> = {
    wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood",
  };
  const map: Record<Element, Element> = {
    wood: "earth", fire: "metal", earth: "water", metal: "wood", water: "fire",
  };
  if (next[dm.el] === tm.el) return samePol ? "식신" : "상관";
  if (next[tm.el] === dm.el) return samePol ? "편인" : "정인";
  if (map[dm.el] === tm.el) return samePol ? "편재" : "정재";
  if (map[tm.el] === dm.el) return samePol ? "편관" : "정관";
  return "";
}

const ZHI_CHONG: Record<string, string> = {
  "子": "午", "午": "子", "丑": "未", "未": "丑", "寅": "申", "申": "寅",
  "卯": "酉", "酉": "卯", "辰": "戌", "戌": "辰", "巳": "亥", "亥": "巳",
};
function isZhiChong(b1: string, b2: string): boolean {
  return !!(b1 && b2 && ZHI_CHONG[b1] === b2);
}

type PillarKey = "year" | "month" | "day" | "hour";
function getPillar(pillars: SajuPillarsForCharisma, key: PillarKey) {
  const p = pillars[key];
  const stem = p?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  const branch = p?.jiji?.hanja?.trim?.()?.[0] ?? "";
  const branchStem = branch ? BRANCH_MAIN_STEM[branch] ?? "" : "";
  return { stem, branch, branchStem };
}

/** 해당 기둥이 충·극으로 깨졌는지: 천간 극 지지 본기, 또는 지지가 일지와 충 */
function isPillarBroken(
  stem: string,
  branch: string,
  branchStem: string,
  dayBranch: string
): boolean {
  const se = elementOf(stem);
  const be = branchStem ? elementOf(branchStem) : null;
  if (se && be && controls(se, be)) return true;
  if (branch && dayBranch && isZhiChong(branch, dayBranch)) return true;
  return false;
}

type AxisKey = "leadership" | "presence" | "expression" | "attraction";
type LevelKey = "S" | "A" | "B" | "C" | "D";

interface Position { pillar: PillarKey; tenGod: string }
function collectPositions(pillars: SajuPillarsForCharisma, dayStem: string): Position[] {
  const out: Position[] = [];
  for (const key of ["year", "month", "day", "hour"] as PillarKey[]) {
    const { stem, branchStem } = getPillar(pillars, key);
    if (stem) {
      const tg = tenGodFromStems(dayStem, stem);
      if (tg) out.push({ pillar: key, tenGod: tg });
    }
    if (branchStem) {
      const tg = tenGodFromStems(dayStem, branchStem);
      if (tg) out.push({ pillar: key, tenGod: tg });
    }
  }
  return out;
}

function countByTenGod(positions: Position[]): Record<string, number> {
  const count: Record<string, number> = {
    비견: 0, 겁재: 0, 식신: 0, 상관: 0, 편재: 0, 정재: 0, 편관: 0, 정관: 0, 편인: 0, 정인: 0,
  };
  for (const { tenGod } of positions) {
    if (count[tenGod] !== undefined) count[tenGod]++;
  }
  return count;
}

/** 축별 점수. 관성/비겁/식상/재성·인성 충·극 시 -1 */
function computeScores(
  positions: Position[],
  broken: Set<PillarKey>,
  dayBranch: string
): Record<AxisKey, number> {
  const count = countByTenGod(positions);
  const hasChong = (tenGods: string[]) => {
    return tenGods.some(tg =>
      positions.some(p => p.tenGod === tg && broken.has(p.pillar))
    );
  };

  let leadership = (count["편관"] ?? 0) >= 1 ? 2 : 0;
  leadership += (count["정관"] ?? 0) >= 1 ? 1 : 0;
  if (hasChong(["정관", "편관"])) leadership -= 1;

  let presence = (count["겁재"] ?? 0) >= 1 ? 2 : 0;
  presence += (count["비견"] ?? 0) >= 1 ? 1 : 0;
  if (hasChong(["비견", "겁재"])) presence -= 1;

  let expression = (count["상관"] ?? 0) >= 1 ? 2 : 0;
  expression += (count["식신"] ?? 0) >= 1 ? 1 : 0;
  if (hasChong(["식신", "상관"])) expression -= 1;

  let attraction = (count["편재"] ?? 0) >= 1 ? 2 : 0;
  attraction += (count["편인"] ?? 0) >= 1 ? 1 : 0;
  attraction += (count["정재"] ?? 0) >= 1 ? 1 : 0;
  attraction += (count["정인"] ?? 0) >= 1 ? 1 : 0;
  if (hasChong(["편재", "정재", "편인", "정인"])) attraction -= 1;

  return { leadership, presence, expression, attraction };
}

function scoreToLevel(score: number): LevelKey {
  if (score >= 3) return "S";
  if (score >= 2) return "A";
  if (score >= 1) return "B";
  if (score >= 0) return "C";
  return "D";
}

// 축별 레벨 해석 (S/A/B/C/D) — 톤별 짧은 문장. 600자 내외로 조합용
const AXIS_TEXTS: Record<AxisKey, Record<LevelKey, Record<CharismaToneKey, string>>> = {
  leadership: {
    S: {
      empathy: "존재 자체가 권위라 말하지 않아도 압도하는 카리스마가 있고, 사람들이 자연스럽게 따르는 구조예요.",
      reality: "존재 자체가 권위이며 말하지 않아도 압도하는 카리스마. 조직과 집단의 중심이 됩니다.",
      fun: "존재만으로 압도하는 타입. 말 안 해도 사람들이 따르는 카리스마 있어.",
    },
    A: {
      empathy: "리더십이 강해요. 신뢰와 카리스마로 사람을 이끌고 방향을 제시하는 힘이 있어요.",
      reality: "강한 리더십. 신뢰와 카리스마로 사람을 이끌고 방향을 제시합니다.",
      fun: "리더십 강한 편. 신뢰랑 카리스마로 사람 이끄는 타입이야.",
    },
    B: {
      empathy: "리더십이 있으나 상황에 따라 발휘돼요. 책임감과 신뢰로 인정받는 편이에요.",
      reality: "리더십이 있으며 상황에 따라 발휘됩니다. 책임감과 신뢰 기반으로 인정받습니다.",
      fun: "리더십 있는데 상황에 따라 나와. 책임감이랑 신뢰로 인정받아.",
    },
    C: {
      empathy: "직책보다 관계와 실력으로 영향력을 만드는 편이에요. 실질로 인정받는 타입이에요.",
      reality: "전통적 리더십보다 관계와 실력으로 영향력을 만듭니다.",
      fun: "직책보다 실력이랑 관계로 영향력 만드는 타입이야.",
    },
    D: {
      empathy: "리더십이 직책보다 자신만의 영역을 만들 때 가장 잘 발휘돼요. 독립적 영역에서 강해요.",
      reality: "리더십은 직책보다 자신만의 영역을 만들 때 가장 강하게 발휘됩니다.",
      fun: "리더십은 자기 영역 만들 때 제일 잘 나와. 독립할 때 강해.",
    },
  },
  presence: {
    S: {
      empathy: "어디서든 밀리지 않는 에너지가 있어요. 공간을 장악하고 경쟁에서 물러서지 않아요.",
      reality: "어디서든 밀리지 않는 에너지. 공간을 장악하고 경쟁에서 물러서지 않습니다.",
      fun: "어디서든 안 밀려. 공간 장악하고 경쟁에서 안 물러서.",
    },
    A: {
      empathy: "존재감이 강해요. 사람들 사이에서 눈에 띄고 기억되는 편이에요.",
      reality: "강한 존재감. 사람들 사이에서 눈에 띄고 기억됩니다.",
      fun: "존재감 강해. 사람들 사이에서 눈에 띄고 기억돼.",
    },
    B: {
      empathy: "존재감이 있으나 선택적으로 드러나는 편이에요. 필요한 순간에 분명해져요.",
      reality: "존재감이 있으며 선택적으로 드러납니다.",
      fun: "존재감 있는데 선택적으로 보여. 필요한 순간에 분명해져.",
    },
    C: {
      empathy: "드러나는 존재감보다 내면의 밀도가 높아요. 조용해도 있을 때와 없을 때 차이가 느껴져요.",
      reality: "드러나는 존재감보다 내면의 밀도가 높습니다.",
      fun: "겉보다 안쪽 밀도가 높은 타입. 조용해도 있음 없음 차이 나.",
    },
    D: {
      empathy: "에너지가 분산될 때가 있어요. 집중하는 시기에 존재감이 극대화돼요.",
      reality: "에너지가 분산되지 않도록 집중하는 시기에 존재감이 극대화됩니다.",
      fun: "에너지 모을 때 존재감 커져. 집중하는 시기가 중요해.",
    },
  },
  expression: {
    S: {
      empathy: "말, 글, 콘텐츠 모든 방식에서 강해요. 생각이 자연스럽게 밖으로 나와 사람들에게 퍼져요.",
      reality: "말·글·콘텐츠 모든 방식에서 강합니다. 대중 영향력의 핵심 구조입니다.",
      fun: "말, 글, 콘텐츠 다 잘해. 생각이 저절로 밖으로 나와서 퍼져.",
    },
    A: {
      empathy: "표현력이 강해요. 메시지가 잘 전달되고 꾸준히 혹은 자극적으로 주목받아요.",
      reality: "강한 표현력. 메시지 전달과 주목도를 얻습니다.",
      fun: "표현력 강해. 메시지 잘 전달되고 주목받아.",
    },
    B: {
      empathy: "표현력이 있으나 상황에 따라 조절해요. 말보다 행동으로 전할 때도 있어요.",
      reality: "표현력이 있으며 상황에 따라 조절합니다.",
      fun: "표현력 있는데 상황에 따라 조절해. 말보다 행동으로 할 때도 있어.",
    },
    C: {
      empathy: "직접적 표현보다 결과와 실체로 영향력을 만드는 편이에요. 본업 실력으로 인정받아요.",
      reality: "직접적 표현보다 결과와 실체로 영향력을 만듭니다.",
      fun: "말보다 결과랑 실체로 영향력 만드는 타입이야.",
    },
    D: {
      empathy: "표현 방식과 타이밍을 조절하면 영향력이 크게 확장돼요.",
      reality: "표현 방식과 타이밍을 조절하면 영향력이 크게 확장됩니다.",
      fun: "표현 방식이랑 타이밍 잡으면 영향력 커져.",
    },
  },
  attraction: {
    S: {
      empathy: "사람과 자원이 자연스럽게 모여들어요. 네트워크가 넓고 기회가 끊이지 않는 편이에요.",
      reality: "사람과 자원이 자연스럽게 모여듭니다. 네트워크가 넓고 기회가 끊이지 않습니다.",
      fun: "사람이랑 자원이 자연스럽게 모여들어. 네트워크 넓고 기회 많아.",
    },
    A: {
      empathy: "흡인력이 강해요. 신뢰나 네트워크 한쪽이 특히 강하고 사람이 모여요.",
      reality: "강한 흡인력. 신뢰 또는 네트워크로 사람이 모입니다.",
      fun: "흡인력 강해. 사람 모이고 관계 이어져.",
    },
    B: {
      empathy: "흡인력이 있으나 선택적이에요. 필요한 사람과 깊이 연결하는 방식을 선호해요.",
      reality: "흡인력이 있으며 선택적으로 발휘됩니다.",
      fun: "흡인력 있는데 선택적이야. 필요한 사람이랑 깊이 연결해.",
    },
    C: {
      empathy: "흡인력보다 관계의 질을 중시해요. 넓이보다 깊이로 영향력을 만들어요.",
      reality: "흡인력보다 관계의 질을 중시합니다.",
      fun: "넓이보다 깊이로 영향력 만드는 타입이야.",
    },
    D: {
      empathy: "관계를 유지하는 구조를 만드는 것이 영향력의 핵심 과제예요.",
      reality: "관계를 유지하는 구조를 만드는 것이 영향력의 핵심 과제입니다.",
      fun: "관계 유지하는 구조 만드는 게 중요해.",
    },
  },
};

// 조합 유형: 우선순위대로 매칭. 유형명은 노출 안 함, 핵심 설명만 사용
const COMBINATION_TYPES: Array<{
  match: (levels: Record<AxisKey, LevelKey>) => boolean;
  lead: Record<CharismaToneKey, string>;
}> = [
  {
    match: (L) => (L.leadership === "S" || L.leadership === "A") && (L.presence === "S" || L.presence === "A"),
    lead: {
      empathy: "권위와 존재감으로 압도하는 타고난 카리스마가 있어요. ",
      reality: "권위와 존재감으로 압도하는 타고난 카리스마 구조입니다. ",
      fun: "권위랑 존재감으로 압도하는 타고난 카리스마 타입이야. ",
    },
  },
  {
    match: (L) => (L.leadership === "S" || L.leadership === "A") && (L.expression === "S" || L.expression === "A"),
    lead: {
      empathy: "말과 권위가 함께 작동하는 리더형 영향력이 있어요. 이끌면서 메시지를 전달해요. ",
      reality: "말과 권위가 함께 작동하는 리더형 영향력입니다. ",
      fun: "말이랑 권위가 같이 작동하는 리더형이야. 이끌면서 메시지 전달해. ",
    },
  },
  {
    match: (L) => (L.expression === "S" || L.expression === "A") && (L.attraction === "S" || L.attraction === "A"),
    lead: {
      empathy: "표현이 사람과 자원을 끌어모으는 인플루언서형 영향력이 있어요. ",
      reality: "표현이 사람과 자원을 끌어모으는 인플루언서형 구조입니다. ",
      fun: "표현이 사람이랑 자원 끌어모으는 인플루언서형이야. ",
    },
  },
  {
    match: (L) => (L.leadership === "S" || L.leadership === "A") && (L.attraction === "S" || L.attraction === "A"),
    lead: {
      empathy: "성과와 네트워크로 신뢰를 얻는 실용형 리더십이 있어요. ",
      reality: "성과와 네트워크로 신뢰를 얻는 실용형 리더십입니다. ",
      fun: "성과랑 네트워크로 신뢰 얻는 실용형 리더야. ",
    },
  },
  {
    match: (L) => (L.presence === "S" || L.presence === "A") && (L.expression === "S" || L.expression === "A"),
    lead: {
      empathy: "존재감과 표현이 결합된 중심 인물형이에요. 집단의 중심이 돼요. ",
      reality: "존재감과 표현이 결합된 중심 인물형입니다. ",
      fun: "존재감이랑 표현이 같이 있는 중심 인물형이야. ",
    },
  },
  {
    match: (L) => L.expression === "S" || L.expression === "A",
    lead: {
      empathy: "콘텐츠와 메시지로 퍼지는 표현형 영향력이 있어요. ",
      reality: "콘텐츠와 메시지로 퍼지는 표현형 영향력입니다. ",
      fun: "콘텐츠랑 메시지로 퍼지는 표현형이야. ",
    },
  },
  {
    match: (L) => L.leadership === "S" || L.leadership === "A",
    lead: {
      empathy: "조용해도 강한 권위로 이끄는 권위형 리더십이 있어요. ",
      reality: "조용하지만 강한 권위로 이끄는 권위형 리더십입니다. ",
      fun: "조용해도 권위로 이끄는 타입이야. ",
    },
  },
  {
    match: (L) => L.presence === "S" || L.presence === "A",
    lead: {
      empathy: "경쟁 속에서 밀리지 않는 생존형 존재감이 있어요. ",
      reality: "경쟁 속에서 밀리지 않는 생존형 존재감입니다. ",
      fun: "경쟁 속에서 안 밀리는 생존형 존재감이 있어. ",
    },
  },
  {
    match: (L) => L.attraction === "S" || L.attraction === "A",
    lead: {
      empathy: "사람과 자원을 연결하는 연결형 흡인력이 있어요. ",
      reality: "사람과 자원을 연결하는 연결형 흡인력입니다. ",
      fun: "사람이랑 자원 연결하는 타입이야. ",
    },
  },
  {
    match: (L) =>
      (L.leadership === "B" || L.leadership === "C") &&
      (L.presence === "B" || L.presence === "C") &&
      (L.expression === "B" || L.expression === "C") &&
      (L.attraction === "B" || L.attraction === "C"),
    lead: {
      empathy: "특정 축이 두드러지진 않지만 고르게 작동하는 균형형 영향력이에요. ",
      reality: "고르게 작동하는 균형형 영향력입니다. ",
      fun: "고르게 작동하는 균형형이야. ",
    },
  },
  {
    match: () => true,
    lead: {
      empathy: "드러나지 않지만 깊이가 있는 내면형 존재예요. 영향력이 잠재된 상태로 읽혀요. ",
      reality: "드러나지 않지만 깊이가 있는 내면형입니다. 영향력이 잠재된 구조입니다. ",
      fun: "겉으로 안 드러나도 깊이 있는 내면형이야. ",
    },
  },
];

const D_LEVEL_CORRECTION: Record<AxisKey, Record<CharismaToneKey, string>> = {
  leadership: {
    empathy: "리더십은 직책보다 자신만의 영역을 만들 때 가장 강하게 발휘돼요.",
    reality: "리더십은 직책보다 자신만의 영역을 만들 때 가장 강하게 발휘됩니다.",
    fun: "리더십은 자기 영역 만들 때 제일 잘 나와.",
  },
  presence: {
    empathy: "에너지가 분산되지 않도록 집중하는 시기에 존재감이 극대화돼요.",
    reality: "에너지가 분산되지 않도록 집중하는 시기에 존재감이 극대화됩니다.",
    fun: "에너지 모을 때 존재감 커져.",
  },
  expression: {
    empathy: "표현 방식과 타이밍을 조절하면 영향력이 크게 확장돼요.",
    reality: "표현 방식과 타이밍을 조절하면 영향력이 크게 확장됩니다.",
    fun: "표현 방식이랑 타이밍 잡으면 영향력 커져.",
  },
  attraction: {
    empathy: "관계를 유지하는 구조를 만드는 것이 영향력의 핵심 과제예요.",
    reality: "관계를 유지하는 구조를 만드는 것이 영향력의 핵심 과제입니다.",
    fun: "관계 유지하는 구조 만드는 게 중요해.",
  },
};

/**
 * 카리스마·사회적 영향력 통변. 4축 점수 → 레벨 → 조합 유형 + 축별 문장. ~600자.
 * 랭크(S/A/B/C/D)는 화면에 노출하지 않고 내부 계산만 사용.
 */
export function getCharismaSocialInfluenceParagraph(
  pillars: SajuPillarsForCharisma,
  tone: CharismaToneKey
): string {
  const dayStem = pillars.day?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  const dayBranch = pillars.day?.jiji?.hanja?.trim?.()?.[0] ?? "";
  if (!dayStem) return "";

  const positions = collectPositions(pillars, dayStem);
  const broken = new Set<PillarKey>();
  for (const key of ["year", "month", "day", "hour"] as PillarKey[]) {
    const { stem, branch, branchStem } = getPillar(pillars, key);
    if (isPillarBroken(stem, branch, branchStem, dayBranch)) broken.add(key);
  }

  const scores = computeScores(positions, broken, dayBranch);
  const levels: Record<AxisKey, LevelKey> = {
    leadership: scoreToLevel(scores.leadership),
    presence: scoreToLevel(scores.presence),
    expression: scoreToLevel(scores.expression),
    attraction: scoreToLevel(scores.attraction),
  };

  const typeRow = COMBINATION_TYPES.find((row) => row.match(levels));
  const lead = typeRow ? typeRow.lead[tone] : "";

  const parts: string[] = [lead];
  const axes: AxisKey[] = ["leadership", "presence", "expression", "attraction"];
  for (const axis of axes) {
    const level = levels[axis];
    const text = AXIS_TEXTS[axis][level][tone];
    if (text) parts.push(text);
  }

  const dAxes = axes.filter((a) => levels[a] === "D");
  for (const axis of dAxes) {
    const correction = D_LEVEL_CORRECTION[axis][tone];
    if (correction) parts.push(correction);
  }

  const CLOSING: Record<CharismaToneKey, string> = {
    empathy: "이런 영향력은 경험이 쌓이고 상황이 맞을수록 더 분명하게 드러날 수 있어요.",
    reality: "이러한 영향력은 경험이 쌓이고 상황이 맞을수록 더 분명하게 드러나는 구조입니다.",
    fun: "이런 영향력은 경험 쌓이고 상황 맞을수록 더 잘 드러날 수 있어.",
  };
  let out = parts.filter(Boolean).join(" ") + " " + CLOSING[tone];
  if (out.length > 650) {
    out = parts.filter(Boolean).join(" ").slice(0, 600).trim();
    const last = out.lastIndexOf(".");
    if (last > 500) out = out.slice(0, last + 1);
  }
  return out.trim();
}
