// frontend/data/guiinAnalysis.ts
// 주요 귀인(길신) 판별 및 요약 텍스트 생성 로직

export type GuiinKey =
  | "cheonul"
  | "cheondeok"
  | "woldeok"
  | "munchang"
  | "hakdang"
  | "cheonui"
  | "amrok"
  | "wolgong"
  | "geonrok"
  | "geumyeolog"
  | "bokseong"
  | "taegeuk"
  | "cheonju"
  | "samgi";

export type PillarPos = "년" | "월" | "일" | "시";

export interface GuiinHit {
  key: GuiinKey;
  name: string;
  pos: PillarPos | "연월일" | "월일시"; // 삼기귀인은 연월일 / 월일시 기준
  detail?: string;
}

const GUIIN_LABEL: Record<GuiinKey, string> = {
  cheonul: "천을귀인",
  cheondeok: "천덕귀인",
  woldeok: "월덕귀인",
  munchang: "문창귀인",
  hakdang: "학당귀인",
  cheonui: "천의성",
  amrok: "암록",
  wolgong: "월공",
  geonrok: "건록",
  geumyeolog: "금여록",
  bokseong: "복성귀인",
  taegeuk: "태극귀인",
  cheonju: "천주귀인",
  samgi: "삼기귀인",
};

// 천간/지지 집합
const STEMS = new Set(["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]);
const BRANCHES = new Set([
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
]);

function isStem(ch: string): boolean {
  return STEMS.has(ch);
}

// 1. 천을귀인 (일간 기준, 지지)
const CHEONUL_BRANCHES: Record<string, string[]> = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  庚: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  辛: ["午", "寅"],
  壬: ["巳", "卯"],
  癸: ["巳", "卯"],
};

// 2. 천덕귀인 (월지 기준)
const CHEONDEOK_FROM_MONTH: Record<string, string> = {
  寅: "丁",
  卯: "申",
  辰: "壬",
  巳: "庚",
  午: "亥",
  未: "甲",
  申: "癸",
  酉: "寅",
  戌: "丙",
  亥: "乙",
  子: "巳",
  丑: "庚",
};

// 3. 월덕귀인 (월지 그룹 기준, 천간)
const WOLDEOK_FROM_MONTH_GROUP: Record<string, string> = {
  // key는 그룹 대표
  寅: "丙", // 寅午戌
  申: "壬", // 申子辰
  亥: "甲", // 亥卯未
  巳: "庚", // 巳酉丑
};

function getWoldeokStem(monthBranch: string): string | null {
  if ("寅午戌".includes(monthBranch)) return WOLDEOK_FROM_MONTH_GROUP["寅"];
  if ("申子辰".includes(monthBranch)) return WOLDEOK_FROM_MONTH_GROUP["申"];
  if ("亥卯未".includes(monthBranch)) return WOLDEOK_FROM_MONTH_GROUP["亥"];
  if ("巳酉丑".includes(monthBranch)) return WOLDEOK_FROM_MONTH_GROUP["巳"];
  return null;
}

// 4. 문창귀인 (일간 기준, 지지)
const MUNCHANG_BRANCHES: Record<string, string[]> = {
  甲: ["巳"],
  乙: ["午"],
  丙: ["申"],
  戊: ["申"],
  丁: ["酉"],
  己: ["酉"],
  庚: ["亥"],
  辛: ["子"],
  壬: ["寅"],
  癸: ["卯"],
};

// 5. 학당귀인 (일간 기준 장생지, 지지)
const HAKDANG_BRANCHES: Record<string, string[]> = {
  甲: ["亥"],
  乙: ["午"],
  丙: ["寅"],
  戊: ["寅"],
  丁: ["酉"],
  己: ["酉"],
  庚: ["巳"],
  辛: ["子"],
  壬: ["申"],
  癸: ["卯"],
};

// 6. 천의성 (월지 바로 이전 지지)
const CHEONUI_FROM_MONTH: Record<string, string> = {
  子: "亥",
  丑: "子",
  寅: "丑",
  卯: "寅",
  辰: "卯",
  巳: "辰",
  午: "巳",
  未: "午",
  申: "未",
  酉: "申",
  戌: "酉",
  亥: "戌",
};

// 7. 암록 (일간 기준, 지지)
const AMROK_BRANCHES: Record<string, string> = {
  甲: "亥",
  乙: "戌",
  丙: "申",
  戊: "申",
  丁: "未",
  己: "未",
  庚: "巳",
  辛: "辰",
  壬: "寅",
  癸: "丑",
};

// 8. 월공 (월지 그룹 기준, 양간만, 천간)
const WOLGONG_FROM_MONTH_GROUP: Record<string, string> = {
  申: "丙", // 申子辰
  寅: "壬", // 寅午戌
  亥: "庚", // 亥卯未
  巳: "甲", // 巳酉丑
};

function getWolgongStem(monthBranch: string): string | null {
  if ("申子辰".includes(monthBranch)) return WOLGONG_FROM_MONTH_GROUP["申"];
  if ("寅午戌".includes(monthBranch)) return WOLGONG_FROM_MONTH_GROUP["寅"];
  if ("亥卯未".includes(monthBranch)) return WOLGONG_FROM_MONTH_GROUP["亥"];
  if ("巳酉丑".includes(monthBranch)) return WOLGONG_FROM_MONTH_GROUP["巳"];
  return null;
}

// 9. 건록 (일간 기준, 지지)
const GEONROK_BRANCHES: Record<string, string> = {
  甲: "寅",
  乙: "卯",
  丙: "巳",
  戊: "巳",
  丁: "午",
  己: "午",
  庚: "申",
  辛: "酉",
  壬: "亥",
  癸: "子",
};

// 10. 금여록 (일간 기준, 지지)
const GEUMYEO_BRANCHES: Record<string, string> = {
  甲: "辰",
  乙: "巳",
  丙: "未",
  戊: "未",
  丁: "申",
  己: "申",
  庚: "戌",
  辛: "亥",
  壬: "丑",
  癸: "寅",
};

// 11. 복성귀인 (일간 기준, 지지 여러 개)
const BOKSEONG_BRANCHES: Record<string, string[]> = {
  甲: ["寅"],
  乙: ["丑", "亥"],
  丙: ["子"],
  丁: ["酉", "亥"],
  戊: ["午"],
  己: ["午", "申"],
  庚: ["辰"],
  辛: ["寅", "午"],
  壬: ["巳"],
  癸: ["巳", "卯"],
};

// 12. 태극귀인 (일간 그룹 기준, 지지)
const TAEGEUK_BRANCHES: Record<string, string[]> = {
  // 甲·乙
  木: ["子", "午"],
  // 丙·丁
  火: ["卯", "酉"],
  // 戊·己
  土: ["辰", "戌", "丑", "未"],
  // 庚·辛
  金: ["寅", "亥"],
  // 壬·癸
  水: ["巳", "申"],
};

function getTaegeukBranches(dayStem: string): string[] {
  if ("甲乙".includes(dayStem)) return TAEGEUK_BRANCHES["木"];
  if ("丙丁".includes(dayStem)) return TAEGEUK_BRANCHES["火"];
  if ("戊己".includes(dayStem)) return TAEGEUK_BRANCHES["土"];
  if ("庚辛".includes(dayStem)) return TAEGEUK_BRANCHES["金"];
  if ("壬癸".includes(dayStem)) return TAEGEUK_BRANCHES["水"];
  return [];
}

// 13. 천주귀인 (일간 기준, 지지)
const CHEONJU_BRANCHES: Record<string, string> = {
  甲: "巳",
  乙: "午",
  丙: "寅",
  丁: "未",
  戊: "申",
  己: "酉",
  庚: "亥",
  辛: "子",
  壬: "寅",
  癸: "卯",
};

// 14. 삼기귀인 (천간 3연속 조합)
type SamgiType = "천상" | "인중" | "지하";

const SAMGI_SEQUENCES: Array<{ type: SamgiType; seq: [string, string, string] }> = [
  { type: "천상", seq: ["甲", "戊", "庚"] },
  { type: "인중", seq: ["乙", "丙", "丁"] },
  { type: "지하", seq: ["壬", "癸", "辛"] },
];

function checkSamgi(
  stems: string[]
): { type: SamgiType; pos: "연월일" | "월일시" } | null {
  if (stems.length < 3) return null;
  const triples: Array<{ pos: "연월일" | "월일시"; t: [string, string, string] }> = [
    { pos: "연월일", t: [stems[0], stems[1], stems[2]] },
    { pos: "월일시", t: [stems[1], stems[2], stems[3]] },
  ];
  for (const { type, seq } of SAMGI_SEQUENCES) {
    for (const { pos, t } of triples) {
      if (t[0] === seq[0] && t[1] === seq[1] && t[2] === seq[2]) {
        return { type, pos };
      }
    }
  }
  return null;
}

/**
 * 주요 귀인(길신) 판별
 *
 * @param dayStem 일간
 * @param monthBranch 월지
 * @param stems 연간/월간/일간/시간 배열 (예: ["己","乙","癸","庚"])
 * @param branches 연지/월지/일지/시지 배열 (예: ["亥","酉","未","申"])
 */
export function detectGuiin(
  dayStem: string,
  monthBranch: string,
  stems: string[],
  branches: string[]
): GuiinHit[] {
  const result: GuiinHit[] = [];

  const [yearStem, monthStem, dayStem2, hourStem] = stems;
  const [yearBranch, monthBranch2, dayBranch, hourBranch] = branches;
  const stemByPos: Record<PillarPos, string> = {
    년: yearStem,
    월: monthStem,
    일: dayStem2,
    시: hourStem,
  };
  const branchByPos: Record<PillarPos, string> = {
    년: yearBranch,
    월: monthBranch2,
    일: dayBranch,
    시: hourBranch,
  };

  const pushOnce = (key: GuiinKey, pos: PillarPos | "연월일" | "월일시", detail?: string) => {
    result.push({ key, name: GUIIN_LABEL[key], pos, detail });
  };

  // 1) 천을귀인
  const cheonulTargets = CHEONUL_BRANCHES[dayStem] || [];
  (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
    if (cheonulTargets.includes(branchByPos[pos])) {
      pushOnce("cheonul", pos);
    }
  });

  // 2) 천덕귀인 (월지 기준)
  const cheondeokVal = CHEONDEOK_FROM_MONTH[monthBranch];
  if (cheondeokVal) {
    if (isStem(cheondeokVal)) {
      (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
        if (stemByPos[pos] === cheondeokVal) {
          pushOnce("cheondeok", pos);
        }
      });
    } else {
      (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
        if (branchByPos[pos] === cheondeokVal) {
          pushOnce("cheondeok", pos);
        }
      });
    }
  }

  // 3) 월덕귀인
  const woldeokStem = getWoldeokStem(monthBranch);
  if (woldeokStem) {
    (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
      if (stemByPos[pos] === woldeokStem) {
        pushOnce("woldeok", pos);
      }
    });
  }

  // 4) 문창귀인
  const munchangTargets = MUNCHANG_BRANCHES[dayStem] || [];
  (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
    if (munchangTargets.includes(branchByPos[pos])) {
      pushOnce("munchang", pos);
    }
  });

  // 5) 학당귀인
  const hakdangTargets = HAKDANG_BRANCHES[dayStem] || [];
  (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
    if (hakdangTargets.includes(branchByPos[pos])) {
      pushOnce("hakdang", pos);
    }
  });

  // 6) 천의성
  const cheonuiTarget = CHEONUI_FROM_MONTH[monthBranch];
  if (cheonuiTarget) {
    (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
      if (branchByPos[pos] === cheonuiTarget) {
        pushOnce("cheonui", pos);
      }
    });
  }

  // 7) 암록
  const amrokBranch = AMROK_BRANCHES[dayStem];
  if (amrokBranch) {
    (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
      if (branchByPos[pos] === amrokBranch) {
        pushOnce("amrok", pos);
      }
    });
  }

  // 8) 월공 (양간만)
  const wolgongStem = getWolgongStem(monthBranch);
  if (wolgongStem) {
    (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
      if (stemByPos[pos] === wolgongStem) {
        pushOnce("wolgong", pos);
      }
    });
  }

  // 9) 건록
  const geonrokBranch = GEONROK_BRANCHES[dayStem];
  if (geonrokBranch) {
    (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
      if (branchByPos[pos] === geonrokBranch) {
        pushOnce("geonrok", pos);
      }
    });
  }

  // 10) 금여록
  const geumyeoBranch = GEUMYEO_BRANCHES[dayStem];
  if (geumyeoBranch) {
    (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
      if (branchByPos[pos] === geumyeoBranch) {
        pushOnce("geumyeolog", pos);
      }
    });
  }

  // 11) 복성귀인
  const bokTargets = BOKSEONG_BRANCHES[dayStem] || [];
  if (bokTargets.length > 0) {
    (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
      if (bokTargets.includes(branchByPos[pos])) {
        pushOnce("bokseong", pos);
      }
    });
  }

  // 12) 태극귀인
  const taeTargets = getTaegeukBranches(dayStem);
  if (taeTargets.length > 0) {
    // 태극귀인은 일간 기준 + 년지/일지 위치에서만 성립
    (["년", "일"] as PillarPos[]).forEach((pos) => {
      if (taeTargets.includes(branchByPos[pos])) {
        pushOnce("taegeuk", pos);
      }
    });
  }

  // 13) 천주귀인
  const cheonjuBranch = CHEONJU_BRANCHES[dayStem];
  if (cheonjuBranch) {
    (["년", "월", "일", "시"] as PillarPos[]).forEach((pos) => {
      if (branchByPos[pos] === cheonjuBranch) {
        pushOnce("cheonju", pos);
      }
    });
  }

  // 14) 삼기귀인
  const samgi = checkSamgi(stems);
  if (samgi) {
    pushOnce("samgi", samgi.pos, samgi.type);
  }

  return result;
}

// =====================================================
// 길신 해석 텍스트 생성
// =====================================================

type CharKey = "empathy" | "reality" | "fun";

function posLabel(pos: PillarPos | "연월일" | "월일시"): string {
  if (pos === "년") return "년지";
  if (pos === "월") return "월지";
  if (pos === "일") return "일지";
  if (pos === "시") return "시지";
  if (pos === "연월일") return "연월일 천간";
  if (pos === "월일시") return "월일시 천간";
  return "";
}

function summarizeByKey(
  key: GuiinKey,
  hits: GuiinHit[]
): string {
  const positions = Array.from(new Set(hits.map((h) => h.pos))).map(posLabel).filter(Boolean);
  const posText = positions.length > 0 ? ` (${positions.join(", ")} 기준)` : "";
  const count = hits.length;
  const countText = count >= 2 ? ` (총 ${count}곳에서 겹쳐 성립)` : "";

  switch (key) {
    case "cheonul":
      return `천을귀인은 위기 순간마다 사람이나 사건의 형태로 '기묘한 도움'이 들어오는 구조예요${posText}${countText}. 관재·구설·사고처럼 막다른 길처럼 보이는 국면에서도, 끝까지 가 보면 반전의 구멍이 열리는 경우가 많아서 살면서 몇 번이고 '운이 좋았다'는 말을 듣게 되는 타입입니다.`;
    case "cheondeok":
      return `천덕귀인은 하늘이 덕을 얹어 둔 구조라, 큰 위험을 겪어도 이상하리만큼 비켜 가거나 완충 장치가 들어오는 경우가 많아요${posText}${countText}. 선한 태도와 덕스러운 품성이 자연스럽게 쌓여서, 시간이 지날수록 신뢰·평판이라는 형태의 보호막이 두꺼워지는 길성입니다.`;
    case "woldeok":
      return `월덕귀인은 조용히 쌓인 음덕과 내조의 기운이에요${posText}${countText}. 겉으로 요란하지 않아도 꾸준히 믿음을 주는 사람으로 남게 되고, 관계 속에서 받은 작은 도움과 배려가 위기 때 큰 힘으로 돌아오는 구조라, 나이가 들수록 '내 편'이 또렷해지는 흐름을 만듭니다.`;
    case "munchang":
      return `문창귀인은 언어·문장·표현력 쪽으로 빛이 나는 길성이에요${posText}${countText}. 글쓰기·강의·콘텐츠처럼 말과 글을 다루는 영역에서 감이 빠르고, 시험·자격 분야에서도 이해와 정리가 빨라서 '설명 잘하는 사람'으로 기억되기 쉽습니다.`;
    case "hakdang":
      return `학당귀인은 배우고 가르치는 재능에 힘이 실린 구조예요${posText}${countText}. 공부한 것을 오래 기억하고 체계적으로 정리하는 능력이 좋아서, 선생·연구·교육·코칭처럼 지식을 다루는 역할에서 자신의 무기를 만들기 좋습니다.`;
    case "cheonui":
      return `천의성은 치유와 회복의 기운이라, 남의 아픔을 민감하게 알아차리고 도와주려는 마음이 자연스럽게 올라오는 자리예요${posText}${countText}. 의료·상담·복지처럼 사람을 돌보는 영역과 연결하면, 공감 능력이 곧 직업적 강점으로 이어지기 쉬운 구조입니다.`;
    case "amrok":
      return `암록은 겉으로는 티가 잘 나지 않는 숨은 재복이에요${posText}${countText}. 표면적으로는 아슬아슬해 보여도 막판에 버텨지고, 예상 밖의 경로로 도움이 들어와서 '어떻게든 굶지 않고 버텨진다'는 식의 서사를 만드는 버팀목 역할을 합니다.`;
    case "wolgong":
      return `월공은 세속적인 욕심보다 의미와 가치를 중시하게 만드는, 맑고 가벼운 기운이에요${posText}${countText}. 물질적 결과가 다소 들쭉날쭉해 보여도 정신적으로는 빨리 정리하고 털어내는 힘이 있어서, 결국엔 나에게 남길 것과 내려놓을 것을 구분하는 감각이 또렷해집니다.`;
    case "geonrok":
      return `건록은 일간의 힘이 가장 또렷하게 서는 자리라, '내 힘으로 일어서는 독립성'을 상징해요${posText}${countText}. 직업·역할에서 꾸준히 버티는 힘이 강하고, 환경 탓보다는 스스로 해내려는 성향 덕분에 시간이 갈수록 자수성가형 서사가 잘 쌓이는 구조입니다.`;
    case "geumyeolog":
      return `금여록은 품격 있는 인연과 배우자 복을 상징하는 길성이에요${posText}${countText}. 사람을 만날수록 인연의 질이 높아지기 쉬워서, 함께하는 파트너나 배우자 쪽에서 삶의 품격이 한 단계 올라가는 경험을 만들기 좋습니다.`;
    case "bokseong":
      return `복성귀인은 일상 곳곳에서 크고 작은 복이 끊기지 않는 구조예요${posText}${countText}. 먹을 복·사람 복·생활 복이 고르게 들어와서, 큰 부자가 아니어도 '어디 가서 굶지는 않는다'는 느낌의 안전망이 항상 뒤에 깔려 있는 타입입니다.`;
    case "taegeuk":
      return `태극귀인은 인생의 굴곡 속에서도 결국 중심 자리로 돌아오는 복원력을 의미해요${posText}${countText}. 큰 흐름을 보는 감각이 좋아서, 한때 흔들려도 중요한 국면에서는 다시 균형을 찾아가는 힘이 있고, 종교·철학·역학처럼 근본을 탐구하는 분야와도 인연이 잘 닿는 구조입니다.`;
    case "cheonju":
      return `천주귀인은 먹고사는 문제와 손님 대접, 베풂의 기운이 강하게 들어오는 길성이에요${posText}${countText}. 요식·서비스·대접하는 일과 인연이 닿기 쉽고, 사람을 잘 먹이고 챙기는 태도가 곧 재복과 인복으로 돌아오기 좋은 구조입니다.`;
    case "samgi": {
      const type = hits[0]?.detail as "천상" | "인중" | "지하" | undefined;
      if (type === "천상") {
        return `천상삼기는 큰 판을 주도하고 밀어붙이는 추진력 쪽에 특화된 재능이에요. 리더십이 요구되는 자리에서 한 번 힘이 붙으면, 남들이 감당하기 힘든 규모까지도 끌고 갈 수 있는 에너지가 숨어 있습니다.`;
      }
      if (type === "인중") {
        return `인중삼기는 예술·콘텐츠·표현 쪽에서 남다른 감각을 가진 조합이에요. 부드러운 인상과는 별개로, 무대나 작업물 속에서는 사람 시선을 빨아들이는 독특한 존재감을 만들어 내기 쉽습니다.`;
      }
      if (type === "지하") {
        return `지하삼기는 전략·기획·연구처럼 깊이 파고드는 영역에서 빛나는 조합이에요. 앞에 나서지 않아도 판 전체를 설계하고 조율하는 능력이 좋아서, 후방·참모·분석 역할에서 탁월한 힘을 발휘하기 좋은 구조입니다.`;
      }
      return `삼기귀인은 범상치 않은 재능과 특이한 서사를 가진 조합이라, 평범한 길보다 자신만의 분야를 만들수록 더 크게 빛나는 구조예요.`;
    }
    default:
      return "";
  }
}

export function summarizeGuiin(
  dayStem: string,
  monthBranch: string,
  stems: string[],
  branches: string[],
  tone: CharKey = "empathy"
): string | null {
  const hits = detectGuiin(dayStem, monthBranch, stems, branches);

  if (!hits || hits.length === 0) {
    if (tone === "fun") {
      return "이 사주는 특정 귀인 한두 개에 인생이 좌우되는 타입이라기보다, 전체 판의 균형과 본인 선택이 더 크게 작동하는 구조야. 눈에 띄는 길신이 없다는 건, 오히려 한쪽으로 과하게 기대지 않고 스스로 판을 짤 수 있는 여지가 넓다는 뜻이기도 해.";
    }
    if (tone === "reality") {
      return "현재 구조에서는 대표적인 귀인성들이 강하게 한 곳에 몰려 있지는 않아요. 대신 사주의 기본 골격과 본인이 쌓아 가는 선택·습관이 더 직접적으로 인생을 움직이는 타입이라, 길신보다는 나 자신이 주인공인 구조에 가깝습니다.";
    }
    return "눈에 띄게 강한 귀인이 한쪽에 몰려 있지는 않지만, 그만큼 특정 별에 기댈 필요 없이 스스로 길을 설계할 수 있는 구조예요. 시간이 갈수록 '특별한 한 방'보다 꾸준한 선택과 관계가 인생을 단단하게 만들어 주는 타입으로 자리 잡게 됩니다.";
  }

  const byKey = new Map<GuiinKey, GuiinHit[]>();
  for (const h of hits) {
    const arr = byKey.get(h.key) ?? [];
    arr.push(h);
    byKey.set(h.key, arr);
  }

  const hasCheonul = byKey.has("cheonul");
  const hasCheondeok = byKey.has("cheondeok");
  const hasWoldeok = byKey.has("woldeok");
  const hasSamDeok = hasCheonul && hasCheondeok && hasWoldeok;
  const hasRokPair = byKey.has("geonrok") && byKey.has("amrok");
  const hasMunHak = byKey.has("munchang") && byKey.has("hakdang");

  function priority(key: GuiinKey): number {
    if (key === "cheonul" || key === "cheondeok" || key === "woldeok") return 1;
    if (key === "samgi") return 2;
    if (key === "geonrok" || key === "amrok") return 3;
    if (key === "munchang" || key === "hakdang") return 4;
    if (key === "taegeuk") return 5;
    return 6;
  }

  const keysSorted = Array.from(byKey.keys()).sort((a, b) => {
    const pa = priority(a);
    const pb = priority(b);
    if (pa !== pb) return pa - pb;
    const hasIlA = (byKey.get(a) || []).some((h) => h.pos === "일");
    const hasIlB = (byKey.get(b) || []).some((h) => h.pos === "일");
    if (hasIlA !== hasIlB) return hasIlA ? -1 : 1;
    const hasWolA = (byKey.get(a) || []).some((h) => h.pos === "월");
    const hasWolB = (byKey.get(b) || []).some((h) => h.pos === "월");
    if (hasWolA !== hasWolB) return hasWolA ? -1 : 1;
    return 0;
  });

  const picked: GuiinKey[] = [];
  for (const k of keysSorted) {
    if (picked.length >= 3) break;
    picked.push(k);
  }

  const introParts: string[] = [];
  if (tone === "fun") {
    introParts.push(
      "살다 보면 일이 술술 풀리거나 예상 못 한 도움이 찾아오는 때가 있지. 명리는 그걸 우연이 아니라, 삶 속에서 도움의 인연이 작동하는 구조로 봐. 사주에는 그런 인연이 들어올 수 있는 지점이 있고 그걸 귀인이라 부르는데, 이 분석에서는 네 사주에서 어떤 도움과 인연이 어떻게 작동하기 쉬운지 살펴보는 거야."
    );
  } else if (tone === "reality") {
    introParts.push(
      "살다 보면 일이 잘 풀리거나 예상 밖의 도움이 들어오는 시기가 있다. 명리에서는 이를 우연이 아니라 삶 속에서 도움의 인연이 작동하는 구조로 본다. 사주에는 그런 인연이 들어올 수 있는 지점이 있으며 이를 귀인이라 부르고, 이 분석에서는 해당 사주에서 어떤 도움과 인연이 어떻게 작동하기 쉬운지 살펴본다."
    );
  } else {
    introParts.push(
      "살다 보면 일이 술술 풀리거나 예상 못 한 도움이 찾아오는 때가 있어요. 명리에서는 이런 흐름을 우연이 아니라, 삶 속에서 도움의 인연이 작동하는 구조로 봅니다. 사주에는 그런 인연이 들어올 수 있는 지점이 있고, 이를 귀인이라 부르며, 이 분석에서는 당신 사주에서 어떤 도움과 인연이 어떻게 작동하기 쉬운지 살펴봅니다."
    );
  }

  const bodyParts: string[] = [];

  if (hasSamDeok) {
    bodyParts.push(
      "천을귀인·천덕귀인·월덕귀인이 함께 있는 이른바 삼덕 구조라, 위기 때마다 사람·제도·타이밍이 묘하게 맞아떨어지는 경험을 하기 쉬운 편입니다. 힘들어도 막판에 길이 열리거나, '덕 본 일'이 반복해서 쌓이면서 나이가 들수록 보호막이 더욱 두꺼워지는 흐름이에요."
    );
  }

  if (hasRokPair) {
    bodyParts.push(
      "건록과 암록이 동시에 자리해 있어서, 앞에서는 자력으로 버티고 뒤에서는 보이지 않는 복이 받쳐 주는 재복 구조를 이룹니다. 한때 재정적으로 요동쳐도 결국에는 다시 자리 잡고 회복되는 패턴으로 정리되기 좋습니다."
    );
  }

  if (hasMunHak) {
    bodyParts.push(
      "문창귀인과 학당귀인이 함께 있어, 배우고 표현하는 능력이 동시에 강하게 작동하는 타입이에요. 공부·자격·교육·콘텐츠 영역을 엮어서 가져가면, 지식과 표현이 서로를 살려 주는 형태로 커리어를 설계하기 좋습니다."
    );
  }

  for (const key of picked) {
    const text = summarizeByKey(key, byKey.get(key) || []);
    if (text) bodyParts.push(text);
  }

  const closingParts: string[] = [];
  if (tone === "fun") {
    closingParts.push(
      "이 귀인 구조는 한 번에 폭발하기보다는, 나이가 들수록 '아, 그래서 내가 여기까지 버텨왔구나' 하는 장면들로 조금씩 누적되는 타입이야."
    );
  } else if (tone === "reality") {
    closingParts.push(
      "이런 길신들은 특정 연도 한두 해에만 반짝하는 것이 아니라, 생애 전반에 걸쳐 필요할 때마다 다른 형식으로 모습을 바꾸어 나타나면서 점진적으로 힘을 더해 가는 구조입니다."
    );
  } else {
    closingParts.push(
      "결국 이 귀인 구조는 시간이 지날수록 더 자연스럽게 작동해서, 어느 순간 돌아보면 '내가 혼자였던 적은 거의 없었구나'라는 감각으로 이어지게 됩니다."
    );
  }

  const paragraphs = [
    introParts.join(" "),
    bodyParts.join(" "),
    closingParts.join(" "),
  ].filter((p) => p && p.trim().length > 0);

  return paragraphs.join("\n\n");
}


