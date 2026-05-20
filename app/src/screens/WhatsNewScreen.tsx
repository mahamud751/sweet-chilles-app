import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatureShell from './FeatureShell';
import { fetchCampaigns } from '../api/growthApi';
import { useBrandStyles } from '../theme/useBrandStyles';

export type WhatsNewScreenProps = {
  onBack: () => void;
  onOpenNotifications?: () => void;
};

type NewsItem = {
  id: string;
  title: string;
  body: string;
  icon: React.ComponentProps<typeof Icon>['name'];
};

const WhatsNewScreen = ({ onBack, onOpenNotifications }: WhatsNewScreenProps) => {
  const { primary, member, slug, brandName } = useBrandStyles();
  const [loading, setLoading] = useState(true);
  const [campaignItems, setCampaignItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchCampaigns(slug)
      .then(campaigns => {
        setCampaignItems(
          campaigns
            .filter(c => c.isEnabled && c.type !== 'SYSTEM_UNLOCK')
            .map(c => ({
              id: c.id,
              title: c.title,
              body: c.bodyTemplate.replace(/\{\{restaurantName\}\}/g, brandName),
              icon:
                c.type === 'SEASONAL'
                  ? 'calendar-star'
                  : c.type === 'QUIET_DAY'
                    ? 'weather-sunny'
                    : 'bullhorn',
            })),
        );
      })
      .catch(() => setCampaignItems([]))
      .finally(() => setLoading(false));
  }, [slug, brandName]);

  const items = useMemo((): NewsItem[] => {
    const notifs: NewsItem[] = (member?.notifications ?? []).map(n => ({
      id: n.id,
      title: n.title,
      body: n.body,
      icon: 'bell',
    }));
    return [...notifs, ...campaignItems];
  }, [member?.notifications, campaignItems]);

  return (
    <FeatureShell
      title="What's New"
      subtitle="Latest offers and updates"
      onBack={onBack}
    >
      {loading && items.length === 0 ? (
        <ActivityIndicator color={primary} style={{ marginTop: 24 }} />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>No updates yet — check back soon.</Text>
      ) : (
        items.map(item => (
          <View key={item.id} style={styles.row}>
            <View style={[styles.icon, { backgroundColor: '#E3F2FD' }]}>
              <Icon name={item.icon} size={22} color={primary} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowBody}>{item.body}</Text>
            </View>
          </View>
        ))
      )}
      {onOpenNotifications ? (
        <Text style={[styles.link, { color: primary }]} onPress={onOpenNotifications}>
          View all notifications →
        </Text>
      ) : null}
    </FeatureShell>
  );
};

const styles = StyleSheet.create({
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textCol: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '800', color: '#212121' },
  rowBody: { fontSize: 13, color: '#666', marginTop: 4, lineHeight: 18 },
  link: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 16 },
});

export default WhatsNewScreen;
