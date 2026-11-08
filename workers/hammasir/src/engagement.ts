import type { Employee } from './auth';
import { campaignStatus, cleanText, ERRORS, HttpError, normalizeDigits, readJson, type Env } from './http';
import { pendingCapstones, reviewerScope, type Reviewer } from './learning';
import { peoplePoints, wallet } from './points';

/** Mission points for completing the digital profile (document v2, month 1 operational task). */
const PROFILE_POINTS = 20;
const PROFILE_NOTE = 'تکمیل پروفایل دیجیتال';

/** Improvement project points = ease × impact × this (max 5 × 5 × 8 = 200). */
const IMPROVEMENT_FACTOR = 8;

/** Keep in sync with website-main/lib/hammasir.ts IMPROVEMENT_CATEGORIES */
const IMPROVEMENT_CATEGORIES = ['waste', 'fuel', 'idle', 'systems', 'ai', 'quality', 'safety', 'other'] as const;

// ---------- digital profile ----------

export async function saveProfile(env: Env, employee: Employee, request: Request) {
  const body = await readJson<{ jobTitle?: unknown; mobile?: unknown }>(request);
  const jobTitle = cleanText(body.jobTitle, 80);
  const mobile = normalizeDigits(cleanText(body.mobile, 20)).replace(/[\s-]/g, '');
  if (!jobTitle) throw new HttpError(400, 'عنوان شغل را وارد کنید');
  if (!/^09\d{9}$/.test(mobile)) throw new HttpError(400, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');

  const firstTime = !employee.job_title || !employee.mobile;
  const statements = [
    env.DB.prepare('UPDATE employees SET job_title = ?, mobile = ? WHERE code = ?').bind(jobTitle, mobile, employee.code),
  ];
  if (firstTime) {
    // Award once: the note doubles as the marker that it was given.
    statements.push(
      env.DB.prepare(
        `INSERT INTO mission_points (employee_code, team_id, week, points, note, created_at)
         SELECT ?1, NULL, ?2, ?3, ?4, ?5
         WHERE NOT EXISTS (SELECT 1 FROM mission_points WHERE employee_code = ?1 AND note = ?4)`,
      ).bind(employee.code, Math.max(1, campaignStatus(env).week), PROFILE_POINTS, PROFILE_NOTE, Date.now()),
    );
  }
  await env.DB.batch(statements);
  return { ok: true, awarded: firstTime ? PROFILE_POINTS : 0 };
}

// ---------- messages ----------

export async function myMessages(env: Env, employee: Employee) {
  const { results } = await env.DB.prepare(
    'SELECT from_name AS fromName, text, created_at AS createdAt FROM messages WHERE to_code = ? ORDER BY id DESC LIMIT 10',
  )
    .bind(employee.code)
    .all();
  return results;
}

export async function sendMessage(env: Env, request: Request, reviewer: Reviewer) {
  const body = await readJson<{ to?: unknown; text?: unknown }>(request);
  const text = cleanText(body.text, 300);
  if (typeof body.to !== 'string' || !text) throw new HttpError(400, ERRORS.badRequest);
  const scope = reviewerScope(reviewer);
  const result = await env.DB.prepare(
    `INSERT INTO messages (to_code, from_name, text, created_at)
     SELECT e.code, ?, ?, ? FROM employees e WHERE e.code = ? AND ${scope.sql}`,
  )
    .bind(reviewer.kind === 'admin' ? 'تیم استراتژی' : reviewer.name, text, Date.now(), body.to, ...scope.binds)
    .run();
  if (!result.meta.changes) throw new HttpError(404, ERRORS.notFound);
  return { ok: true };
}

// ---------- improvement projects ----------

export async function myImprovements(env: Env, employee: Employee) {
  const { results } = await env.DB.prepare(
    `SELECT id, title, category, problem, solution, teammates, status, ease, impact, points, feedback,
       created_at AS createdAt
     FROM improvement_projects WHERE employee_code = ? ORDER BY id DESC`,
  )
    .bind(employee.code)
    .all();
  return { ok: true, projects: results };
}

export async function submitImprovement(env: Env, employee: Employee, request: Request) {
  const body = await readJson<{
    title?: unknown;
    category?: unknown;
    problem?: unknown;
    solution?: unknown;
    teammates?: unknown;
  }>(request);
  const title = cleanText(body.title, 120);
  const problem = cleanText(body.problem, 2000);
  const solution = cleanText(body.solution, 2000);
  if (!title || problem.length < 20 || solution.length < 20) {
    throw new HttpError(400, 'عنوان، شرح مشکل و راه‌حل را کامل بنویسید');
  }
  if (!IMPROVEMENT_CATEGORIES.includes(body.category as (typeof IMPROVEMENT_CATEGORIES)[number])) {
    throw new HttpError(400, 'موضوع پروژه را انتخاب کنید');
  }
  const pending = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM improvement_projects WHERE employee_code = ? AND status = 'pending'",
  )
    .bind(employee.code)
    .first<{ count: number }>();
  if ((pending?.count ?? 0) >= 3) throw new HttpError(409, 'تا بررسی پروژه‌های قبلی، حداکثر ۳ پروژه در انتظار مجاز است');

  await env.DB.prepare(
    `INSERT INTO improvement_projects (employee_code, title, category, problem, solution, teammates, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(employee.code, title, body.category, problem, solution, cleanText(body.teammates, 300), Date.now())
    .run();
  return { ok: true };
}

export async function pendingImprovements(env: Env, reviewer: Reviewer) {
  const scope = reviewerScope(reviewer);
  const { results } = await env.DB.prepare(
    `SELECT p.id, p.employee_code AS employeeCode, e.name AS employeeName, t.name AS teamName, p.title, p.category,
       p.problem, p.solution, p.teammates, p.created_at AS createdAt
     FROM improvement_projects p
     JOIN employees e ON e.code = p.employee_code
     JOIN teams t ON t.id = e.team_id
     WHERE p.status = 'pending' AND ${scope.sql}
     ORDER BY p.created_at`,
  )
    .bind(...scope.binds)
    .all();
  return results;
}

/** Approved projects ranked by matrix score (for picking the 12 prize winners). */
export async function topImprovements(env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT p.id, e.name AS employeeName, t.name AS teamName, p.title, p.category, p.ease, p.impact, p.points
     FROM improvement_projects p
     JOIN employees e ON e.code = p.employee_code
     JOIN teams t ON t.id = e.team_id
     WHERE p.status = 'approved'
     ORDER BY p.points DESC, p.impact DESC, p.created_at
     LIMIT 30`,
  ).all();
  return results;
}

export async function reviewImprovement(env: Env, request: Request, reviewer: Reviewer) {
  const body = await readJson<{ id?: unknown; approve?: unknown; ease?: unknown; impact?: unknown; feedback?: unknown }>(
    request,
  );
  const score = (value: unknown) => Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5;
  if (!Number.isInteger(body.id) || typeof body.approve !== 'boolean') throw new HttpError(400, ERRORS.badRequest);
  if (body.approve && (!score(body.ease) || !score(body.impact))) {
    throw new HttpError(400, 'سهولت اجرا و اثر استراتژیک را از ۱ تا ۵ امتیاز دهید');
  }
  const feedback = cleanText(body.feedback, 1000);
  if (!body.approve && !feedback) throw new HttpError(400, 'برای رد کردن، نظر خود را بنویسید');

  const ease = body.approve ? (body.ease as number) : null;
  const impact = body.approve ? (body.impact as number) : null;
  const points = ease && impact ? ease * impact * IMPROVEMENT_FACTOR : 0;
  const scope = reviewerScope(reviewer);
  const result = await env.DB.prepare(
    `UPDATE improvement_projects
     SET status = ?, ease = ?, impact = ?, points = ?, feedback = ?, reviewed_by = ?, reviewed_at = ?
     WHERE id = ? AND status = 'pending'
       AND employee_code IN (SELECT e.code FROM employees e WHERE ${scope.sql})`,
  )
    .bind(
      body.approve ? 'approved' : 'rejected',
      ease,
      impact,
      points,
      feedback,
      reviewer.kind === 'admin' ? 'تیم استراتژی' : reviewer.name,
      Date.now(),
      body.id,
      ...scope.binds,
    )
    .run();
  if (!result.meta.changes) throw new HttpError(404, 'این پروژه قبلاً بررسی شده است');
  return { ok: true, points };
}

// ---------- reward store ----------

export async function storeFor(env: Env, employee: Employee) {
  const [rewards, mine, points] = await Promise.all([
    env.DB.prepare(
      `SELECT r.id, r.title, r.description, r.cost,
         CASE WHEN r.stock IS NULL THEN NULL
              ELSE r.stock - (SELECT COUNT(*) FROM redemptions d WHERE d.reward_id = r.id AND d.status != 'rejected') END AS left
       FROM rewards r WHERE r.active = 1 ORDER BY r.cost`,
    ).all(),
    env.DB.prepare(
      `SELECT d.id, r.title, d.cost, d.status, d.created_at AS createdAt
       FROM redemptions d JOIN rewards r ON r.id = d.reward_id
       WHERE d.employee_code = ? ORDER BY d.id DESC LIMIT 20`,
    )
      .bind(employee.code)
      .all(),
    wallet(env, employee.code, employee.team_id),
  ]);
  return { ok: true, rewards: rewards.results, redemptions: mine.results, wallet: points };
}

export async function redeem(env: Env, employee: Employee, request: Request) {
  const { rewardId } = await readJson<{ rewardId?: unknown }>(request);
  if (!Number.isInteger(rewardId)) throw new HttpError(400, ERRORS.badRequest);
  const reward = await env.DB.prepare(
    `SELECT r.id, r.cost,
       CASE WHEN r.stock IS NULL THEN NULL
            ELSE r.stock - (SELECT COUNT(*) FROM redemptions d WHERE d.reward_id = r.id AND d.status != 'rejected') END AS left
     FROM rewards r WHERE r.id = ? AND r.active = 1`,
  )
    .bind(rewardId)
    .first<{ id: number; cost: number; left: number | null }>();
  if (!reward) throw new HttpError(404, ERRORS.notFound);
  if (reward.left !== null && reward.left <= 0) throw new HttpError(409, 'موجودی این جایزه تمام شده است');

  const points = await wallet(env, employee.code, employee.team_id);
  if (points.balance < reward.cost) throw new HttpError(409, 'رادکوین کافی ندارید');

  await env.DB.prepare('INSERT INTO redemptions (employee_code, reward_id, cost, created_at) VALUES (?, ?, ?, ?)')
    .bind(employee.code, reward.id, reward.cost, Date.now())
    .run();
  return { ok: true };
}

export async function addReward(env: Env, request: Request) {
  const body = await readJson<{ title?: unknown; description?: unknown; cost?: unknown; stock?: unknown }>(request);
  const title = cleanText(body.title, 120);
  const validCost = Number.isInteger(body.cost) && (body.cost as number) > 0 && (body.cost as number) <= 100000;
  const validStock =
    body.stock === null || body.stock === undefined || (Number.isInteger(body.stock) && (body.stock as number) >= 0);
  if (!title || !validCost || !validStock) throw new HttpError(400, 'اطلاعات جایزه کامل یا معتبر نیست');
  await env.DB.prepare('INSERT INTO rewards (title, description, cost, stock) VALUES (?, ?, ?, ?)')
    .bind(title, cleanText(body.description, 500), body.cost, body.stock ?? null)
    .run();
  return { ok: true };
}

export async function archiveReward(env: Env, id: number) {
  await env.DB.prepare('UPDATE rewards SET active = 0 WHERE id = ?').bind(id).run();
  return { ok: true };
}

export async function reviewRedemption(env: Env, request: Request) {
  const body = await readJson<{ id?: unknown; approve?: unknown }>(request);
  if (!Number.isInteger(body.id) || typeof body.approve !== 'boolean') throw new HttpError(400, ERRORS.badRequest);
  const result = await env.DB.prepare(
    "UPDATE redemptions SET status = ?, reviewed_at = ? WHERE id = ? AND status = 'pending'",
  )
    .bind(body.approve ? 'approved' : 'rejected', Date.now(), body.id)
    .run();
  if (!result.meta.changes) throw new HttpError(404, 'این درخواست قبلاً بررسی شده است');
  return { ok: true };
}

export async function storeAdmin(env: Env) {
  const [rewards, pending] = await Promise.all([
    env.DB.prepare(
      `SELECT r.id, r.title, r.cost, r.stock,
         (SELECT COUNT(*) FROM redemptions d WHERE d.reward_id = r.id AND d.status != 'rejected') AS claimed
       FROM rewards r WHERE r.active = 1 ORDER BY r.cost`,
    ).all(),
    env.DB.prepare(
      `SELECT d.id, e.code AS employeeCode, e.name AS employeeName, t.name AS teamName, r.title, d.cost,
         d.created_at AS createdAt
       FROM redemptions d
       JOIN employees e ON e.code = d.employee_code
       JOIN teams t ON t.id = e.team_id
       JOIN rewards r ON r.id = d.reward_id
       WHERE d.status = 'pending' ORDER BY d.created_at`,
    ).all(),
  ]);
  return { rewards: rewards.results, pendingRedemptions: pending.results };
}

// ---------- manager team dashboard ----------

export function requireManager(employee: Employee): Reviewer {
  if (employee.is_manager !== 1) throw new HttpError(403, 'این بخش مخصوص مدیران و سرپرستان است');
  return { kind: 'manager', code: employee.code, name: employee.name, teamId: employee.team_id };
}

export async function teamDashboard(env: Env, employee: Employee) {
  const reviewer = requireManager(employee);
  const scope = reviewerScope(reviewer);
  const [members, capstones, improvements, claims] = await Promise.all([
    peoplePoints(env, employee.team_id),
    pendingCapstones(env, reviewer),
    pendingImprovements(env, reviewer),
    env.DB.prepare(
      `SELECT c.employee_code AS employeeCode, e.name AS employeeName, t.name AS teamName,
         c.activity_id AS activityId, a.title AS activityTitle, a.kind, a.points, c.note, c.created_at AS createdAt
       FROM activity_claims c
       JOIN employees e ON e.code = c.employee_code
       JOIN teams t ON t.id = e.team_id
       JOIN activities a ON a.id = c.activity_id
       WHERE c.status = 'pending' AND ${scope.sql}
       ORDER BY c.created_at`,
    )
      .bind(...scope.binds)
      .all(),
  ]);
  const others = members.filter((member) => member.code !== employee.code);
  const active = others.filter((member) => member.knowledge + member.ai > 0).length;
  return {
    ok: true,
    teamName: employee.team_name,
    participation: others.length ? Math.round((active / others.length) * 100) : 0,
    members: others,
    pendingCapstones: capstones,
    pendingImprovements: improvements,
    pendingClaims: claims.results,
  };
}
