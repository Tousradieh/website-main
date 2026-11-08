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
  { value: 'technical', label: 'فنی و مهندسی و کارگاه‌ها' },
  { value: 'plants', label: 'کارخانجات و تولید' },
  { value: 'machinery', label: 'ماشین‌آلات و ناوگان' },
  { value: 'finance', label: 'مالی، بودجه و انبارها' },
  { value: 'sales', label: 'مناقصات، قراردادها و بازرگانی' },
  { value: 'hr', label: 'سرمایه انسانی، اداری و HSE' },
  { value: 'rnd', label: 'تحقیقات و توسعه (R&D)' },
  { value: 'strategy', label: 'تیم استراتژیک (OSM)' },
] as const;

export type Department = (typeof DEPARTMENTS)[number]['value'];

export function departmentLabel(value: string | null): string {
  return DEPARTMENTS.find((item) => item.value === value)?.label ?? 'تعیین نشده';
}

export interface Wallet {
  knowledge: number;
  ai: number;
  missions: number;
  total: number;
  spent: number;
  balance: number;
}

export interface MeResponse {
  employee: {
    code: string;
    name: string;
    teamId: string;
    teamName: string;
    department: Department | null;
    isManager: boolean;
    jobTitle: string;
    mobile: string;
  };
  wallet: Wallet;
  messages: { fromName: string; text: string; createdAt: number }[];
  operationalTasks: string[];
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

export type TrackIcon =
  | 'compass'
  | 'briefcase'
  | 'users'
  | 'hard-hat'
  | 'calculator'
  | 'handshake'
  | 'sparkles'
  | 'factory'
  | 'truck'
  | 'flask'
  | 'target';

export type Audience = 'all' | 'managers' | Department;

export function audienceLabel(audience: Audience): string {
  if (audience === 'all') return 'همه همکاران';
  if (audience === 'managers') return 'ویژه مدیران و سرپرستان';
  return `مسیر واحد · ${departmentLabel(audience)}`;
}

export const PERSPECTIVES = {
  learning: 'یادگیری و رشد',
  process: 'فرآیندهای داخلی',
  customer: 'مشتری',
  financial: 'مالی',
} as const;

export interface TrackSummary {
  id: string;
  title: string;
  audience: Audience;
  share: 'knowledge' | 'ai';
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
  learningMap: { perspective: keyof typeof PERSPECTIVES; text: string }[];
  operationalTasks: string[];
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

// ---------- improvement projects, store, team ----------

/** Keep in sync with workers/hammasir/src/engagement.ts IMPROVEMENT_CATEGORIES */
export const IMPROVEMENT_CATEGORIES = [
  { value: 'waste', label: 'کاهش ضایعات مصالح' },
  { value: 'fuel', label: 'کاهش مصرف سوخت و انرژی' },
  { value: 'idle', label: 'کاهش خواب ماشین‌آلات' },
  { value: 'systems', label: 'بهبود کار با سامانه‌ها' },
  { value: 'ai', label: 'تسریع کار با هوش مصنوعی' },
  { value: 'quality', label: 'کیفیت و کاهش دوباره‌کاری' },
  { value: 'safety', label: 'ایمنی و HSE' },
  { value: 'other', label: 'سایر' },
] as const;

export function improvementCategoryLabel(value: string): string {
  return IMPROVEMENT_CATEGORIES.find((item) => item.value === value)?.label ?? value;
}

/** Ease × impact quadrant of the Duke Children's Hospital matrix. */
export function matrixQuadrant(ease: number, impact: number): string {
  const easy = ease >= 3;
  const strong = impact >= 3;
  if (easy && strong) return 'کم‌هزینه و پربازده: فوراً اجرا شود';
  if (!easy && strong) return 'پرتلاش و پربازده: پروژه برنامه‌ریزی‌شده';
  if (easy && !strong) return 'کم‌تلاش و کم‌اثر: در صورت فرصت';
  return 'پرتلاش و کم‌اثر: فعلاً کنار گذاشته شود';
}

export interface ImprovementProject {
  id: number;
  title: string;
  category: string;
  problem: string;
  solution: string;
  teammates: string;
  status: ClaimStatus;
  ease: number | null;
  impact: number | null;
  points: number;
  feedback: string;
  createdAt: number;
}

export interface PendingImprovement {
  id: number;
  employeeCode: string;
  employeeName: string;
  teamName: string;
  title: string;
  category: string;
  problem: string;
  solution: string;
  teammates: string;
  createdAt: number;
}

export interface Reward {
  id: number;
  title: string;
  description: string;
  cost: number;
  left: number | null;
}

export interface StoreResponse {
  rewards: Reward[];
  redemptions: { id: number; title: string; cost: number; status: ClaimStatus; createdAt: number }[];
  wallet: Wallet;
}

export interface PersonRow {
  code: string;
  name: string;
  teamId: string;
  teamName: string;
  department: Department | null;
  isManager: number;
  jobTitle: string;
  knowledge: number;
  ai: number;
  missions: number;
  total: number;
  modulesPassed: number;
  tracksCompleted: number;
  lastActivity: number | null;
}

export interface TeamDashboard {
  teamName: string;
  participation: number;
  members: PersonRow[];
  pendingCapstones: PendingCapstone[];
  pendingImprovements: PendingImprovement[];
  pendingClaims: PendingClaim[];
}

export interface AdminOverview {
  counts: {
    employees: number;
    active: number;
    attempts: number;
    noDepartment: number;
    managers: number;
    profiles: number;
  };
  pendingImprovements: PendingImprovement[];
  topImprovements: {
    id: number;
    employeeName: string;
    teamName: string;
    title: string;
    category: string;
    ease: number;
    impact: number;
    points: number;
  }[];
  rewards: { id: number; title: string; cost: number; stock: number | null; claimed: number }[];
  pendingRedemptions: {
    id: number;
    employeeCode: string;
    employeeName: string;
    teamName: string;
    title: string;
    cost: number;
    createdAt: number;
  }[];
  quizzes: (Omit<QuizSummary, 'open' | 'result'> & { attempts: number })[];
  activities: { id: number; week: number; kind: ActivityKind; title: string; points: number; approved: number }[];
  pendingClaims: PendingClaim[];
  pendingCapstones: PendingCapstone[];
  tracks: { id: string; title: string; audience: Audience; started: number; completed: number }[];
  teams: TeamStanding[];
  units: { id: string; name: string; members: number }[];
  campaign: CampaignStatus;
}

export interface ImportResult {
  imported: number;
  errors: string[];
  pins?: { code: string; name: string; pin: string }[];
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

// ---------- admin data tables ----------

export interface AdminEmployee {
  code: string;
  name: string;
  teamId: string;
  teamName: string;
  department: Department | null;
  isManager: number;
  jobTitle: string;
  mobile: string;
  locked: number;
}

export interface AdminMission {
  id: number;
  employeeCode: string | null;
  employeeName: string | null;
  teamId: string | null;
  teamName: string | null;
  week: number;
  points: number;
  note: string;
  createdAt: number;
}
