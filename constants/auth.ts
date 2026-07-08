import type { AppRole } from '../types';

/** Codes d'accès maquette — à remplacer par auth backend en prod */
export const ACCESS_CODES: Record<AppRole, string> = {
  user:  '7426',   // Équipe terrain / chantier
  admin: '7752',   // Direction Archibo
};

export const ROLE_LABELS: Record<AppRole, { title: string; subtitle: string; icon: string }> = {
  user: {
    title: 'Équipe Terrain',
    subtitle: 'Architectes & conducteurs sur chantier',
    icon: 'compass',
  },
  admin: {
    title: 'Direction',
    subtitle: 'Administration & gestion d\'équipe',
    icon: 'shield',
  },
};

export const ROLE_PROFILES: Record<AppRole, string> = {
  user:  'Collaborateur Archibo',
  admin: 'Direction Archibo',
};
