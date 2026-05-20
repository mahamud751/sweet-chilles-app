import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type { SessionUser } from '../sessionUser';
import { useBrandStyles } from '../theme/useBrandStyles';
import {
  fetchActiveCompetition,
  fetchDashboardSummary,
  fetchWallet,
  type DashboardSummary,
} from '../api/growthApi';
import {
  JOURNEY_TOTAL,
  loyaltyDisplayPoints,
  loyaltyProgressFilled,
} from '../api/loyaltyProgress';
import { activeVouchersForHome, type OfferCard } from '../api/offerMapper';
import RewardDetailSheet from './RewardDetailSheet';

export type HomeScreenProps = {
  user: SessionUser;
  notificationCount?: number;
  staffMode?: boolean;
  onOpenMyOffers?: () => void;
  onOpenWallet?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  onOpenBirthday?: () => void;
  onOpenWhatsNew?: () => void;
  onOpenRefer?: () => void;
  onOpenQuickFood?: () => void;
  onOpenBookTable?: () => void;
  onOpenCompetition?: () => void;
  onOpenScan?: () => void;
  onOpenAdminMembers?: () => void;
  onOpenAdminVouchers?: () => void;
  onOpenAdminOffers?: () => void;
};

function staffRoleLabel(role: string) {
  switch (role) {
    case 'SAVASAACHI_ADMIN':
      return 'Platform admin';
    case 'RESTAURANT_OWNER':
      return 'Restaurant owner';
    case 'RESTAURANT_STAFF':
      return 'Staff';
    default:
      return role;
  }
}

/** Unsplash photo IDs change; these URLs return 200 as of setup (with fallbacks). */
const GOLD_BANNER_FOOD_URIS = [
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80',
] as const;

/** 5 wide bars on the card; each bar = 2 journey steps — label reads x/10. */
const VISITS_MAIN_BAR_SEGMENTS = 5;

const HOME_REWARD_THEME: Record<
  string,
  {
    bg: string;
    disk: string;
    label: string;
    footerBg: string;
    footerText: string;
  }
> = {
  WELCOME: {
    bg: '#F0F9F0',
    disk: '#4CAF50',
    label: '#4CAF50',
    footerBg: '#E8F5E9',
    footerText: '#2E7D32',
  },
  RETURN: {
    bg: '#FFF9E6',
    disk: '#FFC107',
    label: '#F57F17',
    footerBg: '#FFF3C4',
    footerText: '#E65100',
  },
  THIRD: {
    bg: '#FFF8E1',
    disk: '#FF9800',
    label: '#E65100',
    footerBg: '#FFE0B2',
    footerText: '#BF360C',
  },
  LOYALTY: {
    bg: '#FFF0F0',
    disk: '#E53935',
    label: '#E53935',
    footerBg: '#FFEBEE',
    footerText: '#C62828',
  },
  GOLD: {
    bg: '#E8F5E9',
    disk: '#43A047',
    label: '#2E7D32',
    footerBg: '#C8E6C9',
    footerText: '#1B5E20',
  },
};

/** Fixed height so every My Rewards card matches in the row. */
const REWARD_CARD_HEIGHT = 180;
/** QR in reward footers (reference: near-black). */
const REWARD_QR_COLOR = '#212121';
const REWARD_QR_SIZE = 15;

const HomeScreen = ({
  user,
  notificationCount = 0,
  staffMode = false,
  onOpenMyOffers,
  onOpenWallet,
  onOpenProfile,
  onOpenNotifications,
  onOpenBirthday,
  onOpenWhatsNew,
  onOpenRefer,
  onOpenQuickFood,
  onOpenBookTable,
  onOpenCompetition,
  onOpenScan,
  onOpenAdminMembers,
  onOpenAdminVouchers,
  onOpenAdminOffers,
}: HomeScreenProps) => {
  const {
    primary,
    gradient,
    brandNameUpper,
    member,
    staff,
    welcomeDiscountPercent,
    slug,
    authToken,
  } = useBrandStyles();
  const [dash, setDash] = useState<DashboardSummary | null>(null);
  const [goldFoodUriIndex, setGoldFoodUriIndex] = useState(0);
  const [competition, setCompetition] = useState<{
    title: string;
    prizeDescription: string;
  } | null>(null);
  const rewardGap = 8;
  const quickFourGap = 8;

  const visitsFilled = loyaltyProgressFilled(member?.loyalty);
  const displayPoints = loyaltyDisplayPoints(member?.loyalty);

  const [walletVouchers, setWalletVouchers] = useState(member?.activeVouchers ?? []);
  const [selectedReward, setSelectedReward] = useState<OfferCard | null>(null);

  useEffect(() => {
    setWalletVouchers(member?.activeVouchers ?? []);
  }, [member?.activeVouchers]);

  useEffect(() => {
    if (!authToken || staffMode) return;
    fetchWallet(authToken)
      .then(setWalletVouchers)
      .catch(() => setWalletVouchers(member?.activeVouchers ?? []));
  }, [authToken, member?.activeVouchers, staffMode]);

  useEffect(() => {
    if (!staffMode || !authToken) return;
    fetchDashboardSummary(authToken)
      .then(setDash)
      .catch(() => setDash(null));
  }, [staffMode, authToken]);

  const homeRewards = useMemo((): OfferCard[] => {
    if (!member) return [];
    const source =
      walletVouchers.length > 0 ? walletVouchers : member.activeVouchers;
    return activeVouchersForHome(source, member.loyalty, 3);
  }, [member, walletVouchers]);

  useEffect(() => {
    fetchActiveCompetition(slug)
      .then(c => setCompetition(c))
      .catch(() => setCompetition(null));
  }, [slug]);

  const rewardTheme = (offer: OfferCard) => {
    const key =
      offer.type.includes('WELCOME')
        ? 'WELCOME'
        : offer.type.includes('RETURN')
          ? 'RETURN'
          : offer.type.includes('THIRD')
            ? 'THIRD'
            : offer.type.includes('LOYALTY')
              ? 'LOYALTY'
              : offer.type.includes('GOLD')
                ? 'GOLD'
                : 'WELCOME';
    return HOME_REWARD_THEME[key] ?? HOME_REWARD_THEME.WELCOME;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="menu" size={28} color={primary} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.chiliRow}>
              <View
                style={[styles.chiliCircle, { backgroundColor: '#C4D600' }]}
              >
                <Icon name="chili-mild" size={14} color="#2D4D00" />
              </View>
              <View
                style={[
                  styles.chiliCircle,
                  {
                    backgroundColor: '#FFD700',
                    zIndex: 1,
                    transform: [{ scale: 1.15 }],
                  },
                ]}
              >
                <Icon name="chili-mild" size={16} color="#D35400" />
              </View>
              <View
                style={[styles.chiliCircle, { backgroundColor: '#E31E24' }]}
              >
                <Icon name="chili-mild" size={14} color="#8B0000" />
              </View>
            </View>
            <Text style={[styles.logoText, { color: primary }]}>
              {brandNameUpper}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => onOpenNotifications?.()}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Icon name="bell-outline" size={26} color="#222" />
            {notificationCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.content}>
          <View style={styles.greetingSection}>
            <Text style={styles.hiText}>Hi, {user.displayName}! 👋</Text>
            <Text style={styles.subHiText}>
              {staffMode && staff
                ? `${staffRoleLabel(staff.role)} · ${staff.restaurant?.name ?? brandNameUpper}`
                : member?.loyalty.isGoldMember
                  ? 'Gold Member — 10% off every visit.'
                  : `Your ${welcomeDiscountPercent}% welcome journey starts here.`}
            </Text>
          </View>

          {staffMode && staff ? (
            <>
              {dash ? (
                <View style={styles.staffStatsRow}>
                  <View style={[styles.staffStat, { borderColor: `${primary}33` }]}>
                    <Text style={[styles.staffStatNum, { color: primary }]}>
                      {dash.members}
                    </Text>
                    <Text style={styles.staffStatLbl}>Members</Text>
                  </View>
                  <View style={[styles.staffStat, { borderColor: `${primary}33` }]}>
                    <Text style={[styles.staffStatNum, { color: primary }]}>
                      {dash.activeVouchers}
                    </Text>
                    <Text style={styles.staffStatLbl}>Active rewards</Text>
                  </View>
                  <View style={[styles.staffStat, { borderColor: `${primary}33` }]}>
                    <Text style={[styles.staffStatNum, { color: primary }]}>
                      {dash.campaigns}
                    </Text>
                    <Text style={styles.staffStatLbl}>Offers</Text>
                  </View>
                </View>
              ) : null}
              <View style={styles.staffQuickGrid}>
                {[
                  {
                    icon: 'account-group-outline' as const,
                    label: 'All members',
                    onPress: onOpenAdminMembers,
                  },
                  {
                    icon: 'ticket-percent-outline' as const,
                    label: 'All rewards',
                    onPress: onOpenAdminVouchers,
                  },
                  {
                    icon: 'bullhorn-outline' as const,
                    label: 'Offers',
                    onPress: onOpenAdminOffers,
                  },
                  {
                    icon: 'qrcode-scan' as const,
                    label: 'Scan QR',
                    onPress: onOpenScan,
                  },
                  {
                    icon: 'account-outline' as const,
                    label: 'My profile',
                    onPress: onOpenProfile,
                  },
                ].map(tile => (
                  <TouchableOpacity
                    key={tile.label}
                    style={styles.staffQuickTile}
                    onPress={tile.onPress}
                    activeOpacity={0.88}
                  >
                    <View
                      style={[styles.staffQuickIcon, { backgroundColor: `${primary}18` }]}
                    >
                      <Icon name={tile.icon} size={26} color={primary} />
                    </View>
                    <Text style={styles.staffQuickLabel}>{tile.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          {!staffMode ? (
          <>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.goldCard}
          >
            <View style={styles.goldFoodMask} pointerEvents="none">
              <Image
                source={{
                  uri: GOLD_BANNER_FOOD_URIS[goldFoodUriIndex],
                }}
                style={styles.goldFoodImg}
                resizeMode="cover"
                onError={() =>
                  setGoldFoodUriIndex(i =>
                    Math.min(i + 1, GOLD_BANNER_FOOD_URIS.length - 1),
                  )
                }
              />
            </View>

            <View style={styles.goldCardPad}>
              <View style={styles.goldRow}>
                <View style={styles.goldLeftCol}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.crownCircle}>
                      <Icon name="crown" size={17} color="#C99200" />
                    </View>
                    <View style={styles.headerTextCol}>
                      <Text style={styles.goldLabel}>
                        {member?.loyalty.isGoldMember
                          ? 'GOLD MEMBER'
                          : (member?.loyalty.stageLabel ?? 'MEMBER').toUpperCase()}
                      </Text>
                      <Text style={styles.goldSubText}>
                        {member?.loyalty.isGoldMember
                          ? '10% off every visit 💛'
                          : `Thank you for being${'\n'}with us 💛`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.goldTextBlock}>
                    <View style={styles.pointsContainer}>
                      <Icon name="star" size={14} color="#FFF" />
                      <Text style={styles.pointsVal}>{displayPoints} Points</Text>
                    </View>
                    <Text style={styles.visitsInfo}>
                      {member?.loyalty.isGoldMember
                        ? 'Gold benefits active'
                        : member && member.loyalty.loyaltyVisitsRemaining > 0
                          ? `${member.loyalty.loyaltyVisitsRemaining} loyalty visits left`
                          : 'Keep visiting to unlock rewards'}
                    </Text>
                    <View style={styles.progressBar}>
                      <View style={styles.segmentRowWrap}>
                        <View style={styles.segmentRow}>
                          {Array.from({ length: VISITS_MAIN_BAR_SEGMENTS }).map(
                            (_, i) => {
                              const span =
                                JOURNEY_TOTAL / VISITS_MAIN_BAR_SEGMENTS;
                              const segStart = i * span;
                              const segEnd = (i + 1) * span;
                              let fillRatio = 0;
                              if (visitsFilled >= segEnd) {
                                fillRatio = 1;
                              } else if (visitsFilled > segStart) {
                                fillRatio =
                                  (visitsFilled - segStart) / (segEnd - segStart);
                              }
                              return (
                                <View
                                  key={i}
                                  style={[
                                    styles.segSlot,
                                    i === VISITS_MAIN_BAR_SEGMENTS - 1 &&
                                      styles.segSlotLast,
                                  ]}
                                >
                                  <View style={styles.segTrack}>
                                    {fillRatio > 0 ? (
                                      <View
                                        style={[
                                          styles.segFill,
                                          { width: `${fillRatio * 100}%` },
                                        ]}
                                      />
                                    ) : null}
                                  </View>
                                </View>
                              );
                            },
                          )}
                        </View>
                      </View>
                      <Text style={styles.progressNum}>
                        {visitsFilled}/{JOURNEY_TOTAL}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.cardActionBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.cardActionTxt}>View My Card</Text>
                <Text style={styles.cardActionChevron}>{'>'}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Rewards</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onOpenMyOffers?.()}
            >
              <Text style={styles.viewAllTxt}>View All</Text>
            </TouchableOpacity>
          </View>

          {homeRewards.length === 0 ? (
            <View style={styles.rewardsEmpty}>
              <Text style={styles.rewardsEmptyText}>
                Your active rewards will appear here after you join.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.rewardsRow, { gap: rewardGap }]}
            >
              {homeRewards.map(offer => {
                const theme = rewardTheme(offer);
                const footerLabel =
                  offer.timeLeft ??
                  offer.loyaltyFooter ??
                  (offer.validIsLifetime ? 'Valid for life' : offer.valid);
                return (
                  <TouchableOpacity
                    key={offer.id}
                    activeOpacity={0.9}
                    onPress={() => setSelectedReward(offer)}
                    accessibilityRole="button"
                    accessibilityLabel={`${offer.type}, ${offer.discount} off`}
                    style={[
                      styles.rewardCard,
                      styles.rewardShadow,
                      styles.rewardCardInRow,
                      {
                        height: REWARD_CARD_HEIGHT,
                        width: Math.min(
                          148,
                          (Dimensions.get('window').width - 40 - rewardGap * 2) / 3,
                        ),
                        backgroundColor: theme.bg,
                      },
                    ]}
                  >
                    <View style={styles.rewardTop}>
                      <View
                        style={[
                          styles.rIconDisk,
                          { backgroundColor: theme.disk },
                        ]}
                      >
                        <Icon
                          name={
                            offer.icon as React.ComponentProps<
                              typeof Icon
                            >['name']
                          }
                          size={15}
                          color="#FFF"
                        />
                      </View>
                      <Text style={[styles.rLabel, { color: theme.label }]}>
                        {offer.type}
                      </Text>
                      <View style={styles.rOfferBlock}>
                        <View style={styles.rOfferMainWrap}>
                          <Text
                            style={styles.rOfferMain}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.42}
                          >
                            {offer.discount} OFF
                          </Text>
                        </View>
                        <Text style={styles.rOfferSub}>on Food Bill</Text>
                      </View>
                      {offer.loyaltyDots ? (
                        <View style={styles.loyaltySteps}>
                          <View style={styles.dotRow}>
                            {offer.loyaltyDots.map(dot => (
                              <View
                                key={dot.num}
                                style={dot.filled ? styles.dotOn : styles.dotOff}
                              >
                                <Text
                                  style={
                                    dot.filled
                                      ? styles.dotTxt
                                      : styles.dotTxtOff
                                  }
                                >
                                  {dot.num}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ) : (
                        <>
                          <Text
                            style={[styles.rValid, { color: theme.label }]}
                            numberOfLines={1}
                          >
                            {offer.valid}
                          </Text>
                          <View style={styles.rewardLoyaltySlot} />
                        </>
                      )}
                      {offer.loyaltyDots ? (
                        <View style={styles.rewardDotTailSlot} />
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.rFooterPill,
                        { backgroundColor: theme.footerBg },
                      ]}
                    >
                      <View style={styles.rFooterPillTxtWrap}>
                        <Text
                          style={[
                            styles.rFooterPillTxt,
                            {
                              color: theme.footerText,
                              marginTop: offer.loyaltyDots ? -10 : 0,
                            },
                          ]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.5}
                        >
                          {footerLabel}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.rFooterQrWrap,
                          offer.loyaltyDots && { marginTop: -5 },
                        ]}
                      >
                        <Icon
                          name="qrcode"
                          size={REWARD_QR_SIZE}
                          color={REWARD_QR_COLOR}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {competition ? (
            <LinearGradient
              colors={['#FFF4ED', '#FFE8DC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.winBanner}
            >
              <View style={styles.winBannerInner}>
                <View style={styles.winGiftColumn}>
                  <Icon name="gift" size={56} color="#E53935" />
                </View>
                <View style={styles.winBannerTextCol}>
                  <View style={styles.winBannerTitleBlock}>
                    <Text style={styles.winBannerTitleLine1}>
                      {competition.title.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.winBannerSub}>
                    {competition.prizeDescription}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.winBannerBtn}
                  activeOpacity={0.88}
                  onPress={() => onOpenCompetition?.()}
                >
                  <Text style={styles.winBannerBtnTxt}>Enter Now</Text>
                  <Icon name="chevron-right" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          ) : null}

          <View style={[styles.quickGrid, { gap: quickFourGap }]}>
            <TouchableOpacity
              style={[styles.quickTile, { backgroundColor: '#F3EEFF' }]}
              activeOpacity={0.88}
              onPress={() => onOpenMyOffers?.()}
            >
              <View style={styles.quickIconSlot}>
                <Icon name="ticket-percent-outline" size={28} color="#7E57C2" />
              </View>
              <Text style={styles.quickTitle}>My Offers</Text>
              <Text style={styles.quickSub}>Exclusive offers just for you</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickTile, { backgroundColor: '#FCE4EC' }]}
              activeOpacity={0.88}
              onPress={() => onOpenBirthday?.()}
            >
              <View style={styles.quickIconSlot}>
                <Icon name="cake-variant-outline" size={28} color="#EC407A" />
              </View>
              <Text
                style={styles.quickTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                Birthday Treats
              </Text>
              <Text style={styles.quickSub}>
                Special rewards on your birthday
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickTile, { backgroundColor: '#E3F2FD' }]}
              activeOpacity={0.88}
              onPress={() => onOpenWhatsNew?.()}
            >
              <View style={styles.quickIconSlot}>
                <Icon name="bullhorn-outline" size={28} color="#42A5F5" />
              </View>
              <Text style={styles.quickTitle}>{`What's New`}</Text>
              <View style={styles.quickSubDouble}>
                <Text
                  style={[styles.quickSub, styles.quickSubLine]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                >
                  Stay updated with
                </Text>
                <Text
                  style={[styles.quickSub, styles.quickSubLine]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                >
                  latest offers
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickTile, { backgroundColor: '#E0F7F4' }]}
              activeOpacity={0.88}
              onPress={() => onOpenRefer?.()}
            >
              <View style={styles.quickIconSlot}>
                <Icon
                  name="account-multiple-outline"
                  size={28}
                  color="#26A69A"
                />
              </View>
              <Text style={styles.quickTitle}>Refer & Earn</Text>
              <View style={styles.quickSubDouble}>
                <Text
                  style={[styles.quickSub, styles.quickSubLine]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                >
                  Invite friends
                </Text>
                <Text
                  style={[styles.quickSub, styles.quickSubLine]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                >
                  and earn rewards
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.moreSectionTitle}>
            More With {member?.restaurant.name ?? 'Us'}
          </Text>
          <View style={[styles.quickGrid, { gap: quickFourGap }]}>
            <TouchableOpacity
              style={[styles.morePairCard, { backgroundColor: '#FFF5EE' }]}
              activeOpacity={0.88}
              onPress={() => onOpenQuickFood?.()}
            >
              <View style={styles.morePairRow}>
                <View
                  style={[
                    styles.morePairIconCircle,
                    { backgroundColor: '#FFF3E0' },
                  ]}
                >
                  <Icon name="motorbike" size={32} color="#F57C00" />
                </View>
                <View style={styles.morePairTextCol}>
                  <Text
                    style={styles.morePairTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  >
                    Quick Food
                  </Text>
                  <View style={styles.morePairSubDouble}>
                    <Text style={styles.morePairSubLead} numberOfLines={1}>
                      Quick delivery or
                    </Text>
                    <Text style={styles.morePairSubSmall} numberOfLines={1}>
                      collection
                    </Text>
                  </View>
                </View>
                <Icon
                  name="chevron-right"
                  size={22}
                  color="#BBB"
                  style={styles.morePairChevron}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.morePairCard, { backgroundColor: '#E8F5E9' }]}
              activeOpacity={0.88}
              onPress={() => onOpenBookTable?.()}
            >
              <View style={styles.morePairRow}>
                <View
                  style={[
                    styles.morePairIconCircle,
                    { backgroundColor: '#C8E6C9' },
                  ]}
                >
                  <Icon name="table-furniture" size={32} color="#43A047" />
                </View>
                <View style={styles.morePairTextCol}>
                  <Text
                    style={styles.morePairTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  >
                    Book a Table
                  </Text>
                  <View style={styles.morePairSubDouble}>
                    <Text style={styles.morePairSubLead} numberOfLines={1}>
                      Reserve your table
                    </Text>
                    <Text style={styles.morePairSubSmall} numberOfLines={1}>
                      in advance
                    </Text>
                  </View>
                </View>
                <Icon
                  name="chevron-right"
                  size={22}
                  color="#BBB"
                  style={styles.morePairChevron}
                />
              </View>
            </TouchableOpacity>
          </View>
          </>
          ) : null}
        </View>
      </ScrollView>

      <RewardDetailSheet
        visible={selectedReward != null}
        offer={selectedReward}
        onClose={() => setSelectedReward(null)}
        onOpenScan={onOpenScan}
        onViewAllOffers={onOpenMyOffers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerSafe: { backgroundColor: '#FFF' },
  header: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  logoContainer: { alignItems: 'center' },
  chiliRow: { flexDirection: 'row', alignItems: 'center' },
  chiliCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -2,
    borderWidth: 1,
    borderColor: '#000',
  },
  logoText: {
    color: '#F15A24',
    fontWeight: '900',
    fontSize: 20,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  bellBtn: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#F15A24',
    borderRadius: 9,
    width: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  content: { paddingHorizontal: 20 },
  greetingSection: { marginTop: 2 },
  hiText: { fontSize: 23, fontWeight: '900', color: '#111' },
  subHiText: { fontSize: 13, color: '#666', marginTop: 2, lineHeight: 17 },

  goldCard: {
    borderRadius: 20,
    marginTop: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  goldFoodMask: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '42%',
    borderTopLeftRadius: 200,
    borderBottomLeftRadius: 200,
    overflow: 'hidden',
    zIndex: 0,
  },
  goldFoodImg: {
    width: '100%',
    height: '100%',
  },
  goldCardPad: {
    position: 'relative',
    zIndex: 1,
    paddingTop: 10,
    paddingBottom: 12,
    paddingLeft: 14,
    paddingRight: 10,
  },
  goldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldLeftCol: {
    flex: 1,
    minWidth: 0,
    maxWidth: '64%',
    paddingRight: 8,
  },
  goldTextBlock: {
    marginLeft: 0,
    marginTop: 8,
    marginBottom: 0,
    alignSelf: 'stretch',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  crownCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextCol: {
    marginLeft: 8,
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
  },
  goldLabel: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.35,
    marginBottom: 2,
  },
  goldSubText: {
    color: 'rgba(255,255,255,0.96)',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 1,
  },

  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pointsVal: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 5,
  },
  visitsInfo: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
    lineHeight: 13,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 8,
    marginBottom: 0,
  },
  segmentRowWrap: {
    flex: 1,
    minWidth: 0,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  segSlot: {
    flex: 1,
    height: 5,
    marginRight: 2,
  },
  segSlotLast: { marginRight: 0 },
  segTrack: {
    flex: 1,
    height: '100%',
    borderRadius: 2.5,
    backgroundColor: 'rgba(120, 28, 8, 0.55)',
    overflow: 'hidden',
  },
  segFill: {
    height: '100%',
    backgroundColor: '#FFD400',
    borderRadius: 2.5,
  },
  progressNum: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    flexShrink: 0,
  },

  cardActionBtn: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    zIndex: 3,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardActionTxt: {
    color: '#111',
    fontWeight: '800',
    fontSize: 10,
  },
  cardActionChevron: {
    color: '#111',
    fontWeight: '900',
    fontSize: 11,
    marginLeft: 3,
    marginTop: -1,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#111' },
  viewAllTxt: { color: '#F15A24', fontWeight: '800', fontSize: 12 },

  rewardsEmpty: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  rewardsEmptyText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    paddingBottom: 4,
  },
  rewardCardInRow: {
    flexGrow: 0,
    flexShrink: 0,
  },
  rewardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  rewardCard: {
    borderRadius: 14,
    paddingTop: 9,
    paddingBottom: 9,
    paddingHorizontal: 13,
    alignItems: 'center',
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  rewardTop: {
    width: '100%',
    alignItems: 'center',
    flexShrink: 0,
  },
  rIconDisk: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rLabel: {
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.45,
    marginTop: 3,
  },
  rOfferBlock: {
    alignItems: 'flex-start',
    marginTop: 5,
    width: '100%',
  },
  rOfferMainWrap: {
    width: '100%',
    minWidth: 0,
  },
  rOfferMain: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  rOfferSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#222',
    marginTop: 0,
    textAlign: 'left',
    lineHeight: 13,
  },
  rValid: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 12,
    minHeight: 12,
  },
  rewardLoyaltySlot: {
    alignSelf: 'stretch',
    height: 6,
  },
  /** Below dots on loyalty card only — matches rValid + rewardLoyaltySlot height on cards 1–2. */
  rewardDotTailSlot: {
    alignSelf: 'stretch',
    marginTop: 4,
    height: 6,
  },
  loyaltySteps: {
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'stretch',
    marginTop: 8,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    width: '100%',
    gap: 4,
  },
  dotOn: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotOff: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#CFCFCF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotTxt: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  dotTxtOff: { color: '#5D4037', fontSize: 8, fontWeight: '900' },
  rFooterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    flexShrink: 0,
    minHeight: 22,
  },
  rFooterPillTxtWrap: {
    flex: 1,
    minWidth: 0,
    marginRight: 4,
    justifyContent: 'center',
  },
  rFooterPillTxt: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'left',
    alignSelf: 'stretch',
    includeFontPadding: false,
  },
  rFooterQrWrap: {
    width: 20,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 4,
  },

  winBanner: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  winBannerInner: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexWrap: 'nowrap',
    width: '100%',
    minHeight: 96,
  },
  winGiftColumn: {
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  winBannerTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 14,
  },
  winBannerTitleBlock: {
    alignSelf: 'stretch',
  },
  winBannerTitleLine1: {
    fontSize: 16,
    fontWeight: '900',
    color: '#E65100',
    letterSpacing: 0.35,
  },
  winBannerTitleLine2: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111',
    letterSpacing: 0.35,
    marginTop: 3,
  },
  winBannerSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#222',
    marginTop: 6,
    lineHeight: 17,
    textAlign: 'left',
  },
  winBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexShrink: 0,
    backgroundColor: '#F15A24',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
  },
  winBannerBtnTxt: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
    marginRight: 2,
  },

  quickGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    width: '100%',
  },
  quickTile: {
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 112,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  quickIconSlot: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    marginBottom: 3,
    width: '100%',
    alignSelf: 'stretch',
  },
  quickSub: {
    fontSize: 10,
    color: '#888',
    lineHeight: 13,
    textAlign: 'center',
    width: '100%',
  },
  quickSubDouble: {
    width: '100%',
    alignItems: 'center',
  },
  quickSubLine: {
    alignSelf: 'stretch',
    flexShrink: 0,
  },

  morePairCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  morePairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  morePairIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  morePairIconCircleBike: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  morePairTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingRight: 2,
  },
  morePairTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111',
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  morePairSubDouble: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 3,
  },
  morePairSubLead: {
    fontSize: 7,
    fontWeight: '500',
    color: '#888',
    lineHeight: 15,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  morePairSubSmall: {
    fontSize: 7,
    fontWeight: '500',
    color: '#888',
    lineHeight: 12,
    textAlign: 'left',
    alignSelf: 'stretch',
    marginTop: 2,
  },
  morePairChevron: {
    flexShrink: 0,
    marginLeft: 2,
  },

  moreSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111',
    marginTop: 20,
    marginBottom: 10,
  },

  staffStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  staffStat: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  staffStatNum: { fontSize: 20, fontWeight: '900' },
  staffStatLbl: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  staffQuickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  staffQuickTile: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center',
  },
  staffQuickIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  staffQuickLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#222',
    textAlign: 'center',
  },

});

export default HomeScreen;
