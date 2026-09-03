'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import '@/styles/askai.css';
import ChatMessage from './ChatMessage';
import type {
  ChatMessage as ChatMessageType,
  AgentConfig,
  ConfirmationRequest,
  ToolAction,
  DEFAULT_AGENT_CONFIG,
} from '@/lib/askai/types';
import {
  runAgentTurn,
  executeConfirmedAction,
  chatMessagesToGeminiContents,
} from '@/lib/askai/agentController';

export default function AskAIPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://generativelanguage.googleapis.com/v1beta');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Thinking...');
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<ConfirmationRequest | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (isOpen && apiKey) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, apiKey]);

  // Show settings on first open if no API key
  useEffect(() => {
    if (isOpen && !apiKey) setShowSettings(true);
  }, [isOpen]);

  const getConfig = useCallback((): AgentConfig => ({
    apiKey,
    model,
    baseUrl,
  }), [apiKey, model, baseUrl]);

  const handleToolAction = useCallback((action: ToolAction) => {
    setLoadingText(
      action.status === 'executing'
        ? `Running ${action.name}...`
        : action.status === 'awaiting-confirmation'
          ? `Awaiting confirmation...`
          : 'Thinking...',
    );
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    if (!apiKey) {
      setShowSettings(true);
      setError('Please enter your Gemini API key first.');
      return;
    }

    setError(null);
    setInput('');
    setPendingConfirmation(null);

    // Add user message
    const userMsg: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setLoadingText('Thinking...');

    try {
      const history = chatMessagesToGeminiContents(messages);
      const response = await runAgentTurn(text, history, getConfig(), handleToolAction);

      const modelMsg: ChatMessageType = {
        id: `msg-${Date.now()}`,
        role: 'model',
        content: response.message,
        toolActions: response.toolActions,
        requiresConfirmation: response.requiresConfirmation,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, modelMsg]);

      if (response.requiresConfirmation) {
        setPendingConfirmation(response.requiresConfirmation);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An error occurred';
      if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('403')) {
        setError('Invalid API key. Please check your Gemini API key in settings.');
        setShowSettings(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setLoadingText('Thinking...');
    }
  };

  const handleConfirm = async (confirmation: ConfirmationRequest) => {
    setPendingConfirmation(null);
    setIsLoading(true);
    setLoadingText(`Executing ${confirmation.toolName}...`);
    setError(null);

    try {
      const history = chatMessagesToGeminiContents(messages);
      const response = await executeConfirmedAction(confirmation, history, getConfig(), handleToolAction);

      const modelMsg: ChatMessageType = {
        id: `msg-${Date.now()}`,
        role: 'model',
        content: response.message,
        toolActions: response.toolActions,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      setError(err?.message || 'Failed to execute action');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    setPendingConfirmation(null);
    const cancelMsg: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'model',
      content: 'Action cancelled. How else can I help you?',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, cancelMsg]);
  };

  const handleClearChat = () => {
    setMessages([]);
    setPendingConfirmation(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const SUGGESTIONS = [
    'Show red tops for women',
    'Find blue t-shirts for men',
    'Compare luxury tops side-by-side',
    'What size fits a 36-inch bust?',
  ];

  return (
    <>
      {/* Floating trigger button */}
      <button
        className="askai-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Ask AI' : 'Open Ask AI'}
        title="Ask AI Assistant"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="askai-panel" role="dialog" aria-label="Ask AI Assistant">
          {/* Header */}
          <div className="askai-header">
            <div className="askai-header-left">
              <div className="askai-header-icon">✦</div>
              <div>
                <div className="askai-header-title">Ask AI</div>
                <div className="askai-header-subtitle">via WebMCP Tools</div>
              </div>
            </div>
            <div className="askai-header-actions">
              <button
                className="askai-header-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                ⚙
              </button>
              <button className="askai-header-btn" onClick={handleClearChat} title="Clear chat">
                ⌫
              </button>
              <button className="askai-header-btn" onClick={() => setIsOpen(false)} title="Close">
                ✕
              </button>
            </div>
          </div>

          {/* Settings / API Key */}
          {showSettings && (
            <div className="askai-settings">
              <div className="askai-settings-row">
                <label>API Key</label>
                <input
                  className="askai-settings-input"
                  type="password"
                  placeholder="Enter Gemini API key..."
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setError(null); }}
                />
              </div>
              <div className="askai-settings-row">
                <label>Model</label>
                <input
                  className="askai-settings-input"
                  type="text"
                  placeholder="gemini-2.0-flash"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
              <div className="askai-settings-row">
                <label>Base URL</label>
                <input
                  className="askai-settings-input"
                  type="text"
                  placeholder="https://generativelanguage.googleapis.com/v1beta"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>
              <div className="askai-settings-hint">
                Get a free API key from{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)' }}>
                  Google AI Studio
                </a>
                . Your key stays in your browser — it is never sent to our server.
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="askai-messages">
            {messages.length === 0 && !isLoading ? (
              <div className="askai-empty">
                <div className="askai-empty-icon">✦</div>
                <div className="askai-empty-title">Ask AI Assistant</div>
                <div className="askai-empty-desc">
                  I use WebMCP tools to browse products, manage your cart, and more — all through the same tools an AI agent would use.
                </div>
                <div className="askai-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="askai-suggestion-chip" onClick={() => handleSuggestion(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onConfirm={msg.requiresConfirmation && pendingConfirmation ? handleConfirm : undefined}
                    onCancel={msg.requiresConfirmation && pendingConfirmation ? handleCancelConfirmation : undefined}
                  />
                ))}
              </>
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="askai-typing">
                <div className="askai-typing-dots">
                  <span className="askai-typing-dot" />
                  <span className="askai-typing-dot" />
                  <span className="askai-typing-dot" />
                </div>
                <span className="askai-typing-text">{loadingText}</span>
              </div>
            )}

            {/* Error */}
            {error && <div className="askai-error">{error}</div>}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="askai-input-area">
            <textarea
              ref={inputRef}
              className="askai-input"
              placeholder={apiKey ? 'Ask me anything...' : 'Enter API key in settings first...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading || !!pendingConfirmation}
            />
            <button
              className="askai-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !apiKey || !!pendingConfirmation}
              title="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
