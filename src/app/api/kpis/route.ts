import { NextResponse } from 'next/server';
import { kpis } from '@/lib/data';

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
    const category = searchParams.get('category');

    let result = [...kpis];

    if (id) {
      const kpi = result.find(k => k.id === id);
      if (!kpi) {
        return NextResponse.json(
          { error: 'KPI not found', timestamp: new Date().toISOString() },
          { status: 404, headers: corsHeaders }
        );
      }
      return NextResponse.json(
        { data: kpi, count: 1, timestamp: new Date().toISOString() },
        { headers: corsHeaders }
      );
    }

    if (category) {
      result = result.filter(k => k.category.toLowerCase() === category.toLowerCase());
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
