'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import type { Project } from '@/lib/types';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, User, Tag } from 'lucide-react';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeImage, setActiveImage] = useState(0);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setActiveImage((i) => Math.min(i + 1, project.gallery.length - 1));
      if (e.key === 'ArrowRight') setActiveImage((i) => Math.max(i - 1, 0));
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, project.gallery.length]);

  const prev = useCallback(() => setActiveImage((i) => Math.max(i - 1, 0)), []);
  const next = useCallback(() => setActiveImage((i) => Math.min(i + 1, project.gallery.length - 1)), [project.gallery.length]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-900/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 p-2 rounded-full bg-brand-900/60 text-white hover:bg-brand-900 transition-colors"
          aria-label="بستن"
        >
          <X size={20} />
        </button>

        {/* Gallery */}
        <div className="relative h-64 sm:h-80 bg-brand-900 rounded-t-2xl overflow-hidden">
          <Image
            key={activeImage}
            src={project.gallery[activeImage]}
            alt={`${project.title} – تصویر ${activeImage + 1}`}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 896px"
            priority
          />
          {/* Nav arrows */}
          {project.gallery.length > 1 && (
            <>
              <button
                onClick={prev}
                disabled={activeImage === 0}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-900/60 text-white hover:bg-brand-900 disabled:opacity-30 transition-all"
                aria-label="تصویر قبلی"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={next}
                disabled={activeImage === project.gallery.length - 1}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-900/60 text-white hover:bg-brand-900 disabled:opacity-30 transition-all"
                aria-label="تصویر بعدی"
              >
                <ChevronLeft size={20} />
              </button>
            </>
          )}
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {project.gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeImage ? 'bg-accent w-5' : 'bg-white/50'
                }`}
                aria-label={`تصویر ${i + 1}`}
                aria-current={i === activeImage}
              />
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 p-4 pb-0 overflow-x-auto">
          {project.gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeImage ? 'border-accent' : 'border-transparent'
              }`}
              aria-label={`تصویر ${i + 1}`}
            >
              <Image
                src={img}
                alt={`تصویر ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="p-6">
          {/* Status badge */}
          <span
            className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium mb-3 ${
              project.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-brand-100 text-brand-700'
            }`}
          >
            {project.status === 'active' ? 'در حال اجرا' : 'تکمیل‌شده'}
          </span>

          <h2 className="font-heading font-black text-brand-900 text-2xl md:text-3xl mb-4 text-balance">
            {project.title}
          </h2>

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-brand-50 rounded-xl">
            <div className="flex items-start gap-2">
              <User size={16} className="text-brand-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">کارفرما</p>
                <p className="text-sm font-medium text-brand-900">{project.client}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={16} className="text-brand-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">تاریخ</p>
                <p className="text-sm font-medium text-brand-900">{project.date}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-brand-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">موقعیت</p>
                <p className="text-sm font-medium text-brand-900">{project.location}</p>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Tag size={14} className="text-muted-foreground mt-0.5" />
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
