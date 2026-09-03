"""
Centralized SQLAlchemy Engine and Session Management Module.
Provides thread-safe connection pooling, SessionLocal factory, and FastAPI get_db dependency.
"""
import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError, DBAPIError

from app.core.config import settings

from app.core.exceptions import AppException

logger = logging.getLogger("kintsugi.db")

# SQLAlchemy Engine Configuration for MySQL / MariaDB (PyMySQL)
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,       # Health check connections before checkout
        pool_recycle=3600,        # Recycle connections after 1 hour to prevent stale sockets
        pool_size=10,             # Base connection pool size
        max_overflow=20,          # Allow up to 20 temporary overflow connections
        pool_timeout=30,          # Connection checkout timeout in seconds
        echo=False,               # Disable raw SQL log dumping in production
        future=True,              # Enforce SQLAlchemy 2.0 API conventions
    )
except Exception as err:
    logger.critical(f"Failed to initialize SQLAlchemy database engine: {err}")
    raise RuntimeError("Database engine initialization failed") from err

# Thread-safe Session Factory
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI Dependency Generator for database session lifecycle management.
    Yields a SessionLocal instance, rolls back on exceptions, and ensures cleanup.
    """
    db: Session = SessionLocal()
    try:
        yield db
    except AppException:
        db.rollback()
        raise
    except SQLAlchemyError as sql_err:
        db.rollback()
        logger.error(f"Database session error encountered, rolling back: {sql_err}")
        raise
    except Exception as err:
        db.rollback()
        logger.error(f"Unexpected error during request processing, rolling back DB session: {err}")
        raise
    finally:
        db.close()
