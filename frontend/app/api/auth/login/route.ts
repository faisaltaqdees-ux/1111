/**
 * Login API Route
 * Authenticates user with email/password and rate limiting
 * @file app/api/auth/login/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Verify hashed password (simulated bcrypt)
 * In production, use bcryptjs: await bcrypt.compare(password, hash)
 */
function verifyPassword(password: string, hash: string): boolean {
  // Simulate bcrypt verification
  try {
    const [salt, storedHash] = hash.split(':');
    const computed = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return computed === storedHash;
  } catch {
    return false;
  }
}

/**
 * Generate JWT token
 */
function generateJWT(userId: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    })
  ).toString('base64');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'dev-secret-key')
    .update(`${header}.${payload}`)
    .digest('base64');

  return `${header}.${payload}.${signature}`;
}

/**
 * Get client IP for rate limiting
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// In-memory rate limiting (in production, use Redis)
const loginAttempts = new Map<
  string,
  { count: number; resetAt: number }
>();

/**
 * Check and update rate limiting
 */
function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  lockoutMinutes: number = 15
): { allowed: boolean; remainingAttempts: number; resetAt?: Date } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + lockoutMinutes * 60 * 1000 });
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }

  // Reset if lockout period expired
  if (now >= attempt.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + lockoutMinutes * 60 * 1000 });
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }

  // Check if user hit limit
  if (attempt.count >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetAt: new Date(attempt.resetAt),
    };
  }

  // Increment counter
  attempt.count++;
  return {
    allowed: true,
    remainingAttempts: maxAttempts - attempt.count,
  };
}

/**
 * User Login
 * POST /api/auth/login
 * Body: { email: string, password: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ========== Validation ==========

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    // ========== Rate Limiting ==========

    const clientIP = getClientIP(request);
    const rateLimitKey = `login_${email.toLowerCase()}`;
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      console.warn(`[SECURITY] Login rate limit exceeded for ${email} from ${clientIP}`);

      const resetAt = rateLimit.resetAt || new Date();
      return NextResponse.json(
        {
          message: `Too many failed attempts. Try again at ${resetAt.toLocaleTimeString()}`,
          resetAt: resetAt.toISOString(),
          locked: true,
        },
        { status: 429 }
      );
    }

    // ========== Database Query (Simulated) ==========

    // In production:
    // const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    // if (!user.rows.length) {
    //   // Generic error for security (don't reveal if email exists)
    //   return 401 Unauthorized
    // }

    // Simulate user database
    const users: Record<
      string,
      {
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        phone: string | null;
        isEmailVerified: boolean;
        createdAt: string;
        lastLogin: string | null;
      }
    > = {
      'user@example.com': {
        id: 'user_123',
        email: 'user@example.com',
        // Password: "SecurePass123!" hashed
        passwordHash:
          'abcd1234:' +
          crypto
            .pbkdf2Sync('SecurePass123!', 'abcd1234', 1000, 64, 'sha512')
            .toString('hex'),
        fullName: 'Test User',
        phone: '+1234567890',
        isEmailVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastLogin: null,
      },
    };

    const user = users[email.toLowerCase()];

    if (!user || !verifyPassword(password, user.passwordHash)) {
      console.warn(`[SECURITY] Failed login attempt for ${email} from ${clientIP}`);

      // Return generic error for security
      return NextResponse.json(
        {
          message: 'Invalid email or password',
          remainingAttempts: rateLimit.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Clear rate limit on successful login
    loginAttempts.delete(rateLimitKey);

    // ========== Update Last Login (Simulated) ==========

    // In production:
    // await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // ========== Generate Tokens ==========

    const jwtToken = generateJWT(user.id, user.email);

    // ========== Response ==========

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          lastLogin: new Date().toISOString(),
        },
        token: jwtToken,
      },
      { status: 200 }
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
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/login
 * Check login status
 */
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth_token')?.value;

    return NextResponse.json(
      {
        isAuthenticated: !!authToken,
        token: authToken ? 'exists' : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login status check error:', error);
    return NextResponse.json(
      { message: 'Failed to check login status' },
      { status: 500 }
    );
  }
}
