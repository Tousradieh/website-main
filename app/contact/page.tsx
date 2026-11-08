import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import ContactInquiryForm from '@/components/ContactInquiryForm';
import OfficeMap from '@/components/OfficeMap';
import JsonLd from '@/components/JsonLd';
import { CONTACT, SITE_NAME, SITE_URL } from '@/lib/constants';
import { localBusinessJsonLd } from '@/lib/seo';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'تماس با ما',
  description: `راه‌های ارتباطی ${SITE_NAME}: تلفن، ایمیل، آدرس دفتر مشهد و فرم درخواست همکاری.`,
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <PageHeader
        ariaLabel="سربرگ صفحه تماس"
        eyebrow="ارتباط با ما"
        title="تماس با ما"
        description="برای استعلام پروژه، مناقصه یا تأمین مصالح با دفتر مرکزی توس‌رادیه در مشهد در ارتباط باشید."
      />

      <section className="py-16 md:py-24 bg-background" aria-labelledby="contact-info-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <h2
                id="contact-info-heading"
                className="font-heading font-black text-brand-900 text-2xl md:text-3xl mb-6 text-balance"
              >
                دفتر مرکزی
              </h2>

              <ul className="flex flex-col gap-5 mb-8">
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <MapPin size={18} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-brand-900">آدرس</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{CONTACT.address}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Phone size={18} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-brand-900">تلفن</p>
                    <a
                      href={`tel:${CONTACT.phoneTel}`}
                      className="text-sm text-brand-700 hover:underline"
                      dir="ltr"
                    >
                      {CONTACT.phoneDisplay}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Mail size={18} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-brand-900">ایمیل</p>
                    <a
                      href={`mailto:${CONTACT.email}`}
                      className="text-sm text-brand-700 hover:underline"
                    >
                      {CONTACT.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Clock size={18} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-brand-900">ساعات کاری</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{CONTACT.hours}</p>
                  </div>
                </li>
              </ul>

              <OfficeMap />
            </div>

            <div>
              <h2 className="font-heading font-black text-brand-900 text-2xl md:text-3xl mb-3 text-balance">
                فرم درخواست
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                پیام خود را ارسال کنید؛ کارشناسان فروش در کمتر از ۲۴ ساعت پاسخ می‌دهند.
              </p>
              <ContactInquiryForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
