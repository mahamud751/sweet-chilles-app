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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SweetChilliesHeader from './SweetChilliesHeader';
import { useBrandStyles } from '../theme/useBrandStyles';
import { fetchAllVouchers, fetchWallet } from '../api/growthApi';
import { vouchersToOfferCards, type OfferCard } from '../api/offerMapper';

type TabId = string;

const hexAlpha = (hex: string, alphaHex: string) => `${hex}${alphaHex}`;

export type MyOffersProps = {
  onBack: () => void;
  onOpenNotifications?: () => void;
};

const MyOffers = ({ onBack, onOpenNotifications }: MyOffersProps) => {
  const { primary, member, authToken } = useBrandStyles();
  const [loading, setLoading] = useState(true);
  const [allOffers, setAllOffers] = useState<OfferCard[]>([]);

  const memberId = member?.id;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!member) {
        if (!cancelled) {
          setAllOffers([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) setLoading(true);

      try {
        let vouchers = member.activeVouchers;
        if (authToken) {
          try {
            vouchers = await fetchAllVouchers(authToken);
          } catch {
            try {
              vouchers = await fetchWallet(authToken);
            } catch {
              vouchers = member.activeVouchers;
            }
          }
        }
        if (!cancelled) {
          setAllOffers(vouchersToOfferCards(vouchers, member.loyalty));
        }
      } catch {
        if (!cancelled) {
          setAllOffers(
            vouchersToOfferCards(member.activeVouchers, member.loyalty),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authToken, memberId]);

  const tabs = useMemo((): TabId[] => {
    const active = allOffers.filter(o => o.status === 'active').length;
    const used = allOffers.filter(o => o.status === 'used').length;
    const expired = allOffers.filter(o => o.status === 'expired').length;
    return [`Active (${active})`, `Used (${used})`, `Expired (${expired})`];
  }, [allOffers]);

  const [activeTab, setActiveTab] = useState<TabId>('Active (0)');

  useEffect(() => {
    if (tabs.length && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  const visibleOffers = useMemo(() => {
    if (activeTab.startsWith('Active')) {
      return allOffers.filter(o => o.status === 'active');
    }
    if (activeTab.startsWith('Used')) {
      return allOffers.filter(o => o.status === 'used');
    }
    return allOffers.filter(o => o.status === 'expired');
  }, [activeTab, allOffers]);

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
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                index < tabs.length - 1 && styles.tabWithDivider,
                activeTab === tab && { backgroundColor: primary },
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

        {loading && allOffers.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={primary}
            style={styles.loader}
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollInner, { paddingBottom: 32 }]}
          >
            {visibleOffers.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="ticket-outline" size={48} color="#CCC" />
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.emptySub}>
                  {activeTab.startsWith('Active')
                    ? 'Your active rewards will appear here.'
                    : 'Switch tabs to see other offers.'}
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

                    {item.loyaltyDots ? (
                      <View style={styles.loyaltyDots}>
                        {item.loyaltyDots.map(dot => (
                          <View
                            key={dot.num}
                            style={[
                              styles.dot,
                              dot.filled
                                ? [
                                    styles.dotActive,
                                    { backgroundColor: primary },
                                  ]
                                : styles.dotInactive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dotText,
                                dot.filled && styles.dotTextActive,
                              ]}
                            >
                              {dot.num}
                            </Text>
                          </View>
                        ))}
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
                            color={
                              item.status === 'used' ? '#757575' : '#2E7D32'
                            }
                          />
                          <Text
                            style={[
                              styles.validText,
                              item.status !== 'active' && styles.validMuted,
                            ]}
                          >
                            {' '}
                            {item.valid}
                          </Text>
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
                          { borderColor: hexAlpha(item.color, 'B5') },
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
                Show the QR code to the staff to redeem your offer before
                billing.
              </Text>
              <Icon
                name="qrcode-scan"
                size={36}
                color={primary}
                style={styles.infoIcon}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F8F8' },
  content: { flex: 1, paddingHorizontal: 16 },
  loader: { marginTop: 40 },
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
  validMuted: { color: '#757575' },
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
