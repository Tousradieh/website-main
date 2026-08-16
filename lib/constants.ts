export const SITE_NAME = 'توس‌رادیه';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://tousradieh.com'
).replace(/\/$/, '');

/** Matches --color-brand-900; used where CSS tokens cannot be applied (e.g. theme-color). */
export const BRAND_THEME_COLOR = '#1e3a6e';

export const CONTACT = {
  phoneDisplay: '051-36082788',
  phoneTel: '+985136082788',
  email: 'info@tousradieh.com',
  hrEmail: 'hr@tousradieh.com',
  address: 'مشهد، چهارراه فرامرز عباسی، خیابان ابن سینا غربی، پلاک ۲۷۹',
  locality: 'مشهد',
  region: 'خراسان رضوی',
  postalCode: '',
  country: 'IR',
  hours: 'شنبه تا چهارشنبه ۸:۰۰ تا ۱۶:۳۰ — پنجشنبه ۸:۰۰ تا ۱۳:۰۰',
  hoursSchema: ['Sa-We 08:00-16:30', 'Th 08:00-13:00'],
  map: {
    lat: 36.325498,
    lng: 59.544944,
    zoom: 16,
  },
} as const;

const whatsappNumber = CONTACT.phoneTel.replace('+', '');

export const CHAT_LINKS = [
  {
    id: 'phone',
    label: 'تماس تلفنی',
    href: `tel:${CONTACT.phoneTel}`,
  },
  {
    id: 'whatsapp',
    label: 'واتساپ',
    href: `https://wa.me/${whatsappNumber}`,
  },
  {
    id: 'email',
    label: 'ایمیل',
    href: `mailto:${CONTACT.email}`,
  },
] as const;

export const MAP_LINKS = {
  osmEmbed: (() => {
    const { lat, lng } = CONTACT.map;
    const delta = 0.004;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
  })(),
  osm: `https://www.openstreetmap.org/?mlat=${CONTACT.map.lat}&mlon=${CONTACT.map.lng}#map=${CONTACT.map.zoom}/${CONTACT.map.lat}/${CONTACT.map.lng}`,
  neshan: `https://neshan.org/maps/@${CONTACT.map.lat},${CONTACT.map.lng},16.0z`,
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

export const FORM_PRIVACY_NOTE =
  'با ارسال فرم، موافقت می‌کنید که از اطلاعات تماس شما فقط برای پیگیری همین درخواست استفاده شود.';
