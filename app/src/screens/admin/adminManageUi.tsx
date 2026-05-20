import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { MemberSearchHit, StaffProfile } from '../../api/growthApi';
import { searchDashboardMembers } from '../../api/growthApi';

export function canManageRestaurant(staff: StaffProfile | null | undefined) {
  return (
    staff?.role === 'RESTAURANT_OWNER' || staff?.role === 'SAVASAACHI_ADMIN'
  );
}

export function confirmDelete(title: string, onConfirm: () => void) {
  Alert.alert(title, 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

type TextField = {
  key: string;
  label: string;
  kind?: 'text';
  value: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
};

type SelectField = {
  key: string;
  label: string;
  kind: 'select';
  value: string;
  options: { label: string; value: string }[];
};

type MemberEmailField = {
  key: string;
  label: string;
  kind: 'memberEmail';
  value: string;
  authToken: string;
};

export type AdminFormField = TextField | SelectField | MemberEmailField;

export type AdminEditModalProps = {
  visible: boolean;
  title: string;
  fields: AdminFormField[];
  onChange: (key: string, value: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  primaryColor: string;
  saveLabel?: string;
};

export function AdminAddBar({
  label,
  onPress,
  primaryColor,
}: {
  label: string;
  onPress: () => void;
  primaryColor: string;
}) {
  return (
    <TouchableOpacity
      style={[addStyles.bar, { borderColor: primaryColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Icon name="plus-circle-outline" size={22} color={primaryColor} />
      <Text style={[addStyles.barText, { color: primaryColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function AdminSelectInput({
  label,
  value,
  options,
  primaryColor,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  primaryColor: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.modalLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map(opt => {
          const selected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                selected && { backgroundColor: primaryColor, borderColor: primaryColor },
              ]}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.85}
            >
              <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function AdminMemberEmailInput({
  label,
  value,
  authToken,
  primaryColor,
  onChange,
}: {
  label: string;
  value: string;
  authToken: string;
  primaryColor: string;
  onChange: (value: string) => void;
}) {
  const [hits, setHits] = useState<MemberSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setHits([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      searchDashboardMembers(authToken, q)
        .then(rows => {
          if (!cancelled) {
            setHits(rows);
            setOpen(rows.length > 0);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setHits([]);
            setOpen(false);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [authToken, value]);

  const pick = (hit: MemberSearchHit) => {
    onChange(hit.email);
    setOpen(false);
    setHits([]);
  };

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.modalLabel}>{label}</Text>
      <TextInput
        style={styles.modalInput}
        value={value}
        onChangeText={t => {
          onChange(t);
          setOpen(true);
        }}
        onFocus={() => {
          if (hits.length > 0) setOpen(true);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Type name or email…"
        placeholderTextColor="#AAA"
      />
      {loading ? (
        <Text style={styles.suggestHint}>Searching…</Text>
      ) : null}
      {open && hits.length > 0 ? (
        <View style={styles.suggestList}>
          {hits.map(hit => (
            <TouchableOpacity
              key={hit.id}
              style={styles.suggestRow}
              onPress={() => pick(hit)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestName}>{hit.name}</Text>
              <Text style={styles.suggestEmail}>{hit.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : value.trim().length >= 2 && !loading && hits.length === 0 ? (
        <Text style={styles.suggestHint}>No members match — check spelling</Text>
      ) : null}
    </View>
  );
}

export function AdminEditModal({
  visible,
  title,
  fields,
  onChange,
  onClose,
  onSave,
  saving = false,
  primaryColor,
  saveLabel = 'Save',
}: AdminEditModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.modalScroll}
          >
            {fields.map(f => {
              if (f.kind === 'select') {
                return (
                  <AdminSelectInput
                    key={f.key}
                    label={f.label}
                    value={f.value}
                    options={f.options}
                    primaryColor={primaryColor}
                    onChange={v => onChange(f.key, v)}
                  />
                );
              }
              if (f.kind === 'memberEmail') {
                return (
                  <AdminMemberEmailInput
                    key={f.key}
                    label={f.label}
                    value={f.value}
                    authToken={f.authToken}
                    primaryColor={primaryColor}
                    onChange={v => onChange(f.key, v)}
                  />
                );
              }
              return (
                <View key={f.key} style={styles.fieldBlock}>
                  <Text style={styles.modalLabel}>{f.label}</Text>
                  <TextInput
                    style={[
                      styles.modalInput,
                      f.multiline && styles.modalInputMulti,
                    ]}
                    value={f.value}
                    onChangeText={t => onChange(f.key, t)}
                    keyboardType={f.keyboardType ?? 'default'}
                    autoCapitalize={
                      f.keyboardType === 'email-address' ? 'none' : 'sentences'
                    }
                    multiline={f.multiline}
                    placeholderTextColor="#AAA"
                  />
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSave, { backgroundColor: primaryColor }]}
              onPress={onSave}
              disabled={saving}
            >
              <Text style={styles.modalSaveText}>
                {saving ? 'Saving…' : saveLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function AdminRowActions({
  canManage,
  onEdit,
  onDelete,
  primaryColor,
}: {
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  primaryColor: string;
}) {
  if (!canManage) return null;
  return (
    <View style={styles.actions}>
      <TouchableOpacity onPress={onEdit} hitSlop={8} style={styles.actionBtn}>
        <Icon name="pencil-outline" size={20} color={primaryColor} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.actionBtn}>
        <Icon name="trash-can-outline" size={20} color="#C62828" />
      </TouchableOpacity>
    </View>
  );
}

export const VOUCHER_STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Redeemed', value: 'REDEEMED' },
  { label: 'Expired', value: 'EXPIRED' },
] as const;

export const VOUCHER_TYPE_OPTIONS = [
  { label: 'Welcome', value: 'WELCOME' },
  { label: 'Return', value: 'RETURN' },
  { label: 'Third', value: 'THIRD' },
  { label: 'Loyalty', value: 'LOYALTY' },
  { label: 'Gold', value: 'GOLD' },
] as const;

export const CAMPAIGN_TYPE_OPTIONS = [
  { label: 'Birthday', value: 'BIRTHDAY' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Quiet day', value: 'QUIET_DAY' },
  { label: 'Seasonal', value: 'SEASONAL' },
  { label: 'System unlock', value: 'SYSTEM_UNLOCK' },
] as const;

export const ENABLED_OPTIONS = [
  { label: 'On', value: 'true' },
  { label: 'Off', value: 'false' },
] as const;

const addStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: '#FFF',
  },
  barText: { fontSize: 15, fontWeight: '800' },
});

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8, marginLeft: 8 },
  actionBtn: { padding: 4 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '88%',
  },
  modalScroll: { maxHeight: 420 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#222', marginBottom: 16 },
  fieldBlock: { marginBottom: 4 },
  modalLabel: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 6 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 15,
    backgroundColor: '#FFF',
  },
  modalInputMulti: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#F5F5F5',
  },
  chipText: { fontSize: 13, fontWeight: '700', color: '#555' },
  chipTextOn: { color: '#FFF' },
  suggestList: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  suggestRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
  },
  suggestName: { fontSize: 14, fontWeight: '700', color: '#222' },
  suggestEmail: { fontSize: 12, color: '#666', marginTop: 2 },
  suggestHint: { fontSize: 12, color: '#888', marginBottom: 10, marginTop: -4 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  modalCancelText: { fontWeight: '700', color: '#666' },
  modalSave: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  modalSaveText: { fontWeight: '800', color: '#FFF' },
});
