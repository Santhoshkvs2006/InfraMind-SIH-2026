import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Inspection } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Search, 
  MapPin, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';

export const AssignmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await api.getInspections({ status: filterStatus || undefined });
      setInspections(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [filterStatus]);

  const filtered = inspections.filter(insp => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      insp.inspection_code.toLowerCase().includes(term) ||
      (insp.institute?.name && insp.institute.name.toLowerCase().includes(term)) ||
      (insp.inspector?.name && insp.inspector.name.toLowerCase().includes(term)) ||
      (insp.institute?.district && insp.institute.district.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>FIELD OPERATIONS</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Inspection Assignments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active, pending, and completed inspection assignments dispatched across Tamil Nadu and other monitoring zones.
          </p>
        </div>

        <button
          onClick={() => loadAssignments()}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh assignments"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by code, institute, inspector, district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="CLOSED">Closed / Verified</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Inspection Code</th>
                <th className="py-3.5 px-3">Institute Name</th>
                <th className="py-3.5 px-3">District</th>
                <th className="py-3.5 px-3">Assigned Inspector</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading assignments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No inspection assignments found.
                  </td>
                </tr>
              ) : (
                filtered.map((insp) => (
                  <tr
                    key={insp.id}
                    onClick={() => navigate(`/assignments/${insp.id}`)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 group-hover:text-blue-900">
                      {insp.inspection_code}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {insp.institute?.name || 'ABC Welfare Centre'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{insp.institute?.district || 'Chennai'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{insp.inspector?.name || 'Officer Arun'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {insp.inspection_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                      {new Date(insp.scheduled_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        insp.status === 'CLOSED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : insp.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {insp.status === 'CLOSED' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {insp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/assignments/${insp.id}`);
                        }}
                        className="px-2.5 py-1 text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded text-xs font-semibold transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
