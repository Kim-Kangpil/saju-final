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
      <div className="px-4 sm:px-6 py-5 sm:py-7 overflow-visible">
        <div className="mb-4 sm:mb-5">
          <p className="text-[15px] font-semibold text-stone-700">
            사회적 가면과 실제 기질
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-stone-500">
            사람들이 먼저 보는 모습과, 편할 때 드러나는 본성을 함께 보여줘요
          </p>
        </div>

        <div className="relative mx-auto mb-5 sm:mb-6 flex h-[240px] sm:h-[280px] w-[240px] sm:w-[280px] items-center justify-center flex-shrink-0">
          {/* 바깥 링 */}
          <div className="absolute inset-0 rounded-full border-[10px] border-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]" />

          {/* 왼쪽 반원 - 사회적 가면 */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-b from-[#a8a2f0] to-[#8e88e8]" />
          </div>

          {/* 오른쪽 반원 - 실제 기질 */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-b from-[#efd88a] to-[#e1bf58]" />
          </div>

          {/* 부드러운 오버레이 */}
          <div className="absolute inset-[10px] rounded-full bg-white/18 backdrop-blur-[1px]" />

          {/* 중앙 분리선 */}
          <div className="absolute z-10 h-[78%] w-[2px] rounded-full bg-white/80 shadow-[0_0_16px_rgba(255,255,255,0.8)]" />

          {/* 중앙 코어 */}
          <div className="absolute z-20 flex h-[90px] sm:h-[112px] w-[90px] sm:w-[112px] flex-col items-center justify-center rounded-full border border-white/70 bg-[#fffdf8]/90 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur">
            <p className="text-[10px] sm:text-[11px] font-medium tracking-tight text-stone-400">
              겉과 속
            </p>
            <p className="mt-1 text-center text-[14px] sm:text-[18px] font-bold leading-tight text-stone-700">
              {socialKeyword}
              <br />
              <span className="text-stone-400">vs</span>
              <br />
              {realKeyword}
            </p>
          </div>

          {/* 왼쪽 라벨 - 사회적 가면 */}
          <div className="absolute left-0 top-1/2 z-20 flex -translate-x-full -translate-y-1/2 flex-col items-end gap-1.5 pr-2">
            <span className="rounded-full bg-[#f3f0ff] px-2.5 py-1 text-[10px] sm:text-xs font-medium text-[#645dd6] shadow-sm">
              🎭 사회적 가면
            </span>
            <div className="rounded-xl border border-[#d8d2ff] bg-white/80 px-2.5 py-1.5 text-right shadow-sm">
              <p className="text-[10px] text-stone-400">겉으로 보이는 나</p>
              <p className="text-[14px] sm:text-base font-bold text-[#5e58c9]">{socialLabel}</p>
            </div>
          </div>

          {/* 오른쪽 라벨 - 실제 기질 */}
          <div className="absolute right-0 top-1/2 z-20 flex translate-x-full -translate-y-1/2 flex-col items-start gap-1.5 pl-2">
            <span className="rounded-full bg-[#fff4cf] px-2.5 py-1 text-[10px] sm:text-xs font-medium text-[#c28a17] shadow-sm">
              🧠 실제 기질
            </span>
            <div className="rounded-xl border border-[#f1de9c] bg-white/80 px-2.5 py-1.5 text-left shadow-sm">
              <p className="text-[10px] text-stone-400">편할 때 드러나는 나</p>
              <p className="text-[14px] sm:text-base font-bold text-[#c28a17]">{realLabel}</p>
            </div>
          </div>
        </div>

        {/* 무의식 습관 pill */}
        <div className="mb-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd7d7] bg-white/80 px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm">
            <span className="text-base">⚡</span>
            <span className="text-[12px] sm:text-[13px] text-stone-500">무의식 습관</span>
            <span className="text-[13px] sm:text-[15px] font-bold text-rose-500">{habitLabel}</span>
          </div>
        </div>

        {/* 중앙 한 줄 + 요약 */}
        <div className="rounded-2xl bg-white/60 px-4 py-3 sm:py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
          <p className="text-[18px] sm:text-[22px] font-bold tracking-tight text-stone-700">
            겉은 {socialKeyword}, 속은 {realKeyword}
          </p>
          {summary && (
            <p className="mt-2 text-[13px] sm:text-[14px] leading-relaxed text-stone-500">
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
