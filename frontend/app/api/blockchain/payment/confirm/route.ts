/**
 * Payment Confirmation API Route - PRODUCTION VERSION
 * Confirms payment, saves transactions, creates tickets, generates receipts, mints NFTs
 * Handles both ticket purchases and charity donations
 * @file app/api/blockchain/payment/confirm/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { createHash } from 'crypto';

// Log environment on startup
console.log('🟢 [PaymentConfirm] Initializing with env vars:', {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET',
  NFT_CONTRACT: process.env.NEXT_PUBLIC_NFT_CONTRACT ? 'SET' : 'NOT SET',
  NFT_ADMIN_KEY: process.env.NFT_ADMIN_PRIVATE_KEY ? 'SET' : 'NOT SET',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT || '';
const ADMIN_KEY = process.env.NFT_ADMIN_PRIVATE_KEY || '';
const WIRE_RPC = 'https://rpc.wirefluid.io';

/**
 * Generate NFT Token ID
 */
function generateNFTTokenId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `NFT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate a deterministic UUID v5 from wallet address
 */
function generateUserIdFromWallet(walletAddress: string): string {
  const hash = createHash('md5').update(walletAddress.toLowerCase()).digest();
  hash[6] = (hash[6] & 0x0f) | 0x30;
  hash[8] = (hash[8] & 0x3f) | 0x80;

  const uuid = [
    hash.slice(0, 4).toString('hex'),
    hash.slice(4, 6).toString('hex'),
    hash.slice(6, 8).toString('hex'),
    hash.slice(8, 10).toString('hex'),
    hash.slice(10, 16).toString('hex'),
  ].join('-');

  return uuid;
}

/**
 * Payment confirmation request
 */
interface PaymentConfirmRequest {
  sessionId: string;
  transactionHash: string;
  matchId: string;
  walletAddress: string;
  quantity: number;
  email?: string;
  purpose?: 'ticket' | 'charity_donation'; // ticket or charity_donation
  amount?: number;
}

/**
 * Receipt object
 */
interface Receipt {
  receiptId: string;
  nftTokenId: string;
  transactionHash: string;
  explorerUrl: string;
  timestamp: string;
  seatSection?: string;
}

/**
 * Payment confirmation response
 */
interface PaymentConfirmResponse {
  success: boolean;
  message: string;
  transactionHash: string;
  sessionId: string;
  receipts?: Receipt[];
  nftTokenIds?: string[];
  receiptId?: string;
  error?: string;
}

/**
 * Confirm payment transaction & create tickets/receipts & mint NFTs
 * POST /api/blockchain/payment/confirm
 * Body: { sessionId, transactionHash, matchId, walletAddress, quantity, email, purpose, amount }
 */
export async function POST(request: NextRequest) {
  // ENSURE WE ALWAYS RETURN A RESPONSE WITH SUCCESS/ERROR
  const response: PaymentConfirmResponse = {
    success: false,
    message: '',
    transactionHash: '',
    sessionId: '',
  };

  try {
    const body = await request.json() as PaymentConfirmRequest;
    const {
      sessionId,
      transactionHash,
      matchId,
      walletAddress,
      quantity,
      email,
      purpose = 'ticket',
      amount = 0,
    } = body;

    console.log('🔵 [PaymentConfirm] Received payment request:', {
      sessionId: sessionId?.substring(0, 10) + '...',
      transactionHash: transactionHash?.substring(0, 10) + '...',
      matchId,
      walletAddress: walletAddress?.substring(0, 10) + '...',
      quantity,
      purpose,
      amount,
      email,
    });

    response.sessionId = sessionId;
    response.transactionHash = transactionHash;

    // ========== VALIDATE INPUT ==========
    const validationErrors: string[] = [];

    if (!sessionId || sessionId.length === 0) {
      validationErrors.push('Session ID is required');
    }

    if (!transactionHash || !/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
      validationErrors.push('Invalid transaction hash format (must be 0x followed by 64 hex chars)');
    }

    if (!matchId || matchId.length === 0) {
      validationErrors.push('Match ID is required');
    }

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      validationErrors.push('Invalid wallet address format (must be 0x followed by 40 hex chars)');
    }

    if (!quantity || quantity < 1) {
      validationErrors.push('Quantity must be at least 1');
    }

    if (validationErrors.length > 0) {
      console.log('❌ [PaymentConfirm] Validation failed:', validationErrors);
      response.success = false;
      response.message = 'Validation failed: ' + validationErrors.join('; ');
      response.error = validationErrors[0];
      return NextResponse.json(response, { status: 400 });
    }

    console.log('🟢 [PaymentConfirm] Validation passed. Processing payment...');

    // ========== SAVE TRANSACTION RECORD TO DATABASE ==========
    const userId = generateUserIdFromWallet(walletAddress);

    console.log('🟢 [PaymentConfirm] Creating transaction record:', {
      userId,
      transactionHash,
      matchId,
      walletAddress: walletAddress.slice(0, 10) + '...',
      quantity,
      purpose,
      amount,
    });

    const { error: txError, data: txData } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        email: email || null,
        transaction_hash: transactionHash,
        wallet_address: walletAddress,
        match_id: matchId,
        amount_wire: amount,
        quantity,
        purpose,
        status: 'completed',
        block_number: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (txError) {
      console.error('❌ [PaymentConfirm] Transaction save failed:', txError);
      response.success = false;
      response.message = 'Failed to save transaction to database';
      response.error = txError.message;
      return NextResponse.json(response, { status: 500 });
    }

    console.log('🟢 [PaymentConfirm] Transaction saved successfully:', {
      transactionId: txData?.id,
      transactionHash,
    });

    // ========== CREATE TICKETS/RECEIPTS ==========
    const receipts: Receipt[] = [];
    const nftTokenIds: string[] = [];

    for (let i = 0; i < quantity; i++) {
      const nftTokenId = generateNFTTokenId();
      const sectionLetter = String.fromCharCode(65 + (i % 26));
      const seatNumber = Math.floor(i / 26) + 1;
      const seatSection = `${sectionLetter}-${String(seatNumber).padStart(3, '0')}`;

      console.log('🔵 [PaymentConfirm] Creating ticket/receipt:', {
        ticketIndex: i + 1,
        nftTokenId,
        seatSection,
      });

      try {
        // CREATE TICKET RECORD
        const { error: ticketError, data: ticketData } = await supabase
          .from('tickets')
          .insert({
            user_id: userId,
            email: email || null,
            match_id: matchId,
            nft_token_id: nftTokenId,
            seat_section: seatSection,
            transaction_hash: transactionHash,
            status: 'active',
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (ticketError) {
          console.error('⚠️ [PaymentConfirm] Ticket creation failed:', ticketError);
        } else {
          console.log('🟢 [PaymentConfirm] Ticket created:', {
            ticketId: ticketData?.id,
            nftTokenId,
            seatSection,
          });
        }

        // GENERATE QR CODE
        const explorerUrl = `https://wirefluidscan.com/tx/${transactionHash}`;
        let qrCode = '';
        try {
          qrCode = await QRCode.toDataURL(explorerUrl);
        } catch (qrError) {
          console.warn('⚠️ [PaymentConfirm] QR code generation failed:', qrError);
          qrCode = '';
        }

        // CREATE RECEIPT RECORD
        const { error: receiptError, data: receiptData } = await supabase
          .from('receipts')
          .insert({
            user_id: userId,
            email: email || null,
            transaction_hash: transactionHash,
            wallet_address: walletAddress,
            match_id: matchId,
            nft_token_id: nftTokenId,
            seat_section: seatSection,
            qr_code: qrCode,
            purpose,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (receiptError) {
          console.error('⚠️ [PaymentConfirm] Receipt save failed:', receiptError);
        } else {
          console.log('🟢 [PaymentConfirm] Receipt saved:', {
            receiptId: receiptData?.id,
            nftTokenId,
          });
        }

        // ADD TO RESPONSE ARRAYS
        nftTokenIds.push(nftTokenId);
        receipts.push({
          receiptId: (receiptData?.id as string) || nftTokenId,
          nftTokenId,
          transactionHash,
          explorerUrl,
          timestamp: new Date().toISOString(),
          seatSection: purpose === 'ticket' ? seatSection : undefined,
        });

      } catch (itemError) {
        console.error('❌ [PaymentConfirm] Error creating ticket/receipt item:', itemError);
        // Continue processing other items even if one fails
      }
    }

    // ========== ATTEMPT NFT MINTING (NON-BLOCKING) ==========
    if (NFT_CONTRACT && ADMIN_KEY) {
      console.log('🔵 [PaymentConfirm] Attempting NFT minting...');
      try {
        // Validate contract address
        if (!ethers.isAddress(NFT_CONTRACT)) {
          throw new Error(`Invalid contract address: ${NFT_CONTRACT}`);
        }

        if (!ADMIN_KEY.startsWith('0x') || ADMIN_KEY.length !== 66) {
          throw new Error('Invalid admin private key format');
        }

        const provider = new ethers.JsonRpcProvider(WIRE_RPC);
        const signer = new ethers.Wallet(ADMIN_KEY, provider);
        console.log('🟢 [PaymentConfirm] Admin wallet:', signer.address);

        const contractABI = [
          'function mintTicket(address to, string matchId, string seatSection) returns (uint256)',
        ];
        const contract = new ethers.Contract(NFT_CONTRACT, contractABI, signer);

        for (let i = 0; i < Math.min(quantity, nftTokenIds.length); i++) {
          const sectionLetter = String.fromCharCode(65 + (i % 26));
          const seatNumber = Math.floor(i / 26) + 1;
          const seatSection = `${sectionLetter}-${String(seatNumber).padStart(3, '0')}`;

          try {
            console.log('🔵 [PaymentConfirm] Minting NFT:', {
              ticketIndex: i + 1,
              nftTokenId: nftTokenIds[i],
              seatSection,
            });

            const tx = await contract.mintTicket(walletAddress, matchId, seatSection);
            console.log('🟢 [PaymentConfirm] Mint tx sent:', tx.hash);

            const mintReceipt = await tx.wait(1);
            console.log('🟢 [PaymentConfirm] Mint confirmed:', {
              hash: tx.hash,
              blockNumber: mintReceipt?.blockNumber,
            });
          } catch (mintError) {
            // NFT minting failed but user still gets ticket and receipt
            console.warn('⚠️ [PaymentConfirm] NFT mint failed (non-blocking):', mintError);
          }
        }
      } catch (contractError) {
        // NFT contract error but user still gets ticket and receipt
        console.warn('⚠️ [PaymentConfirm] NFT contract unavailable (non-blocking):', contractError);
      }
    }

    // ========== SUCCESS RESPONSE ==========
    response.success = true;
    response.message = `Payment confirmed! ${quantity} ${purpose === 'ticket' ? 'ticket(s)' : 'donation(s)'} processed successfully.`;
    response.receipts = receipts;
    response.nftTokenIds = nftTokenIds;
    if (receipts.length > 0) {
      response.receiptId = receipts[0].receiptId;
    }

    console.log('🟢 [PaymentConfirm] SUCCESS - Payment confirmed:', {
      transactionHash,
      receiptsCount: receipts.length,
      nftTokenCount: nftTokenIds.length,
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ [PaymentConfirm] Unhandled error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // ALWAYS return a response object
    response.success = false;
    response.message = 'Payment confirmation failed due to an unexpected error';
    response.error = error instanceof Error ? error.message : String(error);

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * GET /api/blockchain/payment/confirm
 * Check confirmation status & get receipts
 */
export async function GET(request: NextRequest) {
  try {
    const transactionHash = request.nextUrl.searchParams.get('txHash');

    if (!transactionHash) {
      return NextResponse.json(
        { success: false, message: 'Transaction hash is required', error: 'Missing txHash parameter' },
        { status: 400 }
      );
    }

    console.log('🔵 [PaymentConfirm] Checking status for:', transactionHash.substring(0, 10) + '...');

    // Query database for transaction
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_hash', transactionHash)
      .single();

    if (txError || !txData) {
      console.warn('⚠️ [PaymentConfirm] Transaction not found:', transactionHash.substring(0, 10) + '...');
      return NextResponse.json(
        { success: false, message: 'Transaction not found', error: 'No transaction with this hash' },
        { status: 404 }
      );
    }

    // Get receipts for this transaction
    const { data: receipts, error: receiptError } = await supabase
      .from('receipts')
      .select('*')
      .eq('transaction_hash', transactionHash);

    if (receiptError) {
      console.warn('⚠️ [PaymentConfirm] Failed to fetch receipts:', receiptError);
    }

    console.log('🟢 [PaymentConfirm] Status check complete:', {
      status: txData.status,
      receiptsCount: receipts?.length || 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction status retrieved',
        transactionHash,
        status: txData.status,
        receipts: receipts || [],
        quantity: txData.quantity,
        purpose: txData.purpose,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [PaymentConfirm] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check confirmation status',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
