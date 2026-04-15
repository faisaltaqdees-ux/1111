/**
 * Payment Receipt Modal
 * Displays transaction details, NFT info, and receipt after successful payment
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ReceiptData {
  transactionHash: string;
  blockNumber: number;
  confirmations: number;
  nftTokenIds: string[];
  receipts: Array<{
    receiptId: string;
    qrCode: string;
    seatSection?: string;
    tokenId?: string;
  }>;
  matchId: string;
  quantity: number;
  amount: string;
  timestamp: string;
}

interface PaymentReceiptProps {
  isOpen: boolean;
  data: ReceiptData | null;
  onClose: () => void;
}

export function PaymentReceipt({ isOpen, data, onClose }: PaymentReceiptProps) {
  if (!data) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/30 overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-rose-600 px-6 py-8 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-purple-100">Your tickets are being minted as NFTs</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Transaction Hash */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400">Transaction Hash</label>
                <div
                  className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                  onClick={() => copyToClipboard(data.transactionHash)}
                >
                  <code className="flex-1 text-sm text-white font-mono break-all">
                    {data.transactionHash}
                  </code>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Blockchain Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-600/10 to-rose-600/10 border border-purple-500/30">
                  <p className="text-xs text-gray-400 mb-1">Block Number</p>
                  <p className="text-lg font-bold text-white">{data.blockNumber.toLocaleString()}</p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-600/10 to-rose-600/10 border border-purple-500/30">
                  <p className="text-xs text-gray-400 mb-1">Confirmations</p>
                  <p className="text-lg font-bold text-green-400">{data.confirmations}</p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-600/10 to-rose-600/10 border border-purple-500/30">
                  <p className="text-xs text-gray-400 mb-1">Tickets Purchased</p>
                  <p className="text-lg font-bold text-white">{data.quantity}</p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-600/10 to-rose-600/10 border border-purple-500/30">
                  <p className="text-xs text-gray-400 mb-1">Amount Paid</p>
                  <p className="text-lg font-bold text-white">{data.amount} WIRE</p>
                </div>
              </div>

              {/* QR Codes for Tickets */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-400">Ticket QR Codes (Scan at Stadium)</label>
                <div className="space-y-4">
                  {data.receipts && data.receipts.length > 0 ? (
                    data.receipts.map((receipt, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400">Ticket {idx + 1}</p>
                            <p className="text-sm font-semibold text-white">Seat: {receipt.seatSection || 'TBD'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Receipt ID</p>
                            <p className="text-xs font-mono text-gray-400">{receipt.receiptId.slice(0, 12)}...</p>
                          </div>
                        </div>
                        {receipt.qrCode && (
                          <div className="flex justify-center py-2">
                            <img 
                              src={receipt.qrCode} 
                              alt={`QR Code for ticket ${idx + 1}`}
                              className="w-32 h-32 rounded-lg border border-white/20 p-2 bg-white"
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-500 text-center">
                          Scan this code at the stadium entrance
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg bg-yellow-600/10 border border-yellow-500/30 text-yellow-300 text-sm">
                      ⏳ QR codes are being generated. Refresh in a moment...
                    </div>
                  )}
                </div>
              </div>

              {/* NFT Token IDs */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-400">NFT Ticket IDs</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.nftTokenIds.map((tokenId, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                      onClick={() => copyToClipboard(tokenId)}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                        {idx + 1}
                      </div>
                      <code className="flex-1 text-sm text-gray-300 font-mono break-all">{tokenId}</code>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-3">
                <a
                  href={`https://testnet.wirescan.io/tx/${data.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors text-center"
                >
                  View on Wirescan →
                </a>
                <button
                  onClick={() => {
                    // TODO: Implement save receipt as PDF
                    toast.success('Receipt saved!');
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-semibold transition-colors"
                >
                  Download Receipt
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full px-4 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
              >
                Done
              </button>
            </div>

            {/* Footer Info */}
            <div className="bg-white/5 border-t border-white/10 px-6 py-4 text-center text-sm text-gray-400">
              <p>💡 NFT tickets are being minted on WireFluid blockchain</p>
              <p>Your tickets will appear in your wallet within 1-2 minutes</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
