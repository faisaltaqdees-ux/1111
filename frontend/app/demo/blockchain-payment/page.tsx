/**
 * Demo Page: Blockchain Payment Integration
 * 
 * This page demonstrates:
 * 1. How to use useBlockchainPayment hook
 * 2. How to use PaymentButton component
 * 3. How to handle the payment flow
 * 4. How to display payment status
 */

'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { PaymentButton, PaymentModal, DonationCard } from '@/components/PaymentButton';
import { useBlockchainPayment } from '@/lib/hooks/useBlockchainPayment';

export default function BlockchainPaymentDemo() {
  // Test wallet (use your own)
  const testWallet = '0x742d35Cc6634C0532925a3b844Bc416e4aE92894';

  const [userAddress, setUserAddress] = useState(testWallet);
  const [showModal, setShowModal] = useState(false);
  const [donationHistory, setDonationHistory] = useState<
    Array<{ txHash: string; amount: string; timestamp: string }>
  >([]);

  const {
    initiatePayment,
    executePayment,
    checkStatus,
    paymentState,
  } = useBlockchainPayment();

  /**
   * Handle direct payment flow (without component)
   */
  const handleDirectPayment = async () => {
    try {
      const txId = await initiatePayment({
        userAddress,
        wireAmount: ethers.parseEther('0.1'),
        purpose: 'donation',
        metadata: { description: 'Demo payment' },
      });

      console.log('Payment initiated:', txId);

      const success = await executePayment(txId);
      if (success) {
        console.log('Payment executed:', paymentState);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          🪙 WIRE Payment Integration Demo
        </h1>
        <p className="text-gray-300">
          Test real blockchain payments with the WireFluid testnet
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Connection Status */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Connection Status</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <span className="text-gray-300">Wallet Address</span>
              <code className="text-green-400 font-mono text-sm">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </code>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <span className="text-gray-300">Network</span>
              <span className="text-green-400 font-semibold">WireFluid Testnet</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <span className="text-gray-300">Chain ID</span>
              <code className="text-blue-400 font-mono">92533</code>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <span className="text-gray-300">RPC Endpoint</span>
              <a
                href="https://evm.wirefluid.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline text-sm"
              >
                evm.wirefluid.com →
              </a>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-900 border border-blue-700 rounded-lg">
            <p className="text-blue-200 text-sm">
              💡 Get test WIRE from the{' '}
              <a
                href="https://faucet.wirefluid.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                WireFluid Faucet
              </a>
            </p>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Available API Endpoints</h2>

          <div className="space-y-4">
            {/* Health Check */}
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                  GET
                </span>
                <code className="text-gray-300">/api/blockchain/health</code>
              </div>
              <p className="text-gray-400 text-sm">Check RPC connection status</p>
            </div>

            {/* Initiate Payment */}
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                  POST
                </span>
                <code className="text-gray-300">/api/blockchain/payment/initiate</code>
              </div>
              <p className="text-gray-400 text-sm">Create a pending transaction</p>
              <pre className="mt-2 p-2 bg-slate-800 rounded text-xs text-gray-300 overflow-x-auto">
{`POST Body:
{
  "userAddress": "0x...",
  "wireAmount": "350000000000000000",
  "purpose": "donation",
  "metadata": { "matchId": "match_123" }
}`}
              </pre>
            </div>

            {/* Execute Payment */}
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                  POST
                </span>
                <code className="text-gray-300">/api/blockchain/payment/execute</code>
              </div>
              <p className="text-gray-400 text-sm">Send transaction to blockchain</p>
              <pre className="mt-2 p-2 bg-slate-800 rounded text-xs text-gray-300 overflow-x-auto">
{`POST Body:
{
  "transactionId": "tx_1713199834567_abc123"
}`}
              </pre>
            </div>

            {/* Check Status */}
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                  GET
                </span>
                <code className="text-gray-300">/api/blockchain/payment/status</code>
              </div>
              <p className="text-gray-400 text-sm">Poll transaction status</p>
              <pre className="mt-2 p-2 bg-slate-800 rounded text-xs text-gray-300 overflow-x-auto">
{`Query: ?txId=tx_1713199834567_abc123
Returns: transaction status, txHash, blockNumber`}
              </pre>
            </div>
          </div>
        </div>

        {/* Payment Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Example 1: Simple Payment Button */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Simple Payment</h3>
            <p className="text-gray-400 text-sm mb-4">
              Basic usage: 0.35 WIRE donation
            </p>

            <PaymentButton
              userAddress={userAddress}
              wireAmount={ethers.parseEther('0.35')}
              purpose="donation"
              label="Donate 0.35 WIRE"
              variant="primary"
              onSuccess={(txHash) => {
                setDonationHistory((prev) => [
                  ...prev,
                  {
                    txHash,
                    amount: '0.35',
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ]);
              }}
              onError={(error) => console.error(error)}
            />
          </div>

          {/* Example 2: Modal Payment */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Modal Payment</h3>
            <p className="text-gray-400 text-sm mb-4">
              Payment in a modal dialog
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="w-full px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition"
            >
              Open Payment Modal
            </button>

            <PaymentModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              userAddress={userAddress}
              wireAmount={ethers.parseEther('0.5')}
              purpose="donation"
              onSuccess={(txHash) => {
                setDonationHistory((prev) => [
                  ...prev,
                  {
                    txHash,
                    amount: '0.5',
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ]);
              }}
            />
          </div>

          {/* Example 3: Custom Amounts */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Custom Amount</h3>
            <p className="text-gray-400 text-sm mb-4">
              User can set donation amount
            </p>

            <DonationCard
              userAddress={userAddress}
              matchId="match_demo_001"
              onDonationComplete={(txHash) => {
                setDonationHistory((prev) => [
                  ...prev,
                  {
                    txHash,
                    amount: 'custom',
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ]);
              }}
            />
          </div>

          {/* Example 4: Direct API Call */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Direct API Usage</h3>
            <p className="text-gray-400 text-sm mb-4">
              Use the hook directly for custom flows
            </p>

            <button
              onClick={handleDirectPayment}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition"
            >
              Send 0.1 WIRE (Custom Flow)
            </button>
          </div>
        </div>

        {/* Transaction History */}
        {donationHistory.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Transaction History ({donationHistory.length})
            </h2>

            <div className="space-y-2">
              {donationHistory.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                >
                  <div>
                    <p className="text-green-400 font-mono text-sm">
                      {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                    </p>
                    <p className="text-gray-400 text-xs">{tx.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{tx.amount} WIRE</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documentation */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Integration Guide</h2>

          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">1️⃣ Import Hook</h3>
              <pre className="bg-slate-700 p-3 rounded text-sm overflow-x-auto">
{`import { useBlockchainPayment } from '@/lib/hooks/useBlockchainPayment';`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">2️⃣ Use in Component</h3>
              <pre className="bg-slate-700 p-3 rounded text-sm overflow-x-auto">
{`const { initiatePayment, executePayment } = useBlockchainPayment();

const txId = await initiatePayment({
  userAddress: '0x...',
  wireAmount: ethers.parseEther('0.35'),
  purpose: 'donation'
});

await executePayment(txId);`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">3️⃣ Or Use Component</h3>
              <pre className="bg-slate-700 p-3 rounded text-sm overflow-x-auto">
{`import { PaymentButton } from '@/components/PaymentButton';

<PaymentButton
  userAddress={userAddress}
  wireAmount={ethers.parseEther('0.35')}
  purpose="donation"
  onSuccess={(txHash) => console.log(txHash)}
/>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Current State Debug */}
        {paymentState.txId && (
          <div className="bg-slate-800 border border-yellow-600 rounded-xl p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Current Payment State</h2>

            <pre className="bg-slate-700 p-4 rounded text-sm text-gray-300 overflow-x-auto">
              {JSON.stringify(paymentState, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-gray-400 text-sm">
        <p>
          🔗 Explore transactions on{' '}
          <a
            href="https://testnet-explorer.wirefluid.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            WireScan Testnet Explorer
          </a>
        </p>
      </div>
    </div>
  );
}
