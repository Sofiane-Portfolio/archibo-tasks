import type { TaskCategory } from '../types';
import { Colors } from './theme';

export const TASK_CATEGORIES: {
  value: TaskCategory;
  label: string;
  icon: string;
  color: string;
  dim: string;
}[] = [
  { value: 'inspection', label: 'Inspection',   icon: 'search',       color: Colors.urgent,  dim: Colors.urgentDim  },
  { value: 'validation', label: 'Validation',   icon: 'check-circle', color: Colors.teal,    dim: Colors.tealDim    },
  { value: 'reunion',    label: 'Réunion',      icon: 'users',        color: Colors.purple,  dim: Colors.purpleDim  },
  { value: 'livraison',  label: 'Livraison',    icon: 'package',      color: Colors.gold,    dim: Colors.goldDim    },
  { value: 'suivi',      label: 'Suivi chantier', icon: 'tool',       color: Colors.orange,  dim: Colors.orangeDim  },
];

export const getCategoryConfig = (cat: TaskCategory) =>
  TASK_CATEGORIES.find(c => c.value === cat) ?? TASK_CATEGORIES[4];

export const TIME_SLOTS = ['08:00', '09:30', '11:00', '14:00', '16:30', '18:00'];

export const TEAM_DEPARTMENTS: { key: string; label: string; roles: string[]; color: string }[] = [
  { key: 'archi',   label: 'Architecture',  roles: ['Architecte Senior', 'Architecte Junior'], color: Colors.navy   },
  { key: 'design',  label: 'Design',        roles: ["Designer d'intérieur"],                   color: Colors.rose   },
  { key: 'chantier',label: 'Chantier',      roles: ['Conducteur de travaux', 'Responsable technique'], color: Colors.teal },
  { key: 'projet',  label: 'Gestion projet',roles: ['Chargé de projets'],                      color: Colors.sky    },
];
