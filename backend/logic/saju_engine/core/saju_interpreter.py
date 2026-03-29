#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
규칙 기반 사주 해석 엔진 (GPT 호출 없음)

입력: saju_data — /saju/full 응답 dict
      필수 키: year_pillar, month_pillar, day_pillar, hour_pillar,
               ten_gods, strength, harmony_clash, sinsal, daeun_list
출력: 각 함수별 {patterns, language_points, raw} 딕셔너리
      language_points → GPT가 자연어 답변에 바로 녹여 쓸 핵심 문장들
"""

from datetime import date
from .ten_gods import calculate_ten_god, get_element

# ─────────────────────────────────────────────────────────────
# 일간 기본 성향 테이블
# ─────────────────────────────────────────────────────────────
ILGAN_NATURE = {
    "甲": {"keyword": "추진력·독립·성장", "core": "한 방향으로 곧게 뻗는 나무. 시작하면 끝을 보는 타입."},
    "乙": {"keyword": "유연·적응·생존", "core": "바람에 휘어도 꺾이지 않는 풀. 상황에 맞게 방향을 바꾸는 타입."},
    "丙": {"keyword": "열정·표현·존재감", "core": "태양처럼 환하게 드러내는 타입. 숨기는 게 없고 에너지가 넘침."},
    "丁": {"keyword": "집중·섬세·깊이", "core": "촛불처럼 한 곳을 깊게 비추는 타입. 겉보다 속이 더 뜨거움."},
    "戊": {"keyword": "안정·포용·묵직함", "core": "큰 산처럼 흔들리지 않는 타입. 믿음직하지만 변화에 느림."},
    "己": {"keyword": "세심·현실·관리", "core": "기름진 밭처럼 현실적이고 세심한 타입. 실용적이고 꼼꼼함."},
    "庚": {"keyword": "결단·직설·원칙", "core": "쇠처럼 단단하고 직선적인 타입. 애매함 싫어하고 자기 기준이 명확."},
    "辛": {"keyword": "감수성·날카로움·완벽", "core": "보석처럼 예민하고 정교한 타입. 상처도 잘 받고 아름다움에 민감."},
    "壬": {"keyword": "흐름·유동·통찰", "core": "강물처럼 흐르는 타입. 막히면 돌아가고 큰 그림을 본다."},
    "癸": {"keyword": "직관·감수성·축적", "core": "이슬처럼 조용하지만 스며드는 타입. 감지 능력 뛰어나고 속에 많이 담음."},
}

# 월지 계절 에너지
WOLJI_SEASON = {
    "寅": "봄이 막 시작되는 시기. 새로 시작하고 뻗어나가는 에너지.",
    "卯": "봄 한가운데. 감수성 풍부하고 표현 욕구 강한 에너지.",
    "辰": "봄이 마무리되는 전환점. 정리하고 다음을 준비하는 에너지.",
    "巳": "여름이 시작되는 시기. 열정과 집중력이 올라오는 에너지.",
    "午": "여름 한가운데. 존재감 강하고 직관적이며 빠른 에너지.",
    "未": "여름이 끝나는 환절기. 여운을 붙잡으며 내면을 돌아보는 에너지.",
    "申": "가을이 시작되는 시기. 판단력 날카롭고 실행에 집중하는 에너지.",
    "酉": "가을 한가운데. 정제되고 완성을 향해 수렴하는 에너지.",
    "戌": "가을이 마무리되는 전환점. 놓아버리고 비우는 에너지.",
    "亥": "겨울이 시작되는 시기. 잠재력 축적, 내면의 힘을 모으는 에너지.",
    "子": "겨울 한가운데. 조용하지만 깊은 통찰과 본질을 꿰뚫는 에너지.",
    "丑": "겨울이 마무리되는 전환점. 묵묵히 버티며 기반을 다지는 에너지.",
}

# 대운 십성별 시기 키워드
DAEUN_PERIOD_MEANING = {
    "비견": {"phase": "독립·경쟁", "tip": "혼자서 해내려는 욕구 강. 협력보다 직접 부딪히는 시기."},
    "겁재": {"phase": "도전·갈등", "tip": "에너지는 있지만 마찰도 따름. 무리하지 말고 핵심만."},
    "식신": {"phase": "여유·성장", "tip": "하고 싶은 게 자연스럽게 잘 풀리는 시기. 흐름 타기 좋음."},
    "상관": {"phase": "변화·표현", "tip": "기존 틀을 깨는 시기. 새로운 도전에 좋지만 충돌도 생김."},
    "편재": {"phase": "기회·투자", "tip": "돈과 기회가 움직이는 시기. 타이밍 잘 잡으면 크게 될 수 있음."},
    "정재": {"phase": "안정·축적", "tip": "꾸준히 쌓이는 시기. 급하게 움직이기보다 내실 다지기 좋음."},
    "편관": {"phase": "압박·도약", "tip": "긴장감 있는 환경에서 실력 드러나는 시기. 스트레스도 있지만 성장함."},
    "정관": {"phase": "인정·안정", "tip": "조직이나 사회에서 인정받는 시기. 원칙 지키면 빛남."},
    "편인": {"phase": "탐색·변화", "tip": "새로운 분야나 공부에 관심 가는 시기. 방향 바꾸기 좋음."},
    "정인": {"phase": "준비·회복", "tip": "실력과 내면을 쌓는 시기. 지금 심은 게 나중에 열매 맺음."},
}

# ─────────────────────────────────────────────────────────────
# 내부 헬퍼 함수
# ─────────────────────────────────────────────────────────────

def _get_ilgan(saju_data: dict) -> str:
    # 프로덕션: day_pillar = "癸未", 테스트: day_stem = "癸"
    dp = (saju_data.get("day_pillar") or saju_data.get("day_stem") or "").strip()
    return dp[0] if len(dp) >= 1 else ""


def _get_pillars(saju_data: dict) -> dict:
    return {
        "year":  (saju_data.get("year_pillar") or "").strip(),
        "month": (saju_data.get("month_pillar") or "").strip(),
        "day":   (saju_data.get("day_pillar") or "").strip(),
        "hour":  (saju_data.get("hour_pillar") or "").strip(),
    }


def _get_wolji(saju_data: dict) -> str:
    # 프로덕션: month_pillar[1], 테스트: month_branch
    mp = (saju_data.get("month_pillar") or "").strip()
    if len(mp) >= 2:
        return mp[1]
    return (saju_data.get("month_branch") or "").strip()


def _get_strength(saju_data: dict) -> str:
    """'신강' | '신약' | '중화' 반환. dict {"strength": "신약"} 또는 문자열 직접 모두 처리."""
    st = saju_data.get("strength") or {}
    if isinstance(st, dict):
        return st.get("strength") or "알 수 없음"
    s = str(st).strip()
    return s if s in ("신강", "신약", "중화") else "알 수 없음"


def _get_ten_gods(saju_data: dict) -> dict:
    """
    프로덕션: ten_gods = {"year_stem": "정인", "month_branch": "편재", ...} (값이 십성 이름)
    테스트:   ten_gods_count = {"편인": 2, "정관": 1} (키가 십성 이름, 값이 개수)
              → 키를 더미 위치로 펼쳐서 동일 인터페이스 제공
    """
    tg = saju_data.get("ten_gods")
    if tg and isinstance(tg, dict):
        # 값이 문자열이면 프로덕션 포맷
        if any(isinstance(v, str) for v in tg.values()):
            return tg
    # ten_gods_count 폴백: {"편인": 2} → {"pos_편인_0": "편인", "pos_편인_1": "편인"}
    tgc = saju_data.get("ten_gods_count") or {}
    if tgc and isinstance(tgc, dict):
        flat: dict[str, str] = {}
        for name, cnt in tgc.items():
            for i in range(int(cnt) if isinstance(cnt, (int, float)) else 1):
                flat[f"_pos_{name}_{i}"] = str(name)
        return flat
    return {}


def _get_harmony_clash(saju_data: dict) -> dict:
    return saju_data.get("harmony_clash") or {}


def _get_sinsal(saju_data: dict) -> dict:
    return saju_data.get("sinsal") or {}


def _get_daeun_list(saju_data: dict) -> list[str]:
    """
    프로덕션: ["26세 甲子(갑자)", ...]
    테스트:   [{"age": 26, "pillar": "甲子", ...}]  → 문자열로 변환
    """
    raw = saju_data.get("daeun_list") or []
    result = []
    for item in raw:
        if isinstance(item, str):
            result.append(item)
        elif isinstance(item, dict):
            age = item.get("age") or item.get("start_age") or 0
            pillar = item.get("pillar") or item.get("gapja") or ""
            result.append(f"{age}세 {pillar}")
    return result


def _count_ten_god(ten_gods: dict, *names: str) -> int:
    return sum(1 for v in ten_gods.values() if v in names)


def _positions_with(ten_gods: dict, *names: str) -> list[str]:
    return [k for k, v in ten_gods.items() if v in names]


def _has_clash_on(harmony_clash: dict, position_keyword: str) -> bool:
    """특정 위치(year/month/day/hour)에 충이 있는지 확인"""
    for item in harmony_clash.get("jiji_chung", []):
        if position_keyword in (item.get("position") or ""):
            return True
    for item in harmony_clash.get("cheongan_chung", []):
        if position_keyword in (item.get("position") or ""):
            return True
    return False


def _has_hap_on(harmony_clash: dict, position_keyword: str) -> bool:
    """특정 위치에 합이 있는지 확인"""
    all_hap = (
        harmony_clash.get("jiji_yukhap", [])
        + harmony_clash.get("jiji_samhap", [])
        + harmony_clash.get("jiji_banhap", [])
        + harmony_clash.get("cheongan_hap", [])
    )
    for item in all_hap:
        if position_keyword in (item.get("position") or "") or position_keyword in (item.get("name") or ""):
            return True
    return False


TG_KEY_MAP = {
    'year_stem':   '년간', 'year_branch':  '년지',
    'month_stem':  '월간', 'month_branch': '월지',
    'day_branch':  '일지',
    'hour_stem':   '시간', 'hour_branch':  '시지',
}


def _get_tg(ten_gods: dict, english_key: str) -> str:
    """ten_gods dict에서 영문/한글 키 둘 다 지원하는 헬퍼."""
    korean_key = TG_KEY_MAP.get(english_key, english_key)
    return ten_gods.get(korean_key, '') or ten_gods.get(english_key, '')


def _parse_daeun_entry(entry: str) -> tuple[int, str]:
    """'5세 甲子(갑자)' → (5, '甲子')"""
    try:
        parts = entry.split()
        age = int(parts[0].replace("세", ""))
        gapja = parts[1][:2] if len(parts) > 1 else ""
        return age, gapja
    except Exception:
        return 0, ""


def _get_current_daeun(saju_data: dict) -> tuple[int, str] | None:
    """오늘 기준 현재 대운 (start_age, '甲子') 반환. birth_year 없으면 None."""
    birth_year = saju_data.get("birth_year") or saju_data.get("birthYear")
    if not birth_year:
        # birthdate에서 연도 추출 시도
        bd = saju_data.get("birthdate") or saju_data.get("birthYmd") or ""
        if bd and len(str(bd)) >= 4:
            try:
                birth_year = int(str(bd)[:4])
            except Exception:
                return None
    if not birth_year:
        return None

    current_age = date.today().year - int(birth_year)
    daeun_list = _get_daeun_list(saju_data)
    if not daeun_list:
        return None

    current = None
    for entry in daeun_list:
        age, gapja = _parse_daeun_entry(entry)
        if age <= current_age:
            current = (age, gapja)
        else:
            break
    return current


# ─────────────────────────────────────────────────────────────
# 재물 해석
# ─────────────────────────────────────────────────────────────

def interpret_money(saju_data: dict) -> dict:
    """
    재물 패턴 규칙 기반 분석.
    Returns:
        patterns: 핵심 패턴 문자열 목록
        language_points: GPT가 답변에 바로 쓸 수 있는 문장들
        raw: 분석 근거 데이터
    """
    ten_gods = _get_ten_gods(saju_data)
    strength = _get_strength(saju_data)
    harmony_clash = _get_harmony_clash(saju_data)
    ilgan = _get_ilgan(saju_data)

    pyeон_jae_count = _count_ten_god(ten_gods, "편재")
    jeong_jae_count = _count_ten_god(ten_gods, "정재")
    jaeseong_total = pyeon_jae_count = pyeон_jae_count  # 별칭
    jaeseong_total = pyeон_jae_count + jeong_jae_count

    jaeseong_positions = _positions_with(ten_gods, "편재", "정재")
    is_pyeoninjae_dominant = pyeон_jae_count > jeong_jae_count

    # 일지·월지 재성 여부
    ilji_jae = ten_gods.get("day_branch") in ("편재", "정재")
    wolji_jae = ten_gods.get("month_branch") in ("편재", "정재")

    # 일지 충 여부
    ilji_chung = _has_clash_on(harmony_clash, "일")
    ilji_hap   = _has_hap_on(harmony_clash, "일")

    # 현재 대운 십성
    current_daeun = _get_current_daeun(saju_data)
    daeun_tg = None
    if current_daeun:
        _, gapja = current_daeun
        if len(gapja) >= 2:
            daeun_tg = calculate_ten_god(ilgan, gapja[0]) if ilgan else None

    patterns = []
    language_points = []

    # ── 신강약 × 재성 조합 ──
    if strength == "신강" and jaeseong_total >= 2:
        patterns.append("신강+재성多 → 재물 운용 능력 강")
        language_points.append("돈을 직접 다루고 움직이는 구조예요. 사업이나 투자형 재물 패턴.")
    elif strength == "신강" and jaeseong_total == 0:
        patterns.append("신강+재성無 → 일 자체 집중형")
        language_points.append("재물보다 일 자체에 집중하는 타입. 돈은 나중에 따라오는 구조예요.")
    elif strength == "신약" and jaeseong_total >= 2:
        patterns.append("신약+재성多 → 재물이 보이지만 버거운 구조")
        language_points.append("돈 기회가 있는데 잡기가 힘든 구조예요. 버는 만큼 나가는 패턴이 있어요.")
    elif strength == "신약" and jaeseong_total == 0:
        patterns.append("신약+재성無 → 꾸준히 모으는 스타일")
        language_points.append("크게 욕심 안 내는 대신 조금씩 꾸준히 쌓는 타입이에요.")

    # ── 편재 vs 정재 ──
    if jaeseong_total > 0:
        if is_pyeoninjae_dominant:
            patterns.append("편재 우세 → 비정기 수입·투자·사업형")
            language_points.append("한 번에 큰돈이 들어오는 구조예요. 안정적 월급보다 변동 수입이 잘 맞아요.")
        else:
            patterns.append("정재 우세 → 안정 수입·꾸준 축적형")
            language_points.append("꾸준히 차곡차곡 쌓는 타입이에요. 갑작스러운 투기보다 안정적 구조가 맞아요.")

    # ── 위치별 의미 ──
    if ilji_jae:
        patterns.append("일지 재성 → 배우자/파트너를 통한 재물 연결")
        language_points.append("파트너나 가까운 관계를 통해 재물이 연결되는 경우가 많아요.")
    if wolji_jae:
        patterns.append("월지 재성 → 직업·본업을 통한 주된 수입")
        language_points.append("본업에서 재물이 나오는 구조예요. 직업이 수입과 직결돼 있어요.")

    # ── 일지 충·합 영향 ──
    if ilji_chung:
        patterns.append("일지 충 → 재물 기반 불안정")
        language_points.append("재물 기반이 흔들리는 구조가 있어요. 한 곳에 올인보다 분산이 유리해요.")
    if ilji_hap:
        patterns.append("일지 합 → 재물 인연 연결됨")
        language_points.append("인연을 통해 재물이 들어오는 흐름이 있어요.")

    # ── 대운 반영 ──
    if daeun_tg in ("편재", "정재"):
        language_points.append(f"지금 이 시기는 재물 운이 직접적으로 열려 있는 구간이에요.")
    elif daeun_tg in ("식신", "상관"):
        language_points.append(f"지금은 직접 버는 능력이 올라오는 시기예요. 수입 늘릴 기회.")
    elif daeun_tg in ("편관", "정관"):
        language_points.append(f"지금은 조직·직업 안에서 재물이 움직이는 시기예요.")

    # 빈 문자열 제거 + 최소 1개 보장
    language_points = [p for p in language_points if p]
    if not language_points:
        language_points.append("재물 흐름이 특별히 강하거나 약하지 않은 균형 구조예요.")

    return {
        "patterns": patterns,
        "language_points": language_points,
        "raw": {
            "strength": strength,
            "jaeseong_total": jaeseong_total,
            "pyeonin_jae": pyeон_jae_count,
            "jeong_jae": jeong_jae_count,
            "jaeseong_positions": jaeseong_positions,
            "ilji_jae": ilji_jae,
            "wolji_jae": wolji_jae,
            "ilji_chung": ilji_chung,
            "current_daeun_ten_god": daeun_tg,
        },
    }


# ─────────────────────────────────────────────────────────────
# 연애 해석
# ─────────────────────────────────────────────────────────────

def interpret_love(saju_data: dict) -> dict:
    """
    연애 패턴 규칙 기반 분석.
    gender: 'male' | 'female' — saju_data.get('gender')로 판단
    """
    ten_gods = _get_ten_gods(saju_data)
    strength = _get_strength(saju_data)
    harmony_clash = _get_harmony_clash(saju_data)
    sinsal = _get_sinsal(saju_data)
    ilgan = _get_ilgan(saju_data)
    gender = (saju_data.get("gender") or "").lower()

    # 성별 기준 연인성 (남성=재성, 여성=관성)
    if "female" in gender or "여" in gender or "f" == gender:
        yeonin_names = ("편관", "정관")
        yeonin_label = "관성"
    else:
        yeonin_names = ("편재", "정재")
        yeonin_label = "재성"

    yeonin_count = _count_ten_god(ten_gods, *yeonin_names)
    yeonin_positions = _positions_with(ten_gods, *yeonin_names)

    # 일지 상태
    ilji_tg = ten_gods.get("day_branch") or ""
    ilji_chung = _has_clash_on(harmony_clash, "일")
    ilji_hap   = _has_hap_on(harmony_clash, "일")
    ilji_is_yeonin = ilji_tg in yeonin_names

    # 도화살 여부
    dohwa = sinsal.get("dohwa") or []
    has_dohwa = len(dohwa) > 0

    # 합충 요약
    total_hap = (
        len(harmony_clash.get("jiji_yukhap", []))
        + len(harmony_clash.get("cheongan_hap", []))
        + len(harmony_clash.get("jiji_samhap", []))
    )
    total_chung = (
        len(harmony_clash.get("jiji_chung", []))
        + len(harmony_clash.get("cheongan_chung", []))
    )

    # 현재 대운
    current_daeun = _get_current_daeun(saju_data)
    daeun_tg = None
    if current_daeun:
        _, gapja = current_daeun
        if ilgan and len(gapja) >= 2:
            daeun_tg = calculate_ten_god(ilgan, gapja[0])

    patterns = []
    language_points = []

    # ── 연인성 강도 ──
    if yeonin_count == 0:
        patterns.append(f"{yeonin_label} 없음 → 연인 인연이 사주에 잘 드러나지 않음")
        language_points.append("인연이 없는 게 아니에요. 다가오는 사람은 있는데 본인이 잘 안 열어요.")
    elif yeonin_count == 1:
        patterns.append(f"{yeonin_label} 1개 → 한 사람과의 깊은 인연 지향")
        language_points.append("한 명과 깊게 가는 스타일이에요. 여러 명 동시에 다루는 게 잘 안 맞아요.")
    elif yeonin_count >= 2:
        patterns.append(f"{yeonin_label} {yeonin_count}개 → 이성 인연 많음·감정 복잡")
        language_points.append("이성의 관심을 많이 받는 타입이에요. 근데 선택이 어렵고 감정 정리가 힘들 수 있어요.")

    # ── 일지 상태 ──
    if ilji_is_yeonin:
        patterns.append("일지 연인성 → 배우자·파트너 운 강")
        language_points.append("파트너 복이 있는 구조예요. 함께 하는 사람이 삶에서 중요한 역할을 해요.")
    if ilji_chung:
        patterns.append("일지 충 → 관계 안정감 흔들림")
        language_points.append("만나도 시간이 지나면 '이 사람이 맞나?' 하는 의심이 올라오는 구조예요. 관계가 깊어지기 직전에 멈추는 경우 있음.")
    if ilji_hap:
        patterns.append("일지 합 → 인연이 가까운 곳에서 생김")
        language_points.append("이미 알던 사람 중에서 인연이 생기는 흐름이에요. 새로운 사람보다 기존 관계에서 가능성 있음.")

    # ── 도화살 ──
    if has_dohwa:
        patterns.append("도화살 있음 → 매력 발산·이성 관심")
        language_points.append("자연스럽게 이성의 시선을 끄는 매력이 있어요.")

    # ── 신강약 영향 ──
    if strength == "신강":
        patterns.append("신강 → 독립성 강, 관계에서 자기 공간 중요")
        language_points.append("독립성이 강해서 관계에서도 자기 영역이 필요해요. 너무 의존하는 상대는 답답함.")
    elif strength == "신약":
        patterns.append("신약 → 관계 의존성, 지지 필요")
        language_points.append("혼자보다 함께일 때 더 잘 되는 타입이에요. 지지해주는 파트너가 큰 힘이 됨.")

    # ── 대운 반영 ──
    if daeun_tg in yeonin_names:
        language_points.append("지금 이 시기는 인연 운이 직접 들어오는 구간이에요.")
    elif daeun_tg in ("식신", "상관"):
        language_points.append("지금은 새로운 만남보다 본인의 매력을 키우는 시기예요.")

    # 빈 문자열 제거 + 최소 1개 보장
    language_points = [p for p in language_points if p]
    if not language_points:
        language_points.append("인연 패턴이 뚜렷하게 두드러지지 않는 균형 구조예요. 관계에서 자기 페이스를 유지하는 편이에요.")

    return {
        "patterns": patterns,
        "language_points": language_points,
        "raw": {
            "yeonin_count": yeonin_count,
            "yeonin_positions": yeonin_positions,
            "yeonin_label": yeonin_label,
            "ilji_tg": ilji_tg,
            "ilji_chung": ilji_chung,
            "ilji_hap": ilji_hap,
            "has_dohwa": has_dohwa,
            "strength": strength,
            "current_daeun_ten_god": daeun_tg,
        },
    }


# ─────────────────────────────────────────────────────────────
# 직업 해석
# ─────────────────────────────────────────────────────────────

def interpret_career(saju_data: dict) -> dict:
    ten_gods = _get_ten_gods(saju_data)
    strength = _get_strength(saju_data)
    sinsal = _get_sinsal(saju_data)
    ilgan = _get_ilgan(saju_data)

    # 십성 분포 카운트
    siksang  = _count_ten_god(ten_gods, "식신", "상관")
    jaeseong = _count_ten_god(ten_gods, "편재", "정재")
    gwanseong = _count_ten_god(ten_gods, "편관", "정관")
    inseong  = _count_ten_god(ten_gods, "편인", "정인")
    bigap    = _count_ten_god(ten_gods, "비견", "겁재")

    # 최다 십성군
    counts = {
        "식상": siksang,
        "재성": jaeseong,
        "관성": gwanseong,
        "인성": inseong,
        "비겁": bigap,
    }
    dominant = max(counts, key=counts.get)
    dominant_count = counts[dominant]

    # 신살
    has_yeokma = len(sinsal.get("yeokma") or []) > 0
    has_hwagae = len(sinsal.get("hwagae") or []) > 0
    has_munchang = len(sinsal.get("munchang_gwiin") or []) > 0

    # 현재 대운
    current_daeun = _get_current_daeun(saju_data)
    daeun_tg = None
    if current_daeun:
        _, gapja = current_daeun
        if ilgan and len(gapja) >= 2:
            daeun_tg = calculate_ten_god(ilgan, gapja[0])

    patterns = []
    language_points = []

    # ── 십성 분포 → 직업 적성 ──
    aptitude_map = {
        "식상": ("창작·기술·교육·서비스", "내가 직접 만들고 표현하는 일이 잘 맞아요. 기술직, 창작업, 교육, 서비스 계통."),
        "재성": ("비즈니스·영업·금융·무역", "돈이 움직이는 구조에서 잘 해요. 영업, 사업, 금융, 거래 계통."),
        "관성": ("조직·공직·관리·법률", "체계 있는 조직에서 실력 발휘돼요. 공직, 관리직, 법률, 제도권."),
        "인성": ("학문·연구·상담·의료", "깊이 파고들고 전달하는 일이 맞아요. 연구, 상담, 교육, 의료."),
        "비겁": ("독립·경쟁·스포츠·전문직", "남 밑에서 일하는 것보다 독립이나 전문성으로 승부하는 게 맞아요."),
    }
    if dominant_count > 0:
        area, desc = aptitude_map[dominant]
        patterns.append(f"{dominant} 우세({dominant_count}개) → {area}")
        language_points.append(desc)

    # ── 신강약 × 관성 ──
    if strength == "신강" and gwanseong == 0:
        patterns.append("신강+관성無 → 독립 사업·프리랜서 유리")
        language_points.append("조직보다 독립해서 하는 일이 더 잘 맞아요. 위계나 규제가 답답하게 느껴질 수 있음.")
    elif strength == "신약" and gwanseong >= 2:
        patterns.append("신약+관성多 → 조직 스트레스 주의")
        language_points.append("조직 안에서 압박을 많이 느낄 수 있어요. 수직적 환경보다 수평적 환경이 맞아요.")

    # ── 신살 ──
    if has_yeokma:
        patterns.append("역마살 → 이동·변화 많은 직업")
        language_points.append("한 곳에 고정되는 일보다 움직임이 있는 직업이 잘 맞아요. 영업, 여행, 무역, 출장 계통.")
    if has_hwagae:
        patterns.append("화개살 → 예술·종교·철학 분야")
        language_points.append("정신적이거나 예술적인 분야에서 두각을 나타낼 수 있어요.")
    if has_munchang:
        patterns.append("문창귀인 → 글·학문·표현 능력")
        language_points.append("글 쓰고 표현하는 능력이 강해요. 글쓰기, 강의, 컨텐츠 계통에서 유리.")

    # ── 대운 반영 ──
    if daeun_tg in ("편관", "정관"):
        language_points.append("지금은 조직이나 직업에서 인정받는 시기예요.")
    elif daeun_tg in ("식신", "상관"):
        language_points.append("지금은 새로운 기술이나 표현 능력을 키우기 좋은 시기예요.")
    elif daeun_tg in ("편재", "정재"):
        language_points.append("지금은 직접 수익 만드는 활동이 잘 풀리는 시기예요.")

    # 빈 문자열 제거 + 최소 1개 보장
    language_points = [p for p in language_points if p]
    if not language_points:
        language_points.append("직업 적성이 고르게 분포된 사주예요. 특정 분야에 치우치지 않고 다양한 방면에서 역량을 발휘할 수 있어요.")

    return {
        "patterns": patterns,
        "language_points": language_points,
        "raw": {
            "strength": strength,
            "dominant_ten_god_group": dominant,
            "ten_god_counts": counts,
            "has_yeokma": has_yeokma,
            "has_hwagae": has_hwagae,
            "current_daeun_ten_god": daeun_tg,
        },
    }


# ─────────────────────────────────────────────────────────────
# 성격 해석
# ─────────────────────────────────────────────────────────────

def interpret_personality(saju_data: dict) -> dict:
    ilgan = _get_ilgan(saju_data)
    wolji = _get_wolji(saju_data)
    pillars = _get_pillars(saju_data)
    ten_gods = _get_ten_gods(saju_data)
    strength = _get_strength(saju_data)

    bigap_count   = _count_ten_god(ten_gods, "비견", "겁재")
    inseong_count = _count_ten_god(ten_gods, "편인", "정인")
    siksang_count = _count_ten_god(ten_gods, "식신", "상관")
    gwanseong_count = _count_ten_god(ten_gods, "편관", "정관")

    ilgan_nature = ILGAN_NATURE.get(ilgan, {"keyword": "알 수 없음", "core": ""})
    wolji_season = WOLJI_SEASON.get(wolji, "")

    patterns = []
    language_points = []

    # ── 일간 기본 성향 ──
    patterns.append(f"일간 {ilgan} → {ilgan_nature['keyword']}")
    if ilgan_nature["core"]:
        language_points.append(ilgan_nature["core"])
    
    # ── 십이운성 (일간 생명력) ──
    ilji_branch = pillars.get("day", "")[1] if len(pillars.get("day", "")) >= 2 else ""
    if ilgan and ilji_branch:
        try:
            from .sibiun import calculate_sibiun
            sibiun_result = calculate_sibiun(ilgan, ilji_branch)
            phase = sibiun_result.get("phase", "")
            vitality = sibiun_result.get("vitality", 0)
            sibiun_name = sibiun_result.get("sibiun", "")
            
            if sibiun_name:
                patterns.append(f"일간 십이운성: {sibiun_name}({vitality}점) — {phase}")
            
            if phase == "왕성기" and vitality >= 75:
                language_points.append("에너지가 외부로 강하게 표출되는 사주예요. 리더십이나 주도성이 강해요.")
            elif phase == "쇠퇴기":
                language_points.append("에너지가 내부로 수렴하는 사주예요. 겉보다 속이 단단하고 준비하는 타입.")
            elif phase == "준비기" and vitality >= 50:
                language_points.append("지금은 준비 단계예요. 축적하고 기반 다지는 시기로 보면 좋아요.")
        except Exception:
            pass

    # ── 월지 에너지 ──
    if wolji_season:
        patterns.append(f"월지 {wolji} → 계절 에너지 보정")
        language_points.append(f"태어난 계절 에너지: {wolji_season}")

    # ── 비겁 多 = 독립심·경쟁심 ──
    if bigap_count >= 3:
        patterns.append(f"비겁 {bigap_count}개 → 강한 독립성·경쟁심")
        language_points.append("내 방식대로 하려는 성향이 강해요. 협력보다 독립이 자연스럽고, 지고 싶지 않은 마음이 있어요.")
    elif bigap_count >= 2:
        patterns.append(f"비겁 {bigap_count}개 → 자기주장 있음")
        language_points.append("자기 의견이 뚜렷해요. 양보하기 힘들 때가 있지만 그게 추진력이 되기도 해요.")

    # ── 인성 多 = 생각 깊음·보수적 ──
    if inseong_count >= 3:
        patterns.append(f"인성 {inseong_count}개 → 신중·내향·학습 지향")
        language_points.append("겉으로 조용해 보여도 속에 생각이 많아요. 빠른 결정보다 충분히 생각하고 움직이는 스타일.")
    elif inseong_count >= 2:
        patterns.append(f"인성 {inseong_count}개 → 사려 깊음")
        language_points.append("충동적이기보다 생각하고 행동하는 타입이에요.")

    # ── 식상 多 = 표현력·감수성 ──
    if siksang_count >= 2:
        patterns.append(f"식상 {siksang_count}개 → 표현력·감수성 강")
        language_points.append("하고 싶은 말, 하고 싶은 것이 많아요. 표현하는 것에서 에너지 찾는 타입.")

    # ── 관성 多 = 책임감·압박 ──
    if gwanseong_count >= 2:
        patterns.append(f"관성 {gwanseong_count}개 → 책임감·완벽주의 성향")
        language_points.append("책임감이 강해요. 기대에 부응하려는 마음이 크고, 그게 스트레스가 될 때도 있어요.")

    # ── 신강약 기질 ──
    if strength == "신강":
        patterns.append("신강 → 에너지 넘침·자기주도적")
        language_points.append("에너지가 넘치고 자기 뜻대로 이끌어가려는 성향이 있어요.")
    elif strength == "신약":
        patterns.append("신약 → 감수성 예민·환경 영향 큼")
        language_points.append("주변 분위기를 잘 읽어요. 좋은 환경에선 빛나고 나쁜 환경엔 쉽게 영향 받아요.")

    # 빈 문자열 제거 + 최소 1개 보장
    language_points = [p for p in language_points if p]
    if not language_points:
        keyword = ilgan_nature.get("keyword") or "다양한 기질"
        language_points.append(f"{keyword} 기질을 가진 사주예요. 일간과 월지의 조합이 독특한 성격을 만들어요.")

    return {
        "patterns": patterns,
        "language_points": language_points,
        "raw": {
            "ilgan": ilgan,
            "wolji": wolji,
            "ilgan_nature": ilgan_nature,
            "strength": strength,
            "bigap_count": bigap_count,
            "inseong_count": inseong_count,
            "siksang_count": siksang_count,
        },
    }


# ─────────────────────────────────────────────────────────────
# 현재 시기 해석
# ─────────────────────────────────────────────────────────────

def interpret_current_period(saju_data: dict) -> dict:
    ilgan = _get_ilgan(saju_data)
    daeun_list = _get_daeun_list(saju_data)
    daeun_direction = saju_data.get("daeun_direction") or "순행"

    current_daeun = _get_current_daeun(saju_data)

    patterns = []
    language_points = []

    if not daeun_list:
        return {
            "patterns": [],
            "language_points": ["대운 데이터가 없어서 현재 시기 분석이 어려워요."],
            "raw": {},
        }

    if current_daeun:
        age, gapja = current_daeun
        patterns.append(f"현재 대운: 만 {age}세 시작 {gapja}")

        daeun_tg = None
        daeun_stem_tg = None
        daeun_branch_tg = None
        if ilgan and len(gapja) >= 2:
            daeun_stem_tg   = calculate_ten_god(ilgan, gapja[0])
            daeun_branch_tg = calculate_ten_god(ilgan, gapja[1])
            # 천간 십성 기준으로 시기 성격 판단
            daeun_tg = daeun_stem_tg

        if daeun_tg and daeun_tg in DAEUN_PERIOD_MEANING:
            meaning = DAEUN_PERIOD_MEANING[daeun_tg]
            patterns.append(f"대운 천간 십성: {daeun_tg} → {meaning['phase']}")
            language_points.append(meaning["tip"])
        if daeun_branch_tg and daeun_branch_tg in DAEUN_PERIOD_MEANING:
            meaning = DAEUN_PERIOD_MEANING[daeun_branch_tg]
            patterns.append(f"대운 지지 십성: {daeun_branch_tg} → {meaning['phase']}")

        # 대운 방향
        if daeun_direction == "역행":
            language_points.append("대운이 역행이에요. 남들보다 빠르게 경험이 쌓이는 구조인 경우 많아요.")

    else:
        # 생년 정보 없어도 대운 목록은 전달
        language_points.append("생년 정보로 현재 대운을 정확히 특정하기 어렵지만, 대운 흐름은 아래와 같아요.")
        patterns.append(f"전체 대운 흐름 ({daeun_direction}): {', '.join(daeun_list[:5])}")

    # 빈 문자열 제거
    language_points = [p for p in language_points if p]
    if not language_points:
        language_points.append("현재 시기는 꾸준히 자기 자리를 지키며 흐름을 타는 구간이에요.")

    return {
        "patterns": patterns,
        "language_points": language_points,
        "raw": {
            "current_daeun": current_daeun,
            "daeun_direction": daeun_direction,
            "daeun_list": daeun_list,
        },
    }


def interpret_money_deep(saju_data: dict) -> dict:
    """
    재물 심화 해석 — 순수 구조 데이터 반환 (pre-written 텍스트 없음).
    데이터가 부족하면 {} 반환.
    """
    ilgan = _get_ilgan(saju_data)
    pillars = _get_pillars(saju_data)
    if not ilgan or not pillars.get("day"):
        return {}

    ten_gods = _get_ten_gods(saju_data)
    raw_strength = saju_data.get("strength") or {}
    harmony_clash = _get_harmony_clash(saju_data)
    sinsal = _get_sinsal(saju_data)

    # 재성 오행 계산 (일간 기준)
    ILGAN_JAESEONG = {
        "甲": "화", "乙": "화", "丙": "토", "丁": "토",
        "戊": "수", "己": "수", "庚": "목", "辛": "목",
        "壬": "화", "癸": "화",
    }
    jaeseong_element = ILGAN_JAESEONG.get(ilgan, "")

    ELEMENT_STEMS = {
        "목": ["甲", "乙"], "화": ["丙", "丁"],
        "토": ["戊", "己"], "금": ["庚", "辛"],
        "수": ["壬", "癸"],
    }
    ELEMENT_BRANCHES = {
        "목": ["寅", "卯"], "화": ["巳", "午"],
        "토": ["辰", "戌", "丑", "未"], "금": ["申", "酉"],
        "수": ["子", "亥"],
    }

    jaeseong_stems = ELEMENT_STEMS.get(jaeseong_element, [])
    jaeseong_branches = ELEMENT_BRANCHES.get(jaeseong_element, [])

    # 재성 위치 찾기 — pillars는 "甲申" 형태 문자열
    POSITION_MAP = [
        ("year_stem",    "년간"),
        ("year_branch",  "년지"),
        ("month_stem",   "월간"),
        ("month_branch", "월지"),
        ("day_branch",   "일지"),
        ("hour_stem",    "시간"),
        ("hour_branch",  "시지"),
    ]
    jaeseong_positions = []
    for pos_key, label in POSITION_MAP:
        pillar_key = pos_key.replace("_stem", "").replace("_branch", "")
        p = pillars.get(pillar_key, "")
        char = p[0] if "_stem" in pos_key and len(p) >= 1 else (p[1] if len(p) >= 2 else "")
        if char and (char in jaeseong_stems or char in jaeseong_branches):
            ten_god = ten_gods.get(label, "")
            jaeseong_positions.append({"position": label, "char": char, "ten_god": ten_god})

    jaeseong_absent = len(jaeseong_positions) == 0

    # 통근 계산 (재성 천간 위치만)
    jaeseong_tonggeun: dict = {}
    try:
        from logic.saju_engine.core.tonggeun import calculate_tonggeun
        tonggeun_result = calculate_tonggeun(saju_data) or {}
        LABEL_TO_TONG_KEY = {"년간": "year_stem", "월간": "month_stem", "시간": "hour_stem"}
        for jp in jaeseong_positions:
            tong_key = LABEL_TO_TONG_KEY.get(jp["position"], "")
            if tong_key:
                jaeseong_tonggeun[jp["position"]] = bool(
                    tonggeun_result.get(tong_key, {}).get("has_root", False)
                )
    except Exception:
        pass

    # 비겁 / 식상 개수
    bigeop_count = _count_ten_god(ten_gods, "비견", "겁재")
    siksang_count = _count_ten_god(ten_gods, "식신", "상관")
    siksang_saengjae = siksang_count > 0 and not jaeseong_absent

    # 재성 없을 때 대안 수입 구조 분석
    alt_income: list = []
    if jaeseong_absent:
        if siksang_count >= 2:
            alt_income.append({
                "type": "식상형",
                "meaning": "재능과 표현력이 수입으로 연결되는 구조",
                "chars": [k for k, v in ten_gods.items() if v in ("식신", "상관")],
            })
        gwan_count_alt = _count_ten_god(ten_gods, "정관", "편관")
        if gwan_count_alt >= 1:
            alt_income.append({
                "type": "관성형",
                "meaning": "직장/조직에서 안정적 수입이 오는 구조",
                "chars": [k for k, v in ten_gods.items() if v in ("정관", "편관")],
            })
        in_count_alt = _count_ten_god(ten_gods, "정인", "편인")
        if in_count_alt >= 2:
            alt_income.append({
                "type": "인성형",
                "meaning": "지식/자격/학문을 통해 수입이 생기는 구조",
                "chars": [k for k, v in ten_gods.items() if v in ("정인", "편인")],
            })

    # 신강약 + 점수
    if isinstance(raw_strength, dict):
        strength_value = raw_strength.get("strength", "알 수 없음")
        strength_score = int(raw_strength.get("total_score", 0) or 0)
    else:
        strength_value = str(raw_strength or "알 수 없음")
        strength_score = 0
    can_handle_money = strength_value in ("신강", "중화") or strength_score >= 50

    # 재성 십이운성 (봉법 + 좌법)
    jaeseong_sibiun: list = []
    try:
        from .sibiun import analyze_bongbeop, analyze_jwabeop
        bong = analyze_bongbeop(saju_data)
        jwa = analyze_jwabeop(saju_data)
        
        for jp in jaeseong_positions:
            pos = jp["position"]
            char = jp["char"]
            
            # 천간 위치면 봉법, 지지 위치면 좌법에서 해당 지장간 찾기
            if pos in ["년간", "월간", "시간"]:
                sibiun_data = bong.get(pos, {})
                if sibiun_data:
                    jaeseong_sibiun.append({
                        "position": pos,
                        "char": char,
                        "sibiun": sibiun_data.get("sibiun", ""),
                        "vitality": sibiun_data.get("vitality", 0),
                        "meaning": "재성이 강하게 작동" if sibiun_data.get("vitality", 0) >= 70 else "재성이 약함",
                    })
            else:
                # 지지 위치: 좌법에서 해당 지장간 찾기
                jwa_data = jwa.get(pos, {})
                if jwa_data:
                    for jj in jwa_data.get("jijanggan", []):
                        if jj.get("stem") == char:
                            jaeseong_sibiun.append({
                                "position": pos,
                                "char": char,
                                "sibiun": jj.get("sibiun", ""),
                                "vitality": jj.get("vitality", 0),
                                "meaning": "재성이 강하게 작동" if jj.get("vitality", 0) >= 70 else "재성이 약함",
                            })
                            break
    except Exception:
        pass

    # 재성 합충 영향
    jaeseong_hap: list = []
    jaeseong_chung: list = []
    try:
        jae_chars = {jp["char"] for jp in jaeseong_positions}
        for item in harmony_clash.get("jiji_yukhap", []):
            desc = item.get("description", "") if isinstance(item, dict) else str(item)
            if any(c in desc for c in jae_chars):
                jaeseong_hap.append(desc)
        for item in harmony_clash.get("jiji_chung", []):
            desc = item.get("description", "") if isinstance(item, dict) else str(item)
            if any(c in desc for c in jae_chars):
                jaeseong_chung.append(desc)
    except Exception:
        pass

    # 대운 — _get_current_daeun 반환값은 (age: int, gapja: str) 튜플
    current = _get_current_daeun(saju_data)
    daeun_ten_god = ""
    daeun_stem_tg = ""
    daeun_branch_tg = ""
    daeun_pillar = ""
    daeun_favorable = None
    daeun_effect = ""
    if current:
        _, daeun_pillar = current
        if daeun_pillar and len(daeun_pillar) >= 2:
            daeun_stem_tg = calculate_ten_god(ilgan, daeun_pillar[0])
            daeun_branch_tg = calculate_ten_god(ilgan, daeun_pillar[1])
            daeun_ten_god = daeun_stem_tg
        elif daeun_pillar and len(daeun_pillar) >= 1:
            daeun_stem_tg = calculate_ten_god(ilgan, daeun_pillar[0])
            daeun_ten_god = daeun_stem_tg
        FAVORABLE = ("편재", "정재", "식신", "상관")
        UNFAVORABLE = ("편인", "정인", "비견", "겁재")
        is_favorable = daeun_stem_tg in FAVORABLE or daeun_branch_tg in FAVORABLE
        is_unfavorable = daeun_stem_tg in UNFAVORABLE and daeun_branch_tg in UNFAVORABLE
        parts = list(dict.fromkeys(g for g in (daeun_stem_tg, daeun_branch_tg) if g))
        label = "·".join(parts)
        if is_favorable:
            daeun_favorable = True
            daeun_effect = f"{label} 대운 = 재물 활성화 구간"
        elif is_unfavorable:
            daeun_favorable = False
            daeun_effect = f"{label} 대운 = 재물 정체 구간"
        else:
            daeun_favorable = None
            daeun_effect = f"{label} 대운 = 중립"

    # 세운
    seun_stem_god = ""
    seun_branch_god = ""
    seun_favorable = None
    seun_effect = ""
    try:
        from logic.saju_engine.core.seun import analyze_seun
        seun_result = analyze_seun(saju_data) or {}
        seun_stem_god = seun_result.get("stem_ten_god", "")
        seun_branch_god = seun_result.get("branch_ten_god", "")
        SEUN_FAVORABLE = ("편재", "정재", "식신", "상관")
        seun_favorable = seun_stem_god in SEUN_FAVORABLE or seun_branch_god in SEUN_FAVORABLE
        seun_effect = f"{seun_stem_god}/{seun_branch_god} 세운"
    except Exception:
        pass

    # 용신
    yongshin = saju_data.get("yongshin") or {}
    yongshin_elements = yongshin.get("final_yongshin") or []
    gishin_elements = yongshin.get("gishin") or []

    # 재물 관련 신살 (analyze_sinsal 실제 키 사용)
    money_sinsal: list = []
    if sinsal.get("munchang_gwiin"):
        money_sinsal.append({"type": "문창귀인", "meaning": "글/지식/콘텐츠로 수익 내는 구조"})
    if sinsal.get("wolgong"):
        money_sinsal.append({"type": "월공", "meaning": "재물이 들어와도 허무하게 나가는 패턴"})
    if sinsal.get("yeokma"):
        money_sinsal.append({"type": "역마살", "meaning": "움직일수록 돈이 생기는 구조"})

    # 근묘화실 재성 인생 단계
    STAGE_LABEL = {"year": "초년", "month": "청년기", "day": "중장년기", "hour": "말년"}
    geunmyo_money_stages: list = []
    try:
        from logic.saju_engine.core.geunmyo import analyze_geunmyo
        geunmyo = analyze_geunmyo(saju_data) or {}
        for pos in ("year", "month", "day", "hour"):
            item = geunmyo.get(pos, {})
            if item.get("stem_ten_god") in ("편재", "정재") or item.get("branch_ten_god") in ("편재", "정재"):
                geunmyo_money_stages.append(STAGE_LABEL.get(pos, pos))
    except Exception:
        pass

    return {
        "ilgan": ilgan,
        "jaeseong_element": jaeseong_element,
        "jaeseong_absent": jaeseong_absent,
        "jaeseong_positions": jaeseong_positions,
        "jaeseong_tonggeun": jaeseong_tonggeun,
        "jaeseong_hap": jaeseong_hap,
        "jaeseong_chung": jaeseong_chung,
        "bigeop_count": bigeop_count,
        "bigeop_controls_money": bigeop_count >= 2,
        "siksang_count": siksang_count,
        "siksang_saengjae": siksang_saengjae,
        "alt_income": alt_income,
        "strength": strength_value,
        "strength_score": strength_score,
        "can_handle_money": can_handle_money,
        "current_daeun_pillar": daeun_pillar,
        "daeun_ten_god": daeun_ten_god,
        "daeun_stem_tg": daeun_stem_tg,
        "daeun_branch_tg": daeun_branch_tg,
        "daeun_favorable": daeun_favorable,
        "daeun_effect": daeun_effect,
        "seun_stem_god": seun_stem_god,
        "seun_branch_god": seun_branch_god,
        "seun_favorable": seun_favorable,
        "seun_effect": seun_effect,
        "yongshin_elements": yongshin_elements,
        "gishin_elements": gishin_elements,
        "money_sinsal": money_sinsal,
        "geunmyo_money_stages": geunmyo_money_stages,
        "jaeseong_sibiun": jaeseong_sibiun,
    }


def interpret_love_deep(saju_data: dict) -> dict:
    """
    연애 심화 해석 — 구조화된 사실 데이터 반환.
    데이터가 부족하면 {} 반환.
    """
    ilgan = _get_ilgan(saju_data)
    pillars = _get_pillars(saju_data)
    if not ilgan or not pillars.get("day"):
        return {}

    from logic.saju_engine.core.tonggeun import calculate_tonggeun
    from logic.saju_engine.core.geunmyo import analyze_geunmyo
    from logic.saju_engine.core.seun import analyze_seun

    ten_gods = _get_ten_gods(saju_data)
    harmony_clash = _get_harmony_clash(saju_data)
    sinsal = _get_sinsal(saju_data)
    gender = (saju_data.get("gender") or "").lower()

    tong = calculate_tonggeun(saju_data) or {}
    geunmyo = analyze_geunmyo(saju_data) or {}
    seun = analyze_seun(saju_data) or {}
    yongshin = saju_data.get("yongshin") or {}

    yeonin_names = ("편관", "정관") if ("female" in gender or "여" in gender or gender == "f") else ("편재", "정재")
    partner_positions = _positions_with(ten_gods, *yeonin_names)
    day_branch_tg = _get_tg(ten_gods, "day_branch")
    ilji_chung = _has_clash_on(harmony_clash, "일")
    ilji_hap = _has_hap_on(harmony_clash, "일")

    partner_root_stems = []
    for pos in ("year", "month", "day", "hour"):
        p = pillars.get(pos, "")
        if len(p) < 1:
            continue
        stem = p[0]
        tg = calculate_ten_god(ilgan, stem)
        if tg in yeonin_names and tong.get(f"{pos}_stem", {}).get("has_root"):
            partner_root_stems.append(pos)

    # 근묘화실 연인성 인생 단계
    STAGE_LABEL = {"year": "초년", "month": "청년기", "day": "중장년기", "hour": "말년"}
    yeonin_life_stages = []
    for pos in ("year", "month", "day", "hour"):
        item = geunmyo.get(pos, {})
        if item.get("stem_ten_god") in yeonin_names or item.get("branch_ten_god") in yeonin_names:
            yeonin_life_stages.append(STAGE_LABEL.get(pos, pos))

    dohwa = sinsal.get("dohwa") or []
    hongyeom: list = []  # 홍염살 — analyze_sinsal 미구현, 항상 0

    current = _get_current_daeun(saju_data)
    daeun_tg = ""
    daeun_branch_tg = ""
    if current:
        _, gapja = current
        if len(gapja) >= 2:
            daeun_tg = calculate_ten_god(ilgan, gapja[0])
            daeun_branch_tg = calculate_ten_god(ilgan, gapja[1])
        elif len(gapja) >= 1:
            daeun_tg = calculate_ten_god(ilgan, gapja[0])
    love_active_now = (
        daeun_tg in yeonin_names or daeun_tg in ("식신", "상관")
        or daeun_branch_tg in yeonin_names or daeun_branch_tg in ("식신", "상관")
    )

    seun_stem_tg = seun.get("stem_ten_god") or ""
    seun_branch_tg = seun.get("branch_ten_god") or ""
    seun_favorable = (
        seun_stem_tg in yeonin_names or seun_branch_tg in yeonin_names
        or seun_stem_tg in ("식신", "상관") or seun_branch_tg in ("식신", "상관")
    )

    pattern = "관계가 시작되면 깊게 가지만 속도 차이에서 흔들릴 수 있는 패턴"
    if ilji_chung:
        pattern = "초반은 빠른데 가까워질수록 확신이 흔들리는 패턴이 반복"
    elif ilji_hap:
        pattern = "새로운 만남보다 이미 알던 인연에서 관계가 깊어지는 패턴"

    partner_type = "감정 기복이 적고 약속을 지키는 안정형 상대"
    if day_branch_tg in ("편관", "정관"):
        partner_type = "책임감 있고 기준이 분명한 상대"
    elif day_branch_tg in ("편재", "정재"):
        partner_type = "현실 감각이 좋고 생활 리듬이 맞는 상대"

    current_flow = "마음 정리와 기준 점검이 먼저 필요한 흐름"
    if love_active_now:
        current_flow = "연애 신호가 분명한 시기 — 만남을 행동으로 옮기기 좋은 구간"

    seun_love = "관계 흐름이 천천히 정리되는 해"
    if seun_stem_tg in yeonin_names or seun_branch_tg in yeonin_names:
        seun_love = "인연이 들어오기 쉬운 해"
    elif seun_stem_tg in ("식신", "상관") or seun_branch_tg in ("식신", "상관"):
        seun_love = "매력이 드러나면서 소개·만남이 늘기 쉬운 해"

    timing = "2~3번의 실제 만남에서 리듬을 확인한 후 관계 확정"
    if seun_love.startswith("인연이"):
        timing = "올해 하반기까지 소개·재회·지인 연결에서 인연 타이밍이 좋음"

    yongshin_elements = yongshin.get("final_yongshin") or []
    gishin_elements = yongshin.get("gishin") or []
    yongshin_tip = yongshin.get("modern_meaning") or ""

    # 연인성 십이운성 (봉법 + 좌법)
    yeonin_sibiun: list = []
    try:
        from .sibiun import analyze_bongbeop, analyze_jwabeop
        bong = analyze_bongbeop(saju_data)
        jwa = analyze_jwabeop(saju_data)
        
        for pos_label in partner_positions:
            if pos_label in ["년간", "월간", "시간"]:
                sibiun_data = bong.get(pos_label, {})
                if sibiun_data:
                    yeonin_sibiun.append({
                        "position": pos_label,
                        "sibiun": sibiun_data.get("sibiun", ""),
                        "vitality": sibiun_data.get("vitality", 0),
                        "meaning": "인연이 강하게 작동" if sibiun_data.get("vitality", 0) >= 70 else "인연이 약함",
                    })
            elif pos_label in ["년지", "월지", "일지", "시지"]:
                jwa_data = jwa.get(pos_label, {})
                if jwa_data:
                    for jj in jwa_data.get("jijanggan", []):
                        stem = jj.get("stem", "")
                        if stem and calculate_ten_god(ilgan, stem) in yeonin_names:
                            yeonin_sibiun.append({
                                "position": pos_label,
                                "char": stem,
                                "sibiun": jj.get("sibiun", ""),
                                "vitality": jj.get("vitality", 0),
                                "meaning": "인연이 강하게 작동" if jj.get("vitality", 0) >= 70 else "인연이 약함",
                            })
                            break
    except Exception:
        pass

    return {
        "partner_type": partner_type,
        "pattern": pattern,
        "current_flow": current_flow,
        "seun_love": seun_love,
        "timing": timing,
        "ilji_ten_god": day_branch_tg if day_branch_tg else "중립",
        "ilji_state": "충" if ilji_chung else ("합" if ilji_hap else "중립"),
        "partner_positions": partner_positions if partner_positions else ["뚜렷하지 않음"],
        "partner_tonggeun": "강함" if len(partner_root_stems) >= 2 else ("보통" if partner_root_stems else "약함"),
        "yeonin_life_stages": yeonin_life_stages if yeonin_life_stages else ["뚜렷하지 않음"],
        "dohwa_count": len(dohwa),
        "hongyeom_count": len(hongyeom),
        "daeun_ten_god": daeun_tg if daeun_tg else "확인 필요",
        "daeun_branch_tg": daeun_branch_tg if daeun_branch_tg else "",
        "daeun_favorable": "유리" if love_active_now else "중립",
        "seun_favorable": "유리" if seun_favorable else "보통",
        "yongshin_elements": yongshin_elements if yongshin_elements else ["확인 필요"],
        "gishin_elements": gishin_elements if gishin_elements else [],
        "yongshin_love_tip": yongshin_tip,
        "yeonin_sibiun": yeonin_sibiun,
    }


def interpret_career_deep(saju_data: dict) -> dict:
    """
    직업 심화 해석 — 구조화된 사실 데이터 반환.
    데이터가 부족하면 {} 반환.
    """
    ilgan = _get_ilgan(saju_data)
    pillars = _get_pillars(saju_data)
    if not ilgan or not pillars.get("day"):
        return {}

    from logic.saju_engine.core.tonggeun import calculate_tonggeun
    from logic.saju_engine.core.geunmyo import analyze_geunmyo
    from logic.saju_engine.core.seun import analyze_seun

    ten_gods = _get_ten_gods(saju_data)
    sinsal = _get_sinsal(saju_data)
    strength = _get_strength(saju_data)
    wolji = _get_wolji(saju_data)

    tong = calculate_tonggeun(saju_data) or {}
    geunmyo = analyze_geunmyo(saju_data) or {}
    seun = analyze_seun(saju_data) or {}
    yongshin = saju_data.get("yongshin") or {}

    siksang_count = _count_ten_god(ten_gods, "식신", "상관")
    gwan_count = _count_ten_god(ten_gods, "편관", "정관")
    bigeop_count = _count_ten_god(ten_gods, "비견", "겁재")

    siksang_root = 0
    gwan_root = 0
    for pos in ("year", "month", "day", "hour"):
        p = pillars.get(pos, "")
        if len(p) < 1:
            continue
        stem = p[0]
        tg = calculate_ten_god(ilgan, stem)
        if tong.get(f"{pos}_stem", {}).get("has_root"):
            if tg in ("식신", "상관"):
                siksang_root += 1
            if tg in ("편관", "정관"):
                gwan_root += 1

    # 근묘화실 커리어 단계
    STAGE_LABEL = {"year": "초년", "month": "청년기", "day": "중장년기", "hour": "말년"}
    CAREER_GODS = ("식신", "상관", "편관", "정관")
    career_life_stages = []
    for pos in ("year", "month", "day", "hour"):
        item = geunmyo.get(pos, {})
        stg = item.get("stem_ten_god") or ""
        btg = item.get("branch_ten_god") or ""
        if stg in CAREER_GODS or btg in CAREER_GODS:
            label = STAGE_LABEL.get(pos, pos)
            tg_label = stg or btg
            career_life_stages.append(f"{label}({tg_label})")

    if gwan_root >= 2 or (gwan_count >= 2 and siksang_count <= 1):
        org_vs_independent = "조직형"
        org_reason = "관성이 강하고 뿌리가 있어 조직에서 힘을 발휘하는 구조"
    elif siksang_root >= 2 or (strength == "신강" and siksang_count >= 2):
        org_vs_independent = "독립형"
        org_reason = "식상이 강하고 신강해서 혼자 움직일 때 더 강한 구조"
    elif siksang_count >= 1 and gwan_count >= 1:
        org_vs_independent = "프리에이전트형"
        org_reason = "조직 안에서도 독립적으로 움직이는 프리에이전트 스타일"
    elif siksang_count == 0 and gwan_count == 0:
        org_vs_independent = "전문가형"
        org_reason = "인성/비겁 중심으로 전문 역량을 쌓는 구조"
    else:
        org_vs_independent = "상황적응형"
        org_reason = "환경에 따라 조직/독립 모두 소화 가능한 유연한 구조"

    month_field_map = {
        "寅": "기획·교육·콘텐츠",
        "卯": "디자인·브랜딩·상담",
        "辰": "운영·관리·재무",
        "巳": "마케팅·영업·미디어",
        "午": "공연·콘텐츠·홍보",
        "未": "인사·코칭·복지",
        "申": "기술·분석·전략",
        "酉": "품질·법무·정밀업무",
        "戌": "관리·감사·기획총괄",
        "亥": "연구·상담·기획",
        "子": "데이터·연구·기술",
        "丑": "재무·행정·운영",
    }
    best_field = month_field_map.get(wolji, "현재 경험이 쌓인 분야")

    special = []
    if sinsal.get("munchang_gwiin"):
        special.append("문창귀인(글·표현 능력)")
    # 학당귀인: analyze_sinsal 미구현 — 포함하지 않음
    if sinsal.get("hwagae"):
        special.append("화개살(예술·철학·종교)")
    if sinsal.get("yeokma"):
        special.append("역마살(이동·해외·무역)")

    current = _get_current_daeun(saju_data)
    daeun_tg = ""
    daeun_branch_tg = ""
    if current:
        _, gapja = current
        if len(gapja) >= 2:
            daeun_tg = calculate_ten_god(ilgan, gapja[0])
            daeun_branch_tg = calculate_ten_god(ilgan, gapja[1])
        elif len(gapja) >= 1:
            daeun_tg = calculate_ten_god(ilgan, gapja[0])
    CAREER_ACTIVE_GODS = ("편관", "정관", "식신", "상관", "편재", "정재")
    career_active_now = (
        daeun_tg in CAREER_ACTIVE_GODS or daeun_branch_tg in CAREER_ACTIVE_GODS
    )

    # current_flow: 천간 기준, 없으면 지지 참조
    _daeun_for_flow = daeun_tg or daeun_branch_tg
    current_flow = "기술을 다듬고 포지션을 선명하게 만드는 구간"
    if _daeun_for_flow in ("편관", "정관"):
        current_flow = "조직에서 책임과 직함이 올라가기 쉬운 흐름"
    elif _daeun_for_flow in ("식신", "상관"):
        current_flow = "실무 결과물과 포트폴리오가 커리어를 밀어주는 흐름"
    elif _daeun_for_flow in ("편재", "정재"):
        current_flow = "수익화와 프로젝트 확장이 커리어 핵심이 되는 흐름"

    seun_stem_tg = seun.get("stem_ten_god") or ""
    seun_branch_tg = seun.get("branch_ten_god") or ""
    seun_favorable = (
        seun_stem_tg in ("편관", "정관", "식신", "상관")
        or seun_branch_tg in ("편관", "정관", "식신", "상관")
    )
    seun_career = "커리어 기반을 정리하는 해"
    if seun_stem_tg in ("편관", "정관") or seun_branch_tg in ("편관", "정관"):
        seun_career = "평가·승진·직책 변화 이슈가 커지기 쉬운 해"
    elif seun_stem_tg in ("식신", "상관") or seun_branch_tg in ("식신", "상관"):
        seun_career = "실적·작품·성과를 보여주기 좋은 해"

    work_style = "기준을 세우고 꾸준히 완성도를 올리는 스타일"
    if siksang_count >= 2 and siksang_root >= 1:
        work_style = "직접 만들고 개선하면서 성과를 만드는 실무형 스타일"
    elif gwan_count >= 2 and gwan_root >= 1:
        work_style = "체계와 책임을 중심으로 성과를 쌓는 관리형 스타일"

    yongshin_elements = yongshin.get("final_yongshin") or []
    gishin_elements = yongshin.get("gishin") or []
    yongshin_tip = yongshin.get("modern_meaning") or ""

    # 식상·관성 십이운성 (봉법 + 좌법)
    career_sibiun: list = []
    try:
        from .sibiun import analyze_bongbeop, analyze_jwabeop
        bong = analyze_bongbeop(saju_data)
        jwa = analyze_jwabeop(saju_data)
        
        CAREER_GODS = ("식신", "상관", "편관", "정관")
        for label in ["년간", "월간", "시간"]:
            sibiun_data = bong.get(label, {})
            if sibiun_data:
                stem = sibiun_data.get("stem", "")
                if stem and calculate_ten_god(ilgan, stem) in CAREER_GODS:
                    career_sibiun.append({
                        "position": label,
                        "char": stem,
                        "ten_god": calculate_ten_god(ilgan, stem),
                        "sibiun": sibiun_data.get("sibiun", ""),
                        "vitality": sibiun_data.get("vitality", 0),
                        "meaning": "직업 에너지 강함" if sibiun_data.get("vitality", 0) >= 70 else "직업 에너지 약함",
                    })
        
        for label in ["년지", "월지", "일지", "시지"]:
            jwa_data = jwa.get(label, {})
            if jwa_data:
                for jj in jwa_data.get("jijanggan", []):
                    stem = jj.get("stem", "")
                    if stem and calculate_ten_god(ilgan, stem) in CAREER_GODS:
                        career_sibiun.append({
                            "position": label,
                            "char": stem,
                            "ten_god": calculate_ten_god(ilgan, stem),
                            "sibiun": jj.get("sibiun", ""),
                            "vitality": jj.get("vitality", 0),
                            "meaning": "직업 에너지 강함" if jj.get("vitality", 0) >= 70 else "직업 에너지 약함",
                        })
                        break
    except Exception:
        pass

    return {
        "work_style": work_style,
        "best_field": best_field,
        "org_vs_independent": org_vs_independent,
        "org_reason": org_reason,
        "current_flow": current_flow,
        "seun_career": seun_career,
        "siksang_count": siksang_count,
        "siksang_root_count": siksang_root,
        "gwan_count": gwan_count,
        "gwan_root_count": gwan_root,
        "career_life_stages": career_life_stages if career_life_stages else ["뚜렷하지 않음"],
        "special_sinsal": special if special else ["특이 신호 약함"],
        "daeun_ten_god": daeun_tg if daeun_tg else "확인 필요",
        "daeun_branch_tg": daeun_branch_tg if daeun_branch_tg else "",
        "daeun_favorable": "유리" if career_active_now else "중립",
        "seun_favorable": "유리" if seun_favorable else "보통",
        "yongshin_elements": yongshin_elements if yongshin_elements else ["확인 필요"],
        "gishin_elements": gishin_elements if gishin_elements else [],
        "yongshin_career_tip": yongshin_tip,
        "career_sibiun": career_sibiun,
    }


# ─────────────────────────────────────────────────────────────
# 시각화 전용 계산 함수
# ─────────────────────────────────────────────────────────────

def calculate_personality_radar_scores(saju_data: dict, personality_result: dict, money_result: dict, career_result: dict) -> dict:
    """
    성향 레이더 차트용 5축 점수 계산 (0~100)
    - 감정 vs 이성
    - 즉흥 vs 계획
    - 외향 vs 내향
    - 실행 vs 고민
    - 안정 vs 변화
    """
    ilgan = _get_ilgan(saju_data)
    strength = _get_strength(saju_data)
    ten_gods = _get_ten_gods(saju_data)
    sinsal = saju_data.get("sinsal") or {}
    
    # 오행 분포 계산
    pillars = _get_pillars(saju_data)
    elements = {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0}
    for pos in ["year", "month", "day", "hour"]:
        p = pillars.get(pos, "")
        if len(p) >= 2:
            stem_elem = get_element(p[0])
            branch_elem = get_element(p[1])
            if stem_elem in elements:
                elements[stem_elem] += 1
            if branch_elem in elements:
                elements[branch_elem] += 1
    
    # 십성 개수
    tg_values = list(ten_gods.values())
    siksang_count = sum(1 for tg in tg_values if tg in ("식신", "상관"))
    gwan_count = sum(1 for tg in tg_values if tg in ("편관", "정관"))
    jae_count = sum(1 for tg in tg_values if tg in ("편재", "정재"))
    in_count = sum(1 for tg in tg_values if tg in ("편인", "정인"))
    bigyeob_count = sum(1 for tg in tg_values if tg in ("비견", "겁재"))
    
    # 역마·도화 체크
    yeokma_count = len(sinsal.get("역마") or [])
    
    # 십이운성 체크
    sibiun_data = saju_data.get("twelve_states") or {}
    strong_sibiun = sum(1 for s in sibiun_data.values() if s in ("건록", "제왕", "관대"))
    
    # 기본값 50 (중립)
    감정 = 50
    즉흥 = 50
    외향 = 50
    실행 = 50
    안정 = 50
    
    # 감정 vs 이성 (수기·금기 많으면 감정↑, 목기·토기 많으면 이성↑)
    감정 += elements["water"] * 8
    감정 += elements["metal"] * 5
    감정 -= elements["wood"] * 6
    감정 -= elements["earth"] * 4
    if siksang_count >= 2:
        감정 += 12  # 식상 많으면 표현·감수성
    if in_count >= 2:
        감정 -= 10  # 인성 많으면 이성·학습
    
    # 즉흥 vs 계획 (화기·역마 많으면 즉흥↑, 토기·정성 많으면 계획↑)
    즉흥 += elements["fire"] * 7
    즉흥 += yeokma_count * 15
    즉흥 -= elements["earth"] * 6
    정성_count = sum(1 for tg in tg_values if tg in ("정재", "정관", "정인"))
    즉흥 -= 정성_count * 8
    
    # 외향 vs 내향 (화기·식상 많으면 외향↑, 수기·인성 많으면 내향↑)
    외향 += elements["fire"] * 9
    외향 += siksang_count * 10
    외향 += strong_sibiun * 5
    외향 -= elements["water"] * 7
    외향 -= in_count * 8
    
    # 실행 vs 고민 (신강·비겁·관성 많으면 실행↑, 신약·인성 많으면 고민↑)
    if strength == "신강":
        실행 += 15
    elif strength == "신약":
        실행 -= 15
    실행 += bigyeob_count * 8
    실행 += gwan_count * 6
    실행 -= in_count * 10
    
    # 안정 vs 변화 (토기·정성 많으면 안정↑, 역마·편성 많으면 변화↑)
    안정 += elements["earth"] * 8
    안정 += 정성_count * 10
    안정 -= yeokma_count * 18
    편성_count = sum(1 for tg in tg_values if tg in ("편재", "편관", "편인"))
    안정 -= 편성_count * 7
    
    # 0~100 범위로 제한
    def clamp(v: float) -> int:
        return int(max(10, min(90, v)))
    
    return {
        "감정": clamp(감정),
        "즉흥": clamp(즉흥),
        "외향": clamp(외향),
        "실행": clamp(실행),
        "안정": clamp(안정),
    }


def calculate_problem_loop(saju_data: dict, personality_result: dict, money_result: dict, career_result: dict) -> dict:
    """
    반복되는 문제 패턴 계산
    Returns: {"type": str, "steps": list[str]}
    """
    strength = _get_strength(saju_data)
    ten_gods = _get_ten_gods(saju_data)
    sinsal = saju_data.get("sinsal") or {}
    
    tg_values = list(ten_gods.values())
    gwan_count = sum(1 for tg in tg_values if tg in ("편관", "정관"))
    bigyeob_count = sum(1 for tg in tg_values if tg in ("비견", "겁재"))
    jae_count = sum(1 for tg in tg_values if tg in ("편재", "정재"))
    siksang_count = sum(1 for tg in tg_values if tg in ("식신", "상관"))
    in_count = sum(1 for tg in tg_values if tg in ("편인", "정인"))
    yeokma_count = len(sinsal.get("역마") or [])
    
    # 우선순위 기반 패턴 결정
    # 1순위: 신약 + 관살多
    if strength == "신약" and gwan_count >= 2:
        return {
            "type": "pressure_avoidance",
            "steps": ["부담 받음", "회피하려 함", "기회 놓침", "다시 부담"]
        }
    
    # 2순위: 신강 + 비겁多
    if strength == "신강" and bigyeob_count >= 2:
        return {
            "type": "solo_conflict",
            "steps": ["혼자 시작", "충돌 발생", "관계 멀어짐", "다시 혼자"]
        }
    
    # 3순위: 재성多 + 신약
    if jae_count >= 2 and strength == "신약":
        return {
            "type": "money_exhaustion",
            "steps": ["돈 기회 옴", "과도한 시도", "에너지 소진", "남는 것 없음"]
        }
    
    # 4순위: 역마 + 식상
    if yeokma_count >= 1 and siksang_count >= 1:
        return {
            "type": "wanderlust",
            "steps": ["새 시작", "금방 지루함", "또 다른 곳", "반복 이동"]
        }
    
    # 5순위: 상관 + 관성
    sanggwan_count = sum(1 for tg in tg_values if tg == "상관")
    if sanggwan_count >= 1 and gwan_count >= 1:
        return {
            "type": "expression_conflict",
            "steps": ["표현 욕구", "충돌 발생", "후회 반복", "다시 표현"]
        }
    
    # 6순위: 인성多 (고민형)
    if in_count >= 2:
        return {
            "type": "overthinking",
            "steps": ["생각 많음", "실행 지연", "기회 놓침", "다시 고민"]
        }
    
    # 기본 패턴
    return {
        "type": "goal_drift",
        "steps": ["목표 세움", "중간 흔들림", "방향 잃음", "다시 목표"]
    }


def calculate_money_flow(saju_data: dict, money_result: dict) -> dict:
    """
    돈 흐름 구조 계산
    Returns: {"type": str, "steps": list[dict], "leakLabel": str, "typeLabel": str}
    """
    strength = _get_strength(saju_data)
    ten_gods = _get_ten_gods(saju_data)
    
    tg_values = list(ten_gods.values())
    pyeonjae_count = sum(1 for tg in tg_values if tg == "편재")
    jeongjae_count = sum(1 for tg in tg_values if tg == "정재")
    jae_count = pyeonjae_count + jeongjae_count
    
    # 1순위: 편재 중심 (변동 수입형)
    if pyeonjae_count >= 2 or (pyeonjae_count >= 1 and jeongjae_count == 0):
        return {
            "type": "variable_income",
            "typeLabel": "변동 수입형",
            "steps": [
                {"label": "기회 포착", "sub": "순간 판단", "isLeak": False},
                {"label": "빠른 실행", "sub": "추진력", "isLeak": False},
                {"label": "수입 발생", "sub": "한 번에 큼", "isLeak": False},
                {"label": "재투자", "sub": "또 기회로", "isLeak": True},
            ],
            "leakLabel": "충동 소비·재투자로 잘 안 모임"
        }
    
    # 2순위: 정재 중심 (누적 안정형)
    if jeongjae_count >= 2 or (jeongjae_count >= 1 and pyeonjae_count == 0):
        return {
            "type": "stable_accumulation",
            "typeLabel": "누적 안정형",
            "steps": [
                {"label": "꾸준한 일", "sub": "성실함", "isLeak": False},
                {"label": "정기 수입", "sub": "안정적", "isLeak": False},
                {"label": "저축 우선", "sub": "차곡차곡", "isLeak": False},
                {"label": "천천히 늘어남", "sub": "복리 효과", "isLeak": False},
            ],
            "leakLabel": "큰 기회 앞에서 망설임"
        }
    
    # 3순위: 신약 + 재성多 (기회 있지만 버거운 구조)
    if strength == "신약" and jae_count >= 2:
        return {
            "type": "high_opportunity_low_energy",
            "typeLabel": "기회 있지만 버거운 구조",
            "steps": [
                {"label": "돈 기회 옴", "sub": "많이 보임", "isLeak": False},
                {"label": "잡으려 함", "sub": "에너지 소모", "isLeak": False},
                {"label": "일부 성공", "sub": "들어옴", "isLeak": False},
                {"label": "나가는 것도 많음", "sub": "지출 증가", "isLeak": True},
            ],
            "leakLabel": "에너지 대비 수익이 적은 구조"
        }
    
    # 4순위: 신강 + 재성 (직접 벌기형)
    if strength == "신강" and jae_count >= 1:
        return {
            "type": "self_earning",
            "typeLabel": "직접 벌기형",
            "steps": [
                {"label": "직접 벌기", "sub": "주도적", "isLeak": False},
                {"label": "안정 수입", "sub": "꾸준함", "isLeak": False},
                {"label": "필요한 곳 씀", "sub": "균형", "isLeak": False},
                {"label": "조금씩 늘어남", "sub": "천천히", "isLeak": False},
            ],
            "leakLabel": "큰 변화 없이 유지되는 구조"
        }
    
    # 기본: 균형형
    return {
        "type": "balanced",
        "typeLabel": "균형 수입형",
        "steps": [
            {"label": "일로 수입", "sub": "본업 중심", "isLeak": False},
            {"label": "꾸준히 쌓임", "sub": "안정적", "isLeak": False},
            {"label": "필요한 곳 씀", "sub": "균형 있게", "isLeak": False},
            {"label": "조금씩 늘어남", "sub": "천천히", "isLeak": False},
        ],
        "leakLabel": "큰 변화 없이 유지되는 구조"
    }


# ─────────────────────────────────────────────────────────────
# 전체 통합
# ─────────────────────────────────────────────────────────────

def analyze_timing_for_chat(saju_data: dict) -> dict:
    """
    채팅용 시기 분석 - 다음 유리한 시기 예측
    """
    try:
        period_data = interpret_current_period(saju_data)
        seun_data = analyze_seun(saju_data) if hasattr(saju_data, 'get') else {}
        
        # 현재 상태 파악
        current_status = period_data.get("language_points", [])
        current_summary = ". ".join(current_status[:2]) if current_status else "현재 안정적인 시기"
        
        # 다음 유리한 시기 계산
        next_favorable = {}
        
        # 세운 기반 분석
        if seun_data:
            seun_effect = seun_data.get("effect", "")
            seun_name = seun_data.get("name", "")
            if "유리" in seun_effect or "길" in seun_effect:
                next_favorable = {
                    "period": f"올해 {seun_name} 시기",
                    "reason": "세운이 유리한 방향으로 작용하여 기회가 열립니다."
                }
        
        # 대운 기반 분석
        if not next_favorable and period_data:
            patterns = period_data.get("patterns", [])
            for pattern in patterns:
                if "기회" in str(pattern) or "전환" in str(pattern):
                    next_favorable = {
                        "period": "다음 대운 전환기",
                        "reason": "대운 전환으로 새로운 기운이 들어옵니다."
                    }
                    break
        
        # 기본 예측
        if not next_favorable:
            next_favorable = {
                "period": "향후 6개월 내",
                "reason": "꾸준한 노력으로 기회를 만들어야 하는 시기입니다."
            }
        
        return {
            "current_status": current_summary,
            "next_favorable": next_favorable,
            "confidence": "medium" if seun_data else "low"
        }
        
    except Exception as e:
        print(f"시기 분석 오류: {e}")
        return {
            "current_status": "현재 안정적인 시기",
            "next_favorable": {
                "period": "향후 6개월 내",
                "reason": "꾸준한 노력이 필요한 시기입니다."
            },
            "confidence": "low"
        }


def interpret_all(saju_data: dict) -> dict:
    """
    5개 영역 전체 해석 통합.
    Returns:
        money, love, career, personality, current_period 각 결과 + summary
    """
    money       = interpret_money(saju_data)
    love        = interpret_love(saju_data)
    career      = interpret_career(saju_data)
    personality = interpret_personality(saju_data)
    period      = interpret_current_period(saju_data)
    
    # 시기 분석 추가
    timing = analyze_timing_for_chat(saju_data)

    from logic.saju_engine.core.tonggeun import calculate_tonggeun, format_tonggeun_for_prompt
    from logic.saju_engine.core.geunmyo import analyze_geunmyo, format_geunmyo_for_prompt
    from logic.saju_engine.core.hyeong_haehae import analyze_hyeong_haehae, format_hyeong_for_prompt
    from logic.saju_engine.core.seun import analyze_seun, format_seun_for_prompt

    try:
        tonggeun = calculate_tonggeun(saju_data)
        geunmyo = analyze_geunmyo(saju_data)
        hyeong = analyze_hyeong_haehae(saju_data)
        seun = analyze_seun(saju_data)
    except Exception as e:
        print(f"추가 엔진 오류: {e}")
        tonggeun = {}
        geunmyo = {}
        hyeong = {}
        seun = {}

    # 시각화 데이터 계산
    visual_data = {
        "personality_radar": calculate_personality_radar_scores(saju_data, personality, money, career),
        "problem_loop": calculate_problem_loop(saju_data, personality, money, career),
        "money_flow": calculate_money_flow(saju_data, money),
    }
    
    # GPT에게 넘길 요약 블록
    summary_for_gpt = {
        "ilgan": _get_ilgan(saju_data),
        "wolji": _get_wolji(saju_data),
        "strength": _get_strength(saju_data),
        "money_points":       money["language_points"],
        "love_points":        love["language_points"],
        "career_points":      career["language_points"],
        "personality_points": personality["language_points"],
        "period_points":      period["language_points"],
        "current_period_points": period["language_points"],
        "tonggeun_points": format_tonggeun_for_prompt(tonggeun),
        "geunmyo_points": format_geunmyo_for_prompt(geunmyo),
        "hyeong_points": format_hyeong_for_prompt(hyeong),
        "seun_points": format_seun_for_prompt(seun),
        "all_patterns": (
            money["patterns"]
            + love["patterns"]
            + career["patterns"]
            + personality["patterns"]
            + period["patterns"]
        ),
        "visual_data": visual_data,
        "timing": timing,  # 시기 분석 정보 추가
    }

    return {
        "money":        money,
        "love":         love,
        "career":       career,
        "personality":  personality,
        "current_period": period,
        "tonggeun": tonggeun,
        "geunmyo": geunmyo,
        "hyeong_haehae": hyeong,
        "seun_2026": seun,
        "summary_for_gpt": summary_for_gpt,
    }
