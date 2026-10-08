import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Incident, FieldWorker } from '../../types';
import { Droplets, Clock, TrendingUp, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AnalyticsViewProps {
  incidents: Incident[];
  workers: FieldWorker[];
}

const CATEGORY_COLORS: Record<string, string> = {
  PIPELINE_LEAK: '#0ea5e9',
  WATER_SHORTAGE: '#f59e0b',
  FLOODING: '#3b82f6',
  DRAINAGE_PROBLEM: '#8b5cf6',
  WATER_CONTAMINATION: '#ef4444',
  TANK_OVERFLOW: '#10b981',
  INFRASTRUCTURE_DAMAGE: '#f97316',
  MAINTENANCE: '#64748b',
};

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#10b981',
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ incidents, workers }) => {
  // 1. Incidents by Category data
  const categoryCounts: Record<string, number> = {};
  incidents.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).map(([cat, count]) => ({
    name: cat.replace('_', ' '),
    count,
    color: CATEGORY_COLORS[cat] || '#0ea5e9',
  }));

  // 2. Incidents by Severity data
  const severityCounts: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };
  incidents.forEach((i) => {
    if (severityCounts[i.severity] !== undefined) {
      severityCounts[i.severity]++;
    }
  });
  const severityData = Object.entries(severityCounts).map(([sev, count]) => ({
    name: sev,
    count,
    color: SEVERITY_COLORS[sev as keyof typeof SEVERITY_COLORS],
  }));

  // 3. Water Loss by Zone
  const zoneLossMap: Record<string, { loss: number; saved: number; count: number }> = {};
  incidents.forEach((i) => {
    const key = i.zoneName.replace(' (Central District)', '').replace(' (East Tech Hub)', '').replace(' (South Residential)', '').replace(' (Industrial Corridor)', '').replace(' (North Ridge & Reservoirs)', '');
    if (!zoneLossMap[key]) {
      zoneLossMap[key] = { loss: 0, saved: 0, count: 0 };
    }
    zoneLossMap[key].loss += i.estimatedWaterLossLitersPerDay;
    zoneLossMap[key].saved += i.waterSavedLiters || 0;
    zoneLossMap[key].count++;
  });
  const zoneLossData = Object.entries(zoneLossMap).map(([zone, data]) => ({
    zone,
    dailyLossLiters: Math.round(data.loss / 1000), // in kL
    savedLiters: Math.round(data.saved / 1000), // in kL
  }));

  // 4. Trend simulation (7 days)
  const trendData = [
    { day: 'Mon', reported: 18, resolved: 14, savedKL: 210 },
    { day: 'Tue', reported: 24, resolved: 19, savedKL: 280 },
    { day: 'Wed', reported: 15, resolved: 16, savedKL: 310 },
    { day: 'Thu', reported: 28, resolved: 22, savedKL: 390 },
    { day: 'Fri', reported: 22, resolved: 25, savedKL: 440 },
    { day: 'Sat', reported: 19, resolved: 18, savedKL: 320 },
    { day: 'Sun', reported: 14, resolved: 17, savedKL: 290 },
  ];

  // 5. Top Water Loss Incidents
  const topLossIncidents = [...incidents]
    .sort((a, b) => b.estimatedWaterLossLitersPerDay - a.estimatedWaterLossLitersPerDay)
    .slice(0, 5);

  const totalLoss = incidents.reduce((acc, i) => acc + (i.status !== 'RESOLVED' && i.status !== 'CLOSED' ? i.estimatedWaterLossLitersPerDay : 0), 0);
  const totalSaved = incidents.reduce((acc, i) => acc + (i.waterSavedLiters || 0), 0);
  const totalResolved = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
  const resolutionRate = incidents.length > 0 ? Math.round((totalResolved / incidents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Impact Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Estimated Active Loss</span>
            <Droplets className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {(totalLoss / 1000).toFixed(1)}k <span className="text-sm font-semibold text-cyan-400">L/day</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across active network leaks (Simulated)
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Cumulative Water Saved</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-300">
            {(totalSaved / 1000).toFixed(1)}k <span className="text-sm font-semibold text-emerald-400">Liters</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/90 font-medium">
            Arrested upon verified field repairs
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Average Resolution Time</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-300">
            4.2 <span className="text-sm font-semibold text-amber-400">hours</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Rapid leak response SLA target: &lt;6h
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Overall Resolution Rate</span>
            <CheckCircle className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {resolutionRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {totalResolved} of {incidents.length} incidents cleared
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend of Reported vs Resolved */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Operational Throughput</h3>
              <p className="text-xs text-slate-400">Reported vs. Resolved Incidents (7-day trend)</p>
            </div>
            <span className="text-[10px] text-cyan-400 border border-cyan-800/60 bg-cyan-950/60 px-2 py-0.5 rounded">
              Telemetric
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="reported" stroke="#f97316" strokeWidth={2} name="Reported" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Water Loss & Savings by Zone */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Water Loss & Savings by Municipal Zone</h3>
              <p className="text-xs text-slate-400">Expressed in kiloLiters (kL / 1,000 Liters)</p>
            </div>
            <span className="text-[10px] text-emerald-400 border border-emerald-800/60 bg-emerald-950/60 px-2 py-0.5 rounded">
              Conservation
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneLossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="zone" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="dailyLossLiters" fill="#ef4444" name="Active Loss (kL/d)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savedLiters" fill="#10b981" name="Arrested Savings (kL)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents by Category */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Incidents by Infrastructure Category</h3>
              <p className="text-xs text-slate-400">Total volume distribution</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown & Top Water Loss Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Top Active Water Loss Hotspots</h3>
                <p className="text-xs text-slate-400">Highest daily depletion rates requiring immediate intervention</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {topLossIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-cyan-400">{inc.id}</span>
                      <span className="font-bold text-white truncate max-w-[200px]">{inc.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {inc.zoneName}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-rose-400">
                      {inc.estimatedWaterLossLitersPerDay.toLocaleString()} L/d
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Priority: {inc.priorityScore}/100
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Critical Hotspot Count: <b>{incidents.filter((i) => i.severity === 'CRITICAL').length}</b></span>
            <span className="text-cyan-400 font-semibold">Priority Triage Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
