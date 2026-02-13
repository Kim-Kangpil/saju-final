// frontend/analysis/engine.ts

import type { PillarBlock } from "../types/saju"; // 없으면 아래에 바로 타입 정의로 대체할 거임
import { analyzeFullFortune, GreatFortuneData, YearFortuneData } from "../data/fortuneAnalysis";
import { CHARM_BY_PILLAR } from "../data/charmAnalysis";
import { analyzeStrength } from "../data/strengthAnalysis";
import { analyzeRelations } from "../data/relationsAnalysis";
import { analyzeSpecialStars } from "../data/specialStarsAnalysis";
import { analyzeTodayFortune } from "../data/todayAnalysis";
import { TALENT_BY_TEN_GOD } from "../data/talentAnalysis";

type CharKey = "empathy" | "reality" | "fun";

// page.tsx에서 쓰던 것과 동일한 시그니처를 engine으로 넘기기 위해 타입 정의
type Pillar = { hanja: string; hangul: string };
// ⚠️ 너 page.tsx에 있는 PillarBlock 타입이랑 맞춰야 함
export type EnginePillarBlock = { label: string; cheongan: Pillar; jiji: Pillar };

export type EngineInput = {
  birthYmd: string;          // "YYYYMMDD"
  gender: "M" | "F";
  selectedChar: CharKey;
  result: {
    year: EnginePillarBlock;
    month: EnginePillarBlock;
    day: EnginePillarBlock;
    hour: EnginePillarBlock;
  };
  tenGod: (dayStem: string, targetStem: string) => string;
  hanjaToElement: (h: string) => "wood" | "fire" | "earth" | "metal" | "water" | "none";
};

export type EngineOutput = {
  fortuneAnalysis: {
    greatFortune: {
      current: GreatFortuneData;
      next: GreatFortuneData;
      direction: "순행" | "역행";
    };
    yearFortune: {
      current: YearFortuneData;
      next: YearFortuneData;
    };
  } | null;

  charmAnalysis: string | null;
  talentAnalysis: string | null;

  strengthAnalysis: any;
  relationsAnalysis: any;
  specialStarsAnalysis: any;
  todayFortune: any;
};

// birthYmd에서 연/월 뽑기 (page.tsx parseYmd 대체 최소 버전)
function parseBirthYmd(birthYmd: string) {
  const s = birthYmd.replace(/\D/g, "");
  if (s.length !== 8) return null;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6));
  const d = Number(s.slice(6, 8));
  if (y < 1900 || y > 2100) return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  return { year: y, month: m, day: d };
}

export function buildAnalysis(input: EngineInput): EngineOutput {
  const { birthYmd, gender, selectedChar, result, tenGod, hanjaToElement } = input;

  const parsed = parseBirthYmd(birthYmd);
  if (!parsed) {
    return {
      fortuneAnalysis: null,
      charmAnalysis: null,
      talentAnalysis: null,
      strengthAnalysis: null,
      relationsAnalysis: null,
      specialStarsAnalysis: null,
      todayFortune: null,
    };
  }

  const birthYear = parsed.year;
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear + 1;

  const monthPillar = result.month.cheongan.hanja + result.month.jiji.hanja;
  const dayStem = result.day.cheongan.hanja;

  const originalPillars = {
    year: result.year.cheongan.hanja + result.year.jiji.hanja,
    month: monthPillar,
    day: result.day.cheongan.hanja + result.day.jiji.hanja,
    hour: result.hour.cheongan.hanja + result.hour.jiji.hanja,
  };

  // TODO: 너 기존 로직에서 daeunNum, sinGangScore를 어떻게 구하는지 나중에 연결
  const daeunNum = 5;
  const sinGangScore = 50;

  // 1) 대운/세운
  let fortuneAnalysis: EngineOutput["fortuneAnalysis"] = null;
  try {
    fortuneAnalysis = analyzeFullFortune(
      birthYear,
      gender,
      monthPillar,
      daeunNum,
      currentAge,
      currentYear,
      dayStem,
      originalPillars,
      sinGangScore
    );
  } catch {
    fortuneAnalysis = null;
  }

  // 2) 매력 (일주 기준)
  const dayPillar = result.day.cheongan.hanja + result.day.jiji.hanja;
  const charmText = CHARM_BY_PILLAR[dayPillar];
  const charmAnalysis = charmText ? charmText[selectedChar] : null;

  // 3) 재능 (일간 기준 십성)
  const dayStemTenGod = tenGod(dayStem, dayStem);
  const talentText = TALENT_BY_TEN_GOD[dayStemTenGod];
  const talentAnalysis = talentText ? talentText[selectedChar] : null;

  // 4) 신강약
  const strengthAnalysis = analyzeStrength(
    dayStem,
    result.month.jiji.hanja,
    [result.year, result.month, result.day, result.hour],
    tenGod
  );

  // 5) 관계(합충)
  const relationsAnalysis = analyzeRelations(
    [
      result.year.cheongan.hanja,
      result.month.cheongan.hanja,
      result.day.cheongan.hanja,
      result.hour.cheongan.hanja,
    ],
    [
      result.year.jiji.hanja,
      result.month.jiji.hanja,
      result.day.jiji.hanja,
      result.hour.jiji.hanja,
    ]
  );

  // 6) 특수신살
  const specialStarsAnalysis = analyzeSpecialStars(
    result.day.jiji.hanja,
    result.year.jiji.hanja,
    result.month.jiji.hanja,
    result.hour.jiji.hanja
  );

  // 7) 오늘운(일간 오행 기준)
  const todayFortune = analyzeTodayFortune(hanjaToElement(dayStem), selectedChar);

  return {
    fortuneAnalysis,
    charmAnalysis,
    talentAnalysis,
    strengthAnalysis,
    relationsAnalysis,
    specialStarsAnalysis,
    todayFortune,
  };
}
