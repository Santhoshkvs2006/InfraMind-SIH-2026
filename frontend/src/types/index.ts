export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'DEPARTMENT_OFFICIAL' 
  | 'INSPECTION_OFFICER' 
  | 'INSTITUTE_NGO';

export type RiskLevel = 'NORMAL' | 'ATTENTION' | 'VERIFICATION_REQUIRED';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  institute_id?: number;
}

export interface Institute {
  id: number;
  institute_code: string;
  name: string;
  state: string;
  district: string;
  address: string;
  scheme: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  latitude: number;
  longitude: number;
  beneficiaries_registered: number;
  staff_count: number;
  attendance_rate: number;
  risk_score: number;
  risk_level: RiskLevel;
  trust_score: number;
  cctv_status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  cctv_cameras_count: number;
  last_inspection_date?: string;
  last_vc_date?: string;
  status: string;
}

export interface Inspector {
  id: number;
  name: string;
  badge_id: string;
  district: string;
  state: string;
  phone?: string;
  active_assignments: number;
  total_inspections: number;
  available: boolean;
  current_lat?: number;
  current_lng?: number;
}

export interface InspectionChecklist {
  facilities_available: boolean;
  equipment_condition_ok: boolean;
  safety_measures_ok: boolean;
  staff_present_count: number;
  staff_attendance_verified: boolean;
  staff_roles_verified: boolean;
  beneficiary_presence_count: number;
  beneficiary_attendance_verified: boolean;
  beneficiary_interaction_conducted: boolean;
  scheme_records_available: boolean;
  documentation_verified: boolean;
  discrepancy_observed: boolean;
  discrepancy_details?: string;
}

export interface EvidenceItem {
  id: number;
  evidence_code: string;
  inspection_id: number;
  inspector_id: number;
  title: string;
  category: 'Photo' | 'Video' | 'Document' | 'Attendance_Log';
  file_path: string;
  file_hash: string;
  hash_algorithm: string;
  latitude: number;
  longitude: number;
  captured_at: string;
  upload_time: string;
  integrity_verified: boolean;
  notes?: string;
}

export interface Inspection {
  id: number;
  inspection_code: string;
  institute_id: number;
  inspector_id: number;
  inspection_type: 'RANDOM' | 'ROUTINE' | 'SPECIAL';
  status: 'ASSIGNED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'SUBMITTED' | 'VERIFIED' | 'CLOSED';
  priority: RiskLevel;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  gps_lat?: number;
  gps_lng?: number;
  gps_accuracy?: number;
  gps_verified: boolean;
  inspector_notes?: string;
  official_review_decision?: string;
  official_review_notes?: string;
  official_reviewer_name?: string;
  institute?: Institute;
  inspector?: Inspector;
  checklist?: InspectionChecklist;
  evidence_items?: EvidenceItem[];
}

export interface RiskFactor {
  factor: string;
  points: number;
  description: string;
}

export interface RiskAnalysis {
  institute_id: number;
  institute_name: string;
  risk_score: number;
  risk_level: RiskLevel;
  breakdown: RiskFactor[];
  explanation: string;
}

export interface TrustScore {
  institute_id: number;
  institute_name: string;
  trust_score: number;
  factors: Array<{
    dimension: string;
    weight: string;
    rating: string;
  }>;
  summary: string;
}

export interface AiEvent {
  id: number;
  institute_id: number;
  inspection_id?: number;
  event_type: string;
  detected_persons: number;
  expected_range: string;
  observed_attendance?: number;
  reported_attendance?: number;
  flag_title: string;
  flag_description: string;
  confidence_score: number;
  status: string;
  reviewed_by?: string;
  review_decision?: string;
  review_comments?: string;
  created_at: string;
  bounding_boxes?: Array<{
    id: number;
    label: string;
    confidence: number;
    box: [number, number, number, number];
  }>;
}

export interface Alert {
  id: number;
  institute_id: number;
  inspection_id?: number;
  title: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING_REVIEW' | 'VERIFICATION_REQUESTED' | 'RESOLVED' | 'DISMISSED';
  action_taken?: string;
  reviewer?: string;
  reviewed_at?: string;
  created_at: string;
  institute_name?: string;
  district?: string;
}

export interface CctvCamera {
  id: number;
  institute_id: number;
  camera_code: string;
  name: string;
  location_area: string;
  stream_url: string;
  is_live: boolean;
  protocol: string;
  last_ping: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user_email: string;
  role: string;
  action: string;
  entity: string;
  entity_id?: string;
  ip_device: string;
  result: string;
  details?: string;
}

export interface DashboardSummary {
  metrics: {
    total_institutes: number;
    active_institutes: number;
    inspections_this_month: number;
    pending_inspections: number;
    alerts_requiring_review: number;
    high_risk_institutes: number;
  };
  risk_distribution: Record<string, number>;
  inspection_trends: Array<{ month: string; completed: number; random: number; anomalies: number }>;
  attendance_trends: Array<{ day: string; reported: number; observed: number }>;
  anomaly_categories: Array<{ category: string; count: number; color: string }>;
  recent_alerts: Array<{
    id: number;
    title: string;
    reason: string;
    severity: string;
    status: string;
    institute_name: string;
    time_ago: string;
  }>;
  recent_activity: Array<{
    id: number;
    user: string;
    role: string;
    action: string;
    entity: string;
    entity_id?: string;
    timestamp: string;
  }>;
  continuous_feedback: {
    inspections_fed_to_model: number;
    risk_recalibrations_today: number;
    false_positive_reduction_rate: string;
    human_decision_alignment: string;
    active_cycle_step: string;
  };
  risk_trend?: Array<{ period: string; avg_risk: number; high_risk_count: number }>;
  cctv_summary?: {
    total_cameras: number;
    online_cameras: number;
    offline_cameras: number;
    system_uptime: string;
    status: string;
  };
  recent_ai_findings?: Array<{
    id: number;
    institute_id: number;
    institute_name: string;
    detected_persons: number;
    expected_range: string;
    observed_attendance?: number;
    reported_attendance?: number;
    confidence_score: number;
    flag_title: string;
    status: string;
    created_at: string;
  }>;
}

export interface InspectorAssignment {
  id: number;
  inspection_code: string;
  institute_id: number;
  institute_name: string;
  institute_code: string;
  district: string;
  address: string;
  scheme: string;
  inspection_type: string;
  priority: RiskLevel;
  status: string;
  distance: string;
  assigned_time: string;
  scheduled_at: string;
  gps_verified: boolean;
  inspector_name: string;
  inspector_badge: string;
}

export type ChecklistStatus = 'Pass' | 'Attention' | 'Not_Verified';

export interface CategoryChecklistItem {
  id: string;
  category: 'INFRASTRUCTURE' | 'STAFF' | 'BENEFICIARIES' | 'DOCUMENTATION';
  label: string;
  status: ChecklistStatus;
  notes?: string;
}

export interface InspectionSummary {
  inspection_id: number;
  inspection_code: string;
  institute_name: string;
  institute_code: string;
  district: string;
  inspector_name: string;
  badge_id: string;
  scheduled_at: string;
  status: string;
  gps_verified: boolean;
  gps_lat?: number;
  gps_lng?: number;
  gps_accuracy?: number;
  checklist_completed_count: number;
  checklist_total_count: number;
  evidence_count: number;
  evidence_items: EvidenceItem[];
  inspector_notes?: string;
  ready_for_submission: boolean;
}

export interface AppNotification {
  id: number;
  user_role: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
