'use client';

import { useState } from 'react';
import {
  GitBranch,
  ArrowRight,
  Target,
  User,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEditableStore } from '@/lib/useEditableStore';
import { InlineText, EditBanner } from '@/components/InlineEdit';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type NodeType = 'decision' | 'okr' | 'person' | 'risk';

interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  detail: string;
}

interface GraphEdge {
  from: string;
  to: string;
  relationship: string;
}

interface LinkedChain {
  id: string;
  name: string;
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface KnowledgeGraphData {
  chains: LinkedChain[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const defaultData: KnowledgeGraphData = {
  chains: [
    {
      id: 'chain-1',
      name: 'SMA Infrastructure Launch',
      description: 'Connecting SMA build-out to scaling goals and risk mitigation',
      nodes: [
        {
          id: 'c1-decision',
          type: 'decision',
          label: 'Launch SMA infrastructure',
          detail: 'Build exchange accounts, custody providers, counterparty onboarding for separately managed accounts.',
        },
        {
          id: 'c1-okr',
          type: 'okr',
          label: 'Scale to $100M AUM',
          detail: 'Key result: SMA infrastructure enables new LP capital deployment channels beyond commingled fund.',
        },
        {
          id: 'c1-person',
          type: 'person',
          label: 'Ross',
          detail: 'PM & SMA Infrastructure Lead. Single-threaded owner of SMA setup, counterparty management, and portfolio execution.',
        },
        {
          id: 'c1-risk',
          type: 'risk',
          label: 'Single product risk',
          detail: 'Over-reliance on BTC Alpha as sole product. SMA diversifies revenue streams and LP optionality.',
        },
      ],
      edges: [
        { from: 'c1-decision', to: 'c1-okr', relationship: 'serves' },
        { from: 'c1-okr', to: 'c1-person', relationship: 'owned by' },
        { from: 'c1-decision', to: 'c1-risk', relationship: 'mitigates' },
      ],
    },
    {
      id: 'chain-2',
      name: 'COO Hiring',
      description: 'Connecting critical hire to team scalability and CEO risk reduction',
      nodes: [
        {
          id: 'c2-decision',
          type: 'decision',
          label: 'Hire COO',
          detail: 'Recruit a COO with fund operations experience ($200M+ AUM) and digital asset background. Target: June 2026.',
        },
        {
          id: 'c2-okr',
          type: 'okr',
          label: 'Build institutional team',
          detail: 'Key result: COO hired, passes 30-day run-without-James test by September 2026.',
        },
        {
          id: 'c2-person',
          type: 'person',
          label: 'James',
          detail: 'CEO & Managing Partner. Owner of leadership design, hiring decisions, and succession architecture.',
        },
        {
          id: 'c2-risk',
          type: 'risk',
          label: 'CEO bottleneck risk',
          detail: 'James is currently single point of failure for daily ops, LP relationships, and strategic decisions. Bus factor = 1.',
        },
      ],
      edges: [
        { from: 'c2-decision', to: 'c2-okr', relationship: 'serves' },
        { from: 'c2-okr', to: 'c2-person', relationship: 'owned by' },
        { from: 'c2-decision', to: 'c2-risk', relationship: 'mitigates' },
      ],
    },
    {
      id: 'chain-3',
      name: 'Risk Dashboard V1',
      description: 'Connecting engineering deliverable to edge rating and risk management',
      nodes: [
        {
          id: 'c3-decision',
          type: 'decision',
          label: 'Ship risk dashboard v1',
          detail: 'Build and deploy real-time risk dashboard covering concentration, overlap, liquidity, and counterparty exposure.',
        },
        {
          id: 'c3-okr',
          type: 'okr',
          label: 'Achieve 7/10 edge rating',
          detail: 'Key result: Risk dashboard contributes to Layer 3 (Dynamic Risk Management) of the AI edge stack, targeting +75-125 bps.',
        },
        {
          id: 'c3-person',
          type: 'person',
          label: 'Timon',
          detail: 'Engineer & Platform Lead. Builds risk dashboard, data pipeline, regime classifier, and internal tools.',
        },
        {
          id: 'c3-risk',
          type: 'risk',
          label: 'Manual risk monitoring',
          detail: 'Current risk oversight is manual and spreadsheet-based. Delayed detection of concentration drift, counterparty exposure, and liquidity gaps.',
        },
      ],
      edges: [
        { from: 'c3-decision', to: 'c3-okr', relationship: 'serves' },
        { from: 'c3-okr', to: 'c3-person', relationship: 'owned by' },
        { from: 'c3-decision', to: 'c3-risk', relationship: 'mitigates' },
      ],
    },
    {
      id: 'chain-4',
      name: 'Dynamic Alpha Launch',
      description: 'Connecting new product to AUM growth and revenue diversification',
      nodes: [
        {
          id: 'c4-decision',
          type: 'decision',
          label: 'Launch Dynamic Alpha with GP capital',
          detail: 'Finalize name, structure, sleeve architecture. Deploy GP capital to first sleeve as proof of concept before LP fundraise.',
        },
        {
          id: 'c4-okr',
          type: 'okr',
          label: 'Multi-product revenue by Q4 2026',
          detail: 'Key result: Dynamic Alpha generates separate fee stream. Reduces dependence on BTC Alpha performance.',
        },
        {
          id: 'c4-person',
          type: 'person',
          label: 'Andrew',
          detail: 'Strategy & Dynamic Alpha Business Owner. Owns market validation, budget, build vs buy, IP strategy, and SMA infrastructure.',
        },
        {
          id: 'c4-risk',
          type: 'risk',
          label: 'Revenue concentration',
          detail: 'Single revenue stream from BTC Alpha management fees. Performance drawdowns directly threaten firm viability.',
        },
      ],
      edges: [
        { from: 'c4-decision', to: 'c4-okr', relationship: 'serves' },
        { from: 'c4-okr', to: 'c4-person', relationship: 'owned by' },
        { from: 'c4-decision', to: 'c4-risk', relationship: 'mitigates' },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Node Style Configuration
// ─────────────────────────────────────────────────────────────────────────────
const nodeConfig: Record<NodeType, { color: string; bg: string; border: string; icon: typeof Target; label: string }> = {
  decision: { color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30', icon: Lightbulb, label: 'Decision' },
  okr: { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', icon: Target, label: 'OKR' },
  person: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: User, label: 'Owner' },
  risk: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: AlertTriangle, label: 'Risk' },
};

const relationshipLabels: Record<string, string> = {
  serves: 'serves',
  'owned by': 'owned by',
  mitigates: 'mitigates',
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function KnowledgeGraphView() {
  const { data, setData, hasEdits, resetAll } = useEditableStore<KnowledgeGraphData>(
    'amphibian-unite-knowledge-graph',
    defaultData
  );

  const chains = data.chains;

  const [selectedChain, setSelectedChain] = useState<string>(chains[0]?.id || '');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const activeChain = chains.find((c) => c.id === selectedChain) || chains[0];

  const updateChain = (chainId: string, updater: (c: LinkedChain) => LinkedChain) => {
    setData((prev) => ({
      ...prev,
      chains: prev.chains.map((c) => (c.id === chainId ? updater(c) : c)),
    }));
  };

  const updateNode = (chainId: string, nodeId: string, updater: (n: GraphNode) => GraphNode) => {
    updateChain(chainId, (c) => ({
      ...c,
      nodes: c.nodes.map((n) => (n.id === nodeId ? updater(n) : n)),
    }));
  };

  const updateEdge = (chainId: string, edgeIdx: number, updater: (e: GraphEdge) => GraphEdge) => {
    updateChain(chainId, (c) => ({
      ...c,
      edges: c.edges.map((e, i) => (i === edgeIdx ? updater(e) : e)),
    }));
  };

  const addChain = () => {
    const newId = `chain-${Date.now()}`;
    const newChain: LinkedChain = {
      id: newId,
      name: 'New Chain',
      description: 'Description...',
      nodes: [
        { id: `${newId}-decision`, type: 'decision', label: 'New Decision', detail: 'Decision details...' },
        { id: `${newId}-okr`, type: 'okr', label: 'New OKR', detail: 'OKR details...' },
        { id: `${newId}-person`, type: 'person', label: 'Owner', detail: 'Owner details...' },
        { id: `${newId}-risk`, type: 'risk', label: 'New Risk', detail: 'Risk details...' },
      ],
      edges: [
        { from: `${newId}-decision`, to: `${newId}-okr`, relationship: 'serves' },
        { from: `${newId}-okr`, to: `${newId}-person`, relationship: 'owned by' },
        { from: `${newId}-decision`, to: `${newId}-risk`, relationship: 'mitigates' },
      ],
    };
    setData((prev) => ({ ...prev, chains: [...prev.chains, newChain] }));
    setSelectedChain(newId);
    setSelectedNode(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <EditBanner hasEdits={hasEdits} onReset={resetAll} />

      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <GitBranch className="w-7 h-7 text-teal-400" />
          <h1 className="text-3xl font-bold text-text-primary">
            <span className="gradient-text">Knowledge Graph</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-3xl">
          Visualize how decisions, OKRs, people, and risks connect.
          Every initiative links to the objective it serves, the person who owns it,
          and the risk it mitigates.
        </p>
      </div>

      {/* ── Legend ── */}
      <div
        className="flex items-center gap-6 flex-wrap animate-fade-in"
        style={{ animationDelay: '75ms', opacity: 0 }}
      >
        {(Object.entries(nodeConfig) as [NodeType, typeof nodeConfig.decision][]).map(([type, conf]) => {
          const Icon = conf.icon;
          return (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md ${conf.bg} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${conf.color}`} />
              </div>
              <span className="text-xs text-text-muted">{conf.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Chain Selector ── */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: '150ms', opacity: 0 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {chains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => {
                setSelectedChain(chain.id);
                setSelectedNode(null);
              }}
              className={`text-left rounded-xl p-4 transition-all duration-300 border ${
                selectedChain === chain.id
                  ? 'bg-teal-500/10 border-teal-500/30'
                  : 'bg-surface border-border hover:border-border-2'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Layers className={`w-4 h-4 ${selectedChain === chain.id ? 'text-teal-400' : 'text-text-muted'}`} />
                <h3 className={`text-sm font-semibold ${selectedChain === chain.id ? 'text-teal-400' : 'text-text-primary'}`}>
                  <InlineText
                    value={chain.name}
                    onSave={(v) => updateChain(chain.id, (c) => ({ ...c, name: v }))}
                  />
                </h3>
              </div>
              <InlineText
                value={chain.description}
                onSave={(v) => updateChain(chain.id, (c) => ({ ...c, description: v }))}
                className="text-xs text-text-muted"
              />
            </button>
          ))}
        </div>
        <button
          onClick={addChain}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-teal-400 transition-colors border border-dashed border-border hover:border-teal-500/40 rounded-xl px-4 py-3 w-full justify-center mt-3"
        >
          <Plus className="w-4 h-4" />
          Add New Chain
        </button>
      </div>

      {/* ── Connected Chain Visualization ── */}
      {activeChain && (
        <div
          className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
          style={{ animationDelay: '225ms', opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">
              <InlineText
                value={activeChain.name}
                onSave={(v) => updateChain(activeChain.id, (c) => ({ ...c, name: v }))}
              />
            </h2>
            <button
              onClick={() => {
                setData((prev) => ({
                  ...prev,
                  chains: prev.chains.filter((c) => c.id !== activeChain.id),
                }));
                if (chains.length > 1) {
                  const remaining = chains.filter((c) => c.id !== activeChain.id);
                  setSelectedChain(remaining[0]?.id || '');
                }
              }}
              className="p-1 text-text-muted/30 hover:text-rose-400 transition-colors"
              title="Delete chain"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Chain Flow */}
          <div className="space-y-0">
            {activeChain.nodes.map((node, idx) => {
              const conf = nodeConfig[node.type];
              const Icon = conf.icon;
              const isSelected = selectedNode === node.id;

              // Find relationship leading TO this node
              const incomingEdge = activeChain.edges.find((e) => e.to === node.id);
              const incomingEdgeIdx = incomingEdge ? activeChain.edges.indexOf(incomingEdge) : -1;

              return (
                <div key={node.id}>
                  {/* Relationship Arrow (between nodes) */}
                  {incomingEdge && (
                    <div className="flex items-center gap-2 py-3 pl-8">
                      <div className="w-0.5 h-4 bg-border" />
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-text-muted" />
                        <InlineText
                          value={relationshipLabels[incomingEdge.relationship] || incomingEdge.relationship}
                          onSave={(v) => updateEdge(activeChain.id, incomingEdgeIdx, (e) => ({ ...e, relationship: v }))}
                          className="text-xs text-text-muted italic"
                        />
                      </div>
                    </div>
                  )}

                  {/* Node Card */}
                  <button
                    onClick={() =>
                      setSelectedNode(isSelected ? null : node.id)
                    }
                    className={`w-full text-left rounded-xl p-4 border transition-all duration-300 ${
                      isSelected
                        ? `${conf.bg} ${conf.border}`
                        : 'bg-surface-2 border-border hover:border-border-2'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${conf.bg} border ${conf.border} flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`w-5 h-5 ${conf.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${conf.bg} ${conf.color} font-medium`}
                          >
                            <InlineText
                              value={conf.label}
                              onSave={() => {/* type label is from config, not editable per-node */}}
                            />
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-text-primary mt-1">
                          <InlineText
                            value={node.label}
                            onSave={(v) => updateNode(activeChain.id, node.id, (n) => ({ ...n, label: v }))}
                          />
                        </h3>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${
                          isSelected ? 'rotate-90' : ''
                        }`}
                      />
                    </div>

                    {/* Expanded Detail */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <InlineText
                          value={node.detail}
                          onSave={(v) => updateNode(activeChain.id, node.id, (n) => ({ ...n, detail: v }))}
                          className="text-xs text-text-secondary leading-relaxed"
                          multiline
                        />

                        {/* Show connections */}
                        <div className="mt-3 space-y-1">
                          {activeChain.edges
                            .filter((e) => e.from === node.id || e.to === node.id)
                            .map((e, eIdx) => {
                              const targetId = e.from === node.id ? e.to : e.from;
                              const targetNode = activeChain.nodes.find((n) => n.id === targetId);
                              const targetConf = targetNode
                                ? nodeConfig[targetNode.type]
                                : null;

                              if (!targetNode || !targetConf) return null;

                              const direction = e.from === node.id ? 'outgoing' : 'incoming';
                              const edgeGlobalIdx = activeChain.edges.indexOf(e);

                              return (
                                <div
                                  key={eIdx}
                                  className="flex items-center gap-2 text-xs text-text-muted"
                                >
                                  <span className={direction === 'outgoing' ? conf.color : targetConf.color}>
                                    {direction === 'outgoing' ? 'This' : targetNode.label}
                                  </span>
                                  <ArrowRight className="w-3 h-3" />
                                  <InlineText
                                    value={relationshipLabels[e.relationship] || e.relationship}
                                    onSave={(v) => updateEdge(activeChain.id, edgeGlobalIdx, (edge) => ({ ...edge, relationship: v }))}
                                    className="italic"
                                  />
                                  <ArrowRight className="w-3 h-3" />
                                  <span className={direction === 'outgoing' ? targetConf.color : conf.color}>
                                    {direction === 'outgoing' ? targetNode.label : 'this'}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Cross-Chain Connections ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '300ms', opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <GitBranch className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-text-primary">Cross-Chain Connections</h2>
        </div>
        <p className="text-xs text-text-muted mb-4">
          Decisions and risks that appear across multiple chains, revealing systemic patterns.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface-2 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-text-primary">James</h4>
            </div>
            <p className="text-xs text-text-muted">
              Appears as owner in <span className="text-amber-400 font-semibold">COO Hiring</span> chain.
              Risk: CEO bottleneck is the most cited cross-chain dependency.
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400">
                2 decisions
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400">
                1 risk owner
              </span>
            </div>
          </div>
          <div className="bg-surface-2 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h4 className="text-sm font-semibold text-text-primary">Revenue Concentration</h4>
            </div>
            <p className="text-xs text-text-muted">
              Mitigated by both <span className="text-teal-400 font-semibold">SMA Launch</span> and{' '}
              <span className="text-teal-400 font-semibold">Dynamic Alpha</span> chains.
              Two parallel paths reducing the same systemic risk.
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400">
                2 mitigating decisions
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">
                2 OKRs served
              </span>
            </div>
          </div>
          <div className="bg-surface-2 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-text-primary">Ross</h4>
            </div>
            <p className="text-xs text-text-muted">
              Owns <span className="text-teal-400 font-semibold">SMA Infrastructure</span> chain.
              Also has exposure to Dynamic Alpha via manager selection work.
              Potential overload risk if both chains accelerate simultaneously.
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400">
                1 primary chain
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                workload watch
              </span>
            </div>
          </div>
          <div className="bg-surface-2 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-violet-400" />
              <h4 className="text-sm font-semibold text-text-primary">Edge Rating 7/10</h4>
            </div>
            <p className="text-xs text-text-muted">
              The <span className="text-teal-400 font-semibold">Risk Dashboard</span> chain directly
              serves this OKR. Also connects to AI Edge Layer 3 (Dynamic Risk Management),
              which targets +75-125 bps of alpha attribution.
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">
                bridge to AI edge
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400">
                1 direct chain
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
