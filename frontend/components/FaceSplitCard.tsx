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
        {/* 원형 비주얼 축소, 라벨은 원 안쪽으로 */}
        <div className="relative mx-auto mb-3 sm:mb-4 flex h-[180px] sm:h-[200px] w-[180px] sm:w-[200px] items-center justify-center flex-shrink-0">
          {/* 바깥 링 */}
          <div className="absolute inset-0 rounded-full border-[8px] border-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]" />

          {/* 왼쪽 반원 - 사회적 가면 */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-b from-[#a8a2f0] to-[#8e88e8]" />
          </div>

          {/* 오른쪽 반원 - 실제 기질 */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-b from-[#efd88a] to-[#e1bf58]" />
          </div>

          {/* 부드러운 오버레이 */}
          <div className="absolute inset-[8px] rounded-full bg-white/18 backdrop-blur-[1px]" />

          {/* 중앙 분리선 */}
          <div className="absolute z-10 h-[75%] w-[1.5px] rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />

          {/* 중앙 코어 */}
          <div className="absolute z-20 flex h-[64px] sm:h-[72px] w-[64px] sm:w-[72px] flex-col items-center justify-center rounded-full border border-white/70 bg-[#fffdf8]/90 shadow-[0_6px_20px_rgba(0,0,0,0.08)] backdrop-blur">
            <p className="text-[8px] sm:text-[9px] font-medium tracking-tight text-stone-400">겉과 속</p>
            <p className="mt-0.5 text-center text-[10px] sm:text-[12px] font-bold leading-tight text-stone-700">
              {socialKeyword}
              <br />
              <span className="text-stone-400">vs</span>
              <br />
              {realKeyword}
            </p>
          </div>

          {/* 왼쪽 라벨 - 카드 안쪽(원 왼쪽 가장자리 안) */}
          <div className="absolute left-1 top-1/2 z-20 flex -translate-y-1/2 flex-col items-start gap-0.5 max-w-[72px] sm:max-w-[80px]">
            <span className="rounded-full bg-[#f3f0ff] px-1.5 py-0.5 text-[8px] sm:text-[9px] font-medium text-[#645dd6] shadow-sm whitespace-nowrap">
              🎭 사회적 가면
            </span>
            <div className="rounded-lg border border-[#d8d2ff] bg-white/90 px-1.5 py-0.5 text-left shadow-sm">
              <p className="text-[7px] sm:text-[8px] text-stone-400">겉</p>
              <p className="text-[10px] sm:text-[11px] font-bold text-[#5e58c9] leading-tight">{socialLabel}</p>
            </div>
          </div>

          {/* 오른쪽 라벨 - 카드 안쪽(원 오른쪽 가장자리 안) */}
          <div className="absolute right-1 top-1/2 z-20 flex -translate-y-1/2 flex-col items-end gap-0.5 max-w-[72px] sm:max-w-[80px]">
            <span className="rounded-full bg-[#fff4cf] px-1.5 py-0.5 text-[8px] sm:text-[9px] font-medium text-[#c28a17] shadow-sm whitespace-nowrap">
              🧠 실제 기질
            </span>
            <div className="rounded-lg border border-[#f1de9c] bg-white/90 px-1.5 py-0.5 text-right shadow-sm">
              <p className="text-[7px] sm:text-[8px] text-stone-400">속</p>
              <p className="text-[10px] sm:text-[11px] font-bold text-[#c28a17] leading-tight">{realLabel}</p>
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
