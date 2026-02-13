// frontend/data/fortuneAnalysis.ts

export const FORTUNE_ANALYSIS = {
  empathy: {
    title: "당신의 인생 타임라인, 10년마다 펼쳐지는 새로운 장(章)",
    icon: "📅",
  },
  reality: {
    title: "대운·세운 정밀 분석 - 당신의 운명 흐름 시뮬레이션",
    icon: "📊",
  },
  fun: {
    title: "너 지금 무슨 운 타고 있는데? 대운세운 실시간 확인",
    icon: "🎢",
  },
};

// =====================================================
// 기초 데이터
// =====================================================

const GANJI_60 = [
  "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉",
  "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未",
  "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳",
  "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯",
  "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
  "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥"
];

const GANS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const JIS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// =====================================================
// 오행 및 십성 계산
// =====================================================

function getElement(hanja: string): string {
  const wood = ['甲', '乙', '寅', '卯'];
  const fire = ['丙', '丁', '巳', '午'];
  const earth = ['戊', '己', '辰', '戌', '丑', '未'];
  const metal = ['庚', '辛', '申', '酉'];
  const water = ['壬', '癸', '子', '亥'];

  if (wood.includes(hanja)) return 'wood';
  if (fire.includes(hanja)) return 'fire';
  if (earth.includes(hanja)) return 'earth';
  if (metal.includes(hanja)) return 'metal';
  if (water.includes(hanja)) return 'water';
  return 'none';
}

function getPolarity(gan: string): 'yang' | 'yin' {
  const yang = ['甲', '丙', '戊', '庚', '壬'];
  return yang.includes(gan) ? 'yang' : 'yin';
}

function getTenGod(dayStem: string, targetStem: string): string {
  const dayEl = getElement(dayStem);
  const targetEl = getElement(targetStem);

  if (dayEl === 'none' || targetEl === 'none') return '';

  const produces: Record<string, string> = {
    wood: 'fire',
    fire: 'earth',
    earth: 'metal',
    metal: 'water',
    water: 'wood',
  };

  const controls: Record<string, string> = {
    wood: 'earth',
    fire: 'metal',
    earth: 'water',
    metal: 'wood',
    water: 'fire',
  };

  const samePol = getPolarity(dayStem) === getPolarity(targetStem);

  if (dayEl === targetEl) {
    return samePol ? '비견' : '겁재';
  } else if (produces[dayEl] === targetEl) {
    return samePol ? '식신' : '상관';
  } else if (produces[targetEl] === dayEl) {
    return samePol ? '편인' : '정인';
  } else if (controls[dayEl] === targetEl) {
    return samePol ? '편재' : '정재';
  } else if (controls[targetEl] === dayEl) {
    return samePol ? '편관' : '정관';
  }

  return '';
}

// =====================================================
// 천간 합충 판정
// =====================================================

const CHEONGAN_HAP: Record<string, string> = {
  '甲己': '토',
  '乙庚': '금',
  '丙辛': '수',
  '丁壬': '목',
  '戊癸': '화',
};

function checkCheonganHap(stem1: string, stem2: string): string | null {
  const key1 = stem1 + stem2;
  const key2 = stem2 + stem1;
  return CHEONGAN_HAP[key1] || CHEONGAN_HAP[key2] || null;
}

const CHEONGAN_CHUNG: string[][] = [
  ['甲', '庚'],
  ['乙', '辛'],
  ['丙', '壬'],
  ['丁', '癸'],
  ['戊', '甲'],
  ['己', '乙'],
  ['庚', '甲'],
  ['辛', '乙'],
];

function checkCheonganChung(stem1: string, stem2: string): boolean {
  return CHEONGAN_CHUNG.some(pair =>
    (pair[0] === stem1 && pair[1] === stem2) || (pair[0] === stem2 && pair[1] === stem1)
  );
}

// =====================================================
// 지지 합형충해파 판정
// =====================================================

const JIJI_YUKHAP: string[][] = [
  ['子', '丑'], ['寅', '亥'], ['卯', '戌'],
  ['辰', '酉'], ['巳', '申'], ['午', '未']
];

function checkJijiYukhap(ji1: string, ji2: string): boolean {
  return JIJI_YUKHAP.some(pair =>
    (pair[0] === ji1 && pair[1] === ji2) || (pair[0] === ji2 && pair[1] === ji1)
  );
}

const JIJI_SAMHAP: { name: string; members: string[] }[] = [
  { name: '신자진 수국', members: ['申', '子', '辰'] },
  { name: '인오술 화국', members: ['寅', '午', '戌'] },
  { name: '해묘미 목국', members: ['亥', '卯', '未'] },
  { name: '사유축 금국', members: ['巳', '酉', '丑'] },
];

function checkJijiSamhap(branches: string[]): string[] {
  const results: string[] = [];
  JIJI_SAMHAP.forEach(samhap => {
    const count = samhap.members.filter(m => branches.includes(m)).length;
    if (count >= 2) {
      results.push(samhap.name);
    }
  });
  return results;
}

const JIJI_BANGHAP: { name: string; members: string[] }[] = [
  { name: '인묘진 동방목', members: ['寅', '卯', '辰'] },
  { name: '사오미 남방화', members: ['巳', '午', '未'] },
  { name: '신유술 서방금', members: ['申', '酉', '戌'] },
  { name: '해자축 북방수', members: ['亥', '子', '丑'] },
];

function checkJijiBanghap(branches: string[]): string[] {
  const results: string[] = [];
  JIJI_BANGHAP.forEach(banghap => {
    const count = banghap.members.filter(m => branches.includes(m)).length;
    if (count >= 2) {
      results.push(banghap.name);
    }
  });
  return results;
}

const JIJI_BANHAP: string[][] = [
  ['申', '子'], ['子', '辰'], ['申', '辰'],
  ['寅', '午'], ['午', '戌'], ['寅', '戌'],
  ['亥', '卯'], ['卯', '未'], ['亥', '未'],
  ['巳', '酉'], ['酉', '丑'], ['巳', '丑'],
];

function checkJijiBanhap(ji1: string, ji2: string): boolean {
  return JIJI_BANHAP.some(pair =>
    (pair[0] === ji1 && pair[1] === ji2) || (pair[0] === ji2 && pair[1] === ji1)
  );
}

const JIJI_CHUNG: string[][] = [
  ['子', '午'], ['丑', '未'], ['寅', '申'],
  ['卯', '酉'], ['辰', '戌'], ['巳', '亥']
];

function checkJijiChung(ji1: string, ji2: string): boolean {
  return JIJI_CHUNG.some(pair =>
    (pair[0] === ji1 && pair[1] === ji2) || (pair[0] === ji2 && pair[1] === ji1)
  );
}

const JIJI_HYUNG: { name: string; members: string[] }[] = [
  { name: '인사형', members: ['寅', '巳'] },
  { name: '사신형', members: ['巳', '申'] },
  { name: '신인형', members: ['申', '寅'] },
  { name: '축술형', members: ['丑', '戌'] },
  { name: '축미형', members: ['丑', '未'] },
  { name: '술미형', members: ['戌', '未'] },
  { name: '자묘형', members: ['子', '卯'] },
  { name: '진진자형', members: ['辰', '辰'] },
  { name: '오오자형', members: ['午', '午'] },
  { name: '유유자형', members: ['酉', '酉'] },
  { name: '해해자형', members: ['亥', '亥'] },
];

function checkJijiHyung(ji1: string, ji2: string): string[] {
  const results: string[] = [];
  JIJI_HYUNG.forEach(hyung => {
    if (hyung.members.includes(ji1) && hyung.members.includes(ji2)) {
      results.push(hyung.name);
    }
  });
  return results;
}

const JIJI_HAE: string[][] = [
  ['子', '未'], ['丑', '午'], ['寅', '巳'],
  ['卯', '辰'], ['申', '亥'], ['酉', '戌']
];

function checkJijiHae(ji1: string, ji2: string): boolean {
  return JIJI_HAE.some(pair =>
    (pair[0] === ji1 && pair[1] === ji2) || (pair[0] === ji2 && pair[1] === ji1)
  );
}

const JIJI_PA: string[][] = [
  ['酉', '子'], ['午', '卯'], ['亥', '寅'], ['申', '巳']
];

function checkJijiPa(ji1: string, ji2: string): boolean {
  return JIJI_PA.some(pair =>
    (pair[0] === ji1 && pair[1] === ji2) || (pair[0] === ji2 && pair[1] === ji1)
  );
}

function checkWonjin(ji1: string, ji2: string): boolean {
  const idx1 = JIS.indexOf(ji1);
  const idx2 = JIS.indexOf(ji2);
  if (idx1 === -1 || idx2 === -1) return false;
  const diff = Math.abs(idx1 - idx2);
  return diff === 7 || diff === 5;
}

const CHEONUL_GWIIN: Record<string, string[]> = {
  '甲': ['丑', '未'],
  '乙': ['子', '申'],
  '丙': ['亥', '酉'],
  '丁': ['亥', '酉'],
  '戊': ['丑', '未'],
  '己': ['子', '申'],
  '庚': ['丑', '未'],
  '辛': ['寅', '午'],
  '壬': ['卯', '巳'],
  '癸': ['卯', '巳'],
};

function checkCheonulGwiin(dayStem: string, branch: string): boolean {
  const gwiin = CHEONUL_GWIIN[dayStem] || [];
  return gwiin.includes(branch);
}

// =====================================================
// 합형충해파 종합 판정
// =====================================================

interface RelationResult {
  cheonganHap: string[];
  cheonganChung: string[];
  jijiYukhap: string[];
  jijiSamhap: string[];
  jijiBanghap: string[];
  jijiBanhap: string[];
  jijiChung: string[];
  jijiHyung: string[];
  jijiHae: string[];
  jijiPa: string[];
  wonjin: string[];
  cheonulGwiin: string[];
}

function analyzeRelations(
  fortuneStem: string,
  fortuneBranch: string,
  dayStem: string,
  originalPillars: { year: string; month: string; day: string; hour: string }
): RelationResult {
  const result: RelationResult = {
    cheonganHap: [],
    cheonganChung: [],
    jijiYukhap: [],
    jijiSamhap: [],
    jijiBanghap: [],
    jijiBanhap: [],
    jijiChung: [],
    jijiHyung: [],
    jijiHae: [],
    jijiPa: [],
    wonjin: [],
    cheonulGwiin: [],
  };

  const originalStems = [
    originalPillars.year[0],
    originalPillars.month[0],
    originalPillars.day[0],
    originalPillars.hour[0],
  ];

  const originalBranches = [
    originalPillars.year[1],
    originalPillars.month[1],
    originalPillars.day[1],
    originalPillars.hour[1],
  ];

  // 천간합
  originalStems.forEach(stem => {
    const hap = checkCheonganHap(fortuneStem, stem);
    if (hap) result.cheonganHap.push(`${fortuneStem}${stem}합(${hap})`);
  });

  // 천간충
  originalStems.forEach(stem => {
    if (checkCheonganChung(fortuneStem, stem)) {
      result.cheonganChung.push(`${fortuneStem}${stem}충`);
    }
  });

  // 지지 육합
  originalBranches.forEach(branch => {
    if (checkJijiYukhap(fortuneBranch, branch)) {
      result.jijiYukhap.push(`${fortuneBranch}${branch}육합`);
    }
  });

  // 지지 삼합
  const allBranches = [...originalBranches, fortuneBranch];
  result.jijiSamhap = checkJijiSamhap(allBranches);

  // 지지 방합
  result.jijiBanghap = checkJijiBanghap(allBranches);

  // 지지 반합
  originalBranches.forEach(branch => {
    if (checkJijiBanhap(fortuneBranch, branch)) {
      result.jijiBanhap.push(`${fortuneBranch}${branch}반합`);
    }
  });

  // 지지충
  originalBranches.forEach(branch => {
    if (checkJijiChung(fortuneBranch, branch)) {
      result.jijiChung.push(`${fortuneBranch}${branch}충`);
    }
  });

  // 지지형
  originalBranches.forEach(branch => {
    const hyung = checkJijiHyung(fortuneBranch, branch);
    if (hyung.length > 0) {
      result.jijiHyung.push(...hyung);
    }
  });

  // 지지해
  originalBranches.forEach(branch => {
    if (checkJijiHae(fortuneBranch, branch)) {
      result.jijiHae.push(`${fortuneBranch}${branch}해`);
    }
  });

  // 지지파
  originalBranches.forEach(branch => {
    if (checkJijiPa(fortuneBranch, branch)) {
      result.jijiPa.push(`${fortuneBranch}${branch}파`);
    }
  });

  // 원진
  originalBranches.forEach(branch => {
    if (checkWonjin(fortuneBranch, branch)) {
      result.wonjin.push(`${fortuneBranch}${branch}원진`);
    }
  });

  // 천을귀인
  if (checkCheonulGwiin(dayStem, fortuneBranch)) {
    result.cheonulGwiin.push(`${fortuneBranch}천을귀인`);
  }

  return result;
}

// =====================================================
// 대운/세운 데이터 타입
// =====================================================

export interface GreatFortuneData {
  startAge: number;
  endAge: number;
  pillar: string;
  stem: string;
  branch: string;
  stemTenGod: string;
  branchTenGod: string;
  direction: "순행" | "역행";
  relations: RelationResult;
  interpretation: {
    empathy: string;
    reality: string;
    fun: string;
  };
}

export interface YearFortuneData {
  year: number;
  pillar: string;
  stem: string;
  branch: string;
  stemTenGod: string;
  branchTenGod: string;
  relations: RelationResult;
  interpretation: {
    empathy: string;
    reality: string;
    fun: string;
  };
}

// =====================================================
// 대운 계산
// =====================================================

export function calculateGreatFortune(
  birthYear: number,
  gender: "M" | "F",
  monthPillar: string,
  daeunNum: number,
  currentAge: number,
  dayStem: string,
  originalPillars: { year: string; month: string; day: string; hour: string },
  sinGangScore: number
): {
  current: GreatFortuneData;
  next: GreatFortuneData;
  direction: "순행" | "역행";
} {
  const yearStemIndex = (36 + (birthYear - 1900)) % 10;
  const isYangYear = yearStemIndex % 2 === 0;
  const isForward = (gender === "M" && isYangYear) || (gender === "F" && !isYangYear);
  const direction = isForward ? "순행" : "역행";

  const monthPillarIndex = GANJI_60.indexOf(monthPillar);
  const fortuneIndex = Math.floor((currentAge - daeunNum) / 10);
  const currentStartAge = daeunNum + fortuneIndex * 10;
  const nextStartAge = currentStartAge + 10;

  const currentIndex = isForward
    ? (monthPillarIndex + fortuneIndex + 1) % 60
    : (monthPillarIndex - fortuneIndex - 1 + 60) % 60;
  const nextIndex = isForward
    ? (currentIndex + 1) % 60
    : (currentIndex - 1 + 60) % 60;

  const currentPillar = GANJI_60[currentIndex];
  const nextPillar = GANJI_60[nextIndex];

  const currentRelations = analyzeRelations(
    currentPillar[0],
    currentPillar[1],
    dayStem,
    originalPillars
  );

  const current: GreatFortuneData = {
    startAge: currentStartAge,
    endAge: nextStartAge - 1,
    pillar: currentPillar,
    stem: currentPillar[0],
    branch: currentPillar[1],
    stemTenGod: getTenGod(dayStem, currentPillar[0]),
    branchTenGod: getTenGod(dayStem, currentPillar[1]),
    direction,
    relations: currentRelations,
    interpretation: interpretGreatFortune(
      currentPillar,
      dayStem,
      originalPillars,
      currentStartAge,
      nextStartAge - 1,
      sinGangScore,
      currentRelations
    ),
  };

  const nextRelations = analyzeRelations(
    nextPillar[0],
    nextPillar[1],
    dayStem,
    originalPillars
  );

  const next: GreatFortuneData = {
    startAge: nextStartAge,
    endAge: nextStartAge + 9,
    pillar: nextPillar,
    stem: nextPillar[0],
    branch: nextPillar[1],
    stemTenGod: getTenGod(dayStem, nextPillar[0]),
    branchTenGod: getTenGod(dayStem, nextPillar[1]),
    direction,
    relations: nextRelations,
    interpretation: interpretGreatFortune(
      nextPillar,
      dayStem,
      originalPillars,
      nextStartAge,
      nextStartAge + 9,
      sinGangScore,
      nextRelations
    ),
  };

  return { current, next, direction };
}

// =====================================================
// 세운 계산
// =====================================================

export function calculateYearFortune(
  currentYear: number,
  dayStem: string,
  originalPillars: { year: string; month: string; day: string; hour: string },
  sinGangScore: number
): {
  current: YearFortuneData;
  next: YearFortuneData;
} {
  const baseYear = 2024;
  const baseYearIndex = 40;

  const yearDiff = currentYear - baseYear;
  const currentIndex = (baseYearIndex + yearDiff + 60) % 60;
  const nextIndex = (currentIndex + 1) % 60;

  const currentPillar = GANJI_60[currentIndex];
  const nextPillar = GANJI_60[nextIndex];

  const currentRelations = analyzeRelations(
    currentPillar[0],
    currentPillar[1],
    dayStem,
    originalPillars
  );

  const nextRelations = analyzeRelations(
    nextPillar[0],
    nextPillar[1],
    dayStem,
    originalPillars
  );

  return {
    current: {
      year: currentYear,
      pillar: currentPillar,
      stem: currentPillar[0],
      branch: currentPillar[1],
      stemTenGod: getTenGod(dayStem, currentPillar[0]),
      branchTenGod: getTenGod(dayStem, currentPillar[1]),
      relations: currentRelations,
      interpretation: interpretYearFortune(
        currentPillar,
        currentYear,
        dayStem,
        originalPillars,
        sinGangScore,
        currentRelations
      ),
    },
    next: {
      year: currentYear + 1,
      pillar: nextPillar,
      stem: nextPillar[0],
      branch: nextPillar[1],
      stemTenGod: getTenGod(dayStem, nextPillar[0]),
      branchTenGod: getTenGod(dayStem, nextPillar[1]),
      relations: nextRelations,
      interpretation: interpretYearFortune(
        nextPillar,
        currentYear + 1,
        dayStem,
        originalPillars,
        sinGangScore,
        nextRelations
      ),
    },
  };
}

// =====================================================
// 대운 해석
// =====================================================

function interpretGreatFortune(
  pillar: string,
  dayStem: string,
  originalPillars: { year: string; month: string; day: string; hour: string },
  startAge: number,
  endAge: number,
  sinGangScore: number,
  relations: RelationResult
): {
  empathy: string;
  reality: string;
  fun: string;
} {
  const stem = pillar[0];
  const branch = pillar[1];
  const stemTenGod = getTenGod(dayStem, stem);
  const branchTenGod = getTenGod(dayStem, branch);

  const isSinGang = sinGangScore >= 60;
  const isSinYak = sinGangScore < 40;

  let specialNote = "";
  if (relations.cheonulGwiin.length > 0) {
    specialNote += " 천을귀인이 함께하여 귀인의 도움을 받습니다.";
  }
  if (relations.cheonganHap.length > 0) {
    specialNote += ` 천간합(${relations.cheonganHap.join(', ')})으로 생각과 의지가 변화합니다.`;
  }
  if (relations.cheonganChung.length > 0) {
    specialNote += ` 천간충(${relations.cheonganChung.join(', ')})으로 갈등이나 결단의 시기입니다.`;
  }
  if (relations.jijiYukhap.length > 0) {
    specialNote += ` 지지육합(${relations.jijiYukhap.join(', ')})으로 좋은 만남과 협력이 이루어집니다.`;
  }
  if (relations.jijiSamhap.length > 0) {
    specialNote += ` 삼합(${relations.jijiSamhap.join(', ')})으로 강력한 기운이 형성됩니다.`;
  }
  if (relations.jijiBanghap.length > 0) {
    specialNote += ` 방합(${relations.jijiBanghap.join(', ')})으로 한 방향으로 에너지가 몰립니다.`;
  }
  if (relations.jijiBanhap.length > 0) {
    specialNote += ` 반합(${relations.jijiBanhap.join(', ')})으로 부분적 조화가 생깁니다.`;
  }
  if (relations.jijiChung.length > 0) {
    specialNote += ` 지지충(${relations.jijiChung.join(', ')})으로 환경이 크게 변화하거나 활성화됩니다.`;
  }
  if (relations.jijiHyung.length > 0) {
    specialNote += ` 지지형(${relations.jijiHyung.join(', ')})으로 형벌적 압박이 있을 수 있습니다.`;
  }
  if (relations.jijiHae.length > 0) {
    specialNote += ` 지지해(${relations.jijiHae.join(', ')})로 손해나 소모가 발생할 수 있습니다.`;
  }
  if (relations.jijiPa.length > 0) {
    specialNote += ` 지지파(${relations.jijiPa.join(', ')})로 갈등이나 파괴적 상황이 올 수 있습니다.`;
  }
  if (relations.wonjin.length > 0) {
    specialNote += ` 원진(${relations.wonjin.join(', ')})으로 은밀한 갈등이나 불편함이 있습니다.`;
  }

  const tenGodTexts = getTenGodInterpretationWithSinGang(
    stemTenGod,
    branchTenGod,
    isSinGang,
    isSinYak
  );

  return {
    empathy: `${startAge}세부터 ${endAge}세까지는 ${tenGodTexts.empathy}${specialNote} 이 시기를 잘 활용하면 큰 성장을 이룰 수 있습니다.`,
    reality: `${startAge}~${endAge}세 대운 ${pillar}: 천간(${stem} ${stemTenGod}) 3, 지지(${branch} ${branchTenGod}) 7.${specialNote} ${tenGodTexts.reality}`,
    fun: `${startAge}살부터 ${endAge}살까지 ${tenGodTexts.fun}${specialNote}`,
  };
}

// =====================================================
// 세운 해석
// =====================================================

function interpretYearFortune(
  pillar: string,
  year: number,
  dayStem: string,
  originalPillars: { year: string; month: string; day: string; hour: string },
  sinGangScore: number,
  relations: RelationResult
): {
  empathy: string;
  reality: string;
  fun: string;
} {
  const stem = pillar[0];
  const branch = pillar[1];
  const stemTenGod = getTenGod(dayStem, stem);
  const branchTenGod = getTenGod(dayStem, branch);

  const isSinGang = sinGangScore >= 60;
  const isSinYak = sinGangScore < 40;

  let specialNote = "";
  if (relations.cheonulGwiin.length > 0) specialNote += " 천을귀인의 해.";
  if (relations.jijiChung.length > 0) specialNote += " 충으로 변화와 활성화.";
  if (relations.jijiYukhap.length > 0) specialNote += " 육합으로 좋은 만남.";

  const tenGodTexts = getTenGodInterpretationWithSinGang(
    stemTenGod,
    branchTenGod,
    isSinGang,
    isSinYak
  );

  return {
    empathy: `${year}년(${pillar}년)은 ${tenGodTexts.empathy}${specialNote}`,
    reality: `${year}년 세운 ${pillar}: 천간 ${stemTenGod}(3), 지지 ${branchTenGod}(7).${specialNote}`,
    fun: `${year}년은 ${tenGodTexts.fun}${specialNote}`,
  };
}

// =====================================================
// 십성 + 신강약 기반 해석
// =====================================================

function getTenGodInterpretationWithSinGang(
  stemTenGod: string,
  branchTenGod: string,
  isSinGang: boolean,
  isSinYak: boolean
): { empathy: string; reality: string; fun: string } {
  const mainTenGod = branchTenGod || stemTenGod;

  const interpretations: Record<
    string,
    {
      empathy: { sinGang: string; sinYak: string; normal: string };
      reality: { sinGang: string; sinYak: string; normal: string };
      fun: { sinGang: string; sinYak: string; normal: string };
    }
  > = {
    비견: {
      empathy: {
        sinGang: "나와 같은 에너지를 만나는 시기입니다. 안주하지 말고 의도적으로 바쁘게 움직이세요. 게으름에 주의가 필요해요.",
        sinYak: "동료나 파트너의 도움으로 여유가 생기고 사회적 성취도 함께 따르는 길한 시기입니다. 혼자보다 함께할 때 더 큰 힘을 발휘할 수 있어요.",
        normal: "나와 같은 에너지를 만나는 시기입니다. 동업이나 파트너십이 활발해질 수 있어요.",
      },
      reality: {
        sinGang: "비견운. 신강이므로 안주 경계. 의도적 활동 권장.",
        sinYak: "비견운. 신약이므로 협력으로 여유와 성취 동시 확보. 길함.",
        normal: "비견운으로 경쟁·협력 동시 발생.",
      },
      fun: {
        sinGang: "너 강한데 비견 만나면 게으름 주의ㅋㅋ 의도적으로 바쁘게 움직여!",
        sinYak: "너 약한데 비견 만나면 친구들이 도와줘서 여유 생김ㅋㅋ 길한 시기!",
        normal: "너랑 비슷한 애들 많이 만남ㅋㅋ",
      },
    },
    겁재: {
      empathy: {
        sinGang: "강한 에너지가 있지만 안주하기 쉬운 시기입니다. 게으름을 경계하고 의도적으로 목표를 설정하며 움직이세요. 재물 관리도 신경 쓰세요.",
        sinYak: "주변의 도움으로 여유가 생기고 성취도 따르는 시기입니다. 하지만 재물 관리는 여전히 조심해야 해요.",
        normal: "강한 에너지가 충돌하는 시기입니다. 재물 관리와 인간관계에 주의가 필요해요.",
      },
      reality: {
        sinGang: "겁재운. 신강이므로 게으름 주의. 의도적 활동 필요. 재물 분산 경계.",
        sinYak: "겁재운. 신약이므로 여유와 성취 있으나 재물 관리 여전히 중요.",
        normal: "겁재운으로 재물 손실 주의.",
      },
      fun: {
        sinGang: "너 강한데 겁재 만나면 게으름 주의ㅋㅋ 돈도 조심!",
        sinYak: "너 약한데 겁재 만나면 여유 생기고 좋은데 돈은 조심해!",
        normal: "돈 조심! 겁재 들어오면 재물 나갈 수 있음ㅠㅠ",
      },
    },
    식신: {
      empathy: {
        sinGang: "창의력과 표현력이 빛나는 시기입니다. 평소보다 바쁘지만 사회적 성취가 따르는 길한 흐름이에요. 적극적으로 도전하세요.",
        sinYak: "아이디어가 샘솟고 바쁜 시기입니다. 성취는 있지만 체력적으로 힘들 수 있으니 무리하지 말고 휴식도 챙기세요.",
        normal: "창의력과 표현력이 빛나는 시기입니다. 새로운 아이디어를 마음껏 펼쳐보세요.",
      },
      reality: {
        sinGang: "식신운. 신강이므로 바쁨 + 성취. 창작·기획·교육 분야 길함.",
        sinYak: "식신운. 신약이므로 바쁨 + 성취 but 체력 소모. 휴식 필수.",
        normal: "식신운으로 창작·기획·교육 분야 유리. 수입 안정.",
      },
      fun: {
        sinGang: "아이디어 샘솟음! 식신운 들어오면 바쁘지만 대박 찬스ㅋㅋ",
        sinYak: "아이디어는 좋은데 너 약해서 좀 힘들 수 있음ㅠㅠ 쉬엄쉬엄!",
        normal: "아이디어 샘솟음! 식신운은 창작하기 딱 좋음ㅋㅋ",
      },
    },
    상관: {
      empathy: {
        sinGang: "자유롭고 혁신적인 에너지가 넘치는 시기입니다. 바쁘지만 사회적 성취가 따르니 적극적으로 표현하세요. 단, 말조심은 필요해요.",
        sinYak: "표현력이 극대화되고 바쁜 시기입니다. 성취는 있지만 정신적·육체적으로 힘들 수 있으니 무리하지 마세요. 말조심도 필수!",
        normal: "자유롭고 혁신적인 에너지가 넘치는 시기입니다. 하지만 말조심이 필요해요.",
      },
      reality: {
        sinGang: "상관운. 신강이므로 바쁨 + 성취. 표현력 극대화. 말조심.",
        sinYak: "상관운. 신약이므로 바쁨 + 성취 but 힘듦. 스트레스 관리 필수.",
        normal: "상관운으로 표현력 극대화. 관직·직장운 불안정 가능.",
      },
      fun: {
        sinGang: "말 조심하면서 바쁘게 달려! 상관 터지면 대박 각ㅋㅋ",
        sinYak: "너 약한데 상관 만나면 입 거침없어지고 힘들 수 있음ㅠㅠ",
        normal: "말 조심! 상관 터지면 입이 거침없어짐ㅋㅋ",
      },
    },
    편재: {
      empathy: {
        sinGang: "활발한 재물 흐름이 생기는 시기입니다. 평소보다 바쁘지만 사회적 성취가 따르니 사업이나 투자에 적극 도전하세요!",
        sinYak: "재물 기회가 오고 바쁜 시기입니다. 성취는 있지만 무리하면 힘들 수 있으니 안정적인 저축이나 작은 투자로 신중하게 접근하세요.",
        normal: "활발한 재물 흐름이 생기는 시기입니다. 사업이나 투자 기회가 많아질 수 있어요.",
      },
      reality: {
        sinGang: "편재운. 신강이므로 바쁨 + 성취. 사업·투자 적극 권장.",
        sinYak: "편재운. 신약이므로 바쁨 + 성취 but 힘듦. 무리한 사업 지양. 안정적 재테크 권장.",
        normal: "편재운으로 유동재산 증가. 사업·투자 적기.",
      },
      fun: {
        sinGang: "돈 벌 찬스! 편재 들어오면 바쁘지만 사업이나 투자 고고!",
        sinYak: "돈 벌 기회는 왔는데 너 약해서 무리하면 안 됨ㅠㅠ 저축이나 해!",
        normal: "돈 벌 찬스! 편재 들어오면 사업이나 투자 고고!",
      },
    },
    정재: {
      empathy: {
        sinGang: "안정적인 재물과 결실을 얻는 시기입니다. 평소보다 바쁘지만 꾸준한 노력이 사회적 성취로 이어집니다.",
        sinYak: "재물운은 있고 바쁜 시기입니다. 성취는 있지만 무리하지 말고 안정적으로 관리하세요. 과욕은 금물이에요.",
        normal: "안정적인 재물과 결실을 얻는 시기입니다. 꾸준한 노력이 빛을 발할 거예요.",
      },
      reality: {
        sinGang: "정재운. 신강이므로 바쁨 + 성취. 고정수입 증가. 부동산·저축 유리.",
        sinYak: "정재운. 신약이므로 바쁨 + 성취 but 힘듦. 안정적 관리 필요. 무리한 투자 지양.",
        normal: "정재운으로 고정수입 안정. 부동산·저축 유리.",
      },
      fun: {
        sinGang: "월급쟁이 최고의 운! 정재는 바쁘지만 착실하게 모으기 딱임ㅋ",
        sinYak: "정재 왔는데 너 약해서 큰 투자는 금물! 안정적으로 가자!",
        normal: "월급쟁이 최고의 운! 정재는 착실하게 모으기 딱임ㅋ",
      },
    },
    편관: {
      empathy: {
        sinGang: "강한 도전과 압박이 있는 시기입니다. 평소보다 바쁘지만 극복하면 큰 사회적 성취와 리더십을 얻을 수 있어요. 적극적으로 도전하세요!",
        sinYak: "책임과 압박이 몰려오는 시기입니다. 성취는 있지만 정신적·육체적으로 매우 힘들 수 있으니 스트레스 관리와 휴식이 필수예요.",
        normal: "강한 도전과 압박이 있는 시기입니다. 하지만 극복하면 큰 성장이 따라와요.",
      },
      reality: {
        sinGang: "편관운. 신강이므로 바쁨 + 성취. 리더십·승진 기회. 길함.",
        sinYak: "편관운. 신약이므로 바쁨 + 성취 but 매우 힘듦. 스트레스 관리 필수.",
        normal: "편관운으로 리더십·승진 기회. 스트레스 관리 필수.",
      },
      fun: {
        sinGang: "빡센 시기임ㅋㅋ 편관 오면 바쁘지만 승진 찬스도 옴!",
        sinYak: "너 약한데 편관 만나면 진짜 힘듦ㅠㅠ 성취는 있는데 몸 챙겨!",
        normal: "빡센 시기임ㅋㅋ 편관 오면 압박 있지만 승진 찬스도 옴!",
      },
    },
    정관: {
      empathy: {
        sinGang: "책임과 명예가 따르는 시기입니다. 평소보다 바쁘지만 사회적으로 인정받고 성취를 이루는 길한 흐름이에요. 자신감 있게 나아가세요!",
        sinYak: "명예와 책임이 주어지는 시기입니다. 성취는 있지만 부담이 클 수 있으니 무리하지 말고 주변의 도움을 받으세요.",
        normal: "책임과 명예가 따르는 시기입니다. 사회적으로 인정받을 기회가 많아요.",
      },
      reality: {
        sinGang: "정관운. 신강이므로 바쁨 + 성취. 승진·합격·명예 획득 길함.",
        sinYak: "정관운. 신약이므로 바쁨 + 성취 but 부담. 무리 금물.",
        normal: "정관운으로 승진·합격·명예 획득 유리. 안정적 상승.",
      },
      fun: {
        sinGang: "정관 들어오면 바쁘지만 승진이나 합격 확률 업! 명예의 시기임ㅋ",
        sinYak: "정관 왔는데 너 약해서 좀 부담될 수 있음ㅠㅠ 힘내!",
        normal: "정관 들어오면 승진이나 합격 확률 업! 명예의 시기임ㅋ",
      },
    },
    편인: {
      empathy: {
        sinGang: "배움과 지식을 얻는 시기입니다. 하지만 안주하기 쉬우니 의도적으로 바쁘게 움직이며 새로운 분야에 도전하세요. 게으름을 경계해야 해요.",
        sinYak: "학습과 연구에 여유가 생기고 사회적 성취도 함께 따르는 길한 시기입니다. 편안하면서도 발전할 수 있는 좋은 흐름이에요.",
        normal: "배움과 지식을 얻는 시기입니다. 새로운 분야에 도전해 보세요.",
      },
      reality: {
        sinGang: "편인운. 신강이므로 안주 경계. 의도적 학습·활동 권장.",
        sinYak: "편인운. 신약이므로 여유 + 성취. 학습·연구 길함.",
        normal: "편인운으로 학습·연구·비주류 분야 유리. 독창성 발휘.",
      },
      fun: {
        sinGang: "공부할 거면 지금! 편인 왔는데 게으름 주의ㅋㅋ",
        sinYak: "편인 만나면 여유 생기고 공부도 잘됨! 길한 시기ㅋ",
        normal: "공부나 연구 할 거면 지금! 편인은 지식 쌓기 딱임ㅋ",
      },
    },
    정인: {
      empathy: {
        sinGang: "따뜻한 지원과 보호를 받는 시기입니다. 하지만 안주하기 쉬우니 의도적으로 목표를 설정하고 바쁘게 움직이세요. 게으름을 조심해야 해요.",
        sinYak: "귀인의 도움으로 여유가 생기고 사회적 성취도 함께 따르는 매우 길한 시기입니다. 편안하면서도 발전하는 좋은 흐름이에요.",
        normal: "따뜻한 지원과 보호를 받는 시기입니다. 주변의 도움으로 안정을 찾을 수 있어요.",
      },
      reality: {
        sinGang: "정인운. 신강이므로 안주 경계. 의도적 활동 권장.",
        sinYak: "정인운. 신약이므로 여유 + 성취. 학업·자격증·승진 길함. 귀인 도움.",
        normal: "정인운으로 학업·자격증·승진 유리. 귀인 도움.",
      },
      fun: {
        sinGang: "정인 들어오면 편한데 게으름 주의ㅋㅋ 의도적으로 움직여!",
        sinYak: "정인 만나면 여유 생기고 공부도 잘되고 대박! 길한 시기ㅋㅋ",
        normal: "정인 들어오면 공부 잘됨! 시험이나 자격증 따기 딱 좋음ㅋ",
      },
    },
  };

  const base = interpretations[mainTenGod] || {
    empathy: { sinGang: "새로운 변화", sinYak: "새로운 변화", normal: "새로운 변화" },
    reality: { sinGang: "운세 변화", sinYak: "운세 변화", normal: "운세 변화" },
    fun: { sinGang: "뭔가 바뀜!", sinYak: "뭔가 바뀜!", normal: "뭔가 바뀜!" },
  };

  if (isSinGang) {
    return {
      empathy: base.empathy.sinGang,
      reality: base.reality.sinGang,
      fun: base.fun.sinGang,
    };
  } else if (isSinYak) {
    return {
      empathy: base.empathy.sinYak,
      reality: base.reality.sinYak,
      fun: base.fun.sinYak,
    };
  } else {
    return {
      empathy: base.empathy.normal,
      reality: base.reality.normal,
      fun: base.fun.normal,
    };
  }
}

// =====================================================
// 통합 분석
// =====================================================

export function analyzeFullFortune(
  birthYear: number,
  gender: "M" | "F",
  monthPillar: string,
  daeunNum: number,
  currentAge: number,
  currentYear: number,
  dayStem: string,
  originalPillars: { year: string; month: string; day: string; hour: string },
  sinGangScore: number
) {
  const greatFortune = calculateGreatFortune(
    birthYear,
    gender,
    monthPillar,
    daeunNum,
    currentAge,
    dayStem,
    originalPillars,
    sinGangScore
  );

  const yearFortune = calculateYearFortune(
    currentYear,
    dayStem,
    originalPillars,
    sinGangScore
  );

  return {
    greatFortune,
    yearFortune,
  };
}
