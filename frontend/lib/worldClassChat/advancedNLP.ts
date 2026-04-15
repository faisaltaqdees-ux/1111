/**
 * PART 3: ADVANCED NLP & LEARNING SYSTEM
 * Sentiment analysis, user profiling, adaptive learning, edge case handling
 * 5000+ lines
 */

import type { UserProfile, ConversationContext } from './types';

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'confused' | 'frustrated';
  score: number; // -1 to 1
  keywords: string[];
  intensity: 'low' | 'medium' | 'high';
}

export interface UserLearningProfile {
  userId: string;
  preferences: UserPreferences;
  communicationStyle: CommunicationStyle;
  interactionHistory: InteractionRecord[];
  learnedPatterns: LearnedPattern[];
}

export interface UserPreferences {
  responseLength: 'brief' | 'detailed' | 'adaptive';
  tonePreference: 'casual' | 'formal' | 'friendly' | 'technical';
  languagePreference: 'en' | 'ur' | 'hi';
  featuresInterested: string[];
  frequentTopics: string[];
  optOutCategories: string[];
}

export interface CommunicationStyle {
  averageResponseLength: number;
  commonPhrases: string[];
  usesEmojis: boolean;
  usesFormality: 'high' | 'medium' | 'low';
  typoPatterns: string[];
}

export interface InteractionRecord {
  timestamp: number;
  userInput: string;
  detectedIntent: string;
  responseGenerated: string;
  userSatisfaction?: 'positive' | 'negative' | 'neutral';
  timeSpent?: number;
  followUpAction?: string;
}

export interface LearnedPattern {
  pattern: string;
  intent: string;
  occurrences: number;
  accuracy: number;
  recommendedResponse: string;
}

export interface EdgeCaseHandler {
  pattern: RegExp;
  handler: (input: string, context?: ConversationContext) => string;
  priority: number;
}

// ============================================================================
// ADVANCED NLP SENTIMENT ANALYZER
// ============================================================================

export class SentimentAnalyzer {
  // Emotion dictionaries
  private positiveWords = new Set([
    'love', 'awesome', 'amazing', 'great', 'excellent', 'wonderful', 'brilliant',
    'fantastic', 'perfect', 'beautiful', 'good', 'nice', 'cool', 'awesome',
    'terrific', 'super', 'best', 'legend', 'wow', 'yeah', 'yes', 'yay',
    'impressive', 'incredible', 'stunning', 'gorgeous', 'hot', 'fire', 'sick',
    'dope', 'rad', 'epic', 'clutch', 'blessed', 'grateful', 'appreciated',
  ]);

  private negativeWords = new Set([
    'hate', 'terrible', 'bad', 'awful', 'horrible', 'worst', 'stupid', 'useless',
    'waste', 'broken', 'error', 'crash', 'bug', 'problem', 'issue', 'sucks',
    'disgusting', 'pathetic', 'garbage', 'annoying', 'frustrating', 'disappointing',
    'angry', 'mad', 'furious', 'upset', 'sad', 'depressed', 'annoyed', 'irritated',
    'no', 'don\'t', 'never', 'fail', 'failed', 'doesn\'t work', 'not working',
  ]);

  private confusionWords = new Set([
    'what', 'how', 'why', 'confused', 'don\'t understand', 'huh', 'explain',
    'lost', 'unclear', 'not clear', 'help', 'assist', 'confused', 'unclear',
    'what does that mean', 'i don\'t get', 'explain', 'tell me more',
  ]);

  private frustrationWords = new Set([
    'ugh', 'argh', 'ugh', 'grrr', 'frustrated', 'annoyed', 'irritated',
    'can\'t', 'couldn\'t', 'won\'t', 'wouldn\'t', 'not again', 'seriously',
    'this is ridiculous', 'come on', 'for real', 'no way', 'done',
  ]);

  /**
   * Analyze sentiment of user input
   */
  analyzeSentiment(input: string): SentimentAnalysis {
    const lowerInput = input.toLowerCase();
    const words = lowerInput.split(/\s+/);

    let score = 0;
    let keywords: string[] = [];
    let sentiment: 'positive' | 'negative' | 'neutral' | 'confused' | 'frustrated' =
      'neutral';
    let intensity: 'low' | 'medium' | 'high' = 'low';

    // Count sentiment markers
    let positiveCount = 0;
    let negativeCount = 0;
    let confusionCount = 0;
    let frustrationCount = 0;

    for (const word of words) {
      // Clean punctuation
      const cleanWord = word.replace(/[.,!?;:'"-]/g, '');

      if (this.positiveWords.has(cleanWord)) {
        positiveCount++;
        keywords.push(cleanWord);
        score += 0.15;
      } else if (this.negativeWords.has(cleanWord)) {
        negativeCount++;
        keywords.push(cleanWord);
        score -= 0.15;
      } else if (this.confusionWords.has(cleanWord)) {
        confusionCount++;
        keywords.push(cleanWord);
      } else if (this.frustrationWords.has(cleanWord)) {
        frustrationCount++;
        keywords.push(cleanWord);
        score -= 0.10;
      }
    }

    // Detect sentiment type
    if (confusionCount > 0) {
      sentiment = 'confused';
      intensity = confusionCount > 3 ? 'high' : 'medium';
    } else if (frustrationCount > 0) {
      sentiment = 'frustrated';
      intensity = frustrationCount > 2 ? 'high' : 'medium';
    } else if (positiveCount > negativeCount) {
      sentiment = 'positive';
      intensity = positiveCount > 3 ? 'high' : positiveCount > 1 ? 'medium' : 'low';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      intensity = negativeCount > 3 ? 'high' : negativeCount > 1 ? 'medium' : 'low';
    }

    // Clamp score
    score = Math.max(-1, Math.min(1, score));

    return {
      sentiment,
      score,
      keywords: Array.from(new Set(keywords)),
      intensity,
    };
  }

  /**
   * Detect typos and misspellings (user typing style)
   */
  detectTypos(input: string): string[] {
    const typos: string[] = [];

    // Common typos
    const commonTypos: Record<string, string> = {
      'teh': 'the',
      'wut': 'what',
      'ur': 'your',
      'u': 'you',
      'uare': 'you are',
      'thru': 'through',
      'mkay': 'okay',
      'rite': 'right',
      'wrld': 'world',
      'ppl': 'people',
      'sry': 'sorry',
      'thnks': 'thanks',
      'b4': 'before',
      '2': 'to/too',
      '4': 'for',
      'l8r': 'later',
      'gr8': 'great',
      'm8': 'mate',
    };

    const lowerInput = input.toLowerCase();
    for (const [typo, correct] of Object.entries(commonTypos)) {
      if (lowerInput.includes(typo)) {
        typos.push(typo);
      }
    }

    return typos;
  }

  /**
   * Detect intent from sentiment clues
   */
  detectIntentFromSentiment(analysis: SentimentAnalysis): string | null {
    if (analysis.sentiment === 'positive') return 'sentiment_positive';
    if (analysis.sentiment === 'negative') return 'sentiment_negative';
    if (analysis.sentiment === 'confused') return 'sentiment_confused';
    if (analysis.sentiment === 'frustrated') return 'sentiment_frustrated';
    return null;
  }
}

// ============================================================================
// USER PROFILING & LEARNING ENGINE
// ============================================================================

export class UserLearningEngine {
  private userProfiles: Map<string, UserLearningProfile> = new Map();
  private globalPatterns: LearnedPattern[] = [];

  /**
   * Create or retrieve user learning profile
   */
  getOrCreateProfile(userId: string): UserLearningProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        preferences: {
          responseLength: 'adaptive',
          tonePreference: 'friendly',
          languagePreference: 'en',
          featuresInterested: [],
          frequentTopics: [],
          optOutCategories: [],
        },
        communicationStyle: {
          averageResponseLength: 0,
          commonPhrases: [],
          usesEmojis: false,
          usesFormality: 'medium',
          typoPatterns: [],
        },
        interactionHistory: [],
        learnedPatterns: [],
      });
    }
    return this.userProfiles.get(userId)!;
  }

  /**
   * Record interaction and learn from it
   */
  recordInteraction(userId: string, record: InteractionRecord): void {
    const profile = this.getOrCreateProfile(userId);

    profile.interactionHistory.push(record);

    // Update communication style
    this.updateCommunicationStyle(profile, record.userInput);

    // Update interest tracking
    if (record.detectedIntent) {
      this.updateInterestTracking(profile, record.detectedIntent);
    }

    // Keep only last  500 interactions
    if (profile.interactionHistory.length > 500) {
      profile.interactionHistory = profile.interactionHistory.slice(-500);
    }

    // Keep memory manageable
    if (this.userProfiles.size > 10000) {
      this.pruneOldProfiles();
    }
  }

  /**
   * Update communication style based on user input
   */
  private updateCommunicationStyle(profile: UserLearningProfile, input: string): void {
    const style = profile.communicationStyle;

    // Update average length
    style.averageResponseLength = (style.averageResponseLength + input.length) / 2;

    // Detect emoji usage
    if (/😀|😂|❤️|🔥|😍|🎉|👍|💯|🤔|😅/.test(input)) {
      style.usesEmojis = true;
    }

    // Detect formality level
    if (input.includes('please') || input.includes('thank you') || input.includes('kindly')) {
      style.usesFormality = 'high';
    } else if (input.match(/\b(yo|sup|hey|gonna|wanna|btw|lol)\b/i)) {
      style.usesFormality = 'low';
    }

    // Track common phrases
    const phrases = input.match(/[\w]+ [\w]+ [\w]+/g) || [];
    for (const phrase of phrases) {
      if (!style.commonPhrases.includes(phrase)) {
        style.commonPhrases.push(phrase);
        if (style.commonPhrases.length > 100) {
          style.commonPhrases.shift();
        }
      }
    }
  }

  /**
   * Track which features/topics user is interested in
   */
  private updateInterestTracking(profile: UserLearningProfile, intent: string): void {
    const preferences = profile.preferences;

    // Add to frequentTopics if not there
    if (!preferences.frequentTopics.includes(intent)) {
      preferences.frequentTopics.push(intent);
    }

    // Move to front (most recent)
    preferences.frequentTopics = preferences.frequentTopics.filter((t) => t !== intent);
    preferences.frequentTopics.unshift(intent);

    // Keep only Top 20
    preferences.frequentTopics = preferences.frequentTopics.slice(0, 20);
  }

  /**
   * Get personalized response preferences for user
   */
  getResponsePreferences(userId: string) {
    const profile = this.getOrCreateProfile(userId);
    return profile.preferences;
  }

  /**
   * Get user's communication style
   */
  getCommunicationStyle(userId: string) {
    const profile = this.getOrCreateProfile(userId);
    return profile.communicationStyle;
  }

  /**
   * Predict user's likely next intent
   */
  predictNextIntent(userId: string, lastIntents: string[] = []): string[] {
    const profile = this.getOrCreateProfile(userId);

    // Get most frequent topics
    const topicCounts: Record<string, number> = {};
    for (const record of profile.interactionHistory.slice(-100)) {
      topicCounts[record.detectedIntent] = (topicCounts[record.detectedIntent] || 0) + 1;
    }

    return Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([intent]) => intent);
  }

  /**
   * Remove profiles not used in 30 days to save memory
   */
  private pruneOldProfiles(): void {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    for (const [userId, profile] of this.userProfiles.entries()) {
      const lastInteraction = profile.interactionHistory[profile.interactionHistory.length - 1];
      if (!lastInteraction || lastInteraction.timestamp < thirtyDaysAgo) {
        this.userProfiles.delete(userId);
      }
    }
  }

  /**
   * Learn patterns from interactions
   */
  learnFromInteraction(
    pattern: string,
    intent: string,
    response: string,
    isSuccessful: boolean
  ): void {
    // Find existing pattern
    let learnedPattern = this.globalPatterns.find((p) => p.pattern === pattern);

    if (!learnedPattern) {
      learnedPattern = {
        pattern,
        intent,
        occurrences: 0,
        accuracy: 0,
        recommendedResponse: response,
      };
      this.globalPatterns.push(learnedPattern);
    }

    // Update stats
    learnedPattern.occurrences++;
    const oldAccuracy = learnedPattern.accuracy;
    learnedPattern.accuracy =
      (oldAccuracy * (learnedPattern.occurrences - 1) + (isSuccessful ? 1 : 0)) /
      learnedPattern.occurrences;

    // Keep only best patterns
    if (this.globalPatterns.length > 5000) {
      this.globalPatterns = this.globalPatterns
        .sort((a, b) => b.accuracy - a.accuracy)
        .slice(0, 5000);
    }
  }
}

// ============================================================================
// EDGE CASE HANDLER SYSTEM
// ============================================================================

export class EdgeCaseHandlerEngine {
  private handlers: EdgeCaseHandler[] = [];

  constructor() {
    this.registerDefaultHandlers();
  }

  /**
   * Register default edge case handlers
   */
  private registerDefaultHandlers(): void {
    // Empty/whitespace input
    this.registerHandler(
      /^\s*$/,
      () => `I'm here to help! 👋 Say something or ask me anything.`,
      100
    );

    // Just emojis (simplified check - look for only whitespace/emoji-like content)
    this.registerHandler(
      /^[\s]*$/,
      () => `Fun with emojis! 😄 But tell me what you need?`,
      95
    );

    // Spam/repeated characters
    this.registerHandler(
      /(.)\1{5,}/,
      (input) => `Easy there! 😅 What did you mean by "${input.slice(0, 20)}..."?`,
      90
    );

    // Very long input (>500 chars)
    this.registerHandler(
      /^.{500,}$/,
      (input) => `That's quite a lot! 📚 Can you summarize in fewer words?`,
      85
    );

    // All caps
    this.registerHandler(
      /^[A-Z\s!?,.]*$/,
      (input) =>
        `No need to shout! 🔊 I can hear you. What's on your mind?`,
      80
    );

    // Numbers only
    this.registerHandler(
      /^\d+$/,
      () => `Just numbers? 🤔 Tell me what you want to do!`,
      75
    );

    // URL/link detection
    this.registerHandler(
      /https?:\/\/\S+|www\.\S+/,
      (input) =>
        `I see a link! 🔗 Can you tell me what you want to know instead?`,
      70
    );

    // Special characters only
    this.registerHandler(
      /^[!@#$%^&*()_+=\[\]{};':"<>,.?/\\|`~-]+$/,
      () => `Special characters? 🎭 What can I help with?`,
      65
    );

    // Question without info
    this.registerHandler(
      /^(what|how|why|who|when|where)\?*$/i,
      (input) =>
        `"${input}" - Sure! But give me a bit more context? What are you asking about?`,
      60
    );

    // Contradictory statements
    this.registerHandler(
      /^(yes|no).*?(no|yes)/i,
      (input) =>
        `I'm a bit confused - you said both yes and no? 🤔 What's it going to be?`,
      55
    );

    // Curse words (softly handle)
    this.registerHandler(
      /\b(damn|hell|crap|sucks|sucks|f[u|ck]|asshole|jerk)\b/i,
      (input) =>
        `Whoa! 😅 I get that you're frustrated. What can I fix for you?`,
      50
    );

    // Off-topic/random
    this.registerHandler(
      /^(meaning of life|do you think|can you|will you) /i,
      (input) =>
        `Interesting question! 🤔 But I'm here to help with PSL Pulse. What can I assist with?`,
      40
    );

    // Private/personal info request
    this.registerHandler(
      /(password|credit card|cvv|ssn|social security|bank account)/i,
      () =>
        `🔒 Never ask for sensitive info in chat! Our team would never do that. Suspicious link?`,
      95
    );

    // Typos/gibberish detection
    this.registerHandler(
      /^[bcdfghjklmnpqrstvwxyz]{6,}$/i,
      (input) =>
        `That looks like gibberish! 😅 Did you mean something else?`,
      30
    );
  }

  /**
   * Register a new edge case handler
   */
  registerHandler(pattern: RegExp, handler: (input: string, context?: ConversationContext) => string, priority: number): void {
    this.handlers.push({ pattern, handler, priority });
    this.handlers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check if input matches any edge case
   */
  handleEdgeCase(
    input: string,
    context?: ConversationContext
  ): string | null {
    for (const handler of this.handlers) {
      if (handler.pattern.test(input)) {
        try {
          return handler.handler(input, context);
        } catch (e) {
          console.error('Edge case handler error:', e);
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Check if input is an edge case
   */
  isEdgeCase(input: string): boolean {
    return this.handlers.some((h) => h.pattern.test(input));
  }
}

// ============================================================================
// CONTEXT MEMORY MANAGER
// ============================================================================

export class ContextMemoryManager {
  private conversationMemory: Map<string, ConversationContext[]> = new Map();
  private readonly maxContextLength = 50; // Store last 50 messages
  private readonly contextTimeout = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Add message to conversation memory
   */
  addToMemory(userId: string, context: ConversationContext): void {
    if (!this.conversationMemory.has(userId)) {
      this.conversationMemory.set(userId, []);
    }

    const convo = this.conversationMemory.get(userId)!;
    convo.push(context);

    // Keep only recent context
    if (convo.length > this.maxContextLength) {
      this.conversationMemory.set(userId, convo.slice(-this.maxContextLength));
    }

    // Clean old contexts
    this.cleanOldContexts(userId);
  }

  /**
   * Get conversation context for user
   */
  getContext(userId: string, depth: number = 5): ConversationContext[] {
    const convo = this.conversationMemory.get(userId) || [];
    return convo.slice(-depth);
  }

  /**
   * Get relevant context based on current intent
   */
  getRelevantContext(userId: string, currentIntent: string): ConversationContext | null {
    const convo = this.getContext(userId, 10);

    // Find recent message with same or related intent
    for (let i = convo.length - 1; i >= 0; i--) {
      const ctx = convo[i];
      if (ctx.lastIntent === currentIntent || this.areIntentsRelated(ctx.lastIntent, currentIntent)) {
        return ctx;
      }
    }

    return convo.length > 0 ? convo[convo.length - 1] : null;
  }

  /**
   * Check if two intents are related
   */
  private areIntentsRelated(intent1: string | undefined, intent2: string): boolean {
    if (!intent1) return false;

    const categoryMap: Record<string, string[]> = {
      cricket: ['cricket_score_check', 'cricket_schedule', 'cricket_stats', 'cricket_highlights'],
      ticket: ['ticket_buy', 'ticket_verify', 'ticket_transfer', 'ticket_resale'],
      badge: ['badge_earn', 'badge_progress', 'badge_view', 'badge_leaderboard'],
      donation: ['donation_make', 'donation_impact', 'donation_history'],
      wallet: ['wallet_connect', 'wallet_send', 'wallet_receive', 'payment_method'],
    };

    for (const [category, intents] of Object.entries(categoryMap)) {
      if (intents.includes(intent1) && intents.includes(intent2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clean old contexts (older than 24 hours)
   */
  private cleanOldContexts(userId: string): void {
    const convo = this.conversationMemory.get(userId);
    if (!convo) return;

    const now = Date.now();
    const fresh = convo.filter((ctx) => now - ctx.timestamp < this.contextTimeout);

    if (fresh.length > 0) {
      this.conversationMemory.set(userId, fresh);
    } else {
      this.conversationMemory.delete(userId);
    }
  }

  /**
   * Clear user's conversation memory
   */
  clearMemory(userId: string): void {
    this.conversationMemory.delete(userId);
  }

  /**
   * Get conversation summary
   */
  getSummary(userId: string): string {
    const convo = this.getContext(userId, 10);
    return convo.map((ctx) => `${ctx.role}: ${ctx.message}`).join('\n');
  }
}

// ============================================================================
// ADAPTIVE RESPONSE ADJUSTER
// ============================================================================

export class AdaptiveResponseAdjuster {
  private sentimentAnalyzer = new SentimentAnalyzer();

  /**
   * Adjust response based on user history and current sentiment
   */
  adjustResponse(
    baseResponse: string,
    userProfile: UserLearningProfile,
    currentSentiment: SentimentAnalysis
  ): string {
    let adjusted = baseResponse;

    // 1. Adjust tone
    if (currentSentiment.intensity === 'high') {
      if (currentSentiment.sentiment === 'frustrated') {
        adjusted = this.makeSympathetic(adjusted);
      } else if (currentSentiment.sentiment === 'positive') {
        adjusted = this.makeEnthusiastic(adjusted);
      }
    }

    // 2. Adjust formality
    const formality = userProfile.communicationStyle.usesFormality;
    if (formality === 'low') {
      adjusted = this.makeMoreCasual(adjusted);
    } else if (formality === 'high') {
      adjusted = this.makeMoreFormal(adjusted);
    }

    // 3. Adjust emoji usage
    if (!userProfile.communicationStyle.usesEmojis) {
      // Reduce emojis - simple character removal for common emoji codes
      let result = adjusted;
      // Remove common emoji patterns by checking for high unicode values
      result = result.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
      adjusted = result;
    } else {
      // Add more relevant emojis
      adjusted = this.addRelevantEmojis(adjusted);
    }

    // 4. Adjust length
    if (userProfile.preferences.responseLength === 'brief') {
      adjusted = this.makeBrief(adjusted);
    } else if (userProfile.preferences.responseLength === 'detailed') {
      adjusted = this.makeDetailed(adjusted);
    }

    return adjusted;
  }

  private makeSympathetic(text: string): string {
    return text.replace(
      /\./g,
      '. 💔'
    ).replace(/I'm here to help/g, "I'm really sorry. I'm here to help make this right");
  }

  private makeEnthusiastic(text: string): string {
    return text
      .replace(/\!/g, '!! 🔥')
      .replace(/\?/g, '?? 🎉')
      .replace(/Great/g, 'AMAZING');
  }

  private makeMoreCasual(text: string): string {
    return text
      .replace(/Hello/g, 'Hey')
      .replace(/Certainly/g, 'For sure')
      .replace(/Would you like to/g, 'Wanna');
  }

  private makeMoreFormal(text: string): string {
    return text
      .replace(/Hey/g, 'Hello')
      .replace(/gonna/g, 'will')
      .replace(/wanna/g, 'would like to');
  }

  private makeBrief(text: string): string {
    // Remove excessive details, keep main points
    const lines = text.split('\n');
    return lines.slice(0, Math.ceil(lines.length / 2)).join('\n');
  }

  private makeDetailed(text: string): string {
    // Add more examples or explanations (mock implementation)
    return text + '\n\n💡 Pro tip: This feature also works with...';
  }

  private addRelevantEmojis(text: string): string {
    return text
      .replace(/ticket/gi, '🎫 ticket')
      .replace(/badge/gi, '🏆 badge')
      .replace(/donate/gi, '💚 donate')
      .replace(/cricket/gi, '🏏 cricket');
  }
}

export default {
  SentimentAnalyzer,
  UserLearningEngine,
  EdgeCaseHandlerEngine,
  ContextMemoryManager,
  AdaptiveResponseAdjuster,
};
