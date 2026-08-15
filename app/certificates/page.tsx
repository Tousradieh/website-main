import type { Metadata } from 'next';
import Image from 'next/image';
import PageHeader from '@/components/PageHeader';
import { certificates } from '@/lib/data';

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

          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2 lg:gap-y-0">
            {certificates.map((cert) => (
              <li
                key={cert.id}
                className="flex flex-col sm:flex-row gap-5 sm:gap-6 py-8 border-b border-border"
              >
                <div className="relative w-24 h-32 flex-shrink-0 self-start bg-brand-50">
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    fill
                    className="object-contain p-1"
                    sizes="96px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-bold text-brand-900 text-xl mb-1 text-balance">
                    {cert.title}
                  </h3>
                  <p className="text-brand-600 text-sm mb-3">
                    {cert.issuer}
                    {cert.year ? ` — ${cert.year}` : ''}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{cert.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
