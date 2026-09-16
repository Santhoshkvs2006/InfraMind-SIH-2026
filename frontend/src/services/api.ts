import {
  Institute, Inspector, Inspection, Alert, CctvCamera,
  AuditLog, DashboardSummary, RiskAnalysis, TrustScore, AiEvent
} from '../types';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('inframind_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options?.headers || {})
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errJson = JSON.parse(errorText);
      errorMsg = errJson.detail || errJson.message || errorMsg;
    } catch {
      errorMsg = errorText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string, role?: string) =>
    fetchJson<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    }),

  // Dashboard
  getDashboardSummary: () => fetchJson<DashboardSummary>('/dashboard/summary'),

  // Institutes
  getInstitutes: (params?: { search?: string; state?: string; district?: string; scheme?: string; risk_level?: string; cctv_status?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    const qStr = query.toString();
    return fetchJson<Institute[]>(`/institutes${qStr ? `?${qStr}` : ''}`);
  },

  getInstituteDetail: (id: number) => fetchJson<{
    institute: Institute;
    risk_analysis: RiskAnalysis;
    trust_analysis: TrustScore;
    recent_inspections: any[];
    active_alerts: any[];
    cctv_cameras: any[];
    evidence_preview: any[];
  }>(`/institutes/${id}`),

  getInstituteRisk: (id: number) => fetchJson<RiskAnalysis>(`/institutes/${id}/risk`),
  getInstituteTrust: (id: number) => fetchJson<TrustScore>(`/institutes/${id}/trust`),

  // Inspectors
  getInspectors: () => fetchJson<Inspector[]>('/inspectors'),
  getInspector: (id: number) => fetchJson<Inspector>(`/inspectors/${id}`),

  // Inspections
  getInspections: (params?: { status?: string; inspector_id?: number; institute_id?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.append(k, String(v));
      });
    }
    const qStr = query.toString();
    return fetchJson<Inspection[]>(`/inspections${qStr ? `?${qStr}` : ''}`);
  },

  getInspection: (id: number) => fetchJson<Inspection>(`/inspections/${id}`),

  generateRandomInspection: (district?: string) =>
    fetchJson<Inspection>('/inspections/random', {
      method: 'POST',
      body: JSON.stringify({ district, priority_weight: true })
    }),

  startInspection: (id: number, coords: { latitude: number; longitude: number; accuracy: number }) =>
    fetchJson<any>(`/inspections/${id}/start`, {
      method: 'POST',
      body: JSON.stringify(coords)
    }),

  uploadEvidence: (id: number, evidence: { title: string; category: string; latitude: number; longitude: number; file_path?: string; notes?: string }) =>
    fetchJson<any>(`/inspections/${id}/evidence`, {
      method: 'POST',
      body: JSON.stringify(evidence)
    }),

  submitInspection: (id: number, payload: { inspector_notes: string; checklist: any }) =>
    fetchJson<any>(`/inspections/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  verifyInspection: (id: number, payload: { decision: string; reviewer_name: string; comments: string }) =>
    fetchJson<any>(`/inspections/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // CCTV
  getInstituteCameras: (instituteId: number) =>
    fetchJson<CctvCamera[]>(`/cctv/institutes/${instituteId}/cameras`),

  captureCameraSnapshot: (cameraId: number) =>
    fetchJson<any>(`/cctv/cameras/${cameraId}/snapshot`, { method: 'POST' }),

  // VC
  requestRandomVc: (instituteId: number) =>
    fetchJson<any>('/vc/request', {
      method: 'POST',
      body: JSON.stringify({ institute_id: instituteId })
    }),

  completeRandomVc: (sessionId: number, payload: { checklist_results: any; notes?: string }) =>
    fetchJson<any>(`/vc/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // AI
  getAiEvents: (instituteId?: number) =>
    fetchJson<AiEvent[]>(`/ai/events${instituteId ? `?institute_id=${instituteId}` : ''}`),

  triggerAiAnalysis: (instituteId: number, inspectionId?: number) =>
    fetchJson<any>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ institute_id: instituteId, inspection_id: inspectionId })
    }),

  reviewAiEvent: (eventId: number, payload: { decision: string; reviewer_name: string; comments: string }) =>
    fetchJson<any>(`/ai/events/${eventId}/review`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Alerts
  getAlerts: (status?: string) =>
    fetchJson<Alert[]>(`/alerts${status ? `?status=${status}` : ''}`),

  reviewAlert: (alertId: number, action: string, notes?: string) =>
    fetchJson<any>(`/alerts/${alertId}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, notes })
    }),

  // Reports
  getInspectionReport: (inspectionId: number) =>
    fetchJson<any>(`/reports/${inspectionId}`),

  // Inspector Field Operations (Phase 2)
  getInspectorAssignments: (inspectorId?: number) =>
    fetchJson<any[]>(`/inspections/inspector/assignments${inspectorId ? `?inspector_id=${inspectorId}` : ''}`),

  verifyGps: (id: number, coords: { latitude: number; longitude: number; accuracy: number; is_demo_mode?: boolean }) =>
    fetchJson<any>(`/inspections/${id}/gps`, {
      method: 'POST',
      body: JSON.stringify(coords)
    }),

  saveCategoryChecklist: (id: number, items: any[]) =>
    fetchJson<any>(`/inspections/${id}/checklist`, {
      method: 'POST',
      body: JSON.stringify({ items })
    }),

  getInspectionSummary: (id: number) =>
    fetchJson<any>(`/inspections/${id}/summary`),

  // Notifications
  getNotifications: (role?: string, unreadOnly?: boolean) =>
    fetchJson<any[]>(`/notifications?role=${role || 'DEPARTMENT_OFFICIAL'}${unreadOnly ? '&unread_only=true' : ''}`),

  getUnreadNotificationCount: (role?: string) =>
    fetchJson<{ unread_count: number }>(`/notifications/count?role=${role || 'DEPARTMENT_OFFICIAL'}`),

  markNotificationRead: (id: number) =>
    fetchJson<any>(`/notifications/${id}/read`, { method: 'POST' }),

  markAllNotificationsRead: (role?: string) =>
    fetchJson<any>(`/notifications/mark-all-read?role=${role || 'DEPARTMENT_OFFICIAL'}`, { method: 'POST' }),

  // Audit Logs
  getAuditLogs: (params?: { role?: string; action?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.append(k, String(v));
      });
    }
    const qStr = query.toString();
    return fetchJson<AuditLog[]>(`/audit-logs${qStr ? `?${qStr}` : ''}`);
  },

  // Demo controller
  resetDemoData: () => fetchJson<any>('/demo/reset', { method: 'POST' }),
  prepareDemoStep: (step: number) => fetchJson<any>(`/demo/scenario/prepare-step/${step}`, { method: 'POST' }),
  loadSihScenario: () => fetchJson<any>('/demo/load-sih-scenario', { method: 'POST' }),
  getInstituteRiskHistory: (instituteId: number) => fetchJson<any>(`/institutes/${instituteId}/risk-history`),
  getAiEventDetail: (eventId: number) => fetchJson<any>(`/ai/events/${eventId}`),
  resetInstituteBaseline: (instituteId: number) => fetchJson<any>(`/ai/reset-baseline/${instituteId}`, { method: 'POST' })
};
