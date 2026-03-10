// =============================================================================
// Team Operating System — Amphibian Capital
// Integrates 360 feedback, personal operating systems, role qualities,
// RDS (Remove/Delegate/Systematize) framework, and personal risk framework.
// =============================================================================

export interface TeamOS {
  memberId: string;
  // 360 Feedback Summary
  feedback360: {
    winsForTeam: string[];
    makesHarder: string[];
    startDoing: string[];
    stopDoing: string[];
    supportNeeded: string[];
    roleClarity: string[];
    highLeverageMoves: string[];
  };
  // Personal Operating System
  operatingSystem: {
    seat: string;
    notThisSeat: string;
    morningChecklist: string[];
    commitments: string[];
    decisionFilter: string[];
    eveningReflection: string[];
    weeklyPulse: string[];
    mantra: string;
  };
  // Role Qualities (best-in-class self-assessment)
  qualities: {
    name: string;
    description: string;
    feedbackSays: string;
    weeklyQuestion: string;
    score: number;
  }[];
  // RDS Framework
  rdsFramework: {
    remove: { item: string; reason: string; status: 'identified' | 'in-progress' | 'done' }[];
    delegate: { item: string; delegateTo: string; status: 'identified' | 'in-progress' | 'done' }[];
    systematize: { item: string; system: string; status: 'identified' | 'in-progress' | 'done' }[];
  };
  // Risk Framework
  riskFramework: {
    personalRisks: { risk: string; likelihood: 'high' | 'medium' | 'low'; impact: 'high' | 'medium' | 'low'; mitigation: string }[];
    decisionPrinciples: string[];
    redLines: string[];
  };
}

// =============================================================================
// JAMES — CEO
// =============================================================================
export const jamesOS: TeamOS = {
  memberId: 'james',

  feedback360: {
    winsForTeam: [
      'Relentless follow-through and urgency — drives momentum across the firm',
      'Capital raising capability — converts pipeline into committed capital',
      'High ownership and leads by example — never asks the team to do what he would not do',
      'Decisive under uncertainty — makes the call when others stall',
      'Sets a high performance bar — raises the standard for the whole team',
    ],
    makesHarder: [
      'Priority churn without closure — new priorities land before old ones are resolved',
      'Delegation too broad — ownership is assigned without clear DoD or single owner',
      'Emotional intensity under pressure — reactive tone can shut down dialogue',
      'Decision rationale not communicated — team hears the what but not the why',
      'Long AI-generated writeups — context dumps dilute the signal',
      'Feedback can land diminishing — directness without enough care reduces openness',
      'Special LP asks accepted without gate — bespoke work enters the system with no filter',
      'Reversing decisions in side conversations — undermines alignment built in group settings',
      'Messaging implies doing everything alone — erodes team ownership narrative',
      'CEO/CIO lane not reinforced — boundary blur creates confusion on decision authority',
    ],
    startDoing: [
      'Weekly priorities with owners and Definition of Done',
      'Decision log for major calls — written, timestamped, rationale included',
      'Weekly blocker-solving forum — structured venue for removing obstacles',
      'Company-wide focused measurable goals — fewer goals, clearer scoreboard',
      'Comms standard — decisions first, one page max, no AI context dumps',
    ],
    stopDoing: [
      'Bespoke deliverables without owner, deadline, or impact assessment',
      'Changing priorities without closing old work first',
      'Delegating without clear ownership and Definition of Done',
      'Reacting with rash judgment under pressure',
      'Long AI context dumps as primary communication format',
      'Reversing decisions in informal channels or side conversations',
      'Adding tasks without priority, timeline, or reason',
      'Feedback with tone that reduces openness rather than building it',
      'Blurring CEO vs CIO boundaries on portfolio decisions',
      'Leaning on the "I do everything" narrative',
    ],
    supportNeeded: [
      'COO-style execution partner to translate direction into tracked deliverables',
      'Crisp LP-ready data support — clean numbers on demand, not scrambled before meetings',
      'Dedicated growth/sales leader to own pipeline and outbound',
      'Formal governance signaling — board and chair rhythm that reinforces structure',
      'Operational translation support — someone who converts CEO intent into team-ready specs',
    ],
    roleClarity: [
      'What the CEO decides solo vs what requires CIO or board input',
      'Who has final say on portfolio decisions — CIO authority must be explicit',
      'Formal process for changing firm priorities mid-cycle',
      'LP messaging approval gates — who signs off before it goes out',
      'Board and chair input expectations — advisory vs binding',
    ],
    highLeverageMoves: [
      'Publish the weekly top-3 priorities with owners and DoD — make it visible to the whole team',
      'Launch the decision log and use it for the first three major calls',
      'Run the first weekly blocker-solving forum and iterate the format',
      'Draft the CEO/CIO lane document with Ty and share with the team',
      'Commit to one-page comms standard and hold yourself to it publicly',
    ],
  },

  operatingSystem: {
    seat: 'CEO — Direction, governance, runway, culture',
    notThisSeat: 'Portfolio construction, IC work, execution details',
    morningChecklist: [
      'Am I regulated? Am I at earth pace?',
      'My 3 priorities today with owners and DoD',
      'What am I NOT doing today?',
    ],
    commitments: [
      'Stay in lane — CEO work only',
      'Clear ownership and DoD on everything I assign',
      'One direction at a time — finish before pivoting',
      'Grounded pace — urgency is earned, not default',
      'Hard calls early, delivered with love',
      'Decisions in the room, not in side channels',
      'Proof over narrative — show, do not tell',
    ],
    decisionFilter: [
      'Is this about clarity or urgency?',
      'Is this for Amphibian or for me?',
      'Who should own this?',
      'Am I communicating the why?',
      'Room or side channel?',
    ],
    eveningReflection: [
      'What went well today?',
      'Tension dump to Risk Journal — get it out of my head',
      'Clean up reactive messages within 24 hours',
    ],
    weeklyPulse: [
      'Is the priority stack right? Has anything shifted without closure?',
      'Where did I slip on commitments this week?',
      'Risk journal actions — anything I surfaced that needs follow-through?',
      'Is each person empowered, clear, and unblocked?',
      'One thing I am grateful for about this team',
    ],
    mantra: 'Clarity, consistency, ground — not speed.',
  },

  qualities: [
    {
      name: 'Paranoid Clarity',
      description: 'See risks early, name them before they compound',
      feedbackSays: 'James spots threats others miss but sometimes creates urgency where patience is warranted',
      weeklyQuestion: 'Did I name risks early this week without creating unnecessary panic?',
      score: 4,
    },
    {
      name: 'Grounded Pace',
      description: 'Regulated, not urgent-driven — earth pace over fire pace',
      feedbackSays: 'When James is grounded the team performs at its best; when reactive, the team contracts',
      weeklyQuestion: 'Did I operate at a grounded pace or did urgency drive my decisions?',
      score: 3,
    },
    {
      name: 'Empowered Delegation',
      description: 'Clear ownership with real authority — not just task assignment',
      feedbackSays: 'Delegation often lacks a single owner, DoD, or deadline — people are assigned but not empowered',
      weeklyQuestion: 'Did every delegation this week have one owner, a written outcome, and a deadline?',
      score: 3,
    },
    {
      name: 'Truth with Love',
      description: 'Bluntness paired with genuine care — direct without diminishing',
      feedbackSays: 'Directness is valued but tone under pressure can shut people down',
      weeklyQuestion: 'Did my feedback this week land with both honesty and care?',
      score: 4,
    },
    {
      name: 'Product Obsession',
      description: 'Edge is measured, not assumed — product quality is the proof',
      feedbackSays: 'James drives product quality but sometimes substitutes narrative for measurement',
      weeklyQuestion: 'Am I measuring our edge or just assuming it?',
      score: 3,
    },
    {
      name: 'Narrative Power',
      description: 'Rally, align, and communicate — bring people into the vision',
      feedbackSays: 'James is the strongest communicator on the team; LPs and team rally behind his framing',
      weeklyQuestion: 'Did my communications this week rally people or just inform them?',
      score: 5,
    },
    {
      name: 'Radical Ownership',
      description: 'Own it clean, no drama — accountability without victimhood',
      feedbackSays: 'High ownership but occasionally slips into the "I do everything" narrative which undermines team ownership',
      weeklyQuestion: 'Did I own outcomes this week without drama or martyr energy?',
      score: 4,
    },
    {
      name: 'Protector Energy',
      description: 'Protect capital, culture, and standards — guardian of what matters',
      feedbackSays: 'Team trusts James to protect what matters; occasionally over-indexes on control vs trust',
      weeklyQuestion: 'Did I protect our standards this week while trusting the team to execute?',
      score: 4,
    },
  ],

  rdsFramework: {
    remove: [
      { item: 'IC portfolio work', reason: 'CIO lane — CEO involvement blurs authority and slows decisions', status: 'in-progress' },
      { item: 'Accepting bespoke LP requests without gate', reason: 'Creates unscoped work that displaces priorities', status: 'identified' },
      { item: 'Long AI context dumps as communication', reason: 'Dilutes signal and overwhelms recipients', status: 'in-progress' },
      { item: 'Reversing decisions in side conversations', reason: 'Undermines alignment and erodes team trust in group decisions', status: 'identified' },
    ],
    delegate: [
      { item: 'Daily operations execution', delegateTo: 'COO (when hired)', status: 'identified' },
      { item: 'LP data preparation and reporting packages', delegateTo: 'Thao', status: 'in-progress' },
      { item: 'Sales motion and outbound pipeline', delegateTo: 'Growth leader (when hired)', status: 'identified' },
      { item: 'Portfolio change documentation', delegateTo: 'Ross', status: 'identified' },
    ],
    systematize: [
      { item: 'Weekly top-3 priorities with owners and DoD', system: 'Monday priority publish — visible to entire team with tracking', status: 'in-progress' },
      { item: 'Decision log and change protocol', system: 'Logged decisions with rationale, timestamp, and reversal process', status: 'identified' },
      { item: 'Delegation standard', system: 'One owner, written outcome, deadline — no exceptions', status: 'identified' },
      { item: 'Comms standard', system: 'Decisions first, one page max, structured format', status: 'identified' },
    ],
  },

  riskFramework: {
    personalRisks: [
      { risk: 'Priority churn creates team confusion and stalled work', likelihood: 'high', impact: 'high', mitigation: 'Weekly top-3 with DoD; no new priority without closing or parking old one' },
      { risk: 'Emotional reactivity damages trust and shuts down dialogue', likelihood: 'medium', impact: 'high', mitigation: 'Morning regulation check; evening tension dump; 24hr cleanup rule' },
      { risk: 'CEO/CIO boundary blur causes decision confusion', likelihood: 'medium', impact: 'high', mitigation: 'Published lane document with Ty; hold the line publicly' },
      { risk: 'Burnout from carrying too many functions', likelihood: 'high', impact: 'medium', mitigation: 'RDS framework execution; hire COO and growth leader' },
      { risk: 'Side-channel decisions undermine group alignment', likelihood: 'medium', impact: 'high', mitigation: 'Decisions in the room only; decision log as single source of truth' },
    ],
    decisionPrinciples: [
      'Is this about clarity or urgency?',
      'Who should own this?',
      'Am I communicating the why?',
      'Is this CEO work or IC work?',
      'Room or side channel?',
    ],
    redLines: [
      'Never make portfolio decisions — that is the CIO lane',
      'Never promise LPs without an owner, deadline, and impact assessment',
      'Never reverse decisions in side channels — all reversals go through the decision log',
    ],
  },
};

// =============================================================================
// TODD — President & IR
// =============================================================================
export const toddOS: TeamOS = {
  memberId: 'todd',

  feedback360: {
    winsForTeam: [
      'Deep LP relationships built on trust and consistency',
      'Institutional-grade communication — polished, credible, precise',
      'Governance maturity advocate — pushes the firm toward best practices',
      'Calm under pressure with LPs — de-escalates where others might react',
      'Bridge between CEO vision and LP expectations',
    ],
    makesHarder: [
      'LP communications sometimes go out without final CIO/CEO review',
      'Ad-hoc LP responses create inconsistent messaging',
      'Governance recommendations lack implementation timelines',
      'IR process depends on tribal knowledge rather than documented SOPs',
      'Redemption process not fully formalized — creates risk in stressed markets',
    ],
    startDoing: [
      'Standardized LP update cadence with sign-off gates',
      'Redemption playbook with clear triggers and process steps',
      'Monthly LP sentiment pulse — track trust trajectory',
      'Governance maturity roadmap with quarterly milestones',
      'Pre-approved messaging templates for common LP questions',
    ],
    stopDoing: [
      'Sending LP communications without documented sign-off',
      'Responding to LP queries ad-hoc without checking for firm-level consistency',
      'Deferring governance implementation details to later',
      'Assuming LP expectations — verify with data and direct conversation',
      'Over-customizing responses per LP when a standard will serve',
    ],
    supportNeeded: [
      'Dedicated ops support for LP data prep and reporting packages',
      'Clear approval gates for LP-facing materials',
      'CIO-provided performance narratives on a reliable cadence',
      'Technology support for investor portal and CRM',
    ],
    roleClarity: [
      'Who approves LP-facing communications — Todd, James, or both?',
      'What is the escalation path for LP complaints or redemption requests?',
      'Who owns the investor portal content and update cadence?',
      'What decisions can Todd make independently vs requiring CEO input?',
    ],
    highLeverageMoves: [
      'Publish the LP update cadence and get CEO/CIO sign-off on the calendar',
      'Draft the redemption playbook and circulate for review',
      'Launch monthly LP sentiment tracking — even if lightweight',
      'Formalize the top 10 LP FAQ with pre-approved responses',
    ],
  },

  operatingSystem: {
    seat: 'President & IR — LP trust, investor communications, governance maturity',
    notThisSeat: 'Portfolio decisions, daily operations, sales/BD outbound',
    morningChecklist: [
      'Any LP communications pending sign-off?',
      'Key LP meetings or calls today — am I prepared with current data?',
      'What governance item can I move forward today?',
    ],
    commitments: [
      'No LP communication goes out without documented approval',
      'Consistent messaging — every LP gets the same quality of truth',
      'Governance is not optional — push for formalization even when uncomfortable',
      'Surface LP sentiment early — do not wait for problems to find us',
      'Build institutional trust, not personal relationships alone',
    ],
    decisionFilter: [
      'Does this strengthen or weaken LP trust?',
      'Is this consistent with what we have told other LPs?',
      'Does this need CEO review before it goes out?',
      'Am I solving the root cause or just the symptom?',
    ],
    eveningReflection: [
      'Did any LP interaction surface a risk I need to escalate?',
      'Are all pending LP responses on track?',
      'Did I push governance forward today or just maintain?',
    ],
    weeklyPulse: [
      'LP sentiment — any shifts in trust or concern levels?',
      'Governance milestones — on track or drifting?',
      'Redemption risk — any signals from the LP base?',
      'Communication consistency — any messages that went out misaligned?',
      'Relationship health — which LPs need proactive outreach?',
    ],
    mantra: 'Trust is built in drops and lost in buckets.',
  },

  qualities: [
    {
      name: 'LP Empathy',
      description: 'Understand LP perspective, concerns, and decision-making context deeply',
      feedbackSays: 'Todd reads LP sentiment well but sometimes under-communicates internally about what he is hearing',
      weeklyQuestion: 'Did I surface LP sentiment to the team this week before it became a problem?',
      score: 4,
    },
    {
      name: 'Communication Precision',
      description: 'Every word to an LP is deliberate, accurate, and consistent with firm positioning',
      feedbackSays: 'Communications are polished but occasionally go out without full CIO review of performance data',
      weeklyQuestion: 'Did every LP communication this week go through proper review?',
      score: 4,
    },
    {
      name: 'Process Discipline',
      description: 'IR runs on process, not heroics — repeatable, documented, reliable',
      feedbackSays: 'Good instincts but processes are often in Todd head rather than documented',
      weeklyQuestion: 'Did I document a process this week that currently lives only in my head?',
      score: 3,
    },
    {
      name: 'Trust Architecture',
      description: 'Build institutional trust that survives personnel changes — not just personal rapport',
      feedbackSays: 'LP relationships are strong but over-indexed on personal rapport vs institutional credibility',
      weeklyQuestion: 'Did I advance institutional trust this week — not just personal relationships?',
      score: 3,
    },
    {
      name: 'Institutional Readiness',
      description: 'Push the firm toward institutional-grade standards in governance and reporting',
      feedbackSays: 'Strong advocate for governance but follow-through on implementation timelines can drift',
      weeklyQuestion: 'Did I advance a governance milestone this week with a concrete deliverable?',
      score: 3,
    },
  ],

  rdsFramework: {
    remove: [
      { item: 'Ad-hoc LP responses without checking firm consistency', reason: 'Creates messaging risk and inconsistency across LP base', status: 'identified' },
      { item: 'LP communications without documented sign-off', reason: 'Risk of misaligned or premature information reaching investors', status: 'in-progress' },
      { item: 'Tribal knowledge IR processes', reason: 'Single point of failure — if Todd is unavailable, process breaks', status: 'identified' },
    ],
    delegate: [
      { item: 'LP data gathering and reporting package assembly', delegateTo: 'Thao', status: 'in-progress' },
      { item: 'Investor portal content updates', delegateTo: 'Thao', status: 'identified' },
      { item: 'Meeting scheduling and logistics for LP calls', delegateTo: 'Ops support', status: 'identified' },
    ],
    systematize: [
      { item: 'LP update cadence', system: 'Quarterly letters, monthly data updates, annual meetings — calendar with owners and deadlines', status: 'in-progress' },
      { item: 'LP FAQ and pre-approved responses', system: 'Living document with version control and sign-off log', status: 'identified' },
      { item: 'Redemption playbook', system: 'Trigger-based process with escalation path, timeline, and communication templates', status: 'identified' },
    ],
  },

  riskFramework: {
    personalRisks: [
      { risk: 'LP surprise from misaligned or late communication', likelihood: 'medium', impact: 'high', mitigation: 'Standardized update cadence with approval gates and calendar commitments' },
      { risk: 'Communication gaps between IR and investment team', likelihood: 'medium', impact: 'high', mitigation: 'Weekly sync with CIO for performance narrative; documented handoff process' },
      { risk: 'Redemption process failure under stress', likelihood: 'low', impact: 'high', mitigation: 'Formalized redemption playbook tested with tabletop exercise' },
      { risk: 'Over-reliance on personal relationships vs institutional credibility', likelihood: 'medium', impact: 'medium', mitigation: 'Governance maturity roadmap and institutional-grade materials' },
    ],
    decisionPrinciples: [
      'Does this strengthen or weaken LP trust?',
      'Is this consistent with what we have told other LPs?',
      'Does this need CEO or CIO review before going out?',
      'Am I solving the root cause or just managing the symptom?',
      'Would this process survive if I were unavailable for a week?',
    ],
    redLines: [
      'Never send LP communications with performance data not reviewed by CIO',
      'Never make promises to LPs without documented owner, deadline, and impact',
      'Never customize LP terms without CEO approval and legal review',
    ],
  },
};

// =============================================================================
// TY — CIO
// =============================================================================
export const tyOS: TeamOS = {
  memberId: 'ty',

  feedback360: {
    winsForTeam: [
      'Analytical depth on portfolio construction — decisions are grounded in data',
      'Risk discipline — holds the line on concentration limits and drawdown thresholds',
      'Calm, measured decision-making under market stress',
      'Clear investment thesis articulation when given space',
      'Willingness to make unpopular calls when the data supports it',
    ],
    makesHarder: [
      'Decision speed can lag when perfect data is not available',
      'Portfolio rationale not always communicated proactively to the team',
      'CEO/CIO boundary blur — accepting CEO input on portfolio calls without pushback',
      'Risk governance process exists conceptually but lacks documentation',
      'Ad-hoc position changes without formal change documentation',
    ],
    startDoing: [
      'Published portfolio decision framework — criteria, process, documentation',
      'Proactive weekly portfolio narrative for IR and CEO consumption',
      'Formalized risk governance cadence — monthly risk committee, documented thresholds',
      'Clear pushback protocol when CEO encroaches on CIO lane',
      'Position change log with rationale and timestamp',
    ],
    stopDoing: [
      'Making position changes without documenting rationale',
      'Waiting for perfect data when good-enough data supports a timely decision',
      'Absorbing CEO portfolio input without clear boundary enforcement',
      'Keeping risk governance in head rather than in documented process',
      'Under-communicating portfolio narrative to IR team',
    ],
    supportNeeded: [
      'PM support for portfolio change documentation and monitoring',
      'Engineering support for risk dashboard and regime classifier',
      'CEO lane discipline — mutual commitment to stay in respective seats',
      'Dedicated data infrastructure for portfolio analytics',
    ],
    roleClarity: [
      'CIO has final authority on all portfolio and allocation decisions',
      'What information does CEO receive vs what decisions CEO can influence on portfolio',
      'Risk governance committee composition and decision rights',
      'When does a portfolio decision require board notification?',
    ],
    highLeverageMoves: [
      'Co-author the CEO/CIO lane document with James — publish to team',
      'Launch the position change log and use it for next three allocation decisions',
      'Stand up monthly risk committee with documented thresholds',
      'Provide IR with a weekly portfolio narrative template and commit to filling it',
    ],
  },

  operatingSystem: {
    seat: 'CIO — Portfolio outcomes, risk governance, allocation engine',
    notThisSeat: 'LP communications, firm operations, sales and business development',
    morningChecklist: [
      'Market pulse — any overnight moves requiring attention?',
      'Portfolio risk dashboard — are we within all thresholds?',
      'What is my one highest-leverage portfolio decision today?',
    ],
    commitments: [
      'Own the portfolio — every allocation decision has my name on it',
      'Risk governance is non-negotiable — process over gut',
      'Decision finality — once the call is made, stand behind it',
      'Communicate the why proactively — do not make the team ask',
      'Hold the CEO/CIO boundary — with respect but without compromise',
    ],
    decisionFilter: [
      'What does the data say? What does it not say?',
      'Am I waiting for perfect information or is good-enough sufficient?',
      'Does this decision need to be documented before execution?',
      'Have I communicated the rationale to those who need it?',
    ],
    eveningReflection: [
      'Did I make any portfolio decisions today that need documentation?',
      'Am I carrying any unresolved risk concerns?',
      'Did I communicate proactively or did someone have to ask?',
    ],
    weeklyPulse: [
      'Portfolio risk posture — are we positioned for the current regime?',
      'Decision backlog — any calls I am delaying that need to be made?',
      'Risk governance cadence — did I run the process this week?',
      'Team clarity — does everyone understand current portfolio positioning?',
      'CEO/CIO boundary — did I hold the line this week?',
    ],
    mantra: 'Process protects the portfolio. Data drives the decision.',
  },

  qualities: [
    {
      name: 'Analytical Rigor',
      description: 'Every portfolio decision is grounded in data, tested assumptions, and documented rationale',
      feedbackSays: 'Strong analytical foundation but sometimes over-indexes on data perfection at the expense of timeliness',
      weeklyQuestion: 'Did I make timely decisions this week grounded in sufficient (not perfect) data?',
      score: 4,
    },
    {
      name: 'Risk Discipline',
      description: 'Hold the line on risk limits — thresholds are non-negotiable, not suggestions',
      feedbackSays: 'Risk discipline is strong but governance process needs to be formalized and documented',
      weeklyQuestion: 'Did I enforce risk limits this week through process, not just judgment?',
      score: 4,
    },
    {
      name: 'Decision Finality',
      description: 'Once a portfolio call is made with proper process, stand behind it — no second-guessing without new data',
      feedbackSays: 'Generally strong but can revisit decisions when CEO applies pressure without new information',
      weeklyQuestion: 'Did I stand behind my decisions this week or did I waver under pressure?',
      score: 3,
    },
    {
      name: 'Process Architecture',
      description: 'Build investment and risk processes that survive personnel changes — institutional, not personal',
      feedbackSays: 'Good intuitive processes but many live in Ty head rather than in documented frameworks',
      weeklyQuestion: 'Did I document or formalize an investment process this week?',
      score: 3,
    },
    {
      name: 'Strategic Patience',
      description: 'Hold positions through volatility when the thesis is intact — patience is an edge',
      feedbackSays: 'Strong conviction in positions but needs to better communicate patience rationale to the team',
      weeklyQuestion: 'Did I communicate my conviction rationale clearly when the team felt uncertainty?',
      score: 4,
    },
  ],

  rdsFramework: {
    remove: [
      { item: 'Ad-hoc position changes without documentation', reason: 'Creates audit risk and makes it impossible to evaluate decision quality over time', status: 'in-progress' },
      { item: 'Accepting CEO input on portfolio calls without boundary enforcement', reason: 'Blurs CIO authority and creates confusion about who owns the portfolio', status: 'identified' },
      { item: 'Keeping risk governance in head rather than in process', reason: 'Single point of failure — process must survive personnel changes', status: 'identified' },
    ],
    delegate: [
      { item: 'Portfolio change documentation and monitoring', delegateTo: 'Ross', status: 'in-progress' },
      { item: 'Risk dashboard engineering and data pipeline', delegateTo: 'Timon', status: 'in-progress' },
      { item: 'Manager operational due diligence execution', delegateTo: 'Sahir', status: 'identified' },
    ],
    systematize: [
      { item: 'Portfolio decision framework', system: 'Documented criteria, process, and sign-off requirements for allocation changes', status: 'identified' },
      { item: 'Monthly risk governance committee', system: 'Scheduled cadence with documented thresholds, attendees, and decision log', status: 'identified' },
      { item: 'Weekly portfolio narrative for IR', system: 'Template-driven update delivered on fixed cadence for LP communications', status: 'identified' },
    ],
  },

  riskFramework: {
    personalRisks: [
      { risk: 'Concentration risk from under-diversified allocation', likelihood: 'medium', impact: 'high', mitigation: 'Documented concentration limits with hard thresholds; monthly risk committee review' },
      { risk: 'Decision paralysis from waiting for perfect information', likelihood: 'medium', impact: 'medium', mitigation: 'Decision deadline protocol — if no new data in X days, decide with what you have' },
      { risk: 'Process drift as portfolio complexity grows', likelihood: 'medium', impact: 'high', mitigation: 'Quarterly process audit; formalized risk governance documentation' },
      { risk: 'CEO/CIO boundary erosion undermines portfolio authority', likelihood: 'medium', impact: 'high', mitigation: 'Published lane document; mutual accountability with James' },
    ],
    decisionPrinciples: [
      'What does the data say? What does it not say?',
      'Am I waiting for perfect information or is good-enough sufficient?',
      'Does this decision need documentation before execution?',
      'Have I communicated the rationale to those who need it?',
      'Is this decision consistent with our stated risk framework?',
    ],
    redLines: [
      'Never breach documented risk limits without formal committee approval',
      'Never make allocation changes without documented rationale',
      'Never defer final portfolio authority to the CEO — own the seat fully',
    ],
  },
};

// =============================================================================
// ROSS — PM
// =============================================================================
export const rossOS: TeamOS = {
  memberId: 'ross',

  feedback360: {
    winsForTeam: [
      'Execution precision — deliverables are thorough, on time, and well-structured',
      'Systems thinking — sees how portfolio processes connect across the firm',
      'Reliable manager monitoring — catches issues before they become problems',
      'Willingness to absorb unowned work to keep things moving',
      'Clear written communication on portfolio process matters',
    ],
    makesHarder: [
      'Absorbs unowned work without pushing back — becomes a bottleneck over time',
      'Process documentation inconsistent — some areas well-documented, others tribal',
      'Monitoring gaps when workload exceeds capacity — silent drifting',
      'Insufficient escalation of overload — team does not realize Ross is stretched',
      'Portfolio change documentation not always captured in real time',
    ],
    startDoing: [
      'Push back on unowned work — if it does not have an owner, escalate before absorbing',
      'Real-time portfolio change documentation — capture decisions as they happen',
      'Weekly capacity signal — flag when workload exceeds sustainable level',
      'Standardized manager monitoring checklist with clear escalation triggers',
      'Regular process documentation sprints — convert tribal knowledge to SOPs',
    ],
    stopDoing: [
      'Silently absorbing unowned work without escalation',
      'Deferring portfolio change documentation to later',
      'Working through overload without signaling to the team',
      'Ad-hoc monitoring approaches that vary by manager',
      'Assuming the team knows you are stretched — say it explicitly',
    ],
    supportNeeded: [
      'Clear ownership boundaries — what is PM scope vs what belongs elsewhere',
      'Ops support for administrative and data-gathering tasks',
      'CIO clarity on monitoring priorities and escalation thresholds',
      'Tool investment for portfolio management and change tracking',
    ],
    roleClarity: [
      'What work falls inside PM scope vs what should be escalated or reassigned?',
      'Who owns portfolio change documentation — PM or CIO?',
      'What is the escalation path when monitoring surfaces a concern?',
      'What is PM authority on manager follow-up vs requiring CIO approval?',
    ],
    highLeverageMoves: [
      'Publish the PM scope document — what is in, what is out, what gets escalated',
      'Launch real-time portfolio change documentation process',
      'Create the standardized manager monitoring checklist',
      'Implement weekly capacity check-in — a simple red/yellow/green signal',
    ],
  },

  operatingSystem: {
    seat: 'PM — Execution quality, portfolio process, manager monitoring',
    notThisSeat: 'Portfolio allocation decisions, LP communications, business development',
    morningChecklist: [
      'Any portfolio changes from yesterday that need documentation?',
      'Manager monitoring — any flags or follow-ups due today?',
      'Am I working on owned tasks or absorbing unowned work?',
    ],
    commitments: [
      'Document portfolio changes in real time — not after the fact',
      'Escalate unowned work — do not silently absorb it',
      'Signal capacity honestly — red, yellow, or green',
      'Consistent monitoring process across all managers — no exceptions',
      'Process discipline over heroics — reliability beats intensity',
    ],
    decisionFilter: [
      'Is this my owned responsibility or unowned work I am absorbing?',
      'Does this need documentation before I move on?',
      'Should I escalate this or handle it?',
      'Am I applying the same standard to every manager?',
    ],
    eveningReflection: [
      'Did I absorb any unowned work today without escalating?',
      'Are all portfolio changes from today documented?',
      'Any monitoring flags I need to follow up on tomorrow?',
    ],
    weeklyPulse: [
      'Capacity — am I in the green, yellow, or red zone?',
      'Documentation — is every portfolio change from this week captured?',
      'Monitoring — any managers requiring escalation or deeper review?',
      'Process consistency — did I apply the same standard everywhere?',
      'Unowned work — did I absorb anything without pushing back?',
    ],
    mantra: 'Reliable process beats heroic effort every time.',
  },

  qualities: [
    {
      name: 'Execution Precision',
      description: 'Deliverables are thorough, accurate, and on time — quality is the default, not the exception',
      feedbackSays: 'Execution quality is high but capacity management needs work — quality drops when overloaded',
      weeklyQuestion: 'Did every deliverable this week meet my quality standard?',
      score: 4,
    },
    {
      name: 'Systems Thinking',
      description: 'See how portfolio processes connect — upstream changes have downstream effects',
      feedbackSays: 'Strong systems perspective but does not always communicate connections to the broader team',
      weeklyQuestion: 'Did I identify and communicate a process connection this week that others might miss?',
      score: 4,
    },
    {
      name: 'Manager Judgment',
      description: 'Evaluate manager quality, flag concerns early, and monitor with consistent rigor',
      feedbackSays: 'Good judgment on managers but monitoring process needs standardization across the book',
      weeklyQuestion: 'Did I apply consistent monitoring standards to every manager this week?',
      score: 3,
    },
    {
      name: 'Process Discipline',
      description: 'Follow the process every time — documentation, escalation, and standards are non-negotiable',
      feedbackSays: 'Strong process instincts but documentation can lag when workload spikes',
      weeklyQuestion: 'Did I complete all documentation in real time this week?',
      score: 3,
    },
    {
      name: 'Communication Clarity',
      description: 'Surface issues, status, and concerns clearly — no one should have to guess',
      feedbackSays: 'Written communication is clear but verbal escalation of overload or concerns can be too quiet',
      weeklyQuestion: 'Did I surface every concern and status update proactively this week?',
      score: 3,
    },
  ],

  rdsFramework: {
    remove: [
      { item: 'Silently absorbing unowned work', reason: 'Creates single point of failure and masks resourcing problems from leadership', status: 'identified' },
      { item: 'Ad-hoc monitoring approaches that vary by manager', reason: 'Inconsistency creates blind spots and makes it harder to compare manager quality', status: 'in-progress' },
      { item: 'Deferred portfolio change documentation', reason: 'After-the-fact documentation is less accurate and creates audit risk', status: 'identified' },
    ],
    delegate: [
      { item: 'Administrative data gathering for manager reviews', delegateTo: 'Sahir', status: 'identified' },
      { item: 'Routine performance data compilation', delegateTo: 'Thao', status: 'identified' },
      { item: 'Meeting scheduling and logistics for manager calls', delegateTo: 'Ops support', status: 'identified' },
    ],
    systematize: [
      { item: 'Portfolio change documentation process', system: 'Real-time capture template triggered by any allocation or manager change', status: 'in-progress' },
      { item: 'Manager monitoring checklist', system: 'Standardized checklist with escalation triggers applied uniformly across all managers', status: 'identified' },
      { item: 'Weekly capacity signal', system: 'Red/yellow/green self-assessment shared with CIO and CEO every Monday', status: 'identified' },
    ],
  },

  riskFramework: {
    personalRisks: [
      { risk: 'Carrying unowned work until it becomes a bottleneck', likelihood: 'high', impact: 'medium', mitigation: 'Escalation protocol — if work has no owner, flag within 24 hours' },
      { risk: 'Process inconsistency across managers creates blind spots', likelihood: 'medium', impact: 'high', mitigation: 'Standardized monitoring checklist applied to every manager without exception' },
      { risk: 'Monitoring gaps during capacity overload', likelihood: 'medium', impact: 'high', mitigation: 'Weekly capacity signal and prioritized monitoring when in yellow/red' },
      { risk: 'Documentation lag creates audit and compliance exposure', likelihood: 'medium', impact: 'medium', mitigation: 'Real-time documentation process with same-day capture requirement' },
    ],
    decisionPrinciples: [
      'Is this my owned responsibility or unowned work?',
      'Does this need documentation before I move on?',
      'Should I escalate this or handle it myself?',
      'Am I applying the same standard to every manager?',
      'Am I at capacity — and if so, have I signaled it?',
    ],
    redLines: [
      'Never defer portfolio change documentation beyond same day',
      'Never absorb unowned work for more than 24 hours without escalating',
      'Never apply different monitoring standards to different managers',
    ],
  },
};

// =============================================================================
// ANDREW — Strategy
// =============================================================================
export const andrewOS: TeamOS = {
  memberId: 'andrew',

  feedback360: {
    winsForTeam: [
      'Governance architecture — builds frameworks that make the firm more institutional',
      'Cross-entity vision — sees how fund structures, compliance, and operations connect',
      'Risk awareness — identifies structural risks that others overlook',
      'Strategic synthesis — connects regulatory, operational, and business threads',
      'Willingness to do unglamorous compliance work that protects the firm',
    ],
    makesHarder: [
      'Peace-keeping at the expense of escalation — smooths over issues that need to surface',
      'Governance agreements sometimes lack implementation specifics',
      'Compliance gaps can sit unaddressed when workload shifts to SMA setup',
      'Cross-entity complexity not always communicated in accessible terms',
      'Operational security assumptions not always validated',
    ],
    startDoing: [
      'Escalation-first approach for governance gaps — surface before smoothing',
      'Compliance gap tracker with owner, deadline, and severity rating',
      'Monthly governance health check — documented status of all agreements',
      'Accessible summaries of cross-entity structures for team consumption',
      'Quarterly operational security review with documented findings',
    ],
    stopDoing: [
      'Peace-keeping when the situation requires escalation',
      'Governance agreements without implementation timelines and owners',
      'Letting compliance items drift when other priorities take over',
      'Assuming team understands entity structures — verify and educate',
      'Treating operational security as someone else responsibility',
    ],
    supportNeeded: [
      'Legal counsel access for compliance and structural questions',
      'CEO clarity on governance implementation priorities',
      'Ops support for routine compliance monitoring and documentation',
      'Regular time allocation for governance work vs SMA demands',
    ],
    roleClarity: [
      'Who owns compliance monitoring day-to-day — Andrew or outsourced?',
      'What is the escalation path for governance gaps?',
      'How does SMA work interact with fund-level governance responsibilities?',
      'Who has authority to sign off on cross-entity agreements?',
    ],
    highLeverageMoves: [
      'Launch the compliance gap tracker and populate with known items',
      'Document the top 5 cross-entity structures in accessible one-pagers',
      'Run the first monthly governance health check',
      'Establish the escalation protocol for governance gaps — written and shared',
    ],
  },

  operatingSystem: {
    seat: 'Strategy — Compliance, governance infrastructure, SMA setup',
    notThisSeat: 'Portfolio decisions, LP relationship management, daily operations execution',
    morningChecklist: [
      'Any compliance deadlines approaching this week?',
      'Governance items — any gaps that need escalation today?',
      'SMA setup — what is the highest-priority structural item?',
    ],
    commitments: [
      'Escalate governance gaps — do not smooth over structural risk',
      'Every governance agreement has an owner, timeline, and implementation plan',
      'Compliance is not optional — track it, own it, close it',
      'Make complex structures accessible — if the team does not understand it, it is not done',
      'Protect the firm through infrastructure, not just intentions',
    ],
    decisionFilter: [
      'Does this protect the firm structurally or just feel productive?',
      'Am I escalating this or peace-keeping?',
      'Does this governance item have an owner and deadline?',
      'Is the team clear on what this means for them?',
    ],
    eveningReflection: [
      'Did I escalate something today that needed to surface?',
      'Are all compliance items tracked and on schedule?',
      'Did I smooth over anything that should have been escalated?',
    ],
    weeklyPulse: [
      'Compliance tracker — any items past due or at risk?',
      'Governance health — are all agreements on track for implementation?',
      'SMA progress — structural milestones hit or missed?',
      'Escalation check — did I surface everything that needed surfacing?',
      'Team clarity — does everyone understand current entity structures?',
    ],
    mantra: 'Governance is protection. Escalation is care.',
  },

  qualities: [
    {
      name: 'Governance Architecture',
      description: 'Build governance frameworks that are institutional-grade — survive personnel changes and scale',
      feedbackSays: 'Strong conceptual frameworks but implementation specifics and timelines often need tightening',
      weeklyQuestion: 'Did I advance governance implementation this week — not just design?',
      score: 4,
    },
    {
      name: 'Risk Awareness',
      description: 'See structural risks that others overlook — compliance, entity, and operational gaps',
      feedbackSays: 'Good at identifying risks but sometimes peace-keeps instead of escalating them',
      weeklyQuestion: 'Did I escalate every structural risk I identified this week?',
      score: 3,
    },
    {
      name: 'Operational Integrity',
      description: 'Ensure operations match what we say — agreements are real, not aspirational',
      feedbackSays: 'Strong intent but gaps between governance design and operational reality can persist',
      weeklyQuestion: 'Is every governance agreement I own actually implemented — not just documented?',
      score: 3,
    },
    {
      name: 'Strategic Synthesis',
      description: 'Connect regulatory, operational, and business threads into coherent strategy',
      feedbackSays: 'Excellent at synthesis but communication of complexity can be inaccessible to non-specialists',
      weeklyQuestion: 'Did I communicate a complex topic this week in terms the whole team can use?',
      score: 4,
    },
    {
      name: 'Cross-Entity Vision',
      description: 'See across fund structures, entities, and regulatory boundaries as one connected system',
      feedbackSays: 'Unique perspective on cross-entity complexity — but team needs more regular education on implications',
      weeklyQuestion: 'Did I help someone on the team understand a cross-entity implication this week?',
      score: 4,
    },
  ],

  rdsFramework: {
    remove: [
      { item: 'Peace-keeping at the expense of escalation', reason: 'Structural risks need to surface early — smoothing delays resolution', status: 'identified' },
      { item: 'Governance agreements without implementation specifics', reason: 'Agreements without timelines and owners are aspirational, not real', status: 'in-progress' },
      { item: 'Letting compliance items drift when SMA demands spike', reason: 'Compliance gaps compound — even short deferral creates exposure', status: 'identified' },
    ],
    delegate: [
      { item: 'Routine compliance monitoring and checklist execution', delegateTo: 'Ops support / outsourced compliance', status: 'identified' },
      { item: 'Document collection and filing for governance agreements', delegateTo: 'Thao', status: 'identified' },
      { item: 'Meeting scheduling for governance reviews', delegateTo: 'Ops support', status: 'identified' },
    ],
    systematize: [
      { item: 'Compliance gap tracker', system: 'Living tracker with owner, deadline, severity, and escalation triggers', status: 'in-progress' },
      { item: 'Monthly governance health check', system: 'Scheduled review of all governance agreements with status and next actions', status: 'identified' },
      { item: 'Cross-entity structure documentation', system: 'Accessible one-pagers for each entity structure, updated quarterly', status: 'identified' },
    ],
  },

  riskFramework: {
    personalRisks: [
      { risk: 'Compliance gaps compound from deferred attention', likelihood: 'medium', impact: 'high', mitigation: 'Compliance gap tracker with severity-based prioritization — high items cannot be deferred' },
      { risk: 'Governance ambiguity creates structural vulnerability', likelihood: 'medium', impact: 'high', mitigation: 'Monthly governance health check; every agreement has implementation timeline' },
      { risk: 'Operational security assumptions not validated', likelihood: 'low', impact: 'high', mitigation: 'Quarterly operational security review with documented findings and remediation' },
      { risk: 'Peace-keeping delays necessary escalation of structural issues', likelihood: 'medium', impact: 'medium', mitigation: 'Personal escalation protocol — if in doubt, surface it' },
    ],
    decisionPrinciples: [
      'Does this protect the firm structurally or just feel productive?',
      'Am I escalating or peace-keeping?',
      'Does this governance item have an owner and deadline?',
      'Is the team clear on what this means for them?',
      'Would this governance framework survive a regulatory inquiry?',
    ],
    redLines: [
      'Never let a compliance gap go untracked — even if resolution is deferred, it must be visible',
      'Never sign off on a governance agreement without implementation specifics',
      'Never smooth over a structural risk that needs CEO or board attention',
    ],
  },
};

// =============================================================================
// MARK — CFO
// =============================================================================
export const markOS: TeamOS = {
  memberId: 'mark',

  feedback360: {
    winsForTeam: [
      'Financial transparency — numbers are clean, honest, and available',
      'Scenario planning for cash runway — the firm knows where it stands',
      'Decision support on resource allocation and hiring',
      'Accounting rigor — keeps the books accurate and audit-ready',
      'Early warning signals on burn rate and budget variance',
    ],
    makesHarder: [
      'Manual reporting processes slow down financial visibility',
      'Budget tools underutilized — spreadsheets where software should be',
      'Accounting gaps from resource constraints — some areas under-monitored',
      'Financial narratives not always translated for non-finance team members',
      'Cash forecasting cadence could be more frequent during growth phases',
    ],
    startDoing: [
      'Automated financial reporting — reduce manual work, increase frequency',
      'Monthly cash runway dashboard — visible to leadership, updated automatically',
      'Budget vs actual review with variance explanations every month',
      'Financial literacy sessions for the team — make numbers accessible',
      'Quarterly scenario planning refresh — not just annual',
    ],
    stopDoing: [
      'Manual reporting when automation is available',
      'Annual-only scenario planning — too infrequent during growth',
      'Assuming the team understands financial implications — translate proactively',
      'Under-investing in budget and accounting tools',
      'Deferring accounting reconciliation when workload spikes',
    ],
    supportNeeded: [
      'Budget for modern financial tools and accounting software',
      'Bookkeeping support for routine transaction processing',
      'CEO clarity on resource allocation priorities for budgeting',
      'Regular access to business plan updates for forecasting',
    ],
    roleClarity: [
      'What financial decisions does the CFO own vs CEO vs board?',
      'Who approves budget variances above a certain threshold?',
      'What is the CFO role in fundraising financial modeling?',
      'When does a cash runway concern trigger board notification?',
    ],
    highLeverageMoves: [
      'Launch the monthly cash runway dashboard with automated data feeds',
      'Implement budget vs actual monthly review process',
      'Migrate top 3 manual reports to automated tools',
      'Run the first quarterly scenario planning refresh',
    ],
  },

  operatingSystem: {
    seat: 'CFO — Financial clarity, budget discipline, cash runway',
    notThisSeat: 'Portfolio performance, LP communications, operational execution',
    morningChecklist: [
      'Cash position — any unexpected movements?',
      'Accounts payable — anything due today or overdue?',
      'Budget variance — any line items trending off track?',
    ],
    commitments: [
      'Financial transparency — the firm always knows where it stands',
      'Early warning — surface financial risks before they become crises',
      'Decision support — translate financial data into actionable insight',
      'Accounting rigor — books are audit-ready at all times',
      'Tool investment — automate what should not be manual',
    ],
    decisionFilter: [
      'Does leadership have the financial clarity to make this decision?',
      'Am I surfacing this risk early enough to act on it?',
      'Is this manual process something I should automate?',
      'Does the team understand the financial implication?',
    ],
    eveningReflection: [
      'Did I surface any financial risks that need escalation?',
      'Are all transactions from today properly recorded?',
      'Is there a manual process I did today that should be automated?',
    ],
    weeklyPulse: [
      'Cash runway — are we on track with projections?',
      'Budget variance — any line items require attention?',
      'Accounting health — are books current and audit-ready?',
      'Tool utilization — am I using available tools or falling back on manual?',
      'Financial communication — does the team have the numbers they need?',
    ],
    mantra: 'Clear numbers. Early warnings. No surprises.',
  },

  qualities: [
    {
      name: 'Financial Transparency',
      description: 'The firm always knows where it stands financially — no ambiguity, no delay',
      feedbackSays: 'Numbers are reliable but reporting cadence can lag during busy periods',
      weeklyQuestion: 'Does leadership have real-time financial clarity right now?',
      score: 4,
    },
    {
      name: 'Scenario Planning',
      description: 'Model multiple futures — best case, base case, worst case — so decisions are informed',
      feedbackSays: 'Good scenario analysis when done but cadence is annual when it should be quarterly',
      weeklyQuestion: 'Are our financial scenarios current — or are we operating on stale assumptions?',
      score: 3,
    },
    {
      name: 'Decision Support',
      description: 'Translate financial data into actionable insight for non-finance leaders',
      feedbackSays: 'Strong analytical support but translations for non-finance team members can be more accessible',
      weeklyQuestion: 'Did I help someone make a better decision this week with financial insight?',
      score: 3,
    },
    {
      name: 'Accounting Rigor',
      description: 'Books are accurate, reconciled, and audit-ready at all times — no shortcuts',
      feedbackSays: 'Solid rigor but resource constraints occasionally cause reconciliation delays',
      weeklyQuestion: 'Are the books current and audit-ready right now?',
      score: 4,
    },
    {
      name: 'Early Warning Signals',
      description: 'Surface financial risks before they become crises — proactive, not reactive',
      feedbackSays: 'Good instincts on risk but formal warning triggers and thresholds are not documented',
      weeklyQuestion: 'Did I surface a financial risk this week before anyone had to ask about it?',
      score: 3,
    },
  ],

  rdsFramework: {
    remove: [
      { item: 'Manual reporting processes', reason: 'Slows down financial visibility and consumes time that should go to analysis', status: 'in-progress' },
      { item: 'Annual-only scenario planning', reason: 'Too infrequent during growth — assumptions go stale', status: 'identified' },
      { item: 'Deferred accounting reconciliation during busy periods', reason: 'Creates audit risk and reduces confidence in numbers', status: 'identified' },
    ],
    delegate: [
      { item: 'Routine bookkeeping and transaction processing', delegateTo: 'Bookkeeper (outsourced)', status: 'in-progress' },
      { item: 'Invoice processing and accounts payable execution', delegateTo: 'Ops support', status: 'identified' },
      { item: 'Data entry for expense tracking', delegateTo: 'Automated tool / Ops support', status: 'identified' },
    ],
    systematize: [
      { item: 'Cash runway forecasting', system: 'Automated dashboard updated weekly with scenario overlays', status: 'identified' },
      { item: 'Budget vs actual review', system: 'Monthly review with variance explanations and leadership summary', status: 'identified' },
      { item: 'Financial early warning triggers', system: 'Documented thresholds that auto-trigger escalation when breached', status: 'identified' },
    ],
  },

  riskFramework: {
    personalRisks: [
      { risk: 'Cash runway miscalculation from stale assumptions', likelihood: 'medium', impact: 'high', mitigation: 'Quarterly scenario planning refresh; automated cash dashboard with real-time data' },
      { risk: 'Budget tool underuse leads to manual errors and slow reporting', likelihood: 'high', impact: 'medium', mitigation: 'Tool migration plan with quarterly milestones; measure manual vs automated ratio' },
      { risk: 'Accounting gaps from resource constraints', likelihood: 'medium', impact: 'medium', mitigation: 'Outsourced bookkeeping support; prioritized reconciliation schedule' },
      { risk: 'Financial risks surfaced too late for leadership to act', likelihood: 'low', impact: 'high', mitigation: 'Documented warning thresholds with automatic escalation triggers' },
    ],
    decisionPrinciples: [
      'Does leadership have the financial clarity to make this decision?',
      'Am I surfacing this risk early enough to act on it?',
      'Is this manual process something I should automate?',
      'Does the team understand the financial implication?',
      'Are our financial assumptions current or stale?',
    ],
    redLines: [
      'Never let books fall behind reconciliation by more than one month',
      'Never present financial projections based on stale assumptions without disclosure',
      'Never defer a cash runway warning that could affect firm operations',
    ],
  },
};

// =============================================================================
// PAOLA — BD Lead
// =============================================================================
export const paolaOS: TeamOS = {
  memberId: 'paola',

  feedback360: {
    winsForTeam: [
      'Relationship building — opens doors that others cannot',
      'Strategic positioning — frames Amphibian credibly for institutional audiences',
      'Institutional credibility — brings a lens of what serious allocators expect',
      'Energy and drive for growth — keeps the pipeline moving forward',
      'Willingness to represent the firm in high-stakes settings',
    ],
    makesHarder: [
      'Scope of role not clearly defined — BD vs IR vs strategy overlap',
      'Ambiguous mandate — unclear what success looks like in measurable terms',
      'Partnership expectations not always aligned with CEO priorities',
      'Research and prep work falls on Paola when it could be delegated',
      'Pipeline tracking is informal — hard to measure progress',
    ],
    startDoing: [
      'Define BD scope with clear boundaries — what is in, what is out',
      'Measurable pipeline metrics — stages, conversion rates, timeline',
      'Structured partnership evaluation framework — criteria before pursuit',
      'Regular CEO alignment on BD priorities — weekly or biweekly',
      'Delegate research and prep work to free up relationship time',
    ],
    stopDoing: [
      'Accepting undefined scope work without clarifying mandate',
      'Pursuing partnerships without clear criteria or CEO alignment',
      'Manual pipeline tracking when a simple system would work',
      'Spending time on research that could be delegated',
      'Operating without measurable goals for the BD function',
    ],
    supportNeeded: [
      'Clear mandate from CEO on BD priorities and success metrics',
      'Research support for partnership evaluation and market analysis',
      'CRM or pipeline tool for tracking relationships and progress',
      'Regular CEO alignment cadence to stay on the same page',
    ],
    roleClarity: [
      'Where does BD end and IR begin?',
      'What partnerships can Paola pursue independently vs requiring CEO approval?',
      'What are the measurable success metrics for the BD function?',
      'How does BD coordinate with Todd on LP-related opportunities?',
    ],
    highLeverageMoves: [
      'Co-define the BD scope document with James — what is in, what is out',
      'Launch pipeline tracking with simple stages and metrics',
      'Establish weekly CEO alignment check-in for BD priorities',
      'Create partnership evaluation criteria before pursuing next opportunity',
    ],
  },

  operatingSystem: {
    seat: 'BD Lead — Growth, partnerships, institutional credibility',
    notThisSeat: 'LP relationship management post-close, portfolio decisions, operations',
    morningChecklist: [
      'Pipeline status — any deals or relationships that need attention today?',
      'Am I working on mandated priorities or scope-creep tasks?',
      'What is my one highest-leverage relationship action today?',
    ],
    commitments: [
      'Clear mandate — know what I am responsible for and what I am not',
      'Pipeline discipline — track every relationship through defined stages',
      'Strategic partnerships only — evaluate before pursuing',
      'CEO alignment — no surprises on what I am pursuing',
      'Institutional credibility in every interaction — we only get one first impression',
    ],
    decisionFilter: [
      'Is this within my defined mandate?',
      'Does this partnership meet our evaluation criteria?',
      'Is the CEO aligned on this pursuit?',
      'Am I spending time on relationship-building or admin work?',
    ],
    eveningReflection: [
      'Did I advance a high-priority relationship today?',
      'Am I staying within scope or absorbing undefined work?',
      'Is my pipeline tracker current?',
    ],
    weeklyPulse: [
      'Pipeline health — are deals progressing through stages?',
      'Mandate clarity — am I working on the right things?',
      'CEO alignment — any divergence on priorities?',
      'Partnership quality — are we pursuing the right partners?',
      'Scope creep — did I take on work outside my mandate?',
    ],
    mantra: 'Right partnerships, right terms, right pace.',
  },

  qualities: [
    {
      name: 'Relationship Building',
      description: 'Open doors, build trust, and create genuine connections that lead to partnerships',
      feedbackSays: 'Strong relationship skills — but need to focus energy on highest-priority targets',
      weeklyQuestion: 'Did I advance the most strategically important relationship this week?',
      score: 4,
    },
    {
      name: 'Strategic Positioning',
      description: 'Frame Amphibian credibly for institutional audiences — the story must be sharp and true',
      feedbackSays: 'Good positioning instincts but messaging should be more tightly aligned with CEO narrative',
      weeklyQuestion: 'Was my positioning this week consistent with our firm narrative?',
      score: 4,
    },
    {
      name: 'Institutional Credibility',
      description: 'Bring the lens of what serious allocators expect — standards, materials, process',
      feedbackSays: 'Valuable institutional perspective but sometimes standards exceed current firm maturity',
      weeklyQuestion: 'Did I help the firm meet institutional standards this week?',
      score: 3,
    },
    {
      name: 'Deal Closing',
      description: 'Move relationships through the pipeline to committed partnerships with clear terms',
      feedbackSays: 'Good at opening but closing discipline needs strengthening with measurable milestones',
      weeklyQuestion: 'Did I move at least one relationship forward in the pipeline this week?',
      score: 3,
    },
    {
      name: 'Mandate Clarity',
      description: 'Know exactly what the BD function owns, does not own, and measures — and stay in lane',
      feedbackSays: 'Mandate has been ambiguous — needs to co-define scope and push back on undefined work',
      weeklyQuestion: 'Did I stay within my defined scope this week and push back on undefined work?',
      score: 2,
    },
  ],

  rdsFramework: {
    remove: [
      { item: 'Undefined scope work outside BD mandate', reason: 'Scope creep dilutes BD effectiveness and creates role confusion', status: 'identified' },
      { item: 'Pursuing partnerships without clear evaluation criteria', reason: 'Wastes time on misaligned opportunities', status: 'identified' },
      { item: 'Manual pipeline tracking', reason: 'Informal tracking makes progress invisible and accountability difficult', status: 'in-progress' },
    ],
    delegate: [
      { item: 'Partnership research and market analysis', delegateTo: 'Research support / Sahir', status: 'identified' },
      { item: 'Meeting prep materials and data compilation', delegateTo: 'Thao', status: 'identified' },
      { item: 'CRM data entry and pipeline administration', delegateTo: 'Ops support', status: 'identified' },
    ],
    systematize: [
      { item: 'Partnership pipeline tracking', system: 'CRM with defined stages, conversion metrics, and weekly review cadence', status: 'identified' },
      { item: 'Partnership evaluation framework', system: 'Documented criteria for evaluating opportunities before pursuit', status: 'identified' },
      { item: 'CEO alignment cadence', system: 'Weekly BD priorities check-in — 15 minutes, structured agenda', status: 'identified' },
    ],
  },

  riskFramework: {
    personalRisks: [
      { risk: 'Scope creep dilutes BD effectiveness', likelihood: 'high', impact: 'medium', mitigation: 'Published BD scope document; push back on undefined work within 24 hours' },
      { risk: 'Ambiguous mandate leads to misaligned expectations', likelihood: 'high', impact: 'medium', mitigation: 'Co-defined mandate document with CEO; measurable success metrics' },
      { risk: 'Misaligned partnership pursuits waste time and credibility', likelihood: 'medium', impact: 'medium', mitigation: 'Partnership evaluation criteria applied before pursuit; CEO alignment check' },
      { risk: 'Pipeline stalls from lack of tracking and accountability', likelihood: 'medium', impact: 'high', mitigation: 'CRM implementation with defined stages and weekly review' },
    ],
    decisionPrinciples: [
      'Is this within my defined mandate?',
      'Does this partnership meet our evaluation criteria?',
      'Is the CEO aligned on this pursuit?',
      'Am I spending time on relationship-building or admin work?',
      'Would a serious allocator find our materials and process credible?',
    ],
    redLines: [
      'Never pursue a partnership without CEO awareness and alignment',
      'Never commit firm resources to a BD opportunity without defined criteria',
      'Never let pipeline tracking lapse — visibility is accountability',
    ],
  },
};

// =============================================================================
// THAO — Ops Lead
// =============================================================================
export const thaoOS: TeamOS = {
  memberId: 'thao',

  feedback360: {
    winsForTeam: [
      'Operational reliability — when Thao owns it, it gets done correctly',
      'Process architecture — builds workflows that reduce errors and increase consistency',
      'Investor ops execution — LP data requests handled with care and accuracy',
      'SLA discipline — understands and respects deadlines and commitments',
      'Issue surfacing — flags problems early rather than hiding them',
    ],
    makesHarder: [
      'Tribal knowledge workflows — processes live in Thao head, not in documentation',
      'Silent drifting when unclear on priorities — does not always push back for clarity',
      'Preventable errors from manual processes that should be systematized',
      'Workflow bottlenecks when Thao is the only person who knows the process',
      'Capacity constraints not always signaled early enough',
    ],
    startDoing: [
      'Document top 10 operational workflows as written SOPs',
      'Push for clarity when priorities are ambiguous — ask before assuming',
      'Capacity signaling — flag overload early with a simple status indicator',
      'Cross-train a backup on critical investor ops processes',
      'Propose automation for top 3 most manual recurring tasks',
    ],
    stopDoing: [
      'Running workflows from memory without documentation',
      'Silently absorbing unclear priorities without asking for clarification',
      'Manual execution of tasks that could be automated or templated',
      'Being the single point of failure for critical ops processes',
      'Deferring SOP documentation to "when things slow down" — it never slows down',
    ],
    supportNeeded: [
      'Time allocation for SOP documentation — it is real work, not extra work',
      'Tool access for workflow automation and investor ops',
      'Clear priority stack from CEO and IR — what matters most this week',
      'Backup personnel for critical investor ops processes',
    ],
    roleClarity: [
      'What operational tasks are Thao responsibility vs CEO vs IR?',
      'Who sets operational priorities when multiple leaders assign work?',
      'What is the expected turnaround time for LP data requests?',
      'Where does ops end and IT/engineering begin?',
    ],
    highLeverageMoves: [
      'Document the top 5 operational workflows as SOPs this quarter',
      'Identify and propose automation for the 3 most manual recurring tasks',
      'Cross-train one backup person on critical investor ops processes',
      'Implement a simple weekly capacity signal for leadership',
    ],
  },

  operatingSystem: {
    seat: 'Ops Lead — Operations execution, investor ops, process standards',
    notThisSeat: 'Portfolio decisions, LP relationship management, strategic planning',
    morningChecklist: [
      'Priority stack — is it clear what matters most today?',
      'Any LP data requests pending or approaching deadline?',
      'Any process that broke or needs attention from yesterday?',
    ],
    commitments: [
      'SOP everything — if it is not documented, it is not systematized',
      'Signal capacity early — do not wait until overloaded to speak up',
      'Push for clarity — ask before assuming when priorities conflict',
      'Zero single points of failure — cross-train and document',
      'Quality over speed — get it right, then get it fast',
    ],
    decisionFilter: [
      'Is this priority clear or am I assuming?',
      'Should this be documented as an SOP?',
      'Am I the only person who can do this — and is that a problem?',
      'Is there a faster or more reliable way to do this?',
    ],
    eveningReflection: [
      'Did any process break today that needs an SOP?',
      'Am I clear on tomorrow priorities or do I need to ask?',
      'Did I signal any capacity concerns that needed surfacing?',
    ],
    weeklyPulse: [
      'SOP progress — how many critical processes are documented?',
      'Capacity — am I in the green, yellow, or red zone?',
      'LP data requests — all on time and accurate?',
      'Single points of failure — any process only I can do?',
      'Automation opportunities — what manual task should be next?',
    ],
    mantra: 'Document it. Systematize it. Make it survive without me.',
  },

  qualities: [
    {
      name: 'Operational Excellence',
      description: 'Execute operational tasks with reliability, accuracy, and consistency every time',
      feedbackSays: 'Highly reliable execution but quality can dip under capacity pressure when too many priorities compete',
      weeklyQuestion: 'Did every operational deliverable this week meet the quality standard?',
      score: 4,
    },
    {
      name: 'Process Architecture',
      description: 'Build workflows that are documented, repeatable, and not dependent on any single person',
      feedbackSays: 'Good at building processes but documentation lags — too many workflows live in memory',
      weeklyQuestion: 'Did I document or improve a process this week?',
      score: 3,
    },
    {
      name: 'Reliability',
      description: 'When something is assigned, it gets done on time and correctly — no follow-up needed',
      feedbackSays: 'One of the most reliable people on the team — but silent drifting under ambiguity can delay delivery',
      weeklyQuestion: 'Did every commitment I made this week get delivered on time?',
      score: 4,
    },
    {
      name: 'SLA Discipline',
      description: 'Understand, respect, and meet service-level commitments — deadlines are non-negotiable',
      feedbackSays: 'Strong SLA discipline but does not always push back when SLAs conflict with capacity',
      weeklyQuestion: 'Did I meet every SLA this week — and flag any that were at risk?',
      score: 4,
    },
    {
      name: 'Issue Surfacing',
      description: 'Flag problems early — do not wait for them to become crises before escalating',
      feedbackSays: 'Good instinct for surfacing issues but can drift silently when priorities are ambiguous',
      weeklyQuestion: 'Did I surface every issue and concern early this week — or did I sit on anything?',
      score: 3,
    },
  ],

  rdsFramework: {
    remove: [
      { item: 'Tribal knowledge workflows', reason: 'Single point of failure — if Thao is unavailable, critical processes break', status: 'in-progress' },
      { item: 'Silent drifting when priorities are unclear', reason: 'Ambiguity leads to wasted effort or delayed delivery', status: 'identified' },
      { item: 'Manual execution of automatable tasks', reason: 'Consumes time that should go to higher-value operational work', status: 'identified' },
    ],
    delegate: [
      { item: 'Repetitive data entry and formatting tasks', delegateTo: 'Automated tools / junior ops support', status: 'identified' },
      { item: 'Meeting scheduling and logistics', delegateTo: 'Shared admin support', status: 'identified' },
      { item: 'Basic document filing and organization', delegateTo: 'Automated filing system', status: 'identified' },
    ],
    systematize: [
      { item: 'Top 10 operational workflows as written SOPs', system: 'Documented SOPs with version control, owner, and review cadence', status: 'in-progress' },
      { item: 'LP data request fulfillment process', system: 'Templated request intake, standard turnaround times, quality checklist', status: 'identified' },
      { item: 'Capacity signaling system', system: 'Weekly red/yellow/green indicator shared with leadership', status: 'identified' },
    ],
  },

  riskFramework: {
    personalRisks: [
      { risk: 'Silent drifting under ambiguous priorities leads to delayed delivery', likelihood: 'medium', impact: 'medium', mitigation: 'Push for clarity within 24 hours when priorities are unclear; escalate conflicts' },
      { risk: 'Preventable errors from manual processes', likelihood: 'medium', impact: 'medium', mitigation: 'Automate top 3 most manual recurring tasks; implement quality checklists' },
      { risk: 'Workflow bottlenecks from single points of failure', likelihood: 'high', impact: 'high', mitigation: 'Cross-train backup on critical processes; document all SOPs' },
      { risk: 'Capacity overload from multiple priority sources without coordination', likelihood: 'medium', impact: 'medium', mitigation: 'Single priority stack; weekly capacity signal; push back when overloaded' },
    ],
    decisionPrinciples: [
      'Is this priority clear or am I assuming?',
      'Should this be documented as an SOP?',
      'Am I the only person who can do this?',
      'Is there a faster or more reliable way to do this?',
      'Am I surfacing this issue early enough?',
    ],
    redLines: [
      'Never let a critical process exist only in memory — document it',
      'Never silently absorb conflicting priorities — escalate within 24 hours',
      'Never miss an LP data request deadline without advance warning',
    ],
  },
};

// =============================================================================
// TIMON — Engineer
// =============================================================================
export const timonOS: TeamOS = {
  memberId: 'timon',

  feedback360: {
    winsForTeam: [
      'Engineering rigor — code is well-structured, tested, and maintainable',
      'Data integrity focus — pipeline output is reliable and verified',
      'System design thinking — builds infrastructure that scales beyond current needs',
      'Ships quality — deliverables work when delivered, not after hotfixes',
      'Infrastructure vision — thinks beyond the immediate task to long-term architecture',
    ],
    makesHarder: [
      'Context switching between risk dashboard, data pipeline, and regime classifier',
      'Scope creep from ad-hoc data requests that pull focus from roadmap items',
      'Manual data tasks that should be automated but persist due to priority pressure',
      'Tech debt accumulation when shipping speed is prioritized over quality',
      'Engineering priorities not always aligned with firm-level priorities',
    ],
    startDoing: [
      'Protected focus blocks — no context switching during deep engineering work',
      'Engineering roadmap aligned with firm priorities — quarterly, visible, committed',
      'Automated data pipeline for top 3 most-requested manual data tasks',
      'Tech debt budget — dedicated percentage of time for cleanup and improvement',
      'Regular deployment pipeline review and improvement',
    ],
    stopDoing: [
      'Context switching between major projects without finishing milestones',
      'Accepting ad-hoc data requests without routing through priority process',
      'Manual data tasks that should have been automated by now',
      'Deferring tech debt indefinitely — it compounds',
      'Building infrastructure without validating it solves the right problem',
    ],
    supportNeeded: [
      'Protected focus time — context switching is the biggest productivity killer',
      'Clear engineering priority stack aligned with CIO and CEO needs',
      'Support for manual data tasks that could be handled by ops',
      'Regular product feedback on risk dashboard and tools built',
    ],
    roleClarity: [
      'Who sets engineering priorities — CIO, CEO, or product owner?',
      'What is the acceptable ratio of roadmap work vs ad-hoc requests?',
      'Who owns data integrity — engineering, ops, or shared?',
      'What is the engineering deployment and review process?',
    ],
    highLeverageMoves: [
      'Publish the engineering roadmap aligned with firm priorities for this quarter',
      'Automate the top 3 manual data tasks consuming the most time',
      'Establish protected focus blocks and communicate the schedule to the team',
      'Allocate a fixed tech debt budget — 20% of engineering time',
    ],
  },

  operatingSystem: {
    seat: 'Engineer — Risk dashboard, data pipeline, regime classifier',
    notThisSeat: 'Portfolio decisions, LP communications, operations execution',
    morningChecklist: [
      'Data pipeline health — any failures or anomalies overnight?',
      'What is my primary engineering focus today — one thing only?',
      'Am I in a focus block or available for requests?',
    ],
    commitments: [
      'Ship quality — if it ships, it works. No hotfix culture.',
      'Data integrity is non-negotiable — every output is verified',
      'Focus over context switching — finish milestones before pivoting',
      'Tech debt gets budget — not just attention when things break',
      'Build for scale — today infrastructure should serve tomorrow needs',
    ],
    decisionFilter: [
      'Is this on the roadmap or an ad-hoc request that needs routing?',
      'Will this create tech debt — and if so, is that acceptable?',
      'Am I building the right thing or just building something?',
      'Does this need to ship now or can it wait for the right architecture?',
    ],
    eveningReflection: [
      'Did I stay focused on one primary task or did I context switch?',
      'Did I create any tech debt today that needs tracking?',
      'Is the data pipeline healthy going into tomorrow?',
    ],
    weeklyPulse: [
      'Roadmap progress — am I on track for quarterly milestones?',
      'Data integrity — any pipeline issues or quality concerns this week?',
      'Tech debt — is it growing, stable, or shrinking?',
      'Focus time — how much of my week was focused vs fragmented?',
      'Ad-hoc requests — how many came in and how were they handled?',
    ],
    mantra: 'Build it right. Ship it clean. Make the data trustworthy.',
  },

  qualities: [
    {
      name: 'Engineering Rigor',
      description: 'Code is well-structured, tested, reviewed, and maintainable — craftsmanship matters',
      feedbackSays: 'Strong engineering standards but can slow delivery when perfectionism exceeds requirements',
      weeklyQuestion: 'Did I balance engineering quality with delivery speed this week?',
      score: 4,
    },
    {
      name: 'Data Integrity',
      description: 'Every data output is verified, validated, and trustworthy — the firm depends on this',
      feedbackSays: 'Data quality is high but verification processes could be more automated and less manual',
      weeklyQuestion: 'Is every data output from my systems verified and trustworthy right now?',
      score: 4,
    },
    {
      name: 'System Design',
      description: 'Build infrastructure that scales — think beyond the current requirement to the next three',
      feedbackSays: 'Good design instincts but sometimes over-engineers for future needs at the expense of current delivery',
      weeklyQuestion: 'Did my system design choices this week serve both current needs and reasonable future scale?',
      score: 4,
    },
    {
      name: 'Ship Quality',
      description: 'When it ships, it works — no hotfixes, no "it works on my machine," no regressions',
      feedbackSays: 'Deliverables are reliable but deployment pipeline could be more automated and standardized',
      weeklyQuestion: 'Did everything I shipped this week work correctly without follow-up fixes?',
      score: 4,
    },
    {
      name: 'Infrastructure Vision',
      description: 'See the long-term technical architecture — build today so tomorrow is not a rewrite',
      feedbackSays: 'Strong technical vision but needs to validate infrastructure priorities against firm-level needs',
      weeklyQuestion: 'Is my infrastructure roadmap aligned with what the firm actually needs?',
      score: 3,
    },
  ],

  rdsFramework: {
    remove: [
      { item: 'Context switching between major projects', reason: 'Fragmented focus destroys engineering productivity and quality', status: 'identified' },
      { item: 'Accepting ad-hoc data requests without routing through priority process', reason: 'Breaks focus and creates hidden workload not visible on the roadmap', status: 'identified' },
      { item: 'Manual data tasks that should be automated', reason: 'Wastes engineering time on repeatable work that machines should handle', status: 'in-progress' },
    ],
    delegate: [
      { item: 'Manual data collection and formatting', delegateTo: 'Ops support / Sahir', status: 'identified' },
      { item: 'Non-engineering data requests', delegateTo: 'Thao / Ops', status: 'identified' },
      { item: 'User testing and feedback collection for tools', delegateTo: 'Ross / end users', status: 'identified' },
    ],
    systematize: [
      { item: 'Deployment pipeline', system: 'Automated CI/CD with testing, staging, and production environments', status: 'in-progress' },
      { item: 'Data pipeline monitoring and alerting', system: 'Automated health checks with alert thresholds and escalation', status: 'identified' },
      { item: 'Engineering roadmap and priority process', system: 'Quarterly roadmap with visible progress tracking; ad-hoc request routing process', status: 'identified' },
    ],
  },

  riskFramework: {
    personalRisks: [
      { risk: 'Tech debt compounds until it causes system failure or major refactor', likelihood: 'medium', impact: 'high', mitigation: 'Fixed 20% tech debt budget; quarterly tech debt audit and prioritization' },
      { risk: 'Data integrity issues undermine portfolio decisions', likelihood: 'low', impact: 'high', mitigation: 'Automated data validation; pipeline monitoring with alerting; verification checklists' },
      { risk: 'Scope creep from ad-hoc requests fragments engineering focus', likelihood: 'high', impact: 'medium', mitigation: 'Protected focus blocks; ad-hoc request routing process; visible roadmap' },
      { risk: 'Single engineer dependency on critical infrastructure', likelihood: 'medium', impact: 'high', mitigation: 'Documentation; code reviews; architecture decision records for key systems' },
    ],
    decisionPrinciples: [
      'Is this on the roadmap or an ad-hoc request that needs routing?',
      'Will this create tech debt — and if so, is it acceptable?',
      'Am I building the right thing or just building something?',
      'Does this need to ship now or can it wait for the right architecture?',
      'Is this verified and trustworthy — or am I shipping hope?',
    ],
    redLines: [
      'Never ship data outputs without verification — the portfolio depends on it',
      'Never let tech debt grow without tracking and budgeted remediation',
      'Never sacrifice data integrity for delivery speed',
    ],
  },
};

// =============================================================================
// DAVID — Chairman
// =============================================================================
export const davidOS: TeamOS = {
  memberId: 'david',

  feedback360: {
    winsForTeam: [
      'Strategic guidance grounded in institutional experience',
      'Network leverage — introductions that open doors at the right level',
      'Fiduciary discipline — holds the firm to governance standards',
      'Accountability standards — asks the hard questions in board settings',
      'Governance oversight — ensures the firm operates with institutional rigor',
    ],
    makesHarder: [
      'Governance can feel performative if not connected to operational reality',
      'Board cadence inconsistency — unclear expectations on frequency and agenda',
      'Accountability follow-through varies — hard questions asked but not always tracked',
      'Disconnection from day-to-day operations can lead to misaligned advice',
      'Input expectations unclear — advisory vs binding on strategic matters',
    ],
    startDoing: [
      'Formalized board cadence — quarterly at minimum with structured agenda',
      'Action item tracking from board meetings — documented with owners and deadlines',
      'Regular operational briefing — stay connected to reality, not just strategy',
      'Clear distinction between advisory input and governance directives',
      'Annual governance effectiveness review — is the board adding value?',
    ],
    stopDoing: [
      'Governance without operational connection — governance must be grounded',
      'Inconsistent board cadence — predictability builds trust',
      'Asking hard questions without tracking follow-through on answers',
      'Providing strategic advice without current operational context',
      'Ambiguous input — clarify whether feedback is advisory or directive',
    ],
    supportNeeded: [
      'Regular operational briefings from CEO — stay informed without micromanaging',
      'Board meeting logistics handled by ops — David focuses on substance',
      'Clear escalation path for governance concerns',
      'Access to key financial and performance data on a regular cadence',
    ],
    roleClarity: [
      'When is board input advisory vs binding?',
      'What is the board cadence — quarterly, monthly, as-needed?',
      'What information does the Chairman receive and on what schedule?',
      'What governance decisions require board vote vs CEO discretion?',
    ],
    highLeverageMoves: [
      'Establish quarterly board cadence with structured agenda template',
      'Launch action item tracking from board meetings',
      'Set up monthly operational briefing with CEO',
      'Publish advisory vs directive framework for board input',
    ],
  },

  operatingSystem: {
    seat: 'Chairman — Board governance, strategic guidance, introductions',
    notThisSeat: 'Daily operations, portfolio decisions, LP relationship management, execution',
    morningChecklist: [
      'Any governance items requiring attention before next board meeting?',
      'Any introductions or network actions I can advance today?',
      'Am I informed enough on operations to provide grounded advice?',
    ],
    commitments: [
      'Governance is real, not performative — it must connect to operational reality',
      'Hold the firm accountable — ask the hard questions and track the answers',
      'Network is an asset — deploy introductions strategically, not sparingly',
      'Advisory vs directive — be clear on which hat I am wearing',
      'Stay informed — governance without operational context is dangerous',
    ],
    decisionFilter: [
      'Is this advice grounded in current operational reality?',
      'Am I being advisory or directive — and have I said which?',
      'Does this governance action add real value or is it performative?',
      'Am I deploying my network strategically for the firm highest-leverage needs?',
    ],
    eveningReflection: [
      'Did I advance a governance or strategic item today?',
      'Am I staying informed enough to provide grounded input?',
      'Any introductions or network actions I should prioritize this week?',
    ],
    weeklyPulse: [
      'Board readiness — is the next board meeting on track with a clear agenda?',
      'Governance effectiveness — are board actions being followed through?',
      'Network deployment — any high-value introductions to make?',
      'Operational awareness — am I current enough to add value?',
      'CEO accountability — is the right level of challenge being applied?',
    ],
    mantra: 'Governance that grounds. Guidance that counts.',
  },

  qualities: [
    {
      name: 'Fiduciary Discipline',
      description: 'Hold the firm to the highest governance standards — fiduciary duty is non-negotiable',
      feedbackSays: 'Strong fiduciary instincts but governance can feel disconnected from operational reality',
      weeklyQuestion: 'Did my governance contributions this week connect to operational reality?',
      score: 4,
    },
    {
      name: 'Strategic Guidance',
      description: 'Provide advice grounded in experience that helps the CEO make better decisions',
      feedbackSays: 'Valuable strategic perspective but advice is more impactful when grounded in current operational context',
      weeklyQuestion: 'Was my strategic input this week grounded in current operational reality?',
      score: 4,
    },
    {
      name: 'Accountability Standards',
      description: 'Ask the hard questions — and track whether they get answered',
      feedbackSays: 'Asks the right questions but follow-through on tracking answers could be stronger',
      weeklyQuestion: 'Did I track the answers to the hard questions I asked?',
      score: 3,
    },
    {
      name: 'Network Leverage',
      description: 'Deploy introductions strategically — the network is a firm asset, not a personal one',
      feedbackSays: 'Strong network but deployment is sometimes reactive rather than strategic',
      weeklyQuestion: 'Did I deploy my network strategically for the firm highest-leverage need?',
      score: 4,
    },
    {
      name: 'Governance Oversight',
      description: 'Ensure board processes are consistent, documented, and add real value to the firm',
      feedbackSays: 'Good governance intent but cadence and documentation need formalization',
      weeklyQuestion: 'Is the board governance cadence on track and adding real value?',
      score: 3,
    },
  ],

  rdsFramework: {
    remove: [
      { item: 'Hands-off governance that loses connection to operations', reason: 'Governance without operational grounding becomes performative and misaligned', status: 'identified' },
      { item: 'Ambiguous advisory vs directive input', reason: 'Unclear whether board input is binding creates confusion for the CEO', status: 'identified' },
      { item: 'Board meetings without structured agendas', reason: 'Unstructured meetings waste time and reduce governance quality', status: 'in-progress' },
    ],
    delegate: [
      { item: 'Board meeting logistics, scheduling, and materials preparation', delegateTo: 'Thao / Ops support', status: 'identified' },
      { item: 'Action item tracking from board meetings', delegateTo: 'Thao / CEO office', status: 'identified' },
      { item: 'Data compilation for board reporting packages', delegateTo: 'Mark / Thao', status: 'identified' },
    ],
    systematize: [
      { item: 'Board meeting cadence', system: 'Quarterly meetings with structured agenda, advance materials, and documented action items', status: 'in-progress' },
      { item: 'Governance effectiveness review', system: 'Annual review of board impact with CEO feedback and improvement actions', status: 'identified' },
      { item: 'Advisory vs directive framework', system: 'Published framework clarifying when board input is advisory vs binding', status: 'identified' },
    ],
  },

  riskFramework: {
    personalRisks: [
      { risk: 'Accountability gaps from untracked board action items', likelihood: 'medium', impact: 'medium', mitigation: 'Action item tracking with owners and deadlines; reviewed at each board meeting' },
      { risk: 'Governance theater — board process that looks good but adds no real value', likelihood: 'medium', impact: 'high', mitigation: 'Annual governance effectiveness review; candid CEO feedback' },
      { risk: 'Disconnection from operations leads to misaligned strategic advice', likelihood: 'medium', impact: 'medium', mitigation: 'Monthly operational briefing with CEO; regular access to key metrics' },
      { risk: 'Network deployed reactively rather than strategically', likelihood: 'low', impact: 'medium', mitigation: 'Quarterly network deployment plan aligned with firm priorities' },
    ],
    decisionPrinciples: [
      'Is this advice grounded in current operational reality?',
      'Am I being advisory or directive — and have I been explicit?',
      'Does this governance action add real value or is it performative?',
      'Am I deploying my network for the firm highest-leverage needs?',
      'Am I holding the right level of accountability without micromanaging?',
    ],
    redLines: [
      'Never let board meetings proceed without a structured agenda and advance materials',
      'Never provide strategic advice without current operational context',
      'Never let governance action items go untracked between board meetings',
    ],
  },
};

// =============================================================================
// SAHIR — Prod Ops (Product Operations)
// =============================================================================
export const sahirOS: TeamOS = {
  memberId: 'sahir',

  feedback360: {
    winsForTeam: [
      'Analytical precision — research output is thorough and well-structured',
      'Research depth — digs into manager data with genuine intellectual curiosity',
      'Data storytelling — presents findings in a way that supports decision-making',
      'Operational support — willingness to take on the unglamorous data work',
      'Pattern recognition — spots trends and anomalies in performance data',
    ],
    makesHarder: [
      'Manual data collection consumes time that should go to analysis',
      'Research depth sometimes exceeds what is needed — over-analysis risk',
      'Performance database is informal — not structured for long-term reliability',
      'Formatting and presentation work pulls focus from analytical work',
      'Analytics accuracy depends on manual verification — not yet systematized',
    ],
    startDoing: [
      'Structured performance database with standard schema and update cadence',
      'Automated data collection for recurring data needs',
      'Tiered research depth — match analysis depth to decision urgency',
      'Standardized output templates — reduce formatting time per deliverable',
      'Regular accuracy audits of performance data and analytics',
    ],
    stopDoing: [
      'Manual data collection for data that should be automated',
      'Over-analyzing when a quick answer is sufficient',
      'Maintaining performance data in informal or unstructured formats',
      'Spending time on formatting that could be templated',
      'Delivering analytics without documented methodology and verification',
    ],
    supportNeeded: [
      'Engineering support for database infrastructure and automated data collection',
      'Clear priorities from CIO on research focus areas',
      'Standard output templates to reduce formatting overhead',
      'Access to data sources and APIs for automation',
    ],
    roleClarity: [
      'What research is Sahir responsibility vs Ross or CIO?',
      'Who sets research priorities and how are ad-hoc requests handled?',
      'What is the expected depth and turnaround for different research types?',
      'Where does Prod Ops end and PM or engineering begin?',
    ],
    highLeverageMoves: [
      'Build the structured performance database with Timon support',
      'Automate the top 3 most time-consuming manual data collection tasks',
      'Create standardized research output templates for common deliverable types',
      'Establish tiered research depth framework — quick, standard, deep',
    ],
  },

  operatingSystem: {
    seat: 'Prod Ops — Manager research, performance analytics, operational data support',
    notThisSeat: 'Portfolio allocation decisions, LP communications, firm strategy',
    morningChecklist: [
      'Any research deliverables due today or this week?',
      'Performance database — any data updates needed?',
      'Am I working on prioritized research or ad-hoc requests?',
    ],
    commitments: [
      'Analytical precision — every number is verified before it leaves my desk',
      'Research serves decisions — analysis without decision-relevance is waste',
      'Build the database — stop maintaining data in informal formats',
      'Match depth to urgency — not every question needs a deep dive',
      'Surface patterns — do not just report data, tell the story',
    ],
    decisionFilter: [
      'Is this research prioritized or an ad-hoc request that needs routing?',
      'What depth of analysis does this decision actually need?',
      'Have I verified the data before delivering it?',
      'Am I telling the story or just presenting numbers?',
    ],
    eveningReflection: [
      'Did I verify every data point I delivered today?',
      'Am I building the database or just maintaining spreadsheets?',
      'Did I match my analysis depth to the decision urgency?',
    ],
    weeklyPulse: [
      'Research pipeline — am I on track with prioritized deliverables?',
      'Database health — is the performance database current and reliable?',
      'Data accuracy — any concerns about the numbers I delivered this week?',
      'Automation progress — am I reducing manual data collection?',
      'Patterns — any trends or anomalies I should flag to CIO?',
    ],
    mantra: 'Precision in the data. Clarity in the story. Trust in the numbers.',
  },

  qualities: [
    {
      name: 'Analytical Precision',
      description: 'Every data point is verified, every calculation is checked — precision is the foundation of trust',
      feedbackSays: 'High analytical quality but verification is manual — needs systematization',
      weeklyQuestion: 'Did I verify every data output this week before delivering it?',
      score: 4,
    },
    {
      name: 'Research Depth',
      description: 'Go deep enough to surface insights that drive better decisions — but not deeper than needed',
      feedbackSays: 'Thorough researcher but sometimes over-analyzes when a quick answer would suffice',
      weeklyQuestion: 'Did I match my research depth to the decision urgency this week?',
      score: 3,
    },
    {
      name: 'Data Storytelling',
      description: 'Present data in a way that drives decisions — numbers without narrative are noise',
      feedbackSays: 'Growing skill in data storytelling — can be more concise and decision-oriented',
      weeklyQuestion: 'Did my data deliverables this week tell a clear story that supported a decision?',
      score: 3,
    },
    {
      name: 'Operational Support',
      description: 'Handle the unglamorous data and ops work that keeps the analytical engine running',
      feedbackSays: 'Willing and reliable but manual processes consume time that should go to higher-value analysis',
      weeklyQuestion: 'Did I advance automation of a manual task this week?',
      score: 4,
    },
    {
      name: 'Pattern Recognition',
      description: 'Spot trends, anomalies, and patterns in performance data before they become obvious',
      feedbackSays: 'Good instinct for patterns but needs more structured process for flagging and communicating them',
      weeklyQuestion: 'Did I flag a meaningful pattern or anomaly to the team this week?',
      score: 3,
    },
  ],

  rdsFramework: {
    remove: [
      { item: 'Manual data collection for recurring data needs', reason: 'Consumes time that should go to analysis and pattern recognition', status: 'in-progress' },
      { item: 'Over-analysis when a quick answer is sufficient', reason: 'Depth should match decision urgency — not every question is a deep dive', status: 'identified' },
      { item: 'Informal performance data storage', reason: 'Unstructured data creates reliability and accuracy risk', status: 'identified' },
    ],
    delegate: [
      { item: 'Data formatting and presentation cleanup', delegateTo: 'Templated processes / Ops support', status: 'identified' },
      { item: 'Basic data entry and routine updates', delegateTo: 'Automated data pipelines / Timon', status: 'identified' },
      { item: 'Report distribution and logistics', delegateTo: 'Thao / Ops', status: 'identified' },
    ],
    systematize: [
      { item: 'Performance database', system: 'Structured database with standard schema, automated updates, and regular accuracy audits', status: 'in-progress' },
      { item: 'Research output templates', system: 'Standardized templates for quick, standard, and deep research deliverables', status: 'identified' },
      { item: 'Tiered research depth framework', system: 'Decision framework matching analysis depth to urgency: quick (same day), standard (3 days), deep (1 week)', status: 'identified' },
    ],
  },

  riskFramework: {
    personalRisks: [
      { risk: 'Analytics inaccuracy from manual verification processes', likelihood: 'medium', impact: 'high', mitigation: 'Automated verification checks; regular accuracy audits; documented methodology' },
      { risk: 'Research gaps from unclear prioritization', likelihood: 'medium', impact: 'medium', mitigation: 'Weekly priority alignment with CIO; visible research pipeline' },
      { risk: 'Database reliability from informal data storage', likelihood: 'medium', impact: 'high', mitigation: 'Structured database build with engineering support; migration from spreadsheets' },
      { risk: 'Over-analysis delays time-sensitive decisions', likelihood: 'medium', impact: 'medium', mitigation: 'Tiered depth framework — match analysis to urgency; explicit depth agreement with requester' },
    ],
    decisionPrinciples: [
      'Is this research prioritized or an ad-hoc request?',
      'What depth of analysis does this decision actually need?',
      'Have I verified the data before delivering it?',
      'Am I telling the story or just presenting numbers?',
      'Am I building sustainable infrastructure or just running manual processes?',
    ],
    redLines: [
      'Never deliver data without verification — wrong numbers erode trust faster than slow numbers',
      'Never maintain critical performance data in informal or unstructured formats permanently',
      'Never ignore a data anomaly — flag it even if you are not sure it matters',
    ],
  },
};

// =============================================================================
// Aggregated Team Data
// =============================================================================
export const teamOSData: TeamOS[] = [
  jamesOS,
  toddOS,
  tyOS,
  rossOS,
  andrewOS,
  markOS,
  paolaOS,
  thaoOS,
  timonOS,
  davidOS,
  sahirOS,
];

// =============================================================================
// Utility Functions
// =============================================================================
export function getTeamMemberOS(memberId: string): TeamOS | undefined {
  return teamOSData.find((m) => m.memberId === memberId);
}

export function getAllMemberIds(): string[] {
  return teamOSData.map((m) => m.memberId);
}

export function getTeamRiskSummary(): { memberId: string; highRisks: string[] }[] {
  return teamOSData.map((m) => ({
    memberId: m.memberId,
    highRisks: m.riskFramework.personalRisks
      .filter((r) => r.likelihood === 'high' || r.impact === 'high')
      .map((r) => r.risk),
  }));
}

export function getTeamRDSStatus(): {
  memberId: string;
  remove: number;
  delegate: number;
  systematize: number;
  completedCount: number;
}[] {
  return teamOSData.map((m) => ({
    memberId: m.memberId,
    remove: m.rdsFramework.remove.length,
    delegate: m.rdsFramework.delegate.length,
    systematize: m.rdsFramework.systematize.length,
    completedCount: [
      ...m.rdsFramework.remove,
      ...m.rdsFramework.delegate,
      ...m.rdsFramework.systematize,
    ].filter((item) => item.status === 'done').length,
  }));
}

export function getQualitiesBelowThreshold(threshold: number): {
  memberId: string;
  quality: string;
  score: number;
}[] {
  const results: { memberId: string; quality: string; score: number }[] = [];
  for (const member of teamOSData) {
    for (const q of member.qualities) {
      if (q.score < threshold) {
        results.push({ memberId: member.memberId, quality: q.name, score: q.score });
      }
    }
  }
  return results;
}
