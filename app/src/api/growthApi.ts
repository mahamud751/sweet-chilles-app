import type { RestaurantBranding } from '../config/restaurant';
import { RESTAURANT_SLUG } from '../config/restaurant';
import { apiFetch, apiUpload } from './client';

export type Voucher = {
  id: string;
  type: string;
  percentOff: number;
  qrToken: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | string;
  validUntil: string;
  redeemedAt?: string | null;
};

export type MemberProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  birthday?: string | null;
  referralCode?: string;
  loyalty: {
    stage: string;
    stageLabel: string;
    isGoldMember: boolean;
    loyaltyVisitsRemaining: number;
  };
  restaurant: {
    slug: string;
    name: string;
    appDisplayName: string;
    primaryColor: string;
  };
  activeVouchers: Voucher[];
  notifications: { id: string; title: string; body: string; read: boolean; sentAt: string }[];
};

export type StaffProfile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  role: 'SAVASAACHI_ADMIN' | 'RESTAURANT_OWNER' | 'RESTAURANT_STAFF' | string;
  restaurantId: string | null;
  restaurant: {
    slug: string;
    name: string;
    appDisplayName: string;
    primaryColor: string;
  } | null;
};

export type MemberAuthResponse = { token: string; member: MemberProfile };
export type StaffAuthResponse = { token: string; user: StaffProfile };

export type SessionResponse =
  | { accountType: 'member'; member: MemberProfile }
  | { accountType: 'staff'; staff: StaffProfile };

export type AppSession =
  | { accountType: 'member'; token: string; member: MemberProfile }
  | { accountType: 'staff'; token: string; staff: StaffProfile };

export type AuthResponse = MemberAuthResponse;

export type UnifiedAuthResponse = {
  accountType: 'member' | 'staff';
  token: string;
  member?: MemberProfile;
  staff?: StaffProfile;
};

export function fetchBranding(slug = RESTAURANT_SLUG) {
  return apiFetch<RestaurantBranding>(`/restaurants/${slug}/branding`);
}

/** Single login — backend detects member vs staff/admin automatically. */
export function login(email: string, password: string, slug = RESTAURANT_SLUG) {
  return apiFetch<UnifiedAuthResponse>(`/auth/restaurants/${slug}/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function loginMember(email: string, password: string, slug = RESTAURANT_SLUG) {
  return apiFetch<MemberAuthResponse>(`/auth/restaurants/${slug}/members/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function loginStaff(email: string, password: string) {
  return apiFetch<StaffAuthResponse>('/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function unifiedAuthToSession(res: UnifiedAuthResponse): AppSession {
  if (res.accountType === 'member' && res.member) {
    return { accountType: 'member', token: res.token, member: res.member };
  }
  if (res.accountType === 'staff' && res.staff) {
    return { accountType: 'staff', token: res.token, staff: res.staff };
  }
  throw new Error('Invalid login response');
}

export function registerMember(
  data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    birthday?: string;
  },
  slug = RESTAURANT_SLUG,
) {
  return apiFetch<AuthResponse>(`/auth/restaurants/${slug}/members/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchSession(token: string) {
  return apiFetch<SessionResponse>('/auth/me', { token });
}

/** @deprecated Use fetchSession */
export function fetchMe(token: string) {
  return fetchSession(token).then(res => {
    if (res.accountType !== 'member') {
      throw new Error('Not a member session');
    }
    return res.member;
  });
}

export function updateMemberProfile(
  token: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    birthday?: string;
  },
) {
  return apiFetch<MemberProfile>('/auth/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export function changeMemberPassword(
  token: string,
  currentPassword: string,
  newPassword: string,
) {
  return apiFetch<{ success: boolean }>('/auth/me/password', {
    method: 'PATCH',
    token,
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function uploadMemberAvatar(
  token: string,
  file: { uri: string; name: string; type: string },
) {
  const formData = new FormData();
  formData.append('avatar', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
  return apiUpload<MemberProfile>('/auth/me/avatar', formData, token);
}

export function fetchWallet(token: string) {
  return apiFetch<Voucher[]>('/vouchers/wallet', { token });
}

export function fetchAllVouchers(token: string) {
  return apiFetch<Voucher[]>('/vouchers/all', { token });
}

export function fetchActiveCompetition(slug = RESTAURANT_SLUG) {
  return apiFetch<{
    id: string;
    title: string;
    prizeDescription: string;
    status: string;
  } | null>(`/competitions/restaurants/${slug}/active`);
}

export type CampaignTemplate = {
  id: string;
  type: string;
  title: string;
  bodyTemplate: string;
  isEnabled: boolean;
};

export function fetchCampaigns(slug = RESTAURANT_SLUG) {
  return apiFetch<CampaignTemplate[]>(`/restaurants/${slug}/campaigns`);
}

export function createBooking(
  token: string,
  data: { partySize: number; bookedFor: string },
) {
  return apiFetch<{ id: string; status: string; partySize: number; bookedFor: string }>(
    '/auth/me/bookings',
    {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    },
  );
}

export function lookupVoucher(qrToken: string) {
  return apiFetch<{
    id: string;
    percentOff: number;
    status: string;
    type: string;
    member?: { name: string; email?: string; loyaltyStage?: string };
  }>(`/vouchers/lookup/${encodeURIComponent(qrToken)}`);
}

export function redeemVoucher(
  token: string,
  qrToken: string,
  billAmount?: number,
) {
  return apiFetch<MemberProfile>('/vouchers/redeem', {
    method: 'POST',
    token,
    body: JSON.stringify({ qrToken, billAmount }),
  });
}

export function updateStaffProfile(
  token: string,
  data: { displayName?: string; email?: string },
) {
  return apiFetch<StaffProfile>('/auth/staff/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export function changeStaffPassword(
  token: string,
  currentPassword: string,
  newPassword: string,
) {
  return apiFetch<{ success: boolean }>('/auth/staff/me/password', {
    method: 'PATCH',
    token,
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function uploadStaffAvatar(
  token: string,
  file: { uri: string; name: string; type: string },
) {
  const formData = new FormData();
  formData.append('avatar', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
  return apiUpload<StaffProfile>('/auth/staff/me/avatar', formData, token);
}

export type DashboardSummary = {
  members: number;
  activeVouchers: number;
  redeemedVouchers: number;
  campaigns: number;
};

export type DashboardMember = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  loyaltyStage: string;
  isGoldMember: boolean;
  joinedAt: string;
  voucherCount: number;
};

export type DashboardVoucher = {
  id: string;
  type: string;
  percentOff: number;
  status: string;
  validUntil: string;
  redeemedAt: string | null;
  qrToken: string;
  memberName: string;
  memberEmail: string;
};

function dashboardQuery(slug = RESTAURANT_SLUG) {
  return `?slug=${encodeURIComponent(slug)}`;
}

export function fetchDashboardSummary(token: string, slug = RESTAURANT_SLUG) {
  return apiFetch<DashboardSummary>(`/dashboard/summary${dashboardQuery(slug)}`, {
    token,
  });
}

export function fetchDashboardMembers(token: string, slug = RESTAURANT_SLUG) {
  return apiFetch<DashboardMember[]>(`/dashboard/members${dashboardQuery(slug)}`, {
    token,
  });
}

export type MemberSearchHit = { id: string; name: string; email: string };

export function searchDashboardMembers(
  token: string,
  q: string,
  slug = RESTAURANT_SLUG,
) {
  const base = dashboardQuery(slug);
  const sep = base.includes('?') ? '&' : '?';
  return apiFetch<MemberSearchHit[]>(
    `/dashboard/members${base}${sep}q=${encodeURIComponent(q)}`,
    { token },
  );
}

export function fetchDashboardVouchers(token: string, slug = RESTAURANT_SLUG) {
  return apiFetch<DashboardVoucher[]>(
    `/dashboard/vouchers${dashboardQuery(slug)}`,
    { token },
  );
}

export function fetchDashboardCampaigns(token: string, slug = RESTAURANT_SLUG) {
  return apiFetch<CampaignTemplate[]>(
    `/dashboard/campaigns${dashboardQuery(slug)}`,
    { token },
  );
}

export function createDashboardMember(
  token: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    issueWelcomeVoucher?: boolean;
  },
  slug = RESTAURANT_SLUG,
) {
  return apiFetch<DashboardMember>(`/dashboard/members${dashboardQuery(slug)}`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export function updateDashboardMember(
  token: string,
  id: string,
  data: { name?: string; email?: string; phone?: string },
  slug = RESTAURANT_SLUG,
) {
  return apiFetch<DashboardMember>(`/dashboard/members/${id}${dashboardQuery(slug)}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export function deleteDashboardMember(
  token: string,
  id: string,
  slug = RESTAURANT_SLUG,
) {
  return apiFetch<{ success: boolean }>(
    `/dashboard/members/${id}${dashboardQuery(slug)}`,
    { method: 'DELETE', token },
  );
}

export function createDashboardVoucher(
  token: string,
  data: {
    memberEmail: string;
    type: string;
    percentOff: number;
    validUntil?: string;
    status?: string;
  },
  slug = RESTAURANT_SLUG,
) {
  return apiFetch<DashboardVoucher>(`/dashboard/vouchers${dashboardQuery(slug)}`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export function updateDashboardVoucher(
  token: string,
  id: string,
  data: {
    percentOff?: number;
    status?: string;
    validUntil?: string;
  },
  slug = RESTAURANT_SLUG,
) {
  return apiFetch<DashboardVoucher>(`/dashboard/vouchers/${id}${dashboardQuery(slug)}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export function deleteDashboardVoucher(
  token: string,
  id: string,
  slug = RESTAURANT_SLUG,
) {
  return apiFetch<{ success: boolean }>(
    `/dashboard/vouchers/${id}${dashboardQuery(slug)}`,
    { method: 'DELETE', token },
  );
}

export function createDashboardCampaign(
  token: string,
  data: {
    type: string;
    title: string;
    bodyTemplate: string;
    isEnabled?: boolean;
  },
  slug = RESTAURANT_SLUG,
) {
  return apiFetch<CampaignTemplate>(`/dashboard/campaigns${dashboardQuery(slug)}`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export function updateDashboardCampaign(
  token: string,
  id: string,
  data: { title?: string; bodyTemplate?: string; isEnabled?: boolean },
  slug = RESTAURANT_SLUG,
) {
  return apiFetch<CampaignTemplate>(
    `/dashboard/campaigns/${id}${dashboardQuery(slug)}`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    },
  );
}

export function deleteDashboardCampaign(
  token: string,
  id: string,
  slug = RESTAURANT_SLUG,
) {
  return apiFetch<{ success: boolean }>(
    `/dashboard/campaigns/${id}${dashboardQuery(slug)}`,
    { method: 'DELETE', token },
  );
}
