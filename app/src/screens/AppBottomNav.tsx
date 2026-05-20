import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBrandStyles } from '../theme/useBrandStyles';

import type { FooterNavKey } from './screenNav';

export type AppBottomNavActive = 'home' | 'offers' | 'wallet' | 'profile';

export type AppBottomNavProps = {
  active: AppBottomNavActive;
  onSelect: (key: FooterNavKey) => void;
  variant?: 'member' | 'staff';
  scanSelected?: boolean;
};

const AppBottomNav = ({
  active,
  onSelect,
  variant = 'member',
  scanSelected = false,
}: AppBottomNavProps) => {
  const insets = useSafeAreaInsets();
  const { primary } = useBrandStyles();

  if (variant === 'staff') {
    return (
      <View
        style={[styles.bottomBar, styles.staffBar, { paddingBottom: insets.bottom + 10 }]}
        accessibilityRole="tablist"
      >
        <View style={styles.staffSpacer} />
        <View style={styles.scanGroup}>
          <TouchableOpacity
            style={[styles.scanCircle, { backgroundColor: primary }]}
            activeOpacity={0.88}
            onPress={() => onSelect('scan')}
            accessibilityRole="button"
            accessibilityLabel="Scan QR code"
            accessibilityState={{ selected: scanSelected }}
          >
            <Icon name="qrcode-scan" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text
            style={
              scanSelected
                ? [styles.tabActive, { color: primary }]
                : styles.tabText
            }
          >
            Scan
          </Text>
        </View>
        <TouchableOpacity
          style={styles.staffProfileTab}
          activeOpacity={0.7}
          onPress={() => onSelect('profile')}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === 'profile' }}
        >
          <Icon
            name={active === 'profile' ? 'account' : 'account-outline'}
            size={24}
            color={active === 'profile' ? primary : '#777'}
          />
          <Text
            style={
              active === 'profile'
                ? [styles.tabActive, { color: primary }]
                : styles.tabText
            }
          >
            Account
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}
      accessibilityRole="tablist"
    >
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => onSelect('home')}
        accessibilityRole="tab"
        accessibilityState={{ selected: active === 'home' }}
      >
        <Icon
          name={active === 'home' ? 'home' : 'home-outline'}
          size={24}
          color={active === 'home' ? primary : '#777'}
        />
        <Text
          style={
            active === 'home'
              ? [styles.tabActive, { color: primary }]
              : styles.tabText
          }
        >
          Home
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => onSelect('offers')}
        accessibilityRole="tab"
        accessibilityState={{ selected: active === 'offers' }}
      >
        <Icon
          name={active === 'offers' ? 'gift' : 'gift-outline'}
          size={24}
          color={active === 'offers' ? primary : '#777'}
        />
        <Text
          style={
            active === 'offers'
              ? [styles.tabActive, { color: primary }]
              : styles.tabText
          }
        >
          Rewards
        </Text>
      </TouchableOpacity>
      <View style={styles.scanGroup}>
        <TouchableOpacity
          style={[styles.scanCircle, { backgroundColor: primary }]}
          activeOpacity={0.88}
          onPress={() => onSelect('scan')}
          accessibilityRole="button"
          accessibilityLabel="Scan QR code"
        >
          <Icon name="qrcode-scan" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.tabText}>Scan</Text>
      </View>
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => onSelect('wallet')}
        accessibilityRole="tab"
        accessibilityState={{ selected: active === 'wallet' }}
      >
        <Icon
          name={active === 'wallet' ? 'wallet' : 'wallet-outline'}
          size={24}
          color={active === 'wallet' ? primary : '#777'}
        />
        <Text
          style={
            active === 'wallet'
              ? [styles.tabActive, { color: primary }]
              : styles.tabText
          }
        >
          Wallet
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => onSelect('profile')}
        accessibilityRole="tab"
        accessibilityState={{ selected: active === 'profile' }}
      >
        <Icon
          name={active === 'profile' ? 'account' : 'account-outline'}
          size={24}
          color={active === 'profile' ? primary : '#777'}
        />
        <Text
          style={
            active === 'profile'
              ? [styles.tabActive, { color: primary }]
              : styles.tabText
          }
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    width: '100%',
    height: 80,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabActive: { fontSize: 9, fontWeight: '800', marginTop: 3 },
  tabText: { color: '#777', fontSize: 9, fontWeight: '500', marginTop: 3 },
  scanGroup: { alignItems: 'center', marginTop: -25 },
  scanCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  staffBar: {
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  staffSpacer: { width: 80 },
  staffProfileTab: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppBottomNav;
