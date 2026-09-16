import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Clock, 
  CheckSquare, 
  Square, 
  Building2, 
  FileText, 
  CheckCircle2, 
  HelpCircle
} from 'lucide-react';
import { api } from '../../services/api';

export const RandomVcPage: React.FC = () => {
  const navigate = useNavigate();

  // Call timer: countdown from 300 seconds (5:00)
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [callActive, setCallActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Verification checklist items
  const [checklist, setChecklist] = useState([
    { id: 'staff_presence', label: 'Staff presence verified against nominal roll (14 staff)', checked: true },
    { id: 'beneficiary_presence', label: 'Beneficiary presence & active engagement verified', checked: true },
    { id: 'current_activity', label: 'Current session adheres to PM-AJAY skill syllabus', checked: true },
    { id: 'facility_view', label: 'Facility 360° pan verified (Activity Hall & Computer Lab)', checked: false },
    { id: 'spot_check', label: 'Unannounced spot check of kitchen & storage rooms conducted', checked: false }
  ]);

  const [vcNotes, setVcNotes] = useState(
    'Conducted 5-minute unannounced VC inspection. Beneficiaries present in hall. Administrative staff instructed to rectify attendance gap.'
  );

  useEffect(() => {
    if (!callActive || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [callActive, secondsRemaining]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleEndCall = async () => {
    setCompleting(true);
    try {
      // Complete random VC session
      await api.completeRandomVc(1, {
        checklist_results: checklist,
        notes: vcNotes
      });
      setCallActive(false);
      setCompleted(true);
    } catch {
      setCallActive(false);
      setCompleted(true);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Official Video Call Environment
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                Session ID: VC-2026-0841
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Video className="w-7 h-7 text-indigo-400" />
              Unannounced 5-Minute Random Video Verification
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Ministry of Social Justice & Empowerment • Randomized Remote Spot Check Protocol
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-black/60 rounded-xl border border-white/10 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-xs text-slate-400">Call Timer:</span>
              <span className={`font-mono font-black text-lg ${secondsRemaining < 60 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {formatTime(secondsRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Regulatory Governance Policy Notice */}
        <div className="mt-4 p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
          <span>
            <strong>Procedural Requirement: </strong>
            Random 5-minute video verification is mandated under DoSJE guidelines for institutes with anomalous attendance. 
            All live interactions and checklist verifications are timestamped and logged directly to the central compliance ledger.
          </span>
        </div>
      </div>

      {completed && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900">Random Video Verification Completed</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Session closed, checklist results recorded, and inspection report updated.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/reports/1')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            View Complete Report
          </button>
        </div>
      )}

      {/* Main VC Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Preview Feed & Media Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
            {/* Viewport */}
            <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
              {/* Simulated Institute Room Graphic */}
              <div 
                className="absolute inset-0 opacity-80"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 40%, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%), repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 30px)`
                }}
              >
                <div className="absolute inset-6 border border-indigo-500/20 rounded-xl flex flex-col justify-between p-4">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                    <span>REMOTE PEER: ABC WELFARE CENTRE</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      ENCRYPTED WEBRTC
                    </span>
                  </div>

                  {/* Representative Video Avatar / Institute Feed */}
                  <div className="text-center my-auto">
                    <Building2 className="w-16 h-16 mx-auto mb-2 text-indigo-400 opacity-60" />
                    <h4 className="text-base font-bold text-white">ABC Welfare Centre – Admin Room Feed</h4>
                    <p className="text-xs text-slate-400">Staff In-Charge: K. Ramanathan (Centre Coordinator)</p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-black/60 rounded-full border border-white/10 text-xs text-slate-300 font-mono">
                      <span>FPS: 30</span>
                      <span>•</span>
                      <span>Latency: 28ms</span>
                      <span>•</span>
                      <span>Bitrate: 2.4 Mbps</span>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-500 font-mono">
                    WATERMARK: DOSJE-REMOTE-VERIFY-2026
                  </div>
                </div>
              </div>

              {/* Local Self-View PiP */}
              <div className="absolute bottom-4 right-4 w-32 aspect-video bg-slate-800 rounded-lg border-2 border-indigo-500/50 overflow-hidden shadow-lg flex items-center justify-center">
                <div className="text-center p-1">
                  <span className="text-[9px] font-mono text-indigo-300 block font-bold">Official Console</span>
                  <span className="text-[8px] text-slate-400">Dr. Rajeshwari</span>
                </div>
              </div>
            </div>

            {/* Media Controls Toolbar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMicActive(!micActive)}
                  className={`p-3 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    micActive ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  {micActive ? 'Mute' : 'Unmuted'}
                </button>

                <button
                  type="button"
                  onClick={() => setVideoActive(!videoActive)}
                  className={`p-3 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    videoActive ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {videoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  {videoActive ? 'Stop Video' : 'Start Video'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleEndCall}
                disabled={completing || !callActive}
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <PhoneOff className="w-4 h-4" />
                {completing ? 'Concluding...' : 'Complete Verification'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Verification Checklist & Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                Live VC Verification Checklist
              </h2>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {checklist.filter(c => c.checked).length} / {checklist.length} Passed
              </span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    item.checked
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {item.checked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-medium leading-snug">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Official VC Notes */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Verification Observations & Directives
              </label>
              <textarea
                rows={4}
                value={vcNotes}
                onChange={(e) => setVcNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
                placeholder="Enter unannounced video check notes..."
              />
            </div>

            {/* Complete Button */}
            <button
              onClick={handleEndCall}
              disabled={completing || !callActive}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {completing ? "Submitting Verification..." : "Log & Finalize VC Verification"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
