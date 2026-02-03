#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
완전한 합충 분석 엔진
- 천간합, 천간충
- 지지육합, 지지삼합, 지지반합, 지지충
- 형파해 제외
"""

# =====================================================
# 천간 합충 데이터
# =====================================================

CHEONGAN_HAP = {
    ('甲', '己'): '토',
    ('己', '甲'): '토',
    ('乙', '庚'): '금',
    ('庚', '乙'): '금',
    ('丙', '辛'): '수',
    ('辛', '丙'): '수',
    ('丁', '壬'): '목',
    ('壬', '丁'): '목',
    ('戊', '癸'): '화',
    ('癸', '戊'): '화'
}

CHEONGAN_CHUNG = [
    ('甲', '庚'), ('庚', '甲'),
    ('乙', '辛'), ('辛', '乙'),
    ('丙', '壬'), ('壬', '丙'),
    ('丁', '癸'), ('癸', '丁')
]

# =====================================================
# 지지 합충 데이터
# =====================================================

# 육합
JIJI_YUKHAP = [
    ('子', '丑'), ('丑', '子'),
    ('寅', '亥'), ('亥', '寅'),
    ('卯', '戌'), ('戌', '卯'),
    ('辰', '酉'), ('酉', '辰'),
    ('巳', '申'), ('申', '巳'),
    ('午', '未'), ('未', '午')
]

# 삼합
JIJI_SAMHAP = {
    '申子辰 수국': ['申', '子', '辰'],
    '寅午戌 화국': ['寅', '午', '戌'],
    '亥卯未 목국': ['亥', '卯', '未'],
    '巳酉丑 금국': ['巳', '酉', '丑']
}

# 반합 (삼합의 2개 조합)
JIJI_BANHAP = [
    ('申', '子'), ('子', '申'),
    ('子', '辰'), ('辰', '子'),
    ('申', '辰'), ('辰', '申'),
    ('寅', '午'), ('午', '寅'),
    ('午', '戌'), ('戌', '午'),
    ('寅', '戌'), ('戌', '寅'),
    ('亥', '卯'), ('卯', '亥'),
    ('卯', '未'), ('未', '卯'),
    ('亥', '未'), ('未', '亥'),
    ('巳', '酉'), ('酉', '巳'),
    ('酉', '丑'), ('丑', '酉'),
    ('巳', '丑'), ('丑', '巳')
]

# 충
JIJI_CHUNG = [
    ('子', '午'), ('午', '子'),
    ('丑', '未'), ('未', '丑'),
    ('寅', '申'), ('申', '寅'),
    ('卯', '酉'), ('酉', '卯'),
    ('辰', '戌'), ('戌', '辰'),
    ('巳', '亥'), ('亥', '巳')
]

# =====================================================
# 합충 분석 함수
# =====================================================

def analyze_harmony_clash(pillars):
    """
    완전한 합충 분석
    
    Args:
        pillars: {
            'year': '庚辰',
            'month': '乙酉',
            'day': '癸未',
            'hour': '庚申'
        }
    
    Returns:
        {
            'cheongan_hap': [...],
            'cheongan_chung': [...],
            'jiji_yukhap': [...],
            'jiji_samhap': [...],
            'jiji_banhap': [...],
            'jiji_chung': [...]
        }
    """
    
    # 분해
    stems = [
        pillars['year'][0],   # 년간
        pillars['month'][0],  # 월간
        pillars['day'][0],    # 일간
        pillars['hour'][0]    # 시간
    ]
    
    branches = [
        pillars['year'][1],   # 년지
        pillars['month'][1],  # 월지
        pillars['day'][1],    # 일지
        pillars['hour'][1]    # 시지
    ]
    
    positions = ['년', '월', '일', '시']
    
    result = {
        'cheongan_hap': [],
        'cheongan_chung': [],
        'jiji_yukhap': [],
        'jiji_samhap': [],
        'jiji_banhap': [],
        'jiji_chung': []
    }
    
    # 1. 천간합
    for i in range(len(stems)):
        for j in range(i+1, len(stems)):
            pair = (stems[i], stems[j])
            if pair in CHEONGAN_HAP:
                result['cheongan_hap'].append({
                    'position': f"{positions[i]}-{positions[j]}",
                    'chars': f"{stems[i]}{stems[j]}",
                    'element': CHEONGAN_HAP[pair],
                    'description': f"{positions[i]}간 {stems[i]} + {positions[j]}간 {stems[j]} → {CHEONGAN_HAP[pair]}화"
                })
    
    # 2. 천간충
    for i in range(len(stems)):
        for j in range(i+1, len(stems)):
            pair = (stems[i], stems[j])
            if pair in CHEONGAN_CHUNG:
                result['cheongan_chung'].append({
                    'position': f"{positions[i]}-{positions[j]}",
                    'chars': f"{stems[i]}{stems[j]}",
                    'description': f"{positions[i]}간 {stems[i]} + {positions[j]}간 {stems[j]} 충돌"
                })
    
    # 3. 지지육합
    for i in range(len(branches)):
        for j in range(i+1, len(branches)):
            pair = (branches[i], branches[j])
            if pair in JIJI_YUKHAP:
                result['jiji_yukhap'].append({
                    'position': f"{positions[i]}-{positions[j]}",
                    'chars': f"{branches[i]}{branches[j]}",
                    'description': f"{positions[i]}지 {branches[i]} + {positions[j]}지 {branches[j]} 육합"
                })
    
    # 4. 지지삼합
    for name, members in JIJI_SAMHAP.items():
        present = [br for br in branches if br in members]
        if len(present) >= 2:
            result['jiji_samhap'].append({
                'name': name,
                'chars': ', '.join(present),
                'count': len(present),
                'complete': len(present) == 3,
                'description': f"{name} ({'완전' if len(present) == 3 else '반합'}: {', '.join(present)})"
            })
    
    # 5. 지지반합
    for i in range(len(branches)):
        for j in range(i+1, len(branches)):
            pair = (branches[i], branches[j])
            if pair in JIJI_BANHAP:
                result['jiji_banhap'].append({
                    'position': f"{positions[i]}-{positions[j]}",
                    'chars': f"{branches[i]}{branches[j]}",
                    'description': f"{positions[i]}지 {branches[i]} + {positions[j]}지 {branches[j]} 반합"
                })
    
    # 6. 지지충
    for i in range(len(branches)):
        for j in range(i+1, len(branches)):
            pair = (branches[i], branches[j])
            if pair in JIJI_CHUNG:
                result['jiji_chung'].append({
                    'position': f"{positions[i]}-{positions[j]}",
                    'chars': f"{branches[i]}{branches[j]}",
                    'description': f"{positions[i]}지 {branches[i]} + {positions[j]}지 {branches[j]} 충돌"
                })
    
    return result


# =====================================================
# 테스트
# =====================================================

def test_harmony_clash():
    """강필님 사주 테스트"""
    
    pillars = {
        'year': '庚辰',
        'month': '乙酉',
        'day': '癸未',
        'hour': '庚申'
    }
    
    print("="*60)
    print("완전한 합충 분석 (형파해 제외)")
    print("="*60)
    print(f"사주: {pillars['year']} {pillars['month']} {pillars['day']} {pillars['hour']}")
    print("="*60)
    
    result = analyze_harmony_clash(pillars)
    
    print("\n[천간합]")
    if result['cheongan_hap']:
        for item in result['cheongan_hap']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n[천간충]")
    if result['cheongan_chung']:
        for item in result['cheongan_chung']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n[지지육합]")
    if result['jiji_yukhap']:
        for item in result['jiji_yukhap']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n[지지삼합]")
    if result['jiji_samhap']:
        for item in result['jiji_samhap']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n[지지반합]")
    if result['jiji_banhap']:
        for item in result['jiji_banhap']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n[지지충]")
    if result['jiji_chung']:
        for item in result['jiji_chung']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n" + "="*60)
    print("요약")
    print("="*60)
    print(f"천간합: {len(result['cheongan_hap'])}건")
    print(f"천간충: {len(result['cheongan_chung'])}건")
    print(f"지지육합: {len(result['jiji_yukhap'])}건")
    print(f"지지삼합: {len(result['jiji_samhap'])}건")
    print(f"지지반합: {len(result['jiji_banhap'])}건")
    print(f"지지충: {len(result['jiji_chung'])}건")


if __name__ == "__main__":
    test_harmony_clash()
