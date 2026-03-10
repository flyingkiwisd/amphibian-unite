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

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const kpiData = {
  aum: { value: 48, trend: 'up' as const, delta: '+$3M', sparkline: [42, 43, 44, 45, 46, 48] },
  burn: { value: 85, trend: 'flat' as const, delta: '-$2K', sparkline: [90, 88, 87, 86, 85, 85] },
  revenue: { value: 40, trend: 'up' as const, delta: '+$5K', sparkline: [30, 32, 34, 36, 38, 40] },
  runway: { value: 18, trend: 'up' as const, delta: '+2 mo', sparkline: [14, 15, 15, 16, 17, 18] },
};

const revenueVsPlan = [
  { month: 'Oct', actual: 28, plan: 30 },
  { month: 'Nov', actual: 30, plan: 32 },
  { month: 'Dec', actual: 33, plan: 34 },
  { month: 'Jan', actual: 35, plan: 36 },
  { month: 'Feb', actual: 38, plan: 38 },
  { month: 'Mar', actual: 40, plan: 40 },
];

const scenarios = [
  {
    name: 'Base Case',
    label: 'Most Likely',
    color: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    bgColor: 'bg-teal-500/10',
    badgeColor: 'bg-teal-500/20 text-teal-400',
    projectedAUM: '$65M',
    projectedRevenue: '$54K/mo',
    projectedRunway: '24+ months',
    aumGrowth: '+$2.8M/mo',
    description: 'Steady LP inflows, current burn maintained. Breaks even at $65M AUM by Q4 2026.',
  },
  {
    name: 'Upside',
    label: 'Best Case',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
    projectedAUM: '$95M',
    projectedRevenue: '$79K/mo',
    projectedRunway: '36+ months',
    aumGrowth: '+$5M/mo',
    description: 'Strong LP conversions, Dynamic Alpha launch accelerates growth. Profitable by Q3 2026.',
  },
  {
    name: 'Downside',
    label: 'Stress Test',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    bgColor: 'bg-rose-500/10',
    badgeColor: 'bg-rose-500/20 text-rose-400',
    projectedAUM: '$40M',
    projectedRevenue: '$33K/mo',
    projectedRunway: '10 months',
    aumGrowth: '-$1.3M/mo',
    description: 'LP redemptions in a bear market, no new inflows. Requires cost restructuring by Q3.',
  },
];

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
export function CashRunwayView() {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  const breakEvenAUM = 65;
  const currentAUM = kpiData.aum.value;
  const breakEvenProgress = Math.min((currentAUM / breakEvenAUM) * 100, 100);

  const maxBar = Math.max(
    ...revenueVsPlan.map((r) => Math.max(r.actual, r.plan))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-7 h-7 text-teal-400" />
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="gradient-text">Cash Runway & Burn</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-3xl">
          Financial health dashboard. Track AUM, burn rate, revenue, and scenario-model
          the path to break-even.
        </p>
      </div>

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
              <p className="text-2xl font-bold text-text-primary">${kpiData.aum.value}M</p>
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {kpiData.aum.delta} this quarter
              </p>
            </div>
            <Sparkline data={kpiData.aum.sparkline} color="#22c55e" />
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
              <p className="text-2xl font-bold text-text-primary">${kpiData.burn.value}K</p>
              <p className="text-xs text-teal-400 mt-1 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" />
                {kpiData.burn.delta} vs last month
              </p>
            </div>
            <Sparkline data={kpiData.burn.sparkline} color="#eab308" />
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
              <p className="text-2xl font-bold text-text-primary">${kpiData.revenue.value}K</p>
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {kpiData.revenue.delta} mgmt fees
              </p>
            </div>
            <Sparkline data={kpiData.revenue.sparkline} color="#14b8a6" />
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
              <p className="text-2xl font-bold text-text-primary">{kpiData.runway.value} months</p>
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {kpiData.runway.delta} vs last quarter
              </p>
            </div>
            <Sparkline data={kpiData.runway.sparkline} color="#3b82f6" />
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
            Break-even: <span className="text-teal-400 font-semibold">${breakEvenAUM}M</span>
          </span>
        </div>
        <div className="h-3 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-1000"
            style={{ width: `${breakEvenProgress}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-2">
          {Math.round(breakEvenProgress)}% of the way to break-even AUM ({`$${breakEvenAUM - currentAUM}M`} remaining)
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
          {revenueVsPlan.map((item) => {
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
                    <span className="text-xs font-mono text-text-primary w-8 text-right">
                      ${item.actual}K
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
                    <span className="text-xs font-mono text-text-muted w-8 text-right">
                      ${item.plan}K
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
          {scenarios.map((scenario, idx) => (
            <button
              key={scenario.name}
              onClick={() => setSelectedScenario(selectedScenario === idx ? null : idx)}
              className={`glow-card bg-surface border rounded-xl p-5 text-left transition-all duration-300 hover:border-border-2 ${
                selectedScenario === idx ? scenario.borderColor : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-sm font-semibold ${scenario.color}`}>
                    {scenario.name}
                  </h3>
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
                    {scenario.projectedAUM}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Monthly Revenue</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {scenario.projectedRevenue}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Cash Runway</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {scenario.projectedRunway}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">AUM Growth Rate</span>
                  <span
                    className={`text-sm font-semibold ${
                      scenario.name === 'Downside' ? 'text-rose-400' : 'text-success'
                    }`}
                  >
                    {scenario.aumGrowth}
                  </span>
                </div>
              </div>

              {selectedScenario === idx && (
                <div className={`mt-4 pt-4 border-t ${scenario.borderColor}`}>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {scenario.description}
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
        <h3 className="text-sm font-semibold text-text-primary mb-3">Key Assumptions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-text-secondary">
          <div className="bg-surface-2 rounded-lg p-3">
            <p className="text-text-muted mb-1">Management Fee</p>
            <p className="text-text-primary font-semibold">1% of AUM annually</p>
            <p className="text-text-muted mt-1">~$40K/mo at $48M AUM</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-3">
            <p className="text-text-muted mb-1">Performance Fee</p>
            <p className="text-text-primary font-semibold">20% over hurdle</p>
            <p className="text-text-muted mt-1">Not included in base projections</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-3">
            <p className="text-text-muted mb-1">Burn Composition</p>
            <p className="text-text-primary font-semibold">$85K/month</p>
            <p className="text-text-muted mt-1">Team: $60K | Infra: $15K | Other: $10K</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-3">
            <p className="text-text-muted mb-1">Break-Even</p>
            <p className="text-text-primary font-semibold">$65M AUM</p>
            <p className="text-text-muted mt-1">Revenue covers burn at this level</p>
          </div>
        </div>
      </div>
    </div>
  );
}
