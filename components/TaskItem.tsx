import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { CircularCheckbox } from './ui/CircularCheckbox';
import { PriorityBadge, PhotoBadge } from './ui/Badge';
import { getCategoryConfig } from '../constants/categories';
import { Colors, Radius, Spacing, Shadow } from '../constants/theme';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
}

const P = {
  urgent: { accent: Colors.urgent, border: Colors.urgentBorder },
  normal: { accent: Colors.normal, border: Colors.normalBorder },
  low:    { accent: Colors.low,    border: Colors.lowBorder    },
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onPress }) => {
  const isDone = task.status === 'done';
  const { accent, border } = P[task.priority];
  const cat = getCategoryConfig(task.category);
  const hasReminder = task.notifyTeam && !isDone;
  const isUrgentPending = task.priority === 'urgent' && !isDone;

  const bellOp = useSharedValue(1);
  useEffect(() => {
    if (hasReminder && isUrgentPending) {
      bellOp.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        true
      );
    }
  }, [hasReminder, isUrgentPending]);

  const bellAnim = useAnimatedStyle(() => ({ opacity: bellOp.value }));

  return (
    <View style={styles.wrap}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <View style={[
          styles.card,
          {
            borderColor: isDone ? Colors.successBorder : border,
            borderLeftColor: isDone ? Colors.success : cat.color,
            backgroundColor: isDone ? Colors.bgAlt : `${cat.color}06`,
            opacity: isDone ? 0.55 : 1,
          },
        ]}>
          {hasReminder && (
            <View style={styles.reminderStrip}>
              <Animated.View style={bellAnim}>
                <Feather name="bell" size={11} color={Colors.orange} />
              </Animated.View>
              <Text style={styles.reminderLabel}>
                Rappel {task.scheduledTime ? `· ${task.scheduledTime}` : ''}
              </Text>
            </View>
          )}

          <View style={styles.inner}>
            <CircularCheckbox checked={isDone} onToggle={onToggle} urgentColor={accent} />

            <View style={styles.content}>
              <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
                {task.title}
              </Text>
              <View style={styles.metaRow}>
                <Feather name="map-pin" size={10} color={Colors.textMuted} />
                <Text style={styles.metaTxt}>{task.site}</Text>
                {task.scheduledTime && (
                  <>
                    <Text style={styles.sep}>·</Text>
                    <Feather name="clock" size={10} color={cat.color} />
                    <Text style={[styles.metaTxt, { color: cat.color, fontWeight: '700' }]}>
                      {task.scheduledTime}
                    </Text>
                  </>
                )}
              </View>
              <View style={styles.badges}>
                <PriorityBadge priority={task.priority} />
                {task.requiresPhoto && !task.photoUri && <PhotoBadge />}
              </View>
            </View>

            {isDone ? (
              <Feather name="check-circle" size={20} color={Colors.success} />
            ) : (
              <Text style={styles.idTxt}>{task.id.replace('ARCH-', '#')}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginHorizontal: Spacing.lg, marginVertical: 5 },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  reminderStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.orangeDim,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.orangeBorder,
  },
  reminderLabel: { color: Colors.orange, fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  content: { flex: 1, gap: 6 },
  title: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600', lineHeight: 21 },
  titleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTxt: { color: Colors.textMuted, fontSize: 11 },
  sep: { color: Colors.textDisabled },
  badges: { flexDirection: 'row', gap: 5 },
  idTxt: { color: Colors.textDisabled, fontSize: 10, fontWeight: '700' },
});
