'use client';

/**
 * Wallet Connection Page
 * Connect user's crypto wallet to their account
 * @file app/wallet-connect/page.tsx
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/GlobalAuthContext';
import { ethers } from 'ethers';

const WIRE_CHAIN_ID = 92533;
const WIRE_RPC = 'https://evm.wirefluid.com';
const WIRE_CHAINNAME = 'WireFluid Testnet';

/**
 * Wallet Provider Type
 */
type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase' | 'rainbow';

interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  chainName: string;
  provider: string;
  isConnected: boolean;
}

/**
 * Wallet Connect Page Component
 */
export default function WalletConnectPage() {
  const router = useRouter();
  const { user, connectWallet, isWalletConnected, wallet } = useAuth();
  const [step, setStep] = useState<'provider' | 'connecting' | 'connected'>('provider');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  /**
   * Connect MetaMask wallet
   */
  const connectMetaMask = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if MetaMask is installed
      const ethereum = (window as any).ethereum;
      if (!ethereum || !ethereum.isMetaMask) {
        throw new Error('MetaMask is not installed. Please install it first.');
      }

      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];

      // Get network
      const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainIdHex, 16);

      // Check if on correct network
      if (currentChainId !== WIRE_CHAIN_ID) {
        toast.loading('Please switch to WireFluid Testnet...');

        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${WIRE_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchErr: any) {
          if (switchErr.code === 4902) {
            // Network not added, try to add it
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${WIRE_CHAIN_ID.toString(16)}`,
                  chainName: WIRE_CHAINNAME,
                  rpcUrls: [WIRE_RPC],
                  nativeCurrency: { name: 'WIRE', symbol: 'WIRE', decimals: 18 },
                  blockExplorerUrls: ['https://wiregate.io/'],
                },
              ],
            });
          } else {
            throw switchErr;
          }
        }
      }

      // Get balance
      const provider = new ethers.JsonRpcProvider(WIRE_RPC);
      const balance = await provider.getBalance(address);
      const balanceEther = ethers.formatEther(balance);

      if (parseFloat(balanceEther) < 0.1) {
        setShowLowBalanceWarning(true);
      }

      // Create wallet info
      const info: WalletInfo = {
        address,
        balance: balanceEther,
        chainId: WIRE_CHAIN_ID,
        chainName: WIRE_CHAINNAME,
        provider: 'metamask',
        isConnected: true,
      };

      setWalletInfo(info);
      setStep('connecting');

      // Connect to auth context
      await connectWallet(address, 'metamask', WIRE_CHAIN_ID);

      setStep('connected');
      toast.success('Wallet connected successfully!');

      // Redirect after short delay
      setTimeout(() => {
        router.push('/tickets');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [connectWallet, router]);

  /**
   * Skip wallet connection (for now)
   */
  const handleSkip = useCallback(() => {
    router.push('/tickets');
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-paws-dark via-paws-dark to-paws-dark flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-paws-mauve/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-paws-rose/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-2xl"
      >
        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black bg-gradient-to-r from-paws-mauve to-paws-rose bg-clip-text text-transparent">
              Connect Your Wallet
            </h1>
            <p className="text-gray-400 text-sm">
              Link your crypto wallet to enable blockchain ticket purchases
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between px-4">
            {['Provider', 'Connecting', 'Connected'].map((label, idx) => (
              <React.Fragment key={idx}>
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx <= (['provider', 'connecting', 'connected'].indexOf(step))
                      ? 'bg-gradient-to-r from-paws-mauve to-paws-rose text-white'
                      : 'bg-white/10 text-gray-500'
                  }`}
                  animate={{ scale: idx === ['provider', 'connecting', 'connected'].indexOf(step) ? 1.1 : 1 }}
                >
                  {idx + 1}
                </motion.div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      idx < ['provider', 'connecting', 'connected'].indexOf(step)
                        ? 'bg-gradient-to-r from-paws-mauve to-paws-rose'
                        : 'bg-white/10'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Low Balance Warning */}
          <AnimatePresence>
            {showLowBalanceWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-300"
              >
                ⚠️ Your balance is low. You need at least 0.1 WIRE to make purchases. Get free testnet WIRE from the faucet.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          {step === 'provider' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-gray-400 text-sm">Choose your wallet provider:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* MetaMask */}
                <motion.button
                  onClick={connectMetaMask}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-6 rounded-xl border-2 border-white/10 hover:border-paws-rose/50 bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50 text-center space-y-2"
                >
                  <div className="text-4xl">🦊</div>
                  <p className="font-bold text-white">MetaMask</p>
                  <p className="text-xs text-gray-400">Browser extension</p>
                </motion.button>

                {/* WalletConnect (Coming Soon) */}
                <motion.button
                  disabled
                  className="p-6 rounded-xl border-2 border-white/10 bg-white/3 text-center space-y-2 opacity-50 cursor-not-allowed"
                >
                  <div className="text-4xl">🔗</div>
                  <p className="font-bold text-white">WalletConnect</p>
                  <p className="text-xs text-gray-400">Coming Soon</p>
                </motion.button>

                {/* Coinbase Wallet (Coming Soon) */}
                <motion.button
                  disabled
                  className="p-6 rounded-xl border-2 border-white/10 bg-white/3 text-center space-y-2 opacity-50 cursor-not-allowed"
                >
                  <div className="text-4xl">🪙</div>
                  <p className="font-bold text-white">Coinbase Wallet</p>
                  <p className="text-xs text-gray-400">Coming Soon</p>
                </motion.button>

                {/* Hardware Wallet (Coming Soon) */}
                <motion.button
                  disabled
                  className="p-6 rounded-xl border-2 border-white/10 bg-white/3 text-center space-y-2 opacity-50 cursor-not-allowed"
                >
                  <div className="text-4xl">🔐</div>
                  <p className="font-bold text-white">Hardware Wallet</p>
                  <p className="text-xs text-gray-400">Coming Soon</p>
                </motion.button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 rounded-lg bg-paws-mauve/10 border border-paws-mauve/30 space-y-2">
                <p className="font-semibold text-sm">ℹ️ About Wallet Connection</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>✓ Your private keys stay secure in your wallet</li>
                  <li>✓ We only request permission to read your balance and send transactions</li>
                  <li>✓ You must approve each transaction separately</li>
                  <li>✓ Currently testing on WireFluid Testnet</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Connecting State */}
          {step === 'connecting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-6xl mx-auto"
              >
                ⏳
              </motion.div>

              <div className="space-y-2">
                <p className="font-bold text-lg">Connecting wallet...</p>
                <p className="text-sm text-gray-400">This may take a few seconds</p>
              </div>

              {walletInfo && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-left space-y-2">
                  <div>
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="text-sm font-mono text-white">
                      {walletInfo.address.slice(0, 10)}...{walletInfo.address.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Balance</p>
                    <p className="text-sm text-paws-rose font-bold">{walletInfo.balance} WIRE</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Connected State */}
          {step === 'connected' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl"
              >
                ✅
              </motion.div>

              <div className="space-y-2">
                <p className="font-bold text-lg">Wallet Connected!</p>
                <p className="text-sm text-gray-400">Ready to purchase tickets</p>
              </div>

              {walletInfo && (
                <div className="p-4 rounded-lg bg-paws-rose/10 border border-paws-rose/30 text-left space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Connected Address</p>
                    <p className="text-sm font-mono text-white">
                      {walletInfo.address.slice(0, 10)}...{walletInfo.address.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">WIRE Balance</p>
                    <p className="text-sm text-paws-rose font-bold">{walletInfo.balance} WIRE</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Network</p>
                    <p className="text-sm text-white">{walletInfo.chainName}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400">Redirecting to tickets...</p>
            </motion.div>
          )}

          {/* Skip Button */}
          {step === 'provider' && (
            <div className="text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-400 hover:text-gray-300 underline"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>

        {/* Faucet Link */}
        {showLowBalanceWarning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <a
              href="https://faucet.wirefluid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-paws-electric to-paws-violet text-white font-semibold hover:shadow-lg transition-all"
            >
              → Get Free Testnet WIRE from Faucet
            </a>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
