interface Env {
  DB: D1Database;
  ADMIN_TOKEN: string;
  PIN_PEPPER?: string;
  CAMPAIGN_START: string;
  ALLOWED_ORIGIN?: string;
}

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

interface QuizRow {
  id: number;
  week: number;
  title: string;
  points: number;
  questions: string;
}

/** Keep in sync with website-main/lib/hammasir.ts CAMPAIGN_WEEKS */
const CAMPAIGN_WEEKS = 13;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const ERRORS = {
  badRequest: 'درخواست نامعتبر است',
  unauthorized: 'لطفاً دوباره وارد شوید',
  badLogin: 'کد پرسنلی یا رمز اشتباه است',
  locked: 'به دلیل تلاش‌های ناموفق، ورود تا ۱۵ دقیقه دیگر ممکن نیست',
  notFound: 'یافت نشد',
  quizLocked: 'این کوییز هنوز باز نشده است',
  quizDone: 'شما قبلاً در این کوییز شرکت کرده‌اید',
  server: 'خطای سرور. لطفاً دوباره تلاش کنید.',
} as const;

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function corsHeaders(env: Env, request: Request): HeadersInit {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = env.ALLOWED_ORIGIN?.trim();
  const allowOrigin =
    allowed && allowed !== '*' ? (origin === allowed ? allowed : 'null') : '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(env: Env, request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(env, request),
    },
  });
}

/** Persian/Arabic digits → ASCII, so codes typed on a Persian keyboard still match. */
function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .trim();
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hashPin(env: Env, code: string, pin: string): Promise<string> {
  return sha256Hex(`${code}:${pin}:${env.PIN_PEPPER ?? ''}`);
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function bearer(request: Request): string {
  const header = request.headers.get('Authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, ERRORS.badRequest);
  }
}

/** Current campaign week (0 = not started yet, capped at CAMPAIGN_WEEKS) and month phase (1–3). */
function campaignStatus(env: Env) {
  const start = Date.parse(`${env.CAMPAIGN_START}T00:00:00+03:30`);
  const elapsedDays = Math.floor((Date.now() - start) / DAY_MS);
  const week = elapsedDays < 0 ? 0 : Math.min(CAMPAIGN_WEEKS, Math.floor(elapsedDays / 7) + 1);
  const phase = week <= 4 ? 1 : week <= 8 ? 2 : 3;
  return {
    start: env.CAMPAIGN_START,
    week,
    totalWeeks: CAMPAIGN_WEEKS,
    phase,
    ended: elapsedDays >= CAMPAIGN_WEEKS * 7,
  };
}

// ---------- personnel ----------

async function login(env: Env, request: Request) {
  const body = await readJson<{ code?: string; pin?: string }>(request);
  const code = normalizeDigits(body.code ?? '');
  const pin = normalizeDigits(body.pin ?? '');
  if (!code || !pin) throw new HttpError(400, ERRORS.badLogin);

  const employee = await env.DB.prepare(
    'SELECT code, pin_hash, failed_logins, locked_until FROM employees WHERE code = ?',
  )
    .bind(code)
    .first<{ code: string; pin_hash: string; failed_logins: number; locked_until: number }>();
  if (!employee) throw new HttpError(401, ERRORS.badLogin);

  const now = Date.now();
  if (employee.locked_until > now) throw new HttpError(429, ERRORS.locked);

  if ((await hashPin(env, code, pin)) !== employee.pin_hash) {
    const failed = employee.failed_logins + 1;
    const lock = failed >= MAX_FAILED_LOGINS;
    await env.DB.prepare('UPDATE employees SET failed_logins = ?, locked_until = ? WHERE code = ?')
      .bind(lock ? 0 : failed, lock ? now + LOCKOUT_MS : 0, code)
      .run();
    throw new HttpError(lock ? 429 : 401, lock ? ERRORS.locked : ERRORS.badLogin);
  }

  const token = randomToken();
  await env.DB.batch([
    env.DB.prepare('UPDATE employees SET failed_logins = 0, locked_until = 0 WHERE code = ?').bind(code),
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
    env.DB.prepare('INSERT INTO sessions (token, employee_code, expires_at) VALUES (?, ?, ?)').bind(
      token,
      code,
      now + SESSION_TTL_MS,
    ),
  ]);
  return { ok: true, token };
}

async function requireEmployee(env: Env, request: Request) {
  const token = bearer(request);
  if (!token) throw new HttpError(401, ERRORS.unauthorized);
  const row = await env.DB.prepare(
    `SELECT e.code, e.name, e.team_id, t.name AS team_name
     FROM sessions s
     JOIN employees e ON e.code = s.employee_code
     JOIN teams t ON t.id = e.team_id
     WHERE s.token = ? AND s.expires_at > ?`,
  )
    .bind(token, Date.now())
    .first<{ code: string; name: string; team_id: string; team_name: string }>();
  if (!row) throw new HttpError(401, ERRORS.unauthorized);
  return row;
}

async function logout(env: Env, request: Request) {
  const token = bearer(request);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  return { ok: true };
}

/**
 * Team ranking. An employee's total = quiz points + own mission points + their team's mission
 * points; the team score is the average total per member so small and large sites compete fairly.
 * "Active" means the person took at least one quiz.
 */
async function leaderboard(env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT t.id, t.name,
       COUNT(e.code) AS members,
       COALESCE(SUM(CASE WHEN q.points IS NOT NULL THEN 1 ELSE 0 END), 0) AS active,
       COALESCE(SUM(COALESCE(q.points, 0) + COALESCE(m.points, 0)), 0) AS personal_points,
       COALESCE((SELECT SUM(points) FROM mission_points WHERE team_id = t.id), 0) AS team_points
     FROM teams t
     LEFT JOIN employees e ON e.team_id = t.id
     LEFT JOIN (SELECT employee_code, SUM(points) AS points FROM quiz_attempts GROUP BY employee_code) q
       ON q.employee_code = e.code
     LEFT JOIN (SELECT employee_code, SUM(points) AS points FROM mission_points
                WHERE employee_code IS NOT NULL GROUP BY employee_code) m
       ON m.employee_code = e.code
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
    .filter((t) => t.members > 0)
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

async function me(env: Env, request: Request) {
  const employee = await requireEmployee(env, request);
  const [knowledge, missions, history, teams] = await Promise.all([
    env.DB.prepare('SELECT COALESCE(SUM(points), 0) AS total FROM quiz_attempts WHERE employee_code = ?')
      .bind(employee.code)
      .first<{ total: number }>(),
    env.DB.prepare(
      'SELECT COALESCE(SUM(points), 0) AS total FROM mission_points WHERE employee_code = ? OR team_id = ?',
    )
      .bind(employee.code, employee.team_id)
      .first<{ total: number }>(),
    env.DB.prepare(
      `SELECT week, points, note, CASE WHEN team_id IS NULL THEN 'personal' ELSE 'team' END AS kind
       FROM mission_points WHERE employee_code = ? OR team_id = ?
       ORDER BY week DESC, id DESC LIMIT 30`,
    )
      .bind(employee.code, employee.team_id)
      .all<{ week: number; points: number; note: string; kind: 'personal' | 'team' }>(),
    leaderboard(env),
  ]);

  const knowledgePoints = knowledge?.total ?? 0;
  const missionPoints = missions?.total ?? 0;
  return {
    ok: true,
    employee: { code: employee.code, name: employee.name, teamId: employee.team_id, teamName: employee.team_name },
    wallet: { knowledge: knowledgePoints, missions: missionPoints, total: knowledgePoints + missionPoints },
    missions: history.results,
    team: teams.find((t) => t.id === employee.team_id) ?? null,
    teamCount: teams.length,
    campaign: campaignStatus(env),
  };
}

async function listQuizzes(env: Env, request: Request) {
  const employee = await requireEmployee(env, request);
  const { week } = campaignStatus(env);
  const { results } = await env.DB.prepare(
    `SELECT q.id, q.week, q.title, q.points, json_array_length(q.questions) AS questionCount,
       a.correct, a.total, a.points AS earned
     FROM quizzes q
     LEFT JOIN quiz_attempts a ON a.quiz_id = q.id AND a.employee_code = ?
     ORDER BY q.week, q.id`,
  )
    .bind(employee.code)
    .all<{
      id: number;
      week: number;
      title: string;
      points: number;
      questionCount: number;
      correct: number | null;
      total: number | null;
      earned: number | null;
    }>();

  return {
    ok: true,
    quizzes: results.map((q) => ({
      id: q.id,
      week: q.week,
      title: q.title,
      points: q.points,
      questionCount: q.questionCount,
      open: q.week <= week,
      result: q.earned === null ? null : { correct: q.correct, total: q.total, earned: q.earned },
    })),
  };
}

async function openQuiz(env: Env, id: number) {
  const quiz = await env.DB.prepare('SELECT * FROM quizzes WHERE id = ?').bind(id).first<QuizRow>();
  if (!quiz) throw new HttpError(404, ERRORS.notFound);
  if (quiz.week > campaignStatus(env).week) throw new HttpError(403, ERRORS.quizLocked);
  return { ...quiz, questions: JSON.parse(quiz.questions) as QuizQuestion[] };
}

async function getQuiz(env: Env, request: Request, id: number) {
  await requireEmployee(env, request);
  const quiz = await openQuiz(env, id);
  return {
    ok: true,
    quiz: {
      id: quiz.id,
      week: quiz.week,
      title: quiz.title,
      points: quiz.points,
      // Never send the answers to the browser.
      questions: quiz.questions.map(({ q, options }) => ({ q, options })),
    },
  };
}

async function submitQuiz(env: Env, request: Request, id: number) {
  const employee = await requireEmployee(env, request);
  const quiz = await openQuiz(env, id);
  const body = await readJson<{ answers?: unknown }>(request);
  if (!Array.isArray(body.answers)) throw new HttpError(400, ERRORS.badRequest);
  const answers = body.answers;

  const correct = quiz.questions.filter((question, i) => answers[i] === question.answer).length;
  const total = quiz.questions.length;
  const earned = total ? Math.round((correct / total) * quiz.points) : 0;

  const insert = await env.DB.prepare(
    `INSERT OR IGNORE INTO quiz_attempts (employee_code, quiz_id, correct, total, points, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(employee.code, quiz.id, correct, total, earned, Date.now())
    .run();
  if (!insert.meta.changes) throw new HttpError(409, ERRORS.quizDone);

  return {
    ok: true,
    result: { correct, total, earned },
    answers: quiz.questions.map((question) => question.answer),
  };
}

// ---------- admin ----------

function requireAdmin(env: Env, request: Request) {
  const token = bearer(request);
  if (!env.ADMIN_TOKEN || !token || token !== env.ADMIN_TOKEN) {
    throw new HttpError(401, 'رمز مدیریت نادرست است');
  }
}

/** Parses CSV or tab-separated text pasted from Excel. Skips blank lines and a header row. */
function parseRows(text: string, headerHints: string[]): string[][] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((line) => line.trim());
  const rows = lines.map((line) => line.split(line.includes('\t') ? '\t' : ',').map((c) => c.trim()));
  const first = rows[0]?.[0]?.toLowerCase() ?? '';
  if (headerHints.some((hint) => first.includes(hint))) rows.shift();
  return rows;
}

interface ImportResult {
  ok: true;
  imported: number;
  errors: string[];
}

async function importTeams(env: Env, text: string): Promise<ImportResult> {
  const errors: string[] = [];
  const statements: D1PreparedStatement[] = [];
  parseRows(text, ['id', 'شناسه']).forEach(([id, name], i) => {
    if (!id || !name) {
      errors.push(`ردیف ${i + 1}: شناسه و نام الزامی است`);
      return;
    }
    statements.push(
      env.DB.prepare('INSERT INTO teams (id, name) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name').bind(
        id,
        name,
      ),
    );
  });
  if (statements.length) await env.DB.batch(statements);
  return { ok: true, imported: statements.length, errors };
}

async function importEmployees(env: Env, text: string): Promise<ImportResult> {
  const errors: string[] = [];
  const statements: D1PreparedStatement[] = [];
  const { results: teams } = await env.DB.prepare('SELECT id FROM teams').all<{ id: string }>();
  const teamIds = new Set(teams.map((t) => t.id));

  for (const [i, row] of parseRows(text, ['code', 'کد']).entries()) {
    const [rawCode, name, teamId, rawPin] = row;
    const code = normalizeDigits(rawCode ?? '');
    const pin = normalizeDigits(rawPin ?? '');
    if (!code || !name || !teamId) {
      errors.push(`ردیف ${i + 1}: کد، نام و واحد الزامی است`);
      continue;
    }
    if (!teamIds.has(teamId)) {
      errors.push(`ردیف ${i + 1}: واحد «${teamId}» تعریف نشده است`);
      continue;
    }
    if (pin) {
      if (!/^\d{4,8}$/.test(pin)) {
        errors.push(`ردیف ${i + 1}: رمز باید ۴ تا ۸ رقم باشد`);
        continue;
      }
      const pinHash = await hashPin(env, code, pin);
      statements.push(
        env.DB.prepare(
          `INSERT INTO employees (code, name, team_id, pin_hash) VALUES (?, ?, ?, ?)
           ON CONFLICT(code) DO UPDATE SET name = excluded.name, team_id = excluded.team_id,
             pin_hash = excluded.pin_hash, failed_logins = 0, locked_until = 0`,
        ).bind(code, name, teamId, pinHash),
      );
    } else {
      // Blank PIN: update name/team of an existing person, keep their PIN.
      statements.push(
        env.DB.prepare('UPDATE employees SET name = ?, team_id = ? WHERE code = ?').bind(name, teamId, code),
      );
    }
  }
  if (statements.length) await env.DB.batch(statements);
  return { ok: true, imported: statements.length, errors };
}

async function importMissions(env: Env, text: string): Promise<ImportResult> {
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
    if (!Number.isInteger(week) || week < 1 || week > CAMPAIGN_WEEKS || !Number.isInteger(points)) {
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
      ).bind(teamId === null ? target : null, teamId, week, points, note ?? '', now),
    );
  });
  if (statements.length) await env.DB.batch(statements);
  return { ok: true, imported: statements.length, errors };
}

async function addQuiz(env: Env, request: Request) {
  const body = await readJson<{ week?: number; title?: string; points?: number; questions?: QuizQuestion[] }>(request);
  const week = Number(body.week);
  const points = Number(body.points ?? 100);
  const questions = body.questions;
  const valid =
    Number.isInteger(week) &&
    week >= 1 &&
    week <= CAMPAIGN_WEEKS &&
    Number.isInteger(points) &&
    points > 0 &&
    body.title?.trim() &&
    Array.isArray(questions) &&
    questions.length > 0 &&
    questions.every(
      (q) =>
        typeof q.q === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        Number.isInteger(q.answer) &&
        q.answer >= 0 &&
        q.answer < q.options.length,
    );
  if (!valid) throw new HttpError(400, 'اطلاعات کوییز کامل یا معتبر نیست');

  const result = await env.DB.prepare('INSERT INTO quizzes (week, title, points, questions) VALUES (?, ?, ?, ?)')
    .bind(week, body.title!.trim(), points, JSON.stringify(questions))
    .run();
  return { ok: true, id: result.meta.last_row_id };
}

async function deleteQuiz(env: Env, id: number) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM quiz_attempts WHERE quiz_id = ?').bind(id),
    env.DB.prepare('DELETE FROM quizzes WHERE id = ?').bind(id),
  ]);
  return { ok: true };
}

async function overview(env: Env) {
  const [counts, quizzes, teams, units] = await Promise.all([
    env.DB.prepare(
      `SELECT (SELECT COUNT(*) FROM employees) AS employees,
              (SELECT COUNT(DISTINCT employee_code) FROM quiz_attempts) AS active,
              (SELECT COUNT(*) FROM quiz_attempts) AS attempts`,
    ).first<{ employees: number; active: number; attempts: number }>(),
    env.DB.prepare(
      `SELECT q.id, q.week, q.title, q.points, json_array_length(q.questions) AS questionCount,
         (SELECT COUNT(*) FROM quiz_attempts a WHERE a.quiz_id = q.id) AS attempts
       FROM quizzes q ORDER BY q.week, q.id`,
    ).all(),
    leaderboard(env),
    env.DB.prepare(
      'SELECT t.id, t.name, (SELECT COUNT(*) FROM employees e WHERE e.team_id = t.id) AS members FROM teams t ORDER BY t.name',
    ).all(),
  ]);
  return {
    ok: true,
    counts,
    quizzes: quizzes.results,
    teams,
    units: units.results,
    campaign: campaignStatus(env),
  };
}

// ---------- router ----------

async function route(env: Env, request: Request): Promise<unknown> {
  const { pathname } = new URL(request.url);
  const method = request.method;
  const quizMatch = pathname.match(/^\/api\/quizzes\/(\d+)(\/submit)?$/);

  if (method === 'POST' && pathname === '/api/login') return login(env, request);
  if (method === 'POST' && pathname === '/api/logout') return logout(env, request);
  if (method === 'GET' && pathname === '/api/me') return me(env, request);
  if (method === 'GET' && pathname === '/api/leaderboard') {
    return { ok: true, teams: await leaderboard(env), campaign: campaignStatus(env) };
  }
  if (method === 'GET' && pathname === '/api/quizzes') return listQuizzes(env, request);
  if (quizMatch && method === 'GET' && !quizMatch[2]) return getQuiz(env, request, Number(quizMatch[1]));
  if (quizMatch && method === 'POST' && quizMatch[2]) return submitQuiz(env, request, Number(quizMatch[1]));

  if (pathname.startsWith('/api/admin/')) {
    requireAdmin(env, request);
    const adminQuiz = pathname.match(/^\/api\/admin\/quizzes\/(\d+)\/delete$/);
    if (method === 'GET' && pathname === '/api/admin/overview') return overview(env);
    if (method === 'POST' && pathname === '/api/admin/quizzes') return addQuiz(env, request);
    if (method === 'POST' && adminQuiz) return deleteQuiz(env, Number(adminQuiz[1]));
    if (method === 'POST') {
      const { text } = await readJson<{ text?: string }>(request);
      if (!text?.trim()) throw new HttpError(400, 'متنی برای ثبت وارد نشده است');
      if (pathname === '/api/admin/teams') return importTeams(env, text);
      if (pathname === '/api/admin/employees') return importEmployees(env, text);
      if (pathname === '/api/admin/missions') return importMissions(env, text);
    }
  }

  throw new HttpError(404, ERRORS.notFound);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    try {
      return json(env, request, await route(env, request));
    } catch (error) {
      if (error instanceof HttpError) {
        return json(env, request, { ok: false, error: error.message }, error.status);
      }
      console.error('Worker error', error);
      return json(env, request, { ok: false, error: ERRORS.server }, 500);
    }
  },
};
