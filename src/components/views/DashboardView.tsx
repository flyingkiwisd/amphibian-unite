'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Star,
  Target,
  CheckCircle2,
  MinusCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Calendar,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  Users,
  Map,
  ClipboardCheck,
  RefreshCw,
  CheckSquare,
  Shield,
  Gauge,
  Flame,
  ChevronRight,
} from 'lucide-react';
import {
  teamMembers,
  okrs,
  kpis,
  memberIdToOwnerName,
} from '@/lib/data';
import { useEditableStore } from '@/lib/useEditableStore';
import { InlineText, InlineSelect, EditBanner } from '@/components/InlineEdit';

// ── Types ──────────────────────────────────────────────────

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  currentUser: string;
}

type CommitmentStatus = 'pending' | 'completed' | 'missed' | 'partial';

interface Commitment {
  id: string;
  text: string;
  status: CommitmentStatus;
}

interface DayEntry {
  date: string;
  commitments: Commitment[];
}

interface MemberAccountabilityData {
  [memberId: string]: {
    entries: DayEntry[];
  };
}

interface PersonalKPI {
  id: string;
  text: string;
  status: 'on-track' | 'at-risk' | 'behind';
  notes: string;
}

interface OwnershipArea {
  id: string;
  text: string;
  status: 'on-track' | 'needs-attention' | 'blocked';
  notes: string;
}

interface DashboardPersonalData {
  kpis: PersonalKPI[];
  ownership: OwnershipArea[];
}

interface WeeklyGoal {
  id: string;
  text: string;
  status: CommitmentStatus;
}

interface WeeklyData {
  goals: WeeklyGoal[];
}

interface MonthlyGoal {
  id: string;
  text: string;
  status: CommitmentStatus;
}

interface MonthlyData {
  goals: MonthlyGoal[];
}

type FocusTab = 'today' | 'week' | 'month';

// ── Helpers ────────────────────────────────────────────────

const LS_KEY = 'amphibian-accountability';

const todayStr = () => new Date().toISOString().split('T')[0];

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const getGreeting = (firstName: string) => {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${firstName}`;
  if (hour < 17) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
};

const getWeekDates = (): string[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const getWeekStart = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  return monday.toISOString().split('T')[0];
};

const getYearMonth = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getMonthLabel = (): string => {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const getWeekLabel = (): string => {
  const dates = getWeekDates();
  const start = new Date(dates[0] + 'T12:00:00');
  const end = new Date(dates[6] + 'T12:00:00');
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startStr} – ${endStr}`;
};

const dayLabel = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getHitRate = (entry: DayEntry | undefined): number => {
  if (!entry || entry.commitments.length === 0) return 0;
  const completed = entry.commitments.filter((c) => c.status === 'completed').length;
  const partial = entry.commitments.filter((c) => c.status === 'partial').length;
  return Math.round(((completed + partial * 0.5) / entry.commitments.length) * 100);
};

const commitStatusIcon = (status: CommitmentStatus) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'partial': return <MinusCircle className="w-4 h-4 text-amber-400" />;
    case 'missed': return <XCircle className="w-4 h-4 text-rose-400" />;
    default: return <Clock className="w-4 h-4 text-text-muted" />;
  }
};

const kpiStatusColor = (status: string) => {
  switch (status) {
    case 'on-track': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'at-risk': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'behind': return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    case 'needs-attention': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'blocked': return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    default: return 'bg-white/10 text-text-muted';
  }
};

const kpiStatusOptions = [
  { label: 'On Track', value: 'on-track', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  { label: 'At Risk', value: 'at-risk', color: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  { label: 'Behind', value: 'behind', color: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' },
];

const ownershipStatusOptions = [
  { label: 'On Track', value: 'on-track', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  { label: 'Needs Attention', value: 'needs-attention', color: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  { label: 'Blocked', value: 'blocked', color: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' },
];

const okrStatusColor = (status: string) => {
  switch (status) {
    case 'on-track': return 'bg-success/20 text-success';
    case 'at-risk': return 'bg-warning/20 text-warning';
    case 'behind': return 'bg-danger/20 text-danger';
    default: return 'bg-text-muted/20 text-text-muted';
  }
};

const okrStatusLabel = (status: string) => {
  switch (status) {
    case 'on-track': return 'On Track';
    case 'at-risk': return 'At Risk';
    case 'behind': return 'Behind';
    default: return status;
  }
};

const okrBarColor = (status: string) => {
  switch (status) {
    case 'on-track': return '#22c55e';
    case 'at-risk': return '#eab308';
    default: return '#ef4444';
  }
};

// ── Quick Actions ──────────────────────────────────────────

const quickActions = [
  { label: 'OKRs & KPIs', icon: Target, view: 'okrs' },
  { label: 'Tasks', icon: CheckSquare, view: 'tasks' },
  { label: 'Accountability', icon: ClipboardCheck, view: 'accountability' },
  { label: 'What Changed', icon: RefreshCw, view: 'what-changed' },
  { label: 'Team', icon: Users, view: 'team' },
  { label: 'Roadmap', icon: Map, view: 'roadmap' },
];

// ── Component ──────────────────────────────────────────────

export function DashboardView({ onNavigate, currentUser }: DashboardViewProps) {
  const member = teamMembers.find((m) => m.id === currentUser) ?? teamMembers[0];
  const ownerName = memberIdToOwnerName[currentUser] ?? member.name.split(' ')[0];
  const firstName = member.name.split(' ')[0];
  const today = new Date();

  // ── Focus tab state ──
  const [focusTab, setFocusTab] = useState<FocusTab>('today');

  // ── Accountability data (shared store) ──
  const [acctData, setAcctData] = useState<MemberAccountabilityData>({});
  const [newCommitment, setNewCommitment] = useState('');
  const [editingCommitmentId, setEditingCommitmentId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setAcctData(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveAcctData = (next: MemberAccountabilityData) => {
    setAcctData(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const todayDate = todayStr();
  const memberEntries = acctData[currentUser]?.entries ?? [];
  const todayEntry = memberEntries.find((e) => e.date === todayDate);
  const todayCommitments = todayEntry?.commitments ?? [];
  const todayHitRate = getHitRate(todayEntry);

  const weekDates = useMemo(() => getWeekDates(), []);

  // ── Streak calculation ──
  const streak = useMemo(() => {
    let count = 0;
    const sorted = [...memberEntries].sort((a, b) => b.date.localeCompare(a.date));
    for (const entry of sorted) {
      if (entry.commitments.length > 0 && getHitRate(entry) >= 50) count++;
      else break;
    }
    return count;
  }, [memberEntries]);

  // ── Weekly goals (localStorage) ──
  const weekStart = useMemo(() => getWeekStart(), []);
  const weekLsKey = `amphibian-dashboard-week-${currentUser}-${weekStart}`;
  const [weeklyData, setWeeklyDataState] = useState<WeeklyData>({ goals: [] });
  const [newWeeklyGoal, setNewWeeklyGoal] = useState('');
  const [editingWeeklyGoalId, setEditingWeeklyGoalId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(weekLsKey);
      if (stored) setWeeklyDataState(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [weekLsKey]);

  const saveWeeklyData = (next: WeeklyData) => {
    setWeeklyDataState(next);
    try { localStorage.setItem(weekLsKey, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const addWeeklyGoal = () => {
    if (!newWeeklyGoal.trim()) return;
    const goal: WeeklyGoal = { id: `wg-${Date.now()}`, text: newWeeklyGoal.trim(), status: 'pending' };
    saveWeeklyData({ goals: [...weeklyData.goals, goal] });
    setNewWeeklyGoal('');
  };

  const cycleWeeklyGoalStatus = (goalId: string) => {
    const statusCycle: CommitmentStatus[] = ['pending', 'completed', 'partial', 'missed'];
    const goals = weeklyData.goals.map((g) => {
      if (g.id !== goalId) return g;
      const currentIdx = statusCycle.indexOf(g.status);
      return { ...g, status: statusCycle[(currentIdx + 1) % statusCycle.length] };
    });
    saveWeeklyData({ goals });
  };

  const removeWeeklyGoal = (goalId: string) => {
    saveWeeklyData({ goals: weeklyData.goals.filter((g) => g.id !== goalId) });
  };

  const updateWeeklyGoalText = (goalId: string, newText: string) => {
    if (!newText.trim()) {
      setEditingWeeklyGoalId(null);
      return;
    }
    const goals = weeklyData.goals.map((g) =>
      g.id === goalId ? { ...g, text: newText.trim() } : g
    );
    saveWeeklyData({ goals });
    setEditingWeeklyGoalId(null);
  };

  // ── Weekly summary stats ──
  const weeklyCompletionRate = useMemo(() => {
    if (weeklyData.goals.length === 0) return 0;
    const completed = weeklyData.goals.filter((g) => g.status === 'completed').length;
    const partial = weeklyData.goals.filter((g) => g.status === 'partial').length;
    return Math.round(((completed + partial * 0.5) / weeklyData.goals.length) * 100);
  }, [weeklyData.goals]);

  // ── Monthly goals (localStorage) ──
  const yearMonth = useMemo(() => getYearMonth(), []);
  const monthLsKey = `amphibian-dashboard-month-${currentUser}-${yearMonth}`;
  const [monthlyData, setMonthlyDataState] = useState<MonthlyData>({ goals: [] });
  const [newMonthlyGoal, setNewMonthlyGoal] = useState('');
  const [editingMonthlyGoalId, setEditingMonthlyGoalId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(monthLsKey);
      if (stored) setMonthlyDataState(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [monthLsKey]);

  const saveMonthlyData = (next: MonthlyData) => {
    setMonthlyDataState(next);
    try { localStorage.setItem(monthLsKey, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const addMonthlyGoal = () => {
    if (!newMonthlyGoal.trim()) return;
    const goal: MonthlyGoal = { id: `mg-${Date.now()}`, text: newMonthlyGoal.trim(), status: 'pending' };
    saveMonthlyData({ goals: [...monthlyData.goals, goal] });
    setNewMonthlyGoal('');
  };

  const cycleMonthlyGoalStatus = (goalId: string) => {
    const statusCycle: CommitmentStatus[] = ['pending', 'completed', 'partial', 'missed'];
    const goals = monthlyData.goals.map((g) => {
      if (g.id !== goalId) return g;
      const currentIdx = statusCycle.indexOf(g.status);
      return { ...g, status: statusCycle[(currentIdx + 1) % statusCycle.length] };
    });
    saveMonthlyData({ goals });
  };

  const removeMonthlyGoal = (goalId: string) => {
    saveMonthlyData({ goals: monthlyData.goals.filter((g) => g.id !== goalId) });
  };

  const updateMonthlyGoalText = (goalId: string, newText: string) => {
    if (!newText.trim()) {
      setEditingMonthlyGoalId(null);
      return;
    }
    const goals = monthlyData.goals.map((g) =>
      g.id === goalId ? { ...g, text: newText.trim() } : g
    );
    saveMonthlyData({ goals });
    setEditingMonthlyGoalId(null);
  };

  // ── Monthly summary stats ──
  const monthlyCompletionRate = useMemo(() => {
    if (monthlyData.goals.length === 0) return 0;
    const completed = monthlyData.goals.filter((g) => g.status === 'completed').length;
    const partial = monthlyData.goals.filter((g) => g.status === 'partial').length;
    return Math.round(((completed + partial * 0.5) / monthlyData.goals.length) * 100);
  }, [monthlyData.goals]);

  // ── Commitment handlers ──
  const addCommitment = () => {
    if (!newCommitment.trim()) return;
    const next = { ...acctData };
    if (!next[currentUser]) next[currentUser] = { entries: [] };
    const entries = [...next[currentUser].entries];
    const idx = entries.findIndex((e) => e.date === todayDate);
    const commitment: Commitment = { id: `c-${Date.now()}`, text: newCommitment.trim(), status: 'pending' };
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], commitments: [...entries[idx].commitments, commitment] };
    } else {
      entries.push({ date: todayDate, commitments: [commitment] });
    }
    next[currentUser] = { entries };
    saveAcctData(next);
    setNewCommitment('');
  };

  const cycleStatus = (commitmentId: string) => {
    const statusCycle: CommitmentStatus[] = ['pending', 'completed', 'partial', 'missed'];
    const next = { ...acctData };
    const entries = [...(next[currentUser]?.entries ?? [])];
    const idx = entries.findIndex((e) => e.date === todayDate);
    if (idx < 0) return;
    const commitments = entries[idx].commitments.map((c) => {
      if (c.id !== commitmentId) return c;
      const currentIdx = statusCycle.indexOf(c.status);
      return { ...c, status: statusCycle[(currentIdx + 1) % statusCycle.length] };
    });
    entries[idx] = { ...entries[idx], commitments };
    next[currentUser] = { entries };
    saveAcctData(next);
  };

  const removeCommitment = (commitmentId: string) => {
    const next = { ...acctData };
    const entries = [...(next[currentUser]?.entries ?? [])];
    const idx = entries.findIndex((e) => e.date === todayDate);
    if (idx < 0) return;
    entries[idx] = { ...entries[idx], commitments: entries[idx].commitments.filter((c) => c.id !== commitmentId) };
    next[currentUser] = { entries };
    saveAcctData(next);
  };

  const updateCommitmentText = (commitmentId: string, newText: string) => {
    if (!newText.trim()) {
      setEditingCommitmentId(null);
      return;
    }
    const next = { ...acctData };
    const entries = [...(next[currentUser]?.entries ?? [])];
    const idx = entries.findIndex((e) => e.date === todayDate);
    if (idx < 0) return;
    entries[idx] = {
      ...entries[idx],
      commitments: entries[idx].commitments.map((c) =>
        c.id === commitmentId ? { ...c, text: newText.trim() } : c
      ),
    };
    next[currentUser] = { entries };
    saveAcctData(next);
    setEditingCommitmentId(null);
  };

  // ── Editable personal data (KPIs + Ownership) ──
  const defaultPersonalData: DashboardPersonalData = {
    kpis: member.kpis.map((kpi, i) => ({ id: `kpi-${i}`, text: kpi, status: 'on-track' as const, notes: '' })),
    ownership: member.singleThreadedOwnership.map((area, i) => ({ id: `own-${i}`, text: area, status: 'on-track' as const, notes: '' })),
  };

  const { data: personalData, setData: setPersonalData, hasEdits, resetAll } =
    useEditableStore<DashboardPersonalData>(`amphibian-dashboard-personal-${currentUser}`, defaultPersonalData);

  // ── Filtered OKRs ──
  const myOkrs = useMemo(() => {
    return okrs
      .map((okr) => ({
        ...okr,
        myKeyResults: okr.keyResults.filter((kr) => kr.owner === ownerName),
      }))
      .filter((okr) => okr.myKeyResults.length > 0);
  }, [ownerName]);

  // ── KPI/Ownership update helpers ──
  const updateKPI = (id: string, field: keyof PersonalKPI, value: string) => {
    setPersonalData((prev) => ({
      ...prev,
      kpis: prev.kpis.map((k) => (k.id === id ? { ...k, [field]: value } : k)),
    }));
  };

  const updateOwnership = (id: string, field: keyof OwnershipArea, value: string) => {
    setPersonalData((prev) => ({
      ...prev,
      ownership: prev.ownership.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
    }));
  };

  // ── Company KPIs (condensed) ──
  const companyKpis = kpis.slice(0, 3); // AUM, Edge Rating, BTC Alpha

  return (
    <div className="space-y-6 animate-fade-in">
      <EditBanner hasEdits={hasEdits} onReset={resetAll} />

      {/* ════════════ Section 1: Personal Hero ════════════ */}
      <div className="relative bg-surface border border-border rounded-xl p-6 lg:p-8 overflow-hidden">
        {/* Gradient accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 via-teal-500 to-blue-500" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${member.color} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
              {member.avatar}
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
                {getGreeting(firstName)}
              </h1>
              <p className="text-text-secondary text-sm mt-0.5 max-w-lg">{member.roleOneSentence}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-text-muted text-sm font-mono">{formatDate(today)}</p>
            {streak > 0 && (
              <div className="flex items-center gap-1 justify-end mt-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">{streak}-day streak</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════ Section 2: Your Focus (Tabbed) ════════════ */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: '75ms' }}>
        {/* Tab bar */}
        <div className="flex items-center gap-1 p-2 border-b border-border bg-surface-2/30">
          {[
            { key: 'today' as FocusTab, label: 'Today', icon: Calendar },
            { key: 'week' as FocusTab, label: 'This Week', icon: CalendarDays },
            { key: 'month' as FocusTab, label: 'This Month', icon: CalendarRange },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFocusTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                focusTab === key
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── TODAY TAB ── */}
          {focusTab === 'today' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  Top 3 Priorities
                </h3>
                {todayCommitments.length > 0 && (
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                    todayHitRate >= 75 ? 'bg-emerald-500/15 text-emerald-400' :
                    todayHitRate >= 25 ? 'bg-amber-500/15 text-amber-400' :
                    'bg-white/10 text-text-muted'
                  }`}>
                    {todayHitRate}% hit rate
                  </span>
                )}
              </div>

              {todayCommitments.length === 0 && (
                <p className="text-sm text-text-muted italic">No priorities set for today yet. Add your Top 3 below.</p>
              )}

              <div className="space-y-2">
                {todayCommitments.map((c, i) => (
                  <div
                    key={c.id}
                    className="group flex items-center gap-3 bg-surface-2/50 border border-border/50 rounded-lg px-4 py-3 hover:border-border transition-colors"
                  >
                    <span className="text-xs font-mono text-text-muted/50 w-4">{i + 1}</span>
                    <button onClick={() => cycleStatus(c.id)} className="flex-shrink-0 hover:scale-110 transition-transform">
                      {commitStatusIcon(c.status)}
                    </button>
                    {editingCommitmentId === c.id ? (
                      <input
                        autoFocus
                        defaultValue={c.text}
                        className="flex-1 bg-white/5 border border-accent/30 rounded-md px-2 py-1 text-sm text-text-primary outline-none focus:border-accent/60 transition-colors"
                        onBlur={(e) => updateCommitmentText(c.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateCommitmentText(c.id, e.currentTarget.value);
                          if (e.key === 'Escape') setEditingCommitmentId(null);
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => setEditingCommitmentId(c.id)}
                        className={`flex-1 text-sm cursor-text hover:bg-white/5 rounded-md px-2 py-1 -mx-2 transition-colors ${
                          c.status === 'completed' ? 'text-text-muted line-through' : 'text-text-primary'
                        }`}
                        title="Click to edit"
                      >
                        {c.text}
                      </span>
                    )}
                    <button
                      onClick={() => removeCommitment(c.id)}
                      className="p-1 text-text-muted/30 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {todayCommitments.length < 3 && (
                <div className="flex items-center gap-2">
                  <input
                    value={newCommitment}
                    onChange={(e) => setNewCommitment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addCommitment(); }}
                    placeholder={`Priority ${todayCommitments.length + 1}...`}
                    className="flex-1 bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-teal-500/50 transition-colors"
                  />
                  <button
                    onClick={addCommitment}
                    disabled={!newCommitment.trim()}
                    className="px-4 py-2.5 bg-accent/20 text-accent rounded-lg text-sm font-medium hover:bg-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── WEEK TAB ── */}
          {focusTab === 'week' && (
            <div className="space-y-6">
              {/* Weekly Goals */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-accent" />
                    Weekly Goals
                    <span className="text-xs font-normal text-text-muted">({getWeekLabel()})</span>
                  </h3>
                  {weeklyData.goals.length > 0 && (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      weeklyCompletionRate >= 75 ? 'bg-emerald-500/15 text-emerald-400' :
                      weeklyCompletionRate >= 25 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-white/10 text-text-muted'
                    }`}>
                      {weeklyCompletionRate}% complete
                    </span>
                  )}
                </div>

                {weeklyData.goals.length === 0 && (
                  <p className="text-sm text-text-muted italic">No weekly goals set yet. Add your goals for the week below.</p>
                )}

                <div className="space-y-2">
                  {weeklyData.goals.map((g, i) => (
                    <div
                      key={g.id}
                      className="group flex items-center gap-3 bg-surface-2/50 border border-border/50 rounded-lg px-4 py-3 hover:border-border transition-colors"
                    >
                      <span className="text-xs font-mono text-text-muted/50 w-4">{i + 1}</span>
                      <button onClick={() => cycleWeeklyGoalStatus(g.id)} className="flex-shrink-0 hover:scale-110 transition-transform">
                        {commitStatusIcon(g.status)}
                      </button>
                      {editingWeeklyGoalId === g.id ? (
                        <input
                          autoFocus
                          defaultValue={g.text}
                          className="flex-1 bg-white/5 border border-accent/30 rounded-md px-2 py-1 text-sm text-text-primary outline-none focus:border-accent/60 transition-colors"
                          onBlur={(e) => updateWeeklyGoalText(g.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateWeeklyGoalText(g.id, e.currentTarget.value);
                            if (e.key === 'Escape') setEditingWeeklyGoalId(null);
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => setEditingWeeklyGoalId(g.id)}
                          className={`flex-1 text-sm cursor-text hover:bg-white/5 rounded-md px-2 py-1 -mx-2 transition-colors ${
                            g.status === 'completed' ? 'text-text-muted line-through' : 'text-text-primary'
                          }`}
                          title="Click to edit"
                        >
                          {g.text}
                        </span>
                      )}
                      <button
                        onClick={() => removeWeeklyGoal(g.id)}
                        className="p-1 text-text-muted/30 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    value={newWeeklyGoal}
                    onChange={(e) => setNewWeeklyGoal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addWeeklyGoal(); }}
                    placeholder={`Weekly goal ${weeklyData.goals.length + 1}...`}
                    className="flex-1 bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-teal-500/50 transition-colors"
                  />
                  <button
                    onClick={addWeeklyGoal}
                    disabled={!newWeeklyGoal.trim()}
                    className="px-4 py-2.5 bg-accent/20 text-accent rounded-lg text-sm font-medium hover:bg-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weekly Summary Stats */}
              {weeklyData.goals.length > 0 && (
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-2/30 border border-border/50 rounded-lg">
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-text-primary">{weeklyData.goals.length}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wide">Goals</p>
                  </div>
                  <div className="w-px h-8 bg-border/50" />
                  <div className="text-center flex-1">
                    <p className={`text-lg font-bold ${
                      weeklyCompletionRate >= 75 ? 'text-emerald-400' : weeklyCompletionRate >= 25 ? 'text-amber-400' : 'text-text-muted'
                    }`}>{weeklyCompletionRate}%</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wide">Completion</p>
                  </div>
                  <div className="w-px h-8 bg-border/50" />
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-text-primary">{streak > 0 ? streak : '—'}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wide">Day Streak</p>
                  </div>
                </div>
              )}

              {/* Daily Breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Daily Breakdown</p>
                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((date) => {
                    const entry = memberEntries.find((e) => e.date === date);
                    const hitRate = getHitRate(entry);
                    const isToday = date === todayDate;
                    const count = entry?.commitments.length ?? 0;
                    return (
                      <div
                        key={date}
                        className={`text-center p-3 rounded-lg border transition-colors ${
                          isToday ? 'border-accent/50 bg-accent/5' : 'border-border/50 bg-surface-2/30'
                        }`}
                      >
                        <p className={`text-[10px] uppercase font-semibold tracking-wider mb-2 ${isToday ? 'text-accent' : 'text-text-muted'}`}>
                          {dayLabel(date).split(',')[0]}
                        </p>
                        {count > 0 ? (
                          <>
                            <p className={`text-lg font-bold ${
                              hitRate >= 75 ? 'text-emerald-400' : hitRate >= 25 ? 'text-amber-400' : 'text-text-muted'
                            }`}>
                              {hitRate}%
                            </p>
                            <p className="text-[10px] text-text-muted mt-0.5">{count} item{count !== 1 ? 's' : ''}</p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-text-muted/30">—</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── MONTH TAB ── */}
          {focusTab === 'month' && (
            <div className="space-y-6">
              {/* Monthly Goals */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <CalendarRange className="w-4 h-4 text-accent" />
                    Monthly Goals
                    <span className="text-xs font-normal text-text-muted">({getMonthLabel()})</span>
                  </h3>
                  {monthlyData.goals.length > 0 && (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      monthlyCompletionRate >= 75 ? 'bg-emerald-500/15 text-emerald-400' :
                      monthlyCompletionRate >= 25 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-white/10 text-text-muted'
                    }`}>
                      {monthlyCompletionRate}% complete
                    </span>
                  )}
                </div>

                {monthlyData.goals.length === 0 && (
                  <p className="text-sm text-text-muted italic">No monthly goals set yet. Add your milestones for the month below.</p>
                )}

                <div className="space-y-2">
                  {monthlyData.goals.map((g, i) => (
                    <div
                      key={g.id}
                      className="group flex items-center gap-3 bg-surface-2/50 border border-border/50 rounded-lg px-4 py-3 hover:border-border transition-colors"
                    >
                      <span className="text-xs font-mono text-text-muted/50 w-4">{i + 1}</span>
                      <button onClick={() => cycleMonthlyGoalStatus(g.id)} className="flex-shrink-0 hover:scale-110 transition-transform">
                        {commitStatusIcon(g.status)}
                      </button>
                      {editingMonthlyGoalId === g.id ? (
                        <input
                          autoFocus
                          defaultValue={g.text}
                          className="flex-1 bg-white/5 border border-accent/30 rounded-md px-2 py-1 text-sm text-text-primary outline-none focus:border-accent/60 transition-colors"
                          onBlur={(e) => updateMonthlyGoalText(g.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateMonthlyGoalText(g.id, e.currentTarget.value);
                            if (e.key === 'Escape') setEditingMonthlyGoalId(null);
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => setEditingMonthlyGoalId(g.id)}
                          className={`flex-1 text-sm cursor-text hover:bg-white/5 rounded-md px-2 py-1 -mx-2 transition-colors ${
                            g.status === 'completed' ? 'text-text-muted line-through' : 'text-text-primary'
                          }`}
                          title="Click to edit"
                        >
                          {g.text}
                        </span>
                      )}
                      <button
                        onClick={() => removeMonthlyGoal(g.id)}
                        className="p-1 text-text-muted/30 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    value={newMonthlyGoal}
                    onChange={(e) => setNewMonthlyGoal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addMonthlyGoal(); }}
                    placeholder={`Monthly goal ${monthlyData.goals.length + 1}...`}
                    className="flex-1 bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-teal-500/50 transition-colors"
                  />
                  <button
                    onClick={addMonthlyGoal}
                    disabled={!newMonthlyGoal.trim()}
                    className="px-4 py-2.5 bg-accent/20 text-accent rounded-lg text-sm font-medium hover:bg-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Monthly Summary Stats */}
              {monthlyData.goals.length > 0 && (
                <div className="flex items-center gap-4 px-4 py-3 bg-surface-2/30 border border-border/50 rounded-lg">
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-text-primary">{monthlyData.goals.length}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wide">Goals Set</p>
                  </div>
                  <div className="w-px h-8 bg-border/50" />
                  <div className="text-center flex-1">
                    <p className={`text-lg font-bold ${
                      monthlyCompletionRate >= 75 ? 'text-emerald-400' : monthlyCompletionRate >= 25 ? 'text-amber-400' : 'text-text-muted'
                    }`}>{monthlyCompletionRate}%</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wide">Completion</p>
                  </div>
                  <div className="w-px h-8 bg-border/50" />
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-emerald-400">{monthlyData.goals.filter((g) => g.status === 'completed').length}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wide">Done</p>
                  </div>
                </div>
              )}

              {/* OKR Key Results Progress */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">OKR Key Results</p>
                {myOkrs.length > 0 ? (
                  <div className="space-y-3">
                    {myOkrs.map((okr) =>
                      okr.myKeyResults.map((kr, i) => (
                        <div key={`${okr.id}-${i}`} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text-primary">{kr.text}</span>
                            <span className="text-xs font-mono text-text-muted">{kr.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${kr.progress}%`, background: okrBarColor(okr.status) }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted italic">No OKR key results assigned to you yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════ Section 3: Your KPIs ════════════ */}
      <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Gauge className="w-5 h-5 text-accent" />
            Your KPIs
          </h3>
          <span className="text-xs text-text-muted">{personalData.kpis.length} metrics</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalData.kpis.map((kpi, index) => (
            <div
              key={kpi.id}
              className="glow-card bg-surface border border-border rounded-xl p-5 animate-fade-in"
              style={{ animationDelay: `${175 + index * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <InlineText
                  value={kpi.text}
                  onSave={(v) => updateKPI(kpi.id, 'text', v)}
                  className="text-sm font-medium text-text-primary leading-snug"
                />
                <InlineSelect
                  value={kpi.status}
                  options={kpiStatusOptions}
                  onSave={(v) => updateKPI(kpi.id, 'status', v)}
                />
              </div>
              <InlineText
                value={kpi.notes}
                onSave={(v) => updateKPI(kpi.id, 'notes', v)}
                className="text-xs text-text-muted"
                placeholder="Add notes..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* ════════════ Section 4: Your OKRs ════════════ */}
      <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '275ms' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Your OKRs
            {myOkrs.length > 0 && (
              <span className="text-xs font-mono text-text-muted bg-surface-3 px-2 py-0.5 rounded-full">
                {myOkrs.reduce((sum, o) => sum + o.myKeyResults.length, 0)} key results
              </span>
            )}
          </h3>
          <button
            onClick={() => onNavigate('okrs')}
            className="text-xs text-accent hover:text-accent-2 transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {myOkrs.length > 0 ? (
          <div className="space-y-5">
            {myOkrs.map((okr) => (
              <div key={okr.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-text-primary leading-snug flex-1">
                    {okr.objective}
                  </p>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${okrStatusColor(okr.status)}`}>
                    {okrStatusLabel(okr.status)}
                  </span>
                </div>
                <div className="space-y-2">
                  {okr.myKeyResults.map((kr, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-muted truncate pr-3 max-w-[80%]">{kr.text}</span>
                        <span className="text-xs text-text-secondary font-mono">{kr.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${kr.progress}%`, background: okrBarColor(okr.status) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
            <p className="text-sm text-text-muted">No key results are currently assigned to you.</p>
            <button
              onClick={() => onNavigate('okrs')}
              className="text-xs text-accent hover:text-accent-2 mt-2 inline-flex items-center gap-1"
            >
              View all OKRs <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* ════════════ Section 5: Your Ownership Areas ════════════ */}
      <div className="animate-fade-in" style={{ animationDelay: '350ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Single-Threaded Ownership
          </h3>
          <span className="text-xs text-text-muted">{personalData.ownership.length} areas</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalData.ownership.map((area, index) => (
            <div
              key={area.id}
              className="glow-card bg-surface border border-border rounded-xl p-5 animate-fade-in"
              style={{ animationDelay: `${375 + index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <InlineText
                  value={area.text}
                  onSave={(v) => updateOwnership(area.id, 'text', v)}
                  className="text-sm font-medium text-text-primary leading-snug"
                />
                <InlineSelect
                  value={area.status}
                  options={ownershipStatusOptions}
                  onSave={(v) => updateOwnership(area.id, 'status', v)}
                />
              </div>
              <InlineText
                value={area.notes}
                onSave={(v) => updateOwnership(area.id, 'notes', v)}
                className="text-xs text-text-muted"
                placeholder="Add progress notes..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* ════════════ Section 6: Company Pulse (Condensed) ════════════ */}
      <div
        className="bg-surface border border-border rounded-xl p-5 animate-fade-in"
        style={{ animationDelay: '475ms' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">Company Pulse</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {companyKpis.map((kpi) => (
              <div key={kpi.id} className="text-center">
                <p className="text-[10px] text-text-muted uppercase tracking-wide">{kpi.name}</p>
                <p className="text-lg font-bold text-text-primary">{kpi.value}</p>
              </div>
            ))}
            <div className="text-center">
              <p className="text-[10px] text-text-muted uppercase tracking-wide">North Star</p>
              <p className="text-lg font-bold text-accent">$1B+</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('roadmap')}
            className="text-xs text-accent hover:text-accent-2 transition-colors flex items-center gap-1 flex-shrink-0"
          >
            Roadmap <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ════════════ Section 7: Quick Actions ════════════ */}
      <div className="animate-fade-in" style={{ animationDelay: '550ms' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map(({ label, icon: Icon, view }) => (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className="glow-card bg-surface border border-border rounded-xl p-4 hover:border-accent/30 hover:bg-surface-2 transition-all duration-200 group text-center"
            >
              <Icon className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors mx-auto mb-2" />
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
