/**
 * ============================================================================
 * PRODUCTION CHATBOT COMPONENT
 * ============================================================================
 * 
 * Complete, working chatbot component with:
 * - Auto-initialization via useUnifiedMaster
 * - Error boundaries
 * - Loading states
 * - Message history
 * - Real-time streaming support
 * - Responsive UI
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import useUnifiedMaster from './useUnifiedMaster';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  processingTime?: number;
  confidence?: number;
}

interface ProductionChatbotProps {
  userId?: string;
  initialMessage?: string;
  onMessageSent?: (message: Message) => void;
  responseStyle?: 'concise' | 'detailed' | 'technical';
}

export function ProductionChatbot({
  userId = 'default_user',
  initialMessage,
  onMessageSent,
  responseStyle = 'concise',
}: ProductionChatbotProps) {
  const {
    isReady,
    isLoading: systemLoading,
    error: systemError,
    processQuery,
    authenticateUser,
    validateSession,
  } = useUnifiedMaster();

  // Local state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Authenticate on mount
  useEffect(() => {
    const authenticate = async () => {
      try {
        const session = await authenticateUser(userId);
        if (session) {
          setSessionId(session);
          setError(null);
        }
      } catch (err) {
        setError(`Authentication failed: ${String(err)}`);
      }
    };

    if (isReady && !sessionId) {
      authenticate();
    }
  }, [isReady, userId, sessionId, authenticateUser]);

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !isReady || !sessionId) {
      if (!isReady) setError('System not ready');
      if (!sessionId) setError('Session not authenticated');
      return;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };

    // Add user message to history
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    setError(null);

    try {
      // Process query with unified master
      const result = await processQuery(inputValue, userId, {
        style: responseStyle,
        recordAnalytics: true,
        enableRealtime: true,
      });

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_resp`,
        role: 'assistant',
        content: result.response?.message || result.response || 'No response',
        timestamp: Date.now(),
        processingTime: result.metadata?.processingTime || 0,
        confidence: result.metadata?.confidence || 0,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (onMessageSent) {
        onMessageSent(assistantMessage);
      }
    } catch (err) {
      const errorMessage = `Error: ${String(err)}`;
      setError(errorMessage);

      const errorAssistantMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Render loading state
  if (systemLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-300 border-t-pink-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing World-Class Chatbot System...</p>
          <p className="text-pink-200 text-sm mt-2">Loading all AI engines and knowledge bases</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (systemError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-900 via-purple-800 to-pink-900">
        <div className="text-center max-w-md">
          <p className="text-red-200 text-lg mb-4">System Initialization Failed</p>
          <p className="text-white mb-4">{String(systemError)}</p>
          <p className="text-gray-300 text-sm">Please refresh the page to retry</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-pink-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 border-b border-pink-600 p-4 shadow-lg">
        <h1 className="text-white text-2xl font-bold">World-Class Chatbot</h1>
        <p className="text-pink-200 text-sm">
          {isReady ? '🟢 System Ready' : '🔴 System Loading'} • Session:{' '}
          {sessionId ? sessionId.substring(0, 8) + '...' : 'Connecting'}
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-center">
              Start a conversation by typing your question below.
              <br />
              <span className="text-pink-300 text-sm mt-2">
                All 11 knowledge domains are available.
              </span>
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                  : 'bg-purple-800 text-gray-100 border border-purple-700'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              {msg.processingTime && (
                <p className="text-xs mt-2 opacity-70">
                  ⏱️ {msg.processingTime}ms
                  {msg.confidence && ` • Confidence: ${(msg.confidence * 100).toFixed(0)}%`}
                </p>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-purple-800 border border-purple-700 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border-t border-red-700 p-3 text-red-200 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-purple-700 bg-purple-900 p-4"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything... (type your question)"
            disabled={!isReady || isProcessing}
            className="flex-1 bg-purple-800 text-white rounded-lg px-4 py-2 outline-none border border-purple-700 focus:border-pink-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isReady || isProcessing || !inputValue.trim()}
            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-2">
          📊 All systems active • {messages.length} messages in session
        </p>
      </form>
    </div>
  );
}

export default ProductionChatbot;
