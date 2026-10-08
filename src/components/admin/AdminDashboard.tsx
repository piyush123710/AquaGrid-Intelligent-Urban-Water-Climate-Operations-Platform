import React, { useState, useMemo } from 'react';
import {
  Activity,
  Layers,
  MapPin,
  Flame,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  BarChart3,
  Bot,
  ShieldCheck,
  Building2,
  Users,
  Wrench,
  ChevronRight,
  ArrowUpDown,
  CheckSquare,
  Square,
  Send,
  SlidersHorizontal,
  Gauge,
  Truck,
} from 'lucide-react';
import { Incident, FieldTeam, FieldWorker, ZoneRisk, WeatherRecord, Organization } from '../../types';
import { LiveWaterMap } from '../map/LiveWaterMap';
import { AnalyticsView } from './AnalyticsView';
import { ClimateRiskView } from './ClimateRiskView';
import { InfrastructureView } from './InfrastructureView';
import { FieldTeamsView } from './FieldTeamsView';
import { AuditLogsView } from './AuditLogsView';
import { AIOperationsAssistant } from './AIOperationsAssistant';
import { DigitalTwinView } from './DigitalTwinView';
import { TankerDispatchView } from './TankerDispatchView';
import { StorageService } from '../../services/storage';

interface AdminDashboardProps {
  incidents: Incident[];
  zonesRisk: ZoneRisk[];
  weather: WeatherRecord;
  teams: FieldTeam[];
  workers: FieldWorker[];
  activeOrg: Organization;
  onSelectIncident: (incident: Incident) => void;
}

export type AdminTab =
  | 'COMMAND_CENTER'
  | 'LIVE_MAP'
  | 'INCIDENTS'
  | 'INFRASTRUCTURE'
  | 'DIGITAL_TWIN'
  | 'TANKERS'
  | 'RISK_CLIMATE'
  | 'ANALYTICS'
  | 'TEAMS'
  | 'AI_ASSISTANT'
  | 'AUDIT_LOGS'
  | 'SETTINGS';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  incidents,
  zonesRisk,
  weather,
  teams,
  workers,
  activeOrg,
  onSelectIncident,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('COMMAND_CENTER');

  // Table filters & pagination
  const [tableSearch, setTableSearch] = useState('');
  const [tableCategory, setTableCategory] = useState('ALL');
  const [tableSeverity, setTableSeverity] = useState('ALL');
  const [tableStatus, setTableStatus] = useState('ALL');
  const [tableZone, setTableZone] = useState('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'loss'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filter & sort incidents for table
  const filteredTableIncidents = useMemo(() => {
    let list = incidents.filter((inc) => {
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matches =
          inc.id.toLowerCase().includes(q) ||
          inc.title.toLowerCase().includes(q) ||
          inc.locationAddress.toLowerCase().includes(q) ||
          inc.zoneName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (tableCategory !== 'ALL' && inc.category !== tableCategory) return false;
      if (tableSeverity !== 'ALL' && inc.severity !== tableSeverity) return false;
      if (tableStatus !== 'ALL' && inc.status !== tableStatus) return false;
      if (tableZone !== 'ALL' && inc.zoneId !== tableZone) return false;
      return true;
    });

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'priority') {
        valA = a.priorityScore;
        valB = b.priorityScore;
      } else if (sortBy === 'loss') {
        valA = a.estimatedWaterLossLitersPerDay;
        valB = b.estimatedWaterLossLitersPerDay;
      } else {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return list;
  }, [incidents, tableSearch, tableCategory, tableSeverity, tableStatus, tableZone, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredTableIncidents.length / pageSize) || 1;
  const paginatedIncidents = filteredTableIncidents.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedIncidents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedIncidents.map((i) => i.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const copy = new Set(selectedIds);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    setSelectedIds(copy);
  };

  // Top critical incident
  const topCritical = incidents.find((i) => i.id === 'AQ-1024') || incidents.find((i) => i.severity === 'CRITICAL');

  return (
    <div className="space-y-6">
      {/* KPI Cards Bar (Command Center Header) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>Urban Water Grid Health & KPI Telemetry</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-semibold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
            Simulated / Demo Telemetry
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {/* Total Incidents */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-md">
            <div className="text-[10px] font-semibold text-slate-400">Total Incidents</div>
            <div className="mt-1 text-lg font-extrabold text-white">1,284</div>
            <div className="text-[9px] text-slate-500">Historical logs</div>
          </div>

          {/* Active Incidents */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-md">
            <div className="text-[10px] font-semibold text-slate-400">Active Incidents</div>
            <div className="mt-1 text-lg font-extrabold text-cyan-300">
              {incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length}
            </div>
            <div className="text-[9px] text-cyan-400">Real-time open</div>
          </div>

          {/* Critical Incidents */}
          <div className="rounded-xl border border-rose-900/60 bg-gradient-to-br from-rose-950/40 to-slate-900 p-3 shadow-md">
            <div className="text-[10px] font-semibold text-rose-300">Critical Priority</div>
            <div className="mt-1 text-lg font-extrabold text-rose-400">
              {incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length}
            </div>
            <div className="text-[9px] text-rose-300/80">&gt;80 priority score</div>
          </div>

          {/* Resolved Incidents */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-md">
            <div className="text-[10px] font-semibold text-slate-400">Resolved</div>
            <div className="mt-1 text-lg font-extrabold text-emerald-300">
              {incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length}
            </div>
            <div className="text-[9px] text-emerald-400">Verified repairs</div>
          </div>

          {/* Estimated Water Loss */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-md">
            <div className="text-[10px] font-semibold text-slate-400">Estimated Loss</div>
            <div className="mt-1 text-lg font-extrabold text-rose-400">
              2.4M <span className="text-[10px] text-slate-400">L/d</span>
            </div>
            <div className="text-[9px] text-slate-500">Unmitigated leaks</div>
          </div>

          {/* Water Saved */}
          <div className="rounded-xl border border-emerald-900/60 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-3 shadow-md">
            <div className="text-[10px] font-semibold text-emerald-300">Water Saved</div>
            <div className="mt-1 text-lg font-extrabold text-emerald-400">
              1.8M <span className="text-[10px] text-emerald-300">L</span>
            </div>
            <div className="text-[9px] text-emerald-300/80">Arrested volume</div>
          </div>

          {/* Average Resolution Time */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-md">
            <div className="text-[10px] font-semibold text-slate-400">Avg Resolution</div>
            <div className="mt-1 text-lg font-extrabold text-amber-300">4.2h</div>
            <div className="text-[9px] text-amber-400/90">Target: &lt;6.0h</div>
          </div>
        </div>
      </div>

      {/* Main Admin Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('COMMAND_CENTER')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
            activeTab === 'COMMAND_CENTER'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Command Center</span>
        </button>

        <button
          onClick={() => setActiveTab('LIVE_MAP')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
            activeTab === 'LIVE_MAP'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>Live GIS Map</span>
        </button>

        <button
          onClick={() => setActiveTab('INCIDENTS')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
            activeTab === 'INCIDENTS'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Incidents Table ({filteredTableIncidents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INFRASTRUCTURE')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
            activeTab === 'INFRASTRUCTURE'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Assets & Maintenance</span>
        </button>

        <button
          onClick={() => setActiveTab('DIGITAL_TWIN')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
            activeTab === 'DIGITAL_TWIN'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Gauge className="h-3.5 w-3.5 text-cyan-300" />
          <span>SCADA Digital Twin</span>
        </button>

        <button
          onClick={() => setActiveTab('TANKERS')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
            activeTab === 'TANKERS'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Truck className="h-3.5 w-3.5 text-amber-300" />
          <span>Tanker Relief Fleet</span>
        </button>

        <button
          onClick={() => setActiveTab('RISK_CLIMATE')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
            activeTab === 'RISK_CLIMATE'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span>Climate & Water Risk</span>
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
            activeTab === 'ANALYTICS'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('TEAMS')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
            activeTab === 'TEAMS'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Field Teams ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AI_ASSISTANT')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
            activeTab === 'AI_ASSISTANT'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Bot className="h-3.5 w-3.5 text-cyan-300" />
          <span>AI Operations Advisor</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold transition ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* Tab 1: COMMAND CENTER (Executive View) */}
      {activeTab === 'COMMAND_CENTER' && (
        <div className="space-y-6">
          {/* Top Priority Incident Alert Card (Showcase AQ-1024) */}
          {topCritical && (
            <div className="rounded-2xl border border-rose-800/80 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 p-5 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-mono text-xs font-extrabold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {topCritical.id}
                    </span>
                    <span className="rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/50 px-2 py-0.5 text-xs font-bold">
                      {topCritical.severity} PRIORITY ({topCritical.priorityScore}/100)
                    </span>
                    <span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-0.5 text-xs font-bold">
                      {topCritical.status}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {topCritical.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1">
                    {topCritical.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                    <div className="text-[10px] text-slate-400">Est. Daily Loss</div>
                    <div className="font-bold text-cyan-300">
                      {topCritical.estimatedWaterLossLitersPerDay.toLocaleString()} L/d
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                    <div className="text-[10px] text-slate-400">Critical Proximity</div>
                    <div className="font-bold text-rose-300">
                      {topCritical.criticalFacilities?.[0] || 'City Hospital'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
                    <div className="text-[10px] text-slate-400">Assigned Squad</div>
                    <div className="font-bold text-amber-300">
                      {topCritical.assignedTeamName || 'Field Team 7'}
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectIncident(topCritical)}
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2.5 font-extrabold text-white hover:bg-cyan-500 shadow-lg shadow-cyan-950 transition"
                  >
                    <span>Triage & Manage Details</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mini GIS Map + Top Risk Zones side by side */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <span>Real-time Spatial GIS Overview</span>
                </span>
                <button
                  onClick={() => setActiveTab('LIVE_MAP')}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Expand Full Screen Map →
                </button>
              </div>
              <LiveWaterMap
                incidents={incidents}
                zonesRisk={zonesRisk}
                onSelectIncident={onSelectIncident}
                heightClass="h-[440px]"
              />
            </div>

            {/* Top Vulnerability Sectors */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span>Top Risk Municipal Zones</span>
                </h3>
                <span className="text-[10px] text-slate-400">Heat + Water Index</span>
              </div>

              <div className="space-y-3">
                {zonesRisk.slice(0, 4).map((z) => (
                  <div
                    key={z.zoneId}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{z.zoneName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          z.overallRiskLevel === 'EXTREME'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {z.overallRiskLevel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>
                        Heat Index: <b className="text-slate-200">{z.heatIndexC}°C</b>
                      </div>
                      <div>
                        Water Capacity: <b className="text-emerald-300">{z.waterAvailabilityPercent}%</b>
                      </div>
                      <div>
                        Active Leaks: <b className="text-rose-400">{z.activeIncidentCount}</b>
                      </div>
                      <div>
                        Vulnerability: <b className="text-amber-300">{z.overallRiskScore}/100</b>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 truncate">
                      {z.primaryVulnerability}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveTab('RISK_CLIMATE')}
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2 text-xs font-semibold text-cyan-300 text-center"
              >
                View Full Climate & Water Engine Matrix →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: FULL GIS MAP */}
      {activeTab === 'LIVE_MAP' && (
        <div className="space-y-4">
          <LiveWaterMap
            incidents={incidents}
            zonesRisk={zonesRisk}
            onSelectIncident={onSelectIncident}
            heightClass="h-[740px]"
          />
        </div>
      )}

      {/* Tab 3: ENTERPRISE INCIDENTS TABLE */}
      {activeTab === 'INCIDENTS' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-5 space-y-4">
          {/* Table Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search incident ID, address, title..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={tableCategory}
                onChange={(e) => setTableCategory(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="PIPELINE_LEAK">Pipeline Leak</option>
                <option value="WATER_SHORTAGE">Water Shortage</option>
                <option value="FLOODING">Flooding</option>
                <option value="DRAINAGE_PROBLEM">Drainage</option>
                <option value="WATER_CONTAMINATION">Contamination</option>
                <option value="TANK_OVERFLOW">Tank Overflow</option>
                <option value="INFRASTRUCTURE_DAMAGE">Damage</option>
              </select>

              <select
                value={tableSeverity}
                onChange={(e) => setTableSeverity(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">🔴 Critical</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={tableStatus}
                onChange={(e) => setTableStatus(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="priority">Sort: Priority Score</option>
                <option value="loss">Sort: Water Loss</option>
                <option value="time">Sort: Time Reported</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-300 hover:text-white"
                title="Toggle sort direction"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3 py-3 w-8">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                      {selectedIds.size === paginatedIncidents.length && paginatedIncidents.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-cyan-400" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3">Incident ID</th>
                  <th className="px-3 py-3">Title & Location</th>
                  <th className="px-3 py-3">Severity</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Water Loss</th>
                  <th className="px-3 py-3">Assigned Team</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {paginatedIncidents.map((inc) => {
                  const isChecked = selectedIds.has(inc.id);
                  const isCritical = inc.severity === 'CRITICAL';
                  const isResolved = inc.status === 'RESOLVED';

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <td
                        className="px-3 py-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectOne(inc.id);
                        }}
                      >
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-cyan-400" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-600" />
                        )}
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        {inc.id}
                      </td>
                      <td className="px-3 py-3 max-w-xs">
                        <div className="font-semibold text-white truncate">{inc.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          📍 {inc.locationAddress}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : inc.severity === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-bold text-slate-200">
                          {inc.priorityScore} <span className="text-[10px] text-slate-500">/100</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                            isResolved
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : inc.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {inc.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-bold text-rose-300">
                          {inc.estimatedWaterLossLitersPerDay.toLocaleString()} L/d
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {inc.flowRateLitersPerMin || 12.5} L/min
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-300">
                        {inc.assignedTeamName ? (
                          <div className="truncate max-w-[140px] font-medium text-cyan-200">
                            {inc.assignedTeamName}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectIncident(inc)}
                          className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-cyan-400 hover:bg-slate-700 hover:text-white transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <div>
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filteredTableIncidents.length)} of{' '}
              {filteredTableIncidents.length} incidents
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 disabled:opacity-40 hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-slate-200">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 disabled:opacity-40 hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: INFRASTRUCTURE */}
      {activeTab === 'INFRASTRUCTURE' && (
        <InfrastructureView assets={StorageService.getAssets()} />
      )}

      {/* Tab: SCADA DIGITAL TWIN */}
      {activeTab === 'DIGITAL_TWIN' && (
        <DigitalTwinView />
      )}

      {/* Tab: TANKER RELIEF FLEET */}
      {activeTab === 'TANKERS' && (
        <TankerDispatchView />
      )}

      {/* Tab 5: CLIMATE & WATER RISK */}
      {activeTab === 'RISK_CLIMATE' && (
        <ClimateRiskView zonesRisk={zonesRisk} weather={weather} />
      )}

      {/* Tab 6: ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <AnalyticsView incidents={incidents} workers={workers} />
      )}

      {/* Tab 7: FIELD TEAMS */}
      {activeTab === 'TEAMS' && (
        <FieldTeamsView teams={teams} workers={workers} />
      )}

      {/* Tab 8: AI OPERATIONS ASSISTANT */}
      {activeTab === 'AI_ASSISTANT' && (
        <AIOperationsAssistant
          incidents={incidents}
          zonesRisk={zonesRisk}
          onSelectIncident={(id) => {
            const match = incidents.find((i) => i.id === id);
            if (match) onSelectIncident(match);
          }}
        />
      )}

      {/* Tab 9: AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <AuditLogsView
          logs={StorageService.getState().auditLogs}
          onSelectIncident={(id) => {
            const match = incidents.find((i) => i.id === id);
            if (match) onSelectIncident(match);
          }}
        />
      )}

      {/* Tab 10: ORGANIZATION SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Multi-Tenant Organization Configuration
              </h2>
              <p className="text-xs text-slate-400">
                Active Tenant: <b>{activeOrg.name}</b> ({activeOrg.code})
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Tenant Details</span>
              <div className="space-y-1 text-slate-300">
                <div>Type: <b>{activeOrg.type}</b></div>
                <div>Metropolitan Center: <b>{activeOrg.city}</b></div>
                <div>Emergency Hotline: <b>{activeOrg.emergencyHotline}</b></div>
                <div>Operations Email: <b>{activeOrg.contactEmail}</b></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Operational Thresholds</span>
              <div className="space-y-1 text-slate-300">
                <div>Critical Priority Index: <b>&gt;= 80 points</b></div>
                <div>Automated SLA Response Window: <b>6 hours</b></div>
                <div>AI Vision Verification Model: <b>AquaGrid Vision v3.8</b></div>
                <div>Multi-Tenant Data Isolation: <b className="text-emerald-400">Enforced by backend</b></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
