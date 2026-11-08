import { hashPin } from './auth';
import { ACTIVITY_KINDS, type ActivityKind, type QuizQuestion } from './campaign';
import { DEPARTMENTS, type Department } from './curriculum';
import { CAMPAIGN_WEEKS, campaignStatus, cleanText, ERRORS, HttpError, normalizeDigits, readJson, type Env } from './http';
import { pendingImprovements, storeAdmin, topImprovements } from './engagement';
import { generatePin } from './records';
import { pendingCapstones, reviewerScope, trackStats, type Reviewer } from './learning';
import { activeCount, leaderboard } from './points';

const MAX_IMPORT_ROWS = 2000;
// D1 batches are kept small enough to stay well inside per-request limits.
const BATCH_SIZE = 100;

interface ImportResult {
  ok: true;
  imported: number;
  errors: string[];
  /** PINs generated for new people; returned once so HR can hand them out. */
  pins?: { code: string; name: string; pin: string }[];
}

/** Parses CSV or tab-separated text pasted from Excel. Skips blank lines and a header row. */
function parseRows(text: string, headerHints: string[]): string[][] {
  const lines = text
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length > MAX_IMPORT_ROWS) {
    throw new HttpError(400, `حداکثر ${MAX_IMPORT_ROWS} ردیف در هر بار ثبت مجاز است`);
  }
  const rows = lines.map((line) => line.split(line.includes('\t') ? '\t' : ',').map((c) => c.trim()));
  const first = rows[0]?.[0]?.toLowerCase() ?? '';
  if (headerHints.some((hint) => first.includes(hint))) rows.shift();
  return rows;
}

async function runBatches(env: Env, statements: D1PreparedStatement[]) {
  for (let i = 0; i < statements.length; i += BATCH_SIZE) {
    await env.DB.batch(statements.slice(i, i + BATCH_SIZE));
  }
}

const TEAM_ID_PATTERN = /^[a-z0-9-]{2,40}$/;

export async function importTeams(env: Env, text: string): Promise<ImportResult> {
  const errors: string[] = [];
  const statements: D1PreparedStatement[] = [];
  parseRows(text, ['id', 'شناسه']).forEach(([id, name], i) => {
    if (!id || !name) {
      errors.push(`ردیف ${i + 1}: شناسه و نام الزامی است`);
      return;
    }
    if (!TEAM_ID_PATTERN.test(id)) {
      errors.push(`ردیف ${i + 1}: شناسه فقط حروف کوچک انگلیسی، عدد و خط تیره باشد`);
      return;
    }
    statements.push(
      env.DB.prepare('INSERT INTO teams (id, name) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name').bind(
        id,
        name.slice(0, 100),
      ),
    );
  });
  await runBatches(env, statements);
  return { ok: true, imported: statements.length, errors };
}

export async function importEmployees(env: Env, text: string): Promise<ImportResult> {
  const errors: string[] = [];
  const statements: D1PreparedStatement[] = [];
  const pins: { code: string; name: string; pin: string }[] = [];
  let imported = 0;
  const [{ results: teams }, { results: existing }] = await Promise.all([
    env.DB.prepare('SELECT id FROM teams').all<{ id: string }>(),
    env.DB.prepare('SELECT code FROM employees').all<{ code: string }>(),
  ]);
  const teamIds = new Set(teams.map((t) => t.id));
  const existingCodes = new Set(existing.map((e) => e.code));

  for (const [i, row] of parseRows(text, ['code', 'کد']).entries()) {
    // Two layouts: code,name,unit,PIN,department,manager — or, without a PIN column,
    // code,name,unit,department,manager (fourth column is not a number).
    const fourth = normalizeDigits(row[3] ?? '');
    const withoutPin = fourth !== '' && !/^\d+$/.test(fourth);
    const [rawCode, rawName, teamId] = row;
    const [rawPin, rawDepartment, rawManager] = withoutPin ? ['', row[3], row[4]] : [row[3], row[4], row[5]];
    const code = normalizeDigits(rawCode ?? '');
    const name = (rawName ?? '').slice(0, 100);
    let pin = normalizeDigits(rawPin ?? '');
    let department = (rawDepartment ?? '').toLowerCase() || null;
    // Sixth column marks managers/supervisors; the old "management" department means the same.
    let isManager = ['1', 'yes', 'manager', 'مدیر', 'بله', 'سرپرست'].includes((rawManager ?? '').trim().toLowerCase()) ? 1 : 0;
    if (department === 'management') {
      department = null;
      isManager = 1;
    }
    if (!code || !name || !teamId) {
      errors.push(`ردیف ${i + 1}: کد، نام و واحد الزامی است`);
      continue;
    }
    if (!/^[0-9A-Za-z-]{1,20}$/.test(code)) {
      errors.push(`ردیف ${i + 1}: کد پرسنلی نامعتبر است`);
      continue;
    }
    if (!teamIds.has(teamId)) {
      errors.push(`ردیف ${i + 1}: واحد «${teamId}» تعریف نشده است`);
      continue;
    }
    if (department && !DEPARTMENTS.includes(department as Department)) {
      errors.push(`ردیف ${i + 1}: حوزه «${department}» نامعتبر است (${DEPARTMENTS.join('، ')})`);
      continue;
    }
    if (pin && !/^\d{6,8}$/.test(pin)) {
      errors.push(`ردیف ${i + 1}: رمز باید ۶ تا ۸ رقم باشد`);
      continue;
    }
    imported += 1;
    const isNew = !existingCodes.has(code);
    if (!pin && isNew) {
      // New person without a PIN: generate one and report it once.
      pin = generatePin();
      pins.push({ code, name, pin });
    }
    existingCodes.add(code);
    if (pin) {
      statements.push(
        env.DB.prepare(
          `INSERT INTO employees (code, name, team_id, department, is_manager, pin_hash) VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(code) DO UPDATE SET name = excluded.name, team_id = excluded.team_id,
             department = excluded.department, is_manager = excluded.is_manager, pin_hash = excluded.pin_hash,
             failed_logins = 0, locked_until = 0`,
        ).bind(code, name, teamId, department, isManager, await hashPin(env, code, pin)),
      );
      // A new PIN signs the person out everywhere.
      statements.push(env.DB.prepare('DELETE FROM sessions WHERE employee_code = ?').bind(code));
    } else {
      // Blank PIN: update an existing person, keep their PIN.
      statements.push(
        env.DB.prepare(
          'UPDATE employees SET name = ?, team_id = ?, department = ?, is_manager = ? WHERE code = ?',
        ).bind(name, teamId, department, isManager, code),
      );
    }
  }
  await runBatches(env, statements);
  return { ok: true, imported, errors, pins };
}

export async function importMissions(env: Env, text: string): Promise<ImportResult> {
  const errors: string[] = [];
  const statements: D1PreparedStatement[] = [];
  const [{ results: employees }, { results: teams }] = await Promise.all([
    env.DB.prepare('SELECT code FROM employees').all<{ code: string }>(),
    env.DB.prepare('SELECT id FROM teams').all<{ id: string }>(),
  ]);
  const codes = new Set(employees.map((e) => e.code));
  const teamIds = new Set(teams.map((t) => t.id));
  const now = Date.now();

  parseRows(text, ['target', 'code', 'کد', 'هدف']).forEach(([rawTarget, rawWeek, rawPoints, note], i) => {
    const target = normalizeDigits(rawTarget ?? '');
    const week = Number(normalizeDigits(rawWeek ?? ''));
    const points = Number(normalizeDigits(rawPoints ?? ''));
    if (
      !Number.isInteger(week) ||
      week < 1 ||
      week > CAMPAIGN_WEEKS ||
      !Number.isInteger(points) ||
      Math.abs(points) > 10000
    ) {
      errors.push(`ردیف ${i + 1}: هفته یا امتیاز نامعتبر است`);
      return;
    }
    const teamId = target.startsWith('team:') ? target.slice(5) : null;
    if (teamId !== null ? !teamIds.has(teamId) : !codes.has(target)) {
      errors.push(`ردیف ${i + 1}: «${target}» یافت نشد`);
      return;
    }
    statements.push(
      env.DB.prepare(
        'INSERT INTO mission_points (employee_code, team_id, week, points, note, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      ).bind(teamId === null ? target : null, teamId, week, points, (note ?? '').slice(0, 200), now),
    );
  });
  await runBatches(env, statements);
  return { ok: true, imported: statements.length, errors };
}

function validWeek(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= CAMPAIGN_WEEKS;
}

function validPoints(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0 && (value as number) <= 1000;
}

export async function addQuiz(env: Env, request: Request) {
  const body = await readJson<{ week?: unknown; title?: unknown; points?: unknown; questions?: unknown }>(request);
  const title = cleanText(body.title, 150);
  const points = body.points ?? 100;
  const questions = body.questions as QuizQuestion[];
  const valid =
    validWeek(body.week) &&
    validPoints(points) &&
    title &&
    Array.isArray(questions) &&
    questions.length > 0 &&
    questions.length <= 30 &&
    questions.every(
      (q) =>
        typeof q?.q === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        q.options.length <= 6 &&
        q.options.every((option) => typeof option === 'string') &&
        Number.isInteger(q.answer) &&
        q.answer >= 0 &&
        q.answer < q.options.length,
    );
  if (!valid) throw new HttpError(400, 'اطلاعات کوییز کامل یا معتبر نیست');

  // Store only the expected fields.
  const clean = questions.map(({ q, options, answer }) => ({ q, options, answer }));
  const result = await env.DB.prepare('INSERT INTO quizzes (week, title, points, questions) VALUES (?, ?, ?, ?)')
    .bind(body.week, title, points, JSON.stringify(clean))
    .run();
  return { ok: true, id: result.meta.last_row_id };
}

export async function deleteQuiz(env: Env, id: number) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM quiz_attempts WHERE quiz_id = ?').bind(id),
    env.DB.prepare('DELETE FROM quizzes WHERE id = ?').bind(id),
  ]);
  return { ok: true };
}

export async function addActivity(env: Env, request: Request) {
  const body = await readJson<{
    week?: unknown;
    kind?: unknown;
    title?: unknown;
    description?: unknown;
    link?: unknown;
    points?: unknown;
  }>(request);
  const title = cleanText(body.title, 150);
  const link = cleanText(body.link, 500);
  const valid =
    validWeek(body.week) &&
    validPoints(body.points) &&
    ACTIVITY_KINDS.includes(body.kind as ActivityKind) &&
    title &&
    (!link || /^https?:\/\/[^\s]+$/i.test(link));
  if (!valid) throw new HttpError(400, 'اطلاعات دوره کامل یا معتبر نیست');

  const result = await env.DB.prepare(
    'INSERT INTO activities (week, kind, title, description, link, points) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(body.week, body.kind, title, cleanText(body.description, 1000), link, body.points)
    .run();
  return { ok: true, id: result.meta.last_row_id };
}

export async function deleteActivity(env: Env, id: number) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM activity_claims WHERE activity_id = ?').bind(id),
    env.DB.prepare('DELETE FROM activities WHERE id = ?').bind(id),
  ]);
  return { ok: true };
}

export async function reviewClaim(env: Env, request: Request, reviewer: Reviewer) {
  const body = await readJson<{ employeeCode?: unknown; activityId?: unknown; approve?: unknown }>(request);
  if (typeof body.employeeCode !== 'string' || !Number.isInteger(body.activityId) || typeof body.approve !== 'boolean') {
    throw new HttpError(400, ERRORS.badRequest);
  }
  const scope = reviewerScope(reviewer);
  const result = await env.DB.prepare(
    `UPDATE activity_claims SET status = ?, reviewed_at = ?
     WHERE employee_code = ? AND activity_id = ? AND status = 'pending'
       AND employee_code IN (SELECT e.code FROM employees e WHERE ${scope.sql})`,
  )
    .bind(body.approve ? 'approved' : 'rejected', Date.now(), body.employeeCode, body.activityId, ...scope.binds)
    .run();
  if (!result.meta.changes) throw new HttpError(404, 'این درخواست قبلاً بررسی شده است');
  return { ok: true };
}

export async function overview(env: Env) {
  const admin: Reviewer = { kind: 'admin' };
  const [counts, active, quizzes, teams, units, activities, claims, capstones, tracks, improvements, top, store] =
    await Promise.all([
    env.DB.prepare(
      `SELECT (SELECT COUNT(*) FROM employees) AS employees,
              (SELECT COUNT(*) FROM employees WHERE department IS NULL) AS noDepartment,
              (SELECT COUNT(*) FROM employees WHERE is_manager = 1) AS managers,
              (SELECT COUNT(*) FROM employees WHERE job_title != '' AND mobile != '') AS profiles,
              (SELECT COUNT(*) FROM quiz_attempts) + (SELECT COUNT(*) FROM module_results) AS attempts`,
    ).first<{ employees: number; noDepartment: number; managers: number; profiles: number; attempts: number }>(),
    activeCount(env),
    env.DB.prepare(
      `SELECT q.id, q.week, q.title, q.points, json_array_length(q.questions) AS questionCount,
         (SELECT COUNT(*) FROM quiz_attempts a WHERE a.quiz_id = q.id) AS attempts
       FROM quizzes q ORDER BY q.week, q.id`,
    ).all(),
    leaderboard(env),
    env.DB.prepare(
      'SELECT t.id, t.name, (SELECT COUNT(*) FROM employees e WHERE e.team_id = t.id) AS members FROM teams t ORDER BY t.name',
    ).all(),
    env.DB.prepare(
      `SELECT a.id, a.week, a.kind, a.title, a.points,
         (SELECT COUNT(*) FROM activity_claims c WHERE c.activity_id = a.id AND c.status = 'approved') AS approved
       FROM activities a ORDER BY a.week, a.id`,
    ).all(),
    env.DB.prepare(
      `SELECT c.employee_code AS employeeCode, e.name AS employeeName, t.name AS teamName,
         c.activity_id AS activityId, a.title AS activityTitle, a.kind, a.points, c.note, c.created_at AS createdAt
       FROM activity_claims c
       JOIN employees e ON e.code = c.employee_code
       JOIN teams t ON t.id = e.team_id
       JOIN activities a ON a.id = c.activity_id
       WHERE c.status = 'pending'
       ORDER BY c.created_at`,
    ).all(),
    pendingCapstones(env, admin),
    trackStats(env),
    pendingImprovements(env, admin),
    topImprovements(env),
    storeAdmin(env),
  ]);
  return {
    ok: true,
    counts: { ...counts, active },
    quizzes: quizzes.results,
    activities: activities.results,
    pendingClaims: claims.results,
    pendingCapstones: capstones,
    pendingImprovements: improvements,
    topImprovements: top,
    ...store,
    tracks,
    teams,
    units: units.results,
    campaign: campaignStatus(env),
  };
}
