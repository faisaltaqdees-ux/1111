/**
 * Refund Ticket API Route
 * Processes ticket refunds and adds balance to user account
 * @file app/api/auth/refund-ticket/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

interface RefundRequest {
  ticketId: string;
  email: string;
  reason?: string;
}

/**
 * Process refund for a ticket
 * POST /api/auth/refund-ticket
 * Body: { ticketId, email, reason }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RefundRequest;
    const { ticketId, email, reason } = body;

    console.log('[RefundTicket] Processing refund:', {
      ticketId: ticketId?.substring(0, 10) + '...',
      email,
      reason,
    });

    // ========== Validate Input ==========
    if (!ticketId || ticketId.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    if (!email || email.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // ========== Get Ticket Details ==========
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*, transactions(*)')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      console.error('[RefundTicket] Ticket not found:', ticketError);
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Verify ticket belongs to user
    if (ticket.email !== email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Ticket does not belong to this user' },
        { status: 403 }
      );
    }

    // Prevent refund if already entered
    if (ticket.entry_time) {
      return NextResponse.json(
        { success: false, error: 'Cannot refund ticket after gate entry' },
        { status: 400 }
      );
    }

    // Prevent duplicate refunds
    if (ticket.status === 'refunded') {
      return NextResponse.json(
        { success: false, error: 'Ticket has already been refunded' },
        { status: 400 }
      );
    }

    // ========== Calculate Refund Amount ==========
    const transaction = ticket.transactions?.[0];
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction details not found' },
        { status: 404 }
      );
    }

    const refundAmount = transaction.amount_wire / transaction.quantity;

    console.log('[RefundTicket] Refund calculated:', {
      ticketId,
      totalAmount: transaction.amount_wire,
      quantity: transaction.quantity,
      perTicket: refundAmount,
    });

    // ========== Create Refund Record ==========
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        email: email,
        ticket_id: ticketId,
        amount_wire: refundAmount,
        reason: reason || 'User requested refund',
        status: 'confirmed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (refundError) {
      console.error('[RefundTicket] Refund creation error:', refundError);
      return NextResponse.json(
        { success: false, error: 'Failed to create refund record' },
        { status: 500 }
      );
    }

    // ========== Update User Balance ==========
    const { data: currentBalance } = await supabase
      .from('user_balances')
      .select('claimable_wire')
      .eq('email', email)
      .single();

    const newBalance = (currentBalance?.claimable_wire || 0) + refundAmount;

    await supabase.from('user_balances').upsert({
      email: email,
      claimable_wire: newBalance,
      updated_at: new Date().toISOString(),
    });

    console.log('[RefundTicket] Balance updated:', {
      email,
      oldBalance: currentBalance?.claimable_wire || 0,
      newBalance,
      refundAmount,
    });

    // ========== Update Ticket Status ==========
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'refunded', refunded_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (updateError) {
      console.error('[RefundTicket] Ticket update error:', updateError);
    }

    // ========== Send Refund Confirmation Email (Optional) ==========
    // Could integrate with Brevo here if needed

    console.log('[RefundTicket] ✅ Refund processed successfully:', {
      refundId: refund.id,
      ticketId,
      email,
      refundAmount,
    });

    return NextResponse.json({
      success: true,
      message: `✅ Refunded ${refundAmount} WIRE to your account balance`,
      refund: {
        id: refund.id,
        amount: refundAmount,
        newBalance: newBalance,
      },
      nextSteps: {
        step1: `${refundAmount} WIRE added to your balance`,
        step2: 'Visit your wallet to withdraw',
        step3: 'Funds transferred instantly to your MetaMask',
      },
    });
  } catch (err) {
    console.error('[RefundTicket] Error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Refund failed' },
      { status: 500 }
    );
  }
}
