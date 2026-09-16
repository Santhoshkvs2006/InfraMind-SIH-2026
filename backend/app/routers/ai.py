from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import datetime
from app.database import get_db
from app.models import AiEvent, Alert, AlertStatus, Institute, Inspection
from app.schemas import AiEventResponse, AiAnalysisRequest, HumanReviewRequest
from app.services.ai_engine import run_ai_analysis, reset_institute_risk
from app.services.audit_service import log_audit

router = APIRouter(prefix="/ai", tags=["AI Anomaly Detection"])

@router.get("/events", response_model=List[AiEventResponse])
def get_ai_events(institute_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(AiEvent)
    if institute_id:
        query = query.filter(AiEvent.institute_id == institute_id)
    return query.order_by(AiEvent.created_at.desc()).all()

@router.get("/events/{event_id}")
def get_ai_event_detail(event_id: int, db: Session = Depends(get_db)):
    event = db.query(AiEvent).filter(AiEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="AI event not found")
    
    institute = db.query(Institute).filter(Institute.id == event.institute_id).first()
    boxes = json.loads(event.bounding_boxes_json) if event.bounding_boxes_json else []

    return {
        "id": event.id,
        "institute_id": event.institute_id,
        "institute_name": institute.name if institute else "Unknown Institute",
        "institute_code": institute.institute_code if institute else "N/A",
        "district": institute.district if institute else "N/A",
        "inspection_id": event.inspection_id,
        "event_type": event.event_type,
        "detected_persons": event.detected_persons,
        "expected_range": event.expected_range,
        "observed_attendance": event.observed_attendance,
        "reported_attendance": event.reported_attendance,
        "confidence_score": event.confidence_score,
        "flag_title": event.flag_title,
        "flag_description": event.flag_description,
        "bounding_boxes": boxes,
        "status": event.status,
        "reviewed_by": event.reviewed_by,
        "review_decision": event.review_decision,
        "review_comments": event.review_comments,
        "reviewed_at": event.reviewed_at.isoformat() if event.reviewed_at else None,
        "created_at": event.created_at.isoformat()
    }

@router.get("/inspections/{inspection_id}")
def get_inspection_ai_events(inspection_id: int, db: Session = Depends(get_db)):
    events = db.query(AiEvent).filter(AiEvent.inspection_id == inspection_id).order_by(AiEvent.created_at.desc()).all()
    results = []
    for ev in events:
        results.append({
            "id": ev.id,
            "institute_id": ev.institute_id,
            "inspection_id": ev.inspection_id,
            "detected_persons": ev.detected_persons,
            "expected_range": ev.expected_range,
            "observed_attendance": ev.observed_attendance,
            "reported_attendance": ev.reported_attendance,
            "confidence_score": ev.confidence_score,
            "flag_title": ev.flag_title,
            "flag_description": ev.flag_description,
            "status": ev.status,
            "reviewed_by": ev.reviewed_by,
            "review_decision": ev.review_decision
        })
    return results

@router.post("/analyze")
def trigger_ai_analysis(req: AiAnalysisRequest, db: Session = Depends(get_db)):
    result = run_ai_analysis(
        db=db, 
        institute_id=req.institute_id, 
        inspection_id=req.inspection_id,
        frame_base64=req.frame_base64
    )
    return result

@router.post("/events/{event_id}/review")
@router.post("/findings/{event_id}/review")
def review_ai_event(event_id: int, req: HumanReviewRequest, db: Session = Depends(get_db)):
    event = db.query(AiEvent).filter(AiEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="AI event not found")

    event.reviewed_by = req.reviewer_name
    event.review_decision = req.decision
    event.review_comments = req.comments
    event.reviewed_at = datetime.datetime.utcnow()
    
    if req.decision in ["CONFIRM_OBSERVATION", "Confirm Observation"]:
        event.status = AlertStatus.RESOLVED
    elif req.decision in ["REQUEST_ADDITIONAL_EVIDENCE", "Request Additional Evidence"]:
        event.status = AlertStatus.VERIFICATION_REQUESTED
    elif req.decision in ["DISMISS_AFTER_REVIEW", "Dismiss After Review"]:
        event.status = AlertStatus.RESOLVED
    else:
        event.status = AlertStatus.RESOLVED

    # Also resolve or update associated Alert
    alert = db.query(Alert).filter(Alert.institute_id == event.institute_id).order_by(Alert.created_at.desc()).first()
    if alert:
        alert.status = event.status
        alert.action_taken = req.decision
        alert.reviewer = req.reviewer_name
        alert.reviewed_at = datetime.datetime.utcnow()

    log_audit(
        db=db,
        user_email="official@inframind.demo",
        role="DEPARTMENT_OFFICIAL",
        action="HUMAN_VERIFICATION",
        entity="AI_EVENT",
        entity_id=str(event.id),
        details=f"Decision: {req.decision}. Reviewer: {req.reviewer_name}. Comments: {req.comments}"
    )

    db.commit()
    return {
        "status": "SUCCESS", 
        "message": "Official human verification recorded and audit trail updated.",
        "decision": req.decision,
        "reviewer": req.reviewer_name,
        "reviewed_at": event.reviewed_at.isoformat()
    }

@router.post("/reset-baseline/{institute_id}")
def reset_baseline(institute_id: int, db: Session = Depends(get_db)):
    return reset_institute_risk(db, institute_id)

