/**
 * 내 안에 흐르는 가장 단단한 유전자.
 * 년주=조상·가문·뿌리, 월주=부모·성장환경. 천간 십성=드러난 가문 성격, 지지 십성=가정 내부 분위기.
 * 천간충=가문 내 방향 충돌 → 자수성가·정체성 확립으로 긍정 표현.
 * 지지충=환경 불안정 → 스스로 뿌리 내리는 힘·활성화로 긍정 표현. 절대 나쁘게 말하지 않음.
 */

export type AncestorToneKey = "empathy" | "reality" | "fun";

export interface SajuPillarsForAncestor {
  year: { cheongan: { hanja: string }; jiji: { hanja: string } };
  month: { cheongan: { hanja: string }; jiji: { hanja: string } };
  day: { cheongan: { hanja: string }; jiji: { hanja: string } };
  hour: { cheongan: { hanja: string }; jiji: { hanja: string } };
}

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

// 천간충 4쌍: 甲庚 乙辛 丙壬 丁癸
const STEM_CHONG: Record<string, string> = {
  甲: "庚", 庚: "甲", 乙: "辛", 辛: "乙", 丙: "壬", 壬: "丙", 丁: "癸", 癸: "丁",
};
function isStemChong(s1: string, s2: string): boolean {
  if (!s1 || !s2) return false;
  return STEM_CHONG[s1] === s2;
}

const ZHI_CHONG: Record<string, string> = {
  子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅",
  卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳",
};
function isZhiChong(b1: string, b2: string): boolean {
  if (!b1 || !b2) return false;
  return ZHI_CHONG[b1] === b2;
}

function getPillar(pillars: SajuPillarsForAncestor, key: "year" | "month" | "day") {
  const p = pillars[key];
  const stem = p?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  const branch = p?.jiji?.hanja?.trim?.()?.[0] ?? "";
  return { stem, branch, branchStem: branch ? BRANCH_MAIN_STEM[branch] ?? "" : "" };
}

// 천간(드러난 가문 성격) 십성별 한 줄 — 긍정·활성화 톤
const STEM_TEN_MEANING: Record<string, Record<AncestorToneKey, string>> = {
  정인: {
    empathy: "가문에 학식·명예·전통이 있는 편이에요. 교육열 높은 집안이거나 대를 이어온 이름 있는 뿌리에서 자랐을 수 있어요.",
    reality: "가문에 학식·명예·전통이 있고, 정서적으로 안정된 성장 환경이 기반이 됩니다.",
    fun: "가문에 학식이랑 명예가 있는 편이야. 교육열 높은 집안이거나 대를 이어온 뿌리에서 자랐을 수 있어.",
  },
  편인: {
    empathy: "가문에 독특한 기술·학문적 색채가 있는 편이에요. 비주류적이거나 특수한 환경에서 자랐을 수 있고, 뿌리는 있되 특이한 구조예요.",
    reality: "가문에 독특한 기술·학문적 색채가 있고, 일반적이지 않은 성장 환경이 기반이 됩니다.",
    fun: "가문에 독특한 기술·학문 색이 있는 편이야. 뿌리는 있는데 특이한 구조야.",
  },
  정관: {
    empathy: "질서와 명예를 중시하는 가문이에요. 공직·체면을 중시하는 집안에서 자랐을 수 있고, 규율이 있는 환경이 뿌리가 돼요.",
    reality: "질서와 명예를 중시하는 가문이며, 규율이 강한 성장 환경이 기반이 됩니다.",
    fun: "질서랑 명예 중시하는 가문이야. 규율 있는 환경이 뿌리 돼.",
  },
  편관: {
    empathy: "강한 권위나 억압적이었을 수 있는 환경이에요. 그만큼 강인한 생명력과 저항력을 물려받은 구조로 읽혀요. 스스로 뿌리 내리기에 유리해요.",
    reality: "강한 권위·압박이 있는 환경이었을 수 있으나, 강인한 생명력과 저항력을 물려받은 구조입니다. 자수성가·활성화에 유리합니다.",
    fun: "강한 권위 있던 환경일 수 있어. 그만큼 강인한 생명력이랑 저항력 물려받은 타입이야. 스스로 뿌리 내리기 좋아.",
  },
  정재: {
    empathy: "실속 있고 성실한 가문이에요. 대대로 현실적 재산을 쌓아온 집안이거나, 안정적이고 꾸준한 환경이 뿌리가 돼요.",
    reality: "실속 있고 성실한 가문이며, 안정적이고 꾸준한 성장 환경이 기반이 됩니다.",
    fun: "실속 있고 성실한 가문이야. 안정적이고 꾸준한 환경이 뿌리야.",
  },
  편재: {
    empathy: "사업·유통·활동적인 경제활동이 있는 가문이에요. 변동이 많았을 수 있지만 그만큼 기회를 잡는 힘을 물려받은 편이에요.",
    reality: "사업·활동적 경제활동이 있는 가문이며, 변동 속에서 기회 포착력을 물려받은 구조입니다.",
    fun: "사업·활동적인 가문이야. 변동 많았을 수 있지만 기회 잡는 힘 물려받은 편이야.",
  },
  식신: {
    empathy: "풍요롭고 여유 있는 가문이에요. 먹고 사는 것에 걱정이 적었거나, 예술·음식·생활문화가 발달한 따뜻한 분위기에서 자랐을 수 있어요.",
    reality: "풍요롭고 여유 있는 가문이며, 따뜻하고 넉넉한 성장 환경이 기반이 됩니다.",
    fun: "풍요롭고 여유 있는 가문이야. 따뜻하고 넉넉한 분위기에서 자랐을 수 있어.",
  },
  상관: {
    empathy: "재능 있고 개성 강한 가문이에요. 기존 체제에 저항하는 분위기가 있었을 수 있어. 그만큼 독창적인 뿌리와 스스로 길을 만드는 힘이 있어요.",
    reality: "재능·개성이 강한 가문이며, 독창적 뿌리와 자수성가형 구조가 기반이 됩니다.",
    fun: "재능 있고 개성 강한 가문이야. 독창적인 뿌리랑 스스로 길 만드는 힘이 있어.",
  },
  비견: {
    empathy: "형제·친족이 많은 가문이에요. 독립적인 분위기, 각자도생의 환경에서 자랐을 수 있어. 그만큼 스스로 설 수 있는 힘을 물려받았어요.",
    reality: "형제·친족이 많은 가문이며, 독립적·각자도생 환경이 자립심을 키우는 기반이 됩니다.",
    fun: "형제·친족 많은 가문이야. 각자도생 환경에서 스스로 설 힘 물려받은 편이야.",
  },
  겁재: {
    empathy: "다툼·경쟁이 있었을 수 있는 가문이에요. 그만큼 강한 생존력과 스스로 뿌리 내리는 힘을 물려받은 구조로 읽혀요. 활성화·자수성가에 유리해요.",
    reality: "경쟁·분산이 있는 환경이었을 수 있으나, 강한 생존력과 자수성가형 구조를 물려받았습니다.",
    fun: "경쟁이 있던 가문일 수 있어. 그만큼 생존력이랑 스스로 뿌리 내리는 힘 물려받았어. 자수성가형이야.",
  },
};

// 지지(내부 분위기) — 짧은 보조 문장
const BRANCH_TEN_MEANING: Record<string, Record<AncestorToneKey, string>> = {
  정인: { empathy: "집 안에는 따뜻하고 보호받는 분위기가 깔려 있어요.", reality: "내부적으로 따뜻하고 보호받는 환경입니다.", fun: "집 안은 따뜻하고 보호받는 분위기야." },
  편인: { empathy: "겉은 평범해도 속은 독립적이거나 복잡한 분위기가 있어요.", reality: "내부에 독립·특수한 환경이 있습니다.", fun: "겉은 평범해도 속은 독립적이거나 복잡해." },
  정관: { empathy: "집안 내부에 규율과 질서가 있는 편이에요.", reality: "내부에 규율과 질서가 강합니다.", fun: "집안 안에는 규율이랑 질서가 있어." },
  편관: { empathy: "내부에 긴장감이 있었지만 그만큼 단련된 뿌리가 있어요.", reality: "내부에 통제·긴장이 있으나 단련된 구조입니다.", fun: "안에는 긴장감이 있었지만 단련된 뿌리가 있어." },
  정재: { empathy: "현실적이고 안정된 내부 환경이에요.", reality: "내부적으로 현실적·안정적입니다.", fun: "현실적이고 안정된 안쪽 환경이야." },
  편재: { empathy: "내부적으로 변동이 많았을 수 있어. 그만큼 적응력이 커요.", reality: "내부 변동이 있으나 적응력이 큰 구조입니다.", fun: "안쪽은 변동이 많았을 수 있어. 적응력이 커." },
  식신: { empathy: "풍요롭고 편안한 내부 분위기가 있어요.", reality: "내부에 풍요·여유가 있습니다.", fun: "풍요롭고 편안한 안쪽 분위기야." },
  상관: { empathy: "내부에 갈등이 있었을 수 있어. 그만큼 표현력과 독창성이 자랐어요.", reality: "내부 갈등이 있으나 표현력·독창성의 기반이 됩니다.", fun: "안에 갈등이 있었을 수 있어. 표현력이랑 독창성 자랐어." },
  비견: { empathy: "독립적이고 각자 역할이 분명한 환경이에요. 자립심을 키워 줘요.", reality: "독립적·경쟁적 내부 환경이 자립심을 키웁니다.", fun: "독립적이고 역할 분명한 환경이야. 자립심 키워 줘." },
  겁재: { empathy: "에너지가 분산되던 환경이었을 수 있어. 그만큼 스스로 뿌리 내리는 힘이 있어요.", reality: "분산된 에너지 환경이 스스로 뿌리 내리는 힘의 기반이 됩니다.", fun: "에너지 분산되던 환경이었을 수 있어. 스스로 뿌리 내리는 힘이 있어." },
};

// 충 있을 때 공통 긍정 마무리 (나쁘게 말하지 않음)
const CHONG_POSITIVE: Record<AncestorToneKey, { stem: string; zhi: string; full: string }> = {
  empathy: {
    stem: "조상과 부모님의 방향이 달랐을 수 있어요. 그만큼 스스로 정체성을 세우고 자수성가하기 좋은 구조예요.",
    zhi: "성장 환경이 움직임이 많았을 수 있어요. 그만큼 적응력과 스스로 뿌리 내리는 힘이 있어요.",
    full: "가문과 성장 환경이 엇갈릴 수 있어요. 스스로 뿌리를 만드는 활성화형, 자수성가형에 가까운 편이에요.",
  },
  reality: {
    stem: "조상과 부모 세대의 방향이 달랐을 수 있으나, 스스로 정체성을 세우고 자수성가하기 유리한 구조입니다.",
    zhi: "성장 환경의 변동이 있었을 수 있으나, 적응력과 스스로 뿌리 내리는 힘이 강점이 됩니다.",
    full: "가문과 성장 환경이 엇갈릴 수 있는 구조이나, 스스로 뿌리를 만드는 활성화형·자수성가형에 유리합니다.",
  },
  fun: {
    stem: "조상이랑 부모님 방향이 달랐을 수 있어. 그만큼 스스로 정체성 세우고 자수성가하기 좋은 타입이야.",
    zhi: "성장 환경이 움직임이 많았을 수 있어. 적응력이랑 스스로 뿌리 내리는 힘이 있어.",
    full: "가문이랑 성장 환경이 엇갈릴 수 있어. 스스로 뿌리 만드는 활성화형, 자수성가형에 가까워.",
  },
};

export function getAncestorParentParagraph(
  pillars: SajuPillarsForAncestor,
  _gender: "M" | "F",
  tone: AncestorToneKey
): string {
  const dayStem = pillars.day?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  if (!dayStem) return "";

  const y = getPillar(pillars, "year");
  const m = getPillar(pillars, "month");
  const d = getPillar(pillars, "day");

  const yearStemTg = tenGodFromStems(dayStem, y.stem);
  const monthStemTg = tenGodFromStems(dayStem, m.stem);
  const yearBranchTg = y.branchStem ? tenGodFromStems(dayStem, y.branchStem) : "";
  const monthBranchTg = m.branchStem ? tenGodFromStems(dayStem, m.branchStem) : "";

  const stemChong = isStemChong(y.stem, m.stem);
  const zhiChongYM = isZhiChong(y.branch, m.branch);
  const zhiChongYD = isZhiChong(y.branch, d.branch);
  const zhiChongMD = isZhiChong(m.branch, d.branch);
  const fullChong = stemChong && zhiChongYM;

  const pick = (tg: string, map: Record<string, Record<AncestorToneKey, string>>) =>
    (tg && map[tg]?.[tone]) ? map[tg][tone] : "";

  const yearStemText = pick(yearStemTg, STEM_TEN_MEANING);
  const monthStemText = pick(monthStemTg, STEM_TEN_MEANING);
  const yearBranchText = pick(yearBranchTg, BRANCH_TEN_MEANING);
  const monthBranchText = pick(monthBranchTg, BRANCH_TEN_MEANING);

  const positive = CHONG_POSITIVE[tone];
  const strongStem = ["정인", "정관"];
  const bothStrong = yearStemTg && monthStemTg && strongStem.includes(yearStemTg) && strongStem.includes(monthStemTg);
  const leadStrong: Record<AncestorToneKey, string> = {
    empathy: "가장 단단한 유전자를 물려받은 편이에요. 명예·학식·질서의 가문에서 자랐을 수 있어요. ",
    reality: "가장 단단한 유전자를 물려받은 구조입니다. 명예·학식·질서의 가문이 기반이 됩니다. ",
    fun: "가장 단단한 유전자 물려받은 타입이야. 명예·학식·질서의 가문에서 자랐을 수 있어. ",
  };

  const parts: string[] = [];

  if (fullChong) {
    parts.push(positive.full);
    if (yearStemText) parts.push(yearStemText);
    if (monthStemText) parts.push(monthStemText);
  } else {
    if (bothStrong) {
      parts.push(leadStrong[tone]);
    } else {
      if (yearStemText) parts.push(yearStemText);
      if (monthStemText) parts.push(monthStemText);
    }
    if (stemChong) parts.push(positive.stem);
    if (zhiChongYM) parts.push(positive.zhi);
    if (zhiChongYD || zhiChongMD) parts.push(positive.zhi);
  }

  const innerParts: string[] = [];
  if (yearBranchText || monthBranchText) {
    if (yearBranchText) innerParts.push(yearBranchText);
    if (monthBranchText) innerParts.push(monthBranchText);
  }

  const p1 = parts.filter(Boolean).join(" ").trim();
  const p2 = innerParts.join(" ").trim();
  const out = p2 ? [p1, p2].filter(Boolean).join("\n\n") : p1;
  if (out) return out;
  return tone === "empathy"
    ? "가문과 성장 환경이 당신에게 물려준 뿌리가 있어요. 스스로 만드는 힘이 있는 구조로 읽혀요."
    : tone === "reality"
      ? "가문과 성장 환경이 물려준 뿌리가 있으며, 스스로 만드는 힘이 있는 구조입니다."
      : "가문이랑 성장 환경이 네게 물려준 뿌리가 있어. 스스로 만드는 힘이 있는 타입이야.";
}
