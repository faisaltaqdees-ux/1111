/**
 * QR Code Service
 * Generates QR codes for ticket verification
 * @file frontend/lib/services/qrCode.service.ts
 */

/**
 * QR Code data structure
 */
export interface QRCodeData {
  ticketId: string;
  matchId: string;
  userEmail: string;
  walletAddress: string;
  matchDate: string;
  amount: number;
  currency: string;
  transactionHash: string;
  nftTokenId?: string;
  timestamp: string;
}

/**
 * QR Code generation result
 */
export interface QRCodeResult {
  dataUri: string;
  text: string;
  size: number;
  generated: string;
}

/**
 * QR Code Service
 * Uses QR Code generation library (qrcode.js)
 */
class QRCodeService {
  private qrCodeLibrary: any = null;

  /**
   * Initialize QR Code library
   */
  async initialize(): Promise<void> {
    if (this.qrCodeLibrary) return;

    try {
      // Dynamically import qrcode library
      const qrcode = await import('qrcode');
      this.qrCodeLibrary = qrcode;
    } catch (error) {
      console.warn('[QRCode] qrcode library not found, using fallback');
      // Fallback to built-in implementation
    }
  }

  /**
   * Generate QR code for ticket
   * @param data - Ticket data to encode
   * @returns QR code data URI
   */
  async generateTicketQRCode(data: QRCodeData): Promise<QRCodeResult> {
    try {
      await this.initialize();

      // Create JSON string of ticket data
      const ticketJSON = JSON.stringify(data);

      if (this.qrCodeLibrary) {
        // Use QR code library if available
        const dataUri = await this.qrCodeLibrary.default.toDataURL(ticketJSON, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          quality: 0.95,
          margin: 2,
          width: 300,
          color: {
            dark: '#6D3A6D', // paws-mauve
            light: '#FFFFFF',
          },
        });

        return {
          dataUri,
          text: ticketJSON,
          size: 300,
          generated: new Date().toISOString(),
        };
      }

      // Fallback: Return base64 encoded data (development)
      const base64Data = Buffer.from(ticketJSON).toString('base64');
      return {
        dataUri: `data:text/plain;base64,${base64Data}`,
        text: ticketJSON,
        size: 300,
        generated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[QRCode] Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Generate simple QR code text (fallback)
   * @param text - Text to encode
   * @returns Data URI
   */
  async generateSimpleQRCode(text: string): Promise<string> {
    try {
      await this.initialize();

      if (this.qrCodeLibrary) {
        return this.qrCodeLibrary.default.toDataURL(text, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          width: 200,
        });
      }

      // Fallback
      return `data:text/plain;base64,${Buffer.from(text).toString('base64')}`;
    } catch (error) {
      console.error('[QRCode] Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Validate QR code data
   */
  async validateQRCodeData(data: QRCodeData): Promise<boolean> {
    try {
      // Validate required fields
      const requiredFields = [
        'ticketId',
        'matchId',
        'userEmail',
        'walletAddress',
        'matchDate',
        'amount',
        'currency',
        'transactionHash',
        'timestamp',
      ];

      for (const field of requiredFields) {
        if (!data[field as keyof QRCodeData]) {
          console.warn(`[QRCode] Missing required field: ${field}`);
          return false;
        }
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.userEmail)) {
        console.warn('[QRCode] Invalid email format');
        return false;
      }

      // Validate wallet address (Ethereum format)
      if (!/^0x[a-fA-F0-9]{40}$/.test(data.walletAddress)) {
        console.warn('[QRCode] Invalid wallet address format');
        return false;
      }

      // Validate transaction hash
      if (!/^0x[a-fA-F0-9]{64}$/.test(data.transactionHash)) {
        console.warn('[QRCode] Invalid transaction hash format');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[QRCode] Error validating QR code data:', error);
      return false;
    }
  }

  /**
   * Parse QR code data (for scanning)
   */
  parseQRCodeData(json: string): QRCodeData | null {
    try {
      return JSON.parse(json) as QRCodeData;
    } catch (error) {
      console.error('[QRCode] Error parsing QR code data:', error);
      return null;
    }
  }
}

// Export singleton instance
export const qrCodeService = new QRCodeService();
