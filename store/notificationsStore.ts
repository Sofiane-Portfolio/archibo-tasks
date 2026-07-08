import { create } from 'zustand';
import type { AppNotification } from '../types';

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Nouvelle tâche assignée',
    body: 'Inspection ferraillage fondations — Villa Gammarth',
    time: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    type: 'task',
    taskId: 'ARCH-001',
  },
  {
    id: 'n2',
    title: 'Rappel calendrier · 14:00',
    body: 'Validation pose Marbre Thala — Chantier La Marsa',
    time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    type: 'reminder',
    taskId: 'ARCH-002',
  },
  {
    id: 'n3',
    title: 'Photo validée ✓',
    body: 'Briefing client aménagement — Bureau Berges du Lac clôturé',
    time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: true,
    type: 'task',
    taskId: 'ARCH-003',
  },
  {
    id: 'n4',
    title: 'Ahmed · Sur site',
    body: 'Karim Trabelsi est arrivé sur Villa Gammarth',
    time: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    read: true,
    type: 'team',
  },
];

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: () => number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  push: (n: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: MOCK_NOTIFICATIONS,

  unreadCount: () => get().notifications.filter(n => !n.read).length,

  markRead: (id) =>
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    })),

  markAllRead: () =>
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
    })),

  push: (data) =>
    set(s => ({
      notifications: [{
        ...data,
        id: `n-${Date.now()}`,
        time: new Date().toISOString(),
        read: false,
      }, ...s.notifications],
    })),
}));
