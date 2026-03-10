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

interface Decision {
  id: string;
  title: string;
  description: string;
  decidedBy: string;
  rationale: string;
  affected: string[];
  date: string;
  createdAt: string;
}

// ── In-memory decision log ───────────────────────────────────

let nextDecisionId = 3;

const decisions: Decision[] = [
  {
    id: 'dec-1',
    title: 'BTC Alpha: 20 bps/month target as go/no-go gate',
    description: 'BTC Alpha must demonstrate consistent 20 bps/month before scaling AUM. If not achieved by end of Q2 2026, evaluate kill or pivot.',
    decidedBy: 'James',
    rationale: 'Capital preservation and LP trust require clear performance gates before scaling. 20 bps/month represents the minimum viable edge.',
    affected: ['Ty', 'Ross', 'Andrew'],
    date: '2026-03-01',
    createdAt: '2026-03-01T12:00:00.000Z',
  },
  {
    id: 'dec-2',
    title: 'COO hire prioritized before CTO',
    description: 'COO search begins immediately with target close by June 2026. CTO search begins in parallel but hire target is Q3 2026.',
    decidedBy: 'James',
    rationale: 'Daily operations load on CEO is the biggest bottleneck to strategic work. COO frees James to focus on vision, capital raising, and edge definition.',
    affected: ['James', 'Thao', 'Andrew'],
    date: '2026-03-05',
    createdAt: '2026-03-05T09:00:00.000Z',
  },
];

// ── GET: List decisions with optional filters ────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const owner = searchParams.get('owner');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    let result = [...decisions];

    if (id) {
      const decision = result.find(d => d.id === id);
      if (!decision) {
        return NextResponse.json(
          { error: 'Decision not found', timestamp: new Date().toISOString() },
          { status: 404, headers: corsHeaders }
        );
      }
      return NextResponse.json(
        { data: decision, count: 1, timestamp: new Date().toISOString() },
        { headers: corsHeaders }
      );
    }

    if (owner) {
      result = result.filter(d => d.decidedBy.toLowerCase() === owner.toLowerCase());
    }

    if (dateFrom) {
      result = result.filter(d => d.date >= dateFrom);
    }

    if (dateTo) {
      result = result.filter(d => d.date <= dateTo);
    }

    // Sort by date descending (most recent first)
    result.sort((a, b) => b.date.localeCompare(a.date));

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

// ── POST: Create a new decision ──────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, decidedBy, rationale, affected, date } = body;

    if (!title || !decidedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: title, decidedBy', timestamp: new Date().toISOString() },
        { status: 400, headers: corsHeaders }
      );
    }

    const newDecision: Decision = {
      id: `dec-${nextDecisionId++}`,
      title,
      description: description || '',
      decidedBy,
      rationale: rationale || '',
      affected: Array.isArray(affected) ? affected : [],
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    decisions.push(newDecision);

    return NextResponse.json(
      { data: newDecision, count: 1, timestamp: new Date().toISOString() },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body', timestamp: new Date().toISOString() },
      { status: 400, headers: corsHeaders }
    );
  }
}
