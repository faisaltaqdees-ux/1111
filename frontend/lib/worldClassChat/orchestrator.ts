/**
 * WORLD-CLASS AI CHATBOT ORCHESTRATOR
 * The unified system that brings all 3 parts together
 * Main entry point for the complete, enterprise-grade chatbot
 * 
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ ORCHESTRATOR (THIS FILE)                                    │
 * │ - Coordinates all 3 components                              │
 * │ - Manages conversation flow                                 │
 * │ - Handles user sessions                                     │
 * └──────────────────┬──────────────────────────────────────────┘
 *                    │
 *    ┌───────────────┼───────────────┐
 *    │               │               │
 *    ▼               ▼               ▼
 * ┌──────────┐  ┌────────────┐  ┌──────────────┐
 * │ PART 1   │  │ PART 2     │  │ PART 3       │
 * │ INTENT   │  │ RESPONSE   │  │ ADVANCED NLP │
 * │ ENGINE   │  │ GENERATOR  │  │ & LEARNING   │
 * │ (100+)   │  │ (Adaptive) │  │ (Adaptive)   │
 * └──────────┘  └────────────┘  └──────────────┘
 */

import IntentEngine from './intentEngine';
import { ResponseGenerator, ResponseOptions } from './responseGenerator';
import UNIFIED_MASTER from './UNIFIED_MASTER';
import {
  SentimentAnalyzer,
  UserLearningEngine,
  EdgeCaseHandlerEngine,
  ContextMemoryManager,
  AdaptiveResponseAdjuster,
} from './advancedNLP';
import type {
  ConversationContext,
  UserProfile,
  UserJourney,
  IntentResult,
} from './types';

export interface ChatbotConfig {
  userId: string;
  userProfile?: UserProfile;
  debug?: boolean;
  enableLearning?: boolean;
  enableContextMemory?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  intent?: string;
  sentiment?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ChatResponse {
  message: ChatMessage;
  actionButtons?: Array<{ label: string; action: string }>;
  followUpQuestions?: string[];
  confidence?: number;
}

// ============================================================================
// WORLD-CLASS CHATBOT SYSTEM
// ============================================================================

export class WorldClassChatbot {
  // ─────────────────────────────────────────────────────────────────────
  // Core Components (The 3 Parts)
  // ─────────────────────────────────────────────────────────────────────
  private intentEngine: IntentEngine;
  private responseGenerator: ResponseGenerator;
  private sentimentAnalyzer: SentimentAnalyzer;
  private userLearningEngine: UserLearningEngine;
  private edgeCaseHandler: EdgeCaseHandlerEngine;
  private contextMemory: ContextMemoryManager;
  private adaptiveAdjuster: AdaptiveResponseAdjuster;

  // ─────────────────────────────────────────────────────────────────────
  // Configuration
  // ─────────────────────────────────────────────────────────────────────
  private config: ChatbotConfig;
  private sessionHistory: ChatMessage[] = [];
  private messageCounter = 0;

  /**
   * Initialize the World-Class Chatbot
   */
  constructor(config: ChatbotConfig) {
    this.config = config;

    // Initialize all components
    this.intentEngine = new IntentEngine();
    this.responseGenerator = new ResponseGenerator();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.userLearningEngine = new UserLearningEngine();
    this.edgeCaseHandler = new EdgeCaseHandlerEngine();
    this.contextMemory = new ContextMemoryManager();
    this.adaptiveAdjuster = new AdaptiveResponseAdjuster();

    if (this.config.debug) {
      console.log('🤖 World-Class Chatbot initialized with full capability');
    }
  }

  /**
   * Main method: Process user message and generate response
   * This is the heart of the chatbot
   */
  async chat(userInput: string): Promise<ChatResponse> {
    const startTime = Date.now();
    const messageId = `msg_${this.messageCounter++}`;
    
    console.warn(`\n🎯 [ORCHESTRATOR] chat() called with: "${userInput}"`);

    try {
      // ─────────────────────────────────────────────────────────────────
      // STEP 1: EDGE CASE DETECTION (Catch malformed input early)
      // ─────────────────────────────────────────────────────────────────
      console.warn(`[ORCHESTRATOR] STEP 1: Edge case detection...`);
      const edgeCaseResponse = this.edgeCaseHandler.handleEdgeCase(
        userInput,
        this.buildContextFromHistory()
      );

      if (edgeCaseResponse) {
        console.warn(`[ORCHESTRATOR] Edge case detected! Returning early with: "${edgeCaseResponse.substring(0, 50)}..."`);
        const message: ChatMessage = {
          id: messageId,
          sender: 'ai',
          text: edgeCaseResponse,
          timestamp: Date.now(),
          metadata: { responseTime: Date.now() - startTime, isEdgeCase: true },
        };

        this.sessionHistory.push({ id: messageId, sender: 'user', text: userInput, timestamp: Date.now() });
        this.sessionHistory.push(message);

        return {
          message,
          confidence: 0.85,
        };
      }

      // ─────────────────────────────────────────────────────────────────
      // STEP 2: SENTIMENT ANALYSIS (Understand user emotion)
      // ─────────────────────────────────────────────────────────────────
      console.warn(`[ORCHESTRATOR] STEP 2: Analyzing sentiment...`);
      const sentiment = this.sentimentAnalyzer.analyzeSentiment(userInput);
      const detectTypos = this.sentimentAnalyzer.detectTypos(userInput);

      console.warn(`[ORCHESTRATOR] Sentiment detected: ${sentiment.sentiment} (score: ${sentiment.score})`);

      // ─────────────────────────────────────────────────────────────────
      // STEP 3: INTENT RECOGNITION (Understand what user wants)
      // ─────────────────────────────────────────────────────────────────
      console.warn(`[ORCHESTRATOR] STEP 3: Recognizing intent...`);
      const context = this.buildContextFromHistory();
      const userJourney = this.buildUserJourney();

      const intentResult = this.intentEngine.analyze(
        userInput,
        context,
        userJourney
      );
      
      console.warn(`[ORCHESTRATOR] Intent analysis complete. Before sentiment check: "${intentResult.intent}" (${(intentResult.confidence * 100).toFixed(1)}%)`);

      // Check if sentiment overrides intent
      const sentimentIntent = this.sentimentAnalyzer.detectIntentFromSentiment(
        sentiment
      );
      if (
        sentimentIntent &&
        sentiment.intensity === 'high' &&
        intentResult.confidence < 0.7
      ) {
        // Use sentiment-detected intent if main intent confidence is low
        console.warn(`[ORCHESTRATOR] Sentiment override active! Changing intent from "${intentResult.intent}" to "${sentimentIntent}"`);
        intentResult.intent = sentimentIntent;
        intentResult.confidence = Math.min(intentResult.confidence + 0.1, 0.95);
      }

      console.warn(`[ORCHESTRATOR] Final intent: "${intentResult.intent}" (${(intentResult.confidence * 100).toFixed(1)}%)`);

      // ─────────────────────────────────────────────────────────────────
      // STEP 4: CONTEXT & MEMORY MANAGEMENT (Remember conversation)
      // ─────────────────────────────────────────────────────────────────
      console.warn(`[ORCHESTRATOR] STEP 4: Managing context memory...`);
      if (this.config.enableContextMemory) {
        this.contextMemory.addToMemory(this.config.userId, {
          userId: this.config.userId,
          message: userInput,
          role: 'user',
          timestamp: Date.now(),
          lastIntent: intentResult.intent,
          sentiment: sentiment.sentiment,
          userInput: userInput,
        });
      }

      // ─────────────────────────────────────────────────────────────────
      // STEP 4.5: KNOWLEDGE SEARCH (PSL Pulse domain only)
      // ─────────────────────────────────────────────────────────────────
      console.warn(`[ORCHESTRATOR] STEP 4.5: Searching PSL Pulse knowledge...`);
      let knowledgeContent = '';
      const isPSLRelated = this.isPSLPulseIntent(intentResult.intent);
      
      if (isPSLRelated) {
        try {
          const knowledgeResult = await UNIFIED_MASTER.processQuery(userInput, this.config.userId);
          if (knowledgeResult?.success && knowledgeResult?.response?.response) {
            knowledgeContent = String(knowledgeResult.response.response);
            console.warn(`[ORCHESTRATOR] PSL knowledge found! Length: ${knowledgeContent.length}`);
          }
        } catch (error) {
          console.warn(`[ORCHESTRATOR] Knowledge search error:`, error);
        }
      } else {
        console.warn(`[ORCHESTRATOR] Non-PSL query detected - skipping knowledge search`);
      }

      // ─────────────────────────────────────────────────────────────────
      // STEP 5: USER LEARNING & PROFILING
      // ─────────────────────────────────────────────────────────────────
      if (this.config.enableLearning) {
        const userProfile = this.userLearningEngine.getOrCreateProfile(
          this.config.userId
        );

        this.userLearningEngine.recordInteraction(this.config.userId, {
          timestamp: Date.now(),
          userInput: userInput,
          detectedIntent: intentResult.intent,
          responseGenerated: '', // Will be filled after generation
        });
      }

      // ─────────────────────────────────────────────────────────────────
      // STEP 6: RESPONSE GENERATION (Create smart response)
      // ─────────────────────────────────────────────────────────────────
      console.warn(`[ORCHESTRATOR] STEP 6: Generating response for intent "${intentResult.intent}"...`);
      const responseOptions: ResponseOptions = {
        userProfile: this.config.userProfile,
        conversationHistory: this.sessionHistory.map((msg) => ({
          timestamp: msg.timestamp,
          message: msg.text,
          role: msg.sender,
        })),
        sentiment: sentiment.sentiment,
        language: this.config.userProfile?.preferences?.language || 'en',
        knowledgeContent: knowledgeContent,
      };

      const generatedResponse = await this.responseGenerator.generateResponse(
        intentResult,
        responseOptions
      );
      
      console.warn(`[ORCHESTRATOR] Response generated: "${generatedResponse.text.substring(0, 50)}..."`);

      // ─────────────────────────────────────────────────────────────────
      // STEP 7: ADAPTIVE ADJUSTMENT (Personalization)
      // ─────────────────────────────────────────────────────────────────
      console.warn(`[ORCHESTRATOR] STEP 7: Applying adaptive adjustment...`);
      let finalResponseText = generatedResponse.text;

      if (
        this.config.enableLearning &&
        this.config.userProfile
      ) {
        const userProfile = this.userLearningEngine.getOrCreateProfile(
          this.config.userId
        );
        finalResponseText = this.adaptiveAdjuster.adjustResponse(
          generatedResponse.text,
          userProfile,
          sentiment
        );
      }

      // ─────────────────────────────────────────────────────────────────
      // STEP 8: QUALITY ASSURANCE & LOGGING
      // ─────────────────────────────────────────────────────────────────
      const responseTime = Date.now() - startTime;
      const isHighConfidence = intentResult.confidence > 0.80;
      const isQuickResponse = responseTime < 200;

      if (this.config.debug) {
        console.log(
          `✅ Response generated in ${responseTime}ms (Confidence: ${(intentResult.confidence * 100).toFixed(1)}%)`
        );
      }

      // ─────────────────────────────────────────────────────────────────
      // STEP 9: BUILD RESPONSE OBJECT
      // ─────────────────────────────────────────────────────────────────
      const responseMessage: ChatMessage = {
        id: messageId,
        sender: 'ai',
        text: finalResponseText,
        intent: intentResult.intent,
        sentiment: sentiment.sentiment,
        timestamp: Date.now(),
        metadata: {
          responseTime,
          confidence: intentResult.confidence,
          sentimentIntensity: sentiment.intensity,
          isHighConfidence,
          isQuickResponse,
          hasTypos: detectTypos.length > 0,
        },
      };

      // Store in session history
      this.sessionHistory.push({
        id: messageId,
        sender: 'user',
        text: userInput,
        timestamp: Date.now(),
      });
      this.sessionHistory.push(responseMessage);

      // Keep session history manageable
      if (this.sessionHistory.length > 200) {
        this.sessionHistory = this.sessionHistory.slice(-200);
      }

      // ─────────────────────────────────────────────────────────────────
      // STEP 10: RETURN COMPLETE RESPONSE
      // ─────────────────────────────────────────────────────────────────
      console.warn(`[ORCHESTRATOR] STEP 10: Returning complete response!`);
      console.warn(`[ORCHESTRATOR] ✅ FINAL: Intent="${intentResult.intent}", Text="${responseMessage.text.substring(0, 50)}..."`);
      
      return {
        message: responseMessage,
        actionButtons: generatedResponse.actionButtons,
        followUpQuestions: generatedResponse.followUpQuestions,
        confidence: intentResult.confidence,
      };
    } catch (error) {
      console.error('❌ [ORCHESTRATOR] Chatbot error:', error);

      // Fallback emergency response
      return {
        message: {
          id: messageId,
          sender: 'ai',
          text: "Oops! Something went wrong. Please try again or contact support at support@pslpulse.com 🆘",
          timestamp: Date.now(),
          metadata: { error: true },
        },
        confidence: 0,
      };
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return this.sessionHistory;
  }

  /**
   * Clear conversation
   */
  clearConversation(): void {
    this.sessionHistory = [];
    this.contextMemory.clearMemory(this.config.userId);
  }

  /**
   * Get user profile from learning engine
   */
  getUserProfile() {
    if (!this.config.enableLearning) return null;
    return this.userLearningEngine.getOrCreateProfile(this.config.userId);
  }

  /**
   * Get predicted next intents
   */
  predictNextIntents(): string[] {
    if (!this.config.enableLearning) return [];
    return this.userLearningEngine.predictNextIntent(this.config.userId);
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(): string {
    return this.contextMemory.getSummary(this.config.userId);
  }

  /**
   * Build context from session history
   */
  private buildContextFromHistory(): ConversationContext {
    const lastMessage = this.sessionHistory[this.sessionHistory.length - 1];

    return {
      userId: this.config.userId,
      timestamp: Date.now(),
      lastIntent: lastMessage ? (lastMessage as any).intent : undefined,
    };
  }

  /**
   * Build user journey for contextual understanding
   */
  private buildUserJourney(): UserJourney {
    const intentCounts: Record<string, number> = {};

    for (const msg of this.sessionHistory) {
      if (msg.sender === 'ai' && (msg as any).intent) {
        const intent = (msg as any).intent;
        intentCounts[intent] = (intentCounts[intent] || 0) + 1;
      }
    }

    const topIntent = Object.entries(intentCounts).sort(([, a], [, b]) =>
      b - a
    )[0]?.[0];

    return {
      userId: this.config.userId,
      currentCategory: topIntent?.split('_')[0],
      visitedFeatures: Object.keys(intentCounts),
      totalInteractions: this.sessionHistory.length,
      averageSessionLength: this.sessionHistory.length * 5, // Approximate
      lastActiveTime: Date.now(),
      conversionStage: this.sessionHistory.length > 20 ? 'retention' : 'discovery',
    };
  }

  /**
   * Get chatbot statistics
   */
  getStatistics() {
    const profile = this.getUserProfile();
    const intentCounts: Record<string, number> = {};

    for (const msg of this.sessionHistory) {
      if (msg.sender === 'ai' && (msg as any).intent) {
        const intent = (msg as any).intent;
        intentCounts[intent] = (intentCounts[intent] || 0) + 1;
      }
    }

    return {
      totalMessages: this.sessionHistory.length,
      userMessages: this.sessionHistory.filter((m) => m.sender === 'user').length,
      botMessages: this.sessionHistory.filter((m) => m.sender === 'ai').length,
      intents: intentCounts,
      averageConfidence:
        this.sessionHistory.reduce((sum, msg) => {
          return sum + ((msg.metadata?.confidence as number) || 0);
        }, 0) / this.sessionHistory.length,
      userProfile: profile ? {
        responseLength: profile.preferences.responseLength,
        tonePreference: profile.preferences.tonePreference,
        frequentTopics: profile.preferences.frequentTopics,
      } : null,
    };
  }

  /**
   * Enable training mode (for testing new patterns)
   */
  enableTrainingMode(enabled: boolean): void {
    this.config.enableLearning = enabled;
    this.config.enableContextMemory = enabled;
    console.log(`📚 Training mode: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Check if intent is PSL Pulse related (not generic)
   */
  private isPSLPulseIntent(intent: string): boolean {
    const pslIntents = new Set([
      // Cricket
      'cricket_score_check', 'cricket_schedule', 'cricket_stats', 'cricket_teams',
      'cricket_rules', 'cricket_highlights', 'cricket_predictions', 'cricket_academy',
      'cricket_injuries', 'cricket_commentary',
      // Tickets
      'ticket_buy', 'ticket_verify', 'ticket_transfer', 'ticket_resale', 'ticket_view',
      'seating_info', 'ticket_status',
      // Badges
      'badge_earn', 'badge_progress', 'badge_view', 'badge_leaderboard',
      // Donations
      'donation_make', 'donation_impact', 'donation_history',
      // Wallet
      'wallet_connect', 'wallet_send', 'wallet_receive', 'payment_method', 'wallet_balance',
      // General app
      'app_info', 'app_help', 'general_help', 'user_profile',
    ]);

    return pslIntents.has(intent);
  }
}

// ============================================================================
// EXPORT THE COMPLETE SYSTEM
// ============================================================================

export default WorldClassChatbot;

// Also export all the sub-components for direct use if needed
export {
  IntentEngine,
  ResponseGenerator,
  SentimentAnalyzer,
  UserLearningEngine,
  EdgeCaseHandlerEngine,
  ContextMemoryManager,
  AdaptiveResponseAdjuster,
};
