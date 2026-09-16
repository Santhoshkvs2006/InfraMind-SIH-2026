import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Dice5, 
  ClipboardList, 
  ShieldCheck, 
  Smartphone,
  Bot,
  UserCheck,
  Camera,
  Video,
  FileText
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Official Dashboard',
      icon: LayoutDashboard,
      badge: 'Overview'
    },
    {
      to: '/institutes',
      label: 'Institute Registry',
      icon: Building2,
      badge: '248'
    },
    {
      to: '/random-inspection',
      label: 'Random Inspection',
      icon: Dice5,
      badge: 'Core'
    },
    {
      to: '/assignments',
      label: 'Inspection Assignments',
      icon: ClipboardList,
      badge: '31'
    },
    {
      to: '/inspector',
      label: 'Inspector Field Terminal',
      icon: Smartphone,
      badge: 'Field'
    },
    {
      to: '/ai-demo',
      label: 'AI Anomaly & Risk',
      icon: Bot,
      badge: 'AI'
    },
    {
      to: '/human-verification',
      label: 'Human Verification',
      icon: UserCheck,
      badge: 'Review'
    },
    {
      to: '/cctv',
      label: 'CCTV Feeds',
      icon: Camera,
      badge: '4 Feeds'
    },
    {
      to: '/vc',
      label: '5-Min Random VC',
      icon: Video,
      badge: 'Live'
    },
    {
      to: '/reports/1',
      label: 'Inspection Report',
      icon: FileText,
      badge: 'Dossier'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col min-h-[calc(100vh-4rem)] border-r border-slate-800">
      {/* Navigation Label */}
      <div className="px-5 pt-6 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Command Center
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-4 m-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>DoSJE Monitoring</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Central randomized vigilance engine. All inspection assignments are tamper-evident and audit-logged.
        </p>
      </div>
    </aside>
  );
};
