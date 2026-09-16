from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None

class InstituteResponse(BaseModel):
    id: int
    institute_code: str
    name: str
    state: str
    district: str
    address: str
    scheme: str
    contact_person: Optional[str]
    contact_phone: Optional[str]
    contact_email: Optional[str]
    latitude: float
    longitude: float
    beneficiaries_registered: int
    staff_count: int
    attendance_rate: float
    risk_score: float
    risk_level: str
    trust_score: float
    cctv_status: str
    cctv_cameras_count: int
    last_inspection_date: Optional[datetime]
    last_vc_date: Optional[datetime]
    status: str

    class Config:
        from_attributes = True

class InspectorResponse(BaseModel):
    id: int
    name: str
    badge_id: str
    district: str
    state: str
    phone: Optional[str]
    active_assignments: int
    total_inspections: int
    available: bool
    current_lat: Optional[float]
    current_lng: Optional[float]

    class Config:
        from_attributes = True

class ChecklistResponse(BaseModel):
    facilities_available: bool
    equipment_condition_ok: bool
    safety_measures_ok: bool
    staff_present_count: int
    staff_attendance_verified: bool
    staff_roles_verified: bool
    beneficiary_presence_count: int
    beneficiary_attendance_verified: bool
    beneficiary_interaction_conducted: bool
    scheme_records_available: bool
    documentation_verified: bool
    discrepancy_observed: bool
    discrepancy_details: Optional[str]

    class Config:
        from_attributes = True

class EvidenceResponse(BaseModel):
    id: int
    evidence_code: str
    inspection_id: int
    inspector_id: int
    title: str
    category: str
    file_path: str
    file_hash: str
    hash_algorithm: str
    latitude: float
    longitude: float
    captured_at: datetime
    upload_time: datetime
    integrity_verified: bool
    notes: Optional[str]

    class Config:
        from_attributes = True

class InspectionResponse(BaseModel):
    id: int
    inspection_code: str
    institute_id: int
    inspector_id: int
    inspection_type: str
    status: str
    priority: str
    scheduled_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    gps_lat: Optional[float]
    gps_lng: Optional[float]
    gps_accuracy: Optional[float]
    gps_verified: bool
    inspector_notes: Optional[str]
    official_review_decision: Optional[str]
    official_review_notes: Optional[str]
    official_reviewer_name: Optional[str]
    institute: Optional[InstituteResponse]
    inspector: Optional[InspectorResponse]
    checklist: Optional[ChecklistResponse]
    evidence_items: List[EvidenceResponse] = []

    class Config:
        from_attributes = True

class RandomInspectionRequest(BaseModel):
    district: Optional[str] = None
    priority_weight: bool = True

class InspectionStartRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy: float

class ChecklistSubmitRequest(BaseModel):
    facilities_available: bool = True
    equipment_condition_ok: bool = True
    safety_measures_ok: bool = True
    staff_present_count: int
    staff_attendance_verified: bool = True
    staff_roles_verified: bool = True
    beneficiary_presence_count: int
    beneficiary_attendance_verified: bool = True
    beneficiary_interaction_conducted: bool = True
    scheme_records_available: bool = True
    documentation_verified: bool = True
    discrepancy_observed: bool = False
    discrepancy_details: Optional[str] = None

class EvidenceCreateRequest(BaseModel):
    title: str
    category: str = "Photo"
    file_path: Optional[str] = None
    latitude: float
    longitude: float
    file_content_base64: Optional[str] = None
    notes: Optional[str] = None

class InspectionSubmitRequest(BaseModel):
    inspector_notes: str
    checklist: ChecklistSubmitRequest

class AiAnalysisRequest(BaseModel):
    institute_id: int
    inspection_id: Optional[int] = None
    image_url: Optional[str] = None
    frame_base64: Optional[str] = None

class AiEventResponse(BaseModel):
    id: int
    institute_id: int
    inspection_id: Optional[int]
    event_type: str
    detected_persons: int
    expected_range: str
    observed_attendance: Optional[int]
    reported_attendance: Optional[int]
    flag_title: str
    flag_description: str
    confidence_score: float
    status: str
    reviewed_by: Optional[str]
    review_decision: Optional[str]
    review_comments: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class HumanReviewRequest(BaseModel):
    decision: str  # CONFIRM_OBSERVATION, REQUEST_ADDITIONAL_EVIDENCE, ASSIGN_PHYSICAL_INSPECTION, DISMISS_AFTER_REVIEW
    reviewer_name: str
    comments: str

class AlertResponse(BaseModel):
    id: int
    institute_id: int
    inspection_id: Optional[int]
    title: str
    reason: str
    severity: str
    status: str
    action_taken: Optional[str]
    reviewer: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime
    institute_name: Optional[str] = None
    district: Optional[str] = None

    class Config:
        from_attributes = True

class CctvCameraResponse(BaseModel):
    id: int
    institute_id: int
    camera_code: str
    name: str
    location_area: str
    stream_url: str
    is_live: bool
    protocol: str
    last_ping: datetime

    class Config:
        from_attributes = True

class RiskBreakdownItem(BaseModel):
    factor: str
    points: float
    description: str

class RiskScoreResponse(BaseModel):
    institute_id: int
    institute_name: str
    risk_score: float
    risk_level: str
    breakdown: List[RiskBreakdownItem]
    explanation: str

class TrustScoreResponse(BaseModel):
    institute_id: int
    institute_name: str
    trust_score: float
    factors: List[Dict[str, Any]]
    summary: str

class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    user_email: str
    role: str
    action: str
    entity: str
    entity_id: Optional[str]
    ip_device: str
    result: str
    details: Optional[str]

    class Config:
        from_attributes = True

class DashboardSummaryResponse(BaseModel):
    total_institutes: int
    active_institutes: int
    inspections_this_month: int
    pending_inspections: int
    alerts_requiring_review: int
    high_risk_institutes: int
    risk_distribution: Dict[str, int]
    inspection_trends: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
    recent_alerts: List[Dict[str, Any]]

class GpsVerificationRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy: float
    is_demo_mode: bool = False

class CategoryChecklistItem(BaseModel):
    id: str
    category: str  # INFRASTRUCTURE, STAFF, BENEFICIARIES, DOCUMENTATION
    label: str
    status: str  # Pass, Attention, Not_Verified
    notes: Optional[str] = None

class ChecklistSaveRequest(BaseModel):
    items: List[CategoryChecklistItem]

class NotificationResponse(BaseModel):
    id: int
    user_role: str
    title: str
    message: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class InspectionSummaryResponse(BaseModel):
    inspection_id: int
    inspection_code: str
    institute_name: str
    institute_code: str
    district: str
    inspector_name: str
    badge_id: str
    scheduled_at: datetime
    status: str
    gps_verified: bool
    gps_lat: Optional[float]
    gps_lng: Optional[float]
    gps_accuracy: Optional[float]
    checklist_completed_count: int
    checklist_total_count: int
    evidence_count: int
    evidence_items: List[EvidenceResponse]
    inspector_notes: Optional[str]
    ready_for_submission: bool
