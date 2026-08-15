import Link from 'next/link';
import { navItems, services } from '@/lib/data';
import { CONTACT, SITE_NAME } from '@/lib/constants';
import Logo from '@/components/Logo';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-100" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Logo />
              <span className="text-white font-bold text-xl">{SITE_NAME}</span>
            </div>
            <p className="text-sm leading-relaxed text-brand-100/80 max-w-sm">
              شرکت راه‌سازی {SITE_NAME} با بیش از ۳۰ سال تجربه، پیشرو در احداث و
              بازسازی راه‌ها، پل‌ها و زیرساخت‌های جاده‌ای کشور است.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <a
                href={`tel:${CONTACT.phoneTel}`}
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <Phone size={16} className="text-accent flex-shrink-0" />
                <span dir="ltr">{CONTACT.phoneDisplay}</span>
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <Mail size={16} className="text-accent flex-shrink-0" />
                <span>{CONTACT.email}</span>
              </a>
              <span className="flex items-start gap-3">
                <MapPin size={16} className="text-accent flex-shrink-0 mt-0.5" />
                <span>{CONTACT.address}</span>
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">دسترسی سریع</h3>
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-brand-100/80 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">خدمات ما</h3>
            <ul className="flex flex-col gap-2">
              {services.map((service) => (
                <li key={service.id} className="text-sm text-brand-100/80">
                  {service.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-100/50">
          <span>© {new Date().getFullYear()} {SITE_NAME}. تمامی حقوق محفوظ است.</span>
        </div>
      </div>
    </footer>
  );
}
