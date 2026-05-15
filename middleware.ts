import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref');
  if (!ref || ref.length > 80) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  res.cookies.set('referralCode', ref, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
  });
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
