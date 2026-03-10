# Amphibian Unite: 10x Internal Operating System

## Quick Start (For All Team Members)

### Prerequisites
- **Node.js 18+** installed ([download here](https://nodejs.org))
- **Git** installed
- Access to the Amphibian GitHub organization

### 1. Clone the Repository
```bash
git clone https://github.com/AmphibianCapital/amphibian-unite.git
cd amphibian-unite
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Select your profile to log in.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## For Ross & Timon: Development Environment Setup

### Recommended Stack for Production
- **Hosting**: Vercel (free tier works, instant deploys from GitHub)
- **Database**: Supabase (PostgreSQL + Auth + Realtime + Row-Level Security)
- **Auth**: Supabase Auth (email/password + magic links for team)
- **Storage**: Supabase Storage (for documents, PDFs)
- **CI/CD**: GitHub Actions (lint, test, build on every PR)

### Environment Variables (create `.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Schema (Supabase)
Priority tables to create:
1. `users` - Team member profiles, roles, preferences
2. `tasks` - Task management (the Task Commander data)
3. `okrs` - OKR tracking with key results
4. `kpis` - KPI snapshots over time
5. `decisions` - Decision log (governance agent)
6. `documents` - Knowledge base entries
7. `notes` - Personal notes per user (syncs with LLM)
8. `agent_configs` - Per-agent settings and data source connections

### Security Checklist
- [ ] Enable Row-Level Security (RLS) on all Supabase tables
- [ ] Set up Supabase Auth with team email domains only
- [ ] Enable 2FA for all team members
- [ ] Use environment variables for all secrets (never commit `.env`)
- [ ] Set up CORS to allow only your domain
- [ ] Enable Supabase audit logs
- [ ] Configure backup schedule (daily)

### Deployment to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```
Or connect the GitHub repo to Vercel for automatic deploys on push to `main`.

---

## Mobile App Setup (Future)
The app is already responsive and works on mobile browsers. For a native app:
- Use **Capacitor** to wrap the Next.js app as iOS/Android
- Or build a **React Native (Expo)** companion app sharing the same Supabase backend

---

## Connecting Your LLM / Claude

### Option A: Claude Projects (Recommended - Easiest)
1. Create a Claude Project called "Amphibian Unite"
2. Upload any PDF exports from the app as Project Knowledge
3. Claude will have full context of your OKRs, tasks, roles, etc.
4. Update exports weekly to keep Claude current

### Option B: API Integration (For Developers)
The app exposes a REST API that any LLM can read from:

```
GET /api/me              → Your profile, role, responsibilities
GET /api/tasks           → Your tasks and the team's tasks
GET /api/okrs            → Current OKRs and progress
GET /api/kpis            → Latest KPI snapshots
GET /api/decisions       → Decision log
GET /api/notes           → Your personal notes
POST /api/notes          → Save a note (from Claude or any tool)
GET /api/agents          → Agent statuses and capabilities
GET /api/export/pdf/:view → Export any view as PDF
```

**Example: Connect Claude to Unite via MCP**

Create an MCP server that calls the Unite API:
```json
{
  "mcpServers": {
    "amphibian-unite": {
      "command": "node",
      "args": ["./mcp-unite-server.js"],
      "env": {
        "UNITE_API_URL": "https://unite.amphibiancapital.com",
        "UNITE_API_KEY": "your-personal-api-key"
      }
    }
  }
}
```

This lets Claude directly read/write your tasks, notes, and data from Unite.

### Option C: Webhook Sync
Set up webhooks so Unite pushes updates to your tools:
- When a task is assigned to you → notification in Slack
- When an OKR is updated → sync to your Claude Project
- When a decision is logged → append to your personal knowledge base

---

## Architecture

```
amphibian-unite/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout with metadata
│   │   ├── page.tsx          # Main app entry (login + routing)
│   │   └── globals.css       # Design system (dark theme, animations)
│   ├── components/
│   │   ├── LoginScreen.tsx   # Team member login
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   └── views/
│   │       ├── DashboardView.tsx   # Command Center
│   │       ├── AgentsView.tsx      # 14 AI Agents
│   │       ├── TeamView.tsx        # Team Operating Systems
│   │       ├── OKRView.tsx         # OKRs & KPIs
│   │       ├── TasksView.tsx       # Task Commander
│   │       ├── RoadmapView.tsx     # $1B+ Roadmap
│   │       └── AIEdgeView.tsx      # AI Edge Tracker
│   └── lib/
│       └── data.ts           # All team, agent, OKR, KPI data
├── public/                   # Static assets
├── package.json
└── SETUP.md                  # This file
```

---

## Contributing
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Push and create a PR: `gh pr create`
4. Get review from at least one team member
5. Merge to `main` → auto-deploys to Vercel
