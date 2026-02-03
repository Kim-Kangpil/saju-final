"use client";
import { buildAnalysis } from "../analysis/engine";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  analyzeFullFortune,
  GreatFortuneData,
  YearFortuneData,
  FORTUNE_ANALYSIS,
} from '../data/fortuneAnalysis';
import { CHARM_ANALYSIS, CHARM_BY_PILLAR, CHARM_BY_TEN_GOD } from '../data/charmAnalysis';
import { ELEMENT_ANALYSIS, ELEMENT_RECOMMENDATIONS, analyzeElements } from '../data/elementAnalysis';

import { RELATIONS_ANALYSIS, analyzeRelations } from '../data/relationsAnalysis';
import { SPECIAL_STARS_ANALYSIS, analyzeSpecialStars } from '../data/specialStarsAnalysis';
import { STRENGTH_ANALYSIS, analyzeStrength } from '../data/strengthAnalysis';
import { TALENT_ANALYSIS, TALENT_BY_TEN_GOD } from '../data/talentAnalysis';
import { TODAY_ANALYSIS, analyzeTodayFortune } from '../data/todayAnalysis';

type Pillar = { hanja: string; hangul: string };
type PillarBlock = { label: string; cheongan: Pillar; jiji: Pillar };
type SajuResult = { hour: PillarBlock; day: PillarBlock; month: PillarBlock; year: PillarBlock };
type CharKey = "empathy" | "reality" | "fun";

const API_BASE = "http://localhost:8000";

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
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
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
    "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무",
    "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계",
    "子": "자", "丑": "축", "寅": "인", "卯": "묘", "辰": "진",
    "巳": "사", "午": "오", "未": "미", "申": "신", "酉": "유",
    "戌": "술", "亥": "해",
  };
  return map[h] ?? "";
}

function hanjaToElement(h: string): "wood" | "fire" | "earth" | "metal" | "water" | "none" {
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
    case "wood": return "text-emerald-600";
    case "fire": return "text-rose-500";
    case "earth": return "text-amber-600";
    case "metal": return "text-gray-400";
    case "water": return "text-blue-600";
    default: return "text-slate-900";
  }
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";

function stemMeta(stem: string): { el: Element; pol: Polarity } | null {
  const map: Record<string, { el: Element; pol: Polarity }> = {
    "甲": { el: "wood", pol: "yang" },
    "乙": { el: "wood", pol: "yin" },
    "丙": { el: "fire", pol: "yang" },
    "丁": { el: "fire", pol: "yin" },
    "戊": { el: "earth", pol: "yang" },
    "己": { el: "earth", pol: "yin" },
    "庚": { el: "metal", pol: "yang" },
    "辛": { el: "metal", pol: "yin" },
    "壬": { el: "water", pol: "yang" },
    "癸": { el: "water", pol: "yin" },
  };
  return map[stem] ?? null;
}

function branchMainStem(branch: string): string | null {
  const map: Record<string, string> = {
    "子": "癸", "丑": "己", "寅": "甲", "卯": "乙", "辰": "戊", "巳": "丙",
    "午": "丁", "未": "己", "申": "庚", "酉": "辛", "戌": "戊", "亥": "壬",
  };
  return map[branch] ?? null;
}

function produces(a: Element, b: Element) {
  const next: Record<Element, Element> = {
    wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood",
  };
  return next[a] === b;
}

function controls(a: Element, b: Element) {
  const map: Record<Element, Element> = {
    wood: "earth", fire: "metal", earth: "water", metal: "wood", water: "fire",
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
      ]
    },
    getGreeting: (timeStr: string) => {
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
      ]
    },
    getGreeting: (timeStr: string) => {
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
      ]
    },
    getGreeting: (timeStr: string) => {
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
  }
};


// =====================================================
// 메인 컴포넌트
// =====================================================

export default function Page() {
  // ✅ 1. 기본 입력 상태
  const [selectedChar, setSelectedChar] = useState<CharKey>("empathy");
  const [birthYmd, setBirthYmd] = useState("");
  const [birthHm, setBirthHm] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [timeUnknown, setTimeUnknown] = useState(false);

  // ✅ 2. 로딩/결과 상태
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<SajuResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // ✅ 3. UI 상태
  const [currentGreeting, setCurrentGreeting] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [scriptMode, setScriptMode] = useState<"hanja" | "hangul">("hanja");
  const [expandedSection, setExpandedSection] = useState<"elements" | "wealth" | null>(null);

  // ✅ 4. 분석 결과 상태
  const [showHarmonyAfter, setShowHarmonyAfter] = useState(false); // 🆕 추가
  const [wealthReport, setWealthReport] = useState<string | null>(null);
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

  // ✅ 자동 스크롤
  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [result]);

  // ✅ 인사말 업데이트
  useEffect(() => {
    if (result || loading) return;

    let timer: NodeJS.Timeout;

    const updateGreeting = () => {
      const hour = new Date().getHours();
      let timeStr = "지금";

      if (hour >= 0 && hour < 5) timeStr = "새벽";
      else if (hour >= 5 && hour < 11) timeStr = "아침";
      else if (hour >= 11 && hour < 17) timeStr = "낮";
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

  // ✅ 대운/세운 분석
  useEffect(() => {
    if (result && birthYmd) {
      try {
        const parsedYmd = parseYmd(birthYmd);
        if (!parsedYmd) return;

        const birthYear = parsedYmd.year;
        const birthMonth = parsedYmd.month;
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
        if (charmText) {
          setCharmAnalysis(charmText[selectedChar]);
        }

        const dayStemTenGod = tenGod(dayStem, dayStem);
        const talentText = TALENT_BY_TEN_GOD[dayStemTenGod];
        if (talentText) {
          setTalentAnalysis(talentText[selectedChar]);
        }

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

        const todayResult = analyzeTodayFortune(
          hanjaToElement(dayStem),
          selectedChar
        );
        setTodayFortune(todayResult);
      } catch (error) {
        console.error('대운/세운 분석 오류:', error);
      }
    }
  }, [result, birthYmd, gender, selectedChar]);

  // ✅ useMemo 계산
  const chars8 = useMemo(() => {
    if (!result) return [];
    const p = [result.hour, result.day, result.month, result.year];
    return [
      p[0].cheongan.hanja, p[0].jiji.hanja,
      p[1].cheongan.hanja, p[1].jiji.hanja,
      p[2].cheongan.hanja, p[2].jiji.hanja,
      p[3].cheongan.hanja, p[3].jiji.hanja,
    ].filter(Boolean);
  }, [result]);

  const elementSummary = useMemo(() => {
    const buckets: Record<string, string[]> = {
      wood: [], fire: [], earth: [], metal: [], water: [],
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

    if (!parsedYmd) return "생년월일은 8자리(YYYYMMDD)로 입력해줘";
    if (!parsedHm) return "태어난시간은 4자리(HHMM)로 입력해줘";
    return null;
  }, [birthYmd, birthHm, timeUnknown]);

  const canSubmit = !loading && !formError;

  // ✅ run 함수
  async function run() {
    const parsedYmd = parseYmd(birthYmd);
    const parsedHm = timeUnknown ? { hour: 12, minute: 0 } : parseHm(birthHm);

    if (!parsedYmd || !parsedHm) return;

    setLoading(true);
    setErr("");
    setResult(null);
    setWealthReport(null);
    setNewInterpretation(null);
    setLoadingProgress(0);

    const ch = CHARACTERS[selectedChar];
    const stageMessages = {
      stage1: ch.progressMessages.stage1,
      stage2: ch.progressMessages.stage2,
      stage3: ch.progressMessages.stage3,
    };

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      if (currentProgress < 95) {
        currentProgress += 5;
        setLoadingProgress(currentProgress);

        if (currentProgress === 5) {
          const randomMsg = stageMessages.stage1[Math.floor(Math.random() * stageMessages.stage1.length)];
          setLoadingMessage(randomMsg);
        } else if (currentProgress === 30) {
          const randomMsg = stageMessages.stage1[Math.floor(Math.random() * stageMessages.stage1.length)];
          setLoadingMessage(randomMsg);
        } else if (currentProgress === 60) {
          const randomMsg = stageMessages.stage2[Math.floor(Math.random() * stageMessages.stage2.length)];
          setLoadingMessage(randomMsg);
        } else if (currentProgress === 85) {
          const randomMsg = stageMessages.stage3[Math.floor(Math.random() * stageMessages.stage3.length)];
          setLoadingMessage(randomMsg);
        }
      }
    }, 600);

    const messageInterval = setInterval(() => {
      if (currentProgress >= 95) {
        const waitingMessages = [
          selectedChar === 'empathy' ? "마지막 점검 중이에요... 조금만 기다려주세요!" :
            selectedChar === 'reality' ? "최종 검증 단계. 데이터 무결성 확인 중." :
              "야 진짜 거의 다 왔어. 조금만 더!",

          selectedChar === 'empathy' ? "당신을 위한 특별한 이야기를 완성하고 있어요 ✨" :
            selectedChar === 'reality' ? "분석 완료 임박. 출력 준비 중." :
              "준비 완료 직전! 거의 다 왔어!",
        ];

        const randomMsg = waitingMessages[Math.floor(Math.random() * waitingMessages.length)];
        setLoadingMessage(randomMsg);
      }
    }, 2000);

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
      // 1️⃣ 사주 기본 정보 가져오기
      const sajuRes = await fetch(`${API_BASE}/saju/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const sajuJson = await sajuRes.json();

      if (!sajuRes.ok) {
        setErr(typeof sajuJson?.detail === "string" ? sajuJson.detail : JSON.stringify(sajuJson));
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        setLoading(false);
        return;
      }

      console.log('✅ 사주 정보 로드 완료:', sajuJson);

      // 2️⃣ RAG 기반 GPT 해석 가져오기
      try {
        console.log('🔍 GPT 해석 요청 시작...');

        const interpretRes = await fetch(`${API_BASE}/saju/interpret-gpt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            day_stem: sajuJson.day_pillar[0],
            year_pillar: sajuJson.year_pillar,
            month_pillar: sajuJson.month_pillar,
            day_pillar: sajuJson.day_pillar,
            hour_pillar: sajuJson.hour_pillar,
            tone: selectedChar,
            year: parsedYmd.year,
            month: parsedYmd.month,
            day: parsedYmd.day,
            hour: parsedHm.hour,
            gender: gender,
          }),
        });

        const interpretJson = await interpretRes.json();

        console.log('✅ GPT 해석 응답:', interpretJson);
        console.log('🔍 harmony 데이터:', interpretJson.metadata?.harmony);

        setNewInterpretation(interpretJson);

      } catch (interpretError) {
        console.error('❌ GPT 해석 오류:', interpretError);
        setNewInterpretation({
          title: ELEMENT_ANALYSIS[selectedChar].title,
          content: "해석을 불러오는 중 오류가 발생했습니다.",
          metadata: { harmony: null }
        });
      }

      // 3️⃣ 사주 결과 설정
      const [hourCheongan, hourJiji] = splitPillar(sajuJson.hour_pillar);
      const [dayCheongan, dayJiji] = splitPillar(sajuJson.day_pillar);
      const [monthCheongan, monthJiji] = splitPillar(sajuJson.month_pillar);
      const [yearCheongan, yearJiji] = splitPillar(sajuJson.year_pillar);

      const hourBlock: PillarBlock = { label: "시주", cheongan: hourCheongan, jiji: hourJiji };
      const dayBlock: PillarBlock = { label: "일주", cheongan: dayCheongan, jiji: dayJiji };
      const monthBlock: PillarBlock = { label: "월주", cheongan: monthCheongan, jiji: monthJiji };
      const yearBlock: PillarBlock = { label: "년주", cheongan: yearCheongan, jiji: yearJiji };

      clearInterval(progressInterval);
      clearInterval(messageInterval);

      const finalMsg = selectedChar === 'empathy' ? "완성되었어요! 지금 보여드릴게요 💖" :
        selectedChar === 'reality' ? "분석 리포트 생성 완료." :
          "됐다! 바로 확인해봐!";
      setLoadingMessage(finalMsg);

      for (let i = 95; i <= 100; i += 1) {
        setLoadingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setResult({
        hour: hourBlock,
        day: dayBlock,
        month: monthBlock,
        year: yearBlock
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      setLoading(false);

    } catch (e: any) {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setErr(e?.message ?? "네트워크 오류");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-4 flex flex-col items-center justify-center relative" style={{ position: 'relative', zIndex: 10 }}>
      {!loading && !result && (
        <>
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {['⭐', '✨', '💖', '🌸', '🌼', '💫', '🌟', '💛'].map((emoji, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  top: `${10 + (i * 12)}%`,
                  left: `${5 + (i * 11)}%`,
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

          <div className="fixed top-8 left-8 text-6xl">🌸</div>
          <div className="fixed top-12 right-12 text-5xl">⭐</div>
          <div className="fixed bottom-16 left-16 text-5xl">🌼</div>
          <div className="fixed bottom-12 right-20 text-6xl">✨</div>
          <div className="fixed top-1/3 left-12 text-4xl">💖</div>
          <div className="fixed top-2/3 right-16 text-4xl">🦋</div>
        </>
      )}

      <div className="w-full max-w-[450px] mx-auto px-2 sm:px-0">
        <div className="border-4 border-[#adc4af] rounded-[24px] bg-white overflow-hidden shadow-xl pixel-window relative z-10">
          <div className="bg-[#c1d8c3] p-3 flex justify-between items-center text-[#556b2f] border-b-4 border-[#adc4af]">
            <div className="flex items-center gap-2">
              <img src="/images/ham_icon.png" alt="icon" className="w-10 h-10 object-contain" />
              <span className="text-sm font-bold">Saju_Hamster.exe</span>
            </div>
            <div className="flex gap-1">
              <div className="w-5 h-5 bg-white/40 flex items-center justify-center text-[#556b2f] text-[10px] rounded-sm border border-[#adc4af]">_</div>
              <div className="w-5 h-5 bg-[#ffadad] flex items-center justify-center text-white text-[10px] rounded-sm shadow-sm">X</div>
            </div>
          </div>

          <div className="p-5 bg-white">
            {loading && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                style={{
                  touchAction: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  zIndex: 9999
                }}
              >
                <div className="bg-white rounded-2xl p-6 sm:p-8 w-[90vw] sm:w-[450px] max-w-[450px] mx-4 text-center shadow-2xl">
                  <div className="mb-4 sm:mb-6">
                    <motion.div
                      initial={{ scale: 0.5, y: 50, opacity: 0 }}
                      animate={{
                        scale: [0.5, 1.3, 1],
                        y: [50, -20, 0],
                        opacity: 1
                      }}
                      transition={{
                        duration: 0.8,
                        times: [0, 0.6, 1],
                        ease: "easeOut"
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
                        <span className="text-xs sm:text-sm font-bold text-[#556b2f]">분석 진행중</span>
                        <span className="text-xl sm:text-2xl font-black text-[#556b2f]" style={{ fontFamily: 'monospace' }}>
                          {loadingProgress}% <span className="pixel-heart">💛</span>
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
                            ease: "linear"
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

            {!loading && !result && (
              <div className="text-center mb-6">
                <p className="text-[#556b2f] font-bold text-sm text-korean">
                  아래의 원하는 햄스터를 선택해줘!
                </p>
              </div>
            )}

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {loading ? null : !result ? (
                  <motion.div
                    key="input-form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-center gap-3 sm:gap-6 mb-16 sm:mb-20">
                      {(Object.keys(CHARACTERS) as Array<keyof typeof CHARACTERS>).map((id) => (
                        <button
                          key={id}
                          onClick={() => setSelectedChar(id)}
                          className="relative flex flex-col items-center focus:outline-none"
                        >
                          <motion.div
                            animate={{
                              scale: selectedChar === id ? 1.5 : 1,
                              borderColor: selectedChar === id ? "#556b2f" : "transparent",
                            }}
                            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-3 sm:border-4 overflow-hidden bg-white shadow-md transition-all ${selectedChar === id ? "ring-2 ring-[#c1d8c3]" : ""}`}
                          >
                            <img
                              src={CHARACTERS[id].img}
                              alt={CHARACTERS[id].name}
                              className={`w-full h-full object-contain ${selectedChar === id ? "grayscale-0" : "grayscale opacity-60"}`}
                            />
                          </motion.div>

                          {selectedChar === id && (
                            <motion.div
                              layoutId="activeTabName"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute -bottom-12 sm:-bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap"
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-[10px] sm:text-[11px] font-bold text-[#556b2f] bg-[#fefae0] px-2 py-0.5 rounded-full border border-[#e9edc9] shadow-sm">
                                  {CHARACTERS[id].name}
                                </span>
                                <div className="flex gap-1 text-[8px] sm:text-[9px] text-[#556b2f] opacity-70">
                                  {id === 'empathy' && (
                                    <>
                                      <span>#당신을위한</span>
                                      <span>#힐링조언</span>
                                      <span>#따뜻한위로</span>
                                    </>
                                  )}
                                  {id === 'reality' && (
                                    <>
                                      <span>#데이터로보는</span>
                                      <span>#운명분석</span>
                                      <span>#팩트폭격</span>
                                    </>
                                  )}
                                  {id === 'fun' && (
                                    <>
                                      <span>#뼈때리는</span>
                                      <span>#현실조언</span>
                                      <span>#유쾌한팩트</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>

                    <motion.div
                      key={selectedChar}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="flex flex-col items-center gap-4 mb-8 mt-4"
                    >
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 3, -3, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="relative"
                      >
                        <img
                          src={CHARACTERS[selectedChar].img}
                          alt={CHARACTERS[selectedChar].name}
                          className="w-32 h-32 sm:w-40 sm:h-40 object-contain pixel-art drop-shadow-2xl"
                        />
                      </motion.div>

                      <div className="bg-white/80 backdrop-blur-sm border-3 border-[#adc4af] rounded-2xl p-4 max-w-sm mx-4 shadow-lg">
                        <motion.p
                          key={currentGreeting}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-[11px] sm:text-[13px] leading-relaxed text-[#556b2f] font-medium text-center whitespace-pre-line"
                        >
                          {currentGreeting}
                        </motion.p>
                      </div>
                    </motion.div>

                    <div className="space-y-3 pt-4 border-t-2 border-dashed border-slate-100">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="flex bg-[#f1f3f5] p-1 rounded-xl border-3 border-[#adc4af]">
                          <button
                            onClick={() => setCalendar("solar")}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${calendar === "solar" ? "bg-black text-white shadow-sm" : "text-[#868e96]"}`}
                          >
                            양력
                          </button>
                          <button
                            onClick={() => setCalendar("lunar")}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${calendar === "lunar" ? "bg-black text-white shadow-sm" : "text-[#868e96]"}`}
                          >
                            음력
                          </button>
                        </div>

                        <div className="flex bg-[#f1f3f5] p-1 rounded-xl border-3 border-[#adc4af]">
                          <button
                            onClick={() => setGender("M")}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === "M" ? "bg-black text-white shadow-sm" : "text-[#868e96]"}`}
                          >
                            남
                          </button>
                          <button
                            onClick={() => setGender("F")}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === "F" ? "bg-black text-white shadow-sm" : "text-[#868e96]"}`}
                          >
                            여
                          </button>
                        </div>
                      </div>

                      <input
                        className="w-full rounded-xl border-3 border-[#adc4af] px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm outline-none transition-all focus:border-[#556b2f] focus:bg-yellow-50"
                        placeholder="생년월일 8자리"
                        value={birthYmd}
                        onChange={(e) => setBirthYmd(onlyDigits(e.target.value).slice(0, 8))}
                      />

                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded-xl border-3 border-[#adc4af] px-4 py-3 font-mono text-sm outline-none transition-all focus:border-[#556b2f] focus:bg-yellow-50 disabled:opacity-30"
                          placeholder="시간 4자리 (HHMM)"
                          value={birthHm}
                          disabled={timeUnknown}
                          onChange={(e) => setBirthHm(onlyDigits(e.target.value).slice(0, 4))}
                        />
                        <label className="flex items-center gap-2 border-3 border-[#adc4af] rounded-xl px-3 bg-[#fefae0] cursor-pointer hover:bg-white transition-colors">
                          <input
                            type="checkbox"
                            checked={timeUnknown}
                            onChange={(e) => setTimeUnknown(e.target.checked)}
                            className="w-4 h-4 accent-[#556b2f]"
                          />
                          <span className="text-[10px] font-bold text-[#556b2f]">모름</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          run();
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
                        disabled={loading || !birthYmd}
                        className={`
    w-full px-6 py-4
    bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
    text-gray-900 font-bold text-lg
    rounded-lg
    transform transition-all duration-200
    ${loading || !birthYmd
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                          }
    disabled:transform-none
  `}
                      >
                        {loading ? '분석 중...' : '🔮 사주 확인하기'}
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
                          🎉 사주 분석 완료!
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
                            💛
                          </motion.span>
                          <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                          >
                            💛
                          </motion.span>
                          <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                          >
                            💛
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>

                    {/* 사주 팔자 카드 */}
                    <div className="relative">
                      <button
                        onClick={() => setScriptMode(scriptMode === "hanja" ? "hangul" : "hanja")}
                        className="absolute -top-7 right-1 z-20 px-2.5 py-1 bg-[#fef08a] border-2 border-[#eab308] rounded-full text-[9px] font-bold text-[#854d0e] hover:bg-[#fde047] transition-all hover:scale-110 shadow-md"
                      >
                        {scriptMode === "hanja" ? "漢字" : "한글"}
                      </button>

                      <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none">
                        <div className="grid grid-cols-2 sm:grid-cols-4 border-b-2 border-[#adc4af] bg-[#c1d8c3]/10 text-[9px] sm:text-[10px] text-[#556b2f] font-bold text-center py-1">
                          <span>시주</span><span>일주</span><span>월주</span><span>년주</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 text-center divide-x-2 divide-[#adc4af]">
                          {pillars.map((p, i) => (
                            <div key={i} className="py-2 sm:py-3 flex flex-col items-center gap-0.5 sm:gap-1">
                              <div className="text-[8px] sm:text-[9px] text-[#556b2f] opacity-70">
                                {tenGod(result.day.cheongan.hanja, p.cheongan.hanja)}
                              </div>

                              <div className={cn("text-xl sm:text-2xl font-bold", elementClass(hanjaToElement(p.cheongan.hanja)))}>
                                {scriptMode === "hanja" ? p.cheongan.hanja : p.cheongan.hangul}
                              </div>

                              <div className={cn("text-xl sm:text-2xl font-bold", elementClass(hanjaToElement(p.jiji.hanja)))}>
                                {scriptMode === "hanja" ? p.jiji.hanja : p.jiji.hangul}
                              </div>

                              <div className="text-[8px] sm:text-[9px] text-[#556b2f] opacity-70">
                                {(() => {
                                  const ms = branchMainStem(p.jiji.hanja);
                                  return ms ? tenGod(result.day.cheongan.hanja, ms) : "";
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* 🔥 합/충 정보 표시 */}
                    {newInterpretation?.metadata?.harmony?.transformations &&
                      newInterpretation.metadata.harmony.transformations.length > 0 && (
                        <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">🔥</span>
                            <h3 className="text-sm font-bold text-orange-900">합화(合化) 정보</h3>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {newInterpretation.metadata.harmony.transformations.map((trans: any, idx: number) => {
                              // 합화 타입별 아이콘
                              const typeIcons: any = {
                                '천간합': '☀️',
                                '지지육합': '🌙',
                                '지지삼합': '⭐'
                              };

                              // 오행별 색상
                              const elementColors: any = {
                                'metal': 'text-gray-600',
                                'wood': 'text-green-600',
                                'water': 'text-blue-600',
                                'fire': 'text-red-600',
                                'earth': 'text-yellow-700'
                              };

                              return (
                                <div
                                  key={idx}
                                  className="bg-white/80 rounded-lg p-3 border border-orange-200"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base">{typeIcons[trans.type] || '✨'}</span>
                                    <span className="text-xs font-bold text-gray-700">
                                      {trans.type}
                                    </span>
                                  </div>

                                  <div className="text-sm font-semibold text-orange-800 mb-1">
                                    {trans.name}
                                  </div>

                                  <div className="text-xs text-gray-600">
                                    위치: {trans.positions?.join(' + ')}
                                  </div>

                                  <div className="flex items-center gap-1 mt-2 text-xs">
                                    <span className="text-gray-500">
                                      {trans.original_elements?.map((el: string) => {
                                        const labels: any = {
                                          'wood': '木', 'fire': '火', 'earth': '土',
                                          'metal': '金', 'water': '水'
                                        };
                                        return labels[el];
                                      }).join(' + ')}
                                    </span>
                                    <span className="text-orange-500">→</span>
                                    <span className={`font-bold ${elementColors[trans.result]}`}>
                                      {trans.result === 'metal' ? '金' :
                                        trans.result === 'wood' ? '木' :
                                          trans.result === 'water' ? '水' :
                                            trans.result === 'fire' ? '火' :
                                              trans.result === 'earth' ? '土' : trans.result}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}


                    {/* 오행 에너지 섹션 */}
                    <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none">
                      <button
                        onClick={() => {
                          setExpandedSection(expandedSection === "elements" ? null : "elements");
                          setShowFortune(false);
                          setShowCharm(false);
                          setShowTalent(false);
                          setShowStrength(false);
                          setShowRelations(false);
                          setShowSpecialStars(false);
                          setShowToday(false);
                        }}
                        className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-[#f0f5f1] transition-colors"
                      >
                        <p className="text-[10px] sm:text-[11px] font-bold text-[#556b2f] flex items-center gap-1 sm:gap-2">
                          <span className="text-sm sm:text-base">{ELEMENT_ANALYSIS[selectedChar].icon}</span>
                          <span>{ELEMENT_ANALYSIS[selectedChar].title}</span>
                        </p>
                        <motion.span
                          animate={{ rotate: expandedSection === "elements" ? 180 : 0 }}
                          className="text-[10px] sm:text-xs text-[#556b2f]"
                        >
                          ▼
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {expandedSection === "elements" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 border-t-2 border-[#adc4af] space-y-4">
                              {/* 합화 정보 표시 (있을 때만) */}
                              {newInterpretation?.metadata?.harmony?.transformations?.length > 0 && (
                                <div className="mb-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">🔥</span>
                                    <h3 className="text-lg font-bold text-orange-900">합화(合化) 발생!</h3>
                                  </div>

                                  {/* 합화 목록 */}
                                  <div className="space-y-2 mb-4">
                                    {newInterpretation.metadata.harmony.transformations.map((trans: any, idx: number) => (
                                      <div key={idx} className="bg-white/60 rounded-lg p-2 flex items-center gap-2">
                                        <span className="text-sm">✨</span>
                                        <span className="text-sm font-medium text-gray-800">{trans.name}</span>
                                        <span className="text-xs text-gray-600">
                                          ({trans.positions?.join(', ')})
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* 토글 버튼 */}
                                  <div className="flex justify-center">
                                    <button
                                      onClick={() => setShowHarmonyAfter(!showHarmonyAfter)}
                                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
                                    >
                                      {showHarmonyAfter ? '🌿 원래 게이지 보기' : '✨ 합화 후 게이지 보기'}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* 오행 게이지 (기본: 원래 게이지, 토글: 합화 후 게이지) */}
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={showHarmonyAfter ? 'after' : 'before'}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.3 }}
                                  className="space-y-3 mb-6"
                                >
                                  {/* 제목 (합화 후일 때만 표시) */}
                                  {showHarmonyAfter && newInterpretation?.metadata?.harmony?.transformations?.length > 0 && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm">✨</span>
                                      <h4 className="text-sm font-bold text-orange-800">합화 후 오행 분포</h4>
                                    </div>
                                  )}

                                  {Object.entries(
                                    showHarmonyAfter && newInterpretation?.metadata?.harmony?.transformed
                                      ? newInterpretation.metadata.harmony.transformed
                                      : elementSummary
                                  ).map(([el, value]) => {
                                    // elementSummary는 배열, harmony.transformed는 숫자
                                    const count = Array.isArray(value) ? value.length : (value as number);

                                    const labels: any = {
                                      wood: "木 (나무)", fire: "火 (불)", earth: "土 (흙)", metal: "金 (쇠)", water: "水 (물)"
                                    };
                                    const colors: any = {
                                      wood: "bg-[#2ecc71]", fire: "bg-[#e74c3c]", earth: "bg-[#f1c40f]", metal: "bg-[#95a5a6]", water: "bg-[#3498db]"
                                    };
                                    const percentage = (count / 8) * 100;

                                    return (
                                      <div key={el} className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center px-1">
                                          <span className="text-[10px] font-bold text-[#556b2f]">{labels[el]}</span>
                                          <span className={cn(
                                            "text-[10px] font-black",
                                            showHarmonyAfter ? "text-orange-600" : "text-[#556b2f] opacity-70"
                                          )}>
                                            {count} / 8
                                          </span>
                                        </div>

                                        <div className="h-7 w-full bg-[#e9ecef] border-2 border-[#556b2f]/20 relative overflow-hidden">
                                          {[...Array(19)].map((_, i) => (
                                            <div
                                              key={i}
                                              className="absolute top-0 bottom-0 w-[1px] bg-[#556b2f]"
                                              style={{ left: `${(i + 1) * 5}%`, opacity: 0.15 }}
                                            />
                                          ))}

                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{
                                              duration: 0.5,
                                              ease: "easeOut",
                                              delay: 0.1
                                            }}
                                            style={{ imageRendering: 'pixelated' }}
                                            className={cn("h-full relative z-10", colors[el])}
                                          >
                                            <div className="absolute top-0 left-0 w-full h-[30%] bg-white/20" />
                                          </motion.div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </motion.div>
                              </AnimatePresence>


                              {/* GPT 해석 */}
                              {newInterpretation?.interpretations && newInterpretation.interpretations.length > 0 && (
                                <div className="mt-6 pt-4 border-t-2 border-dashed border-[#fde047]">
                                  {newInterpretation.interpretations.map((interp: any, idx: number) => (
                                    <div key={idx} className="mb-6">
                                      <div className="bg-[#fef3c7] p-3 rounded-lg mb-3">
                                        <h4 className="font-bold text-[11px] text-[#92400e]">
                                          ✨ {interp.title}
                                        </h4>
                                      </div>
                                      <div className="text-[11px] leading-relaxed text-[#556b2f] whitespace-pre-wrap">
                                        {interp.content}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 대운/세운 섹션 */}
                    {fortuneAnalysis && (
                      <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none">
                        <button
                          onClick={() => {
                            setShowFortune(!showFortune);
                            setExpandedSection(null);
                            setShowCharm(false);
                            setShowTalent(false);
                            setShowStrength(false);
                            setShowRelations(false);
                            setShowSpecialStars(false);
                            setShowToday(false);
                          }}
                          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-[#f0f5f1] transition-colors"
                        >
                          <p className="text-[10px] sm:text-[11px] font-bold text-[#556b2f] flex items-center gap-1 sm:gap-2">
                            <span className="text-sm sm:text-base">{FORTUNE_ANALYSIS[selectedChar].icon}</span>
                            <span>{FORTUNE_ANALYSIS[selectedChar].title}</span>
                          </p>
                          <motion.span
                            animate={{ rotate: showFortune ? 180 : 0 }}
                            className="text-[10px] sm:text-xs text-[#556b2f]"
                          >
                            ▼
                          </motion.span>
                        </button>

                        <AnimatePresence>
                          {showFortune && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 border-t-2 border-[#adc4af] space-y-3">
                                <div className="bg-[#fefae0] p-3 rounded-lg border-2 border-[#adc4af]">
                                  <h4 className="font-bold text-[11px] mb-2 flex items-center gap-1">
                                    <span>🔵</span>
                                    <span>
                                      현재 대운 ({fortuneAnalysis.greatFortune.current.startAge}~
                                      {fortuneAnalysis.greatFortune.current.endAge}세) -
                                      {fortuneAnalysis.greatFortune.current.pillar}
                                    </span>
                                  </h4>
                                  <p className="text-[11px] leading-relaxed whitespace-pre-line text-korean">
                                    {fortuneAnalysis.greatFortune.current.interpretation[selectedChar]}
                                  </p>
                                  <div className="mt-2 text-[10px] text-gray-600">
                                    <span className="font-semibold">천간:</span>{" "}
                                    {fortuneAnalysis.greatFortune.current.stem} (
                                    {fortuneAnalysis.greatFortune.current.stemTenGod}) |{" "}
                                    <span className="font-semibold">지지:</span>{" "}
                                    {fortuneAnalysis.greatFortune.current.branch} (
                                    {fortuneAnalysis.greatFortune.current.branchTenGod})
                                  </div>
                                </div>

                                <div className="bg-[#e8f5e9] p-3 rounded-lg border-2 border-[#adc4af]">
                                  <h4 className="font-bold text-[11px] mb-2 flex items-center gap-1">
                                    <span>🔜</span>
                                    <span>
                                      다음 대운 ({fortuneAnalysis.greatFortune.next.startAge}~
                                      {fortuneAnalysis.greatFortune.next.endAge}세) -
                                      {fortuneAnalysis.greatFortune.next.pillar}
                                    </span>
                                  </h4>
                                  <p className="text-[11px] leading-relaxed whitespace-pre-line text-korean">
                                    {fortuneAnalysis.greatFortune.next.interpretation[selectedChar]}
                                  </p>
                                  <div className="mt-2 text-[10px] text-gray-600">
                                    <span className="font-semibold">천간:</span>{" "}
                                    {fortuneAnalysis.greatFortune.next.stem} (
                                    {fortuneAnalysis.greatFortune.next.stemTenGod}) |{" "}
                                    <span className="font-semibold">지지:</span>{" "}
                                    {fortuneAnalysis.greatFortune.next.branch} (
                                    {fortuneAnalysis.greatFortune.next.branchTenGod})
                                  </div>
                                </div>

                                <div className="bg-[#fff3e0] p-3 rounded-lg border-2 border-[#adc4af]">
                                  <h4 className="font-bold text-[11px] mb-2 flex items-center gap-1">
                                    <span>⭐</span>
                                    <span>
                                      {fortuneAnalysis.yearFortune.current.year}년 (현재 세운) -
                                      {fortuneAnalysis.yearFortune.current.pillar}
                                    </span>
                                  </h4>
                                  <p className="text-[11px] leading-relaxed whitespace-pre-line text-korean">
                                    {fortuneAnalysis.yearFortune.current.interpretation[selectedChar]}
                                  </p>
                                  <div className="mt-2 text-[10px] text-gray-600">
                                    <span className="font-semibold">천간:</span>{" "}
                                    {fortuneAnalysis.yearFortune.current.stem} (
                                    {fortuneAnalysis.yearFortune.current.stemTenGod}) |{" "}
                                    <span className="font-semibold">지지:</span>{" "}
                                    {fortuneAnalysis.yearFortune.current.branch} (
                                    {fortuneAnalysis.yearFortune.current.branchTenGod})
                                  </div>
                                </div>

                                <div className="bg-[#f3e5f5] p-3 rounded-lg border-2 border-[#adc4af]">
                                  <h4 className="font-bold text-[11px] mb-2 flex items-center gap-1">
                                    <span>🔮</span>
                                    <span>
                                      {fortuneAnalysis.yearFortune.next.year}년 (다음 세운) -
                                      {fortuneAnalysis.yearFortune.next.pillar}
                                    </span>
                                  </h4>
                                  <p className="text-[11px] leading-relaxed whitespace-pre-line text-korean">
                                    {fortuneAnalysis.yearFortune.next.interpretation[selectedChar]}
                                  </p>
                                  <div className="mt-2 text-[10px] text-gray-600">
                                    <span className="font-semibold">천간:</span>{" "}
                                    {fortuneAnalysis.yearFortune.next.stem} (
                                    {fortuneAnalysis.yearFortune.next.stemTenGod}) |{" "}
                                    <span className="font-semibold">지지:</span>{" "}
                                    {fortuneAnalysis.yearFortune.next.branch} (
                                    {fortuneAnalysis.yearFortune.next.branchTenGod})
                                  </div>
                                </div>

                                <div className="text-center text-[10px] text-gray-500 mt-3">
                                  대운 방향: {fortuneAnalysis.greatFortune.direction}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* 매력 분석 */}
                    {charmAnalysis && (
                      <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none">
                        <button
                          onClick={() => {
                            setShowCharm(!showCharm);
                            setExpandedSection(null);
                            setShowFortune(false);
                            setShowTalent(false);
                            setShowStrength(false);
                            setShowRelations(false);
                            setShowSpecialStars(false);
                            setShowToday(false);
                          }}
                          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-[#f0f5f1] transition-colors"
                        >
                          <p className="text-[10px] sm:text-[11px] font-bold text-[#556b2f] flex items-center gap-1 sm:gap-2">
                            <span className="text-sm sm:text-base">{CHARM_ANALYSIS[selectedChar].icon}</span>
                            <span>{CHARM_ANALYSIS[selectedChar].title}</span>
                          </p>
                          <motion.span
                            animate={{ rotate: showCharm ? 180 : 0 }}
                            className="text-[10px] sm:text-xs text-[#556b2f]"
                          >
                            ▼
                          </motion.span>
                        </button>

                        <AnimatePresence>
                          {showCharm && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 border-t-2 border-[#adc4af]">
                                <div className="text-[11px] leading-relaxed text-[#556b2f] whitespace-pre-wrap">
                                  {charmAnalysis}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* 재능 분석 */}
                    {talentAnalysis && (
                      <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none">
                        <button
                          onClick={() => {
                            setShowTalent(!showTalent);
                            setExpandedSection(null);
                            setShowFortune(false);
                            setShowCharm(false);
                            setShowStrength(false);
                            setShowRelations(false);
                            setShowSpecialStars(false);
                            setShowToday(false);
                          }}
                          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-[#f0f5f1] transition-colors"
                        >
                          <p className="text-[10px] sm:text-[11px] font-bold text-[#556b2f] flex items-center gap-1 sm:gap-2">
                            <span className="text-sm sm:text-base">{TALENT_ANALYSIS[selectedChar].icon}</span>
                            <span>{TALENT_ANALYSIS[selectedChar].title}</span>
                          </p>
                          <motion.span
                            animate={{ rotate: showTalent ? 180 : 0 }}
                            className="text-[10px] sm:text-xs text-[#556b2f]"
                          >
                            ▼
                          </motion.span>
                        </button>

                        <AnimatePresence>
                          {showTalent && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 border-t-2 border-[#adc4af]">
                                <div className="text-[11px] leading-relaxed text-[#556b2f] whitespace-pre-wrap">
                                  {talentAnalysis}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* 신강약 분석 */}
                    {strengthAnalysis && (
                      <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none">
                        <button
                          onClick={() => {
                            setShowStrength(!showStrength);
                            setExpandedSection(null);
                            setShowFortune(false);
                            setShowCharm(false);
                            setShowTalent(false);
                            setShowRelations(false);
                            setShowSpecialStars(false);
                            setShowToday(false);
                          }}
                          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-[#f0f5f1] transition-colors"
                        >
                          <p className="text-[10px] sm:text-[11px] font-bold text-[#556b2f] flex items-center gap-1 sm:gap-2">
                            <span className="text-sm sm:text-base">{STRENGTH_ANALYSIS[selectedChar].icon}</span>
                            <span>{STRENGTH_ANALYSIS[selectedChar].title}</span>
                          </p>
                          <motion.span
                            animate={{ rotate: showStrength ? 180 : 0 }}
                            className="text-[10px] sm:text-xs text-[#556b2f]"
                          >
                            ▼
                          </motion.span>
                        </button>

                        <AnimatePresence>
                          {showStrength && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 border-t-2 border-[#adc4af]">
                                <div className="text-[11px] leading-relaxed text-[#556b2f] mb-2">
                                  <span className="font-bold text-base">{strengthAnalysis.type}</span>
                                  <span className="ml-2 opacity-70">(점수: {strengthAnalysis.score})</span>
                                </div>
                                <div className="text-[11px] leading-relaxed text-[#556b2f] whitespace-pre-wrap mb-3">
                                  {strengthAnalysis[selectedChar]}
                                </div>
                                <div className="text-[11px] leading-relaxed text-[#556b2f] bg-[#fefae0] p-3 rounded-lg">
                                  <span className="font-bold">💡 추천: </span>
                                  {strengthAnalysis.recommendation}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* 합충 관계 분석 */}
                    {relationsAnalysis && (
                      <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none">
                        <button
                          onClick={() => {
                            setShowRelations(!showRelations);
                            setExpandedSection(null);
                            setShowFortune(false);
                            setShowCharm(false);
                            setShowTalent(false);
                            setShowStrength(false);
                            setShowSpecialStars(false);
                            setShowToday(false);
                          }}
                          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-[#f0f5f1] transition-colors"
                        >
                          <p className="text-[10px] sm:text-[11px] font-bold text-[#556b2f] flex items-center gap-1 sm:gap-2">
                            <span className="text-sm sm:text-base">{RELATIONS_ANALYSIS[selectedChar].icon}</span>
                            <span>{RELATIONS_ANALYSIS[selectedChar].title}</span>
                          </p>
                          <motion.span
                            animate={{ rotate: showRelations ? 180 : 0 }}
                            className="text-[10px] sm:text-xs text-[#556b2f]"
                          >
                            ▼
                          </motion.span>
                        </button>

                        <AnimatePresence>
                          {showRelations && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 border-t-2 border-[#adc4af]">
                                <div className="text-[11px] leading-relaxed text-[#556b2f] whitespace-pre-wrap mb-3">
                                  {relationsAnalysis[selectedChar]}
                                </div>

                                {(relationsAnalysis.총합개수 > 0) && (
                                  <div className="bg-[#e8f5e9] p-3 rounded-lg mb-2">
                                    <div className="font-bold text-[10px] mb-1 text-green-700">
                                      ✨ 좋은 관계 ({relationsAnalysis.총합개수}건)
                                    </div>
                                    <div className="text-[10px] text-green-700 space-y-1">
                                      {relationsAnalysis.천간합.length > 0 && (
                                        <div>천간합: {relationsAnalysis.천간합.join(", ")}</div>
                                      )}
                                      {relationsAnalysis.육합.length > 0 && (
                                        <div>육합: {relationsAnalysis.육합.join(", ")}</div>
                                      )}
                                      {relationsAnalysis.삼합.length > 0 && (
                                        <div>삼합: {relationsAnalysis.삼합.join(", ")}</div>
                                      )}
                                      {relationsAnalysis.방합.length > 0 && (
                                        <div>방합: {relationsAnalysis.방합.join(", ")}</div>
                                      )}
                                      {relationsAnalysis.반합.length > 0 && (
                                        <div>반합: {relationsAnalysis.반합.join(", ")}</div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {(relationsAnalysis.총흉개수 > 0) && (
                                  <div className="bg-[#fff3e0] p-3 rounded-lg">
                                    <div className="font-bold text-[10px] mb-1 text-orange-700">
                                      ⚡ 변화의 에너지 ({relationsAnalysis.총흉개수}건)
                                    </div>
                                    <div className="text-[10px] text-orange-700 space-y-1">
                                      {relationsAnalysis.천간충.length > 0 && (
                                        <div>천간충: {relationsAnalysis.천간충.join(", ")}</div>
                                      )}
                                      {relationsAnalysis.충.length > 0 && (
                                        <div>지지충: {relationsAnalysis.충.join(", ")}</div>
                                      )}
                                      {relationsAnalysis.형.length > 0 && (
                                        <div>형: {relationsAnalysis.형.join(", ")}</div>
                                      )}
                                      {relationsAnalysis.해.length > 0 && (
                                        <div>해: {relationsAnalysis.해.join(", ")}</div>
                                      )}
                                      {relationsAnalysis.파.length > 0 && (
                                        <div>파: {relationsAnalysis.파.join(", ")}</div>
                                      )}
                                      {relationsAnalysis.원진.length > 0 && (
                                        <div>원진: {relationsAnalysis.원진.join(", ")}</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* 특수신살 분석 */}
                    {specialStarsAnalysis && (
                      <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none">
                        <button
                          onClick={() => {
                            setShowSpecialStars(!showSpecialStars);
                            setExpandedSection(null);
                            setShowFortune(false);
                            setShowCharm(false);
                            setShowTalent(false);
                            setShowStrength(false);
                            setShowRelations(false);
                            setShowToday(false);
                          }}
                          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-[#f0f5f1] transition-colors"
                        >
                          <p className="text-[10px] sm:text-[11px] font-bold text-[#556b2f] flex items-center gap-1 sm:gap-2">
                            <span className="text-sm sm:text-base">{SPECIAL_STARS_ANALYSIS[selectedChar].icon}</span>
                            <span>{SPECIAL_STARS_ANALYSIS[selectedChar].title}</span>
                          </p>
                          <motion.span
                            animate={{ rotate: showSpecialStars ? 180 : 0 }}
                            className="text-[10px] sm:text-xs text-[#556b2f]"
                          >
                            ▼
                          </motion.span>
                        </button>

                        <AnimatePresence>
                          {showSpecialStars && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 border-t-2 border-[#adc4af]">
                                <div className="text-[11px] leading-relaxed text-[#556b2f] whitespace-pre-wrap mb-3">
                                  {specialStarsAnalysis[selectedChar]}
                                </div>

                                {specialStarsAnalysis.stars.length > 0 && (
                                  <div className="space-y-2">
                                    {specialStarsAnalysis.stars.map((star: any, idx: number) => (
                                      <div key={idx} className="bg-[#fefae0] p-3 rounded-lg">
                                        <div className="font-bold text-[10px] mb-1 text-[#556b2f]">
                                          ⭐ {star.name}
                                        </div>
                                        <div className="text-[10px] text-[#556b2f]">
                                          {star.description}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* 오늘의 운세 */}
                    {todayFortune && (
                      <div className="border-4 border-[#adc4af] rounded-2xl bg-white overflow-hidden shadow-none">
                        <button
                          onClick={() => {
                            setShowToday(!showToday);
                            setExpandedSection(null);
                            setShowFortune(false);
                            setShowCharm(false);
                            setShowTalent(false);
                            setShowStrength(false);
                            setShowRelations(false);
                            setShowSpecialStars(false);
                          }}
                          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-[#f0f5f1] transition-colors"
                        >
                          <p className="text-[10px] sm:text-[11px] font-bold text-[#556b2f] flex items-center gap-1 sm:gap-2">
                            <span className="text-sm sm:text-base">{TODAY_ANALYSIS[selectedChar].icon}</span>
                            <span>{TODAY_ANALYSIS[selectedChar].title}</span>
                          </p>
                          <motion.span
                            animate={{ rotate: showToday ? 180 : 0 }}
                            className="text-[10px] sm:text-xs text-[#556b2f]"
                          >
                            ▼
                          </motion.span>
                        </button>

                        <AnimatePresence>
                          {showToday && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 border-t-2 border-[#adc4af]">
                                <div className="space-y-3 text-[11px]">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-[#fef3c7] p-2 rounded-lg text-center">
                                      <div className="font-bold text-[10px] mb-1 text-[#92400e]">행운의 색</div>
                                      <div className="text-[10px] text-[#92400e]">{todayFortune.luckyColor}</div>
                                    </div>
                                    <div className="bg-[#dbeafe] p-2 rounded-lg text-center">
                                      <div className="font-bold text-[10px] mb-1 text-[#1e3a8a]">행운의 숫자</div>
                                      <div className="text-[10px] text-[#1e3a8a]">{todayFortune.luckyNumber}</div>
                                    </div>
                                    <div className="bg-[#fce7f3] p-2 rounded-lg text-center">
                                      <div className="font-bold text-[10px] mb-1 text-[#831843]">행운의 방향</div>
                                      <div className="text-[10px] text-[#831843]">{todayFortune.luckyDirection}</div>
                                    </div>
                                  </div>
                                  <div className="bg-[#f0fdf4] p-3 rounded-lg border-2 border-[#bbf7d0]">
                                    <div className="font-bold text-[10px] mb-2 text-[#166534]">💡 오늘의 조언</div>
                                    <div className="text-[11px] leading-relaxed text-[#166534]">
                                      {todayFortune.advice}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* 다시 하기 버튼 */}
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setResult(null);
                          setWealthReport(null);
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
  );
}
