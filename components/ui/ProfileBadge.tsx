import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors, Radius } from '../../constants/theme';

export function ProfileBadge() {
  const { role, displayName, logout } = useAuthStore();
  const isAdmin = role === 'admin';

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={styles.row}>
      <LinearGradient
        colors={isAdmin ? [Colors.purpleDim, `${Colors.purple}08`] : [Colors.tealDim, `${Colors.teal}08`]}
        style={[styles.badge, { borderColor: isAdmin ? `${Colors.purple}35` : `${Colors.teal}35` }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Feather
          name={isAdmin ? 'shield' : 'compass'}
          size={12}
          color={isAdmin ? Colors.purple : Colors.teal}
        />
        <Text style={[styles.badgeTxt, { color: isAdmin ? Colors.purple : Colors.teal }]}>
          {isAdmin ? 'Direction' : 'Terrain'}
        </Text>
      </LinearGradient>

      <Pressable onPress={handleLogout} style={styles.logout} hitSlop={8}>
        <Feather name="log-out" size={16} color={Colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  logout: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.bgAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
