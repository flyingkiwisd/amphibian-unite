'use client';

import { useState, useRef } from 'react';
import { exportToPdf } from '@/lib/exportPdf';
import { memberIdToOwnerName } from '@/lib/data';
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
  X,
  Trash2,
  Edit3,
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

type FilterType = 'all' | 'mine' | 'todo' | 'in-progress' | 'done';
type ViewMode = 'list' | 'kanban';
type SortField = 'title' | 'owner' | 'priority' | 'deadline' | 'category';
type SortDirection = 'asc' | 'desc';

// ── Pre-populated tasks (90-day action plan) ───────────────

const initialTasks: Task[] = [
  { id: '1', title: 'Map all BTC yield sources (12 categories) with bps attribution', owner: 'Ross', status: 'in-progress', priority: 'critical', deadline: 'Mar 15', category: 'BTC Alpha' },
  { id: '2', title: 'Set BTC Alpha kill criteria (strategy-level)', owner: 'Ty', status: 'todo', priority: 'critical', deadline: 'Mar 20', category: 'BTC Alpha' },
  { id: '3', title: 'Clear plan: which strategies, which managers for BTC Alpha', owner: 'Andrew', status: 'in-progress', priority: 'critical', deadline: 'Mar 31', category: 'BTC Alpha' },
  { id: '4', title: 'Post COO job description and begin CTO search', owner: 'James', status: 'done', priority: 'critical', deadline: 'Mar 15', category: 'Hiring' },
  { id: '5', title: 'A9 audit: scope and timeline confirmed', owner: 'Ross', status: 'todo', priority: 'critical', deadline: 'Mar 31', category: 'Dynamic Alpha' },
  { id: '6', title: 'Dynamic Alpha: name + structure + sleeve architecture', owner: 'James', status: 'in-progress', priority: 'high', deadline: 'Mar 31', category: 'Dynamic Alpha' },
  { id: '7', title: 'Identify custodial/PB partners for SMA infrastructure', owner: 'Ross', status: 'todo', priority: 'high', deadline: 'Mar 31', category: 'SMA' },
  { id: '8', title: 'Close at least one GP capital commitment', owner: 'James', status: 'in-progress', priority: 'critical', deadline: 'Mar 31', category: 'Capital' },
  { id: '9', title: 'Execute BTC Alpha plan, track weekly', owner: 'Andrew', status: 'in-progress', priority: 'critical', deadline: 'Ongoing', category: 'BTC Alpha' },
  { id: '10', title: 'Dynamic Alpha: manager shortlist (A9 + 2 others per sleeve)', owner: 'Ross', status: 'todo', priority: 'high', deadline: 'Apr 15', category: 'Dynamic Alpha' },
  { id: '11', title: 'SMA infrastructure: legal/ops framework + PB evaluation', owner: 'Timon', status: 'todo', priority: 'high', deadline: 'Apr 15', category: 'SMA' },
  { id: '12', title: 'Strategy performance database: build for allocation analysis', owner: 'Sahir', status: 'in-progress', priority: 'medium', deadline: 'Apr 30', category: 'Data' },
  { id: '13', title: 'Governance: identify 2-3 independent board candidates', owner: 'James', status: 'todo', priority: 'medium', deadline: 'Apr 30', category: 'Governance' },
  { id: '14', title: 'Regime classifier v0.1: architecture + data sources defined', owner: 'Timon', status: 'todo', priority: 'high', deadline: 'Apr 30', category: 'AI Edge' },
];

// ── Helpers ─────────────────────────────────────────────────

const priorityConfig = {
  critical: { color: 'bg-red-500', text: 'text-red-400', label: 'Critical', sort: 0 },
  high: { color: 'bg-orange-500', text: 'text-orange-400', label: 'High', sort: 1 },
  medium: { color: 'bg-blue-500', text: 'text-blue-400', label: 'Medium', sort: 2 },
  low: { color: 'bg-gray-500', text: 'text-gray-400', label: 'Low', sort: 3 },
};

const statusConfig = {
  todo: { color: 'bg-gray-500/15 text-gray-400', label: 'Todo', icon: Clock },
  'in-progress': { color: 'bg-amber-500/15 text-amber-400', label: 'In Progress', icon: AlertTriangle },
  done: { color: 'bg-emerald-500/15 text-emerald-400', label: 'Done', icon: CheckCircle },
};

const statusCycle: Task['status'][] = ['todo', 'in-progress', 'done'];

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

const owners = ['James', 'Ross', 'Ty', 'Andrew', 'Timon', 'Sahir', 'Todd', 'Paola', 'Mark', 'David', 'Thao'];
const categories = ['BTC Alpha', 'Dynamic Alpha', 'SMA', 'Capital', 'Hiring', 'Data', 'Governance', 'AI Edge'];
const priorities: Task['priority'][] = ['critical', 'high', 'medium', 'low'];

// ── Task Modal ──────────────────────────────────────────────

function TaskModal({
  task,
  onSave,
  onClose,
}: {
  task: Task | null;
  onSave: (task: Task) => void;
  onClose: () => void;
}) {
  const isEdit = task !== null;
  const [title, setTitle] = useState(task?.title ?? '');
  const [owner, setOwner] = useState(task?.owner ?? 'James');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority ?? 'high');
  const [status, setStatus] = useState<Task['status']>(task?.status ?? 'todo');
  const [deadline, setDeadline] = useState(task?.deadline ?? '');
  const [category, setCategory] = useState(task?.category ?? categories[0]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      id: task?.id ?? `task-${Date.now()}`,
      title: title.trim(),
      owner,
      priority,
      status,
      deadline: deadline || 'TBD',
      category,
    });
  };

  const selectClass =
    'w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors appearance-none';
  const labelClass = 'block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>Task Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Owner */}
            <div>
              <label className={labelClass}>Owner</label>
              <select value={owner} onChange={(e) => setOwner(e.target.value)} className={selectClass}>
                {owners.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className={labelClass}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className={selectClass}>
                {priorities.map((p) => (
                  <option key={p} value={p}>{priorityConfig[p].label}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])} className={selectClass}>
                {statusCycle.map((s) => (
                  <option key={s} value={s}>{statusConfig[s].label}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className={labelClass}>Deadline</label>
            <input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="e.g. Mar 31, Apr 15, Ongoing"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Component ───────────────────────────────────────────────

export function TasksView({ currentUser }: { currentUser?: string }) {
  const ownerName = currentUser ? memberIdToOwnerName[currentUser] ?? '' : '';
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [modalTask, setModalTask] = useState<Task | null | 'new'>(null);
  const dragItem = useRef<string | null>(null);

  // Counts
  const counts = {
    all: tasks.length,
    mine: ownerName ? tasks.filter((t) => t.owner === ownerName).length : 0,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  // Filtered tasks
  const filteredTasks = filter === 'all'
    ? tasks
    : filter === 'mine'
      ? tasks.filter((t) => t.owner === ownerName)
      : tasks.filter((t) => t.status === filter);

  // Sorted tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'title': comparison = a.title.localeCompare(b.title); break;
      case 'owner': comparison = a.owner.localeCompare(b.owner); break;
      case 'priority': comparison = priorityConfig[a.priority].sort - priorityConfig[b.priority].sort; break;
      case 'deadline': comparison = a.deadline.localeCompare(b.deadline); break;
      case 'category': comparison = a.category.localeCompare(b.category); break;
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

  // CRUD handlers
  const cycleStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const idx = statusCycle.indexOf(t.status);
        return { ...t, status: statusCycle[(idx + 1) % statusCycle.length] };
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const saveTask = (task: Task) => {
    setTasks((prev) => {
      const existing = prev.find((t) => t.id === task.id);
      if (existing) {
        return prev.map((t) => (t.id === task.id ? task : t));
      }
      return [...prev, task];
    });
    setModalTask(null);
  };

  // Drag handlers for kanban
  const handleDragStart = (taskId: string) => {
    dragItem.current = taskId;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetStatus: Task['status']) => {
    if (!dragItem.current) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === dragItem.current ? { ...t, status: targetStatus } : t))
    );
    dragItem.current = null;
  };

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    ...(ownerName ? [{ key: 'mine' as FilterType, label: 'My Tasks' }] : []),
    { key: 'todo', label: 'Todo' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ];

  return (
    <div id="tasks-view-content" className="space-y-6 animate-fade-in">
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
                  filter === fb.key ? 'bg-white/20 text-white' : 'bg-surface text-text-muted'
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
                viewMode === 'list' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === 'kanban' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Add Task */}
          <button
            onClick={() => setModalTask('new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-2 transition-all duration-200 active:scale-[0.97]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>

          {/* Export PDF */}
          <button
            onClick={() => exportToPdf('tasks-view-content', 'amphibian-unite-tasks')}
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
          <div className="grid grid-cols-[auto_1fr_100px_120px_90px_100px_60px] gap-4 px-5 py-3 border-b border-border bg-surface-2/50 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            <div className="w-3" />
            <button onClick={() => handleSort('title')} className="flex items-center gap-1 hover:text-text-secondary transition-colors text-left">
              Task <ArrowUpDown className="w-3 h-3" />
            </button>
            <button onClick={() => handleSort('owner')} className="flex items-center gap-1 hover:text-text-secondary transition-colors">
              Owner <ArrowUpDown className="w-3 h-3" />
            </button>
            <button onClick={() => handleSort('category')} className="flex items-center gap-1 hover:text-text-secondary transition-colors">
              Category <ArrowUpDown className="w-3 h-3" />
            </button>
            <button onClick={() => handleSort('deadline')} className="flex items-center gap-1 hover:text-text-secondary transition-colors">
              Deadline <ArrowUpDown className="w-3 h-3" />
            </button>
            <div>Status</div>
            <div />
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
                  className="grid grid-cols-[auto_1fr_100px_120px_90px_100px_60px] gap-4 px-5 py-3.5 items-center hover:bg-surface-2/50 transition-colors duration-150 group animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Priority dot */}
                  <div className="flex items-center justify-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${pConf.color} shadow-sm`} title={pConf.label} />
                  </div>

                  {/* Title */}
                  <div className="min-w-0">
                    <p className={`text-sm font-medium leading-snug truncate ${
                      task.status === 'done' ? 'text-text-muted line-through' : 'text-text-primary'
                    }`}>
                      {task.title}
                    </p>
                  </div>

                  {/* Owner badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${ownerColors[task.owner] || 'bg-surface-3 text-text-muted border-border'}`}>
                      <User className="w-3 h-3" />
                      {task.owner}
                    </span>
                  </div>

                  {/* Category tag */}
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${categoryColors[task.category] || 'bg-surface-3 text-text-muted border-border'}`}>
                      {task.category}
                    </span>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Calendar className="w-3 h-3" />
                    <span className="font-mono">{task.deadline}</span>
                  </div>

                  {/* Status badge (clickable to cycle) */}
                  <div>
                    <button
                      onClick={() => cycleStatus(task.id)}
                      title="Click to change status"
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${sConf.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {sConf.label}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModalTask(task)}
                      title="Edit task"
                      className="p-1 rounded hover:bg-surface-2 text-text-muted hover:text-accent transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                      className="p-1 rounded hover:bg-surface-2 text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                    <h3 className="text-sm font-semibold text-text-primary">{col.label}</h3>
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-surface-3 text-[11px] font-bold text-text-muted px-1.5">
                      {colTasks.length}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                </div>

                {/* Column body (drop zone) */}
                <div
                  className="flex-1 bg-surface-2/30 border border-border/50 rounded-xl p-3 space-y-3 min-h-[200px] transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(col.key)}
                >
                  {colTasks.map((task, index) => {
                    const pConf = priorityConfig[task.priority];

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className="glow-card bg-surface border border-border rounded-xl p-4 hover:border-border-2 transition-all duration-200 cursor-grab active:cursor-grabbing group animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Header row: drag handle + priority + actions */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-3.5 h-3.5 text-text-muted/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className={`w-2 h-2 rounded-full ${pConf.color}`} title={pConf.label} />
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${pConf.text}`}>
                              {pConf.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setModalTask(task)}
                              className="p-1 rounded hover:bg-surface-2 text-text-muted hover:text-accent transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 rounded hover:bg-surface-2 text-text-muted hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <p className={`text-sm font-medium leading-snug mb-3 ${
                          task.status === 'done' ? 'text-text-muted line-through' : 'text-text-primary'
                        }`}>
                          {task.title}
                        </p>

                        {/* Meta row */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${ownerColors[task.owner] || 'bg-surface-3 text-text-muted border-border'}`}>
                            <User className="w-3 h-3" />
                            {task.owner}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-text-muted font-mono">
                            <Calendar className="w-3 h-3" />
                            {task.deadline}
                          </span>
                        </div>

                        {/* Category tag */}
                        <div className="mt-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border ${categoryColors[task.category] || 'bg-surface-3 text-text-muted border-border'}`}>
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
                      <p className="text-xs">Drop tasks here</p>
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
            <div key={p} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${conf.color}`} />
              <div>
                <p className="text-lg font-bold text-text-primary">{count}</p>
                <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">{conf.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Task Modal ── */}
      {modalTask !== null && (
        <TaskModal
          task={modalTask === 'new' ? null : modalTask}
          onSave={saveTask}
          onClose={() => setModalTask(null)}
        />
      )}
    </div>
  );
}
