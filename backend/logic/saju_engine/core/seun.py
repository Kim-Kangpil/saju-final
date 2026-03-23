#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
세운(歲運) 분석
- 올해(2026년) 천간/지지가 원국에 미치는 영향
- 원국과의 합충 분석
- 어떤 십성이 활성화되는지
"""

from datetime import datetime

from logic.saju_engine.core.harmony_clash import analyze_harmony_clash
from logic.saju_engine.core.ten_gods import calculate_ten_god

# 연도별 간지
YEAR_GANZHI = {
    2020: ("庚", "子"),
    2021: ("辛", "丑"),
    2022: ("壬", "寅"),
    2023: ("癸", "卯"),
    2024: ("甲", "辰"),
    2025: ("乙", "巳"),
    2026: ("丙", "午"),
    2027: ("丁", "未"),
    2028: ("戊", "申"),
    2029: ("己", "酉"),
    2030: ("庚", "戌"),
}

TEN_GOD_SEUN_MEANING = {
    "비견": "경쟁/독립/동업 에너지가 강해짐. 혼자 밀어붙이는 해.",
    "겁재": "재물 변동/경쟁 심화. 보증/동업 주의. 강한 추진력.",
    "식신": "표현/생산/여유. 안정적으로 결과 만드는 해. 먹복.",
    "상관": "변화/이직/창의. 기존 틀을 깨는 해. 관성과 충돌 주의.",
    "편재": "기회/인맥/유통. 움직이면 돈이 보이는 해. 변동성 큼.",
    "정재": "안정/저축/현실. 꾸준히 쌓는 해. 급한 투자 피할 것.",
    "편관": "압박/도전/시험. 힘든 만큼 성장. 관재수 주의.",
    "정관": "명예/승진/책임. 조직에서 인정받는 해. 규칙 지킬 것.",
    "편인": "학습/연구/내면. 혼자 파는 시간. 새 기술 배우기 좋음.",
    "정인": "보호/자격/안정. 배움과 자격이 도움. 쉬어가는 해.",
}


def analyze_seun(saju_data: dict, year: int = None) -> dict:
    """
    세운 분석

    Args:
        saju_data: 사주 데이터
        year: 분석할 연도 (기본값: 올해)

    Returns:
        {
            'year': 2026,
            'seun_stem': '丙',
            'seun_branch': '午',
            'stem_ten_god': '편재',
            'branch_ten_god': '정재',
            'stem_meaning': '...',
            'branch_meaning': '...',
            'harmony_clash': {...},
            'activated_domain': '재물/기회',
            'overall': '...',
            'advice': '...',
        }
    """
    if year is None:
        year = datetime.now().year

    seun_ganzhi = YEAR_GANZHI.get(year)
    if not seun_ganzhi:
        return {}

    seun_stem, seun_branch = seun_ganzhi
    day_stem = _get_day_stem(saju_data)

    if not day_stem:
        return {}

    stem_ten_god = ""
    branch_ten_god = ""

    try:
        stem_ten_god = calculate_ten_god(day_stem, seun_stem)
    except Exception:
        pass

    try:
        branch_ten_god = calculate_ten_god(day_stem, seun_branch)
    except Exception:
        pass

    # 세운과 원국 합충 분석
    original_pillars = _get_pillars_dict(saju_data)
    seun_pillars = {
        "year": f"{seun_stem}{seun_branch}",
        "month": original_pillars.get("month", ""),
        "day": original_pillars.get("day", ""),
        "hour": original_pillars.get("hour", ""),
    }

    harmony_clash = {}
    try:
        harmony_clash = analyze_harmony_clash(seun_pillars)
    except Exception:
        pass

    activated = _get_activated_domain(stem_ten_god, branch_ten_god)
    overall = _build_overall(year, seun_stem, seun_branch, stem_ten_god, branch_ten_god)
    advice = _build_advice(stem_ten_god, branch_ten_god)

    return {
        "year": year,
        "seun_stem": seun_stem,
        "seun_branch": seun_branch,
        "stem_ten_god": stem_ten_god,
        "branch_ten_god": branch_ten_god,
        "stem_meaning": TEN_GOD_SEUN_MEANING.get(stem_ten_god, ""),
        "branch_meaning": TEN_GOD_SEUN_MEANING.get(branch_ten_god, ""),
        "harmony_clash": harmony_clash,
        "activated_domain": activated,
        "overall": overall,
        "advice": advice,
    }


def _get_day_stem(saju_data: dict) -> str:
    basic = saju_data.get("basic_info", {})
    if basic:
        return basic.get("day_stem", "")
    pillars = saju_data.get("pillars", {})
    if pillars:
        day = pillars.get("day", {})
        return day.get("heavenly_stem", "") or day.get("cheongan", {}).get("hanja", "")
    return ""


def _get_pillars_dict(saju_data: dict) -> dict:
    basic = saju_data.get("basic_info", {})
    if basic:
        return {
            "year": basic.get("year", ""),
            "month": basic.get("month", ""),
            "day": basic.get("day", ""),
            "hour": basic.get("hour", ""),
        }
    return {}


def _get_activated_domain(stem_god: str, branch_god: str) -> str:
    domain_map = {
        "비견": "독립/경쟁",
        "겁재": "재물변동/경쟁",
        "식신": "표현/안정",
        "상관": "변화/창의",
        "편재": "기회/재물",
        "정재": "안정/저축",
        "편관": "도전/압박",
        "정관": "명예/조직",
        "편인": "학습/내면",
        "정인": "보호/자격",
    }
    d1 = domain_map.get(stem_god, "")
    d2 = domain_map.get(branch_god, "")
    if d1 and d2 and d1 != d2:
        return f"{d1}, {d2}"
    return d1 or d2 or "전반적 변화"


def _build_overall(year: int, stem: str, branch: str, stem_god: str, branch_god: str) -> str:
    return (
        f"{year}년은 {stem}{branch}년으로, "
        f"천간에서 {stem_god} 에너지가 강해지고 "
        f"지지에서 {branch_god} 기운이 작동하는 해입니다."
    )


def _build_advice(stem_god: str, branch_god: str) -> str:
    advice_map = {
        "편재": "움직이면 기회가 보이는 해. 새로운 인연/프로젝트 적극 시도.",
        "정재": "안정적으로 쌓는 해. 급한 투자보다 꾸준한 저축.",
        "편관": "힘든 만큼 성장하는 해. 관재수 주의, 건강 챙길 것.",
        "정관": "조직에서 인정받는 해. 규칙 지키고 책임감 발휘.",
        "식신": "여유롭게 결과 만드는 해. 좋아하는 것 충분히 할 것.",
        "상관": "변화의 해. 이직/독립 고려 중이라면 시도해볼 만함.",
        "비견": "혼자 밀어붙이는 해. 동업 시 역할 분담 명확히.",
        "겁재": "재물 변동 주의. 보증/동업 신중하게.",
        "편인": "배우고 연구하는 해. 새 기술/자격 취득 좋음.",
        "정인": "쉬어가며 충전하는 해. 무리하지 말 것.",
    }
    return advice_map.get(stem_god, "변화에 유연하게 대응하는 해.")


def format_seun_for_prompt(seun_result: dict) -> str:
    """세운 결과를 GPT 프롬프트용 텍스트로 변환"""
    if not seun_result:
        return ""

    year = seun_result.get("year", "")
    lines = [f"[{year}년 세운 분석]"]
    lines.append(f"올해 에너지: {seun_result.get('overall', '')}")
    lines.append(f"활성화 영역: {seun_result.get('activated_domain', '')}")
    lines.append(f"천간 흐름: {seun_result.get('stem_meaning', '')}")
    lines.append(f"지지 흐름: {seun_result.get('branch_meaning', '')}")
    lines.append(f"올해 조언: {seun_result.get('advice', '')}")

    return "\n".join(lines)
