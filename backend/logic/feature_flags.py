from __future__ import annotations

import os
from functools import lru_cache


@lru_cache(maxsize=1)
def use_new_saju_engine() -> bool:
    """
    신규 사주 엔진 사용 여부를 결정하는 feature flag.

    - 환경변수 SAJU_ENGINE_VERSION=new 인 경우: 항상 신규 엔진 사용
    - 환경변수 SAJU_ENGINE_VERSION=old 인 경우: 항상 기존 엔진 사용
    - 지정되지 않은 경우: 기본은 신규 엔진 사용
    """
    value = (os.getenv("SAJU_ENGINE_VERSION") or "").strip().lower()
    if value in ("old", "legacy"):
        return False
    if value in ("new", "v2"):
        return True
    return True


def get_engine_version_label() -> str:
    return "new" if use_new_saju_engine() else "old"

