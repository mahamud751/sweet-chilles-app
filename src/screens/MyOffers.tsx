import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SweetChilliesHeader from './SweetChilliesHeader';

const TABS = ['Active (4)', 'Used (6)', 'Expired (1)'] as const;
type TabId = (typeof TABS)[number];

type OfferStatus = 'active' | 'used' | 'expired';

type Offer = {
  id: number;
  discount: string;
  type: string;
  title: string;
  desc: string;
  valid: string;
  timeLeft?: string;
  /** Single-line footer (loyalty) instead of calendar + time rows */
  loyaltyFooter?: string;
  /** When true, show crown + valid (no clock row) */
  validIsLifetime?: boolean;
  color: string;
  icon: string;
  code: string;
  isLoyalty?: boolean;
  status: OfferStatus;
};

const OFFERS: Offer[] = [
  {
    id: 1,
    discount: '30%',
    type: 'WELCOME REWARD',
    title: '30% OFF on Food Bill',
    desc: 'Enjoy 30% off on your food bill. Dine-in or Takeaway.',
    valid: 'Valid till 25 May 2026',
    timeLeft: '10 days left',
    color: '#C62828',
    icon: 'gift-outline',
    code: 'SC30WELCOME',
    status: 'active',
  },
  {
    id: 2,
    discount: '20%',
    type: 'NEXT REWARD',
    title: '20% OFF on Food Bill',
    desc: 'Use this reward on your next visit.',
    valid: 'Valid till 24 Jun 2026',
    timeLeft: '40 days left',
    color: '#EF6C00',
    icon: 'star-outline',
    code: 'SC20NEXT',
    status: 'active',
  },
  {
    id: 3,
    discount: '15%',
    type: 'LOYALTY REWARD',
    title: '15% OFF on Food Bill',
    desc: 'Enjoy 15% off on each of your next 5 visits.',
    valid: '',
    timeLeft: undefined,
    loyaltyFooter: '3 visits remaining • Valid for 90 days',
    color: '#F9A825',
    icon: 'chef-hat',
    code: 'SC15LOYALTY',
    isLoyalty: true,
    status: 'active',
  },
  {
    id: 4,
    discount: '10%',
    type: 'GOLD MEMBER',
    title: '10% OFF for Life',
    desc: 'As a Gold Member, enjoy 10% OFF on every visit.',
    valid: 'Valid for life',
    validIsLifetime: true,
    color: '#2E7D32',
    icon: 'crown-outline',
    code: 'SC10GOLD',
    status: 'active',
  },
  {
    id: 5,
    discount: '5%',
    type: 'PAST PROMO',
    title: '5% OFF (redeemed)',
    desc: 'Already used on your last visit.',
    valid: 'Redeemed 1 Apr 2026',
    timeLeft: undefined,
    color: '#888888',
    icon: 'check-circle-outline',
    code: 'SC05USED',
    status: 'used',
  },
  {
    id: 6,
    discount: '25%',
    type: 'EXPIRED',
    title: '25% OFF — expired',
    desc: 'This offer is no longer valid.',
    valid: 'Expired 1 Jan 2026',
    timeLeft: undefined,
    color: '#999999',
    icon: 'clock-alert-outline',
    code: 'SC25OLD',
    status: 'expired',
  },
];

const hexAlpha = (hex: string, alphaHex: string) => `${hex}${alphaHex}`;

export type MyOffersProps = {
  onBack: () => void;
  onOpenNotifications?: () => void;
};

const MyOffers = ({ onBack, onOpenNotifications }: MyOffersProps) => {
  const [activeTab, setActiveTab] = useState<TabId>(TABS[0]);

  const visibleOffers = useMemo(() => {
    if (activeTab.startsWith('Active')) {
      return OFFERS.filter(o => o.status === 'active');
    }
    if (activeTab.startsWith('Used')) {
      return OFFERS.filter(o => o.status === 'used');
    }
    return OFFERS.filter(o => o.status === 'expired');
  }, [activeTab]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <SweetChilliesHeader
        left="back"
        onLeftPress={onBack}
        onBellPress={onOpenNotifications}
      />

      <View style={styles.content}>
        <Text style={styles.screenTitle}>My Offers</Text>
        <Text style={styles.screenSub}>
          Your rewards, discounts & loyalty benefits
        </Text>

        <View style={styles.tabContainer}>
          {TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                index < TABS.length - 1 && styles.tabWithDivider,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.88}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
                numberOfLines={1}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollInner,
            { paddingBottom: 32 },
          ]}
        >
          {visibleOffers.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="ticket-outline" size={48} color="#CCC" />
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySub}>
                Switch tabs to see other offers.
              </Text>
            </View>
          ) : (
            visibleOffers.map(item => (
              <View key={item.id} style={styles.offerCard}>
                <View
                  style={[styles.leftPart, { backgroundColor: item.color }]}
                >
                  <View style={styles.discountStack}>
                    <Text
                      style={styles.discountPct}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                    >
                      {item.discount}
                    </Text>
                    <Text style={styles.discountOff}>OFF</Text>
                  </View>
                  <Icon
                    name={item.icon}
                    size={36}
                    color="rgba(255,255,255,0.38)"
                    style={styles.leftStripIcon}
                  />
                </View>

                <View style={styles.midPart}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: hexAlpha(item.color, '20') },
                    ]}
                  >
                    <Text style={[styles.typeText, { color: item.color }]}>
                      {item.type}
                    </Text>
                  </View>
                  <Text style={styles.offerTitle}>{item.title}</Text>
                  <Text style={styles.offerDesc} numberOfLines={2}>
                    {item.desc}
                  </Text>

                  {item.isLoyalty ? (
                    <View style={styles.loyaltyDots}>
                      {[2, 3, 4, 5, 6].map(num => {
                        const filled = num === 2 || num === 3;
                        return (
                          <View
                            key={num}
                            style={[
                              styles.dot,
                              filled ? styles.dotActive : styles.dotInactive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dotText,
                                filled && styles.dotTextActive,
                              ]}
                            >
                              {num}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}

                  {item.loyaltyFooter ? (
                    <Text style={styles.loyaltyFooterText}>
                      {item.loyaltyFooter}
                    </Text>
                  ) : (
                    <>
                      <View style={styles.validRow}>
                        <Icon
                          name={
                            item.validIsLifetime
                              ? 'crown-outline'
                              : 'calendar-month-outline'
                          }
                          size={14}
                          color="#2E7D32"
                        />
                        <Text style={styles.validText}> {item.valid}</Text>
                      </View>
                      {item.timeLeft ? (
                        <View style={styles.validRow}>
                          <Icon
                            name="clock-outline"
                            size={14}
                            color="#9E9E9E"
                          />
                          <Text style={styles.timeLeftText}>
                            {' '}
                            {item.timeLeft}
                          </Text>
                        </View>
                      ) : null}
                    </>
                  )}
                </View>

                <View style={styles.rightPart}>
                  <View style={styles.rightPartInner}>
                    <View
                      style={[
                        styles.qrWrap,
                        {
                          borderColor: hexAlpha(item.color, 'B5'),
                        },
                      ]}
                    >
                      <Icon name="qrcode" size={44} color="#212121" />
                    </View>
                    <Text
                      style={[
                        styles.codeText,
                        { color: hexAlpha(item.color, 'B5') },
                      ]}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {item.code}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}

          <View style={styles.infoBanner}>
            <View style={styles.infoCircle}>
              <Icon name="information" size={18} color="#FFF" />
            </View>
            <Text style={styles.infoText}>
              Show the QR code to the staff to redeem your offer before billing.
            </Text>
            <Icon
              name="qrcode-scan"
              size={36}
              color="#F15A24"
              style={styles.infoIcon}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F8F8' },
  content: { flex: 1, paddingHorizontal: 16 },
  screenTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#3E2723',
    marginTop: 4,
  },
  screenSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  tabWithDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#CFCFCF',
  },
  activeTab: { backgroundColor: '#F15A24' },
  tabText: {
    color: '#212121',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  activeTabText: { color: '#FFF' },
  scrollInner: { flexGrow: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    marginTop: 12,
  },
  emptySub: { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center' },
  offerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  leftPart: {
    width: 90,
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  discountStack: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountPct: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
    includeFontPadding: false,
  },
  discountOff: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: -2,
    textAlign: 'center',
    letterSpacing: 1.2,
    includeFontPadding: false,
  },
  leftStripIcon: { marginTop: 10 },
  midPart: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    minWidth: 0,
    justifyContent: 'flex-start',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  typeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
  offerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#212121',
    lineHeight: 20,
  },
  offerDesc: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    lineHeight: 16,
  },
  validRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  validText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
    flexShrink: 1,
  },
  timeLeftText: { fontSize: 11, color: '#9E9E9E', fontWeight: '500' },
  loyaltyFooterText: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 15,
  },
  rightPart: {
    width: 90,
    flexShrink: 0,
    alignSelf: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightPartInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Thin frame + soft tint (not full-strength card red) */
  qrWrap: {
    width: 62,
    height: 62,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 9,
    fontWeight: '900',
    marginTop: 7,
    textAlign: 'center',
    letterSpacing: 0.2,
    width: '100%',
    paddingHorizontal: 2,
  },
  loyaltyDots: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 2,
    gap: 5,
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dotInactive: {
    backgroundColor: '#FFF',
    borderColor: '#BDBDBD',
  },
  dotActive: {
    backgroundColor: '#EF6C00',
    borderColor: '#EF6C00',
  },
  dotText: { fontSize: 9, fontWeight: '900', color: '#757575' },
  dotTextActive: { color: '#FFF' },
  infoBanner: {
    backgroundColor: '#FFF4ED',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFE0CC',
  },
  infoCircle: {
    backgroundColor: '#F15A24',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    marginLeft: 10,
    marginRight: 6,
    fontWeight: '600',
    lineHeight: 17,
  },
  infoIcon: { flexShrink: 0 },
});

export default MyOffers;
