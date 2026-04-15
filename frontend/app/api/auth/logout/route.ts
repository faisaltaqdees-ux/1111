/**
 * Logout API Route
 * Invalidates user session and clears tokens
 * @file app/api/auth/logout/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * User Logout
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
  try {
    // Get auth token to invalidate
    const authToken = request.cookies.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // In production:
    // 1. Add token to JWT blacklist (Redis with TTL)
    // 2. Delete session from database if using sessions
    // 3. Invalidate refresh tokens if applicable
    // 4. Log logout event for audit trail

    // Simulate token invalidation
    // const redis = getRedisClient();
    // const decoded = decodeJWT(authToken);
    // const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    // await redis.setex(`blacklist_${authToken}`, expiresIn, 'true');

    console.log('[AUDIT] User logged out');

    // Create response
    const response = NextResponse.json(
      {
        message: 'Logout successful',
      },
      { status: 200 }
    );

    // Clear auth cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Delete cookie
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/logout
 * Logout endpoint (for compatibility)
 */
export async function GET(request: NextRequest) {
  // Redirect to same POST handler
  return POST(request);
}
