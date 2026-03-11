'use client';

import { useState, useRef, useEffect } from 'react';
import { agents as defaultAgents, memberIdToOwnerName } from '@/lib/data';
import type { Agent } from '@/lib/data';
import { exportToPdf } from '@/lib/exportPdf';
import { useEditableStore } from '@/lib/useEditableStore';
import { InlineText, InlineSelect, InlineList, EditBanner } from '@/components/InlineEdit';
import {
  Compass,
  Users,
  Target,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  Shield,
  Scale,
  DollarSign,
  Heart,
  Cpu,
  Map,
  BookOpen,
  UserPlus,
  X,
  Check,
  Database,
  Download,
  Plus,
  Trash2,
  Send,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Compass,
  Users,
  Target,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  Shield,
  Scale,
  DollarSign,
  Heart,
  Cpu,
  Map,
  BookOpen,
  UserPlus,
};

function getStatusStyle(status: Agent['status']) {
  switch (status) {
    case 'active':
      return 'bg-green-500/15 text-green-400 border border-green-500/30';
    case 'building':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'planned':
      return 'bg-gray-500/15 text-gray-400 border border-gray-500/30';
  }
}

function getPriorityStyle(priority: Agent['priority']) {
  switch (priority) {
    case 'critical':
      return 'bg-red-500/15 text-red-400 border border-red-500/30';
    case 'high':
      return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
    case 'medium':
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
  }
}

function getGradientBorder(color: string): string {
  const colorName = color.replace('text-', '').replace('-400', '');
  const colorMap: Record<string, string> = {
    teal: 'from-teal-400 via-teal-500 to-teal-600',
    blue: 'from-blue-400 via-blue-500 to-blue-600',
    emerald: 'from-emerald-400 via-emerald-500 to-emerald-600',
    amber: 'from-amber-400 via-amber-500 to-amber-600',
    purple: 'from-purple-400 via-purple-500 to-purple-600',
    cyan: 'from-cyan-400 via-cyan-500 to-cyan-600',
    indigo: 'from-indigo-400 via-indigo-500 to-indigo-600',
    rose: 'from-rose-400 via-rose-500 to-rose-600',
    green: 'from-green-400 via-green-500 to-green-600',
    pink: 'from-pink-400 via-pink-500 to-pink-600',
    violet: 'from-violet-400 via-violet-500 to-violet-600',
    orange: 'from-orange-400 via-orange-500 to-orange-600',
    sky: 'from-sky-400 via-sky-500 to-sky-600',
    lime: 'from-lime-400 via-lime-500 to-lime-600',
  };
  return colorMap[colorName] || 'from-teal-400 via-teal-500 to-teal-600';
}

const statusOptions = [
  { label: 'Active', value: 'active', color: 'bg-green-500/15 text-green-400 border border-green-500/30' },
  { label: 'Building', value: 'building', color: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  { label: 'Planned', value: 'planned', color: 'bg-gray-500/15 text-gray-400 border border-gray-500/30' },
];

const priorityOptions = [
  { label: 'Critical', value: 'critical', color: 'bg-red-500/15 text-red-400 border border-red-500/30' },
  { label: 'High', value: 'high', color: 'bg-orange-500/15 text-orange-400 border border-orange-500/30' },
  { label: 'Medium', value: 'medium', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
  { label: 'Low', value: 'low', color: 'bg-gray-500/15 text-gray-400 border border-gray-500/30' },
];

const agentOwnerMap: Record<string, string> = {
  'task-commander': 'thao',
  'slack-signal': 'ty',
  'north-star': 'james',
  'identity': 'james',
  'governance': 'james',
  'okr-engine': 'james',
  'ai-edge': 'ty',
  'lp-trust': 'todd',
  'culture': 'james',
  'portfolio-intel': 'ty',
  'financial': 'mark',
  'knowledge': 'james',
  'roadmap': 'james',
  'hiring': 'james',
};

function getAgentHealthMetrics(agent: Agent) {
  const statusScores: Record<string, number> = { active: 95, building: 60, planned: 0 };
  const uptime = statusScores[agent.status] ?? 0;
  const capCount = agent.capabilities.length;
  const dataScore = Math.min(100, agent.dataSourcesConnected.length * 25);

  return [
    { label: 'Uptime', value: agent.status === 'active' ? `${uptime}%` : '—', color: uptime >= 90 ? 'text-green-400' : uptime >= 50 ? 'text-amber-400' : 'text-text-muted' },
    { label: 'Capabilities', value: capCount, color: capCount >= 5 ? 'text-blue-400' : capCount >= 3 ? 'text-amber-400' : 'text-text-muted' },
    { label: 'Data Score', value: agent.status !== 'planned' ? `${dataScore}%` : '—', color: dataScore >= 75 ? 'text-green-400' : dataScore >= 50 ? 'text-amber-400' : 'text-text-muted' },
  ];
}

const agentActivityLog: Record<string, { text: string; time: string; dotColor: string }[]> = {
  'task-commander': [
    { text: 'Synced 12 tasks from Supabase', time: '2h ago', dotColor: 'bg-green-400' },
    { text: 'Auto-assigned 3 tasks based on ownership rules', time: '4h ago', dotColor: 'bg-blue-400' },
    { text: 'Flagged 2 overdue tasks for review', time: '1d ago', dotColor: 'bg-amber-400' },
  ],
  'north-star': [
    { text: 'Updated AUM tracking to $85M', time: '6h ago', dotColor: 'bg-green-400' },
    { text: 'Refreshed edge rating calculation', time: '1d ago', dotColor: 'bg-blue-400' },
    { text: 'Generated weekly north star report', time: '3d ago', dotColor: 'bg-teal-400' },
  ],
  'slack-signal': [
    { text: 'Processed 47 Slack messages', time: '1h ago', dotColor: 'bg-green-400' },
    { text: 'Extracted 3 action items from #strategy', time: '3h ago', dotColor: 'bg-blue-400' },
    { text: 'Flagged alignment issue in #product', time: '1d ago', dotColor: 'bg-amber-400' },
  ],
  'portfolio-intel': [
    { text: 'Scanned 8 portfolio positions', time: '2h ago', dotColor: 'bg-green-400' },
    { text: 'Alert: BTC correlation shift detected', time: '5h ago', dotColor: 'bg-rose-400' },
    { text: 'Updated risk-adjusted returns', time: '1d ago', dotColor: 'bg-blue-400' },
  ],
  'financial': [
    { text: 'Updated runway projections', time: '4h ago', dotColor: 'bg-green-400' },
    { text: 'Reconciled Q1 expense categories', time: '1d ago', dotColor: 'bg-blue-400' },
    { text: 'Generated cash flow forecast', time: '2d ago', dotColor: 'bg-teal-400' },
  ],
  'lp-trust': [
    { text: 'Prepared LP update for March', time: '3h ago', dotColor: 'bg-green-400' },
    { text: 'Flagged LP #4 contact overdue', time: '1d ago', dotColor: 'bg-amber-400' },
    { text: 'Analyzed LP satisfaction trends', time: '3d ago', dotColor: 'bg-blue-400' },
  ],
};

function getAgentActivity(agentId: string) {
  return agentActivityLog[agentId] ?? [
    { text: 'Agent initialized', time: 'recently', dotColor: 'bg-gray-400' },
    { text: 'Awaiting first activation', time: '—', dotColor: 'bg-gray-500' },
  ];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: number;
}

function generateAgentResponse(agent: Agent, userMessage: string): string {
  const msg = userMessage.toLowerCase();
  const name = agent.name;
  const caps = agent.capabilities;
  const sources = agent.dataSourcesConnected;

  // Agent-specific hard-coded responses
  const agentSpecific: Record<string, Record<string, string>> = {
    'north-star': {
      status: `Current AUM tracking at $85M with a North Star target of $1B+. Edge rating sits at 5.1/10 — we're monitoring daily for strategic inflection points. All ${sources.length} data sources feeding live.`,
      capabilities: `I'm built to keep the team locked on the $1B+ North Star. My capabilities include: ${caps.join(', ')}. I pull from ${sources.join(', ')} to maintain real-time alignment scoring.`,
      risk: `Key risk factors: Edge rating at 5.1/10 suggests room for improvement. AUM gap to target remains significant at ~$915M. Monitoring macro headwinds and LP sentiment shifts that could impact trajectory.`,
      data: `Connected to ${sources.length} sources: ${sources.join(', ')}. All feeds operational. AUM data refreshes every 6 hours, edge rating recalculates daily.`,
      report: `North Star Brief: AUM $85M (8.5% of $1B target). Edge rating 5.1/10. ${sources.length} data sources connected and live. Weekly alignment report generated 3 days ago. Priority: critical.`,
    },
    'task-commander': {
      status: `14 active tasks in the pipeline. Team velocity is tracking well — 3 tasks auto-assigned in the last 4 hours. 2 overdue items flagged for review. Connected to ${sources.join(', ')}.`,
      capabilities: `I manage the full task lifecycle. Capabilities: ${caps.join(', ')}. I sync with ${sources.join(', ')} to keep everything organized and moving.`,
      risk: `2 overdue tasks need attention — potential bottleneck risk. Team load distribution looks uneven; recommending rebalance. No blocked dependencies detected.`,
      data: `Data pipeline: ${sources.join(', ')}. Task sync runs every 2 hours. Last sync pulled 12 tasks. All connections healthy.`,
      report: `Task Commander Brief: 14 active tasks, 2 overdue, 3 recently auto-assigned. Team velocity trending up 12% WoW. ${sources.length} data sources connected. Priority: high.`,
    },
    'portfolio-intel': {
      status: `Portfolio scan complete across 8 positions. BTC correlation shift detected 5 hours ago — monitoring closely. Risk-adjusted returns updated. Pulling from ${sources.join(', ')}.`,
      capabilities: `I provide deep portfolio intelligence. Capabilities: ${caps.join(', ')}. Sourcing data from ${sources.join(', ')} for comprehensive analysis.`,
      risk: `Alert: BTC correlation shift detected — this could impact 3 portfolio positions. Recommend reviewing hedge exposure. Risk-adjusted returns are within tolerance but trending toward the boundary.`,
      data: `Connected to ${sources.length} sources: ${sources.join(', ')}. Position data refreshes every 2 hours. Correlation models recalculate on new market data.`,
      report: `Portfolio Intel Brief: 8 positions scanned, BTC correlation shift flagged, risk-adjusted returns updated. ${sources.length} data sources live. Recommend hedge review this week.`,
    },
    'financial': {
      status: `Runway at 18 months. Q1 expenses tracking under budget by 4.2%. Cash flow forecast updated 2 days ago. Connected to ${sources.join(', ')}.`,
      capabilities: `I handle financial intelligence end-to-end. Capabilities: ${caps.join(', ')}. Data flows from ${sources.join(', ')}.`,
      risk: `Runway is healthy at 18 months but sensitive to AUM growth rate. Q1 burn rate is under control. Watch item: upcoming infrastructure costs could tighten margins in Q2.`,
      data: `Data sources: ${sources.join(', ')}. Expense data reconciles daily. Runway projections update weekly. All feeds green.`,
      report: `Financial Brief: Runway 18 months, Q1 expenses 4.2% under budget. Cash flow positive. ${sources.length} sources connected. No immediate concerns — Q2 infra costs worth monitoring.`,
    },
    'lp-trust': {
      status: `LP satisfaction trending positive. March update prepared 3 hours ago. 1 LP contact flagged as overdue for outreach. Tracking via ${sources.join(', ')}.`,
      capabilities: `I manage LP relationships and trust-building. Capabilities: ${caps.join(', ')}. Data from ${sources.join(', ')}.`,
      risk: `LP #4 contact is overdue — recommend outreach within 48 hours. Overall satisfaction is stable but 2 LPs showed decreased engagement last quarter. Proactive communication recommended.`,
      data: `Connected to ${sources.join(', ')}. LP interaction logs update in real-time. Satisfaction scoring recalculates monthly. ${sources.length} sources all operational.`,
      report: `LP Trust Brief: Overall satisfaction positive, March update ready, 1 overdue contact flagged. Outreach cadence on track for 4 of 5 LPs. ${sources.length} data sources connected.`,
    },
    'slack-signal': {
      status: `Processed 47 Slack messages in the last hour. 3 action items extracted from #strategy. 1 alignment issue flagged in #product. Connected to ${sources.join(', ')}.`,
      capabilities: `I monitor Slack for signals that matter. Capabilities: ${caps.join(', ')}. Pulling from ${sources.join(', ')}.`,
      risk: `Alignment issue detected in #product channel — may indicate team misalignment on roadmap priorities. Recommend sync meeting. Action item completion rate is 78% — 22% are stale.`,
      data: `Sources: ${sources.join(', ')}. Message processing is real-time. Action item extraction uses keyword and context matching. ${sources.length} feeds active.`,
      report: `Slack Signal Brief: 47 messages processed, 3 action items extracted, 1 alignment flag raised. Signal-to-noise ratio healthy. ${sources.length} sources connected.`,
    },
  };

  const specific = agentSpecific[agent.id];

  if (specific) {
    if (/status|update|how/.test(msg)) return specific.status;
    if (/help|capabilities|what can/.test(msg)) return specific.capabilities;
    if (/risk|concern|issue/.test(msg)) return specific.risk;
    if (/data|source|connect/.test(msg)) return specific.data;
    if (/report|summary|brief/.test(msg)) return specific.report;
  }

  // Generic keyword-based fallbacks for agents without specific responses
  if (/status|update|how/.test(msg)) {
    return `${name} is ${agent.status === 'active' ? 'online and operational' : 'currently in ' + agent.status + ' phase'}. Connected to ${sources.length} data source${sources.length !== 1 ? 's' : ''}: ${sources.length > 0 ? sources.join(', ') : 'none yet'}. All systems nominal.`;
  }
  if (/help|capabilities|what can/.test(msg)) {
    return `Here's what I can do:\n${caps.map((c) => '- ' + c).join('\n')}\n\nI'm powered by ${sources.length} data source${sources.length !== 1 ? 's' : ''} and continuously improving.`;
  }
  if (/risk|concern|issue/.test(msg)) {
    return `Based on my current data from ${sources.length} source${sources.length !== 1 ? 's' : ''}, I'm monitoring for risks across my domain. ${agent.status === 'active' ? 'No critical alerts at this time, but I recommend regular review cycles.' : 'Full risk analysis will be available once I\'m fully active.'}`;
  }
  if (/data|source|connect/.test(msg)) {
    return `I'm connected to ${sources.length} data source${sources.length !== 1 ? 's' : ''}${sources.length > 0 ? ': ' + sources.join(', ') : ''}. ${sources.length >= 4 ? 'Strong coverage across my domain.' : sources.length > 0 ? 'Additional sources would improve my analysis.' : 'No sources connected yet — this is a priority.'}`;
  }
  if (/report|summary|brief/.test(msg)) {
    return `${name} Summary: Status is ${agent.status}, priority ${agent.priority}. ${caps.length} capabilities active, ${sources.length} data sources connected. ${agent.status === 'active' ? 'Operating within normal parameters.' : 'Full reporting available once active.'}`;
  }

  // Default catch-all
  return `I'm ${name}, and I'm here to help. I have ${caps.length} capabilities and access to ${sources.length} data source${sources.length !== 1 ? 's' : ''}. Try asking me about my status, capabilities, risks, data sources, or for a summary report.`;
}

export function AgentsView({ currentUser }: { currentUser?: string }) {
  const ownerName = currentUser ? memberIdToOwnerName[currentUser] ?? currentUser : null;

  const { data: agentsData, setData: setAgents, hasEdits, resetAll } = useEditableStore(
    'amphibian-unite-agents',
    defaultAgents
  );

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showMyAgentsOnly, setShowMyAgentsOnly] = useState(false);
  const [agentChats, setAgentChats] = useState<Record<string, ChatMessage[]>>({});
  const [agentPrompt, setAgentPrompt] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const selectedAgent = selectedAgentId ? agentsData.find((a) => a.id === selectedAgentId) || null : null;

  const activeCount = agentsData.filter((a) => a.status === 'active').length;
  const buildingCount = agentsData.filter((a) => a.status === 'building').length;
  const plannedCount = agentsData.filter((a) => a.status === 'planned').length;

  const myAgents = currentUser
    ? agentsData.filter((a) => agentOwnerMap[a.id] === currentUser)
    : [];
  const myActiveCount = myAgents.filter((a) => a.status === 'active').length;
  const myBuildingCount = myAgents.filter((a) => a.status === 'building').length;

  const displayedAgents = showMyAgentsOnly && currentUser
    ? agentsData.filter((a) => agentOwnerMap[a.id] === currentUser)
    : agentsData;

  const handleDownloadPDF = (agent: Agent) => {
    exportToPdf('agent-detail-panel', `amphibian-unite-agent-${agent.id}`);
  };

  const updateAgent = (id: string, field: string, value: string | string[]) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const addAgent = () => {
    const newId = `agent-${Date.now()}`;
    setAgents((prev) => [
      ...prev,
      {
        id: newId,
        name: 'New Agent',
        shortName: 'New',
        icon: 'Compass',
        color: 'text-teal-400',
        gradient: 'from-teal-500/20 to-teal-500/5',
        description: 'Click to edit description...',
        capabilities: ['Click to add capabilities'],
        dataSourcesConnected: [],
        status: 'planned' as const,
        priority: 'medium' as const,
      },
    ]);
  };

  const deleteAgent = (id: string) => {
    if (selectedAgentId === id) setSelectedAgentId(null);
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  // Auto-scroll chat to bottom when messages change or typing indicator appears
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [agentChats, isAgentTyping]);

  const handleAgentMessage = (agent: Agent) => {
    const text = agentPrompt.trim();
    if (!text || agent.status !== 'active') return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setAgentChats((prev) => ({
      ...prev,
      [agent.id]: [...(prev[agent.id] || []), userMsg],
    }));
    setAgentPrompt('');
    setIsAgentTyping(true);

    const delay = 800 + Math.random() * 1200; // 0.8–2s
    setTimeout(() => {
      const responseText = generateAgentResponse(agent, text);
      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        role: 'agent',
        text: responseText,
        timestamp: Date.now(),
      };
      setAgentChats((prev) => ({
        ...prev,
        [agent.id]: [...(prev[agent.id] || []), agentMsg],
      }));
      setIsAgentTyping(false);
    }, delay);
  };

  return (
    <div className="space-y-8">
      {/* Edit Banner */}
      <EditBanner hasEdits={hasEdits} onReset={resetAll} />

      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              The <span className="gradient-text">14 Agents</span>
            </h1>
            <p className="mt-2 text-text-secondary text-lg">
              AI-native intelligence powering every layer of Amphibian Capital
            </p>
          </div>
          {currentUser && myAgents.length > 0 && (
            <button
              onClick={() => setShowMyAgentsOnly(!showMyAgentsOnly)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                showMyAgentsOnly
                  ? 'bg-accent/15 text-accent border-accent/30 shadow-[0_0_12px_rgba(20,184,166,0.15)]'
                  : 'bg-surface text-text-secondary border-border hover:border-border-2 hover:text-text-primary'
              }`}
            >
              My Agents
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                showMyAgentsOnly ? 'bg-accent/20 text-accent' : 'bg-surface-3 text-text-muted'
              }`}>
                {myAgents.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div
        className={`grid grid-cols-2 ${currentUser && myAgents.length > 0 ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 animate-fade-in`}
        style={{ animationDelay: '100ms' }}
      >
        {[
          { label: 'Total Agents', value: agentsData.length, color: 'text-text-primary' },
          { label: 'Active', value: activeCount, color: 'text-green-400' },
          { label: 'Building', value: buildingCount, color: 'text-amber-400' },
          { label: 'Planned', value: plannedCount, color: 'text-gray-400' },
          ...(currentUser && myAgents.length > 0
            ? [{ label: `Your Agents: ${myActiveCount} active, ${myBuildingCount} building`, value: myAgents.length, color: 'text-accent' }]
            : []),
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-surface rounded-xl border p-4 text-center ${
              stat.color === 'text-accent' ? 'border-accent/30 bg-accent/5' : 'border-border'
            }`}
          >
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-text-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Add Agent Button + Agent Grid */}
      <div>
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={addAgent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-lg hover:bg-teal-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Agent
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayedAgents.map((agent, index) => {
            const IconComponent = iconMap[agent.icon] || Compass;
            const isOwnedByUser = currentUser ? agentOwnerMap[agent.id] === currentUser : false;
            return (
              <div
                key={agent.id}
                className={`glow-card group bg-surface rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 animate-fade-in ${
                  isOwnedByUser
                    ? 'ring-2 ring-accent/40 shadow-[0_0_15px_rgba(20,184,166,0.15)] bg-accent/5 border-accent/30'
                    : 'border-border hover:border-border-2'
                }`}
                style={{ animationDelay: `${(index + 2) * 75}ms`, opacity: 0 }}
                onClick={() => setSelectedAgentId(agent.id)}
              >
                {/* Gradient Top Border */}
                <div
                  className={`h-1 rounded-t-xl bg-gradient-to-r ${getGradientBorder(agent.color)}`}
                />

                <div className="p-5">
                  {/* Icon + Name Row */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`p-2.5 rounded-lg bg-gradient-to-br ${agent.gradient} flex-shrink-0`}
                    >
                      <IconComponent className={`w-5 h-5 ${agent.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-text-primary leading-tight">
                          <InlineText
                            value={agent.name}
                            onSave={(v) => updateAgent(agent.id, 'name', v)}
                          />
                        </h3>
                        {isOwnedByUser && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider flex-shrink-0">Yours</span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                        <InlineText
                          value={agent.description}
                          onSave={(v) => updateAgent(agent.id, 'description', v)}
                          multiline
                        />
                      </p>
                    </div>
                  </div>

                  {/* Status + Priority Badges */}
                  <div className="flex items-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                    <InlineSelect
                      value={agent.status}
                      options={statusOptions}
                      onSave={(v) => updateAgent(agent.id, 'status', v)}
                    />
                    <InlineSelect
                      value={agent.priority}
                      options={priorityOptions}
                      onSave={(v) => updateAgent(agent.id, 'priority', v)}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteAgent(agent.id); }}
                      className="ml-auto p-1 rounded hover:bg-rose-500/20 text-text-muted/30 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete agent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Connected Data Sources + Health */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Database className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {agent.dataSourcesConnected.length} connected source
                        {agent.dataSourcesConnected.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {agent.status === 'active' && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] text-green-400/80 font-medium">Online</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel Overlay */}
      {selectedAgent && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setSelectedAgentId(null)}
          />

          {/* Slide-in Panel */}
          <div id="agent-detail-panel" className="fixed top-0 right-0 h-full w-full max-w-lg bg-surface border-l border-border z-50 overflow-y-auto animate-slide-in shadow-2xl shadow-black/50">
            {(() => {
              const DetailIcon = iconMap[selectedAgent.icon] || Compass;
              return (
                <div className="p-6 space-y-6">
                  {/* Panel Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${selectedAgent.gradient}`}
                      >
                        <DetailIcon className={`w-6 h-6 ${selectedAgent.color}`} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-text-primary">
                          <InlineText
                            value={selectedAgent.name}
                            onSave={(v) => updateAgent(selectedAgent.id, 'name', v)}
                          />
                        </h2>
                        <p className="text-sm text-text-muted">{selectedAgent.shortName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAgentId(null)}
                      className="p-2 rounded-lg hover:bg-surface-2 transition-colors text-text-muted hover:text-text-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Status + Priority */}
                  <div className="flex items-center gap-3">
                    <InlineSelect
                      value={selectedAgent.status}
                      options={statusOptions}
                      onSave={(v) => updateAgent(selectedAgent.id, 'status', v)}
                    />
                    <InlineSelect
                      value={selectedAgent.priority}
                      options={priorityOptions}
                      onSave={(v) => updateAgent(selectedAgent.id, 'priority', v)}
                    />
                  </div>

                  {/* Full Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                      Description
                    </h3>
                    <p className="text-text-primary leading-relaxed text-sm">
                      <InlineText
                        value={selectedAgent.description}
                        onSave={(v) => updateAgent(selectedAgent.id, 'description', v)}
                        multiline
                      />
                    </p>
                  </div>

                  {/* Capabilities */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                      Capabilities
                    </h3>
                    <InlineList
                      items={selectedAgent.capabilities}
                      onSave={(v) => updateAgent(selectedAgent.id, 'capabilities', v)}
                      placeholder="Add capability..."
                      icon={<Check className="w-4 h-4 text-green-400" />}
                    />
                  </div>

                  {/* Data Sources Connected */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                      Data Sources Connected
                    </h3>
                    <InlineList
                      items={selectedAgent.dataSourcesConnected}
                      onSave={(v) => updateAgent(selectedAgent.id, 'dataSourcesConnected', v)}
                      placeholder="Add data source..."
                      icon={<Database className="w-4 h-4 text-text-muted" />}
                    />
                  </div>

                  {/* Agent Health & Metrics */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                      Health & Metrics
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(() => {
                        const healthMetrics = getAgentHealthMetrics(selectedAgent);
                        return healthMetrics.map((metric) => (
                          <div key={metric.label} className="bg-surface-2 rounded-lg p-3 text-center">
                            <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
                            <div className="text-[10px] text-text-muted mt-0.5">{metric.label}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Agent Activity Log */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                      Recent Activity
                    </h3>
                    <div className="space-y-2">
                      {getAgentActivity(selectedAgent.id).map((activity, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${activity.dotColor}`} />
                          <div className="flex-1 min-w-0">
                            <span className="text-text-primary">{activity.text}</span>
                            <span className="text-text-muted ml-1.5">{activity.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Talk to Agent — Chat Interface */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                      Talk to Agent
                    </h3>
                    <div className="bg-surface-2 rounded-xl border border-border p-4">
                      {/* Online/Offline indicator */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-2 h-2 rounded-full ${selectedAgent.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                        <span className="text-xs text-text-muted">
                          {selectedAgent.status === 'active' ? 'Agent online — ready to assist' : 'Agent offline — coming soon'}
                        </span>
                      </div>

                      {selectedAgent.status === 'active' ? (
                        <>
                          {/* Messages area */}
                          <div
                            ref={chatScrollRef}
                            className="max-h-[300px] overflow-y-auto space-y-3 mb-3 scroll-smooth"
                          >
                            {(!agentChats[selectedAgent.id] || agentChats[selectedAgent.id].length === 0) && !isAgentTyping && (
                              <p className="text-xs text-text-muted/60 text-center py-6 italic">
                                Ask me anything about {selectedAgent.name}
                              </p>
                            )}
                            {(agentChats[selectedAgent.id] || []).map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[85%] text-sm whitespace-pre-wrap ${
                                    msg.role === 'user'
                                      ? 'bg-accent/20 text-text-primary border border-accent/30 rounded-xl px-3 py-2'
                                      : 'bg-surface border border-border rounded-xl px-3 py-2'
                                  }`}
                                >
                                  {msg.text}
                                </div>
                              </div>
                            ))}
                            {isAgentTyping && (
                              <div className="flex justify-start">
                                <div className="bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-muted italic">
                                  Thinking...
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Input + Send button */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={agentPrompt}
                              onChange={(e) => setAgentPrompt(e.target.value)}
                              placeholder={`Ask ${selectedAgent.shortName} Agent...`}
                              className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isAgentTyping) {
                                  handleAgentMessage(selectedAgent);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleAgentMessage(selectedAgent)}
                              disabled={!agentPrompt.trim() || isAgentTyping}
                              className="bg-accent/20 text-accent rounded-lg px-3 py-2.5 hover:bg-accent/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            placeholder="Coming soon..."
                            disabled
                            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Download PDF Button */}
                  <div className="pt-4 border-t border-border">
                    <button
                      onClick={() => handleDownloadPDF(selectedAgent)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent/20 to-accent-blue/20 border border-accent/30 text-accent hover:from-accent/30 hover:to-accent-blue/30 transition-all duration-200 font-medium text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download as PDF
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
