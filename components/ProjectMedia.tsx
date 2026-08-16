'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import type { Project } from '@/lib/types';
import { resolveGalleryItem } from '@/lib/gallery';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface ProjectMediaProps {
  project: Project;
}

export default function ProjectMedia({ project }: ProjectMediaProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gallery = project.gallery.map(resolveGalleryItem);
  const active = gallery[activeIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setActiveIndex((i) => Math.min(i + 1, gallery.length - 1));
      if (e.key === 'ArrowRight') setActiveIndex((i) => Math.max(i - 1, 0));
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [gallery.length]);

  const prev = useCallback(() => setActiveIndex((i) => Math.max(i - 1, 0)), []);
  const next = useCallback(
    () => setActiveIndex((i) => Math.min(i + 1, gallery.length - 1)),
    [gallery.length],
  );

  if (!active) return null;

  return (
    <div>
      <div className="relative h-64 sm:h-80 md:h-[28rem] bg-brand-900 rounded-2xl overflow-hidden">
        {active.type === 'video' && active.videoType === 'aparat' ? (
          <iframe
            key={active.embedSrc}
            src={active.embedSrc}
            title={`${project.title} – ویدیو ${activeIndex + 1}`}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : active.type === 'video' ? (
          <video
            key={active.src}
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
            key={active.src}
            src={active.src}
            alt={`${project.title} – تصویر ${activeIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 896px"
            priority
          />
        )}
        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              disabled={activeIndex === 0}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-brand-900/60 text-white hover:bg-brand-900 disabled:opacity-30 transition-all"
              aria-label="مورد قبلی"
            >
              <ChevronRight size={20} />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={activeIndex === gallery.length - 1}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-brand-900/60 text-white hover:bg-brand-900 disabled:opacity-30 transition-all"
              aria-label="مورد بعدی"
            >
              <ChevronLeft size={20} />
            </button>
          </>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {gallery.map((item, i) => (
            <button
              key={item.src}
              type="button"
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

      {gallery.length > 1 ? (
        <div className="flex gap-2 p-4 pb-0 overflow-x-auto">
          {gallery.map((item, i) => (
            <button
              key={item.src}
              type="button"
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
      ) : null}
    </div>
  );
}
