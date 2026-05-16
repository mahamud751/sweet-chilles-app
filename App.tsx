/**
 * Sweet Chillies — React Native CLI app
 *
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import { SIGNED_IN_USER } from './src/sessionUser';
import MyOffers from './src/screens/MyOffers';
import ProfileScreen from './src/screens/ProfileScreen';
import WalletScreen from './src/screens/WalletScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import AppBottomNav from './src/screens/AppBottomNav';
import type { AppBottomNavActive } from './src/screens/AppBottomNav';
import type { FooterNavKey } from './src/screens/screenNav';

type MainRoute = 'home' | 'myOffers' | 'wallet' | 'profile';
type AppRoute = 'welcome' | MainRoute | 'notifications';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [route, setRoute] = useState<AppRoute>('welcome');
  const [lastMainRoute, setLastMainRoute] = useState<MainRoute>('home');

  useEffect(() => {
    if (
      route === 'home' ||
      route === 'myOffers' ||
      route === 'wallet' ||
      route === 'profile'
    ) {
      setLastMainRoute(route);
    }
  }, [route]);

  const openNotifications = useCallback(() => {
    setRoute('notifications');
  }, []);

  const onNavFooter = useCallback((key: FooterNavKey) => {
    switch (key) {
      case 'home':
        setRoute('home');
        break;
      case 'wallet':
        setRoute('wallet');
        break;
      case 'profile':
        setRoute('profile');
        break;
      case 'offers':
        setRoute('myOffers');
        break;
      case 'scan':
      case 'more':
      default:
        break;
    }
  }, []);

  const bottomNavActive: AppBottomNavActive =
    lastMainRoute === 'myOffers' ? 'offers' : lastMainRoute;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {route === 'welcome' ? (
        <WelcomeScreen onContinue={() => setRoute('home')} />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {route === 'home' ? (
              <HomeScreen
                user={SIGNED_IN_USER}
                onOpenMyOffers={() => onNavFooter('offers')}
                onOpenWallet={() => onNavFooter('wallet')}
                onOpenProfile={() => onNavFooter('profile')}
                onOpenNotifications={openNotifications}
              />
            ) : route === 'myOffers' ? (
              <MyOffers
                onBack={() => onNavFooter('home')}
                onOpenNotifications={openNotifications}
              />
            ) : route === 'wallet' ? (
              <WalletScreen
                onBack={() => onNavFooter('home')}
                onNavFooter={onNavFooter}
              />
            ) : route === 'notifications' ? (
              <NotificationsScreen
                onClose={() => setRoute(lastMainRoute)}
                onNavFooter={onNavFooter}
              />
            ) : (
              <ProfileScreen
                user={SIGNED_IN_USER}
                onBack={() => onNavFooter('home')}
                onOpenNotifications={openNotifications}
              />
            )}
          </View>
          <AppBottomNav active={bottomNavActive} onSelect={onNavFooter} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

export default App;
