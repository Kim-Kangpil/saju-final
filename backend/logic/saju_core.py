from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Tuple

from logic import lunar_converter, test
from logic.jijanggan import calculate_jijanggan_for_pillars
from logic.twelve_states import get_twelve_state


def to_solar_datetime(
    calendar_type: str,
    year: int,
    month: int,
    day: int,
    hour: int | None,
    minute: int | None,
    is_leap_month: bool = False,
) -> Tuple[datetime, datetime]:
  """
  입력된 연월일시를 기준으로 양력 datetime을 반환한다.
  첫 번째 값은 출생 시각(양력), 두 번째 값은 만세력 계산에 사용된 양력 기준 시각이다.
  hour/minute가 None이면 '시간 정보 없음'으로 간주하고, 내부 계산은 정오(12:00) 기준으로 수행한다.
  """
  if calendar_type not in ("solar", "lunar"):
      raise ValueError("calendar_type은 solar 또는 lunar 이어야 합니다.")

  # 시간 정보가 없을 때는 정오(12:00)를 기준으로 계산하되,
  # 이후 해석 단계에서는 시주를 필수로 사용하지 않도록 별도 플래그로 제어한다.
  h = 12 if hour is None else hour
  m = 0 if minute is None else minute

  if calendar_type == "solar":
      solar_dt = datetime(year, month, day, h, m)
      return solar_dt, solar_dt

  solar_y, solar_m, solar_d = lunar_converter.convert_lunar_to_solar(
      year, month, day, is_leap_month
  )
  solar_dt = datetime(solar_y, solar_m, solar_d, h, m)
  return solar_dt, solar_dt


def compute_full_saju(payload: Dict[str, Any], db: Any) -> Dict[str, Any]:
  """
  기존 /saju/full 엔드포인트의 핵심 로직을 모듈로 분리한 함수.

  payload 예시:
    {
      "calendar_type": "solar" | "lunar",
      "year": 1993,
      "month": 8,
      "day": 15,
      "hour": 14,
      "minute": 30,
      "gender": "M" | "F",
      "is_leap_month": False,
    }
  """
  calendar_type = payload["calendar_type"]
  year = int(payload["year"])
  month = int(payload["month"])
  day = int(payload["day"])
  # 시간 정보가 없으면 None으로 처리
  raw_hour = payload.get("hour", None)
  raw_minute = payload.get("minute", None)
  hour = None if raw_hour is None else int(raw_hour)
  minute = None if raw_minute is None else int(raw_minute)
  is_leap_month = bool(payload.get("is_leap_month") or False)

  birth_dt, solar_dt_used = to_solar_datetime(
      calendar_type, year, month, day, hour, minute, is_leap_month
  )

  # 사주 기둥 계산
  yj = test.calculate_year_pillar(solar_dt_used, db)
  mj = test.calculate_month_pillar(solar_dt_used, yj, db)
  dj = test.calculate_day_pillar(solar_dt_used)
  # 출생시간 정보가 없으면 시주는 참고용으로만 계산하고, 응답에는 포함하지 않는다.
  sj = test.calculate_hour_pillar(solar_dt_used, dj) if hour is not None else None

  # 월지 기준 계절 정보 (봄/여름/가을/겨울 + 초/중/말 정도의 뉘앙스)
  season_info: Dict[str, str] = {}
  try:
      branch = mj[1]  # 월지 한 글자 (예: '巳', '午', '酉')
      if branch in ("寅", "卯", "辰"):
          season_info = {"name": "봄", "detail": "봄 기운 (새로 시작하고 자라는 계절)"}
      elif branch in ("巳", "午", "未"):
          season_info = {"name": "여름", "detail": "여름 기운 (뜨겁고 활발한 계절)"}
      elif branch in ("申", "酉", "戌"):
          season_info = {"name": "가을", "detail": "가을 기운 (정리·수확·차분한 계절)"}
      elif branch in ("亥", "子", "丑"):
          season_info = {"name": "겨울", "detail": "겨울 기운 (차분하고 내면이 깊어지는 계절)"}
  except Exception:
      season_info = {}

  # 십이운성 (일간 기준)
  twelve_states: Dict[str, str] = {}
  try:
      hanja_map = {
          "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무",
          "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계",
          "子": "자", "丑": "축", "寅": "인", "卯": "묘", "辰": "진",
          "巳": "사", "午": "오", "未": "미", "申": "신", "酉": "유",
          "戌": "술", "亥": "해",
      }
      day_stem = hanja_map.get(dj[0], "")
      hour_branch = hanja_map.get(sj[1], "")
      day_branch = hanja_map.get(dj[1], "")
      month_branch = hanja_map.get(mj[1], "")
      year_branch = hanja_map.get(yj[1], "")

      twelve_states = {
          "hour": get_twelve_state(day_stem, hour_branch),
          "day": get_twelve_state(day_stem, day_branch),
          "month": get_twelve_state(day_stem, month_branch),
          "year": get_twelve_state(day_stem, year_branch),
      }
  except Exception:
      twelve_states = {}

  # 지장간
  jijanggan = {}
  try:
      hanja_map = {
          "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무",
          "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계",
          "子": "자", "丑": "축", "寅": "인", "卯": "묘", "辰": "진",
          "巳": "사", "午": "오", "未": "미", "申": "신", "酉": "유",
          "戌": "술", "亥": "해",
      }
      jijanggan_pillars = {
          "hour": {"jiji": hanja_map.get(sj[1], "")} if sj else None,
          "day": {"jiji": hanja_map.get(dj[1], "")},
          "month": {"jiji": hanja_map.get(mj[1], "")},
          "year": {"jiji": hanja_map.get(yj[1], "")},
      }
      # None 항목은 계산에서 제외
      jijanggan_input = {k: v for k, v in jijanggan_pillars.items() if v is not None}
      jijanggan = calculate_jijanggan_for_pillars(jijanggan_input)
  except Exception:
      jijanggan = {}

  # 대운
  daeun_start_age = None
  daeun_direction = None
  daeun_list = None
  try:
      gender = (payload.get("gender") or "").strip().upper()
      d_num, d_list, d_dir = test.calculate_daeun(birth_dt, gender, yj, mj, db)
      daeun_start_age = d_num
      daeun_direction = d_dir
      daeun_list = d_list
  except Exception:
      pass

  input_hour = "--" if hour is None else f"{hour:02d}"
  input_minute = "--" if minute is None else f"{minute:02d}"

  return {
      "input_datetime": f"{year}-{month:02d}-{day:02d} {input_hour}:{input_minute}",
      "solar_datetime_used": solar_dt_used.strftime("%Y-%m-%d %H:%M"),
      "year_pillar": yj,
      "month_pillar": mj,
      "day_pillar": dj,
      "hour_pillar": sj,
      "season": season_info,
      "twelve_states": twelve_states,
      "jijanggan": jijanggan,
      "daeun_start_age": daeun_start_age,
      "daeun_direction": daeun_direction,
      "daeun_list": daeun_list,
      "time_unknown": hour is None,
  }

