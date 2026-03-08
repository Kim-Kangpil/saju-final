"use client";

/** 십신 → 화면용 짧은 키워드 (메인 타이틀/코어용) */
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
  const socialKeyword = TEN_GOD_KEYWORD[socialLabel] ?? socialLabel;
  const realKeyword = TEN_GOD_KEYWORD[realLabel] ?? realLabel;

  return (
    <div className="mx-auto w-full max-w-[420px] rounded-[28px] border border-stone-200/80 bg-[#f6f3e8] shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="px-4 sm:px-5 py-4 sm:py-5 overflow-visible">
        {/* 원형 비주얼: 상=겉(밝은 회색), 하=속(어두운 색). 요소 간 겹침 없이 여백 확보 */}
        <div className="relative mx-auto mb-3 sm:mb-4 flex h-[180px] sm:h-[200px] w-[180px] sm:w-[200px] items-center justify-center flex-shrink-0">
          {/* 바깥 링 */}
          <div className="absolute inset-0 rounded-full border-[8px] border-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]" />

          {/* 위쪽 반원 - 겉 (사회적 가면, 밝은 회색) */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#e8e8e8] to-[#d4d4d4]" />
          </div>

          {/* 아래쪽 반원 - 속 (실제 기질, 어두운 색) */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-[#374151] to-[#1f2937]" />
          </div>

          {/* 부드러운 오버레이 */}
          <div className="absolute inset-[8px] rounded-full bg-white/10 backdrop-blur-[1px]" />

          {/* 중앙 가로 분리선 */}
          <div className="absolute left-[12%] right-[12%] top-1/2 z-10 h-[1.5px] -translate-y-1/2 rounded-full bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.6)]" />

          {/* 중앙 코어: 크기 제한해 상·하 라벨과 겹치지 않음 */}
          <div className="absolute left-1/2 top-1/2 z-20 flex h-[48px] sm:h-[52px] w-[48px] sm:w-[52px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-stone-300/80 bg-[#fffdf8] shadow-[0_4px_16px_rgba(0,0,0,0.12)] backdrop-blur">
            <p className="text-[7px] sm:text-[8px] font-medium tracking-tight text-stone-500">겉 vs 속</p>
            <p className="mt-0.5 text-center text-[8px] sm:text-[10px] font-bold leading-tight text-stone-700">
              {socialKeyword}
              <br />
              <span className="text-stone-400">|</span>
              <br />
              {realKeyword}
            </p>
          </div>

          {/* 위쪽 라벨: 상단 여백(top-3)으로 코어와 간격 확보 */}
          <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 flex-col items-center gap-1 max-w-[88px] sm:max-w-[96px]">
            <span className="rounded-full bg-stone-200/90 px-1.5 py-0.5 text-[7px] sm:text-[8px] font-medium text-stone-600 shadow-sm whitespace-nowrap">
              🎭 겉
            </span>
            <div className="rounded-md border border-stone-300 bg-white/95 px-1.5 py-0.5 text-center shadow-sm">
              <p className="text-[9px] sm:text-[10px] font-bold text-stone-700 leading-tight">{socialLabel}</p>
            </div>
          </div>

          {/* 아래쪽 라벨: 하단 여백(bottom-3)으로 코어와 간격 확보 */}
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 max-w-[88px] sm:max-w-[96px]">
            <span className="rounded-full bg-stone-700/90 px-1.5 py-0.5 text-[7px] sm:text-[8px] font-medium text-stone-200 shadow-sm whitespace-nowrap">
              🧠 속
            </span>
            <div className="rounded-md border border-stone-600 bg-stone-800/95 px-1.5 py-0.5 text-center shadow-sm">
              <p className="text-[9px] sm:text-[10px] font-bold text-stone-100 leading-tight">{realLabel}</p>
            </div>
          </div>
        </div>

        {/* 무의식 습관 pill - 크기·글자 축소 */}
        <div className="mb-3 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ffd7d7] bg-white/80 px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-sm">
            <span className="text-xs">⚡</span>
            <span className="text-[10px] sm:text-[11px] text-stone-500">무의식 습관</span>
            <span className="text-[11px] sm:text-[12px] font-bold text-rose-500">{habitLabel}</span>
          </div>
        </div>

        {/* 중앙 한 줄 + 요약 - 크기·글자 축소 */}
        <div className="rounded-xl bg-white/60 px-3 py-2 sm:py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
          <p className="text-[13px] sm:text-[15px] font-bold tracking-tight text-stone-700">
            겉은 {socialKeyword}, 속은 {realKeyword}
          </p>
          {summary && (
            <p className="mt-1 text-[11px] sm:text-[12px] leading-relaxed text-stone-500">
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
