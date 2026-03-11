'use client';

import { useState, useMemo } from 'react';
import {
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckSquare,
  Scale,
  Target,
  StickyNote,
  CalendarClock,
  Users,
  Filter,
  Inbox,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Circle,
} from 'lucide-react';
import { teamMembers, memberIdToOwnerName } from '@/lib/data';

// ── Types ──────────────────────────────────────────────────

type ChangeCategory = 'tasks' | 'decisions' | 'okrs' | 'notes' | 'meetings' | 'team';
type ImpactLevel = 'high' | 'medium' | 'low';
type TimeGroup = 'today' | 'yesterday' | 'this-week' | 'last-week' | 'older';

interface ChangeItem {
  id: string;
  title: string;
  detail: string;
  category: ChangeCategory;
  impact: ImpactLevel;
  timestamp: Date;
  actor: string;        // team member id who made the change
  relatedUsers: string[]; // team member ids this change is relevant to
}

// ── Category Config ────────────────────────────────────────

const categoryConfig: Record<ChangeCategory, {
  label: string;
  icon: typeof CheckSquare;
  tint: string;
  bgTint: string;
  borderTint: string;
  dotColor: string;
}> = {
  tasks: {
    label: 'Tasks',
    icon: CheckSquare,
    tint: 'text-blue-400',
    bgTint: 'bg-blue-500/10',
    borderTint: 'border-blue-500/30',
    dotColor: 'bg-blue-400',
  },
  decisions: {
    label: 'Decisions',
    icon: Scale,
    tint: 'text-purple-400',
    bgTint: 'bg-purple-500/10',
    borderTint: 'border-purple-500/30',
    dotColor: 'bg-purple-400',
  },
  okrs: {
    label: 'OKRs',
    icon: Target,
    tint: 'text-teal-400',
    bgTint: 'bg-teal-500/10',
    borderTint: 'border-teal-500/30',
    dotColor: 'bg-teal-400',
  },
  notes: {
    label: 'Notes',
    icon: StickyNote,
    tint: 'text-yellow-400',
    bgTint: 'bg-yellow-500/10',
    borderTint: 'border-yellow-500/30',
    dotColor: 'bg-yellow-400',
  },
  meetings: {
    label: 'Meetings',
    icon: CalendarClock,
    tint: 'text-indigo-400',
    bgTint: 'bg-indigo-500/10',
    borderTint: 'border-indigo-500/30',
    dotColor: 'bg-indigo-400',
  },
  team: {
    label: 'Team',
    icon: Users,
    tint: 'text-green-400',
    bgTint: 'bg-green-500/10',
    borderTint: 'border-green-500/30',
    dotColor: 'bg-green-400',
  },
};

const impactConfig: Record<ImpactLevel, { label: string; color: string; dotColor: string }> = {
  high: { label: 'High Impact', color: 'text-rose-400', dotColor: 'bg-rose-400' },
  medium: { label: 'Medium Impact', color: 'text-amber-400', dotColor: 'bg-amber-400' },
  low: { label: 'Low Impact', color: 'text-slate-400', dotColor: 'bg-slate-500' },
};

const timeGroupLabels: Record<TimeGroup, string> = {
  'today': 'Today',
  'yesterday': 'Yesterday',
  'this-week': 'This Week',
  'last-week': 'Last Week',
  'older': 'Older',
};

// ── Helpers ────────────────────────────────────────────────

const getMember = (id: string) => teamMembers.find((m) => m.id === id);
const getDisplayName = (id: string) => memberIdToOwnerName[id] ?? id;

function getTimeGroup(date: Date, now: Date): TimeGroup {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const dayOfWeek = now.getDay();
  const startOfThisWeek = new Date(startOfToday);
  startOfThisWeek.setDate(startOfThisWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  if (date >= startOfToday) return 'today';
  if (date >= startOfYesterday) return 'yesterday';
  if (date >= startOfThisWeek) return 'this-week';
  if (date >= startOfLastWeek) return 'last-week';
  return 'older';
}

function formatTimestamp(date: Date, now: Date): string {
  const group = getTimeGroup(date, now);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (group === 'today') return time;
  if (group === 'yesterday') return `Yesterday ${time}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` ${time}`;
}

// ── Mock Data ─────────────────────────────────────────────

function generateMockChanges(): ChangeItem[] {
  const now = new Date();

  const hoursAgo = (h: number): Date => {
    const d = new Date(now);
    d.setHours(d.getHours() - h);
    return d;
  };

  const daysAgo = (d: number, hour: number = 14): Date => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  return [
    // Today
    {
      id: 'c-01',
      title: 'Risk dashboard v1 position sizing module deployed to staging',
      detail: 'Position sizing module is now 85% complete. Concentration metric and drawdown limits added. Ready for internal review by EOD.',
      category: 'tasks',
      impact: 'high',
      timestamp: hoursAgo(1),
      actor: 'timon',
      relatedUsers: ['timon', 'ty', 'ross', 'james'],
    },
    {
      id: 'c-02',
      title: 'Approved multi-modal architecture for regime classifier',
      detail: 'Decision made during Engineering Sprint Review. Will combine on-chain metrics, sentiment data, and macro indicators. Timon leading implementation with target delivery Q3.',
      category: 'decisions',
      impact: 'high',
      timestamp: hoursAgo(2),
      actor: 'james',
      relatedUsers: ['james', 'timon', 'ty', 'andrew'],
    },
    {
      id: 'c-03',
      title: 'BTC Alpha KR updated: yield source mapping at 75%',
      detail: 'Ross mapped 9 of 12 BTC yield sources with bps attribution. Remaining 3 (cross-chain arb, liquidation, MEV) need A9 input.',
      category: 'okrs',
      impact: 'medium',
      timestamp: hoursAgo(3),
      actor: 'ross',
      relatedUsers: ['ross', 'ty', 'james'],
    },
    {
      id: 'c-04',
      title: 'Weekly IC Portfolio Memo published',
      detail: 'Covers BTC Alpha performance, A9 concentration risk review, and Dynamic Alpha sleeve evaluation status. Circulated to full investment team.',
      category: 'notes',
      impact: 'medium',
      timestamp: hoursAgo(4),
      actor: 'ty',
      relatedUsers: ['ty', 'ross', 'james', 'todd', 'sahir'],
    },
    {
      id: 'c-05',
      title: 'COO candidate pipeline reviewed with search firm',
      detail: '3 new candidates identified with crypto fund ops background ($200M+ AUM). First interviews scheduled for next week.',
      category: 'team',
      impact: 'high',
      timestamp: hoursAgo(5),
      actor: 'james',
      relatedUsers: ['james', 'david', 'thao'],
    },
    {
      id: 'c-06',
      title: 'LP quarterly update meeting scheduled for March 20',
      detail: 'Carson Group follow-up confirmed. Deck updated with Q1 performance data and risk framework overview. Todd to lead presentation.',
      category: 'meetings',
      impact: 'high',
      timestamp: hoursAgo(6),
      actor: 'todd',
      relatedUsers: ['todd', 'james', 'mark', 'paola'],
    },

    // Yesterday
    {
      id: 'c-07',
      title: 'A9 track record verification Phase 1 completed',
      detail: 'Historical returns verified against prime broker records. Clean result across all periods. Moving to Phase 2: operational due diligence documentation.',
      category: 'tasks',
      impact: 'high',
      timestamp: daysAgo(1, 17),
      actor: 'ross',
      relatedUsers: ['ross', 'ty', 'james', 'andrew'],
    },
    {
      id: 'c-08',
      title: 'Set risk dashboard v1 launch date: April 15',
      detail: 'Decided during Engineering Sprint Review. Timon to complete position sizing module by April 8. QA window: April 8-15.',
      category: 'decisions',
      impact: 'high',
      timestamp: daysAgo(1, 16),
      actor: 'james',
      relatedUsers: ['james', 'timon', 'ty', 'ross'],
    },
    {
      id: 'c-09',
      title: 'Added 15 new managers to strategy performance database',
      detail: 'Focus on market-neutral and relative value strategies for Dynamic Alpha sleeve evaluation. Database now at 815+ managers tracked.',
      category: 'tasks',
      impact: 'medium',
      timestamp: daysAgo(1, 15),
      actor: 'sahir',
      relatedUsers: ['sahir', 'ty', 'ross'],
    },
    {
      id: 'c-10',
      title: 'Weekly cash forecast published: 14-month runway confirmed',
      detail: 'Current burn rate sustainable. Revenue tracking at $1.7M run rate. No changes to budget assumptions needed this cycle.',
      category: 'notes',
      impact: 'medium',
      timestamp: daysAgo(1, 10),
      actor: 'mark',
      relatedUsers: ['mark', 'james', 'todd'],
    },
    {
      id: 'c-11',
      title: 'Dynamic Alpha OKR key result updated: structure 60% finalized',
      detail: 'Sleeve architecture decision narrowed to 2 options. GP capital deployment target set for Q3. James and Andrew aligning on final structure.',
      category: 'okrs',
      impact: 'medium',
      timestamp: daysAgo(1, 14),
      actor: 'james',
      relatedUsers: ['james', 'andrew', 'ross', 'ty'],
    },

    // This week
    {
      id: 'c-12',
      title: 'A9 concentration risk flagged: 45% of BTC Alpha exposure',
      detail: 'Above the 40% single-manager limit. Ty reviewing rebalancing options with Ross. Action required before next IC meeting.',
      category: 'decisions',
      impact: 'high',
      timestamp: daysAgo(3, 15),
      actor: 'ty',
      relatedUsers: ['ty', 'ross', 'james'],
    },
    {
      id: 'c-13',
      title: 'SMA infrastructure PB evaluation delayed 1 week',
      detail: 'Prime broker evaluation pushed due to documentation requirements. Andrew coordinating with legal team. New target: end of month.',
      category: 'tasks',
      impact: 'medium',
      timestamp: daysAgo(3, 11),
      actor: 'andrew',
      relatedUsers: ['andrew', 'ross', 'timon'],
    },
    {
      id: 'c-14',
      title: 'Paola secured meeting with institutional allocator',
      detail: 'Top-20 crypto fund allocator agreed to introductory call. Focus on Dynamic Alpha product positioning. Meeting next Tuesday.',
      category: 'meetings',
      impact: 'high',
      timestamp: daysAgo(2, 16),
      actor: 'paola',
      relatedUsers: ['paola', 'james', 'todd'],
    },
    {
      id: 'c-15',
      title: 'Thao shipped investor ops SLA tracking dashboard',
      detail: 'Real-time tracking of response times, statement delivery, and redemption processing. First SLA report generated automatically.',
      category: 'tasks',
      impact: 'medium',
      timestamp: daysAgo(2, 14),
      actor: 'thao',
      relatedUsers: ['thao', 'todd', 'james'],
    },
    {
      id: 'c-16',
      title: 'Board governance review meeting completed',
      detail: 'David led quarterly governance review. All action items from last quarter closed. New decision rights matrix approved for Dynamic Alpha launch.',
      category: 'meetings',
      impact: 'high',
      timestamp: daysAgo(4, 10),
      actor: 'david',
      relatedUsers: ['david', 'james', 'andrew', 'todd'],
    },

    // Last week
    {
      id: 'c-17',
      title: 'Regime classifier architecture document drafted',
      detail: 'Timon published initial architecture for multi-modal regime classifier. Uses on-chain flow data, volatility surface, and macro indicators. Under review.',
      category: 'notes',
      impact: 'high',
      timestamp: daysAgo(8, 16),
      actor: 'timon',
      relatedUsers: ['timon', 'ty', 'james'],
    },
    {
      id: 'c-18',
      title: 'Hiring OKR updated: COO JD posted to 3 search firms',
      detail: 'Crypto fund ops experience ($200M+ AUM) is a hard requirement. Added digital asset compliance background as strongly preferred.',
      category: 'okrs',
      impact: 'medium',
      timestamp: daysAgo(9, 11),
      actor: 'james',
      relatedUsers: ['james', 'david'],
    },
    {
      id: 'c-19',
      title: 'LP deck updated with Q1 performance data',
      detail: 'Ready for Carson Group follow-up meeting. Includes risk framework overview and BTC Alpha attribution breakdown.',
      category: 'tasks',
      impact: 'medium',
      timestamp: daysAgo(10, 17),
      actor: 'todd',
      relatedUsers: ['todd', 'james', 'mark'],
    },

    // Older
    {
      id: 'c-20',
      title: 'Edge rating baseline assessment published: 5.1/10',
      detail: 'Andrew completed 8-agent product strategy assessment. Process (3/10), Data (6/10), Relationships (5/10). Path to 7.0 defined with 4 key milestones.',
      category: 'notes',
      impact: 'high',
      timestamp: daysAgo(15, 14),
      actor: 'andrew',
      relatedUsers: ['andrew', 'james', 'ty', 'timon'],
    },
    {
      id: 'c-21',
      title: 'Team offsite action items documented and assigned',
      detail: '12 action items from strategic offsite. All assigned with owners, deadlines, and definitions of done. Tracked in 90-day plan.',
      category: 'team',
      impact: 'medium',
      timestamp: daysAgo(18, 16),
      actor: 'james',
      relatedUsers: ['james', 'david', 'mark', 'todd', 'andrew', 'ty', 'ross', 'thao', 'timon', 'sahir', 'paola'],
    },
  ];
}

// ── Component ──────────────────────────────────────────────

export function WhatChangedView({ currentUser = 'james' }: { currentUser?: string }) {
  const [categoryFilter, setCategoryFilter] = useState<ChangeCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<TimeGroup>>(new Set());

  const now = useMemo(() => new Date(), []);
  const allChanges = useMemo(() => generateMockChanges(), []);

  // Filter changes
  const filteredChanges = useMemo(() => {
    let changes = allChanges;

    if (categoryFilter !== 'all') {
      changes = changes.filter((c) => c.category === categoryFilter);
    }

    if (viewMode === 'mine') {
      changes = changes.filter(
        (c) => c.actor === currentUser || c.relatedUsers.includes(currentUser)
      );
    }

    return changes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [allChanges, categoryFilter, viewMode, currentUser]);

  // Group changes by time
  const groupedChanges = useMemo(() => {
    const groups: Record<TimeGroup, ChangeItem[]> = {
      'today': [],
      'yesterday': [],
      'this-week': [],
      'last-week': [],
      'older': [],
    };

    filteredChanges.forEach((c) => {
      const group = getTimeGroup(c.timestamp, now);
      groups[group].push(c);
    });

    return groups;
  }, [filteredChanges, now]);

  // Summary stats
  const todayCount = groupedChanges['today'].length;
  const thisWeekCount = todayCount + groupedChanges['yesterday'].length + groupedChanges['this-week'].length;
  const highImpactCount = filteredChanges.filter((c) => c.impact === 'high').length;
  const myRelevantCount = allChanges.filter(
    (c) => c.actor === currentUser || c.relatedUsers.includes(currentUser)
  ).length;

  // Category counts for filter chips
  const categoryCounts = useMemo(() => {
    const base = viewMode === 'mine'
      ? allChanges.filter((c) => c.actor === currentUser || c.relatedUsers.includes(currentUser))
      : allChanges;
    const counts: Record<string, number> = { all: base.length };
    (Object.keys(categoryConfig) as ChangeCategory[]).forEach((cat) => {
      counts[cat] = base.filter((c) => c.category === cat).length;
    });
    return counts;
  }, [allChanges, viewMode, currentUser]);

  const toggleGroup = (group: TimeGroup) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const isRelevantToUser = (change: ChangeItem) =>
    change.actor === currentUser || change.relatedUsers.includes(currentUser);

  const timeGroupOrder: TimeGroup[] = ['today', 'yesterday', 'this-week', 'last-week', 'older'];

  const userName = getDisplayName(currentUser);

  // Check if there are no changes at all after filtering
  const hasNoResults = filteredChanges.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Clock className="w-7 h-7 text-teal-400" />
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">What Changed</span>
            </h1>
          </div>
          <p className="text-text-secondary text-sm mt-1 max-w-xl">
            Daily digest of everything that happened. Personalized for {getMember(currentUser)?.name ?? userName}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted bg-white/5 border border-white/10 rounded-lg px-3 py-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Live &middot; {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* ── Summary Card ── */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Today</span>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-2xl font-bold text-text-primary">{todayCount}</p>
              <span className="text-xs text-text-muted">changes</span>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">This Week</span>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-2xl font-bold text-text-primary">{thisWeekCount}</p>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">High Impact</span>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-2xl font-bold text-rose-400">{highImpactCount}</p>
              {highImpactCount > 3 && <ArrowDownRight className="w-4 h-4 text-rose-400" />}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Relevant to You</span>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-2xl font-bold text-teal-400">{myRelevantCount}</p>
              <span className="text-xs text-text-muted">of {allChanges.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls: View Toggle + Filter Chips ── */}
      <div className="space-y-3">
        {/* View toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === 'all'
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              All Changes
            </button>
            <button
              onClick={() => setViewMode('mine')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === 'mine'
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              My Changes
            </button>
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 text-text-muted">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-xs">{filteredChanges.length} results</span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
              categoryFilter === 'all'
                ? 'bg-white/10 border-white/20 text-text-primary'
                : 'border-white/5 text-text-muted hover:border-white/15 hover:text-text-secondary'
            }`}
          >
            All ({categoryCounts.all})
          </button>
          {(Object.keys(categoryConfig) as ChangeCategory[]).map((cat) => {
            const config = categoryConfig[cat];
            const Icon = config.icon;
            const count = categoryCounts[cat] ?? 0;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  categoryFilter === cat
                    ? `${config.bgTint} ${config.borderTint} ${config.tint}`
                    : 'border-white/5 text-text-muted hover:border-white/15 hover:text-text-secondary'
                }`}
              >
                <Icon className="w-3 h-3" />
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Empty State ── */}
      {hasNoResults && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Inbox className="w-8 h-8 text-text-muted" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No changes found</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            {viewMode === 'mine'
              ? `No changes related to ${userName} match the current filters. Try switching to "All Changes" or adjusting the category filter.`
              : 'No changes match the current filters. Try selecting a different category or resetting filters.'}
          </p>
          <button
            onClick={() => { setCategoryFilter('all'); setViewMode('all'); }}
            className="mt-4 px-4 py-2 text-xs font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-lg hover:bg-teal-500/20 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── Time-Grouped Changes ── */}
      {!hasNoResults && (
        <div className="space-y-4">
          {timeGroupOrder.map((group) => {
            const items = groupedChanges[group];
            if (items.length === 0) return null;

            const isCollapsed = collapsedGroups.has(group);
            const groupHighImpact = items.filter((i) => i.impact === 'high').length;

            return (
              <div
                key={group}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-fade-in"
              >
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {timeGroupLabels[group]}
                    </h3>
                    <span className="text-xs font-mono text-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                      {items.length} change{items.length !== 1 ? 's' : ''}
                    </span>
                    {groupHighImpact > 0 && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        {groupHighImpact} high impact
                      </span>
                    )}
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  )}
                </button>

                {/* Group items */}
                {!isCollapsed && (
                  <div className="border-t border-white/5">
                    <div className="divide-y divide-white/5">
                      {items.map((change) => {
                        const catConfig = categoryConfig[change.category];
                        const CatIcon = catConfig.icon;
                        const impactCfg = impactConfig[change.impact];
                        const actorMember = getMember(change.actor);
                        const relevant = isRelevantToUser(change);

                        return (
                          <div
                            key={change.id}
                            className={`p-4 hover:bg-white/[0.02] transition-colors relative ${
                              relevant ? 'border-l-2 border-l-teal-500/60' : 'border-l-2 border-l-transparent'
                            }`}
                          >
                            {/* Teal glow for relevant items */}
                            {relevant && (
                              <div className="absolute inset-0 bg-teal-500/[0.03] pointer-events-none rounded-r" />
                            )}

                            <div className="flex items-start gap-3 relative">
                              {/* Category icon */}
                              <div className={`w-8 h-8 rounded-lg ${catConfig.bgTint} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <CatIcon className={`w-4 h-4 ${catConfig.tint}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-medium text-text-primary leading-snug">
                                        {change.title}
                                      </span>
                                      {relevant && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-teal-500/15 text-teal-400 border border-teal-500/30 flex-shrink-0">
                                          Relevant
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-text-secondary leading-relaxed mt-1">
                                      {change.detail}
                                    </p>
                                  </div>
                                </div>

                                {/* Meta row */}
                                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                                  {/* Actor avatar */}
                                  {actorMember && (
                                    <div className="flex items-center gap-1.5">
                                      <div className={`w-5 h-5 rounded-md ${actorMember.color} flex items-center justify-center text-white text-[8px] font-bold`}>
                                        {actorMember.avatar}
                                      </div>
                                      <span className="text-xs text-text-muted">{actorMember.name.split(' ')[0]}</span>
                                    </div>
                                  )}

                                  {/* Divider */}
                                  <div className="h-3 w-px bg-white/10" />

                                  {/* Category badge */}
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${catConfig.bgTint} ${catConfig.tint} border ${catConfig.borderTint}`}>
                                    <CatIcon className="w-2.5 h-2.5" />
                                    {catConfig.label}
                                  </span>

                                  {/* Impact dot */}
                                  <div className="flex items-center gap-1">
                                    <Circle className={`w-2 h-2 fill-current ${impactCfg.color}`} />
                                    <span className={`text-[10px] ${impactCfg.color}`}>{impactCfg.label}</span>
                                  </div>

                                  {/* Divider */}
                                  <div className="h-3 w-px bg-white/10" />

                                  {/* Timestamp */}
                                  <span className="text-[10px] text-text-muted font-mono">
                                    {formatTimestamp(change.timestamp, now)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Legend ── */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-text-muted">
          <span className="font-semibold uppercase tracking-wider text-text-secondary">Legend:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-teal-500/60 rounded" />
            <span>Relevant to you</span>
          </div>
          {Object.entries(impactConfig).map(([level, cfg]) => (
            <div key={level} className="flex items-center gap-1">
              <Circle className={`w-2 h-2 fill-current ${cfg.color}`} />
              <span>{cfg.label}</span>
            </div>
          ))}
          <div className="h-3 w-px bg-white/10" />
          {(Object.keys(categoryConfig) as ChangeCategory[]).map((cat) => {
            const cfg = categoryConfig[cat];
            const Icon = cfg.icon;
            return (
              <div key={cat} className="flex items-center gap-1">
                <Icon className={`w-2.5 h-2.5 ${cfg.tint}`} />
                <span>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
