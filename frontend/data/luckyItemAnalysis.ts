// frontend/data/luckyItemAnalysis.ts
//
// 행운의 아이템 분석
// - 오행 분포에서 부족/결핍 오행 1~2개 추출
// - 오행별 색상/물건/장소/행동/음식/효과를 텍스트로 추천
//
// 톤: empathy / reality / fun

export type LuckyToneKey = "empathy" | "reality" | "fun";

type Element = "wood" | "fire" | "earth" | "metal" | "water";

export interface LuckyItemParams {
  stems: [string, string, string, string]; // [년간, 월간, 일간, 시간]
  branches: [string, string, string, string]; // [년지, 월지, 일지, 시지]
  tone: LuckyToneKey;
}

// 지지 본기
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
  const main = BRANCH_MAIN_STEM[branch];
  if (!main) return null;
  return elementOfStem(main);
}

function countElements(
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

// 오행 → 한글 라벨
const ELEMENT_LABEL_KO: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

// 스펙에 따른 오행별 아이템 맵
const ITEM_MAP: Record<
  Element,
  {
    colors: string[];
    items: string[];
    food: string[];
    places: string[];
    actions: string[];
    effect: string;
  }
> = {
  wood: {
    colors: ["초록", "청록", "연두"],
    items: [
      "잎이 넓은 식물 한 화분",
      "원목 가구나 나무 소재 소품",
      "노트·다이어리·펜 같은 글쓰기 도구",
      "우디·그린 계열 향수나 디퓨저",
      "초록색 파우치나 가방",
    ],
    food: ["레몬·라임 같은 신맛 과일", "새싹채소", "녹차"],
    places: ["공원", "숲길", "식물원", "서점"],
    actions: ["새로운 사람에게 먼저 연락해 보기", "작은 새 프로젝트를 시작하기", "평소보다 조금 더 일찍 일어나기"],
    effect: "새로운 기회와 인간관계 확장, 아이디어·창의력 활성화에 도움이 됩니다.",
  },
  fire: {
    colors: ["빨강", "주황", "핑크", "산호색"],
    items: [
      "붉은색 향초나 캔들",
      "따뜻한 조명 (스탠드, 무드등)",
      "립스틱·틴트 같은 포인트 메이크업",
      "빨간색·주황색 머플러·양말 같은 포인트 소품",
      "플로럴·스파이시 계열 향수",
    ],
    food: ["쓴맛 커피·차", "딸기·체리·토마토 같은 붉은 과일"],
    places: ["사람이 많은 카페", "공연장", "분위기 좋은 핫플레이스"],
    actions: ["SNS에 글·사진 올리기", "발표·프레젠테이션에 자원하기", "새 옷을 입고 외출해 보기"],
    effect: "매력과 자신감이 올라가고, 표현력·발표력이 자연스럽게 살아나는 데 도움이 됩니다.",
  },
  earth: {
    colors: ["베이지", "브라운", "황토색", "카멜"],
    items: [
      "브라운·베이지 계열 지갑",
      "가죽 가방·벨트 같은 기본 아이템",
      "도자기·토기 컵·접시",
      "황수정·호안석 같은 원석",
      "베이지 쿠션·러그 등 집 안 패브릭",
    ],
    food: ["고구마·단호박", "꿀·대추 같은 자연스러운 단맛", "뿌리채소"],
    places: ["익숙한 동네 카페", "도서관", "집 근처 산책 코스"],
    actions: ["소액이라도 저축하기", "가계부·지출 기록 적기", "정해진 시간에 식사하기"],
    effect: "재물과 생활 기반을 단단하게 다지고, 루틴과 신뢰감을 쌓는 데 도움이 됩니다.",
  },
  metal: {
    colors: ["흰색", "은색", "라이트 그레이"],
    items: [
      "메탈 액세서리(반지·목걸이·팔찌)",
      "메탈 밴드 시계",
      "흰색 셔츠·티셔츠·운동화",
      "은색·흰색 텀블러나 노트북·이어폰 케이스",
      "주방용 칼·가위 같은 정리 도구",
    ],
    food: ["생강·마늘·고추 같은 매운맛", "두부·쌀·배 같은 흰 음식"],
    places: ["정돈된 오피스 거리", "깔끔한 카페", "심플한 인테리어의 작업 공간"],
    actions: ["불필요한 물건 정리·버리기", "미뤄둔 결정 하나 정리하기", "운동이나 루틴 하나 시작하기"],
    effect: "판단력·결단력과 집중력을 높여 주고, 실행력을 끌어올리는 데 도움이 됩니다.",
  },
  water: {
    colors: ["파랑", "네이비", "검정", "다크 그린"],
    items: [
      "수경식물·어항 같은 물 소품",
      "파란색·네이비 파우치·머그컵",
      "유리 소재 소품",
      "아쿠아·머스크 계열 향수",
      "달·야경 관련 무드등",
    ],
    food: ["미역·해조류", "해산물", "검은콩·흑임자·블루베리"],
    places: ["강·바다·호수 같은 물가", "조용한 카페", "목욕탕·스파", "야경이 보이는 장소"],
    actions: ["짧게 명상하거나 숨 고르기", "일기·메모 쓰기", "충분히 자기", "직감을 믿고 작은 결정을 내려 보기"],
    effect: "감정 안정과 스트레스 완화, 직감·통찰력 상승, 유연한 사고에 도움이 됩니다.",
  },
};

// 부족 오행 메인 해석 (선언 + 아이템 + 효과) — empathy/reality 공통 텍스트
const MAIN_TEXT: Record<
  Element,
  {
    declare: string;
    items: string;
    effect: string;
  }
> = {
  wood: {
    declare:
      "당신의 사주에서 목 기운이 부족한 구조입니다. 목은 성장·기회·인간관계·창의의 에너지로, 이 기운이 약하면 새로운 시작이 늦어지거나 인간관계 확장이 잘 안 된다는 느낌이 들기 쉽습니다.",
    items:
      "초록색 식물이나 나무 소재 물건을 가까이 두면 막혀 있던 기회의 흐름이 조금씩 열리기 시작합니다. 우디·그린 계열 향수나 노트·펜처럼 창의적 작업과 연결된 도구도 목 기운을 자연스럽게 끌어올리는 데 도움이 됩니다.",
    effect:
      "새로운 사람과의 연결이 늘어나고, 미뤄뒀던 시작에 용기가 생기는 흐름이 만들어집니다. 아이디어가 잘 떠오르지 않던 시기라면 초록 소품 하나가 생각보다 큰 변화의 트리거가 되기도 합니다.",
  },
  fire: {
    declare:
      "당신의 사주에서 화 기운이 부족한 구조입니다. 화는 자신감·인기·표현력·열정의 에너지로, 이 기운이 약하면 자신을 드러내는 것이 어렵거나 존재감이 묻히는 느낌이 반복되기 쉽습니다.",
    items:
      "빨간색·주황색 소품이나 향초, 따뜻한 조명을 공간에 들이면 위축되어 있던 표현 에너지가 서서히 올라옵니다. 립제품처럼 얼굴에 화 기운을 직접 올리는 방식도 자신감을 빠르게 끌어올리는 데 효과적입니다.",
    effect:
      "사람들의 시선이 자연스럽게 내 쪽으로 향하기 시작하고, 표현하고 싶었지만 망설였던 것들을 꺼낼 용기가 생깁니다. 발표·대화·SNS처럼 나를 드러내는 상황에서 훨씬 편안해지는 흐름이 만들어집니다.",
  },
  earth: {
    declare:
      "당신의 사주에서 토 기운이 부족한 구조입니다. 토는 안정·재물·기반·신뢰의 에너지로, 이 기운이 약하면 재정이 들쑥날쑥하거나 생활 루틴이 잘 잡히지 않는 패턴이 반복되기 쉽습니다.",
    items:
      "브라운·베이지 계열의 가죽 지갑이나 도자기 소품처럼 땅의 기운이 담긴 물건을 가까이 두면 흩어지던 에너지가 한곳으로 모이기 시작합니다. 황수정이나 호안석 같은 원석도 토 기운을 보충하는 데 자주 쓰이는 아이템입니다.",
    effect:
      "재물의 흐름이 안정되고, 생활 리듬이 규칙적으로 잡히는 흐름이 만들어집니다. 신뢰감이 올라가면서 중요한 관계나 계약에서 좋은 결과가 따라오기 쉬워집니다.",
  },
  metal: {
    declare:
      "당신의 사주에서 금 기운이 부족한 구조입니다. 금은 결단력·카리스마·실행력·집중의 에너지로, 이 기운이 약하면 결정을 내리는 것이 어렵거나 행동으로 옮기기까지 시간이 오래 걸리는 패턴이 생기기 쉽습니다.",
    items:
      "금속 액세서리나 메탈 밴드 시계처럼 몸에 직접 닿는 금속 소품이 금 기운을 가장 빠르게 보충합니다. 흰색 의류나 은색 소품을 일상에 더하는 것만으로도 결단력과 집중력이 눈에 띄게 올라오는 경험을 하기 쉽습니다.",
    effect:
      "미뤄두던 결정을 드디어 내리게 되고, 실행력이 살아나면서 계획이 현실로 연결되기 시작합니다. 주변에서 리더십이 있다는 인상을 받는 일이 늘어나는 흐름이 만들어집니다.",
  },
  water: {
    declare:
      "당신의 사주에서 수 기운이 부족한 구조입니다. 수는 지혜·감정 안정·직감·유연성의 에너지로, 이 기운이 약하면 감정 기복이 크거나 직관이 잘 작동하지 않는 느낌이 들기 쉽습니다.",
    items:
      "수경식물이나 작은 어항처럼 물의 흐름이 담긴 소품을 공간에 두면 과열되어 있던 에너지가 차분하게 가라앉기 시작합니다. 파란색·네이비 소품이나 아쿠아·머스크 계열 향수도 수 기운을 일상에서 자연스럽게 채우는 좋은 방법입니다.",
    effect:
      "감정이 안정되면서 판단이 맑아지고, 그동안 놓치고 있던 직감이 다시 작동하기 시작합니다. 스트레스가 많던 시기라면 수 기운 아이템 하나가 회복의 속도를 눈에 띄게 올려주는 역할을 합니다.",
  },
};

// 2순위 오행 보조 문장
const SECONDARY_TEXT: Record<Element, string> = {
  wood:
    "보조적으로 목 기운도 함께 채워주면, 기회와 관계의 흐름이 더 빠르게 활성화됩니다. 초록색 소품 하나를 책상 위에 올려두는 것부터 시작해보세요.",
  fire:
    "보조적으로 화 기운도 함께 채워주면, 표현력과 자신감이 더 탄탄하게 뒷받침됩니다. 작은 향초 하나로 시작해보세요.",
  earth:
    "보조적으로 토 기운도 함께 채워주면, 생활의 안정감이 더 빠르게 자리를 잡습니다. 지갑을 브라운 계열로 바꾸는 것부터 시작해보세요.",
  metal:
    "보조적으로 금 기운도 함께 채워주면, 실행력과 집중력이 한층 강해집니다. 손목에 금속 소품 하나를 더해보세요.",
  water:
    "보조적으로 수 기운도 함께 채워주면, 감정 안정과 직감이 더 깊어집니다. 파란색 머그컵이나 유리 소품 하나로 시작해보세요.",
};

// 과다 오행 경고
const SURPLUS_WARN: Record<Element, string> = {
  wood:
    "단, 목 기운은 이미 충분히 채워져 있으니 초록 소품이나 식물을 더 늘리는 것은 오히려 역효과가 날 수 있습니다.",
  fire:
    "단, 화 기운은 이미 충분히 채워져 있으니 빨간색 소품이나 향초를 과하게 사용하는 것은 피하는 것이 좋습니다.",
  earth:
    "단, 토 기운은 이미 충분히 채워져 있으니 물건을 더 쌓아두거나 브라운 소품을 과하게 늘리는 것은 오히려 정체된 에너지를 만들 수 있습니다.",
  metal:
    "단, 금 기운은 이미 충분히 채워져 있으니 금속 액세서리나 흰색 소품을 과하게 늘리는 것은 오히려 예민함을 자극할 수 있습니다.",
  water:
    "단, 수 기운은 이미 충분히 채워져 있으니 파란색 소품이나 물 관련 소품을 과하게 늘리는 것은 오히려 감정이 처지는 흐름을 만들 수 있습니다.",
};

export function getLuckyItemParagraph(params: LuckyItemParams): string {
  const { stems, branches, tone } = params;
  const counts = countElements(stems, branches);
  const entries = Object.entries(counts) as [Element, number][];

  // 부족(0,1개) 오행 우선순위: 0개 → 1개, 최대 2개
  const zeros = entries.filter(([, n]) => n === 0).map(([el]) => el);
  const ones = entries.filter(([, n]) => n === 1).map(([el]) => el);

  const targets: Element[] = [];
  targets.push(...zeros);
  if (targets.length < 2) {
    targets.push(...ones);
  }
  const uniqueTargets = Array.from(new Set(targets)).slice(0, 2);

  // 부족 오행이 아예 없으면, 가장 적은 오행 하나만 추천
  if (uniqueTargets.length === 0) {
    const weakest = entries.sort((a, b) => a[1] - b[1])[0]?.[0] ?? "earth";
    uniqueTargets.push(weakest);
  }

  const primary = uniqueTargets[0];
  const secondary = uniqueTargets[1];

  const parts: string[] = [];

  const primaryTexts = MAIN_TEXT[primary];

  // ① 부족 오행 1순위 해석 (선언 + 아이템 + 효과) — 사용자가 준 문구 그대로 사용
  parts.push(primaryTexts.declare, primaryTexts.items, primaryTexts.effect);

  // ④ 2순위 오행 있으면 간략 추가
  if (secondary) {
    const secText = SECONDARY_TEXT[secondary];
    if (secText) parts.push(secText);
  }

  // 과다 오행 경고 (3개 이상인 오행 모두)
  entries
    .filter(([, n]) => n >= 3)
    .forEach(([el]) => {
      const warn = SURPLUS_WARN[el];
      if (warn) parts.push(warn);
    });

  // 마무리 공통 클로징
  parts.push(
    "행운의 아이템은 마법이 아니라 내 기운의 빈 곳을 채워주는 작은 신호입니다. 거창하게 바꾸지 않아도 됩니다. 지금 할 수 있는 작은 것 하나씩 일상에 스며들게 두는 것만으로도 에너지의 방향이 조금씩 달라지기 시작합니다."
  );

  return parts.join("\n\n").trim();
}

