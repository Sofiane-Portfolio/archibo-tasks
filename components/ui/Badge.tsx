import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius } from '../../constants/theme';
import type { Priority, TeamStatus } from '../../types';

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const cfg = {
    urgent: { label: 'URGENT', bg: Colors.urgentDim, text: Colors.urgent, border: Colors.urgentBorder },
    normal: { label: 'NORMAL', bg: Colors.normalDim, text: Colors.normal, border: Colors.normalBorder },
    low:    { label: 'BASSE',  bg: Colors.lowDim,    text: Colors.low,    border: Colors.lowBorder    },
  }[priority];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <View style={[styles.dot, { backgroundColor: cfg.text }]} />
      <Text style={[styles.badgeTxt, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
};

export const StatusBadge: React.FC<{ status: TeamStatus }> = ({ status }) => {
  const cfg = {
    on_site:     { label: 'Sur Site',     bg: Colors.successDim, text: Colors.success, dot: Colors.success },
    in_office:   { label: 'Au Bureau',    bg: Colors.normalDim,  text: Colors.normal,  dot: Colors.normal  },
    unavailable: { label: 'Indisponible', bg: Colors.lowDim,     text: Colors.low,     dot: Colors.low     },
  }[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.statusTxt, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
};

export const PhotoBadge: React.FC = () => (
  <View style={styles.photo}>
    <Feather name="camera" size={9} color={Colors.warning} />
    <Text style={styles.photoTxt}>Photo</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: Radius.xs, borderWidth: 1,
  },
  dot: { width: 4, height: 4, borderRadius: 2 },
  badgeTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 12, fontWeight: '500' },
  photo: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.warningDim, borderWidth: 1, borderColor: Colors.warningBorder,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.xs,
  },
  photoTxt: { color: Colors.warning, fontSize: 9, fontWeight: '700' },
});
