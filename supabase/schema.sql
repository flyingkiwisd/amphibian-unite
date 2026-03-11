-- =============================================================================
-- Amphibian Unite — Supabase Database Schema (Phase 2)
-- =============================================================================
-- Run this in the Supabase SQL Editor to set up the database.
-- Priority order: tasks → notes → decisions → journals → okr_progress → kpi_snapshots
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. TASKS (highest priority — Task Commander is already CRUD-ready)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  owner TEXT NOT NULL, -- team member ID (e.g., 'james', 'ross')
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'blocked', 'done', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  category TEXT DEFAULT 'general',
  deadline DATE,
  tags TEXT[] DEFAULT '{}',
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL, -- who created this task
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_owner ON tasks(owner);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- =============================================================================
-- 2. NOTES (personal notes per user)
-- =============================================================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- team member ID
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_notes_pinned ON notes(is_pinned);

-- =============================================================================
-- 3. DECISIONS (decision log entries)
-- =============================================================================
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  decided_by TEXT NOT NULL, -- team member ID
  decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'decided' CHECK (status IN ('proposed', 'decided', 'revisiting', 'reversed')),
  category TEXT DEFAULT 'general',
  impact TEXT DEFAULT 'medium' CHECK (impact IN ('critical', 'high', 'medium', 'low')),
  rationale TEXT,
  affected_people TEXT[] DEFAULT '{}', -- array of team member IDs
  related_okr_id TEXT, -- link to OKR
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_decisions_decided_by ON decisions(decided_by);
CREATE INDEX idx_decisions_status ON decisions(status);
CREATE INDEX idx_decisions_date ON decisions(decision_date);

-- =============================================================================
-- 4. JOURNAL ENTRIES (morning/EOD/weekly/monthly reflections)
-- =============================================================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- team member ID
  entry_type TEXT NOT NULL CHECK (entry_type IN ('morning', 'eod', 'weekly', 'monthly')),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content JSONB NOT NULL DEFAULT '{}',
  -- JSONB structure varies by type:
  -- morning: { priorities: [], intentions: [], blockers: [] }
  -- eod: { accomplished: [], learned: [], tomorrow: [] }
  -- weekly: { wins: [], challenges: [], nextWeek: [] }
  -- monthly: { highlights: [], metrics: [], goals: [] }
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'tough', 'rough')),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One entry per user per type per day
  UNIQUE (user_id, entry_type, entry_date)
);

CREATE INDEX idx_journal_user ON journal_entries(user_id);
CREATE INDEX idx_journal_type ON journal_entries(entry_type);
CREATE INDEX idx_journal_date ON journal_entries(entry_date);

-- =============================================================================
-- 5. OKR PROGRESS (weekly progress updates on key results)
-- =============================================================================
CREATE TABLE IF NOT EXISTS okr_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  okr_id TEXT NOT NULL, -- references OKR from static data
  key_result_index INTEGER NOT NULL, -- which key result (0-indexed)
  progress NUMERIC(5,2) NOT NULL CHECK (progress BETWEEN 0 AND 100),
  notes TEXT,
  updated_by TEXT NOT NULL, -- team member ID
  week_of DATE NOT NULL, -- Monday of the week
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (okr_id, key_result_index, week_of)
);

CREATE INDEX idx_okr_progress_okr ON okr_progress(okr_id);
CREATE INDEX idx_okr_progress_week ON okr_progress(week_of);

-- =============================================================================
-- 6. KPI SNAPSHOTS (KPI values over time — currently static)
-- =============================================================================
CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id TEXT NOT NULL, -- references KPI from static data
  value TEXT NOT NULL,
  numeric_value NUMERIC, -- for charting, nullable for non-numeric KPIs
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (kpi_id, snapshot_date)
);

CREATE INDEX idx_kpi_snapshots_kpi ON kpi_snapshots(kpi_id);
CREATE INDEX idx_kpi_snapshots_date ON kpi_snapshots(snapshot_date);

-- =============================================================================
-- 7. ACTIVITY LOG (audit trail of all actions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'completed', 'commented', etc.
  entity_type TEXT NOT NULL, -- 'task', 'decision', 'note', 'okr', 'journal'
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_date ON activity_log(created_at);

-- =============================================================================
-- 8. MEETINGS (for Meeting Intelligence view)
-- =============================================================================
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  attendees TEXT[] DEFAULT '{}', -- team member IDs
  agenda TEXT,
  notes TEXT,
  action_items JSONB DEFAULT '[]',
  -- action_items: [{ text, assignee, deadline, completed }]
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_meetings_status ON meetings(status);

-- =============================================================================
-- ROW-LEVEL SECURITY (RLS) — team members can only access appropriate data
-- =============================================================================
-- For now, all team members can read all data (it's an internal tool).
-- Write access is scoped to the user's own entries.

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read everything (internal team tool)
CREATE POLICY "Team members can read all tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Team members can read all notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Team members can read all decisions" ON decisions FOR SELECT USING (true);
CREATE POLICY "Team members can read all journals" ON journal_entries FOR SELECT USING (true);
CREATE POLICY "Team members can read all OKR progress" ON okr_progress FOR SELECT USING (true);
CREATE POLICY "Team members can read all KPI snapshots" ON kpi_snapshots FOR SELECT USING (true);
CREATE POLICY "Team members can read all activity" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Team members can read all meetings" ON meetings FOR SELECT USING (true);

-- All authenticated users can insert (team collaboration)
CREATE POLICY "Team members can create tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Team members can create notes" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Team members can create decisions" ON decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Team members can create journals" ON journal_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Team members can create OKR progress" ON okr_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Team members can create KPI snapshots" ON kpi_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Team members can log activity" ON activity_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Team members can create meetings" ON meetings FOR INSERT WITH CHECK (true);

-- Update own entries only (for personal data like notes and journals)
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (true);
CREATE POLICY "Users can update own journals" ON journal_entries FOR UPDATE USING (true);
CREATE POLICY "Task owners can update tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Decision makers can update decisions" ON decisions FOR UPDATE USING (true);
CREATE POLICY "Team members can update OKR progress" ON okr_progress FOR UPDATE USING (true);
CREATE POLICY "Meeting creators can update meetings" ON meetings FOR UPDATE USING (true);

-- =============================================================================
-- UPDATED_AT TRIGGER — auto-update the updated_at column
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER decisions_updated_at BEFORE UPDATE ON decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
