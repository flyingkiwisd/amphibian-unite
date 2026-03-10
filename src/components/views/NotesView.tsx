'use client';

import { useState, useMemo } from 'react';
import { memberIdToOwnerName } from '@/lib/data';
import {
  StickyNote,
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Save,
  Tag,
  Clock,
  Cloud,
  Edit3,
  X,
  Filter,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

// ── Pre-populated Notes ────────────────────────────────────

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Weekly Top 3 - March 10',
    content:
      '1. Close GP capital commitment (Todd + James)\n2. BTC Alpha yield mapping completion (Ross)\n3. COO interview shortlist finalized',
    tags: ['priorities', 'weekly'],
    author: 'James',
    createdAt: '2026-03-09T08:00:00Z',
    updatedAt: '2026-03-09T08:00:00Z',
    pinned: true,
  },
  {
    id: '2',
    title: 'LP Call Notes - Carson Group',
    content:
      'Met with Carson Group CIO. Interested in BTC Alpha if we can show 6-month track at 20bps+. Follow up in April with updated numbers. Key concern: counterparty risk post-FTX.',
    tags: ['LP', 'sales'],
    author: 'Todd',
    createdAt: '2026-03-07T14:30:00Z',
    updatedAt: '2026-03-07T15:10:00Z',
    pinned: false,
  },
  {
    id: '3',
    title: 'AI Quant Architecture Ideas',
    content:
      'A9 as core (40-50%), need 3-4 additional sleeves:\n- Statistical Arbitrage (cross-exchange)\n- Volatility & Derivatives (options desks)\n- Trend-Following (Seneca-style)\n- Carry & Basis (funding rate)\n\nKey question: SMA infrastructure timeline blocking this.',
    tags: ['product', 'ai-quant'],
    author: 'James',
    createdAt: '2026-03-05T10:00:00Z',
    updatedAt: '2026-03-06T09:45:00Z',
    pinned: false,
  },
  {
    id: '4',
    title: 'COO Requirements - Non-Negotiables',
    content:
      'Must have:\n- Fund ops experience $200M+ AUM\n- Crypto/digital asset background\n- Can pass 30-day run-without-James test\n- Strong project management\n- Legal/compliance awareness\n\nNice to have: offshore entity experience, LP reporting background',
    tags: ['hiring', 'coo'],
    author: 'James',
    createdAt: '2026-03-03T11:00:00Z',
    updatedAt: '2026-03-04T16:20:00Z',
    pinned: false,
  },
  {
    id: '5',
    title: 'Edge Rating Improvement Plan',
    content:
      'Current: 5.1/10. Target: 7.0 by Dec 2026.\n\nPath:\n1. BTC Alpha hitting 20bps consistently (+0.5)\n2. A9 audit clean (+0.5)\n3. COO hired, 30-day test passed (+0.3)\n4. SMA infrastructure live (+0.3)\n5. Regime classifier v0.1 (+0.3)\n\nTotal: +1.9 → 7.0',
    tags: ['strategy', 'edge'],
    author: 'Ross',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-02T13:30:00Z',
    pinned: false,
  },
];

// ── Tag Color Map ──────────────────────────────────────────

const tagColors: Record<string, string> = {
  priorities: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  weekly: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  LP: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  sales: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  product: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'ai-quant': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  hiring: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  coo: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  strategy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  edge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

const getTagColor = (tag: string) =>
  tagColors[tag] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';

// ── Helpers ────────────────────────────────────────────────

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── Component ──────────────────────────────────────────────

export function NotesView({ currentUser }: { currentUser?: string }) {
  const ownerName = currentUser ? memberIdToOwnerName[currentUser] ?? '' : '';
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [showMyNotes, setShowMyNotes] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);

  // Editing state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  // New note state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // ── Derived data ──

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [notes]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // My Notes filter
    if (showMyNotes && ownerName) {
      result = result.filter((n) => n.author === ownerName);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Tag filter
    if (activeTagFilter) {
      result = result.filter((n) => n.tags.includes(activeTagFilter));
    }

    // Sort: pinned first, then by updatedAt desc
    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [notes, search, activeTagFilter, showMyNotes, ownerName]);

  // ── Handlers ──

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(', '));
  };

  const handleStartEditing = () => {
    if (!selectedNote) return;
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setEditTags(selectedNote.tags.join(', '));
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedNote) return;
    const updatedTags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNote.id
          ? {
              ...n,
              title: editTitle,
              content: editContent,
              tags: updatedTags,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!selectedNote) return;
    setNotes((prev) => prev.filter((n) => n.id !== selectedNote.id));
    setSelectedNoteId(null);
    setIsEditing(false);
  };

  const handleTogglePin = () => {
    if (!selectedNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNote.id
          ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  const handleCreateNote = () => {
    if (!newTitle.trim()) return;
    const tags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const now = new Date().toISOString();
    const note: Note = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      tags,
      author: ownerName || 'Unknown',
      createdAt: now,
      updatedAt: now,
      pinned: false,
    };
    setNotes((prev) => [note, ...prev]);
    setSelectedNoteId(note.id);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setShowNewNote(false);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(', '));
  };

  // ── Render ──

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <StickyNote className="w-7 h-7 text-accent" />
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              Personal Notes
            </h1>
          </div>
          <p className="text-text-secondary text-sm mt-1 max-w-xl">
            Your second brain. Syncs with Claude via API. Tag, search, and organize your thinking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* API Sync Badge */}
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
            <Cloud className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-mono text-text-muted">
              GET/POST /api/notes?userId=james
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded px-1.5 py-0.5">
              API Sync
            </span>
          </div>

          {/* New Note Button */}
          <button
            onClick={() => setShowNewNote(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </div>

      {/* ── New Note Modal / Inline ── */}
      {showNewNote && (
        <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-accent" />
              New Note
            </h3>
            <button
              onClick={() => setShowNewNote(false)}
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Content
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your note..."
                rows={10}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted font-mono text-sm leading-relaxed focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Tags (comma-separated)
              </label>
              <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-4 py-2.5">
                <Tag className="w-4 h-4 text-text-muted flex-shrink-0" />
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. strategy, weekly, product"
                  className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCreateNote}
                disabled={!newTitle.trim()}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Two-Panel Layout ── */}
      <div className="flex gap-0 rounded-xl overflow-hidden border border-border bg-surface" style={{ minHeight: '600px' }}>
        {/* ── Left Panel: Note List (1/3) ── */}
        <div className="w-1/3 border-r border-border flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted text-sm focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-text-muted hover:text-text-secondary"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* My Notes Filter */}
          {ownerName && (
            <div className="px-3 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-text-muted" />
                <button
                  onClick={() => setShowMyNotes(false)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 ${
                    !showMyNotes
                      ? 'bg-accent text-white shadow-sm shadow-accent/20'
                      : 'bg-surface-2 text-text-muted hover:text-text-secondary'
                  }`}
                >
                  All Notes
                </button>
                <button
                  onClick={() => setShowMyNotes(true)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 ${
                    showMyNotes
                      ? 'bg-accent text-white shadow-sm shadow-accent/20'
                      : 'bg-surface-2 text-text-muted hover:text-text-secondary'
                  }`}
                >
                  My Notes
                  <span
                    className={`ml-1.5 inline-flex items-center justify-center min-w-[16px] h-[16px] rounded-full text-[10px] font-bold ${
                      showMyNotes ? 'bg-white/20 text-white' : 'bg-surface text-text-muted'
                    }`}
                  >
                    {notes.filter((n) => n.author === ownerName).length}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Tag Filters */}
          <div className="px-3 py-2 border-b border-border">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveTagFilter(null)}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                  activeTagFilter === null
                    ? 'bg-accent/20 text-accent border-accent/40'
                    : 'bg-surface-2 text-text-muted border-border hover:text-text-secondary'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setActiveTagFilter(activeTagFilter === tag ? null : tag)
                  }
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                    activeTagFilter === tag
                      ? getTagColor(tag)
                      : 'bg-surface-2 text-text-muted border-border hover:text-text-secondary'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-text-muted px-4">
                <StickyNote className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No notes found</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 transition-all duration-150 hover:bg-surface-2 ${
                    selectedNoteId === note.id
                      ? 'bg-surface-2 border-l-2 border-l-accent'
                      : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium text-text-primary truncate flex-1">
                      {note.title}
                    </h4>
                    {note.pinned && (
                      <Pin className="w-3.5 h-3.5 text-accent flex-shrink-0 fill-accent" />
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate mb-1.5">
                    {note.content.split('\n')[0]}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-[10px] text-text-muted">
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-text-muted flex-shrink-0">
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Right Panel: Note Editor / Viewer (2/3) ── */}
        <div className="w-2/3 flex flex-col bg-surface-2/30">
          {selectedNote ? (
            <>
              {/* Editor Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <Edit3 className="w-5 h-5 text-accent" />
                  ) : (
                    <StickyNote className="w-5 h-5 text-text-muted" />
                  )}
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    {isEditing ? 'Editing' : 'Viewing'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <button
                      onClick={handleStartEditing}
                      className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-accent bg-surface border border-border rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={handleTogglePin}
                    className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-accent bg-surface border border-border rounded-lg px-3 py-1.5 transition-colors"
                  >
                    {selectedNote.pinned ? (
                      <>
                        <PinOff className="w-3.5 h-3.5" />
                        Unpin
                      </>
                    ) : (
                      <>
                        <Pin className="w-3.5 h-3.5" />
                        Pin
                      </>
                    )}
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-surface border border-border rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Editor Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Title */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-xl font-bold text-text-primary focus:outline-none focus:border-accent transition-colors"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-text-primary">
                    {selectedNote.title}
                  </h2>
                )}

                {/* Timestamps */}
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Created: {formatDate(selectedNote.createdAt)}{' '}
                    {formatTime(selectedNote.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Updated: {formatDate(selectedNote.updatedAt)}{' '}
                    {formatTime(selectedNote.updatedAt)}
                  </span>
                </div>

                {/* Tags */}
                {isEditing ? (
                  <div>
                    <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                      Tags (comma-separated)
                    </label>
                    <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-4 py-2.5">
                      <Tag className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <input
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        className="flex-1 bg-transparent text-text-primary text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-text-muted" />
                    {selectedNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content */}
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={16}
                    className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary font-mono text-sm leading-relaxed focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                ) : (
                  <div className="bg-surface-2 border border-border rounded-lg px-5 py-4">
                    <pre className="font-mono text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {selectedNote.content}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
              <StickyNote className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-lg font-medium text-text-secondary mb-1">
                No note selected
              </p>
              <p className="text-sm">
                Select a note or create a new one
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
