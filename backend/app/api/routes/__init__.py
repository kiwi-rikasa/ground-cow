from fastapi import APIRouter
from .user import user_router
from .alert import alert_router

api_router = APIRouter()
api_router.include_router(user_router, prefix="/user")
api_router.include_router(alert_router, prefix="/alert")


@api_router.get("/")
def root():
    return {"message": "Hello, World!"}
