'use client';

import { useState } from 'react';
import { okrs, kpis, memberIdToOwnerName } from '@/lib/data';
import type { OKR, KPI } from '@/lib/data';
import { useEditableStore } from '@/lib/useEditableStore';
import { InlineText, InlineNumber, InlineSelect, EditBanner } from '@/components/InlineEdit';
import { exportToPdf } from '@/lib/exportPdf';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Download,
  CheckCircle,
  Plus,
  Trash2,
  Filter,
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

const statusOptions = [
  { label: 'On Track', value: 'on-track', color: 'bg-success/20 text-success' },
  { label: 'At Risk', value: 'at-risk', color: 'bg-warning/20 text-warning' },
  { label: 'Behind', value: 'behind', color: 'bg-danger/20 text-danger' },
];

const trendOptions = [
  { label: 'Up', value: 'up', color: 'bg-success/20 text-success' },
  { label: 'Down', value: 'down', color: 'bg-danger/20 text-danger' },
  { label: 'Flat', value: 'flat', color: 'bg-text-muted/20 text-text-muted' },
];

const progressBarColor = (progress: number) => {
  if (progress > 66) return '#22c55e';
  if (progress >= 33) return '#eab308';
  return '#ef4444';
};

const handleDownloadPDF = () => {
  exportToPdf('okr-view-content', 'amphibian-unite-okrs-kpis');
};

function makeOkrId(): string {
  return `okr-${Date.now()}`;
}

function makeKpiId(): string {
  return `kpi-${Date.now()}`;
}

export function OKRView({ currentUser }: { currentUser?: string }) {
  const ownerName = currentUser ? memberIdToOwnerName[currentUser] ?? '' : '';
  const [showMyOkrs, setShowMyOkrs] = useState(false);

  const {
    data: okrData,
    setData: setOkrData,
    hasEdits: hasOkrEdits,
    resetAll: resetOkrs,
  } = useEditableStore<OKR[]>('amphibian-unite-okrs', okrs);

  const {
    data: kpiData,
    setData: setKpiData,
    hasEdits: hasKpiEdits,
    resetAll: resetKpis,
  } = useEditableStore<KPI[]>('amphibian-unite-kpis', kpis);

  const hasEdits = hasOkrEdits || hasKpiEdits;

  // Filter OKRs: when "My OKRs" is active, show only OKRs where the user owns at least one key result
  const displayedOkrs = showMyOkrs && ownerName
    ? okrData.filter((okr) => okr.keyResults.some((kr) => kr.owner === ownerName))
    : okrData;

  const resetAll = () => {
    resetOkrs();
    resetKpis();
  };

  // ── OKR helpers ──
  const updateOkr = (okrId: string, patch: Partial<OKR>) => {
    setOkrData((prev) =>
      prev.map((o) => (o.id === okrId ? { ...o, ...patch } : o))
    );
  };

  const updateKeyResult = (
    okrId: string,
    krIndex: number,
    patch: Partial<OKR['keyResults'][number]>
  ) => {
    setOkrData((prev) =>
      prev.map((o) => {
        if (o.id !== okrId) return o;
        const krs = o.keyResults.map((kr, i) =>
          i === krIndex ? { ...kr, ...patch } : kr
        );
        return { ...o, keyResults: krs };
      })
    );
  };

  const addKeyResult = (okrId: string) => {
    setOkrData((prev) =>
      prev.map((o) => {
        if (o.id !== okrId) return o;
        return {
          ...o,
          keyResults: [
            ...o.keyResults,
            { text: 'New key result', progress: 0, owner: 'TBD' },
          ],
        };
      })
    );
  };

  const deleteKeyResult = (okrId: string, krIndex: number) => {
    setOkrData((prev) =>
      prev.map((o) => {
        if (o.id !== okrId) return o;
        return {
          ...o,
          keyResults: o.keyResults.filter((_, i) => i !== krIndex),
        };
      })
    );
  };

  const addOkr = () => {
    setOkrData((prev) => [
      ...prev,
      {
        id: makeOkrId(),
        objective: 'New Objective',
        keyResults: [{ text: 'Key result 1', progress: 0, owner: 'TBD' }],
        quarter: 'Q2 2026',
        status: 'on-track' as const,
      },
    ]);
  };

  const deleteOkr = (okrId: string) => {
    setOkrData((prev) => prev.filter((o) => o.id !== okrId));
  };

  // ── KPI helpers ──
  const updateKpi = (kpiId: string, patch: Partial<KPI>) => {
    setKpiData((prev) =>
      prev.map((k) => (k.id === kpiId ? { ...k, ...patch } : k))
    );
  };

  const addKpi = () => {
    setKpiData((prev) => [
      ...prev,
      {
        id: makeKpiId(),
        name: 'New KPI',
        value: '0',
        target: 'TBD',
        trend: 'flat' as const,
        category: 'Custom',
      },
    ]);
  };

  const deleteKpi = (kpiId: string) => {
    setKpiData((prev) => prev.filter((k) => k.id !== kpiId));
  };

  return (
    <div id="okr-view-content" className="space-y-8">
      {/* ── Edit Banner ── */}
      <EditBanner hasEdits={hasEdits} onReset={resetAll} />

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
          <button
            onClick={addKpi}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-2 transition-colors bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            Add KPI
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => (
            <div
              key={kpi.id}
              className="group/kpi glow-card bg-surface rounded-xl border border-border p-5 hover:border-border-2 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${100 + index * 60}ms`, opacity: 0 }}
            >
              {/* Delete button */}
              <button
                onClick={() => deleteKpi(kpi.id)}
                className="absolute top-2 right-2 p-1 rounded text-text-muted/30 opacity-0 group-hover/kpi:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Delete KPI"
              >
                <Trash2 className="w-3 h-3" />
              </button>

              <div className="flex items-center justify-between mb-3">
                <InlineText
                  value={kpi.category}
                  onSave={(v) => updateKpi(kpi.id, { category: v })}
                  className="text-xs font-medium uppercase tracking-wider text-text-muted"
                />
                <InlineSelect
                  value={kpi.trend}
                  options={trendOptions}
                  onSave={(v) =>
                    updateKpi(kpi.id, { trend: v as 'up' | 'down' | 'flat' })
                  }
                />
              </div>
              <div className="mb-1">
                <InlineText
                  value={kpi.value}
                  onSave={(v) => updateKpi(kpi.id, { value: v })}
                  className="text-2xl font-bold text-text-primary"
                />
              </div>
              <p className="text-sm text-text-secondary">
                Target:{' '}
                <InlineText
                  value={kpi.target}
                  onSave={(v) => updateKpi(kpi.id, { target: v })}
                  className="text-text-muted"
                />
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

      {/* ── OKR Filter Bar ── */}
      {ownerName && (
        <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '150ms', opacity: 0 }}>
          <Filter className="w-4 h-4 text-text-muted mr-1" />
          <button
            onClick={() => setShowMyOkrs(false)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              !showMyOkrs
                ? 'bg-accent text-white shadow-lg shadow-accent/20'
                : 'bg-surface-3 text-text-muted hover:text-text-secondary hover:bg-surface-2'
            }`}
          >
            All
            <span
              className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold ${
                !showMyOkrs ? 'bg-white/20 text-white' : 'bg-surface text-text-muted'
              }`}
            >
              {okrData.length}
            </span>
          </button>
          <button
            onClick={() => setShowMyOkrs(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              showMyOkrs
                ? 'bg-accent text-white shadow-lg shadow-accent/20'
                : 'bg-surface-3 text-text-muted hover:text-text-secondary hover:bg-surface-2'
            }`}
          >
            My OKRs
            <span
              className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold ${
                showMyOkrs ? 'bg-white/20 text-white' : 'bg-surface text-text-muted'
              }`}
            >
              {okrData.filter((okr) => okr.keyResults.some((kr) => kr.owner === ownerName)).length}
            </span>
          </button>
        </div>
      )}

      {/* ── OKR Cards ── */}
      <div className="space-y-5">
        {displayedOkrs.map((okr, okrIndex) => (
          <div
            key={okr.id}
            className="group/okr glow-card bg-surface rounded-xl border border-border p-6 hover:border-border-2 transition-all duration-300 animate-fade-in"
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
                    <InlineText
                      value={okr.objective}
                      onSave={(v) => updateOkr(okr.id, { objective: v })}
                    />
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <InlineText
                  value={okr.quarter}
                  onSave={(v) => updateOkr(okr.id, { quarter: v })}
                  className="text-xs font-mono text-text-muted"
                />
                <InlineSelect
                  value={okr.status}
                  options={statusOptions}
                  onSave={(v) =>
                    updateOkr(okr.id, {
                      status: v as 'on-track' | 'at-risk' | 'behind',
                    })
                  }
                  className=""
                />
                {/* Delete OKR */}
                <button
                  onClick={() => deleteOkr(okr.id)}
                  className="p-1.5 rounded text-text-muted/30 opacity-0 group-hover/okr:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="Delete OKR"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Key Results */}
            <div className="space-y-4">
              {okr.keyResults.map((kr, krIndex) => (
                <div
                  key={krIndex}
                  className={`group/kr animate-fade-in ${
                    showMyOkrs && ownerName && kr.owner === ownerName
                      ? 'border-l-2 border-l-accent bg-accent/5 rounded-lg pl-3 py-1 -ml-1'
                      : ''
                  }`}
                  style={{
                    animationDelay: `${350 + okrIndex * 100 + krIndex * 75}ms`,
                    opacity: 0,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <span className="text-sm text-text-primary leading-snug flex-1">
                      <InlineText
                        value={kr.text}
                        onSave={(v) =>
                          updateKeyResult(okr.id, krIndex, { text: v })
                        }
                      />
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <InlineText
                        value={kr.owner}
                        onSave={(v) =>
                          updateKeyResult(okr.id, krIndex, { owner: v })
                        }
                        className="text-[11px] font-medium text-text-muted"
                      />
                      <InlineNumber
                        value={kr.progress}
                        onSave={(v) =>
                          updateKeyResult(okr.id, krIndex, { progress: v })
                        }
                        suffix="%"
                        min={0}
                        max={100}
                        className="text-xs font-mono text-text-secondary"
                      />
                      {/* Delete key result */}
                      <button
                        onClick={() => deleteKeyResult(okr.id, krIndex)}
                        className="p-0.5 rounded text-text-muted/30 opacity-0 group-hover/kr:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Delete key result"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
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

              {/* Add Key Result */}
              <button
                onClick={() => addKeyResult(okr.id)}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-teal-400 transition-colors mt-2"
              >
                <Plus className="w-3 h-3" />
                Add Key Result
              </button>
            </div>
          </div>
        ))}

        {/* Add OKR button */}
        <button
          onClick={addOkr}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border hover:border-accent/50 rounded-xl text-text-muted hover:text-accent transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Add New OKR</span>
        </button>
      </div>
    </div>
  );
}
