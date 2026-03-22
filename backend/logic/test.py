import json
from datetime import datetime, date, timedelta

# ==============================================================
# 1. 기초 데이터 및 매핑 테이블
# ==============================================================
GANJI_60 = [
    "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉",
    "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未",
    "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳",
    "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯",
    "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
    "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥"
]

GANS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
JIS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
HAN_MAP = {'甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계', '子': '자',
           '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'}

SOLAR_TERMS_ORDER = ["입춘", "경칩", "청명", "입하", "망종",
                     "소서", "입추", "백로", "한로", "입동", "대설", "소한"]
MONTH_PILLAR_START_GAN = {'甲': '丙', '乙': '戊', '丙': '庚', '丁': '壬',
                          '戊': '甲', '己': '丙', '庚': '戊', '辛': '庚', '壬': '壬', '癸': '甲'}
HOUR_PILLAR_START_GAN = {'甲': '甲', '乙': '丙', '丙': '戊', '丁': '庚',
                         '戊': '壬', '己': '甲', '庚': '丙', '辛': '戊', '壬': '庚', '癸': '壬'}

KST_DST_PERIODS = [
    (datetime(1948, 6, 1, 0, 0), datetime(1948, 9, 13, 0, 0)
     ), (datetime(1949, 4, 1, 0, 0), datetime(1949, 9, 11, 0, 0)),
    (datetime(1950, 4, 1, 0, 0), datetime(1950, 9, 11, 0, 0)
     ), (datetime(1951, 5, 6, 0, 0), datetime(1951, 9, 9, 0, 0)),
    (datetime(1987, 5, 10, 2, 0), datetime(1987, 10, 11, 3, 0)
     ), (datetime(1988, 5, 8, 2, 0), datetime(1988, 10, 9, 3, 0)),
]

# ==============================================================
# 2. 유틸리티 및 계산 함수
# ==============================================================


def to_hangul(ganji):
    return "".join([HAN_MAP.get(c, c) for c in ganji])


def load_db(path="solar_terms_db.json"):
    try:
        with open(path, "r", encoding="utf-8") as f:
            raw = json.load(f)
            return {datetime.strptime(k, "%Y-%m-%d %H:%M"): v for k, v in raw.items()}
    except:
        return None


def calculate_year_pillar(birth_dt, db):
    sorted_keys = sorted(db.keys())
    last_ipchun = next((dt for dt in reversed(sorted_keys)
                       if db[dt] == "입춘" and dt <= birth_dt), None)
    if not last_ipchun:
        return "Unknown"
    idx = (36 + (last_ipchun.year - 1900)) % 60
    return GANJI_60[idx]


def calculate_month_pillar(birth_dt, year_ganji, db):
    sorted_keys = sorted(db.keys())
    last_term = next((db[dt] for dt in reversed(
        sorted_keys) if db[dt] in SOLAR_TERMS_ORDER and dt <= birth_dt), None)
    if not last_term:
        return "Unknown"
    offset = SOLAR_TERMS_ORDER.index(last_term)
    start_gan_idx = GANS.index(MONTH_PILLAR_START_GAN[year_ganji[0]])
    return GANS[(start_gan_idx + offset) % 10] + JIS[(2 + offset) % 12]


def calculate_day_pillar(birth_dt):
    calc_date = birth_dt.date()
    if birth_dt.hour == 23 and birth_dt.minute >= 30:
        calc_date += timedelta(days=1)
    diff = (calc_date - date(2024, 1, 1)).days
    return GANJI_60[diff % 60]


def calculate_hour_pillar(birth_dt, day_ganji, apply_korea_dst: bool = True):
    # DST & 30분 보정 (한국 역사 구간). 해외 출생은 apply_korea_dst=False 로 호출.
    kst_dt = birth_dt
    if apply_korea_dst:
        for s, e in KST_DST_PERIODS:
            if s <= birth_dt < e:
                kst_dt -= timedelta(hours=1)
                break
    corrected_dt = kst_dt - timedelta(minutes=30)
    h_idx = ((corrected_dt.hour + 1) % 24) // 2
    start_gan_idx = GANS.index(HOUR_PILLAR_START_GAN[day_ganji[0]])
    return GANS[(start_gan_idx + h_idx) % 10] + JIS[h_idx]


def calculate_daeun(birth_dt, gender, nj, mj, db):
    is_yang_year = GANS.index(nj[0]) % 2 == 0
    is_forward = (is_yang_year and gender == 'M') or (
        not is_yang_year and gender == 'F')
    sorted_keys = sorted(db.keys())

    if is_forward:
        target_term = next(dt for dt in sorted_keys if dt >
                           birth_dt and db[dt] in SOLAR_TERMS_ORDER)
        diff = (target_term - birth_dt).total_seconds() / 86400
    else:
        target_term = next(dt for dt in reversed(sorted_keys)
                           if dt <= birth_dt and db[dt] in SOLAR_TERMS_ORDER)
        diff = (birth_dt - target_term).total_seconds() / 86400

    daeun_num = max(1, round(diff / 3))
    mj_idx = GANJI_60.index(mj)
    daeun_list = []
    for i in range(1, 11):
        idx = (mj_idx + i) % 60 if is_forward else (mj_idx - i) % 60
        ganji = GANJI_60[idx]
        daeun_list.append(
            f"{daeun_num + (i-1)*10}세 {ganji}({to_hangul(ganji)})")
    return daeun_num, daeun_list, "순행" if is_forward else "역행"

# ==============================================================
# ==============================================================
# 3. 메인 인터페이스 (수정본)
# ==============================================================


def main():
    db = load_db()
    if not db:
        print("🚨 DB 파일(solar_terms_db.json)이 없습니다. 확인해 주세요.")
        return

    print("\n" + "="*45 + "\n    사주 팔자 및 대운 통합 시스템\n" + "="*45)

    try:
        # 1. 성별 입력
        gender = input("성별 입력 (M/F): ").upper()
        while gender not in ['M', 'F']:
            gender = input("잘못된 입력입니다. 성별을 다시 입력하세요 (M/F): ").upper()

        # 2. 생년월일 8자리 입력 (예: 20000922)
        birth_date_str = input("생년월일 8자리 입력 (예: 20000922): ")
        while len(birth_date_str) != 8 or not birth_date_str.isdigit():
            birth_date_str = input("8자리 숫자로 다시 입력하세요 (예: 20000922): ")

        y = int(birth_date_str[:4])
        m = int(birth_date_str[4:6])
        d = int(birth_date_str[6:])

        # 3. 태어난 시간 4자리 입력 (예: 1612)
        birth_time_str = input("태어난 시간 4자리 입력 (예: 1612): ")
        while len(birth_time_str) != 4 or not birth_time_str.isdigit():
            birth_time_str = input("4자리 숫자로 다시 입력하세요 (예: 1612): ")

        h = int(birth_time_str[:2])
        mi = int(birth_time_str[2:])

        # 날짜 객체 생성
        birth_dt = datetime(y, m, d, h, mi)

        # 계산 로직 호출
        nj = calculate_year_pillar(birth_dt, db)
        mj = calculate_month_pillar(birth_dt, nj, db)
        dj = calculate_day_pillar(birth_dt)
        sj = calculate_hour_pillar(birth_dt, dj)
        d_num, d_list, d_dir = calculate_daeun(birth_dt, gender, nj, mj, db)

        # 결과 출력
        print("\n" + "-"*45)
        print(
            f" [입력정보] {y}년 {m}월 {d}일 {h}시 {mi}분 ({'남성' if gender == 'M' else '여성'})")
        print("-" * 45)
        print(f" 년주: {nj} ({to_hangul(nj)})")
        print(f" 월주: {mj} ({to_hangul(mj)})")
        print(f" 일주: {dj} ({to_hangul(dj)})")
        print(f" 시주: {sj} ({to_hangul(sj)})")
        print("-" * 45)
        print(f" 대운수: {d_num} ({d_dir})")
        print(" " + " -> ".join([item.split()[1]
              for item in d_list[:5]]) + " ...")
        print("-" * 45)
        for d_info in d_list:
            print(f" {d_info}")

    except ValueError:
        print("🚨 입력 형식이 잘못되었습니다. 숫자 위주로 입력해 주세요.")
    except Exception as e:
        print(f"🚨 오류 발생: {e}")


# ==============================================================
# 4. 십성 및 재물운 계산 함수
# ==============================================================

def get_element(hanja):
    """한자에서 오행 추출"""
    wood = ['甲', '乙', '寅', '卯']
    fire = ['丙', '丁', '巳', '午']
    earth = ['戊', '己', '辰', '戌', '丑', '未']
    metal = ['庚', '辛', '申', '酉']
    water = ['壬', '癸', '子', '亥']

    if hanja in wood:
        return 'wood'
    elif hanja in fire:
        return 'fire'
    elif hanja in earth:
        return 'earth'
    elif hanja in metal:
        return 'metal'
    elif hanja in water:
        return 'water'
    return None


def get_polarity(gan):
    """천간의 음양 판별"""
    yang = ['甲', '丙', '戊', '庚', '壬']
    return 'yang' if gan in yang else 'yin'


def get_ten_god(day_stem, target_stem):
    """십성 계산"""
    day_el = get_element(day_stem)
    target_el = get_element(target_stem)

    if not day_el or not target_el:
        return ""

    # 오행 상생상극 관계
    produces = {'wood': 'fire', 'fire': 'earth',
                'earth': 'metal', 'metal': 'water', 'water': 'wood'}
    controls = {'wood': 'earth', 'fire': 'metal',
                'earth': 'water', 'metal': 'wood', 'water': 'fire'}

    same_pol = get_polarity(day_stem) == get_polarity(target_stem)

    # 같은 오행
    if day_el == target_el:
        return "비견" if same_pol else "겁재"
    # 일간이 생하는 오행
    elif produces[day_el] == target_el:
        return "식신" if same_pol else "상관"
    # 일간을 생하는 오행
    elif produces[target_el] == day_el:
        return "편인" if same_pol else "정인"
    # 일간이 극하는 오행 (재성)
    elif controls[day_el] == target_el:
        return "편재" if same_pol else "정재"
    # 일간을 극하는 오행 (관성)
    elif controls[target_el] == day_el:
        return "편관" if same_pol else "정관"

    return ""


def calculate_score(year_pillar: str, month_pillar: str, day_pillar: str, hour_pillar: str) -> int:
    """
    신강약 점수 계산 (0~100점)
    일간을 기준으로 생(生), 비(比), 설(泄), 극(剋) 점수를 합산
    """
    score = 50  # 기본 점수

    day_stem = day_pillar[0]  # 일간 (천간)

    pillars = [year_pillar, month_pillar, day_pillar, hour_pillar]

    for pillar in pillars:
        cheongan = pillar[0]
        jiji = pillar[1]

        # 천간 점수 계산
        if cheongan == day_stem:
            score += 10  # 비견
        elif produces(hanjaToElement(cheongan), hanjaToElement(day_stem)):
            score += 8   # 인성 (생)
        elif produces(hanjaToElement(day_stem), hanjaToElement(cheongan)):
            score -= 6   # 식상 (설)
        elif controls(hanjaToElement(day_stem), hanjaToElement(cheongan)):
            score -= 8   # 재성 (극)
        elif controls(hanjaToElement(cheongan), hanjaToElement(day_stem)):
            score -= 10  # 관성 (극)

        # 지지 점수 계산 (천간보다 약하게)
        if jiji == day_stem:
            score += 5
        # ... (지지 세력 계산 추가 가능)

    # 점수 범위 제한 (0~100)
    return max(0, min(100, score))


def hanjaToElement(h: str) -> str:
    """한자를 오행으로 변환"""
    wood = ["甲", "乙", "寅", "卯"]
    fire = ["丙", "丁", "巳", "午"]
    earth = ["戊", "己", "辰", "戌", "丑", "未"]
    metal = ["庚", "辛", "申", "酉"]
    water = ["壬", "癸", "子", "亥"]

    if h in wood:
        return "wood"
    if h in fire:
        return "fire"
    if h in earth:
        return "earth"
    if h in metal:
        return "metal"
    if h in water:
        return "water"
    return "none"


def produces(a: str, b: str) -> bool:
    """상생 관계 확인 (a가 b를 생함)"""
    relations = {
        "wood": "fire",
        "fire": "earth",
        "earth": "metal",
        "metal": "water",
        "water": "wood",
    }
    return relations.get(a) == b


def controls(a: str, b: str) -> bool:
    """상극 관계 확인 (a가 b를 극함)"""
    relations = {
        "wood": "earth",
        "fire": "metal",
        "earth": "water",
        "metal": "wood",
        "water": "fire",
    }
    return relations.get(a) == b


def get_sibsung_list(year_pillar: str, month_pillar: str, day_pillar: str, hour_pillar: str) -> dict:
    """
    사주 팔자의 십성 분포를 반환
    예: {"비겁": 2, "식상": 1, "재성": 3, "관성": 1, "인성": 1}
    """
    day_stem = day_pillar[0]  # 일간

    sibsung_count = {
        "비겁": 0,
        "식상": 0,
        "재성": 0,
        "관성": 0,
        "인성": 0,
    }

    pillars = [year_pillar, month_pillar, day_pillar, hour_pillar]

    for pillar in pillars:
        for char in pillar:  # 천간 + 지지 모두 확인
            sibsung = tenGod(day_stem, char)

            if sibsung in ["비견", "겁재"]:
                sibsung_count["비겁"] += 1
            elif sibsung in ["식신", "상관"]:
                sibsung_count["식상"] += 1
            elif sibsung in ["편재", "정재"]:
                sibsung_count["재성"] += 1
            elif sibsung in ["편관", "정관"]:
                sibsung_count["관성"] += 1
            elif sibsung in ["편인", "정인"]:
                sibsung_count["인성"] += 1

    return sibsung_count


def tenGod(day_stem: str, target_stem: str) -> str:
    """십성 판단 (일간 기준)"""
    if not day_stem or not target_stem:
        return ""

    day_element = hanjaToElement(day_stem)
    target_element = hanjaToElement(target_stem)

    if day_element == "none" or target_element == "none":
        return ""

    # 음양 판단 (양: 甲丙戊庚壬, 음: 乙丁己辛癸)
    yang_stems = ["甲", "丙", "戊", "庚", "壬", "寅", "辰", "午", "申", "戌"]
    same_polarity = (day_stem in yang_stems) == (target_stem in yang_stems)

    # 십성 판단
    if day_element == target_element:
        return "비견" if same_polarity else "겁재"
    elif produces(day_element, target_element):
        return "식신" if same_polarity else "상관"
    elif produces(target_element, day_element):
        return "편인" if same_polarity else "정인"
    elif controls(day_element, target_element):
        return "편재" if same_polarity else "정재"
    elif controls(target_element, day_element):
        return "편관" if same_polarity else "정관"

    return ""
