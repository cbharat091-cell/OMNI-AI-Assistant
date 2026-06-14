import React, { useState, useEffect } from 'react';
import { AIWorkspaceChat } from './components/AIWorkspaceChat';

const DEFAULT_MEMORIES: string[] = [
  'User operates primarily in software engineering, with key focuses on full-stack React and Node ecosystems',
  'Creator prefers structured day layouts where deep analytical tasks are slotted in chronological mornings',
  'Daily productivity threshold is strictly governed by physical bio-metric thermodynamics'
];

export default function App() {
  const [memory, setMemory] = useState<string[]>(() => {
    const saved = localStorage.getItem('omni_memories') || localStorage.getItem('aetheris_memories');
    return saved ? JSON.parse(saved) : DEFAULT_MEMORIES;
  });

  useEffect(() => {
    localStorage.setItem('omni_memories', JSON.stringify(memory));
  }, [memory]);

  const handleAddMemory = (pref: string) => {
    if (memory.some(m => m.toLowerCase().trim() === pref.toLowerCase().trim())) return;
    setMemory(prev => [...prev, pref]);
  };

  const handleClearMemory = () => {
    setMemory([]);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-300 flex flex-col justify-center items-center font-sans select-none antialiased relative overflow-hidden">
      
      {/* Immersive deep cyber space glow background mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#091d30_0%,#02040a_100%)] z-0 pointer-events-none"></div>
      
      {/* Decorative cyber grid overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-15 pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Primary Voice Workspace */}
      <main className="w-full max-w-4xl px-4 py-8 relative z-10 flex flex-col items-center justify-center">
        <div className="w-full animate-fade-in">
          <AIWorkspaceChat 
            memory={memory} 
            onAddMemory={handleAddMemory} 
            onClearMemory={handleClearMemory} 
          />
        </div>
      </main>

    </div>
  );
}
