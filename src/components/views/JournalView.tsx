'use client';

import { useState, useMemo } from 'react';
import {
  Sun, Moon, CalendarDays, TrendingUp, ChevronDown, ChevronRight,
  Check, Circle, Sparkles, BookOpen, Target, AlertTriangle, Heart,
  RotateCcw, Flame, Brain, Trophy, Send, Lock, MessageCircle,
  Lightbulb, TrendingDown, Zap, Award, Bookmark, Copy, ClipboardCheck,
  X, BarChart3,
} from 'lucide-react';
import { memberIdToOwnerName } from '@/lib/data';
import { getTeamMemberOS } from '@/lib/teamOS';
import { useEditableStore } from '@/lib/useEditableStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type EntryType = 'morning' | 'eod' | 'evening' | 'weekly';
type Mood = 'great' | 'good' | 'neutral' | 'tough' | 'rough';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface JournalEntry {
  id: string;
  type: EntryType;
  date: string; // ISO date string
  mood?: Mood;
  energy?: number; // 1-5
  checklist: ChecklistItem[];
  reflections: string[];
  wins: string[];
  gratitude: string;
  notes: string;
  createdAt: string;
  // New fields
  winOfTheDay: string;
  publishedAt?: string; // ISO timestamp when published
  dailyPromptResponse: string;
  // Evening check-in fields
  eveningWentWell?: string;
  eveningCouldImprove?: string;
  eveningGratitude?: string;
  eveningTomorrowPriority?: string;
  eveningTomorrowEnergy?: number; // 1-5
  eveningSleepIntention?: string;
}

interface JournalData {
  entries: JournalEntry[];
  streakDays: number;
  lastEntryDate: string;
}

// ---------------------------------------------------------------------------
// Daily Firm Prompts (30+ strategic CEO/fund management prompts)
// ---------------------------------------------------------------------------
const DAILY_PROMPTS: string[] = [
  "How can we think about improving risk-adjusted alpha today?",
  "What's the single most leveraged thing I can do today?",
  "Which LP relationship needs the most attention right now?",
  "What process is slowing us down that could be automated?",
  "Where are we not being bold enough?",
  "What would a $1B AUM firm do differently today?",
  "Who on the team needs support or recognition?",
  "What's one thing I should stop doing?",
  "What's the biggest risk in our portfolio right now that we're not discussing?",
  "If I could only accomplish one thing this week, what would move the needle most?",
  "Which relationship — LP, co-investor, or advisor — could unlock the next level?",
  "What decision am I avoiding that I know needs to be made?",
  "Where is our process creating drag instead of leverage?",
  "What would I tell a new CEO in my seat to focus on first?",
  "Are we spending time on the right deals, or just the loudest ones?",
  "What's the one metric I should obsess over this quarter?",
  "How well are we communicating our thesis to LPs and prospects?",
  "What talent gap, if filled, would 2x our output?",
  "Where am I confusing activity with progress?",
  "What's our unfair advantage and are we leaning into it enough?",
  "What feedback have I received recently that I haven't acted on?",
  "Which portfolio company needs a difficult conversation?",
  "How can we create more optionality in our pipeline?",
  "What's one experiment we could run this week that costs almost nothing?",
  "Am I delegating enough, or am I the bottleneck?",
  "What would our top LP say if they saw how we spent today?",
  "Where are we leaving alpha on the table through inaction?",
  "What's the next capability we need to build as a firm?",
  "How healthy is our deal pipeline for the next 6 months?",
  "What would break if I took a week off — and does that concern me?",
  "Are we tracking the right KPIs, or just the easy ones?",
  "What's the most important thing I can teach the team this week?",
  "Where should we be contrarian when the market is consensus?",
  "What's one thing I learned this week that changes how I think?",
  "How aligned is the team on our top 3 priorities?",
  "What's the cost of the status quo if we change nothing?",
  "Which emerging trend or theme should we be researching deeper?",
  "How can I make my direct reports more effective today?",
  "What's one partnership or collaboration we should explore?",
  "If we had unlimited capital, what would we do differently — and why aren't we doing some of that now?",
];

function getDailyPrompt(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
}

// ---------------------------------------------------------------------------
// AI Theme Analysis helpers
// ---------------------------------------------------------------------------
const THEME_KEYWORDS: Record<string, string[]> = {
  'Team Alignment': ['team', 'alignment', 'aligned', 'culture', 'together', 'collaboration', 'collaborate'],
  'LP Focus': ['lp', 'investor', 'fundraise', 'fundraising', 'capital', 'relationship', 'relationships'],
  'Hiring': ['hire', 'hiring', 'recruit', 'talent', 'candidate', 'interview', 'onboard'],
  'Strategy': ['strategy', 'strategic', 'thesis', 'vision', 'roadmap', 'plan', 'planning'],
  'Deals & Pipeline': ['deal', 'deals', 'pipeline', 'sourcing', 'diligence', 'underwriting'],
  'Portfolio': ['portfolio', 'company', 'companies', 'founder', 'founders', 'board'],
  'Risk': ['risk', 'downside', 'hedge', 'exposure', 'volatility', 'drawdown'],
  'Growth': ['growth', 'scale', 'scaling', 'expand', 'expansion', 'revenue', 'aum'],
  'Process': ['process', 'automation', 'automate', 'systems', 'workflow', 'efficiency'],
  'Ownership': ['ownership', 'accountability', 'responsible', 'own', 'leader', 'leadership'],
  'Focus': ['focus', 'prioritize', 'priority', 'priorities', 'leverage', 'leveraged'],
  'Communication': ['communicate', 'communication', 'update', 'reporting', 'transparency'],
  'Learning': ['learn', 'learning', 'research', 'study', 'read', 'insight', 'insights'],
  'Energy & Wellness': ['energy', 'health', 'wellness', 'rest', 'burnout', 'balance', 'exercise'],
  'Decision Making': ['decision', 'decide', 'choice', 'tradeoff', 'conviction'],
};

interface ThemeCount {
  theme: string;
  count: number;
}

function analyzeThemes(entries: JournalEntry[]): ThemeCount[] {
  const counts: Record<string, number> = {};

  for (const entry of entries) {
    const allText = [
      ...entry.reflections,
      ...entry.wins,
      entry.gratitude,
      entry.notes,
      entry.winOfTheDay ?? '',
      entry.dailyPromptResponse ?? '',
      entry.eveningWentWell ?? '',
      entry.eveningCouldImprove ?? '',
      entry.eveningGratitude ?? '',
      entry.eveningTomorrowPriority ?? '',
    ]
      .join(' ')
      .toLowerCase();

    for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        const matches = allText.match(regex);
        if (matches) {
          counts[theme] = (counts[theme] ?? 0) + matches.length;
        }
      }
    }
  }

  return Object.entries(counts)
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count);
}

interface AIFeedbackMessage {
  icon: typeof TrendingUp;
  iconColor: string;
  message: string;
}

function generateAIFeedback(
  entries: JournalEntry[],
  themes: ThemeCount[]
): AIFeedbackMessage[] {
  const feedback: AIFeedbackMessage[] = [];
  if (entries.length === 0) return feedback;

  // Mood analysis
  const moodOrder: Record<string, number> = { great: 5, good: 4, neutral: 3, tough: 2, rough: 1 };
  const moodsThisWeek = entries.filter((e) => e.mood).map((e) => moodOrder[e.mood!] ?? 3);
  if (moodsThisWeek.length >= 3) {
    const avgMood = moodsThisWeek.reduce((a, b) => a + b, 0) / moodsThisWeek.length;
    if (avgMood >= 4) {
      feedback.push({
        icon: Flame,
        iconColor: 'text-emerald-400',
        message: `Strong energy this week! You've maintained positive momentum across ${moodsThisWeek.length} entries.`,
      });
    } else if (avgMood <= 2.5) {
      feedback.push({
        icon: TrendingDown,
        iconColor: 'text-amber-400',
        message: "Mood has been lower than usual. Consider what's driving that and whether you need to reset.",
      });
    }
  }

  // Energy analysis
  const energies = entries.filter((e) => e.energy).map((e) => e.energy!);
  if (energies.length >= 3) {
    const avgEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
    if (avgEnergy <= 2.5) {
      feedback.push({
        icon: Zap,
        iconColor: 'text-rose-400',
        message: "Energy levels have dipped — consider what's driving that. Sleep, workload, or something else?",
      });
    } else if (avgEnergy >= 4) {
      feedback.push({
        icon: Zap,
        iconColor: 'text-emerald-400',
        message: `High energy levels averaging ${avgEnergy.toFixed(1)}/5. You're in a good operating zone.`,
      });
    }
  }

  // Checklist completion analysis
  const checklistEntries = entries.filter((e) => e.checklist.length > 0);
  if (checklistEntries.length >= 3) {
    const totalItems = checklistEntries.reduce((sum, e) => sum + e.checklist.length, 0);
    const checkedItems = checklistEntries.reduce(
      (sum, e) => sum + e.checklist.filter((c) => c.checked).length,
      0
    );
    const pct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
    if (pct >= 80) {
      feedback.push({
        icon: Target,
        iconColor: 'text-accent',
        message: `Your morning routine consistency is excellent — ${pct}% completion this week.`,
      });
    } else if (pct < 50 && pct > 0) {
      feedback.push({
        icon: Target,
        iconColor: 'text-amber-400',
        message: `Checklist completion is at ${pct}%. Consider simplifying your routine or identifying blockers.`,
      });
    }
  }

  // Theme-based feedback
  if (themes.length > 0) {
    const top = themes[0];
    if (top.count >= 3) {
      feedback.push({
        icon: Brain,
        iconColor: 'text-indigo-400',
        message: `You've mentioned "${top.theme}" ${top.count} times recently. This seems like a core focus area.`,
      });
    }
    if (themes.length >= 2 && themes[1].count >= 2) {
      feedback.push({
        icon: Lightbulb,
        iconColor: 'text-amber-400',
        message: `Secondary theme: "${themes[1].theme}" (${themes[1].count} mentions). Consider how this connects to your main focus.`,
      });
    }
  }

  // Win of the day tracking
  const winsOfDay = entries.filter((e) => (e.winOfTheDay ?? '').trim().length > 0);
  if (winsOfDay.length >= 5) {
    feedback.push({
      icon: Trophy,
      iconColor: 'text-amber-400',
      message: `You've logged ${winsOfDay.length} daily wins recently. Consistent win tracking builds momentum.`,
    });
  }

  // Gratitude tracking
  const gratitudes = entries.filter((e) => (e.gratitude ?? '').trim().length > 0);
  if (gratitudes.length >= 5) {
    feedback.push({
      icon: Heart,
      iconColor: 'text-rose-400',
      message: `Gratitude practice is strong — ${gratitudes.length} entries. Research shows this compounds over time.`,
    });
  }

  return feedback;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const moodConfig: Record<Mood, { emoji: string; label: string; color: string }> = {
  great: { emoji: '\u{1F525}', label: 'Great', color: 'text-emerald-400' },
  good: { emoji: '\u2728', label: 'Good', color: 'text-accent' },
  neutral: { emoji: '\u{1F610}', label: 'Neutral', color: 'text-text-secondary' },
  tough: { emoji: '\u{1F4AA}', label: 'Tough', color: 'text-amber-400' },
  rough: { emoji: '\u{1F327}', label: 'Rough', color: 'text-rose-400' },
};

const energyLabels = ['', 'Low', 'Below Avg', 'Normal', 'High', 'Peak'];

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function JournalView({ currentUser }: { currentUser?: string }) {
  const ownerName = currentUser ? memberIdToOwnerName[currentUser] ?? currentUser : 'Team Member';
  const memberOS = currentUser ? getTeamMemberOS(currentUser) : undefined;
  const today = todayISO();

  // Default journal data scoped to the user
  const storageKey = `amphibian-unite-journal-${currentUser ?? 'default'}`;
  const defaultData: JournalData = { entries: [], streakDays: 0, lastEntryDate: '' };
  const { data: journal, setData: setJournal } = useEditableStore<JournalData>(storageKey, defaultData);

  const [activeTab, setActiveTab] = useState<EntryType>('morning');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [aiTimeRange, setAiTimeRange] = useState<7 | 14 | 30>(7);
  const [showPublishedLibrary, setShowPublishedLibrary] = useState(false);
  const [expandedPublished, setExpandedPublished] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Find today's entry for the active tab
  const todayEntry = useMemo(
    () => journal.entries.find((e) => e.date === today && e.type === activeTab),
    [journal.entries, today, activeTab]
  );

  // Build checklist from TeamOS
  const defaultChecklist = useMemo((): ChecklistItem[] => {
    if (!memberOS) return [];
    if (activeTab === 'evening') return [];
    const items =
      activeTab === 'morning'
        ? memberOS.operatingSystem.morningChecklist
        : activeTab === 'eod'
          ? memberOS.operatingSystem.eveningReflection
          : memberOS.operatingSystem.weeklyPulse;
    return items.map((text, i) => ({ id: `os-${i}`, text, checked: false }));
  }, [memberOS, activeTab]);

  // Build reflection prompts from TeamOS
  const reflectionPrompts = useMemo((): string[] => {
    if (!memberOS) return [];
    if (activeTab === 'morning') return memberOS.operatingSystem.commitments.slice(0, 3);
    if (activeTab === 'eod') {
      return [
        ...memberOS.qualities.filter((q) => q.score <= 3).map((q) => q.weeklyQuestion).slice(0, 2),
        'What will I do differently tomorrow?',
      ];
    }
    if (activeTab === 'evening') return [];
    // weekly
    return [
      ...memberOS.qualities.map((q) => q.weeklyQuestion).slice(0, 3),
      'What is my biggest growth area right now?',
    ];
  }, [memberOS, activeTab]);

  // Count entries
  const stats = useMemo(() => {
    const thisWeek = journal.entries.filter((e) => {
      const d = new Date(e.date + 'T12:00:00');
      const now = new Date();
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    const mornings = thisWeek.filter((e) => e.type === 'morning').length;
    const eods = thisWeek.filter((e) => e.type === 'eod').length;
    const evenings = thisWeek.filter((e) => e.type === 'evening').length;
    const weeklys = thisWeek.filter((e) => e.type === 'weekly').length;
    const avgMood = thisWeek.filter((e) => e.mood).length > 0
      ? thisWeek.reduce((sum, e) => {
          const moodOrder: Record<string, number> = { great: 5, good: 4, neutral: 3, tough: 2, rough: 1 };
          return sum + (moodOrder[e.mood ?? 'neutral'] ?? 3);
        }, 0) / thisWeek.filter((e) => e.mood).length
      : 0;
    return { mornings, eods, evenings, weeklys, total: thisWeek.length, avgMood };
  }, [journal.entries]);

  // AI Analysis: theme analysis across recent entries
  const aiAnalysis = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - aiTimeRange);
    const cutoffISO = cutoff.toISOString().split('T')[0];

    const recentEntries = journal.entries.filter((e) => e.date >= cutoffISO);
    const themes = analyzeThemes(recentEntries);
    const feedback = generateAIFeedback(recentEntries, themes);

    return { themes, feedback, entryCount: recentEntries.length };
  }, [journal.entries, aiTimeRange]);

  // Published entries sorted by publish date (newest first)
  const publishedEntries = useMemo(
    () =>
      journal.entries
        .filter((e) => !!e.publishedAt)
        .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')),
    [journal.entries]
  );

  // Published entry stats
  const publishedStats = useMemo(() => {
    const total = publishedEntries.length;
    if (total === 0) return { total: 0, streak: 0, mostCommonType: null as EntryType | null, avgMood: 0 };

    // Publishing streak: consecutive days with at least one published entry
    const publishDates = Array.from(
      new Set(publishedEntries.map((e) => e.date))
    ).sort((a, b) => b.localeCompare(a)); // newest first

    let streak = 0;
    const todayDate = todayISO();
    let checkDate = new Date(todayDate + 'T12:00:00');

    for (const dateStr of publishDates) {
      const checkISO = checkDate.toISOString().split('T')[0];
      if (dateStr === checkISO) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr < checkISO) {
        // If the first published date is yesterday (not today), still check for streak starting yesterday
        if (streak === 0) {
          const yesterday = new Date(todayDate + 'T12:00:00');
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayISO = yesterday.toISOString().split('T')[0];
          if (dateStr === yesterdayISO) {
            streak = 1;
            checkDate = new Date(yesterday);
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }

    // Most common entry type
    const typeCounts: Record<string, number> = {};
    for (const e of publishedEntries) {
      typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1;
    }
    const mostCommonType = (Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null) as EntryType | null;

    // Average mood
    const moodOrder: Record<string, number> = { great: 5, good: 4, neutral: 3, tough: 2, rough: 1 };
    const moodEntries = publishedEntries.filter((e) => e.mood);
    const avgMood = moodEntries.length > 0
      ? moodEntries.reduce((sum, e) => sum + (moodOrder[e.mood!] ?? 3), 0) / moodEntries.length
      : 0;

    return { total, streak, mostCommonType, avgMood };
  }, [publishedEntries]);

  // Create or update today's entry
  function createTodayEntry(): JournalEntry {
    return {
      id: makeId(),
      type: activeTab,
      date: today,
      mood: undefined,
      energy: undefined,
      checklist: defaultChecklist.map((c) => ({ ...c })),
      reflections: reflectionPrompts.map(() => ''),
      wins: [''],
      gratitude: '',
      notes: '',
      createdAt: new Date().toISOString(),
      winOfTheDay: '',
      publishedAt: undefined,
      dailyPromptResponse: '',
      eveningWentWell: '',
      eveningCouldImprove: '',
      eveningGratitude: '',
      eveningTomorrowPriority: '',
      eveningTomorrowEnergy: undefined,
      eveningSleepIntention: '',
    };
  }

  function ensureTodayEntry(): JournalEntry {
    if (todayEntry) return todayEntry;
    const entry = createTodayEntry();
    setJournal((prev) => ({
      ...prev,
      entries: [entry, ...prev.entries],
      lastEntryDate: today,
    }));
    return entry;
  }

  function updateEntry(entryId: string, updater: (e: JournalEntry) => JournalEntry) {
    setJournal((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.id === entryId ? updater(e) : e)),
    }));
  }

  function toggleChecklist(entryId: string, checkIdx: number) {
    updateEntry(entryId, (e) => ({
      ...e,
      checklist: e.checklist.map((c, i) => (i === checkIdx ? { ...c, checked: !c.checked } : c)),
    }));
  }

  function setMood(entryId: string, mood: Mood) {
    updateEntry(entryId, (e) => ({ ...e, mood }));
  }

  function setEnergy(entryId: string, level: number) {
    updateEntry(entryId, (e) => ({ ...e, energy: level }));
  }

  function setReflection(entryId: string, idx: number, value: string) {
    updateEntry(entryId, (e) => ({
      ...e,
      reflections: e.reflections.map((r, i) => (i === idx ? value : r)),
    }));
  }

  function setWin(entryId: string, idx: number, value: string) {
    updateEntry(entryId, (e) => ({
      ...e,
      wins: e.wins.map((w, i) => (i === idx ? value : w)),
    }));
  }

  function addWin(entryId: string) {
    updateEntry(entryId, (e) => ({ ...e, wins: [...e.wins, ''] }));
  }

  function setGratitude(entryId: string, value: string) {
    updateEntry(entryId, (e) => ({ ...e, gratitude: value }));
  }

  function setNotes(entryId: string, value: string) {
    updateEntry(entryId, (e) => ({ ...e, notes: value }));
  }

  function setWinOfTheDay(entryId: string, value: string) {
    updateEntry(entryId, (e) => ({ ...e, winOfTheDay: value }));
  }

  function setDailyPromptResponse(entryId: string, value: string) {
    updateEntry(entryId, (e) => ({ ...e, dailyPromptResponse: value }));
  }

  function setEveningField(entryId: string, field: keyof JournalEntry, value: string | number) {
    updateEntry(entryId, (e) => ({ ...e, [field]: value }));
  }

  function publishEntry(entryId: string) {
    updateEntry(entryId, (e) => ({
      ...e,
      publishedAt: new Date().toISOString(),
    }));
  }

  function unpublishEntry(entryId: string) {
    updateEntry(entryId, (e) => ({
      ...e,
      publishedAt: undefined,
    }));
  }

  function toggleExpanded(id: string) {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExpandedPublished(id: string) {
    setExpandedPublished((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function formatEntryForClipboard(entry: JournalEntry): string {
    const typeLabel = entry.type === 'morning' ? 'Morning Check-In' : entry.type === 'eod' ? 'End of Day Reflection' : entry.type === 'evening' ? 'Evening Check-In' : 'Weekly Pulse';
    const lines: string[] = [];

    lines.push(`=== ${typeLabel} ===`);
    lines.push(`Date: ${formatDate(entry.date)}`);
    if (entry.publishedAt) lines.push(`Published: ${new Date(entry.publishedAt).toLocaleString()}`);
    lines.push('');

    if (entry.mood) {
      const mc = moodConfig[entry.mood];
      lines.push(`Mood: ${mc.emoji} ${mc.label}`);
    }
    if (entry.energy) lines.push(`Energy: ${entry.energy}/5 (${energyLabels[entry.energy]})`);
    if (entry.mood || entry.energy) lines.push('');

    if ((entry.winOfTheDay ?? '').trim()) {
      lines.push('Win of the Day:');
      lines.push(entry.winOfTheDay);
      lines.push('');
    }

    if (entry.checklist.length > 0) {
      const completed = entry.checklist.filter((c) => c.checked).length;
      lines.push(`Checklist (${completed}/${entry.checklist.length}):`);
      for (const item of entry.checklist) {
        lines.push(`  ${item.checked ? '[x]' : '[ ]'} ${item.text}`);
      }
      lines.push('');
    }

    if (entry.reflections.filter(Boolean).length > 0) {
      lines.push('Reflections:');
      for (const r of entry.reflections.filter(Boolean)) {
        lines.push(`  - ${r}`);
      }
      lines.push('');
    }

    if (entry.wins.filter(Boolean).length > 0) {
      lines.push('Wins:');
      for (const w of entry.wins.filter(Boolean)) {
        lines.push(`  - ${w}`);
      }
      lines.push('');
    }

    if ((entry.gratitude ?? '').trim()) {
      lines.push(`Gratitude: ${entry.gratitude}`);
      lines.push('');
    }

    if ((entry.notes ?? '').trim()) {
      lines.push('Notes:');
      lines.push(entry.notes);
      lines.push('');
    }

    if ((entry.dailyPromptResponse ?? '').trim()) {
      lines.push('Daily Prompt Response:');
      lines.push(entry.dailyPromptResponse);
      lines.push('');
    }

    // Evening-specific fields
    if (entry.type === 'evening') {
      if ((entry.eveningWentWell ?? '').trim()) {
        lines.push('What Went Well:');
        lines.push(entry.eveningWentWell!);
        lines.push('');
      }
      if ((entry.eveningCouldImprove ?? '').trim()) {
        lines.push('Could Have Gone Better:');
        lines.push(entry.eveningCouldImprove!);
        lines.push('');
      }
      if ((entry.eveningGratitude ?? '').trim()) {
        lines.push('Evening Gratitude:');
        lines.push(entry.eveningGratitude!);
        lines.push('');
      }
      if ((entry.eveningTomorrowPriority ?? '').trim()) {
        lines.push(`Tomorrow's #1 Priority: ${entry.eveningTomorrowPriority}`);
      }
      if (entry.eveningTomorrowEnergy) {
        lines.push(`Energy for Tomorrow: ${entry.eveningTomorrowEnergy}/5`);
      }
      if ((entry.eveningSleepIntention ?? '').trim()) {
        lines.push(`Sleep Intention: ${entry.eveningSleepIntention}`);
      }
    }

    return lines.join('\n').trim();
  }

  function copyEntryToClipboard(entry: JournalEntry) {
    const text = formatEntryForClipboard(entry);
    navigator.clipboard.writeText(text).then(() => {
      setToastMessage('Entry copied to clipboard');
      setTimeout(() => setToastMessage(null), 2500);
    });
  }

  // Past entries (excluding today)
  const pastEntries = useMemo(
    () => journal.entries.filter((e) => e.date !== today).sort((a, b) => b.date.localeCompare(a.date)),
    [journal.entries, today]
  );

  // Active entry to render
  const activeEntry = todayEntry ?? null;
  const checklistProgress = activeEntry
    ? activeEntry.checklist.filter((c) => c.checked).length
    : 0;
  const checklistTotal = activeEntry ? activeEntry.checklist.length : defaultChecklist.length;

  const dailyPrompt = getDailyPrompt();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const tabConfig: { type: EntryType; icon: typeof Sun; label: string; sublabel: string }[] = [
    { type: 'morning', icon: Sun, label: 'Morning', sublabel: 'Set intentions' },
    { type: 'eod', icon: Moon, label: 'End of Day', sublabel: 'Reflect & close' },
    { type: 'evening', icon: Moon, label: 'Evening', sublabel: 'Wind down & plan' },
    { type: 'weekly', icon: CalendarDays, label: 'Weekly Pulse', sublabel: 'Step back & assess' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="gradient-text">Journal & Reflection</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {ownerName}&apos;s personal operating rhythm — powered by your Team OS
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Streak indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Flame size={14} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">{stats.total}</span>
            <span className="text-xs text-text-muted">this week</span>
          </div>
        </div>
      </div>

      {/* Mantra card */}
      {memberOS && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-accent/5 via-accent-blue/5 to-accent-purple/5 border border-accent/20 px-5 py-4">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-30" />
          <div className="relative flex items-center gap-3">
            <Sparkles size={18} className="text-accent flex-shrink-0" />
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-0.5">Your Mantra</p>
              <p className="text-sm font-medium text-foreground italic">&ldquo;{memberOS.operatingSystem.mantra}&rdquo;</p>
            </div>
          </div>
        </div>
      )}

      {/* Week stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sun size={13} className="text-amber-400" />
            <span className="text-xs text-text-muted">Mornings</span>
          </div>
          <p className="text-lg font-bold text-foreground">{stats.mornings}<span className="text-xs text-text-muted font-normal">/7</span></p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Moon size={13} className="text-indigo-400" />
            <span className="text-xs text-text-muted">EODs</span>
          </div>
          <p className="text-lg font-bold text-foreground">{stats.eods}<span className="text-xs text-text-muted font-normal">/7</span></p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Moon size={13} className="text-purple-400" />
            <span className="text-xs text-text-muted">Evenings</span>
          </div>
          <p className="text-lg font-bold text-foreground">{stats.evenings}<span className="text-xs text-text-muted font-normal">/7</span></p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={13} className="text-accent" />
            <span className="text-xs text-text-muted">Weekly</span>
          </div>
          <p className="text-lg font-bold text-foreground">{stats.weeklys}<span className="text-xs text-text-muted font-normal">/1</span></p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={13} className="text-emerald-400" />
            <span className="text-xs text-text-muted">Avg Mood</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {stats.avgMood > 0 ? stats.avgMood.toFixed(1) : '\u2014'}<span className="text-xs text-text-muted font-normal">/5</span>
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        {tabConfig.map(({ type, icon: Icon, label, sublabel }) => {
          const isActive = activeTab === type;
          const hasToday = journal.entries.some((e) => e.date === today && e.type === type);
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all text-left ${
                isActive
                  ? 'bg-accent/10 border-accent/30 ring-1 ring-accent/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-accent' : 'text-text-muted'} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-semibold ${isActive ? 'text-accent' : 'text-foreground'}`}>{label}</span>
                  {hasToday && (
                    <Check size={12} className="text-emerald-400" />
                  )}
                </div>
                <span className="text-[10px] text-text-muted">{sublabel}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Today's entry */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-accent" />
            <span className="text-sm font-semibold text-foreground">
              {activeTab === 'morning' ? 'Morning Check-In' : activeTab === 'eod' ? 'End of Day Reflection' : activeTab === 'evening' ? 'Evening Check-In' : 'Weekly Pulse'}
            </span>
            <span className="text-xs text-text-muted">&mdash; {formatDate(today)}</span>
            {/* Published badge */}
            {activeEntry?.publishedAt && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                <Lock size={9} />
                Published &#10003; {formatTimestamp(activeEntry.publishedAt)}
              </span>
            )}
          </div>
          {!activeEntry && (
            <button
              onClick={ensureTodayEntry}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-colors"
            >
              Start Today&apos;s Entry
            </button>
          )}
        </div>

        {activeEntry ? (
          <div className="p-5 space-y-6">
            {/* ============================================================= */}
            {/* EVENING CHECK-IN FORM */}
            {/* ============================================================= */}
            {activeTab === 'evening' ? (
              <>
                {/* What went well today? */}
                <div className="relative overflow-hidden rounded-xl bg-indigo-500/5 border border-indigo-500/25 p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-transparent" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-indigo-400" />
                      <p className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest">What went well today?</p>
                    </div>
                    <textarea
                      value={activeEntry.eveningWentWell ?? ''}
                      onChange={(e) => setEveningField(activeEntry.id, 'eveningWentWell', e.target.value)}
                      placeholder="Celebrate your wins, big and small..."
                      rows={3}
                      className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-indigo-400/30 focus:border-indigo-400/40 focus:ring-1 focus:ring-indigo-400/20 outline-none resize-none transition-colors"
                    />
                  </div>
                </div>

                {/* What could have gone better? */}
                <div className="relative overflow-hidden rounded-xl bg-purple-500/5 border border-purple-500/25 p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-transparent" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <RotateCcw size={14} className="text-purple-400" />
                      <p className="text-[10px] text-purple-400/80 font-bold uppercase tracking-widest">What could have gone better?</p>
                    </div>
                    <textarea
                      value={activeEntry.eveningCouldImprove ?? ''}
                      onChange={(e) => setEveningField(activeEntry.id, 'eveningCouldImprove', e.target.value)}
                      placeholder="Honest reflection without judgment..."
                      rows={3}
                      className="w-full bg-purple-500/5 border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-purple-400/30 focus:border-purple-400/40 focus:ring-1 focus:ring-purple-400/20 outline-none resize-none transition-colors"
                    />
                  </div>
                </div>

                {/* Gratitude - 3 things */}
                <div className="relative overflow-hidden rounded-xl bg-indigo-500/5 border border-indigo-500/25 p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-transparent" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart size={14} className="text-indigo-400" />
                      <p className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest">Gratitude &mdash; 3 things I&apos;m grateful for</p>
                    </div>
                    <textarea
                      value={activeEntry.eveningGratitude ?? ''}
                      onChange={(e) => setEveningField(activeEntry.id, 'eveningGratitude', e.target.value)}
                      placeholder="1. &#10;2. &#10;3. "
                      rows={3}
                      className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-indigo-400/30 focus:border-indigo-400/40 focus:ring-1 focus:ring-indigo-400/20 outline-none resize-none transition-colors"
                    />
                  </div>
                </div>

                {/* Tomorrow's #1 priority */}
                <div className="relative overflow-hidden rounded-xl bg-purple-500/5 border border-purple-500/25 p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-transparent" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={14} className="text-purple-400" />
                      <p className="text-[10px] text-purple-400/80 font-bold uppercase tracking-widest">Tomorrow&apos;s #1 Priority</p>
                    </div>
                    <textarea
                      value={activeEntry.eveningTomorrowPriority ?? ''}
                      onChange={(e) => setEveningField(activeEntry.id, 'eveningTomorrowPriority', e.target.value)}
                      placeholder="The single most important thing to accomplish tomorrow..."
                      rows={2}
                      className="w-full bg-purple-500/5 border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-purple-400/30 focus:border-purple-400/40 focus:ring-1 focus:ring-purple-400/20 outline-none resize-none transition-colors"
                    />
                  </div>
                </div>

                {/* Energy level for tomorrow & Sleep intention */}
                <div className="flex flex-wrap gap-4">
                  {/* Energy level for tomorrow */}
                  <div>
                    <p className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wider">Energy for Tomorrow</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => {
                        const isSelected = (activeEntry.eveningTomorrowEnergy ?? 0) >= level;
                        return (
                          <button
                            key={level}
                            onClick={() => setEveningField(activeEntry.id, 'eveningTomorrowEnergy', level)}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                                : 'bg-white/3 border-white/10 text-text-muted hover:bg-white/8'
                            }`}
                            title={energyLabels[level]}
                          >
                            {level}
                          </button>
                        );
                      })}
                      {activeEntry.eveningTomorrowEnergy && (
                        <span className="text-[10px] text-text-muted self-center ml-1">{energyLabels[activeEntry.eveningTomorrowEnergy]}</span>
                      )}
                    </div>
                  </div>

                  {/* Sleep intention */}
                  <div className="flex-1 min-w-[180px]">
                    <p className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wider">Sleep Intention</p>
                    <input
                      type="text"
                      value={activeEntry.eveningSleepIntention ?? ''}
                      onChange={(e) => setEveningField(activeEntry.id, 'eveningSleepIntention', e.target.value)}
                      placeholder="e.g. 10:30 PM"
                      className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-indigo-400/30 focus:border-indigo-400/40 focus:ring-1 focus:ring-indigo-400/20 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Publish button for evening */}
                <div className="pt-2">
                  {activeEntry.publishedAt ? (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                      <Lock size={14} />
                      <span className="text-sm font-semibold">Published &#10003;</span>
                      <span className="text-xs text-emerald-400/60">&mdash; {formatTimestamp(activeEntry.publishedAt)}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => publishEntry(activeEntry.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500/80 via-purple-500/80 to-indigo-600/80 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-600 text-white font-semibold text-sm border border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20"
                    >
                      <Send size={14} />
                      Publish Entry
                    </button>
                  )}
                </div>
              </>
            ) : (
            <>
            {/* ============================================================= */}
            {/* FEATURE 5: QUESTION OF THE DAY — Daily Firm Prompt */}
            {/* ============================================================= */}
            <div className="relative overflow-hidden rounded-xl bg-teal-500/5 border border-teal-500/25 p-4">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/8 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={14} className="text-teal-400" />
                  <p className="text-[10px] text-teal-400/80 font-bold uppercase tracking-widest">Question of the Day</p>
                </div>
                <p className="text-sm font-semibold text-teal-300 mb-3 leading-relaxed">
                  {dailyPrompt}
                </p>
                <textarea
                  value={activeEntry.dailyPromptResponse ?? ''}
                  onChange={(e) => setDailyPromptResponse(activeEntry.id, e.target.value)}
                  placeholder="Your response..."
                  rows={2}
                  className="w-full bg-teal-500/5 border border-teal-500/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-teal-400/30 focus:border-teal-400/40 focus:ring-1 focus:ring-teal-400/20 outline-none resize-none transition-colors"
                />
              </div>
            </div>

            {/* Mood & Energy */}
            <div className="flex flex-wrap gap-4">
              {/* Mood selector */}
              <div>
                <p className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wider">Mood</p>
                <div className="flex gap-1.5">
                  {(Object.keys(moodConfig) as Mood[]).map((m) => {
                    const { emoji, label, color } = moodConfig[m];
                    const isSelected = activeEntry.mood === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setMood(activeEntry.id, m)}
                        className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-white/10 border-white/20 ring-1 ring-accent/30'
                            : 'bg-white/3 border-transparent hover:bg-white/8'
                        }`}
                        title={label}
                      >
                        <span className="text-base">{emoji}</span>
                        <span className={`text-[9px] font-medium ${isSelected ? color : 'text-text-muted'}`}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Energy level */}
              <div>
                <p className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wider">Energy</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const isSelected = (activeEntry.energy ?? 0) >= level;
                    return (
                      <button
                        key={level}
                        onClick={() => setEnergy(activeEntry.id, level)}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-accent/20 border-accent/40 text-accent'
                            : 'bg-white/3 border-white/10 text-text-muted hover:bg-white/8'
                        }`}
                        title={energyLabels[level]}
                      >
                        {level}
                      </button>
                    );
                  })}
                  {activeEntry.energy && (
                    <span className="text-[10px] text-text-muted self-center ml-1">{energyLabels[activeEntry.energy]}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* FEATURE 2: WIN OF THE DAY */}
            {/* ============================================================= */}
            <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={16} className="text-amber-400" />
                  <p className="text-xs text-amber-400/90 font-bold uppercase tracking-widest">Win of the Day</p>
                </div>
                <p className="text-[10px] text-amber-400/50 mb-2">What&apos;s your single biggest win today?</p>
                <textarea
                  value={activeEntry.winOfTheDay ?? ''}
                  onChange={(e) => setWinOfTheDay(activeEntry.id, e.target.value)}
                  placeholder="My biggest win today..."
                  rows={2}
                  className="w-full bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground placeholder:text-amber-400/30 focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 outline-none resize-none transition-colors"
                />
              </div>
            </div>

            {/* Checklist from TeamOS */}
            {activeEntry.checklist.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target size={13} className="text-accent" />
                    <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                      {activeTab === 'morning' ? 'Morning Checklist' : activeTab === 'eod' ? 'Evening Reflection' : 'Weekly Pulse'}
                    </p>
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {checklistProgress}/{checklistTotal} complete
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-white/5 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${checklistTotal > 0 ? (checklistProgress / checklistTotal) * 100 : 0}%` }}
                  />
                </div>
                <div className="space-y-1.5">
                  {activeEntry.checklist.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => toggleChecklist(activeEntry.id, i)}
                      className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        item.checked
                          ? 'bg-accent/25 border-accent/50 text-accent'
                          : 'border-white/20 group-hover:border-white/40'
                      }`}>
                        {item.checked && <Check size={10} />}
                      </div>
                      <span className={`text-sm ${item.checked ? 'text-text-muted line-through' : 'text-foreground'}`}>
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reflection prompts */}
            {reflectionPrompts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={13} className="text-accent-purple" />
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Reflections</p>
                </div>
                <div className="space-y-3">
                  {reflectionPrompts.map((prompt, i) => (
                    <div key={i}>
                      <p className="text-xs text-text-secondary mb-1 italic">{prompt}</p>
                      <textarea
                        value={activeEntry.reflections[i] ?? ''}
                        onChange={(e) => setReflection(activeEntry.id, i, e.target.value)}
                        placeholder="Write your thoughts..."
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-text-muted/50 focus:border-accent/40 focus:ring-1 focus:ring-accent/20 outline-none resize-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wins */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} className="text-amber-400" />
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                  {activeTab === 'morning' ? 'Intentions for Today' : 'Wins'}
                </p>
              </div>
              <div className="space-y-2">
                {activeEntry.wins.map((win, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Circle size={6} className="text-accent flex-shrink-0" />
                    <input
                      type="text"
                      value={win}
                      onChange={(e) => setWin(activeEntry.id, i, e.target.value)}
                      placeholder={activeTab === 'morning' ? `Intention ${i + 1}...` : `Win ${i + 1}...`}
                      className="flex-1 bg-transparent border-b border-white/10 px-1 py-1 text-sm text-foreground placeholder:text-text-muted/40 focus:border-accent/40 outline-none transition-colors"
                    />
                  </div>
                ))}
                <button
                  onClick={() => addWin(activeEntry.id)}
                  className="text-xs text-accent/60 hover:text-accent transition-colors mt-1"
                >
                  + Add another
                </button>
              </div>
            </div>

            {/* Gratitude */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart size={13} className="text-rose-400" />
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Gratitude</p>
              </div>
              <input
                type="text"
                value={activeEntry.gratitude}
                onChange={(e) => setGratitude(activeEntry.id, e.target.value)}
                placeholder="One thing I'm grateful for..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-text-muted/50 focus:border-accent/40 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
              />
            </div>

            {/* Free-form notes */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={13} className="text-text-muted" />
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Notes</p>
              </div>
              <textarea
                value={activeEntry.notes}
                onChange={(e) => setNotes(activeEntry.id, e.target.value)}
                placeholder="Anything else on your mind..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-text-muted/50 focus:border-accent/40 focus:ring-1 focus:ring-accent/20 outline-none resize-none transition-colors"
              />
            </div>

            {/* ============================================================= */}
            {/* FEATURE 1: PUBLISH BUTTON */}
            {/* ============================================================= */}
            <div className="pt-2">
              {activeEntry.publishedAt ? (
                <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                  <Lock size={14} />
                  <span className="text-sm font-semibold">Published &#10003;</span>
                  <span className="text-xs text-emerald-400/60">&mdash; {formatTimestamp(activeEntry.publishedAt)}</span>
                </div>
              ) : (
                <button
                  onClick={() => publishEntry(activeEntry.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent/80 via-accent-blue/80 to-accent-purple/80 hover:from-accent hover:via-accent-blue hover:to-accent-purple text-white font-semibold text-sm border border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
                >
                  <Send size={14} />
                  Publish Entry
                </button>
              )}
            </div>
            </>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
              {activeTab === 'morning' ? <Sun size={24} className="text-accent" /> : activeTab === 'eod' ? <Moon size={24} className="text-accent" /> : activeTab === 'evening' ? <Moon size={24} className="text-indigo-400" /> : <CalendarDays size={24} className="text-accent" />}
            </div>
            <p className="text-sm text-foreground font-medium mb-1">
              {activeTab === 'morning' ? 'Start your morning check-in' : activeTab === 'eod' ? 'Reflect on your day' : activeTab === 'evening' ? 'Wind down & plan tomorrow' : 'Take your weekly pulse'}
            </p>
            <p className="text-xs text-text-muted mb-4">
              {memberOS
                ? `Your ${activeTab === 'morning' ? 'morning checklist' : activeTab === 'eod' ? 'evening reflection' : activeTab === 'evening' ? 'evening check-in' : 'weekly pulse'} from your Team OS will guide you.`
                : 'Set your intentions and track your operating rhythm.'}
            </p>
            <button
              onClick={ensureTodayEntry}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-colors"
            >
              Begin
            </button>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* FEATURE 3 & 4: AI INSIGHTS & FEEDBACK */}
      {/* ============================================================= */}
      <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-indigo-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-indigo-400" />
            <span className="text-sm font-semibold text-foreground">AI Insights</span>
            <span className="text-[10px] text-indigo-400/60 px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 font-medium">
              {aiAnalysis.entryCount} entries analyzed
            </span>
          </div>
          <div className="flex gap-1">
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                onClick={() => setAiTimeRange(days)}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all ${
                  aiTimeRange === days
                    ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                    : 'bg-white/3 border-white/10 text-text-muted hover:bg-white/8'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Theme chips */}
          {aiAnalysis.themes.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain size={13} className="text-indigo-400" />
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Recurring Themes</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.themes.slice(0, 10).map(({ theme, count }) => (
                  <span
                    key={theme}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300"
                  >
                    {theme}
                    <span className="text-[10px] text-indigo-400/60 bg-indigo-500/15 px-1.5 py-0.5 rounded-full font-bold">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
              {/* Theme Trends */}
              {aiAnalysis.themes.length > 0 && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/8 border border-indigo-500/15">
                  <TrendingUp size={12} className="text-indigo-400 flex-shrink-0" />
                  <p className="text-xs text-indigo-300/80">
                    <span className="font-semibold text-indigo-300">Theme Trends:</span>{' '}
                    {aiTimeRange <= 7 ? 'This week' : aiTimeRange <= 14 ? 'Past two weeks' : 'This month'} you focused most on{' '}
                    <span className="font-bold text-indigo-200">{aiAnalysis.themes[0].theme}</span>
                    {aiAnalysis.themes.length > 1 && (
                      <>
                        {' '}followed by{' '}
                        <span className="font-bold text-indigo-200">{aiAnalysis.themes[1].theme}</span>
                      </>
                    )}
                    .
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <Brain size={20} className="mx-auto text-indigo-400/30 mb-2" />
              <p className="text-xs text-text-muted">
                Start journaling to see AI-powered theme analysis. Themes are extracted from your reflections, wins, notes, and prompts.
              </p>
            </div>
          )}

          {/* AI Feedback messages */}
          {aiAnalysis.feedback.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award size={13} className="text-indigo-400" />
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">AI Coach Feedback</p>
              </div>
              <div className="space-y-2">
                {aiAnalysis.feedback.map((fb, i) => {
                  const FBIcon = fb.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/8 hover:bg-white/5 transition-colors"
                    >
                      <FBIcon size={14} className={`${fb.iconColor} flex-shrink-0 mt-0.5`} />
                      <p className="text-sm text-text-secondary leading-relaxed">{fb.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {aiAnalysis.feedback.length === 0 && aiAnalysis.themes.length > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/8">
              <Lightbulb size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary leading-relaxed">
                Keep journaling consistently to unlock personalized coaching feedback. The AI coach analyzes mood, energy, checklist completion, and themes across your entries.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* PUBLISHED LIBRARY */}
      {/* ============================================================= */}
      {publishedEntries.length > 0 && (
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 overflow-hidden">
          <button
            onClick={() => setShowPublishedLibrary(!showPublishedLibrary)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-emerald-500/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bookmark size={14} className="text-emerald-400" />
              <span className="text-sm font-semibold text-foreground">{'\u{1F4DA}'} Published Library</span>
              <span className="text-xs text-emerald-400/70 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-medium">
                {publishedStats.total} {publishedStats.total === 1 ? 'entry' : 'entries'} published
              </span>
            </div>
            {showPublishedLibrary ? <ChevronDown size={14} className="text-emerald-400/60" /> : <ChevronRight size={14} className="text-emerald-400/60" />}
          </button>

          {showPublishedLibrary && (
            <div className="border-t border-emerald-500/15">
              {/* Published Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
                <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/15 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Bookmark size={12} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold">Total</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-300">{publishedStats.total}</p>
                </div>
                <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/15 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame size={12} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold">Streak</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-300">
                    {publishedStats.streak}<span className="text-xs text-emerald-400/50 font-normal ml-0.5">{publishedStats.streak === 1 ? 'day' : 'days'}</span>
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/15 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={12} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold">Most Common</span>
                  </div>
                  <p className="text-sm font-bold text-emerald-300">
                    {publishedStats.mostCommonType === 'morning' ? 'Morning' : publishedStats.mostCommonType === 'eod' ? 'EOD' : publishedStats.mostCommonType === 'evening' ? 'Evening' : publishedStats.mostCommonType === 'weekly' ? 'Weekly' : '\u2014'}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/15 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold">Avg Mood</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-300">
                    {publishedStats.avgMood > 0 ? publishedStats.avgMood.toFixed(1) : '\u2014'}<span className="text-xs text-emerald-400/50 font-normal">/5</span>
                  </p>
                </div>
              </div>

              {/* Published Entry Cards */}
              <div className="divide-y divide-emerald-500/10">
                {publishedEntries.map((entry) => {
                  const isExpanded = expandedPublished.has(entry.id);
                  const completed = entry.checklist.filter((c) => c.checked).length;
                  const total = entry.checklist.length;
                  const TypeIcon = entry.type === 'morning' ? Sun : entry.type === 'evening' ? Moon : entry.type === 'weekly' ? CalendarDays : Moon;
                  const typeIconColor = entry.type === 'morning' ? 'text-amber-400' : entry.type === 'evening' ? 'text-purple-400' : entry.type === 'weekly' ? 'text-accent' : 'text-indigo-400';
                  const typeLabel = entry.type === 'morning' ? 'Morning' : entry.type === 'eod' ? 'EOD' : entry.type === 'evening' ? 'Evening' : 'Weekly';

                  // Build preview text
                  const previewParts = [
                    ...entry.reflections.filter(Boolean),
                    (entry.notes ?? '').trim(),
                    (entry.eveningWentWell ?? '').trim(),
                  ].filter(Boolean);
                  const previewText = previewParts.join(' ').slice(0, 100);

                  return (
                    <div key={entry.id} className="hover:bg-emerald-500/3 transition-colors">
                      {/* Card header - clickable */}
                      <button
                        onClick={() => toggleExpandedPublished(entry.id)}
                        className="w-full px-5 py-3 flex items-center gap-3 text-left"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon size={14} className={typeIconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">{typeLabel}</span>
                            <span className="text-xs text-text-muted">{formatDate(entry.date)}</span>
                            {entry.publishedAt && (
                              <span className="text-[9px] text-emerald-400/60">{'\u2022'} Published {formatTimestamp(entry.publishedAt)}</span>
                            )}
                          </div>
                          {/* Preview line */}
                          {previewText && (
                            <p className="text-xs text-text-muted truncate mt-0.5">{previewText}{previewParts.join(' ').length > 100 ? '...' : ''}</p>
                          )}
                          {/* Inline indicators */}
                          <div className="flex items-center gap-3 mt-1">
                            {entry.mood && (
                              <span className="text-[10px] text-text-muted">{moodConfig[entry.mood].emoji} {moodConfig[entry.mood].label}</span>
                            )}
                            {entry.energy && (
                              <span className="text-[10px] text-text-muted">{'\u26A1'}{entry.energy}/5</span>
                            )}
                            {total > 0 && (
                              <span className="text-[10px] text-text-muted">{'\u2705'} {completed}/{total}</span>
                            )}
                            {(entry.winOfTheDay ?? '').trim() && (
                              <span className="text-[10px] text-amber-400/70">{'\u{1F3C6}'} Win logged</span>
                            )}
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown size={12} className="text-emerald-400/50" /> : <ChevronRight size={12} className="text-emerald-400/50" />}
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-5 pb-4 space-y-3">
                          {/* Action buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyEntryToClipboard(entry)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                              <Copy size={11} />
                              Save to Clipboard
                            </button>
                            <button
                              onClick={() => unpublishEntry(entry.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-text-muted hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-colors"
                            >
                              <X size={11} />
                              Unpublish
                            </button>
                          </div>

                          {/* Win of the Day */}
                          {(entry.winOfTheDay ?? '').trim() && (
                            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
                              <Trophy size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] text-amber-400/70 uppercase tracking-wider font-semibold mb-0.5">Win of the Day</p>
                                <p className="text-xs text-amber-300/90">{entry.winOfTheDay}</p>
                              </div>
                            </div>
                          )}

                          {/* Daily prompt response */}
                          {(entry.dailyPromptResponse ?? '').trim() && (
                            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-teal-500/5 border border-teal-500/15">
                              <MessageCircle size={12} className="text-teal-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] text-teal-400/70 uppercase tracking-wider font-semibold mb-0.5">Daily Prompt Response</p>
                                <p className="text-xs text-teal-300/90">{entry.dailyPromptResponse}</p>
                              </div>
                            </div>
                          )}

                          {/* Evening-specific fields */}
                          {entry.type === 'evening' && (
                            <div className="space-y-2">
                              {(entry.eveningWentWell ?? '').trim() && (
                                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                                  <Sparkles size={12} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] text-indigo-400/70 uppercase tracking-wider font-semibold mb-0.5">What Went Well</p>
                                    <p className="text-xs text-indigo-300/90 whitespace-pre-wrap">{entry.eveningWentWell}</p>
                                  </div>
                                </div>
                              )}
                              {(entry.eveningCouldImprove ?? '').trim() && (
                                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/15">
                                  <RotateCcw size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] text-purple-400/70 uppercase tracking-wider font-semibold mb-0.5">Could Have Gone Better</p>
                                    <p className="text-xs text-purple-300/90 whitespace-pre-wrap">{entry.eveningCouldImprove}</p>
                                  </div>
                                </div>
                              )}
                              {(entry.eveningGratitude ?? '').trim() && (
                                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                                  <Heart size={12} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] text-indigo-400/70 uppercase tracking-wider font-semibold mb-0.5">Gratitude</p>
                                    <p className="text-xs text-indigo-300/90 whitespace-pre-wrap">{entry.eveningGratitude}</p>
                                  </div>
                                </div>
                              )}
                              {(entry.eveningTomorrowPriority ?? '').trim() && (
                                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/15">
                                  <Target size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] text-purple-400/70 uppercase tracking-wider font-semibold mb-0.5">Tomorrow&apos;s #1 Priority</p>
                                    <p className="text-xs text-purple-300/90">{entry.eveningTomorrowPriority}</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-4 px-3 py-2">
                                {entry.eveningTomorrowEnergy && (
                                  <div className="flex items-center gap-1.5">
                                    <Zap size={12} className="text-indigo-400" />
                                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Energy:</span>
                                    <span className="text-xs text-indigo-300 font-medium">{entry.eveningTomorrowEnergy}/5 {energyLabels[entry.eveningTomorrowEnergy]}</span>
                                  </div>
                                )}
                                {(entry.eveningSleepIntention ?? '').trim() && (
                                  <div className="flex items-center gap-1.5">
                                    <Moon size={12} className="text-indigo-400" />
                                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Sleep:</span>
                                    <span className="text-xs text-indigo-300 font-medium">{entry.eveningSleepIntention}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Checklist */}
                          {entry.checklist.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold mb-1">Checklist ({completed}/{total})</p>
                              {entry.checklist.map((item) => (
                                <div key={item.id} className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                                    item.checked ? 'bg-emerald-500/25 border-emerald-500/50 text-emerald-400' : 'border-white/20'
                                  }`}>
                                    {item.checked && <Check size={8} />}
                                  </div>
                                  <span className={`text-xs ${item.checked ? 'text-text-muted line-through' : 'text-foreground'}`}>
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reflections */}
                          {entry.reflections.filter(Boolean).length > 0 && (
                            <div>
                              <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold mb-1">Reflections</p>
                              {entry.reflections.filter(Boolean).map((r, i) => (
                                <p key={i} className="text-xs text-text-secondary">&bull; {r}</p>
                              ))}
                            </div>
                          )}

                          {/* Wins */}
                          {entry.wins.filter(Boolean).length > 0 && (
                            <div>
                              <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold mb-1">Wins</p>
                              {entry.wins.filter(Boolean).map((w, i) => (
                                <p key={i} className="text-xs text-text-secondary">&bull; {w}</p>
                              ))}
                            </div>
                          )}

                          {/* Gratitude */}
                          {entry.gratitude && (
                            <div>
                              <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold mb-1">Gratitude</p>
                              <p className="text-xs text-text-secondary">{entry.gratitude}</p>
                            </div>
                          )}

                          {/* Notes */}
                          {entry.notes && (
                            <div>
                              <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold mb-1">Notes</p>
                              <p className="text-xs text-text-secondary whitespace-pre-wrap">{entry.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Commitments & Decision Filter (from TeamOS) */}
      {memberOS && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Commitments */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={13} className="text-amber-400" />
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Your Commitments</p>
            </div>
            <div className="space-y-2">
              {memberOS.operatingSystem.commitments.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="text-xs text-text-secondary leading-relaxed">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Filter */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw size={13} className="text-accent-blue" />
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Decision Filter</p>
            </div>
            <div className="space-y-2">
              {memberOS.operatingSystem.decisionFilter.map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs text-accent/50 font-mono flex-shrink-0">{i + 1}.</span>
                  <span className="text-xs text-text-secondary leading-relaxed italic">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {pastEntries.length > 0 && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-text-muted" />
              <span className="text-sm font-semibold text-foreground">Past Entries</span>
              <span className="text-xs text-text-muted">({pastEntries.length})</span>
            </div>
            {showHistory ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
          </button>

          {showHistory && (
            <div className="border-t border-white/10 divide-y divide-white/5">
              {pastEntries.slice(0, 20).map((entry) => {
                const isExpanded = expandedEntries.has(entry.id);
                const completed = entry.checklist.filter((c) => c.checked).length;
                const total = entry.checklist.length;
                const { emoji } = entry.mood ? moodConfig[entry.mood] : { emoji: '\u{1F4DD}' };

                return (
                  <div key={entry.id}>
                    <button
                      onClick={() => toggleExpanded(entry.id)}
                      className="w-full px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <span className="text-sm">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {entry.type === 'morning' ? 'Morning' : entry.type === 'eod' ? 'EOD' : entry.type === 'evening' ? 'Evening' : 'Weekly'}
                          </span>
                          <span className="text-xs text-text-muted">{formatDate(entry.date)}</span>
                          {entry.publishedAt && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-semibold text-emerald-400">
                              <Lock size={7} />
                              Published
                            </span>
                          )}
                        </div>
                        {total > 0 && (
                          <span className="text-[10px] text-text-muted">{completed}/{total} checked</span>
                        )}
                      </div>
                      {entry.energy && (
                        <span className="text-xs text-accent/60">&#9889;{entry.energy}</span>
                      )}
                      {isExpanded ? <ChevronDown size={12} className="text-text-muted" /> : <ChevronRight size={12} className="text-text-muted" />}
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-4 space-y-3">
                        {/* Win of the Day in history */}
                        {(entry.winOfTheDay ?? '').trim() && (
                          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
                            <Trophy size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-amber-400/70 uppercase tracking-wider font-semibold mb-0.5">Win of the Day</p>
                              <p className="text-xs text-amber-300/90">{entry.winOfTheDay}</p>
                            </div>
                          </div>
                        )}

                        {/* Daily prompt response in history */}
                        {(entry.dailyPromptResponse ?? '').trim() && (
                          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-teal-500/5 border border-teal-500/15">
                            <MessageCircle size={12} className="text-teal-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-teal-400/70 uppercase tracking-wider font-semibold mb-0.5">Daily Prompt Response</p>
                              <p className="text-xs text-teal-300/90">{entry.dailyPromptResponse}</p>
                            </div>
                          </div>
                        )}

                        {/* Evening check-in fields in history */}
                        {entry.type === 'evening' && (
                          <div className="space-y-2">
                            {(entry.eveningWentWell ?? '').trim() && (
                              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                                <Sparkles size={12} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[10px] text-indigo-400/70 uppercase tracking-wider font-semibold mb-0.5">What Went Well</p>
                                  <p className="text-xs text-indigo-300/90 whitespace-pre-wrap">{entry.eveningWentWell}</p>
                                </div>
                              </div>
                            )}
                            {(entry.eveningCouldImprove ?? '').trim() && (
                              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/15">
                                <RotateCcw size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[10px] text-purple-400/70 uppercase tracking-wider font-semibold mb-0.5">Could Have Gone Better</p>
                                  <p className="text-xs text-purple-300/90 whitespace-pre-wrap">{entry.eveningCouldImprove}</p>
                                </div>
                              </div>
                            )}
                            {(entry.eveningGratitude ?? '').trim() && (
                              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                                <Heart size={12} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[10px] text-indigo-400/70 uppercase tracking-wider font-semibold mb-0.5">Gratitude</p>
                                  <p className="text-xs text-indigo-300/90 whitespace-pre-wrap">{entry.eveningGratitude}</p>
                                </div>
                              </div>
                            )}
                            {(entry.eveningTomorrowPriority ?? '').trim() && (
                              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/15">
                                <Target size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[10px] text-purple-400/70 uppercase tracking-wider font-semibold mb-0.5">Tomorrow&apos;s #1 Priority</p>
                                  <p className="text-xs text-purple-300/90">{entry.eveningTomorrowPriority}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-4 px-3 py-2">
                              {entry.eveningTomorrowEnergy && (
                                <div className="flex items-center gap-1.5">
                                  <Zap size={12} className="text-indigo-400" />
                                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Energy:</span>
                                  <span className="text-xs text-indigo-300 font-medium">{entry.eveningTomorrowEnergy}/5 {energyLabels[entry.eveningTomorrowEnergy]}</span>
                                </div>
                              )}
                              {(entry.eveningSleepIntention ?? '').trim() && (
                                <div className="flex items-center gap-1.5">
                                  <Moon size={12} className="text-indigo-400" />
                                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Sleep:</span>
                                  <span className="text-xs text-indigo-300 font-medium">{entry.eveningSleepIntention}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {entry.checklist.length > 0 && (
                          <div className="space-y-1">
                            {entry.checklist.map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                                  item.checked ? 'bg-accent/25 border-accent/50 text-accent' : 'border-white/20'
                                }`}>
                                  {item.checked && <Check size={8} />}
                                </div>
                                <span className={`text-xs ${item.checked ? 'text-text-muted line-through' : 'text-foreground'}`}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {entry.wins.filter(Boolean).length > 0 && (
                          <div>
                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Wins</p>
                            {entry.wins.filter(Boolean).map((w, i) => (
                              <p key={i} className="text-xs text-text-secondary">&bull; {w}</p>
                            ))}
                          </div>
                        )}
                        {entry.gratitude && (
                          <div>
                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Gratitude</p>
                            <p className="text-xs text-text-secondary">{entry.gratitude}</p>
                          </div>
                        )}
                        {entry.notes && (
                          <div>
                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-xs text-text-secondary whitespace-pre-wrap">{entry.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-sm shadow-lg shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <ClipboardCheck size={14} className="text-emerald-400" />
          <span className="text-sm font-medium text-emerald-300">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-emerald-400/50 hover:text-emerald-400 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
