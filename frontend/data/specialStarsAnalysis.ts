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
// (필요 시 여기서만 StarKey 확장하면 됨)
export type SpecialStarKey =
  | "dohwa"
  | "hongyeom"
  | "yeokma"
  | "hwagae"
  | "yangin"
  | "goegang"
  | "baekho"
  | "geobsal"
  | "jaesal"
  | "cheonsal"
  | "jisal"
  | "nyeonsal"
  | "wolSal"
  | "mangsin"
  | "jangseong"
  | "guimun"
  | "wonjin"
  | "goran"
  | "gwasuk";

interface DetectedStar {
  key: SpecialStarKey;
  name: string;
  count: number;
  description: string;
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

const STAR_LABEL: Record<SpecialStarKey, string> = {
  dohwa: "도화살",
  hongyeom: "홍염살",
  yeokma: "역마살",
  hwagae: "화개살",
  yangin: "양인살",
  goegang: "괴강살",
  baekho: "백호살",
  geobsal: "겁살",
  jaesal: "재살",
  cheonsal: "천살",
  jisal: "지살",
  nyeonsal: "년살",
  wolSal: "월살",
  mangsin: "망신살",
  jangseong: "장성살",
  guimun: "귀문관살",
  wonjin: "원진살",
  goran: "고란살",
  gwasuk: "과숙살",
};

type SpecialStarsResult = {
  stars: Array<{ name: string; description: string }>;
  empathy: string;
  reality: string;
  fun: string;
};

// 각 신살별 해석 베이스 (핵심/긍정/주의를 나중에 톤에 맞게 조합해서 사용)
const STAR_INFO: Partial<
  Record<
    SpecialStarKey,
    {
      core: string;
      positive: string;
      caution: string;
    }
  >
> = {
  dohwa: {
    core: "사람을 끌어당기는 자기장 같은 매력, 존재 자체로 주목받는 기운이에요.",
    positive:
      "어딜 가든 대중과 쉽게 교감하고, 사람 앞에 서는 자리에서 자연스럽게 빛이 납니다. 연예·강의·영업·콘텐츠처럼 사람과 맞닿는 분야에서 강점이 됩니다.",
    caution:
      "관계와 감정이 풍성한 만큼 감정 소모도 커질 수 있어서, 감정선과 관계의 경계를 스스로 정리해 두면 이 매력이 더 오래 건강하게 갑니다.",
  },
  yeokma: {
    core: "머물기보다는 움직일 때 에너지가 살아나는, 변화·이동형 기운이에요.",
    positive:
      "이동과 환경 변화 속에서 새로운 기회를 잡고, 낯선 곳에서도 금방 적응하는 능력이 있습니다. 해외·이직·새 분야 도전처럼 판을 바꾸는 선택에 강합니다.",
    caution:
      "변화가 잦다 보니 한 곳에 오래 뿌리내리기 어렵게 느껴질 수 있어요. 경험을 흩어지는 것이 아니라 ‘내 자산’으로 정리하는 루틴을 만들면 이 기운이 훨씬 든든해집니다.",
  },
  hwagae: {
    core: "혼자 깊이 파고들수록 힘이 세지는, 고독한 집중과 명예의 기운이에요.",
    positive:
      "종교·학문·예술·역학처럼 한 우물을 깊게 파는 분야에서 집중력과 통찰을 발휘하기 좋습니다. 대중 앞에서 소란스럽게 드러내기보다, 브레인·참모 역할에서 진가가 드러납니다.",
    caution:
      "고독과 고립이 종이 한 장 차이일 수 있어요. 혼자만의 세계를 지키되, 나를 편안히 이해해 주는 소수의 관계는 의식적으로 유지하려 할수록 더 건강해집니다.",
  },
  yangin: {
    core: "칼날 같은 추진력과 승부욕, 절대 먼저 물러서지 않는 기운이에요.",
    positive:
      "경쟁이 치열한 자리일수록 불꽃이 붙고, 끝까지 밀어붙이는 힘이 있습니다. 군·경·법조·외과·스포츠처럼 강한 결단이 필요한 분야에서 ‘앞에서 버티는 사람’이 되기 좋습니다.",
    caution:
      "이 강한 힘이 가까운 사람에게 그대로 향하면 관계가 상처받을 수 있어요. 힘을 언제 세우고 언제 빼줄지, 속도를 조절하는 감각을 익힐수록 양인은 칼이 아니라 방패가 됩니다.",
  },
  goegang: {
    core: "평범함보다는 극단을 택하는, 최고이거나 최악이기 쉬운 극단의 기운이에요.",
    positive:
      "남들이 보지 못하는 지점을 보고, 기존 판을 통째로 뒤집는 결단력이 있습니다. 잘 쓰면 보통 사람은 닿기 어려운 자리까지 치고 올라갈 수 있는 잠재력입니다.",
    caution:
      "기세만 믿고 달리면 추락도 빠를 수 있어요. 특히 자존심이 상할 때일수록 한 번 더 멈춰 보는 습관이, 괴강을 ‘한 방에 망가뜨리는 힘’이 아니라 ‘한 번에 올려 세우는 힘’으로 바꿔 줍니다.",
  },
  baekho: {
    core: "예측하기 어려운 강한 에너지, 사건과 변화를 끌어당기는 기운이에요.",
    positive:
      "극한 상황일수록 집중력이 올라가고, 남들이 피하는 현장(응급·군·소방·특수직 등)에서 탁월한 대응력을 발휘하기 쉽습니다. 위기에서 남을 살리는 역할로 쓰일 때, 백호의 장점이 크게 드러납니다.",
    caution:
      "과속·무리한 일정·과격한 선택처럼 위험을 키우는 패턴만 피하면, 이 강한 에너지가 오히려 위기감지 레이더 역할을 합니다. 몸 컨디션과 안전에 대한 체크를 루틴화하는 것이 도움이 됩니다.",
  },
  guimun: {
    core: "감각이 매우 예민하고, 눈에 보이지 않는 분위기까지 읽어내는 기운이에요.",
    positive:
      "심리·상담·예술·영적 분야에서 남다른 감수성을 발휘하기 좋습니다. 다른 사람의 마음을 세밀하게 느끼고, 보이지 않는 흐름을 포착하는 능력으로 쓰일 수 있습니다.",
    caution:
      "내부 긴장이 쌓이면 집착·변덕·수면 문제 등으로 나타날 수 있어요. 몸과 마음을 정기적으로 비워내는 루틴(산책·운동·취미)을 만들어 두면, 이 예민함이 재능 쪽으로 더 많이 흘러갑니다.",
  },
  wonjin: {
    core: "사랑도 싸움도 아닌, 애매하게 불편한 긴장이 남는 관계의 기운이에요.",
    positive:
      "이 어색함이 오히려 감정의 깊이를 만들어 내고, 예술적 감수성이나 종교·철학적 탐구로 전환되기도 합니다. 관계에서의 미묘한 결을 누구보다 잘 느끼는 장점이 있습니다.",
    caution:
      "원진이 걸린 육친과는 ‘완전 이해’를 기대하기보다는, 서로 다른 지점을 인정하는 쪽이 더 건강해요. 거리를 조절하면서도 완전히 끊지 않는 균형을 찾을수록, 이 긴장은 성장의 자극제가 됩니다.",
  },
  hongyeom: {
    core: "이성을 끌어당기는 농밀한 매력, 관계의 온도를 높이는 기운이에요.",
    positive:
      "관능적인 분위기와 정서적 표현력이 풍부해, 사랑의 감정을 진하게 느끼고 나눌 수 있습니다. 애정 표현을 통해 상대에게 위로와 설렘을 주는 힘이 있습니다.",
    caution:
      "감정의 강도가 높다 보니 관계가 복잡해지기 쉬워요. 나의 진짜 필요와 순간의 감정 충동을 구분하는 연습을 할수록, 홍염은 소모가 아니라 힘을 채우는 연애로 변해 갑니다.",
  },
  geobsal: {
    core: "밖에서 강하게 치고 들어오는 시험 같은 기운, 외부 충격에 민감한 구조예요.",
    positive:
      "어릴 때부터 세상의 날카로움을 일찍 배워 단단해지는 경향이 있습니다. 손실을 겪어본 만큼 리스크 관리와 방어적 감각이 다른 사람보다 빨리 자랍니다.",
    caution:
      "도난·사기·갑작스러운 손실 등에서 ‘한 번 더 확인하는 습관’을 들이면 겁살의 날을 많이 무디게 할 수 있어요. 충동적 지출·무리한 투자만 비켜가면, 겁살은 오히려 경계심이라는 재능으로 남습니다.",
  },
  jaesal: {
    core: "구속과 제약, 답답하게 묶이는 상황을 통해 단련되는 기운이에요.",
    positive:
      "제약 속에서 버티는 힘과 인내력, 자기 조절력이 강해집니다. 한 번 견뎌낸 경험이 이후 비슷한 상황에서 큰 방패가 됩니다.",
    caution:
      "법적 문제·관재·관청과 얽히는 일은 서류·계약을 꼼꼼히 보는 습관으로 많이 줄일 수 있어요. 혼자 끙끙대기보다 전문가의 도움을 받는 것이 재살을 더 빨리 통과하는 방법입니다.",
  },
  cheonsal: {
    core: "위에서 내려오는 듯한 큰 흐름, 개인이 통제하기 어려운 변수의 기운이에요.",
    positive:
      "큰 시련을 통과하고 나면 인생을 바라보는 눈이 달라집니다. 철학·종교·세계관이 성숙해지는 계기가 되기 쉽습니다.",
    caution:
      "내가 다 책임져야 할 것 같아도, 통제 범위 밖의 일은 내려놓는 연습이 필요해요. 준비할 수 있는 것은 철저히 준비하되, 나머지는 분산·보험·안전장치로 리스크를 나누는 쪽이 좋습니다.",
  },
  jisal: {
    core: "뿌리를 옮기고 새 환경으로 나아가게 만드는, 변동·이동의 기운이에요.",
    positive:
      "이직·이사·환경 변화 속에서도 빠르게 적응하는 능력이 있습니다. 새로운 땅에서 새 판을 여는 데 강합니다.",
    caution:
      "자주 옮겨 다니다 보면 ‘나는 어디에도 속하지 않는다’는 느낌이 올 수 있어요. 공간을 자주 바꾸더라도, 마음의 거점이 되는 사람·취미·루틴을 만들어 두면 지살이 훨씬 편안해집니다.",
  },
  nyeonsal: {
    core: "도화와 같은 지지를 쓰지만, 감정 소모와 색정 쪽에 초점이 더 맞춰진 기운이에요.",
    positive:
      "이성 관계에서 존재감이 크고, 감정 교류의 경험치가 빨리 쌓입니다. 사랑을 통해 자신과 타인을 깊이 이해하게 되는 경우도 많아요.",
    caution:
      "감정이 곧 행동이 되지 않도록, 관계의 속도와 범위를 스스로 정해 두는 것이 도움이 됩니다. ‘지키고 싶은 삶의 영역’을 먼저 잡아 두면, 년살의 에너지와 삶이 덜 충돌합니다.",
  },
  wolSal: {
    core: "고생과 막힘을 통해 실력을 다지는, 답답하지만 성장형 기운이에요.",
    positive:
      "한 번에 되지 않는 과정 속에서 끈기와 현실 감각이 길러집니다. 시간이 지난 뒤 돌아보면, 이 시기에 쌓인 힘이 밑바탕이 되는 경우가 많습니다.",
    caution:
      "모든 걸 다 해내려 하기보다, 이 시기만큼은 ‘해야 할 것’과 ‘굳이 안 해도 될 것’을 나누는 게 중요해요. 몸 컨디션과 휴식을 챙기는 것이 월살 에너지를 길게 가져가는 방법입니다.",
  },
  mangsin: {
    core: "체면과 평판에 민감해지는 기운, 말과 행동이 크게 부각되기 쉬운 흐름이에요.",
    positive:
      "한 번 경험을 하고 나면, 이후 언행과 공개 노출에 대한 감각이 훨씬 섬세해집니다. 대외 이미지 관리 능력도 같이 자랍니다.",
    caution:
      "SNS·공적 발언·비밀 관리에 한 번 더 신경 쓰는 것만으로도 망신의 강도를 크게 줄일 수 있어요. ‘장난으로 넘길 말’을 실제 기록으로 남기지 않는 습관이 도움이 됩니다.",
  },
  jangseong: {
    core: "무리를 이끌고 앞에 서는 장수의 기운, 통솔력과 권위의 에너지예요.",
    positive:
      "조직·팀·집단 안에서 리더십을 발휘하기 쉽습니다. 결단을 내리고 방향을 제시하는 역할에 잘 어울립니다.",
    caution:
      "좋은 장수는 앞에서 끌고 뒤에서 받쳐준다는 마음으로, 권위를 부드럽게 쓰려는 의식이 필요해요. 내 기준을 사람에게 강요하지 않을수록 장성살은 오래 사랑받는 리더십으로 남습니다.",
  },
  goran: {
    core: "배우자 인연이 늦거나, 결혼 후에도 고독의 결이 남는 기운이에요.",
    positive:
      "혼자서도 인생을 잘 꾸려 나가는 독립심이 강합니다. 자신의 분야에서 깊고 독보적인 성취를 이룰 가능성이 큽니다.",
    caution:
      "‘혼자인 시간’이 기본값인 구조라, 관계 안에서도 자신만의 공간이 필요합니다. 상대를 밀어내는 고독이 아니라, 서로의 고독을 존중하는 관계를 만들수록 고란의 무게가 훨씬 가벼워집니다.",
  },
  gwasuk: {
    core: "고란살과 비슷하게, 배우자 인연이 엷거나 홀로 서는 기운이에요.",
    positive:
      "고독의 시간이 길수록 내면의 힘과 전문성이 쌓이기 좋습니다. 예술·종교·학문처럼 혼자 파고드는 분야에서 깊은 성취를 이루는 경우가 많습니다.",
    caution:
      "이별이나 단절 경험을 통해 사랑 자체를 두려워하게 될 수 있어요. ‘다시 연결될 수 있다’는 경험을 조금씩 쌓아가는 것이 과숙의 무게를 풀어내는 방법입니다.",
  },
};

// =====================================================
// 내부 유틸: 신살 판별
// =====================================================

type SamhapGroup = "water" | "fire" | "wood" | "metal";

function getSamhapGroup(branch: string): SamhapGroup | null {
  if (["申", "子", "辰"].includes(branch)) return "water";
  if (["寅", "午", "戌"].includes(branch)) return "fire";
  if (["亥", "卯", "未"].includes(branch)) return "wood";
  if (["巳", "酉", "丑"].includes(branch)) return "metal";
  return null;
}

function detectSpecialStars(
  dayStem: string,
  pillars: SpecialStarPillar[]
): DetectedStar[] {
  if (!pillars || pillars.length === 0) return [];

  const branches = pillars.map((p) => p.branch);
  const yearBranch = pillars.find((p) => p.pos === "년")?.branch ?? branches[0];
  const dayBranch = pillars.find((p) => p.pos === "일")?.branch ?? branches[2];
  const dayPillar = dayStem + dayBranch;

  const detected: DetectedStar[] = [];

  // ---------- C형: 도화살 ----------
  const DOHWA_REQUIRED: Record<string, string[]> = {
    "子": ["亥", "卯", "未"],
    "午": ["寅", "戌"],
    "卯": ["亥", "未"],
    "酉": ["巳", "丑"],
  };
  branches.forEach((b) => {
    const req = DOHWA_REQUIRED[b];
    if (!req) return;
    const hasPair = branches.some((x) => x !== b && req.includes(x));
    if (hasPair) {
      if (!detected.find((d) => d.key === "dohwa")) {
        detected.push({
          key: "dohwa",
          name: STAR_LABEL.dohwa,
          count: 1,
          description: "",
        });
      }
    }
  });

  // ---------- C형: 역마살 ----------
  const YEOKMA_REQUIRED: Record<string, string[]> = {
    "寅": ["午", "戌"],
    "申": ["子", "辰"],
    "巳": ["酉", "丑"],
    "亥": ["卯", "未"],
  };
  branches.forEach((b) => {
    const req = YEOKMA_REQUIRED[b];
    if (!req) return;
    const hasPair = branches.some((x) => x !== b && req.includes(x));
    if (hasPair) {
      if (!detected.find((d) => d.key === "yeokma")) {
        detected.push({
          key: "yeokma",
          name: STAR_LABEL.yeokma,
          count: 1,
          description: "",
        });
      }
    }
  });

  // ---------- C형: 화개살 ----------
  const HWAGAE_REQUIRED: Record<string, string[]> = {
    "辰": ["申", "子"],
    "戌": ["寅", "午"],
    "丑": ["巳", "酉"],
    "未": ["亥", "卯"],
  };
  branches.forEach((b) => {
    const req = HWAGAE_REQUIRED[b];
    if (!req) return;
    const hasPair = branches.some((x) => x !== b && req.includes(x));
    if (hasPair) {
      if (!detected.find((d) => d.key === "hwagae")) {
        detected.push({
          key: "hwagae",
          name: STAR_LABEL.hwagae,
          count: 1,
          description: "",
        });
      }
    }
  });

  // ---------- B형: 양인살 ----------
  const YANGIN_MAP: Record<string, string> = {
    "甲": "卯",
    "丙": "午",
    "戊": "午",
    "庚": "酉",
    "壬": "子",
  };
  const yanginBranch = YANGIN_MAP[dayStem];
  if (yanginBranch) {
    const cnt = branches.filter((b) => b === yanginBranch).length;
    if (cnt > 0) {
      detected.push({
        key: "yangin",
        name: STAR_LABEL.yangin,
        count: cnt,
        description: "",
      });
    }
  }

  // ---------- B형: 홍염살 ----------
  const HONGYEOM_MAP: Record<string, string> = {
    "甲": "午",
    "乙": "申",
    "丙": "寅",
    "丁": "未",
    "戊": "辰",
    "己": "辰",
    "庚": "戌",
    "辛": "酉",
    "壬": "子",
    "癸": "申",
  };
  const hongBranch = HONGYEOM_MAP[dayStem];
  if (hongBranch) {
    const cnt = branches.filter((b) => b === hongBranch).length;
    if (cnt > 0) {
      detected.push({
        key: "hongyeom",
        name: STAR_LABEL.hongyeom,
        count: cnt,
        description: "",
      });
    }
  }

  // ---------- A형: 괴강살 ----------
  const GOEGANG_PILLARS = new Set<string>(["庚辰", "庚戌", "壬辰", "戊戌"]);
  const allPillars = pillars.map((p) => p.stem + p.branch);
  if (GOEGANG_PILLARS.has(dayPillar)) {
    const cnt = allPillars.filter((p) => GOEGANG_PILLARS.has(p)).length;
    detected.push({
      key: "goegang",
      name: STAR_LABEL.goegang,
      count: cnt,
      description: "",
    });
  }

  // ---------- A형: 백호살 ----------
  const BAEKHO_PILLARS = new Set<string>([
    "甲辰",
    "乙未",
    "丙戌",
    "丁丑",
    "戊辰",
    "壬戌",
    "癸丑",
  ]);
  if (BAEKHO_PILLARS.has(dayPillar)) {
    const cnt = allPillars.filter((p) => BAEKHO_PILLARS.has(p)).length;
    detected.push({
      key: "baekho",
      name: STAR_LABEL.baekho,
      count: cnt,
      description: "",
    });
  }

  // ---------- D형: 귀문관살 ----------
  const GUIMUN_PAIRS: Array<[string, string]> = [
    ["子", "酉"],
    ["丑", "午"],
    ["寅", "未"],
    ["卯", "申"],
    ["辰", "亥"],
    ["巳", "戌"],
  ];
  let guimunCount = 0;
  for (const [a, b] of GUIMUN_PAIRS) {
    if (branches.includes(a) && branches.includes(b)) {
      guimunCount += 1;
    }
  }
  if (guimunCount > 0) {
    detected.push({
      key: "guimun",
      name: STAR_LABEL.guimun,
      count: guimunCount,
      description: "",
    });
  }

  // ---------- D형: 원진살 ----------
  const WONJIN_PAIRS: Array<[string, string]> = [
    ["子", "未"],
    ["丑", "午"],
    ["寅", "酉"],
    ["卯", "申"],
    ["辰", "亥"],
    ["巳", "戌"],
  ];
  let wonjinCount = 0;
  for (const [a, b] of WONJIN_PAIRS) {
    if (branches.includes(a) && branches.includes(b)) {
      wonjinCount += 1;
    }
  }
  if (wonjinCount > 0) {
    detected.push({
      key: "wonjin",
      name: STAR_LABEL.wonjin,
      count: wonjinCount,
      description: "",
    });
  }

  // ---------- F형: 고란살 ----------
  const GORAN_PILLARS = new Set<string>([
    "甲寅",
    "乙巳",
    "丙午",
    "戊午",
    "壬子",
    "戊申",
    "乙亥",
  ]);
  if (GORAN_PILLARS.has(dayPillar)) {
    detected.push({
      key: "goran",
      name: STAR_LABEL.goran,
      count: 1,
      description: "",
    });
  }

  // ---------- F형: 과숙살 ----------
  const GWASUK_PILLARS = new Set<string>([
    "甲戌",
    "乙丑",
    "丙辰",
    "丙戌",
    "丁未",
    "戊戌",
    "己未",
    "庚辰",
    "辛未",
    "壬戌",
    "癸丑",
  ]);
  if (GWASUK_PILLARS.has(dayPillar)) {
    detected.push({
      key: "gwasuk",
      name: STAR_LABEL.gwasuk,
      count: 1,
      description: "",
    });
  }

  // ---------- E형 공통: 겁살/재살/천살/지살/년살/월살/망신살/장성살 ----------
  const groups = new Set<SamhapGroup>();
  const gYear = getSamhapGroup(yearBranch);
  const gDay = getSamhapGroup(dayBranch);
  if (gYear) groups.add(gYear);
  if (gDay) groups.add(gDay);

  const GEOBSAL_TARGET: Record<SamhapGroup, string> = {
    water: "巳",
    fire: "亥",
    wood: "申",
    metal: "寅",
  };
  const JAESAL_TARGET: Record<SamhapGroup, string> = {
    water: "午",
    fire: "子",
    wood: "酉",
    metal: "卯",
  };
  const CHEONSAL_TARGET: Record<SamhapGroup, string> = {
    water: "未",
    fire: "丑",
    wood: "戌",
    metal: "辰",
  };
  const JISAL_TARGET: Record<SamhapGroup, string> = {
    water: "寅",
    fire: "申",
    wood: "巳",
    metal: "亥",
  };
  const NYEONSAL_TARGET: Record<SamhapGroup, string> = {
    water: "酉",
    fire: "卯",
    wood: "子",
    metal: "午",
  };
  const WOLSAL_TARGET: Record<SamhapGroup, string> = {
    water: "戌",
    fire: "辰",
    wood: "丑",
    metal: "未",
  };
  const MANGSIN_TARGET: Record<SamhapGroup, string> = {
    water: "亥",
    fire: "申",
    wood: "寅",
    metal: "巳",
  };
  const JANGSEONG_TARGET: Record<SamhapGroup, string> = {
    water: "子",
    fire: "午",
    wood: "卯",
    metal: "酉",
  };

  let geob = 0,
    jae = 0,
    cheon = 0,
    ji = 0,
    nyeon = 0,
    wol = 0,
    mang = 0,
    jang = 0;

  groups.forEach((g) => {
    if (branches.includes(GEOBSAL_TARGET[g])) geob += 1;
    if (branches.includes(JAESAL_TARGET[g])) jae += 1;
    if (branches.includes(CHEONSAL_TARGET[g])) cheon += 1;
    if (branches.includes(JISAL_TARGET[g])) ji += 1;
    if (branches.includes(NYEONSAL_TARGET[g])) nyeon += 1;
    if (branches.includes(WOLSAL_TARGET[g])) wol += 1;
    if (branches.includes(MANGSIN_TARGET[g])) mang += 1;
    if (branches.includes(JANGSEONG_TARGET[g])) jang += 1;
  });

  if (geob > 0) {
    detected.push({
      key: "geobsal",
      name: STAR_LABEL.geobsal,
      count: geob,
      description: "",
    });
  }
  if (jae > 0) {
    detected.push({
      key: "jaesal",
      name: STAR_LABEL.jaesal,
      count: jae,
      description: "",
    });
  }
  if (cheon > 0) {
    detected.push({
      key: "cheonsal",
      name: STAR_LABEL.cheonsal,
      count: cheon,
      description: "",
    });
  }
  if (ji > 0) {
    detected.push({
      key: "jisal",
      name: STAR_LABEL.jisal,
      count: ji,
      description: "",
    });
  }
  if (nyeon > 0) {
    detected.push({
      key: "nyeonsal",
      name: STAR_LABEL.nyeonsal,
      count: nyeon,
      description: "",
    });
  }
  if (wol > 0) {
    detected.push({
      key: "wolSal",
      name: STAR_LABEL.wolSal,
      count: wol,
      description: "",
    });
  }
  if (mang > 0) {
    detected.push({
      key: "mangsin",
      name: STAR_LABEL.mangsin,
      count: mang,
      description: "",
    });
  }
  if (jang > 0) {
    detected.push({
      key: "jangseong",
      name: STAR_LABEL.jangseong,
      count: jang,
      description: "",
    });
  }

  return detected;
}

export type SpecialStarCardState = "active" | "inactive";

export interface SpecialStarVisualCard {
  key: SpecialStarKey;
  name: string;
  state: SpecialStarCardState;
  count: number;
  ability: string; // 한 줄 요약
}

const STAR_ORDER: SpecialStarKey[] = [
  "dohwa",
  "hongyeom",
  "yeokma",
  "hwagae",
  "yangin",
  "goegang",
  "baekho",
  "guimun",
  "wonjin",
  "geobsal",
  "jaesal",
  "cheonsal",
  "jisal",
  "nyeonsal",
  "wolSal",
  "mangsin",
  "jangseong",
  "goran",
  "gwasuk",
];

export function getSpecialStarsVisualData(
  dayStem: string,
  pillars: SpecialStarPillar[]
): SpecialStarVisualCard[] {
  const detected = detectSpecialStars(dayStem, pillars);
  const byKey = new Map<SpecialStarKey, DetectedStar>();
  detected.forEach((d) => byKey.set(d.key, d));

  return STAR_ORDER.map((key) => {
    const hit = byKey.get(key);
    const info = STAR_INFO[key];
    const ability =
      (info?.core ?? "").replace(/\s+/g, " ").trim() ||
      "삶의 특정 상황에서 작동하는 변수형 기운";

    return {
      key,
      name: STAR_LABEL[key],
      state: hit ? "active" : "inactive",
      count: hit?.count ?? 0,
      ability,
    };
  });
}

// 신살 판정 + 해석 생성 함수
// 오버로드 1: 새 구조 (일간 + 기둥 배열)
export function analyzeSpecialStars(
  dayStem: string,
  pillars: SpecialStarPillar[]
): SpecialStarsResult;

// 오버로드 2: 예전 구조 (지지 4개) - 과거 코드와 호환용
export function analyzeSpecialStars(
  dayBranch: string,
  yearBranch: string,
  monthBranch: string,
  hourBranch: string
): SpecialStarsResult;

// 실제 구현
export function analyzeSpecialStars(...args: any[]): SpecialStarsResult {
  // 새 시그니처: (dayStem, pillars[])
  if (args.length === 2 && Array.isArray(args[1])) {
    const [dayStem, pillars] = args as [string, SpecialStarPillar[]];
    const detected = detectSpecialStars(dayStem, pillars);

    // 우선순위: 일주 계열 → 일간 계열 → 삼합 계열 → 조합형 → E형
    const PRIORITY: SpecialStarKey[] = [
      "goegang",
      "baekho",
      "goran",
      "gwasuk",
      "yangin",
      "hongyeom",
      "dohwa",
      "yeokma",
      "hwagae",
      "guimun",
      "wonjin",
      "geobsal",
      "jaesal",
      "cheonsal",
      "jisal",
      "nyeonsal",
      "wolSal",
      "mangsin",
      "jangseong",
    ];

    const names = detected.map((s) => s.name).join(", ");

    if (detected.length === 0) {
      const emptyEmp =
        "지금 구조에서는 도드라지게 잡히는 특수 신살이 많지 않아요. 그만큼 기본 골격과 스스로 선택한 방향성이 인생 흐름을 더 또렷하게 만드는 타입으로 볼 수 있어요. 시간이 지날수록 신살 변수보다는, 내가 쌓아 온 습관과 전략이 더 큰 무기가 되는 구조입니다.";
      const emptyReal =
        "감지된 특수 신살이 두드러지지 않는 편입니다. 극단적인 사건·변동보다는, 기본 사주의 틀과 선택의 방향이 인생을 좌우하는 타입으로 볼 수 있어요. 리스크 관리보다 구조 설계와 루틴 만들기에 힘을 쏟을수록 장기적인 안정성이 커지는 구조입니다.";
      const emptyFun =
        "눈에 확 튀는 신살 카드는 많지 않은 타입이야. 대신 ‘꾸준함’이 주력 스탯이라, 한 방에 뜨고 꺼지는 인생보단 서서히 올라가서 오래 버티는 쪽으로 힘이 쌓이기 좋아. 신살보단 네가 정한 방향이 판을 이끄는 구조라고 보면 돼.";

      return {
        stars: [],
        empathy: emptyEmp,
        reality: emptyReal,
        fun: emptyFun,
      };
    }

    // 우선순위 정렬 후 상위 2~3개만 메인으로 사용
    const sorted = [...detected].sort((a, b) => {
      const pa = PRIORITY.indexOf(a.key);
      const pb = PRIORITY.indexOf(b.key);
      return (pa === -1 ? 999 : pa) - (pb === -1 ? 999 : pb);
    });
    const main = sorted.slice(0, 3);

    const explainUnits = main
      .map((s) => {
        const info = STAR_INFO[s.key];
        if (!info) return "";
        return `${s.name}은(는) ${info.core} ${info.positive}`;
      })
      .filter(Boolean);

    const empathyIntro =
      "당신이 가지고 있는 여러 신살 가운데, 지금은 특히 핵심적으로 작동하는 몇 가지를 중심으로 풀어볼게요.";
    const empathyBody = explainUnits.join(" ");
    const empathyClosing =
      "이 기운들은 운명을 고정시키는 것이 아니라, 어떤 상황에서 무엇을 더 잘할 수 있는지 알려 주는 선택지에 가깝습니다. 나이가 들수록 언제 힘을 세우고 언제 빼야 하는지 감이 잡히면서, 같은 신살이 점점 더 의식적인 무기로 변해 가는 흐름이에요.";
    const empathy = [empathyIntro + " " + empathyBody, empathyClosing]
      .filter((p) => p && p.trim().length > 0)
      .join("\n\n");

    const realityParts: string[] = [];
    realityParts.push(
      `감지된 신살: ${names} (총 ${detected.length}종, 주요 작동 신살 ${main
        .map((s) => s.name)
        .join(", ")}).`
    );
    main.forEach((s) => {
      const info = STAR_INFO[s.key];
      if (!info) return;
      realityParts.push(
        `- ${s.name}: ${info.positive} 주의해야 할 부분은, ${info.caution}`
      );
    });
    realityParts.push(
      "이 신살들은 특정 시기·환경에서 변수처럼 작동하지만, 기본적인 사주의 틀과 선택의 방향이 훨씬 큰 비중을 차지합니다. 구조를 이해하고 리스크를 관리할수록, 같은 신살도 결과가 완전히 달라질 수 있어요."
    );
    const reality = realityParts.join("\n");

    const funParts: string[] = [];
    funParts.push(
      `야, 네가 가진 여러 신살 중에서 특히 핵심 스킬로 쓸 만한 애들만 골라서 먼저 얘기해 줄게. 전체 카드 풀은 더 넓지만, 지금은 메인 무기 위주로 보는 느낌이라고 생각하면 돼.`
    );
    main.forEach((s) => {
      const info = STAR_INFO[s.key];
      if (!info) return;
      funParts.push(
        `- ${s.name}: 대충 말하면, ${info.core.replace(
          /이에요\.$/,
          "인 편이야."
        )} 그래서 잘 쓰면 ${info.positive.replace(/입니다\.$/, "인 거지.")}`
      );
    });
    funParts.push(
      "이 카드들 때문에 인생이 정해지는 건 아니고, 어떻게 쓰느냐에 따라 그냥 피곤한 변수일 수도 있고, 제대로만 쓰면 인생 치트키가 될 수도 있는 구성이야. 나이 들수록 이 스킬들을 더 얌전히, 더 정확히 꺼내 쓰게 되는 타입이라고 보면 돼."
    );
    const fun = funParts.join("\n");

    return {
      stars: main.map((s) => {
        const info = STAR_INFO[s.key];
        return {
          name: s.name,
          description: info ? `${info.core} ${info.positive}` : "",
        };
      }),
      empathy,
      reality,
      fun,
    };
  }

  // 옛 시그니처: (dayBranch, yearBranch, monthBranch, hourBranch)
  if (args.length === 4) {
    const [dayBranch, yearBranch, monthBranch, hourBranch] = args as string[];

    const pillars: SpecialStarPillar[] = [
      { pos: "년", stem: "", branch: yearBranch },
      { pos: "월", stem: "", branch: monthBranch },
      { pos: "일", stem: "", branch: dayBranch },
      { pos: "시", stem: "", branch: hourBranch },
    ];

    // dayStem은 이 로직에서 직접 사용하지 않으니 빈 문자열로 넘겨도 됨
    return analyzeSpecialStars("", pillars);
  }

  // 방어적 기본값 (시그니처가 맞지 않거나 예외적인 경우)
  return {
    stars: [],
    empathy: "",
    reality: "",
    fun: "",
  };
}
