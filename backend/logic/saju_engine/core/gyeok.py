#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
格局(격국) 엔진 — 박청화식
규칙:
  1. 월지 지장간 확인
  2. 4주 천간(년간·월간·시간, 일간 제외)에 투출(透出)한 지장간 찾기
  3. 투출이 있으면 그것이 格神, 없으면 월지 정기(正氣)
  4. 格神 × 일간 십성 → 格 이름
  5. 格의 성패·희기신 판단
"""

from logic.saju_engine.core.ten_gods import calculate_ten_god

# ── 월지(한자) → 지장간 목록 [여기, 중기, 정기] ─────────────────────────
# 박청화 원전 기준 (정기 = 마지막 원소)
WOLJI_JIJANGGAN: dict[str, list[str]] = {
    "子": ["壬", "癸"],
    "丑": ["癸", "辛", "己"],
    "寅": ["戊", "丙", "甲"],
    "卯": ["甲", "乙"],
    "辰": ["乙", "癸", "戊"],
    "巳": ["戊", "庚", "丙"],
    "午": ["丙", "己", "丁"],
    "未": ["丁", "乙", "己"],
    "申": ["戊", "壬", "庚"],
    "酉": ["庚", "辛"],
    "戌": ["辛", "丁", "戊"],
    "亥": ["戊", "甲", "壬"],
}

# 천간 한자 → 한글 이름
STEM_KR: dict[str, str] = {
    "甲": "갑목", "乙": "을목", "丙": "병화", "丁": "정화",
    "戊": "무토", "己": "기토", "庚": "경금", "辛": "신금",
    "壬": "임수", "癸": "계수",
}

# 십성 → 格 이름 매핑
SIPSENG_TO_GYEOK: dict[str, str] = {
    "비견": "건록격",
    "겁재": "양인격",
    "식신": "식신격",
    "상관": "상관격",
    "편재": "편재격",
    "정재": "정재격",
    "편관": "편관격",   # 七殺格
    "정관": "정관격",
    "편인": "편인격",   # 梟神格
    "정인": "인수격",
}

# 格별 희신·기신·설명 테이블
GYEOK_TABLE: dict[str, dict] = {
    "건록격": {
        "desc": "일간과 월지가 동일 오행으로 자기 뿌리가 월령에 박힌 구조. 주체성·독립심이 강하고 자수성가 기질이 있어요.",
        "good": "재성·관성이 있어 쓰임새를 만들어줄 때 성격(成格)",
        "bad":  "비겁이 지나치게 많아 재성을 깨뜨리면 파격(破格)",
        "hishin": ["재성", "관성"],
        "gishin": ["비겁 과다"],
    },
    "양인격": {
        "desc": "겁재가 월령을 차지한 구조. 의지력·추진력이 강렬하나 날카로움이 있어요.",
        "good": "관성(칠살)이 제어해줄 때 성격",
        "bad":  "관성이 없고 비겁만 강하면 파격",
        "hishin": ["편관", "정관"],
        "gishin": ["비겁 과다", "식상 약"],
    },
    "식신격": {
        "desc": "생산·표현·창의의 격. 재능을 실물(재성)로 연결하는 흐름이 핵심이에요.",
        "good": "재성이 식신의 기운을 받아줄 때 성격",
        "bad":  "편인(효신)이 식신을 충극하면 파격",
        "hishin": ["재성"],
        "gishin": ["편인"],
    },
    "상관격": {
        "desc": "기존 틀을 깨는 창의적 에너지의 격. 재성으로 흘러야 빛을 발해요.",
        "good": "재성이 있거나 인성으로 다스릴 때 성격",
        "bad":  "정관을 충극하면 파격",
        "hishin": ["재성", "정인"],
        "gishin": ["정관 충극"],
    },
    "편재격": {
        "desc": "유통·투자·사업 기질의 격. 식상이 재성을 생해주는 흐름이 이상적이에요.",
        "good": "식상이 생해주고 관성이 제어할 때 성격",
        "bad":  "비겁이 재성을 나누어 취하면 파격",
        "hishin": ["식상", "관성"],
        "gishin": ["비겁 과다"],
    },
    "정재격": {
        "desc": "성실함·현실 감각·안정 지향의 격. 관성이 재성을 보호할 때 빛나요.",
        "good": "관성·인성이 있어 재성을 보호할 때 성격",
        "bad":  "비겁이 재성을 쟁탈하면 파격",
        "hishin": ["관성", "인성"],
        "gishin": ["비겁 과다"],
    },
    "편관격": {
        "desc": "도전·극복·통솔력의 격(칠살격). 식신이 제화하거나 인성이 화살할 때 성격이에요.",
        "good": "식신 제살 또는 인성 화살이 있을 때 성격",
        "bad":  "제화 없이 칠살만 강하면 파격",
        "hishin": ["식신", "정인"],
        "gishin": ["재성이 인성 충극"],
    },
    "정관격": {
        "desc": "질서·명예·사회적 신뢰의 격. 재성이 관성을 생해줄 때 이상적이에요.",
        "good": "재성이 관성을 생하고 인성이 있을 때 성격",
        "bad":  "상관이 정관을 충극하면 파격",
        "hishin": ["재성", "인성"],
        "gishin": ["상관"],
    },
    "편인격": {
        "desc": "직관·신비·독자적 사유의 격(효신격). 재성이 편인을 제어할 때 균형이 잡혀요.",
        "good": "재성이 편인을 제어하거나 관성이 있을 때 성격",
        "bad":  "식신을 탈취하면 파격",
        "hishin": ["재성", "관성"],
        "gishin": ["편인 과다"],
    },
    "인수격": {
        "desc": "학문·지혜·후원의 격. 관성이 인성을 생해주는 官印相生이 이상적이에요.",
        "good": "관성이 인성을 생하고 재성이 인성을 충극하지 않을 때 성격",
        "bad":  "재성이 인성을 충극하면 파격",
        "hishin": ["관성"],
        "gishin": ["재성 충극"],
    },
}


def _get_month_jiji(analysis: dict) -> str:
    """분석 결과에서 월지(한자) 추출"""
    basic = analysis.get("basic_info", {})
    # "month" 필드가 "甲子" 같은 2글자 간지인 경우
    month_pillar = basic.get("month", "")
    if len(month_pillar) >= 2:
        return month_pillar[1]
    return ""


def _get_all_stems(analysis: dict) -> list[str]:
    """4주 천간 전체 반환 [년간, 월간, 일간, 시간]"""
    basic = analysis.get("basic_info", {})
    stems = []
    for pillar_key in ["year", "month", "day", "hour"]:
        p = basic.get(pillar_key, "")
        if p:
            stems.append(p[0])  # 간지 첫 글자 = 천간
    return stems


def _find_tuchul(wolji: str, stems_except_day: list[str]) -> str | None:
    """
    월지 지장간 중 투출(透出)된 천간 반환.
    - 여러 개 투출 시 정기에 가까운(순서 뒤쪽) 것 우선
    """
    jijanggan = WOLJI_JIJANGGAN.get(wolji, [])
    found = None
    for jj in jijanggan:
        if jj in stems_except_day:
            found = jj  # 뒤쪽(정기 방향) 것을 덮어쓰기
    return found


def calculate_gyeok(analysis: dict) -> dict:
    """
    格局 계산 메인 함수.

    Returns:
        {
            "gyeok_name": "정관격",
            "gyeok_shin": "庚",          # 格神 천간
            "gyeok_shin_kr": "경금",
            "tuchul": True,              # 투출 여부
            "ten_god": "정관",
            "desc": "...",
            "good": "...",
            "bad":  "...",
            "hishin": [...],
            "gishin": [...],
            "prompt_text": "...",        # GPT 프롬프트용
        }
    """
    try:
        basic = analysis.get("basic_info", {})
        day_stem = basic.get("day_stem", "")
        if not day_stem:
            # day_stem 없으면 day 간지 첫 글자
            day_stem = basic.get("day", "")[:1]
        if not day_stem:
            return _empty_result()

        wolji = _get_month_jiji(analysis)
        if not wolji:
            return _empty_result()

        all_stems = _get_all_stems(analysis)
        stems_except_day = [s for s in all_stems if s != day_stem]

        # 格神 결정
        tuchul_stem = _find_tuchul(wolji, stems_except_day)
        if tuchul_stem:
            gyeok_shin = tuchul_stem
            tuchul = True
        else:
            jijanggan = WOLJI_JIJANGGAN.get(wolji, [])
            gyeok_shin = jijanggan[-1] if jijanggan else ""
            tuchul = False

        if not gyeok_shin:
            return _empty_result()

        ten_god = calculate_ten_god(day_stem, gyeok_shin)
        gyeok_name = SIPSENG_TO_GYEOK.get(ten_god, f"{ten_god}격")
        table = GYEOK_TABLE.get(gyeok_name, {})

        result = {
            "gyeok_name": gyeok_name,
            "gyeok_shin": gyeok_shin,
            "gyeok_shin_kr": STEM_KR.get(gyeok_shin, gyeok_shin),
            "tuchul": tuchul,
            "ten_god": ten_god,
            "wolji": wolji,
            "desc": table.get("desc", ""),
            "good": table.get("good", ""),
            "bad": table.get("bad", ""),
            "hishin": table.get("hishin", []),
            "gishin": table.get("gishin", []),
        }
        result["prompt_text"] = _format_for_prompt(result)
        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        return _empty_result()


def _empty_result() -> dict:
    return {
        "gyeok_name": "", "gyeok_shin": "", "gyeok_shin_kr": "",
        "tuchul": False, "ten_god": "", "wolji": "",
        "desc": "", "good": "", "bad": "",
        "hishin": [], "gishin": [], "prompt_text": "",
    }


def _format_for_prompt(r: dict) -> str:
    if not r.get("gyeok_name"):
        return ""
    lines = [
        "[格局 분석 — 반드시 해석에 반영할 것]",
        f"格: {r['gyeok_name']} (格神: {r['gyeok_shin_kr']}, "
        f"{'투출' if r['tuchul'] else '정기 취용'})",
        f"格의 핵심: {r['desc']}",
        f"成格 조건: {r['good']}",
        f"破格 주의: {r['bad']}",
        "",
        "[格局 해석 지침]",
        "1. 格 이름(건록격·식신격 등)을 직접 언급하지 말 것 — 일상 언어로만",
        "2. 格의 특성이 직업·인간관계·삶의 패턴으로 어떻게 드러나는지 설명",
        "3. 成格/破格 여부를 삶의 흐름(순탄함·막힘)으로 풀어서 설명",
    ]
    return "\n".join(lines)
