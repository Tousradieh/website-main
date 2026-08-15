'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { jobPositions } from '@/lib/data';
import { CONTACT } from '@/lib/constants';
import type { JobPosition } from '@/lib/types';
import { MapPin, Clock, Briefcase, ArrowLeft } from 'lucide-react';

const JobModal = dynamic(() => import('@/components/JobModal'), {
  ssr: false,
});

export default function JobList() {
  const [selected, setSelected] = useState<JobPosition | null>(null);

  return (
    <>
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
                href={`mailto:${CONTACT.hrEmail}`}
                className="text-brand-600 hover:underline"
              >
                {CONTACT.hrEmail}
              </a>{' '}
              ارسال کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobPositions.map((job) => (
              <button
                key={job.id}
                type="button"
                className="group bg-card rounded-xl border border-border p-6 hover:border-brand-500 hover:shadow-md transition-all duration-200 text-right w-full"
                onClick={() => setSelected(job)}
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
              </button>
            ))}
          </div>
        </div>
      </section>

      {selected ? <JobModal job={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}
