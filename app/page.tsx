import HeroSection from '@/components/HeroSection';
import ServicesGrid from '@/components/ServicesGrid';
import TeamPreview from '@/components/TeamPreview';
import CertificatesPreview from '@/components/CertificatesPreview';
import ClientsStrip from '@/components/ClientsStrip';
import ProjectStatusBadge from '@/components/ProjectStatusBadge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { projects } from '@/lib/data';
import { ArrowLeft } from 'lucide-react';

export default function HomePage() {
  const featured = projects.slice(0, 2);

  return (
    <>
      <HeroSection />

      <ServicesGrid />

      <section className="py-20 md:py-28 bg-brand-900" aria-labelledby="projects-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-3">
                پروژه‌های ما
              </span>
              <h2
                id="projects-heading"
                className="text-white font-heading font-black text-3xl md:text-4xl text-balance"
              >
                آخرین پروژه‌های ما
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-accent font-medium text-sm hover:text-accent/80 transition-colors self-start"
            >
              مشاهده همه پروژه‌ها
              <ArrowLeft size={16} className="rtl-flip" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featured.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group relative rounded-xl overflow-hidden h-72 md:h-80 block"
              >
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width:768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-brand-900/50 group-hover:bg-brand-900/40 transition-colors" />
                <div className="absolute bottom-0 right-0 left-0 p-6">
                  <ProjectStatusBadge status={project.status} tone="onDark" />
                  <h3 className="text-white font-heading font-bold text-xl text-balance mt-2">
                    {project.title}
                  </h3>
                  <p className="text-brand-100/70 text-sm mt-1">{project.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CertificatesPreview />

      <ClientsStrip />

      <section className="py-20 md:py-28 bg-background" aria-labelledby="why-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
              چرا توس‌رادیه؟
            </span>
            <h2
              id="why-heading"
              className="text-brand-900 font-heading font-black text-3xl md:text-4xl text-balance"
            >
              کمترین هزینه کل برای کارفرما
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'زنجیره یکپارچه تولید، ناوگان و اجرا',
                desc: 'مصالح از معادن، سنگ‌شکن‌ها و کارخانه‌های خودی و ماشین‌آلات از ناوگان ملکی؛ هزینه تجهیز و تأمین کمتر و کار بدون توقف برای مصالح.',
                num: '۰۱',
              },
              {
                title: 'حضور بومی در سه استان خراسان',
                desc: 'هفت سایت تولیدی در شعاع پروژه‌ها و بیش از سه دهه شناخت محورها، کارفرمایان و شرایط اجرایی منطقه.',
                num: '۰۲',
              },
              {
                title: 'شریک قابل اتکا در پروژه‌های کلان',
                desc: 'تمرکز بر پروژه‌های بزرگ راه، آزادراه و ریلی با کارفرمایان ملی و استانی، از جمله آزادراه مشهد–چناران.',
                num: '۰۳',
              },
            ].map((item) => (
              <div key={item.num} className="bg-card rounded-xl p-6 sm:p-8 border border-border">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-heading font-bold text-brand-900 text-xl text-balance">
                    {item.title}
                  </h3>
                  <span
                    className="flex-shrink-0 text-4xl sm:text-5xl leading-none font-black text-brand-100 select-none"
                    aria-hidden="true"
                  >
                    {item.num}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TeamPreview />

      <section className="relative py-20 bg-brand-800 overflow-hidden" aria-label="فراخوان عمل">
        <div className="absolute inset-0 opacity-5">
          <Image
            src="/images/hero-road.png"
            alt=""
            fill
            className="object-cover"
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-white font-heading font-black text-3xl md:text-4xl mb-4 text-balance">
            پروژه بزرگ بعدی خراسان را با هم بسازیم
          </h2>
          <p className="text-brand-100/80 text-lg mb-8 leading-relaxed">
            برای مشارکت در پروژه، همکاری اجرایی، تأمین مصالح یا اجاره ماشین‌آلات با ما در ارتباط باشید.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              nativeButton={false}
              render={<Link href="/cooperation" />}
              variant="accent"
              className="h-auto px-8 py-3.5 rounded-md"
            >
              همکاری با ما
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/contact" />}
              variant="outline-inverse"
              className="h-auto px-8 py-3.5 rounded-md"
            >
              تماس با ما
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
