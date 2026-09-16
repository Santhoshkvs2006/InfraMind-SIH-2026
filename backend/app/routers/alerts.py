from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import datetime
from app.database import get_db
from app.models import Alert, AlertStatus, Institute
from app.schemas import AlertResponse
from app.services.audit_service import log_audit

router = APIRouter(prefix="/alerts", tags=["Alerts"])

class AlertActionRequest(BaseModel):
    action: str  # REVIEW, ASSIGN_VERIFICATION, RESOLVE, MARK_INVESTIGATED
    reviewer: str = "Official Console"
    notes: Optional[str] = None

@router.get("", response_model=List[AlertResponse])
def get_alerts(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    
    alerts = query.order_by(Alert.created_at.desc()).all()
    results = []
    for a in alerts:
        inst = db.query(Institute).filter(Institute.id == a.institute_id).first()
        res = AlertResponse.from_orm(a)
        if inst:
            res.institute_name = inst.name
            res.district = inst.district
        results.append(res)
    return results

@router.post("/{alert_id}/review")
def review_alert(alert_id: int, req: AlertActionRequest, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.action_taken = req.action
    alert.reviewer = req.reviewer
    alert.reviewed_at = datetime.datetime.utcnow()

    if req.action in ["RESOLVE", "MARK_INVESTIGATED"]:
        alert.status = AlertStatus.RESOLVED
    elif req.action == "ASSIGN_VERIFICATION":
        alert.status = AlertStatus.VERIFICATION_REQUESTED
    else:
        alert.status = AlertStatus.PENDING_REVIEW

    log_audit(
        db=db,
        user_email="official@inframind.demo",
        role="DEPARTMENT_OFFICIAL",
        action=f"ALERT_{req.action}",
        entity="ALERT",
        entity_id=str(alert.id),
        details=f"Alert action: {req.action}. Notes: {req.notes or 'None'}"
    )

    db.commit()
    return {"status": "SUCCESS", "message": f"Alert updated to {alert.status}"}
