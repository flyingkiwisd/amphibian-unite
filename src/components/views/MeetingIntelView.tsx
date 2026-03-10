'use client';

import { useState } from 'react';
import {
  Brain,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Target,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

// ── Types ──────────────────────────────────────────────────

interface AgendaItem {
  text: string;
  source: string; // where it was auto-generated from
}

interface PreRead {
  title: string;
  summary: string;
}

interface SuggestedOutcome {
  text: string;
}

interface ActionItem {
  text: string;
  owner: string;
  done: boolean;
}

interface DecisionCaptured {
  text: string;
  decidedBy: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  type: 'standup' | 'strategic' | 'review' | 'external';
  status: 'upcoming' | 'completed';
  // AI-generated prep
  autoAgenda: AgendaItem[];
  preReads: PreRead[];
  suggestedOutcomes: SuggestedOutcome[];
  // Post-meeting
  decisions: DecisionCaptured[];
  actionItems: ActionItem[];
  notes: string;
}

// ── Mock Data ─────────────────────────────────────────────

const today = new Date();
const formatMeetingDate = (daysOffset: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const mockMeetings: Meeting[] = [
  {
    id: 'mtg-1',
    title: 'Investment Committee Weekly',
    date: formatMeetingDate(0),
    time: '10:00 AM',
    duration: '60 min',
    attendees: ['james', 'ty', 'ross', 'andrew'],
    type: 'strategic',
    status: 'upcoming',
    autoAgenda: [
      { text: 'BTC Alpha YTD performance review (-3.08% vs +20 bps/month target)', source: 'KPI Dashboard' },
      { text: 'A9 audit progress update and timeline confirmation', source: 'Task Tracker - Ross' },
      { text: 'Dynamic Alpha sleeve architecture: finalize 6-sleeve SMA structure', source: 'Decision Log - Dec 006' },
      { text: 'Risk limit review: concentration in A9 position', source: 'Risk Dashboard' },
    ],
    preReads: [
      { title: 'BTC Alpha Q1 Performance Report', summary: 'YTD return of -3.08% driven by basis trade compression. Yield sources shifted to funding rate and infrastructure arbitrage.' },
      { title: 'A9 Due Diligence Status', summary: 'Track record verification 60% complete. Operational DD scheduled for next week. Key concern: single-PM risk.' },
      { title: 'Dynamic Alpha Architecture Decision (Dec-006)', summary: '6-sleeve SMA structure approved. Sleeves: quant trend, market-neutral, relative value, event-driven, DeFi yield, discretionary macro.' },
    ],
    suggestedOutcomes: [
      { text: 'Go/No-Go on A9 allocation by end of month' },
      { text: 'BTC Alpha yield source rebalancing decision' },
      { text: 'Dynamic Alpha launch timeline confirmed' },
    ],
    decisions: [],
    actionItems: [],
    notes: '',
  },
  {
    id: 'mtg-2',
    title: 'Founder Alignment Check-in',
    date: formatMeetingDate(1),
    time: '9:00 AM',
    duration: '45 min',
    attendees: ['james', 'andrew', 'mark'],
    type: 'strategic',
    status: 'upcoming',
    autoAgenda: [
      { text: 'Weekly alignment score review (current: 4.1/5)', source: 'Founder Alignment Tracker' },
      { text: 'Resource allocation: engineering time split between risk dashboard and SMA infra', source: 'Blocker from Timon' },
      { text: 'COO search progress and timeline impact', source: 'Hiring Pipeline' },
      { text: 'Cash runway update and Q2 budget review', source: 'Financial Dashboard - Mark' },
    ],
    preReads: [
      { title: 'Q2 Cash Forecast', summary: 'Runway of 14 months at current burn. Break-even AUM target of $150M. Management fee revenue tracking at $1.6M annualized.' },
      { title: 'COO Search Update', summary: '12 candidates sourced, 4 in first round. Target: offer extended by June 2026. Key criteria: fund ops experience $200M+, crypto background.' },
    ],
    suggestedOutcomes: [
      { text: 'Alignment on engineering resource prioritization' },
      { text: 'COO interview panel assignments' },
      { text: 'Budget approval for Q2 hires' },
    ],
    decisions: [],
    actionItems: [],
    notes: '',
  },
  {
    id: 'mtg-3',
    title: 'Carson Group LP Follow-up',
    date: formatMeetingDate(2),
    time: '2:00 PM',
    duration: '30 min',
    attendees: ['james', 'todd'],
    type: 'external',
    status: 'upcoming',
    autoAgenda: [
      { text: 'Address counterparty risk concerns post-FTX', source: 'LP Call Notes - Mar 7' },
      { text: 'Present updated BTC Alpha track record with 6-month data', source: 'Portfolio Intelligence' },
      { text: 'Discuss minimum ticket size and liquidity terms', source: 'LP Pipeline CRM' },
    ],
    preReads: [
      { title: 'Carson Group Profile', summary: 'Multi-family office, $8B AUM. CIO expressed interest in BTC Alpha if 20bps+ demonstrated over 6 months. Primary concern: counterparty risk.' },
      { title: 'Updated LP Deck', summary: 'Includes Q1 performance, risk framework overview, custodian diversification approach, and Mantis-style monitoring explanation.' },
    ],
    suggestedOutcomes: [
      { text: 'Verbal commitment or specific requirements for next step' },
      { text: 'Timeline for allocation decision' },
    ],
    decisions: [],
    actionItems: [],
    notes: '',
  },
  {
    id: 'mtg-4',
    title: 'Engineering Sprint Review',
    date: formatMeetingDate(-1),
    time: '3:00 PM',
    duration: '45 min',
    attendees: ['james', 'timon', 'sahir'],
    type: 'review',
    status: 'completed',
    autoAgenda: [
      { text: 'Risk dashboard v1 demo and feedback', source: 'Sprint Board' },
      { text: 'Data pipeline reliability metrics', source: 'Engineering Metrics' },
      { text: 'Regime classifier v0.1 architecture review', source: 'Tech Roadmap' },
    ],
    preReads: [
      { title: 'Sprint 12 Summary', summary: 'Risk dashboard v1 at 50% completion. Data pipeline uptime: 99.2%. Regime classifier architecture document drafted.' },
    ],
    suggestedOutcomes: [
      { text: 'Risk dashboard launch date confirmed' },
      { text: 'Regime classifier v0.1 timeline and milestones' },
    ],
    decisions: [
      { text: 'Risk dashboard v1 launch set for April 15', decidedBy: 'James' },
      { text: 'Regime classifier uses multi-modal approach (on-chain + sentiment + macro)', decidedBy: 'Timon' },
    ],
    actionItems: [
      { text: 'Complete risk dashboard position sizing module', owner: 'Timon', done: false },
      { text: 'Set up strategy performance database schema', owner: 'Sahir', done: true },
      { text: 'Document regime classifier data sources and access requirements', owner: 'Timon', done: false },
    ],
    notes: 'Good progress on risk dashboard. Regime classifier architecture is ambitious but achievable with right data feeds. Need to prioritize data pipeline stability before adding new features.',
  },
];

// ── Helpers ────────────────────────────────────────────────

const getMember = (id: string) => teamMembers.find((m) => m.id === id);

const typeConfig: Record<Meeting['type'], { color: string; label: string }> = {
  standup: { color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', label: 'Standup' },
  strategic: { color: 'bg-teal-500/15 text-teal-400 border-teal-500/30', label: 'Strategic' },
  review: { color: 'bg-purple-500/15 text-purple-400 border-purple-500/30', label: 'Review' },
  external: { color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', label: 'External' },
};

const formatDisplayDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00');
  const todayStr = today.toISOString().split('T')[0];
  if (dateStr === todayStr) return 'Today';
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// ── Component ──────────────────────────────────────────────

export function MeetingIntelView() {
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['mtg-1']));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleActionItem = (meetingId: string, actionIdx: number) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const newActions = [...m.actionItems];
        newActions[actionIdx] = { ...newActions[actionIdx], done: !newActions[actionIdx].done };
        return { ...m, actionItems: newActions };
      })
    );
  };

  const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming');
  const completedMeetings = meetings.filter((m) => m.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Brain className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Meeting Intelligence</span>
          </h1>
        </div>
        <p className="text-text-secondary text-sm mt-1 max-w-xl">
          AI-generated meeting prep, auto-agendas from open blockers, and post-meeting decision capture.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">This Week</span>
          <p className="text-2xl font-bold text-text-primary mt-2">{meetings.length}</p>
          <p className="text-xs text-text-muted mt-0.5">meetings</p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Upcoming</span>
          <p className="text-2xl font-bold text-accent mt-2">{upcomingMeetings.length}</p>
          <p className="text-xs text-text-muted mt-0.5">need prep</p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Decisions</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {meetings.reduce((sum, m) => sum + m.decisions.length, 0)}
          </p>
          <p className="text-xs text-text-muted mt-0.5">captured</p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Actions</span>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            {meetings.reduce((sum, m) => sum + m.actionItems.filter((a) => !a.done).length, 0)}
          </p>
          <p className="text-xs text-text-muted mt-0.5">open</p>
        </div>
      </div>

      {/* ── Upcoming Meetings ── */}
      {upcomingMeetings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Upcoming
          </h3>

          {upcomingMeetings.map((meeting, idx) => {
            const isExpanded = expandedIds.has(meeting.id);
            const typeConf = typeConfig[meeting.type];

            return (
              <div
                key={meeting.id}
                className="glow-card bg-surface border border-border rounded-xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${100 + idx * 75}ms` }}
              >
                {/* Meeting header */}
                <button
                  onClick={() => toggleExpand(meeting.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-surface-2/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-text-muted">{formatDisplayDate(meeting.date)}</span>
                      <span className="text-sm font-bold text-text-primary">{meeting.time}</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-base font-semibold text-text-primary">{meeting.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeConf.color}`}>
                          {typeConf.label}
                        </span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meeting.duration}
                        </span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {meeting.attendees.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Attendee avatars */}
                    <div className="hidden sm:flex -space-x-2">
                      {meeting.attendees.slice(0, 4).map((id) => {
                        const m = getMember(id);
                        if (!m) return null;
                        return (
                          <div key={id} className={`w-7 h-7 rounded-full ${m.color} flex items-center justify-center text-white text-[10px] font-bold border-2 border-surface`}>
                            {m.avatar}
                          </div>
                        );
                      })}
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Pre-meeting prep */}
                    <div className="p-5 bg-teal-500/5 border-b border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-teal-400" />
                        <h5 className="text-sm font-semibold text-teal-400 uppercase tracking-wider">AI Meeting Prep</h5>
                      </div>

                      {/* Auto-agenda */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          Auto-Generated Agenda
                        </p>
                        <div className="space-y-2">
                          {meeting.autoAgenda.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface/50 border border-border/50">
                              <span className="text-xs font-mono text-teal-400 mt-0.5">{i + 1}.</span>
                              <div className="flex-1">
                                <p className="text-sm text-text-primary">{item.text}</p>
                                <p className="text-[10px] text-text-muted mt-0.5">Source: {item.source}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pre-reads */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Pre-Read Materials
                        </p>
                        <div className="space-y-2">
                          {meeting.preReads.map((pr, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-surface/50 border border-border/50">
                              <p className="text-sm font-medium text-text-primary">{pr.title}</p>
                              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{pr.summary}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Suggested outcomes */}
                      <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          Suggested Outcomes
                        </p>
                        <div className="space-y-1.5">
                          {meeting.suggestedOutcomes.map((outcome, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                              <p className="text-sm text-text-secondary">{outcome.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Completed Meetings ── */}
      {completedMeetings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Completed
          </h3>

          {completedMeetings.map((meeting, idx) => {
            const isExpanded = expandedIds.has(meeting.id);
            const typeConf = typeConfig[meeting.type];

            return (
              <div
                key={meeting.id}
                className="glow-card bg-surface border border-border rounded-xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${300 + idx * 75}ms` }}
              >
                {/* Meeting header */}
                <button
                  onClick={() => toggleExpand(meeting.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-surface-2/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-text-muted">{formatDisplayDate(meeting.date)}</span>
                      <span className="text-sm font-bold text-text-secondary">{meeting.time}</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-base font-semibold text-text-secondary">{meeting.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeConf.color}`}>
                          {typeConf.label}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                      {meeting.decisions.length > 0 && (
                        <span className="text-xs text-emerald-400 font-medium">{meeting.decisions.length} decisions</span>
                      )}
                      {meeting.actionItems.length > 0 && (
                        <span className="text-xs text-amber-400 font-medium">{meeting.actionItems.length} actions</span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Post-meeting notes */}
                    <div className="p-5 bg-emerald-500/5">
                      {/* Decisions */}
                      {meeting.decisions.length > 0 && (
                        <div className="mb-5">
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Decisions Captured
                          </p>
                          <div className="space-y-2">
                            {meeting.decisions.map((dec, i) => (
                              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface/50 border border-emerald-500/20">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm text-text-primary">{dec.text}</p>
                                  <p className="text-[10px] text-text-muted mt-0.5">Decided by {dec.decidedBy}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Items */}
                      {meeting.actionItems.length > 0 && (
                        <div className="mb-5">
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                            Action Items
                          </p>
                          <div className="space-y-2">
                            {meeting.actionItems.map((action, i) => {
                              const ownerMember = getMember(action.owner.toLowerCase());
                              return (
                                <div
                                  key={i}
                                  className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                                    action.done
                                      ? 'bg-surface/30 border-border/50'
                                      : 'bg-surface/50 border-amber-500/20'
                                  }`}
                                >
                                  <button
                                    onClick={() => toggleActionItem(meeting.id, i)}
                                    className={`mt-0.5 flex-shrink-0 ${action.done ? 'text-emerald-400' : 'text-text-muted hover:text-amber-400'}`}
                                  >
                                    <CheckCircle2 className={`w-4 h-4 ${action.done ? 'fill-emerald-400/20' : ''}`} />
                                  </button>
                                  <div className="flex-1">
                                    <p className={`text-sm ${action.done ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                                      {action.text}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {ownerMember && (
                                      <div className={`w-5 h-5 rounded-md ${ownerMember.color} flex items-center justify-center text-white text-[8px] font-bold`}>
                                        {ownerMember.avatar}
                                      </div>
                                    )}
                                    <span className="text-xs text-text-muted">{action.owner}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {meeting.notes && (
                        <div>
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            Meeting Notes
                          </p>
                          <div className="p-3 rounded-lg bg-surface/50 border border-border/50">
                            <p className="text-sm text-text-secondary leading-relaxed">{meeting.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
