#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
패턴 매칭 엔진
분석 결과 → 패턴 추출
"""

# =====================================================
# 패턴 정의
# =====================================================

def check_singang(analysis):
    """신강 여부"""
    return analysis['strength']['strength'] == '신강'

def check_sinyak(analysis):
    """신약 여부"""
    return analysis['strength']['strength'] == '신약'

def check_inseong_gwada(analysis):
    """인성 과다 (정인+편인 >= 3)"""
    ten_gods = analysis['summary']['ten_gods_count']
    inseong_count = ten_gods.get('정인', 0) + ten_gods.get('편인', 0)
    return inseong_count >= 3

def check_jaeseong_buhjae(analysis):
    """재성 부재 (정재+편재 == 0)"""
    ten_gods = analysis['summary']['ten_gods_count']
    jaeseong_count = ten_gods.get('정재', 0) + ten_gods.get('편재', 0)
    return jaeseong_count == 0

def check_siksang_buhjok(analysis):
    """식상 부족 (식신+상관 <= 1)"""
    ten_gods = analysis['summary']['ten_gods_count']
    siksang_count = ten_gods.get('식신', 0) + ten_gods.get('상관', 0)
    return siksang_count <= 1

def check_eulgyeong_hap(analysis):
    """을경합금 존재"""
    for item in analysis['harmony_clash']['cheongan_hap']:
        if '乙' in item['chars'] and '庚' in item['chars']:
            return True
    return False

def check_jinyoo_yukhap(analysis):
    """진유육합 존재"""
    for item in analysis['harmony_clash']['jiji_yukhap']:
        if '辰' in item['chars'] and '酉' in item['chars']:
            return True
    return False

def check_hwagae_ilji(analysis):
    """화개살이 일지에 존재"""
    for item in analysis['sinsal']['hwagae']:
        if '일지' in item['position']:
            return True
    return False

# =====================================================
# 패턴 매칭 메인 함수
# =====================================================

PATTERN_CHECKERS = {
    # 신강약
    '신강': check_singang,
    '신약': check_sinyak,
    
    # 십성
    '인성과다': check_inseong_gwada,
    '재성부재': check_jaeseong_buhjae,
    '식상부족': check_siksang_buhjok,
    
    # 합충
    '을경합금': check_eulgyeong_hap,
    '진유육합': check_jinyoo_yukhap,
    
    # 신살
    '화개살_일지': check_hwagae_ilji,
}

def match_patterns(analysis_result):
    """
    분석 결과에서 패턴 추출
    
    Args:
        analysis_result: full_saju_engine의 출력
    
    Returns:
        매칭된 패턴 리스트
    """
    matched_patterns = []
    
    for pattern_name, checker in PATTERN_CHECKERS.items():
        if checker(analysis_result):
            matched_patterns.append(pattern_name)
    
    # 조합 패턴 생성
    if '신강' in matched_patterns and '인성과다' in matched_patterns:
        matched_patterns.append('신강_인성과다')
    
    if '신강' in matched_patterns and '재성부재' in matched_patterns:
        matched_patterns.append('신강_재성부재')
    
    if '인성과다' in matched_patterns and '식상부족' in matched_patterns:
        matched_patterns.append('인성과다_식상부족')
    
    if '을경합금' in matched_patterns and '진유육합' in matched_patterns:
        matched_patterns.append('천지동합')
    
    return matched_patterns


# =====================================================
# 테스트
# =====================================================

if __name__ == "__main__":
    import sys
    sys.path.append('/home/claude/saju-engine')
    from core.analyzer import analyze_full_saju
    
    day_stem = '癸'
    pillars = {
        'year': '庚辰',
        'month': '乙酉',
        'day': '癸未',
        'hour': '庚申'
    }
    
    result = analyze_full_saju(day_stem, pillars)
    patterns = match_patterns(result)
    
    print("="*60)
    print("패턴 매칭 결과")
    print("="*60)
    print(f"\n매칭된 패턴 ({len(patterns)}개):")
    for pattern in patterns:
        print(f"  ✓ {pattern}")
