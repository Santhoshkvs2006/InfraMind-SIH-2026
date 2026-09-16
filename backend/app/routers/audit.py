from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import AuditLog
from app.schemas import AuditLogResponse

router = APIRouter(prefix="/audit-logs", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    role: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if role:
        query = query.filter(AuditLog.role == role)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))

    return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
