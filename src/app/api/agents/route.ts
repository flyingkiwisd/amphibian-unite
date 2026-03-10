import { NextResponse } from 'next/server';
import { agents } from '@/lib/data';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');

    let result = [...agents];

    if (id) {
      const agent = result.find(a => a.id === id);
      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found', timestamp: new Date().toISOString() },
          { status: 404, headers: corsHeaders }
        );
      }
      return NextResponse.json(
        { data: agent, count: 1, timestamp: new Date().toISOString() },
        { headers: corsHeaders }
      );
    }

    if (status) {
      result = result.filter(a => a.status === status);
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
