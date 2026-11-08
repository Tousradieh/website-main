-- Campaign document v2: eight organisational units, managers as a role (not a unit),
-- digital profile, improvement projects with the ease/impact matrix, reward store and
-- encouragement messages.

ALTER TABLE employees ADD COLUMN is_manager INTEGER NOT NULL DEFAULT 0;
ALTER TABLE employees ADD COLUMN job_title TEXT NOT NULL DEFAULT '';
ALTER TABLE employees ADD COLUMN mobile TEXT NOT NULL DEFAULT '';

-- "management" used to be a department; it is now the is_manager flag.
UPDATE employees SET is_manager = 1, department = NULL WHERE department = 'management';
-- "sales" unit is now commerce (tenders, contracts, sales); the key stays "sales".

-- Small improvement projects (month 3 grand prize). A manager scores ease and impact 1-5.
CREATE TABLE IF NOT EXISTS improvement_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_code TEXT NOT NULL REFERENCES employees(code),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  teammates TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ease INTEGER,
  impact INTEGER,
  points INTEGER NOT NULL DEFAULT 0,
  feedback TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_improvements_status ON improvement_projects(status);
CREATE INDEX IF NOT EXISTS idx_improvements_employee ON improvement_projects(employee_code);

-- Reward store (Texaco Points model). stock NULL = unlimited.
CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cost INTEGER NOT NULL,
  stock INTEGER,
  active INTEGER NOT NULL DEFAULT 1
);

-- Spending: pending and approved redemptions reduce the spendable balance; rejected ones refund.
CREATE TABLE IF NOT EXISTS redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_code TEXT NOT NULL REFERENCES employees(code),
  reward_id INTEGER NOT NULL REFERENCES rewards(id),
  cost INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_redemptions_employee ON redemptions(employee_code);

-- Encouragement messages from a manager or the strategy team.
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_code TEXT NOT NULL REFERENCES employees(code),
  from_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_code);
