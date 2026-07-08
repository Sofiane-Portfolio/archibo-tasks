import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '../../constants/theme';

interface GradientStatCardProps {
  value: string | number;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  colors: readonly [string, string];
}

export const GradientStatCard: React.FC<GradientStatCardProps> = ({
  value, label, icon, colors,
}) => (
  <LinearGradient
    colors={[`${colors[0]}18`, `${colors[1]}08`]}
    style={styles.card}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={[styles.iconWrap, { backgroundColor: `${colors[0]}25` }]}>
      <Feather name={icon} size={16} color={colors[0]} />
    </View>
    <Text style={[styles.value, { color: colors[0] }]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  label: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
