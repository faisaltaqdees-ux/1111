/**
 * WireFluid Context for React Native
 * Manages wallet and transaction state across the mobile app
 * Integrates with WireFluid blockchain testnet (DAPP ONLY - No Accounts)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface WireFluidUser {
  walletAddress: string;
  balance: number;
  chainId: number;
}

export interface WireFluidContextType {
  user: WireFluidUser | null;
  isConnected: boolean;
  isInitializing: boolean;
  isConnecting: boolean;
  chainId: number; // WireFluid testnet: 92533
  
  // Blockchain methods
  connectWallet: () => Promise<WireFluidUser>;
  disconnectWallet: () => Promise<void>;
  
  // Transaction methods
  sendTransaction: (to: string, amount: string, data?: string) => Promise<string>;
  getTransactionHistory: () => Promise<any[]>;
  
  // Balance methods
  updateBalance: () => Promise<void>;
  getBalance: () => number;
}

const WireFluidContext = createContext<WireFluidContextType | undefined>(undefined);

export function useWireFluid(): WireFluidContextType {
  const context = useContext(WireFluidContext);
  if (!context) {
    throw new Error('useWireFluid must be used within WireFluidProvider');
  }
  return context;
}

export function WireFluidProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<WireFluidUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const chainId = 92533; // WireFluid testnet

  // Initialize: Check for stored wallet connection
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('pslpulse_wallet');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (err) {
        console.error('❌ [WireFluid] Init failed:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeWallet();
  }, []);

  // Connect MetaMask wallet
  const connectWallet = async (): Promise<WireFluidUser> => {
    setIsConnecting(true);
    try {
      // In production: use eth_provider RN bridge
      // Connect to user's MetaMask mobile wallet
      // Request eth_requestAccounts
      
      const address = '0xSimulatedMetaMaskAddress'; // Placeholder
      
      const userData: WireFluidUser = {
        walletAddress: address,
        balance: 0,
        chainId: 92533,
      };

      await AsyncStorage.setItem('pslpulse_wallet', JSON.stringify(userData));
      
      setUser(userData);
      console.log('✅ [WireFluid] Wallet connected:', address);
      return userData;
    } catch (err) {
      console.error('❌ [WireFluid] Wallet connection failed:', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('pslpulse_wallet');
      setUser(null);
      console.log('✅ [WireFluid] Wallet disconnected');
    } catch (err) {
      console.error('❌ [WireFluid] Disconnect failed:', err);
      throw err;
    }
  };

  // Send transaction
  const sendTransaction = async (to: string, amount: string, data?: string): Promise<string> => {
    if (!user) throw new Error('Not connected');

    try {
      console.log('🔵 [WireFluid] Sending transaction:', { to, amount, data });
      
      // Simulated: generate transaction hash
      const txHash = `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`;
      
      console.log('✅ [WireFluid] Transaction confirmed:', txHash);
      return txHash;
    } catch (err) {
      console.error('❌ [WireFluid] Transaction failed:', err);
      throw err;
    }
  };

  // Get transaction history
  const getTransactionHistory = async (): Promise<any[]> => {
    if (!user) return [];

    try {
      // In production: fetch from WireFluid RPC
      const storedTxs = await AsyncStorage.getItem(`history_${user.walletAddress}`);
      return storedTxs ? JSON.parse(storedTxs) : [];
    } catch (err) {
      console.error('❌ [WireFluid] Failed to fetch transactions:', err);
      return [];
    }
  };

  // Update balance
  const updateBalance = async (): Promise<void> => {
    if (!user) return;

    try {
      // In production: fetch from WireFluid RPC
      // const balance = await ethGetBalance(user.walletAddress)
      
      const newBalance = Math.floor(Math.random() * 1000);
      const updatedUser = { ...user, balance: newBalance };
      
      setUser(updatedUser);
      await AsyncStorage.setItem('pslpulse_wallet', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('❌ [WireFluid] Failed to update balance:', err);
    }
  };

  // Get balance
  const getBalance = (): number => {
    return user?.balance || 0;
  };

  const value: WireFluidContextType = {
    user,
    isConnected: !!user,
    isInitializing,
    isConnecting,
    chainId,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    getTransactionHistory,
    updateBalance,
    getBalance,
  };

  return (
    <WireFluidContext.Provider value={value}>
      {children}
    </WireFluidContext.Provider>
  );
}
