import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, UserCheck, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('official@inframind.demo');
  const [password, setPassword] = useState('demo123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('DEPARTMENT_OFFICIAL');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password, selectedRole);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check demo credentials.');
    }
  };

  const handleQuickFill = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setSelectedRole(demoRole);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Header Badge */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          MINISTRY OF SOCIAL JUSTICE & EMPOWERMENT, GOI
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Infra<span className="text-blue-500">Mind</span>
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-400 font-medium max-w-sm mx-auto">
          Smart Real-Time Monitoring & Inspection Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Portal Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'DEPARTMENT_OFFICIAL', label: 'Official' },
                  { role: 'INSPECTION_OFFICER', label: 'Inspector' },
                  { role: 'INSTITUTE_NGO', label: 'Institute/NGO' },
                  { role: 'SUPER_ADMIN', label: 'Admin' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.role}
                    onClick={() => setSelectedRole(item.role as UserRole)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      selectedRole === item.role
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedRole === item.role && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Email ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="name@inframind.demo"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Demo Accounts (Click to Fill)
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill('official@inframind.demo', 'DEPARTMENT_OFFICIAL')}
                className="w-full text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-blue-400">Department Official</div>
                  <div className="text-[11px] text-slate-400 font-mono">official@inframind.demo</div>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">demo123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('inspector@inframind.demo', 'INSPECTION_OFFICER')}
                className="w-full text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-emerald-400">Inspection Officer</div>
                  <div className="text-[11px] text-slate-400 font-mono">inspector@inframind.demo</div>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">demo123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('institute@inframind.demo', 'INSTITUTE_NGO')}
                className="w-full text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-purple-400">Institute / NGO</div>
                  <div className="text-[11px] text-slate-400 font-mono">institute@inframind.demo</div>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">demo123</span>
              </button>
            </div>
          </div>
        </div>

        {/* Official Footer */}
        <p className="mt-4 text-center text-xs text-slate-400 max-w-sm mx-auto">
          Ministry of Social Justice & Empowerment (DoSJE) • Smart Real-Time Monitoring & Inspection Platform
        </p>
      </div>
    </div>
  );
};
