'use client';

import { aiLayers as defaultAiLayers, edgeAssessment, productTargets, strategicPaths2030, yieldEnvironment } from '@/lib/data';
import { exportToPdf } from '@/lib/exportPdf';
import {
  Cpu,
  Zap,
  Brain,
  TrendingUp,
  Shield,
  Activity,
  ArrowDown,
  Download,
  Layers,
  Gauge,
  AlertTriangle,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import { useEditableStore } from '@/lib/useEditableStore';
import { InlineText, InlineNumber, InlineSelect, EditBanner } from '@/components/InlineEdit';

const layerIcons = [Cpu, Zap, Brain, Shield, TrendingUp, Activity];

const priorityStyle = (priority: string) => {
  switch (priority) {
    case 'HIGH': return 'bg-teal-500/15 text-teal-400 border border-teal-500/30';
    case 'MEDIUM': return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    case 'ONGOING': return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
    default: return 'bg-gray-500/15 text-gray-400 border border-gray-500/30';
  }
};

const layerGradient = (index: number) => {
  const gradients = ['from-teal-500/10 to-teal-600/5', 'from-teal-500/8 to-blue-500/8', 'from-blue-500/10 to-blue-600/5', 'from-blue-500/8 to-purple-500/8', 'from-purple-500/10 to-purple-600/5', 'from-purple-500/8 to-purple-400/10'];
  return gradients[index] || gradients[0];
};

const layerBorderColor = (index: number) => {
  const colors = ['border-teal-500/30 hover:border-teal-400/50', 'border-teal-400/25 hover:border-teal-300/45', 'border-blue-500/30 hover:border-blue-400/50', 'border-blue-400/25 hover:border-blue-300/45', 'border-purple-500/30 hover:border-purple-400/50', 'border-purple-400/25 hover:border-purple-300/45'];
  return colors[index] || colors[0];
};

const layerNumberBg = (index: number) => {
  const bgs = ['bg-teal-500', 'bg-teal-400', 'bg-blue-500', 'bg-blue-400', 'bg-purple-500', 'bg-purple-400'];
  return bgs[index] || bgs[0];
};

const progressBarColor = (index: number) => {
  const colors = ['bg-teal-500', 'bg-teal-400', 'bg-blue-500', 'bg-blue-400', 'bg-purple-500', 'bg-purple-400'];
  return colors[index] || colors[0];
};

const statusOptions = [
  { label: 'HIGH', value: 'HIGH', color: 'bg-teal-500/15 text-teal-400 border border-teal-500/30' },
  { label: 'MEDIUM', value: 'MEDIUM', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
  { label: 'ONGOING', value: 'ONGOING', color: 'bg-purple-500/15 text-purple-400 border border-purple-500/30' },
  { label: 'LOW', value: 'LOW', color: 'bg-gray-500/15 text-gray-400 border border-gray-500/30' },
];

export function AIEdgeView({ currentUser }: { currentUser?: string }) {
  const currentRating = edgeAssessment.bridgeV3Rating;
  const andrewRating = edgeAssessment.andrewConsensusRating;
  const targetRating = 8.5;
  const progressPercent = (currentRating / targetRating) * 100;
  const andrewProgressPercent = (andrewRating / targetRating) * 100;
  const [expandedPath, setExpandedPath] = useState<number | null>(null);

  const { data: layers, setData: setLayers, hasEdits, resetAll } = useEditableStore(
    'amphibian-unite-ai-edge',
    defaultAiLayers
  );

  const updateLayer = (index: number, field: string, value: string | number) => {
    setLayers((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const addCapability = () => {
    setLayers((prev) => [
      ...prev,
      {
        layer: prev.length + 1,
        name: 'New Layer',
        edge: '+0 bps',
        priority: 'MEDIUM',
        description: 'Click to edit description...',
        status: 0,
      },
    ]);
  };

  return (
    <div id="aiedge-view-content" className="space-y-8 animate-fade-in">
      {/* ── Edit Banner ── */}
      <EditBanner hasEdits={hasEdits} onReset={resetAll} />

      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Layers className="w-7 h-7 text-teal-400" />
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="gradient-text">The AI Edge</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-3xl">
          6 layers of AI-native advantage. Total theoretical edge: +500-800 bps.
          Not AI as marketing — AI as the operating system.
        </p>
      </div>

      {/* ── Dual Edge Rating Banner ── */}
      <div className="glow-card bg-surface rounded-xl border border-border p-6 animate-fade-in" style={{ animationDelay: '75ms', opacity: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <Gauge className="w-8 h-8 text-teal-400" />
            <div>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">Edge Rating — Two Assessments</p>
              <div className="flex items-baseline gap-4 flex-wrap">
                <div>
                  <span className="text-2xl font-bold text-text-primary">{currentRating}</span>
                  <span className="text-text-muted text-sm">/10</span>
                  <span className="text-xs text-text-muted ml-1 block">Bridge V3</span>
                </div>
                <div className="text-text-muted">|</div>
                <div>
                  <span className="text-2xl font-bold text-amber-400">{andrewRating}</span>
                  <span className="text-text-muted text-sm">/10</span>
                  <span className="text-xs text-amber-400/70 ml-1 block">Andrew&apos;s 8-Agent</span>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted" />
                <div>
                  <span className="text-2xl font-bold gradient-text">{edgeAssessment.targetRating}</span>
                  <span className="text-text-muted text-sm">/10</span>
                  <span className="text-xs text-text-muted ml-1 block">Target (12mo)</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => exportToPdf('aiedge-view-content', 'amphibian-unite-ai-edge')} className="flex items-center gap-2 px-4 py-2 bg-teal-500/15 text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/25 transition-all duration-300 text-sm font-medium">
            <Download className="w-4 h-4" />
            Download AI Strategy PDF
          </button>
        </div>

        {/* Dual Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">Bridge V3 Assessment</span>
              <span className="text-xs text-teal-400 font-medium">{currentRating}/10</span>
            </div>
            <div className="relative w-full h-3 bg-surface-2 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full bg-teal-500 transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-amber-400/70">Andrew&apos;s 8-Agent Consensus</span>
              <span className="text-xs text-amber-400 font-medium">{andrewRating}/10</span>
            </div>
            <div className="relative w-full h-3 bg-surface-2 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full bg-amber-500 transition-all duration-1000 ease-out" style={{ width: `${andrewProgressPercent}%` }} />
            </div>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3 italic">
          Both assessments converge: edge is real but fragile without execution.
        </p>
      </div>

      {/* ── Edge Pillars (Andrew's Assessment) ── */}
      <div className="animate-fade-in" style={{ animationDelay: '150ms', opacity: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-semibold text-text-primary">Edge Pillars — Honest Assessment</h2>
          <span className="text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full font-medium">Andrew&apos;s 8-Agent Review</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {edgeAssessment.pillars.map((pillar) => (
            <div key={pillar.name} className="glow-card bg-surface rounded-xl border border-border p-5 hover:border-border-2 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">{pillar.name}</h3>
                <span className={`text-lg font-bold ${pillar.rating >= 6 ? 'text-emerald-400' : pillar.rating >= 4 ? 'text-amber-400' : 'text-red-400'}`}>
                  {pillar.rating}/{pillar.maxRating}
                </span>
              </div>
              <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${pillar.rating >= 6 ? 'bg-emerald-500' : pillar.rating >= 4 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${(pillar.rating / pillar.maxRating) * 100}%` }}
                />
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{pillar.reality}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Three Non-Negotiables ── */}
      <div className="animate-fade-in" style={{ animationDelay: '225ms', opacity: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-semibold text-text-primary">Three Non-Negotiables</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {edgeAssessment.threeNonNegotiables.map((nn, i) => (
            <div key={i} className="glow-card bg-surface rounded-xl border border-red-500/20 p-5 hover:border-red-500/40 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">#{i + 1}</span>
                <span className="text-xs text-text-muted">Owner: {nn.owner}</span>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">{nn.name}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{nn.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Product Targets (Honest Reality) ── */}
      <div className="animate-fade-in" style={{ animationDelay: '300ms', opacity: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-text-primary">Product Targets — Honest Reality</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {productTargets.map((pt) => (
            <div key={pt.product} className="glow-card bg-surface rounded-xl border border-border p-6 hover:border-border-2 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                {pt.product === 'BTC Alpha' ? <Shield className="w-5 h-5 text-teal-400" /> : <Activity className="w-5 h-5 text-purple-400" />}
                <h3 className="text-lg font-semibold text-text-primary">{pt.product}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-auto ${pt.status === 'live' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {pt.status === 'live' ? 'LIVE' : 'PRE-LAUNCH'}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted uppercase tracking-wider">Target Return</span>
                  <span className={`text-sm font-bold ${pt.product === 'BTC Alpha' ? 'text-teal-400' : 'text-purple-400'}`}>{pt.targetReturn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted uppercase tracking-wider">Max Drawdown</span>
                  <span className="text-sm font-medium text-text-secondary">{pt.maxDrawdown}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted uppercase tracking-wider">Source</span>
                  <span className="text-xs text-text-muted">{pt.source}</span>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Honest Reality</span>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{pt.honestReality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Yield Environment ── */}
      <div className="glow-card bg-surface rounded-xl border border-border p-6 animate-fade-in" style={{ animationDelay: '375ms', opacity: 0 }}>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Yield Environment — Structural Shift</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Compressed</h3>
            <ul className="space-y-2">
              {yieldEnvironment.compressed.map((item, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">-</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Not Compressed</h3>
            <ul className="space-y-2">
              {yieldEnvironment.notCompressed.map((item, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">+</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-4 italic border-t border-border pt-3">{yieldEnvironment.consensus}</p>
      </div>

      {/* ── 6-Layer AI Stack ── */}
      <div>
        <div className="flex items-center justify-between mb-5 animate-fade-in" style={{ animationDelay: '450ms', opacity: 0 }}>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-semibold text-text-primary">6-Layer AI Stack</h2>
          </div>
          <button
            onClick={addCapability}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-lg hover:bg-teal-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Layer
          </button>
        </div>
        <div className="relative">
          {layers.map((layer, index) => {
            const Icon = layerIcons[index] || Cpu;
            return (
              <div key={index} className="relative">
                {index < layers.length - 1 && (
                  <div className="absolute left-8 top-full z-10 flex flex-col items-center h-6">
                    <div className="w-0.5 h-4 bg-gradient-to-b from-teal-500/40 to-purple-500/40" />
                    <ArrowDown className="w-3.5 h-3.5 text-teal-400/60 -mt-0.5" />
                  </div>
                )}
                <div
                  className={`glow-card bg-gradient-to-r ${layerGradient(index)} bg-surface rounded-xl border ${layerBorderColor(index)} p-5 transition-all duration-300 animate-fade-in ${index < layers.length - 1 ? 'mb-6' : ''}`}
                  style={{ animationDelay: `${500 + index * 80}ms`, opacity: 0 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 ${layerNumberBg(index)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {layer.layer}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-text-secondary" />
                          <h3 className="text-lg font-semibold text-text-primary">
                            <InlineText
                              value={layer.name}
                              onSave={(v) => updateLayer(index, 'name', v)}
                            />
                          </h3>
                        </div>
                        <span className="text-green-400 font-mono text-sm font-medium bg-green-500/10 px-2 py-0.5 rounded">
                          <InlineText
                            value={layer.edge}
                            onSave={(v) => updateLayer(index, 'edge', v)}
                          />
                        </span>
                        <InlineSelect
                          value={layer.priority}
                          options={statusOptions}
                          onSave={(v) => updateLayer(index, 'priority', v)}
                        />
                      </div>
                      <p className="text-text-secondary text-sm mb-3">
                        <InlineText
                          value={layer.description}
                          onSave={(v) => updateLayer(index, 'description', v)}
                          multiline
                        />
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${progressBarColor(index)} transition-all duration-1000 ease-out`} style={{ width: `${layer.status}%` }} />
                        </div>
                        <span className="text-xs font-mono text-text-muted w-12 text-right">
                          <InlineNumber
                            value={layer.status}
                            onSave={(v) => updateLayer(index, 'status', v)}
                            suffix="%"
                            min={0}
                            max={100}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2030 Strategic Paths ── */}
      <div className="animate-fade-in" style={{ animationDelay: '1000ms', opacity: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-text-primary">2030 Vision — Three Strategic Paths</h2>
          <span className="text-xs text-text-muted">(pick at most two)</span>
        </div>
        <div className="space-y-3">
          {strategicPaths2030.map((path, i) => (
            <div
              key={i}
              className="glow-card bg-surface rounded-xl border border-border overflow-hidden hover:border-border-2 transition-all duration-300 cursor-pointer"
              onClick={() => setExpandedPath(expandedPath === i ? null : i)}
            >
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-full">Path {i + 1}</span>
                  <h3 className="text-sm font-semibold text-text-primary">{path.name}</h3>
                  <span className="text-xs text-text-muted font-mono">{path.timeline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{path.agentRating}</span>
                  {expandedPath === i ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </div>
              </div>
              {expandedPath === i && (
                <div className="px-5 pb-5 pt-0 border-t border-border/50 animate-fade-in">
                  <p className="text-sm text-text-secondary mb-3 mt-3">{path.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Upside</span>
                      <p className="text-xs text-text-secondary mt-1">{path.upside}</p>
                    </div>
                    <div>
                      <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Risk</span>
                      <p className="text-xs text-text-secondary mt-1">{path.risk}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Path to 7/10 ── */}
      <div className="glow-card bg-gradient-to-r from-teal-500/5 via-blue-500/5 to-purple-500/5 rounded-xl border border-border p-6 animate-fade-in" style={{ animationDelay: '1100ms', opacity: 0 }}>
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Path to 7/10 — Next 12 Months</h3>
        <div className="space-y-3">
          {edgeAssessment.pathTo7.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</div>
              <p className="text-sm text-text-secondary">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
