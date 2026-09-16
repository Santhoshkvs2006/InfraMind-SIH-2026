from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Inspector
from app.schemas import InspectorResponse

router = APIRouter(prefix="/inspectors", tags=["Inspectors"])

@router.get("", response_model=List[InspectorResponse])
def get_inspectors(db: Session = Depends(get_db)):
    return db.query(Inspector).all()

@router.get("/{inspector_id}", response_model=InspectorResponse)
def get_inspector(inspector_id: int, db: Session = Depends(get_db)):
    insp = db.query(Inspector).filter(Inspector.id == inspector_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspector not found")
    return insp
