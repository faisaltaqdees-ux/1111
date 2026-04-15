/**
 * PSL Pulse Frontend Type Definitions
 * Comprehensive types for the application
 */

// User & Wallet
export interface User {
  address: string;
  balance: string;
  isConnected: boolean;
  chainId: number;
}

// Contract Interfaces
export interface Match {
  id: string;
  team1: string;
  team2: string;
  status: MatchStatus;
  createdAt: number;
  startTime: number;
  endTime?: number;
  totalTickets: bigint;
  soldTickets: bigint;
  pricePerTicket: bigint;
}

export interface Bet {
  id: string;
  matchId: string;
  bettor: string;
  amount: string;
  prediction: string;
  odds: string;
  status: BetStatus;
  createdAt: number;
  settledAt?: number;
  payout?: string;
}

export interface Badge {
  id: string;
  name: string;
  tokenUri: string;
  description: string;
  imageUrl: string;
  rarity: BadgeRarity;
  owner?: string;
  issueDate?: number;
}

export interface Ticket {
  id: string;
  matchId: string;
  owner: string;
  eventDate: number;
  status: TicketStatus;
  transferable: boolean;
  priceAtPurchase: string;
}

// Enums
export enum MatchStatus {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum BetStatus {
  ACTIVE = 'active',
  WON = 'won',
  LOST = 'lost',
  CANCELLED = 'cancelled',
}

export enum TicketStatus {
  ACTIVE = 'active',
  USED = 'used',
  TRANSFERRED = 'transferred',
  EXPIRED = 'expired',
}

export enum BadgeRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Contract Interaction
export interface TransactionResult {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  blockNumber?: number;
}

export interface ContractABI {
  name: string;
  abi: any[];
  address: string;
}

// Store Types
export interface AppStore {
  // User State
  user: User | null;
  setUser: (user: User | null) => void;

  // Matches
  matches: Match[];
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;

  // Loading State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error State
  error: string | null;
  setError: (error: string | null) => void;

  // Toast Notifications
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

// UI Component Props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
  children: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

// Error Handling
export interface ErrorDetail {
  code: string;
  message: string;
  statusCode: number;
  timestamp: number;
}

// Analytics
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
}
