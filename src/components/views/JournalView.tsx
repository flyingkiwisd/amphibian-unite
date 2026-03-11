'use client';

import { useState, useMemo } from 'react';
import {
  Sun, Moon, CalendarDays, TrendingUp, ChevronDown, ChevronRight,
  Check, Circle, Sparkles, BookOpen, Target, AlertTriangle, Heart,
  RotateCcw, Flame, Brain,
} from 'lucide-react';
import { memberIdToOwnerName } from '@/lib/data';
import { getTeamMemberOS } from '@/lib/teamOS';
import { useEditableStore } from '@/lib/useEditableStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type EntryType = 'morning' | 'eod' | 'weekly';
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
}

interface JournalData {
  entries: JournalEntry[];
  streakDays: number;
  lastEntryDate: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const moodConfig: Record<Mood, { emoji: string; label: string; color: string }> = {
  great: { emoji: '🔥', label: 'Great', color: 'text-emerald-400' },
  good: { emoji: '✨', label: 'Good', color: 'text-accent' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'text-text-secondary' },
  tough: { emoji: '💪', label: 'Tough', color: 'text-amber-400' },
  rough: { emoji: '🌧', label: 'Rough', color: 'text-rose-400' },
};

const energyLabels = ['', 'Low', 'Below Avg', 'Normal', 'High', 'Peak'];

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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

  // Find today's entry for the active tab
  const todayEntry = useMemo(
    () => journal.entries.find((e) => e.date === today && e.type === activeTab),
    [journal.entries, today, activeTab]
  );

  // Build checklist from TeamOS
  const defaultChecklist = useMemo((): ChecklistItem[] => {
    if (!memberOS) return [];
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
    const weeklys = thisWeek.filter((e) => e.type === 'weekly').length;
    const avgMood = thisWeek.filter((e) => e.mood).length > 0
      ? thisWeek.reduce((sum, e) => {
          const moodOrder: Record<string, number> = { great: 5, good: 4, neutral: 3, tough: 2, rough: 1 };
          return sum + (moodOrder[e.mood ?? 'neutral'] ?? 3);
        }, 0) / thisWeek.filter((e) => e.mood).length
      : 0;
    return { mornings, eods, weeklys, total: thisWeek.length, avgMood };
  }, [journal.entries]);

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

  function toggleExpanded(id: string) {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const tabConfig: { type: EntryType; icon: typeof Sun; label: string; sublabel: string }[] = [
    { type: 'morning', icon: Sun, label: 'Morning', sublabel: 'Set intentions' },
    { type: 'eod', icon: Moon, label: 'End of Day', sublabel: 'Reflect & close' },
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            {stats.avgMood > 0 ? stats.avgMood.toFixed(1) : '—'}<span className="text-xs text-text-muted font-normal">/5</span>
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
              {activeTab === 'morning' ? 'Morning Check-In' : activeTab === 'eod' ? 'End of Day Reflection' : 'Weekly Pulse'}
            </span>
            <span className="text-xs text-text-muted">— {formatDate(today)}</span>
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
          </div>
        ) : (
          /* Empty state */
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
              {activeTab === 'morning' ? <Sun size={24} className="text-accent" /> : activeTab === 'eod' ? <Moon size={24} className="text-accent" /> : <CalendarDays size={24} className="text-accent" />}
            </div>
            <p className="text-sm text-foreground font-medium mb-1">
              {activeTab === 'morning' ? 'Start your morning check-in' : activeTab === 'eod' ? 'Reflect on your day' : 'Take your weekly pulse'}
            </p>
            <p className="text-xs text-text-muted mb-4">
              {memberOS
                ? `Your ${activeTab === 'morning' ? 'morning checklist' : activeTab === 'eod' ? 'evening reflection' : 'weekly pulse'} from your Team OS will guide you.`
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
                const { emoji } = entry.mood ? moodConfig[entry.mood] : { emoji: '📝' };

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
                            {entry.type === 'morning' ? 'Morning' : entry.type === 'eod' ? 'EOD' : 'Weekly'}
                          </span>
                          <span className="text-xs text-text-muted">{formatDate(entry.date)}</span>
                        </div>
                        {total > 0 && (
                          <span className="text-[10px] text-text-muted">{completed}/{total} checked</span>
                        )}
                      </div>
                      {entry.energy && (
                        <span className="text-xs text-accent/60">⚡{entry.energy}</span>
                      )}
                      {isExpanded ? <ChevronDown size={12} className="text-text-muted" /> : <ChevronRight size={12} className="text-text-muted" />}
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-4 space-y-3">
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
                              <p key={i} className="text-xs text-text-secondary">• {w}</p>
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
    </div>
  );
}
