'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { DashboardView } from '@/components/views/DashboardView';
import { AgentsView } from '@/components/views/AgentsView';
import { TeamView } from '@/components/views/TeamView';
import { OKRView } from '@/components/views/OKRView';
import { TasksView } from '@/components/views/TasksView';
import { RoadmapView } from '@/components/views/RoadmapView';
import { AIEdgeView } from '@/components/views/AIEdgeView';
import { DecisionLogView } from '@/components/views/DecisionLogView';
import { NotesView } from '@/components/views/NotesView';
import { ActivityView } from '@/components/views/ActivityView';
import { LeaderboardView } from '@/components/views/LeaderboardView';
import { AccountabilityView } from '@/components/views/AccountabilityView';
import { FounderAlignmentView } from '@/components/views/FounderAlignmentView';
import { MeetingIntelView } from '@/components/views/MeetingIntelView';
import { WhatChangedView } from '@/components/views/WhatChangedView';
import { PeerFeedbackView } from '@/components/views/PeerFeedbackView';
import { CashRunwayView } from '@/components/views/CashRunwayView';
import { LPHealthView } from '@/components/views/LPHealthView';
import { CompetitiveIntelView } from '@/components/views/CompetitiveIntelView';
import { KnowledgeGraphView } from '@/components/views/KnowledgeGraphView';
import { RoleDriftView } from '@/components/views/RoleDriftView';
import { JournalView } from '@/components/views/JournalView';
import { LoginScreen } from '@/components/LoginScreen';
import { CommandPalette } from '@/components/CommandPalette';
import { useClerkAuth } from '@/hooks/useClerkAuth';

export type ViewType = 'dashboard' | 'agents' | 'team' | 'okrs' | 'tasks' | 'roadmap' | 'ai-edge' | 'decisions' | 'notes' | 'activity' | 'leaderboard' | 'accountability' | 'founder-alignment' | 'meeting-intel' | 'what-changed' | 'peer-feedback' | 'cash-runway' | 'lp-health' | 'competitive-intel' | 'knowledge-graph' | 'role-drift' | 'journal';

export default function Home() {
  // Clerk auth — returns { isClerkActive, clerkUserId, isLoaded }
  // When Clerk is not configured, isClerkActive=false and we fall back to profile selector
  const { isClerkActive, clerkMemberId, isLoaded: clerkLoaded } = useClerkAuth();

  // Legacy profile selector state (dev mode)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localUser, setLocalUser] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Resolve the current user: Clerk auth takes precedence over profile selector
  const currentUser = isClerkActive ? clerkMemberId : localUser;
  const isAuthenticated = isClerkActive ? !!clerkMemberId : isLoggedIn;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Loading state while Clerk initializes
  if (isClerkActive && !clerkLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — show login screen (profile selector for dev, Clerk handles redirect in prod)
  if (!isAuthenticated) {
    if (isClerkActive) {
      // Clerk is active but user isn't mapped to a team member
      // This means they signed in via Clerk but their email isn't recognized
      return (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-danger/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Access Restricted</h2>
            <p className="text-text-secondary text-sm mb-4">
              Your email isn&apos;t linked to an Amphibian Unite team member.
              Contact your admin to get access.
            </p>
            <p className="text-text-muted text-xs">
              Amphibian Unite is for authorized team members only.
            </p>
          </div>
        </div>
      );
    }
    // Dev mode — show profile selector
    return <LoginScreen onLogin={(user) => { setLocalUser(user); setIsLoggedIn(true); }} />;
  }

  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewType);
    setCommandPaletteOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView onNavigate={handleNavigate} currentUser={currentUser ?? 'james'} />;
      case 'agents': return <AgentsView currentUser={currentUser ?? 'james'} />;
      case 'team': return <TeamView currentUser={currentUser ?? 'james'} />;
      case 'okrs': return <OKRView currentUser={currentUser ?? 'james'} />;
      case 'tasks': return <TasksView currentUser={currentUser ?? 'james'} />;
      case 'roadmap': return <RoadmapView currentUser={currentUser ?? 'james'} />;
      case 'ai-edge': return <AIEdgeView currentUser={currentUser ?? 'james'} />;
      case 'decisions': return <DecisionLogView currentUser={currentUser ?? 'james'} />;
      case 'notes': return <NotesView currentUser={currentUser ?? 'james'} />;
      case 'activity': return <ActivityView currentUser={currentUser ?? 'james'} />;
      case 'leaderboard': return <LeaderboardView currentUser={currentUser ?? 'james'} />;
      case 'accountability': return <AccountabilityView currentUser={currentUser ?? 'james'} />;
      case 'founder-alignment': return <FounderAlignmentView currentUser={currentUser ?? 'james'} />;
      case 'meeting-intel': return <MeetingIntelView currentUser={currentUser ?? 'james'} />;
      case 'what-changed': return <WhatChangedView currentUser={currentUser ?? 'james'} />;
      case 'peer-feedback': return <PeerFeedbackView currentUser={currentUser ?? 'james'} />;
      case 'cash-runway': return <CashRunwayView currentUser={currentUser ?? 'james'} />;
      case 'lp-health': return <LPHealthView currentUser={currentUser ?? 'james'} />;
      case 'competitive-intel': return <CompetitiveIntelView currentUser={currentUser ?? 'james'} />;
      case 'knowledge-graph': return <KnowledgeGraphView currentUser={currentUser ?? 'james'} />;
      case 'role-drift': return <RoleDriftView currentUser={currentUser ?? 'james'} />;
      case 'journal': return <JournalView currentUser={currentUser ?? 'james'} />;
      default: return <DashboardView onNavigate={handleNavigate} currentUser={currentUser ?? 'james'} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentUser={currentUser}
          onOpenSearch={() => setCommandPaletteOpen(true)}
        />
      </div>

      {/* Main content — no margin on mobile, sidebar margin on desktop */}
      <main
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        <style>{`@media (min-width: 768px) { main { margin-left: ${sidebarCollapsed ? 72 : 260}px !important; } }`}</style>
        <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto">
          <div key={currentView} className="animate-fade-in">
            {renderView()}
          </div>
        </div>
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <MobileNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenSearch={() => setCommandPaletteOpen(true)}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
