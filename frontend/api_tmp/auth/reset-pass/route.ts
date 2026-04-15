/**
 * Auth API: Reset Password
 * Validates reset token and updates password
 * @file app/api/auth/reset-password/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validatePassword,
  hashPassword,
  getClientIP,
} from '@/lib/auth/utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
  errors?: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientIP = getClientIP(request.headers);
    const body: ResetPasswordRequest = await request.json();
    const { token, password, confirmPassword } = body;

    console.log('[Auth/ResetPassword] Processing request');

    // ========== Validation ==========
    const errors: string[] = [];

    if (!token) {
      errors.push('Reset token is required');
    }

    if (!password || !confirmPassword) {
      errors.push('Password is required');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        errors.push(...passwordValidation.errors);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors,
        },
        { status: 400 }
      );
    }

    // ========== Find Reset Token ==========
    const { data: resetRequest, error: tokenError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('reset_token', token)
      .single();

    if (tokenError || !resetRequest) {
      console.warn('[Auth/ResetPassword] Token not found');
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired reset token',
        },
        { status: 400 }
      );
    }

    // ========== Check Token Expiration ==========
    const expiresAt = new Date(resetRequest.expires_at);
    if (expiresAt < new Date()) {
      console.warn('[Auth/ResetPassword] Token expired');
      return NextResponse.json(
        {
          success: false,
          message: 'Reset token has expired',
        },
        { status: 400 }
      );
    }

    // ========== Check if Already Used ==========
    if (resetRequest.used) {
      console.warn('[Auth/ResetPassword] Token already used');
      return NextResponse.json(
        {
          success: false,
          message: 'This reset link has already been used',
        },
        { status: 400 }
      );
    }

    // ========== Hash New Password ==========
    const newPasswordHash = hashPassword(password);

    // ========== Update User Password ==========
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq('id', resetRequest.user_id);

    if (userUpdateError) {
      console.error('[Auth/ResetPassword] User update error:', userUpdateError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to reset password',
        },
        { status: 500 }
      );
    }

    // ========== Mark Reset Token as Used ==========
    await supabase
      .from('password_resets')
      .update({
        used: true,
        used_at: new Date().toISOString(),
      })
      .eq('id', resetRequest.id);

    console.log('[Auth/ResetPassword] Password reset successfully:', resetRequest.user_id);

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully! You can now log in with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Auth/ResetPassword] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
