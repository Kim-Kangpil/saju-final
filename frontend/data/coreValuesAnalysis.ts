// frontend/data/coreValuesAnalysis.ts
// 삶의 핵심적인 가치관과 지향점 — 월지(月支) + 일간 기준 십신, 3가지 말투(empathy, reality, fun)

export type CoreValuesToneKey = "empathy" | "reality" | "fun";

export interface MonthBranchArchetype {
  name: string;
  keywords: string;
}

/** 12월지(지지)별 이름·키워드 — 백엔드 _month_branch_archetypes와 동일 */
export const MONTH_BRANCH_ARCHETYPES: Record<string, MonthBranchArchetype> = {
  "子": { name: "子(자수)", keywords: "정서적 교류, 친밀감, 유연한 생존감각, 관계 속에서 흐르며 배우는 스타일" },
  "丑": { name: "丑(축토)", keywords: "안정, 현실감각, 신중한 의사결정, 책임을 끝까지 지는 끈기" },
  "寅": { name: "寅(인목)", keywords: "개척, 도전, 선구자 에너지, 앞서 나가며 판을 여는 추진력" },
  "卯": { name: "卯(묘목)", keywords: "관계와 조화, 미감과 센스, 균형감각, 사람 사이의 간격을 맞추는 능력" },
  "辰": { name: "辰(진토)", keywords: "조정과 중재, 포괄적 사고, 리스크 관리, 판 전체를 보는 감각" },
  "巳": { name: "巳(사화)", keywords: "욕망과 성취, 분석력, 깊이 파고드는 집중, 목표 지향적 열정" },
  "午": { name: "午(오화)", keywords: "표현력, 카리스마, 존재감, 스포트라이트 안에서 빛나는 에너지" },
  "未": { name: "未(미토)", keywords: "돌봄과 배려, 섬세한 감수성, 주변을 포근히 감싸는 따뜻함" },
  "申": { name: "申(신금)", keywords: "분석, 전략, 커리어 의식, 효율과 성과를 중시하는 사고방식" },
  "酉": { name: "酉(유금)", keywords: "완성, 기준, 디테일, 정돈과 정리, 퀄리티에 대한 높은 기준" },
  "戌": { name: "戌(술토)", keywords: "헌신, 의리, 정의감, 신념을 지키기 위한 책임과 투지" },
  "亥": { name: "亥(해수)", keywords: "이상과 영감, 깊은 감성, 보이지 않는 것을 신뢰하는 직관" },
};

/** 말투별 문단 템플릿 — {{branchName}}, {{keywords}}, {{tenGod}}, {{tenGodMeaning}} 치환 */
const CORE_VALUES_TEMPLATE: Record<CoreValuesToneKey, string> = {
  empathy:
    "당신의 삶의 엔진은 월지 {{branchName}}에서 강하게 드러납니다. 이 자리는 타고난 기질이 '무엇을 우선순위로 두고 살아가느냐'를 보여주는 자리예요. {{branchName}}는(은) {{keywords}} 쪽으로 자연스럽게 끌리게 만듭니다. 일간 기준으로 월지는 '{{tenGod}}'에 해당하는 자리라, {{tenGodMeaning}}을(를) 삶의 핵심 가치로 두고 길을 선택하는 경향이 있습니다. 중요한 선택의 순간마다, 이 가치가 지켜지는지, 나다운 마음이 살아있는지를 기준으로 방향을 정하는 사람이에요.",
  reality:
    "당신의 삶의 엔진은 월지 {{branchName}}에서 강하게 드러납니다. 이 자리는 타고난 기질이 '무엇을 우선순위로 두고 살아가느냐'를 보여주는 자리입니다. {{branchName}}는(은) {{keywords}} 쪽으로 자연스럽게 끌리게 만듭니다. 일간 기준으로 월지는 '{{tenGod}}'에 해당하는 자리라, {{tenGodMeaning}}을(를) 삶의 핵심 가치로 두고 경로를 선택하는 경향이 있습니다. 중요한 선택 시점에는, 해당 가치가 유지되는지, 자기 정체성이 살아있는지를 기준으로 방향을 정하는 구조입니다.",
  fun:
    "네 삶의 엔진은 월지 {{branchName}}에서 확 드러나. 이 자리가 '뭘 우선으로 살아갈지' 보여주는 자리잖아. {{branchName}}는(은) {{keywords}} 쪽으로 자연스럽게 끌려. 일간 기준으로 월지는 '{{tenGod}}'에 해당하는 자리라서, {{tenGodMeaning}}을(를) 삶의 핵심 가치로 두고 길 고르는 경향이 있어. 중요한 선택할 때마다, 이 가치 지켜지는지, 내 마음이 살아있는지 보고 방향 정하는 타입이야.",
};

/** 십신별 핵심 가치 한 줄 — 3가지 말투 */
export const TEN_GOD_CORE_MEANINGS: Record<string, Record<CoreValuesToneKey, string>> = {
  비견: {
    empathy: "나와 비슷한 사람, 동료와 친구를 통해 자신을 확인하는 관계 중심형",
    reality: "동료·친구·동료성과 함께 설계하는 관계 중심 구조",
    fun: "나랑 닮은 사람, 친구랑 같이 가는 걸 삶의 축으로 두는 타입",
  },
  겁재: {
    empathy: "경쟁과 자극 속에서 성장하는 타입, 한 번 꽂히면 밀어붙이는 추진력",
    reality: "경쟁과 자극 속에서 한계를 넘어서려는 태도",
    fun: "경쟁에서 자극 받고, 한 번 꽂히면 밀어붙이는 스타일",
  },
  식신: {
    empathy: "꾸준함과 생산성을 중시하고, 몸으로 실천하며 결과를 만들어내는 스타일",
    reality: "꾸준한 생산성과 성실함, 몸으로 쌓아 올린 결과에 대한 자부심",
    fun: "꾸준히 생산하고, 몸으로 실천해서 결과 만드는 타입",
  },
  상관: {
    empathy: "틀을 깨고 새로움을 시도하며, 재능과 표현력으로 길을 여는 혁신형",
    reality: "틀을 깨고 새로운 규칙을 만드는 창의성과 표현력",
    fun: "틀 깨고 새로 시도하고, 재능·표현으로 길 여는 타입",
  },
  편재: {
    empathy: "흐르는 기회와 인연, 돈과 정보의 흐름 속에서 기민하게 움직이는 실전형",
    reality: "기회와 사람·돈의 흐름을 읽으며 판을 키우는 감각",
    fun: "기회랑 인연 흐름 타고 기민하게 움직이는 실전형",
  },
  정재: {
    empathy: "안정적인 기반과 책임, 묵직한 현실 감각을 바탕으로 삶을 설계하는 계획형",
    reality: "안정적 기반, 책임과 꾸준함, 가족과 생활의 안전을 지키려는 가치",
    fun: "안정이랑 책임, 묵직한 현실 감각으로 삶 설계하는 타입",
  },
  편관: {
    empathy: "도전과 압박을 통해 단단해지는 타입, 시험·경쟁·리더십 상황에서 성장",
    reality: "압박과 도전을 버티며 성장하려는 투지",
    fun: "도전이랑 압박 받을수록 단단해지는 성장형",
  },
  정관: {
    empathy: "명예와 신뢰, 규칙과 기준을 중시하며, 깔끔한 이미지와 책임감을 추구",
    reality: "신뢰와 명예, 규칙과 기준을 중시하며 사회적 역할을 지키려는 책임감",
    fun: "명예·신뢰·규칙 중시하고, 깔끔한 이미지랑 책임감 추구하는 타입",
  },
  편인: {
    empathy: "사고와 창의, 깊이 있는 이해와 통찰을 통해 자신만의 길을 찾는 연구자형",
    reality: "깊은 사고와 통찰, 남들이 보지 못한 면을 이해하려는 탐구심",
    fun: "깊이 생각하고 통찰로 자기만의 길 찾는 연구자형",
  },
  정인: {
    empathy: "배움과 자격, 신뢰받는 역할을 통해 삶의 안정과 자부심을 쌓는 타입",
    reality: "배움과 자격, 인정받는 전문성, 조용하지만 단단한 자존감",
    fun: "배움이랑 자격, 신뢰받는 역할로 안정·자부심 쌓는 타입",
  },
};

const DEFAULT_TEN_GOD_MEANING: Record<CoreValuesToneKey, string> = {
  empathy: "자신이 중요하게 여기는 사람·일·가치에 오래 애정을 두고, 그 안에서 정체성을 찾아가는 경향",
  reality: "자신이 중요하게 여기는 사람·일·가치에 오래 애정을 두고, 그 안에서 정체성을 찾아가는 경향",
  fun: "중요하게 여기는 사람·일·가치에 오래 애정 두고, 그 안에서 정체성 찾아가는 스타일",
};

export interface GetCoreValuesParams {
  monthBranchHanja: string;
  dayStemHanja: string;
  tone: CoreValuesToneKey;
  getBranchMainStem: (branch: string) => string | null;
  getTenGod: (dayStem: string, targetStem: string) => string;
}

/**
 * 월지 + 일간 기준 십신으로 '삶의 핵심 가치관과 지향점' 문단 1개 반환.
 * add 페이지에서 branchMainStem, tenGod 함수를 넘겨 호출.
 */
export function getCoreValuesParagraph(params: GetCoreValuesParams): string {
  const { monthBranchHanja, dayStemHanja, tone, getBranchMainStem, getTenGod } = params;
  const branchInfo = MONTH_BRANCH_ARCHETYPES[monthBranchHanja];
  const branchName = branchInfo?.name ?? (monthBranchHanja || "월지");
  const keywords = branchInfo?.keywords ?? "자기만의 방식으로 삶의 방향을 만들어 가는 기질";
  const monthStem = getBranchMainStem(monthBranchHanja);
  const tenGodName = monthStem ? getTenGod(dayStemHanja, monthStem) : "";
  const tenGodRow = tenGodName ? TEN_GOD_CORE_MEANINGS[tenGodName] : null;
  const tenGodMeaning = tenGodRow?.[tone] ?? DEFAULT_TEN_GOD_MEANING[tone];

  const template = CORE_VALUES_TEMPLATE[tone];
  return template
    .replace(/\{\{branchName\}\}/g, branchName)
    .replace(/\{\{keywords\}\}/g, keywords)
    .replace(/\{\{tenGod\}\}/g, tenGodName || "—")
    .replace(/\{\{tenGodMeaning\}\}/g, tenGodMeaning);
}
