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

    def get_theories_by_query(self, query: str, max_chars: int = 12000) -> str:
        """
        질문 키워드 기반으로 관련 이론 txt 검색 (채팅 RAG용).

        Args:
            query: 사용자 질문 텍스트
            max_chars: 반환 문자열 최대 길이

        Returns:
            str: 질문과 관련된 이론들을 조합한 텍스트
        """
        if not self.theories or all(not v for v in self.theories.values()):
            return ""

        query_lower = (query or "").strip().lower()
        # 키워드 → 이론 키 매핑 (질문에 포함되면 해당 이론 포함)
        keyword_to_keys = {
            "신강": ["신강약"],
            "신약": ["신강약"],
            "강약": ["신강약"],
            "오행": ["오행십신"],
            "십신": ["오행십신"],
            "십성": ["오행십신"],
            "육친": ["오행십신"],
            "천간": ["천간", "천간합", "천간충"],
            "지지": ["지지", "지지합", "지지충"],
            "천간합": ["천간합"],
            "천간충": ["천간충"],
            "지지합": ["지지합"],
            "육합": ["지지합"],
            "삼합": ["지지합"],
            "방합": ["지지합"],
            "지지충": ["지지충"],
            "충": ["천간충", "지지충"],
            "귀인": ["귀인신살"],
            "신살": ["귀인신살"],
            "도화": ["귀인신살"],
            "역마": ["귀인신살"],
            "십이운성": ["십이운성"],
            "장생": ["십이운성"],
            "목욕": ["십이운성"],
            "통근": ["통근투출"],
            "투출": ["통근투출"],
            "사주": ["기본구성"],
            "팔자": ["기본구성"],
            "년주": ["기본구성"],
            "월주": ["기본구성"],
            "일주": ["기본구성"],
            "시주": ["기본구성"],
        }
        # 한글 키워드도 검사 (query는 이미 전달됨)
        included_keys = set()
        for kw, keys in keyword_to_keys.items():
            if kw in query or kw in query_lower:
                included_keys.update(keys)
        # 기본으로 기본구성 + 오행십신 + 신강약 포함 (기본 상식)
        included_keys.add("기본구성")
        included_keys.add("오행십신")
        included_keys.add("신강약")

        relevant = []
        for key in ["기본구성", "신강약", "오행십신", "천간", "지지", "천간합", "천간충", "지지합", "지지충", "귀인신살", "십이운성", "통근투출"]:
            if key not in included_keys or not self.theories.get(key):
                continue
            content = (self.theories[key] or "").strip()
            if not content:
                continue
            cap = 4000 if key in ("오행십신", "신강약") else 2500
            relevant.append(f"## {key}\n\n{content[:cap]}")
            if len("\n\n---\n\n".join(relevant)) >= max_chars:
                break

        if not relevant:
            return ""

        combined = "\n\n---\n\n".join(relevant)
        if len(combined) > max_chars:
            combined = combined[:max_chars] + "\n\n... (이하 생략)"
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
