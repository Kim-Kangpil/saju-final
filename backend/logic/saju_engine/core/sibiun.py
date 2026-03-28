#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
십이운성(十二運星) 계산 엔진
- 천간이 지지를 만났을 때의 생명력 단계 (12단계)
- 봉법(逢法): 드러난 천간의 역량
- 거법(居法): 지지 환경의 십이운성
- 좌법(坐法): 지장간 내부 십이운성
"""

from logic.jijanggan import get_jijanggan

# ─────────────────────────────────────────────────────────────
# 십이운성 매핑 테이블
# ─────────────────────────────────────────────────────────────

# 양간 순행 (甲·丙·戊·庚·壬)
YANG_SIBIUN = {
    "甲": {
        "亥": "장생", "子": "목욕", "丑": "관대", "寅": "건록", "卯": "제왕", "辰": "쇠",
        "巳": "병", "午": "사", "未": "묘", "申": "절", "酉": "태", "戌": "양"
    },
    "丙": {
        "寅": "장생", "卯": "목욕", "辰": "관대", "巳": "건록", "午": "제왕", "未": "쇠",
        "申": "병", "酉": "사", "戌": "묘", "亥": "절", "子": "태", "丑": "양"
    },
    "戊": {
        "寅": "장생", "卯": "목욕", "辰": "관대", "巳": "건록", "午": "제왕", "未": "쇠",
        "申": "병", "酉": "사", "戌": "묘", "亥": "절", "子": "태", "丑": "양"
    },
    "庚": {
        "巳": "장생", "午": "목욕", "未": "관대", "申": "건록", "酉": "제왕", "戌": "쇠",
        "亥": "병", "子": "사", "丑": "묘", "寅": "절", "卯": "태", "辰": "양"
    },
    "壬": {
        "申": "장생", "酉": "목욕", "戌": "관대", "亥": "건록", "子": "제왕", "丑": "쇠",
        "寅": "병", "卯": "사", "辰": "묘", "巳": "절", "午": "태", "未": "양"
    },
}

# 음간 역행 (乙·丁·己·辛·癸)
YIN_SIBIUN = {
    "乙": {
        "午": "장생", "巳": "목욕", "辰": "관대", "卯": "건록", "寅": "제왕", "丑": "쇠",
        "子": "병", "亥": "사", "戌": "묘", "酉": "절", "申": "태", "未": "양"
    },
    "丁": {
        "酉": "장생", "申": "목욕", "未": "관대", "午": "건록", "巳": "제왕", "辰": "쇠",
        "卯": "병", "寅": "사", "丑": "묘", "子": "절", "亥": "태", "戌": "양"
    },
    "己": {
        "酉": "장생", "申": "목욕", "未": "관대", "午": "건록", "巳": "제왕", "辰": "쇠",
        "卯": "병", "寅": "사", "丑": "묘", "子": "절", "亥": "태", "戌": "양"
    },
    "辛": {
        "子": "장생", "亥": "목욕", "戌": "관대", "酉": "건록", "申": "제왕", "未": "쇠",
        "午": "병", "巳": "사", "辰": "묘", "卯": "절", "寅": "태", "丑": "양"
    },
    "癸": {
        "卯": "장생", "寅": "목욕", "丑": "관대", "子": "건록", "亥": "제왕", "戌": "쇠",
        "酉": "병", "申": "사", "未": "묘", "午": "절", "巳": "태", "辰": "양"
    },
}

# 십이운성 수치화 (향후 알고리즘용)
VITALITY_SCORE = {
    "제왕": 100,
    "건록": 90,
    "관대": 85,
    "장생": 75,
    "양": 60,
    "목욕": 50,
    "쇠": 40,
    "병": 30,
    "사": 20,
    "묘": 15,
    "태": 10,
    "절": 5,
}

# 단계 그룹
PHASE_GROUP = {
    "왕성기": ["장생", "목욕", "관대", "건록", "제왕"],
    "쇠퇴기": ["쇠", "병", "사", "묘"],
    "준비기": ["절", "태", "양"],
}

# 현대어 해석
MODERN_MEANING = {
    "제왕": "최고 출력, 리더십 강함, 자기 주장 뚜렷",
    "건록": "안정적 실력 발휘, 직장·조직에서 인정",
    "관대": "사회적 활동 활발, 외부 노출 많음",
    "장생": "시작·성장 에너지, 새로운 시도에 유리",
    "양": "양육·성장 준비, 기반 다지기",
    "목욕": "불안정하지만 감각 예민, 변화 많음",
    "쇠": "에너지 내부로 수렴, 휴식 필요",
    "병": "약해 보이지만 내면 단단, 준비 시기",
    "사": "형체 없음, 정신적 영역 강함",
    "묘": "저장·축적, 겉으로 안 보임",
    "태": "잉태·준비, 아직 드러나지 않음",
    "절": "단절·재시작, 과거 청산",
}

# 지지 한자 → 한글
HANJA_TO_HANGUL_BRANCH = {
    "子": "자", "丑": "축", "寅": "인", "卯": "묘",
    "辰": "진", "巳": "사", "午": "오", "未": "미",
    "申": "신", "酉": "유", "戌": "술", "亥": "해",
}


# ─────────────────────────────────────────────────────────────
# 핵심 계산 함수
# ─────────────────────────────────────────────────────────────

def calculate_sibiun(stem: str, branch: str) -> dict:
    """
    천간이 지지를 만났을 때의 십이운성 반환
    
    Args:
        stem: 천간 한자 (예: "甲", "癸")
        branch: 지지 한자 (예: "寅", "子")
    
    Returns:
        {
            "sibiun": "건록",
            "phase": "왕성기",
            "vitality": 90,
            "modern_meaning": "안정적 실력 발휘, 직장·조직에서 인정"
        }
    """
    if not stem or not branch:
        return {}
    
    # 양간/음간 판별
    yang_stems = ["甲", "丙", "戊", "庚", "壬"]
    
    if stem in yang_stems:
        sibiun_map = YANG_SIBIUN.get(stem, {})
    else:
        sibiun_map = YIN_SIBIUN.get(stem, {})
    
    sibiun = sibiun_map.get(branch, "")
    if not sibiun:
        return {}
    
    # 단계 그룹 판정
    phase = ""
    for group_name, sibiun_list in PHASE_GROUP.items():
        if sibiun in sibiun_list:
            phase = group_name
            break
    
    return {
        "sibiun": sibiun,
        "phase": phase,
        "vitality": VITALITY_SCORE.get(sibiun, 0),
        "modern_meaning": MODERN_MEANING.get(sibiun, ""),
    }


# ─────────────────────────────────────────────────────────────
# 봉·거·좌법
# ─────────────────────────────────────────────────────────────

def analyze_bongbeop(saju_data: dict) -> dict:
    """
    봉법(逢法): 4개 천간이 바로 아래 지지를 만났을 때의 십이운성
    
    Returns:
        {
            "년간": {"stem": "庚", "branch": "辰", "sibiun": "양", "vitality": 60, "phase": "준비기", ...},
            "월간": {...},
            "일간": {...},  # 가장 중요
            "시간": {...}
        }
    """
    pillars = _extract_pillars(saju_data)
    if not pillars:
        return {}
    
    result = {}
    positions = [
        ("년간", "year"),
        ("월간", "month"),
        ("일간", "day"),
        ("시간", "hour"),
    ]
    
    for label, key in positions:
        p = pillars.get(key, "")
        if len(p) < 2:
            continue
        stem = p[0]
        branch = p[1]
        sibiun_result = calculate_sibiun(stem, branch)
        if sibiun_result:
            result[label] = {
                "stem": stem,
                "branch": branch,
                **sibiun_result,
            }
    
    return result


def analyze_geobeop(saju_data: dict) -> dict:
    """
    거법(居法): 각 지지가 일간 기준으로 어떤 십이운성 환경인지
    (천간이 없어도 지지 자체의 기운 판단)
    
    Returns:
        {
            "년지": {"branch": "辰", "ilgan_sibiun": "양", "vitality": 60, "meaning": "..."},
            "월지": {...},
            "일지": {...},
            "시지": {...}
        }
    """
    pillars = _extract_pillars(saju_data)
    if not pillars:
        return {}
    
    ilgan = ""
    day_pillar = pillars.get("day", "")
    if len(day_pillar) >= 1:
        ilgan = day_pillar[0]
    
    if not ilgan:
        return {}
    
    result = {}
    positions = [
        ("년지", "year"),
        ("월지", "month"),
        ("일지", "day"),
        ("시지", "hour"),
    ]
    
    for label, key in positions:
        p = pillars.get(key, "")
        if len(p) < 2:
            continue
        branch = p[1]
        sibiun_result = calculate_sibiun(ilgan, branch)
        if sibiun_result:
            result[label] = {
                "branch": branch,
                "ilgan_sibiun": sibiun_result.get("sibiun", ""),
                "vitality": sibiun_result.get("vitality", 0),
                "phase": sibiun_result.get("phase", ""),
                "meaning": sibiun_result.get("modern_meaning", ""),
            }
    
    return result


def analyze_jwabeop(saju_data: dict) -> dict:
    """
    좌법(坐法): 지장간 각 요소가 해당 지지에서 어떤 십이운성인지
    (속이 알찬지 비었는지 판단)
    
    Returns:
        {
            "년지": {
                "branch": "辰",
                "jijanggan": [
                    {"stem": "乙", "sibiun": "양", "vitality": 60},
                    {"stem": "癸", "sibiun": "묘", "vitality": 15},
                    {"stem": "戊", "sibiun": "관대", "vitality": 85}
                ],
                "summary": "속(戊 관대 85)이 알참"
            },
            ...
        }
    """
    pillars = _extract_pillars(saju_data)
    if not pillars:
        return {}
    
    result = {}
    positions = [
        ("년지", "year"),
        ("월지", "month"),
        ("일지", "day"),
        ("시지", "hour"),
    ]
    
    for label, key in positions:
        p = pillars.get(key, "")
        if len(p) < 2:
            continue
        branch = p[1]
        branch_hangul = HANJA_TO_HANGUL_BRANCH.get(branch, branch)
        jijanggan_list = get_jijanggan(branch_hangul) or []
        
        jijanggan_sibiun = []
        for item in jijanggan_list:
            if isinstance(item, dict):
                stem = item.get("hanja", "")
            else:
                stem = item
            
            if not stem:
                continue
            
            sibiun_result = calculate_sibiun(stem, branch)
            if sibiun_result:
                jijanggan_sibiun.append({
                    "stem": stem,
                    "sibiun": sibiun_result.get("sibiun", ""),
                    "vitality": sibiun_result.get("vitality", 0),
                    "phase": sibiun_result.get("phase", ""),
                })
        
        if jijanggan_sibiun:
            # 가장 강한 지장간 찾기
            max_vitality = max(j["vitality"] for j in jijanggan_sibiun)
            min_vitality = min(j["vitality"] for j in jijanggan_sibiun)
            
            if max_vitality >= 70:
                summary = f"속({jijanggan_sibiun[0]['stem']} {jijanggan_sibiun[0]['sibiun']} {max_vitality})이 알찬 구조"
            elif max_vitality <= 30:
                summary = "지장간 전체가 약한 구조, 겉만 있고 속이 비어있음"
            else:
                summary = f"중간 강도 구조 (최고 {max_vitality}점)"
            
            result[label] = {
                "branch": branch,
                "jijanggan": jijanggan_sibiun,
                "max_vitality": max_vitality,
                "min_vitality": min_vitality,
                "summary": summary,
            }
    
    return result


# ─────────────────────────────────────────────────────────────
# 통합 분석 함수
# ─────────────────────────────────────────────────────────────

def analyze_sibiun_full(saju_data: dict) -> dict:
    """
    십이운성 전체 분석 (봉·거·좌법 통합)
    
    Returns:
        {
            "bongbeop": {...},  # 4개 천간의 십이운성
            "geobeop": {...},   # 4개 지지의 일간 기준 십이운성
            "jwabeop": {...},   # 4개 지지 지장간의 십이운성
            "summary": {
                "ilgan_vitality": 90,
                "ilgan_phase": "왕성기",
                "strongest_stem": "일간",
                "weakest_stem": "시간"
            }
        }
    """
    bong = analyze_bongbeop(saju_data)
    geo = analyze_geobeop(saju_data)
    jwa = analyze_jwabeop(saju_data)
    
    # 요약 정보
    summary = {}
    ilgan_data = bong.get("일간", {})
    if ilgan_data:
        summary["ilgan_vitality"] = ilgan_data.get("vitality", 0)
        summary["ilgan_phase"] = ilgan_data.get("phase", "")
        summary["ilgan_sibiun"] = ilgan_data.get("sibiun", "")
    
    # 가장 강한/약한 천간 찾기
    stem_vitalities = []
    for label, data in bong.items():
        stem_vitalities.append((label, data.get("vitality", 0)))
    
    if stem_vitalities:
        stem_vitalities.sort(key=lambda x: x[1], reverse=True)
        summary["strongest_stem"] = stem_vitalities[0][0]
        summary["weakest_stem"] = stem_vitalities[-1][0]
    
    return {
        "bongbeop": bong,
        "geobeop": geo,
        "jwabeop": jwa,
        "summary": summary,
    }


# ─────────────────────────────────────────────────────────────
# GPT 프롬프트용 포맷팅
# ─────────────────────────────────────────────────────────────

def format_sibiun_for_prompt(sibiun_result: dict) -> str:
    """
    십이운성 분석 결과를 GPT가 읽기 쉬운 텍스트로 변환
    """
    lines = ["[십이운성 분석 — 에너지 출력 강도]"]
    
    bong = sibiun_result.get("bongbeop", {})
    if bong:
        lines.append("\n1) 봉법 (드러난 천간의 역량)")
        for label in ["년간", "월간", "일간", "시간"]:
            data = bong.get(label)
            if data:
                lines.append(
                    f"  {label} {data['stem']}: {data['sibiun']}({data['vitality']}점) — {data['modern_meaning']}"
                )
    
    geo = sibiun_result.get("geobeop", {})
    if geo:
        lines.append("\n2) 거법 (지지 환경)")
        for label in ["년지", "월지", "일지", "시지"]:
            data = geo.get(label)
            if data:
                lines.append(
                    f"  {label} {data['branch']}: 일간 기준 {data['ilgan_sibiun']}({data['vitality']}점)"
                )
    
    jwa = sibiun_result.get("jwabeop", {})
    if jwa:
        lines.append("\n3) 좌법 (지장간 내부)")
        for label in ["년지", "월지", "일지", "시지"]:
            data = jwa.get(label)
            if data:
                jj_strs = [
                    f"{j['stem']}({j['sibiun']} {j['vitality']})"
                    for j in data.get("jijanggan", [])
                ]
                lines.append(f"  {label} {data['branch']}: {', '.join(jj_strs)}")
                lines.append(f"    → {data['summary']}")
    
    summary = sibiun_result.get("summary", {})
    if summary:
        lines.append(f"\n[핵심] 일간 생명력: {summary.get('ilgan_sibiun', '')}({summary.get('ilgan_vitality', 0)}점) — {summary.get('ilgan_phase', '')}")
    
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────
# 내부 헬퍼
# ─────────────────────────────────────────────────────────────

def _extract_pillars(saju_data: dict) -> dict:
    """
    saju_data에서 pillars 추출 (year_pillar, month_pillar 등)
    
    Returns:
        {"year": "庚辰", "month": "乙酉", "day": "癸未", "hour": "庚申"}
    """
    return {
        "year": (saju_data.get("year_pillar") or "").strip(),
        "month": (saju_data.get("month_pillar") or "").strip(),
        "day": (saju_data.get("day_pillar") or "").strip(),
        "hour": (saju_data.get("hour_pillar") or "").strip(),
    }


# ─────────────────────────────────────────────────────────────
# 테스트
# ─────────────────────────────────────────────────────────────

def test_sibiun():
    """십이운성 계산 테스트"""
    print("\n=== 십이운성 테스트 ===")
    
    # 양간 테스트
    print("\n[양간 순행]")
    print("甲 + 寅:", calculate_sibiun("甲", "寅"))  # 건록
    print("丙 + 午:", calculate_sibiun("丙", "午"))  # 제왕
    print("庚 + 申:", calculate_sibiun("庚", "申"))  # 건록
    
    # 음간 테스트
    print("\n[음간 역행]")
    print("乙 + 卯:", calculate_sibiun("乙", "卯"))  # 건록
    print("癸 + 子:", calculate_sibiun("癸", "子"))  # 건록
    print("癸 + 未:", calculate_sibiun("癸", "未"))  # 묘
    
    # 실제 사주 테스트
    print("\n[실제 사주: 庚辰 乙酉 癸未 庚申]")
    test_saju = {
        "year_pillar": "庚辰",
        "month_pillar": "乙酉",
        "day_pillar": "癸未",
        "hour_pillar": "庚申",
    }
    
    bong = analyze_bongbeop(test_saju)
    print("\n봉법:")
    for label, data in bong.items():
        print(f"  {label}: {data['stem']}{data['branch']} → {data['sibiun']}({data['vitality']}점)")
    
    geo = analyze_geobeop(test_saju)
    print("\n거법 (일간 癸 기준):")
    for label, data in geo.items():
        print(f"  {label} {data['branch']}: {data['ilgan_sibiun']}({data['vitality']}점)")
    
    jwa = analyze_jwabeop(test_saju)
    print("\n좌법 (지장간):")
    for label, data in jwa.items():
        print(f"  {label} {data['branch']}: {data['summary']}")
        for j in data.get("jijanggan", []):
            print(f"    - {j['stem']}: {j['sibiun']}({j['vitality']}점)")
    
    full = analyze_sibiun_full(test_saju)
    print("\n통합 요약:")
    print(f"  일간 생명력: {full['summary'].get('ilgan_sibiun')}({full['summary'].get('ilgan_vitality')}점)")
    print(f"  가장 강한 천간: {full['summary'].get('strongest_stem')}")
    print(f"  가장 약한 천간: {full['summary'].get('weakest_stem')}")


if __name__ == "__main__":
    test_sibiun()
