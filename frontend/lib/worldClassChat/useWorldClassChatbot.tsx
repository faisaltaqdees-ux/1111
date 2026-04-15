/**
 * REACT INTEGRATION: useWorldClassChatbot Hook
 * Easy-to-use React hook for integrating the world-class chatbot
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import WorldClassChatbot, { ChatMessage, ChatResponse } from './orchestrator';
import type { UserProfile, UserJourney } from './types';

export interface UseWorldClassChatbotOptions {
  userId: string;
  userProfile?: UserProfile;
  enableLearning?: boolean;
  enableContextMemory?: boolean;
  debug?: boolean;
}

export interface ChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  chatbot: WorldClassChatbot | null;
  statistics?: any;
}

/**
 * Main React hook for the world-class chatbot
 */
export function useWorldClassChatbot(options: UseWorldClassChatbotOptions) {
  const chatbotRef = useRef<WorldClassChatbot | null>(null);
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isLoading: false,
    error: null,
    chatbot: null,
  });

  // ─────────────────────────────────────────────────────────────────────
  // Initialize chatbot on mount
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const chatbot = new WorldClassChatbot({
        userId: options.userId,
        userProfile: options.userProfile,
        enableLearning: options.enableLearning ?? true,
        enableContextMemory: options.enableContextMemory ?? true,
        debug: options.debug ?? false,
      });

      chatbotRef.current = chatbot;
      setState((prev) => ({
        ...prev,
        chatbot,
      }));

      if (options.debug) {
        console.log('✅ World-Class Chatbot initialized');
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to initialize chatbot',
      }));
    }
  }, [options.userId, options.userProfile, options.enableLearning, options.enableContextMemory, options.debug]);

  // ─────────────────────────────────────────────────────────────────────
  // Send message function
  // ─────────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!chatbotRef.current || !userInput.trim()) {
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        // Send message to chatbot
        const response = await chatbotRef.current.chat(userInput);

        // Update state with new messages
        setState((prev) => ({
          ...prev,
          isLoading: false,
          messages: [
            ...prev.messages,
            {
              id: `user_${Date.now()}`,
              sender: 'user',
              text: userInput,
              timestamp: Date.now(),
            },
            response.message,
          ],
        }));

        return response;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to send message',
        }));
      }
    },
    []
  );

  // ─────────────────────────────────────────────────────────────────────
  // Clear conversation
  // ─────────────────────────────────────────────────────────────────────
  const clearConversation = useCallback(() => {
    if (chatbotRef.current) {
      chatbotRef.current.clearConversation();
      setState((prev) => ({
        ...prev,
        messages: [],
      }));
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Get statistics
  // ─────────────────────────────────────────────────────────────────────
  const getStatistics = useCallback(() => {
    if (chatbotRef.current) {
      return chatbotRef.current.getStatistics();
    }
    return null;
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Get predictions
  // ─────────────────────────────────────────────────────────────────────
  const getPredictedNextIntents = useCallback(() => {
    if (chatbotRef.current) {
      return chatbotRef.current.predictNextIntents();
    }
    return [];
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Return hook interface
  // ─────────────────────────────────────────────────────────────────────
  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    chatbot: state.chatbot,
    sendMessage,
    clearConversation,
    getStatistics,
    getPredictedNextIntents,
  };
}

// ============================================================================
// REACT COMPONENT: WorldClassChatInterface
// ============================================================================

export interface ChatInterfaceProps {
  userId: string;
  userProfile?: UserProfile;
  onMessageSent?: (message: ChatMessage) => void;
  className?: string;
}

export function WorldClassChatInterface({
  userId,
  userProfile,
  onMessageSent,
  className = '',
}: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    getPredictedNextIntents,
  } = useWorldClassChatbot({
    userId,
    userProfile,
    enableLearning: true,
    enableContextMemory: true,
  });

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const predictedIntents = getPredictedNextIntents();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const response = await sendMessage(inputValue);
    setInputValue('');

    if (response && onMessageSent) {
      onMessageSent(response.message);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-[#2a1a3d] to-[#1a0f2e] rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className='px-6 py-4 border-b border-pink-500/20 flex justify-between items-center'>
        <div>
          <h2 className='text-lg font-bold text-white'>🤖 PSL Pulse AI</h2>
          <p className='text-xs text-pink-200/60'>World-Class Chatbot</p>
        </div>
        <button
          onClick={clearConversation}
          className='text-xs px-3 py-1 rounded bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 transition'
        >
          Clear
        </button>
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto p-6 space-y-4'>
        {messages.length === 0 && (
          <div className='flex flex-col items-center justify-center h-full text-center'>
            <div className='text-4xl mb-4'>🎭</div>
            <p className='text-pink-200 font-semibold'>Ready to help!</p>
            <p className='text-pink-300/60 text-sm mt-2'>Ask me anything about PSL Pulse</p>
            {predictedIntents.length > 0 && (
              <div className='mt-4 p-3 rounded bg-pink-500/10 border border-pink-500/20 max-w-xs'>
                <p className='text-xs text-pink-300/80 mb-2'>Suggested topics:</p>
                <div className='flex flex-wrap gap-2'>
                  {predictedIntents.slice(0, 3).map((intent) => (
                    <button
                      key={intent}
                      onClick={() => sendMessage(intent.replace(/_/g, ' '))}
                      className='text-xs px-2 py-1 rounded bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 transition'
                    >
                      {intent.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-3 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-pink-500/30 text-pink-100 rounded-br-none'
                  : 'bg-purple-500/20 text-purple-100 rounded-bl-none border border-purple-500/30'
              }`}
            >
              <p className='text-sm leading-relaxed whitespace-pre-wrap'>{msg.text}</p>
              {msg.metadata?.confidence && (
                <p className='text-xs text-pink-300/50 mt-2'>
                  Confidence: {((msg.metadata.confidence as number) * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className='flex justify-start'>
            <div className='bg-purple-500/20 rounded-lg rounded-bl-none p-3 border border-purple-500/30'>
              <div className='flex gap-2'>
                <div className='w-2 h-2 bg-purple-400 rounded-full animate-bounce'></div>
                <div className='w-2 h-2 bg-purple-400 rounded-full animate-bounce' style={{ animationDelay: '0.1s' }}></div>
                <div className='w-2 h-2 bg-purple-400 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className='flex justify-center'>
            <div className='bg-red-500/20 text-red-200 text-sm p-3 rounded border border-red-500/30'>
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className='border-t border-pink-500/20 p-4'>
        <form onSubmit={handleSendMessage} className='flex gap-2'>
          <input
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder='Ask me anything...'
            disabled={isLoading}
            className='flex-1 px-4 py-2 rounded-lg bg-purple-500/10 border border-pink-500/30 text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-500/60 transition disabled:opacity-50'
          />
          <button
            type='submit'
            disabled={isLoading || !inputValue.trim()}
            className='px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold transition disabled:opacity-50'
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default useWorldClassChatbot;
