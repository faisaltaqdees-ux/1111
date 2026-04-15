/**
 * PART 1: WORLD-CLASS INTENT RECOGNITION ENGINE
 * Comprehensive intent classification with 100+ intents and fuzzy matching
 * Handles ANY user input intelligently
 */

import type { IntentResult, ConversationContext, UserJourney } from './types';

export interface IntentMatch {
  intent: string;
  confidence: number;
  category: string;
  triggers: string[];
  context?: string;
  subIntent?: string;
}

// ============================================================================
// MASTER INTENT REGISTRY (100+ intents across all domains)
// ============================================================================

export const INTENT_REGISTRY = {
  // ─────────────────────────────────────────────────────────────────────────
  // CORE CRICKET & MATCH INTENTS (15 intents)
  // ─────────────────────────────────────────────────────────────────────────
  CRICKET_SCORE_CHECK: {
    name: 'cricket_score_check',
    category: 'cricket',
    triggers: ['score', 'current score', 'latest score', 'live score', 'what\'s the score', 'score update', 'match score', 'runs', 'wickets', 'how many runs', 'how many wickets'],
    variations: ['what\'s happening in the match', 'match status', 'live update', 'current match', 'ongoing score'],
    confidence: 0.95,
    context: 'Real-time cricket data'
  },
  CRICKET_SCHEDULE: {
    name: 'cricket_schedule',
    category: 'cricket',
    triggers: ['schedule', 'when is', 'next match', 'upcoming matches', 'match timing', 'fixture', 'match date', 'what time', 'when does', 'match start'],
    variations: ['when\'s the next game', 'upcoming fixtures', 'match calendar', 'schedules', 'tournament calendar'],
    confidence: 0.94,
    context: 'Match scheduling & timing'
  },
  CRICKET_STATS: {
    name: 'cricket_stats',
    category: 'cricket',
    triggers: ['stats', 'statistics', 'performance', 'batting average', 'bowling figures', 'player stats', 'career stats', 'record', 'best', 'average'],
    variations: ['how is player doing', 'player performance', 'statistics', 'historical data', 'career averages'],
    confidence: 0.93,
    context: 'Player & team statistics'
  },
  CRICKET_TEAMS: {
    name: 'cricket_teams',
    category: 'cricket',
    triggers: ['teams', 'squad', 'players', 'roster', 'team list', 'lineup', 'who plays', 'player list', 'team composition'],
    variations: ['which players', 'team members', 'player names', 'who\'s in the squad', 'team info'],
    confidence: 0.92,
    context: 'Team & player information'
  },
  CRICKET_RULES: {
    name: 'cricket_rules',
    category: 'cricket',
    triggers: ['rules', 'how does work', 'what\'s cricket', 'explain cricket', 'laws', 'regulations', 'format', 'cricket format'],
    variations: ['tell me about cricket', 'how to play', 'cricket basics', 'what are the rules'],
    confidence: 0.91,
    context: 'Cricket rules & education'
  },
  CRICKET_HIGHLIGHTS: {
    name: 'cricket_highlights',
    category: 'cricket',
    triggers: ['highlights', 'best moments', 'recap', 'summary', 'key moments', 'sixes', 'boundaries', 'wicket', 'memorable'],
    variations: ['what happened', 'match summary', 'important moments', 'best performances'],
    confidence: 0.90,
    context: 'Match highlights & recap'
  },
  CRICKET_PREDICTIONS: {
    name: 'cricket_predictions',
    category: 'cricket',
    triggers: ['predict', 'who will win', 'chances', 'prediction', 'odds', 'who\'s winning', 'will win', 'should win'],
    variations: ['likely outcome', 'prediction analysis', 'who\'s favorite', 'team chances'],
    confidence: 0.85,
    context: 'Match predictions & analysis'
  },
  CRICKET_ACADEMY: {
    name: 'cricket_academy',
    category: 'cricket',
    triggers: ['academy', 'grassroots', 'training', 'development', 'coaching', 'young players', 'talent'],
    variations: ['player development', 'coaching programs', 'youth cricket', 'training programs'],
    confidence: 0.88,
    context: 'Academy & grassroots cricket'
  },
  CRICKET_INJURIES: {
    name: 'cricket_injuries',
    category: 'cricket',
    triggers: ['injury', 'injured', 'health', 'fitness', 'out', 'unavailable', 'replacement', 'substitution'],
    variations: ['player unavailable', 'health update', 'fitness concern', 'sidelined'],
    confidence: 0.89,
    context: 'Player injuries & fitness'
  },
  CRICKET_COMMENTARY: {
    name: 'cricket_commentary',
    category: 'cricket',
    triggers: ['commentary', 'update', 'live update', 'what\'s happening', 'go on', 'continue', 'tell me more', 'happening now'],
    variations: ['match commentary', 'ball-by-ball', 'running commentary', 'what happened next'],
    confidence: 0.87,
    context: 'Live match commentary'
  },
  CRICKET_TRIVIA: {
    name: 'cricket_trivia',
    category: 'cricket',
    triggers: ['trivia', 'fun fact', 'did you know', 'interesting', 'history', 'legacy', 'records'],
    variations: ['cricket facts', 'historical moments', 'record holders', 'interesting statistics'],
    confidence: 0.83,
    context: 'Cricket facts & trivia'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NFT TICKETS & VERIFICATION (12 intents)
  // ─────────────────────────────────────────────────────────────────────────
  TICKET_BUY: {
    name: 'ticket_buy',
    category: 'tickets',
    triggers: ['buy ticket', 'purchase ticket', 'get ticket', 'book seat', 'reserve seat', 'ticket price', 'how much'],
    variations: ['ticket booking', 'seat reservation', 'ticket purchase', 'where to buy'],
    confidence: 0.96,
    context: 'Ticket purchasing'
  },
  TICKET_VERIFY: {
    name: 'ticket_verify',
    category: 'tickets',
    triggers: ['verify ticket', 'check ticket', 'ticket valid', 'is genuine', 'authentic', 'nft verify', 'confirm ticket'],
    variations: ['ticket verification', 'check authenticity', 'verify nft', 'is my ticket real'],
    confidence: 0.94,
    context: 'NFT ticket verification'
  },
  TICKET_VIEW: {
    name: 'ticket_view',
    category: 'tickets',
    triggers: ['my tickets', 'show tickets', 'view tickets', 'ticket details', 'ticket info', 'ticket list'],
    variations: ['see my tickets', 'list tickets', 'ticket information', 'ticket collection'],
    confidence: 0.95,
    context: 'View owned tickets'
  },
  TICKET_TRANSFER: {
    name: 'ticket_transfer',
    category: 'tickets',
    triggers: ['transfer ticket', 'gift ticket', 'send ticket', 'give ticket', 'share ticket', 'trade ticket'],
    variations: ['ticket gifting', 'ticket sharing', 'ticket exchange', 'send to friend'],
    confidence: 0.92,
    context: 'Ticket transfer & gifting'
  },
  TICKET_RESALE: {
    name: 'ticket_resale',
    category: 'tickets',
    triggers: ['resell ticket', 'sell ticket', 'auction ticket', 'secondary market', 'marketplace'],
    variations: ['ticket marketplace', 'ticket trading', 'sell my ticket', 'resale price'],
    confidence: 0.91,
    context: 'Ticket resale & marketplace'
  },
  TICKET_BENEFITS: {
    name: 'ticket_benefits',
    category: 'tickets',
    triggers: ['ticket benefits', 'ticket perks', 'vip access', 'early access', 'exclusive', 'what included'],
    variations: ['ticket advantages', 'access benefits', 'special privileges', 'ticket amenities'],
    confidence: 0.89,
    context: 'Ticket benefits & perks'
  },
  TICKET_CANCEL: {
    name: 'ticket_cancel',
    category: 'tickets',
    triggers: ['cancel ticket', 'refund ticket', 'return ticket', 'can\'t go', 'refund policy'],
    variations: ['ticket refund', 'cancellation policy', 'need refund', 'can\'t attend'],
    confidence: 0.90,
    context: 'Ticket cancellation & refunds'
  },
  TICKET_SEATING: {
    name: 'ticket_seating',
    category: 'tickets',
    triggers: ['seat', 'section', 'row', 'location', 'where seated', 'seating chart', 'view', 'stadium map'],
    variations: ['seat location', 'seating arrangement', 'stadium layout', 'seat availability'],
    confidence: 0.93,
    context: 'Seat & seating information'
  },
  TICKET_UPGRADE: {
    name: 'ticket_upgrade',
    category: 'tickets',
    triggers: ['upgrade ticket', 'better seat', 'premium ticket', 'vip upgrade', 'upgrade available'],
    variations: ['seat upgrade', 'ticket upgrade options', 'premium seats', 'upgrade cost'],
    confidence: 0.88,
    context: 'Ticket upgrade options'
  },
  TICKET_ENTRY: {
    name: 'ticket_entry',
    category: 'tickets',
    triggers: ['enter stadium', 'gate', 'entry time', 'entry process', 'how enter', 'access'],
    variations: ['stadium entry', 'entry requirements', 'gate entry', 'check-in process'],
    confidence: 0.87,
    context: 'Stadium entry & access'
  },
  TICKET_PAYMENT: {
    name: 'ticket_payment',
    category: 'tickets',
    triggers: ['payment ticket', 'payment method', 'pay for ticket', 'payment issue', 'payment failed'],
    variations: ['ticket payment', 'payment options', 'payment problem', 'checkout issue'],
    confidence: 0.91,
    context: 'Ticket payment processing'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BADGES & ACHIEVEMENTS (14 intents)
  // ─────────────────────────────────────────────────────────────────────────
  BADGE_EARN: {
    name: 'badge_earn',
    category: 'badges',
    triggers: ['earn badge', 'how earn badge', 'get badge', 'badge requirements', 'badge condition', 'badge criteria'],
    variations: ['badge earning', 'achievement requirements', 'what to do for badge', 'badge unlock'],
    confidence: 0.95,
    context: 'Badge earning requirements'
  },
  BADGE_VIEW: {
    name: 'badge_view',
    category: 'badges',
    triggers: ['my badges', 'show badges', 'badge collection', 'badges earned', 'badge list', 'view badges'],
    variations: ['list badges', 'badge showcase', 'see badges', 'badge portfolio'],
    confidence: 0.94,
    context: 'View personal badges'
  },
  BADGE_PROGRESS: {
    name: 'badge_progress',
    category: 'badges',
    triggers: ['badge progress', 'how close', 'remaining points', 'progress towards', 'until badge', 'points needed'],
    variations: ['progress tracking', 'points until', 'badge completion', 'how much more'],
    confidence: 0.93,
    context: 'Badge progress tracking'
  },
  BADGE_TYPES: {
    name: 'badge_types',
    category: 'badges',
    triggers: ['badge types', 'kinds badges', 'categories', 'all badges', 'different badges', 'badge list', 'available badges'],
    variations: ['badge categories', 'badge varieties', 'types of badges', 'badge options'],
    confidence: 0.92,
    context: 'Available badge types'
  },
  BADGE_LEADERBOARD: {
    name: 'badge_leaderboard',
    category: 'badges',
    triggers: ['badge leaderboard', 'top badges', 'most badges', 'leaderboard', 'rankings'],
    variations: ['badge rankings', 'top earners', 'leader board', 'ranking system'],
    confidence: 0.91,
    context: 'Badge leaderboards'
  },
  BADGE_POINTS: {
    name: 'badge_points',
    category: 'badges',
    triggers: ['points', 'badge points', 'how many points', 'earn points', 'points system', 'point value'],
    variations: ['point system', 'point accumulation', 'point rewards', 'points total'],
    confidence: 0.90,
    context: 'Badge point system'
  },
  BADGE_DISPLAY: {
    name: 'badge_display',
    category: 'badges',
    triggers: ['display badge', 'show badge', 'profile badge', 'badge on profile', 'badge visible'],
    variations: ['badge visibility', 'show on profile', 'badge showcase', 'profile display'],
    confidence: 0.88,
    context: 'Badge display options'
  },
  BADGE_SHARE: {
    name: 'badge_share',
    category: 'badges',
    triggers: ['share badge', 'badge social', 'post badge', 'share achievement', 'badge social media'],
    variations: ['badge sharing', 'social sharing', 'share achievement', 'post achievement'],
    confidence: 0.87,
    context: 'Share badges socially'
  },
  BADGE_SPECIAL: {
    name: 'badge_special',
    category: 'badges',
    triggers: ['special badge', 'limited badge', 'exclusive badge', 'rare badge', 'seasonal badge'],
    variations: ['limited edition', 'exclusive achievement', 'rare badges', 'seasonal achievement'],
    confidence: 0.86,
    context: 'Special/limited badges'
  },
  BADGE_EXPIRY: {
    name: 'badge_expiry',
    category: 'badges',
    triggers: ['badge expiry', 'badge expire', 'valid until', 'expire date', 'expiration'],
    variations: ['badge validity', 'expiration date', 'when expires', 'validity period'],
    confidence: 0.84,
    context: 'Badge expiration info'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DONATIONS & IMPACT (12 intents)
  // ─────────────────────────────────────────────────────────────────────────
  DONATION_MAKE: {
    name: 'donation_make',
    category: 'donations',
    triggers: ['donate', 'donation', 'contribute', 'support academy', 'give', 'help academy', 'contribute to'],
    variations: ['make donation', 'donate money', 'support grassroots', 'contribute funds'],
    confidence: 0.96,
    context: 'Making donations'
  },
  DONATION_AMOUNT: {
    name: 'donation_amount',
    category: 'donations',
    triggers: ['donation amount', 'how much donate', 'donation limit', 'minimum donation', 'maximum donation'],
    variations: ['donation value', 'donation size', 'how much', 'donation range'],
    confidence: 0.93,
    context: 'Donation amounts'
  },
  DONATION_TAX: {
    name: 'donation_tax',
    category: 'donations',
    triggers: ['tax deductible', 'tax receipt', 'tax benefit', 'tax credit', 'tax info'],
    variations: ['tax relief', 'charitable receipt', 'tax advantage', 'tax claim'],
    confidence: 0.91,
    context: 'Tax information for donations'
  },
  DONATION_IMPACT: {
    name: 'donation_impact',
    category: 'donations',
    triggers: ['donation impact', 'where goes', 'used for', 'how helps', 'impact tracking', 'what support'],
    variations: ['impact of donation', 'donation benefits', 'effect of donation', 'donation usage'],
    confidence: 0.94,
    context: 'Donation impact tracking'
  },
  DONATION_HISTORY: {
    name: 'donation_history',
    category: 'donations',
    triggers: ['donation history', 'my donations', 'past donations', 'donation list', 'donation record'],
    variations: ['donation records', 'donation timeline', 'donation summary', 'previous donations'],
    confidence: 0.92,
    context: 'Donation history'
  },
  DONATION_RECEIPT: {
    name: 'donation_receipt',
    category: 'donations',
    triggers: ['receipt', 'donation receipt', 'receipt email', 'invoice', 'proof donation'],
    variations: ['donation invoice', 'proof of donation', 'receipt download', 'donation documentation'],
    confidence: 0.90,
    context: 'Donation receipts'
  },
  DONATION_ACADEMY: {
    name: 'donation_academy',
    category: 'donations',
    triggers: ['academy donation', 'which academy', 'academy selection', 'academy impact', 'choose academy'],
    variations: ['select academy', 'academy choice', 'which organization', 'donation destination'],
    confidence: 0.89,
    context: 'Academy selection for donations'
  },
  DONATION_RECURRING: {
    name: 'donation_recurring',
    category: 'donations',
    triggers: ['recurring donation', 'monthly donation', 'subscription donation', 'auto donate', 'schedule donation'],
    variations: ['monthly giving', 'regular donation', 'auto-recurring', 'donation subscription'],
    confidence: 0.88,
    context: 'Recurring donations'
  },
  DONATION_ANONYMOUS: {
    name: 'donation_anonymous',
    category: 'donations',
    triggers: ['anonymous donation', 'anonymous gift', 'private donation', 'hidden name'],
    variations: ['donate anonymously', 'private giving', 'undisclosed donation', 'confidential'],
    confidence: 0.85,
    context: 'Anonymous donations'
  },
  DONATION_GOALS: {
    name: 'donation_goals',
    category: 'donations',
    triggers: ['donation goal', 'campaign goal', 'fundraiser', 'target amount', 'funding goal'],
    variations: ['goal tracking', 'campaign progress', 'fundraising target', 'collection goal'],
    confidence: 0.87,
    context: 'Donation goals & campaigns'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYER TIPPING (10 intents)
  // ─────────────────────────────────────────────────────────────────────────
  TIP_GIVE: {
    name: 'tip_give',
    category: 'tipping',
    triggers: ['tip', 'tip player', 'give tip', 'support player', 'award player', 'reward player'],
    variations: ['player tip', 'tipping', 'tip amount', 'support financially'],
    confidence: 0.95,
    context: 'Giving tips to players'
  },
  TIP_AMOUNT: {
    name: 'tip_amount',
    category: 'tipping',
    triggers: ['tip amount', 'how much tip', 'tip limit', 'minimum tip', 'tip value'],
    variations: ['tipping amount', 'tip size', 'tip range', 'tip cost'],
    confidence: 0.92,
    context: 'Tip amounts'
  },
  TIP_RECEIVE: {
    name: 'tip_receive',
    category: 'tipping',
    triggers: ['tips received', 'my tips', 'who tipped', 'tip earnings', 'total tips'],
    variations: ['received tips', 'tip balance', 'tip total', 'earned tips'],
    confidence: 0.91,
    context: 'Received tips (for players)'
  },
  TIP_MESSAGE: {
    name: 'tip_message',
    category: 'tipping',
    triggers: ['tip message', 'message with tip', 'tip comment', 'personal message', 'add message'],
    variations: ['tip note', 'support message', 'personalized tip', 'tip greeting'],
    confidence: 0.88,
    context: 'Tip messages & notes'
  },
  TIP_ANONYMOUS: {
    name: 'tip_anonymous',
    category: 'tipping',
    triggers: ['anonymous tip', 'anonymous support', 'secret tip', 'hidden tipper'],
    variations: ['tip anonymously', 'private tip', 'undisclosed tipper', 'anonymous support'],
    confidence: 0.84,
    context: 'Anonymous tips'
  },
  TIP_NOTIFICATION: {
    name: 'tip_notification',
    category: 'tipping',
    triggers: ['tip notification', 'notify player', 'alert player', 'tip alert'],
    variations: ['notification settings', 'tip alerts', 'player notification'],
    confidence: 0.85,
    context: 'Tip notifications'
  },
  TIP_HISTORY: {
    name: 'tip_history',
    category: 'tipping',
    triggers: ['tip history', 'past tips', 'tipping history', 'tip record'],
    variations: ['tipping track record', 'previous tips', 'tip timeline'],
    confidence: 0.87,
    context: 'Tipping history'
  },
  TIP_LEADERBOARD: {
    name: 'tip_leaderboard',
    category: 'tipping',
    triggers: ['tipper leaderboard', 'top tippers', 'highest tips', 'tip rankings'],
    variations: ['top supporters', 'tipper rankings', 'leader board', 'most tipped'],
    confidence: 0.86,
    context: 'Tipping leaderboards'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LEADERBOARDS & RANKINGS (8 intents)
  // ─────────────────────────────────────────────────────────────────────────
  LEADERBOARD_GLOBAL: {
    name: 'leaderboard_global',
    category: 'leaderboards',
    triggers: ['leaderboard', 'top players', 'rankings', 'global ranking', 'top 10', 'best players'],
    variations: ['global leaderboard', 'world ranking', 'top performers', 'ranking list'],
    confidence: 0.94,
    context: 'Global leaderboards'
  },
  LEADERBOARD_TEAM: {
    name: 'leaderboard_team',
    category: 'leaderboards',
    triggers: ['team ranking', 'team leaderboard', 'best teams', 'team standings', 'team performance'],
    variations: ['team scores', 'standings', 'team ranking', 'competition standings'],
    confidence: 0.92,
    context: 'Team leaderboards'
  },
  LEADERBOARD_PERSONAL: {
    name: 'leaderboard_personal',
    category: 'leaderboards',
    triggers: ['my rank', 'my ranking', 'where am i', 'my position', 'my leaderboard', 'personal rank'],
    variations: ['my standing', 'position rank', 'ranking position', 'my leaderboard position'],
    confidence: 0.93,
    context: 'Personal leaderboard position'
  },
  LEADERBOARD_FILTER: {
    name: 'leaderboard_filter',
    category: 'leaderboards',
    triggers: ['filter leaderboard', 'leaderboard filter', 'by country', 'by region', 'by team', 'by time'],
    variations: ['filtered ranking', 'regional leaderboard', 'country ranking', 'time-based ranking'],
    confidence: 0.89,
    context: 'Filtered leaderboards'
  },
  LEADERBOARD_HISTORY: {
    name: 'leaderboard_history',
    category: 'leaderboards',
    triggers: ['leaderboard history', 'past rankings', 'ranking history', 'previous standings'],
    variations: ['historical rankings', 'ranking timeline', 'past leaderboards'],
    confidence: 0.87,
    context: 'Historical leaderboards'
  },
  LEADERBOARD_FRIEND: {
    name: 'leaderboard_friend',
    category: 'leaderboards',
    triggers: ['friend ranking', 'friend leaderboard', 'friend comparison', 'compare friends'],
    variations: ['friend comparison', 'vs friends', 'friend standing', 'compare with friends'],
    confidence: 0.85,
    context: 'Friend leaderboards'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WALLET & PAYMENTS (16 intents)
  // ─────────────────────────────────────────────────────────────────────────
  WALLET_CONNECT: {
    name: 'wallet_connect',
    category: 'wallet',
    triggers: ['connect wallet', 'wallet connection', 'connect crypto', 'link wallet', 'add wallet'],
    variations: ['wallet setup', 'cryptocurrency wallet', 'blockchain wallet', 'connect ethereum'],
    confidence: 0.96,
    context: 'Wallet connection'
  },
  WALLET_VIEW: {
    name: 'wallet_view',
    category: 'wallet',
    triggers: ['my wallet', 'wallet balance', 'show wallet', 'view wallet', 'wallet address'],
    variations: ['wallet info', 'balance check', 'wallet details', 'holdings'],
    confidence: 0.95,
    context: 'View wallet'
  },
  WALLET_SEND: {
    name: 'wallet_send',
    category: 'wallet',
    triggers: ['send', 'transfer', 'send money', 'send crypto', 'transfer funds', 'send payment'],
    variations: ['payment transfer', 'crypto transfer', 'send amount', 'transfer to'],
    confidence: 0.94,
    context: 'Send funds/crypto'
  },
  WALLET_RECEIVE: {
    name: 'wallet_receive',
    category: 'wallet',
    triggers: ['receive', 'wallet address', 'receive address', 'deposit', 'receive payment'],
    variations: ['receiving address', 'where send', 'accept payment', 'deposit address'],
    confidence: 0.93,
    context: 'Receive funds'
  },
  WALLET_GAS: {
    name: 'wallet_gas',
    category: 'wallet',
    triggers: ['gas fee', 'transaction fee', 'cost', 'fee', 'how much fee', 'gas price'],
    variations: ['network fee', 'transaction cost', 'fee amount', 'estimate cost'],
    confidence: 0.91,
    context: 'Gas/transaction fees'
  },
  WALLET_HISTORY: {
    name: 'wallet_history',
    category: 'wallet',
    triggers: ['transaction history', 'past transactions', 'tx history', 'transaction list', 'payment history'],
    variations: ['transaction record', 'payment log', 'transaction timeline', 'past transactions'],
    confidence: 0.92,
    context: 'Transaction history'
  },
  WALLET_SECURITY: {
    name: 'wallet_security',
    category: 'wallet',
    triggers: ['security', 'backup', 'private key', 'seed phrase', '2fa', 'two factor', 'secure'],
    variations: ['wallet security', 'key backup', 'access security', 'protection'],
    confidence: 0.93,
    context: 'Wallet security'
  },
  WALLET_DISCONNECT: {
    name: 'wallet_disconnect',
    category: 'wallet',
    triggers: ['disconnect wallet', 'remove wallet', 'unlink wallet', 'wallet disconnect'],
    variations: ['wallet removal', 'disconnect', 'remove crypto wallet'],
    confidence: 0.90,
    context: 'Disconnect wallet'
  },
  PAYMENT_METHOD: {
    name: 'payment_method',
    category: 'payments',
    triggers: ['payment method', 'payment options', 'how pay', 'pay with', 'payment', 'card'],
    variations: ['payment ways', 'accepted payment', 'payment accepted', 'how to pay'],
    confidence: 0.95,
    context: 'Payment methods'
  },
  PAYMENT_CARD: {
    name: 'payment_card',
    category: 'payments',
    triggers: ['card', 'credit card', 'debit card', 'card payment', 'add card'],
    variations: ['payment card', 'card details', 'card setup', 'credit payment'],
    confidence: 0.93,
    context: 'Card payments'
  },
  PAYMENT_CRYPTO: {
    name: 'payment_crypto',
    category: 'payments',
    triggers: ['crypto payment', 'pay with crypto', 'ethereum', 'bitcoin', 'polygon', 'blockchain payment'],
    variations: ['cryptocurrency', 'crypto transfer', 'blockchain', 'digital currency'],
    confidence: 0.92,
    context: 'Cryptocurrency payments'
  },
  PAYMENT_BANK: {
    name: 'payment_bank',
    category: 'payments',
    triggers: ['bank transfer', 'bank payment', 'bank account', 'wire transfer', 'eft'],
    variations: ['bank deposit', 'banking', 'bank details', 'account transfer'],
    confidence: 0.91,
    context: 'Bank transfers'
  },
  PAYMENT_ISSUE: {
    name: 'payment_issue',
    category: 'payments',
    triggers: ['payment failed', 'payment error', 'payment issue', 'payment problem', 'couldn\'t pay'],
    variations: ['payment declined', 'transaction failed', 'payment unsuccessful', 'checkout error'],
    confidence: 0.92,
    context: 'Payment issues'
  },
  PAYMENT_REFUND: {
    name: 'payment_refund',
    category: 'payments',
    triggers: ['refund', 'refund payment', 'get refund', 'money back', 'return money'],
    variations: ['refund request', 'reimbursement', 'money refund', 'refund status'],
    confidence: 0.93,
    context: 'Refunds & reimbursements'
  },
  PAYMENT_INVOICE: {
    name: 'payment_invoice',
    category: 'payments',
    triggers: ['invoice', 'receipt', 'billing', 'bill', 'payment receipt', 'order'],
    variations: ['payment receipt', 'billing invoice', 'order receipt', 'documentation'],
    confidence: 0.91,
    context: 'Invoices & receipts'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ACCOUNT & PROFILE (14 intents)
  // ─────────────────────────────────────────────────────────────────────────
  ACCOUNT_LOGIN: {
    name: 'account_login',
    category: 'account',
    triggers: ['login', 'sign in', 'signin', 'log in', 'access account'],
    variations: ['log in', 'sign into', 'user login', 'authentication'],
    confidence: 0.96,
    context: 'Account login'
  },
  ACCOUNT_SIGNUP: {
    name: 'account_signup',
    category: 'account',
    triggers: ['sign up', 'signup', 'register', 'create account', 'join', 'new account'],
    variations: ['account creation', 'registration', 'new user', 'get started'],
    confidence: 0.96,
    context: 'Account signup'
  },
  ACCOUNT_LOGOUT: {
    name: 'account_logout',
    category: 'account',
    triggers: ['logout', 'log out', 'sign out', 'exit', 'disconnect account'],
    variations: ['sign out', 'log off', 'end session', 'leave'],
    confidence: 0.95,
    context: 'Account logout'
  },
  ACCOUNT_PROFILE: {
    name: 'account_profile',
    category: 'account',
    triggers: ['profile', 'my profile', 'profile info', 'personal info', 'about me'],
    variations: ['profile page', 'user profile', 'account info', 'profile details'],
    confidence: 0.94,
    context: 'User profile'
  },
  ACCOUNT_EDIT: {
    name: 'account_edit',
    category: 'account',
    triggers: ['edit profile', 'update profile', 'change name', 'update info', 'change email'],
    variations: ['modify profile', 'profile update', 'change details', 'update account'],
    confidence: 0.93,
    context: 'Edit profile'
  },
  ACCOUNT_PASSWORD: {
    name: 'account_password',
    category: 'account',
    triggers: ['password', 'change password', 'forgot password', 'reset password', 'new password'],
    variations: ['password reset', 'password change', 'forgot pass', 'password recovery'],
    confidence: 0.95,
    context: 'Password management'
  },
  ACCOUNT_EMAIL: {
    name: 'account_email',
    category: 'account',
    triggers: ['email', 'change email', 'update email', 'verify email', 'email verification'],
    variations: ['email address', 'email change', 'email update', 'unverified email'],
    confidence: 0.92,
    context: 'Email management'
  },
  ACCOUNT_PHONE: {
    name: 'account_phone',
    category: 'account',
    triggers: ['phone', 'phone number', 'update phone', 'change phone', 'mobile'],
    variations: ['phone update', 'mobile number', 'phone change', 'phone verification'],
    confidence: 0.90,
    context: 'Phone management'
  },
  ACCOUNT_DELETE: {
    name: 'account_delete',
    category: 'account',
    triggers: ['delete account', 'close account', 'remove account', 'deactivate', 'data removal'],
    variations: ['delete profile', 'close account', 'account closure', 'account removal'],
    confidence: 0.92,
    context: 'Delete account'
  },
  ACCOUNT_VERIFICATION: {
    name: 'account_verification',
    category: 'account',
    triggers: ['verify', 'verification', 'verify account', 'verify identity', 'kyc'],
    variations: ['identity verification', 'account verification', 'identity check', 'verification status'],
    confidence: 0.91,
    context: 'Account verification/KYC'
  },
  ACCOUNT_PREFERENCES: {
    name: 'account_preferences',
    category: 'account',
    triggers: ['preferences', 'settings', 'account settings', 'notification settings', 'privacy settings'],
    variations: ['user settings', 'account preferences', 'notification preferences', 'privacy options'],
    confidence: 0.92,
    context: 'Settings & preferences'
  },
  ACCOUNT_PRIVACY: {
    name: 'account_privacy',
    category: 'account',
    triggers: ['privacy', 'privacy settings', 'private profile', 'data privacy', 'public profile'],
    variations: ['privacy controls', 'privacy policy', 'profile visibility', 'data protection'],
    confidence: 0.91,
    context: 'Privacy settings'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SUPPORT & HELP (12 intents)
  // ─────────────────────────────────────────────────────────────────────────
  HELP_GENERAL: {
    name: 'help_general',
    category: 'support',
    triggers: ['help', 'assist', 'support', 'need help', 'help me', 'assist me', 'can\'t', 'problem'],
    variations: ['how can help', 'help with', 'assistance', 'support needed'],
    confidence: 0.95,
    context: 'General help'
  },
  HELP_FAQ: {
    name: 'help_faq',
    category: 'support',
    triggers: ['faq', 'frequently asked', 'common questions', 'common issue', 'troubleshoot'],
    variations: ['question answer', 'common problems', 'FAQ list', 'frequently asked questions'],
    confidence: 0.90,
    context: 'FAQ & troubleshooting'
  },
  HELP_CONTACT: {
    name: 'help_contact',
    category: 'support',
    triggers: ['contact', 'reach out', 'support contact', 'customer service', 'support team'],
    variations: ['contact support', 'how to reach', 'contact info', 'support number'],
    confidence: 0.92,
    context: 'Contact support'
  },
  HELP_DOCUMENTATION: {
    name: 'help_documentation',
    category: 'support',
    triggers: ['guide', 'tutorial', 'how to', 'documentation', 'manual', 'instructions'],
    variations: ['help guide', 'user guide', 'tutorial', 'step by step'],
    confidence: 0.91,
    context: 'Documentation & guides'
  },
  HELP_TERMS: {
    name: 'help_terms',
    category: 'support',
    triggers: ['terms', 'terms of service', 'conditions', 'tos', 'terms and conditions'],
    variations: ['service terms', 'terms conditions', 'agreement', 'policy'],
    confidence: 0.90,
    context: 'Terms of service'
  },
  HELP_PRIVACY_POLICY: {
    name: 'help_privacy_policy',
    category: 'support',
    triggers: ['privacy policy', 'privacy', 'data policy', 'policy', 'data handling'],
    variations: ['privacy statement', 'data policy', 'privacy practices', 'how data used'],
    confidence: 0.90,
    context: 'Privacy policy'
  },
  HELP_BUG_REPORT: {
    name: 'help_bug_report',
    category: 'support',
    triggers: ['bug', 'report bug', 'error', 'crash', 'not working', 'broken', 'glitch'],
    variations: ['bug report', 'error report', 'technical issue', 'system error'],
    confidence: 0.92,
    context: 'Bug reporting'
  },
  HELP_FEEDBACK: {
    name: 'help_feedback',
    category: 'support',
    triggers: ['feedback', 'suggest', 'suggestion', 'feature request', 'improve'],
    variations: ['send feedback', 'app improvement', 'suggestion box', 'feature suggestion'],
    confidence: 0.89,
    context: 'Feedback & suggestions'
  },
  HELP_REPORT: {
    name: 'help_report',
    category: 'support',
    triggers: ['report', 'report user', 'report abuse', 'report account', 'abuse'],
    variations: ['flag abuse', 'report violation', 'report content', 'abuse report'],
    confidence: 0.88,
    context: 'Report abuse/violations'
  },
  HELP_COMMUNITY: {
    name: 'help_community',
    category: 'support',
    triggers: ['community', 'forum', 'user forum', 'chat group', 'community group'],
    variations: ['community chat', 'discussion forum', 'user community', 'community support'],
    confidence: 0.85,
    context: 'Community resources'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INFINITY WALL & LEGACY (6 intents)
  // ─────────────────────────────────────────────────────────────────────────
  INFINITY_WALL_INFO: {
    name: 'infinity_wall_info',
    category: 'infinity',
    triggers: ['infinity wall', 'infinity', 'hall of fame', 'legacy', 'become legend'],
    variations: ['what\'s infinity wall', 'infinity wall info', 'legendary status', 'digital hall of fame'],
    confidence: 0.94,
    context: 'Infinity Wall information'
  },
  INFINITY_WALL_QUALIFY: {
    name: 'infinity_wall_qualify',
    category: 'infinity',
    triggers: ['qualify infinity', 'how qualify', 'infinity requirements', 'infinity criteria', 'earn infinity'],
    variations: ['infinity qualification', 'requirement infinity', 'infinity eligibility'],
    confidence: 0.92,
    context: 'Infinity Wall qualification'
  },
  INFINITY_WALL_VIEW: {
    name: 'infinity_wall_view',
    category: 'infinity',
    triggers: ['view infinity', 'see infinity', 'infinity members', 'top contributors'],
    variations: ['infinity list', 'hall of fame list', 'legendary members'],
    confidence: 0.90,
    context: 'View Infinity Wall'
  },
  INFINITY_WALL_BENEFITS: {
    name: 'infinity_wall_benefits',
    category: 'infinity',
    triggers: ['infinity benefits', 'infinity perks', 'infinity rewards', 'what get infinity'],
    variations: ['infinity advantages', 'infinity rewards', 'benefits legendary'],
    confidence: 0.89,
    context: 'Infinity Wall benefits'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SOCIAL & ENGAGEMENT (10 intents)
  // ─────────────────────────────────────────────────────────────────────────
  SOCIAL_FOLLOW: {
    name: 'social_follow',
    category: 'social',
    triggers: ['follow', 'follow user', 'follow player', 'follow account'],
    variations: ['add follower', 'start following', 'subscribe to'],
    confidence: 0.93,
    context: 'Follow users'
  },
  SOCIAL_UNFOLLOW: {
    name: 'social_unfollow',
    category: 'social',
    triggers: ['unfollow', 'stop following', 'unsubscribe'],
    variations: ['remove follower', 'stop follow'],
    confidence: 0.92,
    context: 'Unfollow users'
  },
  SOCIAL_FOLLOWERS: {
    name: 'social_followers',
    category: 'social',
    triggers: ['followers', 'my followers', 'following', 'fan count', 'follower list'],
    variations: ['follower count', 'who follows me', 'following list'],
    confidence: 0.94,
    context: 'View followers'
  },
  SOCIAL_MESSAGE: {
    name: 'social_message',
    category: 'social',
    triggers: ['message', 'dm', 'direct message', 'send message', 'chat'],
    variations: ['private message', 'inbox', 'message user'],
    confidence: 0.93,
    context: 'Direct messaging'
  },
  SOCIAL_LIKE: {
    name: 'social_like',
    category: 'social',
    triggers: ['like', 'heart', 'upvote', 'thumbs up'],
    variations: ['give like', 'like post', 'approve'],
    confidence: 0.91,
    context: 'Like/upvote content'
  },
  SOCIAL_SHARE: {
    name: 'social_share',
    category: 'social',
    triggers: ['share', 'repost', 'post', 'share social', 'share media'],
    variations: ['share with friends', 'social share', 'repost content'],
    confidence: 0.92,
    context: 'Share content'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LANGUAGE & COMMUNICATION (8 intents)
  // ─────────────────────────────────────────────────────────────────────────
  LANG_CHANGE: {
    name: 'lang_change',
    category: 'language',
    triggers: ['language', 'change language', 'switch language', 'urdu', 'english', 'hindi'],
    variations: ['preferred language', 'language settings', 'translate', 'different language'],
    confidence: 0.93,
    context: 'Language preferences'
  },
  LANG_URDU: {
    name: 'lang_urdu',
    category: 'language',
    triggers: ['urdu', 'اردو', 'in urdu', 'speak urdu'],
    variations: ['urdu language', 'urdu translation'],
    confidence: 0.90,
    context: 'Urdu language'
  },
  LANG_HINDI: {
    name: 'lang_hindi',
    category: 'language',
    triggers: ['hindi', 'हिन्दी', 'in hindi', 'speak hindi'],
    variations: ['hindi language', 'hindi translation'],
    confidence: 0.88,
    context: 'Hindi language'
  },
  LANG_ENGLISH: {
    name: 'lang_english',
    category: 'language',
    triggers: ['english', 'english language', 'in english'],
    variations: ['english translation', 'english version'],
    confidence: 0.89,
    context: 'English language'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SENTIMENT & EMOTIONAL (8 intents)
  // ─────────────────────────────────────────────────────────────────────────
  SENTIMENT_POSITIVE: {
    name: 'sentiment_positive',
    category: 'sentiment',
    triggers: ['love', 'awesome', 'great', 'amazing', 'best', 'excellent', 'wonderful', 'brilliant'],
    variations: ['this is great', 'so cool', 'brilliant app', 'super impressed'],
    confidence: 0.92,
    context: 'Positive sentiment'
  },
  SENTIMENT_NEGATIVE: {
    name: 'sentiment_negative',
    category: 'sentiment',
    triggers: ['hate', 'terrible', 'bad', 'worst', 'awful', 'horrible', 'stupid', 'useless'],
    variations: ['this sucks', 'so bad', 'terrible experience', 'hate this'],
    confidence: 0.93,
    context: 'Negative sentiment'
  },
  SENTIMENT_NEUTRAL: {
    name: 'sentiment_neutral',
    category: 'sentiment',
    triggers: ['ok', 'fine', 'alright', 'good', 'nice', 'decent'],
    variations: ['it\'s okay', 'pretty good', 'acceptable'],
    confidence: 0.85,
    context: 'Neutral sentiment'
  },
  SENTIMENT_CONFUSED: {
    name: 'sentiment_confused',
    category: 'sentiment',
    triggers: ['confused', 'don\'t understand', 'what', 'huh', 'explain', 'lost'],
    variations: ['i\'m confused', 'not clear', 'don\'t get it', 'help me understand'],
    confidence: 0.88,
    context: 'User confusion'
  },
  SENTIMENT_FRUSTRATED: {
    name: 'sentiment_frustrated',
    category: 'sentiment',
    triggers: ['frustrated', 'annoyed', 'irritated', 'upset', 'angry', 'ugh', 'argh'],
    variations: ['this is frustrating', 'so annoyed', 'getting angry'],
    confidence: 0.89,
    context: 'User frustration'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CASUAL & CONVERSATIONAL (10 intents)
  // ─────────────────────────────────────────────────────────────────────────
  CASUAL_GREETING: {
    name: 'casual_greeting',
    category: 'casual',
    triggers: ['hi', 'hello', 'hey', 'yo', 'sup', 'greetings', 'howdy', 'what\'s up'],
    variations: ['hello there', 'hey friend', 'good morning', 'good afternoon'],
    confidence: 0.96,
    context: 'Casual greeting'
  },
  CASUAL_GOODBYE: {
    name: 'casual_goodbye',
    category: 'casual',
    triggers: ['bye', 'goodbye', 'see you', 'cya', 'farewell', 'until next', 'later'],
    variations: ['take care', 'bye friend', 'catch you later'],
    confidence: 0.95,
    context: 'Casual goodbye'
  },
  CASUAL_THANKS: {
    name: 'casual_thanks',
    category: 'casual',
    triggers: ['thanks', 'thank you', 'appreciate it', 'thnk', 'ty', 'thanx'],
    variations: ['thanks so much', 'appreciate that', 'thank you very much'],
    confidence: 0.94,
    context: 'Thanking'
  },
  CASUAL_CHAT: {
    name: 'casual_chat',
    category: 'casual',
    triggers: ['how are you', 'how\'s it going', 'you ok', 'how you doing', 'what\'s new'],
    variations: ['you doing good', 'how you been', 'what\'s happening'],
    confidence: 0.91,
    context: 'Casual chit-chat'
  },
  CASUAL_JOKE: {
    name: 'casual_joke',
    category: 'casual',
    triggers: ['joke', 'funny', 'laugh', 'haha', 'lol', 'make laugh', 'entertain'],
    variations: ['tell joke', 'something funny', 'make me laugh'],
    confidence: 0.85,
    context: 'Humor/jokes'
  },
  CASUAL_TIME: {
    name: 'casual_time',
    category: 'casual',
    triggers: ['what time', 'current time', 'time now', 'what\'s the time', 'time is'],
    variations: ['show time', 'tell me time', 'time please'],
    confidence: 0.89,
    context: 'Time inquiry'
  },
  CASUAL_DATE: {
    name: 'casual_date',
    category: 'casual',
    triggers: ['what date', 'today\'s date', 'date today', 'what\'s today', 'current date'],
    variations: ['show date', 'tell date', 'date please', 'today'],
    confidence: 0.90,
    context: 'Date inquiry'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SPECIFIC FEATURE QUERIES (remaining diverse intents)
  // ─────────────────────────────────────────────────────────────────────────
  FEATURE_SEARCH: {
    name: 'feature_search',
    category: 'features',
    triggers: ['search', 'find', 'look for', 'search for', 'find me', 'where is'],
    variations: ['search functionality', 'find player', 'search match'],
    confidence: 0.91,
    context: 'Search feature'
  },
  FEATURE_FILTER: {
    name: 'feature_filter',
    category: 'features',
    triggers: ['filter', 'sort', 'organize', 'by date', 'by name', 'by price'],
    variations: ['filtering options', 'sorting', 'organize by'],
    confidence: 0.89,
    context: 'Filtering & sorting'
  },
  FEATURE_EXPORT: {
    name: 'feature_export',
    category: 'features',
    triggers: ['export', 'download', 'save file', 'csv', 'pdf', 'backup'],
    variations: ['export data', 'download file', 'save as'],
    confidence: 0.89,
    context: 'Export/download features'
  },
  FEATURE_IMPORT: {
    name: 'feature_import',
    category: 'features',
    triggers: ['import', 'upload', 'import data', 'upload file'],
    variations: ['import file', 'upload data', 'import from'],
    confidence: 0.88,
    context: 'Import features'
  },
  FEATURE_SYNC: {
    name: 'feature_sync',
    category: 'features',
    triggers: ['sync', 'synchronize', 'device sync', 'cloud sync', 'backup sync'],
    variations: ['cloud synchronization', 'sync devices', 'auto sync'],
    confidence: 0.87,
    context: 'Sync features'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SPECIAL QUERIES
  // ─────────────────────────────────────────────────────────────────────────
  SPECIAL_EASTER_EGG: {
    name: 'special_easter_egg',
    category: 'special',
    triggers: ['easter egg', 'hidden', 'cheat code', 'secret', 'konami'],
    variations: ['find hidden', 'unlock secret', 'special code'],
    confidence: 0.80,
    context: 'Easter eggs'
  },
  SPECIAL_APP_INFO: {
    name: 'special_app_info',
    category: 'special',
    triggers: ['about', 'about app', 'app info', 'app version', 'version'],
    variations: ['app information', 'version number', 'app details', 'about us'],
    confidence: 0.90,
    context: 'App information'
  },
  SPECIAL_CREDITS: {
    name: 'special_credits',
    category: 'special',
    triggers: ['credits', 'made by', 'developer', 'team', 'who made', 'attribution'],
    variations: ['team credits', 'developer info', 'made by whom'],
    confidence: 0.85,
    context: 'Credits & attribution'
  },
  SPECIAL_DEBUG: {
    name: 'special_debug',
    category: 'special',
    triggers: ['debug', 'diagnostic', 'system info', 'device info', 'technical'],
    variations: ['debug info', 'system diagnostic', 'technical information'],
    confidence: 0.82,
    context: 'Debug information'
  },
};

// ============================================================================
// INTENT ENGINE CLASS
// ============================================================================

export class IntentEngine {
  private registry: typeof INTENT_REGISTRY;
  private contextHistory: ConversationContext[] = [];

  constructor() {
    this.registry = INTENT_REGISTRY;
  }

  /**
   * Main method: Analyze user input and return best intent match(es)
   */
  analyze(
    userInput: string,
    conversationContext?: ConversationContext,
    userJourney?: UserJourney
  ): IntentResult {
    const lowerInput = userInput.toLowerCase().trim();
    const matches: IntentMatch[] = [];
    
    console.log(`🔤 Analyzing input: "${userInput}" (normalized: "${lowerInput}")`);

    // Update context history
    if (conversationContext) {
      this.contextHistory.push(conversationContext);
    }

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 1: EXACT TRIGGER MATCHING (highest confidence)
    // ─────────────────────────────────────────────────────────────────────
    console.log(`🔎 PHASE 1: Checking exact trigger matches for "${lowerInput}"...`);
    for (const [key, intent] of Object.entries(this.registry)) {
      for (const trigger of intent.triggers) {
        if (lowerInput === trigger) {
          console.log(`🎯 EXACT MATCH FOUND! Intent: "${intent.name}", Trigger: "${trigger}"`);
          matches.push({
            intent: intent.name,
            confidence: 0.99,
            category: intent.category,
            triggers: intent.triggers,
            context: intent.context,
          });
          break;
        }
      }
    }

    // If perfect match found, return immediately
    if (matches.length > 0) {
      console.log(`✅ PHASE 1 Success! Returning intent: "${matches[0].intent}" with confidence 0.99`);
      return this.buildIntentResult(matches[0], userInput, conversationContext);
    }
    
    console.log(`❌ No exact matches in PHASE 1, moving to PHASE 2...`);

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 2: CONTAINS MATCHING (fuzzy/partial matching)
    // ─────────────────────────────────────────────────────────────────────
    console.log(`🔍 PHASE 2: Checking fuzzy/partial matches for "${lowerInput}"...`);
    const triggerMatches: IntentMatch[] = [];

    for (const [key, intent] of Object.entries(this.registry)) {
      for (const trigger of intent.triggers) {
        // Check if input contains trigger
        if (lowerInput.includes(trigger)) {
          const confidence = this.calculateConfidence(
            userInput,
            trigger,
            intent
          );
          triggerMatches.push({
            intent: intent.name,
            confidence: confidence * intent.confidence, // Combine scores
            category: intent.category,
            triggers: intent.triggers,
            context: intent.context,
          });
        }
      }

      // Also check variations
      if (intent.variations) {
        for (const variation of intent.variations) {
          if (lowerInput.includes(variation)) {
            const confidence =
              this.calculateConfidence(userInput, variation, intent) * 0.95;
            triggerMatches.push({
              intent: intent.name,
              confidence: confidence * (intent.confidence - 0.05),
              category: intent.category,
              triggers: intent.triggers,
              context: intent.context,
            });
          }
        }
      }
    }

    // Sort by confidence descending
    triggerMatches.sort((a, b) => b.confidence - a.confidence);
    console.log(`📊 PHASE 2 found ${triggerMatches.length} potential matches. Top match:`, triggerMatches[0]?.intent, `(${triggerMatches[0]?.confidence})`);

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 3: CONTEXT-AWARE FALLBACK
    // ─────────────────────────────────────────────────────────────────────
    let primaryMatch: IntentMatch | null = triggerMatches[0] || null;

    // If no matches but we have conversation context, use contextual intent
    if (!primaryMatch && conversationContext) {
      console.log(`🔄 No fuzzy matches, using contextual fallback...`);
      primaryMatch = this.getContextualIntent(
        userInput,
        conversationContext,
        userJourney
      );
    }

    // If still no match, use general help fallback
    if (!primaryMatch) {
      console.log(`❌ No match found anywhere! Using help_general fallback`);
      primaryMatch = {
        intent: 'help_general',
        confidence: 0.30,
        category: 'support',
        triggers: [],
        context: 'General help'
      };
    }
    
    console.log(`🎯 FINAL Intent being returned: "${primaryMatch.intent}" (${primaryMatch.confidence})`);

    return this.buildIntentResult(primaryMatch, userInput, conversationContext);
  }

  /**
   * Calculate confidence based on trigger match quality
   */
  private calculateConfidence(
    userInput: string,
    trigger: string,
    intent: any
  ): number {
    const lowerInput = userInput.toLowerCase();

    // Exact match is highest confidence
    if (lowerInput === trigger.toLowerCase()) return 0.99;

    // Check match ratio
    const triggerWords = trigger.split(/\s+/);
    const inputWords = lowerInput.split(/\s+/);
    const matches = triggerWords.filter((w) => inputWords.includes(w)).length;
    const ratio = matches / Math.max(triggerWords.length, 1);

    // Multi-word triggers are more reliable
    if (triggerWords.length > 1) {
      // Contains all words of trigger
      if (ratio === 1) return 0.95;
      // Contains most words
      if (ratio >= 0.7) return 0.80;
      // Contains some words
      if (ratio >= 0.4) return 0.60;
    } else {
      // Single word trigger
      if (ratio === 1) return 0.90;
      // Input contains trigger as substring
      if (lowerInput.includes(trigger)) return 0.75;
    }

    return 0.50;
  }

  /**
   * Get intent based on conversation context
   */
  private getContextualIntent(
    userInput: string,
    context: ConversationContext,
    userJourney?: UserJourney
  ): IntentMatch | null {
    // If last intent was about tickets, and user says "yes" or similar
    if (context.lastIntent?.includes('ticket')) {
      if (
        userInput.toLowerCase().match(/^(yes|ok|confirm|ok)\.?$/)
      ) {
        return {
          intent: 'ticket_buy',
          confidence: 0.75,
          category: 'tickets',
          triggers: [],
          context: 'Contextual - ticket follow-up',
        };
      }
    }

    // If last intent was about donations
    if (context.lastIntent?.includes('donation')) {
      if (userInput.toLowerCase().match(/^(yes|thank|great|ok)\.?$/)) {
        return {
          intent: 'donation_make',
          confidence: 0.75,
          category: 'donations',
          triggers: [],
          context: 'Contextual - donation follow-up',
        };
      }
    }

    // If in cricket context
    if (userJourney?.currentCategory === 'cricket') {
      return {
        intent: 'cricket_commentary',
        confidence: 0.65,
        category: 'cricket',
        triggers: [],
        context: 'Contextual - cricket continuation',
      };
    }

    return null;
  }

  /**
   * Build final intent result
   */
  private buildIntentResult(
    primaryMatch: IntentMatch,
    userInput: string,
    context?: ConversationContext
  ): IntentResult {
    const result: IntentResult = {
      intent: primaryMatch.intent,
      category: primaryMatch.category,
      confidence: primaryMatch.confidence,
      context: primaryMatch.context,
      userInput: userInput,
      timestamp: Date.now(),
      conversationContext: context,
    };
    console.log(`📦 buildIntentResult returning:`, result);
    return result;
  }

  /**
   * Get all intents in a category
   */
  getIntentsByCategory(category: string): string[] {
    return Object.values(this.registry)
      .filter((intent) => intent.category === category)
      .map((intent) => intent.name);
  }

  /**
   * Get all categories
   */
  getAllCategories(): string[] {
    return Array.from(
      new Set(Object.values(this.registry).map((intent) => intent.category))
    );
  }

  /**
   * Get intent metadata
   */
  getIntentMetadata(intentName: string) {
    for (const [key, intent] of Object.entries(this.registry)) {
      if (intent.name === intentName) {
        return intent;
      }
    }
    return null;
  }
}

export default IntentEngine;
