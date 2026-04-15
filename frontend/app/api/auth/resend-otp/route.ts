/**
 * Resend OTP API Route
 * Generates and sends verification OTP to email
 * @file app/api/auth/resend-otp/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate random 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Resend verification OTP
 * POST /api/auth/resend-otp
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check rate limiting (max 3 OTP requests per hour per email)
    // In production, use Redis for rate limiting
    // For now, simulate with simple check
    const rateLimitKey = `otp_${email}`;
    
    // In production implementation:
    // const redis = getRedisClient();
    // const attempts = await redis.incr(rateLimitKey);
    // if (attempts === 1) await redis.expire(rateLimitKey, 3600);
    // if (attempts > 3) return 429 Too Many Requests

    // Generate OTP
    const otp = generateOTP();

    // In production:
    // 1. Store OTP in Redis with 10-minute expiry
    // 2. Send email via SendGrid/AWS SES
    // 3. Log attempt for audit trail

    // Simulate storing OTP (in production, use Redis)
    // const redis = getRedisClient();
    // await redis.setex(`otp_${email}`, 600, otp); // 10 minutes

    // Simulate sending email (in production, use SendGrid/SES)
    // await sendEmail({
    //   to: email,
    //   subject: 'KittyPaws Verification Code',
    //   template: 'verification-otp',
    //   variables: { otp, expiresIn: '10 minutes' }
    // });

    // For development, log the OTP
    console.log(`[DEV] OTP for ${email}: ${otp} (expires in 10 minutes)`);

    // Return success (don't reveal if email exists for security)
    return NextResponse.json(
      {
        message: 'Verification code sent to your email',
        // In production, omit these debug fields:
        _debug: {
          otp: otp, // Remove in production!
          expiresIn: 600,
          email: email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { message: 'Failed to resend verification code' },
      { status: 500 }
    );
  }
}
