import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TeamMemberCard from '@/components/TeamMemberCard';
import { teamHasImage, teamMembers } from '@/lib/data';

export default function TeamPage() {
  const leadership = teamMembers.filter((m) => m.department === 'leadership');
  const engineers = teamMembers.filter((m) => m.department === 'engineers');
  const hasImage = teamHasImage;

  return (
    <main>
      <Navbar />

      {/* Page Header */}
      <section className="pt-32 pb-16 bg-brand-900" aria-label="سربرگ صفحه تیم ما">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-4">
            انسان‌هایی پشت پروژه‌ها
          </span>
          <h1 className="text-white font-heading font-black text-4xl md:text-5xl text-balance mb-4">
            تیم ما
          </h1>
          <p className="text-brand-100/70 text-lg max-w-2xl mx-auto leading-relaxed">
            موفقیت توس‌رادیه مرهون تلاش تیمی از متخصصان و مهندسان مجرب است که هر روز
            در میدان کار حضور دارند.
          </p>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 md:py-24 bg-background" aria-labelledby="leadership-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
              رهبری
            </span>
            <h2
              id="leadership-heading"
              className="font-heading font-black text-brand-900 text-3xl md:text-4xl text-balance"
            >
              مدیران ارشد
            </h2>
          </div>

          <div
            className={
              hasImage
                ? 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto'
                : 'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto'
            }
          >
            {leadership.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                hasImage={hasImage}
                variant="leadership"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Team */}
      {engineers.length > 0 && (
        <section className="py-20 md:py-24 bg-brand-50" aria-labelledby="engineers-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
                اجرا و فنی
              </span>
              <h2
                id="engineers-heading"
                className="font-heading font-black text-brand-900 text-3xl md:text-4xl text-balance"
              >
                تیم مهندسی
              </h2>
            </div>

            <div
              className={
                hasImage
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto md:max-w-none md:grid-cols-4'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              }
            >
              {engineers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  hasImage={hasImage}
                  variant="engineer"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Company Values */}
      <section className="py-20 md:py-24 bg-brand-900" aria-labelledby="values-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-3">
              اصول ما
            </span>
            <h2
              id="values-heading"
              className="text-white font-heading font-black text-3xl md:text-4xl text-balance"
            >
              ارزش‌های بنیادین
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'صداقت',
                desc: 'شفافیت در ارتباط با کارفرمایان و همکاران در تمامی مراحل پروژه.',
              },
              {
                title: 'کیفیت',
                desc: 'تعهد به بالاترین استانداردهای فنی و نظارت مستمر بر اجرا.',
              },
              {
                title: 'ایمنی',
                desc: 'اولویت اول ما سلامت نیروی انسانی در همه سایت‌های اجرایی است.',
              },
              {
                title: 'نوآوری',
                desc: 'استفاده از روش‌های نوین ساخت و تجهیزات پیشرفته برای بهره‌وری بیشتر.',
              },
            ].map((val) => (
              <div
                key={val.title}
                className="bg-brand-800/50 rounded-xl p-7 border border-white/10 hover:bg-brand-800 transition-colors duration-200"
              >
                <h3 className="text-white font-heading font-bold text-xl mb-3">{val.title}</h3>
                <p className="text-brand-100/70 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
