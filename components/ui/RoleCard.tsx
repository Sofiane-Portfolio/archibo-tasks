import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '../../constants/theme';
import type { AppRole } from '../../types';

interface RoleCardProps {
  role: AppRole;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  selected: boolean;
  onPress: () => void;
  delay?: number;
  accent: readonly [string, string];
}

export const RoleCard: React.FC<RoleCardProps> = ({
  title, subtitle, icon, selected, onPress, delay = 0, accent,
}) => {
  const scale = useSharedValue(0.92);
  const op    = useSharedValue(0);
  const sel   = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    op.value    = withTiming(1, { duration: 400 });
    scale.value = withSpring(1, { stiffness: 120, damping: 16 });
  }, []);

  useEffect(() => {
    sel.value = withSpring(selected ? 1 : 0, { stiffness: 280, damping: 22 });
  }, [selected]);

  const anim = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [
      { scale: scale.value * interpolate(sel.value, [0, 1], [1, 1.02]) },
    ],
  }));

  const borderAnim = useAnimatedStyle(() => ({
    borderColor: selected ? accent[0] : Colors.border,
    borderWidth: interpolate(sel.value, [0, 1], [1, 2.5]),
  }));

  return (
    <Animated.View style={[styles.wrap, anim, borderAnim]}>
      <Pressable onPress={onPress} style={styles.press}>
        {selected && (
          <LinearGradient
            colors={[`${accent[0]}18`, `${accent[1]}08`]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <View style={[styles.iconWrap, { backgroundColor: `${accent[0]}20` }]}>
          <Feather name={icon} size={26} color={accent[0]} />
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, selected && { color: accent[0] }]}>{title}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
        </View>
        <View style={[styles.radio, selected && { borderColor: accent[0], backgroundColor: accent[0] }]}>
          {selected && <Feather name="check" size={12} color="#FFF" />}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    ...Shadow.md,
  },
  press: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 3,
    lineHeight: 17,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
