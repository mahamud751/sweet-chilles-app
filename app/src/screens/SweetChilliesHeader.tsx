import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBrandStyles } from '../theme/useBrandStyles';

export type SweetChilliesHeaderProps = {
  left: 'back' | 'menu';
  onLeftPress: () => void;
  onBellPress?: () => void;
  menuIconColor?: string;
  notificationCount?: number;
};

const SweetChilliesHeader = ({
  left,
  onLeftPress,
  onBellPress,
  menuIconColor,
  notificationCount,
}: SweetChilliesHeaderProps) => {
  const { primary, brandNameUpper, branding, unreadNotifications } =
    useBrandStyles();
  const accent = menuIconColor ?? primary;
  const badgeCount = notificationCount ?? unreadNotifications;

  return (
    <SafeAreaView style={styles.safeTop} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onLeftPress}
          hitSlop={12}
          style={styles.sideBtn}
          accessibilityRole="button"
          accessibilityLabel={left === 'back' ? 'Go back' : 'Menu'}
        >
          {left === 'back' ? (
            <Icon name="chevron-left" size={28} color="#222" />
          ) : (
            <Icon name="menu" size={28} color={accent} />
          )}
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          {branding?.logoUrl ? (
            <Image
              source={{ uri: branding.logoUrl }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.chiliRow}>
              <View style={[styles.chiliCircle, { backgroundColor: '#C4D600' }]}>
                <Icon name="chili-mild" size={14} color="#2D4D00" />
              </View>
              <View
                style={[
                  styles.chiliCircle,
                  {
                    backgroundColor: '#FFD700',
                    zIndex: 1,
                    transform: [{ scale: 1.12 }],
                  },
                ]}
              >
                <Icon name="chili-mild" size={16} color="#D35400" />
              </View>
              <View style={[styles.chiliCircle, { backgroundColor: '#E31E24' }]}>
                <Icon name="chili-mild" size={14} color="#8B0000" />
              </View>
            </View>
          )}
          <Text style={[styles.logoText, { color: primary }]}>
            {brandNameUpper}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.sideBtn}
          hitSlop={12}
          onPress={onBellPress ?? (() => {})}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Icon name="bell-outline" size={26} color="#222" />
          {badgeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badgeCount > 9 ? '9+' : badgeCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeTop: { backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
  },
  sideBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoContainer: { alignItems: 'center' },
  logoImage: { width: 120, height: 36 },
  chiliRow: { flexDirection: 'row', alignItems: 'center' },
  chiliCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E53935',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
});

export default SweetChilliesHeader;
