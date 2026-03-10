# Slack Message to Ross & Timon

---

Hey @Ross @Timon - excited to share something I've been building with Claude that I think can be a serious force multiplier for the team.

**Introducing: Amphibian Unite - our 10x Internal Operating System**

I had Claude build a full working prototype of an internal platform that brings together everything we've been talking about - our vision, strategy, roles, OKRs, tasks, and the 14 AI agents from The Bridge V3 - all in one place.

**What it does today (working prototype):**
- **Login per team member** - everyone gets their own profile
- **Command Center dashboard** - North Star ($1B+ AUM), live KPIs, OKR progress, roadmap phases all in one view
- **14 AI Agents** - each of the intelligence agents from our strategy doc, with capabilities, data sources, and status tracking
- **Team Operating Systems** - every person's 1-pager (roles, responsibilities, decision rights, non-negotiables) from the R&R doc, viewable and exportable as PDF
- **Task Commander** - Asana-style task management pre-loaded with our 90-day action plan. List + Kanban views, filters, priority sorting
- **$1B+ Roadmap** - visual timeline from Prove It (Q2) through The Bridge (2030), with AUM trajectory table
- **AI Edge tracker** - 6-layer AI advantage visualization with progress bars and bps attribution
- **PDF export on every view** - so anyone can download and connect to their own Claude/LLM

**Tech stack:** Next.js 15, TypeScript, Tailwind CSS, responsive (works on desktop + mobile)

**Source code:** [GITHUB LINK - to be added once repo is pushed]

**What I need from you two:**

1. **Clone it, run it, break it** - `git clone [repo] && npm install && npm run dev` and tell me what you think
2. **Make it 10x better** - you both know our systems and data better than anyone. The prototype has all the right structure - now it needs real data connections and your engineering eyes
3. **Set up the production environment** - I'm thinking:
   - **Vercel** for hosting (auto-deploy from GitHub)
   - **Supabase** for database + auth + realtime (PostgreSQL with row-level security)
   - **GitHub Actions** for CI/CD
   - Proper env variables, secrets management, 2FA for all users
4. **API layer** - the SETUP.md has a proposed REST API spec so everyone can connect Unite to their Claude via MCP. Would love your input on the right endpoints
5. **Slack integration** - one of the 14 agents is "Slack Signal Intelligence" that scans our channels for decisions and action items. Would be amazing to wire that up

The full setup guide with security checklist, database schema, and LLM integration instructions is in `SETUP.md`.

This is meant to be **the machine behind the machine** - where we all see the same scoreboard, track the same priorities, and have our roles/responsibilities/decision rights crystal clear. One source of truth.

Let's jam on this - excited to hear your thoughts and make it real.

-- James
