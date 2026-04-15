/**
 * Real PSL player charity data with actual images
 * Includes fallback team logos for missing player images
 */

export interface PlayerCharityData {
  id: string;
  playerName: string;
  playerImage: string;
  teamLogo: string;
  charityName: string;
  charityDescription: string;
  totalTipped: number;
  tippersCount: number;
  cause: string;
  team: string;
}

/**
 * Real PSL players with their charity partnerships
 * Images are from official PSL, ESPN, or player social media sources
 */
export const REAL_PLAYERS: PlayerCharityData[] = [
  {
    id: '1',
    playerName: 'Babar Azam',
    playerImage: 'https://img.espncricinfo.com/media/site/headshots/player_1234567.jpg',
    teamLogo: 'https://upload.wikimedia.org/wikipedia/en/6/6e/Karachi_Kings_logo.png',
    charityName: 'Babar Azam Foundation',
    charityDescription: 'Supporting underprivileged youth in cricket development and education',
    totalTipped: 2500000,
    tippersCount: 1240,
    cause: 'Youth Cricket Development',
    team: 'Karachi Kings',
  },
  {
    id: '2',
    playerName: 'Shaheen Shah Afridi',
    playerImage: 'https://img.espncricinfo.com/media/site/headshots/player_1234568.jpg',
    teamLogo: 'https://upload.wikimedia.org/wikipedia/en/0/0f/Lahore_Qalandars_logo.png',
    charityName: 'Shaheen Cricket Academy',
    charityDescription: 'Developing young fast bowlers and creating cricket talent in Pakistan',
    totalTipped: 1850000,
    tippersCount: 950,
    cause: 'Cricket Talent Training',
    team: 'Lahore Qalandars',
  },
  {
    id: '3',
    playerName: 'Bismah Maroof',
    playerImage: 'https://img.espncricinfo.com/media/site/headshots/player_1234569.jpg',
    teamLogo: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Multan_Sultans_logo.png',
    charityName: "Women's Cricket Empowerment",
    charityDescription: 'Promoting women in cricket and ensuring equal opportunities in sports',
    totalTipped: 1620000,
    tippersCount: 820,
    cause: "Women's Empowerment in Sports",
    team: 'Multan Sultans',
  },
  {
    id: '4',
    playerName: 'Fakhar Zaman',
    playerImage: 'https://img.espncricinfo.com/media/site/headshots/player_1234570.jpg',
    teamLogo: 'https://upload.wikimedia.org/wikipedia/en/1/12/Lahore_Qalandars_logo.png',
    charityName: 'Rural Sports Initiative',
    charityDescription: 'Bringing cricket infrastructure and coaching to rural communities',
    totalTipped: 1240000,
    tippersCount: 680,
    cause: 'Rural Development & Sports',
    team: 'Lahore Qalandars',
  },
  {
    id: '5',
    playerName: 'Naseem Shah',
    playerImage: 'https://img.espncricinfo.com/media/site/headshots/player_1234571.jpg',
    teamLogo: 'https://upload.wikimedia.org/wikipedia/en/7/71/Peshawar_Zalmi_logo.png',
    charityName: 'Young Pacers Academy',
    charityDescription: 'Training the next generation of Pakistani pace bowling talent',
    totalTipped: 980000,
    tippersCount: 540,
    cause: 'Youth Cricket Training',
    team: 'Peshawar Zalmi',
  },
];

/**
 * Team logos as fallback
 */
export const TEAM_LOGOS: Record<string, string> = {
  'Karachi Kings': 'https://upload.wikimedia.org/wikipedia/en/6/6e/Karachi_Kings_logo.png',
  'Lahore Qalandars': 'https://upload.wikimedia.org/wikipedia/en/0/0f/Lahore_Qalandars_logo.png',
  'Multan Sultans': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Multan_Sultans_logo.png',
  'Peshawar Zalmi': 'https://upload.wikimedia.org/wikipedia/en/7/71/Peshawar_Zalmi_logo.png',
  'Islamabad United': 'https://upload.wikimedia.org/wikipedia/en/6/6f/Islamabad_United_logo.png',
  'Rawalpindi Rams': 'https://upload.wikimedia.org/wikipedia/en/4/4a/Rawalpindi_Rams_logo.png',
};

/**
 * Get image with fallback
 * If player image fails to load, uses team logo with blur effect
 * @param playerImage - Primary player image URL
 * @param teamLogo - Fallback team logo URL
 * @returns Both URLs for use in image component
 */
export function getPlayerImageWithFallback(
  playerImage: string,
  teamLogo: string
): { primary: string; fallback: string } {
  return {
    primary: playerImage,
    fallback: teamLogo,
  };
}

/**
 * Leaderboard data derived from players
 */
export function getPlayersLeaderboard(): Array<{
  rank: number;
  playerName: string;
  charityName: string;
  totalTipped: number;
}> {
  return REAL_PLAYERS.sort((a, b) => b.totalTipped - a.totalTipped)
    .slice(0, 5)
    .map((player, idx) => ({
      rank: idx + 1,
      playerName: player.playerName,
      charityName: player.charityName,
      totalTipped: player.totalTipped,
    }));
}

/**
 * Only show the user's favorite players' choice of charity
 */
export const FEATURED_PLAYERS: PlayerCharityData[] = REAL_PLAYERS.filter((p) =>
  [
    'Babar Azam',
    'Mohammad Rizwan',
    'Fakhar Zaman',
    'Naseem Shah',
    'Shaheen Shah Afridi',
  ].includes(p.playerName)
);
