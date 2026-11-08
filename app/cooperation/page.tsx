import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import { Handshake, HardHat, Package, Truck } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PartnershipForm from '@/components/PartnershipForm';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { COOPERATION_TYPES, type CooperationType } from '@/lib/partnership';

export const metadata: Metadata = {
  title: 'همکاری با ما',
  description: `همکاری با ${SITE_NAME}: مشارکت در پروژه‌های راه و ریلی، همکاری اجرایی، تأمین مصالح و اجاره ماشین‌آلات در خراسان.`,
  alternates: { canonical: `${SITE_URL}/cooperation` },
};

const TYPE_ICONS: Partial<Record<CooperationType, LucideIcon>> = {
  'joint-venture': Handshake,
  execution: HardHat,
  supply: Package,
  machinery: Truck,
};

const AVENUES = COOPERATION_TYPES.filter((type) => type.description);

export default function CooperationPage() {
  return (
    <>
      <PageHeader
        ariaLabel="سربرگ صفحه همکاری"
        eyebrow="همکاری با ما"
        title="شریک پروژه‌های زیرساختی شرق کشور"
        description="با تکیه بر هفت سایت تولیدی، ناوگان ملکی و بیش از سه دهه سابقه در خراسان، آماده همکاری در پروژه‌های راه، آزادراه و ریلی هستیم."
      />

      <section className="py-16 md:py-24 bg-background" aria-labelledby="avenues-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="avenues-heading"
            className="text-brand-900 font-heading font-black text-2xl md:text-3xl text-center mb-10 text-balance"
          >
            زمینه‌های همکاری
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AVENUES.map((avenue) => {
              const Icon = TYPE_ICONS[avenue.value] ?? Handshake;
              return (
                <article
                  key={avenue.value}
                  className="bg-card rounded-xl p-6 border border-border"
                >
                  <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-brand-700" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-brand-900 text-lg mb-2">
                    {avenue.label}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {avenue.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="form" className="scroll-mt-24 py-16 md:py-24 bg-brand-50" aria-labelledby="form-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2
              id="form-heading"
              className="text-brand-900 font-heading font-black text-3xl md:text-4xl text-balance"
            >
              فرم درخواست همکاری
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              درخواست شما مستقیماً به واحد مربوط ارسال می‌شود و همکاران ما با شما تماس می‌گیرند.
            </p>
          </div>
          <PartnershipForm />
        </div>
      </section>
    </>
  );
}
