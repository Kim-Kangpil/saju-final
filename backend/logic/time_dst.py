"""출생 시각(벽시계)에서 서머타임을 풀어 표준시에 가깝게 맞춤. 해외 IANA 전용."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional


def unwind_dst_wall_clock_naive(naive_dt: datetime, tz_name: str) -> datetime:
    """
    naive_dt를 tz_name 지역의 '벽시계'로 해석했을 때,
    서머타임이면 그만큼을 빼 표준시 방향으로 맞춘 naive 시각을 반환.

    Asia/Seoul 은 한국 구간이 test.KST_DST_PERIODS 와 중복될 수 있으므로
    호출하지 않는 것을 권장 (여기서는 처리하지 않고 그대로 반환).
    """
    if not tz_name or not tz_name.strip():
        return naive_dt
    name = tz_name.strip()
    if name == "Asia/Seoul":
        return naive_dt

    try:
        from zoneinfo import ZoneInfo
    except ImportError:
        return naive_dt

    try:
        z = ZoneInfo(name)
    except Exception:
        return naive_dt

    aware = datetime(
        naive_dt.year,
        naive_dt.month,
        naive_dt.day,
        naive_dt.hour,
        naive_dt.minute,
        tzinfo=z,
    )
    off = aware.dst()
    if off is not None and off > timedelta(0):
        return naive_dt - off
    return naive_dt
