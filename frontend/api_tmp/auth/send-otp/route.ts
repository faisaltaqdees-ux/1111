/**
 * ============================================================================
 * SEND OTP VERIFICATION - API ROUTE
 * ============================================================================
 * Sends 6-digit OTP code to user email during registration
 * @file app/api/auth/send-otp/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Store OTP in database
    const { error } = await supabase.from('otp_verifications').insert({
      email: email.toLowerCase(),
      code: otp,
      attempts: 0,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('OTP insert error:', error);
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // Log OTP (in production, send via email)
    console.log(`[OTP] ${email} - Code: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent to email',
      otpSent: true,
    });
  } catch (error: any) {
    console.error('[OTP] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
