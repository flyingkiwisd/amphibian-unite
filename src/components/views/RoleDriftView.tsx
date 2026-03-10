'use client';

import { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';
import { getTeamMemberOS } from '@/lib/teamOS';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface DriftItem {
  activity: string;
  isInSeat: boolean;
  category: string;
}

interface MemberDrift {
  memberId: string;
  driftScore: number;
  recentActivities: DriftItem[];
  driftReason: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Drift Data
// ─────────────────────────────────────────────────────────────────────────────
const driftData: MemberDrift[] = [
  {
    memberId: 'james',
    driftScore: 20,
    driftReason: 'Doing IC-level portfolio analysis and daily ops management that should be delegated to PM and COO',
    recentActivities: [
      { activity: 'Set quarterly strategic priorities and communicated to team', isInSeat: true, category: 'Vision' },
      { activity: 'Led LP pitch meeting for Summit Capital re-up', isInSeat: true, category: 'Capital Raising' },
      { activity: 'Reviewed detailed portfolio allocation spreadsheet for BTC Alpha', isInSeat: false, category: 'Portfolio Analysis' },
      { activity: 'Drafted Amphibian Unite roadmap v2', isInSeat: true, category: 'Platform/OS Vision' },
      { activity: 'Manually checked daily NAV calculations', isInSeat: false, category: 'Operations' },
      { activity: 'Conducted 1-on-1 leadership development session with Ross', isInSeat: true, category: 'Leadership' },
      { activity: 'Built custom manager comparison model in Excel', isInSeat: false, category: 'IC Work' },
      { activity: 'Negotiated terms with potential distribution partner', isInSeat: true, category: 'Strategy' },
      { activity: 'Resolved investor ops issue with quarterly statement', isInSeat: false, category: 'Operations' },
      { activity: 'Presented at crypto fund conference (panel speaker)', isInSeat: true, category: 'Brand' },
    ],
  },
  {
    memberId: 'ross',
    driftScore: 15,
    driftReason: 'Absorbing unowned compliance tasks and investor communications that belong in other seats',
    recentActivities: [
      { activity: 'Executed rebalance across BTC Alpha portfolio', isInSeat: true, category: 'Portfolio Execution' },
      { activity: 'Completed counterparty onboarding for new exchange', isInSeat: true, category: 'SMA Infrastructure' },
      { activity: 'Reviewed compliance checklist for quarter-end', isInSeat: false, category: 'Compliance' },
      { activity: 'Monitored manager performance drift metrics', isInSeat: true, category: 'Manager Monitoring' },
      { activity: 'Drafted LP response about custody arrangements', isInSeat: false, category: 'Investor Comms' },
      { activity: 'Updated SMA setup tracker with new custody provider', isInSeat: true, category: 'SMA Infrastructure' },
      { activity: 'Filed regulatory documentation for new entity', isInSeat: false, category: 'Compliance' },
      { activity: 'Documented portfolio change rationale', isInSeat: true, category: 'Portfolio Execution' },
    ],
  },
  {
    memberId: 'sahir',
    driftScore: 10,
    driftReason: 'Formatting and presentation tasks that should be automated or delegated to operations',
    recentActivities: [
      { activity: 'Built strategy performance comparison model', isInSeat: true, category: 'Manager Research' },
      { activity: 'Analyzed 15 new manager track records', isInSeat: true, category: 'Manager Research' },
      { activity: 'Formatted investor deck with manual styling updates', isInSeat: false, category: 'Formatting' },
      { activity: 'Modeled options overlay strategy scenarios', isInSeat: true, category: 'Options Modeling' },
      { activity: 'Updated strategy performance database', isInSeat: true, category: 'Database' },
      { activity: 'Manually cleaned and merged data from 3 manager reports', isInSeat: false, category: 'Data Cleaning' },
      { activity: 'Prepared CIO sounding board discussion notes', isInSeat: true, category: 'Strategic Support' },
      { activity: 'Built SMA manager selection framework', isInSeat: true, category: 'SMA Selection' },
    ],
  },
  {
    memberId: 'ty',
    driftScore: 8,
    driftReason: 'Minor drift into operational execution tasks that should be handled by PM',
    recentActivities: [
      { activity: 'Set portfolio risk limits for Q2', isInSeat: true, category: 'Risk Governance' },
      { activity: 'Evaluated new DeFi yield opportunity', isInSeat: true, category: 'BTC Alpha' },
      { activity: 'Reviewed options structure for hedging', isInSeat: true, category: 'Strategy' },
      { activity: 'Personally executed a manager reallocation trade', isInSeat: false, category: 'Execution' },
      { activity: 'Published IC Portfolio Memo for March', isInSeat: true, category: 'IC' },
      { activity: 'Delivered HRP/MVO engine requirements to Timon', isInSeat: true, category: 'Roadmap' },
      { activity: 'Manager selection review: A9 quarterly assessment', isInSeat: true, category: 'Manager Lifecycle' },
    ],
  },
  {
    memberId: 'timon',
    driftScore: 5,
    driftReason: 'Minimal drift — occasional ad-hoc data requests from team pulling into unplanned work',
    recentActivities: [
      { activity: 'Shipped risk dashboard v0.8 with concentration metrics', isInSeat: true, category: 'Risk Dashboard' },
      { activity: 'Set up data pipeline for new manager feed', isInSeat: true, category: 'Data Pipeline' },
      { activity: 'Pulled ad-hoc performance data for LP meeting', isInSeat: false, category: 'Ad-hoc Request' },
      { activity: 'Implemented regime classifier data ingestion', isInSeat: true, category: 'Regime Classifier' },
      { activity: 'Built DeFi monitoring alert system', isInSeat: true, category: 'DeFi Automation' },
      { activity: 'Deployed Amphibian Unite feature updates', isInSeat: true, category: 'Internal Platform' },
    ],
  },
  {
    memberId: 'thao',
    driftScore: 7,
    driftReason: 'Taking on project management tasks that drift into strategic planning territory',
    recentActivities: [
      { activity: 'Delivered investor ops SLA report for February', isInSeat: true, category: 'Investor Ops' },
      { activity: 'Tracked cross-functional project milestones', isInSeat: true, category: 'Project Management' },
      { activity: 'Enforced SOP documentation for new process', isInSeat: true, category: 'Process Standards' },
      { activity: 'Drafted strategic proposal for ops restructuring', isInSeat: false, category: 'Strategic Planning' },
      { activity: 'Managed vendor onboarding workflow', isInSeat: true, category: 'Operations' },
      { activity: 'Published workflow reliability report', isInSeat: true, category: 'Operations' },
    ],
  },
  {
    memberId: 'todd',
    driftScore: 6,
    driftReason: 'Minor drift into BD/sales activities outside of investor relations scope',
    recentActivities: [
      { activity: 'Sent monthly LP update for February', isInSeat: true, category: 'Investor Comms' },
      { activity: 'Resolved LP query about quarterly statement', isInSeat: true, category: 'LP Trust' },
      { activity: 'Attended cold outreach meeting with potential LP', isInSeat: false, category: 'BD' },
      { activity: 'Updated redemption process documentation', isInSeat: true, category: 'Investor Ops' },
      { activity: 'Prepared board governance agenda', isInSeat: true, category: 'Governance' },
      { activity: 'Tracked LP satisfaction metrics for Q1', isInSeat: true, category: 'LP Trust' },
    ],
  },
  {
    memberId: 'mark',
    driftScore: 5,
    driftReason: 'Minimal drift — occasionally pulled into operational questions outside financial planning',
    recentActivities: [
      { activity: 'Published weekly cash forecast', isInSeat: true, category: 'Cash Runway' },
      { activity: 'Completed monthly downside review', isInSeat: true, category: 'Scenario Planning' },
      { activity: 'Advised on vendor contract terms (non-financial)', isInSeat: false, category: 'Operations' },
      { activity: 'Shipped budget tool v2 with scenario modeling', isInSeat: true, category: 'Budget Tools' },
      { activity: 'Reconciled entity-level financials post-merger', isInSeat: true, category: 'Accounting' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getDriftStatus(score: number): { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle } {
  if (score < 10) return { label: 'Well-Aligned', color: 'text-success', bg: 'bg-success/15', border: 'border-success/30', icon: CheckCircle };
  if (score <= 25) return { label: 'Watch', color: 'text-warning', bg: 'bg-warning/15', border: 'border-warning/30', icon: Clock };
  return { label: 'Misaligned', color: 'text-danger', bg: 'bg-danger/15', border: 'border-danger/30', icon: AlertTriangle };
}

function getDriftBarColor(score: number): string {
  if (score < 10) return 'bg-success';
  if (score <= 25) return 'bg-warning';
  return 'bg-danger';
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function RoleDriftView() {
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  // Sort by drift score descending
  const sortedDrift = [...driftData].sort((a, b) => b.driftScore - a.driftScore);

  // Team-wide stats
  const avgDrift = Math.round(
    driftData.reduce((sum, d) => sum + d.driftScore, 0) / driftData.length
  );
  const misalignedCount = driftData.filter((d) => d.driftScore > 25).length;
  const watchCount = driftData.filter((d) => d.driftScore >= 10 && d.driftScore <= 25).length;
  const alignedCount = driftData.filter((d) => d.driftScore < 10).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Compass className="w-7 h-7 text-teal-400" />
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="gradient-text">Role Drift Detection</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-3xl">
          Compare what each team member is supposed to own versus what they are actually
          doing. Catch misalignment before it becomes a problem.
        </p>
      </div>

      {/* ── Team Summary ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in"
        style={{ animationDelay: '75ms', opacity: 0 }}
      >
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Avg Drift Score</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-text-primary">{avgDrift}%</span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${getDriftBarColor(avgDrift)}`}
              style={{ width: `${Math.min(avgDrift * 4, 100)}%` }}
            />
          </div>
        </div>

        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Well-Aligned</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-3xl font-bold text-success">{alignedCount}</span>
          </div>
          <p className="text-xs text-text-muted mt-2">&lt;10% drift</p>
        </div>

        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Watch</p>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            <span className="text-3xl font-bold text-warning">{watchCount}</span>
          </div>
          <p className="text-xs text-text-muted mt-2">10-25% drift</p>
        </div>

        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Misaligned</p>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <span className="text-3xl font-bold text-danger">{misalignedCount}</span>
          </div>
          <p className="text-xs text-text-muted mt-2">&gt;25% drift</p>
        </div>
      </div>

      {/* ── Drift Heatmap ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '150ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-text-primary">Team Drift Heatmap</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {sortedDrift.map((d) => {
            const member = teamMembers.find((m) => m.id === d.memberId);
            const status = getDriftStatus(d.driftScore);
            if (!member) return null;

            return (
              <button
                key={d.memberId}
                onClick={() => setExpandedMember(expandedMember === d.memberId ? null : d.memberId)}
                className={`rounded-lg p-3 text-center transition-all duration-300 border ${
                  expandedMember === d.memberId ? status.border : 'border-transparent'
                } ${status.bg} hover:scale-105`}
              >
                <div
                  className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-bold mx-auto`}
                >
                  {member.avatar}
                </div>
                <p className="text-xs font-semibold text-text-primary mt-2">
                  {member.name.split(' ')[0]}
                </p>
                <p className={`text-lg font-bold ${status.color} mt-1`}>{d.driftScore}%</p>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-success/30" />
            <span className="text-xs text-text-muted">&lt;10% aligned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-warning/30" />
            <span className="text-xs text-text-muted">10-25% watch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-danger/30" />
            <span className="text-xs text-text-muted">&gt;25% misaligned</span>
          </div>
        </div>
      </div>

      {/* ── Per-Member Cards ── */}
      <div
        className="space-y-3 animate-fade-in"
        style={{ animationDelay: '225ms', opacity: 0 }}
      >
        {sortedDrift.map((d) => {
          const member = teamMembers.find((m) => m.id === d.memberId);
          const os = getTeamMemberOS(d.memberId);
          const status = getDriftStatus(d.driftScore);
          const StatusIcon = status.icon;
          const isExpanded = expandedMember === d.memberId;

          if (!member) return null;

          const driftItems = d.recentActivities.filter((a) => !a.isInSeat);
          const inSeatItems = d.recentActivities.filter((a) => a.isInSeat);

          return (
            <button
              key={d.memberId}
              onClick={() => setExpandedMember(isExpanded ? null : d.memberId)}
              className={`w-full text-left glow-card bg-surface border rounded-xl p-5 transition-all duration-300 hover:border-border-2 ${
                isExpanded ? status.border : 'border-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar & Name */}
                <div className="flex items-center gap-3 sm:w-52 shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{member.name}</h3>
                    <p className="text-xs text-text-muted">{member.shortRole}</p>
                  </div>
                </div>

                {/* Drift Score Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getDriftBarColor(d.driftScore)}`}
                        style={{ width: `${Math.min(d.driftScore * 4, 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold w-10 text-right ${status.color}`}>
                      {d.driftScore}%
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color} flex items-center gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  {/* Seat Description */}
                  {os && (
                    <div className="bg-surface-2 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-teal-400" />
                        <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                          Seat Description
                        </h4>
                      </div>
                      <p className="text-xs text-text-primary font-medium">
                        {os.operatingSystem.seat}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        <span className="text-rose-400 font-medium">Not this seat:</span>{' '}
                        {os.operatingSystem.notThisSeat}
                      </p>
                    </div>
                  )}

                  {/* Drift Reason */}
                  <div className={`rounded-lg p-3 ${status.bg} border ${status.border}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className={`w-3 h-3 ${status.color}`} />
                      <span className={`text-xs font-semibold ${status.color}`}>Drift Pattern</span>
                    </div>
                    <p className="text-xs text-text-secondary">{d.driftReason}</p>
                  </div>

                  {/* Activity Lists */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Drift Items */}
                    <div>
                      <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Outside Seat ({driftItems.length})
                      </h4>
                      <div className="space-y-1.5">
                        {driftItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 bg-rose-500/5 border border-rose-500/20 rounded-lg p-2"
                          >
                            <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                              Not in seat
                            </span>
                            <div>
                              <p className="text-xs text-text-secondary">{item.activity}</p>
                              <p className="text-xs text-text-muted mt-0.5">{item.category}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* In-Seat Items */}
                    <div>
                      <h4 className="text-xs font-semibold text-success uppercase tracking-wider mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        In Seat ({inSeatItems.length})
                      </h4>
                      <div className="space-y-1.5">
                        {inSeatItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 bg-surface-2 rounded-lg p-2"
                          >
                            <CheckCircle className="w-3 h-3 text-success shrink-0 mt-1" />
                            <div>
                              <p className="text-xs text-text-secondary">{item.activity}</p>
                              <p className="text-xs text-text-muted mt-0.5">{item.category}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
