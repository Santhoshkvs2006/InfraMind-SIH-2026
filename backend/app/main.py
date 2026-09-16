from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.database import engine, Base, SessionLocal
from app.config import MEDIA_DIR, PLATFORM_NOTICE
from app.services.seed_data import seed_database
from app.routers import (
    auth, institutes, inspectors, inspections, cctv, vc, ai, alerts, reports, audit, dashboard, demo, notifications
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Auto seed if clean
with SessionLocal() as db:
    seed_database(db, force=False)

app = FastAPI(
    title="InfraMind API – Smart Real-Time Monitoring & Inspection Platform",
    description="Department of Social Justice & Empowerment (DoSJE) Smart Real-Time Monitoring & Inspection Platform for SIH 2026",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static media mount
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")

# Include Routers
app.include_router(auth.router)
app.include_router(institutes.router)
app.include_router(inspectors.router)
app.include_router(inspections.router)
app.include_router(cctv.router)
app.include_router(vc.router)
app.include_router(ai.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(audit.router)
app.include_router(dashboard.router)
app.include_router(demo.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {
        "platform": "InfraMind – Smart Real-Time Monitoring & Inspection Platform",
        "ministry": "Ministry of Social Justice & Empowerment (DoSJE), Government of India",
        "platform_version": "1.0.0-SIH2026",
        "status": "OPERATIONAL",
        "notice": PLATFORM_NOTICE,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "sqlite_connected", "ai_pipeline": "ready"}
