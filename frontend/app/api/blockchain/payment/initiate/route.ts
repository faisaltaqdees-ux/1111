/**
 * Payment Initiation API Route
 * Handles the start of ticket payment process
 * @file app/api/blockchain/payment/initiate/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Payment initiation request
 */
interface PaymentInitiationRequest {
  matchId: string;
  quantity: number;
  ticketType: string;
  email: string;
  walletAddress: string;
  amount: string | number; // in WIRE tokens
}

/**
 * Payment initiation response
 */
interface PaymentSession {
  sessionId: string;
  matchId: string;
  amount: number;
  currency: string;
  recipientAddress: string;
  expiresAt: string;
  status: 'pending' | 'confirmed' | 'failed';
}

/**
 * Initiate ticket payment
 * POST /api/blockchain/payment/initiate
 * Body: { matchId, quantity, ticketType, email, walletAddress, amount }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PaymentInitiationRequest;
    const { matchId, quantity, ticketType, email, walletAddress, amount } = body;

    // ========== Validate Input ==========

    if (!matchId || matchId.length === 0) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    if (!quantity || quantity < 1 || quantity > 50) {
      return NextResponse.json(
        { error: 'Invalid quantity (1-50)' },
        { status: 400 }
      );
    }

    if (!['standard', 'vip', 'premium'].includes(ticketType)) {
      return NextResponse.json(
        { error: 'Invalid ticket type' },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Valid wallet address is required' },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // ========== Create Payment Session ==========

    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    const paymentSession: PaymentSession = {
      sessionId,
      matchId,
      amount: Number(amount),
      currency: 'WIRE',
      recipientAddress: process.env.NEXT_PUBLIC_PAYMENT_WALLET || '0x0000000000000000000000000000000000000000',
      expiresAt,
      status: 'pending',
    };

    // ========== Store Payment Session (Simulated) ==========

    // In production:
    // await db.query(
    //   'INSERT INTO payment_sessions (session_id, user_id, match_id, amount, wallet_address, status, expires_at, created_at) ' +
    //   'VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
    //   [sessionId, userId, matchId, amount, walletAddress, 'pending', expiresAt]
    // );

    // Also store in Redis for quick lookups
    // const redis = getRedisClient();
    // await redis.setex(`payment_session_${sessionId}`, 600, JSON.stringify(paymentSession));

    console.log('[Payment] Session initiated:', {
      sessionId,
      matchId,
      amount: Number(amount),
      wallet: walletAddress.slice(0, 10) + '...',
      email: email,
      timestamp: new Date().toISOString(),
    });

    // ========== Response ==========

    return NextResponse.json(
      {
        sessionId,
        matchId,
        amount: Number(amount),
        currency: 'WIRE',
        recipientAddress: paymentSession.recipientAddress,
        expiresAt,
        status: 'pending',
        instructions: {
          step1: 'Send ' + Number(amount) + ' WIRE tokens to: ' + paymentSession.recipientAddress,
          step2: 'Wait for transaction to be mined (usually 1-2 minutes)',
          step3: 'Transaction will be verified automatically',
          timeout: 'Payment session expires in 10 minutes',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Payment] Initiation error:', error);
    return NextResponse.json(
      { error: 'Payment initiation failed' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to generate session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PAY-${timestamp}-${random}`;
}

/**
 * GET /api/blockchain/payment/initiate
 * Check payment session status
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID is required' },
        { status: 400 }
      );
    }

    // In production: Retrieve from Redis/Database
    // const redis = getRedisClient();
    // const session = await redis.get(`payment_session_${sessionId}`);

    return NextResponse.json(
      {
        sessionId,
        status: 'pending',
        message: 'Payment session is active',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Payment] Session check error:', error);
    return NextResponse.json(
      { message: 'Failed to check payment session' },
      { status: 500 }
    );
  }
}
