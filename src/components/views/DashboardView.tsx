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
  Lightbulb,
  Link2,
  BarChart3,
  Zap,
} from 'lucide-react';
import {
  teamMembers,
  okrs,
  kpis,
  memberIdToOwnerName,
} from '@/lib/data';
import { useEditableStore } from '@/lib/useEditableStore';
import { InlineText, InlineSelect, EditBanner } from '@/components/InlineEdit';
import { AIChatPanel } from '@/components/AIChatPanel';

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
  linkedOkrId?: string; // optional link to an OKR objective
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

const abbreviateText = (text: string, maxLen: number = 20): string => {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trim() + '\u2026';
};

const getMonthProgress = (): { dayOfMonth: number; totalDays: number; pct: number } => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return { dayOfMonth, totalDays, pct: Math.round((dayOfMonth / totalDays) * 100) };
};

const getDayHitColor = (hitRate: number, hasData: boolean): string => {
  if (!hasData) return 'bg-white/5 border-border/30 text-text-muted/40';
  if (hitRate >= 67) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  if (hitRate >= 34) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
};

const getShortDayName = (dateStr: string): string => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

/** Returns monday-start dates for each week of the current month */
const getMonthWeekStarts = (): string[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weekStarts: string[] = [];
  // walk from first day, find each monday (or first day if month doesn't start on monday)
  const current = new Date(firstDay);
  // back up to monday of the first week
  const dow = current.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  current.setDate(current.getDate() + mondayOffset);
  while (current <= lastDay) {
    const weekStart = current.toISOString().split('T')[0];
    weekStarts.push(weekStart);
    current.setDate(current.getDate() + 7);
  }
  return weekStarts;
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

  // ── Month progress (day X of Y) ──
  const monthProgress = useMemo(() => getMonthProgress(), []);

  // ── Weekly intelligence insights ──
  const weeklyInsights = useMemo(() => {
    const insights: string[] = [];

    // Find strongest day
    let bestDay = '';
    let bestRate = -1;
    let worstDay = '';
    let worstRate = 101;
    for (const date of weekDates) {
      const entry = memberEntries.find((e) => e.date === date);
      if (!entry || entry.commitments.length === 0) continue;
      const rate = getHitRate(entry);
      if (rate > bestRate) { bestRate = rate; bestDay = date; }
      if (rate < worstRate) { worstRate = rate; worstDay = date; }
    }
    if (bestDay) {
      insights.push(`Your strongest day this week was ${getShortDayName(bestDay)} at ${bestRate}%`);
    }

    // Weekly goals progress
    if (weeklyData.goals.length > 0) {
      const completed = weeklyData.goals.filter((g) => g.status === 'completed').length;
      insights.push(`You\u2019ve completed ${completed} of ${weeklyData.goals.length} weekly goals so far`);
    }

    // Tip about weak day
    if (worstDay && worstRate < 50 && worstDay !== bestDay) {
      insights.push(`Tip: You dipped on ${getShortDayName(worstDay)} \u2014 try front-loading critical work`);
    } else if (memberEntries.length === 0) {
      insights.push('Tip: Start logging your Top 3 daily to build momentum');
    }

    return insights;
  }, [weekDates, memberEntries, weeklyData.goals]);

  // ── Month-to-date weekly hit rates ──
  const monthWeeklyRates = useMemo(() => {
    const weekStarts = getMonthWeekStarts();
    const today = todayStr();
    return weekStarts.map((ws, idx) => {
      const weekEnd = new Date(ws);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const endStr = weekEnd.toISOString().split('T')[0];
      // find entries in this week
      const entries = memberEntries.filter((e) => e.date >= ws && e.date <= endStr);
      if (entries.length === 0) return { label: `Week ${idx + 1}`, rate: null, isCurrent: ws <= today && endStr >= today };
      const totalRate = entries.reduce((sum, e) => sum + getHitRate(e), 0);
      return { label: ws <= today && endStr >= today ? 'This week' : `Week ${idx + 1}`, rate: Math.round(totalRate / entries.length), isCurrent: ws <= today && endStr >= today };
    });
  }, [memberEntries]);

  const monthAvgDailyRate = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthEntries = memberEntries.filter((e) => e.date.startsWith(ym) && e.commitments.length > 0);
    if (monthEntries.length === 0) return null;
    const total = monthEntries.reduce((sum, e) => sum + getHitRate(e), 0);
    return Math.round(total / monthEntries.length);
  }, [memberEntries]);

  // ── Monthly goal OKR link toggle ──
  const toggleMonthlyGoalOkr = (goalId: string, okrId: string | undefined) => {
    const goals = monthlyData.goals.map((g) =>
      g.id === goalId ? { ...g, linkedOkrId: okrId } : g
    );
    saveMonthlyData({ goals });
  };

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
      <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: '50ms' }}>
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

              {/* Cross-reference to weekly goals */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/30 mt-2">
                <Link2 className="w-3 h-3 text-text-muted/60 flex-shrink-0" />
                <p className="text-[11px] text-text-muted/70 leading-snug">
                  These daily priorities should ladder up to your weekly goals.{' '}
                  <button
                    onClick={() => setFocusTab('week')}
                    className="text-accent hover:text-accent-2 transition-colors inline-flex items-center gap-0.5"
                  >
                    View Weekly <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ── WEEK TAB ── */}
          {focusTab === 'week' && (
            <div className="space-y-6">
              {/* Weekly Goals */}
              <div className="space-y-4">
                <div>
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
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-text-muted/70">These weekly goals should drive your monthly milestones forward.</p>
                    <button
                      onClick={() => setFocusTab('month')}
                      className="text-[11px] text-accent hover:text-accent-2 transition-colors flex items-center gap-0.5 flex-shrink-0"
                    >
                      View Monthly Goals <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {weeklyData.goals.length === 0 && (
                  <div className="bg-surface-2/40 border border-border/40 rounded-lg p-4">
                    <p className="text-sm text-text-muted">Set 3-5 weekly goals that support your monthly milestones. Each daily Top 3 should ladder into these.</p>
                  </div>
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

              {/* Your Daily Top 3 Tracker */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <BarChart3 className="w-3 h-3" />
                    Your Daily Top 3 Tracker
                  </p>
                  <p className="text-[10px] text-text-muted/60 mt-0.5">How well you hit your Top 3 each day this week</p>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((date) => {
                    const entry = memberEntries.find((e) => e.date === date);
                    const hitRate = getHitRate(entry);
                    const isToday = date === todayDate;
                    const hasData = !!entry && entry.commitments.length > 0;
                    const colorClass = getDayHitColor(hitRate, hasData);
                    return (
                      <div
                        key={date}
                        className={`text-center p-3 rounded-lg border transition-colors ${colorClass} ${
                          isToday ? 'ring-1 ring-accent/60 ring-offset-1 ring-offset-surface' : ''
                        }`}
                      >
                        <p className={`text-[10px] uppercase font-semibold tracking-wider mb-1.5 ${isToday ? 'text-accent' : ''}`}>
                          {dayLabel(date).split(',')[0]}
                        </p>
                        {hasData ? (
                          <>
                            <p className="text-lg font-bold">{hitRate}%</p>
                            <div className="mt-1 space-y-0.5">
                              {entry.commitments.slice(0, 3).map((c, ci) => (
                                <p
                                  key={ci}
                                  className={`text-[8px] leading-tight truncate ${
                                    c.status === 'completed' ? 'line-through opacity-60' : 'opacity-80'
                                  }`}
                                  title={c.text}
                                >
                                  {abbreviateText(c.text, 20)}
                                </p>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-text-muted/30">&mdash;</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Intelligence Summary */}
              {(weeklyInsights.length > 0 || weeklyData.goals.length > 0) && (
                <div className="bg-gradient-to-r from-accent/5 via-teal-500/5 to-blue-500/5 border border-accent/20 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-accent flex items-center gap-1.5 uppercase tracking-wider">
                    <Zap className="w-3 h-3" />
                    Weekly Intelligence
                  </p>
                  <div className="space-y-1.5">
                    {weeklyInsights.map((insight, i) => (
                      <p key={i} className="text-xs text-text-secondary flex items-start gap-2">
                        <span className="text-accent/60 flex-shrink-0 mt-0.5">{insight.startsWith('Tip') ? '\u{1F4A1}' : '\u2022'}</span>
                        <span>{insight}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MONTH TAB ── */}
          {focusTab === 'month' && (
            <div className="space-y-6">
              {/* Monthly Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-text-secondary">
                    Day {monthProgress.dayOfMonth} of {monthProgress.totalDays} &mdash; {monthlyCompletionRate}% of goals complete
                  </p>
                  <span className="text-[10px] text-text-muted font-mono">{getMonthLabel()}</span>
                </div>
                <div className="relative h-2.5 bg-surface-3 rounded-full overflow-hidden">
                  {/* Time elapsed bar (subtle) */}
                  <div
                    className="absolute inset-y-0 left-0 bg-white/10 rounded-full"
                    style={{ width: `${monthProgress.pct}%` }}
                  />
                  {/* Goals completion overlay (accent) */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{
                      width: `${monthlyCompletionRate}%`,
                      background: monthlyCompletionRate >= 75 ? '#22c55e' : monthlyCompletionRate >= 25 ? '#eab308' : '#ef4444',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span>Time elapsed: {monthProgress.pct}%</span>
                  <span>Goals done: {monthlyCompletionRate}%</span>
                </div>
              </div>

              {/* Monthly Goals */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                      <CalendarRange className="w-4 h-4 text-accent" />
                      Monthly Milestones
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
                  <p className="text-[11px] text-text-muted/70 mt-1">Monthly milestones that drive your quarterly OKRs. Weekly goals should support these.</p>
                </div>

                {monthlyData.goals.length === 0 && (
                  <div className="bg-surface-2/40 border border-border/40 rounded-lg p-4">
                    <p className="text-sm text-text-muted">Set 2-4 monthly milestones that drive your OKR key results. Weekly goals should support these.</p>
                  </div>
                )}

                <div className="space-y-2">
                  {monthlyData.goals.map((g, i) => {
                    const linkedOkr = g.linkedOkrId ? myOkrs.find((o) => o.id === g.linkedOkrId) : undefined;
                    return (
                      <div
                        key={g.id}
                        className="group bg-surface-2/50 border border-border/50 rounded-lg px-4 py-3 hover:border-border transition-colors"
                      >
                        <div className="flex items-center gap-3">
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
                          {/* OKR link selector */}
                          {myOkrs.length > 0 && (
                            <select
                              value={g.linkedOkrId ?? ''}
                              onChange={(e) => toggleMonthlyGoalOkr(g.id, e.target.value || undefined)}
                              className="text-[10px] bg-white/5 border border-border/40 rounded px-1.5 py-0.5 text-text-muted outline-none focus:border-accent/40 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity max-w-[120px]"
                              title="Link to OKR"
                            >
                              <option value="">Link OKR...</option>
                              {myOkrs.map((okr) => (
                                <option key={okr.id} value={okr.id}>{abbreviateText(okr.objective, 30)}</option>
                              ))}
                            </select>
                          )}
                          <button
                            onClick={() => removeMonthlyGoal(g.id)}
                            className="p-1 text-text-muted/30 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {linkedOkr && (
                          <div className="flex items-center gap-1.5 ml-7 mt-1.5">
                            <Target className="w-2.5 h-2.5 text-accent/60" />
                            <span className="text-[10px] text-accent/70">{abbreviateText(linkedOkr.objective, 50)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    value={newMonthlyGoal}
                    onChange={(e) => setNewMonthlyGoal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addMonthlyGoal(); }}
                    placeholder={`Monthly milestone ${monthlyData.goals.length + 1}...`}
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

              {/* Month-to-Date Summary */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" />
                  Month-to-Date Summary
                </p>
                <div className="bg-surface-2/30 border border-border/50 rounded-lg p-4 space-y-3">
                  {/* Weekly rates row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {monthWeeklyRates.map((w, i) => (
                      <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ${
                        w.isCurrent ? 'bg-accent/10 border border-accent/20' : 'bg-white/5 border border-border/30'
                      }`}>
                        <span className={`font-medium ${w.isCurrent ? 'text-accent' : 'text-text-secondary'}`}>{w.label}:</span>
                        <span className={`font-mono ${
                          w.rate === null ? 'text-text-muted/40' :
                          w.rate >= 67 ? 'text-emerald-400' :
                          w.rate >= 34 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {w.rate !== null ? `${w.rate}%` : '\u2014'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Average daily hit rate */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    <span className="text-[11px] text-text-muted">Avg daily hit rate this month:</span>
                    <span className={`text-xs font-bold font-mono ${
                      monthAvgDailyRate === null ? 'text-text-muted/40' :
                      monthAvgDailyRate >= 67 ? 'text-emerald-400' :
                      monthAvgDailyRate >= 34 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {monthAvgDailyRate !== null ? `${monthAvgDailyRate}%` : 'No data yet'}
                    </span>
                  </div>
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

      {/* ════════════ AI Advisor — Daily Coaching ════════════ */}
      <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
        <AIChatPanel
          memberId={currentUser}
          memberName={member.name}
          memberRole={member.role}
          context={{
            priorities: todayCommitments.map(
              (c) => `${c.text} [${c.status}]`
            ),
            weeklyGoals: weeklyData.goals.map(
              (g) => `${g.text} [${g.status}]`
            ),
            monthlyGoals: monthlyData.goals.map(
              (g) => `${g.text} [${g.status}]`
            ),
            kpis: personalData.kpis.map(
              (k) => `${k.text} [${k.status}]${k.notes ? ` — ${k.notes}` : ''}`
            ),
            ownership: personalData.ownership.map(
              (a) => `${a.text} [${a.status}]${a.notes ? ` — ${a.notes}` : ''}`
            ),
            okrs: myOkrs.flatMap((okr) =>
              okr.myKeyResults.map((kr) => `${okr.objective}: ${kr.text} (${kr.progress}%) [${okr.status}]`)
            ),
          }}
          title={`${firstName}, here are some things to consider today`}
          titleIcon="lightbulb"
          compact={false}
          defaultCollapsed={false}
          suggestedPrompts={[
            'What should my #1 priority be today and why?',
            'Where am I most at risk of dropping the ball this week?',
            'What blind spots should I watch for given my current focus?',
            'Give me a brutally honest assessment — am I on track?',
            'What would a $1B CEO do differently in my position today?',
            'What hard conversation should I be having that I\'m avoiding?',
          ]}
        />
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

      {/* AI Advisor placed after Focus section (priorities first) */}
    </div>
  );
}
