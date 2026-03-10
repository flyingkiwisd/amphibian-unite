'use client';

import {
  Map,
  Target,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Calendar,
  Download,
  Milestone,
} from 'lucide-react';
import { roadmapPhases } from '@/lib/data';
import { exportToPdf } from '@/lib/exportPdf';

const aumMilestones = [
  { label: '$100M', revenue: '$1.6-2M', position: 0, isCurrent: true },
  { label: '$200M', revenue: '$3-4M', position: 25, isCurrent: false },
  { label: '$400M', revenue: '$5-8M', position: 50, isCurrent: false },
  { label: '$750M', revenue: '$10-15M', position: 75, isCurrent: false },
  { label: '$1B+', revenue: '$20-30M+', position: 100, isCurrent: false },
];

const trajectoryData = [
  {
    timeline: 'Today',
    aum: '$80-100M',
    revenue: '$1.6-2M',
    edge: '5.1/10',
    team: '14',
    different: 'Proving BTC Alpha. Hiring COO + CTO. Building AI edge foundation.',
  },
  {
    timeline: 'Dec 2026',
    aum: '$150-200M',
    revenue: '$3-4M',
    edge: '6.5/10',
    team: '16-18',
    different: 'Dynamic Alpha live. COO running ops. Regime classifier v1.',
  },
  {
    timeline: 'Dec 2027',
    aum: '$250-400M',
    revenue: '$5-8M',
    edge: '7.5/10',
    team: '20-22',
    different: 'Institutional governance. AI Fund Ops product launched.',
  },
  {
    timeline: 'Dec 2028',
    aum: '$500-750M',
    revenue: '$10-15M',
    edge: '8.0/10',
    team: '25-30',
    different: '20+ managers. Multiple revenue lines. Full AI stack.',
  },
  {
    timeline: '2030',
    aum: '$1B+',
    revenue: '$20-30M+',
    edge: '8.5/10',
    team: '30-40',
    different: 'Multi-asset digital finance platform. The Bridge complete.',
  },
];

const proveItActions = [
  'BTC Alpha: hit 20 bps/month consistently',
  'Map all 12 BTC yield sources with bps attribution',
  'Hire COO by June 2026',
  'CTO candidates identified by April 2026',
  'A9 audit underway and risk framework documented',
  'Dynamic Alpha: name + structure + sleeve architecture finalized',
  'Risk dashboard v1 deployed',
  'Regime classifier v0.1: architecture + data sources defined',
];

const ninetyDayGate = [
  'BTC Alpha > 15 bps/month average over 90 days',
  'COO offer extended or hired',
  'CTO search actively engaged with 3+ candidates',
  'Dynamic Alpha structure approved by IC',
  'Risk limits published with 100% breach logging',
  'Strategy performance database operational',
];

export function RoadmapView() {
  return (
    <div id="roadmap-view-content" className="space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-2">
          <Map className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-bold gradient-text tracking-tight">
            The $1B+ Roadmap
          </h1>
        </div>
        <p className="text-text-secondary text-base max-w-2xl">
          Path from $100M to $1B+ AUM &mdash; every phase has clear milestones and edge targets
        </p>
      </div>

      {/* ── AUM Trajectory Visualization ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 lg:p-8 animate-fade-in"
        style={{ animationDelay: '75ms' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">
              AUM Growth Trajectory
            </h2>
          </div>
          <button
            onClick={() => exportToPdf('roadmap-view-content', 'amphibian-unite-roadmap')}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-2 hover:shadow-accent/30 active:scale-[0.97]"
          >
            <Download size={16} />
            Download Roadmap PDF
          </button>
        </div>

        {/* Milestone Bar */}
        <div className="relative mt-8 mb-12 mx-4">
          {/* Background bar */}
          <div className="h-2 bg-surface-3 rounded-full w-full" />

          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-2 rounded-full"
            style={{
              width: '8%',
              background: 'linear-gradient(90deg, #14b8a6, #3b82f6)',
              boxShadow: '0 0 12px rgba(20, 184, 166, 0.4)',
            }}
          />

          {/* Milestone dots and labels */}
          {aumMilestones.map((ms, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${ms.position}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Dot */}
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                  ms.isCurrent
                    ? 'bg-accent border-accent shadow-[0_0_16px_rgba(20,184,166,0.6)]'
                    : 'bg-surface-3 border-border-2 hover:border-accent/50'
                }`}
              />

              {/* AUM Label (above) */}
              <div
                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
              >
                <span
                  className={`text-sm font-bold ${
                    ms.isCurrent ? 'text-accent' : 'text-text-secondary'
                  }`}
                >
                  {ms.label}
                </span>
                {ms.isCurrent && (
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-accent mt-0.5">
                    Today
                  </span>
                )}
              </div>

              {/* Revenue Label (below) */}
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                <span className="text-xs text-text-muted font-mono">
                  {ms.revenue}
                </span>
                <span className="block text-[10px] text-text-muted mt-0.5">
                  rev/yr
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Phase Timeline (Vertical) ── */}
      <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center gap-2 mb-5">
          <Milestone className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">
            Execution Phases
          </h2>
        </div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border-2" />

          <div className="space-y-5">
            {roadmapPhases.map((phase, index) => {
              const isActive = phase.status === 'active';

              return (
                <div
                  key={index}
                  className="relative flex items-start gap-5 animate-fade-in"
                  style={{ animationDelay: `${200 + index * 60}ms` }}
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0 mt-5">
                    <div
                      className={`w-[18px] h-[18px] rounded-full border-2 ${
                        isActive
                          ? 'bg-accent border-accent shadow-[0_0_12px_rgba(20,184,166,0.5)]'
                          : 'bg-surface-3 border-border-2'
                      }`}
                    />
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" style={{ animationDuration: '2s' }} />
                    )}
                  </div>

                  {/* Phase Card */}
                  <div
                    className={`flex-1 glow-card rounded-xl border p-6 transition-all duration-300 ${
                      isActive
                        ? 'bg-surface border-accent/40 border-l-4 border-l-accent shadow-[0_0_30px_rgba(20,184,166,0.08)]'
                        : 'bg-surface border-border opacity-70 hover:opacity-90 hover:border-border-2'
                    }`}
                  >
                    {/* Phase header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <h3
                          className={`text-xl font-bold tracking-tight ${
                            isActive ? 'text-accent' : 'text-text-secondary'
                          }`}
                        >
                          {phase.phase}
                        </h3>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-text-muted font-mono">
                          <Calendar size={12} />
                          {phase.when}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-mono text-text-secondary">
                          <Star size={11} className="text-accent-amber" />
                          Edge: {phase.edge}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-text-secondary leading-relaxed mb-1">
                      {phase.description}
                    </p>

                    {/* Active phase: expanded breakdown */}
                    {isActive && (
                      <div className="mt-5 pt-5 border-t border-border space-y-6">
                        {/* Key Actions */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Target size={15} className="text-accent" />
                            <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                              Key Actions
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {proveItActions.map((action, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-surface-2 transition-colors"
                              >
                                <CheckCircle
                                  size={14}
                                  className="mt-0.5 flex-shrink-0 text-accent"
                                />
                                <span className="text-sm text-text-secondary leading-snug">
                                  {action}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 90-Day Gate */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <ArrowRight size={15} className="text-accent-amber" />
                            <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                              90-Day Gate Criteria
                            </h4>
                          </div>
                          <div className="bg-surface-2 rounded-xl p-4 border border-border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {ninetyDayGate.map((gate, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                  <div className="mt-1 flex-shrink-0">
                                    <div className="h-2.5 w-2.5 rounded-full border-2 border-accent-amber bg-accent-amber/20" />
                                  </div>
                                  <span className="text-sm text-text-secondary leading-snug">
                                    {gate}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── AUM / Revenue / Edge Table ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '500ms' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">
            Growth Trajectory
          </h2>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-2">
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                  Timeline
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                  AUM
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                  Revenue
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                  Edge Rating
                </th>
                <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                  Team
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                  What&apos;s Different
                </th>
              </tr>
            </thead>
            <tbody>
              {trajectoryData.map((row, i) => {
                const isFirst = i === 0;
                return (
                  <tr
                    key={i}
                    className={`border-b border-border/50 transition-colors hover:bg-surface-2 ${
                      isFirst ? 'bg-accent/5' : ''
                    }`}
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        {isFirst && (
                          <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                        )}
                        <span
                          className={`text-sm font-semibold whitespace-nowrap ${
                            isFirst ? 'text-accent' : 'text-text-primary'
                          }`}
                        >
                          {row.timeline}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm font-bold text-text-primary whitespace-nowrap">
                        {row.aum}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm font-mono text-text-secondary whitespace-nowrap">
                        {row.revenue}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-2.5 py-1 text-xs font-mono text-text-secondary whitespace-nowrap">
                        <Star size={10} className="text-accent-amber" />
                        {row.edge}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-text-secondary font-mono whitespace-nowrap">
                        {row.team}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-text-muted leading-snug">
                        {row.different}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
