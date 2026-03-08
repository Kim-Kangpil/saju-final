/**
 * 카리스마·사회적 영향력 (최종판).
 * STEP 1 십성 유무 → STEP 2 강도(천간 100% / 지지 70%, 충 -1 / 극 -0.5) → STEP 3 3축 점수
 * → STEP 4 사회적 영향력 지수 (3축 평균) → STEP 5 유형 분류 → STEP 6 해석 텍스트 → STEP 7 보정 문장.
 * 비겁은 일간 제외 추가 비겁 글자만 반영. ~600자.
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

const STEM_CHONG: Record<string, string> = {
  "甲": "庚", "庚": "甲", "乙": "辛", "辛": "乙", "丙": "壬", "壬": "丙", "丁": "癸", "癸": "丁",
};
const ZHI_CHONG: Record<string, string> = {
  "子": "午", "午": "子", "丑": "未", "未": "丑", "寅": "申", "申": "寅",
  "卯": "酉", "酉": "卯", "辰": "戌", "戌": "辰", "巳": "亥", "亥": "巳",
};
function isStemChong(s1: string, s2: string): boolean {
  return !!(s1 && s2 && STEM_CHONG[s1] === s2);
}
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

/** 8글자 위치: pillar, stem인지, 십성, 해당 글자 충 여부, 해당 글자 극 여부. 비겁은 일간 제외. */
interface Pos {
  pillar: PillarKey;
  isStem: boolean;
  tenGod: string;
  chong: boolean;
  ke: boolean;
}

function collectPositions(pillars: SajuPillarsForCharisma, dayStem: string): Pos[] {
  const dayBranch = pillars.day?.jiji?.hanja?.trim?.()?.[0] ?? "";
  const stemsByKey: Record<PillarKey, string> = { year: "", month: "", day: "", hour: "" };
  for (const key of ["year", "month", "day", "hour"] as PillarKey[]) {
    stemsByKey[key] = getPillar(pillars, key).stem;
  }
  const out: Pos[] = [];
  for (const key of ["year", "month", "day", "hour"] as PillarKey[]) {
    const { stem, branch, branchStem } = getPillar(pillars, key);
    if (stem) {
      const tg = tenGodFromStems(dayStem, stem);
      const chongStem = (["year", "month", "day", "hour"] as PillarKey[]).some(
        (k) => k !== key && stemsByKey[k] && isStemChong(stem, stemsByKey[k])
      );
      const se = elementOf(stem);
      const be = branchStem ? elementOf(branchStem) : null;
      const ke = !!(se && be && controls(se, be));
      const isDayStem = key === "day";
      if (tg && ((tg !== "비견" && tg !== "겁재") || !isDayStem)) {
        out.push({ pillar: key, isStem: true, tenGod: tg, chong: chongStem, ke });
      }
    }
    if (branch && branchStem) {
      const tg = tenGodFromStems(dayStem, branchStem);
      const chongZhi = dayBranch ? isZhiChong(branch, dayBranch) : false;
      const p = getPillar(pillars, key);
      const se = elementOf(p.stem);
      const be = elementOf(branchStem);
      const ke = !!(se && be && controls(se, be));
      const isDayStem = key === "day";
      if (tg && ((tg !== "비견" && tg !== "겁재") || !isDayStem)) {
        out.push({ pillar: key, isStem: false, tenGod: tg, chong: chongZhi, ke });
      }
    }
  }
  return out;
}

// 축별 기본 점수 (십성 → 점수)
const CHARISMA_BASE: Record<string, number> = { 편관: 2, 정관: 1, 겁재: 2, 비견: 1 };
const PUBLIC_BASE: Record<string, number> = { 상관: 2, 식신: 1, 편재: 2, 정재: 1 };
const INTELLECT_BASE: Record<string, number> = { 편인: 2, 정인: 1, 상관: 2, 식신: 1 };

type Axis3Key = "charisma" | "public" | "intellect";
type LevelKey = "S" | "A" | "B" | "C" | "D" | "F";

function scoreAxis(positions: Pos[], baseMap: Record<string, number>): { score: number; hadChongKe: boolean } {
  let score = 0;
  let hadChongKe = false;
  for (const p of positions) {
    const base = baseMap[p.tenGod];
    if (base == null) continue;
    const ratio = p.isStem ? 1.0 : 0.7;
    score += base * ratio;
    if (p.chong) {
      score -= 1;
      hadChongKe = true;
    }
    if (p.ke) {
      score -= 0.5;
      hadChongKe = true;
    }
  }
  return { score: Math.max(0, score), hadChongKe };
}

function scoreToLevel(score: number): LevelKey {
  if (score >= 4.0) return "S";
  if (score >= 3.0) return "A";
  if (score >= 2.0) return "B";
  if (score >= 1.0) return "C";
  if (score > 0) return "D";
  return "F";
}

// STEP 3: 3축 점수 계산 (식상은 대중·지적 양쪽에 반영)
function computeThreeAxisScores(positions: Pos[]): {
  charisma: number;
  public: number;
  intellect: number;
  charismaChongKe: boolean;
  publicChongKe: boolean;
  intellectChongKe: boolean;
} {
  const c = scoreAxis(positions, CHARISMA_BASE);
  const pub = scoreAxis(positions, PUBLIC_BASE);
  const int = scoreAxis(positions, INTELLECT_BASE);
  return {
    charisma: c.score,
    public: pub.score,
    intellect: int.score,
    charismaChongKe: c.hadChongKe,
    publicChongKe: pub.hadChongKe,
    intellectChongKe: int.hadChongKe,
  };
}

// STEP 5 유형 분류
function getType(levels: Record<Axis3Key, LevelKey>): { lead: Record<CharismaToneKey, string> } {
  const C = levels.charisma;
  const P = levels.public;
  const I = levels.intellect;
  const sa = (l: LevelKey) => l === "S" || l === "A";
  const bc = (l: LevelKey) => l === "B" || l === "C";
  const df = (l: LevelKey) => l === "D" || l === "F";

  if (sa(C) && sa(P) && sa(I)) {
    return { lead: { empathy: "모든 축이 강한 전방위형이에요. 시대를 이끄는 구조로 읽혀요. ", reality: "전방위형. 모든 축이 강한 구조입니다. ", fun: "전방위형이야. 다 강해. 시대 이끄는 타입. " } };
  }
  if (sa(C) && sa(P)) {
    return { lead: { empathy: "권위와 대중성을 동시에 가진 지배형이에요. 정치인·셀럽형에 가까워요. ", reality: "지배형. 권위와 대중성 동시 보유입니다. ", fun: "지배형이야. 권위랑 대중성 둘 다 있어. " } };
  }
  if (sa(C) && sa(I)) {
    return { lead: { empathy: "카리스마 있는 지식인, 권위 전문가형이에요. 강사·멘토형이에요. ", reality: "권위 전문가형. 카리스마 있는 지식인 구조입니다. ", fun: "권위 전문가형이야. 강사·멘토 타입. " } };
  }
  if (sa(P) && sa(I)) {
    return { lead: { empathy: "콘텐츠와 전문성이 결합한 지식 인플루언서형이에요. ", reality: "지식 인플루언서형. 콘텐츠와 전문성 결합 구조입니다. ", fun: "지식 인플루언서형이야. 콘텐츠랑 전문성 둘 다. " } };
  }
  if (sa(C)) {
    return { lead: { empathy: "권위와 존재감으로 이끄는 리더형이에요. ", reality: "리더형. 권위와 존재감으로 이끄는 구조입니다. ", fun: "리더형이야. 권위랑 존재감으로 이끄는 타입. " } };
  }
  if (sa(P)) {
    return { lead: { empathy: "표현과 확산으로 대중에게 퍼지는 인플루언서형이에요. ", reality: "인플루언서형. 표현과 확산으로 대중에게 퍼지는 구조입니다. ", fun: "인플루언서형이야. 표현으로 대중한테 퍼져. " } };
  }
  if (sa(I)) {
    return { lead: { empathy: "지식과 통찰로 신뢰를 얻는 전문가형이에요. ", reality: "전문가형. 지식과 통찰로 신뢰를 얻는 구조입니다. ", fun: "전문가형이야. 지식이랑 통찰로 신뢰 얻어. " } };
  }
  if (bc(C) && bc(P) && bc(I)) {
    return { lead: { empathy: "특출난 축 없이 고르게 작동하는 균형형이에요. ", reality: "균형형. 고르게 작동하는 구조입니다. ", fun: "균형형이야. 고르게 작동해. " } };
  }
  if (df(C) && df(P) && df(I)) {
    return { lead: { empathy: "드러나지 않지만 깊이가 있는 내면형이에요. 영향력이 잠재된 상태로 읽혀요. ", reality: "내면형. 드러나지 않지만 깊이가 있으며 잠재 상태입니다. ", fun: "내면형이야. 겉으로 안 나와도 깊이 있어. " } };
  }
  return { lead: { empathy: "카리스마·대중·지적 영향력이 조합된 구조로 읽혀요. ", reality: "3축 조합에 따른 영향력 구조입니다. ", fun: "카리스마·대중·지적이 조합된 타입이야. " } };
}

// STEP 6 축별 해석 텍스트 (S/A/B/C/D/F)
const AXIS_TEXTS: Record<Axis3Key, Record<LevelKey, Record<CharismaToneKey, string>>> = {
  charisma: {
    S: { empathy: "존재 자체가 권위예요. 말하지 않아도 공간을 장악하고 사람들이 자연스럽게 따라요. 타고난 카리스마로 조직과 집단의 중심이 되는 구조예요.", reality: "존재 자체가 권위입니다. 말하지 않아도 공간을 장악하고 사람들이 따릅니다. 타고난 카리스마로 조직·집단의 중심이 되는 구조입니다.", fun: "존재만으로 권위야. 말 안 해도 공간 장악하고 사람들이 따라. 타고난 카리스마로 중심 되는 타입이야." },
    A: { empathy: "강한 카리스마와 리더십이 있어요. 신뢰와 압도감을 동시에 가져요. 사람들을 이끌고 방향을 제시하는 힘이 있어요.", reality: "강한 카리스마와 리더십. 신뢰와 압도감을 동시에 가지며 사람을 이끕니다.", fun: "카리스마랑 리더십 강해. 신뢰랑 압도감 둘 다 있어. 사람 이끄는 힘이 있어." },
    B: { empathy: "카리스마가 있으나 상황에 따라 발휘돼요. 책임감과 존재감으로 사람들에게 인정받아요.", reality: "카리스마가 있으며 상황에 따라 발휘됩니다. 책임감과 존재감으로 인정받습니다.", fun: "카리스마 있는데 상황에 따라 나와. 책임감이랑 존재감으로 인정받아." },
    C: { empathy: "전통적 카리스마보다 실력과 관계로 영향력을 만들어요. 드러내지 않아도 주변이 알아보는 타입이에요.", reality: "실력과 관계로 영향력을 만듭니다. 드러내지 않아도 주변이 알아봅니다.", fun: "실력이랑 관계로 영향력 만드는 타입이야. 안 나서도 알아봐." },
    D: { empathy: "카리스마가 잠재된 상태예요. 특정 환경이나 시기에 폭발적으로 드러나는 구조예요.", reality: "카리스마가 잠재된 상태입니다. 특정 환경·시기에 폭발적으로 드러나는 구조입니다.", fun: "카리스마 잠재된 상태야. 특정 환경이나 시기에 폭발적으로 나와." },
    F: { empathy: "카리스마 축은 작동하지 않아요. 대신 다른 축에서 영향력이 형성돼요.", reality: "카리스마 축은 작동하지 않습니다. 다른 축에서 영향력이 형성됩니다.", fun: "카리스마 축은 안 나와. 대신 다른 축에서 영향력 생겨." },
  },
  public: {
    S: { empathy: "생각과 메시지가 사람들에게 자연스럽게 퍼져요. 사람과 자원이 모여드는 구조예요. 대중 플랫폼에서 가장 강하게 작동해요.", reality: "생각과 메시지가 사람에게 퍼집니다. 사람과 자원이 모여들며 대중 플랫폼에서 가장 강하게 작동합니다.", fun: "생각이랑 메시지가 사람한테 퍼져. 사람이랑 자원이 모여들어. 대중 플랫폼에서 제일 강해." },
    A: { empathy: "강한 표현력과 확산력이 있어요. 콘텐츠나 대인관계에서 사람들을 끌어당기는 힘이 있어요.", reality: "강한 표현력과 확산력. 콘텐츠·대인관계에서 사람을 끌어당깁니다.", fun: "표현력이랑 확산력 강해. 콘텐츠나 관계로 사람 끌어당겨." },
    B: { empathy: "대중 영향력이 있으나 선택적으로 발휘돼요. 특정 관계나 분야에서 강하게 작동해요.", reality: "대중 영향력이 있으며 선택적으로 발휘됩니다.", fun: "대중 영향력 있는데 선택적으로 나와. 특정 관계나 분야에서 강해." },
    C: { empathy: "직접적 확산보다 깊은 관계로 영향력을 만들어요. 소수에게 강하게 작용하는 타입이에요.", reality: "깊은 관계로 영향력을 만듭니다. 소수에게 강하게 작용합니다.", fun: "넓이보다 깊이로 영향력 만드는 타입이야. 소수한테 강해." },
    D: { empathy: "대중 영향력이 잠재된 상태예요. 표현 방식과 채널을 찾으면 확장돼요.", reality: "대중 영향력이 잠재된 상태입니다. 표현 방식·채널을 찾으면 확장됩니다.", fun: "대중 영향력 잠재된 상태야. 표현 방식이랑 채널 찾으면 커져." },
    F: { empathy: "대중 영향력 축이 약해요. 대신 카리스마나 지적 영향력으로 보완돼요.", reality: "대중 영향력 축이 약합니다. 카리스마·지적 영향력으로 보완됩니다.", fun: "대중 영향력 축은 약해. 대신 카리스마나 지적 영향력으로 보완돼." },
  },
  intellect: {
    S: { empathy: "생각을 바꾸게 만드는 힘이 있어요. 깊이 있는 통찰과 전달력이 결합해 사람들에게 오래 남는 영향을 줘요.", reality: "생각을 바꾸게 만드는 힘. 깊은 통찰과 전달력이 결합해 오래 남는 영향을 줍니다.", fun: "생각 바꾸게 만드는 힘이 있어. 통찰이랑 전달력이 맞아서 오래 남아." },
    A: { empathy: "강한 지적 권위가 있어요. 전문성과 표현이 함께 작동해 신뢰를 얻어요.", reality: "강한 지적 권위. 전문성과 표현이 함께 작동해 신뢰를 얻습니다.", fun: "지적 권위 강해. 전문성이랑 표현이 같이 작동해서 신뢰 얻어." },
    B: { empathy: "지적 영향력이 있으나 분야가 좁거나 선택적으로 발휘돼요.", reality: "지적 영향력이 있으며 분야가 좁거나 선택적으로 발휘됩니다.", fun: "지적 영향력 있는데 분야 좁거나 선택적으로 나와." },
    C: { empathy: "지식보다 경험과 실행으로 신뢰를 얻는 타입이에요.", reality: "경험과 실행으로 신뢰를 얻는 구조입니다.", fun: "지식보다 경험이랑 실행으로 신뢰 얻어." },
    D: { empathy: "지적 영향력이 잠재된 상태예요. 특정 주제나 분야를 파고들면 강해져요.", reality: "지적 영향력이 잠재된 상태입니다. 특정 주제·분야를 파고들면 강해집니다.", fun: "지적 영향력 잠재된 상태야. 주제나 분야 파고들면 강해져." },
    F: { empathy: "지적 영향력 축이 약해요. 대신 카리스마나 대중성으로 영향력이 형성돼요.", reality: "지적 영향력 축이 약합니다. 카리스마·대중성으로 영향력이 형성됩니다.", fun: "지적 영향력 축은 약해. 대신 카리스마나 대중성으로 영향력 생겨." },
  },
};

// STEP 7 F 레벨 보정
const F_CORRECTION: Record<Axis3Key, Record<CharismaToneKey, string>> = {
  charisma: { empathy: "권위나 존재감보다 메시지와 콘텐츠로 영향력을 만드는 구조예요.", reality: "권위나 존재감보다 메시지와 콘텐츠로 영향력을 만드는 구조입니다.", fun: "권위보다 메시지랑 콘텐츠로 영향력 만드는 타입이야." },
  public: { empathy: "넓은 확산보다 깊은 신뢰 관계로 영향력이 형성되는 타입이에요.", reality: "넓은 확산보다 깊은 신뢰 관계로 영향력이 형성되는 타입입니다.", fun: "넓이보다 깊은 신뢰 관계로 영향력 생기는 타입이야." },
  intellect: { empathy: "지식 기반보다 행동과 실행으로 사람들에게 영향을 주는 구조예요.", reality: "지식 기반보다 행동과 실행으로 사람에게 영향을 주는 구조입니다.", fun: "지식보다 행동이랑 실행으로 사람한테 영향 주는 타입이야." },
};

// STEP 7 충·극 보정 문장
const CHONG_KE_CORRECTION: Record<Axis3Key, Record<CharismaToneKey, string>> = {
  charisma: { empathy: "카리스마가 있지만 특정 시기나 환경에서 불안정하게 작동해요. 안정된 기반을 만드는 것이 핵심 과제예요.", reality: "카리스마가 있으나 특정 시기·환경에서 불안정하게 작동합니다. 안정된 기반을 만드는 것이 핵심 과제입니다.", fun: "카리스마 있는데 시기나 환경에 따라 불안정해. 기반 만드는 게 중요해." },
  public: { empathy: "영향력이 있지만 확산 과정에서 왜곡되거나 오해가 생기는 패턴이 있어요. 메시지를 명확히 하는 것이 중요해요.", reality: "영향력이 있으나 확산 과정에서 왜곡·오해가 생깁니다. 메시지를 명확히 하는 것이 중요합니다.", fun: "영향력 있는데 퍼질 때 왜곡되거나 오해 생겨. 메시지 명확히 하는 게 중요해." },
  intellect: { empathy: "지적 권위가 있지만 전달 과정에서 마찰이 생겨요. 소통 방식을 다듬으면 영향력이 확장돼요.", reality: "지적 권위가 있으나 전달 과정에서 마찰이 생깁니다. 소통 방식을 다듬으면 영향력이 확장됩니다.", fun: "지적 권위 있는데 전달할 때 마찰 생겨. 소통 방식 다듬으면 영향력 커져." },
};

/**
 * 카리스마·사회적 영향력 통변 (최종판). 3축 점수 → 레벨 → 유형 + 축별 해석 + 보정. ~600자.
 */
export function getCharismaSocialInfluenceParagraph(
  pillars: SajuPillarsForCharisma,
  tone: CharismaToneKey
): string {
  const dayStem = pillars.day?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  if (!dayStem) return "";

  const positions = collectPositions(pillars, dayStem);
  const { charisma, public: pub, intellect, charismaChongKe, publicChongKe, intellectChongKe } = computeThreeAxisScores(positions);

  const levels: Record<Axis3Key, LevelKey> = {
    charisma: scoreToLevel(charisma),
    public: scoreToLevel(pub),
    intellect: scoreToLevel(intellect),
  };
  const typeRow = getType(levels);
  const parts: string[] = [typeRow.lead[tone]];
  parts.push(AXIS_TEXTS.charisma[levels.charisma][tone]);
  parts.push(AXIS_TEXTS.public[levels.public][tone]);
  parts.push(AXIS_TEXTS.intellect[levels.intellect][tone]);

  if (levels.charisma === "F") parts.push(F_CORRECTION.charisma[tone]);
  if (levels.public === "F") parts.push(F_CORRECTION.public[tone]);
  if (levels.intellect === "F") parts.push(F_CORRECTION.intellect[tone]);
  if (charismaChongKe) parts.push(CHONG_KE_CORRECTION.charisma[tone]);
  if (publicChongKe) parts.push(CHONG_KE_CORRECTION.public[tone]);
  if (intellectChongKe) parts.push(CHONG_KE_CORRECTION.intellect[tone]);

  let out = parts.filter(Boolean).join(" ");
  if (out.length > 650) {
    out = parts.filter(Boolean).join(" ").slice(0, 600).trim();
    const last = out.lastIndexOf(".");
    if (last > 480) out = out.slice(0, last + 1);
  }
  return out.trim();
}