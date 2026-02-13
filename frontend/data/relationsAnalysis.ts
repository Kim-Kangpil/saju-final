// frontend/data/relationsAnalysis.ts

export const RELATIONS_ANALYSIS = {
  empathy: {
    title: "관계의 시너지를 내는 찰떡궁합의 기운",
    icon: "💕",
  },
  reality: {
    title: "인적 네트워크의 역학 관계 및 시너지 밸런스 측정",
    icon: "🔗",
  },
  fun: {
    title: "꼬였던 인간관계? 다 대박 운 들어오려고 미리 액땜한 거야",
    icon: "🤝",
  },
};

// ============================================
// 1. 천간합 (天干合) - 5가지
// ============================================
const 천간합표 = [
  ["甲", "己"], // 갑기합토
  ["乙", "庚"], // 을경합금
  ["丙", "辛"], // 병신합수
  ["丁", "壬"], // 정임합목
  ["戊", "癸"], // 무계합화
];

// ============================================
// 2. 천간충 (天干沖) - 7가지
// ============================================
const 천간충표 = [
  ["甲", "庚"], // 갑경충
  ["乙", "辛"], // 을신충
  ["丙", "壬"], // 병임충
  ["丁", "癸"], // 정계충
  ["戊", "甲"], // 무갑충
  ["己", "乙"], // 기을충
  ["庚", "丙"], // 경병충
];

// ============================================
// 3. 지지 육합 (地支六合)
// ============================================
const 지지육합표 = [
  ["子", "丑"], // 자축합토
  ["寅", "亥"], // 인해합목
  ["卯", "戌"], // 묘술합화
  ["辰", "酉"], // 진유합금
  ["巳", "申"], // 사신합수
  ["午", "未"], // 오미합화/토
];

// ============================================
// 4. 지지 삼합 (地支三合) - 4가지 국
// ============================================
const 지지삼합표 = [
  ["寅", "午", "戌"], // 인오술 화국
  ["申", "子", "辰"], // 신자진 수국
  ["巳", "酉", "丑"], // 사유축 금국
  ["亥", "卯", "未"], // 해묘미 목국
];

// ============================================
// 5. 지지 방합 (地支方合) - 4가지 방위
// ============================================
const 지지방합표 = [
  ["寅", "卯", "辰"], // 인묘진 동방목
  ["巳", "午", "未"], // 사오미 남방화
  ["申", "酉", "戌"], // 신유술 서방금
  ["亥", "子", "丑"], // 해자축 북방수
];

// ============================================
// 6. 지지 반합 (地支半合) - 삼합의 2글자
// ============================================
const 지지반합표 = [
  ["寅", "午"], // 인오 반합
  ["午", "戌"], // 오술 반합
  ["寅", "戌"], // 인술 반합
  ["申", "子"], // 신자 반합
  ["子", "辰"], // 자진 반합
  ["申", "辰"], // 신진 반합
  ["巳", "酉"], // 사유 반합
  ["酉", "丑"], // 유축 반합
  ["巳", "丑"], // 사축 반합
  ["亥", "卯"], // 해묘 반합
  ["卯", "未"], // 묘미 반합
  ["亥", "未"], // 해미 반합
];

// ============================================
// 7. 지지 충 (地支沖)
// ============================================
const 지지충표 = [
  ["子", "午"], // 자오충
  ["丑", "未"], // 축미충
  ["寅", "申"], // 인신충
  ["卯", "酉"], // 묘유충
  ["辰", "戌"], // 진술충
  ["巳", "亥"], // 사해충
];

// ============================================
// 8. 지지 형 (地支刑)
// ============================================
const 지지형표 = [
  ["寅", "巳", "申"], // 인사신 삼형 (무은지형)
  ["丑", "戌", "未"], // 축술미 삼형 (지세지형)
  ["子", "卯"], // 자묘형 (무례지형)
  ["辰", "辰"], // 진진자형
  ["午", "午"], // 오오자형
  ["酉", "酉"], // 유유자형
  ["亥", "亥"], // 해해자형
];

// ============================================
// 9. 지지 해 (地支害)
// ============================================
const 지지해표 = [
  ["子", "未"], // 자미해
  ["丑", "午"], // 축오해
  ["寅", "巳"], // 인사해
  ["卯", "辰"], // 묘진해
  ["申", "亥"], // 신해해
  ["酉", "戌"], // 유술해
];

// ============================================
// 10. 지지 파 (地支破) - 추가
// ============================================
const 지지파표 = [
  ["子", "酉"], // 자유파
  ["丑", "辰"], // 축진파
  ["寅", "亥"], // 인해파
  ["卯", "午"], // 묘오파
  ["巳", "申"], // 사신파
  ["未", "戌"], // 미술파
];

// ============================================
// 11. 원진 (怨嗔) - 추가
// ============================================
const 원진표 = [
  ["子", "未"],
  ["丑", "午"],
  ["寅", "巳"],
  ["卯", "辰"],
  ["申", "亥"],
  ["酉", "戌"],
];

// ============================================
// 합충형해파 판정 함수 (완전판)
// ============================================
export function analyzeRelations(
  stems: string[],  // [년간, 월간, 일간, 시간]
  branches: string[] // [년지, 월지, 일지, 시지]
): {
  // 천간
  천간합: string[];
  천간충: string[];
  
  // 지지 합
  육합: string[];
  삼합: string[];
  방합: string[];
  반합: string[];
  
  // 지지 흉
  충: string[];
  형: string[];
  해: string[];
  파: string[];
  원진: string[];
  
  // 요약
  총합개수: number;
  총흉개수: number;
  
  // 설명
  empathy: string;
  reality: string;
  fun: string;
} {
  const 천간합: string[] = [];
  const 천간충: string[] = [];
  const 육합: string[] = [];
  const 삼합: string[] = [];
  const 방합: string[] = [];
  const 반합: string[] = [];
  const 충: string[] = [];
  const 형: string[] = [];
  const 해: string[] = [];
  const 파: string[] = [];
  const 원진: string[] = [];

  // ========================================
  // 1. 천간합 체크
  // ========================================
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      천간합표.forEach(([a, b]) => {
        if (
          (stems[i] === a && stems[j] === b) ||
          (stems[i] === b && stems[j] === a)
        ) {
          천간합.push(`${stems[i]}${stems[j]}합`);
        }
      });
    }
  }

  // ========================================
  // 2. 천간충 체크
  // ========================================
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      천간충표.forEach(([a, b]) => {
        if (
          (stems[i] === a && stems[j] === b) ||
          (stems[i] === b && stems[j] === a)
        ) {
          천간충.push(`${stems[i]}${stems[j]}충`);
        }
      });
    }
  }

  // ========================================
  // 3. 지지 육합 체크
  // ========================================
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      지지육합표.forEach(([a, b]) => {
        if (
          (branches[i] === a && branches[j] === b) ||
          (branches[i] === b && branches[j] === a)
        ) {
          육합.push(`${branches[i]}${branches[j]}합`);
        }
      });
    }
  }

  // ========================================
  // 4. 지지 삼합 체크 (3개 모두 있어야 함)
  // ========================================
  지지삼합표.forEach(group => {
    const count = group.filter(g => branches.includes(g)).length;
    if (count === 3) {
      삼합.push(`${group.join("")}삼합`);
    }
  });

  // ========================================
  // 5. 지지 방합 체크 (3개 모두 있어야 함)
  // ========================================
  지지방합표.forEach(group => {
    const count = group.filter(g => branches.includes(g)).length;
    if (count === 3) {
      방합.push(`${group.join("")}방합`);
    }
  });

  // ========================================
  // 6. 지지 반합 체크 (2개만 있어도 성립)
  // ========================================
  지지반합표.forEach(([a, b]) => {
    if (branches.includes(a) && branches.includes(b)) {
      // 중복 방지 (이미 삼합에 포함되었으면 제외)
      const is삼합 = 삼합.some(s => s.includes(a) && s.includes(b));
      if (!is삼합) {
        반합.push(`${a}${b}반합`);
      }
    }
  });

  // ========================================
  // 7. 지지 충 체크
  // ========================================
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      지지충표.forEach(([a, b]) => {
        if (
          (branches[i] === a && branches[j] === b) ||
          (branches[i] === b && branches[j] === a)
        ) {
          충.push(`${branches[i]}${branches[j]}충`);
        }
      });
    }
  }

  // ========================================
  // 8. 지지 형 체크
  // ========================================
  지지형표.forEach(group => {
    if (group.length === 3) {
      // 삼형 (2개 이상 있으면 형 성립)
      const matched = group.filter(g => branches.includes(g));
      if (matched.length >= 2) {
        형.push(`${matched.join("")}형`);
      }
    } else if (group.length === 2) {
      // 자형 (같은 글자 2개)
      const [a, b] = group;
      if (a === b) {
        const count = branches.filter(br => br === a).length;
        if (count >= 2) {
          형.push(`${a}${a}자형`);
        }
      } else {
        // 자묘형
        if (branches.includes(a) && branches.includes(b)) {
          형.push(`${a}${b}형`);
        }
      }
    }
  });

  // ========================================
  // 9. 지지 해 체크
  // ========================================
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      지지해표.forEach(([a, b]) => {
        if (
          (branches[i] === a && branches[j] === b) ||
          (branches[i] === b && branches[j] === a)
        ) {
          해.push(`${branches[i]}${branches[j]}해`);
        }
      });
    }
  }

  // ========================================
  // 10. 지지 파 체크
  // ========================================
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      지지파표.forEach(([a, b]) => {
        if (
          (branches[i] === a && branches[j] === b) ||
          (branches[i] === b && branches[j] === a)
        ) {
          파.push(`${branches[i]}${branches[j]}파`);
        }
      });
    }
  }

  // ========================================
  // 11. 원진 체크
  // ========================================
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      원진표.forEach(([a, b]) => {
        if (
          (branches[i] === a && branches[j] === b) ||
          (branches[i] === b && branches[j] === a)
        ) {
          원진.push(`${branches[i]}${branches[j]}원진`);
        }
      });
    }
  }

  // ========================================
  // 중복 제거
  // ========================================
  const unique천간합 = [...new Set(천간합)];
  const unique천간충 = [...new Set(천간충)];
  const unique육합 = [...new Set(육합)];
  const unique삼합 = [...new Set(삼합)];
  const unique방합 = [...new Set(방합)];
  const unique반합 = [...new Set(반합)];
  const unique충 = [...new Set(충)];
  const unique형 = [...new Set(형)];
  const unique해 = [...new Set(해)];
  const unique파 = [...new Set(파)];
  const unique원진 = [...new Set(원진)];

  // ========================================
  // 총 개수 계산
  // ========================================
  const 총합개수 =
    unique천간합.length +
    unique육합.length +
    unique삼합.length +
    unique방합.length +
    unique반합.length;

  const 총흉개수 =
    unique천간충.length +
    unique충.length +
    unique형.length +
    unique해.length +
    unique파.length +
    unique원진.length;

  // ========================================
  // 설명 생성
  // ========================================
  const has길 = 총합개수 > 0;
  const has흉 = 총흉개수 > 0;
  const has충 = unique충.length > 0 || unique천간충.length > 0;

  let empathyText = "";
  let realityText = "";
  let funText = "";

  // 감성형 설명
  if (has길 && !has흉) {
    empathyText = `조화로운 기운이 가득해요! `;
    if (unique천간합.length > 0) empathyText += `천간합(${unique천간합.join(", ")})으로 정신적 유대가 강하고, `;
    if (unique삼합.length > 0) empathyText += `삼합(${unique삼합.join(", ")})으로 큰 힘이 모이며, `;
    if (unique육합.length > 0) empathyText += `육합(${unique육합.join(", ")})으로 좋은 인연이 많아요. `;
    empathyText += `사람들과 잘 어울리고 협력이 잘 됩니다. 인연을 소중히 하면 더 큰 행운이 찾아올 거예요.`;
  } else if (has길 && has흉) {
    empathyText = `조화와 변화가 함께 있어요. `;
    if (unique천간합.length > 0 || unique육합.length > 0 || unique삼합.length > 0) {
      empathyText += `좋은 인연(합: ${총합개수}개)이 있지만, `;
    }
    if (has충) {
      empathyText += `충(${[...unique천간충, ...unique충].join(", ")})은 변화와 활성화의 신호예요. 정체되어 있던 상황이 움직이기 시작합니다. `;
    }
    if (unique형.length > 0 || unique해.length > 0) {
      empathyText += `복잡한 관계(${[...unique형, ...unique해].join(", ")})도 있지만, 이는 성장의 기회가 됩니다. `;
    }
    empathyText += `변화를 두려워하지 말고, 관계를 잘 조율하면 더 큰 성장을 이룰 수 있어요.`;
  } else if (!has길 && has흉) {
    empathyText = `변화와 도전의 기운이 있어요. `;
    if (has충) {
      empathyText += `충(${[...unique천간충, ...unique충].join(", ")})은 나쁜 것이 아니라 정체된 에너지를 활성화시키는 힘이에요. 새로운 기회가 찾아옵니다. `;
    }
    if (unique형.length > 0) empathyText += `형(${unique형.join(", ")})은 시련을 통한 성장을 의미해요. `;
    empathyText += `어려움이 있더라도 그것이 당신을 더 강하게 만들 거예요. 이해와 배려로 풀어가세요.`;
  } else {
    empathyText = `안정적인 관계 흐름을 가지고 있어요. 큰 충돌이나 극적인 변화 없이 평온하게 사람들과 지낼 수 있어요. 이런 안정감이 당신의 장점입니다.`;
  }

  // 분석형 설명
  if (has길 && !has흉) {
    realityText = `시너지 활성화 지수: ${총합개수}건. `;
    if (unique천간합.length > 0) realityText += `천간합(${unique천간합.length}건) - 정신적 협력 우수. `;
    if (unique삼합.length > 0) realityText += `삼합(${unique삼합.length}건) - 강력한 에너지 집중. `;
    if (unique육합.length > 0) realityText += `육합(${unique육합.length}건) - 1:1 조화 최적. `;
    realityText += `협력 시 성과 증폭 예상. 팀워크 효율 상위 20%. 네트워킹 능력 우수.`;
  } else if (has길 && has흉) {
    realityText = `복합 역학 구조. 길신 ${총합개수}건, 흉신 ${총흉개수}건 동시 활성화. `;
    if (has충) {
      realityText += `충(${unique천간충.length + unique충.length}건) - 변동성 증가, 활성화 효과. 정체 탈피 및 돌파 가능성. `;
    }
    if (unique형.length > 0) realityText += `형(${unique형.length}건) - 갈등 변수 존재, 위기관리 필요. `;
    realityText += `균형 조율 시 시너지 극대화 가능. 유연한 대응 전략 권장.`;
  } else if (!has길 && has흉) {
    realityText = `활성화 변수 ${총흉개수}건 검출. `;
    if (has충) {
      realityText += `충(${unique천간충.length + unique충.length}건) - 변동성 높음. 변화 적응력 테스트. 기회 창출 가능성 동시 존재. `;
    }
    if (unique형.length > 0) realityText += `형(${unique형.length}건) - 복잡도 증가. 커뮤니케이션 스킬 중요. `;
    realityText += `위기관리 모드 권장. 변화를 기회로 전환하는 전략 필요.`;
  } else {
    realityText = `중립형 네트워크 구조. 극단적 변동성 없음. 안정적 관계 유지. 예측 가능한 인간관계 패턴. 리스크 최소화 구조.`;
  }

  // 찐친형 설명
  if (has길 && !has흉) {
    funText = `야 너 인복 대박이야! `;
    if (unique천간합.length > 0) funText += `천간합(${unique천간합.join(", ")})으로 마음 잘 통하고, `;
    if (unique삼합.length > 0) funText += `삼합(${unique삼합.join(", ")})으로 팀워크 끝내주고, `;
    if (unique육합.length > 0) funText += `육합(${unique육합.join(", ")})으로 찰떡궁합 많아! `;
    funText += `주변에서 다들 널 도와주려고 하더라! 이 운 잘 타!`;
  } else if (has길 && has흉) {
    funText = `너 사주 완전 드라마틱하다! `;
    if (has충) {
      funText += `충(${[...unique천간충, ...unique충].join(", ")})있는데 이거 나쁜 거 아니야! 정체된 거 다 깨부수고 새로운 거 시작하라는 신호야! `;
    }
    funText += `좋은 인연(${총합개수}개)도 있고 변화(${총흉개수}개)도 있어서 인생 롤러코스터! 근데 이게 재밌는 인생이야! 평범한 거보단 나아!`;
  } else if (!has길 && has흉) {
    funText = `오 변화의 아이콘? `;
    if (has충) {
      funText += `충(${[...unique천간충, ...unique충].join(", ")}) 있잖아? 이거 대박 터지려고 그러는 거야! 막혀있던 게 다 뚫린다! `;
    }
    if (unique형.length > 0) funText += `형(${unique형.join(", ")})도 있는데 이건 시련 좀 있다는 거야. 근데 이거 넘으면 레벨업! `;
    funText += `지금 힘들어도 참아! 대박 온다!`;
  } else {
    funText = `평온한 타입! 극적인 일 없이 조용히 잘 살아! 인간관계 무난하게 유지하는 게 네 장점이야!`;
  }

  // ========================================
  // 반환
  // ========================================
  return {
    천간합: unique천간합,
    천간충: unique천간충,
    육합: unique육합,
    삼합: unique삼합,
    방합: unique방합,
    반합: unique반합,
    충: unique충,
    형: unique형,
    해: unique해,
    파: unique파,
    원진: unique원진,
    총합개수,
    총흉개수,
    empathy: empathyText,
    reality: realityText,
    fun: funText,
  };
}
