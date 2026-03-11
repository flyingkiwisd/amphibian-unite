'use client';

import { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Filter,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Sparkles,
  Edit3,
  Trash2,
} from 'lucide-react';
import { memberIdToOwnerName, getMemberById } from '@/lib/data';
import { AIChatPanel } from '@/components/AIChatPanel';

// ── Types ──────────────────────────────────────────────────

interface Decision {
  id: string;
  title: string;
  description: string;
  decidedBy: string;
  rationale: string;
  affected: string[];
  date: string;
  category: 'strategy' | 'portfolio' | 'hiring' | 'governance' | 'operations' | 'product';
  status: 'final' | 'pending-review' | 'reversed';
}

type CategoryFilter = 'all' | Decision['category'];

// ── Team members ────────────────────────────────────────────

const teamMembers = ['James', 'Ty', 'Andrew', 'Ross', 'Timon', 'Sahir'];

// ── Category config ─────────────────────────────────────────

const categoryConfig: Record<Decision['category'], { color: string; label: string }> = {
  strategy: {
    color: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    label: 'Strategy',
  },
  portfolio: {
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    label: 'Portfolio',
  },
  hiring: {
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    label: 'Hiring',
  },
  governance: {
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    label: 'Governance',
  },
  operations: {
    color: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    label: 'Operations',
  },
  product: {
    color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    label: 'Product',
  },
};

const statusConfig: Record<Decision['status'], { color: string; label: string; icon: typeof CheckCircle }> = {
  final: {
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    label: 'Final',
    icon: CheckCircle,
  },
  'pending-review': {
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    label: 'Pending Review',
    icon: AlertCircle,
  },
  reversed: {
    color: 'bg-red-500/15 text-red-400 border-red-500/30',
    label: 'Reversed',
    icon: XCircle,
  },
};

const ownerColors: Record<string, string> = {
  James: 'bg-accent/15 text-accent border-accent/30',
  Ty: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Andrew: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Ross: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Timon: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Sahir: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
};

// ── Pre-populated decisions ─────────────────────────────────

const initialDecisions: Decision[] = [
  {
    id: 'dec-001',
    title: 'Narrow to two products: BTC Alpha + Dynamic Alpha',
    description:
      'After extensive review of our product lineup, the decision was made to consolidate from multiple offerings down to two core products. BTC Alpha targets pure BTC yield generation while Dynamic Alpha provides multi-strategy exposure via SMA infrastructure. This simplifies operations, sharpens our narrative for LPs, and focuses engineering and research resources.',
    decidedBy: 'James',
    rationale:
      'Spreading across too many products diluted our edge and confused LP messaging. Two focused products let us go deep, build real track records, and scale operations without the overhead of maintaining multiple fund structures. The Bridge V3 analysis confirmed that our strongest conviction and differentiation sits in BTC yield and multi-strategy digital asset allocation.',
    affected: ['James', 'Ty', 'Andrew', 'Ross', 'Timon', 'Sahir'],
    date: '2025-02-28',
    category: 'strategy',
    status: 'final',
  },
  {
    id: 'dec-002',
    title: 'BTC Alpha 20 bps/month kill criteria established',
    description:
      'Formal kill criteria defined for BTC Alpha: if the product cannot demonstrate a credible path to 20 bps/month net yield on BTC within the evaluation window, the product will be wound down or fundamentally restructured. Strategy-level kill criteria also apply to individual yield sources within the portfolio.',
    decidedBy: 'Ty',
    rationale:
      'Without clear kill criteria, underperforming products linger and consume resources. The 20 bps/month threshold was determined based on LP expectations, competitive landscape, and our internal cost structure. Having this in writing protects the team from sunk-cost bias and ensures rigorous portfolio management.',
    affected: ['Ty', 'Andrew', 'Ross'],
    date: '2025-03-05',
    category: 'portfolio',
    status: 'final',
  },
  {
    id: 'dec-003',
    title: 'COO job description approved, search activated',
    description:
      'The COO role has been formally scoped and the job description approved. The search is now active through direct outreach and select recruiters. The COO will own day-to-day operations, compliance coordination, fund administration oversight, and team process management.',
    decidedBy: 'James',
    rationale:
      'The founding team is stretched across too many operational functions, reducing time spent on investment and product decisions. A dedicated COO frees the principals to focus on alpha generation, LP relationships, and strategic direction. The R&R doc identified clear operational gaps that a COO would fill.',
    affected: ['James', 'Andrew', 'Timon'],
    date: '2025-03-01',
    category: 'hiring',
    status: 'final',
  },
  {
    id: 'dec-004',
    title: 'SMA infrastructure prioritized for Q2-Q3',
    description:
      'SMA (Separately Managed Account) infrastructure has been designated as the top operational priority for Q2-Q3. This includes custodial partner selection, prime brokerage evaluation, legal framework buildout, and technology integration for multi-manager sleeve execution.',
    decidedBy: 'Andrew',
    rationale:
      'Dynamic Alpha requires SMA infrastructure to execute its multi-sleeve architecture. Without this in place, we cannot onboard sub-managers or offer the product to LPs. Prioritizing this now ensures we are operationally ready by the time investment strategies are finalized and LP commitments are secured.',
    affected: ['Andrew', 'Ross', 'Timon'],
    date: '2025-03-10',
    category: 'operations',
    status: 'final',
  },
  {
    id: 'dec-005',
    title: 'A9 audit scope and timeline confirmed',
    description:
      'The scope and timeline for the A9 manager audit have been defined. The audit will cover track record verification, risk management processes, operational due diligence, and alignment with our Dynamic Alpha sleeve requirements. Target completion within 6 weeks of engagement.',
    decidedBy: 'Ross',
    rationale:
      'A9 is a leading candidate for one of the Dynamic Alpha sleeves. A thorough audit is necessary before any capital allocation. Defining scope upfront ensures the audit is comprehensive but time-bound, preventing it from becoming an open-ended process that delays the product launch.',
    affected: ['Ross', 'Ty', 'Andrew'],
    date: '2025-03-12',
    category: 'portfolio',
    status: 'pending-review',
  },
  {
    id: 'dec-006',
    title: 'Dynamic Alpha sleeve architecture: 6 strategy sleeves via SMA',
    description:
      'Dynamic Alpha will be structured as 6 distinct strategy sleeves, each managed through the SMA infrastructure. Sleeves cover: quantitative trend, market-neutral, relative value, event-driven, DeFi yield, and discretionary macro. Each sleeve has independent risk budgets and can be individually scaled.',
    decidedBy: 'James',
    rationale:
      'A 6-sleeve architecture provides sufficient diversification while remaining manageable. Each sleeve targets a distinct return driver, reducing correlation risk. The SMA structure preserves transparency for LPs and allows us to swap managers without disrupting the overall fund. This architecture was validated against our regime analysis framework.',
    affected: ['James', 'Ty', 'Ross', 'Andrew'],
    date: '2025-03-08',
    category: 'product',
    status: 'final',
  },
  {
    id: 'dec-007',
    title: 'USD Alpha transition to Dynamic Alpha over 2-3 quarters',
    description:
      'The existing USD Alpha product will be transitioned into the Dynamic Alpha structure over a 2-3 quarter period. Current LP communications will begin immediately. Existing positions will be migrated sleeve-by-sleeve as the SMA infrastructure comes online.',
    decidedBy: 'Ty',
    rationale:
      'Maintaining USD Alpha as a separate product alongside Dynamic Alpha creates operational redundancy and LP confusion. A structured transition preserves LP relationships while consolidating into the stronger, more scalable product. The 2-3 quarter timeline allows for orderly position migration and LP consent processes.',
    affected: ['Ty', 'James', 'Ross', 'Sahir'],
    date: '2025-03-06',
    category: 'strategy',
    status: 'final',
  },
  {
    id: 'dec-008',
    title: 'Priority lock rule: weekly Top 3 with owners and definition of done',
    description:
      'A governance rule has been established requiring each team member to declare their Top 3 priorities weekly with clear ownership and definition of done. Priorities are locked at the start of each week and reviewed at the end. Changes mid-week require explicit approval from the team lead.',
    decidedBy: 'James',
    rationale:
      'Without explicit priority-locking, the team was context-switching too frequently and losing momentum on critical deliverables. The weekly Top 3 format creates accountability, makes workload visible, and ensures alignment between individual effort and company objectives. The R&R doc mandates this as a core governance process.',
    affected: ['James', 'Ty', 'Andrew', 'Ross', 'Timon', 'Sahir'],
    date: '2025-03-03',
    category: 'governance',
    status: 'final',
  },
];

const DECISIONS_LS_KEY = 'amphibian-decisions';

// ── Empty form state ────────────────────────────────────────

const emptyForm = {
  title: '',
  description: '',
  category: 'strategy' as Decision['category'],
  decidedBy: 'James',
  rationale: '',
  affected: [] as string[],
};

// ── Component ───────────────────────────────────────────────

export function DecisionLogView({ currentUser }: { currentUser?: string }) {
  const ownerName = currentUser ? memberIdToOwnerName[currentUser] : undefined;

  const [decisions, setDecisions] = useState<Decision[]>(() => {
    if (typeof window === 'undefined') return initialDecisions;
    try {
      const stored = localStorage.getItem(DECISIONS_LS_KEY);
      if (stored) return JSON.parse(stored) as Decision[];
    } catch { /* ignore */ }
    return initialDecisions;
  });

  // Persist decisions to localStorage on every change
  useEffect(() => {
    localStorage.setItem(DECISIONS_LS_KEY, JSON.stringify(decisions));
  }, [decisions]);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ...emptyForm,
    decidedBy: ownerName || emptyForm.decidedBy,
  });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingDecisionId, setEditingDecisionId] = useState<string | null>(null);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);

  // ── Counts ──
  const counts = {
    total: decisions.length,
    final: decisions.filter((d) => d.status === 'final').length,
    pendingReview: decisions.filter((d) => d.status === 'pending-review').length,
    reversed: decisions.filter((d) => d.status === 'reversed').length,
  };

  // ── User involvement helpers ──
  const isUserInvolved = (d: Decision) =>
    ownerName ? d.decidedBy === ownerName || d.affected.includes(ownerName) : false;
  const isUserDecider = (d: Decision) => (ownerName ? d.decidedBy === ownerName : false);
  const isUserAffected = (d: Decision) =>
    ownerName ? d.affected.includes(ownerName) && d.decidedBy !== ownerName : false;

  const myDecisionsCount = ownerName ? decisions.filter(isUserInvolved).length : 0;
  const myDecidedCount = ownerName ? decisions.filter(isUserDecider).length : 0;
  const myAffectedCount = ownerName
    ? decisions.filter((d) => d.affected.includes(ownerName) && d.decidedBy !== ownerName).length
    : 0;

  // ── Filtered and sorted (newest first) ──
  const filteredDecisions = (
    categoryFilter === 'all'
      ? decisions
      : decisions.filter((d) => d.category === categoryFilter)
  )
    .filter((d) => (showMineOnly && ownerName ? isUserInvolved(d) : true))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ── Toggle expand ──
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ── Toggle affected checkbox ──
  const toggleAffected = (name: string) => {
    setForm((prev) => ({
      ...prev,
      affected: prev.affected.includes(name)
        ? prev.affected.filter((n) => n !== name)
        : [...prev.affected, name],
    }));
  };

  // ── Submit new decision or update existing ──
  const handleSubmit = () => {
    if (!form.title.trim() || !form.rationale.trim()) return;

    if (editingDecisionId) {
      // Update existing decision
      setDecisions((prev) =>
        prev.map((d) =>
          d.id === editingDecisionId
            ? {
                ...d,
                title: form.title.trim(),
                description: form.description.trim(),
                decidedBy: form.decidedBy,
                rationale: form.rationale.trim(),
                affected: form.affected.length > 0 ? form.affected : [form.decidedBy],
                category: form.category,
              }
            : d
        )
      );
      setEditingDecisionId(null);
    } else {
      // Create new decision
      const newDecision: Decision = {
        id: `dec-${String(decisions.length + 1).padStart(3, '0')}`,
        title: form.title.trim(),
        description: form.description.trim(),
        decidedBy: form.decidedBy,
        rationale: form.rationale.trim(),
        affected: form.affected.length > 0 ? form.affected : [form.decidedBy],
        date: new Date().toISOString().split('T')[0],
        category: form.category,
        status: 'pending-review',
      };
      setDecisions((prev) => [newDecision, ...prev]);
    }

    setForm({ ...emptyForm, decidedBy: ownerName || emptyForm.decidedBy });
    setShowForm(false);
  };

  // ── Edit existing decision ──
  const startEditDecision = (decision: Decision) => {
    setEditingDecisionId(decision.id);
    setForm({
      title: decision.title,
      description: decision.description,
      category: decision.category,
      decidedBy: decision.decidedBy,
      rationale: decision.rationale,
      affected: [...decision.affected],
    });
    setShowForm(true);
  };

  // ── Delete decision ──
  const deleteDecision = (id: string) => {
    setDecisions((prev) => prev.filter((d) => d.id !== id));
    if (editingDecisionId === id) {
      setEditingDecisionId(null);
      setShowForm(false);
    }
  };

  // ── Cycle decision status ──
  const cycleDecisionStatus = (id: string) => {
    const statusCycle: Decision['status'][] = ['pending-review', 'final', 'reversed'];
    setDecisions((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const idx = statusCycle.indexOf(d.status);
        return { ...d, status: statusCycle[(idx + 1) % statusCycle.length] };
      })
    );
  };

  // ── Filter buttons ──
  const filterButtons: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'strategy', label: 'Strategy' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'hiring', label: 'Hiring' },
    { key: 'governance', label: 'Governance' },
    { key: 'operations', label: 'Operations' },
    { key: 'product', label: 'Product' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Decision Log</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">
          Every governance decision in writing within 48 hours. Full rationale, affected parties, and audit trail.
        </p>
      </div>

      {/* ── Stats Bar ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in"
        style={{ animationDelay: '75ms', opacity: 0 }}
      >
        {[
          { label: 'Total Decisions', value: counts.total, color: 'text-text-primary', bg: 'bg-surface-3/50' },
          { label: 'Final', value: counts.final, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pending Review', value: counts.pendingReview, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Reversed', value: counts.reversed, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="glow-card bg-surface rounded-xl border border-border p-5 hover:border-border-2 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${100 + index * 60}ms`, opacity: 0 }}
          >
            <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Personal Stats Card ── */}
      {ownerName && (
        <div
          className="glow-card bg-surface rounded-xl border border-accent/30 p-5 animate-fade-in ring-2 ring-accent/40 shadow-[0_0_15px_rgba(20,184,166,0.15)]"
          style={{ animationDelay: '120ms', opacity: 0 }}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">Your Decisions</h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">
              {ownerName}
            </span>
          </div>
          <div className="flex items-center gap-6 mt-3">
            <div>
              <p className="text-2xl font-bold text-accent">{myDecidedCount}</p>
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Decided</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-2xl font-bold text-teal-400">{myAffectedCount}</p>
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Affected</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Controls Bar ── */}
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface border border-border rounded-xl p-4 animate-fade-in"
        style={{ animationDelay: '150ms', opacity: 0 }}
      >
        {/* Left: Filter buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-text-muted mr-1 flex-shrink-0" />
          {filterButtons.map((fb) => (
            <button
              key={fb.key}
              onClick={() => setCategoryFilter(fb.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                categoryFilter === fb.key
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'bg-surface-3 text-text-muted hover:text-text-secondary hover:bg-surface-2'
              }`}
            >
              {fb.label}
            </button>
          ))}
          {/* My Decisions filter */}
          {ownerName && (
            <button
              onClick={() => setShowMineOnly(!showMineOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 inline-flex items-center gap-1.5 ${
                showMineOnly
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'bg-surface-3 text-text-muted hover:text-text-secondary hover:bg-surface-2'
              }`}
            >
              My Decisions
              <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                  showMineOnly
                    ? 'bg-white/20 text-white'
                    : 'bg-accent/15 text-accent'
                }`}
              >
                {myDecisionsCount}
              </span>
            </button>
          )}
        </div>

        {/* Right: Log New Decision button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-2 transition-all duration-200 active:scale-[0.97] flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Log New Decision
        </button>
      </div>

      {/* ── New Decision Form ── */}
      {showForm && (
        <div
          className="glow-card bg-surface rounded-xl border border-border p-6 space-y-5 animate-fade-in"
          style={{ animationDelay: '50ms', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">{editingDecisionId ? 'Edit Decision' : 'Log New Decision'}</h2>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Decision Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Approved new risk framework for BTC Alpha"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Full context and details of the decision..."
              rows={3}
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all resize-none"
            />
          </div>

          {/* Category + Decided By (side by side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as Decision['category'] }))}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all appearance-none cursor-pointer"
              >
                {Object.entries(categoryConfig).map(([key, conf]) => (
                  <option key={key} value={key}>
                    {conf.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Decided By
              </label>
              <select
                value={form.decidedBy}
                onChange={(e) => setForm((prev) => ({ ...prev, decidedBy: e.target.value }))}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all appearance-none cursor-pointer"
              >
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rationale */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Rationale
            </label>
            <textarea
              value={form.rationale}
              onChange={(e) => setForm((prev) => ({ ...prev, rationale: e.target.value }))}
              placeholder="Why was this decision made? What alternatives were considered?"
              rows={3}
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all resize-none"
            />
          </div>

          {/* Affected People (checkboxes) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Affected People
            </label>
            <div className="flex flex-wrap gap-3">
              {teamMembers.map((member) => (
                <label
                  key={member}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all duration-200 select-none ${
                    form.affected.includes(member)
                      ? 'bg-accent/15 text-accent border-accent/30'
                      : 'bg-surface-3 text-text-muted border-border hover:border-border-2 hover:text-text-secondary'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.affected.includes(member)}
                    onChange={() => toggleAffected(member)}
                    className="sr-only"
                  />
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                      form.affected.includes(member)
                        ? 'bg-accent border-accent'
                        : 'border-text-muted/40 bg-transparent'
                    }`}
                  >
                    {form.affected.includes(member) && (
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>
                  {member}
                </label>
              ))}
            </div>
          </div>

          {/* Submit row */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
            <button
              onClick={() => setShowAIAdvisor(!showAIAdvisor)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-accent bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-all duration-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showAIAdvisor ? 'Hide AI Advisor' : 'Ask AI Advisor'}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingDecisionId(null);
                  setShowAIAdvisor(false);
                  setForm({ ...emptyForm, decidedBy: ownerName || emptyForm.decidedBy });
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-secondary bg-surface-3 hover:bg-surface-2 border border-border transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.title.trim() || !form.rationale.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <CheckCircle className="w-4 h-4" />
                {editingDecisionId ? 'Save Changes' : 'Submit Decision'}
              </button>
            </div>
          </div>

          {/* AI Advisor for Decision */}
          {showAIAdvisor && currentUser && (() => {
            const member = getMemberById(currentUser);
            return (
              <div className="mt-4 animate-fade-in">
                <AIChatPanel
                  memberId={`${currentUser}-decisions`}
                  memberName={member?.name ?? ownerName ?? 'Team Member'}
                  memberRole={member?.role ?? ''}
                  context={{
                    decisionTitle: form.title,
                    decisionDescription: form.description,
                    decisionRationale: form.rationale,
                    decisionCategory: form.category,
                    kpis: member?.kpis,
                    ownership: member?.singleThreadedOwnership,
                  }}
                  title="Decision AI Advisor"
                  titleIcon="sparkles"
                  compact={true}
                  defaultCollapsed={false}
                  suggestedPrompts={[
                    'Help me think through the pros and cons',
                    'What second-order effects should I consider?',
                    'Who should I consult before deciding?',
                    'What are the risks of this decision?',
                    'How does this align with our $1B North Star?',
                    'What would I need to see to reverse this decision?',
                  ]}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Decision Cards ── */}
      <div className="space-y-4">
        {filteredDecisions.map((decision, index) => {
          const catConf = categoryConfig[decision.category];
          const statConf = statusConfig[decision.status];
          const StatusIcon = statConf.icon;
          const isExpanded = expandedIds.has(decision.id);
          const userIsDecider = isUserDecider(decision);
          const userIsAffected = isUserAffected(decision);

          return (
            <div
              key={decision.id}
              className="glow-card bg-surface rounded-xl border border-border hover:border-border-2 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${200 + index * 50}ms`, opacity: 0 }}
            >
              {/* Card header */}
              <div className="p-5 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  {/* Title + badges */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-text-primary leading-snug mb-2">
                      {decision.title}
                    </h3>
                    <div className="flex items-center flex-wrap gap-2">
                      {/* Category badge */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${catConf.color}`}
                      >
                        {catConf.label}
                      </span>
                      {/* Status badge (click to cycle) */}
                      <button
                        onClick={() => cycleDecisionStatus(decision.id)}
                        title="Click to change status"
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border cursor-pointer hover:opacity-80 transition-opacity ${statConf.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statConf.label}
                      </button>
                      {/* User involvement badge */}
                      {userIsDecider && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">
                          You decided
                        </span>
                      )}
                      {userIsAffected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">
                          Affects you
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta: decided by + date + actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Edit + Delete buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditDecision(decision); }}
                        title="Edit decision"
                        className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-accent transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteDecision(decision.id); }}
                        title="Delete decision"
                        className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                        ownerColors[decision.decidedBy] || 'bg-surface-3 text-text-muted border-border'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      {decision.decidedBy}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-text-muted font-mono">
                      <Calendar className="w-3 h-3" />
                      {decision.date}
                    </span>
                  </div>
                </div>

                {/* Rationale */}
                <div className="mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Rationale
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {decision.rationale}
                  </p>
                </div>

                {/* Affected people */}
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mr-1">
                    Affected
                  </span>
                  {decision.affected.map((person) => (
                    <span
                      key={person}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                        person === ownerName
                          ? 'ring-2 ring-accent/40 shadow-[0_0_15px_rgba(20,184,166,0.15)] bg-accent/5 border-accent/30 text-accent'
                          : ownerColors[person] || 'bg-surface-3 text-text-muted border-border'
                      }`}
                    >
                      <User className="w-2.5 h-2.5" />
                      {person}
                      {person === ownerName && (
                        <span className="text-[9px] font-bold uppercase text-accent ml-0.5">You</span>
                      )}
                    </span>
                  ))}
                </div>

                {/* Expand/Collapse description toggle */}
                <button
                  onClick={() => toggleExpand(decision.id)}
                  className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors duration-200"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show Details
                    </>
                  )}
                </button>
              </div>

              {/* Expandable description */}
              {isExpanded && decision.description && (
                <div className="px-5 pb-5 pt-0 border-t border-border/50 mt-0">
                  <div className="pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                      Full Description
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {decision.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {filteredDecisions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted bg-surface border border-border rounded-xl">
            <Scale className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No decisions match this filter</p>
            <p className="text-xs mt-1">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
}
