from sqlalchemy.orm import Session
from app.models import AuditLog
import datetime

def log_audit(
    db: Session,
    user_email: str,
    role: str,
    action: str,
    entity: str,
    entity_id: str = None,
    ip_device: str = "10.42.0.1 (Official Portal)",
    result: str = "SUCCESS",
    details: str = None
):
    audit_entry = AuditLog(
        timestamp=datetime.datetime.utcnow(),
        user_email=user_email,
        role=role,
        action=action,
        entity=entity,
        entity_id=str(entity_id) if entity_id else None,
        ip_device=ip_device,
        result=result,
        details=details
    )
    db.add(audit_entry)
    db.commit()
    return audit_entry
