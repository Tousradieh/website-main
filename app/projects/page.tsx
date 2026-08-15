import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import ProjectGallery from '@/components/ProjectGallery';

export const metadata: Metadata = {
  title: 'پروژه‌ها',
  description:
    'نگاهی به پروژه‌های بزرگ و تاثیرگذاری که توسط توس‌رادیه در سراسر ایران اجرا شده‌اند.',
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        ariaLabel="سربرگ صفحه پروژه‌ها"
        eyebrow="کارنامه اجرایی"
        title="پروژه‌های ما"
        description="نگاهی به پروژه‌های بزرگ و تاثیرگذاری که توسط توس‌رادیه در سراسر ایران اجرا شده‌اند."
      />
      <ProjectGallery />
    </>
  );
}
