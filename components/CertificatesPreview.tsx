import Link from 'next/link';
import Image from 'next/image';
import { certificates } from '@/lib/data';
import { ArrowLeft } from 'lucide-react';

export default function CertificatesPreview() {
  const loop = [...certificates, ...certificates];

  return (
    <section className="py-20 md:py-28 bg-brand-50" aria-labelledby="certificates-preview-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
              اعتبار و افتخار
            </span>
            <h2
              id="certificates-preview-heading"
              className="text-brand-900 font-heading font-black text-3xl md:text-4xl text-balance"
            >
              گواهی‌نامه‌ها و تقدیرنامه‌ها
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl">
              نمونه‌ای از گواهی‌ها و تقدیرنامه‌هایی که نشان‌دهنده تعهد توس‌رادیه به کیفیت، ایمنی و اجرای حرفه‌ای است.
            </p>
          </div>
          <Link
            href="/certificates"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-800 text-white font-medium text-sm hover:bg-brand-700 transition-colors self-start md:self-auto"
          >
            مشاهده همه
            <ArrowLeft size={16} className="rtl-flip" />
          </Link>
        </div>
      </div>

      <div className="certificates-marquee" dir="ltr" aria-label="کروسل گواهی‌نامه‌ها">
        <div className="certificates-marquee-track">
          {loop.map((cert, index) => (
            <Link
              key={`${cert.id}-${index}`}
              href="/certificates"
              className="flex w-40 md:w-48 flex-shrink-0 flex-col items-center gap-2 group"
              tabIndex={index >= certificates.length ? -1 : undefined}
              aria-hidden={index >= certificates.length ? true : undefined}
            >
              <div className="relative h-28 md:h-36 w-full">
                <Image
                  src={cert.image}
                  alt={index < certificates.length ? cert.title : ''}
                  fill
                  className="object-contain transition-opacity group-hover:opacity-90"
                  sizes="(max-width:768px) 160px, 192px"
                />
              </div>
              <span className="text-center text-xs md:text-sm font-medium text-brand-900 line-clamp-2 px-1" dir="rtl">
                {cert.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
