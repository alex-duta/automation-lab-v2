from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from app.api import profiles, reports, sessions, teams, users
from app.models.team_model import create_default_teams
from app.utils.database import create_tables, engine

# -----------------------------------------
# Instructions to run backend locally:
# start the database: docker compose up -d database
# activate venv: .\venv\Scripts\activate
# switch interpreter: Ctrl+Shift+P > Python: Select Interpreter > select venv
# local run: uvicorn app.main:app --reload --port 8000
# -----------------------------------------

# Create the database tables and the default teams when the application starts
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    with Session(engine) as session:
        create_default_teams(session)
    yield

# Create FastAPI instance
app = FastAPI(lifespan=lifespan)

# Allow frontend to call backend
origins = [
    "http://localhost:5173",  # frontend Vite default port
    "http://localhost:3000", # frontend Docker port
    "http://frontend", # frontend Docker service name without port
]

# Middleware for CORS handling. CORS = Cross-Origin Resource Sharing (sharing resources between different origins/domains in the browser environment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes registration
app.include_router(users.router)
app.include_router(profiles.router)
app.include_router(teams.router)
app.include_router(reports.router)
app.include_router(sessions.router)
