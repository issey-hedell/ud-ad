"""API v1 ルーター"""

from fastapi import APIRouter

api_router = APIRouter()


# 各エンドポイントのルーターをここでインクルード
# from app.api.v1.endpoints import users, items
# api_router.include_router(users.router, prefix="/users", tags=["users"])
# api_router.include_router(items.router, prefix="/items", tags=["items"])


@api_router.get("/")
async def root():
    """APIルート"""
    return {"message": "API v1"}
