'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import type { Project } from '@/lib/types';
import { resolveGalleryItem } from '@/lib/gallery';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, User, Tag, Play } from 'lucide-react';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gallery = project.gallery.map(resolveGalleryItem);
  const active = gallery[activeIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setActiveIndex((i) => Math.min(i + 1, gallery.length - 1));
      if (e.key === 'ArrowRight') setActiveIndex((i) => Math.max(i - 1, 0));
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, gallery.length]);

  const prev = useCallback(() => setActiveIndex((i) => Math.max(i - 1, 0)), []);
  const next = useCallback(
    () => setActiveIndex((i) => Math.min(i + 1, gallery.length - 1)),
    [gallery.length],
  );

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
        <div className="relative h-64 sm:h-80 md:h-96 bg-brand-900 rounded-t-2xl overflow-hidden">
          {active.type === 'video' ? (
            <video
              key={activeIndex}
              src={active.src}
              poster={active.poster}
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-contain bg-brand-900"
              aria-label={`${project.title} – ویدیو ${activeIndex + 1}`}
            />
          ) : (
            <Image
              key={activeIndex}
              src={active.src}
              alt={`${project.title} – تصویر ${activeIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 896px"
              priority
            />
          )}
          {/* Nav arrows */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={prev}
                disabled={activeIndex === 0}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-brand-900/60 text-white hover:bg-brand-900 disabled:opacity-30 transition-all"
                aria-label="مورد قبلی"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={next}
                disabled={activeIndex === gallery.length - 1}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-brand-900/60 text-white hover:bg-brand-900 disabled:opacity-30 transition-all"
                aria-label="مورد بعدی"
              >
                <ChevronLeft size={20} />
              </button>
            </>
          )}
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeIndex ? 'bg-accent w-5' : 'bg-white/50'
                }`}
                aria-label={`مورد ${i + 1}`}
                aria-current={i === activeIndex}
              />
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 p-4 pb-0 overflow-x-auto">
          {gallery.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex ? 'border-accent' : 'border-transparent'
              }`}
              aria-label={item.type === 'video' ? `ویدیو ${i + 1}` : `تصویر ${i + 1}`}
            >
              {item.type === 'video' ? (
                item.poster ? (
                  <>
                    <Image
                      src={item.poster}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-brand-900/40">
                      <Play size={18} className="text-white fill-white" aria-hidden />
                    </span>
                  </>
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center bg-brand-900">
                    <Play size={20} className="text-white fill-white" aria-hidden />
                  </span>
                )
              ) : (
                <Image
                  src={item.src}
                  alt={`تصویر ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
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
