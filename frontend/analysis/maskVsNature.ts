/**
 * 사회적 가면 vs 실제 기질 분석
 * 월주(사회적 가면) vs 시주(실제 기질) 비교
 */

type CharKey = "empathy" | "reality" | "fun";

/** 십신을 문장에 자연스럽게 넣기 위한 짧은 라벨 */
const TG_LABEL: Record<string, string> = {
  비견: "자기주도",
  겁재: "승부욕",
  식신: "표현력",
  상관: "돌파력",
  편재: "실리감각",
  정재: "안정지향",
  편관: "긴장감",
  정관: "책임감",
  편인: "사색",
  정인: "이해력",
};

/** 십이운성 -> 문장용 뉘앙스 */
const STATE_VIBE: Record<string, { lead: string; after: string }> = {
  장생: { lead: "존재감이 또렷한 편이라", after: "처음 만나는 자리에서도 금방 티가 나." },
  건록: { lead: "톤이 단단해서", after: "말과 행동에 힘이 실리는 편이야." },
  제왕: { lead: "임팩트가 강해서", after: "주도권을 잡기 쉬운 편이야." },

  목욕: { lead: "분위기에 맞춰", after: "부드럽게 스며드는 편이야." },
  태: { lead: "상황을 살피면서", after: "천천히 드러나는 편이야." },
  양: { lead: "밝게 맞춰", after: "가볍게 친해지는 편이야." },
  태지: { lead: "무리 없이", after: "부드럽게 존재감을 남기는 편이야." },
  관대: { lead: "자연스럽게", after: "격을 갖추되 편안한 편이야." },

  쇠: { lead: "겉으로는 담백해 보여도", after: "알수록 깊이가 느껴지는 편이야." },
  병: { lead: "겉으로는 조용해도", after: "내면 에너지가 꽤 도는 편이야." },
  사: { lead: "겉은 차분한데", after: "집중할 때 몰입이 강한 편이야." },
  절: { lead: "감정을 아껴 쓰는 듯하지만", after: "선과 기준이 분명한 편이야." },
  묘: { lead: "겉은 얌전해 보여도", after: "속은 단단한 편이야." },

  절지: { lead: "겉으로는 단정한데", after: "속에는 강한 기준이 있는 편이야." },
  쇠지: { lead: "말수는 적어도", after: "핵심만 남기는 편이야." },
  병지: { lead: "표정은 덤덤해도", after: "속은 에너지가 큰 편이야." },
};

/** 조합 한 줄 요약 */
const COMBO_ONE_LINER: Record<string, string> = {
  "편관-식신": "겉은 단단한데 속은 의외로 유연한 조합",
  "정관-식신": "겉은 정돈돼 보이지만 속은 자유도가 높은 조합",
  "편관-상관": "겉은 책임감, 속은 돌파욕이 같이 도는 조합",
  "정관-상관": "겉은 안정적, 속은 변화를 만들고 싶은 조합",

  "편재-편인": "겉은 현실적인데 속은 생각이 많은 조합",
  "정재-편인": "겉은 안정지향인데 속은 혼자 정리 시간이 필요한 조합",
  "편재-정인": "겉은 실리감각, 속은 이해와 배려가 큰 조합",
  "정재-정인": "겉은 차분한 이해, 속은 안정적인 선택을 선호하는 조합",

  "식신-비견": "겉은 친근한데 속은 주도권 욕구가 있는 조합",
  "상관-비견": "겉은 직설적인데 속은 자존심이 강한 조합",
  "식신-겁재": "겉은 유쾌한데 속은 승부욕이 살아 있는 조합",
  "상관-겁재": "겉은 강단 있어 보이고 속은 경쟁심이 불붙는 조합",

  "편인-편재": "겉은 사색가인데 속은 결과도 챙기고 싶은 조합",
  "정인-편재": "겉은 이해력인데 속은 실리 계산도 빠른 조합",
  "편인-정재": "겉은 생각, 속은 안정과 루틴을 원하는 조합",
  "정인-정재": "겉은 차분한 이해, 속은 안정적인 선택을 원하는 조합",
};

interface MaskVsNatureResult {
  text: string;
}

const pick = <T,>(v: T | undefined, fallback: T) => (v === undefined ? fallback : v);

function joinLines(lines: string[]) {
  return lines.filter(Boolean).join("\n\n");
}

function toPolite(str: string) {
  return str
    .replace(/나\./g, "요.")
    .replace(/야\./g, "요.")
    .replace(/야$/g, "요")
    .replace(/해\./g, "해요.")
    .replace(/해$/g, "해요")
    .replace(/거야\./g, "거예요.")
    .replace(/거야$/g, "거예요")
    .replace(/있어\./g, "있어요.")
    .replace(/있어$/g, "있어요")
    .replace(/보여\./g, "보여요.")
    .replace(/보여$/g, "보여요")
    .replace(/필요해\./g, "필요해요.")
    .replace(/필요해$/g, "필요해요")
    .replace(/쉬워\./g, "쉬워요.")
    .replace(/쉬워$/g, "쉬워요");
}

/**
 * 사회적 가면 vs 실제 기질 분석
 */
export function analyzeMaskVsNature(
  monthStemTenGod: string, // 월간 십신
  monthTwelveState: string, // 월간의 십이운성
  hourStemTenGod: string, // 시간 십신
  hourBranchTenGod: string, // 시지 십신 (지장간 본기 기준)
  selectedChar: CharKey
): MaskVsNatureResult {
  const mask = pick(TG_LABEL[monthStemTenGod], "개성");
  const nature = pick(TG_LABEL[hourStemTenGod], "본질");
  const habit = pick(TG_LABEL[hourBranchTenGod], "습관");

  const state = pick(STATE_VIBE[monthTwelveState], {
    lead: "자연스럽게",
    after: "무난하게 드러나는 편이야.",
  });

  const comboKey = `${monthStemTenGod}-${hourStemTenGod}`;
  const oneLiner = pick(COMBO_ONE_LINER[comboKey], "겉과 속의 결이 꽤 다른 조합");

  // 기본 문장(반복감 줄이려고 3덩어리로)
  const baseLinesBanmal = [
    `밖에서는 ${mask} 쪽이 먼저 켜지는 타입이야. ${state.lead} 그 분위기로 들어가서, 주변은 너를 그쪽 이미지로 기억하기 쉽고. ${state.after}`,
    `근데 편해지면 결이 달라져. 이때는 ${nature}이 더 진하게 올라오고, 무의식은 ${habit} 쪽으로 슥 흘러가기도 해.`,
    `한 줄로 정리하면 ${oneLiner}야. 그래서 사회에서는 “이런 사람”, 사적으로는 “저런 사람” 느낌이 동시에 살아.`,
  ];

  // empathy / reality는 존댓말, fun은 반말
  if (selectedChar === "fun") {
    return { text: joinLines(baseLinesBanmal) };
  }

  if (selectedChar === "reality") {
    const lines = [
      `공적인 자리에서는 ${mask} 성향이 먼저 작동하는 편입니다. ${state.lead} 그 모드가 앞에 나와서, 주변은 당신을 그쪽 이미지로 기억하기 쉽습니다.`,
      `반면 편한 환경에서는 결이 달라집니다. 이때는 ${nature}이 더 진해지고, 무의식적으로는 ${habit} 성향이 반복 패턴처럼 나타날 수 있습니다.`,
      `요약하면 ${oneLiner}입니다. 이 간극이 클수록 “밖에서 에너지 소모 → 안에서 회복” 흐름이 뚜렷해지는 편입니다.`,
    ];
    return { text: joinLines(lines) };
  }

  // empathy
  const lines = [
    `밖에서는 당신이 일부러 힘주지 않아도 ${mask} 쪽이 자연스럽게 앞에 나오는 편이에요. ${state.lead} 분위기에 맞춰 들어가서, 주변이 당신을 그 이미지로 기억하기 쉬워요. ${toPolite(state.after)}`,
    `그런데 가까운 사람들 앞이나 혼자 있을 때는 결이 달라져요. 이때는 ${nature}이 훨씬 편하고, 무의식적으로는 ${habit} 성향이 습관처럼 튀어나올 수 있어요.`,
    `한 줄로 요약하면 ${oneLiner}예요. 둘 중 하나가 가짜가 아니라, 상황에 따라 스위치가 바뀌는 타입이라서 오히려 폭이 넓게 느껴질 수 있어요.`,
  ];
  return { text: joinLines(lines) };
}