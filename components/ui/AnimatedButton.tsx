import React, { useEffect } from 'react';
import {
  TouchableOpacity, Text, View, StyleSheet, ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withSequence, withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'teal';
type Size    = 'sm' | 'md' | 'lg';

interface AnimatedButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: React.ComponentProps<typeof Feather>['name'];
  iconRight?: React.ComponentProps<typeof Feather>['name'];
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  premium?: boolean;
}

const VARIANT_CFG = {
  primary:   { grad: [Colors.orange, '#CF5538', '#B84530'] as const, text: '#FFF', glow: Colors.orange },
  secondary: { grad: [Colors.navy, '#1E2040', '#141630'] as const,   text: '#FFF', glow: Colors.navy   },
  ghost:     { grad: ['transparent', 'transparent'] as const,          text: Colors.textSecondary, glow: 'transparent' },
  danger:    { grad: [Colors.urgent, '#CC2020', '#AA1818'] as const, text: '#FFF', glow: Colors.urgent },
  teal:      { grad: [Colors.teal, '#138070', '#0E6B5E'] as const,    text: '#FFF', glow: Colors.teal   },
};

const SIZE_CFG = {
  sm: { py: 11, px: 16, fontSize: 12, iconSize: 14, radius: Radius.md,  minH: 42 },
  md: { py: 15, px: 20, fontSize: 14, iconSize: 16, radius: Radius.lg,  minH: 50 },
  lg: { py: 19, px: 26, fontSize: 16, iconSize: 18, radius: Radius.xl, minH: 58 },
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  label, onPress, variant = 'primary', size = 'md',
  icon, iconRight, disabled = false, loading = false,
  fullWidth = false, premium = false,
}) => {
  const scale   = useSharedValue(1);
  const glowOp  = useSharedValue(0);
  const shimmer = useSharedValue(-1);

  const cfg  = VARIANT_CFG[variant];
  const sCfg = SIZE_CFG[size];
  const isGhost = variant === 'ghost';

  useEffect(() => {
    if (premium && !disabled && !isGhost) {
      shimmer.value = withRepeat(
        withTiming(2, { duration: 2200 }),
        -1,
        false
      );
    }
  }, [premium, disabled, isGhost]);

  const handlePress = () => {
    if (disabled || loading) return;
    scale.value = withSequence(
      withSpring(0.92, { stiffness: 650, damping: 18 }),
      withSpring(1.05, { stiffness: 280, damping: 10 }),
      withSpring(1,    { stiffness: 400, damping: 16 })
    );
    glowOp.value = withSequence(
      withTiming(0.7, { duration: 60 }),
      withTiming(0,   { duration: 350 })
    );
    onPress();
  };

  const containerAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowAnim      = useAnimatedStyle(() => ({ opacity: glowOp.value }));
  const shimmerAnim   = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [-1, 2], [-120, 320]) }],
    opacity: interpolate(shimmer.value, [-1, 0, 1, 2], [0, 0.5, 0.5, 0]),
  }));

  const isTransparent = cfg.grad[0] === 'transparent';

  return (
    <Animated.View style={[styles.wrapper, fullWidth && styles.fullWidth, containerAnim]}>
      {!isGhost && !disabled && (
        <Animated.View
          style={[styles.glow, { backgroundColor: cfg.glow }, glowAnim]}
          pointerEvents="none"
        />
      )}

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        disabled={disabled || loading}
        style={[fullWidth && styles.fullWidth]}
      >
        {isGhost || isTransparent ? (
          <View style={[
            styles.btnInner,
            {
              minHeight: sCfg.minH,
              paddingVertical: sCfg.py,
              paddingHorizontal: sCfg.px,
              borderRadius: sCfg.radius,
              borderWidth: 1.5,
              borderColor: Colors.border,
              backgroundColor: disabled ? Colors.surface : Colors.bgAlt,
              opacity: disabled ? 0.55 : 1,
            },
          ]}>
            <ButtonContent {...{ label, icon, iconRight, textColor: disabled ? Colors.textDisabled : cfg.text, iconSize: sCfg.iconSize, fontSize: sCfg.fontSize, loading }} />
          </View>
        ) : (
          <View style={[
            styles.gradWrap,
            { borderRadius: sCfg.radius, shadowColor: cfg.glow },
            premium && !disabled && Shadow.lg,
            disabled && { shadowOpacity: 0, elevation: 0 },
          ]}>
            <LinearGradient
              colors={disabled ? ['#E5E5EA', '#D1D1D6'] : cfg.grad}
              style={[styles.btnInner, {
                minHeight: sCfg.minH,
                paddingVertical: sCfg.py,
                paddingHorizontal: sCfg.px,
                borderRadius: sCfg.radius,
              }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {premium && !disabled && (
                <>
                  <View style={[styles.innerHighlight, { borderRadius: sCfg.radius }]} />
                  <Animated.View style={[styles.shimmer, shimmerAnim]} pointerEvents="none">
                    <LinearGradient
                      colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
                      style={styles.shimmerGrad}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </Animated.View>
                </>
              )}
              <ButtonContent {...{ label, icon, iconRight, textColor: disabled ? Colors.textMuted : cfg.text, iconSize: sCfg.iconSize, fontSize: sCfg.fontSize, loading, premium, arrowColor: cfg.glow }} />
            </LinearGradient>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

function ButtonContent({ label, icon, iconRight, textColor, iconSize, fontSize, loading, premium, arrowColor }: {
  label: string; icon?: React.ComponentProps<typeof Feather>['name'];
  iconRight?: React.ComponentProps<typeof Feather>['name'];
  textColor: string; iconSize: number; fontSize: number; loading: boolean; premium?: boolean; arrowColor?: string;
}) {
  return (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : icon ? (
        <View style={[styles.iconCircle, premium && styles.iconCirclePremium]}>
          <Feather name={icon} size={iconSize} color={textColor} />
        </View>
      ) : null}
      <Text style={[styles.label, { color: textColor, fontSize }]}>{label}</Text>
      {iconRight && !loading && (
        <View style={[styles.arrowCircle, premium && { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <Feather name={iconRight} size={iconSize - 1} color={premium ? (arrowColor ?? textColor) : textColor} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  fullWidth: { width: '100%' },
  glow: {
    position: 'absolute',
    top: '5%', left: '5%', right: '5%', bottom: '-25%',
    borderRadius: 40,
  },
  gradWrap: {
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  innerHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderBottomWidth: 0,
  },
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 80,
  },
  shimmerGrad: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  label: { fontWeight: '800', letterSpacing: -0.2, flex: 1, textAlign: 'center' },
  iconCircle: { opacity: 0.95 },
  iconCirclePremium: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  arrowCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
  },
});
