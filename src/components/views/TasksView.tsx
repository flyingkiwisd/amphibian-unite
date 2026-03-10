'use client';

import { useState } from 'react';
import {
  List,
  LayoutGrid,
  Plus,
  Calendar,
  User,
  Download,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  GripVertical,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  owner: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline: string;
  category: string;
}

type FilterType = 'all' | 'todo' | 'in-progress' | 'done';
type ViewMode = 'list' | 'kanban';
type SortField = 'title' | 'owner' | 'priority' | 'deadline' | 'category';
type SortDirection = 'asc' | 'desc';

// ── Pre-populated tasks (90-day action plan) ───────────────

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Map all BTC yield sources (12 categories) with bps attribution',
    owner: 'Ross',
    status: 'in-progress',
    priority: 'critical',
    deadline: 'Mar 15',
    category: 'BTC Alpha',
  },
  {
    id: '2',
    title: 'Set BTC Alpha kill criteria (strategy-level)',
    owner: 'Ty',
    status: 'todo',
    priority: 'critical',
    deadline: 'Mar 20',
    category: 'BTC Alpha',
  },
  {
    id: '3',
    title: 'Clear plan: which strategies, which managers for BTC Alpha',
    owner: 'Andrew',
    status: 'in-progress',
    priority: 'critical',
    deadline: 'Mar 31',
    category: 'BTC Alpha',
  },
  {
    id: '4',
    title: 'Post COO job description and begin CTO search',
    owner: 'James',
    status: 'done',
    priority: 'critical',
    deadline: 'Mar 15',
    category: 'Hiring',
  },
  {
    id: '5',
    title: 'A9 audit: scope and timeline confirmed',
    owner: 'Ross',
    status: 'todo',
    priority: 'critical',
    deadline: 'Mar 31',
    category: 'Dynamic Alpha',
  },
  {
    id: '6',
    title: 'Dynamic Alpha: name + structure + sleeve architecture',
    owner: 'James',
    status: 'in-progress',
    priority: 'high',
    deadline: 'Mar 31',
    category: 'Dynamic Alpha',
  },
  {
    id: '7',
    title: 'Identify custodial/PB partners for SMA infrastructure',
    owner: 'Ross',
    status: 'todo',
    priority: 'high',
    deadline: 'Mar 31',
    category: 'SMA',
  },
  {
    id: '8',
    title: 'Close at least one GP capital commitment',
    owner: 'James',
    status: 'in-progress',
    priority: 'critical',
    deadline: 'Mar 31',
    category: 'Capital',
  },
  {
    id: '9',
    title: 'Execute BTC Alpha plan, track weekly',
    owner: 'Andrew',
    status: 'in-progress',
    priority: 'critical',
    deadline: 'Ongoing',
    category: 'BTC Alpha',
  },
  {
    id: '10',
    title: 'Dynamic Alpha: manager shortlist (A9 + 2 others per sleeve)',
    owner: 'Ross',
    status: 'todo',
    priority: 'high',
    deadline: 'Apr 15',
    category: 'Dynamic Alpha',
  },
  {
    id: '11',
    title: 'SMA infrastructure: legal/ops framework + PB evaluation',
    owner: 'Timon',
    status: 'todo',
    priority: 'high',
    deadline: 'Apr 15',
    category: 'SMA',
  },
  {
    id: '12',
    title: 'Strategy performance database: build for allocation analysis',
    owner: 'Sahir',
    status: 'in-progress',
    priority: 'medium',
    deadline: 'Apr 30',
    category: 'Data',
  },
  {
    id: '13',
    title: 'Governance: identify 2-3 independent board candidates',
    owner: 'James',
    status: 'todo',
    priority: 'medium',
    deadline: 'Apr 30',
    category: 'Governance',
  },
  {
    id: '14',
    title: 'Regime classifier v0.1: architecture + data sources defined',
    owner: 'Timon',
    status: 'todo',
    priority: 'high',
    deadline: 'Apr 30',
    category: 'AI Edge',
  },
];

// ── Helpers ─────────────────────────────────────────────────

const priorityConfig = {
  critical: { color: 'bg-red-500', text: 'text-red-400', label: 'Critical', sort: 0 },
  high: { color: 'bg-orange-500', text: 'text-orange-400', label: 'High', sort: 1 },
  medium: { color: 'bg-blue-500', text: 'text-blue-400', label: 'Medium', sort: 2 },
  low: { color: 'bg-gray-500', text: 'text-gray-400', label: 'Low', sort: 3 },
};

const statusConfig = {
  todo: {
    color: 'bg-gray-500/15 text-gray-400',
    label: 'Todo',
    icon: Clock,
  },
  'in-progress': {
    color: 'bg-amber-500/15 text-amber-400',
    label: 'In Progress',
    icon: AlertTriangle,
  },
  done: {
    color: 'bg-emerald-500/15 text-emerald-400',
    label: 'Done',
    icon: CheckCircle,
  },
};

const ownerColors: Record<string, string> = {
  Ross: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Ty: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Andrew: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  James: 'bg-accent/15 text-accent border-accent/30',
  Timon: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Sahir: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
};

const categoryColors: Record<string, string> = {
  'BTC Alpha': 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  Hiring: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
  'Dynamic Alpha': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
  SMA: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  Capital: 'bg-green-500/10 text-green-400 border-green-500/25',
  Data: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  Governance: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
  'AI Edge': 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/25',
};

// ── Component ───────────────────────────────────────────────

export function TasksView() {
  const [tasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Counts
  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  // Filtered tasks
  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  // Sorted tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'owner':
        comparison = a.owner.localeCompare(b.owner);
        break;
      case 'priority':
        comparison = priorityConfig[a.priority].sort - priorityConfig[b.priority].sort;
        break;
      case 'deadline':
        comparison = a.deadline.localeCompare(b.deadline);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Kanban columns
  const kanbanColumns: { key: Task['status']; label: string }[] = [
    { key: 'todo', label: 'Todo' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'todo', label: 'Todo' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Task Commander
          </h1>
          <p className="mt-1.5 text-text-secondary text-sm leading-relaxed max-w-xl">
            90-day action plan execution. Every task has an owner, deadline, and definition of done.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
          <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-semibold">
            {counts.done}/{counts.all} completed
          </span>
        </div>
      </div>

      {/* ── Controls Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface border border-border rounded-xl p-4">
        {/* Left: Filter buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted mr-1" />
          {filterButtons.map((fb) => (
            <button
              key={fb.key}
              onClick={() => setFilter(fb.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                filter === fb.key
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'bg-surface-3 text-text-muted hover:text-text-secondary hover:bg-surface-2'
              }`}
            >
              {fb.label}
              <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold ${
                  filter === fb.key
                    ? 'bg-white/20 text-white'
                    : 'bg-surface text-text-muted'
                }`}
              >
                {counts[fb.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Right: View toggle + actions */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-surface-3 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === 'kanban'
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Add Task */}
          <button
            onClick={() => {
              alert('Add Task: This would open a task creation modal in a full implementation.');
              console.log('Add Task clicked');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-2 transition-all duration-200 active:scale-[0.97]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>

          {/* Export PDF */}
          <button
            onClick={() => {
              console.log('Export PDF clicked');
              alert('Export PDF: Would generate a PDF of the current task board.');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-surface-3 text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all duration-200 border border-border"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_100px_120px_90px_100px] gap-4 px-5 py-3 border-b border-border bg-surface-2/50 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            <div className="w-3" />
            <button
              onClick={() => handleSort('title')}
              className="flex items-center gap-1 hover:text-text-secondary transition-colors text-left"
            >
              Task
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort('owner')}
              className="flex items-center gap-1 hover:text-text-secondary transition-colors"
            >
              Owner
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort('category')}
              className="flex items-center gap-1 hover:text-text-secondary transition-colors"
            >
              Category
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort('deadline')}
              className="flex items-center gap-1 hover:text-text-secondary transition-colors"
            >
              Deadline
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <div>Status</div>
          </div>

          {/* Task rows */}
          <div className="divide-y divide-border/50">
            {sortedTasks.map((task, index) => {
              const pConf = priorityConfig[task.priority];
              const sConf = statusConfig[task.status];
              const StatusIcon = sConf.icon;

              return (
                <div
                  key={task.id}
                  className="grid grid-cols-[auto_1fr_100px_120px_90px_100px] gap-4 px-5 py-3.5 items-center hover:bg-surface-2/50 transition-colors duration-150 group animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Priority dot */}
                  <div className="flex items-center justify-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${pConf.color} shadow-sm`}
                      title={pConf.label}
                    />
                  </div>

                  {/* Title */}
                  <div className="min-w-0">
                    <p className={`text-sm font-medium leading-snug truncate ${
                      task.status === 'done'
                        ? 'text-text-muted line-through'
                        : 'text-text-primary'
                    }`}>
                      {task.title}
                    </p>
                  </div>

                  {/* Owner badge */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        ownerColors[task.owner] || 'bg-surface-3 text-text-muted border-border'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      {task.owner}
                    </span>
                  </div>

                  {/* Category tag */}
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        categoryColors[task.category] || 'bg-surface-3 text-text-muted border-border'
                      }`}
                    >
                      {task.category}
                    </span>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Calendar className="w-3 h-3" />
                    <span className="font-mono">{task.deadline}</span>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${sConf.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {sConf.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {sortedTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <CheckCircle className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No tasks match this filter</p>
              <p className="text-xs mt-1">Try selecting a different status filter</p>
            </div>
          )}
        </div>
      )}

      {/* ── Kanban View ── */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            const colConf = statusConfig[col.key];
            const ColIcon = colConf.icon;

            return (
              <div key={col.key} className="flex flex-col">
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <ColIcon className={`w-4 h-4 ${colConf.color.split(' ')[1]}`} />
                    <h3 className="text-sm font-semibold text-text-primary">
                      {col.label}
                    </h3>
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-surface-3 text-[11px] font-bold text-text-muted px-1.5">
                      {colTasks.length}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                </div>

                {/* Column body */}
                <div className="flex-1 bg-surface-2/30 border border-border/50 rounded-xl p-3 space-y-3 min-h-[200px]">
                  {colTasks.map((task, index) => {
                    const pConf = priorityConfig[task.priority];

                    return (
                      <div
                        key={task.id}
                        className="glow-card bg-surface border border-border rounded-xl p-4 hover:border-border-2 transition-all duration-200 cursor-pointer group animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Drag handle + priority */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-3.5 h-3.5 text-text-muted/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                            <div
                              className={`w-2 h-2 rounded-full ${pConf.color}`}
                              title={pConf.label}
                            />
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${pConf.text}`}>
                              {pConf.label}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <p className={`text-sm font-medium leading-snug mb-3 ${
                          task.status === 'done'
                            ? 'text-text-muted line-through'
                            : 'text-text-primary'
                        }`}>
                          {task.title}
                        </p>

                        {/* Meta row */}
                        <div className="flex items-center justify-between">
                          {/* Owner */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                              ownerColors[task.owner] || 'bg-surface-3 text-text-muted border-border'
                            }`}
                          >
                            <User className="w-3 h-3" />
                            {task.owner}
                          </span>

                          {/* Deadline */}
                          <span className="flex items-center gap-1 text-[10px] text-text-muted font-mono">
                            <Calendar className="w-3 h-3" />
                            {task.deadline}
                          </span>
                        </div>

                        {/* Category tag */}
                        <div className="mt-2.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                              categoryColors[task.category] || 'bg-surface-3 text-text-muted border-border'
                            }`}
                          >
                            {task.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty column */}
                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-text-muted/50">
                      <Plus className="w-6 h-6 mb-2" />
                      <p className="text-xs">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Summary Footer ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {(['critical', 'high', 'medium', 'low'] as const).map((p) => {
          const count = tasks.filter((t) => t.priority === p).length;
          const conf = priorityConfig[p];
          return (
            <div
              key={p}
              className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3"
            >
              <div className={`w-3 h-3 rounded-full ${conf.color}`} />
              <div>
                <p className="text-lg font-bold text-text-primary">{count}</p>
                <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">
                  {conf.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
