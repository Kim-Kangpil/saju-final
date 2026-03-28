#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""리포트 LLM 캐시(report_cache) 전부 삭제. backend/.env 로드 후 실행."""
from __future__ import annotations

import sys
from pathlib import Path

_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from dotenv import load_dotenv

load_dotenv(_backend / ".env")

# .env 반영 후에만 logic 로드
from logic._db import USE_PG  # noqa: E402
from logic.saju_db import clear_all_report_cache  # noqa: E402


def main() -> None:
    n = clear_all_report_cache()
    print(f"report_cache 삭제 완료 (PostgreSQL={USE_PG}, 삭제 행 수={n})")


if __name__ == "__main__":
    main()
