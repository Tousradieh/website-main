import type { Employee } from './auth';
import { campaignStatus, cleanText, ERRORS, HttpError, readJson, type Env } from './http';
import { leaderboard, wallet } from './points';

export interface QuizQuestion {
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

export const ACTIVITY_KINDS = ['course', 'class'] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export async function me(env: Env, employee: Employee) {
  const [points, history, teams, pending] = await Promise.all([
    wallet(env, employee.code, employee.team_id),
    env.DB.prepare(
      `SELECT week, points, note, CASE WHEN team_id IS NULL THEN 'personal' ELSE 'team' END AS kind
       FROM mission_points WHERE employee_code = ? OR team_id = ?
       ORDER BY week DESC, id DESC LIMIT 30`,
    )
      .bind(employee.code, employee.team_id)
      .all<{ week: number; points: number; note: string; kind: 'personal' | 'team' }>(),
    leaderboard(env),
    env.DB.prepare(
      `SELECT (SELECT COUNT(*) FROM activity_claims WHERE employee_code = ?1 AND status = 'pending')
            + (SELECT COUNT(*) FROM capstones WHERE employee_code = ?1 AND status = 'pending') AS count`,
    )
      .bind(employee.code)
      .first<{ count: number }>(),
  ]);

  return {
    ok: true,
    employee: {
      code: employee.code,
      name: employee.name,
      teamId: employee.team_id,
      teamName: employee.team_name,
      department: employee.department,
    },
    wallet: points,
    missions: history.results,
    pendingClaims: pending?.count ?? 0,
    team: teams.find((t) => t.id === employee.team_id) ?? null,
    teamCount: teams.length,
    campaign: campaignStatus(env),
  };
}

// ---------- weekly quizzes ----------

export async function listQuizzes(env: Env, employee: Employee) {
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
  if (quiz.week > campaignStatus(env).week) throw new HttpError(403, 'این کوییز هنوز باز نشده است');
  return { ...quiz, questions: JSON.parse(quiz.questions) as QuizQuestion[] };
}

export async function getQuiz(env: Env, id: number) {
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

export async function submitQuiz(env: Env, employee: Employee, request: Request, id: number) {
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
  if (!insert.meta.changes) throw new HttpError(409, 'شما قبلاً در این کوییز شرکت کرده‌اید');

  return {
    ok: true,
    result: { correct, total, earned },
    answers: quiz.questions.map((question) => question.answer),
  };
}

// ---------- courses & classes (manager-approved) ----------

export async function listActivities(env: Env, employee: Employee) {
  const { week } = campaignStatus(env);
  const { results } = await env.DB.prepare(
    `SELECT a.id, a.week, a.kind, a.title, a.description, a.link, a.points, c.status, c.note
     FROM activities a
     LEFT JOIN activity_claims c ON c.activity_id = a.id AND c.employee_code = ?
     ORDER BY a.week, a.id`,
  )
    .bind(employee.code)
    .all<{
      id: number;
      week: number;
      kind: ActivityKind;
      title: string;
      description: string;
      link: string;
      points: number;
      status: 'pending' | 'approved' | 'rejected' | null;
      note: string | null;
    }>();

  return {
    ok: true,
    activities: results.map(({ status, note, ...activity }) => ({
      ...activity,
      open: activity.week <= week,
      claim: status ? { status, note: note ?? '' } : null,
    })),
  };
}

/** Personnel report that they finished a course or attended a class; it waits for approval. */
export async function claimActivity(env: Env, employee: Employee, request: Request, id: number) {
  const activity = await env.DB.prepare('SELECT week FROM activities WHERE id = ?').bind(id).first<{ week: number }>();
  if (!activity) throw new HttpError(404, ERRORS.notFound);
  if (activity.week > campaignStatus(env).week) throw new HttpError(403, 'این دوره هنوز باز نشده است');
  const { note } = await readJson<{ note?: unknown }>(request);

  // A rejected claim may be sent again; pending or approved ones may not.
  const result = await env.DB.prepare(
    `INSERT INTO activity_claims (employee_code, activity_id, note, status, created_at)
     VALUES (?, ?, ?, 'pending', ?)
     ON CONFLICT(employee_code, activity_id) DO UPDATE SET
       note = excluded.note, status = 'pending', created_at = excluded.created_at, reviewed_at = NULL
     WHERE activity_claims.status = 'rejected'`,
  )
    .bind(employee.code, id, cleanText(note, 500), Date.now())
    .run();
  if (!result.meta.changes) throw new HttpError(409, 'این مورد قبلاً اعلام شده است');
  return { ok: true };
}
