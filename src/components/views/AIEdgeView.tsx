'use client';

import { aiLayers } from '@/lib/data';
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
} from 'lucide-react';

const layerIcons = [Cpu, Zap, Brain, Shield, TrendingUp, Activity];

const priorityStyle = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-teal-500/15 text-teal-400 border border-teal-500/30';
    case 'MEDIUM':
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    case 'ONGOING':
      return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
    default:
      return 'bg-gray-500/15 text-gray-400 border border-gray-500/30';
  }
};

const layerGradient = (index: number) => {
  const gradients = [
    'from-teal-500/10 to-teal-600/5',
    'from-teal-500/8 to-blue-500/8',
    'from-blue-500/10 to-blue-600/5',
    'from-blue-500/8 to-purple-500/8',
    'from-purple-500/10 to-purple-600/5',
    'from-purple-500/8 to-purple-400/10',
  ];
  return gradients[index] || gradients[0];
};

const layerBorderColor = (index: number) => {
  const colors = [
    'border-teal-500/30 hover:border-teal-400/50',
    'border-teal-400/25 hover:border-teal-300/45',
    'border-blue-500/30 hover:border-blue-400/50',
    'border-blue-400/25 hover:border-blue-300/45',
    'border-purple-500/30 hover:border-purple-400/50',
    'border-purple-400/25 hover:border-purple-300/45',
  ];
  return colors[index] || colors[0];
};

const layerNumberBg = (index: number) => {
  const bgs = [
    'bg-teal-500',
    'bg-teal-400',
    'bg-blue-500',
    'bg-blue-400',
    'bg-purple-500',
    'bg-purple-400',
  ];
  return bgs[index] || bgs[0];
};

const progressBarColor = (index: number) => {
  const colors = [
    'bg-teal-500',
    'bg-teal-400',
    'bg-blue-500',
    'bg-blue-400',
    'bg-purple-500',
    'bg-purple-400',
  ];
  return colors[index] || colors[0];
};

export function AIEdgeView() {
  const currentRating = 5.1;
  const targetRating = 8.5;
  const progressPercent = (currentRating / targetRating) * 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '0ms', opacity: 0 }}
      >
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

      {/* ── Edge Rating Banner ── */}
      <div
        className="glow-card bg-surface rounded-xl border border-border p-6 animate-fade-in"
        style={{ animationDelay: '75ms', opacity: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Gauge className="w-8 h-8 text-teal-400" />
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-text-muted text-sm font-medium uppercase tracking-wider">
                  Current
                </span>
                <span className="text-3xl font-bold text-text-primary">
                  {currentRating}
                </span>
                <span className="text-text-muted text-lg">/10</span>
                <span className="text-text-muted mx-2">|</span>
                <span className="text-text-muted text-sm font-medium uppercase tracking-wider">
                  Target
                </span>
                <span className="text-3xl font-bold gradient-text">
                  {targetRating}
                </span>
                <span className="text-text-muted text-lg">/10</span>
              </div>
              <p className="text-text-secondary text-sm mt-1">
                From credible to unassailable
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-500/15 text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/25 transition-all duration-300 text-sm font-medium">
            <Download className="w-4 h-4" />
            Download AI Strategy PDF
          </button>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-4 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progressPercent}%`,
              background:
                'linear-gradient(90deg, #14b8a6, #3b82f6, #8b5cf6)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
          {/* Target marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/50"
            style={{ left: '100%' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-text-muted">
          <span>0</span>
          <span className="text-teal-400 font-medium">
            {currentRating} current
          </span>
          <span className="gradient-text font-medium">
            {targetRating} target
          </span>
          <span>10</span>
        </div>
      </div>

      {/* ── AI Layers Stack ── */}
      <div>
        <div
          className="flex items-center gap-2 mb-5 animate-fade-in"
          style={{ animationDelay: '150ms', opacity: 0 }}
        >
          <Cpu className="w-5 h-5 text-teal-400" />
          <h2 className="text-xl font-semibold text-text-primary">
            6-Layer AI Stack
          </h2>
        </div>

        <div className="relative">
          {aiLayers.map((layer, index) => {
            const Icon = layerIcons[index] || Cpu;
            return (
              <div key={layer.layer} className="relative">
                {/* Connector line + arrow between cards */}
                {index < aiLayers.length - 1 && (
                  <div className="absolute left-8 top-full z-10 flex flex-col items-center h-6">
                    <div className="w-0.5 h-4 bg-gradient-to-b from-teal-500/40 to-purple-500/40" />
                    <ArrowDown className="w-3.5 h-3.5 text-teal-400/60 -mt-0.5" />
                  </div>
                )}

                {/* Layer Card */}
                <div
                  className={`glow-card bg-gradient-to-r ${layerGradient(index)} bg-surface rounded-xl border ${layerBorderColor(index)} p-5 transition-all duration-300 animate-fade-in ${index < aiLayers.length - 1 ? 'mb-6' : ''}`}
                  style={{
                    animationDelay: `${200 + index * 100}ms`,
                    opacity: 0,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Layer Number Badge */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 ${layerNumberBg(index)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    >
                      {layer.layer}
                    </div>

                    {/* Layer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-text-secondary" />
                          <h3 className="text-lg font-semibold text-text-primary">
                            {layer.name}
                          </h3>
                        </div>
                        <span className="text-green-400 font-mono text-sm font-medium bg-green-500/10 px-2 py-0.5 rounded">
                          {layer.edge}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityStyle(layer.priority)}`}
                        >
                          {layer.priority}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm mb-3">
                        {layer.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progressBarColor(index)} transition-all duration-1000 ease-out`}
                            style={{ width: `${layer.status}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-text-muted w-8 text-right">
                          {layer.status}%
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

      {/* ── Product Impact Section ── */}
      <div>
        <div
          className="flex items-center gap-2 mb-5 animate-fade-in"
          style={{ animationDelay: '850ms', opacity: 0 }}
        >
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-text-primary">
            Product Impact
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* BTC Alpha Card */}
          <div
            className="glow-card bg-surface rounded-xl border border-border p-6 hover:border-teal-500/40 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: '900ms', opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-semibold text-text-primary">
                BTC Alpha
              </h3>
              <span className="text-text-muted text-sm ml-auto font-mono">
                Current: 2.4-6%
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                  AI-Maximized Target
                </span>
                <p className="text-xl font-bold text-teal-400 mt-1">
                  6-12% annualized
                  <span className="text-sm text-text-secondary font-normal ml-2">
                    (50-100 bps/mo)
                  </span>
                </p>
              </div>

              <div className="border-t border-border pt-3">
                <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                  How
                </span>
                <p className="text-text-secondary text-sm mt-1">
                  AI-optimized yield routing between basis trade, lending, DeFi,
                  and options
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Alpha Card */}
          <div
            className="glow-card bg-surface rounded-xl border border-border p-6 hover:border-purple-500/40 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: '975ms', opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-text-primary">
                Dynamic Alpha
              </h3>
              <span className="text-text-muted text-sm ml-auto font-mono">
                Target: 20-25%
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                  AI-Maximized Target
                </span>
                <p className="text-xl font-bold text-purple-400 mt-1">
                  25-35% annualized
                </p>
              </div>

              <div className="border-t border-border pt-3">
                <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                  How
                </span>
                <p className="text-text-secondary text-sm mt-1">
                  AI allocation layer across 6 strategy sleeves via SMA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why AI-Native Matters Quote ── */}
      <div
        className="glow-card bg-gradient-to-r from-teal-500/5 via-blue-500/5 to-purple-500/5 rounded-xl border border-border p-8 animate-fade-in"
        style={{ animationDelay: '1050ms', opacity: 0 }}
      >
        <div className="flex items-start gap-4">
          <Brain className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
              Why AI-Native Matters
            </h3>
            <blockquote className="text-lg text-text-primary leading-relaxed italic border-l-2 border-purple-500/50 pl-4">
              &ldquo;AI is 80% quality 80% of the time and significantly faster
              than manual processes. Our competitive advantage is using AI not as
              an add-on but as the core.&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
