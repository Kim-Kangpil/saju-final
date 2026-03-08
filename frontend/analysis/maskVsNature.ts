/**
 * 사회적 가면 vs 실제 기질 분석
 * 월주(사회적 가면) vs 시주(실제 기질) 비교.
 * 이론: backend/logic/theories/사주이론(오행, 육친과 십신).txt
 * 십신별로 "겉에서 드러나는 모습"과 "편할 때 드러나는 본성"을 구체 문장으로 서술.
 */

type CharKey = "empathy" | "reality" | "fun";

/** 십신별 “사회에서 먼저 보이는 모습” — 문장에 그대로 넣어도 어색하지 않은 구체 표현 (이론: 비겁=주체성, 식상=표현·활동, 재성=결과·재물, 관성=규율·책임, 인성=학문·수용) */
const TG_MASK_LABEL: Record<string, string> = {
  비견: "스스로 서서 자기 페이스를 지키는 모습",
  겁재: "경쟁이나 자극이 있을 때 오히려 힘이 나는 모습",
  식신: "말과 재능을 넉넉히 나누는 모습",
  상관: "기존 방식보다 새로운 방향을 제시하려는 모습",
  편재: "사람과 상황을 빠르게 읽고 실용적으로 움직이는 모습",
  정재: "꼼꼼하고 흐트러지지 않아 신뢰가 쌓이는 모습",
  편관: "압박이 있을수록 긴장을 잡고 버티는 모습",
  정관: "규칙과 역할을 지키는 모습",
  편인: "독립적으로 생각이 많아 보이는 모습",
  정인: "경청하고 이해하려는 태도가 드러나는 모습",
};

/** 십신별 “편해졌을 때 진하게 드러나는 본성” — 구체 표현 */
const TG_NATURE_LABEL: Record<string, string> = {
  비견: "혼자 결정하고 자기 방향을 고수하는 본성",
  겁재: "지고 싶지 않다는 감각이 바닥에 깔려 있는 본성",
  식신: "좋아하는 걸 즐기고 표현할 때 충전되는 본성",
  상관: "틀에 맞추기보다 자기 방식대로 풀어내야 직성이 풀리는 본성",
  편재: "가능성을 빠르게 감지하고 움직이는 본성",
  정재: "흔들리지 않는 기반을 만드는 게 안정이 되는 본성",
  편관: "도전이나 긴장감이 있어야 집중이 잘 되는 본성",
  정관: "기준과 원칙이 있어야 마음이 안정되는 본성",
  편인: "혼자 생각을 정리하는 시간이 반드시 필요한 본성",
  정인: "상황을 충분히 이해한 뒤에야 움직이는 본성",
};

/** 십신별 “무의식적으로 반복되는 습관” — 구체 표현 */
const TG_HABIT_LABEL: Record<string, string> = {
  비견: "혼자 처리하거나 남에게 기대는 상황을 피하려는 습관",
  겁재: "스트레스가 있을수록 더 밀어붙이거나 경쟁심으로 돌파하려는 습관",
  식신: "긴장이 풀리면 먹고 즐기고 표현하는 쪽으로 흘러가는 습관",
  상관: "답답한 상황에서 참기보다 한마디 하거나 방향을 바꿔버리는 습관",
  편재: "여러 가능성을 동시에 탐색하려는 습관",
  정재: "안정된 루틴으로 돌아가고 불확실한 건 정리해서 만들려는 습관",
  편관: "긴장이 오면 더 집중하거나 스스로 압박을 가해 돌파구를 찾는 습관",
  정관: "규칙이나 순서를 따르고 기준이 흔들리면 불편해지는 습관",
  편인: "혼자 있는 시간을 찾거나 생각에 잠기는 습관",
  정인: "정보를 더 모으거나 한 번 더 확인하려는 습관",
};

/** 십신별 사회적 모드 부연 — 반말 기준, 핵심어 볼드 */
const TG_MASK_DESC: Record<string, string> = {
  비견: "<strong>비슷한 결</strong>의 사람들과 어울릴 때 편하고, 자기 페이스를 잃지 않으려는 경향이 있어",
  겁재: "<strong>경쟁</strong>이나 자극이 있는 환경에서 오히려 에너지가 올라오는 편이야",
  식신: "넉넉하게 <strong>표현</strong>하고 나눠주는 분위기를 자연스럽게 만드는 타입이야",
  상관: "기존 방식에 안주하기보다 <strong>새로운 방향</strong>을 제시하려는 성향이 드러나",
  편재: "사람과 상황을 빠르게 읽고 <strong>실용적</strong>인 선택을 하는 모습으로 비춰져",
  정재: "꼼꼼하고 흐트러지지 않는 인상을 주고, <strong>신뢰감</strong>을 쌓는 데 강한 편이야",
  편관: "<strong>압박</strong>이 있을수록 긴장을 잡고 버티는 모습으로 주변에 기억되곤 해",
  정관: "<strong>규칙</strong>과 역할을 지키는 사람이라는 인상이 먼저 쌓이는 편이야",
  편인: "<strong>독립적</strong>이고 뭔가 생각이 많아 보이는 분위기를 풍기는 타입이야",
  정인: "<strong>경청</strong>하고 이해하려는 태도가 자연스럽게 배어 나오는 편이야",
};

/** 십신별 내면 기질 부연 — 반말 기준, 핵심어 볼드 */
const TG_NATURE_DESC: Record<string, string> = {
  비견: "혼자 <strong>결정</strong>하고 혼자 책임지는 게 편하고, 누군가의 페이스에 끌려가는 걸 불편해해",
  겁재: "<strong>지고 싶지 않다</strong>는 감각이 바닥에 깔려 있고, 자극이 있어야 집중이 잘 돼",
  식신: "좋아하는 걸 충분히 즐기고 <strong>표현</strong>할 때 에너지가 충전되는 타입이야",
  상관: "틀에 맞추기보다 <strong>자기 방식</strong>대로 풀어내야 직성이 풀리는 편이야",
  편재: "<strong>가능성</strong>을 빠르게 감지하고 움직이는 게 본성이라 루틴보다는 변화가 맞아",
  정재: "<strong>흔들리지 않는 기반</strong>을 만드는 게 심리적 안정이 되고, 예측 가능한 흐름을 선호해",
  편관: "<strong>도전</strong>이나 긴장감이 있어야 집중이 잘 되고, 느슨한 환경보다 당기는 자극이 필요해",
  정관: "<strong>기준</strong>과 원칙이 있어야 마음이 안정되고, 그 틀 안에서 꼼꼼하게 움직이는 걸 좋아해",
  편인: "혼자 <strong>생각 정리</strong>하는 시간이 반드시 필요하고, 직관으로 판단하는 경우가 많아",
  정인: "상황을 충분히 <strong>이해</strong>하고 나서야 움직이는 편이라 섣불리 결론 내리는 걸 불편해해",
};

/** 시지 십신별 무의식 습관 부연 — 반말 기준, 핵심어 볼드 */
const TG_HABIT_DESC: Record<string, string> = {
  비견: "자기도 모르게 <strong>혼자 처리</strong>하거나, 남에게 기대는 상황을 피하려는 패턴이 나와",
  겁재: "스트레스를 받을수록 오히려 더 밀어붙이거나 <strong>경쟁심</strong>으로 돌파하려는 경향이 있어",
  식신: "긴장이 풀리면 먹고 즐기고 <strong>표현</strong>하는 쪽으로 자연스럽게 흘러가는 편이야",
  상관: "답답한 상황에서 참기보다 <strong>한마디</strong> 하거나 방향을 바꿔버리는 쪽을 선택하기 쉬워",
  편재: "행동이 빨라지고 여러 <strong>가능성</strong>을 동시에 탐색하려는 본능이 올라와",
  정재: "<strong>안정된 루틴</strong>으로 돌아가려 하고, 불확실한 건 정리해서 안전하게 만들려는 습관이 있어",
  편관: "긴장이 오면 더 집중하거나 스스로 <strong>압박</strong>을 가해서 돌파구를 찾으려는 성향이 나와",
  정관: "<strong>규칙</strong>이나 순서를 자연스럽게 따르고, 기준이 흔들리면 불편함이 생기는 패턴이 있어",
  편인: "<strong>혼자 있는 시간</strong>을 찾거나 생각에 잠기는 모드로 전환하는 게 본능적으로 나와",
  정인: "정보를 더 모으거나 <strong>한 번 더 확인</strong>하려는 습관이 반복되는 편이야",
};

/** 십이운성 -> 문장용 뉘앙스 (반말 기준), 핵심어 볼드 */
const STATE_VIBE: Record<string, { lead: string; after: string; extra: string }> = {
  장생: {
    lead: "<strong>존재감</strong>이 또렷한 편이라",
    after: "처음 만나는 자리에서도 금방 티가 나.",
    extra: "에너지가 자연스럽게 밖으로 흘러서 굳이 애쓰지 않아도 <strong>인상</strong>이 남는 편이야.",
  },
  건록: {
    lead: "톤이 <strong>단단</strong>해서",
    after: "말과 행동에 힘이 실리는 편이야.",
    extra: "자기 페이스를 잃지 않고 유지하는 힘이 있어서 주변에 <strong>안정감</strong>을 주기도 해.",
  },
  제왕: {
    lead: "<strong>임팩트</strong>가 강해서",
    after: "주도권을 잡기 쉬운 편이야.",
    extra: "에너지의 밀도가 높아서 같은 말을 해도 더 세게 들리는 경우가 많아.",
  },
  목욕: {
    lead: "분위기에 맞춰",
    after: "부드럽게 <strong>스며드는</strong> 편이야.",
    extra: "유연하게 상황에 녹아드는 힘이 있어서 어색한 자리에서도 잘 적응하는 편이야.",
  },
  태: {
    lead: "상황을 <strong>살피면서</strong>",
    after: "천천히 드러나는 편이야.",
    extra: "성급하게 나서지 않고 분위기를 먼저 읽고 움직이는 스타일이야.",
  },
  양: {
    lead: "밝게 맞춰",
    after: "가볍게 <strong>친해지는</strong> 편이야.",
    extra: "처음부터 경계가 낮아서 사람들이 편하게 다가오기 쉬운 분위기가 있어.",
  },
  태지: {
    lead: "무리 없이",
    after: "부드럽게 <strong>존재감</strong>을 남기는 편이야.",
    extra: "억지로 드러내지 않아도 천천히 신뢰가 쌓이는 타입이야.",
  },
  관대: {
    lead: "자연스럽게",
    after: "격을 갖추되 <strong>편안한</strong> 편이야.",
    extra: "예의 바른 인상과 친근함이 동시에 느껴져서 거부감이 적은 편이야.",
  },
  쇠: {
    lead: "겉으로는 담백해 보여도",
    after: "알수록 <strong>깊이</strong>가 느껴지는 편이야.",
    extra: "처음엔 조용해 보이지만 시간이 지날수록 무게감이 드러나는 타입이야.",
  },
  병: {
    lead: "겉으로는 조용해도",
    after: "내면 <strong>에너지</strong>가 꽤 도는 편이야.",
    extra: "표면은 잔잔해 보이지만 안에서는 꽤 많은 게 돌아가고 있는 편이야.",
  },
  사: {
    lead: "겉은 차분한데",
    after: "집중할 때 <strong>몰입</strong>이 강한 편이야.",
    extra: "평소엔 조용하지만 관심 있는 주제에서는 에너지가 갑자기 올라오는 타입이야.",
  },
  절: {
    lead: "감정을 아껴 쓰는 듯하지만",
    after: "<strong>선과 기준</strong>이 분명한 편이야.",
    extra: "말을 아끼는 만큼 한번 꺼내는 말에 무게가 실리는 타입이야.",
  },
  묘: {
    lead: "겉은 얌전해 보여도",
    after: "속은 <strong>단단한</strong> 편이야.",
    extra: "부드러운 인상 뒤에 흔들리지 않는 기준이 있어서 쉽게 흔들리지 않아.",
  },
  절지: {
    lead: "겉으로는 단정한데",
    after: "속에는 강한 <strong>기준</strong>이 있는 편이야.",
    extra: "정돈된 외양 안에 자기만의 원칙이 꽤 단단하게 자리 잡고 있어.",
  },
  쇠지: {
    lead: "말수는 적어도",
    after: "<strong>핵심</strong>만 남기는 편이야.",
    extra: "불필요한 걸 덜어내는 감각이 있어서 말이 짧아도 기억에 남는 편이야.",
  },
  병지: {
    lead: "표정은 덤덤해도",
    after: "속은 <strong>에너지</strong>가 큰 편이야.",
    extra: "외부로 잘 드러내지 않을 뿐, 내부에서는 꽤 많은 에너지가 순환하고 있어.",
  },
};

/** 조합 한 줄 요약 + 부연 (반말 기준), 핵심어 볼드 */
const COMBO_DATA: Record<string, { oneLiner: string; detail: string }> = {
  "편관-식신": {
    oneLiner: "겉은 <strong>단단</strong>한데 속은 의외로 <strong>유연</strong>한 조합",
    detail: "밖에서는 절도 있어 보이지만 실제로는 자기 페이스로 즐기고 <strong>표현</strong>하는 시간이 꼭 필요한 타입이야.",
  },
  "정관-식신": {
    oneLiner: "겉은 <strong>정돈</strong>돼 보이지만 속은 자유도가 높은 조합",
    detail: "규칙적으로 보이지만 실제로는 여유롭게 표현하고 즐기는 <strong>공간</strong>이 있어야 오래 버티는 타입이야.",
  },
  "편관-상관": {
    oneLiner: "겉은 절도 있고 속은 <strong>돌파욕</strong>이 같이 도는 조합",
    detail: "긴장을 잘 잡으면서도 안으로는 현 상황을 <strong>바꾸고 싶다</strong>는 충동이 동시에 흐르는 편이야.",
  },
  "정관-상관": {
    oneLiner: "겉은 안정적이고 속은 <strong>변화</strong>를 만들고 싶은 조합",
    detail: "차분해 보이지만 속으로는 기존 방식보다 더 나은 방향을 꾸준히 <strong>모색</strong>하는 편이야.",
  },
  "편재-편인": {
    oneLiner: "겉은 <strong>현실</strong>적인데 속은 생각이 많은 조합",
    detail: "빠르게 판단하고 움직이는 것처럼 보여도 혼자 오래 <strong>생각</strong>하는 시간이 꼭 필요한 타입이야.",
  },
  "정재-편인": {
    oneLiner: "겉은 <strong>안정</strong>지향인데 속은 혼자 정리 시간이 필요한 조합",
    detail: "꼼꼼하고 안정감을 주는 이미지 뒤에 혼자만의 <strong>사색</strong> 공간이 없으면 쉽게 지치는 편이야.",
  },
  "편재-정인": {
    oneLiner: "겉은 <strong>실리</strong>감각이고 속은 이해와 배려가 큰 조합",
    detail: "기민하게 움직이면서도 관계에서는 충분히 <strong>이해</strong>하고 맞춰가려는 성향이 공존하는 편이야.",
  },
  "정재-정인": {
    oneLiner: "겉도 속도 <strong>안정</strong>을 추구하는 조합",
    detail: "급격한 변화보다 <strong>점진적</strong>인 방향이 잘 맞고, 검증된 것들 안에서 힘을 발휘하는 타입이야.",
  },
  "식신-비견": {
    oneLiner: "겉은 <strong>친근</strong>한데 속은 주도권 욕구가 있는 조합",
    detail: "편하게 대화하고 표현하면서도 실제로는 자기 방향대로 <strong>이끌고 싶은</strong> 욕구가 바닥에 깔린 편이야.",
  },
  "상관-비견": {
    oneLiner: "겉은 <strong>직설</strong>적인데 속은 자존심이 강한 조합",
    detail: "말이 거침없어 보여도 안으로는 자기 기준에 대한 <strong>자부심</strong>이 꽤 강하게 자리 잡고 있어.",
  },
  "식신-겁재": {
    oneLiner: "겉은 유쾌한데 속은 <strong>승부욕</strong>이 살아 있는 조합",
    detail: "여유롭고 친근해 보이지만 <strong>지고 싶지 않다</strong>는 감각이 은근히 동력이 되어 움직이는 편이야.",
  },
  "상관-겁재": {
    oneLiner: "겉은 <strong>강단</strong> 있어 보이고 속은 경쟁심이 불붙는 조합",
    detail: "외부에서는 <strong>돌파력</strong> 있게 보이면서 내부에서는 자극이 클수록 불이 붙는 타입이야.",
  },
  "편인-편재": {
    oneLiner: "겉은 <strong>사색</strong>가인데 속은 결과도 챙기고 싶은 조합",
    detail: "조용하고 생각이 많아 보이지만 실제로는 현실적인 <strong>성과</strong>나 가능성도 꼼꼼히 계산하는 편이야.",
  },
  "정인-편재": {
    oneLiner: "겉은 <strong>이해</strong>형인데 속은 실리 계산도 빠른 조합",
    detail: "듣고 이해하는 태도가 앞에 나오지만 실제로는 상황의 <strong>이득과 손해</strong>를 빠르게 읽는 편이야.",
  },
  "편인-정재": {
    oneLiner: "겉은 사색형이고 속은 <strong>안정</strong>과 루틴을 원하는 조합",
    detail: "사색적으로 보이지만 실제로는 흔들리지 않는 <strong>기반</strong>과 반복 루틴이 있어야 안심하는 타입이야.",
  },
  "정인-정재": {
    oneLiner: "겉도 속도 <strong>안정</strong>적인 선택을 선호하는 조합",
    detail: "외부에서도 내부에서도 안전하고 <strong>검증된</strong> 방향을 선호해서 점진적인 변화가 잘 맞는 편이야.",
  },
};

interface MaskVsNatureResult {
  text: string;
}

const pick = <T,>(v: T | undefined, fallback: T) => (v === undefined ? fallback : v);

function joinLines(lines: string[]) {
  return lines.filter(Boolean).join("\n\n");
}

/** 반말 → 자연스러운 -요/-에요 말투 (empathy 전용) */
function toEmpathy(str: string): string {
  return str
    .replace(/편이야$/g, "편이에요")
    .replace(/타입이야$/g, "타입이에요")
    .replace(/스타일이야$/g, "스타일이에요")
    .replace(/이야$/g, "이에요")
    .replace(/곤 해$/g, "곤 해요")
    .replace(/경향이 있어$/g, "경향이 있어요")
    .replace(/나와$/g, "나와요")
    .replace(/올라와$/g, "올라와요")
    .replace(/있어$/g, "있어요")
    .replace(/맞아$/g, "맞아요")
    .replace(/선호해$/g, "선호해요")
    .replace(/불편해해$/g, "불편해해요")
    .replace(/좋아해$/g, "좋아해요")
    .replace(/필요해$/g, "필요해요")
    .replace(/드러나$/g, "드러나요")
    .replace(/비춰져$/g, "비춰져요")
    .replace(/않아$/g, "않아요")
    .replace(/많아$/g, "많아요")
    .replace(/잘 돼$/g, "잘 돼요")
    .replace(/기도 해$/g, "기도 해요")
    .replace(/쉬워$/g, "쉬워요")
    .replace(/편이라 /g, "편이라서 ")
    .replace(/해$/g, "해요")
    .replace(/야$/g, "야요");
}

/** 반말 → 격식체 (reality 전용) */
function toFormal(str: string): string {
  return str
    .replace(/편이야$/g, "편입니다")
    .replace(/타입이야$/g, "타입입니다")
    .replace(/스타일이야$/g, "스타일입니다")
    .replace(/이야$/g, "입니다")
    .replace(/곤 해$/g, "곤 합니다")
    .replace(/기도 해$/g, "기도 합니다")
    .replace(/경향이 있어$/g, "경향이 있습니다")
    .replace(/나와$/g, "나타납니다")
    .replace(/있어$/g, "있습니다")
    .replace(/맞아$/g, "맞습니다")
    .replace(/선호해$/g, "선호합니다")
    .replace(/불편해해$/g, "불편해합니다")
    .replace(/좋아해$/g, "좋아합니다")
    .replace(/필요해$/g, "필요합니다")
    .replace(/드러나$/g, "드러납니다")
    .replace(/비춰져$/g, "비춰집니다")
    .replace(/않아$/g, "않습니다")
    .replace(/많아$/g, "많습니다")
    .replace(/잘 돼$/g, "잘 됩니다")
    .replace(/기도 해$/g, "기도 합니다")
    .replace(/쉬워$/g, "쉽습니다")
    .replace(/야$/g, "는 편입니다");
}

/**
 * 사회적 가면 vs 실제 기질 분석 (400~500자 보장 버전)
 */
export function analyzeMaskVsNature(
  monthStemTenGod: string,   // 월간 십신
  monthTwelveState: string,  // 월간의 십이운성
  hourStemTenGod: string,    // 시간 십신
  hourBranchTenGod: string,  // 시지 십신 (지장간 본기 기준)
  selectedChar: CharKey
): MaskVsNatureResult {
  const maskLabel   = pick(TG_MASK_LABEL[monthStemTenGod],   "사회에서 자기만의 색이 드러나는 모습");
  const natureLabel = pick(TG_NATURE_LABEL[hourStemTenGod],  "편한 환경에서 다른 결이 올라오는 본성");
  const habitLabel  = pick(TG_HABIT_LABEL[hourBranchTenGod], "무의식적으로 반복되는 패턴");

  const maskDesc   = pick(TG_MASK_DESC[monthStemTenGod],   "사회적 자리에서 자기만의 색이 드러나는 편이야");
  const natureDesc = pick(TG_NATURE_DESC[hourStemTenGod],  "편한 환경에서는 다른 결이 올라오는 편이야");
  const habitDesc  = pick(TG_HABIT_DESC[hourBranchTenGod], "무의식적인 반응 패턴이 반복되는 편이야");

  const state = pick(STATE_VIBE[monthTwelveState], {
    lead:  "자연스럽게",
    after: "무난하게 드러나는 편이야.",
    extra: "딱히 힘을 주지 않아도 그 분위기가 배어 나오는 타입이야.",
  });

  const comboKey = `${monthStemTenGod}-${hourStemTenGod}`;
  const combo = pick(COMBO_DATA[comboKey], {
    oneLiner: "겉과 속의 결이 꽤 다른 조합",
    detail:   "밖에서 보이는 모습과 혼자 있을 때의 결이 달라서 가까워질수록 다른 면이 보이는 타입이야.",
  });

  // extra 필드 끝 마침표 제거 헬퍼 (변환 후 문장 중간에 들어가므로)
  const extraClean = (str: string) => str.replace(/\.$/, "");

  // ── fun (반말) ──────────────────────────────────────────────
  if (selectedChar === "fun") {
    const lines = [
      `밖에서는 ${maskLabel}이 먼저 드러나는 타입이야. ${extraClean(state.extra)}. ${state.lead} 주변은 너를 그쪽 이미지로 기억하기 쉬워. ${maskDesc}.`,
      `편해지면 결이 달라져. 이때는 ${natureLabel}이 훨씬 진하게 올라오는데, ${natureDesc}. 무의식적으로는 ${habitLabel}도 함께 나오고, ${habitDesc}.`,
      `한 줄로 정리하면 ${combo.oneLiner}야. ${combo.detail} 사회에서는 이런 사람, 사적으로는 저런 사람 느낌이 동시에 살아. 둘 다 진짜 네 모습이고, 그래서 중요한 순간에 상황에 맞는 능력을 쓰는 힘이 있어.`,
    ];
    return { text: joinLines(lines) };
  }

  // ── reality (격식 · 정보 중심) ─────────────────────────────
  if (selectedChar === "reality") {
    const lines = [
      `공적 자리에서는 ${maskLabel}이 먼저 드러납니다. ${toFormal(extraClean(state.extra))}. ${state.lead} 주변은 당신을 그쪽 이미지로 기억하게 됩니다. ${toFormal(maskDesc)}.`,
      `편한 환경에서는 ${natureLabel}이 주도권을 잡습니다. ${toFormal(natureDesc)}. 무의식에서는 ${habitLabel}이 반복 패턴으로 나타나고, ${toFormal(habitDesc)}.`,
      `정리하면 ${combo.oneLiner}입니다. ${toFormal(combo.detail)} 두 면 모두 실제 기질이며, 상황에 따라 어떤 역량을 쓰느냐가 달라지는 구조입니다.`,
    ];
    return { text: joinLines(lines) };
  }

  // ── empathy (공감형 · 자연스러운 -요/-에요 말투) ──────────
  const lines = [
    `밖에서는 ${maskLabel}이 자연스럽게 먼저 드러나는 편이에요. ${toEmpathy(extraClean(state.extra))}. ${state.lead} 주변에서는 그쪽 이미지로 기억하기 쉬워요. ${toEmpathy(maskDesc)}.`,
    `편해지면 결이 달라지는 편이에요. 이때는 ${natureLabel}이 훨씬 진하게 올라오는데, ${toEmpathy(natureDesc)}. 무의식적으로는 ${habitLabel}도 함께 올라오고, ${toEmpathy(habitDesc)}.`,
    `한 줄로 요약하면 ${combo.oneLiner}예요. ${toEmpathy(combo.detail)} 둘 다 진짜 당신의 모습이라서, 중요한 순간에 상황에 맞는 능력을 쓰는 힘이 있어요.`,
  ];
  return { text: joinLines(lines) };
}