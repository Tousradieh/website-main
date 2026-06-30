import Link from 'next/link';
import { navItems } from '@/lib/data';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-100" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-md bg-accent text-accent-foreground font-black text-base">
                TR
              </span>
              <span className="text-white font-bold text-xl">توس‌رادیه</span>
            </div>
            <p className="text-sm leading-relaxed text-brand-100/80 max-w-sm">
              شرکت راه‌سازی توس‌رادیه با بیش از ۲۵ سال تجربه، پیشرو در احداث و
              بازسازی راه‌ها، پل‌ها و زیرساخت‌های جاده‌ای کشور است.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <a href="tel:+982188001234" className="flex items-center gap-3 hover:text-white transition-colors">
                <Phone size={16} className="text-accent flex-shrink-0" />
                <span dir="ltr">+98 21 8800 1234</span>
              </a>
              <a href="mailto:info@toussradieh.ir" className="flex items-center gap-3 hover:text-white transition-colors">
                <Mail size={16} className="text-accent flex-shrink-0" />
                <span>info@toussradieh.ir</span>
              </a>
              <span className="flex items-start gap-3">
                <MapPin size={16} className="text-accent flex-shrink-0 mt-0.5" />
                <span>تهران، بلوار کشاورز، ساختمان مرکزی توس‌رادیه</span>
              </span>
            </div>
          </div>

          {/* Navigation */}
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

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">خدمات ما</h3>
            <ul className="flex flex-col gap-2">
              {['راه‌سازی و آسفالت', 'پل‌سازی', 'تأمین مصالح', 'عمران شهری', 'مشاوره فنی'].map((s) => (
                <li key={s} className="text-sm text-brand-100/80">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-100/50">
          <span>© {new Date().getFullYear()} توس‌رادیه. تمامی حقوق محفوظ است.</span>
          <span>ساخته‌شده با افتخار در ایران</span>
        </div>
      </div>
    </footer>
  );
}
