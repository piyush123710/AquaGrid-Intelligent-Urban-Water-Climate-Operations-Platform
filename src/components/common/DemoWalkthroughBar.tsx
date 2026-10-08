import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  Shield,
  HardHat,
  User,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { StorageService } from '../../services/storage';

interface DemoWalkthroughBarProps {
  onOpenIncidentDetail: (incidentId: string) => void;
}

export const DemoWalkthroughBar: React.FC<DemoWalkthroughBarProps> = ({ onOpenIncidentDetail }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isExpanded, setIsExpanded] = useState(true);

  const STEPS = [
    {
      num: 1,
      title: 'Citizen Reports Leak',
      desc: 'Dr. Alok Verma reports burst pipeline near Hospital',
      role: 'CITIZEN' as const,
      actionLabel: 'Go to Citizen Portal',
      exec: () => {
        StorageService.switchUserByRole('CITIZEN');
      },
    },
    {
      num: 2,
      title: 'AI Classification & Priority 94/100',
      desc: 'AI flags Critical Severity & 18,000 L/d loss near Hospital',
      role: 'ADMIN' as const,
      actionLabel: 'Inspect AI Triage (AQ-1024)',
      exec: () => {
        StorageService.switchUserByRole('ADMIN');
        onOpenIncidentDetail('AQ-1024');
      },
    },
    {
      num: 3,
      title: 'Admin Dispatches Field Team 7',
      desc: 'Commissioner assigns Lead Worker Rajesh Sharma',
      role: 'ADMIN' as const,
      actionLabel: 'Assign Field Team 7',
      exec: () => {
        StorageService.assignIncident('AQ-1024', 'team-07', 'usr-worker-01');
        StorageService.switchUserByRole('ADMIN');
      },
    },
    {
      num: 4,
      title: 'Worker Inspects with Before Photo',
      desc: 'Team 7 arrives on site & captures breach baseline',
      role: 'FIELD_WORKER' as const,
      actionLabel: 'Open Worker App & Start Work',
      exec: () => {
        StorageService.switchUserByRole('FIELD_WORKER');
        StorageService.startInspection(
          'AQ-1024',
          'Acoustic leak correlator deployed. Excavated 1.2m pit to expose 600mm burst joint.',
          '/src/assets/images/pipe_rupture_leak_1791438929722.jpg'
        );
      },
    },
    {
      num: 5,
      title: 'Worker Installs Clamp & After Photo',
      desc: 'Stainless split sleeve clamped; pressure tested at 6.2 bar',
      role: 'FIELD_WORKER' as const,
      actionLabel: 'Execute Repair & AI Check',
      exec: () => {
        StorageService.switchUserByRole('FIELD_WORKER');
        StorageService.submitResolution('AQ-1024', {
          beforePhotoUrl: '/src/assets/images/pipe_rupture_leak_1791438929722.jpg',
          afterPhotoUrl: '/src/assets/images/pipe_repaired_clamp_1791438948410.jpg',
          repairNotes: 'Installed 600mm heavy ductile iron split sleeve clamp with Buna-N gasket. Pressurized to 6.2 bar for 20 mins. Surface backfilled and dried.',
          aiVerificationConfidence: 95,
          aiVerificationResult: 'VERIFIED_RESOLVED',
          aiVerificationNotes: 'AI Vision verified: Pipe rupture sealed with mechanical repair clamp. Zero weeping detected; surface dry.',
        });
      },
    },
    {
      num: 6,
      title: 'AI Verification & Water Loss Arrested',
      desc: 'Incident RESOLVED! 18,000 L/day credited to city savings',
      role: 'ADMIN' as const,
      actionLabel: 'View Impact on Dashboard',
      exec: () => {
        StorageService.switchUserByRole('ADMIN');
        try {
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#10b981', '#3b82f6'],
          });
        } catch {}
      },
    },
  ];

  const handleStepClick = (index: number) => {
    setCurrentStep(index + 1);
    STEPS[index].exec();
  };

  const handleNextStep = () => {
    const next = currentStep < STEPS.length ? currentStep + 1 : 1;
    setCurrentStep(next);
    STEPS[next - 1].exec();
  };

  return (
    <aside aria-label="Interactive demo tour" className="border-b border-cyan-800/60 bg-gradient-to-r from-cyan-950/80 via-slate-950 to-blue-950/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 font-bold">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="font-extrabold text-white flex items-center gap-2">
              <span>Interactive 6-Step Hackathon Workflow Tour</span>
              <span className="rounded bg-cyan-900/80 px-1.5 py-0.2 text-[10px] text-cyan-300 font-semibold border border-cyan-700/60">
                AQ-1024 Flow
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Click any step below to simulate the end-to-end lifecycle in real-time
            </p>
          </div>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {STEPS.map((step, idx) => (
            <button
              key={step.num}
              onClick={() => handleStepClick(idx)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition border ${
                currentStep === step.num
                  ? 'border-cyan-400 bg-cyan-600 text-white shadow-sm shadow-cyan-950'
                  : currentStep > step.num
                  ? 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                  currentStep === step.num
                    ? 'bg-slate-950 text-cyan-300'
                    : currentStep > step.num
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step.num}
              </span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>

        {/* Next Step Shortcut Button */}
        <button
          onClick={handleNextStep}
          className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md transition shrink-0 self-end md:self-auto"
        >
          <span>{currentStep === 6 ? 'Restart Tour (Step 1)' : `Run Next Step (${currentStep + 1})`}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};
