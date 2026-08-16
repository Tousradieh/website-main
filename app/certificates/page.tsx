import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import CertificateList from '@/components/CertificateList';

export const metadata: Metadata = {
  title: 'گواهی‌نامه‌ها',
  description:
    'مجموعه گواهی‌ها و تقدیرنامه‌های دریافتی توس‌رادیه از کارفرمایان و مراجع معتبر.',
};

export default function CertificatesPage() {
  return (
    <>
      <PageHeader
        ariaLabel="سربرگ صفحه گواهی‌نامه‌ها"
        eyebrow="اعتبار حرفه‌ای"
        title="گواهی‌نامه‌ها و تقدیرنامه‌ها"
        description="مجموعه گواهی‌ها و تقدیرنامه‌های دریافتی توس‌رادیه از کارفرمایان و مراجع معتبر."
      />

      <section className="py-20 md:py-28 bg-background" aria-labelledby="certificates-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="certificates-heading" className="sr-only">
            فهرست گواهی‌نامه‌ها
          </h2>

          <CertificateList />
        </div>
      </section>
    </>
  );
}
