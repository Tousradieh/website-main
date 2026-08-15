'use client';

import type { JobPosition } from '@/lib/types';
import { CONTACT } from '@/lib/constants';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { X, MapPin, Clock, Briefcase, CheckCircle2 } from 'lucide-react';

interface JobModalProps {
  job: JobPosition;
  onClose: () => void;
}

export default function JobModal({ job, onClose }: JobModalProps) {
  return (
    <Modal
      onClose={onClose}
      labelledBy="job-modal-title"
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 z-20 p-2 rounded-full bg-brand-900/60 text-white hover:bg-brand-900 transition-colors"
        aria-label="بستن"
      >
        <X size={20} />
      </button>

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
            {job.requirements.map((req) => (
              <li key={req} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2
                  size={16}
                  className="text-brand-500 flex-shrink-0 mt-0.5"
                />
                {req}
              </li>
            ))}
          </ul>
        </div>

        <Button
          nativeButton={false}
          render={
            <a
              href={`mailto:${CONTACT.hrEmail}?subject=${encodeURIComponent(`درخواست استخدام: ${job.title}`)}`}
            />
          }
          variant="brand"
          className="w-full h-auto py-3.5 px-6 rounded-md"
        >
          ارسال رزومه
        </Button>
      </div>
    </Modal>
  );
}
