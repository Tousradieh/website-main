import type { TeamMember } from '@/lib/types';

/** Switch team section between photo cards (`true`) and title-first cards (`false`). */
export const teamHasImage = false;

export const teamMembers: TeamMember[] = [
  {
    id: 't1',
    name: 'حسن فراوانی',
    role: 'رئیس هیئت‌مدیره',
    department: 'leadership',
    bio: 'بیش از ۴۰ سال تجربه در صنعت راه‌سازی و مدیریت پروژه‌های ملی.',
    image: '/images/team-ceo.png',
    reportsTo: null,
  },
  {
    id: 't2',
    name: 'مسعود فراوانی',
    role: 'نائب رئیس هیئت‌مدیره',
    department: 'leadership',
    bio: 'بیش از ۳۰ سال تجربه در اجرای پروژه‌های بزرگ راه‌سازی. فارغ‌التحصیل دانشگاه فردوسی در رشته مهندسی عمران.',
    image: '/images/team-ceo.png',
    reportsTo: 't1',
  },
  {
    id: 't3',
    name: 'علی دانش‌پژوه',
    role: 'مدیر عامل',
    department: 'leadership',
    bio: 'متخصص مدیریت پروژه‌های بزرگ بزرگراهی با بیش از ۲۵ سال سابقه. دارای گواهی PMP.',
    image: '/images/team-manager.png',
    reportsTo: 't2',
  },
  {
    id: 't4',
    name: 'محمد طاهری',
    role: 'مدیر مناقصات و شرکت',
    department: 'leadership',
    bio: 'متخصص در اجرای عملیات خاکی و زیرسازی. با تجربه ۱۵ ساله در پروژه‌های کوهستانی.',
    image: '/images/team-engineer1.png',
    reportsTo: 't3',
  },
  {
    id: 't5',
    name: 'حسن منوری',
    role: 'مدیر منابع انسانی',
    department: 'leadership',
    bio: 'متخصص در مدیریت منابع انسانی و توسعه فرهنگ سازمانی. با تجربه ۳۰ ساله در زمینه‌های استخدام، آموزش و توسعه مهارت‌ها.',
    image: '/images/team-engineer1.png',
    reportsTo: 't3',
  },
  {
    id: 't6',
    name: 'مهدی فراوانی',
    role: 'مدیر لجستیک',
    department: 'leadership',
    bio: 'متخصص در مدیریت لجستیک. با تجربه ۱۰ ساله در زمینه‌های مدیریت لجستیک.',
    image: '/images/team-engineer1.png',
    reportsTo: 't3',
  },
];
