export interface Env {
  DB: D1Database;
  /** Password for /hammasir/admin; at least 16 characters. */
  ADMIN_TOKEN: string;
  /** Secret mixed into PIN hashes; at least 16 characters, never change after PINs are issued. */
  PIN_PEPPER: string;
  CAMPAIGN_START: string;
  /** Comma-separated site origins allowed to call the API, or "*". */
  ALLOWED_ORIGIN?: string;
}

/** Keep in sync with website-main/lib/hammasir.ts CAMPAIGN_WEEKS */
export const CAMPAIGN_WEEKS = 13;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_BODY_BYTES = 64 * 1024;
export const MAX_ADMIN_BODY_BYTES = 1024 * 1024;

export const ERRORS = {
  badRequest: 'درخواست نامعتبر است',
  unauthorized: 'لطفاً دوباره وارد شوید',
  notFound: 'یافت نشد',
  tooLarge: 'حجم اطلاعات ارسالی بیش از حد مجاز است',
  config: 'سرور کمپین کامل تنظیم نشده است. با مدیر سامانه تماس بگیرید.',
  server: 'خطای سرور. لطفاً دوباره تلاش کنید.',
} as const;

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function corsHeaders(env: Env, request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = (env.ALLOWED_ORIGIN ?? '*')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const allowOrigin = allowed.includes('*') ? '*' : allowed.includes(origin) ? origin : 'null';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function json(env: Env, request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...corsHeaders(env, request),
    },
  });
}

export async function readJson<T>(request: Request, maxBytes = MAX_BODY_BYTES): Promise<T> {
  if (Number(request.headers.get('Content-Length') ?? 0) > maxBytes) {
    throw new HttpError(413, ERRORS.tooLarge);
  }
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, ERRORS.tooLarge);
  try {
    const value = JSON.parse(text) as unknown;
    if (value === null || typeof value !== 'object') throw new Error('not an object');
    return value as T;
  } catch {
    throw new HttpError(400, ERRORS.badRequest);
  }
}

/** Persian/Arabic digits → ASCII, so codes typed on a Persian keyboard still match. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .trim();
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time comparison (both sides are hashed first so lengths always match). */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function bearer(request: Request): string {
  const header = request.headers.get('Authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}

/** Trimmed string capped at maxLength; anything else becomes ''. */
export function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

/** Current campaign week (0 = not started yet, capped at CAMPAIGN_WEEKS) and month phase (1–3). */
export function campaignStatus(env: Env) {
  const start = Date.parse(`${env.CAMPAIGN_START}T00:00:00+03:30`);
  if (Number.isNaN(start)) throw new HttpError(503, ERRORS.config);
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
