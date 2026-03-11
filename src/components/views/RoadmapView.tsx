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
  Plus,
  Trash2,
} from 'lucide-react';
import { roadmapPhases, memberIdToOwnerName } from '@/lib/data';
import { exportToPdf } from '@/lib/exportPdf';
import { useEditableStore } from '@/lib/useEditableStore';
import { InlineText, InlineSelect, InlineList, EditBanner } from '@/components/InlineEdit';

/* ── Types ── */

interface AumMilestone {
  label: string;
  revenue: string;
  position: number;
  isCurrent: boolean;
}

interface TrajectoryRow {
  timeline: string;
  aum: string;
  revenue: string;
  edge: string;
  team: string;
  different: string;
}

interface RoadmapPhase {
  phase: string;
  when: string;
  edge: string;
  description: string;
  status: string;
}

interface RoadmapData {
  headerTitle: string;
  headerSubtitle: string;
  aumMilestones: AumMilestone[];
  trajectoryData: TrajectoryRow[];
  phases: RoadmapPhase[];
  proveItActions: string[];
  ninetyDayGate: string[];
  roleMessages: Record<string, string>;
}

/* ── Default Data ── */

const defaultRoadmapData: RoadmapData = {
  headerTitle: 'The $1B+ Roadmap',
  headerSubtitle: 'Path from $100M to $1B+ AUM \u2014 every phase has clear milestones and edge targets',
  aumMilestones: [
    { label: '$80-100M', revenue: '$1.6-2M', position: 0, isCurrent: true },
    { label: '$200M', revenue: '$3-4M', position: 25, isCurrent: false },
    { label: '$400M', revenue: '$5-8M', position: 50, isCurrent: false },
    { label: '$750M', revenue: '$10-15M', position: 75, isCurrent: false },
    { label: '$1B+', revenue: '$20-30M+', position: 100, isCurrent: false },
  ],
  trajectoryData: [
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
  ],
  phases: roadmapPhases.map((p) => ({ ...p })),
  proveItActions: [
    'BTC Alpha: hit 20 bps/month consistently',
    'Map all 12 BTC yield sources with bps attribution',
    'Hire COO by June 2026',
    'CTO candidates identified by April 2026',
    'A9 audit underway and risk framework documented',
    'Dynamic Alpha: name + structure + sleeve architecture finalized',
    'Risk dashboard v1 deployed',
    'Regime classifier v0.1: architecture + data sources defined',
  ],
  ninetyDayGate: [
    'BTC Alpha > 15 bps/month average over 90 days',
    'COO offer extended or hired',
    'CTO search actively engaged with 3+ candidates',
    'Dynamic Alpha structure approved by IC',
    'Risk limits published with 100% breach logging',
    'Strategy performance database operational',
  ],
  roleMessages: {
    james: 'You own the vision and $1B trajectory',
    ty: 'You own portfolio edge and risk governance',
    timon: 'You own the AI stack and platform',
    mark: 'You own financial clarity and runway',
    todd: 'You own LP trust and IR',
    ross: 'You own cross-functional execution and portfolio ops',
    paola: 'You own partnerships and growth pipeline',
    andrew: 'You own competitive intel and governance',
    sahir: 'You own strategy performance and operations',
    david: 'You own fund administration and operations',
    thao: 'You own project coordination and task management',
    nicole: 'You support investor relations and communications',
    nick: 'You support fund operations and reporting',
  },
};

/* ── Static lookup data (non-editable) ── */

const statusOptions = [
  { label: 'Active', value: 'active', color: 'bg-accent/15 text-accent border border-accent/30' },
  { label: 'Upcoming', value: 'upcoming', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
  { label: 'Future', value: 'future', color: 'bg-gray-500/15 text-gray-400 border border-gray-500/30' },
];

const proveItActionOwners: Record<number, string[]> = {
  0: ['ty', 'ross'],
  1: ['ross', 'ty'],
  2: ['james'],
  3: ['james'],
  4: ['ross', 'ty'],
  5: ['james', 'andrew'],
  6: ['timon', 'ty'],
  7: ['timon', 'sahir'],
};

const ninetyDayGateOwners: Record<number, string[]> = {
  0: ['ty', 'ross'],
  1: ['james'],
  2: ['james'],
  3: ['james', 'andrew', 'ty'],
  4: ['ty', 'timon'],
  5: ['sahir', 'timon'],
};

/* ── Component ── */

export function RoadmapView({ currentUser }: { currentUser?: string }) {
  const ownerName = currentUser ? memberIdToOwnerName[currentUser] ?? currentUser : null;

  const { data, setData, hasEdits, resetAll } = useEditableStore(
    'amphibian-unite-roadmap',
    defaultRoadmapData,
  );

  /* ── Update helpers ── */

  const updateField = <K extends keyof RoadmapData>(field: K, value: RoadmapData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePhase = (index: number, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      phases: prev.phases.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  };

  const addPhase = () => {
    setData((prev) => ({
      ...prev,
      phases: [
        ...prev.phases,
        {
          phase: 'NEW PHASE',
          when: 'TBD',
          edge: '0.0',
          description: 'Click to edit description...',
          status: 'upcoming',
        },
      ],
    }));
  };

  const deletePhase = (index: number) => {
    setData((prev) => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index),
    }));
  };

  const updateMilestone = (index: number, field: keyof AumMilestone, value: string) => {
    setData((prev) => ({
      ...prev,
      aumMilestones: prev.aumMilestones.map((ms, i) =>
        i === index ? { ...ms, [field]: value } : ms,
      ),
    }));
  };

  const updateTrajectory = (index: number, field: keyof TrajectoryRow, value: string) => {
    setData((prev) => ({
      ...prev,
      trajectoryData: prev.trajectoryData.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const updateRoleMessage = (userId: string, value: string) => {
    setData((prev) => ({
      ...prev,
      roleMessages: { ...prev.roleMessages, [userId]: value },
    }));
  };

  return (
    <div id="roadmap-view-content" className="space-y-8 animate-fade-in">
      {/* ── Edit Banner ── */}
      <EditBanner hasEdits={hasEdits} onReset={resetAll} />

      {/* ── Header ── */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-2">
          <Map className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-bold gradient-text tracking-tight">
            <InlineText
              value={data.headerTitle}
              onSave={(v) => updateField('headerTitle', v)}
            />
          </h1>
        </div>
        <p className="text-text-secondary text-base max-w-2xl">
          <InlineText
            value={data.headerSubtitle}
            onSave={(v) => updateField('headerSubtitle', v)}
            multiline
          />
        </p>
      </div>

      {/* ── Personal Roadmap Summary ── */}
      {currentUser && data.roleMessages[currentUser] && (
        <div
          className="border-l-4 border-l-accent bg-accent/5 rounded-xl p-5 animate-fade-in"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center gap-3 mb-1.5">
            <Target className="w-5 h-5 text-accent" />
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
              Your Role in the Roadmap
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">You</span>
          </div>
          <p className="text-base text-accent font-medium ml-8">
            {ownerName} &mdash;{' '}
            <InlineText
              value={data.roleMessages[currentUser]}
              onSave={(v) => updateRoleMessage(currentUser, v)}
            />
          </p>
        </div>
      )}

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
          {data.aumMilestones.map((ms, i) => (
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
                  <InlineText
                    value={ms.label}
                    onSave={(v) => updateMilestone(i, 'label', v)}
                  />
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
                  <InlineText
                    value={ms.revenue}
                    onSave={(v) => updateMilestone(i, 'revenue', v)}
                  />
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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Milestone className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">
              Execution Phases
            </h2>
          </div>
          <button
            onClick={addPhase}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-lg hover:bg-teal-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Phase
          </button>
        </div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border-2" />

          <div className="space-y-5">
            {data.phases.map((phase, index) => {
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
                          <InlineText
                            value={phase.phase}
                            onSave={(v) => updatePhase(index, 'phase', v)}
                          />
                        </h3>
                        <InlineSelect
                          value={phase.status}
                          options={statusOptions}
                          onSave={(v) => updatePhase(index, 'status', v)}
                        />
                        {isActive && currentUser === 'james' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">You Own This Phase</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-text-muted font-mono">
                          <Calendar size={12} />
                          <InlineText
                            value={phase.when}
                            onSave={(v) => updatePhase(index, 'when', v)}
                          />
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-mono text-text-secondary">
                          <Star size={11} className="text-accent-amber" />
                          Edge: <InlineText
                            value={phase.edge}
                            onSave={(v) => updatePhase(index, 'edge', v)}
                          />
                        </span>
                        <button
                          onClick={() => deletePhase(index)}
                          className="p-1 rounded hover:bg-rose-500/20 text-text-muted/40 hover:text-rose-400 transition-all"
                          title="Delete phase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-text-secondary leading-relaxed mb-1">
                      <InlineText
                        value={phase.description}
                        onSave={(v) => updatePhase(index, 'description', v)}
                        multiline
                      />
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
                          <InlineList
                            items={data.proveItActions}
                            onSave={(v) => updateField('proveItActions', v)}
                            placeholder="Add action..."
                            icon={<CheckCircle size={14} className="text-accent" />}
                          />
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
                            <InlineList
                              items={data.ninetyDayGate}
                              onSave={(v) => updateField('ninetyDayGate', v)}
                              placeholder="Add gate criterion..."
                              icon={<div className="h-2.5 w-2.5 rounded-full border-2 border-accent-amber bg-accent-amber/20" />}
                            />
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
              {data.trajectoryData.map((row, i) => {
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
                          <InlineText
                            value={row.timeline}
                            onSave={(v) => updateTrajectory(i, 'timeline', v)}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm font-bold text-text-primary whitespace-nowrap">
                        <InlineText
                          value={row.aum}
                          onSave={(v) => updateTrajectory(i, 'aum', v)}
                        />
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm font-mono text-text-secondary whitespace-nowrap">
                        <InlineText
                          value={row.revenue}
                          onSave={(v) => updateTrajectory(i, 'revenue', v)}
                        />
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-2.5 py-1 text-xs font-mono text-text-secondary whitespace-nowrap">
                        <Star size={10} className="text-accent-amber" />
                        <InlineText
                          value={row.edge}
                          onSave={(v) => updateTrajectory(i, 'edge', v)}
                        />
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-text-secondary font-mono whitespace-nowrap">
                        <InlineText
                          value={row.team}
                          onSave={(v) => updateTrajectory(i, 'team', v)}
                        />
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-text-muted leading-snug">
                        <InlineText
                          value={row.different}
                          onSave={(v) => updateTrajectory(i, 'different', v)}
                        />
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
