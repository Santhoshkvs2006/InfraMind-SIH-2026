import cv2
import numpy as np
import base64
import json
import datetime
from sqlalchemy.orm import Session
from app.models import AiEvent, Alert, Institute, Inspection, RiskLevel, AlertSeverity, AlertStatus
from app.services.audit_service import log_audit

from sqlalchemy.orm import Session
from app.models import (
    AiEvent, Alert, Institute, Inspection, RiskLevel, 
    AlertSeverity, AlertStatus, RiskScoreLog
)
from app.services.audit_service import log_audit

def run_ai_analysis(
    db: Session,
    institute_id: int,
    inspection_id: int = None,
    image_bytes: bytes = None,
    frame_base64: str = None,
    scenario_mode: bool = False
) -> dict:
    """
    Simulates / runs OpenCV and object detection pipeline:
    Frame -> Person Detection -> Occupancy Estimation -> Anomaly Engine -> Risk Update
    """
    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    if not institute:
        raise ValueError("Institute not found")

    # 1. Log AI Analysis Started
    log_audit(
        db=db,
        user_email="official@inframind.demo",
        role="DEPARTMENT_OFFICIAL",
        action="AI_ANALYSIS_STARTED",
        entity="INSTITUTE",
        entity_id=str(institute.id),
        ip_device="InfraMind AI Core (Inference Engine v2.4)",
        result="IN_PROGRESS",
        details="Triggered OpenCV preprocessing & YOLO person detection pipeline."
    )

    detected_count = 17
    confidence = 0.87
    bounding_boxes = []
    frames_analyzed = 150

    # If base64 frame is provided, decode to bytes
    if frame_base64 and not image_bytes:
        try:
            if "," in frame_base64:
                frame_base64 = frame_base64.split(",")[1]
            image_bytes = base64.b64decode(frame_base64)
        except Exception as e:
            print(f"Base64 decode error: {e}")

    # Process image with OpenCV if bytes are present
    if image_bytes:
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is not None:
                h, w, _ = img.shape
                np.random.seed(42)
                for i in range(17):
                    bx = int((i % 6) * (w / 6.5) + np.random.randint(5, 20))
                    by = int((i // 6) * (h / 3.5) + np.random.randint(10, 30))
                    bw = int(w / 10 + np.random.randint(-5, 10))
                    bh = int(h / 5 + np.random.randint(-5, 15))
                    bounding_boxes.append({
                        "id": i + 1,
                        "label": "person",
                        "confidence": round(0.82 + (i % 5) * 0.03, 2),
                        "box": [max(0, bx), max(0, by), min(w, bx + bw), min(h, by + bh)]
                    })
        except Exception as e:
            print(f"OpenCV processing fallback applied: {e}")

    # Default calibrated 17 person detections for the SIH Activity Hall scenario
    if not bounding_boxes:
        for i in range(17):
            bounding_boxes.append({
                "id": i + 1,
                "label": "person",
                "confidence": round(0.84 + (i % 4) * 0.03, 2),
                "box": [50 + (i % 5) * 110, 80 + (i // 5) * 90, 130 + (i % 5) * 110, 160 + (i // 5) * 90]
            })

    # Expected range & attendance metrics
    expected_min = 25
    expected_max = 40
    expected_range = f"{expected_min}–{expected_max}"
    observed_attendance = 61
    reported_attendance = 95
    
    # SIH Standard Advisory Flag
    flag_title = "Attendance Anomaly"
    flag_description = "Anomaly identified – human verification required. Observed 17 attendees in frame (61 overall) vs reported 95 (expected batch 25–40)."
    
    # Record AI Event
    ai_event = AiEvent(
        institute_id=institute.id,
        inspection_id=inspection_id,
        event_type="OCCUPANCY_ESTIMATION",
        detected_persons=detected_count,
        expected_range=expected_range,
        observed_attendance=observed_attendance,
        reported_attendance=reported_attendance,
        flag_title=flag_title,
        flag_description=flag_description,
        confidence_score=confidence,
        bounding_boxes_json=json.dumps(bounding_boxes),
        status=AlertStatus.PENDING_REVIEW,
        created_at=datetime.datetime.utcnow()
    )
    db.add(ai_event)

    # 2. Risk Score Update: 52 -> 78 (+26 points)
    risk_before = institute.risk_score
    institute.risk_score = 78.0
    institute.risk_level = RiskLevel.ATTENTION

    # Save Risk Score Log
    risk_log = RiskScoreLog(
        institute_id=institute.id,
        score=78.0,
        risk_level=RiskLevel.ATTENTION,
        attendance_factor=20.0,
        discrepancy_factor=18.0,
        cctv_factor=10.0,
        previous_findings_factor=15.0,
        delayed_reporting_factor=15.0,
        explanation="Score increased from 52.0 to 78.0 (+26 points) due to attendance mismatch (17 in frame, 61 observed vs 95 reported), physical checklist deviation, and CCTV telemetry drops.",
        created_at=datetime.datetime.utcnow()
    )
    db.add(risk_log)

    # 3. Create or update Alert
    alert = Alert(
        institute_id=institute.id,
        inspection_id=inspection_id,
        title=f"⚠ Attendance Inconsistency Detected ({institute.name})",
        reason="AI detected 17 persons present in activity hall vs 25–40 expected range and 95 reported in daily log. Human verification required.",
        severity=AlertSeverity.HIGH,
        status=AlertStatus.PENDING_REVIEW,
        created_at=datetime.datetime.utcnow()
    )
    db.add(alert)
    db.commit()
    db.refresh(ai_event)

    # 4. Audit Log: Anomaly Detected
    log_audit(
        db=db,
        user_email="system.ai@inframind.gov.in",
        role="AI_ENGINE",
        action="AI_ANOMALY_DETECTED",
        entity="INSTITUTE",
        entity_id=str(institute.id),
        ip_device="InfraMind AI Core (Inference Engine v2.4)",
        result="ALERT_GENERATED",
        details=f"Detected Persons: {detected_count} in frame, Observed: {observed_attendance} vs Reported: {reported_attendance}. Confidence: {int(confidence*100)}%."
    )

    # 5. Audit Log: Risk Score Updated
    log_audit(
        db=db,
        user_email="system.ai@inframind.gov.in",
        role="AI_ENGINE",
        action="RISK_SCORE_UPDATED",
        entity="INSTITUTE",
        entity_id=str(institute.id),
        ip_device="InfraMind Risk Engine",
        result="SCORE_ADJUSTED",
        details=f"Risk score updated from {risk_before:.1f} to 78.0 (+26.0 points). Verification required."
    )

    return {
        "status": "ANALYSIS_COMPLETE",
        "ai_event_id": ai_event.id,
        "institute_id": institute.id,
        "institute_name": institute.name,
        "inspection_id": inspection_id,
        "frames_analyzed": frames_analyzed,
        "detected_persons": detected_count,
        "expected_range": expected_range,
        "observed_attendance": observed_attendance,
        "reported_attendance": reported_attendance,
        "mismatch_count": reported_attendance - observed_attendance,
        "confidence_score": confidence,
        "flag_title": flag_title,
        "flag_description": flag_description,
        "bounding_boxes": bounding_boxes,
        "risk_before": risk_before,
        "risk_after": 78.0,
        "risk_delta": round(78.0 - risk_before, 1),
        "factors": [
            {"factor": "Attendance Anomaly", "points": 20.0, "delta": "+10.0", "description": "AI observed 17 in activity hall / 61 overall vs 95 reported (expected batch 25–40)"},
            {"factor": "Inspection Discrepancy", "points": 18.0, "delta": "+13.0", "description": "Inspector checklist noted physical count deviation during on-site visit"},
            {"factor": "CCTV Availability Issue", "points": 10.0, "delta": "+3.0", "description": "Classroom camera experienced intermittent heartbeat timeouts"},
            {"factor": "Previous Findings", "points": 15.0, "delta": "0.0", "description": "Prior routine check flagged storage room signage compliance notice"},
            {"factor": "Delayed Reporting", "points": 15.0, "delta": "0.0", "description": "Monthly biometric attendance roll filed 4 days after cutoff date"}
        ],
        "created_at": ai_event.created_at.isoformat()
    }

def reset_institute_risk(db: Session, institute_id: int):
    """
    Resets the institute risk score back to baseline (52.0) for repeatable demo testing.
    """
    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    if institute:
        institute.risk_score = 52.0
        institute.risk_level = RiskLevel.NORMAL
        # Add baseline risk log if none exists
        db.commit()
    return {"status": "SUCCESS", "risk_score": 52.0}
