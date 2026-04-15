/**
 * ============================================================================
 * PAYMENT CONFIRMATION API ROUTE - PRODUCTION GRADE
 * ============================================================================
 * Confirms blockchain payment and creates Supabase records
 * Handles: transaction verification, ticket minting, receipt generation
 * @file app/api/payments/confirm/route.ts
 * @version 2.0 - Fixed Empty Response Bug
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { confirmPayment } from '@/lib/blockchainPaymentHandler';
import {
  withMiddleware,
  successResponse,
  errorResponse,
  badRequest,
  logRequestComplete,
  internalServerError,
  applyCORSHeaders,
  validateEmail,
  validateAddress,
} from '@/lib/apiMiddleware';

/**
 * ============================================================================
 * INITIALIZATION (Lines 30-60)
 * ============================================================================
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * ============================================================================
 * REQUEST HANDLER (Lines 62-300)
 * ============================================================================
 */

export async function POST(request: NextRequest) {
  // ========== MIDDLEWARE CHECK ==========
  console.log('[PaymentConfirm] 🔵 Request started');

  const middlewareResult = await withMiddleware(request, {
    allowedMethods: ['POST'],
    rateLimit: 'payment',
    validateBody: [
      { field: 'sessionId', type: 'string', required: true },
      { field: 'transactionHash', type: 'string', required: true },
      { field: 'userEmail', type: 'email', required: true },
      { field: 'walletAddress', type: 'address', required: true },
      { field: 'wireAmount', type: 'string', required: true },
    ],
  });

  if (!middlewareResult.ok || !middlewareResult.context) {
    console.log('[PaymentConfirm] ❌ Middleware check failed');
    return middlewareResult.response || badRequest('Invalid request', '', request);
  }

  const { context, body } = middlewareResult;
  const { sessionId, transactionHash, userEmail, walletAddress, wireAmount } = body;

  console.log('[PaymentConfirm] 🟢 Validation passed:', {
    sessionId,
    txHash: transactionHash.slice(0, 20) + '...',
    email: userEmail,
    wallet: walletAddress.slice(0, 10) + '...',
    amount: wireAmount,
  });

  try {
    // ========== CALL BLOCKCHAIN PAYMENT HANDLER ==========
    console.log('[PaymentConfirm] 🔵 Calling payment confirmation handler');

    const confirmResult = await confirmPayment({
      sessionId,
      transactionHash,
      userEmail,
      walletAddress,
      wireAmount,
      purpose: 'ticket',
    });

    console.log('[PaymentConfirm] 🟢 Payment confirmation result:', {
      success: confirmResult.success,
      message: confirmResult.message,
      receiptId: confirmResult.receiptId,
    });

    if (!confirmResult.success) {
      console.error('[PaymentConfirm] ❌ Payment confirmation failed:', confirmResult.error);
      logRequestComplete(context, 400);
      return badRequest(
        confirmResult.message,
        context.requestId,
        request
      );
    }

    // ========== BUILD SUCCESSFUL RESPONSE ==========
    console.log('[PaymentConfirm] ✅ Building success response');

    const responseData = successResponse(
      {
        success: true,
        transactionHash,
        sessionId,
        receiptId: confirmResult.receiptId,
        receipt: confirmResult.receipt,
        ticketIds: confirmResult.ticketIds,
        blockNumber: confirmResult.blockNumber,
        confirmations: confirmResult.confirmations,
      },
      'Payment confirmed successfully',
      context.requestId
    );

    const response = NextResponse.json(responseData, { status: 200 });
    logRequestComplete(context, 200);

    return applyCORSHeaders(response, request);
  } catch (error: any) {
    console.error('[PaymentConfirm] ❌ Unexpected error:', {
      message: error.message,
      stack: error.stack,
    });

    logRequestComplete(context, 500);

    // ========== ENSURE WE ALWAYS RETURN A RESPONSE ==========
    const errorData = errorResponse(
      'Payment confirmation failed',
      error.message,
      context.requestId
    );

    const response = NextResponse.json(errorData, { status: 500 });
    return applyCORSHeaders(response, request);
  }
}

/**
 * ============================================================================
 * OPTIONS HANDLER (CORS PREFLIGHT)
 * ============================================================================
 */

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return applyCORSHeaders(response, request);
}
