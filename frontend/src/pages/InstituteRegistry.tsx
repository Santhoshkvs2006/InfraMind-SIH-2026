import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Institute, RiskLevel } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { 
  Building2, 
  Search, 
  Filter, 
  Video, 
  Eye, 
  Calendar, 
  MapPin, 
  Users, 
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Dice5
} from 'lucide-react';
import { RandomInspectionModal } from '../components/RandomInspectionModal';
import confetti from 'canvas-confetti';

export const InstituteRegistry: React.FC = () => {
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [schemeFilter, setSchemeFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [cctvFilter, setCctvFilter] = useState('');
  const [selectedInspection, setSelectedInspection] = useState<any>(null);

  const loadInstitutes = async () => {
    setIsLoading(true);
    try {
      const data = await api.getInstitutes({
        search: searchTerm,
        district: districtFilter,
        scheme: schemeFilter,
        risk_level: riskFilter,
        cctv_status: cctvFilter
      });
      setInstitutes(data);
    } catch (err) {
      console.error('Failed to load institutes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutes();
  }, [searchTerm, districtFilter, schemeFilter, riskFilter, cctvFilter]);

  const handleQuickInspect = async (inst: Institute) => {
    try {
      const res = await api.generateRandomInspection(inst.district);
      setSelectedInspection(res);
      confetti({ particleCount: 50, spread: 60 });
    } catch (err) {
      console.error('Failed to generate inspection:', err);
    }
  };

  const schemesList = [
    'PM-AJAY',
    'SMILE',
    'PM-DAKSH',
    'Vayoshreshtha',
    'Nasha Mukt Bharat',
    'ADIP'
  ];

  const districtsList = [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Salem',
    'Tiruchirappalli',
    'Tirunelveli',
    'Thanjavur',
    'Erode'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Building2 className="w-4 h-4" />
            <span>CENTRAL REGISTRY DATABASE</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Institute & NGO Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive registry of institutions running under DoSJE central assistance schemes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadInstitutes()}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={async () => {
              const res = await api.generateRandomInspection();
              setSelectedInspection(res);
              confetti({ particleCount: 60, spread: 60 });
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Dice5 className="w-4 h-4" />
            <span>Random Inspection</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by institute name, code, district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* District Filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Districts</option>
            {districtsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Scheme Filter */}
          <select
            value={schemeFilter}
            onChange={(e) => setSchemeFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Schemes</option>
            {schemesList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Risk Levels</option>
            <option value="NORMAL">Normal (Low Risk)</option>
            <option value="ATTENTION">Attention (Medium Risk)</option>
            <option value="VERIFICATION_REQUIRED">Verification Required (High Risk)</option>
          </select>
        </div>
      </div>

      {/* Institutes Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Institute ID & Name</th>
                <th className="py-3.5 px-3">District</th>
                <th className="py-3.5 px-3">Scheme</th>
                <th className="py-3.5 px-3">Beneficiaries</th>
                <th className="py-3.5 px-3">Last Inspection</th>
                <th className="py-3.5 px-3">Risk Score</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">CCTV</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading institutes...
                  </td>
                </tr>
              ) : institutes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No institutes found matching current filters.
                  </td>
                </tr>
              ) : (
                institutes.map((inst) => (
                  <tr 
                    key={inst.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/institutes/${inst.id}`)}
                  >
                    {/* ID & Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {inst.name}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {inst.institute_code}
                      </div>
                    </td>

                    {/* District */}
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{inst.district}</span>
                      </div>
                    </td>

                    {/* Scheme */}
                    <td className="py-3.5 px-3 text-slate-600 font-medium max-w-[160px] truncate" title={inst.scheme}>
                      {inst.scheme}
                    </td>

                    {/* Beneficiaries */}
                    <td className="py-3.5 px-3 text-slate-800 font-semibold font-mono">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inst.beneficiaries_registered}</span>
                      </div>
                    </td>

                    {/* Last Inspection */}
                    <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                      {inst.last_inspection_date 
                        ? new Date(inst.last_inspection_date).toLocaleDateString()
                        : 'Scheduled'}
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-3">
                      <RiskBadge 
                        level={inst.risk_level} 
                        score={inst.risk_score} 
                        showScore 
                      />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {inst.status}
                      </span>
                    </td>

                    {/* CCTV */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        inst.cctv_status === 'ONLINE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : inst.cctv_status === 'DEGRADED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <Video className="w-3 h-3" />
                        {inst.cctv_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/institutes/${inst.id}`)}
                          className="px-2.5 py-1 text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleQuickInspect(inst)}
                          title="Assign Random Inspection"
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100/60 rounded transition-colors cursor-pointer"
                        >
                          <Dice5 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Random Inspection Modal */}
      {selectedInspection && (
        <RandomInspectionModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
};
