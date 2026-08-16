import { clients } from '@/lib/data';

export default function ClientsStrip() {
  return (
    <section className="py-14 md:py-16 bg-card border-y border-border" aria-labelledby="clients-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
            کارفرمایان
          </span>
          <h2
            id="clients-heading"
            className="text-brand-900 font-heading font-black text-2xl md:text-3xl text-balance"
          >
            اعتماد سازمان‌های ملی و شهری
          </h2>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clients.map((client) => (
            <li
              key={client.id}
              className="flex items-center justify-center rounded-xl border border-border bg-background px-4 py-6 text-center"
            >
              <span className="font-heading font-bold text-brand-800 text-sm leading-relaxed">
                {client.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
