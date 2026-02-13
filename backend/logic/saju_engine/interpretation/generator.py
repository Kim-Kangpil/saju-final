#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
사주 해석 생성기
"""

from .templates.section01_elements import render_section1
from .pattern_matcher import match_patterns


class InterpretationGenerator:
    """사주 해석 생성기"""

    def __init__(self):
        self.sections = {
            1: render_section1,
            # 2: render_section2,  # 나중에 추가
            # 3: render_section3,
            # ...
        }

    def generate(self, analysis, tone='empathy', sections=None):
        """
        해석 생성

        Args:
            analysis: core.analyzer.analyze_full_saju()의 출력
            tone: 'empathy' | 'reality' | 'fun'
            sections: 생성할 섹션 ID 리스트 (None이면 전체)

        Returns:
            [
                {'section_id': 1, 'title': '...', 'content': '...'},
                {'section_id': 2, 'title': '...', 'content': '...'},
                ...
            ]
        """

        # 패턴 매칭 추가
        patterns = match_patterns(analysis)
        analysis['patterns'] = patterns

        # 섹션 선택
        if sections is None:
            sections = list(self.sections.keys())

        # 해석 생성
        results = []
        for section_id in sections:
            if section_id in self.sections:
                renderer = self.sections[section_id]
                result = renderer(analysis, tone=tone)
                results.append(result)

        return results

    def generate_all_tones(self, analysis, sections=None):
        """
        모든 톤 생성

        Returns:
            {
                'empathy': [...],
                'reality': [...],
                'fun': [...]
            }
        """
        return {
            'empathy': self.generate(analysis, tone='empathy', sections=sections),
            'reality': self.generate(analysis, tone='reality', sections=sections),
            'fun': self.generate(analysis, tone='fun', sections=sections)
        }


def main():
    """테스트"""
    import sys
    sys.path.append('/home/claude/saju-engine')
    from ..core.analyzer import analyze_full_saju

    print("="*70)
    print("사주 해석 생성 시스템 테스트")
    print("="*70)

    # 1. 분석
    day_stem = '癸'
    pillars = {
        'year': '庚辰',
        'month': '乙酉',
        'day': '癸未',
        'hour': '庚申'
    }

    print(
        f"\n사주: {pillars['year']} {pillars['month']} {pillars['day']} {pillars['hour']}")
    print(f"일간: {day_stem}")

    analysis = analyze_full_saju(day_stem, pillars)

    # 2. 해석 생성
    generator = InterpretationGenerator()

    # EMPATHY 톤만 테스트
    print("\n" + "─"*70)
    print("[ EMPATHY 톤 해석 ]")
    print("─"*70)

    interpretations = generator.generate(analysis, tone='empathy')

    for interp in interpretations:
        print(f"\n섹션 {interp['section_id']}: {interp['title']}")
        print(f"글자수: {len(interp['content'])}자")
        print(f"내용 미리보기:\n{interp['content'][:200]}...\n")

    # 3. 모든 톤 생성
    print("\n" + "─"*70)
    print("[ 모든 톤 글자수 ]")
    print("─"*70)

    all_tones = generator.generate_all_tones(analysis)

    for tone_name, sections in all_tones.items():
        for section in sections:
            print(
                f"{tone_name.upper():8s} - 섹션{section['section_id']}: {len(section['content']):4d}자")

    print("\n" + "="*70)
    print("✅ 해석 생성 완료!")
    print("="*70)


if __name__ == "__main__":
    main()
