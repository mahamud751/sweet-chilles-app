import React, { useMemo } from 'react';
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
import { useBrandStyles } from '../theme/useBrandStyles';
const PAGE_BG = '#F8F8F8';
const BROWN = '#3E2723';

export type NotificationsScreenProps = {
  onClose: () => void;
  onNavFooter: (key: FooterNavKey) => void;
  onRefresh?: () => void;
};

type NotifDef = { id: string } & Omit<
  React.ComponentProps<typeof NotificationCard>,
  'onPressButton'
>;

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
  onRefresh,
}: NotificationsScreenProps) => {
  const { primary, member, btnOutline, btnOutlineText, btnPrimary, btnPrimaryText } =
    useBrandStyles();

  const apiNotifs = member?.notifications ?? [];

  const visibleDefs = useMemo((): NotifDef[] => {
    return apiNotifs.map(n => {
      const isGold = n.title.toLowerCase().includes('gold');
      const isReward = n.title.toLowerCase().includes('reward');
      return {
        id: n.id,
        borderColor: isGold ? '#F15A24' : isReward ? '#2E7D32' : primary,
        accentColor: isGold ? '#F9A825' : isReward ? '#2E7D32' : primary,
        icon: isGold ? 'crown' : isReward ? 'gift' : 'bell',
        iconBg: '#FFF3E0',
        iconColor: isGold ? '#F9A825' : isReward ? '#2E7D32' : primary,
        title: n.title.toUpperCase(),
        description: n.body,
        buttonText: isReward ? 'VIEW OFFER' : undefined,
      };
    });
  }, [apiNotifs, primary]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <NotificationsBackgroundDecor />

      <SweetChilliesHeader
        left="menu"
        menuIconColor={primary}
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
        {visibleDefs.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="bell-off-outline" size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySub}>
              Reward unlocks and updates will show up here.
            </Text>
          </View>
        ) : (
          visibleDefs.map(def => {
            const { id, ...cardProps } = def;
            return (
              <NotificationCard
                key={id}
                {...cardProps}
                onPressButton={
                  def.buttonText === 'VIEW OFFER'
                    ? () => onNavFooter('offers')
                    : undefined
                }
              />
            );
          })
        )}

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={[styles.settingsBtn, btnOutline]}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Notification settings"
          >
            <Text style={[styles.settingsBtnText, btnOutlineText]}>
              Notification Settings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.clearBtn, btnPrimary]}
            activeOpacity={0.88}
            onPress={() => onRefresh?.()}
            accessibilityRole="button"
            accessibilityLabel="Clear all notifications"
          >
            <Text style={[styles.clearBtnText, btnPrimaryText]}>
              Clear All Notifications
            </Text>
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
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 24,
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
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnText: {
    fontSize: 12,
    textAlign: 'center',
  },
  clearBtn: {
    flex: 1,
    minWidth: 140,
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
