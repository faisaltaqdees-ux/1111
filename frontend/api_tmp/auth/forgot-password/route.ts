/**
 * Auth API: Forgot Password - Request Reset
 * Generates password reset token and sends email
 * @file app/api/auth/forgot-password\route.ts
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validateEmail,
  generateToken,
  checkRateLimit,
  getClientIP,
} from '@/lib/auth/utils';
import { sendPasswordResetEmail } from '@/lib/email/service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientIP = getClientIP(request.headers);
    const rateLimitKey = `forgot-password:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 3600); // 5 requests per hour

    if (!rateLimit.allowed) {
      console.warn('[Auth] Forgot password rate limit exceeded:', clientIP);
      return NextResponse.json(
        {
          success: false,
          message: 'Too many password reset requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    const body: ForgotPasswordRequest = await request.json();
    const { email } = body;

    console.log('[Auth/ForgotPassword] Processing request:', email);

    // ========== Validation ==========
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email address',
        },
        { status: 400 }
      );
    }

    // ========== Find User ==========
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', email.toLowerCase())
      .single();

    // For security, always return success even if email not found
    if (!user) {
      console.log('[Auth/ForgotPassword] User not found:', email);
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.',
        },
        { status: 200 }
      );
    }

    // ========== Generate Reset Token ==========
    const resetToken = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const { error: insertError } = await supabase
      .from('password_resets')
      .insert({
        user_id: user.id,
        email: user.email,
        reset_token: resetToken,
        used: false,
        ip_address: clientIP,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('[Auth/ForgotPassword] Insert error:', insertError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to generate reset token',
        },
        { status: 500 }
      );
    }

    // ========== Send Reset Email ==========
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.full_name,
      resetToken
    );

    if (!emailResult.success) {
      console.error('[Auth/ForgotPassword] Email send failed:', emailResult.error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send reset email',
        },
        { status: 500 }
      );
    }

    console.log('[Auth/ForgotPassword] Reset email sent successfully:', user.email);

    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Auth/ForgotPassword] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
