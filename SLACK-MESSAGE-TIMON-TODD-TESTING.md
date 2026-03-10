# Message to Timon & Todd — Start Testing Amphibian Unite

---

## Slack Message (send in #engineering or DM both):

---

Hey @Timon @Todd

We've built something I'm really excited about — **Amphibian Unite: 10x Internal Operating System**.

This is our internal platform that puts everything about how we operate as a team in one place. Think of it as the OS that makes all 14 AI agents, every team member's role clarity, and our strategic roadmap live and breathable — not buried in Google Docs.

### What it does right now (Crawl phase — live):
- **Team Operating Systems** — every person's 360 feedback, personal OS, quality self-assessments (1-5 scoring), RDS framework (Remove/Delegate/Systematize), and risk framework
- **Daily Journals** — Morning startup + End of Day close-out journals with guided prompts
- **Weekly + Monthly Planning** — structured planning templates for each team member
- **Proactive Agent Intelligence** — our 14 agents surface strategic insights, hard questions, and research prompts per person
- **Leaderboard + Points System** — gamified tracking of who's delivering (qualities, RDS progress, risk coverage)
- **Interactive Tasks** — full CRUD with Kanban drag-and-drop
- **OKRs + KPIs** — company-level objectives with progress tracking
- **AI Edge Assessment** — Andrew's 8-agent product assessment integrated
- **Roadmap** — $1B+ path with execution phases and 90-day gates
- **Decision Log, Notes, Activity Feed**
- **Command Palette (Cmd+K)** — instant search across everything
- **Mobile Bottom Nav** — fully responsive
- **PDF Export** — download any view as a document

### How to test it:

**Option 1: Run locally (recommended for dev)**
```bash
git clone [REPO_URL]
cd amphibian-unite
npm install
npm run dev
# Open http://localhost:3000
```

**Option 2: Preview link**
Once deployed to Vercel, I'll share the live URL here.

### What I need from you:

**Timon:**
1. Pull the repo and run it locally
2. Click through every view — Dashboard, Team, Agents, OKRs, Tasks, Roadmap, AI Edge, Decisions, Notes, Activity
3. Open your own Team OS card — check your 360, qualities, RDS, risk framework, journal, and Agent Intel tab
4. Try the Kanban drag-and-drop in Tasks
5. Test on mobile (resize browser to 375px wide)
6. Note any bugs, rough edges, or "this should work differently" moments
7. Think about: what data connections would make this 10x more useful? (Database, Slack, Google Drive)

**Todd:**
1. Same as above — run locally or use preview link
2. Focus on: does your 360 feedback feel accurate? Does your Operating System capture your seat correctly?
3. Check the LP Trust agent assignment — you're primary owner
4. Look at the Leaderboard — does the points system make sense as incentive structure?
5. Test the Journal: try the Morning Start and End of Day flows
6. Think about: what would make this the tool you open every morning?

### Full feature list:
See `FEATURE-LIST.md` in the repo — it has the complete Crawl/Walk/Run roadmap.

### The big picture:
This is Crawl phase. Walk phase (May-Aug) adds real data persistence, Slack integration, and database backend. Run phase (Sep+) makes the agents actually think for us daily — proactive insights, automated digests, predictive risk scoring.

Your feedback shapes what we build next. Be brutal — I want this to be genuinely 10x, not just another dashboard.

Let's sync after you've both had a chance to click through it. Maybe Thursday?

— James
