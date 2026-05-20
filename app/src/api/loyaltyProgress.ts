import type { MemberProfile } from './growthApi';

export const JOURNEY_TOTAL = 10;
export const LOYALTY_VISIT_SLOTS = 5;

/** Filled segments (0–10) for the welcome → gold journey bar. */
export function loyaltyProgressFilled(
  loyalty: MemberProfile['loyalty'] | undefined,
): number {
  if (!loyalty) return 0;
  if (loyalty.isGoldMember) return JOURNEY_TOTAL;

  switch (loyalty.stage) {
    case 'REGISTERED':
      return 1;
    case 'WELCOME_REDEEMED':
      return 3;
    case 'RETURN_REDEEMED':
      return 5;
    case 'THIRD_REDEEMED':
      return 6;
    case 'LOYALTY_ACTIVE': {
      const done = LOYALTY_VISIT_SLOTS - loyalty.loyaltyVisitsRemaining;
      return Math.min(JOURNEY_TOTAL - 1, 6 + Math.max(0, done));
    }
    case 'GOLD':
      return JOURNEY_TOTAL;
    default:
      return 1;
  }
}

/** Display points derived from journey progress (25 pts per step). */
export function loyaltyDisplayPoints(
  loyalty: MemberProfile['loyalty'] | undefined,
): number {
  return loyaltyProgressFilled(loyalty) * 25;
}
