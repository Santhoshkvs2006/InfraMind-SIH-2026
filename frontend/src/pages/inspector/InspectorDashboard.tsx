import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { InspectorAssignment } from '../../types';
import { RiskBadge } from '../../components/RiskBadge';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Navigation, 
  RefreshCw,
  AlertCircle,
  FileCheck2,
  Building2,
  ListTodo
} from 'lucide-react';

export const InspectorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<InspectorAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await api.getInspectorAssignments();
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load inspector assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const totalAssigned = assignments.length;
  const inProgressOrAssigned = assignments.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS' || a.status === 'EN_ROUTE').length;
  const completedCount = assignments.filter(a => a.status === 'CLOSED' || a.status === 'SUBMITTED').length;
  const pendingSubmissionCount = assignments.filter(a => a.status === 'IN_PROGRESS').length;

  const filtered = assignments.filter(a => {
    if (filter === 'ACTIVE') return a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS' || a.status === 'EN_ROUTE';
    if (filter === 'COMPLETED') return a.status === 'CLOSED' || a.status === 'SUBMITTED';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Field Inspection Officer Terminal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Officer Arun Kumar
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            District Inspection Cell – Chennai | Badge: <span className="font-mono text-blue-300 font-bold">INS-TN-CHN-01</span>
          </p>
        </div>

        <button
          onClick={loadAssignments}
          className="self-start md:self-auto inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Assignments</span>
        </button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Inspections</span>
            <ListTodo className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalAssigned}</div>
          <span className="text-[11px] text-slate-500">Active quota</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Active</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{inProgressOrAssigned}</div>
          <span className="text-[11px] text-amber-600 font-medium">Action Required</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Submissions</span>
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{pendingSubmissionCount}</div>
          <span className="text-[11px] text-slate-500">In draft mode</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{completedCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Verified & Closed</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setFilter('ACTIVE')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filter === 'ACTIVE'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Tasks ({inProgressOrAssigned})
        </button>
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Tasks ({totalAssigned})
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filter === 'COMPLETED'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Assignment Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading assigned field inspections...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No assignments found in this view.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                    {item.inspection_code}
                  </span>
                  <RiskBadge level={item.priority || 'ATTENTION'} />
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {item.inspection_type} Inspection
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                    item.status === 'CLOSED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.status === 'SUBMITTED'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : item.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {item.institute_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.address || 'Guindy, Chennai'}, {item.district}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-blue-600">
                      <Navigation className="w-3.5 h-3.5" />
                      {item.distance} from your location
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      Assigned {new Date(item.assigned_time || item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-end md:self-center">
                {item.status === 'CLOSED' || item.status === 'SUBMITTED' ? (
                  <button
                    onClick={() => navigate(`/assignments/${item.id}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <span>View Dossier</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/inspector/inspect/${item.id}`)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-500/25 transition-all hover:scale-102 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>START INSPECTION</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
