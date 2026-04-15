/**
 * Payment Integration & Local Ramps
 * Pakistan-specific payment methods: JazzCash, EasyPaisa, UPI, HBL Wallet
 * All ramps convert PKR/local → WIRE (WireFluid testnet)
 */

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  country: string;
  minAmount: number; // PKR or local
  maxAmount: number;
  fee: number; // Percentage
  processingTime: string;
  walletAddress?: string; // For merchant
}

export interface Transaction {
  id: string;
  userId: string;
  method: PaymentMethod;
  amountLocal: number; // PKR
  amountWire: number; // Converted to WIRE
  wireAddress: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  wirefluidTxHash?: string;
}

/**
 * Exchange Rate: Dynamic (in production: fetch from oracle)
 * Current simulated: 1 PKR = 0.0001 WIRE (adjust as needed)
 */
const EXCHANGE_RATE = 0.00008; // 1 PKR = 0.00008 WIRE

/**
 * Available Payment Methods for Pakistan
 */
export const PAKISTAN_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'jazzcash',
    name: 'JazzCash',
    icon: '📱',
    country: 'Pakistan',
    minAmount: 100,
    maxAmount: 500000,
    fee: 2.5,
    processingTime: 'Instant',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678', // Merchant wallet
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    icon: '💳',
    country: 'Pakistan',
    minAmount: 100,
    maxAmount: 500000,
    fee: 2.0,
    processingTime: 'Instant',
    walletAddress: '0x2345678901bcdef2345678901bcdef2345678901',
  },
  {
    id: 'hblwallet',
    name: 'HBL Wallet',
    icon: '🏦',
    country: 'Pakistan',
    minAmount: 500,
    maxAmount: 1000000,
    fee: 1.5,
    processingTime: 'Instant',
    walletAddress: '0x3456789012cdef3456789012cdef3456789012c',
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: '₹',
    country: 'India',
    minAmount: 50,
    maxAmount: 100000,
    fee: 2.0,
    processingTime: 'Instant',
    walletAddress: '0x456789012cdef456789012cdef456789012cde',
  },
];

/**
 * Calculate WIRE amount from local currency
 */
export function calculateWireAmount(localAmount: number, feePercentage: number): number {
  const afterFee = localAmount * (1 - feePercentage / 100);
  const wireAmount = afterFee * EXCHANGE_RATE;
  return Math.floor(wireAmount * 1000000) / 1000000; // 6 decimals
}

/**
 * Get payment method by ID
 */
export function getPaymentMethod(methodId: string): PaymentMethod | undefined {
  return PAKISTAN_PAYMENT_METHODS.find((m) => m.id === methodId);
}

/**
 * Process payment through WireFluid
 * In production: backend handles actual transfer
 * For hackathon: simulated with localStorage + mock WireFluid RPC
 */
export async function processPayment(
  userId: string,
  methodId: string,
  amount: number,
  destinationWallet: string
): Promise<Transaction> {
  console.log('💳 [Payment] Processing:', { userId, methodId, amount, destination: destinationWallet });

  const method = getPaymentMethod(methodId);
  if (!method) {
    throw new Error('Invalid payment method');
  }

  if (amount < method.minAmount || amount > method.maxAmount) {
    throw new Error(`Amount must be between ${method.minAmount} and ${method.maxAmount} ${method.country === 'Pakistan' ? 'PKR' : 'INR'}`);
  }

  const wireAmount = calculateWireAmount(amount, method.fee);

  const transaction: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    method,
    amountLocal: amount,
    amountWire: wireAmount,
    wireAddress: destinationWallet,
    status: 'processing',
    timestamp: Date.now(),
  };

  try {
    // Step 1: Simulate local payment gateway
    console.log(`🔵 [Payment] Initiating ${method.name} transfer for ${amount} PKR/INR`);
    await simulateLocalPaymentGateway(methodId, amount);

    // Step 2: Call WireFluid blockchain
    console.log(`🔵 [Payment] Transferring ${wireAmount} WIRE on WireFluid testnet`);
    const txHash = await transferOnWireFluid(
      method.walletAddress || '',
      destinationWallet,
      wireAmount
    );

    transaction.status = 'completed';
    transaction.wirefluidTxHash = txHash;

    console.log('✅ [Payment] Transaction completed:', transaction.id);

    // Store transaction record
    const transactions = JSON.parse(localStorage.getItem('pslpulse_transactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('pslpulse_transactions', JSON.stringify(transactions));

    return transaction;
  } catch (err) {
    console.error('❌ [Payment] Transaction failed:', err);
    transaction.status = 'failed';
    throw err;
  }
}

/**
 * Simulate local payment gateway interaction
 * In production: actual API calls to JazzCash, EasyPaisa, etc.
 */
async function simulateLocalPaymentGateway(methodId: string, amount: number): Promise<void> {
  return new Promise((resolve) => {
    // Simulate 0.5s processing delay
    setTimeout(() => {
      console.log(`✅ [${methodId.toUpperCase()}] Payment gateway approved: ${amount}`);
      resolve();
    }, 500);
  });
}

/**
 * Transfer funds on WireFluid blockchain
 * In production: actual ethers.js contract call
 */
async function transferOnWireFluid(
  fromAddress: string,
  toAddress: string,
  wireAmount: number
): Promise<string> {
  console.log('🔵 [WireFluid] Initiating transfer:', {
    from: fromAddress,
    to: toAddress,
    amount: wireAmount,
    chainId: 92533,
  });

  // Simulate blockchain delay + confirmation
  return new Promise((resolve) => {
    setTimeout(() => {
      const txHash = `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`;
      console.log('✅ [WireFluid] Transfer confirmed on testnet:', txHash);
      resolve(txHash);
    }, 2000);
  });
}

/**
 * Get transaction history for user
 */
export function getUserTransactions(userId: string): Transaction[] {
  const all = JSON.parse(localStorage.getItem('pslpulse_transactions') || '[]') as Transaction[];
  return all.filter((tx) => tx.userId === userId);
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: 'PKR' | 'INR' | 'WIRE' = 'PKR'): string {
  if (currency === 'WIRE') {
    return `${amount.toFixed(6)} WIRE`;
  }
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validate payment method for user
 */
export function validatePaymentMethod(method: PaymentMethod, amount: number): string | null {
  if (amount < method.minAmount) {
    return `Minimum amount is ${formatAmount(method.minAmount)}`;
  }
  if (amount > method.maxAmount) {
    return `Maximum amount is ${formatAmount(method.maxAmount)}`;
  }
  return null;
}
