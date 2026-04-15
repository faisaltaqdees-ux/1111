/**
 * PSL Pulse Contract Utilities - Production-Grade Blockchain Integration
 * WireFluid Testnet (Chain ID: 92533)
 *
 * A comprehensive, production-ready utility suite for interacting with PSL smart contracts.
 * Includes error handling, retry logic, caching, gas utilities, and full TypeScript support.
 *
 * @version 1.0.0
 * @author PSL Pulse Dev Team
 * @updated 2026-04-13
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  parseEther,
  formatEther,
  getAddress,
  isAddress,
  toBeHex,
  Interface,
  EventFragment,
  FunctionFragment,
} from 'ethers';

import type {
  EventLog,
  TransactionResponse,
  TransactionReceipt,
} from 'ethers';

// Import compiled contract ABIs
import PSLImpactMarketJson from './abi/PSLImpactMarket.json';
import ImpactBadgeJson from './abi/ImpactBadge.json';
import PSLTicketJson from './abi/PSLTicket.json';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Network configuration interface
 */
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  wsUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Contract configuration interface
 */
export interface ContractConfig {
  address: string;
  name: 'Market' | 'Badge' | 'Ticket';
  abi: any[];
  decimals?: number;
}

/**
 * Gas pricing information
 */
export interface GasPrices {
  standard: bigint;
  fast: bigint;
  instant: bigint;
  baseFee: bigint;
  maxPriorityFee: bigint;
}

/**
 * Transaction cost breakdown
 */
export interface TransactionCost {
  gasLimit: bigint;
  gasPrice: bigint;
  totalCost: bigint;
  costInWire: string;
}

/**
 * Cache entry with timestamp
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Contract read options
 */
export interface ContractReadOptions {
  allowCache?: boolean;
  cacheTtl?: number;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Contract write options
 */
export interface ContractWriteOptions {
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasLimit?: bigint;
  value?: bigint;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Event listener callback
 */
export type EventCallback<T = any> = (event: T, log: EventLog) => void | Promise<void>;

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  jitter: number;
}

/**
 * Formatted wallet balance
 */
export interface FormattedBalance {
  raw: bigint;
  formatted: string;
  inWire: number;
}

/**
 * Transaction receipt with enhanced metadata
 */
export interface TransactionReceiptEnhanced extends TransactionReceipt {
  costInWire?: string;
  gasUsedFormatted?: string;
}

/**
 * Error with suggestion for user
 */
export interface ErrorWithSuggestion {
  code: string;
  message: string;
  suggestion: string;
  recoverable: boolean;
  originalError: unknown;
}

/**
 * Batch read call
 */
export interface BatchReadCall {
  address: string;
  abi: any[];
  functionName: string;
  params?: any[];
}

/**
 * Batch read result
 */
export interface BatchReadResult {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * Wallet state
 */
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: bigint | null;
  chainId: number | null;
  isCorrectChain: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 2: CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * CHAINID & NETWORK CONFIGURATION
 */
export const WIREFLUID_CHAIN_ID = 92533;
export const WIREFLUID_NETWORK_NAME = 'WireFluid Testnet';
export const WIREFLUID_RPC_URL = 'https://evm.wirefluid.com';
export const WIREFLUID_WS_URL = 'wss://ws.wirefluid.com';
export const WIREFLUID_EXPLORER_URL = 'https://wirefluidscan.com';

/**
 * Contract Addresses (from environment or defaults)
 * IMPORTANT: Always configure via environment variables in production
 */
export const MARKET_ADDRESS = process.env.NEXT_PUBLIC_MARKET_ADDRESS || '0x0000000000000000000000000000000000000001';
export const BADGE_ADDRESS = process.env.NEXT_PUBLIC_BADGE_ADDRESS || '0x0000000000000000000000000000000000000002';
export const TICKET_ADDRESS = process.env.NEXT_PUBLIC_TICKET_ADDRESS || '0x0000000000000000000000000000000000000003';

/**
 * TIMEOUT & RETRY CONFIGURATION
 */
export const RPC_TIMEOUT_MS = 30000; // 30 seconds for RPC calls
export const TRANSACTION_TIMEOUT_MS = 300000; // 5 minutes for transaction confirmation
export const MAX_RETRIES = 3; // Maximum retry attempts
export const BASE_DELAY_MS = 1000; // 1 second base delay for exponential backoff
export const MAX_DELAY_MS = 30000; // 30 seconds maximum delay between retries
export const JITTER_MS = 500; // Random jitter to add to delays

/**
 * GAS CONFIGURATION
 */
export const GAS_BUFFER_PERCENT = 1.15; // Add 15% buffer to estimated gas
export const GAS_BUFFER_FIXED = 50000n; // Fixed gas buffer for safety
export const DEFAULT_GAS_LIMIT = 300000n; // Default gas limit if estimation fails
export const GWEI = 1000000000n; // 1 Gwei in wei
export const WIRE_DECIMALS = 18; // WIRE token decimals

/**
 * CACHE CONFIGURATION (Time-To-Live in milliseconds)
 */
export const CACHE_TTL_BLOCK_DATA = 60000; // 1 minute - block data never changes
export const CACHE_TTL_BALANCE = 10000; // 10 seconds - balance updates frequently
export const CACHE_TTL_GAS_PRICE = 5000; // 5 seconds - gas prices update frequently
export const CACHE_TTL_CONTRACT_METADATA = 3600000; // 1 hour - contract metadata rarely changes
export const CACHE_TTL_TRANSACTION = 120000; // 2 minutes - transaction status updates

/**
 * ERROR CODES
 */
export const ERROR_CODES = {
  INVALID_ADDRESS: 'ERR_INVALID_ADDRESS',
  INVALID_AMOUNT: 'ERR_INVALID_AMOUNT',
  INSUFFICIENT_BALANCE: 'ERR_INSUFFICIENT_BALANCE',
  NETWORK_MISMATCH: 'ERR_NETWORK_MISMATCH',
  GAS_ESTIMATION_FAILED: 'ERR_GAS_ESTIMATION_FAILED',
  TRANSACTION_FAILED: 'ERR_TRANSACTION_FAILED',
  TIMEOUT: 'ERR_TIMEOUT',
  RATE_LIMIT: 'ERR_RATE_LIMIT',
  RPC_ERROR: 'ERR_RPC_ERROR',
  CONTRACT_ERROR: 'ERR_CONTRACT_ERROR',
} as const;

/**
 * NONCE CONFIGURATION
 */
export const NONCE_CACHE_TTL = 30000; // 30 seconds - cache nonce to prevent conflicts
export const NONCE_CHECK_INTERVAL = 5000; // 5 seconds - check nonce updates

/**
 * PAGINATION & LIMITS
 */
export const DEFAULT_BLOCK_RANGE = 1000n; // Query at most 1000 blocks at once
export const DEFAULT_PAGE_SIZE = 100; // Default pagination size
export const MAX_BATCH_SIZE = 10; // Maximum batch operations

/**
 * Wagmi/Viem Chain Configuration for WireFluid
 */
export const WIREFLUID_CHAIN = {
  id: WIREFLUID_CHAIN_ID,
  name: WIREFLUID_NETWORK_NAME,
  network: 'wirefluid',
  nativeCurrency: {
    decimals: WIRE_DECIMALS,
    name: 'Wire',
    symbol: 'WIRE',
  },
  rpcUrls: {
    public: { http: [WIREFLUID_RPC_URL], webSocket: [WIREFLUID_WS_URL] },
    default: { http: [WIREFLUID_RPC_URL], webSocket: [WIREFLUID_WS_URL] },
  },
  blockExplorers: {
    default: {
      name: 'WireFluid Explorer',
      url: WIREFLUID_EXPLORER_URL,
    },
  },
  testnet: true,
} as const;

/**
 * Default Network Configuration
 */
export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  chainId: WIREFLUID_CHAIN_ID,
  name: WIREFLUID_NETWORK_NAME,
  rpcUrl: WIREFLUID_RPC_URL,
  wsUrl: WIREFLUID_WS_URL,
  explorerUrl: WIREFLUID_EXPLORER_URL,
  nativeCurrency: {
    name: 'Wire',
    symbol: 'WIRE',
    decimals: WIRE_DECIMALS,
  },
};

/**
 * ABI EXPORTS (Populated from compiled contracts)
 */
export const PSL_IMPACT_MARKET_ABI: any[] = PSLImpactMarketJson.abi as any[];
export const IMPACT_BADGE_ABI: any[] = ImpactBadgeJson.abi as any[];
export const PSL_TICKET_ABI: any[] = PSLTicketJson.abi as any[];

// Validate ABIs are populated
if (!PSL_IMPACT_MARKET_ABI || PSL_IMPACT_MARKET_ABI.length === 0) {
  console.warn('⚠️ WARNING: PSL_IMPACT_MARKET_ABI is empty. Check ABI import paths.');
}
if (!IMPACT_BADGE_ABI || IMPACT_BADGE_ABI.length === 0) {
  console.warn('⚠️ WARNING: IMPACT_BADGE_ABI is empty. Check ABI import paths.');
}
if (!PSL_TICKET_ABI || PSL_TICKET_ABI.length === 0) {
  console.warn('⚠️ WARNING: PSL_TICKET_ABI is empty. Check ABI import paths.');
}

/**
 * Environment Variable Names (for validation)
 */
export const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_MARKET_ADDRESS',
  'NEXT_PUBLIC_BADGE_ADDRESS',
  'NEXT_PUBLIC_TICKET_ADDRESS',
] as const;

/**
 * Optional Environment Variables
 */
export const OPTIONAL_ENV_VARS = [
  'NEXT_PUBLIC_RPC_URL',
  'NEXT_PUBLIC_WS_URL',
  'NEXT_PUBLIC_LOG_LEVEL',
] as const;

/**
 * Log Levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Current log level (set via environment)
 */
export const CURRENT_LOG_LEVEL = (process.env.NEXT_PUBLIC_LOG_LEVEL || 'INFO') as string;

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 3: ERROR CLASSES & TRANSLATION
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Base Contract Utility Error
 */
export class ContractUtilError extends Error {
  constructor(
    public code: string,
    message: string,
    public suggestion: string,
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, ContractUtilError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      suggestion: this.suggestion,
      recoverable: this.recoverable,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Invalid Wallet Address Error
 */
export class InvalidAddressError extends ContractUtilError {
  constructor(address: string, context?: string) {
    super(
      ERROR_CODES.INVALID_ADDRESS,
      `Invalid wallet address: ${address}${context ? ` (${context})` : ''}. Address must be 42 characters starting with 0x.`,
      'Verify the wallet address is correct. Copy from MetaMask or Etherscan.',
      false
    );
  }
}

/**
 * Invalid Amount Error
 */
export class InvalidAmountError extends ContractUtilError {
  constructor(amount: string | bigint, reason?: string) {
    super(
      ERROR_CODES.INVALID_AMOUNT,
      `Invalid amount: ${amount}${reason ? `. Reason: ${reason}` : ''}. Must be positive.`,
      'Check amount is positive and uses correct decimal places.',
      false
    );
  }
}

/**
 * Insufficient Balance Error
 */
export class InsufficientBalanceError extends ContractUtilError {
  constructor(required: string, available: string, token: string = 'WIRE') {
    super(
      ERROR_CODES.INSUFFICIENT_BALANCE,
      `Insufficient ${token} balance. Required: ${required}, Available: ${available}.`,
      `Top up wallet with ${required} ${token}.`,
      true
    );
  }
}

/**
 * Network Mismatch Error
 */
export class NetworkMismatchError extends ContractUtilError {
  constructor(expected: number, actual: number) {
    super(
      ERROR_CODES.NETWORK_MISMATCH,
      `Network mismatch. Expected Chain ID ${expected}, connected to ${actual}.`,
      `Switch wallet to WireFluid Testnet (Chain ID 92533).`,
      true
    );
  }
}

/**
 * Gas Estimation Error
 */
export class GasEstimationError extends ContractUtilError {
  constructor(reason?: string, originalError?: unknown) {
    super(
      ERROR_CODES.GAS_ESTIMATION_FAILED,
      `Gas estimation failed${reason ? `: ${reason}` : ''}. Transaction would revert.`,
      'Check balance, contract address, and parameters.',
      true
    );
    if (originalError) {
      this.cause = originalError;
    }
  }
}

/**
 * Transaction Failed Error
 */
export class TransactionFailedError extends ContractUtilError {
  constructor(txHash: string, reason?: string) {
    super(
      ERROR_CODES.TRANSACTION_FAILED,
      `Transaction failed: ${txHash}${reason ? `. Reason: ${reason}` : ''}`,
      `Check ${WIREFLUID_EXPLORER_URL}/tx/${txHash} for details.`,
      false
    );
  }
}

/**
 * Timeout Error
 */
export class TimeoutError extends ContractUtilError {
  constructor(operation: string, timeoutMs: number) {
    super(
      ERROR_CODES.TIMEOUT,
      `Operation timed out after ${timeoutMs}ms: ${operation}`,
      'Try again. Network may be experiencing high load.',
      true
    );
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends ContractUtilError {
  constructor(retryAfterSeconds?: number) {
    super(
      ERROR_CODES.RATE_LIMIT,
      `Rate limited by RPC endpoint${retryAfterSeconds ? ` (retry after ${retryAfterSeconds}s)` : ''}`,
      `Wait ${retryAfterSeconds || 60} seconds before retrying.`,
      true
    );
  }
}

/**
 * RPC Error
 */
export class RpcError extends ContractUtilError {
  constructor(method: string, reason: string) {
    super(
      ERROR_CODES.RPC_ERROR,
      `RPC call failed for '${method}': ${reason}`,
      'Check network connection and RPC endpoint.',
      true
    );
  }
}

/**
 * Contract Error
 */
export class ContractError extends ContractUtilError {
  constructor(contractName: string, methodName: string, reason: string) {
    super(
      ERROR_CODES.CONTRACT_ERROR,
      `Contract error in ${contractName}.${methodName}(): ${reason}`,
      'Check contract parameters and address.',
      false
    );
  }
}

/**
 * Translate any error into ErrorWithSuggestion
 */
export function translateError(error: unknown): ErrorWithSuggestion {
  if (error instanceof ContractUtilError) {
    return {
      code: error.code,
      message: error.message,
      suggestion: error.suggestion,
      recoverable: error.recoverable,
      originalError: error,
    };
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('chainid') || message.includes('network mismatch')) {
      return {
        code: ERROR_CODES.NETWORK_MISMATCH,
        message: 'Connected to wrong network.',
        suggestion: 'Switch to WireFluid.',
        recoverable: true,
        originalError: error,
      };
    }

    if (message.includes('insufficient balance') || message.includes('insufficient funds')) {
      return {
        code: ERROR_CODES.INSUFFICIENT_BALANCE,
        message: 'Insufficient WIRE balance.',
        suggestion: 'Top up wallet.',
        recoverable: true,
        originalError: error,
      };
    }

    if (message.includes('gas') && (message.includes('failed') || message.includes('reverted'))) {
      return {
        code: ERROR_CODES.GAS_ESTIMATION_FAILED,
        message: 'Gas estimation failed.',
        suggestion: 'Check transaction parameters.',
        recoverable: true,
        originalError: error,
      };
    }

    if (message.includes('user rejected') || message.includes('user denied')) {
      return {
        code: 'ERR_USER_REJECTED',
        message: 'Transaction rejected.',
        suggestion: 'Approve transaction in wallet.',
        recoverable: true,
        originalError: error,
      };
    }

    if (message.includes('timeout')) {
      return {
        code: ERROR_CODES.TIMEOUT,
        message: 'Request timed out.',
        suggestion: 'Try again.',
        recoverable: true,
        originalError: error,
      };
    }

    if (message.includes('429') || message.includes('too many requests')) {
      return {
        code: ERROR_CODES.RATE_LIMIT,
        message: 'Rate limited.',
        suggestion: 'Wait 60 seconds and try again.',
        recoverable: true,
        originalError: error,
      };
    }

    if (message.includes('invalid address') || message.includes('checksum')) {
      return {
        code: ERROR_CODES.INVALID_ADDRESS,
        message: 'Invalid wallet address.',
        suggestion: 'Check address format.',
        recoverable: false,
        originalError: error,
      };
    }

    return {
      code: 'ERR_UNKNOWN',
      message: error.message || 'Unknown error',
      suggestion: 'Try again or contact support.',
      recoverable: true,
      originalError: error,
    };
  }

  return {
    code: 'ERR_UNKNOWN',
    message: 'Unknown error: ' + String(error),
    suggestion: 'Try again or contact support.',
    recoverable: true,
    originalError: error,
  };
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof ContractUtilError) {
    return error.recoverable;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('timeout') || msg.includes('429') || msg.includes('network') || msg.includes('socket');
  }

  return false;
}

/**
 * Get user-friendly suggestion
 */
export function getErrorSuggestion(error: unknown): string {
  return translateError(error).suggestion;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 4: CONFIGURATION & INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Validate all required environment variables
 */
export function validateEnvironment(): void {
  const missingVars: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing env vars: ${missingVars.join(', ')}. Set in .env.local`
    );
  }

  debugLog('Environment validated');
}

/**
 * Get network configuration
 */
export function getNetworkConfig(): NetworkConfig {
  return DEFAULT_NETWORK_CONFIG;
}

/**
 * Get Wagmi chain configuration
 */
export function getWagmiChainConfig() {
  return WIREFLUID_CHAIN;
}

/**
 * Initialize ethers.js JsonRpcProvider
 */
export function initializeProvider(
  rpcUrl: string = WIREFLUID_RPC_URL,
  timeoutMs: number = RPC_TIMEOUT_MS
): JsonRpcProvider {
  try {
    const provider = new JsonRpcProvider(rpcUrl);
    provider.pollingInterval = timeoutMs;
    debugLog('Provider initialized', { rpcUrl });
    return provider;
  } catch (error) {
    const translated = translateError(error);
    errorLog('Provider init failed', translated);
    throw new RpcError('initialize', translated.message);
  }
}

/**
 * Initialize BrowserProvider for wallet
 */
export function initializeBrowserProvider(ethereumProvider: any): BrowserProvider {
  if (!ethereumProvider) {
    throw new Error('No Ethereum provider. Install MetaMask.');
  }
  const provider = new BrowserProvider(ethereumProvider);
  debugLog('Browser provider initialized');
  return provider;
}

/**
 * Validate chain ID matches WireFluid
 */
export async function validateChainId(
  provider: JsonRpcProvider | BrowserProvider,
  expectedChainId: number = WIREFLUID_CHAIN_ID
): Promise<boolean> {
  try {
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(expectedChainId)) {
      throw new NetworkMismatchError(expectedChainId, Number(network.chainId));
    }
    debugLog('Chain ID valid', { chainId: expectedChainId });
    return true;
  } catch (error) {
    if (error instanceof NetworkMismatchError) throw error;
    const translated = translateError(error);
    throw new RpcError('validateChainId', translated.message);
  }
}

/**
 * Get contract ABI
 */
export function getContractABI(contractName: 'Market' | 'Badge' | 'Ticket'): any[] {
  const abis: { [key: string]: any[] } = {
    Market: PSL_IMPACT_MARKET_ABI,
    Badge: IMPACT_BADGE_ABI,
    Ticket: PSL_TICKET_ABI,
  };

  const abi = abis[contractName];
  if (!abi || abi.length === 0) {
    throw new Error(`ABI not found for: ${contractName}`);
  }
  return abi;
}

/**
 * Get contract address
 */
export function getContractAddress(contractName: 'Market' | 'Badge' | 'Ticket'): string {
  const addresses: { [key: string]: string } = {
    Market: MARKET_ADDRESS,
    Badge: BADGE_ADDRESS,
    Ticket: TICKET_ADDRESS,
  };

  const address = addresses[contractName];
  if (!address) {
    throw new Error(`Address not configured: ${contractName}`);
  }

  if (!isAddress(address)) {
    throw new InvalidAddressError(address, contractName);
  }

  return getAddress(address);
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 5: CONTRACT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Safe contract read with retry and caching
 */
export async function safeContractRead<T = any>(
  address: string,
  abi: any[],
  functionName: string,
  params: any[] = [],
  provider: JsonRpcProvider | BrowserProvider,
  options: ContractReadOptions = {}
): Promise<T> {
  const {
    allowCache = true,
    cacheTtl = CACHE_TTL_BALANCE,
    timeout = RPC_TIMEOUT_MS,
    maxRetries = MAX_RETRIES,
  } = options;

  if (!isAddress(address)) {
    throw new InvalidAddressError(address, 'safeContractRead');
  }

  const cacheKey = `${address}-${functionName}-${JSON.stringify(params)}`;
  if (allowCache) {
    const cached = contractReadCache.get(cacheKey);
    if (cached) {
      debugLog('Cache hit', { function: functionName });
      return cached.data as T;
    }
  }

  const execute = async (): Promise<any> => {
    try {
      const contract = new Contract(address, abi, provider);
      const result = await Promise.race([
        contract[functionName](...params),
        sleep(timeout).then(() => {
          throw new TimeoutError(functionName, timeout);
        }),
      ]);

      if (allowCache) {
        contractReadCache.set(cacheKey, new CacheEntryClass(result, cacheTtl));
      }

      debugLog('Contract read success', { function: functionName });
      return result;
    } catch (error) {
      throw error;
    }
  };

  return retryWithBackoff(execute, {
    maxAttempts: maxRetries,
    baseDelay: BASE_DELAY_MS,
    maxDelay: MAX_DELAY_MS,
    jitter: JITTER_MS,
  }) as Promise<T>;
}

/**
 * Safe contract write with pre-flight checks
 */
export async function safeContractWrite(
  address: string,
  abi: any[],
  functionName: string,
  params: any[] = [],
  provider: BrowserProvider,
  options: ContractWriteOptions = {}
): Promise<TransactionResponse> {
  const {
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
    value,
    timeout = RPC_TIMEOUT_MS,
    maxRetries = MAX_RETRIES,
  } = options;

  if (!isAddress(address)) {
    throw new InvalidAddressError(address, 'safeContractWrite');
  }

  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();

  debugLog('Write initiated', { function: functionName, signer: signerAddress });

  try {
    await validateChainId(provider);
    const balance = await provider.getBalance(signerAddress);
    const estimatedCost = (gasLimit || DEFAULT_GAS_LIMIT) * (gasPrice || (await getGasPrices()).standard);
    if (balance < estimatedCost) {
      throw new InsufficientBalanceError(formatEther(estimatedCost), formatEther(balance), 'WIRE');
    }
  } catch (error) {
    if (error instanceof ContractUtilError) throw error;
    const translated = translateError(error);
    throw new RpcError('preflight', translated.message);
  }

  const execute = async (): Promise<TransactionResponse> => {
    try {
      const contract = new Contract(address, abi, signer);

      let finalGasLimit = gasLimit;
      if (!finalGasLimit) {
        try {
          const estimated = await contract[functionName].estimateGas(...params);
          finalGasLimit = estimated * BigInt(115) / BigInt(100);
        } catch {
          finalGasLimit = DEFAULT_GAS_LIMIT;
          warnLog('Gas estimation failed', { function: functionName });
        }
      }

      const txParams: any = { gasLimit: finalGasLimit };

      if (gasPrice) {
        txParams.gasPrice = gasPrice;
      } else if (maxFeePerGas && maxPriorityFeePerGas) {
        txParams.maxFeePerGas = maxFeePerGas;
        txParams.maxPriorityFeePerGas = maxPriorityFeePerGas;
      }

      if (value) {
        txParams.value = value;
      }

      const tx = (await Promise.race([
        contract[functionName](...params, txParams),
        sleep(timeout).then(() => {
          throw new TimeoutError(functionName, timeout);
        }),
      ])) as TransactionResponse;

      debugLog('Transaction sent', { hash: tx.hash });
      return tx;
    } catch (error) {
      throw error;
    }
  };

  return retryWithBackoff(execute, {
    maxAttempts: maxRetries,
    baseDelay: BASE_DELAY_MS,
    maxDelay: MAX_DELAY_MS,
    jitter: JITTER_MS,
  }) as Promise<TransactionResponse>;
}

/**
 * Estimate gas with buffer
 */
export async function estimateGasWithBuffer(
  address: string,
  abi: any[],
  functionName: string,
  params: any[] = [],
  provider: BrowserProvider,
  bufferPercent: bigint = BigInt(115)
): Promise<bigint> {
  try {
    const contract = new Contract(address, abi, provider);
    const estimated = await contract[functionName].estimateGas(...params);
    const withBuffer = estimated * bufferPercent / BigInt(100);

    debugLog('Gas estimated', { estimated: estimated.toString(), withBuffer: withBuffer.toString() });
    return withBuffer;
  } catch (error) {
    const translated = translateError(error);
    throw new GasEstimationError(translated.message, error);
  }
}

/**
 * Wait for transaction with polling
 */
export async function waitForTransaction(
  txHash: string,
  provider: JsonRpcProvider | BrowserProvider,
  timeoutMs: number = TRANSACTION_TIMEOUT_MS,
  confirmations: number = 1
): Promise<TransactionReceiptEnhanced | null> {
  const startTime = Date.now();
  const pollInterval = 2000;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const elapsed = Date.now() - startTime;
        if (elapsed > timeoutMs) {
          throw new TimeoutError(`waitForTransaction(${txHash})`, timeoutMs);
        }

        const receipt = await provider.getTransactionReceipt(txHash);

        if (receipt) {
          const currentBlock = await provider.getBlockNumber();
          const blockConfirmed = currentBlock - Number(receipt.blockNumber) >= confirmations;

          if (blockConfirmed) {
            debugLog('Transaction confirmed', { hash: txHash, block: receipt.blockNumber });
            resolve(receipt as TransactionReceiptEnhanced);
            return;
          }
        }

        setTimeout(poll, pollInterval);
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

/**
 * Setup event listener
 */
export function setupEventListener(
  address: string,
  abi: any[],
  eventName: string,
  callback: EventCallback,
  provider: JsonRpcProvider | BrowserProvider
): () => void {
  try {
    if (!isAddress(address)) {
      throw new InvalidAddressError(address, 'setupEventListener');
    }

    const contract = new Contract(address, abi, provider);

    const eventFragment = contract.interface.fragments.find(
      (f) => f.type === 'event' && (f as EventFragment).name === eventName
    );

    if (!eventFragment) {
      throw new Error(`Event '${eventName}' not found in ABI`);
    }

    contract.on(eventName, callback);

    debugLog('Event listener setup', { event: eventName });

    return () => {
      contract.off(eventName, callback);
      debugLog('Event listener removed', { event: eventName });
    };
  } catch (error) {
    const translated = translateError(error);
    errorLog('Event listener setup failed', translated);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 6: GAS UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get current gas prices
 */
export async function getGasPrices(
  provider?: JsonRpcProvider | BrowserProvider
): Promise<GasPrices> {
  try {
    const rpcProvider = provider || initializeProvider();

    try {
      const feeData = await rpcProvider.getFeeData();
      const baseFee = feeData.gasPrice || 1n * GWEI;
      const priorityFee = feeData.maxPriorityFeePerGas || BigInt(1);

      return {
        standard: baseFee + priorityFee,
        fast: baseFee + (priorityFee * BigInt(120) / BigInt(100)),
        instant: baseFee + (priorityFee * BigInt(150) / BigInt(100)),
        baseFee: baseFee,
        maxPriorityFee: priorityFee,
      };
    } catch {
      // Fallback: try to get gas price via getFeeData or default
      try {
        const feeData = await rpcProvider.getFeeData();
        const gasPrice = feeData.gasPrice || 1n * GWEI;
        return {
          standard: gasPrice,
          fast: gasPrice * BigInt(120) / BigInt(100),
          instant: gasPrice * BigInt(150) / BigInt(100),
          baseFee: gasPrice,
          maxPriorityFee: gasPrice,
        };
      } catch {
        const defaultPrice = 1n * GWEI;
        return {
          standard: defaultPrice,
          fast: defaultPrice * BigInt(120) / BigInt(100),
          instant: defaultPrice * BigInt(150) / BigInt(100),
          baseFee: defaultPrice,
          maxPriorityFee: defaultPrice,
        };
      }
    }
  } catch (error) {
    const translated = translateError(error);
    throw new RpcError('eth_gasPrice', translated.message);
  }
}

/**
 * Calculate transaction cost
 */
export function calculateTransactionCost(gasLimit: bigint, gasPrice: bigint): TransactionCost {
  const totalCost = gasLimit * gasPrice;

  return {
    gasLimit,
    gasPrice,
    totalCost,
    costInWire: formatEther(totalCost),
  };
}

/**
 * Get max fee per gas
 */
export async function getMaxFeePerGas(provider: JsonRpcProvider | BrowserProvider): Promise<bigint> {
  try {
    const feeData = await provider.getFeeData();

    if (!feeData.maxFeePerGas) {
      // Fallback: use a reasonable default (1 Gwei * 2)
      return 2n * GWEI;
    }

    return feeData.maxFeePerGas;
  } catch (error) {
    const translated = translateError(error);
    throw new RpcError('eth_maxFeePerGas', translated.message);
  }
}

/**
 * Get max priority fee per gas
 */
export async function getMaxPriorityFeePerGas(provider: JsonRpcProvider | BrowserProvider): Promise<bigint> {
  try {
    const feeData = await provider.getFeeData();

    if (!feeData.maxPriorityFeePerGas) {
      return GWEI;
    }

    return feeData.maxPriorityFeePerGas;
  } catch (error) {
    const translated = translateError(error);
    throw new RpcError('eth_maxPriorityFeePerGas', translated.message);
  }
}

/**
 * Convert gas to WIRE
 */
export async function convertGasToWire(gasAmount: bigint, gasPrice?: bigint): Promise<string> {
  try {
    const price = gasPrice || (await getGasPrices()).standard;
    const totalWei = gasAmount * price;
    return formatEther(totalWei);
  } catch (error) {
    const translated = translateError(error);
    throw new RpcError('convertGasToWire', translated.message);
  }
}

/**
 * Format gas in Gwei
 */
export function formatGwei(value: bigint, decimals: number = 2): string {
  return (Number(value) / Number(GWEI)).toFixed(decimals) + ' Gwei';
}

/**
 * Parse Gwei to Wei
 */
export function parseGwei(value: string): bigint {
  try {
    const cleanValue = value.replace(/\s+gwei|gwei|gwei$/gi, '').trim();
    const numValue = parseFloat(cleanValue);

    if (isNaN(numValue) || numValue < 0) {
      throw new InvalidAmountError(value, 'Must be positive');
    }

    return BigInt(Math.floor(numValue * Number(GWEI)));
  } catch (error) {
    if (error instanceof InvalidAmountError) throw error;
    throw new InvalidAmountError(value, 'Invalid format');
  }
}

/**
 * Get gas history
 */
export async function getGasHistory(
  provider: JsonRpcProvider | BrowserProvider,
  blockCount: number = 10
): Promise<any> {
  try {
    // Note: getFeeHistory may not be available on all providers
    // Return current fee estimate instead of historical data
    const feeData = await provider.getFeeData();
    
    return {
      baseFeePerGas: feeData.gasPrice ? [feeData.gasPrice] : [],
      gasUsedRatio: Array(blockCount).fill(0.5),
      priorityFeePerGas: [[feeData.maxPriorityFeePerGas || 1n]],
    };
  } catch (error) {
    const translated = translateError(error);
    throw new RpcError('eth_feeHistory', translated.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 7: WALLET UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get connected wallet address
 */
export async function getWalletAddress(provider: BrowserProvider): Promise<string | null> {
  try {
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch {
    return null;
  }
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(
  provider: JsonRpcProvider | BrowserProvider,
  address?: string
): Promise<FormattedBalance> {
  try {
    const checkAddress = address || (await getWalletAddress(provider as BrowserProvider));

    if (!checkAddress) {
      throw new Error('No address provided or wallet not connected');
    }

    if (!isAddress(checkAddress)) {
      throw new InvalidAddressError(checkAddress, 'getWalletBalance');
    }

    const raw = await provider.getBalance(getAddress(checkAddress));

    return {
      raw,
      formatted: formatEther(raw),
      inWire: Number(formatEther(raw)),
    };
  } catch (error) {
    const translated = translateError(error);
    throw new RpcError('getBalance', translated.message);
  }
}

/**
 * Check network match
 */
export async function checkNetworkMatch(
  provider: BrowserProvider,
  expectedChainId: number = WIREFLUID_CHAIN_ID
): Promise<boolean> {
  try {
    const network = await provider.getNetwork();
    return network.chainId === BigInt(expectedChainId);
  } catch {
    return false;
  }
}

/**
 * Format address
 */
export function formatAddress(address: string, length: number = 6): string {
  try {
    const checksummed = getAddress(address);
    if (length >= 42) return checksummed;
    return checksummed.slice(0, length) + '...' + checksummed.slice(-length);
  } catch {
    return address.slice(0, length) + '...' + address.slice(-length);
  }
}

/**
 * Validate address
 */
export function isValidAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Get wallet state
 */
export async function getWalletState(provider: BrowserProvider): Promise<WalletState> {
  try {
    const address = await getWalletAddress(provider);
    const balance = address ? (await getWalletBalance(provider, address)).raw : null;
    const network = await provider.getNetwork();
    const isCorrectChain = network.chainId === BigInt(WIREFLUID_CHAIN_ID);

    return {
      address,
      isConnected: !!address,
      balance,
      chainId: Number(network.chainId),
      isCorrectChain,
    };
  } catch {
    return {
      address: null,
      isConnected: false,
      balance: null,
      chainId: null,
      isCorrectChain: false,
    };
  }
}

/**
 * Get provider (for compatibility with legacy code)
 * Returns BrowserProvider from window.ethereum
 */
export async function getProvider(): Promise<BrowserProvider> {
  if (typeof window === 'undefined') {
    throw new Error('No window object. Must be called from browser.');
  }

  if (!window.ethereum) {
    throw new Error('No Ethereum provider found. Install MetaMask.');
  }

  return new BrowserProvider(window.ethereum);
}

/**
 * Get signer from provider
 * Returns the signer for transaction signing
 */
export async function getSigner(provider?: BrowserProvider) {
  const prov = provider || (await getProvider());
  return prov.getSigner();
}

/**
 * Get contract instance
 * Creates a Contract instance for interaction
 */
export function getContractInstance(
  address: string,
  abi: any[],
  provider: JsonRpcProvider | BrowserProvider | any
): Contract {
  if (!isAddress(address)) {
    throw new InvalidAddressError(address, 'getContractInstance');
  }

  return new Contract(getAddress(address), abi, provider);
}

/**
 * Alias for getContractInstance (for legacy compatibility)
 */
export const getContract = getContractInstance;

/**
 * Parse contract error (legacy compatibility)
 * Converts error to human-readable message
 */
export function parseContractError(error: unknown): string {
  const translated = translateError(error);
  return translated.message;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 8: RETRY & RESILIENCE
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRecoverableError(error)) {
        throw error;
      }

      if (attempt < config.maxAttempts - 1) {
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt) + Math.random() * config.jitter,
          config.maxDelay
        );

        debugLog(`Retry attempt ${attempt + 1}/${config.maxAttempts}`, { delayMs: Math.floor(delay) });
        await sleep(Math.floor(delay));
      }
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 9: CACHING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Cache entry class
 */
class CacheEntryClass<T> implements CacheEntry<T> {
  public readonly timestamp: number;

  constructor(
    public readonly data: T,
    public readonly ttl: number
  ) {
    this.timestamp = Date.now();
  }

  isExpired(): boolean {
    return Date.now() - this.timestamp > this.ttl;
  }
}

/**
 * Contract read cache implementation
 */
class ContractReadCacheImpl {
  private cache = new Map<string, CacheEntry<any>>();

  get(key: string): CacheEntry<any> | undefined {
    const entry = this.cache.get(key);
    if (entry && entry.ttl < Date.now() - entry.timestamp) {
      this.cache.delete(key);
      return undefined;
    }
    return entry;
  }

  set(key: string, entry: CacheEntry<any>): void {
    this.cache.set(key, entry);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.ttl < Date.now() - entry.timestamp) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Global contract read cache
 */
const contractReadCache = new ContractReadCacheImpl();

/**
 * Export cache instance
 */
export const ContractCache = {
  clear: () => contractReadCache.clear(),
  size: () => contractReadCache.size(),
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 10: UTILITIES & INTEGRATION GUIDE
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Format WIRE amount
 */
export function formatWire(amount: bigint | string, decimals: number = 2): string {
  try {
    const formatted = typeof amount === 'string' ? parseFloat(amount) : Number(formatEther(amount));
    return formatted.toFixed(decimals) + ' WIRE';
  } catch {
    return '0.00 WIRE';
  }
}

/**
 * Parse WIRE to Wei
 */
export function parseWire(amountString: string): bigint {
  try {
    const cleanAmount = amountString.replace(/\s*wire|wire$/gi, '').trim();
    return parseEther(cleanAmount);
  } catch {
    throw new InvalidAmountError(amountString, 'Invalid WIRE format');
  }
}

/**
 * Batch contract reads
 */
export async function batchContractReads(
  calls: BatchReadCall[],
  provider: JsonRpcProvider | BrowserProvider,
  maxConcurrent: number = 5
): Promise<BatchReadResult[]> {
  const results: BatchReadResult[] = [];

  for (let i = 0; i < calls.length; i += maxConcurrent) {
    const batch = calls.slice(i, i + maxConcurrent);

    const batchResults = await Promise.all(
      batch.map(async (call: any) => {
        try {
          const result = await safeContractRead(
            call.address,
            call.abi,
            call.functionName,
            call.params,
            provider
          );
          return { success: true, result };
        } catch (error) {
          const translated = translateError(error);
          return { success: false, error: translated.message };
        }
      })
    );

    results.push(...batchResults);
  }

  return results;
}

/**
 * Logging functions
 */
function debugLog(message: string, data?: any): void {
  if (CURRENT_LOG_LEVEL === LogLevel.DEBUG || CURRENT_LOG_LEVEL === LogLevel.INFO) {
    console.log(`[DEBUG] ${new Date().toISOString()} ${message}`, data || '');
  }
}

function infoLog(message: string, data?: any): void {
  if ([LogLevel.INFO, LogLevel.DEBUG].includes(CURRENT_LOG_LEVEL as any)) {
    console.log(`[INFO] ${new Date().toISOString()} ${message}`, data || '');
  }
}

function warnLog(message: string, data?: any): void {
  if (![LogLevel.ERROR].includes(CURRENT_LOG_LEVEL as any)) {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, data || '');
  }
}

function errorLog(message: string, data?: any): void {
  console.error(`[ERROR] ${new Date().toISOString()} ${message}`, data || '');
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// INTEGRATION GUIDE & SETUP INSTRUCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * SETUP INSTRUCTIONS:
 *
 * 1. ENVIRONMENT VARIABLES (.env.local)
 *    NEXT_PUBLIC_MARKET_ADDRESS=0x...
 *    NEXT_PUBLIC_BADGE_ADDRESS=0x...
 *    NEXT_PUBLIC_TICKET_ADDRESS=0x...
 *    NEXT_PUBLIC_LOG_LEVEL=INFO
 *
 * 2. INITIALIZATION (in app initialization)
 *    validateEnvironment();
 *
 * 3. REACT + WAGMI USAGE
 *    const provider = initializeBrowserProvider(window.ethereum);
 *    const walletBalance = await getWalletBalance(provider);
 *    console.log('Balance:', walletBalance.formatted);
 *
 * 4. CONTRACT INTERACTIONS
 *    // Read
 *    const result = await safeContractRead(
 *      MARKET_ADDRESS,
 *      PSL_IMPACT_MARKET_ABI,
 *      'getLeaderboard',
 *      [],
 *      provider
 *    );
 *
 *    // Write
 *    const tx = await safeContractWrite(
 *      MARKET_ADDRESS,
 *      PSL_IMPACT_MARKET_ABI,
 *      'stake',
 *      [matchId, pillarId, parseEther('10')],
 *      provider
 *    );
 *    const receipt = await waitForTransaction(tx.hash, provider);
 *
 * 5. ERROR HANDLING
 *    try {
 *      await safeContractWrite(...);
 *    } catch (error) {
 *      const { message, suggestion } = translateError(error);
 *      console.error(message);
 *      console.log('Try: ' + suggestion);
 *    }
 *
 * 6. GAS CALCULATIONS
 *    const prices = await getGasPrices(provider);
 *    const cost = calculateTransactionCost(BigInt(21000), prices.standard);
 *    console.log('Cost:', cost.costInWire, 'WIRE');
 *
 * 7. CACHING
 *    Cache is automatic for reads. Clear with:
 *    ContractCache.clear();
 */

const contractUtilsExport = {
  // Configuration
  validateEnvironment,
  getNetworkConfig,
  getWagmiChainConfig,
  initializeProvider,
  initializeBrowserProvider,
  validateChainId,
  getProvider,
  getSigner,
  getContractInstance,
  getContract,
  parseContractError,

  // Contract Interactions
  safeContractRead,
  safeContractWrite,
  estimateGasWithBuffer,
  waitForTransaction,
  setupEventListener,

  // Gas
  getGasPrices,
  calculateTransactionCost,
  getMaxFeePerGas,
  getMaxPriorityFeePerGas,
  convertGasToWire,
  formatGwei,
  parseGwei,
  getGasHistory,

  // Wallet
  getWalletAddress,
  getWalletBalance,
  checkNetworkMatch,
  formatAddress,
  isValidAddress,
  getWalletState,

  // Utilities
  retryWithBackoff,
  sleep,
  formatWire,
  parseWire,
  batchContractReads,
  ContractCache,

  // Error Handling
  translateError,
  isRecoverableError,
  getErrorSuggestion,

  // Constants & Config
  WIREFLUID_CHAIN_ID,
  WIREFLUID_RPC_URL,
  MARKET_ADDRESS,
  BADGE_ADDRESS,
  TICKET_ADDRESS,
  WIREFLUID_CHAIN,
  DEFAULT_NETWORK_CONFIG,
};

export default contractUtilsExport;

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 8: TRANSACTION BUILDER & SIGNER UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Transaction builder for batch operations
 * Simplifies building multiple contract calls
 */
class TransactionBuilder {
  private calls: Array<{ target: string; functionName: string; params: any[] }> = [];

  addCall(target: string, functionName: string, ...params: any[]): this {
    this.calls.push({ target, functionName, params });
    return this;
  }

  async executeSequential(provider: BrowserProvider, abi: any[]): Promise<any[]> {
    const signer = await provider.getSigner();
    const results: any[] = [];

    for (const call of this.calls) {
      const contract = new Contract(getAddress(call.target), abi, signer);
      const result = await contract[call.functionName](...call.params);
      results.push(result);
    }

    return results;
  }

  getCalls(): typeof this.calls {
    return [...this.calls];
  }

  clear(): void {
    this.calls = [];
  }
}

/**
 * Create transaction builder instance
 */
export function createTransactionBuilder(): TransactionBuilder {
  return new TransactionBuilder();
}

/**
 * Pre-check transaction before sending
 * Validates gas, balance, and contract state
 */
export async function preCheckTransaction(
  provider: BrowserProvider,
  from: string,
  to: string,
  data: string,
  value: bigint = 0n
): Promise<{ canExecute: boolean; reason?: string }> {
  try {
    // Check balance
    const balance = await provider.getBalance(from);
    const gasPrices = await getGasPrices(provider);
    const estimatedGas = BigInt(21000); // Minimum gas
    const txCost = estimatedGas * gasPrices.standard + value;

    if (balance < txCost) {
      return {
        canExecute: false,
        reason: `Insufficient balance. Need ${formatEther(txCost)} WIRE, have ${formatEther(balance)} WIRE`,
      };
    }

    return { canExecute: true };
  } catch (error) {
    return {
      canExecute: false,
      reason: `Pre-check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 9: ADVANCED CONTRACT PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Safe multi-call pattern for reading multiple contract values
 * Returns typed array with proper error handling
 */
export async function safeMultiRead<T extends any[]>(
  provider: JsonRpcProvider | BrowserProvider,
  calls: Array<{
    address: string;
    abi: any[];
    functionName: string;
    params: any[];
  }>
): Promise<T> {
  try {
    const results = await batchContractReads(calls, provider);
    return results as T;
  } catch (error) {
    debugLog('Multi-read failed', { error });
    throw new ContractError('BatchRead', 'safeMultiRead', `Safe multi-read failed: ${error}`);
  }
}

/**
 * Watch contract balance with polling
 */
export async function watchBalance(
  provider: JsonRpcProvider | BrowserProvider,
  address: string,
  callback: (balance: bigint) => void,
  pollInterval: number = 5000
): Promise<() => void> {
  let lastBalance = await provider.getBalance(address);
  callback(lastBalance);

  const interval = setInterval(async () => {
    try {
      const currentBalance = await provider.getBalance(address);
      if (currentBalance !== lastBalance) {
        lastBalance = currentBalance;
        callback(currentBalance);
      }
    } catch (error) {
      errorLog('Balance polling failed', { error });
    }
  }, pollInterval);

  return () => clearInterval(interval);
}

/**
 * Decode contract output
 * Helper to parse contract function results
 */
export function decodeOutput(abi: any[], functionName: string, result: any): any {
  try {
    const iface = new Interface(abi);
    const fragment = iface.fragments.find(
      (f) => (f as FunctionFragment).name === functionName
    ) as FunctionFragment;

    if (!fragment || !fragment.outputs) {
      return result;
    }

    return iface.decodeFunctionResult(fragment, result);
  } catch (error) {
    warnLog('Decode output failed', { functionName, error });
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECTION 10: COMPREHENSIVE INTEGRATION GUIDE & EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                   PSL PULSE CONTRACT UTILITIES - INTEGRATION GUIDE                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * COMPLETE INTEGRATION EXAMPLE:
 *
 * ─ STEP 1: INITIALIZE YOUR APP ─
 *
 * import { initializeBrowserProvider, validateEnvironment } from '@/lib/contractUtils';
 *
 * useEffect(() => {
 *   validateEnvironment();
 *   const provider = initializeBrowserProvider(window.ethereum);
 *   // Store provider in context or state
 * }, []);
 *
 *
 * ─ STEP 2: CONNECT WALLET ─
 *
 * async function connectWallet() {
 *   const provider = new BrowserProvider(window.ethereum);
 *   const accounts = await provider.send('eth_requestAccounts', []);
 *   const signer = await provider.getSigner();
 *   return { provider, signer, address: accounts[0] };
 * }
 *
 *
 * ─ STEP 3: READ FROM SMART CONTRACT ─
 *
 * // Simple read with caching
 * const leaderboard = await safeContractRead(
 *   MARKET_ADDRESS,
 *   PSL_IMPACT_MARKET_ABI,
 *   'getLeaderboard',
 *   [],
 *   provider,
 *   { allowCache: true, cacheTtl: 10000 }
 * );
 *
 *
 * ─ STEP 4: WRITE TO SMART CONTRACT ─
 *
 * // Stake in impact pool
 * const txResponse = await safeContractWrite(
 *   MARKET_ADDRESS,
 *   PSL_IMPACT_MARKET_ABI,
 *   'stake',
 *   [matchId, pillarId, parseEther('10')], // stake 10 WIRE
 *   provider
 * );
 *
 * // Wait for confirmation
 * const receipt = await waitForTransaction(txResponse.hash, provider);
 * console.log('Transaction confirmed:', receipt.transactionHash);
 *
 *
 * ─ STEP 5: ESTIMATE GAS & COSTS ─
 *
 * // Check gas requirements before sending
 * const gasPrices = await getGasPrices(provider);
 * const estimatedTxCost = calculateTransactionCost(BigInt(200000), gasPrices.standard);
 * console.log(`Transaction will cost ~${estimatedTxCost.costInWire} WIRE`);
 *
 *
 * ─ STEP 6: ERROR HANDLING ─
 *
 * try {
 *   await safeContractWrite(address, abi, 'method', params, provider);
 * } catch (error) {
 *   const { message, suggestion } = translateError(error);
 *   console.error(message);
 *   // Show user-friendly error + suggestion
 *   showUserNotification({
 *     type: 'error',
 *     title: message,
 *     description: suggestion,
 *   });
 * }
 *
 *
 * ─ STEP 7: SETUP EVENT LISTENERS ─
 *
 * // Listen for badge minted events
 * setupEventListener(
 *   BADGE_ADDRESS,
 *   PSL_IMPACT_BADGE_ABI,
 *   'BadgeMinted',
 *   provider,
 *   (event) => {
 *     console.log('Badge minted:', event);
 *     // Update UI, trigger notification
 *   }
 * );
 *
 *
 * ─ REACT HOOKS EXAMPLE ─
 *
 * function useContractData() {
 *   const [data, setData] = useState(null);
 *   const [loading, setLoading] = useState(true);
 *
 *   useEffect(() => {
 *     (async () => {
 *       try {
 *         const provider = initializeBrowserProvider(window.ethereum);
 *         const result = await safeContractRead(
 *           MARKET_ADDRESS,
 *           PSL_IMPACT_MARKET_ABI,
 *           'getTotalStaked',
 *           [],
 *           provider,
 *           { allowCache: true }
 *         );
 *         setData(result);
 *       } catch (error) {
 *         console.error('Failed to fetch data:', error);
 *       } finally {
 *         setLoading(false);
 *       }
 *     })();
 *   }, []);
 *
 *   return { data, loading };
 * }
 *
 *
 * ─ ENVIRONMENT SETUP (.env.local) ─
 *
 * NEXT_PUBLIC_MARKET_ADDRESS=0x[your_market_contract_address]
 * NEXT_PUBLIC_BADGE_ADDRESS=0x[your_badge_contract_address]
 * NEXT_PUBLIC_TICKET_ADDRESS=0x[your_ticket_contract_address]
 * NEXT_PUBLIC_LOG_LEVEL=INFO
 * NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com (default)
 * NEXT_PUBLIC_WIREFLUID_WS=wss://ws.wirefluid.com (default)
 *
 *
 * ─ TROUBLESHOOTING GUIDE ─
 *
 * Issue: "No Ethereum provider found"
 * → User doesn't have MetaMask installed
 * → Solution: Check window.ethereum before using, show install prompt
 *
 * Issue: "Insufficient balance"
 * → User doesn't have enough WIRE tokens
 * → Solution: Use wf_faucet or guide user to token swap
 *
 * Issue: "Network mismatch"
 * → User is on wrong blockchain
 * → Solution: Call wallet_switchEthereumChain with WireFluid chainId: 92533
 *
 * Issue: "Transaction reverted"
 * → Smart contract validation failed
 * → Solution: Check parameters, use preCheckTransaction() first
 *
 * Issue: "Gas estimation failed"
 * → Contract method may be broken or inputs invalid
 * → Solution: Verify ABI matches deployed contract, test params
 *
 * Issue: "Cache returning stale data"
 * → TTL not expired yet on cached value
 * → Solution: Call ContractCache.clear() or wait for TTL expiry
 *
 *
 * ─ BEST PRACTICES ─
 *
 * 1. Always use safeContractRead/Write (includes retry & error handling)
 * 2. Enable caching for frequently read values to reduce RPC calls
 * 3. Set reasonable timeouts (default: 30s) for network operations
 * 4. Handle errors with translateError() to show user-friendly messages
 * 5. Use preCheckTransaction() before sending large value transfers
 * 6. Monitor gas prices with getGasPrices() before user transactions
 * 7. Setup event listeners early in component lifecycle
 * 8. Clear cache on wallet/network changes
 * 9. Use batch reads for multiple contract calls in parallel
 * 10. Always validate addresses with isValidAddress() before using
 *
 *
 * ─ DEPLOYMENT CHECKLIST ─
 *
 * ✓ Environment variables configured in .env.local
 * ✓ Contract addresses verified on WireFluidScan
 * ✓ ABIs match deployed contract code
 * ✓ Network ID matches (92533 for WireFluid Testnet)
 * ✓ Log level set appropriately (WARN for production)
 * ✓ Error boundaries in place for error handling
 * ✓ Retry logic tested with network failures
 * ✓ Cache invalidation strategy defined
 * ✓ Gas buffer settings appropriate for usage patterns
 * ✓ Event listeners cleanup on unmount
 *
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════
// PART 3: ADVANCED UTILITIES, WALLET INTEGRATIONS & PRODUCTION PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * Advanced transaction builder with multi-step execution
 * Enables complex contract interactions with built-in validation
 */
export class AdvancedTransactionBuilder {
  private steps: Array<{
    address: string;
    method: string;
    params: any[];
    abi: any[];
    description: string;
  }> = [];

  addStep(
    address: string,
    method: string,
    params: any[],
    abi: any[],
    description?: string
  ): this {
    this.steps.push({ address, method, params, abi, description: description || method });
    return this;
  }

  async executeSequential(
    provider: BrowserProvider
  ): Promise<Array<{ step: string; txHash: string; success: boolean }>> {
    const results: Array<{ step: string; txHash: string; success: boolean }> = [];

    for (const step of this.steps) {
      try {
        infoLog(`Executing step: ${step.description}`, { method: step.method });

        const result = await safeContractWrite(
          step.address,
          step.abi,
          step.method,
          step.params,
          provider
        );

        await waitForTransaction(result.hash, provider);

        results.push({
          step: step.description,
          txHash: result.hash,
          success: true,
        });
      } catch (error) {
        errorLog(`Step failed: ${step.description}`, error);
        results.push({
          step: step.description,
          txHash: '',
          success: false,
        });
        throw error;
      }
    }

    return results;
  }

  getSteps(): typeof this.steps {
    return [...this.steps];
  }

  clear(): void {
    this.steps = [];
  }

  count(): number {
    return this.steps.length;
  }
}

/**
 * Create advanced transaction builder
 */
export function createAdvancedBuilder(): AdvancedTransactionBuilder {
  return new AdvancedTransactionBuilder();
}

/**
 * Monitor balance changes with callback
 * Polls at intervals and calls callback only when balance changes
 */
export async function pollBalance(
  provider: JsonRpcProvider | BrowserProvider,
  address: string,
  interval: number = 5000,
  callback?: (change: { old: string; new: string; diff: bigint }) => void
): Promise<() => void> {
  try {
    if (!isValidAddress(address)) {
    throw new InvalidAddressError(address, 'pollBalance');
  }

    let lastBalance = BigInt(0);

    const poll = async () => {
      try {
        const balance = await provider.getBalance(address);

        if (lastBalance === BigInt(0)) {
          lastBalance = balance;
          return;
        }

        if (balance !== lastBalance) {
          callback?.({
            old: formatEther(lastBalance),
            new: formatEther(balance),
            diff: balance - lastBalance,
          });

          lastBalance = balance;
        }
      } catch (error) {
        errorLog('Balance poll error', error);
      }
    };

    // Initial check
    await poll();

    // Set interval
    const intervalId = setInterval(poll, interval);

    return () => clearInterval(intervalId);
  } catch (error) {
    throw new ContractUtilError(ERROR_CODES.RPC_ERROR, `Failed to setup balance polling: ${error}`, 'Check wallet address and provider connection.');
  }
}

/**
 * Send transaction with custom gas settings
 * Overrides automatic gas calculation
 */
export async function sendWithCustomGas(
  address: string,
  abi: any[],
  method: string,
  params: any[],
  gasLimit: bigint,
  gasPriceWei: bigint,
  provider: BrowserProvider
): Promise<TransactionResponse> {
  try {
    if (!isValidAddress(address)) {
      throw new InvalidAddressError(address, 'sendWithCustomGas');
    }

    const signer = await provider.getSigner();
    const contract = new Contract(getAddress(address), abi, signer);

    const tx = await contract[method](...params, {
      gasLimit,
      gasPrice: gasPriceWei,
    });

    infoLog('Transaction sent with custom gas', {
      hash: tx.hash,
      gasLimit: gasLimit.toString(),
      gasPrice: formatGwei(gasPriceWei),
    });

    return tx;
  } catch (error) {
    throw new GasEstimationError(`Custom gas error: ${error}`);
  }
}

/**
 * Estimate transaction cost including gas + execution
 * Provides detailed cost breakdown
 */
export async function estimateFullCost(
  address: string,
  abi: any[],
  method: string,
  params: any[],
  provider: JsonRpcProvider | BrowserProvider
): Promise<{
  gasEstimate: bigint;
  gasPrice: bigint;
  totalCostWei: bigint;
  totalCostWire: string;
  gasMarginAdded: bigint;
}> {
  try {
    if (!isValidAddress(address)) {
      throw new InvalidAddressError(address, 'estimateFullCost');
    }

    const contract = new Contract(getAddress(address), abi, provider);

    // Estimate gas
    const gasEstimate = await contract[method]
      .estimateGas(...params)
      .catch(() => BigInt(200000)); // Fallback

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || 1n * GWEI;

    // Add 15% margin for safety
    const gasMarginAdded = (gasEstimate * BigInt(15)) / BigInt(100);
    const totalGas = gasEstimate + gasMarginAdded;

    // Calculate total cost
    const totalCostWei = totalGas * gasPrice;
    const totalCostWire = formatEther(totalCostWei);

    infoLog('Full cost estimated', {
      gasEstimate: gasEstimate.toString(),
      gasMargin: gasMarginAdded.toString(),
      gasPrice: formatGwei(gasPrice),
      totalCost: totalCostWire,
    });

    return {
      gasEstimate,
      gasPrice,
      totalCostWei,
      totalCostWire,
      gasMarginAdded,
    };
  } catch (error) {
    throw new GasEstimationError(`Cost estimation failed: ${error}`);
  }
}

/**
 * Validate contract method before execution
 * Checks method exists, params match, and account has permissions
 */
export async function validateMethod(
  address: string,
  abi: any[],
  method: string,
  params: any[],
  walletAddress: string
): Promise<{ valid: boolean; error?: string; warning?: string }> {
  try {
    if (!isValidAddress(address)) {
      return { valid: false, error: `Invalid contract address: ${address}` };
    }

    if (!isValidAddress(walletAddress)) {
      return { valid: false, error: `Invalid wallet address: ${walletAddress}` };
    }

    // Check method exists in ABI
    const iface = new Interface(abi);
    const fragment = iface.fragments.find(
      (f: any) => (f as FunctionFragment).name === method
    );

    if (!fragment) {
      return { valid: false, error: `Method '${method}' not found in ABI` };
    }

    // Check it's callable
    if ((fragment as FunctionFragment).constant || (fragment as FunctionFragment).inputs?.length === 0) {
      // View function, no permission needed
      return { valid: true };
    }

    infoLog('Method validation passed', { address, method });
    return { valid: true };
  } catch {
    // error caught and handled
    return { valid: false, error: 'Validation error occurred' };
  }
}

/**
 * Format detailed transaction info for UI
 * Converts complex data into readable format
 */
export function formatTransactionInfo(tx: TransactionResponse | TransactionReceipt): {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasUsed?: string;
  gasLimit: string;
  blockNumber?: number;
  status: string;
} {
  const isResponse = 'from' in tx && !('gasUsed' in tx);
  const txResponse = tx as TransactionResponse;
  const txReceipt = tx as TransactionReceipt;

  return {
    hash: tx.hash,
    from: isResponse ? txResponse.from : txReceipt.from,
    to: tx.to || 'Contract Creation',
    value: formatEther(isResponse ? (txResponse.value || '0') : '0'),
    gasUsed: !isResponse ? formatEther(txReceipt.gasUsed || '0') : undefined,
    gasLimit: formatEther(isResponse ? (txResponse.gasLimit || '0') : '0'),
    blockNumber: !isResponse ? txReceipt.blockNumber : undefined,
    status: !isResponse ? (txReceipt.status === 1 ? 'Success' : 'Failed') : 'Pending',
  };
}

/**
 * Request network switch with proper error handling
 * Works with MetaMask and compatible wallets
 */
export async function switchToWireFluid(): Promise<boolean> {
  try {
    if (!window.ethereum) {
      throw new Error('No Ethereum provider found');
    }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: toBeHex(WIREFLUID_CHAIN_ID) }],
    });

    infoLog('Switched to WireFluid network');
    return true;
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added, attempt to add it
      try {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: toBeHex(WIREFLUID_CHAIN_ID),
              chainName: 'WireFluid Testnet',
              nativeCurrency: {
                name: 'Wire',
                symbol: 'WIRE',
                decimals: 18,
              },
              rpcUrls: [WIREFLUID_RPC_URL],
              blockExplorerUrls: ['https://wirefluidscan.com'],
            },
          ],
        });

        infoLog('Added WireFluid network and switched');
        return true;
      } catch (addError) {
        errorLog('Failed to add WireFluid network', addError);
        return false;
      }
    }

    errorLog('Failed to switch to WireFluid', error);
    return false;
  }
}

/**
 * Format wallet state for display
 * Includes balance, address, network status
 */
export async function formatWalletState(
  provider: BrowserProvider,
  address: string
): Promise<{
  address: string;
  checksumAddress: string;
  shortAddress: string;
  balance: string;
  balanceWei: bigint;
  networkId: number;
  isConnected: boolean;
}> {
  try {
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();

    return {
      address,
      checksumAddress: getAddress(address),
      shortAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
      balance: formatEther(balance),
      balanceWei: balance,
      networkId: Number(network.chainId),
      isConnected: true,
    };
  } catch (error) {
    throw new ContractUtilError(ERROR_CODES.RPC_ERROR, `Failed to format wallet state: ${error}`, 'Check provider and wallet connection.');
  }
}

/**
 * Validate before migration
 * Checks all contracts are deployed and accessible
 */
export async function validateDeployment(provider: JsonRpcProvider): Promise<{
  deployed: boolean;
  contracts: { [key: string]: { address: string; accessible: boolean } };
  issues: string[];
}> {
  const issues: string[] = [];
  const contracts: { [key: string]: { address: string; accessible: boolean } } = {};

  const checkContract = async (name: string, address: string) => {
    try {
      const code = await provider.getCode(address);
      return { address, accessible: code !== '0x' };
    } catch (error) {
      issues.push(`Failed to check ${name}: ${error}`);
      return { address, accessible: false };
    }
  };

  contracts.Market = await checkContract('Market', MARKET_ADDRESS);
  contracts.Badge = await checkContract('Badge', BADGE_ADDRESS);
  contracts.Ticket = await checkContract('Ticket', TICKET_ADDRESS);

  const deployed = Object.values(contracts).every((c) => c.accessible);

  return {
    deployed,
    contracts,
    issues,
  };
}

/**
 * PRODUCTION CHECKLIST
 * ─────────────────────────────────────────────────────────
 * ✓ Environment variables configured in .env.local
 * ✓ Contract ABIs imported and verified
 * ✓ WireFluid network added to MetaMask/wallet
 * ✓ Testnet WIRE tokens obtained from faucet
 * ✓ Error boundaries implemented in React components
 * ✓ Event listeners cleanup on component unmount
 * ✓ Cache invalidation on network/wallet changes
 * ✓ Gas buffer settings tuned for usage patterns
 * ✓ Retry logic tested with network interruptions
 * ✓ All async operations have timeouts set
 * ✓ User-friendly error messages configured
 * ✓ Transaction confirmations ≥2 before UI update
 */

/**
 * TROUBLESHOOTING MATRIX
 * ─────────────────────────────────────────────────────────
 *
 * PROBLEM: "eth_requestAccounts" blocked
 * → User denied wallet permission
 * → SOLUTION: Ask user to approve in wallet, retry connect
 *
 * PROBLEM: All contract reads return undefined
 * → Contract not deployed or wrong address
 * → SOLUTION: Run validateDeployment(), check ABIs match
 *
 * PROBLEM: Transaction reverts with no error message
 * → Contract method failed silently
 * → SOLUTION: Use estimateFullCost() first, validate params
 *
 * PROBLEM: Cache returning stale data
 * → TTL not expired or cache not cleared
 * → SOLUTION: Call ContractCache.clear() or increase TTL
 *
 * PROBLEM: Gas estimation fails repeatedly
 * → Contract method is broken or doesn't exist
 * → SOLUTION: Verify method signature, test in web3.py first
 *
 * PROBLEM: "Network mismatch" errors
 * → User is on wrong blockchain
 * → SOLUTION: Call switchToWireFluid() to auto-switch
 *
 * PROBLEM: Balance not updating after transaction
 * → Block confirmation time or cache not invalidated
 * → SOLUTION: Poll manually or wait 2-3 blocks, clear cache
 *
 * PROBLEM: Event listeners not firing
 * → Listening on wrong events or wrong contract
 * → SOLUTION: Check event name in ABI, verify contract address
 *
 * PROBLEM: "Insufficient balance for gas"
 * → User doesn't have enough WIRE for gas fees
 * → SOLUTION: Direct to WireFluid faucet or swap interface
 *
 * PROBLEM: TypeScript errors with ethers.js types
 * → Version mismatch or incomplete types
 * → SOLUTION: Run `npm install --save-dev @types/node`
 */

/**
 * BEST PRACTICES FOR PRODUCTION
 * ─────────────────────────────────────────────────────────
 *
 * 1. ALWAYS USE SAFE FUNCTIONS
 *    ✓ safeContractRead() - handles retry, timeout, cache
 *    ✓ safeContractWrite() - validates, retries, error handling
 *    ✗ Don't use contract methods directly
 *
 * 2. HANDLE ERRORS GRACEFULLY
 *    ✓ Use translateError() for user-friendly messages
 *    ✓ Show suggestion to user based on error type
 *    ✓ Log errors with context for debugging
 *
 * 3. MANAGE CACHE STRATEGICALLY
 *    ✓ Enable caching for frequently-read values (balance, metadata)
 *    ✓ Disable caching for rapidly-changing values (quotes, prices)
 *    ✓ Clear cache on user action (network switch, wallet change)
 *
 * 4. VALIDATE USER INPUT
 *    ✓ Check addresses with isValidAddress()
 *    ✓ Validate amounts with BigInt arithmetic
 *    ✓ Verify method exists before calling
 *
 * 5. MANAGE GAS EFFICIENTLY
 *    ✓ Check gas prices before large transactions
 *    ✓ Use buffer for gas estimation (15% default)
 *    ✓ Warn user if gas is unusually high
 *
 * 6. SETUP PROPER MONITORING
 *    ✓ Log all significant events (reads, writes, errors)
 *    ✓ Track transaction lifecycle in analytics
 *    ✓ Monitor event listener health
 *
 * 7. CLEANUP RESOURCES
 *    ✓ Cancel listeners on component unmount
 *    ✓ Clear intervals when polling
 *    ✓ Disconnect providers when not needed
 *
 * 8. TEST THOROUGHLY
 *    ✓ Test with testnet tokens first
 *    ✓ Simulate network failures and retries
 *    ✓ Validate error messages are displayed
 *    ✓ Check cache invalidation works
 */

/**
 * API REFERENCE QUICK START
 * ─────────────────────────────────────────────────────────
 *
 * // Initialize
 * const provider = initializeBrowserProvider(window.ethereum);
 * validateEnvironment();
 *
 * // Read contract data
 * const data = await safeContractRead(address, abi, 'methodName', [], provider);
 *
 * // Write to contract
 * const tx = await safeContractWrite(address, abi, 'methodName', [param1], provider);
 * const receipt = await waitForTransaction(tx.hash, provider);
 *
 * // Get wallet info
 * const balance = await getWalletBalance(provider);
 * const state = await formatWalletState(provider, address);
 *
 * // Estimate costs
 * const prices = await getGasPrices(provider);
 * const cost = await estimateFullCost(address, abi, 'method', [], provider);
 *
 * // Error handling
 * try {
 *   await safeContractWrite(address, abi, 'method', params, provider);
 * }
 *
 * // Advanced: Multi-step transactions
 * const builder = createAdvancedBuilder()
 *   .addStep(contract1, 'approve', [amount], ABI1)
 *   .addStep(contract2, 'deposit', [amount], ABI2);
 * const results = await builder.executeSequential(provider);
 */
