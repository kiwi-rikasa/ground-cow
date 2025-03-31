from sqlmodel import create_engine, Session
from dotenv import load_dotenv
import os

is_loaded = load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if not is_loaded or not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")


engine = create_engine(DATABASE_URL)


def get_session():
    with Session(engine) as session:
        yield session
