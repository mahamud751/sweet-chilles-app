import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../../api/client';
import {
  createDashboardVoucher,
  deleteDashboardVoucher,
  fetchDashboardVouchers,
  updateDashboardVoucher,
  type DashboardVoucher,
} from '../../api/growthApi';
import { useBrandStyles } from '../../theme/useBrandStyles';
import FeatureShell from '../FeatureShell';
import {
  AdminAddBar,
  AdminEditModal,
  AdminRowActions,
  VOUCHER_STATUS_OPTIONS,
  VOUCHER_TYPE_OPTIONS,
  canManageRestaurant,
  confirmDelete,
  type AdminFormField,
} from './adminManageUi';

export type AdminVouchersScreenProps = { onBack: () => void };

const emptyVoucherForm = () => ({
  memberEmail: '',
  type: 'LOYALTY',
  percentOff: '15',
  status: 'ACTIVE',
  validUntil: '',
});

const statusColor = (status: string) => {
  if (status === 'ACTIVE') return '#2E7D32';
  if (status === 'REDEEMED') return '#1565C0';
  return '#757575';
};

const AdminVouchersScreen = ({ onBack }: AdminVouchersScreenProps) => {
  const { authToken, primary, staff } = useBrandStyles();
  const canManage = canManageRestaurant(staff);
  const [rows, setRows] = useState<DashboardVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyVoucherForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!authToken) return;
    setLoading(true);
    fetchDashboardVouchers(authToken)
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
    setForm(emptyVoucherForm());
  };

  const openEdit = (v: DashboardVoucher) => {
    setCreating(false);
    setEditId(v.id);
    setForm({
      memberEmail: v.memberEmail,
      type: v.type,
      percentOff: String(v.percentOff),
      status: v.status,
      validUntil: v.validUntil.slice(0, 10),
    });
  };

  const closeModal = () => {
    setEditId(null);
    setCreating(false);
  };

  const save = async () => {
    if (!authToken) return;
    if (creating) {
      if (!form.memberEmail.trim()) {
        Alert.alert('Required', 'Pick a member from the suggestions.');
        return;
      }
    }
    setSaving(true);
    try {
      if (creating) {
        await createDashboardVoucher(authToken, {
          memberEmail: form.memberEmail.trim(),
          type: form.type,
          percentOff: Number(form.percentOff) || 10,
          status: form.status,
          validUntil: form.validUntil.trim() || undefined,
        });
      } else if (editId) {
        await updateDashboardVoucher(authToken, editId, {
          percentOff: Number(form.percentOff),
          status: form.status,
          validUntil: form.validUntil,
        });
      }
      closeModal();
      load();
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof ApiError ? e.message : creating ? 'Could not create reward' : 'Could not update voucher',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = (v: DashboardVoucher) => {
    if (!authToken) return;
    confirmDelete(`Delete ${v.percentOff}% ${v.type} voucher?`, async () => {
      try {
        await deleteDashboardVoucher(authToken, v.id);
        load();
      } catch (e) {
        Alert.alert(
          'Error',
          e instanceof ApiError ? e.message : 'Could not delete voucher',
        );
      }
    });
  };

  const modalVisible = creating || editId != null;

  const formFields: AdminFormField[] = creating
    ? [
        {
          key: 'memberEmail',
          label: 'Member',
          kind: 'memberEmail',
          value: form.memberEmail,
          authToken: authToken ?? '',
        },
        {
          key: 'type',
          label: 'Reward type',
          kind: 'select',
          value: form.type,
          options: [...VOUCHER_TYPE_OPTIONS],
        },
        {
          key: 'percentOff',
          label: 'Discount %',
          value: form.percentOff,
          keyboardType: 'numeric',
        },
        {
          key: 'status',
          label: 'Status',
          kind: 'select',
          value: form.status,
          options: [...VOUCHER_STATUS_OPTIONS],
        },
        {
          key: 'validUntil',
          label: 'Valid until (YYYY-MM-DD, optional)',
          value: form.validUntil,
        },
      ]
    : [
        {
          key: 'percentOff',
          label: 'Discount %',
          value: form.percentOff,
          keyboardType: 'numeric',
        },
        {
          key: 'status',
          label: 'Status',
          kind: 'select',
          value: form.status,
          options: [...VOUCHER_STATUS_OPTIONS],
        },
        {
          key: 'validUntil',
          label: 'Valid until (YYYY-MM-DD)',
          value: form.validUntil,
        },
      ];

  return (
    <FeatureShell
      title="All rewards"
      subtitle={`${rows.length} vouchers`}
      onBack={onBack}
    >
      {canManage ? (
        <AdminAddBar label="Add reward" onPress={openCreate} primaryColor={primary} />
      ) : null}

      {loading ? (
        <ActivityIndicator color={primary} style={{ marginTop: 24 }} />
      ) : rows.length === 0 ? (
        <Text style={styles.empty}>No vouchers yet.</Text>
      ) : (
        rows.map(v => (
          <View key={v.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <Text style={styles.discount}>{v.percentOff}% OFF</Text>
                  <Text style={[styles.status, { color: statusColor(v.status) }]}>
                    {v.status}
                  </Text>
                </View>
                <Text style={styles.type}>{v.type.replace(/_/g, ' ')}</Text>
                <Text style={styles.meta}>
                  {v.memberName} · {v.memberEmail}
                </Text>
                <Text style={styles.meta}>
                  Valid until {new Date(v.validUntil).toLocaleDateString()}
                </Text>
              </View>
              <AdminRowActions
                canManage={canManage}
                primaryColor={primary}
                onEdit={() => openEdit(v)}
                onDelete={() => remove(v)}
              />
            </View>
          </View>
        ))
      )}

      {authToken ? (
        <AdminEditModal
          visible={modalVisible}
          title={creating ? 'Add reward' : 'Edit reward'}
          primaryColor={primary}
          saving={saving}
          saveLabel={creating ? 'Create' : 'Save'}
          fields={formFields}
          onChange={(key, value) => setForm(f => ({ ...f, [key]: value }))}
          onClose={closeModal}
          onSave={save}
        />
      ) : null}
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  discount: { fontSize: 18, fontWeight: '900', color: '#222' },
  status: { fontSize: 12, fontWeight: '800' },
  type: { fontSize: 12, color: '#F15A24', fontWeight: '700', marginTop: 4 },
  meta: { fontSize: 13, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
});

export default AdminVouchersScreen;
