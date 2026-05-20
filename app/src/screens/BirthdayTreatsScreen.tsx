import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatureShell from './FeatureShell';
import { fetchCampaigns } from '../api/growthApi';
import { useBrandStyles } from '../theme/useBrandStyles';

export type BirthdayTreatsScreenProps = { onBack: () => void };

function formatBirthday(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

const BirthdayTreatsScreen = ({ onBack }: BirthdayTreatsScreenProps) => {
  const { primary, member, slug, brandName } = useBrandStyles();
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('Happy Birthday');

  useEffect(() => {
    fetchCampaigns(slug)
      .then(campaigns => {
        const bday = campaigns.find(c => c.type === 'BIRTHDAY' && c.isEnabled);
        if (bday) {
          setTitle(bday.title);
          setBody(
            bday.bodyTemplate.replace(/\{\{restaurantName\}\}/g, brandName),
          );
        } else {
          setBody(
            `Add your birthday in Profile to unlock a special treat from ${brandName} on your big day.`,
          );
        }
      })
      .catch(() => {
        setBody(
          `Members with a birthday on file receive a complimentary treat from ${brandName}.`,
        );
      })
      .finally(() => setLoading(false));
  }, [slug, brandName]);

  const savedBirthday = formatBirthday(member?.birthday);

  return (
    <FeatureShell
      title="Birthday Treats"
      subtitle="Special rewards on your birthday"
      onBack={onBack}
    >
      {loading ? (
        <ActivityIndicator color={primary} style={{ marginTop: 24 }} />
      ) : (
        <View style={[styles.card, { borderColor: primary }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#FCE4EC' }]}>
            <Icon name="cake-variant" size={40} color="#EC407A" />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardBody}>{body}</Text>
          {savedBirthday ? (
            <View style={styles.bdayRow}>
              <Icon name="calendar-heart" size={18} color={primary} />
              <Text style={[styles.bdayText, { color: primary }]}>
                Your birthday: {savedBirthday}
              </Text>
            </View>
          ) : (
            <Text style={styles.hint}>
              Add your birthday in Edit Profile so we can surprise you.
            </Text>
          )}
        </View>
      )}
    </FeatureShell>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#3E2723' },
  cardBody: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
  },
  bdayRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  bdayText: { fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 13, color: '#888', marginTop: 14, textAlign: 'center' },
});

export default BirthdayTreatsScreen;
