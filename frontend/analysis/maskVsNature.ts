/**
 * 사회적 가면 vs 실제 기질 분석
 * 월주(사회적 가면) vs 시주(실제 기질) 비교
 */

type CharKey = "empathy" | "reality" | "fun";

// 십신 -> 사회적 가면 이미지
const MASK_TYPE: Record<string, string> = {
  비견: "경쟁·자기주장 이미지",
  겁재: "경쟁·자기주장 이미지",
  식신: "표현력·콘텐츠형 이미지",
  상관: "표현력·콘텐츠형 이미지",
  편재: "결과·실리 중심 이미지",
  정재: "결과·실리 중심 이미지",
  편관: "책임·신뢰 이미지",
  정관: "책임·신뢰 이미지",
  편인: "배움·이해력 이미지",
  정인: "배움·이해력 이미지",
};

// 십이운성 -> 존재감 강도
const INTENSITY_MAP: Record<string, string> = {
  장생: "존재감 강도 높음",
  건록: "존재감 강도 높음",
  제왕: "존재감 강도 높음",
  목욕: "부드럽게 스며듦",
  태: "부드럽게 스며듦",
  양: "부드럽게 스며듦",
  쇠: "존재감은 약하지만 깊이 있음",
  병: "존재감은 약하지만 깊이 있음",
  사: "존재감은 약하지만 깊이 있음",
  절: "존재감은 약하지만 깊이 있음",
  묘: "존재감은 약하지만 깊이 있음",
  태지: "부드럽게 스며듦",
  절지: "존재감은 약하지만 깊이 있음",
  관대: "부드럽게 스며듦",
  쇠지: "존재감은 약하지만 깊이 있음",
  병지: "존재감은 약하지만 깊이 있음",
};

// 가면 vs 본질 조합 예시
const MASK_VS_NATURE_EXAMPLES: Record<string, string> = {
  "편관-식신": "겉은 책임형, 속은 자유 유희형",
  "정관-식신": "겉은 책임형, 속은 자유 유희형",
  "편관-상관": "겉은 책임형, 속은 자유 유희형",
  "정관-상관": "겉은 책임형, 속은 자유 유희형",
  "편재-편인": "겉은 현실적, 속은 생각 많은 사색가",
  "정재-편인": "겉은 현실적, 속은 생각 많은 사색가",
  "편재-정인": "겉은 현실적, 속은 생각 많은 사색가",
  "정재-정인": "겉은 현실적, 속은 생각 많은 사색가",
  "식신-비견": "겉은 표현형, 속은 경쟁심 강함",
  "상관-비견": "겉은 표현형, 속은 경쟁심 강함",
  "식신-겁재": "겉은 표현형, 속은 경쟁심 강함",
  "상관-겁재": "겉은 표현형, 속은 경쟁심 강함",
  "편인-편재": "겉은 배움형, 속은 실리 추구",
  "정인-편재": "겉은 배움형, 속은 실리 추구",
  "편인-정재": "겉은 배움형, 속은 실리 추구",
  "정인-정재": "겉은 배움형, 속은 실리 추구",
};

interface MaskVsNatureResult {
  text: string;
}

/**
 * 사회적 가면 vs 실제 기질 분석
 */
export function analyzeMaskVsNature(
  monthStemTenGod: string,      // 월간 십신
  monthTwelveState: string,      // 월간의 십이운성
  hourStemTenGod: string,        // 시간 십신
  hourBranchTenGod: string,      // 시지 십신 (지장간 본기 기준)
  selectedChar: CharKey
): MaskVsNatureResult {
  // 1. 사회적 가면 (월주)
  const maskType = MASK_TYPE[monthStemTenGod] || "독특한 개성";
  const intensity = INTENSITY_MAP[monthTwelveState] || "보통의 존재감";

  // 2. 실제 기질 (시주)
  const trueNature = MASK_TYPE[hourStemTenGod] || "내면의 본질";
  const unconsciousHabit = MASK_TYPE[hourBranchTenGod] || "무의식적 패턴";

  // 3. 가면 vs 본질 조합
  const comboKey = `${monthStemTenGod}-${hourStemTenGod}`;
  const exampleText = MASK_VS_NATURE_EXAMPLES[comboKey] || "개성적인 조합";

  // 4. 십이운성을 자연스러운 문장으로 변환
  const intensityPhrase = (() => {
    if (monthTwelveState === "장생" || monthTwelveState === "건록" || monthTwelveState === "제왕") {
      return "존재감이 강한 편이라";
    } else if (monthTwelveState === "목욕" || monthTwelveState === "태" || monthTwelveState === "양" || monthTwelveState === "태지" || monthTwelveState === "관대") {
      return "부드럽게 스며드는 방식으로";
    } else {
      return "깊이 있게";
    }
  })();

  // 5. 캐릭터별 톤 적용
  let text = "";

  switch (selectedChar) {
    case "empathy":
      text = `당신은 밖에 나가면 자연스럽게 "${maskType}"의 모습을 띠는 사람이에요. 회사에서든, 모임에서든, 처음 만나는 사람들 앞에서든 이런 이미지가 자동으로 작동하는 편이에요. ${intensityPhrase} 사람들에게 다가가고, 본인도 모르게 그렇게 행동하게 되죠. 주변 사람들도 당신을 그런 사람으로 기억하는 경우가 많아요.

하지만 문을 닫고 집에 돌아오면 완전히 다른 모습이 나타나요. 실제 당신의 본질은 "${trueNature}"에 훨씬 가까워요. 친한 사람들이나 혼자 있을 때는 "${unconsciousHabit}"의 면모가 자연스럽게 흘러나오고요. 이때의 당신이 진짜 편안한 상태예요.

간단히 말하면, ${exampleText}. 이게 가끔 피곤하게 느껴질 수도 있는데, 사실 이런 이중성이 당신을 특별하게 만드는 비밀이에요. 사회에서는 한 가지 모습으로 살아가지만, 실제로는 더 풍부한 내면을 가진 사람이니까요.`;
      break;

    case "reality":
      text = `당신의 사주는 매우 흥미로운 이중 구조를 가지고 있습니다.

월주를 보면 ${monthStemTenGod}이 자리하고 있어 "${maskType}"로 사회적 페르소나를 형성합니다. 십이운성이 ${monthTwelveState}이므로 ${intensity}의 방식으로 작동하죠. 이게 당신이 직장, 사회관계, 공적인 자리에서 쓰는 공식 얼굴입니다. 사람들은 대부분 당신을 이렇게 인식하고 기억합니다.

반면 시주를 보면 완전히 다른 패턴이 나타납니다. 시간 간지가 ${hourStemTenGod}(${trueNature})이고, 시지 본기가 ${hourBranchTenGod}(${unconsciousHabit})입니다. 이게 퇴근 후, 문 닫고 나서, 혼자 있거나 편한 사람들과 있을 때의 진짜 당신이에요.

정리하면 ${exampleText}. 이 간극이 클수록 사회생활 후 피로도가 높아지는 경향이 있습니다. 두 모드가 완전히 다른 사람처럼 느껴질 수 있어요.`;
      break;

    case "fun":
      text = `너 진짜 신기한 사람이야. 밖에서는 "${maskType}" 컨셉 확실히 잡고 나가잖아. ${intensityPhrase} 사람들한테 어필하고. 회사 사람들, 친구들, 처음 보는 사람들한테 그렇게 보이고 싶어하는 거 맞지? 그리고 실제로도 사람들이 너를 그렇게 생각하고 있을 거야.

근데 집 들어오면 완전 딴사람 돼. 진짜 너는 "${trueNature}" 에너지거든. 편한 사람들이랑 있거나 혼자 있을 때 무의식적으로 "${unconsciousHabit}" 모드 자동 켜지는 거 느껴봤을 거야. 그게 진짜 네 모습이야.

쉽게 말하면, ${exampleText}. 이게 좀 피곤할 수 있어. 근데 솔직히 이게 너만의 독특한 포인트야. 밖에서는 한 가지 캐릭터로 살지만, 실제로는 훨씬 더 다층적인 사람이니까.`;
      break;
  }

  return { text };
}
