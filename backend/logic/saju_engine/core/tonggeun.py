#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
통근투출 계산 엔진
- 천간이 지지(지장간)에 뿌리가 있는지 계산
- 힘 있는 십성 vs 없는 십성 구분
"""

from logic.jijanggan import get_jijanggan

STEM_TO_ELEMENT = {
    "甲": "wood",
    "乙": "wood",
    "丙": "fire",
    "丁": "fire",
    "戊": "earth",
    "己": "earth",
    "庚": "metal",
    "辛": "metal",
    "壬": "water",
    "癸": "water",
}

POSITION_NAMES = {"year": "년지", "month": "월지", "day": "일지", "hour": "시지"}


def calculate_tonggeun(saju_data: dict) -> dict:
    """
    통근투출 계산

    각 천간이 4개 지지의 지장간에 뿌리가 있는지 계산.
    월지 뿌리 > 일지 뿌리 > 년지/시지 뿌리 순으로 강도 다름.

    Returns:
        {
            'year_stem': {
                'stem': '庚',
                'has_root': True,
                'root_positions': ['월지', '시지'],
                'root_count': 2,
                'strength': 'strong',  # strong/moderate/weak
                'monthly_root': True,  # 월지 뿌리 여부 (가장 중요)
                'modern_meaning': '실제로 발휘되는 능력'
            },
            ...
            'summary': {
                'strong_stems': ['庚', '壬'],  # 뿌리 있는 천간
                'weak_stems': ['乙'],  # 뿌리 없는 천간
                'day_stem_strength': 'moderate',  # 일간 통근 강도
            }
        }
    """
    pillars = _extract_pillars(saju_data)
    if not pillars:
        return {}

    stems = {
        "year": pillars.get("year", {}).get("stem", ""),
        "month": pillars.get("month", {}).get("stem", ""),
        "day": pillars.get("day", {}).get("stem", ""),
        "hour": pillars.get("hour", {}).get("stem", ""),
    }
    branches = {
        "year": pillars.get("year", {}).get("branch", ""),
        "month": pillars.get("month", {}).get("branch", ""),
        "day": pillars.get("day", {}).get("branch", ""),
        "hour": pillars.get("hour", {}).get("branch", ""),
    }

    result = {}
    strong_stems = []
    weak_stems = []

    for stem_pos, stem in stems.items():
        if not stem:
            continue

        root_positions = []
        has_monthly_root = False

        for branch_pos, branch in branches.items():
            if not branch:
                continue
            jijanggan = get_jijanggan(branch) or []
            if stem in jijanggan:
                pos_name = POSITION_NAMES.get(branch_pos, branch_pos)
                root_positions.append(pos_name)
                if branch_pos == "month":
                    has_monthly_root = True

        root_count = len(root_positions)
        has_root = root_count > 0

        if has_monthly_root or root_count >= 2:
            strength = "strong"
        elif root_count == 1:
            strength = "moderate"
        else:
            strength = "weak"

        if has_root:
            strong_stems.append(stem)
        else:
            weak_stems.append(stem)

        modern_meaning = _get_modern_meaning(stem_pos, strength, has_monthly_root)

        result[f"{stem_pos}_stem"] = {
            "stem": stem,
            "position": stem_pos,
            "has_root": has_root,
            "root_positions": root_positions,
            "root_count": root_count,
            "strength": strength,
            "monthly_root": has_monthly_root,
            "modern_meaning": modern_meaning,
        }

    day_stem_key = result.get("day_stem", {})
    day_stem_strength = day_stem_key.get("strength", "weak") if day_stem_key else "weak"

    result["summary"] = {
        "strong_stems": strong_stems,
        "weak_stems": weak_stems,
        "day_stem_strength": day_stem_strength,
    }

    return result


def _extract_pillars(saju_data: dict) -> dict:
    """saju_data에서 기둥 정보 추출"""
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


def _get_modern_meaning(position: str, strength: str, monthly_root: bool) -> str:
    """통근 강도의 현대적 의미"""
    if strength == "strong":
        if monthly_root:
            return "지금 당장 활용 가능한 핵심 능력"
        return "실제로 발휘되는 능력"
    elif strength == "moderate":
        return "조건이 맞을 때 발휘되는 능력"
    else:
        return "잠재적이지만 현실에서 약한 부분"


def format_tonggeun_for_prompt(tonggeun_result: dict) -> str:
    """통근 결과를 GPT 프롬프트용 텍스트로 변환"""
    if not tonggeun_result:
        return ""

    summary = tonggeun_result.get("summary", {})
    strong = summary.get("strong_stems", [])
    weak = summary.get("weak_stems", [])
    day_strength = summary.get("day_stem_strength", "")

    lines = ["[통근투출 분석 — 실제 쓸 수 있는 힘 판단]"]

    if strong:
        lines.append(f'실제로 힘을 쓰는 천간: {", ".join(strong)}')
    if weak:
        lines.append(f'힘이 약한 천간: {", ".join(weak)}')

    day_meaning = {
        "strong": "일간이 강하게 뿌리내림 — 자기 주도적으로 움직이는 힘이 실제로 있음",
        "moderate": "일간이 보통 수준으로 뿌리내림 — 환경에 따라 능력 발휘 달라짐",
        "weak": "일간 뿌리 약함 — 주변 도움이 있을 때 더 잘 움직이는 구조",
    }
    lines.append(f'일간 통근: {day_meaning.get(day_strength, "")}')
    lines.append("※ 뿌리 없는 천간은 글자는 있어도 실제 삶에서 힘을 못 씀")

    return "\n".join(lines)
