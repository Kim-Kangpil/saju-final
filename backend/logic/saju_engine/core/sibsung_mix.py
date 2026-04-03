# -*- coding: utf-8 -*-
"""
십성 혼잡(混雜) 판정 모듈.

정·편 쌍이 동시에 존재하거나 정만 3개 이상이면 '혼잡'으로 판정하고
effective(실질 지배 십성)를 편 쪽으로 돌린다.

사용처:
  - big5.py 의 십성 가중치 계산 전 전처리
  - saju_interpreter.py 의 패턴 추출
  - GPT 입력 컨텍스트 조립
"""
from __future__ import annotations

# ─── 쌍 정의 ─────────────────────────────────────────────────
# key: 육친 그룹명 / value: (정(正), 편(偏)) 순서 고정
PAIR_MAP: dict[str, tuple[str, str]] = {
    "비겁": ("비견", "겁재"),
    "식상": ("식신", "상관"),
    "재성": ("정재", "편재"),
    "관성": ("정관", "편관"),
    "인성": ("정인", "편인"),
}

# 역방향 조회용 — 십성명 → 그룹명
_TG_TO_GROUP: dict[str, str] = {
    tg: group
    for group, pair in PAIR_MAP.items()
    for tg in pair
}


def resolve_mixed_sibsung(ten_gods_list: list[str]) -> dict[str, dict]:
    """
    입력: 사주 8자(+지장간 선택)에서 추출된 십성 문자열 리스트
          예: ['비견', '비견', '겁재', '식신', '정재', '정관', '정인', '편인']

    출력: 그룹별 판정 결과 dict
    {
      '비겁': {
          'jeong':     'bigyeon',   # 정(正) 십성명
          'pyeon':     '겁재',      # 편(偏) 십성명
          'jeong_cnt': 2,
          'pyeon_cnt': 1,
          'effective': '겁재',      # 실질 지배 십성
          'mixed':     True,
          'total':     3,
      },
      '식상': {...},
      '재성': {...},
      '관성': {...},
      '인성': {...},
    }

    혼잡 판정 규칙 (우선순위 순):
      1. 정 + 편 동시 존재       → effective = 편,  mixed = True
      2. 정만 3개 이상           → effective = 편,  mixed = True  (정 과다 → 편 속성으로 역전)
      3. 위 해당 없음            → effective = 주도 십성,  mixed = False
         (주도 십성: 더 많은 쪽; 동수면 편을 우선)
    """
    # 1. 그룹별 카운트 집계
    counts: dict[str, dict[str, int]] = {
        group: {"jeong": 0, "pyeon": 0}
        for group in PAIR_MAP
    }
    for tg in ten_gods_list:
        group = _TG_TO_GROUP.get(tg)
        if group is None:
            continue
        jeong_name, pyeon_name = PAIR_MAP[group]
        if tg == jeong_name:
            counts[group]["jeong"] += 1
        else:
            counts[group]["pyeon"] += 1

    # 2. 그룹별 혼잡 판정
    result: dict[str, dict] = {}
    for group, (jeong_name, pyeon_name) in PAIR_MAP.items():
        jc = counts[group]["jeong"]
        pc = counts[group]["pyeon"]
        total = jc + pc

        if total == 0:
            result[group] = {
                "jeong":     jeong_name,
                "pyeon":     pyeon_name,
                "jeong_cnt": 0,
                "pyeon_cnt": 0,
                "effective": None,
                "mixed":     False,
                "total":     0,
            }
            continue

        # 혼잡 판정 규칙 적용
        mixed = False
        if jc > 0 and pc > 0:
            # 규칙 1: 정+편 동시 존재
            mixed = True
            effective = pyeon_name
        elif jc >= 3:
            # 규칙 2: 정만 3개 이상 (과다 → 편 속성)
            mixed = True
            effective = pyeon_name
        else:
            # 규칙 3: 단일 종류 — 더 많은 쪽 (동수면 편 우선)
            mixed = False
            if pc >= jc:
                effective = pyeon_name
            else:
                effective = jeong_name

        result[group] = {
            "jeong":     jeong_name,
            "pyeon":     pyeon_name,
            "jeong_cnt": jc,
            "pyeon_cnt": pc,
            "effective": effective,
            "mixed":     mixed,
            "total":     total,
        }

    return result
