import type { SummaryPromptData } from "./summaryAnalysis";
import type { HarmonyClashPayload } from "../types/saju";

const HAP_CLASH_KEYS: (keyof HarmonyClashPayload)[] = [
  "cheongan_hap",
  "cheongan_jaenghap",
  "jiji_yukhap",
  "jiji_samhap",
  "jiji_banhap",
];
const CHUNG_CLASH_KEYS: (keyof HarmonyClashPayload)[] = ["cheongan_chung", "jiji_chung"];

function collectHarmonyDescriptions(
  hc: HarmonyClashPayload,
  keys: (keyof HarmonyClashPayload)[]
): string[] {
  const out: string[] = [];
  for (const k of keys) {
    const arr = hc[k];
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      if (item && typeof item === "object" && "description" in item) {
        const d = (item as { description?: string }).description;
        if (typeof d === "string" && d.trim()) out.push(d.trim());
      }
    }
  }
  return out;
}

export const SUMMARY_SYSTEM_PROMPT = `
당신은 한국 전통 명리학을 현대적 언어로 해석하는 사주 분석가입니다.
아래 사주 분석 데이터를 바탕으로 종합 요약을 작성하세요.

[작성 규칙]
1. 사주 용어(일간, 십성, 오행, 충, 형 등) 절대 사용 금지
2. 설명이 아니라 "이 사람의 인생 이야기"처럼 작성
3. 단점은 "관리할 성향"으로 표현, 부정적 단정 금지
4. 독자가 읽으면서 "내 얘기다"라고 느끼게 작성
5. 각 파트 180~220자, 전체 950~1050자
6. "당신은"으로 시작하는 파트 최소 3개 이상
7. 4파트에 "단점"이라는 표현 사용 금지
8. 5파트 마지막 문장은 반드시 희망적 방향으로 마무리
9. 동일 단어 3회 이상 반복 금지

[출력 구조]
1️⃣ 핵심 기질
(내용)

2️⃣ 가장 큰 강점
(내용)

3️⃣ 반복되는 인생 패턴
(내용)

4️⃣ 주의할 성향
(내용)

5️⃣ 인생 방향 가이드
(내용)
`.trim();

export function buildSummaryUserPrompt(data: SummaryPromptData): string {
  const base = `
일간 기질: ${data.dayStemDesc}
강한 기운: ${data.strongDesc}
주요 재능: ${data.talentDesc}
반복 패턴: ${data.patternDesc}
주의 성향: ${data.cautionDesc}
적합 방향: ${data.directionDesc}
기질 키워드: ${data.keywords}
신강약 상태: ${data.shingang}

위 데이터를 바탕으로 5단 구조 종합 요약을 작성해주세요.
`.trim();

  const hc = data.harmony_clash;
  if (!hc || typeof hc !== "object") {
    return base;
  }

  const hapList = collectHarmonyDescriptions(hc, HAP_CLASH_KEYS);
  const chungList = collectHarmonyDescriptions(hc, CHUNG_CLASH_KEYS);
  const hapText = hapList.length ? hapList.join(" / ") : "없음";
  const chungText = chungList.length ? chungList.join(" / ") : "없음";

  return `${base}

[이 사람의 합충 구조 - 반드시 종합 요약에 반영할 것]
- 발생한 합: ${hapText}
- 발생한 충: ${chungText}
- 합충이 삶에 미치는 영향을 종합 요약의 각 파트에 자연스럽게 녹여낼 것`.trim();
}

