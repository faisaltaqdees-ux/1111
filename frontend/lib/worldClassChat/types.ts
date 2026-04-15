/**
 * WORLD-CLASS CHATBOT: TYPE DEFINITIONS
 * Shared types used across all 3 parts
 */

export interface ConversationContext {
  userId?: string;
  message?: string;
  role?: 'user' | 'ai';
  timestamp: number;
  lastIntent?: string;
  sentiment?: string;
  userInput?: string;
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  interests?: string[];
  joinDate?: number;
  preferences?: {
    language?: 'en' | 'ur' | 'hi';
    responseLength?: 'brief' | 'detailed' | 'adaptive';
  };
  isVerified?: boolean;
  donationTotal?: number;
  impactPoints?: number;
  badges?: string[];
}

export interface UserJourney {
  userId: string;
  currentCategory?: string;
  visitedFeatures: string[];
  totalInteractions: number;
  averageSessionLength: number;
  lastActiveTime?: number;
  conversionStage?: 'discovery' | 'engagement' | 'retention' | 'advocacy';
  likelyNextAction?: string;
}

export interface IntentResult {
  intent: string;
  category: string;
  confidence: number;
  context?: string;
  userInput: string;
  timestamp: number;
  conversationContext?: ConversationContext;
}
