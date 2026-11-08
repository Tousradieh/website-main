-- Learning tracks (lessons + quizzes live in src/curriculum; only progress is stored here),
-- department per employee, and login throttling.

ALTER TABLE employees ADD COLUMN department TEXT;

-- One row per employee per module. first_points is fixed by the first attempt so retries
-- (after the answers are shown) can't farm points; passed flips once any attempt passes.
CREATE TABLE IF NOT EXISTS module_results (
  employee_code TEXT NOT NULL REFERENCES employees(code),
  module_id TEXT NOT NULL,
  first_points INTEGER NOT NULL,
  best_correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  passed INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (employee_code, module_id)
);

-- Final practical assignment of a track; points count only after a manager approves it.
CREATE TABLE IF NOT EXISTS capstones (
  employee_code TEXT NOT NULL REFERENCES employees(code),
  track_id TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  points INTEGER NOT NULL,
  feedback TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER,
  PRIMARY KEY (employee_code, track_id)
);

CREATE INDEX IF NOT EXISTS idx_capstones_status ON capstones(status);

-- Failed sign-in counters per client IP (employee and admin logins).
CREATE TABLE IF NOT EXISTS throttle (
  key TEXT PRIMARY KEY,
  failures INTEGER NOT NULL,
  window_start INTEGER NOT NULL,
  locked_until INTEGER NOT NULL DEFAULT 0
);

-- Session tokens are now stored hashed; old raw-token sessions are dropped.
DELETE FROM sessions;
