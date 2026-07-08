import { create } from 'zustand';
import type { Task } from '../types';

const offsetDate = (days: number, hour = 9, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const MOCK_TASKS: Task[] = [
  {
    id: 'ARCH-001',
    title: 'Inspection ferraillage fondations',
    description: "Vérifier la conformité du ferraillage avant coulage du béton.",
    site: 'Villa Gammarth',
    category: 'inspection',
    priority: 'urgent',
    requiresPhoto: true,
    syncCalendar: true,
    notifyTeam: true,
    status: 'pending',
    createdAt: offsetDate(-1),
    dueDate: offsetDate(0, 9, 30),
    scheduledTime: '09:30',
    assignedTo: 'Ahmed Ben Salah',
  },
  {
    id: 'ARCH-002',
    title: 'Validation pose Marbre Thala',
    description: 'Contrôle qualité de la pose du marbre Thala en sol et mur.',
    site: 'Chantier La Marsa',
    category: 'validation',
    priority: 'normal',
    requiresPhoto: true,
    syncCalendar: true,
    notifyTeam: true,
    status: 'pending',
    createdAt: offsetDate(-1),
    dueDate: offsetDate(0, 14, 0),
    scheduledTime: '14:00',
    assignedTo: 'Sarra Mejri',
  },
  {
    id: 'ARCH-003',
    title: "Briefing client aménagement d'intérieur",
    description: "Présentation des planches d'ambiance et matériaux sélectionnés.",
    site: 'Bureau Berges du Lac',
    category: 'reunion',
    priority: 'normal',
    requiresPhoto: false,
    syncCalendar: true,
    notifyTeam: false,
    status: 'done',
    createdAt: offsetDate(-2),
    dueDate: offsetDate(0, 11, 0),
    scheduledTime: '11:00',
    assignedTo: 'Sarra Mejri',
  },
  {
    id: 'ARCH-004',
    title: 'Réception plans 2D/3D modifiés',
    description: 'Validation des plans révisés suite aux retours client.',
    site: 'Projet Carthage',
    category: 'livraison',
    priority: 'low',
    requiresPhoto: false,
    syncCalendar: false,
    notifyTeam: false,
    status: 'pending',
    createdAt: offsetDate(-1),
    dueDate: offsetDate(1, 10, 0),
    scheduledTime: '10:00',
    assignedTo: 'Karim Trabelsi',
  },
  {
    id: 'ARCH-005',
    title: 'Suivi coulage dalle béton',
    description: 'Présence obligatoire pendant le coulage.',
    site: 'Résidence Ennasr',
    category: 'suivi',
    priority: 'urgent',
    requiresPhoto: true,
    syncCalendar: true,
    notifyTeam: true,
    status: 'pending',
    createdAt: offsetDate(0),
    dueDate: offsetDate(1, 8, 0),
    scheduledTime: '08:00',
    assignedTo: 'Ahmed Ben Salah',
  },
  {
    id: 'ARCH-006',
    title: 'Réunion coordination corps de métiers',
    description: 'Coordination plombier, électricien et carreleur.',
    site: 'Villa Sidi Bou Saïd',
    category: 'reunion',
    priority: 'normal',
    requiresPhoto: false,
    syncCalendar: true,
    notifyTeam: true,
    status: 'pending',
    createdAt: offsetDate(0),
    dueDate: offsetDate(2, 16, 30),
    scheduledTime: '16:30',
    assignedTo: 'Nour Hamdi',
  },
  {
    id: 'ARCH-007',
    title: 'Contrôle étanchéité terrasse',
    description: 'Test d\'étanchéité avant pose carrelage extérieur.',
    site: 'Hôtel Hammamet',
    category: 'inspection',
    priority: 'normal',
    requiresPhoto: true,
    syncCalendar: true,
    notifyTeam: true,
    status: 'pending',
    createdAt: offsetDate(-3),
    dueDate: offsetDate(-1, 15, 0),
    scheduledTime: '15:00',
    assignedTo: 'Rami Bouzid',
  },
  {
    id: 'ARCH-008',
    title: 'Livraison menuiserie sur mesure',
    description: 'Réception et contrôle des portes en chêne massif.',
    site: 'Showroom Charguia',
    category: 'livraison',
    priority: 'low',
    requiresPhoto: false,
    syncCalendar: true,
    notifyTeam: false,
    status: 'pending',
    createdAt: offsetDate(0),
    dueDate: offsetDate(3, 11, 0),
    scheduledTime: '11:00',
    assignedTo: 'Yasmine Gharbi',
  },
];

interface TasksState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  attachPhoto: (id: string, uri: string) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: MOCK_TASKS,

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: `ARCH-${String(get().tasks.length + 1).padStart(3, '0')}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set(state => ({ tasks: [newTask, ...state.tasks] }));
    return newTask;
  },

  updateTask: (id, updates) =>
    set(state => ({
      tasks: state.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
    })),

  toggleTask: (id) =>
    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t
      ),
    })),

  deleteTask: (id) =>
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) })),

  attachPhoto: (id, uri) =>
    set(state => ({
      tasks: state.tasks.map(t => (t.id === id ? { ...t, photoUri: uri } : t)),
    })),
}));

export const SITES = [
  { id: 's1', label: 'Villa Gammarth', zone: 'Banlieue Nord' },
  { id: 's2', label: 'Chantier La Marsa', zone: 'Banlieue Nord' },
  { id: 's3', label: 'Bureau Berges du Lac', zone: 'Grand Tunis' },
  { id: 's4', label: 'Projet Carthage', zone: 'Banlieue Nord' },
  { id: 's5', label: 'Résidence Ennasr', zone: 'Grand Tunis' },
  { id: 's6', label: 'Villa Sidi Bou Saïd', zone: 'Banlieue Nord' },
  { id: 's7', label: 'Hôtel Hammamet', zone: 'Cap Bon' },
  { id: 's8', label: 'Restaurant Menzah 9', zone: 'Grand Tunis' },
  { id: 's9', label: 'Showroom Charguia', zone: 'Grand Tunis' },
  { id: 's10', label: 'Complexe Sousse', zone: 'Sahel' },
] as const;

export const PRIORITIES = [
  { value: 'urgent' as const, label: 'Urgent' },
  { value: 'normal' as const, label: 'Normal' },
  { value: 'low' as const, label: 'Basse priorité' },
];
