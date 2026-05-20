import { useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';

/** Shared brand colours + common style fragments for all screens */
export function useBrandStyles() {
  const ctx = useRestaurant();

  return useMemo(
    () => ({
      ...ctx,
      link: { color: ctx.primary },
      iconAccent: { color: ctx.primary },
      tabActiveBg: { backgroundColor: ctx.primary },
      tabActiveText: { color: '#FFF' },
      btnPrimary: { backgroundColor: ctx.primary },
      btnPrimaryText: { color: '#FFF' },
      btnOutline: {
        borderWidth: 1.5,
        borderColor: ctx.primary,
        backgroundColor: '#FFF',
      },
      btnOutlineText: { color: ctx.primary, fontWeight: '800' as const },
    }),
    [ctx],
  );
}
