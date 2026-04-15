/**
 * Tip Screen for React Native
 * Player tipping interface with payment ramp integration
 * Select player, choose amount, select charity direction, process payment
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useWireFluid } from '../context/WireFluidContext';

interface Player {
  id: string;
  name: string;
  team: string;
  emoji: string;
  position: string;
  tipsReceived: number;
  charity: string;
  bio: string;
}

const PLAYERS: Player[] = [
  {
    id: 'babar-azam',
    name: 'Babar Azam',
    team: 'Karachi Kings',
    emoji: '🏏',
    position: 'Captain • Batter',
    tipsReceived: 5240,
    charity: 'Pakistan Children Fund',
    bio: 'Leading Karachi Kings with passion and precision',
  },
  {
    id: 'shadab-khan',
    name: 'Shadab Khan',
    team: 'Islamabad United',
    emoji: '⚡',
    position: 'All-rounder • Spinner',
    tipsReceived: 3180,
    charity: 'Sports for All Pakistan',
    bio: 'Young talent bringing electric cricket on the field',
  },
  {
    id: 'wahab-riaz',
    name: 'Wahab Riaz',
    team: 'Peshawar Zalmi',
    emoji: '🔥',
    position: 'Pacer • Veteran',
    tipsReceived: 2890,
    charity: 'Youth Development Foundation',
    bio: 'Experience and fire combined in the pace attack',
  },
  {
    id: 'hasan-ali',
    name: 'Hasan Ali',
    team: 'Peshawar Zalmi',
    emoji: '💨',
    position: 'Pacer • Game Winner',
    tipsReceived: 1950,
    charity: 'Sports Equipment for Schools',
    bio: 'Pressure performer in crucial moments',
  },
  {
    id: 'imam-ul-haq',
    name: 'Imam-ul-Haq',
    team: 'Peshawar Zalmi',
    emoji: '🎯',
    position: 'Opener • Consistent',
    tipsReceived: 2120,
    charity: 'Pakistan Cricket Academy',
    bio: 'Solid opener building strong foundations',
  },
];

type TipStep = 'selectPlayer' | 'enterAmount' | 'selectMethod' | 'review' | 'processing' | 'success';

const TipScreen: React.FC = () => {
  const { user, sendTransaction, isConnecting } = useWireFluid();

  const [step, setStep] = useState<TipStep>('selectPlayer');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const PAYMENT_METHODS = [
    { id: 'jazzcash', name: 'JazzCash', fee: 2.0, time: '2-5 min' },
    { id: 'easypaisa', name: 'EasyPaisa', fee: 1.5, time: '1-3 min' },
    { id: 'hbl', name: 'HBL Wallet', fee: 1.8, time: '2-4 min' },
    { id: 'upi', name: 'UPI', fee: 1.0, time: 'Instant' },
  ];

  const EXCHANGE_RATE = 0.00008; // 1 PKR = 0.00008 WIRE

  const calculateWire = (pkrAmount: number, feePercent: number): number => {
    const afterFee = pkrAmount * (1 - feePercent / 100);
    return Math.round(afterFee * EXCHANGE_RATE * 100) / 100;
  };

  const getSelectedMethod = () => PAYMENT_METHODS.find((m) => m.id === selectedMethod);

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setAmount('');
    setSelectedMethod(null);
    setError('');
    setStep('enterAmount');
  };

  const handleContinueAmount = () => {
    const pkrAmount = parseFloat(amount);
    if (!amount || pkrAmount < 100) {
      setError('Minimum tip is 100 PKR');
      return;
    }
    if (pkrAmount > 50000) {
      setError('Maximum tip is 50,000 PKR');
      return;
    }
    setError('');
    setStep('selectMethod');
  };

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    setStep('review');
  };

  const handleConfirmTip = async () => {
    if (!selectedPlayer || !selectedMethod || !amount) {
      setError('Something went wrong');
      return;
    }

    const method = getSelectedMethod();
    if (!method) return;

    setStep('processing');
    setError('');

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In production: call sendTransaction
      const txHash = await sendTransaction(
        selectedPlayer.id,
        amount,
        selectedMethod
      );

      const wireAmount = calculateWire(parseFloat(amount), method.fee);
      setSuccessMessage(
        `Tipped ${wireAmount} WIRE to ${selectedPlayer.name}!\n\nTransaction: ${txHash.slice(0, 10)}...`
      );
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Tip failed');
      setStep('review');
    }
  };

  const handleNewTip = () => {
    setStep('selectPlayer');
    setSelectedPlayer(null);
    setAmount('');
    setSelectedMethod(null);
    setError('');
    setSuccessMessage('');
  };

  // Step: Select Player
  if (step === 'selectPlayer') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Tip Your Favorite Player</Text>
            <Text style={styles.subtitle}>
              Your tip supports their chosen charity directly
            </Text>
          </View>

          <View style={styles.playerList}>
            {PLAYERS.map((player) => (
              <TouchableOpacity
                key={player.id}
                style={styles.playerCard}
                onPress={() => handleSelectPlayer(player)}
              >
                <View style={styles.playerCardHeader}>
                  <Text style={styles.playerEmoji}>{player.emoji}</Text>
                  <View style={styles.playerInfoContainer}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerPosition}>{player.position}</Text>
                    <Text style={styles.playerTeam}>{player.team}</Text>
                  </View>
                </View>

                <Text style={styles.playerBio}>{player.bio}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{player.tipsReceived}</Text>
                    <Text style={styles.statLabel}>WIRE Received</Text>
                  </View>
                </View>

                <View style={styles.charityBox}>
                  <Text style={styles.charityIcon}>💚</Text>
                  <View style={styles.charityInfo}>
                    <Text style={styles.charityLabel}>Supports</Text>
                    <Text style={styles.charityName}>{player.charity}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.selectButton}>
                  <Text style={styles.selectButtonText}>Tip This Player →</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step: Enter Amount
  if (step === 'enterAmount' && selectedPlayer) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setStep('selectPlayer')}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Tip Amount</Text>
            <Text style={styles.subtitle}>for {selectedPlayer.name}</Text>
          </View>

          <View style={styles.formContainer}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.playerPreview}>
              <Text style={styles.playerEmojiPreview}>{selectedPlayer.emoji}</Text>
              <View>
                <Text style={styles.playerNamePreview}>{selectedPlayer.name}</Text>
                <Text style={styles.charityTextPreview}>→ {selectedPlayer.charity}</Text>
              </View>
            </View>

            <Text style={styles.label}>How much do you want to tip?</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputSuffix}>PKR</Text>
            </View>

            <View style={styles.presetsContainer}>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => setAmount('100')}
              >
                <Text style={styles.presetText}>100</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => setAmount('500')}
              >
                <Text style={styles.presetText}>500</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => setAmount('1000')}
              >
                <Text style={styles.presetText}>1,000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => setAmount('5000')}
              >
                <Text style={styles.presetText}>5,000</Text>
              </TouchableOpacity>
            </View>

            {amount && (
              <View style={styles.previewBox}>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Your tip</Text>
                  <Text style={styles.previewValue}>{parseFloat(amount).toLocaleString()} PKR</Text>
                </View>
                <View style={[styles.previewRow, styles.previewRowLight]}>
                  <Text style={styles.previewLabel}>Arrives as WIRE</Text>
                  <Text style={styles.previewValueWire}>
                    {calculateWire(parseFloat(amount), 2).toFixed(2)} WIRE
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, !amount && styles.buttonDisabled]}
              onPress={handleContinueAmount}
              disabled={!amount}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step: Select Payment Method
  if (step === 'selectMethod' && selectedPlayer) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setStep('enterAmount')}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Choose Payment Method</Text>
            <Text style={styles.subtitle}>Fast & secure payment options</Text>
          </View>

          <View style={styles.methodsContainer}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.methodCard}
                onPress={() => handleSelectMethod(method.id)}
              >
                <View style={styles.methodHeader}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodFee}>{method.fee}% fee</Text>
                </View>
                <Text style={styles.methodTime}>⏱️ {method.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step: Review
  if (step === 'review' && selectedPlayer && selectedMethod) {
    const method = getSelectedMethod();
    const wireAmount = calculateWire(parseFloat(amount), method?.fee || 2);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setStep('selectMethod')}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Confirm Tip</Text>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.reviewBox}>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Player</Text>
              <Text style={styles.reviewValue}>{selectedPlayer.name}</Text>
            </View>

            <View style={styles.reviewDivider} />

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Supports</Text>
              <Text style={styles.reviewValue}>{selectedPlayer.charity}</Text>
            </View>

            <View style={styles.reviewDivider} />

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Amount in PKR</Text>
              <Text style={styles.reviewValue}>{parseFloat(amount).toLocaleString()} PKR</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Payment Method</Text>
              <Text style={styles.reviewValue}>{method?.name}</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Fee ({method?.fee}%)</Text>
              <Text style={styles.reviewValue}>
                - {(parseFloat(amount) * (method?.fee || 2) / 100).toLocaleString()} PKR
              </Text>
            </View>

            <View style={styles.reviewDivider} />

            <View style={[styles.reviewSection, styles.reviewTotal]}>
              <Text style={styles.reviewLabel}>Arrives as WIRE</Text>
              <Text style={styles.reviewValueTotal}>{wireAmount.toFixed(2)} WIRE</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>⚡ Powered by WireFluid</Text>
            <Text style={styles.infoText}>
              Instant confirmation • Transparent on-chain • Near-zero gas fees
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isConnecting && styles.buttonDisabled]}
            onPress={handleConfirmTip}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Confirm Tip</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step: Processing
  if (step === 'processing') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size={48} color="#ec4899" />
          <Text style={styles.processingText}>Processing your tip...</Text>
          <Text style={styles.processingSubtext}>
            Your funds are being sent to {selectedPlayer?.name}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Step: Success
  if (step === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>❤️</Text>
          <Text style={styles.successTitle}>Thanks for the Tip!</Text>
          <Text style={styles.successMessage}>{successMessage}</Text>

          <View style={styles.impactBox}>
            <Text style={styles.impactTitle}>Your Support</Text>
            <Text style={styles.impactText}>
              {selectedPlayer?.name} will direct this tip to{'\n'}
              {selectedPlayer?.charity}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNewTip}
          >
            <Text style={styles.primaryButtonText}>Tip Another Player</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>View Transaction</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
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
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  playerList: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 20,
  },
  playerCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  playerCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  playerEmoji: {
    fontSize: 32,
  },
  playerInfoContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  playerPosition: {
    fontSize: 12,
    color: '#e5e7eb',
    marginBottom: 2,
  },
  playerTeam: {
    fontSize: 11,
    color: '#9ca3af',
  },
  playerBio: {
    fontSize: 12,
    color: '#d1d5db',
    marginBottom: 12,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ec4899',
  },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  charityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 10,
  },
  charityIcon: {
    fontSize: 20,
  },
  charityInfo: {
    flex: 1,
  },
  charityLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  charityName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  selectButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  playerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  playerEmojiPreview: {
    fontSize: 28,
  },
  playerNamePreview: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  charityTextPreview: {
    fontSize: 11,
    color: '#10b981',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 12,
  },
  inputSuffix: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  presetsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderWidth: 1,
    borderColor: '#ec4899',
    borderRadius: 6,
    alignItems: 'center',
  },
  presetText: {
    color: '#ec4899',
    fontSize: 12,
    fontWeight: '600',
  },
  previewBox: {
    backgroundColor: 'rgba(236, 72, 153, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  previewRowLight: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(236, 72, 153, 0.2)',
    marginTop: 8,
    paddingTop: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  previewValueWire: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ec4899',
  },
  methodsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 20,
  },
  methodCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  methodFee: {
    fontSize: 12,
    color: '#ec4899',
    fontWeight: '600',
  },
  methodTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  reviewBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  reviewSection: {
    paddingVertical: 12,
  },
  reviewLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewTotal: {
    paddingVertical: 16,
  },
  reviewValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ec4899',
  },
  infoBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 11,
    color: '#d1fae5',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  primaryButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ec4899',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    marginHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ec4899',
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ec4899',
    fontSize: 14,
    fontWeight: '600',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  processingSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  impactBox: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  impactTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ec4899',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 12,
    color: '#f3e8ff',
    lineHeight: 18,
  },
});

export default TipScreen;
