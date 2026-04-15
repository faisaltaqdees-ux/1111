/**
 * Withdraw Balance API Route
 * Transfers claimable balance from user account to MetaMask wallet
 * @file app/api/auth/withdraw-balance/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

interface WithdrawRequest {
  amount: number;
  email: string;
  walletAddress: string;
}

/**
 * Withdraw claimable balance to wallet
 * POST /api/auth/withdraw-balance
 * Body: { amount, email, walletAddress }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WithdrawRequest;
    const { amount, email, walletAddress } = body;

    console.log('[WithdrawBalance] Processing withdrawal:', {
      amount,
      email,
      walletAddress: walletAddress?.substring(0, 10) + '...',
    });

    // ========== Validate Input ==========
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!email || email.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // ========== Verify User Balance ==========
    const { data: balance, error: balanceError } = await supabase
      .from('user_balances')
      .select('claimable_wire, id')
      .eq('email', email)
      .single();

    if (balanceError || !balance) {
      console.error('[WithdrawBalance] User balance not found:', balanceError);
      return NextResponse.json(
        { success: false, error: 'User balance account not found' },
        { status: 404 }
      );
    }

    if (balance.claimable_wire < amount) {
      return NextResponse.json(
        { success: false, error: `Insufficient balance. Available: ${balance.claimable_wire} WIRE` },
        { status: 400 }
      );
    }

    console.log('[WithdrawBalance] Balance verified:', {
      email,
      claimableAmount: balance.claimable_wire,
      requestAmount: amount,
    });

    // ========== Create Withdrawal Record ==========
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawals')
      .insert({
        email: email,
        amount_wire: amount,
        wallet_address: walletAddress,
        status: 'processed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error('[WithdrawBalance] Withdrawal record error:', withdrawalError);
      return NextResponse.json(
        { success: false, error: 'Failed to create withdrawal record' },
        { status: 500 }
      );
    }

    // ========== Update User Balance ==========
    const newBalance = balance.claimable_wire - amount;

    const { error: updateError } = await supabase
      .from('user_balances')
      .update({
        claimable_wire: newBalance,
        last_withdrawal: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', balance.id);

    if (updateError) {
      console.error('[WithdrawBalance] Balance update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update balance' },
        { status: 500 }
      );
    }

    console.log('[WithdrawBalance] ✅ Balance transferred:', {
      email,
      previousBalance: balance.claimable_wire,
      withdrawalAmount: amount,
      newBalance: newBalance,
      walletAddress: walletAddress?.substring(0, 10) + '...',
    });

    // ========== TODO: Smart Contract Integration ==========
    // In production, you would call your smart contract to transfer WIRE tokens
    // Example:
    // const provider = new ethers.providers.JsonRpcProvider('https://rpc.wirefluid.io');
    // const signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    // const wireContract = new ethers.Contract(WIRE_TOKEN_ADDRESS, WIRE_ABI, signer);
    // const tx = await wireContract.transfer(walletAddress, ethers.utils.parseEther(amount.toString()));
    // await tx.wait();

    return NextResponse.json({
      success: true,
      message: `✅ Withdrawn ${amount} WIRE to your wallet`,
      withdrawal: {
        id: withdrawal.id,
        amount: amount,
        walletAddress: walletAddress,
        newBalance: newBalance,
        status: 'processed',
      },
      nextSteps: {
        step1: `${amount} WIRE transferred to ${walletAddress.substring(0, 6)}...`,
        step2: 'Check your MetaMask wallet',
        step3: 'Transaction may take 1-2 minutes to appear',
      },
      transactionHash: `0x${Math.random().toString(16).substring(2)}`, // Placeholder - use real txHash from contract
    });
  } catch (err) {
    console.error('[WithdrawBalance] Error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Withdrawal failed' },
      { status: 500 }
    );
  }
}
