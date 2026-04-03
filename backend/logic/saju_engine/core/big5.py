# -*- coding: utf-8 -*-
"""
사주 기반 Big Five (OCEAN) 성향 점수 계산기.

오행·일간·십성·신강약·합충 정보를 조합해
O(개방성) C(성실성) E(외향성) A(친화성) N(신경성) 5개 차원 점수(0~100)를 반환.
50 = 평균적 성향.
"""
from __future__ import annotations

from .sibsung_mix import resolve_mixed_sibsung

# ─── 일간별 기본 성향 조정 ────────────────────────────────
STEM_DELTA: dict[str, dict[str, int]] = {
    "甲": {"O": +8, "E": +8},            # 목양간 — 탐색·주도
    "乙": {"O": +6, "A": +5},            # 목음간 — 유연·친화
    "丙": {"E": +12},                     # 화양간 — 외향성 최고
    "丁": {"O": +6, "A": +8, "N": +6},   # 화음간 — 온기·예민
    "戊": {"C": +8, "N": -8},            # 토양간 — 안정·성실
    "己": {"C": +6, "A": +6},            # 토음간 — 세밀·친화
    "庚": {"C": +10, "N": -6},           # 금양간 — 원칙·절제
    "辛": {"C": +8, "A": -4},            # 금음간 — 완벽·냉정
    "壬": {"O": +8, "E": +6, "N": +4},   # 수양간 — 탐구·활동적
    "癸": {"O": +10, "E": -6, "N": +8},  # 수음간 — 깊은사유·내향·예민
}

# ─── 오행 강도별 성향 조정 (count 초과분 1 기준) ──────────
ELEMENT_DELTA: dict[str, dict[str, int]] = {
    "wood":  {"O": +3, "E": +3},
    "fire":  {"E": +4, "A": +3},
    "earth": {"C": +3, "N": -3},
    "metal": {"C": +4, "A": -2},
    "water": {"O": +4, "N": +3},
}

# ─── 십성별 성향 가중치 (쌍 단위 effective 십성 기준) ────────
# 키: O(개방성) C(성실성) E(외향성) A(친화성) N(신경성)
# 적용: effective_weight × min(total_count / 3, 1.0)
# mixed=True 인 쌍은 N +3 추가 보정
SIBSUNG_WEIGHT: dict[str, dict[str, int]] = {
    "비견": {"O": 0,  "C": 0,   "E": 4,  "A": 4,  "N": 4},
    "겁재": {"O": 0,  "C": -6,  "E": 6,  "A": -8, "N": 6},
    "식신": {"O": 6,  "C": 0,   "E": 4,  "A": 6,  "N": 0},
    "상관": {"O": 10, "C": -6,  "E": 6,  "A": 2,  "N": 4},
    "정재": {"O": 0,  "C": 10,  "E": 0,  "A": 4,  "N": -4},
    "편재": {"O": 4,  "C": 4,   "E": 4,  "A": 0,  "N": 0},
    "정관": {"O": 0,  "C": 12,  "E": 0,  "A": 6,  "N": -4},
    "편관": {"O": 0,  "C": 6,   "E": 0,  "A": -6, "N": 8},
    "정인": {"O": 6,  "C": 4,   "E": -4, "A": 6,  "N": 0},
    "편인": {"O": 10, "C": 0,   "E": -6, "A": -4, "N": 4},
}

# ─── 신강약별 조정 ────────────────────────────────────────
STRENGTH_DELTA: dict[str, dict[str, int]] = {
    "신강": {"E": +3, "A": +2, "N": -3},
    "중화": {"N": -2},
    "신약": {"N": +5, "E": -3},
}

# ─── 오행 매핑 ────────────────────────────────────────────
_ELEMENT_MAP: dict[str, str] = {
    "甲": "wood", "乙": "wood",
    "丙": "fire", "丁": "fire",
    "戊": "earth", "己": "earth",
    "庚": "metal", "辛": "metal",
    "壬": "water", "癸": "water",
    "寅": "wood", "卯": "wood",
    "巳": "fire", "午": "fire",
    "辰": "earth", "戌": "earth", "丑": "earth", "未": "earth",
    "申": "metal", "酉": "metal",
    "子": "water", "亥": "water",
}


def _count_elements(pillars: dict[str, str]) -> dict[str, int]:
    counts: dict[str, int] = {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0}
    for p in pillars.values():
        if not p:
            continue
        for ch in (p[:2] if len(p) >= 2 else p):
            elem = _ELEMENT_MAP.get(ch)
            if elem:
                counts[elem] += 1
    return counts


def _count_ten_gods(ten_gods: dict) -> dict[str, int]:
    counts: dict[str, int] = {}
    for v in ten_gods.values():
        if isinstance(v, str) and v:
            counts[v] = counts.get(v, 0) + 1
    return counts


def calculate_big5(saju_data: dict) -> dict[str, int]:
    """
    사주 데이터에서 Big Five 점수 계산.
    Returns: {"O": int, "C": int, "E": int, "A": int, "N": int}  각 0~100
    """
    scores = {"O": 50, "C": 50, "E": 50, "A": 50, "N": 50}

    # 1. 일간
    day_pillar = (saju_data.get("day_pillar") or "").strip()
    day_stem = day_pillar[0] if day_pillar else ""
    for dim, delta in STEM_DELTA.get(day_stem, {}).items():
        scores[dim] += delta

    # 2. 오행 강도 (기둥 4개, 평균 1.6개/오행 → 2개 초과분에 비례)
    pillars = {
        "year":  saju_data.get("year_pillar") or "",
        "month": saju_data.get("month_pillar") or "",
        "day":   saju_data.get("day_pillar") or "",
        "hour":  saju_data.get("hour_pillar") or "",
    }
    el_count = _count_elements(pillars)
    for elem, count in el_count.items():
        excess = count - 1  # 1개는 기본값, 초과분에만 반응
        if excess > 0:
            for dim, per_count in ELEMENT_DELTA.get(elem, {}).items():
                scores[dim] += per_count * excess

    # 3. 십성 (혼잡 판정 후 쌍별 가중치 적용)
    # _attach_mixed_sibsung_to_payload 가 먼저 실행된 경우 재계산 생략
    mixed_result = saju_data.get("mixed_sibsung") or None
    if not mixed_result:
        ten_gods = saju_data.get("ten_gods") or {}
        ten_gods_list = [v for v in ten_gods.values() if isinstance(v, str) and v]
        mixed_result = resolve_mixed_sibsung(ten_gods_list)

    for info in mixed_result.values():
        effective = info["effective"]
        total_count = info["total"]
        if not effective or total_count == 0:
            continue

        scale = min(total_count / 3, 1.0)
        for dim, w in SIBSUNG_WEIGHT.get(effective, {}).items():
            scores[dim] += w * scale

        if info["mixed"]:
            scores["N"] += 3

    # 4. 신강약
    strength_raw = saju_data.get("strength") or {}
    strength_label = (
        strength_raw.get("strength", "") if isinstance(strength_raw, dict)
        else str(strength_raw)
    )
    for dim, delta in STRENGTH_DELTA.get(strength_label, {}).items():
        scores[dim] += delta

    # 5. 합충 — 충 多 → N↑, 합 多 → N↓
    hc = saju_data.get("harmony_clash") or {}
    chung = len(hc.get("cheongan_chung", [])) + len(hc.get("jiji_chung", []))
    hap = (
        len(hc.get("cheongan_hap", []))
        + len(hc.get("jiji_yukhap", []))
        + len(hc.get("jiji_samhap", []))
    )
    scores["N"] += chung * 3 - hap * 1

    return {k: max(0, min(100, v)) for k, v in scores.items()}


# ─── 레이블 & 설명 ────────────────────────────────────────
_LABELS: dict[str, tuple[str, str]] = {
    "O": ("개방성", "상상력과 탐구심"),
    "C": ("성실성", "계획성과 꼼꼼함"),
    "E": ("외향성", "활력과 사교성"),
    "A": ("친화성", "공감과 협력"),
    "N": ("신경성", "감정의 예민함"),
}


def big5_with_labels(saju_data: dict) -> list[dict]:
    """
    Returns list of dicts (순서: O C E A N):
      {"key": "O", "name": "개방성", "desc": "...", "score": int, "level": "높음|보통|낮음"}
    """
    scores = calculate_big5(saju_data)
    result = []
    for key in ("O", "C", "E", "A", "N"):
        s = scores[key]
        level = "높음" if s >= 65 else ("낮음" if s <= 35 else "보통")
        name, desc = _LABELS[key]
        result.append({"key": key, "name": name, "desc": desc, "score": s, "level": level})
    return result
