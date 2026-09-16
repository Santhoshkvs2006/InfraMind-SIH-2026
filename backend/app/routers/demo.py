from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json
import datetime
from app.database import get_db
from app.services.seed_data import seed_database
from app.services.audit_service import log_audit
from app.models import (
    Institute, Inspection, Alert, AiEvent, RiskLevel, 
    AlertStatus, InspectionStatus, RiskScoreLog, AlertSeverity
)

router = APIRouter(prefix="/demo", tags=["Demo Mode Controller"])

@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """
    Resets the database and restores canonical clean demo data.
    """
    seed_database(db, force=True)
    return {"status": "SUCCESS", "message": "Demo data successfully reset to baseline state."}

@router.post("/load-sih-scenario")
def load_sih_scenario(db: Session = Depends(get_db)):
    """
    One-click preparation of the canonical SIH 2026 presentation scenario:
    - Institute: ABC Welfare Centre
    - Inspection: INS-2026-00841
    - Reported Attendance: 95
    - Observed Persons: 61 (17 in current activity hall frame)
    - AI Finding: Attendance Anomaly (Confidence: 87%)
    - Risk Score Jump: 52 -> 78 (+26 pts)
    - Alert: Verification Required
    """
    abc = db.query(Institute).filter(Institute.name == "ABC Welfare Centre").first()
    if not abc:
        abc = db.query(Institute).first()

    insp = db.query(Inspection).filter(Inspection.inspection_code == "INS-2026-00841").first()
    if not insp:
        insp = db.query(Inspection).filter(Inspection.institute_id == abc.id).first()

    # Set risk score to 78
    risk_before = 52.0
    abc.risk_score = 78.0
    abc.risk_level = RiskLevel.ATTENTION

    # Create bounding boxes for 17 persons
    boxes = []
    for i in range(17):
        boxes.append({
            "id": i + 1,
            "label": "person",
            "confidence": round(0.84 + (i % 4) * 0.03, 2),
            "box": [50 + (i % 5) * 110, 80 + (i // 5) * 90, 130 + (i % 5) * 110, 160 + (i // 5) * 90]
        })

    # Record / update AI event
    ai_event = db.query(AiEvent).filter(AiEvent.institute_id == abc.id).order_by(AiEvent.created_at.desc()).first()
    if not ai_event or ai_event.review_decision is not None:
        ai_event = AiEvent(
            institute_id=abc.id,
            inspection_id=insp.id if insp else None,
            event_type="OCCUPANCY_ESTIMATION",
            detected_persons=17,
            expected_range="25–40",
            observed_attendance=61,
            reported_attendance=95,
            flag_title="Anomaly Identified – Verification Required",
            flag_description="AI detected 17 persons in activity hall frame (61 observed overall) vs 95 reported in daily log (expected batch 25–40).",
            confidence_score=0.87,
            bounding_boxes_json=json.dumps(boxes),
            status=AlertStatus.PENDING_REVIEW,
            created_at=datetime.datetime.utcnow()
        )
        db.add(ai_event)
    else:
        ai_event.detected_persons = 17
        ai_event.expected_range = "25–40"
        ai_event.observed_attendance = 61
        ai_event.reported_attendance = 95
        ai_event.confidence_score = 0.87
        ai_event.flag_title = "Anomaly Identified – Verification Required"
        ai_event.flag_description = "AI detected 17 persons in activity hall frame (61 observed overall) vs 95 reported in daily log (expected batch 25–40)."
        ai_event.status = AlertStatus.PENDING_REVIEW
        ai_event.bounding_boxes_json = json.dumps(boxes)

    # Record Risk Score Log
    risk_log = RiskScoreLog(
        institute_id=abc.id,
        score=78.0,
        risk_level=RiskLevel.ATTENTION,
        attendance_factor=20.0,
        discrepancy_factor=18.0,
        cctv_factor=10.0,
        previous_findings_factor=15.0,
        delayed_reporting_factor=15.0,
        explanation="Score increased from 52.0 to 78.0 (+26 points). Drivers: Attendance Anomaly (+20), Inspection Discrepancy (+18), CCTV Availability (+10), Previous Findings (+15), Delayed Reporting (+15).",
        created_at=datetime.datetime.utcnow()
    )
    db.add(risk_log)

    # Create/update alert
    alert = db.query(Alert).filter(Alert.institute_id == abc.id, Alert.status == AlertStatus.PENDING_REVIEW).first()
    if not alert:
        alert = Alert(
            institute_id=abc.id,
            inspection_id=insp.id if insp else None,
            title="⚠ Anomaly Identified – Verification Required (ABC Welfare Centre)",
            reason="Observed 17 in activity hall frame (61 observed across sessions) vs 95 reported in attendance roll. Disparity: 34 persons.",
            severity=AlertSeverity.HIGH,
            status=AlertStatus.PENDING_REVIEW,
            created_at=datetime.datetime.utcnow()
        )
        db.add(alert)
    else:
        alert.title = "⚠ Anomaly Identified – Verification Required (ABC Welfare Centre)"
        alert.reason = "Observed 17 in activity hall frame (61 observed across sessions) vs 95 reported in attendance roll. Disparity: 34 persons."
        alert.severity = AlertSeverity.HIGH

    # Log to Audit Trail
    log_audit(
        db=db,
        user_email="system.ai@inframind.gov.in",
        role="AI_ENGINE",
        action="AI_ANOMALY_DETECTED",
        entity="INSTITUTE",
        entity_id=str(abc.id),
        ip_device="InfraMind AI Core (Inference Engine v2.4)",
        result="ALERT_GENERATED",
        details="Occupancy disparity: 17 detected in frame / 61 observed vs 95 reported. Confidence 87%. Risk adjusted 52 -> 78."
    )

    db.commit()
    db.refresh(ai_event)

    return {
        "status": "SCENARIO_READY",
        "institute": {
            "id": abc.id,
            "code": abc.institute_code,
            "name": abc.name,
            "district": abc.district,
            "state": abc.state,
            "scheme": abc.scheme
        },
        "inspection": {
            "id": insp.id if insp else None,
            "code": insp.inspection_code if insp else "INS-2026-00841",
            "status": insp.status if insp else "IN_PROGRESS"
        },
        "ai_event_id": ai_event.id,
        "reported_attendance": 95,
        "observed_persons": 61,
        "detected_in_frame": 17,
        "expected_range": "25–40",
        "confidence": 0.87,
        "ai_finding": "Anomaly Identified – Verification Required",
        "risk_before": risk_before,
        "risk_after": 78.0,
        "risk_delta": 26.0,
        "alert_status": "Verification Required",
        "breakdown": [
            {"factor": "Attendance Anomaly", "points": 20.0, "delta": "+10.0", "description": "AI observed 17 in activity hall (61 overall) vs 95 reported in daily roll"},
            {"factor": "Inspection Discrepancy", "points": 18.0, "delta": "+13.0", "description": "Field checklist noted physical count deviation during on-site visit"},
            {"factor": "CCTV Availability Issue", "points": 10.0, "delta": "+3.0", "description": "Classroom Camera 03 experienced intermittent heartbeat timeouts"},
            {"factor": "Previous Findings", "points": 15.0, "delta": "0.0", "description": "Prior routine check flagged storage room signage compliance notice"},
            {"factor": "Delayed Reporting", "points": 15.0, "delta": "0.0", "description": "Monthly biometric attendance roll filed 4 days after cutoff date"}
        ]
    }

@router.post("/scenario/prepare-step/{step}")
def prepare_scenario_step(step: int, db: Session = Depends(get_db)):
    abc = db.query(Institute).filter(Institute.name == "ABC Welfare Centre").first()
    
    if step <= 5:
        if abc:
            abc.risk_score = 52.0
            abc.risk_level = RiskLevel.NORMAL
            db.commit()
        return {"step": step, "title": "Official Dashboard & Random Generation", "status": "Ready"}
    
    elif 6 <= step <= 12:
        insp = db.query(Inspection).filter(Inspection.inspection_code == "INS-2026-00841").first()
        if insp:
            insp.status = InspectionStatus.IN_PROGRESS
            db.commit()
        return {"step": step, "title": "Field Inspection & Tamper-Evident Evidence", "status": "Ready"}

    elif 13 <= step <= 17:
        if abc:
            abc.risk_score = 78.0
            abc.risk_level = RiskLevel.ATTENTION
            db.commit()
        return {"step": step, "title": "AI Occupancy Mismatch & Risk Jump (52 -> 78)", "status": "Ready"}

    elif 18 <= step <= 20:
        return {"step": step, "title": "Human Verification & 5-Minute Random VC", "status": "Ready"}

    elif step >= 21:
        insp = db.query(Inspection).filter(Inspection.inspection_code == "INS-2026-00841").first()
        if insp:
            insp.status = InspectionStatus.CLOSED
            insp.official_review_decision = "CONFIRM_OBSERVATION"
            insp.official_review_notes = "Attendance variance addressed. Remedial biometric log mandated."
            db.commit()
        return {"step": step, "title": "Closed Inspection & Feedback Loop Updated", "status": "Ready"}

    return {"step": step, "status": "Ready"}

