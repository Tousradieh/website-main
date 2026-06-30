import type { Service, Project, TeamMember, JobPosition, Material, Stat, NavItem } from './types';

export const navItems: NavItem[] = [
  { label: 'خانه', href: '/' },
  { label: 'پروژه‌ها', href: '/projects' },
  { label: 'تأمین مصالح', href: '/materials' },
  { label: 'تیم ما', href: '/team' },
  { label: 'موقعیت‌های شغلی', href: '/careers' },
];

export const stats: Stat[] = [
  { value: '۳۰+', label: 'سال تجربه' },
  { value: '۸۰+', label: 'پروژه تکمیل‌شده' },
  { value: '۱۲۰۰', label: 'کیلومتر راه‌سازی' },
  { value: '۵۰۰+', label: 'پرسنل' },
];

export const services: Service[] = [
  {
    id: 'road',
    icon: '🛣️',
    title: 'راه‌سازی و آسفالت',
    description: 'احداث و بازسازی جاده‌های درجه یک با بهترین استانداردهای فنی و مهندسی.',
  },
  {
    id: 'bridge',
    icon: '🌉',
    title: 'پل‌سازی و تونل',
    description: 'طراحی و اجرای پل‌ها، تونل‌ها و سازه‌های بزرگ زیرساختی.',
  },
  {
    id: 'material',
    icon: '🏗️',
    title: 'تأمین مصالح',
    description: 'تأمین آسفالت، بتن و قیر با بالاترین کیفیت برای پروژه‌های عمرانی.',
  },
  {
    id: 'urban',
    icon: '🏙️',
    title: 'عمران شهری',
    description: 'توسعه زیرساخت‌های شهری شامل معابر، پارکینگ و بلوارها.',
  },
  {
    id: 'consult',
    icon: '📐',
    title: 'مشاوره فنی',
    description: 'ارائه خدمات مشاوره تخصصی در حوزه راه‌سازی و مهندسی عمران.',
  },
  {
    id: 'maintenance',
    icon: '🔧',
    title: 'نگهداری و تعمیرات',
    description: 'نگهداری دوره‌ای و تعمیر راه‌ها و سازه‌های موجود.',
  },
];

export const projects: Project[] = [
  {
    id: 'p1',
    title: 'آزادراه مشهد – چناران (قطعه دوم)',
    client: 'سازمان راهداری و حمل‌ونقل جاده‌ای',
    date: '۱۴۰۴ – در حال اجرا',
    location: 'مشهد – چناران',
    status: 'active',
    description:
      'احداث ۱۲ کیلومتر از قطعه سوم آزادراه مشهد-چناران شامل عملیات خاکی، زیرسازی، آسفالت‌گذاری و تجهیزات ایمنی. این پروژه با استانداردهای روز دنیا در حال اجراست.',
    coverImage: '/images/project-1.png',
    gallery: ['/images/project-1.png', '/images/project-3.png', '/images/project-4.png'],
    tags: ['آزادراه', 'آسفالت', 'زیرسازی'],
  },
  {
    id: 'p2',
    title: 'بزرگراه فرودگاه – مشهد',
    client: 'شهرداری مشهد',
    date: '۱۴۰۴ – در حال اجرا',
    location: 'مشهد',
    status: 'active',
    description:
      'توسعه و ترمیم مسیر فرودگاه در شهر مشهد.',
    coverImage: '/images/project-3.png',
    gallery: ['/images/project-3.png', '/images/project-1.png', '/images/project-2.png'],
    tags: ['بزرگراه', 'تقاطع', 'شهری'],
  },
  {
    id: 'p3',
    title: 'جاده کوهستانی سنندج – مریوان',
    client: 'اداره‌کل راه و شهرسازی کردستان',
    date: '۱۳۹۹ – ۱۴۰۱',
    location: 'کردستان',
    status: 'completed',
    description:
      'احداث ۶۰ کیلومتر جاده کوهستانی با شرایط سخت محیطی. شامل ۴ تونل کوتاه، ۱۲ پل و دیوارهای حائل.',
    coverImage: '/images/project-2.png',
    gallery: ['/images/project-2.png', '/images/project-4.png', '/images/project-1.png'],
    tags: ['جاده کوهستانی', 'تونل', 'پل'],
  },
  {
    id: 'p4',
    title: 'محور دوبانده اصفهان – نائین',
    client: 'سازمان راهداری استان اصفهان',
    date: '۱۳۹۸ – ۱۴۰۰',
    location: 'اصفهان',
    status: 'completed',
    description:
      'دوبانده‌سازی ۸۰ کیلومتر محور اصفهان-نائین با اجرای لایه‌های آسفالتی استاندارد و نصب گاردریل‌های ایمنی.',
    coverImage: '/images/project-4.png',
    gallery: ['/images/project-4.png', '/images/project-2.png', '/images/project-3.png'],
    tags: ['دوبانده‌سازی', 'آسفالت', 'ایمنی'],
  },
];

export const teamMembers: TeamMember[] = [
    {
    id: 't1',
    name: 'مهندس حسن فراوانی',
    role: 'رئیس هیئت‌مدیره',
    department: 'leadership',
    bio: 'بیش از ۴۰ سال تجربه در صنعت راه‌سازی و مدیریت پروژه‌های ملی.',
    image: '/images/team-ceo.png',
  },
  {
    id: 't2',
    name: 'مهندس مسعود فراوانی',
    role: 'نائب رئیس هیئت‌مدیره',
    department: 'leadership',
    bio: 'بیش از ۳۰ سال تجربه در اجرای پروژه‌های بزرگ راه‌سازی. فارغ‌التحصیل دانشگاه فردوسی در رشته مهندسی عمران.',
    image: '/images/team-ceo.png',
  },
  {
    id: 't3',
    name: 'مهندس علی دانش‌پژوه',
    role: 'مدیر عامل',
    department: 'leadership',
    bio: 'متخصص مدیریت پروژه‌های بزرگ بزرگراهی با بیش از ۲۰ سال سابقه. دارای گواهی PMP.',
    image: '/images/team-manager.png',
  },
  {
    id: 't4',
    name: 'مهندس محمد طاهری',
    role: 'مدیر مناقصات و شرکت',
    department: 'leadership',
    bio: 'متخصص در اجرای عملیات خاکی و زیرسازی. با تجربه ۲۰ ساله در پروژه‌های کوهستانی.',
    image: '/images/team-engineer1.png',
  },
  {
    id: 't5',
    name: 'مهندس حسن منوری',
    role: 'مهندس منابع انسانی',
    department: 'leadership',
    bio: 'متخصص در مدیریت منابع انسانی و توسعه فرهنگ سازمانی. با تجربه ۳۰ ساله در زمینه‌های استخدام، آموزش و توسعه مهارت‌ها.',
    image: '/images/team-engineer1.png',
  },
];

export const jobPositions: JobPosition[] = [
  {
    id: 'j1',
    title: 'مهندس عمران ارشد',
    department: 'مهندسی و اجرا',
    location: 'تهران',
    type: 'تمام‌وقت',
    description:
      'ما به دنبال یک مهندس عمران ارشد با تجربه در راه‌سازی برای نظارت بر پروژه‌های فعال هستیم. مسئولیت اصلی شما هماهنگی تیم‌های میدانی، کنترل کیفیت اجرا و تهیه گزارشات فنی خواهد بود.',
    requirements: [
      'حداقل ۵ سال تجربه در پروژه‌های راه‌سازی',
      'تسلط بر نرم‌افزارهای AutoCAD و Civil 3D',
      'آشنایی با آیین‌نامه‌های راه ایران',
      'توانایی کار تیمی و رهبری',
    ],
  },
  {
    id: 'j2',
    title: 'تکنسین آزمایشگاه آسفالت',
    department: 'کنترل کیفیت',
    location: 'اصفهان',
    type: 'تمام‌وقت',
    description:
      'جهت تقویت تیم آزمایشگاه خود، به تکنسین متخصص آسفالت نیاز داریم. این موقعیت شامل انجام آزمون‌های مارشال، استخراج قیر و کنترل مصالح مصرفی در پروژه‌ها است.',
    requirements: [
      'دیپلم یا فوق‌دیپلم در رشته عمران',
      'آشنایی با آزمون مارشال و دانه‌بندی سنگدانه',
      'دقت بالا و توجه به جزئیات',
    ],
  },
  {
    id: 'j3',
    title: 'مدیر تدارکات و مصالح',
    department: 'لجستیک و زنجیره تأمین',
    location: 'تهران',
    type: 'تمام‌وقت',
    description:
      'مدیریت فرایند خرید و تأمین مصالح برای پروژه‌های متعدد شرکت. هماهنگی با تأمین‌کنندگان داخلی و خارجی و اطمینان از تحویل به‌موقع مصالح.',
    requirements: [
      'حداقل ۷ سال تجربه در تدارکات صنعت ساخت‌وساز',
      'آشنایی با بازار مصالح راه‌سازی',
      'مهارت در مذاکره و مدیریت قرارداد',
      'تسلط بر نرم‌افزار SAP مزیت محسوب می‌شود',
    ],
  },
  {
    id: 'j4',
    title: 'راننده ماشین‌آلات سنگین',
    department: 'اجرا و ماشین‌آلات',
    location: 'پروژه‌های مختلف',
    type: 'تمام‌وقت',
    description:
      'اپراتور ماشین‌آلات سنگین راه‌سازی شامل گریدر، غلتک و آسفالت‌فینیشر. کار در پروژه‌های مختلف با مزایای کامل.',
    requirements: [
      'گواهینامه رانندگی پایه یک یا دو',
      'حداقل ۳ سال تجربه کار با ماشین‌آلات راه‌سازی',
      'آشنایی با ایمنی کار در محیط‌های ساخت‌وساز',
    ],
  },
];

export const materials: Material[] = [
  {
    id: 'm1',
    name: 'آسفالت گرم',
    description:
      'تولید و تأمین انواع آسفالت گرم با دانه‌بندی متنوع (Base، Binder، Wearing) برای پروژه‌های جاده‌ای بزرگ و کوچک. کنترل کیفیت دقیق در تمام مراحل تولید.',
    specs: [
      'آسفالت رویه (Wearing Course) – AC 0/12',
      'آسفالت بیندر (Binder Course) – AC 0/19',
      'آسفالت اساس (Base Course) – AC 0/25',
      'ظرفیت تولید: ۵۰۰ تن در روز',
    ],
    image: '/images/material-asphalt.png',
  },
  {
    id: 'm2',
    name: 'بتن آماده',
    description:
      'تأمین بتن آماده با رده‌های مختلف مقاومتی برای پروژه‌های پل‌سازی، روسازی بتنی و سازه‌های زیرساختی. آزمون‌های کیفی طبق استانداردهای ASTM.',
    specs: [
      'رده مقاومتی C20 تا C50',
      'بتن توانمند (HPC) برای پل‌ها',
      'بتن روانه (SCC) برای قالب‌های پیچیده',
      'حمل با میکسر تا شعاع ۵۰ کیلومتر',
    ],
    image: '/images/material-concrete.png',
  },
  {
    id: 'm3',
    name: 'قیر و امولسیون',
    description:
      'تأمین قیر خالص و انواع امولسیون قیری برای اجرای پریمکوت، تک‌کوت و اندودهای آب‌بندی. محصولات مطابق استانداردهای ISIRI و AASHTO.',
    specs: [
      'قیر ۶۰/۷۰ و ۸۰/۱۰۰ (Pen Grade)',
      'قیر اصلاح‌شده با پلیمر (PMB)',
      'امولسیون کاتیونی RS, MS, SS',
      'تحویل با تانکر در سرتاسر کشور',
    ],
    image: '/images/material-bitumen.png',
  },
];
