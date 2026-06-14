import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';
import { OptimizationResult } from '../types';

interface TerminalOutputProps {
  data: OptimizationResult;
}

export function TerminalOutput({ data }: TerminalOutputProps) {
  const [copied, setCopied] = useState(false);

  // Helper to format raw text matching the exact requested output layout format
  const formatRawTextOutput = () => {
    let text = `[SYSTEM AWAKENING]\n> ${data.systemAwakening}\n\n`;
    text += `[BIO-METRIC SCAN]\n> ${data.biometricScan}\n\n`;
    text += `[THE MASTER PLAN]\n`;
    
    data.masterPlan.forEach((slot) => {
      text += `> ${slot.startTime} - ${slot.endTime}: [${slot.title}]\n`;
    });
    
    text += `\n[INTELLECTUAL OBSERVATION]\n> ${data.intellectualObservation}`;
    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatRawTextOutput());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative font-mono rounded-xl bg-black/60 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[9px] font-mono tracking-wider font-bold text-cyan-400 select-none uppercase">
            AETHERIS_STREAMING_LOGS.txt
          </span>
        </div>
        <button
          id="copy-terminal-btn"
          type="button"
          onClick={copyToClipboard}
          className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-cyan-400 transition"
          title="Secure diagnostic dump to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">[COPIED]</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>[COPY DUMP]</span>
            </>
          )}
        </button>
      </div>

      {/* Renders exact matching structured layout required by USER prompt */}
      <div className="p-4 space-y-4 text-xs text-slate-300 leading-relaxed overflow-x-auto select-all max-h-96">
        <div>
          <span className="text-cyan-400 font-mono font-bold tracking-widest">[SYSTEM AWAKENING]</span>
          <p className="mt-1 pl-4 border-l-2 border-cyan-500/20 text-slate-400 italic font-mono text-[11px]">
            &gt; {data.systemAwakening}
          </p>
        </div>

        <div>
          <span className="text-cyan-400 font-mono font-bold tracking-widest">[BIO-METRIC SCAN]</span>
          <p className="mt-1 pl-4 border-l-2 border-cyan-500/20 text-slate-400 italic font-mono text-[11px]">
            &gt; {data.biometricScan}
          </p>
        </div>

        <div>
          <span className="text-cyan-400 font-mono font-bold tracking-widest">[THE MASTER PLAN]</span>
          <div className="mt-1 pl-4 border-l-2 border-cyan-500/20 space-y-1">
            {data.masterPlan.map((slot, i) => (
              <p key={i} className="text-slate-400 italic font-mono text-[11px]">
                &gt; {slot.startTime} - {slot.endTime}: <strong className="text-white not-italic">[{slot.title}]</strong>
              </p>
            ))}
          </div>
        </div>

        <div>
          <span className="text-cyan-400 font-mono font-bold tracking-widest">[INTELLECTUAL OBSERVATION]</span>
          <p className="mt-1 pl-4 border-l-2 border-cyan-500/20 text-slate-400 italic font-mono text-[11px]">
            &gt; {data.intellectualObservation}
          </p>
        </div>
      </div>
    </div>
  );
}
