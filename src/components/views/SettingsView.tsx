'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  User,
  Shield,
  Target,
  AlertTriangle,
  Star,
  MessageSquare,
  Settings,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
  BookOpen,
  Briefcase,
  Clock,
  BarChart3,
  ListChecks,
  Brain,
  Moon,
  Bell,
  Layout,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { teamMembers, getMemberById, memberIdToOwnerName } from '@/lib/data';
import type { TeamMember } from '@/lib/data';
import { getTeamMemberOS } from '@/lib/teamOS';
import type { TeamOS } from '@/lib/teamOS';
import { useEditableStore } from '@/lib/useEditableStore';

// ── Types ──────────────────────────────────────────────────────

type SettingsTab = 'os' | 'qualities' | 'feedback' | 'rds' | 'risks' | 'preferences';

interface SettingsViewProps {
  currentUser?: string;
  onLogout?: () => void;
}

// ── Tab Definitions ────────────────────────────────────────────

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'os', label: 'My OS', icon: <Brain className="w-4 h-4" /> },
  { id: 'qualities', label: 'Qualities', icon: <Star className="w-4 h-4" /> },
  { id: 'feedback', label: '360 Feedback', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'rds', label: 'RDS Framework', icon: <ArrowRight className="w-4 h-4" /> },
  { id: 'risks', label: 'Risks & Principles', icon: <Shield className="w-4 h-4" /> },
  { id: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
];

// ── Helpers ─────────────────────────────────────────────────────

function getColorHex(colorClass: string): string {
  const map: Record<string, string> = {
    'bg-teal-500': '#14b8a6',
    'bg-blue-500': '#3b82f6',
    'bg-amber-500': '#f59e0b',
    'bg-indigo-500': '#6366f1',
    'bg-rose-500': '#f43f5e',
    'bg-emerald-500': '#10b981',
    'bg-violet-500': '#8b5cf6',
    'bg-cyan-500': '#06b6d4',
    'bg-orange-500': '#f97316',
    'bg-sky-500': '#0ea5e9',
    'bg-lime-500': '#84cc16',
    'bg-pink-500': '#ec4899',
    'bg-purple-500': '#a855f7',
  };
  return map[colorClass] || '#14b8a6';
}

function riskBadgeColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
  }
}

function statusBadgeColor(status: 'identified' | 'in-progress' | 'done'): string {
  switch (status) {
    case 'identified': return 'bg-white/10 text-white/60 border-white/20';
    case 'in-progress': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'done': return 'bg-green-500/20 text-green-400 border-green-500/30';
  }
}

// ── Section Card ────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
  className = '',
  borderColor,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
}) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-5 ${className}`}
      style={borderColor ? { borderLeftColor: borderColor, borderLeftWidth: '3px' } : undefined}
    >
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

// ── Dot Score ────────────────────────────────────────────────────

function DotScore({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            i < score ? 'bg-teal-500' : 'bg-white/15'
          }`}
        />
      ))}
      <span className="text-xs text-white/50 ml-1.5">{score}/{max}</span>
    </div>
  );
}

// ── Profile Header ──────────────────────────────────────────────

function ProfileHeader({ member, os }: { member: TeamMember; os?: TeamOS }) {
  const colorHex = getColorHex(member.color);
  const mantra = os?.operatingSystem.mantra;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
          style={{ backgroundColor: colorHex }}
        >
          {member.avatar}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white">{member.name}</h1>
          <p className="text-white/70 text-sm mt-0.5">{member.role}</p>
          <p className="text-white/50 text-xs mt-1 leading-relaxed">{member.roleOneSentence}</p>

          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-400 text-xs font-medium border border-teal-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-white/50 text-xs font-medium border border-white/10">
              <Clock className="w-3 h-3" />
              Founding Member
            </span>
          </div>
        </div>
      </div>

      {/* Mantra */}
      {mantra && (
        <div className="mt-5 border-l-3 border-teal-500 bg-teal-500/5 rounded-r-lg px-4 py-3"
          style={{ borderLeftWidth: '3px', borderLeftColor: '#14b8a6' }}
        >
          <p className="text-white/80 text-sm italic">&ldquo;{mantra}&rdquo;</p>
          <p className="text-white/40 text-xs mt-1">Personal Mantra</p>
        </div>
      )}
    </div>
  );
}

// ── Tab: My Operating System ────────────────────────────────────

function TabMyOS({ member, os }: { member: TeamMember; os: TeamOS }) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* My Seat */}
      <SectionCard title="My Seat" icon={<Briefcase className="w-4 h-4 text-teal-400" />}>
        <p className="text-white/80 text-sm leading-relaxed">{os.operatingSystem.seat}</p>
      </SectionCard>

      {/* Not My Seat */}
      <SectionCard
        title="Not My Seat"
        icon={<XCircle className="w-4 h-4 text-amber-400" />}
        className="bg-amber-500/5 border-amber-500/20"
      >
        <p className="text-amber-300/90 text-sm leading-relaxed">{os.operatingSystem.notThisSeat}</p>
      </SectionCard>

      {/* Single-Threaded Ownership */}
      <SectionCard title="Single-Threaded Ownership" icon={<Target className="w-4 h-4 text-teal-400" />}>
        <ul className="space-y-2">
          {member.singleThreadedOwnership.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* KPIs */}
      <SectionCard title="KPIs" icon={<BarChart3 className="w-4 h-4 text-teal-400" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {member.kpis.map((kpi, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <p className="text-sm text-white/80">{kpi}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Non-Negotiables */}
      <SectionCard title="Non-Negotiables" icon={<Shield className="w-4 h-4 text-teal-400" />}>
        <ul className="space-y-2">
          {member.nonNegotiables.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
              <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Morning Checklist */}
      <SectionCard title="Morning Checklist" icon={<ListChecks className="w-4 h-4 text-teal-400" />}>
        <ol className="space-y-2">
          {os.operatingSystem.morningChecklist.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/75">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </SectionCard>

      {/* Commitments */}
      <SectionCard title="Commitments" icon={<CheckCircle2 className="w-4 h-4 text-teal-400" />}>
        <ul className="space-y-2">
          {os.operatingSystem.commitments.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
              <ChevronRight className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Decision Filter */}
      <SectionCard title="Decision Filter" icon={<Brain className="w-4 h-4 text-teal-400" />}>
        <ul className="space-y-2">
          {os.operatingSystem.decisionFilter.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
              <span className="text-teal-400 font-mono text-xs mt-0.5 flex-shrink-0">?</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Evening Reflection */}
      <SectionCard title="Evening Reflection" icon={<Moon className="w-4 h-4 text-teal-400" />}>
        <ul className="space-y-2">
          {os.operatingSystem.eveningReflection.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Weekly Pulse */}
      <SectionCard title="Weekly Pulse" icon={<Zap className="w-4 h-4 text-teal-400" />}>
        <ul className="space-y-2">
          {os.operatingSystem.weeklyPulse.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

// ── Tab: Qualities ──────────────────────────────────────────────

function TabQualities({ os }: { os: TeamOS }) {
  const avgScore = useMemo(() => {
    if (os.qualities.length === 0) return 0;
    const total = os.qualities.reduce((sum, q) => sum + q.score, 0);
    return total / os.qualities.length;
  }, [os.qualities]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Average Score Summary */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">Quality Score Average</h3>
            <p className="text-white/50 text-xs mt-1">{os.qualities.length} qualities tracked</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-teal-400">{avgScore.toFixed(1)}</span>
            <span className="text-white/40 text-sm ml-1">/ 5</span>
          </div>
        </div>
        <div className="mt-3 w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(avgScore / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Quality Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {os.qualities.map((q, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">{q.name}</h4>
              <DotScore score={q.score} />
            </div>
            <p className="text-white/70 text-xs leading-relaxed mb-3">{q.description}</p>
            <div className="space-y-2">
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Feedback Says</p>
                <p className="text-white/60 text-xs leading-relaxed">{q.feedbackSays}</p>
              </div>
              <div className="bg-teal-500/5 border border-teal-500/10 rounded-lg px-3 py-2">
                <p className="text-teal-400/60 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Weekly Question</p>
                <p className="text-teal-300/80 text-xs leading-relaxed italic">{q.weeklyQuestion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: 360 Feedback ───────────────────────────────────────────

function TabFeedback({ os }: { os: TeamOS }) {
  const sections: {
    key: keyof TeamOS['feedback360'];
    title: string;
    color: string;
    borderColor: string;
    bgTint: string;
  }[] = [
    { key: 'winsForTeam', title: 'Wins for Team', color: 'text-green-400', borderColor: '#22c55e', bgTint: 'bg-green-500/5' },
    { key: 'makesHarder', title: 'Makes Harder', color: 'text-amber-400', borderColor: '#f59e0b', bgTint: 'bg-amber-500/5' },
    { key: 'startDoing', title: 'Start Doing', color: 'text-blue-400', borderColor: '#3b82f6', bgTint: 'bg-blue-500/5' },
    { key: 'stopDoing', title: 'Stop Doing', color: 'text-red-400', borderColor: '#ef4444', bgTint: 'bg-red-500/5' },
    { key: 'supportNeeded', title: 'Support Needed', color: 'text-purple-400', borderColor: '#a855f7', bgTint: 'bg-purple-500/5' },
    { key: 'roleClarity', title: 'Role Clarity', color: 'text-orange-400', borderColor: '#f97316', bgTint: 'bg-orange-500/5' },
    { key: 'highLeverageMoves', title: 'High Leverage Moves', color: 'text-teal-400', borderColor: '#14b8a6', bgTint: 'bg-teal-500/5' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {sections.map((section) => {
        const items = os.feedback360[section.key];
        if (!items || items.length === 0) return null;
        return (
          <div
            key={section.key}
            className={`bg-white/5 border border-white/10 rounded-xl p-5 ${section.bgTint}`}
            style={{ borderLeftWidth: '3px', borderLeftColor: section.borderColor }}
          >
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${section.color}`}>
              {section.title}
            </h3>
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: section.borderColor }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: RDS Framework ──────────────────────────────────────────

type RdsStatus = 'identified' | 'in-progress' | 'done';
const RDS_STATUS_CYCLE: RdsStatus[] = ['identified', 'in-progress', 'done'];
const RDS_LS_KEY = 'amphibian-rds-overrides';

function cycleRdsStatus(current: RdsStatus): RdsStatus {
  const idx = RDS_STATUS_CYCLE.indexOf(current);
  return RDS_STATUS_CYCLE[(idx + 1) % RDS_STATUS_CYCLE.length];
}

function ClickableStatusBadge({ status, onClick }: { status: RdsStatus; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Click to cycle status: identified \u2192 in-progress \u2192 done"
      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap cursor-pointer hover:opacity-80 active:scale-95 transition-all ${statusBadgeColor(status)}`}
    >
      {status}
    </button>
  );
}

function TabRDS({ os, memberId }: { os: TeamOS; memberId: string }) {
  // Load persisted status overrides from localStorage
  const [overrides, setOverrides] = useState<Record<string, RdsStatus>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(`${RDS_LS_KEY}-${memberId}`);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {};
  });

  const getStatus = useCallback((category: string, index: number, original: RdsStatus): RdsStatus => {
    const key = `${category}-${index}`;
    return overrides[key] ?? original;
  }, [overrides]);

  const handleCycle = useCallback((category: string, index: number, current: RdsStatus) => {
    const key = `${category}-${index}`;
    const next = cycleRdsStatus(current);
    setOverrides((prev) => {
      const updated = { ...prev, [key]: next };
      localStorage.setItem(`${RDS_LS_KEY}-${memberId}`, JSON.stringify(updated));
      return updated;
    });
  }, [memberId]);

  const rds = os.rdsFramework;

  // Compute stats with overrides applied
  const removeStatuses = rds.remove.map((r, i) => getStatus('remove', i, r.status));
  const delegateStatuses = rds.delegate.map((d, i) => getStatus('delegate', i, d.status));
  const systematizeStatuses = rds.systematize.map((s, i) => getStatus('systematize', i, s.status));
  const allStatuses = [...removeStatuses, ...delegateStatuses, ...systematizeStatuses];

  const totalItems = allStatuses.length;
  const doneItems = allStatuses.filter((s) => s === 'done').length;
  const inProgressItems = allStatuses.filter((s) => s === 'in-progress').length;
  const progressPct = totalItems > 0 ? ((doneItems + inProgressItems * 0.5) / totalItems) * 100 : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Progress Summary */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">RDS Progress</h3>
            <p className="text-white/50 text-xs mt-1">
              {doneItems} done, {inProgressItems} in progress, {totalItems - doneItems - inProgressItems} identified
            </p>
          </div>
          <span className="text-2xl font-bold text-teal-400">{Math.round(progressPct)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-white/30 text-[10px] mt-2 italic">Click any status badge below to cycle: identified &rarr; in-progress &rarr; done</p>
      </div>

      {/* Three Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Remove */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Remove
          </h3>
          <div className="space-y-3">
            {rds.remove.map((item, i) => {
              const currentStatus = getStatus('remove', i, item.status);
              return (
                <div key={i} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={`text-sm flex-1 ${currentStatus === 'done' ? 'text-white/40 line-through' : 'text-white/80'}`}>{item.item}</p>
                    <ClickableStatusBadge status={currentStatus} onClick={() => handleCycle('remove', i, currentStatus)} />
                  </div>
                  <p className="text-xs text-white/50">{item.reason}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delegate */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Delegate
          </h3>
          <div className="space-y-3">
            {rds.delegate.map((item, i) => {
              const currentStatus = getStatus('delegate', i, item.status);
              return (
                <div key={i} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={`text-sm flex-1 ${currentStatus === 'done' ? 'text-white/40 line-through' : 'text-white/80'}`}>{item.item}</p>
                    <ClickableStatusBadge status={currentStatus} onClick={() => handleCycle('delegate', i, currentStatus)} />
                  </div>
                  <p className="text-xs text-white/50">
                    <span className="text-white/40">To:</span> {item.delegateTo}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Systematize */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Systematize
          </h3>
          <div className="space-y-3">
            {rds.systematize.map((item, i) => {
              const currentStatus = getStatus('systematize', i, item.status);
              return (
                <div key={i} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={`text-sm flex-1 ${currentStatus === 'done' ? 'text-white/40 line-through' : 'text-white/80'}`}>{item.item}</p>
                    <ClickableStatusBadge status={currentStatus} onClick={() => handleCycle('systematize', i, currentStatus)} />
                  </div>
                  <p className="text-xs text-white/50">
                    <span className="text-white/40">System:</span> {item.system}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Risks & Principles ─────────────────────────────────────

function TabRisks({ os }: { os: TeamOS }) {
  const rf = os.riskFramework;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personal Risks */}
      <div>
        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Personal Risks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rf.personalRisks.map((risk, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-sm text-white/85 font-medium mb-3">{risk.risk}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${riskBadgeColor(risk.likelihood)}`}>
                  Likelihood: {risk.likelihood}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${riskBadgeColor(risk.impact)}`}>
                  Impact: {risk.impact}
                </span>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Mitigation</p>
                <p className="text-white/60 text-xs leading-relaxed">{risk.mitigation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Principles */}
      <SectionCard title="Decision Principles" icon={<BookOpen className="w-4 h-4 text-teal-400" />}>
        <ol className="space-y-2">
          {rf.decisionPrinciples.map((principle, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/75">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{principle}</span>
            </li>
          ))}
        </ol>
      </SectionCard>

      {/* Red Lines */}
      <div>
        <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          Red Lines
        </h3>
        <div className="space-y-2">
          {rf.redLines.map((line, i) => (
            <div key={i} className="bg-red-500/5 border border-red-500/15 rounded-lg px-4 py-3 flex items-start gap-3">
              <span className="text-base mt-0 flex-shrink-0" role="img" aria-label="prohibited">&#x1F6AB;</span>
              <p className="text-sm text-red-300/90">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Preferences ────────────────────────────────────────────

interface UserPreferences {
  theme: 'dark';
  defaultView: string;
  notifications: {
    taskAssignments: boolean;
    kpiAlerts: boolean;
    decisionLogUpdates: boolean;
    teamMentions: boolean;
    weeklyDigest: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  defaultView: 'Dashboard',
  notifications: {
    taskAssignments: false,
    kpiAlerts: false,
    decisionLogUpdates: false,
    teamMentions: false,
    weeklyDigest: false,
  },
};

function TabPreferences({ memberId }: { memberId: string }) {
  const displayName = memberIdToOwnerName[memberId] || memberId;
  const { data: prefs } = useEditableStore<UserPreferences>(
    `amphibian-settings-${memberId}`,
    defaultPreferences
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile Summary */}
      <SectionCard title="Account" icon={<User className="w-4 h-4 text-teal-400" />}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Display Name</p>
            <p className="text-xs text-white/40 mt-0.5">How your name appears across the platform</p>
          </div>
          <span className="text-sm text-white/70 font-medium">{displayName}</span>
        </div>
      </SectionCard>

      {/* Theme */}
      <SectionCard title="Theme" icon={<Moon className="w-4 h-4 text-teal-400" />}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Dark Mode</p>
            <p className="text-xs text-white/40 mt-0.5">Interface uses dark color scheme</p>
          </div>
          <div className="relative w-11 h-6 bg-teal-500 rounded-full cursor-default">
            <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow-md" />
          </div>
        </div>
      </SectionCard>

      {/* Default View */}
      <SectionCard title="Default View" icon={<Layout className="w-4 h-4 text-teal-400" />}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Landing Page</p>
            <p className="text-xs text-white/40 mt-0.5">Page shown when you open the app</p>
          </div>
          <div className="bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white/60 cursor-default">
            {prefs.defaultView}
          </div>
        </div>
      </SectionCard>

      {/* Notification Preferences */}
      <SectionCard title="Notification Preferences" icon={<Bell className="w-4 h-4 text-teal-400" />}>
        <p className="text-xs text-white/40 mb-4 italic">Notifications are a planned future feature. These toggles are display-only.</p>
        <div className="space-y-4">
          {[
            { label: 'Task assignments', description: 'When a task is assigned to you' },
            { label: 'KPI alerts', description: 'When a KPI drifts off-track' },
            { label: 'Decision log updates', description: 'When a new decision is logged' },
            { label: 'Team mentions', description: 'When someone mentions you' },
            { label: 'Weekly digest', description: 'Summary of the week every Friday' },
          ].map((pref, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">{pref.label}</p>
                <p className="text-xs text-white/30 mt-0.5">{pref.description}</p>
              </div>
              <div className="relative w-11 h-6 bg-white/15 rounded-full cursor-not-allowed opacity-50">
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white/40 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Team Directory */}
      <SectionCard title="Team Directory" icon={<Settings className="w-4 h-4 text-teal-400" />}>
        <p className="text-xs text-white/40 mb-3">Active team members on the platform</p>
        <div className="flex flex-wrap gap-2">
          {teamMembers.filter((m) => m.status === 'active').map((m) => (
            <span
              key={m.id}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                m.id === memberId
                  ? 'bg-teal-500/15 text-teal-400 border-teal-500/25'
                  : 'bg-white/5 text-white/50 border-white/10'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${m.color}`} />
              {memberIdToOwnerName[m.id] || m.name}
            </span>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab: Basic Profile (no OS data) ─────────────────────────────

function TabBasicProfile({ member }: { member: TeamMember }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <SectionCard title="Single-Threaded Ownership" icon={<Target className="w-4 h-4 text-teal-400" />}>
        <ul className="space-y-2">
          {member.singleThreadedOwnership.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="KPIs" icon={<BarChart3 className="w-4 h-4 text-teal-400" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {member.kpis.map((kpi, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <p className="text-sm text-white/80">{kpi}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Non-Negotiables" icon={<Shield className="w-4 h-4 text-teal-400" />}>
        <ul className="space-y-2">
          {member.nonNegotiables.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/75">
              <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
        <p className="text-white/40 text-sm">Full operating system data not yet available for this member.</p>
        <p className="text-white/30 text-xs mt-1">360 Feedback, Qualities, RDS, and Risk data will appear once loaded.</p>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export function SettingsView({ currentUser, onLogout }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('os');

  const member = useMemo(() => {
    if (!currentUser) return undefined;
    return getMemberById(currentUser);
  }, [currentUser]);

  const os = useMemo(() => {
    if (!currentUser) return undefined;
    return getTeamMemberOS(currentUser);
  }, [currentUser]);

  // ── No user selected ──
  if (!currentUser || !member) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center max-w-md">
          <User className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white/70 mb-2">Select a profile to view your settings</h2>
          <p className="text-sm text-white/40">
            Choose a team member from the sidebar to view their complete operating system, feedback, and preferences.
          </p>
        </div>
      </div>
    );
  }

  // ── Has OS data? ──
  const hasOS = !!os;

  // ── Render tab content ──
  function renderTabContent() {
    // If no OS data, show basic profile regardless of tab
    if (!hasOS) {
      return <TabBasicProfile member={member!} />;
    }

    switch (activeTab) {
      case 'os':
        return <TabMyOS member={member!} os={os!} />;
      case 'qualities':
        return <TabQualities os={os!} />;
      case 'feedback':
        return <TabFeedback os={os!} />;
      case 'rds':
        return <TabRDS os={os!} memberId={member!.id} />;
      case 'risks':
        return <TabRisks os={os!} />;
      case 'preferences':
        return <TabPreferences memberId={member!.id} />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-0">
      {/* Profile Header */}
      <ProfileHeader member={member} os={os} />

      {/* Tab Navigation */}
      {hasOS && (
        <div className="mb-6 animate-fade-in">
          <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5 border border-transparent'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div key={activeTab}>
        {renderTabContent()}
      </div>

      {/* Logout Button */}
      {onLogout && (
        <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in">
          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <p className="text-white/30 text-xs mt-2">This will return you to the login screen.</p>
        </div>
      )}
    </div>
  );
}
