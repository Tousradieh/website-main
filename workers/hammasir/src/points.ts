import type { Env } from './http';

/**
 * Personal points per employee, split into the campaign's two shares:
 * - knowledge (40%): weekly quizzes, learning-track modules, approved courses/classes
 * - missions (60%): mission points from real-system work, approved track capstones
 * Team-level mission points are added separately (every member of the team gets them).
 * "active" = the person has earned any knowledge point themselves.
 */
const PERSONAL_POINTS = `
  SELECT employee_code,
    SUM(CASE WHEN share = 'k' THEN points ELSE 0 END) AS knowledge,
    SUM(CASE WHEN share = 'm' THEN points ELSE 0 END) AS missions,
    MAX(CASE WHEN share = 'k' THEN 1 ELSE 0 END) AS active
  FROM (
    SELECT employee_code, points, 'k' AS share FROM quiz_attempts
    UNION ALL
    SELECT employee_code, first_points, 'k' FROM module_results
    UNION ALL
    SELECT c.employee_code, a.points, 'k' FROM activity_claims c
      JOIN activities a ON a.id = c.activity_id WHERE c.status = 'approved'
    UNION ALL
    SELECT employee_code, points, 'm' FROM capstones WHERE status = 'approved'
    UNION ALL
    SELECT employee_code, points, 'm' FROM mission_points WHERE employee_code IS NOT NULL
  )
  GROUP BY employee_code`;

export interface TeamStanding {
  id: string;
  name: string;
  members: number;
  participation: number;
  score: number;
  rank: number;
}

/**
 * Team ranking: the team score is the average personal total per member plus the team's own
 * mission points, so small and large sites compete fairly. Units with no members are left out.
 */
export async function leaderboard(env: Env): Promise<TeamStanding[]> {
  const { results } = await env.DB.prepare(
    `SELECT t.id, t.name,
       COUNT(e.code) AS members,
       COALESCE(SUM(p.active), 0) AS active,
       COALESCE(SUM(COALESCE(p.knowledge, 0) + COALESCE(p.missions, 0)), 0) AS personal_points,
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

export async function wallet(env: Env, employeeCode: string, teamId: string) {
  const row = await env.DB.prepare(
    `SELECT COALESCE(p.knowledge, 0) AS knowledge,
       COALESCE(p.missions, 0) + COALESCE((SELECT SUM(points) FROM mission_points WHERE team_id = ?2), 0) AS missions
     FROM (SELECT 1) LEFT JOIN (${PERSONAL_POINTS}) p ON p.employee_code = ?1`,
  )
    .bind(employeeCode, teamId)
    .first<{ knowledge: number; missions: number }>();
  const knowledge = row?.knowledge ?? 0;
  const missions = row?.missions ?? 0;
  return { knowledge, missions, total: knowledge + missions };
}

export async function activeCount(env: Env): Promise<number> {
  const row = await env.DB.prepare(`SELECT COALESCE(SUM(active), 0) AS active FROM (${PERSONAL_POINTS})`).first<{
    active: number;
  }>();
  return row?.active ?? 0;
}
