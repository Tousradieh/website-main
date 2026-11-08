-- هم‌مسیر توس: campaign database (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team_id TEXT NOT NULL REFERENCES teams(id),
  pin_hash TEXT NOT NULL,
  failed_logins INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  employee_code TEXT NOT NULL REFERENCES employees(code),
  expires_at INTEGER NOT NULL
);

-- questions: JSON array of { "q": string, "options": string[], "answer": number (0-based) }
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week INTEGER NOT NULL,
  title TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 100,
  questions TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  employee_code TEXT NOT NULL REFERENCES employees(code),
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  points INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (employee_code, quiz_id)
);

-- Real-system mission points (the 60% share). Either employee_code or team_id is set;
-- a team row gives its points to every member of that team.
CREATE TABLE IF NOT EXISTS mission_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_code TEXT REFERENCES employees(code),
  team_id TEXT REFERENCES teams(id),
  week INTEGER NOT NULL,
  points INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_employees_team ON employees(team_id);
CREATE INDEX IF NOT EXISTS idx_missions_employee ON mission_points(employee_code);
CREATE INDEX IF NOT EXISTS idx_missions_team ON mission_points(team_id);
