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

# 귀문관살 (지지 조합 - 서로 쌍이 되는 두 지지)
GUIMUN_PAIRS = {
    '子': '酉', '酉': '子',
    '丑': '午', '午': '丑',
    '寅': '未', '未': '寅',
    '卯': '申', '申': '卯',
    '辰': '亥', '亥': '辰',
    '巳': '戌', '戌': '巳',
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

# 홍염살 (紅豔殺) — 일간 기준 지지
# 이성 매력, 감성, 관계의 복잡성을 나타내는 신살 (도화와 유사하나 더 개인적·내면적)
HONGYEOM = {
    '甲': ['午'],
    '乙': ['午'],
    '丙': ['寅'],
    '丁': ['未'],
    '戊': ['辰'],
    '己': ['辰'],
    '庚': ['戌'],
    '辛': ['酉'],
    '壬': ['子'],
    '癸': ['申'],
}

# 학당귀인 (學堂貴人) — 일간 기준 지지
# 학문, 지혜, 교육적 재능을 나타내는 귀인 (문창귀인과 유사하나 더 깊이 있는 학문성)
HAKDANG = {
    '甲': ['亥'],
    '乙': ['午'],
    '丙': ['寅'],
    '丁': ['酉'],
    '戊': ['申'],
    '己': ['卯'],
    '庚': ['巳'],
    '辛': ['子'],
    '壬': ['寅'],
    '癸': ['卯'],
}

# 문창귀인 (일간 기준)
# ※ 이 표는 backend/logic/theories/사주이론(각종귀인,신살).txt 의
#    "문창귀인의 성립 조건" 절을 기준으로 정리된 매핑입니다.
MUNCHANG_GWIIN = {
    '甲': ['巳'],         # 甲, 乙 → 巳
    '乙': ['巳'],
    '丙': ['申'],         # 丙, 丁 → 申
    '丁': ['申'],
    '戊': ['申'],         # 戊       → 申
    '己': ['酉'],         # 己       → 酉
    '庚': ['亥'],         # 庚       → 亥
    '辛': ['子'],         # 辛       → 子
    '壬': ['寅'],         # 壬       → 寅
    '癸': ['卯']          # 癸       → 卯
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
        'munchang_gwiin': [],
        'guimun': [],
        'hongyeom': [],
        'hakdang': [],
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

    # 7. 귀문관살 (지지 조합 - 인접한 기둥 우선, 전체 조합 탐색)
    branch_pairs = [
        (0, 1, '년지', '월지'),
        (1, 2, '월지', '일지'),
        (2, 3, '일지', '시지'),
        (0, 2, '년지', '일지'),
        (1, 3, '월지', '시지'),
        (0, 3, '년지', '시지'),
    ]
    seen_guimun = set()
    for i, j, pos_i, pos_j in branch_pairs:
        b_i, b_j = branches[i], branches[j]
        pair_key = tuple(sorted([b_i, b_j]))
        if pair_key in seen_guimun:
            continue
        if GUIMUN_PAIRS.get(b_i) == b_j:
            seen_guimun.add(pair_key)
            result['guimun'].append({
                'positions': f"{pos_i}-{pos_j}",
                'chars': [b_i, b_j],
                'description': f"귀문관살 ({pos_i} {b_i} · {pos_j} {b_j})"
            })

    # 8. 홍염살 (일간 기준 지지)
    hongyeom_branches = HONGYEOM.get(day_stem, [])
    for i, branch in enumerate(branches):
        if branch in hongyeom_branches:
            result['hongyeom'].append({
                'position': f"{positions[i]}지",
                'char': branch,
                'description': f"홍염살 ({positions[i]}지 {branch})"
            })

    # 9. 학당귀인 (일간 기준 지지)
    hakdang_branches = HAKDANG.get(day_stem, [])
    for i, branch in enumerate(branches):
        if branch in hakdang_branches:
            result['hakdang'].append({
                'position': f"{positions[i]}지",
                'char': branch,
                'description': f"학당귀인 ({positions[i]}지 {branch})"
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
