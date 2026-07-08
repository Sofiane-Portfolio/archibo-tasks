import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBadge } from './ui/Badge';
import { Colors, Radius, Spacing, Shadow } from '../constants/theme';
import type { TeamMember } from '../types';

export const TeamMemberCard: React.FC<{
  member: TeamMember;
  taskCount?: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleOnline?: () => void;
}> = ({ member, taskCount = 0, onEdit, onDelete, onToggleOnline }) => (
  <View style={styles.card}>
    <TouchableOpacity style={styles.avatarWrap} onPress={onToggleOnline} activeOpacity={0.7}>
      <View style={[styles.avatar, { borderColor: `${member.accentColor}40`, backgroundColor: `${member.accentColor}10` }]}>
        <Text style={[styles.initials, { color: member.accentColor }]}>{member.initials}</Text>
      </View>
      <View style={[styles.onlineDot, member.isOnline ? styles.online : styles.offline]} />
    </TouchableOpacity>

    <View style={styles.info}>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={[styles.onlineLabel, member.isOnline ? styles.onlineTxt : styles.offlineTxt]}>
          {member.isOnline ? 'En ligne' : 'Hors ligne'}
        </Text>
      </View>
      <Text style={styles.role}>{member.role}</Text>
      <View style={styles.metaRow}>
        <StatusBadge status={member.status} />
        {taskCount > 0 && (
          <Text style={styles.tasks}>{taskCount} tâche{taskCount > 1 ? 's' : ''} active{taskCount > 1 ? 's' : ''}</Text>
        )}
      </View>
    </View>

    <View style={styles.actions}>
      <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
        <Feather name="edit-2" size={14} color={Colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, styles.delBtn]} onPress={onDelete}>
        <Feather name="trash-2" size={14} color={Colors.urgent} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: 4,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 15, fontWeight: '800' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  online: { backgroundColor: Colors.success },
  offline: { backgroundColor: Colors.textDisabled },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', flex: 1 },
  onlineLabel: { fontSize: 10, fontWeight: '700' },
  onlineTxt: { color: Colors.success },
  offlineTxt: { color: Colors.textDisabled },
  role: { color: Colors.textMuted, fontSize: 11 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  tasks: { color: Colors.orange, fontSize: 10, fontWeight: '600' },
  actions: { gap: 6 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delBtn: { backgroundColor: Colors.urgentDim, borderColor: Colors.urgentBorder },
});
