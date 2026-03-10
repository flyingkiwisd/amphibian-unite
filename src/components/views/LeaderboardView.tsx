'use client';

import { useMemo } from 'react';
import { Trophy, Award, TrendingUp, Star, Crown, Zap, Target, Shield, BookOpen, BarChart3 } from 'lucide-react';
import { teamMembers } from '@/lib/data';
import { getTeamMemberOS } from '@/lib/teamOS';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface PointBreakdown {
  qualityScore: number;
  rdsProgress: number;
  riskCoverage: number;
  roleCompleteness: number;
  streakBonus: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  role: string;
  shortRole: string;
  avatar: string;
  color: string;
  total: number;
  breakdown: PointBreakdown;
  qualityAvg: number;
  rdsCompletedCount: number;
  riskMitigatedCount: number;
  hasOS: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Points calculation
// ─────────────────────────────────────────────────────────────────────────────
function computePoints(memberId: string): { breakdown: PointBreakdown; qualityAvg: number; rdsCompletedCount: number; riskMitigatedCount: number; hasOS: boolean } {
  const os = getTeamMemberOS(memberId);

  let qualityScore = 0;
  let rdsProgress = 0;
  let riskCoverage = 0;
  let roleCompleteness = 0;
  const streakBonus = 25;
  let qualityAvg = 0;
  let rdsCompletedCount = 0;
  let riskMitigatedCount = 0;
  const hasOS = !!os;

  if (os) {
    // Quality Score: sum of all quality scores * 10
    const qualityScores = os.qualities.map((q) => q.score);
    const qualitySum = qualityScores.reduce((a, b) => a + b, 0);
    qualityScore = qualitySum * 10;
    qualityAvg = qualityScores.length > 0 ? qualitySum / qualityScores.length : 0;

    // RDS Progress: +20 per done, +10 per in-progress
    const allRds = [...os.rdsFramework.remove, ...os.rdsFramework.delegate, ...os.rdsFramework.systematize];
    for (const item of allRds) {
      if (item.status === 'done') {
        rdsProgress += 20;
        rdsCompletedCount++;
      } else if (item.status === 'in-progress') {
        rdsProgress += 10;
      }
    }

    // Risk Coverage: +5 per risk with mitigation documented
    for (const risk of os.riskFramework.personalRisks) {
      if (risk.mitigation && risk.mitigation.trim().length > 0) {
        riskCoverage += 5;
        riskMitigatedCount++;
      }
    }

    // Role Completeness: +50 if OS data loaded
    roleCompleteness = 50;
  }

  return {
    breakdown: {
      qualityScore,
      rdsProgress,
      riskCoverage,
      roleCompleteness,
      streakBonus,
    },
    qualityAvg,
    rdsCompletedCount,
    riskMitigatedCount,
    hasOS,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Rank styling
// ─────────────────────────────────────────────────────────────────────────────
function getRankStyle(rank: number): { textColor: string; bgColor: string; borderColor: string; icon: React.ReactNode } {
  switch (rank) {
    case 1:
      return {
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-400/10',
        borderColor: 'border-amber-400/30',
        icon: <Crown className="w-5 h-5 text-amber-400" />,
      };
    case 2:
      return {
        textColor: 'text-gray-400',
        bgColor: 'bg-gray-400/10',
        borderColor: 'border-gray-400/30',
        icon: <Award className="w-5 h-5 text-gray-400" />,
      };
    case 3:
      return {
        textColor: 'text-orange-400',
        bgColor: 'bg-orange-400/10',
        borderColor: 'border-orange-400/30',
        icon: <Award className="w-5 h-5 text-orange-400" />,
      };
    default:
      return {
        textColor: 'text-text-muted',
        bgColor: 'bg-surface-2',
        borderColor: 'border-border',
        icon: null,
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Category colors for the stacked bar
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<keyof PointBreakdown, string> = {
  qualityScore: 'bg-accent',
  rdsProgress: 'bg-accent-blue',
  riskCoverage: 'bg-accent-amber',
  roleCompleteness: 'bg-accent-emerald',
  streakBonus: 'bg-accent-purple',
};

const CATEGORY_LABELS: Record<keyof PointBreakdown, string> = {
  qualityScore: 'Quality',
  rdsProgress: 'RDS Progress',
  riskCoverage: 'Risk Coverage',
  roleCompleteness: 'Role Completeness',
  streakBonus: 'Streak Bonus',
};

const CATEGORY_ICONS: Record<keyof PointBreakdown, React.ReactNode> = {
  qualityScore: <Star className="w-3.5 h-3.5" />,
  rdsProgress: <Target className="w-3.5 h-3.5" />,
  riskCoverage: <Shield className="w-3.5 h-3.5" />,
  roleCompleteness: <BookOpen className="w-3.5 h-3.5" />,
  streakBonus: <Zap className="w-3.5 h-3.5" />,
};

// ─────────────────────────────────────────────────────────────────────────────
// Stacked bar component
// ─────────────────────────────────────────────────────────────────────────────
function StackedBar({ breakdown, total }: { breakdown: PointBreakdown; total: number }) {
  if (total === 0) return <div className="h-2 rounded-full bg-surface-3 w-full" />;
  const categories = Object.keys(breakdown) as (keyof PointBreakdown)[];
  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-surface-3 w-full">
      {categories.map((key) => {
        const pct = (breakdown[key] / total) * 100;
        if (pct <= 0) return null;
        return (
          <div
            key={key}
            className={`${CATEGORY_COLORS[key]} transition-all duration-500`}
            style={{ width: `${pct}%` }}
            title={`${CATEGORY_LABELS[key]}: ${breakdown[key]} pts`}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quality average indicator (mini bar)
// ─────────────────────────────────────────────────────────────────────────────
function QualityIndicator({ avg }: { avg: number }) {
  const pct = (avg / 5) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-surface-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-text-muted">{avg > 0 ? avg.toFixed(1) : '--'}/5</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function LeaderboardView({ currentUser }: { currentUser?: string }) {
  // Build leaderboard entries
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const activeMembers = teamMembers.filter((m) => m.status !== 'hiring');

    const entries: LeaderboardEntry[] = activeMembers.map((member) => {
      const { breakdown, qualityAvg, rdsCompletedCount, riskMitigatedCount, hasOS } = computePoints(member.id);
      const total = breakdown.qualityScore + breakdown.rdsProgress + breakdown.riskCoverage + breakdown.roleCompleteness + breakdown.streakBonus;

      return {
        id: member.id,
        name: member.name,
        role: member.role,
        shortRole: member.shortRole,
        avatar: member.avatar,
        color: member.color,
        total,
        breakdown,
        qualityAvg,
        rdsCompletedCount,
        riskMitigatedCount,
        hasOS,
      };
    });

    entries.sort((a, b) => b.total - a.total);
    return entries;
  }, []);

  // Category leaders
  const categoryLeaders = useMemo(() => {
    if (leaderboard.length === 0) return null;

    const highestQuality = [...leaderboard].sort((a, b) => b.qualityAvg - a.qualityAvg)[0];
    const mostRds = [...leaderboard].sort((a, b) => b.rdsCompletedCount - a.rdsCompletedCount)[0];
    const bestRisk = [...leaderboard].sort((a, b) => b.breakdown.riskCoverage - a.breakdown.riskCoverage)[0];
    const mostComplete = [...leaderboard].sort((a, b) => b.breakdown.roleCompleteness - a.breakdown.roleCompleteness)[0];

    return {
      highestQuality,
      mostRds,
      bestRisk,
      mostComplete,
    };
  }, [leaderboard]);

  const mvp = leaderboard[0] ?? null;
  const maxPoints = mvp?.total ?? 1;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Team Leaderboard</h1>
            <p className="text-sm text-text-secondary">
              Earn points through quality scores, RDS progress, risk coverage, and OS completeness
            </p>
          </div>
        </div>
      </div>

      {/* ── MVP Spotlight ──────────────────────────────────────── */}
      {mvp && (
        <div className="glow-card rounded-2xl bg-gradient-to-br from-amber-400/5 via-surface to-surface border border-amber-400/20 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl -translate-y-8 translate-x-8" />
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">MVP Spotlight</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${mvp.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
              {mvp.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-text-primary">{mvp.name}</h2>
              <p className="text-sm text-text-secondary">{mvp.role}</p>
              <div className="mt-2">
                <QualityIndicator avg={mvp.qualityAvg} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-accent">{mvp.total}</div>
              <div className="text-xs text-text-muted uppercase tracking-wider">Total Points</div>
            </div>
          </div>
          <div className="mt-4">
            <StackedBar breakdown={mvp.breakdown} total={mvp.total} />
            <div className="flex flex-wrap gap-3 mt-2">
              {(Object.keys(mvp.breakdown) as (keyof PointBreakdown)[]).map((key) => (
                <div key={key} className="flex items-center gap-1 text-xs text-text-muted">
                  <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[key]}`} />
                  {CATEGORY_LABELS[key]}: {mvp.breakdown[key]}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Grid: Leaderboard + Side Panel ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Cards (2/3 width on lg) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Rankings</h3>
          </div>
          {leaderboard.map((entry, idx) => {
            const rank = idx + 1;
            const style = getRankStyle(rank);
            const barWidth = maxPoints > 0 ? (entry.total / maxPoints) * 100 : 0;
            const isYou = entry.id === currentUser;

            return (
              <div
                key={entry.id}
                className={`glow-card rounded-xl border p-4 transition-all duration-200 hover:border-accent/30 ${
                  isYou
                    ? 'ring-2 ring-accent/40 shadow-[0_0_15px_rgba(20,184,166,0.15)] bg-accent/5 border-accent/30'
                    : rank <= 3 ? `${style.bgColor} ${style.borderColor}` : 'bg-surface border-border'
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    rank <= 3 ? style.textColor : 'text-text-muted'
                  } ${rank <= 3 ? '' : 'bg-surface-3'}`}>
                    {style.icon ?? <span>{rank}</span>}
                  </div>

                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${entry.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {entry.avatar}
                  </div>

                  {/* Name + Role */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary truncate">{entry.name}</span>
                      {isYou && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">
                          You
                        </span>
                      )}
                      {rank <= 3 && style.icon && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${style.bgColor} ${style.textColor}`}>
                          #{rank}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted truncate">{entry.role}</p>
                  </div>

                  {/* Quality Avg */}
                  <div className="hidden sm:block flex-shrink-0">
                    <QualityIndicator avg={entry.qualityAvg} />
                  </div>

                  {/* Total Points */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xl font-bold text-accent">{entry.total}</div>
                    <div className="text-xs text-text-muted">pts</div>
                  </div>
                </div>

                {/* Point Breakdown Bar */}
                <div className="mt-3">
                  <div className="relative">
                    <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent/30 transition-all duration-700"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="absolute inset-0">
                      <StackedBar breakdown={entry.breakdown} total={maxPoints} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Side Panel: Category Leaders + Legend ─────────────── */}
        <div className="space-y-6">
          {/* Category Breakdown */}
          <div className="glow-card rounded-xl bg-surface border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Category Leaders</h3>
            </div>
            {categoryLeaders && (
              <div className="space-y-4">
                <CategoryLeaderCard
                  label="Highest Quality Average"
                  icon={<Star className="w-4 h-4 text-accent" />}
                  name={categoryLeaders.highestQuality.name}
                  avatar={categoryLeaders.highestQuality.avatar}
                  color={categoryLeaders.highestQuality.color}
                  value={`${categoryLeaders.highestQuality.qualityAvg.toFixed(1)}/5`}
                />
                <CategoryLeaderCard
                  label="Most RDS Items Completed"
                  icon={<Target className="w-4 h-4 text-accent-blue" />}
                  name={categoryLeaders.mostRds.name}
                  avatar={categoryLeaders.mostRds.avatar}
                  color={categoryLeaders.mostRds.color}
                  value={`${categoryLeaders.mostRds.rdsCompletedCount} done`}
                />
                <CategoryLeaderCard
                  label="Best Risk Coverage"
                  icon={<Shield className="w-4 h-4 text-accent-amber" />}
                  name={categoryLeaders.bestRisk.name}
                  avatar={categoryLeaders.bestRisk.avatar}
                  color={categoryLeaders.bestRisk.color}
                  value={`${categoryLeaders.bestRisk.riskMitigatedCount} mitigated`}
                />
                <CategoryLeaderCard
                  label="Most Complete OS"
                  icon={<BookOpen className="w-4 h-4 text-accent-emerald" />}
                  name={categoryLeaders.mostComplete.name}
                  avatar={categoryLeaders.mostComplete.avatar}
                  color={categoryLeaders.mostComplete.color}
                  value={categoryLeaders.mostComplete.hasOS ? 'Complete' : 'Partial'}
                />
              </div>
            )}
          </div>

          {/* Points Legend */}
          <div className="glow-card rounded-xl bg-surface border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">How to Earn Points</h3>
            </div>
            <div className="space-y-3">
              <LegendItem
                color="bg-accent"
                icon={CATEGORY_ICONS.qualityScore}
                label="Quality Scores"
                detail="Sum of all quality scores x10"
              />
              <LegendItem
                color="bg-accent-blue"
                icon={CATEGORY_ICONS.rdsProgress}
                label="RDS Progress"
                detail="+20 per done, +10 per in-progress"
              />
              <LegendItem
                color="bg-accent-amber"
                icon={CATEGORY_ICONS.riskCoverage}
                label="Risk Coverage"
                detail="+5 per mitigated risk"
              />
              <LegendItem
                color="bg-accent-emerald"
                icon={CATEGORY_ICONS.roleCompleteness}
                label="Role Completeness"
                detail="+50 when OS data is loaded"
              />
              <LegendItem
                color="bg-accent-purple"
                icon={CATEGORY_ICONS.streakBonus}
                label="Streak Bonus"
                detail="+25 base (journal streak)"
              />
            </div>

            {/* Path to More */}
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Path to More Points</span>
              </div>
              <ul className="space-y-1.5 text-xs text-text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">1.</span>
                  <span>Complete your Team OS profile with high-quality self-assessments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">2.</span>
                  <span>Move RDS items from identified to done</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">3.</span>
                  <span>Document mitigations for all identified risks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">4.</span>
                  <span>Maintain your daily journal streak for bonus points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">5.</span>
                  <span>Score higher on quality self-assessments (each point = 10 pts)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function CategoryLeaderCard({
  label,
  icon,
  name,
  avatar,
  color,
  value,
}: {
  label: string;
  icon: React.ReactNode;
  name: string;
  avatar: string;
  color: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-border hover:border-accent/20 transition-colors">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-md ${color} flex items-center justify-center text-white text-[10px] font-bold`}>
            {avatar}
          </div>
          <span className="text-sm font-medium text-text-primary truncate">{name}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-accent flex-shrink-0">{value}</span>
    </div>
  );
}

function LegendItem({
  color,
  icon,
  label,
  detail,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-3 h-3 rounded-sm ${color} flex-shrink-0 mt-0.5 flex items-center justify-center text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-muted">{detail}</p>
      </div>
    </div>
  );
}
