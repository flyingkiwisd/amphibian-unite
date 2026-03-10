'use client';

import { useState } from 'react';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Scale,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Activity,
  Plus,
  Trash2,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';
import { useEditableStore } from '@/lib/useEditableStore';
import { InlineText, InlineSelect, EditBanner } from '@/components/InlineEdit';

// ── Types ──────────────────────────────────────────────────

type ChangeSentiment = 'positive' | 'neutral' | 'concerning';

interface ChangeItem {
  id: string;
  text: string;
  detail?: string;
  timestamp: string;
  sentiment: ChangeSentiment;
  relatedPerson?: string;
}

interface ChangeSection {
  title: string;
  iconType: 'performance' | 'team' | 'decisions' | 'risks' | 'tasks';
  category: string;
  items: ChangeItem[];
}

// Stored data shape
interface WhatChangedData {
  sections: ChangeSection[];
}

// ── Helpers ────────────────────────────────────────────────

const sentimentColor = (s: ChangeSentiment) => {
  switch (s) {
    case 'positive': return 'text-emerald-400';
    case 'neutral': return 'text-amber-400';
    case 'concerning': return 'text-rose-400';
  }
};

const sentimentDot = (s: ChangeSentiment) => {
  switch (s) {
    case 'positive': return 'bg-emerald-500';
    case 'neutral': return 'bg-amber-500';
    case 'concerning': return 'bg-rose-500';
  }
};

const sentimentBorder = (s: ChangeSentiment) => {
  switch (s) {
    case 'positive': return 'border-l-emerald-500';
    case 'neutral': return 'border-l-amber-500';
    case 'concerning': return 'border-l-rose-500';
  }
};

const sentimentOptions = [
  { label: 'Positive', value: 'positive', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  { label: 'Neutral', value: 'neutral', color: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  { label: 'Concerning', value: 'concerning', color: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' },
];

const getMember = (id: string) => teamMembers.find((m) => m.id === id);

const sectionIcon = (iconType: ChangeSection['iconType']) => {
  switch (iconType) {
    case 'performance': return <BarChart3 className="w-5 h-5 text-accent" />;
    case 'team': return <Users className="w-5 h-5 text-accent-blue" />;
    case 'decisions': return <Scale className="w-5 h-5 text-accent-purple" />;
    case 'risks': return <AlertTriangle className="w-5 h-5 text-accent-amber" />;
    case 'tasks': return <CheckCircle2 className="w-5 h-5 text-accent-emerald" />;
  }
};

// ── Mock Data ─────────────────────────────────────────────

const generateDefaultData = (currentUser: string): WhatChangedData => {
  const isJames = currentUser === 'james';

  return {
    sections: [
      {
        title: 'Fund Performance',
        iconType: 'performance',
        category: 'performance',
        items: [
          {
            id: 'fp-1',
            text: 'BTC Alpha daily return: +0.12%',
            detail: 'Funding rate trades contributed +0.08%, infrastructure arbitrage +0.04%. Running MTD: +0.34%.',
            timestamp: '5:45 AM',
            sentiment: 'positive',
          },
          {
            id: 'fp-2',
            text: 'USD Alpha NAV updated: +0.05% overnight',
            detail: 'Steady performance across carry positions. No significant drawdown events.',
            timestamp: '6:00 AM',
            sentiment: 'positive',
          },
          {
            id: 'fp-3',
            text: 'BTC volatility spike: 30-day IV up 8% to 62%',
            detail: 'Driven by macro uncertainty around Fed rate decision. Potential impact on basis trades.',
            timestamp: '4:30 AM',
            sentiment: 'concerning',
          },
        ],
      },
      {
        title: 'Team Activity',
        iconType: 'team',
        category: 'team',
        items: [
          {
            id: 'ta-1',
            text: 'Timon pushed risk dashboard v1 update',
            detail: 'Position sizing module 70% complete. New concentration metric added.',
            timestamp: '11:30 PM',
            sentiment: 'positive',
            relatedPerson: 'timon',
          },
          {
            id: 'ta-2',
            text: 'Ross completed A9 track record verification (Phase 1)',
            detail: 'Historical returns verified against prime broker records. Clean result, moving to Phase 2.',
            timestamp: '8:15 PM',
            sentiment: 'positive',
            relatedPerson: 'ross',
          },
          {
            id: 'ta-3',
            text: isJames ? 'Todd flagged LP statement issue with fund admin' : 'James updated COO job description',
            detail: isJames
              ? 'Two LP statements had incorrect fee calculations. Todd is coordinating correction with fund admin. Expected resolution by EOD.'
              : 'Added crypto fund background as a requirement. Search scope refined.',
            timestamp: '7:00 PM',
            sentiment: isJames ? 'concerning' : 'neutral',
            relatedPerson: isJames ? 'todd' : 'james',
          },
          {
            id: 'ta-4',
            text: 'Sahir added 15 new managers to strategy performance database',
            detail: 'Focus on market-neutral and relative value strategies for Dynamic Alpha sleeve evaluation.',
            timestamp: '6:45 PM',
            sentiment: 'positive',
            relatedPerson: 'sahir',
          },
        ],
      },
      {
        title: 'Decisions Made',
        iconType: 'decisions',
        category: 'decisions',
        items: [
          {
            id: 'dm-1',
            text: 'Risk dashboard v1 launch date set: April 15',
            detail: 'Decided during Engineering Sprint Review. Timon to complete position sizing module by April 8.',
            timestamp: '4:00 PM',
            sentiment: 'positive',
          },
          {
            id: 'dm-2',
            text: 'Regime classifier architecture: multi-modal approach approved',
            detail: 'Will combine on-chain metrics, sentiment data, and macro indicators. Timon leading implementation.',
            timestamp: '4:30 PM',
            sentiment: 'positive',
          },
        ],
      },
      {
        title: 'Risks Updated',
        iconType: 'risks',
        category: 'risks',
        items: [
          {
            id: 'ru-1',
            text: 'A9 concentration risk flagged: 45% of BTC Alpha exposure',
            detail: 'Above the 40% single-manager limit. Ty reviewing rebalancing options with Ross.',
            timestamp: '3:00 PM',
            sentiment: 'concerning',
          },
          {
            id: 'ru-2',
            text: 'SMA infrastructure timeline risk: PB evaluation delayed 1 week',
            detail: 'Prime broker evaluation pushed due to documentation requirements. Andrew coordinating.',
            timestamp: '2:30 PM',
            sentiment: 'neutral',
            relatedPerson: 'andrew',
          },
        ],
      },
      {
        title: 'Tasks Completed',
        iconType: 'tasks',
        category: 'tasks',
        items: [
          {
            id: 'tc-1',
            text: 'Strategy performance database schema finalized',
            detail: 'Sahir completed the schema design. Ready for data ingestion pipeline.',
            timestamp: '6:00 PM',
            sentiment: 'positive',
            relatedPerson: 'sahir',
          },
          {
            id: 'tc-2',
            text: 'Weekly cash forecast published',
            detail: 'Mark published the weekly forecast. 14-month runway confirmed at current burn.',
            timestamp: '10:00 AM',
            sentiment: 'positive',
            relatedPerson: 'mark',
          },
          {
            id: 'tc-3',
            text: 'LP deck updated with Q1 performance data',
            detail: 'Ready for Carson Group follow-up meeting. Includes risk framework overview.',
            timestamp: '5:30 PM',
            sentiment: 'positive',
            relatedPerson: isJames ? 'todd' : 'james',
          },
        ],
      },
    ],
  };
};

// ── Component ──────────────────────────────────────────────

export function WhatChangedView({ currentUser = 'james' }: { currentUser?: string }) {
  const defaultData = generateDefaultData(currentUser);
  const { data, setData, hasEdits, resetAll } = useEditableStore<WhatChangedData>(
    'amphibian-unite-what-changed',
    defaultData
  );

  const sections = data.sections;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.category))
  );

  const toggleSection = (category: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const updateItem = (sectionIdx: number, itemIdx: number, updater: (item: ChangeItem) => ChangeItem) => {
    setData((prev) => {
      const newSections = [...prev.sections];
      const newItems = [...newSections[sectionIdx].items];
      newItems[itemIdx] = updater(newItems[itemIdx]);
      newSections[sectionIdx] = { ...newSections[sectionIdx], items: newItems };
      return { ...prev, sections: newSections };
    });
  };

  const addItem = (sectionIdx: number) => {
    setData((prev) => {
      const newSections = [...prev.sections];
      const newItems = [...newSections[sectionIdx].items, {
        id: `item-${Date.now()}`,
        text: 'New change item',
        detail: 'Details...',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        sentiment: 'neutral' as ChangeSentiment,
      }];
      newSections[sectionIdx] = { ...newSections[sectionIdx], items: newItems };
      return { ...prev, sections: newSections };
    });
  };

  const deleteItem = (sectionIdx: number, itemIdx: number) => {
    setData((prev) => {
      const newSections = [...prev.sections];
      const newItems = newSections[sectionIdx].items.filter((_, i) => i !== itemIdx);
      newSections[sectionIdx] = { ...newSections[sectionIdx], items: newItems };
      return { ...prev, sections: newSections };
    });
  };

  // Summary counts
  const totalChanges = sections.reduce((sum, s) => sum + s.items.length, 0);
  const positiveCount = sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.sentiment === 'positive').length,
    0
  );
  const concerningCount = sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.sentiment === 'concerning').length,
    0
  );

  const now = new Date();
  const lastUpdated = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <EditBanner hasEdits={hasEdits} onReset={resetAll} />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Clock className="w-7 h-7 text-accent" />
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">What Changed</span>
            </h1>
          </div>
          <p className="text-text-secondary text-sm mt-1 max-w-xl">
            Daily digest of everything that happened since yesterday. Personalized for {getMember(currentUser)?.name ?? currentUser}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted bg-surface border border-border rounded-lg px-3 py-2">
          <Activity className="w-3.5 h-3.5 text-accent" />
          <span>Last updated: Today, 6:00 AM</span>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Changes</span>
          <p className="text-2xl font-bold text-text-primary mt-2">{totalChanges}</p>
          <p className="text-xs text-text-muted mt-0.5">{lastUpdated}</p>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Positive</span>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <p className="text-2xl font-bold text-emerald-400">{positiveCount}</p>
          </div>
        </div>
        <div className="glow-card bg-surface border border-border rounded-xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Needs Attention</span>
          <div className="flex items-center gap-2 mt-2">
            <TrendingDown className="w-5 h-5 text-rose-400" />
            <p className="text-2xl font-bold text-rose-400">{concerningCount}</p>
          </div>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="space-y-4">
        {sections.map((section, sIdx) => {
          const isExpanded = expandedSections.has(section.category);
          const sectionConcerning = section.items.filter((i) => i.sentiment === 'concerning').length;

          return (
            <div
              key={section.category}
              className="bg-surface border border-border rounded-xl overflow-hidden animate-fade-in"
              style={{ animationDelay: `${100 + sIdx * 75}ms` }}
            >
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.category)}
                className="w-full flex items-center justify-between p-4 hover:bg-surface-2/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {sectionIcon(section.iconType)}
                  <h3 className="text-base font-semibold text-text-primary">{section.title}</h3>
                  <span className="text-xs font-mono text-text-muted bg-surface-3 px-2 py-0.5 rounded-full">
                    {section.items.length}
                  </span>
                  {sectionConcerning > 0 && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      {sectionConcerning} alert{sectionConcerning > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
              </button>

              {/* Section items */}
              {isExpanded && (
                <div className="border-t border-border">
                  <div className="divide-y divide-border/50">
                    {section.items.map((item, iIdx) => {
                      const relatedMember = item.relatedPerson ? getMember(item.relatedPerson) : null;

                      return (
                        <div
                          key={item.id}
                          className={`p-4 border-l-2 hover:bg-surface-2/30 transition-colors ${sentimentBorder(item.sentiment)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full ${sentimentDot(item.sentiment)} flex-shrink-0 mt-1.5`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <InlineText
                                  value={item.text}
                                  onSave={(v) => updateItem(sIdx, iIdx, (it) => ({ ...it, text: v }))}
                                  className={`text-sm font-medium ${sentimentColor(item.sentiment)}`}
                                />
                                <InlineSelect
                                  value={item.sentiment}
                                  options={sentimentOptions}
                                  onSave={(v) => updateItem(sIdx, iIdx, (it) => ({ ...it, sentiment: v as ChangeSentiment }))}
                                />
                              </div>
                              {item.detail !== undefined && (
                                <InlineText
                                  value={item.detail || ''}
                                  onSave={(v) => updateItem(sIdx, iIdx, (it) => ({ ...it, detail: v }))}
                                  className="text-xs text-text-secondary leading-relaxed mt-1"
                                  multiline
                                  placeholder="Add detail..."
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {relatedMember && (
                                <div className={`w-6 h-6 rounded-md ${relatedMember.color} flex items-center justify-center text-white text-[9px] font-bold`}>
                                  {relatedMember.avatar}
                                </div>
                              )}
                              <span className="text-[10px] text-text-muted font-mono">{item.timestamp}</span>
                              <button
                                onClick={() => deleteItem(sIdx, iIdx)}
                                className="p-0.5 text-text-muted/30 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 border-t border-border/50">
                    <button
                      onClick={() => addItem(sIdx)}
                      className="flex items-center gap-1.5 text-xs text-text-muted hover:text-teal-400 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add change item
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
