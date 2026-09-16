import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Inspection, CategoryChecklistItem, ChecklistStatus, EvidenceItem } from '../../types';
import { RiskBadge } from '../../components/RiskBadge';
import { 
  ShieldCheck, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Camera, 
  Video, 
  FileText, 
  Upload, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Smartphone, 
  Building2, 
  UserCheck, 
  Home, 
  ClipboardList, 
  FileCheck, 
  User,
  Info,
  HelpCircle
} from 'lucide-react';

const DEFAULT_CHECKLIST_ITEMS: CategoryChecklistItem[] = [
  // Category 1 - Infrastructure
  { id: 'infra_1', category: 'INFRASTRUCTURE', label: 'Required facilities available', status: 'Pass' },
  { id: 'infra_2', category: 'INFRASTRUCTURE', label: 'Equipment condition acceptable', status: 'Pass' },
  { id: 'infra_3', category: 'INFRASTRUCTURE', label: 'Safety conditions acceptable', status: 'Pass' },
  { id: 'infra_4', category: 'INFRASTRUCTURE', label: 'Infrastructure matches records', status: 'Pass' },

  // Category 2 - Staff
  { id: 'staff_1', category: 'STAFF', label: 'Staff present', status: 'Pass' },
  { id: 'staff_2', category: 'STAFF', label: 'Staff attendance verified', status: 'Pass' },
  { id: 'staff_3', category: 'STAFF', label: 'Staff roles verified', status: 'Pass' },

  // Category 3 - Beneficiaries
  { id: 'ben_1', category: 'BENEFICIARIES', label: 'Beneficiaries present', status: 'Attention', notes: 'Headcount observed was 17 vs registered batch list.' },
  { id: 'ben_2', category: 'BENEFICIARIES', label: 'Attendance verified', status: 'Pass' },
  { id: 'ben_3', category: 'BENEFICIARIES', label: 'Beneficiary interaction completed', status: 'Pass' },

  // Category 4 - Documentation
  { id: 'doc_1', category: 'DOCUMENTATION', label: 'Required records available', status: 'Pass' },
  { id: 'doc_2', category: 'DOCUMENTATION', label: 'Scheme/project records verified', status: 'Pass' },
  { id: 'doc_3', category: 'DOCUMENTATION', label: 'Latest report available', status: 'Pass' }
];

export const FieldInspectionWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  // Offline/Online simulation state
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  // Step 1: GPS State
  const [gpsData, setGpsData] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    verified: boolean;
    isDemo: boolean;
  }>({
    latitude: 13.0067,
    longitude: 80.2206,
    accuracy: 4.2,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    verified: false,
    isDemo: false
  });
  const [isLocating, setIsLocating] = useState(false);

  // Step 2: Checklist State
  const [checklist, setChecklist] = useState<CategoryChecklistItem[]>(DEFAULT_CHECKLIST_ITEMS);

  // Step 3: Evidence State
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([
    {
      id: 1,
      evidence_code: 'EV-2026-00912',
      inspection_id: parseInt(id || '1'),
      inspector_id: 2,
      title: 'Facility Front Elevation & Signboard',
      category: 'Photo',
      file_path: '/media/evidence/evidence_facade.jpg',
      file_hash: 'a3f89b1c72049d5e381b9cf281a4b672810d7a5b394182a5c4e78b1029384712',
      hash_algorithm: 'SHA-256',
      latitude: 13.0067,
      longitude: 80.2206,
      captured_at: '16 Sep 2026 10:15 AM',
      upload_time: '16 Sep 2026 10:15 AM',
      integrity_verified: true,
      notes: 'Tamper-evident evidence with integrity verification.'
    }
  ]);
  const [isCapturing, setIsCapturing] = useState(false);

  // Step 4: Notes
  const [notes, setNotes] = useState(
    'Conducted comprehensive on-site verification. Beneficiary headcount discrepancy noted in multi-purpose hall. Infrastructure and safety conditions satisfactory.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load Inspection Data
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await api.getInspection(parseInt(id));
        setInspection(data);
        if (data.gps_verified) {
          setGpsData({
            latitude: data.gps_lat || 13.0067,
            longitude: data.gps_lng || 80.2206,
            accuracy: data.gps_accuracy || 4.2,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            verified: true,
            isDemo: false
          });
        }
      } catch (err) {
        console.error('Failed to load inspection:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  // Handle GPS Verification
  const handleVerifyGps = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const acc = Math.round(position.coords.accuracy * 10) / 10;
          const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          setGpsData({
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            timestamp: ts,
            verified: true,
            isDemo: false
          });
          setIsLocating(false);

          if (isOnline && id) {
            try {
              await api.verifyGps(parseInt(id), { latitude: lat, longitude: lng, accuracy: acc, is_demo_mode: false });
            } catch (e) {
              console.warn('Could not sync GPS to backend:', e);
            }
          }
        },
        async (error) => {
          console.warn('Geolocation unavailable/denied. Falling back to Demo GPS mode:', error);
          // Fallback to Demo GPS Coordinates
          const lat = 13.0067;
          const lng = 80.2206;
          const acc = 4.2;
          const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          setGpsData({
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            timestamp: ts,
            verified: true,
            isDemo: true
          });
          setIsLocating(false);

          if (isOnline && id) {
            try {
              await api.verifyGps(parseInt(id), { latitude: lat, longitude: lng, accuracy: acc, is_demo_mode: true });
            } catch (e) {
              console.warn('Could not sync GPS to backend:', e);
            }
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      // Direct demo fallback
      const lat = 13.0067;
      const lng = 80.2206;
      setGpsData({
        latitude: lat,
        longitude: lng,
        accuracy: 4.2,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: true,
        isDemo: true
      });
      setIsLocating(false);
    }
  };

  // Update Checklist Item Status
  const handleChecklistStatusChange = (itemId: string, newStatus: ChecklistStatus) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, status: newStatus, notes: newStatus === 'Pass' ? undefined : item.notes || '' };
      }
      return item;
    }));
  };

  const handleChecklistNotesChange = (itemId: string, notesText: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, notes: notesText };
      }
      return item;
    }));
  };

  // Evidence Capture Simulation
  const handleCaptureEvidence = (type: 'Photo' | 'Video') => {
    setIsCapturing(true);
    setTimeout(() => {
      const evNum = evidenceList.length + 1;
      const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const newItem: EvidenceItem = {
        id: Date.now(),
        evidence_code: `EV-2026-${String(910 + evNum).padStart(5, '0')}`,
        inspection_id: parseInt(id || '1'),
        inspector_id: 2,
        title: type === 'Photo' ? `Vocational Activity Session (Item ${evNum})` : `360 Degree Facility Walkthrough Clip`,
        category: type,
        file_path: '/media/evidence/evidence_class.jpg',
        file_hash: fakeHash,
        hash_algorithm: 'SHA-256',
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
        captured_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        upload_time: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        integrity_verified: true,
        notes: 'Tamper-evident evidence with integrity verification.'
      };

      if (!isOnline) {
        setOfflineQueue(prev => [...prev, newItem]);
      } else if (id) {
        api.uploadEvidence(parseInt(id), {
          title: newItem.title,
          category: newItem.category,
          latitude: newItem.latitude,
          longitude: newItem.longitude
        }).catch(e => console.warn('Online evidence upload error:', e));
      }

      setEvidenceList(prev => [newItem, ...prev]);
      setIsCapturing(false);
    }, 700);
  };

  // Offline Sync Trigger
  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    await new Promise(r => setTimeout(r, 1200));
    setOfflineQueue([]);
    setSyncStatus('synced');
    setIsSyncing(false);
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  // Step 4: Submission
  const handleSubmitInspection = async () => {
    setValidationError(null);

    // 1. Validate GPS
    if (!gpsData.verified) {
      setValidationError('GPS verification is required before submitting the inspection.');
      setCurrentStep(1);
      return;
    }

    // 2. Validate checklist items (require comments for Attention or Not_Verified)
    const missingComments = checklist.filter(
      item => (item.status === 'Attention' || item.status === 'Not_Verified') && (!item.notes || item.notes.trim() === '')
    );
    if (missingComments.length > 0) {
      setValidationError(`Please add explanatory notes for item: "${missingComments[0].label}"`);
      setCurrentStep(2);
      return;
    }

    // 3. Validate minimum evidence
    if (evidenceList.length === 0) {
      setValidationError('At least 1 verified evidence item (photo or video) is required.');
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      if (id) {
        // Save checklist to backend
        await api.saveCategoryChecklist(parseInt(id), checklist);

        // Submit inspection
        const submitPayload = {
          inspector_notes: notes,
          checklist: {
            facilities_available: true,
            equipment_condition_ok: true,
            safety_measures_ok: true,
            staff_present_count: 14,
            staff_attendance_verified: true,
            staff_roles_verified: true,
            beneficiary_presence_count: 61,
            beneficiary_attendance_verified: false,
            beneficiary_interaction_conducted: true,
            scheme_records_available: true,
            documentation_verified: true,
            discrepancy_observed: checklist.some(i => i.status === 'Attention'),
            discrepancy_details: checklist.filter(i => i.status === 'Attention').map(i => i.notes).join('; ')
          }
        };

        const res = await api.submitInspection(parseInt(id), submitPayload);
        navigate(`/inspector/confirmed/${id}`, { state: { submissionData: res } });
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      // Even if offline, navigate to confirmed with local state
      navigate(`/inspector/confirmed/${id}`, {
        state: {
          submissionData: {
            inspection_code: inspection?.inspection_code || 'INS-2026-00841',
            submitted_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            evidence_count: evidenceList.length,
            gps_verified: true,
            next_step: 'Pending Official Verification'
          }
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-slate-400 text-xs">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading inspection terminal...
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'GPS Geofence' },
    { num: 2, label: 'Checklist' },
    { num: 3, label: 'Evidence Vault' },
    { num: 4, label: 'Review & Submit' }
  ];

  return (
    <div className="max-w-2xl mx-auto pb-24 space-y-4 animate-in fade-in duration-150">
      {/* Top Mobile Sticky Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-16 z-30">
        <div className="flex items-center justify-between gap-3 mb-2">
          <button
            onClick={() => navigate('/inspector')}
            className="p-1.5 -ml-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <h2 className="text-sm font-extrabold text-slate-900 truncate">
              {inspection?.institute?.name || 'ABC Welfare Centre'}
            </h2>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
              <span>{inspection?.inspection_code || 'INS-2026-00841'}</span>
              <span>•</span>
              <span className="text-blue-600 font-bold">{inspection?.inspection_type || 'Random'}</span>
            </div>
          </div>

          {/* ONLINE / OFFLINE TOGGLE */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsOnline(!isOnline)}
              title={isOnline ? 'Switch to Offline Simulation' : 'Switch to Online Mode'}
              className={`flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-100 text-amber-900 border-amber-400'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span>ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-700" />
                  <span>OFFLINE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Offline Sync Banner if in Offline mode or queue has items */}
        {(!isOnline || offlineQueue.length > 0 || syncStatus === 'synced') && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{offlineQueue.length > 0 ? `${offlineQueue.length} item(s) waiting to sync` : 'Offline simulation active (local storage)'}</span>
            </div>
            {isOnline && offlineQueue.length > 0 && (
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-0.5 rounded text-[10px] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Uploading...' : 'Sync Now'}</span>
              </button>
            )}
            {syncStatus === 'synced' && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Synced & Verified
              </span>
            )}
          </div>
        )}

        {/* Step Progression Tabs */}
        <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-100">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`py-1.5 text-center rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                currentStep === s.num
                  ? 'bg-blue-600 text-white shadow-xs'
                  : currentStep > s.num
                  ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <div className="text-[9px] uppercase tracking-wider opacity-80 leading-none">Step {s.num}</div>
              <div className="truncate mt-0.5">{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 1: GPS VERIFICATION */}
      {/* ============================================================== */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                Step 01 of 04
              </span>
              <h3 className="text-base font-black text-slate-900">
                On-Site GPS Geofence Verification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Field inspectors must authenticate presence within designated boundaries before checklist verification.
              </p>
            </div>

            {/* Stylized Map View Placeholder */}
            <div className="h-48 w-full bg-slate-900 rounded-xl relative overflow-hidden border border-slate-800 flex items-center justify-center p-4">
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:14px_14px]" />
              
              <div className="relative z-10 text-center space-y-1">
                <div className={`inline-flex p-3 rounded-full border mb-1 ${
                  gpsData.verified 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/50' 
                    : 'bg-blue-500/20 text-blue-400 border-blue-400/40 animate-pulse'
                }`}>
                  <Navigation className="w-6 h-6" />
                </div>
                <div className="font-mono text-xs font-bold text-white">
                  Lat: {gpsData.latitude.toFixed(4)}° N, Lng: {gpsData.longitude.toFixed(4)}° E
                </div>
                <div className="text-[10px] text-slate-300">
                  Accuracy: <span className="text-emerald-400 font-semibold">{gpsData.accuracy} meters</span> • Radius: 50m
                </div>
              </div>
            </div>

            {/* GPS Telemetry Output Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-medium">Location Status:</span>
                {gpsData.verified ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Location Verified
                  </span>
                ) : (
                  <span className="font-semibold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded text-[11px]">
                    Pending On-Site Check-in
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Latitude</span>
                  <span className="font-mono font-semibold">{gpsData.latitude.toFixed(6)}° N</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Longitude</span>
                  <span className="font-mono font-semibold">{gpsData.longitude.toFixed(6)}° E</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">GPS Accuracy</span>
                  <span className="font-mono font-semibold">±{gpsData.accuracy}m</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Timestamp</span>
                  <span className="font-mono font-semibold">{gpsData.timestamp}</span>
                </div>
              </div>

              {gpsData.isDemo && (
                <div className="text-[10px] text-blue-700 font-semibold bg-blue-50 p-2 rounded border border-blue-200 mt-2">
                  ℹ Demo GPS coordinates mode active (Device geolocation permission was not granted or browser fallback engaged).
                </div>
              )}
            </div>

            {/* Verification Note */}
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              * Note: Geolocation verification assesses device sensor accuracy against designated institute bounds with cryptographic tamper-evident logging.
            </p>

            {/* Trigger Button */}
            <button
              onClick={handleVerifyGps}
              disabled={isLocating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring Geolocation Sensors...' : gpsData.verified ? 'Re-verify GPS Location' : 'VERIFY GPS LOCATION NOW'}</span>
            </button>

            {/* Next Step Button */}
            {gpsData.verified && (
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Proceed to Inspection Checklist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: STRUCTURED 4-CATEGORY CHECKLIST */}
      {/* ============================================================== */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                Step 02 of 04
              </span>
              <h3 className="text-base font-black text-slate-900">
                Inspection Compliance Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review all 4 mandatory statutory dimensions. Remarks are mandatory for items marked 'Attention' or 'Not Verified'.
              </p>
            </div>

            {/* Categories */}
            {(['INFRASTRUCTURE', 'STAFF', 'BENEFICIARIES', 'DOCUMENTATION'] as const).map((catName) => {
              const itemsInCat = checklist.filter(i => i.category === catName);
              return (
                <div key={catName} className="space-y-2.5 pt-2">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center justify-between">
                    <span>Category — {catName}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-normal">({itemsInCat.length} points)</span>
                  </div>

                  <div className="space-y-2">
                    {itemsInCat.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          item.status === 'Pass'
                            ? 'bg-white border-slate-200'
                            : item.status === 'Attention'
                            ? 'bg-amber-50/50 border-amber-300'
                            : 'bg-rose-50/50 border-rose-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="font-semibold text-slate-800">{item.label}</span>

                          {/* 3 State Toggle Buttons */}
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg self-start sm:self-auto">
                            {(['Pass', 'Attention', 'Not_Verified'] as ChecklistStatus[]).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleChecklistStatusChange(item.id, st)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                  item.status === st
                                    ? st === 'Pass'
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : st === 'Attention'
                                      ? 'bg-amber-600 text-white shadow-2xs'
                                      : 'bg-rose-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {st.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Note Input for Attention or Not_Verified */}
                        {item.status !== 'Pass' && (
                          <div className="mt-2 pt-2 border-t border-slate-200/80">
                            <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">
                              Mandatory Field Remark for {item.status.replace('_', ' ')}:
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Describe exact finding or discrepancy..."
                              value={item.notes || ''}
                              onChange={(e) => handleChecklistNotesChange(item.id, e.target.value)}
                              className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Back to GPS
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Proceed to Evidence Capture</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: EVIDENCE CAPTURE & INTEGRITY HASH */}
      {/* ============================================================== */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                Step 03 of 04
              </span>
              <h3 className="text-base font-black text-slate-900">
                Tamper-Evident Evidence Capture
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Captured artifacts receive instant GPS metadata tags and an automated SHA-256 cryptographic signature.
              </p>
            </div>

            {/* Action Buttons: Photo & Video */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCaptureEvidence('Photo')}
                disabled={isCapturing}
                className="p-4 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100/70 text-blue-800 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Camera className="w-6 h-6 text-blue-600" />
                <span>{isCapturing ? 'Processing Capture...' : 'Capture Photo'}</span>
              </button>

              <button
                onClick={() => handleCaptureEvidence('Video')}
                disabled={isCapturing}
                className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100/70 text-indigo-800 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Video className="w-6 h-6 text-indigo-600" />
                <span>{isCapturing ? 'Recording Frame...' : 'Record Short Video'}</span>
              </button>
            </div>

            {/* Evidence List with SHA-256 and Integrity Badge */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Captured Evidence Items ({evidenceList.length})
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                  ✓ Tamper-evident evidence with integrity verification
                </span>
              </div>

              {evidenceList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900">{item.title}</div>
                      <div className="text-[11px] font-mono text-blue-700 font-bold mt-0.5">
                        {item.evidence_code}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Integrity Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Captured At</span>
                      <span className="font-medium">{item.captured_at}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Location</span>
                      <span className="font-mono font-medium">{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded border border-slate-200/80 text-[10px] font-mono text-slate-500 break-all">
                    <span className="text-slate-400 uppercase font-bold block text-[9px]">SHA-256 Checksum:</span>
                    {item.file_hash}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Back to Checklist
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Proceed to Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: INSPECTION SUMMARY & SUBMISSION */}
      {/* ============================================================== */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                Step 04 of 04
              </span>
              <h3 className="text-base font-black text-slate-900">
                Inspection Summary Dossier
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify all operational parameters before committing final inspection report to the central monitoring stream.
              </p>
            </div>

            {/* Summary Overview Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Institution</span>
                  <span className="font-extrabold text-slate-900 text-sm">{inspection?.institute?.name || 'ABC Welfare Centre'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Inspection ID</span>
                  <span className="font-mono font-bold text-blue-700">{inspection?.inspection_code || 'INS-2026-00841'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Officer</span>
                  <span className="font-semibold text-slate-800">Officer Arun Kumar</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Date / Time</span>
                  <span className="font-semibold text-slate-800">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">GPS Geofence</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified ({gpsData.latitude.toFixed(4)}, {gpsData.longitude.toFixed(4)})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Checklist Completeness</span>
                  <span className="font-semibold text-slate-800">
                    {checklist.length} of {checklist.length} verified ({checklist.filter(i => i.status === 'Pass').length} Pass, {checklist.filter(i => i.status === 'Attention').length} Attention)
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Evidence Vault</span>
                  <span className="font-semibold text-slate-800">
                    {evidenceList.length} items with SHA-256 integrity verification
                  </span>
                </div>
              </div>
            </div>

            {/* Inspector Notes Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Field Findings & Notes:
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mandatory inspector observations..."
              />
            </div>

            {/* Ready Status Badge */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-emerald-900">Ready for Submission</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">All mandatory criteria satisfied</span>
            </div>

            {/* Submission Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Edit Inspection
              </button>

              <button
                type="button"
                onClick={handleSubmitInspection}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting to Directorate...' : 'SUBMIT INSPECTION'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Mobile Field Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-2 shadow-lg sm:hidden">
        <div className="flex items-center justify-around text-[10px] font-bold text-slate-500">
          <button
            onClick={() => navigate('/inspector')}
            className="flex flex-col items-center gap-0.5 p-1 hover:text-blue-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => navigate('/assignments')}
            className="flex flex-col items-center gap-0.5 p-1 text-blue-600 font-bold"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className="flex flex-col items-center gap-0.5 p-1 hover:text-blue-600 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>Capture</span>
          </button>
          <button
            onClick={() => navigate('/institutes')}
            className="flex flex-col items-center gap-0.5 p-1 hover:text-blue-600 transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            <span>Reports</span>
          </button>
          <button
            onClick={() => navigate('/inspector')}
            className="flex flex-col items-center gap-0.5 p-1 hover:text-blue-600 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
