import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BROWN = '#3E2723';

export type NotificationCardProps = {
  borderColor: string;
  accentColor: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  buttonText?: string;
  onPressButton?: () => void;
  /** Optional label under icon (e.g. “10 Points” on chilli tile). */
  iconCaption?: string;
};

const NotificationCard = ({
  borderColor,
  accentColor,
  icon,
  iconBg,
  iconColor,
  title,
  description,
  buttonText,
  onPressButton,
  iconCaption,
}: NotificationCardProps) => {
  return (
    <View style={[styles.card, { borderColor }]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, iconCaption && styles.iconWrapCaption, { backgroundColor: iconBg }]}>
          <Icon name={icon} size={iconCaption ? 22 : 26} color={iconColor} />
          {iconCaption ? (
            <Text style={[styles.iconCaption, { color: iconColor }]}>
              {iconCaption}
            </Text>
          ) : null}
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>
          {buttonText ? (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: accentColor }]}
              onPress={onPressButton}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel={buttonText}
            >
              <Text style={styles.btnText}>{buttonText}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWrapCaption: {
    height: 64,
    paddingVertical: 6,
    flexDirection: 'column',
  },
  iconCaption: {
    fontSize: 8,
    fontWeight: '900',
    marginTop: 2,
    textAlign: 'center',
  },
  textCol: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 13,
    fontWeight: '900',
    color: BROWN,
    letterSpacing: 0.35,
  },
  desc: {
    marginTop: 6,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    fontWeight: '500',
  },
  btn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default NotificationCard;
