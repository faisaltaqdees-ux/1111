/**
 * Payments API Routes
 * POST /api/payments/initiate - Start payment process with local ramp
 * POST /api/payments/callback - Handle payment gateway callback
 * POST /api/payments/transfer - Execute WireFluid blockchain transfer
 * GET /api/payments/history - Get user transaction history
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simulated transaction store
const transactions: Map<
  string,
  {
    id: string;
    userId: string;
    type: 'donate' | 'tip' | 'ticket';
    recipient: string;
    pkrAmount: number;
    wireAmount: number;
    method: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    txHash: string;
    fromAddress: string;
    toAddress: string;
    createdAt: number;
  }
> = new Map();

const EXCHANGE_RATE = 0.00008; // 1 PKR = 0.00008 WIRE
const WIRE_TESTNET_CHAIN_ID = 92533;
const WIRE_TESTNET_RPC = 'https://testnet-rpc.wirefluid.com';

// Payment method fees and merchant wallets (in production: use environment variables)
const PAYMENT_METHODS: Record<
  string,
  { name: string; fee: number; merchantWallet: string }
> = {
  jazzcash: {
    name: 'JazzCash',
    fee: 2.0,
    merchantWallet: '0xJazzCashMerchant1234567890',
  },
  easypaisa: {
    name: 'EasyPaisa',
    fee: 1.5,
    merchantWallet: '0xEasyPaisaMerchant1234567890',
  },
  hbl: {
    name: 'HBL Wallet',
    fee: 1.8,
    merchantWallet: '0xHBLMerchant1234567890',
  },
  upi: {
    name: 'UPI',
    fee: 1.0,
    merchantWallet: '0xUPIMerchant1234567890',
  },
};

/**
 * Calculate WIRE amount from PKR with fee
 */
function calculateWireAmount(pkrAmount: number, feePercent: number): number {
  const afterFee = pkrAmount * (1 - feePercent / 100);
  return Math.round(afterFee * EXCHANGE_RATE * 100) / 100;
}

/**
 * Generate transaction hash (simulated)
 * In production: actual transaction hash from blockchain RPC
 */
function generateTxHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

/**
 * POST /api/payments/initiate
 * Start payment process with local payment method
 */
export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  try {
    const body = await request.json();

    if (pathname.includes('/payments/initiate')) {
      const {
        userId,
        methodId,
        pkrAmount,
        recipientType,
        recipientId,
      } = body;

      // Validation
      if (!userId || !methodId || !pkrAmount || !recipientType || !recipientId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const method = PAYMENT_METHODS[methodId];
      if (!method) {
        return NextResponse.json(
          { error: 'Invalid payment method' },
          { status: 400 }
        );
      }

      if (pkrAmount < 100 || pkrAmount > 100000) {
        return NextResponse.json(
          { error: 'Amount outside allowed range (100-100,000 PKR)' },
          { status: 400 }
        );
      }

      // Calculate WIRE amount
      const wireAmount = calculateWireAmount(pkrAmount, method.fee);

      // Create transaction record
      const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const txHash = generateTxHash();

      const transaction = {
        id: txId,
        userId,
        type: recipientType as 'donate' | 'tip' | 'ticket',
        recipient: recipientId,
        pkrAmount,
        wireAmount,
        method: method.name,
        status: 'pending' as const,
        txHash,
        fromAddress: `0x${userId}`, // Placeholder
        toAddress: method.merchantWallet,
        createdAt: Date.now(),
      };

      transactions.set(txId, transaction);

      console.log('🔵 [Payments] Initiated:', {
        userId,
        method: method.name,
        amount: `${pkrAmount} PKR → ${wireAmount} WIRE`,
        txHash,
      });

      // In production: Call actual payment gateway API
      // Response: { paymentUrl, redirectTo, merchantOrderId }

      return NextResponse.json(
        {
          success: true,
          transaction: {
            id: txId,
            status: 'pending',
            wireAmount,
            method: method.name,
            fee: method.fee,
            recipientType,
            recipientId,
          },
          paymentUrl: `https://payment-gateway.local/authorize/${txId}`,
          chainId: WIRE_TESTNET_CHAIN_ID,
        },
        { status: 201 }
      );
    }

    // Transfer on WireFluid
    if (pathname.includes('/payments/transfer')) {
      const { transactionId, fromAddress, toAddress, amount } = body;

      if (!transactionId || !fromAddress || !toAddress || !amount) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const transaction = transactions.get(transactionId);
      if (!transaction) {
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        );
      }

      transaction.status = 'processing';

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In production: 
      // const provider = new ethers.JsonRpcProvider(WIRE_TESTNET_RPC);
      // const response = await provider.send('eth_sendTransaction', [{
      //   from: fromAddress,
      //   to: toAddress,
      //   value: ethers.parseUnits(amount.toString(), 18).toString(),
      //   chainId: WIRE_TESTNET_CHAIN_ID,
      //   gas: '21000',
      // }]);

      transaction.status = 'completed';
      transaction.txHash = generateTxHash();

      console.log('✅ [Payments] Transfer completed:', {
        txId: transactionId,
        from: fromAddress,
        to: toAddress,
        amount: `${amount} WIRE`,
        hash: transaction.txHash,
      });

      return NextResponse.json(
        {
          success: true,
          transaction: {
            id: transaction.id,
            status: transaction.status,
            wireAmount: transaction.wireAmount,
            txHash: transaction.txHash,
            chainId: WIRE_TESTNET_CHAIN_ID,
          },
        },
        { status: 200 }
      );
    }

    // Payment callback (from external gateway)
    if (pathname.includes('/payments/callback')) {
      const { transactionId, status, externalTxId } = body;

      if (!transactionId || !status) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const transaction = transactions.get(transactionId);
      if (!transaction) {
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        );
      }

      if (status === 'success') {
        transaction.status = 'processing';
        console.log('✅ [Payments] Callback received (success):', transactionId);
      } else if (status === 'failed') {
        transaction.status = 'failed';
        console.log('❌ [Payments] Callback received (failed):', transactionId);
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Callback processed',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Unknown endpoint' },
      { status: 404 }
    );
  } catch (err) {
    console.error('❌ [Payments] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/history
 * Get user transaction history
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Filter transactions by user
    const userTransactions = Array.from(transactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json(
      {
        success: true,
        transactions: userTransactions.map((tx) => ({
          id: tx.id,
          type: tx.type,
          recipient: tx.recipient,
          pkrAmount: tx.pkrAmount,
          wireAmount: tx.wireAmount,
          status: tx.status,
          method: tx.method,
          txHash: tx.txHash,
          createdAt: tx.createdAt,
        })),
        total: userTransactions.length,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('❌ [Payments] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
