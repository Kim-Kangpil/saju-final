# 사주명리 분석 엔진

완전한 사주 분석 및 해석 시스템

## 구조

```
saju-engine/
├── core/            # 분석 엔진 (십성, 신강약, 합충, 신살)
├── interpretation/  # 해석 엔진 (패턴 매칭 + 템플릿)
├── data/           # 이론 파일
├── api/            # FastAPI 서버
└── tests/          # 테스트
```

## 사용법

```python
from core.analyzer import FullSajuAnalyzer
from interpretation.generator import InterpretationGenerator

# 1. 분석
analyzer = FullSajuAnalyzer()
analysis = analyzer.analyze(day_stem='癸', pillars={
    'year': '庚辰',
    'month': '乙酉',
    'day': '癸未',
    'hour': '庚申'
})

# 2. 해석 생성
generator = InterpretationGenerator()
interpretations = generator.generate(analysis, tone='empathy')

# 3. 결과 (10개 섹션 × 1500자)
for section in interpretations:
    print(f"{section['title']}: {section['content'][:100]}...")
```

## 설치

```bash
pip install -r requirements.txt
```
