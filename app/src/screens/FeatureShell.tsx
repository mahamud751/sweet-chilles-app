import React, { type ReactNode } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBrandStyles } from '../theme/useBrandStyles';

const BROWN = '#3E2723';

export type FeatureShellProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

const FeatureShell = ({
  title,
  subtitle,
  onBack,
  children,
  footer,
}: FeatureShellProps) => {
  const { primary, brandNameUpper } = useBrandStyles();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} hitSlop={12} accessibilityLabel="Go back">
            <Icon name="arrow-left" size={26} color={BROWN} />
          </TouchableOpacity>
          <View style={styles.headerMid}>
            <Text style={[styles.brand, { color: primary }]}>{brandNameUpper}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F8F8' },
  safe: { backgroundColor: '#FFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEE' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerMid: { flex: 1, alignItems: 'center' },
  headerSpacer: { width: 26 },
  brand: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '900', color: BROWN, marginTop: 4 },
  sub: { fontSize: 13, color: '#888', marginTop: 4, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollInner: { padding: 18, paddingBottom: 32 },
});

export default FeatureShell;
