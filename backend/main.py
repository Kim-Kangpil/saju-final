from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv
import openai

from logic import test
from logic import lunar_converter

# .env 파일 경로 명시
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# 디버깅용
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    print(f"🔑 API Key 로드됨: {api_key[:10]}...")
    client = openai.OpenAI(api_key=api_key)
else:
    print("⚠️  OPENAI_API_KEY 없음")
    client = None

app = FastAPI(title="Saju API", version="0.1.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 로드
DB_PATH = Path(__file__).resolve().parent / "logic" / "solar_terms_db.json"
DB = test.load_db(str(DB_PATH))
if DB is None:
    raise RuntimeError(f"solar_terms_db.json 로드 실패: {DB_PATH}")


# ==================== 모델 정의 ====================

class SajuRequest(BaseModel):
    calendar_type: str = Field(default="solar", description="solar 또는 lunar")
    year: int
    month: int
    day: int
    hour: int = Field(ge=0, le=23)
    minute: int = Field(ge=0, le=59)
    gender: str = Field(description="M 또는 F")
    is_leap_month: bool = Field(
        default=False, description="calendar_type이 lunar일 때만 의미 있음")


class PillarsResponse(BaseModel):
    input_datetime: str
    solar_datetime_used: str
    year_pillar: str
    month_pillar: str
    day_pillar: str
    hour_pillar: str


class FullResponse(PillarsResponse):
    daeun_start_age: int
    daeun_direction: str
    daeun_list: list


class InterpretRequest(BaseModel):
    day_stem: str
    year_pillar: str
    month_pillar: str
    day_pillar: str
    hour_pillar: str
    tone: str = "empathy"


class GPTInterpretRequest(BaseModel):
    """GPT 해석 요청 모델"""
    day_stem: str
    year_pillar: str
    month_pillar: str
    day_pillar: str
    hour_pillar: str
    tone: str = "empathy"
    year: Optional[int] = None
    month: Optional[int] = None
    day: Optional[int] = None
    hour: Optional[int] = None
    minute: Optional[int] = None
    gender: Optional[str] = None


# ==================== 헬퍼 함수 ====================

def _parse_gender(g: str) -> str:
    g = (g or "").strip().upper()
    if g not in ("M", "F"):
        raise ValueError("gender는 M 또는 F")
    return g


def _to_datetime(req: SajuRequest) -> tuple:
    gender = _parse_gender(req.gender)

    if req.calendar_type not in ("solar", "lunar"):
        raise ValueError("calendar_type은 solar 또는 lunar")

    if req.calendar_type == "solar":
        solar_dt = datetime(req.year, req.month, req.day, req.hour, req.minute)
        return solar_dt, solar_dt

    solar_y, solar_m, solar_d = lunar_converter.convert_lunar_to_solar(
        req.year, req.month, req.day, req.is_leap_month
    )
    solar_dt = datetime(solar_y, solar_m, solar_d, req.hour, req.minute)
    return solar_dt, solar_dt


def calculate_element_counts(pillars: dict) -> dict:
    """오행 카운트 계산"""
    element_map = {
        "甲": "wood", "乙": "wood",
        "丙": "fire", "丁": "fire",
        "戊": "earth", "己": "earth",
        "庚": "metal", "辛": "metal",
        "壬": "water", "癸": "water",
        "寅": "wood", "卯": "wood",
        "巳": "fire", "午": "fire",
        "辰": "earth", "戌": "earth", "丑": "earth", "未": "earth",
        "申": "metal", "酉": "metal",
        "子": "water", "亥": "water",
    }

    counts = {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0}

    for pillar in pillars.values():
        for char in pillar:
            element = element_map.get(char)
            if element:
                counts[element] += 1

    return counts


def get_title_by_tone(tone: str) -> str:
    """톤에 따른 제목 반환"""
    titles = {
        "empathy": "당신의 오행 에너지",
        "reality": "오행 분포 분석",
        "fun": "너 오행 밸런스 어때?"
    }
    return titles.get(tone, "오행 분석")


def format_ten_gods(ten_gods: dict) -> str:
    """십성 포맷팅"""
    lines = []
    for god, count in ten_gods.items():
        if count > 0:
            lines.append(f"- {god}: {count}개")
    return "\n".join(lines) if lines else "없음"


def split_pillar(pillar: str) -> tuple:
    """기둥을 천간/지지로 분리"""
    if len(pillar) >= 2:
        return pillar[0], pillar[1]
    return '', ''


# ==================== 엔드포인트 ====================

@app.get("/health")
def health():
    return {"ok": True}


@app.post("/saju/full")
async def get_full_saju(req: SajuRequest):
    """✅ 전체 사주 분석 (프론트엔드에서 사용)"""
    try:
        birth_dt, solar_dt_used = _to_datetime(req)

        yj = test.calculate_year_pillar(solar_dt_used, DB)
        mj = test.calculate_month_pillar(solar_dt_used, yj, DB)
        dj = test.calculate_day_pillar(solar_dt_used)
        sj = test.calculate_hour_pillar(solar_dt_used, dj)

        return {
            "input_datetime": f"{req.year}-{req.month:02d}-{req.day:02d} {req.hour:02d}:{req.minute:02d}",
            "solar_datetime_used": solar_dt_used.strftime("%Y-%m-%d %H:%M"),
            "year_pillar": yj,
            "month_pillar": mj,
            "day_pillar": dj,
            "hour_pillar": sj,
        }
    except Exception as e:
        print(f"❌ /saju/full 에러: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/saju/pillars", response_model=PillarsResponse)
def saju_pillars(req: SajuRequest):
    try:
        gender = _parse_gender(req.gender)
        birth_dt, solar_dt_used = _to_datetime(req)

        yj = test.calculate_year_pillar(
            solar_dt_used.year, solar_dt_used.month, solar_dt_used.day, DB)
        mj = test.calculate_month_pillar(
            solar_dt_used.year, solar_dt_used.month, solar_dt_used.day, DB)
        dj = test.calculate_day_pillar(
            solar_dt_used.year, solar_dt_used.month, solar_dt_used.day)
        sj = test.calculate_hour_pillar(dj[0], solar_dt_used.hour)

        return {
            "input_datetime": f"{req.year:04d}-{req.month:02d}-{req.day:02d} {req.hour:02d}:{req.minute:02d}",
            "solar_datetime_used": solar_dt_used.strftime("%Y-%m-%d %H:%M"),
            "year_pillar": yj,
            "month_pillar": mj,
            "day_pillar": dj,
            "hour_pillar": sj,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/saju/interpret-test")
async def test_new_engine(req: InterpretRequest):
    """새 해석 엔진 (GPT + 이론 DB)"""
    try:
        from logic.saju_engine.core.analyzer import analyze_full_saju

        pillars = {
            'year': req.year_pillar,
            'month': req.month_pillar,
            'day': req.day_pillar,
            'hour': req.hour_pillar
        }

        analysis = analyze_full_saju(req.day_stem, pillars)

        try:
            from logic.gpt_generator import GPTInterpretationGenerator

            generator = GPTInterpretationGenerator(
                api_key=os.getenv("OPENAI_API_KEY"))
            interpretation = generator.generate_section1(
                analysis, tone=req.tone)

            return {
                "success": True,
                "analysis": {
                    "strength": analysis['summary']['strength'],
                    "score": analysis['summary']['strength_score'],
                    "patterns": analysis.get('patterns', [])
                },
                "interpretations": [interpretation]
            }

        except Exception as gpt_error:
            print(f"⚠️ GPT 실패, 기본 해석 사용: {gpt_error}")

            from logic.saju_engine.interpretation.generator import InterpretationGenerator
            fallback_gen = InterpretationGenerator()
            interpretations = fallback_gen.generate(analysis, tone=req.tone)

            return {
                "success": True,
                "analysis": {
                    "strength": analysis['summary']['strength'],
                    "score": analysis['summary']['strength_score'],
                    "patterns": analysis.get('patterns', [])
                },
                "interpretations": interpretations
            }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


@app.post("/saju/interpret-gpt")
async def interpret_with_gpt(req: GPTInterpretRequest):
    """✅ RAG 기반 GPT 오행 해석 (합화 포함)"""
    try:
        print(f"✅ GPT 해석 요청: day_stem={req.day_stem}, tone={req.tone}")

        # ✅ 1. 사주 분석 준비
        pillars_dict = {
            'year': req.year_pillar,
            'month': req.month_pillar,
            'day': req.day_pillar,
            'hour': req.hour_pillar
        }

        # ✅ 2. 해석 엔진으로 상세 분석
        from logic.saju_engine.core.analyzer import analyze_full_saju

        analysis = analyze_full_saju(req.day_stem, pillars_dict)

        # ✅ pillars 정보 보강 (합화 계산용)
        if 'pillars' not in analysis or not analysis['pillars']:
            print("⚠️  pillars 없음, 생성 중...")
            analysis['pillars'] = {}

            for pos, pillar_str in pillars_dict.items():
                stem, branch = split_pillar(pillar_str)
                analysis['pillars'][pos] = {
                    'heavenly_stem': stem,
                    'earthly_branch': branch
                }

            print(f"✅ pillars 생성 완료: {analysis['pillars']}")

        print(
            f"📊 신강약: {analysis['summary']['strength']} ({analysis['summary']['strength_score']}점)")

        # ✅ 3. 오행 카운트 (안전하게)
        if 'element_count' in analysis['summary']:
            element_counts = analysis['summary']['element_count']
            print(f"📊 오행 분포 (엔진): {element_counts}")
        else:
            element_counts = calculate_element_counts(pillars_dict)
            print(f"📊 오행 분포 (직접): {element_counts}")

        # 십성 분포
        if 'ten_gods_count' in analysis['summary']:
            print(f"📊 십성 분포: {analysis['summary']['ten_gods_count']}")

        # 패턴
        if 'patterns' in analysis:
            print(f"📊 패턴: {analysis.get('patterns', [])}")

        # ✅ 4. 이론 검색
        theories = ""
        try:
            from logic.theory_retriever import TheoryRetriever
            retriever = TheoryRetriever()
            theories = retriever.get_relevant_theories(analysis)
            print(f"📚 검색된 이론: {len(theories)}자")
        except Exception as e:
            print(f"⚠️ 이론 검색 실패: {e}")

        # ✅ 5. 합화 정보 계산
        from logic.gpt_generator import GPTInterpretationGenerator
        generator = GPTInterpretationGenerator()

        # 🔥 Tuple 언패킹으로 수정
        transformed_counts, transformations = generator._apply_harmony_transformation(
            element_counts,
            analysis
        )

        print(f"🔥 합화 발견: {len(transformations)}건")
        for trans in transformations:
            print(f"   - {trans.get('name', '')}")

        # ✅ 6. GPT 해석 생성
        try:
            content = generator.generate_comprehensive_interpretation(
                analysis=analysis,
                tone=req.tone,
                theories=theories
            )

            print(f"✅ GPT 해석 생성 완료: {len(content)}자")

            return {
                "success": True,
                "interpretations": [{
                    "section": "elements",
                    "title": get_title_by_tone(req.tone),
                    "content": content,
                    "related_theories": ["신강약", "오행십신", "합충", "신살"]
                }],
                "metadata": {
                    "model": "gpt-4o",
                    "day_stem": req.day_stem,
                    "tone": req.tone,
                    "strength": analysis['summary']['strength'],
                    "strength_score": analysis['summary']['strength_score'],
                    "element_counts": element_counts,
                    "ten_gods": analysis['summary']['ten_gods_count'],
                    "patterns": analysis.get('patterns', []),
                    # ✅ 합화 정보 추가
                    "harmony": {
                        "original": element_counts,
                        "transformed": transformed_counts,
                        "transformations": transformations
                    }
                }
            }

        except Exception as e:
            print(f"❌ GPT 생성 실패: {e}")
            import traceback
            traceback.print_exc()

            # 폴백
            fallback_content = f"""## 🌈 당신의 오행 에너지

**신강약:** {analysis['summary']['strength']} ({analysis['summary']['strength_score']}점)

**오행 분포:**
- 木(나무): {element_counts.get('wood', 0)}개
- 火(불): {element_counts.get('fire', 0)}개
- 土(흙): {element_counts.get('earth', 0)}개
- 金(쇠): {element_counts.get('metal', 0)}개
- 水(물): {element_counts.get('water', 0)}개

**십성 분포:**
{format_ten_gods(analysis['summary']['ten_gods_count'])}

**발견된 패턴:**
{', '.join(analysis.get('patterns', [])) if analysis.get('patterns') else '없음'}

현재 GPT 해석 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
"""

            return {
                "success": True,
                "interpretations": [{
                    "section": "elements",
                    "title": get_title_by_tone(req.tone),
                    "content": fallback_content,
                    "related_theories": []
                }],
                "metadata": {
                    "model": "fallback",
                    "day_stem": req.day_stem,
                    "tone": req.tone,
                    "strength": analysis['summary']['strength'],
                    "element_counts": element_counts,
                    "harmony": {
                        "original": element_counts,
                        "transformed": transformed_counts,
                        "transformations": transformations
                    }
                }
            }

    except Exception as e:
        print(f"❌ 전체 실패: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
