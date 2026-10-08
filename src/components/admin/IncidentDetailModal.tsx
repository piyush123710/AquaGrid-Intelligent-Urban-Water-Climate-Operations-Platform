import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Users,
  Shield,
  CheckCircle2,
  FileText,
  Activity,
  Droplets,
  ExternalLink,
  RotateCcw,
  Camera,
  CheckCheck,
  Printer,
  Download,
} from 'lucide-react';
import { Incident, FieldTeam, FieldWorker } from '../../types';
import { StorageService } from '../../services/storage';
import { BeforeAfterSlider } from '../common/BeforeAfterSlider';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  teams: FieldTeam[];
  workers: FieldWorker[];
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  teams,
  workers,
}) => {
  if (!incident) return null;

  const [selectedTeamId, setSelectedTeamId] = useState(incident.assignedTeamId || 'team-07');
  const [selectedWorkerId, setSelectedWorkerId] = useState(incident.assignedWorkerId || 'usr-worker-01');
  const [isAssigning, setIsAssigning] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null);

  const handleAssign = () => {
    StorageService.assignIncident(incident.id, selectedTeamId, selectedWorkerId);
    setIsAssigning(false);
  };

  const handleAdminOverride = (approve: boolean) => {
    StorageService.adminOverrideVerification(incident.id, approve);
    setOverrideSuccess(approve ? 'Resolution approved by Admin' : 'Incident reopened for further repair');
    setTimeout(() => setOverrideSuccess(null), 3000);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
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
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'ASSIGNED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  const pb = incident.priorityBreakdown;
  const beforePhoto =
    incident.photos.find((p) => p.type === 'BEFORE_REPAIR') ||
    (incident.photos.length > 0 ? incident.photos[0] : null);
  const afterPhoto = incident.photos.find((p) => p.type === 'AFTER_REPAIR');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-extrabold tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/60">
              {incident.id}
            </span>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-bold ${getSeverityBadge(
                incident.severity
              )}`}
            >
              {incident.severity}
            </span>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-bold ${getStatusBadge(
                incident.status
              )}`}
            >
              {incident.status}
            </span>
            <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-bold text-cyan-300">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span>Priority: {incident.priorityScore}/100</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              title="Print / Save Official Work Order Dispatch Sheet"
            >
              <Printer className="h-3.5 w-3.5 text-cyan-400" />
              <span>Work Order</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {overrideSuccess && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCheck className="h-4 w-4" />
              <span>{overrideSuccess}</span>
            </div>
          )}

          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {incident.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {incident.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                {incident.locationAddress} ({incident.zoneName})
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Reported by {incident.reportedBy.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {new Date(incident.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Impact & Water Loss Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                Est. Daily Loss
              </div>
              <div className="mt-1 text-lg font-extrabold text-cyan-300">
                {incident.estimatedWaterLossLitersPerDay.toLocaleString()} L/d
              </div>
              <div className="text-[10px] text-slate-500">
                Flow: {incident.flowRateLitersPerMin || 12.5} L/min
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-amber-400" />
                Affected Pop.
              </div>
              <div className="mt-1 text-lg font-extrabold text-amber-300">
                ~{incident.affectedPopulation.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">Local consumers</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Water Saved
              </div>
              <div className="mt-1 text-lg font-extrabold text-emerald-300">
                {(incident.waterSavedLiters || 0).toLocaleString()} L
              </div>
              <div className="text-[10px] text-slate-500">
                {incident.status === 'RESOLVED' ? 'Arrested upon repair' : 'Pending resolution'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                Critical Infra
              </div>
              <div className="mt-1 text-xs font-bold text-rose-300 truncate">
                {incident.criticalFacilities?.[0] || 'Hospital / Corridor'}
              </div>
              <div className="text-[10px] text-slate-500">Proximity risk</div>
            </div>
          </div>

          {/* AI Incident Intelligence Box */}
          {incident.aiAnalysis && (
            <div className="rounded-xl border border-cyan-800/60 bg-gradient-to-r from-cyan-950/40 to-slate-950/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    AI Incident Intelligence
                  </span>
                </div>
                <span className="rounded-md bg-cyan-900/60 px-2 py-0.5 text-[11px] font-semibold text-cyan-200 border border-cyan-700/50">
                  {incident.aiAnalysis.confidence}% Confidence
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs mt-3">
                <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Classified As</div>
                  <div className="font-bold text-white mt-0.5">
                    {incident.aiAnalysis.category.replace('_', ' ')}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Facility Proximity</div>
                  <div className="font-bold text-rose-300 mt-0.5 truncate">
                    {incident.aiAnalysis.criticalInfrastructure || 'Standard Municipal Grid'}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Recommended Team</div>
                  <div className="font-bold text-cyan-300 mt-0.5">
                    {incident.aiAnalysis.suggestedTeamType}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-300 bg-slate-900/40 p-2 rounded border border-slate-800/60">
                <span className="font-semibold text-cyan-400">Action Plan: </span>
                {incident.aiAnalysis.recommendedAction}
              </div>
            </div>
          )}

          {/* Priority Engine Transparent Breakdown */}
          {pb && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span>Transparent Priority Scoring Model (0–100)</span>
                </div>
                <span className="text-sm font-extrabold text-cyan-400">
                  {pb.score} / 100
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Severity</div>
                  <div className="font-bold text-white mt-0.5">
                    {pb.severityFactor.score} / {pb.severityFactor.max}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 truncate">
                    {pb.severityFactor.label}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Population</div>
                  <div className="font-bold text-white mt-0.5">
                    {pb.populationFactor.score} / {pb.populationFactor.max}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 truncate">
                    {pb.populationFactor.label}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Duration</div>
                  <div className="font-bold text-white mt-0.5">
                    {pb.durationFactor.score} / {pb.durationFactor.max}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 truncate">
                    {pb.durationFactor.label}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Criticality</div>
                  <div className="font-bold text-white mt-0.5">
                    {pb.locationCriticality.score} / {pb.locationCriticality.max}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 truncate">
                    {pb.locationCriticality.label}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900 p-2 border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-400">Water Loss</div>
                  <div className="font-bold text-white mt-0.5">
                    {pb.waterLossFactor.score} / {pb.waterLossFactor.max}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 truncate">
                    {pb.waterLossFactor.label}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Management */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Users className="h-4 w-4 text-cyan-400" />
                <span>Field Team Assignment</span>
              </div>
              {!isAssigning ? (
                <button
                  onClick={() => setIsAssigning(true)}
                  className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-cyan-400 hover:bg-slate-700 transition"
                >
                  Change Assignment
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAssign}
                    className="rounded-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-500 transition"
                  >
                    Confirm Dispatch
                  </button>
                  <button
                    onClick={() => setIsAssigning(false)}
                    className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isAssigning ? (
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Select Response Team
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.zoneName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Select Lead Worker
                  </label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.teamName}) - {w.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Assigned Team: </span>
                  <span className="font-bold text-white">
                    {incident.assignedTeamName || 'Field Team 7 - Rapid Leak Response'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Lead Worker: </span>
                  <span className="font-bold text-cyan-300">
                    {incident.assignedWorkerName || 'Rajesh Sharma'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Equipment: Hydraulic Pipe Clamp, Acoustic Sensor
                </div>
              </div>
            )}
          </div>

          {/* Before / After Verification Photos */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Camera className="h-4 w-4 text-cyan-400" />
                <span>Before & After Repair Verification</span>
              </div>
              {incident.resolutionDetails?.aiVerificationConfidence && (
                <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-800/60">
                  AI Verified: {incident.resolutionDetails.aiVerificationConfidence}%
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Before Photo */}
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-xs font-bold text-rose-300 mb-1 flex items-center justify-between">
                  <span>BEFORE REPAIR</span>
                  <span className="text-[10px] text-slate-500">Initial Breach</span>
                </div>
                {beforePhoto ? (
                  <img
                    src={beforePhoto.url}
                    alt="Before Repair"
                    className="h-44 w-full rounded-md object-cover border border-slate-800"
                  />
                ) : (
                  <div className="h-44 w-full rounded-md border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                    No initial photo uploaded
                  </div>
                )}
                <div className="mt-1.5 text-[11px] text-slate-400">
                  {beforePhoto?.caption || 'Active pressurized leak reported'}
                </div>
              </div>

              {/* After Photo */}
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-xs font-bold text-emerald-300 mb-1 flex items-center justify-between">
                  <span>AFTER REPAIR</span>
                  <span className="text-[10px] text-slate-500">
                    {afterPhoto ? 'Resolution Evidence' : 'Pending Field Repair'}
                  </span>
                </div>
                {afterPhoto ? (
                  <img
                    src={afterPhoto.url}
                    alt="After Repair"
                    className="h-44 w-full rounded-md object-cover border border-slate-800"
                  />
                ) : (
                  <div className="h-44 w-full rounded-md border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500 p-4 text-center">
                    Worker has not uploaded after-repair photo yet
                  </div>
                )}
                <div className="mt-1.5 text-[11px] text-slate-400">
                  {afterPhoto?.caption || 'Awaiting completion from field worker'}
                </div>
              </div>
            </div>

            {/* Interactive Before & After Comparison Slider */}
            {beforePhoto && afterPhoto && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <BeforeAfterSlider
                  beforeUrl={beforePhoto.url}
                  afterUrl={afterPhoto.url}
                  aiConfidence={incident.resolutionDetails?.aiVerificationConfidence || 95}
                  heightClass="h-72"
                />
              </div>
            )}

            {/* AI Verification notes and Admin Override buttons */}
            {incident.resolutionDetails && (
              <div className="mt-4 rounded-lg bg-slate-900/90 p-3 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-cyan-400">AI Verification Output: </span>
                  {incident.resolutionDetails.aiVerificationNotes}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400">
                    Admin Governance: Override AI verification if required
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdminOverride(true)}
                      className="rounded-md bg-emerald-600/80 hover:bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition"
                    >
                      Approve Resolution
                    </button>
                    <button
                      onClick={() => handleAdminOverride(false)}
                      className="rounded-md bg-rose-600/80 hover:bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition"
                    >
                      Request Re-inspection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Audit Trail */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Operational Timeline & Audit Trail</span>
            </div>
            <div className="space-y-3">
              {incident.timeline.map((evt, idx) => (
                <div key={evt.id || idx} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{evt.title}</span>
                      <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                    </div>
                    <div className="text-slate-300 text-[11px] mt-0.5">
                      {evt.description}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Actor: {evt.actor} ({evt.actorRole})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
