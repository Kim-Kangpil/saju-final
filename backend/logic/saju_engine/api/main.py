#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
사주 해석 API 서버 (테스트용)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys

sys.path.append('/home/claude/saju-engine')

from core import analyze_full_saju
from interpretation.generator import InterpretationGenerator

app = FastAPI(title="사주 해석 API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청 모델
class SajuRequest(BaseModel):
    day_stem: str
    year: str
    month: str
    day: str
    hour: str
    tone: str = "empathy"  # empathy | reality | fun

# 응답 테스트
@app.get("/")
def root():
    return {"message": "사주 해석 API 서버", "status": "running"}

# 해석 API
@app.post("/api/interpret")
def interpret_saju(request: SajuRequest):
    """
    사주 해석 생성
    
    POST /api/interpret
    {
        "day_stem": "癸",
        "year": "庚辰",
        "month": "乙酉",
        "day": "癸未",
        "hour": "庚申",
        "tone": "empathy"
    }
    """
    try:
        # 1. 분석
        pillars = {
            'year': request.year,
            'month': request.month,
            'day': request.day,
            'hour': request.hour
        }
        
        analysis = analyze_full_saju(request.day_stem, pillars)
        
        # 2. 해석 생성
        generator = InterpretationGenerator()
        interpretations = generator.generate(analysis, tone=request.tone)
        
        return {
            "success": True,
            "data": {
                "analysis_summary": {
                    "strength": analysis['summary']['strength'],
                    "strength_score": analysis['summary']['strength_score'],
                    "ten_gods": analysis['summary']['ten_gods_count'],
                    "patterns": len(analysis.get('patterns', []))
                },
                "interpretations": interpretations
            }
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# 전체 톤 생성
@app.post("/api/interpret/all-tones")
def interpret_all_tones(request: SajuRequest):
    """
    모든 톤 해석 생성
    """
    try:
        pillars = {
            'year': request.year,
            'month': request.month,
            'day': request.day,
            'hour': request.hour
        }
        
        analysis = analyze_full_saju(request.day_stem, pillars)
        generator = InterpretationGenerator()
        all_tones = generator.generate_all_tones(analysis)
        
        return {
            "success": True,
            "data": {
                "analysis_summary": {
                    "strength": analysis['summary']['strength'],
                    "strength_score": analysis['summary']['strength_score'],
                    "patterns": analysis.get('patterns', [])
                },
                "interpretations": all_tones
            }
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
