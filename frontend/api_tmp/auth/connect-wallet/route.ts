/**
 * Connect Wallet API Route
 * Associates wallet address with user account
 * @file app/api/auth/connect-wallet/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

/**
 * Validate Ethereum address format
 */
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Connect Wallet to User Account
 * POST /api/auth/connect-wallet
 * Body: { walletAddress: string, chainId: number, provider: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, chainId, provider } = body;

    // Get authenticated user
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // ========== Validation ==========

    // Validate wallet address format
    if (!walletAddress || !isValidEthereumAddress(walletAddress)) {
      return NextResponse.json(
        { message: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Validate chain ID
    const SUPPORTED_CHAINS = {
      92533: 'WireFluid Testnet',
      1: 'Ethereum Mainnet',
      11155111: 'Ethereum Sepolia Testnet',
    };

    if (!chainId || !Object.keys(SUPPORTED_CHAINS).includes(chainId.toString())) {
      return NextResponse.json(
        {
          message: 'Unsupported blockchain network',
          supportedChains: Object.values(SUPPORTED_CHAINS),
        },
        { status: 400 }
      );
    }

    // Validate provider
    const SUPPORTED_PROVIDERS = ['metamask', 'walletconnect', 'coinbase', 'rainbow'];
    if (!provider || !SUPPORTED_PROVIDERS.includes(provider)) {
      return NextResponse.json(
        {
          message: 'Invalid wallet provider',
          supportedProviders: SUPPORTED_PROVIDERS,
        },
        { status: 400 }
      );
    }

    // ========== Get Wallet Balance (Optional) ==========

    let walletBalance = '0';
    try {
      const rpcUrl =
        chainId === 92533
          ? 'https://evm.wirefluid.com'
          : chainId === 11155111
            ? 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
            : 'https://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_KEY';

      const ethProvider = new ethers.JsonRpcProvider(rpcUrl);
      const balance = await ethProvider.getBalance(walletAddress);
      walletBalance = ethers.formatEther(balance);
    } catch (err) {
      // If balance check fails, continue anyway
      console.warn('Failed to get wallet balance:', err);
    }

    // ========== Database Update (Simulated) ==========

    // In production:
    // 1. UPDATE users SET wallet_address = ?, chain_id = ?, provider = ?, connected_at = NOW()
    // 2. Check for duplicate wallet addresses across accounts (prevent fraud)
    // 3. Log wallet connection for audit trail

    // Simulate checking if wallet already connected
    const existingWallets: Record<string, string> = {
      '0x1234567890123456789012345678901234567890': 'user_other',
    };

    if (existingWallets[walletAddress.toLowerCase()]) {
      return NextResponse.json(
        {
          message: 'This wallet is already connected to another account',
          action: 'use-different-wallet',
        },
        { status: 409 }
      );
    }

    // ========== Response ==========

    const response = NextResponse.json(
      {
        message: 'Wallet connected successfully',
        wallet: {
          address: walletAddress,
          chainId: chainId,
          chainName: SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS],
          provider: provider,
          balance: walletBalance,
          connectedAt: new Date().toISOString(),
        },
        user: {
          walletAddress: walletAddress,
          walletChainId: chainId,
          walletProvider: provider,
        },
      },
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error('Wallet connection error:', error);
    return NextResponse.json(
      { message: 'Failed to connect wallet' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/connect-wallet
 * Get connected wallet info
 */
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // In production, query database for user's wallet info
    return NextResponse.json(
      {
        connected: false,
        wallet: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get wallet info error:', error);
    return NextResponse.json(
      { message: 'Failed to get wallet info' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/connect-wallet
 * Disconnect wallet from user account
 */
export async function DELETE(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // In production:
    // UPDATE users SET wallet_address = NULL, chain_id = NULL, provider = NULL, disconnected_at = NOW()

    return NextResponse.json(
      {
        message: 'Wallet disconnected successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Wallet disconnection error:', error);
    return NextResponse.json(
      { message: 'Failed to disconnect wallet' },
      { status: 500 }
    );
  }
}
