'use client';

import { okrs, kpis } from '@/lib/data';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Download,
  CheckCircle,
} from 'lucide-react';

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-success" />;
    case 'down':
      return <TrendingDown className="w-4 h-4 text-danger" />;
    case 'flat':
      return <Minus className="w-4 h-4 text-text-muted" />;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'on-track':
      return 'bg-success/20 text-success border border-success/30';
    case 'at-risk':
      return 'bg-warning/20 text-warning border border-warning/30';
    case 'behind':
      return 'bg-danger/20 text-danger border border-danger/30';
    default:
      return 'bg-text-muted/20 text-text-muted border border-text-muted/30';
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'on-track':
      return 'On Track';
    case 'at-risk':
      return 'At Risk';
    case 'behind':
      return 'Behind';
    default:
      return status;
  }
};

const progressBarColor = (progress: number) => {
  if (progress > 66) return '#22c55e';
  if (progress >= 33) return '#eab308';
  return '#ef4444';
};

const handleDownloadPDF = () => {
  console.log('[OKRView] Download KPI dashboard as PDF requested');
  console.log('[OKRView] KPI data:', JSON.stringify(kpis, null, 2));
};

export function OKRView() {
  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">OKRs & KPIs</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg">
          Track objectives, measure outcomes, drive accountability
        </p>
      </div>

      {/* ── KPI Dashboard ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '75ms', opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-accent" />
            KPI Dashboard
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <div
              key={kpi.id}
              className="glow-card bg-surface rounded-xl border border-border p-5 hover:border-border-2 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${100 + index * 60}ms`, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {kpi.category}
                </span>
                <TrendIcon trend={kpi.trend} />
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">
                {kpi.value}
              </p>
              <p className="text-sm text-text-secondary">
                Target: <span className="text-text-muted">{kpi.target}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Download as PDF link */}
        <div className="flex justify-end mt-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download as PDF
          </button>
        </div>
      </div>

      {/* ── OKR Cards ── */}
      <div className="space-y-5">
        {okrs.map((okr, okrIndex) => (
          <div
            key={okr.id}
            className="glow-card bg-surface rounded-xl border border-border p-6 hover:border-border-2 transition-all duration-300 animate-fade-in"
            style={{
              animationDelay: `${300 + okrIndex * 100}ms`,
              opacity: 0,
            }}
          >
            {/* OKR Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-accent flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-text-primary leading-snug">
                    {okr.objective}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono text-text-muted bg-surface-3 px-2.5 py-1 rounded-md">
                  {okr.quarter}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColor(okr.status)}`}
                >
                  {statusLabel(okr.status)}
                </span>
              </div>
            </div>

            {/* Key Results */}
            <div className="space-y-4">
              {okr.keyResults.map((kr, krIndex) => (
                <div
                  key={krIndex}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${350 + okrIndex * 100 + krIndex * 75}ms`,
                    opacity: 0,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <span className="text-sm text-text-primary leading-snug flex-1">
                      {kr.text}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] font-medium text-text-muted bg-surface-3 px-2 py-0.5 rounded-md">
                        {kr.owner}
                      </span>
                      <span className="text-xs font-mono text-text-secondary w-10 text-right">
                        {kr.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${kr.progress}%`,
                        backgroundColor: progressBarColor(kr.progress),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
