import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '../api/client';
import {
  changeStaffPassword,
  updateStaffProfile,
  uploadStaffAvatar,
  type StaffProfile,
} from '../api/growthApi';
import { resolveAvatarUrl } from '../config/media';
import { useBrandStyles } from '../theme/useBrandStyles';

const BROWN = '#3E2723';

export type EditStaffProfileScreenProps = {
  onClose: () => void;
  onSaved: (staff: StaffProfile) => void;
  initialShowPassword?: boolean;
};

const EditStaffProfileScreen = ({
  onClose,
  onSaved,
  initialShowPassword = false,
}: EditStaffProfileScreenProps) => {
  const { primary, staff, authToken, btnPrimary, btnPrimaryText } =
    useBrandStyles();
  const [displayName, setDisplayName] = useState(staff?.displayName ?? '');
  const [email, setEmail] = useState(staff?.email ?? '');
  const [localAvatarUri, setLocalAvatarUri] = useState<string | undefined>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(initialShowPassword);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const displayAvatar = useMemo(() => {
    if (localAvatarUri) return localAvatarUri;
    return resolveAvatarUrl(staff?.avatarUrl);
  }, [localAvatarUri, staff?.avatarUrl]);

  const pickImage = useCallback(() => {
    Alert.alert('Profile photo', 'Choose a source', [
      {
        text: 'Photo library',
        onPress: async () => {
          const result = await launchImageLibrary({
            mediaType: 'photo',
            maxWidth: 1024,
            maxHeight: 1024,
          });
          const asset = result.assets?.[0];
          if (asset?.uri) setLocalAvatarUri(asset.uri);
        },
      },
      {
        text: 'Camera',
        onPress: async () => {
          const result = await launchCamera({
            mediaType: 'photo',
            maxWidth: 1024,
            maxHeight: 1024,
            saveToPhotos: false,
          });
          const asset = result.assets?.[0];
          if (asset?.uri) setLocalAvatarUri(asset.uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  const avatarFileFromUri = (uri: string): { uri: string; name: string; type: string } => {
    const lower = uri.toLowerCase();
    if (lower.includes('.png')) {
      return { uri, name: 'avatar.png', type: 'image/png' };
    }
    if (lower.includes('.webp')) {
      return { uri, name: 'avatar.webp', type: 'image/webp' };
    }
    return { uri, name: 'avatar.jpg', type: 'image/jpeg' };
  };

  const save = async () => {
    if (!authToken) return;
    setSaving(true);
    setError('');
    try {
      if (showPasswordFields) {
        if (newPassword !== confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        if (newPassword.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        await changeStaffPassword(authToken, currentPassword, newPassword);
      }
      let updated = await updateStaffProfile(authToken, {
        displayName: displayName.trim(),
        email: email.trim(),
      });
      if (
        localAvatarUri &&
        localAvatarUri !== resolveAvatarUrl(staff?.avatarUrl)
      ) {
        updated = await uploadStaffAvatar(
          authToken,
          avatarFileFromUri(localAvatarUri),
        );
      }
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Icon name="close" size={26} color={BROWN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit account</Text>
          <View style={{ width: 26 }} />
        </View>
      </SafeAreaView>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={pickImage}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
          >
            <View style={styles.avatarRing}>
              {displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.avatarImg} />
              ) : (
                <Icon name="face-man-profile" size={64} color="#FF8A65" />
              )}
            </View>
            <View style={[styles.camBadge, { backgroundColor: primary }]}>
              <Icon name="camera" size={16} color="#FFF" />
            </View>
            <Text style={[styles.changePhoto, { color: primary }]}>
              Change photo
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Display name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => setShowPasswordFields(v => !v)}
          >
            <Icon name="lock-outline" size={20} color={primary} />
            <Text style={[styles.linkText, { color: primary }]}>
              {showPasswordFields ? 'Hide password change' : 'Change password'}
            </Text>
          </TouchableOpacity>
          {showPasswordFields ? (
            <>
              <Text style={styles.label}>Current password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <Text style={styles.label}>New password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Text style={styles.label}>Confirm new password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.saveBtn, btnPrimary]}
            onPress={save}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[styles.saveBtnText, btnPrimaryText]}>Save changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F8F8' },
  flex: { flex: 1 },
  safe: { backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: BROWN },
  body: { padding: 20, paddingBottom: 40 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: 'hidden',
    backgroundColor: '#FFF3E0',
    borderWidth: 3,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  camBadge: {
    position: 'absolute',
    right: '32%',
    bottom: 28,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  changePhoto: { marginTop: 10, fontWeight: '700', fontSize: 14 },
  label: { fontWeight: '700', marginBottom: 8, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  linkText: { fontWeight: '700', fontSize: 14 },
  error: { color: '#C62828', marginBottom: 12 },
  saveBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '800' },
});

export default EditStaffProfileScreen;
