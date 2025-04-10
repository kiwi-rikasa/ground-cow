from fastapi import APIRouter
from .test import test_router
from .user import user_router
from .alert import alert_router

api_router = APIRouter()
api_router.include_router(test_router, prefix="/test")
api_router.include_router(user_router, prefix="/user")
api_router.include_router(alert_router, prefix="/alert")
