import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { certificates } from '@/lib/data';

export default function CertificatesPage() {
  return (
    <main>
      <Navbar />

      <section className="pt-32 pb-16 bg-brand-900" aria-label="سربرگ صفحه گواهی‌نامه‌ها">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-4">
            اعتبار حرفه‌ای
          </span>
          <h1 className="text-white font-heading font-black text-4xl md:text-5xl text-balance mb-4">
            گواهی‌نامه‌ها و تقدیرنامه‌ها
          </h1>
          <p className="text-brand-100/70 text-lg max-w-2xl mx-auto leading-relaxed">
            مجموعه گواهی‌ها و تقدیرنامه‌های دریافتی توس‌رادیه از کارفرمایان و مراجع معتبر.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-background" aria-labelledby="certificates-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="certificates-heading" className="sr-only">
            فهرست گواهی‌نامه‌ها
          </h2>

          <ul className="divide-y divide-border">
            {certificates.map((cert) => (
              <li
                key={cert.id}
                className="flex flex-col sm:flex-row gap-5 sm:gap-6 py-8 first:pt-0 last:pb-0"
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

      <Footer />
    </main>
  );
}
