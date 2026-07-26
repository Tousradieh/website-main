import Link from 'next/link';
import { teamHasImage, teamMembers } from '@/lib/data';
import { ArrowLeft } from 'lucide-react';
import TeamMemberCard from '@/components/TeamMemberCard';

interface TeamPreviewProps {
  hasImage?: boolean;
}

export default function TeamPreview({ hasImage = teamHasImage }: TeamPreviewProps) {
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
            <TeamMemberCard
              key={member.id}
              member={member}
              hasImage={hasImage}
              variant="preview"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
