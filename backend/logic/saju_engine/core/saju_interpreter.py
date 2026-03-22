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

    # 패턴 없으면 기본값
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
    language_points.append(ilgan_nature["core"])

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

    return {
        "patterns": patterns,
        "language_points": language_points,
        "raw": {
            "current_daeun": current_daeun,
            "daeun_direction": daeun_direction,
            "daeun_list": daeun_list,
        },
    }


# ─────────────────────────────────────────────────────────────
# 전체 통합
# ─────────────────────────────────────────────────────────────

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
        "all_patterns": (
            money["patterns"]
            + love["patterns"]
            + career["patterns"]
            + personality["patterns"]
            + period["patterns"]
        ),
    }

    return {
        "money":        money,
        "love":         love,
        "career":       career,
        "personality":  personality,
        "current_period": period,
        "summary_for_gpt": summary_for_gpt,
    }
