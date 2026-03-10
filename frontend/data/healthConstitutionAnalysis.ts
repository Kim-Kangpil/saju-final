// frontend/data/healthConstitutionAnalysis.ts
//
// 체질적인 건강 기운 분석
// - 오행 분포 기반 장부 강약
// - 신강/신약 (득령·득지·득세) 기반 기초 체력
// - 월지 체질 환경 + 일지 안정성
// - 인성 기반 회복력
// - 종합 체질 유형 (과열 / 한냉 / 허약 / 균형)
//
// 톤: empathy / reality / fun (말투만 약간 다르게)

export type HealthToneKey = "empathy" | "reality" | "fun";

// 오행
type Element = "wood" | "fire" | "earth" | "metal" | "water";

// 일간 기준 십신 함수 타입 (add/page.tsx에서 넘겨주는 tenGod 재사용)
export type TenGodFn = (dayStem: string, targetStem: string) => string;

// 분석 입력 파라미터
export interface HealthAnalysisParams {
  dayStem: string; // 일간
  stems: [string, string, string, string]; // [년간, 월간, 일간, 시간]
  branches: [string, string, string, string]; // [년지, 월지, 일지, 시지]
  tone: HealthToneKey;
  tenGod: TenGodFn;
}

// 내부: 지지 본기(통근) 매핑
const BRANCH_MAIN_STEM: Record<string, string> = {
  "子": "癸",
  "丑": "己",
  "寅": "甲",
  "卯": "乙",
  "辰": "戊",
  "巳": "丙",
  "午": "丁",
  "未": "己",
  "申": "庚",
  "酉": "辛",
  "戌": "戊",
  "亥": "壬",
};

// 간지 → 오행
function elementOfStem(stem: string): Element | null {
  const m: Record<string, Element> = {
    甲: "wood",
    乙: "wood",
    丙: "fire",
    丁: "fire",
    戊: "earth",
    己: "earth",
    庚: "metal",
    辛: "metal",
    壬: "water",
    癸: "water",
  };
  return m[stem] ?? null;
}

function elementOfBranch(branch: string): Element | null {
  // 지지 본기의 오행 기준
  const main = BRANCH_MAIN_STEM[branch];
  if (!main) return null;
  return elementOfStem(main);
}

// 오행 카운트 (천간 4 + 지지 4 = 8글자)
function countElementsFromPillars(
  stems: [string, string, string, string],
  branches: [string, string, string, string]
): Record<Element, number> {
  const count: Record<Element, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
  stems.forEach((s) => {
    const el = elementOfStem(s?.[0] ?? "");
    if (el) count[el] += 1;
  });
  branches.forEach((b) => {
    const el = elementOfBranch(b?.[0] ?? "");
    if (el) count[el] += 1;
  });
  return count;
}

// 오행 → 장부 한국어 레이블
const ELEMENT_ORGANS: Record<Element, string> = {
  wood: "간·담·눈·신경·근육",
  fire: "심장·혈관·소장·혀·얼굴",
  earth: "위장·비장·췌장·입·근육",
  metal: "폐·대장·호흡기·피부·코",
  water: "신장·방광·생식기·뼈·척추·뇌",
};

const ELEMENT_KO: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

// 장부 상태 한 줄 요약
function elementStatus(el: Element, n: number, tone: HealthToneKey): string {
  const name = ELEMENT_KO[el];
  const target = ELEMENT_ORGANS[el];

  if (n === 0) {
    return tone === "fun"
      ? `${name} 기운이 거의 없어서 ${target} 쪽은 타고난 약한 편으로 봐도 돼.`
      : `${name} 기운이 거의 없어 ${target} 쪽은 타고난 약한 편으로 볼 수 있어요.`;
  }
  if (n === 1) {
    return tone === "fun"
      ? `${name} 기운이 약해서 ${target} 쪽으로 피로가 잘 몰리는 타입이야.`
      : `${name} 기운이 약한 편이라 ${target} 쪽으로 피로가 잘 몰리는 타입이에요.`;
  }
  if (n === 2) {
    return tone === "fun"
      ? `${name} 기운은 무난하게 균형에 가까운 편이야.`
      : `${name} 기운은 비교적 균형에 가까운 편이에요.`;
  }
  if (n === 3) {
    return tone === "fun"
      ? `${name} 기운이 강해서 ${target} 쪽은 에너지가 잘 도는 대신, 무리하면 과부하가 오기 쉬운 자리야.`
      : `${name} 기운이 강한 편이라 ${target} 쪽은 에너지가 잘 도는 대신, 무리하면 과부하가 오기 쉬운 자리예요.`;
  }
  // 4개 이상
  return tone === "fun"
    ? `${name} 기운이 과하게 몰려 있어서 ${target}는 염증·과열·긴장 같은 과부하 신호를 조심해 주는 게 좋아.`
    : `${name} 기운이 과하게 몰려 있어 ${target}는 염증·과열·긴장 같은 과부하 신호를 조심해 주는 것이 좋아요.`;
}

// 십신 계열 체크
function isPlusTenGod(tg: string): boolean {
  return tg === "비견" || tg === "겁재" || tg === "정인" || tg === "편인";
}
function isMinusTenGod(tg: string): boolean {
  return (
    tg === "식신" ||
    tg === "상관" ||
    tg === "정재" ||
    tg === "편재" ||
    tg === "정관" ||
    tg === "편관"
  );
}

// 득령·득지·득세 판별
function computeDeukRyeongJiSe(
  dayStem: string,
  stems: [string, string, string, string],
  branches: [string, string, string, string],
  tenGod: TenGodFn
): { deukRyeong: boolean; deukJi: boolean; deukSe: boolean } {
  const [yearStem, monthStem, dayStem2, hourStem] = stems;
  const [yearBranch, monthBranch, dayBranch, hourBranch] = branches;

  const monthMain = BRANCH_MAIN_STEM[monthBranch] ?? "";
  const dayMain = BRANCH_MAIN_STEM[dayBranch] ?? "";

  const monthTg = monthMain ? tenGod(dayStem, monthMain) : "";
  const dayTg = dayMain ? tenGod(dayStem, dayMain) : "";

  const deukRyeong = isPlusTenGod(monthTg);
  const deukJi = isPlusTenGod(dayTg);

  // 득세: 나머지 5자리(연간, 연지, 월간, 시간, 시지)의 십신 분포
  const others: string[] = [];
  // 연간
  if (yearStem) others.push(tenGod(dayStem, yearStem));
  // 연지
  if (yearBranch && BRANCH_MAIN_STEM[yearBranch]) {
    others.push(tenGod(dayStem, BRANCH_MAIN_STEM[yearBranch]));
  }
  // 월간
  if (monthStem) others.push(tenGod(dayStem, monthStem));
  // 시간
  if (hourStem) others.push(tenGod(dayStem, hourStem));
  // 시지
  if (hourBranch && BRANCH_MAIN_STEM[hourBranch]) {
    others.push(tenGod(dayStem, BRANCH_MAIN_STEM[hourBranch]));
  }

  let plus = 0;
  let minus = 0;
  for (const tg of others) {
    if (isPlusTenGod(tg)) plus++;
    if (isMinusTenGod(tg)) minus++;
  }
  const deukSe = plus >= minus; // 인성·비겁이 절반 이상이면 득세

  return { deukRyeong, deukJi, deukSe };
}

type ShinState = "극신약" | "신약" | "중화" | "신강";

function classifyShinState(deukRyeong: boolean, deukJi: boolean, deukSe: boolean): ShinState {
  if (deukRyeong && deukJi && deukSe) return "신강";
  if (deukRyeong && deukJi && !deukSe) return "신강";
  if (deukRyeong && !deukJi && deukSe) return "신강";
  if (!deukRyeong && !deukJi && !deukSe) return "극신약";
  if (!deukRyeong && deukJi && !deukSe) return "신약";
  if (!deukRyeong && !deukJi && deukSe) return "신약";
  return "중화";
}

// 인성 개수 (정인+편인)
function countInseong(
  dayStem: string,
  stems: [string, string, string, string],
  branches: [string, string, string, string],
  tenGod: TenGodFn
): { count: number; hasJeongIn: boolean; hasPyeonIn: boolean } {
  const [yearStem, monthStem, dayStem2, hourStem] = stems;
  const [yearBranch, monthBranch, dayBranch, hourBranch] = branches;
  const all: string[] = [];
  if (yearStem) all.push(tenGod(dayStem, yearStem));
  if (monthStem) all.push(tenGod(dayStem, monthStem));
  if (dayStem2) all.push(tenGod(dayStem, dayStem2));
  if (hourStem) all.push(tenGod(dayStem, hourStem));
  [yearBranch, monthBranch, dayBranch, hourBranch].forEach((b) => {
    const m = BRANCH_MAIN_STEM[b];
    if (m) all.push(tenGod(dayStem, m));
  });

  let cnt = 0;
  let hasJeongIn = false;
  let hasPyeonIn = false;
  for (const tg of all) {
    if (tg === "정인" || tg === "편인") cnt++;
    if (tg === "정인") hasJeongIn = true;
    if (tg === "편인") hasPyeonIn = true;
  }
  return { count: cnt, hasJeongIn, hasPyeonIn };
}

// 일지 충 체크 (간단 버전) – 건강 카드에서는 "중심이 얼마나 흔들리는지"만 본다.
const CHONG_PAIRS: Array<[string, string]> = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

function hasDayBranchChong(branches: [string, string, string, string]): boolean {
  const [yearBranch, monthBranch, dayBranch, hourBranch] = branches;
  const others = [yearBranch, monthBranch, hourBranch];
  for (const [a, b] of CHONG_PAIRS) {
    if (dayBranch === a && others.includes(b)) return true;
    if (dayBranch === b && others.includes(a)) return true;
  }
  return false;
}

// 월지 체질 환경 라벨
const MONTH_ENV_LABEL: Record<string, string> = {
  "子": "한냉 수 체질 (신장·방광·허리 쪽으로 냉기가 몰리기 쉬운 편)",
  "丑": "한습 토 체질 (위장·비장·발 쪽으로 냉기와 습기가 함께 오는 편)",
  "寅": "목 체질 (간·담·신경 쪽으로 긴장이 잘 몰리는 편)",
  "卯": "목 체질 (간·눈·근육 쪽으로 피로가 몰리기 쉬운 편)",
  "辰": "습토 체질 (위·췌장·피부 쪽으로 습기와 답답함이 쌓이기 쉬운 편)",
  "巳": "열 화 체질 (심장·혈압·구강 쪽으로 열이 잘 오르는 편)",
  "午": "열 화 체질 (심장·혈액·혀 쪽으로 열과 흥분이 잘 오르는 편)",
  "未": "건열 토 체질 (위장·비장·혈당 쪽으로 건조와 열이 함께 오는 편)",
  "申": "건조 금 체질 (폐·대장·피부 쪽으로 건조와 긴장이 몰리기 쉬운 편)",
  "酉": "건조 금 체질 (폐·기관지·코 쪽으로 건조와 알레르기가 잘 오는 편)",
  "戌": "건열 토 체질 (위장·피부·관절 쪽으로 염증성 부담이 생기기 쉬운 편)",
  "亥": "한냉 수 체질 (신장·생식·뼈 쪽으로 냉기가 오래 남는 편)",
};

// 종합 체질 유형
type ConstitutionType = "과열 체질" | "한냉 체질" | "허약 체질" | "균형 체질";

function classifyConstitutionType(
  counts: Record<Element, number>,
  shin: ShinState,
  inseongCount: number,
  dayChong: boolean,
  monthBranch: string
): ConstitutionType {
  const strongEl = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] as [Element, number];
  const weakEl = Object.entries(counts).sort((a, b) => a[1] - b[1])[0] as [Element, number];

  const hotMonth = ["巳", "午", "未"].includes(monthBranch);
  const coldMonth = ["亥", "子", "丑"].includes(monthBranch);

  // 과열 체질: 목/화 과다 + 신강 + 열 많은 계절
  if (
    (strongEl[0] === "wood" || strongEl[0] === "fire") &&
    strongEl[1] >= 3 &&
    (shin === "신강" || shin === "중화") &&
    hotMonth
  ) {
    return "과열 체질";
  }

  // 한냉 체질: 수/금 과다 + 목/화 부족 or 한냉 월지
  if (
    (strongEl[0] === "water" || strongEl[0] === "metal") &&
    (weakEl[0] === "fire" || weakEl[0] === "wood" || coldMonth)
  ) {
    return "한냉 체질";
  }

  // 허약 체질: 신약/극신약 + 인성 부족 + 일지 충
  if ((shin === "신약" || shin === "극신약") && inseongCount === 0 && dayChong) {
    return "허약 체질";
  }

  return "균형 체질";
}

// 신강/신약 건강 해석
function shinText(shin: ShinState, tone: HealthToneKey): string {
  if (shin === "신강") {
    return tone === "fun"
      ? "기본 체력과 회복력이 좋은 편이라, 병이 와도 갑자기 왔다가 잘 나아가는 패턴이 많아. 다만 에너지가 너무 강하면 특정 장부에 과부하가 걸리면서 염증·고혈압·두통처럼 '과열 신호'가 뜨기 쉬워서, 속도 조절이 중요해."
      : "기본 체력과 회복력이 좋은 편이라, 병이 와도 급성으로 왔다가 비교적 잘 회복되는 패턴이 많아요. 다만 에너지가 너무 강하면 특정 장부에 과부하가 걸리면서 염증·고혈압·두통처럼 '과열 신호'가 뜰 수 있어 속도 조절이 중요합니다.";
  }
  if (shin === "극신약") {
    return tone === "fun"
      ? "몸 에너지가 많이 약한 쪽에 가까워서, 무리하면 바로 체력 고갈과 면역 저하로 이어지기 쉬운 타입이야. 한 번에 많이 하기보다, 작은 루틴을 꾸준히 쌓는 쪽이 훨씬 잘 맞아."
      : "몸 에너지가 많이 약한 쪽에 가까워서, 무리하면 바로 체력 고갈과 면역 저하로 이어지기 쉬운 타입이에요. 한 번에 많은 것을 하기보다, 작은 루틴을 꾸준히 쌓는 쪽이 훨씬 잘 맞습니다.";
  }
  if (shin === "신약") {
    return tone === "fun"
      ? "환경과 스트레스에 민감하고 회복 속도는 느린 편이야. 급하게 끌어올리기보다, 수면·식사·생활 리듬을 일정하게 맞춰 두면 체력이 훨씬 안정적으로 유지돼."
      : "환경과 스트레스에 민감하고 회복 속도는 느린 편이에요. 급하게 끌어올리기보다, 수면·식사·생활 리듬을 일정하게 맞춰 두면 체력이 훨씬 안정적으로 유지됩니다.";
  }
  // 중화
  return tone === "fun"
    ? "몸 에너지가 크게 치우치기보다는, 상황과 관리에 따라 좋아지기도 하고 떨어지기도 하는 중간 타입이야. 평소 생활습관을 어떻게 관리하느냐에 따라 체감이 많이 달라져."
    : "몸 에너지가 크게 치우치기보다는, 상황과 관리에 따라 좋아지기도 하고 떨어지기도 하는 중간 타입이에요. 평소 생활습관을 어떻게 관리하느냐에 따라 체감이 많이 달라집니다.";
}

// 인성 회복력 텍스트
function inseongText(
  inseongCount: number,
  hasJeongIn: boolean,
  hasPyeonIn: boolean,
  tone: HealthToneKey
): string {
  if (inseongCount === 0) {
    return tone === "fun"
      ? "인성 기운이 거의 없어서 '재충전'보다는 '소모' 쪽으로 흐르기 쉬운 체질이야. 스스로 회복 루틴을 의식적으로 만들어 두는 게 중요해."
      : "인성 기운이 거의 없어 '재충전'보다는 '소모' 쪽으로 흐르기 쉬운 체질이에요. 스스로 회복 루틴을 의식적으로 만들어 두는 것이 중요합니다.";
  }
  if (inseongCount === 1) {
    return tone === "fun"
      ? "인성이 한 자리는 있어서, 관리만 잘하면 회복력은 보통 이상으로 유지할 수 있어. 규칙적인 수면과 식사 리듬이 특히 도움이 돼."
      : "인성이 한 자리는 있어서, 관리만 잘하면 회복력은 보통 이상으로 유지할 수 있어요. 규칙적인 수면과 식사 리듬이 특히 도움이 됩니다.";
  }
  if (inseongCount === 2) {
    if (hasJeongIn && hasPyeonIn) {
      return tone === "fun"
        ? "정인과 편인이 균형 있게 들어와 있어서, 위기 때는 금방 회복하고 일상에서도 꾸준히 버티는 힘이 있어. 다만 너무 안심해서 몸 신호를 무시하지만 않으면 돼."
        : "정인과 편인이 균형 있게 들어와 있어, 위기 때는 금방 회복하고 일상에서도 꾸준히 버티는 힘이 있어요. 다만 너무 안심해서 몸 신호를 무시하지만 않으면 됩니다.";
    }
    return tone === "fun"
      ? "인성이 두 자리는 있어서, 기본 회복력은 좋은 편이야. 때때로 쉬어 주기만 해도 체력이 금방 돌아오는 타입이야."
      : "인성이 두 자리는 있어서, 기본 회복력은 좋은 편이에요. 때때로 쉬어 주기만 해도 체력이 금방 돌아오는 타입입니다.";
  }
  // 3개 이상
  return tone === "fun"
    ? "인성 기운이 많아서 회복력은 좋지만, 때로는 '쉬는 데에만 머무르는' 패턴으로 흐르지 않게 주의하면 좋아. 적당한 긴장과 휴식의 균형이 포인트야."
    : "인성 기운이 많은 편이라 회복력은 좋지만, 때로는 '쉬는 데에만 머무르는' 패턴으로 흐르지 않도록 적당한 긴장과 휴식의 균형을 잡아 주는 것이 포인트예요.";
}

// 메인 함수: 체질 건강 문단 생성
export function getHealthConstitutionParagraph(params: HealthAnalysisParams): string {
  const { dayStem, stems, branches, tone, tenGod } = params;
  const [yearStem, monthStem, dayStem2, hourStem] = stems;
  const [yearBranch, monthBranch, dayBranch, hourBranch] = branches;

  // 1) 오행 분포 → 장부 강약
  const elementCount = countElementsFromPillars(stems, branches);
  const entries = Object.entries(elementCount) as [Element, number][];
  const strong = entries.slice().sort((a, b) => b[1] - a[1])[0];
  const weak = entries.slice().sort((a, b) => a[1] - b[1])[0];

  const strongText = elementStatus(strong[0], strong[1], tone);
  const weakText =
    weak[0] === strong[0] && weak[1] === strong[1]
      ? ""
      : elementStatus(weak[0], weak[1], tone);

  // 2) 신강/신약
  const { deukRyeong, deukJi, deukSe } = computeDeukRyeongJiSe(dayStem, stems, branches, tenGod);
  const shin = classifyShinState(deukRyeong, deukJi, deukSe);

  // 3) 인성 회복력
  const { count: inseongCount, hasJeongIn, hasPyeonIn } = countInseong(
    dayStem,
    stems,
    branches,
    tenGod
  );

  // 4) 일지 충 여부
  const dayHasChong = hasDayBranchChong(branches);

  // 5) 종합 체질 유형
  const constitutionType = classifyConstitutionType(
    elementCount,
    shin,
    inseongCount,
    dayHasChong,
    monthBranch
  );

  // --- 문단 구성 ---
  const paras: string[] = [];

  // 1문단: 체질 유형 선언
  const typeLine =
    tone === "fun"
      ? `당신의 기본 체질은 대체로 <strong>${constitutionType}</strong> 쪽에 가까운 편이야. 이건 약점이라기보다, 어디를 더 아껴 쓰고 어디에 힘을 실어야 할지 알려주는 '몸의 사용 설명서'에 가까워.`
      : tone === "reality"
        ? `이 사주의 기본 체질은 대체로 <strong>${constitutionType}</strong> 쪽에 가깝습니다. 이는 약점이라기보다, 어느 부위를 더 아껴 쓰고 어디에 힘을 실어야 할지 알려주는 '몸의 사용 설명서'에 가깝습니다.`
        : `당신의 기본 체질은 대체로 <strong>${constitutionType}</strong> 쪽에 가깝게 잡혀 있어요. 이는 약점이라기보다, 어디를 더 아껴 쓰고 어디에 힘을 실어야 할지 알려주는 '몸의 사용 설명서'에 가깝습니다.`;
  paras.push(typeLine);

  // 2문단: 오행 분포 기반 장부 강약
  const p2Parts: string[] = [];
  p2Parts.push(strongText);
  if (weakText) p2Parts.push(weakText);
  paras.push(p2Parts.join(" "));

  // 3문단: 신강/신약 기반 기초 체력
  paras.push(shinText(shin, tone));

  // 4문단: 월지 환경 + 일지 안정성
  const monthEnv = MONTH_ENV_LABEL[monthBranch] ?? "";
  let p4 = "";
  if (tone === "fun") {
    p4 += monthEnv
      ? `태어난 계절과 월지 흐름상, ${monthEnv} 쪽 체질감이 살짝 섞여 있어. `
      : "월지 기준 체질감은 크게 한쪽으로 쏠리지 않는 편이야. ";
    p4 += dayHasChong
      ? "일지가 충을 받아 몸 중심이 환경 변화에 민감하게 흔들릴 수 있어서, 리듬이 크게 바뀌는 시기에는 체력 관리에 조금 더 신경 써 주면 좋아."
      : "일지가 비교적 안정적으로 잡혀 있어, 만성적인 체력 문제보다는 생활습관과 환경 변화에 따라 컨디션이 달라지는 쪽에 가깝다 볼 수 있어.";
  } else if (tone === "reality") {
    p4 += monthEnv
      ? `월지 환경상 ${monthEnv} 쪽 체질감이 함께 섞여 있습니다. `
      : "월지 기준 체질감은 한쪽으로 과도하게 쏠리지는 않는 편입니다. ";
    p4 += dayHasChong
      ? "일지가 충을 받아 몸 중심이 환경 변화에 민감하게 흔들릴 수 있어, 리듬이 크게 바뀌는 시기에는 체력 관리에 더 신경 쓰는 것이 좋습니다."
      : "일지는 비교적 안정적으로 잡혀 있어, 선천적인 큰 허약보다는 생활습관·환경에 따라 컨디션이 달라지는 구조로 볼 수 있습니다.";
  } else {
    p4 += monthEnv
      ? `월지 환경을 보면 ${monthEnv} 쪽 체질감이 같이 섞여 있어요. `
      : "월지 기준 체질감은 한쪽으로 크게 치우치지 않는 편이에요. ";
    p4 += dayHasChong
      ? "일지가 충을 받아 몸 중심이 환경 변화에 민감하게 흔들릴 수 있어서, 생활 리듬이 크게 바뀌는 시기에는 체력 관리에 조금 더 신경 써 주면 좋아요."
      : "일지는 비교적 안정적으로 잡혀 있어서, 선천적인 약함보다는 생활습관과 환경에 따라 컨디션이 달라지는 구조에 가까워요.";
  }
  paras.push(p4);

  // 5문단: 인성 기반 회복력
  paras.push(inseongText(inseongCount, hasJeongIn, hasPyeonIn, tone));

  // 마무리: 긍정 프레이밍
  const closing =
    tone === "fun"
      ? "이 체질은 '어디가 문제다'를 말해 주기보다는, 어떤 방식으로 내 몸을 아껴 써야 하는지를 알려주는 지도에 가까워. 타고난 방향을 알고 나면, 약한 곳은 보완하고 강한 곳은 장점으로 쓰는 선택지가 훨씬 많아져."
      : "이 체질은 '어디가 문제다'를 말해 주기보다는, 어떤 방식으로 몸을 아껴 써야 하는지를 알려주는 지도에 가깝습니다. 타고난 방향을 알고 나면, 약한 곳은 보완하고 강한 곳은 장점으로 쓰는 선택지가 훨씬 많아집니다.";
  paras.push(closing);

  return paras.join("\n\n").trim();
}

