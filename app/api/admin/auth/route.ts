import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, getSessionCookie, COOKIE_NAME } from '@/app/lib/admin/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password, action } = await req.json();

    if (action === 'logout') {
      const res = NextResponse.json({ success: true });
      res.cookies.delete(COOKIE_NAME);
      return res;
    }

    if (!validateCredentials(username, password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const cookie = getSessionCookie();
    const res = NextResponse.json({ success: true });
    res.cookies.set(cookie);
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
