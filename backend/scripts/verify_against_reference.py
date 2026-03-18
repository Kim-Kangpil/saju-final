"""
기준 만세력 대비 현재 엔진 결과를 비교하는 간단한 검증 스크립트.

사용법 (예시):

    python -m scripts.verify_against_reference

하드코딩된 몇 개의 대표 날짜에 대해 year/month/day/hour 기둥과
대운 시작 나이/방향을 함께 출력해 눈으로 비교할 수 있도록 한다.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List

from logic.saju_core import compute_full_saju
from main import DB


def load_reference_cases() -> List[Dict[str, Any]]:
    """
    기준 만세력 표를 CSV 등으로 관리할 수 있도록 여지를 두되,
    현재는 코드 내에 몇 개의 케이스만 직접 정의한다.
    """
    return [
        {
            "name": "기본 양력 예시",
            "payload": {
                "calendar_type": "solar",
                "year": 1990,
                "month": 1,
                "day": 15,
                "hour": 10,
                "minute": 30,
                "gender": "M",
                "is_leap_month": False,
                "time_unknown": False,
            },
        },
        {
            "name": "음력 + 윤달 없음",
            "payload": {
                "calendar_type": "lunar",
                "year": 1993,
                "month": 8,
                "day": 15,
                "hour": 22,
                "minute": 0,
                "gender": "F",
                "is_leap_month": False,
                "time_unknown": False,
            },
        },
        {
            "name": "출생시간 없음 (정오 기준)",
            "payload": {
                "calendar_type": "solar",
                "year": 2000,
                "month": 5,
                "day": 5,
                "hour": None,
                "minute": None,
                "gender": "M",
                "is_leap_month": False,
                "time_unknown": True,
            },
        },
    ]


def main() -> None:
    cases = load_reference_cases()
    print("=== 사주 엔진 기준 만세력 비교 ===")
    print()
    for case in cases:
        name = case.get("name", "")
        payload = case["payload"]
        print(f"--- {name} ---")
        data = compute_full_saju(payload, DB)
        print(
            "입력:",
            payload["calendar_type"],
            payload["year"],
            payload["month"],
            payload["day"],
            payload.get("hour"),
            payload.get("minute"),
            "gender=",
            payload["gender"],
        )
        print(
            "기둥:",
            "년", data["year_pillar"],
            "월", data["month_pillar"],
            "일", data["day_pillar"],
            "시", data["hour_pillar"],
        )
        print(
            "대운: 시작나이=",
            data.get("daeun_start_age"),
            "방향=",
            data.get("daeun_direction"),
            "리스트 개수=",
            len(data.get("daeun_list") or []),
        )
        print("time_unknown =", data.get("time_unknown"))
        print()


if __name__ == "__main__":
    main()

