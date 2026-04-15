/**
 * Profile Screen for React Native
 * User profile, achievements, badges, and account settings
 * Displays stats, impact metrics, and account management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { useWireFluid } from '../context/WireFluidContext';

interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt?: string;
}

interface Badge {
  id: string;
  name: string;
  emoji: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress: number; // 0-100
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-donation',
    name: 'First Donor',
    emoji: '💝',
    description: 'Made your first donation to an academy',
    unlockedAt: 'Mar 10, 2024',
  },
  {
    id: 'first-tip',
    name: 'Fan Favorite',
    emoji: '❤️',
    description: 'Tipped your first player',
    unlockedAt: 'Mar 10, 2024',
  },
  {
    id: 'first-ticket',
    name: 'Match Attendee',
    emoji: '🎫',
    description: 'Purchased your first ticket',
    unlockedAt: 'Mar 12, 2024',
  },
  {
    id: '5k-raised',
    name: 'Impact Maker',
    emoji: '🌟',
    description: 'Raised 5,000 WIRE for cricket',
    unlockedAt: undefined,
  },
  {
    id: '10k-raised',
    name: 'Community Champion',
    emoji: '👑',
    description: 'Raised 10,000 WIRE for cricket',
    unlockedAt: undefined,
  },
];

const BADGES: Badge[] = [
  {
    id: 'supporter',
    name: 'Supporter',
    emoji: '💝',
    tier: 'bronze',
    progress: 100,
  },
  {
    id: 'advocate',
    name: 'Advocate',
    emoji: '📢',
    tier: 'silver',
    progress: 65,
  },
  {
    id: 'hero',
    name: 'Hero',
    emoji: '🦸',
    tier: 'gold',
    progress: 25,
  },
];

const ProfileScreen: React.FC = () => {
  const { user, logout } = useWireFluid();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAchievements, setShowAchievements] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
            // Navigation will be handled by App.tsx context change
          } catch (err) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This feature coming soon', [
      { text: 'OK', onPress: () => {} },
    ]);
  };

  const handleEnableBiometrics = () => {
    Alert.alert('Biometric Authentication', 'This feature coming soon', [
      { text: 'OK', onPress: () => {} },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>PSL Pulse Supporter</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>🎫</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.displayName || 'PSL Supporter'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <Text style={styles.walletAddress}>
              {user?.walletAddress.slice(0, 10)}...{user?.walletAddress.slice(-8)}
            </Text>
          </View>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceAmount}>{user?.balance || 0}</Text>
            <Text style={styles.balanceUnit}>WIRE</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💝</Text>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Donations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Tips</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎫</Text>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>8.72</Text>
            <Text style={styles.statLabel}>WIRE Sent</Text>
          </View>
        </View>

        {/* Impact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.impactCard}>
            <View style={styles.impactRow}>
              <Text style={styles.impactLabel}>Total Contributed</Text>
              <Text style={styles.impactValue}>8.72 WIRE</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactRow}>
              <Text style={styles.impactLabel}>Equivalent to</Text>
              <Text style={styles.impactValue}>~109,000 PKR</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactRow}>
              <Text style={styles.impactLabel}>Supporting</Text>
              <Text style={styles.impactValue}>2 Academies • 3 Players</Text>
            </View>
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievement Badges</Text>
          <View style={styles.badgesContainer}>
            {BADGES.map((badge) => (
              <View key={badge.id} style={styles.badgeCard}>
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${badge.progress}%`,
                        backgroundColor:
                          badge.tier === 'platinum'
                            ? '#06b6d4'
                            : badge.tier === 'gold'
                            ? '#eab308'
                            : badge.tier === 'silver'
                            ? '#c0cfe9'
                            : '#92400e',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{badge.progress}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity onPress={() => setShowAchievements(!showAchievements)}>
              <Text style={styles.expandButton}>
                {showAchievements ? '−' : '+'}
              </Text>
            </TouchableOpacity>
          </View>
          {showAchievements && (
            <View style={styles.achievementsList}>
              {ACHIEVEMENTS.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    !achievement.unlockedAt && styles.achievementCardLocked,
                  ]}
                >
                  <View style={styles.achievementLeft}>
                    <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementName}>{achievement.name}</Text>
                      <Text style={styles.achievementDesc}>
                        {achievement.description}
                      </Text>
                      {achievement.unlockedAt && (
                        <Text style={styles.achievementUnlockedAt}>
                          ✓ Unlocked {achievement.unlockedAt}
                        </Text>
                      )}
                    </View>
                  </View>
                  {!achievement.unlockedAt && (
                    <Text style={styles.lockedBadge}>🔒</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingSubtext}>News and tips</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#3b82f6', true: '#ec4899' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonLabel}>Change Password</Text>
            <Text style={styles.settingButtonIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonLabel}>Biometric Authentication</Text>
            <Text style={styles.settingButtonIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonLabel}>Privacy Policy</Text>
            <Text style={styles.settingButtonIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonLabel}>Terms of Service</Text>
            <Text style={styles.settingButtonIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>⚠️ Delete Account</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>PSL Pulse v1.0.0</Text>
            <Text style={styles.footerSubtext}>Powered by WireFluid (Chain 92533)</Text>
          </View>
        </View>
      </ScrollView>
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
  userCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 11,
    color: '#a855f7',
    fontFamily: 'monospace',
  },
  balanceBox: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a855f7',
  },
  balanceUnit: {
    fontSize: 10,
    color: '#9ca3af',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  expandButton: {
    fontSize: 20,
    color: '#a855f7',
  },
  impactCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 10,
    padding: 12,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  impactDivider: {
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  impactLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  impactValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  badgeCard: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 9,
    color: '#9ca3af',
  },
  achievementsList: {
    gap: 10,
  },
  achievementCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 10,
    padding: 12,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  achievementUnlockedAt: {
    fontSize: 10,
    color: '#10b981',
  },
  lockedBadge: {
    fontSize: 16,
  },
  settingCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 11,
    color: '#9ca3af',
  },
  settingButton: {
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
  settingButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  settingButtonIcon: {
    fontSize: 14,
    color: '#9ca3af',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fca5a5',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9ca3af',
  },
});

export default ProfileScreen;
