from fastapi import APIRouter
from .routes.user import user_router
from .routes.alert import alert_router

api_router = APIRouter()
api_router.include_router(user_router, prefix="/user", tags=["user"])
api_router.include_router(alert_router, prefix="/alert", tags=["alert"])


@api_router.get("/")
def root():
    return {"message": "Hello, World!"}
