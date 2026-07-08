import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTasksStore, SITES } from '../../store/tasksStore';
import { useTeamStore } from '../../store/teamStore';
import { ProfileBadge } from '../../components/ui/ProfileBadge';
import { NotificationBell } from '../../components/NotificationBell';
import { Colors, Radius, Spacing, Shadow } from '../../constants/theme';

const SITE_COLORS = [
  Colors.orange, Colors.teal, Colors.sky, Colors.purple,
  Colors.gold, Colors.rose, Colors.navy, Colors.success,
  '#5A8F7B', '#8B6914',
];

export default function ChantiersScreen() {
  const { tasks } = useTasksStore();
  const { members } = useTeamStore();
  const insets = useSafeAreaInsets();

  const siteStats = useMemo(() =>
    SITES.map((site, i) => {
      const siteTasks = tasks.filter(t => t.site === site.label);
      const active = siteTasks.filter(t => t.status !== 'done').length;
      const urgent = siteTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;
      const onSite = members.filter(m => m.status === 'on_site' && m.isOnline).length;
      return { ...site, active, urgent, total: siteTasks.length, color: SITE_COLORS[i % SITE_COLORS.length], onSite };
    }).sort((a, b) => b.active - a.active),
    [tasks, members]
  );

  const totalActive = siteStats.reduce((s, x) => s + x.active, 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Chantiers</Text>
          <Text style={styles.sub}>{totalActive} tâches actives · {SITES.length} sites</Text>
        </View>
        <View style={styles.headerRight}>
          <NotificationBell />
          <ProfileBadge />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {siteStats.map(site => (
          <TouchableOpacity key={site.id} activeOpacity={0.85} style={styles.card}>
            <LinearGradient
              colors={[`${site.color}12`, Colors.card]}
              style={styles.cardGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.colorBar, { backgroundColor: site.color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={[styles.iconWrap, { backgroundColor: `${site.color}20` }]}>
                    <Feather name="home" size={18} color={site.color} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.siteName}>{site.label}</Text>
                    <Text style={styles.siteZone}>{site.zone}</Text>
                  </View>
                  {site.urgent > 0 && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentTxt}>{site.urgent} urgent</Text>
                    </View>
                  )}
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={[styles.statNum, { color: site.color }]}>{site.active}</Text>
                    <Text style={styles.statLbl}>En cours</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statNum}>{site.total}</Text>
                    <Text style={styles.statLbl}>Total</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <View style={styles.onlineRow}>
                      <View style={styles.onlineDot} />
                      <Text style={styles.statNum}>{site.onSite}</Text>
                    </View>
                    <Text style={styles.statLbl}>Équipe</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgAlt },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderMuted,
  },
  title: { color: Colors.navy, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  scroll: { padding: Spacing.lg, gap: 12 },
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardGrad: { flexDirection: 'row', overflow: 'hidden' },
  colorBar: { width: 5 },
  cardBody: { flex: 1, padding: Spacing.lg },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  siteName: { color: Colors.navy, fontSize: 16, fontWeight: '800' },
  siteZone: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  urgentBadge: {
    backgroundColor: Colors.urgentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.urgentBorder,
  },
  urgentTxt: { color: Colors.urgent, fontSize: 10, fontWeight: '800' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgAlt,
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { color: Colors.navy, fontSize: 18, fontWeight: '800' },
  statLbl: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
});
