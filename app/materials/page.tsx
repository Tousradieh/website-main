import type { Metadata } from 'next';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  CheckCircle,
  Cog,
  Container,
  Factory,
  FlaskConical,
  HardHat,
  Mountain,
  Ruler,
  Truck,
  Wrench,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import FacilityDirectory from '@/components/facilities/FacilityDirectory';
import { Button } from '@/components/ui/button';
import { facilityCategories, productionSites, supportCapabilities } from '@/lib/data';
import type { FacilityType } from '@/lib/types';

const PAGE_DESCRIPTION =
  'معادن شن و ماسه، مجتمع‌های سنگ‌شکن، کارخانه‌های آسفالت و بچینگ بتن توس‌رادیه در خراسان رضوی و جنوبی؛ تأمین خودی مصالح در شعاع پروژه‌های راه و ریلی.';

export const metadata: Metadata = {
  title: 'تجهیزات و توانمندی‌ها',
  description: PAGE_DESCRIPTION,
};

const CATEGORY_ICONS: Record<FacilityType, LucideIcon> = {
  quarry: Mountain,
  crusher: Cog,
  asphalt: Factory,
  batching: Container,
};

const SUPPORT_ICONS: Record<string, LucideIcon> = {
  fleet: Truck,
  lab: FlaskConical,
  survey: Ruler,
  workshop: Wrench,
};

const KEY_FIGURES = [
  { value: productionSites.length.toLocaleString('fa-IR'), label: 'سایت تولیدی فعال' },
  { value: '۶', label: 'مجتمع آسفالت و سنگ‌شکن' },
  { value: '۲', label: 'سایت بچینگ بتن' },
  { value: '۲', label: 'استان: خراسان رضوی و جنوبی' },
];

const VALUE_CHAIN = [
  { icon: Mountain, title: 'معدن', description: 'برداشت مصالح کوهی و رودخانه‌ای' },
  { icon: Cog, title: 'سنگ‌شکن', description: 'دانه‌بندی مطابق مشخصات فنی' },
  { icon: Factory, title: 'آسفالت و بتن', description: 'تولید در نزدیک‌ترین سایت' },
  { icon: Truck, title: 'حمل کوتاه', description: 'ناوگان ملکی، بدون نوبت' },
  { icon: HardHat, title: 'اجرای پروژه', description: 'راه، آزادراه و ریلی' },
];

export default function FacilitiesPage() {
  return (
    <>
      <PageHeader
        ariaLabel="سربرگ صفحه تجهیزات و توانمندی‌ها"
        eyebrow="تجهیزات و توانمندی‌ها"
        title="از معدن تا کارگاه، در شعاع پروژه"
        description="شبکه معادن، سنگ‌شکن‌ها، کارخانه‌های آسفالت و بچینگ بتن توس‌رادیه، تأمین مصالح پروژه‌ها را از بازار آزاد مستقل می‌کند."
        backgroundImage="/images/material-asphalt.png"
      />

      <section className="bg-background border-b border-border" aria-label="شاخص‌های کلیدی">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {KEY_FIGURES.map((figure) => (
            <div key={figure.label} className="text-center md:text-right">
              <p className="text-brand-900 font-black text-4xl leading-none mb-2">{figure.value}</p>
              <p className="text-muted-foreground text-sm">{figure.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background" aria-labelledby="units-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
              واحدهای تولیدی
            </span>
            <h2
              id="units-heading"
              className="text-brand-900 font-heading font-black text-3xl md:text-4xl text-balance"
            >
              چهار حلقه بالادست زنجیره ارزش
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              مصالح هر پروژه از معدن تا محصول نهایی در کارخانه‌های خود شرکت تولید و کنترل
              می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilityCategories.map((category) => {
              const Icon = CATEGORY_ICONS[category.id];
              return (
                <article
                  key={category.id}
                  className="group relative bg-card rounded-xl p-6 border border-border hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-900/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center mb-5 group-hover:bg-brand-100 transition-colors">
                    <Icon size={24} className="text-brand-700" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-brand-900 text-xl mb-3">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    {category.description}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {category.outputs.map((output) => (
                      <li key={output} className="flex items-start gap-2 text-sm text-brand-800">
                        <CheckCircle size={16} className="text-accent flex-shrink-0 mt-0.5" />
                        {output}
                      </li>
                    ))}
                  </ul>
                  <div className="absolute bottom-0 right-0 h-0.5 w-0 bg-accent rounded-b-xl group-hover:w-full transition-all duration-500" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-brand-900" aria-labelledby="chain-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-3">
              پیمانکار یکپارچه
            </span>
            <h2
              id="chain-heading"
              className="text-white font-heading font-black text-3xl md:text-4xl text-balance"
            >
              یک زنجیره، یک مسئول
            </h2>
            <p className="mt-4 text-brand-100/70 text-lg max-w-2xl mx-auto leading-relaxed">
              یکپارچگی تولید مصالح، ناوگان و اجرا یعنی هزینه تجهیز و حمل کمتر و کارگاهی که
              برای مصالح متوقف نمی‌شود.
            </p>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {VALUE_CHAIN.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-xl border border-white/10 bg-white/5 p-6 text-center"
              >
                <span className="absolute top-3 left-4 text-xs font-bold text-accent">
                  {(index + 1).toLocaleString('fa-IR')}
                </span>
                <step.icon size={28} className="mx-auto text-accent mb-3" aria-hidden="true" />
                <p className="text-white font-heading font-bold text-lg">{step.title}</p>
                <p className="text-brand-100/70 text-sm mt-1">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-brand-50" aria-labelledby="sites-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
              شبکه سایت‌ها
            </span>
            <h2
              id="sites-heading"
              className="text-brand-900 font-heading font-black text-3xl md:text-4xl text-balance"
            >
              سایت‌های تولیدی توس‌رادیه
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              پراکندگی سایت‌ها در خراسان رضوی و جنوبی، مصالح را به نزدیک‌ترین نقطه هر پروژه
              می‌رساند.
            </p>
          </div>
          <FacilityDirectory />
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background" aria-labelledby="support-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="support-heading"
            className="text-brand-900 font-heading font-black text-2xl md:text-3xl text-center mb-10 text-balance"
          >
            پشتیبان‌های فنی و ناوگان
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCapabilities.map((capability) => {
              const Icon = SUPPORT_ICONS[capability.id] ?? Wrench;
              return (
                <div key={capability.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon size={22} className="text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-brand-900 mb-1">{capability.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {capability.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-800" aria-label="دعوت به همکاری">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-white font-heading font-black text-2xl md:text-3xl mb-4 text-balance">
            برای پروژه بعدی، با ما همکاری کنید
          </h2>
          <p className="text-brand-100/80 mb-8 leading-relaxed">
            مشارکت در پروژه، همکاری اجرایی، تأمین مصالح یا اجاره ماشین‌آلات؛ درخواست خود را
            ثبت کنید.
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/cooperation" />}
            variant="accent"
            className="h-auto gap-2 px-8 py-3.5 rounded-md"
          >
            همکاری با ما
            <ArrowLeft size={18} className="rtl-flip" />
          </Button>
        </div>
      </section>
    </>
  );
}
