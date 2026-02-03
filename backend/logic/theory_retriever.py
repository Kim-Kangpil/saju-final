#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
사주 이론 검색 시스템 (RAG)
"""

import os
from pathlib import Path


class TheoryRetriever:
    """사주 이론 검색기"""

    def __init__(self, theory_dir=None):
        if theory_dir is None:
            # backend/theories 경로로 설정 (logic 폴더 기준 상위)
            theory_dir = Path(__file__).parent / "theories"

        self.theory_dir = theory_dir

        if not os.path.exists(self.theory_dir):
            print(f"⚠️  theories 폴더가 없습니다: {self.theory_dir}")
            print(f"💡 이론 없이 GPT 기본 해석으로 진행합니다.")
            self.theories = {}
        else:
            self.theories = self._load_all_theories()

    def _load_all_theories(self):
        """모든 이론 파일 로드"""
        theories = {}

        # 실제 파일명으로 매핑
        theory_files = {
            '신강약': '사주이론(신강 신약).txt',
            '오행십신': '사주이론(오행, 육친과 십신).txt',
            '천간': '사주이론(천간).txt',
            '지지': '사주이론(지지).txt',
            '천간합': '사주이론(천간합).txt',
            '천간충': '사주이론(천간합,충).txt',
            '지지합': '사주이론(지지합).txt',
            '지지충': '사주이론(지지충).txt',
            '귀인신살': '사주이론(각종귀인,신살).txt',
            '십이운성': '사주이론(십이운성).txt',
            '통근투출': '사주이론(통근과투출).txt',
            '기본구성': '사주이론(기본사주 구성).txt',
        }

        for key, filename in theory_files.items():
            filepath = os.path.join(self.theory_dir, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    theories[key] = f.read()
                print(f"✅ {key} 이론 로드: {len(theories[key])}자")
            except Exception as e:
                print(f"⚠️ {key} 이론 파일 로드 실패: {e}")
                theories[key] = ""

        return theories

    def search_theories(self, day_stem, pillars, element_counts):
        """
        오행 분석을 위한 이론 검색

        Args:
            day_stem: 일간 (예: '甲')
            pillars: 사주 pillar dict
            element_counts: 오행 카운트 dict

        Returns:
            str: 관련 이론 텍스트
        """
        if not self.theories or all(not v for v in self.theories.values()):
            return ""

        relevant = []

        # 1. 신강약 이론 (필수)
        if self.theories.get('신강약'):
            relevant.append(f"## 신강약 이론\n\n{self.theories['신강약'][:3000]}")

        # 2. 오행/십신 이론 (필수)
        if self.theories.get('오행십신'):
            relevant.append(f"## 오행과 십신 이론\n\n{self.theories['오행십신'][:4000]}")

        # 3. 기본구성 이론
        if self.theories.get('기본구성'):
            relevant.append(f"## 기본 구성\n\n{self.theories['기본구성'][:2000]}")

        # 조합해서 반환
        if not relevant:
            return ""

        combined = "\n\n---\n\n".join(relevant)

        # 토큰 제한 (GPT-4 context window 고려)
        if len(combined) > 15000:
            combined = combined[:15000] + "\n\n... (이하 생략)"

        return combined

    def get_relevant_theories(self, analysis):
        """
        분석 결과에 맞는 이론 추출

        Args:
            analysis: analyze_full_saju 결과

        Returns:
            str: 관련 이론들을 조합한 텍스트
        """
        if not self.theories or all(not v for v in self.theories.values()):
            return ""

        relevant = []

        # 1. 신강약 이론 (필수)
        if self.theories.get('신강약'):
            relevant.append(f"## 신강약 이론\n\n{self.theories['신강약'][:3000]}")

        # 2. 오행/십신 이론 (필수)
        if self.theories.get('오행십신'):
            relevant.append(f"## 오행과 십신 이론\n\n{self.theories['오행십신'][:4000]}")

        # 3. 패턴별 이론
        patterns = analysis.get('patterns', [])

        # 천간합/충
        if any('천간합' in str(p) or '천간충' in str(p) for p in patterns):
            if self.theories.get('천간합'):
                relevant.append(f"## 천간합 이론\n\n{self.theories['천간합'][:2000]}")
            if self.theories.get('천간충'):
                relevant.append(f"## 천간충 이론\n\n{self.theories['천간충'][:2000]}")

        # 지지합/충
        if any('육합' in str(p) or '삼합' in str(p) or '방합' in str(p) for p in patterns):
            if self.theories.get('지지합'):
                relevant.append(f"## 지지합 이론\n\n{self.theories['지지합'][:2000]}")

        if any('충' in str(p) or '형' in str(p) or '해' in str(p) or '파' in str(p) for p in patterns):
            if self.theories.get('지지충'):
                relevant.append(f"## 지지충 이론\n\n{self.theories['지지충'][:2000]}")

        # 4. 귀인/신살 (있는 경우만)
        if any('도화' in str(p) or '역마' in str(p) or '화개' in str(p) or '귀인' in str(p) for p in patterns):
            if self.theories.get('귀인신살'):
                relevant.append(f"## 신살 이론\n\n{self.theories['귀인신살'][:3000]}")

        # 조합해서 반환
        if not relevant:
            return ""

        combined = "\n\n---\n\n".join(relevant)

        # 토큰 제한
        if len(combined) > 15000:
            combined = combined[:15000] + "\n\n... (이하 생략)"

        return combined


def test_retriever():
    """테스트"""
    retriever = TheoryRetriever()

    # 테스트용 분석 결과
    test_analysis = {
        'summary': {
            'strength': '신강',
            'strength_score': 60
        },
        'patterns': ['신강', '인성과다', '천간합', '육합']
    }

    theories = retriever.get_relevant_theories(test_analysis)
    print("\n" + "="*70)
    print("추출된 이론:")
    print("="*70)
    print(f"총 {len(theories)}자")
    if theories:
        print(theories[:500])
        print("...")
    else:
        print("⚠️ 이론 파일이 없습니다. theories 폴더에 파일을 넣어주세요.")


if __name__ == "__main__":
    test_retriever()
