/**
 * Mock Leaderboard Data for PSL Pulse
 * Contains 44 players across 8 teams with realistic impact points and blockchain metadata
 * @file mockLeaderboard.ts
 * @version 1.0.0
 */

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  teamId: number;
  teamName: string;
  teamColor: string;
  teamAbbreviation: string;
  impactPoints: number;
  badgeCount: number;
  badges: string[];
  stakes: number;
  tips: number;
  nftMintsCount: number;
  rankChange: number;
  pointsChange: number;
  trendingScore: boolean;
  walletAddress: string;
  isCurrentUser?: boolean;
  userId?: string;
}

export interface TeamLeaderboardEntry {
  teamId: number;
  teamName: string;
  teamAbbreviation: string;
  teamColor: string;
  totalImpact: number;
  avgRating: number;
  badgeCount: number;
  rankChange: number;
  playerCount: number;
  glowShadow: string;
}

export interface LeaderboardMeta {
  lastUpdated: string;
  totalPlayers: number;
  totalTeams: number;
  periodType: 'week' | 'season';
  periodName: string;
}

export interface LeaderboardData {
  players: LeaderboardEntry[];
  teams: TeamLeaderboardEntry[];
  meta: LeaderboardMeta;
}

const TEAMS = [
  { id: 0, name: 'Lahore Qalandars', abbr: 'LQ', color: '#00FF00', glow: 'glow-lq' },
  { id: 1, name: 'Karachi Kings', abbr: 'KK', color: '#0000FF', glow: 'glow-kk' },
  { id: 2, name: 'Islamabad United', abbr: 'IU', color: '#FF0000', glow: 'glow-iu' },
  { id: 3, name: 'Peshawar Zalmi', abbr: 'PZ', color: '#FFFF00', glow: 'glow-pz' },
  { id: 4, name: 'Quetta Gladiators', abbr: 'QG', color: '#800080', glow: 'glow-qg' },
  { id: 5, name: 'Multan Sultans', abbr: 'MS', color: '#008080', glow: 'glow-ms' },
  { id: 6, name: 'Rawalpindi Pindiz', abbr: 'RP', color: '#00FFFF', glow: 'glow-rp' },
  { id: 7, name: 'Hyderabad Houston Kingsmen', abbr: 'HK', color: '#800000', glow: 'glow-hk' },
];

const PLAYER_NAMES = [
  // Real PSL Players
  'Virat Kohli', 'Babar Azam', 'Harry Brook', 'Travis Head', 'Mahela Jayawardene',
  'Shahid Afridi', 'Shoaib Akhtar', 'Misbah ul Haq', 'Younis Khan', 'Wasim Akram',
  
  // Additional PSL Legends/Players
  'Abdullah Shafique', 'Fakhar Zaman', 'Hasan Ali', 'Shadab Khan', 'Harris Rauf',
  'Mohammad Amir', 'Imad Wasim', 'Sarfraz Ahmed', 'Iftikhar Ahmed', 'Mohammad Rizwan',
  
  // International Players
  'David Warner', 'Steve Smith', 'Rohit Sharma', 'Kane Williamson', 'AB de Villiers',
  'Rashid Khan', 'Jasprit Bumrah', 'Pat Cummins', 'Josh Hazlewood', 'Trent Boult',
  
  // More International Talent
  'Liam Plunkett', 'Chris Jordan', 'Cameron Delport', 'Samit Patel', 'Craig Viljoen',
  'Sikandar Raza', 'Blessing Muzarabani', 'Rauf Ahmad', 'Sohail Akhtar', 'Azhar Ali',
  
  // PSL Extended Roster
  'Amad Butt', 'Haris Aziz', 'Dilbar Hussain', 'Asif Ali', 'Khushdil Shah',
  'Faheem Ashraf', 'Wahab Riaz', 'Sharjeel Khan', 'Usman Salahuddin', 'Ali Shan Masood',
];

/**
 * Generate mock player entries with realistic blockchain data
 * @function generateMockPlayers
 * @returns {LeaderboardEntry[]} Array of 44 players across teams
 */
function generateMockPlayers(): LeaderboardEntry[] {
  const players: LeaderboardEntry[] = [];
  const playersPerTeam = 5 + Math.floor(Math.random() * 2); // 5-6 players per team
  let rank = 1;

  for (let teamIdx = 0; teamIdx < TEAMS.length; teamIdx++) {
    const team = TEAMS[teamIdx];
    const teamPlayerCount = teamIdx < 2 ? 6 : 5; // First two teams get 6, rest get 5

    for (let playerIdx = 0; playerIdx < teamPlayerCount; playerIdx++) {
      const basePoints = Math.max(0, 45000 - rank * 800 + Math.random() * 5000);
      const playerNameIdx = (teamIdx * 6 + playerIdx) % PLAYER_NAMES.length;

      players.push({
        rank,
        playerId: `player-${rank.toString().padStart(3, '0')}`,
        playerName: PLAYER_NAMES[playerNameIdx],
        teamId: teamIdx,
        teamName: team.name,
        teamColor: team.color,
        teamAbbreviation: team.abbr,
        impactPoints: Math.floor(basePoints),
        badgeCount: Math.max(0, 5 - Math.floor(rank / 10)),
        badges: generateBadges(rank),
        stakes: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
        tips: parseFloat((Math.random() * 15 + 2).toFixed(2)),
        nftMintsCount: Math.floor(Math.random() * 30 + 5),
        rankChange: Math.floor(Math.random() * 5 - 2), // -2 to +2
        pointsChange: Math.floor(Math.random() * 500 - 100), // -100 to +400
        trendingScore: rank <= 10 || (rank <= 20 && Math.random() > 0.5),
        walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
        userId: `user_${rank.toString().padStart(3, '0')}`,
      });

      rank++;
    }
  }

  return players;
}

/**
 * Generate badge array based on player rank and random selection
 * @function generateBadges
 * @param {number} rank - Player rank
 * @returns {string[]} Array of badge identifiers
 */
function generateBadges(rank: number): string[] {
  const allBadges = ['elite', 'rising-star', 'clutch-player', 'mentor', 'legend', 'momentum', 'impact-maker'];
  const badgeCount = Math.max(0, 5 - Math.floor(rank / 10));
  
  const selected: string[] = [];
  for (let i = 0; i < badgeCount; i++) {
    const badgeIdx = Math.floor(Math.random() * allBadges.length);
    if (!selected.includes(allBadges[badgeIdx])) {
      selected.push(allBadges[badgeIdx]);
    }
  }
  
  return selected;
}

/**
 * Calculate team aggregate statistics
 * @function generateTeamLeaderboard
 * @param {LeaderboardEntry[]} players - All player entries
 * @returns {TeamLeaderboardEntry[]} Team statistics
 */
function generateTeamLeaderboard(players: LeaderboardEntry[]): TeamLeaderboardEntry[] {
  const teamStats: { [key: number]: TeamLeaderboardEntry } = {};

  TEAMS.forEach((team) => {
    teamStats[team.id] = {
      teamId: team.id,
      teamName: team.name,
      teamAbbreviation: team.abbr,
      teamColor: team.color,
      totalImpact: 0,
      avgRating: 0,
      badgeCount: 0,
      rankChange: 0,
      playerCount: 0,
      glowShadow: team.glow,
    };
  });

  players.forEach((player) => {
    const team = teamStats[player.teamId];
    team.totalImpact += player.impactPoints;
    team.badgeCount += player.badgeCount;
    team.playerCount += 1;
    team.avgRating += (4 - (player.rank % 10) * 0.05);
  });

  Object.values(teamStats).forEach((team) => {
    team.avgRating = team.playerCount > 0 ? team.avgRating / team.playerCount : 0;
    team.rankChange = Math.floor(Math.random() * 6 - 2); // -2 to +3
  });

  return Object.values(teamStats).sort((a, b) => b.totalImpact - a.totalImpact);
}

/**
 * Get mock leaderboard data
 * @function getMockLeaderboardData
 * @returns {LeaderboardData} Complete leaderboard dataset
 */
export function getMockLeaderboardData(): LeaderboardData {
  const players = generateMockPlayers();
  const teams = generateTeamLeaderboard(players);

  return {
    players,
    teams,
    meta: {
      lastUpdated: new Date().toISOString(),
      totalPlayers: players.length,
      totalTeams: TEAMS.length,
      periodType: 'season',
      periodName: 'PSL 2026 Season 1',
    },
  };
}

/**
 * Get trending players (top risers this week)
 * @function getTrendingPlayers
 * @param {LeaderboardEntry[]} players - All players
 * @param {number} limit - Number of trending players (default 10)
 * @returns {LeaderboardEntry[]} Top trending players
 */
export function getTrendingPlayers(players: LeaderboardEntry[], limit: number = 10): LeaderboardEntry[] {
  return [...players]
    .sort((a, b) => b.pointsChange - a.pointsChange)
    .filter((p) => p.trendingScore)
    .slice(0, limit);
}

/**
 * Get players for specific team
 * @function getTeamPlayers
 * @param {LeaderboardEntry[]} players - All players
 * @param {number} teamId - Team ID
 * @returns {LeaderboardEntry[]} Players from team
 */
export function getTeamPlayers(players: LeaderboardEntry[], teamId: number): LeaderboardEntry[] {
  return players.filter((p) => p.teamId === teamId);
}

// Export singleton instance for consistent data
export const MOCK_LEADERBOARD = getMockLeaderboardData();
export const MOCK_TRENDING = getTrendingPlayers(MOCK_LEADERBOARD.players);
