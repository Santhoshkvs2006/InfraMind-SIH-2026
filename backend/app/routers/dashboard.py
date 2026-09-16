from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Institute, Inspection, Alert, AuditLog, RiskLevel, AlertStatus, CctvCamera, AiEvent
import datetime

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # Standard numbers aligned with SIH Demo requirements
    total_institutes = 248
    active_institutes = 221
    inspections_this_month = 31
    pending_inspections = 8
    alerts_requiring_review = db.query(Alert).filter(Alert.status == AlertStatus.PENDING_REVIEW).count() or 12
    high_risk_institutes = 9

    # Risk Distribution: Normal, Attention, Verification Required
    risk_distribution = {
        "NORMAL": 184,
        "ATTENTION": 55,
        "VERIFICATION_REQUIRED": 9
    }

    # Risk Trend over time
    risk_trend = [
        {"period": "Apr 2026", "avg_risk": 38.2, "high_risk_count": 6},
        {"period": "May 2026", "avg_risk": 41.5, "high_risk_count": 7},
        {"period": "Jun 2026", "avg_risk": 44.1, "high_risk_count": 8},
        {"period": "Jul 2026", "avg_risk": 43.8, "high_risk_count": 7},
        {"period": "Aug 2026", "avg_risk": 46.2, "high_risk_count": 9},
        {"period": "Sep 2026", "avg_risk": 49.0, "high_risk_count": 9}
    ]

    # Inspection Trend (Monthly)
    inspection_trends = [
        {"month": "Apr", "completed": 24, "random": 14, "anomalies": 3},
        {"month": "May", "completed": 28, "random": 18, "anomalies": 4},
        {"month": "Jun", "completed": 35, "random": 22, "anomalies": 6},
        {"month": "Jul", "completed": 32, "random": 20, "anomalies": 5},
        {"month": "Aug", "completed": 39, "random": 26, "anomalies": 8},
        {"month": "Sep", "completed": 31, "random": 21, "anomalies": 7}
    ]

    # Attendance Trend
    attendance_trends = [
        {"day": "Mon", "reported": 94.2, "observed": 88.5},
        {"day": "Tue", "reported": 95.0, "observed": 89.1},
        {"day": "Wed", "reported": 93.8, "observed": 86.4},
        {"day": "Thu", "reported": 96.1, "observed": 82.0},
        {"day": "Fri", "reported": 94.5, "observed": 79.3},
        {"day": "Sat", "reported": 91.0, "observed": 84.8}
    ]

    # Anomaly Categories
    anomaly_categories = [
        {"category": "Occupancy Deficit", "count": 14, "color": "#ef4444"},
        {"category": "CCTV Stream Loss", "count": 8, "color": "#f59e0b"},
        {"category": "Attendance Mismatch", "count": 12, "color": "#dc2626"},
        {"category": "Delayed Biometric Log", "count": 6, "color": "#eab308"},
        {"category": "Equipment Non-Availability", "count": 4, "color": "#6366f1"}
    ]

    # Recent Alerts
    recent_alerts_raw = db.query(Alert).order_by(Alert.created_at.desc()).limit(6).all()
    recent_alerts = [
        {
            "id": a.id,
            "title": a.title,
            "reason": a.reason,
            "severity": a.severity,
            "status": a.status,
            "institute_name": a.institute.name if a.institute else "ABC Welfare Centre",
            "time_ago": "12m ago"
        } for a in recent_alerts_raw
    ]

    # CCTV telemetry summary
    total_cctv = db.query(CctvCamera).count()
    if total_cctv == 0:
        total_cctv = 64
        online_cctv = 59
    else:
        online_cctv = db.query(CctvCamera).filter(CctvCamera.is_live == True).count()
    
    cctv_summary = {
        "total_cameras": total_cctv,
        "online_cameras": online_cctv,
        "offline_cameras": max(0, total_cctv - online_cctv),
        "system_uptime": "92.4%",
        "status": "OPERATIONAL"
    }

    # Recent AI Findings
    ai_events_raw = db.query(AiEvent).order_by(AiEvent.created_at.desc()).limit(5).all()
    recent_ai_findings = [
        {
            "id": ev.id,
            "institute_id": ev.institute_id,
            "institute_name": ev.institute.name if hasattr(ev, 'institute') and ev.institute else "ABC Welfare Centre",
            "detected_persons": ev.detected_persons,
            "expected_range": ev.expected_range,
            "observed_attendance": ev.observed_attendance,
            "reported_attendance": ev.reported_attendance,
            "confidence_score": ev.confidence_score,
            "flag_title": ev.flag_title,
            "status": ev.status,
            "created_at": ev.created_at.isoformat()
        } for ev in ai_events_raw
    ]

    # Recent Activity
    recent_activity_raw = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(7).all()
    recent_activity = [
        {
            "id": act.id,
            "user": act.user_email.split("@")[0],
            "role": act.role,
            "action": act.action.replace("_", " ").title(),
            "entity": act.entity,
            "entity_id": act.entity_id,
            "timestamp": act.timestamp.strftime("%H:%M:%S")
        } for act in recent_activity_raw
    ]

    # Continuous Feedback Loop metrics
    continuous_feedback = {
        "inspections_fed_to_model": 142,
        "risk_recalibrations_today": 18,
        "false_positive_reduction_rate": "23.4%",
        "human_decision_alignment": "91.8%",
        "active_cycle_step": "Human Verification -> Continuous Model Feedback"
    }

    return {
        "metrics": {
            "total_institutes": total_institutes,
            "active_institutes": active_institutes,
            "inspections_this_month": inspections_this_month,
            "pending_inspections": pending_inspections,
            "alerts_requiring_review": alerts_requiring_review,
            "high_risk_institutes": high_risk_institutes
        },
        "risk_distribution": risk_distribution,
        "risk_trend": risk_trend,
        "cctv_summary": cctv_summary,
        "recent_ai_findings": recent_ai_findings,
        "inspection_trends": inspection_trends,
        "attendance_trends": attendance_trends,
        "anomaly_categories": anomaly_categories,
        "recent_alerts": recent_alerts,
        "recent_activity": recent_activity,
        "continuous_feedback": continuous_feedback
    }

