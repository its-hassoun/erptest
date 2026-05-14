import type { UserRole } from './user'; 

export type TimesheetStatus = 'draft' | 'submitted' | 'validated' | 'rejected';
export type TaskType = 'independent' | 'project';

export interface TimesheetTask {
  id: string; 
  date: string;
  description: string;
  hours: number;
  type: TaskType;
  projectName?: string;
  ticketId?: number; // Déjà passé en number
  name?: string;
  startTime?: string;
  endTime?: string;
}

export interface Timesheet {
  id: number; // Passé en number
  userId: number; // Passé en number
  month: number;
  year: number;
  tasks: TimesheetTask[];
  status: TimesheetStatus;
  validatedBy?: number; // Passé en number
  totalHours: number;
}

export interface Project {
  id: number; // Passé en number
  name: string;
  tasks: string[];
}