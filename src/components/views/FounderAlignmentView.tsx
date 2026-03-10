'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, AlertTriangle, TrendingUp, TrendingDown, Minus, ChevronDown, Check } from 'lucide-react';
import { teamMembers } from '@/lib/data';

// ── Types ──────────────────────────────────────────────────

interface FounderScore {
  founderId: string;
  score: number; // 1-5
}

interface QuestionScores {
  questionId: number;
  scores: FounderScore[];
}

interface WeekEntry {
  weekLabel: string; // e.g. "Mar 3"
  weekStartDate: string;
  questions: QuestionScores[];
}

// ── Constants ──────────────────────────────────────────────

const FOUNDERS = ['james', 'andrew', 'mark'] as const;
type FounderId = typeof FOUNDERS[number];

const QUESTIONS = [
  { id: 1, text: 'Are we aligned on our top 3 priorities this week?' },
  { id: 2, text: 'Are we aligned on resource allocation?' },
  { id: 3, text: 'Are we aligned on the biggest risk facing the firm?' },
];

const LS_KEY = 'amphibian-founder-alignment';

const DRIFT_THRESHOLD = 3.5;

// ── Helpers ────────────────────────────────────────────────

const getFounderMember = (id: string) => teamMembers.find((m) => m.id === id);

const getWeekLabel = (offset: number = 0) => {
  const d = new Date();
  const dayOfWeek = d.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset + offset * 7);
  return {
    label: monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    date: monday.toISOString().split('T')[0],
  };
};

const avgScore = (scores: FounderScore[]): number => {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
};

const overallAvg = (questions: QuestionScores[]): number => {
  const allScores = questions.flatMap((q) => q.scores);
  if (allScores.length === 0) return 0;
  return allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length;
};

const alignmentColor = (avg: number) => {
  if (avg >= 4) return 'text-emerald-400';
  if (avg >= 3) return 'text-amber-400';
  return 'text-rose-400';
};

const alignmentBg = (avg: number) => {
  if (avg >= 4) return 'bg-emerald-500/15 border-emerald-500/30';
  if (avg >= 3) return 'bg-amber-500/15 border-amber-500/30';
  return 'bg-rose-500/15 border-rose-500/30';
};

const alignmentBarColor = (avg: number) => {
  if (avg >= 4) return 'bg-emerald-500';
  if (avg >= 3) return 'bg-amber-500';
  return 'bg-rose-500';
};

// ── Mock data ─────────────────────────────────────────────

const generateMockData = (): WeekEntry[] => {
  const weeks: WeekEntry[] = [];

  const mockScores: number[][][] = [
    // Week -3: slight misalignment
    [[4, 3, 4], [3, 3, 4], [3, 4, 3]],
    // Week -2: better alignment
    [[4, 4, 5], [4, 4, 4], [4, 3, 4]],
    // Week -1: drift on resources
    [[5, 4, 4], [3, 2, 3], [4, 4, 3]],
    // Current week
    [[4, 4, 5], [4, 3, 4], [5, 4, 4]],
  ];

  for (let w = -3; w <= 0; w++) {
    const { label, date } = getWeekLabel(w);
    const weekScores = mockScores[w + 3];
    const questions: QuestionScores[] = QUESTIONS.map((q, qi) => ({
      questionId: q.id,
      scores: FOUNDERS.map((founderId, fi) => ({
        founderId,
        score: weekScores[qi][fi],
      })),
    }));
    weeks.push({ weekLabel: label, weekStartDate: date, questions });
  }

  return weeks;
};

// ── Component ──────────────────────────────────────────────

export function FounderAlignmentView() {
  const [weeks, setWeeks] = useState<WeekEntry[]>([]);
  const [selectedFounder, setSelectedFounder] = useState<FounderId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [founderDropdownOpen, setFounderDropdownOpen] = useState(false);

  // Load data
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        setWeeks(JSON.parse(stored));
      } catch {
        const mock = generateMockData();
        setWeeks(mock);
        localStorage.setItem(LS_KEY, JSON.stringify(mock));
      }
    } else {
      const mock = generateMockData();
      setWeeks(mock);
      localStorage.setItem(LS_KEY, JSON.stringify(mock));
    }
  }, []);

  // Save data
  useEffect(() => {
    if (weeks.length > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify(weeks));
    }
  }, [weeks]);

  const currentWeek = weeks.length > 0 ? weeks[weeks.length - 1] : null;
  const currentAvg = currentWeek ? overallAvg(currentWeek.questions) : 0;
  const hasDrift = currentAvg > 0 && currentAvg < DRIFT_THRESHOLD;

  // Trend calculation
  const trend = useMemo(() => {
    if (weeks.length < 2) return 'flat' as const;
    const prev = overallAvg(weeks[weeks.length - 2].questions);
    const curr = overallAvg(weeks[weeks.length - 1].questions);
    if (curr > prev + 0.2) return 'up' as const;
    if (curr < prev - 0.2) return 'down' as const;
    return 'flat' as const;
  }, [weeks]);

  // Submit score for a founder on a question
  const submitScore = (questionId: number, score: number) => {
    if (!selectedFounder) return;
    setWeeks((prev) => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (lastIdx < 0) return prev;
      const week = { ...updated[lastIdx] };
      week.questions = week.questions.map((q) => {
        if (q.questionId !== questionId) return q;
        const existingIdx = q.scores.findIndex((s) => s.founderId === selectedFounder);
        if (existingIdx >= 0) {
          const newScores = [...q.scores];
          newScores[existingIdx] = { founderId: selectedFounder, score };
          return { ...q, scores: newScores };
        }
        return { ...q, scores: [...q.scores, { founderId: selectedFounder, score }] };
      });
      updated[lastIdx] = week;
      return updated;
    });
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSelectedFounder(null);
    }, 800);
  };

  const selectedFounderMember = selectedFounder ? getFounderMember(selectedFounder) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Founder Alignment Score</span>
          </h1>
        </div>
        <p className="text-text-secondary text-sm mt-1 max-w-xl">
          Weekly alignment check between founders. Track consensus on priorities, resources, and risks.
        </p>
      </div>

      {/* ── Drift Alert ── */}
      {hasDrift && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-400">Drift Alert</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Average alignment score dropped below {DRIFT_THRESHOLD}. Schedule a founder sync to realign on priorities.
            </p>
          </div>
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Current Score</span>
          <p className={`text-2xl font-bold mt-2 ${alignmentColor(currentAvg)}`}>
            {currentAvg > 0 ? currentAvg.toFixed(1) : '--'}
            <span className="text-text-muted text-sm">/5</span>
          </p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Trend</span>
          <div className="flex items-center gap-2 mt-2">
            {trend === 'up' && <TrendingUp className="w-5 h-5 text-emerald-400" />}
            {trend === 'down' && <TrendingDown className="w-5 h-5 text-rose-400" />}
            {trend === 'flat' && <Minus className="w-5 h-5 text-text-muted" />}
            <p className="text-lg font-bold text-text-primary capitalize">{trend}</p>
          </div>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Weeks Tracked</span>
          <p className="text-2xl font-bold text-text-primary mt-2">{weeks.length}</p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Status</span>
          <p className={`text-lg font-bold mt-2 ${currentAvg >= 4 ? 'text-emerald-400' : currentAvg >= 3 ? 'text-amber-400' : currentAvg > 0 ? 'text-rose-400' : 'text-text-muted'}`}>
            {currentAvg >= 4 ? 'Strong' : currentAvg >= 3 ? 'Moderate' : currentAvg > 0 ? 'Drifting' : 'No Data'}
          </p>
        </div>
      </div>

      {/* ── Submit Scores Section ── */}
      <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-text-primary">Submit Your Scores</h3>

          {/* Founder selector */}
          <div className="relative">
            <button
              onClick={() => setFounderDropdownOpen(!founderDropdownOpen)}
              className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-2 hover:border-border-2 transition-all min-w-[180px]"
            >
              {selectedFounderMember ? (
                <>
                  <div className={`w-6 h-6 rounded-md ${selectedFounderMember.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {selectedFounderMember.avatar}
                  </div>
                  <span className="text-sm text-text-primary">{selectedFounderMember.name}</span>
                </>
              ) : (
                <span className="text-sm text-text-muted">Select founder...</span>
              )}
              <ChevronDown className={`w-4 h-4 text-text-muted ml-auto transition-transform ${founderDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {founderDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-full bg-surface border border-border rounded-lg shadow-xl z-50 py-1">
                {FOUNDERS.map((id) => {
                  const m = getFounderMember(id);
                  if (!m) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => { setSelectedFounder(id); setFounderDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-2 transition-colors ${
                        id === selectedFounder ? 'bg-surface-2' : ''
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md ${m.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                        {m.avatar}
                      </div>
                      <span className="text-sm text-text-primary">{m.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {!selectedFounder ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-muted">
            <Users className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Select your name to submit alignment scores</p>
          </div>
        ) : (
          <div className="space-y-5">
            {QUESTIONS.map((q) => {
              const currentQ = currentWeek?.questions.find((cq) => cq.questionId === q.id);
              const myScore = currentQ?.scores.find((s) => s.founderId === selectedFounder)?.score ?? 0;

              return (
                <div key={q.id} className="p-4 rounded-lg bg-surface-2 border border-border">
                  <p className="text-sm font-medium text-text-primary mb-3">{q.text}</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => submitScore(q.id, val)}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all ${
                          myScore === val
                            ? `${alignmentBarColor(val)} border-transparent text-white scale-105`
                            : 'border-border bg-surface text-text-muted hover:border-border-2 hover:text-text-secondary'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-text-muted">
                      {myScore === 0 ? 'Not scored' : myScore <= 2 ? 'Misaligned' : myScore <= 3 ? 'Somewhat' : 'Aligned'}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Submit Scores
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Question Cards with Individual Scores ── */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Current Week Alignment</h3>
        {QUESTIONS.map((q, qi) => {
          const currentQ = currentWeek?.questions.find((cq) => cq.questionId === q.id);
          const qAvg = currentQ ? avgScore(currentQ.scores) : 0;

          return (
            <div
              key={q.id}
              className={`glow-card bg-surface border rounded-xl p-5 transition-all animate-fade-in ${alignmentBg(qAvg)}`}
              style={{ animationDelay: `${200 + qi * 75}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <p className="text-sm font-medium text-text-primary">{q.text}</p>
                <span className={`text-lg font-bold ${alignmentColor(qAvg)} flex-shrink-0`}>
                  {qAvg > 0 ? qAvg.toFixed(1) : '--'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {FOUNDERS.map((founderId) => {
                  const m = getFounderMember(founderId);
                  const score = currentQ?.scores.find((s) => s.founderId === founderId)?.score ?? 0;
                  if (!m) return null;

                  return (
                    <div key={founderId} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-md ${m.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                        {m.avatar}
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">{m.name.split(' ')[0]}</p>
                        <p className={`text-sm font-bold ${score > 0 ? alignmentColor(score) : 'text-text-muted'}`}>
                          {score > 0 ? score : '--'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Agreement bar */}
              <div className="mt-3">
                <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${alignmentBarColor(qAvg)}`}
                    style={{ width: `${(qAvg / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Trend Over Time ── */}
      <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Alignment Trend</h3>

        <div className="space-y-3">
          {weeks.map((week, i) => {
            const avg = overallAvg(week.questions);
            const isCurrentWeek = i === weeks.length - 1;

            return (
              <div key={i} className="flex items-center gap-3">
                <span className={`text-xs font-mono w-16 flex-shrink-0 ${isCurrentWeek ? 'text-accent font-semibold' : 'text-text-muted'}`}>
                  {week.weekLabel}
                </span>
                <div className="flex-1 h-5 bg-surface-3/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${alignmentBarColor(avg)}`}
                    style={{ width: `${(avg / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-10 text-right ${alignmentColor(avg)}`}>
                  {avg.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Per-question trend */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Per Question Trend</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-2">
                <p className="text-xs text-text-secondary truncate" title={q.text}>Q{q.id}: {q.text.split('?')[0]}?</p>
                <div className="flex items-end gap-1 h-12">
                  {weeks.map((week, i) => {
                    const qData = week.questions.find((wq) => wq.questionId === q.id);
                    const avg = qData ? avgScore(qData.scores) : 0;
                    const height = (avg / 5) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full rounded-sm transition-all duration-500 ${alignmentBarColor(avg)}`}
                          style={{ height: `${height}%`, minHeight: avg > 0 ? '4px' : '0px' }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
