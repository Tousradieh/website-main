import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import PageHeader from '@/components/PageHeader';
import ProjectMedia from '@/components/ProjectMedia';
import ProjectStatusBadge from '@/components/ProjectStatusBadge';
import { getProjectById, projects } from '@/lib/data';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { Calendar, MapPin, Tag, User, ArrowLeft } from 'lucide-react';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) {
    return { title: 'پروژه' };
  }

  const title = project.title;
  const description = project.description;
  const image = project.coverImage;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/projects/${project.id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/projects/${project.id}`,
      images: [{ url: image, alt: title }],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title,
          description: project.description,
          image: `${SITE_URL}${project.coverImage}`,
          creator: { '@type': 'Organization', name: SITE_NAME },
          contentLocation: project.location,
        }}
      />
      <PageHeader
        ariaLabel={`سربرگ پروژه ${project.title}`}
        eyebrow={project.location}
        title={project.title}
        description={project.description}
        backgroundImage={project.coverImage}
      />

      <article className="py-16 md:py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-900 mb-8"
          >
            بازگشت به پروژه‌ها
            <ArrowLeft size={16} className="rtl-flip" />
          </Link>

          <ProjectMedia project={project} />

          <div className="mt-8">
            <ProjectStatusBadge status={project.status} tone="onLight" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 p-4 bg-brand-50 rounded-xl">
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

            <p className="text-muted-foreground leading-relaxed mb-5">{project.description}</p>

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
      </article>
    </>
  );
}
