import React, { useState } from 'react';
import {
  Layers,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Search,
  Check,
} from 'lucide-react';
import { InfrastructureAsset } from '../../types';
import { StorageService } from '../../services/storage';

interface InfrastructureViewProps {
  assets: InfrastructureAsset[];
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({ assets }) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [maintenanceSuccessId, setMaintenanceSuccessId] = useState<string | null>(null);

  const filteredAssets = assets.filter((a) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!a.id.toLowerCase().includes(q) && !a.name.toLowerCase().includes(q) && !a.zoneName.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedType !== 'ALL' && a.type !== selectedType) return false;
    if (selectedRisk !== 'ALL' && a.riskLevel !== selectedRisk) return false;
    return true;
  });

  const handleScheduleMaintenance = (assetId: string) => {
    StorageService.scheduleAssetMaintenance(assetId);
    setMaintenanceSuccessId(assetId);
    setTimeout(() => setMaintenanceSuccessId(null), 3000);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'MAINTENANCE_REQUIRED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'DEGRADED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Predictive Maintenance Intro Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-extrabold text-white">
                Municipal Water Assets & Predictive Maintenance
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Monitoring 20 critical urban assets including high-pressure feeders, water treatment plants, master reservoirs, and drainage trunks. Transparent risk scoring predicts catastrophic joint ruptures before street flooding occurs.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
              <div className="text-[10px] text-slate-400">Total Assets</div>
              <div className="text-lg font-extrabold text-white">{assets.length}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
              <div className="text-[10px] text-slate-400">High / Critical Risk</div>
              <div className="text-lg font-extrabold text-rose-400">
                {assets.filter((a) => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
              <div className="text-[10px] text-slate-400">Operational</div>
              <div className="text-lg font-extrabold text-emerald-400">
                {assets.filter((a) => a.status === 'OPERATIONAL').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 text-xs">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search asset ID (e.g. PIPE-102), name, zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Asset Types</option>
            <option value="PIPELINE">Pipeline</option>
            <option value="WATER_TANK">Water Tank / Reservoir</option>
            <option value="PUMP">Pump Station</option>
            <option value="DRAIN">Stormwater Drain</option>
            <option value="TREATMENT_PLANT">Treatment Plant</option>
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">🔴 Critical Risk (&gt;80)</option>
            <option value="HIGH">🟠 High Risk (60-79)</option>
            <option value="MEDIUM">🟡 Medium Risk (40-59)</option>
            <option value="LOW">🟢 Low Risk (&lt;40)</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredAssets.map((asset) => {
          const isHighRisk = asset.riskLevel === 'HIGH' || asset.riskLevel === 'CRITICAL';
          const isSuccess = maintenanceSuccessId === asset.id;

          return (
            <div
              key={asset.id}
              className={`rounded-2xl border p-5 transition space-y-4 ${
                isHighRisk
                  ? 'border-rose-900/60 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-900 shadow-md'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {asset.id}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {asset.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-white leading-snug">
                    {asset.name}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    📍 {asset.zoneName}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs font-bold ${getRiskBadge(
                      asset.riskLevel
                    )}`}
                  >
                    Risk: {asset.riskScore}/100 ({asset.riskLevel})
                  </span>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(
                      asset.status
                    )}`}
                  >
                    {asset.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Specs & Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2">
                  <div className="text-[10px] text-slate-400">Service Age</div>
                  <div className="mt-0.5 font-bold text-white">
                    {asset.ageYears} years
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2">
                  <div className="text-[10px] text-slate-400">Past Incidents</div>
                  <div className="mt-0.5 font-bold text-amber-300">
                    {asset.previousIncidentsCount} failures
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2">
                  <div className="text-[10px] text-slate-400">Last Overhaul</div>
                  <div className="mt-0.5 font-bold text-slate-300">
                    {asset.lastMaintenanceDate}
                  </div>
                </div>
              </div>

              {/* Specification note */}
              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Specification: </span>
                {asset.specification}
              </div>

              {/* Predictive Action Recommendation Box */}
              {asset.recommendedPreventiveAction && (
                <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Predictive Maintenance Recommendation:</span>
                  </div>
                  <p className="text-amber-200/90 text-[11px] leading-relaxed">
                    {asset.recommendedPreventiveAction}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-1 flex items-center justify-between border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500">
                  Installed: {asset.installationDate}
                </span>

                {isSuccess ? (
                  <div className="flex items-center gap-1 rounded-lg bg-emerald-950 px-3 py-1.5 text-xs font-bold text-emerald-300 border border-emerald-800">
                    <Check className="h-3.5 w-3.5" />
                    <span>Inspection Scheduled & Risk Mitigated</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleScheduleMaintenance(asset.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Schedule Preventive Inspection</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
