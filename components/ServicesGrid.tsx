import { services } from '@/lib/data';

export default function ServicesGrid() {
  return (
    <section className="py-20 md:py-28 bg-background" aria-labelledby="services-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
            خدمات ما
          </span>
          <h2
            id="services-heading"
            className="text-brand-900 font-heading font-black text-3xl md:text-4xl lg:text-5xl text-balance"
          >
            راه‌حل‌های جامع ساخت‌وساز
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            از مطالعه و طراحی تا اجرا و نگهداری، توس‌رادیه در تمام مراحل
            پروژه در کنار شماست.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <article
              key={service.id}
              className="group relative bg-card rounded-xl p-6 border border-border hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-900/5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center text-2xl group-hover:bg-brand-100 transition-colors"
                  aria-hidden="true"
                >
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-brand-900 text-lg mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
              {/* Accent line on hover */}
              <div className="absolute bottom-0 right-0 h-0.5 w-0 bg-accent rounded-b-xl group-hover:w-full transition-all duration-500" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
