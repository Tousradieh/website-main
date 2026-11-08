import type { Env } from './http';

/**
 * Earned points per employee in the three shares of the campaign document (v2):
 * - knowledge (20%): weekly quizzes, strategy/unit track lessons, approved courses/classes
 * - ai (20%): AI-track lessons and the approved AI assignment
 * - missions (60%): mission points for real-system work, approved unit assignments and
 *   approved improvement projects
 * Team-level mission points are added separately (every member of the team gets them).
 * "active" = the person has earned a learning point themselves.
 */
// D1 limits compound SELECTs to a handful of terms, so each share is summed with scalar
// subqueries per employee instead of one big UNION ALL.
const sum = (sql: string) => `COALESCE((${sql}), 0)`;
const PERSONAL_POINTS = `
  SELECT e.code AS employee_code,
    ${sum('SELECT SUM(points) FROM quiz_attempts WHERE employee_code = e.code')}
      + ${sum("SELECT SUM(first_points) FROM module_results WHERE employee_code = e.code AND module_id NOT LIKE 'ai-%'")}
      + ${sum(`SELECT SUM(a.points) FROM activity_claims c JOIN activities a ON a.id = c.activity_id
               WHERE c.employee_code = e.code AND c.status = 'approved'`)} AS knowledge,
    ${sum("SELECT SUM(first_points) FROM module_results WHERE employee_code = e.code AND module_id LIKE 'ai-%'")}
      + ${sum("SELECT SUM(points) FROM capstones WHERE employee_code = e.code AND status = 'approved' AND track_id = 'ai'")} AS ai,
    ${sum("SELECT SUM(points) FROM capstones WHERE employee_code = e.code AND status = 'approved' AND track_id != 'ai'")}
      + ${sum("SELECT SUM(points) FROM improvement_projects WHERE employee_code = e.code AND status = 'approved'")}
      + ${sum('SELECT SUM(points) FROM mission_points WHERE employee_code = e.code')} AS missions,
    CASE WHEN EXISTS (SELECT 1 FROM quiz_attempts WHERE employee_code = e.code)
           OR EXISTS (SELECT 1 FROM module_results WHERE employee_code = e.code)
           OR EXISTS (SELECT 1 FROM activity_claims WHERE employee_code = e.code AND status = 'approved')
         THEN 1 ELSE 0 END AS active
  FROM employees e`;

export interface TeamStanding {
  id: string;
  name: string;
  members: number;
  participation: number;
  score: number;
  rank: number;
}

/**
 * Team ranking: the team score is the average earned total per member plus the team's own
 * mission points, so small and large sites compete fairly. Units with no members are left out.
 * Spending in the reward store does not lower the ranking.
 */
export async function leaderboard(env: Env): Promise<TeamStanding[]> {
  const { results } = await env.DB.prepare(
    `SELECT t.id, t.name,
       COUNT(e.code) AS members,
       COALESCE(SUM(p.active), 0) AS active,
       COALESCE(SUM(COALESCE(p.knowledge, 0) + COALESCE(p.ai, 0) + COALESCE(p.missions, 0)), 0) AS personal_points,
       COALESCE((SELECT SUM(points) FROM mission_points WHERE team_id = t.id), 0) AS team_points
     FROM teams t
     JOIN employees e ON e.team_id = t.id
     LEFT JOIN (${PERSONAL_POINTS}) p ON p.employee_code = e.code
     GROUP BY t.id`,
  ).all<{
    id: string;
    name: string;
    members: number;
    active: number;
    personal_points: number;
    team_points: number;
  }>();

  return results
    .map((t) => ({
      id: t.id,
      name: t.name,
      members: t.members,
      participation: Math.round((t.active / t.members) * 100),
      score: Math.round(t.personal_points / t.members + t.team_points),
    }))
    .sort((a, b) => b.score - a.score || b.participation - a.participation)
    .map((t, i) => ({ ...t, rank: i + 1 }));
}

export interface Wallet {
  knowledge: number;
  ai: number;
  missions: number;
  /** Everything earned. */
  total: number;
  /** Reserved or spent in the reward store (pending + approved redemptions). */
  spent: number;
  /** What can still be spent. */
  balance: number;
}

export async function wallet(env: Env, employeeCode: string, teamId: string): Promise<Wallet> {
  const row = await env.DB.prepare(
    `SELECT COALESCE(p.knowledge, 0) AS knowledge, COALESCE(p.ai, 0) AS ai,
       COALESCE(p.missions, 0) + COALESCE((SELECT SUM(points) FROM mission_points WHERE team_id = ?2), 0) AS missions,
       COALESCE((SELECT SUM(cost) FROM redemptions WHERE employee_code = ?1 AND status != 'rejected'), 0) AS spent
     FROM (SELECT 1) LEFT JOIN (${PERSONAL_POINTS} WHERE e.code = ?1) p ON p.employee_code = ?1`,
  )
    .bind(employeeCode, teamId)
    .first<{ knowledge: number; ai: number; missions: number; spent: number }>();
  const knowledge = row?.knowledge ?? 0;
  const ai = row?.ai ?? 0;
  const missions = row?.missions ?? 0;
  const total = knowledge + ai + missions;
  const spent = row?.spent ?? 0;
  return { knowledge, ai, missions, total, spent, balance: total - spent };
}

/** Earned totals for many people at once (admin export, manager team view). */
export async function peoplePoints(env: Env, teamId?: string) {
  const { results } = await env.DB.prepare(
    `SELECT e.code, e.name, e.team_id AS teamId, t.name AS teamName, e.department, e.is_manager AS isManager,
       e.job_title AS jobTitle,
       COALESCE(p.knowledge, 0) AS knowledge, COALESCE(p.ai, 0) AS ai,
       COALESCE(p.missions, 0) + COALESCE((SELECT SUM(points) FROM mission_points WHERE team_id = e.team_id), 0) AS missions,
       (SELECT COUNT(*) FROM module_results m WHERE m.employee_code = e.code AND m.passed = 1) AS modulesPassed,
       (SELECT COUNT(*) FROM capstones c WHERE c.employee_code = e.code AND c.status = 'approved') AS tracksCompleted,
       (SELECT MAX(updated_at) FROM module_results m WHERE m.employee_code = e.code) AS lastActivity
     FROM employees e JOIN teams t ON t.id = e.team_id
     LEFT JOIN (${PERSONAL_POINTS}) p ON p.employee_code = e.code
     ${teamId ? 'WHERE e.team_id = ?1' : ''}
     ORDER BY t.name, e.name`,
  )
    .bind(...(teamId ? [teamId] : []))
    .all<{
      code: string;
      name: string;
      teamId: string;
      teamName: string;
      department: string | null;
      isManager: number;
      jobTitle: string;
      knowledge: number;
      ai: number;
      missions: number;
      modulesPassed: number;
      tracksCompleted: number;
      lastActivity: number | null;
    }>();
  return results.map((row) => ({ ...row, total: row.knowledge + row.ai + row.missions }));
}

export async function activeCount(env: Env): Promise<number> {
  const row = await env.DB.prepare(`SELECT COALESCE(SUM(active), 0) AS active FROM (${PERSONAL_POINTS})`).first<{
    active: number;
  }>();
  return row?.active ?? 0;
}
