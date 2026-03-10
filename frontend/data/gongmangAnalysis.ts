// frontend/data/gongmangAnalysis.ts
//
// 공망(空亡) 판별 전용 로직
// - 기준: 일주(메인) + 년주(보조)
// - 일주별 공망 지지 2개를 조견표로 매핑해서 사용

export type GongmangPos = "년" | "월" | "일" | "시";

export interface GongmangHit {
  pos: GongmangPos;
  branch: string; // 공망에 해당하는 지지
}

export interface GongmangSource {
  from: "일주" | "년주";
  emptyBranches: [string, string]; // 이 순에서 공망이 되는 지지 2개
  hits: GongmangHit[]; // 실제 사주에서 공망이 걸린 위치들
}

export interface GongmangAnalysisResult {
  sources: GongmangSource[]; // 일주/년주 기준 각각의 공망 정보
}

// 일주별 공망 지지 조견표
// (사용자 제공 표 기준: 60갑자 전부 매핑)
const DAY_PILLAR_GONGMANG: Record<string, [string, string]> = {
  // 갑자순 (공망: 술·해)
  "甲子": ["戌", "亥"],
  "乙丑": ["戌", "亥"],
  "丙寅": ["戌", "亥"],
  "丁卯": ["戌", "亥"],
  "戊辰": ["戌", "亥"],
  "己巳": ["戌", "亥"],
  "庚午": ["戌", "亥"],
  "辛未": ["戌", "亥"],
  "壬申": ["戌", "亥"],
  "癸酉": ["戌", "亥"],

  // 갑술순 (공망: 신·유)
  "甲戌": ["申", "酉"],
  "乙亥": ["申", "酉"],
  "丙子": ["申", "酉"],
  "丁丑": ["申", "酉"],
  "戊寅": ["申", "酉"],
  "己卯": ["申", "酉"],
  "庚辰": ["申", "酉"],
  "辛巳": ["申", "酉"],
  "壬午": ["申", "酉"],
  "癸未": ["申", "酉"],

  // 갑신순 (공망: 오·미)
  "甲申": ["午", "未"],
  "乙酉": ["午", "未"],
  "丙戌": ["午", "未"],
  "丁亥": ["午", "未"],
  "戊子": ["午", "未"],
  "己丑": ["午", "未"],
  "庚寅": ["午", "未"],
  "辛卯": ["午", "未"],
  "壬辰": ["午", "未"],
  "癸巳": ["午", "未"],

  // 갑오순 (공망: 진·사)
  "甲午": ["辰", "巳"],
  "乙未": ["辰", "巳"],
  "丙申": ["辰", "巳"],
  "丁酉": ["辰", "巳"],
  "戊戌": ["辰", "巳"],
  "己亥": ["辰", "巳"],
  "庚子": ["辰", "巳"],
  "辛丑": ["辰", "巳"],
  "壬寅": ["辰", "巳"],
  "癸卯": ["辰", "巳"],

  // 갑진순 (공망: 인·묘) — 대공망
  "甲辰": ["寅", "卯"],
  "乙巳": ["寅", "卯"],
  "丙午": ["寅", "卯"],
  "丁未": ["寅", "卯"],
  "戊申": ["寅", "卯"],
  "己酉": ["寅", "卯"],
  "庚戌": ["寅", "卯"],
  "辛亥": ["寅", "卯"],
  "壬子": ["寅", "卯"],
  "癸丑": ["寅", "卯"],

  // 갑인순 (공망: 자·축)
  "甲寅": ["子", "丑"],
  "乙卯": ["子", "丑"],
  "丙辰": ["子", "丑"],
  "丁巳": ["子", "丑"],
  "戊午": ["子", "丑"],
  "己未": ["子", "丑"],
  "庚申": ["子", "丑"],
  "辛酉": ["子", "丑"],
  "壬戌": ["子", "丑"],
  "癸亥": ["子", "丑"],
};

function splitPillar(pillar: string): { stem: string; branch: string } {
  if (!pillar || pillar.length < 2) {
    return { stem: "", branch: "" };
  }
  const stem = pillar[0];
  const branch = pillar[1];
  return { stem, branch };
}

export function analyzeGongmang(pillars: {
  year: string;
  month: string;
  day: string;
  hour: string;
}): GongmangAnalysisResult | null {
  const { year, month, day, hour } = pillars;
  if (!year || !day) return null;

  const yearKey = year.slice(0, 2);
  const dayKey = day.slice(0, 2);

  const sources: GongmangSource[] = [];

  const { branch: yearBranch } = splitPillar(year);
  const { branch: monthBranch } = splitPillar(month);
  const { branch: dayBranch } = splitPillar(day);
  const { branch: hourBranch } = splitPillar(hour);

  const branchByPos: Record<GongmangPos, string> = {
    년: yearBranch,
    월: monthBranch,
    일: dayBranch,
    시: hourBranch,
  };

  // 일주 기준 공망 (메인)
  const dayEmpty = DAY_PILLAR_GONGMANG[dayKey];
  if (dayEmpty) {
    const [b1, b2] = dayEmpty;
    const hits: GongmangHit[] = [];
    (["년", "월", "일", "시"] as GongmangPos[]).forEach((pos) => {
      const br = branchByPos[pos];
      if (br === b1 || br === b2) {
        hits.push({ pos, branch: br });
      }
    });
    sources.push({
      from: "일주",
      emptyBranches: dayEmpty,
      hits,
    });
  }

  // 년주 기준 공망 (보조)
  const yearEmpty = DAY_PILLAR_GONGMANG[yearKey];
  if (yearEmpty) {
    const [b1, b2] = yearEmpty;
    const hits: GongmangHit[] = [];
    (["년", "월", "일", "시"] as GongmangPos[]).forEach((pos) => {
      const br = branchByPos[pos];
      if (br === b1 || br === b2) {
        hits.push({ pos, branch: br });
      }
    });
    sources.push({
      from: "년주",
      emptyBranches: yearEmpty,
      hits,
    });
  }

  if (sources.length === 0) return null;
  return { sources };
}

// =====================================================
// 해공/성립 상태 판별 + 요약 텍스트 생성
// =====================================================

type CharKey = "empathy" | "reality" | "fun";

export type GongmangState = "none" | "full" | "released";

// 십성 계산용 간단 오행/음양 매핑
type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";

const STEM_META: Record<string, { el: Element; pol: Polarity }> = {
  甲: { el: "wood", pol: "yang" },
  乙: { el: "wood", pol: "yin" },
  丙: { el: "fire", pol: "yang" },
  丁: { el: "fire", pol: "yin" },
  戊: { el: "earth", pol: "yang" },
  己: { el: "earth", pol: "yin" },
  庚: { el: "metal", pol: "yang" },
  辛: { el: "metal", pol: "yin" },
  壬: { el: "water", pol: "yang" },
  癸: { el: "water", pol: "yin" },
};

function produces(a: Element, b: Element): boolean {
  const next: Record<Element, Element> = {
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water",
    water: "wood",
  };
  return next[a] === b;
}

function controls(a: Element, b: Element): boolean {
  const map: Record<Element, Element> = {
    wood: "earth",
    fire: "metal",
    earth: "water",
    metal: "wood",
    water: "fire",
  };
  return map[a] === b;
}

// 지지 본기 → 천간 (십성 계산용)
function branchMainStemForGong(branch: string): string | null {
  const map: Record<string, string> = {
    子: "癸",
    丑: "己",
    寅: "甲",
    卯: "乙",
    辰: "戊",
    巳: "丙",
    午: "丁",
    未: "己",
    申: "庚",
    酉: "辛",
    戌: "戊",
    亥: "壬",
  };
  return map[branch] ?? null;
}

function tenGodFromStems(dayStem: string, targetStem: string): string {
  const dm = STEM_META[dayStem];
  const tm = STEM_META[targetStem];
  if (!dm || !tm) return "";

  const samePol = dm.pol === tm.pol;

  if (dm.el === tm.el) return samePol ? "비견" : "겁재";
  if (produces(dm.el, tm.el)) return samePol ? "식신" : "상관";
  if (produces(tm.el, dm.el)) return samePol ? "편인" : "정인";
  if (controls(dm.el, tm.el)) return samePol ? "편재" : "정재";
  if (controls(tm.el, dm.el)) return samePol ? "편관" : "정관";
  return "";
}

export type BroadTenGroup = "인성" | "비겁" | "관성" | "식상" | "재성";

function broadGroupFromBranch(dayStem: string, branch: string): BroadTenGroup | null {
  const main = branchMainStemForGong(branch);
  if (!main) return null;
  const tg = tenGodFromStems(dayStem, main);
  if (!tg) return null;
  if (tg === "정인" || tg === "편인") return "인성";
  if (tg === "비견" || tg === "겁재") return "비겁";
  if (tg === "정관" || tg === "편관") return "관성";
  if (tg === "식신" || tg === "상관") return "식상";
  if (tg === "정재" || tg === "편재") return "재성";
  return null;
}

const SIX_HAP: Array<[string, string]> = [
  ["子", "丑"],
  ["寅", "亥"],
  ["卯", "戌"],
  ["辰", "酉"],
  ["巳", "申"],
  ["午", "未"],
];

const SIX_CHUNG: Array<[string, string]> = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

function hasHapOrChung(target: string, others: string[]): boolean {
  for (const [a, b] of SIX_HAP) {
    if (target === a && others.includes(b)) return true;
    if (target === b && others.includes(a)) return true;
  }
  for (const [a, b] of SIX_CHUNG) {
    if (target === a && others.includes(b)) return true;
    if (target === b && others.includes(a)) return true;
  }
  return false;
}

export interface GongmangVisualSlot {
  pos: GongmangPos;
  state: GongmangState;
  group: BroadTenGroup | null;
}

export function getGongmangVisualData(
  pillars: { year: string; month: string; day: string; hour: string },
  dayStemForTenGod?: string
): GongmangVisualSlot[] | null {
  const analysis = analyzeGongmang(pillars);
  if (!analysis) return null;

  const { year, month, day, hour } = pillars;
  const { branch: yearBranch } = splitPillar(year);
  const { branch: monthBranch } = splitPillar(month);
  const { branch: dayBranch } = splitPillar(day);
  const { branch: hourBranch } = splitPillar(hour);

  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch].filter(Boolean);

  const byPos: Record<GongmangPos, GongmangState> = {
    년: "none",
    월: "none",
    일: "none",
    시: "none",
  };

  (["년", "월", "일", "시"] as GongmangPos[]).forEach((pos) => {
    const hitsHere = analysis.sources.flatMap((s) =>
      s.hits.filter((h) => h.pos === pos)
    );
    if (hitsHere.length === 0) {
      byPos[pos] = "none";
      return;
    }
    const branchesHere = hitsHere.map((h) => h.branch);
    const others = allBranches.filter((b) => !branchesHere.includes(b));
    const anyReleased = branchesHere.some((br) => hasHapOrChung(br, others));
    byPos[pos] = anyReleased ? "released" : "full";
  });

  const branchByPos: Record<GongmangPos, string> = {
    년: yearBranch,
    월: monthBranch,
    일: dayBranch,
    시: hourBranch,
  };

  const result: GongmangVisualSlot[] = (["년", "월", "일", "시"] as GongmangPos[]).map(
    (pos) => {
      const state = byPos[pos];
      const group =
        state === "none" || !dayStemForTenGod
          ? null
          : broadGroupFromBranch(dayStemForTenGod, branchByPos[pos]);
      return { pos, state, group };
    }
  );

  return result;
}

export function summarizeGongmang(
  pillars: { year: string; month: string; day: string; hour: string },
  tone: CharKey = "empathy",
  dayStemForTenGod?: string
): string | null {
  const analysis = analyzeGongmang(pillars);
  const { year, month, day, hour } = pillars;
  const { branch: yearBranch } = splitPillar(year);
  const { branch: monthBranch } = splitPillar(month);
  const { branch: dayBranch } = splitPillar(day);
  const { branch: hourBranch } = splitPillar(hour);
  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch].filter(Boolean);

  const byPos: Record<GongmangPos, GongmangState> = {
    년: "none",
    월: "none",
    일: "none",
    시: "none",
  };

  if (!analysis) {
    // 공망 자체가 거의 작동하지 않는 구조
    if (tone === "fun") {
      return "네 사주는 공망이 눈에 띄게 작동하는 구조는 아니야. 쉽게 말하면, 뿌리나 관계·노년 쪽에서 '구멍'보다 '기본 골격'이 더 크게 작용하는 타입이라, 공망 때문에 인생이 뒤집히는 그림은 아니라는 뜻이야.";
    }
    if (tone === "reality") {
      return "현재 구조에서는 일주·년주 기준 공망이 뚜렷하게 잡히지 않습니다. 조상·부모·배우자·자녀·노년 영역이 공망으로 크게 비워지기보다는, 기본 사주의 틀과 선택의 방향이 더 크게 작용하는 타입으로 볼 수 있어요.";
    }
    return "이 사주는 공망이 강하게 작동하는 편은 아니에요. 조상·부모·배우자·자녀·노년과 관련된 영역이 공허하게 비워지기보다는, 스스로 선택한 방향과 기본 골격이 인생의 틀을 더 분명하게 잡아 주는 구조에 가깝습니다.";
  }

  // 위치별로 full/released 판정
  (["년", "월", "일", "시"] as GongmangPos[]).forEach((pos) => {
    const hitsHere = analysis.sources.flatMap((s) =>
      s.hits.filter((h) => h.pos === pos)
    );
    if (hitsHere.length === 0) {
      byPos[pos] = "none";
      return;
    }
    const branchesHere = hitsHere.map((h) => h.branch);
    const others = allBranches.filter((b) => !branchesHere.includes(b));
    const anyReleased = branchesHere.some((br) => hasHapOrChung(br, others));
    byPos[pos] = anyReleased ? "released" : "full";
  });

  const parts: string[] = [];

  if (tone === "fun") {
    parts.push(
      "공망은 사주에서 어떤 글자의 기운이 기대한 방식으로 잘 작동하지 않거나, 힘이 잠시 비어 있는 상태를 말해. 다만 공망은 모든 자리에서 똑같이 보진 않고, 보통 연주·월주·시주 중심으로 흐름을 봐. 일주는 개인의 중심 자리라 일반적으로 공망을 적용하지 않고, 여기서는 일주를 제외한 자리에서 공망이 어떻게 체감되는지 같이 살펴볼게."
    );
  } else if (tone === "reality") {
    parts.push(
      "공망은 사주에서 특정 글자의 기운이 기대한 방식으로 잘 작동하지 않거나, 힘이 잠시 비어 있는 상태를 말합니다. 다만 공망은 모든 자리에서 동일하게 보는 것은 아니며, 보통 연주·월주·시주를 중심으로 흐름을 살펴봅니다. 일주는 개인의 중심이 되는 자리이기 때문에 일반적으로 공망을 적용하지 않습니다. 이 분석에서는 일주를 제외한 다른 자리에서 공망이 어떻게 나타나는지, 그리고 그것이 현실에서 어떤 방식으로 체감되기 쉬운지를 함께 살펴봅니다."
    );
  } else {
    parts.push(
      "공망은 사주에서 특정 글자의 기운이 기대한 방식으로 잘 작동하지 않거나, 힘이 잠시 비어 있는 상태를 말해요. 다만 공망은 모든 자리에서 동일하게 보는 것은 아니며, 보통 연주·월주·시주를 중심으로 흐름을 살펴봐요. 일주는 개인의 중심이 되는 자리이기 때문에 일반적으로 공망을 적용하지 않아요. 이 분석에서는 일주를 제외한 다른 자리에서 공망이 어떻게 나타나는지, 그리고 그것이 현실에서 어떤 방식으로 체감되기 쉬운지를 함께 살펴봅니다."
    );
  }

  // 년·월·시간별 기본 해석
  const yearState = byPos["년"];
  const monthState = byPos["월"];
  const hourState = byPos["시"];

  // 공망 육친까지 고려한 상세 해석은 공감 톤 + 일간 정보가 있을 때만 사용
  if (tone === "empathy" && dayStemForTenGod) {
    const yearGroup = yearState === "none" ? null : broadGroupFromBranch(dayStemForTenGod, yearBranch);
    const monthGroup = monthState === "none" ? null : broadGroupFromBranch(dayStemForTenGod, monthBranch);
    const hourGroup = hourState === "none" ? null : broadGroupFromBranch(dayStemForTenGod, hourBranch);

    // 년주: 조상·부모·초기 환경
    if (yearState === "none") {
      parts.push(
        "년지 쪽은 조상·부모 기반이 비교적 안정적으로 작동하는 편이라, 뿌리 자체가 크게 흔들리는 그림은 아니에요."
      );
    } else if (yearState === "full") {
      let middle = "";
      switch (yearGroup) {
        case "인성":
          middle =
            "이 자리에 인성 기능이 공망이면, 부모에게서 받는 정서적 지지가 상대적으로 약하게 느껴질 수 있어요. 대신 어린 시절부터 스스로 마음을 다루는 법을 익히면서, 감정적으로 독립적인 사람이 되기 쉬운 구조입니다.";
          break;
        case "재성":
          middle =
            "이 자리에 재성 기능이 공망이면, 집안의 경제 기반이 늘 일정하게 느껴지지 않을 수 있어요. 그만큼 일찍부터 '내 힘으로 벌어야 한다'는 감각이 생기면서, 현실 감각과 생존력이 강하게 자라기 쉽습니다.";
          break;
        case "관성":
          middle =
            "이 자리에 관성 기능이 공망이면, 부모의 통제나 기준이 느슨하게 느껴지거나 일찍부터 스스로 판단해야 하는 장면이 많았을 수 있어요. 그 경험이 나중에는 남의 기준보다 자기 기준을 세우는 힘으로 작동합니다.";
          break;
        case "식상":
          middle =
            "이 자리에 식상 기능이 공망이면, 집안 분위기가 자유롭거나 방임적으로 흘렀을 가능성이 있어요. 덕분에 남다른 개성과 표현력은 잘 자라는 대신, 스스로 삶의 구조를 세워 가야 하는 과제가 함께 따라옵니다.";
          break;
        case "비겁":
          middle =
            "이 자리에 비겁 기능이 공망이면, 형제나 가까운 가족과의 유대가 다소 느슨하게 느껴질 수 있어요. 대신 혈연에만 기대지 않고 다양한 관계망 속에서 스스로를 지키는 힘이 커지기 쉽습니다.";
          break;
        default:
          middle =
            "년지가 공망에 걸려 있어서, 어린 시절부터 집안이나 부모의 틀에 기대기보다는 스스로 길을 만들어 온 느낌이 강할 수 있어요.";
      }
      parts.push(
        "년주는 조상·부모·초기 환경과 연결되는 자리예요. " +
          middle +
          " 가문이나 부모의 틀에만 기댄다기보다, 스스로 삶의 기반을 만들어 가는 힘이 크게 작동하는 편입니다."
      );
    } else {
      let middle = "";
      switch (yearGroup) {
        case "인성":
          middle =
            "인성 기능의 공망이 합·충으로 어느 정도 풀려 있어, 부모 정서에 과도하게 기대지도, 완전히 끊기지도 않은 적당한 거리감이 만들어지기 쉽습니다.";
          break;
        case "재성":
          middle =
            "재성 공망이 해공된 구조라, 집안 재정이 들쭉날쭉해 보여도 결국에는 기본 틀을 유지할 수 있는 흐름으로 귀결되기 쉽습니다.";
          break;
        case "관성":
          middle =
            "관성 공망이 해공되어, 부모의 기준에서 완전히 벗어나지는 않으면서도 스스로 선택할 수 있는 여지가 비교적 넓게 열려 있는 편이에요.";
          break;
        case "식상":
          middle =
            "식상 공망이 풀린 형태라, 집안 분위기가 자유로우면서도 기본적인 선은 지켜지는 쪽으로 균형을 잡기 좋습니다.";
          break;
        case "비겁":
          middle =
            "비겁 공망이 해공된 구조라, 형제·가족 간의 유대가 느슨하게만 흘러가지는 않고, 필요할 때 서로를 도와 줄 수 있는 선에서 관계가 유지되기 쉽습니다.";
          break;
        default:
          middle =
            "년지에 공망 기운이 있지만 합·충으로 어느 정도 해소되어, 실제로는 조상·부모와의 인연이 완전히 끊기기보다는 적당한 거리감 속에서 스스로 서는 쪽으로 힘이 씁니다.";
      }
      parts.push(
        "년주는 조상·부모·초기 환경과 연결되는 자리예요. " + middle
      );
    }

    // 월주: 사회 환경·직장·자리 잡는 과정
    if (monthState === "none") {
      parts.push(
        "월지에는 공망이 강하게 걸려 있지 않아, 직장·사회생활의 기본 틀은 비교적 안정적으로 잡히는 편이에요."
      );
    } else if (monthState === "full") {
      let middle = "";
      switch (monthGroup) {
        case "관성":
          middle =
            "관성 기능이 공망이면, 조직의 틀이나 위계에 오래 붙어 있기보다 자신에게 맞는 방식을 찾아 이동하는 흐름으로 나타나기 쉽습니다. 남들이 보기엔 자리 잡는 속도가 느려 보여도, 본인에게 맞는 환경을 찾는 데 더 에너지를 쓰는 타입이에요.";
          break;
        case "재성":
          middle =
            "재성 기능이 공망이면, 경제 기반을 한 번에 단단히 구축하기보다는 여러 경험을 거치며 점진적으로 쌓아 가는 경향이 나타납니다. 다만 그 과정에서 돈보다 경험과 배움을 더 중시하는 태도가 강점이 됩니다.";
          break;
        case "식상":
          middle =
            "식상 기능이 공망이면, 자신의 능력을 한 자리에서 곧바로 펼치기보다는 환경을 탐색하며 늦게 드러내는 패턴이 있습니다. 대신 한 번 자신에게 맞는 무대를 찾으면 표현력이 크게 살아나는 구조예요.";
          break;
        case "비겁":
          middle =
            "비겁 기능이 공망이면, 동료나 팀워크에 과도하게 기대기보다 혼자 책임지는 방식으로 일을 처리하는 경향이 있습니다. 덕분에 독립적인 커리어를 만들기에는 유리한 구조예요.";
          break;
        case "인성":
          middle =
            "인성 기능이 공망이면, 회사나 조직에서 받는 보호나 가이드가 상대적으로 약하게 느껴질 수 있어요. 대신 스스로 정보를 찾고 배우는 능력이 강하게 자라면서, 시간이 갈수록 자신만의 방식으로 일하는 틀을 만들어 갑니다.";
          break;
        default:
          middle =
            "월지가 공망이면, 청년기와 사회 초반에 기반을 잡기까지 시행착오가 많을 수 있어요.";
      }
      parts.push(
        "월주는 사회 환경과 직업, 자리를 잡는 과정과 연결되는 자리예요. " +
          middle +
          " 초반에는 돌아가는 길이 길어 보이더라도, 그만큼 나중에 선택하는 자리에서는 '여기가 내 자리다'라는 감각이 뚜렷해지는 구조입니다."
      );
    } else {
      let middle = "";
      switch (monthGroup) {
        case "관성":
          middle =
            "관성 공망이 해공된 구조라, 조직의 틀에서 완전히 이탈하기보다는 필요할 때는 안정적인 틀 안에, 필요할 때는 독립적으로 움직이는 유연성이 생기기 쉽습니다.";
          break;
        case "재성":
          middle =
            "재성 공망이 어느 정도 풀려 있어, 초기에는 수입과 지출이 들쭉날쭉해도 시간이 갈수록 자신에게 맞는 수입 구조로 정리되기 좋은 편입니다.";
          break;
        case "식상":
          middle =
            "식상 공망이 해소된 형태라, 표현의 타이밍이 늦게 잡히더라도 결국에는 적절한 무대를 만나 자신의 능력을 펼칠 가능성이 큽니다.";
          break;
        case "비겁":
          middle =
            "비겁 공망이 해공되어, 동료와의 관계가 완전히 끊기기보다는 느슨하지만 필요한 순간에는 힘을 모을 수 있는 형태로 유지되기 쉽습니다.";
          break;
        case "인성":
          middle =
            "인성 공망이 해공된 구조라, 조직의 보호를 과도하게 의존하지도, 완전히 고립되지도 않고, 스스로 길을 찾되 필요한 도움은 받을 수 있는 균형을 만들기 좋습니다.";
          break;
        default:
          middle =
            "월지 공망이 합·충으로 어느 정도 풀려 있어서, 초반에는 자리 잡는 과정이 다소 지연되더라도 결국은 자신에게 맞는 환경을 찾아가는 흐름으로 정리되기 쉽습니다.";
      }
      parts.push(
        "월주는 사회 환경과 직업, 자리를 잡는 과정과 연결되는 자리예요. " + middle
      );
    }

    // 시주: 자녀·말년·개인 시간
    if (hourState === "none") {
      parts.push(
        "시지에는 공망이 두드러지지 않아, 자녀 인연과 노년의 기반이 비교적 안정적으로 이어질 가능성이 큽니다."
      );
    } else if (hourState === "full") {
      let middle = "";
      switch (hourGroup) {
        case "식상":
          middle =
            "식상 기능이 공망이면, 자녀와의 관계나 말년의 활동에서 '내가 모든 것을 책임져야 한다'는 부담을 조금 덜 지게 되는 경향이 있습니다. 대신 각자 삶을 존중하면서 거리를 두고 지내는 편안한 흐름으로 이어지기 쉬워요.";
          break;
        case "재성":
          middle =
            "재성 기능이 공망이면, 말년에 재정적으로 크게 치고 올라가는 그림보다는, 필요한 만큼만 유지하면서 단촐하게 사는 방향으로 정리되기 쉽습니다. 그만큼 물질보다는 시간과 마음의 여유에 더 가치를 두게 되는 구조예요.";
          break;
        case "관성":
          middle =
            "관성 기능이 공망이면, 나이가 들수록 사회적 역할이나 직함에서 한 발 물러나, 규칙과 책임에서 자유로워지는 흐름이 강하게 나타날 수 있어요. 말년에는 '해야 한다'보다 '어떻게 살고 싶은가'가 더 중요해지는 타입입니다.";
          break;
        case "인성":
          middle =
            "인성 기능이 공망이면, 말년에 혼자 있는 시간이 많아지거나 조용한 시간을 더 선호하게 될 수 있어요. 그 고요함이 오히려 사색과 내적인 성장을 깊게 만드는 기반이 되기도 합니다.";
          break;
        case "비겁":
          middle =
            "비겁 기능이 공망이면, 말년에 인간관계가 단출하게 정리되기 쉽습니다. 대신 소수의 관계에 에너지를 쓰면서, 내 사람 몇 명과 깊이 있는 시간을 보내는 쪽으로 삶이 정리되는 구조예요.";
          break;
        default:
          middle =
            "시지가 공망이면, 자녀와의 물리적 거리나 말년의 생활 패턴에서 다소 고독을 느낄 수 있어요. 대신 세속적인 기대에서 한 발 떨어져, 내 페이스대로 조용히 삶을 정리할 수 있는 자유가 함께 주어지는 구조이기도 합니다.";
      }
      parts.push(
        "시주는 자녀·말년·개인 시간과 연결되는 자리예요. " + middle
      );
    } else {
      let middle = "";
      switch (hourGroup) {
        case "식상":
          middle =
            "식상 공망이 해공된 구조라, 자녀와의 관계가 완전히 끊기기보다는 각자의 삶을 존중하면서도 필요한 순간에는 가까워지는 형태로 유지되기 쉽습니다.";
          break;
        case "재성":
          middle =
            "재성 공망이 해소되어, 말년의 재정이 극단적으로 비거나 넘치기보다는, 적당한 수준에서 유지되는 흐름으로 정리되기 좋습니다.";
          break;
        case "관성":
          middle =
            "관성 공망이 해공된 형태라, 말년에 사회적 역할에서 완전히 이탈하지는 않으면서도, 이전보다 훨씬 가벼운 책임감으로 자신의 시간을 구성할 수 있습니다.";
          break;
        case "인성":
          middle =
            "인성 공망이 해공되어, 혼자 있는 시간과 누군가와 함께하는 시간이 무게를 나눠 가지는 쪽으로 균형을 잡기 쉽습니다.";
          break;
        case "비겁":
          middle =
            "비겁 공망이 해공된 구조라, 관계를 과도하게 넓히기보다는, 오래 이어질 사람들과의 인연만 남기는 식으로 말년의 인간관계가 정리되기 쉽습니다.";
          break;
        default:
          middle =
            "시지 공망이 해공되어, 자녀·노년과 관련된 영역이 완전히 비워지기보다는 '적당히 거리를 둔 편안한 관계' 쪽으로 정리되기 쉽습니다.";
      }
      parts.push(
        "시주는 자녀·말년·개인 시간과 연결되는 자리예요. " + middle
      );
    }

    const intro = parts[0] ?? "";
    const detail = parts.slice(1);
    const closing =
      "결국 공망은 완전한 결핍이라기보다, 그 영역에서 모든 것을 꽉 채우려 하지 않아도 되는 삶의 여백에 가깝습니다. 어디에 힘을 빼고 어디에 더 써야 할지를 알아차릴수록, 같은 공망이 점점 더 전략적인 선택지로 변해 가게 돼요.";

    const paragraphs = [intro, ...detail, closing].filter(
      (p) => p && p.trim().length > 0
    );
    return paragraphs.join("\n\n");
  }

  // 공감 톤이 아니거나 일간 정보가 없을 때는 기존 요약 유지 (궁 중심)

  // 년지
  if (yearState === "none") {
    parts.push(
      "년지 쪽은 조상·부모 기반이 비교적 안정적으로 작동하는 편이라, 뿌리 자체가 크게 흔들리는 그림은 아니에요."
    );
  } else if (yearState === "full") {
    parts.push(
      "년지가 공망에 걸려 있어서, 어린 시절부터 집안이나 부모의 틀에 기대기보다는 스스로 길을 만들어 온 느낌이 강할 수 있어요. 덕분에 '내 힘으로 여기까지 왔다'는 자존감이 크게 자라기 좋은 구조입니다."
    );
  } else {
    parts.push(
      "년지에 공망 기운이 있지만 합·충으로 어느 정도 해소되어, 실제로는 조상·부모와의 인연이 완전히 끊기기보다는 적당한 거리감 속에서 스스로 서는 쪽으로 힘이 씁니다."
    );
  }

  // 월지
  if (monthState === "none") {
    parts.push(
      "월지에는 공망이 강하게 걸려 있지 않아, 직장·사회생활의 기본 틀은 비교적 안정적으로 잡히는 편이에요."
    );
  } else if (monthState === "full") {
    parts.push(
      "월지가 공망이면, 청년기와 사회 초반에 기반을 잡기까지 시행착오가 많을 수 있어요. 다만 이 과정에서 '어디에 오래 머물러야 하는지'를 더 정확히 알게 되기 때문에, 한 번 자리를 잡으면 쉽게 무너지지 않는 장점이 생깁니다."
    );
  } else {
    parts.push(
      "월지 공망이 합·충으로 어느 정도 풀려 있어서, 초반에는 자리 잡는 과정이 다소 지연되더라도 결국은 자신에게 맞는 환경을 찾아가는 흐름으로 정리되기 쉽습니다."
    );
  }

  // 시지
  if (hourState === "none") {
    parts.push(
      "시지에는 공망이 두드러지지 않아, 자녀 인연과 노년의 기반이 비교적 안정적으로 이어질 가능성이 큽니다."
    );
  } else if (hourState === "full") {
    parts.push(
      "시지가 공망이면, 자녀와의 물리적 거리나 말년의 생활 패턴에서 다소 고독을 느낄 수 있어요. 대신 세속적인 기대에서 한 발 떨어져, 내 페이스대로 조용히 삶을 정리할 수 있는 자유가 함께 주어지는 구조이기도 합니다."
    );
  } else {
    parts.push(
      "시지 공망이 해공되어, 자녀·노년과 관련된 영역이 완전히 비워지기보다는 '적당히 거리를 둔 편안한 관계' 쪽으로 정리되기 쉽습니다."
    );
  }

  const intro = parts[0] ?? "";
  const body = parts.slice(1).join(" ");
  return [intro, body].filter((p) => p && p.trim().length > 0).join("\n\n");
}


