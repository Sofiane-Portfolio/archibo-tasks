import { create } from 'zustand';
import type { TeamMember, TeamRole, TeamStatus } from '../types';
import { Colors } from '../constants/theme';

const MEMBER_ACCENTS = Colors.mosaic.filter((_, i) => i < 8);

const MOCK_TEAM: TeamMember[] = [
  {
    id: 'tm-001', name: 'Ahmed Ben Salah', role: 'Architecte Senior',
    status: 'on_site', isOnline: true, initials: 'AB', accentColor: Colors.orange,
    phone: '+216 98 123 456', email: 'ahmed.bensalah@archibo.tn',
  },
  {
    id: 'tm-002', name: 'Sarra Mejri', role: "Designer d'intérieur",
    status: 'in_office', isOnline: true, initials: 'SM', accentColor: Colors.rose,
    phone: '+216 55 234 567', email: 'sarra.mejri@archibo.tn',
  },
  {
    id: 'tm-003', name: 'Karim Trabelsi', role: 'Conducteur de travaux',
    status: 'on_site', isOnline: true, initials: 'KT', accentColor: Colors.sky,
    phone: '+216 20 345 678', email: 'karim.trabelsi@archibo.tn',
  },
  {
    id: 'tm-004', name: 'Nour Hamdi', role: 'Architecte Junior',
    status: 'in_office', isOnline: false, initials: 'NH', accentColor: Colors.purple,
    phone: '+216 27 456 789', email: 'nour.hamdi@archibo.tn',
  },
  {
    id: 'tm-005', name: 'Yasmine Gharbi', role: 'Chargé de projets',
    status: 'unavailable', isOnline: false, initials: 'YG', accentColor: Colors.teal,
    phone: '+216 52 567 890', email: 'yasmine.gharbi@archibo.tn',
  },
  {
    id: 'tm-006', name: 'Rami Bouzid', role: 'Responsable technique',
    status: 'on_site', isOnline: true, initials: 'RB', accentColor: Colors.gold,
    phone: '+216 99 678 901', email: 'rami.bouzid@archibo.tn',
  },
];

const ROLES: TeamRole[] = [
  'Architecte Senior', 'Architecte Junior', "Designer d'intérieur",
  'Conducteur de travaux', 'Chargé de projets', 'Responsable technique',
];

interface TeamState {
  members: TeamMember[];
  addMember: (member: Omit<TeamMember, 'id'>) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteMember: (id: string) => void;
  updateStatus: (id: string, status: TeamStatus) => void;
  toggleOnline: (id: string) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  members: MOCK_TEAM,

  addMember: (memberData) =>
    set(state => ({
      members: [{
        ...memberData,
        id: `tm-${String(state.members.length + 1).padStart(3, '0')}`,
      }, ...state.members],
    })),

  updateMember: (id, updates) =>
    set(state => ({
      members: state.members.map(m => m.id === id ? { ...m, ...updates } : m),
    })),

  deleteMember: (id) =>
    set(state => ({ members: state.members.filter(m => m.id !== id) })),

  updateStatus: (id, status) =>
    set(state => ({
      members: state.members.map(m =>
        m.id === id
          ? { ...m, status, isOnline: status !== 'unavailable' ? m.isOnline : false }
          : m
      ),
    })),

  toggleOnline: (id) =>
    set(state => ({
      members: state.members.map(m =>
        m.id === id ? { ...m, isOnline: !m.isOnline } : m
      ),
    })),
}));

export { ROLES, MEMBER_ACCENTS };
