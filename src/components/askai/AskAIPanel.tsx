'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import '@/styles/askai.css';
import ChatMessage from './ChatMessage';
import { useAskAI } from '@/context/AskAIContext';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Settings,
  Trash2,
  X,
  Radio,
  HelpCircle,
} from 'lucide-react';
import type {
  ChatMessage as ChatMessageType,
  AgentConfig,
  ConfirmationRequest,
  ToolAction,
} from '@/lib/askai/types';
import {
  runAgentTurn,
  executeConfirmedAction,
  chatMessagesToGeminiContents,
} from '@/lib/askai/agentController';

export default function AskAIPanel() {
  const { isPanelOpen, closePanel } = useAskAI();

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

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceReply, setVoiceReply] = useState(false);
  const [autoSendVoice, setAutoSendVoice] = useState(true);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load saved API key & preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('agentbridge_gemini_api_key');
      if (savedKey) setApiKey(savedKey);

      const savedModel = localStorage.getItem('agentbridge_gemini_model');
      if (savedModel) setModel(savedModel);

      const savedVoiceReply = localStorage.getItem('agentbridge_voice_reply');
      if (savedVoiceReply) setVoiceReply(savedVoiceReply === 'true');

      // Check SpeechRecognition support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setVoiceSupported(false);
      }
    }
  }, []);

  // Save API key to localStorage when updated
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentbridge_gemini_api_key', key);
    }
  };

  const handleModelChange = (m: string) => {
    setModel(m);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentbridge_gemini_model', m);
    }
  };

  const handleToggleVoiceReply = () => {
    const next = !voiceReply;
    setVoiceReply(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentbridge_voice_reply', String(next));
    }
  };

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) {
        closePanel();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isPanelOpen, closePanel]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (isPanelOpen && apiKey) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isPanelOpen, apiKey]);

  // Show settings on first open if no API key
  useEffect(() => {
    if (isPanelOpen && !apiKey) setShowSettings(true);
  }, [isPanelOpen, apiKey]);

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

  // Text-To-Speech function
  const speakResponse = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !voiceReply) return;
    try {
      window.speechSynthesis.cancel();
      // Strip markdown syntax for natural speech
      const clean = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/`{1,3}.*?`{1,3}/gs, '')
        .replace(/#+\s/g, '')
        .replace(/-{3,}/g, '')
        .replace(/•\s/g, '');

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors
    }
  }, [voiceReply]);

  const executeTurn = async (userPrompt: string) => {
    const text = userPrompt.trim();
    if (!text || isLoading) return;
    if (!apiKey) {
      setShowSettings(true);
      setError('Please enter your Gemini API key in settings.');
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

      // Speak response if voice reply is enabled
      if (response.message) {
        speakResponse(response.message);
      }

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

  const handleSend = () => {
    executeTurn(input);
  };

  // Voice Chat Recognition
  const toggleVoiceRecording = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      setVoiceError(null);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const transcript = final || interim;
        setInput(transcript);

        if (final) {
          setIsListening(false);
          if (autoSendVoice) {
            setTimeout(() => {
              executeTurn(final);
            }, 300);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission denied. Please allow microphone access in your browser.');
        } else if (event.error !== 'no-speech') {
          setVoiceError(`Voice recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setVoiceError(err?.message || 'Could not start voice recognition.');
      setIsListening(false);
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

      if (response.message) {
        speakResponse(response.message);
      }
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
      content: 'Action cancelled. How else may I assist you with our atelier collection?',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, cancelMsg]);
  };

  const handleClearChat = () => {
    setMessages([]);
    setPendingConfirmation(null);
    setError(null);
    setVoiceError(null);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
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

  if (!isPanelOpen) return null;

  return (
    <div className="askai-backdrop" onClick={closePanel}>
      <div
        className="askai-sidebar"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Ask AI Assistant Drawer"
      >
        {/* Header */}
        <div className="askai-header">
          <div className="askai-header-left">
            <div className="askai-header-icon">✦</div>
            <div>
              <div className="askai-header-title">
                Ask AI Assistant
                <span style={{ fontSize: '10px', background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  WebMCP
                </span>
              </div>
              <div className="askai-header-subtitle">Voice &amp; Native WebMCP Engine</div>
            </div>
          </div>

          <div className="askai-header-actions">
            {/* Voice Reply Toggle */}
            <button
              className={`askai-header-btn ${voiceReply ? 'askai-header-btn--active' : ''}`}
              onClick={handleToggleVoiceReply}
              title={voiceReply ? 'Voice replies enabled (click to mute)' : 'Voice replies muted (click to enable)'}
            >
              {voiceReply ? <Volume2 size={16} color="#d4af37" /> : <VolumeX size={16} />}
            </button>

            {/* Settings Button */}
            <button
              className={`askai-header-btn ${showSettings ? 'askai-header-btn--active' : ''}`}
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings size={16} />
            </button>

            {/* Clear Chat Button */}
            <button className="askai-header-btn" onClick={handleClearChat} title="Clear conversation">
              <Trash2 size={15} />
            </button>

            {/* Close Sidebar Button */}
            <button className="askai-header-btn" onClick={closePanel} title="Close sidebar (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Settings / API Key Drawer */}
        {showSettings && (
          <div className="askai-settings">
            <div className="askai-settings-row">
              <label>Gemini API Key</label>
              <input
                className="askai-settings-input"
                type="password"
                placeholder="Enter Gemini API key..."
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
              />
            </div>
            <div className="askai-settings-row">
              <label>Model</label>
              <input
                className="askai-settings-input"
                type="text"
                placeholder="gemini-2.0-flash"
                value={model}
                onChange={(e) => handleModelChange(e.target.value)}
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
            <div className="askai-settings-row" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ cursor: 'pointer' }} htmlFor="auto-send-voice">Auto-send voice commands</label>
              <input
                id="auto-send-voice"
                type="checkbox"
                checked={autoSendVoice}
                onChange={(e) => setAutoSendVoice(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <div className="askai-settings-hint">
              Get a free API key from{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>
                Google AI Studio
              </a>
              . Your key is stored locally in your browser and never sent to any intermediary server.
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="askai-messages">
          {messages.length === 0 && !isLoading ? (
            <div className="askai-empty">
              <div className="askai-empty-icon">✦</div>
              <div className="askai-empty-title">AgentBridge Shopping AI</div>
              <div className="askai-empty-desc">
                Ask by voice or text. I use 34 native WebMCP tools on this page to find dresses, check size charts, compare fits, and manage your cart.
              </div>
              <div className="askai-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="askai-suggestion-chip" onClick={() => handleSuggestion(s)}>
                    <span>{s}</span>
                    <span style={{ color: 'var(--brand-primary)', fontSize: '14px' }}>→</span>
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

          {/* Error message */}
          {error && <div className="askai-error">{error}</div>}
          {voiceError && <div className="askai-error">{voiceError}</div>}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Listening Active Bar */}
        {isListening && (
          <div className="askai-voice-bar">
            <div className="askai-voice-indicator">
              <div className="askai-voice-waves">
                <div className="askai-voice-wave" />
                <div className="askai-voice-wave" />
                <div className="askai-voice-wave" />
                <div className="askai-voice-wave" />
              </div>
              <span className="askai-voice-text">Listening... speak your request now</span>
            </div>
            <button className="askai-voice-stop-btn" onClick={toggleVoiceRecording}>
              Stop
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="askai-input-area">
          <textarea
            ref={inputRef}
            className="askai-input"
            placeholder={
              isListening
                ? 'Listening to your speech...'
                : apiKey
                ? 'Ask or speak (e.g. "Show red tops for women")...'
                : 'Enter Gemini API key in settings...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading || !!pendingConfirmation}
          />

          {/* Voice Microphone Command Button */}
          {voiceSupported && (
            <button
              className={`askai-mic-btn ${isListening ? 'askai-mic-btn--listening' : ''}`}
              onClick={toggleVoiceRecording}
              disabled={isLoading || !apiKey || !!pendingConfirmation}
              title={isListening ? 'Click to stop listening' : 'Speak command via voice'}
              aria-label="Voice command"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          {/* Send Button */}
          <button
            className="askai-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !apiKey || !!pendingConfirmation}
            title="Send message"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
