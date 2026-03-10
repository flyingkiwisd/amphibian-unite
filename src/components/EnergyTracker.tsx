'use client';

import { useState, useEffect, useMemo } from 'react';
import { Battery, Brain, Sun, Moon, Lightbulb } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────

interface EnergyEntry {
  date: string;
  morning: { energy: number; focus: number } | null;
  evening: { energy: number; focus: number } | null;
}

interface EnergyData {
  [memberId: string]: EnergyEntry[];
}

// ── Helpers ────────────────────────────────────────────────

const LS_KEY = 'amphibian-energy-tracker';

const todayStr = () => new Date().toISOString().split('T')[0];

const getLast7Days = (): string[] => {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const weekdayShort = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

const scoreColor = (score: number) => {
  if (score >= 4) return 'text-teal-400';
  if (score === 3) return 'text-amber-400';
  return 'text-rose-400';
};

const scoreBg = (score: number) => {
  if (score >= 4) return 'bg-teal-500';
  if (score === 3) return 'bg-amber-500';
  return 'bg-rose-500';
};

const scoreBgFaint = (score: number) => {
  if (score >= 4) return 'bg-teal-500/20 border-teal-500/30';
  if (score === 3) return 'bg-amber-500/20 border-amber-500/30';
  return 'bg-rose-500/20 border-rose-500/30';
};

// ── Mock data generator ───────────────────────────────────

const generateMockData = (memberId: string): EnergyEntry[] => {
  const entries: EnergyEntry[] = [];
  const last7 = getLast7Days();

  const mockEnergy = [
    { morning: { energy: 4, focus: 3 }, evening: { energy: 2, focus: 2 } },
    { morning: { energy: 3, focus: 4 }, evening: { energy: 3, focus: 3 } },
    { morning: { energy: 2, focus: 2 }, evening: { energy: 1, focus: 2 } }, // Wednesday dip
    { morning: { energy: 4, focus: 4 }, evening: { energy: 3, focus: 4 } },
    { morning: { energy: 5, focus: 5 }, evening: { energy: 4, focus: 4 } },
    { morning: { energy: 3, focus: 3 }, evening: { energy: 3, focus: 2 } },
    { morning: null, evening: null }, // today - empty
  ];

  for (let i = 0; i < last7.length; i++) {
    entries.push({
      date: last7[i],
      morning: mockEnergy[i]?.morning ?? null,
      evening: mockEnergy[i]?.evening ?? null,
    });
  }

  return entries;
};

// ── Pattern detection ─────────────────────────────────────

const detectPattern = (entries: EnergyEntry[]): string | null => {
  if (entries.length < 3) return null;

  // Find lowest energy day
  let lowestDay = '';
  let lowestScore = 6;

  for (const entry of entries) {
    if (!entry.morning) continue;
    const avg = entry.morning.energy;
    if (avg < lowestScore) {
      lowestScore = avg;
      const d = new Date(entry.date + 'T12:00:00');
      lowestDay = d.toLocaleDateString('en-US', { weekday: 'long' });
    }
  }

  if (lowestDay && lowestScore <= 2) {
    const dayBefore = lowestDay === 'Monday' ? 'Sunday' : lowestDay === 'Wednesday' ? 'Tuesday' : 'the day before';
    return `Your energy tends to dip on ${lowestDay}s \u2014 consider blocking focused time on ${dayBefore}s.`;
  }

  // Check for afternoon dip pattern
  let dips = 0;
  for (const entry of entries) {
    if (entry.morning && entry.evening) {
      if (entry.evening.energy < entry.morning.energy - 1) dips++;
    }
  }
  if (dips >= 3) {
    return 'You show a consistent afternoon energy drop. Try scheduling your most demanding work before noon.';
  }

  return null;
};

// ── Component ──────────────────────────────────────────────

export function EnergyTracker({ memberId }: { memberId: string }) {
  const [data, setData] = useState<EnergyData>({});
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>('morning');

  const today = todayStr();
  const last7 = useMemo(() => getLast7Days(), []);

  // Load data
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        const mock: EnergyData = { [memberId]: generateMockData(memberId) };
        setData(mock);
        localStorage.setItem(LS_KEY, JSON.stringify(mock));
      }
    } else {
      const mock: EnergyData = { [memberId]: generateMockData(memberId) };
      setData(mock);
      localStorage.setItem(LS_KEY, JSON.stringify(mock));
    }
  }, [memberId]);

  // Save data
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    }
  }, [data]);

  const memberEntries = data[memberId] || [];
  const todayEntry = memberEntries.find((e) => e.date === today);
  const currentScores = timeOfDay === 'morning' ? todayEntry?.morning : todayEntry?.evening;
  const pattern = useMemo(() => detectPattern(memberEntries), [memberEntries]);

  // ── Handlers ──

  const setScore = (type: 'energy' | 'focus', value: number) => {
    setData((prev) => {
      const entries = [...(prev[memberId] || [])];
      const idx = entries.findIndex((e) => e.date === today);
      const existing = idx >= 0 ? entries[idx] : { date: today, morning: null, evening: null };
      const currentPeriod = existing[timeOfDay] || { energy: 0, focus: 0 };
      const updatedPeriod = { ...currentPeriod, [type]: value };
      const updatedEntry = { ...existing, [timeOfDay]: updatedPeriod };

      if (idx >= 0) {
        entries[idx] = updatedEntry;
      } else {
        entries.push(updatedEntry);
      }

      return { ...prev, [memberId]: entries };
    });
  };

  // ── Render ──

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Battery className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Energy & Focus</h3>
        </div>

        {/* Morning/Evening Toggle */}
        <div className="flex items-center bg-surface-2 rounded-lg p-0.5 border border-border">
          <button
            onClick={() => setTimeOfDay('morning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              timeOfDay === 'morning'
                ? 'bg-accent text-white'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            AM
          </button>
          <button
            onClick={() => setTimeOfDay('evening')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              timeOfDay === 'evening'
                ? 'bg-accent text-white'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            PM
          </button>
        </div>
      </div>

      {/* Score Selectors */}
      <div className="grid grid-cols-2 gap-4">
        {/* Energy */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Battery className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Energy</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((val) => {
              const isSelected = currentScores?.energy === val;
              return (
                <button
                  key={val}
                  onClick={() => setScore('energy', val)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    isSelected
                      ? `${scoreBg(val)} border-transparent text-white scale-110`
                      : 'border-border bg-surface-2 text-text-muted hover:border-border-2'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>

        {/* Focus */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Brain className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Focus</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((val) => {
              const isSelected = currentScores?.focus === val;
              return (
                <button
                  key={val}
                  onClick={() => setScore('focus', val)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    isSelected
                      ? `${scoreBg(val)} border-transparent text-white scale-110`
                      : 'border-border bg-surface-2 text-text-muted hover:border-border-2'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7-Day Trend */}
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">7-Day Trend</p>
        <div className="grid grid-cols-7 gap-1.5">
          {last7.map((date) => {
            const entry = memberEntries.find((e) => e.date === date);
            const morning = entry?.morning;
            const evening = entry?.evening;
            const avgEnergy = morning && evening
              ? Math.round((morning.energy + evening.energy) / 2)
              : morning?.energy ?? evening?.energy ?? 0;
            const avgFocus = morning && evening
              ? Math.round((morning.focus + evening.focus) / 2)
              : morning?.focus ?? evening?.focus ?? 0;
            const isToday = date === today;

            return (
              <div key={date} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] ${isToday ? 'text-accent font-semibold' : 'text-text-muted'}`}>
                  {weekdayShort(date)}
                </span>
                {/* Energy dot */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    avgEnergy > 0
                      ? `${scoreBgFaint(avgEnergy)} ${scoreColor(avgEnergy)}`
                      : 'bg-surface-3 border-border text-text-muted'
                  }`}
                  title={`Energy: ${avgEnergy || '-'}`}
                >
                  <span className="text-[9px] font-bold">{avgEnergy > 0 ? avgEnergy : ''}</span>
                </div>
                {/* Focus dot */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    avgFocus > 0
                      ? `${scoreBgFaint(avgFocus)} ${scoreColor(avgFocus)}`
                      : 'bg-surface-3 border-border text-text-muted'
                  }`}
                  title={`Focus: ${avgFocus || '-'}`}
                >
                  <span className="text-[9px] font-bold">{avgFocus > 0 ? avgFocus : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
          <span className="flex items-center gap-1">
            <Battery className="w-3 h-3" /> Energy
          </span>
          <span className="flex items-center gap-1">
            <Brain className="w-3 h-3" /> Focus
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <span className="w-2 h-2 rounded-full bg-teal-500" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Med
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Low
          </span>
        </div>
      </div>

      {/* Pattern Detection */}
      {pattern && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-accent/10 border border-accent/20">
          <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">{pattern}</p>
        </div>
      )}
    </div>
  );
}
