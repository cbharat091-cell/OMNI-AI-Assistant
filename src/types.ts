export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // e.g. "09:00 AM" or "13:30"
  endTime: string;   // e.g. "10:00 AM" or "14:30"
}

export interface Mission {
  id: string;
  title: string;
  duration: number; // in minutes
  priority: 'critical' | 'standard' | 'utility';
}

export interface PlanSlot {
  startTime: string;
  endTime: string;
  title: string;
  type: 'task' | 'calendar' | 'rest' | 'buffer';
  rationale: string;
}

export interface OptimizationResult {
  systemAwakening: string;
  biometricScan: string;
  masterPlan: PlanSlot[];
  intellectualObservation: string;
}

export type AssistantDomain = 
  | 'general'
  | 'education'
  | 'coding'
  | 'writing'
  | 'research'
  | 'business'
  | 'productivity'
  | 'health';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

