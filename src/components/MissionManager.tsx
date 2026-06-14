import React, { useState } from 'react';
import { ListTodo, Plus, Trash2, Clock } from 'lucide-react';
import { Mission } from '../types';

interface MissionManagerProps {
  missions: Mission[];
  onAddMission: (mission: Omit<Mission, 'id'>) => void;
  onRemoveMission: (id: string) => void;
}

export function MissionManager({ missions, onAddMission, onRemoveMission }: MissionManagerProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(45);
  const [priority, setPriority] = useState<'critical' | 'standard' | 'utility'>('standard');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onAddMission({ title, duration, priority });
    setTitle('');
    setIsOpen(false);
  };

  const getPriorityBadge = (p: 'critical' | 'standard' | 'utility') => {
    switch (p) {
      case 'critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'standard':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'utility':
        return 'text-slate-400 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
          <h3 className="font-mono text-[10px] tracking-[0.2em] font-bold uppercase text-cyan-400">
            [03] ACTIVE MISSION POOL
          </h3>
        </div>
        <button
          id="toggle-add-mission-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 font-mono text-[9px] text-cyan-400 hover:text-cyan-300 transition duration-200 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10"
        >
          <Plus className="w-3.5 h-3.5" />
          {isOpen ? 'CANCEL SEQUENCE' : 'LAUNCH MISSION'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-lg bg-black/40 border border-white/10 space-y-3 animate-fade-in">
          <div>
            <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1 tracking-wider">Mission Objective</label>
            <input
              id="mission-title-input"
              type="text"
              required
              placeholder="e.g. Optimize Database Indexes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-mono bg-black/40 border border-white/10 rounded-md p-2 text-slate-200 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1 tracking-wider">Time Target</label>
              <select
                id="mission-duration-select"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full text-xs bg-black/50 border border-white/10 rounded-md p-2 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes (1h)</option>
                <option value="90">90 Minutes (1.5h)</option>
                <option value="120">120 Minutes (2h)</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1 tracking-wider">Hazard/Priority</label>
              <select
                id="mission-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs bg-black/50 border border-white/10 rounded-md p-2 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="critical">⚡ Critical Sector</option>
                <option value="standard">⚙️ Standard Operation</option>
                <option value="utility">🔧 Low-Cost Utility</option>
              </select>
            </div>
          </div>

          <button
            id="save-mission-btn"
            type="submit"
            className="w-full py-2 bg-cyan-950/40 border border-cyan-400/40 hover:border-cyan-400/80 text-cyan-400 text-xs font-mono font-bold hover:bg-cyan-950/80 rounded-md transition"
          >
            BUFFER MISSION OBJECTIVE
          </button>
        </form>
      )}

      {missions.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
          <ListTodo className="w-8 h-8 mx-auto text-slate-700 mb-1" />
          <p className="font-mono text-[9px] tracking-wider text-slate-500">MISSION REGISTER EMPTY</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {missions.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white/2 border border-white/5 hover:border-white/20 transition-all duration-350 group"
            >
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded uppercase ${getPriorityBadge(m.priority)}`}>
                    {m.priority}
                  </span>
                  <span className="text-xs font-medium text-slate-300 font-mono truncate">{m.title}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-[9px] text-slate-400">{m.duration} cycles (mins)</span>
                </div>
              </div>
              <button
                id={`remove-mission-${m.id}`}
                type="button"
                onClick={() => onRemoveMission(m.id)}
                className="text-slate-600 hover:text-rose-400 p-1 rounded-md hover:bg-white/5 transition flex-shrink-0"
                title="Discard mission"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
