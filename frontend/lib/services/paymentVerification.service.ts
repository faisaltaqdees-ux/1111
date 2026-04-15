/**
 * Payment Verification Service
 * Monitors blockchain transaction status and confirms payments
 * @file frontend/lib/services/paymentVerification.service.ts
 */

import { ethers } from 'ethers';

const WIRE_RPC = 'https://evm.wirefluid.com';
const WIRE_CONFIRMATION_BLOCKS = 6; // Number of blocks to wait for confirmation
const TRANSACTION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

/**
 * Payment verification status
 */
export type PaymentStatus = 'pending' | 'confirming' | 'confirmed' | 'failed' | 'timeout';

/**
 * Payment verification result
 */
export interface PaymentVerificationResult {
  status: PaymentStatus;
  transactionHash: string;
  blockNumber?: number;
  confirmations?: number;
  gasUsed?: string;
  timestamp?: number;
  error?: string;
}

/**
 * Payment Verification Service
 */
class PaymentVerificationService {
  private provider: ethers.JsonRpcProvider;
  private transactionTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.provider = new ethers.JsonRpcProvider(WIRE_RPC);
  }

  /**
   * Verify payment transaction on blockchain
   * @param txHash - Transaction hash to verify
   * @returns Payment verification result
   */
  async verifyPayment(txHash: string): Promise<PaymentVerificationResult> {
    try {
      // Validate transaction hash format
      if (!ethers.isBytesLike(txHash) || (txHash as string).length !== 66) {
        throw new Error('Invalid transaction hash format');
      }

      // Get transaction receipt
      const receipt = await this.provider.getTransactionReceipt(txHash);

      // Transaction not yet mined
      if (!receipt) {
        return {
          status: 'pending',
          transactionHash: txHash,
          error: 'Transaction not yet mined',
        };
      }

      // Transaction failed
      if (receipt.status === 0) {
        return {
          status: 'failed',
          transactionHash: txHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          timestamp: Date.now(),
          error: 'Transaction reverted on blockchain',
        };
      }

      // Get current block number for confirmation count
      const currentBlockNumber = await this.provider.getBlockNumber();
      const confirmations = currentBlockNumber - receipt.blockNumber;

      // Check if transaction has enough confirmations
      if (confirmations < WIRE_CONFIRMATION_BLOCKS) {
        return {
          status: 'confirming',
          transactionHash: txHash,
          blockNumber: receipt.blockNumber,
          confirmations: confirmations,
          timestamp: Date.now(),
        };
      }

      // Transaction confirmed
      return {
        status: 'confirmed',
        transactionHash: txHash,
        blockNumber: receipt.blockNumber,
        confirmations: confirmations,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('[PaymentVerification] Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Poll transaction status until confirmed or timeout
   * @param txHash - Transaction hash to monitor
   * @param onStatusChange - Callback for status updates
   * @param maxWaitTime - Maximum time to wait in milliseconds
   * @returns Final payment verification result
   */
  async pollTransactionStatus(
    txHash: string,
    onStatusChange?: (result: PaymentVerificationResult) => void,
    maxWaitTime: number = TRANSACTION_TIMEOUT
  ): Promise<PaymentVerificationResult> {
    const startTime = Date.now();
    const pollInterval = 3000; // Poll every 3 seconds

    return new Promise((resolve) => {
      const poll = async () => {
        try {
          const result = await this.verifyPayment(txHash);

          // Call status change callback
          if (onStatusChange) {
            onStatusChange(result);
          }

          // If confirmed or failed, stop polling
          if (
            result.status === 'confirmed' ||
            result.status === 'failed'
          ) {
            this.clearTimeout(txHash);
            resolve(result);
            return;
          }

          // Check timeout
          if (Date.now() - startTime > maxWaitTime) {
            this.clearTimeout(txHash);
            resolve({
              status: 'timeout',
              transactionHash: txHash,
              error: `Transaction verification timed out after ${maxWaitTime / 1000} seconds`,
              timestamp: Date.now(),
            });
            return;
          }

          // Continue polling
          const timeout = setTimeout(poll, pollInterval);
          this.transactionTimeouts.set(txHash, timeout);
        } catch (error) {
          console.error('[PaymentVerification] Polling error:', error);
          this.clearTimeout(txHash);
          resolve({
            status: 'failed',
            transactionHash: txHash,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now(),
          });
        }
      };

      const timeout = setTimeout(poll, 0);
      this.transactionTimeouts.set(txHash, timeout);
    });
  }

  /**
   * Clear polling timeout for transaction
   */
  private clearTimeout(txHash: string): void {
    const timeout = this.transactionTimeouts.get(txHash);
    if (timeout) {
      clearTimeout(timeout);
      this.transactionTimeouts.delete(txHash);
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(txHash: string) {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!tx) {
        throw new Error('Transaction not found');
      }

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
        gasLimit: tx.gasLimit.toString(),
        nonce: tx.nonce,
        blockNumber: receipt?.blockNumber,
        status: receipt?.status,
        gasUsed: receipt?.gasUsed ? receipt.gasUsed.toString() : undefined,
        timestamp: receipt ? Date.now() : undefined,
      };
    } catch (error) {
      console.error('[PaymentVerification] Error getting transaction details:', error);
      throw error;
    }
  }

  /**
   * Check if address is valid
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Get current block number
   */
  async getCurrentBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  /**
   * Get gas price estimate
   */
  async getGasPrice(): Promise<string> {
    const gasPrice = await this.provider.getFeeData();
    return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
  }
}

// Export singleton instance
export const paymentVerificationService = new PaymentVerificationService();
