from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Literal, Optional


Element = Literal["wood", "fire", "earth", "metal", "water"]
YinYang = Literal["yin", "yang"]


@dataclass
class StemInfo:
    hanja: str
    hangul: str
    element: Element
    yin_yang: YinYang
    # 일간 기준 육친 이름 (비견/겁재/식신/상관/편재/정재/편관/정관/편인/정인)
    six_relation: Optional[str] = None


@dataclass
class BranchInfo:
    hanja: str
    hangul: str
    element: Element
    # 지장간: {한자: 비율 또는 강도 등} — 상세 구조는 후속 단계에서 확장
    hidden_stems: Dict[str, float] = field(default_factory=dict)
    # 각 지장간별 육친 (일간 기준)
    hidden_relations: Dict[str, str] = field(default_factory=dict)
    # 십이운성 (예: 장생, 제왕 등)
    twelve_state: Optional[str] = None


@dataclass
class Pillar:
    """년/월/일/시 각각의 기둥 정보."""

    stem: StemInfo
    branch: BranchInfo


@dataclass
class DaewoonPeriod:
    """대운 1주기 정보."""

    start_age: int
    start_year: int
    pillar: str  # 예: "丙戌"
    direction: Literal["순행", "역행"]


@dataclass
class SeounSnapshot:
    """특정 연도(세운) 기준 스냅샷."""

    year: int
    year_pillar: str
    # 운에서 강하게 작동하는 오행/십성 요약
    dominant_elements: List[Element] = field(default_factory=list)
    dominant_relations: List[str] = field(default_factory=list)


@dataclass
class SajuSummary:
    strength: Optional[str] = None
    strength_score: Optional[float] = None
    ten_gods_count: Dict[str, int] = field(default_factory=dict)
    patterns: List[str] = field(default_factory=list)


@dataclass
class SajuModel:
    """만세력 기반 전체 사주 모델 (원국 + 운)."""

    # 원국 기둥
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Optional[Pillar]

    # 일간 정보
    day_stem_element: Element
    day_stem_yin_yang: YinYang

    # 오행·십성 요약
    element_counts: Dict[Element, int] = field(default_factory=dict)
    ten_gods_count: Dict[str, int] = field(default_factory=dict)

    # 패턴 및 요약
    summary: SajuSummary = field(default_factory=SajuSummary)

    # 운(대운·세운)
    daewoon: List[DaewoonPeriod] = field(default_factory=list)
    seoun: Optional[SeounSnapshot] = None

