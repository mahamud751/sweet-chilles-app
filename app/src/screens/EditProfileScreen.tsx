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
  changeMemberPassword,
  updateMemberProfile,
  uploadMemberAvatar,
  type MemberProfile,
} from '../api/growthApi';
import { resolveAvatarUrl } from '../config/media';
import { useBrandStyles } from '../theme/useBrandStyles';

const PAGE_BG = '#F8F8F8';
const BROWN = '#3E2723';

export type EditProfileScreenProps = {
  onClose: () => void;
  onSaved: (member: MemberProfile) => void;
  initialShowPassword?: boolean;
};

function formatBirthdayInput(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

const EditProfileScreen = ({
  onClose,
  onSaved,
  initialShowPassword = false,
}: EditProfileScreenProps) => {
  const { primary, member, authToken, btnPrimary, btnPrimaryText } =
    useBrandStyles();

  const [name, setName] = useState(member?.name ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [phone, setPhone] = useState(member?.phone ?? '');
  const [birthday, setBirthday] = useState(formatBirthdayInput(member?.birthday));
  const [localAvatarUri, setLocalAvatarUri] = useState<string | undefined>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(initialShowPassword);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const displayAvatar = useMemo(() => {
    if (localAvatarUri) return localAvatarUri;
    return resolveAvatarUrl(member?.avatarUrl);
  }, [localAvatarUri, member?.avatarUrl]);

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

  const handleSave = async () => {
    if (!authToken || !member) {
      setError('Please sign in to update your profile.');
      return;
    }
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (showPasswordFields) {
      if (!currentPassword || !newPassword) {
        setError('Enter current and new password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setSaving(true);
    setError('');
    try {
      let profile = await updateMemberProfile(authToken, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        birthday: birthday.trim() || '',
      });

      if (localAvatarUri && localAvatarUri !== resolveAvatarUrl(member.avatarUrl)) {
        profile = await uploadMemberAvatar(
          authToken,
          avatarFileFromUri(localAvatarUri),
        );
      }

      if (showPasswordFields && newPassword) {
        await changeMemberPassword(authToken, currentPassword, newPassword);
      }

      onSaved(profile);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-left" size={26} color={BROWN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollInner}
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

          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Birthday</Text>
            <TextInput
              style={styles.input}
              value={birthday}
              onChangeText={setBirthday}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPasswordFields(v => !v)}
            activeOpacity={0.7}
          >
            <Icon
              name={showPasswordFields ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={primary}
            />
            <Text style={[styles.passwordToggleText, { color: primary }]}>
              {showPasswordFields ? 'Hide password change' : 'Change password'}
            </Text>
          </TouchableOpacity>

          {showPasswordFields ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Current password</Text>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>New password</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Confirm new password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.saveBtn, btnPrimary, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.88}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[styles.saveBtnText, btnPrimaryText]}>Save changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },
  flex: { flex: 1 },
  safe: { backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '900',
    color: BROWN,
  },
  headerSpacer: { width: 26 },
  scrollInner: { paddingHorizontal: 20, paddingTop: 20 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    backgroundColor: '#FFF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  camBadge: {
    position: 'absolute',
    right: '28%',
    bottom: 28,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  changePhoto: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
  },
  field: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#757575',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212121',
  },
  passwordToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    marginTop: 4,
  },
  passwordToggleText: { fontSize: 14, fontWeight: '700' },
  error: {
    color: '#C62828',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: 16, fontWeight: '800' },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
});

export default EditProfileScreen;
