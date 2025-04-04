from fastapi import APIRouter
from sqlmodel import SQLModel
from sqlalchemy import text
from ..db import engine
test_router = APIRouter()


class TestResponse(SQLModel, table=False):
    message: str


@test_router.get("/", response_model=TestResponse)
def test():
    return {"message": "Hello, World!"}

@test_router.get("/tables")
def get_tables():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name FROM information_schema.tables
                WHERE table_schema = 'public'
            """))
            return {"tables": [row[0] for row in result]}
    except Exception as e:
        return {"error": str(e)}