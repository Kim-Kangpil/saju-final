# 웹 테스트 가이드

## 🚀 서버 실행 방법

### 1. 의존성 설치
```bash
cd /home/claude/saju-engine
pip install fastapi uvicorn pydantic
```

### 2. 서버 시작
```bash
cd /home/claude/saju-engine
python api/main.py
```

또는:
```bash
cd /home/claude/saju-engine
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 브라우저에서 테스트

**방법 1: 테스트 페이지**
```
http://localhost:8000/api/test.html
```

**방법 2: API 직접 호출**
```bash
curl -X POST http://localhost:8000/api/interpret \
  -H "Content-Type: application/json" \
  -d '{
    "day_stem": "癸",
    "year": "庚辰",
    "month": "乙酉",
    "day": "癸未",
    "hour": "庚申",
    "tone": "empathy"
  }'
```

---

## 📡 API 엔드포인트

### 1. 상태 확인
```
GET http://localhost:8000/
```

### 2. 해석 생성 (단일 톤)
```
POST http://localhost:8000/api/interpret

Body:
{
    "day_stem": "癸",
    "year": "庚辰",
    "month": "乙酉",
    "day": "癸未",
    "hour": "庚申",
    "tone": "empathy"  // empathy | reality | fun
}

Response:
{
    "success": true,
    "data": {
        "analysis_summary": {
            "strength": "신강",
            "strength_score": 60,
            "ten_gods": {...},
            "patterns": 11
        },
        "interpretations": [
            {
                "section_id": 1,
                "title": "충분한 에너지, 부족한 출구",
                "content": "당신의 사주를 보면...",
                "tone": "empathy"
            }
        ]
    }
}
```

### 3. 모든 톤 생성
```
POST http://localhost:8000/api/interpret/all-tones

Body: (위와 동일, tone 제외)

Response:
{
    "success": true,
    "data": {
        "analysis_summary": {...},
        "interpretations": {
            "empathy": [...],
            "reality": [...],
            "fun": [...]
        }
    }
}
```

---

## 🔗 기존 햄스터 웹페이지 연결 방법

### Option A: API 주소만 변경
기존 프론트엔드 코드에서:
```typescript
// 기존
const response = await fetch('/api/saju/analyze', {...})

// 변경
const response = await fetch('http://localhost:8000/api/interpret', {...})
```

### Option B: 백엔드 통합
1. `saju-engine` 폴더를 기존 `backend/` 안에 복사
2. `backend/main.py`에 임포트 추가:
```python
from saju_engine.core import analyze_full_saju
from saju_engine.interpretation.generator import InterpretationGenerator
```
3. 기존 API 엔드포인트 로직만 교체

---

## 🎯 햄스터 웹페이지 적용 순서

### 1. 테스트 서버 실행
```bash
cd /home/claude/saju-engine
python api/main.py
```

### 2. 테스트 페이지에서 확인
```
http://localhost:8000/api/test.html
```

### 3. 잘 작동하면 기존 프론트에 연결
- 기존 프론트의 API 호출 부분만 수정
- `/api/saju/analyze` → `/api/interpret`
- 응답 형식 맞추기

### 4. 해석 부분만 교체
- 기존 UI는 그대로
- 해석 텍스트만 새 엔진 결과로 교체

---

## 💡 예상 결과

**입력:**
- 사주: 庚辰 乙酉 癸未 庚申
- 톤: empathy

**출력:**
```json
{
    "section_id": 1,
    "title": "충분한 에너지, 부족한 출구",
    "content": "당신의 사주를 보면, 마치 풍요로운 샘물이... (1469자)",
    "tone": "empathy"
}
```

**웹페이지에 표시:**
- 아코디언으로 섹션별 표시
- 톤 선택 가능
- 1500자 내외 깔끔한 해석
