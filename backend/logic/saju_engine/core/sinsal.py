#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
신살 분석 엔진
주요 신살: 천을귀인, 도화살, 역마살, 월공, 문창귀인 등
"""

# =====================================================
# 신살 데이터
# =====================================================

# 천을귀인 (일간 기준)
CHEONUL_GWIIN = {
    '甲': ['丑', '未'],
    '乙': ['子', '申'],
    '丙': ['亥', '酉'],
    '丁': ['亥', '酉'],
    '戊': ['丑', '未'],
    '己': ['子', '申'],
    '庚': ['丑', '未'],
    '辛': ['寅', '午'],
    '壬': ['卯', '巳'],
    '癸': ['卯', '巳']
}

# 도화살 (일지/년지 기준)
DOHWA = {
    '子': '酉',
    '午': '卯',
    '卯': '子',
    '酉': '午',
    '寅': '亥',
    '申': '巳',
    '巳': '申',
    '亥': '寅',
    '辰': '酉',
    '戌': '卯',
    '丑': '午',
    '未': '子'
}

# 역마살 (년지 기준)
YEOKMA = {
    '子': '寅',
    '午': '申',
    '卯': '巳',
    '酉': '亥',
    '寅': '申',
    '申': '寅',
    '巳': '亥',
    '亥': '巳',
    '辰': '寅',
    '戌': '申',
    '丑': '亥',
    '未': '巳'
}

# 화개살 (일지/년지 기준)
HWAGAE = {
    '子': '辰',
    '午': '戌',
    '卯': '未',
    '酉': '丑',
    '寅': '戌',
    '申': '辰',
    '巳': '丑',
    '亥': '未',
    '辰': '辰',
    '戌': '戌',
    '丑': '丑',
    '未': '未'
}

# 월공 (월지 + 천간 조합)
WOLGONG = {
    '子': ['丙'],
    '丑': ['丙'],
    '寅': ['壬'],
    '卯': ['庚'],
    '辰': ['壬'],
    '巳': ['甲'],
    '午': ['壬'],
    '未': ['庚'],
    '申': ['丙'],
    '酉': ['甲'],
    '戌': ['壬'],
    '亥': ['庚']
}

# 문창귀인 (일간 기준)
MUNCHANG_GWIIN = {
    '甲': ['巳'],
    '乙': ['午'],
    '丙': ['申'],
    '丁': ['酉'],
    '戊': ['申'],
    '己': ['酉'],
    '庚': ['亥'],
    '辛': ['子'],
    '壬': ['寅'],
    '癸': ['卯']
}

# =====================================================
# 신살 분석 함수
# =====================================================

def analyze_sinsal(day_stem, pillars):
    """
    신살 분석
    
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
            'cheonul_gwiin': [...],
            'dohwa': [...],
            'yeokma': [...],
            'hwagae': [...],
            'wolgong': [...],
            'munchang_gwiin': [...]
        }
    """
    
    # 분해
    stems = [
        pillars['year'][0],
        pillars['month'][0],
        pillars['day'][0],
        pillars['hour'][0]
    ]
    
    branches = [
        pillars['year'][1],
        pillars['month'][1],
        pillars['day'][1],
        pillars['hour'][1]
    ]
    
    year_branch = pillars['year'][1]
    month_branch = pillars['month'][1]
    day_branch = pillars['day'][1]
    
    positions = ['년', '월', '일', '시']
    
    result = {
        'cheonul_gwiin': [],
        'dohwa': [],
        'yeokma': [],
        'hwagae': [],
        'wolgong': [],
        'munchang_gwiin': []
    }
    
    # 1. 천을귀인 (일간 기준)
    gwiin_branches = CHEONUL_GWIIN.get(day_stem, [])
    for i, branch in enumerate(branches):
        if branch in gwiin_branches:
            result['cheonul_gwiin'].append({
                'position': f"{positions[i]}지",
                'char': branch,
                'description': f"천을귀인 ({positions[i]}지 {branch})"
            })
    
    # 2. 도화살 (일지 기준)
    dohwa_branch = DOHWA.get(day_branch)
    if dohwa_branch:
        for i, branch in enumerate(branches):
            if branch == dohwa_branch:
                result['dohwa'].append({
                    'position': f"{positions[i]}지",
                    'char': branch,
                    'description': f"도화살 ({positions[i]}지 {branch})"
                })
    
    # 3. 역마살 (년지 기준)
    yeokma_branch = YEOKMA.get(year_branch)
    if yeokma_branch:
        for i, branch in enumerate(branches):
            if branch == yeokma_branch:
                result['yeokma'].append({
                    'position': f"{positions[i]}지",
                    'char': branch,
                    'description': f"역마살 ({positions[i]}지 {branch})"
                })
    
    # 4. 화개살 (일지 기준)
    hwagae_branch = HWAGAE.get(day_branch)
    if hwagae_branch:
        for i, branch in enumerate(branches):
            if branch == hwagae_branch:
                result['hwagae'].append({
                    'position': f"{positions[i]}지",
                    'char': branch,
                    'description': f"화개살 ({positions[i]}지 {branch})"
                })
    
    # 5. 월공 (월지 + 천간 조합)
    wolgong_stems = WOLGONG.get(month_branch, [])
    for i, stem in enumerate(stems):
        if stem in wolgong_stems:
            result['wolgong'].append({
                'position': f"{positions[i]}간",
                'char': stem,
                'description': f"월공 (월지 {month_branch} + {positions[i]}간 {stem})"
            })
    
    # 6. 문창귀인 (일간 기준)
    munchang_branches = MUNCHANG_GWIIN.get(day_stem, [])
    for i, branch in enumerate(branches):
        if branch in munchang_branches:
            result['munchang_gwiin'].append({
                'position': f"{positions[i]}지",
                'char': branch,
                'description': f"문창귀인 ({positions[i]}지 {branch})"
            })
    
    return result


# =====================================================
# 테스트
# =====================================================

def test_sinsal():
    """강필님 사주 테스트"""
    
    day_stem = '癸'
    pillars = {
        'year': '庚辰',
        'month': '乙酉',
        'day': '癸未',
        'hour': '庚申'
    }
    
    print("="*60)
    print("신살 분석")
    print("="*60)
    print(f"사주: {pillars['year']} {pillars['month']} {pillars['day']} {pillars['hour']}")
    print(f"일간: {day_stem} (계수)")
    print("="*60)
    
    result = analyze_sinsal(day_stem, pillars)
    
    print("\n[천을귀인] - 하늘의 은덕, 고결한 품성, 재난 보호")
    if result['cheonul_gwiin']:
        for item in result['cheonul_gwiin']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n[도화살] - 이성 매력, 예술적 감각, 인기")
    if result['dohwa']:
        for item in result['dohwa']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n[역마살] - 이동, 변화, 활동성")
    if result['yeokma']:
        for item in result['yeokma']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n[화개살] - 종교, 철학, 예술, 고독")
    if result['hwagae']:
        for item in result['hwagae']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n[월공] - 주목, 인기, 대중성")
    if result['wolgong']:
        for item in result['wolgong']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n[문창귀인] - 학문, 문장력, 창의성")
    if result['munchang_gwiin']:
        for item in result['munchang_gwiin']:
            print(f"  ✓ {item['description']}")
    else:
        print("  (없음)")
    
    print("\n" + "="*60)
    print("요약")
    print("="*60)
    print(f"천을귀인: {len(result['cheonul_gwiin'])}개")
    print(f"도화살: {len(result['dohwa'])}개")
    print(f"역마살: {len(result['yeokma'])}개")
    print(f"화개살: {len(result['hwagae'])}개")
    print(f"월공: {len(result['wolgong'])}개")
    print(f"문창귀인: {len(result['munchang_gwiin'])}개")
    
    total = sum([
        len(result['cheonul_gwiin']),
        len(result['dohwa']),
        len(result['yeokma']),
        len(result['hwagae']),
        len(result['wolgong']),
        len(result['munchang_gwiin'])
    ])
    
    print(f"\n총 신살: {total}개")


if __name__ == "__main__":
    test_sinsal()
