import Image from 'next/image';
import Link from 'next/link';
import { teamMembers } from '@/lib/data';
import { ArrowLeft } from 'lucide-react';

export default function TeamPreview() {
  const preview = teamMembers.slice(0, 3);

  return (
    <section className="py-20 md:py-28 bg-brand-50" aria-labelledby="team-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-3">
              تیم ما
            </span>
            <h2
              id="team-heading"
              className="text-brand-900 font-heading font-black text-3xl md:text-4xl text-balance"
            >
              افراد پشت هر پروژه بزرگ
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl">
              مجموعه‌ای از بهترین مهندسان و متخصصان کشور که با اشتیاق
              زیرساخت‌های فردا را می‌سازند.
            </p>
          </div>
          <Link
            href="/team"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-800 text-white font-medium text-sm hover:bg-brand-700 transition-colors self-start md:self-auto"
          >
            مشاهده کامل تیم
            <ArrowLeft size={16} className="rtl-flip" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {preview.map((member) => (
            <article key={member.id} className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 33vw, 320px"
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-brand-900 text-lg">
                  {member.name}
                </h3>
                <p className="text-accent font-medium text-sm mt-1">{member.role}</p>
                <p className="text-muted-foreground text-sm mt-3 leading-relaxed line-clamp-2">
                  {member.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
