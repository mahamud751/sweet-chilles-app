/** Demo login — only this email + password may enter the app. */
export const LOGIN_EMAIL = 'pino@gmail.com';
export const LOGIN_PASSWORD = '123456';

export type SessionUser = {
  displayName: string;
  email: string;
  phone: string;
};

export const SIGNED_IN_USER: SessionUser = {
  displayName: 'pino',
  email: 'pino@gmail.com',
  phone: '01789999751',
};

export function isValidLogin(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === LOGIN_EMAIL &&
    password === LOGIN_PASSWORD
  );
}
