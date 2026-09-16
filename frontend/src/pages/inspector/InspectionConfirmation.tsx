import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight, Home, FileText, Clock, Navigation } from 'lucide-react';

export const InspectionConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const submissionData = location.state?.submissionData || {
    inspection_code: 'INS-2026-00841',
    submitted_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    evidence_count: 2,
    gps_verified: true,
    next_step: 'Pending Official Verification'
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center">
        {/* Success Banner */}
        <div className="bg-gradient-to-b from-emerald-600 to-teal-700 text-white p-8">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-xs border border-white/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <span className="text-emerald-100 text-xs font-bold uppercase tracking-wider block mb-1">
            DoSJE Verification Gateway
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Inspection Submitted Successfully
          </h1>
          <p className="text-emerald-100 text-xs mt-1.5 max-w-sm mx-auto">
            Your field report and tamper-evident evidence have been cryptographically sealed and transmitted to the Central Directorate.
          </p>
        </div>

        {/* Details Card */}
        <div className="p-6 space-y-4 text-left text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500 font-medium">Inspection Code:</span>
              <span className="font-mono font-extrabold text-blue-700 text-sm">
                {submissionData.inspection_code || 'INS-2026-00841'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500 font-medium">Submission Timestamp:</span>
              <span className="font-semibold text-slate-800">
                {submissionData.submitted_time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500 font-medium">Evidence Vault Items:</span>
              <span className="font-bold text-slate-800 font-mono">
                {submissionData.evidence_count} items (SHA-256 Verified)
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500 font-medium">GPS Geofence Status:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                Verified On-Site
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500 font-medium">Next Stage:</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px]">
                <Clock className="w-3 h-3 text-amber-600" />
                Pending Official Verification
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Official notifications have been dispatched to the Central Directorate. Your inspection audit log is permanently registered.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/inspector')}
              className="w-full sm:flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Inspector Home</span>
            </button>
            <button
              onClick={() => navigate(`/assignments/${id || 1}`)}
              className="w-full sm:flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>View Dossier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
