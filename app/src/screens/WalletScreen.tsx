import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchAllVouchers, fetchWallet } from '../api/growthApi';
import type { Voucher } from '../api/growthApi';
import { useBrandStyles } from '../theme/useBrandStyles';
import type { FooterNavKey } from './screenNav';

const PAGE_BG = '#F8F8F8';
const BROWN = '#3E2723';

export type WalletScreenProps = {
  authToken?: string | null;
  onBack: () => void;
  onNavFooter: (key: FooterNavKey) => void;
};

function WalletBackgroundDecor() {
  const spots = [
    { top: '12%', left: '4%', icon: 'chili-mild' as const, size: 28, rot: '-15deg' },
    { top: '22%', right: '6%', icon: 'leaf' as const, size: 22, rot: '12deg' },
    { top: '38%', left: '8%', icon: 'food-variant' as const, size: 20, rot: '8deg' },
    { top: '55%', right: '10%', icon: 'chili-mild' as const, size: 24, rot: '20deg' },
    { top: '68%', left: '5%', icon: 'leaf' as const, size: 26, rot: '-8deg' },
    { top: '78%', right: '4%', icon: 'silverware-fork-knife' as const, size: 18, rot: '-5deg' },
  ];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {spots.map((s, i) => (
        <View
          key={i}
          style={[
            styles.decorSpot,
            {
              top: s.top as `${number}%`,
              ...(s.left ? { left: s.left as `${number}%` } : { right: s.right as `${number}%` }),
            },
          ]}
        >
          <Icon
            name={s.icon}
            size={s.size}
            color="#C4B5A5"
            style={{ opacity: 0.22, transform: [{ rotate: s.rot }] }}
          />
        </View>
      ))}
    </View>
  );
}

type ActivityItem = {
  id: string;
  title: string;
  body: string;
  icon: 'ticket-percent' | 'bell-outline';
};

const WalletScreen = ({ authToken, onBack, onNavFooter }: WalletScreenProps) => {
  const { primary, primaryDeep, brandNameUpper, gradient, member } =
    useBrandStyles();
  const [vouchers, setVouchers] = useState<Voucher[]>(member?.activeVouchers ?? []);
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  const memberId = member?.id;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const fallback = member?.activeVouchers ?? [];

      if (!authToken) {
        if (!cancelled) {
          setVouchers(fallback);
          setAllVouchers(fallback);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) setLoading(true);

      try {
        const active = await fetchWallet(authToken);
        let all = active;
        try {
          all = await fetchAllVouchers(authToken);
        } catch {
          all = active;
        }
        if (!cancelled) {
          setVouchers(active);
          setAllVouchers(all);
        }
      } catch {
        if (!cancelled) {
          setVouchers(fallback);
          setAllVouchers(fallback);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authToken, memberId]);

  const activeVoucher = vouchers[0];

  const recentActivity = useMemo((): ActivityItem[] => {
    const redeemed = allVouchers
      .filter(v => v.status === 'REDEEMED')
      .slice(0, 3)
      .map(v => ({
        id: `v-${v.id}`,
        title: `${v.percentOff}% voucher redeemed`,
        body: v.redeemedAt
          ? new Date(v.redeemedAt).toLocaleString()
          : 'Redeemed at restaurant',
        icon: 'ticket-percent' as const,
      }));

    const notifs = (member?.notifications ?? []).slice(0, 3).map(n => ({
      id: n.id,
      title: n.title,
      body: n.body,
      icon: 'bell-outline' as const,
    }));

    return [...redeemed, ...notifs].slice(0, 5);
  }, [allVouchers, member?.notifications]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <WalletBackgroundDecor />

      <SafeAreaView style={styles.safeTop} edges={['top']}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={16}
          style={styles.backFab}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="chevron-left" size={26} color="#3E2723" />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollInner}
        >
          <View style={styles.heroBlock}>
            <View style={styles.logoCircle}>
              <View style={styles.chiliRow}>
                <View style={[styles.chiliDot, { backgroundColor: '#C4D600' }]}>
                  <Icon name="chili-mild" size={12} color="#2D4D00" />
                </View>
                <View
                  style={[
                    styles.chiliDot,
                    {
                      backgroundColor: '#FFD700',
                      zIndex: 1,
                      transform: [{ scale: 1.08 }],
                    },
                  ]}
                >
                  <Icon name="chili-mild" size={13} color="#D35400" />
                </View>
                <View style={[styles.chiliDot, { backgroundColor: '#E31E24' }]}>
                  <Icon name="chili-mild" size={12} color="#8B0000" />
                </View>
              </View>
              <Text style={[styles.logoCircleText, { color: primary }]}>
                {brandNameUpper}
              </Text>
            </View>

            <View style={styles.screenTitleRow}>
              <Text style={styles.screenTitleMy}>MY </Text>
              <Text style={styles.screenTitleWallet}>WALLET</Text>
            </View>
          </View>

          {loading && vouchers.length === 0 ? (
            <ActivityIndicator color={primary} style={{ marginVertical: 24 }} />
          ) : (
            <>
              <View style={styles.balanceCardWrap}>
                <LinearGradient
                  colors={[...gradient, primaryDeep]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.balanceCard}
                >
                  <View style={styles.balanceCardInner}>
                    <View style={styles.balanceLeft}>
                      <Text style={styles.balanceMuted}>Member status</Text>
                      <Text style={styles.balanceGbp}>
                        {member?.loyalty.stageLabel ?? 'Member'}
                      </Text>
                      <Text style={[styles.balanceMuted, styles.balanceMutedGap]}>
                        Active vouchers
                      </Text>
                      <Text style={styles.balancePoints}>{vouchers.length}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.topUpBtn,
                        { backgroundColor: 'rgba(255,255,255,0.25)' },
                      ]}
                      activeOpacity={0.88}
                      onPress={() => onNavFooter('offers')}
                      accessibilityRole="button"
                      accessibilityLabel="View offers"
                    >
                      <Text style={styles.topUpBtnText}>View Offers</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
                <View style={styles.walletFloat} pointerEvents="none">
                  <Icon name="wallet" size={52} color="#5D4037" />
                  <View style={styles.walletBills}>
                    <Icon name="cash" size={22} color="#43A047" />
                  </View>
                </View>
              </View>

              {activeVoucher ? (
                <View style={[styles.voucherBanner, { borderColor: primary }]}>
                  <Text style={styles.voucherBannerTitle}>
                    Active voucher — {activeVoucher.percentOff}% off food
                  </Text>
                  <Text style={styles.voucherBannerSub}>
                    Show QR at till · Valid until{' '}
                    {new Date(activeVoucher.validUntil).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.voucherQr, { color: primary }]} selectable>
                    {activeVoucher.qrToken}
                  </Text>
                </View>
              ) : (
                <View style={styles.voucherBanner}>
                  <Text style={styles.voucherBannerSub}>
                    No active vouchers — check My Offers for rewards.
                  </Text>
                </View>
              )}

              <View style={styles.sectionHeadRow}>
                <Text style={styles.sectionTitleCaps}>RECENT ACTIVITY</Text>
                <TouchableOpacity
                  onPress={() => onNavFooter('offers')}
                  hitSlop={8}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllLink, { color: primary }]}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.transactionsCard}>
                {recentActivity.length === 0 ? (
                  <Text style={styles.txDate}>
                    Activity will appear here after visits and rewards.
                  </Text>
                ) : (
                  recentActivity.map((item, idx) => (
                    <View key={item.id}>
                      {idx > 0 ? <View style={styles.txDivider} /> : null}
                      <View style={styles.txRow}>
                        <View
                          style={[
                            styles.txIconCircle,
                            { backgroundColor: '#FFF3E0' },
                          ]}
                        >
                          <Icon name={item.icon} size={22} color={primary} />
                        </View>
                        <View style={styles.txMid}>
                          <Text style={styles.txTitle}>{item.title}</Text>
                          <Text style={styles.txDate} numberOfLines={2}>
                            {item.body}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}

          <View style={{ height: 28 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },
  safeTop: { flex: 1, backgroundColor: 'transparent' },
  decorSpot: { position: 'absolute' },
  backFab: {
    position: 'absolute',
    top: 8,
    left: 12,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  scrollInner: { paddingBottom: 32, paddingHorizontal: 18, paddingTop: 48 },
  heroBlock: { alignItems: 'center', marginBottom: 8 },
  logoCircle: {
    backgroundColor: '#FFF',
    borderRadius: 72,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
  },
  chiliRow: { flexDirection: 'row', alignItems: 'center' },
  chiliDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  logoCircleText: { fontSize: 9, fontWeight: '900', marginTop: 6, letterSpacing: 0.5 },
  screenTitleRow: { flexDirection: 'row', marginTop: 14 },
  screenTitleMy: { fontSize: 26, fontWeight: '300', color: BROWN },
  screenTitleWallet: { fontSize: 26, fontWeight: '900', color: BROWN },
  balanceCardWrap: { marginBottom: 20, position: 'relative' },
  balanceCard: { borderRadius: 18, padding: 18, minHeight: 120 },
  balanceCardInner: { flexDirection: 'row', justifyContent: 'space-between' },
  balanceLeft: { flex: 1 },
  balanceMuted: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  balanceMutedGap: { marginTop: 10 },
  balanceGbp: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 2 },
  balancePoints: { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 2 },
  topUpBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topUpBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  walletFloat: { position: 'absolute', right: 12, top: -8 },
  walletBills: { position: 'absolute', right: -4, bottom: 8 },
  voucherBanner: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD4B8',
  },
  voucherBannerTitle: { fontSize: 16, fontWeight: '700', color: BROWN },
  voucherBannerSub: { fontSize: 13, color: '#666', marginTop: 4 },
  voucherQr: { fontSize: 11, marginTop: 8, fontFamily: 'monospace' },
  sectionHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleCaps: { fontSize: 12, fontWeight: '800', color: BROWN, letterSpacing: 0.5 },
  viewAllLink: { fontSize: 12, fontWeight: '800' },
  transactionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    elevation: 2,
  },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  txIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txMid: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '700', color: BROWN },
  txDate: { fontSize: 12, color: '#888', marginTop: 2 },
  txDivider: { height: 1, backgroundColor: '#F0F0F0' },
});

export default WalletScreen;
