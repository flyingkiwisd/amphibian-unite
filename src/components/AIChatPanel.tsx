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
  X,
  MessageSquare,
  Zap,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  ShieldCheck,
  ArrowRight,
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

function getApiKeyStorageKey(memberId: string): string {
  return `amphibian-ai-apikey-${memberId}`;
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

function hasApiKey(memberId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = localStorage.getItem(getApiKeyStorageKey(memberId));
    return !!key && key.trim().length > 0;
  } catch { return false; }
}

function getApiKey(memberId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(getApiKeyStorageKey(memberId));
  } catch { return null; }
}

function saveApiKey(memberId: string, key: string): void {
  try {
    localStorage.setItem(getApiKeyStorageKey(memberId), key.trim());
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

// ── Onboarding Setup Card ────────────────────────────────────────────────────

function SetupCard({
  memberName,
  onComplete,
  memberId,
}: {
  memberName: string;
  onComplete: () => void;
  memberId: string;
}) {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the input after a brief delay
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const isValidKey = (k: string) => {
    const trimmed = k.trim();
    return trimmed.startsWith('sk-ant-') && trimmed.length > 20;
  };

  const handleSave = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setValidationError('Please paste your API key');
      return;
    }
    if (!isValidKey(trimmed)) {
      setValidationError('This doesn\'t look like a valid Anthropic API key. It should start with sk-ant-');
      return;
    }
    setValidationError(null);
    setSaving(true);

    // Small delay for visual feedback
    await new Promise((r) => setTimeout(r, 600));

    saveApiKey(memberId, trimmed);
    setSaved(true);

    // Transition to chat after showing success
    setTimeout(() => onComplete(), 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const firstName = memberName.split(' ')[0];

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mb-4 animate-pulse">
          <Check size={28} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-1">You&apos;re all set!</h3>
        <p className="text-sm text-text-secondary">Loading your AI advisor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6 px-4 sm:px-8 animate-fade-in">
      {/* Hero icon */}
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 border border-accent/30 flex items-center justify-center">
          <Sparkles size={28} className="text-accent" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface border-2 border-accent/40 flex items-center justify-center">
          <Key size={11} className="text-accent" />
        </div>
      </div>

      {/* Welcome text */}
      <h3 className="text-base font-bold text-text-primary mb-1.5 text-center">
        Welcome, {firstName}
      </h3>
      <p className="text-sm text-text-secondary text-center max-w-sm mb-6 leading-relaxed">
        Your AI advisor needs a Claude API key to get started.
        It takes 30 seconds — then you&apos;ll have a personal strategist
        who knows your role, KPIs, and goals.
      </p>

      {/* Step-by-step */}
      <div className="w-full max-w-md space-y-3 mb-6">
        {/* Step 1 */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[11px] font-bold text-accent">1</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-primary font-medium">Get your API key</p>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors mt-0.5 group"
            >
              console.anthropic.com/settings/keys
              <ExternalLink size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[11px] font-bold text-accent">2</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-primary font-medium">Paste it below</p>
            <p className="text-xs text-text-muted mt-0.5">Your key stays on your device, never sent to our servers</p>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <Key size={15} />
          </div>
          <input
            ref={inputRef}
            type={showKey ? 'text' : 'password'}
            value={keyInput}
            onChange={(e) => {
              setKeyInput(e.target.value);
              setValidationError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="sk-ant-api03-..."
            className={`w-full bg-surface-2 border rounded-xl pl-9 pr-10 py-3 text-sm text-text-primary placeholder-text-muted/50 focus:outline-none transition-all duration-200 font-mono ${
              validationError
                ? 'border-rose-500/50 focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/25'
                : 'border-border focus:border-accent/50 focus:ring-1 focus:ring-accent/25'
            }`}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            title={showKey ? 'Hide key' : 'Show key'}
            type="button"
          >
            {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Validation error */}
        {validationError && (
          <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
            <AlertTriangle size={11} />
            {validationError}
          </p>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !keyInput.trim()}
          className="w-full mt-3 py-3 rounded-xl bg-accent text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-accent/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              Activate AI Advisor
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Privacy note */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <ShieldCheck size={12} className="text-emerald-400" />
          <p className="text-[10px] text-text-muted">
            Stored locally on your browser. Never shared.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Inline Setup Recovery (when API returns setup: true) ─────────────────────

function InlineSetupRecovery({
  memberId,
  onComplete,
}: {
  memberId: string;
  onComplete: () => void;
}) {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  const handleSave = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('sk-ant-') || trimmed.length < 20) {
      setError('Key should start with sk-ant- and be longer');
      return;
    }
    setError(null);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    saveApiKey(memberId, trimmed);
    setSaving(false);
    onComplete();
  };

  return (
    <div className="mx-4 mt-3 p-4 rounded-xl bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/25">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
          <Key size={15} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary mb-0.5">Connect your API key</p>
          <p className="text-xs text-text-muted mb-3">
            Paste your Claude API key to start chatting.{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Get one here →
            </a>
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => { setKeyInput(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="sk-ant-api03-..."
                className="w-full bg-surface-2 border border-border rounded-lg pl-3 pr-8 py-2 text-xs text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all font-mono"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                type="button"
              >
                {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !keyInput.trim()}
              className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          {error && (
            <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertTriangle size={10} />
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
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
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showSetupRecovery, setShowSetupRecovery] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check API key status on mount
  useEffect(() => {
    const keyExists = hasApiKey(memberId);
    setNeedsSetup(!keyExists);
    setIsReady(keyExists);
  }, [memberId]);

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

  // Handle setup completion
  const handleSetupComplete = useCallback(() => {
    setNeedsSetup(false);
    setShowSetupRecovery(false);
    setIsReady(true);
    setShowSuggestions(true);
  }, []);

  // Send message
  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    setInput('');
    setError(null);
    setShowSetupRecovery(false);
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
      const userApiKey = getApiKey(memberId);

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
        // API key missing or invalid — show inline recovery
        setShowSetupRecovery(true);
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
    setShowSetupRecovery(false);
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

  // Header status indicator
  const headerStatus = needsSetup
    ? { label: 'Setup needed', color: 'text-amber-400' }
    : isReady
      ? { label: 'Ready', color: 'text-emerald-400' }
      : null;

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
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">{title}</span>
              {headerStatus && !isCollapsed && (
                <span className={`flex items-center gap-1 text-[10px] ${headerStatus.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    needsSetup ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  {headerStatus.label}
                </span>
              )}
            </div>
            {messages.length > 0 && (
              <span className="text-xs text-text-muted">
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
          {/* ── Setup Flow (first-time onboarding) ── */}
          {needsSetup && (
            <SetupCard
              memberName={memberName}
              memberId={memberId}
              onComplete={handleSetupComplete}
            />
          )}

          {/* ── Ready State (chat active) ── */}
          {!needsSetup && (
            <>
              {/* Inline setup recovery (when API returns setup error) */}
              {showSetupRecovery && (
                <InlineSetupRecovery
                  memberId={memberId}
                  onComplete={handleSetupComplete}
                />
              )}

              {/* Messages area */}
              <div
                ref={chatContainerRef}
                className={`overflow-y-auto px-4 py-3 space-y-4 ${
                  compact ? 'max-h-[320px] min-h-[180px]' : 'max-h-[460px] min-h-[220px]'
                }`}
              >
                {/* Empty state with suggestions */}
                {messages.length === 0 && showSuggestions && !showSetupRecovery && (
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
