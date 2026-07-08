import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform, StatusBar, Image,
} from 'react-native';
import { Redirect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useTasksStore, SITES, PRIORITIES } from '../../store/tasksStore';
import { useTeamStore } from '../../store/teamStore';
import { useNotificationsStore } from '../../store/notificationsStore';
import { ProfileBadge } from '../../components/ui/ProfileBadge';
import { NotificationBell } from '../../components/NotificationBell';
import { FormSection } from '../../components/ui/FormSection';
import { Toggle } from '../../components/ui/Toggle';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { CalendarEventBlock } from '../../components/CalendarEventBlock';
import { TASK_CATEGORIES, TIME_SLOTS } from '../../constants/categories';
import { Colors, Radius, Spacing } from '../../constants/theme';
import type { Priority, TaskCategory } from '../../types';

const DATE_OFFSETS = [
  { label: "Aujourd'hui", days: 0 },
  { label: 'Demain', days: 1 },
  { label: '+3j', days: 3 },
  { label: '+7j', days: 7 },
];

export default function AdminScreen() {
  const { addTask } = useTasksStore();
  const { members } = useTeamStore();
  const pushNotif = useNotificationsStore(s => s.push);
  const role = useAuthStore(s => s.role);
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [siteId, setSiteId] = useState<string>(SITES[0].id);
  const [priority, setPriority] = useState<Priority>('normal');
  const [category, setCategory] = useState<TaskCategory>('suivi');
  const [requiresPhoto, setPhoto] = useState(true);
  const [syncCal, setSyncCal] = useState(true);
  const [notifyTeam, setNotify] = useState(true);
  const [siteOpen, setSiteOpen] = useState(false);
  const [dayOffset, setDayOffset] = useState(0);
  const [scheduledTime, setScheduledTime] = useState('09:30');
  const [assignedTo, setAssignedTo] = useState(members[0]?.name ?? '');

  const site = SITES.find(s => s.id === siteId)!;

  const previewDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(parseInt(scheduledTime.split(':')[0], 10), parseInt(scheduledTime.split(':')[1], 10));
    return d;
  }, [dayOffset, scheduledTime]);

  const previewTask = useMemo(() => ({
    id: 'PREVIEW',
    title: title.trim() || 'Titre du rappel…',
    site: site.label,
    category,
    priority,
    requiresPhoto,
    syncCalendar: syncCal,
    notifyTeam,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    dueDate: previewDate.toISOString(),
    scheduledTime,
    assignedTo,
  }), [title, site, category, priority, requiresPhoto, syncCal, notifyTeam, previewDate, scheduledTime, assignedTo]);

  if (role !== 'admin') return <Redirect href="/(tabs)" />;

  const handleCreate = () => {
    if (!title.trim()) { Alert.alert('Champ requis', 'Le titre est obligatoire.'); return; }
    const newTask = addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      site: site.label,
      category, priority, requiresPhoto,
      syncCalendar: syncCal, notifyTeam,
      dueDate: previewDate.toISOString(),
      scheduledTime,
      assignedTo: assignedTo || undefined,
    });
    if (notifyTeam) {
      pushNotif({ title: 'Nouvelle tâche assignée', body: `${title.trim()} — ${site.label}`, type: 'task', taskId: newTask.id });
    }
    if (syncCal) {
      pushNotif({ title: `Rappel · ${scheduledTime}`, body: title.trim(), type: 'reminder', taskId: newTask.id });
    }
    Alert.alert('✓ Envoyé', `Rappel assigné à ${assignedTo.split(' ')[0]}.`);
    setTitle(''); setDesc('');
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/archibo-logo.png')} style={styles.logo} resizeMode="contain" />
            <View>
              <Text style={styles.headerTitle}>Créer</Text>
              <Text style={styles.headerSub}>Nouveau rappel équipe</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <NotificationBell />
            <ProfileBadge />
          </View>
        </View>

        {/* Aperçu style Google Calendar */}
        {title.trim().length > 0 && (
          <View style={styles.previewWrap}>
            <Text style={styles.previewLabel}>Aperçu dans le planning</Text>
            <CalendarEventBlock task={previewTask} compact />
          </View>
        )}

        <FormSection title="Informations" subtitle="Titre et type de tâche" accent={Colors.orange}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput style={styles.input} placeholder="Ex: Inspection ferraillage…"
            placeholderTextColor={Colors.textDisabled} value={title} onChangeText={setTitle} />
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textarea]} placeholder="Instructions pour l'équipe…"
            placeholderTextColor={Colors.textDisabled} value={description} onChangeText={setDesc} multiline />
          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.chipRow}>
            {TASK_CATEGORIES.map(c => (
              <TouchableOpacity key={c.value}
                style={[styles.chip, category === c.value && { backgroundColor: c.dim, borderColor: c.color }]}
                onPress={() => setCategory(c.value)}>
                <Text style={[styles.chipTxt, category === c.value && { color: c.color, fontWeight: '700' }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormSection>

        <FormSection title="Chantier & Équipe" accent={Colors.teal}>
          <TouchableOpacity style={styles.siteBtn} onPress={() => setSiteOpen(!siteOpen)}>
            <Feather name="map-pin" size={16} color={Colors.teal} />
            <Text style={styles.siteTxt}>{site.label}</Text>
            <Text style={styles.siteZone}>{site.zone}</Text>
            <Feather name="chevron-down" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          {siteOpen && SITES.map(s => (
            <TouchableOpacity key={s.id} style={styles.dropItem} onPress={() => { setSiteId(s.id); setSiteOpen(false); }}>
              <Text style={styles.dropTxt}>{s.label}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.label}>Assigner à (en ligne)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberRow}>
            {members.filter(m => m.isOnline).map(m => (
              <TouchableOpacity key={m.id}
                style={[styles.memberChip, assignedTo === m.name && styles.memberChipOn]}
                onPress={() => setAssignedTo(m.name)}>
                <View style={styles.onlineDot} />
                <Text style={[styles.memberTxt, assignedTo === m.name && styles.memberTxtOn]}>
                  {m.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </FormSection>

        <FormSection title="Planning" subtitle="Date et heure du rappel" accent={Colors.navy}>
          <View style={styles.chipRow}>
            {DATE_OFFSETS.map(d => (
              <TouchableOpacity key={d.days}
                style={[styles.chip, dayOffset === d.days && styles.chipOnNavy]}
                onPress={() => setDayOffset(d.days)}>
                <Text style={[styles.chipTxt, dayOffset === d.days && styles.chipTxtOn]}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.chipRow}>
            {TIME_SLOTS.map(t => (
              <TouchableOpacity key={t}
                style={[styles.chip, scheduledTime === t && styles.chipOnNavy]}
                onPress={() => setScheduledTime(t)}>
                <Text style={[styles.chipTxt, scheduledTime === t && styles.chipTxtOn]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.dateBanner}>
            <Feather name="calendar" size={14} color={Colors.navy} />
            <Text style={styles.dateBannerTxt}>
              {previewDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {scheduledTime}
            </Text>
          </View>
          <Text style={styles.label}>Priorité</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity key={p.value}
                style={[styles.chip, priority === p.value && styles.chipOnNavy]}
                onPress={() => setPriority(p.value)}>
                <Text style={[styles.chipTxt, priority === p.value && styles.chipTxtOn]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormSection>

        <FormSection title="Options" accent={Colors.purple}>
          {[
            { label: 'Photo obligatoire pour valider', val: requiresPhoto, set: setPhoto, color: Colors.warning },
            { label: 'Afficher dans le planning', val: syncCal, set: setSyncCal, color: Colors.teal },
            { label: 'Envoyer un rappel (notification)', val: notifyTeam, set: setNotify, color: Colors.orange },
          ].map((opt, i) => (
            <View key={i} style={[styles.toggleRow, i > 0 && styles.toggleBorder]}>
              <Text style={styles.toggleLabel}>{opt.label}</Text>
              <Toggle value={opt.val} onValueChange={opt.set} activeColor={opt.color} />
            </View>
          ))}
        </FormSection>

        <AnimatedButton
          label={title.trim() ? 'Envoyer le rappel' : 'Saisir un titre'}
          onPress={handleCreate}
          variant="primary" size="lg" icon="send" fullWidth premium
          disabled={!title.trim()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgAlt },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 130 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', gap: 8 },
  logo: { width: 40, height: 40 },
  headerTitle: { color: Colors.navy, fontSize: 22, fontWeight: '800' },
  headerSub: { color: Colors.textMuted, fontSize: 12 },
  previewWrap: { marginBottom: Spacing.md },
  previewLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  label: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  input: {
    backgroundColor: Colors.bgAlt, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: 15,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipOnNavy: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  chipTxt: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  chipTxtOn: { color: '#FFF', fontWeight: '700' },
  siteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgAlt, borderRadius: Radius.md,
    padding: 14, borderWidth: 1, borderColor: Colors.border,
  },
  siteTxt: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  siteZone: { color: Colors.textMuted, fontSize: 11 },
  dropItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderMuted },
  dropTxt: { color: Colors.textSecondary, fontSize: 14 },
  memberRow: { gap: 8 },
  memberChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  memberChipOn: { backgroundColor: Colors.orangeDim, borderColor: Colors.orangeBorder },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.success },
  memberTxt: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  memberTxtOn: { color: Colors.orange, fontWeight: '800' },
  dateBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${Colors.navy}08`, padding: 12, borderRadius: Radius.md,
    borderWidth: 1, borderColor: `${Colors.navy}15`,
  },
  dateBannerTxt: { color: Colors.navy, fontSize: 13, fontWeight: '600', flex: 1 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  toggleBorder: { borderTopWidth: 1, borderTopColor: Colors.borderMuted },
  toggleLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1, paddingRight: 12 },
});
