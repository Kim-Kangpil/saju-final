# ==============================================================
# 음력 → 양력 변환 모듈 (API용)
# ==============================================================

from korean_lunar_calendar import KoreanLunarCalendar


def convert_lunar_to_solar(year, month, day, is_leap_month=False):
    """
    음력 날짜를 양력 날짜로 변환

    Args:
        year (int)
        month (int)
        day (int)
        is_leap_month (bool): 윤달 여부

    Returns:
        tuple: (solar_year, solar_month, solar_day)
    """
    cal = KoreanLunarCalendar()
    cal.setLunarDate(year, month, day, is_leap_month)
    return (cal.solarYear, cal.solarMonth, cal.solarDay)
