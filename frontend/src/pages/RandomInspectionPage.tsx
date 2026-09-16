import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Inspection } from '../types';
import { RandomInspectionModal } from '../components/RandomInspectionModal';
import { 
  Dice5, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  MapPin, 
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

export const RandomInspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  const loadRecent = async () => {
    try {
      const data = await api.getInspections();
      setRecentInspections(data.slice(0, 8));
    } catch (err) {
      console.error('Error fetching inspections:', err);
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const handleTriggerRandom = async () => {
    setIsGenerating(true);
    try {
      // Small simulated selection pause
      await new Promise(r => setTimeout(r, 1200));
      const res = await api.generateRandomInspection(selectedDistrict || undefined);
      setSelectedInspection(res);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
      loadRecent();
    } catch (err) {
      console.error('Failed to generate random inspection:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
          <Dice5 className="w-4 h-4" />
          <span>VIGILANCE ENGINE</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Random Inspection Assignment Engine
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Eliminating predictable scheduled visits through controlled algorithmic randomization weighted by risk and operational telemetry.
        </p>
      </div>

      {/* Hero Interactive Random Generator Section */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Weighted Stochastic Assignment Algorithm
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
            Generate Controlled Unannounced Inspection
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            The algorithm evaluates 248 institutions across Tamil Nadu and other states, prioritizes high-risk institutes with delayed audits, checks live inspector availability within the geographic district, and dispatches an unannounced inspection order.
          </p>

          {/* District Optional Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-64">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target District (Optional)
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Districts (State-wide Random)</option>
                <option value="Chennai">Chennai (High Priority Hub)</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Madurai">Madurai</option>
                <option value="Salem">Salem</option>
                <option value="Tiruchirappalli">Tiruchirappalli</option>
                <option value="Tirunelveli">Tirunelveli</option>
              </select>
            </div>
          </div>

          {/* Main Huge Action Button */}
          <button
            onClick={handleTriggerRandom}
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-sm sm:text-base px-8 py-4 rounded-xl shadow-xl shadow-blue-500/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Dice5 className={`w-6 h-6 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {isGenerating ? 'Executing Controlled Random Selection...' : 'GENERATE RANDOM INSPECTION'}
            </span>
          </button>
        </div>
      </div>

      {/* Rules & Logic Explained */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>1. Eligibility Screening</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Institutes inspected within the last 14 days are excluded to avoid undue frequency, unless critical anomaly alerts exist.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>2. Risk-Weighted Probability</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Institutions with Risk Scores {'>'} 50 receive proportional weighting, increasing inspection probability without being purely deterministic.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>3. Officer Geofence Match</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Selects certified inspection officers within proximity to enable swift response and mandatory on-site GPS verification.
          </p>
        </div>
      </div>

      {/* Recent Random Assignments */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Recent Generated Assignments
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Inspection Code</th>
                <th className="py-3 px-3">Institute Name</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">Assigned Inspector</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInspections.map((insp) => (
                <tr key={insp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    {insp.inspection_code}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {insp.institute?.name || 'ABC Welfare Centre'}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {insp.institute?.district || 'Chennai'}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    <div className="flex items-center gap-1.5 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{insp.inspector?.name || 'Officer Arun'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {insp.inspection_type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                      {insp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/assignments/${insp.id}`)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedInspection && (
        <RandomInspectionModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
};
