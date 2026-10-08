import React from 'react';
import {
  ThermometerSun,
  Droplets,
  AlertTriangle,
  Flame,
  CloudRain,
  Wind,
  Sun,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { WeatherRecord, ZoneRisk } from '../../types';

interface ClimateRiskViewProps {
  zonesRisk: ZoneRisk[];
  weather: WeatherRecord;
}

export const ClimateRiskView: React.FC<ClimateRiskViewProps> = ({ zonesRisk, weather }) => {
  const getRiskBadge = (level: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW') => {
    switch (level) {
      case 'EXTREME':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'MODERATE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  const getRiskIcon = (level: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW') => {
    switch (level) {
      case 'EXTREME':
        return '🔴';
      case 'HIGH':
        return '🟠';
      case 'MODERATE':
        return '🟡';
      default:
        return '🟢';
    }
  };

  return (
    <div className="space-y-6">
      {/* Weather Telemetry Header Card */}
      <div className="rounded-2xl border border-amber-800/60 bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <ThermometerSun className="h-6 w-6 text-amber-400 animate-pulse" />
              <h2 className="text-xl font-extrabold text-white">
                Urban Heat Island & Water Stress Telemetry
              </h2>
            </div>
            <p className="mt-1 text-xs text-amber-200/90 max-w-2xl leading-relaxed">
              Real-time atmospheric telemetry synchronized with pipeline thermal expansion models. High ambient temperatures correlate with a 28% increase in pressurized pipe ruptures due to soil contraction and peak consumer draw.
            </p>
          </div>

          {/* Quick Weather Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                Air Temp
              </div>
              <div className="mt-1 text-xl font-extrabold text-white">
                {weather.temperatureC}°C
              </div>
              <div className="text-[10px] text-rose-400 font-semibold">{weather.condition}</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-rose-400" />
                Heat Index
              </div>
              <div className="mt-1 text-xl font-extrabold text-rose-400">
                {weather.heatIndexC}°C
              </div>
              <div className="text-[10px] text-slate-400">Feels Like</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                Humidity
              </div>
              <div className="mt-1 text-xl font-extrabold text-cyan-300">
                {weather.humidityPercent}%
              </div>
              <div className="text-[10px] text-slate-400">Relative Saturation</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <CloudRain className="h-3.5 w-3.5 text-blue-400" />
                Rain Prob
              </div>
              <div className="mt-1 text-xl font-extrabold text-blue-300">
                {weather.rainProbabilityPercent}%
              </div>
              <div className="text-[10px] text-slate-400">Next 12h</div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-amber-900/60 bg-amber-950/30 p-3 text-xs text-amber-200/90 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
          <span><b>Operational Advisory:</b> {weather.advisoryNote}</span>
        </div>
      </div>

      {/* Zone Risk Evaluation Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Municipal Zone Vulnerability Index
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates Heat Risk + Water Availability + Infrastructure Age + Historical Failure Rate
            </p>
          </div>
          <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">
            5 Monitored Sectors
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zonesRisk.map((z) => (
            <div
              key={z.zoneId}
              className={`rounded-2xl border p-5 transition space-y-4 ${
                z.overallRiskLevel === 'EXTREME'
                  ? 'border-rose-800/80 bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 shadow-lg shadow-rose-950/30'
                  : z.overallRiskLevel === 'HIGH'
                  ? 'border-amber-800/80 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900'
                  : 'border-slate-800 bg-slate-950/80'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{getRiskIcon(z.overallRiskLevel)}</span>
                    <span>{z.zoneName}</span>
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Population: ~{z.populationDensity.toLocaleString()} citizens
                  </div>
                </div>
                <span
                  className={`rounded-lg border px-2.5 py-1 text-xs font-extrabold ${getRiskBadge(
                    z.overallRiskLevel
                  )}`}
                >
                  {z.overallRiskLevel}
                </span>
              </div>

              {/* Sub-Risk Scores */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-2">
                  <div className="text-[10px] text-slate-400">Heat Risk</div>
                  <div className="mt-0.5 font-bold text-amber-300">
                    {z.heatRiskLevel}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-2">
                  <div className="text-[10px] text-slate-400">Water Risk</div>
                  <div className="mt-0.5 font-bold text-cyan-300">
                    {z.waterRiskLevel}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-2">
                  <div className="text-[10px] text-slate-400">Index Score</div>
                  <div className="mt-0.5 font-bold text-rose-400">
                    {z.overallRiskScore} / 100
                  </div>
                </div>
              </div>

              {/* Specific Vulnerability Factors */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Water Availability:</span>
                  <span className="font-semibold text-emerald-400">{z.waterAvailabilityPercent}% capacity</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Active Incidents:</span>
                  <span className="font-semibold text-rose-400">{z.activeIncidentCount} active leaks</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Historical Failures:</span>
                  <span className="font-semibold text-slate-200">{z.historicalIncidentCount} records</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Infra Risk Score:</span>
                  <span className="font-semibold text-amber-400">{z.infrastructureRiskScore}/100</span>
                </div>
              </div>

              {/* Primary Vulnerability Note */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-[11px] text-slate-300">
                <span className="font-bold text-cyan-400">Primary Stressor: </span>
                {z.primaryVulnerability}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
