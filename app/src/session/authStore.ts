import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSession, MemberProfile, StaffProfile } from '../api/growthApi';

const TOKEN_KEY = '@savasaachi/authToken';
const ACCOUNT_TYPE_KEY = '@savasaachi/accountType';
const MEMBER_KEY = '@savasaachi/member';
const STAFF_KEY = '@savasaachi/staff';

export type AccountType = 'member' | 'staff';

let memoryToken: string | null = null;
let memoryAccountType: AccountType | null = null;
let memoryMember: MemberProfile | null = null;
let memoryStaff: StaffProfile | null = null;

export async function loadSession(): Promise<{
  token: string | null;
  accountType: AccountType | null;
  member: MemberProfile | null;
  staff: StaffProfile | null;
}> {
  const [token, accountType, memberJson, staffJson] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(ACCOUNT_TYPE_KEY),
    AsyncStorage.getItem(MEMBER_KEY),
    AsyncStorage.getItem(STAFF_KEY),
  ]);
  memoryToken = token;
  memoryAccountType =
    accountType === 'member' || accountType === 'staff' ? accountType : null;
  memoryMember = memberJson ? (JSON.parse(memberJson) as MemberProfile) : null;
  memoryStaff = staffJson ? (JSON.parse(staffJson) as StaffProfile) : null;
  return {
    token: memoryToken,
    accountType: memoryAccountType,
    member: memoryMember,
    staff: memoryStaff,
  };
}

export async function saveSession(session: AppSession) {
  memoryToken = session.token;
  memoryAccountType = session.accountType;
  if (session.accountType === 'member') {
    memoryMember = session.member;
    memoryStaff = null;
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, session.token),
      AsyncStorage.setItem(ACCOUNT_TYPE_KEY, 'member'),
      AsyncStorage.setItem(MEMBER_KEY, JSON.stringify(session.member)),
      AsyncStorage.removeItem(STAFF_KEY),
    ]);
    return;
  }
  memoryStaff = session.staff;
  memoryMember = null;
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, session.token),
    AsyncStorage.setItem(ACCOUNT_TYPE_KEY, 'staff'),
    AsyncStorage.setItem(STAFF_KEY, JSON.stringify(session.staff)),
    AsyncStorage.removeItem(MEMBER_KEY),
  ]);
}

export async function clearSession() {
  memoryToken = null;
  memoryAccountType = null;
  memoryMember = null;
  memoryStaff = null;
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(ACCOUNT_TYPE_KEY),
    AsyncStorage.removeItem(MEMBER_KEY),
    AsyncStorage.removeItem(STAFF_KEY),
  ]);
}

export function getToken() {
  return memoryToken;
}

export function getAccountType() {
  return memoryAccountType;
}

export function getMember() {
  return memoryMember;
}

export function getStaff() {
  return memoryStaff;
}
