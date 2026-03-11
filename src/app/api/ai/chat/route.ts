import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatRequest {
  message: string;
  memberId: string;
  context: {
    name?: string;
    role?: string;
    kpis?: string[];
    ownership?: string[];
    okrs?: string[];
    priorities?: string[];
    weeklyGoals?: string[];
    monthlyGoals?: string[];
    mood?: string;
    energy?: number;
    wins?: string[];
    reflections?: string[];
    gratitude?: string;
    notes?: string;
    dailyPromptResponse?: string;
    morningChecklist?: string[];
    commitments?: string[];
    decisionFilter?: string[];
    mantra?: string;
    decisionTitle?: string;
    decisionDescription?: string;
    decisionRationale?: string;
    decisionCategory?: string;
    [key: string]: unknown;
  };
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

// ── Rate limiting (simple in-memory) ─────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30; // requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(memberId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(memberId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(memberId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// ── System prompt builder ────────────────────────────────────────────────────

function buildSystemPrompt(context: ChatRequest['context']): string {
  const name = context.name || 'Team Member';
  const role = context.role || 'team member';

  const sections: string[] = [];

  sections.push(`You are a world-class strategic AI advisor for ${name}, ${role} at Amphibian Capital, a crypto hedge fund managing $80-100M AUM with an audacious North Star target of $1B+ by 2030.

You combine the mindset of a top-tier executive coach, a hedge fund strategist, and a high-performance accountability partner. You are direct, incisive, and always push for clarity.

Your core principles:
- Be concise and actionable. No fluff. Every sentence should earn its place.
- Think in systems, not tasks. Help ${name} see second-order effects.
- Challenge assumptions ruthlessly but respectfully.
- Always tie advice back to the $1B+ North Star goal.
- When something isn't working, say so directly. No sugar-coating.
- Surface blind spots. Ask the uncomfortable questions.
- Think in probabilities and risk-adjusted outcomes, not certainties.
- Push for "what's the ONE thing?" clarity when priorities are murky.
- Celebrate real wins — not participation trophies.`);

  if (context.priorities?.length) {
    sections.push(`TODAY'S TOP PRIORITIES:\n${context.priorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}`);
  }

  if (context.weeklyGoals?.length) {
    sections.push(`THIS WEEK'S GOALS:\n${context.weeklyGoals.map((g, i) => `${i + 1}. ${g}`).join('\n')}`);
  }

  if (context.monthlyGoals?.length) {
    sections.push(`MONTHLY MILESTONES:\n${context.monthlyGoals.map((g, i) => `${i + 1}. ${g}`).join('\n')}`);
  }

  if (context.mood || context.energy) {
    const parts: string[] = [];
    if (context.mood) parts.push(`Mood: ${context.mood}`);
    if (context.energy) parts.push(`Energy: ${context.energy}/5`);
    sections.push(`CURRENT STATE: ${parts.join(' | ')}`);
  }

  if (context.wins?.length) {
    sections.push(`RECENT WINS:\n${context.wins.filter(Boolean).map((w) => `- ${w}`).join('\n')}`);
  }

  if (context.reflections?.length) {
    sections.push(`REFLECTIONS:\n${context.reflections.filter(Boolean).map((r) => `- ${r}`).join('\n')}`);
  }

  if (context.gratitude) {
    sections.push(`GRATITUDE: ${context.gratitude}`);
  }

  if (context.notes) {
    sections.push(`NOTES: ${context.notes}`);
  }

  if (context.dailyPromptResponse) {
    sections.push(`DAILY PROMPT RESPONSE: ${context.dailyPromptResponse}`);
  }

  if (context.kpis?.length) {
    sections.push(`KEY PERFORMANCE INDICATORS:\n${context.kpis.map((k) => `- ${k}`).join('\n')}`);
  }

  if (context.ownership?.length) {
    sections.push(`SINGLE-THREADED OWNERSHIP AREAS:\n${context.ownership.map((o) => `- ${o}`).join('\n')}`);
  }

  if (context.okrs?.length) {
    sections.push(`OKR PROGRESS:\n${context.okrs.map((o) => `- ${o}`).join('\n')}`);
  }

  if (context.commitments?.length) {
    sections.push(`OPERATING COMMITMENTS:\n${context.commitments.map((c) => `- ${c}`).join('\n')}`);
  }

  if (context.decisionFilter?.length) {
    sections.push(`DECISION FILTER:\n${context.decisionFilter.map((d) => `- ${d}`).join('\n')}`);
  }

  if (context.morningChecklist?.length) {
    sections.push(`MORNING CHECKLIST:\n${context.morningChecklist.map((m) => `- ${m}`).join('\n')}`);
  }

  if (context.mantra) {
    sections.push(`PERSONAL MANTRA: "${context.mantra}"`);
  }

  // Decision context
  if (context.decisionTitle) {
    const decParts: string[] = [`DECISION BEING DRAFTED: "${context.decisionTitle}"`];
    if (context.decisionDescription) decParts.push(`Description: ${context.decisionDescription}`);
    if (context.decisionRationale) decParts.push(`Current Rationale: ${context.decisionRationale}`);
    if (context.decisionCategory) decParts.push(`Category: ${context.decisionCategory}`);
    sections.push(decParts.join('\n'));
  }

  sections.push(`When responding:
- Use markdown formatting for readability (bold, bullets, headers)
- Keep responses focused and under 300 words unless the question demands depth
- End with a provocative question or action item when appropriate
- If you notice ${name} is avoiding something, call it out
- Reference their specific data and context — don't give generic advice`);

  return sections.join('\n\n---\n\n');
}

// ── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'API key not configured',
          message:
            'The ANTHROPIC_API_KEY environment variable is not set. To enable AI features:\n\n' +
            '1. Go to console.anthropic.com and create an API key\n' +
            '2. Add it to your .env.local file: ANTHROPIC_API_KEY=sk-ant-...\n' +
            '3. Or set it in Vercel: Settings > Environment Variables\n\n' +
            'Your AI advisor will be ready as soon as the key is configured.',
          setup: true,
        },
        { status: 503 }
      );
    }

    // Parse request
    const body: ChatRequest = await request.json();
    const { message, memberId, context, conversationHistory } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Rate limiting
    if (!checkRateLimit(memberId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before sending another message.' },
        { status: 429 }
      );
    }

    // Build the conversation
    const systemPrompt = buildSystemPrompt(context || {});

    // Build messages array with conversation history
    const messages: Anthropic.MessageParam[] = [];

    if (conversationHistory?.length) {
      // Include up to the last 20 messages for context
      const recentHistory = conversationHistory.slice(-20);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add the current message
    messages.push({
      role: 'user',
      content: message.trim(),
    });

    // Call Claude
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    // Extract text content
    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return NextResponse.json({
      response: textContent,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error: unknown) {
    console.error('AI Chat API Error:', error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          {
            error: 'Invalid API key',
            message: 'The ANTHROPIC_API_KEY is invalid. Please check your key at console.anthropic.com.',
            setup: true,
          },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'API rate limit reached. Please try again in a moment.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Anthropic API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
