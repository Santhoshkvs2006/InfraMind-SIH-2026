import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum as SqlEnum
)
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    DEPARTMENT_OFFICIAL = "DEPARTMENT_OFFICIAL"
    INSPECTION_OFFICER = "INSPECTION_OFFICER"
    INSTITUTE_NGO = "INSTITUTE_NGO"

class RiskLevel(str, enum.Enum):
    NORMAL = "NORMAL"                         # GREEN
    ATTENTION = "ATTENTION"                   # YELLOW/AMBER
    VERIFICATION_REQUIRED = "VERIFICATION_REQUIRED"  # RED

class InspectionStatus(str, enum.Enum):
    ASSIGNED = "ASSIGNED"
    EN_ROUTE = "EN_ROUTE"
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    VERIFIED = "VERIFIED"
    CLOSED = "CLOSED"

class InspectionType(str, enum.Enum):
    RANDOM = "RANDOM"
    ROUTINE = "ROUTINE"
    SPECIAL = "SPECIAL"

class AlertSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class AlertStatus(str, enum.Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    VERIFICATION_REQUESTED = "VERIFICATION_REQUESTED"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default=UserRole.DEPARTMENT_OFFICIAL)
    hashed_password = Column(String, nullable=False)
    department = Column(String, default="Department of Social Justice & Empowerment")
    institute_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Institute(Base):
    __tablename__ = "institutes"

    id = Column(Integer, primary_key=True, index=True)
    institute_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    state = Column(String, nullable=False, default="Tamil Nadu")
    district = Column(String, index=True, nullable=False)
    address = Column(String, nullable=False)
    scheme = Column(String, nullable=False)  # e.g., PM-AJAY, SMILE, ADIP, Vayoshreshtha
    contact_person = Column(String)
    contact_phone = Column(String)
    contact_email = Column(String)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    beneficiaries_registered = Column(Integer, default=0)
    staff_count = Column(Integer, default=0)
    attendance_rate = Column(Float, default=95.0)
    risk_score = Column(Float, default=25.0)
    risk_level = Column(String, default=RiskLevel.NORMAL)
    trust_score = Column(Float, default=85.0)
    cctv_status = Column(String, default="ONLINE")  # ONLINE, DEGRADED, OFFLINE
    cctv_cameras_count = Column(Integer, default=4)
    last_inspection_date = Column(DateTime, nullable=True)
    last_vc_date = Column(DateTime, nullable=True)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    inspections = relationship("Inspection", back_populates="institute")
    alerts = relationship("Alert", back_populates="institute")
    cctv_cameras = relationship("CctvCamera", back_populates="institute")
    attendance_records = relationship("AttendanceRecord", back_populates="institute")

class Inspector(Base):
    __tablename__ = "inspectors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    badge_id = Column(String, unique=True, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, default="Tamil Nadu")
    phone = Column(String)
    active_assignments = Column(Integer, default=0)
    total_inspections = Column(Integer, default=0)
    available = Column(Boolean, default=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    inspections = relationship("Inspection", back_populates="inspector")

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    inspection_code = Column(String, unique=True, index=True, nullable=False)  # INS-2026-00841
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False)
    inspector_id = Column(Integer, ForeignKey("inspectors.id"), nullable=False)
    inspection_type = Column(String, default=InspectionType.RANDOM)
    status = Column(String, default=InspectionStatus.ASSIGNED)
    priority = Column(String, default=RiskLevel.ATTENTION)
    scheduled_at = Column(DateTime, default=datetime.datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    gps_lat = Column(Float, nullable=True)
    gps_lng = Column(Float, nullable=True)
    gps_accuracy = Column(Float, nullable=True)
    gps_verified = Column(Boolean, default=False)
    inspector_notes = Column(Text, nullable=True)
    official_review_decision = Column(String, nullable=True)
    official_review_notes = Column(Text, nullable=True)
    official_reviewer_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    institute = relationship("Institute", back_populates="inspections")
    inspector = relationship("Inspector", back_populates="inspections")
    checklist = relationship("InspectionChecklist", back_populates="inspection", uselist=False)
    evidence_items = relationship("Evidence", back_populates="inspection")
    ai_events = relationship("AiEvent", back_populates="inspection")

class InspectionChecklist(Base):
    __tablename__ = "inspection_checklists"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=False)
    facilities_available = Column(Boolean, default=True)
    equipment_condition_ok = Column(Boolean, default=True)
    safety_measures_ok = Column(Boolean, default=True)
    staff_present_count = Column(Integer, default=0)
    staff_attendance_verified = Column(Boolean, default=True)
    staff_roles_verified = Column(Boolean, default=True)
    beneficiary_presence_count = Column(Integer, default=0)
    beneficiary_attendance_verified = Column(Boolean, default=False)
    beneficiary_interaction_conducted = Column(Boolean, default=True)
    scheme_records_available = Column(Boolean, default=True)
    documentation_verified = Column(Boolean, default=True)
    discrepancy_observed = Column(Boolean, default=False)
    discrepancy_details = Column(Text, nullable=True)
    category_responses_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    inspection = relationship("Inspection", back_populates="checklist")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    evidence_code = Column(String, unique=True, index=True, nullable=False)  # EV-2026-09281
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=False)
    inspector_id = Column(Integer, ForeignKey("inspectors.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, default="Photo")  # Photo, Video, Document, Attendance_Log
    file_path = Column(String, nullable=False)
    file_hash = Column(String, nullable=False)  # SHA-256
    hash_algorithm = Column(String, default="SHA-256")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    captured_at = Column(DateTime, default=datetime.datetime.utcnow)
    upload_time = Column(DateTime, default=datetime.datetime.utcnow)
    integrity_verified = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    inspection = relationship("Inspection", back_populates="evidence_items")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False)
    record_date = Column(String, nullable=False)  # YYYY-MM-DD
    expected_count = Column(Integer, nullable=False)
    reported_count = Column(Integer, nullable=False)
    observed_count = Column(Integer, nullable=True)
    variance_percentage = Column(Float, default=0.0)
    anomaly_detected = Column(Boolean, default=False)
    confidence = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    institute = relationship("Institute", back_populates="attendance_records")

class AiEvent(Base):
    __tablename__ = "ai_events"

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=True)
    event_type = Column(String, nullable=False)  # OCCUPANCY_ESTIMATION, ATTENDANCE_ANOMALY, CCTV_AVAILABILITY
    detected_persons = Column(Integer, nullable=False)
    expected_range = Column(String, nullable=False)  # "25–40"
    observed_attendance = Column(Integer, nullable=True)
    reported_attendance = Column(Integer, nullable=True)
    flag_title = Column(String, nullable=False)  # "Attendance Anomaly"
    flag_description = Column(String, nullable=False)  # "Anomaly identified – human verification required"
    confidence_score = Column(Float, nullable=False, default=0.87)
    bounding_boxes_json = Column(Text, nullable=True)
    status = Column(String, default=AlertStatus.PENDING_REVIEW)
    reviewed_by = Column(String, nullable=True)
    review_decision = Column(String, nullable=True)
    review_comments = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    inspection = relationship("Inspection", back_populates="ai_events")

class RiskScoreLog(Base):
    __tablename__ = "risk_score_logs"

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False)
    score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    attendance_factor = Column(Float, default=0.0)
    discrepancy_factor = Column(Float, default=0.0)
    cctv_factor = Column(Float, default=0.0)
    previous_findings_factor = Column(Float, default=0.0)
    delayed_reporting_factor = Column(Float, default=0.0)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=True)
    title = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    severity = Column(String, default=AlertSeverity.HIGH)
    status = Column(String, default=AlertStatus.PENDING_REVIEW)
    action_taken = Column(String, nullable=True)
    reviewer = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    institute = relationship("Institute", back_populates="alerts")

class CctvCamera(Base):
    __tablename__ = "cctv_cameras"

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False)
    camera_code = Column(String, nullable=False)  # CAM-01
    name = Column(String, nullable=False)  # "Camera 01 – Main Entrance"
    location_area = Column(String, nullable=False)
    stream_url = Column(String, nullable=False)
    is_live = Column(Boolean, default=True)
    protocol = Column(String, default="Simulated RTSP/ONVIF")
    last_ping = Column(DateTime, default=datetime.datetime.utcnow)

    institute = relationship("Institute", back_populates="cctv_cameras")

class VideoSession(Base):
    __tablename__ = "video_sessions"

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False)
    requested_by = Column(String, nullable=False)
    session_status = Column(String, default="REQUESTED")  # REQUESTED, ACTIVE, COMPLETED, CANCELLED
    duration_seconds = Column(Integer, default=300)  # 5 minutes
    checklist_results = Column(Text, nullable=True)  # JSON or text
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_email = Column(String, nullable=False)
    role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    ip_device = Column(String, default="10.42.0.1 (Official Portal)")
    result = Column(String, default="SUCCESS")
    details = Column(Text, nullable=True)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_role = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
