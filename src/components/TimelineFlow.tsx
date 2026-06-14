import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, HeartPulse, Shield, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { PlanSlot } from '../types';

interface TimelineFlowProps {
  plan: PlanSlot[];
}

export function TimelineFlow({ plan }: TimelineFlowProps) {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getSlotDetails = (type: PlanSlot['type']) => {
    switch (type) {
      case 'calendar':
        return {
          icon: Calendar,
          colorText: 'text-cyan-400',
          colorBorder: 'border-cyan-500/20',
          colorBg: 'bg-white/5',
          glowDot: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]',
          lineColor: 'border-cyan-500/30',
          badge: 'FIXED CALENDAR SECTOR',
        };
      case 'task':
        return {
          icon: Star,
          colorText: 'text-cyan-400',
          colorBorder: 'border-cyan-500/20',
          colorBg: 'bg-white/5',
          glowDot: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]',
          lineColor: 'border-cyan-500/30',
          badge: 'OPTIMIZED OBJECTIVE',
        };
      case 'rest':
        return {
          icon: HeartPulse,
          colorText: 'text-emerald-400',
          colorBorder: 'border-emerald-500/20',
          colorBg: 'bg-emerald-500/5',
          glowDot: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
          lineColor: 'border-emerald-500/30',
          badge: 'SYSTEM COOLING CELL',
        };
      case 'buffer':
        return {
          icon: Shield,
          colorText: 'text-amber-500',
          colorBorder: 'border-amber-500/20',
          colorBg: 'bg-amber-500/5',
          glowDot: 'bg-amber-500 shadow-[0_0_10px_#f59e0b]',
          lineColor: 'border-amber-500/30',
          badge: 'COOLING BUFFER ZONE',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <h4 className="font-mono text-[10px] tracking-[0.25em] font-bold text-cyan-400 uppercase">
          [THE MASTER PLAN & TARGET ALIGNMENTS]
        </h4>
        <span className="font-mono text-[9px] text-slate-500">
          {plan.length} SEQUENT PERIODS COMPILED
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {plan.map((slot, index) => {
          const details = getSlotDetails(slot.type);
          const IconComponent = details.icon;
          const isExpanded = !!expandedIndices[index];

          return (
            <div
              key={index}
              className={`flex gap-4 md:gap-6 border-l-2 ${details.lineColor} pl-6 py-2.5 relative transition-all duration-300 hover:bg-white/2 rounded-r-lg`}
            >
              {/* Glowing connection node absolute locator */}
              <div className={`absolute -left-1.5 top-5 w-2.5 h-2.5 rounded-full ${details.glowDot}`}></div>
              
              {/* Start/End Time block label */}
              <div className="w-24 md:w-28 font-mono text-[11px] text-cyan-400 flex-shrink-0 pt-0.5 leading-snug">
                {slot.startTime}
                <span className="block text-[9px] text-slate-500 mt-0.5">&gt; {slot.endTime}</span>
              </div>

              {/* Core description text */}
              <div className="flex-grow min-w-0">
                <div className="flex items-wrap items-center gap-2 mb-1">
                  <span className="text-white font-bold text-xs font-mono tracking-wide">{slot.title}</span>
                  <span className={`text-[8px] font-mono border px-1.5 py-0.2 rounded-md ${details.colorText} ${details.colorBorder}`}>
                    {details.badge}
                  </span>
                </div>
                
                <p className="text-[11.5px] text-slate-400 leading-snug mt-1">
                  {slot.rationale}
                </p>

                {/* Additional diagnostic node detail toggle view */}
                <div className="mt-2">
                  <button
                    id={`toggle-slot-rationale-${index}`}
                    type="button"
                    onClick={() => toggleExpand(index)}
                    className="flex items-center gap-1 font-mono text-[9px] text-slate-500 hover:text-cyan-400 transition"
                  >
                    <span>{isExpanded ? '[-] HIDE COGNITIVE REACTION' : '[+] REVEAL SYSTEM REACTION'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-2 rounded bg-black/50 border border-white/5 animate-fade-in">
                      <p className="text-[10px] font-mono text-slate-400 leading-normal">
                        AETHERIS INTERPRETATION: Energy density mapped to {slot.startTime}-{slot.endTime} temporal slot. Thermodynamics validated for optimization matrix #882-Alpha.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
