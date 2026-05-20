import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiError } from '../../api/client';
import {
  createDashboardCampaign,
  deleteDashboardCampaign,
  fetchDashboardCampaigns,
  updateDashboardCampaign,
  type CampaignTemplate,
} from '../../api/growthApi';
import { useBrandStyles } from '../../theme/useBrandStyles';
import FeatureShell from '../FeatureShell';
import {
  AdminAddBar,
  AdminEditModal,
  AdminRowActions,
  CAMPAIGN_TYPE_OPTIONS,
  ENABLED_OPTIONS,
  canManageRestaurant,
  confirmDelete,
  type AdminFormField,
} from './adminManageUi';

export type AdminOffersScreenProps = { onBack: () => void };

const emptyCampaignForm = () => ({
  type: 'SEASONAL',
  title: '',
  bodyTemplate: '',
  isEnabled: 'true',
});

const AdminOffersScreen = ({ onBack }: AdminOffersScreenProps) => {
  const { authToken, primary, staff } = useBrandStyles();
  const canManage = canManageRestaurant(staff);
  const [rows, setRows] = useState<CampaignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyCampaignForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!authToken) return;
    setLoading(true);
    fetchDashboardCampaigns(authToken)
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
    const used = new Set(rows.map(r => r.type));
    const firstFree = CAMPAIGN_TYPE_OPTIONS.find(o => !used.has(o.value));
    setForm({
      ...emptyCampaignForm(),
      type: firstFree?.value ?? 'SEASONAL',
    });
  };

  const openEdit = (c: CampaignTemplate) => {
    setCreating(false);
    setEditId(c.id);
    setForm({
      type: c.type,
      title: c.title,
      bodyTemplate: c.bodyTemplate,
      isEnabled: c.isEnabled ? 'true' : 'false',
    });
  };

  const closeModal = () => {
    setEditId(null);
    setCreating(false);
  };

  const save = async () => {
    if (!authToken) return;
    if (!form.title.trim() || !form.bodyTemplate.trim()) {
      Alert.alert('Required', 'Title and message are required.');
      return;
    }
    setSaving(true);
    try {
      if (creating) {
        await createDashboardCampaign(authToken, {
          type: form.type.trim().toUpperCase(),
          title: form.title.trim(),
          bodyTemplate: form.bodyTemplate.trim(),
          isEnabled: form.isEnabled === 'true',
        });
      } else if (editId) {
        await updateDashboardCampaign(authToken, editId, {
          title: form.title.trim(),
          bodyTemplate: form.bodyTemplate.trim(),
          isEnabled: form.isEnabled === 'true',
        });
      }
      closeModal();
      load();
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof ApiError ? e.message : creating ? 'Could not create campaign' : 'Could not update campaign',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = (c: CampaignTemplate) => {
    if (!authToken) return;
    confirmDelete(`Delete "${c.title}"?`, async () => {
      try {
        await deleteDashboardCampaign(authToken, c.id);
        load();
      } catch (e) {
        Alert.alert(
          'Error',
          e instanceof ApiError ? e.message : 'Could not delete campaign',
        );
      }
    });
  };

  const toggleEnabled = async (c: CampaignTemplate) => {
    if (!authToken || !canManage) return;
    try {
      await updateDashboardCampaign(authToken, c.id, {
        isEnabled: !c.isEnabled,
      });
      load();
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof ApiError ? e.message : 'Could not update',
      );
    }
  };

  const modalVisible = creating || editId != null;
  const usedTypes = new Set(rows.map(r => r.type));
  const typeOptions = creating
    ? CAMPAIGN_TYPE_OPTIONS.filter(o => !usedTypes.has(o.value))
    : [...CAMPAIGN_TYPE_OPTIONS];

  const formFields: AdminFormField[] = creating
    ? [
        {
          key: 'type',
          label: 'Campaign type',
          kind: 'select',
          value: form.type,
          options: typeOptions.length > 0 ? [...typeOptions] : [...CAMPAIGN_TYPE_OPTIONS],
        },
        { key: 'title', label: 'Title', value: form.title },
        {
          key: 'bodyTemplate',
          label: 'Message',
          value: form.bodyTemplate,
          multiline: true,
        },
        {
          key: 'isEnabled',
          label: 'Status',
          kind: 'select',
          value: form.isEnabled,
          options: [...ENABLED_OPTIONS],
        },
      ]
    : [
        { key: 'title', label: 'Title', value: form.title },
        {
          key: 'bodyTemplate',
          label: 'Message',
          value: form.bodyTemplate,
          multiline: true,
        },
        {
          key: 'isEnabled',
          label: 'Status',
          kind: 'select',
          value: form.isEnabled,
          options: [...ENABLED_OPTIONS],
        },
      ];

  return (
    <FeatureShell
      title="Offers & campaigns"
      subtitle="Engagement templates"
      onBack={onBack}
    >
      {canManage ? (
        <AdminAddBar label="Add campaign" onPress={openCreate} primaryColor={primary} />
      ) : null}

      {loading ? (
        <ActivityIndicator color={primary} style={{ marginTop: 24 }} />
      ) : rows.length === 0 ? (
        <Text style={styles.empty}>No campaigns configured.</Text>
      ) : (
        rows.map(c => (
          <View key={c.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <Text style={styles.title}>{c.title}</Text>
                  {canManage ? (
                    <TouchableOpacity onPress={() => toggleEnabled(c)}>
                      <Text style={[styles.badge, c.isEnabled && styles.badgeOn]}>
                        {c.isEnabled ? 'On' : 'Off'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.badge, c.isEnabled && styles.badgeOn]}>
                      {c.isEnabled ? 'On' : 'Off'}
                    </Text>
                  )}
                </View>
                <Text style={styles.type}>{c.type.replace(/_/g, ' ')}</Text>
                <Text style={styles.body}>{c.bodyTemplate}</Text>
              </View>
              <AdminRowActions
                canManage={canManage}
                primaryColor={primary}
                onEdit={() => openEdit(c)}
                onDelete={() => remove(c)}
              />
            </View>
          </View>
        ))
      )}

      <AdminEditModal
        visible={modalVisible}
        title={creating ? 'New campaign' : 'Edit campaign'}
        primaryColor={primary}
        saving={saving}
        saveLabel={creating ? 'Create' : 'Save'}
        fields={formFields}
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: '800', color: '#222', flex: 1, marginRight: 8 },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#888',
    backgroundColor: '#EEE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeOn: { backgroundColor: '#E8F5E9', color: '#2E7D32' },
  type: { fontSize: 11, color: '#F15A24', fontWeight: '700', marginTop: 6 },
  body: { fontSize: 13, color: '#555', marginTop: 8, lineHeight: 19 },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
});

export default AdminOffersScreen;
