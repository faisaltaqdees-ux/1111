/**
 * React Hooks for Web3 Interactions
 * Custom hooks for wallet and contract interactions
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { getProvider, getSigner, getContract, parseContractError } from './contractUtils';
import type { User, TransactionResult } from './types';
import { PSL_IMPACT_MARKET_ABI } from './abi';

/**
 * Hook for wallet connection with localStorage persistence
 */

export function useWallet() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    console.log('🔵 [WALLET] Connect function called');
    
    try {
      // Step 1: Check if wallet is available
      console.log('🔵 [WALLET] Checking for window.ethereum...');
      if (typeof window === 'undefined') {
        console.error('❌ [WALLET] window is undefined (not in browser)');
        throw new Error('Must be called from browser');
      }

      if (!window.ethereum) {
        console.error('❌ [WALLET] window.ethereum is undefined - wallet not installed');
        throw new Error('No Ethereum wallet found. Please install MetaMask or use WalletConnect.');
      }

      console.log('✅ [WALLET] window.ethereum found:', window.ethereum);

      // Step 2: Request accounts from the wallet (opens MetaMask popup, etc)
      console.log('🔵 [WALLET] Requesting accounts via eth_requestAccounts...');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      console.log('✅ [WALLET] Received accounts:', accounts);

      if (!accounts || accounts.length === 0) {
        console.error('❌ [WALLET] No accounts returned');
        throw new Error('No accounts found. Please connect your wallet.');
      }

      // Step 3: Get provider and signer with the account
      console.log('🔵 [WALLET] Getting provider...');
      const provider = await getProvider();
      
      console.log('🔵 [WALLET] Getting signer...');
      const signer = await getSigner(provider);
      
      console.log('🔵 [WALLET] Getting address...');
      const address = await signer.getAddress();
      
      console.log('🔵 [WALLET] Getting balance...');
      const balance = await provider.getBalance(address);
      
      console.log('🔵 [WALLET] Getting network...');
      const network = await provider.getNetwork();

      console.log('🔵 [WALLET] All data retrieved successfully');

      // Step 4: Update user state
      const userData = {
        address,
        balance: balance.toString(),
        isConnected: true,
        chainId: Number(network.chainId),
      };
      
      setUser(userData);
      
      // Step 5: Persist to localStorage
      console.log('🔵 [WALLET] Saving wallet state to localStorage...');
      if (typeof window !== 'undefined') {
        localStorage.setItem('pslpulse_wallet_address', address);
        localStorage.setItem('pslpulse_wallet_connected', 'true');
        console.log('✅ [WALLET] Wallet state saved to localStorage');
      }

      console.log('✅ [WALLET] Wallet connected successfully:', userData);
      return userData;
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to connect wallet';
      console.error('❌ [WALLET] Wallet connection failed:', errorMsg, err);
      setError(errorMsg);
      setUser(null);
      // Clear localStorage on failure
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pslpulse_wallet_address');
        localStorage.removeItem('pslpulse_wallet_connected');
      }
      throw new Error(errorMsg);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('🔵 [WALLET] Disconnect called');
    setUser(null);
    setError(null);
    // Clear localStorage on disconnect
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pslpulse_wallet_address');
      localStorage.removeItem('pslpulse_wallet_connected');
      console.log('✅ [WALLET] Wallet state cleared from localStorage');
    }
  }, []);

  const switchChain = useCallback(async (chainId: number) => {
    try {
      if (!window.ethereum) throw new Error('Wallet not found');

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      await connect();
    } catch (err: any) {
      setError(parseContractError(err));
    }
  }, [connect]);

  // Initialize wallet state from localStorage on mount
  useEffect(() => {
    const initializeWallet = async () => {
      if (typeof window === 'undefined') {
        setIsInitialized(true);
        return;
      }

      try {
        console.log('🔵 [WALLET] Checking for saved wallet state on mount...');
        const wasConnected = localStorage.getItem('pslpulse_wallet_connected') === 'true';
        
        if (!wasConnected) {
          console.log('🔵 [WALLET] No saved wallet state found');
          setIsInitialized(true);
          return;
        }

        // Check if wallet is available
        if (!window.ethereum) {
          console.log('⚠️ [WALLET] Wallet was connected but ethereum provider not available');
          localStorage.removeItem('pslpulse_wallet_address');
          localStorage.removeItem('pslpulse_wallet_connected');
          setIsInitialized(true);
          return;
        }

        // Try to reconnect silently (without popup)
        console.log('🔵 [WALLET] Attempting silent reconnect from localStorage...');
        const provider = await getProvider();
        const signer = await getSigner(provider);
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();

        const userData = {
          address,
          balance: balance.toString(),
          isConnected: true,
          chainId: Number(network.chainId),
        };

        setUser(userData);
        console.log('✅ [WALLET] Silent reconnect successful:', userData);
      } catch (err: any) {
        console.log('⚠️ [WALLET] Silent reconnect failed, clearing saved state:', err?.message);
        localStorage.removeItem('pslpulse_wallet_address');
        localStorage.removeItem('pslpulse_wallet_connected');
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeWallet();
  }, []);

  // Setup event listeners for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('🔵 [WALLET] Accounts changed:', accounts);
      if (accounts.length === 0) {
        console.log('🔵 [WALLET] User disconnected wallet');
        disconnect();
      } else {
        console.log('🔵 [WALLET] Account changed, reconnecting...');
        connect();
      }
    };

    const handleChainChanged = () => {
      console.log('🔵 [WALLET] Chain changed, reconnecting...');
      connect();
    };

    if (window.ethereum.on) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
      };
    }
  }, [connect, disconnect]);

  return { user, error, isConnecting, connect, disconnect, switchChain };
}

/**
 * Hook for contract interaction
 */
export function useContract(contractAddress: string, abi: any[]) {
  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (!contractAddress) return;
        const provider = await getProvider();
        const contractInstance = getContract(contractAddress, abi, provider);
        setContract(contractInstance);
      } catch (error) {
        console.error('Failed to initialize contract:', error);
      }
    };

    initializeContract();
  }, [contractAddress, abi]);

  const send = useCallback(
    async (method: string, ...args: any[]): Promise<TransactionResult> => {
      setIsLoading(true);
      try {
        if (!contract) throw new Error('Contract not initialized');

        const signer = await getSigner();
        const contractWithSigner = getContract(contractAddress, abi, signer);
        const tx = await contractWithSigner[method](...args);
        const receipt = await tx.wait(1);

        return {
          hash: receipt?.transactionHash || tx.hash,
          status: 'success',
          blockNumber: receipt?.blockNumber,
        };
      } catch (error: any) {
        return {
          hash: '',
          status: 'failed',
          error: parseContractError(error),
        };
      } finally {
        setIsLoading(false);
      }
    },
    [contract, contractAddress, abi]
  );

  const call = useCallback(
    async (method: string, ...args: any[]) => {
      try {
        if (!contract) throw new Error('Contract not initialized');
        return await contract[method](...args);
      } catch (error) {
        console.error(`Error calling ${method}:`, error);
        throw error;
      }
    },
    [contract]
  );

  return { contract, isLoading, send, call };
}

/**
 * Hook for fetching user balance
 */
export function useBalance(userAddress?: string) {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!userAddress) return;
    setIsLoading(true);
    try {
      const provider = await getProvider();
      const bal = await provider.getBalance(userAddress);
      setBalance(bal.toString());
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, isLoading, refresh: fetchBalance };
}

/**
 * Hook for smart contract state
 */
export function useContractState(contractAddress: string, abi: any[], stateKey: string) {
  const [state, setState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { call } = useContract(contractAddress, abi);

  const fetchState = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await call(stateKey);
      setState(result);
      setError(null);
    } catch (err: any) {
      setError(parseContractError(err));
    } finally {
      setIsLoading(false);
    }
  }, [call, stateKey]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return { state, isLoading, error, refetch: fetchState };
}
