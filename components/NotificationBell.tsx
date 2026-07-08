import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNotificationsStore } from '../store/notificationsStore';
import { Colors, Radius, Spacing, Shadow } from '../constants/theme';

import type { AppNotification } from '../types';

const TYPE_CFG: Record<AppNotification['type'], { icon: React.ComponentProps<typeof Feather>['name']; color: string }> = {
  task:     { icon: 'check-square' as const, color: Colors.orange },
  reminder: { icon: 'bell'         as const, color: Colors.teal   },
  team:     { icon: 'users',        color: Colors.sky    },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  return `Il y a ${Math.floor(hrs / 24)}j`;
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationsStore();
  const [open, setOpen] = useState(false);
  const unread = unreadCount();

  return (
    <>
      <TouchableOpacity style={styles.bell} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Feather name="bell" size={17} color={Colors.navy} />
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.panel} onPress={e => e.stopPropagation()}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelTitle}>Notifications</Text>
                <Text style={styles.panelSub}>{unread} non lue{unread > 1 ? 's' : ''}</Text>
              </View>
              {unread > 0 && (
                <TouchableOpacity onPress={markAllRead}>
                  <Text style={styles.markAll}>Tout lire</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={notifications}
              keyExtractor={n => n.id}
              style={styles.list}
              renderItem={({ item }) => {
                const cfg = TYPE_CFG[item.type];
                return (
                  <TouchableOpacity
                    style={[styles.notifRow, !item.read && styles.notifUnread]}
                    onPress={() => markRead(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.notifIcon, { backgroundColor: `${cfg.color}15` }]}>
                      <Feather name={cfg.icon} size={16} color={cfg.color} />
                    </View>
                    <View style={styles.notifBody}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      <Text style={styles.notifText} numberOfLines={2}>{item.body}</Text>
                      <Text style={styles.notifTime}>{timeAgo(item.time)}</Text>
                    </View>
                    {!item.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.empty}>Aucune notification</Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  badgeTxt: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,28,46,0.45)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: Spacing.lg,
  },
  panel: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 420,
    ...Shadow.lg,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderMuted,
  },
  panelTitle: { color: Colors.navy, fontSize: 17, fontWeight: '800' },
  panelSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  markAll: { color: Colors.orange, fontSize: 13, fontWeight: '700' },
  list: { maxHeight: 340 },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderMuted,
  },
  notifUnread: { backgroundColor: `${Colors.orange}06` },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBody: { flex: 1, gap: 3 },
  notifTitle: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  notifText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
  notifTime: { color: Colors.textDisabled, fontSize: 10, marginTop: 2 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.orange,
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textMuted,
    padding: Spacing.xl,
    fontSize: 13,
  },
});
