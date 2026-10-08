import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Droplets,
  Camera,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Send,
  HelpCircle,
  FileText,
  User,
  Phone,
  Upload,
  Mic,
} from 'lucide-react';
import { Incident, IncidentCategory, User as UserType } from '../../types';
import { StorageService } from '../../services/storage';
import { analyzeIncidentWithAI } from '../../services/aiService';
import { calculatePriorityScore } from '../../services/priorityEngine';
import { LEAK_BEFORE_PHOTO, PRESET_INCIDENT_PHOTOS } from '../../assets/imageConstants';

interface CitizenPortalProps {
  currentUser: UserType;
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  currentUser,
  incidents,
  onSelectIncident,
}) => {
  const [activeTab, setActiveTab] = useState<'REPORT' | 'MY_REPORTS'>('REPORT');

  // Form states
  const [category, setCategory] = useState<IncidentCategory>('PIPELINE_LEAK');
  const [description, setDescription] = useState(
    'Water has been leaking continuously from the road surface near the hospital trauma center since yesterday.'
  );
  const [zoneId, setZoneId] = useState('zone-14');
  const [address, setAddress] = useState('Avenue 4, Opp. City Hospital Emergency Ward, Sector 14');
  const [reporterName, setReporterName] = useState(currentUser.name || 'Ananya Deshmukh');
  const [reporterPhone, setReporterPhone] = useState('+91 99203 44112');
  const [photoUrl, setPhotoUrl] = useState(LEAK_BEFORE_PHOTO);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = (language: 'hi' | 'en') => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      if (language === 'hi') {
        setDescription('Pani 3 din se nahi aa raha aur paas ke hospital aur school ko bhi severe water problem hai.');
        setCategory('WATER_SHORTAGE');
      } else {
        setDescription('Water has been leaking continuously from the road surface near the hospital trauma center since yesterday.');
        setCategory('PIPELINE_LEAK');
      }
      setIsRecordingVoice(false);
    }, 1200);
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<Incident | null>(null);

  // Filter citizen's reports
  const myReports = incidents.filter(
    (i) => i.reportedBy.isCitizen || i.id === 'AQ-1024' || (submissionResult && i.id === submissionResult.id)
  );

  const handleQuickPreset = (presetText: string, presetCat: IncidentCategory, presetAddr: string) => {
    setDescription(presetText);
    setCategory(presetCat);
    setAddress(presetAddr);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      // 1. Run AI Analysis
      const ai = await analyzeIncidentWithAI({
        description,
        categoryHint: category,
        locationHint: address,
      });

      // 2. Run Priority Engine
      const pb = calculatePriorityScore({
        category: ai.category,
        severity: ai.severity,
        affectedPopulation: ai.affectedPopulationEstimate,
        durationHours: description.includes('yesterday') ? 28 : 12,
        criticalFacilities: ai.criticalInfrastructure ? [ai.criticalInfrastructure] : undefined,
        estimatedWaterLossLitersPerDay: ai.estimatedWaterLossLitersPerDay,
        locationDescription: address,
      });

      // 3. Generate new Incident ID
      const newId = `AQ-${Math.floor(1000 + Math.random() * 9000)}`;

      const zoneNameMap: Record<string, string> = {
        'zone-14': 'Sector 14 (Central District)',
        'zone-07': 'Sector 7 (East Tech Hub)',
        'zone-22': 'Sector 22 (South Residential)',
        'zone-09': 'Sector 9 (Industrial Corridor)',
        'zone-03': 'Sector 3 (North Ridge)',
      };

      const zoneCoordsMap: Record<string, [number, number]> = {
        'zone-14': [28.6212, 77.2142],
        'zone-07': [28.6320, 77.2350],
        'zone-22': [28.5980, 77.1980],
        'zone-09': [28.5830, 77.2420],
        'zone-03': [28.6480, 77.2020],
      };

      const coords = zoneCoordsMap[zoneId] || [28.6212, 77.2142];

      const newIncident: Incident = {
        id: newId,
        organizationId: 'org-city-corp',
        title: `${ai.category.replace('_', ' ')} near ${address.split(',')[0]}`,
        description,
        category: ai.category,
        severity: ai.severity,
        status: 'OPEN',
        priorityScore: pb.score,
        priorityBreakdown: pb,
        aiAnalysis: ai,
        zoneId,
        zoneName: zoneNameMap[zoneId] || 'Sector 14',
        locationAddress: address,
        coordinates: coords,
        reportedBy: {
          name: reporterName,
          email: currentUser.email,
          phone: reporterPhone,
          isCitizen: true,
        },
        estimatedWaterLossLitersPerDay: ai.estimatedWaterLossLitersPerDay,
        waterSavedLiters: 0,
        flowRateLitersPerMin: ai.flowRateLitersPerMin,
        affectedPopulation: ai.affectedPopulationEstimate,
        criticalFacilities: ai.criticalInfrastructure ? [ai.criticalInfrastructure] : [],
        photos: [
          {
            id: `p-${newId}-1`,
            url: photoUrl,
            caption: 'Citizen report initial photo',
            uploadedAt: new Date().toISOString(),
            uploadedBy: reporterName,
            type: 'INITIAL_REPORT',
          },
        ],
        timeline: [
          {
            id: `tl-${newId}-1`,
            timestamp: 'Just now',
            title: 'Incident Reported',
            description: 'Resident submitted water infrastructure distress report.',
            actor: reporterName,
            actorRole: 'CITIZEN',
            stage: 'OPEN',
          },
          {
            id: `tl-${newId}-2`,
            timestamp: 'Just now',
            title: `AI Classification: ${ai.confidence}% Confidence`,
            description: `Tagged ${ai.category} with ${ai.severity} severity. Identified: ${ai.criticalInfrastructure || 'Municipal Zone'}.`,
            actor: 'AquaGrid AI Engine',
            actorRole: 'AI',
            stage: 'AI_CLASSIFICATION',
          },
          {
            id: `tl-${newId}-3`,
            timestamp: 'Just now',
            title: `Priority Index: ${pb.score}/100`,
            description: pb.explanation,
            actor: 'AquaGrid Priority Engine',
            actorRole: 'SYSTEM',
            stage: 'PRIORITY_CALCULATED',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      StorageService.addIncident(newIncident);
      setSubmissionResult(newIncident);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981'],
        });
      } catch {}
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-teal-950/40 via-slate-900 to-cyan-950/30 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-cyan-400" />
              <h1 className="text-xl font-extrabold text-white">
                AquaGrid Citizen Water Watch
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-300 max-w-lg">
              Report pipeline leaks, water shortages, sewer drainage issues, or contamination. Every report is classified by AI in real-time, assigned a priority index, and routed directly to municipal field engineers.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setActiveTab('REPORT')}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'REPORT'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Report Water Issue
            </button>
            <button
              onClick={() => setActiveTab('MY_REPORTS')}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'MY_REPORTS'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Reports ({myReports.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'REPORT' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Reporting Form */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Send className="h-4 w-4 text-cyan-400" />
              <span>Report Water or Drainage Incident</span>
            </h2>

            {/* Quick Presets */}
            <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>Quick Hackathon Demo Presets:</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPreset(
                      'Water is continuously coming out of the road near the hospital since yesterday.',
                      'PIPELINE_LEAK',
                      'Avenue 4, Opp. City Hospital Emergency Ward, Sector 14'
                    )
                  }
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-cyan-300 border border-slate-800 hover:border-cyan-600 transition"
                >
                  🔴 Hospital Pipeline Leak (AQ-1024 Flow)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPreset(
                      'Tap water is brown and smelling like sewage for 2 days in Sector 9 colony.',
                      'WATER_CONTAMINATION',
                      'Block C, Industrial Worker Colony, Sector 9'
                    )
                  }
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-rose-300 border border-slate-800 hover:border-rose-600 transition"
                >
                  ☣️ Water Contamination Alert
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPreset(
                      'Severe street flooding and storm drain backflow blocking main junction.',
                      'FLOODING',
                      'Junction 7, Sector 22 South Market'
                    )
                  }
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-amber-300 border border-slate-800 hover:border-amber-600 transition"
                >
                  🌊 Stormwater Flooding
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              {/* Issue Type */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Issue Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="PIPELINE_LEAK">Pipeline Leak (Pressurized burst / seepage)</option>
                  <option value="WATER_SHORTAGE">Water Shortage (No supply / low pressure)</option>
                  <option value="FLOODING">Flooding / Severe Waterlogging</option>
                  <option value="DRAINAGE_PROBLEM">Drainage / Clogged Sewer</option>
                  <option value="WATER_CONTAMINATION">Water Contamination (Smell / color)</option>
                  <option value="TANK_OVERFLOW">Overhead Tank Overflow</option>
                  <option value="INFRASTRUCTURE_DAMAGE">Damaged Pipe / Valve / Asset</option>
                  <option value="MAINTENANCE">General Maintenance</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">
                    Description of Issue
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleVoiceInput('en')}
                      disabled={isRecordingVoice}
                      className="flex items-center gap-1 rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-cyan-300 border border-slate-700 transition"
                      title="Simulate Voice Input in English"
                    >
                      <Mic className={`h-3 w-3 ${isRecordingVoice ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
                      <span>{isRecordingVoice ? 'Transcribing...' : '🎙️ Voice (EN)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVoiceInput('hi')}
                      disabled={isRecordingVoice}
                      className="flex items-center gap-1 rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-amber-300 border border-slate-700 transition"
                      title="Simulate Voice Input in Hindi"
                    >
                      <Mic className="h-3 w-3 text-amber-400" />
                      <span>🎙️ Voice (हिंदी)</span>
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the severity, duration, and exact spot..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Location & Zone */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Municipal Zone
                  </label>
                  <select
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="zone-14">Sector 14 (Central District)</option>
                    <option value="zone-07">Sector 7 (East Tech Hub)</option>
                    <option value="zone-22">Sector 22 (South Residential)</option>
                    <option value="zone-09">Sector 9 (Industrial Corridor)</option>
                    <option value="zone-03">Sector 3 (North Ridge & Reservoirs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Street Address / Landmark
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Near City Hospital Gate"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload / Preset */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Attach Photo Evidence
                </label>
                <div className="flex gap-3 items-center">
                  <img
                    src={photoUrl}
                    alt="Upload Preview"
                    className="h-20 w-28 rounded-lg object-cover border border-slate-800 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <select
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-300"
                    >
                      <option value={LEAK_BEFORE_PHOTO}>
                        Generated Asset: High-Pressure Pipeline Rupture (AQ-1024)
                      </option>
                      <option value="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80">
                        Camera Photo 2: Water bubbling through asphalt (Leak)
                      </option>
                      <option value="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80">
                        Camera Photo 3: Street flooded with brown runoff
                      </option>
                      <option value="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80">
                        Camera Photo 4: Open stormwater drain clogged with debris
                      </option>
                    </select>

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] text-cyan-300 font-semibold border border-slate-700 flex items-center gap-1 transition">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Your Photo / Camera</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <span className="text-[10px] text-slate-500">supports JPG/PNG/WebP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Phone for SMS Updates
                  </label>
                  <input
                    type="text"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-500 py-3 text-sm font-extrabold text-white shadow-lg shadow-cyan-950 hover:from-cyan-500 hover:to-teal-400 transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isAnalyzing
                    ? 'AI Classifying & Calculating Priority...'
                    : 'Submit Incident & Trigger AI Processing'}
                </span>
              </button>
            </form>
          </div>

          {/* Side: Submission Success / Live AI Analysis Feedback */}
          <div className="space-y-4">
            {submissionResult ? (
              <div className="rounded-2xl border border-emerald-500/60 bg-emerald-950/30 p-5 shadow-xl space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="h-6 w-6" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Incident Successfully Reported
                    </h3>
                    <div className="font-mono text-xs font-bold text-cyan-400">
                      Tracking Code: {submissionResult.id}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-2 text-xs">
                  <div className="text-[11px] font-bold uppercase text-cyan-400 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Analysis Result</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[10px]">Category:</span>
                      <div className="font-bold">{submissionResult.category.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Severity:</span>
                      <div className="font-bold text-rose-400">{submissionResult.severity}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">AI Confidence:</span>
                      <div className="font-bold text-cyan-300">{submissionResult.aiAnalysis?.confidence}%</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Priority Score:</span>
                      <div className="font-bold text-amber-300">{submissionResult.priorityScore}/100</div>
                    </div>
                  </div>

                  {submissionResult.criticalFacilities?.[0] && (
                    <div className="text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-900/40">
                      🚨 Critical Facility Impact: {submissionResult.criticalFacilities[0]}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-300">
                    Est. Loss: <b>{submissionResult.estimatedWaterLossLitersPerDay.toLocaleString()} L/day</b>
                  </div>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed">
                  Status: <b>OPEN</b>. Notification has been broadcast to the Municipal Operations Command Center and nearest field team.
                </div>

                <button
                  onClick={() => setActiveTab('MY_REPORTS')}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2 text-xs font-semibold text-cyan-300 hover:bg-slate-700"
                >
                  <span>Track in My Reports</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-4 text-xs">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Shield className="h-4 w-4" />
                  <span>How AquaGrid Protects Your City</span>
                </div>
                <div className="space-y-2.5 text-slate-400 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center shrink-0 border border-cyan-800 text-[10px]">
                      1
                    </span>
                    <p>
                      <b className="text-slate-200">AI Instant Triage:</b> Unstructured descriptions are parsed into structured data with estimated flow rate and loss.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center shrink-0 border border-cyan-800 text-[10px]">
                      2
                    </span>
                    <p>
                      <b className="text-slate-200">Priority Engine:</b> Factors hospital proximity, population density, and leak duration (0–100 score).
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center shrink-0 border border-cyan-800 text-[10px]">
                      3
                    </span>
                    <p>
                      <b className="text-slate-200">Field Dispatch:</b> Dispatched to rapid response crews with automated tracking and before/after photo verification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* "My Reports" Tracking View */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">My Submitted Reports</h2>
            <span className="text-xs text-slate-400">{myReports.length} incidents logged</span>
          </div>

          <div className="space-y-3">
            {myReports.map((inc) => {
              const isResolved = inc.status === 'RESOLVED';
              return (
                <div
                  key={inc.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        {inc.id}
                      </span>
                      <span className="font-bold text-white text-xs">{inc.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded self-start sm:self-auto ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : inc.status === 'IN_PROGRESS'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  {/* Progress Tracker Stepper */}
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-semibold pt-1">
                    <div className="rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 p-1">
                      1. Reported
                    </div>
                    <div
                      className={`rounded p-1 border ${
                        inc.status !== 'OPEN'
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      2. Assigned
                    </div>
                    <div
                      className={`rounded p-1 border ${
                        inc.status === 'IN_PROGRESS' || isResolved
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      3. Inspecting
                    </div>
                    <div
                      className={`rounded p-1 border ${
                        isResolved
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      4. Resolved
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{inc.locationAddress}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {inc.assignedTeamName && (
                        <span className="text-slate-300">
                          Handled by: <b>{inc.assignedTeamName}</b>
                        </span>
                      )}
                      {onSelectIncident && (
                        <button
                          onClick={() => onSelectIncident(inc)}
                          className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-cyan-400 hover:text-white"
                        >
                          View Full Details →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
