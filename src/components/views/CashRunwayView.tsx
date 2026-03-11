'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Flame,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react';
import { useEditableStore } from '@/lib/useEditableStore';
import { InlineNumber, InlineText, EditBanner } from '@/components/InlineEdit';
import { memberIdToOwnerName } from '@/lib/data';

// ─────────────────────────────────────────────────────────────────────────────
// Data shape
// ─────────────────────────────────────────────────────────────────────────────
interface CashRunwayData {
  kpi: {
    aum: { value: number; delta: string; sparkline: number[] };
    burn: { value: number; delta: string; sparkline: number[] };
    revenue: { value: number; delta: string; sparkline: number[] };
    runway: { value: number; delta: string; sparkline: number[] };
  };
  breakEvenAUM: number;
  revenueVsPlan: { month: string; actual: number; plan: number }[];
  scenarios: {
    name: string;
    label: string;
    color: string;
    borderColor: string;
    bgColor: string;
    badgeColor: string;
    projectedAUM: string;
    projectedRevenue: string;
    projectedRunway: string;
    aumGrowth: string;
    description: string;
  }[];
  assumptions: {
    title: string;
    value: string;
    detail: string;
  }[];
}

const defaultData: CashRunwayData = {
  kpi: {
    aum: { value: 85, delta: '+$5M', sparkline: [72, 75, 78, 80, 83, 85] },
    burn: { value: 85, delta: '-$2K', sparkline: [90, 88, 87, 86, 85, 85] },
    revenue: { value: 71, delta: '+$8K', sparkline: [55, 58, 62, 65, 68, 71] },
    runway: { value: 18, delta: '+2 mo', sparkline: [14, 15, 15, 16, 17, 18] },
  },
  breakEvenAUM: 100,
  revenueVsPlan: [
    { month: 'Oct', actual: 55, plan: 58 },
    { month: 'Nov', actual: 58, plan: 60 },
    { month: 'Dec', actual: 62, plan: 63 },
    { month: 'Jan', actual: 65, plan: 66 },
    { month: 'Feb', actual: 68, plan: 68 },
    { month: 'Mar', actual: 71, plan: 71 },
  ],
  scenarios: [
    {
      name: 'Base Case',
      label: 'Most Likely',
      color: 'text-teal-400',
      borderColor: 'border-teal-500/30',
      bgColor: 'bg-teal-500/10',
      badgeColor: 'bg-teal-500/20 text-teal-400',
      projectedAUM: '$120M',
      projectedRevenue: '$83K/mo',
      projectedRunway: '24+ months',
      aumGrowth: '+$5.8M/mo',
      description: 'Steady LP inflows, current burn maintained. Breaks even at $100M AUM by Q4 2026.',
    },
    {
      name: 'Upside',
      label: 'Best Case',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
      projectedAUM: '$150M',
      projectedRevenue: '$125K/mo',
      projectedRunway: '36+ months',
      aumGrowth: '+$10.8M/mo',
      description: 'Strong LP conversions, Dynamic Alpha launch accelerates growth. Profitable by Q3 2026.',
    },
    {
      name: 'Downside',
      label: 'Stress Test',
      color: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      bgColor: 'bg-rose-500/10',
      badgeColor: 'bg-rose-500/20 text-rose-400',
      projectedAUM: '$60M',
      projectedRevenue: '$50K/mo',
      projectedRunway: '10 months',
      aumGrowth: '-$1.3M/mo',
      description: 'LP redemptions in a bear market, no new inflows. Requires cost restructuring by Q3.',
    },
  ],
  assumptions: [
    { title: 'Management Fee', value: '1% of AUM annually', detail: '~$71K/mo at $85M AUM' },
    { title: 'Performance Fee', value: '20% over hurdle', detail: 'Not included in base projections' },
    { title: 'Burn Composition', value: '$85K/month', detail: 'Team: $60K | Infra: $15K | Other: $10K' },
    { title: 'Break-Even', value: '$100M AUM', detail: 'Revenue covers burn at this level' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline component
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 32;
  const width = 80;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="ml-auto">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function CashRunwayView({ currentUser }: { currentUser?: string }) {
  const { data, setData, hasEdits, resetAll } = useEditableStore<CashRunwayData>(
    'amphibian-unite-cash-runway',
    defaultData
  );
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  const ownerName = currentUser ? memberIdToOwnerName[currentUser] ?? null : null;

  // ── Role-aware subtitle ──
  const headerSubtitle = currentUser === 'mark'
    ? 'Your financial command center \u2014 you own this.'
    : currentUser === 'james'
      ? "The financial health of the company you're building."
      : 'Financial visibility for the entire team.';

  // ── Role-aware focus priority ──
  const focusPriority = currentUser === 'mark'
    ? 'Your Priority: Keep burn below $90K/mo, hit break-even at $65M AUM'
    : currentUser === 'james'
      ? 'Your Priority: Grow AUM to $65M break-even, then $100M'
      : currentUser === 'todd'
        ? 'Your Priority: LP fundraising driving AUM growth'
        : currentUser === 'paola'
          ? 'Your Priority: Partnership revenue contribution'
          : 'Team Priority: Extend runway while growing AUM';

  const currentAUM = data.kpi.aum.value;
  const breakEvenProgress = Math.min((currentAUM / data.breakEvenAUM) * 100, 100);

  const maxBar = Math.max(
    ...data.revenueVsPlan.map((r) => Math.max(r.actual, r.plan))
  );

  // ── Helpers for nested updates ──
  const updateKpi = (
    key: 'aum' | 'burn' | 'revenue' | 'runway',
    field: 'value',
    val: number
  ) => {
    setData((prev) => ({
      ...prev,
      kpi: { ...prev.kpi, [key]: { ...prev.kpi[key], [field]: val } },
    }));
  };

  const updateRevPlan = (idx: number, field: 'actual' | 'plan', val: number) => {
    setData((prev) => ({
      ...prev,
      revenueVsPlan: prev.revenueVsPlan.map((r, i) =>
        i === idx ? { ...r, [field]: val } : r
      ),
    }));
  };

  const updateScenario = (idx: number, field: string, val: string) => {
    setData((prev) => ({
      ...prev,
      scenarios: prev.scenarios.map((s, i) =>
        i === idx ? { ...s, [field]: val } : s
      ),
    }));
  };

  const updateAssumption = (idx: number, field: 'value' | 'detail', val: string) => {
    setData((prev) => ({
      ...prev,
      assumptions: prev.assumptions.map((a, i) =>
        i === idx ? { ...a, [field]: val } : a
      ),
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Edit Banner ── */}
      <EditBanner hasEdits={hasEdits} onReset={resetAll} />

      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-7 h-7 text-teal-400" />
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="gradient-text">Cash Runway & Burn</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-3xl">
          {headerSubtitle}
        </p>
      </div>

      {/* ── Your Focus Card ── */}
      {ownerName && (
        <div
          className="border-l-2 border-accent bg-accent/5 rounded-r-xl px-4 py-3 animate-fade-in"
          style={{ animationDelay: '25ms', opacity: 0 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">You</span>
            <span className="text-sm text-text-primary font-medium">{focusPriority}</span>
          </div>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* AUM */}
        <div
          className="glow-card bg-surface border border-border rounded-xl p-5 hover:border-border-2 transition-all duration-300 animate-fade-in"
          style={{ animationDelay: '75ms', opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Current AUM
            </span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-text-primary">
                <InlineNumber
                  value={data.kpi.aum.value}
                  onSave={(v) => updateKpi('aum', 'value', v)}
                  prefix="$"
                  suffix="M"
                />
              </p>
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {data.kpi.aum.delta} this quarter
              </p>
            </div>
            <Sparkline data={data.kpi.aum.sparkline} color="#22c55e" />
          </div>
        </div>

        {/* Burn Rate */}
        <div
          className="glow-card bg-surface border border-border rounded-xl p-5 hover:border-border-2 transition-all duration-300 animate-fade-in"
          style={{ animationDelay: '150ms', opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Monthly Burn Rate
            </span>
            <Flame className="w-4 h-4 text-warning" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-text-primary">
                <InlineNumber
                  value={data.kpi.burn.value}
                  onSave={(v) => updateKpi('burn', 'value', v)}
                  prefix="$"
                  suffix="K"
                />
              </p>
              <p className="text-xs text-teal-400 mt-1 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" />
                {data.kpi.burn.delta} vs last month
              </p>
            </div>
            <Sparkline data={data.kpi.burn.sparkline} color="#eab308" />
          </div>
        </div>

        {/* Revenue */}
        <div
          className="glow-card bg-surface border border-border rounded-xl p-5 hover:border-border-2 transition-all duration-300 animate-fade-in"
          style={{ animationDelay: '225ms', opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Monthly Revenue
            </span>
            <BarChart3 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-text-primary">
                <InlineNumber
                  value={data.kpi.revenue.value}
                  onSave={(v) => updateKpi('revenue', 'value', v)}
                  prefix="$"
                  suffix="K"
                />
              </p>
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {data.kpi.revenue.delta} mgmt fees
              </p>
            </div>
            <Sparkline data={data.kpi.revenue.sparkline} color="#14b8a6" />
          </div>
        </div>

        {/* Runway */}
        <div
          className="glow-card bg-surface border border-border rounded-xl p-5 hover:border-border-2 transition-all duration-300 animate-fade-in"
          style={{ animationDelay: '300ms', opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Cash Runway
            </span>
            <Clock className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-text-primary">
                <InlineNumber
                  value={data.kpi.runway.value}
                  onSave={(v) => updateKpi('runway', 'value', v)}
                  suffix=" months"
                />
              </p>
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {data.kpi.runway.delta} vs last quarter
              </p>
            </div>
            <Sparkline data={data.kpi.runway.sparkline} color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* ── Break-Even Progress ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '375ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-text-primary">Break-Even Progress</h2>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-secondary">
            Current: <span className="text-text-primary font-semibold">${currentAUM}M</span>
          </span>
          <span className="text-text-secondary">
            Break-even:{' '}
            <span className="text-teal-400 font-semibold">
              <InlineNumber
                value={data.breakEvenAUM}
                onSave={(v) => setData((prev) => ({ ...prev, breakEvenAUM: v }))}
                prefix="$"
                suffix="M"
              />
            </span>
          </span>
        </div>
        <div className="h-3 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-1000"
            style={{ width: `${breakEvenProgress}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-2">
          {Math.round(breakEvenProgress)}% of the way to break-even AUM ({`$${data.breakEvenAUM - currentAUM}M`} remaining)
        </p>
      </div>

      {/* ── Revenue vs Plan ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '450ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-text-primary">Revenue vs Plan</h2>
          <span className="text-xs text-text-muted ml-auto">Last 6 months (in $K)</span>
        </div>
        <div className="space-y-3">
          {data.revenueVsPlan.map((item, idx) => {
            const actualPercent = (item.actual / maxBar) * 100;
            const planPercent = (item.plan / maxBar) * 100;
            const isAbovePlan = item.actual >= item.plan;
            const isNearPlan = Math.abs(item.actual - item.plan) <= 2;

            return (
              <div key={item.month} className="flex items-center gap-4">
                <span className="text-xs text-text-muted w-8 shrink-0 font-mono">
                  {item.month}
                </span>
                <div className="flex-1 space-y-1">
                  {/* Actual */}
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-surface-3 rounded-sm flex-1 overflow-hidden">
                      <div
                        className={`h-full rounded-sm transition-all duration-700 ${
                          isAbovePlan
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                            : isNearPlan
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                              : 'bg-gradient-to-r from-rose-500 to-red-500'
                        }`}
                        style={{ width: `${actualPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-text-primary w-16 text-right">
                      <InlineNumber
                        value={item.actual}
                        onSave={(v) => updateRevPlan(idx, 'actual', v)}
                        prefix="$"
                        suffix="K"
                      />
                    </span>
                  </div>
                  {/* Plan */}
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-surface-3 rounded-sm flex-1 overflow-hidden">
                      <div
                        className="h-full rounded-sm bg-white/10"
                        style={{ width: `${planPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-text-muted w-16 text-right">
                      <InlineNumber
                        value={item.plan}
                        onSave={(v) => updateRevPlan(idx, 'plan', v)}
                        prefix="$"
                        suffix="K"
                      />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-teal-500" />
            <span className="text-xs text-text-muted">Actual Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 rounded-sm bg-white/10" />
            <span className="text-xs text-text-muted">Plan</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-text-muted">
              Color: <span className="text-emerald-400">above</span> /{' '}
              <span className="text-amber-400">near</span> /{' '}
              <span className="text-rose-400">below</span> plan
            </span>
          </div>
        </div>
      </div>

      {/* ── Scenario Modeling ── */}
      <div className="animate-fade-in" style={{ animationDelay: '525ms', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-text-primary">Scenario Modeling</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.scenarios.map((scenario, idx) => (
            <button
              key={scenario.name}
              onClick={() => setSelectedScenario(selectedScenario === idx ? null : idx)}
              className={`glow-card bg-surface border rounded-xl p-5 text-left transition-all duration-300 hover:border-border-2 ${
                selectedScenario === idx ? scenario.borderColor : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${scenario.color}`}>
                      <InlineText
                        value={scenario.name}
                        onSave={(v) => updateScenario(idx, 'name', v)}
                      />
                    </h3>
                    {idx === 0 && currentUser === 'mark' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">CFO Pick</span>
                    )}
                    {idx === 1 && currentUser === 'james' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">CEO Target</span>
                    )}
                  </div>
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${scenario.badgeColor}`}
                  >
                    {scenario.label}
                  </span>
                </div>
                {idx === 0 && <TrendingUp className="w-5 h-5 text-teal-400" />}
                {idx === 1 && <ArrowUpRight className="w-5 h-5 text-emerald-400" />}
                {idx === 2 && <TrendingDown className="w-5 h-5 text-rose-400" />}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Projected AUM (12mo)</span>
                  <span className="text-sm font-semibold text-text-primary">
                    <InlineText
                      value={scenario.projectedAUM}
                      onSave={(v) => updateScenario(idx, 'projectedAUM', v)}
                    />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Monthly Revenue</span>
                  <span className="text-sm font-semibold text-text-primary">
                    <InlineText
                      value={scenario.projectedRevenue}
                      onSave={(v) => updateScenario(idx, 'projectedRevenue', v)}
                    />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Cash Runway</span>
                  <span className="text-sm font-semibold text-text-primary">
                    <InlineText
                      value={scenario.projectedRunway}
                      onSave={(v) => updateScenario(idx, 'projectedRunway', v)}
                    />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">AUM Growth Rate</span>
                  <span
                    className={`text-sm font-semibold ${
                      scenario.name === 'Downside' ? 'text-rose-400' : 'text-success'
                    }`}
                  >
                    <InlineText
                      value={scenario.aumGrowth}
                      onSave={(v) => updateScenario(idx, 'aumGrowth', v)}
                    />
                  </span>
                </div>
              </div>

              {selectedScenario === idx && (
                <div className={`mt-4 pt-4 border-t ${scenario.borderColor}`}>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    <InlineText
                      value={scenario.description}
                      onSave={(v) => updateScenario(idx, 'description', v)}
                      multiline
                    />
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Key Assumptions ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '600ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Key Assumptions</h3>
          {currentUser === 'mark' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">You own these</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-text-secondary">
          {data.assumptions.map((assumption, idx) => (
            <div key={idx} className={`rounded-lg p-3 ${
              currentUser === 'mark'
                ? 'ring-2 ring-accent/40 shadow-[0_0_15px_rgba(20,184,166,0.15)] bg-accent/5 border border-accent/30'
                : 'bg-surface-2'
            }`}>
              <p className="text-text-muted mb-1">{assumption.title}</p>
              <p className="text-text-primary font-semibold">
                <InlineText
                  value={assumption.value}
                  onSave={(v) => updateAssumption(idx, 'value', v)}
                />
              </p>
              <p className="text-text-muted mt-1">
                <InlineText
                  value={assumption.detail}
                  onSave={(v) => updateAssumption(idx, 'detail', v)}
                />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
