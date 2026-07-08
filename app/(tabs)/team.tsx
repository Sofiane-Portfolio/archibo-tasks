import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, Alert, ScrollView, StatusBar, Image, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { Redirect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTeamStore, ROLES, MEMBER_ACCENTS } from '../../store/teamStore';
import { useTasksStore } from '../../store/tasksStore';
import { useAuthStore } from '../../store/authStore';
import { TeamMemberCard } from '../../components/TeamMemberCard';
import { TeamAvailabilityStrip } from '../../components/TeamAvailabilityStrip';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { ProfileBadge } from '../../components/ui/ProfileBadge';
import { NotificationBell } from '../../components/NotificationBell';
import { Colors, Radius, Spacing } from '../../constants/theme';
import type { TeamMember, TeamRole, TeamStatus } from '../../types';

type ModalMode = 'add' | 'edit';
type StatusFilter = 'all' | TeamStatus | 'online';

interface Form { name: string; role: TeamRole; status: TeamStatus; phone: string; email: string; }
const EMPTY: Form = { name: '', role: 'Architecte Junior', status: 'in_office', phone: '', email: '' };
const getInitials = (n: string) => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'online', label: 'En ligne' },
  { value: 'on_site', label: 'Sur site' },
  { value: 'in_office', label: 'Bureau' },
  { value: 'unavailable', label: 'Absent' },
];

export default function TeamScreen() {
  const { members, addMember, updateMember, deleteMember, toggleOnline } = useTeamStore();
  const { tasks } = useTasksStore();
  const role = useAuthStore(s => s.role);
  const insets = useSafeAreaInsets();
  const [modalVisible, setModal] = useState(false);
  const [mode, setMode] = useState<ModalMode>('add');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return members;
    if (filter === 'online') return members.filter(m => m.isOnline);
    return members.filter(m => m.status === filter);
  }, [members, filter]);

  if (role !== 'admin') return <Redirect href="/(tabs)" />;

  const onlineCount = members.filter(m => m.isOnline).length;
  const taskCountFor = (name: string) =>
    tasks.filter(t => t.assignedTo === name && t.status !== 'done').length;

  const openAdd = () => { setForm(EMPTY); setEditId(null); setMode('add'); setModal(true); };
  const openEdit = (m: TeamMember) => {
    setForm({ name: m.name, role: m.role, status: m.status, phone: m.phone ?? '', email: m.email ?? '' });
    setEditId(m.id); setMode('edit'); setModal(true);
  };
  const handleDelete = (m: TeamMember) => {
    Alert.alert('Supprimer', `Retirer ${m.name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteMember(m.id) },
    ]);
  };
  const handleSave = () => {
    if (!form.name.trim()) { Alert.alert('Requis', 'Le nom est obligatoire.'); return; }
    const accent = MEMBER_ACCENTS[members.length % MEMBER_ACCENTS.length];
    const isOnline = form.status !== 'unavailable';
    if (mode === 'add') {
      addMember({
        name: form.name.trim(), role: form.role, status: form.status, isOnline,
        initials: getInitials(form.name.trim()), accentColor: accent,
        phone: form.phone.trim() || undefined, email: form.email.trim() || undefined,
      });
    } else if (editId) {
      updateMember(editId, {
        name: form.name.trim(), role: form.role, status: form.status, isOnline,
        initials: getInitials(form.name.trim()),
        phone: form.phone.trim() || undefined, email: form.email.trim() || undefined,
      });
    }
    setModal(false);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/archibo-logo.png')} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.headerTitle}>Équipe</Text>
            <Text style={styles.headerSub}>{onlineCount}/{members.length} en ligne</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <NotificationBell />
          <ProfileBadge />
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Feather name="user-plus" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <TeamAvailabilityStrip />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipOn]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterTxt, filter === f.value && styles.filterTxtOn]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={m => m.id}
        renderItem={({ item }) => (
          <TeamMemberCard
            member={item}
            taskCount={taskCountFor(item.name)}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item)}
            onToggleOnline={() => toggleOnline(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun collaborateur</Text>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModal(false)} />
          <View style={styles.sheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>
                {mode === 'add' ? 'Nouveau collaborateur' : 'Modifier le profil'}
              </Text>

              <Text style={styles.mLabel}>NOM *</Text>
              <TextInput style={styles.mInput} placeholder="Ex: Ahmed Ben Salah"
                placeholderTextColor={Colors.textDisabled}
                value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />

              <Text style={styles.mLabel}>RÔLE</Text>
              <View style={styles.roleGrid}>
                {ROLES.map(r => (
                  <TouchableOpacity key={r} style={[styles.roleChip, form.role === r && styles.roleChipOn]}
                    onPress={() => setForm(f => ({ ...f, role: r }))}>
                    <Text style={[styles.roleTxt, form.role === r && styles.roleTxtOn]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.mLabel}>STATUT</Text>
              <View style={styles.statusRow}>
                {([
                  { value: 'on_site' as TeamStatus, label: 'Sur site' },
                  { value: 'in_office' as TeamStatus, label: 'Bureau' },
                  { value: 'unavailable' as TeamStatus, label: 'Absent' },
                ]).map(s => (
                  <TouchableOpacity key={s.value}
                    style={[styles.statusChip, form.status === s.value && styles.statusChipOn]}
                    onPress={() => setForm(f => ({ ...f, status: s.value }))}>
                    <Text style={[styles.statusTxt, form.status === s.value && styles.statusTxtOn]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.mLabel}>TÉLÉPHONE</Text>
              <TextInput style={styles.mInput} placeholder="+216 XX XXX XXX"
                placeholderTextColor={Colors.textDisabled}
                value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />

              <AnimatedButton
                label={mode === 'add' ? "Ajouter" : 'Enregistrer'}
                onPress={handleSave}
                variant="primary" size="lg" fullWidth premium
                disabled={!form.name.trim()}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderMuted,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 38, height: 38 },
  headerTitle: { color: Colors.navy, fontSize: 20, fontWeight: '800' },
  headerSub: { color: Colors.textMuted, fontSize: 12, marginTop: 1 },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.orange, alignItems: 'center', justifyContent: 'center',
  },
  filters: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipOn: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  filterTxt: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  filterTxtOn: { color: '#FFF', fontWeight: '700' },
  list: { paddingTop: Spacing.sm, paddingBottom: 120 },
  empty: { textAlign: 'center', color: Colors.textMuted, paddingTop: 40 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  overlay: { flex: 1, backgroundColor: 'rgba(28,28,46,0.5)' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg, paddingBottom: 40, maxHeight: '88%',
  },
  handle: {
    width: 36, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: Spacing.lg,
  },
  sheetTitle: { color: Colors.navy, fontSize: 18, fontWeight: '800', marginBottom: Spacing.lg },
  mLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginTop: 12 },
  mInput: {
    backgroundColor: Colors.bgAlt, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: 14,
  },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.sm,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  roleChipOn: { backgroundColor: Colors.orangeDim, borderColor: Colors.orangeBorder },
  roleTxt: { color: Colors.textMuted, fontSize: 12 },
  roleTxtOn: { color: Colors.orange, fontWeight: '700' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusChip: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  statusChipOn: { backgroundColor: Colors.tealDim, borderColor: `${Colors.teal}40` },
  statusTxt: { color: Colors.textMuted, fontSize: 11, fontWeight: '600' },
  statusTxtOn: { color: Colors.teal, fontWeight: '700' },
});
