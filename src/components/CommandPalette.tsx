'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Users,
  Bot,
  Target,
  LayoutDashboard,
  CheckSquare,
  Map,
  Scale,
  TrendingUp,
  ArrowRight,
  Command,
  Compass,
  DollarSign,
  Trophy,
  StickyNote,
  BookOpen,
  Settings,
} from 'lucide-react';
import { teamMembers, agents, okrs, kpis } from '@/lib/data';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

interface SearchResult {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  category: 'Team' | 'Agents' | 'OKRs' | 'KPIs' | 'Navigation';
  action: string;
}

const navigationItems: SearchResult[] = [
  // Core 7
  {
    id: 'nav-dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
    title: 'Dashboard',
    subtitle: 'Your daily cockpit — accountability, KPIs, ownership',
    category: 'Navigation',
    action: 'dashboard',
  },
  {
    id: 'nav-tasks',
    icon: <CheckSquare className="w-4 h-4" />,
    title: 'Tasks',
    subtitle: 'Task commander — 90-day actions, Kanban, filters',
    category: 'Navigation',
    action: 'tasks',
  },
  {
    id: 'nav-okrs',
    icon: <Target className="w-4 h-4" />,
    title: 'OKRs & KPIs',
    subtitle: 'North star alignment — objectives and key results',
    category: 'Navigation',
    action: 'okrs',
  },
  {
    id: 'nav-decisions',
    icon: <Scale className="w-4 h-4" />,
    title: 'Decisions',
    subtitle: 'Decision log — every strategic call documented',
    category: 'Navigation',
    action: 'decisions',
  },
  {
    id: 'nav-journal',
    icon: <BookOpen className="w-4 h-4" />,
    title: 'Journal',
    subtitle: 'Morning check-in, EOD reflection, weekly pulse',
    category: 'Navigation',
    action: 'journal',
  },
  {
    id: 'nav-team',
    icon: <Users className="w-4 h-4" />,
    title: 'Team',
    subtitle: 'Team members — roles, OS, feedback, qualities',
    category: 'Navigation',
    action: 'team',
  },
  // Supporting
  {
    id: 'nav-notes',
    icon: <StickyNote className="w-4 h-4" />,
    title: 'Notes',
    subtitle: 'Team knowledge base and shared notes',
    category: 'Navigation',
    action: 'notes',
  },
  {
    id: 'nav-roadmap',
    icon: <Map className="w-4 h-4" />,
    title: 'Roadmap',
    subtitle: 'Strategic phases and milestones to $1B+',
    category: 'Navigation',
    action: 'roadmap',
  },
  {
    id: 'nav-cash-runway',
    icon: <DollarSign className="w-4 h-4" />,
    title: 'Cash Runway',
    subtitle: 'AUM, burn rate, and scenario modeling',
    category: 'Navigation',
    action: 'cash-runway',
  },
  {
    id: 'nav-role-drift',
    icon: <Compass className="w-4 h-4" />,
    title: 'Role Drift',
    subtitle: 'Track how roles evolve vs. original design — spot drift early',
    category: 'Navigation',
    action: 'role-drift',
  },
  {
    id: 'nav-leaderboard',
    icon: <Trophy className="w-4 h-4" />,
    title: 'Leaderboard',
    subtitle: 'Team performance rankings and accountability scores',
    category: 'Navigation',
    action: 'leaderboard',
  },
  {
    id: 'nav-settings',
    icon: <Settings className="w-4 h-4" />,
    title: 'Settings & Profile',
    subtitle: 'Your operating system, qualities, and preferences',
    category: 'Navigation',
    action: 'settings',
  },
];

const categoryOrder: SearchResult['category'][] = [
  'Navigation',
  'Team',
  'Agents',
  'OKRs',
  'KPIs',
];

const categoryIcons: Record<SearchResult['category'], React.ReactNode> = {
  Navigation: <ArrowRight className="w-3 h-3" />,
  Team: <Users className="w-3 h-3" />,
  Agents: <Bot className="w-3 h-3" />,
  OKRs: <Target className="w-3 h-3" />,
  KPIs: <TrendingUp className="w-3 h-3" />,
};

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Build search results from all data sources
  const allResults = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [];

    // Team members
    teamMembers.forEach((member) => {
      results.push({
        id: `team-${member.id}`,
        icon: <Users className="w-4 h-4" />,
        title: member.name,
        subtitle: member.role,
        category: 'Team',
        action: 'team',
      });
    });

    // Agents
    agents.forEach((agent) => {
      results.push({
        id: `agent-${agent.id}`,
        icon: <Bot className="w-4 h-4" />,
        title: agent.name,
        subtitle: agent.description,
        category: 'Agents',
        action: 'agents',
      });
    });

    // OKRs
    okrs.forEach((okr) => {
      results.push({
        id: `okr-${okr.id}`,
        icon: <Target className="w-4 h-4" />,
        title: okr.objective,
        subtitle: `${okr.quarter} · ${okr.status.replace('-', ' ')}`,
        category: 'OKRs',
        action: 'okrs',
      });
    });

    // KPIs
    kpis.forEach((kpi) => {
      results.push({
        id: `kpi-${kpi.id}`,
        icon: <TrendingUp className="w-4 h-4" />,
        title: kpi.name,
        subtitle: `${kpi.value} → ${kpi.target} · ${kpi.category}`,
        category: 'KPIs',
        action: 'okrs',
      });
    });

    return results;
  }, []);

  // Filter results based on query
  const filteredResults = useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim();

    // No query: show navigation shortcuts only
    if (!q) {
      return navigationItems;
    }

    // Filter all results + navigation items
    const matched: SearchResult[] = [];

    // Always include matching navigation items
    navigationItems.forEach((item) => {
      if (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
      ) {
        matched.push(item);
      }
    });

    // Filter data-based results
    allResults.forEach((item) => {
      if (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
      ) {
        matched.push(item);
      }
    });

    return matched;
  }, [query, allResults]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    categoryOrder.forEach((cat) => {
      const items = filteredResults.filter((r) => r.category === cat);
      if (items.length > 0) {
        groups[cat] = items;
      }
    });
    return groups;
  }, [filteredResults]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    const flat: SearchResult[] = [];
    categoryOrder.forEach((cat) => {
      if (groupedResults[cat]) {
        flat.push(...groupedResults[cat]);
      }
    });
    return flat;
  }, [groupedResults]);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setQuery('');
      setSelectedIndex(0);
      // Focus input after animation frame
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (!resultsRef.current) return;
    const selectedEl = resultsRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onNavigate(result.action);
      onClose();
    },
    [onNavigate, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (flatResults[selectedIndex]) {
            handleSelect(flatResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [flatResults, selectedIndex, handleSelect, onClose]
  );

  // Close on overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center pt-[15vh] transition-all duration-200 ${
        isOpen
          ? 'bg-black/60 backdrop-blur-sm opacity-100'
          : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={handleOverlayClick}
      onTransitionEnd={() => {
        if (!isOpen) setIsAnimating(false);
      }}
    >
      <div
        className={`w-full max-w-2xl mx-4 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden transition-all duration-200 ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 -translate-y-4'
        }`}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything... team, agents, tasks, OKRs"
            className="flex-1 bg-transparent text-text-primary text-base placeholder:text-text-muted outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-2 border border-border">
            <Command className="w-3 h-3 text-text-muted" />
            <span className="text-xs text-text-muted font-mono">K</span>
          </div>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className="max-h-[400px] overflow-y-auto py-2"
        >
          {flatResults.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Search className="w-10 h-10 text-text-muted/40 mx-auto mb-3" />
              <p className="text-text-muted text-sm">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-text-muted/60 text-xs mt-1">
                Try searching for a team member, agent, or OKR
              </p>
            </div>
          ) : (
            <>
              {categoryOrder.map((category) => {
                const items = groupedResults[category];
                if (!items || items.length === 0) return null;

                return (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="flex items-center gap-2 px-5 py-2 mt-1">
                      <span className="text-text-muted">
                        {categoryIcons[category]}
                      </span>
                      <span className="text-[11px] font-semibold tracking-wider uppercase text-text-muted">
                        {category}
                      </span>
                      <span className="text-[10px] text-text-muted/50 font-mono">
                        {items.length}
                      </span>
                    </div>

                    {/* Result Rows */}
                    {items.map((result) => {
                      const globalIndex = flatResults.indexOf(result);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={result.id}
                          data-index={globalIndex}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors duration-75 cursor-pointer ${
                            isSelected
                              ? 'bg-surface-2'
                              : 'hover:bg-surface-2'
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-accent/15 text-accent'
                                : 'bg-surface-3 text-text-muted'
                            }`}
                          >
                            {result.icon}
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-text-primary truncate">
                              {result.title}
                            </div>
                            <div className="text-xs text-text-muted truncate">
                              {result.subtitle}
                            </div>
                          </div>

                          {/* Category Badge */}
                          <span className="flex-shrink-0 text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-surface-3 text-text-muted border border-border">
                            {result.category}
                          </span>

                          {/* Arrow on selected */}
                          {isSelected && (
                            <ArrowRight className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-6 px-5 py-3 border-t border-border bg-surface-2/50">
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-[10px] font-mono">
              &uarr;&darr;
            </kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-[10px] font-mono">
              &crarr;
            </kbd>
            Select
          </span>
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border text-[10px] font-mono">
              esc
            </kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
