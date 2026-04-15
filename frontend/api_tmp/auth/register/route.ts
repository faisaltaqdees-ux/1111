/**
 * Register API Route
 * Creates new user account with validation and password hashing
 * @file app/api/auth/register/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Validate password strength
 * Must contain: 12+ chars, uppercase, lowercase, number, special char
 */
function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain number');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Hash password (simulated bcrypt in production)
 * In production, use bcryptjs: await bcrypt.hash(password, 10)
 */
function hashPassword(password: string): string {
  // Simulate bcrypt hashing with PBKDF2
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Generate JWT token (simulated in production)
 * In production, use jsonwebtoken library
 */
function generateJWT(userId: string, email: string): string {
  // Simulate JWT: base64(header.payload.signature)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  ).toString('base64');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'dev-secret-key')
    .update(`${header}.${payload}`)
    .digest('base64');

  return `${header}.${payload}.${signature}`;
}

/**
 * User Registration
 * POST /api/auth/register
 * Body: { email: string, password: string, fullName: string, phone?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, confirmPassword } = body;

    // ========== Validation ==========

    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Valid email is required', field: 'email' },
        { status: 400 }
      );
    }

    // Full name validation
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json(
        { message: 'Full name must be at least 2 characters', field: 'fullName' },
        { status: 400 }
      );
    }

    // Password validation
    if (!password) {
      return NextResponse.json(
        { message: 'Password is required', field: 'password' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          message: 'Password does not meet requirements',
          field: 'password',
          errors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Confirm password
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match', field: 'confirmPassword' },
        { status: 400 }
      );
    }

    // ========== Database Operations (Simulated) ==========

    // In production:
    // 1. Query database: SELECT * FROM users WHERE email = ?
    // 2. If exists, return 409 Conflict
    // 3. Hash password with bcryptjs
    // 4. Create user record with is_email_verified = false
    // 5. Generate verification token
    // 6. Send verification email

    // Simulate checking if email exists
    // const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    // if (existingUser.rows.length > 0) {
    //   return NextResponse.json(
    //     { message: 'Email already registered', field: 'email' },
    //     { status: 409 }
    //   );
    // }

    // Simulate password hashing
    const passwordHash = hashPassword(password);

    // Simulate creating user
    const userId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Simulate storing in database:
    // INSERT INTO users (id, email, password_hash, full_name, phone, is_email_verified, created_at)
    // VALUES (?, ?, ?, ?, ?, false, ?)

    // ========== Generate Tokens ==========

    // Generate JWT for immediate session
    const jwtToken = generateJWT(userId, email);

    // Generate email verification token
    const verificationToken = Buffer.from(
      `${userId}_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`
    ).toString('base64');

    // Simulate storing verification token:
    // INSERT INTO email_verifications (user_id, token, expires_at)
    // VALUES (?, ?, NOW() + INTERVAL 24 HOUR)

    // ========== Send Email (Simulated) ==========

    // In production, send via SendGrid/AWS SES:
    // await sendEmail({
    //   to: email,
    //   subject: 'Verify Your KittyPaws Account',
    //   template: 'email-verification',
    //   variables: {
    //     fullName,
    //     verificationLink: `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`,
    //     expiresIn: '24 hours'
    //   }
    // });

    console.log(
      `[DEV] User registered: ${email} (Verification token: ${verificationToken.slice(0, 20)}...)`
    );

    // ========== Response ==========

    // Set JWT in httpOnly cookie
    const response = NextResponse.json(
      {
        message: 'Registration successful. Check email to verify.',
        user: {
          id: userId,
          email,
          fullName,
          phone: phone || null,
          isEmailVerified: false,
          createdAt,
        },
        token: jwtToken,
      },
      { status: 201 }
    );

    // Set secure httpOnly cookie
    response.cookies.set({
      name: 'auth_token',
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}

/**
 * Check if email is available
 * GET /api/auth/register?email=user@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { available: false, message: 'Valid email required' },
        { status: 400 }
      );
    }

    // In production:
    // const result = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    // const available = result.rows.length === 0;

    // Simulate: some emails are taken
    const takenEmails = [
      'admin@kittypaws.com',
      'test@example.com',
      'user@example.com',
    ];
    const available = !takenEmails.includes(email.toLowerCase());

    return NextResponse.json(
      {
        email,
        available,
        message: available
          ? 'Email is available'
          : 'Email is already registered',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email availability check error:', error);
    return NextResponse.json(
      { message: 'Failed to check email availability' },
      { status: 500 }
    );
  }
}
