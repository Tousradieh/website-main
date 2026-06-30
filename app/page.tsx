import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ServicesGrid from '@/components/ServicesGrid';
import TeamPreview from '@/components/TeamPreview';
import Link from 'next/link';
import Image from 'next/image';
import { projects } from '@/lib/data';
import { ArrowLeft } from 'lucide-react';

export default function HomePage() {
  const featured = projects.slice(0, 2);

  return (
    <main>
      <Navbar />
      <HeroSection />

      <ServicesGrid />

      {/* Featured Projects */}
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
                href="/projects"
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
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
                      project.status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-accent/20 text-accent'
                    }`}
                  >
                    {project.status === 'active' ? 'در حال اجرا' : 'تکمیل‌شده'}
                  </span>
                  <h3 className="text-white font-heading font-bold text-xl text-balance">
                    {project.title}
                  </h3>
                  <p className="text-brand-100/70 text-sm mt-1">{project.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
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
              تعهد به کیفیت، نه فقط سرعت
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'استانداردهای بین‌المللی',
                desc: 'تمامی پروژه‌های ما مطابق با استانداردهای AASHTO، ASTM و آیین‌نامه‌های راه ایران اجرا می‌شوند.',
                num: '۰۱',
              },
              {
                title: 'تجهیزات پیشرفته',
                desc: 'ناوگان ماشین‌آلات مدرن و به‌روز برای اجرای سریع‌تر و دقیق‌تر پروژه‌ها.',
                num: '۰۲',
              },
              {
                title: 'نگهداری پس از تحویل',
                desc: 'ارائه ضمانت‌نامه فنی و خدمات نگهداری دوره‌ای پس از تحویل پروژه.',
                num: '۰۳',
              },
            ].map((item) => (
              <div key={item.num} className="relative bg-card rounded-xl p-8 border border-border">
                <span className="absolute top-6 left-6 text-5xl font-black text-brand-100 select-none">
                  {item.num}
                </span>
                <h3 className="font-heading font-bold text-brand-900 text-xl mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TeamPreview />

      {/* CTA Banner */}
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
            پروژه بزرگ بعدی شما را ما می‌سازیم
          </h2>
          <p className="text-brand-100/80 text-lg mb-8 leading-relaxed">
            با کارشناسان فروش توس‌رادیه تماس بگیرید و مشاوره رایگان دریافت کنید.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/materials"
              className="px-8 py-3.5 rounded-md bg-accent text-accent-foreground font-bold hover:bg-accent/90 transition-colors"
            >
              درخواست مصالح
            </Link>
            <a
              href="tel:051-36082788"
              className="px-8 py-3.5 rounded-md border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
            >
              تماس با ما
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
