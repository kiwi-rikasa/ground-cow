from fastapi import APIRouter
from .routes.user import user_router
from .routes.session import session_router
from .routes.earthquake import earthquake_router
from .routes.alert import alert_router
from .routes.event import event_router
from .routes.zone import zone_router
from .routes.report import report_router

api_router = APIRouter()
api_router.include_router(user_router, prefix="/user", tags=["user"])
api_router.include_router(session_router, prefix="/session", tags=["session"])
api_router.include_router(earthquake_router, prefix="/earthquake", tags=["earthquake"])
api_router.include_router(alert_router, prefix="/alert", tags=["alert"])
api_router.include_router(event_router, prefix="/event", tags=["event"])
api_router.include_router(zone_router, prefix="/zone", tags=["zone"])
api_router.include_router(report_router, prefix="/report", tags=["report"])


@api_router.get("/")
def root():
    return {"message": "Hello, World!"}
