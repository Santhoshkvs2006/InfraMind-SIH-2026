from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
import datetime
from app.database import get_db
from app.models import VideoSession, Institute, Notification
from app.services.audit_service import log_audit

router = APIRouter(prefix="/vc", tags=["Random Video Verification"])

class VcRequestPayload(BaseModel):
    institute_id: int
    requested_by: str = "Official Console"

class VcSubmitPayload(BaseModel):
    checklist_results: Dict[str, Any]
    notes: Optional[str] = None

@router.post("/request")
def request_random_vc(payload: VcRequestPayload, db: Session = Depends(get_db)):
    institute = db.query(Institute).filter(Institute.id == payload.institute_id).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    session = VideoSession(
        institute_id=institute.id,
        requested_by=payload.requested_by,
        session_status="ACTIVE",
        duration_seconds=300,
        created_at=datetime.datetime.utcnow()
    )
    db.add(session)

    # Send Notification to institute
    db.add(Notification(
        user_role="INSTITUTE_NGO",
        title="Immediate 5-Minute Random VC Request",
        message=f"Department Directorate has initiated an unannounced 5-minute random video call verification for {institute.name}."
    ))

    # Update institute last VC date
    institute.last_vc_date = datetime.datetime.utcnow()

    log_audit(
        db=db,
        user_email="official@inframind.demo",
        role="DEPARTMENT_OFFICIAL",
        action="REQUEST_RANDOM_VC",
        entity="VIDEO_SESSION",
        entity_id=str(institute.id),
        details=f"Unannounced 5-min VC requested for {institute.name}. Session ID created."
    )

    db.commit()
    db.refresh(session)

    return {
        "status": "SESSION_INITIATED",
        "session_id": session.id,
        "institute_id": institute.id,
        "institute_name": institute.name,
        "duration_seconds": 300,
        "environment": "Official VC Verification Environment",
        "verification_checklist": [
            {"id": "staff_presence", "label": "Staff presence verification", "verified": False},
            {"id": "beneficiary_presence", "label": "Beneficiary presence & active engagement", "verified": False},
            {"id": "current_activity", "label": "Current activity adheres to scheme schedule", "verified": False},
            {"id": "facility_view", "label": "Facility 360 view (Activity Hall & Classrooms)", "verified": False},
            {"id": "selected_location_view", "label": "Selected random spot inspection (Dining / Storage)", "verified": False}
        ]
    }

@router.post("/sessions/{session_id}/complete")
def complete_vc_session(session_id: int, payload: VcSubmitPayload, db: Session = Depends(get_db)):
    session = db.query(VideoSession).filter(VideoSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Video session not found")

    session.session_status = "COMPLETED"
    session.completed_at = datetime.datetime.utcnow()
    session.notes = payload.notes
    
    log_audit(
        db=db,
        user_email="official@inframind.demo",
        role="DEPARTMENT_OFFICIAL",
        action="COMPLETE_RANDOM_VC",
        entity="VIDEO_SESSION",
        entity_id=str(session.id),
        details="5-Minute Random VC verification completed and checklist logged."
    )

    db.commit()
    return {"status": "SUCCESS", "message": "Video verification logged and closed."}
