# -*- coding: utf-8 -*-
"""
sibsung_mix.resolve_mixed_sibsung 단위 테스트

판정 케이스:
  A. 정+편 동시 존재           → mixed=True,  effective=편
  B. 정만 3개 이상             → mixed=True,  effective=편
  C. 편만 존재                 → mixed=False, effective=편
  D. 정만 1~2개               → mixed=False, effective=정
  E. 해당 그룹 없음            → total=0, effective=None, mixed=False
  F. 정·편 동수 (정+편 혼잡)  → mixed=True,  effective=편
  G. 빈 리스트                 → 모든 그룹 total=0
  H. 알 수 없는 십성 포함      → 무시하고 나머지 정상 처리
  I. 정만 정확히 3개           → mixed=True  (경계값)
  J. 정만 2개                  → mixed=False (경계값 바로 아래)
  K. 전체 그룹 동시 혼잡       → 5개 그룹 모두 mixed=True
"""
import pytest
from logic.saju_engine.core.sibsung_mix import resolve_mixed_sibsung, PAIR_MAP


# ──────────────────────────────────────────────────────────────
# 헬퍼
# ──────────────────────────────────────────────────────────────
def group(result: dict, name: str) -> dict:
    return result[name]


# ──────────────────────────────────────────────────────────────
# A. 정 + 편 동시 존재 → mixed=True, effective=편
# ──────────────────────────────────────────────────────────────
class TestRuleA:
    def test_bicheop_mixed(self):
        res = resolve_mixed_sibsung(["비견", "겁재"])
        g = group(res, "비겁")
        assert g["mixed"] is True
        assert g["effective"] == "겁재"
        assert g["jeong_cnt"] == 1
        assert g["pyeon_cnt"] == 1
        assert g["total"] == 2

    def test_sikssang_mixed(self):
        res = resolve_mixed_sibsung(["식신", "상관", "식신"])
        g = group(res, "식상")
        assert g["mixed"] is True
        assert g["effective"] == "상관"
        assert g["jeong_cnt"] == 2
        assert g["pyeon_cnt"] == 1

    def test_jaeseong_mixed(self):
        res = resolve_mixed_sibsung(["정재", "편재"])
        g = group(res, "재성")
        assert g["mixed"] is True
        assert g["effective"] == "편재"

    def test_gwanseong_mixed(self):
        res = resolve_mixed_sibsung(["정관", "편관"])
        g = group(res, "관성")
        assert g["mixed"] is True
        assert g["effective"] == "편관"

    def test_inseong_mixed(self):
        res = resolve_mixed_sibsung(["정인", "편인"])
        g = group(res, "인성")
        assert g["mixed"] is True
        assert g["effective"] == "편인"


# ──────────────────────────────────────────────────────────────
# B. 정만 3개 이상 → mixed=True, effective=편
# ──────────────────────────────────────────────────────────────
class TestRuleB:
    def test_jeong_three_exact(self):
        """경계값: 정 정확히 3개 → 혼잡"""
        res = resolve_mixed_sibsung(["비견", "비견", "비견"])
        g = group(res, "비겁")
        assert g["mixed"] is True
        assert g["effective"] == "겁재"
        assert g["jeong_cnt"] == 3
        assert g["pyeon_cnt"] == 0

    def test_jeong_four(self):
        res = resolve_mixed_sibsung(["정관", "정관", "정관", "정관"])
        g = group(res, "관성")
        assert g["mixed"] is True
        assert g["effective"] == "편관"

    def test_jeong_inseong_three(self):
        res = resolve_mixed_sibsung(["정인", "정인", "정인"])
        g = group(res, "인성")
        assert g["mixed"] is True
        assert g["effective"] == "편인"


# ──────────────────────────────────────────────────────────────
# C. 편만 존재 → mixed=False, effective=편
# ──────────────────────────────────────────────────────────────
class TestRuleC:
    def test_pyeon_only_single(self):
        res = resolve_mixed_sibsung(["겁재"])
        g = group(res, "비겁")
        assert g["mixed"] is False
        assert g["effective"] == "겁재"

    def test_pyeon_only_multiple(self):
        res = resolve_mixed_sibsung(["편재", "편재", "편재"])
        g = group(res, "재성")
        assert g["mixed"] is False
        assert g["effective"] == "편재"

    def test_pyeon_gwanseong(self):
        res = resolve_mixed_sibsung(["편관", "편관"])
        g = group(res, "관성")
        assert g["mixed"] is False
        assert g["effective"] == "편관"


# ──────────────────────────────────────────────────────────────
# D. 정만 1~2개 → mixed=False, effective=정
# ──────────────────────────────────────────────────────────────
class TestRuleD:
    def test_jeong_one(self):
        res = resolve_mixed_sibsung(["정재"])
        g = group(res, "재성")
        assert g["mixed"] is False
        assert g["effective"] == "정재"

    def test_jeong_two(self):
        """경계값: 정 2개 → 혼잡 아님"""
        res = resolve_mixed_sibsung(["비견", "비견"])
        g = group(res, "비겁")
        assert g["mixed"] is False
        assert g["effective"] == "비견"
        assert g["jeong_cnt"] == 2

    def test_jeong_sikssang_one(self):
        res = resolve_mixed_sibsung(["식신"])
        g = group(res, "식상")
        assert g["mixed"] is False
        assert g["effective"] == "식신"


# ──────────────────────────────────────────────────────────────
# E. 해당 그룹 없음 → total=0, effective=None, mixed=False
# ──────────────────────────────────────────────────────────────
class TestRuleE:
    def test_empty_group(self):
        # 식상만 입력 → 비겁 그룹은 비어 있어야 함
        res = resolve_mixed_sibsung(["식신", "상관"])
        g = group(res, "비겁")
        assert g["total"] == 0
        assert g["effective"] is None
        assert g["mixed"] is False

    def test_all_groups_present_one_missing(self):
        res = resolve_mixed_sibsung(["비견", "식신", "정재", "정관"])
        # 인성 없음
        g = group(res, "인성")
        assert g["total"] == 0
        assert g["effective"] is None


# ──────────────────────────────────────────────────────────────
# F. 정·편 동수 (정=1, 편=1) → 규칙1 적용, mixed=True, effective=편
# ──────────────────────────────────────────────────────────────
class TestRuleF:
    def test_tie_jeong_pyeon(self):
        res = resolve_mixed_sibsung(["정인", "편인"])
        g = group(res, "인성")
        assert g["mixed"] is True
        assert g["effective"] == "편인"

    def test_tie_two_each(self):
        res = resolve_mixed_sibsung(["정관", "정관", "편관", "편관"])
        g = group(res, "관성")
        assert g["mixed"] is True
        assert g["effective"] == "편관"


# ──────────────────────────────────────────────────────────────
# G. 빈 리스트 → 모든 그룹 total=0
# ──────────────────────────────────────────────────────────────
class TestRuleG:
    def test_empty_list(self):
        res = resolve_mixed_sibsung([])
        for group_name in PAIR_MAP:
            assert res[group_name]["total"] == 0
            assert res[group_name]["effective"] is None
            assert res[group_name]["mixed"] is False

    def test_returns_all_five_groups(self):
        res = resolve_mixed_sibsung([])
        assert set(res.keys()) == set(PAIR_MAP.keys())


# ──────────────────────────────────────────────────────────────
# H. 알 수 없는 십성 포함 → 무시하고 나머지 정상 처리
# ──────────────────────────────────────────────────────────────
class TestRuleH:
    def test_unknown_ten_god_ignored(self):
        res = resolve_mixed_sibsung(["알 수 없음", "비견", "Unknown", "겁재"])
        g = group(res, "비겁")
        assert g["mixed"] is True
        assert g["effective"] == "겁재"
        assert g["total"] == 2

    def test_only_unknown(self):
        res = resolve_mixed_sibsung(["알 수 없음", "Unknown", ""])
        for group_name in PAIR_MAP:
            assert res[group_name]["total"] == 0


# ──────────────────────────────────────────────────────────────
# I. 경계값 — 정 정확히 3개 → mixed=True
# ──────────────────────────────────────────────────────────────
class TestBoundaryI:
    def test_exactly_three_jeong(self):
        res = resolve_mixed_sibsung(["정재", "정재", "정재"])
        g = group(res, "재성")
        assert g["mixed"] is True
        assert g["jeong_cnt"] == 3
        assert g["pyeon_cnt"] == 0


# ──────────────────────────────────────────────────────────────
# J. 경계값 — 정 정확히 2개 → mixed=False
# ──────────────────────────────────────────────────────────────
class TestBoundaryJ:
    def test_exactly_two_jeong(self):
        res = resolve_mixed_sibsung(["정재", "정재"])
        g = group(res, "재성")
        assert g["mixed"] is False
        assert g["effective"] == "정재"
        assert g["jeong_cnt"] == 2


# ──────────────────────────────────────────────────────────────
# K. 전체 5개 그룹 동시 혼잡
# ──────────────────────────────────────────────────────────────
class TestRuleK:
    def test_all_groups_mixed(self):
        all_mixed = [
            "비견", "겁재",   # 비겁: 정+편
            "식신", "상관",   # 식상: 정+편
            "정재", "편재",   # 재성: 정+편
            "정관", "편관",   # 관성: 정+편
            "정인", "편인",   # 인성: 정+편
        ]
        res = resolve_mixed_sibsung(all_mixed)
        for group_name in PAIR_MAP:
            assert res[group_name]["mixed"] is True, f"{group_name} should be mixed"
            _, pyeon = PAIR_MAP[group_name]
            assert res[group_name]["effective"] == pyeon


# ──────────────────────────────────────────────────────────────
# 출력 구조 검증
# ──────────────────────────────────────────────────────────────
class TestOutputStructure:
    REQUIRED_KEYS = {"jeong", "pyeon", "jeong_cnt", "pyeon_cnt", "effective", "mixed", "total"}

    def test_all_required_keys_present(self):
        res = resolve_mixed_sibsung(["비견", "정관"])
        for group_name, data in res.items():
            missing = self.REQUIRED_KEYS - set(data.keys())
            assert not missing, f"{group_name} missing keys: {missing}"

    def test_jeong_pyeon_names_match_pair_map(self):
        res = resolve_mixed_sibsung([])
        for group_name, data in res.items():
            jeong_expected, pyeon_expected = PAIR_MAP[group_name]
            assert data["jeong"] == jeong_expected
            assert data["pyeon"] == pyeon_expected

    def test_total_equals_sum(self):
        res = resolve_mixed_sibsung(["비견", "비견", "겁재", "정관"])
        g = group(res, "비겁")
        assert g["total"] == g["jeong_cnt"] + g["pyeon_cnt"]

    def test_mixed_is_bool(self):
        res = resolve_mixed_sibsung(["비견"])
        for data in res.values():
            assert isinstance(data["mixed"], bool)
