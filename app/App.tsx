/**
 * Savasaachi Growth Engine App — white-label member app (production API)
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import MyOffers from './src/screens/MyOffers';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import WalletScreen from './src/screens/WalletScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import BirthdayTreatsScreen from './src/screens/BirthdayTreatsScreen';
import WhatsNewScreen from './src/screens/WhatsNewScreen';
import ReferEarnScreen from './src/screens/ReferEarnScreen';
import QuickFoodScreen from './src/screens/QuickFoodScreen';
import BookTableScreen from './src/screens/BookTableScreen';
import ScanScreen from './src/screens/ScanScreen';
import EditStaffProfileScreen from './src/screens/EditStaffProfileScreen';
import AdminMembersScreen from './src/screens/admin/AdminMembersScreen';
import AdminVouchersScreen from './src/screens/admin/AdminVouchersScreen';
import AdminOffersScreen from './src/screens/admin/AdminOffersScreen';
import AppBottomNav from './src/screens/AppBottomNav';
import type { AppBottomNavActive } from './src/screens/AppBottomNav';
import type { FooterNavKey } from './src/screens/screenNav';
import { RestaurantProvider } from './src/context/RestaurantContext';
import { useBrandStyles } from './src/theme/useBrandStyles';
import type { AppSession, MemberProfile, StaffProfile } from './src/api/growthApi';

type MainRoute = 'home' | 'myOffers' | 'wallet' | 'profile';
type FeatureRoute =
  | 'birthday'
  | 'whatsNew'
  | 'refer'
  | 'quickFood'
  | 'bookTable'
  | 'scan';
type AdminRoute = 'adminMembers' | 'adminVouchers' | 'adminOffers';
type AppRoute =
  | 'welcome'
  | MainRoute
  | 'notifications'
  | 'editProfile'
  | 'editStaffProfile'
  | AdminRoute
  | FeatureRoute;

const OVERLAY_ROUTES: AppRoute[] = [
  'notifications',
  'editProfile',
  'editStaffProfile',
  'adminMembers',
  'adminVouchers',
  'adminOffers',
  'birthday',
  'whatsNew',
  'refer',
  'quickFood',
  'bookTable',
  'scan',
];

function AppRoutes() {
  const isDarkMode = useColorScheme() === 'dark';
  const {
    booting,
    bootError,
    primary,
    member,
    staff,
    isStaff,
    authToken,
    setAuth,
    refreshSession,
    clearAuth,
    unreadNotifications,
  } = useBrandStyles();

  const [route, setRoute] = useState<AppRoute>('welcome');
  const [lastMainRoute, setLastMainRoute] = useState<MainRoute>('home');
  const [editPasswordMode, setEditPasswordMode] = useState(false);

  useEffect(() => {
    if (!authToken) return;
    setRoute('home');
    setLastMainRoute('home');
  }, [authToken]);

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

  const onLoginSuccess = useCallback(
    async (session: AppSession) => {
      await setAuth(session);
      setRoute('home');
      setLastMainRoute('home');
    },
    [setAuth],
  );

  const openNotifications = useCallback(() => {
    setRoute('notifications');
  }, []);

  const openEditProfile = useCallback(() => {
    setEditPasswordMode(false);
    setRoute('editProfile');
  }, []);

  const openChangePassword = useCallback(() => {
    setEditPasswordMode(true);
    setRoute(isStaff ? 'editStaffProfile' : 'editProfile');
  }, [isStaff]);

  const openEditStaffProfile = useCallback(() => {
    setEditPasswordMode(false);
    setRoute('editStaffProfile');
  }, []);

  const handleStaffProfileSaved = useCallback(
    async (profile: StaffProfile) => {
      if (authToken) {
        await setAuth({ accountType: 'staff', token: authToken, staff: profile });
      }
    },
    [authToken, setAuth],
  );

  const handleLogout = useCallback(async () => {
    await clearAuth();
    setRoute('welcome');
  }, [clearAuth]);

  const handleProfileSaved = useCallback(
    async (profile: MemberProfile) => {
      if (authToken) {
        await setAuth({ accountType: 'member', token: authToken, member: profile });
      }
    },
    [authToken, setAuth],
  );

  const closeOverlay = useCallback(() => {
    setRoute(lastMainRoute);
  }, [lastMainRoute]);

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
        setRoute('scan');
        break;
      default:
        break;
    }
  }, []);

  const bottomNavActive: AppBottomNavActive =
    route === 'scan'
      ? lastMainRoute === 'myOffers'
        ? 'offers'
        : lastMainRoute
      : lastMainRoute === 'myOffers'
        ? 'offers'
        : lastMainRoute;

  const user = member
    ? {
        displayName: member.name,
        email: member.email,
        phone: member.phone ?? '',
      }
    : staff
      ? {
          displayName: staff.displayName,
          email: staff.email,
          phone: '',
        }
      : { displayName: 'Guest', email: '', phone: '' };

  if (booting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  if (bootError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ textAlign: 'center', color: '#C62828', fontSize: 16 }}>
          {bootError}
        </Text>
        <Text style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
          Check network and sweetsapi.savasuite.co.uk
        </Text>
      </View>
    );
  }

  const showBottomNav = !OVERLAY_ROUTES.includes(route);

  return (
    <>
      <StatusBar
        barStyle={
          route === 'scan' || isDarkMode ? 'light-content' : 'dark-content'
        }
      />
      {route === 'welcome' ? (
        <WelcomeScreen onLoginSuccess={onLoginSuccess} />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {route === 'home' ? (
              <HomeScreen
                user={user}
                notificationCount={unreadNotifications}
                staffMode={isStaff}
                onOpenMyOffers={() => onNavFooter('offers')}
                onOpenWallet={() => onNavFooter('wallet')}
                onOpenProfile={() => onNavFooter('profile')}
                onOpenNotifications={openNotifications}
                onOpenBirthday={() => setRoute('birthday')}
                onOpenWhatsNew={() => setRoute('whatsNew')}
                onOpenRefer={() => setRoute('refer')}
                onOpenQuickFood={() => setRoute('quickFood')}
                onOpenBookTable={() => setRoute('bookTable')}
                onOpenCompetition={() => setRoute('whatsNew')}
                onOpenScan={() => onNavFooter('scan')}
                onOpenAdminMembers={
                  isStaff ? () => setRoute('adminMembers') : undefined
                }
                onOpenAdminVouchers={
                  isStaff ? () => setRoute('adminVouchers') : undefined
                }
                onOpenAdminOffers={
                  isStaff ? () => setRoute('adminOffers') : undefined
                }
              />
            ) : route === 'myOffers' ? (
              <MyOffers
                onBack={() => onNavFooter('home')}
                onOpenNotifications={openNotifications}
              />
            ) : route === 'wallet' ? (
              <WalletScreen
                authToken={authToken}
                onBack={() => onNavFooter('home')}
                onNavFooter={onNavFooter}
              />
            ) : route === 'notifications' ? (
              <NotificationsScreen
                onClose={closeOverlay}
                onNavFooter={onNavFooter}
                onRefresh={refreshSession}
              />
            ) : route === 'editProfile' ? (
              <EditProfileScreen
                onClose={() => setRoute('profile')}
                onSaved={handleProfileSaved}
                initialShowPassword={editPasswordMode}
              />
            ) : route === 'editStaffProfile' ? (
              <EditStaffProfileScreen
                onClose={() => setRoute('profile')}
                onSaved={handleStaffProfileSaved}
                initialShowPassword={editPasswordMode}
              />
            ) : route === 'adminMembers' ? (
              <AdminMembersScreen onBack={() => setRoute('profile')} />
            ) : route === 'adminVouchers' ? (
              <AdminVouchersScreen onBack={() => setRoute('profile')} />
            ) : route === 'adminOffers' ? (
              <AdminOffersScreen onBack={() => setRoute('profile')} />
            ) : route === 'birthday' ? (
              <BirthdayTreatsScreen onBack={closeOverlay} />
            ) : route === 'whatsNew' ? (
              <WhatsNewScreen
                onBack={closeOverlay}
                onOpenNotifications={openNotifications}
              />
            ) : route === 'refer' ? (
              <ReferEarnScreen onBack={closeOverlay} />
            ) : route === 'quickFood' ? (
              <QuickFoodScreen onBack={closeOverlay} />
            ) : route === 'bookTable' ? (
              <BookTableScreen
                onBack={closeOverlay}
                onBooked={refreshSession}
              />
            ) : route === 'scan' ? (
              <ScanScreen
                onBack={closeOverlay}
                onOpenOffers={() => onNavFooter('offers')}
                staffMode={isStaff}
              />
            ) : (
              <ProfileScreen
                user={user}
                staffMode={isStaff}
                onBack={() => onNavFooter('home')}
                onOpenNotifications={isStaff ? undefined : openNotifications}
                onEditProfile={isStaff ? undefined : openEditProfile}
                onEditStaffProfile={isStaff ? openEditStaffProfile : undefined}
                onChangePassword={openChangePassword}
                onOpenAdminMembers={
                  isStaff ? () => setRoute('adminMembers') : undefined
                }
                onOpenAdminVouchers={
                  isStaff ? () => setRoute('adminVouchers') : undefined
                }
                onOpenAdminOffers={
                  isStaff ? () => setRoute('adminOffers') : undefined
                }
                onOpenScan={isStaff ? () => onNavFooter('scan') : undefined}
                onLogout={handleLogout}
              />
            )}
          </View>
          {showBottomNav ? (
            <AppBottomNav active={bottomNavActive} onSelect={onNavFooter} />
          ) : null}
        </View>
      )}
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <RestaurantProvider>
        <AppRoutes />
      </RestaurantProvider>
    </SafeAreaProvider>
  );
}

export default App;
