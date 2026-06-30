import Image from 'next/image';
import Link from 'next/link';
import { stats } from '@/lib/data';
import { ArrowLeft } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden" aria-label="بخش معرفی">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-road.png"
          alt="منظره هوایی آزادراه توس‌رادیه"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-brand-900/65" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-brand-900 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 pt-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          پیشرو در راه‌سازی ایران
        </div>

        <h1 className="text-white font-heading font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-balance mb-6">
          سازندگان راه‌های
          <br />
          <span className="text-accent">آینده ایران</span>
        </h1>

        <p className="text-brand-100/80 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          توس‌رادیه با بهره‌گیری از تجربه ۲۵ ساله، پیشرفته‌ترین تجهیزات و
          متخصص‌ترین مهندسان، استانداردهای جدیدی در راه‌سازی و زیرساخت
          جاده‌ای کشور تعریف می‌کند.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-accent text-accent-foreground font-bold text-base hover:bg-accent/90 transition-colors"
          >
            مشاهده پروژه‌ها
            <ArrowLeft size={18} className="rtl-flip" />
          </Link>
          <Link
            href="/materials"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-white/30 text-white font-medium text-base hover:bg-white/10 transition-colors"
          >
            درخواست مصالح
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/15">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center md:text-right">
              <div className="text-accent font-black text-3xl md:text-4xl leading-none mb-1">
                {stat.value}
              </div>
              <div className="text-brand-100/70 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
