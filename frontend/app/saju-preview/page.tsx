"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { use, useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import { Icon } from "@iconify/react";
import { dayPillarTexts } from "@/data/dayPillarAnimal";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://saju-backend-eqd6.onrender.com";

const HANJA_TO_HANGUL: Record<string, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무", 己: "기",
  庚: "경", 辛: "신", 壬: "임", 癸: "계",
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};

function hanjaToHangul(h: string): string {
  return HANJA_TO_HANGUL[h] ?? "";
}

function dayPillarToKey(dayPillar: string): string {
  if (!dayPillar || dayPillar.length < 2) return "";
  return hanjaToHangul(dayPillar[0]) + hanjaToHangul(dayPillar[1]);
}

function getDayPillarAnimalName(dayPillarKey: string): string {
  const text = dayPillarTexts[dayPillarKey]?.empathy;
  if (!text) return "";
  const m = text.match(/일주 동물<\/strong>은 (.+?)입니다/);
  return m ? m[1].trim() : "";
}

/** 동물 이름 앞 색상 접두사(하늘빛, 은빛 등)에 맞는 텍스트 색상 */
const ANIMAL_COLOR_BY_PREFIX: Record<string, string> = {
  하늘빛: "#5B9BD5",
  은빛: "#9CA3AF",
  초록빛: "#059669",
  연두빛: "#84CC16",
  주황빛: "#EA580C",
  노랑빛: "#CA8A04",
  연노랑빛: "#D4A853",
  붉은빛: "#DC2626",
  파랑빛: "#2563EB",
};

function getAnimalNameColor(animalName: string): string {
  for (const prefix of Object.keys(ANIMAL_COLOR_BY_PREFIX)) {
    if (animalName.startsWith(prefix)) return ANIMAL_COLOR_BY_PREFIX[prefix];
  }
  return "var(--text-primary)";
}

type Element = "wood" | "fire" | "earth" | "metal" | "water";
type Polarity = "yang" | "yin";

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

function branchMainStem(branch: string): string | null {
  const map: Record<string, string> = {
    子: "癸", 丑: "己", 寅: "甲", 卯: "乙", 辰: "戊", 巳: "丙",
    午: "丁", 未: "己", 申: "庚", 酉: "辛", 戌: "戊", 亥: "壬",
  };
  return map[branch] ?? null;
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

function hanjaToElement(h: string): Element | "none" {
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

// 기본 오행 색상 (기존 용도 유지)
const ELEMENT_COLOR: Record<string, string> = {
  wood: "#059669",
  fire: "#e11d48",
  earth: "#b45309",
  metal: "#64748b",
  water: "#2563eb",
  none: "var(--text-primary)",
};

// 만세력/대운 표 전용 팔레트
const ELEMENT_PALETTE: Record<string, { text: string; bg: string; border: string }> = {
  wood: { text: "#27500A", bg: "#C0DD97", border: "#3B6D11" },
  fire: { text: "#712B13", bg: "#F0997B", border: "#993C1D" },
  earth: { text: "#633806", bg: "#FAC775", border: "#854F0B" },
  // 금(경금·신금·유금)은 박스 배경을 흰색으로 빼고, 글자·테두리만 짙게 유지
  metal: { text: "#444441", bg: "#FFFFFF", border: "#D4C9B8" },
  // 수(임수·계수, 자수·해수)는 기존 금색 팔레트를 사용
  water: { text: "#444441", bg: "#B4B2A9", border: "#5F5E5A" },
  none: { text: "var(--text-primary)", bg: "#EDE7DB", border: "#D4C9B8" },
};

/** 오행 영문 → 한글 (지장간 표기용) */
const ELEMENT_NAME_KR: Record<string, string> = {
  wood: "목", fire: "화", earth: "토", metal: "금", water: "수",
};

/** 십이운성: 일간(한글) → 지지(한글) → 지지운 이름 */
const TWELVE_STATES_MAP: Record<string, Record<string, string>> = {
  갑: { 해: "장생", 자: "목욕", 축: "관대", 인: "건록", 묘: "제왕", 진: "쇠", 사: "병", 오: "사", 미: "묘", 신: "절", 유: "태", 술: "양" },
  을: { 오: "장생", 사: "목욕", 진: "관대", 묘: "건록", 인: "제왕", 축: "쇠", 자: "병", 해: "사", 술: "묘", 유: "절", 신: "태", 미: "양" },
  병: { 인: "장생", 묘: "목욕", 진: "관대", 사: "건록", 오: "제왕", 미: "쇠", 신: "병", 유: "사", 술: "묘", 해: "절", 자: "태", 축: "양" },
  정: { 유: "장생", 신: "목욕", 미: "관대", 오: "건록", 사: "제왕", 진: "쇠", 묘: "병", 인: "사", 축: "묘", 자: "절", 해: "태", 술: "양" },
  무: { 인: "장생", 묘: "목욕", 진: "관대", 사: "건록", 오: "제왕", 미: "쇠", 신: "병", 유: "사", 술: "묘", 해: "절", 자: "태", 축: "양" },
  기: { 유: "장생", 신: "목욕", 미: "관대", 오: "건록", 사: "제왕", 진: "쇠", 묘: "병", 인: "사", 축: "묘", 자: "절", 해: "태", 술: "양" },
  경: { 사: "장생", 오: "목욕", 미: "관대", 신: "건록", 유: "제왕", 술: "쇠", 해: "병", 자: "사", 축: "묘", 인: "절", 묘: "태", 진: "양" },
  신: { 자: "장생", 해: "목욕", 술: "관대", 유: "건록", 신: "제왕", 미: "쇠", 오: "병", 사: "사", 진: "묘", 묘: "절", 인: "태", 축: "양" },
  임: { 신: "장생", 유: "목욕", 술: "관대", 해: "건록", 자: "제왕", 축: "쇠", 인: "병", 묘: "사", 진: "묘", 사: "절", 오: "태", 미: "양" },
  계: { 묘: "장생", 인: "목욕", 축: "관대", 자: "건록", 해: "제왕", 술: "쇠", 유: "병", 신: "사", 미: "묘", 오: "절", 사: "태", 진: "양" },
};

function getTwelveState(dayStemHanja: string, branchHanja: string): string {
  const c = hanjaToHangul(dayStemHanja);
  const j = hanjaToHangul(branchHanja);
  return TWELVE_STATES_MAP[c]?.[j] ?? "";
}

const GANJI_60 = [
  "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉",
  "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未",
  "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳",
  "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯",
  "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
  "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥",
];

function getSeunPillar(year: number): string {
  const baseYear = 2024;
  const baseYearIndex = 40;
  const idx = (baseYearIndex + (year - baseYear) + 60) % 60;
  return GANJI_60[idx] ?? "";
}

interface SajuRow {
  id: number;
  name: string;
  relation: string | null;
  birthdate: string;
  birth_time: string | null;
  calendar_type: string;
  gender: string;
  iana_timezone?: string | null;
}

/** 로컬 테스트용 샘플 사주 (?test=1 사용 시) */
const MOCK_SAJU: SajuRow = {
  id: 0,
  name: "테스트",
  relation: null,
  birthdate: "2025-08-18",
  birth_time: "19:14",
  calendar_type: "양력",
  gender: "여자",
};

function SajuPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sajuId = searchParams.get("id");
  const isTestMode = searchParams.get("test") === "1";

  const [saju, setSaju] = useState<SajuRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pillars, setPillars] = useState<{
    year_pillar: string;
    month_pillar: string;
    day_pillar: string;
    hour_pillar: string;
  } | null>(null);
  const [jijanggan, setJijanggan] = useState<{
    hour: Array<{ hanja: string; hangul: string; element: string }>;
    day: Array<{ hanja: string; hangul: string; element: string }>;
    month: Array<{ hanja: string; hangul: string; element: string }>;
    year: Array<{ hanja: string; hangul: string; element: string }>;
  } | null>(null);
  const [twelveStates, setTwelveStates] = useState<{
    hour: string;
    day: string;
    month: string;
    year: string;
  } | null>(null);
  const [daeun, setDaeun] = useState<{
    daeun_start_age: number | null;
    daeun_direction: string | null;
    daeun_list: string[] | null;
  }>({ daeun_start_age: null, daeun_direction: null, daeun_list: null });
  const [selectedDaeunIndex, setSelectedDaeunIndex] = useState<number | null>(null);
  const [deducting, setDeducting] = useState(false);
  const [showSeedSheet, setShowSeedSheet] = useState(false);

  function buildPillarBlock(label: string, pillarStr: string) {
    if (!pillarStr || pillarStr.length < 2)
      return { label, cheongan: { hanja: "", hangul: "" }, jiji: { hanja: "", hangul: "" } };
    const [c, j] = [pillarStr[0], pillarStr[1]];
    return {
      label,
      cheongan: { hanja: c, hangul: hanjaToHangul(c) },
      jiji: { hanja: j, hangul: hanjaToHangul(j) },
    };
  }

  // 일간 기준 십이운성 계산 (홈 만세력과 동일한 로직)
  useEffect(() => {
    if (!pillars) return;
    const dayStem = pillars.day_pillar?.[0];
    if (!dayStem) return;
    const mk = (p: string | undefined) =>
      p && p.length >= 2 ? getTwelveState(dayStem, p[1]) : "";
    setTwelveStates({
      hour: mk(pillars.hour_pillar),
      day: mk(pillars.day_pillar),
      month: mk(pillars.month_pillar),
      year: mk(pillars.year_pillar),
    });
  }, [pillars?.day_pillar, pillars?.hour_pillar, pillars?.month_pillar, pillars?.year_pillar]);

  async function handleStartAnalysis() {
    if (!saju || !pillars) return;
    setDeducting(true);
    try {
      const res = await fetch(`${API_BASE}/api/analysis/deduct`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        router.push("/start");
        return;
      }
      // TODO: 분석권 정책 확정 전까지는, 부족해도 일단 분석은 진행
      // const data = await res.json();
      // if (!data.success) {
      //   setShowSeedSheet(true);
      //   return;
      // }
      const birthYmd = (saju.birthdate || "").replace(/-/g, "").slice(0, 8);
      const birthHm = (saju.birth_time || "").replace(/\D/g, "").slice(0, 4) || "1200";
      const gender = saju.gender === "남자" ? "M" : "F";
      const calendar = saju.calendar_type === "음력" ? "lunar" : "solar";
      const loadedSaju = {
        birthYmd,
        birthHm,
        gender,
        calendar,
        timeUnknown: false,
        result: {
          hour: buildPillarBlock("시주", pillars.hour_pillar),
          day: buildPillarBlock("일주", pillars.day_pillar),
          month: buildPillarBlock("월주", pillars.month_pillar),
          year: buildPillarBlock("년주", pillars.year_pillar),
          twelve_states: twelveStates ?? undefined,
          jijanggan: jijanggan ?? undefined,
        },
      };
      sessionStorage.setItem("loadedSaju", JSON.stringify(loadedSaju));
      router.push(`/add?loaded=${sajuId}`);
    } catch {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setDeducting(false);
    }
  }

  useEffect(() => {
    if (!sajuId && !isTestMode) {
      setError("사주 정보가 없습니다. 로컬 테스트: 주소에 ?test=1 을 붙여 보세요.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        let data: SajuRow;
        if (isTestMode) {
          data = MOCK_SAJU;
          setSaju(data);
        } else {
          const res = await fetch(`${API_BASE}/api/saju/${sajuId}`, {
            credentials: "include",
            headers: getAuthHeaders(),
          });
          if (!res.ok) {
            setError("사주를 불러올 수 없습니다. (로그인 후 사주 목록에서 들어오거나, 테스트는 ?test=1 로 확인하세요)");
            setLoading(false);
            return;
          }
          data = await res.json();
          if (cancelled) return;
          setSaju(data);
        }

        const [y, m, d] = (data.birthdate || "").split("-").map(Number);
        const timePart = (data.birth_time || "").trim();
        let hour = 12,
          minute = 0;
        if (timePart && /^\d{1,2}:\d{1,2}$/.test(timePart)) {
          const [h, mi] = timePart.split(":").map(Number);
          hour = h;
          minute = mi ?? 0;
        }

        const calendar = data.calendar_type === "음력" ? "lunar" : "solar";
        const gender = data.gender === "남자" ? "M" : "F";

        const tz = (data as SajuRow).iana_timezone?.trim() || undefined;
        const fullRes = await fetch(`${API_BASE}/saju/full`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calendar_type: calendar,
            year: y,
            month: m,
            day: d,
            hour,
            minute,
            gender,
            ...(tz ? { iana_timezone: tz } : {}),
          }),
        });
        if (!fullRes.ok) {
          setLoading(false);
          return;
        }
        const fullData = await fullRes.json();
        if (cancelled) return;
        setPillars({
          year_pillar: fullData.year_pillar,
          month_pillar: fullData.month_pillar,
          day_pillar: fullData.day_pillar,
          hour_pillar: fullData.hour_pillar,
        });
        if (fullData.jijanggan) setJijanggan(fullData.jijanggan);
        if (fullData.twelve_states) setTwelveStates(fullData.twelve_states);
        if (fullData.daeun_list != null) {
          setDaeun({
            daeun_start_age: fullData.daeun_start_age ?? null,
            daeun_direction: fullData.daeun_direction ?? null,
            daeun_list: fullData.daeun_list,
          });
        }
      } catch {
        if (!cancelled) setError("불러오기 실패");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sajuId, isTestMode]);

  const dayPillarKey = useMemo(() => {
    return pillars?.day_pillar ? dayPillarToKey(pillars.day_pillar) : "";
  }, [pillars?.day_pillar]);

  const dayPillarAnimalName = useMemo(
    () => getDayPillarAnimalName(dayPillarKey),
    [dayPillarKey]
  );

  const pillarBlocks = useMemo(() => {
    if (!pillars) return [];
    return [
      { label: "시주", value: pillars.hour_pillar },
      { label: "일주", value: pillars.day_pillar },
      { label: "월주", value: pillars.month_pillar },
      { label: "년주", value: pillars.year_pillar },
    ];
  }, [pillars]);

  const daeunRows = useMemo(() => {
    const list = daeun.daeun_list ?? [];
    const dayStem = pillars?.day_pillar?.[0] ?? "";
    const rows = list.map((s) => {
      const m = s.match(/^(\d+)세\s*([^\s(]+)(?:\(([^)]+)\))?/);
      const age = m ? parseInt(m[1], 10) : 0;
      const ganji = m ? m[2].trim() : "";
      const stem = ganji[0] ?? "";
      const branch = ganji[1] ?? "";
      const stemTg = tenGod(dayStem, stem);
      const branchMs = branchMainStem(branch);
      const branchTg = branchMs ? tenGod(dayStem, branchMs) : "";
      const twelveState = getTwelveState(dayStem, branch);
      return { age, ganji, stem, branch, stemTg, branchTg, twelveState };
    });
    // 대운은 오른쪽에서 왼쪽으로 나이가 줄어들게 표시하고 싶으므로
    // 배열 자체는 나이 내림차순으로 정렬해 둔다.
    return rows.sort((a, b) => b.age - a.age);
  }, [daeun.daeun_list, pillars?.day_pillar]);

  // 기본 선택 대운: 기준 연도(2026년)에서 사용자의 나이가 속한 구간
  useEffect(() => {
    if (!saju || daeunRows.length === 0) return;
    if (selectedDaeunIndex != null) return;
    const birthYear = saju.birthdate ? parseInt(String(saju.birthdate).slice(0, 4), 10) : 0;
    const baseYear = 2026;
    const baseAge = birthYear > 0 ? baseYear - birthYear : 0;
    let idx = daeunRows.findIndex((r, i) => {
      const start = r.age;
      const end = i > 0 ? daeunRows[i - 1].age - 1 : start + 9;
      return baseAge >= start && baseAge <= end;
    });
    if (idx === -1) idx = 0;
    setSelectedDaeunIndex(idx);
  }, [saju, daeunRows, selectedDaeunIndex]);

  const seunRows = useMemo(() => {
    const dayStem = pillars?.day_pillar?.[0] ?? "";
    const birthYear = saju?.birthdate ? parseInt(String(saju.birthdate).slice(0, 4), 10) : 0;
    const currentYear = new Date().getFullYear();
    // 선택된 대운이 있다면 그 대운의 시작 나이 기준으로 10년 세운을 생성
    const selected = selectedDaeunIndex != null ? daeunRows[selectedDaeunIndex] : null;
    const selectedAge = selected ? selected.age : null;
    const startYear =
      birthYear > 0 && selectedAge != null ? birthYear + selectedAge : currentYear;
    const rows: { year: number; age: number; stem: string; branch: string; stemTg: string; branchTg: string; twelveState: string }[] = [];
    for (let i = 0; i < 10; i++) {
      const year = startYear + i;
      const pillar = getSeunPillar(year);
      const stem = pillar[0] ?? "";
      const branch = pillar[1] ?? "";
      const branchMs = branchMainStem(branch);
      rows.push({
        year,
        // 한국식 만나이+1로 표시 (출생 연도 기준)
        age: birthYear > 0 ? year - birthYear + 1 : 0,
        stem,
        branch,
        stemTg: tenGod(dayStem, stem),
        branchTg: branchMs ? tenGod(dayStem, branchMs) : "",
        twelveState: getTwelveState(dayStem, branch),
      });
    }
    // 세운도 오른쪽에서 왼쪽으로 시간이 과거→현재가 되도록
    // 연도를 내림차순으로 정렬해 사용한다.
    return rows.sort((a, b) => b.year - a.year);
  }, [pillars?.day_pillar, saju?.birthdate, daeunRows, selectedDaeunIndex]);

  if (loading) {
    return (
      <main
        style={{
          background: "var(--bg-base)",
          backgroundImage: "url('/images/hanji-bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          minHeight: "100vh",
          fontFamily: "var(--font-sans)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <p style={{ fontSize: 14, color: "var(--text-primary)" }}>불러오는 중...</p>
      </main>
    );
  }

  if (error || !saju) {
    return (
      <main
        style={{
          background: "var(--bg-base)",
          backgroundImage: "url('/images/hanji-bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          minHeight: "100vh",
          fontFamily: "var(--font-sans)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <p style={{ fontSize: 14, color: "#b91c1c", marginBottom: 16 }}>
          {error || "사주를 찾을 수 없습니다."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/saju-list")}
          style={{
            padding: "10px 20px",
            borderRadius: 14,
            border: "1.5px solid var(--border-default)",
            background: "var(--bg-base)",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          사주 목록으로
        </button>
      </main>
    );
  }

  const timeDisplay = saju.birth_time && saju.birth_time.trim() ? saju.birth_time : "모름";
  const birthDateFormatted = saju.birthdate
    ? saju.birthdate.replace(/-/g, "/") + (timeDisplay !== "모름" ? ` (${timeDisplay})` : "")
    : "";
  const PREVIEW_BG = "#F5F1EA";
  const PREVIEW_SURFACE = "#EDE7DB";
  const PREVIEW_BORDER = "#D4C9B8";
  const PREVIEW_TEXT = "#2C2417";

  return (
    <main
      style={{
        background: PREVIEW_BG,
        minHeight: "100vh",
        fontFamily: "'Gmarket Sans'",
        paddingBottom: 40,
      }}
    >
      <style>{`
        .preview-tap { transition: transform .15s ease, opacity .15s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .preview-tap:active { transform: scale(.97); opacity: .9; }
        .preview-wrap { width: 100%; max-width: 520px; margin: 0 auto; padding: 0 16px 24px; }
        .preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.06);
          table-layout: fixed;
        }
        .preview-table th,
        .preview-table td {
          border: 1px solid #D4C9B8;
          padding: 8px 6px;
          text-align: center;
        }
        .preview-table th { background: #EDE7DB; font-weight: 700; color: #2C2417; }
        .preview-saju-row-label td { font-size: 11px; color: #5c5346; }
        .preview-pillar-box {
          padding: 10px 8px;
          border-radius: 8px;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
        }
        .preview-daeun-seun-box {
          padding: 8px 6px;
          border-radius: 6px;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
          color: #fff;
          font-weight: 700;
        }
      `}</style>

      <div className="preview-wrap">
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 12px", marginBottom: 12 }}>
          <button type="button" className="preview-tap" aria-label="뒤로" onClick={() => router.push("/saju-list")} style={{ padding: 8, border: "none", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", color: PREVIEW_TEXT }}>
            <Icon icon="mdi:chevron-left" width={24} />
          </button>
          <span style={{ fontSize: 17, fontWeight: 700, color: PREVIEW_TEXT, letterSpacing: "0.02em" }}>한양사주 AI</span>
          <button type="button" className="preview-tap" aria-label="메뉴" onClick={() => router.push("/saju-mypage")} style={{ padding: 8, border: "none", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", color: PREVIEW_TEXT }}>
            <Icon icon="mdi:menu" width={24} />
          </button>
        </header>

        <section style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: PREVIEW_TEXT, marginBottom: 8 }}>생년월일</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: PREVIEW_SURFACE, borderRadius: 16, border: `1px solid ${PREVIEW_BORDER}` }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", color: PREVIEW_TEXT }}>
              <Icon icon="mdi:account-outline" width={22} />
            </div>
            <div style={{ flex: 1, fontSize: 14, color: PREVIEW_TEXT, fontWeight: 500 }}>
              <span style={{ marginRight: 8 }}>{saju.gender}</span>
              <span style={{ marginRight: 8 }}>{saju.calendar_type}</span>
              <span>{birthDateFormatted || "-"}</span>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {dayPillarKey && (
              <img
                src={`/images/day_pillars/${dayPillarKey}.png`}
                alt={`${dayPillarKey} 일주`}
                style={{ width: 100, height: 100, objectFit: "contain", borderRadius: 12 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div>
              {dayPillarKey && (
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: getAnimalNameColor(dayPillarAnimalName || ""),
                    marginBottom: 4,
                  }}
                >
                  {dayPillarKey}일주: {dayPillarAnimalName || ""}
                </div>
              )}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: PREVIEW_TEXT, marginBottom: 10 }}>내 사주팔자</div>
          {pillars ? (
            <div style={{ overflowX: "auto", padding: "0 8px" }}>
              <table
                className="preview-table preview-sajutable"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead>
                  <tr>
                    <th style={{ width: 80 }} />
                    {["시주", "일주", "월주", "년주"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="preview-saju-row-label">
                    <td style={{ fontSize: 11, color: PREVIEW_TEXT, textAlign: "center" }}>십성(천간)</td>
                    {pillarBlocks.map((p) => {
                      const dayStem = pillars!.day_pillar[0] ?? "";
                      const stem = p.value[0] ?? "";
                      return <td key={p.label}>{tenGod(dayStem, stem)}</td>;
                    })}
                  </tr>
                  <tr>
                    <td style={{ fontSize: 11, color: PREVIEW_TEXT, textAlign: "center" }}>천간</td>
                    {pillarBlocks.map((p) => {
                      const stem = p.value[0] ?? "";
                      const el = hanjaToElement(stem);
                      const col = ELEMENT_PALETTE[el] ?? ELEMENT_PALETTE.none;
                      return (
                        <td key={p.label} style={{ padding: 4, verticalAlign: "middle" }}>
                          <div
                            className="preview-pillar-box"
                            style={{
                              background: col.bg,
                              color: col.text,
                              fontWeight: 700,
                              border: `1px solid ${col.border}`,
                            }}
                          >
                            {stem}
                            {hanjaToHangul(stem)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td style={{ fontSize: 11, color: PREVIEW_TEXT, textAlign: "center" }}>지지</td>
                    {pillarBlocks.map((p) => {
                      const branch = p.value[1] ?? "";
                      const el = hanjaToElement(branch);
                      const col = ELEMENT_PALETTE[el] ?? ELEMENT_PALETTE.none;
                      return (
                        <td key={p.label} style={{ padding: 4, verticalAlign: "middle" }}>
                          <div
                            className="preview-pillar-box"
                            style={{
                              background: col.bg,
                              color: col.text,
                              fontWeight: 700,
                              border: `1px solid ${col.border}`,
                            }}
                          >
                            {branch}
                            {hanjaToHangul(branch)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="preview-saju-row-label">
                    <td style={{ fontSize: 11, color: PREVIEW_TEXT, textAlign: "center" }}>십성(지지)</td>
                    {pillarBlocks.map((p) => {
                      const dayStem = pillars!.day_pillar[0] ?? "";
                      const branch = p.value[1] ?? "";
                      const ms = branchMainStem(branch);
                      return <td key={p.label}>{ms ? tenGod(dayStem, ms) : ""}</td>;
                    })}
                  </tr>
                  {jijanggan && (
                    <tr>
                      <td style={{ fontSize: 11, color: PREVIEW_TEXT, textAlign: "center" }}>지장간</td>
                      {(["hour", "day", "month", "year"] as const).map((key) => {
                        const dayStem = pillars!.day_pillar[0] ?? "";
                        const items = (jijanggan[key] ?? []) as Array<{ hanja: string; hangul: string; element: string }>;
                        return (
                          <td key={key} style={{ fontSize: 10, padding: 6, textAlign: "center", lineHeight: 1.5 }}>
                            {items.map((jj, idx) => {
                              const elKr = ELEMENT_NAME_KR[jj.element] ?? "";
                              const tg = tenGod(dayStem, jj.hanja);
                              return (
                                <div key={idx}>
                                  {jj.hanja}
                                  {elKr} ({tg})
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  )}
                  {twelveStates && (
                    <tr className="preview-saju-row-label">
                      <td style={{ fontSize: 11, color: PREVIEW_TEXT, textAlign: "center" }}>십이운성</td>
                      {(["hour", "day", "month", "year"] as const).map((key) => (
                        <td key={key}>{twelveStates[key]}</td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#6b7280" }}>만세력 정보를 불러오는 중...</p>
          )}
        </section>

        {daeun.daeun_list && daeun.daeun_list.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: PREVIEW_TEXT, marginBottom: 10 }}>
              나의 대운 <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>*10년 단위 운</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="preview-table">
                <thead>
                  <tr>
                    {daeunRows.map((r) => (
                      <th
                        key={r.age}
                        style={{
                          minWidth: 44,
                          cursor: "pointer",
                          background:
                            selectedDaeunIndex != null &&
                            daeunRows[selectedDaeunIndex]?.age === r.age
                              ? "#E3D9CB"
                              : "#EDE7DB",
                        }}
                        onClick={() => setSelectedDaeunIndex(daeunRows.findIndex(d => d.age === r.age))}
                      >
                        {r.age}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="preview-saju-row-label">
                    {daeunRows.map((r) => (
                      <td
                        key={r.age}
                        style={{
                          cursor: "pointer",
                          background:
                            selectedDaeunIndex != null &&
                            daeunRows[selectedDaeunIndex]?.age === r.age
                              ? "rgba(212,201,184,0.2)"
                              : undefined,
                        }}
                        onClick={() =>
                          setSelectedDaeunIndex(
                            daeunRows.findIndex((d) => d.age === r.age),
                          )
                        }
                      >
                        {r.stemTg}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    {daeunRows.map((r) => {
                      const el = hanjaToElement(r.stem);
                      const col = ELEMENT_PALETTE[el] ?? ELEMENT_PALETTE.none;
                      return (
                        <td
                          key={r.age}
                          style={{
                            padding: 4,
                            cursor: "pointer",
                            background:
                              selectedDaeunIndex != null &&
                              daeunRows[selectedDaeunIndex]?.age === r.age
                                ? "rgba(212,201,184,0.15)"
                                : undefined,
                          }}
                          onClick={() =>
                            setSelectedDaeunIndex(
                              daeunRows.findIndex((d) => d.age === r.age),
                            )
                          }
                        >
                          <div
                            className="preview-daeun-seun-box"
                            style={{
                              background: col.bg,
                              color: col.text,
                              border: `1px solid ${col.border}`,
                            }}
                          >
                            {hanjaToHangul(r.stem)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    {daeunRows.map((r) => {
                      const el = hanjaToElement(r.branch);
                      const col = ELEMENT_PALETTE[el] ?? ELEMENT_PALETTE.none;
                      return (
                        <td
                          key={r.age}
                          style={{
                            padding: 4,
                            cursor: "pointer",
                            background:
                              selectedDaeunIndex != null &&
                              daeunRows[selectedDaeunIndex]?.age === r.age
                                ? "rgba(212,201,184,0.15)"
                                : undefined,
                          }}
                          onClick={() =>
                            setSelectedDaeunIndex(
                              daeunRows.findIndex((d) => d.age === r.age),
                            )
                          }
                        >
                          <div
                            className="preview-daeun-seun-box"
                            style={{
                              background: col.bg,
                              color: col.text,
                              border: `1px solid ${col.border}`,
                            }}
                          >
                            {hanjaToHangul(r.branch)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="preview-saju-row-label">
                    {daeunRows.map((r) => (
                      <td
                        key={r.age}
                        style={{
                          cursor: "pointer",
                          background:
                            selectedDaeunIndex != null &&
                            daeunRows[selectedDaeunIndex]?.age === r.age
                              ? "rgba(212,201,184,0.2)"
                              : undefined,
                        }}
                        onClick={() =>
                          setSelectedDaeunIndex(
                            daeunRows.findIndex((d) => d.age === r.age),
                          )
                        }
                      >
                        {r.branchTg}
                      </td>
                    ))}
                  </tr>
                  <tr className="preview-saju-row-label">
                    {daeunRows.map((r) => (
                      <td
                        key={r.age}
                        style={{
                          cursor: "pointer",
                          background:
                            selectedDaeunIndex != null &&
                            daeunRows[selectedDaeunIndex]?.age === r.age
                              ? "rgba(212,201,184,0.2)"
                              : undefined,
                        }}
                        onClick={() =>
                          setSelectedDaeunIndex(
                            daeunRows.findIndex((d) => d.age === r.age),
                          )
                        }
                      >
                        {r.twelveState}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: PREVIEW_TEXT, marginBottom: 10 }}>
            나의 세운 <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>*1년 단위 운</span>
          </div>
          <div style={{ overflowX: "auto", padding: "0 8px" }}>
            <table
              className="preview-table"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead>
                <tr>
                  {seunRows.map((r) => (
                    <th key={r.year} style={{ textAlign: "center" }}>
                      {r.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {seunRows.map((r) => (
                    <td key={r.year} style={{ fontSize: 11 }}>
                      {r.age > 0 ? r.age + "세" : "-"}
                    </td>
                  ))}
                </tr>
                <tr className="preview-saju-row-label">
                  {seunRows.map((r) => (
                    <td key={r.year}>{r.stemTg}</td>
                  ))}
                </tr>
                <tr>
                  {seunRows.map((r) => {
                    const el = hanjaToElement(r.stem);
                    const col = ELEMENT_PALETTE[el] ?? ELEMENT_PALETTE.none;
                    return (
                      <td key={r.year} style={{ padding: 4 }}>
                        <div
                          className="preview-daeun-seun-box"
                          style={{
                            background: col.bg,
                            color: col.text,
                            border: `1px solid ${col.border}`,
                          }}
                        >
                          {hanjaToHangul(r.stem)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  {seunRows.map((r) => {
                    const el = hanjaToElement(r.branch);
                    const col = ELEMENT_PALETTE[el] ?? ELEMENT_PALETTE.none;
                    return (
                      <td key={r.year} style={{ padding: 4 }}>
                        <div
                          className="preview-daeun-seun-box"
                          style={{
                            background: col.bg,
                            color: col.text,
                            border: `1px solid ${col.border}`,
                          }}
                        >
                          {hanjaToHangul(r.branch)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr className="preview-saju-row-label">
                  {seunRows.map((r) => (
                    <td key={r.year}>{r.branchTg}</td>
                  ))}
                </tr>
                <tr className="preview-saju-row-label">
                  {seunRows.map((r) => (
                    <td key={r.year}>{r.twelveState}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <button
            type="button"
            className="preview-tap"
            onClick={handleStartAnalysis}
            disabled={deducting}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: `1.5px solid ${PREVIEW_BORDER}`,
              background: deducting ? "#c4b8a4" : PREVIEW_SURFACE,
              fontSize: 14,
              fontWeight: 700,
              color: PREVIEW_TEXT,
              cursor: deducting ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {deducting ? "확인 중..." : "사주 분석 시작하기 (분석권 1개)"}
          </button>
          <button
            type="button"
            className="preview-tap"
            onClick={() => router.push("/saju-list")}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: `1.5px solid ${PREVIEW_BORDER}`,
              background: "#fff",
              fontSize: 14,
              fontWeight: 700,
              color: PREVIEW_TEXT,
              fontFamily: "inherit",
            }}
          >
            내 사주 목록으로
          </button>
        </div>
      </div>

      {/* 분석권 부족 바텀시트 */}
      {showSeedSheet && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setShowSeedSheet(false)}
        >
          <div
            className="sans"
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#fff",
              borderRadius: "20px 20px 0 0",
              padding: "28px 24px 40px",
              fontFamily: "var(--font-sans)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Icon
                icon="mdi:ticket-confirmation-outline"
                width={40}
                style={{ color: "var(--text-primary)", display: "block", margin: "0 auto 12px" }}
              />
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                분석권이 부족해요
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                사주 분석 1회에 분석권 1개가 필요해요.
                <br />
                분석권을 충전하고 분석을 시작해보세요.
              </div>
            </div>
            <button
              type="button"
              className="tap sans"
              onClick={() => router.push("/seed-charge")}
              style={{
                width: "100%",
                padding: 13,
                borderRadius: 14,
                border: "none",
                background: "var(--text-primary)",
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(106,153,78,0.3)",
                marginBottom: 10,
              }}
            >
              분석권 충전하러 가기
            </button>
            <button
              type="button"
              className="tap sans"
              onClick={() => setShowSeedSheet(false)}
              style={{
                width: "100%",
                padding: 11,
                borderRadius: 14,
                border: "1.5px solid #e0ece0",
                background: "#fff",
                fontSize: 14,
                fontWeight: 700,
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function PreviewFallback() {
  return (
    <main
      style={{
        background: "var(--bg-base)",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <p style={{ fontSize: 14, color: "var(--text-primary)" }}>불러오는 중...</p>
    </main>
  );
}

export default function SajuPreviewPage({
  params,
}: { params?: Promise<Record<string, string | string[]>> } = {}) {
  use(params ?? Promise.resolve({}));
  return (
    <Suspense fallback={<PreviewFallback />}>
      <SajuPreviewContent />
    </Suspense>
  );
}
