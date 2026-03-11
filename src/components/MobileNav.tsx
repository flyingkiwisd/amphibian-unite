'use client';

import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  Target,
  MoreHorizontal,
  Search,
  Users,
  Map,
  Scale,
  StickyNote,
  DollarSign,
  Trophy,
  BookOpen,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

type ViewType = 'dashboard' | 'agents' | 'team' | 'okrs' | 'tasks' | 'roadmap' | 'ai-edge' | 'decisions' | 'notes' | 'activity' | 'leaderboard' | 'accountability' | 'founder-alignment' | 'meeting-intel' | 'what-changed' | 'peer-feedback' | 'cash-runway' | 'lp-health' | 'competitive-intel' | 'knowledge-graph' | 'role-drift' | 'journal' | 'settings';

interface MobileNavProps {
  currentView: string;
  onViewChange: (view: ViewType) => void;
  onOpenSearch: () => void;
}

const primaryTabs: { label: string; icon: React.ElementType; view: ViewType }[] = [
  { label: 'Home', icon: LayoutDashboard, view: 'dashboard' },
  { label: 'Tasks', icon: CheckSquare, view: 'tasks' },
  { label: 'Journal', icon: BookOpen, view: 'journal' },
  { label: 'OKRs', icon: Target, view: 'okrs' },
];

const moreTabs: { label: string; icon: React.ElementType; view: ViewType }[] = [
  { label: 'Decisions', icon: Scale, view: 'decisions' },
  { label: 'Team', icon: Users, view: 'team' },
  { label: '14 Agents', icon: Bot, view: 'agents' },
  { label: 'Notes', icon: StickyNote, view: 'notes' },
  { label: 'Roadmap', icon: Map, view: 'roadmap' },
  { label: 'Cash Runway', icon: DollarSign, view: 'cash-runway' },
  { label: 'Leaderboard', icon: Trophy, view: 'leaderboard' },
  { label: 'Settings', icon: Settings, view: 'settings' },
];

export function MobileNav({ currentView, onViewChange, onOpenSearch }: MobileNavProps) {
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreTabs.some((t) => t.view === currentView);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute bottom-[72px] left-0 right-0 bg-surface border-t border-border rounded-t-2xl p-4 animate-fade-in z-50">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">More Views</span>
              <button
                onClick={(e) => { e.stopPropagation(); onOpenSearch(); setShowMore(false); }}
                className="flex items-center gap-1.5 text-xs text-accent font-medium"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2" onClick={(e) => e.stopPropagation()}>
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentView === tab.view;
                return (
                  <button
                    key={tab.view}
                    onClick={() => { onViewChange(tab.view); setShowMore(false); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-accent/15 text-accent'
                        : 'text-text-muted hover:bg-surface-2 hover:text-text-secondary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-border">
        <div className="flex items-center justify-around h-[72px] px-2 max-w-lg mx-auto">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.view;
            return (
              <button
                key={tab.view}
                onClick={() => { onViewChange(tab.view); setShowMore(false); }}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${
                  isActive
                    ? 'text-accent'
                    : 'text-text-muted'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(20,184,166,0.5)]' : ''}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-accent" />}
              </button>
            );
          })}
          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${
              isMoreActive || showMore ? 'text-accent' : 'text-text-muted'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'drop-shadow-[0_0_6px_rgba(20,184,166,0.5)]' : ''}`} />
            <span className={`text-[10px] font-medium ${isMoreActive ? 'font-semibold' : ''}`}>More</span>
            {isMoreActive && <div className="w-1 h-1 rounded-full bg-accent" />}
          </button>
        </div>
        {/* Safe area padding for notched phones */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
}
