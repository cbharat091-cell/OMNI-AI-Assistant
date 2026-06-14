import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Clock, CalendarDays } from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarManagerProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onRemoveEvent: (id: string) => void;
}

export function CalendarManager({ events, onAddEvent, onRemoveEvent }: CalendarManagerProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:00 AM');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onAddEvent({ title, startTime, endTime });
    setTitle('');
    setIsOpen(false);
  };

  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
          <h3 className="font-mono text-[10px] tracking-[0.2em] font-bold uppercase text-cyan-400">
            [02] LOCKED TEMPORAL COMMITMENTS
          </h3>
        </div>
        <button
          id="toggle-add-calendar-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 font-mono text-[9px] text-cyan-400 hover:text-cyan-300 transition duration-200 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10"
        >
          <Plus className="w-3.5 h-3.5" />
          {isOpen ? 'CANCEL ACCESS' : 'LOCK SECTOR'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-lg bg-black/40 border border-white/10 space-y-3 animate-fade-in">
          <div>
            <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1 tracking-wider">Commitment Label</label>
            <input
              id="calendar-title-input"
              type="text"
              required
              placeholder="e.g. Sync: Team Core Protocol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-mono bg-black/40 border border-white/10 rounded-md p-2 text-slate-200 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1 tracking-wider">Start Sequence</label>
              <select
                id="calendar-start-select"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs bg-black/50 border border-white/10 rounded-md p-1.5 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const hour = i % 12 === 0 ? 12 : i % 12;
                  const ampm = i < 12 ? 'AM' : 'PM';
                  const label1 = `${String(hour).padStart(2, '0')}:00 ${ampm}`;
                  const label2 = `${String(hour).padStart(2, '0')}:30 ${ampm}`;
                  return (
                    <React.Fragment key={i}>
                      <option value={label1}>{label1}</option>
                      <option value={label2}>{label2}</option>
                    </React.Fragment>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1 tracking-wider">End Sequence</label>
              <select
                id="calendar-end-select"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs bg-black/50 border border-white/10 rounded-md p-1.5 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const hour = i % 12 === 0 ? 12 : i % 12;
                  const ampm = i < 12 ? 'AM' : 'PM';
                  const label1 = `${String(hour).padStart(2, '0')}:00 ${ampm}`;
                  const label2 = `${String(hour).padStart(2, '0')}:30 ${ampm}`;
                  return (
                    <React.Fragment key={i}>
                      <option value={label1}>{label1}</option>
                      <option value={label2}>{label2}</option>
                    </React.Fragment>
                  );
                })}
              </select>
            </div>
          </div>
          <button
            id="save-calendar-btn"
            type="submit"
            className="w-full py-2 bg-cyan-950/40 border border-cyan-400/40 hover:border-cyan-400/80 text-cyan-400 text-xs font-mono font-bold hover:bg-cyan-950/80 rounded-md transition"
          >
            LOCK INTRA-DAY SEQUENCE
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
          <Calendar className="w-8 h-8 mx-auto text-slate-700 mb-1" />
          <p className="font-mono text-[9px] tracking-wider text-slate-500">NO LOCKED BLOCK TELEMETRY FOUND</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white/2 border border-white/5 hover:border-white/20 transition-all duration-350 group"
            >
              <div className="min-w-0 pr-4">
                <p className="text-xs font-medium text-slate-300 truncate font-mono">{event.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-[9px] text-slate-400 tracking-tight">
                    {event.startTime} - {event.endTime}
                  </span>
                </div>
              </div>
              <button
                id={`remove-calendar-${event.id}`}
                type="button"
                onClick={() => onRemoveEvent(event.id)}
                className="text-slate-600 hover:text-rose-400 p-1 rounded-md hover:bg-white/5 transition flex-shrink-0"
                title="Unlock period"
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
