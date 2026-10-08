import React, { useState } from 'react';
import { Truck, Droplets, MapPin, CheckCircle2, Clock, ShieldCheck, Send, Plus, Check } from 'lucide-react';

interface Tanker {
  id: string;
  driver: string;
  capacityLiters: number;
  currentStatus: 'EN_ROUTE' | 'DISPENSING' | 'AVAILABLE' | 'REFILLING';
  currentDestination: string;
  zoneName: string;
  etaMinutes: number;
}

export const TankerDispatchView: React.FC = () => {
  const [tankers, setTankers] = useState<Tanker[]>([
    {
      id: 'TANKER-01',
      driver: 'Balram Yadav',
      capacityLiters: 12000,
      currentStatus: 'EN_ROUTE',
      currentDestination: 'City Hospital Emergency Sump (Sector 14)',
      zoneName: 'Sector 14 (Central District)',
      etaMinutes: 8,
    },
    {
      id: 'TANKER-02',
      driver: 'Gurmeet Singh',
      capacityLiters: 10000,
      currentStatus: 'DISPENSING',
      currentDestination: 'Public High School & Community Colony (Sector 22)',
      zoneName: 'Sector 22 (South Residential)',
      etaMinutes: 0,
    },
    {
      id: 'TANKER-04',
      driver: 'Mohammed Tariq',
      capacityLiters: 15000,
      currentStatus: 'AVAILABLE',
      currentDestination: 'Standby at North Master Reservoir TANK-01',
      zoneName: 'Sector 3 (North Ridge)',
      etaMinutes: 0,
    },
    {
      id: 'TANKER-06',
      driver: 'Rameshwar Lal',
      capacityLiters: 9000,
      currentStatus: 'REFILLING',
      currentDestination: 'Central Treatment Plant (120 MLD Hydrant)',
      zoneName: 'Sector 9 (Industrial Corridor)',
      etaMinutes: 15,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetZone, setTargetZone] = useState('Sector 14 (Central District)');
  const [destination, setDestination] = useState('Metro Health Sciences Hospital');
  const [volume, setVolume] = useState('12000');
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newTanker: Tanker = {
      id: `TANKER-0${Math.floor(7 + Math.random() * 3)}`,
      driver: 'Harish Chandra',
      capacityLiters: parseInt(volume),
      currentStatus: 'EN_ROUTE',
      currentDestination: destination,
      zoneName: targetZone,
      etaMinutes: 12,
    };

    setTankers([newTanker, ...tankers]);
    setIsModalOpen(false);
    setDispatchSuccess(`Tanker ${newTanker.id} (${volume}L) successfully dispatched to ${destination}!`);
    setTimeout(() => setDispatchSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-extrabold text-white">
                Emergency Municipal Water Tanker Fleet Dispatch
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Provides emergency potable water relief during main pipeline isolation, heatwaves, or acute supply deficit. Prioritizes healthcare facilities and high-density settlements.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 shadow-lg shadow-cyan-950 transition shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Dispatch Emergency Tanker</span>
          </button>
        </div>
      </div>

      {dispatchSuccess && (
        <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{dispatchSuccess}</span>
        </div>
      )}

      {/* Fleet Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {tankers.map((t) => {
          const isEnRoute = t.currentStatus === 'EN_ROUTE';
          const isDispensing = t.currentStatus === 'DISPENSING';
          const isAvailable = t.currentStatus === 'AVAILABLE';

          return (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {t.id}
                    </span>
                    <span className="font-bold text-white text-sm">{t.driver} (Driver)</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Capacity: <b>{t.capacityLiters.toLocaleString()} Liters</b> (Potable Grade)
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isEnRoute
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : isDispensing
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                      : isAvailable
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-700/40 text-slate-300 border-slate-600/40'
                  }`}
                >
                  {t.currentStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="rounded-xl bg-slate-900 p-3 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-300">
                  <span className="text-slate-500">Destination: </span>
                  <b>{t.currentDestination}</b>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Zone: {t.zoneName}</span>
                  {t.etaMinutes > 0 ? (
                    <span className="text-amber-300 font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ETA: ~{t.etaMinutes} mins
                    </span>
                  ) : (
                    <span className="text-cyan-300 font-semibold">On Site / Dispensing</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">
              Emergency Water Tanker Dispatch Order
            </h3>

            <form onSubmit={handleDispatch} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Municipal Zone</label>
                <select
                  value={targetZone}
                  onChange={(e) => setTargetZone(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200"
                >
                  <option value="Sector 14 (Central District)">Sector 14 (Hospital Loop)</option>
                  <option value="Sector 22 (South Residential)">Sector 22 (South High-Density)</option>
                  <option value="Sector 7 (East Tech Hub)">Sector 7 (East Tech Hub)</option>
                  <option value="Sector 9 (Industrial Corridor)">Sector 9 (Industrial SEZ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Specific Facility / Sump</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. City Hospital Trauma Center Sump"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tanker Capacity</label>
                <select
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200"
                >
                  <option value="12000">12,000 Liters (Standard Heavy Tanker)</option>
                  <option value="15000">15,000 Liters (Master Super Tanker)</option>
                  <option value="8000">8,000 Liters (Narrow Alley Response Tanker)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-4 py-1.5 font-bold text-white hover:bg-cyan-500"
                >
                  Confirm Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
