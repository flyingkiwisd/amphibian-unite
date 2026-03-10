'use client';

import { useState } from 'react';
import {
  Eye,
  Filter,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
  Rocket,
  Briefcase,
  Zap,
  BarChart3,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEditableStore } from '@/lib/useEditableStore';
import { InlineText, InlineSelect, EditBanner } from '@/components/InlineEdit';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Category = 'Product Launch' | 'AUM Change' | 'Hiring Signal' | 'Strategy Shift' | 'Market Move';
type Impact = 'Low' | 'Medium' | 'High';

interface Competitor {
  id: string;
  name: string;
  estimatedAUM: string;
  strategyFocus: string;
}

interface IntelInsight {
  id: string;
  firm: string;
  category: Category;
  title: string;
  summary: string;
  timestamp: string;
  impact: Impact;
  whatItMeans: string;
}

interface CompetitiveIntelData {
  competitors: Competitor[];
  insights: IntelInsight[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Data
// ─────────────────────────────────────────────────────────────────────────────
const defaultData: CompetitiveIntelData = {
  competitors: [
    { id: 'c-1', name: 'Galaxy Digital', estimatedAUM: '$5.2B', strategyFocus: 'Multi-strategy digital asset management' },
    { id: 'c-2', name: 'Polychain Capital', estimatedAUM: '$3.8B', strategyFocus: 'Early-stage crypto protocol investing' },
    { id: 'c-3', name: 'Pantera Capital', estimatedAUM: '$4.5B', strategyFocus: 'Blockchain fund-of-funds & venture' },
    { id: 'c-4', name: 'Arca', estimatedAUM: '$1.2B', strategyFocus: 'Digital asset yield & DeFi strategies' },
    { id: 'c-5', name: 'Bitwise', estimatedAUM: '$3.5B', strategyFocus: 'Crypto index & passive strategies' },
    { id: 'c-6', name: 'CoinFund', estimatedAUM: '$900M', strategyFocus: 'Crypto venture & liquid strategies' },
  ],
  insights: [
    {
      id: 'intel-1',
      firm: 'Pantera Capital',
      category: 'Product Launch',
      title: 'Pantera launches dedicated Bitcoin yield fund',
      summary: 'Pantera Capital announced a new $500M Bitcoin yield fund targeting institutional investors, competing directly in the BTC Alpha space. Fund structure mirrors our approach with basis trades and DeFi yield.',
      timestamp: 'Mar 7, 2026',
      impact: 'High',
      whatItMeans: 'Direct competition in our core BTC Alpha thesis. Their brand and AUM advantage means we need to differentiate on technology (regime classifier) and risk management. Validates market demand for BTC yield products.',
    },
    {
      id: 'intel-2',
      firm: 'Galaxy Digital',
      category: 'AUM Change',
      title: 'Galaxy reports $800M net inflows in Q1',
      summary: 'Galaxy Digital disclosed $800M in net new inflows across their fund platform in Q1 2026, with digital asset management AUM now exceeding $5.2B.',
      timestamp: 'Mar 5, 2026',
      impact: 'Medium',
      whatItMeans: 'Rising tide — institutional appetite for crypto allocation is growing. We should emphasize our differentiated FoF approach vs their direct management model. Their growth validates the market opportunity.',
    },
    {
      id: 'intel-3',
      firm: 'Arca',
      category: 'Hiring Signal',
      title: 'Arca hiring 4 quantitative researchers',
      summary: 'Arca posted openings for 4 senior quantitative researchers with experience in crypto market microstructure, regime detection, and AI/ML. Compensation packages north of $400K base.',
      timestamp: 'Mar 4, 2026',
      impact: 'High',
      whatItMeans: 'Arca is building exactly the AI edge we are targeting. Their talent budget is 4-5x ours per head. We need to accelerate our AI agent strategy (build with agents, not headcount) to compete asymmetrically.',
    },
    {
      id: 'intel-4',
      firm: 'Bitwise',
      category: 'Strategy Shift',
      title: 'Bitwise pivoting from passive to active strategies',
      summary: 'Bitwise CIO announced plans to launch actively managed crypto strategies alongside their index products, targeting the "smart beta" segment with factor-based approaches.',
      timestamp: 'Mar 2, 2026',
      impact: 'Medium',
      whatItMeans: 'Passive-to-active migration is a trend we predicted. Bitwise entering active management could pressure fees but also educates institutional allocators about active crypto strategies. Net positive for us.',
    },
    {
      id: 'intel-5',
      firm: 'Polychain Capital',
      category: 'Market Move',
      title: 'Polychain increases DeFi allocation to 40%',
      summary: 'Reports indicate Polychain has increased DeFi protocol allocation to approximately 40% of their liquid fund, up from 25% last quarter, reflecting confidence in DeFi yield generation.',
      timestamp: 'Feb 28, 2026',
      impact: 'Medium',
      whatItMeans: 'Smart money moving deeper into DeFi validates our SMA infrastructure investment. We should track which protocols they are allocating to — potential signal for our manager research pipeline.',
    },
    {
      id: 'intel-6',
      firm: 'CoinFund',
      category: 'Product Launch',
      title: 'CoinFund launches SMA platform for family offices',
      summary: 'CoinFund launched a separately managed account platform specifically targeting family offices with $5M+ minimums, offering customized crypto allocation strategies.',
      timestamp: 'Feb 25, 2026',
      impact: 'High',
      whatItMeans: 'CoinFund is building exactly the SMA infrastructure we are planning. Their family office focus overlaps with our target market. We need to differentiate on our manager selection edge and FoF structure. Speed to market matters.',
    },
    {
      id: 'intel-7',
      firm: 'Galaxy Digital',
      category: 'Hiring Signal',
      title: 'Galaxy hires former BlackRock head of digital assets',
      summary: 'Galaxy announced the hiring of a former BlackRock managing director to lead their institutional distribution team, signaling aggressive expansion into the traditional allocator market.',
      timestamp: 'Feb 22, 2026',
      impact: 'Low',
      whatItMeans: 'Galaxy is investing in TradFi credibility. Different league than us currently but sets the bar for what institutional allocators expect. We should note this hire for potential future partnership or competitive dynamics.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const categoryConfig: Record<Category, { color: string; bg: string; icon: typeof Rocket }> = {
  'Product Launch': { color: 'text-teal-400', bg: 'bg-teal-500/15', icon: Rocket },
  'AUM Change': { color: 'text-blue-400', bg: 'bg-blue-500/15', icon: BarChart3 },
  'Hiring Signal': { color: 'text-violet-400', bg: 'bg-violet-500/15', icon: Users },
  'Strategy Shift': { color: 'text-amber-400', bg: 'bg-amber-500/15', icon: Zap },
  'Market Move': { color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: TrendingUp },
};

const impactConfig: Record<Impact, { color: string; bg: string; border: string }> = {
  Low: { color: 'text-text-muted', bg: 'bg-surface-2', border: 'border-border' },
  Medium: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  High: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' },
};

const allCategories: Category[] = ['Product Launch', 'AUM Change', 'Hiring Signal', 'Strategy Shift', 'Market Move'];

const impactOptions = [
  { label: 'Low', value: 'Low', color: 'bg-surface-2 text-text-muted' },
  { label: 'Medium', value: 'Medium', color: 'bg-warning/10 text-warning' },
  { label: 'High', value: 'High', color: 'bg-danger/10 text-danger' },
];

const categoryOptions = allCategories.map((cat) => ({
  label: cat,
  value: cat,
  color: `${categoryConfig[cat].bg} ${categoryConfig[cat].color}`,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function CompetitiveIntelView({ currentUser }: { currentUser?: string }) {
  const { data, setData, hasEdits, resetAll } = useEditableStore<CompetitiveIntelData>(
    'amphibian-unite-competitive-intel',
    defaultData
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const filteredInsights =
    selectedCategory === 'all'
      ? data.insights
      : data.insights.filter((i) => i.category === selectedCategory);

  const highImpactCount = data.insights.filter((i) => i.impact === 'High').length;
  const weeklyCount = data.insights.filter((i) => {
    return i.timestamp.includes('Mar');
  }).length;

  // ── Update helpers ──
  const updateCompetitor = (id: string, field: keyof Competitor, val: string) => {
    setData((prev) => ({
      ...prev,
      competitors: prev.competitors.map((c) =>
        c.id === id ? { ...c, [field]: val } : c
      ),
    }));
  };

  const addCompetitor = () => {
    const newComp: Competitor = {
      id: `c-${Date.now()}`,
      name: 'New Competitor',
      estimatedAUM: '$0M',
      strategyFocus: 'Click to edit strategy focus',
    };
    setData((prev) => ({
      ...prev,
      competitors: [...prev.competitors, newComp],
    }));
  };

  const deleteCompetitor = (id: string) => {
    setData((prev) => ({
      ...prev,
      competitors: prev.competitors.filter((c) => c.id !== id),
    }));
  };

  const updateInsight = (id: string, field: keyof IntelInsight, val: string) => {
    setData((prev) => ({
      ...prev,
      insights: prev.insights.map((i) =>
        i.id === id ? { ...i, [field]: val } : i
      ),
    }));
  };

  const addSignal = () => {
    const newId = `intel-${Date.now()}`;
    const newInsight: IntelInsight = {
      id: newId,
      firm: 'New Firm',
      category: 'Market Move',
      title: 'New intelligence signal',
      summary: 'Click to add signal summary...',
      timestamp: 'Mar 9, 2026',
      impact: 'Medium',
      whatItMeans: 'Click to add analysis...',
    };
    setData((prev) => ({
      ...prev,
      insights: [newInsight, ...prev.insights],
    }));
    setExpandedInsight(newId);
  };

  const deleteSignal = (id: string) => {
    setData((prev) => ({
      ...prev,
      insights: prev.insights.filter((i) => i.id !== id),
    }));
    if (expandedInsight === id) setExpandedInsight(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Edit Banner ── */}
      <EditBanner hasEdits={hasEdits} onReset={resetAll} />

      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Eye className="w-7 h-7 text-teal-400" />
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="gradient-text">Competitive Intelligence</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-3xl">
          Weekly digest of competitor activity in the crypto fund-of-funds space.
          Track product launches, AUM shifts, hiring signals, and strategic moves.
        </p>
      </div>

      {/* ── Summary Bar ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in"
        style={{ animationDelay: '75ms', opacity: 0 }}
      >
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Total Signals</p>
          <p className="text-3xl font-bold text-text-primary">{data.insights.length}</p>
          <p className="text-xs text-text-muted mt-1">Last 30 days</p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">High Impact</p>
          <p className="text-3xl font-bold text-danger">{highImpactCount}</p>
          <p className="text-xs text-text-muted mt-1">Requires attention</p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">This Week</p>
          <p className="text-3xl font-bold text-teal-400">{weeklyCount}</p>
          <p className="text-xs text-text-muted mt-1">New signals in March</p>
        </div>
      </div>

      {/* ── Competitor Overview ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '150ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-text-primary">Tracked Competitors</h2>
          <button
            onClick={addCompetitor}
            className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Competitor
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.competitors.map((c) => (
            <div key={c.id} className="group/comp bg-surface-2 rounded-lg p-3 relative">
              <button
                onClick={() => deleteCompetitor(c.id)}
                className="absolute top-2 right-2 p-1 rounded text-text-muted/30 opacity-0 group-hover/comp:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Delete competitor"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <h3 className="text-sm font-semibold text-text-primary">
                <InlineText
                  value={c.name}
                  onSave={(v) => updateCompetitor(c.id, 'name', v)}
                />
              </h3>
              <p className="text-xs text-text-muted mt-1">
                <InlineText
                  value={c.strategyFocus}
                  onSave={(v) => updateCompetitor(c.id, 'strategyFocus', v)}
                />
              </p>
              <p className="text-xs text-teal-400 mt-2 font-mono">
                AUM:{' '}
                <InlineText
                  value={c.estimatedAUM}
                  onSave={(v) => updateCompetitor(c.id, 'estimatedAUM', v)}
                />
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category Filter ── */}
      <div
        className="flex items-center gap-2 flex-wrap animate-fade-in"
        style={{ animationDelay: '225ms', opacity: 0 }}
      >
        <Filter className="w-4 h-4 text-text-muted" />
        <span className="text-xs text-text-muted uppercase tracking-wider">Category:</span>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
            selectedCategory === 'all'
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
              : 'bg-surface-2 text-text-muted hover:text-text-secondary border border-transparent'
          }`}
        >
          All
        </button>
        {allCategories.map((cat) => {
          const conf = categoryConfig[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? `${conf.bg} ${conf.color} border border-current/30`
                  : 'bg-surface-2 text-text-muted hover:text-text-secondary border border-transparent'
              }`}
            >
              {cat}
            </button>
          );
        })}
        <button
          onClick={addSignal}
          className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Signal
        </button>
      </div>

      {/* ── Intel Feed ── */}
      <div
        className="space-y-3 animate-fade-in"
        style={{ animationDelay: '300ms', opacity: 0 }}
      >
        {filteredInsights.map((insight) => {
          const catConf = categoryConfig[insight.category];
          const impConf = impactConfig[insight.impact];
          const CatIcon = catConf.icon;
          const isExpanded = expandedInsight === insight.id;

          return (
            <div
              key={insight.id}
              className="group/signal w-full text-left glow-card bg-surface border border-border rounded-xl p-5 hover:border-border-2 transition-all duration-300"
            >
              <div
                className="flex flex-col sm:flex-row sm:items-start gap-4 cursor-pointer"
                onClick={() =>
                  setExpandedInsight(isExpanded ? null : insight.id)
                }
              >
                {/* Category Icon */}
                <div
                  className={`w-10 h-10 rounded-lg ${catConf.bg} flex items-center justify-center shrink-0`}
                >
                  <CatIcon className={`w-5 h-5 ${catConf.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        <InlineText
                          value={insight.title}
                          onSave={(v) => updateInsight(insight.id, 'title', v)}
                        />
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <InlineSelect
                          value={insight.category}
                          options={categoryOptions}
                          onSave={(v) => updateInsight(insight.id, 'category', v)}
                        />
                        <span className="text-xs text-text-muted">
                          <InlineText
                            value={insight.firm}
                            onSave={(v) => updateInsight(insight.id, 'firm', v)}
                          />
                        </span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {insight.timestamp}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <InlineSelect
                        value={insight.impact}
                        options={impactOptions}
                        onSave={(v) => updateInsight(insight.id, 'impact', v)}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSignal(insight.id);
                        }}
                        className="p-1 rounded text-text-muted/30 opacity-0 group-hover/signal:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Delete signal"
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

                  <p className="text-xs text-text-secondary mt-3 leading-relaxed">
                    <InlineText
                      value={insight.summary}
                      onSave={(v) => updateInsight(insight.id, 'summary', v)}
                      multiline
                    />
                  </p>

                  {/* Expanded: What This Means */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-teal-400" />
                        <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                          What This Means For Us
                        </h4>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        <InlineText
                          value={insight.whatItMeans}
                          onSave={(v) => updateInsight(insight.id, 'whatItMeans', v)}
                          multiline
                        />
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-text-muted">No signals found for this category.</p>
        </div>
      )}
    </div>
  );
}
