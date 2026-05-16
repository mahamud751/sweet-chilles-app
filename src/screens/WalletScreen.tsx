import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { FooterNavKey } from './screenNav';

const ORANGE = '#F15A24';
const ORANGE_DEEP = '#D84315';
const PAGE_BG = '#F8F8F8';
const BROWN = '#3E2723';

export type WalletScreenProps = {
  onBack: () => void;
  onNavFooter: (key: FooterNavKey) => void;
};

/** Faint background decor (chillies / leaves) — RN-friendly stand-in for line art. */
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

const WalletScreen = ({ onBack, onNavFooter }: WalletScreenProps) => {
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
                <View
                  style={[styles.chiliDot, { backgroundColor: '#C4D600' }]}
                >
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
                <View
                  style={[styles.chiliDot, { backgroundColor: '#E31E24' }]}
                >
                  <Icon name="chili-mild" size={12} color="#8B0000" />
                </View>
              </View>
              <Text style={styles.logoCircleText}>SWEET CHILLIES</Text>
            </View>

            <View style={styles.screenTitleRow}>
              <Text style={styles.screenTitleMy}>MY </Text>
              <Text style={styles.screenTitleWallet}>WALLET</Text>
            </View>
          </View>

          <View style={styles.balanceCardWrap}>
            <LinearGradient
              colors={['#FF8A3D', '#F15A24', '#E53935', ORANGE_DEEP]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.balanceCard}
            >
              <View style={styles.balanceCardInner}>
                <View style={styles.balanceLeft}>
                  <Text style={styles.balanceMuted}>Current Balance</Text>
                  <Text style={styles.balanceGbp}>£56.80</Text>
                  <Text style={[styles.balanceMuted, styles.balanceMutedGap]}>
                    Points Balance
                  </Text>
                  <Text style={styles.balancePoints}>2,450 Points</Text>
                </View>
                <TouchableOpacity
                  style={styles.topUpBtn}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityLabel="Top up wallet"
                >
                  <Text style={styles.topUpBtnText}>Top Up</Text>
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

          <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionTitleCaps}>RECENT TRANSACTIONS</Text>
            <TouchableOpacity
              onPress={() => onNavFooter('offers')}
              hitSlop={8}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsCard}>
            <View style={styles.txRow}>
              <View style={[styles.txIconCircle, { backgroundColor: '#FFF3E0' }]}>
                <Icon name="food" size={22} color={ORANGE} />
              </View>
              <View style={styles.txMid}>
                <Text style={styles.txTitle}>Order #12345 — Paid</Text>
                <Text style={styles.txDate}>11 May 2026</Text>
              </View>
              <Text style={styles.txAmount}>£22.50</Text>
            </View>
            <View style={styles.txDivider} />
            <View style={styles.txRow}>
              <View style={[styles.txIconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="arrow-top-right" size={22} color="#2E7D32" />
              </View>
              <View style={styles.txMid}>
                <Text style={styles.txTitle}>Top Up</Text>
                <Text style={styles.txDate}>24 Jun 2026</Text>
              </View>
              <Text style={[styles.txAmount, styles.txAmountPos]}>+£30.00</Text>
            </View>
            <View style={styles.txDivider} />
            <View style={styles.txRow}>
              <View style={[styles.txIconCircle, { backgroundColor: '#FFEBEE' }]}>
                <Icon name="medal" size={22} color="#C62828" />
              </View>
              <View style={styles.txMid}>
                <Text style={styles.txTitle}>Loyalty Points</Text>
                <Text style={styles.txDate}>24 Jun 2026</Text>
              </View>
              <Text style={[styles.txAmount, styles.txAmountPos]}>+15 Points</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitleCaps, styles.sectionTitleSpaced]}>
            PAY WITH POINTS
          </Text>
          <View style={styles.payPointsCard}>
            <View style={styles.payPointsRow}>
              <View style={styles.payPointsTextCol}>
                <Text style={styles.payPointsSub}>
                  Convert points to wallet currency
                </Text>
                <Text style={styles.payPointsBig}>2,450 Points</Text>
                <TouchableOpacity
                  style={styles.convertBtn}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityLabel="Convert points"
                >
                  <Text style={styles.convertBtnText}>CONVERT POINTS</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.payPointsWalletArt}>
                <Icon name="wallet-outline" size={56} color="#8D6E63" />
              </View>
            </View>
          </View>

          <Text style={[styles.sectionTitleCaps, styles.sectionTitleSpaced]}>
            LINKED PAYMENTS
          </Text>
          <View style={styles.linkedCard}>
            <View style={styles.linkedRow}>
              <Icon name="credit-card-outline" size={28} color="#1565C0" />
              <View style={styles.linkedMid}>
                <Text style={styles.linkedTitle}>Credit Card</Text>
                <Text style={styles.linkedSub}>•••• 1234</Text>
              </View>
              <TouchableOpacity style={styles.linkCardBtn} activeOpacity={0.85}>
                <Text style={styles.linkCardBtnText}>LINK CARD</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.linkedDivider} />
            <View style={styles.linkedRow}>
              <Icon name="google" size={28} color="#4285F4" />
              <View style={styles.linkedMid}>
                <Text style={styles.linkedTitle}>Linked Google Pay</Text>
                <Text style={styles.linkedSubMuted}>Tap to pay in-store</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.addNewLink}>Add New</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 28 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },
  safeTop: { flex: 1, backgroundColor: 'transparent' },
  decorSpot: {
    position: 'absolute',
  },
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  scrollInner: {
    paddingBottom: 32,
    paddingHorizontal: 18,
  },
  heroBlock: {
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 8,
  },
  logoCircle: {
    backgroundColor: '#FFF',
    borderRadius: 72,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  chiliRow: { flexDirection: 'row', alignItems: 'center' },
  chiliDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -2,
  },
  logoCircleText: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: '900',
    color: ORANGE,
    letterSpacing: 0.8,
  },
  screenTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 14,
  },
  screenTitleMy: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 1,
  },
  screenTitleWallet: {
    fontSize: 22,
    fontWeight: '900',
    color: ORANGE,
    letterSpacing: 1,
  },
  balanceCardWrap: {
    marginTop: 6,
    marginBottom: 22,
    position: 'relative',
  },
  balanceCard: {
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    paddingRight: 100,
    minHeight: 168,
    elevation: 8,
    shadowColor: ORANGE_DEEP,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  balanceCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLeft: { flex: 1, paddingRight: 8 },
  balanceMuted: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceMutedGap: { marginTop: 12 },
  balanceGbp: {
    marginTop: 4,
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  balancePoints: {
    marginTop: 4,
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  topUpBtn: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    alignSelf: 'flex-start',
    marginTop: 4,
    elevation: 4,
    shadowColor: '#FFB74D',
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  topUpBtnText: {
    color: '#BF360C',
    fontSize: 14,
    fontWeight: '800',
  },
  walletFloat: {
    position: 'absolute',
    right: -4,
    top: -14,
    zIndex: 4,
    alignItems: 'center',
  },
  walletBills: {
    position: 'absolute',
    top: 8,
    right: 4,
    opacity: 0.95,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleCaps: {
    fontSize: 12,
    fontWeight: '900',
    color: BROWN,
    letterSpacing: 0.6,
  },
  sectionTitleSpaced: {
    marginTop: 22,
    marginBottom: 10,
  },
  viewAllLink: {
    color: ORANGE,
    fontSize: 13,
    fontWeight: '800',
  },
  transactionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E4E0',
    paddingVertical: 4,
    paddingHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  txIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txMid: { flex: 1, minWidth: 0 },
  txTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#212121',
  },
  txDate: {
    marginTop: 3,
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#212121',
  },
  txAmountPos: {
    color: '#2E7D32',
  },
  txDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginLeft: 68,
    marginRight: 12,
  },
  payPointsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE8B8',
    padding: 18,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  payPointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  payPointsTextCol: { flex: 1, paddingRight: 8 },
  payPointsSub: {
    fontSize: 13,
    color: '#6D4C41',
    fontWeight: '600',
    lineHeight: 18,
  },
  payPointsBig: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: '900',
    color: BROWN,
    letterSpacing: 0.3,
  },
  convertBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: ORANGE,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 10,
    elevation: 3,
  },
  convertBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  payPointsWalletArt: {
    marginBottom: -4,
    opacity: 0.85,
  },
  linkedCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E4E0',
    paddingVertical: 6,
    paddingHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  linkedMid: { flex: 1, marginLeft: 12, minWidth: 0 },
  linkedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#212121',
  },
  linkedSub: {
    marginTop: 3,
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
    letterSpacing: 1,
  },
  linkedSubMuted: {
    marginTop: 3,
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  linkedDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginLeft: 54,
  },
  linkCardBtn: {
    borderWidth: 1.5,
    borderColor: ORANGE,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  linkCardBtnText: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  addNewLink: {
    color: ORANGE,
    fontSize: 13,
    fontWeight: '800',
  },
});

export default WalletScreen;
