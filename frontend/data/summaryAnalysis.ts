import {
  CHUNG_PATTERN,
  DAYSTEM_DESC,
  DAYSTEM_DIRECTION,
  ELEMENT_CAUTION,
  ELEMENT_KEYWORDS,
  ELEMENT_PATTERN,
  ELEMENT_STRONG_DESC,
  HYUNG_PATTERN,
  MISSING_SIPSUNG_CAUTION,
  SIPSUNG_COMBO,
  SIPSUNG_DIRECTION,
  SIPSUNG_KEYWORDS,
  SIPSUNG_STRENGTH,
  type ChungKey,
  type ElementKo,
  type HyungKey,
  type SipsungKey,
} from "./summaryDictionaries";

export type ShingangLevel = "신강" | "중간" | "신약";

export interface SummaryInput {
  dayStem: string;
  elements: Record<ElementKo, number>;
  sipsung: Record<SipsungKey, number>;
  chung: ChungKey[];
  hyung: HyungKey[];
  shingang: ShingangLevel;
}

export interface SummaryPromptData {
  dayStemDesc: string;
  strongDesc: string;
  talentDesc: string;
  patternDesc: string;
  cautionDesc: string;
  directionDesc: string;
  keywords: string;
  shingang: string;
}

function getStrongElements(elements: Record<ElementKo, number>): ElementKo[] {
  return (Object.entries(elements) as [ElementKo, number][])
    .filter(([, v]) => v >= 3)
    .map(([k]) => k);
}

function getWeakElements(elements: Record<ElementKo, number>): ElementKo[] {
  return (Object.entries(elements) as [ElementKo, number][])
    .filter(([, v]) => v === 0)
    .map(([k]) => k);
}

function getStrongSipsung(sipsung: Record<SipsungKey, number>): SipsungKey[] {
  return (Object.entries(sipsung) as [SipsungKey, number][])
    .filter(([, v]) => v >= 2)
    .map(([k]) => k);
}

function getMissingSipsungGroups(sipsung: Record<SipsungKey, number>): string[] {
  const zero = (keys: SipsungKey[]) => keys.every((k) => (sipsung[k] ?? 0) === 0);

  const result: string[] = [];
  if (zero(["비견", "겁재"])) result.push("비겁없음");
  if (zero(["식신", "상관"])) result.push("식상없음");
  if (zero(["정재", "편재"])) result.push("재성없음");
  if (zero(["정관", "편관"])) result.push("관성없음");
  if (zero(["정인", "편인"])) result.push("인성없음");
  return result;
}

export function buildSummaryPromptData(input: SummaryInput): SummaryPromptData {
  const { dayStem, elements, sipsung, chung, hyung, shingang } = input;

  const strongElements = getStrongElements(elements);
  const weakElements = getWeakElements(elements);
  const strongSipsung = getStrongSipsung(sipsung);
  const missingGroups = getMissingSipsungGroups(sipsung);

  const dayStemDesc = DAYSTEM_DESC[dayStem] ?? "";

  let strongDesc = strongElements
    .map((e) => ELEMENT_STRONG_DESC[e])
    .filter(Boolean)
    .join(", ");

  if (!strongDesc) {
    strongDesc = "균형 잡힌 오행 분포로 다양한 상황에 유연하게 적응하는 에너지";
  }

  let talentDesc = "";

  if (strongSipsung.length >= 2) {
    const key1 = `${strongSipsung[0]}+${strongSipsung[1]}`;
    const key2 = `${strongSipsung[1]}+${strongSipsung[0]}`;
    talentDesc =
      SIPSUNG_COMBO[key1] ||
      SIPSUNG_COMBO[key2] ||
      strongSipsung
        .map((s) => SIPSUNG_STRENGTH[s])
        .filter(Boolean)
        .join(" + ");
  } else if (strongSipsung.length === 1) {
    talentDesc = SIPSUNG_STRENGTH[strongSipsung[0]] || "";
  }

  if (!talentDesc) {
    talentDesc = "다양한 분야에서 고르게 발휘되는 재능";
  }

  const patternParts: string[] = [];

  strongElements.forEach((e) => {
    const t = ELEMENT_PATTERN[e];
    if (t) patternParts.push(t);
  });
  chung.forEach((c) => {
    const t = CHUNG_PATTERN[c];
    if (t) patternParts.push(t);
  });
  hyung.forEach((h) => {
    const t = HYUNG_PATTERN[h];
    if (t) patternParts.push(t);
  });

  const patternDesc =
    patternParts.length > 0
      ? Array.from(new Set(patternParts)).slice(0, 2).join(", ")
      : "특별히 고착된 패턴 없이 유연하게 흐름을 헤쳐나가는 타입";

  const cautionParts: string[] = [];

  strongElements.forEach((e) => {
    const t = ELEMENT_CAUTION[e];
    if (t) cautionParts.push(t);
  });
  missingGroups.forEach((g) => {
    const t = MISSING_SIPSUNG_CAUTION[g];
    if (t) cautionParts.push(t);
  });

  const cautionDesc =
    cautionParts.length > 0
      ? Array.from(new Set(cautionParts)).slice(0, 2).join(", ")
      : "균형 잡힌 기운으로 특별한 과잉 성향은 크지 않지만, 상황에 따라 에너지 사용 방식을 조율하는 것이 중요합니다.";

  const directionParts: string[] = [];

  if (DAYSTEM_DIRECTION[dayStem]) {
    directionParts.push(DAYSTEM_DIRECTION[dayStem]);
  }
  strongSipsung.forEach((s) => {
    const t = SIPSUNG_DIRECTION[s];
    if (t) directionParts.push(t);
  });

  const directionDesc =
    directionParts.length > 0
      ? Array.from(new Set(directionParts)).slice(0, 2).join(" + ")
      : "여러 환경을 두루 경험하며 자신에게 맞는 무대를 찾아가는 방향이 잘 맞는 편입니다.";

  const kw: string[] = [];
  strongElements.forEach((e) => {
    kw.push(...(ELEMENT_KEYWORDS[e] ?? []));
  });
  strongSipsung.forEach((s) => {
    kw.push(...(SIPSUNG_KEYWORDS[s] ?? []));
  });

  const keywords = Array.from(new Set(kw)).slice(0, 6).join(", ");

  const shingangText =
    shingang === "신강"
      ? "에너지와 회복력이 전반적으로 강한 편으로, 스스로 속도를 조절할 때 잠재력이 크게 발휘됩니다."
      : shingang === "신약"
      ? "환경과 감정 변화에 민감한 편으로, 에너지 관리와 회복 루틴을 의식적으로 만들수록 강점이 또렷해집니다."
      : "상황과 관리에 따라 컨디션이 크게 달라지는 타입으로, 리듬을 안정적으로 잡을수록 장점이 자연스럽게 드러납니다.";

  return {
    dayStemDesc,
    strongDesc,
    talentDesc,
    patternDesc,
    cautionDesc,
    directionDesc,
    keywords,
    shingang: shingangText,
  };
}

/** GPT API 없을 때 쓰는 로컬 종합 요약 (준비중 대신 표시) */
export function getSummaryGuideFallback(input: SummaryInput): string {
  const d = buildSummaryPromptData(input);
  const lines: string[] = [];
  if (d.dayStemDesc) lines.push(d.dayStemDesc);
  if (d.strongDesc) lines.push(`당신의 사주에는 ${d.strongDesc}가 잘 드러나 있습니다.`);
  if (d.talentDesc) lines.push(`재능과 적성 측면에서는 ${d.talentDesc}.`);
  if (d.patternDesc) lines.push(`인생 패턴으로는 ${d.patternDesc}.`);
  if (d.cautionDesc) lines.push(d.cautionDesc);
  if (d.directionDesc) lines.push(`앞으로의 방향은 ${d.directionDesc}`);
  if (d.shingang) lines.push(d.shingang);
  if (d.keywords) lines.push(`핵심 키워드: ${d.keywords}.`);
  return lines.filter(Boolean).join("\n\n");
}

