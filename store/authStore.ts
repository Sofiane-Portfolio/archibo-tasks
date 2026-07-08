import { create } from 'zustand';
import { ACCESS_CODES } from '../constants/auth';
import type { AppRole } from '../types';

export type { AppRole };

interface AuthState {
  isAuthenticated: boolean;
  role: AppRole | null;
  displayName: string;
  login: (role: AppRole, code: string) => { ok: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  displayName: '',

  login: (role, code) => {
    const normalized = code.replace(/\s/g, '');
    if (normalized !== ACCESS_CODES[role]) {
      return { ok: false, error: 'Code d\'accès incorrect' };
    }
    set({
      isAuthenticated: true,
      role,
      displayName: role === 'admin' ? 'Direction Archibo' : 'Équipe Terrain',
    });
    return { ok: true };
  },

  logout: () => set({ isAuthenticated: false, role: null, displayName: '' }),
}));

/** Compat — ancien roleStore */
export const useRoleStore = () => {
  const { role, isAuthenticated } = useAuthStore();
  return {
    role: role ?? 'user',
    isAuthenticated,
    setRole: (_r: AppRole) => {},
    toggleRole: () => {},
  };
};
