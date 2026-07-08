export type Priority = 'urgent' | 'normal' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'done';
export type TaskCategory = 'inspection' | 'validation' | 'reunion' | 'livraison' | 'suivi';
export type AppRole = 'user' | 'admin';
export type TeamStatus = 'on_site' | 'in_office' | 'unavailable';
export type TeamRole =
  | 'Architecte Senior'
  | 'Architecte Junior'
  | "Designer d'intérieur"
  | 'Conducteur de travaux'
  | 'Chargé de projets'
  | 'Responsable technique';

export interface Task {
  id: string;
  title: string;
  description?: string;
  site: string;
  category: TaskCategory;
  priority: Priority;
  requiresPhoto: boolean;
  syncCalendar: boolean;
  notifyTeam: boolean;
  status: TaskStatus;
  photoUri?: string;
  createdAt: string;
  dueDate?: string;
  scheduledTime?: string;
  assignedTo?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'task' | 'reminder' | 'team';
  taskId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  status: TeamStatus;
  isOnline: boolean;
  initials: string;
  accentColor: string;
  phone?: string;
  email?: string;
}

export interface Site {
  id: string;
  label: string;
  zone: string;
}
