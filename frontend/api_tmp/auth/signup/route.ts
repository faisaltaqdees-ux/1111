/**
 * Auth API: Signup Endpoint
 * Handles user registration, email verification token generation
 * @file app/api/auth/signup/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validateEmail,
  validatePassword,
  validateFullName,
  hashPassword,
  generateToken,
  checkRateLimit,
  getClientIP,
} from '@/lib/auth/utils';
import { sendVerificationEmail } from '@/lib/email/service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
  error?: string;
  errors?: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientIP = getClientIP(request.headers);
    const rateLimitKey = `signup:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 10, 3600); // 10 signups per hour

    if (!rateLimit.allowed) {
      console.warn('[Auth] Rate limit exceeded for signup:', clientIP);
      return NextResponse.json(
        {
          success: false,
          message: 'Too many signup attempts. Please try again later.',
        },
        { status: 429 }
      );
    }

    const body: SignupRequest = await request.json();
    const { email, password, confirmPassword, fullName } = body;

    console.log('[Auth/Signup] Processing request:', {
      email,
      ipAddress: clientIP,
      timestamp: new Date().toISOString(),
    });

    // ========== Validation ==========
    const errors: string[] = [];

    if (!email || !validateEmail(email)) {
      errors.push('Invalid email address');
    }

    if (!fullName || !validateFullName(fullName)) {
      errors.push('Full name must be 2-255 characters and contain only letters, spaces, hyphens, or apostrophes');
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
      console.log('[Auth/Signup] Validation errors:', errors);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors,
        },
        { status: 400 }
      );
    }

    // ========== Check if email already exists ==========
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      console.warn('[Auth/Signup] Email already exists:', email);
      return NextResponse.json(
        {
          success: false,
          message: 'Email already registered',
        },
        { status: 409 }
      );
    }

    // ========== Hash Password ==========
    const passwordHash = hashPassword(password);

    // ========== Create User ==========
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
        email_verified: false,
        account_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (userError || !newUser) {
      console.error('[Auth/Signup] User creation failed:', userError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create account',
        },
        { status: 500 }
      );
    }

    console.log('[Auth/Signup] User created:', newUser.id);

    // ========== Generate Email Verification Token ==========
    const verificationToken = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const { error: tokenError } = await supabase
      .from('email_verifications')
      .insert({
        user_id: newUser.id,
        email: email.toLowerCase(),
        token: verificationToken,
        verified: false,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      });

    if (tokenError) {
      console.error('[Auth/Signup] Token creation failed:', tokenError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to generate verification token',
        },
        { status: 500 }
      );
    }

    // ========== Send Verification Email ==========
    const emailResult = await sendVerificationEmail(
      email,
      fullName,
      verificationToken
    );

    if (!emailResult.success) {
      console.error('[Auth/Signup] Email send failed:', emailResult.error);
      // Still return success - user can request email resend
      return NextResponse.json(
        {
          success: true,
          userId: newUser.id,
          message:
            'Account created! Please check your email to verify your address. (Email may take a few minutes)',
        },
        { status: 201 }
      );
    }

    console.log('[Auth/Signup] Account created successfully:', {
      userId: newUser.id,
      email,
    });

    return NextResponse.json(
      {
        success: true,
        userId: newUser.id,
        message: 'Account created! Check your email to verify your address.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Auth/Signup] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
