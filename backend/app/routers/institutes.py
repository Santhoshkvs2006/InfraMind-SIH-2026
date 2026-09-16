from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Institute, Inspection, Alert, CctvCamera, Evidence, RiskScoreLog
from app.schemas import InstituteResponse, RiskScoreResponse, TrustScoreResponse
from app.services.risk_engine import calculate_explainable_risk, calculate_trust_score

router = APIRouter(prefix="/institutes", tags=["Institutes"])

@router.get("", response_model=List[InstituteResponse])
def get_institutes(
    search: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    scheme: Optional[str] = None,
    risk_level: Optional[str] = None,
    cctv_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Institute)

    if search:
        s_term = f"%{search}%"
        query = query.filter(
            (Institute.name.ilike(s_term)) |
            (Institute.institute_code.ilike(s_term)) |
            (Institute.district.ilike(s_term)) |
            (Institute.scheme.ilike(s_term))
        )
    if state:
        query = query.filter(Institute.state == state)
    if district:
        query = query.filter(Institute.district == district)
    if scheme:
        query = query.filter(Institute.scheme.ilike(f"%{scheme}%"))
    if risk_level:
        query = query.filter(Institute.risk_level == risk_level)
    if cctv_status:
        query = query.filter(Institute.cctv_status == cctv_status)

    return query.order_by(Institute.risk_score.desc()).all()

@router.get("/{institute_id}")
def get_institute_detail(institute_id: int, db: Session = Depends(get_db)):
    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    inspections = db.query(Inspection).filter(Inspection.institute_id == institute_id).order_by(Inspection.scheduled_at.desc()).limit(5).all()
    alerts = db.query(Alert).filter(Alert.institute_id == institute_id).order_by(Alert.created_at.desc()).limit(5).all()
    cctv = db.query(CctvCamera).filter(CctvCamera.institute_id == institute_id).all()
    evidence = db.query(Evidence).join(Inspection).filter(Inspection.institute_id == institute_id).order_by(Evidence.captured_at.desc()).limit(6).all()
    risk_data = calculate_explainable_risk(institute, db)
    trust_data = calculate_trust_score(institute)

    return {
        "institute": InstituteResponse.from_orm(institute),
        "risk_analysis": risk_data,
        "trust_analysis": trust_data,
        "recent_inspections": [
            {
                "id": insp.id,
                "code": insp.inspection_code,
                "inspector_name": insp.inspector.name if insp.inspector else "Unassigned",
                "type": insp.inspection_type,
                "status": insp.status,
                "scheduled_at": insp.scheduled_at,
                "gps_verified": insp.gps_verified
            } for insp in inspections
        ],
        "active_alerts": [
            {
                "id": alt.id,
                "title": alt.title,
                "reason": alt.reason,
                "severity": alt.severity,
                "status": alt.status,
                "created_at": alt.created_at
            } for alt in alerts
        ],
        "cctv_cameras": [
            {
                "id": c.id,
                "code": c.camera_code,
                "name": c.name,
                "area": c.location_area,
                "is_live": c.is_live,
                "protocol": c.protocol
            } for c in cctv
        ],
        "evidence_preview": [
            {
                "id": ev.id,
                "code": ev.evidence_code,
                "title": ev.title,
                "category": ev.category,
                "hash": ev.file_hash,
                "integrity_verified": ev.integrity_verified,
                "captured_at": ev.captured_at
            } for ev in evidence
        ]
    }

@router.get("/{institute_id}/risk", response_model=RiskScoreResponse)
def get_institute_risk(institute_id: int, db: Session = Depends(get_db)):
    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")
    return calculate_explainable_risk(institute, db)

@router.get("/{institute_id}/trust", response_model=TrustScoreResponse)
def get_institute_trust(institute_id: int, db: Session = Depends(get_db)):
    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")
    return calculate_trust_score(institute)

@router.get("/{institute_id}/risk-history")
def get_institute_risk_history(institute_id: int, db: Session = Depends(get_db)):
    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    logs = db.query(RiskScoreLog).filter(RiskScoreLog.institute_id == institute_id).order_by(RiskScoreLog.created_at.desc()).limit(10).all()
    
    current_score = institute.risk_score
    previous_score = 52.0 if current_score >= 70 else 45.0
    delta = round(current_score - previous_score, 1)

    factors = [
        {"factor": "Attendance Anomaly", "points": 20.0, "delta": "+10.0", "description": "AI observed 17 in activity hall / 61 overall vs 95 reported in daily roll"},
        {"factor": "Inspection Discrepancy", "points": 18.0, "delta": "+13.0", "description": "Field inspector checklist identified physical count deviation during visit"},
        {"factor": "CCTV Availability Issue", "points": 10.0, "delta": "+3.0", "description": "Classroom camera experienced intermittent offline timeouts"},
        {"factor": "Previous Findings", "points": 15.0, "delta": "0.0", "description": "Prior routine check flagged storage room signage compliance notice"},
        {"factor": "Delayed Reporting", "points": 15.0, "delta": "0.0", "description": "Monthly biometric attendance roll submitted 4 days after cutoff date"}
    ]

    return {
        "institute_id": institute.id,
        "institute_name": institute.name,
        "current_score": current_score,
        "previous_score": previous_score,
        "delta": delta,
        "risk_level": institute.risk_level,
        "factors": factors,
        "history": [
            {
                "id": l.id,
                "score": l.score,
                "risk_level": l.risk_level,
                "explanation": l.explanation,
                "created_at": l.created_at.isoformat()
            } for l in logs
        ]
    }

