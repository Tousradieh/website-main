export const SITE_NAME = 'توس‌رادیه';

/** Matches --color-brand-900; used where CSS tokens cannot be applied (e.g. theme-color). */
export const BRAND_THEME_COLOR = '#1e3a6e';

export const CONTACT = {
  phoneDisplay: '051-36082788',
  phoneTel: '+985136082788',
  email: 'info@tousradieh.com',
  hrEmail: 'hr@tousradieh.com',
  address: 'مشهد، چهارراه فرامرز عباسی، خیابان ابن سینا غربی، پلاک ۲۷۹',
} as const;

export const PROJECT_STATUS_LABELS = {
  active: 'در حال اجرا',
  completed: 'تکمیل‌شده',
} as const;

export const PROJECT_FILTERS = [
  { value: 'all', label: 'همه پروژه‌ها' },
  { value: 'active', label: PROJECT_STATUS_LABELS.active },
  { value: 'completed', label: PROJECT_STATUS_LABELS.completed },
] as const;

export type ProjectFilter = (typeof PROJECT_FILTERS)[number]['value'];

export const EMPLOYEE_PORTAL_LINKS = [
  {
    label: 'سامانه اتوماسیون',
    href: 'http://auto.tousradieh.com',
    description: 'ورود پرسنل به سامانه اتوماسیون',
  },
  {
    label: 'سامانه CMMS',
    href: 'http://car.tousradieh.com',
    description: 'سیستم تعمیرات و لجستیک',
  },
] as const;

export const NAVBAR_SCROLL_THRESHOLD_PX = 20;
