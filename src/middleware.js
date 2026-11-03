// Protege las rutas del panel antes de que se rendericen:
// - /dashboard/*        requiere sesión iniciada
// - /dashboard/admin/*  requiere rol de administrador
// - /auth/*             redirige al panel si ya hay sesión
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AUTH_SECRET } from '@/lib/auth-secret';

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({ req, secret: AUTH_SECRET });

  if (pathname.startsWith('/auth')) {
    if (token) return NextResponse.redirect(new URL('/dashboard', req.url));
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/dashboard/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
