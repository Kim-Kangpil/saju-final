#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GPT 기반 사주 해석 생성기
"""

import os
from typing import Dict, List, Tuple
from logic.theory_retriever import TheoryRetriever
import openai
from openai import OpenAI


class GPTInterpretationGenerator:
    """GPT 기반 해석 생성기"""

    def __init__(self, api_key=None):
        """
        Args:
            api_key: OpenAI API 키 (없으면 환경변수에서 로드)
        """
        if api_key:
            self.client = OpenAI(api_key=api_key)
        else:
            # 환경변수에서 로드
            api_key_env = os.getenv('OPENAI_API_KEY')
            if api_key_env:
                self.client = OpenAI(api_key=api_key_env)
            else:
                print("⚠️  OpenAI API 키가 없습니다. 폴백 모드로 작동합니다.")
                self.client = None

        self.retriever = TheoryRetriever()
        self.harmony_theories = self._load_harmony_theories()

    def _load_harmony_theories(self):
        """theories 폴더에서 합화 관련 이론 로드"""
        from pathlib import Path

        theories_dir = Path(__file__).parent / 'theories'

        theory_files = {
            '천간합': '사주이론(천간합).txt',
            '지지합': '사주이론(지지합).txt',
            '천간합충': '사주이론(천간합,충).txt',
        }

        harmony_theories = {}

        for key, filename in theory_files.items():
            file_path = theories_dir / filename
            try:
                if file_path.exists():
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read().strip()
                        harmony_theories[key] = content
                        print(f"✅ {key} 이론 로드: {len(content)}자")
                else:
                    print(f"⚠️  {filename} 파일 없음")
                    harmony_theories[key] = ""
            except Exception as e:
                print(f"❌ {key} 이론 로드 오류: {e}")
                harmony_theories[key] = ""

        return harmony_theories

    def _stem_to_element(self, stem):
        """천간 → 오행"""
        mapping = {
            '甲': 'wood', '乙': 'wood',
            '丙': 'fire', '丁': 'fire',
            '戊': 'earth', '己': 'earth',
            '庚': 'metal', '辛': 'metal',
            '壬': 'water', '癸': 'water',
        }
        return mapping.get(stem, 'none')

    def _branch_to_element(self, branch):
        """지지 → 오행"""
        mapping = {
            '子': 'water', '亥': 'water',
            '寅': 'wood', '卯': 'wood',
            '巳': 'fire', '午': 'fire',
            '申': 'metal', '酉': 'metal',
            '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
        }
        return mapping.get(branch, 'none')

    def _element_to_korean(self, element):
        """영어 오행명을 한글로 변환"""
        mapping = {
            'wood': '木',
            'fire': '火',
            'earth': '土',
            'metal': '金',
            'water': '水'
        }
        return mapping.get(element, element)

    def _check_transformation_condition(self, result_element: str, month_branch: str) -> bool:
        """합화 성립 조건 체크"""
        return True  # 기본적으로 합화 성립

    def _check_heavenly_harmony(self, heavenly_stems: List[str], earthly_branches: List[str]) -> List[Dict]:
        """천간합 체크 (이미 사용된 천간은 제외)"""
        transformations = []
        used_indices = set()

        harmony_rules = {
            ('甲', '己'): 'earth',
            ('乙', '庚'): 'metal',
            ('丙', '辛'): 'water',
            ('丁', '壬'): 'wood',
            ('戊', '癸'): 'fire'
        }

        print(f"🔍 천간합 체크 시작: {heavenly_stems}")

        for i in range(len(heavenly_stems)):
            if i in used_indices:
                continue
            stem1 = heavenly_stems[i]
            if not stem1:
                continue

            for j in range(i + 1, len(heavenly_stems)):
                if j in used_indices:
                    continue
                stem2 = heavenly_stems[j]
                if not stem2:
                    continue

                for (s1, s2), result_element in harmony_rules.items():
                    if (stem1 == s1 and stem2 == s2) or (stem1 == s2 and stem2 == s1):
                        month_branch = earthly_branches[1] if len(
                            earthly_branches) > 1 else ''
                        can_transform = self._check_transformation_condition(
                            result_element, month_branch)

                        if can_transform:
                            elem1 = self._stem_to_element(stem1)
                            elem2 = self._stem_to_element(stem2)
                            result_korean = self._element_to_korean(
                                result_element)
                            position_names = ['년', '월', '일', '시']

                            transformations.append({
                                'type': '천간합',
                                'name': f'{stem1}{stem2}합{result_korean}',
                                'stems': [stem1, stem2],
                                'positions': [position_names[i], position_names[j]],
                                'original_elements': [elem1, elem2],
                                'result': result_element,
                                'theory': self.harmony_theories.get('천간합', '')
                            })

                            used_indices.add(i)
                            used_indices.add(j)
                            print(
                                f"   ✅ {stem1}({position_names[i]}) + {stem2}({position_names[j]}) → {result_korean}")
                            break

                if i in used_indices:
                    break

        print(f"   📌 최종 사용된 인덱스: {used_indices}")
        return transformations

    def _check_earthly_harmony(self, earthly_branches: List[str]) -> List[Dict]:
        """지지합 체크 (육합 우선, 삼합 후순위, 이미 사용된 지지는 제외)"""
        transformations = []
        used_indices = set()  # 이미 합에 사용된 인덱스 추적

        # 지지육합 규칙
        liuhe_rules = {
            ('子', '丑'): 'earth',   # 자축합토
            ('寅', '亥'): 'wood',    # 인해합목
            ('卯', '戌'): 'fire',    # 묘술합화
            ('辰', '酉'): 'metal',   # 진유합금
            ('巳', '申'): 'water',   # 사신합수
            ('午', '未'): 'fire'     # 오미합화 (태양)
        }

        # 지지삼합 규칙
        sanhe_rules = {
            ('申', '子', '辰'): 'water',   # 신자진 삼합수국
            ('亥', '卯', '未'): 'wood',    # 해묘미 삼합목국
            ('寅', '午', '戌'): 'fire',    # 인오술 삼합화국
            ('巳', '酉', '丑'): 'metal'    # 사유축 삼합금국
        }

        position_names = ['년', '월', '일', '시']

        print(f"🔍 지지합 체크 시작: {earthly_branches}")

        # 1단계: 육합 우선 처리 (육합이 더 강력)
        print(f"   📌 1단계: 육합 체크")
        for i in range(len(earthly_branches)):
            if i in used_indices:
                continue
            branch1 = earthly_branches[i]
            if not branch1:
                continue

            for j in range(i + 1, len(earthly_branches)):
                if j in used_indices:
                    continue
                branch2 = earthly_branches[j]
                if not branch2:
                    continue

                # 정방향/역방향 모두 체크
                for (b1, b2), result_element in liuhe_rules.items():
                    if (branch1 == b1 and branch2 == b2) or (branch1 == b2 and branch2 == b1):
                        elem1 = self._branch_to_element(branch1)
                        elem2 = self._branch_to_element(branch2)
                        result_korean = self._element_to_korean(result_element)

                        transformations.append({
                            'type': '지지육합',
                            'name': f'{branch1}{branch2}합{result_korean}',
                            'branches': [branch1, branch2],
                            'positions': [position_names[i], position_names[j]],
                            'original_elements': [elem1, elem2],
                            'result': result_element,
                            'theory': self.harmony_theories.get('지지합', '')
                        })

                        used_indices.add(i)
                        used_indices.add(j)
                        print(
                            f"      ✅ 육합: {branch1}({position_names[i]}) + {branch2}({position_names[j]}) → {result_korean}")
                        break

                if i in used_indices:
                    break

        print(f"   📌 육합 후 사용된 인덱스: {used_indices}")

        # 2단계: 삼합 체크 (남은 지지로만)
        print(f"   📌 2단계: 삼합 체크")
        for (b1, b2, b3), result_element in sanhe_rules.items():
            # 세 지지가 모두 있는지 확인
            indices = []
            for i, branch in enumerate(earthly_branches):
                if i not in used_indices and branch in [b1, b2, b3]:
                    indices.append(i)

            # 정확히 3개가 있고, 각각 다른 지지여야 함
            if len(indices) == 3:
                found_branches = [earthly_branches[i] for i in indices]
                if set(found_branches) == {b1, b2, b3}:
                    result_korean = self._element_to_korean(result_element)

                    # 원소 오행 추출
                    original_elements = [self._branch_to_element(
                        earthly_branches[i]) for i in indices]
                    positions = [position_names[i] for i in indices]

                    transformations.append({
                        'type': '지지삼합',
                        'name': f'{b1}{b2}{b3}삼합{result_korean}국',
                        'branches': [b1, b2, b3],
                        'positions': positions,
                        'original_elements': original_elements,
                        'result': result_element,
                        'theory': self.harmony_theories.get('지지합', '')
                    })

                    # 세 개 모두 사용됨으로 표시
                    for idx in indices:
                        used_indices.add(idx)

                    print(
                        f"      ✅ 삼합: {b1}{b2}{b3}({', '.join(positions)}) → {result_korean}국")

        print(f"   📌 최종 사용된 인덱스: {used_indices}")
        return transformations

    def _recalculate_elements(self, original_counts: Dict[str, int], transformations: List[Dict]) -> Dict[str, int]:
        """합화 적용 후 오행 재계산

        결과 오행과 같은 원소는 유지, 다른 원소만 변환
        """
        result = original_counts.copy()

        print(f"🔍 재계산 시작 - 원본: {result}")
        print(f"🔍 적용할 변환: {len(transformations)}건")

        for trans in transformations:
            trans_type = trans.get('type', '')
            original_elements = trans.get('original_elements', [])
            result_element = trans.get('result', '')
            name = trans.get('name', '')

            print(f"   📌 {name} ({trans_type})")
            print(f"   📌 원소: {original_elements} → {result_element}")

            converted_count = 0

            for elem in original_elements:
                if elem == result_element:
                    print(f"      ℹ️  {elem}는 {result_element}와 동일 → 유지")
                else:
                    if elem in result and result[elem] > 0:
                        old_val = result[elem]
                        result[elem] -= 1
                        converted_count += 1
                        print(f"      ✓ {elem} 차감: {old_val} → {result[elem]}")
                    else:
                        print(
                            f"      ⚠️  {elem} 차감 불가 (현재값: {result.get(elem, 0)})")

            if converted_count > 0 and result_element in result:
                old_val = result[result_element]
                result[result_element] += converted_count
                print(
                    f"      ✓ {result_element} 증가: {old_val} → {result[result_element]} (+{converted_count})")

        print(f"🔍 재계산 완료 - 결과: {result}")
        return result

    def _apply_harmony_transformation(self, element_counts: Dict[str, int], analysis: Dict) -> Tuple[Dict[str, int], List[Dict]]:
        """합화 변환 적용 및 오행 재계산"""
        transformations = []

        # pillars 또는 basic_info에서 추출
        pillars = analysis.get('pillars', {})
        basic_info = analysis.get('basic_info', {})

        if pillars:
            # pillars에서 추출
            year_pillar = pillars.get('year', {})
            month_pillar = pillars.get('month', {})
            day_pillar = pillars.get('day', {})
            hour_pillar = pillars.get('hour', {})

            heavenly_stems = [
                year_pillar.get('heavenly_stem', ''),
                month_pillar.get('heavenly_stem', ''),
                day_pillar.get('heavenly_stem', ''),
                hour_pillar.get('heavenly_stem', '')
            ]

            earthly_branches = [
                year_pillar.get('earthly_branch', ''),
                month_pillar.get('earthly_branch', ''),
                day_pillar.get('earthly_branch', ''),
                hour_pillar.get('earthly_branch', '')
            ]
        elif basic_info:
            # basic_info에서 추출 (폴백)
            print("⚠️  pillars 없음, basic_info에서 추출")

            heavenly_stems = [
                basic_info.get('year', ['', ''])[0] if isinstance(
                    basic_info.get('year'), (list, tuple)) else '',
                basic_info.get('month', ['', ''])[0] if isinstance(
                    basic_info.get('month'), (list, tuple)) else '',
                basic_info.get('day', ['', ''])[0] if isinstance(
                    basic_info.get('day'), (list, tuple)) else '',
                basic_info.get('hour', ['', ''])[0] if isinstance(
                    basic_info.get('hour'), (list, tuple)) else ''
            ]

            earthly_branches = [
                basic_info.get('year', ['', ''])[1] if isinstance(
                    basic_info.get('year'), (list, tuple)) else '',
                basic_info.get('month', ['', ''])[1] if isinstance(
                    basic_info.get('month'), (list, tuple)) else '',
                basic_info.get('day', ['', ''])[1] if isinstance(
                    basic_info.get('day'), (list, tuple)) else '',
                basic_info.get('hour', ['', ''])[1] if isinstance(
                    basic_info.get('hour'), (list, tuple)) else ''
            ]
        else:
            print("⚠️  pillars와 basic_info 모두 없음")
            return element_counts.copy(), []

        print(f"🔍 천간: {heavenly_stems}")
        print(f"🔍 지지: {earthly_branches}")

        # 천간합 체크
        heavenly_transformations = self._check_heavenly_harmony(
            heavenly_stems, earthly_branches)
        transformations.extend(heavenly_transformations)

        # 지지합 체크
        earthly_transformations = self._check_earthly_harmony(earthly_branches)
        transformations.extend(earthly_transformations)

        if transformations:
            print(f"🔥 합화 발견: {len(transformations)}건")
            for trans in transformations:
                trans_type = trans.get('type', '')
                name = trans.get('name', '')
                print(f"   - {name} ({trans_type})")

        # 오행 재계산
        transformed_counts = self._recalculate_elements(
            element_counts, transformations)

        print(f"🔍 원본 오행: {element_counts}")
        print(f"🔍 합화 후 오행: {transformed_counts}")

        return transformed_counts, transformations

    def generate_element_interpretation(self, element_counts, tone='empathy', theories='', analysis=None):
        """
        오행 카운트 기반 해석 생성 (합화 반영)

        Args:
            element_counts: {'wood': 1, 'fire': 2, 'earth': 1, 'metal': 2, 'water': 2}
            tone: 'empathy', 'reality', 'fun'
            theories: 이론 텍스트 (옵션)
            analysis: analyze_full_saju() 결과 (합화 판단용)

        Returns:
            str: 생성된 해석
        """
        # 합화 적용
        transformed_counts, transformations = self._apply_harmony_transformation(
            element_counts, analysis)

        harmony_info = ""
        if transformations:
            harmony_info = "\n\n🔥 합화(合化) 발생:\n"
            for t in transformations:
                name = t.get('name', '')
                positions = t.get('positions', [])
                harmony_info += f"- {name} ({', '.join(positions)})\n"

        final_counts = transformed_counts

        if not self.client:
            return self._fallback_element_interpretation(final_counts, tone)

        # 톤별 시스템 프롬프트
        tone_prompts = {
            'empathy': "당신은 따뜻하고 공감적인 사주 상담가입니다. 운명론적 결정론보다는 사람의 잠재력과 가능성에 집중하며, 격려와 지지의 메시지를 전달합니다.",
            'reality': "당신은 냉철하고 객관적인 사주 전문가입니다. 사주 이론을 정확하게 분석하고, 현실적이고 논리적인 해석을 제공합니다.",
            'fun': "당신은 재미있고 친근한 사주 해석가입니다. 밈과 이모지를 활용하여 Z세대 감성으로 쉽고 재미있게 사주를 해석합니다."
        }

        system_prompt = tone_prompts.get(tone, tone_prompts['empathy'])

        # 오행 정보 정리 (합화 적용 후)
        elements_info = f"""
오행 분포 (합화 적용 후): 
- 木(목/나무): {final_counts.get('wood', 0)}개
- 火(화/불): {final_counts.get('fire', 0)}개  
- 土(토/흙): {final_counts.get('earth', 0)}개
- 金(금/쇠): {final_counts.get('metal', 0)}개
- 水(수/물): {final_counts.get('water', 0)}개

{harmony_info}
"""

        # 사용자 프롬프트 구성
        theory_section = f"\n\n참고 이론:\n{theories}" if theories else ""

        user_prompt = f"""다음 사주의 오행 에너지를 분석해주세요:

{elements_info}{theory_section}

⚡ 합화(合化)가 있는 경우 (최우선 분석!):
1. 합화의 종류 식별 (천간합/지지합/삼합)
2. 원래 오행 → 변화된 오행 명시
3. 사주 전체에 미치는 영향:
   - 원래 강했던 오행이 줄면 → 잠재된 에너지로 설명
   - 새로 생긴 오행이 증가하면 → 새로운 가능성으로 설명
4. 긍정적/부정적 측면 모두 언급
5. 실생활 예시 (일/돈/관계)

작성 가이드: 
1. 전체 오행 균형 상태를 먼저 평가 (균형 잡힘 / 특정 오행 강세 / 부족)
2. 가장 강한 오행이 성격과 삶에 미치는 영향
3. 가장 약한 오행이 의미하는 것
4. 오행 균형을 맞추기 위한 실천 가이드 (색상, 방위, 활동 등)
5. 전체적인 메시지와 격려

분량: 1500-2000자
형식: 친근하고 읽기 쉬운 문장, 구체적인 예시 포함
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,
                max_tokens=3000
            )

            content = response.choices[0].message.content
            print(f"✅ GPT 해석 생성 완료: {len(content)}자")
            return content

        except Exception as e:
            print(f"❌ GPT API 호출 실패: {e}")
            return self._fallback_element_interpretation(final_counts, tone)

    def _extract_harmony_from_patterns(self, patterns):
        """패턴에서 합화 관련 항목만 추출"""
        harmony_patterns = []
        for p in patterns:
            if any(keyword in p for keyword in ['천간합', '지지합', '육합', '삼합', '반합']):
                harmony_patterns.append(p)
        return harmony_patterns

    def generate_comprehensive_interpretation(self, analysis, tone='empathy', theories=''):
        """
        해석 엔진의 상세 분석 결과를 활용한 종합 해석 생성

        Args:
            analysis: analyze_full_saju()의 결과
            tone: 'empathy' | 'reality' | 'fun'
            theories: 이론 텍스트

        Returns:
            str: GPT가 생성한 종합 해석 (3000~4000자)
        """
        if not self.client:
            return self._fallback_comprehensive(analysis, tone)

        # 톤별 시스템 프롬프트
        tone_prompts = {
            'empathy': "당신은 따뜻하고 공감적인 사주 상담가입니다. 운명론적 결정론보다는 사람의 잠재력과 가능성에 집중하며, 격려와 지지의 메시지를 전달합니다.",
            'reality': "당신은 냉철하고 객관적인 사주 전문가입니다. 사주 이론을 정확하게 분석하고, 현실적이고 논리적인 해석을 제공합니다.",
            'fun': "당신은 재미있고 친근한 사주 해석가입니다. 친구같은 느낌으로 반말을 하죠. 밈과 이모지를 활용하여 Z세대 감성으로 쉽고 재미있게 사주를 해석합니다."
        }

        system_prompt = tone_prompts.get(tone, tone_prompts['empathy'])

        # 분석 결과 정리
        summary = analysis['summary']
        element_count = summary['element_count']
        ten_gods_count = summary['ten_gods_count']
        patterns = analysis.get('patterns', [])

        # 합화 정보 추출
        harmony_transformations = self._extract_harmony_from_patterns(patterns)
        harmony_section = ""
        if harmony_transformations:
            harmony_section = "\n\n🔥 합화(合化):\n"
            for h in harmony_transformations:
                harmony_section += f"- {h}\n"
            harmony_section += "\n⚠️ 합화는 사주 해석에서 매우 중요한 요소입니다!"

        analysis_info = f"""
사주 기본 정보: 
- 일간: {analysis['basic_info']['day_stem']}
- 사주 팔자:
  • 년주: {analysis['basic_info']['year']}
  • 월주: {analysis['basic_info']['month']}
  • 일주: {analysis['basic_info']['day']}
  • 시주: {analysis['basic_info']['hour']}

신강약 분석: 
- 유형: {summary['strength']}
- 점수: {summary['strength_score']}/100

오행 분포: 
- 木(목/나무): {element_count.get('wood', 0)}개
- 火(화/불): {element_count.get('fire', 0)}개
- 土(토/흙): {element_count.get('earth', 0)}개
- 金(금/쇠): {element_count.get('metal', 0)}개
- 水(수/물): {element_count.get('water', 0)}개

십성 분포: 
{self._format_ten_gods_detail(ten_gods_count)}

발견된 패턴: 
{self._format_patterns(patterns)}

{harmony_section}
"""

        theory_section = f"\n\n참고 이론:\n{theories}" if theories else ""

        user_prompt = f"""다음 사주를 종합적으로 분석하여 상세한 해석을 작성해주세요:

{analysis_info}{theory_section}

작성 가이드 (용어 사용 규칙 반영본)

이 섹션은 사용자의 성격적 엔진과 브레이크를 분석합니다. AI는 다음 세 가지 관점을 현실적인 예시(돈, 사랑, 일)와 함께 입체적으로 서술해야 합니다.

⚠️ 용어 사용 공통 규칙 (필수)

오행 개수 0개 → 「결핍」 사용
오행 개수 1개 → 「부족」, 「약한 편」 등으로 표현 (결핍 ❌)
오행 개수 2개 → 「적당」 등으로 표현
오행 개수 3개 이상 → 「과다」 사용
「과부하」라는 단어는 사용하지 않음
의미는 서술로만 표현 (예: "너무 날카로워 스스로를 베기도 합니다")
균형 잡힌 사주에서는 '과다 / 결핍 / 과부하' 단어 모두 사용 금지

0. [최우선 분석] 기운의 결합과 변신: "내 안의 숨겨진 반전 카드" (1000자)

두 기운이 만나 전혀 다른 제3의 기운으로 변하는 현상을 분석. 사용자가 이해하기 쉽게 "기운이 합쳐져 변했다"고 표현하세요.
없으면 그냥 건너뛰어도됨.

⚠️ 합 / 합화 분석 규칙 (필수)

AI는 아래 3단계를 순서대로 판단하고, 해당되는 케이스만 현실 예시까지 구체적으로 작성하세요.

A) "합이 있다" (결속/묶임/반전의 씨앗)
B) "합이 작동한다" (실제로 삶에서 계속 발동되는 상태)
C) "합화가 된다" (제3의 기운으로 변환)

1. 강한 오행 : "나를 움직이는 자동 반사적 습관" (800자)
2. 약한 오행 : "무의식적 갈망과 심리적 사각지대" (800자)
3. 균형 잡힌 사주 : "평온함 속에 숨겨진 야성의 부재" (400자)

분량: 3000~4000자
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,
                max_tokens=5000
            )

            content = response.choices[0].message.content
            print(f"✅ 종합 GPT 해석 생성 완료: {len(content)}자")
            return content

        except Exception as e:
            print(f"❌ GPT API 호출 실패: {e}")
            return self._fallback_comprehensive(analysis, tone)

    def _format_ten_gods_detail(self, ten_gods):
        """십성 상세 포맷팅"""
        lines = []
        god_meanings = {
            '비견': '형제자매, 동료',
            '겁재': '경쟁자, 라이벌',
            '식신': '표현력, 여유',
            '상관': '재능, 창의성',
            '편재': '유동적 재물',
            '정재': '안정적 재물',
            '편관': '도전, 변화',
            '정관': '명예, 지위',
            '편인': '학문, 창의',
            '정인': '학업, 명예'
        }

        for god, count in ten_gods.items():
            if count > 0:
                meaning = god_meanings.get(god, '')
                lines.append(f"- {god} {count}개 ({meaning})")
        return "\n".join(lines) if lines else "없음"

    def _format_patterns(self, patterns):
        """패턴 포맷팅"""
        if not patterns:
            return "특별한 패턴 없음"

        pattern_groups = {
            '합': [],
            '충': [],
            '형': [],
            '해': [],
            '기타': []
        }

        for p in patterns:
            if '합' in p:
                pattern_groups['합'].append(p)
            elif '충' in p:
                pattern_groups['충'].append(p)
            elif '형' in p:
                pattern_groups['형'].append(p)
            elif '해' in p:
                pattern_groups['해'].append(p)
            else:
                pattern_groups['기타'].append(p)

        result = []
        for group, items in pattern_groups.items():
            if items:
                result.append(f"• {group}: {', '.join(items)}")

        return "\n".join(result) if result else "특별한 패턴 없음"

    def _fallback_comprehensive(self, analysis, tone):
        """폴백 종합 해석"""
        summary = analysis['summary']
        element_count = summary['element_count']

        # 가장 강한/약한 오행
        strongest = max(element_count.items(), key=lambda x: x[1])
        weakest = min(element_count.items(), key=lambda x: x[1])

        element_names = {
            'wood': '木(나무)', 'fire': '火(불)', 'earth': '土(흙)',
            'metal': '金(쇠)', 'water': '水(물)'
        }

        return f"""## 🌈 당신의 사주 종합 분석

신강약: {summary['strength']} ({summary['strength_score']}점)

당신의 사주는 {summary['strength']} 성향입니다.

오행 균형: 
가장 강한 오행은 {element_names[strongest[0]]} ({strongest[1]}개)이고,
가장 약한 오행은 {element_names[weakest[0]]} ({weakest[1]}개)입니다.

십성 분포: 
{self._format_ten_gods_detail(summary['ten_gods_count'])}

패턴: 
{self._format_patterns(analysis.get('patterns', []))}

상세한 해석은 GPT 서비스 연결 후 제공됩니다.
"""

    def _fallback_element_interpretation(self, element_counts, tone):
        """GPT 실패 시 폴백 해석"""
        total = sum(element_counts.values())

        if total == 0:
            return "사주 정보를 분석할 수 없습니다."

        # 강한 오행 찾기
        strongest = max(element_counts.items(), key=lambda x: x[1])
        weakest = min(element_counts.items(), key=lambda x: x[1])

        element_names = {
            'wood': '木(나무)',
            'fire': '火(불)',
            'earth': '土(흙)',
            'metal': '金(쇠)',
            'water': '水(물)'
        }

        element_traits = {
            'wood': '성장, 창의성, 유연성',
            'fire': '열정, 표현력, 리더십',
            'earth': '안정, 신뢰, 포용력',
            'metal': '정의, 원칙, 결단력',
            'water': '지혜, 적응력, 직관'
        }

        content = f"""## 🌈 당신의 오행 에너지

오행 분포 
- 木(나무): {element_counts.get('wood', 0)}개
- 火(불): {element_counts.get('fire', 0)}개
- 土(흙): {element_counts.get('earth', 0)}개
- 金(쇠): {element_counts.get('metal', 0)}개
- 水(물): {element_counts.get('water', 0)}개

당신의 사주에서 {element_names[strongest[0]]} 에너지가 가장 강하게 나타납니다 ({strongest[1]}개). 
이는 {element_traits[strongest[0]]}의 특성을 강하게 가지고 있음을 의미합니다.

반면 {element_names[weakest[0]]} 에너지는 상대적으로 약한 편입니다 ({weakest[1]}개).
이 부분을 보완하면 더 균형 잡힌 삶을 살 수 있습니다.

실천 가이드: 
- 강한 오행의 장점을 적극 활용하세요
- 약한 오행을 보완하는 색상, 방위, 활동을 생활에 적용해보세요
- 균형을 통해 더 조화로운 삶을 만들어가세요
"""

        return content

    def generate_section1(self, analysis, tone='empathy'):
        """
        섹션 1: 오행 에너지 분석 생성

        Args:
            analysis: analyze_full_saju 결과
            tone: 'empathy' | 'reality' | 'fun'

        Returns:
            {
                'section_id': 1,
                'title': '...',
                'content': '...',
                'tone': tone
            }
        """

        # 1. 관련 이론 추출
        theories = self.retriever.get_relevant_theories(analysis)

        # 2. 분석 결과 요약
        summary = self._create_analysis_summary(analysis)

        # 3. 톤별 시스템 메시지
        system_prompts = {
            'empathy': "당신은 따뜻하고 공감적인 사주 상담가입니다. 부드러운 어조로 긍정적 메시지를 전달하되, 현실적인 조언도 함께 제공합니다.",
            'reality': "당신은 객관적이고 분석적인 사주 명리학자입니다. 감정을 배제하고 팩트와 데이터 중심으로 간결하게 전달합니다.",
            'fun': "당신은 친근하고 재미있는 친구 같은 사주 상담가입니다. 반말을 섞어 편하게 이야기하며, 핵심을 찌르는 조언을 합니다."
        }

        # 4. GPT 프롬프트 구성
        prompt = f"""다음 사주 분석 결과와 이론을 바탕으로 해석을 작성해주세요.

[사주 분석 결과]
{summary}

[관련 사주 이론]
{theories}

[요구사항]
1. 위 이론을 참고하여 정확하고 전문적인 해석 작성
2. {tone} 톤에 맞춰 작성:
   - empathy: 따뜻하고 공감적, "당신", "~예요", "~입니다"
   - reality: 객관적이고 분석적, "~함", "~임", 데이터 중심
   - fun: 친근하고 재미있게, 반말 섞어서, "야", "너"

3. 다음 구조로 1500자 내외 작성:
   - 전체적인 사주 특징 (신강/신약, 오행 분포)
   - 오행 에너지 분석 (많은 오행, 부족한 오행의 의미)
   - 십성 분포 해석 (어떤 십성이 많고 그 의미)
   - 실전 조언 (어떤 오행/십성을 보완해야 하는지)

4. 이론 내용을 그대로 복사하지 말고, 이 사주에 맞게 재해석
5. 전문 용어는 쉽게 풀어서 설명
6. 구체적이고 실용적인 조언 제공
"""

        # 5. GPT 호출
        if not self.client:
            return self._fallback_interpretation(analysis, tone)

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompts[tone]},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )

            content = response.choices[0].message.content

            return {
                'section_id': 1,
                'title': '오행 에너지 분석',
                'content': content,
                'tone': tone
            }

        except Exception as e:
            print(f"❌ GPT 호출 실패: {e}")
            return self._fallback_interpretation(analysis, tone)

    def _create_analysis_summary(self, analysis):
        """분석 결과를 GPT가 읽기 쉬운 형식으로 요약"""

        bi = analysis['basic_info']
        strength = analysis['summary']['strength']
        score = analysis['summary']['strength_score']
        ten_gods = analysis['summary']['ten_gods_count']
        element_count = analysis['summary']['element_count']
        patterns = analysis.get('patterns', [])

        summary = f"""
사주 팔자 
- 연주: {bi['year']}
- 월주: {bi['month']}
- 일주: {bi['day']}
- 시주: {bi['hour']}

일간 
- {bi['day_stem']}

신강약 
- 유형: {strength}
- 점수: {score}/100

오행 분포 
- 목(木): {element_count.get('wood', 0)}개
- 화(火): {element_count.get('fire', 0)}개
- 토(土): {element_count.get('earth', 0)}개
- 금(金): {element_count.get('metal', 0)}개
- 수(水): {element_count.get('water', 0)}개

십성 분포 
{self._format_ten_gods(ten_gods)}

발견된 패턴 
{', '.join(patterns) if patterns else '없음'}
"""
        return summary.strip()

    def _format_ten_gods(self, ten_gods):
        """십성을 읽기 쉽게 포맷"""
        lines = []
        for god, count in ten_gods.items():
            if count > 0:
                lines.append(f"- {god}: {count}개")
        return "\n".join(lines) if lines else "- 없음"

    def _fallback_interpretation(self, analysis, tone):
        """GPT 실패 시 기본 해석"""
        strength = analysis['summary']['strength']
        score = analysis['summary']['strength_score']

        content = f"""당신의 사주는 {strength} 성향입니다.

신강약 점수: {score}점

오행 에너지와 십성 분포를 종합적으로 분석하여 해석을 제공합니다.

(상세 해석은 GPT 서비스 연결 후 제공됩니다)
"""

        return {
            'section_id': 1,
            'title': '오행 에너지 분석',
            'content': content,
            'tone': tone
        }


def test_generator():
    """테스트"""
    element_counts = {
        'wood': 2,
        'fire': 1,
        'earth': 1,
        'metal': 2,
        'water': 2
    }

    generator = GPTInterpretationGenerator()
    result = generator._fallback_element_interpretation(
        element_counts, 'empathy')

    print("="*70)
    print("오행 에너지 해석 (폴백 모드)")
    print("="*70)
    print(result)


if __name__ == "__main__":
    test_generator()
