/**
 * 내 안에 흐르는 가장 단단한 유전자 — 조상운(년주)·부모운(월주)·육친(어머니=인성, 아버지=재성/관성) 기준.
 * 기준: 사주이론(기본사주 구성), 오행 육친 십신, 지지 합·천간충.
 * 년주: 충·형·파 없음, 년간 년지 생조 → 조상덕 있음 / 극·충 많음 → 조상덕 약.
 * 월주: 충 없음, 월간 월지 생조 → 부모운 좋음 / 일주·년주와 충 → 부모운 약.
 * 어머니=인성(편인+정인), 아버지=남자 재성/여자 관성. ~600자.
 */

export type AncestorToneKey = "empathy" | "reality" | "fun";

export interface SajuPillarsForAncestor {
  year: { cheongan: { hanja: string }; jiji: { hanja: string } };
  month: { cheongan: { hanja: string }; jiji: { hanja: string } };
  day: { cheongan: { hanja: string }; jiji: { hanja: string } };
  hour: { cheongan: { hanja: string }; jiji: { hanja: string } };
}

const STEM_ELEMENT: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
  庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

const BRANCH_ELEMENT: Record<string, string> = {
  寅: "木", 卯: "木", 巳: "火", 午: "火", 辰: "土", 戌: "土", 丑: "土", 未: "土",
  申: "金", 酉: "金", 亥: "水", 子: "水",
};

// 지지 육충 (六冲): 子午 丑未 寅申 卯酉 辰戌 巳亥
const ZHI_CHONG: Record<string, string> = {
  子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅",
  卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳",
};

function elementOfStem(s: string): string {
  return STEM_ELEMENT[s] ?? "";
}
function elementOfBranch(b: string): string {
  return BRANCH_ELEMENT[b] ?? "";
}

// 오행 生: 木生火 火生土 土生金 金生水 水生木
function produces(el: string, other: string): boolean {
  const order: Record<string, string> = {
    木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
  };
  return order[el] === other;
}
// 오행 克
function controls(el: string, other: string): boolean {
  const order: Record<string, string> = {
    木: "土", 土: "水", 水: "火", 火: "金", 金: "木",
  };
  return order[el] === other;
}

/** 년간-년지: 生 or 比(同氣) = 안정, 克 = 깨짐 */
function stemBranchStable(stem: string, branch: string): boolean {
  const es = elementOfStem(stem);
  const eb = elementOfBranch(branch);
  if (!es || !eb) return true;
  if (es === eb) return true;
  if (produces(es, eb) || produces(eb, es)) return true;
  if (controls(es, eb) || controls(eb, es)) return false;
  return true;
}

/** 지지 冲 여부 */
function isChong(b1: string, b2: string): boolean {
  return (ZHI_CHONG[b1] === b2) || (ZHI_CHONG[b2] === b1);
}

function getPillar(pillars: SajuPillarsForAncestor, key: "year" | "month" | "day" | "hour") {
  const p = pillars[key];
  const stem = p?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  const branch = p?.jiji?.hanja?.trim?.()?.[0] ?? "";
  return { stem, branch };
}

/** 인성(편인+정인) 개수, 재성(편재+정재), 관성(편관+정관) — 일간 기준 십신 */
const BRANCH_MAIN_STEM: Record<string, string> = {
  子: "癸", 丑: "己", 寅: "甲", 卯: "乙", 辰: "戊", 巳: "丙",
  午: "丁", 未: "己", 申: "庚", 酉: "辛", 戌: "戊", 亥: "壬",
};

type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";
const STEM_META: Record<string, { el: Element; pol: Polarity }> = {
  甲: { el: "wood", pol: "yang" }, 乙: { el: "wood", pol: "yin" },
  丙: { el: "fire", pol: "yang" }, 丁: { el: "fire", pol: "yin" },
  戊: { el: "earth", pol: "yang" }, 己: { el: "earth", pol: "yin" },
  庚: { el: "metal", pol: "yang" }, 辛: { el: "metal", pol: "yin" },
  壬: { el: "water", pol: "yang" }, 癸: { el: "water", pol: "yin" },
};
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

function countTenGodsForParent(pillars: SajuPillarsForAncestor): Record<string, number> {
  const dayStem = pillars.day?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  if (!dayStem) return {};
  const count: Record<string, number> = {
    비견: 0, 겁재: 0, 식신: 0, 상관: 0, 편재: 0, 정재: 0, 편관: 0, 정관: 0, 편인: 0, 정인: 0,
  };
  for (const key of ["year", "month", "day", "hour"] as const) {
    const p = pillars[key];
    if (!p) continue;
    const stem = p.cheongan?.hanja?.trim?.()?.[0] ?? "";
    const branch = p.jiji?.hanja?.trim?.()?.[0] ?? "";
    if (stem) {
      const tg = tenGodFromStems(dayStem, stem);
      if (tg && count[tg] !== undefined) count[tg]++;
    }
    if (branch && BRANCH_MAIN_STEM[branch]) {
      const tg = tenGodFromStems(dayStem, BRANCH_MAIN_STEM[branch]);
      if (tg && count[tg] !== undefined) count[tg]++;
    }
  }
  return count;
}

export function getAncestorParentParagraph(
  pillars: SajuPillarsForAncestor,
  gender: "M" | "F",
  tone: AncestorToneKey
): string {
  const y = getPillar(pillars, "year");
  const m = getPillar(pillars, "month");
  const d = getPillar(pillars, "day");

  const yearStable = stemBranchStable(y.stem, y.branch);
  const monthStable = stemBranchStable(m.stem, m.branch);
  const yearChongDay = isChong(y.branch, d.branch);
  const yearChongMonth = isChong(y.branch, m.branch);
  const monthChongDay = isChong(m.branch, d.branch);
  const monthChongYear = isChong(m.branch, y.branch);

  const yearBroken = !yearStable || yearChongDay || yearChongMonth;
  const monthBroken = !monthStable || monthChongDay || monthChongYear;

  const tenCount = countTenGodsForParent(pillars);
  const inCount = (tenCount["편인"] ?? 0) + (tenCount["정인"] ?? 0);
  const jaeCount = (tenCount["편재"] ?? 0) + (tenCount["정재"] ?? 0);
  const gwanCount = (tenCount["편관"] ?? 0) + (tenCount["정관"] ?? 0);
  const fatherStrong = gender === "M" ? jaeCount >= 2 : gwanCount >= 2;
  const motherStrong = inCount >= 2;

  const templates = {
    empathy: {
      yearGood:
        "연주(년주)가 비교적 안정적인 편이라 가문 기반이 잡혀 있고, 집안에서 받는 도움이 있는 구조로 읽혀요. 조상·선대의 기운이 기반이 되어 주는 편이에요.",
      yearBad:
        "연주가 흔들리기 쉬운 편이라 가문 기반이 약하거나 집안 이동·변화가 많았을 수 있어요. 그만큼 스스로 기반을 다지는 쪽으로 나아가면 좋고, 타지에서 새로 터를 잡는 가능성도 있어요.",
      monthGood:
        "월주가 안정적이어서 부모님의 도움이 있고 성장 환경이 비교적 잔잔했을 가능성이 높아요. 부모운이 있는 편이라 성장기 기반이 받쳐 주는 구조예요.",
      monthBad:
        "월주가 일주나 연주와 충이 있거나 기운이 맞지 않아, 부모와의 갈등이나 성장기 변화가 있었을 수 있어요. 그만큼 독립성이 강한 쪽으로 읽히고, 스스로 길을 만드는 힘이 있어요.",
      motherStrong: "어머니와의 인연·보호의 기운이 사주에 잘 드러나요. 인성(어머니를 상징하는 기운)이 있어 어머니 영향이 분명한 편이에요.",
      motherWeak: "어머니와의 인연은 깊이보다는 스스로 세워가는 쪽에 가까워요. 인성이 적어도 관계를 의식해서 쌓아 가면 좋아요.",
      fatherStrong: "아버지의 영향이나 역할이 사주에 뚜렷하게 보여요. 재성·관성(아버지를 상징하는 기운)이 있어 아버지와의 연결이 분명한 편이에요.",
      fatherWeak: "아버지와의 인연은 부담 없이 나만의 관계로 이어가는 편이에요. 재성·관성이 적어도 소통을 통해 관계를 다져 갈 수 있어요.",
    },
    reality: {
      yearGood:
        "년주가 안정적이어서 가문 기반이 견고하고 집안의 도움을 받는 구조입니다. 조상·선대의 기운이 기반이 됩니다.",
      yearBad:
        "년주에 충·극이 있어 가문 기반이 약하거나 집안 이동·변화가 많을 수 있습니다. 자립적 기반 형성과 타지 기반 형성이 유리합니다.",
      monthGood:
        "월주가 안정적이어서 부모운이 좋고 성장환경이 안정적인 편입니다. 부모의 도움이 성장기 기반이 됩니다.",
      monthBad:
        "월주가 일주·년주와 충하거나 극 관계에 있어 부모운이 약하거나 성장기 변화가 있을 수 있습니다. 독립성 강한 성장 구조이며 스스로 기반을 만드는 데 유리합니다.",
      motherStrong: "인성(어머니)이 강하여 어머니 영향이 뚜렷합니다.",
      motherWeak: "인성이 약하여 어머니 인연은 보완적이며, 관계를 의식해서 쌓아 가면 좋습니다.",
      fatherStrong: "재성/관성(아버지)이 강하여 아버지 영향이 뚜렷합니다.",
      fatherWeak: "재성/관성이 약하여 아버지 인연은 보완적이며, 소통으로 관계를 다질 수 있습니다.",
    },
    fun: {
      yearGood:
        "연주가 안정 쪽이라 가문 기반이 있어서 집안 도움 받는 구조야. 조상·선대 기운이 기반이 돼 주는 편이야.",
      yearBad:
        "연주가 깨지기 쉬운 편이라 가문이 약하거나 이사·변화가 많았을 수 있어. 그만큼 네가 기반 만드는 쪽으로 가면 좋고, 타지에서 터 잡는 가능성도 있어.",
      monthGood:
        "월주가 안정적이라 부모님 도움 있고 성장환경이 잔잔한 편이야. 부모운 있는 타입이라 성장기 기반이 받쳐 줘.",
      monthBad:
        "월주가 일주·연주랑 충 있거나 안 맞아서 부모님이랑 갈등이나 성장기 변화 있었을 수 있어. 그만큼 독립성 강한 타입이고, 스스로 길 만드는 힘이 있어.",
      motherStrong: "어머니 인연·보호 기운이 사주에 잘 나와. 인성(어머니 기운)이 있어서 어머니 영향이 분명한 편이야.",
      motherWeak: "어머니 인연은 스스로 세워가는 쪽에 가까워. 인성 적어도 관계 쌓아 가면 좋아.",
      fatherStrong: "아버지 영향이 사주에 뚜렷하게 보여. 재성·관성(아버지 기운)이 있어서 아버지랑 연결이 분명해.",
      fatherWeak: "아버지 인연은 부담 없이 나만의 관계로 가는 편이야. 재성·관성 적어도 소통으로 다져 가면 돼.",
    },
  };

  const t = templates[tone];
  const p1 = (yearBroken ? t.yearBad : t.yearGood) + " " + (monthBroken ? t.monthBad : t.monthGood);
  const p2 = (motherStrong ? t.motherStrong : t.motherWeak) + " " + (fatherStrong ? t.fatherStrong : t.fatherWeak);
  return (p1 + "\n\n" + p2).trim();
}
