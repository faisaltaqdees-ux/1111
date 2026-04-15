/**
 * Verify WIRE Token Transfer on WireFluid Testnet
 * Checks blockchain to confirm user sent tokens to payment address
 * 
 * Chain: WireFluid Testnet (Chain ID: 92533)
 * RPC: https://rpc.wirefluid.io
 */

import { ethers } from 'ethers';

// Configuration
const WIREFLUID_RPC = 'https://rpc.wirefluid.io';
const PAYMENT_ADDRESS = '0x85edFCCff20a3617FaD9E69EEe69b196640627E4';
const CHAIN_ID = 92533;

interface TransferVerificationResult {
  verified: boolean;
  transactionHash: string;
  from: string;
  to: string;
  amount: string;
  value: string; // In WIRE
  blockNumber?: number;
  confirmations?: number;
  timestamp?: number;
  error?: string;
}

/**
 * Verify that a WIRE token transfer actually occurred on blockchain
 * 
 * @param txHash - Transaction hash to verify (0x format)
 * @param expectedFrom - Expected sender wallet address
 * @param expectedAmount - Expected amount in WIRE tokens
 * @returns Verification result with transaction details
 */
export async function verifyWireTransfer(
  txHash: string,
  expectedFrom: string,
  expectedAmount: number
): Promise<TransferVerificationResult> {
  try {
    // Validate inputs
    if (!txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return {
        verified: false,
        transactionHash: txHash,
        from: '',
        to: '',
        amount: '0',
        value: '0',
        error: 'Invalid transaction hash format',
      };
    }

    if (!expectedFrom.match(/^0x[a-fA-F0-9]{40}$/)) {
      return {
        verified: false,
        transactionHash: txHash,
        from: '',
        to: '',
        amount: '0',
        value: '0',
        error: 'Invalid sender address format',
      };
    }

    // Connect to WireFluid RPC
    const provider = new ethers.JsonRpcProvider(WIREFLUID_RPC);

    // Fetch transaction details
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      return {
        verified: false,
        transactionHash: txHash,
        from: '',
        to: '',
        amount: '0',
        value: '0',
        error: 'Transaction not found on blockchain',
      };
    }

    // Get receipt for confirmations
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return {
        verified: false,
        transactionHash: txHash,
        from: tx.from || '',
        to: tx.to || '',
        amount: '0',
        value: ethers.formatEther(tx.value),
        error: 'Transaction receipt not found (may still be pending)',
      };
    }

    // Check if transaction failed
    if (receipt.status === 0) {
      return {
        verified: false,
        transactionHash: txHash,
        from: tx.from || '',
        to: tx.to || '',
        amount: '0',
        value: ethers.formatEther(tx.value),
        error: 'Transaction failed on blockchain',
      };
    }

    // Verify sender address (case-insensitive)
    const senderMatches =
      (tx.from || '').toLowerCase() === expectedFrom.toLowerCase();

    if (!senderMatches) {
      return {
        verified: false,
        transactionHash: txHash,
        from: tx.from || '',
        to: tx.to || '',
        amount: '0',
        value: ethers.formatEther(tx.value),
        error: `Sender address mismatch. Expected: ${expectedFrom}, Got: ${tx.from}`,
      };
    }

    // Verify recipient address (case-insensitive)
    const recipientMatches =
      (tx.to || '').toLowerCase() === PAYMENT_ADDRESS.toLowerCase();

    if (!recipientMatches) {
      return {
        verified: false,
        transactionHash: txHash,
        from: tx.from || '',
        to: tx.to || '',
        amount: '0',
        value: ethers.formatEther(tx.value),
        error: `Recipient address mismatch. Expected: ${PAYMENT_ADDRESS}, Got: ${tx.to}`,
      };
    }

    // Convert transferred amount from wei to WIRE
    const transferredAmount = Number(ethers.formatEther(tx.value));

    // Verify amount (allow 0.01 WIRE tolerance for gas calculations)
    const amountTolerance = 0.01;
    const amountMatches =
      transferredAmount >= expectedAmount - amountTolerance &&
      transferredAmount <= expectedAmount + amountTolerance;

    if (!amountMatches) {
      return {
        verified: false,
        transactionHash: txHash,
        from: tx.from || '',
        to: tx.to || '',
        amount: transferredAmount.toString(),
        value: ethers.formatEther(tx.value),
        error: `Amount mismatch. Expected: ${expectedAmount} WIRE, Got: ${transferredAmount} WIRE`,
      };
    }

    // Get current block for confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;

    // Get block timestamp
    const block = await provider.getBlock(receipt.blockNumber);
    const timestamp = block?.timestamp;

    // All checks passed!
    return {
      verified: true,
      transactionHash: txHash,
      from: tx.from || '',
      to: tx.to || '',
      amount: transferredAmount.toString(),
      value: ethers.formatEther(tx.value),
      blockNumber: receipt.blockNumber,
      confirmations,
      timestamp,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown verification error';

    return {
      verified: false,
      transactionHash: txHash,
      from: '',
      to: '',
      amount: '0',
      value: '0',
      error: `Verification failed: ${errorMessage}`,
    };
  }
}

/**
 * Check if transfer has required confirmations
 * @param confirmations - Number of confirmations
 * @param requiredConfirmations - Minimum confirmations needed (default: 3)
 */
export function hasEnoughConfirmations(
  confirmations: number | undefined,
  requiredConfirmations = 3
): boolean {
  return (confirmations || 0) >= requiredConfirmations;
}

/**
 * Format verification result for API response
 */
export function formatVerificationResponse(
  result: TransferVerificationResult
): object {
  return {
    verified: result.verified,
    transactionHash: result.transactionHash,
    from: result.from,
    to: result.to,
    amount: result.amount,
    value: result.value,
    blockNumber: result.blockNumber,
    confirmations: result.confirmations,
    timestamp: result.timestamp,
    status: result.verified ? 'confirmed' : 'failed',
    error: result.error,
  };
}
