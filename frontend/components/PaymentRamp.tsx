'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  PAKISTAN_PAYMENT_METHODS,
  calculateWireAmount,
  formatAmount,
  validatePaymentMethod,
  processPayment,
  PaymentMethod,
} from '../lib/payments';

interface PaymentRampProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string, wireAmount: number) => void;
  destinationWallet: string;
  recipientName?: string; // E.g., "Lahore Qalandars Academy"
  action?: string; // E.g., "Tip Babar", "Donate Kit", "Buy Ticket"
}

/**
 * PaymentRamp Component
 * Advanced payment processor with method selection, validation, amount preview
 * All roads lead to WireFluid testnet
 */
export function PaymentRamp({
  isOpen,
  onClose,
  onSuccess,
  destinationWallet,
  recipientName = 'PSL Pulse',
  action = 'Send',
}: PaymentRampProps): React.ReactElement {
  const [step, setStep] = useState<'methods' | 'amount' | 'review' | 'processing'>('methods');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [amountError, setAmountError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const wireAmount = selectedMethod ? calculateWireAmount(parseFloat(amount) || 0, selectedMethod.fee) : 0;
  const totalFee = selectedMethod ? (parseFloat(amount) || 0) * (selectedMethod.fee / 100) : 0;

  const resetForm = () => {
    setStep('methods');
    setSelectedMethod(null);
    setAmount('');
    setAmountError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('amount');
    setAmountError('');
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    const cleaned = value.replace(/[^0-9.]/g, '');
    setAmount(cleaned);
    setAmountError('');
  };

  const handleProceedToReview = () => {
    if (!selectedMethod || !amount) {
      setAmountError('Enter an amount');
      return;
    }

    const numAmount = parseFloat(amount);
    const validation = validatePaymentMethod(selectedMethod, numAmount);

    if (validation) {
      setAmountError(validation);
      return;
    }

    setStep('review');
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod || isProcessing) return;

    setIsProcessing(true);

    try {
      const userId = localStorage.getItem('pslpulse_auth_token') || 'anonymous';
      const transaction = await processPayment(userId, selectedMethod.id, parseFloat(amount), destinationWallet);

      toast.success(`✅ Transfer complete! ${formatAmount(wireAmount, 'WIRE')} sent to ${recipientName}`);
      onSuccess(transaction.id, transaction.amountWire);
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      toast.error(message);
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return <></>;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="relative w-full max-w-lg mx-4 rounded-2xl bg-linear-to-br from-slate-900/95 to-slate-950/95 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-6 bg-linear-to-r from-purple-600/20 to-rose-600/20 border-b border-white/10">
            <h2 className="text-3xl font-bold text-white mb-1">{action}</h2>
            <p className="text-gray-400 text-sm">
              Support <span className="font-semibold text-white">{recipientName}</span> instantly
            </p>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* ===== STEP 1: SELECT METHOD ===== */}
              {step === 'methods' && (
                <motion.div
                  key="methods"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Choose Payment Method</h3>

                  {PAKISTAN_PAYMENT_METHODS.map((method) => (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectMethod(method)}
                      className="w-full p-4 rounded-xl border-2 border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl mt-1">{method.icon}</div>
                          <div>
                            <h4 className="font-semibold text-white">{method.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">
                              {formatAmount(method.minAmount)} - {formatAmount(method.maxAmount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Fee: {method.fee}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{method.processingTime}</p>
                          <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <svg className="w-5 h-5 text-gray-400 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    </motion.button>
                  ))}

                  {/* Info */}
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs mt-4">
                    💡 All payments convert to WIRE on WireFluid testnet (Chain ID 92533). Transfers complete instantly.
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 2: ENTER AMOUNT ===== */}
              {step === 'amount' && selectedMethod && (
                <motion.div
                  key="amount"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <button
                    onClick={() => setStep('methods')}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    ← Change method
                  </button>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">How much do you want to send?</h3>
                    <p className="text-gray-400 text-sm">
                      Using {selectedMethod.name} • Fee: {selectedMethod.fee}%
                    </p>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Amount</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="0"
                        className={`w-full px-4 py-4 rounded-xl bg-white/5 border-2 text-white font-semibold text-lg placeholder-gray-600 focus:outline-none transition-all ${
                          amountError
                            ? 'border-red-500/50 focus:border-red-500'
                            : 'border-white/10 focus:border-purple-500'
                        }`}
                        autoFocus
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                        PKR
                      </span>
                    </div>
                    {amountError && <p className="text-red-400 text-xs mt-2">{amountError}</p>}
                  </div>

                  {/* Quick Amount Presets */}
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 5000].map((preset) => (
                      <motion.button
                        key={preset}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAmount(preset.toString())}
                        className="py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all"
                      >
                        {preset}
                      </motion.button>
                    ))}
                  </div>

                  {/* Preview */}
                  {amount && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-purple-600/10 border border-purple-500/20"
                    >
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-300">
                          <span>Subtotal</span>
                          <span className="font-semibold">{formatAmount(parseFloat(amount))}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Fee ({selectedMethod.fee}%)</span>
                          <span>-{formatAmount(totalFee)}</span>
                        </div>
                        <div className="border-t border-white/10 pt-2 flex justify-between text-white font-semibold">
                          <span>You send</span>
                          <span>{formatAmount(parseFloat(amount))}</span>
                        </div>
                        <div className="flex justify-between text-purple-300 font-semibold">
                          <span>Arrives as WIRE</span>
                          <span>{formatAmount(wireAmount, 'WIRE')}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Proceed Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProceedToReview}
                    disabled={!amount}
                    className="w-full py-3 rounded-lg bg-linear-to-r from-purple-600 to-rose-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review Payment
                  </motion.button>
                </motion.div>
              )}

              {/* ===== STEP 3: REVIEW & CONFIRM ===== */}
              {step === 'review' && selectedMethod && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-white">Review Payment</h3>

                  {/* Payment Details */}
                  <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{selectedMethod.icon}</div>
                      <div>
                        <p className="text-sm text-gray-400">Payment Method</p>
                        <p className="font-semibold text-white">{selectedMethod.name}</p>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount</span>
                        <span className="text-white font-semibold">{formatAmount(parseFloat(amount))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Processing Fee</span>
                        <span className="text-gray-400">-{formatAmount(totalFee)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between text-lg">
                        <span className="text-white font-semibold">Total in WIRE</span>
                        <span className="text-purple-400 font-bold">{formatAmount(wireAmount, 'WIRE')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipient Info */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-300 mb-2">📮 Goes To</p>
                    <p className="font-semibold text-white">{recipientName}</p>
                    <p className="text-xs text-blue-200 mt-1 font-mono">{destinationWallet.slice(0, 10)}...{destinationWallet.slice(-8)}</p>
                  </div>

                  {/* WireFluid Info */}
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-xs">
                    ⚡ Powered by WireFluid (Testnet 92533) • Instant confirmation • Near-zero gas fees
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep('amount')}
                      disabled={isProcessing}
                      className="flex-1 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/5 transition-all disabled:opacity-50"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProcessPayment}
                      disabled={isProcessing}
                      className="flex-1 py-3 rounded-lg bg-linear-to-r from-purple-600 to-rose-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm & Send'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 4: PROCESSING ===== */}
              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-center"
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                    <div className="text-6xl mx-auto w-fit">⚡</div>
                  </motion.div>
                  <div>
                    <p className="text-white font-semibold text-lg">Processing Payment</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Your {formatAmount(wireAmount, 'WIRE')} is being sent to {recipientName}...
                    </p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                    <motion.div
                      className="bg-linear-to-r from-purple-600 to-rose-600 h-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 4, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
