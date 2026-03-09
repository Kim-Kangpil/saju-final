// frontend/data/gongmangAnalysis.ts
//
// 공망(空亡) 판별 전용 로직
// - 기준: 일주(메인) + 년주(보조)
// - 일주별 공망 지지 2개를 조견표로 매핑해서 사용

export type GongmangPos = "년" | "월" | "일" | "시";

export interface GongmangHit {
  pos: GongmangPos;
  branch: string; // 공망에 해당하는 지지
}

export interface GongmangSource {
  from: "일주" | "년주";
  emptyBranches: [string, string]; // 이 순에서 공망이 되는 지지 2개
  hits: GongmangHit[]; // 실제 사주에서 공망이 걸린 위치들
}

export interface GongmangAnalysisResult {
  sources: GongmangSource[]; // 일주/년주 기준 각각의 공망 정보
}

// 일주별 공망 지지 조견표
// (사용자 제공 표 기준: 60갑자 전부 매핑)
const DAY_PILLAR_GONGMANG: Record<string, [string, string]> = {
  // 갑자순 (공망: 술·해)
  "甲子": ["戌", "亥"],
  "乙丑": ["戌", "亥"],
  "丙寅": ["戌", "亥"],
  "丁卯": ["戌", "亥"],
  "戊辰": ["戌", "亥"],
  "己巳": ["戌", "亥"],
  "庚午": ["戌", "亥"],
  "辛未": ["戌", "亥"],
  "壬申": ["戌", "亥"],
  "癸酉": ["戌", "亥"],

  // 갑술순 (공망: 신·유)
  "甲戌": ["申", "酉"],
  "乙亥": ["申", "酉"],
  "丙子": ["申", "酉"],
  "丁丑": ["申", "酉"],
  "戊寅": ["申", "酉"],
  "己卯": ["申", "酉"],
  "庚辰": ["申", "酉"],
  "辛巳": ["申", "酉"],
  "壬午": ["申", "酉"],
  "癸未": ["申", "酉"],

  // 갑신순 (공망: 오·미)
  "甲申": ["午", "未"],
  "乙酉": ["午", "未"],
  "丙戌": ["午", "未"],
  "丁亥": ["午", "未"],
  "戊子": ["午", "未"],
  "己丑": ["午", "未"],
  "庚寅": ["午", "未"],
  "辛卯": ["午", "未"],
  "壬辰": ["午", "未"],
  "癸巳": ["午", "未"],

  // 갑오순 (공망: 진·사)
  "甲午": ["辰", "巳"],
  "乙未": ["辰", "巳"],
  "丙申": ["辰", "巳"],
  "丁酉": ["辰", "巳"],
  "戊戌": ["辰", "巳"],
  "己亥": ["辰", "巳"],
  "庚子": ["辰", "巳"],
  "辛丑": ["辰", "巳"],
  "壬寅": ["辰", "巳"],
  "癸卯": ["辰", "巳"],

  // 갑진순 (공망: 인·묘) — 대공망
  "甲辰": ["寅", "卯"],
  "乙巳": ["寅", "卯"],
  "丙午": ["寅", "卯"],
  "丁未": ["寅", "卯"],
  "戊申": ["寅", "卯"],
  "己酉": ["寅", "卯"],
  "庚戌": ["寅", "卯"],
  "辛亥": ["寅", "卯"],
  "壬子": ["寅", "卯"],
  "癸丑": ["寅", "卯"],

  // 갑인순 (공망: 자·축)
  "甲寅": ["子", "丑"],
  "乙卯": ["子", "丑"],
  "丙辰": ["子", "丑"],
  "丁巳": ["子", "丑"],
  "戊午": ["子", "丑"],
  "己未": ["子", "丑"],
  "庚申": ["子", "丑"],
  "辛酉": ["子", "丑"],
  "壬戌": ["子", "丑"],
  "癸亥": ["子", "丑"],
};

function splitPillar(pillar: string): { stem: string; branch: string } {
  if (!pillar || pillar.length < 2) {
    return { stem: "", branch: "" };
  }
  const stem = pillar[0];
  const branch = pillar[1];
  return { stem, branch };
}

export function analyzeGongmang(pillars: {
  year: string;
  month: string;
  day: string;
  hour: string;
}): GongmangAnalysisResult | null {
  const { year, month, day, hour } = pillars;
  if (!year || !day) return null;

  const yearKey = year.slice(0, 2);
  const dayKey = day.slice(0, 2);

  const sources: GongmangSource[] = [];

  const { branch: yearBranch } = splitPillar(year);
  const { branch: monthBranch } = splitPillar(month);
  const { branch: dayBranch } = splitPillar(day);
  const { branch: hourBranch } = splitPillar(hour);

  const branchByPos: Record<GongmangPos, string> = {
    년: yearBranch,
    월: monthBranch,
    일: dayBranch,
    시: hourBranch,
  };

  // 일주 기준 공망 (메인)
  const dayEmpty = DAY_PILLAR_GONGMANG[dayKey];
  if (dayEmpty) {
    const [b1, b2] = dayEmpty;
    const hits: GongmangHit[] = [];
    (["년", "월", "일", "시"] as GongmangPos[]).forEach((pos) => {
      const br = branchByPos[pos];
      if (br === b1 || br === b2) {
        hits.push({ pos, branch: br });
      }
    });
    sources.push({
      from: "일주",
      emptyBranches: dayEmpty,
      hits,
    });
  }

  // 년주 기준 공망 (보조)
  const yearEmpty = DAY_PILLAR_GONGMANG[yearKey];
  if (yearEmpty) {
    const [b1, b2] = yearEmpty;
    const hits: GongmangHit[] = [];
    (["년", "월", "일", "시"] as GongmangPos[]).forEach((pos) => {
      const br = branchByPos[pos];
      if (br === b1 || br === b2) {
        hits.push({ pos, branch: br });
      }
    });
    sources.push({
      from: "년주",
      emptyBranches: yearEmpty,
      hits,
    });
  }

  if (sources.length === 0) return null;
  return { sources };
}

// =====================================================
// 해공/성립 상태 판별 + 요약 텍스트 생성
// =====================================================

type CharKey = "empathy" | "reality" | "fun";

type GongmangState = "none" | "full" | "released";

const SIX_HAP: Array<[string, string]> = [
  ["子", "丑"],
  ["寅", "亥"],
  ["卯", "戌"],
  ["辰", "酉"],
  ["巳", "申"],
  ["午", "未"],
];

const SIX_CHUNG: Array<[string, string]> = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

function hasHapOrChung(target: string, others: string[]): boolean {
  for (const [a, b] of SIX_HAP) {
    if (target === a && others.includes(b)) return true;
    if (target === b && others.includes(a)) return true;
  }
  for (const [a, b] of SIX_CHUNG) {
    if (target === a && others.includes(b)) return true;
    if (target === b && others.includes(a)) return true;
  }
  return false;
}

export function summarizeGongmang(
  pillars: { year: string; month: string; day: string; hour: string },
  tone: CharKey = "empathy"
): string | null {
  const analysis = analyzeGongmang(pillars);
  const { year, month, day, hour } = pillars;
  const { branch: yearBranch } = splitPillar(year);
  const { branch: monthBranch } = splitPillar(month);
  const { branch: dayBranch } = splitPillar(day);
  const { branch: hourBranch } = splitPillar(hour);
  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch].filter(Boolean);

  const byPos: Record<GongmangPos, GongmangState> = {
    년: "none",
    월: "none",
    일: "none",
    시: "none",
  };

  if (!analysis) {
    // 공망 자체가 거의 작동하지 않는 구조
    if (tone === "fun") {
      return "네 사주는 공망이 눈에 띄게 작동하는 구조는 아니야. 쉽게 말하면, 뿌리나 관계·노년 쪽에서 '구멍'보다 '기본 골격'이 더 크게 작용하는 타입이라, 공망 때문에 인생이 뒤집히는 그림은 아니라는 뜻이야.";
    }
    if (tone === "reality") {
      return "현재 구조에서는 일주·년주 기준 공망이 뚜렷하게 잡히지 않습니다. 조상·부모·배우자·자녀·노년 영역이 공망으로 크게 비워지기보다는, 기본 사주의 틀과 선택의 방향이 더 크게 작용하는 타입으로 볼 수 있어요.";
    }
    return "이 사주는 공망이 강하게 작동하는 편은 아니에요. 조상·부모·배우자·자녀·노년과 관련된 영역이 공허하게 비워지기보다는, 스스로 선택한 방향과 기본 골격이 인생의 틀을 더 분명하게 잡아 주는 구조에 가깝습니다.";
  }

  // 위치별로 full/released 판정
  (["년", "월", "일", "시"] as GongmangPos[]).forEach((pos) => {
    const hitsHere = analysis.sources.flatMap((s) =>
      s.hits.filter((h) => h.pos === pos)
    );
    if (hitsHere.length === 0) {
      byPos[pos] = "none";
      return;
    }
    const branchesHere = hitsHere.map((h) => h.branch);
    const others = allBranches.filter((b) => !branchesHere.includes(b));
    const anyReleased = branchesHere.some((br) => hasHapOrChung(br, others));
    byPos[pos] = anyReleased ? "released" : "full";
  });

  const parts: string[] = [];

  if (tone === "fun") {
    parts.push("공망 쪽은 이렇게 보면 돼. '어디가 비어 있냐' 보다는, 어디에 힘을 덜 써도 괜찮은지 보는 느낌이야.");
  } else if (tone === "reality") {
    parts.push("공망은 특정 영역의 집착을 비워 두는 대신, 다른 곳에 힘을 더 쓰게 만드는 구조로 볼 수 있어요.");
  } else {
    parts.push("공망은 인생의 어떤 영역에서 힘을 조금 덜 써도 되는지, 어디를 가볍게 넘어가도 되는지를 보여주는 지점으로 볼 수 있어요.");
  }

  // 년지
  if (byPos["년"] === "none") {
    parts.push("년지 쪽은 조상·부모 기반이 비교적 안정적으로 작동하는 편이라, 뿌리 자체가 크게 흔들리는 그림은 아니에요.");
  } else if (byPos["년"] === "full") {
    parts.push(
      "년지가 공망에 걸려 있어서, 어린 시절부터 집안이나 부모의 틀에 기대기보다는 스스로 길을 만들어 온 느낌이 강할 수 있어요. 덕분에 '내 힘으로 여기까지 왔다'는 자존감이 크게 자라기 좋은 구조입니다."
    );
  } else {
    parts.push(
      "년지에 공망 기운이 있지만 합·충으로 어느 정도 해소되어, 실제로는 조상·부모와의 인연이 완전히 끊기기보다는 적당한 거리감 속에서 스스로 서는 쪽으로 힘이 씁니다."
    );
  }

  // 월지
  if (byPos["월"] === "none") {
    parts.push("월지에는 공망이 강하게 걸려 있지 않아, 직장·사회생활의 기본 틀은 비교적 안정적으로 잡히는 편이에요.");
  } else if (byPos["월"] === "full") {
    parts.push(
      "월지가 공망이면, 청년기와 사회 초반에 기반을 잡기까지 시행착오가 많을 수 있어요. 다만 이 과정에서 '어디에 오래 머물러야 하는지'를 더 정확히 알게 되기 때문에, 한 번 자리를 잡으면 쉽게 무너지지 않는 장점이 생깁니다."
    );
  } else {
    parts.push(
      "월지 공망이 합·충으로 어느 정도 풀려 있어서, 초반에는 자리 잡는 과정이 다소 지연되더라도 결국은 자신에게 맞는 환경을 찾아가는 흐름으로 정리되기 쉽습니다."
    );
  }

  // 일지
  if (byPos["일"] === "none") {
    parts.push("일지에는 공망이 강하게 걸려 있지 않아, 배우자 인연과 내면의 정서적 기반이 비교적 든든하게 받쳐주는 편이에요.");
  } else if (byPos["일"] === "full") {
    parts.push(
      "일지가 공망이면, 결혼이나 친밀한 관계 안에서도 한 번쯤은 깊은 허전함을 느끼기 쉽습니다. 다만 이 덕분에 '정말 편안한 관계'가 무엇인지 기준이 높아지고, 가볍지 않은 인연을 골라내는 눈이 함께 자라게 됩니다."
    );
  } else {
    parts.push(
      "일지 공망이 합·충으로 일부 해소되어, 관계 안에서 공허함을 느끼는 순간이 있더라도 결국은 서로의 빈자리를 메워 줄 수 있는 방식으로 조율해 가기 좋은 구조입니다."
    );
  }

  // 시지
  if (byPos["시"] === "none") {
    parts.push("시지에는 공망이 두드러지지 않아, 자녀 인연과 노년의 기반이 비교적 안정적으로 이어질 가능성이 큽니다.");
  } else if (byPos["시"] === "full") {
    parts.push(
      "시지가 공망이면, 자녀와의 물리적 거리나 말년의 생활 패턴에서 다소 고독을 느낄 수 있어요. 대신 세속적인 기대에서 한 발 떨어져, 내 페이스대로 조용히 삶을 정리할 수 있는 자유가 함께 주어지는 구조이기도 합니다."
    );
  } else {
    parts.push(
      "시지 공망이 해공되어, 자녀·노년과 관련된 영역이 완전히 비워지기보다는 '적당히 거리를 둔 편안한 관계' 쪽으로 정리되기 쉽습니다."
    );
  }

  const text = parts.join(" ");

  // 길이 조정은 엄밀히 하지 않고, 300~400자 근처의 밀도를 맞추는 수준으로 둔다.
  return text;
}


