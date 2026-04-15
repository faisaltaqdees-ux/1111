/**
 * Auth API: Login Endpoint
 * Handles user authentication, 2FA, login history tracking
 * @file app/api/auth/user-login/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validateEmail,
  verifyPassword,
  parseUserAgent,
  getClientIP,
  checkRateLimit,
  createAuthToken,
  generateOTP,
} from '@/lib/auth/utils';
import { send2FACodeEmail } from '@/lib/email/service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: string;
  requires2FA?: boolean;
  twoFASessionId?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientIP = getClientIP(request.headers);
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const { browser, os, device } = parseUserAgent(userAgent);

    const rateLimitKey = `login:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 900); // 5 attempts per 15 min

    if (!rateLimit.allowed) {
      console.warn('[Auth] Login rate limit exceeded:', clientIP);
      return NextResponse.json(
        {
          success: false,
          message: 'Too many login attempts. Please try again later.',
        },
        { status: 429 }
      );
    }

    const body: LoginRequest = await request.json();
    const { email, password } = body;

    console.log('[Auth/Login] Processing request:', {
      email,
      ipAddress: clientIP,
      device: `${browser} on ${os}`,
    });

    // ========== Validation ==========
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // ========== Find User ==========
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      console.warn('[Auth/Login] User not found:', email);
      await recordLoginAttempt(null, clientIP, userAgent, 'password', false, 'User not found');
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // ========== Check Account Status ==========
    if (user.account_status !== 'active') {
      console.warn('[Auth/Login] Account not active:', { userId: user.id, status: user.account_status });
      return NextResponse.json(
        {
          success: false,
          message: `Account is ${user.account_status}`,
        },
        { status: 403 }
      );
    }

    // ========== Check Account Lock ==========
    if (user.locked_until) {
      const lockedUntil = new Date(user.locked_until);
      if (lockedUntil > new Date()) {
        console.warn('[Auth/Login] Account temporarily locked:', user.id);
        await recordLoginAttempt(
          user.id,
          clientIP,
          userAgent,
          'password',
          false,
          'Account locked'
        );
        return NextResponse.json(
          {
            success: false,
            message: `Account temporarily locked until ${lockedUntil.toISOString()}`,
          },
          { status: 423 }
        );
      }
    }

    // ========== Email Verification Check ==========
    if (!user.email_verified) {
      console.warn('[Auth/Login] Email not verified:', user.id);
      return NextResponse.json(
        {
          success: false,
          message: 'Please verify your email address first',
        },
        { status: 403 }
      );
    }

    // ========== Verify Password ==========
    const passwordValid = verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
      let lockUntil = null;

      // Lock account after 5 failed attempts
      if (newFailedAttempts >= 5) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        console.warn('[Auth/Login] Account locked due to failed attempts:', user.id);
      }

      await supabase
        .from('users')
        .update({
          failed_login_attempts: newFailedAttempts,
          locked_until: lockUntil?.toISOString() || null,
        })
        .eq('id', user.id);

      console.warn('[Auth/Login] Invalid password:', email);
      await recordLoginAttempt(
        user.id,
        clientIP,
        userAgent,
        'password',
        false,
        'Invalid password'
      );

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // ========== Check if 2FA is enabled ==========
    if (user.two_fa_enabled) {
      console.log('[Auth/Login] 2FA required for user:', user.id);

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create 2FA session in users table (need to add this field)
      // For now, we'll store it in a temporary location or return it
      console.log('[Auth/Login] 2FA OTP generated:', otp);

      // Send OTP email
      await send2FACodeEmail(user.email, user.full_name, otp);

      console.log('[Auth/Login] 2FA OTP sent to:', user.email);

      return NextResponse.json(
        {
          success: true,
          requires2FA: true,
          userId: user.id,
          message: 'Enter the code sent to your email',
        },
        { status: 200 }
      );
    }

    // ========== Generate Auth Token ==========
    const authToken = createAuthToken(user.id, 86400 * 7); // 7 days

    // ========== Update Login Info ==========
    await supabase
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
        last_login_ip: clientIP,
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq('id', user.id);

    // ========== Record Login Attempt ==========
    await recordLoginAttempt(user.id, clientIP, userAgent, 'password', true, null);

    console.log('[Auth/Login] Login successful:', {
      userId: user.id,
      email,
      device: `${browser} on ${os}`,
    });

    const response = NextResponse.json(
      {
        success: true,
        token: authToken,
        userId: user.id,
        message: 'Login successful',
      },
      { status: 200 }
    );

    // Set auth cookie
    response.cookies.set('auth_token', authToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 86400 * 7,
    });

    return response;
  } catch (error) {
    console.error('[Auth/Login] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to record login attempt in history
 */
async function recordLoginAttempt(
  userId: string | null,
  ipAddress: string,
  userAgent: string,
  loginType: 'password' | '2fa' | 'recovery_code',
  success: boolean,
  failureReason: string | null
) {
  if (!userId) return;

  try {
    const { browser, os, device } = parseUserAgent(userAgent);
    const deviceInfo = `${browser} on ${os} (${device})`;

    await supabase
      .from('login_history')
      .insert({
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_info: deviceInfo,
        login_type: loginType,
        success,
        failure_reason: failureReason,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('[Auth] Failed to record login attempt:', error);
  }
}
