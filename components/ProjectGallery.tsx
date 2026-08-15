'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { projects } from '@/lib/data';
import { PROJECT_FILTERS, type ProjectFilter } from '@/lib/constants';
import type { Project } from '@/lib/types';
import ProjectStatusBadge from '@/components/ProjectStatusBadge';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProjectModal = dynamic(() => import('@/components/ProjectModal'), {
  ssr: false,
});

export default function ProjectGallery() {
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered =
    filter === 'all' ? projects : projects.filter((project) => project.status === filter);

  return (
    <>
      <div className="bg-card border-b border-border sticky top-[64px] md:top-[80px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-2">
          {PROJECT_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                filter === value
                  ? 'bg-brand-900 text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-brand-100',
              )}
            >
              {label}
            </button>
          ))}
          <span className="mr-auto self-center text-xs text-muted-foreground">
            {filtered.length} پروژه
          </span>
        </div>
      </div>

      <section className="py-16 md:py-20 bg-background" aria-label="لیست پروژه‌ها">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-24">
              پروژه‌ای در این دسته‌بندی یافت نشد.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:border-brand-400 hover:shadow-xl transition-all duration-300 text-right w-full"
                  onClick={() => setSelected(project)}
                  aria-label={`مشاهده جزئیات: ${project.title}`}
                >
                  <div className="relative h-52 overflow-hidden bg-brand-900">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-brand-900/30 group-hover:bg-brand-900/20 transition-colors" />
                    <span className="absolute top-3 right-3">
                      <ProjectStatusBadge status={project.status} tone="onImage" />
                    </span>
                  </div>

                  <div className="p-6">
                    <h2 className="font-heading font-bold text-brand-900 text-xl mb-3 text-balance">
                      {project.title}
                    </h2>

                    <div className="flex flex-wrap gap-4 mb-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-brand-500 flex-shrink-0" />
                        {project.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-brand-500 flex-shrink-0" />
                        {project.date}
                      </span>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      <Tag size={12} className="text-muted-foreground" />
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-6 pb-5 border-t border-border pt-4">
                    <span className="text-sm font-medium text-accent group-hover:underline">
                      {'مشاهده جزئیات و گالری تصاویر ←'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {selected ? (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      ) : null}
    </>
  );
}
