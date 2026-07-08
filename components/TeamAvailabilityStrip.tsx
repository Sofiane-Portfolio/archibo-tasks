import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTeamStore } from '../store/teamStore';
import { Colors, Radius, Spacing } from '../constants/theme';

interface TeamAvailabilityStripProps {
  compact?: boolean;
}

export function TeamAvailabilityStrip({ compact }: TeamAvailabilityStripProps) {
  const { members } = useTeamStore();
  const online = members.filter(m => m.isOnline);
  const offline = members.filter(m => !m.isOnline);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Disponibilité équipe</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, styles.dotOn]} />
            <Text style={styles.legendTxt}>{online.length} en ligne</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, styles.dotOff]} />
            <Text style={styles.legendTxt}>{offline.length} hors ligne</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {members.map(m => (
          <View key={m.id} style={[styles.chip, !m.isOnline && styles.chipOff]}>
            <View style={[styles.avatar, { backgroundColor: `${m.accentColor}18` }]}>
              <Text style={[styles.initials, { color: m.accentColor }]}>{m.initials}</Text>
              <View style={[styles.statusDot, m.isOnline ? styles.dotOn : styles.dotOff]} />
            </View>
            {!compact && (
              <View style={styles.chipText}>
                <Text style={styles.name} numberOfLines={1}>{m.name.split(' ')[0]}</Text>
                <Text style={[styles.status, m.isOnline ? styles.statusOn : styles.statusOff]}>
                  {m.isOnline ? 'En ligne' : 'Hors ligne'}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderMuted,
    paddingVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  legend: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendTxt: { color: Colors.textMuted, fontSize: 10, fontWeight: '600' },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  dotOn: { backgroundColor: Colors.success },
  dotOff: { backgroundColor: Colors.textDisabled },
  scroll: { paddingHorizontal: Spacing.lg, gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
    paddingLeft: 4,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipOff: { opacity: 0.65 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  initials: { fontSize: 12, fontWeight: '800' },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  chipText: { maxWidth: 72 },
  name: { color: Colors.textPrimary, fontSize: 11, fontWeight: '700' },
  status: { fontSize: 9, fontWeight: '600', marginTop: 1 },
  statusOn: { color: Colors.success },
  statusOff: { color: Colors.textDisabled },
});
