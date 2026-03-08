/**
 * 잠재된 천부와 직무 적성 — 월지·격국(지장간 투출) 기준.
 * 이론: backend/logic/theories/사주이론(지지).txt, 사주이론(통근과투출).txt
 * 월지의 지장간이 천간에 똑같은 글자로 드러나면 투출(成格), 아니면 敗格.
 * 격 = 월지의 정기(本气) 또는 투출된 글자를 일간 기준 십신으로 해석 → 천부·직무 적성 ~600자.
 */

export type AptitudeToneKey = "empathy" | "reality" | "fun";

type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";

/** 지지별 지장간(地藏干). 첫 번째가 정기(本气). 이론: 사주이론(지지).txt */
const BRANCH_JIJANGGAN: Record<string, string[]> = {
  "子": ["癸", "壬"],
  "丑": ["己", "癸", "辛"],
  "寅": ["甲", "戊", "丙"],
  "卯": ["乙", "甲"],
  "辰": ["戊", "乙", "癸"],
  "巳": ["丙", "戊", "庚"],
  "午": ["丁", "丙", "己"],
  "未": ["己", "丁", "乙"],
  "申": ["庚", "戊", "壬"],
  "酉": ["辛", "庚"],
  "戌": ["戊", "辛", "丁"],
  "亥": ["壬", "戊", "甲"],
};

function stemMeta(stem: string): { el: Element; pol: Polarity } | null {
  const map: Record<string, { el: Element; pol: Polarity }> = {
    甲: { el: "wood", pol: "yang" }, 乙: { el: "wood", pol: "yin" },
    丙: { el: "fire", pol: "yang" }, 丁: { el: "fire", pol: "yin" },
    戊: { el: "earth", pol: "yang" }, 己: { el: "earth", pol: "yin" },
    庚: { el: "metal", pol: "yang" }, 辛: { el: "metal", pol: "yin" },
    壬: { el: "water", pol: "yang" }, 癸: { el: "water", pol: "yin" },
  };
  return map[stem] ?? null;
}

function produces(a: Element, b: Element): boolean {
  const next: Record<Element, Element> = {
    wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood",
  };
  return next[a] === b;
}

function controls(a: Element, b: Element): boolean {
  const map: Record<Element, Element> = {
    wood: "earth", fire: "metal", earth: "water", metal: "wood", water: "fire",
  };
  return map[a] === b;
}

function tenGodFromStems(dayStem: string, targetStem: string): string {
  const dm = stemMeta(dayStem);
  const tm = stemMeta(targetStem);
  if (!dm || !tm) return "";
  const samePol = dm.pol === tm.pol;
  if (dm.el === tm.el) return samePol ? "비견" : "겁재";
  if (produces(dm.el, tm.el)) return samePol ? "식신" : "상관";
  if (produces(tm.el, dm.el)) return samePol ? "편인" : "정인";
  if (controls(dm.el, tm.el)) return samePol ? "편재" : "정재";
  if (controls(tm.el, dm.el)) return samePol ? "편관" : "정관";
  return "";
}

export interface SajuPillarsForAptitude {
  year: { cheongan: { hanja: string }; jiji: { hanja: string } };
  month: { cheongan: { hanja: string }; jiji: { hanja: string } };
  day: { cheongan: { hanja: string }; jiji: { hanja: string } };
  hour: { cheongan: { hanja: string }; jiji: { hanja: string } };
}

export interface AptitudeInfo {
  monthBranch: string;
  mainStem: string;
  tenGod: string;
  touchu: boolean;
  touchuStem: string | null;
}

/** 월지, 지장간 투출 여부, 격(월지 정기 또는 투출된 글자)의 십신 반환 */
export function getAptitudeInfo(pillars: SajuPillarsForAptitude): AptitudeInfo | null {
  const monthBranch = pillars.month?.jiji?.hanja?.trim?.()?.[0] ?? "";
  const dayStem = pillars.day?.cheongan?.hanja?.trim?.()?.[0] ?? "";
  if (!monthBranch || !dayStem) return null;

  const jijanggan = BRANCH_JIJANGGAN[monthBranch];
  if (!jijanggan?.length) return null;

  const stems = [
    pillars.year?.cheongan?.hanja?.trim?.()?.[0],
    pillars.month?.cheongan?.hanja?.trim?.()?.[0],
    pillars.day?.cheongan?.hanja?.trim?.()?.[0],
    pillars.hour?.cheongan?.hanja?.trim?.()?.[0],
  ].filter(Boolean) as string[];

  const mainStem = jijanggan[0];
  let touchuStem: string | null = null;
  for (const s of jijanggan) {
    if (stems.includes(s)) {
      touchuStem = s;
      break;
    }
  }
  const touchu = touchuStem !== null;
  const gridStem = touchuStem ?? mainStem;
  const tenGod = tenGodFromStems(dayStem, gridStem);

  return { monthBranch, mainStem, tenGod, touchu, touchuStem };
}

/** 십신별·成格/敗格·톤별 문장. ~600자, 특별한 사람 느낌, 전문용어 배제. */
const APTITUDE_BODY: Record<string, { success: Record<AptitudeToneKey, string>; fail: Record<AptitudeToneKey, string> }> = {
  비견: {
    success: {
      empathy: "스스로 결단하고 자기 일 끌어가는 쪽이 잘 맞아요. 친구·동료와 어울려도 흔들리지 않고 혼자서도 맡은 일을 끝까지 해내서, 독립·자영·프리랜서처럼 자기 페이스로 움직이는 일이 잘 어울려요.",
      reality: "<strong>주체성</strong>과 <strong>추진력</strong>이 뚜렷하게 드러나는 편입니다. 독립·자영·프리랜서에 잘 맞고, 자기주도적으로 일할 때 좋은 성과가 나오기 쉽습니다.",
      fun: "스스로 정한 대로 밀고 나가는 힘이 잘 보여. 혼자서도 잘해내고, 자영이랑 프리 같은 거 딱이야.",
    },
    fail: {
      empathy: "스스로 결단하고 밀어붙이는 힘이 잠재되어 있어요. 작은 일부터 ‘내가 정했다’고 말해 보시고, 친구·동료와 함께하는 일을 조금씩 늘려 보시면 그 재능이 점점 드러나기 쉬워요. 독립적인 일이나 자기 페이스로 움직이는 일에 도전해 보시면, 생각보다 잘 맞을 수 있어요.",
      reality: "주체성·추진력이 아직 잘 드러나지 않는 편입니다. 스스로 결정하고 실행할 기회를 조금씩 늘리면 잘 맞는 일로 이어지기 쉽습니다.",
      fun: "스스로 나서는 힘이 숨어 있어. 작은 거부터 네가 정했다고 말해 보거나, 친구랑 일 같이해 보면 재능 나와.",
    },
  },
  겁재: {
    success: {
      empathy: "경쟁과 도전할 때 잘 맞아요. 승부욕이 있어서 새로운 일을 시작하거나 목표를 세우는 데 잘 움직이고, 영업·스포츠처럼 이기고 싶은 마음이 살아 있는 일이 잘 어울려요.",
      reality: "<strong>경쟁력</strong>과 <strong>승부욕</strong>이 뚜렷하게 드러나는 편입니다. 영업·경쟁·도전이 있는 일에 잘 맞고, 목표를 달성하는 데 강점이 있습니다.",
      fun: "경쟁할 때 빛나는 타입이야. 승부욕 살리는 일 하면 잘해. 영업이랑 스포츠 쪽 딱 맞아.",
    },
    fail: {
      empathy: "경쟁과 도전에서 빛나는 힘이 잠재되어 있어요. 작은 목표부터 세워 보시고, ‘한 번 해 보자’는 마음으로 도전해 보시면 그 재능이 서서히 드러나기 쉬워요. 영업이나 승부가 있는 일에 조금씩 발을 들여보시면, 생각보다 잘 맞을 수 있어요.",
      reality: "경쟁력·승부욕이 아직 잘 드러나지 않는 편입니다. 작은 도전부터 늘려 보면 잘 맞는 일로 이어지기 쉽습니다.",
      fun: "경쟁할 때 빛나는 힘이 숨어 있어. 작은 목표부터 정해서 도전해 보면 재능 나와.",
    },
  },
  식신: {
    success: {
      empathy: "말하고 표현하는 쪽이 잘 맞아요. 생각을 말로 잘 꺼내고, 글쓰기·말하기·창작처럼 밖으로 꺼내는 일에서 잘 움직여요. 예술, 콘텐츠, 디자인, 교육처럼 재능을 펼치는 일이 잘 어울려요.",
      reality: "<strong>표현력</strong>과 <strong>창의성</strong>이 뚜렷하게 드러나는 편입니다. 창작·예술·콘텐츠·교육 쪽에 잘 맞고, 좋은 성과가 나오기 쉽습니다.",
      fun: "말이랑 표현이 잘 나오는 타입이야. 글쓰기·창작·디자인 같은 거 하면 딱이야.",
    },
    fail: {
      empathy: "말과 표현으로 빛나는 재능이 잠재되어 있어요. 하고 싶은 말을 짧게라도 꾸준히 해 보시고, 글쓰기나 창작을 취미로 시작해 보시면 그 재능이 점점 드러나기 쉬워요. 예술, 콘텐츠, 교육처럼 재능을 펼치는 일에 도전해 보시면, 생각보다 잘 맞을 수 있어요.",
      reality: "표현력·창의성이 아직 잘 드러나지 않는 편입니다. 말하고 쓰고 만드는 기회를 늘리면 잘 맞는 일로 이어지기 쉽습니다.",
      fun: "말이랑 재능이 숨어 있어. 하고 싶은 말 꾸준히 해 보거나 창작 쪽 해 보면 재능 나와.",
    },
  },
  상관: {
    success: {
      empathy: "틀을 넘어서는 쪽이 잘 맞아요. 남들과 다른 아이디어로 풀거나 새 방식을 만드는 데 잘 움직이고, 스타트업·연구·기획처럼 다르게 보는 일이 잘 어울려요.",
      reality: "<strong>혁신성</strong>과 비판적 사고가 뚜렷하게 드러나는 편입니다. 스타트업·연구·기획·컨설팅에 잘 맞습니다.",
      fun: "틀 깨고 새로 만드는 거 잘해. 스타트업이랑 기획 쪽 딱 맞아.",
    },
    fail: {
      empathy: "기존 틀을 넘어서는 혁신의 힘이 잠재되어 있어요. 작은 것이라도 ‘이건 다르게 해 보자’고 말해 보시고, 새 방식을 시도해 보시면 그 재능이 서서히 드러나기 쉬워요. 스타트업이나 기획·개혁이 있는 일에 도전해 보시면, 생각보다 잘 맞을 수 있어요.",
      reality: "혁신성·비판적 사고가 아직 잘 드러나지 않는 편입니다. 새 방식 시도 기회를 늘리면 잘 맞는 일로 이어지기 쉽습니다.",
      fun: "틀 깨는 힘이 숨어 있어. 작은 거라도 다르게 해 보면 재능 나와.",
    },
  },
  편재: {
    success: {
      empathy: "움직이면서 기회 잡는 쪽이 잘 맞아요. 사람 만나고 관계 넓히며 일 추진하는 데 잘 움직이고, 사업·영업·유통처럼 뛰어다니는 일이 잘 어울려요.",
      reality: "<strong>사업 추진력</strong>과 <strong>네트워킹</strong>이 뚜렷하게 드러나는 편입니다. 영업·사업·유통에 잘 맞습니다.",
      fun: "뛰어다니면서 기회 잡는 거 잘해. 영업이랑 장사 쪽 딱이야.",
    },
    fail: {
      empathy: "움직이며 기회를 잡는 힘이 잠재되어 있어요. 사람 만나는 걸 조금씩 늘려 보시고, 작은 거래나 소개부터 해 보시면 그 재능이 점점 드러나기 쉬워요. 영업이나 사업 쪽에 도전해 보시면, 생각보다 잘 맞을 수 있어요.",
      reality: "사업 추진력이 아직 잘 드러나지 않는 편입니다. 사람 만나고 일 추진하는 기회를 늘리면 잘 맞는 일로 이어지기 쉽습니다.",
      fun: "뛰어다니는 재능이 숨어 있어. 사람 만나는 거 조금씩 늘려 보면 재능 나와.",
    },
  },
  정재: {
    success: {
      empathy: "쌓고 정리하는 쪽이 잘 맞아요. 돈과 결과를 다루는 감각이 있어서 일을 끝까지 마무리하고 관리하는 데 잘 움직여요. 회계·재무·자산관리처럼 꾸준히 쌓아가는 일이 잘 어울려요.",
      reality: "<strong>재무</strong>·<strong>관리</strong> 역량이 뚜렷하게 드러나는 편입니다. 회계·재무·자산관리 쪽에 잘 맞습니다.",
      fun: "돈이랑 결과 챙기는 거 잘해. 회계·재테크 쪽 딱 맞아.",
    },
    fail: {
      empathy: "꾸준히 쌓고 정리하는 힘이 잠재되어 있어요. 작은 것부터 정리하고, 한 가지씩 결과를 챙기는 습관을 들여 보시면 그 재능이 서서히 드러나기 쉬워요. 회계나 재무·관리 쪽에 도전해 보시면, 생각보다 잘 맞을 수 있어요.",
      reality: "재무·관리 역량이 아직 잘 드러나지 않는 편입니다. 정리하고 챙기는 기회를 단계적으로 늘리면 잘 맞는 일로 이어지기 쉽습니다.",
      fun: "쌓고 정리하는 힘이 숨어 있어. 작은 거부터 챙겨 보면 재능 나와.",
    },
  },
  편관: {
    success: {
      empathy: "사람을 이끄는 카리스마와 책임감이 분명히 드러나는 편이에요. 맡은 역할을 끝까지 하고, 규칙을 지키며 조직에서 믿음을 받는 타고난 리더십이 있어요. 경영진, 관리자, 결정권이 있는 일에서 재능을 잘 쓸 수 있어요. 주변에서도 당신의 통솔력을 인정하기 쉬워요.",
      reality: "<strong>리더십</strong>과 <strong>의사결정력</strong>이 뚜렷하게 드러나는 편입니다. 경영·관리·임원급 일에 잘 맞습니다.",
      fun: "위에 서서 이끄는 거 잘해. 보스·CEO 쪽 딱이야.",
    },
    fail: {
      empathy: "사람을 이끄는 힘이 잠재되어 있어요. 작은 역할부터 맡아 보시고, 한 번씩 결정을 내려 보시면 그 재능이 점점 드러나기 쉬워요. 관리자나 리더 역할에 도전해 보시면, 생각보다 잘 맞을 수 있어요.",
      reality: "리더십이 아직 잘 드러나지 않는 편입니다. 작은 책임·역할부터 늘려 보면 잘 맞는 일로 이어지기 쉽습니다.",
      fun: "이끄는 힘이 숨어 있어. 작은 역할부터 맡아 보면 재능 나와.",
    },
  },
  정관: {
    success: {
      empathy: "원칙과 책임 지키는 쪽이 잘 맞아요. 규칙을 지키고 맡은 일을 끝까지 하는 데 잘 움직여서, 공무원·대기업·공공·조직 일이 잘 어울려요.",
      reality: "<strong>조직 적응력</strong>과 <strong>책임감</strong>이 뚜렷하게 드러나는 편입니다. 공공·대기업·관리직에 잘 맞습니다.",
      fun: "규칙 지키고 책임지는 거 잘해. 공무원·대기업 쪽 딱 맞아.",
    },
    fail: {
      empathy: "원칙과 책임을 지키는 힘이 잠재되어 있어요. 작은 규칙부터 지켜 보시고, 맡은 일을 한 번씩 끝까지 해 보시면 그 재능이 서서히 드러나기 쉬워요. 공공·조직 생활에 도전해 보시면, 생각보다 잘 맞을 수 있어요.",
      reality: "조직 적응력이 아직 잘 드러나지 않는 편입니다. 책임지고 규칙을 지키는 기회를 늘리면 잘 맞는 일로 이어지기 쉽습니다.",
      fun: "규칙·책임 지키는 힘이 숨어 있어. 작은 거부터 해 보면 재능 나와.",
    },
  },
  편인: {
    success: {
      empathy: "깊이 생각하고 남다른 시각 갖는 쪽이 잘 맞아요. 철학·심리·연구·창작처럼 깊이 파는 일에서 잘 움직이고, 그런 일이 잘 어울려요.",
      reality: "<strong>통찰력</strong>과 독창적 사고가 뚜렷하게 드러나는 편입니다. 철학·심리·연구·집필 쪽에 잘 맞습니다.",
      fun: "깊게 생각하고 남다른 시각 갖는 거 잘해. 철학·심리·연구 쪽 딱이야.",
    },
    fail: {
      empathy: "깊은 사색과 독특한 시각이 잠재되어 있어요. 관심 있는 주제를 하나 정해서 조금씩 파 보시면 그 재능이 점점 드러나기 쉬워요. 철학, 심리, 연구처럼 깊이 있는 일에 도전해 보시면, 생각보다 잘 맞을 수 있어요.",
      reality: "통찰력이 아직 잘 드러나지 않는 편입니다. 관심 분야를 꾸준히 파 보면 잘 맞는 일로 이어지기 쉽습니다.",
      fun: "깊게 생각하는 힘이 숨어 있어. 하나 정해서 파 보면 재능 나와.",
    },
  },
  정인: {
    success: {
      empathy: "<strong>배우고 가르치는 쪽</strong>이 잘 맞아요. <strong>지식을 쌓고 나누는 걸</strong> 좋아하고, 공부·문서·자격처럼 나를 채우는 일에서 잘 움직여요. 교육, 연구, 강사, 멘토처럼 <strong>배움을 나누는 일</strong>이 잘 어울려요.\n\n새로운 걸 알아가거나 정리해서 전달할 때 에너지가 잘 올라오는 편이라, 강의·집필·컨설팅처럼 <strong>‘알린 다음 나눠 주는’ 역할</strong>이 자연스럽게 잘 맞아요. 자격증이나 논문, 강의 준비처럼 단계를 밟아 가는 일도 잘 맞고, 꾸준히 공부하고 자격을 쌓는 걸 부담이라기보다 기회로 느끼는 편이고, 그만큼 <strong>전문성</strong>이 쌓이면 주변에서도 인정받기 쉬워요.\n\n다만 혼자만 아는 데 그치지 말고, 배운 걸 정리해서 말이나 글로 꺼내 보시면 재능이 더 잘 드러나요. 이렇게 <strong>배움과 나눔</strong>을 이어가는 일이 당신에게 <strong>잘 맞는 길</strong>이에요.",
      reality: "<strong>학습</strong>·<strong>교육</strong> 역량이 뚜렷하게 드러나는 편입니다. 교육·연구·강사·학술 쪽에 잘 맞습니다.",
      fun: "공부하고 가르치는 거 잘해. 선생·연구·강사 쪽 딱 맞아.",
    },
    fail: {
      empathy: "배우고 가르치는 힘이 잠재되어 있어요. 배우고 싶은 걸 하나 정해서 조금씩이라도 쌓아 가시면 그 재능이 서서히 드러나기 쉬워요. 교육이나 연구·강의 쪽에 도전해 보시면, 생각보다 잘 맞을 수 있어요.",
      reality: "학습·교육 역량이 아직 잘 드러나지 않는 편입니다. 꾸준히 배우고 나누는 기회를 늘리면 잘 맞는 일로 이어지기 쉽습니다.",
      fun: "배우고 가르치는 힘이 숨어 있어. 하나 정해서 쌓아 보면 재능 나와.",
    },
  },
};

/** 잠재된 천부와 직무 적성 문단. 월지·격국(투출) 기준, ~600자, 3톤, 특별한 사람 느낌. */
export function getLatentTalentAptitudeParagraph(
  pillars: SajuPillarsForAptitude,
  tone: AptitudeToneKey
): string {
  const info = getAptitudeInfo(pillars);
  if (!info) {
    if (tone === "empathy") return "생년월일시 정보가 더 있으면, 당신에게 맞는 재능과 직무를 더 구체적으로 풀어 드릴 수 있어요.";
    if (tone === "reality") return "정보가 부족하여 재능·직무 적성 해석을 생성할 수 없습니다.";
    return "정보가 더 있으면 네한테 맞는 재능이랑 일 풀어줄게.";
  }

  const block = APTITUDE_BODY[info.tenGod];
  if (!block) {
    if (tone === "empathy") return "당신이 태어난 달에 담긴 기운을 바탕으로, 그에 맞는 재능과 직무를 찾아 보시면 좋아요.";
    if (tone === "reality") return "태어난 달의 기운을 바탕으로 한 재능·직무 해석에 해당하는 문구가 없습니다.";
    return "니가 태어난 달 기운이랑 맞는 일 찾아 보면 돼.";
  }

  const body = info.touchu ? block.success[tone] : block.fail[tone];

  let intro: string;
  if (tone === "empathy") {
    intro = info.touchu
      ? "태어난 달에 담긴 <strong>기운</strong>이 그대로 잘 드러나는 편이에요. "
      : "태어난 달에 담긴 <strong>기운</strong>이 아직 표면에 잘 드러나지 않을 수 있어요. 그만큼 그쪽 능력을 의식해서 키우시면 중요한 순간에 더 큰 힘이 됩니다. ";
  } else if (tone === "reality") {
    intro = info.touchu
      ? "태어난 달의 <strong>기운</strong>이 잘 드러나는 구조입니다. "
      : "태어난 달의 <strong>기운</strong>이 아직 잘 드러나지 않는 구조입니다. 해당 영역을 의식해서 키우면 중요한 순간에 더 큰 역량으로 작용합니다. ";
  } else {
    intro = info.touchu
      ? "태어난 달에 담긴 <strong>기운</strong>이 잘 드러나는 타입이야. "
      : "태어난 달에 담긴 <strong>기운</strong>이 아직 잘 안 드러날 수 있어. 그쪽 능력을 키우면 중요한 순간에 더 큰 힘이 돼. ";
  }

  return intro + body;
}

// --- 스펙트럼 시각화용 (x: 혼자↔사람, y: 지식↔실행) ---

export interface AptitudeSpectrumData {
  position: { x: number; y: number };
  label: string;
  desc: string;
  tags: string[];
  axes: {
    left: string;
    right: string;
    top: string;
    bottom: string;
  };
  quadrants: Array<{ label: string; sub: string; x: number; y: number }>;
}

const AXES = {
  left: "혼자 하는 일",
  right: "사람과 하는 일",
  top: "지식형",
  bottom: "실행형",
};

const QUADRANTS = [
  { label: "연구자형", sub: "분석·집필·논문", x: 20, y: 20 },
  { label: "강사·멘토형", sub: "강의·교육·컨설팅", x: 75, y: 20 },
  { label: "전문 기술형", sub: "개발·제작·설계", x: 20, y: 75 },
  { label: "현장 리더형", sub: "운영·관리·영업", x: 75, y: 75 },
];

/** 십신별 스펙트럼 위치(x,y 0~100) + 라벨·한줄설명·직무태그. touchu=false일 때 약간 중앙 쏠림(잠재). */
const SPECTRUM_BY_TEN_GOD: Record<
  string,
  { x: number; y: number; xFail?: number; yFail?: number; label: string; desc: string; tags: string[] }
> = {
  비견: {
    x: 22, y: 58,
    xFail: 32, yFail: 55,
    label: "독립·자기주도형",
    desc: "스스로 결단하고 자기 페이스로 끌어가는 일이 잘 맞아요",
    tags: ["독립", "자영", "프리랜서", "자기주도"],
  },
  겁재: {
    x: 78, y: 72,
    xFail: 68, yFail: 68,
    label: "경쟁·도전형",
    desc: "승부와 도전이 있는 일에서 잘 움직여요",
    tags: ["영업", "스포츠", "승부", "도전"],
  },
  식신: {
    x: 35, y: 45,
    xFail: 42, yFail: 48,
    label: "표현·창작형",
    desc: "말하고 표현하며 결과를 만드는 일이 잘 맞아요",
    tags: ["예술", "콘텐츠", "디자인", "교육", "창작"],
  },
  상관: {
    x: 42, y: 28,
    xFail: 48, yFail: 35,
    label: "혁신·기획형",
    desc: "틀을 넘어 새로 만드는 일이 잘 맞아요",
    tags: ["스타트업", "연구", "기획", "컨설팅"],
  },
  편재: {
    x: 88, y: 78,
    xFail: 78, yFail: 75,
    label: "기회·실전형",
    desc: "움직이며 기회를 잡는 일이 잘 맞아요",
    tags: ["영업", "사업", "유통", "네트워킹"],
  },
  정재: {
    x: 38, y: 68,
    xFail: 45, yFail: 65,
    label: "정리·관리형",
    desc: "꾸준히 쌓고 정리하는 일이 잘 맞아요",
    tags: ["회계", "재무", "자산관리", "관리"],
  },
  편관: {
    x: 82, y: 70,
    xFail: 72, yFail: 68,
    label: "리더·관리형",
    desc: "사람을 이끄고 결정하는 일이 잘 맞아요",
    tags: ["경영", "관리", "임원", "리더십"],
  },
  정관: {
    x: 72, y: 58,
    xFail: 62, yFail: 60,
    label: "조직·책임형",
    desc: "원칙과 책임을 지키는 일이 잘 맞아요",
    tags: ["공무원", "대기업", "공공", "조직"],
  },
  편인: {
    x: 22, y: 22,
    xFail: 30, yFail: 28,
    label: "연구·통찰형",
    desc: "깊이 생각하고 남다른 시각을 쓰는 일이 잘 맞아요",
    tags: ["철학", "심리", "연구", "집필"],
  },
  정인: {
    x: 68, y: 25,
    xFail: 58, yFail: 32,
    label: "지식 나눔형",
    desc: "배우고 정리해서 전달하는 일이 자연스럽게 잘 맞아요",
    tags: ["교육", "연구", "강사", "멘토", "집필", "컨설팅", "강의"],
  },
};

export function getAptitudeSpectrumData(pillars: SajuPillarsForAptitude): AptitudeSpectrumData | null {
  const info = getAptitudeInfo(pillars);
  if (!info) return null;

  const row = SPECTRUM_BY_TEN_GOD[info.tenGod];
  if (!row) return null;

  const x = info.touchu ? row.x : (row.xFail ?? row.x);
  const y = info.touchu ? row.y : (row.yFail ?? row.y);

  return {
    position: { x, y },
    label: row.label,
    desc: row.desc,
    tags: row.tags,
    axes: AXES,
    quadrants: QUADRANTS,
  };
}
