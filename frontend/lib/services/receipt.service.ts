/**
 * Receipt Generation Service
 * Generates digital receipts for ticket purchases
 * @file frontend/lib/services/receipt.service.ts
 */

/**
 * Receipt structure
 */
export interface Receipt {
  receiptId: string;
  transactionHash: string;
  userEmail: string;
  walletAddress: string;
  matchId: string;
  team1: string;
  team2: string;
  matchDate: string;
  matchVenue: string;
  matchType: string;
  ticketType: string;
  quantity: number;
  pricePerTicket: {
    pkr: number;
    wire: number;
  };
  totalPrice: {
    pkr: number;
    wire: number;
  };
  nftTokenIds: string[];
  qrCode: string;
  paymentMethod: string; // 'wire_token' | 'credit_card' | 'fiat'
  paymentStatus: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  expiryDate?: string;
  notes?: string;
}

/**
 * Receipt Generation Service
 */
class ReceiptService {
  /**
   * Generate receipt for ticket purchase
   */
  generateReceipt(
    transactionHash: string,
    userEmail: string,
    walletAddress: string,
    matchId: string,
    team1: string,
    team2: string,
    matchDate: string,
    matchVenue: string,
    matchType: string,
    ticketType: string,
    quantity: number,
    pricePerTicket: { pkr: number; wire: number },
    nftTokenIds: string[] = [],
    qrCode: string = '',
    notes?: string
  ): Receipt {
    const receiptId = this.generateReceiptId();
    const timestamp = new Date().toISOString();

    // Calculate total price
    const totalPrice = {
      pkr: pricePerTicket.pkr * quantity,
      wire: pricePerTicket.wire * quantity,
    };

    // Calculate expiry date (typically 365 days for cricket tickets)
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const receipt: Receipt = {
      receiptId,
      transactionHash,
      userEmail,
      walletAddress,
      matchId,
      team1,
      team2,
      matchDate,
      matchVenue,
      matchType: matchType.toUpperCase(),
      ticketType: ticketType.charAt(0).toUpperCase() + ticketType.slice(1),
      quantity,
      pricePerTicket,
      totalPrice,
      nftTokenIds,
      qrCode,
      paymentMethod: 'wire_token',
      paymentStatus: 'confirmed',
      timestamp,
      expiryDate,
      notes,
    };

    return receipt;
  }

  /**
   * Generate receipt ID
   */
  private generateReceiptId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RCP-${timestamp}-${random}`;
  }

  /**
   * Format receipt as HTML for email or display
   */
  formatReceiptHTML(receipt: Receipt): string {
    const matchDateFormatted = new Date(receipt.matchDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
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
        .qr-code {
          text-align: center;
          margin: 20px 0;
        }
        .qr-code img {
          max-width: 200px;
          border: 2px solid #6D3A6D;
          padding: 10px;
          background-color: #fff;
          border-radius: 8px;
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
          <div class="receipt-id">${receipt.receiptId}</div>
        </div>

        <div class="section">
          <div class="match-details">
            <div class="match-title">${receipt.team1} vs ${receipt.team2}</div>
            <div class="match-info">📅 ${matchDateFormatted}</div>
            <div class="match-info">📍 ${receipt.matchVenue}</div>
            <div class="match-info">🏏 ${receipt.matchType}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Purchase Details</div>
          <div class="field-group">
            <span class="field-label">Ticket Type</span>
            <span class="field-value">${receipt.ticketType}</span>
          </div>
          <div class="field-group">
            <span class="field-label">Quantity</span>
            <span class="field-value">${receipt.quantity}</span>
          </div>
          <div class="field-group">
            <span class="field-label">Price per Ticket</span>
            <span class="field-value">₨${receipt.pricePerTicket.pkr.toLocaleString()} / ${receipt.pricePerTicket.wire} WIRE</span>
          </div>
        </div>

        <div class="section">
          <div class="price-section">
            <div class="price-row">
              <span>Subtotal</span>
              <span>₨${receipt.totalPrice.pkr.toLocaleString()}</span>
            </div>
            <div class="price-row">
              <span>Equivalent WIRE</span>
              <span>${receipt.totalPrice.wire} WIRE</span>
            </div>
            <div class="price-row price-total">
              <span>Total Amount</span>
              <span class="status-confirmed">${receipt.totalPrice.wire} WIRE</span>
            </div>
          </div>
        </div>

        ${receipt.qrCode ? `
        <div class="section">
          <div class="qr-code">
            <img src="${receipt.qrCode}" alt="Ticket QR Code">
            <div style="margin-top: 8px; font-size: 12px; color: #888;">Scan to verify ticket</div>
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Transaction Details</div>
          <div class="field-group">
            <span class="field-label">Transaction Hash</span>
            <span class="field-value" style="font-family: monospace; font-size: 12px;">
              ${receipt.transactionHash.slice(0, 20)}...
            </span>
          </div>
          <div class="field-group">
            <span class="field-label">Wallet Address</span>
            <span class="field-value" style="font-family: monospace; font-size: 12px;">
              ${receipt.walletAddress.slice(0, 12)}...${receipt.walletAddress.slice(-8)}
            </span>
          </div>
          <div class="field-group">
            <span class="field-label">Status</span>
            <span class="field-value status-confirmed">✓ ${receipt.paymentStatus.toUpperCase()}</span>
          </div>
          <div class="field-group">
            <span class="field-label">Date & Time</span>
            <span class="field-value">${new Date(receipt.timestamp).toLocaleString()}</span>
          </div>
          ${receipt.nftTokenIds.length > 0 ? `
          <div style="margin-top: 12px;">
            <div class="field-label">NFT Token IDs</div>
            <div class="nft-tokens">
              ${receipt.nftTokenIds.map((tokenId) => `<div class="nft-badge">#${tokenId}</div>`).join('')}
            </div>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">Ticket Information</div>
          <div class="field-group">
            <span class="field-label">Email</span>
            <span class="field-value">${receipt.userEmail}</span>
          </div>
          ${receipt.expiryDate ? `
          <div class="field-group">
            <span class="field-label">Ticket Expiry</span>
            <span class="field-value">${new Date(receipt.expiryDate).toLocaleDateString()}</span>
          </div>
          ` : ''}
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

    return html;
  }

  /**
   * Format receipt for CSV export
   */
  formatReceiptCSV(receipt: Receipt): string {
    const lines = [
      'KittyPaws Cricket Ticket Receipt',
      'Receipt ID,' + receipt.receiptId,
      'Date,' + new Date(receipt.timestamp).toLocaleString(),
      '',
      'Match Information',
      'Teams,' + receipt.team1 + ' vs ' + receipt.team2,
      'Date,' + new Date(receipt.matchDate).toLocaleString(),
      'Venue,' + receipt.matchVenue,
      'Match Type,' + receipt.matchType,
      '',
      'Purchase Details',
      'Ticket Type,' + receipt.ticketType,
      'Quantity,' + receipt.quantity,
      'Price per Ticket (PKR),' + receipt.pricePerTicket.pkr,
      'Price per Ticket (WIRE),' + receipt.pricePerTicket.wire,
      'Total (PKR),' + receipt.totalPrice.pkr,
      'Total (WIRE),' + receipt.totalPrice.wire,
      '',
      'Transaction Details',
      'Transaction Hash,' + receipt.transactionHash,
      'Wallet Address,' + receipt.walletAddress,
      'Payment Status,' + receipt.paymentStatus,
      'Email,' + receipt.userEmail,
      ...(receipt.nftTokenIds.length > 0 ? [
        '',
        'NFT Token IDs,' + receipt.nftTokenIds.join(';'),
      ] : []),
    ];

    return lines.join('\n');
  }

  /**
   * Save receipt to storage (localStorage or IndexedDB)
   */
  async saveReceipt(receipt: Receipt): Promise<void> {
    try {
      // Save to localStorage
      const key = `receipt_${receipt.receiptId}`;
      localStorage.setItem(key, JSON.stringify(receipt));

      // Also save to IndexedDB for better reliability
      if ('indexedDB' in window) {
        const db = await this.openIndexedDB();
        const transaction = db.transaction('receipts', 'readwrite');
        const store = transaction.objectStore('receipts');
        await store.put(receipt);
      }
    } catch (error) {
      console.error('[Receipt] Error saving receipt:', error);
      throw error;
    }
  }

  /**
   * Retrieve receipt from storage
   */
  async getReceipt(receiptId: string): Promise<Receipt | null> {
    try {
      // Try localStorage first
      const key = `receipt_${receiptId}`;
      const data = localStorage.getItem(key);

      if (data) {
        return JSON.parse(data) as Receipt;
      }

      // Try IndexedDB
      if ('indexedDB' in window) {
        const db = await this.openIndexedDB();
        const transaction = db.transaction('receipts', 'readonly');
        const store = transaction.objectStore('receipts');
        const result = await new Promise<Receipt | null>((resolve) => {
          const request = store.get(receiptId);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        });
        if (result) return result;
      }

      return null;
    } catch (error) {
      console.error('[Receipt] Error retrieving receipt:', error);
      return null;
    }
  }

  /**
   * Open IndexedDB connection
   */
  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('KittyPaws', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        
        // Create object store if not exists
        if (!db.objectStoreNames.contains('receipts')) {
          db.createObjectStore('receipts', { keyPath: 'receiptId' });
        }

        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('receipts')) {
          db.createObjectStore('receipts', { keyPath: 'receiptId' });
        }
      };
    });
  }
}

// Export singleton instance
export const receiptService = new ReceiptService();
