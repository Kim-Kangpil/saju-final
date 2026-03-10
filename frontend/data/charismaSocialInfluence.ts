/**
 * 카리스마·사회적 영향력 (영향력 삼각형 최종판).
 *
 * 고정 축: 존재감 / 표현력 / 통찰력
 * - 존재감: 편관 2, 정관 1, 겁재 2, 비견 1
 * - 표현력: 상관 2, 식신 1, 편재 2, 정재 1
 * - 통찰력: 편인 2, 정인 1, 상관 2, 식신 1
 *
 * 가중치: 천간 1.0 / 지지 0.7
 * 감점: 충 -1 / 극 -0.5
 * 비겁 반영: 일간 본체 제외, 추가로 들어온 비견/겁재만 반영
 *
 * 레벨: S(4.0+) / A(3.0+) / B(2.0+) / C(1.0+) / D(>0) / F(0)
 * 유형: 전방위형, 리더형 인플루언서, 권위 전문가형, 지식 인플루언서형, 리더형, 인플루언서형, 전문가형, 균형형, 잠재형
 * 조합형 규칙: 1위 축 기준, 2위가 1위의 80% 이상이면 조합형으로 분류
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
const PRESENCE_BASE: Record<string, number> = { 편관: 2, 정관: 1, 겁재: 2, 비견: 1 };
const EXPRESSION_BASE: Record<string, number> = { 상관: 2, 식신: 1, 편재: 2, 정재: 1 };
const INSIGHT_BASE: Record<string, number> = { 편인: 2, 정인: 1, 상관: 2, 식신: 1 };

export type Axis3Key = "presence" | "expression" | "insight";
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

// STEP 3: 3축 점수 계산
function computeThreeAxisScores(positions: Pos[]): {
  presence: number;
  expression: number;
  insight: number;
  presenceChongKe: boolean;
  expressionChongKe: boolean;
  insightChongKe: boolean;
} {
  const p = scoreAxis(positions, PRESENCE_BASE);
  const e = scoreAxis(positions, EXPRESSION_BASE);
  const i = scoreAxis(positions, INSIGHT_BASE);
  return {
    presence: p.score,
    expression: e.score,
    insight: i.score,
    presenceChongKe: p.hadChongKe,
    expressionChongKe: e.hadChongKe,
    insightChongKe: i.hadChongKe,
  };
}

function levelText(level: LevelKey): string {
  if (level === "S") return "매우 강함";
  if (level === "A") return "강한 편";
  if (level === "B") return "분명히 있음";
  if (level === "C") return "보통";
  if (level === "D") return "잠재된 편";
  return "거의 드러나지 않음";
}

function classifyType(
  scores: Record<Axis3Key, number>,
  levels: Record<Axis3Key, LevelKey>
): { type: string; lead: Record<CharismaToneKey, string> } {
  const p = scores.presence;
  const e = scores.expression;
  const i = scores.insight;

  const sa = (l: LevelKey) => l === "S" || l === "A";
  const bc = (l: LevelKey) => l === "B" || l === "C";
  const df = (l: LevelKey) => l === "D" || l === "F";

  // 1) 전방위형: 세 축 모두 A 이상
  if (sa(levels.presence) && sa(levels.expression) && sa(levels.insight)) {
    return {
      type: "전방위형",
      lead: {
        empathy:
          "존재감·표현력·통찰력이 모두 강하게 작동하는 전방위형이에요. 사람을 끌어당기는 힘, 전달하는 힘, 납득시키는 힘이 함께 갖춰져 있어요.",
        reality:
          "전방위형입니다. 존재감·표현력·통찰력이 모두 강하게 작동하는 구조입니다.",
        fun:
          "전방위형이야. 끌어당기고, 퍼뜨리고, 납득시키는 힘이 다 같이 있어.",
      },
    };
  }

  // 2) 전반 중간: 균형형
  if (bc(levels.presence) && bc(levels.expression) && bc(levels.insight)) {
    return {
      type: "균형형",
      lead: {
        empathy:
          "세 축이 어느 한쪽으로 과하게 치우치지 않고 고르게 작동하는 균형형이에요. 상황에 따라 영향력이 드러나는 방식이 달라질 수 있어요.",
        reality:
          "균형형입니다. 세 축이 고르게 작동하여 상황에 따라 영향력이 드러나는 방식이 달라질 수 있습니다.",
        fun:
          "균형형이야. 상황에 따라 존재감/표현력/통찰력 중에 뭐가 더 앞에 나오기도 해.",
      },
    };
  }

  // 3) 전반 낮음: 잠재형
  if (df(levels.presence) && df(levels.expression) && df(levels.insight)) {
    return {
      type: "잠재형",
      lead: {
        empathy:
          "영향력이 겉으로 강하게 드러나는 구조는 아니지만, 역할과 환경이 맞아떨어지면 천천히 존재감이 커질 수 있는 잠재형이에요.",
        reality:
          "잠재형입니다. 영향력이 겉으로 강하게 드러나지는 않으나 역할·환경에 따라 점진적으로 커질 수 있습니다.",
        fun:
          "잠재형이야. 겉으로 확 세게 드러나진 않는데, 자리 잡으면 은근히 커져.",
      },
    };
  }

  // 4) 조합형 규칙: 1위 축 기준, 2위가 80% 이상이면 조합형
  const entries: Array<{ k: Axis3Key; v: number }> = ([
    { k: "presence" as const, v: p },
    { k: "expression" as const, v: e },
    { k: "insight" as const, v: i },
  ] satisfies Array<{ k: Axis3Key; v: number }>).sort((a, b) => b.v - a.v);

  const top = entries[0];
  const second = entries[1];
  const ratio = top.v > 0 ? second.v / top.v : 0;

  const combo = ratio >= 0.8;
  if (combo) {
    const a = top.k;
    const b = second.k;
    const isPE =
      (a === "presence" && b === "expression") ||
      (a === "expression" && b === "presence");
    const isPI =
      (a === "presence" && b === "insight") ||
      (a === "insight" && b === "presence");
    const isEI =
      (a === "expression" && b === "insight") ||
      (a === "insight" && b === "expression");

    if (isPE) {
      return {
        type: "리더형 인플루언서",
        lead: {
          empathy:
            "존재감과 표현력이 함께 높게 잡히는 리더형 인플루언서에 가까워요. 주목받는 힘과 메시지를 퍼뜨리는 힘이 같이 움직입니다.",
          reality:
            "리더형 인플루언서형입니다. 존재감과 표현력이 함께 높게 작동합니다.",
          fun:
            "리더형 인플루언서야. 눈에 띄고, 말/콘텐츠로 퍼지는 힘도 같이 있어.",
        },
      };
    }
    if (isPI) {
      return {
        type: "권위 전문가형",
        lead: {
          empathy:
            "존재감과 통찰력이 함께 높게 잡히는 권위 전문가형이에요. 가볍기보다 묵직한 신뢰로 영향력이 만들어지는 편입니다.",
          reality:
            "권위 전문가형입니다. 존재감과 통찰력이 함께 높게 작동합니다.",
          fun:
            "권위 전문가형이야. 묵직한 신뢰랑 핵심 보는 힘이 같이 있어.",
        },
      };
    }
    if (isEI) {
      return {
        type: "지식 인플루언서형",
        lead: {
          empathy:
            "표현력과 통찰력이 함께 높게 잡히는 지식 인플루언서형이에요. 이해한 걸 풀어내고 전달하는 능력이 강점으로 이어지기 쉽습니다.",
          reality:
            "지식 인플루언서형입니다. 표현력과 통찰력이 함께 높게 작동합니다.",
          fun:
            "지식 인플루언서형이야. 이해한 걸 잘 풀어내고 전달하는 힘이 같이 있어.",
        },
      };
    }
  }

  // 5) 단일형: 1위 축으로 분류
  if (top.k === "presence") {
    return {
      type: "리더형",
      lead: {
        empathy:
          "존재감이 가장 강하게 잡히는 리더형이에요. 말을 많이 하지 않아도 분위기와 태도로 중심을 잡는 편입니다.",
        reality:
          "리더형입니다. 존재감이 가장 강하게 작동합니다.",
        fun:
          "리더형이야. 말 많이 안 해도 분위기랑 태도로 중심 잡는 편.",
      },
    };
  }
  if (top.k === "expression") {
    return {
      type: "인플루언서형",
      lead: {
        empathy:
          "표현력이 가장 강하게 잡히는 인플루언서형이에요. 말·콘텐츠·소통 방식으로 사람들의 반응을 끌어내기 쉽습니다.",
        reality:
          "인플루언서형입니다. 표현력이 가장 강하게 작동합니다.",
        fun:
          "인플루언서형이야. 말/콘텐츠로 연결되고 퍼지는 힘이 제일 강해.",
      },
    };
  }
  return {
    type: "전문가형",
    lead: {
      empathy:
        "통찰력이 가장 강하게 잡히는 전문가형이에요. 바로 눈에 띄기보다 알수록 신뢰가 쌓이는 흐름으로 영향력이 만들어집니다.",
      reality:
        "전문가형입니다. 통찰력이 가장 강하게 작동합니다.",
      fun:
        "전문가형이야. 알수록 신뢰가 쌓이고, 핵심 보는 힘이 제일 강해.",
    },
  };
}

const AXIS_DESC: Record<Axis3Key, Record<CharismaToneKey, string>> = {
  presence: {
    empathy:
      "사람들이 자연스럽게 주목하게 되는 분위기가 있습니다. 굳이 많이 나서지 않아도 존재감이 느껴지는 편입니다.",
    reality:
      "사람들이 자연스럽게 주목하게 되는 분위기가 있습니다. 굳이 많이 나서지 않아도 존재감이 드러나는 편입니다.",
    fun:
      "말 많이 안 해도 분위기랑 태도에서 존재감이 느껴지는 편이야.",
  },
  expression: {
    empathy:
      "생각이나 감정을 전달하는 힘이 좋습니다. 말, 콘텐츠, 소통 방식에서 사람들의 반응을 끌어내기 쉽습니다.",
    reality:
      "생각이나 감정을 전달하는 힘이 좋습니다. 말·콘텐츠·소통 방식에서 반응을 끌어내기 쉽습니다.",
    fun:
      "말이나 콘텐츠로 반응 끌어내고 퍼뜨리는 힘이 있어.",
  },
  insight: {
    empathy:
      "상황의 핵심을 빨리 읽고 깊이 있게 이해하는 편입니다. 단순한 말보다 생각의 깊이에서 신뢰를 주기 쉽습니다.",
    reality:
      "상황의 핵심을 빠르게 읽고 깊이 있게 이해하는 편입니다. 생각의 깊이에서 신뢰를 주기 쉽습니다.",
    fun:
      "핵심을 빨리 읽고 깊게 이해하는 편이야. 알수록 신뢰 쌓이는 타입.",
  },
};

// STEP 7 F 레벨 보정
const F_CORRECTION: Record<Axis3Key, Record<CharismaToneKey, string>> = {
  presence: {
    empathy:
      "존재감이 약하게 느껴질 때는, 말과 메시지(표현력) 또는 이해시키는 힘(통찰력)으로 영향력을 만드는 쪽이 더 잘 맞을 수 있어요.",
    reality:
      "존재감이 약하게 느껴질 때에는 표현력 또는 통찰력 쪽으로 영향력이 형성되는 경우가 많습니다.",
    fun:
      "존재감이 약해도 표현력/통찰력으로 영향력 만들 수 있어.",
  },
  expression: {
    empathy:
      "표현력이 약하게 느껴질 때는, 말의 양보다 무게(존재감)나 설득의 깊이(통찰력)로 영향력이 만들어질 수 있어요.",
    reality:
      "표현력이 약하게 느껴질 때에는 존재감 또는 통찰력으로 영향력이 형성될 수 있습니다.",
    fun:
      "표현이 약해도 존재감/통찰력으로 충분히 영향력 생겨.",
  },
  insight: {
    empathy:
      "통찰력이 약하게 느껴질 때는, 실행과 태도(존재감) 또는 관계·확산(표현력) 쪽으로 영향력이 만들어질 수 있어요.",
    reality:
      "통찰력이 약하게 느껴질 때에는 존재감 또는 표현력으로 영향력이 형성될 수 있습니다.",
    fun:
      "통찰이 약해도 존재감/표현력으로 영향력 만들 수 있어.",
  },
};

// STEP 7 충·극 보정 문장
const CHONG_KE_CORRECTION: Record<Axis3Key, Record<CharismaToneKey, string>> = {
  presence: {
    empathy:
      "존재감 축은 분명히 있지만, 충·극 영향으로 컨디션이나 환경에 따라 들쭉날쭉해질 수 있어요. 기준이 되는 루틴과 역할을 만들어 두면 훨씬 안정적으로 힘이 잡힙니다.",
    reality:
      "존재감 축은 있으나 충·극 영향으로 환경에 따라 변동성이 커질 수 있습니다. 루틴과 역할을 고정하면 안정적으로 작동합니다.",
    fun:
      "존재감은 있는데 환경 따라 들쭉날쭉할 수 있어. 루틴 잡으면 훨씬 안정돼.",
  },
  expression: {
    empathy:
      "표현력 축이 있어도 충·극 영향이 있으면 전달 과정에서 오해가 생기기 쉬워요. 핵심 문장을 짧게 정리해 두면 확산이 더 깔끔해집니다.",
    reality:
      "표현력 축이 있으나 충·극 영향으로 전달 과정에서 오해가 생길 수 있습니다. 메시지를 간결하게 정리하는 것이 도움이 됩니다.",
    fun:
      "표현력은 있는데 퍼질 때 오해 생길 수 있어. 핵심 문장 짧게 정리해두면 좋아.",
  },
  insight: {
    empathy:
      "통찰력 축이 있어도 충·극이 있으면 설명이 날카롭게 느껴지거나 마찰이 생길 수 있어요. 전달 톤을 조금만 부드럽게 조절하면 설득력이 크게 살아납니다.",
    reality:
      "통찰력 축이 있으나 충·극 영향으로 전달 과정에서 마찰이 생길 수 있습니다. 전달 톤을 조절하면 설득력이 강화됩니다.",
    fun:
      "통찰은 있는데 말이 날카롭게 들릴 수 있어. 톤만 조금 다듬으면 설득력 확 살아.",
  },
};

// 600자 맞추기용 마무리 문장 (기존 내용 유지, 길이만 보강)
const CLOSING_FOR_LENGTH: Record<CharismaToneKey, string> = {
  empathy: "이런 영향력은 경험이 쌓이고 맞는 상황이 오면 더 분명하게 드러날 수 있어요. 당신이 가진 축을 알아두면 그때 더 잘 쓰게 돼요.",
  reality: "이러한 영향력은 경험이 쌓이고 상황이 맞을수록 더 분명하게 드러나는 구조입니다. 가진 축을 인지해 두면 활용도가 높아집니다.",
  fun: "이런 영향력은 경험 쌓이고 상황 맞을수록 더 잘 나와. 내가 가진 축 알아두면 그때 제대로 쓸 수 있어.",
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
  const {
    presence,
    expression,
    insight,
    presenceChongKe,
    expressionChongKe,
    insightChongKe,
  } = computeThreeAxisScores(positions);

  const levels: Record<Axis3Key, LevelKey> = {
    presence: scoreToLevel(presence),
    expression: scoreToLevel(expression),
    insight: scoreToLevel(insight),
  };
  const scores: Record<Axis3Key, number> = { presence, expression, insight };
  const typeRow = classifyType(scores, levels);

  const lp = levelText(levels.presence);
  const le = levelText(levels.expression);
  const li = levelText(levels.insight);
  const axisSummary =
    tone === "fun"
      ? `존재감은 ${lp} 쪽이고, 표현력은 ${le} 느낌, 통찰력은 ${li} 쪽에 힘이 실려 있는 편이야.`
      : tone === "reality"
        ? `존재감은 ${lp} 수준으로, 표현력은 ${le}, 통찰력은 ${li} 축이 두드러지는 구조입니다.`
        : `존재감은 ${lp} 쪽이고, 표현력은 ${le}, 통찰력은 ${li} 축에 힘이 실려 있는 흐름이에요.`;

  const p1 = [typeRow.lead[tone], axisSummary].filter(Boolean).join(" ").trim();
  const p2 = [
    AXIS_DESC.presence[tone],
    AXIS_DESC.expression[tone],
    AXIS_DESC.insight[tone],
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const correctionParts: string[] = [];
  if (levels.presence === "F") correctionParts.push(F_CORRECTION.presence[tone]);
  if (levels.expression === "F") correctionParts.push(F_CORRECTION.expression[tone]);
  if (levels.insight === "F") correctionParts.push(F_CORRECTION.insight[tone]);
  if (presenceChongKe) correctionParts.push(CHONG_KE_CORRECTION.presence[tone]);
  if (expressionChongKe) correctionParts.push(CHONG_KE_CORRECTION.expression[tone]);
  if (insightChongKe) correctionParts.push(CHONG_KE_CORRECTION.insight[tone]);
  const closing = CLOSING_FOR_LENGTH[tone];
  const p3 = correctionParts.length > 0 ? (correctionParts.join(" ") + " " + closing).trim() : "";

  let out: string;
  if (p3) {
    out = [p1, p2, p3].filter(Boolean).join("\n\n");
  } else {
    out = [p1, p2].filter(Boolean).join("\n\n") + (p2 ? " " : "") + closing;
  }
  if (out.length > 650) {
    out = out.slice(0, 600).trim();
    const last = out.lastIndexOf(".");
    if (last > 480) out = out.slice(0, last + 1);
  }
  return out.trim();
}

// =========================
// 시각화용 데이터 (카리스마 궤도 카드)
// =========================

export interface CharismaAxisVisual {
  key: Axis3Key;
  label: string;
  emoji: string;
  level: LevelKey;
  value: number; // 0~100
  color: string;
  desc: string;
}

/** UI용 한 줄 해석 (삼각형 아래 안내 문장) */
const TYPE_ONE_LINER: Record<string, Record<CharismaToneKey, string>> = {
  전방위형: {
    empathy: "세 축이 고르게 강해서, 상황에 따라 어떤 방식으로든 영향력이 잘 드러나요.",
    reality: "세 축이 고르게 강해 상황에 따라 다양한 방식으로 영향력이 드러납니다.",
    fun: "세 축이 다 강해서 상황에 따라 어떤 식으로든 영향력 잘 나와.",
  },
  "리더형 인플루언서": {
    empathy: "내 영향력은 존재감과 표현력이 함께 작동할 때 가장 잘 드러나요.",
    reality: "존재감과 표현력이 함께 작동할 때 영향력이 가장 잘 드러납니다.",
    fun: "존재감이랑 표현력이 같이 작동할 때 제일 잘 드러나.",
  },
  "권위 전문가형": {
    empathy: "존재감과 통찰력이 함께할 때 말의 무게감이 잘 살아나요.",
    reality: "존재감과 통찰력이 함께할 때 말의 무게감이 잘 살아납니다.",
    fun: "존재감이랑 통찰력이 맞을 때 말 무게감 잘 살아나.",
  },
  "지식 인플루언서형": {
    empathy: "표현력과 통찰력이 맞아떨어질 때 설명과 설득이 잘 통해요.",
    reality: "표현력과 통찰력이 맞아떨어질 때 설명과 설득이 잘 통합니다.",
    fun: "표현력이랑 통찰력이 맞을 때 설명·설득 잘 통해.",
  },
  리더형: {
    empathy: "나는 '존재감' 쪽으로 더 기울어 있는 편이에요.",
    reality: "존재감 쪽으로 더 기울어 있는 편입니다.",
    fun: "나는 존재감 쪽으로 더 기울어 있어.",
  },
  인플루언서형: {
    empathy: "말과 콘텐츠로 퍼지는 '표현력'이 강하게 작동해요.",
    reality: "말과 콘텐츠로 퍼지는 표현력이 강하게 작동합니다.",
    fun: "말이랑 콘텐츠로 퍼지는 표현력이 제일 강해.",
  },
  전문가형: {
    empathy: "상황을 읽고 핵심을 짚는 '통찰력'이 영향력의 중심이에요.",
    reality: "상황을 읽고 핵심을 짚는 통찰력이 영향력의 중심입니다.",
    fun: "통찰력이 영향력의 중심이야. 핵심 잘 짚어.",
  },
  균형형: {
    empathy: "세 축이 비교적 고르게 작동하는 편이에요.",
    reality: "세 축이 비교적 고르게 작동하는 편입니다.",
    fun: "세 축이 고르게 작동하는 편이야.",
  },
  잠재형: {
    empathy: "특정 역할이나 환경이 맞을 때 영향력이 서서히 드러나는 편이에요.",
    reality: "특정 역할·환경이 맞을 때 영향력이 서서히 드러나는 편입니다.",
    fun: "역할이랑 환경 맞을 때 영향력이 서서히 나오는 편이야.",
  },
};

export interface CharismaVisualData {
  type: string;
  typeDesc: string;
  axes: CharismaAxisVisual[];
  scores: Record<Axis3Key, number>;
  summary: string;
  /** 삼각형 아래 한 줄 해석 */
  oneLiner: string;
}

/** 사용자 표시용 0~100 점수 (내부 0~6 기준) */
function axisScoreToPercent(score: number): number {
  const r = Math.max(0, Math.min(score, 6)) / 6;
  return Math.round(r * 100);
}

function levelLabel(level: LevelKey): string {
  if (level === "S") return "압도적";
  if (level === "A") return "강함";
  if (level === "B") return "있음";
  if (level === "C") return "보통";
  if (level === "D") return "잠재";
  return "잠재";
}

export function getCharismaVisualData(
  pillars: SajuPillarsForCharisma,
  tone: CharismaToneKey
): CharismaVisualData | null {
  const dayStem = pillars.day?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  if (!dayStem) return null;

  const positions = collectPositions(pillars, dayStem);
  const {
    presence,
    expression,
    insight,
  } = computeThreeAxisScores(positions);

  const levels: Record<Axis3Key, LevelKey> = {
    presence: scoreToLevel(presence),
    expression: scoreToLevel(expression),
    insight: scoreToLevel(insight),
  };
  const scores: Record<Axis3Key, number> = { presence, expression, insight };
  const typeRow = classifyType(scores, levels);

  const type = typeRow.type;
  const typeDesc = typeRow.lead[tone].trim();

  const axes: CharismaAxisVisual[] = [
    {
      key: "presence",
      label: "존재감",
      emoji: "🧲",
      level: levels.presence,
      value: axisScoreToPercent(presence),
      color: "#A78BD4",
      desc: AXIS_DESC.presence[tone],
    },
    {
      key: "expression",
      label: "표현력",
      emoji: "📣",
      level: levels.expression,
      value: axisScoreToPercent(expression),
      color: "#E8B768",
      desc: AXIS_DESC.expression[tone],
    },
    {
      key: "insight",
      label: "통찰력",
      emoji: "🔎",
      level: levels.insight,
      value: axisScoreToPercent(insight),
      color: "#7DB8B2",
      desc: AXIS_DESC.insight[tone],
    },
  ];

  const summary = CLOSING_FOR_LENGTH[tone];
  const oneLiner =
    TYPE_ONE_LINER[type]?.[tone] ??
    (tone === "fun"
      ? "존재감·표현력·통찰력 비율에 따라 영향력이 드러나요."
      : "존재감·표현력·통찰력 비율에 따라 영향력이 드러납니다.");

  return {
    type,
    typeDesc,
    axes,
    scores,
    summary,
    oneLiner,
  };
}
