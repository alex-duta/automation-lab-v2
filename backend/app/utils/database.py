import os
from sqlmodel import Session, SQLModel, create_engine

# Connection to the PostgreSQL database. docker-compose.yml sets DATABASE_URL for the backend container;
# the default is the database container seen from the host, for a local run of the backend.
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://automation:automation@localhost:5432/automation_lab",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Create the tables that do not exist yet (called once, when the application starts)
def create_tables():
    SQLModel.metadata.create_all(engine)

# One session per request (FastAPI dependency)
def get_session():
    with Session(engine) as session:
        yield session
