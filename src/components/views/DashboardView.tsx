'use client';

import { TrendingUp, TrendingDown, Minus, ArrowRight, Star, Zap } from 'lucide-react';
import { kpis, okrs, roadmapPhases, agents, teamMembers } from '@/lib/data';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning, team';
  if (hour < 17) return 'Good afternoon, team';
  return 'Good evening, team';
};

const statusColor = (status: string) => {
  switch (status) {
    case 'on-track': return 'bg-success/20 text-success';
    case 'at-risk': return 'bg-warning/20 text-warning';
    case 'behind': return 'bg-danger/20 text-danger';
    default: return 'bg-text-muted/20 text-text-muted';
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'on-track': return 'On Track';
    case 'at-risk': return 'At Risk';
    case 'behind': return 'Behind';
    default: return status;
  }
};

const agentStatusDot = (status: string) => {
  switch (status) {
    case 'active': return 'bg-success';
    case 'building': return 'bg-warning';
    case 'planned': return 'bg-text-muted';
    default: return 'bg-text-muted';
  }
};

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
  switch (trend) {
    case 'up': return <TrendingUp className="w-4 h-4 text-success" />;
    case 'down': return <TrendingDown className="w-4 h-4 text-danger" />;
    case 'flat': return <Minus className="w-4 h-4 text-text-muted" />;
  }
};

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const today = new Date();
  const displayKpis = kpis.slice(0, 4);
  const displayOkrs = okrs.slice(0, 3);

  // Calculate progress from $80-100M to $1B (8-10% of the way)
  const aumProgress = 9;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Command Center
          </h1>
          <p className="text-text-secondary mt-1">{getGreeting()}</p>
        </div>
        <div className="text-text-muted text-sm font-mono">
          {formatDate(today)}
        </div>
      </div>

      {/* ── North Star Banner ── */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, #14b8a6, #0d9488, #115e59, #0d9488, #14b8a6)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 6s ease infinite',
        }}
      >
        <div className="bg-surface rounded-xl p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-accent fill-accent" />
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                  North Star
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">
                $1B+ AUM
              </h2>
              <p className="text-text-secondary text-sm max-w-xl">
                Multi-asset, AI-native digital finance — the bridge between two financial civilizations
              </p>
            </div>

            <div className="flex flex-wrap gap-6 lg:gap-10">
              <div className="text-center">
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Current AUM</p>
                <p className="text-2xl font-bold text-text-primary">$80-100M</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Edge Rating</p>
                <p className="text-2xl font-bold text-text-primary">
                  5.1<span className="text-text-muted">/10</span>
                  <ArrowRight className="inline w-4 h-4 mx-1 text-accent" />
                  <span className="text-accent">8.5</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Target</p>
                <p className="text-2xl font-bold text-accent">$1B+</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-text-muted mb-2">
              <span>$80M</span>
              <span className="text-accent font-medium">Journey to $1B+</span>
              <span>$1B</span>
            </div>
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${aumProgress}%`,
                  background: 'linear-gradient(90deg, #14b8a6, #3b82f6)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayKpis.map((kpi, index) => (
          <div
            key={kpi.id}
            className="glow-card bg-surface border border-border rounded-xl p-5 hover:border-border-2 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                {kpi.name}
              </span>
              <TrendIcon trend={kpi.trend} />
            </div>
            <p className="text-2xl font-bold text-text-primary mb-1">{kpi.value}</p>
            <p className="text-xs text-text-muted">
              Target: <span className="text-text-secondary">{kpi.target}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── Two Column: OKRs + Roadmap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active OKRs */}
        <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-text-primary">Active OKRs</h3>
            <button
              onClick={() => onNavigate('okrs')}
              className="text-xs text-accent hover:text-accent-2 transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-5">
            {displayOkrs.map((okr) => (
              <div key={okr.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-text-primary leading-snug flex-1">
                    {okr.objective}
                  </p>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor(okr.status)}`}>
                    {statusLabel(okr.status)}
                  </span>
                </div>
                <div className="space-y-2">
                  {okr.keyResults.map((kr, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-muted truncate pr-3 max-w-[80%]">
                          {kr.text}
                        </span>
                        <span className="text-xs text-text-secondary font-mono">
                          {kr.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${kr.progress}%`,
                            background:
                              okr.status === 'on-track'
                                ? '#22c55e'
                                : okr.status === 'at-risk'
                                ? '#eab308'
                                : '#ef4444',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '275ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-text-primary">Roadmap</h3>
            <button
              onClick={() => onNavigate('roadmap')}
              className="text-xs text-accent hover:text-accent-2 transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border-2" />

            <div className="space-y-4">
              {roadmapPhases.map((phase, index) => {
                const isActive = phase.status === 'active';
                return (
                  <div key={index} className="relative flex items-start gap-4 pl-6">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 ${
                        isActive
                          ? 'bg-accent border-accent shadow-[0_0_8px_rgba(20,184,166,0.5)]'
                          : 'bg-surface-3 border-border-2'
                      }`}
                    />

                    <div className={`flex-1 ${isActive ? '' : 'opacity-60'}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-sm font-semibold ${
                            isActive ? 'text-accent' : 'text-text-secondary'
                          }`}
                        >
                          {phase.phase}
                        </span>
                        <span className="text-xs text-text-muted font-mono">{phase.when}</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{phase.description}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono text-text-muted bg-surface-3 px-2 py-0.5 rounded">
                        Edge: {phase.edge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 14 Agents Grid ── */}
      <div className="animate-fade-in" style={{ animationDelay: '350ms' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-text-primary">14 Intelligent Agents</h3>
          </div>
          <button
            onClick={() => onNavigate('agents')}
            className="text-xs text-accent hover:text-accent-2 transition-colors flex items-center gap-1"
          >
            Explore All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {agents.map((agent, index) => (
            <button
              key={agent.id}
              onClick={() => onNavigate('agents')}
              className="glow-card bg-surface border border-border rounded-xl p-3 text-left hover:border-border-2 hover:bg-surface-2 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${375 + index * 40}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${agentStatusDot(agent.status)}`} />
                <span className={`text-xs font-medium ${agent.color} group-hover:brightness-125 transition-all`}>
                  {agent.shortName}
                </span>
              </div>
              <p className="text-[10px] text-text-muted leading-tight line-clamp-2">
                {agent.description.split('.')[0]}
              </p>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-[10px] text-text-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success" /> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-warning" /> Building
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-text-muted" /> Planned
          </span>
        </div>
      </div>

      {/* ── Team Overview ── */}
      <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Team Overview</h3>
          <button
            onClick={() => onNavigate('team')}
            className="text-xs text-accent hover:text-accent-2 transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {teamMembers.map((member, index) => (
              <button
                key={member.id}
                onClick={() => onNavigate('team')}
                className="glow-card bg-surface border border-border rounded-xl p-4 min-w-[140px] hover:border-border-2 transition-all duration-300 animate-fade-in cursor-pointer text-left"
                style={{ animationDelay: `${525 + index * 40}ms` }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-sm font-bold text-white mb-2`}
                  >
                    {member.avatar}
                  </div>
                  <p className="text-sm font-medium text-text-primary leading-tight">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">{member.shortRole}</p>
                  {member.status === 'hiring' && (
                    <span className="mt-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple">
                      Hiring
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
