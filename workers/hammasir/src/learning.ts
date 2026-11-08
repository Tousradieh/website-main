import type { Employee } from './auth';
import {
  canAccess,
  findModule,
  findTrack,
  MODULE_POINTS,
  PASS_RATIO,
  TRACKS,
  type Module,
  type Track,
} from './curriculum';
import { campaignStatus, cleanText, ERRORS, HttpError, readJson, type Env } from './http';

const CAPSTONE_MIN_LENGTH = 80;
const CAPSTONE_MAX_LENGTH = 4000;

type ReviewStatus = 'pending' | 'approved' | 'rejected';

interface ModuleResultRow {
  module_id: string;
  first_points: number;
  best_correct: number;
  total: number;
  passed: number;
  attempts: number;
}

interface CapstoneRow {
  track_id: string;
  text: string;
  status: ReviewStatus;
  points: number;
  feedback: string;
}

async function moduleResults(env: Env, employeeCode: string) {
  const { results } = await env.DB.prepare(
    'SELECT module_id, first_points, best_correct, total, passed, attempts FROM module_results WHERE employee_code = ?',
  )
    .bind(employeeCode)
    .all<ModuleResultRow>();
  return new Map(results.map((row) => [row.module_id, row]));
}

async function capstoneFor(env: Env, employeeCode: string, trackId: string) {
  return env.DB.prepare(
    'SELECT track_id, text, status, points, feedback FROM capstones WHERE employee_code = ? AND track_id = ?',
  )
    .bind(employeeCode, trackId)
    .first<CapstoneRow>();
}

function accessibleTrack(employee: Employee, trackId: string): Track {
  const track = findTrack(trackId);
  if (!track || !canAccess(track, employee.department)) throw new HttpError(404, ERRORS.notFound);
  return track;
}

function openModule(env: Env, employee: Employee, trackId: string, moduleId: string) {
  const track = accessibleTrack(employee, trackId);
  const module = findModule(track, moduleId);
  if (!module) throw new HttpError(404, ERRORS.notFound);
  if (module.week > campaignStatus(env).week) throw new HttpError(403, 'این درس هنوز باز نشده است');
  return { track, module };
}

function resultSummary(row: ModuleResultRow | undefined) {
  return row
    ? {
        passed: row.passed === 1,
        firstPoints: row.first_points,
        bestCorrect: row.best_correct,
        total: row.total,
        attempts: row.attempts,
      }
    : null;
}

function trackSummary(track: Track) {
  return {
    id: track.id,
    title: track.title,
    audience: track.audience,
    icon: track.icon,
    description: track.description,
    moduleCount: track.modules.length,
    maxPoints: track.modules.length * MODULE_POINTS + track.capstone.points,
  };
}

export async function listTracks(env: Env, employee: Employee) {
  const [results, capstones] = await Promise.all([
    moduleResults(env, employee.code),
    env.DB.prepare('SELECT track_id, status FROM capstones WHERE employee_code = ?')
      .bind(employee.code)
      .all<{ track_id: string; status: ReviewStatus }>(),
  ]);
  const capstoneStatus = new Map(capstones.results.map((row) => [row.track_id, row.status]));

  return {
    ok: true,
    department: employee.department,
    tracks: TRACKS.filter((track) => canAccess(track, employee.department)).map((track) => ({
      ...trackSummary(track),
      passedModules: track.modules.filter((module) => results.get(module.id)?.passed === 1).length,
      capstoneStatus: capstoneStatus.get(track.id) ?? null,
    })),
  };
}

export async function getTrack(env: Env, employee: Employee, trackId: string) {
  const track = accessibleTrack(employee, trackId);
  const [results, capstone] = await Promise.all([
    moduleResults(env, employee.code),
    capstoneFor(env, employee.code, track.id),
  ]);
  const { week } = campaignStatus(env);
  const allPassed = track.modules.every((module) => results.get(module.id)?.passed === 1);

  return {
    ok: true,
    track: {
      ...trackSummary(track),
      outcomes: track.outcomes,
      sources: track.sources,
      modules: track.modules.map((module) => ({
        id: module.id,
        title: module.title,
        week: module.week,
        minutes: module.minutes,
        summary: module.summary,
        open: module.week <= week,
        result: resultSummary(results.get(module.id)),
      })),
      capstone: {
        ...track.capstone,
        available: allPassed,
        submission: capstone
          ? { status: capstone.status, text: capstone.text, feedback: capstone.feedback, points: capstone.points }
          : null,
      },
    },
  };
}

/** Lesson content and quiz questions, never the answers. */
function publicModule(module: Module) {
  const { quiz, ...lesson } = module;
  return { ...lesson, quiz: quiz.map(({ q, options }) => ({ q, options })) };
}

export async function getModule(env: Env, employee: Employee, trackId: string, moduleId: string) {
  const { track, module } = openModule(env, employee, trackId, moduleId);
  const results = await moduleResults(env, employee.code);
  return {
    ok: true,
    trackTitle: track.title,
    module: publicModule(module),
    result: resultSummary(results.get(module.id)),
  };
}

export async function submitModule(env: Env, employee: Employee, request: Request, trackId: string, moduleId: string) {
  const { module } = openModule(env, employee, trackId, moduleId);
  const body = await readJson<{ answers?: unknown }>(request);
  if (!Array.isArray(body.answers) || body.answers.length !== module.quiz.length) {
    throw new HttpError(400, 'به همه سؤال‌ها پاسخ دهید');
  }
  const answers = body.answers;

  const total = module.quiz.length;
  const correct = module.quiz.filter((question, i) => answers[i] === question.answer).length;
  const passed = correct / total >= PASS_RATIO;
  const points = Math.round((correct / total) * MODULE_POINTS);

  // First attempt fixes the points; later attempts only improve best score / passed.
  const row = await env.DB.prepare(
    `INSERT INTO module_results (employee_code, module_id, first_points, best_correct, total, passed, attempts, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1, ?7)
     ON CONFLICT(employee_code, module_id) DO UPDATE SET
       best_correct = MAX(best_correct, excluded.best_correct),
       passed = MAX(passed, excluded.passed),
       attempts = attempts + 1,
       updated_at = excluded.updated_at
     RETURNING attempts`,
  )
    .bind(employee.code, module.id, points, correct, total, passed ? 1 : 0, Date.now())
    .first<{ attempts: number }>();
  const firstAttempt = row?.attempts === 1;

  return {
    ok: true,
    result: { correct, total, passed, earned: firstAttempt ? points : 0, firstAttempt },
    answers: module.quiz.map((question) => question.answer),
    explanations: module.quiz.map((question) => question.explain),
  };
}

export async function submitCapstone(env: Env, employee: Employee, request: Request, trackId: string) {
  const track = accessibleTrack(employee, trackId);
  const results = await moduleResults(env, employee.code);
  if (!track.modules.every((module) => results.get(module.id)?.passed === 1)) {
    throw new HttpError(403, 'ابتدا همه درس‌های این مسیر را با موفقیت بگذرانید');
  }
  const body = await readJson<{ text?: unknown }>(request);
  const text = cleanText(body.text, CAPSTONE_MAX_LENGTH);
  if (text.length < CAPSTONE_MIN_LENGTH) {
    throw new HttpError(400, 'گزارش پروژه پایانی خیلی کوتاه است؛ همه بندهای خواسته‌شده را بنویسید');
  }

  // A rejected submission may be revised and sent again; pending or approved ones may not.
  const result = await env.DB.prepare(
    `INSERT INTO capstones (employee_code, track_id, text, status, points, created_at)
     VALUES (?, ?, ?, 'pending', ?, ?)
     ON CONFLICT(employee_code, track_id) DO UPDATE SET
       text = excluded.text, status = 'pending', points = excluded.points, feedback = '',
       created_at = excluded.created_at, reviewed_at = NULL
     WHERE capstones.status = 'rejected'`,
  )
    .bind(employee.code, track.id, text, track.capstone.points, Date.now())
    .run();
  if (!result.meta.changes) throw new HttpError(409, 'پروژه پایانی این مسیر قبلاً ارسال شده است');
  return { ok: true };
}

/** Admin: people who started / finished each track. Module ids are `${trackId}-${n}`. */
export async function trackStats(env: Env) {
  const [started, completed] = await Promise.all([
    env.DB.prepare(
      `SELECT substr(module_id, 1, instr(module_id, '-') - 1) AS track_id, COUNT(DISTINCT employee_code) AS count
       FROM module_results GROUP BY track_id`,
    ).all<{ track_id: string; count: number }>(),
    env.DB.prepare(
      "SELECT track_id, COUNT(*) AS count FROM capstones WHERE status = 'approved' GROUP BY track_id",
    ).all<{ track_id: string; count: number }>(),
  ]);
  const startedBy = new Map(started.results.map((row) => [row.track_id, row.count]));
  const completedBy = new Map(completed.results.map((row) => [row.track_id, row.count]));
  return TRACKS.map((track) => ({
    id: track.id,
    title: track.title,
    audience: track.audience,
    started: startedBy.get(track.id) ?? 0,
    completed: completedBy.get(track.id) ?? 0,
  }));
}

export async function pendingCapstones(env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT c.employee_code AS employeeCode, e.name AS employeeName, t.name AS teamName,
       c.track_id AS trackId, c.text, c.points, c.created_at AS createdAt
     FROM capstones c
     JOIN employees e ON e.code = c.employee_code
     JOIN teams t ON t.id = e.team_id
     WHERE c.status = 'pending'
     ORDER BY c.created_at`,
  ).all<{ employeeCode: string; trackId: string }>();
  return results.map((row) => {
    const track = findTrack(row.trackId);
    return { ...row, trackTitle: track?.title ?? row.trackId, capstoneTitle: track?.capstone.title ?? '' };
  });
}

export async function reviewCapstone(env: Env, request: Request) {
  const body = await readJson<{ employeeCode?: unknown; trackId?: unknown; approve?: unknown; feedback?: unknown }>(
    request,
  );
  if (typeof body.employeeCode !== 'string' || typeof body.trackId !== 'string' || typeof body.approve !== 'boolean') {
    throw new HttpError(400, ERRORS.badRequest);
  }
  const result = await env.DB.prepare(
    `UPDATE capstones SET status = ?, feedback = ?, reviewed_at = ?
     WHERE employee_code = ? AND track_id = ? AND status = 'pending'`,
  )
    .bind(
      body.approve ? 'approved' : 'rejected',
      cleanText(body.feedback, 1000),
      Date.now(),
      body.employeeCode,
      body.trackId,
    )
    .run();
  if (!result.meta.changes) throw new HttpError(404, 'این پروژه قبلاً بررسی شده است');
  return { ok: true };
}
