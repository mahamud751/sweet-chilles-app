import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  type ImageSourcePropType,
  type NativeSyntheticEvent,
  type ImageLoadEventData,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { isValidLogin } from '../sessionUser';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');

/** Bundled copy of latest design (853×1844); replace `src/assets/welcome-bg.png` anytime. */
const WELCOME_BG_LOCAL = require('../assets/welcome-bg.png');

const WELCOME_BG_REMOTE_URIS = [
  'https://i.ibb.co.com/0prK7kwD/Chat-GPT-Image-May-15-2026-02-07-56-AM.png',
  'https://i.ibb.co/0prK7kwD/Chat-GPT-Image-May-15-2026-02-07-56-AM.png',
  'https://i.ibb.co/VK0bpnY/Chat-GPT-Image-May-15-2026-01-32-16-AM.png',
  'https://i.ibb.co.com/TBcnCcBn/Chat-GPT-Image-May-15-2026-01-51-59-AM.png',
  'https://i.ibb.co/TBcnCcBn/Chat-GPT-Image-May-15-2026-01-51-59-AM.png',
] as const;

/** Known intrinsic size of current bundled asset (used until `onLoad` runs). */
const INTRINSIC_W = 853;
const INTRINSIC_H = 1844;

const ORANGE = '#F15A24';
const BG = '#FFFFFF';

/** Top of scroll content: align with white band under logo (tall asset ≈ 853×1844). */
const CONTENT_START_FRACTION = 0.24;
const CONTENT_PAD_TOP_MAX_FR = 0.36;

export type WelcomeScreenProps = {
  onContinue?: () => void;
};

const WelcomeScreen = ({ onContinue }: WelcomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remoteIdx, setRemoteIdx] = useState(0);
  const [bgHeight, setBgHeight] = useState(
    (SCREEN_W / INTRINSIC_W) * INTRINSIC_H,
  );

  const heroSource: ImageSourcePropType = useMemo(() => {
    if (remoteIdx >= WELCOME_BG_REMOTE_URIS.length) {
      return WELCOME_BG_LOCAL;
    }
    return { uri: WELCOME_BG_REMOTE_URIS[remoteIdx] };
  }, [remoteIdx]);

  const onHeroError = () => {
    setRemoteIdx(i => Math.min(i + 1, WELCOME_BG_REMOTE_URIS.length));
  };

  const onHeroLoad = useCallback(
    (e: NativeSyntheticEvent<ImageLoadEventData>) => {
      const { width: w, height: h } = e.nativeEvent.source;
      if (w > 0 && h > 0) {
        setBgHeight((SCREEN_W / w) * h);
      }
    },
    [],
  );

  const contentPadTop = useMemo(() => {
    const fromArt = Math.round(bgHeight * CONTENT_START_FRACTION);
    const cap = Math.round(SCREEN_H * CONTENT_PAD_TOP_MAX_FR);
    return Math.max(insets.top + 4, Math.min(fromArt, cap));
  }, [bgHeight, insets.top]);

  return (
    <SafeAreaView style={styles.safeRoot} edges={['bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View style={styles.root}>
        <Image
          key={
            remoteIdx >= WELCOME_BG_REMOTE_URIS.length
              ? 'local'
              : WELCOME_BG_REMOTE_URIS[remoteIdx]
          }
          source={heroSource}
          style={[styles.fullBg, { height: bgHeight }]}
          resizeMode="cover"
          defaultSource={WELCOME_BG_LOCAL}
          onLoad={onHeroLoad}
          onError={onHeroError}
          accessibilityRole="image"
          accessibilityLabel="Sweet Chillies welcome background"
        />

        <View style={styles.contentLayer}>
          <View
            style={[
              styles.contentInner,
              { paddingTop: contentPadTop, paddingBottom: insets.bottom + 12 },
            ]}
          >
            <View style={styles.titleBlock}>
              <Text style={styles.subTxt}>
                Great food, great offers and{'\n'}
                great experiences await you.
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputBox}>
                <Icon name="mail" size={20} color={ORANGE} />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  style={styles.textInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={t => {
                    setEmail(t);
                    setError('');
                  }}
                />
              </View>

              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputBox}>
                <Icon name="lock" size={20} color={ORANGE} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  style={styles.textInput}
                  secureTextEntry
                  value={password}
                  onChangeText={t => {
                    setPassword(t);
                    setError('');
                  }}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.mainBtn}
                activeOpacity={0.8}
                onPress={() => {
                  if (isValidLogin(email, password)) {
                    setError('');
                    onContinue?.();
                  } else {
                    setError('Invalid email or password.');
                  }
                }}
              >
                <Text style={styles.mainBtnText}>Log in</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.orTxt}>OR</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.85}
              onPress={() =>
                setError('Please sign in with your email and password.')
              }
            >
              <Icon name="facebook" size={20} color="#1877F2" />
              <Text style={styles.socialBtnTxt}>Continue with Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              activeOpacity={0.85}
              onPress={() =>
                setError('Please sign in with your email and password.')
              }
            >
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
                }}
                style={styles.googleIcon}
              />
              <Text style={styles.socialBtnTxt}>Continue with Google</Text>
            </TouchableOpacity>

            <Text style={styles.termsTxt}>
              By continuing, you agree to our{'\n'}
              <Text style={styles.linkTxt}>Terms & Conditions</Text> and{' '}
              <Text style={styles.linkTxt}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    backgroundColor: BG,
  },
  root: {
    flex: 1,
    backgroundColor: BG,
    overflow: 'hidden',
  },
  fullBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_W,
    zIndex: 0,
  },
  contentLayer: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  contentInner: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  titleBlock: {
    alignItems: 'center',
    paddingHorizontal: 28,
    marginTop: -6,
  },
  welcomeTxt: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  brandTxt: {
    fontSize: 32,
    fontWeight: 'bold',
    color: ORANGE,
    marginTop: 2,
  },
  subTxt: {
    textAlign: 'center',
    color: '#666',
    marginTop: 80,
    marginBottom: 14,
    lineHeight: 22,
    fontSize: 15,
  },
  formContainer: {
    paddingHorizontal: 25,
    marginTop: 8,
  },
  inputLabel: {
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    fontSize: 14,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 58,
    backgroundColor: 'rgba(255,255,255,0.92)',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  mainBtn: {
    backgroundColor: ORANGE,
    height: 58,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    elevation: 4,
  },
  mainBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
    paddingHorizontal: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  orTxt: {
    marginHorizontal: 15,
    color: '#888',
    fontWeight: '600',
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 55,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  socialBtnTxt: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  termsTxt: {
    textAlign: 'center',
    color: '#777',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 20,
  },
  linkTxt: {
    color: ORANGE,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
