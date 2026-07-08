import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Shadow } from '../../constants/theme';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  accent: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Bloc formulaire pro avec accent coloré */
export function FormSection({ title, subtitle, accent, children, style }: FormSectionProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHead}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle && <Text style={styles.sectionSub}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderMuted,
  },
  accentBar: { width: 4, height: 32, borderRadius: 2 },
  sectionTitle: { color: Colors.navy, fontSize: 15, fontWeight: '800' },
  sectionSub: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  sectionBody: { padding: Spacing.lg, gap: 12 },
});
