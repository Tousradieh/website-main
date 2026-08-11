import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrgChart from '@/components/OrgChart';
import { organizationInfo, csrInitiatives } from '@/lib/data';
import type { CsrInitiative } from '@/lib/types';
import {
  Hospital,
  Landmark,
  School,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';

const csrIcons: Record<CsrInitiative['icon'], LucideIcon> = {
  hospital: Hospital,
  mosque: Landmark,
  school: School,
  education: GraduationCap,
};

export default function AboutPage() {
  const { history, mission, missionPillars, vision, visionPillars } = organizationInfo;

  return (
    <main>
      <Navbar />

      <section className="pt-32 pb-16 bg-brand-900" aria-label="سربرگ صفحه درباره ما">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-4">
            اطلاعات سازمان
          </span>
          <h1 className="text-white font-heading font-black text-4xl md:text-5xl text-balance mb-4">
            درباره ما
          </h1>
          <p className="text-brand-100/70 text-lg max-w-2xl mx-auto leading-relaxed">
            تاریخچه، مأموریت، چشم‌انداز، ساختار سازمانی و مسئولیت اجتماعی توس‌رادیه.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-background" aria-labelledby="history-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
                از ۱۳۷۴ تا امروز
              </span>
              <h2
                id="history-heading"
                className="font-heading font-black text-brand-900 text-3xl md:text-4xl text-balance"
              >
                تاریخچه سازمان
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {history.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="text-muted-foreground leading-relaxed text-base md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-brand-50" aria-labelledby="mission-vision-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
              جهت‌گیری راهبردی
            </span>
            <h2
              id="mission-vision-heading"
              className="font-heading font-black text-brand-900 text-3xl md:text-4xl text-balance"
            >
              مأموریت و چشم‌انداز
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
              <h3 className="font-heading font-bold text-brand-900 text-2xl mb-4">مأموریت</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">{mission}</p>
              <ul className="flex flex-col gap-5">
                {missionPillars.map((pillar) => (
                  <li key={pillar.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-1 min-h-5 rounded-full bg-accent mt-1.5" />
                    <div>
                      <h4 className="font-semibold text-brand-900 text-sm mb-1">{pillar.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
              <h3 className="font-heading font-bold text-brand-900 text-2xl mb-4">چشم‌انداز</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">{vision}</p>
              <ul className="flex flex-col gap-5">
                {visionPillars.map((pillar) => (
                  <li key={pillar.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-1 min-h-5 rounded-full bg-accent mt-1.5" />
                    <div>
                      <h4 className="font-semibold text-brand-900 text-sm mb-1">{pillar.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="team"
        className="scroll-mt-24 py-20 md:py-28 bg-background"
        aria-labelledby="team-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
              ساختار سازمانی
            </span>
            <h2
              id="team-heading"
              className="font-heading font-black text-brand-900 text-3xl md:text-4xl text-balance mb-4"
            >
              تیم ما
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              چارت سازمانی توس‌رادیه از هیئت‌مدیره تا واحدهای اجرایی.
            </p>
          </div>

          <OrgChart />
        </div>
      </section>

      <section className="py-20 md:py-28 bg-brand-50" aria-labelledby="csr-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
              فراتر از سود
            </span>
            <h2
              id="csr-heading"
              className="font-heading font-black text-brand-900 text-3xl md:text-4xl text-balance mb-4"
            >
              مسئولیت اجتماعی
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              بخشی از توان اجرایی و تولیدی توس‌رادیه صرف پروژه‌ها و خدماتی می‌شود که بدون سود و در خدمت جامعه محلی انجام شده‌اند.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {csrInitiatives.map((item) => {
              const Icon = csrIcons[item.icon];
              return (
                <article
                  key={item.id}
                  className="bg-card rounded-xl border border-border p-6 sm:p-8 hover:border-brand-500/40 transition-colors"
                >
                  <div className="w-11 h-11 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center mb-5">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-brand-900 text-xl mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
