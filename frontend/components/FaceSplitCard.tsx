"use client";

/** 십신 → 화면용 키워드 */
export const TEN_GOD_KEYWORD: Record<string, string> = {
  비견: "자기주도",
  겁재: "승부감각",
  식신: "표현력",
  상관: "변화감각",
  편재: "실전감각",
  정재: "안정감",
  편관: "긴장집중",
  정관: "질서감",
  편인: "직관사색",
  정인: "이해공감",
};

/** 겉(사회적 가면) — 십신별 짧은 설명 */
const TEN_GOD_DESC_OUTER: Record<string, string> = {
  비견: "독립적이고 자기 페이스를 지키는 사람으로 보입니다",
  겁재: "경쟁력 있고 강한 인상을 주는 편입니다",
  식신: "말이 부드럽고 분위기를 자연스럽게 만드는 사람으로 보입니다",
  상관: "개성 있고 자유로운 이미지가 드러나는 편입니다",
  편재: "활동적이고 실리적으로 움직이는 인상입니다",
  정재: "안정적이고 신뢰감 있는 사람으로 보입니다",
  편관: "강단 있고 책임감 있는 이미지가 있습니다",
  정관: "규칙적이고 바른 인상을 주는 편입니다",
  편인: "독특하고 생각이 많아 보이는 분위기입니다",
  정인: "이해심 있고 배려 깊은 사람으로 보입니다",
};

/** 속(실제 기질) — 십신별 짧은 설명 */
const TEN_GOD_DESC_INNER: Record<string, string> = {
  비견: "혼자 결정하고 자기 기준으로 움직이는 성향이 강합니다",
  겁재: "지고 싶지 않은 마음이 내면에 강하게 작동합니다",
  식신: "즐거움과 여유를 중요하게 생각하는 성향이 있습니다",
  상관: "정해진 틀보다 자기 방식으로 표현하고 싶은 욕구가 있습니다",
  편재: "가능성과 기회를 감지하는 감각이 발달해 있습니다",
  정재: "안정적인 루틴과 확실한 기반을 중요하게 생각합니다",
  편관: "스스로에게 높은 기준을 세우고 지키려는 성향이 있습니다",
  정관: "질서와 원칙을 중요하게 생각하는 성향이 있습니다",
  편인: "혼자 생각을 정리하는 시간이 필요한 타입입니다",
  정인: "상대를 충분히 이해하고 나서 움직이려는 성향이 강합니다",
};

const pick = <T,>(v: T | undefined, fallback: T) => (v === undefined || v === "" ? fallback : v);

export type FaceSplitCardProps = {
  socialLabel: string;
  realLabel: string;
  habitLabel: string;
  summary?: string;
};

export function FaceSplitCard({
  socialLabel,
  realLabel,
  habitLabel,
  summary,
}: FaceSplitCardProps) {
  const socialKeyword = pick(TEN_GOD_KEYWORD[socialLabel], socialLabel);
  const realKeyword = pick(TEN_GOD_KEYWORD[realLabel], realLabel);

  const outer = {
    label: socialLabel,
    keyword: socialKeyword,
    desc: pick(TEN_GOD_DESC_OUTER[socialLabel], "사회에서 일정한 이미지로 비치는 편입니다"),
    color: "#F5F0E8",
    textColor: "#3D2E1E",
    accent: "#C9A96E",
    icon: "☀️",
    tag: "겉",
  };
  const inner = {
    label: realLabel,
    keyword: realKeyword,
    desc: pick(TEN_GOD_DESC_INNER[realLabel], "편한 자리에서 내면의 성향이 드러나는 편입니다"),
    color: "#2A2A3E",
    textColor: "#E8E4F0",
    accent: "#A78BD4",
    icon: "🌙",
    tag: "속",
  };

  const displaySummary = summary ?? `겉은 ${socialKeyword}, 속은 ${realKeyword}`;

  return (
    <div className="mx-auto w-full max-w-[420px] rounded-[28px] border border-stone-200/80 bg-[#f9f5ee] shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="px-3 sm:px-4 py-4 sm:py-5">
        {/* 두 장의 카드 */}
        <div className="flex gap-2 sm:gap-3 w-full mb-1">
          {[outer, inner].map((card, i) => (
            <div
              key={i}
              className="flex-1 rounded-[20px] p-3 sm:p-4 flex flex-col items-center gap-1.5 sm:gap-2 relative overflow-hidden transition-transform duration-200 hover:translate-y-[-2px]"
              style={{
                background: card.color,
                boxShadow: i === 1 ? "0 8px 32px rgba(42,42,62,0.18)" : "0 4px 20px rgba(0,0,0,0.07)",
                border: `1.5px solid ${card.accent}33`,
              }}
            >
              {/* 배경 원형 장식 */}
              <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: `${card.accent}18` }}
              />
              {/* 태그 */}
              <span
                className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-[20px] px-2 py-0.5 relative z-10"
                style={{ color: card.accent, background: `${card.accent}18` }}
              >
                {card.tag}
              </span>
              {/* 아이콘 */}
              <span className="text-2xl sm:text-3xl leading-none relative z-10">{card.icon}</span>
              {/* 육친 이름 */}
              <span
                className="text-lg sm:text-xl font-extrabold tracking-tight relative z-10"
                style={{ color: card.textColor }}
              >
                {card.label}
              </span>
              {/* 키워드 */}
              <span
                className="text-[11px] sm:text-[12px] font-semibold text-center leading-snug relative z-10"
                style={{ color: card.accent }}
              >
                {card.keyword}
              </span>
              {/* 설명 */}
              <p
                className="text-[10px] sm:text-[11px] text-center leading-snug mt-0.5 relative z-10 line-clamp-3"
                style={{ color: `${card.textColor}99` }}
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* VS 배지 — 카드 사이 */}
        <div className="flex justify-center items-center -mt-6 sm:-mt-7 mb-1 relative z-20 pointer-events-none">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold tracking-wide shadow-md"
            style={{
              background: "white",
              border: "2px solid #E0D8F0",
              color: "#9B8EA0",
            }}
          >
            VS
          </div>
        </div>

        {/* 무의식 습관 배지 */}
        <div
          className="flex items-center justify-center gap-2 rounded-[40px] py-2 px-4 mt-2 sm:mt-3 shadow-sm"
          style={{
            background: "white",
            border: "1.5px solid #E0D8F0",
          }}
        >
          <span className="text-sm">⚡</span>
          <span className="text-[11px] sm:text-[12px] text-[#9B8EA0] tracking-wide">무의식 습관</span>
          <span
            className="text-[11px] sm:text-[12px] font-bold px-2 py-0.5 rounded-[20px]"
            style={{ color: "#A78BCA", background: "#F0EAF9" }}
          >
            {habitLabel}
          </span>
        </div>

        {/* 요약 문장 */}
        <p
          className="mt-3 sm:mt-4 text-[14px] sm:text-[15px] font-bold text-center tracking-tight"
          style={{ color: "#2A2030" }}
        >
          {displaySummary}
        </p>

        {/* 하단 설명 */}
        <p
          className="mt-1 text-[10px] sm:text-[11px] text-center leading-snug max-w-[320px] mx-auto"
          style={{ color: "#B0A8BA" }}
        >
          사람들이 보는 모습과 실제 기질 사이의 차이를 보여줍니다
        </p>
      </div>
    </div>
  );
}
