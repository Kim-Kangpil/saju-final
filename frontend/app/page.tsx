"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import {
  analyzeFullFortune,
  GreatFortuneData,
  YearFortuneData,
  FORTUNE_ANALYSIS,
} from "../data/fortuneAnalysis";
import { CHARM_ANALYSIS, CHARM_BY_PILLAR } from "../data/charmAnalysis";
import { ELEMENT_ANALYSIS } from "../data/elementAnalysis";
import { RELATIONS_ANALYSIS, analyzeRelations } from "../data/relationsAnalysis";
import { SPECIAL_STARS_ANALYSIS, analyzeSpecialStars } from "../data/specialStarsAnalysis";
import { STRENGTH_ANALYSIS, analyzeStrength } from "../data/strengthAnalysis";
import { TALENT_ANALYSIS, TALENT_BY_TEN_GOD } from "../data/talentAnalysis";
import { TODAY_ANALYSIS, analyzeTodayFortune } from "../data/todayAnalysis";
import { dayPillarTexts } from "../data/dayPillarAnimal";
import { NATURE_ANALYSIS } from "../data/natureAnalysis";
import { analyzeMaskVsNature } from "../analysis/maskVsNature";  // 🔥 추가
import Head from 'next/head';
import { SajuEnergyWheel } from "../components/SajuEnergyWheel";

type Pillar = { hanja: string; hangul: string };
type PillarBlock = { label: string; cheongan: Pillar; jiji: Pillar };
type SajuResult = {
  hour: PillarBlock;
  day: PillarBlock;
  month: PillarBlock;
  year: PillarBlock;
  twelve_states?: {
    hour?: string;
    day?: string;
    month?: string;
    year?: string;
  };
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

function branchMainStem(branch: string): string | null {
  const map: Record<string, string> = {
    子: "壬",
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
      className="w-6 h-6 text-yellow-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
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
    name: "부드러운 안내자",
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
        "해바라기씨 한 알처럼\n작은 행복이 당신을 기다려요.",
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
    name: "냉정한 분석가",
    img: "/images/ham_cold.png",
    oneLine: "기분은 몰라도, 방향은 정확히 알려주는 사람",
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
    name: "찐친 도사",
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
      { key: "nature", title: "타고난 기질과 기운", icon: "🌱" },
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
      { key: "comm", title: "타인과의 소통법과 커뮤니케이션 방식", icon: "💬" },
      { key: "parents", title: "조상의 혼은 부모운", icon: "👪" },
      { key: "charisma", title: "카리스마와 사회적 영향력", icon: "👑" },
      { key: "hapchung", title: "지지 합과 충의 본색", icon: "⚡" },
    ],
  },
  insight: {
    title: "내화 심리 및 조력자",
    icon: "🔮",
    items: [
      { key: "gongmang", title: "공망 분석", icon: "🕳" },
      { key: "guiin", title: "주요 귀인 분석", icon: "👼" },
      { key: "stress", title: "스트레스 취약 지점과 마음 관리법", icon: "🧘" },
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

export default function Page() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedIn === 'true');
  }, []);

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
    setIsLoggedIn(false);
    alert('로그아웃되었습니다.');
  };

  const megaOrder: MegaKey[] = ["identity", "talent", "relation", "insight", "solution"];
  const [openMega, setOpenMega] = useState<MegaKey | null>("identity");
  type GateStep = "idle" | "showSaju" | "needAuth" | "unlocked";

  const [gateStep, setGateStep] = useState<GateStep>("idle");
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
  }, [kakaoReady, gateStep]);

  function handleKakaoLogin() {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) {
      alert("NEXT_PUBLIC_BACKEND_URL 환경변수가 없어요.");
      return;
    }
    window.location.href = `${backend}/auth/kakao/login`;
  }

  function handleFollowChannel() {
    // 채널 추가 링크로 바꿔야 함 (카카오 채널 관리자에서 '채널 추가 링크' 복사해서 넣기)
    window.open("https://pf.kakao.com/_YOUR_CHANNEL_ID", "_blank");
  }

  function handleChannelAddedDone() {
    // 채널 추가 완료 버튼 누르면 바로 잠금 해제/해석 요청
    setGateStep("unlocked");
    requestInterpretation();
  }

  const [sajuJsonRaw, setSajuJsonRaw] = useState<any>(null);
  const [interpLoading, setInterpLoading] = useState(false);
  const [selectedChar, setSelectedChar] = useState<CharKey>("empathy");

  const [birthYmd, setBirthYmd] = useState("");
  const [birthHm, setBirthHm] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [timeUnknown, setTimeUnknown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<SajuResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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
  const [todayFortune, setTodayFortune] = useState<any>(null);
  const [natureAnalysis, setNatureAnalysis] = useState<string | null>(null);
  const [natureYangCount, setNatureYangCount] = useState<number>(0);
  const [natureYinCount, setNatureYinCount] = useState<number>(0);
  const [maskVsNatureAnalysis, setMaskVsNatureAnalysis] = useState<string | null>(null);  // 🔥 추가
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  }, [result]);

  useEffect(() => {
    if (result || loading) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const updateGreeting = () => {
      const hour = new Date().getHours();
      let timeStr = "지금";

      if (hour >= 0 && hour < 5) timeStr = "새벽";
      else if (hour >= 5 && hour < 11) timeStr = "아침";
      else if (hour >= 11 && hour < 17) timeStr = "오후";
      else if (hour >= 17 && hour < 21) timeStr = "저녁";
      else timeStr = "밤";

      const nextGreeting = CHARACTERS[selectedChar].getGreeting(timeStr);
      setCurrentGreeting(nextGreeting);

      const typingDuration = nextGreeting.length * 50;
      const waitTime = typingDuration + 300 + 3000;

      timer = setTimeout(updateGreeting, waitTime);
    };

    updateGreeting();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [selectedChar, result, loading]);

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

        const specialResult = analyzeSpecialStars(
          result.day.jiji.hanja,
          result.year.jiji.hanja,
          result.month.jiji.hanja,
          result.hour.jiji.hanja
        );
        setSpecialStarsAnalysis(specialResult);

        const todayResult = analyzeTodayFortune(hanjaToElement(dayStem), selectedChar);
        setTodayFortune(todayResult);

        const natureResult = NATURE_ANALYSIS.analyze(
          dayStem,
          [result.year, result.month, result.day, result.hour],
          selectedChar,
          gender
        );
        setNatureAnalysis(natureResult.text);
        setNatureYangCount(natureResult.yangCount);
        setNatureYinCount(natureResult.yinCount);

        // 🔥 사회적 가면 vs 실제 기질 분석 추가
        const monthStemTenGod = tenGod(dayStem, result.month.cheongan.hanja);
        const monthTwelveState = result.twelve_states?.month || "";
        const hourStemTenGod = tenGod(dayStem, result.hour.cheongan.hanja);
        const hourBranchMainStem = branchMainStem(result.hour.jiji.hanja);
        const hourBranchTenGod = hourBranchMainStem ? tenGod(dayStem, hourBranchMainStem) : "";

        const maskVsNatureResult = analyzeMaskVsNature(
          monthStemTenGod,
          monthTwelveState,
          hourStemTenGod,
          hourBranchTenGod,
          selectedChar
        );
        setMaskVsNatureAnalysis(maskVsNatureResult.text);

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

  const contentWithImage = useMemo(() => {
    if (!result || !getDayPillarAnimalText) return null;

    const dayPillarKey = result.day.cheongan.hangul + result.day.jiji.hangul;
    const imagePath = `/images/day_pillars/${dayPillarKey}.png`;

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
      ${getDayPillarAnimalText.replace(/\n/g, '<br />')}
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

  const formError = useMemo(() => {
    const parsedYmd = parseYmd(birthYmd);
    const parsedHm = timeUnknown ? { hour: 12, minute: 0 } : parseHm(birthHm);

    if (!parsedYmd) return "생년월일은 8자리(YYYYMMDD)로 입력하세요";
    if (!parsedHm) return "태어난 시간은 4자리(HHMM)로 입력하세요";
    return null;
  }, [birthYmd, birthHm, timeUnknown]);

  const megaCards = useMemo(() => {
    if (!result) return {
      identity: [],
      talent: [],
      relation: [],
      insight: [],
      solution: [],
    };

    const dayPillarText = getDayPillarAnimalText;

    const base: Record<MegaKey, MegaCard[]> = {
      identity: MEGA_SECTIONS.identity.items
        .filter(item => item.key !== "animal" && item.key !== "nature" && item.key !== "persona")
        .map((it) => asReady(`identity_${it.key}`, it.title, it.icon)),
      talent: MEGA_SECTIONS.talent.items.map((it) =>
        asReady(`talent_${it.key}`, it.title, it.icon)
      ),
      relation: MEGA_SECTIONS.relation.items.map((it) =>
        asReady(`relation_${it.key}`, it.title, it.icon)
      ),
      insight: MEGA_SECTIONS.insight.items.map((it) =>
        asReady(`insight_${it.key}`, it.title, it.icon)
      ),
      solution: MEGA_SECTIONS.solution.items.map((it) =>
        asReady(`solution_${it.key}`, it.title, it.icon)
      ),
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
        asContent("nature_text", "타고난 기질과 기운", natureAnalysis, "🌱", "local")
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

    if (talentAnalysis) {
      base.talent.unshift(asContent("talent_text", "재능 요약", talentAnalysis, "🎭", "local"));
    }
    if (strengthAnalysis?.[selectedChar]) {
      const txt = `${strengthAnalysis.type} (점수: ${strengthAnalysis.score})\n\n${strengthAnalysis[selectedChar]}\n\n추천: ${strengthAnalysis.recommendation}`;
      base.talent.unshift(asContent("strength_text", "신강약 분석", txt, "💪", "local"));
    }
    if (relationsAnalysis?.[selectedChar]) {
      base.relation.unshift(
        asContent("relation_text", "관계 패턴 요약", relationsAnalysis[selectedChar], "🤝", "local")
      );
    }
    if (specialStarsAnalysis?.[selectedChar]) {
      base.insight.unshift(
        asContent("stars_text", "특수신살/신살", specialStarsAnalysis[selectedChar], "⭐", "local")
      );
    }
    if (todayFortune?.advice) {
      const txt = `행운의 색: ${todayFortune.luckyColor}\n행운의 숫자: ${todayFortune.luckyNumber}\n행운의 방향: ${todayFortune.luckyDirection}\n\n오늘의 조언:\n${todayFortune.advice}`;
      base.solution.unshift(asContent("today_text", "오늘의 처방", txt, "💊", "local"));
    }

    const interps: any[] = Array.isArray(newInterpretation?.interpretations)
      ? newInterpretation.interpretations
      : [];

    for (let i = 0; i < interps.length; i++) {
      const it = interps[i];
      const title = String(it?.title ?? "").trim();
      const content = String(it?.content ?? "").trim();
      if (!title || !content) continue;

      const where = classifyMegaByTitle(title);
      if (!where) continue;

      base[where].unshift(asContent(`gpt_${where}_${i}`, title, content, "🔮", "gpt"));
    }

    return base;
  }, [
    newInterpretation,
    talentAnalysis,
    strengthAnalysis,
    relationsAnalysis,
    specialStarsAnalysis,
    todayFortune,
    natureAnalysis,
    maskVsNatureAnalysis,  // 🔥 추가
    selectedChar,
    gateStep,
    getDayPillarAnimalText,
    result,
  ]);

  async function requestInterpretation() {
    if (!sajuJsonRaw) return;

    setInterpLoading(true);
    setLoading(true);
    setErr("");

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
      setInterpLoading(false);
    }
  }

  async function run() {
    setGateStep("idle");
    setIsChannelAdded(false);

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

      setShowCharacterSelect(true);
    } catch (e: any) {
      setErr(e?.message ?? "네트워크 오류");
    }
  }

  // 🔥 수정: 캐릭터 확정 시 바로 로딩 시작하고 해석 요청
  function handleCharacterConfirm() {
    console.log("🔥 캐릭터 확정 - selectedChar:", selectedChar);
    setShowCharacterSelect(false);
    setSelectedTone(selectedChar);
    setGateStep("showSaju");

    // 🔥 바로 해석 요청 (로딩 시작)
    requestInterpretation();
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <Script
        src="https://developers.kakao.com/sdk/js/kakao.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("=== Kakao SDK v1 로딩 시작 ===");
          try {
            if (!window.Kakao) {
              console.error("❌ Kakao SDK 로드 실패");
              return;
            }

            const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
            if (!key) {
              console.error("❌ NEXT_PUBLIC_KAKAO_JS_KEY 값 비어있음");
              return;
            }

            if (!window.Kakao.isInitialized()) {
              window.Kakao.init(key);
              console.log("✅ Kakao SDK v1 초기화 완료");
              console.log("초기화 상태:", window.Kakao.isInitialized());
            } else {
              console.log("✅ Kakao SDK 이미 초기화됨");
            }

            console.log("Auth 모듈:", window.Kakao.Auth);
            console.log("Auth.login:", typeof window.Kakao.Auth?.login);

            setTimeout(() => {
              setKakaoReady(true);
              console.log("✅ kakaoReady 상태 설정 완료");
            }, 300);
          } catch (e) {
            console.error("❌ Kakao SDK 초기화 오류:", e);
          }
        }}
        onError={(e) => {
          console.error("❌ Kakao SDK 스크립트 로딩 실패:", e);
        }}
      />

      <main
        className="min-h-screen p-4 flex flex-col items-center justify-center relative"
        style={{ position: "relative", zIndex: 10 }}
      >
        {!loading && !result && !showCharacterSelect && (
          <>
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              {["⭐", "🌙", "🔮", "✨", "💫", "🌟", "🪐", "🌠"].map((emoji, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    top: `${10 + i * 12}%`,
                    left: `${5 + i * 11}%`,
                  }}
                  animate={{
                    y: [0, -25, 0],
                    x: [0, 10, 0],
                    rotate: [0, 15, 0, -15, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.1, 0.8],
                  }}
                  transition={{
                    duration: 4 + i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>

            <div className="fixed top-8 left-8 text-6xl">✨</div>
            <div className="fixed top-12 right-12 text-5xl">⭐</div>
            <div className="fixed bottom-16 left-16 text-5xl">💫</div>
            <div className="fixed bottom-12 right-20 text-6xl">🌙</div>
            <div className="fixed top-1/3 left-12 text-4xl">🔮</div>
            <div className="fixed top-2/3 right-16 text-4xl">🌟</div>
          </>
        )}

        <div className="w-full max-w-[450px] mx-auto px-2 sm:px-0">
          <div className="border-4 border-[#adc4af] rounded-[24px] overflow-hidden shadow-xl relative z-10 bg-white">

            {/* 헤더 */}
            <div className="bg-[#c1d8c3] px-4 py-3 flex justify-between items-center border-b-4 border-[#adc4af]">
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img src="/images/ham_icon.png" alt="햄스터" className="w-10 h-10 object-contain" />
                <span className="text-base font-bold text-[#556b2f]">한양사주</span>
              </button>

              <div className="flex items-center gap-2">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm font-bold text-[#556b2f] bg-white hover:bg-white/80 rounded-lg transition-colors shadow-sm"
                  >
                    로그아웃
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        router.push('/login');
                      }}
                      className="px-3 py-1.5 text-sm font-bold text-[#556b2f] bg-white hover:bg-white/80 rounded-lg transition-colors shadow-sm"
                    >
                      로그인
                    </button>
                    <button
                      onClick={() => {
                        router.push('/signup');
                      }}
                      className="px-3 py-1.5 text-sm font-bold bg-[#556b2f] text-white rounded-lg hover:bg-[#6d8b3a] transition-colors shadow-sm"
                    >
                      회원가입
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="p-5 bg-white">
              {err && !loading && !result && (
                <div className="mb-4 p-3 rounded-xl border-2 border-red-200 bg-red-50 text-[11px] text-red-700 whitespace-pre-wrap">
                  {err}
                </div>
              )}

              {loading && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  style={{
                    touchAction: "none",
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                    zIndex: 9999,
                  }}
                >
                  <div className="bg-white rounded-2xl p-6 sm:p-8 w-[90vw] sm:w-[450px] max-w-[450px] mx-4 text-center shadow-2xl">
                    <div className="mb-4 sm:mb-6">
                      <motion.div
                        initial={{ scale: 0.5, y: 50, opacity: 0 }}
                        animate={{
                          scale: [0.5, 1.3, 1],
                          y: [50, -20, 0],
                          opacity: 1,
                        }}
                        transition={{
                          duration: 0.8,
                          times: [0, 0.6, 1],
                          ease: "easeOut",
                        }}
                        className="relative mb-4 sm:mb-6"
                      >
                        <img
                          src={CHARACTERS[selectedChar].img}
                          alt={CHARACTERS[selectedChar].name}
                          className="w-32 h-32 sm:w-40 sm:h-40 object-contain pixel-art drop-shadow-2xl mx-auto"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-center px-4 sm:px-6"
                      >
                        <p className="text-[#556b2f] font-bold text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-korean">
                          {loadingMessage}
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="w-full px-4 sm:px-8 space-y-2 sm:space-y-3 mt-4 sm:mt-6"
                      >
                        <div className="flex justify-between items-center px-1 sm:px-2">
                          <span className="text-xs sm:text-sm font-bold text-[#556b2f]">
                            분석 진행중
                          </span>
                          <span
                            className="text-xl sm:text-2xl font-black text-[#556b2f]"
                            style={{ fontFamily: "monospace" }}
                          >
                            {loadingProgress}% <span className="pixel-heart">💚</span>
                          </span>
                        </div>

                        <div className="relative h-8 sm:h-10 bg-[#e9ecef] border-2 sm:border-4 border-[#556b2f] overflow-hidden shadow-[2px_2px_0px_0px_rgba(85,107,47,0.3)]">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#fef08a] via-[#fde047] to-[#facc15]"
                            style={{
                              width: `${loadingProgress}%`,
                              imageRendering: "pixelated",
                            }}
                            animate={{ width: `${loadingProgress}%` }}
                            transition={{
                              duration: 0.3,
                              ease: "linear",
                            }}
                          >
                            <div className="absolute top-0 left-0 w-full h-[30%] bg-white/30" />
                          </motion.div>

                          {[...Array(99)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute top-0 bottom-0 w-[1px] bg-[#556b2f]"
                              style={{
                                left: `${(i + 1) * 1}%`,
                                opacity: 0.15,
                              }}
                            />
                          ))}

                          {[...Array(9)].map((_, i) => (
                            <div
                              key={`thick-${i}`}
                              className="absolute top-0 bottom-0 w-[2px] bg-[#556b2f]"
                              style={{
                                left: `${(i + 1) * 10}%`,
                                opacity: 0.4,
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🔥 캐릭터 선택 화면 (사주 명식 포함) */}
              {showCharacterSelect && !loading && result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* 🔥 사주 명식 먼저 표시 */}
                  <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none">
                    <div className="grid grid-cols-4 border-b-2 border-[#adc4af] bg-[#c1d8c3]/10 text-[9px] sm:text-[10px] text-[#556b2f] font-bold text-center py-1">
                      <span>시주</span>
                      <span>일주</span>
                      <span>월주</span>
                      <span>년주</span>
                    </div>

                    <div className="grid grid-cols-4 gap-0 text-center divide-x-2 divide-[#adc4af] overflow-x-auto">
                      {pillars.map((p, i) => (
                        <div
                          key={i}
                          className="py-2 sm:py-3 flex flex-col items-center gap-0.5 sm:gap-1"
                        >
                          <div className="text-[11px] sm:text-[12px] text-[#556b2f] opacity-70 font-semibold">
                            {tenGod(result.day.cheongan.hanja, p.cheongan.hanja)}
                          </div>

                          <div
                            className={cn(
                              "text-xl sm:text-2xl font-bold",
                              elementClass(hanjaToElement(p.cheongan.hanja))
                            )}
                          >
                            {scriptMode === "hanja" ? p.cheongan.hanja : p.cheongan.hangul}
                          </div>

                          <div
                            className={cn(
                              "text-xl sm:text-2xl font-bold",
                              elementClass(hanjaToElement(p.jiji.hanja))
                            )}
                          >
                            {scriptMode === "hanja" ? p.jiji.hanja : p.jiji.hangul}
                          </div>

                          <div className="text-[11px] sm:text-[12px] text-[#556b2f] opacity-70 font-semibold">
                            {(() => {
                              const ms = branchMainStem(p.jiji.hanja);
                              return ms ? tenGod(result.day.cheongan.hanja, ms) : "";
                            })()}
                          </div>

                          {result.jijanggan && (
                            <div className="flex gap-0.5 text-[8px] sm:text-[9px] font-medium mt-0.5">
                              {(() => {
                                const jijangganList =
                                  i === 0
                                    ? result.jijanggan.hour
                                    : i === 1
                                      ? result.jijanggan.day
                                      : i === 2
                                        ? result.jijanggan.month
                                        : result.jijanggan.year;

                                return jijangganList?.map((jj: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className={cn("font-bold", elementClass(jj.element))}
                                  >
                                    {scriptMode === "hanja" ? jj.hanja : jj.hangul}
                                  </span>
                                ));
                              })()}
                            </div>
                          )}

                          {result.twelve_states && (
                            <div className="text-[10px] sm:text-[11px] text-[#556b2f] opacity-70 font-medium mt-0.5">
                              {i === 0 && result.twelve_states.hour}
                              {i === 1 && result.twelve_states.day}
                              {i === 2 && result.twelve_states.month}
                              {i === 3 && result.twelve_states.year}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 캐릭터 선택 */}
                  <div className="text-center space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#556b2f]">
                      어떤 햄스터가 해석해드릴까요?
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600">
                      선택한 햄스터의 스타일로 사주를 풀이해드립니다
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {(Object.keys(CHARACTERS) as CharKey[]).map((id) => (
                      <motion.button
                        key={id}
                        onClick={() => setSelectedChar(id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "p-4 rounded-2xl border-4 transition-all",
                          selectedChar === id
                            ? "border-[#556b2f] bg-[#fefae0] shadow-lg"
                            : "border-[#e9edc9] bg-white hover:border-[#c1d8c3]"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-white border-2 border-[#adc4af] flex-shrink-0">
                            <img
                              src={CHARACTERS[id].img}
                              alt={CHARACTERS[id].name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-[#556b2f]">
                                {CHARACTERS[id].name}
                              </h3>
                              {selectedChar === id && (
                                <span className="text-xl">✅</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              {CHARACTERS[id].oneLine}
                            </p>
                            <p className="text-xs text-[#556b2f] opacity-70">
                              {CHARACTERS[id].desc}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <button
                    onClick={handleCharacterConfirm}
                    className="w-full py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-bold text-lg rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                    이 햄스터로 결정! 🎯
                  </button>
                </motion.div>
              )}

              {!loading && !result && !showCharacterSelect && (
                <div className="text-center mb-6">
                  <p className="text-[#556b2f] font-bold text-sm text-korean">
                    생년월일과 성별을 입력하세요!
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {loading ? null : showCharacterSelect ? null : !result ? (
                    <motion.div
                      key="input-form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-3 pt-4">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div className="flex bg-[#f1f3f5] p-1 rounded-xl border-3 border-[#adc4af]">
                            <button
                              onClick={() => setCalendar("solar")}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${calendar === "solar" ? "bg-black text-white shadow-sm" : "text-[#868e96]"
                                }`}
                            >
                              양력
                            </button>
                            <button
                              onClick={() => setCalendar("lunar")}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${calendar === "lunar" ? "bg-black text-white shadow-sm" : "text-[#868e96]"
                                }`}
                            >
                              음력
                            </button>
                          </div>

                          <div className="flex bg-[#f1f3f5] p-1 rounded-xl border-3 border-[#adc4af]">
                            <button
                              onClick={() => setGender("M")}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === "M" ? "bg-black text-white shadow-sm" : "text-[#868e96]"
                                }`}
                            >
                              남
                            </button>
                            <button
                              onClick={() => setGender("F")}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === "F" ? "bg-black text-white shadow-sm" : "text-[#868e96]"
                                }`}
                            >
                              여
                            </button>
                          </div>
                        </div>

                        <input
                          className="w-full rounded-xl border-3 border-[#adc4af] px-3 sm:px-4 py-2 sm:py-3 font-mono text-base outline-none transition-all focus:border-[#556b2f] focus:bg-yellow-50"
                          placeholder="생년월일 8자리"
                          value={birthYmd}
                          onChange={(e) => setBirthYmd(onlyDigits(e.target.value).slice(0, 8))}
                          inputMode="numeric"
                        />

                        <div className="flex gap-2">
                          <input
                            className="flex-1 rounded-xl border-3 border-[#adc4af] px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm outline-none transition-all focus:border-[#556b2f] focus:bg-yellow-50 disabled:opacity-30"
                            placeholder="시간 4자리 (HHMM)"
                            value={birthHm}
                            disabled={timeUnknown}
                            onChange={(e) => setBirthHm(onlyDigits(e.target.value).slice(0, 4))}
                          />
                          <label className="flex items-center gap-1 sm:gap-2 border-3 border-[#adc4af] rounded-xl px-2 sm:px-3 py-2 sm:py-3 bg-[#fefae0] cursor-pointer hover:bg-white transition-colors flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={timeUnknown}
                              onChange={(e) => setTimeUnknown(e.target.checked)}
                              className="w-4 h-4 accent-[#556b2f]"
                            />
                            <span className="text-[10px] font-bold text-[#556b2f] whitespace-nowrap">모름</span>
                          </label>
                        </div>

                        <div className="text-[10px] text-[#556b2f] opacity-70 px-1">
                          {formError ? formError : "입력 완료. 버튼 누르면 분석 시작"}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("🔥 버튼 클릭!", { formError, birthYmd, birthHm }); // 🔥 추가
                            if (!formError) {
                              console.log("🔥 run() 실행!"); // 🔥 추가
                              run();
                            } else {
                              console.log("❌ formError:", formError); // 🔥 추가
                            }
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                          disabled={loading || !!formError}
                          className={`
                      w-full px-6 py-4
                      bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
                      text-gray-900 font-bold text-lg
                      rounded-lg
                      transform transition-all duration-200
                      ${loading || !!formError
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                            }
                      disabled:transform-none
                    `}
                        >
                          {loading ? "분석 중.." : "🔮 사주 확인하기"}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      ref={resultRef}
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-4"
                    >
                      <motion.div
                        key={`result-${selectedChar}`}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 sm:p-6 shadow-lg border-4 border-[#adc4af] mb-6"
                      >
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                          <h3 className="text-lg sm:text-2xl font-bold text-[#556b2f] text-center">
                            ✨ 사주 분석 완료!
                          </h3>

                          <motion.div
                            animate={{
                              y: [0, -8, 0],
                              rotate: [0, 2, -2, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="relative"
                          >
                            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-yellow-300">
                              <img
                                src={CHARACTERS[selectedChar].img}
                                alt={CHARACTERS[selectedChar].name}
                                className="w-24 h-24 sm:w-32 sm:h-32 object-contain pixel-art"
                              />
                            </div>
                            <div className="absolute -top-2 -right-2 text-2xl sm:text-3xl animate-bounce">
                              ✨
                            </div>
                          </motion.div>

                          <div className="text-center space-y-2 max-w-xs sm:max-w-sm px-2">
                            <p className="text-base sm:text-xl font-bold text-[#556b2f]">
                              {CHARACTERS[selectedChar].name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 bg-white px-3 py-2 rounded-full shadow-sm border-2 border-[#adc4af]">
                              {CHARACTERS[selectedChar].desc}
                            </p>
                            <p className="text-[10px] sm:text-xs text-[#556b2f] opacity-70">
                              {CHARACTERS[selectedChar].oneLine}
                            </p>
                          </div>

                          <div className="flex gap-2 text-xl sm:text-2xl">
                            <motion.span
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                            >
                              💚
                            </motion.span>
                            <motion.span
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            >
                              💚
                            </motion.span>
                            <motion.span
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                            >
                              💚
                            </motion.span>
                          </div>
                        </div>
                      </motion.div>

                      {/* 사주 명식은 결과 화면에도 계속 표시 */}
                      <div className="relative">
                        <button
                          onClick={() => setScriptMode(scriptMode === "hanja" ? "hangul" : "hanja")}
                          className="absolute -top-7 right-1 z-20 px-2.5 py-1 bg-[#fef08a] border-2 border-[#eab308] rounded-full text-[9px] font-bold text-[#854d0e] hover:bg-[#fde047] transition-all hover:scale-110 shadow-md"
                        >
                          {scriptMode === "hanja" ? "한글" : "한자"}
                        </button>
                        <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none">
                          <div className="grid grid-cols-4 border-b-2 border-[#adc4af] bg-[#c1d8c3]/10 text-[9px] sm:text-[10px] text-[#556b2f] font-bold text-center py-1">
                            <span>시주</span>
                            <span>일주</span>
                            <span>월주</span>
                            <span>년주</span>
                          </div>

                          <div className="grid grid-cols-4 gap-0 text-center divide-x-2 divide-[#adc4af] overflow-x-auto">
                            {pillars.map((p, i) => (
                              <div
                                key={i}
                                className="py-2 sm:py-3 flex flex-col items-center gap-0.5 sm:gap-1"
                              >
                                <div className="text-[11px] sm:text-[12px] text-[#556b2f] opacity-70 font-semibold">
                                  {tenGod(result.day.cheongan.hanja, p.cheongan.hanja)}
                                </div>

                                <div
                                  className={cn(
                                    "text-xl sm:text-2xl font-bold",
                                    elementClass(hanjaToElement(p.cheongan.hanja))
                                  )}
                                >
                                  {scriptMode === "hanja" ? p.cheongan.hanja : p.cheongan.hangul}
                                </div>

                                <div
                                  className={cn(
                                    "text-xl sm:text-2xl font-bold",
                                    elementClass(hanjaToElement(p.jiji.hanja))
                                  )}
                                >
                                  {scriptMode === "hanja" ? p.jiji.hanja : p.jiji.hangul}
                                </div>

                                <div className="text-[11px] sm:text-[12px] text-[#556b2f] opacity-70 font-semibold">
                                  {(() => {
                                    const ms = branchMainStem(p.jiji.hanja);
                                    return ms ? tenGod(result.day.cheongan.hanja, ms) : "";
                                  })()}
                                </div>

                                {result.jijanggan && (
                                  <div className="flex gap-0.5 text-[8px] sm:text-[9px] font-medium mt-0.5">
                                    {(() => {
                                      const jijangganList =
                                        i === 0
                                          ? result.jijanggan.hour
                                          : i === 1
                                            ? result.jijanggan.day
                                            : i === 2
                                              ? result.jijanggan.month
                                              : result.jijanggan.year;

                                      return jijangganList?.map((jj: any, idx: number) => (
                                        <span
                                          key={idx}
                                          className={cn("font-bold", elementClass(jj.element))}
                                        >
                                          {scriptMode === "hanja" ? jj.hanja : jj.hangul}
                                        </span>
                                      ));
                                    })()}
                                  </div>
                                )}

                                {result.twelve_states && (
                                  <div className="text-[10px] sm:text-[11px] text-[#556b2f] opacity-70 font-medium mt-0.5">
                                    {i === 0 && result.twelve_states.hour}
                                    {i === 1 && result.twelve_states.day}
                                    {i === 2 && result.twelve_states.month}
                                    {i === 3 && result.twelve_states.year}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>




                      <div className="relative">
                        {gateStep === "needAuth" && (
                          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-2xl border-4 border-[#adc4af]">
                            <div className="w-[92%] max-w-[360px] bg-white rounded-2xl border-4 border-[#adc4af] shadow-xl p-6 text-center">
                              <div className="text-sm font-bold text-[#556b2f] mb-2">
                                해석을 보려면 카카오 로그인 + 채널 추가가 필요해요
                              </div>

                              <div className="text-[11px] text-[#556b2f] opacity-80 mb-4 whitespace-pre-line">
                                {"1) 카카오 로그인\n2) 채널 친구추가\n3) 해석 잠금 해제"}
                              </div>

                              <div className="flex flex-col gap-3 w-full">
                                <button
                                  onClick={handleKakaoLogin}
                                  className="w-full h-[50px] rounded-[12px] flex items-center justify-center gap-3 font-medium transition-all hover:brightness-95 active:scale-[0.98]"
                                  style={{
                                    backgroundColor: "#FEE500",
                                    color: "rgba(0, 0, 0, 0.85)",
                                  }}
                                >
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 3.731 0 8.333c0 2.848 1.746 5.35 4.397 6.872l-.934 3.43c-.082.302.21.56.493.435l4.47-1.969C8.94 17.134 9.464 17.167 10 17.167c5.523 0 10-3.731 10-8.334C20 3.731 15.523 0 10 0z" fill="#000000" />
                                  </svg>
                                  <span style={{ fontSize: "15px", fontWeight: 500 }}>카카오 로그인</span>
                                </button>

                                <button
                                  onClick={handleFollowChannel}
                                  className="w-full h-[50px] rounded-[12px] flex items-center justify-center gap-3 font-medium transition-all hover:brightness-95 active:scale-[0.98]"
                                  style={{
                                    backgroundColor: "#FEE500",
                                    color: "rgba(0, 0, 0, 0.85)",
                                  }}
                                >
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 3.731 0 8.333c0 2.848 1.746 5.35 4.397 6.872l-.934 3.43c-.082.302.21.56.493.435l4.47-1.969C8.94 17.134 9.464 17.167 10 17.167c5.523 0 10-3.731 10-8.334C20 3.731 15.523 0 10 0z" fill="#000000" />
                                  </svg>
                                  <span style={{ fontSize: "15px", fontWeight: 500 }}>채널 추가</span>
                                </button>
                              </div>

                              <button onClick={handleChannelAddedDone}>채널 추가 완료했어요</button>

                              <div className="mt-2 text-[10px] text-[#556b2f] opacity-70">
                                로그인: {kakaoTokenOk ? "OK" : "NO"} / 채널: {isChannelAdded ? "OK" : "NO"}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {megaOrder.map((k) => {
                            const sec = MEGA_SECTIONS[k];
                            const isOpen = openMega === k;
                            const cards = megaCards[k] || [];

                            return (
                              <div
                                key={k}
                                className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none"
                              >
                                <button
                                  onClick={() => setOpenMega(isOpen ? null : k)}
                                  className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-[#f0f5f1] transition-colors"
                                >
                                  <p className="text-[10px] sm:text-[11px] font-bold text-[#556b2f] flex items-center gap-2">
                                    <span className="text-sm sm:text-base">{sec.icon}</span>
                                    <span>{sec.title}</span>
                                  </p>
                                  <motion.span
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    className="text-[10px] sm:text-xs text-[#556b2f]"
                                  >
                                    ▼
                                  </motion.span>
                                </button>

                                <AnimatePresence>
                                  {isOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="p-0 border-t-2 border-[#adc4af] space-y-0">
                                        {cards.map((c) => (
                                          <div
                                            key={c.id}
                                            className={cn(
                                              "p-4 relative",
                                              c.kind === "ready"
                                                ? "bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-xl mx-4 my-3"
                                                : c.kind === "preview"
                                                  ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] rounded-xl mx-4 my-3"
                                                  : "bg-[#fefae0]"
                                            )}
                                            onClick={() => {
                                              if (c.kind === "preview") {
                                                setGateStep("needAuth");
                                              }
                                            }}
                                          >
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-sm">{c.icon || "📌"}</span>
                                              <div className="text-[11px] font-bold text-[#556b2f]">
                                                {c.title}
                                              </div>
                                              {c.kind === "ready" && (
                                                <span className="ml-auto text-[10px] font-bold text-slate-500">
                                                  준비중
                                                </span>
                                              )}
                                              {c.kind === "preview" && (
                                                <div className="ml-auto">
                                                  <LockIcon />
                                                </div>
                                              )}
                                            </div>

                                            {c.kind === "preview" && (
                                              <div className="relative">
                                                <div className="text-[11px] leading-relaxed text-[#556b2f] blur-[6px] select-none pointer-events-none line-clamp-6">
                                                  {c.content.slice(0, 500)}...
                                                </div>

                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/90 flex items-end justify-center pb-3">
                                                  <div className="text-center space-y-1 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 border-2 border-yellow-400 shadow-lg">
                                                    <div className="flex justify-center">
                                                      <LockIcon />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-[#556b2f]">
                                                      🔓 클릭하여 잠금 해제
                                                    </p>
                                                    <p className="text-[8px] text-[#556b2f] opacity-70">
                                                      카카오 로그인 + 채널 추가
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {c.kind === "ready" && (
                                              <div className="text-[11px] leading-relaxed text-slate-500">
                                                콘텐츠 곧 업데이트됩니다
                                              </div>
                                            )}

                                            {c.kind === "content" && (
                                              <div className="space-y-4">
                                                {c.id === "nature_text" && result && (
                                                  <SajuEnergyWheel
                                                    dayStem={result.day.cheongan.hanja}
                                                    yangCount={natureYangCount}
                                                    yinCount={natureYinCount}
                                                    size={220}
                                                  />
                                                )}

                                                {c.title === "일주 동물의 형상과 본성" ? (
                                                  <div
                                                    className="text-[11px] leading-relaxed text-[#556b2f]"
                                                    dangerouslySetInnerHTML={{ __html: c.content }}
                                                  />
                                                ) : (
                                                  <div
                                                    className="text-[11px] leading-relaxed text-[#556b2f]"
                                                    dangerouslySetInnerHTML={{ __html: c.content.replace(/\n/g, '<br />') }}
                                                  />
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
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() => {
                            setResult(null);
                            setFortuneAnalysis(null);
                            setCharmAnalysis(null);
                            setTalentAnalysis(null);
                            setStrengthAnalysis(null);
                            setRelationsAnalysis(null);
                            setSpecialStarsAnalysis(null);
                            setTodayFortune(null);
                            setNewInterpretation(null);
                            setExpandedSection(null);
                            setShowFortune(false);
                            setShowCharm(false);
                            setShowTalent(false);
                            setShowStrength(false);
                            setShowRelations(false);
                            setShowSpecialStars(false);
                            setShowToday(false);
                            setBirthYmd("");
                            setBirthHm("");
                            setTimeUnknown(false);
                            setLoading(false);
                            setErr("");
                            setShowHarmonyAfter(false);
                            setShowCharacterSelect(false);
                          }}
                          className="w-full py-2 sm:py-3 border-2 border-[#ffb3b3] rounded-xl text-[10px] sm:text-[11px] font-bold text-[#ff4d4d] hover:bg-[#fff5f5] transition-colors flex items-center justify-center gap-1 sm:gap-2"
                        >
                          <span className="text-xs sm:text-sm">🔄</span>
                          <span>다시 하기</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}