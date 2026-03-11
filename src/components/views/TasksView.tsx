'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { exportToPdf } from '@/lib/exportPdf';
import { memberIdToOwnerName } from '@/lib/data';

const TASKS_LS_KEY = 'amphibian-tasks';
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
  ChevronLeft,
  ChevronRight,
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
type DateFilterType = 'all' | 'overdue' | 'this-week' | 'this-month' | 'specific';

interface DateFilter {
  type: DateFilterType;
  date?: Date; // only used when type === 'specific'
  label: string;
}

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

const MONTH_ABBRS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Convert deadline strings like "Mar 15", "Apr 30" to Date objects (year 2026). Returns null for "Ongoing", "TBD", etc. */
function parseDeadlineDate(deadline: string): Date | null {
  const parts = deadline.trim().split(/\s+/);
  if (parts.length !== 2) return null;
  const monthIdx = MONTH_ABBRS[parts[0]];
  const day = parseInt(parts[1], 10);
  if (monthIdx === undefined || isNaN(day)) return null;
  return new Date(2026, monthIdx, day);
}

/** Check if two dates are the same calendar day */
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Get start of week (Sunday) for a given date */
function getStartOfWeek(d: Date): Date {
  const result = new Date(d);
  result.setDate(result.getDate() - result.getDay());
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Get end of week (Saturday) for a given date */
function getEndOfWeek(d: Date): Date {
  const result = getStartOfWeek(d);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/** Format a Date as a short label like "Mar 15, 2026" */
function formatDateLabel(d: Date): string {
  const abbr = Object.entries(MONTH_ABBRS).find(([, v]) => v === d.getMonth())?.[0] ?? '';
  return `${abbr} ${d.getDate()}, ${d.getFullYear()}`;
}

// ── Calendar Dropdown ───────────────────────────────────────

function CalendarDropdown({
  tasks,
  dateFilter,
  onDateFilterChange,
  onClose,
}: {
  tasks: Task[];
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  onClose: () => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Collect all task deadline dates for dot indicators
  const deadlineDates = new Set<string>();
  tasks.forEach((t) => {
    const d = parseDeadlineDate(t.deadline);
    if (d) deadlineDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });

  const hasDeadline = (year: number, month: number, day: number) =>
    deadlineDates.has(`${year}-${month}-${day}`);

  // Build calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    calendarDays.push({ day: daysInPrevMonth - i, month: prevMonth, year: prevYear, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
  }

  // Next month leading days to fill 6 rows
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarDays.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
  }

  const navigateMonth = (delta: number) => {
    let newMonth = viewMonth + delta;
    let newYear = viewYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const handleDayClick = (day: number, month: number, year: number) => {
    const selectedDate = new Date(year, month, day);
    selectedDate.setHours(0, 0, 0, 0);
    onDateFilterChange({ type: 'specific', date: selectedDate, label: formatDateLabel(selectedDate) });
    onClose();
  };

  const handleQuickFilter = (type: DateFilterType) => {
    switch (type) {
      case 'all':
        onDateFilterChange({ type: 'all', label: 'All Dates' });
        break;
      case 'overdue':
        onDateFilterChange({ type: 'overdue', label: 'Overdue' });
        break;
      case 'this-week':
        onDateFilterChange({ type: 'this-week', label: 'This Week' });
        break;
      case 'this-month':
        onDateFilterChange({ type: 'this-month', label: 'This Month' });
        break;
    }
    onClose();
  };

  const isSelected = (day: number, month: number, year: number) => {
    if (dateFilter.type !== 'specific' || !dateFilter.date) return false;
    return dateFilter.date.getFullYear() === year && dateFilter.date.getMonth() === month && dateFilter.date.getDate() === day;
  };

  const isToday = (day: number, month: number, year: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 z-50 w-[300px] bg-surface border border-border rounded-xl shadow-2xl shadow-black/30 animate-fade-in overflow-hidden"
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-text-primary">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={() => navigateMonth(1)}
          className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 px-3 pt-3 pb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 px-3 pb-3">
        {calendarDays.map((cd, idx) => {
          const dayIsToday = isToday(cd.day, cd.month, cd.year);
          const dayIsSelected = isSelected(cd.day, cd.month, cd.year);
          const dayHasDeadline = hasDeadline(cd.year, cd.month, cd.day);

          return (
            <button
              key={idx}
              onClick={() => handleDayClick(cd.day, cd.month, cd.year)}
              className={`
                relative flex flex-col items-center justify-center h-9 rounded-lg text-xs font-medium transition-all duration-150
                ${!cd.isCurrentMonth ? 'text-text-muted/30' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'}
                ${dayIsToday ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30' : ''}
                ${dayIsSelected ? 'bg-accent text-white font-bold shadow-lg shadow-accent/20 ring-0' : ''}
              `}
            >
              {cd.day}
              {dayHasDeadline && cd.isCurrentMonth && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${dayIsSelected ? 'bg-white' : 'bg-accent'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick filters */}
      <div className="border-t border-border px-3 py-2.5 flex flex-wrap gap-1.5">
        {([
          { type: 'all' as DateFilterType, label: 'All Dates' },
          { type: 'overdue' as DateFilterType, label: 'Overdue' },
          { type: 'this-week' as DateFilterType, label: 'This Week' },
          { type: 'this-month' as DateFilterType, label: 'This Month' },
        ]).map((qf) => (
          <button
            key={qf.type}
            onClick={() => handleQuickFilter(qf.type)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
              dateFilter.type === qf.type
                ? 'bg-accent text-white shadow-sm shadow-accent/20'
                : 'bg-surface-3 text-text-muted hover:text-text-secondary hover:bg-surface-2'
            }`}
          >
            {qf.label}
          </button>
        ))}
      </div>
    </div>
  );
}

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
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return initialTasks;
    try {
      const stored = localStorage.getItem(TASKS_LS_KEY);
      if (stored) return JSON.parse(stored) as Task[];
    } catch { /* ignore */ }
    return initialTasks;
  });

  // Persist tasks to localStorage on every change
  useEffect(() => {
    localStorage.setItem(TASKS_LS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [modalTask, setModalTask] = useState<Task | null | 'new'>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'all', label: 'All Dates' });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarBtnRef = useRef<HTMLDivElement>(null);
  const dragItem = useRef<string | null>(null);

  const handleDateFilterChange = useCallback((newFilter: DateFilter) => {
    setDateFilter(newFilter);
  }, []);

  // Counts
  const counts = {
    all: tasks.length,
    mine: ownerName ? tasks.filter((t) => t.owner === ownerName).length : 0,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  // Filtered tasks (status filter)
  const statusFiltered = filter === 'all'
    ? tasks
    : filter === 'mine'
      ? tasks.filter((t) => t.owner === ownerName)
      : tasks.filter((t) => t.status === filter);

  // Date filter
  const filteredTasks = dateFilter.type === 'all'
    ? statusFiltered
    : statusFiltered.filter((t) => {
        const taskDate = parseDeadlineDate(t.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateFilter.type) {
          case 'specific': {
            if (!taskDate || !dateFilter.date) return false;
            return isSameDay(taskDate, dateFilter.date);
          }
          case 'overdue': {
            if (!taskDate) return false;
            return taskDate < today && t.status !== 'done';
          }
          case 'this-week': {
            if (!taskDate) return false;
            const weekStart = getStartOfWeek(today);
            const weekEnd = getEndOfWeek(today);
            return taskDate >= weekStart && taskDate <= weekEnd;
          }
          case 'this-month': {
            if (!taskDate) return false;
            return taskDate.getFullYear() === today.getFullYear() && taskDate.getMonth() === today.getMonth();
          }
          default:
            return true;
        }
      });

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

          {/* Calendar date filter */}
          <div ref={calendarBtnRef} className="relative">
            <button
              onClick={() => setCalendarOpen((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                calendarOpen || dateFilter.type !== 'all'
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'bg-surface-3 text-text-muted hover:text-text-secondary hover:bg-surface-2 border-border'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Dates
              {dateFilter.type !== 'all' && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
            {calendarOpen && (
              <CalendarDropdown
                tasks={tasks}
                dateFilter={dateFilter}
                onDateFilterChange={handleDateFilterChange}
                onClose={() => setCalendarOpen(false)}
              />
            )}
          </div>

          {/* Active date filter chip */}
          {dateFilter.type !== 'all' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-accent/10 text-accent border border-accent/20">
              <Calendar className="w-3 h-3" />
              {dateFilter.label}
              <button
                onClick={() => setDateFilter({ type: 'all', label: 'All Dates' })}
                className="ml-0.5 p-0.5 rounded hover:bg-accent/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

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
