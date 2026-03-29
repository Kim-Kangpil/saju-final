from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/report/basic")
async def get_basic_report(request: Request):
    # Implement the logic to retrieve and return the basic report
    return JSONResponse(content={"message": "Basic report content"})
