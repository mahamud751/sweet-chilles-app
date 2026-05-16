import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FooterNavKey } from './screenNav';

const ORANGE = '#F15A24';

export type AppBottomNavActive = 'home' | 'offers' | 'wallet' | 'profile';

export type AppBottomNavProps = {
  active: AppBottomNavActive;
  onSelect: (key: FooterNavKey) => void;
};

/**
 * Persistent 5-tab bar (matches Home): Home, Rewards (= offers), Scan, Wallet, Profile.
 */
const AppBottomNav = ({ active, onSelect }: AppBottomNavProps) => {
  const insets = useSafeAreaInsets();

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
          color={active === 'home' ? ORANGE : '#777'}
        />
        <Text style={active === 'home' ? styles.tabActive : styles.tabText}>
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
          color={active === 'offers' ? ORANGE : '#777'}
        />
        <Text style={active === 'offers' ? styles.tabActive : styles.tabText}>
          Rewards
        </Text>
      </TouchableOpacity>
      <View style={styles.scanGroup}>
        <TouchableOpacity
          style={styles.scanCircle}
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
          color={active === 'wallet' ? ORANGE : '#777'}
        />
        <Text style={active === 'wallet' ? styles.tabActive : styles.tabText}>
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
          color={active === 'profile' ? ORANGE : '#777'}
        />
        <Text style={active === 'profile' ? styles.tabActive : styles.tabText}>
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
  tabActive: { color: ORANGE, fontSize: 9, fontWeight: '800', marginTop: 3 },
  tabText: { color: '#777', fontSize: 9, fontWeight: '500', marginTop: 3 },
  scanGroup: { alignItems: 'center', marginTop: -25 },
  scanCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});

export default AppBottomNav;
