import type { NavItem } from '@/lib/types';

export const navItems: NavItem[] = [
  { label: 'خانه', href: '/' },
  { label: 'درباره ما', href: '/about' },
  { label: 'پروژه‌ها', href: '/projects' },
  { label: 'مصالح و توانمندی‌ها', href: '/materials' },
  { label: 'گواهی‌نامه‌ها', href: '/certificates' },
  { label: 'موقعیت‌های شغلی', href: '/careers' },
  { label: 'تماس با ما', href: '/contact' },
];

/** In-page sections for the About dropdown in the navbar. */
export const aboutNavSections: NavItem[] = [
  { label: 'تاریخچه', href: '/about#history' },
  { label: 'مأموریت و چشم‌انداز', href: '/about#mission-vision' },
  { label: 'تیم ما', href: '/about#team' },
  { label: 'مسئولیت اجتماعی', href: '/about#csr' },
];
