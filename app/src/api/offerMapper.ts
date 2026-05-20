import type { MemberProfile, Voucher } from './growthApi';
import { LOYALTY_VISIT_SLOTS } from './loyaltyProgress';

export type OfferCard = {
  id: string;
  discount: string;
  type: string;
  title: string;
  desc: string;
  valid: string;
  timeLeft?: string;
  loyaltyFooter?: string;
  validIsLifetime?: boolean;
  color: string;
  icon: string;
  code: string;
  qrToken: string;
  isLoyalty?: boolean;
  status: 'active' | 'used' | 'expired';
  /** Visit numbers 2–6 for loyalty dot row */
  loyaltyDots?: { num: number; filled: boolean }[];
};

const VOUCHER_META: Record<
  string,
  { type: string; desc: string; color: string; icon: string }
> = {
  WELCOME: {
    type: 'WELCOME REWARD',
    desc: 'Enjoy on your food bill. Dine-in or Takeaway. Drinks excluded.',
    color: '#C62828',
    icon: 'gift-outline',
  },
  RETURN: {
    type: 'RETURN REWARD',
    desc: 'Use this reward on your next visit.',
    color: '#EF6C00',
    icon: 'star-outline',
  },
  THIRD: {
    type: 'THIRD VISIT',
    desc: 'Thank you for coming back again.',
    color: '#F57C00',
    icon: 'food',
  },
  LOYALTY: {
    type: 'LOYALTY REWARD',
    desc: '15% off on each loyalty visit.',
    color: '#F9A825',
    icon: 'chef-hat',
  },
  GOLD: {
    type: 'GOLD MEMBER',
    desc: '10% off every visit for life of membership.',
    color: '#2E7D32',
    icon: 'crown-outline',
  },
};

function daysLeft(validUntil: string): string {
  const diff = new Date(validUntil).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return days === 1 ? '1 day left' : `${days} days left`;
}

function offerStatus(v: Voucher): OfferCard['status'] {
  if (v.status === 'REDEEMED') return 'used';
  if (v.status === 'EXPIRED') return 'expired';
  if (v.status === 'ACTIVE' && new Date(v.validUntil) < new Date()) {
    return 'expired';
  }
  return 'active';
}

function loyaltyDotRow(
  loyalty: MemberProfile['loyalty'],
): { num: number; filled: boolean }[] {
  const completed = LOYALTY_VISIT_SLOTS - loyalty.loyaltyVisitsRemaining;
  return [2, 3, 4, 5, 6].map((num, i) => ({
    num,
    filled: i < completed,
  }));
}

export function vouchersToOfferCards(
  vouchers: Voucher[],
  loyalty: MemberProfile['loyalty'],
): OfferCard[] {
  return vouchers.map(v => {
    const meta = VOUCHER_META[v.type] ?? VOUCHER_META.WELCOME;
    const isGold = v.type === 'GOLD' || loyalty.isGoldMember;
    const isLoyalty = v.type === 'LOYALTY';
    const status = offerStatus(v);

    let valid: string;
    if (isGold && status === 'active') {
      valid = 'Valid for life';
    } else if (status === 'used' && v.redeemedAt) {
      valid = `Redeemed ${new Date(v.redeemedAt).toLocaleDateString()}`;
    } else if (status === 'expired') {
      valid = `Expired ${new Date(v.validUntil).toLocaleDateString()}`;
    } else {
      valid = `Valid till ${new Date(v.validUntil).toLocaleDateString()}`;
    }

    return {
      id: v.id,
      discount: `${v.percentOff}%`,
      type: meta.type,
      title: `${v.percentOff}% OFF on Food Bill`,
      desc: meta.desc,
      valid,
      timeLeft:
        status === 'active' && !isGold ? daysLeft(v.validUntil) : undefined,
      loyaltyFooter:
        isLoyalty && status === 'active'
          ? `${loyalty.loyaltyVisitsRemaining} visits remaining • Valid 90 days`
          : undefined,
      validIsLifetime: isGold && status === 'active',
      color: meta.color,
      icon: meta.icon,
      code: v.qrToken.slice(0, 12).toUpperCase(),
      qrToken: v.qrToken,
      isLoyalty: isLoyalty && status === 'active',
      loyaltyDots:
        isLoyalty && status === 'active' ? loyaltyDotRow(loyalty) : undefined,
      status,
    };
  });
}

export function loyaltyStageLabel(loyalty: MemberProfile['loyalty']): string {
  if (loyalty.isGoldMember) return 'Gold Member';
  return loyalty.stageLabel;
}

/** Home screen reward strip — active vouchers only, newest first. */
export function activeVouchersForHome(
  vouchers: Voucher[],
  loyalty: MemberProfile['loyalty'],
  limit = 3,
): OfferCard[] {
  return vouchersToOfferCards(
    vouchers.filter(v => offerStatus(v) === 'active'),
    loyalty,
  ).slice(0, limit);
}
