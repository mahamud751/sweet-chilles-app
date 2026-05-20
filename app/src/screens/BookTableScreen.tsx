import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FeatureShell from './FeatureShell';
import { ApiError } from '../api/client';
import { createBooking } from '../api/growthApi';
import { useBrandStyles } from '../theme/useBrandStyles';

export type BookTableScreenProps = {
  onBack: () => void;
  onBooked?: () => void;
};

const BookTableScreen = ({ onBack, onBooked }: BookTableScreenProps) => {
  const { primary, authToken, brandName, btnPrimary, btnPrimaryText } =
    useBrandStyles();
  const [partySize, setPartySize] = useState('2');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (!authToken) {
      Alert.alert('Sign in required', 'Please log in to book a table.');
      return;
    }
    const size = parseInt(partySize, 10);
    if (!size || size < 1) {
      Alert.alert('Party size', 'Enter how many guests.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Date', 'Enter date as YYYY-MM-DD');
      return;
    }
    const bookedFor = new Date(`${date.trim()}T${time.trim() || '19:00'}:00`);
    if (Number.isNaN(bookedFor.getTime())) {
      Alert.alert('Date/time', 'Use YYYY-MM-DD and HH:MM');
      return;
    }

    setSaving(true);
    try {
      await createBooking(authToken, {
        partySize: size,
        bookedFor: bookedFor.toISOString(),
      });
      Alert.alert(
        'Booked',
        `Your table for ${size} at ${brandName} is reserved.`,
        [{ text: 'OK', onPress: () => { onBooked?.(); onBack(); } }],
      );
    } catch (e) {
      Alert.alert(
        'Booking failed',
        e instanceof ApiError ? e.message : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <FeatureShell
      title="Book a Table"
      subtitle="Reserve in advance"
      onBack={onBack}
    >
      <View style={styles.card}>
        <Text style={styles.label}>Party size</Text>
        <TextInput
          style={styles.input}
          value={partySize}
          onChangeText={setPartySize}
          keyboardType="number-pad"
          placeholder="2"
        />
        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2026-06-20"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Time (HH:MM)</Text>
        <TextInput
          style={styles.input}
          value={time}
          onChangeText={setTime}
          placeholder="19:00"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.btn, btnPrimary, saving && styles.btnDisabled]}
          onPress={onSubmit}
          disabled={saving}
          activeOpacity={0.88}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[styles.btnText, btnPrimaryText]}>Confirm booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </FeatureShell>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 18 },
  label: { fontSize: 12, fontWeight: '700', color: '#757575', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  btn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: 16, fontWeight: '800' },
});

export default BookTableScreen;
