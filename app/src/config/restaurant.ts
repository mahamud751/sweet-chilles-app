import { Platform } from 'react-native';

/**
 * Tenant slug — one branded app build per restaurant.
 * Change only this (or use env) when white-labelling for another client.
 */
export const RESTAURANT_SLUG = 'sweet-chillies';

/** Production Growth Engine API */
export const API_BASE_URL = 'https://sweetsapi.savasuite.co.uk';

/** Optional local override when developing against localhost */
export const API_BASE_URL_DEV =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://localhost:4000';

/** Set true only when debugging against a local Nest server */
export const USE_LOCAL_API = false;

export function resolveApiBaseUrl(): string {
  if (__DEV__ && USE_LOCAL_API) {
    return API_BASE_URL_DEV;
  }
  return API_BASE_URL;
}

export type RestaurantBranding = {
  id: string;
  slug: string;
  name: string;
  appDisplayName: string;
  tagline?: string | null;
  primaryColor: string;
  logoUrl?: string | null;
  welcomeDiscountPercent: number;
  foodOnlyExcludesDrinks: boolean;
};
