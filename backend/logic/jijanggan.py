"""
지장간(地藏干) calculator
지지 안에 숨어있는 천간들
"""

# 지장간 매핑 (지지 한글 -> 천간 한자 리스트)
JIJANGGAN_MAP = {
    "자": ["壬", "癸"],
    "축": ["癸", "辛", "己"],
    "인": ["戊", "丙", "甲"],
    "묘": ["甲", "乙"],
    "진": ["乙", "癸", "戊"],
    "사": ["戊", "庚", "丙"],
    "오": ["丙", "己", "丁"],
    "미": ["丁", "乙", "己"],
    "신": ["戊", "壬", "庚"],
    "유": ["庚", "辛"],
    "술": ["辛", "丁", "戊"],
    "해": ["戊", "甲", "壬"]
}

# 천간 한자 -> 한글 매핑
HANJA_TO_HANGUL = {
    "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무",
    "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계"
}

# 천간 한자 -> 오행 매핑
HANJA_TO_ELEMENT = {
    "甲": "wood", "乙": "wood",
    "丙": "fire", "丁": "fire",
    "戊": "earth", "己": "earth",
    "庚": "metal", "辛": "metal",
    "壬": "water", "癸": "water"
}


def get_jijanggan(jiji_hangul: str) -> list:
    """
    지지의 지장간 반환

    Args:
        jiji_hangul: 지지 한글 (예: "자", "축")

    Returns:
        지장간 리스트 [{"hanja": "壬", "hangul": "임", "element": "water"}, ...]
    """
    hanja_list = JIJANGGAN_MAP.get(jiji_hangul, [])

    result = []
    for hanja in hanja_list:
        result.append({
            "hanja": hanja,
            "hangul": HANJA_TO_HANGUL.get(hanja, ""),
            "element": HANJA_TO_ELEMENT.get(hanja, "")
        })

    return result


def calculate_jijanggan_for_pillars(pillars: dict) -> dict:
    """
    4주의 지장간 계산

    Args:
        pillars: {"hour": {"jiji": "자"}, "day": {...}, ...}

    Returns:
        {"hour": [{"hanja": "壬", "hangul": "임", "element": "water"}, ...], ...}
    """
    result = {}

    for pillar_name in ["hour", "day", "month", "year"]:
        pillar = pillars.get(pillar_name, {})
        jiji = pillar.get("jiji", "")
        result[pillar_name] = get_jijanggan(jiji)

    return result
