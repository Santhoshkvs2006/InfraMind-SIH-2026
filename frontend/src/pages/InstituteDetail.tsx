import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Institute, RiskAnalysis, TrustScore } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { RandomInspectionModal } from '../components/RandomInspectionModal';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Video, 
  ArrowLeft, 
  Dice5, 
  ChevronRight, 
  CheckCircle2, 
  FileText,
  HelpCircle,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const InstituteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<{
    institute: Institute;
    risk_analysis: RiskAnalysis;
    trust_analysis: TrustScore;
    recent_inspections: any[];
    active_alerts: any[];
    cctv_cameras: any[];
    evidence_preview: any[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [generatedInspection, setGeneratedInspection] = useState<any>(null);

  const loadDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.getInstituteDetail(parseInt(id));
      setData(res);
    } catch (err) {
      console.error('Failed to load institute details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleGenerateInspection = async () => {
    if (!data?.institute) return;
    try {
      const res = await api.generateRandomInspection(data.institute.district);
      setGeneratedInspection(res);
      confetti({ particleCount: 60, spread: 60 });
      loadDetail();
    } catch (err) {
      console.error('Error generating random inspection:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading Institute Profile...
        </div>
      </div>
    );
  }

  if (!data?.institute) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Institute Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested institute ID could not be loaded.</p>
        <button
          onClick={() => navigate('/institutes')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
        >
          Back to Registry
        </button>
      </div>
    );
  }

  const { institute, risk_analysis, trust_analysis, recent_inspections, active_alerts, cctv_cameras } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back Button & Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/institutes')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Institute Registry</span>
        </button>

        <button
          onClick={handleGenerateInspection}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Dice5 className="w-4 h-4" />
          <span>Generate Random Inspection</span>
        </button>
      </div>

      {/* Overview Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900">{institute.name}</h1>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {institute.institute_code}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {institute.address}, {institute.district}, {institute.state}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {institute.scheme}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Risk Status */}
          <div className="text-right flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Risk Status</span>
            <RiskBadge level={institute.risk_level} score={institute.risk_score} showScore />
            <span className="text-[11px] text-slate-500">
              Trust Score: <strong className="text-slate-800 font-mono">{institute.trust_score}/100</strong>
            </span>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs text-slate-600">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Contact Person</span>
            <span className="font-semibold text-slate-800">{institute.contact_person || 'Director In-charge'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Phone</span>
            <span className="font-mono text-slate-700">{institute.contact_phone || '+91 94440 12345'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Official Email</span>
            <span className="font-mono text-slate-700">{institute.contact_email || 'admin@ngo.org'}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics / Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Registered Beneficiaries</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{institute.beneficiaries_registered}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Scheme Enrolled</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Staff & Trainers</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{institute.staff_count}</div>
          <span className="text-[11px] text-slate-500 font-medium">Verified in Roster</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg. Attendance Rate</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{institute.attendance_rate}%</div>
          <span className="text-[11px] text-blue-600 font-medium">Biometric Telemetry</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">CCTV Availability</span>
          <div className="text-lg font-black text-slate-900 mt-1 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-emerald-600" />
            <span>{institute.cctv_status}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">4 Channels Registered</span>
        </div>
      </div>

      {/* Explainable Risk Score & Trust Score Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Explainable Risk Score
              </h3>
              <p className="text-xs text-slate-500">Autonomous risk calculation based on observable telemetry</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-slate-900">{risk_analysis.risk_score}</span>
              <span className="text-xs text-slate-400"> / 100</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                risk_analysis.risk_score >= 80 ? 'bg-rose-500' :
                risk_analysis.risk_score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, risk_analysis.risk_score)}%` }}
            />
          </div>

          {/* Breakdown Items */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              Score Factor Decomposition
            </div>
            {risk_analysis.breakdown.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{item.factor}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                </div>
                <span className="font-mono font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded text-xs ml-2 flex-shrink-0">
                  +{item.points}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Risk score is an administrative decision-support indicator, not an accusation or fraud confirmation. Human verification is always required.
            </span>
          </div>
        </div>

        {/* Monitoring Trust Score */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Monitoring Trust Score
                </h3>
                <p className="text-xs text-slate-500">Evaluation of operational fidelity and evidence integrity</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-emerald-600">{trust_analysis.trust_score}</span>
                <span className="text-xs text-slate-400"> / 100</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs mt-4">
              {trust_analysis.factors.map((f, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">{f.dimension}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({f.weight})</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {f.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 mt-4">
            <p className="font-medium leading-relaxed">{trust_analysis.summary}</p>
          </div>
        </div>
      </div>

      {/* Recent Inspections & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspection History */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Recent Inspections
          </h3>
          <div className="space-y-2">
            {recent_inspections.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No past inspections recorded.</p>
            ) : (
              recent_inspections.map((insp) => (
                <div
                  key={insp.id}
                  onClick={() => navigate(`/assignments/${insp.id}`)}
                  className="p-3 rounded-lg border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-colors flex items-center justify-between text-xs cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-slate-800">{insp.code}</div>
                    <div className="text-[11px] text-slate-500">
                      Officer: {insp.inspector_name} • {insp.type}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                      {insp.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(insp.scheduled_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Active Alerts for this Institute
          </h3>
          <div className="space-y-2">
            {active_alerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active alerts. All monitoring clear.</p>
            ) : (
              active_alerts.map((al) => (
                <div key={al.id} className="p-3 rounded-lg border border-slate-200/80 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{al.title}</span>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded uppercase">
                      {al.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{al.reason}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">Status: {al.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Random Inspection Modal */}
      {generatedInspection && (
        <RandomInspectionModal
          inspection={generatedInspection}
          onClose={() => setGeneratedInspection(null)}
        />
      )}
    </div>
  );
};
