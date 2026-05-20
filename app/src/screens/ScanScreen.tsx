import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import QRCode from 'react-native-qrcode-svg';
import { Camera, CameraType } from 'react-native-camera-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lookupVoucher, redeemVoucher } from '../api/growthApi';
import { useBrandStyles } from '../theme/useBrandStyles';

export type ScanScreenProps = {
  onBack?: () => void;
  onOpenOffers?: () => void;
  staffMode?: boolean;
};

type Mode = 'show' | 'scan';

async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

const ScanScreen = ({ onBack, onOpenOffers, staffMode = false }: ScanScreenProps) => {
  const { primary, member, authToken } = useBrandStyles();
  const [mode, setMode] = useState<Mode>('show');
  const [cameraReady, setCameraReady] = useState(false);
  const lastScanned = useRef('');

  const activeVoucher = member?.activeVouchers?.[0];
  const qrValue = activeVoucher?.qrToken ?? '';

  const voucherLabel = useMemo(() => {
    if (!activeVoucher) return null;
    return `${activeVoucher.percentOff}% off · ${activeVoucher.type}`;
  }, [activeVoucher]);

  const onReadCode = useCallback(
    async (code: string) => {
      const qrToken = code.trim();
      if (!qrToken || qrToken === lastScanned.current) return;
      lastScanned.current = qrToken;
      try {
        const v = await lookupVoucher(qrToken);
        if (!v) {
          Alert.alert('Not found', 'This QR code is not a valid voucher.');
          return;
        }
        const memberLine = v.member?.name
          ? `\nMember: ${v.member.name}`
          : '';
        if (!staffMode) {
          Alert.alert(
            'Voucher found',
            `${v.percentOff}% off · Status: ${v.status}${memberLine}`,
          );
          return;
        }
        if (v.status !== 'ACTIVE') {
          Alert.alert(
            'Cannot redeem',
            `This voucher is ${v.status.toLowerCase()}.${memberLine}`,
          );
          return;
        }
        if (!authToken) {
          Alert.alert('Sign in', 'Staff session expired. Please log in again.');
          return;
        }
        Alert.alert(
          'Redeem voucher?',
          `${v.percentOff}% off (${v.type})${memberLine}`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => { lastScanned.current = ''; } },
            {
              text: 'Redeem',
              onPress: async () => {
                try {
                  const result = await redeemVoucher(authToken, qrToken);
                  Alert.alert(
                    'Redeemed',
                    `Voucher applied for ${result.name}.`,
                  );
                } catch {
                  Alert.alert('Failed', 'Could not redeem this voucher.');
                } finally {
                  lastScanned.current = '';
                }
              },
            },
          ],
        );
      } catch {
        Alert.alert('Not found', 'This QR code is not a valid voucher.');
        lastScanned.current = '';
      }
    },
    [authToken, staffMode],
  );

  const openScanner = async () => {
    const ok = await requestCameraPermission();
    if (!ok) {
      Alert.alert('Camera', 'Camera permission is required to scan QR codes.');
      return;
    }
    setCameraReady(true);
    setMode('scan');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} hitSlop={12}>
              <Icon name="close" size={26} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 26 }} />
          )}
          <Text style={styles.headerTitle}>
            {staffMode ? 'Staff — Scan & Redeem' : 'Scan & Redeem'}
          </Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.tabs}>
          {!staffMode ? (
            <TouchableOpacity
              style={[styles.tab, mode === 'show' && { backgroundColor: primary }]}
              onPress={() => setMode('show')}
            >
              <Text style={[styles.tabText, mode === 'show' && styles.tabTextOn]}>
                My QR
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[
              styles.tab,
              staffMode && styles.tabStaffFull,
              mode === 'scan' && { backgroundColor: primary },
            ]}
            onPress={openScanner}
          >
            <Text style={[styles.tabText, mode === 'scan' && styles.tabTextOn]}>
              Scan QR
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {mode === 'show' ? (
        <View style={styles.showBody}>
          {staffMode ? (
            <>
              <Icon name="qrcode-scan" size={64} color="#666" />
              <Text style={styles.instruction}>
                Tap Scan QR above to open the camera and redeem member vouchers.
              </Text>
            </>
          ) : qrValue ? (
            <>
              <Text style={styles.instruction}>
                Show this code to staff before your bill is totalled.
              </Text>
              {voucherLabel ? (
                <Text style={[styles.voucherLabel, { color: primary }]}>
                  {voucherLabel}
                </Text>
              ) : null}
              <View style={styles.qrWrap}>
                <QRCode value={qrValue} size={220} />
              </View>
              <Text style={styles.token} selectable>
                {qrValue}
              </Text>
            </>
          ) : (
            <>
              <Icon name="ticket-outline" size={56} color="#CCC" />
              <Text style={styles.emptyTitle}>No active voucher</Text>
              <Text style={styles.emptySub}>
                Your rewards appear here when you have an active offer.
              </Text>
              {onOpenOffers ? (
                <TouchableOpacity
                  style={[styles.cta, { backgroundColor: primary }]}
                  onPress={onOpenOffers}
                >
                  <Text style={styles.ctaText}>View My Offers</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>
      ) : cameraReady ? (
        <View style={styles.cameraWrap}>
          <Camera
            style={StyleSheet.absoluteFill}
            cameraType={CameraType.Back}
            scanBarcode
            onReadCode={(event: { nativeEvent: { codeStringValue: string } }) => {
              const code = event.nativeEvent.codeStringValue;
              if (code) onReadCode(code);
            }}
            showFrame
            laserColor={primary}
            frameColor={primary}
          />
          <Text style={styles.scanHint}>Point at a voucher QR code</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A1A1A' },
  safe: { backgroundColor: '#1A1A1A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabStaffFull: { flex: 1 },
  tabText: { color: '#AAA', fontWeight: '700', fontSize: 13 },
  tabTextOn: { color: '#FFF' },
  showBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  instruction: {
    color: '#CCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  voucherLabel: { fontSize: 16, fontWeight: '800', marginBottom: 16 },
  qrWrap: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
  },
  token: {
    color: '#888',
    fontSize: 11,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginTop: 12 },
  emptySub: { color: '#999', fontSize: 14, textAlign: 'center', marginTop: 8 },
  cta: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  ctaText: { color: '#FFF', fontWeight: '800' },
  cameraWrap: { flex: 1, overflow: 'hidden' },
  scanHint: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ScanScreen;
