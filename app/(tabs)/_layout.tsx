import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Colors, Radius, Shadow } from '../../constants/theme';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

interface TabConfig {
  name: string;
  icon: FeatherName;
  label: string;
  accent: string;
  adminOnly?: boolean;
}

const ALL_TABS: TabConfig[] = [
  { name: 'index',     icon: 'check-square', label: 'Tâches',    accent: Colors.orange },
  { name: 'agenda',    icon: 'calendar',     label: 'Planning',  accent: Colors.teal   },
  { name: 'chantiers', icon: 'map',          label: 'Chantiers', accent: Colors.gold   },
  { name: 'admin',     icon: 'plus-circle',  label: 'Créer',     accent: Colors.purple, adminOnly: true },
  { name: 'team',      icon: 'users',        label: 'Équipe',    accent: Colors.sky,    adminOnly: true },
];

function TabIcon({ focused, icon, label, accent }: {
  focused: boolean; icon: FeatherName; label: string; accent: string;
}) {
  const scale  = useSharedValue(focused ? 1 : 0.85);
  const pillOp = useSharedValue(focused ? 1 : 0);
  const iconY  = useSharedValue(focused ? -2 : 0);

  useEffect(() => {
    scale.value  = withSpring(focused ? 1 : 0.85, { stiffness: 320, damping: 22 });
    pillOp.value = withTiming(focused ? 1 : 0, { duration: 200 });
    iconY.value  = withSpring(focused ? -2 : 0, { stiffness: 300, damping: 20 });
  }, [focused]);

  const wrapAnim  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateY: iconY.value }] }));
  const pillAnim  = useAnimatedStyle(() => ({
    opacity: pillOp.value,
    transform: [{ scale: interpolate(pillOp.value, [0, 1], [0.6, 1]) }],
  }));

  return (
    <Animated.View style={[styles.iconWrap, wrapAnim]}>
      <Animated.View style={pillAnim}>
        <LinearGradient
          colors={[`${accent}22`, `${accent}08`]}
          style={[styles.pill, { borderColor: `${accent}40` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Feather name={icon} size={20} color={focused ? accent : Colors.textMuted} />
      <Text style={[styles.iconLabel, { color: focused ? accent : Colors.textDisabled }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

export default function TabsLayout() {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const visibleTabs = ALL_TABS.filter(t => !t.adminOnly || role === 'admin');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.bar,
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <View style={styles.barOuter}>
            <LinearGradient
              colors={['#FFFFFF', '#FAFAFC']}
              style={styles.barBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </View>
        ),
      }}
    >
      {ALL_TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            href: t.adminOnly && role !== 'admin' ? null : undefined,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={t.icon} label={t.label} accent={t.accent} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 20,
    left: 14,
    right: 14,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  barOuter: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  barBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 52,
    height: 72,
  },
  pill: {
    position: 'absolute',
    width: 46,
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
  },
  iconLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
