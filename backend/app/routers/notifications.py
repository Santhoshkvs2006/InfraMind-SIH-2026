from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Notification
from app.schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    role: Optional[str] = "DEPARTMENT_OFFICIAL",
    unread_only: bool = False,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(Notification)
    if role:
        query = query.filter(Notification.user_role == role)
    if unread_only:
        query = query.filter(Notification.read == False)
    return query.order_by(Notification.created_at.desc()).limit(limit).all()

@router.get("/count")
def get_unread_count(role: Optional[str] = "DEPARTMENT_OFFICIAL", db: Session = Depends(get_db)):
    count = db.query(Notification).filter(
        Notification.user_role == role,
        Notification.read == False
    ).count()
    return {"unread_count": count}

@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.read = True
        db.commit()
    return {"status": "SUCCESS"}

@router.post("/mark-all-read")
def mark_all_read(role: Optional[str] = "DEPARTMENT_OFFICIAL", db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_role == role).update({"read": True})
    db.commit()
    return {"status": "SUCCESS"}
