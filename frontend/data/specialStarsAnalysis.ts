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

type PillarPos = "년" | "월" | "일" | "시";

export interface SpecialStarPillar {
  pos: PillarPos;
  stem: string;   // 천간 (예: '甲')
  branch: string; // 지지 (예: '子')
}

// 이 카드에서는 "특수신살/신살"만 다루고,
// 귀인·월공 등은 별도 섹션에서 처리한다.
type StarKey = "dohwa" | "yeokma" | "hwagae";

interface DetectedStar {
  key: StarKey;
  name: string;
  count: number;
}

// ✅ 역마살 (년지 기준) – sinsal 엔진과 동일
const YEOKMA: Record<string, string> = {
  "子": "寅",
  "午": "申",
  "卯": "巳",
  "酉": "亥",
  "寅": "申",
  "申": "寅",
  "巳": "亥",
  "亥": "巳",
  "辰": "寅",
  "戌": "申",
  "丑": "亥",
  "未": "巳",
};

// ✅ 화개살 (일지 기준) – sinsal 엔진과 동일
const HWAGAE: Record<string, string> = {
  "子": "辰",
  "午": "戌",
  "卯": "未",
  "酉": "丑",
  "寅": "戌",
  "申": "辰",
  "巳": "丑",
  "亥": "未",
  "辰": "辰",
  "戌": "戌",
  "丑": "丑",
  "未": "未",
};

const STAR_LABEL: Record<StarKey, string> = {
  dohwa: "도화살",
  yeokma: "역마살",
  hwagae: "화개살",
};

// 신살 판정 + 해석 생성 함수
export function analyzeSpecialStars(
  dayStem: string,
  pillars: SpecialStarPillar[]
): {
  stars: Array<{ name: string; description: string }>;
  empathy: string;
  reality: string;
  fun: string;
} {
  const stars: Array<{ name: string; description: string }> = [];
  if (!pillars || pillars.length === 0) {
    return {
      stars: [],
      empathy:
        "지금 보고 있는 사주는 특수 신살의 변수가 거의 드러나지 않은 구조예요. 그만큼 기본 골격이 단단해서, 스스로 선택한 방향을 오래 밀고 갈 수 있는 타입으로 볼 수 있어요. 시간이 갈수록 ‘내가 쌓아 온 것’이 차분하게 힘을 발휘하는 타입입니다.",
      reality:
        "특수 신살이 두드러지지 않는 구조입니다. 극단적인 기복보다는, 기본 틀과 노력의 방향성이 인생 흐름을 좌우하는 타입이에요. 경험이 쌓일수록 패턴을 예측하기 쉬워지고, 본인이 설계한 전략이 더 안정적으로 작동하기 쉬운 구조입니다.",
      fun:
        "여긴 튀는 신살 카드가 거의 안 꽂혀 있어요. 대신 ‘꾸준함’이 메인 능력치인 타입이라, 시간 지날수록 쌓이는 맛이 큰 사주예요. 남들 한 방에 뜨고 꺼질 때, 너는 천천히 올라가서 오래 버티는 스타일로 무기가 생긴다고 보면 돼요.",
    };
  }

  const branches = pillars.map((p) => p.branch);
  const dayBranch = pillars.find((p) => p.pos === "일")?.branch ?? branches[2];
  const yearBranch = pillars.find((p) => p.pos === "년")?.branch ?? branches[0];

  const detected: DetectedStar[] = [];

  // 1) 도화살 – 사주이론(각종귀인,신살).txt 기준: 자오묘유 + 다음 계절 삼합
  const DOHWA_BASE = ["子", "午", "卯", "酉"] as const;
  const NEXT_SEASON_TRIAD: Record<string, string[]> = {
    "子": ["亥", "卯", "未"], // 겨울 → 봄(해묘미)
    "午": ["申", "酉", "戌"], // 여름 → 가을(신유술)
    "卯": ["寅", "午", "戌"], // 봄   → 여름(인오술)
    "酉": ["亥", "子", "丑"], // 가을 → 겨울(해자축)
  };

  let dohwaCount = 0;
  for (const p of pillars) {
    if (!DOHWA_BASE.includes(p.branch as (typeof DOHWA_BASE)[number])) continue;
    const targets = NEXT_SEASON_TRIAD[p.branch] || [];
    const hasNextSeason = branches.some(
      (b, idx) => b !== p.branch && targets.includes(b)
    );
    if (hasNextSeason) {
      dohwaCount += 1;
    }
  }
  if (dohwaCount > 0) {
    detected.push({ key: "dohwa", name: STAR_LABEL.dohwa, count: dohwaCount });
    stars.push({
      name: STAR_LABEL.dohwa,
      description:
        "사람들 사이에서 자연스럽게 눈에 띄고, 존재감과 매력을 에너지처럼 뿜어내는 성향이에요. 예술·표현·관계 영역에서 몸을 쓰면 시너지가 크게 나는 타입입니다.",
    });
  }

  // 2) 역마살 – 년지를 기준으로 한 이동성
  const yeokmaTarget = YEOKMA[yearBranch];
  let yeokmaCount = 0;
  if (yeokmaTarget) {
    branches.forEach((b) => {
      if (b === yeokmaTarget) yeokmaCount += 1;
    });
  }
  if (yeokmaCount > 0) {
    detected.push({ key: "yeokma", name: STAR_LABEL.yeokma, count: yeokmaCount });
    stars.push({
      name: STAR_LABEL.yeokma,
      description:
        "환경이 자주 바뀌어도 금방 적응하고, 움직이면서 기회를 잡는 타입이에요. 이동·변화·새로운 판을 통해 성장하는 에너지가 강합니다.",
    });
  }

  // 3) 화개살 – 일지를 기준으로 한 집중·몰입·명예
  const hwagaeTarget = HWAGAE[dayBranch];
  let hwagaeCount = 0;
  if (hwagaeTarget) {
    branches.forEach((b) => {
      if (b === hwagaeTarget) hwagaeCount += 1;
    });
  }
  if (hwagaeCount > 0) {
    detected.push({ key: "hwagae", name: STAR_LABEL.hwagae, count: hwagaeCount });
    stars.push({
      name: STAR_LABEL.hwagae,
      description:
        "한 가지 주제에 깊이 파고들어 자기 세계를 만드는 힘이에요. 예술·연구·철학·종교처럼 깊이가 필요한 영역에서 명예를 쌓기 좋은 구조입니다.",
    });
  }

  const starNames = stars.map((s) => s.name).join(", ");

  const descriptions = {
    empathy:
      stars.length > 0
        ? [
            "이미 스스로 느껴왔던 성향과, 지금 잡히는 신살들이 꽤 자연스럽게 겹칠 거예요.",
            `${starNames} 기운이 함께 잡혀 있어서, 한 사람 안에서 매력·이동성·집중력·표현력 같은 서로 다른 능력들이 동시에 작동하는 구조입니다.`,
            stars
              .map((s) => `- ${s.name}: ${s.description}`)
              .join(" "),
            "이 카드들은 ‘운명이 결정된다’는 뜻이 아니라, 특정 상황에서 더 잘 넘어가게 도와주는 스킬 슬롯에 가깝습니다.",
            "시간이 지날수록 어떤 신살을 어떻게 쓰면 나에게 유리한지 감이 잡히면서, 같은 기운이 점점 더 의식적인 무기가 되어 갈 거예요.",
          ].join("\n\n")
        : "표면적으로 튀는 신살 카드가 적게 잡힌 사주예요. 대신 기본 틀과 노력의 방향이 인생을 좌우하는 구조라, 스스로 설계한 전략과 루틴이 시간이 지날수록 점점 더 힘을 얻는 타입으로 볼 수 있어요.",
    reality:
      stars.length > 0
        ? [
            `감지된 특수 신살: ${starNames} (총 ${detected.reduce(
              (acc, s) => acc + s.count,
              0
            )}회 구성).`,
            detected
              .map(
                (s) =>
                  `- ${s.name}: ${s.count}회 작동 가능 → "${s.description}"`
              )
              .join("\n"),
            "이 조합은 극단적인 한 방보다는, 관계·이동·집중·표현 상황에서 선택적으로 가속도가 붙는 구조에 가깝습니다.",
            "경험이 쌓일수록 어떤 환경에서 어떤 신살이 잘 켜지는지 스스로 패턴을 알게 되고, 그때마다 리스크는 줄이고 장점만 뽑아 쓰는 쪽으로 튜닝해 가기 좋습니다.",
          ].join("\n\n")
        : "특수 신살이 두드러지지 않는 구조입니다. 큰 사건·변동보다, 기본 역량·습관·환경 설계가 성과를 좌우하는 타입이라 볼 수 있어요. 장기적으로는 신살 변수에 흔들리지 않고, 본인이 만든 시스템이 시간이 갈수록 복리처럼 쌓이는 패턴으로 이어지기 쉽습니다.",
    fun:
      stars.length > 0
        ? [
            `야, 너 사주에 ${starNames} 이런 카드들이 몰려 있어.`,
            "한 마디로 ‘일반 유저’가 아니라, 상황만 맞으면 스킬이 갑자기 터지는 숨겨진 캐릭터에 가까운 타입이야.",
            stars
              .map((s) => `- ${s.name}: ${s.description}`)
              .join(" "),
            "이걸 잘 쓰면, 사람들 많은 자리·이동 많은 판·집중해서 파고들어야 하는 일·말·글이 필요한 순간마다 남들보다 한 발 빨리 치고 나갈 수 있어.",
            "그리고 이런 스킬 카드는 나이가 들수록 컨트롤이 좋아져서, ‘요즘 들어 오히려 내가 나를 더 잘 쓴다’는 느낌으로 무기력이 아니라 재미 쪽으로 힘이 쌓이기 쉬운 조합이야.",
          ].join("\n\n")
        : "눈에 딱 보이는 신살 카드가 없다고 해서 노잼 인생은 아니야. 오히려 ‘내가 뭘 반복해서 쌓느냐’에 따라 결과가 확 달라지는 타입이라, 시간이 지날수록 성실함·꾸준함이 진짜 사기 스탯으로 바뀌기 쉬운 구조야.",
  };

  return {
    stars,
    empathy: descriptions.empathy,
    reality: descriptions.reality,
    fun: descriptions.fun,
  };
}
