import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ── Types ─────────────────────────────────────────────────────

interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ── In-memory note store (Map<userId, Note[]>) ──────────────

let nextNoteId = 1;
const notesStore = new Map<string, Note[]>();

// Seed with example notes so the API isn't empty on first use
notesStore.set('james', [
  {
    id: 'note-0',
    userId: 'james',
    title: 'Q2 2026 Priority Stack',
    content: 'Top 3: (1) BTC Alpha hit 20 bps/month, (2) Hire COO, (3) Dynamic Alpha structure finalized. Stop list: no new products until these land.',
    tags: ['priorities', 'q2', 'strategy'],
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
]);

// ── GET: Retrieve notes for a user ───────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tag = searchParams.get('tag');
    const noteId = searchParams.get('id');

    if (!userId) {
      // Return all notes across all users
      const allNotes: Note[] = [];
      notesStore.forEach((notes) => allNotes.push(...notes));

      return NextResponse.json(
        { data: allNotes, count: allNotes.length, timestamp: new Date().toISOString() },
        { headers: corsHeaders }
      );
    }

    const userNotes = notesStore.get(userId) || [];

    if (noteId) {
      const note = userNotes.find(n => n.id === noteId);
      if (!note) {
        return NextResponse.json(
          { error: 'Note not found', timestamp: new Date().toISOString() },
          { status: 404, headers: corsHeaders }
        );
      }
      return NextResponse.json(
        { data: note, count: 1, timestamp: new Date().toISOString() },
        { headers: corsHeaders }
      );
    }

    let result = [...userNotes];

    if (tag) {
      result = result.filter(n => n.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }

    return NextResponse.json(
      { data: result, count: result.length, timestamp: new Date().toISOString() },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', timestamp: new Date().toISOString() },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ── POST: Create a new note ──────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, content, tags } = body;

    if (!userId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, content', timestamp: new Date().toISOString() },
        { status: 400, headers: corsHeaders }
      );
    }

    const now = new Date().toISOString();
    const newNote: Note = {
      id: `note-${nextNoteId++}`,
      userId,
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      createdAt: now,
      updatedAt: now,
    };

    const existing = notesStore.get(userId) || [];
    existing.push(newNote);
    notesStore.set(userId, existing);

    return NextResponse.json(
      { data: newNote, count: 1, timestamp: new Date().toISOString() },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body', timestamp: new Date().toISOString() },
      { status: 400, headers: corsHeaders }
    );
  }
}
