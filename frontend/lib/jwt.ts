/**
 * ============================================================================
 * JWT TOKEN SERVICE
 * ============================================================================
 * Production-ready JWT token generation, signing, and verification
 * Uses environment variables for secret keys
 * @file lib/jwt.ts
 * @version 1.0 - Complete Implementation (300+ lines)
 */

import crypto from 'crypto';

/**
 * ============================================================================
 * CONFIGURATION (Lines 15-50)
 * ============================================================================
 */

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';

// Token expiration times
const AccessTokenExpiry = 86400; // 1 day in seconds
const RefreshTokenExpiry = 604800; // 7 days in seconds
const ResetTokenExpiry = 3600; // 1 hour in seconds

/**
 * ============================================================================
 * TYPE DEFINITIONS (Lines 52-110)
 * ============================================================================
 */

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh' | 'reset';
}

export interface TokenVerificationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS (Lines 112-180)
 * ============================================================================
 */

/**
 * Base64URL encode
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64URL decode
 */
function base64UrlDecode(str: string): string {
  let padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(
    padded.replace(/-/g, '+').replace(/_/g, '/'),
    'base64'
  ).toString();
}

/**
 * Create HMAC signature
 */
function createSignature(message: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64url')
    .replace(/=/g, '');
}

/**
 * ============================================================================
 * TOKEN GENERATION (Lines 182-260)
 * ============================================================================
 */

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(
  userId: string,
  email: string,
  expirySeconds?: number
): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (expirySeconds || AccessTokenExpiry);

  const payload: TokenPayload = {
    userId,
    email,
    iat: now,
    exp,
    type: 'access',
  };

  return signToken(payload, JWT_SECRET);
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(
  userId: string,
  email: string,
  expirySeconds?: number
): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (expirySeconds || RefreshTokenExpiry);

  const payload: TokenPayload = {
    userId,
    email,
    iat: now,
    exp,
    type: 'refresh',
  };

  return signToken(payload, JWT_REFRESH_SECRET);
}

/**
 * Generate password reset token
 */
export function generateResetToken(
  userId: string,
  email: string,
  expirySeconds?: number
): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (expirySeconds || ResetTokenExpiry);

  const payload: TokenPayload = {
    userId,
    email,
    iat: now,
    exp,
    type: 'reset',
  };

  return signToken(payload, JWT_SECRET);
}

/**
 * Generate temporary 2FA token
 */
export function generate2FAToken(userId: string, email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 300; // 5 minutes

  const payload: TokenPayload = {
    userId,
    email,
    iat: now,
    exp,
    type: 'access',
  };

  return signToken(payload, JWT_SECRET);
}

/**
 * ============================================================================
 * TOKEN SIGNING (Lines 262-300)
 * ============================================================================
 */

/**
 * Sign a JWT token
 */
function signToken(payload: TokenPayload, secret: string): string {
  // Header
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));

  const message = `${headerEncoded}.${payloadEncoded}`;
  const signature = createSignature(message, secret);

  return `${message}.${signature}`;
}

/**
 * ============================================================================
 * TOKEN VERIFICATION (Lines 302-380)
 * ============================================================================
 */

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenVerificationResult {
  return verifyToken(token, JWT_SECRET);
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenVerificationResult {
  return verifyToken(token, JWT_REFRESH_SECRET);
}

/**
 * Verify reset token
 */
export function verifyResetToken(token: string): TokenVerificationResult {
  return verifyToken(token, JWT_SECRET);
}

/**
 * Verify JWT token
 */
function verifyToken(token: string, secret: string): TokenVerificationResult {
  try {
    if (!token || typeof token !== 'string') {
      return {
        valid: false,
        error: 'Invalid token format',
      };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        valid: false,
        error: 'Invalid token structure',
      };
    }

    const [headerEncoded, payloadEncoded, signatureProvided] = parts;

    // Verify signature
    const message = `${headerEncoded}.${payloadEncoded}`;
    const signatureCalculated = createSignature(message, secret);

    if (signatureProvided !== signatureCalculated) {
      return {
        valid: false,
        error: 'Invalid signature',
      };
    }

    // Decode and parse payload
    const payloadJson = base64UrlDecode(payloadEncoded);
    const payload: TokenPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return {
        valid: false,
        error: 'Token expired',
      };
    }

    return {
      valid: true,
      payload,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      valid: false,
      error: errorMessage,
    };
  }
}

/**
 * ============================================================================
 * TOKEN REFRESH (Lines 382-430)
 * ============================================================================
 */

/**
 * Refresh an access token using refresh token
 */
export function refreshAccessToken(
  refreshToken: string
): {
  success: boolean;
  token?: string;
  error?: string;
} {
  const verification = verifyRefreshToken(refreshToken);

  if (!verification.valid || !verification.payload) {
    return {
      success: false,
      error: verification.error || 'Invalid refresh token',
    };
  }

  try {
    const newAccessToken = generateAccessToken(
      verification.payload.userId,
      verification.payload.email
    );

    return {
      success: true,
      token: newAccessToken,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * ============================================================================
 * MIDDLEWARE UTILITIES (Lines 432-480)
 * ============================================================================
 */

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Extract token from request
 */
export function extractTokenFromRequest(request: any): string | null {
  const authHeader = request.headers?.get?.('authorization');
  return extractTokenFromHeader(authHeader);
}

/**
 * ============================================================================
 * END OF JWT SERVICE (300+ lines total)
 * ============================================================================
 * PROVIDES:
 * ✅ JWT token generation
 * ✅ Token signing with HMAC-SHA256
 * ✅ Token verification
 * ✅ Access & refresh tokens
 * ✅ Password reset tokens
 * ✅ 2FA temporary tokens
 * ✅ Token expiration handling
 * ✅ Signature validation
 * ✅ Error handling
 * ✅ Header extraction utilities
 */
