import type { Metadata } from 'next';
import Image from 'next/image';
import PageHeader from '@/components/PageHeader';
import JobList from '@/components/JobList';

export const metadata: Metadata = {
  title: 'موقعیت‌های شغلی',
  description:
    'توس‌رادیه به دنبال افراد مستعد و متعهد است که در ساختن آینده زیرساخت کشور سهیم باشند.',
};

const cultureItems = [
  {
    title: 'رشد و یادگیری مداوم',
    desc: 'برنامه‌های آموزشی داخلی و حمایت از شرکت در دوره‌های تخصصی داخلی و خارجی.',
  },
  {
    title: 'محیط کار ایمن',
    desc: 'رعایت کامل استانداردهای HSE در تمامی پروژه‌ها و سایت‌های اجرایی.',
  },
  {
    title: 'حقوق و مزایای رقابتی',
    desc: 'پرداخت به‌موقع، بیمه تکمیلی، مزایای سفر و پاداش عملکرد.',
  },
  {
    title: 'پروژه‌های ملی و ماندگار',
    desc: 'فرصت مشارکت در پروژه‌های راه‌سازی در مقیاس ملی و تاثیرگذار.',
  },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        ariaLabel="سربرگ صفحه موقعیت‌های شغلی"
        eyebrow="به خانواده ما بپیوندید"
        title="موقعیت‌های شغلی"
        description="توس‌رادیه به دنبال افراد مستعد و متعهد است که در ساختن آینده زیرساخت کشور سهیم باشند."
      />

      <section className="py-20 md:py-24 bg-background" aria-labelledby="culture-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
                فرهنگ سازمانی
              </span>
              <h2
                id="culture-heading"
                className="font-heading font-black text-brand-900 text-3xl md:text-4xl mb-6 text-balance"
              >
                چرا توس‌رادیه؟
              </h2>

              <div className="flex flex-col gap-6">
                {cultureItems.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-1 h-full min-h-5 rounded-full bg-accent mt-1.5" />
                    <div>
                      <h3 className="font-semibold text-brand-900 text-sm mb-1">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-80 lg:h-[30rem] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/work-culture.png"
                alt="فرهنگ کاری در توس‌رادیه"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <JobList />
    </>
  );
}
