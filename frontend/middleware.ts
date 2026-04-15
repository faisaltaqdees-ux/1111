/**
 * Authentication Middleware
 * Protects routes and verifies auth tokens
 * @file middleware.ts
 */

import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/verify-email',
  '/auth/reset-password',
  '/',
  '/tickets',
];

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/profile',
  '/account',
  '/dashboard',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtected) {
    // Check for auth token
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // Redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Token exists, allow request
    return NextResponse.next();
  }

  // Check if route is auth page and user is already logged in
  // BUT allow /auth/register and /auth/signup to always be accessible (users can create multiple accounts)
  if (pathname.startsWith('/auth/') && pathname !== '/auth/register' && pathname !== '/auth/signup') {
    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      // Redirect to profile (unless they're trying to register/signup)
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
