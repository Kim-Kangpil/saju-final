# -*- coding: utf-8 -*-
"""
사주 기반 Big Five (OCEAN) 성향 점수 계산기.

오행·일간·십성·신강약·합충 정보를 조합해
O(개방성) C(성실성) E(외향성) A(친화성) N(신경성) 5개 차원 점수(0~100)를 반환.
50 = 평균적 성향.
"""
from __future__ import annotations

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

# ─── 십성별 성향 조정 (등장 횟수 × 가중치) ────────────────
TEN_GOD_DELTA: dict[str, dict[str, int]] = {
    "상관": {"O": +5, "E": +3, "C": -3, "A": -4},
    "편인": {"O": +5, "E": -3},
    "정관": {"C": +5},
    "정재": {"C": +4},
    "정인": {"C": +3, "A": +4},
    "식신": {"E": +4, "A": +5, "N": -3},
    "겁재": {"E": +3, "A": -3},
    "비견": {"E": +2},
    "편관": {"A": -5, "N": +2},
    "편재": {"O": +2, "E": +2},
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

    # 3. 십성 (등장 횟수 × 가중치)
    ten_gods = saju_data.get("ten_gods") or {}
    for tg, cnt in _count_ten_gods(ten_gods).items():
        for dim, delta in TEN_GOD_DELTA.get(tg, {}).items():
            scores[dim] += delta * cnt

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
