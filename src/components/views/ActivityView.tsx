'use client';

import { useState } from 'react';
import { memberIdToOwnerName } from '@/lib/data';
import {
  Activity,
  CheckSquare,
  Target,
  Scale,
  TrendingUp,
  Users,
  Bot,
  StickyNote,
  Clock,
  Filter,
  ChevronDown,
  UserCircle,
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'task' | 'okr' | 'decision' | 'kpi' | 'team' | 'agent' | 'note';
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  details?: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'decision',
    action: 'logged new decision',
    actor: 'James',
    target: 'Narrow to two products: BTC Alpha and Multi-Strat',
    timestamp: '2026-03-09T14:00:00Z',
    details: 'After reviewing the product landscape, decided to focus resources on BTC Alpha and Multi-Strategy. All other product explorations paused until Q3 review.',
  },
  {
    id: '2',
    type: 'task',
    action: 'updated task',
    actor: 'Ross',
    target: 'Map all BTC yield sources → In Progress (70%)',
    timestamp: '2026-03-09T13:00:00Z',
    details: 'Catalogued 14 yield sources across DeFi, CeFi, and basis trade categories. Remaining: structured products and exotic options.',
  },
  {
    id: '3',
    type: 'okr',
    action: 'set BTC Alpha kill criteria',
    actor: 'Ty',
    target: '20 bps/month minimum threshold',
    timestamp: '2026-03-09T11:00:00Z',
    details: 'If BTC Alpha cannot consistently deliver 20 bps/month net of fees by end of Q2, the product will be sunset.',
  },
  {
    id: '4',
    type: 'task',
    action: 'posted COO job description',
    actor: 'James',
    target: 'COO / Head of Operations role — live on careers page',
    timestamp: '2026-03-08T15:00:00Z',
  },
  {
    id: '5',
    type: 'task',
    action: 'started SMA infrastructure legal framework',
    actor: 'Andrew',
    target: 'Legal & compliance scaffolding for SMA launch',
    timestamp: '2026-03-08T11:30:00Z',
    details: 'Engaged outside counsel to draft SMA advisory agreements and review state registration requirements.',
  },
  {
    id: '6',
    type: 'kpi',
    action: 'KPI Alert triggered',
    actor: 'System',
    target: 'BTC Alpha YTD at -3.08%, below target of +5%',
    timestamp: '2026-03-08T09:00:00Z',
    details: 'Performance driven by drawdown in mid-February regime shift. Recovery trajectory being monitored.',
  },
  {
    id: '7',
    type: 'agent',
    action: 'began Regime Classifier v0.1 architecture',
    actor: 'Timon',
    target: 'ML-based market regime detection module',
    timestamp: '2026-03-07T16:00:00Z',
    details: 'Initial architecture uses HMM with 4 regime states. Training on 5 years of BTC hourly data.',
  },
  {
    id: '8',
    type: 'team',
    action: 'published March investor update',
    actor: 'Todd',
    target: 'Monthly letter sent to all LPs and prospects',
    timestamp: '2026-03-07T14:00:00Z',
  },
  {
    id: '9',
    type: 'note',
    action: 'created note',
    actor: 'James',
    target: 'Weekly Top 3 — March 10',
    timestamp: '2026-03-07T10:00:00Z',
    details: '1) Finalize product focus decision. 2) Ship COO JD. 3) Review BTC Alpha performance with Ty.',
  },
  {
    id: '10',
    type: 'task',
    action: 'started strategy performance database build',
    actor: 'Sahir',
    target: 'Centralized performance tracking for all strategies',
    timestamp: '2026-03-06T13:00:00Z',
    details: 'Building PostgreSQL schema to track daily P&L, drawdown, and attribution across all live strategies.',
  },
  {
    id: '11',
    type: 'okr',
    action: 'updated Q1 OKR progress',
    actor: 'James',
    target: 'Launch first external SMA — now at 40%',
    timestamp: '2026-03-06T10:00:00Z',
  },
  {
    id: '12',
    type: 'decision',
    action: 'approved vendor selection',
    actor: 'Andrew',
    target: 'Selected BitGo as primary custodian for SMA assets',
    timestamp: '2026-03-06T09:00:00Z',
    details: 'BitGo selected over Anchorage and Copper based on API quality, insurance coverage, and pricing.',
  },
  {
    id: '13',
    type: 'team',
    action: 'completed onboarding checklist',
    actor: 'Sahir',
    target: 'All systems access and tooling configured',
    timestamp: '2026-03-05T16:00:00Z',
  },
  {
    id: '14',
    type: 'agent',
    action: 'deployed sentiment scraper v0.3',
    actor: 'Timon',
    target: 'Crypto Twitter sentiment pipeline — live in staging',
    timestamp: '2026-03-05T14:00:00Z',
    details: 'Scrapes top 200 CT accounts, runs NLP sentiment scoring, outputs daily signal. Backtested alpha: 8 bps/month.',
  },
  {
    id: '15',
    type: 'kpi',
    action: 'KPI updated',
    actor: 'System',
    target: 'AUM reached $4.2M — up from $3.8M last week',
    timestamp: '2026-03-05T09:00:00Z',
  },
  {
    id: '16',
    type: 'note',
    action: 'created note',
    actor: 'Ross',
    target: 'Basis trade deep dive — funding rate analysis',
    timestamp: '2026-03-04T15:00:00Z',
    details: 'Detailed analysis of BTC perpetual funding rates across Binance, Bybit, and dYdX. Average annualized: 12-18%.',
  },
  {
    id: '17',
    type: 'task',
    action: 'completed task',
    actor: 'Todd',
    target: 'Investor CRM migration to HubSpot',
    timestamp: '2026-03-04T11:00:00Z',
  },
  {
    id: '18',
    type: 'okr',
    action: 'added key result',
    actor: 'Ty',
    target: 'Sharpe ratio target: 2.0+ for BTC Alpha',
    timestamp: '2026-03-03T14:00:00Z',
    details: 'New key result added to the BTC Alpha objective. Current trailing Sharpe: 1.4.',
  },
  {
    id: '19',
    type: 'decision',
    action: 'logged decision',
    actor: 'James',
    target: 'Delay multi-strat launch to Q3',
    timestamp: '2026-03-03T10:00:00Z',
    details: 'Multi-strategy product launch pushed from Q2 to Q3 to ensure BTC Alpha is stable and performing first.',
  },
  {
    id: '20',
    type: 'task',
    action: 'created task',
    actor: 'Andrew',
    target: 'Draft Form ADV Part 2A update for SEC filing',
    timestamp: '2026-03-02T09:00:00Z',
  },
];

type ActivityType = Activity['type'];
type FilterType = ActivityType | 'all';

const typeConfig: Record<ActivityType, { color: string; dotColor: string; bgColor: string; icon: React.ElementType; label: string }> = {
  task: { color: 'text-amber-400', dotColor: 'bg-amber-400', bgColor: 'bg-amber-400/10', icon: CheckSquare, label: 'Tasks' },
  okr: { color: 'text-emerald-400', dotColor: 'bg-emerald-400', bgColor: 'bg-emerald-400/10', icon: Target, label: 'OKRs' },
  decision: { color: 'text-rose-400', dotColor: 'bg-rose-400', bgColor: 'bg-rose-400/10', icon: Scale, label: 'Decisions' },
  kpi: { color: 'text-blue-400', dotColor: 'bg-blue-400', bgColor: 'bg-blue-400/10', icon: TrendingUp, label: 'KPIs' },
  team: { color: 'text-purple-400', dotColor: 'bg-purple-400', bgColor: 'bg-purple-400/10', icon: Users, label: 'Team' },
  agent: { color: 'text-violet-400', dotColor: 'bg-violet-400', bgColor: 'bg-violet-400/10', icon: Bot, label: 'Agents' },
  note: { color: 'text-sky-400', dotColor: 'bg-sky-400', bgColor: 'bg-sky-400/10', icon: StickyNote, label: 'Notes' },
};

function getRelativeTime(timestamp: string): string {
  const now = new Date('2026-03-09T16:00:00Z');
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${diffDays} days ago`;
}

function getDateGroup(timestamp: string): string {
  const now = new Date('2026-03-09T16:00:00Z');
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 6) return 'This Week';
  return 'Earlier';
}

export function ActivityView({ currentUser }: { currentUser?: string }) {
  const ownerName = currentUser ? memberIdToOwnerName[currentUser] ?? '' : '';
  const [filter, setFilter] = useState<FilterType>('all');
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const baseActivities = showMineOnly && ownerName
    ? activities.filter((a) => a.actor === ownerName)
    : activities;

  const filteredActivities = filter === 'all'
    ? baseActivities
    : baseActivities.filter((a) => a.type === filter);

  const typeCounts: Record<string, number> = { all: baseActivities.length };
  for (const a of baseActivities) {
    typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
  }

  const myActivityCount = ownerName ? activities.filter((a) => a.actor === ownerName).length : 0;

  // Group activities by date
  const grouped: { label: string; items: Activity[] }[] = [];
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];
  const groupMap = new Map<string, Activity[]>();

  for (const a of filteredActivities) {
    const group = getDateGroup(a.timestamp);
    if (!groupMap.has(group)) groupMap.set(group, []);
    groupMap.get(group)!.push(a);
  }

  for (const label of groupOrder) {
    const items = groupMap.get(label);
    if (items && items.length > 0) {
      grouped.push({ label, items });
    }
  }

  // Sidebar stats
  const thisWeekActivities = activities.filter((a) => {
    const diffDays = Math.floor((new Date('2026-03-09T16:00:00Z').getTime() - new Date(a.timestamp).getTime()) / 86400000);
    return diffDays <= 6;
  });
  const tasksCompleted = thisWeekActivities.filter((a) => a.type === 'task' && (a.action.includes('completed') || a.action.includes('posted') || a.action.includes('started'))).length;
  const decisionsLogged = thisWeekActivities.filter((a) => a.type === 'decision').length;
  const okrUpdates = thisWeekActivities.filter((a) => a.type === 'okr').length;
  const notesCreated = thisWeekActivities.filter((a) => a.type === 'note').length;

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'task', label: 'Tasks' },
    { key: 'okr', label: 'OKRs' },
    { key: 'decision', label: 'Decisions' },
    { key: 'kpi', label: 'KPIs' },
    { key: 'team', label: 'Team' },
    { key: 'agent', label: 'Agents' },
    { key: 'note', label: 'Notes' },
  ];

  return (
    <div className="min-h-screen bg-background text-text p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-amber-400/10">
            <Activity className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-text">Activity Feed</h1>
        </div>
        <p className="text-text-muted ml-[52px]">
          Real-time pulse of what&apos;s happening across Amphibian Unite
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-text-muted mr-1" />
        {ownerName && (
          <button
            onClick={() => setShowMineOnly(!showMineOnly)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${showMineOnly
                ? 'bg-accent text-white border border-accent/40 shadow-lg shadow-accent/20'
                : 'bg-surface text-text-muted border border-border hover:bg-surface-2 hover:text-text'
              }
            `}
          >
            <UserCircle className="w-3.5 h-3.5" />
            My Activity
            <span
              className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${showMineOnly ? 'bg-white/20 text-white' : 'bg-white/5 text-text-muted'}
              `}
            >
              {myActivityCount}
            </span>
          </button>
        )}
        <div className="w-px h-5 bg-border mx-1" />
        {filterButtons.map((fb) => {
          const isActive = filter === fb.key;
          const count = typeCounts[fb.key] || 0;
          return (
            <button
              key={fb.key}
              onClick={() => setFilter(fb.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${isActive
                  ? 'bg-white/10 text-text border border-white/20'
                  : 'bg-surface text-text-muted border border-border hover:bg-surface-2 hover:text-text'
                }
              `}
            >
              {fb.label}
              <span
                className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${isActive ? 'bg-white/15 text-text' : 'bg-white/5 text-text-muted'}
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-8">
        {/* Main timeline */}
        <div className="flex-1 min-w-0">
          {grouped.map((group) => (
            <div key={group.label} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-4 h-4 text-text-muted" />
                <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
                  {group.label}
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="relative">
                {/* Timeline vertical line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

                <div className="space-y-1">
                  {group.items.map((activity) => {
                    const config = typeConfig[activity.type];
                    const IconComponent = config.icon;
                    const isExpanded = expandedId === activity.id;
                    const isYours = ownerName && activity.actor === ownerName;

                    return (
                      <div key={activity.id} className="relative pl-10">
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-[11px] top-4 w-[9px] h-[9px] rounded-full ${isYours ? 'bg-accent ring-accent/30' : config.dotColor} ring-2 ${isYours ? 'ring-accent/30' : 'ring-background'} z-10`}
                        />

                        {/* Activity card */}
                        <div
                          className={`
                            p-4 rounded-lg transition-colors cursor-pointer
                            ${isYours
                              ? 'bg-accent/5 border border-accent/20 hover:bg-accent/10'
                              : 'bg-surface border border-border hover:bg-surface-2'
                            }
                          `}
                          onClick={() =>
                            activity.details
                              ? setExpandedId(isExpanded ? null : activity.id)
                              : null
                          }
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`p-1.5 rounded-md ${config.bgColor} mt-0.5 shrink-0`}>
                                <IconComponent className={`w-3.5 h-3.5 ${config.color}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm">
                                  <span className={`font-semibold ${isYours ? 'text-accent' : 'text-text'}`}>
                                    {isYours ? 'You' : activity.actor}
                                  </span>{' '}
                                  <span className="text-text-muted">
                                    {activity.action}:
                                  </span>{' '}
                                  <span className="text-text">
                                    {activity.target}
                                  </span>
                                </p>
                                {isExpanded && activity.details && (
                                  <p className="mt-2 text-sm text-text-muted leading-relaxed border-l-2 border-border pl-3">
                                    {activity.details}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-text-muted whitespace-nowrap">
                                {getRelativeTime(activity.timestamp)}
                              </span>
                              {activity.details && (
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-text-muted transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="text-center py-16 text-text-muted">
              <Activity className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No activities match the current filter.</p>
            </div>
          )}
        </div>

        {/* Right sidebar summary */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-8 rounded-xl bg-surface border border-border p-5">
            <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              This Week
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-amber-400/10">
                    <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-sm text-text-muted">Tasks completed</span>
                </div>
                <span className="text-lg font-bold text-text">{tasksCompleted}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-rose-400/10">
                    <Scale className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <span className="text-sm text-text-muted">Decisions logged</span>
                </div>
                <span className="text-lg font-bold text-text">{decisionsLogged}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-400/10">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-text-muted">OKR updates</span>
                </div>
                <span className="text-lg font-bold text-text">{okrUpdates}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-sky-400/10">
                    <StickyNote className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <span className="text-sm text-text-muted">Notes created</span>
                </div>
                <span className="text-lg font-bold text-text">{notesCreated}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-text-muted">
                {activities.length} total activities tracked
              </p>
              <p className="text-xs text-text-muted mt-1">
                {thisWeekActivities.length} this week
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
