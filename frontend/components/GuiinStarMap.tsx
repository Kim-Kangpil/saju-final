"use client";

import { detectGuiin, GuiinKey, PillarPos } from "../data/guiinAnalysis";

type GuiinStarMapProps = {
  dayStem: string;
  monthBranch: string;
  stems: string[];
  branches: string[];
};

/** 카드용 한 줄 능력 설명 */
const GUIIN_ABILITY: Record<GuiinKey, string> = {
  cheonul: "위기마다 기묘한 도움이 들어오는 귀인",
  cheondeok: "재앙을 막아주는 하늘의 덕·보호막",
  woldeok: "음덕과 내조, 위기 때 돌아오는 힘",
  munchang: "말과 글·표현·시험 재능",
  hakdang: "배우고 가르치는 학습·교육 재능",
  cheonui: "치유·회복, 타인 돌봄 재능",
  amrok: "숨은 재복, 위기 때 버팀목",
  wolgong: "의미·가치 추구, 청정한 기운",
  geonrok: "자력으로 서는 독립·직업 복",
  geumyeolog: "품격 있는 인연·배우자 복",
  bokseong: "일상의 먹복·인복·안정",
  taegeuk: "굴곡 속에서도 중심으로 돌아오는 복원력",
  cheonju: "먹복·대접·베풂의 기운",
  samgi: "범상치 않은 재능·특이한 서사",
};

const GUIIN_ORDER: GuiinKey[] = [
  "cheonul",
  "cheondeok",
  "woldeok",
  "munchang",
  "hakdang",
  "cheonui",
  "amrok",
  "wolgong",
  "geonrok",
  "geumyeolog",
  "bokseong",
  "taegeuk",
  "cheonju",
  "samgi",
];

const GUIIN_NAME: Record<GuiinKey, string> = {
  cheonul: "천을귀인",
  cheondeok: "천덕귀인",
  woldeok: "월덕귀인",
  munchang: "문창귀인",
  hakdang: "학당귀인",
  cheonui: "천의성",
  amrok: "암록",
  wolgong: "월공",
  geonrok: "건록",
  geumyeolog: "금여록",
  bokseong: "복성귀인",
  taegeuk: "태극귀인",
  cheonju: "천주귀인",
  samgi: "삼기귀인",
};

export function GuiinStarMap(props: GuiinStarMapProps) {
  const { dayStem, monthBranch, stems, branches } = props;
  const hits = detectGuiin(dayStem, monthBranch, stems, branches);
  const byKey = new Map<GuiinKey, PillarPos[]>();
  hits.forEach((h) => {
    if (h.pos === "연월일" || h.pos === "월일시") return;
    const arr = byKey.get(h.key) ?? [];
    arr.push(h.pos as PillarPos);
    byKey.set(h.key, arr);
  });

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2">
        {GUIIN_ORDER.map((key) => {
          const active = byKey.has(key);
          const positions = byKey.get(key) ?? [];
          return (
            <div
              key={key}
              className={`
                rounded-xl border-2 px-3 py-2.5 text-left transition-colors
                ${active
                  ? "border-[#7a9b7c] bg-[#e8f0e9]"
                  : "border-[#d4e0d5] bg-white/80"
                }
              `}
            >
              <div
                className={`text-[11px] font-bold ${
                  active ? "text-[#556b2f]" : "text-[#8a9a8b]"
                }`}
              >
                {GUIIN_NAME[key]}
              </div>
              <p
                className={`mt-0.5 text-[10px] leading-snug ${
                  active ? "text-[#5a6b5c]" : "text-[#a8b5a9]"
                }`}
              >
                {GUIIN_ABILITY[key]}
              </p>
              {active && positions.length > 0 && (
                <p className="mt-1 text-[9px] text-[#6b7c6d]">
                  {positions.join(" · ")} 성립
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
