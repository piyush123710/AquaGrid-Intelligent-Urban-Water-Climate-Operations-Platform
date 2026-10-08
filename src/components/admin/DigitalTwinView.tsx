import React, { useState } from 'react';
import {
  Activity,
  Droplets,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Radio,
  Power,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { HERO_COMMAND_CENTER } from '../../assets/imageConstants';

export const DigitalTwinView: React.FC = () => {
  const [valveThrottled, setValveThrottled] = useState(false);
  const [pressureBar, setPressureBar] = useState(6.8);
  const [flowRateLpm, setFlowRateLpm] = useState(14.2);
  const [soilMoisture, setSoilMoisture] = useState(96);
  const [acousticHissHz, setAcousticHissHz] = useState(240);

  const toggleEmergencyValve = () => {
    if (!valveThrottled) {
      setValveThrottled(true);
      setPressureBar(1.9);
      setFlowRateLpm(0.0);
      setSoilMoisture(45);
      setAcousticHissHz(20);
    } else {
      setValveThrottled(false);
      setPressureBar(6.8);
      setFlowRateLpm(14.2);
      setSoilMoisture(96);
      setAcousticHissHz(240);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Visual Card with Command Center Image */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="relative h-48 sm:h-56 w-full">
          <img
            src={HERO_COMMAND_CENTER}
            alt="AquaGrid Digital Twin Command Center"
            className="h-full w-full object-cover opacity-45 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  SCADA Telemetry & Urban Digital Twin
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">
                Sector 14 Feeder Main (PIPE-102) Live Hydraulic Twin
              </h2>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                Virtual hydraulic clone synchronized with IoT acoustic correlators and automated pressure reducing valves (PRVs).
              </p>
            </div>

            <button
              onClick={toggleEmergencyValve}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-lg shrink-0 ${
                valveThrottled
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950'
                  : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-950 animate-pulse'
              }`}
            >
              <Power className="h-4 w-4" />
              <span>
                {valveThrottled ? 'Valve V-14 Throttled (Flow Halted)' : 'Actuate Emergency Valve V-14 (Shutoff)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Live SCADA Telemetry Readings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pressure Gauge */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Line Pressure</span>
            <Gauge className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {pressureBar.toFixed(1)} <span className="text-sm font-semibold text-cyan-400">bar</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[10px]">
            <span
              className={`h-2 w-2 rounded-full ${
                pressureBar > 5 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <span className={pressureBar > 5 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {pressureBar > 5 ? 'SURGE THRESHOLD EXCEEDED' : 'NORMAL RANGE (2-4 bar)'}
            </span>
          </div>
        </div>

        {/* Flow Velocity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Instant Flow Rate</span>
            <Droplets className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {flowRateLpm.toFixed(1)} <span className="text-sm font-semibold text-cyan-400">L/min</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            Estimated daily rate: <b>{Math.round(flowRateLpm * 60 * 24).toLocaleString()} L/day</b>
          </div>
        </div>

        {/* Acoustic Correlator Frequency */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Acoustic Frequency</span>
            <Radio className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-300">
            {acousticHissHz} <span className="text-sm font-semibold text-amber-400">Hz</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            {acousticHissHz > 100 ? 'Rupture hiss signature detected' : 'Quiet baseline'}
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Soil Saturation</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-300">
            {soilMoisture}%
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            {soilMoisture > 80 ? 'Sub-surface pooling active' : 'Normal dry trench'}
          </div>
        </div>
      </div>

      {/* Hydraulic Valve Chamber Map Simulation */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Automated SCADA Pressure Reduction Scheme (PRV)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Telemetry Gateway Node SN-14</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-300">
            <div>
              <span className="font-bold text-white">Valve Chamber VC-14 (Hospital Loop)</span>
              <p className="text-[11px] text-slate-400">
                Connected via Modbus TCP to Metropolitan Water SCADA Central Hub
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Actuator Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                  valveThrottled
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : 'bg-rose-950 text-rose-300 border-rose-700'
                }`}
              >
                {valveThrottled ? 'ISOLATED / CLOSED' : 'PRESSURIZED / OPEN'}
              </span>
            </div>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-500 ${
                valveThrottled ? 'w-2/12 bg-emerald-500' : 'w-10/12 bg-rose-500 animate-pulse'
              }`}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Inlet Pressure: 7.2 bar</span>
            <span>Target Throttling Setpoint: 2.0 bar</span>
            <span>Outlet Discharge: {pressureBar.toFixed(1)} bar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
