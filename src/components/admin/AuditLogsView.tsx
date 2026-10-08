import React, { useState } from 'react';
import { AuditLogItem } from '../../types';
import { ShieldCheck, Search, Filter, Clock, User, ArrowRight } from 'lucide-react';

interface AuditLogsViewProps {
  logs: AuditLogItem[];
  onSelectIncident?: (incidentId: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, onSelectIncident }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredLogs = logs.filter((l) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !l.action.toLowerCase().includes(q) &&
        !l.userName.toLowerCase().includes(q) &&
        !l.entityId.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filterType !== 'ALL' && l.entityType !== filterType) return false;
    return true;
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Enterprise Governance & Audit Logs
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable system and user activity trail complying with ISO municipal asset management protocols
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search action, user, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Entity Types</option>
            <option value="INCIDENT">Incident</option>
            <option value="ASSIGNMENT">Assignment</option>
            <option value="VERIFICATION">Verification</option>
            <option value="ASSET">Asset</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">User & Role</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Transition / Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/40 transition">
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                  {log.timestamp}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-semibold text-white">{log.userName}</div>
                  <div className="text-[10px] text-slate-500">{log.userRole}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50 text-[11px]">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => {
                      if (onSelectIncident && log.entityId.startsWith('AQ-')) {
                        onSelectIncident(log.entityId);
                      }
                    }}
                    className={`font-mono text-slate-300 font-bold ${
                      log.entityId.startsWith('AQ-') ? 'hover:text-cyan-400 underline cursor-pointer' : ''
                    }`}
                  >
                    {log.entityId}
                  </button>
                  <span className="text-[10px] text-slate-500 ml-1.5">({log.entityType})</span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-300">
                    {log.previousValue && (
                      <span className="line-through text-slate-500 mr-1.5">
                        {log.previousValue}
                      </span>
                    )}
                    {log.newValue && (
                      <span className="font-semibold text-emerald-300">
                        {log.newValue}
                      </span>
                    )}
                  </div>
                  {log.metadata && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {log.metadata}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
