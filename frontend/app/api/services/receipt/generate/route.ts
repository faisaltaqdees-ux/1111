/**
 * Receipt Generation API Route
 * Generates digital receipts for ticket purchases
 * @file app/api/services/receipt/generate/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Receipt generation request
 */
interface ReceiptRequest {
  transactionHash: string;
  matchId: string;
  matchData: {
    team1: string;
    team2: string;
    date: string;
    venue: string;
    matchType: string;
  };
  purchaseData: {
    userEmail: string;
    walletAddress: string;
    ticketType: string;
    quantity: number;
    pricePerTicket: { pkr: number; wire: number };
    totalPrice: { pkr: number; wire: number };
  };
  nftTokenIds?: string[];
  qrCode?: string;
}

/**
 * Receipt response
 */
interface ReceiptResponse {
  receiptId: string;
  transactionHash: string;
  html: string;
  csv: string;
  qrCode?: string;
  timestamp: string;
}

/**
 * Generate receipt
 * POST /api/services/receipt/generate
 * Body: { transactionHash, matchId, matchData, purchaseData, nftTokenIds, qrCode }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ReceiptRequest;
    const { transactionHash, matchId, matchData, purchaseData, nftTokenIds, qrCode } = body;

    // Validate auth
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // ========== Validate Input ==========

    if (!transactionHash || !/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
      return NextResponse.json(
        { message: 'Invalid transaction hash' },
        { status: 400 }
      );
    }

    if (!matchId) {
      return NextResponse.json(
        { message: 'Match ID is required' },
        { status: 400 }
      );
    }

    if (!matchData || !matchData.team1 || !matchData.team2) {
      return NextResponse.json(
        { message: 'Invalid match data' },
        { status: 400 }
      );
    }

    if (!purchaseData || !purchaseData.userEmail) {
      return NextResponse.json(
        { message: 'Invalid purchase data' },
        { status: 400 }
      );
    }

    // ========== Generate Receipt ID ==========

    const receiptId = generateReceiptId();
    const timestamp = new Date().toISOString();

    // ========== Generate HTML Receipt ==========

    const matchDateFormatted = new Date(matchData.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlReceipt = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #0a0a1a;
          color: #fff;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #1a1a2e;
          border: 2px solid #6D3A6D;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(109, 58, 109, 0.3);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #6D3A6D;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #6D3A6D 0%, #B85C8A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        .receipt-id {
          font-size: 12px;
          color: #888;
          font-family: monospace;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #B85C8A;
          text-transform: uppercase;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #6D3A6D;
        }
        .field-group {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .field-label {
          color: #aaa;
        }
        .field-value {
          font-weight: bold;
          color: #fff;
          text-align: right;
        }
        .match-details {
          background-color: rgba(109, 58, 109, 0.2);
          border-left: 4px solid #B85C8A;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .match-title {
          font-size: 16px;
          font-weight: bold;
          color: #fff;
          margin-bottom: 8px;
        }
        .match-info {
          font-size: 13px;
          color: #ccc;
          margin: 4px 0;
        }
        .price-section {
          background-color: rgba(178, 92, 138, 0.15);
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .price-total {
          border-top: 2px solid #B85C8A;
          padding-top: 8px;
          margin-top: 8px;
          font-weight: bold;
          font-size: 16px;
          color: #B85C8A;
        }
        .footer {
          text-align: center;
          border-top: 1px solid #6D3A6D;
          padding-top: 20px;
          font-size: 12px;
          color: #888;
        }
        .status-confirmed {
          color: #4ade80;
          font-weight: bold;
        }
        .nft-tokens {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .nft-badge {
          background-color: #6D3A6D;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🐾 KittyPaws</div>
          <div style="color: #ccc; margin-bottom: 10px;">Cricket Ticket Purchase Receipt</div>
          <div class="receipt-id">${receiptId}</div>
        </div>

        <div class="section">
          <div class="match-details">
            <div class="match-title">${matchData.team1} vs ${matchData.team2}</div>
            <div class="match-info">📅 ${matchDateFormatted}</div>
            <div class="match-info">📍 ${matchData.venue}</div>
            <div class="match-info">🏏 ${matchData.matchType.toUpperCase()}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Purchase Details</div>
          <div class="field-group">
            <span class="field-label">Ticket Type</span>
            <span class="field-value">${purchaseData.ticketType}</span>
          </div>
          <div class="field-group">
            <span class="field-label">Quantity</span>
            <span class="field-value">${purchaseData.quantity}</span>
          </div>
          <div class="field-group">
            <span class="field-label">Price per Ticket</span>
            <span class="field-value">₨${purchaseData.pricePerTicket.pkr.toLocaleString()} / ${purchaseData.pricePerTicket.wire} WIRE</span>
          </div>
        </div>

        <div class="section">
          <div class="price-section">
            <div class="price-row">
              <span>Subtotal</span>
              <span>₨${purchaseData.totalPrice.pkr.toLocaleString()}</span>
            </div>
            <div class="price-row">
              <span>Equivalent WIRE</span>
              <span>${purchaseData.totalPrice.wire} WIRE</span>
            </div>
            <div class="price-row price-total">
              <span>Total Amount</span>
              <span class="status-confirmed">${purchaseData.totalPrice.wire} WIRE</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Transaction Details</div>
          <div class="field-group">
            <span class="field-label">Transaction Hash</span>
            <span class="field-value" style="font-family: monospace; font-size: 12px;">
              ${transactionHash.slice(0, 20)}...
            </span>
          </div>
          <div class="field-group">
            <span class="field-label">Wallet Address</span>
            <span class="field-value" style="font-family: monospace; font-size: 12px;">
              ${purchaseData.walletAddress.slice(0, 12)}...${purchaseData.walletAddress.slice(-8)}
            </span>
          </div>
          <div class="field-group">
            <span class="field-label">Status</span>
            <span class="field-value status-confirmed">✓ CONFIRMED</span>
          </div>
          <div class="field-group">
            <span class="field-label">Date & Time</span>
            <span class="field-value">${new Date(timestamp).toLocaleString()}</span>
          </div>
          ${nftTokenIds && nftTokenIds.length > 0 ? `
          <div style="margin-top: 12px;">
            <div class="field-label">NFT Token IDs</div>
            <div class="nft-tokens">
              ${nftTokenIds.map((tokenId) => `<div class="nft-badge">#${tokenId}</div>`).join('')}
            </div>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">Customer Information</div>
          <div class="field-group">
            <span class="field-label">Email</span>
            <span class="field-value">${purchaseData.userEmail}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your purchase! Your NFT ticket has been minted to your wallet.</p>
          <p>Keep this receipt for your records. You can download your NFT ticket from your wallet.</p>
          <p>For support: support@kittypaws.com</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // ========== Generate CSV Receipt ==========

    const csvReceipt = `
KittyPaws Cricket Ticket Receipt
Receipt ID,${receiptId}
Date,${new Date(timestamp).toLocaleString()}

Match Information
Teams,${matchData.team1} vs ${matchData.team2}
Date,${matchDateFormatted}
Venue,${matchData.venue}
Match Type,${matchData.matchType}

Purchase Details
Ticket Type,${purchaseData.ticketType}
Quantity,${purchaseData.quantity}
Price per Ticket (PKR),${purchaseData.pricePerTicket.pkr}
Price per Ticket (WIRE),${purchaseData.pricePerTicket.wire}
Total (PKR),${purchaseData.totalPrice.pkr}
Total (WIRE),${purchaseData.totalPrice.wire}

Transaction Details
Transaction Hash,${transactionHash}
Wallet Address,${purchaseData.walletAddress}
Payment Status,CONFIRMED
Email,${purchaseData.userEmail}
${nftTokenIds && nftTokenIds.length > 0 ? `NFT Token IDs,${nftTokenIds.join(';')}` : ''}
    `.trim();

    // ========== Store Receipt in Database ==========

    // In production:
    // INSERT INTO receipts (
    //   receipt_id, transaction_hash, user_email, wallet_address, match_id,
    //   html_content, csv_content, nft_token_ids, status, created_at
    // ) VALUES (
    //   ?, ?, ?, ?, ?, ?, ?, ?, 'generated', NOW()
    // )

    console.log('[Receipt] Generated receipt:', {
      receiptId,
      transactionHash: transactionHash.slice(0, 20) + '...',
      matchId,
      email: purchaseData.userEmail,
      timestamp,
    });

    // ========== Response ==========

    const response: ReceiptResponse = {
      receiptId,
      transactionHash,
      html: htmlReceipt,
      csv: csvReceipt,
      qrCode: qrCode,
      timestamp,
    };

    return NextResponse.json(
      {
        message: 'Receipt generated successfully',
        data: response,
        actions: {
          download_html: `/api/services/receipt/download/${receiptId}?format=html`,
          download_csv: `/api/services/receipt/download/${receiptId}?format=csv`,
          download_pdf: `/api/services/receipt/download/${receiptId}?format=pdf`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Receipt] Generation error:', error);
    return NextResponse.json(
      { message: 'Receipt generation failed' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to generate receipt ID
 */
function generateReceiptId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RCP-${timestamp}-${random}`;
}

/**
 * GET /api/services/receipt/generate
 * Retrieve generated receipt
 */
export async function GET(request: NextRequest) {
  try {
    const receiptId = request.nextUrl.searchParams.get('receiptId');

    if (!receiptId) {
      return NextResponse.json(
        { message: 'Receipt ID is required' },
        { status: 400 }
      );
    }

    // In production: Retrieve from database
    // const receipt = await db.query('SELECT * FROM receipts WHERE receipt_id = ?', [receiptId]);

    return NextResponse.json(
      {
        receiptId,
        status: 'generated',
        message: 'Receipt found',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Receipt] Retrieval error:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve receipt' },
      { status: 500 }
    );
  }
}
