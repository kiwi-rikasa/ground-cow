from fastapi import APIRouter
from sqlmodel import SQLModel

test_router = APIRouter()


class TestResponse(SQLModel, table=False):
    message: str


@test_router.get("/", response_model=TestResponse)
def test():
    return {"message": "Hello, World!"}
