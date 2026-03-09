// frontend/data/emotionalWeaknessAnalysis.ts
// 감정 약점 및 보완 포인트 분석

export type EmotionalToneKey = "empathy" | "reality" | "fun";

export interface EmotionalWeaknessParams {
  dayStem: string;
  stems: string[]; // [년간, 월간, 일간, 시간]
  branches: string[]; // [년지, 월지, 일지, 시지]
  tone: EmotionalToneKey;
  tenGod: (dayStem: string, targetStem: string) => string;
}

// 지지 본기 → 천간
function branchMainStem(branch: string): string | null {
  const map: Record<string, string> = {
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
  return map[branch] ?? null;
}

interface CountResult {
  inSeong: number;
  biGeop: number;
  gwanSeong: number;
  sikSang: number;
  jaeSeong: number;
  detail: Record<string, number>;
}

function countTenGods(params: EmotionalWeaknessParams): CountResult {
  const { dayStem, stems, branches, tenGod } = params;
  const detail: Record<string, number> = {};

  const inc = (name: string) => {
    if (!name) return;
    detail[name] = (detail[name] ?? 0) + 1;
  };

  // 천간 4개
  stems.forEach((stem) => {
    const tg = tenGod(dayStem, stem);
    inc(tg);
  });

  // 지지 4개 (본기 기준)
  branches.forEach((br) => {
    const main = branchMainStem(br);
    if (!main) return;
    const tg = tenGod(dayStem, main);
    inc(tg);
  });

  const inSeong = (detail["정인"] ?? 0) + (detail["편인"] ?? 0);
  const biGeop = (detail["비견"] ?? 0) + (detail["겁재"] ?? 0);
  const gwanSeong = (detail["정관"] ?? 0) + (detail["편관"] ?? 0);
  const sikSang = (detail["식신"] ?? 0) + (detail["상관"] ?? 0);
  const jaeSeong = (detail["정재"] ?? 0) + (detail["편재"] ?? 0);

  return { inSeong, biGeop, gwanSeong, sikSang, jaeSeong, detail };
}

function levelLabel(n: number): "none" | "weak" | "mid" | "strong" {
  if (n <= 0) return "none";
  if (n === 1) return "weak";
  if (n === 2) return "mid";
  return "strong";
}

function describeEmotionAxis(
  inLevel: "none" | "weak" | "mid" | "strong",
  biLevel: "none" | "weak" | "mid" | "strong"
): string {
  const inStrong = inLevel === "mid" || inLevel === "strong";
  const inWeak = inLevel === "weak";
  const inNone = inLevel === "none";
  const biStrong = biLevel === "mid" || biLevel === "strong";
  const biWeak = biLevel === "weak";
  const biNone = biLevel === "none";

  // 인성 강 + 비겁 강
  if (inStrong && biStrong) {
    return "감정을 혼자 감당하려는 성향과 지지 않으려는 자존심이 동시에 작동하는 구조예요. 힘들어도 도움을 요청하지 못하고, 상처를 받아도 표현하지 않고 버티다가 한계점에서 한꺼번에 터지는 패턴이 반복되기 쉽습니다. 스스로도 왜 이렇게까지 됐는지 설명하기 어려운 순간이 찾아오는 타입입니다.";
  }
  // 인성 강 + 비겁 약
  if (inStrong && biWeak) {
    return "생각은 많은데 자기 페이스를 유지하는 힘이 약한 편이에요. 머릿속에서 수많은 시뮬레이션을 돌리지만 실제 상황에서는 주변 흐름에 휩쓸리고, 감정을 정리하려 할수록 더 깊이 빠져드는 과생각 루프가 약점으로 작용하기 쉽습니다.";
  }
  // 인성 강 + 비겁 없음
  if (inStrong && biNone) {
    return "감정을 안으로 쌓아두는데 자기를 지탱해 줄 기준이 약해서, 타인의 말 한마디에 오래 흔들리기 쉬운 구조예요. 혼자 정리하려 하지만 기준점이 없다 보니 결론이 잘 나지 않고, 해소되지 않은 감정이 만성적으로 쌓이는 패턴으로 이어질 수 있습니다.";
  }
  // 인성 약 + 비겁 강
  if (inWeak && biStrong) {
    return "외부 자극에 쉽게 흔들리면서 자존심까지 강해, 상처를 받으면 즉각적으로 반응하기 쉬운 타입이에요. 감정 기복이 크고 자존심이 건드려지는 순간 평소와 다른 강한 말이나 행동이 튀어나오면서, 본인도 나중에 당황하는 경우가 생길 수 있습니다.";
  }
  // 인성 약 + 비겁 약
  if (inWeak && biWeak) {
    return "감정의 중심축이 약하게 잡혀 있어, 상황과 사람에 따라 감정 상태가 크게 달라지기 쉬운 구조예요. 스스로도 오늘의 내 감정이 무엇인지 잘 모르겠는 순간이 있고, 외부 환경이 감정을 좌우하는 비율이 높은 편입니다.";
  }
  // 인성 약 + 비겁 없음
  if (inWeak && biNone) {
    return "감정 처리 근육 자체가 아직 약한 유형이에요. 쌓아두지도 못하고 자존심으로 버티지도 못하다 보니, 감정이 곧바로 몸이나 행동으로 나타나고 스트레스가 신체 증상으로 먼저 드러나는 경우가 많습니다.";
  }
  // 인성 없음 + 비겁 강
  if (inNone && biStrong) {
    return "생각을 거치지 않고 즉각 반응하는데 자존심까지 강해, 충동적으로 반응한 뒤에도 사과나 수습을 어렵게 느끼는 패턴이 나타나기 쉬워요. 관계에서 먼저 강하게 치고 나가고, 시간이 지난 뒤에야 후회가 밀려오는 일이 반복될 수 있습니다.";
  }
  // 인성 없음 + 비겁 약
  if (inNone && biWeak) {
    return "감정 정리도 잘 안 되고 자기 주관도 약한 편이라, 상황에 따라 즉흥적으로 흘러가다가 뒤늦게야 '그때 내가 어떤 감정이었지?' 하고 인식하는 뒤늦은 반응형에 가깝습니다. 스스로 감정을 다루는 훈련이 가장 많이 필요한 구조예요.";
  }
  // 인성 없음 + 비겁 없음
  return "감정보다 현실과 관계를 먼저 챙기는 경향이 강해, 평소에는 감정 자체를 크게 의식하지 않고 지내기 쉬운 타입이에요. 그러다 어느 순간 한꺼번에 번아웃처럼 힘이 빠지는 방식으로 터질 수 있어서, 일상에서 자기 내면에 관심을 기울이는 연습이 중요한 구조입니다.";
}

function describeGwanSeong(level: "none" | "weak" | "mid" | "strong"): string {
  if (level === "strong" || level === "mid") {
    return "책임감과 완벽주의가 강해 스스로를 끊임없이 압박하는 구조예요. 평가받는 상황, 실수, 기대에 못 미치는 장면에서 극도로 예민해지기 쉽고, 잘해야 한다는 강박이 일상적으로 작동합니다. 그만큼 완벽하지 않은 나를 받아들이는 일이 감정적으로 가장 어려운 과제가 되기 쉽습니다.";
  }
  if (level === "weak") {
    return "사회적 책임과 규칙에 적당히 반응하면서도, 요구가 몰릴 때는 부담을 크게 느끼는 편이에요. 해야 할 일을 알고는 있지만, 가끔은 '혹시 내가 부족한 건 아닐까' 하는 긴장이 함께 따라붙습니다. 책임을 다하려는 마음과 쉬고 싶은 마음이 부딪히면서 스트레스로 쌓이기 쉽습니다.";
  }
  return "외부의 평가나 규칙에 크게 구애받지 않는 편이라 자유로운 대신, 자기 규율이 약해지거나 책임을 회피하는 방향으로 흐르기 쉽습니다. 해야 할 일을 미루다가 막판에 몰려 스트레스를 받는 패턴이 생길 수 있어, 작은 약속부터 지키는 연습이 감정 부담을 줄이는 데 도움이 됩니다.";
}

function describeSikSang(level: "none" | "weak" | "mid" | "strong"): string {
  if (level === "strong" || level === "mid") {
    return "감정을 바로 말이나 행동으로 표출하는 편이에요. 표현 자체는 시원하지만 감정이 격해지면 말이 강해지고, 상대에게 상처를 주는 표현이 튀어나와 놓고 나서 후회하는 패턴이 반복되기 쉽습니다. 말의 속도를 조금만 늦추는 연습이 가장 큰 보완 포인트가 됩니다.";
  }
  if (level === "weak") {
    return "감정 표현이 상황에 따라 크게 달라지는 타입이에요. 편안한 관계에서는 잘 풀어내지만, 낯선 상황이나 권위 앞에서는 감정을 접어 두면서 스스로 답답함을 안고 가기 쉽습니다. '괜찮다'고 말해 놓고 나서도 마음 한켠이 오래 남는 경우가 생깁니다.";
  }
  return "감정을 밖으로 꺼내는 통로가 막혀 있는 쪽에 가까워요. 하고 싶은 말을 못 하고 쌓아두다가 두통·소화불량 같은 몸 증상으로 나타나거나, 어느 순간 한 번에 무너지는 방식으로 터질 수 있습니다. 감정을 문장으로 풀어 적어 보는 연습이 중요한 보완 포인트입니다.";
}

function describeJaeSeong(level: "none" | "weak" | "mid" | "strong"): string {
  if (level === "strong" || level === "mid") {
    return "사람을 의식하고 관계를 관리하는 데 많은 에너지를 쓰는 편이에요. 눈치가 빠르고 상대 반응에 민감하게 반응하다 보니 관계 피로가 쌓이고, 잘 보이려는 노력이 오히려 스트레스로 돌아오기도 합니다. 싫은 말을 한 번에 다 하려 하기보다, 작은 거절부터 연습하는 것이 도움이 됩니다.";
  }
  if (level === "weak") {
    return "관계에서 적당한 균형을 유지하려는 타입이에요. 지나치게 의식하지도, 완전히 무시하지도 않는 대신, 가끔은 '어디까지 맞춰야 하지?' 하는 애매함 속에서 에너지를 쓰게 됩니다. 어느 선까지 책임지고, 어디서부터는 내려놓을지 스스로 기준을 정해 두는 것이 감정 소모를 줄입니다.";
  }
  return "인간관계에서 타인의 감정을 읽는 것에 다소 둔감한 편이에요. 상처를 주고도 잘 모르거나, 반대로 본인이 상처를 받아도 명확히 인식하지 못한 채 쌓아 두는 경우가 생길 수 있습니다. 감정에 이름을 붙여서 말로 나눌수록, 관계의 벽이 조금씩 낮아지는 구조입니다.";
}

function describeBias(detail: Record<string, number>): string[] {
  const out: string[] = [];

  const sangGwan = detail["상관"] ?? 0;
  const sikSin = detail["식신"] ?? 0;
  if (sangGwan > sikSin) {
    out.push("식상 축에서는 상관이 식신보다 강해, 감정 표현이 날카롭고 공격적으로 느껴질 수 있어요. 유머와 표현력이 뛰어나지만, 감정이 섞이면 말이 칼처럼 들릴 때가 있습니다.");
  } else if (sikSin > sangGwan) {
    out.push("식상 안에서는 식신이 상관보다 강해서, 감정을 부드럽게 풀어내거나 유머로 승화시키는 쪽에 가깝습니다. 다만 본심을 돌려서 말하다 보니 진짜 속마음이 제대로 전달되지 않는 순간도 생길 수 있어요.");
  }

  const pJae = detail["편재"] ?? 0;
  const jJae = detail["정재"] ?? 0;
  if (pJae > jJae) {
    out.push("재성에서는 편재가 정재보다 강해, 관계에서 즉흥적이고 변덕스러운 감정 흐름이 나타나기 쉽습니다. 순간의 즐거움에 따라 움직이다가 이후 피로감이나 허전함을 느낄 수 있어요.");
  } else if (jJae > pJae) {
    out.push("재성 쪽은 정재가 편재보다 강해서, 관계를 대할 때도 손익과 책임을 함께 따지며 안정적인 쪽을 선택하려는 경향이 있습니다. 계산이 많아질수록 마음은 지치는 구조이기도 해요.");
  }

  return out;
}

export function getEmotionalWeaknessParagraph(
  params: EmotionalWeaknessParams
): string {
  const { tone } = params;
  const { inSeong, biGeop, gwanSeong, sikSang, jaeSeong, detail } = countTenGods(params);

  const inLvl = levelLabel(inSeong);
  const biLvl = levelLabel(biGeop);
  const gwanLvl = levelLabel(gwanSeong);
  const sikLvl = levelLabel(sikSang);
  const jaeLvl = levelLabel(jaeSeong);

  const introParts: string[] = [];

  if (tone === "fun") {
    introParts.push(
      "감정 약점을 본다는 건 '어디가 약하니까 망한다'가 아니라, 어디서 더 쉽게 흔들리는지 알고 관리 포인트를 찾는 거야. 네 사주는 인성·비겁·관성·식상·재성 분포를 보면 이런 식으로 감정 에너지가 배치되어 있어."
    );
  } else if (tone === "reality") {
    introParts.push(
      "감정 약점은 결함이라기보다, 어느 축에서 더 에너지를 많이 쓰고 어디서 쉽게 흔들리는지 보여 주는 지표에 가깝습니다. 이 사주는 인성·비겁·관성·식상·재성의 분포를 기준으로 감정 구조와 스트레스 포인트를 이렇게 읽을 수 있어요."
    );
  } else {
    introParts.push(
      "감정 약점은 '내가 잘못됐다'는 증거가 아니라, 어느 부분에서 조금 더 지지와 휴식이 필요한지 알려주는 지점이에요. 인성·비겁·관성·식상·재성의 분포를 보면, 당신의 감정 에너지는 이렇게 움직입니다."
    );
  }

  const paraEmotion = describeEmotionAxis(inLvl, biLvl);
  const paraGwan = describeGwanSeong(gwanLvl);
  const paraSik = describeSikSang(sikLvl);
  const paraJae = describeJaeSeong(jaeLvl);

  const bias = describeBias(detail);
  const paraBias = bias.length > 0 ? bias.join(" ") : "";

  const closingParts: string[] = [];

  if (tone === "fun") {
    closingParts.push(
      "이 감정 패턴들은 한 번에 고치려고 하기보다, '아 내가 이런 패턴이 있구나'를 알고 한두 군데만 의식적으로 다루기 시작하면 서서히 힘이 빠지는 구조야. 시간이 지날수록, 지금의 약점이 오히려 남들보다 감정에 섬세한 무기가 되는 쪽으로 바뀌어 가게 돼."
    );
  } else if (tone === "reality") {
    closingParts.push(
      "이 축들은 단기간에 바뀌기보다는, 패턴을 인식하고 작은 선택을 반복하면서 천천히 재구조화됩니다. 시간을 두고 자신만의 관리법을 만들어 갈수록, 같은 자극에서도 덜 흔들리고 더 전략적으로 감정을 활용하는 능력으로 전환될 수 있어요."
    );
  } else {
    closingParts.push(
      "이 감정 축들은 지금 이 모습 그대로 고정된 운명이 아니라, 시간이 흐르면서 조금씩 다루는 법을 익혀 가는 연습장에 가깝습니다. 오늘 이후로는 같은 상황을 만날 때마다 '아, 여기서 내 패턴이 올라오는구나'라고 알아차리는 것만으로도, 약점이 서서히 무기로 바뀌는 흐름을 만들 수 있어요."
    );
  }

  const paragraphs = [
    introParts.join(" "),
    paraEmotion,
    paraGwan,
    [paraSik, paraJae, paraBias].filter((p) => p && p.trim().length > 0).join(" "),
    closingParts.join(" "),
  ].filter((p) => p && p.trim().length > 0);

  return paragraphs.join("\n\n");
}

*** End Patch```} ***!
  const bias = describeBias(detail);
  if (bias.length > 0) {
    bodyParts.push(bias.join(" "));
  }

  const closingParts: string[] = [];

  if (tone === "fun") {
    closingParts.push(
      "이 감정 패턴들은 한 번에 고치려고 하기보다, '아 내가 이런 패턴이 있구나'를 알고 한두 군데만 의식적으로 다루기 시작하면 서서히 힘이 빠지는 구조야. 시간이 지날수록, 지금의 약점이 오히려 남들보다 감정에 섬세한 무기가 되는 쪽으로 바뀌어 가게 돼."
    );
  } else if (tone === "reality") {
    closingParts.push(
      "이 축들은 단기간에 바뀌기보다는, 패턴을 인식하고 작은 선택을 반복하면서 천천히 재구조화됩니다. 시간을 두고 자신만의 관리법을 만들어 갈수록, 같은 자극에서도 덜 흔들리고 더 전략적으로 감정을 활용하는 능력으로 전환될 수 있어요."
    );
  } else {
    closingParts.push(
      "이 감정 축들은 지금 이 모습 그대로 고정된 운명이 아니라, 시간이 흐르면서 조금씩 다루는 법을 익혀 가는 연습장에 가깝습니다. 오늘 이후로는 같은 상황을 만날 때마다 '아, 여기서 내 패턴이 올라오는구나'라고 알아차리는 것만으로도, 약점이 서서히 무기로 바뀌는 흐름을 만들 수 있어요."
    );
  }

  const paragraphs = [
    introParts.join(" "),
    bodyParts.join(" "),
    closingParts.join(" "),
  ].filter((p) => p && p.trim().length > 0);

  return paragraphs.join("\n\n");
}

