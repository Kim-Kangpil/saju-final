#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
올바른 십성 계산 로직 (체용반대 규칙 적용)
"""

# =====================================================
# 기본 데이터
# =====================================================

# 천간 음양
HEAVENLY_STEM_POLARITY = {
    '甲': 'yang', '乙': 'yin',
    '丙': 'yang', '丁': 'yin',
    '戊': 'yang', '己': 'yin',
    '庚': 'yang', '辛': 'yin',
    '壬': 'yang', '癸': 'yin'
}

# 지지 음양 (기본)
EARTHLY_BRANCH_POLARITY_BASE = {
    '子': 'yang', '丑': 'yin',
    '寅': 'yang', '卯': 'yin',
    '辰': 'yang', '巳': 'yin',
    '午': 'yang', '未': 'yin',
    '申': 'yang', '酉': 'yin',
    '戌': 'yang', '亥': 'yin'
}

# ⭐ 체용반대(體用反對) 예외 규칙
SPECIAL_POLARITY_REVERSE = {
    '午': 'yin',  # 양지 → 음으로 취급
    '巳': 'yang', # 음지 → 양으로 취급
    '子': 'yin',  # 양지 → 음으로 취급
    '亥': 'yang'  # 음지 → 양으로 취급
}

# 오행
ELEMENT_MAP = {
    '甲': 'wood', '乙': 'wood', '寅': 'wood', '卯': 'wood',
    '丙': 'fire', '丁': 'fire', '巳': 'fire', '午': 'fire',
    '戊': 'earth', '己': 'earth', '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
    '庚': 'metal', '辛': 'metal', '申': 'metal', '酉': 'metal',
    '壬': 'water', '癸': 'water', '子': 'water', '亥': 'water'
}

# 오행 상생상극
PRODUCES = {
    'wood': 'fire',
    'fire': 'earth',
    'earth': 'metal',
    'metal': 'water',
    'water': 'wood'
}

CONTROLS = {
    'wood': 'earth',
    'fire': 'metal',
    'earth': 'water',
    'metal': 'wood',
    'water': 'fire'
}

# =====================================================
# 십성 계산 함수
# =====================================================

def get_polarity(char):
    """
    음양 판별 (체용반대 규칙 적용)
    """
    # 천간인 경우
    if char in HEAVENLY_STEM_POLARITY:
        return HEAVENLY_STEM_POLARITY[char]
    
    # 지지인 경우 - 체용반대 우선 확인
    if char in SPECIAL_POLARITY_REVERSE:
        return SPECIAL_POLARITY_REVERSE[char]
    
    # 일반 지지
    if char in EARTHLY_BRANCH_POLARITY_BASE:
        return EARTHLY_BRANCH_POLARITY_BASE[char]
    
    return None


def get_element(char):
    """오행 판별"""
    return ELEMENT_MAP.get(char)


def calculate_ten_god(day_stem, target_char):
    """
    십성 계산 (체용반대 규칙 적용)
    
    Args:
        day_stem: 일간 (천간)
        target_char: 대상 글자 (천간 또는 지지)
    
    Returns:
        십성 이름 (비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인)
    """
    day_element = get_element(day_stem)
    target_element = get_element(target_char)
    
    if not day_element or not target_element:
        return "알 수 없음"
    
    # ⭐ 체용반대 규칙 적용한 음양 판별
    day_polarity = get_polarity(day_stem)
    target_polarity = get_polarity(target_char)
    
    same_polarity = (day_polarity == target_polarity)
    
    # 십성 결정
    if day_element == target_element:
        # 같은 오행
        return "비견" if same_polarity else "겁재"
    
    elif PRODUCES[day_element] == target_element:
        # 일간이 생하는 오행 (식상)
        return "식신" if same_polarity else "상관"
    
    elif PRODUCES[target_element] == day_element:
        # 일간을 생하는 오행 (인성)
        return "정인" if not same_polarity else "편인"
    
    elif CONTROLS[day_element] == target_element:
        # 일간이 극하는 오행 (재성)
        return "편재" if same_polarity else "정재"
    
    elif CONTROLS[target_element] == day_element:
        # 일간을 극하는 오행 (관성)
        return "편관" if same_polarity else "정관"
    
    return "알 수 없음"


# =====================================================
# 테스트: 癸水 일간
# =====================================================

def test_guisu():
    """癸水 일간 십성 테스트"""
    
    day_stem = '癸'
    
    print("="*60)
    print("십성 계산 테스트 (체용반대 규칙 적용)")
    print("="*60)
    print(f"일간: {day_stem} (계수, 음)")
    print("="*60)
    
    # 테스트 케이스
    test_cases = [
        ('甲', 'wood', 'yang', '상관'),
        ('乙', 'wood', 'yin', '식신'),
        ('丙', 'fire', 'yang', '정재'),
        ('丁', 'fire', 'yin', '편재'),
        ('庚', 'metal', 'yang', '정인'),
        ('辛', 'metal', 'yin', '편인'),
        ('寅', 'wood', 'yang', '상관'),
        ('卯', 'wood', 'yin', '식신'),
        ('巳', 'fire', 'yang(체용반대)', '정재'),
        ('午', 'fire', 'yin(체용반대)', '편재'),
        ('子', 'water', 'yin(체용반대)', '비견'),
        ('亥', 'water', 'yang(체용반대)', '겁재'),
        ('申', 'metal', 'yang', '정인'),
        ('酉', 'metal', 'yin', '편인'),
    ]
    
    print("\n천간 테스트:")
    print("-"*60)
    for char, element, polarity, expected in test_cases[:6]:
        result = calculate_ten_god(day_stem, char)
        status = "✅" if result == expected else "❌"
        actual_pol = get_polarity(char)
        print(f"{status} {char}({element}, {polarity}) → {result} (예상: {expected})")
    
    print("\n지지 테스트 (일반):")
    print("-"*60)
    for char, element, polarity, expected in test_cases[6:8]:
        result = calculate_ten_god(day_stem, char)
        status = "✅" if result == expected else "❌"
        actual_pol = get_polarity(char)
        print(f"{status} {char}({element}, {polarity}) → {result} (예상: {expected})")
    
    print("\n지지 테스트 (체용반대 규칙 적용):")
    print("-"*60)
    for char, element, polarity, expected in test_cases[8:]:
        result = calculate_ten_god(day_stem, char)
        status = "✅" if result == expected else "❌"
        actual_pol = get_polarity(char)
        print(f"{status} {char}({element}, {polarity}) → {result} (예상: {expected})")


# =====================================================
# 실제 사주 테스트
# =====================================================

def test_actual_saju():
    """실제 사주 테스트: 庚辰 乙酉 癸未 庚申"""
    
    print("\n\n" + "="*60)
    print("실제 사주 십성 분석")
    print("="*60)
    print("사주: 庚辰 乙酉 癸未 庚申")
    print("일간: 癸 (계수)")
    print("="*60)
    
    day_stem = '癸'
    
    pillars = [
        ('년간', '庚'),
        ('년지', '辰'),
        ('월간', '乙'),
        ('월지', '酉'),
        ('일간', '癸'),
        ('일지', '未'),
        ('시간', '庚'),
        ('시지', '申'),
    ]
    
    print("\n십성 분포:")
    print("-"*60)
    
    ten_gods_count = {}
    
    for position, char in pillars:
        if position == '일간':
            print(f"{position}: {char} → (일간 자체)")
            continue
        
        ten_god = calculate_ten_god(day_stem, char)
        element = get_element(char)
        polarity = get_polarity(char)
        
        # 체용반대 표시
        is_special = char in SPECIAL_POLARITY_REVERSE
        special_mark = " ⭐체용반대" if is_special else ""
        
        print(f"{position}: {char}({element}, {polarity}{special_mark}) → {ten_god}")
        
        # 카운트
        ten_gods_count[ten_god] = ten_gods_count.get(ten_god, 0) + 1
    
    print("\n십성 통계:")
    print("-"*60)
    for tg, count in sorted(ten_gods_count.items(), key=lambda x: x[1], reverse=True):
        print(f"{tg}: {count}개")


if __name__ == "__main__":
    test_guisu()
    test_actual_saju()
