import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Cpu, MessageSquare, Clock, Bot, Activity } from 'lucide-react';
import { AIWorkspaceChat } from './components/AIWorkspaceChat';

// Base user memory profile facts
const DEFAULT_MEMORIES: string[] = [
  'User operates primarily in software engineering, with key focuses on full-stack React and Node ecosystems',
  'Creator prefers structured day layouts where deep analytical tasks are slotted in chronological mornings',
  'Daily productivity threshold is strictly governed by physical bio-metric thermodynamics'
];

export default function App() {
  // Personal assistant memories synced with storage
  const [memory, setMemory] = useState<string[]>(() => {
    const saved = localStorage.getItem('omni_memories') || localStorage.getItem('aetheris_memories');
    return saved ? JSON.parse(saved) : DEFAULT_MEMORIES;
  });

  // Real-time dynamic system clock
  const [liveTime, setLiveTime] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('omni_memories', JSON.stringify(memory));
  }, [memory]);

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setLiveTime(date.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Memory utilities
  const handleAddMemory = (pref: string) => {
    // Avoid double entries
    if (memory.some(m => m.toLowerCase().trim() === pref.toLowerCase().trim())) return;
    setMemory(prev => [...prev, pref]);
  };

  const handleClearMemory = () => {
    setMemory([]);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-300 flex flex-col font-sans select-none antialiased relative overflow-x-hidden">
      {/* Immersive glow background mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e293b_0%,transparent_70%)] opacity-50 z-0 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40 z-10"></div>

      {/* Immersive UI Header Style */}
      <header className="border-b border-white/10 pb-4 flex justify-between items-end relative z-10 mx-6 mt-6 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]"></div>
            <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 uppercase font-bold">OMNI CYBERNETIC WORKSTATION // V1.5.0</span>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-white mb-0 leading-none">
            OMNI <span className="text-cyan-500 font-bold italic">AI</span>
          </h1>
        </div>

        <div className="text-right font-mono text-[11px] leading-tight flex flex-col items-end">
          <div className="text-cyan-400 tracking-wider">OMNI CLOCK: {liveTime || '00:00:00'}</div>
          <div className="opacity-40 mt-1 uppercase">COGNITION FLOW: ACTIVE</div>
        </div>
      </header>

      {/* Primary Workspace screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 relative z-10 flex flex-col justify-start">
        <div className="animate-fade-in space-y-5 flex-1">
          <div className="p-4 rounded-xl bg-white/2 border border-white/5">
            <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-widest uppercase block">[00] CORE DIRECTIVES SYSTEM</span>
            <h2 className="text-md font-bold text-white uppercase tracking-wider font-mono">Omni General Intelligence Online</h2>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Designed as a loyal, analytical digital companion to deconstruct complex human concepts, refine textual draft documents, and compose structured project outlines. Personal memory parameters are automatically applied.
            </p>
          </div>
          
          <AIWorkspaceChat 
            memory={memory} 
            onAddMemory={handleAddMemory} 
            onClearMemory={handleClearMemory} 
          />
        </div>
      </main>

      {/* Futuristic status bar footer */}
      <footer className="border-t border-white/10 bg-slate-950/20 px-6 py-3 shrink-0 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 select-none relative z-10">
        <div className="flex items-center gap-4">
          <span>LATENCY: 1ms</span>
          <span className="hidden md:inline text-white/10">|</span>
          <span className="animate-pulse text-cyan-400 uppercase">
            Personal assistant ready // context aligned
          </span>
        </div>
        <div className="mt-1 sm:mt-0 text-[10px] text-slate-600 tracking-wider">
          ENCRYPTION: SECURE RSA // AGENT IDENTITY STRETCH
        </div>
      </footer>
    </div>
  );
}
