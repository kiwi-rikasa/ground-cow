from sqlmodel import SQLModel
from sqlalchemy import inspect
from db import engine
from models.models import User, Event, Alert, Zone, Report

def start_db():
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

if __name__ == "__main__":
    start_db()