import React, { useEffect, useState } from "react";

type ElementKo = "목" | "화" | "토" | "금" | "수";

type ElementCount = Record<ElementKo, number>;

const STEM_ELEMENT: Record<string, ElementKo> = {
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

const BRANCH_ELEMENT: Record<string, ElementKo> = {
  子: "수",
  丑: "토",
  寅: "목",
  卯: "목",
  辰: "토",
  巳: "화",
  午: "화",
  未: "토",
  申: "금",
  酉: "금",
  戌: "토",
  亥: "수",
};

function calcElements(stems: string[], branches: string[]): ElementCount {
  const count: ElementCount = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  stems.forEach((s) => {
    const el = STEM_ELEMENT[s];
    if (el) count[el] += 1;
  });
  branches.forEach((b) => {
    const el = BRANCH_ELEMENT[b];
    if (el) count[el] += 1;
  });
  return count;
}

function getStatus(count: number): "결핍" | "부족" | "보통" | "강" | "과다" {
  if (count === 0) return "결핍";
  if (count === 1) return "부족";
  if (count === 2) return "보통";
  if (count === 3) return "강";
  return "과다";
}

function getWeakElements(count: ElementCount): ElementKo[] {
  const zero = Object.entries(count)
    .filter(([, v]) => v === 0)
    .map(([k]) => k as ElementKo);
  const one = Object.entries(count)
    .filter(([, v]) => v === 1)
    .map(([k]) => k as ElementKo);
  return [...zero, ...one].slice(0, 2);
}

function getStrongElements(count: ElementCount): ElementKo[] {
  return Object.entries(count)
    .filter(([, v]) => v >= 3)
    .map(([k]) => k as ElementKo);
}

interface ElementMeta {
  label: string;
  emoji: string;
  hanja: string;
  color: string;
  bg: string;
  border: string;
  text: string;
  meaning: string;
  weakDesc: string;
  items: string[];
  food: string;
  place: string;
  action: string;
  effect: string;
  overDesc: string;
  overItems: string[];
}

const ELEMENT_META: Record<ElementKo, ElementMeta> = {
  목: {
    label: "목",
    emoji: "🌿",
    hanja: "木",
    color: "#6DBF8A",
    bg: "#F0FAF3",
    border: "#B8E6C6",
    text: "#2E7D4F",
    meaning: "성장·기회·인간관계·창의",
    weakDesc:
      "새로운 기회와 인간관계 확장이 막히기 쉬운 구조입니다. 아이디어는 있지만 실행이나 연결이 잘 안 되는 느낌이 반복될 수 있어요.",
    items: ["🌱 잎 넓은 식물", "🪵 나무 소재 소품", "📓 노트·펜", "🌲 우디 향수", "🟢 초록색 파우치"],
    food: "레몬·새싹채소·녹차",
    place: "공원·숲·서점",
    action: "새로운 사람에게 먼저 연락하기",
    effect: "새로운 기회 유입, 인간관계 확장",
    overDesc: "초록 소품이나 식물을 더 늘리면 오히려 에너지가 산만해질 수 있습니다.",
    overItems: ["초록 소품 과다", "식물 과잉 배치"],
  },
  화: {
    label: "화",
    emoji: "🔥",
    hanja: "火",
    color: "#E8724A",
    bg: "#FFF5F2",
    border: "#FFCBB8",
    text: "#C0392B",
    meaning: "자신감·인기·표현력·열정",
    weakDesc:
      "자신을 드러내는 것이 어렵거나 존재감이 묻히는 느낌이 반복될 수 있습니다. 표현하고 싶지만 망설이게 되는 패턴이 생기기 쉬워요.",
    items: ["🕯 향초", "💡 따뜻한 조명", "💄 빨간 립제품", "🧣 빨간·주황 소품", "🌸 플로럴 향수"],
    food: "커피·딸기·토마토",
    place: "핫플레이스·공연장·밝은 카페",
    action: "SNS에 먼저 올리기·발표 자원하기",
    effect: "매력 상승, 자신감·표현력 강화",
    overDesc: "빨간색 소품이나 향초를 과하게 사용하면 오히려 에너지가 과열될 수 있습니다.",
    overItems: ["빨간색 소품 과잉", "향초 과다 사용"],
  },
  토: {
    label: "토",
    emoji: "🪨",
    hanja: "土",
    color: "#C8A96E",
    bg: "#FDFAF3",
    border: "#EDD99A",
    text: "#7D5A2E",
    meaning: "안정·재물·기반·신뢰",
    weakDesc:
      "재정이 들쑥날쑥하거나 생활 루틴이 잘 잡히지 않는 패턴이 반복될 수 있습니다. 안정을 원하지만 기반이 흔들리는 느낌이 생기기 쉬워요.",
    items: [
      "👜 브라운 가죽 지갑",
      "🏺 도자기 소품",
      "💛 황수정·호안석",
      "🟤 베이지 쿠션·러그",
      "🌰 브라운 계열 가방",
    ],
    food: "고구마·꿀·대추·뿌리채소",
    place: "카페·도서관·동네 산책",
    action: "저축하기·규칙적인 식사",
    effect: "재물 안정, 생활 기반 강화",
    overDesc: "물건을 쌓아두거나 브라운 소품을 과하게 늘리면 정체된 에너지가 생길 수 있습니다.",
    overItems: ["물건 과잉 수집", "베이지·브라운 과잉"],
  },
  금: {
    label: "금",
    emoji: "⚙️",
    hanja: "金",
    color: "#909090",
    bg: "#F8F8F8",
    border: "#D0D0D0",
    text: "#4A4A4A",
    meaning: "결단력·카리스마·실행력·집중",
    weakDesc:
      "결정을 내리는 것이 어렵거나 행동으로 옮기기까지 시간이 오래 걸리는 패턴이 생기기 쉽습니다. 계획은 많지만 실행이 늦어지는 느낌이 반복돼요.",
    items: ["💍 금속 액세서리", "⌚ 메탈 밴드 시계", "💍 반지", "🤍 흰색 의류·운동화", "🔘 은색 텀블러"],
    food: "생강·두부·배·흰 음식",
    place: "정돈된 공간·오피스 거리",
    action: "불필요한 것 버리기·정리정돈",
    effect: "결단력·집중력 강화, 실행력 상승",
    overDesc: "금속 액세서리나 흰색 소품을 과하게 늘리면 오히려 예민함이 자극될 수 있습니다.",
    overItems: ["금속 액세서리 과잉", "흰색 공간 집착"],
  },
  수: {
    label: "수",
    emoji: "💧",
    hanja: "水",
    color: "#4A90D9",
    bg: "#F2F8FF",
    border: "#B8D9F5",
    text: "#1A5C9E",
    meaning: "지혜·감정안정·직감·유연성",
    weakDesc:
      "감정 기복이 크거나 직관이 잘 작동하지 않는 느낌이 들기 쉽습니다. 스트레스 해소가 잘 안 되거나 생각이 정리되지 않는 패턴이 반복될 수 있어요.",
    items: ["🪴 수경식물·어항", "🔵 파란색·네이비 소품", "🫙 유리 제품", "🌊 아쿠아 향수", "🌙 달 관련 무드등"],
    food: "미역·해산물·블루베리·검은콩",
    place: "물가·스파·조용한 카페",
    action: "명상하기·일기 쓰기",
    effect: "감정 안정, 직감·통찰력 향상",
    overDesc: "파란색 소품이나 물 관련 소품을 과하게 늘리면 감정이 처지는 흐름이 생길 수 있습니다.",
    overItems: ["파란색 소품 과잉", "물 소품 과잉"],
  },
};

const ELEMENT_ORDER: ElementKo[] = ["목", "화", "토", "금", "수"];

interface LuckyItemMapProps {
  stems: [string, string, string, string];
  branches: [string, string, string, string];
  gender: "M" | "F";
}

function filterItemsByGender(items: string[], gender: "M" | "F"): string[] {
  if (gender === "F") return items;
  // 남성(M)인 경우 립/립제품 등 명시적으로 여성 화장품 느낌이 강한 항목은 제외
  return items.filter((item) => !item.includes("립"));
}

export function LuckyItemMap({ stems, branches, gender }: LuckyItemMapProps) {
  const [selected, setSelected] = useState<ElementKo | null>(null);
  const [animated, setAnimated] = useState(false);

  const count = calcElements(stems, branches);
  const weak = getWeakElements(count);
  const strong = getStrongElements(count);
  const primary = weak[0] ?? null;
  const secondary = weak[1] ?? null;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const maxCount = Math.max(...(Object.values(count) as number[]), 1);

  return (
    <div className="rounded-2xl bg-[#fafaf8] border border-[#e3ddcf] p-3 space-y-3">
      <div className="text-center space-y-1">
        <div className="text-[9px] tracking-[0.3em] text-[#AAAAAA] uppercase">
          LUCKY ITEMS · 행운 아이템
        </div>
        <div className="text-[15px] text-[#2C2C2C] tracking-[0.08em]">
          내 기운 밸런스
        </div>
        {primary && (
          <div className="mt-1 text-[11px] text-[#888888] leading-relaxed">
            {ELEMENT_META[primary].emoji} {primary} 기운이 부족한 구조입니다
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-3 shadow-sm space-y-2">
        <div className="text-[10px] text-[#AAAAAA] tracking-[0.15em]">
          오행 에너지 분포
        </div>

        {ELEMENT_ORDER.map((el, i) => {
          const meta = ELEMENT_META[el];
          const cnt = count[el];
          const status = getStatus(cnt);
          const isWeak = weak.includes(el);
          const isStrong = strong.includes(el);
          const barW = animated ? `${(cnt / maxCount) * 100}%` : "0%";
          const delay = i * 80;

          return (
            <button
              key={el}
              type="button"
              onClick={() => setSelected(selected === el ? null : el)}
              className="w-full flex items-center gap-2 mb-1.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors"
              style={{ background: selected === el ? meta.bg : "transparent" }}
            >
              <div className="w-[52px] flex items-center gap-1.5">
                <span className="text-[14px]">{meta.emoji}</span>
                <span
                  className="text-[12px]"
                  style={{
                    color: meta.text,
                    fontWeight: isWeak ? 700 : 400,
                  }}
                >
                  {el}
                </span>
              </div>

              <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: barW,
                    background: isStrong
                      ? `linear-gradient(90deg, ${meta.color}, ${meta.color}BB)`
                      : isWeak
                      ? "#E0E0E0"
                      : `linear-gradient(90deg, ${meta.color}99, ${meta.color}66)`,
                    transition: `width 0.7s ease ${delay}ms`,
                  }}
                />
              </div>

              <div className="w-5 text-right text-[11px] text-[#AAAAAA]">{cnt}</div>

              <div
                className="text-[9px] px-1.5 py-[2px] rounded-full min-w-[30px] text-center"
                style={{
                  background: isStrong
                    ? `${meta.color}22`
                    : isWeak
                    ? "#FFE8E8"
                    : "#F5F5F5",
                  color: isStrong ? meta.text : isWeak ? "#E53935" : "#AAAAAA",
                }}
              >
                {status}
              </div>
            </button>
          );
        })}
      </div>

      {primary && (
        <div
          className="rounded-2xl p-3 space-y-2"
          style={{ background: ELEMENT_META[primary].bg, border: `1px solid ${ELEMENT_META[primary].border}` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[18px]">{ELEMENT_META[primary].emoji}</span>
            <div className="flex-1">
              <div
                className="text-[13px] font-bold tracking-[0.05em]"
                style={{ color: ELEMENT_META[primary].text }}
              >
                {primary} 기운 보충 필요
              </div>
              <div className="text-[10px] text-[#AAAAAA] mt-[2px]">
                {ELEMENT_META[primary].meaning}
              </div>
            </div>
            <div className="text-[9px] px-2 py-[3px] rounded-full bg-[#FFE8E8] text-[#E53935]">
              {count[primary] === 0 ? "결핍" : "부족"}
            </div>
          </div>

          <div
            className="text-[11px] text-[#555555] leading-relaxed pt-1 pb-2 border-b"
            style={{ borderColor: ELEMENT_META[primary].border }}
          >
            {ELEMENT_META[primary].weakDesc}
          </div>

          <div className="space-y-1.5">
            <div className="text-[9px] text-[#AAAAAA] tracking-[0.15em]">
              추천 아이템
            </div>
            <div className="flex flex-col gap-1.5">
              {filterItemsByGender(ELEMENT_META[primary].items, gender).map((item, i) => (
                <div
                  key={i}
                  className="text-[11px] text-[#333333] px-2.5 py-1.5 rounded-lg bg-white"
                  style={{ border: `1px solid ${ELEMENT_META[primary].border}` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            {[
              { label: "음식", value: ELEMENT_META[primary].food, icon: "🍽" },
              { label: "장소", value: ELEMENT_META[primary].place, icon: "📍" },
              { label: "행동", value: ELEMENT_META[primary].action, icon: "✨" },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex items-start gap-1.5 text-[11px] text-[#666666]"
              >
                <span>{icon}</span>
                <span className="text-[#AAAAAA] min-w-[26px]">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>

          <div
            className="mt-2 px-2.5 py-2 rounded-lg text-[11px]"
            style={{
              background: "#FFFFFF",
              color: ELEMENT_META[primary].text,
              border: `1px solid ${ELEMENT_META[primary].border}`,
            }}
          >
            ✦ {ELEMENT_META[primary].effect}
          </div>
        </div>
      )}

      {secondary && (
        <div
          className="rounded-2xl p-3 space-y-2"
          style={{ background: ELEMENT_META[secondary].bg, border: `1px solid ${ELEMENT_META[secondary].border}` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[16px]">{ELEMENT_META[secondary].emoji}</span>
            <div className="flex-1">
              <div
                className="text-[12px] font-bold"
                style={{ color: ELEMENT_META[secondary].text }}
              >
                {secondary} 기운 보조 추천
              </div>
              <div className="text-[10px] text-[#AAAAAA]">
                {ELEMENT_META[secondary].meaning}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#666666] leading-relaxed">
            보조적으로 {secondary} 기운도 함께 채워주면 더 안정된 흐름이 만들어집니다.
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filterItemsByGender(ELEMENT_META[secondary].items, gender)
              .slice(0, 3)
              .map((item, i) => (
              <div
                key={i}
                className="text-[11px] text-[#555555] px-2.5 py-1 rounded-full bg-white"
                style={{ border: `1px solid ${ELEMENT_META[secondary].border}` }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {strong.length > 0 && (
        <div className="rounded-2xl p-3 space-y-2 bg-[#FFFBF0] border border-[#FFE082]">
          <div className="text-[10px] text-[#F9A825] tracking-[0.15em]">
            ⚠ 과다 기운 주의
          </div>
          {strong.map((el) => (
            <div key={el} className="space-y-1">
              <div className="flex items-center gap-1.5 text-[12px] text-[#7D5A00]">
                <span>{ELEMENT_META[el].emoji}</span>
                <span>{el} 기운 과다</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ELEMENT_META[el].overItems.map((item, i) => (
                  <div
                    key={i}
                    className="text-[10px] text-[#9E7700] px-2 py-[3px] rounded-full bg-[#FFF8E1] border border-[#FFE082]"
                  >
                    ✕ {item}
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-[#AAAAAA]">
                {ELEMENT_META[el].overDesc}
              </div>
            </div>
          ))}
        </div>
      )}

      {weak.length === 0 && (
        <div className="rounded-2xl p-3 text-center bg-[#F5FFF8] border border-[#B8E6C6] space-y-1.5">
          <div className="text-[16px]">✦</div>
          <div className="text-[13px] text-[#2E7D4F]">
            오행 균형이 잘 잡힌 구조입니다
          </div>
          <div className="text-[11px] text-[#888888] leading-relaxed">
            특별히 보충이 필요한 기운이 없어요.
            <br />
            현재 생활 패턴을 유지하는 것이 가장 좋습니다.
          </div>
        </div>
      )}

      <div className="mt-1.5 px-3 py-2 rounded-2xl bg-white shadow-sm text-[11px] text-[#999999] leading-relaxed text-center">
        행운의 아이템은 마법이 아니라
        <br />
        내 기운의 빈 곳을 채워주는 작은 신호입니다.
        <br />
        오늘 하나씩 일상에 스며들게 두는 것만으로도
        <br />
        에너지의 방향이 조금씩 달라지기 시작합니다.
      </div>
    </div>
  );
}

