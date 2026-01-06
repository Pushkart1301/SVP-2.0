from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core import database
from app.core.logging_config import setup_logging
from app.routers import auth, attendance, planner, subjects
import logging

# Initialize logging
setup_logging(log_level="INFO")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up Student Vacation Planner 2.0 API...")
    database.db.connect()
    await database.db.create_indexes()
    logger.info("Application startup complete")
    yield
    # Shutdown
    logger.info("Shutting down application...")
    database.db.close()
    logger.info("Application shutdown complete")

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
origins = [
    "http://localhost:3000",
    "https://svp-2-0.vercel.app",
    "https://svp-2-0.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(attendance.router, prefix=f"{settings.API_V1_STR}/attendance", tags=["Attendance"])
app.include_router(planner.router, prefix=f"{settings.API_V1_STR}/planner", tags=["Planner"])
app.include_router(subjects.router, prefix=f"{settings.API_V1_STR}/subjects", tags=["Subjects"])

@app.get("/")
def root():
    return {"message": "Welcome to Student Vacation Planner 2.0 API"}
