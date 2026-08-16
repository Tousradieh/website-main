import type { Service } from '@/lib/types';

export const services: Service[] = [
  {
    id: 'road',
    icon: '🛣️',
    title: 'راه‌سازی',
    description: 'احداث، بهسازی و توسعه محورهای بین شهری و روستایی با استانداردهای فنی روز.',
  },
  {
    id: 'structures',
    icon: '🏢',
    title: 'ابنیه و ساختمان',
    description: 'طراحی و اجرای ابنیه فنی، سازه‌ها و ساختمان‌های مرتبط با پروژه‌های عمرانی.',
  },
  {
    id: 'maintenance',
    icon: '🔧',
    title: 'تعمیر و نگهداری راه',
    description: 'نگهداری دوره‌ای، ترمیم روسازی و تعمیر راه‌ها برای حفظ ایمنی و کیفیت تردد.',
  },
  {
    id: 'township',
    icon: '🏙️',
    title: 'محوطه و شهرک‌سازی',
    description: 'اجرای محوطه‌سازی، معابر داخلی و زیرساخت شهرک‌ها و مجموعه‌های عمرانی.',
  },
];
