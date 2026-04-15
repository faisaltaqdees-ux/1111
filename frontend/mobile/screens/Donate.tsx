/**
 * Donate Screen for React Native
 * Academy donation interface with payment ramp integration
 * Select academy, choose amount, process payment, confirm receipt
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
  Modal,
  Alert,
} from 'react-native';
import { useWireFluid } from '../context/WireFluidContext';

interface Academy {
  id: string;
  name: string;
  team: string;
  image: string;
  need: string;
  goal: number;
  raised: number;
  impact: string;
}

const ACADEMIES: Academy[] = [
  {
    id: 'kk-academy',
    name: 'Karachi Kings Youth Academy',
    team: 'Karachi Kings',
    image: '👑',
    need: 'Cricket equipment and nets',
    goal: 50000,
    raised: 32000,
    impact: 'Every 1000 WIRE = 3 cricket bats for kids',
  },
  {
    id: 'iu-academy',
    name: 'Islamabad Junior Program',
    team: 'Islamabad United',
    image: '💙',
    need: 'Training facility upgrades',
    goal: 35000,
    raised: 18000,
    impact: 'Every 1500 WIRE = coaching for 10 kids',
  },
  {
    id: 'pz-academy',
    name: 'Peshawar Talent Hunt',
    team: 'Peshawar Zalmi',
    image: '🔥',
    need: 'Protective gear and helmets',
    goal: 45000,
    raised: 28000,
    impact: 'Every 800 WIRE = safety kit for 1 player',
  },
];

type DonateStep = 'selectAcademy' | 'enterAmount' | 'selectMethod' | 'review' | 'processing' | 'success';

const DonateScreen: React.FC = () => {
  const { user, sendTransaction, isConnecting } = useWireFluid();

  const [step, setStep] = useState<DonateStep>('selectAcademy');
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
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

  const handleSelectAcademy = (academy: Academy) => {
    setSelectedAcademy(academy);
    setAmount('');
    setSelectedMethod(null);
    setError('');
    setStep('enterAmount');
  };

  const handleContinueAmount = () => {
    const pkrAmount = parseFloat(amount);
    if (!amount || pkrAmount < 500) {
      setError('Minimum donation is 500 PKR');
      return;
    }
    if (pkrAmount > 100000) {
      setError('Maximum donation is 100,000 PKR');
      return;
    }
    setError('');
    setStep('selectMethod');
  };

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    setStep('review');
  };

  const handleConfirmDonation = async () => {
    if (!selectedAcademy || !selectedMethod || !amount) {
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
        selectedAcademy.id,
        amount,
        selectedMethod
      );

      const wireAmount = calculateWire(parseFloat(amount), method.fee);
      setSuccessMessage(
        `Donated ${wireAmount} WIRE to ${selectedAcademy.name}!\n\nTransaction: ${txHash.slice(0, 10)}...`
      );
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Donation failed');
      setStep('review');
    }
  };

  const handleNewDonation = () => {
    setStep('selectAcademy');
    setSelectedAcademy(null);
    setAmount('');
    setSelectedMethod(null);
    setError('');
    setSuccessMessage('');
  };

  // Step: Select Academy
  if (step === 'selectAcademy') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Support an Academy</Text>
            <Text style={styles.subtitle}>Choose which academy to support today</Text>
          </View>

          <View style={styles.academyList}>
            {ACADEMIES.map((academy) => {
              const progress = (academy.raised / academy.goal) * 100;
              return (
                <TouchableOpacity
                  key={academy.id}
                  style={styles.academyCard}
                  onPress={() => handleSelectAcademy(academy)}
                >
                  <View style={styles.academyCardHeader}>
                    <Text style={styles.academyImage}>{academy.image}</Text>
                    <View style={styles.academyTextContainer}>
                      <Text style={styles.academyName}>{academy.name}</Text>
                      <Text style={styles.academyTeam}>{academy.team}</Text>
                    </View>
                  </View>

                  <Text style={styles.needText}>{academy.need}</Text>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(progress, 100)}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.progressText}>
                    <Text style={styles.raisedText}>
                      {academy.raised.toLocaleString()} / {academy.goal.toLocaleString()} PKR
                    </Text>
                    <Text style={styles.percentText}>{Math.round(progress)}%</Text>
                  </View>

                  <Text style={styles.impactText}>💡 {academy.impact}</Text>

                  <TouchableOpacity style={styles.selectButton}>
                    <Text style={styles.selectButtonText}>Choose This Academy →</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step: Enter Amount
  if (step === 'enterAmount' && selectedAcademy) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setStep('selectAcademy')}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Donation Amount</Text>
            <Text style={styles.subtitle}>to {selectedAcademy.name}</Text>
          </View>

          <View style={styles.formContainer}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.label}>How much do you want to donate?</Text>

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
                onPress={() => setAmount('500')}
              >
                <Text style={styles.presetText}>500</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => setAmount('2000')}
              >
                <Text style={styles.presetText}>2,000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => setAmount('5000')}
              >
                <Text style={styles.presetText}>5,000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => setAmount('10000')}
              >
                <Text style={styles.presetText}>10,000</Text>
              </TouchableOpacity>
            </View>

            {amount && (
              <View style={styles.previewBox}>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Your donation</Text>
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
  if (step === 'selectMethod' && selectedAcademy) {
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
  if (step === 'review' && selectedAcademy && selectedMethod) {
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
            <Text style={styles.title}>Confirm Donation</Text>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.reviewBox}>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Academy</Text>
              <Text style={styles.reviewValue}>{selectedAcademy.name}</Text>
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
                - {(parseFloat(amount) * (method?.fee || 2) / 100).toLocaleString()}  PKR
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
            onPress={handleConfirmDonation}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Confirm Donation</Text>
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
          <Text style={styles.processingText}>Processing your donation...</Text>
          <Text style={styles.processingSubtext}>
            Your funds are being sent to {selectedAcademy?.name}
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
          <Text style={styles.successEmoji}>✨</Text>
          <Text style={styles.successTitle}>Donation Successful!</Text>
          <Text style={styles.successMessage}>{successMessage}</Text>

          <View style={styles.impactBox}>
            <Text style={styles.impactTitle}>Your Impact</Text>
            <Text style={styles.impactText}>{selectedAcademy?.impact}</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNewDonation}
          >
            <Text style={styles.primaryButtonText}>Donate Again</Text>
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
  academyList: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 20,
  },
  academyCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  academyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  academyImage: {
    fontSize: 32,
  },
  academyTextContainer: {
    flex: 1,
  },
  academyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  academyTeam: {
    fontSize: 12,
    color: '#9ca3af',
  },
  needText: {
    fontSize: 13,
    color: '#e5e7eb',
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a855f7',
  },
  progressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  raisedText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  percentText: {
    fontSize: 11,
    color: '#a855f7',
    fontWeight: '600',
  },
  impactText: {
    fontSize: 12,
    color: '#10b981',
    marginBottom: 12,
  },
  selectButton: {
    backgroundColor: '#a855f7',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderWidth: 1,
    borderColor: '#a855f7',
    borderRadius: 6,
    alignItems: 'center',
  },
  presetText: {
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '600',
  },
  previewBox: {
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
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
    borderTopColor: 'rgba(168, 85, 247, 0.2)',
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
    color: '#a855f7',
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
    color: '#a855f7',
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
    color: '#a855f7',
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
    borderColor: '#a855f7',
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#a855f7',
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  impactTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
  },
});

export default DonateScreen;
