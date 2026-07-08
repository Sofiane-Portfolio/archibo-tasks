import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accent?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  right?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title, subtitle, accent = Colors.orange, icon, right,
}) => (
  <View style={styles.row}>
    <View style={styles.left}>
      <View style={[styles.bar, { backgroundColor: accent }]} />
      <View>
        <View style={styles.titleRow}>
          {icon && <Feather name={icon} size={13} color={accent} />}
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle && <Text style={styles.sub}>{subtitle}</Text>}
      </View>
    </View>
    {right}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  bar: { width: 3, height: 28, borderRadius: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: {
    color: Colors.navy,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sub: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
});
