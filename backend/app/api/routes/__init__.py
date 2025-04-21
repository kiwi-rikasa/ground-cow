from fastapi import APIRouter
from .user import user_router
from .alert import alert_router
from .event import event_router
from .zone import zone_router
from .report import report_router

api_router = APIRouter()
api_router.include_router(user_router, prefix="/user")
api_router.include_router(alert_router, prefix="/alert")
api_router.include_router(event_router, prefix="/event")
api_router.include_router(zone_router, prefix="/zone")
api_router.include_router(report_router, prefix="/report")

@api_router.get("/")
def root():
    return {"message": "Hello, World!"}
