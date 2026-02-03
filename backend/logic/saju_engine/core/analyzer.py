#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
완전한 사주 분석 통합 엔진
모든 사주에 대해 정확하고 빠짐없이 분석
"""

from .ten_gods import calculate_ten_god
from .strength import calculate_strength_score
from .harmony_clash import analyze_harmony_clash
from .sinsal import analyze_sinsal

# =====================================================
# 통합 분석 엔진
# =====================================================


def analyze_full_saju(day_stem, pillars):
    """
    완전한 사주 분석

    Args:
        day_stem: 일간 (예: '癸')
        pillars: {
            'year': '庚辰',
            'month': '乙酉',
            'day': '癸未',
            'hour': '庚申'
        }

    Returns:
        모든 분석 결과를 담은 딕셔너리
    """

    result = {
        'basic_info': {
            'day_stem': day_stem,
            'year': pillars['year'],
            'month': pillars['month'],
            'day': pillars['day'],
            'hour': pillars['hour']
        },
        'strength': None,
        'ten_gods': {},
        'harmony_clash': {},
        'sinsal': {},
        'summary': {}
    }

    # 1. 신강약 분석
    result['strength'] = calculate_strength_score(day_stem, pillars)

    # 2. 십성 분석
    chars = {
        '년간': pillars['year'][0],
        '년지': pillars['year'][1],
        '월간': pillars['month'][0],
        '월지': pillars['month'][1],
        '일간': day_stem,
        '일지': pillars['day'][1],
        '시간': pillars['hour'][0],
        '시지': pillars['hour'][1]
    }

    for pos, char in chars.items():
        if pos == '일간':
            continue
        result['ten_gods'][pos] = {
            'char': char,
            'ten_god': calculate_ten_god(day_stem, char)
        }

    # 3. 합충 분석
    result['harmony_clash'] = analyze_harmony_clash(pillars)

    # 4. 신살 분석
    result['sinsal'] = analyze_sinsal(day_stem, pillars)

    # ✅ 5. 오행 카운트 계산 (추가!)
    element_count = _calculate_element_count(pillars)

    # 6. 요약
    result['summary'] = {
        'strength': result['strength']['strength'],
        'strength_score': result['strength']['total_score'],
        'deukryeong': result['strength']['deukryeong'],
        'deukji': result['strength']['deukji'],
        'deukse': result['strength']['deukse'],
        'element_count': element_count,  # ✅ 추가!
        'ten_gods_count': {},
        'harmony_clash_count': {
            'cheongan_hap': len(result['harmony_clash']['cheongan_hap']),
            'cheongan_chung': len(result['harmony_clash']['cheongan_chung']),
            'jiji_yukhap': len(result['harmony_clash']['jiji_yukhap']),
            'jiji_samhap': len(result['harmony_clash']['jiji_samhap']),
            'jiji_banhap': len(result['harmony_clash']['jiji_banhap']),
            'jiji_chung': len(result['harmony_clash']['jiji_chung'])
        },
        'sinsal_count': {
            'cheonul_gwiin': len(result['sinsal']['cheonul_gwiin']),
            'dohwa': len(result['sinsal']['dohwa']),
            'yeokma': len(result['sinsal']['yeokma']),
            'hwagae': len(result['sinsal']['hwagae']),
            'wolgong': len(result['sinsal']['wolgong']),
            'munchang_gwiin': len(result['sinsal']['munchang_gwiin'])
        }
    }

    # 십성 카운트
    for info in result['ten_gods'].values():
        tg = info['ten_god']
        result['summary']['ten_gods_count'][tg] = result['summary']['ten_gods_count'].get(
            tg, 0) + 1

    # ✅ 7. 패턴 정리 (GPT가 사용)
    result['patterns'] = _extract_patterns(result)

    return result


# =====================================================
# ✅ 새로 추가: 오행 카운트 계산
# =====================================================

def _calculate_element_count(pillars):
    """사주 팔자에서 오행 카운트 계산"""
    element_map = {
        "甲": "wood", "乙": "wood",
        "丙": "fire", "丁": "fire",
        "戊": "earth", "己": "earth",
        "庚": "metal", "辛": "metal",
        "壬": "water", "癸": "water",
        "寅": "wood", "卯": "wood",
        "巳": "fire", "午": "fire",
        "辰": "earth", "戌": "earth", "丑": "earth", "未": "earth",
        "申": "metal", "酉": "metal",
        "子": "water", "亥": "water",
    }

    counts = {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0}

    for pillar in pillars.values():
        if pillar:
            for char in pillar:
                element = element_map.get(char)
                if element:
                    counts[element] += 1

    return counts


# =====================================================
# ✅ 새로 추가: 패턴 추출 (GPT용)
# =====================================================

def _extract_patterns(result):
    """GPT가 사용할 패턴 문자열 리스트 추출"""
    patterns = []

    # 합충 패턴
    hc = result['harmony_clash']

    for item in hc['cheongan_hap']:
        patterns.append(f"천간합: {item['description']}")

    for item in hc['jiji_yukhap']:
        patterns.append(f"지지육합: {item['description']}")

    for item in hc['jiji_samhap']:
        patterns.append(f"지지삼합: {item['description']}")

    for item in hc['jiji_banhap']:
        patterns.append(f"지지반합: {item['description']}")

    for item in hc['cheongan_chung']:
        patterns.append(f"천간충: {item['description']}")

    for item in hc['jiji_chung']:
        patterns.append(f"지지충: {item['description']}")

    # 신살 패턴
    ss = result['sinsal']

    for item in ss['cheonul_gwiin']:
        patterns.append(f"천을귀인: {item['description']}")

    for item in ss['dohwa']:
        patterns.append(f"도화살: {item['description']}")

    for item in ss['yeokma']:
        patterns.append(f"역마살: {item['description']}")

    for item in ss['hwagae']:
        patterns.append(f"화개살: {item['description']}")

    return patterns


# =====================================================
# 예쁜 출력 함수
# =====================================================

def print_full_analysis(result):
    """분석 결과 예쁘게 출력"""

    print("="*70)
    print("완전한 사주 분석 리포트")
    print("="*70)

    bi = result['basic_info']
    print(f"\n사주: {bi['year']} {bi['month']} {bi['day']} {bi['hour']}")
    print(f"일간: {bi['day_stem']}")

    # 1. 신강약
    print("\n" + "─"*70)
    print("[ 1. 신강약 분석 ]")
    print("─"*70)

    strength = result['strength']
    print(f"판정: {strength['strength']} ({strength['total_score']}/100점)")
    print(f"득령 (월지): {'O' if strength['deukryeong'] else 'X'}")
    print(f"득지 (일지): {'O' if strength['deukji'] else 'X'}")
    print(f"득세 (세력): {'O' if strength['deukse'] else 'X'}")

    print(f"\n점수 상세:")
    for pos, info in strength['details'].items():
        char = info['char']
        ten_god = info['ten_god']
        score = info['score']
        print(f"  {pos:4s}: {char} ({ten_god:4s}) → {score:+3d}점")

    # ✅ 1-1. 오행 분포 추가
    print("\n" + "─"*70)
    print("[ 1-1. 오행 분포 ]")
    print("─"*70)

    element_count = result['summary']['element_count']
    element_names = {
        'wood': '木(나무)', 'fire': '火(불)', 'earth': '土(흙)',
        'metal': '金(쇠)', 'water': '水(물)'
    }

    for element, name in element_names.items():
        count = element_count.get(element, 0)
        print(f"  {name}: {count}개")

    # 2. 십성 분포
    print("\n" + "─"*70)
    print("[ 2. 십성 분포 ]")
    print("─"*70)

    tg_count = result['summary']['ten_gods_count']
    for tg, count in sorted(tg_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  {tg}: {count}개")

    # 3. 합충
    print("\n" + "─"*70)
    print("[ 3. 합충 분석 ]")
    print("─"*70)

    hc = result['harmony_clash']

    if hc['cheongan_hap']:
        print("\n천간합:")
        for item in hc['cheongan_hap']:
            print(f"  ✓ {item['description']}")

    if hc['jiji_yukhap']:
        print("\n지지육합:")
        for item in hc['jiji_yukhap']:
            print(f"  ✓ {item['description']}")

    if hc['jiji_samhap']:
        print("\n지지삼합:")
        for item in hc['jiji_samhap']:
            print(f"  ✓ {item['description']}")

    if hc['jiji_banhap']:
        print("\n지지반합:")
        for item in hc['jiji_banhap']:
            print(f"  ✓ {item['description']}")

    if hc['cheongan_chung']:
        print("\n천간충:")
        for item in hc['cheongan_chung']:
            print(f"  ✓ {item['description']}")

    if hc['jiji_chung']:
        print("\n지지충:")
        for item in hc['jiji_chung']:
            print(f"  ✓ {item['description']}")

    if not any([hc['cheongan_hap'], hc['jiji_yukhap'], hc['jiji_samhap'],
                hc['jiji_banhap'], hc['cheongan_chung'], hc['jiji_chung']]):
        print("  (합충 없음)")

    # 4. 신살
    print("\n" + "─"*70)
    print("[ 4. 신살 분석 ]")
    print("─"*70)

    ss = result['sinsal']

    if ss['cheonul_gwiin']:
        print("\n천을귀인:")
        for item in ss['cheonul_gwiin']:
            print(f"  ✓ {item['description']}")

    if ss['dohwa']:
        print("\n도화살:")
        for item in ss['dohwa']:
            print(f"  ✓ {item['description']}")

    if ss['yeokma']:
        print("\n역마살:")
        for item in ss['yeokma']:
            print(f"  ✓ {item['description']}")

    if ss['hwagae']:
        print("\n화개살:")
        for item in ss['hwagae']:
            print(f"  ✓ {item['description']}")

    if ss['wolgong']:
        print("\n월공:")
        for item in ss['wolgong']:
            print(f"  ✓ {item['description']}")

    if ss['munchang_gwiin']:
        print("\n문창귀인:")
        for item in ss['munchang_gwiin']:
            print(f"  ✓ {item['description']}")

    if not any(ss.values()):
        print("  (신살 없음)")

    # 5. 요약
    print("\n" + "="*70)
    print("[ 요약 ]")
    print("="*70)

    summary = result['summary']
    print(f"\n신강약: {summary['strength']} ({summary['strength_score']}점)")
    print(f"오행: {sum(summary['element_count'].values())}개")
    print(f"십성: {len(summary['ten_gods_count'])}종류")
    print(f"합충: {sum(summary['harmony_clash_count'].values())}건")
    print(f"신살: {sum(summary['sinsal_count'].values())}개")

    print("\n" + "="*70)


# =====================================================
# 테스트
# =====================================================

def test_full_engine():
    """강필님 사주로 전체 엔진 테스트"""

    day_stem = '癸'
    pillars = {
        'year': '庚辰',
        'month': '乙酉',
        'day': '癸未',
        'hour': '庚申'
    }

    result = analyze_full_saju(day_stem, pillars)
    print_full_analysis(result)


if __name__ == "__main__":
    test_full_engine()
