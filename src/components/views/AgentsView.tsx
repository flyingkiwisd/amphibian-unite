'use client';

import { useState } from 'react';
import { agents as defaultAgents } from '@/lib/data';
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

export function AgentsView({ currentUser }: { currentUser?: string }) {
  const { data: agentsData, setData: setAgents, hasEdits, resetAll } = useEditableStore(
    'amphibian-unite-agents',
    defaultAgents
  );

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const selectedAgent = selectedAgentId ? agentsData.find((a) => a.id === selectedAgentId) || null : null;

  const activeCount = agentsData.filter((a) => a.status === 'active').length;
  const buildingCount = agentsData.filter((a) => a.status === 'building').length;
  const plannedCount = agentsData.filter((a) => a.status === 'planned').length;

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

  return (
    <div className="space-y-8">
      {/* Edit Banner */}
      <EditBanner hasEdits={hasEdits} onReset={resetAll} />

      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-text-primary">
          The <span className="gradient-text">14 Agents</span>
        </h1>
        <p className="mt-2 text-text-secondary text-lg">
          AI-native intelligence powering every layer of Amphibian Capital
        </p>
      </div>

      {/* Stats Bar */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in"
        style={{ animationDelay: '100ms' }}
      >
        {[
          { label: 'Total Agents', value: agentsData.length, color: 'text-text-primary' },
          { label: 'Active', value: activeCount, color: 'text-green-400' },
          { label: 'Building', value: buildingCount, color: 'text-amber-400' },
          { label: 'Planned', value: plannedCount, color: 'text-gray-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-xl border border-border p-4 text-center"
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
          {agentsData.map((agent, index) => {
            const IconComponent = iconMap[agent.icon] || Compass;
            return (
              <div
                key={agent.id}
                className="glow-card group bg-surface rounded-xl border border-border cursor-pointer transition-all duration-300 hover:border-border-2 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 animate-fade-in"
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
                      <h3 className="text-sm font-semibold text-text-primary leading-tight">
                        <InlineText
                          value={agent.name}
                          onSave={(v) => updateAgent(agent.id, 'name', v)}
                        />
                      </h3>
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

                  {/* Connected Data Sources */}
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <Database className="w-3.5 h-3.5" />
                    <span className="text-xs">
                      {agent.dataSourcesConnected.length} connected source
                      {agent.dataSourcesConnected.length !== 1 ? 's' : ''}
                    </span>
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
