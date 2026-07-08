import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../constants/theme';
import type { Task } from '../types';

interface NextReminderBannerProps {
  task: Task | null;
}

/** Bandeau prochain rappel du jour */
export function NextReminderBanner({ task }: NextReminderBannerProps) {
  const op = useSharedValue(0.6);

  useEffect(() => {
    if (task) {
      op.value = withRepeat(
        withSequence(withTiming(1, { duration: 1200 }), withTiming(0.65, { duration: 1200 })),
        -1,
        true
      );
    }
  }, [task?.id]);

  const bellAnim = useAnimatedStyle(() => ({ opacity: op.value }));

  if (!task) return null;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.iconWrap, bellAnim]}>
        <Feather name="bell" size={16} color={Colors.orange} />
      </Animated.View>
      <View style={styles.text}>
        <Text style={styles.label}>Prochain rappel · {task.scheduledTime ?? '—'}</Text>
        <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
      </View>
      <View style={styles.chip}>
        <Text style={styles.chipTxt}>{task.site.split(' ')[0]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: 14,
    backgroundColor: Colors.orangeDim,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.orangeBorder,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  label: { color: Colors.orange, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  title: { color: Colors.navy, fontSize: 14, fontWeight: '700' },
  chip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  chipTxt: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700' },
});
