'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectModal from '@/components/ProjectModal';
import Image from 'next/image';
import { projects } from '@/lib/data';
import type { Project } from '@/lib/types';
import { MapPin, Calendar, Tag } from 'lucide-react';

type FilterType = 'all' | 'active' | 'completed';

export default function ProjectsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered =
    filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  return (
    <main>
      <Navbar />

      {/* Page Header */}
      <section className="pt-32 pb-16 bg-brand-900" aria-label="سربرگ صفحه پروژه‌ها">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-4">
            کارنامه اجرایی
          </span>
          <h1 className="text-white font-heading font-black text-4xl md:text-5xl text-balance mb-4">
            پروژه‌های ما
          </h1>
          <p className="text-brand-100/70 text-lg max-w-2xl mx-auto leading-relaxed">
            نگاهی به پروژه‌های بزرگ و تاثیرگذاری که توسط توس‌رادیه در سراسر ایران اجرا
            شده‌اند.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="bg-card border-b border-border sticky top-[64px] md:top-[80px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-2">
          {(
            [
              ['all', 'همه پروژه‌ها'],
              ['active', 'در حال اجرا'],
              ['completed', 'تکمیل‌شده'],
            ] as [FilterType, string][]
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === val
                  ? 'bg-brand-900 text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-brand-100'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="mr-auto self-center text-xs text-muted-foreground">
            {filtered.length} پروژه
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      <section className="py-16 md:py-20 bg-background" aria-label="لیست پروژه‌ها">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-24">
              پروژه‌ای در این دسته‌بندی یافت نشد.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((project) => (
                <article
                  key={project.id}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:border-brand-400 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelected(project)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelected(project)}
                  aria-label={`مشاهده جزئیات: ${project.title}`}
                >
                  {/* Cover image */}
                  <div className="relative h-52 overflow-hidden bg-brand-900">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-brand-900/30 group-hover:bg-brand-900/20 transition-colors" />
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        project.status === 'active'
                          ? 'bg-green-500/90 text-white'
                          : 'bg-brand-800/90 text-brand-100'
                      }`}
                    >
                      {project.status === 'active' ? 'در حال اجرا' : 'تکمیل‌شده'}
                    </span>
                  </div>

                  {/* Content */}
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
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}
