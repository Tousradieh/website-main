'use client';

import { useEffect } from 'react';
import type { JobPosition } from '@/lib/types';
import { X, MapPin, Clock, Briefcase, CheckCircle2 } from 'lucide-react';

interface JobModalProps {
  job: JobPosition;
  onClose: () => void;
}

export default function JobModal({ job, onClose }: JobModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-900/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 p-2 rounded-full bg-brand-900/60 text-white hover:bg-brand-900 transition-colors"
          aria-label="بستن"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="bg-brand-900 rounded-t-2xl p-8 pb-6">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-xs font-medium mb-3">
            {job.department}
          </span>
          <h2
            id="job-modal-title"
            className="text-white font-heading font-black text-2xl md:text-3xl text-balance"
          >
            {job.title}
          </h2>
          <div className="flex flex-wrap gap-5 mt-4 text-brand-100/80 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-accent flex-shrink-0" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-accent flex-shrink-0" />
              {job.type}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase size={14} className="text-accent flex-shrink-0" />
              {job.department}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="mb-6">
            <h3 className="font-heading font-bold text-brand-900 text-lg mb-3">
              شرح موقعیت شغلی
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {job.description}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="font-heading font-bold text-brand-900 text-lg mb-3">
              شرایط و مهارت‌های لازم
            </h3>
            <ul className="flex flex-col gap-3">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2
                    size={16}
                    className="text-brand-500 flex-shrink-0 mt-0.5"
                  />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <a
            href={`mailto:careers@toussradieh.ir?subject=درخواست استخدام: ${encodeURIComponent(job.title)}`}
            className="block w-full text-center py-3.5 px-6 rounded-md bg-brand-900 text-white font-bold text-sm hover:bg-brand-800 transition-colors"
          >
            ارسال رزومه
          </a>
        </div>
      </div>
    </div>
  );
}
