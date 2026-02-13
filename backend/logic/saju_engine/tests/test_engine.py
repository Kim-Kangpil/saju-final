#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
사주 엔진 테스트
"""

import sys
sys.path.append('/home/claude/saju-engine')

from core import analyze_full_saju, print_full_analysis
from interpretation import match_patterns

def test_engine():
    """강필님 사주로 전체 엔진 테스트"""
    
    print("="*70)
    print("사주 엔진 테스트")
    print("="*70)
    
    day_stem = '癸'
    pillars = {
        'year': '庚辰',
        'month': '乙酉',
        'day': '癸未',
        'hour': '庚申'
    }
    
    # 1. 분석
    print("\n[ 1단계: 분석 ]")
    analysis = analyze_full_saju(day_stem, pillars)
    print_full_analysis(analysis)
    
    # 2. 패턴 매칭
    print("\n\n[ 2단계: 패턴 매칭 ]")
    print("="*70)
    patterns = match_patterns(analysis)
    print(f"\n매칭된 패턴 ({len(patterns)}개):")
    for pattern in patterns:
        print(f"  ✓ {pattern}")
    
    print("\n\n" + "="*70)
    print("✅ 엔진 테스트 완료!")
    print("="*70)

if __name__ == "__main__":
    test_engine()
