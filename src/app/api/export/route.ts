import { NextResponse } from 'next/server';
import { teamMembers, agents, okrs, kpis, roadmapPhases, aiLayers } from '@/lib/data';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const exportData = {
      data: {
        team: {
          members: teamMembers,
          count: teamMembers.length,
        },
        agents: {
          items: agents,
          count: agents.length,
          byStatus: {
            active: agents.filter(a => a.status === 'active').length,
            building: agents.filter(a => a.status === 'building').length,
            planned: agents.filter(a => a.status === 'planned').length,
          },
        },
        okrs: {
          items: okrs,
          count: okrs.length,
          byStatus: {
            'on-track': okrs.filter(o => o.status === 'on-track').length,
            'at-risk': okrs.filter(o => o.status === 'at-risk').length,
            'behind': okrs.filter(o => o.status === 'behind').length,
          },
        },
        kpis: {
          items: kpis,
          count: kpis.length,
        },
        roadmap: {
          phases: roadmapPhases,
          count: roadmapPhases.length,
          currentPhase: roadmapPhases.find(p => p.status === 'active')?.phase || null,
        },
        aiLayers: {
          layers: aiLayers,
          count: aiLayers.length,
          averageProgress: Math.round(aiLayers.reduce((sum, l) => sum + l.status, 0) / aiLayers.length),
        },
      },
      meta: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        platform: 'Amphibian Unite',
        description: 'Complete data export for LLM/Claude integration. Import this into Claude Projects or other AI platforms for contextual awareness of Amphibian operations.',
        apiEndpoints: {
          team: '/api/team',
          agents: '/api/agents',
          okrs: '/api/okrs',
          kpis: '/api/kpis',
          tasks: '/api/tasks',
          notes: '/api/notes',
          decisions: '/api/decisions',
          export: '/api/export',
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(exportData, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', timestamp: new Date().toISOString() },
      { status: 500, headers: corsHeaders }
    );
  }
}
