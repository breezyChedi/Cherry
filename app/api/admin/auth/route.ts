import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, getSessionCookie, COOKIE_NAME } from '@/app/lib/admin/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password, action } = await req.json();

    if (action === 'logout') {
      console.log(`[API /admin/auth] Logout request`);
      const res = NextResponse.json({ success: true });
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    console.log(`[API /admin/auth] Login attempt user="${username}"`);

    if (!validateCredentials(username, password)) {
      console.log(`[API /admin/auth] Login REJECTED`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log(`[API /admin/auth] Login OK — setting session cookie`);
    const cookie = getSessionCookie();
    const res = NextResponse.json({ success: true });
    res.cookies.set(cookie);
    return res;
  } catch {
    console.error(`[API /admin/auth] Invalid request body`);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
