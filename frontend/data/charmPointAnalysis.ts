/**
 * 사람들이 빠지는 나의 매력 포인트.
 * 육친 개수(식상/재성/관성/인성) + 도화·합 유무 → 축별 텍스트 블록 + 핵심 문장. 600자 내외, 긍정 발견형.
 */

export type CharmToneKey = "empathy" | "reality" | "fun";

export interface SajuPillarsForCharm {
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

type PillarKey = "year" | "month" | "day" | "hour";
function getPillar(pillars: SajuPillarsForCharm, key: PillarKey) {
  const p = pillars[key];
  const stem = p?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  const branch = p?.jiji?.hanja?.trim?.()?.[0] ?? "";
  return { stem, branch };
}

function countTenGods(pillars: SajuPillarsForCharm): Record<string, number> {
  const dayStem = pillars.day?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  if (!dayStem) return {};
  const count: Record<string, number> = {
    비견: 0, 겁재: 0, 식신: 0, 상관: 0, 편재: 0, 정재: 0, 편관: 0, 정관: 0, 편인: 0, 정인: 0,
  };
  for (const key of ["year", "month", "day", "hour"] as PillarKey[]) {
    const { stem, branch } = getPillar(pillars, key);
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

// 도화: 寅午戌→卯 申子辰→酉 亥卯未→子 巳酉丑→午. 桃花 지지 = 해당 글자; 透干 = 本气(卯乙 酉辛 子癸 午丁)
const DOHWA_BRANCH: Record<string, string> = { "寅": "卯", "午": "卯", "戌": "卯", "申": "酉", "子": "酉", "辰": "酉", "亥": "子", "卯": "子", "未": "子", "巳": "午", "酉": "午", "丑": "午" };
const DOHWA_STEM: Record<string, string> = { "卯": "乙", "酉": "辛", "子": "癸", "午": "丁" };

function hasDohwaStem(pillars: SajuPillarsForCharm, dayBranch: string): boolean {
  const dwBranch = DOHWA_BRANCH[dayBranch];
  if (!dwBranch) return false;
  const stemChar = DOHWA_STEM[dwBranch];
  if (!stemChar) return false;
  for (const key of ["year", "month", "day", "hour"] as PillarKey[]) {
    if (getPillar(pillars, key).stem === stemChar) return true;
  }
  return false;
}
function hasDohwaBranch(pillars: SajuPillarsForCharm, dayBranch: string): boolean {
  const dwBranch = DOHWA_BRANCH[dayBranch];
  if (!dwBranch) return false;
  for (const key of ["year", "month", "day", "hour"] as PillarKey[]) {
    if (getPillar(pillars, key).branch === dwBranch) return true;
  }
  return false;
}

const STEM_HE: Record<string, string> = { "甲": "己", "己": "甲", "乙": "庚", "庚": "乙", "丙": "辛", "辛": "丙", "丁": "壬", "壬": "丁", "戊": "癸", "癸": "戊" };
const ZHI_HE: Record<string, string> = { "子": "丑", "丑": "子", "寅": "亥", "亥": "寅", "卯": "戌", "戌": "卯", "辰": "酉", "酉": "辰", "巳": "申", "申": "巳", "午": "未", "未": "午" };
function hasStemHe(pillars: SajuPillarsForCharm): boolean {
  const stems: string[] = [];
  for (const key of ["year", "month", "day", "hour"] as PillarKey[]) {
    const s = getPillar(pillars, key).stem;
    if (s) stems.push(s);
  }
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      if (STEM_HE[stems[i]] === stems[j]) return true;
    }
  }
  return false;
}
function hasZhiHe(pillars: SajuPillarsForCharm): boolean {
  const branches: string[] = [];
  for (const key of ["year", "month", "day", "hour"] as PillarKey[]) {
    const b = getPillar(pillars, key).branch;
    if (b) branches.push(b);
  }
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (ZHI_HE[branches[i]] === branches[j]) return true;
    }
  }
  return false;
}

function pickLevel(n: number): "0" | "1" | "2_3" | "4" {
  if (n >= 4) return "4";
  if (n >= 2) return "2_3";
  if (n >= 1) return "1";
  return "0";
}

// 식상 (표현 매력)
const SIK_SANG: Record<string, string> = {
  "식신_1": "가까워질수록 편안함이 느껴지는 매력이 있습니다. 처음엔 조용해 보여도 함께하는 시간이 길어질수록 자연스럽게 마음이 열리는 타입입니다.",
  "식신_2_3": "말과 분위기로 사람들을 편안하게 만드는 힐링 매력이 있습니다. 같이 있으면 긴장이 풀리고 마음이 편해지는 느낌을 주어 사람들이 자연스럽게 곁에 머물게 됩니다.",
  "식신_4": "누구와 있어도 편안한 분위기를 만드는 능력이 탁월합니다. 이 매력이 강점이 되어 사람들이 먼저 다가오지만, 때로는 모든 사람을 다 받아주다 지칠 수 있습니다.",
  "상관_1": "독특한 개성이 가끔 드러나는 매력이 있습니다. 예상치 못한 순간에 강렬한 인상을 남기는 타입입니다.",
  "상관_2_3": "강렬한 개성과 표현력이 매력입니다. 말이 재밌고 존재감이 강해서 한 번 만나면 기억에 남는 사람입니다. 사람들은 당신의 독특한 캐릭터에 빠져듭니다.",
  "상관_4": "존재 자체가 강렬한 인상을 남깁니다. 어디서든 눈에 띄고 기억에 남지만, 강한 개성이 때로는 호불호를 만들기도 합니다. 하지만 한번 빠진 사람은 깊이 빠집니다.",
  "식상_혼재_2_3": "편안함과 강렬함을 동시에 가진 드문 매력입니다. 처음엔 편안하게 다가오다가 알수록 강렬한 인상을 남깁니다.",
  "식상_0": "표현으로 드러나는 매력보다 존재감과 분위기로 사람들에게 끌림을 주는 타입입니다.",
};

// 재성 (끌림 매력)
const JAE_SEONG: Record<string, string> = {
  "편재_1": "자연스럽게 사람들과 어울리는 능력이 있습니다. 편하게 다가오게 만드는 친근함이 조금씩 드러납니다.",
  "편재_2_3": "누구와도 자연스럽게 친해지는 사교적 매력이 있습니다. 사람들이 먼저 다가오고 함께하고 싶어하는 인싸형 에너지를 가지고 있습니다.",
  "편재_4": "폭넓은 인간관계를 자연스럽게 만드는 사교력이 강점입니다. 사람들이 끊임없이 모여들지만, 관계가 너무 많아지면 깊이보다 넓이로 흐를 수 있습니다.",
  "정재_1": "신뢰감이 조금씩 쌓이는 타입입니다. 시간이 지날수록 믿음직하다는 인상을 주는 매력이 있습니다.",
  "정재_2_3": "단정하고 믿음직한 매력이 있습니다. 처음 만날 때부터 신뢰감을 주어 사람들이 자연스럽게 의지하고 싶어집니다.",
  "정재_4": "어디서든 신뢰받는 존재로 인식됩니다. 이 안정감이 강력한 매력이 되지만 때로는 너무 단단해 보여서 먼저 다가가기 어렵게 느껴질 수 있습니다.",
  "재성_0": "적극적으로 끌어당기기보다 자신의 색깔로 자연스럽게 관계가 형성되는 타입입니다.",
};

// 관성 (아우라 매력)
const GWAN_SEONG: Record<string, string> = {
  "정관_1": "품격이 은은하게 느껴지는 매력이 있습니다. 알아보는 사람만 아는 타입입니다.",
  "정관_2_3": "말과 행동에서 품위와 신뢰감이 자연스럽게 풍깁니다. 사람들이 당신 앞에서 자연스럽게 예의를 갖추고 존중하게 됩니다.",
  "정관_4": "존재 자체에서 품격과 신뢰감이 강하게 느껴집니다. 이 아우라가 강점이 되지만 때로는 쉽게 다가가기 어렵다는 인상을 줄 수 있습니다.",
  "편관_1": "특정 순간에 드러나는 카리스마가 강렬합니다. 그 순간이 사람들의 기억에 오래 남습니다.",
  "편관_2_3": "강렬한 카리스마가 있습니다. 존재 자체로 긴장감과 설렘을 동시에 주는 치명적 매력으로 사람들이 함부로 대하지 못합니다.",
  "편관_4": "압도적인 존재감이 공간을 장악합니다. 이 카리스마는 강력한 매력이지만 가까이하고 싶으면서도 긴장되는 양면을 만들어냅니다.",
  "관성_0": "권위적 아우라보다 자연스러운 친근함으로 사람들에게 다가가는 매력이 있습니다.",
};

// 인성 (신비 매력)
const IN_SEONG: Record<string, string> = {
  "정인_1": "가까워지면 따뜻함이 느껴지는 매력이 있습니다. 시간이 지날수록 의지하고 싶어지는 타입입니다.",
  "정인_2_3": "포용적이고 따뜻한 매력이 있습니다. 사람들이 당신 앞에서 자연스럽게 마음을 열고 기대고 싶어합니다.",
  "정인_4": "모든 사람을 품어주는 깊은 따뜻함이 있습니다. 이 매력이 사람들을 끌어모으지만 너무 많은 사람이 의지하려 해서 지칠 수 있습니다.",
  "편인_1": "가끔 드러나는 신비로운 면이 사람들의 호기심을 자극합니다.",
  "편인_2_3": "묘한 신비로움이 있습니다. 무언가 더 있을 것 같은 느낌이 사람들의 호기심을 자극하고 만나고 나서도 계속 생각나게 만드는 여운형 매력입니다.",
  "편인_4": "쉽게 다 보이지 않는 깊이가 있습니다. 알면 알수록 더 궁금해지는 구조라 사람들이 계속 다가오게 됩니다. 다만 때로는 거리감으로 느껴질 수 있습니다.",
  "인성_0": "신비감보다 직접적이고 솔직한 매력으로 사람들에게 어필하는 타입입니다.",
};

// 도화·합
const DOHWA_HAP: Record<string, string> = {
  "도화_천간": "외적 끌림이 강합니다. 처음 봤을 때부터 눈길을 끄는 매력이 있고 이성에게 특히 강하게 작용합니다.",
  "도화_지지": "가까이서 보면 더 매력적인 타입입니다. 알수록 빠져드는 외적 끌림이 있습니다.",
  "천간합": "사람을 자연스럽게 끌어당기는 흡입력이 있습니다. 상대방이 나도 모르게 당신에게 묶이는 느낌을 받습니다.",
  "지지합": "한번 관계가 형성되면 상대가 쉽게 떠나지 못하는 흡입력이 있습니다.",
  "도화합_없음": "외적 끌림보다 내면의 매력으로 사람들의 마음을 움직이는 타입입니다.",
};

// 핵심 문장 (최다 십성/도화/합 기준)
const CORE_SENTENCE: Record<string, string> = {
  "식신": "당신은 사람들을 편안하게 만드는 힐링 매력을 가지고 있습니다.",
  "상관": "당신은 한 번 보면 잊을 수 없는 강렬한 개성의 매력을 가지고 있습니다.",
  "편재": "당신은 누구와도 자연스럽게 친해지는 사교적 매력을 가지고 있습니다.",
  "정재": "당신은 알면 알수록 믿음이 가는 신뢰형 매력을 가지고 있습니다.",
  "정관": "당신은 말하지 않아도 품격이 느껴지는 아우라를 가지고 있습니다.",
  "편관": "당신은 가까이하고 싶지만 쉽게 다가가기 어려운 치명적 카리스마를 가지고 있습니다.",
  "정인": "당신은 사람들이 자연스럽게 마음을 열게 만드는 따뜻한 매력을 가지고 있습니다.",
  "편인": "당신은 만나고 나서도 계속 생각나게 만드는 신비로운 매력을 가지고 있습니다.",
  "도화": "당신은 처음 봤을 때부터 눈길을 끄는 외적 끌림을 가지고 있습니다.",
  "합": "당신은 상대방이 나도 모르게 빠져들게 만드는 흡입력을 가지고 있습니다.",
  "전체약": "당신의 매력은 겉으로 드러나기보다 가까워질수록 발견되는 깊은 끌림입니다.",
};

function pickSikSang(count: Record<string, number>): string {
  const si = count["식신"] ?? 0;
  const sang = count["상관"] ?? 0;
  const total = si + sang;
  if (total === 0) return SIK_SANG["식상_0"];
  if (si >= 1 && sang >= 1 && total >= 2 && total <= 3) return SIK_SANG["식상_혼재_2_3"];
  if (si >= 4) return SIK_SANG["식신_4"];
  if (sang >= 4) return SIK_SANG["상관_4"];
  if (si >= 2 && si <= 3) return SIK_SANG["식신_2_3"];
  if (sang >= 2 && sang <= 3) return SIK_SANG["상관_2_3"];
  if (si === 1) return SIK_SANG["식신_1"];
  if (sang === 1) return SIK_SANG["상관_1"];
  return SIK_SANG["식상_0"];
}

function pickJaeSeong(count: Record<string, number>): string {
  const pj = count["편재"] ?? 0;
  const jj = count["정재"] ?? 0;
  const total = pj + jj;
  if (total === 0) return JAE_SEONG["재성_0"];
  if (pj >= 4) return JAE_SEONG["편재_4"];
  if (jj >= 4) return JAE_SEONG["정재_4"];
  if (pj >= 2 && pj <= 3) return JAE_SEONG["편재_2_3"];
  if (jj >= 2 && jj <= 3) return JAE_SEONG["정재_2_3"];
  if (pj === 1) return JAE_SEONG["편재_1"];
  if (jj === 1) return JAE_SEONG["정재_1"];
  return JAE_SEONG["재성_0"];
}

function pickGwanSeong(count: Record<string, number>): string {
  const jg = count["정관"] ?? 0;
  const pg = count["편관"] ?? 0;
  const total = jg + pg;
  if (total === 0) return GWAN_SEONG["관성_0"];
  if (jg >= 4) return GWAN_SEONG["정관_4"];
  if (pg >= 4) return GWAN_SEONG["편관_4"];
  if (jg >= 2 && jg <= 3) return GWAN_SEONG["정관_2_3"];
  if (pg >= 2 && pg <= 3) return GWAN_SEONG["편관_2_3"];
  if (jg === 1) return GWAN_SEONG["정관_1"];
  if (pg === 1) return GWAN_SEONG["편관_1"];
  return GWAN_SEONG["관성_0"];
}

function pickInSeong(count: Record<string, number>): string {
  const ji = count["정인"] ?? 0;
  const pi = count["편인"] ?? 0;
  const total = ji + pi;
  if (total === 0) return IN_SEONG["인성_0"];
  if (ji >= 4) return IN_SEONG["정인_4"];
  if (pi >= 4) return IN_SEONG["편인_4"];
  if (ji >= 2 && ji <= 3) return IN_SEONG["정인_2_3"];
  if (pi >= 2 && pi <= 3) return IN_SEONG["편인_2_3"];
  if (ji === 1) return IN_SEONG["정인_1"];
  if (pi === 1) return IN_SEONG["편인_1"];
  return IN_SEONG["인성_0"];
}

function pickDohwaHap(
  pillars: SajuPillarsForCharm,
  dayBranch: string
): string {
  const dohwaS = hasDohwaStem(pillars, dayBranch);
  const dohwaZ = hasDohwaBranch(pillars, dayBranch);
  const stemHe = hasStemHe(pillars);
  const zhiHe = hasZhiHe(pillars);
  if (dohwaS) return DOHWA_HAP["도화_천간"];
  if (dohwaZ) return DOHWA_HAP["도화_지지"];
  if (stemHe) return DOHWA_HAP["천간합"];
  if (zhiHe) return DOHWA_HAP["지지합"];
  return DOHWA_HAP["도화합_없음"];
}

function pickCoreSentence(
  count: Record<string, number>,
  pillars: SajuPillarsForCharm,
  dayBranch: string
): string {
  const dohwaS = hasDohwaStem(pillars, dayBranch);
  const dohwaZ = hasDohwaBranch(pillars, dayBranch);
  const stemHe = hasStemHe(pillars);
  const zhiHe = hasZhiHe(pillars);
  const order: Array<{ key: string; n: number }> = [
    { key: "식신", n: count["식신"] ?? 0 },
    { key: "상관", n: count["상관"] ?? 0 },
    { key: "편재", n: count["편재"] ?? 0 },
    { key: "정재", n: count["정재"] ?? 0 },
    { key: "정관", n: count["정관"] ?? 0 },
    { key: "편관", n: count["편관"] ?? 0 },
    { key: "정인", n: count["정인"] ?? 0 },
    { key: "편인", n: count["편인"] ?? 0 },
  ];
  order.sort((a, b) => b.n - a.n);
  const top = order[0];
  const dohwaStrong = dohwaS || dohwaZ;
  const heStrong = stemHe || zhiHe;
  if (dohwaStrong && !top?.n) return CORE_SENTENCE["도화"];
  if (heStrong && !top?.n) return CORE_SENTENCE["합"];
  if (top && top.n > 0 && CORE_SENTENCE[top.key]) return CORE_SENTENCE[top.key];
  return CORE_SENTENCE["전체약"];
}

/**
 * 사람들이 빠지는 나의 매력 포인트. 600자 내외, 2~3문단.
 */
export function getCharmPointParagraph(
  pillars: SajuPillarsForCharm,
  _tone: CharmToneKey
): string {
  const dayBranch = pillars.day?.jiji?.hanja?.trim?.()?.[0] ?? "";
  const count = countTenGods(pillars);

  const sik = pickSikSang(count);
  const jae = pickJaeSeong(count);
  const gwan = pickGwanSeong(count);
  const in_ = pickInSeong(count);
  const dohwaHap = pickDohwaHap(pillars, dayBranch);
  const core = pickCoreSentence(count, pillars, dayBranch);

  const parts: string[] = [];
  if (sik) parts.push(sik);
  if (jae) parts.push(jae);
  if (gwan) parts.push(gwan);
  if (in_) parts.push(in_);
  parts.push(dohwaHap);
  parts.push(core);

  // 2~3문단: 1문단 = 식상+재성, 2문단 = 관성+인성+도화합, 3문단 = 핵심문장
  const p1 = [sik, jae].filter(Boolean).join(" ");
  const p2 = [gwan, in_, dohwaHap].filter(Boolean).join(" ");
  let out = p1 && p2 ? p1 + "\n\n" + p2 + "\n\n" + core : parts.filter(Boolean).join(" ");
  if (out.length > 650) {
    out = out.slice(0, 600).trim();
    const last = out.lastIndexOf(".");
    if (last > 480) out = out.slice(0, last + 1);
  }
  return out.trim();
}

// =========================
// 시각화용 데이터 (향수 카드)
// =========================

export interface CharmNoteItem {
  keyword: string;
  desc: string;
}

export interface CharmNote {
  grade: "TOP" | "MIDDLE" | "BASE";
  label: string;
  color: string;
  items: CharmNoteItem[];
}

export interface CharmVisualData {
  name: string;
  subtitle: string;
  summary: string;
  notes: CharmNote[];
  strength: string;
}

const KEYWORD_POOL: Record<
  "TOP" | "MIDDLE" | "BASE",
  CharmNoteItem[]
> = {
  TOP: [
    { keyword: "강렬한 첫인상", desc: "처음 만나는 순간부터 강렬한 인상을 남겨요." },
    { keyword: "은은한 품격", desc: "처음 봤을 때부터 눈길을 끄는 외적 끌림이 있어요." },
    { keyword: "조용한 존재감", desc: "말없이 있어도 공간을 채우는 분위기가 있어요." },
    { keyword: "자유로운 에너지", desc: "활발하고 밝은 첫인상으로 사람들을 편하게 해요." },
    { keyword: "신비로운 분위기", desc: "쉽게 파악되지 않는 묘한 매력이 있어요." },
  ],
  MIDDLE: [
    { keyword: "편안한 온기", desc: "함께할수록 마음이 자연스럽게 열려요." },
    { keyword: "재치있는 유머", desc: "가까워지면 의외의 유머감각이 빛나요." },
    { keyword: "깊은 공감력", desc: "상대의 감정을 잘 읽고 맞춰주는 능력이 있어요." },
    { keyword: "독특한 개성", desc: "가까워질수록 독창적인 면이 매력적으로 느껴져요." },
    { keyword: "포용적 따뜻함", desc: "사람들이 앞에서 기대고 싶어지는 포용력이 있어요." },
  ],
  BASE: [
    { keyword: "깊은 신뢰감", desc: "알면 알수록 믿음이 가는 사람으로 기억돼요." },
    { keyword: "자연스러운 연결", desc: "억지 없이도 관계가 자연스럽게 형성돼요." },
    { keyword: "오래가는 여운", desc: "헤어지고 나서도 계속 생각나는 매력이 있어요." },
    { keyword: "한결같은 진심", desc: "시간이 지나도 변하지 않는 진심이 느껴져요." },
    { keyword: "잊히지 않는 존재", desc: "한번 인연이 되면 오래 기억되는 타입이에요." },
  ],
};

function pickFromPool(
  level: "TOP" | "MIDDLE" | "BASE",
  tags: string[],
  count: number
): CharmNoteItem[] {
  const pool = KEYWORD_POOL[level];
  if (!pool.length || count <= 0) return [];
  const chosen: CharmNoteItem[] = [];
  // 우선 태그에 맞는 키워드 우선 선택
  for (const t of tags) {
    const found = pool.find((p) => p.keyword === t);
    if (found && !chosen.includes(found)) {
      chosen.push(found);
      if (chosen.length >= count) return chosen;
    }
  }
  // 남는 자리는 순서대로 채우기
  for (const p of pool) {
    if (!chosen.includes(p)) {
      chosen.push(p);
      if (chosen.length >= count) break;
    }
  }
  return chosen;
}

export function getCharmVisualData(
  pillars: SajuPillarsForCharm,
  tone: CharmToneKey
): CharmVisualData | null {
  const dayBranch = pillars.day?.jiji?.hanja?.trim?.()?.[0] ?? "";
  const count = countTenGods(pillars);

  const sikTotal = (count["식신"] ?? 0) + (count["상관"] ?? 0);
  const jaeTotal = (count["편재"] ?? 0) + (count["정재"] ?? 0);
  const gwanTotal = (count["정관"] ?? 0) + (count["편관"] ?? 0);
  const inTotal = (count["정인"] ?? 0) + (count["편인"] ?? 0);

  const dohwaS = hasDohwaStem(pillars, dayBranch);
  const dohwaZ = hasDohwaBranch(pillars, dayBranch);
  const stemHe = hasStemHe(pillars);
  const zhiHe = hasZhiHe(pillars);

  const core = pickCoreSentence(count, pillars, dayBranch);

  // 향 이름/서브타이틀
  let name = "따뜻한 포용향";
  let subtitle = "Warm Embrace";
  if (core.includes("힐링")) {
    name = "편안한 힐링향";
    subtitle = "Healing Comfort";
  } else if (core.includes("강렬한 개성")) {
    name = "개성 스파크향";
    subtitle = "Electric Spark";
  } else if (core.includes("사교적 매력")) {
    name = "소셜 글로우향";
    subtitle = "Social Glow";
  } else if (core.includes("신뢰형 매력")) {
    name = "신뢰 스톤향";
    subtitle = "Steady Stone";
  } else if (core.includes("품격이 느껴지는 아우라")) {
    name = "노블 오라향";
    subtitle = "Noble Aura";
  } else if (core.includes("치명적 카리스마")) {
    name = "페이탈 카리스마향";
    subtitle = "Fatal Charisma";
  } else if (core.includes("따뜻한 매력")) {
    name = "따뜻한 포용향";
    subtitle = "Warm Embrace";
  } else if (core.includes("신비로운 매력")) {
    name = "미스틱 문향";
    subtitle = "Mystic Moon";
  }

  // 상단 요약 문장
  const summary =
    tone === "fun"
      ? "사람들이 자연스럽게 마음을 열게 되는 매력 조합이야."
      : tone === "empathy"
        ? "사람들이 자연스럽게 마음을 열게 만드는 따뜻한 매력이 있어요."
        : "사람들이 자연스럽게 마음을 열게 되는 매력 조합입니다.";

  // TOP / MIDDLE / BASE 노트 태그 결정
  const topTags: string[] = [];
  if (dohwaS || dohwaZ) topTags.push("강렬한 첫인상", "신비로운 분위기");
  else if (gwanTotal >= 2) topTags.push("은은한 품격", "조용한 존재감");
  else if (sikTotal >= 2 || jaeTotal >= 2) topTags.push("자유로운 에너지", "강렬한 첫인상");

  const middleTags: string[] = [];
  if (inTotal >= 2) middleTags.push("편안한 온기", "포용적 따뜻함");
  if (sikTotal >= 2) middleTags.push("재치있는 유머", "독특한 개성");
  if (!middleTags.length) middleTags.push("깊은 공감력");

  const baseTags: string[] = [];
  if (inTotal >= 2 || jaeTotal >= 2) baseTags.push("깊은 신뢰감", "한결같은 진심");
  baseTags.push("오래가는 여운");

  const notes: CharmNote[] = [
    {
      grade: "TOP",
      label: "첫인상 노트",
      color: "#E8C87A",
      items: pickFromPool("TOP", topTags, 2),
    },
    {
      grade: "MIDDLE",
      label: "가까워질수록 노트",
      color: "#A78BD4",
      items: pickFromPool("MIDDLE", middleTags, 2),
    },
    {
      grade: "BASE",
      label: "오래 남는 노트",
      color: "#7EB8A0",
      items: pickFromPool("BASE", baseTags, 2),
    },
  ];

  // 핵심 매력 문장
  let strength =
    tone === "fun"
      ? "겉에서 보이는 매력과, 가까워질수록 드러나는 깊은 끌림이 동시에 작동하는 타입이야."
      : tone === "empathy"
        ? "겉에서 보이는 매력과, 가까워질수록 드러나는 깊은 끌림이 동시에 작동하는 타입이에요."
        : "겉으로 보이는 매력과, 가까워질수록 드러나는 깊은 끌림이 동시에 작동하는 구조입니다.";

  if (dohwaS || dohwaZ) {
    strength =
      tone === "fun"
        ? "외적 끌림이 강한 만큼, 가까워질수록 따뜻함과 신뢰가 더해지는 조합이야."
        : tone === "empathy"
          ? "외적 끌림이 강한 만큼, 가까워질수록 따뜻함과 신뢰가 더해지는 조합이에요."
          : "외적 끌림이 강한 만큼, 가까워질수록 따뜻함과 신뢰가 더해지는 조합입니다.";
  }

  return {
    name,
    subtitle,
    summary,
    notes,
    strength,
  };
}

