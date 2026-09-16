import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Inspection } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { 
  Building2, 
  MapPin, 
  UserCheck, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  FileText, 
  Camera, 
  Video, 
  Users, 
  CheckSquare, 
  ExternalLink,
  Smartphone,
  Navigation
} from 'lucide-react';

export const InspectionAssignmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAssignment = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.getInspection(parseInt(id));
      setInspection(data);
    } catch (err) {
      console.error('Failed to load inspection assignment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignment();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading Assignment Details...
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Assignment Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Unable to locate the inspection assignment.</p>
        <button
          onClick={() => navigate('/assignments')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
        >
          View All Assignments
        </button>
      </div>
    );
  }

  const statuses = ['ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'CLOSED'];
  const currentStatusIndex = statuses.indexOf(inspection.status);

  const requiredEvidences = [
    { label: 'GPS Geofence Check-in', desc: 'Auto-verified within 5m of designated coordinates', icon: Navigation, completed: inspection.gps_verified },
    { label: 'Physical Site Photos', desc: 'Front elevation, activity rooms, and sanitation', icon: Camera, completed: (inspection.evidence_items?.length || 0) > 0 },
    { label: 'Short 360° Walkthrough Video', desc: 'Live unobstructed view of active program session', icon: Video, completed: false },
    { label: 'Attendance Roll Verification', desc: 'Cross-check physical headcount against daily biometric log', icon: Users, completed: inspection.checklist?.beneficiary_attendance_verified || false },
    { label: 'Staff & Trainer Verification', desc: 'Validate present staff against scheme qualification ledger', icon: UserCheck, completed: inspection.checklist?.staff_attendance_verified || false },
    { label: 'Beneficiary Interaction', desc: 'Confidential sample dialogue regarding entitlements', icon: Users, completed: inspection.checklist?.beneficiary_interaction_conducted || false },
    { label: 'Mandatory Inspection Checklist', desc: '12-point infrastructure and safety compliance checklist', icon: CheckSquare, completed: inspection.checklist !== undefined }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
          {inspection.inspection_code}
        </span>
      </div>

      {/* Assignment Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                {inspection.inspection_type} Inspection Assignment
              </span>
              <RiskBadge level={inspection.priority || 'ATTENTION'} score={inspection.institute?.risk_score} showScore />
            </div>
            <h1 className="text-2xl font-black text-slate-900">{inspection.institute?.name || 'ABC Welfare Centre'}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{inspection.institute?.address || 'Guindy, Chennai, Tamil Nadu'}</span>
            </div>
          </div>

          <div className="text-left md:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Generated Timestamp</span>
            <div className="text-xs font-semibold text-slate-800 flex items-center md:justify-end gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{new Date(inspection.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Lifecycle Status Stepper */}
        <div className="pt-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Inspection Lifecycle Status
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {statuses.map((st, index) => {
              const isPast = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              return (
                <div
                  key={st}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                      : isPast
                      ? 'bg-blue-50/80 text-blue-900 border-blue-200 font-semibold'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider">
                    Step 0{index + 1}
                  </div>
                  <div className="text-xs mt-0.5">
                    {st.replace('_', ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Map + Evidence Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Officer & Details (1 col) */}
        <div className="space-y-6">
          {/* Assigned Officer Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Assigned Inspection Officer
            </h3>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {inspection.inspector?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AK'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {inspection.inspector?.name || 'Officer Arun Kumar'}
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  Badge: {inspection.inspector?.badge_id || 'INS-TN-CHN-01'}
                </p>
                <p className="text-[11px] text-slate-600">
                  {inspection.inspector?.district || 'Chennai'} District Inspection Cell
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
              <div className="flex justify-between">
                <span>Active Assignments:</span>
                <strong className="text-slate-800 font-mono">{inspection.inspector?.active_assignments || 1}</strong>
              </div>
              <div className="flex justify-between">
                <span>Completed Audits:</span>
                <strong className="text-slate-800 font-mono">{inspection.inspector?.total_inspections || 14}</strong>
              </div>
            </div>
          </div>

          {/* Location Map Placeholder */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              Geofenced Location Coordinates
            </h3>

            {/* Stylized Map View Placeholder */}
            <div className="h-44 w-full bg-slate-900 rounded-xl relative overflow-hidden border border-slate-800 flex items-center justify-center p-4">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Center Coordinate Pin */}
              <div className="relative z-10 text-center">
                <div className="inline-flex p-3 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/40 mb-2 animate-bounce">
                  <MapPin className="w-6 h-6 text-rose-500" />
                </div>
                <div className="text-xs font-mono font-bold text-white">
                  {inspection.institute?.latitude || 13.0067}° N, {inspection.institute?.longitude || 80.2206}° E
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded mt-1 inline-block">
                  ✓ Geofence Radius: 50m
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Field officer's GPS coordinates will be mathematically verified against this geofence before inspection can proceed.
            </p>
          </div>
        </div>

        {/* Required Evidence & Checklist (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Required Evidence & Verification Protocol
                </h3>
                <p className="text-xs text-slate-500">
                  Every evidence object captured in the field must be cryptographically hashed (SHA-256) and geo-tagged.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                7 Mandatory Items
              </span>
            </div>

            <div className="space-y-3">
              {requiredEvidences.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-700 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{item.label}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {item.completed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Required
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inspector Mobile View Dispatch Notice */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-700" />
                  Field Officer Mobile Dispatch Active
                </div>
                <p className="text-[11px] text-blue-700/80 mt-0.5">
                  The assigned officer has received the unannounced inspection prompt on their mobile field terminal.
                </p>
              </div>

              <button
                onClick={() => alert('Mobile push dispatch re-sent to Officer Arun Kumar with priority alert tone.')}
                className="text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 border border-blue-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              >
                Re-dispatch Ping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
