#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
형파해원진 분석
- 형(刑): 마찰/긴장 구조
- 파(破): 손상/깨짐
- 해(害): 방해/손해
- 원진(怨嗔): 감정적 불편함/만나면 불편한 관계
"""

# 삼형 데이터
SAMHYEONG = {
    frozenset(["寅", "巳", "申"]): {
        "name": "인사신 삼형",
        "type": "무은지형",
        "meaning": "은혜를 모르는 구조, 배신/갈등 반복",
    },
    frozenset(["丑", "戌", "未"]): {
        "name": "축술미 삼형",
        "type": "지세지형",
        "meaning": "고집/자기주장 강함, 충돌 반복",
    },
}

# 자형 (스스로 형)
JAHYEONG = ["子", "午", "酉", "亥"]

# 파 데이터
PA = [
    ("子", "酉"),
    ("酉", "子"),
    ("丑", "辰"),
    ("辰", "丑"),
    ("寅", "亥"),
    ("亥", "寅"),
    ("卯", "午"),
    ("午", "卯"),
    ("巳", "申"),
    ("申", "巳"),
    ("未", "戌"),
    ("戌", "未"),
]

# 해 데이터
HAE = [
    ("子", "未"),
    ("未", "子"),
    ("丑", "午"),
    ("午", "丑"),
    ("寅", "巳"),
    ("巳", "寅"),
    ("卯", "辰"),
    ("辰", "卯"),
    ("申", "亥"),
    ("亥", "申"),
    ("酉", "戌"),
    ("戌", "酉"),
]

# 원진 데이터
WONJIN = [
    ("子", "未"),
    ("未", "子"),
    ("丑", "午"),
    ("午", "丑"),
    ("寅", "酉"),
    ("酉", "寅"),
    ("卯", "申"),
    ("申", "卯"),
    ("辰", "亥"),
    ("亥", "辰"),
    ("巳", "戌"),
    ("戌", "巳"),
]


def analyze_hyeong_haehae(saju_data: dict) -> dict:
    """
    형파해원진 분석

    Returns:
        {
            'hyeong': [...],  # 형 목록
            'pa': [...],      # 파 목록
            'hae': [...],     # 해 목록
            'wonjin': [...],  # 원진 목록
            'summary': '...',
        }
    """
    branches = _extract_branches(saju_data)
    if not branches:
        return {}

    result = {
        "hyeong": _find_hyeong(branches),
        "pa": _find_pa(branches),
        "hae": _find_hae(branches),
        "wonjin": _find_wonjin(branches),
    }

    result["summary"] = _build_summary(result)
    return result


def _extract_branches(saju_data: dict) -> list:
    """지지 4개 추출"""
    pillars = saju_data.get("pillars", {})
    if pillars:
        branches = []
        for pos in ["year", "month", "day", "hour"]:
            p = pillars.get(pos, {})
            b = p.get("earthly_branch", "") or p.get("jiji", {}).get("hanja", "")
            if b:
                branches.append((pos, b))
        return branches

    basic = saju_data.get("basic_info", {})
    if basic:
        branches = []
        for pos in ["year", "month", "day", "hour"]:
            val = basic.get(pos, "")
            if isinstance(val, str) and len(val) >= 2:
                branches.append((pos, val[1]))
        return branches
    return []


def _find_hyeong(branches: list) -> list:
    result = []
    branch_list = [b for _, b in branches]
    branch_set = frozenset(branch_list)

    # 삼형
    for key, data in SAMHYEONG.items():
        if key.issubset(branch_set):
            result.append(
                {
                    "type": "삼형",
                    "chars": list(key),
                    "name": data["name"],
                    "meaning": data["meaning"],
                    "modern": "반복되는 갈등/마찰 구조, 인간관계에서 긴장이 많음",
                }
            )

    # 자형
    for pos, branch in branches:
        if branch in JAHYEONG:
            result.append(
                {
                    "type": "자형",
                    "chars": [branch],
                    "name": f"{branch} 자형",
                    "meaning": "스스로 만드는 긴장, 자기 마찰",
                    "modern": "스스로 어렵게 만드는 경향, 자기 자신과의 갈등",
                }
            )

    return result


def _find_pa(branches: list) -> list:
    result = []
    branch_list = [b for _, b in branches]
    positions = {b: pos for pos, b in branches}

    checked = set()
    for i, b1 in enumerate(branch_list):
        for b2 in branch_list[i + 1 :]:
            pair = (b1, b2)
            if pair in PA and pair not in checked:
                result.append(
                    {
                        "chars": [b1, b2],
                        "positions": [positions.get(b1, ""), positions.get(b2, "")],
                        "modern": "관계/상황이 손상되는 구조, 기대했던 것이 틀어지는 패턴",
                    }
                )
                checked.add(pair)
                checked.add((b2, b1))
    return result


def _find_hae(branches: list) -> list:
    result = []
    branch_list = [b for _, b in branches]
    positions = {b: pos for pos, b in branches}

    checked = set()
    for i, b1 in enumerate(branch_list):
        for b2 in branch_list[i + 1 :]:
            pair = (b1, b2)
            if pair in HAE and pair not in checked:
                result.append(
                    {
                        "chars": [b1, b2],
                        "positions": [positions.get(b1, ""), positions.get(b2, "")],
                        "modern": "방해받는 구조, 노력해도 막히는 느낌이 반복됨",
                    }
                )
                checked.add(pair)
                checked.add((b2, b1))
    return result


def _find_wonjin(branches: list) -> list:
    result = []
    branch_list = [b for _, b in branches]
    positions = {b: pos for pos, b in branches}

    checked = set()
    for i, b1 in enumerate(branch_list):
        for b2 in branch_list[i + 1 :]:
            pair = (b1, b2)
            if pair in WONJIN and pair not in checked:
                result.append(
                    {
                        "chars": [b1, b2],
                        "positions": [positions.get(b1, ""), positions.get(b2, "")],
                        "modern": "만나면 묘하게 불편한 관계, 감정적으로 맞지 않는 구조",
                    }
                )
                checked.add(pair)
                checked.add((b2, b1))
    return result


def _build_summary(result: dict) -> str:
    parts = []
    if result.get("hyeong"):
        parts.append(f"형: {len(result['hyeong'])}건 (반복 갈등 구조)")
    if result.get("pa"):
        parts.append(f"파: {len(result['pa'])}건 (손상/틀어짐)")
    if result.get("hae"):
        parts.append(f"해: {len(result['hae'])}건 (방해 구조)")
    if result.get("wonjin"):
        parts.append(f"원진: {len(result['wonjin'])}건 (감정적 불편함)")
    return ", ".join(parts) if parts else "형파해원진 없음"


def format_hyeong_for_prompt(hyeong_result: dict) -> str:
    """형파해원진 결과를 GPT 프롬프트용 텍스트로 변환"""
    if not hyeong_result:
        return ""

    lines = ["[형파해원진 분석]"]

    for item in hyeong_result.get("hyeong", []):
        lines.append(f"형: {''.join(item['chars'])} → {item['modern']}")

    for item in hyeong_result.get("wonjin", []):
        lines.append(f"원진: {''.join(item['chars'])} → {item['modern']}")

    for item in hyeong_result.get("pa", []):
        lines.append(f"파: {''.join(item['chars'])} → {item['modern']}")

    for item in hyeong_result.get("hae", []):
        lines.append(f"해: {''.join(item['chars'])} → {item['modern']}")

    if len(lines) == 1:
        lines.append("형파해원진 없음")

    return "\n".join(lines)
