import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ORANGE = '#F15A24';

export type SweetChilliesHeaderProps = {
  /** Back chevron (e.g. My Offers) or menu (e.g. Notifications / Home). */
  left: 'back' | 'menu';
  onLeftPress: () => void;
  onBellPress?: () => void;
  /** Menu icon colour; back chevron stays dark. */
  menuIconColor?: string;
};

/**
 * Shared top bar: left action, centered Sweet Chillies mark, bell + badge.
 */
const SweetChilliesHeader = ({
  left,
  onLeftPress,
  onBellPress,
  menuIconColor = ORANGE,
}: SweetChilliesHeaderProps) => {
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
            <Icon name="menu" size={28} color={menuIconColor} />
          )}
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
                  transform: [{ scale: 1.12 }],
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
          <Text style={styles.logoText}>SWEET CHILLIES</Text>
        </View>

        <TouchableOpacity
          style={styles.sideBtn}
          hitSlop={12}
          onPress={onBellPress ?? (() => {})}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Icon name="bell-outline" size={26} color="#222" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
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
    color: ORANGE,
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
