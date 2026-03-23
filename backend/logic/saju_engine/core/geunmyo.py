#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
근묘화실론 (根苗花實論)
- 년주: 뿌리 (조상/초년/사회적 기반)
- 월주: 싹 (부모/청년기/직업환경)
- 일주: 꽃 (나/배우자/현재)
- 시주: 열매 (자녀/말년/미래)
"""

from logic.saju_engine.core.ten_gods import calculate_ten_god

POSITION_MEANING = {
    "year": {
        "name": "년주",
        "symbol": "뿌리(根)",
        "life_stage": "초년 (0~20대 초반)",
        "domain": "조상·가문·사회적 출발점",
        "modern": "내가 어떤 환경에서 출발했는지",
    },
    "month": {
        "name": "월주",
        "symbol": "싹(苗)",
        "life_stage": "청년기 (20~40대)",
        "domain": "부모·형제·직업·사회활동",
        "modern": "사회에서 어떻게 드러나고 일하는지",
    },
    "day": {
        "name": "일주",
        "symbol": "꽃(花)",
        "life_stage": "중년 (현재)",
        "domain": "나 자신·배우자·일상",
        "modern": "지금 나의 핵심과 배우자 관계",
    },
    "hour": {
        "name": "시주",
        "symbol": "열매(實)",
        "life_stage": "말년 (40대 이후~)",
        "domain": "자녀·미래·말년운",
        "modern": "앞으로 맺을 결실과 말년의 모습",
    },
}

TEN_GOD_POSITION_MEANING = {
    "비견": {
        "year": "조상 대에서 내려온 독립적 기질, 경쟁적 가문",
        "month": "직장/사회에서 경쟁자가 많은 환경, 동료와의 관계",
        "day": "나 자신이 독립적, 배우자도 비슷한 성향",
        "hour": "말년에 혼자 서는 힘, 자녀와 경쟁적 관계",
    },
    "겁재": {
        "year": "조상 대에 재물 기복, 형제 갈등",
        "month": "직장에서 경쟁 심함, 수입 기복",
        "day": "배우자와 주도권 갈등, 강한 자아",
        "hour": "말년 재물 변동, 자녀와 갈등 가능성",
    },
    "식신": {
        "year": "조상 대에 복록, 편안한 출발",
        "month": "직업에서 표현력/전문성 발휘, 생산적 환경",
        "day": "일상이 여유롭고 표현적, 배우자와 생활적",
        "hour": "말년 복록, 자녀가 효도하는 구조",
    },
    "상관": {
        "year": "조상 대에 개혁적 기질, 틀 깨는 가문",
        "month": "직업에서 창의성/반골 기질, 이직 많음",
        "day": "배우자와 갈등, 자유로운 일상 선호",
        "hour": "말년에 독특한 삶, 자녀가 개성 강함",
    },
    "편재": {
        "year": "조상 대에 사업가 기질, 재물 기복",
        "month": "직업에서 넓은 인맥/유통/사업",
        "day": "배우자가 활동적, 일상에서 재물 흐름",
        "hour": "말년 사업운, 자녀가 재물 관련",
    },
    "정재": {
        "year": "조상 대에 안정적 기반, 성실한 가문",
        "month": "직업에서 안정적 수입, 성실한 환경",
        "day": "배우자와 안정적 관계, 현실적 일상",
        "hour": "말년 안정, 자녀가 효도하는 구조",
    },
    "편관": {
        "year": "조상 대에 권력/군인 기질, 엄격한 가문",
        "month": "직업에서 경쟁/압박, 조직에서 시련",
        "day": "배우자와 갈등/압박, 강한 관계 긴장",
        "hour": "말년 시련, 자녀가 강한 성격",
    },
    "정관": {
        "year": "조상 대에 명예로운 가문, 사회적 기반",
        "month": "직업에서 안정적 조직, 명예로운 환경",
        "day": "배우자가 반듯하고 책임감 있음",
        "hour": "말년 명예, 자녀가 사회적으로 성공",
    },
    "편인": {
        "year": "조상 대에 학문/예술 기질, 특이한 가문",
        "month": "직업에서 전문 기술/연구, 독특한 환경",
        "day": "배우자와 정서적 거리, 혼자만의 세계",
        "hour": "말년에 고독/철학, 자녀와 정서적 거리",
    },
    "정인": {
        "year": "조상 대에 학문적 가문, 안정된 출발",
        "month": "직업에서 교육/학문, 안정적 보호 환경",
        "day": "배우자가 배려적, 일상이 안정적",
        "hour": "말년에 학문/종교, 자녀가 효도",
    },
}


def analyze_geunmyo(saju_data: dict) -> dict:
    """
    근묘화실론 분석
    각 기둥의 십성이 해당 인생 단계에서 어떤 의미인지 해석

    Returns:
        {
            'year': {
                'position_info': {...},
                'stem_ten_god': '편관',
                'branch_ten_god': '정재',
                'stem_meaning': '...',
                'branch_meaning': '...',
                'overall_meaning': '...',
            },
            ...
            'summary': {
                'youth': '초년 특성',
                'career': '직업/청년기 특성',
                'present': '현재 특성',
                'future': '말년/미래 특성',
            }
        }
    """
    day_stem = _get_day_stem(saju_data)
    pillars = _extract_pillars(saju_data)

    if not day_stem or not pillars:
        return {}

    result = {}

    for pos in ["year", "month", "day", "hour"]:
        pillar = pillars.get(pos, {})
        stem = pillar.get("stem", "")
        branch = pillar.get("branch", "")

        if not stem and not branch:
            continue

        stem_ten_god = ""
        branch_ten_god = ""

        if stem and pos != "day":
            try:
                stem_ten_god = calculate_ten_god(day_stem, stem)
            except Exception:
                pass

        if branch:
            try:
                branch_ten_god = calculate_ten_god(day_stem, branch)
            except Exception:
                pass

        position_info = POSITION_MEANING.get(pos, {})

        stem_meaning = ""
        if stem_ten_god and stem_ten_god in TEN_GOD_POSITION_MEANING:
            stem_meaning = TEN_GOD_POSITION_MEANING[stem_ten_god].get(pos, "")

        branch_meaning = ""
        if branch_ten_god and branch_ten_god in TEN_GOD_POSITION_MEANING:
            branch_meaning = TEN_GOD_POSITION_MEANING[branch_ten_god].get(pos, "")

        overall = _combine_meaning(pos, stem_ten_god, branch_ten_god, stem_meaning, branch_meaning)

        result[pos] = {
            "position_info": position_info,
            "stem": stem,
            "branch": branch,
            "stem_ten_god": stem_ten_god,
            "branch_ten_god": branch_ten_god,
            "stem_meaning": stem_meaning,
            "branch_meaning": branch_meaning,
            "overall_meaning": overall,
        }

    result["summary"] = _build_summary(result)
    return result


def _get_day_stem(saju_data: dict) -> str:
    basic = saju_data.get("basic_info", {})
    if basic:
        return basic.get("day_stem", "")
    pillars = saju_data.get("pillars", {})
    if pillars:
        day = pillars.get("day", {})
        return day.get("heavenly_stem", "") or day.get("cheongan", {}).get("hanja", "")
    return ""


def _extract_pillars(saju_data: dict) -> dict:
    pillars = saju_data.get("pillars", {})
    if pillars:
        result = {}
        for pos in ["year", "month", "day", "hour"]:
            p = pillars.get(pos, {})
            result[pos] = {
                "stem": p.get("heavenly_stem", "") or p.get("cheongan", {}).get("hanja", ""),
                "branch": p.get("earthly_branch", "") or p.get("jiji", {}).get("hanja", ""),
            }
        return result
    basic = saju_data.get("basic_info", {})
    if basic:
        result = {}
        for pos in ["year", "month", "day", "hour"]:
            val = basic.get(pos, "")
            if isinstance(val, str) and len(val) >= 2:
                result[pos] = {"stem": val[0], "branch": val[1]}
            else:
                result[pos] = {"stem": "", "branch": ""}
        return result
    return {}


def _combine_meaning(pos: str, stem_god: str, branch_god: str, stem_m: str, branch_m: str) -> str:
    pos_info = POSITION_MEANING.get(pos, {})
    stage = pos_info.get("life_stage", "")
    domain = pos_info.get("modern", "")

    parts = [f"[{stage}]"]
    if stem_m:
        parts.append(stem_m)
    if branch_m and branch_m != stem_m:
        parts.append(branch_m)
    if not stem_m and not branch_m:
        parts.append(f"{domain} 영역에서 특별한 패턴")

    return " / ".join(parts)


def _build_summary(result: dict) -> dict:
    return {
        "youth": result.get("year", {}).get("overall_meaning", ""),
        "career": result.get("month", {}).get("overall_meaning", ""),
        "present": result.get("day", {}).get("overall_meaning", ""),
        "future": result.get("hour", {}).get("overall_meaning", ""),
    }


def format_geunmyo_for_prompt(geunmyo_result: dict) -> str:
    """근묘화실 결과를 GPT 프롬프트용 텍스트로 변환"""
    if not geunmyo_result:
        return ""

    summary = geunmyo_result.get("summary", {})
    lines = ["[근묘화실론 — 인생 단계별 구조]"]

    if summary.get("youth"):
        lines.append(f'초년/뿌리: {summary["youth"]}')
    if summary.get("career"):
        lines.append(f'청년/직업: {summary["career"]}')
    if summary.get("present"):
        lines.append(f'현재/배우자: {summary["present"]}')
    if summary.get("future"):
        lines.append(f'말년/미래: {summary["future"]}')

    return "\n".join(lines)
