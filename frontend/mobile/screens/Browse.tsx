/**
 * Browse Screen for React Native
 * Tab-based exploration of matches, academies, and players
 * Central hub for discovering content and taking actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import { useWireFluid } from '../context/WireFluidContext';

type Tab = 'matches' | 'academies' | 'players';

interface Match {
  id: string;
  team1: string;
  team2: string;
  time: string;
  venue: string;
  tickets: number;
}

interface Academy {
  id: string;
  name: string;
  team: string;
  kitsDonated: number;
  kidsTrained: number;
  needsKits: number;
}

interface Player {
  id: string;
  name: string;
  team: string;
  emoji: string;
  tipsReceived: number;
  charity: string;
}

const MATCHES: Match[] = [
  {
    id: '1',
    team1: 'Karachi Kings',
    team2: 'Islamabad United',
    time: 'Mar 15, 7:00 PM',
    venue: 'Lahore Stadium',
    tickets: 2500,
  },
  {
    id: '2',
    team1: 'Peshawar Zalmi',
    team2: 'Multan Sultans',
    time: 'Mar 16, 7:30 PM',
    venue: 'Rawalpindi Stadium',
    tickets: 1800,
  },
  {
    id: '3',
    team1: 'Quetta Gladiators',
    team2: 'Lahore Qalandars',
    time: 'Mar 17, 8:00 PM',
    venue: 'Quetta Stadium',
    tickets: 3000,
  },
];

const ACADEMIES: Academy[] = [
  {
    id: '1',
    name: 'Karachi Youth Academy',
    team: 'Karachi Kings',
    kitsDonated: 450,
    kidsTrained: 280,
    needsKits: 120,
  },
  {
    id: '2',
    name: 'Islamabad Junior Program',
    team: 'Islamabad United',
    kitsDonated: 320,
    kidsTrained: 195,
    needsKits: 85,
  },
  {
    id: '3',
    name: 'Peshawar Talent Hunt',
    team: 'Peshawar Zalmi',
    kitsDonated: 380,
    kidsTrained: 220,
    needsKits: 150,
  },
];

const PLAYERS: Player[] = [
  {
    id: '1',
    name: 'Babar Azam',
    team: 'Karachi Kings',
    emoji: '🏏',
    tipsReceived: 5240,
    charity: 'Pakistan Children Fund',
  },
  {
    id: '2',
    name: 'Shadab Khan',
    team: 'Islamabad United',
    emoji: '⚡',
    tipsReceived: 3180,
    charity: 'Sports for All',
  },
  {
    id: '3',
    name: 'Wahab Riaz',
    team: 'Peshawar Zalmi',
    emoji: '🔥',
    tipsReceived: 2890,
    charity: 'Youth Development',
  },
];

const BrowseScreen: React.FC = () => {
  const { user } = useWireFluid();
  const [activeTab, setActiveTab] = useState<Tab>('matches');

  const renderMatchCard = (match: Match) => (
    <View key={match.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.teamName}>{match.team1}</Text>
        <Text style={styles.vs}>VS</Text>
        <Text style={styles.teamName}>{match.team2}</Text>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.metaText}>🕐 {match.time}</Text>
        <Text style={styles.metaText}>📍 {match.venue}</Text>
        <Text style={styles.metaText}>🎫 {match.tickets} tickets</Text>
      </View>
      <TouchableOpacity style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Connect to Buy Ticket</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAcademyCard = (academy: Academy) => (
    <View key={academy.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.academyName}>{academy.name}</Text>
        <Text style={styles.teamBadge}>{academy.team}</Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{academy.kitsDonated}</Text>
          <Text style={styles.statLabel}>Kits Donated</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{academy.kidsTrained}</Text>
          <Text style={styles.statLabel}>Kids Trained</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{academy.needsKits}</Text>
          <Text style={styles.statLabel}>Need Kits</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Connect to Donate</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlayerCard = (player: Player) => (
    <View key={player.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.playerEmoji}>{player.emoji}</Text>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerTeam}>{player.team}</Text>
        </View>
      </View>
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsAmount}>💜 {player.tipsReceived} WIRE</Text>
        <Text style={styles.tipsLabel}>Tips Received</Text>
      </View>
      <Text style={styles.charityText}>→ {player.charity}</Text>
      <TouchableOpacity style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Connect to Tip</Text>
      </TouchableOpacity>
    </View>
  );

  let content;
  if (activeTab === 'matches') {
    content = MATCHES.map(renderMatchCard);
  } else if (activeTab === 'academies') {
    content = ACADEMIES.map(renderAcademyCard);
  } else {
    content = PLAYERS.map(renderPlayerCard);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore & Support</Text>
          <Text style={styles.subtitle}>No account needed. Browse, then connect to take action.</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'matches' && styles.tabActive]}
            onPress={() => setActiveTab('matches')}
          >
            <Text style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}>
              🎫 Matches
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'academies' && styles.tabActive]}
            onPress={() => setActiveTab('academies')}
          >
            <Text style={[styles.tabText, activeTab === 'academies' && styles.tabTextActive]}>
              💝 Academies
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'players' && styles.tabActive]}
            onPress={() => setActiveTab('players')}
          >
            <Text style={[styles.tabText, activeTab === 'players' && styles.tabTextActive]}>
              ❤️ Players
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {content}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Ready to Make an Impact?</Text>
          <Text style={styles.footerText}>
            Every ticket, donation, and tip powers cricket grassroots in Pakistan.
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Start Supporting</Text>
          </TouchableOpacity>
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
    paddingTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 24,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: '#a855f7',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#a855f7',
  },
  contentContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  vs: {
    fontSize: 11,
    color: '#9ca3af',
    marginVertical: 4,
  },
  cardMeta: {
    gap: 6,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  academyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  teamBadge: {
    fontSize: 11,
    color: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a855f7',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  playerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  playerTeam: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tipsContainer: {
    marginBottom: 8,
  },
  tipsAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ec4899',
    marginBottom: 2,
  },
  tipsLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  charityText: {
    fontSize: 12,
    color: '#10b981',
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(168, 85, 247, 0.2)',
    marginTop: 24,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
    marginBottom: 12,
  },
});

export default BrowseScreen;
