from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    pass


# The database configuration is intentionally lazy: importing models must not
# open a connection, while repositories and the application can safely call
# ``init_db`` more than once.
engine = None
SessionLocal = None


def init_db() -> None:
    """Configure the database and create any missing tables.

    This is safe to call from the API, workers, and tests.  In particular, it
    must never drop existing tables: an application restart should not erase
    FIRMS observations or ingestion history.
    """
    global engine, SessionLocal

    if engine is None or SessionLocal is None:
        settings = get_settings()
        # Render's managed Postgres exposes `postgresql://...`, while this project
        # installs Psycopg 3 (not psycopg2). Select SQLAlchemy's Psycopg 3 dialect
        # explicitly so the same DATABASE_URL works locally, in Docker, and on Render.
        database_url = settings.database_url
        if database_url.startswith("postgresql://"):
            database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
        engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)
        SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    # Import models so they're registered with Base metadata
    from . import models  # noqa: F401
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
