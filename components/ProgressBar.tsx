import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../constants/theme';

export const ProgressBar: React.FC<{ done: number; total: number }> = ({ done, total }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(total > 0 ? done / total : 0, {
      duration: 700, easing: Easing.out(Easing.cubic),
    });
  }, [done, total]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const allDone = done === total && total > 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Feather name={allDone ? 'check-circle' : 'activity'} size={12}
            color={allDone ? Colors.success : Colors.orange} />
          <Text style={styles.label}>
            <Text style={[styles.countDone, allDone && { color: Colors.success }]}>{done}</Text>
            <Text style={styles.sep}> / </Text>
            <Text style={styles.countTotal}>{total}</Text>
            <Text style={styles.suffix}> tâches clôturées</Text>
          </Text>
        </View>
        <View style={[styles.pct, allDone && styles.pctDone]}>
          <Text style={[styles.pctTxt, allDone && { color: Colors.success }]}>{pct}%</Text>
        </View>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]}>
          <LinearGradient
            colors={allDone ? [Colors.success, Colors.teal] : [Colors.orange, Colors.gold]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.lg, paddingVertical: 10, gap: 7 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 12, color: Colors.textMuted },
  countDone: { color: Colors.orange, fontWeight: '700', fontSize: 13 },
  sep: { color: Colors.textDisabled },
  countTotal: { color: Colors.textSecondary, fontWeight: '500' },
  suffix: { color: Colors.textMuted },
  pct: {
    backgroundColor: Colors.orangeDim, borderWidth: 1, borderColor: Colors.orangeBorder,
    borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  pctDone: { backgroundColor: Colors.successDim, borderColor: Colors.successBorder },
  pctTxt: { color: Colors.orange, fontSize: 11, fontWeight: '700' },
  track: { height: 4, backgroundColor: Colors.surface, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2, overflow: 'hidden' },
});
