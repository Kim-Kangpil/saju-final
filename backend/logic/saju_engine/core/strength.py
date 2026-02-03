#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
신강약 판별 로직 (점수화 방식)
강필님 제공 자료 기반
"""

from .ten_gods import calculate_ten_god, get_element

# =====================================================
# 점수 기준 (자료 기반)
# =====================================================

SCORE_TABLE = {
    "년간": 8,
    "년지": 8,
    "월간": 12,
    "월지": 25,  # 가장 중요!
    "일간": 0,   # 기준점이므로 계산 안 함
    "일지": 20,  # 두 번째로 중요
    "시간": 12,
    "시지": 15
}

# =====================================================
# 신강약 판별 함수
# =====================================================

def calculate_strength_score(day_stem, pillars):
    """
    신강약 점수 계산
    
    Args:
        day_stem: 일간 (예: '癸')
        pillars: {
            'year': '庚辰',
            'month': '乙酉',
            'day': '癸未',
            'hour': '庚申'
        }
    
    Returns:
        {
            'total_score': 점수 합계,
            'strength': '신강' | '중화' | '신약',
            'details': 각 자리별 점수 상세,
            'deukryeong': True/False (월지 득령 여부),
            'deukji': True/False (일지 득지 여부),
            'deukse': True/False (세력 득세 여부)
        }
    """
    
    # 각 자리 분해
    positions = {
        '년간': pillars['year'][0],
        '년지': pillars['year'][1],
        '월간': pillars['month'][0],
        '월지': pillars['month'][1],
        '일간': day_stem,
        '일지': pillars['day'][1],
        '시간': pillars['hour'][0],
        '시지': pillars['hour'][1]
    }
    
    total_score = 0
    details = {}
    
    # 인성·비겁 카운트 (득세 판별용)
    inseong_bigap_count = 0
    siksang_jaeseong_gwanseong_count = 0
    
    for pos, char in positions.items():
        if pos == '일간':
            continue  # 일간은 기준이므로 점수 계산 안 함
        
        ten_god = calculate_ten_god(day_stem, char)
        score_base = SCORE_TABLE[pos]
        
        # 인성·비겁이면 +점수, 식상·재성·관성이면 0점
        if ten_god in ['정인', '편인', '비견', '겁재']:
            score = score_base
            inseong_bigap_count += 1
        elif ten_god in ['식신', '상관', '정재', '편재', '정관', '편관']:
            score = 0  # 마이너스 아님! 0점!
            siksang_jaeseong_gwanseong_count += 1
        else:
            score = 0
        
        total_score += score
        
        details[pos] = {
            'char': char,
            'ten_god': ten_god,
            'score': score
        }
    
    # 득령·득지·득세 판별
    deukryeong = details['월지']['ten_god'] in ['정인', '편인', '비견', '겁재']
    deukji = details['일지']['ten_god'] in ['정인', '편인', '비견', '겁재']
    
    # 득세: 인성·비겁이 절반 이상
    total_positions = inseong_bigap_count + siksang_jaeseong_gwanseong_count
    deukse = inseong_bigap_count >= (total_positions / 2) if total_positions > 0 else False
    
    # 신강·신약 판단
    # 100점 만점 기준 (인성·비겁만 점수를 줌)
    if total_score >= 60:
        strength = '신강'
    elif total_score >= 40:
        strength = '중화'
    else:
        strength = '신약'
    
    return {
        'total_score': total_score,
        'strength': strength,
        'details': details,
        'deukryeong': deukryeong,
        'deukji': deukji,
        'deukse': deukse,
        'inseong_bigap_count': inseong_bigap_count,
        'siksang_count': siksang_jaeseong_gwanseong_count
    }


# =====================================================
# 득령·득지·득세 조합 분석
# =====================================================

def analyze_strength_combination(deukryeong, deukji, deukse):
    """
    득령·득지·득세 조합으로 신강약 판별
    
    Args:
        deukryeong: 득령 여부 (bool)
        deukji: 득지 여부 (bool)
        deukse: 득세 여부 (bool)
    
    Returns:
        판단 결과 문자열
    """
    
    combinations = {
        (True, True, True): "신강 (가장 강함)",
        (True, True, False): "신강 (월지·일지 영향 큼)",
        (True, False, True): "신강 (월지와 세력 우세)",
        (True, False, False): "중화 또는 약한 신강",
        (False, True, True): "중화 또는 약한 신강",
        (False, True, False): "신약 (월지 부재, 세력 약함)",
        (False, False, True): "신약 (월지·일지 부재)",
        (False, False, False): "신약 (가장 약함, 극신약)"
    }
    
    return combinations.get((deukryeong, deukji, deukse), "판단 불가")


# =====================================================
# 테스트: 강필님 사주
# =====================================================

def test_strength_analysis():
    """강필님 사주 신강약 분석"""
    
    day_stem = '癸'
    pillars = {
        'year': '庚辰',
        'month': '乙酉',
        'day': '癸未',
        'hour': '庚申'
    }
    
    print("="*60)
    print("신강약 판별 분석")
    print("="*60)
    print(f"사주: {pillars['year']} {pillars['month']} {pillars['day']} {pillars['hour']}")
    print(f"일간: {day_stem} (계수)")
    print("="*60)
    
    result = calculate_strength_score(day_stem, pillars)
    
    print("\n[점수 상세]")
    print("-"*60)
    for pos, info in result['details'].items():
        char = info['char']
        ten_god = info['ten_god']
        score = info['score']
        sign = "+" if score >= 0 else ""
        print(f"{pos}: {char} ({ten_god}) → {sign}{score}점")
    
    print("\n[득령·득지·득세]")
    print("-"*60)
    print(f"득령 (월지): {'O' if result['deukryeong'] else 'X'}")
    print(f"득지 (일지): {'O' if result['deukji'] else 'X'}")
    print(f"득세 (세력): {'O' if result['deukse'] else 'X'}")
    
    combination_result = analyze_strength_combination(
        result['deukryeong'],
        result['deukji'],
        result['deukse']
    )
    
    print(f"\n조합 판단: {combination_result}")
    
    print("\n[최종 결과]")
    print("-"*60)
    print(f"총점: {result['total_score']}점")
    print(f"판단: {result['strength']}")
    
    print("\n[통계]")
    print("-"*60)
    print(f"인성·비겁: {result['inseong_bigap_count']}개")
    print(f"식상·재성·관성: {result['siksang_count']}개")
    
    # 해석
    print("\n[해석]")
    print("-"*60)
    if result['strength'] == '신강':
        print("✅ 신강: 에너지 공급이 충분함")
        print("   → 식상·재성·관성 운이 유리")
        print("   → 활동적이고 적극적인 삶 권장")
    elif result['strength'] == '신약':
        print("✅ 신약: 에너지 소모가 우세함")
        print("   → 인성·비겁 운이 유리")
        print("   → 휴식과 보충이 필요, 무리한 활동 지양")
    else:
        print("✅ 중화: 에너지 균형이 적절함")
        print("   → 가장 이상적인 상태")
        print("   → 대운에 따라 유연하게 대응")


if __name__ == "__main__":
    test_strength_analysis()
