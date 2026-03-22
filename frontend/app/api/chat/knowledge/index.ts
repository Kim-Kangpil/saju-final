// ─────────────────────────────────────────────
// index.ts — 질문 라우터 + 지식 블록 조립기
// ─────────────────────────────────────────────

import { TOOL_RULES, QUALITY_PHILOSOPHY } from "./base";
import { TIME_RULES } from "./time";
import { WUXING_KNOWLEDGE } from "./wuxing";
import {
  TEN_GODS_INTRO,
  TEN_GODS_BIGEOP,
  TEN_GODS_SIKSANG,
  TEN_GODS_JAESEONG,
  TEN_GODS_GWANSEONG,
  TEN_GODS_INSEONG,
  TEN_GODS_FULL,
} from "./tenGods";
import { HAPCHUNG_RELATION, HAPCHUNG_CAREER, HAPCHUNG_FULL } from "./hapchung";
import { SINSAL_RELATION, SINSAL_CAREER, SINSAL_HEALTH, SINSAL_FULL } from "./sinsal";
import { DAEUN_KNOWLEDGE, YONGSHIN_KNOWLEDGE } from "./daeun";
import {
  LOVE_BASE,
  LOVE_NEW,
  LOVE_BREAKUP,
  LOVE_MARRIAGE,
  LOVE_COMPATIBILITY,
} from "./love";
import { CAREER_BASE, CAREER_CHANGE } from "./career";
import { MONEY_BASE, MONEY_INVEST } from "./money";
import { HEALTH_BASE, HEALTH_SINSAL } from "./health";
import { ILJU_INTRO, ILJU_60 } from "./ilju";
import { CHEONEUL_GWIAIN_CORE, THEORY_FOLLOWUP_AND_TONE } from "./guiin";

// ─────────────────────────────────────────────
// 1단계 intent
// ─────────────────────────────────────────────
export type Intent1 =
  | "love"
  | "career"
  | "money"
  | "health"
  | "fortune"
  | "daily"
  | "personality"
  | "theory"
  | "general";

// 2단계 sub-intent (연애 세분화)
export type LoveSub =
  | "love_new"      // 새 인연·썸
  | "love_breakup"  // 이별·재회
  | "love_marriage" // 결혼·배우자
  | "love_compat"   // 궁합
  | "love_general"; // 일반 연애

// ─────────────────────────────────────────────
// 2. detectIntent — 키워드 기반 1차 분류
// ─────────────────────────────────────────────
export function detectIntent(text: string): Intent1 {
  const q = text;

  // 개념·정의 질문 (fortune·타이밍 질문보다 먼저 — "대운이 뭐야", "십성이란" 등)
  if (
    /천을귀인|천을 귀인|천을귀|신살.*뭐|신살이 뭐|신살이란|공망.*뭐|공망이 뭐|도화살.*뭐|도화가 뭐|역마살.*뭐|화개.*뭐|원진살.*뭐|백호살.*뭐|겁살|재살|월덕|천덕귀인|귀인이 뭐|십성.*뭐|십성이란|비견.*뭐|겁재.*뭐|식신.*뭐|상관.*뭐|편재.*뭐|정재.*뭐|편관.*뭐|정관.*뭐|편인.*뭐|정인.*뭐|일간.*뭐|지지.*뭐|천간.*뭐|합충.*뭐|합충이란|형파해|삼합|방합|대운.*뭐|대운이란|세운.*뭐|세운이란|오행.*뭐|오행이란|일주.*뭐|일주란|용신.*뭐|용신이란|격국.*뭐|격국이란/.test(
      q,
    )
  )
    return "theory";

  if (/연애|사랑|썸|이별|재회|결혼|남친|여친|남자친구|여자친구|배우자|궁합|솔로|짝사랑|고백|헤어|이성/.test(q))
    return "love";
  if (/직업|취업|이직|회사|진로|사업|장사|커리어|직장|알바|창업|스타트업|프리랜서|퇴사|승진|면접/.test(q))
    return "career";
  if (/돈|재물|수입|매출|투자|재테크|부자|월급|연봉|주식|코인|빚|대출|재산|부동산/.test(q))
    return "money";
  if (/건강|몸|아픔|체력|병|수술|컨디션|피로|허리|두통|소화|불면|다이어트|의료/.test(q))
    return "health";
  if (/대운|세운|올해|내년|언제부터|언제쯤|흐름|몇 살|타이밍|시기|앞으로/.test(q))
    return "fortune";
  if (/오늘|일진|지금|오늘의|금일|오늘 운세/.test(q))
    return "daily";
  if (/성격|성향|나는 어떤|나 어때|일주|기질|내 특징|내 장점|내 단점|MBTI|어울리는/.test(q))
    return "personality";

  return "general";
}

// ─────────────────────────────────────────────
// 3. detectLoveSub — 연애 2단계 세분화
// ─────────────────────────────────────────────
export function detectLoveSub(text: string): LoveSub {
  const q = text;

  if (/재회|다시 만|돌아올|연락이 올|헤어지고|이별|헤어/.test(q)) return "love_breakup";
  if (/결혼|혼인|배우자|남편|아내|시댁|婚|언제 결혼/.test(q)) return "love_marriage";
  if (/궁합|잘 맞|어울리는 사람|맞는 사람|찰떡|잘 안 맞/.test(q)) return "love_compat";
  if (/썸|새로운 사람|이성 인연|새 인연|만남|소개팅|설레/.test(q)) return "love_new";

  return "love_general";
}

// ─────────────────────────────────────────────
// 4. getKnowledgeBlocks — intent별 블록 조립
// ─────────────────────────────────────────────
export function getKnowledgeBlocks(intent: Intent1, text: string): string[] {
  // 항상 포함: 도구 규칙 + 품질 철학
  const base = [TOOL_RULES, QUALITY_PHILOSOPHY];

  switch (intent) {
    // ── 연애 ──────────────────────────────────
    case "love": {
      const sub = detectLoveSub(text);
      const loveBlocks = [
        LOVE_BASE,
        TEN_GODS_INTRO,
        TEN_GODS_GWANSEONG, // 관성 (여자 남자 인연)
        TEN_GODS_JAESEONG,  // 재성 (남자 여자 인연)
        HAPCHUNG_RELATION,
        SINSAL_RELATION,
      ];
      // 2단계 세분화 블록 추가
      if (sub === "love_breakup") loveBlocks.push(LOVE_BREAKUP);
      else if (sub === "love_marriage") loveBlocks.push(LOVE_MARRIAGE, DAEUN_KNOWLEDGE);
      else if (sub === "love_compat") loveBlocks.push(LOVE_COMPATIBILITY);
      else if (sub === "love_new") loveBlocks.push(LOVE_NEW, DAEUN_KNOWLEDGE);
      else loveBlocks.push(LOVE_NEW, LOVE_MARRIAGE);

      return [...base, ...loveBlocks];
    }

    // ── 직업·진로 ─────────────────────────────
    case "career":
      return [
        ...base,
        CAREER_BASE,
        CAREER_CHANGE,
        TEN_GODS_INTRO,
        TEN_GODS_SIKSANG,   // 식상 (재능·표현)
        TEN_GODS_GWANSEONG, // 관성 (직장·책임)
        TEN_GODS_JAESEONG,  // 재성 (사업·수입)
        HAPCHUNG_CAREER,
        SINSAL_CAREER,
        DAEUN_KNOWLEDGE,
      ];

    // ── 재물·투자 ─────────────────────────────
    case "money":
      return [
        ...base,
        MONEY_BASE,
        MONEY_INVEST,
        TEN_GODS_INTRO,
        TEN_GODS_JAESEONG,  // 재성 핵심
        TEN_GODS_SIKSANG,   // 식신생재
        TEN_GODS_BIGEOP,    // 비겁 재성 극
        DAEUN_KNOWLEDGE,
      ];

    // ── 건강 ──────────────────────────────────
    case "health":
      return [
        ...base,
        HEALTH_BASE,
        HEALTH_SINSAL,
        WUXING_KNOWLEDGE,   // 오행 신체 연결
        SINSAL_HEALTH,
        DAEUN_KNOWLEDGE,
      ];

    // ── 대운·운의 흐름 ────────────────────────
    case "fortune":
      return [
        ...base,
        DAEUN_KNOWLEDGE,
        YONGSHIN_KNOWLEDGE,
        TEN_GODS_INTRO,
        TEN_GODS_GWANSEONG,
        TEN_GODS_JAESEONG,
        HAPCHUNG_FULL,
      ];

    // ── 오늘 일진 ─────────────────────────────
    case "daily":
      return [
        ...base,
        TIME_RULES,
        WUXING_KNOWLEDGE,
      ];

    // ── 성격·일주 ─────────────────────────────
    case "personality":
      return [
        ...base,
        ILJU_INTRO,
        ILJU_60,
        WUXING_KNOWLEDGE,
        TEN_GODS_FULL,
        SINSAL_FULL,
      ];

    // ── 개념·신살·십성 이론 — 질문 키워드에 맞는 블록만 추가 ─────
    case "theory": {
      const blocks = [...base, THEORY_FOLLOWUP_AND_TONE];
      if (/천을귀인|귀인/.test(text)) blocks.push(CHEONEUL_GWIAIN_CORE);
      if (
        /십성|식신|상관|편재|정재|편관|정관|편인|정인|비겁|겁재|비견/.test(text)
      )
        blocks.push(TEN_GODS_INTRO);
      if (/합충|합|충|형|파|해/.test(text)) blocks.push(HAPCHUNG_FULL);
      if (/신살|도화|역마|공망|화개|백호|양인/.test(text))
        blocks.push(SINSAL_FULL);
      if (/오행|목화토금수|상생|상극/.test(text)) blocks.push(WUXING_KNOWLEDGE);
      if (/대운|세운|운세|흐름/.test(text)) blocks.push(DAEUN_KNOWLEDGE);
      if (
        /일주|갑자|갑인|갑오|갑신|갑술|갑진/.test(text)
      ) {
        blocks.push(ILJU_INTRO);
        blocks.push(ILJU_60);
      }
      // base(2) + 말투(1)만이면 토픽 미매칭 → 핵심 이론 기본 세트
      if (blocks.length === 3) {
        blocks.push(CHEONEUL_GWIAIN_CORE, TEN_GODS_INTRO, HAPCHUNG_FULL);
      }
      return blocks;
    }

    // ── 일반·기타 ─────────────────────────────
    default:
      return [
        ...base,
        WUXING_KNOWLEDGE,
        TEN_GODS_FULL,
        HAPCHUNG_FULL,
        SINSAL_FULL,
        DAEUN_KNOWLEDGE,
      ];
  }
}

// ─────────────────────────────────────────────
// 5. assembleKnowledge — 블록을 하나의 문자열로 합침
// ─────────────────────────────────────────────
export function assembleKnowledge(intent: Intent1, text: string): string {
  return getKnowledgeBlocks(intent, text).join("\n\n");
}
