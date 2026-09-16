import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, RefreshCw, UserCheck, LogOut, CheckCircle2, ChevronDown, Bell, Check, X } from 'lucide-react';
import { api } from '../services/api';
import { UserRole, AppNotification } from '../types';

interface NavbarProps {
  onRefreshData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefreshData }) => {
  const { user, role, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const countRes = await api.getUnreadNotificationCount(role);
      setUnreadCount(countRes.unread_count);
      const list = await api.getNotifications(role);
      setNotifications(list);
    } catch (err) {
      console.warn('Could not load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [role]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await api.resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
      loadNotifications();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to reset demo data:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead(role);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.warn('Failed to mark all read:', e);
    }
  };

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'DEPARTMENT_OFFICIAL', label: 'Department Official', desc: 'Central Command & Review' },
    { role: 'INSPECTION_OFFICER', label: 'Inspection Officer', desc: 'Field Mobile Inspector' },
    { role: 'INSTITUTE_NGO', label: 'Institute / NGO', desc: 'ABC Welfare Centre Admin' },
    { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'System Configuration' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top National Header Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
          <span className="font-medium tracking-wide">MINISTRY OF SOCIAL JUSTICE & EMPOWERMENT • GOVERNMENT OF INDIA</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>SIH 2026 Problem ID: 26095</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            MONITORING ACTIVE
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Platform Name */}
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(role === 'INSPECTION_OFFICER' ? '/inspector' : '/dashboard')}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">Infra<span className="text-blue-600">Mind</span></span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">DoSJE Core</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Smart Real-Time Monitoring & Inspection Platform</p>
          </div>
        </div>

        {/* Actions & Controls */}
        <div className="flex items-center gap-3">
          {/* Demo Mode Badge with Reset Button */}
          <div className="flex items-center bg-amber-50 border border-amber-200 rounded-lg p-1 px-2.5 gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              DEMO MODE
            </div>
            <button
              onClick={handleReset}
              disabled={isResetting}
              title="Reset sample database to fresh seed state"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 hover:text-amber-900 bg-white hover:bg-amber-100/50 border border-amber-300 px-2 py-0.5 rounded shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin text-amber-600' : ''}`} />
              {isResetting ? 'Resetting...' : 'Reset Demo Data'}
            </button>
            {resetSuccess && (
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Done
              </span>
            )}
          </div>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                loadNotifications();
              }}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors ${n.read ? 'bg-white' : 'bg-blue-50/50'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <div className="text-left">
                <span className="block text-[10px] text-slate-500 leading-none">Viewing as</span>
                <span className="leading-tight text-slate-900">
                  {role === 'DEPARTMENT_OFFICIAL' ? 'Department Official' :
                   role === 'INSPECTION_OFFICER' ? 'Inspection Officer' :
                   role === 'INSTITUTE_NGO' ? 'ABC Welfare Centre' : 'Super Admin'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role (Demo)
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleMenu(false);
                      if (r.role === 'INSPECTION_OFFICER') {
                        navigate('/inspector');
                      } else if (r.role === 'DEPARTMENT_OFFICIAL') {
                        navigate('/dashboard');
                      }
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col transition-colors cursor-pointer ${
                      role === r.role ? 'bg-blue-50 text-blue-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-semibold text-slate-900">{r.label}</span>
                    <span className="text-[11px] text-slate-500">{r.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User / Logout */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name || 'Dr. Rajeshwari Sharma'}</p>
              <p className="text-[10px] text-slate-500">{user?.department || 'DoSJE Official'}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
