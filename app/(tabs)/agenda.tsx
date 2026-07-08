import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTasksStore } from '../../store/tasksStore';
import { ProfileBadge } from '../../components/ui/ProfileBadge';
import { NotificationBell } from '../../components/NotificationBell';
import { CalendarEventBlock } from '../../components/CalendarEventBlock';
import { getCategoryConfig } from '../../constants/categories';
import { Colors, Radius, Spacing } from '../../constants/theme';
import type { Task } from '../../types';

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

const FR_DAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function AgendaScreen() {
  const { tasks } = useTasksStore();
  const insets = useSafeAreaInsets();
  const today = useMemo(() => new Date(), []);

  const [selectedDate, setSelectedDate] = useState(today);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const d = new Date(today);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff + weekOffset * 7);
    return d;
  }, [weekOffset, today]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const tasksForDay = (day: Date) =>
    tasks.filter(t => isSameDay(new Date(t.dueDate ?? today), day));

  const dayTasks = useMemo(
    () =>
      tasksForDay(selectedDate).sort((a, b) =>
        (a.scheduledTime ?? '99:99').localeCompare(b.scheduledTime ?? '99:99')
      ),
    [tasks, selectedDate, today]
  );

  const monthYear = `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  const dayLabel = selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header Google-style ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.monthYear}>{monthYear}</Text>
          <Text style={styles.subtitle}>Planning Archibo</Text>
        </View>
        <View style={styles.headerRight}>
          <NotificationBell />
          <ProfileBadge />
        </View>
      </View>

      {/* ── Navigation mois ── */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setWeekOffset(w => w - 1)}>
          <Feather name="chevron-left" size={22} color={Colors.navy} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.todayPill}
          onPress={() => { setWeekOffset(0); setSelectedDate(today); }}
        >
          <Text style={styles.todayTxt}>Aujourd'hui</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setWeekOffset(w => w + 1)}>
          <Feather name="chevron-right" size={22} color={Colors.navy} />
        </TouchableOpacity>
      </View>

      {/* ── Semaine style Google Calendar ── */}
      <View style={styles.weekGrid}>
        {days.map((day, i) => {
          const selected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const dayEvents = tasksForDay(day);
          const done = dayEvents.filter(t => t.status === 'done').length;

          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={styles.dayCol}
              onPress={() => setSelectedDate(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayLetter, selected && styles.dayLetterSel]}>
                {FR_DAYS_SHORT[i]}
              </Text>
              <View style={[
                styles.dayCircle,
                selected && styles.dayCircleSel,
                isToday && !selected && styles.dayCircleToday,
              ]}>
                <Text style={[
                  styles.dayNum,
                  selected && styles.dayNumSel,
                  isToday && !selected && { color: Colors.orange },
                ]}>
                  {day.getDate()}
                </Text>
              </View>
              {/* Indicateurs événements (points colorés) */}
              <View style={styles.eventDots}>
                {dayEvents.slice(0, 3).map(t => {
                  const c = getCategoryConfig(t.category).color;
                  return (
                    <View
                      key={t.id}
                      style={[styles.eventDot, { backgroundColor: t.status === 'done' ? Colors.success : c }]}
                    />
                  );
                })}
              </View>
              {dayEvents.length > 0 && (
                <Text style={styles.dayCount}>{done}/{dayEvents.length}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Jour sélectionné + événements ── */}
      <View style={styles.daySection}>
        <Text style={styles.dayTitle}>
          {dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}
        </Text>
        <Text style={styles.dayMeta}>
          {dayTasks.length === 0
            ? 'Aucun événement'
            : `${dayTasks.length} rappel${dayTasks.length > 1 ? 's' : ''}`}
        </Text>
      </View>

      <ScrollView
        style={styles.eventsScroll}
        contentContainerStyle={styles.eventsContent}
        showsVerticalScrollIndicator={false}
      >
        {dayTasks.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="calendar" size={48} color={Colors.border} />
            <Text style={styles.emptyTitle}>Journée libre</Text>
            <Text style={styles.emptySub}>Comme sur Google Calendar — rien de prévu.</Text>
          </View>
        ) : (
          dayTasks.map(task => (
            <CalendarEventBlock key={task.id} task={task} />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  monthYear: { color: Colors.navy, fontSize: 26, fontWeight: '400', letterSpacing: -0.5 },
  subtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: Spacing.sm,
  },
  navBtn: { padding: 8 },
  todayPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  todayTxt: { color: Colors.navy, fontSize: 13, fontWeight: '600' },
  weekGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderMuted,
  },
  dayCol: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 8 },
  dayLetter: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  dayLetterSel: { color: Colors.navy, fontWeight: '800' },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSel: { backgroundColor: Colors.navy },
  dayCircleToday: { borderWidth: 1.5, borderColor: Colors.orange },
  dayNum: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  dayNumSel: { color: '#FFF', fontWeight: '700' },
  eventDots: { flexDirection: 'row', gap: 3, height: 6, alignItems: 'center' },
  eventDot: { width: 5, height: 5, borderRadius: 2.5 },
  dayCount: { fontSize: 8, color: Colors.textDisabled, fontWeight: '600' },
  daySection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  dayTitle: { color: Colors.navy, fontSize: 16, fontWeight: '700' },
  dayMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  eventsScroll: { flex: 1 },
  eventsContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  empty: { alignItems: 'center', paddingTop: 48, gap: 10 },
  emptyTitle: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySub: { color: Colors.textDisabled, fontSize: 13 },
});
