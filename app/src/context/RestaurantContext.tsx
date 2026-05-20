import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RestaurantBranding } from '../config/restaurant';
import { RESTAURANT_SLUG } from '../config/restaurant';
import {
  fetchBranding,
  fetchSession,
  type AppSession,
  type MemberProfile,
  type StaffProfile,
} from '../api/growthApi';
import {
  getAccountType,
  getMember,
  getStaff,
  loadSession,
  saveSession,
  type AccountType,
} from '../session/authStore';
import { brandGradient, darkenHex } from '../theme/brandColors';

type RestaurantContextValue = {
  slug: string;
  branding: RestaurantBranding | null;
  member: MemberProfile | null;
  staff: StaffProfile | null;
  accountType: AccountType | null;
  isMember: boolean;
  isStaff: boolean;
  authToken: string | null;
  booting: boolean;
  bootError: string | null;
  primary: string;
  primaryDeep: string;
  gradient: [string, string, string];
  brandName: string;
  brandNameUpper: string;
  appDisplayName: string;
  welcomeDiscountPercent: number;
  tagline: string | null;
  unreadNotifications: number;
  refreshSession: () => Promise<void>;
  setAuth: (session: AppSession) => Promise<void>;
  clearAuth: () => Promise<void>;
};

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

function restaurantFromSession(
  session: AppSession,
): { slug?: string; name?: string; appDisplayName?: string; primaryColor?: string } | null {
  if (session.accountType === 'member') {
    return session.member.restaurant;
  }
  return session.staff.restaurant;
}

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<RestaurantBranding | null>(null);
  const [member, setMember] = useState<MemberProfile | null>(getMember());
  const [staff, setStaff] = useState<StaffProfile | null>(getStaff());
  const [accountType, setAccountType] = useState<AccountType | null>(getAccountType());
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  const applySession = useCallback(async (session: AppSession) => {
    await saveSession(session);
    setAuthToken(session.token);
    setAccountType(session.accountType);
    if (session.accountType === 'member') {
      setMember(session.member);
      setStaff(null);
    } else {
      setStaff(session.staff);
      setMember(null);
    }
    const restaurant = restaurantFromSession(session);
    if (restaurant?.primaryColor) {
      const color = restaurant.primaryColor;
      setBranding(prev => {
        const base = prev ?? {
          id: '',
          slug: RESTAURANT_SLUG,
          name: restaurant.name ?? 'Restaurant',
          appDisplayName: restaurant.appDisplayName ?? restaurant.name ?? 'Restaurant',
          primaryColor: color,
          welcomeDiscountPercent: 30,
          foodOnlyExcludesDrinks: true,
        };
        return {
          ...base,
          primaryColor: color,
          name: restaurant.name ?? base.name,
          appDisplayName:
            restaurant.appDisplayName ?? base.appDisplayName,
        };
      });
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const stored = await loadSession();
    if (!stored.token) {
      setAuthToken(null);
      setMember(null);
      setStaff(null);
      setAccountType(null);
      return;
    }
    const remote = await fetchSession(stored.token);
    if (remote.accountType === 'member') {
      await applySession({
        accountType: 'member',
        token: stored.token,
        member: remote.member,
      });
    } else {
      await applySession({
        accountType: 'staff',
        token: stored.token,
        staff: remote.staff,
      });
    }
  }, [applySession]);

  const bootstrap = useCallback(async () => {
    setBooting(true);
    setBootError(null);
    try {
      const brand = await fetchBranding(RESTAURANT_SLUG);
      setBranding(brand);
      const stored = await loadSession();
      if (stored.token) {
        const remote = await fetchSession(stored.token);
        if (remote.accountType === 'member') {
          await applySession({
            accountType: 'member',
            token: stored.token,
            member: remote.member,
          });
        } else {
          await applySession({
            accountType: 'staff',
            token: stored.token,
            staff: remote.staff,
          });
        }
      }
    } catch (e) {
      setBootError(
        e instanceof Error ? e.message : 'Could not load restaurant from API',
      );
    } finally {
      setBooting(false);
    }
  }, [applySession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const setAuth = useCallback(
    async (session: AppSession) => {
      await applySession(session);
    },
    [applySession],
  );

  const clearAuth = useCallback(async () => {
    const { clearSession } = await import('../session/authStore');
    await clearSession();
    setAuthToken(null);
    setMember(null);
    setStaff(null);
    setAccountType(null);
  }, []);

  const primary =
    member?.restaurant.primaryColor ??
    staff?.restaurant?.primaryColor ??
    branding?.primaryColor ??
    '#F15A24';

  const value = useMemo<RestaurantContextValue>(() => {
    const brandName =
      branding?.name ??
      member?.restaurant.name ??
      staff?.restaurant?.name ??
      'Restaurant';
    return {
      slug: RESTAURANT_SLUG,
      branding,
      member,
      staff,
      accountType,
      isMember: accountType === 'member',
      isStaff: accountType === 'staff',
      authToken,
      booting,
      bootError,
      primary,
      primaryDeep: darkenHex(primary, 20),
      gradient: brandGradient(primary),
      brandName,
      brandNameUpper: brandName.toUpperCase(),
      appDisplayName:
        branding?.appDisplayName ??
        member?.restaurant.appDisplayName ??
        staff?.restaurant?.appDisplayName ??
        brandName,
      welcomeDiscountPercent: branding?.welcomeDiscountPercent ?? 30,
      tagline: branding?.tagline ?? null,
      unreadNotifications:
        member?.notifications?.filter(n => !n.read).length ?? 0,
      refreshSession,
      setAuth,
      clearAuth,
    };
  }, [
    branding,
    member,
    staff,
    accountType,
    authToken,
    booting,
    bootError,
    primary,
    refreshSession,
    setAuth,
    clearAuth,
  ]);

  return (
    <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return ctx;
}
