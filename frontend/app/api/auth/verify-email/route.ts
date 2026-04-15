/**
 * Email Verification API Route
 * Handles email verification via token or OTP
 * @file app/api/auth/verify-email/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Verify email with token or OTP
 * POST /api/auth/verify-email
 * Body: { token?: string, otp?: string, method: 'token' | 'otp' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, otp, method } = body;

    // Validate input
    if (!method || !['token', 'otp'].includes(method)) {
      return NextResponse.json(
        { message: 'Invalid verification method' },
        { status: 400 }
      );
    }

    if (method === 'token' && !token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      );
    }

    if (method === 'otp' && !otp) {
      return NextResponse.json(
        { message: 'OTP code is required' },
        { status: 400 }
      );
    }

    // Get user from auth context (via JWT token in cookies)
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // In production, you would:
    // 1. Verify JWT token to get user ID
    // 2. Query database for verification record
    // 3. Check token expiry and OTP validity
    // 4. Update user.isEmailVerified = true
    // 5. Delete verification record

    // For now, simulate verification
    let isValid = false;
    let userEmail = '';

    if (method === 'token') {
      // Simulate token verification (in production, check against DB)
      // Token format: base64(userId_timestamp_hash)
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const parts = decoded.split('_');
        
        if (parts.length === 3) {
          const userId = parts[0];
          const timestamp = parseInt(parts[1]);
          const hash = parts[2];

          // Check if token is not expired (24 hours)
          const isTokenExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
          if (isTokenExpired) {
            return NextResponse.json(
              { message: 'Verification link has expired. Please request a new one.' },
              { status: 400 }
            );
          }

          // In production, verify hash against DB
          // For simulation, accept any valid format token
          isValid = true;
          userEmail = `user_${userId}@example.com`; // In prod, get from DB
        }
      } catch (err) {
        return NextResponse.json(
          { message: 'Invalid verification link' },
          { status: 400 }
        );
      }
    } else if (method === 'otp') {
      // Simulate OTP verification
      // In production, check against DB cache (Redis recommended)
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        // Simulate: check if OTP exists in Redis/cache
        // For demo, accept OTP like "123456"
        if (otp === '123456' || otp === '000000') {
          isValid = true;
          userEmail = 'user@example.com'; // In prod, get from auth token
        }
      }

      if (!isValid) {
        return NextResponse.json(
          { message: 'Invalid or expired OTP code' },
          { status: 400 }
        );
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { message: 'Email verification failed' },
        { status: 400 }
      );
    }

    // Success - in production, update database
    // UPDATE users SET is_email_verified = true, email_verified_at = NOW() WHERE id = userId

    return NextResponse.json(
      {
        message: 'Email verified successfully',
        user: {
          email: userEmail,
          isEmailVerified: true,
          verifiedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'Email verification failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify-email
 * Check verification status
 */
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // In production, query DB for user's email status
    // For now, return sample data
    return NextResponse.json(
      {
        isEmailVerified: false,
        email: 'user@example.com',
        verificationSentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification status check error:', error);
    return NextResponse.json(
      { message: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}
