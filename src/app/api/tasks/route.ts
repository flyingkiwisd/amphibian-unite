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

interface Task {
  id: string;
  title: string;
  owner: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline: string;
  category: string;
  createdAt: string;
}

// ── In-memory task store (seeded with 90-day action plan) ────

let nextId = 15;

const tasks: Task[] = [
  {
    id: '1',
    title: 'Map all BTC yield sources (12 categories) with bps attribution',
    owner: 'Ross',
    status: 'in-progress',
    priority: 'critical',
    deadline: 'Mar 15',
    category: 'BTC Alpha',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Set BTC Alpha kill criteria (strategy-level)',
    owner: 'Ty',
    status: 'todo',
    priority: 'critical',
    deadline: 'Mar 20',
    category: 'BTC Alpha',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'Clear plan: which strategies, which managers for BTC Alpha',
    owner: 'Andrew',
    status: 'in-progress',
    priority: 'critical',
    deadline: 'Mar 31',
    category: 'BTC Alpha',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '4',
    title: 'Post COO job description and begin CTO search',
    owner: 'James',
    status: 'done',
    priority: 'critical',
    deadline: 'Mar 15',
    category: 'Hiring',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '5',
    title: 'A9 audit: scope and timeline confirmed',
    owner: 'Ross',
    status: 'todo',
    priority: 'critical',
    deadline: 'Mar 31',
    category: 'Dynamic Alpha',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '6',
    title: 'Dynamic Alpha: name + structure + sleeve architecture',
    owner: 'James',
    status: 'in-progress',
    priority: 'high',
    deadline: 'Mar 31',
    category: 'Dynamic Alpha',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '7',
    title: 'Identify custodial/PB partners for SMA infrastructure',
    owner: 'Ross',
    status: 'todo',
    priority: 'high',
    deadline: 'Mar 31',
    category: 'SMA',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '8',
    title: 'Close at least one GP capital commitment',
    owner: 'James',
    status: 'in-progress',
    priority: 'critical',
    deadline: 'Mar 31',
    category: 'Capital',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '9',
    title: 'Execute BTC Alpha plan, track weekly',
    owner: 'Andrew',
    status: 'in-progress',
    priority: 'critical',
    deadline: 'Ongoing',
    category: 'BTC Alpha',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '10',
    title: 'Dynamic Alpha: manager shortlist (A9 + 2 others per sleeve)',
    owner: 'Ross',
    status: 'todo',
    priority: 'high',
    deadline: 'Apr 15',
    category: 'Dynamic Alpha',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '11',
    title: 'SMA infrastructure: legal/ops framework + PB evaluation',
    owner: 'Timon',
    status: 'todo',
    priority: 'high',
    deadline: 'Apr 15',
    category: 'SMA',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '12',
    title: 'Strategy performance database: build for allocation analysis',
    owner: 'Sahir',
    status: 'in-progress',
    priority: 'medium',
    deadline: 'Apr 30',
    category: 'Data',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '13',
    title: 'Governance: identify 2-3 independent board candidates',
    owner: 'James',
    status: 'todo',
    priority: 'medium',
    deadline: 'Apr 30',
    category: 'Governance',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '14',
    title: 'Regime classifier v0.1: architecture + data sources defined',
    owner: 'Timon',
    status: 'todo',
    priority: 'high',
    deadline: 'Apr 30',
    category: 'AI Edge',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
];

// ── GET: List tasks with optional filters ────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const owner = searchParams.get('owner');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    let result = [...tasks];

    if (id) {
      const task = result.find(t => t.id === id);
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found', timestamp: new Date().toISOString() },
          { status: 404, headers: corsHeaders }
        );
      }
      return NextResponse.json(
        { data: task, count: 1, timestamp: new Date().toISOString() },
        { headers: corsHeaders }
      );
    }

    if (status) {
      result = result.filter(t => t.status === status);
    }
    if (owner) {
      result = result.filter(t => t.owner.toLowerCase() === owner.toLowerCase());
    }
    if (priority) {
      result = result.filter(t => t.priority === priority);
    }
    if (category) {
      result = result.filter(t => t.category.toLowerCase() === category.toLowerCase());
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

// ── POST: Create a new task ──────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, owner, priority, deadline, category, status: taskStatus } = body;

    if (!title || !owner) {
      return NextResponse.json(
        { error: 'Missing required fields: title, owner', timestamp: new Date().toISOString() },
        { status: 400, headers: corsHeaders }
      );
    }

    const validPriorities = ['critical', 'high', 'medium', 'low'];
    const validStatuses = ['todo', 'in-progress', 'done'];

    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`, timestamp: new Date().toISOString() },
        { status: 400, headers: corsHeaders }
      );
    }

    if (taskStatus && !validStatuses.includes(taskStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`, timestamp: new Date().toISOString() },
        { status: 400, headers: corsHeaders }
      );
    }

    const newTask: Task = {
      id: String(nextId++),
      title,
      owner,
      status: taskStatus || 'todo',
      priority: priority || 'medium',
      deadline: deadline || 'TBD',
      category: category || 'General',
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);

    return NextResponse.json(
      { data: newTask, count: 1, timestamp: new Date().toISOString() },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body', timestamp: new Date().toISOString() },
      { status: 400, headers: corsHeaders }
    );
  }
}
