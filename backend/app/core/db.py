from sqlmodel import create_engine, SQLModel
from sqlalchemy import inspect
from dotenv import load_dotenv
import os
from app.models.models import User, Event, Alert, Zone, Report

# First check if DATABASE_URL is already set (e.g., in testing environment)
DATABASE_URL = os.getenv("DATABASE_URL")

# If not set, try to load from .env file
if not DATABASE_URL:
    is_loaded = load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL")

    if not is_loaded or not DATABASE_URL:
        raise ValueError("DATABASE_URL is not set")


engine = create_engine(DATABASE_URL)


def init_db():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    required_tables = [
        User.__tablename__,
        Event.__tablename__,
        Alert.__tablename__,
        Zone.__tablename__,
        Report.__tablename__,
    ]
    missing_tables = [t for t in required_tables if t not in existing_tables]
    if missing_tables:
        print(f"Missing tables: {missing_tables}. Creating...")
        SQLModel.metadata.create_all(engine)
        print("Missing tables created.")
    else:
        print("All required tables already exist.")
