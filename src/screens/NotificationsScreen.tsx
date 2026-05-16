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
import NotificationCard from './NotificationCard';
import type { FooterNavKey } from './screenNav';

const ORANGE = '#F15A24';
const PAGE_BG = '#F8F8F8';
const BROWN = '#3E2723';

export type NotificationsScreenProps = {
  onClose: () => void;
  onNavFooter: (key: FooterNavKey) => void;
};

type NotifDef = { id: string } & Omit<
  React.ComponentProps<typeof NotificationCard>,
  'onPressButton'
>;

const NOTIFICATION_DEFS: NotifDef[] = [
  {
    id: '1',
    borderColor: '#2E7D32',
    accentColor: '#2E7D32',
    icon: 'gift',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    title: 'WELCOME REWARD',
    description:
      'Claim your 30% discount on your first order now!',
    buttonText: 'CLAIM NOW',
  },
  {
    id: '2',
    borderColor: ORANGE,
    accentColor: ORANGE,
    icon: 'crown',
    iconBg: '#FFF3E0',
    iconColor: '#F9A825',
    title: 'GOLD MEMBER REWARD',
    description:
      'Your special reward for Gold Member status is ready!',
    buttonText: 'VIEW OFFER',
  },
  {
    id: '3',
    borderColor: '#FFCC80',
    accentColor: ORANGE,
    icon: 'chili-mild',
    iconBg: '#FFF3E0',
    iconColor: '#C62828',
    title: 'POINTS MILESTONE REACHED',
    description:
      "Congratulations! You've just earned 10 bonus points for your recent visits.",
    iconCaption: '10 Points',
  },
  {
    id: '4',
    borderColor: '#1976D2',
    accentColor: '#1976D2',
    icon: 'pot-steam',
    iconBg: '#E3F2FD',
    iconColor: '#1565C0',
    title: "CHEF'S SPECIAL TODAY",
    description:
      'Try our exclusive Butter Chicken special at 15% off!',
    buttonText: 'VIEW MENU',
  },
  {
    id: '5',
    borderColor: '#6D4C41',
    accentColor: '#6D4C41',
    icon: 'account-group',
    iconBg: '#EFEBE9',
    iconColor: '#5D4037',
    title: 'COMMUNITY POLL RESULTS',
    description:
      'See which dish won the community favorite this week!',
    buttonText: 'VIEW RESULTS',
  },
];

function NotificationsBackgroundDecor() {
  const spots = [
    { top: '14%', left: '6%', icon: 'leaf' as const, size: 20, rot: '-10deg' },
    { top: '18%', right: '8%', icon: 'chili-mild' as const, size: 18, rot: '15deg' },
    { top: '28%', left: '12%', icon: 'chili-mild' as const, size: 14, rot: '8deg' },
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
            style={{ opacity: 0.25, transform: [{ rotate: s.rot }] }}
          />
        </View>
      ))}
    </View>
  );
}

const NotificationsScreen = ({
  onClose,
  onNavFooter,
}: NotificationsScreenProps) => {
  const [visibleIds, setVisibleIds] = useState(
    () => new Set(NOTIFICATION_DEFS.map(d => d.id)),
  );

  const visibleDefs = useMemo(
    () => NOTIFICATION_DEFS.filter(d => visibleIds.has(d.id)),
    [visibleIds],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <NotificationsBackgroundDecor />

      <SweetChilliesHeader
        left="menu"
        menuIconColor={ORANGE}
        onLeftPress={onClose}
      />

      <View style={styles.titleBlock}>
        <Text style={styles.screenTitle}>NOTIFICATIONS</Text>
        <View style={styles.titleDecor} pointerEvents="none">
          <Icon name="leaf" size={18} color="#A5D6A7" style={styles.titleLeaf} />
          <Icon name="chili-mild" size={16} color="#FFAB91" style={styles.titleChili} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}
      >
        {visibleDefs.map(def => {
          const { id, ...cardProps } = def;
          return (
            <NotificationCard
              key={id}
              {...cardProps}
              onPressButton={
                def.buttonText === 'VIEW OFFER'
                  ? () => onNavFooter('offers')
                  : def.buttonText
                    ? () => {}
                    : undefined
              }
            />
          );
        })}

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.settingsBtn}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Notification settings"
          >
            <Text style={styles.settingsBtnText}>Notification Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearBtn}
            activeOpacity={0.88}
            onPress={() => setVisibleIds(new Set())}
            accessibilityRole="button"
            accessibilityLabel="Clear all notifications"
          >
            <Text style={styles.clearBtnText}>Clear All Notifications</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.poweredBy}>
          Powered by Savassachi Marketing ❤️
        </Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },
  decorSpot: { position: 'absolute' },
  titleBlock: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
    position: 'relative',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: BROWN,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  titleDecor: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 40,
  },
  titleLeaf: {
    position: 'absolute',
    left: '8%',
    top: 4,
    opacity: 0.9,
  },
  titleChili: {
    position: 'absolute',
    right: '10%',
    top: 0,
    opacity: 0.95,
  },
  scroll: { flex: 1 },
  scrollInner: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
  },
  footerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  settingsBtn: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1.5,
    borderColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  settingsBtnText: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  clearBtn: {
    flex: 1,
    minWidth: 140,
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  poweredBy: {
    textAlign: 'center',
    fontSize: 10,
    color: '#9E9E9E',
    fontWeight: '500',
    marginTop: 4,
  },
});

export default NotificationsScreen;
