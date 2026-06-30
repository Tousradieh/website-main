'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobModal from '@/components/JobModal';
import Image from 'next/image';
import { jobPositions } from '@/lib/data';
import type { JobPosition } from '@/lib/types';
import { MapPin, Clock, Briefcase, ArrowLeft } from 'lucide-react';

export default function CareersPage() {
  const [selected, setSelected] = useState<JobPosition | null>(null);

  return (
    <main>
      <Navbar />

      {/* Page Header */}
      <section className="pt-32 pb-16 bg-brand-900" aria-label="سربرگ صفحه موقعیت‌های شغلی">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-4">
            به خانواده ما بپیوندید
          </span>
          <h1 className="text-white font-heading font-black text-4xl md:text-5xl text-balance mb-4">
            موقعیت‌های شغلی
          </h1>
          <p className="text-brand-100/70 text-lg max-w-2xl mx-auto leading-relaxed">
            توس‌رادیه به دنبال افراد مستعد و متعهد است که در ساختن آینده زیرساخت کشور
            سهیم باشند.
          </p>
        </div>
      </section>

      {/* Work Culture */}
      <section className="py-20 md:py-24 bg-background" aria-labelledby="culture-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
                فرهنگ سازمانی
              </span>
              <h2
                id="culture-heading"
                className="font-heading font-black text-brand-900 text-3xl md:text-4xl mb-6 text-balance"
              >
                چرا توس‌رادیه؟
              </h2>

              <div className="flex flex-col gap-6">
                {[
                  {
                    title: 'رشد و یادگیری مداوم',
                    desc: 'برنامه‌های آموزشی داخلی و حمایت از شرکت در دوره‌های تخصصی داخلی و خارجی.',
                  },
                  {
                    title: 'محیط کار ایمن',
                    desc: 'رعایت کامل استانداردهای HSE در تمامی پروژه‌ها و سایت‌های اجرایی.',
                  },
                  {
                    title: 'حقوق و مزایای رقابتی',
                    desc: 'پرداخت به‌موقع، بیمه تکمیلی، مزایای سفر و پاداش عملکرد.',
                  },
                  {
                    title: 'پروژه‌های ملی و ماندگار',
                    desc: 'فرصت مشارکت در پروژه‌های راه‌سازی در مقیاس ملی و تاثیرگذار.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-1 h-full min-h-5 rounded-full bg-accent mt-1.5" />
                    <div>
                      <h3 className="font-semibold text-brand-900 text-sm mb-1">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-80 lg:h-[30rem] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/work-culture.png"
                alt="فرهنگ کاری در توس‌رادیه"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 md:py-24 bg-brand-50" aria-labelledby="jobs-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
              فرصت‌های شغلی
            </span>
            <h2
              id="jobs-heading"
              className="font-heading font-black text-brand-900 text-3xl md:text-4xl mb-4 text-balance"
            >
              موقعیت‌های باز
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              اگر موقعیت مناسبی نیافتید، رزومه خود را به آدرس{' '}
              <a
                href="mailto:careers@toussradieh.ir"
                className="text-brand-600 hover:underline"
              >
                careers@toussradieh.ir
              </a>{' '}
              ارسال کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobPositions.map((job) => (
              <article
                key={job.id}
                className="group bg-card rounded-xl border border-border p-6 hover:border-brand-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setSelected(job)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(job)}
                aria-label={`مشاهده جزئیات موقعیت: ${job.title}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-medium mb-2">
                      {job.department}
                    </span>
                    <h3 className="font-heading font-bold text-brand-900 text-xl">
                      {job.title}
                    </h3>
                  </div>
                  <div className="flex-shrink-0 w-9 h-9 rounded-full border border-border flex items-center justify-center text-brand-500 group-hover:bg-brand-900 group-hover:border-brand-900 group-hover:text-white transition-all mt-1">
                    <ArrowLeft size={16} className="rtl-flip" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-brand-400 flex-shrink-0" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="text-brand-400 flex-shrink-0" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={12} className="text-brand-400 flex-shrink-0" />
                    {job.department}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                  {job.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {selected && (
        <JobModal job={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}
