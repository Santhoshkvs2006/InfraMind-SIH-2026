import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Eye, 
  FileText, 
  Sparkles, 
  Info, 
  AlertTriangle,
  HelpCircle,
  X
} from 'lucide-react';
import { api } from '../../services/api';

interface BoundingBox {
  id: number;
  label: string;
  confidence: number;
  box: [number, number, number, number];
}

export const AiDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [, setScenarioLoaded] = useState(false);
  const [showFactorModal, setShowFactorModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState<'hall' | 'classroom' | 'entrance'>('hall');

  // Calibrated SIH Demo Data
  const [detectedPersons, setDetectedPersons] = useState(17);
  const [observedAttendance, setObservedAttendance] = useState(61);
  const [reportedAttendance, setReportedAttendance] = useState(95);
  const [, setConfidenceScore] = useState(0.87);
  const [riskBefore, setRiskBefore] = useState(52);
  const [riskAfter, setRiskAfter] = useState(78);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 17 Bounding boxes for Activity Hall
  const boundingBoxes: BoundingBox[] = [
    { id: 1, label: 'person', confidence: 0.89, box: [35, 60, 95, 180] },
    { id: 2, label: 'person', confidence: 0.86, box: [110, 50, 165, 175] },
    { id: 3, label: 'person', confidence: 0.91, box: [180, 70, 235, 185] },
    { id: 4, label: 'person', confidence: 0.84, box: [250, 65, 305, 180] },
    { id: 5, label: 'person', confidence: 0.87, box: [320, 55, 375, 170] },
    { id: 6, label: 'person', confidence: 0.85, box: [390, 75, 445, 190] },
    { id: 7, label: 'person', confidence: 0.90, box: [60, 150, 120, 260] },
    { id: 8, label: 'person', confidence: 0.88, box: [135, 140, 190, 255] },
    { id: 9, label: 'person', confidence: 0.83, box: [205, 155, 260, 270] },
    { id: 10, label: 'person', confidence: 0.86, box: [280, 145, 335, 260] },
    { id: 11, label: 'person', confidence: 0.89, box: [350, 150, 405, 265] },
    { id: 12, label: 'person', confidence: 0.84, box: [420, 140, 475, 255] },
    { id: 13, label: 'person', confidence: 0.87, box: [85, 220, 145, 320] },
    { id: 14, label: 'person', confidence: 0.85, box: [165, 215, 225, 315] },
    { id: 15, label: 'person', confidence: 0.92, box: [240, 225, 300, 325] },
    { id: 16, label: 'person', confidence: 0.82, box: [315, 210, 375, 310] },
    { id: 17, label: 'person', confidence: 0.88, box: [390, 220, 450, 320] },
  ];

  const riskFactors = [
    { factor: 'Attendance Anomaly', points: 20, delta: '+20', description: 'AI observed 17 in activity hall / 61 overall vs 95 reported in daily roll', color: 'text-red-600 bg-red-50 border-red-200' },
    { factor: 'Inspection Discrepancy', points: 18, delta: '+18', description: 'Field inspector checklist identified physical count deviation during visit', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { factor: 'Previous Findings', points: 15, delta: '+15', description: 'Prior routine check flagged storage room signage compliance notice', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { factor: 'Delayed Reporting', points: 15, delta: '+15', description: 'Monthly biometric attendance roll submitted 4 days after cutoff date', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    { factor: 'CCTV Availability Issue', points: 10, delta: '+10', description: 'Classroom Camera 03 experienced intermittent offline timeouts', color: 'text-blue-600 bg-blue-50 border-blue-200' }
  ];

  const handleLoadScenario = async () => {
    setLoading(true);
    try {
      await api.loadSihScenario();
      setScenarioLoaded(true);
      setDetectedPersons(17);
      setObservedAttendance(61);
      setReportedAttendance(95);
      setConfidenceScore(0.87);
      setRiskBefore(52);
      setRiskAfter(78);
      setStatusMessage("SIH 2026 Canonical Scenario Loaded: ABC Welfare Centre (Risk 52 → 78, Alert Created)");
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      console.error("Failed to load scenario", err);
      setStatusMessage("Scenario prepared in offline mode.");
      setScenarioLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-blue-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI Demo Mode • OpenCV & YOLO Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-500/20 text-blue-200 border border-blue-500/30">
                Inference Engine v2.4
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Bot className="w-7 h-7 text-cyan-400" />
              AI-Assisted Anomaly Detection & Risk Telemetry
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time occupancy estimation, spatial frame analysis, and explainable risk calculation. 
              All outputs flag anomalies for <span className="text-cyan-300 font-semibold">mandatory official human verification</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleLoadScenario}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-yellow-200" />
              {loading ? "Preparing Scenario..." : "LOAD SIH DEMO SCENARIO"}
            </button>

            <button
              onClick={() => navigate('/human-verification')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Open Human Verification
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Detection Frame & Explainable Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CV Frame Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Spatial Occupancy Analysis Frame
                </h2>
                <p className="text-xs text-slate-500">
                  Target: ABC Welfare Centre (Activity Hall – Cam 02)
                </p>
              </div>

              {/* Sample Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setSelectedSample('hall')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    selectedSample === 'hall' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Activity Hall
                </button>
                <button
                  onClick={() => setSelectedSample('classroom')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    selectedSample === 'classroom' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Classroom
                </button>
                <button
                  onClick={() => setSelectedSample('entrance')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    selectedSample === 'entrance' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Entrance
                </button>
              </div>
            </div>

            {/* Video / Canvas Simulation */}
            <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner group">
              {/* Background Canvas / Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-85"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%), repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)`
                }}
              >
                {/* Visual grid representing classroom/hall seats */}
                <div className="absolute inset-8 border border-cyan-500/20 rounded-lg flex flex-col justify-around p-4">
                  <div className="flex justify-around">
                    {[1,2,3,4,5].map(k => (
                      <div key={k} className="w-16 h-12 border border-slate-700/60 rounded bg-slate-800/40 flex items-center justify-center text-[10px] text-slate-500">
                        Desk {k}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-around">
                    {[6,7,8,9,10].map(k => (
                      <div key={k} className="w-16 h-12 border border-slate-700/60 rounded bg-slate-800/40 flex items-center justify-center text-[10px] text-slate-500">
                        Desk {k}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-around">
                    {[11,12,13,14,15].map(k => (
                      <div key={k} className="w-16 h-12 border border-slate-700/60 rounded bg-slate-800/40 flex items-center justify-center text-[10px] text-slate-500">
                        Desk {k}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bounding Boxes Overlay */}
              {selectedSample === 'hall' && boundingBoxes.map((item) => (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    left: `${(item.box[0] / 520) * 100}%`,
                    top: `${(item.box[1] / 380) * 100}%`,
                    width: `${((item.box[2] - item.box[0]) / 520) * 100}%`,
                    height: `${((item.box[3] - item.box[1]) / 380) * 100}%`,
                  }}
                  className="border-2 border-cyan-400 bg-cyan-500/10 rounded transition-all duration-300 pointer-events-none"
                >
                  <span className="absolute -top-5 left-0 px-1 py-0.2 bg-cyan-900/90 text-cyan-200 text-[9px] font-mono font-bold rounded border border-cyan-500/50 whitespace-nowrap">
                    person {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              ))}

              {/* Overlay HUD */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-3 text-xs text-white">
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE INFERENCE
                </span>
                <span className="text-slate-400 font-mono">150 FRAMES ANALYZED</span>
                <span className="text-slate-400 font-mono">CONF: 87%</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-xs px-3 py-2 rounded-lg border border-white/10 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">Frame Headcount:</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm">{detectedPersons} Persons</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Expected Batch:</span>
                  <span className="font-mono text-slate-200">25–40</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Occupancy Deficit Flagged
                </span>
              </div>
            </div>

            {/* Attendance Anomaly Comparison Bar */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center justify-between">
                <span>Attendance Discrepancy Breakdown</span>
                <span className="text-red-600 font-mono font-bold">Mismatch: -34 Persons (-35.8%)</span>
              </h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="block text-[11px] text-slate-500 font-medium">Reported in Roll</span>
                  <span className="text-xl font-mono font-black text-slate-800">{reportedAttendance}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Institute portal record</span>
                </div>

                <div className="p-3 bg-red-50 rounded-lg border border-red-200 shadow-2xs">
                  <span className="block text-[11px] text-red-700 font-medium">Observed Attendance</span>
                  <span className="text-xl font-mono font-black text-red-700">{observedAttendance}</span>
                  <span className="block text-[10px] text-red-500 mt-0.5">Physical + AI verified</span>
                </div>

                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200 shadow-2xs">
                  <span className="block text-[11px] text-cyan-800 font-medium">In Frame Detection</span>
                  <span className="text-xl font-mono font-black text-cyan-800">{detectedPersons}</span>
                  <span className="block text-[10px] text-cyan-600 mt-0.5">Activity hall camera</span>
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Advisory Flag:</strong> "Anomaly Identified – Verification Required" (Notice: AI does not conclude fraud. Authorized official review mandatory).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Explainable Risk Scoring (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Explainable Risk Score
                </h2>
                <p className="text-xs text-slate-500">Transparent factor decomposition (0–100 scale)</p>
              </div>

              <button
                onClick={() => setShowFactorModal(true)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Why this score?
              </button>
            </div>

            {/* Before / After Risk Score Banner */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl text-white shadow-md border border-indigo-900/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block mb-2">
                Risk Score Transition
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Baseline Risk</span>
                  <div className="text-2xl font-mono font-black text-slate-300">{riskBefore}</div>
                  <span className="text-[10px] text-emerald-400 font-medium">Normal Monitoring</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 text-xs font-mono font-bold border border-red-500/50">
                    +26 Points
                  </span>
                  <span className="text-slate-500 text-lg">➔</span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Updated Risk</span>
                  <div className="text-3xl font-mono font-black text-red-400">{riskAfter}</div>
                  <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider">
                    Attention Required
                  </span>
                </div>
              </div>
            </div>

            {/* Factor Decomposition List */}
            <div className="mt-5 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Factor Breakdown (+78 Total Score)
              </span>

              {riskFactors.map((rf, idx) => (
                <div key={idx} className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${rf.color}`}>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block">{rf.factor}</span>
                    <p className="text-[11px] opacity-90 leading-tight">{rf.description}</p>
                  </div>
                  <span className="font-mono font-black text-xs px-2 py-1 rounded bg-white/80 shadow-2xs shrink-0">
                    {rf.delta} pts
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => navigate('/human-verification')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Proceed to Human Verification
              </button>

              <button
                onClick={() => navigate('/reports/1')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                View Full Inspection Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* "Why this score?" Factor Modal */}
      {showFactorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Why this Risk Score? (78/100)</h3>
              </div>
              <button 
                onClick={() => setShowFactorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                InfraMind calculates an <strong>Explainable Risk Score</strong> based on transparent operational criteria approved under DoSJE guidelines. It never operates as an opaque black-box algorithm.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Factor Weighting Model</span>
                  <span>Contribution</span>
                </div>
                <div className="flex justify-between">
                  <span>1. Attendance Anomaly (Observed vs Reported)</span>
                  <span className="font-mono font-bold text-red-600">+20 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Inspection Discrepancy (Physical Deviation)</span>
                  <span className="font-mono font-bold text-orange-600">+18 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>3. Previous Findings (Compliance History)</span>
                  <span className="font-mono font-bold text-amber-600">+15 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>4. Delayed Reporting (Overdue Log Filings)</span>
                  <span className="font-mono font-bold text-yellow-600">+15 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>5. CCTV Availability (Telemetry & Stream Health)</span>
                  <span className="font-mono font-bold text-blue-600">+10 pts</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Calculated Risk</span>
                  <span className="font-mono text-red-600">78 / 100</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                *Institutes scoring ≥ 75 points are classified under <strong>Attention Required</strong> and placed at the top of the randomized inspection queue for expedited supervisory review.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowFactorModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 cursor-pointer"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
