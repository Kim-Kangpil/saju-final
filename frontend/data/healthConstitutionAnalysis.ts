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

// =====================================================
// 체질 바디맵 시각화용 데이터
// =====================================================

export type BodyPointStatus = "danger" | "caution" | "strength";

export interface BodyPointPosition {
  x: number;
  y: number;
}

export interface BodyPoint {
  id:
    | "brain"
    | "eye"
    | "nose"
    | "heart"
    | "lung"
    | "liver"
    | "stomach"
    | "spleen"
    | "smallIntestine"
    | "largeIntestine"
    | "kidney"
    | "bladder"
    | "spine"
    | "skin"
    | "blood"
    | "immunity"
    | "stamina";
  organ: string;
  element: Element;
  color: string;
  status: BodyPointStatus;
  reason: string;
  desc: string;
  position: BodyPointPosition;
}

export interface HealthBodyMapData {
  bodyPoints: BodyPoint[];
  bodyType: string;
  recovery: "약" | "보통" | "강";
}

// 실루엣 비율 10:22 기준 — y축: 얼굴(0~18) / 몸통(20~58) / 다리·하부(60~100)
const BODY_POINT_BASE: Record<BodyPoint["id"], { organ: string; element: Element; position: BodyPointPosition }> = {
  // ——— 얼굴 구간 (y 5~18) ———
  brain: { organ: "뇌·신경", element: "water", position: { x: 50, y: 5 } },
  eye: { organ: "눈·시신경", element: "wood", position: { x: 50, y: 11 } },
  nose: { organ: "코·기관지", element: "metal", position: { x: 50, y: 16 } },
  // ——— 몸통 구간 (y 24~56) ———
  immunity: { organ: "면역·회복력", element: "water", position: { x: 50, y: 24 } },
  lung: { organ: "폐", element: "metal", position: { x: 38, y: 27 } },
  heart: { organ: "심장", element: "fire", position: { x: 50, y: 28 } },
  blood: { organ: "혈관·혈액", element: "fire", position: { x: 50, y: 30 } },
  spine: { organ: "척추·뼈", element: "water", position: { x: 50, y: 35 } },
  skin: { organ: "피부", element: "metal", position: { x: 28, y: 32 } },
  liver: { organ: "간·담", element: "wood", position: { x: 42, y: 38 } },
  stomach: { organ: "위장", element: "earth", position: { x: 50, y: 42 } },
  spleen: { organ: "비장·췌장", element: "earth", position: { x: 58, y: 44 } },
  smallIntestine: { organ: "소장", element: "fire", position: { x: 50, y: 52 } },
  // ——— 다리·하부 구간 (y 60~92) ———
  largeIntestine: { organ: "대장", element: "metal", position: { x: 50, y: 58 } },
  kidney: { organ: "신장", element: "water", position: { x: 48, y: 64 } },
  bladder: { organ: "방광·생식", element: "water", position: { x: 50, y: 72 } },
  stamina: { organ: "기초 체력", element: "earth", position: { x: 50, y: 92 } },
};

const ELEMENT_STATUS_COLOR: Record<Element, { danger: string; caution: string; strength: string }> = {
  wood: {
    danger: "#E8724A",
    caution: "#A8C97F",
    strength: "#4CAF50",
  },
  fire: {
    danger: "#E53935",
    caution: "#FFB74D",
    strength: "#FF7043",
  },
  earth: {
    danger: "#C8A96E",
    caution: "#FFD54F",
    strength: "#8D6E63",
  },
  metal: {
    danger: "#B0B0B0",
    caution: "#E0E0E0",
    strength: "#CFD8DC",
  },
  water: {
    danger: "#1565C0",
    caution: "#64B5F6",
    strength: "#4FC3F7",
  },
};

type BodyReasonCode =
  | "오행과다"
  | "오행부족"
  | "월지체질"
  | "충"
  | "형"
  | "인성강"
  | "신강";

interface BodyPointAgg {
  id: BodyPoint["id"];
  dangerSources: number;
  cautionSources: number;
  strengthSources: number;
  reasons: Set<BodyReasonCode>;
}

function ensureAgg(map: Map<BodyPoint["id"], BodyPointAgg>, id: BodyPoint["id"]): BodyPointAgg {
  const existing = map.get(id);
  if (existing) return existing;
  const created: BodyPointAgg = {
    id,
    dangerSources: 0,
    cautionSources: 0,
    strengthSources: 0,
    reasons: new Set<BodyReasonCode>(),
  };
  map.set(id, created);
  return created;
}

function pickMainReason(reasons: Set<BodyReasonCode>): BodyReasonCode | "기타" {
  const order: BodyReasonCode[] = ["충", "형", "오행과다", "월지체질", "오행부족", "인성강", "신강"];
  for (const r of order) {
    if (reasons.has(r)) return r;
  }
  return "기타";
}

function buildBodyPointDesc(
  organ: string,
  element: Element,
  status: BodyPointStatus,
  reason: BodyReasonCode | "기타"
): string {
  // 한글 조사 '은/는' 선택
  function hasBatchim(ch: string): boolean {
    const code = ch.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return false;
    return (code - 0xac00) % 28 !== 0;
  }
  function josaEunNeun(word: string): string {
    const w = word.trim();
    if (!w.length) return "는";
    const last = w[w.length - 1];
    return hasBatchim(last) ? "은" : "는";
  }

  const statusText: Record<BodyPointStatus, string> = {
    danger: "주의가 필요한 부위입니다.",
    caution: "꾸준한 관리가 도움이 되는 부위입니다.",
    strength: "타고난 강점으로 쓸 수 있는 부위입니다.",
  };

  const elementKo = ELEMENT_KO[element];

  // 기관별 디테일한 설명
  const isLung = organ.includes("폐") || organ.includes("호흡");
  const isNose = organ.includes("코") || organ.includes("기관지");
  const isHeart = organ.includes("심장");
  const isBlood = organ.includes("혈관") || organ.includes("혈액");
  const isLiver = organ.includes("간") || organ.includes("담");
  const isStomach = organ.includes("위장") || organ.includes("비장") || organ.includes("췌장") || organ.includes("소장") || organ.includes("대장");
  const isKidney = organ.includes("신장") || organ.includes("방광") || organ.includes("생식");
  const isBrain = organ.includes("뇌") || organ.includes("신경");
  const isSpine = organ.includes("척추") || organ.includes("뼈");
  const isSkin = organ.includes("피부");
  const isImmunity = organ.includes("면역") || organ.includes("회복력");
  const isStamina = organ.includes("체력");

  let detail = "";

  if (reason === "오행과다") {
    if (isLung || isNose) {
      detail = "호흡기 쪽에 열·건조가 몰리기 쉬워서, 환절기나 미세먼지 많은 날에는 수분·습도 관리와 충분한 휴식을 챙겨 주면 좋습니다.";
    } else if (isHeart || isBlood) {
      detail = "기운이 위쪽으로 몰리면 두근거림·혈압·순환 쪽으로 부담이 생기기 쉬워, 과로·과음·과한 카페인을 줄여 주는 편이 좋습니다.";
    } else if (isLiver) {
      detail = "스트레스나 야근이 쌓이면 눈 피로·근육 뻐근함과 함께 이 부위에 긴장이 올라오기 쉬워, 수면 리듬과 휴식을 신경 써 주면 좋습니다.";
    } else if (isStomach) {
      detail = "소화가 잘 되는 대신, 과식·야식·자극적인 음식이 계속되면 속쓰림이나 더부룩함으로 신호를 보내기 쉬운 자리입니다.";
    } else if (isKidney) {
      detail = "수분 대사와 노폐물 배출을 많이 담당해서, 수면 부족·과음·카페인 과다에 특히 예민하게 반응할 수 있습니다.";
    } else if (isBrain) {
      detail = "생각과 긴장이 많이 몰려 머리쪽으로 열이 오르기 쉬워, 충분한 수면과 눈·머리를 쉬게 하는 시간이 중요합니다.";
    } else if (isSpine) {
      detail = "자세·체형과 연결되는 부위라, 오래 앉아 있거나 같은 자세를 유지하면 빠르게 피로가 쌓일 수 있습니다.";
    } else if (isSkin) {
      detail = "피부 쪽으로 자극이 몰리기 쉬워, 건조함·민감함·트러블로 신호를 보낼 수 있어 보습과 자극 관리가 중요합니다.";
    } else if (isImmunity) {
      detail = "기운이 강하게 도는 대신, 무리 후에 한 번에 피로가 오는 패턴으로 나타날 수 있어 휴식 타이밍을 의식적으로 잡아 주면 좋습니다.";
    } else if (isStamina) {
      detail = "평소엔 버티는 힘이 좋지만, 한 번 무너지면 크게 지치는 스타일이라 과로 직전까지 몰아붙이지 않는 것이 중요합니다.";
    } else {
      detail = `${elementKo} 기운이 몰려 있어 이 부위에 에너지가 강하게 흐르는 대신, 무리하면 과부하 신호가 나타나기 쉬운 자리입니다.`;
    }
  } else if (reason === "오행부족") {
    if (isLung || isNose) {
      detail = "호흡기 쪽 기운이 약해 감기·알레르기·숨찬 느낌으로 신호를 보낼 수 있어, 규칙적인 호흡 운동과 체온 관리가 도움이 됩니다.";
    } else if (isHeart || isBlood) {
      detail = "혈액순환·심장 쪽 기운이 약하면 쉽게 피곤하고 식은땀·어지러움 등으로 표현될 수 있어, 규칙적인 수면과 가벼운 운동이 좋습니다.";
    } else if (isLiver) {
      detail = "간 해독력·눈 피로 회복이 더디게 느껴질 수 있어, 과음·야식을 줄이고 눈을 쉬게 하는 습관이 중요합니다.";
    } else if (isStomach) {
      detail = "식욕과 소화력이 들쭉날쭉하기 쉬운 자리라, 폭식보다는 소량씩 규칙적으로 먹는 패턴이 잘 맞습니다.";
    } else if (isKidney) {
      detail = "몸의 수분·노폐물 조절이 약해지면 쉽게 붓거나 피곤함이 오래 가는 쪽이라, 수면·수분 섭취 패턴을 일정하게 두는 게 좋습니다.";
    } else if (isBrain) {
      detail = "집중력과 멘탈 에너지가 빨리 소모되는 타입이라, 정보·약속을 너무 많이 한 번에 떠안지 않는 것이 도움이 됩니다.";
    } else if (isSpine) {
      detail = "허리·목 등 근골격 쪽이 약하게 태어난 편이라, 무거운 것 들기·장시간 앉아 있기에는 체형 관리가 더 중요합니다.";
    } else if (isSkin) {
      detail = "피부 장벽이 약해 건조·예민함으로 신호를 보내기 쉬워, 기본 보습과 자극 최소화가 큰 도움이 됩니다.";
    } else if (isImmunity) {
      detail = "컨디션이 떨어지면 감기·피로 누적 등으로 바로 표시가 나기 쉬워, 충분한 휴식과 균형 잡힌 식사가 핵심 포인트입니다.";
    } else if (isStamina) {
      detail = "에너지 탱크 용량이 작게 태어난 편이라, 짧게 자주 쉬는 리듬이 잘 맞고 한 번에 오래 버티는 방식은 부담이 될 수 있습니다.";
    } else {
      detail = `${elementKo} 기운이 상대적으로 약해 이 부위는 무리하면 피로가 쉽게 쌓이는 자리입니다.`;
    }
  } else if (reason === "월지체질") {
    detail = "태어난 계절과 기후에 따라 이 부위가 특히 날씨·환경 변화에 민감하게 반응하는 체질입니다.";
  } else if (reason === "충") {
    detail = "에너지가 강하게 부딪히는 구조라, 스트레스·환경 변화가 있을 때 이 부위에 긴장·통증·불편감으로 표시가 나기 쉽습니다.";
  } else if (reason === "형") {
    detail = "에너지가 비틀려 흐르는 구조라, 한 번 생긴 불편이 만성적으로 이어지지 않도록 초기에 관리해 주면 도움이 됩니다.";
  } else if (reason === "인성강") {
    detail = "학습·회복 에너지가 잘 받쳐주는 자리라, 무리가 와도 비교적 금방 회복하는 강점으로 쓸 수 있습니다.";
  } else if (reason === "신강") {
    detail = "전체적인 기초 체력이 좋아 이 부위도 회복 속도가 빠른 편이라, 적당한 운동과 사용은 오히려 강점으로 작용합니다.";
  }

  const base = `${organ}${josaEunNeun(organ)} ${statusText[status]}`;
  return detail ? `${base} ${detail}`.trim() : base;
}

// 월지별 바디맵 취약 부위
const MONTH_BODY_POINTS: Record<
  string,
  Array<{ id: BodyPoint["id"]; status: BodyPointStatus }>
> = {
  "子": [
    { id: "kidney", status: "caution" },
    { id: "bladder", status: "caution" },
  ],
  "亥": [
    { id: "kidney", status: "caution" },
    { id: "bladder", status: "caution" },
    { id: "spine", status: "caution" },
  ],
  "丑": [{ id: "stomach", status: "caution" }],
  "寅": [
    { id: "liver", status: "caution" },
    { id: "eye", status: "caution" },
  ],
  "卯": [
    { id: "liver", status: "caution" },
    { id: "eye", status: "caution" },
  ],
  "辰": [
    { id: "stomach", status: "caution" },
    { id: "skin", status: "caution" },
  ],
  "巳": [
    { id: "heart", status: "danger" },
    { id: "blood", status: "danger" },
  ],
  "午": [
    { id: "heart", status: "danger" },
    { id: "blood", status: "danger" },
  ],
  "未": [{ id: "stomach", status: "caution" }],
  "申": [
    { id: "lung", status: "caution" },
    { id: "nose", status: "caution" },
    { id: "skin", status: "caution" },
  ],
  "酉": [
    { id: "lung", status: "caution" },
    { id: "nose", status: "caution" },
    { id: "skin", status: "caution" },
  ],
  "戌": [
    { id: "stomach", status: "caution" },
    { id: "skin", status: "caution" },
    { id: "spine", status: "caution" },
  ],
};

// 충·형 → 바디맵 부위
const CHONG_BODY_POINTS: Record<
  string,
  { ids: BodyPoint["id"][]; status: BodyPointStatus }
> = {
  "子午충": { ids: ["heart", "kidney"], status: "danger" },
  "丑未충": { ids: ["stomach", "spleen"], status: "danger" },
  "寅申충": { ids: ["liver", "lung"], status: "danger" },
  "卯酉충": { ids: ["liver", "eye", "lung"], status: "danger" },
  "辰戌충": { ids: ["stomach", "spine"], status: "danger" },
  "巳亥충": { ids: ["heart", "kidney"], status: "danger" },
  "寅巳申삼형": { ids: ["lung", "liver"], status: "danger" },
  "丑戌未삼형": { ids: ["stomach", "spleen", "skin"], status: "danger" },
  "子卯자형": { ids: ["kidney", "liver"], status: "caution" },
};

function detectChongHyung(branches: [string, string, string, string]): string[] {
  const [yearBranch, monthBranch, dayBranch, hourBranch] = branches;
  const all = [yearBranch, monthBranch, dayBranch, hourBranch];
  const set = new Set(all);
  const results: string[] = [];

  const has = (a: string, b: string) => set.has(a) && set.has(b);

  if (has("子", "午")) results.push("子午충");
  if (has("丑", "未")) results.push("丑未충");
  if (has("寅", "申")) results.push("寅申충");
  if (has("卯", "酉")) results.push("卯酉충");
  if (has("辰", "戌")) results.push("辰戌충");
  if (has("巳", "亥")) results.push("巳亥충");

  if (set.has("寅") && set.has("巳") && set.has("申")) results.push("寅巳申삼형");
  if (set.has("丑") && set.has("戌") && set.has("未")) results.push("丑戌未삼형");
  if (has("子", "卯")) results.push("子卯자형");

  return results;
}

export function getHealthBodyMapData(params: HealthAnalysisParams): HealthBodyMapData {
  const { dayStem, stems, branches, tenGod } = params;
  const [, monthStem, ,] = stems;
  const [yearBranch, monthBranch, dayBranch, hourBranch] = branches;

  // 1) 오행 분포
  const elementCount = countElementsFromPillars(stems, branches);

  // 과다/부족 오행
  const overElements: Element[] = [];
  const underElements: Element[] = [];
  (Object.entries(elementCount) as [Element, number][]).forEach(([el, n]) => {
    if (n >= 3) overElements.push(el);
    if (n <= 1) underElements.push(el);
  });

  // 2) 신강/신약 & 인성
  const { deukRyeong, deukJi, deukSe } = computeDeukRyeongJiSe(dayStem, stems, branches, tenGod);
  const shin = classifyShinState(deukRyeong, deukJi, deukSe);
  const { count: inseongCount } = countInseong(dayStem, stems, branches, tenGod);

  // 3) 월지 체질
  const monthEnv = MONTH_ENV_LABEL[monthBranch] ?? "";

  // 4) 충·형 구조
  const chongHyungList = detectChongHyung(branches);

  const aggMap = new Map<BodyPoint["id"], BodyPointAgg>();

  // --- 오행 과다 → danger ---
  for (const el of overElements) {
    if (el === "wood") {
      const a1 = ensureAgg(aggMap, "liver");
      a1.dangerSources++;
      a1.reasons.add("오행과다");
      const a2 = ensureAgg(aggMap, "eye");
      a2.dangerSources++;
      a2.reasons.add("오행과다");
    } else if (el === "fire") {
      const a1 = ensureAgg(aggMap, "heart");
      a1.dangerSources++;
      a1.reasons.add("오행과다");
      const a2 = ensureAgg(aggMap, "blood");
      a2.dangerSources++;
      a2.reasons.add("오행과다");
    } else if (el === "earth") {
      const a1 = ensureAgg(aggMap, "stomach");
      a1.dangerSources++;
      a1.reasons.add("오행과다");
      const a2 = ensureAgg(aggMap, "spleen");
      a2.dangerSources++;
      a2.reasons.add("오행과다");
    } else if (el === "metal") {
      const a1 = ensureAgg(aggMap, "lung");
      a1.dangerSources++;
      a1.reasons.add("오행과다");
      const a2 = ensureAgg(aggMap, "nose");
      a2.dangerSources++;
      a2.reasons.add("오행과다");
      const a3 = ensureAgg(aggMap, "largeIntestine");
      a3.dangerSources++;
      a3.reasons.add("오행과다");
    } else if (el === "water") {
      const a1 = ensureAgg(aggMap, "kidney");
      a1.dangerSources++;
      a1.reasons.add("오행과다");
      const a2 = ensureAgg(aggMap, "bladder");
      a2.dangerSources++;
      a2.reasons.add("오행과다");
    }
  }

  // --- 오행 부족 → caution ---
  for (const el of underElements) {
    if (el === "wood") {
      const a1 = ensureAgg(aggMap, "liver");
      a1.cautionSources++;
      a1.reasons.add("오행부족");
      const a2 = ensureAgg(aggMap, "eye");
      a2.cautionSources++;
      a2.reasons.add("오행부족");
    } else if (el === "fire") {
      const a1 = ensureAgg(aggMap, "heart");
      a1.cautionSources++;
      a1.reasons.add("오행부족");
      const a2 = ensureAgg(aggMap, "blood");
      a2.cautionSources++;
      a2.reasons.add("오행부족");
    } else if (el === "earth") {
      const a1 = ensureAgg(aggMap, "stomach");
      a1.cautionSources++;
      a1.reasons.add("오행부족");
      const a2 = ensureAgg(aggMap, "spleen");
      a2.cautionSources++;
      a2.reasons.add("오행부족");
    } else if (el === "metal") {
      const a1 = ensureAgg(aggMap, "lung");
      a1.cautionSources++;
      a1.reasons.add("오행부족");
      const a2 = ensureAgg(aggMap, "skin");
      a2.cautionSources++;
      a2.reasons.add("오행부족");
      const a3 = ensureAgg(aggMap, "largeIntestine");
      a3.cautionSources++;
      a3.reasons.add("오행부족");
    } else if (el === "water") {
      const a1 = ensureAgg(aggMap, "kidney");
      a1.cautionSources++;
      a1.reasons.add("오행부족");
      const a2 = ensureAgg(aggMap, "brain");
      a2.cautionSources++;
      a2.reasons.add("오행부족");
      const a3 = ensureAgg(aggMap, "spine");
      a3.cautionSources++;
      a3.reasons.add("오행부족");
    }
  }

  // --- 월지 체질 ---
  const monthPoints = MONTH_BODY_POINTS[monthBranch];
  if (monthPoints) {
    for (const mp of monthPoints) {
      const a = ensureAgg(aggMap, mp.id);
      if (mp.status === "danger") a.dangerSources++;
      if (mp.status === "caution") a.cautionSources++;
      a.reasons.add("월지체질");
    }
  }

  // --- 충·형 ---
  for (const key of chongHyungList) {
    const cfg = CHONG_BODY_POINTS[key];
    if (!cfg) continue;
    for (const id of cfg.ids) {
      const a = ensureAgg(aggMap, id);
      if (cfg.status === "danger") a.dangerSources++;
      if (cfg.status === "caution") a.cautionSources++;
      if (key.endsWith("삼형") || key.endsWith("자형")) {
        a.reasons.add("형");
      } else {
        a.reasons.add("충");
      }
    }
  }

  // --- 인성 회복력 strength 포인트 ---
  if (inseongCount >= 2) {
    const a = ensureAgg(aggMap, "immunity");
    a.strengthSources++;
    a.reasons.add("인성강");
  }

  // --- 신강/신약 기초 체력 포인트 ---
  if (shin === "신강" || shin === "극신약" || shin === "신약") {
    const a = ensureAgg(aggMap, "stamina");
    if (shin === "신강") {
      a.strengthSources++;
      a.reasons.add("신강");
    } else {
      a.cautionSources++;
      a.reasons.add("신강");
    }
  }

  // --- 최종 상태 결정 + 최대 5개 필터 ---
  const allAgg = Array.from(aggMap.values()).map((a) => {
    let status: BodyPointStatus | null = null;
    if (a.dangerSources > 0) {
      status = "danger";
    } else if (a.cautionSources >= 2) {
      status = "danger";
    } else if (a.cautionSources === 1) {
      status = "caution";
    } else if (a.strengthSources > 0) {
      status = "strength";
    }
    return { ...a, status };
  });

  const filtered = allAgg.filter((a) => a.status !== null) as Array<
    BodyPointAgg & { status: BodyPointStatus }
  >;

  // 우선순위 정렬
  filtered.sort((a, b) => {
    const score = (x: BodyPointAgg & { status: BodyPointStatus }) => {
      let s = 0;
      if (x.status === "danger") s += 4;
      if (x.status === "caution") s += 2;
      if (x.status === "strength") s += 1;
      s += x.dangerSources + x.cautionSources + x.strengthSources * 0.5;
      return -s;
    };
    return score(a) - score(b);
  });

  const top5 = filtered.slice(0, 5);

  const bodyPoints: BodyPoint[] = top5.map((a) => {
    const base = BODY_POINT_BASE[a.id];
    const status = a.status;
    const mainReason = pickMainReason(a.reasons);
    const color = ELEMENT_STATUS_COLOR[base.element][status];
    const desc = buildBodyPointDesc(base.organ, base.element, status, mainReason);
    return {
      id: a.id,
      organ: base.organ,
      element: base.element,
      color,
      status,
      reason: mainReason,
      desc,
      position: base.position,
    };
  });

  const bodyType = monthEnv ? monthEnv.split("(")[0].trim() : "기본 체질";

  let recovery: "약" | "보통" | "강" = "보통";
  if (inseongCount === 0 && (shin === "신약" || shin === "극신약")) {
    recovery = "약";
  } else if (inseongCount >= 2 && shin === "신강") {
    recovery = "강";
  }

  return {
    bodyPoints,
    bodyType,
    recovery,
  };
}

