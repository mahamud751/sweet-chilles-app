import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../../api/client';
import {
  createDashboardMember,
  deleteDashboardMember,
  fetchDashboardMembers,
  updateDashboardMember,
  type DashboardMember,
} from '../../api/growthApi';
import { useBrandStyles } from '../../theme/useBrandStyles';
import FeatureShell from '../FeatureShell';
import {
  AdminAddBar,
  AdminEditModal,
  AdminRowActions,
  canManageRestaurant,
  confirmDelete,
} from './adminManageUi';

export type AdminMembersScreenProps = { onBack: () => void };

const emptyMemberForm = () => ({
  name: '',
  email: '',
  phone: '',
  password: '',
});

const AdminMembersScreen = ({ onBack }: AdminMembersScreenProps) => {
  const { authToken, primary, staff } = useBrandStyles();
  const canManage = canManageRestaurant(staff);
  const [rows, setRows] = useState<DashboardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyMemberForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!authToken) return;
    setLoading(true);
    fetchDashboardMembers(authToken)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [authToken]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditId(null);
    setCreating(true);
    setForm(emptyMemberForm());
  };

  const openEdit = (m: DashboardMember) => {
    setCreating(false);
    setEditId(m.id);
    setForm({
      name: m.name,
      email: m.email,
      phone: m.phone ?? '',
      password: '',
    });
  };

  const closeModal = () => {
    setEditId(null);
    setCreating(false);
  };

  const save = async () => {
    if (!authToken) return;
    if (creating) {
      if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
        Alert.alert('Required', 'Name, email, and password (min 6 characters) are required.');
        return;
      }
    }
    setSaving(true);
    try {
      if (creating) {
        await createDashboardMember(authToken, {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          password: form.password,
          issueWelcomeVoucher: true,
        });
      } else if (editId) {
        await updateDashboardMember(authToken, editId, {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        });
      }
      closeModal();
      load();
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof ApiError ? e.message : creating ? 'Could not create member' : 'Could not update member',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = (m: DashboardMember) => {
    if (!authToken) return;
    confirmDelete(`Delete ${m.name}?`, async () => {
      try {
        await deleteDashboardMember(authToken, m.id);
        load();
      } catch (e) {
        Alert.alert(
          'Error',
          e instanceof ApiError ? e.message : 'Could not delete member',
        );
      }
    });
  };

  const modalVisible = creating || editId != null;

  return (
    <FeatureShell
      title="All members"
      subtitle={`${rows.length} loyalty members`}
      onBack={onBack}
    >
      {canManage ? (
        <AdminAddBar label="Add member" onPress={openCreate} primaryColor={primary} />
      ) : null}

      {loading ? (
        <ActivityIndicator color={primary} style={{ marginTop: 24 }} />
      ) : rows.length === 0 ? (
        <Text style={styles.empty}>No members yet.</Text>
      ) : (
        rows.map(m => (
          <View key={m.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardBody}>
                <Text style={styles.name}>{m.name}</Text>
                <Text style={styles.meta}>{m.email}</Text>
                {m.phone ? <Text style={styles.meta}>{m.phone}</Text> : null}
                <Text style={styles.tag}>
                  {m.loyaltyStage.replace(/_/g, ' ')}
                  {m.isGoldMember ? ' · Gold' : ''} · {m.voucherCount} vouchers
                </Text>
              </View>
              <AdminRowActions
                canManage={canManage}
                primaryColor={primary}
                onEdit={() => openEdit(m)}
                onDelete={() => remove(m)}
              />
            </View>
          </View>
        ))
      )}

      <AdminEditModal
        visible={modalVisible}
        title={creating ? 'New member' : 'Edit member'}
        primaryColor={primary}
        saving={saving}
        saveLabel={creating ? 'Create' : 'Save'}
        fields={
          creating
            ? [
                { key: 'name', label: 'Name', value: form.name },
                { key: 'email', label: 'Email', value: form.email, keyboardType: 'email-address' },
                { key: 'phone', label: 'Phone (optional)', value: form.phone },
                { key: 'password', label: 'Password (min 6)', value: form.password },
              ]
            : [
                { key: 'name', label: 'Name', value: form.name },
                { key: 'email', label: 'Email', value: form.email, keyboardType: 'email-address' },
                { key: 'phone', label: 'Phone', value: form.phone },
              ]
        }
        onChange={(key, value) => setForm(f => ({ ...f, [key]: value }))}
        onClose={closeModal}
        onSave={save}
      />
    </FeatureShell>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: '#222' },
  meta: { fontSize: 13, color: '#666', marginTop: 4 },
  tag: { fontSize: 12, color: '#888', marginTop: 6, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
});

export default AdminMembersScreen;
