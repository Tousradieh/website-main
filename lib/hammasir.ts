/**
 * «هم‌مسیر توس» campaign: types and API client for workers/hammasir.
 * Response shapes must stay in sync with workers/hammasir/src/index.ts.
 */

export const HAMMASIR_NAME = 'هم‌مسیر توس';

/** Keep in sync with workers/hammasir/src/index.ts CAMPAIGN_WEEKS */
export const CAMPAIGN_WEEKS = 13;

export const CAMPAIGN_PHASES = [
  { phase: 1, title: 'یخ‌زدایی و بیداری', goal: 'آشنایی با ضرورت تغییر از سازمان سنتی به استراتژی‌محور' },
  { phase: 2, title: 'ارتباط شغل با استراتژی', goal: 'دیدن اثر کار روزانه هر نفر بر کیفیت، قیمت تمام‌شده و سود شرکت' },
  { phase: 3, title: 'توانمندسازی و اقدام', goal: 'آشنایی با شاخص‌ها و پیشنهاد پروژه‌های کوچک بهبود' },
] as const;

export const HAMMASIR_MESSAGES = {
  missingApiUrl: 'آدرس سرور کمپین تنظیم نشده است.',
  networkError: 'اتصال برقرار نشد. اینترنت را بررسی کنید و دوباره تلاش کنید.',
  genericError: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.',
} as const;

export interface CampaignStatus {
  start: string;
  week: number;
  totalWeeks: number;
  phase: 1 | 2 | 3;
  ended: boolean;
}

export interface TeamStanding {
  id: string;
  name: string;
  members: number;
  participation: number;
  score: number;
  rank: number;
}

export interface MissionEntry {
  week: number;
  points: number;
  note: string;
  kind: 'personal' | 'team';
}

export interface MeResponse {
  employee: { code: string; name: string; teamId: string; teamName: string };
  wallet: { knowledge: number; missions: number; total: number };
  missions: MissionEntry[];
  team: TeamStanding | null;
  teamCount: number;
  campaign: CampaignStatus;
}

export interface QuizResult {
  correct: number;
  total: number;
  earned: number;
}

export interface QuizSummary {
  id: number;
  week: number;
  title: string;
  points: number;
  questionCount: number;
  open: boolean;
  result: QuizResult | null;
}

export interface QuizDetail {
  id: number;
  week: number;
  title: string;
  points: number;
  questions: { q: string; options: string[] }[];
}

export interface AdminOverview {
  counts: { employees: number; active: number; attempts: number };
  quizzes: (Omit<QuizSummary, 'open' | 'result'> & { attempts: number })[];
  teams: TeamStanding[];
  units: { id: string; name: string; members: number }[];
  campaign: CampaignStatus;
}

export interface ImportResult {
  imported: number;
  errors: string[];
}

export type ApiResult<T> = ({ ok: true } & T) | { ok: false; error: string; status: number };

const TOKEN_KEY = 'hammasir-token';
const ADMIN_TOKEN_KEY = 'hammasir-admin-token';

export interface TokenStore {
  get: () => string;
  set: (value: string | null) => void;
  subscribe: (listener: () => void) => () => void;
}

function createTokenStore(storage: () => Storage, key: string): TokenStore {
  const listeners = new Set<() => void>();
  // Fallback when storage is blocked (private mode): the token lives until reload.
  let memory = '';
  return {
    get: () => {
      try {
        return storage().getItem(key) ?? '';
      } catch {
        return memory;
      }
    },
    set: (value) => {
      memory = value ?? '';
      try {
        if (value) storage().setItem(key, value);
        else storage().removeItem(key);
      } catch {
        // Keep the in-memory copy only.
      }
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const sessionToken = createTokenStore(() => localStorage, TOKEN_KEY);

/** The admin password only lives for the browser tab. */
export const adminToken = createTokenStore(() => sessionStorage, ADMIN_TOKEN_KEY);

export async function hammasirApi<T>(
  path: string,
  options: { token?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  const apiUrl = process.env.NEXT_PUBLIC_HAMMASIR_API_URL?.trim().replace(/\/$/, '');
  if (!apiUrl) return { ok: false, error: HAMMASIR_MESSAGES.missingApiUrl, status: 0 };

  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let res: Response;
  try {
    res = await fetch(`${apiUrl}${path}`, {
      method: options.body === undefined ? 'GET' : 'POST',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    return { ok: false, error: HAMMASIR_MESSAGES.networkError, status: 0 };
  }

  const data = (await res.json().catch(() => null)) as ({ ok?: boolean; error?: string } & T) | null;
  if (!res.ok || !data?.ok) {
    return { ok: false, error: data?.error ?? HAMMASIR_MESSAGES.genericError, status: res.status };
  }
  return data as { ok: true } & T;
}

export function faNumber(value: number): string {
  return value.toLocaleString('fa-IR');
}
