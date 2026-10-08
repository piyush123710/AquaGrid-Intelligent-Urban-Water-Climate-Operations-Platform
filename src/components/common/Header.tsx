import React, { useState } from 'react';
import {
  Droplets,
  Flame,
  Shield,
  HardHat,
  User,
  Bell,
  RefreshCw,
  Building2,
  ChevronDown,
  LogOut,
  Sparkles,
  ThermometerSun,
} from 'lucide-react';
import { UserRole, Organization } from '../../types';
import { StorageService, AppState } from '../../services/storage';

interface HeaderProps {
  state: AppState;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onOpenNotifications,
  onOpenAuth,
  unreadCount,
}) => {
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const activeOrg =
    state.organizations.find((o) => o.id === state.activeOrgId) ||
    state.organizations[0];

  const handleRoleSwitch = (role: UserRole) => {
    StorageService.switchUserByRole(role);
    setUserDropdownOpen(false);
  };

  const handleResetData = () => {
    setResetting(true);
    setTimeout(() => {
      StorageService.resetToDemo();
      setResetting(false);
    }, 400);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-teal-400 shadow-lg shadow-cyan-950/50">
            <Droplets className="h-6 w-6 text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">
                Aqua<span className="text-cyan-400">Grid</span>
              </span>
              <span className="rounded-md border border-cyan-800/60 bg-cyan-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                ENTERPRISE
              </span>
              <span className="hidden sm:inline-flex rounded-md border border-amber-800/60 bg-amber-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                Track: Heat & Water
              </span>
            </div>
            <p className="hidden text-xs font-medium text-slate-400 md:block">
              Intelligent Urban Water & Climate Operations
            </p>
          </div>
        </div>

        {/* Center / Organization Multi-Tenant Switcher */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-800/80"
            >
              <Building2 className="h-3.5 w-3.5 text-cyan-400" />
              <span className="max-w-[200px] truncate">{activeOrg?.name}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {orgDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl z-50">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Organization (Tenant Isolation)
                </div>
                {state.organizations.map((org: Organization) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      StorageService.setActiveOrg(org.id);
                      setOrgDropdownOpen(false);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition ${
                      org.id === state.activeOrgId
                        ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-800/50'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    <div>
                      <div className="font-semibold">{org.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {org.type} • {org.city}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Weather & Heat Risk Pill */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs">
            <ThermometerSun className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span className="font-bold text-amber-300">
              {state.weather.temperatureC}°C
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">
              Heat Index {state.weather.heatIndexC}°C
            </span>
            <span className="rounded bg-rose-500/20 px-1 py-0.2 text-[10px] font-bold text-rose-400">
              {state.weather.condition}
            </span>
          </div>
        </div>

        {/* Right side: Role Switcher & User Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Toggles */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/90 p-1">
            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                state.currentUser.role === 'ADMIN'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Admin Command Center"
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
            <button
              onClick={() => handleRoleSwitch('FIELD_WORKER')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                state.currentUser.role === 'FIELD_WORKER'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Field Worker Mobile UI"
            >
              <HardHat className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Worker</span>
            </button>
            <button
              onClick={() => handleRoleSwitch('CITIZEN')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                state.currentUser.role === 'CITIZEN'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Citizen Reporting Portal"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Citizen</span>
            </button>
          </div>

          {/* Reset Demo Data button */}
          <button
            onClick={handleResetData}
            disabled={resetting}
            title="Reset to Pristine Demo Seed State"
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-400 transition hover:border-slate-700 hover:text-slate-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${resetting ? 'animate-spin text-cyan-400' : ''}`}
            />
          </button>

          {/* Notifications button */}
          <button
            onClick={onOpenNotifications}
            className="relative rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-300 transition hover:border-slate-700 hover:text-white"
            title="Notification Center"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User profile avatar / menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 p-1 pr-2 transition hover:border-slate-700"
            >
              <img
                src={
                  state.currentUser.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                }
                alt={state.currentUser.name}
                className="h-7 w-7 rounded-md object-cover"
              />
              <div className="hidden text-left xl:block">
                <div className="text-xs font-bold leading-none text-slate-200">
                  {state.currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {state.currentUser.role}
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
                <div className="border-b border-slate-800 pb-2 mb-2 px-1">
                  <div className="text-xs font-bold text-slate-200">
                    {state.currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {state.currentUser.email}
                  </div>
                  <div className="mt-1 inline-block rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-800/40">
                    {state.currentUser.designation || state.currentUser.role}
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => handleRoleSwitch('ADMIN')}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    <Shield className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Role: Chief Admin (Commissioner)</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('FIELD_WORKER')}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    <HardHat className="h-3.5 w-3.5 text-amber-400" />
                    <span>Role: Lead Field Worker (Team 7)</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('CITIZEN')}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    <User className="h-3.5 w-3.5 text-teal-400" />
                    <span>Role: Resident Citizen (Reporter)</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenAuth();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 border-t border-slate-800/60 mt-1"
                  >
                    <LogOut className="h-3.5 w-3.5 text-slate-400" />
                    <span>Switch / Login Credentials</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
