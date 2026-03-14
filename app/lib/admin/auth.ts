import { cookies } from 'next/headers';

const ADMIN_USERNAME = 'Admin';
const ADMIN_PASSWORD = 'Popyourcherry';
const COOKIE_NAME = 'cherry_admin_session';
const SESSION_TOKEN = 'cherry-admin-authenticated-2026';

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return session?.value === SESSION_TOKEN;
}

export function getSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: SESSION_TOKEN,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export { COOKIE_NAME };
