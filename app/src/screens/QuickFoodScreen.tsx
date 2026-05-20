import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatureShell from './FeatureShell';
import { useBrandStyles } from '../theme/useBrandStyles';

export type QuickFoodScreenProps = { onBack: () => void };

const QuickFoodScreen = ({ onBack }: QuickFoodScreenProps) => {
  const { primary, member, brandName } = useBrandStyles();
  const phone = member?.phone?.trim();

  return (
    <FeatureShell
      title="Quick Food"
      subtitle="Delivery or collection"
      onBack={onBack}
    >
      <View style={styles.card}>
        <View style={[styles.icon, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="motorbike" size={40} color="#F57C00" />
        </View>
        <Text style={styles.title}>Order for collection or delivery</Text>
        <Text style={styles.body}>
          Call {brandName} to place your order. Show your member QR at collection
          to redeem active vouchers on your bill.
        </Text>
        {phone ? (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: primary }]}
            onPress={() => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`)}
          >
            <Icon name="phone" size={20} color="#FFF" />
            <Text style={styles.btnText}>Call {phone}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.hint}>Add your phone in Profile for quick dial.</Text>
        )}
      </View>
    </FeatureShell>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: '900', color: '#3E2723', textAlign: 'center' },
  body: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 18,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  hint: { fontSize: 13, color: '#888', textAlign: 'center' },
});

export default QuickFoodScreen;
