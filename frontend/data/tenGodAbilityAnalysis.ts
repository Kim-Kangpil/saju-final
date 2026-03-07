/**
 * 십성으로 보는 주요 능력 — 십신(육친) 심화, 현실적 능력·발현·활용.
 * 이론: backend/logic/theories/사주이론(오행, 육친과 십신).txt
 * 2~3개 또는 그 이상 있는 육친 위주로, 현실에서 구체적으로 어떤 능력으로 드러나고 어떻게 쓰면 좋은지 ~600자.
 */

export type TenGodAbilityToneKey = "empathy" | "reality" | "fun";

type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";

const STEM_META: Record<string, { el: Element; pol: Polarity }> = {
  甲: { el: "wood", pol: "yang" }, 乙: { el: "wood", pol: "yin" },
  丙: { el: "fire", pol: "yang" }, 丁: { el: "fire", pol: "yin" },
  戊: { el: "earth", pol: "yang" }, 己: { el: "earth", pol: "yin" },
  庚: { el: "metal", pol: "yang" }, 辛: { el: "metal", pol: "yin" },
  壬: { el: "water", pol: "yang" }, 癸: { el: "water", pol: "yin" },
};

/** 지지 정기(本气) — 이론: 사주이론(지지).txt */
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

export interface SajuPillarsForTenGod {
  year: { cheongan: { hanja: string }; jiji: { hanja: string } };
  month: { cheongan: { hanja: string }; jiji: { hanja: string } };
  day: { cheongan: { hanja: string }; jiji: { hanja: string } };
  hour: { cheongan: { hanja: string }; jiji: { hanja: string } };
}

/** 일간 제외 7자리(연간, 연지 본기, 월간, 월지 본기, 일지 본기, 시간, 시지 본기)에서 십신 개수 집계 */
function countTenGods(pillars: SajuPillarsForTenGod): Record<string, number> {
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
  // 일간(day stem) 제외: 연간(0), 연지(1), 월간(2), 월지(3), 일간(4 스킵), 일지(5), 시간(6), 시지(7)
  for (let i = 0; i < positions.length; i++) {
    if (i === 4) continue; // day stem = 나 자신, 십신 없음
    const tg = tenGodFromStems(dayStem, positions[i]);
    if (tg && count[tg] !== undefined) count[tg]++;
  }
  return count;
}

/** 십신별 현실 능력·발현·활용 문단 (2개 이상 있을 때 사용). 이론: 사주이론(오행, 육친과 십신).txt 반영 */
const TEN_GOD_ABILITY_BODY: Record<string, Record<TenGodAbilityToneKey, string>> = {
  비견: {
    empathy: "스스로 결단하고 자기 영역을 지키는 힘이 있어요. 현실에서는 <strong>독립적으로 일을 끌어가거나</strong>, 동료와 어깨를 나란히 하며 목표를 이루는 능력으로 드러납니다. 혼자서도 책임지고 끝까지 해내는 편이라, 프리랜서·자영업·팀 내에서 자기 역할을 분명히 하는 일에 잘 맞아요. 다만 재물은 쓰는 쪽으로 기울기 쉬우니, 작은 것부터 모으는 습관을 두면 좋아요.",
    reality: "자아·동료(비견) 기운이 강합니다. 독립적 결단력과 동료와의 협업에서 강점이 발현됩니다. 자기 역할이 분명한 업무·자영·프리랜서에 적합하며, 재물은 소비 성향이 있으므로 계획적 저축이 유리합니다.",
    fun: "네가 정한 대로 밀고 나가는 힘이 있어. 동료랑 같이해도 흔들 안 돼. 혼자서도 맡은 거 끝까지 해내서 자기 페이스로 움직이는 일이 잘 맞아. 돈은 쓰는 쪽으로 가니까 조금씩 모으는 거 습관 들려.",
  },
  겁재: {
    empathy: "경쟁과 도전 속에서 오히려 에너지가 올라오는 힘이 있어요. 현실에서는 <strong>승부가 걸린 상황에서 집중력과 추진력</strong>이 크게 발현됩니다. 영업·스포츠·실적이 있는 직무처럼 ‘이기고 싶다’는 마음이 동력이 되는 일에 잘 맞아요. 한 번 꽂히면 끝까지 밀어붙이는 편이에요. 다만 지칠 때는 쉬는 걸 미루지 말고, 식신 기운처럼 말·표현으로 풀어내는 시간을 갖으면 좋아요.",
    reality: "겁재 기운이 강합니다. 경쟁·도전 상황에서 추진력과 승부욕이 강점으로 작용합니다. 영업·경쟁·실적 직무에 적합하며, 휴식과 표현 활동으로 조절하는 것이 유리합니다.",
    fun: "경쟁할 때 제일 잘해. 승부 걸리면 집중돼. 영업이랑 스포츠처럼 이기고 싶은 마음이 드는 일이 딱이야. 한 번 꽂히면 밀어붙이는 타입. 지칠 땐 말이나 표현으로 풀어내면 좋아.",
  },
  식신: {
    empathy: "말과 재능을 밖으로 꺼내는 힘이 있어요. 현실에서는 <strong>생각과 욕구를 말·글로 잘 전달</strong>하고, 말하기·글쓰기·창작·강의처럼 ‘밖으로 꺼내는’ 활동에서 능력이 드러납니다. 편안하게 설득하고 분위기를 만드는 쪽이 잘 맞아요. 의식주나 재능을 사람들에게 나누는 일, 요리·콘텐츠·교육이 잘 어울려요. 다만 말이 행동보다 너무 앞서지 않도록, 듣는 시간과 끝까지 마무리하는 습관을 두면 좋아요.",
    reality: "식신 기운이 강합니다. 표현력·언어능력·재능 발휘가 강점입니다. 말·글·창작·강의·요식업 등에 적합하며, 실행과 마무리 비중을 늘리면 균형에 유리합니다.",
    fun: "말이랑 재능 꺼내는 거 잘해. 말하기·글쓰기·창작·강의 같은 거 하면 능력 잘 나와. 말만 앞세우지 말고 듣고 끝까지 하는 거 챙기면 좋아.",
  },
  상관: {
    empathy: "틀을 넘어서 새로 만드는 힘이 있어요. 현실에서는 <strong>기존 방식에 도전하고 새로운 규칙이나 아이디어</strong>를 제안하는 능력으로 드러납니다. 기획·연구·스타트업·개혁이 있는 일에서 두각을 나타내요. 날카로운 말솜씨와 설득력이 있지만, ‘옳은 말에 재수가 없다’는 말을 듣지 않으려면 말 한 번 더 생각하고, 조직의 틀도 조금은 인정하는 여유가 있으면 좋아요.",
    reality: "상관 기운이 강합니다. 혁신·기획·비판적 사고가 강점입니다. 스타트업·연구·기획·컨설팅에 적합하며, 말과 조직 적응의 균형이 유리합니다.",
    fun: "틀 깨고 새로 만드는 거 잘해. 기획·연구·스타트업 같은 데서 빛나. 말이 날카로우니까 한 번 더 생각하고, 조직 틀도 조금 인정하면 좋아.",
  },
  편재: {
    empathy: "기회를 잡고 움직이는 힘이 있어요. 현실에서는 <strong>사람과 상황을 빠르게 읽고</strong>, 거래·소개·유통·사업처럼 ‘움직이면서 기회를 포착’하는 능력으로 드러납니다. 한자리에 있기보다 여러 곳을 오가며 일하는 쪽이 잘 맞아요. 호탕하고 유머가 있어 사람들이 모이지만, 돈은 굴려야 들어온다는 생각에 투기나 한탕주의로 빠지지 않도록, 일정 부분만 안전하게 모으는 습관이 좋아요.",
    reality: "편재 기운이 강합니다. 기회 포착·사람·거래 감각이 강점입니다. 영업·사업·유통에 적합하며, 투기·과다 지출을 줄이고 안정 자산 비중을 두는 것이 유리합니다.",
    fun: "기회 잡고 움직이는 거 잘해. 사람·상황 빠르게 읽고 거래·사업 쪽에서 능력 나와. 돈 굴리는 걸 좋아하는데, 한탕주의 말고 조금씩 모으는 거도 해.",
  },
  정재: {
    empathy: "쌓고 정리하는 힘이 있어요. 현실에서는 <strong>돈과 결과를 꾸준히 챙기고</strong>, 정해진 틀 안에서 성실히 마무리하는 능력으로 드러납니다. 회계·재무·관리·안정 수입이 있는 일에 잘 맞아요. 꼼꼼하고 신용을 중시해서 주변 신뢰를 받기 쉽지만, 너무 보수적으로만 움직이면 기회를 놓칠 수 있어요. 가끔은 가능성을 열어두고 작은 도전을 해 보는 것도 좋아요.",
    reality: "정재 기운이 강합니다. 재물·관리·성실성이 강점입니다. 회계·재무·관리직에 적합하며, 소폭의 도전과 유연성이 균형에 유리합니다.",
    fun: "쌓고 정리하는 거 잘해. 돈·결과 꾸준히 챙기고 회계·재무·관리 쪽 잘 맞아. 가끔 작은 도전도 해 보면 좋아.",
  },
  편관: {
    empathy: "사람을 이끄는 카리스마와 통제력이 있어요. 현실에서는 <strong>압박이나 위기가 있을 때 오히려 집중</strong>하고, 경영·관리·결정권이 있는 자리에서 능력이 잘 드러납니다. 군인·경찰·운동·엄격한 조직에서 두각을 나타내기도 해요. 다만 혼자만 짊어지면 부담이 커지므로, 역할을 나누고 스스로에게도 여유를 주는 게 좋아요.",
    reality: "편관 기운이 강합니다. 리더십·의사결정·압박 대응이 강점입니다. 경영·관리·특수 조직에 적합하며, 역할 분담과 여유가 유리합니다.",
    fun: "이끄는 거 잘해. 압박 있을 때 오히려 잘해. 경영·관리·결정하는 자리가 맞아. 혼자 다 짊어지지 말고 나눠서 해.",
  },
  정관: {
    empathy: "규칙과 책임을 지키는 힘이 있어요. 현실에서는 <strong>맡은 역할을 끝까지 하고</strong>, 위계와 질서가 있는 조직에서 신뢰를 쌓는 능력으로 드러납니다. 공무원·대기업·공공·관리직에 잘 맞아요. 절차와 원칙을 중시해서 안정적이지만, 지나치면 융통성이 부족해 보일 수 있어요. 작은 것이라도 틀을 넘어보는 경험을 가끔 갖으면 좋아요.",
    reality: "정관 기운이 강합니다. 책임·규칙·조직 적응이 강점입니다. 공공·대기업·관리직에 적합하며, 소폭의 유연성이 균형에 유리합니다.",
    fun: "규칙·책임 지키는 거 잘해. 공무원·대기업·조직 생활 잘 맞아. 가끔 틀 넘어보는 경험도 해 보면 좋아.",
  },
  편인: {
    empathy: "깊이 생각하고 남다른 시각을 갖는 힘이 있어요. 현실에서는 <strong>통찰·독창성·전문 분야 깊이</strong>가 능력으로 드러나요. 연구·철학·예술·의료·프리랜서처럼 자기만의 영역을 파는 일에 잘 맞아요. 영감이 올 때 집중해서 큰 결과를 내는 편이에요. 다만 생각만 하다가 실행을 미루지 않도록, 작은 것부터 행동에 옮기는 습관이 좋아요.",
    reality: "편인 기운이 강합니다. 통찰·독창성·전문성이 강점입니다. 연구·예술·의료·프리랜서에 적합하며, 실행 비중을 늘리면 유리합니다.",
    fun: "깊이 생각하고 남다른 시각 갖는 거 잘해. 연구·예술·전문 분야에서 능력 나와. 생각만 하지 말고 작은 거부터 해 보면 좋아.",
  },
  정인: {
    empathy: "배우고 나누는 힘이 있어요. 현실에서는 <strong>지식을 쌓고 전달</strong>하는 능력으로 드러납니다. 교육·연구·강의·자격·문서를 다루는 일에 잘 맞아요. 인내심이 있어서 꾸준히 공부하고 자격을 쌓는 편이고, 그만큼 전문성이 인정받기 쉬워요. 다만 준비만 하다가 실행 시기를 놓치지 않도록, 작은 것부터 행동에 옮겨 보시면 좋아요.",
    reality: "정인 기운이 강합니다. 학습·교육·인내가 강점입니다. 교육·연구·자격·문서 직무에 적합하며, 실행 비중을 의식하면 균형에 유리합니다.",
    fun: "배우고 가르치는 거 잘해. 교육·연구·자격 쪽에서 능력 나와. 준비만 하지 말고 작은 거부터 해 보면 좋아.",
  },
};

/**
 * 십성으로 보는 주요 능력 문단. 2개 이상 있는 십신 위주로, 현실적 능력·발현·활용 ~600자.
 */
export function getTenGodAbilityParagraph(
  pillars: SajuPillarsForTenGod,
  tone: TenGodAbilityToneKey
): string {
  const count = countTenGods(pillars);
  const order: string[] = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"];
  const candidates = order.filter((tg) => (count[tg] ?? 0) >= 2);
  const sorted = [...candidates].sort((a, b) => (count[b] ?? 0) - (count[a] ?? 0));
  const main: string[] = [];
  for (const tg of sorted.slice(0, 2)) {
    const block = TEN_GOD_ABILITY_BODY[tg]?.[tone];
    if (block) main.push(block);
  }

  if (main.length === 0) {
    if (tone === "empathy") return "당신 사주에서 두 개 이상 겹쳐 나오는 십성이 뚜렷하지 않아요. 여러 기운이 고르게 섞여 있어, 상황에 맞게 다양한 능력을 쓰기 좋은 구조예요. 관심 있는 분야를 하나씩 경험해 보시면 그중에서도 잘 맞는 능력이 드러날 거예요.";
    if (tone === "reality") return "십신이 고르게 분포하여 특정 영역이 두드러지지 않습니다. 상황에 따른 다양한 역량 발휘가 가능한 구조입니다.";
    return "십성이 고르게 있어서 딱 하나가 튀진 않아. 여러 거 해 보면서 잘 맞는 거 찾으면 돼.";
  }

  const intro =
    tone === "empathy"
      ? "당신 사주에서 두 개 이상 나오는 십성(육친)을 기준으로, 현실에서 어떤 능력으로 드러나고 어떻게 쓰면 좋은지 정리해 볼게요."
      : tone === "reality"
        ? "2개 이상 분포한 십신 기준으로, 현실 발현 능력과 활용 방향을 정리합니다."
        : "두 개 이상 있는 십성 기준으로, 현실에서 어떤 능력으로 나오고 어떻게 쓰면 좋은지 볼게.";

  return [intro, ...main].join("\n\n").trim();
}
