// frontend/data/todayAnalysis.ts

export const TODAY_ANALYSIS = {
  empathy: {
    title: "기분 좋은 예감! 오늘 당신의 럭키 포인트",
    icon: "✨",
  },
  reality: {
    title: "금일 행운 확률 보고서 및 리스크 관리 가이드",
    icon: "📊",
  },
  fun: {
    title: "기분 좋지? 이 텐션 그대로 오늘 하루 찢어버려!",
    icon: "🔥",
  },
};

// 오늘의 운세 생성 함수
export function analyzeTodayFortune(
  strongElement: string,
  characterType: "empathy" | "reality" | "fun"
): {
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  advice: string;
} {
  // 오행별 색상
  const colors: Record<string, string> = {
    wood: "초록색",
    fire: "빨간색",
    earth: "노란색",
    metal: "흰색",
    water: "파란색",
  };

  // 오행별 방향
  const directions: Record<string, string> = {
    wood: "동쪽",
    fire: "남쪽",
    earth: "중앙",
    metal: "서쪽",
    water: "북쪽",
  };

  // 캐릭터별 조언
  const advices = {
    empathy: [
      "오늘은 소중한 사람에게 따뜻한 말 한마디 건네보세요. 작은 친절이 큰 행운을 불러올 거예요.",
      "작은 선물이 큰 행운을 불러올 거예요. 사랑하는 사람에게 마음을 전해보세요.",
      "미소 짓는 순간마다 복이 들어옵니다. 오늘은 특히 밝게 웃어보세요.",
      "감사한 마음을 표현하는 날이에요. 고마운 사람에게 연락해 보세요.",
      "자신에게 작은 선물을 해보세요. 나를 사랑하는 것이 행운의 시작이에요.",
      "오늘은 새로운 시작을 위한 완벽한 날이에요. 용기를 내보세요.",
      "직관을 믿으세요. 오늘 당신의 감이 특히 정확할 거예요.",
      "자연 속에서 힐링하는 시간을 가져보세요. 에너지가 충전될 거예요.",
    ],
    reality: [
      "오전 10시~12시, 중요한 결정에 최적화된 시간대입니다. 이 시간에 핵심 업무를 처리하세요.",
      "데이터 기반 의사결정 시 성공 확률 상승. 감이 아닌 사실에 근거해 판단하세요.",
      "오늘의 효율성 지수: 상위 20%. 집중력이 높은 날입니다. 중요한 일을 우선 처리하세요.",
      "네트워킹 활동 권장. 오늘 만나는 사람이 중요한 기회를 가져올 수 있습니다.",
      "리스크 관리 모드 활성화. 신중한 판단이 필요한 날입니다.",
      "학습 효율 최대치. 새로운 지식을 습득하기 좋은 날입니다.",
      "재무 관리 점검일. 지출 내역을 확인하고 계획을 재점검하세요.",
      "건강 관리 우선. 충분한 휴식과 영양 섭취가 필요합니다.",
    ],
    fun: [
      "오늘 완전 대박 각! 하고 싶은 거 다 해! 오늘만큼은 네 마음대로 살아!",
      "지금 이 기분 그대로 밀어붙여! 성공한다! 망설이지 마!",
      "오늘 너 주인공이야! 기분 좋게 하루 찢어! 다 잘될 거야!",
      "고민하지 마! 오늘은 네 직감 믿고 가! 100% 맞아!",
      "오늘 누가 뭐래도 네 하고 싶은 대로 해! 후회 없게!",
      "텐션 유지해! 이 기분 그대로 밤까지 가면 대박 나!",
      "오늘 만나는 사람이 행운의 열쇠야! 적극적으로 나서!",
      "망설이지 말고 일단 질러! 오늘은 다 잘돼!",
    ],
  };

  // 랜덤 럭키 넘버 (1~100)
  const luckyNumber = Math.floor(Math.random() * 100) + 1;

  // 랜덤 조언 선택
  const randomAdvice = advices[characterType][Math.floor(Math.random() * advices[characterType].length)];

  return {
    luckyColor: colors[strongElement] || "노란색",
    luckyNumber,
    luckyDirection: directions[strongElement] || "남쪽",
    advice: randomAdvice,
  };
}