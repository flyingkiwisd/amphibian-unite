'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/views/DashboardView';
import { AgentsView } from '@/components/views/AgentsView';
import { TeamView } from '@/components/views/TeamView';
import { OKRView } from '@/components/views/OKRView';
import { TasksView } from '@/components/views/TasksView';
import { RoadmapView } from '@/components/views/RoadmapView';
import { AIEdgeView } from '@/components/views/AIEdgeView';
import { LoginScreen } from '@/components/LoginScreen';

export type ViewType = 'dashboard' | 'agents' | 'team' | 'okrs' | 'tasks' | 'roadmap' | 'ai-edge';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(user) => { setCurrentUser(user); setIsLoggedIn(true); }} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView onNavigate={setCurrentView} />;
      case 'agents': return <AgentsView />;
      case 'team': return <TeamView />;
      case 'okrs': return <OKRView />;
      case 'tasks': return <TasksView />;
      case 'roadmap': return <RoadmapView />;
      case 'ai-edge': return <AIEdgeView />;
      default: return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentUser={currentUser}
      />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
