import React from 'react';
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatureShell from './FeatureShell';
import { useBrandStyles } from '../theme/useBrandStyles';

export type ReferEarnScreenProps = { onBack: () => void };

const ReferEarnScreen = ({ onBack }: ReferEarnScreenProps) => {
  const { primary, member, brandName, appDisplayName } = useBrandStyles();
  const code = member?.referralCode ?? member?.id?.slice(0, 8).toUpperCase() ?? 'MEMBER';

  const shareMessage = `Join ${appDisplayName} at ${brandName} and use my code ${code} when you sign up. Earn rewards on every visit!`;

  const onShare = async () => {
    try {
      await Share.share({ message: shareMessage });
    } catch {
      Alert.alert('Could not share', 'Copy your code manually.');
    }
  };

  const onCopy = () => {
    Alert.alert('Your referral code', code);
  };

  return (
    <FeatureShell
      title="Refer & Earn"
      subtitle="Invite friends and earn rewards"
      onBack={onBack}
    >
      <View style={[styles.card, { borderColor: primary }]}>
        <Icon name="account-multiple" size={48} color={primary} />
        <Text style={styles.lead}>
          Share your code. When friends join {brandName}, you both move faster on
          the loyalty journey.
        </Text>
        <View style={styles.codeBox}>
          <Text style={[styles.code, { color: primary }]}>{code}</Text>
        </View>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: primary }]}
          onPress={onShare}
          activeOpacity={0.88}
        >
          <Icon name="share-variant" size={20} color="#FFF" />
          <Text style={styles.btnText}>Share invite</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={onCopy} activeOpacity={0.7}>
          <Text style={[styles.btnOutlineText, { color: primary }]}>Show code</Text>
        </TouchableOpacity>
      </View>
    </FeatureShell>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    alignItems: 'center',
  },
  lead: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 14,
    marginBottom: 18,
  },
  codeBox: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 18,
    width: '100%',
    alignItems: 'center',
  },
  code: { fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  btnOutline: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnOutlineText: { fontWeight: '700', fontSize: 14 },
});

export default ReferEarnScreen;
