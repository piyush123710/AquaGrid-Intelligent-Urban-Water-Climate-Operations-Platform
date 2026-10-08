import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, HardHat, CheckCircle2, Droplets } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('admin@aquagrid.demo');
  const [password, setPassword] = useState('AquaGrid#2026');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [message, setMessage] = useState<string | null>(null);

  const handleQuickLogin = (role: UserRole) => {
    StorageService.switchUserByRole(role);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'FORGOT') {
      setMessage(`Password reset instructions sent to ${email}`);
      setTimeout(() => {
        setMode('LOGIN');
        setMessage(null);
      }, 2500);
      return;
    }

    if (mode === 'REGISTER') {
      const newUser = {
        id: `usr-${Date.now()}`,
        name: name || 'New Operator',
        email,
        role: selectedRole,
        organizationId: 'org-city-corp',
        designation: selectedRole === 'ADMIN' ? 'Municipal Supervisor' : selectedRole === 'FIELD_WORKER' ? 'Field Technician' : 'Citizen Resident',
      };
      StorageService.setCurrentUser(newUser);
      onClose();
      return;
    }

    // Login mode
    if (email.includes('worker')) {
      handleQuickLogin('FIELD_WORKER');
    } else if (email.includes('citizen')) {
      handleQuickLogin('CITIZEN');
    } else {
      handleQuickLogin('ADMIN');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">AquaGrid Access Portal</h3>
              <p className="text-[10px] text-slate-400">Enterprise Role-Based Access Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {message && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300">
              {message}
            </div>
          )}

          {/* 1-Click Quick Demo Switcher */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              1-Click Demo Credentials:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="rounded-lg bg-slate-900 p-2 text-left border border-slate-800 hover:border-cyan-500 transition group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-white group-hover:text-cyan-300">
                  <Shield className="h-3 w-3 text-cyan-400" />
                  <span>Admin</span>
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">admin@aquagrid.demo</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('FIELD_WORKER')}
                className="rounded-lg bg-slate-900 p-2 text-left border border-slate-800 hover:border-amber-500 transition group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-white group-hover:text-amber-300">
                  <HardHat className="h-3 w-3 text-amber-400" />
                  <span>Worker</span>
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">worker@aquagrid.demo</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('CITIZEN')}
                className="rounded-lg bg-slate-900 p-2 text-left border border-slate-800 hover:border-teal-500 transition group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-white group-hover:text-teal-300">
                  <User className="h-3 w-3 text-teal-400" />
                  <span>Citizen</span>
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">citizen@aquagrid.demo</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Officer name"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {mode !== 'FORGOT' && (
              <div>
                <label className="block text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            {mode === 'REGISTER' && (
              <div>
                <label className="block text-slate-400 mb-1">Assign Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="ADMIN">Admin (Chief Commissioner)</option>
                  <option value="FIELD_WORKER">Field Worker (Team 7 Engineer)</option>
                  <option value="CITIZEN">Citizen (Resident Reporter)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-600 py-2.5 font-bold text-white hover:bg-cyan-500 transition shadow-lg shadow-cyan-950"
            >
              {mode === 'LOGIN' ? 'Sign In to AquaGrid' : mode === 'REGISTER' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          {/* Toggle modes */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            {mode === 'LOGIN' ? (
              <>
                <button onClick={() => setMode('FORGOT')} className="hover:text-cyan-400">
                  Forgot password?
                </button>
                <button onClick={() => setMode('REGISTER')} className="hover:text-cyan-400">
                  Need an account? Register
                </button>
              </>
            ) : (
              <button onClick={() => setMode('LOGIN')} className="hover:text-cyan-400 mx-auto">
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
