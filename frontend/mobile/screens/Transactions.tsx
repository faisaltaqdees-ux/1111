/**
 * Transactions Screen for React Native
 * Display user's transaction history with details
 * Shows all donations, tips, and ticket purchases
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useWireFluid } from '../context/WireFluidContext';

interface Transaction {
  id: string;
  type: 'donate' | 'tip' | 'ticket';
  recipient: string;
  amount: number;
  wireAmount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  txHash: string;
  method: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    type: 'donate',
    recipient: 'Karachi Kings Academy',
    amount: 2000,
    wireAmount: 0.16,
    currency: 'PKR',
    status: 'completed',
    date: '2 hours ago',
    txHash: '0x1234567890abcdef...',
    method: 'JazzCash',
  },
  {
    id: 'tx_2',
    type: 'tip',
    recipient: 'Babar Azam',
    amount: 500,
    wireAmount: 0.04,
    currency: 'PKR',
    status: 'completed',
    date: '5 hours ago',
    txHash: '0xabcdef1234567890...',
    method: 'UPI',
  },
  {
    id: 'tx_3',
    type: 'donate',
    recipient: 'Islamabad United Academy',
    amount: 5000,
    wireAmount: 0.40,
    currency: 'PKR',
    status: 'completed',
    date: '1 day ago',
    txHash: '0xfedcba9876543210...',
    method: 'EasyPaisa',
  },
  {
    id: 'tx_4',
    type: 'ticket',
    recipient: 'PSL Match - Karachi vs Islamabad',
    amount: 3000,
    wireAmount: 0.24,
    currency: 'PKR',
    status: 'completed',
    date: '2 days ago',
    txHash: '0x5555666677778888...',
    method: 'HBL Wallet',
  },
  {
    id: 'tx_5',
    type: 'tip',
    recipient: 'Shadab Khan',
    amount: 1000,
    wireAmount: 0.08,
    currency: 'PKR',
    status: 'completed',
    date: '3 days ago',
    txHash: '0x9999aaaabbbbcccc...',
    method: 'JazzCash',
  },
];

const TransactionIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'donate':
      return <Text style={styles.txIcon}>💝</Text>;
    case 'tip':
      return <Text style={styles.txIcon}>❤️</Text>;
    case 'ticket':
      return <Text style={styles.txIcon}>🎫</Text>;
    default:
      return <Text style={styles.txIcon}>💜</Text>;
  }
};

const TransactionStatus = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'completed':
        return 'Confirmed ✓';
      case 'pending':
        return 'Pending...';
      case 'failed':
        return 'Failed ✕';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={[styles.statusBadge, { borderColor: getStatusColor() }]}>
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {getStatusLabel()}
      </Text>
    </View>
  );
};

const TransactionsScreen: React.FC = () => {
  const { user, getTransactionHistory } = useWireFluid();
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'donate' | 'tip' | 'ticket'>('all');

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        // In production: const txs = await getTransactionHistory();
        // setTransactions(txs);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [getTransactionHistory]);

  const filteredTransactions =
    filterType === 'all'
      ? transactions
      : transactions.filter((tx) => tx.type === filterType);

  const openWireFluidExplorer = (txHash: string) => {
    const explorerUrl = `https://testnet-explorer.wirefluid.com/tx/${txHash}`;
    Linking.openURL(explorerUrl).catch(() => {
      // Fallback: just show the hash
      alert(`Transaction Hash: ${txHash}`);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>All your donations, tips, and purchases</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'donate', 'tip', 'ticket'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, filterType === filter && styles.filterButtonActive]}
            onPress={() => setFilterType(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === filter && styles.filterButtonTextActive,
              ]}
            >
              {filter === 'all' && 'All'}
              {filter === 'donate' && 'Donations'}
              {filter === 'tip' && 'Tips'}
              {filter === 'ticket' && 'Tickets'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size={36} color="#ec4899" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>
            Start supporting cricket by making your first donation or tip!
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.txList}>
          {filteredTransactions.map((tx) => (
            <TouchableOpacity
              key={tx.id}
              style={styles.txCard}
              onPress={() => setSelectedTx(tx)}
            >
              <View style={styles.txCardContent}>
                <TransactionIcon type={tx.type} />
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{tx.recipient}</Text>
                  <Text style={styles.txSubtitle}>{tx.date}</Text>
                </View>
              </View>

              <View style={styles.txRight}>
                <View style={styles.txAmountContainer}>
                  <Text style={styles.txAmount}>
                    {tx.amount.toLocaleString()} {tx.currency}
                  </Text>
                  <Text style={styles.txWireAmount}>= {tx.wireAmount} WIRE</Text>
                </View>
                <TransactionStatus status={tx.status} />
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setSelectedTx(null)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <TouchableOpacity onPress={() => setSelectedTx(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Detail Rows */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>
                  {selectedTx.type === 'donate' && 'Donation'}
                  {selectedTx.type === 'tip' && 'Player Tip'}
                  {selectedTx.type === 'ticket' && 'Ticket Purchase'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recipient</Text>
                <Text style={styles.detailValue}>{selectedTx.recipient}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.detailValue}>
                  {selectedTx.amount.toLocaleString()} {selectedTx.currency}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Received as WIRE</Text>
                <Text style={[styles.detailValue, styles.detailValueWire]}>
                  {selectedTx.wireAmount}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailValue}>{selectedTx.method}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View>
                  <TransactionStatus status={selectedTx.status} />
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{selectedTx.date}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction Hash</Text>
                <Text style={styles.detailValueMono}>{selectedTx.txHash}</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>⚡ WireFluid Testnet (92533)</Text>
                <Text style={styles.infoText}>
                  This transaction is recorded on the WireFluid blockchain.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => openWireFluidExplorer(selectedTx.txHash)}
            >
              <Text style={styles.modalButtonText}>View on WireFluid Explorer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => setSelectedTx(null)}
            >
              <Text style={styles.modalButtonSecondaryText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderColor: '#ec4899',
  },
  filterButtonText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#ec4899',
  },
  txList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  txCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  txIcon: {
    fontSize: 24,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  txSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
  },
  txRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  txWireAmount: {
    fontSize: 10,
    color: '#a855f7',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },

  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    fontSize: 18,
    color: '#9ca3af',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  detailValueWire: {
    color: '#a855f7',
  },
  detailValueMono: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#6b7280',
  },
  infoBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 10,
    color: '#d1fae5',
  },
  modalButton: {
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: '#a855f7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonSecondary: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TransactionsScreen;
