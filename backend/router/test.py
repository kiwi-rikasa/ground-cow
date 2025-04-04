from fastapi import APIRouter
from sqlmodel import SQLModel
from sqlalchemy import inspect
from ..db import engine

test_router = APIRouter()


class TestResponse(SQLModel, table=False):
    message: str


class TablesResponse(SQLModel, table=False):
    tables: list[str]


@test_router.get("/", response_model=TestResponse)
def test():
    return {"message": "Hello, World!"}


@test_router.get("/tables", response_model=TablesResponse)
def get_tables():
    try:
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        return {"tables": table_names}
    except Exception as e:
        return {"tables": [f"error: {str(e)}"]}
