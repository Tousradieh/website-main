import { hashPin } from './auth';
import { DEPARTMENTS, type Department } from './curriculum';
import { CAMPAIGN_WEEKS, cleanText, ERRORS, HttpError, normalizeDigits, readJson, type Env } from './http';

/**
 * Admin CRUD for the three data tables edited by hand: units/sites, personnel and mission
 * points. CSV imports (admin.ts) stay for bulk loads.
 */

const TEAM_ID_PATTERN = /^[a-z0-9-]{2,40}$/;
const CODE_PATTERN = /^[0-9A-Za-z-]{1,20}$/;

/** Random 6-digit PIN, avoiding the most guessable ones (repeated or sequential digits). */
export function generatePin(): string {
  for (;;) {
    const value = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
    if (/^(\d)\1+$/.test(value) || '0123456789'.includes(value) || '9876543210'.includes(value)) continue;
    return value;
  }
}

// ---------- units / sites ----------

export async function saveTeam(env: Env, request: Request) {
  const body = await readJson<{ id?: unknown; name?: unknown }>(request);
  const id = cleanText(body.id, 40);
  const name = cleanText(body.name, 100);
  if (!TEAM_ID_PATTERN.test(id)) throw new HttpError(400, 'شناسه فقط حروف کوچک انگلیسی، عدد و خط تیره باشد');
  if (!name) throw new HttpError(400, 'نام واحد را وارد کنید');
  await env.DB.prepare('INSERT INTO teams (id, name) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name')
    .bind(id, name)
    .run();
  return { ok: true };
}

export async function deleteTeam(env: Env, id: string) {
  const used = await env.DB.prepare(
    `SELECT (SELECT COUNT(*) FROM employees WHERE team_id = ?1) AS members,
            (SELECT COUNT(*) FROM mission_points WHERE team_id = ?1) AS missions`,
  )
    .bind(id)
    .first<{ members: number; missions: number }>();
  if (used && used.members > 0) throw new HttpError(409, 'این واحد عضو دارد؛ ابتدا پرسنل آن را به واحد دیگری منتقل کنید');
  if (used && used.missions > 0) throw new HttpError(409, 'برای این واحد امتیاز ماموریت ثبت شده است؛ ابتدا آن‌ها را حذف کنید');
  await env.DB.prepare('DELETE FROM teams WHERE id = ?').bind(id).run();
  return { ok: true };
}

// ---------- personnel ----------

export async function listEmployees(env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT e.code, e.name, e.team_id AS teamId, t.name AS teamName, e.department, e.is_manager AS isManager,
       e.job_title AS jobTitle, e.mobile, e.locked_until > ? AS locked
     FROM employees e JOIN teams t ON t.id = e.team_id
     ORDER BY t.name, e.name`,
  )
    .bind(Date.now())
    .all();
  return { ok: true, employees: results };
}

/**
 * Create or edit one person. A new person gets the given PIN or a generated one; the PIN is
 * returned once so the admin can hand it over. Editing never touches the PIN.
 */
export async function saveEmployee(env: Env, request: Request) {
  const body = await readJson<{
    code?: unknown;
    name?: unknown;
    teamId?: unknown;
    department?: unknown;
    isManager?: unknown;
    pin?: unknown;
    create?: unknown;
  }>(request);
  const code = normalizeDigits(cleanText(body.code, 20));
  const name = cleanText(body.name, 100);
  const teamId = cleanText(body.teamId, 40);
  const department = cleanText(body.department, 20) || null;
  const isManager = body.isManager === true ? 1 : 0;
  if (!CODE_PATTERN.test(code)) throw new HttpError(400, 'کد پرسنلی نامعتبر است');
  if (!name) throw new HttpError(400, 'نام را وارد کنید');
  if (department && !DEPARTMENTS.includes(department as Department)) throw new HttpError(400, 'واحد سازمانی نامعتبر است');
  const team = await env.DB.prepare('SELECT id FROM teams WHERE id = ?').bind(teamId).first();
  if (!team) throw new HttpError(400, 'واحد یا کارگاه را انتخاب کنید');

  if (body.create !== true) {
    const result = await env.DB.prepare(
      'UPDATE employees SET name = ?, team_id = ?, department = ?, is_manager = ? WHERE code = ?',
    )
      .bind(name, teamId, department, isManager, code)
      .run();
    if (!result.meta.changes) throw new HttpError(404, ERRORS.notFound);
    return { ok: true };
  }

  const pin = normalizeDigits(cleanText(body.pin, 8)) || generatePin();
  if (!/^\d{6,8}$/.test(pin)) throw new HttpError(400, 'رمز باید ۶ تا ۸ رقم باشد');
  const exists = await env.DB.prepare('SELECT 1 FROM employees WHERE code = ?').bind(code).first();
  if (exists) throw new HttpError(409, 'این کد پرسنلی قبلاً ثبت شده است');
  await env.DB.prepare(
    'INSERT INTO employees (code, name, team_id, department, is_manager, pin_hash) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(code, name, teamId, department, isManager, await hashPin(env, code, pin))
    .run();
  return { ok: true, pin };
}

/** New PIN for one person (given or generated); unlocks the account and signs them out everywhere. */
export async function resetPin(env: Env, request: Request, code: string) {
  const body = await readJson<{ pin?: unknown }>(request);
  const pin = normalizeDigits(cleanText(body.pin, 8)) || generatePin();
  if (!/^\d{6,8}$/.test(pin)) throw new HttpError(400, 'رمز باید ۶ تا ۸ رقم باشد');
  const [update] = await env.DB.batch([
    env.DB.prepare('UPDATE employees SET pin_hash = ?, failed_logins = 0, locked_until = 0 WHERE code = ?').bind(
      await hashPin(env, code, pin),
      code,
    ),
    env.DB.prepare('DELETE FROM sessions WHERE employee_code = ?').bind(code),
  ]);
  if (!update.meta.changes) throw new HttpError(404, ERRORS.notFound);
  return { ok: true, pin };
}

/** Removes a person and everything they earned or submitted. */
export async function deleteEmployee(env: Env, code: string) {
  const tables = [
    'sessions',
    'quiz_attempts',
    'module_results',
    'activity_claims',
    'capstones',
    'improvement_projects',
    'redemptions',
    'mission_points',
  ];
  const results = await env.DB.batch([
    ...tables.map((table) => env.DB.prepare(`DELETE FROM ${table} WHERE employee_code = ?`).bind(code)),
    env.DB.prepare('DELETE FROM messages WHERE to_code = ?').bind(code),
    env.DB.prepare('DELETE FROM employees WHERE code = ?').bind(code),
  ]);
  if (!results[results.length - 1].meta.changes) throw new HttpError(404, ERRORS.notFound);
  return { ok: true };
}

// ---------- mission points ----------

export async function listMissions(env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT m.id, m.employee_code AS employeeCode, e.name AS employeeName, m.team_id AS teamId, t.name AS teamName,
       m.week, m.points, m.note, m.created_at AS createdAt
     FROM mission_points m
     LEFT JOIN employees e ON e.code = m.employee_code
     LEFT JOIN teams t ON t.id = m.team_id
     ORDER BY m.id DESC
     LIMIT 500`,
  ).all();
  return { ok: true, missions: results };
}

/** Add (no id) or edit (id) one mission entry for a person or a whole unit. */
export async function saveMission(env: Env, request: Request) {
  const body = await readJson<{
    id?: unknown;
    employeeCode?: unknown;
    teamId?: unknown;
    week?: unknown;
    points?: unknown;
    note?: unknown;
  }>(request);
  const week = body.week;
  const points = body.points;
  if (!Number.isInteger(week) || (week as number) < 1 || (week as number) > CAMPAIGN_WEEKS) {
    throw new HttpError(400, 'هفته نامعتبر است');
  }
  if (!Number.isInteger(points) || Math.abs(points as number) > 10000 || points === 0) {
    throw new HttpError(400, 'امتیاز نامعتبر است');
  }
  const note = cleanText(body.note, 200);

  if (body.id !== undefined) {
    if (!Number.isInteger(body.id)) throw new HttpError(400, ERRORS.badRequest);
    const result = await env.DB.prepare('UPDATE mission_points SET week = ?, points = ?, note = ? WHERE id = ?')
      .bind(week, points, note, body.id)
      .run();
    if (!result.meta.changes) throw new HttpError(404, ERRORS.notFound);
    return { ok: true };
  }

  const employeeCode = typeof body.employeeCode === 'string' && body.employeeCode ? body.employeeCode : null;
  const teamId = typeof body.teamId === 'string' && body.teamId ? body.teamId : null;
  if ((employeeCode === null) === (teamId === null)) throw new HttpError(400, 'یک نفر یا یک واحد را انتخاب کنید');
  const target = employeeCode
    ? await env.DB.prepare('SELECT 1 FROM employees WHERE code = ?').bind(employeeCode).first()
    : await env.DB.prepare('SELECT 1 FROM teams WHERE id = ?').bind(teamId).first();
  if (!target) throw new HttpError(404, ERRORS.notFound);
  await env.DB.prepare(
    'INSERT INTO mission_points (employee_code, team_id, week, points, note, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(employeeCode, teamId, week, points, note, Date.now())
    .run();
  return { ok: true };
}

export async function deleteMission(env: Env, id: number) {
  await env.DB.prepare('DELETE FROM mission_points WHERE id = ?').bind(id).run();
  return { ok: true };
}
