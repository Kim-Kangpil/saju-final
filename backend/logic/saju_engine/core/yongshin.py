#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
용신 취용 엔진
- 억부 용신: 신강/신약 기준으로 필요한 오행 판단
- 조후 용신: 월지 계절 기준으로 필요한 오행 판단
- 최종 용신: 억부와 조후를 종합 판단
"""

# =====================================================
# 조후 용신 데이터 (궁통보감 기반)
# 월지 → 일간 → {용신, 희신, 기신}
# =====================================================

JOHU_YONGSHIN = {
    '子': {
        '甲': {'용신': ['丙'], '희신': ['庚', '壬'], '기신': ['壬']},
        '乙': {'용신': ['丙'], '희신': ['庚'], '기신': ['壬', '癸']},
        '丙': {'용신': ['壬'], '희신': ['甲', '戊'], '기신': ['癸']},
        '丁': {'용신': ['甲'], '희신': ['庚'], '기신': ['壬', '癸']},
        '戊': {'용신': ['丙'], '희신': ['甲'], '기신': ['壬']},
        '己': {'용신': ['丙'], '희신': ['丁', '甲'], '기신': ['壬', '癸']},
        '庚': {'용신': ['丁'], '희신': ['甲', '丙'], '기신': ['壬']},
        '辛': {'용신': ['壬'], '희신': ['甲'], '기신': ['戊']},
        '壬': {'용신': ['戊'], '희신': ['丙', '甲'], '기신': ['壬', '癸']},
        '癸': {'용신': ['丙'], '희신': ['辛', '庚'], '기신': ['甲']},
    },
    '丑': {
        '甲': {'용신': ['丙'], '희신': ['庚', '壬'], '기신': []},
        '乙': {'용신': ['丙'], '희신': ['庚'], '기신': ['壬', '癸']},
        '丙': {'용신': ['壬'], '희신': ['甲'], '기신': ['癸']},
        '丁': {'용신': ['甲'], '희신': ['庚'], '기신': ['壬', '癸']},
        '戊': {'용신': ['丙'], '희신': ['甲'], '기신': ['壬']},
        '己': {'용신': ['丙'], '희신': ['丁'], '기신': ['壬', '癸']},
        '庚': {'용신': ['丁'], '희신': ['丙', '甲'], '기신': ['壬', '癸']},
        '辛': {'용신': ['壬'], '희신': ['丙'], '기신': ['戊', '己']},
        '壬': {'용신': ['戊'], '희신': ['丙', '甲'], '기신': ['壬', '癸']},
        '癸': {'용신': ['丙'], '희신': ['辛'], '기신': ['甲']},
    },
    '寅': {
        '甲': {'용신': ['丙'], '희신': ['庚', '壬'], '기신': ['戊']},
        '乙': {'용신': ['丙'], '희신': ['癸'], '기신': ['壬']},
        '丙': {'용신': ['壬'], '희신': ['庚', '甲'], '기신': ['壬', '癸']},
        '丁': {'용신': ['甲'], '희신': ['庚'], '기신': ['壬', '癸']},
        '戊': {'용신': ['丙'], '희신': ['甲'], '기신': ['壬']},
        '己': {'용신': ['丙'], '희신': ['甲'], '기신': ['壬']},
        '庚': {'용신': ['丁'], '희신': ['甲'], '기신': ['壬']},
        '辛': {'용신': ['壬'], '희신': ['甲', '丙'], '기신': ['戊']},
        '壬': {'용신': ['戊'], '희신': ['丙', '庚'], '기신': ['甲']},
        '癸': {'용신': ['丙'], '희신': ['庚', '辛'], '기신': ['甲']},
    },
    '卯': {
        '甲': {'용신': ['庚'], '희신': ['丙', '壬'], '기신': ['甲', '乙']},
        '乙': {'용신': ['丙'], '희신': ['癸', '庚'], '기신': []},
        '丙': {'용신': ['壬'], '희신': ['庚'], '기신': ['甲', '乙']},
        '丁': {'용신': ['庚'], '희신': ['壬', '甲'], '기신': ['壬', '癸']},
        '戊': {'용신': ['丙'], '희신': ['庚'], '기신': ['甲', '乙']},
        '己': {'용신': ['丙'], '희신': ['甲'], '기신': ['壬']},
        '庚': {'용신': ['丁'], '희신': ['甲'], '기신': ['壬', '乙']},
        '辛': {'용신': ['壬'], '희신': ['丙'], '기신': ['甲', '乙']},
        '壬': {'용신': ['庚'], '희신': ['戊', '丙'], '기신': ['甲']},
        '癸': {'용신': ['辛'], '희신': ['丙', '庚'], '기신': ['甲']},
    },
    '辰': {
        '甲': {'용신': ['庚'], '희신': ['壬', '丙'], '기신': ['庚']},
        '乙': {'용신': ['癸'], '희신': ['丙', '庚'], '기신': ['戊']},
        '丙': {'용신': ['壬'], '희신': ['甲', '庚'], '기신': ['壬', '癸']},
        '丁': {'용신': ['甲'], '희신': ['庚', '壬'], '기신': ['壬', '癸']},
        '戊': {'용신': ['甲'], '희신': ['丙', '壬'], '기신': []},
        '己': {'용신': ['丙'], '희신': ['甲'], '기신': ['壬', '癸']},
        '庚': {'용신': ['丁'], '희신': ['壬', '甲'], '기신': ['戊', '己']},
        '辛': {'용신': ['壬'], '희신': ['甲', '庚'], '기신': ['戊', '己']},
        '壬': {'용신': ['甲'], '희신': ['庚', '戊'], '기신': ['戊', '己']},
        '癸': {'용신': ['丙'], '희신': ['庚', '辛'], '기신': ['戊', '己']},
    },
    '巳': {
        '甲': {'용신': ['癸'], '희신': ['丁', '庚'], '기신': ['戊']},
        '乙': {'용신': ['癸'], '희신': ['丙'], '기신': ['庚']},
        '丙': {'용신': ['壬'], '희신': ['庚', '甲'], '기신': ['壬', '癸']},
        '丁': {'용신': ['甲'], '희신': ['庚', '壬'], '기신': ['壬', '癸']},
        '戊': {'용신': ['甲'], '희신': ['丙', '壬'], '기신': []},
        '己': {'용신': ['癸'], '희신': ['丙'], '기신': ['戊']},
        '庚': {'용신': ['壬'], '희신': ['戊', '丙'], '기신': ['丙', '丁']},
        '辛': {'용신': ['壬'], '희신': ['庚', '甲'], '기신': ['丙', '丁']},
        '壬': {'용신': ['庚'], '희신': ['戊'], '기신': ['丙', '丁']},
        '癸': {'용신': ['庚'], '희신': ['辛'], '기신': ['丙', '丁']},
    },
    '午': {
        '甲': {'용신': ['癸'], '희신': ['丁'], '기신': ['戊', '己']},
        '乙': {'용신': ['癸'], '희신': ['丙'], '기신': ['庚', '戊']},
        '丙': {'용신': ['壬'], '희신': ['庚', '甲'], '기신': ['壬', '癸']},
        '丁': {'용신': ['壬'], '희신': ['甲', '庚'], '기신': ['壬', '癸']},
        '戊': {'용신': ['壬'], '희신': ['甲'], '기신': ['火']},
        '己': {'용신': ['癸'], '희신': ['丙'], '기신': ['火']},
        '庚': {'용신': ['壬'], '희신': ['戊'], '기신': ['丙', '丁']},
        '辛': {'용신': ['壬'], '희신': ['庚'], '기신': ['丙', '丁']},
        '壬': {'용신': ['庚'], '희신': ['辛', '戊'], '기신': ['丙', '丁']},
        '癸': {'용신': ['庚'], '희신': ['辛'], '기신': ['丙', '丁']},
    },
    '未': {
        '甲': {'용신': ['癸'], '희신': ['丁', '庚'], '기신': ['戊', '己']},
        '乙': {'용신': ['癸'], '희신': ['丙'], '기신': ['庚']},
        '丙': {'용신': ['壬'], '희신': ['甲', '庚'], '기신': ['壬', '癸']},
        '丁': {'용신': ['甲'], '희신': ['庚'], '기신': ['壬', '癸']},
        '戊': {'용신': ['甲'], '희신': ['丙', '壬'], '기신': ['土']},
        '己': {'용신': ['癸'], '희신': ['丙'], '기신': ['壬', '癸']},
        '庚': {'용신': ['丁'], '희신': ['壬', '甲'], '기신': ['土']},
        '辛': {'용신': ['壬'], '희신': ['庚', '甲'], '기신': ['土']},
        '壬': {'용신': ['甲'], '희신': ['庚'], '기신': ['戊', '己']},
        '癸': {'용신': ['庚'], '희신': ['辛'], '기신': ['戊', '己']},
    },
    '申': {
        '甲': {'용신': ['丁'], '희신': ['庚', '壬'], '기신': ['庚']},
        '乙': {'용신': ['丙'], '희신': ['癸'], '기신': ['庚']},
        '丙': {'용신': ['壬'], '희신': ['甲'], '기신': ['壬', '癸']},
        '丁': {'용신': ['甲'], '희신': ['庚'], '기신': ['壬', '癸']},
        '戊': {'용신': ['丙'], '희신': ['甲'], '기신': ['壬']},
        '己': {'용신': ['丙'], '희신': ['甲'], '기신': ['壬', '癸']},
        '庚': {'용신': ['丁'], '희신': ['甲', '壬'], '기신': ['土']},
        '辛': {'용신': ['壬'], '희신': ['甲'], '기신': ['土']},
        '壬': {'용신': ['戊'], '희신': ['丙', '庚'], '기신': ['壬', '癸']},
        '癸': {'용신': ['丙'], '희신': ['庚', '辛'], '기신': ['壬']},
    },
    '酉': {
        '甲': {'용신': ['丁'], '희신': ['庚', '壬'], '기신': ['庚']},
        '乙': {'용신': ['丙'], '희신': ['癸'], '기신': ['庚', '辛']},
        '丙': {'용신': ['壬'], '희신': ['甲'], '기신': ['壬', '癸']},
        '丁': {'용신': ['甲'], '희신': ['甲', '壬'], '기신': ['壬', '癸']},
        '戊': {'용신': ['丙'], '희신': ['甲', '壬'], '기신': ['壬']},
        '己': {'용신': ['丙'], '희신': ['甲'], '기신': ['壬', '癸']},
        '庚': {'용신': ['丁'], '희신': ['甲', '壬'], '기신': ['土']},
        '辛': {'용신': ['壬'], '희신': ['甲'], '기신': ['土']},
        '壬': {'용신': ['戊'], '희신': ['丙', '甲'], '기신': ['金']},
        '癸': {'용신': ['丙'], '희신': ['庚', '辛'], '기신': []},
    },
    '戌': {
        '甲': {'용신': ['壬'], '희신': ['甲', '庚'], '기신': ['戊']},
        '乙': {'용신': ['壬'], '희신': ['丙'], '기신': ['庚']},
        '丙': {'용신': ['甲'], '희신': ['壬'], '기신': ['壬', '癸']},
        '丁': {'용신': ['甲'], '희신': ['庚'], '기신': ['壬', '癸']},
        '戊': {'용신': ['甲'], '희신': ['丙', '壬'], '기신': ['土']},
        '己': {'용신': ['丙'], '희신': ['甲'], '기신': ['壬']},
        '庚': {'용신': ['丁'], '희신': ['甲', '壬'], '기신': ['戊', '己']},
        '辛': {'용신': ['壬'], '희신': ['甲'], '기신': ['戊', '己']},
        '壬': {'용신': ['甲'], '희신': ['庚'], '기신': ['戊', '己']},
        '癸': {'용신': ['辛'], '희신': ['丙'], '기신': ['戊', '己']},
    },
    '亥': {
        '甲': {'용신': ['丙'], '희신': ['庚', '壬'], '기신': ['壬', '癸']},
        '乙': {'용신': ['丙'], '희신': ['戊'], '기신': ['壬', '癸']},
        '丙': {'용신': ['甲'], '희신': ['戊'], '기신': ['壬', '癸']},
        '丁': {'용신': ['甲'], '희신': ['庚'], '기신': ['壬', '癸']},
        '戊': {'용신': ['甲'], '희신': ['丙', '丁'], '기신': ['壬', '癸']},
        '己': {'용신': ['丙'], '희신': ['甲'], '기신': ['壬', '癸']},
        '庚': {'용신': ['丁'], '희신': ['丙', '甲'], '기신': ['壬', '癸']},
        '辛': {'용신': ['壬'], '희신': ['甲', '丙'], '기신': ['壬', '癸']},
        '壬': {'용신': ['戊'], '희신': ['丙', '甲'], '기신': ['壬', '癸']},
        '癸': {'용신': ['丙'], '희신': ['辛', '庚'], '기신': ['壬', '癸']},
    },
}

# 오행 → 천간 매핑
ELEMENT_TO_STEMS = {
    'wood': ['甲', '乙'],
    'fire': ['丙', '丁'],
    'earth': ['戊', '己'],
    'metal': ['庚', '辛'],
    'water': ['壬', '癸'],
}

STEM_TO_ELEMENT = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water',
}

BRANCH_TO_ELEMENT = {
    '子': 'water', '亥': 'water',
    '寅': 'wood', '卯': 'wood',
    '巳': 'fire', '午': 'fire',
    '申': 'metal', '酉': 'metal',
    '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
}

ELEMENT_KOREAN = {
    'wood': '목(木)', 'fire': '화(火)', 'earth': '토(土)',
    'metal': '금(金)', 'water': '수(水)'
}

STEM_KOREAN = {
    '甲': '갑목', '乙': '을목', '丙': '병화', '丁': '정화',
    '戊': '무토', '己': '기토', '庚': '경금', '辛': '신금',
    '壬': '임수', '癸': '계수',
}


def calculate_yongshin(analysis: dict) -> dict:
    """
    용신 취용 메인 함수

    Args:
        analysis: analyze_full_saju() 결과

    Returns:
        {
            'johu_yongshin': [...],   # 조후 용신 천간 목록
            'eokbu_yongshin': [...],  # 억부 용신 오행 목록
            'final_yongshin': [...],  # 최종 용신 오행 목록
            'hishin': [...],          # 희신
            'gishin': [...],          # 기신
            'strength': '신강|신약',
            'wolji': '월지 지지',
            'ilgan': '일간',
            'reason': '용신 취용 이유',
            'modern_meaning': '현대적 의미',
        }
    """
    try:
        basic = analysis.get('basic_info', {})
        summary = analysis.get('summary', {})

        ilgan = basic.get('day_stem', '')

        # 월지 추출
        month_pillar = basic.get('month', '')
        wolji = month_pillar[1] if len(month_pillar) >= 2 else ''

        strength = summary.get('strength', '')
        strength_score = summary.get('strength_score', 50)
        element_count = summary.get('element_count', {})

        # 1. 조후 용신 계산
        johu = _calc_johu_yongshin(ilgan, wolji)

        # 2. 억부 용신 계산
        eokbu = _calc_eokbu_yongshin(ilgan, strength, strength_score, element_count)

        # 3. 최종 용신 종합
        final = _combine_yongshin(johu, eokbu, ilgan, wolji, strength)

        # 4. 현대적 의미
        modern = _get_modern_meaning(final['yongshin'], ilgan, wolji)

        return {
            'johu_yongshin': johu.get('yongshin', []),
            'johu_hishin': johu.get('hishin', []),
            'johu_gishin': johu.get('gishin', []),
            'eokbu_yongshin': eokbu.get('yongshin', []),
            'final_yongshin': final.get('yongshin', []),
            'hishin': final.get('hishin', []),
            'gishin': final.get('gishin', []),
            'strength': strength,
            'wolji': wolji,
            'ilgan': ilgan,
            'reason': final.get('reason', ''),
            'modern_meaning': modern,
        }
    except Exception as e:
        print(f"❌ 용신 계산 오류: {e}")
        return {
            'johu_yongshin': [], 'eokbu_yongshin': [], 'final_yongshin': [],
            'hishin': [], 'gishin': [], 'strength': '', 'wolji': '',
            'ilgan': '', 'reason': '계산 오류', 'modern_meaning': '',
        }


def _calc_johu_yongshin(ilgan: str, wolji: str) -> dict:
    """조후 용신 계산"""
    if not ilgan or not wolji:
        return {'yongshin': [], 'hishin': [], 'gishin': []}

    wolji_data = JOHU_YONGSHIN.get(wolji, {})
    ilgan_data = wolji_data.get(ilgan, {})

    if not ilgan_data:
        return {'yongshin': [], 'hishin': [], 'gishin': []}

    return {
        'yongshin': ilgan_data.get('용신', []),
        'hishin': ilgan_data.get('희신', []),
        'gishin': ilgan_data.get('기신', []),
    }


def _calc_eokbu_yongshin(ilgan: str, strength: str, score: int, element_count: dict) -> dict:
    """억부 용신 계산"""
    ilgan_element = STEM_TO_ELEMENT.get(ilgan, '')

    if '신강' in strength or score >= 60:
        # 신강 → 설기(식상), 극제(관성), 재성 용신
        if ilgan_element == 'wood':
            return {'yongshin': ['fire', 'metal', 'earth'], 'reason': '신강 목 → 화(설기)/금(극제)/토(재성)'}
        elif ilgan_element == 'fire':
            return {'yongshin': ['earth', 'water', 'metal'], 'reason': '신강 화 → 토(설기)/수(극제)/금(재성)'}
        elif ilgan_element == 'earth':
            return {'yongshin': ['metal', 'wood', 'water'], 'reason': '신강 토 → 금(설기)/목(극제)/수(재성)'}
        elif ilgan_element == 'metal':
            return {'yongshin': ['water', 'fire', 'wood'], 'reason': '신강 금 → 수(설기)/화(극제)/목(재성)'}
        elif ilgan_element == 'water':
            return {'yongshin': ['wood', 'earth', 'fire'], 'reason': '신강 수 → 목(설기)/토(극제)/화(재성)'}
    else:
        # 신약 → 비겁, 인성 용신
        if ilgan_element == 'wood':
            return {'yongshin': ['wood', 'water'], 'reason': '신약 목 → 목(비겁)/수(인성)'}
        elif ilgan_element == 'fire':
            return {'yongshin': ['fire', 'wood'], 'reason': '신약 화 → 화(비겁)/목(인성)'}
        elif ilgan_element == 'earth':
            return {'yongshin': ['earth', 'fire'], 'reason': '신약 토 → 토(비겁)/화(인성)'}
        elif ilgan_element == 'metal':
            return {'yongshin': ['metal', 'earth'], 'reason': '신약 금 → 금(비겁)/토(인성)'}
        elif ilgan_element == 'water':
            return {'yongshin': ['water', 'metal'], 'reason': '신약 수 → 수(비겁)/금(인성)'}

    return {'yongshin': [], 'reason': ''}


def _combine_yongshin(johu: dict, eokbu: dict, ilgan: str, wolji: str, strength: str) -> dict:
    """조후와 억부 용신 종합"""
    johu_stems = johu.get('yongshin', [])
    eokbu_elements = eokbu.get('yongshin', [])

    # 조후 용신을 오행으로 변환
    johu_elements = []
    for stem in johu_stems:
        elem = STEM_TO_ELEMENT.get(stem, '')
        if elem and elem not in johu_elements:
            johu_elements.append(elem)

    # 한냉 계절(亥子丑寅) → 조후 우선
    cold_months = ['亥', '子', '丑', '寅']
    hot_months = ['巳', '午', '未', '申']

    if wolji in cold_months or wolji in hot_months:
        # 조후 우선, 억부 보조
        final = johu_elements.copy()
        for elem in eokbu_elements:
            if elem not in final:
                final.append(elem)
        reason = f"조후 우선({wolji}월) + 억부 보조({strength})"
    else:
        # 억부와 조후 균형
        final = eokbu_elements.copy()
        for elem in johu_elements:
            if elem not in final:
                final.append(elem)
        reason = f"억부({strength}) + 조후({wolji}월) 균형"

    # 기신 계산
    gishin_stems = johu.get('gishin', [])
    gishin_elements = []
    for stem in gishin_stems:
        elem = STEM_TO_ELEMENT.get(stem, '')
        if elem and elem not in gishin_elements:
            gishin_elements.append(elem)

    # 희신
    hishin_stems = johu.get('hishin', [])
    hishin_elements = []
    for stem in hishin_stems:
        elem = STEM_TO_ELEMENT.get(stem, '')
        if elem and elem not in hishin_elements and elem not in final:
            hishin_elements.append(elem)

    return {
        'yongshin': final[:2],  # 최대 2개
        'hishin': hishin_elements[:2],
        'gishin': gishin_elements[:2],
        'reason': reason,
    }


def _get_modern_meaning(yongshin_elements: list, ilgan: str, wolji: str) -> str:
    """용신의 현대적 의미"""
    meanings = {
        'wood': '성장·창의·도전·새로운 시작이 도움이 되는 환경',
        'fire': '열정·표현·인정·따뜻한 관계가 도움이 되는 환경',
        'earth': '안정·신뢰·현실적 기반·꾸준함이 도움이 되는 환경',
        'metal': '단련·경쟁·원칙·체계가 도움이 되는 환경',
        'water': '지혜·직관·유연성·깊은 사고가 도움이 되는 환경',
    }

    if not yongshin_elements:
        return ''

    parts = [meanings.get(e, '') for e in yongshin_elements if e in meanings]
    return ' / '.join(parts)


def format_yongshin_for_prompt(yongshin_result: dict) -> str:
    """용신 결과를 GPT 프롬프트용 텍스트로 변환"""
    if not yongshin_result or not yongshin_result.get('final_yongshin'):
        return ''

    lines = ['[용신 분석 — 반드시 해석에 반영할 것]']

    ilgan = yongshin_result.get('ilgan', '')
    wolji = yongshin_result.get('wolji', '')
    strength = yongshin_result.get('strength', '')

    lines.append(f'일간: {STEM_KOREAN.get(ilgan, ilgan)} | 월지: {wolji}월 | 신강약: {strength}')

    final = yongshin_result.get('final_yongshin', [])
    if final:
        elem_kr = [ELEMENT_KOREAN.get(e, e) for e in final]
        lines.append(f'용신: {", ".join(elem_kr)}')

    hishin = yongshin_result.get('hishin', [])
    if hishin:
        elem_kr = [ELEMENT_KOREAN.get(e, e) for e in hishin]
        lines.append(f'희신: {", ".join(elem_kr)}')

    gishin = yongshin_result.get('gishin', [])
    if gishin:
        elem_kr = [ELEMENT_KOREAN.get(e, e) for e in gishin]
        lines.append(f'기신: {", ".join(elem_kr)}')

    lines.append(f'취용 이유: {yongshin_result.get("reason", "")}')

    modern = yongshin_result.get('modern_meaning', '')
    if modern:
        lines.append(f'현대적 의미: {modern}')

    lines.append('')
    lines.append('[용신 해석 지침]')
    lines.append('1. 용신 오행이 강한 환경/직업/관계에서 능력이 발휘됨을 설명')
    lines.append('2. 기신 오행이 강한 환경은 피하거나 주의해야 함을 설명')
    lines.append('3. 대운에서 용신 오행이 오면 성취기, 기신 오행이 오면 시련기')
    lines.append('4. 사주 용어(용신, 기신, 오행 등) 직접 언급 금지 — 일상 언어로 풀어서')

    return '\n'.join(lines)
