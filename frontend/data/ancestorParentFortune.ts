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

// 천간(드러난 가문 성격) 십성별 — 2~3문장으로 확장, ~600자용
const STEM_TEN_MEANING: Record<string, Record<AncestorToneKey, string>> = {
  정인: {
    empathy: "가문에 학식·명예·전통이 있는 편이에요. 교육열 높은 집안이거나 대를 이어온 이름 있는 뿌리에서 자랐을 수 있고, 어머니의 영향력이 크고 정서적으로 안정된 환경이 기반이 됐을 가능성이 있어요. 그런 뿌리가 지금도 당신이 선택할 때 든든한 기준이 되어 줄 수 있어요.",
    reality: "가문에 학식·명예·전통이 있고, 정서적으로 안정된 성장 환경이 기반이 됩니다. 교육열이 높거나 대를 이어온 이름 있는 집안에서 물려받은 기반이 현재의 판단과 방향 설정에도 영향을 줍니다.",
    fun: "가문에 학식이랑 명예가 있는 편이야. 교육열 높은 집안이거나 대를 이어온 뿌리에서 자랐을 수 있고, 어머니 영향이 크고 정서적으로 안정된 환경이었을 수 있어. 그런 뿌리가 지금도 네가 선택할 때 든든한 기준이 돼 줄 수 있어.",
  },
  편인: {
    empathy: "가문에 독특한 기술·학문·종교적 색채가 있는 편이에요. 비주류적이거나 특수한 환경에서 자랐을 수 있고, 부모 중 한 명이 개성 강한 사람이었을 가능성도 있어요. 뿌리는 있되 특이한 구조라, 남다른 시각과 스스로 길을 만드는 힘을 물려받았어요.",
    reality: "가문에 독특한 기술·학문적 색채가 있고, 일반적이지 않은 성장 환경이 기반이 됩니다. 그만큼 독창적 시각과 자수성가형 구조를 물려받은 편입니다.",
    fun: "가문에 독특한 기술·학문 색이 있는 편이야. 뿌리는 있는데 특이한 구조라, 남다른 시각이랑 스스로 길 만드는 힘 물려받았을 수 있어.",
  },
  정관: {
    empathy: "질서와 명예를 중시하는 가문이에요. 공직·체면을 중시하는 집안에서 자랐을 수 있고, 규율이 있는 환경이 뿌리가 됐어요. 가문의 이름이 사회적으로 알려진 경우도 있고, 그런 기반이 지금의 책임감과 방향성으로 이어질 수 있어요.",
    reality: "질서와 명예를 중시하는 가문이며, 규율이 강한 성장 환경이 기반이 됩니다. 공직·관료·체면을 중시하는 집안에서 물려받은 구조가 현재의 역할과 판단에 영향을 줍니다.",
    fun: "질서랑 명예 중시하는 가문이야. 규율 있는 환경이 뿌리 됐고, 그런 기반이 지금의 책임감이랑 방향성으로 이어질 수 있어.",
  },
  편관: {
    empathy: "강한 권위나 억압적이었을 수 있는 환경이에요. 군인·무인 계열이거나 엄격한 분위기의 집안에서 자랐을 수 있어요. 그만큼 강인한 생명력과 저항력을 물려받은 구조로 읽히고, 스스로 뿌리 내리기와 자수성가에 유리한 편이에요.",
    reality: "강한 권위·압박이 있는 환경이었을 수 있으나, 강인한 생명력과 저항력을 물려받은 구조입니다. 자수성가·활성화에 유리하며 스스로 기반을 만드는 힘이 있습니다.",
    fun: "강한 권위 있던 환경일 수 있어. 그만큼 강인한 생명력이랑 저항력 물려받은 타입이야. 스스로 뿌리 내리기랑 자수성가에 유리해.",
  },
  정재: {
    empathy: "실속 있고 성실한 가문이에요. 대대로 농업·상업처럼 현실적 재산을 쌓아온 집안이거나, 안정적이고 꾸준한 환경이 뿌리가 됐어요. 부모가 현실적이고 검소한 사람이었을 가능성이 있고, 그런 기반이 지금의 현실 감각과 꾸준함으로 이어질 수 있어요.",
    reality: "실속 있고 성실한 가문이며, 안정적이고 꾸준한 성장 환경이 기반이 됩니다. 대대로 현실적 재산을 쌓아온 집안에서 물려받은 구조가 현재의 경제감각과 지속성으로 작용합니다.",
    fun: "실속 있고 성실한 가문이야. 안정적이고 꾸준한 환경이 뿌리 됐고, 그런 기반이 지금의 현실 감각이랑 꾸준함으로 이어질 수 있어.",
  },
  편재: {
    empathy: "사업·유통·활동적인 경제활동이 있는 가문이에요. 변동이 많았을 수 있지만 아버지의 영향력이 크거나 돈의 흐름이 활발한 환경이었을 수 있어요. 그만큼 기회를 잡는 힘과 스스로 터를 잡는 감각을 물려받은 편이에요.",
    reality: "사업·활동적 경제활동이 있는 가문이며, 변동 속에서 기회 포착력과 자수성가형 구조를 물려받았습니다.",
    fun: "사업·활동적인 가문이야. 변동 많았을 수 있지만 기회 잡는 힘이랑 스스로 터 잡는 감각 물려받은 편이야.",
  },
  식신: {
    empathy: "풍요롭고 여유 있는 가문이에요. 먹고 사는 것에 걱정이 적었거나, 예술·음식·생활문화가 발달한 따뜻한 분위기에서 자랐을 수 있어요. 그런 환경이 지금도 여유 있는 선택과 관계 속에서 편안함을 주는 기반이 되어 줄 수 있어요.",
    reality: "풍요롭고 여유 있는 가문이며, 따뜻하고 넉넉한 성장 환경이 기반이 됩니다. 예술·음식·생활문화가 발달한 집안에서 물려받은 구조가 현재의 여유와 관계 능력으로 이어질 수 있습니다.",
    fun: "풍요롭고 여유 있는 가문이야. 따뜻하고 넉넉한 분위기에서 자랐을 수 있고, 그런 환경이 지금도 여유 있는 선택이랑 관계의 기반이 돼 줄 수 있어.",
  },
  상관: {
    empathy: "재능 있고 개성 강한 가문이에요. 기존 체제에 저항하는 분위기가 있었거나 부모가 개성 강하고 사회와 충돌이 많았을 수 있어요. 그만큼 독창적인 뿌리와 스스로 길을 만드는 힘을 물려받았고, 재능과 표현력을 펼치기에 유리한 구조예요.",
    reality: "재능·개성이 강한 가문이며, 독창적 뿌리와 자수성가형 구조가 기반이 됩니다. 기존 체제에 대한 저항적 분위기에서 물려받은 힘이 현재의 독창성과 표현력으로 작용합니다.",
    fun: "재능 있고 개성 강한 가문이야. 독창적인 뿌리랑 스스로 길 만드는 힘 물려받았고, 재능이랑 표현력 펼치기 좋은 구조야.",
  },
  비견: {
    empathy: "형제·친족이 많은 가문이에요. 독립적인 분위기, 각자도생의 환경에서 자랐을 수 있고 부모보다 형제나 또래의 영향이 컸을 수 있어요. 그만큼 스스로 설 수 있는 힘과 경쟁 속에서도 버티는 자립심을 물려받았어요.",
    reality: "형제·친족이 많은 가문이며, 독립적·각자도생 환경이 자립심을 키우는 기반이 됩니다. 경쟁 속에서 자란 구조가 현재의 독립성과 추진력으로 이어집니다.",
    fun: "형제·친족 많은 가문이야. 각자도생 환경에서 스스로 설 힘 물려받았고, 경쟁 속에서도 버티는 자립심이 있어.",
  },
  겁재: {
    empathy: "다툼·경쟁·분산이 있었을 수 있는 가문이에요. 재산이나 관계가 흩어지는 패턴이 있었을 수 있지만, 그만큼 강한 생존력과 스스로 뿌리 내리는 힘을 물려받은 구조로 읽혀요. 활성화·자수성가에 유리하고, 스스로 기반을 만드는 타입에 가까워요.",
    reality: "경쟁·분산이 있는 환경이었을 수 있으나, 강한 생존력과 자수성가형 구조를 물려받았습니다. 스스로 뿌리를 만드는 활성화형에 유리합니다.",
    fun: "경쟁이 있던 가문일 수 있어. 그만큼 생존력이랑 스스로 뿌리 내리는 힘 물려받았어. 자수성가형이랑 활성화형에 가까워.",
  },
};

// 지지(내부 분위기) — 2문장으로 확장
const BRANCH_TEN_MEANING: Record<string, Record<AncestorToneKey, string>> = {
  정인: { empathy: "집 안에는 따뜻하고 보호받는 분위기가 깔려 있어요. 감정적 안정감이 뿌리에 있어서, 지금도 관계나 결정할 때 그 기반이 도움이 될 수 있어요.", reality: "내부적으로 따뜻하고 보호받는 환경이며, 감정적 안정감이 뿌리에 있어 현재의 관계와 판단에도 기반이 됩니다.", fun: "집 안은 따뜻하고 보호받는 분위기야. 감정적 안정감이 뿌리에 있어서 지금도 관계나 결정할 때 도움이 돼." },
  편인: { empathy: "겉은 평범해도 속은 독립적이거나 복잡한 분위기가 있어요. 그만큼 남들과 다른 시각과 스스로 정리하는 힘을 키울 수 있는 환경이었을 수 있어요.", reality: "내부에 독립·특수한 환경이 있으며, 독특한 시각과 자립적 판단력의 기반이 됩니다.", fun: "겉은 평범해도 속은 독립적이거나 복잡해. 그만큼 다른 시각이랑 스스로 정리하는 힘 키우기 좋은 환경이었을 수 있어." },
  정관: { empathy: "집안 내부에 규율과 질서가 있는 편이에요. 엄격한 분위기였을 수 있지만, 그만큼 책임감과 약속을 지키는 습관이 뿌리 내렸을 수 있어요.", reality: "내부에 규율과 질서가 강하며, 책임감과 신뢰를 중시하는 태도의 기반이 됩니다.", fun: "집안 안에는 규율이랑 질서가 있어. 그만큼 책임감이랑 약속 지키는 습관이 뿌리 내렸을 수 있어." },
  편관: { empathy: "내부에 긴장감이 있었지만 그만큼 단련된 뿌리가 있어요. 압박 속에서도 버티는 힘과 위기 대처 능력이 자랐을 수 있어요.", reality: "내부에 통제·긴장이 있으나 단련된 구조이며, 위기 대처력과 인내의 기반이 됩니다.", fun: "안에는 긴장감이 있었지만 단련된 뿌리가 있어. 압박 속에서도 버티는 힘이 자랐을 수 있어." },
  정재: { empathy: "현실적이고 안정된 내부 환경이에요. 물질적 기반이 있어서, 지금도 현실 감각과 꾸준히 쌓는 습관으로 이어질 수 있어요.", reality: "내부적으로 현실적·안정적이며, 물질적 기반이 현재의 경제감각과 지속성으로 작용합니다.", fun: "현실적이고 안정된 안쪽 환경이야. 그만큼 현실 감각이랑 꾸준히 쌓는 습관으로 이어질 수 있어." },
  편재: { empathy: "내부적으로 변동이 많았을 수 있어요. 그만큼 적응력이 크고, 상황이 바뀌어도 빠르게 터를 잡는 힘이 있어요.", reality: "내부 변동이 있으나 적응력이 큰 구조이며, 변화 속에서도 기회를 잡는 힘의 기반이 됩니다.", fun: "안쪽은 변동이 많았을 수 있어. 적응력이 크고 상황 바뀌어도 터 잡는 힘이 있어." },
  식신: { empathy: "풍요롭고 편안한 내부 분위기가 있어요. 여유와 따뜻함이 깔려 있어서, 관계나 표현할 때 편안함을 주는 쪽으로 자랐을 수 있어요.", reality: "내부에 풍요·여유가 있으며, 관계와 표현에서 편안함을 주는 능력의 기반이 됩니다.", fun: "풍요롭고 편안한 안쪽 분위기야. 여유랑 따뜻함이 있어서 관계나 표현할 때 편한 쪽으로 자랐을 수 있어." },
  상관: { empathy: "내부에 갈등이 있었을 수 있어요. 그만큼 표현력과 독창성이 자랐고, 감정을 다루는 법을 스스로 터득한 편이에요.", reality: "내부 갈등이 있으나 표현력·독창성의 기반이 되며, 감정을 다루는 능력으로 이어질 수 있습니다.", fun: "안에 갈등이 있었을 수 있어. 그만큼 표현력이랑 독창성 자랐고 감정 다루는 법 터득한 편이야." },
  비견: { empathy: "독립적이고 각자 역할이 분명한 환경이에요. 경쟁적이었을 수 있지만 자립심을 키워 주고, 스스로 설 수 있는 힘이 뿌리 내렸어요.", reality: "독립적·경쟁적 내부 환경이 자립심을 키우며, 스스로 설 수 있는 힘의 기반이 됩니다.", fun: "독립적이고 역할 분명한 환경이야. 자립심 키워 주고 스스로 설 힘이 뿌리 내렸어." },
  겁재: { empathy: "에너지가 분산되던 환경이었을 수 있어요. 그만큼 스스로 뿌리 내리는 힘이 있고, 누구에게 기대기보다 자기 기반을 만드는 타입에 가까워요.", reality: "분산된 에너지 환경이 스스로 뿌리 내리는 힘의 기반이 되며, 자수성가형 구조로 이어질 수 있습니다.", fun: "에너지 분산되던 환경이었을 수 있어. 그만큼 스스로 뿌리 내리는 힘이 있고 자기 기반 만드는 타입이야." },
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

// 공통 마무리 — 약 600자 맞추기용
const CLOSING_BLOCK: Record<AncestorToneKey, string> = {
  empathy: "이런 가문과 성장 환경이 물려준 것은 단순한 유산이 아니라, 앞으로 스스로 설 때 든든한 기반이 되어 줄 수 있는 힘이에요.",
  reality: "이러한 가문과 성장 환경이 물려준 기반은 단순한 유산이 아니라, 앞으로 스스로 설 때 든든한 힘으로 작용할 수 있는 구조입니다.",
  fun: "이런 가문이랑 성장 환경이 물려준 거 단순한 유산만은 아니야. 앞으로 스스로 설 때 든든한 기반이 돼 줄 수 있는 힘이 있어.",
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
  let out = p2 ? [p1, p2].filter(Boolean).join("\n\n") : p1;
  if (out) {
    out = out + "\n\n" + CLOSING_BLOCK[tone];
    return out;
  }
  return tone === "empathy"
    ? "가문과 성장 환경이 당신에게 물려준 뿌리가 있어요. 스스로 만드는 힘이 있는 구조로 읽혀요."
    : tone === "reality"
      ? "가문과 성장 환경이 물려준 뿌리가 있으며, 스스로 만드는 힘이 있는 구조입니다."
      : "가문이랑 성장 환경이 네게 물려준 뿌리가 있어. 스스로 만드는 힘이 있는 타입이야.";
}
