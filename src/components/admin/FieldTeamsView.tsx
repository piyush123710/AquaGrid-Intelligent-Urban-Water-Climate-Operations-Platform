import React from 'react';
import { FieldTeam, FieldWorker } from '../../types';
import { Users, HardHat, Phone, Mail, Award, CheckCircle2, Truck } from 'lucide-react';

interface FieldTeamsViewProps {
  teams: FieldTeam[];
  workers: FieldWorker[];
}

export const FieldTeamsView: React.FC<FieldTeamsViewProps> = ({ teams, workers }) => {
  return (
    <div className="space-y-6">
      {/* Teams Roster */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-cyan-400" />
              <span>Rapid Response Field Squads</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              4 specialized municipal taskforces equipped with hydraulic sleeving and acoustic diagnostics
            </p>
          </div>
          <span className="rounded-md bg-cyan-950 px-2.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-800">
            {teams.length} Active Squads
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {team.id.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-white">{team.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Assigned Zone: <b>{team.zoneName}</b>
                  </div>
                </div>
                <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 border border-emerald-500/30">
                  {team.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Leader</div>
                  <div className="font-bold text-white mt-0.5">{team.leaderName}</div>
                </div>
                <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Squad Size</div>
                  <div className="font-bold text-cyan-300 mt-0.5">{team.membersCount} Crew</div>
                </div>
                <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Vehicle</div>
                  <div className="font-bold text-slate-200 mt-0.5">{team.vehicleCode}</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Tooling: </span>
                {team.equipment.join(' • ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Field Workers Roster */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HardHat className="h-5 w-5 text-amber-400" />
              <span>Certified Field Engineers & Technicians</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual performance ratings, active tasks, and specializations
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {workers.length} Personnel Registered
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((w) => (
            <div
              key={w.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={w.avatarUrl}
                  alt={w.name}
                  className="h-11 w-11 rounded-xl object-cover border border-slate-800"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{w.name}</h4>
                  <div className="text-[11px] text-cyan-400 truncate">{w.teamName}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{w.specialization}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="rounded bg-slate-900 p-1.5 border border-slate-800">
                  <div className="text-[9px] text-slate-400">Rating</div>
                  <div className="font-bold text-amber-300 text-xs">★ {w.rating}</div>
                </div>
                <div className="rounded bg-slate-900 p-1.5 border border-slate-800">
                  <div className="text-[9px] text-slate-400">Completed</div>
                  <div className="font-bold text-emerald-300 text-xs">{w.completedIncidentsCount}</div>
                </div>
                <div className="rounded bg-slate-900 p-1.5 border border-slate-800">
                  <div className="text-[9px] text-slate-400">Status</div>
                  <div className="font-bold text-cyan-300 text-[10px] truncate">{w.currentStatus}</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>{w.phone}</span>
                <span className="text-slate-500">{w.email}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
