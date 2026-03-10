'use client';

import { useState } from 'react';
import {
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
  Users,
  TrendingDown,
  TrendingUp,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEditableStore } from '@/lib/useEditableStore';
import { InlineText, InlineNumber, InlineSelect, EditBanner } from '@/components/InlineEdit';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface LP {
  id: string;
  name: string;
  aumCommitted: string;
  investmentDate: string;
  healthScore: number;
  status: 'Healthy' | 'Watch' | 'At Risk';
  lastContact: string;
  daysSinceContact: number;
  nextAction: string;
  communicationFreq: number;
  satisfaction: number;
  aumTrend: 'up' | 'down' | 'flat';
  engagement: number;
}

interface PipelineStage {
  name: string;
  count: number;
  color: string;
  width: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Data
// ─────────────────────────────────────────────────────────────────────────────
const defaultLPs: LP[] = [
  {
    id: 'lp-1',
    name: 'Summit Capital',
    aumCommitted: '$8.5M',
    investmentDate: 'Jan 2024',
    healthScore: 92,
    status: 'Healthy',
    lastContact: '3 days ago',
    daysSinceContact: 3,
    nextAction: 'Send Q1 performance update',
    communicationFreq: 95,
    satisfaction: 90,
    aumTrend: 'up',
    engagement: 88,
  },
  {
    id: 'lp-2',
    name: 'Horizon Partners',
    aumCommitted: '$12M',
    investmentDate: 'Mar 2023',
    healthScore: 85,
    status: 'Healthy',
    lastContact: '1 week ago',
    daysSinceContact: 7,
    nextAction: 'Schedule quarterly review call',
    communicationFreq: 85,
    satisfaction: 88,
    aumTrend: 'up',
    engagement: 82,
  },
  {
    id: 'lp-3',
    name: 'Blue Ridge Family Office',
    aumCommitted: '$5M',
    investmentDate: 'Sep 2024',
    healthScore: 74,
    status: 'Healthy',
    lastContact: '2 weeks ago',
    daysSinceContact: 14,
    nextAction: 'Follow up on SMA interest',
    communicationFreq: 70,
    satisfaction: 78,
    aumTrend: 'flat',
    engagement: 72,
  },
  {
    id: 'lp-4',
    name: 'Pacific Ventures',
    aumCommitted: '$6.2M',
    investmentDate: 'Jun 2023',
    healthScore: 58,
    status: 'Watch',
    lastContact: '28 days ago',
    daysSinceContact: 28,
    nextAction: 'Urgent: Schedule check-in call',
    communicationFreq: 50,
    satisfaction: 62,
    aumTrend: 'down',
    engagement: 55,
  },
  {
    id: 'lp-5',
    name: 'Atlas Institutional',
    aumCommitted: '$4.8M',
    investmentDate: 'Nov 2024',
    healthScore: 45,
    status: 'Watch',
    lastContact: '35 days ago',
    daysSinceContact: 35,
    nextAction: 'Address performance concerns',
    communicationFreq: 40,
    satisfaction: 50,
    aumTrend: 'down',
    engagement: 42,
  },
  {
    id: 'lp-6',
    name: 'Nordic Capital',
    aumCommitted: '$3.5M',
    investmentDate: 'Apr 2024',
    healthScore: 32,
    status: 'At Risk',
    lastContact: '45 days ago',
    daysSinceContact: 45,
    nextAction: 'Immediate outreach — potential redemption',
    communicationFreq: 25,
    satisfaction: 35,
    aumTrend: 'down',
    engagement: 28,
  },
  {
    id: 'lp-7',
    name: 'Meridian Trust',
    aumCommitted: '$7M',
    investmentDate: 'Aug 2023',
    healthScore: 80,
    status: 'Healthy',
    lastContact: '5 days ago',
    daysSinceContact: 5,
    nextAction: 'Send Dynamic Alpha teaser',
    communicationFreq: 80,
    satisfaction: 82,
    aumTrend: 'up',
    engagement: 78,
  },
  {
    id: 'lp-8',
    name: 'Cornerstone Holdings',
    aumCommitted: '$2.8M',
    investmentDate: 'Feb 2025',
    healthScore: 68,
    status: 'Watch',
    lastContact: '18 days ago',
    daysSinceContact: 18,
    nextAction: 'Provide updated risk report',
    communicationFreq: 65,
    satisfaction: 70,
    aumTrend: 'flat',
    engagement: 60,
  },
];

const pipelineStages: PipelineStage[] = [
  { name: 'Intro', count: 14, color: 'bg-blue-500', width: 'w-full' },
  { name: 'Meeting', count: 8, color: 'bg-indigo-500', width: 'w-[72%]' },
  { name: 'Due Diligence', count: 5, color: 'bg-violet-500', width: 'w-[50%]' },
  { name: 'Commitment', count: 3, color: 'bg-purple-500', width: 'w-[32%]' },
  { name: 'Invested', count: 8, color: 'bg-teal-500', width: 'w-[72%]' },
];

const alerts = [
  {
    type: 'danger' as const,
    message: 'Nordic Capital hasn\'t been contacted in 45 days — potential redemption risk.',
    action: 'Schedule immediate call',
  },
  {
    type: 'warning' as const,
    message: 'Atlas Institutional\'s AUM trend is declining — satisfaction dropping.',
    action: 'Send performance update',
  },
  {
    type: 'warning' as const,
    message: 'Pacific Ventures last contacted 28 days ago — exceeds 21-day SLA.',
    action: 'Outreach scheduled',
  },
  {
    type: 'info' as const,
    message: 'Summit Capital expressed interest in Dynamic Alpha product — warm lead.',
    action: 'Send teaser deck',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const statusConfig = {
  Healthy: { color: 'text-success', bg: 'bg-success/15', border: 'border-success/30', icon: CheckCircle },
  Watch: { color: 'text-warning', bg: 'bg-warning/15', border: 'border-warning/30', icon: Clock },
  'At Risk': { color: 'text-danger', bg: 'bg-danger/15', border: 'border-danger/30', icon: AlertTriangle },
};

const alertTypeConfig = {
  danger: { bg: 'bg-danger/10', border: 'border-danger/30', color: 'text-danger', icon: AlertTriangle },
  warning: { bg: 'bg-warning/10', border: 'border-warning/30', color: 'text-warning', icon: Clock },
  info: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', color: 'text-teal-400', icon: CheckCircle },
};

const statusOptions = [
  { label: 'Healthy', value: 'Healthy', color: 'bg-success/15 text-success' },
  { label: 'Watch', value: 'Watch', color: 'bg-warning/15 text-warning' },
  { label: 'At Risk', value: 'At Risk', color: 'bg-danger/15 text-danger' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function LPHealthView() {
  const { data: lpList, setData: setLPList, hasEdits, resetAll } = useEditableStore<LP[]>(
    'amphibian-unite-lp-health',
    defaultLPs
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedLP, setExpandedLP] = useState<string | null>(null);

  const sortedLPs = [...lpList].sort((a, b) => a.healthScore - b.healthScore);
  const filteredLPs =
    filterStatus === 'all'
      ? sortedLPs
      : sortedLPs.filter((lp) => lp.status === filterStatus);

  const avgScore = lpList.length > 0
    ? Math.round(lpList.reduce((sum, lp) => sum + lp.healthScore, 0) / lpList.length)
    : 0;
  const atRiskCount = lpList.filter((lp) => lp.status === 'At Risk').length;
  const watchCount = lpList.filter((lp) => lp.status === 'Watch').length;
  const healthyCount = lpList.filter((lp) => lp.status === 'Healthy').length;

  // ── Update helpers ──
  const updateLP = (id: string, field: keyof LP, value: string | number) => {
    setLPList((prev) =>
      prev.map((lp) => (lp.id === id ? { ...lp, [field]: value } : lp))
    );
  };

  const deleteLP = (id: string) => {
    setLPList((prev) => prev.filter((lp) => lp.id !== id));
    if (expandedLP === id) setExpandedLP(null);
  };

  const addLP = () => {
    const newId = `lp-${Date.now()}`;
    const newLP: LP = {
      id: newId,
      name: 'New LP',
      aumCommitted: '$0M',
      investmentDate: 'Mar 2026',
      healthScore: 50,
      status: 'Watch',
      lastContact: 'Today',
      daysSinceContact: 0,
      nextAction: 'Schedule intro call',
      communicationFreq: 50,
      satisfaction: 50,
      aumTrend: 'flat',
      engagement: 50,
    };
    setLPList((prev) => [...prev, newLP]);
    setExpandedLP(newId);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Edit Banner ── */}
      <EditBanner hasEdits={hasEdits} onReset={resetAll} />

      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-7 h-7 text-teal-400" />
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="gradient-text">LP Health Score</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-3xl">
          Composite health scoring for every LP relationship. Monitor engagement,
          satisfaction, and proactively prevent churn.
        </p>
      </div>

      {/* ── Overall Health Summary ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in"
        style={{ animationDelay: '75ms', opacity: 0 }}
      >
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Avg Health Score</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-text-primary">{avgScore}</span>
            <span className="text-text-muted text-sm mb-1">/100</span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                avgScore >= 70
                  ? 'bg-success'
                  : avgScore >= 40
                    ? 'bg-warning'
                    : 'bg-danger'
              }`}
              style={{ width: `${avgScore}%` }}
            />
          </div>
        </div>

        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Healthy</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-3xl font-bold text-success">{healthyCount}</span>
          </div>
          <p className="text-xs text-text-muted mt-2">Score 70+</p>
        </div>

        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Watch</p>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            <span className="text-3xl font-bold text-warning">{watchCount}</span>
          </div>
          <p className="text-xs text-text-muted mt-2">Score 40-69</p>
        </div>

        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">At Risk</p>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <span className="text-3xl font-bold text-danger">{atRiskCount}</span>
          </div>
          <p className="text-xs text-text-muted mt-2">Score &lt;40</p>
        </div>
      </div>

      {/* ── Filter Controls ── */}
      <div
        className="flex items-center gap-3 animate-fade-in"
        style={{ animationDelay: '150ms', opacity: 0 }}
      >
        <Filter className="w-4 h-4 text-text-muted" />
        <span className="text-xs text-text-muted uppercase tracking-wider">Filter:</span>
        {['all', 'Healthy', 'Watch', 'At Risk'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === status
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-surface-2 text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            {status === 'all' ? 'All LPs' : status}
          </button>
        ))}
        <button
          onClick={addLP}
          className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add LP
        </button>
      </div>

      {/* ── LP Cards ── */}
      <div
        className="space-y-3 animate-fade-in"
        style={{ animationDelay: '225ms', opacity: 0 }}
      >
        {filteredLPs.map((lp) => {
          const config = statusConfig[lp.status];
          const StatusIcon = config.icon;
          const isExpanded = expandedLP === lp.id;

          return (
            <div
              key={lp.id}
              className={`w-full text-left glow-card bg-surface border rounded-xl p-5 transition-all duration-300 hover:border-border-2 ${
                isExpanded ? config.border : 'border-border'
              }`}
            >
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                onClick={() => setExpandedLP(isExpanded ? null : lp.id)}
              >
                {/* Name & Status */}
                <div className="flex items-center gap-3 sm:w-56 shrink-0">
                  <StatusIcon className={`w-5 h-5 shrink-0 ${config.color}`} />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      <InlineText
                        value={lp.name}
                        onSave={(v) => updateLP(lp.id, 'name', v)}
                      />
                    </h3>
                    <InlineSelect
                      value={lp.status}
                      options={statusOptions}
                      onSave={(v) => updateLP(lp.id, 'status', v)}
                    />
                  </div>
                </div>

                {/* Health Score Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          lp.healthScore >= 70
                            ? 'bg-success'
                            : lp.healthScore >= 40
                              ? 'bg-warning'
                              : 'bg-danger'
                        }`}
                        style={{ width: `${lp.healthScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-text-primary w-12 text-right">
                      <InlineNumber
                        value={lp.healthScore}
                        onSave={(v) => updateLP(lp.id, 'healthScore', v)}
                        min={0}
                        max={100}
                      />
                    </span>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex items-center gap-4 sm:w-72 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-text-muted">AUM</p>
                    <p className="text-sm font-semibold text-text-primary">
                      <InlineText
                        value={lp.aumCommitted}
                        onSave={(v) => updateLP(lp.id, 'aumCommitted', v)}
                      />
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted">Last Contact</p>
                    <p className={`text-sm font-medium ${
                      lp.daysSinceContact > 30
                        ? 'text-danger'
                        : lp.daysSinceContact > 14
                          ? 'text-warning'
                          : 'text-text-secondary'
                    }`}>
                      <InlineText
                        value={lp.lastContact}
                        onSave={(v) => updateLP(lp.id, 'lastContact', v)}
                      />
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLP(lp.id);
                    }}
                    className="p-1.5 rounded-lg text-text-muted/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete LP"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-xs text-text-muted mb-1">Communication</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-text-muted" />
                      <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${lp.communicationFreq}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-primary">
                        <InlineNumber
                          value={lp.communicationFreq}
                          onSave={(v) => updateLP(lp.id, 'communicationFreq', v)}
                          suffix="%"
                          min={0}
                          max={100}
                        />
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-xs text-text-muted mb-1">Satisfaction</p>
                    <div className="flex items-center gap-2">
                      <Heart className="w-3 h-3 text-text-muted" />
                      <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${lp.satisfaction}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-primary">
                        <InlineNumber
                          value={lp.satisfaction}
                          onSave={(v) => updateLP(lp.id, 'satisfaction', v)}
                          suffix="%"
                          min={0}
                          max={100}
                        />
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-xs text-text-muted mb-1">AUM Trend</p>
                    <div className="flex items-center gap-2">
                      {lp.aumTrend === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
                      {lp.aumTrend === 'down' && <TrendingDown className="w-4 h-4 text-danger" />}
                      {lp.aumTrend === 'flat' && <ArrowRight className="w-4 h-4 text-text-muted" />}
                      <span
                        className={`text-sm font-semibold capitalize ${
                          lp.aumTrend === 'up'
                            ? 'text-success'
                            : lp.aumTrend === 'down'
                              ? 'text-danger'
                              : 'text-text-muted'
                        }`}
                      >
                        {lp.aumTrend}
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-xs text-text-muted mb-1">Next Action</p>
                    <p className="text-xs text-text-secondary">
                      <InlineText
                        value={lp.nextAction}
                        onSave={(v) => updateLP(lp.id, 'nextAction', v)}
                      />
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Pipeline Funnel ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '300ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-text-primary">LP Pipeline Funnel</h2>
        </div>
        <div className="space-y-3 max-w-2xl mx-auto">
          {pipelineStages.map((stage) => (
            <div key={stage.name} className="flex items-center gap-4">
              <span className="text-xs text-text-muted w-28 text-right shrink-0">
                {stage.name}
              </span>
              <div className="flex-1 flex justify-center">
                <div
                  className={`${stage.width} h-10 ${stage.color} rounded-lg flex items-center justify-center transition-all duration-500`}
                >
                  <span className="text-sm font-bold text-white">{stage.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-xs text-text-muted">Conversion rate (Intro to Invested):</span>
          <span className="text-sm font-bold text-teal-400">57%</span>
        </div>
      </div>

      {/* ── Proactive Alerts ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '375ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-semibold text-text-primary">Proactive Alerts</h2>
        </div>
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const alertConf = alertTypeConfig[alert.type];
            const AlertIcon = alertConf.icon;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${alertConf.bg} border ${alertConf.border} rounded-xl p-4`}
              >
                <AlertIcon className={`w-5 h-5 shrink-0 mt-0.5 ${alertConf.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <ArrowRight className="w-3 h-3 text-text-muted" />
                    <span className="text-xs text-text-secondary">{alert.action}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
