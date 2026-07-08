import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal, StatusBar, TextInput, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTasksStore } from '../../store/tasksStore';
import { ProfileBadge } from '../../components/ui/ProfileBadge';
import { NotificationBell } from '../../components/NotificationBell';
import { NextReminderBanner } from '../../components/NextReminderBanner';
import { TaskItem } from '../../components/TaskItem';
import { ProgressBar } from '../../components/ProgressBar';
import { PhotoPanel } from '../../components/PhotoPanel';
import { Colors, Radius, Spacing, Shadow } from '../../constants/theme';
import type { Task } from '../../types';

type FilterTab = 'all' | 'pending' | 'done';
const FILTERS = [
  { value: 'all'     as FilterTab, label: 'Toutes'      },
  { value: 'pending' as FilterTab, label: 'En attente'  },
  { value: 'done'    as FilterTab, label: 'Validées'    },
];

export default function TasksScreen() {
  const { tasks, toggleTask, attachPhoto, updateTask } = useTasksStore();
  const insets = useSafeAreaInsets();

  const [filter, setFilter]           = useState<FilterTab>('all');
  const [photoPanelTask, setPanel]    = useState<Task | null>(null);
  const [searchQ, setSearchQ]         = useState('');
  const [searchOpen, setSearchOpen]   = useState(false);

  const todayTasks = useMemo(() => tasks.filter((t) => {
    const d = t.dueDate ? new Date(t.dueDate) : new Date();
    return d.toDateString() === new Date().toDateString();
  }), [tasks]);

  const filtered = useMemo(() => {
    let list = todayTasks;
    if (filter === 'pending') list = list.filter(t => t.status !== 'done');
    if (filter === 'done')    list = list.filter(t => t.status === 'done');
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) || t.site.toLowerCase().includes(q)
      );
    }
    return list;
  }, [todayTasks, filter, searchQ]);

  const nextReminder = useMemo(() =>
    todayTasks
      .filter(t => t.status !== 'done' && t.notifyTeam)
      .sort((a, b) => (a.scheduledTime ?? '99:99').localeCompare(b.scheduledTime ?? '99:99'))[0] ?? null,
    [todayTasks]
  );
  const doneCount = todayTasks.filter(t => t.status === 'done').length;
  const urgentCount = todayTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;
  const pendingCount = todayTasks.filter(t => t.status !== 'done').length;

  const handlePress = (task: Task) => {
    if (task.requiresPhoto && task.status !== 'done') setPanel(task);
    else toggleTask(task.id);
  };

  const handlePhoto = (uri: string) => {
    if (!photoPanelTask) return;
    attachPhoto(photoPanelTask.id, uri);
    updateTask(photoPanelTask.id, { status: 'done' });
    setPanel(null);
  };

  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onToggle={() => {
        if (item.requiresPhoto && item.status !== 'done') setPanel(item);
        else toggleTask(item.id);
      }}
      onPress={() => handlePress(item)}
    />
  ), [toggleTask]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/archibo-logo.png')} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.brand}>ARCHIBO</Text>
            <Text style={styles.brandSub}>Field App</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <NotificationBell />
          <ProfileBadge />
          <TouchableOpacity style={[styles.iconBtn, searchOpen && styles.iconBtnOn]} onPress={() => setSearchOpen(!searchOpen)}>
            <Feather name="search" size={17} color={searchOpen ? Colors.orange : Colors.textSecondary} />
          </TouchableOpacity>

          {urgentCount > 0 && (
            <View style={styles.urgentBubble}>
              <View style={styles.urgentDot} />
              <Text style={styles.urgentText}>{urgentCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Date + stats ── */}
      <LinearGradient
        colors={['rgba(232,103,74,0.06)', Colors.bg]}
        style={styles.dateSection}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      >
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
          </Text>
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Feather name="check-circle" size={12} color={Colors.success} />
              <Text style={[styles.miniStatNum, { color: Colors.success }]}>{doneCount}</Text>
            </View>
            <View style={styles.miniStat}>
              <Feather name="clock" size={12} color={Colors.orange} />
              <Text style={[styles.miniStatNum, { color: Colors.orange }]}>{pendingCount}</Text>
            </View>
          </View>
        </View>
        <ProgressBar done={doneCount} total={todayTasks.length} />
      </LinearGradient>

      <NextReminderBanner task={nextReminder} />

      {/* ── Search ── */}
      {searchOpen && (
        <View style={styles.searchBar}>
          <Feather name="search" size={15} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher tâche ou chantier…"
            placeholderTextColor={Colors.textDisabled}
            value={searchQ}
            onChangeText={setSearchQ}
            autoFocus
          />
          {searchQ.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQ('')}>
              <Feather name="x" size={15} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Filters ── */}
      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipOn]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterTxt, filter === f.value && styles.filterTxtOn]}>
              {f.label}
            </Text>
            {f.value === 'pending' && pendingCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeTxt}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Section ── */}
      <View style={styles.section}>
        <View style={styles.sectionLeft}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>RAPPELS DU JOUR</Text>
        </View>
        <Text style={styles.sectionCount}>{filtered.length} tâche{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* ── List ── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyCircle}>
              <Feather name="check" size={30} color={Colors.success} />
            </View>
            <Text style={styles.emptyTitle}>Tout est à jour</Text>
            <Text style={styles.emptySub}>Aucune tâche dans cette vue.</Text>
          </View>
        }
      />

      {/* ── Photo modal ── */}
      <Modal visible={photoPanelTask !== null} transparent animationType="slide" onRequestClose={() => setPanel(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setPanel(null)} />
        {photoPanelTask && (
          <View style={styles.sheet}>
            <PhotoPanel task={photoPanelTask} onPhotoConfirmed={handlePhoto} onCancel={() => setPanel(null)} />
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    backgroundColor: Colors.bg,
    borderBottomWidth: 1, borderBottomColor: Colors.borderMuted,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 40, height: 40 },
  brand: { color: Colors.navy, fontSize: 14, fontWeight: '800', letterSpacing: 2.2 },
  brandSub: { color: Colors.orange, fontSize: 9, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  roleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.tealDim,
    borderWidth: 1, borderColor: `${Colors.teal}30`,
  },
  roleChipAdmin: {
    backgroundColor: Colors.purpleDim,
    borderColor: `${Colors.purple}30`,
  },
  roleText: { color: Colors.teal, fontSize: 11, fontWeight: '700' },
  roleTextAdmin: { color: Colors.purple },

  iconBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnOn: { backgroundColor: Colors.orangeDim, borderColor: Colors.orangeBorder },

  urgentBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.urgentDim,
    borderWidth: 1, borderColor: Colors.urgentBorder,
    borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 5,
  },
  urgentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.urgent },
  urgentText: { color: Colors.urgent, fontSize: 11, fontWeight: '800' },

  dateSection: { paddingBottom: 4 },
  adminStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: Colors.purpleDim, borderRadius: Radius.md,
    borderWidth: 1, borderColor: `${Colors.purple}25`,
  },
  adminStripTxt: { color: Colors.purple, fontSize: 11, fontWeight: '700' },
  dateRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 4,
  },
  dateText: { color: Colors.navy, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  miniStats: { flexDirection: 'row', gap: 8 },
  miniStat: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  miniStatNum: { fontSize: 12, fontWeight: '800' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.lg, marginTop: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },

  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 8,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipOn: { backgroundColor: Colors.orangeDim, borderColor: Colors.orangeBorder },
  filterTxt: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },
  filterTxtOn: { color: Colors.orange, fontWeight: '700' },
  filterBadge: {
    backgroundColor: Colors.urgent, borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  filterBadgeTxt: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  section: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionBar: { width: 3, height: 13, borderRadius: 2, backgroundColor: Colors.orange },
  sectionTitle: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.8 },
  sectionCount: { color: Colors.textMuted, fontSize: 11 },

  listContent: { paddingBottom: 130 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.successDim,
    borderWidth: 1.5, borderColor: Colors.successBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { color: Colors.navy, fontSize: 17, fontWeight: '700' },
  emptySub: { color: Colors.textMuted, fontSize: 13 },

  overlay: { flex: 1, backgroundColor: 'rgba(28,28,46,0.55)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
