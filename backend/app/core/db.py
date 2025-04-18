from sqlmodel import create_engine
from app.core.config import settings
from app.models.models import SQLModel

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


def init_db():
    SQLModel.metadata.create_all(engine)
