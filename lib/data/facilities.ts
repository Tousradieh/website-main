import type {
  FacilityCategory,
  FacilityType,
  ProductionSite,
  SupportCapability,
} from '@/lib/types';

export const facilityTypeLabels: Record<FacilityType, string> = {
  quarry: 'معدن شن و ماسه',
  crusher: 'سنگ‌شکن',
  asphalt: 'کارخانه آسفالت',
  batching: 'بچینگ بتن',
};

export const facilityCategories: FacilityCategory[] = [
  {
    id: 'quarry',
    title: 'معادن شن و ماسه',
    description:
      'برداشت مصالح کوهی و رودخانه‌ای از معادن در مجاورت سایت‌های تولیدی؛ نقطه شروع زنجیره تأمین خودی شرکت.',
    outputs: [
      'مصالح کوهی و رودخانه‌ای',
      'خوراک پایدار برای سنگ‌شکن‌ها',
      'فاصله حمل کوتاه تا کارگاه پروژه',
    ],
  },
  {
    id: 'crusher',
    title: 'سنگ‌شکن و دانه‌بندی',
    description:
      'مجتمع‌های سنگ‌شکن که خوراک معادن را به مصالح دانه‌بندی‌شده برای زیرسازی، آسفالت و بتن تبدیل می‌کنند.',
    outputs: [
      'شن و ماسه شکسته',
      'گراویه و نخودری',
      'مصالح اساس و زیراساس',
      'دانه‌بندی مطابق مشخصات فنی راه',
    ],
  },
  {
    id: 'asphalt',
    title: 'کارخانه‌های آسفالت',
    description:
      'مجتمع‌های آسفالت گرم در کنار سنگ‌شکن‌ها، برای روسازی محورها و آزادراه‌ها با کنترل کیفیت آزمایشگاهی.',
    outputs: [
      'آسفالت گرم رویه، بیندر و اساس',
      'ظرفیت ۱۲۰ تا ۱۶۰ تن در ساعت در هر مجتمع',
      'کنترل کیفیت آزمایشگاهی تولید',
    ],
  },
  {
    id: 'batching',
    title: 'بچینگ بتن',
    description:
      'واحدهای بتن آماده مستقر در محل پروژه‌ها، برای ابنیه فنی آزادراه و زیرسازی راه‌آهن.',
    outputs: [
      'بتن آماده ابنیه فنی، پل و آبرو',
      'استقرار در شعاع پروژه‌های راه و ریلی',
      'قطعات بتنی (نیوجرسی و جدول)',
    ],
  },
];

/** Active production sites; source: company profile report (Phase 1, table 1). */
export const productionSites: ProductionSite[] = [
  {
    id: 'golbahar',
    name: 'گلبهار',
    province: 'خراسان رضوی',
    units: ['asphalt', 'crusher'],
    capacity: '۲ مجتمع — ۱۲۰ و ۱۶۰ تن در ساعت',
  },
  {
    id: 'quchan',
    name: 'قوچان',
    province: 'خراسان رضوی',
    units: ['asphalt', 'crusher'],
    capacity: '۱۲۰ تن در ساعت',
  },
  {
    id: 'shandiz',
    name: 'شاندیز',
    province: 'خراسان رضوی',
    units: ['batching'],
    capacity: '۲ دستگاه بچینگ بتن',
    note: 'تأمین بتن ابنیه فنی آزادراه مشهد–چناران',
  },
  {
    id: 'ferdows',
    name: 'فردوس',
    province: 'خراسان جنوبی',
    units: ['asphalt', 'crusher'],
    capacity: '۱۲۰ تن در ساعت',
  },
  {
    id: 'qaen',
    name: 'قائن',
    province: 'خراسان جنوبی',
    units: ['asphalt', 'crusher'],
    capacity: '۱۲۰ تن در ساعت',
    note: 'واحد اصلی خراسان جنوبی',
  },
  {
    id: 'deyhook',
    name: 'دیهوک',
    province: 'خراسان جنوبی',
    units: ['asphalt', 'crusher'],
    capacity: '۱۲۰ تن در ساعت',
  },
  {
    id: 'nehbandan',
    name: 'نهبندان',
    province: 'خراسان جنوبی',
    units: ['batching', 'crusher'],
    capacity: '۵۰ تن در ساعت',
    note: 'پشتیبان زیرسازی راه‌آهن نهبندان',
  },
];

export const supportCapabilities: SupportCapability[] = [
  {
    id: 'fleet',
    title: 'ناوگان ماشین‌آلات ملکی',
    description: 'فینیشر، گریدر، غلتک، بولدوزر و کامیون برای اجرا و حمل مصالح.',
  },
  {
    id: 'lab',
    title: 'آزمایشگاه کنترل کیفیت',
    description: 'کنترل دانه‌بندی، آسفالت و بتن تولیدی مطابق مشخصات پروژه.',
  },
  {
    id: 'survey',
    title: 'دفتر فنی و نقشه‌برداری',
    description: 'یک دفتر فنی مرکزی و سه دفتر کارگاهی همراه با تیم نقشه‌برداری.',
  },
  {
    id: 'workshop',
    title: 'تعمیرگاه ناوگان',
    description: 'پشتیبانی فنی و نگهداشت ماشین‌آلات برای تداوم عملیات کارگاه.',
  },
];
