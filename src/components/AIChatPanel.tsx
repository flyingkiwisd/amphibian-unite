'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  User,
  AlertTriangle,
  Settings,
  X,
  MessageSquare,
  Zap,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIChatPanelProps {
  memberId: string;
  memberName: string;
  memberRole: string;
  context: Record<string, unknown>;
  suggestedPrompts?: string[];
  title?: string;
  titleIcon?: string;
  compact?: boolean;
  defaultCollapsed?: boolean;
}

interface APIResponse {
  response?: string;
  error?: string;
  message?: string;
  setup?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getStorageKey(memberId: string): string {
  return `amphibian-ai-chat-${memberId}`;
}

function loadMessages(memberId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(getStorageKey(memberId));
    if (stored) return JSON.parse(stored) as ChatMessage[];
  } catch { /* ignore */ }
  return [];
}

function saveMessages(memberId: string, messages: ChatMessage[]): void {
  try {
    localStorage.setItem(getStorageKey(memberId), JSON.stringify(messages));
  } catch { /* ignore */ }
}

// ── Simple Markdown renderer ─────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-text-primary mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-sm font-bold text-accent mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-base font-bold text-accent mt-3 mb-1">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-text-primary">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm leading-relaxed list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-sm leading-relaxed list-decimal">$1. $2</li>')
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

// ── Component ────────────────────────────────────────────────────────────────

export function AIChatPanel({
  memberId,
  memberName,
  memberRole,
  context,
  suggestedPrompts,
  title = 'Your AI Advisor',
  titleIcon = 'bot',
  compact = false,
  defaultCollapsed = false,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [error, setError] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const loaded = loadMessages(memberId);
    setMessages(loaded);
    if (loaded.length > 0) setShowSuggestions(false);
  }, [memberId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }, []);

  // Send message
  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    setInput('');
    setError(null);
    setSetupMessage(null);
    setShowSuggestions(false);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessages(memberId, updatedMessages);

    setIsLoading(true);

    try {
      // Build conversation history for API
      const conversationHistory = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Remove the last message (we send it separately)
      conversationHistory.pop();

      // Read user's personal API key from localStorage
      let userApiKey: string | null = null;
      try {
        userApiKey = localStorage.getItem(`amphibian-ai-apikey-${memberId}`);
      } catch { /* ignore */ }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          memberId,
          context: {
            name: memberName,
            role: memberRole,
            ...context,
          },
          conversationHistory,
          ...(userApiKey ? { apiKey: userApiKey } : {}),
        }),
      });

      const data: APIResponse = await res.json();

      if (data.setup) {
        setSetupMessage(data.message || 'API key not configured.');
        setIsLoading(false);
        return;
      }

      if (!res.ok || data.error) {
        setError(data.error || data.message || 'Something went wrong.');
        setIsLoading(false);
        return;
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.response || 'No response received.',
        timestamp: new Date().toISOString(),
      };

      const withResponse = [...updatedMessages, assistantMessage];
      setMessages(withResponse);
      saveMessages(memberId, withResponse);
    } catch {
      setError('Failed to reach the AI service. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, memberId, memberName, memberRole, context]);

  // Handle Enter key (Shift+Enter for newline)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setSetupMessage(null);
    setShowSuggestions(true);
    saveMessages(memberId, []);
  }, [memberId]);

  // Format timestamp
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const defaultSuggestions = [
    'What should I focus on today?',
    'What risks should I be watching?',
    'Help me reflect on this week',
    'How am I tracking against my goals?',
  ];

  const promptsToShow = suggestedPrompts || defaultSuggestions;

  const TitleIcon = titleIcon === 'sparkles' ? Sparkles : titleIcon === 'lightbulb' ? Zap : Bot;

  return (
    <div className={`bg-surface border border-border rounded-xl overflow-hidden transition-all duration-300 ${
      compact ? '' : 'animate-fade-in'
    }`}>
      {/* ── Header ── */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-2 transition-colors duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center group-hover:bg-accent/25 transition-colors">
            <TitleIcon size={16} className="text-accent" />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-text-primary">{title}</span>
            {messages.length > 0 && (
              <span className="ml-2 text-xs text-text-muted">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isCollapsed && messages.length > 0 && (
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                clearChat();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  clearChat();
                }
              }}
              className="p-1.5 rounded-md hover:bg-white/10 text-text-muted hover:text-rose-400 transition-colors"
              title="Clear chat"
            >
              <Trash2 size={14} />
            </div>
          )}
          {isCollapsed ? (
            <ChevronDown size={16} className="text-text-muted group-hover:text-accent transition-colors" />
          ) : (
            <ChevronUp size={16} className="text-text-muted group-hover:text-accent transition-colors" />
          )}
        </div>
      </button>

      {/* ── Body ── */}
      {!isCollapsed && (
        <div className="border-t border-border">
          {/* Setup message */}
          {setupMessage && (
            <div className="mx-4 mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-start gap-3">
                <Settings size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-300 mb-2">API Key Setup Required</p>
                  <p className="text-xs text-amber-200/70 whitespace-pre-wrap leading-relaxed">{setupMessage}</p>
                  <button
                    onClick={() => setSetupMessage(null)}
                    className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages area */}
          <div
            ref={chatContainerRef}
            className={`overflow-y-auto px-4 py-3 space-y-4 ${
              compact ? 'max-h-[320px] min-h-[180px]' : 'max-h-[460px] min-h-[220px]'
            }`}
          >
            {/* Empty state with suggestions */}
            {messages.length === 0 && showSuggestions && !setupMessage && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                  <MessageSquare size={20} className="text-accent" />
                </div>
                <p className="text-sm text-text-secondary mb-1">
                  Ask me anything, {memberName.split(' ')[0]}
                </p>
                <p className="text-xs text-text-muted mb-5">
                  I have your full context — priorities, KPIs, goals, and more
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {promptsToShow.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="text-left px-3 py-2.5 rounded-lg bg-surface-2 border border-border hover:border-accent/40 hover:bg-surface-3 transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles size={12} className="text-accent/60 group-hover:text-accent mt-0.5 flex-shrink-0 transition-colors" />
                        <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors leading-relaxed">
                          {prompt}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={14} className="text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-accent/15 border border-accent/30 text-text-primary'
                      : 'bg-surface-2 border border-border text-text-secondary'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div
                      className="text-sm leading-relaxed prose-sm ai-response"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p className={`text-[10px] mt-2 ${
                    msg.role === 'user' ? 'text-accent/50 text-right' : 'text-text-muted'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={14} className="text-text-secondary" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-accent" />
                </div>
                <div className="bg-surface-2 border border-border rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="text-accent animate-spin" />
                    <span className="text-xs text-text-muted">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                <AlertTriangle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-rose-300">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-[10px] text-rose-400 hover:text-rose-300 underline underline-offset-2 mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input area ── */}
          <div className="border-t border-border p-3">
            {/* Quick suggestion chips (shown after first exchange) */}
            {messages.length > 0 && messages.length < 6 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {promptsToShow.slice(0, 3).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-[10px] text-text-muted hover:text-accent hover:border-accent/30 transition-all duration-200 disabled:opacity-50"
                  >
                    <Sparkles size={9} className="text-accent/50" />
                    {prompt.length > 40 ? prompt.slice(0, 37) + '...' : prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Ask your AI advisor...`}
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all duration-200 disabled:opacity-50"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-lg bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                title="Send message (Enter)"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1.5 text-center">
              Shift+Enter for new line &middot; Powered by Claude
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
