// @ts-nocheck
/**
 * Auth API: Setup Two-Factor Authentication
 * Enables 2FA for user account with OTP codes
 * @file app/api/auth/setup-2fa\route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import {
  verifyAuthToken,
  generateRecoveryCodes,
} from '@/lib/auth/utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

interface Setup2FARequest {
  token: string;
}

interface Setup2FAResponse {
  success: boolean;
  message: string;
  secret?: string;
  qrCode?: string;
  recoveryCodes?: string[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: Setup2FARequest = await request.json();
    const { token } = body;

    console.log('[Auth/Setup2FA] Processing request');

    // ========== Verify Token ==========
    const { userId, valid } = verifyAuthToken(token);
    if (!valid || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired authentication token',
        },
        { status: 401 }
      );
    }

    // ========== Get User ==========
    const { data: user } = await supabase
      .from('users')
      .select('email, full_name, two_fa_enabled')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // ========== Check if 2FA Already Enabled ==========
    if (user.two_fa_enabled) {
      return NextResponse.json(
        {
          success: false,
          message: '2FA is already enabled for this account',
        },
        { status: 409 }
      );
    }

    // ========== Generate Secret ==========
    const secret = speakeasy.generateSecret({
      name: `PSL Pulse (${user.email})`,
      issuer: 'PSL Pulse',
      length: 32,
    });

    // ========== Generate QR Code ==========
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');
    } catch (error) {
      console.error('[Auth/Setup2FA] QR code generation error:', error);
    }

    // ========== Generate Recovery Codes ==========
    const recoveryCodes = generateRecoveryCodes(10);

    // Store temporary secret (not enabled yet)
    // In production, store in Redis with short expiration
    console.log('[Auth/Setup2FA] Secret generated, awaiting confirmation');

    return NextResponse.json(
      {
        success: true,
        message: 'Scan this QR code with your authenticator app',
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        recoveryCodes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Auth/Setup2FA] Error:', error);
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
 * Verify and Enable 2FA
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { token, secret, verificationCode, recoveryCodes } = body;

    console.log('[Auth/Setup2FA] Verifying 2FA setup');

    // ========== Verify Token ==========
    const { userId, valid } = verifyAuthToken(token);
    if (!valid || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired authentication token',
        },
        { status: 401 }
      );
    }

    // ========== Verify Code ==========
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: verificationCode,
      window: 2,
    });

    if (!verified) {
      console.warn('[Auth/Setup2FA] Invalid verification code');
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid verification code',
        },
        { status: 400 }
      );
    }

    // ========== Update User ==========
    const { error: userError } = await supabase
      .from('users')
      .update({
        two_fa_enabled: true,
        two_fa_secret: secret,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (userError) {
      console.error('[Auth/Setup2FA] User update error:', userError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to enable 2FA',
        },
        { status: 500 }
      );
    }

    // ========== Store Recovery Codes ==========
    if (recoveryCodes && recoveryCodes.length > 0) {
      const codeRows = recoveryCodes.map((code: string) => ({
        user_id: userId,
        code,
        used: false,
        created_at: new Date().toISOString(),
      }));

      await supabase
        .from('two_fa_recovery_codes')
        .insert(codeRows);
    }

    console.log('[Auth/Setup2FA] 2FA enabled successfully:', userId);

    return NextResponse.json(
      {
        success: true,
        message: '2FA has been enabled. Keep your recovery codes safe!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Auth/Setup2FA] Verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
