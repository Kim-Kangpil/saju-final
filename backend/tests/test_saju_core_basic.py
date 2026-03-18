from datetime import datetime

from logic import test
from logic.saju_core import compute_full_saju
from main import DB


def _base_payload(**overrides):
    payload = {
        "calendar_type": "solar",
        "year": 1990,
        "month": 1,
        "day": 15,
        "hour": 10,
        "minute": 30,
        "gender": "M",
        "is_leap_month": False,
        "time_unknown": False,
    }
    payload.update(overrides)
    return payload


def test_compute_full_saju_basic_consistency():
    """기본 케이스: 만세력 기둥 계산이 test 모듈과 일치하는지 확인."""
    payload = _base_payload()
    data = compute_full_saju(payload, DB)

    solar_dt = datetime(
        payload["year"],
        payload["month"],
        payload["day"],
        payload["hour"],
        payload["minute"],
    )

    assert data["year_pillar"] == test.calculate_year_pillar(solar_dt, DB)
    assert data["month_pillar"] == test.calculate_month_pillar(
        solar_dt, data["year_pillar"], DB
    )
    assert data["day_pillar"] == test.calculate_day_pillar(solar_dt)
    assert data["hour_pillar"] == test.calculate_hour_pillar(
        solar_dt, data["day_pillar"]
    )


def test_compute_full_saju_time_unknown():
    """출생시간 없음: time_unknown 플래그와 시주 제거 동작 확인."""
    payload = _base_payload(hour=None, minute=None, time_unknown=True)
    data = compute_full_saju(payload, DB)

    assert data["time_unknown"] is True
    # 시간 정보가 없으므로 hour_pillar는 None이어야 한다.
    assert data["hour_pillar"] is None

