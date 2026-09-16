import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardSummary, Inspection } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { RandomInspectionModal } from '../components/RandomInspectionModal';
import { 
  Building2, 
  Activity, 
  CalendarCheck2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Dice5, 
  ArrowUpRight, 
  ChevronRight,
  TrendingUp,
  MapPin,
  CheckCircle2, 
  RefreshCw,
  Bot,
  Camera,
  Video,
  FileText,
  Eye,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInspection, setGeneratedInspection] = useState<Inspection | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateRandom = async () => {
    setIsGenerating(true);
    try {
      // Small simulated selection pause
      await new Promise(r => setTimeout(r, 900));
      const res = await api.generateRandomInspection();
      setGeneratedInspection(res);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      loadData();
    } catch (err) {
      console.error('Failed to generate random inspection:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const metrics = summary?.metrics || {
    total_institutes: 248,
    active_institutes: 221,
    inspections_this_month: 31,
    pending_inspections: 8,
    alerts_requiring_review: 12,
    high_risk_institutes: 9
  };

  const metricCards = [
    {
      title: 'Total Institutes',
      value: metrics.total_institutes,
      sub: 'Across 38 districts',
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      title: 'Active Institutes',
      value: metrics.active_institutes,
      sub: '89.1% Operational',
      icon: Activity,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    {
      title: 'Inspections This Month',
      value: metrics.inspections_this_month,
      sub: '+14% vs last month',
      icon: CalendarCheck2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200'
    },
    {
      title: 'Pending Inspections',
      value: metrics.pending_inspections,
      sub: 'Assigned to field',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    {
      title: 'Alerts Requiring Review',
      value: metrics.alerts_requiring_review,
      sub: 'Occupancy & Biometric',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    },
    {
      title: 'High Risk Institutes',
      value: metrics.high_risk_institutes,
      sub: 'Verification Required',
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200'
    }
  ];

  const riskDistributionData = [
    { name: 'Normal', count: 184, color: '#10b981' },
    { name: 'Attention', count: 55, color: '#f59e0b' },
    { name: 'Verification Required', count: 9, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Title & Random Inspection Hero Action */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Official Monitoring Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Department Official Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time telemetry, risk scoring, and tamper-evident inspection governance for DoSJE projects and institutes.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={async () => {
              setIsGenerating(true);
              try {
                await api.loadSihScenario();
                confetti({
                  particleCount: 90,
                  spread: 80,
                  origin: { y: 0.6 }
                });
                await loadData();
              } catch (err) {
                console.error("Scenario trigger error:", err);
              } finally {
                setIsGenerating(false);
              }
            }}
            disabled={isGenerating}
            className="group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse" />
            <div className="text-left">
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-amber-100">
                SIH 2026 Presentation
              </span>
              <span className="text-xs sm:text-sm font-black">
                {isGenerating ? 'Loading Scenario...' : 'LOAD SIH DEMO SCENARIO'}
              </span>
            </div>
          </button>

          <button
            onClick={handleGenerateRandom}
            disabled={isGenerating}
            className="group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Dice5 className={`w-5 h-5 transition-transform ${isGenerating ? 'animate-spin' : 'group-hover:rotate-45'}`} />
            <div className="text-left">
              <span className="block text-[10px] uppercase tracking-wider font-semibold opacity-90">
                Controlled Engine
              </span>
              <span className="text-xs sm:text-sm font-black">
                {isGenerating ? 'Selecting...' : 'GENERATE RANDOM INSPECTION'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Top 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {card.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Anomaly & Vigilance Command Ribbon (SIH 2026 Core Workflow Highlight) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-500/10 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-200 uppercase">
                Anomaly Identified – Verification Required
              </span>
              <span className="text-xs font-semibold text-slate-700">Target: ABC Welfare Centre</span>
            </div>
            <p className="text-xs text-slate-700 mt-1">
              AI detected <strong>17 attendees</strong> in frame / <strong>61 observed</strong> vs <strong>95 reported</strong> (Disparity: -34). Risk score elevated: <span className="font-bold text-red-600 font-mono">52 → 78 (+26 pts)</span>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/human-verification')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Human Verification
          </button>
          <button
            onClick={() => navigate('/ai-demo')}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            AI Frame
          </button>
          <button
            onClick={() => navigate('/cctv')}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <Camera className="w-3.5 h-3.5 text-slate-600" />
            CCTV (4)
          </button>
          <button
            onClick={() => navigate('/vc')}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <Video className="w-3.5 h-3.5 text-indigo-600" />
            5-Min VC
          </button>
          <button
            onClick={() => navigate('/reports/1')}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            Report
          </button>
        </div>
      </div>

      {/* Charts & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inspection Trends (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Inspection Activity & Random Vigilance Trends
              </h3>
              <p className="text-xs text-slate-500">Monthly breakdown of completed vs random inspections</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Completed
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Random
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.inspection_trends || []}>
                <defs>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="completed" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorComp)" />
                <Area type="monotone" dataKey="random" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorRand)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Institute Risk Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">Total monitored: 248 institutions</p>

            <div className="space-y-3">
              {riskDistributionData.map((item, i) => {
                const pct = Math.round((item.count / 248) * 100);
                return (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="flex items-center gap-2 text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        {item.name}
                      </span>
                      <span className="font-mono text-slate-600">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/institutes')}
              className="w-full text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/70 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Explore Institute Registry</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Recent System Alerts Requiring Review
              </h3>
              <p className="text-xs text-slate-500">Autonomous triggers from AI & telemetry mismatch</p>
            </div>
            <span className="text-xs font-mono font-semibold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
              12 Active
            </span>
          </div>

          <div className="space-y-2.5">
            {(summary?.recent_alerts || []).slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg border border-slate-200/80 hover:border-slate-300 bg-slate-50/60 transition-colors flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      alert.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{alert.reason}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-500">{alert.institute_name}</span>
                    <span>•</span>
                    <span>{alert.time_ago}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/institutes')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold p-1 hover:bg-blue-50 rounded transition-colors flex-shrink-0 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inspection Activity */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-blue-600" />
                Recent Inspection Activity
              </h3>
              <p className="text-xs text-slate-500">Live feed of inspection actions & assignments</p>
            </div>
            <button
              onClick={() => navigate('/assignments')}
              className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {(summary?.recent_activity || []).slice(0, 4).map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[11px]">
                    {act.user.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{act.action}</div>
                    <div className="text-[11px] text-slate-500">
                      Entity: <span className="font-mono text-slate-700">{act.entity}</span> ({act.entity_id || 'System'})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[11px] text-slate-400 block">{act.timestamp}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 justify-end">
                    <CheckCircle2 className="w-3 h-3" /> Logged
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Random Inspection Modal when generated */}
      {generatedInspection && (
        <RandomInspectionModal
          inspection={generatedInspection}
          onClose={() => setGeneratedInspection(null)}
        />
      )}
    </div>
  );
};
