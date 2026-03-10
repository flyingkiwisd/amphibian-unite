'use client';

import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Star, TrendingUp, TrendingDown, Minus, Send, Check, User } from 'lucide-react';
import { teamMembers } from '@/lib/data';

// ── Types ──────────────────────────────────────────────────

interface FeedbackEntry {
  memberId: string;
  score: number; // 1-5
  comment: string;
}

interface WeekSubmission {
  weekLabel: string;
  weekDate: string;
  entries: FeedbackEntry[];
  submitted: boolean;
}

interface FeedbackData {
  currentWeek: WeekSubmission;
  history: WeekSubmission[];
}

// ── Constants ──────────────────────────────────────────────

const LS_KEY = 'amphibian-peer-feedback';

const activeMembers = teamMembers.filter((m) => m.status !== 'hiring');

// ── Helpers ────────────────────────────────────────────────

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

const getAvgForMember = (submissions: WeekSubmission[], memberId: string): number[] => {
  return submissions.map((week) => {
    const memberEntries = week.entries.filter((e) => e.memberId === memberId);
    if (memberEntries.length === 0) return 0;
    return memberEntries.reduce((sum, e) => sum + e.score, 0) / memberEntries.length;
  });
};

const getTrend = (scores: number[]): 'up' | 'down' | 'flat' => {
  if (scores.length < 2) return 'flat';
  const recent = scores[scores.length - 1];
  const previous = scores[scores.length - 2];
  if (recent > previous + 0.2) return 'up';
  if (recent < previous - 0.2) return 'down';
  return 'flat';
};

// ── Mock data ─────────────────────────────────────────────

const generateMockHistory = (): WeekSubmission[] => {
  const history: WeekSubmission[] = [];
  const memberIds = activeMembers.map((m) => m.id);

  // Mock scores per member per week (4 weeks of history)
  const weeklyScores: Record<string, number[]> = {
    james: [4.2, 4.5, 4.3, 4.6],
    david: [3.8, 4.0, 3.9, 4.1],
    mark: [3.5, 3.7, 4.0, 4.2],
    todd: [4.0, 3.8, 4.1, 4.3],
    paola: [3.9, 4.0, 4.2, 4.0],
    andrew: [4.1, 4.3, 3.8, 4.0],
    ty: [4.5, 4.6, 4.4, 4.7],
    ross: [4.0, 4.2, 4.3, 4.5],
    thao: [3.8, 4.0, 4.1, 4.3],
    timon: [4.2, 4.0, 4.4, 4.5],
    sahir: [3.7, 3.9, 4.0, 4.2],
  };

  for (let w = -4; w < 0; w++) {
    const { label, date } = getWeekLabel(w);
    const weekIdx = w + 4;
    const entries: FeedbackEntry[] = memberIds.map((id) => ({
      memberId: id,
      score: Math.round((weeklyScores[id]?.[weekIdx] ?? 3.5) * 10) / 10,
      comment: '',
    }));

    history.push({
      weekLabel: label,
      weekDate: date,
      entries,
      submitted: true,
    });
  }

  return history;
};

const generateCurrentWeek = (): WeekSubmission => {
  const { label, date } = getWeekLabel(0);
  return {
    weekLabel: label,
    weekDate: date,
    entries: activeMembers.map((m) => ({
      memberId: m.id,
      score: 0,
      comment: '',
    })),
    submitted: false,
  };
};

// ── Component ──────────────────────────────────────────────

type TrendFilter = 'all' | 'for-me' | 'by-me';

export function PeerFeedbackView({ currentUser }: { currentUser?: string }) {
  const [data, setData] = useState<FeedbackData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trendFilter, setTrendFilter] = useState<TrendFilter>('all');

  // Load data
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FeedbackData;
        setData(parsed);
        if (parsed.currentWeek.submitted) {
          setSubmitted(true);
        }
      } catch {
        const mock: FeedbackData = {
          currentWeek: generateCurrentWeek(),
          history: generateMockHistory(),
        };
        setData(mock);
        localStorage.setItem(LS_KEY, JSON.stringify(mock));
      }
    } else {
      const mock: FeedbackData = {
        currentWeek: generateCurrentWeek(),
        history: generateMockHistory(),
      };
      setData(mock);
      localStorage.setItem(LS_KEY, JSON.stringify(mock));
    }
  }, []);

  // Save data
  useEffect(() => {
    if (data) {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    }
  }, [data]);

  // Computed values
  const allWeeks = useMemo(() => {
    if (!data) return [];
    return [...data.history, data.currentWeek].filter((w) => w.submitted);
  }, [data]);

  const memberScores = useMemo(() => {
    return activeMembers.map((member) => {
      const scores = getAvgForMember(allWeeks, member.id);
      const latestScore = scores.length > 0 ? scores[scores.length - 1] : 0;
      const trend = getTrend(scores);
      return { member, scores, latestScore, trend };
    }).sort((a, b) => b.latestScore - a.latestScore);
  }, [allWeeks]);

  // Filtered member scores for the trend view
  const filteredMemberScores = useMemo(() => {
    if (!currentUser || trendFilter === 'all') return memberScores;
    if (trendFilter === 'for-me') {
      return memberScores.filter((ms) => ms.member.id === currentUser);
    }
    // 'by-me': show all members with the current user's submitted scores
    // Since submissions are anonymous and scores are aggregated, show all members
    // but highlight the current user's own row
    return memberScores;
  }, [memberScores, currentUser, trendFilter]);

  // Sort submission members to show current user first
  const sortedActiveMembers = useMemo(() => {
    if (!currentUser) return activeMembers;
    return [...activeMembers].sort((a, b) => {
      if (a.id === currentUser) return -1;
      if (b.id === currentUser) return 1;
      return 0;
    });
  }, [currentUser]);

  // ── Handlers ──

  const updateScore = (memberId: string, score: number) => {
    if (!data || submitted) return;
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentWeek: {
          ...prev.currentWeek,
          entries: prev.currentWeek.entries.map((e) =>
            e.memberId === memberId ? { ...e, score } : e
          ),
        },
      };
    });
  };

  const updateComment = (memberId: string, comment: string) => {
    if (!data || submitted) return;
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentWeek: {
          ...prev.currentWeek,
          entries: prev.currentWeek.entries.map((e) =>
            e.memberId === memberId ? { ...e, comment } : e
          ),
        },
      };
    });
  };

  const handleSubmit = () => {
    if (!data) return;
    const hasScores = data.currentWeek.entries.some((e) => e.score > 0);
    if (!hasScores) return;

    setSubmitting(true);
    setTimeout(() => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentWeek: { ...prev.currentWeek, submitted: true },
        };
      });
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  if (!data) return null;

  const scoredCount = data.currentWeek.entries.filter((e) => e.score > 0).length;
  const totalCount = data.currentWeek.entries.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <MessageSquare className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Peer Feedback Pulses</span>
          </h1>
        </div>
        <p className="text-text-secondary text-sm mt-1 max-w-xl">
          Weekly micro-pulse on team collaboration. Anonymous submissions, tracked trends.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Team Avg</span>
          <p className="text-2xl font-bold text-accent mt-2">
            {memberScores.length > 0
              ? (memberScores.reduce((sum, ms) => sum + ms.latestScore, 0) / memberScores.filter((ms) => ms.latestScore > 0).length).toFixed(1)
              : '--'}
            <span className="text-text-muted text-sm">/5</span>
          </p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Weeks Tracked</span>
          <p className="text-2xl font-bold text-text-primary mt-2">{allWeeks.length}</p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">This Week</span>
          <p className="text-lg font-bold mt-2">
            {submitted ? (
              <span className="text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> Submitted</span>
            ) : (
              <span className="text-amber-400">{scoredCount}/{totalCount} rated</span>
            )}
          </p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Highest Rated</span>
          {memberScores[0] && memberScores[0].latestScore > 0 ? (
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-7 h-7 rounded-lg ${memberScores[0].member.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                {memberScores[0].member.avatar}
              </div>
              <p className="text-sm font-bold text-text-primary">{memberScores[0].member.name.split(' ')[0]}</p>
            </div>
          ) : (
            <p className="text-text-muted text-sm mt-2">--</p>
          )}
        </div>
      </div>

      {/* ── Submission Section ── */}
      <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {submitted ? 'Week of ' + data.currentWeek.weekLabel + ' (Submitted)' : 'Rate Collaboration This Week'}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Anonymous. Rate each team member&apos;s collaboration quality 1-5.</p>
          </div>
          {submitted && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Submitted
            </span>
          )}
        </div>

        <div className="space-y-3">
          {sortedActiveMembers.map((member, idx) => {
            const entry = data.currentWeek.entries.find((e) => e.memberId === member.id);
            const currentScore = entry?.score ?? 0;
            const isYou = member.id === currentUser;

            return (
              <div
                key={member.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border animate-fade-in ${
                  isYou
                    ? 'ring-2 ring-accent/40 shadow-[0_0_15px_rgba(20,184,166,0.15)] bg-accent/5 border-accent/30'
                    : 'bg-surface-2 border-border'
                }`}
                style={{ animationDelay: `${150 + idx * 40}ms` }}
              >
                {/* Member info */}
                <div className="flex items-center gap-3 sm:w-48 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg ${member.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-text-primary">{member.name}</p>
                      {isYou && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">{member.shortRole}</p>
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => updateScore(member.id, val)}
                      disabled={submitted}
                      className={`p-0.5 transition-all ${submitted ? 'cursor-default' : 'hover:scale-110'}`}
                    >
                      <Star
                        className={`w-6 h-6 transition-all ${
                          val <= currentScore
                            ? 'text-accent fill-accent'
                            : 'text-text-muted/30'
                        }`}
                      />
                    </button>
                  ))}
                  <span className={`text-xs font-mono ml-1 w-6 ${currentScore > 0 ? 'text-accent' : 'text-text-muted'}`}>
                    {currentScore > 0 ? currentScore : '--'}
                  </span>
                </div>

                {/* Sparkline trend */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                  {allWeeks.map((week, i) => {
                    const weekEntry = week.entries.find((e) => e.memberId === member.id);
                    const score = weekEntry?.score ?? 0;
                    const dotSize = score > 0 ? Math.max(4, score * 2) : 3;
                    const dotColor = score >= 4 ? 'bg-emerald-400' : score >= 3 ? 'bg-amber-400' : score > 0 ? 'bg-rose-400' : 'bg-surface-3';
                    return (
                      <div
                        key={i}
                        className={`rounded-full ${dotColor} transition-all`}
                        style={{ width: `${dotSize}px`, height: `${dotSize}px` }}
                        title={`Week ${week.weekLabel}: ${score > 0 ? score.toFixed(1) : 'N/A'}`}
                      />
                    );
                  })}
                </div>

                {/* Comment */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={entry?.comment ?? ''}
                    onChange={(e) => updateComment(member.id, e.target.value)}
                    disabled={submitted}
                    placeholder={submitted ? '' : 'Optional comment...'}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit button */}
        {!submitted && (
          <div className="flex justify-end mt-5 pt-4 border-t border-border">
            <button
              onClick={handleSubmit}
              disabled={submitting || scoredCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Anonymously ({scoredCount}/{totalCount})
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Trend View ── */}
      <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Collaboration Trends (Past 4 Weeks)</h3>

          {/* Filter toggle */}
          {currentUser && (
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-2 border border-border">
              {([
                { key: 'all' as TrendFilter, label: 'All' },
                { key: 'for-me' as TrendFilter, label: 'For Me' },
                { key: 'by-me' as TrendFilter, label: 'By Me' },
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTrendFilter(key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    trendFilter === key
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'text-text-muted hover:text-text-primary border border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* By Me explanation */}
        {trendFilter === 'by-me' && currentUser && (
          <p className="text-xs text-text-muted mb-3 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-accent" />
            Showing scores you submitted for each team member
          </p>
        )}

        {/* For Me explanation */}
        {trendFilter === 'for-me' && currentUser && (
          <p className="text-xs text-text-muted mb-3 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-accent" />
            Showing your collaboration trend
          </p>
        )}

        <div className="space-y-3">
          {filteredMemberScores.map((ms, idx) => {
            const TrendIcon = ms.trend === 'up' ? TrendingUp : ms.trend === 'down' ? TrendingDown : Minus;
            const trendColor = ms.trend === 'up' ? 'text-emerald-400' : ms.trend === 'down' ? 'text-rose-400' : 'text-text-muted';
            const trendLabel = ms.trend === 'up' ? 'Trending Up' : ms.trend === 'down' ? 'Trending Down' : 'Steady';
            const barWidth = ms.latestScore > 0 ? (ms.latestScore / 5) * 100 : 0;
            const barColor = ms.latestScore >= 4 ? 'bg-emerald-500' : ms.latestScore >= 3 ? 'bg-amber-500' : ms.latestScore > 0 ? 'bg-rose-500' : 'bg-surface-3';
            const isYou = ms.member.id === currentUser;

            return (
              <div
                key={ms.member.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all animate-fade-in ${
                  isYou
                    ? 'ring-2 ring-accent/40 shadow-[0_0_15px_rgba(20,184,166,0.15)] bg-accent/5 border-accent/30'
                    : 'bg-surface-2 border-border hover:border-border-2'
                }`}
                style={{ animationDelay: `${350 + idx * 40}ms` }}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg ${ms.member.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {ms.member.avatar}
                </div>

                {/* Name */}
                <div className="w-28 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-text-primary truncate">{ms.member.name}</p>
                    {isYou && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider flex-shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">{ms.member.shortRole}</p>
                </div>

                {/* Score bar */}
                <div className="flex-1 min-w-0">
                  <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Score */}
                <span className={`text-sm font-bold w-10 text-right ${ms.latestScore >= 4 ? 'text-emerald-400' : ms.latestScore >= 3 ? 'text-amber-400' : ms.latestScore > 0 ? 'text-rose-400' : 'text-text-muted'}`}>
                  {ms.latestScore > 0 ? ms.latestScore.toFixed(1) : '--'}
                </span>

                {/* Trend */}
                <div className={`flex items-center gap-1 flex-shrink-0 ${trendColor}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">{trendLabel}</span>
                </div>

                {/* Sparkline */}
                <div className="hidden md:flex items-end gap-0.5 h-6 flex-shrink-0">
                  {ms.scores.map((score, i) => {
                    const height = score > 0 ? (score / 5) * 100 : 0;
                    const sparkColor = score >= 4 ? 'bg-emerald-500' : score >= 3 ? 'bg-amber-500' : score > 0 ? 'bg-rose-500' : 'bg-surface-3';
                    return (
                      <div
                        key={i}
                        className={`w-2 rounded-sm transition-all duration-500 ${sparkColor}`}
                        style={{ height: `${height}%`, minHeight: score > 0 ? '2px' : '0px' }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
