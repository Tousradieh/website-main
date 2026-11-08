import type { Department } from './curriculum';
import {
  bearer,
  clientIp,
  ERRORS,
  HttpError,
  normalizeDigits,
  randomToken,
  readJson,
  safeEqual,
  sha256Hex,
  type Env,
} from './http';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MIN_SECRET_LENGTH = 16;

/** Failed attempts allowed per client IP per hour before that IP is blocked for an hour. */
const IP_LIMITS = { login: 30, admin: 10 } as const;

const MESSAGES = {
  badLogin: 'کد پرسنلی یا رمز اشتباه است',
  locked: 'به دلیل تلاش‌های ناموفق، ورود تا ۱۵ دقیقه دیگر ممکن نیست',
  ipBlocked: 'تلاش‌های ناموفق زیادی از این شبکه انجام شده است. یک ساعت دیگر دوباره تلاش کنید.',
  badAdmin: 'رمز مدیریت نادرست است',
} as const;

export interface Employee {
  code: string;
  name: string;
  team_id: string;
  team_name: string;
  department: Department | null;
}

export function hashPin(env: Env, code: string, pin: string): Promise<string> {
  if ((env.PIN_PEPPER ?? '').length < MIN_SECRET_LENGTH) throw new HttpError(503, ERRORS.config);
  return sha256Hex(`${code}:${pin}:${env.PIN_PEPPER}`);
}

/** Session tokens are stored hashed so a database leak doesn't hand out live sessions. */
function hashToken(token: string): Promise<string> {
  return sha256Hex(`session:${token}`);
}

// ---------- per-IP throttle ----------

async function assertNotThrottled(env: Env, key: string) {
  const row = await env.DB.prepare('SELECT locked_until FROM throttle WHERE key = ?')
    .bind(key)
    .first<{ locked_until: number }>();
  if (row && row.locked_until > Date.now()) throw new HttpError(429, MESSAGES.ipBlocked);
}

async function recordFailure(env: Env, key: string, limit: number) {
  const now = Date.now();
  // New window after an hour; lock once the window's failures reach the limit.
  await env.DB.prepare(
    `INSERT INTO throttle (key, failures, window_start, locked_until) VALUES (?1, 1, ?2, 0)
     ON CONFLICT(key) DO UPDATE SET
       failures = CASE WHEN window_start < ?2 - ?3 THEN 1 ELSE failures + 1 END,
       window_start = CASE WHEN window_start < ?2 - ?3 THEN ?2 ELSE window_start END,
       locked_until = CASE WHEN window_start >= ?2 - ?3 AND failures + 1 >= ?4 THEN ?2 + ?3 ELSE locked_until END`,
  )
    .bind(key, now, HOUR_MS, limit)
    .run();
}

// ---------- personnel ----------

export async function login(env: Env, request: Request) {
  const ipKey = `login:${clientIp(request)}`;
  await assertNotThrottled(env, ipKey);

  const body = await readJson<{ code?: unknown; pin?: unknown }>(request);
  const code = normalizeDigits(typeof body.code === 'string' ? body.code : '').slice(0, 20);
  const pin = normalizeDigits(typeof body.pin === 'string' ? body.pin : '').slice(0, 20);
  if (!code || !pin) throw new HttpError(400, MESSAGES.badLogin);

  const employee = await env.DB.prepare(
    'SELECT code, pin_hash, failed_logins, locked_until FROM employees WHERE code = ?',
  )
    .bind(code)
    .first<{ code: string; pin_hash: string; failed_logins: number; locked_until: number }>();

  const now = Date.now();
  if (employee && employee.locked_until > now) throw new HttpError(429, MESSAGES.locked);

  // Hash even for unknown codes so response time doesn't reveal which codes exist.
  const pinHash = await hashPin(env, code, pin);
  if (!employee || !(await safeEqual(pinHash, employee.pin_hash))) {
    await recordFailure(env, ipKey, IP_LIMITS.login);
    if (!employee) throw new HttpError(401, MESSAGES.badLogin);
    const failed = employee.failed_logins + 1;
    const lock = failed >= MAX_FAILED_LOGINS;
    await env.DB.prepare('UPDATE employees SET failed_logins = ?, locked_until = ? WHERE code = ?')
      .bind(lock ? 0 : failed, lock ? now + LOCKOUT_MS : 0, code)
      .run();
    throw new HttpError(lock ? 429 : 401, lock ? MESSAGES.locked : MESSAGES.badLogin);
  }

  const token = randomToken();
  await env.DB.batch([
    env.DB.prepare('UPDATE employees SET failed_logins = 0, locked_until = 0 WHERE code = ?').bind(code),
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
    env.DB.prepare('INSERT INTO sessions (token, employee_code, expires_at) VALUES (?, ?, ?)').bind(
      await hashToken(token),
      code,
      now + SESSION_TTL_MS,
    ),
  ]);
  return { ok: true, token };
}

export async function requireEmployee(env: Env, request: Request): Promise<Employee> {
  const token = bearer(request);
  if (!token) throw new HttpError(401, ERRORS.unauthorized);
  const row = await env.DB.prepare(
    `SELECT e.code, e.name, e.team_id, t.name AS team_name, e.department
     FROM sessions s
     JOIN employees e ON e.code = s.employee_code
     JOIN teams t ON t.id = e.team_id
     WHERE s.token = ? AND s.expires_at > ?`,
  )
    .bind(await hashToken(token), Date.now())
    .first<Employee>();
  if (!row) throw new HttpError(401, ERRORS.unauthorized);
  return row;
}

export async function logout(env: Env, request: Request) {
  const token = bearer(request);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(await hashToken(token)).run();
  return { ok: true };
}

// ---------- admin ----------

export async function requireAdmin(env: Env, request: Request) {
  if ((env.ADMIN_TOKEN ?? '').length < MIN_SECRET_LENGTH) throw new HttpError(503, ERRORS.config);
  const ipKey = `admin:${clientIp(request)}`;
  await assertNotThrottled(env, ipKey);
  const token = bearer(request);
  if (!token || !(await safeEqual(token, env.ADMIN_TOKEN))) {
    await recordFailure(env, ipKey, IP_LIMITS.admin);
    throw new HttpError(401, MESSAGES.badAdmin);
  }
}
