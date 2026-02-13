// frontend/data/specialStarsAnalysis.ts

export const SPECIAL_STARS_ANALYSIS = {
  empathy: {
    title: "당신의 인생 시나리오에 숨겨진 황금 카드",
    icon: "🌟",
  },
  reality: {
    title: "인생 시나리오 내 특수 변수 및 잠재력 로그 분석",
    icon: "📋",
  },
  fun: {
    title: "인생 역전의 기회! 네 사주 속에 숨겨진 황금 카드 찾기",
    icon: "🎴",
  },
};

// 도화살 판정표 (일지 기준)
const 도화살표: Record<string, string[]> = {
  "子": ["酉"],
  "丑": ["午"],
  "寅": ["卯"],
  "卯": ["子"],
  "辰": ["酉"],
  "巳": ["午"],
  "午": ["卯"],
  "未": ["子"],
  "申": ["酉"],
  "酉": ["午"],
  "戌": ["卯"],
  "亥": ["子"],
};

// 역마살 판정표
const 역마살표: Record<string, string[]> = {
  "子": ["寅"],
  "丑": ["亥"],
  "寅": ["申"],
  "卯": ["巳"],
  "辰": ["寅"],
  "巳": ["亥"],
  "午": ["申"],
  "未": ["巳"],
  "申": ["寅"],
  "酉": ["亥"],
  "戌": ["申"],
  "亥": ["巳"],
};

// 화개살 판정표
const 화개살표: Record<string, string[]> = {
  "子": ["辰"],
  "丑": ["丑"],
  "寅": ["戌"],
  "卯": ["未"],
  "辰": ["辰"],
  "巳": ["丑"],
  "午": ["戌"],
  "未": ["未"],
  "申": ["辰"],
  "酉": ["丑"],
  "戌": ["戌"],
  "亥": ["未"],
};

// 신살 판정 함수
export function analyzeSpecialStars(
  dayBranch: string,
  yearBranch: string,
  monthBranch: string,
  hourBranch: string
): {
  stars: Array<{ name: string; description: string }>;
  empathy: string;
  reality: string;
  fun: string;
} {
  const stars: Array<{ name: string; description: string }> = [];
  const branches = [yearBranch, monthBranch, dayBranch, hourBranch];

  // 1. 도화살 체크
  const 도화지지 = 도화살표[dayBranch] || [];
  let has도화 = false;

  branches.forEach(branch => {
    if (도화지지.includes(branch)) {
      has도화 = true;
    }
  });

  if (has도화) {
    stars.push({
      name: "도화살",
      description: "이성에게 인기가 많고 매력적입니다. 예술적 재능과 사교성이 뛰어나요.",
    });
  }

  // 2. 역마살 체크
  const 역마지지 = 역마살표[dayBranch] || [];
  let has역마 = false;

  branches.forEach(branch => {
    if (역마지지.includes(branch)) {
      has역마 = true;
    }
  });

  if (has역마) {
    stars.push({
      name: "역마살",
      description: "이동과 변화가 많습니다. 여행, 이사, 직장 이동 등 활동적인 삶을 살아요.",
    });
  }

  // 3. 화개살 체크
  const 화개지지 = 화개살표[dayBranch] || [];
  let has화개 = false;

  branches.forEach(branch => {
    if (화개지지.includes(branch)) {
      has화개 = true;
    }
  });

  if (has화개) {
    stars.push({
      name: "화개살",
      description: "예술, 종교, 철학에 관심이 많습니다. 영적이고 신비로운 일에 재능이 있어요.",
    });
  }

  // 설명 생성
  const starNames = stars.map(s => s.name).join(", ");

  const descriptions = {
    empathy:
      stars.length > 0
        ? `${starNames}을(를) 가지고 있어요. 특별한 재능과 기회가 숨어 있답니다. ${stars.map(s => s.description).join(" ")} 이런 특별함이 당신을 더욱 빛나게 만들 거예요.`
        : "평온하고 안정적인 흐름을 가진 사주예요. 극적인 변화보다는 꾸준함이 당신의 무기입니다. 특별한 신살이 없다는 것은 차분하고 안정적인 삶을 살 수 있다는 의미예요.",
    reality:
      stars.length > 0
        ? `특수 변수 활성화: ${starNames}. 잠재력 로그 ${stars.length}건 검출. ${stars.map(s => `[${s.name}] ${s.description}`).join(" ")} 특수 능력 활용 시 성과 증폭 예상.`
        : "표준형 구조. 특이 변수 없음. 안정적 패턴 유지. 극단적 변동성 낮음. 예측 가능한 안정적 커리어 패스.",
    fun:
      stars.length > 0
        ? `야! 너 ${starNames} 있어! 이거 대박 카드야! ${stars.map(s => s.description).join(" ")} 잘 쓰면 인생 역전이야!`
        : "특별한 신살은 없네. 근데 괜찮아! 평범한 게 가장 좋은 거야! 극적인 일 없이 잘 살 수 있어!",
  };

  return {
    stars,
    empathy: descriptions.empathy,
    reality: descriptions.reality,
    fun: descriptions.fun,
  };
}
