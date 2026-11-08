/**
 * «هم‌مسیر توس» campaign: types and API client for workers/hammasir.
 * Response shapes must stay in sync with workers/hammasir/src/index.ts.
 */

export const HAMMASIR_NAME = 'هم‌مسیر توس';

/** DOM id of the app container, used to scroll back to it after in-app navigation. */
export const HAMMASIR_APP_ID = 'hammasir-app';

/** Keep in sync with workers/hammasir/src/http.ts CAMPAIGN_WEEKS */
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

/** Keep keys in sync with workers/hammasir/src/curriculum/types.ts DEPARTMENTS */
export const DEPARTMENTS = [
  { value: 'management', label: 'مدیریت و سرپرستی' },
  { value: 'hr', label: 'منابع انسانی' },
  { value: 'technical', label: 'فنی و اجرایی' },
  { value: 'finance', label: 'حسابداری و مالی' },
  { value: 'sales', label: 'فروش و بازاریابی' },
] as const;

export type Department = (typeof DEPARTMENTS)[number]['value'];

export function departmentLabel(value: string | null): string {
  return DEPARTMENTS.find((item) => item.value === value)?.label ?? 'تعیین نشده';
}

export interface MeResponse {
  employee: { code: string; name: string; teamId: string; teamName: string; department: Department | null };
  wallet: { knowledge: number; missions: number; total: number };
  missions: MissionEntry[];
  pendingClaims: number;
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

export const ACTIVITY_KINDS = [
  { value: 'course', label: 'دوره', claimLabel: 'دوره را خواندم / دیدم' },
  { value: 'class', label: 'کلاس', claimLabel: 'در کلاس شرکت کردم' },
] as const;

export type ActivityKind = (typeof ACTIVITY_KINDS)[number]['value'];

export function activityKind(kind: ActivityKind) {
  return ACTIVITY_KINDS.find((item) => item.value === kind) ?? ACTIVITY_KINDS[0];
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface ActivitySummary {
  id: number;
  week: number;
  kind: ActivityKind;
  title: string;
  description: string;
  link: string;
  points: number;
  open: boolean;
  claim: { status: ClaimStatus; note: string } | null;
}

export interface PendingClaim {
  employeeCode: string;
  employeeName: string;
  teamName: string;
  activityId: number;
  activityTitle: string;
  kind: ActivityKind;
  points: number;
  note: string;
  createdAt: number;
}

// ---------- learning tracks ----------

export type TrackIcon = 'compass' | 'briefcase' | 'users' | 'hard-hat' | 'calculator' | 'handshake' | 'sparkles';

export interface TrackSummary {
  id: string;
  title: string;
  audience: 'all' | Department;
  icon: TrackIcon;
  description: string;
  moduleCount: number;
  maxPoints: number;
  passedModules: number;
  capstoneStatus: ClaimStatus | null;
}

export interface ModuleResult {
  passed: boolean;
  firstPoints: number;
  bestCorrect: number;
  total: number;
  attempts: number;
}

export interface TrackDetail extends Omit<TrackSummary, 'passedModules' | 'capstoneStatus'> {
  outcomes: string[];
  sources: string[];
  modules: {
    id: string;
    title: string;
    week: number;
    minutes: number;
    summary: string;
    open: boolean;
    result: ModuleResult | null;
  }[];
  capstone: {
    title: string;
    brief: string;
    steps: string[];
    points: number;
    available: boolean;
    submission: { status: ClaimStatus; text: string; feedback: string; points: number } | null;
  };
}

export interface ModuleDetail {
  id: string;
  title: string;
  week: number;
  minutes: number;
  summary: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  keyPoints: string[];
  action: string;
  quiz: { q: string; options: string[] }[];
}

export interface ModuleSubmitResult {
  result: { correct: number; total: number; passed: boolean; earned: number; firstAttempt: boolean };
  answers: number[];
  explanations: string[];
}

export interface PendingCapstone {
  employeeCode: string;
  employeeName: string;
  teamName: string;
  trackId: string;
  trackTitle: string;
  capstoneTitle: string;
  text: string;
  points: number;
  createdAt: number;
}

export interface AdminOverview {
  counts: { employees: number; active: number; attempts: number; noDepartment: number };
  quizzes: (Omit<QuizSummary, 'open' | 'result'> & { attempts: number })[];
  activities: { id: number; week: number; kind: ActivityKind; title: string; points: number; approved: number }[];
  pendingClaims: PendingClaim[];
  pendingCapstones: PendingCapstone[];
  tracks: { id: string; title: string; audience: 'all' | Department; started: number; completed: number }[];
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
