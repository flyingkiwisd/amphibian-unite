'use client';

import { useState, useMemo } from 'react';
import { exportToPdf } from '@/lib/exportPdf';
import { teamMembers } from '@/lib/data';
import type { TeamMember } from '@/lib/data';
import { getTeamMemberOS } from '@/lib/teamOS';
import type { TeamOS } from '@/lib/teamOS';
import {
  Users,
  User,
  Target,
  Shield,
  FileDown,
  X,
  CheckCircle,
  AlertCircle,
  Briefcase,
  BookOpen,
  Brain,
  BarChart3,
  Trash2,
  ArrowRight,
  AlertTriangle,
  Activity,
  Bot,
  Clock,
  Zap,
  Star,
  ChevronRight,
  MessageSquare,
  PenTool,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Agent Assignment Mapping
// ─────────────────────────────────────────────────────────────────────────────
const AGENT_ASSIGNMENTS: Record<string, { primaryOwner: string; directReport: string }> = {
  'north-star': { primaryOwner: 'james', directReport: 'david' },
  'identity': { primaryOwner: 'james', directReport: 'nicole' },
  'okr-engine': { primaryOwner: 'james', directReport: 'thao' },
  'task-commander': { primaryOwner: 'thao', directReport: 'ross' },
  'slack-signal': { primaryOwner: 'thao', directReport: 'timon' },
  'portfolio-intel': { primaryOwner: 'ty', directReport: 'ross' },
  'lp-trust': { primaryOwner: 'todd', directReport: 'thao' },
  'governance': { primaryOwner: 'andrew', directReport: 'todd' },
  'financial': { primaryOwner: 'mark', directReport: 'thao' },
  'culture': { primaryOwner: 'james', directReport: 'todd' },
  'ai-edge': { primaryOwner: 'james', directReport: 'timon' },
  'risk-monitor': { primaryOwner: 'ty', directReport: 'andrew' },
  'growth': { primaryOwner: 'paola', directReport: 'todd' },
  'ops-flow': { primaryOwner: 'nicole', directReport: 'thao' },
};

const AGENT_LABELS: Record<string, string> = {
  'north-star': 'North Star',
  'identity': 'Identity & Roles',
  'okr-engine': 'OKR & KPI Engine',
  'task-commander': 'Task Commander',
  'slack-signal': 'Slack Signal Intel',
  'portfolio-intel': 'Portfolio Intel',
  'lp-trust': 'LP Trust',
  'governance': 'Governance',
  'financial': 'Financial Intel',
  'culture': 'Culture & Alignment',
  'ai-edge': 'AI Edge',
  'risk-monitor': 'Risk Monitor',
  'growth': 'Growth',
  'ops-flow': 'Ops Flow',
};

// ─────────────────────────────────────────────────────────────────────────────
// Journalling Sections — Daily Start, Daily End, Weekly Plan, Monthly Plan
// ─────────────────────────────────────────────────────────────────────────────
const MORNING_JOURNAL = [
  { id: 'am-regulation', label: 'Regulation Check', prompt: 'Am I regulated and grounded right now? What\'s my energy state?' },
  { id: 'am-top3', label: 'Top 3 Today', prompt: 'What are my 3 most important priorities today? Who owns what alongside me?' },
  { id: 'am-not-doing', label: 'NOT Doing Today', prompt: 'What am I explicitly NOT doing today to protect focus?' },
  { id: 'am-proactive', label: 'Proactive Move', prompt: 'What fire can I prevent today by acting now? What can I get ahead of?' },
  { id: 'am-alignment', label: 'Vision Alignment', prompt: 'How does my work today directly support the $1B AUM vision and our North Star?' },
];

const EOD_JOURNAL = [
  { id: 'eod-wins', label: 'Wins Today', prompt: 'What went well today? What did I move forward?' },
  { id: 'eod-tension', label: 'Tension Dump', prompt: 'What tension, frustration, or unresolved issue am I carrying? Get it out of my head.' },
  { id: 'eod-cleanup', label: 'Cleanup Queue', prompt: 'Did I send any reactive messages today? What needs a follow-up or cleanup within 24 hours?' },
  { id: 'eod-quality', label: 'Quality Check', prompt: 'Which of my role qualities did I demonstrate today? Where did I fall short?' },
  { id: 'eod-tomorrow', label: 'Tomorrow Prep', prompt: 'What is the ONE most important thing I need to accomplish tomorrow?' },
];

const WEEKLY_PLAN = [
  { id: 'wk-priorities', label: 'Weekly Top 3', prompt: 'What are my top 3 priorities this week? Each should have an owner, outcome, and deadline.' },
  { id: 'wk-rds', label: 'RDS Review', prompt: 'What should I remove, delegate, or systematize this week to increase my capacity?' },
  { id: 'wk-fire-mgmt', label: 'Fire Management', prompt: 'What is on fire right now? Is it mine to own or should someone else take it?' },
  { id: 'wk-blockers', label: 'Blockers', prompt: 'What is blocking me or my team? What help do I need from others?' },
  { id: 'wk-clarity', label: 'Role Clarity', prompt: 'Is my ownership crystal clear this week? Where is there confusion between me and others?' },
  { id: 'wk-evolution', label: 'Personal Growth', prompt: 'What quality am I intentionally working on this week? How will I practice it?' },
];

const MONTHLY_PLAN = [
  { id: 'mo-reflect', label: 'Monthly Reflection', prompt: 'What did I achieve this month? Where did I fall short? What patterns am I seeing?' },
  { id: 'mo-rds-audit', label: 'RDS Audit', prompt: 'What have I successfully removed, delegated, or systematized? What new items should I add?' },
  { id: 'mo-qualities', label: 'Qualities Score', prompt: 'Score each of my qualities 1-5. Which am I consistently below 3 on? That\'s my growth edge.' },
  { id: 'mo-risk', label: 'Risk Review', prompt: 'Which of my personal risks materialized this month? Are my mitigations working?' },
  { id: 'mo-next', label: 'Next Month Focus', prompt: 'What is the single most important outcome I need to deliver next month?' },
  { id: 'mo-human', label: 'Becoming Better', prompt: 'How am I evolving as a person and leader? What habit, mindset, or practice am I building?' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Proactive Agent Insights — strategic thinking the agents surface per role
// ─────────────────────────────────────────────────────────────────────────────
const PROACTIVE_INSIGHTS: Record<string, { agentId: string; insight: string; type: 'strategic' | 'question' | 'research' }[]> = {
  james: [
    { agentId: 'north-star', insight: 'Your edge rating is 5.1/10 — at this pace, you hit 6.5 by Dec 2026. What specific investment in AI infrastructure would accelerate this to 7.0?', type: 'question' },
    { agentId: 'identity', insight: 'Three team members have overlapping ownership on "compliance documentation." Consider clarifying single-threaded ownership to avoid diffusion of responsibility.', type: 'strategic' },
    { agentId: 'culture', insight: 'Research suggestion: Study how Bridgewater Associates structures "radical transparency" meetings — their daily management meetings may inform your weekly blocker-solving forum design.', type: 'research' },
    { agentId: 'north-star', insight: 'COO hire is your highest-leverage move right now. Every week without a COO costs ~15 hours of CEO time on operational execution. That is 780 hours/year of strategic capacity lost.', type: 'strategic' },
    { agentId: 'okr-engine', insight: 'Your priority lock adherence is tracking below target. Consider: are you adding new priorities without closing old ones? The decision log shows 3 priority changes in the last 2 weeks.', type: 'question' },
  ],
  todd: [
    { agentId: 'lp-trust', insight: 'LP retention is stable but not improving. Have you considered a quarterly "LP advisory call" where your top 5 LPs give direct feedback on what they need?', type: 'question' },
    { agentId: 'governance', insight: 'Research: How do top-decile fund-of-funds structure their LP reporting cadence? Benchmark against Grosvenor, K2, and Prisma.', type: 'research' },
    { agentId: 'lp-trust', insight: 'Redemption process SLA is undocumented. In a stressed market, this becomes a trust-breaking event. Prioritize shipping the redemption playbook this month.', type: 'strategic' },
  ],
  ty: [
    { agentId: 'portfolio-intel', insight: 'BTC Alpha is averaging 15 bps/month. To hit the 20 bps target, where is the marginal yield coming from? Have you mapped all 12 yield sources with bps attribution?', type: 'question' },
    { agentId: 'risk-monitor', insight: 'Manager concentration risk: top 3 managers represent 45% of portfolio. Consider whether this exceeds your documented risk limits.', type: 'strategic' },
    { agentId: 'portfolio-intel', insight: 'Research: Evaluate whether the HRP (Hierarchical Risk Parity) model outperforms MVO in crypto portfolios during regime transitions. This could strengthen the engine.', type: 'research' },
  ],
  ross: [
    { agentId: 'portfolio-intel', insight: 'Portfolio change documentation consistency is at 70%. Goal is 100%. What is causing the 30% gap — process friction, unclear triggers, or time pressure?', type: 'question' },
    { agentId: 'task-commander', insight: 'You are currently carrying 3 tasks that lack clear owners. Consider escalating to CIO for ownership assignment.', type: 'strategic' },
  ],
  andrew: [
    { agentId: 'governance', insight: 'SMA infrastructure for Dynamic Alpha needs architecture decisions by end of month. Have you defined the decision criteria for choosing between custody solutions?', type: 'question' },
    { agentId: 'governance', insight: 'Research: Compare Anchorage vs BitGo vs Copper for SMA custody. Weight factors: insurance coverage, regulatory status, API quality, and institutional client references.', type: 'research' },
    { agentId: 'risk-monitor', insight: 'Post-merger operating model has 4 functions with undefined consolidation status. Each week of ambiguity increases integration risk.', type: 'strategic' },
  ],
  mark: [
    { agentId: 'financial', insight: 'Weekly cash forecast has been published consistently for 8 weeks. Consider automating the data pull to reduce prep time from 2 hours to 15 minutes.', type: 'strategic' },
    { agentId: 'financial', insight: 'Research: What accounting infrastructure do $200M+ crypto fund-of-funds use? Compare QuickBooks vs Sage Intacct vs custom solutions for entity complexity management.', type: 'research' },
    { agentId: 'financial', insight: 'Break-even AUM is $65M. With current trajectory, when do you cross $100M sustainably? Model the revenue sensitivity to fee compression.', type: 'question' },
  ],
  paola: [
    { agentId: 'growth', insight: 'Your partnership pipeline has 5 qualified leads but no conversion in 90 days. What is the specific blocker in each conversation?', type: 'question' },
    { agentId: 'growth', insight: 'Research: Which allocator conferences in Q2 2026 have the highest ROI for digital asset fund-of-funds? Prioritize based on attendee quality, not size.', type: 'research' },
  ],
  thao: [
    { agentId: 'task-commander', insight: 'Cross-functional task completion rate is 78%. The 22% gap is concentrated in tasks requiring input from 3+ people. Consider batching multi-stakeholder reviews.', type: 'strategic' },
    { agentId: 'ops-flow', insight: 'You have 5 workflows that still rely on tribal knowledge. Prioritize SOPs for the 2 workflows with highest failure risk.', type: 'question' },
  ],
  timon: [
    { agentId: 'ai-edge', insight: 'Risk dashboard v1 is 70% complete. The remaining 30% includes regime classifier integration — should this be decoupled to ship v1 faster?', type: 'question' },
    { agentId: 'ai-edge', insight: 'Research: Evaluate whether LLM-based regime classification (GPT-4 + economic indicators) outperforms traditional Markov switching models for crypto markets.', type: 'research' },
  ],
  sahir: [
    { agentId: 'portfolio-intel', insight: 'Strategy performance database is built but adoption is at 40%. What would make Ty and Ross use it daily? Consider embedding it into their morning workflow.', type: 'question' },
    { agentId: 'portfolio-intel', insight: 'Research: What are the top 5 data providers for crypto fund-of-funds manager research? Compare coverage, cost, and API quality.', type: 'research' },
  ],
  david: [
    { agentId: 'north-star', insight: 'Board meeting cadence and action tracking are in place. Consider whether the board is spending enough time on strategic questions vs operational updates.', type: 'question' },
    { agentId: 'governance', insight: 'Your distribution introductions have generated 3 meetings. What is the conversion funnel from intro → meeting → commitment? Track this systematically.', type: 'strategic' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────────────────────────────────────
type TabId = 'overview' | '360' | 'os' | 'qualities' | 'rds' | 'risk' | 'journal' | 'agent-intel';

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: '360', label: '360 Feedback', icon: MessageSquare },
  { id: 'os', label: 'Operating System', icon: Brain },
  { id: 'qualities', label: 'Qualities', icon: Star },
  { id: 'rds', label: 'RDS Framework', icon: Trash2 },
  { id: 'risk', label: 'Risk Framework', icon: Shield },
  { id: 'journal', label: 'Journal', icon: PenTool },
  { id: 'agent-intel', label: 'Agent Intel', icon: Zap },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get agent assignments for a member
// ─────────────────────────────────────────────────────────────────────────────
function getAgentAssignments(memberId: string) {
  const primaryOf: string[] = [];
  const directReportOf: string[] = [];
  for (const [agentId, assignment] of Object.entries(AGENT_ASSIGNMENTS)) {
    if (assignment.primaryOwner === memberId) primaryOf.push(agentId);
    if (assignment.directReport === memberId) directReportOf.push(agentId);
  }
  return { primaryOf, directReportOf };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: compute quick stats for a member
// ─────────────────────────────────────────────────────────────────────────────
function getQuickStats(os: TeamOS | undefined) {
  if (!os) return { qualitiesAbove4: 0, rdsInProgress: 0, riskItems: 0 };
  const qualitiesAbove4 = os.qualities.filter((q) => q.score >= 4).length;
  const rdsInProgress =
    os.rdsFramework.remove.filter((r) => r.status === 'in-progress').length +
    os.rdsFramework.delegate.filter((d) => d.status === 'in-progress').length +
    os.rdsFramework.systematize.filter((s) => s.status === 'in-progress').length;
  const riskItems = os.riskFramework.personalRisks.length;
  return { qualitiesAbove4, rdsInProgress, riskItems };
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badge helper
// ─────────────────────────────────────────────────────────────────────────────
function RdsStatusBadge({ status }: { status: 'identified' | 'in-progress' | 'done' }) {
  const styles = {
    identified: 'bg-text-muted/20 text-text-muted',
    'in-progress': 'bg-warning/20 text-warning',
    done: 'bg-success/20 text-success',
  };
  const labels = {
    identified: 'Identified',
    'in-progress': 'In Progress',
    done: 'Done',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function LikelihoodBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-danger/20 text-danger',
    medium: 'bg-warning/20 text-warning',
    low: 'bg-success/20 text-success',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[level]}`}>
      {level}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab Content Components
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ member, os }: { member: TeamMember; os: TeamOS }) {
  const { primaryOf, directReportOf } = getAgentAssignments(member.id);

  return (
    <div className="space-y-6">
      {/* Header with mantra */}
      <div className="rounded-xl border border-border bg-surface-2 p-5">
        <div className="flex items-center gap-4">
          <div className={`${member.color} flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-lg`}>
            {member.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-text-primary">{member.name}</h3>
            <p className="text-sm text-accent font-medium">{member.role}</p>
            <p className="mt-1 text-xs italic text-text-muted">&ldquo;{os.operatingSystem.mantra}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Single-Threaded Ownership */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
            <User size={15} className="text-accent" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            Single-Threaded Ownership
          </h3>
        </div>
        <ul className="space-y-2 pl-1">
          {member.singleThreadedOwnership.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0 text-accent" />
              <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* KPIs */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
            <Target size={15} className="text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">KPIs</h3>
        </div>
        <ul className="space-y-2 pl-1">
          {member.kpis.map((kpi, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="mt-1 flex-shrink-0">
                <div className="h-2.5 w-2.5 rounded-full border-2 border-blue-400 bg-blue-400/20" />
              </div>
              <span className="text-sm leading-relaxed text-text-secondary">{kpi}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Non-Negotiables */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10">
            <Shield size={15} className="text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Non-Negotiables</h3>
        </div>
        <ul className="space-y-2 pl-1">
          {member.nonNegotiables.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Shield size={14} className="mt-0.5 flex-shrink-0 text-rose-400" />
              <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Agent Assignments */}
      {(primaryOf.length > 0 || directReportOf.length > 0) && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
              <Bot size={15} className="text-violet-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Agent Assignments</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {primaryOf.length > 0 && (
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-2">Primary Owner</p>
                <ul className="space-y-1.5">
                  {primaryOf.map((agentId) => (
                    <li key={agentId} className="flex items-center gap-2 text-sm text-text-secondary">
                      <Zap size={12} className="text-accent flex-shrink-0" />
                      {AGENT_LABELS[agentId] || agentId}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {directReportOf.length > 0 && (
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">Direct Report For</p>
                <ul className="space-y-1.5">
                  {directReportOf.map((agentId) => (
                    <li key={agentId} className="flex items-center gap-2 text-sm text-text-secondary">
                      <ChevronRight size={12} className="text-text-muted flex-shrink-0" />
                      {AGENT_LABELS[agentId] || agentId}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function Feedback360Tab({ os }: { os: TeamOS }) {
  const fb = os.feedback360;

  const sections: {
    title: string;
    items: string[];
    icon: typeof CheckCircle;
    iconColor: string;
    bgColor: string;
  }[] = [
    { title: 'Wins for Team', items: fb.winsForTeam, icon: CheckCircle, iconColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    { title: 'Makes Harder', items: fb.makesHarder, icon: AlertTriangle, iconColor: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    { title: 'Start Doing', items: fb.startDoing, icon: ArrowRight, iconColor: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { title: 'Stop Doing', items: fb.stopDoing, icon: X, iconColor: 'text-rose-400', bgColor: 'bg-rose-500/10' },
    { title: 'Support Needed', items: fb.supportNeeded, icon: Users, iconColor: 'text-violet-400', bgColor: 'bg-violet-500/10' },
    { title: 'Role Clarity', items: fb.roleClarity, icon: Briefcase, iconColor: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
    { title: 'High Leverage Moves', items: fb.highLeverageMoves, icon: Zap, iconColor: 'text-accent', bgColor: 'bg-accent/10' },
  ];

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.title}>
          <div className="mb-3 flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${section.bgColor}`}>
              <section.icon size={15} className={section.iconColor} />
            </div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
              {section.title}
            </h3>
            <span className="ml-auto text-xs text-text-muted font-mono">{section.items.length}</span>
          </div>
          <ul className="space-y-2 pl-1">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <section.icon size={13} className={`mt-0.5 flex-shrink-0 ${section.iconColor}`} />
                <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function OperatingSystemTab({ os }: { os: TeamOS }) {
  const opsys = os.operatingSystem;

  return (
    <div className="space-y-5">
      {/* Seat / Not This Seat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-emerald-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">This Seat</p>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{opsys.seat}</p>
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <X size={14} className="text-rose-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Not This Seat</p>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{opsys.notThisSeat}</p>
        </div>
      </div>

      {/* Morning Checklist */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
            <Clock size={15} className="text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Morning Checklist</h3>
        </div>
        <ul className="space-y-2 pl-1">
          {opsys.morningChecklist.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle size={13} className="mt-0.5 flex-shrink-0 text-amber-400" />
              <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Commitments */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
            <Shield size={15} className="text-accent" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Commitments</h3>
        </div>
        <ul className="space-y-2 pl-1">
          {opsys.commitments.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle size={13} className="mt-0.5 flex-shrink-0 text-accent" />
              <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Decision Filter */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
            <Brain size={15} className="text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Decision Filter</h3>
        </div>
        <ul className="space-y-2 pl-1">
          {opsys.decisionFilter.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <ChevronRight size={13} className="mt-0.5 flex-shrink-0 text-blue-400" />
              <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Evening Reflection */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
            <BookOpen size={15} className="text-violet-400" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Evening Reflection</h3>
        </div>
        <ul className="space-y-2 pl-1">
          {opsys.eveningReflection.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <PenTool size={13} className="mt-0.5 flex-shrink-0 text-violet-400" />
              <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Weekly Pulse */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10">
            <Activity size={15} className="text-cyan-400" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Weekly Pulse</h3>
        </div>
        <ul className="space-y-2 pl-1">
          {opsys.weeklyPulse.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Activity size={13} className="mt-0.5 flex-shrink-0 text-cyan-400" />
              <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Mantra */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Mantra</p>
        <p className="text-lg font-bold text-text-primary italic">&ldquo;{opsys.mantra}&rdquo;</p>
      </div>
    </div>
  );
}

function QualitiesTab({ os }: { os: TeamOS }) {
  const avgScore = os.qualities.length > 0
    ? (os.qualities.reduce((sum, q) => sum + q.score, 0) / os.qualities.length).toFixed(1)
    : '0';
  const growthEdges = os.qualities.filter((q) => q.score < 3);

  return (
    <div className="space-y-5">
      {/* Summary Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface-2 p-4">
        <div className="text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider">Average Score</p>
          <p className="text-2xl font-bold text-accent">{avgScore}<span className="text-sm text-text-muted">/5</span></p>
        </div>
        <div className="h-8 w-px bg-border hidden sm:block" />
        <div className="text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider">Qualities</p>
          <p className="text-2xl font-bold text-text-primary">{os.qualities.length}</p>
        </div>
        <div className="h-8 w-px bg-border hidden sm:block" />
        <div className="text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider">At 4+</p>
          <p className="text-2xl font-bold text-emerald-400">{os.qualities.filter((q) => q.score >= 4).length}</p>
        </div>
        {growthEdges.length > 0 && (
          <>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider">Growth Edges</p>
              <p className="text-2xl font-bold text-rose-400">{growthEdges.length}</p>
            </div>
          </>
        )}
      </div>

      {/* Quality Cards */}
      <div className="space-y-3">
        {os.qualities.map((quality, i) => {
          const isGrowthEdge = quality.score < 3;
          return (
            <div
              key={i}
              className={`rounded-xl border p-4 ${
                isGrowthEdge
                  ? 'border-rose-500/30 bg-rose-500/5'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-text-primary">{quality.name}</h4>
                    {isGrowthEdge && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                        <AlertTriangle size={10} />
                        Growth Edge
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">{quality.description}</p>
                </div>
                <span className="text-sm font-bold text-text-primary whitespace-nowrap">{quality.score}/5</span>
              </div>

              {/* Score Bar */}
              <div className="mb-3">
                <div className="h-2 w-full rounded-full bg-surface-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(quality.score / 5) * 100}%`,
                      background: quality.score >= 4
                        ? 'linear-gradient(90deg, #14b8a6, #10b981)'
                        : quality.score >= 3
                        ? 'linear-gradient(90deg, #14b8a6, #3b82f6)'
                        : 'linear-gradient(90deg, #f43f5e, #ef4444)',
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">360 says: </span>
                  <span className="text-xs text-text-secondary">{quality.feedbackSays}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Weekly question: </span>
                  <span className="text-xs italic text-text-secondary">{quality.weeklyQuestion}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RdsTab({ os }: { os: TeamOS }) {
  const rds = os.rdsFramework;
  const totalItems = rds.remove.length + rds.delegate.length + rds.systematize.length;
  const completedItems =
    rds.remove.filter((r) => r.status === 'done').length +
    rds.delegate.filter((d) => d.status === 'done').length +
    rds.systematize.filter((s) => s.status === 'done').length;
  const inProgressItems =
    rds.remove.filter((r) => r.status === 'in-progress').length +
    rds.delegate.filter((d) => d.status === 'in-progress').length +
    rds.systematize.filter((s) => s.status === 'in-progress').length;

  return (
    <div className="space-y-5">
      {/* Summary Stats */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface-2 p-4">
        <div className="text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider">Total Items</p>
          <p className="text-2xl font-bold text-text-primary">{totalItems}</p>
        </div>
        <div className="h-8 w-px bg-border hidden sm:block" />
        <div className="text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-warning">{inProgressItems}</p>
        </div>
        <div className="h-8 w-px bg-border hidden sm:block" />
        <div className="text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-success">{completedItems}</p>
        </div>
      </div>

      {/* Three Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Remove */}
        <div className="rounded-xl border border-rose-500/20 bg-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 size={15} className="text-rose-400" />
            <h4 className="text-sm font-semibold text-rose-400 uppercase tracking-wide">Remove</h4>
            <span className="ml-auto text-xs text-text-muted font-mono">{rds.remove.length}</span>
          </div>
          <div className="space-y-3">
            {rds.remove.map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface-2 p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-text-primary">{item.item}</p>
                  <RdsStatusBadge status={item.status} />
                </div>
                <p className="text-xs text-text-muted">{item.reason}</p>
              </div>
            ))}
            {rds.remove.length === 0 && (
              <p className="text-xs text-text-muted italic text-center py-4">No items</p>
            )}
          </div>
        </div>

        {/* Delegate */}
        <div className="rounded-xl border border-blue-500/20 bg-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight size={15} className="text-blue-400" />
            <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Delegate</h4>
            <span className="ml-auto text-xs text-text-muted font-mono">{rds.delegate.length}</span>
          </div>
          <div className="space-y-3">
            {rds.delegate.map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface-2 p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-text-primary">{item.item}</p>
                  <RdsStatusBadge status={item.status} />
                </div>
                <p className="text-xs text-text-muted">
                  <ArrowRight size={10} className="inline mr-1" />
                  {item.delegateTo}
                </p>
              </div>
            ))}
            {rds.delegate.length === 0 && (
              <p className="text-xs text-text-muted italic text-center py-4">No items</p>
            )}
          </div>
        </div>

        {/* Systematize */}
        <div className="rounded-xl border border-accent/20 bg-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={15} className="text-accent" />
            <h4 className="text-sm font-semibold text-accent uppercase tracking-wide">Systematize</h4>
            <span className="ml-auto text-xs text-text-muted font-mono">{rds.systematize.length}</span>
          </div>
          <div className="space-y-3">
            {rds.systematize.map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface-2 p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-text-primary">{item.item}</p>
                  <RdsStatusBadge status={item.status} />
                </div>
                <p className="text-xs text-text-muted">{item.system}</p>
              </div>
            ))}
            {rds.systematize.length === 0 && (
              <p className="text-xs text-text-muted italic text-center py-4">No items</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskTab({ os }: { os: TeamOS }) {
  const risk = os.riskFramework;

  return (
    <div className="space-y-5">
      {/* Personal Risks */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10">
            <AlertTriangle size={15} className="text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Personal Risks</h3>
        </div>

        {/* Mobile: cards; Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Risk</th>
                <th className="pb-2 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Likelihood</th>
                <th className="pb-2 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Impact</th>
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {risk.personalRisks.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pr-3 text-text-secondary">{r.risk}</td>
                  <td className="py-3 text-center"><LikelihoodBadge level={r.likelihood} /></td>
                  <td className="py-3 text-center"><LikelihoodBadge level={r.impact} /></td>
                  <td className="py-3 pl-3 text-text-muted text-xs">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {risk.personalRisks.map((r, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface-2 p-3">
              <p className="text-sm text-text-primary font-medium mb-2">{r.risk}</p>
              <div className="flex gap-2 mb-2">
                <div>
                  <span className="text-[10px] text-text-muted uppercase mr-1">Likelihood:</span>
                  <LikelihoodBadge level={r.likelihood} />
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase mr-1">Impact:</span>
                  <LikelihoodBadge level={r.impact} />
                </div>
              </div>
              <p className="text-xs text-text-muted">{r.mitigation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Decision Principles */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
            <Brain size={15} className="text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Decision Principles</h3>
        </div>
        <ul className="space-y-2 pl-1">
          {risk.decisionPrinciples.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <ChevronRight size={13} className="mt-0.5 flex-shrink-0 text-blue-400" />
              <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Red Lines */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10">
            <Shield size={15} className="text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Red Lines</h3>
        </div>
        <div className="space-y-2">
          {risk.redLines.map((line, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-rose-400" />
              <span className="text-sm leading-relaxed text-rose-300">{line}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

type JournalSectionId = 'morning' | 'eod' | 'weekly' | 'monthly';

function JournalTab({ memberId }: { memberId: string }) {
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<JournalSectionId>('morning');
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sections: { id: JournalSectionId; label: string; icon: typeof Clock; color: string; prompts: typeof MORNING_JOURNAL }[] = [
    { id: 'morning', label: 'Morning Start', icon: Zap, color: 'text-amber-400', prompts: MORNING_JOURNAL },
    { id: 'eod', label: 'End of Day', icon: BookOpen, color: 'text-violet-400', prompts: EOD_JOURNAL },
    { id: 'weekly', label: 'Weekly Plan', icon: Target, color: 'text-blue-400', prompts: WEEKLY_PLAN },
    { id: 'monthly', label: 'Monthly Plan', icon: BarChart3, color: 'text-accent', prompts: MONTHLY_PLAN },
  ];

  const currentSection = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <div className="space-y-5">
      {/* Date + Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Clock size={14} />
          <span className="font-mono">{today}</span>
        </div>
        <div className="flex gap-1 bg-surface-2 rounded-xl p-1">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            const SIcon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-accent/15 text-accent shadow-sm'
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-3'
                }`}
              >
                <SIcon size={12} />
                <span className="hidden sm:inline">{sec.label}</span>
                <span className="sm:hidden">{sec.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Header */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
        <div className="flex items-center gap-2 mb-1">
          <currentSection.icon size={16} className={currentSection.color} />
          <h3 className="text-sm font-semibold text-text-primary">{currentSection.label}</h3>
        </div>
        <p className="text-xs text-text-muted">
          {activeSection === 'morning' && 'Start your day with intention. Ground yourself, set priorities, protect focus.'}
          {activeSection === 'eod' && 'Close the day clean. Dump tension, note wins, prep for tomorrow.'}
          {activeSection === 'weekly' && 'Plan the week ahead. Set your top 3, identify blockers, clarify ownership.'}
          {activeSection === 'monthly' && 'Zoom out. Review progress, audit your RDS, score your qualities, plan the next month.'}
        </p>
      </div>

      {/* Prompt Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentSection.prompts.map((jp) => (
          <div key={jp.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <PenTool size={13} className={currentSection.color} />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{jp.label}</h4>
            </div>
            <p className="text-sm text-text-secondary italic mb-3">{jp.prompt}</p>
            <textarea
              rows={3}
              value={entries[jp.id] || ''}
              onChange={(e) => setEntries((prev) => ({ ...prev, [jp.id]: e.target.value }))}
              placeholder="Reflect here..."
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentIntelTab({ memberId }: { memberId: string }) {
  const insights = PROACTIVE_INSIGHTS[memberId] || [];
  const { primaryOf, directReportOf } = getAgentAssignments(memberId);

  const typeStyles = {
    strategic: { bg: 'bg-accent/10', border: 'border-accent/30', icon: Zap, iconColor: 'text-accent', label: 'Strategic Insight' },
    question: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Brain, iconColor: 'text-blue-400', label: 'Key Question' },
    research: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', icon: BookOpen, iconColor: 'text-violet-400', label: 'Research Prompt' },
  };

  return (
    <div className="space-y-6">
      {/* Agent Summary */}
      <div className="rounded-xl border border-border bg-surface-2 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bot size={16} className="text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Your AI Agents</h3>
        </div>
        <p className="text-xs text-text-muted mb-3">
          These agents proactively think for you — surfacing strategic ideas, asking questions you might not be asking yourself, and suggesting research to strengthen your decisions.
        </p>
        <div className="flex flex-wrap gap-2">
          {primaryOf.map((agentId) => (
            <span key={agentId} className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent">
              <Zap size={10} />
              {AGENT_LABELS[agentId]}
              <span className="text-[9px] text-accent/60 ml-0.5">OWNER</span>
            </span>
          ))}
          {directReportOf.map((agentId) => (
            <span key={agentId} className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-medium text-text-muted">
              <ChevronRight size={10} />
              {AGENT_LABELS[agentId]}
            </span>
          ))}
        </div>
      </div>

      {/* Proactive Insights */}
      {insights.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-accent" />
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
              Proactive Intelligence
            </h3>
            <span className="ml-auto text-xs text-text-muted font-mono">{insights.length} insights</span>
          </div>
          {insights.map((insight, i) => {
            const style = typeStyles[insight.type];
            const IIcon = style.icon;
            return (
              <div
                key={i}
                className={`rounded-xl border ${style.border} ${style.bg} p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-surface/50`}>
                      <IIcon size={15} className={style.iconColor} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.iconColor}`}>
                        {style.label}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">
                        via {AGENT_LABELS[insight.agentId]}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{insight.insight}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <Bot size={24} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-muted">No proactive insights available yet for this team member.</p>
        </div>
      )}

      {/* What your agents can do for you */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={15} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-text-primary">What Your Agents Think About</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={12} className="text-accent" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Strategic</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Ideas you might not be thinking of. Connections between data points. Patterns that need attention.
            </p>
          </div>
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Brain size={12} className="text-blue-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">Questions</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              The hard questions you should be asking yourself. Blind spots. Assumptions to challenge.
            </p>
          </div>
          <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={12} className="text-violet-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">Research</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Benchmarks, best practices, and competitive intelligence. What the best firms do differently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function TeamView() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Pre-compute OS data for quick stats on cards
  const memberOSMap = useMemo(() => {
    const map: Record<string, TeamOS | undefined> = {};
    for (const m of teamMembers) {
      map[m.id] = getTeamMemberOS(m.id);
    }
    return map;
  }, []);

  const selectedOS = selectedMember ? memberOSMap[selectedMember.id] : undefined;

  const handleOpenMember = (member: TeamMember) => {
    setSelectedMember(member);
    setActiveTab('overview');
  };

  const handleClose = () => {
    setSelectedMember(null);
    setActiveTab('overview');
  };

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          Team Operating Systems
        </h1>
        <p className="mt-2 text-text-secondary text-base">
          Every person&apos;s 1-pager &mdash; roles, responsibilities, decision rights, and non-negotiables
        </p>
      </div>

      {/* ── Team Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {teamMembers.map((member, index) => {
          const os = memberOSMap[member.id];
          const stats = getQuickStats(os);

          return (
            <button
              key={member.id}
              onClick={() => handleOpenMember(member)}
              className="glow-card group text-left rounded-xl border border-border bg-surface p-5 transition-all duration-300 hover:border-accent/40 hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/50"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'backwards',
              }}
            >
              <div className="flex items-start gap-3.5">
                {/* Avatar */}
                <div
                  className={`${member.color} flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg`}
                >
                  {member.avatar}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Name + Status */}
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-text-primary">
                      {member.name}
                    </h3>
                    {member.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                        <AlertCircle size={10} />
                        Hiring
                      </span>
                    )}
                  </div>

                  {/* Role */}
                  <p className="mt-0.5 text-xs font-medium text-accent">
                    {member.role}
                  </p>

                  {/* One-sentence description */}
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-muted">
                    {member.roleOneSentence}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              {os && (
                <div className="mt-3 flex items-center gap-3 text-[11px] text-text-muted">
                  <span className="flex items-center gap-1" title="Qualities at 4+">
                    <Star size={11} className="text-emerald-400" />
                    {stats.qualitiesAbove4}
                  </span>
                  <span className="flex items-center gap-1" title="RDS in progress">
                    <Activity size={11} className="text-warning" />
                    {stats.rdsInProgress}
                  </span>
                  <span className="flex items-center gap-1" title="Risk items">
                    <AlertTriangle size={11} className="text-rose-400" />
                    {stats.riskItems}
                  </span>
                  <span className="ml-auto flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Briefcase size={11} />
                    View OS
                  </span>
                </div>
              )}

              {/* Fallback hint for members without OS */}
              {!os && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Briefcase size={12} />
                  Click to view details
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Full Member OS Overlay ── */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Full-screen scrollable panel */}
          <div
            id="team-detail-panel"
            className="relative z-10 w-full max-w-4xl mx-4 my-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Panel Header ── */}
            <div className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-md rounded-t-2xl">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`${selectedMember.color} flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-xl`}
                  >
                    {selectedMember.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-bold text-text-primary">
                        {selectedMember.name}
                      </h2>
                      {selectedMember.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                          <AlertCircle size={11} />
                          Hiring
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-accent">
                      {selectedMember.role}
                    </p>
                  </div>
                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    className="flex-shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-3 hover:text-text-primary"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* ── Tab Navigation ── */}
              {selectedOS && (
                <div className="px-6 overflow-x-auto">
                  <div className="flex gap-1 min-w-max">
                    {TABS.map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all duration-200 whitespace-nowrap ${
                            isActive
                              ? 'border-accent text-accent bg-accent/5'
                              : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-2'
                          }`}
                        >
                          <tab.icon size={13} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Tab Content ── */}
            <div className="p-6">
              {selectedOS ? (
                <>
                  {activeTab === 'overview' && <OverviewTab member={selectedMember} os={selectedOS} />}
                  {activeTab === '360' && <Feedback360Tab os={selectedOS} />}
                  {activeTab === 'os' && <OperatingSystemTab os={selectedOS} />}
                  {activeTab === 'qualities' && <QualitiesTab os={selectedOS} />}
                  {activeTab === 'rds' && <RdsTab os={selectedOS} />}
                  {activeTab === 'risk' && <RiskTab os={selectedOS} />}
                  {activeTab === 'journal' && <JournalTab memberId={selectedMember.id} />}
                  {activeTab === 'agent-intel' && <AgentIntelTab memberId={selectedMember.id} />}
                </>
              ) : (
                /* Fallback for members without OS data */
                <div className="space-y-6">
                  <p className="text-sm text-text-muted italic">
                    Full operating system data not yet available for this team member. Showing base details.
                  </p>

                  {/* Single-Threaded Ownership */}
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                        <User size={15} className="text-accent" />
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                        Single-Threaded Ownership
                      </h3>
                    </div>
                    <ul className="space-y-2 pl-1">
                      {selectedMember.singleThreadedOwnership.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle size={14} className="mt-0.5 flex-shrink-0 text-accent" />
                          <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* KPIs */}
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                        <Target size={15} className="text-blue-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">KPIs</h3>
                    </div>
                    <ul className="space-y-2 pl-1">
                      {selectedMember.kpis.map((kpi, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className="mt-1 flex-shrink-0">
                            <div className="h-2.5 w-2.5 rounded-full border-2 border-blue-400 bg-blue-400/20" />
                          </div>
                          <span className="text-sm leading-relaxed text-text-secondary">{kpi}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Non-Negotiables */}
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10">
                        <Shield size={15} className="text-rose-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Non-Negotiables</h3>
                    </div>
                    <ul className="space-y-2 pl-1">
                      {selectedMember.nonNegotiables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Shield size={14} className="mt-0.5 flex-shrink-0 text-rose-400" />
                          <span className="text-sm leading-relaxed text-text-secondary">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-border p-6">
              <button
                onClick={() =>
                  exportToPdf(
                    'team-detail-panel',
                    `amphibian-unite-${selectedMember.id}-${activeTab}`
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-2 hover:shadow-accent/30 active:scale-[0.97]"
              >
                <FileDown size={16} />
                Download as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
