import React, { useEffect, useRef } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { OfferCard } from '../api/offerMapper';
import { useBrandStyles } from '../theme/useBrandStyles';

export type RewardDetailSheetProps = {
  visible: boolean;
  offer: OfferCard | null;
  onClose: () => void;
  onOpenScan?: () => void;
  onViewAllOffers?: () => void;
};

const RewardDetailSheet = ({
  visible,
  offer,
  onClose,
  onOpenScan,
  onViewAllOffers,
}: RewardDetailSheetProps) => {
  const insets = useSafeAreaInsets();
  const { primary, btnPrimary, btnPrimaryText } = useBrandStyles();
  const lastOfferRef = useRef<OfferCard | null>(null);

  useEffect(() => {
    if (offer) lastOfferRef.current = offer;
  }, [offer]);

  const displayOffer = offer ?? lastOfferRef.current;
  if (!visible || !displayOffer) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={[styles.strip, { backgroundColor: displayOffer.color }]}>
            <View style={styles.stripInner}>
              <Text style={styles.stripDiscount}>{displayOffer.discount}</Text>
              <Text style={styles.stripOff}>OFF</Text>
            </View>
            <Icon
              name={
                displayOffer.icon as React.ComponentProps<typeof Icon>['name']
              }
              size={48}
              color="rgba(255,255,255,0.35)"
            />
            <TouchableOpacity
              style={styles.stripCloseBtn}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Close reward"
            >
              <Icon name="close" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View
              style={[
                styles.badge,
                { backgroundColor: `${displayOffer.color}22` },
              ]}
            >
              <Text style={[styles.badgeText, { color: displayOffer.color }]}>
                {displayOffer.type}
              </Text>
            </View>

            <Text style={styles.title}>{displayOffer.title}</Text>
            <Text style={styles.desc}>{displayOffer.desc}</Text>

            {displayOffer.loyaltyDots ? (
              <View style={styles.dotsRow}>
                {displayOffer.loyaltyDots.map(dot => (
                  <View
                    key={dot.num}
                    style={[
                      styles.dot,
                      dot.filled
                        ? {
                            backgroundColor: displayOffer.color,
                            borderColor: displayOffer.color,
                          }
                        : styles.dotOff,
                    ]}
                  >
                    <Text
                      style={[styles.dotNum, dot.filled && styles.dotNumOn]}
                    >
                      {dot.num}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.validRow}>
              <Icon
                name={
                  displayOffer.validIsLifetime
                    ? 'crown-outline'
                    : 'calendar-month-outline'
                }
                size={18}
                color="#2E7D32"
              />
              <Text style={styles.validText}>{displayOffer.valid}</Text>
            </View>
            {displayOffer.timeLeft ? (
              <View style={styles.validRow}>
                <Icon name="clock-outline" size={18} color="#9E9E9E" />
                <Text style={styles.timeLeft}>{displayOffer.timeLeft}</Text>
              </View>
            ) : null}
            {displayOffer.loyaltyFooter ? (
              <Text style={styles.loyaltyFooter}>
                {displayOffer.loyaltyFooter}
              </Text>
            ) : null}

            {displayOffer.status === 'active' && displayOffer.qrToken ? (
              <View style={styles.qrBlock}>
                <Text style={styles.qrHint}>
                  Show this QR to staff before your bill is totalled
                </Text>
                <View style={styles.qrFrame}>
                  <QRCode value={displayOffer.qrToken} size={180} />
                </View>
                <Text
                  style={[styles.code, { color: displayOffer.color }]}
                  selectable
                >
                  {displayOffer.code}
                </Text>
              </View>
            ) : null}

            <View style={styles.infoBanner}>
              <Icon name="information" size={20} color={primary} />
              <Text style={styles.infoText}>
                Food bill only. Drinks excluded unless stated otherwise.
              </Text>
            </View>

            {displayOffer.status === 'active' && onOpenScan ? (
              <TouchableOpacity
                style={[styles.primaryBtn, btnPrimary]}
                onPress={() => {
                  onClose();
                  onOpenScan();
                }}
                activeOpacity={0.88}
              >
                <Icon name="qrcode-scan" size={22} color="#FFF" />
                <Text style={[styles.primaryBtnText, btnPrimaryText]}>
                  Open full-screen QR
                </Text>
              </TouchableOpacity>
            ) : null}

            {onViewAllOffers ? (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => {
                  onClose();
                  onViewAllOffers();
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryBtnText, { color: primary }]}>
                  View all offers
                </Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
  },
  scroll: { flexGrow: 0, flexShrink: 1 },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    position: 'relative',
  },
  stripCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  stripInner: { alignItems: 'flex-start' },
  stripDiscount: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 44,
  },
  stripOff: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '900', color: '#212121' },
  desc: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dotOff: {
    backgroundColor: '#FFF',
    borderColor: '#BDBDBD',
  },
  dotNum: { fontSize: 11, fontWeight: '900', color: '#757575' },
  dotNumOn: { color: '#FFF' },
  validRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  validText: { fontSize: 14, fontWeight: '600', color: '#2E7D32' },
  timeLeft: { fontSize: 14, color: '#9E9E9E' },
  loyaltyFooter: { fontSize: 13, color: '#757575', marginTop: 6 },
  qrBlock: { alignItems: 'center', marginTop: 18 },
  qrHint: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  qrFrame: {
    padding: 14,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  code: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4ED',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 12, color: '#444', lineHeight: 17 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800' },
  secondaryBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '700' },
});

export default RewardDetailSheet;
