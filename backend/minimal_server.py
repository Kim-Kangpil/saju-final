"""
최소 FastAPI 서버 — DB/OpenAI/로직 없이 응답만 테스트
실행: cd backend && python minimal_server.py
브라우저: http://localhost:8000/ping
"""
from fastapi import FastAPI

app = FastAPI()


@app.get("/ping")
def ping():
    return "pong"


@app.get("/")
def root():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    print("최소 서버 시작 (포트 8000)... /ping 과 / 만 있습니다.")
    uvicorn.run(app, host="0.0.0.0", port=8000)
