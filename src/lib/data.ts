export interface TeamMember {
  id: string;
  name: string;
  role: string;
  shortRole: string;
  avatar: string; // initials
  color: string; // tailwind color class
  roleOneSentence: string;
  singleThreadedOwnership: string[];
  kpis: string[];
  nonNegotiables: string[];
  status: 'active' | 'hiring';
}

export interface Agent {
  id: string;
  name: string;
  shortName: string;
  icon: string; // lucide icon name
  color: string;
  gradient: string;
  description: string;
  capabilities: string[];
  dataSourcesConnected: string[];
  status: 'active' | 'building' | 'planned';
  priority: 'critical' | 'high' | 'medium';
}

export interface OKR {
  id: string;
  objective: string;
  keyResults: { text: string; progress: number; owner: string }[];
  quarter: string;
  status: 'on-track' | 'at-risk' | 'behind';
}

export interface KPI {
  id: string;
  name: string;
  value: string;
  target: string;
  trend: 'up' | 'down' | 'flat';
  category: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: 'james',
    name: 'James Hodges',
    role: 'CEO & Managing Partner',
    shortRole: 'CEO',
    avatar: 'JH',
    color: 'bg-teal-500',
    roleOneSentence: 'CEO and architect of Amphibian\'s strategic edge, institutional maturity, and leadership bench building the company to scale beyond any single person.',
    singleThreadedOwnership: [
      'Company vision, strategic direction, and North Star ($1B AUM by 2030)',
      'Leadership design, hiring of senior operators, and succession architecture',
      '"Edge" definition and enforcement across all products',
      'Culture standards and founder alignment',
      'Institutional readiness: building the org so it runs with excellence regardless of who is in any seat'
    ],
    kpis: [
      'AUM growth trajectory toward $1B',
      'Edge rating improvement (5.1 → 7.0)',
      'COO hired by June 2026',
      'CTO hired by Q3 2026',
      'Priority lock adherence (weekly Top 3 published)'
    ],
    nonNegotiables: [
      'Values lived in practice — not aspirational, operational',
      'Meritocracy and clean hard conversations',
      'Edge, not mediocrity — best in class or wrong business',
      'Decisions through published process, not side conversations',
      'CEO/CIO boundary is a hard line'
    ],
    status: 'active'
  },
  {
    id: 'david',
    name: 'David Langer',
    role: 'Chairman',
    shortRole: 'Chair',
    avatar: 'DL',
    color: 'bg-blue-500',
    roleOneSentence: 'Chair responsible for board fiduciary oversight, strategic guidance, and high-leverage distribution introductions.',
    singleThreadedOwnership: [
      'Board governance quality and fiduciary responsibility',
      'Strategic partnerships and distribution introductions at board level'
    ],
    kpis: [
      'Board decision discipline: agendas, minutes, actions tracked',
      'Number of qualified introductions and partnership progress',
      'Accountability standards enforced at board level'
    ],
    nonNegotiables: [
      'Results culture and accountability',
      'No rewarding mediocre performance'
    ],
    status: 'active'
  },
  {
    id: 'mark',
    name: 'Mark Wagner',
    role: 'CFO',
    shortRole: 'CFO',
    avatar: 'MW',
    color: 'bg-amber-500',
    roleOneSentence: 'Owner of financial clarity and operating stability through resilience-based planning, budgeting, and accounting infrastructure.',
    singleThreadedOwnership: [
      'Budgeting framework and scenario planning',
      'Cash runway visibility and early warning signals',
      'Accounting infrastructure and staffing',
      'Financial decision tools post-merger'
    ],
    kpis: [
      'Weekly cash forecast published consistently',
      'Monthly downside review completed 12/12 months',
      'Budget tool shipped and used for decisions',
      'Accounting support hired'
    ],
    nonNegotiables: [
      'Psychological safety for honest conversations',
      'Respect for team members',
      'Clear decision authority and realistic planning expectations'
    ],
    status: 'active'
  },
  {
    id: 'todd',
    name: 'Todd Bendell',
    role: 'President & IR',
    shortRole: 'President',
    avatar: 'TB',
    color: 'bg-indigo-500',
    roleOneSentence: 'Owner of investor communications and investor operating system, plus governance maturity support.',
    singleThreadedOwnership: [
      'Investor communications standards and cadence',
      'LP trust management and "surprise reduction"',
      'Investor ops predictability and handoff readiness'
    ],
    kpis: [
      'Investor update cadence hit 12/12 months',
      'Statement clarity improved (fewer inbound confusions)',
      'Redemption process SLA met and documented',
      'LP retention and satisfaction stable or improving',
      'Fundraising target achieved for the year'
    ],
    nonNegotiables: [
      'Truth and ownership about product reality',
      'Capital preservation and LP trust as north star',
      'Clean governance, clean roles, clean decision rights'
    ],
    status: 'active'
  },
  {
    id: 'paola',
    name: 'Paola Origel',
    role: 'Head of BD & Growth',
    shortRole: 'BD Lead',
    avatar: 'PO',
    color: 'bg-rose-500',
    roleOneSentence: 'Founding and Strategic Partner responsible for growth, partnerships, and brand-level credibility, within a defined and explicit mandate.',
    singleThreadedOwnership: [
      'Growth and partnership strategy outcomes inside agreed scope',
      'Institutional credibility and relationship-building',
      'Truthful alignment on mandate, economics, and governance expectations'
    ],
    kpis: [
      'Qualified strategic partnership pipeline maintained',
      'High-quality meetings with target allocators or partners',
      '1-2 tangible partnership outcomes improving distribution or durability'
    ],
    nonNegotiables: [
      'Defined mandate and time-bound expectations',
      'Clean role economics and governance clarity',
      'Consistent reinforcement of stated standards'
    ],
    status: 'active'
  },
  {
    id: 'andrew',
    name: 'Andrew Hoppin',
    role: 'Risk / Compliance / Strategy',
    shortRole: 'Strategy',
    avatar: 'AH',
    color: 'bg-emerald-500',
    roleOneSentence: 'Owner of legal/compliance signoff, governance and operational infrastructure, SMA infrastructure for Dynamic Alpha, and the bridge between Hyla and Amphibian operating models.',
    singleThreadedOwnership: [
      'Legal/compliance signoff across entities',
      'Governance process and written agreements',
      'SMA infrastructure for Dynamic Alpha (Hyla Cyclical vehicle)',
      'Post-merger operating model: which functions consolidate vs. stay independent',
      'Product architecture oversight to make BTC Alpha institutionally diligence-ready'
    ],
    kpis: [
      'Governance agreements shipped and maintained',
      'Compliance findings: zero',
      'Security breaches: zero',
      'Advisory revenue attribution tracked monthly',
      'Decision documentation within 48 hours'
    ],
    nonNegotiables: [
      'Written agreements for governance, compensation, and equity',
      'Consultation before decisions affecting team or compliance',
      'No asymmetric obligations presented as shared accountability',
      'Standards applied symmetrically'
    ],
    status: 'active'
  },
  {
    id: 'ty',
    name: 'Ty',
    role: 'CIO',
    shortRole: 'CIO',
    avatar: 'TY',
    color: 'bg-violet-500',
    roleOneSentence: 'CIO accountable for core-fund outcomes and risk posture, with decision finality inside guardrails, and accountable for shipping an auditable risk/allocation engine.',
    singleThreadedOwnership: [
      'Portfolio outcomes + risk posture for core funds',
      'Risk governance system: limits, sizing rules, hedging policy',
      'Manager lifecycle: selection, onboarding, monitoring, and exit',
      'Risk/Allocation engine roadmap',
      'Evaluate novel trading & investment strategies'
    ],
    kpis: [
      'Risk limits: defined, published with 100% breaches logged',
      '100% material changes have written rationale',
      'Portfolio risk quality: reduced concentration vs baseline',
      'IC Portfolio Memo delivered on schedule monthly',
      'HRP/MVO engine delivery and adoption'
    ],
    nonNegotiables: [
      'Repeatable, auditable decision-making',
      'Exception hygiene',
      'Tangible improvement in outcomes and process reliability'
    ],
    status: 'active'
  },
  {
    id: 'ross',
    name: 'Ross',
    role: 'Portfolio Manager',
    shortRole: 'PM',
    avatar: 'RS',
    color: 'bg-cyan-500',
    roleOneSentence: 'Portfolio Manager across the FoF, responsible for day-to-day portfolio execution and turning the process into a repeatable practice.',
    singleThreadedOwnership: [
      'PM execution quality across the FoF',
      'Implementation of portfolio process and decision discipline'
    ],
    kpis: [
      'Portfolio changes documented consistently',
      'Risk limits adhered to and breaches brought to CIO/Board',
      'Monitor performance drift on monthly basis',
      'Improvement in consistency of monthly outcomes'
    ],
    nonNegotiables: [
      'Clear ownership and real accountability',
      'Systems over heroics',
      'Respect and psychological safety in execution culture'
    ],
    status: 'active'
  },
  {
    id: 'thao',
    name: 'Thao',
    role: 'Operations & Financial Controller',
    shortRole: 'Ops Lead',
    avatar: 'TH',
    color: 'bg-orange-500',
    roleOneSentence: 'Operations owner who makes the firm run predictably by turning decisions into clean execution across investor ops and internal workflows.',
    singleThreadedOwnership: [
      'Day-to-day operations execution and workflow quality',
      'Investor ops delivery (process execution, tracking, SLAs)',
      'Project management + ball tracking for cross-functional priorities',
      'Process standards enforcement'
    ],
    kpis: [
      'On-time ops delivery rate (weekly)',
      'Investor ops SLA adherence',
      'Workflow reliability: near-zero preventable errors',
      'Cycle time: average request → completion trending down',
      'Single source of truth adoption: 100%'
    ],
    nonNegotiables: [
      'One owner, one outcome, one deadline for critical work',
      'No "tribal knowledge" workflows—everything gets an SOP',
      'Issues surfaced early; no silent drifting'
    ],
    status: 'active'
  },
  {
    id: 'timon',
    name: 'Timon',
    role: 'Product Engineer',
    shortRole: 'Engineer',
    avatar: 'TI',
    color: 'bg-sky-500',
    roleOneSentence: 'Product engineer building risk dashboard, data pipeline, and platform infrastructure.',
    singleThreadedOwnership: [
      'Risk dashboard development',
      'Data pipeline architecture',
      'Platform infrastructure',
      'Regime classifier implementation'
    ],
    kpis: [
      'Risk dashboard v1 shipped',
      'Data pipeline reliability',
      'Regime classifier v0.1 testing'
    ],
    nonNegotiables: [
      'Ship production systems that scale',
      'Data integrity above speed'
    ],
    status: 'active'
  },
  {
    id: 'sahir',
    name: 'Sahir',
    role: 'Product Operations',
    shortRole: 'Prod Ops',
    avatar: 'SA',
    color: 'bg-lime-500',
    roleOneSentence: 'Product operations specialist driving manager research, performance analytics, and operational support.',
    singleThreadedOwnership: [
      'Manager research and performance analytics',
      'Strategy performance database',
      'Operational support across products'
    ],
    kpis: [
      'Strategy performance database built',
      'Manager research throughput',
      'Analytics accuracy and timeliness'
    ],
    nonNegotiables: [
      'Data-driven analysis',
      'Transparent reporting'
    ],
    status: 'active'
  },
  {
    id: 'nicole',
    name: 'Nicole (TBH)',
    role: 'COO',
    shortRole: 'COO',
    avatar: 'N?',
    color: 'bg-pink-500',
    roleOneSentence: 'Frees James from daily operations to focus on vision and capital raising. Runs the daily machine.',
    singleThreadedOwnership: [
      'Daily operations management',
      'Compliance, legal, fund admin',
      'LP reporting and entity management',
      '30-day run-without-James capability'
    ],
    kpis: [
      'Hired by June 2026',
      'Pass 30-day run-without-James test by Sept',
      'Operations running without CEO daily involvement'
    ],
    nonNegotiables: [
      'Fund operations experience ($200M+ AUM)',
      'Digital asset / crypto fund background'
    ],
    status: 'hiring'
  },
  {
    id: 'nick',
    name: 'Nick (TBH)',
    role: 'AI-First CTO',
    shortRole: 'CTO',
    avatar: 'N?',
    color: 'bg-purple-500',
    roleOneSentence: 'Leads the AI-native technology vision. Builds and owns the regime classifier, signal generation pipeline, risk engine, and platform infrastructure.',
    singleThreadedOwnership: [
      'AI/ML engineering leadership',
      'Regime classifier development',
      'Signal generation pipeline',
      'Risk engine architecture',
      'Platform infrastructure'
    ],
    kpis: [
      'Hired by Q3 2026',
      'Regime classifier v1 live',
      'AI team built (3-5 people)',
      'Production AI systems shipping'
    ],
    nonNegotiables: [
      'AI/ML engineering depth',
      'Quantitative finance background',
      'Can ship production AI systems'
    ],
    status: 'hiring'
  }
];

export const agents: Agent[] = [
  {
    id: 'north-star',
    name: 'North Star Agent',
    shortName: 'North Star',
    icon: 'Compass',
    color: 'text-teal-400',
    gradient: 'from-teal-500/20 to-teal-500/5',
    description: 'Guards and surfaces the company vision, mission, values, and strategic direction. Ensures every decision aligns with the $1B+ AUM North Star.',
    capabilities: [
      'Vision & mission tracking against quarterly priorities',
      'Strategic alignment scoring for all initiatives',
      'Values enforcement and culture monitoring',
      'Priority stack management (max 5 + stop list)',
      'North Star progress dashboard'
    ],
    dataSourcesConnected: ['The Bridge V3', 'Quarterly priority stacks', 'Board meeting notes'],
    status: 'active',
    priority: 'critical'
  },
  {
    id: 'identity',
    name: 'Identity & Roles Agent',
    shortName: 'Identity',
    icon: 'Users',
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-blue-500/5',
    description: 'Each person\'s operating system. Manages roles, responsibilities, decision rights, interfaces, and "best-in-class" qualities for every team member.',
    capabilities: [
      'Personal 1-pager for every team member',
      'Decision rights matrix (decide/approve/recommend/consult)',
      'Interface map: who needs what from whom',
      'Start/Stop/Keep tracking',
      'Role evolution and succession planning'
    ],
    dataSourcesConnected: ['Roles & Responsibilities doc', 'Decision rights matrix', 'Org chart'],
    status: 'active',
    priority: 'critical'
  },
  {
    id: 'okr-engine',
    name: 'OKR & KPI Engine',
    shortName: 'OKRs',
    icon: 'Target',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    description: 'Tracks objectives, key results, and KPIs across all team members and products. Weekly scoreboard with 5-10 metrics max.',
    capabilities: [
      'Company-level OKR tracking',
      'Individual KPI dashboards per team member',
      'Weekly Top 3 priorities with owners and definition of done',
      'Progress visualization and trend analysis',
      'Automated alerts when metrics drift'
    ],
    dataSourcesConnected: ['KPI spreadsheets', 'Fund performance data', '90-day action plans'],
    status: 'active',
    priority: 'critical'
  },
  {
    id: 'task-commander',
    name: 'Task Commander',
    shortName: 'Tasks',
    icon: 'CheckSquare',
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-amber-500/5',
    description: 'Asana-level project management. Tasks with owners, deadlines, definitions of done. Tracks the 90-day action plan and all cross-functional work.',
    capabilities: [
      'Task creation with owner, outcome, deadline, check-in date',
      'Kanban, list, and timeline views',
      'Dependency tracking and blocker alerts',
      '90-day action plan execution tracking',
      'Workload balancing across team',
      'PDF export of any view for AI/LLM connection'
    ],
    dataSourcesConnected: ['90-day action plans', 'Weekly priorities', 'Team capacity'],
    status: 'active',
    priority: 'critical'
  },
  {
    id: 'slack-signal',
    name: 'Slack Signal Intelligence',
    shortName: 'Slack Intel',
    icon: 'MessageSquare',
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-purple-500/5',
    description: 'Scans all Slack channels, extracts decisions, action items, blockers, and sentiment. Turns conversations into structured intelligence.',
    capabilities: [
      'Auto-extract decisions and action items from Slack',
      'Surface unresolved blockers and stale threads',
      'Team sentiment and communication health analysis',
      'Decision log auto-population',
      'Cross-reference Slack with tasks and OKRs'
    ],
    dataSourcesConnected: ['Slack workspace', 'Decision logs', 'Task tracker'],
    status: 'building',
    priority: 'high'
  },
  {
    id: 'portfolio-intel',
    name: 'Portfolio Intelligence Agent',
    shortName: 'Portfolio',
    icon: 'TrendingUp',
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    description: 'Fund performance, risk metrics, manager data. Tracks BTC Alpha, Dynamic Alpha, and the expanded yield stack.',
    capabilities: [
      'Real-time fund performance tracking (BTC, ETH, USD Alpha)',
      'Manager scorecard and watchlist system',
      'Yield source attribution (12 categories)',
      'Risk dashboard: concentration, overlap, liquidity',
      'Regime classification signal overlay'
    ],
    dataSourcesConnected: ['Fund NAV data', 'Manager reports', '800+ fund database'],
    status: 'active',
    priority: 'critical'
  },
  {
    id: 'lp-trust',
    name: 'LP & Investor Trust Agent',
    shortName: 'LP Trust',
    icon: 'Shield',
    color: 'text-indigo-400',
    gradient: 'from-indigo-500/20 to-indigo-500/5',
    description: 'Manages investor communications, pipeline, trust signals. Ensures LP surprise reduction and communications cadence.',
    capabilities: [
      'Investor comms calendar and cadence tracking',
      'LP trust signal monitoring',
      'Fundraising pipeline management',
      'Redemption process SLA tracking',
      'LP satisfaction indicators'
    ],
    dataSourcesConnected: ['Investor CRM', 'Email comms', 'AngelList portal'],
    status: 'active',
    priority: 'high'
  },
  {
    id: 'governance',
    name: 'Governance & Decision Agent',
    shortName: 'Governance',
    icon: 'Scale',
    color: 'text-rose-400',
    gradient: 'from-rose-500/20 to-rose-500/5',
    description: 'Decision logs, compliance tracking, governance infrastructure. Every governance decision in writing within 48 hours.',
    capabilities: [
      'Decision log with date, rationale, and impact',
      'Decision-change protocol enforcement',
      'Compliance posture monitoring',
      'Governance agreement tracking',
      'Security posture and incident response'
    ],
    dataSourcesConnected: ['Decision logs', 'Compliance records', 'Board meeting minutes'],
    status: 'active',
    priority: 'high'
  },
  {
    id: 'financial',
    name: 'Financial Intelligence Agent',
    shortName: 'Finance',
    icon: 'DollarSign',
    color: 'text-green-400',
    gradient: 'from-green-500/20 to-green-500/5',
    description: 'Cash runway, budgets, revenue tracking. Weekly cash forecast, monthly downside reviews, and budget variance analysis.',
    capabilities: [
      'Weekly cash forecast and runway view',
      'Dynamic budget tool with downside scenarios',
      'Revenue tracking (management fees + performance)',
      'Entity complexity monitoring',
      'Break-even AUM calculator'
    ],
    dataSourcesConnected: ['QuickBooks/accounting', 'Fund revenue data', 'Budget models'],
    status: 'active',
    priority: 'high'
  },
  {
    id: 'culture',
    name: 'Culture & Alignment Agent',
    shortName: 'Culture',
    icon: 'Heart',
    color: 'text-pink-400',
    gradient: 'from-pink-500/20 to-pink-500/5',
    description: 'Team health, culture standards, founder alignment. Tracks non-negotiables and ensures values are lived operationally.',
    capabilities: [
      'Culture standards dashboard',
      'Founder alignment check-in tracking',
      'Team health pulse surveys',
      'Non-negotiables enforcement tracker',
      'Start/Stop/Keep aggregation across team'
    ],
    dataSourcesConnected: ['Team surveys', 'Slack sentiment', '360 feedback'],
    status: 'building',
    priority: 'medium'
  },
  {
    id: 'ai-edge',
    name: 'AI Edge Agent',
    shortName: 'AI Edge',
    icon: 'Cpu',
    color: 'text-violet-400',
    gradient: 'from-violet-500/20 to-violet-500/5',
    description: 'Tracks AI infrastructure progress across the 6-layer advantage. Monitors edge rating evolution from 5.1 → 8.5.',
    capabilities: [
      '6-layer AI edge tracking (regime, signal, risk, execution, manager, ops)',
      'Edge rating calculation and trending',
      'AI capability maturity assessment',
      'Competitor AI capability monitoring',
      'AI investment ROI tracking (bps attribution per layer)'
    ],
    dataSourcesConnected: ['AI systems telemetry', 'Edge rating framework', 'Competitor analysis'],
    status: 'building',
    priority: 'high'
  },
  {
    id: 'roadmap',
    name: 'Roadmap & Execution Agent',
    shortName: 'Roadmap',
    icon: 'Map',
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-orange-500/5',
    description: '90-day plans, milestone tracking, go/no-go gates. Maps the path from $80M to $1B+ AUM.',
    capabilities: [
      '90-day action plan with owners and deadlines',
      'Milestone tracking across 7 phases (Prove It → The Bridge)',
      'Go/No-Go gate management',
      'Critical hire tracking (COO, CTO)',
      'AUM trajectory visualization'
    ],
    dataSourcesConnected: ['90-day plans', 'Hiring pipeline', 'AUM data'],
    status: 'active',
    priority: 'critical'
  },
  {
    id: 'knowledge',
    name: 'Knowledge & Docs Agent',
    shortName: 'Knowledge',
    icon: 'BookOpen',
    color: 'text-sky-400',
    gradient: 'from-sky-500/20 to-sky-500/5',
    description: 'Central knowledge base and document management. Single source of truth for all Amphibian institutional knowledge.',
    capabilities: [
      'Document library with version control',
      'PDF export for AI/LLM connection',
      'Searchable knowledge base across all documents',
      'SOP and checklist management',
      'Institutional memory preservation'
    ],
    dataSourcesConnected: ['Google Drive', 'Docsend', 'Internal docs'],
    status: 'active',
    priority: 'medium'
  },
  {
    id: 'hiring',
    name: 'People & Growth Agent',
    shortName: 'People',
    icon: 'UserPlus',
    color: 'text-lime-400',
    gradient: 'from-lime-500/20 to-lime-500/5',
    description: 'Hiring pipeline, team development, succession planning. Tracks critical hires and the leadership empowerment plan.',
    capabilities: [
      'Critical hire pipeline (COO, CTO, Quant Researcher)',
      'Team development and succession planning',
      'Compensation philosophy tracking',
      'Operating system per person (1-pager quality scores)',
      'Leadership empowerment plan'
    ],
    dataSourcesConnected: ['Hiring pipeline', 'JD database', 'Interview tracking'],
    status: 'active',
    priority: 'high'
  }
];

export const okrs: OKR[] = [
  {
    id: 'okr-1',
    objective: 'BTC Alpha hits 20 bps/month consistently',
    keyResults: [
      { text: 'Map all 12 BTC yield sources with bps attribution', progress: 70, owner: 'Ross' },
      { text: 'Set BTC Alpha kill criteria (strategy-level)', progress: 50, owner: 'Ty' },
      { text: 'Execute BTC Alpha plan, track weekly', progress: 40, owner: 'Andrew' }
    ],
    quarter: 'Q2 2026',
    status: 'at-risk'
  },
  {
    id: 'okr-2',
    objective: 'Launch Dynamic Alpha with GP capital',
    keyResults: [
      { text: 'Name + structure + sleeve architecture finalized', progress: 60, owner: 'James' },
      { text: 'Manager shortlist (A9 + 2 others per sleeve)', progress: 30, owner: 'Ross' },
      { text: 'GP capital deployed to first sleeve', progress: 10, owner: 'Andrew' }
    ],
    quarter: 'Q3 2026',
    status: 'on-track'
  },
  {
    id: 'okr-3',
    objective: 'Hire COO and CTO',
    keyResults: [
      { text: 'COO job description posted and search active', progress: 80, owner: 'James' },
      { text: 'COO hired or offer extended by June', progress: 20, owner: 'James' },
      { text: 'CTO candidates identified by April', progress: 40, owner: 'James' }
    ],
    quarter: 'Q2 2026',
    status: 'on-track'
  },
  {
    id: 'okr-4',
    objective: 'Establish SMA infrastructure',
    keyResults: [
      { text: 'Identify custodial/PB partners for SMA', progress: 50, owner: 'Ross' },
      { text: 'Legal/ops framework + PB evaluation', progress: 30, owner: 'Timon' },
      { text: 'First manager integrated (read-only data feed)', progress: 10, owner: 'Timon' }
    ],
    quarter: 'Q2 2026',
    status: 'at-risk'
  },
  {
    id: 'okr-5',
    objective: 'Build AI edge infrastructure (Layer 1-3)',
    keyResults: [
      { text: 'Regime classifier v0.1: architecture + data sources defined', progress: 30, owner: 'Timon' },
      { text: 'Strategy performance database built', progress: 40, owner: 'Sahir' },
      { text: 'Risk dashboard v1 deployed', progress: 50, owner: 'Timon' }
    ],
    quarter: 'Q2-Q3 2026',
    status: 'on-track'
  }
];

export const kpis: KPI[] = [
  { id: 'kpi-1', name: 'AUM', value: '$100M+', target: '$1B+', trend: 'up', category: 'Growth' },
  { id: 'kpi-2', name: 'Edge Rating', value: '5.1/10', target: '7.0/10', trend: 'flat', category: 'Strategy' },
  { id: 'kpi-3', name: 'BTC Alpha YTD', value: '-3.08%', target: '+20 bps/mo', trend: 'down', category: 'Performance' },
  { id: 'kpi-4', name: 'USD Alpha YTD', value: '+3.59%', target: '+10%+', trend: 'up', category: 'Performance' },
  { id: 'kpi-5', name: 'Team Size', value: '14', target: '16-18', trend: 'flat', category: 'People' },
  { id: 'kpi-6', name: 'Revenue', value: '$1.6-2M', target: '$3-4M', trend: 'flat', category: 'Financial' },
  { id: 'kpi-7', name: 'Managers Tracked', value: '800+', target: '1000+', trend: 'up', category: 'Intelligence' },
  { id: 'kpi-8', name: 'Compliance Findings', value: '0', target: '0', trend: 'flat', category: 'Governance' }
];

export const roadmapPhases = [
  { phase: 'PROVE IT', when: 'Q2 2026', edge: '5.1 → 5.5', description: 'Hit 20 bps/month on BTC Alpha. Hire COO + CTO. A9 audit underway.', status: 'active' as const },
  { phase: 'LAUNCH', when: 'Q3 2026', edge: '5.5 → 6.0', description: 'Dynamic Alpha live with GP capital. COO running daily ops.', status: 'upcoming' as const },
  { phase: 'SCALE', when: 'Q4 2026', edge: '6.0 → 6.5', description: 'BTC Alpha proven. Dynamic Alpha open to LPs. Fund ops automation v1.', status: 'upcoming' as const },
  { phase: 'GROW', when: 'H1 2027', edge: '6.5 → 7.0', description: 'Regime classifier live. AUM: $200-300M. Fund Ops beta.', status: 'upcoming' as const },
  { phase: 'INSTITUTIONAL', when: 'H2 2027', edge: '7.0 → 7.5', description: 'Board governance in place. $300-400M AUM. AI Fund Ops product launched.', status: 'upcoming' as const },
  { phase: 'COMPOUND', when: '2028', edge: '7.5 → 8.0', description: '20+ managers. Multiple revenue lines. $500-750M AUM.', status: 'upcoming' as const },
  { phase: 'THE BRIDGE', when: '2029-30', edge: '8.0 → 8.5', description: '$1B+ ecosystem AUM. Multi-asset digital finance platform.', status: 'upcoming' as const }
];

export const aiLayers = [
  { layer: 1, name: 'Regime Classification', edge: '+100-150 bps', priority: 'HIGH', description: 'Multi-modal model classifying market state', status: 30 },
  { layer: 2, name: 'Signal Generation', edge: '+100-200 bps', priority: 'MEDIUM', description: 'Transformer models on order flow, sentiment, on-chain', status: 15 },
  { layer: 3, name: 'Dynamic Risk Management', edge: '+75-125 bps', priority: 'HIGH', description: 'Real-time position sizing based on regime', status: 25 },
  { layer: 4, name: 'Execution Optimization', edge: '+50-100 bps', priority: 'MEDIUM', description: 'AI-optimized order routing across 15+ venues', status: 10 },
  { layer: 5, name: 'Manager Selection', edge: '+75-125 bps', priority: 'HIGH', description: 'ML models for manager behavior prediction', status: 40 },
  { layer: 6, name: 'Operational Efficiency', edge: '+50-100 bps', priority: 'ONGOING', description: 'Automated reconciliation, compliance, reporting', status: 35 }
];

// ── Andrew's 8-Agent Product Strategy Assessment (Mar 9, 2026) ──

export interface EdgePillar {
  name: string;
  rating: number;
  maxRating: number;
  reality: string;
}

export interface ProductTarget {
  product: string;
  targetReturn: string;
  maxDrawdown: string;
  source: string;
  honestReality: string;
  status: 'live' | 'pre-launch' | 'concept';
}

export interface StrategicPath {
  name: string;
  description: string;
  upside: string;
  risk: string;
  timeline: string;
  agentRating: string;
}

export const edgeAssessment = {
  bridgeV3Rating: 5.1,
  andrewConsensusRating: 4,
  targetRating: 7,
  targetTimeline: '12 months',
  pillars: [
    {
      name: 'Process (UNITE)',
      rating: 3,
      maxRating: 10,
      reality: 'Framework published but not operationalized. The Integrate decision layer doesn\'t exist as executable logic. Decisions happen through judgment and discussion — not backtestable, not systematizable, not defensible in institutional DD.',
    },
    {
      name: 'Data',
      rating: 6,
      maxRating: 10,
      reality: 'Manager data pipeline (DDQ, live track records, on-chain exposure monitoring) is a real technical asset. The Navigate layer is where Amphibian is strongest. But data without a decision layer on top is infrastructure, not edge.',
    },
    {
      name: 'Relationships',
      rating: 5,
      maxRating: 10,
      reality: 'Real but depreciating. A9 JV works because of personal trust, not structural advantage. Must be converted to systematic advantage — formalized JVs, documented allocation capacity, multi-contact redundancy.',
    },
  ] as EdgePillar[],
  pathTo7: [
    'Operationalize UNITE Integrate as a documented decision framework — testable, backtestable, attributable — by Q2',
    'Integrate Mantis-style counterparty risk monitoring into the allocation loop',
    'Formalize A9 JV with operational transparency and kill criteria',
    'Build regime classifier v0.1 that demonstrably improves allocation timing',
  ],
  threeNonNegotiables: [
    {
      name: 'BTC Alpha at 20 bps/month by Q3',
      owner: 'Ty',
      detail: '20 bps/month (~2.4% annualized) is a minimum viability test. If we can\'t deliver this with our current roster, the product thesis is broken.',
    },
    {
      name: 'A9 audit clean by June',
      owner: 'Ross / Ty',
      detail: 'Needs specificity: internal review vs. third-party ODD (Castle Hall, Albourne). If meant to satisfy LP diligence, needs to be external. Also needs documented kill criteria.',
    },
    {
      name: 'Bus factor eliminated by September',
      owner: 'James',
      detail: 'Needs testable definition: 3 critical LP relationships have documented secondary contacts, and 2 of 3 critical functions have a named backup who can operate independently for 30 days.',
    },
  ],
};

export const productTargets: ProductTarget[] = [
  {
    product: 'BTC Alpha',
    targetReturn: '6-8% net annualized (BTC terms)',
    maxDrawdown: '<5% annual',
    source: '8-agent consensus',
    honestReality: '2024 ~14% was inflated by FTX recovery. 2025 (-3.08%) and 2026 YTD (+0.03%) reflect the real yield environment. Ross\'s 30-50 bps/month is the correct baseline.',
    status: 'live',
  },
  {
    product: 'Dynamic Alpha',
    targetReturn: '12-18% net annualized',
    maxDrawdown: '<10% max drawdown',
    source: '8-agent consensus (conservative)',
    honestReality: 'Pre-launch. Extrapolating from A9 standalone. 20%+ in 2024-25 is exceptional but unproven at scale and through a deep bear cycle. Launch with conservative guardrails.',
    status: 'pre-launch',
  },
];

export const strategicPaths2030: StrategicPath[] = [
  {
    name: 'Proprietary Signal Generation',
    description: 'Bandit, Seneca, regime classifier become internally-managed alpha streams. Dynamic Alpha evolves from external-manager SMA to internally-driven multi-strat.',
    upside: 'Highest upside — own the alpha',
    risk: 'Highest risk — backtests are not live performance. Need 12-18 months live trading.',
    timeline: '2027-2028',
    agentRating: 'Highest-upside, highest-risk',
  },
  {
    name: 'Intelligence Platform',
    description: 'UNITE framework + manager data pipeline + regime classification + Mantis-style risk monitoring, designed as a platform that could be licensed to other crypto funds and family offices.',
    upside: '$5-20M ARR potential. Most defensible moat.',
    risk: 'Requires significant engineering investment and product-market fit validation.',
    timeline: '2027-2029',
    agentRating: 'Most defensible moat',
  },
  {
    name: 'Infrastructure-Aware Allocation',
    description: 'Moving from "which managers" to "which protocols, which chains, which custody rails" as on-chain finance matures. Routing capital across DeFi and CeFi based on regime.',
    upside: 'The real 2030 moat — allocation layer for tokenized capital markets',
    risk: 'Requires on-chain ecosystem to mature significantly. 2028+ opportunity.',
    timeline: '2028-2030',
    agentRating: 'Best long-term, but distant',
  },
];

export const yieldEnvironment = {
  compressed: [
    'Basis trades: 300-400 bps → 20-50 bps',
    'Protocol yields (Curve, Aave): 8-12% → 1-4%',
    'Institutional capital inflow + AI competition accelerating compression',
  ],
  notCompressed: [
    'Infrastructure arbitrage — pricing discrepancies between CeFi/DeFi (persistent)',
    'Volatility harvesting during leverage spikes (episodic, 100%+ annualized during events)',
    'Cross-chain regime arbitrage — rotating yield opportunities across L1s/L2s',
  ],
  consensus: '7/8 agents agree yields are structurally compressed. Macro Strategist dissents: could reach 10-12% if regime classification adds 300-500 bps.',
};
