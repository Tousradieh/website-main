import type { Project } from '@/lib/types';

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
    coverImage: '/images/projects/p1/cover.jpg',
    gallery: [
      '/images/projects/p1/01.jpg',
      '/images/projects/p1/02.jpg',
      '/images/projects/p1/03.jpg',
      { src: '/images/projects/p1/04.mp4', type: 'video', videoType: 'url' },
    ],
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
    coverImage: '/images/projects/p2/cover.png',
    gallery: [
      '/images/projects/p2/01.png',
      '/images/projects/p2/02.png',
      '/images/projects/p2/03.png',
    ],
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
    coverImage: '/images/projects/p3/cover.png',
    gallery: [
      '/images/projects/p3/01.png',
      '/images/projects/p3/02.png',
      '/images/projects/p3/03.png',
    ],
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
    coverImage: '/images/projects/p4/cover.png',
    gallery: [
      '/images/projects/p4/01.png',
      '/images/projects/p4/02.png',
      '/images/projects/p4/03.png',
    ],
    tags: ['دوبانده‌سازی', 'آسفالت', 'ایمنی'],
  },
];

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}
