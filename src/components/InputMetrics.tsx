import React from 'react';
import { Activity, Zap } from 'lucide-react';

interface InputMetricsProps {
  energyLevel: number;
  setEnergyLevel: (level: number) => void;
}

export function InputMetrics({ energyLevel, setEnergyLevel }: InputMetricsProps) {
  // Compute cybernetic secondary diagnostics
  const synapticLatency = Math.max(12, Math.round(150 - energyLevel * 1.3));
  const focusBufferRatio = Math.round((energyLevel * 0.9) + 5);
  const recoveryCoefficient = Math.round((100 - energyLevel) * 0.12 * 10) / 10;
  
  // Get energy color scheme
  const getEnergyColor = () => {
    if (energyLevel < 40) return {
      text: 'text-amber-500',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
      border: 'border-white/10 hover:border-amber-500/30',
      fill: 'bg-amber-500',
      label: 'AMBER DEBRIS: RECHARGE REQUIRED',
      ringHex: '#f59e0b',
      shadowColor: 'rgba(245, 158, 11, 0.3)',
      status: 'SUB-OPTIMAL'
    };
    if (energyLevel < 75) return {
      text: 'text-cyan-400',
      glow: 'shadow-[0_0_15px_rgba(34,211,238,0.5)]',
      border: 'border-white/10 hover:border-cyan-500/30',
      fill: 'bg-cyan-400',
      label: 'CYAN STEADY: STANDARD OPERATION',
      ringHex: '#22d3ee',
      shadowColor: 'rgba(34, 211, 238, 0.3)',
      status: 'STABLE INTERNAL CORE'
    };
    return {
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(52,211,153,0.5)]',
      border: 'border-white/10 hover:border-emerald-500/30',
      fill: 'bg-emerald-400',
      label: 'OVERCHARGED CELL: HYPER THROUGHPUT',
      ringHex: '#34d399',
      shadowColor: 'rgba(52, 211, 153, 0.3)',
      status: 'MAXIMUM CAPACITANCE'
    };
  };

  const currentTheme = getEnergyColor();

  // SVG parameters for progress ring
  const strokeRadius = 40;
  const strokeCircumference = 2 * Math.PI * strokeRadius; // ~251.3
  const strokeOffset = strokeCircumference - (strokeCircumference * energyLevel) / 100;

  return (
    <div className={`p-5 rounded-xl bg-white/5 border ${currentTheme.border} backdrop-blur-md transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
          <h3 className="font-mono text-[10px] tracking-[0.2em] font-bold uppercase text-cyan-400">
            [01] BIO-METRIC SCANNER
          </h3>
        </div>
        <span className="font-mono text-[9px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
          SCANNER ACTIVE
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-5 items-center">
        {/* Immersive circular gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
          <svg className="absolute w-full h-full rotate-[-90deg]">
            <circle
              cx="56"
              cy="56"
              r={strokeRadius}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r={strokeRadius}
              stroke={currentTheme.ringHex}
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={strokeCircumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
              style={{
                filter: `drop-shadow(0 0 6px ${currentTheme.shadowColor})`
              }}
            />
          </svg>
          <div className="text-center z-10">
            <span className="block text-2xl font-bold text-white tracking-tighter">
              {energyLevel}%
            </span>
            <span className="block font-mono text-[8px] text-slate-400 tracking-wider">
              CAPACITY
            </span>
          </div>
        </div>

        {/* Right controls side-by-side */}
        <div className="flex-grow w-full space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px] text-slate-400">Biological Core Status:</span>
              <span className={`font-mono text-[11px] font-bold ${currentTheme.text}`}>
                {currentTheme.status}
              </span>
            </div>
            
            <input
              id="energy-slider"
              type="range"
              min="10"
              max="100"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            <div className="flex justify-between text-[9px] font-mono mt-0.5 text-slate-500">
              <span>MIN [10%]</span>
              <span className={`${currentTheme.text} uppercase`}>{currentTheme.label}</span>
              <span>MAX [100%]</span>
            </div>
          </div>

          {/* Core diagnostics info grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
            <div className="bg-white/2 p-2 rounded border border-white/5">
              <span className="block font-mono text-[8px] text-slate-500 uppercase">SYNAP_VECT</span>
              <span className="block font-sans text-[11px] font-medium text-slate-300">
                {(energyLevel * 12 + 200).toLocaleString()} Hz
              </span>
            </div>
            <div className="bg-white/2 p-2 rounded border border-white/5">
              <span className="block font-mono text-[8px] text-slate-500 uppercase">SYS_LATENCY</span>
              <span className="block font-sans text-[11px] font-medium text-slate-300">
                {synapticLatency} ms
              </span>
            </div>
            <div className="bg-white/2 p-2 rounded border border-white/5">
              <span className="block font-mono text-[8px] text-slate-500 uppercase">REST_COEFF</span>
              <span className="block font-sans text-[11px] font-medium text-slate-300">
                {recoveryCoefficient}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cybernetic advisory prompt */}
      <div className="mt-4 flex items-start gap-2.5 text-[11px] bg-white/2 p-3 rounded-lg border border-white/5 text-slate-300">
        <Zap className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${currentTheme.text}`} />
        <div className="font-mono leading-relaxed text-slate-400 text-[10px]">
          {energyLevel < 40 ? (
            <p>
              <strong className="text-amber-500 font-bold uppercase tracking-wide">METAB_ALERT:</strong> Mitochondria levels critical: thermal stasis override activated. System strategy forces cooling stasis periods.
            </p>
          ) : energyLevel < 75 ? (
            <p>
              <strong className="text-cyan-400 font-bold uppercase tracking-wide">OPS_STEADY:</strong> Stable focus allocation buffers ready. Tactical slots aligned to buffer temporal friction gaps.
            </p>
          ) : (
            <p>
              <strong className="text-emerald-400 font-bold uppercase tracking-wide">MAX_POTENCY:</strong> Overcharged focus capacity identified. Deep back-to-back cognitive sequences permitted without buffer stasis.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
