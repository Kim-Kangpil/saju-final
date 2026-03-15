"use client";
import { createPortal } from "react-dom";
import "../../styles/add-login.css";
import { saveSaju, getSavedSajuList } from '../../lib/sajuStorage';
import { clearStoredToken, getAuthHeaders } from '@/lib/auth';
import { use, useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import {
  analyzeFullFortune,
  GreatFortuneData,
  YearFortuneData,
  FORTUNE_ANALYSIS,
} from "../../data/fortuneAnalysis";
import { CHARM_ANALYSIS, CHARM_BY_PILLAR } from "../../data/charmAnalysis";
import { ELEMENT_ANALYSIS } from "../../data/elementAnalysis";
import { RELATIONS_ANALYSIS, analyzeRelations } from "../../data/relationsAnalysis";
import {
  SPECIAL_STARS_ANALYSIS,
  analyzeSpecialStars,
  getSpecialStarsVisualData,
  type SpecialStarVisualCard,
} from "../../data/specialStarsAnalysis";
import { summarizeGongmang, getGongmangVisualData, GongmangVisualSlot } from "../../data/gongmangAnalysis";
import {
  getEmotionalWeaknessParagraph,
  getEmotionTriggers,
  EmotionTriggers,
  EmotionalWeaknessParams,
} from "../../data/emotionalWeaknessAnalysis";
import {
  getHealthConstitutionParagraph,
  getHealthBodyMapData,
  type HealthAnalysisParams,
  type HealthBodyMapData,
} from "../../data/healthConstitutionAnalysis";
import { summarizeGuiin } from "../../data/guiinAnalysis";
import { STRENGTH_ANALYSIS, analyzeStrength } from "../../data/strengthAnalysis";
import { TALENT_ANALYSIS, TALENT_BY_TEN_GOD } from "../../data/talentAnalysis";
import { TODAY_ANALYSIS, analyzeTodayFortune } from "../../data/todayAnalysis";
import { dayPillarTexts } from "../../data/dayPillarAnimal";
import { getCoreValuesParagraph, getCoreValuesCompassData } from "../../data/coreValuesAnalysis";
import { getStrengthWeaknessParagraph, getStrengthWeaknessVisualData } from "../../data/strengthWeaknessAnalysis";
import { getLatentTalentAptitudeParagraph, getAptitudeSpectrumData } from "../../data/latentTalentAptitude";
import { getElementDistributionParagraph, getElementDistributionVisualData } from "../../data/elementDistributionAnalysis";
import { getTenGodAbilityParagraph, getTenGodAbilityCardsData } from "../../data/tenGodAbilityAnalysis";
import { getRelationshipStyleParagraph, getRelationshipStyleVisualData } from "../../data/relationshipStyleAnalysis";
import { getAncestorParentParagraph, getAncestorParentVisualData } from "../../data/ancestorParentFortune";
import { getCharismaSocialInfluenceParagraph, getCharismaVisualData } from "../../data/charismaSocialInfluence";
import { getCharmPointParagraph, getCharmVisualData } from "../../data/charmPointAnalysis";
import { NATURE_ANALYSIS } from "../../data/natureAnalysis";
import { analyzeMaskVsNature } from "../../analysis/maskVsNature";  // 🔥 추가
import { getLuckyItemParagraph, type LuckyItemParams } from "../../data/luckyItemAnalysis";
import Head from 'next/head';
import { SajuEnergyWheel } from "../../components/SajuEnergyWheel";
import { FaceSplitCard } from "../../components/FaceSplitCard";
import { CompassCard } from "../../components/CompassCard";
import { StrengthCard } from "../../components/StrengthCard";
import { TalentSpectrumCard } from "../../components/TalentSpectrumCard";
import { OhaengBalanceCard } from "../../components/OhaengBalanceCard";
import { TenGodAbilityCards } from "../../components/TenGodAbilityCards";
import { RelationshipBalanceCard } from "../../components/RelationshipBalanceCard";
import { FamilyDocumentCard } from "../../components/FamilyDocumentCard";
import { CharismaOrbitCard } from "../../components/CharismaOrbitCard";
import { CharmPerfumeCard } from "../../components/CharmPerfumeCard";
import { GuiinStarMap } from "../../components/GuiinStarMap";
import { EmotionTriggerMap } from "../../components/EmotionTriggerMap";
import { GongmangStructureMap } from "../../components/GongmangStructureMap";
import { SpecialStarsMap } from "../../components/SpecialStarsMap";
import { LuckyItemMap } from "../../components/LuckyItemMap";
import { HealthBodyMap } from "../../components/HealthBodyMap";
import { SummarySwipeCards } from "../../components/SummarySwipeCards";
import { Icon } from "@iconify/react";
import { buildSummaryPromptData, getSummaryGuideFallback, type SummaryInput } from "../../data/summaryAnalysis";
import { SUMMARY_SYSTEM_PROMPT, buildSummaryUserPrompt } from "../../data/summaryPrompt";

// =====================================================
// 정통 한양사주 디자인 토큰
// =====================================================
const S = {
  cream: "#F5F1EA",
  cream2: "#EDE7DB",
  cream3: "#E3D9CB",
  beige: "#D4C9B8",
  beige2: "#C4B8A4",
  ink: "#2C2417",
  ink2: "#4A3F30",
  ink3: "#6B5F4E",
  gold: "#8B7355",
  goldLight: "#A8946A",
  red: "#8B2020",
  wood: "#2D6A4F",
  fire: "#8B2020",
  earth: "#7A5C2E",
  metal: "#5A6475",
  water: "#1B3A5C",
  // gmarketsans를 메인으로 사용
  fontDisplay: "'GmarketSans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontBody: "'GmarketSans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const;

const ELEMENT_COLOR: Record<string, string> = {
  wood: S.wood,
  fire: S.fire,
  earth: S.earth,
  metal: S.metal,
  water: S.water,
  none: S.ink,
};

// =====================================================
// 타입
// =====================================================
type Pillar = { hanja: string; hangul: string };
type PillarBlock = { label: string; cheongan: Pillar; jiji: Pillar };
type SajuResult = {
  hour: PillarBlock;
  day: PillarBlock;
  month: PillarBlock;
  year: PillarBlock;
  twelve_states?: { hour?: string; day?: string; month?: string; year?: string };
  jijanggan?: {
    hour?: Array<{ hanja: string; hangul: string; element: string }>;
    day?: Array<{ hanja: string; hangul: string; element: string }>;
    month?: Array<{ hanja: string; hangul: string; element: string }>;
    year?: Array<{ hanja: string; hangul: string; element: string }>;
  };
};
type CharKey = "empathy" | "reality" | "fun";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";
declare global {
  interface Window {
    Kakao: any;
  }
}

// =====================================================
// 유틸리티 함수
// =====================================================

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function parseYmd(ymd8: string) {
  const s = onlyDigits(ymd8);
  if (s.length !== 8) return null;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6));
  const d = Number(s.slice(6, 8));
  if (y < 1900 || y > 2100) return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d)
    return null;
  return { year: y, month: m, day: d };
}

function parseHm(hm4: string) {
  const s = onlyDigits(hm4);
  if (s.length !== 4) return null;
  const h = Number(s.slice(0, 2));
  const mi = Number(s.slice(2, 4));
  if (h < 0 || h > 23) return null;
  if (mi < 0 || mi > 59) return null;
  return { hour: h, minute: mi };
}

function splitPillar(text: string): [Pillar, Pillar] {
  const hanja1 = text?.[0] ?? "";
  const hanja2 = text?.[1] ?? "";
  return [
    { hanja: hanja1, hangul: hanjaToHangul(hanja1) },
    { hanja: hanja2, hangul: hanjaToHangul(hanja2) },
  ];
}

function hanjaToHangul(h: string) {
  const map: Record<string, string> = {
    甲: "갑",
    乙: "을",
    丙: "병",
    丁: "정",
    戊: "무",
    己: "기",
    庚: "경",
    辛: "신",
    壬: "임",
    癸: "계",
    子: "자",
    丑: "축",
    寅: "인",
    卯: "묘",
    辰: "진",
    巳: "사",
    午: "오",
    未: "미",
    申: "신",
    酉: "유",
    戌: "술",
    亥: "해",
  };
  return map[h] ?? "";
}

function hanjaToElement(
  h: string
): "wood" | "fire" | "earth" | "metal" | "water" | "none" {
  const wood = new Set(["甲", "乙", "寅", "卯"]);
  const fire = new Set(["丙", "丁", "巳", "午"]);
  const earth = new Set(["戊", "己", "辰", "戌", "丑", "未"]);
  const metal = new Set(["庚", "辛", "申", "酉"]);
  const water = new Set(["壬", "癸", "子", "亥"]);

  if (wood.has(h)) return "wood";
  if (fire.has(h)) return "fire";
  if (earth.has(h)) return "earth";
  if (metal.has(h)) return "metal";
  if (water.has(h)) return "water";
  return "none";
}


function elementClass(el: string) {
  switch (el) {
    case "wood":
      return "text-emerald-600";
    case "fire":
      return "text-rose-500";
    case "earth":
      return "text-amber-600";
    case "metal":
      return "text-gray-400";
    case "water":
      return "text-blue-600";
    default:
      return "text-slate-900";
  }
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";

function stemMeta(stem: string): { el: Element; pol: Polarity } | null {
  const map: Record<string, { el: Element; pol: Polarity }> = {
    甲: { el: "wood", pol: "yang" },
    乙: { el: "wood", pol: "yin" },
    丙: { el: "fire", pol: "yang" },
    丁: { el: "fire", pol: "yin" },
    戊: { el: "earth", pol: "yang" },
    己: { el: "earth", pol: "yin" },
    庚: { el: "metal", pol: "yang" },
    辛: { el: "metal", pol: "yin" },
    壬: { el: "water", pol: "yang" },
    癸: { el: "water", pol: "yin" },
  };
  return map[stem] ?? null;
}

/** 지지(月支 등)의 정기(本氣) — 일간 기준 십성 계산용. 子는 癸(음수), 亥는 壬(양수). */
function branchMainStem(branch: string): string | null {
  const map: Record<string, string> = {
    子: "癸",
    丑: "己",
    寅: "甲",
    卯: "乙",
    辰: "戊",
    巳: "丙",
    午: "丁",
    未: "己",
    申: "庚",
    酉: "辛",
    戌: "戊",
    亥: "壬",
  };
  return map[branch] ?? null;
}

function produces(a: Element, b: Element) {
  const next: Record<Element, Element> = {
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water",
    water: "wood",
  };
  return next[a] === b;
}

function controls(a: Element, b: Element) {
  const map: Record<Element, Element> = {
    wood: "earth",
    fire: "metal",
    earth: "water",
    metal: "wood",
    water: "fire",
  };
  return map[a] === b;
}

function tenGod(dayStem: string, targetStem: string): string {
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


function generatePreviewText(title: string): string {
  const previews = [
    "당신의 사주에서 발견된 특별한 기운이 있습니다. 이는 매우 흥미로운 패턴으로, 일반적이지 않은 조합입니다. 이러한 배치는 당신만의 독특한 재능과 가능성을 나타내며, 특히 인간관계에서 두각을 나타낼 수 있습니다. 더 자세한 내용은 로그인 후 확인하실 수 있습니다.",
    "당신의 타고난 재능이 사주에 명확하게 드러나고 있습니다. 이러한 재능은 특정 분야에서 탁월한 성과를 낼 수 있는 가능성을 보여줍니다. 십성 분포를 보면 창의적이면서도 실용적인 균형을 갖추고 있어, 다양한 방면으로의 발전이 기대됩니다.",
    "인간관계에서 당신만의 독특한 패턴이 발견됩니다. 합과 충의 배치를 보면 특정 유형의 사람들과 특별한 시너지를 낼 수 있는 구조입니다. 이는 당신의 대인관계 전략 수립에 중요한 인사이트를 제공합니다.",
  ];

  return previews[Math.floor(Math.random() * previews.length)];
}

function LockIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      style={{ color: S.gold }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

// =====================================================
// 캐릭터 데이터
// =====================================================

const CHARACTERS = {
  empathy: {
    id: "empathy",
    name: "공감형",
    img: "/images/ham_soft.png",
    oneLine: "틀렸다고 말하지 않고, 방향만 살짝 바꿔주는 사람",
    desc: "어조가 부드럽고 부정적인 말도 완충재를 깔아드려요.",
    progressMessages: {
      stage1: [
        "당신의 사주 한 글자 한 글자를\n소중히 읽어내고 있어요.",
        "별빛처럼 반짝이는 당신의 운명을\n찾아내는 중이에요... ✨",
        "당신만을 위한 특별한 이야기를\n준비하고 있답니다.",
        "마음을 가다듬고 계세요.\n곧 아름다운 소식이 올 거예요.",
        "당신의 과거와 미래를 잇는\n운명의 실을 엮고 있어요.",
        "천천히, 하지만 확실하게\n당신의 이야기를 그려내고 있어요.",
        "하늘의 별들이 당신에 대해\n속삭이는 걸 듣고 있어요.",
        "당신이라는 우주를\n조심스럽게 펼쳐보고 있답니다.",
        "시간이 새겨놓은 당신의 흔적을\n하나하나 읽어내고 있어요.",
        "당신의 사주팔자가 품은 비밀을\n정성껏 풀어내는 중이에요.",
      ],
      stage2: [
        "사주 속에 숨겨진 보물을\n하나하나 꺼내고 있어요. 💎",
        "당신의 미래에 피어날 꽃을\n상상하며 분석 중이에요.",
        "오행의 조화를 맞추고 있어요.\n조금만 더 기다려주실래요?",
        "당신에게 필요한 따뜻한 조언을\n정성껏 준비하는 중입니다.",
        "별들이 속삭이는 당신의 이야기를\n듣고 있어요... 🌙",
        "당신의 강점과 가능성을\n빛나게 만들 방법을 찾고 있어요.",
        "힘들었던 순간들도, 빛날 순간들도\n모두 의미가 있었다는 걸 알게 될 거예요.",
        "당신이 걸어온 길과 걸어갈 길을\n함께 그려보고 있어요.",
        "당신만의 특별한 에너지 패턴을\n발견하고 있답니다.",
        "운명이 준비한 선물 상자를\n조심스럽게 열어보고 있어요. 🎁",
      ],
      stage3: [
        "거의 다 왔어요!\n당신의 운명 보고서가 완성되고 있어요.",
        "마지막 축복을 담고 있어요.\n곧 만나요! 🎀",
        "당신만을 위한 특별한 메시지,\n지금 도착합니다.",
        "준비가 끝났어요.\n당신의 미래를 펼쳐볼까요?",
        "두근두근... 당신의 운명이\n문을 두드리고 있어요!",
        "당신의 사주가 들려주는 이야기,\n정말 아름답더라구요.",
        "기다려주셔서 감사해요.\n정말 좋은 소식들이 많아요.",
        "당신이 궁금해하던 모든 것들,\n이제 곧 알게 될 거예요.",
        "마지막 리본을 묶고 있어요.\n정말 특별한 선물이 될 거예요. 🎁",
        "당신의 인생이라는 책의 새로운 장,\n이제 펼쳐볼 준비가 되었어요.",
      ],
    },
    getGreeting: (_timeStr: string) => {
      const greetings = [
        "당신의 밤하늘엔\n어떤 별이 가장 밝게 빛날까요?",
        "잊고 있던 당신의 예쁜 이름,\n사주에 적힌 대로 불러줄게요.",
        "한양사주 한 번에\n작은 행복이 당신을 기다려요.",
        "당신이라는 꽃이 피어날\n가장 완벽한 계절을 찾았어요.",
        "오늘 하루도 고생 많았어요.\n이제 당신만의 이야기를 들려드릴게요.",
        "당신이 걸어온 길이\n결코 헛되지 않았다는 걸 알게 될 거예요.",
        "힘들 때도 있었죠?\n이제 당신을 응원하는 우주의 메시지를 전할게요.",
        "당신은 이미 충분히 잘하고 있어요.\n사주가 그렇게 말하고 있답니다.",
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    },
  },
  reality: {
    id: "reality",
    name: "분석형",
    img: "/images/ham_cold.png",
    oneLine: "기분은 몰라도, 방향은 정확히 알려주는",
    desc: "감정 빼고 사실만! 군더더기 없이 말해드립니다.",
    progressMessages: {
      stage1: [
        "60갑자 데이터베이스 로딩 중...\n정확도 99.8%로 연산합니다.",
        "오행 배치 분석 시작.\n오차 범위 ±0.1% 이내로 계산 중.",
        "사주 원국 구조 파싱 완료.\n십성 배치 검증 중입니다.",
        "천간지지 매트릭스 구축.\n상호작용 분석 진행 중.",
        "생년월일시 데이터 검증.\n천문력 대조 작업 수행 중.",
        "음양오행 배치 연산.\n통계 모델 적용 중입니다.",
        "사주명리학 알고리즘 가동.\n데이터 정합성 99.9% 확보.",
        "천간 상생상극 매트릭스 분석.\n패턴 인식 진행 중.",
        "지지 육합삼합 구조 파싱.\n시스템 검증 단계.",
        "십성 분포도 작성.\n강약 분석 알고리즘 실행 중.",
      ],
      stage2: [
        "신강약 점수 산출 완료.\n대운 흐름 분석 진행 중입니다.",
        "통계 기반 예측 모델 적용 중...\n정확도 검증 단계입니다.",
        "월령 왕쇠 데이터 매칭.\n계절별 오행 강도 측정 중.",
        "십성 가중치 계산 완료.\n최종 점수 산출 중입니다.",
        "대운 세운 타임라인 구축.\n향후 10년 흐름 예측 중.",
        "합충형해파 관계 분석.\n사주 내 상호작용 검증 중.",
        "특수신살 배치 확인.\n도화살, 역마살, 화개살 체크 중.",
        "재물운 알고리즘 실행.\n수익 구조 분석 진행 중.",
        "인간관계 패턴 분석.\n육친 배치 검증 단계.",
        "종합 점수 산출 중.\n최종 리포트 생성 준비.",
      ],
      stage3: [
        "최종 검증 단계 진입.\n결과 출력 준비 완료.",
        "분석 리포트 생성 중...\n팩트만 담았습니다. 💻",
        "데이터 정합성 체크 완료.\n오류율 0.01% 미만 확인.",
        "통계 신뢰도 99.7%.\n결과 출력 대기 중입니다.",
        "사주명리 DB 대조 완료.\n역사적 데이터와 매칭 중.",
        "AI 분석 모델 검증 완료.\n최종 보고서 생성 중.",
        "3중 교차 검증 통과.\n결과 신뢰도 최상급.",
        "알고리즘 연산 종료.\n출력 포맷 최적화 중.",
        "최종 리포트 암호화 완료.\n전송 준비 완료.",
        "분석 완료. 오차 범위 허용치 내.\n결과 출력 시작합니다.",
      ],
    },
    getGreeting: (_timeStr: string) => {
      const greetings = [
        "당신의 생년월일이 가리키는 픽셀 데이터,\n오차 없이 분석합니다.",
        "근거 없는 위로는 사절입니다.\n철저히 수치로만 증명할게요.",
        "사주명리학 데이터베이스 준비 완료.\n정확한 분석만 제공합니다.",
        "통계와 확률로 말합니다.\n감정은 배제하고 팩트만 전달합니다.",
        "당신의 사주팔자,\n과학적 방법론으로 해석합니다.",
        "수천 년 축적된 데이터와 대조.\n객관적 분석 결과를 제시합니다.",
        "60갑자 조합 3,600가지 중\n당신의 위치를 정확히 파악합니다.",
        "오행 에너지 분포 분석.\n강약 점수 정밀 측정 예정.",
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    },
  },
  fun: {
    id: "fun",
    name: "친구형",
    img: "/images/ham_friend.png",
    oneLine: "친구가 커피 마시면서 해주는 사주 이야기",
    desc: "반말 섞인 친근한 말투!",
    progressMessages: {
      stage1: [
        "잠깐만! 너 사주 좀 복잡하다?\n천천히 봐줄게.",
        "어? 이거 뭐야... 오 대박?\n좀만 기다려봐!",
        "야 이거 진짜... 재밌는데?\n계속 볼게 잠깐만.",
        "오케이 일단 기본 정보부터 체크.\n금방 끝나.",
        "너 사주 보는데 시간 좀 걸릴듯.\n근데 볼 만해서 괜찮아.",
        "음... 흥미롭네? 이거\n좀 더 파봐야겠어.",
        "야 너 이거 알아?\n지금 진짜 신기한 거 발견 중.",
        "오... 생각보다 재밌는데?\n조금만 기다려.",
        "이거 제대로 보려면 시간 필요해.\n근데 기대해도 좋아.",
        "너 사주 보면서 놀란 거 처음이야.\n진짜임.",
      ],
      stage2: [
        "오... 이거 생각보다 괜찮은데?\n너 운 좀 있어!",
        "와 진짜... 너 이거 보고\n놀랄 준비 해 🔥",
        "잠깐, 이거 확인 좀 해봐야겠어.\n뭔가 특이한 게 보여.",
        "야 이거 진짜 신기하다.\n너 이런 거 알고 있었어?",
        "오케이 이제 좀 보이네.\n너 생각보다 특이해.",
        "음... 이 부분이 핵심인데,\n제대로 설명해줄게.",
        "너 진짜 재밌는 사람이구나.\n사주가 증명하고 있어.",
        "이거 보면서 배우는 것도 있네.\n너 사주 독특해.",
        "야 너 이거 진짜 알아야 해.\n중요한 거 발견했어.",
        "오... 이 조합 처음 보는데?\n대박이야 진짜.",
      ],
      stage3: [
        "다 봤다! 야 이거 진짜...\n직접 봐야 믿을걸? 💥",
        "준비됐어? 너 인생 바뀔 수도 있어.\n각오해.",
        "오케이 정리 완료!\n너한테 할 말 많아.",
        "야 이거 진짜 재밌어.\n바로 알려줄게.",
        "다 확인했어.\n생각보다 훨씬 좋은데?",
        "마지막 점검 중.\n근데 진짜 기대해도 돼.",
        "야 너 이거 보면\n진짜 놀랄 거야. 각오해.",
        "오케이 완성!\n제대로 된 거 보여줄게.",
        "준비 끝! 지금부터\n진짜 시작이야.",
        "다 봤어. 솔직히 말하면,\n너 생각보다 쩔어.",
      ],
    },
    getGreeting: (_timeStr: string) => {
      const greetings = [
        "팩트 폭격기 가동한다.\n유리 멘탈이면 애초에 오지 마.",
        "너 지금 누를까 말까 고민하는 거\n다 보여. 그냥 빨리 눌러!",
        "야, 사주 보러 왔으면\n각오는 하고 온 거지?",
        "솔직하게 말해줄게.\n듣기 싫으면 지금 나가도 돼.",
        "친구 사이니까 진짜 얘기해주는 거야.\n준비됐어?",
        "너 운명 궁금하지?\n그럼 제대로 알려줄게.",
        "사주 보는 건 좋은데,\n현실 직시할 준비는 됐어?",
        "오늘 너한테 필요한 건\n위로가 아니라 팩트야.",
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    },
  },
} as const;

type MegaKey = "identity" | "talent" | "relation" | "insight" | "solution";

type MegaCard =
  | {
    id: string;
    kind: "ready";
    title: string;
    icon?: string;
  }
  | {
    id: string;
    kind: "content";
    title: string;
    content: string;
    icon?: string;
    source?: "gpt" | "local";
  }
  | {
    id: string;
    kind: "preview";
    title: string;
    content: string;
    icon?: string;
  };

const MEGA_SECTIONS: Record<
  MegaKey,
  { title: string; icon: string; items: Array<{ key: string; title: string; icon?: string }> }
> = {
  identity: {
    title: "나의 본질과 정체성",
    icon: "🎭",
    items: [
      { key: "animal", title: "일주 동물의 형상과 본성", icon: "🦁" },
      { key: "nature", title: "타고난 기질과 기운", icon: "✨" },
      { key: "persona", title: "사회적 가면과 실제 기질의 차이", icon: "🎪" },
      { key: "values", title: "삶의 핵심적인 가치관과 지향점", icon: "🧭" },
    ],
  },
  talent: {
    title: "재력과 사회적 무기",
    icon: "🏆",
    items: [
      { key: "strengthWeak", title: "나의 강점과 약점", icon: "💪" },
      { key: "aptitude", title: "잠재된 천부와 직무 적성", icon: "🎯" },
      { key: "elements", title: "오행의 분포와 보완법", icon: "🔥" },
      { key: "tengod", title: "십성으로 보는 주요 능력", icon: "🎪" },
    ],
  },
  relation: {
    title: "관계와 환경의 에너지",
    icon: "🤝",
    items: [
      { key: "comm", title: "인간관계 스타일", icon: "💬" },
      { key: "parents", title: "내 안에 흐르는 가장 단단한 유전자", icon: "👪" },
      { key: "charisma", title: "카리스마와 사회적 영향력", icon: "👑" },
      { key: "hapchung", title: "사람들이 빠지는 나의 매력포인트", icon: "⚡" },
    ],
  },
  insight: {
    title: "내화 심리 및 조력자",
    icon: "🔮",
    items: [
      { key: "gongmang", title: "공망 분석", icon: "🕳" },
      { key: "guiin", title: "주요 귀인 분석", icon: "👼" },
      { key: "stress", title: "감정 약점", icon: "🧘" },
    ],
  },
  solution: {
    title: "건강과 행운의 처방",
    icon: "💊",
    items: [
      { key: "health", title: "체질적인 건강 기운", icon: "🏥" },
      { key: "lucky", title: "행운의 아이템", icon: "🍀" },
      { key: "summary", title: "종합 요약 및 인생 가이드", icon: "📜" },
    ],
  },
};

function asReady(id: string, title: string, icon?: string): MegaCard {
  return { id, kind: "ready", title, icon };
}

function asContent(
  id: string,
  title: string,
  content: string,
  icon?: string,
  source: "gpt" | "local" = "gpt"
): MegaCard {
  return { id, kind: "content", title, content, icon, source };
}

function asPreview(id: string, title: string, icon?: string): MegaCard {
  return {
    id,
    kind: "preview",
    title,
    content: generatePreviewText(title),
    icon,
  };
}

function classifyMegaByTitle(title: string): MegaKey | null {
  const t = (title || "").replace(/\s+/g, "");
  if (!t) return null;

  if (
    t.includes("본질") ||
    t.includes("정체성") ||
    t.includes("기질") ||
    t.includes("기운") ||
    t.includes("어떠하냐") ||
    t.includes("가면") ||
    t.includes("가치관") ||
    t.includes("지향")
  )
    return "identity";

  if (
    t.includes("능력") ||
    t.includes("강점") ||
    t.includes("약점") ||
    t.includes("천부") ||
    t.includes("직무") ||
    t.includes("적성") ||
    t.includes("오행") ||
    t.includes("십성") ||
    t.includes("무기")
  )
    return "talent";

  if (
    t.includes("관계") ||
    t.includes("커뮤니케이션") ||
    t.includes("부모") ||
    t.includes("조상") ||
    t.includes("유전자") ||
    t.includes("카리스마") ||
    t.includes("영향력") ||
    t.includes("합") ||
    t.includes("충")
  )
    return "relation";

  if (
    t.includes("공망") ||
    t.includes("귀인") ||
    t.includes("심리") ||
    t.includes("스트레스") ||
    t.includes("마음")
  )
    return "insight";

  if (
    t.includes("건강") ||
    t.includes("처방") ||
    t.includes("개운") ||
    t.includes("행운") ||
    t.includes("아이템") ||
    t.includes("요약") ||
    t.includes("가이드")
  )
    return "solution";

  return null;
}

// =====================================================
// 메인 컴포넌트
// =====================================================

export default function Page({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 🔥 새로 추가: 저장 관련 state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveDialogInputFocused, setSaveDialogInputFocused] = useState(false);
  const [savingToServer, setSavingToServer] = useState(false);
  const [sajuName, setSajuName] = useState('');
  const [birthYmd, setBirthYmd] = useState("");
  const [birthHm, setBirthHm] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [timeUnknown, setTimeUnknown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<SajuResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [previewCardIndex, setPreviewCardIndex] = useState(0);
  const previewCarouselRef = useRef<HTMLDivElement>(null);
  const [seedCount, setSeedCount] = useState<number>(0);

  const [currentGreeting, setCurrentGreeting] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [scriptMode, setScriptMode] = useState<"hanja" | "hangul">("hanja");
  const [expandedSection, setExpandedSection] = useState<"elements" | "wealth" | null>(null);

  const [showHarmonyAfter, setShowHarmonyAfter] = useState(false);
  const [newInterpretation, setNewInterpretation] = useState<any>(null);
  const [showFortune, setShowFortune] = useState(false);
  const [showCharm, setShowCharm] = useState(false);
  const [showTalent, setShowTalent] = useState(false);
  const [showStrength, setShowStrength] = useState(false);
  const [showRelations, setShowRelations] = useState(false);
  const [showSpecialStars, setShowSpecialStars] = useState(false);
  const [showToday, setShowToday] = useState(false);

  const [fortuneAnalysis, setFortuneAnalysis] = useState<{
    greatFortune: {
      current: GreatFortuneData;
      next: GreatFortuneData;
      direction: "순행" | "역행";
    };
    yearFortune: {
      current: YearFortuneData;
      next: YearFortuneData;
    };
  } | null>(null);

  const [charmAnalysis, setCharmAnalysis] = useState<string | null>(null);
  const [talentAnalysis, setTalentAnalysis] = useState<string | null>(null);
  const [strengthAnalysis, setStrengthAnalysis] = useState<any>(null);
  const [relationsAnalysis, setRelationsAnalysis] = useState<any>(null);
  const [specialStarsAnalysis, setSpecialStarsAnalysis] = useState<any>(null);
  const [specialStarsVisual, setSpecialStarsVisual] = useState<SpecialStarVisualCard[] | null>(null);
  const [healthBodyMap, setHealthBodyMap] = useState<HealthBodyMapData | null>(null);
  const [todayFortune, setTodayFortune] = useState<any>(null);
  const [natureAnalysis, setNatureAnalysis] = useState<string | null>(null);
  const [natureYangCount, setNatureYangCount] = useState<number>(0);
  const [natureYinCount, setNatureYinCount] = useState<number>(0);
  const [summaryGuide, setSummaryGuide] = useState<string | null>(null);
  const [maskVsNatureAnalysis, setMaskVsNatureAnalysis] = useState<string | null>(null);
  const [maskVsNatureLabels, setMaskVsNatureLabels] = useState<{ social: string; real: string; habit: string } | null>(null);
  const [gongmangAnalysis, setGongmangAnalysis] = useState<string | null>(null);
  const [gongmangVisual, setGongmangVisual] = useState<GongmangVisualSlot[] | null>(null);
  const [emotionalWeakness, setEmotionalWeakness] = useState<string | null>(null);
  const [emotionTriggers, setEmotionTriggers] = useState<EmotionTriggers | null>(null);
  const [guiinAnalysis, setGuiinAnalysis] = useState<string | null>(null);
  const [healthAnalysis, setHealthAnalysis] = useState<string | null>(null);
  const [luckyItems, setLuckyItems] = useState<string | null>(null);
  useEffect(() => {
    if (!loading) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [loading]);
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedIn === 'true');
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/seeds`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && typeof data?.seeds === "number") setSeedCount(data.seeds);
      } catch {
        if (!cancelled) setSeedCount(0);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 🔥 새로 추가: 로그인 상태 실시간 반영
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('focus', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('focus', checkLoginStatus);
    };
  }, []);


  // 🔥 로컬 테스트용: ?test=1 이면 목업 분석 결과를 바로 표시 (백엔드 없이 확인용)
  const MOCK_RESULT_FOR_TEST: SajuResult = useMemo(
    () => ({
      hour: { label: "시주", cheongan: { hanja: "庚", hangul: "경" }, jiji: { hanja: "午", hangul: "오" } },
      day: { label: "일주", cheongan: { hanja: "甲", hangul: "갑" }, jiji: { hanja: "子", hangul: "자" } },
      month: { label: "월주", cheongan: { hanja: "戊", hangul: "무" }, jiji: { hanja: "寅", hangul: "인" } },
      year: { label: "년주", cheongan: { hanja: "庚", hangul: "경" }, jiji: { hanja: "午", hangul: "오" } },
      twelve_states: { hour: "장생", day: "목욕", month: "병", year: "태" },
      jijanggan: undefined,
    }),
    []
  );

  // 🔥 새로 추가: 저장된 사주 불러오기
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loadedId = params.get("loaded");
    const testMode = params.get("test") === "1";

    if (testMode) {
      setBirthYmd("19900101");
      setBirthHm("1200");
      setGender("M");
      setCalendar("solar");
      setTimeUnknown(false);
      setResult(MOCK_RESULT_FOR_TEST);
      window.history.replaceState({}, "", "/add");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
      return;
    }

    if (loadedId) {
      const loadedSajuStr = sessionStorage.getItem("loadedSaju");
      if (loadedSajuStr) {
        try {
          const loadedSaju = JSON.parse(loadedSajuStr);

          setBirthYmd(loadedSaju.birthYmd);
          setBirthHm(loadedSaju.birthHm);
          setGender(loadedSaju.gender);
          setCalendar(loadedSaju.calendar);
          setTimeUnknown(loadedSaju.timeUnknown);
          setResult(loadedSaju.result);

          sessionStorage.removeItem("loadedSaju");
          window.history.replaceState({}, "", "/add");

          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 500);
          return;
        } catch (e) {
          console.error("사주 불러오기 실패:", e);
          router.replace("/saju-list");
          return;
        }
      }
      router.replace("/saju-list");
      return;
    }

    // test/loaded 없으면 결과 없음 → 사주 목록으로 이동 (빈 결과 화면 거의 안 씀)
    router.replace("/saju-list");
  }, [MOCK_RESULT_FOR_TEST, router]);

  // 🔥 새로 추가: 저장 함수들
  function handleSaveSaju() {
    if (!isLoggedIn) {
      if (confirm('로그인이 필요합니다. 로그인 하시겠습니까?')) {
        router.push('/login');
      }
      return;
    }

    const savedList = getSavedSajuList();

    if (savedList.length >= 5) {
      if (confirm('저장 공간이 가득 찼습니다.\n마이페이지로 이동하시겠습니까?')) {
        router.push('/mypage');
      }
      return;
    }

    setShowSaveDialog(true);
  }

  async function confirmSave() {
    if (!sajuName.trim()) {
      alert('사주 이름을 입력해주세요.');
      return;
    }

    if (!result) return;

    setSavingToServer(true);
    try {
      // 1) 서버에 저장 (로그인 시 영구 보관 — 나중에 들어와도 사주 목록에 유지됨)
      const birthdate = `${birthYmd.slice(0, 4)}-${birthYmd.slice(4, 6)}-${birthYmd.slice(6, 8)}`;
      const birth_time = timeUnknown ? null : `${birthHm.slice(0, 2)}:${birthHm.slice(2, 4)}`;
      const calendar_type = calendar === "solar" ? "양력" : "음력";
      const genderText = gender === "M" ? "남자" : "여자";

      const res = await fetch(`${API_BASE}/api/saju/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({
          name: sajuName.trim(),
          relation: null,
          birthdate,
          birth_time,
          calendar_type,
          gender: genderText,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      if (!res.ok || !data?.success) {
        alert(data?.detail || "저장에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      // 2) 로컬에도 저장 (마이페이지 등에서 바로 반영)
      const saveResult = saveSaju({
        name: sajuName.trim(),
        birthYmd,
        birthHm: timeUnknown ? "1200" : birthHm,
        gender,
        calendar,
        timeUnknown,
        result,
      });

      if (saveResult.success) {
        setShowSaveDialog(false);
        setSajuName("");
        alert(`✅ ${saveResult.message}\n\n사주 목록에서 확인하세요!`);
        if (confirm("사주 목록으로 이동하시겠습니까?")) {
          router.push("/saju-list");
        }
      } else {
        // 서버 저장은 됐지만 로컬 저장 실패(예: 5개 초과) — 서버에는 있으므로 목록으로 유도
        setShowSaveDialog(false);
        setSajuName("");
        alert("서버에 저장되었습니다. 사주 목록에서 확인하세요.");
        if (confirm("사주 목록으로 이동하시겠습니까?")) {
          router.push("/saju-list");
        }
      }
    } catch (e) {
      console.error("사주 저장 오류:", e);
      alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSavingToServer(false);
    }
  }

  // 🔥 새로 추가: 공유 함수들
  function handleShare() {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      handleCopyLink();
      return;
    }

    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '🔮 한양사주',
          description: '무료로 내 사주팔자를 확인해보세요!',
          imageUrl: 'https://hsaju.com/images/ham_icon.png',
          link: {
            mobileWebUrl: 'https://hsaju.com',
            webUrl: 'https://hsaju.com',
          },
        },
        buttons: [
          {
            title: '사주 보러가기',
            link: {
              mobileWebUrl: 'https://hsaju.com',
              webUrl: 'https://hsaju.com',
            },
          },
        ],
      });
    } catch (e) {
      console.error('카카오 공유 실패:', e);
      handleCopyLink();
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText('https://hsaju.com').then(() => {
      alert('🔗 링크가 복사되었습니다!\n친구에게 공유해보세요.');
    }).catch(() => {
      alert('링크 복사에 실패했습니다.');
    });
  }

  const handleLoginRequired = () => {
    if (!isLoggedIn) {
      if (confirm('로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?')) {
        router.push('/login');
      }
      return false;
    }
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginType');
    clearStoredToken();
    setIsLoggedIn(false);
    alert('로그아웃되었습니다.');
  };

  // 아코디언: 여러 개 동시 오픈 가능, 자동 스크롤 없음, 모바일 터치·시각 강조
  const megaOrder: MegaKey[] = ["identity", "talent", "relation", "insight", "solution"];
  const [openMegaSet, setOpenMegaSet] = useState<Set<MegaKey>>(new Set(["identity"]));
  const toggleMega = (k: MegaKey) => {
    setOpenMegaSet((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };
  const [kakaoReady, setKakaoReady] = useState(false);
  const [isChannelAdded, setIsChannelAdded] = useState(false);

  const CHANNEL_PUBLIC_ID = "_Ribbn";

  const [kakaoTokenOk, setKakaoTokenOk] = useState(false);
  const [selectedTone, setSelectedTone] = useState<CharKey>("empathy");

  useEffect(() => {
    if (!kakaoReady) return;
    try {
      const ok = !!window.Kakao?.Auth?.getAccessToken?.();
      setKakaoTokenOk(ok);
    } catch {
      setKakaoTokenOk(false);
    }
  }, [kakaoReady]);

  function handleKakaoLogin() {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "https://saju-backend-eqd6.onrender.com";
    window.location.href = `${backend}/auth/kakao/login`;
  }

  function handleFollowChannel() {
    // 1) Kakao SDK로 채널 추가 시도 (모바일 포함)
    if (typeof window !== "undefined" && (window as any).Kakao?.Channel?.addChannel) {
      (window as any).Kakao.Channel.addChannel({ channelPublicId: CHANNEL_PUBLIC_ID });
      return;
    }

    // 2) 플랜B: 채널 페이지 열기
    window.open(`https://pf.kakao.com/${CHANNEL_PUBLIC_ID}`, "_blank");
  }

  function handleChannelAddedDone() {
    localStorage.setItem("isChannelAdded", "true");
    setIsChannelAdded(true);
    alert("채널 추가 완료! 앞으로 업데이트/이벤트 소식을 빠르게 받아볼 수 있어요.");
  }

  const [sajuJsonRaw, setSajuJsonRaw] = useState<any>(null);
  const [interpLoading, setInterpLoading] = useState(false);
  const [selectedChar, setSelectedChar] = useState<CharKey>("empathy");

  useEffect(() => {
    const v = localStorage.getItem("isChannelAdded") === "true";
    setIsChannelAdded(v);
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  }, [result]);

  const goToPreviewCard = useCallback((index: number) => {
    const el = previewCarouselRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    el.scrollTo({ left: index * w, behavior: "smooth" });
    setPreviewCardIndex(index);
  }, []);

  useEffect(() => {
    if (result && birthYmd) {
      try {
        const parsedYmd = parseYmd(birthYmd);
        if (!parsedYmd) return;

        const birthYear = parsedYmd.year;
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

        const daeunNum = 5;
        const sinGangScore = 50;

        const fortune = analyzeFullFortune(
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

        setFortuneAnalysis(fortune);

        const dayPillar = result.day.cheongan.hanja + result.day.jiji.hanja;
        const charmText = CHARM_BY_PILLAR[dayPillar];
        if (charmText) setCharmAnalysis(charmText[selectedChar]);

        const dayStemTenGod = tenGod(dayStem, dayStem);
        const talentText = TALENT_BY_TEN_GOD[dayStemTenGod];
        if (talentText) setTalentAnalysis(talentText[selectedChar]);

        const strengthResult = analyzeStrength(
          dayStem,
          result.month.jiji.hanja,
          [result.year, result.month, result.day, result.hour],
          tenGod
        );
        setStrengthAnalysis(strengthResult);

        const relationsResult = analyzeRelations(
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
        setRelationsAnalysis(relationsResult);

        const specialResult = analyzeSpecialStars(result.day.cheongan.hanja, [
          {
            pos: "년",
            stem: result.year.cheongan.hanja,
            branch: result.year.jiji.hanja,
          },
          {
            pos: "월",
            stem: result.month.cheongan.hanja,
            branch: result.month.jiji.hanja,
          },
          {
            pos: "일",
            stem: result.day.cheongan.hanja,
            branch: result.day.jiji.hanja,
          },
          {
            pos: "시",
            stem: result.hour.cheongan.hanja,
            branch: result.hour.jiji.hanja,
          },
        ]);
        setSpecialStarsAnalysis(specialResult);
        setSpecialStarsVisual(
          getSpecialStarsVisualData(result.day.cheongan.hanja, [
            {
              pos: "년",
              stem: result.year.cheongan.hanja,
              branch: result.year.jiji.hanja,
            },
            {
              pos: "월",
              stem: result.month.cheongan.hanja,
              branch: result.month.jiji.hanja,
            },
            {
              pos: "일",
              stem: result.day.cheongan.hanja,
              branch: result.day.jiji.hanja,
            },
            {
              pos: "시",
              stem: result.hour.cheongan.hanja,
              branch: result.hour.jiji.hanja,
            },
          ])
        );

        const todayResult = analyzeTodayFortune(hanjaToElement(dayStem), selectedChar);
        setTodayFortune(todayResult);

        // 공망 분석
        const gongPillars = {
          year: result.year.cheongan.hanja + result.year.jiji.hanja,
          month: result.month.cheongan.hanja + result.month.jiji.hanja,
          day: result.day.cheongan.hanja + result.day.jiji.hanja,
          hour: result.hour.cheongan.hanja + result.hour.jiji.hanja,
        };
        const gongTxt = summarizeGongmang(gongPillars, selectedChar, dayStem);
        setGongmangAnalysis(gongTxt);
        setGongmangVisual(getGongmangVisualData(gongPillars, dayStem));

        // 감정 약점 및 보완 포인트
        const emotionalParams: EmotionalWeaknessParams = {
          dayStem,
          stems: [
            result.year.cheongan.hanja,
            result.month.cheongan.hanja,
            result.day.cheongan.hanja,
            result.hour.cheongan.hanja,
          ],
          branches: [
            result.year.jiji.hanja,
            result.month.jiji.hanja,
            result.day.jiji.hanja,
            result.hour.jiji.hanja,
          ],
          tone: selectedChar,
          tenGod,
        };

        const emotionalTxt = getEmotionalWeaknessParagraph(emotionalParams);
        setEmotionalWeakness(emotionalTxt);
        setEmotionTriggers(getEmotionTriggers(emotionalParams));

        // 주요 귀인 분석
        const guiinTxt = summarizeGuiin(
          dayStem,
          result.month.jiji.hanja,
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
          ],
          selectedChar
        );
        setGuiinAnalysis(guiinTxt);

        // 체질적인 건강 기운
        const healthParams: HealthAnalysisParams = {
          dayStem,
          stems: [
            result.year.cheongan.hanja,
            result.month.cheongan.hanja,
            result.day.cheongan.hanja,
            result.hour.cheongan.hanja,
          ] as [string, string, string, string],
          branches: [
            result.year.jiji.hanja,
            result.month.jiji.hanja,
            result.day.jiji.hanja,
            result.hour.jiji.hanja,
          ] as [string, string, string, string],
          tone: selectedChar,
          tenGod,
        };
        setHealthAnalysis(getHealthConstitutionParagraph(healthParams));
        setHealthBodyMap(getHealthBodyMapData(healthParams));

        // 행운의 아이템
        const luckyParams: LuckyItemParams = {
          stems: [
            result.year.cheongan.hanja,
            result.month.cheongan.hanja,
            result.day.cheongan.hanja,
            result.hour.cheongan.hanja,
          ] as [string, string, string, string],
          branches: [
            result.year.jiji.hanja,
            result.month.jiji.hanja,
            result.day.jiji.hanja,
            result.hour.jiji.hanja,
          ] as [string, string, string, string],
          tone: selectedChar,
        };
        setLuckyItems(getLuckyItemParagraph(luckyParams));

        const natureResult = NATURE_ANALYSIS.analyze(
          dayStem,
          [result.year, result.month, result.day, result.hour],
          selectedChar,
          gender
        );
        setNatureAnalysis(natureResult.text);
        setNatureYangCount(natureResult.yangCount);
        setNatureYinCount(natureResult.yinCount);

        // 🔥 사회적 가면 vs 실제 기질 분석 추가 (월간·월지·십이운성·시간·시지)
        const monthStemTenGod = tenGod(dayStem, result.month.cheongan.hanja);
        const monthBranchMainStem = branchMainStem(result.month.jiji.hanja);
        const monthBranchTenGod = monthBranchMainStem ? tenGod(dayStem, monthBranchMainStem) : "";
        const monthTwelveState = result.twelve_states?.month || "";
        const hourStemTenGod = tenGod(dayStem, result.hour.cheongan.hanja);
        const hourBranchMainStem = branchMainStem(result.hour.jiji.hanja);
        const hourBranchTenGod = hourBranchMainStem ? tenGod(dayStem, hourBranchMainStem) : "";

        const maskVsNatureResult = analyzeMaskVsNature(
          monthStemTenGod,
          monthBranchTenGod,
          monthTwelveState,
          hourStemTenGod,
          hourBranchTenGod,
          selectedChar
        );
        setMaskVsNatureAnalysis(maskVsNatureResult.text);
        setMaskVsNatureLabels({
          social: monthStemTenGod,
          real: hourStemTenGod,
          habit: hourBranchTenGod || hourStemTenGod,
        });

        // 7) 종합 요약 및 인생 가이드용 요약 데이터 계산 + GPT 호출
        try {
          const elemCount: Record<"목" | "화" | "토" | "금" | "수", number> = {
            목: 0,
            화: 0,
            토: 0,
            금: 0,
            수: 0,
          };
          const STEM_TO_EL: Record<string, "목" | "화" | "토" | "금" | "수"> = {
            甲: "목",
            乙: "목",
            丙: "화",
            丁: "화",
            戊: "토",
            己: "토",
            庚: "금",
            辛: "금",
            壬: "수",
            癸: "수",
          };
          const BRANCH_TO_EL: Record<string, "목" | "화" | "토" | "금" | "수"> = {
            寅: "목",
            卯: "목",
            巳: "화",
            午: "화",
            辰: "토",
            戌: "토",
            丑: "토",
            未: "토",
            申: "금",
            酉: "금",
            子: "수",
            亥: "수",
          };

          const stems = [
            result.year.cheongan.hanja,
            result.month.cheongan.hanja,
            result.day.cheongan.hanja,
            result.hour.cheongan.hanja,
          ];
          const branches = [
            result.year.jiji.hanja,
            result.month.jiji.hanja,
            result.day.jiji.hanja,
            result.hour.jiji.hanja,
          ];

          stems.forEach((s) => {
            const el = STEM_TO_EL[s[0]];
            if (el) elemCount[el] += 1;
          });
          branches.forEach((b) => {
            const el = BRANCH_TO_EL[b[0]];
            if (el) elemCount[el] += 1;
          });

          const sipsungInit: Record<
            "비견" | "겁재" | "식신" | "상관" | "정재" | "편재" | "정관" | "편관" | "정인" | "편인",
            number
          > = {
            비견: 0,
            겁재: 0,
            식신: 0,
            상관: 0,
            정재: 0,
            편재: 0,
            정관: 0,
            편관: 0,
            정인: 0,
            편인: 0,
          };
          const sipsungCount = { ...sipsungInit };
          const inc = (name: string) => {
            if (name && (sipsungCount as any)[name] !== undefined) {
              (sipsungCount as any)[name] += 1;
            }
          };
          stems.forEach((s) => {
            inc(tenGod(dayStem, s));
          });
          branches.forEach((b) => {
            const main = branchMainStem(b);
            if (main) inc(tenGod(dayStem, main));
          });

          const branchSet = new Set(branches);
          const hasPair = (a: string, b: string) => branchSet.has(a) && branchSet.has(b);

          const chung: ("자오충" | "묘유충" | "진술충" | "인신충" | "사해충" | "축미충")[] = [];
          if (hasPair("子", "午")) chung.push("자오충");
          if (hasPair("卯", "酉")) chung.push("묘유충");
          if (hasPair("辰", "戌")) chung.push("진술충");
          if (hasPair("寅", "申")) chung.push("인신충");
          if (hasPair("巳", "亥")) chung.push("사해충");
          if (hasPair("丑", "未")) chung.push("축미충");

          const hyung: ("인사신" | "축술미" | "자묘형")[] = [];
          if (branchSet.has("寅") && branchSet.has("巳") && branchSet.has("申")) hyung.push("인사신");
          if (branchSet.has("丑") && branchSet.has("戌") && branchSet.has("未")) hyung.push("축술미");
          if (hasPair("子", "卯")) hyung.push("자묘형");

          const shingangLevel =
            strengthResult?.type === "신강"
              ? "신강"
              : strengthResult?.type === "신약"
              ? "신약"
              : ("중간" as const);

          const summaryInput: SummaryInput = {
            dayStem,
            elements: elemCount,
            sipsung: sipsungCount,
            chung,
            hyung,
            shingang: shingangLevel,
          };

          const promptData = buildSummaryPromptData(summaryInput);
          const userPrompt = buildSummaryUserPrompt(promptData);

          fetch(`${API_BASE}/saju/summary-gpt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system: SUMMARY_SYSTEM_PROMPT,
              user: userPrompt,
            }),
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error(`summary-gpt ${res.status}`);
              }
              return res.json();
            })
            .then((summaryJson) => {
              if (summaryJson?.summary) {
                setSummaryGuide(summaryJson.summary);
              } else {
                if (summaryJson?.error) console.warn("종합 요약 API 응답:", summaryJson.error);
                setSummaryGuide(getSummaryGuideFallback(summaryInput));
              }
            })
            .catch((e) => {
              console.error("종합 요약 생성 오류:", e);
              setSummaryGuide(getSummaryGuideFallback(summaryInput));
            });
        } catch (e) {
          console.error("종합 요약 준비 오류:", e);
          setSummaryGuide(null);
        }

      } catch (error) {
        console.error("대운세운 분석 오류:", error);
      }
    }
  }, [result, birthYmd, gender, selectedChar]);

  const getDayPillarAnimalText = useMemo(() => {
    if (!result) return null;
    const dayPillarKey = result.day.cheongan.hangul + result.day.jiji.hangul;
    const texts = dayPillarTexts[dayPillarKey];
    if (!texts) return null;
    return texts[selectedTone];
  }, [result, selectedTone]);

  // 첫 문장에 포함된 색깔(예: 하늘빛, 초록빛)로 첫 문장만 해당 색상 적용
  const DAY_PILLAR_COLOR_MAP: Record<string, string> = {
    하늘빛: "#4A90D9",
    초록빛: "#2E7D32",
    연두빛: "#9ACD32",
    주황빛: "#FF8C00",
    노랑빛: "#F9A825",
    연노랑빛: "#FDD835",
    은빛: "#9E9E9E",
    파랑빛: "#1976D2",
    붉은빛: "#C62828",
  };
  const formatDayPillarWithFirstSentenceColor = (text: string): string => {
    const firstEnd = text.search(/[.。!?]/);
    const firstSentence = firstEnd >= 0 ? text.slice(0, firstEnd + 1) : text;
    const rest = firstEnd >= 0 ? text.slice(firstEnd + 1) : "";
    const colorMatch = firstSentence.match(/(\S+빛)/);
    const hex = colorMatch ? DAY_PILLAR_COLOR_MAP[colorMatch[1]] : null;
    const escapedFirst = firstSentence
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/&lt;strong&gt;/g, "<strong>")
      .replace(/&lt;\/strong&gt;/g, "</strong>");
    // 이스케이프 후 <strong>/</strong>만 복원해 볼드가 렌더되도록 함
    const restEscaped = rest
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/&lt;strong&gt;/g, "<strong>")
      .replace(/&lt;\/strong&gt;/g, "</strong>");
    const restWithBr = restEscaped.replace(/\n/g, "<br />");
    // 첫 문장(예: "당신의 일주 동물은 ~입니다.") 다음 무조건 줄바꿈
    const brAfterFirst = "<br />";
    if (hex) {
      return `<span style="color:${hex};font-weight:600">${escapedFirst}</span>${brAfterFirst}${restWithBr}`;
    }
    return escapedFirst + brAfterFirst + restWithBr;
  };

  const contentWithImage = useMemo(() => {
    if (!result || !getDayPillarAnimalText) return null;

    const dayPillarKey = result.day.cheongan.hangul + result.day.jiji.hangul;
    const imagePath = `/images/day_pillars/${dayPillarKey}.png`;
    const bodyHtml = formatDayPillarWithFirstSentenceColor(getDayPillarAnimalText);

    return `
    <div style="
      max-height: 500px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      padding: 1rem 0;
    ">
      <div style="
        width: 100%;
        max-width: min(300px, 90vw);
        height: auto;
        max-height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
      ">
        <img 
          src="${imagePath}" 
          alt="${dayPillarKey} 일주 동물"
          style="
            width: 100%;
            height: 100%;
            max-height: 400px;
            object-fit: contain;
            border-radius: 0.75rem;
          "
          onerror="this.style.display='none'"
        />
      </div>
    </div>
    <div style="margin-top: 1rem; line-height: 1.8; text-align: left;">
      ${bodyHtml}
    </div>
  `;
  }, [result, getDayPillarAnimalText]);

  const chars8 = useMemo(() => {
    if (!result) return [];
    const p = [result.hour, result.day, result.month, result.year];
    return [
      p[0].cheongan.hanja,
      p[0].jiji.hanja,
      p[1].cheongan.hanja,
      p[1].jiji.hanja,
      p[2].cheongan.hanja,
      p[2].jiji.hanja,
      p[3].cheongan.hanja,
      p[3].jiji.hanja,
    ].filter(Boolean);
  }, [result]);

  const elementSummary = useMemo(() => {
    const buckets: Record<string, string[]> = {
      wood: [],
      fire: [],
      earth: [],
      metal: [],
      water: [],
    };
    for (const ch of chars8) {
      const el = hanjaToElement(ch);
      if (el !== "none") buckets[el].push(ch);
    }
    return buckets;
  }, [chars8]);

  const pillars = useMemo(() => {
    if (!result) return [];
    return [result.hour, result.day, result.month, result.year];
  }, [result]);

  const megaCards = useMemo(() => {
    if (!result) return {
      identity: [],
      talent: [],
      relation: [],
      insight: [],
      solution: [],
    };

    const dayPillarText = getDayPillarAnimalText;

    // 🔥 백엔드에서 온 core_values 섹션(월지 기반 가치관/지향점) 추출
    let coreValuesContent: string | null = null;
    const interps: any[] = Array.isArray(newInterpretation?.interpretations)
      ? newInterpretation.interpretations
      : [];

    for (const it of interps) {
      if (it && it.section === "core_values" && typeof it.content === "string") {
        coreValuesContent = it.content;
        break;
      }
    }

    const base: Record<MegaKey, MegaCard[]> = {
      identity: MEGA_SECTIONS.identity.items
        .filter(item => item.key !== "animal" && item.key !== "nature" && item.key !== "persona")
        .map((it) => {
          // 🔥 "삶의 핵심적인 가치관과 지향점" 슬롯: 백엔드 core_values 우선, 없으면 data/coreValuesAnalysis 로컬 폴백 (3가지 말투)
          if (it.key === "values") {
            const content =
              coreValuesContent ??
              (result
                ? getCoreValuesParagraph({
                    monthBranchHanja: result.month?.jiji?.hanja ?? "",
                    dayStemHanja: result.day?.cheongan?.hanja ?? "",
                    tone: selectedChar,
                    getBranchMainStem: branchMainStem,
                    getTenGod: tenGod,
                  })
                : null);
            if (content) {
              return asContent(
                "identity_values",
                it.title,
                content,
                it.icon,
                coreValuesContent ? "gpt" : "local"
              );
            }
          }
          return asReady(`identity_${it.key}`, it.title, it.icon);
        }),
      talent: MEGA_SECTIONS.talent.items.map((it) => {
        if (it.key === "strengthWeak" && result) {
          const content = getStrengthWeaknessParagraph(result, selectedChar);
          return asContent("talent_strengthWeak", it.title, content, it.icon, "local");
        }
        if (it.key === "aptitude" && result) {
          const content = getLatentTalentAptitudeParagraph(result, selectedChar);
          return asContent("talent_aptitude", it.title, content, it.icon, "local");
        }
        if (it.key === "elements" && result) {
          const content = getElementDistributionParagraph(result, selectedChar);
          return asContent("talent_elements", it.title, content, it.icon, "local");
        }
        if (it.key === "tengod" && result) {
          const content = getTenGodAbilityParagraph(result, selectedChar);
          return asContent("talent_tengod", it.title, content, it.icon, "local");
        }
        return asReady(`talent_${it.key}`, it.title, it.icon);
      }),
      relation: MEGA_SECTIONS.relation.items.map((it) => {
        if (it.key === "comm" && result) {
          const content = getRelationshipStyleParagraph(result, selectedChar);
          return asContent("relation_comm", it.title, content, it.icon, "local");
        }
        if (it.key === "parents" && result) {
          const content = getAncestorParentParagraph(result, gender, selectedChar);
          return asContent("relation_parents", it.title, content, it.icon, "local");
        }
        if (it.key === "charisma" && result) {
          const content = getCharismaSocialInfluenceParagraph(result, selectedChar);
          return asContent("relation_charisma", it.title, content, it.icon, "local");
        }
        if (it.key === "hapchung" && result) {
          const content = getCharmPointParagraph(result, selectedChar);
          return asContent("relation_hapchung", it.title, content, it.icon, "local");
        }
        return asReady(`relation_${it.key}`, it.title, it.icon);
      }),
      insight: [],
      solution: MEGA_SECTIONS.solution.items.map((it) => {
        if (it.key === "health" && healthAnalysis) {
          return asContent("solution_health", it.title, healthAnalysis, it.icon, "local");
        }
        if (it.key === "lucky" && luckyItems) {
          return asContent("solution_lucky", it.title, luckyItems, it.icon, "local");
        }
        if (it.key === "summary" && summaryGuide) {
          return asContent("solution_summary", it.title, summaryGuide, it.icon, "gpt");
        }
        return asReady(`solution_${it.key}`, it.title, it.icon);
      }),
    };

    // 🔥 사회적 가면 vs 실제 기질 추가
    if (maskVsNatureAnalysis) {
      base.identity.unshift(
        asContent(
          "identity_persona",
          "사회적 가면과 실제 기질의 차이",
          maskVsNatureAnalysis,
          "🎪",
          "local"
        )
      );
    }

    if (natureAnalysis) {
      base.identity.unshift(
        asContent("nature_text", "타고난 기질과 기운", natureAnalysis, "✨", "local")
      );
    }

    if (contentWithImage) {
      base.identity.unshift(
        asContent(
          "day_pillar_animal",
          "일주 동물의 형상과 본성",
          contentWithImage,
          "🦁",
          "local"
        )
      );
    }

    if (specialStarsAnalysis?.[selectedChar]) {
      base.insight.unshift(
        asContent("stars_text", "특수신살/신살", specialStarsAnalysis[selectedChar], "⭐", "local")
      );
    }
    if (gongmangAnalysis) {
      base.insight.unshift(
        asContent("insight_gongmang", "공망 분석", gongmangAnalysis, "🕳", "local")
      );
    }
    if (emotionalWeakness) {
      const emotionTitle =
        selectedChar === "empathy"
          ? "마음 약점"
          : selectedChar === "reality"
          ? "스트레스 포인트"
          : "멘탈 약점";
      base.insight.unshift(
        asContent("insight_emotion", emotionTitle, emotionalWeakness, "🧘", "local")
      );
    }
    if (guiinAnalysis) {
      base.insight.unshift(
        asContent("insight_guiin", "주요 귀인 분석", guiinAnalysis, "👼", "local")
      );
    }
    // 🔥 나머지 GPT 해석들은 기존처럼 제목 기반으로 섹션 분류
    //    단, core_values 섹션은 위에서 이미 values 슬롯에 꽂았으니 여기서는 제외
    const elementTitles = Object.values(ELEMENT_ANALYSIS).map((e) => e.title);
    for (let i = 0; i < interps.length; i++) {
      const it = interps[i];
      if (it?.section === "core_values") continue;
      const title = String(it?.title ?? "").trim();
      const content = String(it?.content ?? "").trim();
      if (!title || !content) continue;
      if (elementTitles.includes(title)) continue; // 당신의 오행 에너지 등 오행 에너지 카드 제외

      const where = classifyMegaByTitle(title);
      if (!where) continue;

      base[where].unshift(asContent(`gpt_${where}_${i}`, title, content, "🔮", "gpt"));
    }

    return base;
  }, [
    newInterpretation,
    relationsAnalysis,
    specialStarsAnalysis,
    todayFortune,
    natureAnalysis,
    maskVsNatureAnalysis,  // 🔥 추가
    selectedChar,
    getDayPillarAnimalText,
    result,
    gender,
  ]);

  /** 삶의 나침반 시각화용 데이터 (월지·일간 기준) */
  const coreValuesCompassData = useMemo(() => {
    if (!result) return null;
    return getCoreValuesCompassData(
      result.month?.jiji?.hanja ?? "",
      result.day?.cheongan?.hanja ?? "",
      branchMainStem,
      tenGod,
      selectedChar
    );
  }, [result, selectedChar]);

  const strengthWeakVisualData = useMemo(() => {
    if (!result) return null;
    return getStrengthWeaknessVisualData(result, selectedChar);
  }, [result, selectedChar]);

  const aptitudeSpectrumData = useMemo(() => {
    if (!result) return null;
    return getAptitudeSpectrumData(result);
  }, [result]);

  const elementDistributionVisualData = useMemo(() => {
    if (!result) return null;
    return getElementDistributionVisualData(result, selectedChar);
  }, [result, selectedChar]);

  const tenGodAbilityCardsData = useMemo(() => {
    if (!result) return null;
    return getTenGodAbilityCardsData(result, selectedChar);
  }, [result, selectedChar]);

  const relationshipVisualData = useMemo(() => {
    if (!result) return null;
    return getRelationshipStyleVisualData(result, selectedChar);
  }, [result, selectedChar]);

  const ancestorVisualData = useMemo(() => {
    if (!result) return null;
    return getAncestorParentVisualData(result, gender, selectedChar);
  }, [result, gender, selectedChar]);

  const charismaVisualData = useMemo(() => {
    if (!result) return null;
    return getCharismaVisualData(result, selectedChar);
  }, [result, selectedChar]);

  const charmVisualData = useMemo(() => {
    if (!result) return null;
    return getCharmVisualData(result, selectedChar);
  }, [result, selectedChar]);

  async function requestInterpretation() {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true" || kakaoTokenOk;
    if (!loggedIn) {
      alert("카카오 로그인이 필요합니다.");
      return;
    }

    if (!sajuJsonRaw) return;

    setInterpLoading(true);
    setLoading(true);
    setErr("");
    // 로딩 시작 시 기본 문구와 진행률 바로 세팅
    setLoadingProgress(0);
    setLoadingMessage("사주 해석을 준비하는 중이에요...");

    const char = CHARACTERS[selectedChar];
    const stages = char.progressMessages;
    let progress = 0;
    let stageIndex = 0;
    let messageChangeCounter = 0;  // 🔥 추가

    const progressInterval = setInterval(() => {
      if (progress < 98) {  // 🔥 98%까지만
        progress += Math.random() * 2 + 1;  // 🔥 1~3% 증가
        if (progress > 98) progress = 98;  // 🔥 98%에서 멈춤
        setLoadingProgress(Math.floor(progress));

        if (progress < 33) {
          stageIndex = 0;
        } else if (progress < 66) {
          stageIndex = 1;
        } else {
          stageIndex = 2;
        }

        // 🔥 3초마다 대사 변경
        messageChangeCounter++;
        if (messageChangeCounter % 6 === 0) {
          const stageKey = `stage${stageIndex + 1}` as "stage1" | "stage2" | "stage3";
          const messages = stages[stageKey];
          const randomMsg = messages[Math.floor(Math.random() * messages.length)];
          setLoadingMessage(randomMsg);
        }
      }
    }, 500);

    try {
      const parsedYmd = parseYmd(birthYmd);
      const parsedHm = timeUnknown ? { hour: 12, minute: 0 } : parseHm(birthHm);
      if (!parsedYmd || !parsedHm) {
        clearInterval(progressInterval);
        setLoading(false);
        setInterpLoading(false);
        return;
      }

      const interpretRes = await fetch(`${API_BASE}/saju/interpret-gpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_stem: sajuJsonRaw.day_pillar[0],
          year_pillar: sajuJsonRaw.year_pillar,
          month_pillar: sajuJsonRaw.month_pillar,
          day_pillar: sajuJsonRaw.day_pillar,
          hour_pillar: sajuJsonRaw.hour_pillar,
          tone: selectedChar,
          year: parsedYmd.year,
          month: parsedYmd.month,
          day: parsedYmd.day,
          hour: parsedHm.hour,
          gender: gender,
        }),
      });

      const interpretJson = await interpretRes.json();
      setNewInterpretation(interpretJson);
    } catch (e) {
      console.error(e);
      setNewInterpretation({
        title: ELEMENT_ANALYSIS[selectedChar].title,
        content: "해석을 불러오는 중 오류가 발생했습니다.",
        metadata: { harmony: null },
        interpretations: [],
      });
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(100);  // 🔥 완료되면 100%
      setLoading(false);
      setLoadingMessage("");
      setInterpLoading(false);
    }
  }

  /** API로 사주 분석 요청 (다른 페이지/버튼에서 호출 가능) */
  async function run() {
    const parsedYmd = parseYmd(birthYmd);
    const parsedHm = timeUnknown ? { hour: 12, minute: 0 } : parseHm(birthHm);
    if (!parsedYmd || !parsedHm) return;

    setErr("");
    setResult(null);
    setNewInterpretation(null);
    setShowFortune(false);
    setShowCharm(false);
    setShowTalent(false);
    setShowStrength(false);
    setShowRelations(false);
    setShowSpecialStars(false);
    setShowToday(false);

    const requestBody = {
      calendar_type: calendar,
      year: parsedYmd.year,
      month: parsedYmd.month,
      day: parsedYmd.day,
      hour: parsedHm.hour,
      minute: parsedHm.minute,
      gender,
    };

    try {
      const sajuRes = await fetch(`${API_BASE}/saju/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const sajuJson = await sajuRes.json();

      if (!sajuRes.ok) {
        setErr(typeof sajuJson?.detail === "string" ? sajuJson.detail : JSON.stringify(sajuJson));
        return;
      }

      setSajuJsonRaw(sajuJson);

      const [hourCheongan, hourJiji] = splitPillar(sajuJson.hour_pillar);
      const [dayCheongan, dayJiji] = splitPillar(sajuJson.day_pillar);
      const [monthCheongan, monthJiji] = splitPillar(sajuJson.month_pillar);
      const [yearCheongan, yearJiji] = splitPillar(sajuJson.year_pillar);

      const hourBlock: PillarBlock = { label: "시주", cheongan: hourCheongan, jiji: hourJiji };
      const dayBlock: PillarBlock = { label: "일주", cheongan: dayCheongan, jiji: dayJiji };
      const monthBlock: PillarBlock = { label: "월주", cheongan: monthCheongan, jiji: monthJiji };
      const yearBlock: PillarBlock = { label: "년주", cheongan: yearCheongan, jiji: yearJiji };

      setResult({
        hour: hourBlock,
        day: dayBlock,
        month: monthBlock,
        year: yearBlock,
        twelve_states: sajuJson.twelve_states,
        jijanggan: sajuJson.jijanggan,
      });
    } catch (e: any) {
      setErr(e?.message ?? "네트워크 오류");
    }
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        {/* gmarketsans 웹폰트 로드 */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/webfontworld/gmarket/GmarketSans.css" />
      </Head>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.8.0/kakao.min.js"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        onLoad={() => {
          console.log("=== Kakao SDK 로딩 시작 ===");
          try {
            if (!window.Kakao) {
              console.error("❌ window.Kakao 없음");
              return;
            }

            const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
            if (!key) {
              console.error("❌ NEXT_PUBLIC_KAKAO_JS_KEY 값 비어있음");
              return;
            }

            if (!window.Kakao.isInitialized()) {
              window.Kakao.init(key);
              console.log("✅ Kakao 초기화 완료:", window.Kakao.isInitialized());
            } else {
              console.log("✅ Kakao 이미 초기화됨");
            }

            setKakaoReady(true);
          } catch (err) {
            console.error("❌ Kakao 초기화 오류:", err);
          }
        }}
        onError={() => {
          console.error("❌ Kakao SDK 스크립트 로딩 실패 (네트워크/CSP/차단 가능)");
        }}
      />

      <style>{`
        :root {
          --bg-base: ${S.cream};
          --bg-surface: ${S.cream2};
          --bg-input: ${S.cream3};
          --text-primary: ${S.ink};
          --text-secondary: ${S.ink3};
          --text-placeholder: ${S.beige2};
          --border-default: ${S.beige};
          --border-focus: ${S.gold};
          --brand-primary: ${S.gold};
        }
        * { font-family: ${S.fontBody}; }
        .saju-serif { font-family: ${S.fontDisplay}; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${S.beige}; border-radius: 99px; }
        .add-preview-carousel { display:flex; overflow-x:auto; overflow-y:hidden; scroll-snap-type:x mandatory; scroll-behavior:smooth; -webkit-overflow-scrolling:touch; scrollbar-width:none; -ms-overflow-style:none; }
        .add-preview-carousel::-webkit-scrollbar { display:none; }
        .add-preview-card { flex:0 0 100%; min-width:100%; scroll-snap-align:start; scroll-snap-stop:always; padding:0 2px; box-sizing:border-box; }
        .pillar-cell { transition: background 0.15s; }
      `}</style>

      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: S.cream, backgroundImage: "url('/images/hanji-bg.png')", backgroundRepeat: "repeat", backgroundSize: "auto", position: "relative", zIndex: 10 }}>
        <div style={{ width: "100%", maxWidth: 450, margin: "0 auto" }}>
          <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 24px rgba(44,36,23,0.10)", background: "#fff", border: `1px solid ${S.beige}`, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/hanji-bg.png')", backgroundRepeat: "repeat", backgroundSize: "auto", opacity: 0.04, pointerEvents: "none", zIndex: 0 }} />
            <header style={{
              height: 56,
              background: S.cream,
              borderBottom: `1px solid ${S.beige}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px",
              flexShrink: 0, zIndex: 100,
              ...(result ? { position: "fixed" as const, top: 0, left: 0, right: 0, margin: "0 auto", maxWidth: 450, borderRadius: 0 } : { position: "relative" as const }),
            }}>
              <button onClick={() => router.push("/home")} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: S.ink }}>
                <Icon icon="mdi:chevron-left" width={24} />
              </button>
              <h1 className="saju-serif" style={{ fontSize: 17, fontWeight: 600, color: S.ink, letterSpacing: "0.04em" }}>한양사주 AI</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {(result || isLoggedIn) ? (
                  <>
                    <button onClick={() => router.push("/seed-charge")} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "5px 9px", borderRadius: 6, background: S.cream2, border: `1px solid ${S.beige}`, cursor: "pointer", color: S.ink }}>
                      <Icon icon="mdi:ticket-confirmation-outline" width={15} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{seedCount}</span>
                    </button>
                    <button onClick={() => router.push("/membership")} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "5px 9px", borderRadius: 6, background: S.cream2, border: `1px solid ${S.beige}`, cursor: "pointer", color: S.gold }}>
                      <Icon icon="mdi:crown-outline" width={15} />
                      <span style={{ fontSize: 11, fontWeight: 700 }}>Pro</span>
                    </button>
                    <button onClick={() => router.push("/saju-mypage")} style={{ padding: 6, background: "transparent", border: "none", cursor: "pointer", color: S.ink, display: "flex", alignItems: "center" }}>
                      <Icon icon="mdi:menu" width={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => router.push("/login")} style={{ padding: "6px 11px", fontSize: 13, fontWeight: 600, color: S.ink, background: "transparent", border: `1px solid ${S.beige}`, borderRadius: 6, cursor: "pointer" }}>로그인</button>
                    <button onClick={() => router.push("/signup")} style={{ padding: "6px 11px", fontSize: 13, fontWeight: 700, color: "#fff", background: S.gold, border: "none", borderRadius: 6, cursor: "pointer" }}>회원가입</button>
                  </>
                )}
              </div>
            </header>

            {result && <div style={{ height: 56 }} aria-hidden />}
            <div
              style={result ? { position: "relative" as const, padding: 0, background: S.cream, minHeight: "100%" } : undefined}
              className={result ? undefined : "relative p-5"}
            >
              {!result && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "image-set(url('/images/hamster-forest.webp') type('image/webp') 1x, url('/images/hamster-forest.png') type('image/png') 1x)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: 0.6,
                    filter: "saturate(1.1) contrast(1.08)",
                    transform: "scale(1.03)",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
              )}
              <div
                style={
                  result
                    ? { position: "relative" as const, zIndex: 10, padding: 0, width: "100%", maxWidth: "100%", borderRadius: 0, boxShadow: "none" }
                    : undefined
                }
                className={result ? undefined : "relative z-10 rounded-2xl shadow-xl mx-auto p-4 sm:p-6 max-w-[420px]"}
              >
                {err && !loading && !result && (
                  <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, border: `1px solid #e5c0c0`, background: "#fdf4f4", fontSize: 12, color: S.red, whiteSpace: "pre-wrap" }}>
                    {err}
                  </div>
                )}

                {typeof window !== "undefined" && loading ? createPortal(
                  <div style={{ position: "fixed", left: 0, top: 0, width: "100vw", height: "100dvh", background: "rgba(245,241,234,0.96)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 2147483647, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, touchAction: "none" }}>
                    <div style={{ background: "#fff", border: `1px solid ${S.beige}`, borderRadius: 16, padding: "36px 28px", width: "88vw", maxWidth: 400, textAlign: "center", boxShadow: "0 8px 40px rgba(44,36,23,0.10)" }}>
                      <motion.div initial={{ scale: 0.6, y: 30, opacity: 0 }} animate={{ scale: [0.6, 1.15, 1], y: [30, -10, 0], opacity: 1 }} transition={{ duration: 0.7, times: [0, 0.6, 1], ease: "easeOut" }} style={{ marginBottom: 20 }}>
                        <img src={CHARACTERS[selectedChar].img} alt="" style={{ width: 100, height: 100, objectFit: "contain", margin: "0 auto", display: "block" }} />
                      </motion.div>
                      <motion.p key={loadingMessage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="saju-serif" style={{ color: S.ink, fontSize: 14, fontWeight: 500, lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: 24, minHeight: 48 }}>
                        {loadingMessage}
                      </motion.p>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: S.ink3 }}>분석 중</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: S.gold }}>{loadingProgress}%</span>
                        </div>
                        <div style={{ height: 4, background: S.cream3, borderRadius: 99, overflow: "hidden" }}>
                          <motion.div style={{ height: "100%", background: `linear-gradient(90deg, ${S.gold}, ${S.goldLight})`, borderRadius: 99 }} animate={{ width: `${loadingProgress}%` }} transition={{ duration: 0.3, ease: "linear" }} />
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                ) : null}

                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    {loading ? null : !result ? null : (
                      <motion.div
                        ref={resultRef}
                        key="result"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.45 }}
                        style={{ paddingTop: 20, paddingLeft: 16, paddingRight: 16, paddingBottom: 32, maxWidth: 520, margin: "0 auto", width: "100%", boxSizing: "border-box" }}
                      >
                        <div style={{ marginBottom: 20 }}>
                          <div ref={previewCarouselRef} className="add-preview-carousel"
                            onScroll={() => {
                              const el = previewCarouselRef.current;
                              if (!el) return;
                              setPreviewCardIndex(Math.min(2, Math.max(0, Math.round(el.scrollLeft / el.offsetWidth))));
                            }}
                          >
                            <div className="add-preview-card">
                              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${S.beige}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(44,36,23,0.06)" }}>
                                <div style={{ height: 3, background: S.gold, width: "100%" }} />
                                <div style={{ padding: "22px 20px", textAlign: "center", minHeight: 120 }}>
                                  <p className="saju-serif" style={{ fontSize: 11, fontWeight: 600, color: S.ink3, letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>일주 동물</p>
                                  {result && (() => {
                                    const key = result.day.cheongan.hangul + result.day.jiji.hangul;
                                    return (
                                      <img src={`/images/day_pillars/${key}.png`} alt={key} style={{ width: 80, height: 80, objectFit: "contain", margin: "0 auto 10px", display: "block" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                    );
                                  })()}
                                  <p className="saju-serif" style={{ fontSize: 15, fontWeight: 600, color: S.ink, letterSpacing: "0.06em" }}>
                                    {result.day.cheongan.hangul}{result.day.jiji.hangul}일주
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="add-preview-card">
                              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${S.beige}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(44,36,23,0.06)" }}>
                                <div style={{ height: 3, background: S.gold, width: "100%" }} />
                                <div style={{ padding: "22px 20px", minHeight: 120 }}>
                                  <p className="saju-serif" style={{ fontSize: 11, fontWeight: 600, color: S.ink3, letterSpacing: "0.1em", marginBottom: 16 }}>기본 정보</p>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {[
                                      { label: "생년월일", value: birthYmd ? `${birthYmd.slice(0,4)}.${birthYmd.slice(4,6)}.${birthYmd.slice(6,8)}` : "—" },
                                      { label: "시각", value: timeUnknown ? "미상" : birthHm ? `${birthHm.slice(0,2)}:${birthHm.slice(2,4)}` : "—" },
                                      { label: "성별", value: gender === "M" ? "남자" : "여자" },
                                      { label: "달력", value: calendar === "solar" ? "양력" : "음력" },
                                    ].map(row => (
                                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${S.cream3}` }}>
                                        <span style={{ fontSize: 12, color: S.ink3 }}>{row.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: S.ink }}>{row.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="add-preview-card">
                              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${S.beige}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(44,36,23,0.06)" }}>
                                <div style={{ height: 3, background: S.gold, width: "100%" }} />
                                <div style={{ padding: "20px 16px" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                    <p className="saju-serif" style={{ fontSize: 11, fontWeight: 600, color: S.ink3, letterSpacing: "0.1em" }}>내 사주팔자</p>
                                    <div style={{ display: "flex", background: S.cream2, borderRadius: 6, padding: 2, border: `1px solid ${S.beige}` }}>
                                      {(["hanja", "hangul"] as const).map(mode => (
                                        <button key={mode} type="button" onClick={() => setScriptMode(mode)} style={{ padding: "3px 9px", borderRadius: 4, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", background: scriptMode === mode ? S.gold : "transparent", color: scriptMode === mode ? "#fff" : S.ink3 }}>{mode === "hanja" ? "한자" : "한글"}</button>
                                      ))}
                                    </div>
                                  </div>
                                  <div style={{ border: `1.5px solid ${S.beige}`, borderRadius: 10, overflow: "hidden" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: S.cream2, borderBottom: `1.5px solid ${S.beige}` }}>
                                      {["시주","일주","월주","년주"].map((label, i) => (
                                        <div key={label} style={{ padding: "7px 4px", textAlign: "center", fontSize: 10, fontWeight: 700, color: S.ink3, borderRight: i < 3 ? `1px solid ${S.beige}` : "none" }}>
                                          {label}
                                        </div>
                                      ))}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: S.cream, borderBottom: `1px solid ${S.cream3}` }}>
                                      {pillars.map((p, i) => (
                                        <div key={i} style={{ padding: "5px 4px", textAlign: "center", fontSize: 10, color: S.ink3, borderRight: i < 3 ? `1px solid ${S.cream3}` : "none" }}>
                                          {tenGod(result.day.cheongan.hanja, p.cheongan.hanja)}
                                        </div>
                                      ))}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: `1.5px solid ${S.beige}` }}>
                                      {pillars.map((p, i) => {
                                        const el = hanjaToElement(p.cheongan.hanja);
                                        const bgMap: Record<string, string> = { wood: "#e8f5ee", fire: "#fdecea", earth: "#fdf5e8", metal: "#eef0f4", water: "#e8eef8", none: "#f9f9f9" };
                                        return (
                                          <div key={i} className="pillar-cell" style={{ padding: "10px 4px", textAlign: "center", background: bgMap[el] ?? "#fff", borderRight: i < 3 ? `1.5px solid ${S.beige}` : "none" }}>
                                            <span className="saju-serif" style={{ fontSize: 22, fontWeight: 700, color: ELEMENT_COLOR[el] ?? S.ink }}>
                                              {scriptMode === "hanja" ? p.cheongan.hanja : p.cheongan.hangul}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: `1px solid ${S.cream3}` }}>
                                      {pillars.map((p, i) => {
                                        const el = hanjaToElement(p.jiji.hanja);
                                        const bgMap: Record<string, string> = { wood: "#f0faf4", fire: "#fff5f4", earth: "#fffbf0", metal: "#f4f5f7", water: "#f0f4fc", none: "#fafafa" };
                                        return (
                                          <div key={i} className="pillar-cell" style={{ padding: "10px 4px", textAlign: "center", background: bgMap[el] ?? "#fff", borderRight: i < 3 ? `1px solid ${S.cream3}` : "none" }}>
                                            <span className="saju-serif" style={{ fontSize: 22, fontWeight: 700, color: ELEMENT_COLOR[el] ?? S.ink }}>
                                              {scriptMode === "hanja" ? p.jiji.hanja : p.jiji.hangul}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: S.cream, borderBottom: `1px solid ${S.cream3}` }}>
                                      {pillars.map((p, i) => {
                                        const ms = branchMainStem(p.jiji.hanja);
                                        return (
                                          <div key={i} style={{ padding: "5px 4px", textAlign: "center", fontSize: 10, color: S.ink3, borderRight: i < 3 ? `1px solid ${S.cream3}` : "none" }}>
                                            {ms ? tenGod(result.day.cheongan.hanja, ms) : ""}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {result.jijanggan && (
                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: S.cream2, borderBottom: `1px solid ${S.cream3}` }}>
                                        {pillars.map((p, i) => {
                                          const list = i === 0 ? result.jijanggan!.hour : i === 1 ? result.jijanggan!.day : i === 2 ? result.jijanggan!.month : result.jijanggan!.year;
                                          return (
                                            <div key={i} style={{ padding: "6px 4px", textAlign: "center", borderRight: i < 3 ? `1px solid ${S.cream3}` : "none" }}>
                                              {list?.map((jj: any, idx: number) => (
                                                <span key={idx} style={{ fontSize: 9, fontWeight: 700, color: ELEMENT_COLOR[jj.element] ?? S.ink, display: "block", lineHeight: 1.6 }}>
                                                  {scriptMode === "hanja" ? jj.hanja : jj.hangul}
                                                </span>
                                              ))}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {result.twelve_states && (
                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: S.cream }}>
                                        {pillars.map((p, i) => (
                                          <div key={i} style={{ padding: "5px 4px", textAlign: "center", fontSize: 9, color: S.ink3, borderRight: i < 3 ? `1px solid ${S.cream3}` : "none" }}>
                                            {i === 0 && result.twelve_states!.hour}{i === 1 && result.twelve_states!.day}{i === 2 && result.twelve_states!.month}{i === 3 && result.twelve_states!.year}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
                            {[0, 1, 2].map(i => (
                              <button key={i} type="button" onClick={() => goToPreviewCard(i)} style={{ width: previewCardIndex === i ? 18 : 6, height: 6, borderRadius: 99, border: "none", padding: 0, cursor: "pointer", background: previewCardIndex === i ? S.gold : S.beige, transition: "all 0.2s" }} />
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                          <div style={{ flex: 1, height: 1, background: S.beige }} />
                          <span className="saju-serif" style={{ fontSize: 11, color: S.ink3, letterSpacing: "0.12em" }}>사주 분석</span>
                          <div style={{ flex: 1, height: 1, background: S.beige }} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {megaOrder.map(k => {
                            const sec = MEGA_SECTIONS[k];
                            const isOpen = openMegaSet.has(k);
                            const cards = megaCards[k] || [];
                            return (
                              <div key={k} style={{ border: `1px solid ${isOpen ? S.beige2 : S.beige}`, borderRadius: 12, overflow: "visible", background: isOpen ? "#fff" : S.cream, transition: "border 0.15s, background 0.15s" }}>
                                <button type="button" onClick={() => toggleMega(k)} style={{ width: "100%", minHeight: 46, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 13 }}>{sec.icon}</span>
                                    <span className="saju-serif" style={{ fontSize: 14, fontWeight: 600, color: S.ink, letterSpacing: "0.02em" }}>{sec.title}</span>
                                  </div>
                                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.15 }} style={{ color: S.ink3 }} aria-hidden>
                                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  </motion.span>
                                </button>

                                  <AnimatePresence initial={false}>
                                    {isOpen && (
                                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.16, ease: "easeOut" }} style={{ overflow: "visible" }}>
                                        <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${S.cream3}`, overflow: "visible" }}>
                                          {cards.map((c) => (
                                            <div key={c.id} style={{ padding: 14, position: "relative", border: `1px solid ${S.cream3}`, borderRadius: 10, margin: "10px 0", background: c.kind === "ready" ? S.cream : c.kind === "preview" ? S.cream2 : "#fff" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: c.kind === "content" ? 10 : 6 }}>
                                              <span style={{ fontSize: 14 }}>{c.icon || "·"}</span>
                                              <span className="saju-serif" style={{ fontSize: 13, fontWeight: 600, color: S.ink, flex: 1, wordBreak: "keep-all" }}>{c.title}</span>
                                              {c.kind === "ready" && <span style={{ fontSize: 10, color: S.ink3, background: S.cream3, padding: "2px 7px", borderRadius: 99 }}>준비중</span>}
                                              {c.kind === "preview" && <LockIcon />}
                                            </div>

                                              {c.kind === "preview" && (
                                                <div style={{ position: "relative" }}>
                                                  <div
                                                    style={{
                                                      fontSize: 14,
                                                      lineHeight: 1.7,
                                                      color: "#374151",
                                                      wordBreak: "keep-all",
                                                      filter: "blur(6px)",
                                                      userSelect: "none",
                                                      pointerEvents: "none",
                                                      overflow: "hidden",
                                                      display: "-webkit-box",
                                                      WebkitLineClamp: 6,
                                                      WebkitBoxOrient: "vertical",
                                                    }}
                                                  >
                                                    {c.content.slice(0, 500)}...
                                                  </div>

                                                  <div
                                                    style={{
                                                      position: "absolute",
                                                      inset: 0,
                                                      background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), rgba(255,255,255,0.9))",
                                                      display: "flex",
                                                      alignItems: "flex-end",
                                                      justifyContent: "center",
                                                      paddingBottom: 12,
                                                      pointerEvents: "none",
                                                    }}
                                                  >
                                                    <button type="button" onClick={e => { e.stopPropagation(); router.push("/login"); }} style={{ pointerEvents: "auto", background: "#fff", border: `1px solid ${S.beige}`, borderRadius: 8, padding: "10px 18px", cursor: "pointer", boxShadow: "0 2px 12px rgba(44,36,23,0.08)" }}>
                                                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                                                        <LockIcon />
                                                        <span className="saju-serif" style={{ fontSize: 12, fontWeight: 600, color: S.ink }}>로그인 후 확인하기</span>
                                                      </div>
                                                    </button>
                                                  </div>
                                                </div>
                                              )}

                                              {c.kind === "ready" && <p style={{ fontSize: 12, color: S.ink3, lineHeight: 1.7 }}>곧 업데이트 예정입니다.</p>}

                                              {c.kind === "content" && (
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%", overflow: "visible" }}>
                                                  {c.id === "identity_persona" && maskVsNatureLabels && (
                                                    <FaceSplitCard
                                                      socialLabel={maskVsNatureLabels.social}
                                                      realLabel={maskVsNatureLabels.real}
                                                    />
                                                  )}
                                                  {c.id === "identity_values" && coreValuesCompassData && (
                                                    <CompassCard
                                                      data={{
                                                        ...coreValuesCompassData,
                                                        title: "삶의 핵심적인 가치관과 지향점",
                                                      }}
                                                    />
                                                  )}
                                                  {c.id === "nature_text" && result && (
                                                    <SajuEnergyWheel
                                                      dayStem={result.day.cheongan.hanja}
                                                      yangCount={natureYangCount}
                                                      yinCount={natureYinCount}
                                                      size={200}
                                                    />
                                                  )}
                                                  {c.id === "talent_strengthWeak" && strengthWeakVisualData && (
                                                    <StrengthCard data={strengthWeakVisualData} />
                                                  )}
                                                  {c.id === "talent_aptitude" && aptitudeSpectrumData && (
                                                    <TalentSpectrumCard data={aptitudeSpectrumData} />
                                                  )}
                                                  {c.id === "talent_elements" && elementDistributionVisualData && (
                                                    <OhaengBalanceCard data={elementDistributionVisualData} />
                                                  )}
                                                  {c.id === "talent_tengod" && tenGodAbilityCardsData && (
                                                    <TenGodAbilityCards data={tenGodAbilityCardsData} />
                                                  )}
                                                  {c.id === "relation_comm" && relationshipVisualData && (
                                                    <RelationshipBalanceCard data={relationshipVisualData} />
                                                  )}
                                                  {c.id === "relation_parents" && ancestorVisualData && (
                                                    <FamilyDocumentCard data={ancestorVisualData} />
                                                  )}
                                                  {c.id === "relation_charisma" && charismaVisualData && (
                                                    <CharismaOrbitCard data={charismaVisualData} />
                                                  )}
                                                  {c.id === "relation_hapchung" && charmVisualData && (
                                                    <CharmPerfumeCard data={charmVisualData} />
                                                  )}

                                                  {c.id === "insight_gongmang" && gongmangVisual && (
                                                    <GongmangStructureMap slots={gongmangVisual} />
                                                  )}

                                                  {c.id === "insight_emotion" && emotionTriggers && (
                                                    <EmotionTriggerMap triggers={emotionTriggers} />
                                                  )}

                                                  {c.id === "insight_guiin" && result && (
                                                    <GuiinStarMap
                                                      dayStem={result.day.cheongan.hanja}
                                                      monthBranch={result.month.jiji.hanja}
                                                      stems={[
                                                        result.year.cheongan.hanja,
                                                        result.month.cheongan.hanja,
                                                        result.day.cheongan.hanja,
                                                        result.hour.cheongan.hanja,
                                                      ]}
                                                      branches={[
                                                        result.year.jiji.hanja,
                                                        result.month.jiji.hanja,
                                                        result.day.jiji.hanja,
                                                        result.hour.jiji.hanja,
                                                      ]}
                                                    />
                                                  )}

                                                  {c.id === "stars_text" && specialStarsVisual && (
                                                    <SpecialStarsMap cards={specialStarsVisual} />
                                                  )}

                                                  {c.id === "solution_health" && healthBodyMap && (
                                                    <HealthBodyMap data={healthBodyMap} />
                                                  )}

                                                  {c.id === "solution_lucky" && result && (
                                                    <LuckyItemMap
                                                      stems={[
                                                        result.year.cheongan.hanja,
                                                        result.month.cheongan.hanja,
                                                        result.day.cheongan.hanja,
                                                        result.hour.cheongan.hanja,
                                                      ]}
                                                      branches={[
                                                        result.year.jiji.hanja,
                                                        result.month.jiji.hanja,
                                                        result.day.jiji.hanja,
                                                        result.hour.jiji.hanja,
                                                      ]}
                                                      gender={gender}
                                                    />
                                                  )}

                                                  {c.id === "solution_summary" && <div style={{ margin: "0 2px", width: "100%" }}><SummarySwipeCards text={c.content} /></div>}

                                                  {c.id === "solution_summary" ? null : (
                                                    <div style={{ fontSize: 13, color: S.ink2, lineHeight: 1.9, wordBreak: "keep-all", width: "100%" }} dangerouslySetInnerHTML={{ __html: c.title === "일주 동물의 형상과 본성" ? c.content : c.content.replace(/\n/g, "<br />") }} />
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 16px" }}>
                          <div style={{ flex: 1, height: 1, background: S.beige }} />
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: S.beige2 }} />
                          <div style={{ flex: 1, height: 1, background: S.beige }} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                          <button type="button" onClick={handleSaveSaju} style={{ padding: "12px 8px", background: S.gold, color: "#fff", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: S.fontBody }}>
                            <Icon icon="mdi:bookmark-outline" width={16} />
                            저장하기
                          </button>
                          <button type="button" onClick={handleShare} style={{ padding: "12px 8px", background: "#fff", border: `1px solid ${S.beige}`, color: S.ink, borderRadius: 10, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: S.fontBody }}>
                            <Icon icon="mdi:share-variant-outline" width={16} />
                            공유하기
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setResult(null); setFortuneAnalysis(null); setCharmAnalysis(null); setTalentAnalysis(null); setStrengthAnalysis(null); setRelationsAnalysis(null); setSpecialStarsAnalysis(null); setTodayFortune(null); setNewInterpretation(null); setMaskVsNatureAnalysis(null); setMaskVsNatureLabels(null); setSummaryGuide(null); setExpandedSection(null); setShowFortune(false); setShowCharm(false); setShowTalent(false); setShowStrength(false); setShowRelations(false); setShowSpecialStars(false); setShowToday(false); setBirthYmd(""); setBirthHm(""); setTimeUnknown(false); setLoading(false); setErr(""); setShowHarmonyAfter(false);
                          }}
                          style={{ width: "100%", padding: "10px 12px", background: "transparent", border: `1px solid ${S.beige}`, color: S.ink3, borderRadius: 10, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", fontFamily: S.fontBody }}
                        >
                          <Icon icon="mdi:refresh" width={14} />
                          다시 입력하기
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
          {showSaveDialog && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(44,36,23,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => { if (!savingToServer) { setShowSaveDialog(false); setSajuName(""); } }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "28px 22px", maxWidth: 320, width: "100%", border: `1px solid ${S.beige}`, boxShadow: "0 8px 40px rgba(44,36,23,0.14)" }} onClick={e => e.stopPropagation()}>
                <h3 className="saju-serif" style={{ fontSize: 16, fontWeight: 600, color: S.ink, marginBottom: 6 }}>사주 저장</h3>
                <p style={{ fontSize: 12, color: S.ink3, lineHeight: 1.7, marginBottom: 18 }}>
                  이 사주에 이름을 붙여주세요.<br />
                  <span style={{ color: S.beige2 }}>예: 내 사주, 엄마 사주, 친구 사주</span>
                </p>
                <input
                  type="text"
                  value={sajuName}
                  onChange={e => setSajuName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") confirmSave(); }}
                  onFocus={() => setSaveDialogInputFocused(true)}
                  onBlur={() => setSaveDialogInputFocused(false)}
                  placeholder="이름 입력"
                  maxLength={20}
                  autoFocus
                  style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: `1.5px solid ${saveDialogInputFocused ? S.gold : S.beige}`, fontSize: 14, outline: "none", marginBottom: 4, boxSizing: "border-box", fontFamily: S.fontBody, background: S.cream, color: S.ink }}
                />
                <div style={{ fontSize: 10, color: S.beige2, textAlign: "right", marginBottom: 16 }}>{sajuName.length}/20</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => { setShowSaveDialog(false); setSajuName(""); }} style={{ flex: 1, padding: 11, borderRadius: 8, border: `1px solid ${S.beige}`, background: S.cream, fontSize: 13, fontWeight: 600, color: S.ink3, cursor: "pointer", fontFamily: S.fontBody }}>취소</button>
                  <button type="button" disabled={savingToServer} onClick={confirmSave} style={{ flex: 1, padding: 11, borderRadius: 8, border: "none", background: savingToServer ? S.beige : S.gold, fontSize: 13, fontWeight: 700, color: "#fff", cursor: savingToServer ? "wait" : "pointer", fontFamily: S.fontBody }}>{savingToServer ? "저장 중…" : "저장"}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}