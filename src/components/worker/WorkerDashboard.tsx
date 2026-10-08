import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  HardHat,
  MapPin,
  Clock,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  Wrench,
  ThumbsUp,
  Award,
} from 'lucide-react';
import { Incident, FieldWorker } from '../../types';
import { StorageService } from '../../services/storage';
import { verifyRepairWithAI } from '../../services/aiService';
import { BeforeAfterSlider } from '../common/BeforeAfterSlider';
import { LEAK_BEFORE_PHOTO, REPAIRED_AFTER_PHOTO } from '../../assets/imageConstants';

interface WorkerDashboardProps {
  worker: FieldWorker;
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  worker,
  incidents,
  onSelectIncident,
}) => {
  // Find assigned incidents
  const myAssignments = incidents.filter(
    (i) =>
      i.assignedWorkerId === worker.id ||
      i.assignedTeamId === worker.teamId ||
      (i.id === 'AQ-1024' && i.status !== 'CLOSED')
  );

  const [activeWorkflowIncident, setActiveWorkflowIncident] = useState<Incident | null>(null);
  const [workflowStep, setWorkflowStep] = useState<number>(1);
  const [inspectionNotes, setInspectionNotes] = useState('Acoustic sensor verified pipe joint rupture. Pressure elevated to 5.8 bar. Preparing hydraulic sleeve clamp.');
  const [repairNotes, setRepairNotes] = useState('Installed 600mm heavy ductile iron split sleeve clamp with Buna-N gasket. Torqued bolts to 180 Nm. Pressurized to 6.2 bar for 20 minutes with zero weeping. Surface backfilled and dried.');
  
  // Photo states with high-res generated realistic engineering defaults
  const [beforePhotoUrl, setBeforePhotoUrl] = useState(LEAK_BEFORE_PHOTO);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(REPAIRED_AFTER_PHOTO);
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isAfter: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isAfter) setAfterPhotoUrl(reader.result);
          else setBeforePhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const [isVerifyingAI, setIsVerifyingAI] = useState(false);
  const [aiVerificationResult, setAiVerificationResult] = useState<{
    confidence: number;
    result: 'VERIFIED_RESOLVED' | 'NEEDS_REVIEW';
    notes: string;
  } | null>(null);
  const [resolutionSuccess, setResolutionSuccess] = useState(false);

  const startWorkflowFor = (inc: Incident) => {
    setActiveWorkflowIncident(inc);
    if (inc.status === 'ASSIGNED') {
      setWorkflowStep(1); // Accept
    } else if (inc.status === 'IN_PROGRESS') {
      setWorkflowStep(3); // In inspection / repair
    } else {
      setWorkflowStep(1);
    }
    setAiVerificationResult(null);
    setResolutionSuccess(false);
  };

  const handleAcceptAssignment = () => {
    if (!activeWorkflowIncident) return;
    StorageService.startInspection(
      activeWorkflowIncident.id,
      'Worker accepted assignment and is en route with rapid response van.'
    );
    setWorkflowStep(2); // Navigate
  };

  const handleStartInspection = () => {
    if (!activeWorkflowIncident) return;
    StorageService.startInspection(
      activeWorkflowIncident.id,
      inspectionNotes,
      beforePhotoUrl
    );
    setWorkflowStep(4); // Repair
  };

  const handleRunAIVerification = async () => {
    setIsVerifyingAI(true);
    try {
      const res = await verifyRepairWithAI(beforePhotoUrl, afterPhotoUrl, repairNotes);
      setAiVerificationResult({
        confidence: res.confidence,
        result: res.result,
        notes: res.notes,
      });
      setWorkflowStep(5); // Ready to submit
    } finally {
      setIsVerifyingAI(false);
    }
  };

  const handleSubmitResolution = () => {
    if (!activeWorkflowIncident) return;

    StorageService.submitResolution(activeWorkflowIncident.id, {
      beforePhotoUrl,
      afterPhotoUrl,
      repairNotes,
      aiVerificationConfidence: aiVerificationResult?.confidence || 94,
      aiVerificationResult: aiVerificationResult?.result || 'VERIFIED_RESOLVED',
      aiVerificationNotes: aiVerificationResult?.notes,
    });

    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#10b981'],
      });
    } catch {}

    setResolutionSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mobile-first Worker Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={worker.avatarUrl}
              alt={worker.name}
              className="h-14 w-14 rounded-xl object-cover border-2 border-amber-500/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-white">{worker.name}</h1>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  ON FIELD
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-medium">
                {worker.teamName}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Spec: {worker.specialization}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-center">
              <div className="text-[10px] text-slate-400">Rating</div>
              <div className="text-sm font-bold text-amber-300">★ {worker.rating}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-center">
              <div className="text-[10px] text-slate-400">Completed</div>
              <div className="text-sm font-bold text-emerald-300">{worker.completedIncidentsCount}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-center">
              <div className="text-[10px] text-slate-400">Active Tasks</div>
              <div className="text-sm font-bold text-cyan-300">
                {myAssignments.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Field Workflow Modal / Drawer */}
      {activeWorkflowIncident && (
        <div className="rounded-2xl border border-cyan-800/80 bg-slate-900 p-5 shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Field Operations Workflow: {activeWorkflowIncident.id}
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-md">
                  {activeWorkflowIncident.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveWorkflowIncident(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Close Workflow
            </button>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-semibold">
            <div
              className={`p-2 rounded-lg border ${
                workflowStep >= 1
                  ? 'border-cyan-600 bg-cyan-950/60 text-cyan-200'
                  : 'border-slate-800 bg-slate-950 text-slate-500'
              }`}
            >
              1. Accept
            </div>
            <div
              className={`p-2 rounded-lg border ${
                workflowStep >= 2
                  ? 'border-cyan-600 bg-cyan-950/60 text-cyan-200'
                  : 'border-slate-800 bg-slate-950 text-slate-500'
              }`}
            >
              2. Navigate
            </div>
            <div
              className={`p-2 rounded-lg border ${
                workflowStep >= 3
                  ? 'border-cyan-600 bg-cyan-950/60 text-cyan-200'
                  : 'border-slate-800 bg-slate-950 text-slate-500'
              }`}
            >
              3. Before Photo
            </div>
            <div
              className={`p-2 rounded-lg border ${
                workflowStep >= 4
                  ? 'border-cyan-600 bg-cyan-950/60 text-cyan-200'
                  : 'border-slate-800 bg-slate-950 text-slate-500'
              }`}
            >
              4. Repair & After
            </div>
            <div
              className={`p-2 rounded-lg border ${
                workflowStep >= 5
                  ? 'border-emerald-600 bg-emerald-950/60 text-emerald-200'
                  : 'border-slate-800 bg-slate-950 text-slate-500'
              }`}
            >
              5. AI Verify
            </div>
          </div>

          {/* Workflow Step Contents */}
          {resolutionSuccess ? (
            <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-6 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCheck className="h-8 w-8" />
              </div>
              <h4 className="text-base font-extrabold text-white">
                Incident Resolution Confirmed!
              </h4>
              <p className="text-xs text-emerald-200 max-w-md mx-auto">
                AI Vision verified the repair with 94% confidence. Pipeline breach arrested, and{' '}
                <b>{activeWorkflowIncident.estimatedWaterLossLitersPerDay.toLocaleString()} L/day</b> has been credited to municipal water conservation savings.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setActiveWorkflowIncident(null)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
                >
                  Done & Return to Assignments
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Step 1: Accept */}
              {workflowStep === 1 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Step 1: Accept Assignment</span>
                    <span className="rounded bg-rose-500/20 text-rose-300 px-2 py-0.5 font-bold">
                      {activeWorkflowIncident.severity}
                    </span>
                  </div>
                  <p className="text-slate-300">
                    Dispatched to {activeWorkflowIncident.locationAddress}. Proximity to critical facility:{' '}
                    <b>{activeWorkflowIncident.criticalFacilities?.[0] || 'Hospital corridor'}</b>.
                  </p>
                  <div className="rounded-lg bg-slate-900 p-3 border border-slate-800 text-slate-400">
                    Estimated water loss rate: <b>{activeWorkflowIncident.estimatedWaterLossLitersPerDay.toLocaleString()} L/day</b> (~12.5 L/min).
                  </div>
                  <button
                    onClick={handleAcceptAssignment}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Accept Job & Mobilize Crew</span>
                  </button>
                </div>
              )}

              {/* Step 2: Navigate */}
              {workflowStep === 2 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Step 2: Navigate to Incident</span>
                    <span className="text-cyan-400 font-mono">
                      {activeWorkflowIncident.coordinates[0].toFixed(4)}, {activeWorkflowIncident.coordinates[1].toFixed(4)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-900 p-3 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">{activeWorkflowIncident.locationAddress}</div>
                      <div className="text-slate-400 text-[11px]">ETA: ~6 mins via Sector 14 Arterial Corridor</div>
                    </div>
                    <button
                      onClick={() => alert(`Opening GPS navigation to [${activeWorkflowIncident.coordinates.join(', ')}]`)}
                      className="flex items-center gap-1 rounded-lg bg-cyan-950 px-3 py-1.5 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 font-semibold"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>GPS Nav</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setWorkflowStep(3)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition"
                  >
                    <span>Arrived on Site → Start Inspection</span>
                  </button>
                </div>
              )}

              {/* Step 3: Before Photo & Inspection */}
              {workflowStep === 3 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
                  <div className="font-bold text-white text-sm">Step 3: Capture Before Photo & Diagnostic</div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Before Repair Photo (Pre-resolution evidence)
                    </label>
                    <div className="flex gap-3 items-center">
                      <img
                        src={beforePhotoUrl}
                        alt="Before"
                        className="h-24 w-32 rounded-lg object-cover border border-slate-800 shrink-0"
                      />
                      <div className="flex-1 space-y-2">
                        <select
                          value={beforePhotoUrl}
                          onChange={(e) => setBeforePhotoUrl(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-[11px] text-slate-200"
                        >
                          <option value={LEAK_BEFORE_PHOTO}>
                            Generated Asset: High-Pressure Pipeline Burst (AQ-1024)
                          </option>
                          <option value="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80">
                            Photo 2: Pressurized road bubbling near Hospital gate
                          </option>
                          <option value="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80">
                            Photo 3: Excavated ruptured ductile iron pipe joint
                          </option>
                        </select>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] text-cyan-300 font-semibold border border-slate-700 flex items-center gap-1">
                            <Upload className="h-3 w-3" />
                            <span>Upload Real Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(e, false)}
                            />
                          </label>
                          <span className="text-[10px] text-slate-500">or use preset</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Inspection Notes & Sensor Telemetry
                    </label>
                    <textarea
                      value={inspectionNotes}
                      onChange={(e) => setInspectionNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleStartInspection}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition"
                  >
                    <span>Log Before Evidence → Proceed to Repair</span>
                  </button>
                </div>
              )}

              {/* Step 4: Repair & After Photo */}
              {workflowStep === 4 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
                  <div className="font-bold text-white text-sm">Step 4: Execute Repair & Capture After Photo</div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      After Repair Photo (Proof of leak arrest & dry surface)
                    </label>
                    <div className="flex gap-3 items-center">
                      <img
                        src={afterPhotoUrl}
                        alt="After"
                        className="h-24 w-32 rounded-lg object-cover border border-slate-800 shrink-0"
                      />
                      <div className="flex-1 space-y-2">
                        <select
                          value={afterPhotoUrl}
                          onChange={(e) => setAfterPhotoUrl(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-[11px] text-slate-200"
                        >
                          <option value={REPAIRED_AFTER_PHOTO}>
                            Generated Asset: Bolted Stainless Repair Clamp (Flow Sealed)
                          </option>
                          <option value="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80">
                            Photo 2: Heavy ductile clamp bolted & dry asphalt surface
                          </option>
                          <option value="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80">
                            Photo 3: Clean valve chamber with zero weepage
                          </option>
                        </select>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] text-emerald-300 font-semibold border border-slate-700 flex items-center gap-1">
                            <Upload className="h-3 w-3" />
                            <span>Upload Real After Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(e, true)}
                            />
                          </label>
                          <span className="text-[10px] text-slate-500">or use preset</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Resolution Notes & Repair Method
                    </label>
                    <textarea
                      value={repairNotes}
                      onChange={(e) => setRepairNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleRunAIVerification}
                    disabled={isVerifyingAI}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-bold text-white hover:from-cyan-500 hover:to-blue-500 transition disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 text-cyan-200 animate-spin" />
                    <span>{isVerifyingAI ? 'AI Vision Analyzing Photos...' : 'Run AI Repair Verification'}</span>
                  </button>
                </div>
              )}

              {/* Step 5: Verification Result & Final Submit */}
              {workflowStep === 5 && aiVerificationResult && (
                <div className="rounded-xl border border-emerald-600/60 bg-slate-950 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Step 5: AI Verification Passed</span>
                    <span className="rounded-md bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-800">
                      {aiVerificationResult.confidence}% Confidence
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-900 p-3 border border-slate-800 text-slate-300 leading-relaxed">
                    <span className="font-bold text-cyan-400">Computer Vision Analysis: </span>
                    {aiVerificationResult.notes}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Water Loss Arrested</div>
                      <div className="font-bold text-cyan-300 mt-0.5">
                        {activeWorkflowIncident.estimatedWaterLossLitersPerDay.toLocaleString()} L/day
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Citizens Restored</div>
                      <div className="font-bold text-amber-300 mt-0.5">
                        ~{activeWorkflowIncident.affectedPopulation.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <BeforeAfterSlider
                      beforeUrl={beforePhotoUrl}
                      afterUrl={afterPhotoUrl}
                      aiConfidence={aiVerificationResult.confidence}
                      heightClass="h-56"
                    />
                  </div>

                  <button
                    onClick={handleSubmitResolution}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-extrabold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950 transition"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Submit Resolution & Update Municipal Grid</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* "My Assignments" List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">My Active Assignments</h2>
          </div>
          <span className="text-xs text-slate-400">
            {myAssignments.length} assigned task(s)
          </span>
        </div>

        {myAssignments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No active assignments currently. Standby for dispatch.
          </div>
        ) : (
          <div className="space-y-3">
            {myAssignments.map((inc) => {
              const isCritical = inc.severity === 'CRITICAL';
              const isResolved = inc.status === 'RESOLVED';

              return (
                <div
                  key={inc.id}
                  className={`rounded-xl border p-4 transition ${
                    isCritical && !isResolved
                      ? 'border-rose-800/60 bg-gradient-to-r from-rose-950/20 to-slate-900 shadow-md'
                      : isResolved
                      ? 'border-emerald-800/40 bg-emerald-950/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                        {inc.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-sm">
                        {inc.title}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded self-start sm:self-auto ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 line-clamp-2">
                    {inc.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                        {inc.zoneName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                        {inc.estimatedWaterLossLitersPerDay.toLocaleString()} L/d
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onSelectIncident && (
                        <button
                          onClick={() => onSelectIncident(inc)}
                          className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                        >
                          View Details
                        </button>
                      )}

                      {!isResolved ? (
                        <button
                          onClick={() => startWorkflowFor(inc)}
                          className="flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1 text-xs font-bold text-white hover:bg-cyan-500 shadow transition"
                        >
                          <Wrench className="h-3 w-3" />
                          <span>
                            {inc.status === 'ASSIGNED' ? 'Accept & Inspect' : 'Continue Repair'}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Verified & Resolved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Work History & Operational Impact Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Field Operations Record & Impact</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div className="text-[10px] text-slate-400">Total Verified Fixes</div>
            <div className="mt-1 text-lg font-bold text-white">84 incidents</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div className="text-[10px] text-slate-400">Water Loss Conserved</div>
            <div className="mt-1 text-lg font-bold text-emerald-300">1.2M Liters</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div className="text-[10px] text-slate-400">Average Repair Time</div>
            <div className="mt-1 text-lg font-bold text-cyan-300">1.8 hours</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div className="text-[10px] text-slate-400">Field Unit Equipment</div>
            <div className="mt-1 text-xs font-semibold text-slate-300">VAN-07-HYDRAULIC</div>
          </div>
        </div>
      </div>
    </div>
  );
};
