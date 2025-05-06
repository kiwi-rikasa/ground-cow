from sqlmodel import Session


def seed_db(session: Session) -> None:
    print("Seeding database", session)
    pass
