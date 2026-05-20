import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SessionUser } from '../sessionUser';
import { useBrandStyles } from '../theme/useBrandStyles';
import {
  JOURNEY_TOTAL,
  loyaltyDisplayPoints,
  loyaltyProgressFilled,
} from '../api/loyaltyProgress';
import { resolveAvatarUrl } from '../config/media';
import {
  fetchDashboardSummary,
  type DashboardSummary,
} from '../api/growthApi';

const ORANGE_DEEP = '#D84315';
const PAGE_BG = '#F8F8F8';
const BROWN = '#3E2723';
const MENU_BROWN = '#4E342E';

export type ProfileScreenProps = {
  user: SessionUser;
  staffMode?: boolean;
  onBack: () => void;
  onOpenNotifications?: () => void;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
  onEditStaffProfile?: () => void;
  onOpenAdminMembers?: () => void;
  onOpenAdminVouchers?: () => void;
  onOpenAdminOffers?: () => void;
  onOpenScan?: () => void;
  onLogout?: () => void;
};

function roleLabel(role: string) {
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

function ProfileBackgroundDecor() {
  const spots = [
    { top: '10%', left: '5%', icon: 'chili-mild' as const, size: 26, rot: '-12deg' },
    { top: '24%', right: '8%', icon: 'chili-mild' as const, size: 22, rot: '18deg' },
    { top: '42%', left: '6%', icon: 'leaf' as const, size: 24, rot: '6deg' },
    { top: '58%', right: '5%', icon: 'chili-mild' as const, size: 30, rot: '-20deg' },
    { top: '72%', left: '10%', icon: 'leaf' as const, size: 20, rot: '-5deg' },
    { top: '86%', right: '12%', icon: 'chili-mild' as const, size: 18, rot: '10deg' },
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
              ...(s.left
                ? { left: s.left as `${number}%` }
                : { right: s.right as `${number}%` }),
            },
          ]}
        >
          <Icon
            name={s.icon}
            size={s.size}
            color="#BCAAA4"
            style={{ opacity: 0.2, transform: [{ rotate: s.rot }] }}
          />
        </View>
      ))}
    </View>
  );
}

const ProfileScreen = ({
  user,
  staffMode = false,
  onBack,
  onOpenNotifications,
  onEditProfile,
  onChangePassword,
  onEditStaffProfile,
  onOpenAdminMembers,
  onOpenAdminVouchers,
  onOpenAdminOffers,
  onOpenScan,
  onLogout,
}: ProfileScreenProps) => {
  const {
    primary,
    brandNameUpper,
    gradient,
    member,
    staff,
    authToken,
    unreadNotifications,
    btnPrimary,
    btnPrimaryText,
  } = useBrandStyles();

  const [dash, setDash] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    if (!staffMode || !authToken) return;
    fetchDashboardSummary(authToken)
      .then(setDash)
      .catch(() => setDash(null));
  }, [staffMode, authToken]);

  if (staffMode && staff) {
    const adminRows: {
      icon: React.ComponentProps<typeof Icon>['name'];
      label: string;
      sub?: string;
      onPress?: () => void;
    }[] = [
      {
        icon: 'account-edit-outline',
        label: 'Edit profile',
        onPress: onEditStaffProfile,
      },
      {
        icon: 'lock-outline',
        label: 'Change password',
        onPress: onChangePassword,
      },
      {
        icon: 'account-group-outline',
        label: 'All members',
        sub: dash ? String(dash.members) : undefined,
        onPress: onOpenAdminMembers,
      },
      {
        icon: 'ticket-percent-outline',
        label: 'All rewards',
        sub: dash
          ? `${dash.activeVouchers} active · ${dash.redeemedVouchers} used`
          : undefined,
        onPress: onOpenAdminVouchers,
      },
      {
        icon: 'bullhorn-outline',
        label: 'Offers & campaigns',
        sub: dash ? String(dash.campaigns) : undefined,
        onPress: onOpenAdminOffers,
      },
      {
        icon: 'qrcode-scan',
        label: 'Scan & redeem QR',
        onPress: onOpenScan,
      },
    ];

    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.headerSafe} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} hitSlop={12}>
              <Icon name="arrow-left" size={26} color={MENU_BROWN} />
            </TouchableOpacity>
            <Text style={[styles.logoText, { color: primary }]}>{brandNameUpper}</Text>
            <View style={{ width: 26 }} />
          </View>
        </SafeAreaView>
        <ScrollView contentContainerStyle={styles.staffBody}>
          <TouchableOpacity
            style={styles.staffAvatarWrap}
            onPress={onEditStaffProfile}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo"
          >
            <View style={styles.staffAvatarRing}>
              {resolveAvatarUrl(staff.avatarUrl) ? (
                <Image
                  source={{ uri: resolveAvatarUrl(staff.avatarUrl) }}
                  style={styles.staffAvatarImg}
                />
              ) : (
                <Icon name="face-man-profile" size={52} color="#FF8A65" />
              )}
            </View>
            <View style={[styles.staffCamBadge, { backgroundColor: primary }]}>
              <Icon name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
          <View style={[styles.staffBadge, { backgroundColor: `${primary}22` }]}>
            <Icon name="badge-account" size={22} color={primary} />
            <Text style={[styles.staffBadgeText, { color: primary }]}>
              {roleLabel(staff.role)}
            </Text>
          </View>
          <Text style={styles.staffName}>{staff.displayName}</Text>
          <Text style={styles.staffEmail}>{staff.email}</Text>
          {staff.restaurant ? (
            <Text style={styles.staffRestaurant}>{staff.restaurant.name}</Text>
          ) : null}

          {dash ? (
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { borderColor: `${primary}44` }]}>
                <Text style={[styles.statNum, { color: primary }]}>{dash.members}</Text>
                <Text style={styles.statLbl}>Members</Text>
              </View>
              <View style={[styles.statBox, { borderColor: `${primary}44` }]}>
                <Text style={[styles.statNum, { color: primary }]}>
                  {dash.activeVouchers}
                </Text>
                <Text style={styles.statLbl}>Active</Text>
              </View>
              <View style={[styles.statBox, { borderColor: `${primary}44` }]}>
                <Text style={[styles.statNum, { color: primary }]}>
                  {dash.campaigns}
                </Text>
                <Text style={styles.statLbl}>Offers</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.staffMenuCard}>
            {adminRows.map((row, i) => (
              <TouchableOpacity
                key={row.label}
                style={styles.staffMenuRow}
                onPress={row.onPress}
                activeOpacity={0.7}
                disabled={!row.onPress}
              >
                <View style={[styles.staffMenuIcon, { backgroundColor: `${primary}18` }]}>
                  <Icon name={row.icon} size={22} color={primary} />
                </View>
                <View style={styles.staffMenuText}>
                  <Text style={styles.staffMenuLabel}>{row.label}</Text>
                  {row.sub ? <Text style={styles.staffMenuSub}>{row.sub}</Text> : null}
                </View>
                <Icon name="chevron-right" size={22} color="#CCC" />
                {i < adminRows.length - 1 ? (
                  <View style={styles.staffMenuDivider} />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.logoutBtn, btnPrimary, { alignSelf: 'stretch' }]}
            onPress={onLogout}
            activeOpacity={0.88}
          >
            <Text style={[styles.logoutBtnText, btnPrimaryText]}>Log out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
  const visitsFilled = loyaltyProgressFilled(member?.loyalty);
  const displayPoints = loyaltyDisplayPoints(member?.loyalty);
  const phoneLabel = member?.phone?.trim() || user.phone || 'Add phone number';
  const avatarUri = useMemo(
    () => resolveAvatarUrl(member?.avatarUrl),
    [member?.avatarUrl],
  );

  const menuRows: {
    icon: React.ComponentProps<typeof Icon>['name'];
    label: string;
    circleBg: string;
  }[] = [
    { icon: 'account', label: member?.name ?? user.displayName, circleBg: '#FFF3E0' },
    { icon: 'email-outline', label: member?.email ?? user.email, circleBg: '#FFF3E0' },
    { icon: 'phone-outline', label: phoneLabel, circleBg: '#FFF3E0' },
    { icon: 'map-marker-outline', label: 'Saved Addresses', circleBg: '#FFF3E0' },
    { icon: 'lock-outline', label: 'Change Password', circleBg: '#FFEBEE' },
  ];
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ProfileBackgroundDecor />

      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Menu"
            onPress={onBack}
          >
            <Icon name="menu" size={28} color={MENU_BROWN} />
          </TouchableOpacity>

          <View style={styles.logoBlock}>
            <View style={styles.logoOval}>
              <View style={styles.chiliRow}>
                <View
                  style={[styles.chiliCircle, { backgroundColor: '#C4D600' }]}
                >
                  <Icon name="chili-mild" size={13} color="#2D4D00" />
                </View>
                <View
                  style={[
                    styles.chiliCircle,
                    {
                      backgroundColor: '#FFD700',
                      zIndex: 1,
                      transform: [{ scale: 1.1 }],
                    },
                  ]}
                >
                  <Icon name="chili-mild" size={14} color="#D35400" />
                </View>
                <View
                  style={[styles.chiliCircle, { backgroundColor: '#E31E24' }]}
                >
                  <Icon name="chili-mild" size={13} color="#8B0000" />
                </View>
              </View>
            </View>
            <Text style={[styles.brandName, { color: primary }]}>
              {brandNameUpper}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerIconBtn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => onOpenNotifications?.()}
          >
            <Icon name="bell-outline" size={26} color="#222" />
            {unreadNotifications > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <Text style={styles.screenTitleCaps}>MY PROFILE</Text>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}
      >
        <View style={styles.profileIntro}>
          <TouchableOpacity
            style={styles.avatarCol}
            onPress={onEditProfile}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
          >
            <View style={styles.avatarRingOuter}>
              <View style={styles.avatarRingInner}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Icon name="face-man-profile" size={58} color="#FF8A65" />
                )}
              </View>
            </View>
            <View style={[styles.camBadge, { backgroundColor: primary }]}>
              <Icon name="camera" size={15} color="#FFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.nameBlock}>
            <Text style={styles.userName}>{member?.name ?? user.displayName}</Text>
            <Text style={styles.userEmail}>{member?.email ?? user.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.editProfileBtn, btnPrimary]}
          activeOpacity={0.88}
          onPress={onEditProfile}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Text style={[styles.editProfileBtnText, btnPrimaryText]}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.memberCardWrap}>
          <LinearGradient
            colors={[...gradient, ORANGE_DEEP]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.memberCard}
          >
            <Icon
              name="heart"
              size={120}
              color="rgba(255, 235, 59, 0.22)"
              style={styles.heartWatermark}
            />

            <View style={styles.memberTopRow}>
              <View style={styles.crownCircle}>
                <Icon name="crown" size={18} color="#C99200" />
              </View>
              <View style={styles.memberHeadTexts}>
                <Text style={styles.goldMemberLabel}>
                  {member?.loyalty.isGoldMember
                    ? 'GOLD MEMBER'
                    : member?.loyalty.stageLabel.toUpperCase() ?? 'MEMBER'}
                </Text>
                <Text style={styles.thankYouText}>
                  {member?.loyalty.isGoldMember
                    ? '10% off every visit 💛'
                    : 'Thank you for being with us 💛'}
                </Text>
              </View>
            </View>

            <View style={styles.pointsRow}>
              <Icon name="star" size={16} color="#FFF" />
              <Text style={styles.pointsVal}>{displayPoints} Points</Text>
            </View>
            <Text style={styles.visitsHint}>
              {member?.loyalty.isGoldMember
                ? 'Gold benefits active on every visit'
                : member && (member.loyalty.loyaltyVisitsRemaining ?? 0) > 0
                  ? `${member.loyalty.loyaltyVisitsRemaining} loyalty visits remaining`
                  : 'Complete your welcome journey to unlock more rewards'}
            </Text>

            <View style={styles.progressRow}>
              <View style={styles.segmentTrack}>
                {Array.from({ length: JOURNEY_TOTAL }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.segment,
                      i < visitsFilled && styles.segmentFilled,
                      i === JOURNEY_TOTAL - 1 && styles.segmentLast,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.progressFraction}>
                {visitsFilled}/{JOURNEY_TOTAL}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.viewCardBtn}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="View my card"
            >
              <Text style={styles.viewCardBtnText}>View My Card</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.menuCard}>
          {menuRows.map((row, index) => (
            <React.Fragment key={row.label}>
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.75}
                accessibilityRole="button"
                onPress={
                  row.icon === 'lock-outline' ? onChangePassword : undefined
                }
              >
                <View
                  style={[styles.menuIconCircle, { backgroundColor: row.circleBg }]}
                >
                  <Icon
                    name={row.icon}
                    size={22}
                    color={row.icon === 'lock-outline' ? '#C62828' : primary}
                  />
                </View>
                <Text style={styles.menuRowLabel}>{row.label}</Text>
              </TouchableOpacity>
              {index < menuRows.length - 1 ? (
                <View style={styles.menuDivider} />
              ) : null}
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.7} style={styles.commPrefs}>
          <Text style={styles.commPrefsText}>Communication Preferences</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <View style={styles.legalWrap}>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.legalLink}>Terms & Conditions</Text>
            </TouchableOpacity>
            <Text style={styles.legalSep}> | </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: primary }]}
            activeOpacity={0.88}
            onPress={onLogout}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.poweredBy}>
          Powered by Savassachi Marketing ❤️
        </Text>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },
  decorSpot: { position: 'absolute' },
  headerSafe: {
    backgroundColor: '#FFF',
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoBlock: { alignItems: 'center', flex: 1 },
  logoOval: {
    borderWidth: 2,
    borderColor: '#1A1A1A',
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFF',
  },
  chiliRow: { flexDirection: 'row', alignItems: 'center' },
  chiliCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -2,
  },
  brandName: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '900',
    color: '#5D4037',
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    backgroundColor: '#E53935',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  screenTitleCaps: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  scroll: { flex: 1 },
  scrollInner: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 32,
  },
  profileIntro: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCol: {
    position: 'relative',
    marginRight: 16,
  },
  avatarRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    padding: 3,
    backgroundColor: '#FFF',
  },
  avatarRingInner: {
    flex: 1,
    borderRadius: 44,
    backgroundColor: '#FFF8F5',
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  camBadge: {
    position: 'absolute',
    right: -2,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F15A24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 3,
  },
  nameBlock: { flex: 1, minWidth: 0, justifyContent: 'center' },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: BROWN,
  },
  userEmail: {
    marginTop: 4,
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  editProfileBtn: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 11,
    paddingHorizontal: 36,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#212121',
  },
  editProfileBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  memberCardWrap: {
    marginTop: 20,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: ORANGE_DEEP,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  memberCard: {
    borderRadius: 18,
    paddingTop: 16,
    paddingBottom: 48,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  heartWatermark: {
    position: 'absolute',
    right: -28,
    top: -20,
  },
  memberTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  crownCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberHeadTexts: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  goldMemberLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  thankYouText: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.95)',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    zIndex: 1,
  },
  pointsVal: {
    marginLeft: 6,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  visitsHint: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '500',
    zIndex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    zIndex: 1,
  },
  segmentTrack: {
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  segmentFilled: {
    backgroundColor: '#FFD54F',
  },
  segmentLast: {
    marginRight: 0,
  },
  progressFraction: {
    marginLeft: 10,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    flexShrink: 0,
  },
  viewCardBtn: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 2,
  },
  viewCardBtnText: {
    color: '#212121',
    fontSize: 12,
    fontWeight: '800',
  },
  menuCard: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E4E0',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuRowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#212121',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginLeft: 70,
  },
  commPrefs: {
    marginTop: 18,
    alignSelf: 'flex-start',
  },
  commPrefsText: {
    fontSize: 14,
    color: '#616161',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  legalWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  legalLink: {
    color: '#F15A24',
    fontSize: 12,
    fontWeight: '700',
  },
  legalSep: {
    color: '#9E9E9E',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#F15A24',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 22,
    elevation: 2,
  },
  logoutBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  poweredBy: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  staffBody: {
    padding: 28,
    alignItems: 'center',
  },
  staffAvatarWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  staffAvatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: '#FFF3E0',
    borderWidth: 3,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffAvatarImg: { width: '100%', height: '100%' },
  staffCamBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  staffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  staffBadgeText: { fontSize: 13, fontWeight: '800' },
  staffName: { fontSize: 24, fontWeight: '900', color: BROWN },
  staffEmail: { fontSize: 15, color: '#666', marginTop: 8 },
  staffRestaurant: { fontSize: 14, color: '#888', marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    marginBottom: 16,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statNum: { fontSize: 20, fontWeight: '900' },
  statLbl: { fontSize: 11, color: '#888', marginTop: 4, fontWeight: '600' },
  staffMenuCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 20,
    overflow: 'hidden',
  },
  staffMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    position: 'relative',
  },
  staffMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffMenuText: { flex: 1 },
  staffMenuLabel: { fontSize: 15, fontWeight: '700', color: '#222' },
  staffMenuSub: { fontSize: 12, color: '#888', marginTop: 2 },
  staffMenuDivider: {
    position: 'absolute',
    bottom: 0,
    left: 66,
    right: 14,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EEE',
  },
});

export default ProfileScreen;
