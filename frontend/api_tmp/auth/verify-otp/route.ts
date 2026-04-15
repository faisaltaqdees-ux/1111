/**
 * ============================================================================
 * VERIFY OTP - API ROUTE
 * ============================================================================
 * Verifies 6-digit OTP code sent to user email
 * @file app/api/auth/verify-otp/route.ts
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function generateJWT(userId: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    })
  ).toString('base64');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${header}.${payload}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid email or code' }, { status: 400 });
    }

    // Get OTP from database
    const { data: otpData, error: otpError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpData) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
    }

    // Check expiration
    if (new Date(otpData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      return NextResponse.json({ error: 'Too many attempts. Request a new OTP.' }, { status: 400 });
    }

    // Verify code
    if (otpData.code !== code) {
      const { error: updateError } = await supabase
        .from('otp_verifications')
        .update({ attempts: otpData.attempts + 1 })
        .eq('id', otpData.id);

      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    // Mark OTP as used
    const { error: useError } = await supabase
      .from('otp_verifications')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('id', otpData.id);

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('User lookup error:', userError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let userId = userData?.id;

    // If user doesn't exist, create them
    if (!userData) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          is_email_verified: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('User create error:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      userId = newUser?.id;
    } else {
      // Mark email as verified
      const { error: verifyError } = await supabase
        .from('users')
        .update({ is_email_verified: true })
        .eq('id', userId);
    }

    // Generate JWT token
    const token = generateJWT(userId, email.toLowerCase());

    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      token,
      userId,
      email: email.toLowerCase(),
      fullName: userData?.full_name || null,
    });

    // Set auth cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('[VerifyOTP] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
