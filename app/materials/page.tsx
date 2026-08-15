import type { Metadata } from 'next';
import Image from 'next/image';
import PageHeader from '@/components/PageHeader';
import LeadInquiryForm from '@/components/LeadInquiryForm';
import { materials } from '@/lib/data';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'مصالح و توانمندی‌ها',
  description:
    'ماشین‌آلات، آسفالت گرم و سرد، و مصالح دانه‌بندی‌شده برای پروژه‌های راه‌سازی و عمرانی.',
};

export default function MaterialsPage() {
  return (
    <>
      <PageHeader
        ariaLabel="سربرگ صفحه مصالح"
        eyebrow="مصالح و توانمندی‌ها"
        title="مصالح و توانمندی‌های اجرایی"
        description="ماشین‌آلات، آسفالت گرم و سرد، و مصالح دانه‌بندی‌شده برای پروژه‌های راه‌سازی و عمرانی."
        backgroundImage="/images/material-asphalt.png"
      />

      <section className="py-16 md:py-24 bg-background" aria-labelledby="materials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="materials-heading" className="sr-only">
            محصولات ما
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {materials.map((mat) => (
              <article
                key={mat.id}
                className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={mat.image}
                    alt={mat.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-bold text-brand-900 text-xl mb-3">{mat.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    {mat.description}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {mat.specs.map((spec) => (
                      <li key={spec} className="flex items-start gap-2 text-sm text-brand-800">
                        <CheckCircle size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <LeadInquiryForm />
    </>
  );
}
