import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { getCategoryConfig } from '../constants/categories';
import { Colors, Radius, Shadow } from '../constants/theme';
import type { Task } from '../types';

interface CalendarEventBlockProps {
  task: Task;
  onPress?: () => void;
  compact?: boolean;
}

/** Bloc événement style Google Calendar */
export function CalendarEventBlock({ task, onPress, compact }: CalendarEventBlockProps) {
  const cat = getCategoryConfig(task.category);
  const done = task.status === 'done';
  const isUrgent = task.priority === 'urgent' && !done;
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isUrgent) {
      pulse.value = withRepeat(
        withSequence(withTiming(0.92, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1,
        true
      );
    }
  }, [isUrgent]);

  const pulseAnim = useAnimatedStyle(() => ({
    opacity: isUrgent ? pulse.value : 1,
  }));

  const priColor =
    task.priority === 'urgent' ? Colors.urgent :
    task.priority === 'normal' ? Colors.normal : Colors.low;

  return (
    <Animated.View style={pulseAnim}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={[
          styles.block,
          { backgroundColor: done ? Colors.successDim : `${cat.color}14`, borderLeftColor: done ? Colors.success : cat.color },
          done && styles.blockDone,
        ]}
      >
        <View style={styles.blockTop}>
          <Text style={[styles.blockTime, { color: done ? Colors.textMuted : cat.color }]}>
            {task.scheduledTime ?? 'Journée'}
          </Text>
          {task.notifyTeam && !done && (
            <View style={styles.reminderBadge}>
              <Feather name="bell" size={10} color={Colors.orange} />
              <Text style={styles.reminderTxt}>Rappel</Text>
            </View>
          )}
        </View>
        <Text style={[styles.blockTitle, done && styles.blockTitleDone]} numberOfLines={compact ? 1 : 2}>
          {task.title}
        </Text>
        {!compact && (
          <View style={styles.blockMeta}>
            <Feather name="map-pin" size={11} color={Colors.textMuted} />
            <Text style={styles.blockSite}>{task.site}</Text>
          </View>
        )}
        <View style={styles.blockFooter}>
          {task.requiresPhoto && !done && (
            <Feather name="camera" size={12} color={Colors.warning} />
          )}
          {isUrgent && (
            <View style={[styles.urgentPill, { backgroundColor: `${priColor}18` }]}>
              <Text style={[styles.urgentTxt, { color: priColor }]}>Urgent</Text>
            </View>
          )}
          {done && <Feather name="check-circle" size={14} color={Colors.success} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    ...Shadow.sm,
  },
  blockDone: { opacity: 0.6 },
  blockTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  blockTime: { fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
  reminderBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.orangeDim, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.orangeBorder,
  },
  reminderTxt: { fontSize: 9, fontWeight: '800', color: Colors.orange },
  blockTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', lineHeight: 20, marginBottom: 4 },
  blockTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted, fontWeight: '500' },
  blockMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  blockSite: { color: Colors.textMuted, fontSize: 12 },
  blockFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  urgentPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.xs },
  urgentTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
});
