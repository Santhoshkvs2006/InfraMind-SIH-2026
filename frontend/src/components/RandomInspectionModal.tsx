import React from 'react';
import { Inspection } from '../types';
import { RiskBadge } from './RiskBadge';
import { CheckCircle2, ShieldAlert, ArrowRight, Bell, Calendar, MapPin, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RandomInspectionModalProps {
  inspection: Inspection;
  onClose: () => void;
}

export const RandomInspectionModal: React.FC<RandomInspectionModalProps> = ({ inspection, onClose }) => {
  const navigate = useNavigate();

  const handleViewAssignment = () => {
    onClose();
    navigate(`/assignments/${inspection.id}`);
  };

  const formattedTime = new Date(inspection.scheduled_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with Success Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-blue-500/30 border border-blue-400/40 text-blue-100 text-xs font-semibold px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Controlled Random Engine
            </span>
            <span className="text-xs text-blue-200 font-mono font-semibold">
              {inspection.inspection_code}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-3 text-white">
            INSPECTION GENERATED
          </h2>
          <p className="text-blue-100 text-xs mt-1">
            System has selected an eligible institute and dispatched a designated inspection officer.
          </p>
        </div>

        {/* Inspection Details Card */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Institute</span>
                <h3 className="text-base font-bold text-slate-900">{inspection.institute?.name || 'ABC Welfare Centre'}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{inspection.institute?.district || 'Chennai'}, {inspection.institute?.state || 'Tamil Nadu'}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Priority</span>
                <RiskBadge level={inspection.priority || 'ATTENTION'} score={inspection.institute?.risk_score} showScore />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Assigned Inspector</span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{inspection.inspector?.name || 'Officer Arun Kumar'}</span>
                </div>
                <span className="text-[10px] text-slate-500">{inspection.inspector?.badge_id || 'INS-TN-CHN-01'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Inspection Type</span>
                <span className="font-semibold text-slate-800 mt-0.5 inline-block">
                  {inspection.inspection_type} Inspection
                </span>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>Generated At {formattedTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notice Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Unannounced inspection orders are tamper-evident. The inspector is required to complete GPS verification upon arrival before evidence capture.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleViewAssignment}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>View Assignment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                alert(`Inspector ${inspection.inspector?.name || 'Officer Arun'} has been notified via priority mobile dispatch.`);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-slate-600" />
              <span>Notify Inspector</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
