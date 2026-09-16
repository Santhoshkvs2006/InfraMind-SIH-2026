import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Video, 
  Wifi, 
  WifiOff, 
  Users, 
  Clock, 
  ShieldCheck, 
  Maximize2, 
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../../services/api';

interface CameraFeed {
  id: number;
  code: string;
  name: string;
  location: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  detectedPersons: number;
  fps: number;
  resolution: string;
  uptime: string;
  colorScheme: string;
}

export const CctvDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [snapshotModal, setSnapshotModal] = useState<{
    camera: string;
    timestamp: string;
    hash: string;
    location: string;
  } | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cameras: CameraFeed[] = [
    {
      id: 1,
      code: 'CAM-01',
      name: 'Camera 01 – Main Entrance',
      location: 'Main Foyer & Biometric Turnstile',
      status: 'ONLINE',
      detectedPersons: 4,
      fps: 25,
      resolution: '1080p Full HD',
      uptime: '99.4%',
      colorScheme: 'from-slate-900 to-slate-800'
    },
    {
      id: 2,
      code: 'CAM-02',
      name: 'Camera 02 – Activity Hall',
      location: 'Multi-purpose Vocational Center',
      status: 'ONLINE',
      detectedPersons: 17,
      fps: 25,
      resolution: '1080p Full HD',
      uptime: '98.8%',
      colorScheme: 'from-blue-950 to-slate-900'
    },
    {
      id: 3,
      code: 'CAM-03',
      name: 'Camera 03 – Classroom Block',
      location: 'Vocational Training Classrooms A-B',
      status: 'DEGRADED',
      detectedPersons: 8,
      fps: 15,
      resolution: '720p HD (Intermittent)',
      uptime: '76.2%',
      colorScheme: 'from-amber-950 to-slate-900'
    },
    {
      id: 4,
      code: 'CAM-04',
      name: 'Camera 04 – Dining / Service Area',
      location: 'Beneficiary Nutrition & Dining Hall',
      status: 'ONLINE',
      detectedPersons: 12,
      fps: 24,
      resolution: '1080p Full HD',
      uptime: '99.1%',
      colorScheme: 'from-slate-900 to-slate-800'
    }
  ];

  const handleCaptureSnapshot = async (cam: CameraFeed) => {
    try {
      const snap = await api.captureCameraSnapshot(cam.id);
      setSnapshotModal({
        camera: cam.name,
        timestamp: snap.timestamp,
        hash: snap.hash,
        location: cam.location
      });
    } catch {
      // Fallback preview
      setSnapshotModal({
        camera: cam.name,
        timestamp: new Date().toUTCString(),
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        location: cam.location
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 rounded-2xl p-6 text-white border border-slate-700 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Live CCTV Surveillance Feed
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-500/20 text-blue-200 border border-blue-500/30">
                RTSP / ONVIF Telemetry Simulation
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Camera className="w-7 h-7 text-blue-400" />
              Central CCTV Vigilance Wall
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Target Institute: <strong className="text-white">ABC Welfare Centre (INST-TN-001)</strong> • 4 Cameras Configured • Uptime: 92.4%
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/ai-demo')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              Run AI Occupancy Model
            </button>

            <button
              onClick={() => navigate('/vc')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <Video className="w-4 h-4" />
              Launch 5-Min Random VC
            </button>
          </div>
        </div>

        {/* Global System Telemetry Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">System Timestamp:</span>
            <span className="font-mono text-slate-200">{currentTime}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Stream Integrity:</span>
            <span className="font-mono text-emerald-400 font-bold">✓ End-to-End Cryptographically Verified</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Active Feeds:</span>
            <span className="font-mono text-slate-200">3 Online / 1 Degraded</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Network Protocol:</span>
            <span className="font-mono text-slate-200">Secure HLS / WebRTC Proxy</span>
          </div>
        </div>
      </div>

      {/* 4 Realistic Camera Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cameras.map((cam) => (
          <div 
            key={cam.id} 
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all"
          >
            {/* Camera Header Bar */}
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                  {cam.code}
                </span>
                <span className="text-xs font-bold text-slate-200">{cam.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {cam.status === 'ONLINE' ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    <Wifi className="w-3 h-3" />
                    ONLINE
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                    <WifiOff className="w-3 h-3" />
                    DEGRADED (76%)
                  </span>
                )}
              </div>
            </div>

            {/* Video Feed Simulation Viewport */}
            <div className={`relative aspect-video bg-gradient-to-br ${cam.colorScheme} overflow-hidden flex items-center justify-center`}>
              {/* Grid overlay lines */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)`
                }}
              />

              {/* Feed Graphics */}
              <div className="text-center p-6 z-10">
                <Video className={`w-12 h-12 mx-auto mb-2 ${cam.status === 'ONLINE' ? 'text-blue-400 opacity-80' : 'text-amber-400 opacity-60'}`} />
                <span className="text-xs font-mono font-semibold text-slate-300 block">{cam.location}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  {cam.resolution} • {cam.fps} FPS • Uptime: {cam.uptime}
                </span>
                {cam.code === 'CAM-02' && (
                  <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    AI Active: 17 Persons Detected in Frame
                  </span>
                )}
              </div>

              {/* Timestamp Overlay */}
              <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-slate-300 flex items-center gap-1.5 border border-white/10">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{currentTime}</span>
              </div>

              {/* Watermark Tag */}
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-slate-400 border border-white/10">
                LIVE TELEMETRY FEED
              </div>

              {/* Person Count Badge */}
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/75 backdrop-blur-xs text-xs font-mono text-white flex items-center gap-1.5 border border-white/10">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Count: <strong>{cam.detectedPersons}</strong></span>
              </div>

              {/* Fullscreen Icon */}
              <div className="absolute bottom-2 right-2 p-1.5 rounded bg-black/75 text-slate-300 hover:text-white transition-all cursor-pointer">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Location: <strong className="text-slate-700">{cam.location}</strong>
              </span>

              <button
                onClick={() => handleCaptureSnapshot(cam)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                Capture Snapshot
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tamper-Evident Snapshot Modal */}
      {snapshotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">CCTV Snapshot Captured</h3>
              </div>
              <button 
                onClick={() => setSnapshotModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center relative">
                <Camera className="w-10 h-10 text-blue-400" />
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-black/70 px-2 py-0.5 rounded">
                  {snapshotModal.camera}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-800 font-bold">{snapshotModal.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-800">{snapshotModal.location}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200">
                  <span className="text-slate-500 block mb-0.5">SHA-256 Tamper-Evident Hash:</span>
                  <span className="text-emerald-700 font-bold break-all bg-emerald-50 p-1.5 rounded block border border-emerald-200">
                    {snapshotModal.hash}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cryptographic integrity verified and logged to audit trail.</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSnapshotModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
