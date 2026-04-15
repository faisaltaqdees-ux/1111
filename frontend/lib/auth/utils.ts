/**
 * Authentication Utilities & Security Functions
 * Password hashing, token generation, validation, rate limiting
 * @file lib/auth/utils.ts
 */

import crypto from 'crypto';
import { createHash, randomBytes, pbkdf2Sync } from 'crypto';

/**
 * Password Validation Rules
 * Min 6 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Email Validation
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Phone Number Validation (optional, basic)
 */
export function validatePhoneNumber(phone: string | null | undefined): boolean {
  if (!phone) return true; // Optional field
  // Basic validation: 10-15 digits, allowing +, -, spaces
  return /^[\d\s\-+()]{10,15}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Wallet Address Validation (Ethereum format)
 */
export function validateWalletAddress(wallet: string | null | undefined): boolean {
  if (!wallet) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(wallet);
}

/**
 * Hash password using PBKDF2 with salt
 * @returns "salt$hash" format for storage
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex');
  return `${salt}$${hash}`;
}

/**
 * Verify password against stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split('$');
    const verifyHash = pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex');
    return hash === verifyHash;
  } catch (error) {
    console.error('[Auth] Password verification error:', error);
    return false;
  }
}

/**
 * Generate secure token for email verification and password reset
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate 6-digit OTP for 2FA
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate recovery codes for 2FA backup
 */
export function generateRecoveryCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase().slice(0, 8);
    codes.push(code);
  }
  return codes;
}

/**
 * Parse user agent for device info
 */
export function parseUserAgent(
  userAgent: string
): {
  browser: string;
  os: string;
  device: string;
} {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (/Chrome/.test(userAgent)) browser = 'Chrome';
  else if (/Firefox/.test(userAgent)) browser = 'Firefox';
  else if (/Safari/.test(userAgent)) browser = 'Safari';
  else if (/Edge/.test(userAgent)) browser = 'Edge';

  if (/Windows/.test(userAgent)) os = 'Windows';
  else if (/Mac/.test(userAgent)) os = 'macOS';
  else if (/Linux/.test(userAgent)) os = 'Linux';
  else if (/iPhone|iPad|iPod/.test(userAgent)) os = 'iOS';
  else if (/Android/.test(userAgent)) os = 'Android';

  if (/Mobile|Android|iPhone/.test(userAgent)) device = 'Mobile';
  else if (/iPad|Tablet/.test(userAgent)) device = 'Tablet';

  return { browser, os, device };
}

/**
 * Get IP address from request
 */
export function getClientIP(headers: Headers): string {
  const headersList = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'fastly-client-ip',
  ];

  for (const header of headersList) {
    const value = headers.get(header);
    if (value) {
      return value.split(',')[0].trim();
    }
  }

  return 'unknown';
}

/**
 * Rate limiting: Store attempts in memory (use Redis in production)
 */
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowSeconds: number = 900 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime: now + windowSeconds * 1000,
    };
  }

  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Clear rate limit entry
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Generate secure session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create JWT-like token (simple implementation)
 * For production, use jsonwebtoken library
 */
export function createAuthToken(userId: string, expiresIn: number = 86400): string {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
    'base64url'
  );
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret')
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode JWT token
 */
export function verifyAuthToken(token: string): { userId: string; valid: boolean } {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret')
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return { userId: '', valid: false };
    }

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString());

    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return { userId: '', valid: false };
    }

    return { userId: decoded.sub, valid: true };
  } catch (error) {
    console.error('[Auth] Token verification error:', error);
    return { userId: '', valid: false };
  }
}

/**
 * Full name validation
 */
export function validateFullName(name: string): boolean {
  if (!name || name.trim().length < 2) return false;
  if (name.length > 255) return false;
  return /^[a-zA-Z\s'-]+$/.test(name);
}

export default {
  validatePassword,
  validateEmail,
  validatePhoneNumber,
  validateWalletAddress,
  validateFullName,
  hashPassword,
  verifyPassword,
  generateToken,
  generateOTP,
  generateRecoveryCodes,
  parseUserAgent,
  getClientIP,
  checkRateLimit,
  clearRateLimit,
  generateSessionToken,
  createAuthToken,
  verifyAuthToken,
};
