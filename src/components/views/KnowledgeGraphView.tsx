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
} from 'lucide-react';

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

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const chains: LinkedChain[] = [
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
];

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
  const [selectedChain, setSelectedChain] = useState<string>(chains[0].id);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const activeChain = chains.find((c) => c.id === selectedChain) || chains[0];

  return (
    <div className="space-y-8 animate-fade-in">
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in"
        style={{ animationDelay: '150ms', opacity: 0 }}
      >
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
                {chain.name}
              </h3>
            </div>
            <p className="text-xs text-text-muted">{chain.description}</p>
          </button>
        ))}
      </div>

      {/* ── Connected Chain Visualization ── */}
      <div
        className="glow-card bg-surface border border-border rounded-xl p-6 animate-fade-in"
        style={{ animationDelay: '225ms', opacity: 0 }}
      >
        <h2 className="text-lg font-semibold text-text-primary mb-6">
          {activeChain.name}
        </h2>

        {/* Chain Flow */}
        <div className="space-y-0">
          {activeChain.nodes.map((node, idx) => {
            const conf = nodeConfig[node.type];
            const Icon = conf.icon;
            const isSelected = selectedNode === node.id;
            const edge = activeChain.edges.find(
              (e) => e.to === node.id || (idx === 0 && e.from === node.id)
            );

            // Find relationship leading TO this node
            const incomingEdge = activeChain.edges.find((e) => e.to === node.id);

            return (
              <div key={node.id}>
                {/* Relationship Arrow (between nodes) */}
                {incomingEdge && (
                  <div className="flex items-center gap-2 py-3 pl-8">
                    <div className="w-0.5 h-4 bg-border" />
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-text-muted" />
                      <span className="text-xs text-text-muted italic">
                        {relationshipLabels[incomingEdge.relationship] || incomingEdge.relationship}
                      </span>
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
                          {conf.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary mt-1">
                        {node.label}
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
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {node.detail}
                      </p>

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

                            return (
                              <div
                                key={eIdx}
                                className="flex items-center gap-2 text-xs text-text-muted"
                              >
                                <span className={direction === 'outgoing' ? conf.color : targetConf.color}>
                                  {direction === 'outgoing' ? 'This' : targetNode.label}
                                </span>
                                <ArrowRight className="w-3 h-3" />
                                <span className="italic">
                                  {relationshipLabels[e.relationship]}
                                </span>
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
