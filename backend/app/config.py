import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

MEDIA_DIR = BASE_DIR / "media"
MEDIA_DIR.mkdir(exist_ok=True)
EVIDENCE_DIR = MEDIA_DIR / "evidence"
EVIDENCE_DIR.mkdir(exist_ok=True)
CCTV_DIR = MEDIA_DIR / "cctv"
CCTV_DIR.mkdir(exist_ok=True)

DATABASE_URL = f"sqlite:///{DATA_DIR}/inframind.db"
SECRET_KEY = os.getenv("SECRET_KEY", "inframind-sih-2026-supersecret-jwt-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Platform Configuration
IS_DEMO_MODE = True
PLATFORM_NOTICE = "InfraMind SIH 2026 Central Monitoring Platform."
