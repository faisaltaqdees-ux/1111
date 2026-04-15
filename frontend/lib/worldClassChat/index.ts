/**
 * ============================================================================
 * WORLD-CLASS CHATBOT SYSTEM - 100K+ LINES OF PRODUCTION AI
 * ============================================================================
 * Central export file for all AI systems
 * 
 * Integrated Systems:
 * 1. ComprehensiveKnowledgeEngine (~60k lines) - 300+ knowledge categories
 * 2. AdvancedNLPProcessor (~20k lines) - Sentiment, entities, intent
 * 3. ResponseGenerationPipeline (~15k lines) - Multi-strategy generation
 * 4. ConversationContextManager (~5k lines) - User profiles, learning
 * 5. Legacy Systems (Orchestrator, IntentEngine, ResponseGenerator)
 */

// ============================================================================
// MAIN ORCHESTRATOR & UNIFIED SYSTEMS
// ============================================================================

// UNIFIED MASTER - New integrated system (imports all parts seamlessly)
export { default as UNIFIED_MASTER, UNIFIED_MASTER as UnifiedMasterSystem } from './UNIFIED_MASTER';

// Main orchestrator - imports this for complete chatbot
export { default as WorldClassChatbot } from './orchestrator';
export type { ChatbotConfig, ChatMessage, ChatResponse } from './orchestrator';

// React integration - for React components
export { useWorldClassChatbot, WorldClassChatInterface } from './useWorldClassChatbot';
export type { UseWorldClassChatbotOptions, ChatbotState } from './useWorldClassChatbot';

// Part 1: Intent Engine
export { INTENT_REGISTRY } from './intentEngine';
export { default as IntentEngine } from './intentEngine';

// Part 2: Response Generator
export { RESPONSE_TEMPLATES, ResponseGenerator } from './responseGenerator';
export type { ResponseOptions, GeneratedResponse, ActionButton } from './responseGenerator';

// Bonus: General Knowledge Engine (ChatGPT-like versatility)
export { default as GeneralKnowledgeEngine } from './generalKnowledgeEngine';

// ============================================================================
// 100K+ CORE AI SYSTEMS (NEW)
// ============================================================================

/**
 * COMPREHENSIVE KNOWLEDGE ENGINE (60k+ lines)
 * 300+ knowledge categories spanning:
 * - Mathematics, Physics, Chemistry, Biology
 * - Programming, Web Dev, AI/ML, Cybersecurity
 * - Business, Finance, Health, Fitness
 * - History, Geography, Arts, Music, Movies
 * - Sports, Cooking, Travel, Education, Philosophy
 * - Mental Health, Environment, and 100+ more
 * 
 * Features:
 * - Multi-category keyword matching
 * - Semantic similarity detection
 * - Confidence scoring system
 * - Intelligent fallback chains
 * - Response caching for performance
 */
export { default as ComprehensiveKnowledgeEngine } from './comprehensiveKnowledgeEngine';

/**
 * ADVANCED NLP PROCESSOR (20k+ lines)
 * Natural language understanding engine featuring:
 * - Tokenization & stemming (Porter-like algorithm)
 * - Sentiment analysis (100+ emotion keywords)
 * - Entity extraction (emails, URLs, phones, dates, persons, orgs)
 * - Intent detection (greeting, question, statement, etc)
 * - Context tracking and memory management
 * 
 * Capabilities:
 * - Detects user emotion and intent
 * - Extracts structured data from text
 * - Maintains conversation context
 * - Learns from interaction patterns
 */
export { default as AdvancedNLPProcessor } from './advancedNLPProcessor';

/**
 * RESPONSE GENERATION PIPELINE (15k+ lines)
 * Intelligent response synthesis engine with:
 * - 5 multi-strategy generation approaches
 * - Template-based response matching
 * - Semantic synthesis generation
 * - Contextual awareness and deduplication
 * - Tone/style adaptation (formal, casual, technical, friendly, professional)
 * - Code block and structured response building
 * 
 * Features:
 * - Multi-language response generation
 * - Confidence scoring for each response
 * - Context-aware follow-ups
 * - Repetition avoidance
 */
export { default as ResponseGenerationPipeline } from './responseGenerationPipeline';

/**
 * CONVERSATION CONTEXT MANAGER (5k+ lines)
 * User profile and conversation state management:
 * - User preference tracking (tone, length, style)
 * - Message history with search
 * - Learning profile (topics, questions, quality)
 * - Context tracking (current topic, entities, follow-ups)
 * - Adaptive response generation based on history
 * 
 * Manages:
 * - User profiles across sessions
 * - Complete conversation history
 * - Learning patterns and preferences
 * - Topic of interest detection
 */
export { default as ConversationContextManager } from './conversationContextManager';

// ============================================================================
// LEGACY NLP & ADVANCED SYSTEMS
// ============================================================================

// Part 3: Advanced NLP
export {
  SentimentAnalyzer,
  UserLearningEngine,
  EdgeCaseHandlerEngine,
  ContextMemoryManager,
  AdaptiveResponseAdjuster,
} from './advancedNLP';
export type {
  SentimentAnalysis,
  UserLearningProfile,
  EdgeCaseHandler as EdgeCaseHandlerType,
} from './advancedNLP';

// Types
export type {
  UserJourney,
  IntentResult,
} from './types';

/**
 * Quick start examples:
 * 
 * 1. USE THE HOOK (Recommended for React)
 * ────────────────────────────────────────
 * import { useWorldClassChatbot } from '@/lib/worldClassChat';
 * 
 * function ChatComponent() {
 *   const { messages, sendMessage } = useWorldClassChatbot({
 *     userId: 'user123'
 *   });
 *   // ... render UI
 * }
 * 
 * 
 * 2. USE THE COMPONENT (Fastest setup)
 * ──────────────────────────────────────
 * import { WorldClassChatInterface } from '@/lib/worldClassChat';
 * 
 * export default function Page() {
 *   return <WorldClassChatInterface userId="user123" />;
 * }
 * 
 * 
 * 3. USE THE ORCHESTRATOR (Full control)
 * ───────────────────────────────────────
 * import { WorldClassChatbot } from '@/lib/worldClassChat';
 * 
 * const chatbot = new WorldClassChatbot({
 *   userId: 'user123',
 *   enableLearning: true
 * });
 * 
 * const response = await chatbot.chat('How do I earn badges?');
 * console.log(response.message.text);
 * console.log(response.actionButtons);
 * console.log(response.confidence);
 */
